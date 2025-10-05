const express = require("express");
const multer = require("multer");
const crypto = require("crypto");
const fs = require("fs");
const path = require("path");
const router = express.Router();

const File = require("../models/File");
const { authMiddleware } = require("../middleware/authMiddleware");
const Organization = require("../models/Organization");

// Multer setup for file uploads
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

const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY
  ? Buffer.from(process.env.ENCRYPTION_KEY, "hex")
  : crypto.randomBytes(32); // Use env var in prod safely

const IV_LENGTH = 16;

// Encrypt file function
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

// Upload file route
router.post("/upload", authMiddleware, upload.single("file"), async (req, res) => {
  try {
    const { orgId, expiryDate } = req.body;
    const file = req.file;
    if (!file) return res.status(400).json({ message: "No file uploaded" });

    const org = await Organization.findById(orgId);
    if (!org) return res.status(404).json({ message: "Organization not found" });

    const encryptedPath = `uploads/encrypted-${file.filename}`;
    const iv = await encryptFile(file.path, encryptedPath);

    fs.unlinkSync(file.path); // Remove unencrypted

    const newFile = new File({
      filename: `encrypted-${file.filename}`,
      originalName: file.originalname,
      orgId,
      uploadedBy: req.user.userId,
      encrypted: true,
      iv,
      expiryDate: expiryDate ? new Date(expiryDate) : null,
      uploadDate: new Date(),
      audit: [
        {
          action: "upload",
          user: req.user.userId,
          timestamp: new Date(),
          details: `File uploaded & encrypted`,
        },
      ],
    });

    await newFile.save();

    res.status(201).json({ message: "File uploaded & encrypted", file: newFile });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

// Get all files (admin only)
router.get("/", authMiddleware, async (req, res) => {
  try {
    const files = await File.find()
      .populate("uploadedBy", "name email")
      .populate("orgId", "name type");

    res.json({ count: files.length, files });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

// Delete file (admin or uploader)
router.delete("/:id", authMiddleware, async (req, res) => {
  try {
    const file = await File.findById(req.params.id);
    if (!file) return res.status(404).json({ message: "File not found" });

    if (file.uploadedBy.toString() !== req.user.userId && !["admin", "superAdmin"].includes(req.user.role)) {
      return res.status(403).json({ message: "Not authorized to delete this file" });
    }

    const filePath = path.join("uploads", file.filename);
    if (fs.existsSync(filePath)) fs.unlinkSync(filePath);

    await file.deleteOne();

    res.json({ message: "File deleted successfully" });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

module.exports = router;
