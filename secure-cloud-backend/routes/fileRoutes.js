const express = require("express");
const multer = require("multer");
const crypto = require("crypto");
const fs = require("fs");
const path = require("path");
const mongoose = require("mongoose");

const router = express.Router();

const File = require("../models/File");
const User = require("../models/User");
const Organization = require("../models/Organization");
const { authMiddleware } = require("../middleware/authMiddleware");

/* ============================================================
   🔹 Multer Setup
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
   🔹 Encryption Helpers
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
   🔹 Helper: Get All Org IDs (Recursive)
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
============================================================ */
router.post("/upload", authMiddleware, upload.single("file"), async (req, res) => {
  try {
    const { description, expiryDate, visibleTo, visibleToType } = req.body;
    const file = req.file;
    if (!file) return res.status(400).json({ message: "No file uploaded" });

    const user = await User.findById(req.user.userId).populate("orgId");
    if (!user) return res.status(404).json({ message: "User not found" });

    // Convert visibleTo to array of ObjectIds
    let visibilityTargets = [];
    if (visibleTo) {
      const idsArray = Array.isArray(visibleTo) ? visibleTo : visibleTo.split(",");
      visibilityTargets = idsArray.map(id => new mongoose.Types.ObjectId(id));
    } else {
      visibilityTargets = [new mongoose.Types.ObjectId(user._id)];
    }

    // Encrypt file
    const encryptedPath = `uploads/encrypted-${file.filename}`;
    const iv = await encryptFile(file.path, encryptedPath);
    fs.unlinkSync(file.path); // remove original unencrypted file

    // Save file document
    const newFile = new File({
      filename: `encrypted-${file.filename}`,
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
    res.status(201).json({ message: "File uploaded successfully", file: newFile });
  } catch (err) {
    console.error("Upload Error:", err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

/* ============================================================
   🔹 ROUTE 3: Visible Files for User
============================================================ */
router.get("/visible-files", authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.user.userId).populate("orgId");
    if (!user) return res.status(404).json({ message: "User not found" });

    let orgIds = [];
    if (user.orgId) orgIds = await getAllOrgIds(user.orgId);

    const conditions = [
      { visibleToType: "User", visibleTo: new mongoose.Types.ObjectId(user._id) },
      {
        visibleToType: "Organization",
        visibleTo: { $in: orgIds.map(id => new mongoose.Types.ObjectId(id)) },
      },
    ];

    let files;
    if (user.role === "superAdmin") {
      files = await File.find()
        .select("originalName description orgId uploadedBy createdAt expiryDate")
        .populate("uploadedBy", "name email role")
        .populate("orgId", "name type");
    } else {
      files = await File.find({ $or: conditions })
        .select("originalName description orgId uploadedBy createdAt expiryDate")
        .populate("uploadedBy", "name email role")
        .populate("orgId", "name type");
    }

    const responseData = files.map(f => ({
      id: f._id,
      filename: f.filename,
      originalName: f.originalName,
      description: f.description || "No description provided",
      organization: f.orgId
        ? { id: f.orgId._id, name: f.orgId.name, type: f.orgId.type }
        : null,
      uploadedBy: f.uploadedBy
        ? { id: f.uploadedBy._id, name: f.uploadedBy.name, role: f.uploadedBy.role }
        : null,
      uploadedAt: f.createdAt,
      expiryDate: f.expiryDate || null,
    }));

    res.json({ count: responseData.length, files: responseData });
  } catch (err) {
    console.error("Fetch files error:", err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

/* ============================================================
   🔹 ROUTE 4: Download a File (Decryption + Serve)
============================================================ */
router.get("/download/:id", authMiddleware, async (req, res) => {
  try {
    const file = await File.findById(req.params.id);
    if (!file) return res.status(404).json({ message: "File not found" });

    const user = await User.findById(req.user.userId).populate("orgId");
    const orgIds = user.orgId ? (await getAllOrgIds(user.orgId)).map(String) : [];

    if (file.expiryDate && new Date() > new Date(file.expiryDate)) {
      return res.status(403).json({ message: "File has expired." });
    }

    const canView =
      user.role === "superAdmin" ||
      (file.visibleToType === "User" &&
        file.visibleTo.map(String).includes(String(user._id))) ||
      (file.visibleToType === "Organization" &&
        file.visibleTo.map(String).some(id => orgIds.includes(String(id))));

    if (!canView) {
      return res.status(403).json({ message: "Not authorized to download this file" });
    }

    const encryptedPath = path.join("uploads", file.filename);
    if (!fs.existsSync(encryptedPath)) {
      return res.status(404).json({ message: "Encrypted file not found" });
    }

    const tempPath = path.join("uploads", `temp-${Date.now()}-${file.originalName}`);
    await decryptFile(encryptedPath, tempPath, file.iv);

    res.download(tempPath, file.originalName, (err) => {
      if (err) console.error("Download error:", err);
      fs.unlink(tempPath, () => {}); // cleanup temp file
    });
  } catch (err) {
    console.error("Download Error:", err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

/* ============================================================
   🔹 ROUTE 5: My Uploaded Files
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
    const canDelete =
      user.role === "superAdmin" || String(file.uploadedBy) === String(user._id);

    if (!canDelete) {
      return res.status(403).json({ message: "Not authorized to delete this file." });
    }

    // Delete file from disk
   const filePath = path.join("uploads", file.originalName);
if (fs.existsSync(filePath)) {
  fs.unlinkSync(filePath);
}


    // Remove from DB
    await File.findByIdAndDelete(id);

    res.json({ message: "File deleted successfully." });
  } catch (err) {
    console.error("Delete Error:", err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
});


module.exports = router;
