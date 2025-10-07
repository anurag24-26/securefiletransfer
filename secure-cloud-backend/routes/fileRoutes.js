const express = require("express");
const multer = require("multer");
const crypto = require("crypto");
const fs = require("fs");
const path = require("path");
const router = express.Router();

const File = require("../models/File");
const User = require("../models/User");
const Organization = require("../models/Organization");
const { authMiddleware } = require("../middleware/authMiddleware");

// Multer setup
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

// Encryption setup
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

// Helper to get all organization hierarchy
async function getAllOrgIds(orgId) {
  const ids = [orgId];
  const children = await Organization.find({ parentId: orgId });
  for (const child of children) {
    ids.push(...(await getAllOrgIds(child._id)));
  }
  return ids;
}

/* ============================================================
   🔹 ROUTE 1: Get visibility targets based on user role
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
   🔹 ROUTE 2: Upload file with visibility control
============================================================ */
router.post("/upload", authMiddleware, upload.single("file"), async (req, res) => {
  try {
    const { description, expiryDate, visibleTo, visibleToType } = req.body;
    const file = req.file;
    if (!file) return res.status(400).json({ message: "No file uploaded" });

    const user = await User.findById(req.user.userId).populate("orgId");
    if (!user) return res.status(404).json({ message: "User not found" });

    // Parse visibility info from frontend
    let visibilityTargets = [];
    if (visibleTo) {
      visibilityTargets = Array.isArray(visibleTo)
        ? visibleTo
        : visibleTo.split(",");
    }

    const encryptedPath = `uploads/encrypted-${file.filename}`;
    const iv = await encryptFile(file.path, encryptedPath);
    fs.unlinkSync(file.path);

    const newFile = new File({
      filename: `encrypted-${file.filename}`,
      originalName: file.originalname,
      description,
      orgId: user.orgId || null,
      uploadedBy: user._id,
      encrypted: true,
      iv,
      expiryDate: expiryDate ? new Date(expiryDate) : null,
      visibleTo: visibilityTargets.length ? visibilityTargets : [user._id],
      visibleToType: visibleToType || "User",
      audit: [
        {
          action: "upload",
          user: user._id,
          timestamp: new Date(),
          details: `${user.name} uploaded file`,
        },
      ],
    });

    await newFile.save();

    res.status(201).json({
      message: "File uploaded & encrypted successfully",
      file: newFile,
    });
  } catch (err) {
    console.error("Upload Error:", err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

/* ============================================================
   🔹 ROUTE 3: Get files visible to the logged-in user
============================================================ */
router.get("/visible-files", authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.user.userId).populate("orgId");
    if (!user) return res.status(404).json({ message: "User not found" });

    let orgIds = [];
    if (user.orgId) orgIds = await getAllOrgIds(user.orgId);

    const conditions = [
      { visibleToType: "User", visibleTo: user._id },
      { visibleToType: "Organization", visibleTo: { $in: orgIds } },
    ];

    if (user.role === "superAdmin") {
      const files = await File.find()
        .populate("uploadedBy", "name email role")
        .populate("orgId", "name type");
      return res.json({ count: files.length, files });
    }

    const files = await File.find({ $or: conditions })
      .populate("uploadedBy", "name email role")
      .populate("orgId", "name type");

    res.json({ count: files.length, files });
  } catch (err) {
    console.error("Fetch files error:", err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

/* ============================================================
//    🔹 ROUTE 4: Delete file (only uploader or super/org admin)
// ============================================================ */
// router.delete("/:id", authMiddleware, async (req, res) => {
//   try {
//     const file = await File.findById(req.params.id);
//     if (!file) return res.status(404).json({ message: "File not found" });

//     const user = await User.findById(req.user.userId);

//     if (
//       file.uploadedBy.toString() !== req.user.userId &&
//       !["superAdmin", "orgAdmin"].includes(user.role)
//     ) {
//       return res.status(403).json({ message: "Not authorized to delete this file" });
//     }

//     const filePath = path.join("uploads", file.filename);
//     if (fs.existsSync(filePath)) fs.unlinkSync(filePath);

//     await file.deleteOne();

//     res.json({ message: "File deleted successfully" });
//   } catch (err) {
//     console.error("Delete Error:", err);
//     res.status(500).json({ message: "Server error", error: err.message });
//   }
// });



/* ============================================================
   🔹 ROUTE: Get all files uploaded by the logged-in user
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
   🔹 ROUTE: Get single file info (for download or details)
============================================================ */
router.get("/:id", authMiddleware, async (req, res) => {
  try {
    const file = await File.findById(req.params.id)
      .populate("uploadedBy", "name email role")
      .populate("orgId", "name type");

    if (!file) return res.status(404).json({ message: "File not found" });

    // Check visibility
    const user = await User.findById(req.user.userId).populate("orgId");
    const orgIds = user.orgId ? await getAllOrgIds(user.orgId) : [];
    const canView =
      file.visibleToType === "User" && file.visibleTo.includes(user._id.toString()) ||
      file.visibleToType === "Organization" && file.visibleTo.some((id) => orgIds.includes(id.toString())) ||
      file.visibleToType === "Department" && file.visibleTo.includes(user._id.toString()) || // adjust if needed
      ["superAdmin"].includes(user.role);

    if (!canView)
      return res.status(403).json({ message: "Not authorized to view this file" });

    res.json({ file });
  } catch (err) {
    console.error("Fetch file error:", err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
});


module.exports = router;
