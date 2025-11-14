// routes/files.js
const express = require("express");
const multer = require("multer");
const crypto = require("crypto");
const fs = require("fs");
const path = require("path");
const mongoose = require("mongoose");

const router = express.Router();

const File = require("../models/File");
const User = require("../models/User");
const AuditLog = require("../models/AuditLog");
const Organization = require("../models/Organization");
const { authMiddleware } = require("../middleware/authMiddleware");

/* ============================================================
   🔹 Multer Setup
   (unchanged from your original)
============================================================ */
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const dir = "uploads/";
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    cb(null, dir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  },
});
const upload = multer({ storage });

/* ============================================================
   🔹 Encryption Helpers (unchanged)
============================================================ */
const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY
  ? Buffer.from(process.env.ENCRYPTION_KEY, "hex")
  : crypto.randomBytes(32);
const IV_LENGTH = 16;

function encryptFile(inputPath, outputPath) {
  const iv = crypto.randomBytes(IV_LENGTH);
  const cipher = crypto.createCipheriv("aes-256-cbc", ENCRYPTION_KEY, iv);
  const input = fs.createReadStream(inputPath);
  const output = fs.createWriteStream(outputPath);
  input.pipe(cipher).pipe(output);

  return new Promise((resolve, reject) => {
    output.on("finish", () => resolve(iv.toString("hex")));
    output.on("error", reject);
  });
}

function decryptFile(inputPath, outputPath, ivHex) {
  return new Promise((resolve, reject) => {
    const iv = Buffer.from(ivHex, "hex");
    const decipher = crypto.createDecipheriv("aes-256-cbc", ENCRYPTION_KEY, iv);
    const input = fs.createReadStream(inputPath);
    const output = fs.createWriteStream(outputPath);

    input.pipe(decipher).pipe(output);

    output.on("finish", () => resolve(true));
    output.on("error", reject);
  });
}

/* ============================================================
   🔹 Helper: Get All Org IDs (Recursive) (unchanged)
============================================================ */
async function getAllOrgIds(orgId) {
  const ids = [orgId];
  const children = await Organization.find({ parentId: orgId });
  for (const child of children) {
    ids.push(...(await getAllOrgIds(child._id)));
  }
  return ids;
}

/* ============================================================
   🔹 Centralized Audit Helper
   Use createAudit(req, userId, fileId, action, details)
   so you don't have to repeat AuditLog.create(...) everywhere.
============================================================ */
async function createAudit(req, userId, fileId, action, details) {
  try {
    await AuditLog.create({
      user: userId,
      file: fileId,
      action,
      details,
      ipAddress: req.ip,
      userAgent: req.headers["user-agent"],
    });
  } catch (err) {
    // Do NOT block main flow if audit logging fails; just log server-side.
    console.error("Audit creation failed:", err);
  }
}

/* ============================================================
   🔹 ROUTE 1: Get Visibility Targets
============================================================ */
router.get("/visibility-targets", authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.user.userId).populate("orgId");
    if (!user) return res.status(404).json({ message: "User not found" });

    let organizations = [];
    let users = [];

    if (user.role === "superAdmin") {
      organizations = await Organization.find();
      users = await User.find();
    } else if (user.role === "orgAdmin") {
      const orgIds = await getAllOrgIds(user.orgId);
      organizations = await Organization.find({ _id: { $in: orgIds } });
      users = await User.find({ orgId: { $in: orgIds } });
    } else if (user.role === "deptAdmin") {
      organizations = [user.orgId];
      users = await User.find({ orgId: user.orgId });
    } else {
      users = [user];
    }

    res.json({ organizations, users });
  } catch (error) {
    console.error("Visibility targets error:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

/* ============================================================
   🔹 ROUTE 2: Upload File
   - encrypt locally -> upload encrypted to Backblaze via s3Client
   - store file doc in DB and add audit via createAudit
============================================================ */
router.post("/upload", authMiddleware, upload.single("file"), async (req, res) => {
  try {
    const { description, expiryDate, visibleTo, visibleToType } = req.body;
    const file = req.file;
    if (!file) return res.status(400).json({ message: "No file uploaded" });

    const user = await User.findById(req.user.userId).populate("orgId");
    if (!user) return res.status(404).json({ message: "User not found" });

    // ⭐ ADDED — Check storage limit before upload
    if (user.orgId) {
      const fileSize = file.size; // in bytes
      const used = user.orgId.usedStorage || 0;
      const limit = user.orgId.storageLimit || 0;

      if (used + fileSize > limit) {
        return res.status(400).json({
          message: "Storage limit exceeded",
          usedStorage: used,
          storageLimit: limit,
          required: fileSize
        });
      }
    }
    // ⭐ END

    let visibilityTargets = [];
    if (visibleTo) {
      const idsArray = Array.isArray(visibleTo) ? visibleTo : visibleTo.split(",");
      visibilityTargets = idsArray.map(id => new mongoose.Types.ObjectId(id));
    } else {
      visibilityTargets = [new mongoose.Types.ObjectId(user._id)];
    }

    // Encrypt, upload, remove local etc...
    const encryptedPath = `uploads/encrypted-${file.filename}`;
    const iv = await encryptFile(file.path, encryptedPath);
    try { fs.unlinkSync(file.path); } catch (e) {}

    const s3 = require("../utils/s3Client");
    const fileBuffer = fs.readFileSync(encryptedPath);

    await s3.upload({
      Bucket: process.env.B2_BUCKET_NAME,
      Key: `encrypted/${file.filename}`,
      Body: fileBuffer,
    }).promise();

    try { fs.unlinkSync(encryptedPath); } catch (e) {}

    const newFile = new File({
      filename: file.filename,
      originalName: file.originalname,
      description: description || "",
      orgId: user.orgId ? new mongoose.Types.ObjectId(user.orgId._id) : null,
      uploadedBy: new mongoose.Types.ObjectId(user._id),
      encrypted: true,
      iv,
      expiryDate: expiryDate ? new Date(expiryDate) : null,
      visibleTo: visibilityTargets,
      visibleToType: visibleToType || "User",
      audit: [
        {
          action: "upload",
          user: new mongoose.Types.ObjectId(user._id),
          timestamp: new Date(),
          details: `${user.name} uploaded a file`,
        },
      ],
    });

    await newFile.save();

    // ⭐ ADDED — Increase used storage
    if (user.orgId) {
      await Organization.findByIdAndUpdate(
        user.orgId._id,
        { $inc: { usedStorage: file.size } }
      );
    }
    // ⭐ END

    // Central audit
    await createAudit(req, user._id, newFile._id, "upload",
      `${user.name} uploaded the file "${file.originalname}"`);

    res.status(201).json({ message: "File uploaded successfully", file: newFile });

  } catch (err) {
    console.error("Upload Error:", err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
});


/* ============================================================
   🔹 ROUTE 3: Visible Files for User
   - includes files visible to user and files visible to their org
   - handles superAdmin / orgAdmin / deptAdmin correctly
============================================================ */
router.get("/visible-files", authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.user.userId).populate("orgId");
    if (!user) return res.status(404).json({ message: "User not found" });

    // Get organization hierarchy (for orgAdmin/deptAdmin)
    let orgIds = [];
    if (user.orgId) orgIds = await getAllOrgIds(user.orgId);
    orgIds = orgIds.map(id => new mongoose.Types.ObjectId(id));

    // Also include the user’s own org for normal users (so they see org-shared files)
    if (user.role !== "superAdmin" && user.orgId) {
      // ensure user's org is included (avoid duplicates)
      const ownOrgId = new mongoose.Types.ObjectId(user.orgId._id);
      if (!orgIds.find(x => String(x) === String(ownOrgId))) orgIds.push(ownOrgId);
    }

    // Build query dynamically based on role
    let query = {};
    if (user.role === "superAdmin") {
      query = {}; // all files
    } else {
      // For orgAdmin/deptAdmin and normal users, the same OR conditions apply:
      query = {
        $or: [
          { visibleToType: "User", visibleTo: user._id },
          { visibleToType: "Organization", visibleTo: { $in: orgIds } },
        ],
      };
    }

    const files = await File.find(query)
      .select("originalName description orgId uploadedBy createdAt expiryDate filename")
      .populate("uploadedBy", "name email role")
      .populate("orgId", "name type")
      .sort({ createdAt: -1 });

    res.status(200).json({ count: files.length, files });
  } catch (err) {
    console.error("Visible Files Error:", err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

/* ============================================================
   🔹 ROUTE 4: Download a File (Decryption + Serve)
   - checks hierarchy and visibility
   - downloads encrypted object from Backblaze, decrypts to temp, streams to client
   - creates centralized audit entry for download
============================================================ */
const mime = require("mime-types");

router.get("/download/:id", authMiddleware, async (req, res) => {
  try {
    const file = await File.findById(req.params.id);
    if (!file) return res.status(404).json({ message: "File not found" });

    const user = await User.findById(req.user.userId).populate("orgId");
    if (!user) return res.status(404).json({ message: "User not found" });

    if (file.expiryDate && new Date() > new Date(file.expiryDate)) {
      return res.status(403).json({ message: "File has expired." });
    }

    let orgIds = user.orgId ? (await getAllOrgIds(user.orgId)).map(String) : [];
    if (user.orgId && !orgIds.includes(String(user.orgId._id))) orgIds.push(String(user.orgId._id));

    const canView =
      user.role === "superAdmin" ||
      (file.visibleToType === "User" && file.visibleTo.map(String).includes(String(user._id))) ||
      (file.visibleToType === "Organization" && file.visibleTo.map(String).some(id => orgIds.includes(String(id))));

    if (!canView) {
      console.warn(`Unauthorized download attempt by user ${user._id} for file ${file._id}`);
      return res.status(403).json({ message: "Not authorized to download this file" });
    }

    const s3 = require("../utils/s3Client");
    const tempEncryptedPath = path.join("uploads", `temp-${file.filename}`);

    const fileData = await s3
      .getObject({
        Bucket: process.env.B2_BUCKET_NAME,
        Key: `encrypted/${file.filename}`,
      })
      .promise();

    fs.writeFileSync(tempEncryptedPath, fileData.Body);

    const tempPath = path.join("uploads", `temp-${Date.now()}-${file.originalName}`);
    await decryptFile(tempEncryptedPath, tempPath, file.iv);

    // Cleanup encrypted temp
    try { fs.unlinkSync(tempEncryptedPath); } catch (e) {}

    // ✅ Detect correct MIME type from file name
    const mimeType = mime.lookup(file.originalName) || "application/octet-stream";
    res.setHeader("Content-Type", mimeType);
    res.setHeader("Content-Disposition", `attachment; filename="${file.originalName}"`);

    // ✅ Stream decrypted file manually for full control
    const readStream = fs.createReadStream(tempPath);
    readStream.pipe(res);

    readStream.on("close", () => {
      try { fs.unlinkSync(tempPath); } catch (e) {}
    });

    // 🧾 Log audit in background
    createAudit(req, user._id, file._id, "download", `${user.name} downloaded "${file.originalName}"`);

  } catch (err) {
    console.error("Download Error:", err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
});


/* ============================================================
   🔹 ROUTE 5: My Uploaded Files (unchanged)
============================================================ */
router.get("/my-files", authMiddleware, async (req, res) => {
  try {
    const files = await File.find({ uploadedBy: req.user.userId })
      .populate("uploadedBy", "name email role")
      .populate("orgId", "name type");

    res.json({ count: files.length, files });
  } catch (err) {
    console.error("Fetch my files error:", err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

/* ============================================================
   🔹 ROUTE: Delete a File
   - deletes DB doc, cloud object should be removed (if required)
   - creates audit entry via createAudit
============================================================ */
router.delete("/delete/:id", authMiddleware, async (req, res) => {
  try {
    const { id } = req.params;

    // Validate ObjectId
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid file ID." });
    }

    // Find the file
    const file = await File.findById(id);
    if (!file) return res.status(404).json({ message: "File not found." });

    // Find the user
    const user = await User.findById(req.user.userId).populate("orgId");
    if (!user) return res.status(404).json({ message: "User not found" });

    // Authorization: uploader or superAdmin can delete
    const canDelete = user.role === "superAdmin" || String(file.uploadedBy) === String(user._id);
    if (!canDelete) return res.status(403).json({ message: "Not authorized to delete this file." });

    // Delete encrypted object from Backblaze (S3)
    try {
      const s3 = require("../utils/s3Client");
      await s3
        .deleteObject({
          Bucket: process.env.B2_BUCKET_NAME,
          Key: `encrypted/${file.filename}`,
        })
        .promise();
    } catch (err) {
      // Log but continue - you may prefer to treat this as fatal in production
      console.warn("Warning: failed to delete remote object:", err.message);
    }

    // Remove DB document
    await File.findByIdAndDelete(id);

    // Centralized audit creation
    await createAudit(req, user._id, file._id, "delete", `${user.name} deleted the file "${file.originalName}"`);

    res.json({ message: "File deleted successfully." });
  } catch (err) {
    console.error("Delete Error:", err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

/* ============================================================
   🔹 Audit Logs Route (unchanged logic except centralized createAudit)
============================================================ */
router.get("/audit-logs", authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.user.userId).populate("orgId");
    if (!user) return res.status(404).json({ message: "User not found" });

    let logs;

    if (user.role === "superAdmin") {
      // SuperAdmin sees all logs
      logs = await AuditLog.find()
        .populate("user", "name email role")
        .populate("file", "originalName")
        .sort({ timestamp: -1 });

    } else if (user.role === "orgAdmin" || user.role === "deptAdmin") {
      // OrgAdmin / DeptAdmin see logs of users in their org (including child orgs)
      const orgIds = user.orgId ? await getAllOrgIds(user.orgId) : [];
      const orgUsers = await User.find({ orgId: { $in: orgIds } }).select("_id");

      logs = await AuditLog.find({ user: { $in: orgUsers } })
        .populate("user", "name email role")
        .populate("file", "originalName")
        .sort({ timestamp: -1 });

    } else {
      // Normal users — see logs of all actions on files they uploaded
      const myFiles = await File.find({ uploadedBy: user._id }).select("_id");
      const fileIds = myFiles.map(f => f._id);

      logs = await AuditLog.find({ file: { $in: fileIds } })
        .populate("user", "name email role")
        .populate("file", "originalName")
        .sort({ timestamp: -1 });
    }

    res.json({ count: logs.length, logs });
  } catch (err) {
    console.error("Audit Logs Error:", err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

module.exports = router;
