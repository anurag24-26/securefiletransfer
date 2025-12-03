// secure-cloud-backend/routes/verificationRoutes.js
const express = require("express");
const router = express.Router();
const multer = require("multer");
const VerificationRequest = require("../models/VerificationRequest");
const User = require("../models/User");
const { authMiddleware } = require("../middleware/authMiddleware");
const { uploadToS3 } = require("../utils/s3Client");
const {
  verifyPdfWithGeminiDirect,
} = require("../utils/geminiClient");


// Multer: in‑memory buffer
const storage = multer.memoryStorage();
const upload = multer({ storage });

// --------------------------------------------------------
// POST /upload  (unchanged - only uploads to S3)
// --------------------------------------------------------
router.post(
  "/upload",
  authMiddleware,
  upload.single("document"),
  async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ message: "No file uploaded." });
      }

      if (req.file.mimetype !== "application/pdf") {
        return res.status(400).json({ message: "Only PDF files are allowed." });
      }

      const fileKey = `uploads/${Date.now()}-${req.file.originalname}`;
      const s3Url = await uploadToS3(
        req.file.buffer,
        fileKey,
        req.file.mimetype
      );

      console.log("✅ Upload successful:");
      console.log("- S3 URL:", s3Url);
      console.log("- File size:", req.file.size);

      return res.json({
        message: "PDF uploaded successfully.",
        fileUrl: s3Url,
        fileKey: fileKey,
      });
    } catch (err) {
      console.error("❌ Upload error:", err);
      return res.status(500).json({
        message: "Internal server error during upload.",
        error: err.message,
      });
    }
  }
);

// --------------------------------------------------------
// POST /verify-superadmin
// Upload PDF → store in S3 → send PDF to Gemini → auto-approve
// --------------------------------------------------------
// At top of file

// ...

router.post(
  "/verify-superadmin",
  authMiddleware,
  upload.single("document"),
  async (req, res) => {
    try {
      const userId = req.user.userId;

      if (!req.file) {
        return res.status(400).json({ message: "No PDF file uploaded." });
      }

      if (req.file.mimetype !== "application/pdf") {
        return res.status(400).json({ message: "Only PDF files allowed." });
      }

      console.log("🚀 Starting superadmin verification for user:", userId);
      console.log("- File size:", req.file.size, "bytes");

      // 1. Upload PDF to S3
      const fileKey = `verification/${Date.now()}-${req.file.originalname}`;
      const s3Url = await uploadToS3(
        req.file.buffer,
        fileKey,
        req.file.mimetype
      );
      console.log("✅ S3 Upload complete:", s3Url);

      // 2. Send PDF bytes directly to Gemini
      console.log("🧠 Calling Gemini verification model with inline PDF…");
      const geminiResult = await verifyPdfWithGeminiDirect(req.file.buffer);
      const isApproved = !!geminiResult.approved;

      console.log("🔍 Gemini decision:", geminiResult);

      // 3. Save verification request in DB
      const verificationRecord = await VerificationRequest.create({
        userId,
        documentUrl: s3Url,
        extractedText: null, // no local OCR now
        status: isApproved ? "approved" : "rejected",
        reason: geminiResult.reason,
        score: geminiResult.score,
        geminiRaw: geminiResult.raw,
      });

      // 4. Promote user if approved
      if (isApproved) {
        await User.findByIdAndUpdate(userId, {
          role: "superAdmin",
          orgId: null,
        });
        console.log("✅ User promoted to superAdmin:", userId);
      } else {
        console.log("❌ Verification failed for user:", userId);
      }

      // 5. Respond to client
      return res.json({
        success: true,
        message: isApproved
          ? "Document verified by Gemini. You are now a super admin."
          : "Verification failed according to Gemini.",
        geminiResult,
        request: verificationRecord,
        debug: {
          s3Url,
        },
      });
    } catch (err) {
      console.error("❌ Verification error:", err);
      return res.status(500).json({
        success: false,
        message: "Internal server error during verification.",
        error: err.message,
      });
    }
  }
);


module.exports = router;
