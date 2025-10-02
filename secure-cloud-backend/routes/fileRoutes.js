import express from "express";
import multer from "multer";
import crypto from "crypto";
import fs from "fs";
import path from "path";

import File from "../models/File.js";
import { authMiddleware } from "../middleware/authMiddleware.js";

const router = express.Router();

// --- Multer Setup ---
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const dir = "uploads/";
    if (!fs.existsSync(dir)) fs.mkdirSync(dir);
    cb(null, dir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  },
});

const upload = multer({ storage });

// --- Encryption Function ---
const ENCRYPTION_KEY = crypto.randomBytes(32); // in production → store in .env
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

// --- Upload Route ---
router.post("/upload", authMiddleware, upload.single("file"), async (req, res) => {
  try {
    const { orgId, expiryDate } = req.body;
    const file = req.file;

    if (!file) return res.status(400).json({ message: "No file uploaded" });

    // Encrypt file
    const encryptedPath = `uploads/encrypted-${file.filename}`;
    const iv = await encryptFile(file.path, encryptedPath);

    // Remove original unencrypted file
    fs.unlinkSync(file.path);

    // Save metadata in DB
    const newFile = new File({
      filename: `encrypted-${file.filename}`,
      originalName: file.originalname,
      orgId,
      uploadedBy: req.user._id,
      encrypted: true,
      expiryDate: expiryDate ? new Date(expiryDate) : null,
    });

    await newFile.save();

    res.json({
      message: "File uploaded & encrypted successfully",
      file: newFile,
      iv, // NOTE: return iv here for testing, later store securely
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

export default router;
