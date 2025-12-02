const express = require("express");
const router = express.Router();
const multer = require("multer");
const extractPdf = require("../utils/extractPdf");
const verifyEngine = require("../utils/verifyEngine");
const VerificationRequest = require("../models/VerificationRequest");
const User = require("../models/User");
const { authMiddleware } = require("../middleware/authMiddleware");
const { s3, uploadToS3 } = require("../utils/s3Client");

// Multer: store temporarily (we delete after upload)
const storage = multer.memoryStorage();
const upload = multer({ storage });




// --------------------------------------------------------
// POST /upload
// Only upload PDF → verify file type
// --------------------------------------------------------
router.post("/upload", authMiddleware, upload.single("document"), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "No file uploaded." });
    }

    // Check MIME type
    if (req.file.mimetype !== "application/pdf") {
      return res.status(400).json({ message: "Only PDF files are allowed." });
    }

    // Upload to S3 (optional if you want to store it)
    const fileKey = `uploads/${Date.now()}-${req.file.originalname}`;
    const s3Url = await uploadToS3(req.file.buffer, fileKey, req.file.mimetype);

    return res.json({
      message: "PDF uploaded successfully.",
      fileUrl: s3Url,
    });
  } catch (err) {
    console.error("Upload error:", err);
    return res.status(500).json({
      message: "Internal server error during upload.",
      error: err.message,
    });
  }
});


// --------------------------------------------------------
// POST /verify-superadmin
// Upload PDF → Extract → Auto Verify → Approve User
// --------------------------------------------------------


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

      // Restrict to only PDF
      if (req.file.mimetype !== "application/pdf") {
        return res.status(400).json({ message: "Only PDF files allowed." });
      }

      // 1. Upload PDF to S3
      const fileKey = `verification/${Date.now()}-${req.file.originalname}`;
      const s3Url = await uploadToS3(req.file.buffer, fileKey, req.file.mimetype);

      // 2. Extract text from PDF
      const pdfText = await extractPdf(req.file.buffer);

      // 3. Auto verify using keyword engine
      const isApproved = verifyEngine(pdfText);

      // 4. Save verification request record
      const verificationRecord = await VerificationRequest.create({
        userId,
        documentUrl: s3Url,
        extractedText: pdfText,
        status: isApproved ? "approved" : "rejected",
        reason: isApproved
          ? "Auto-approved from detected keywords."
          : "Insufficient authority keywords found.",
      });

      // 5. If approved → set user.role = superAdmin
      if (isApproved) {
        await User.findByIdAndUpdate(userId, {
          role: "superAdmin",
          orgId: null, // Allow them to create new organization
        });
      }

      // Return response
      return res.json({
        message: isApproved
          ? "Document verified successfully. You are now a super admin."
          : "Verification failed. Required authority keywords not detected.",
        request: verificationRecord,
      });
    } catch (err) {
      console.error("Verification error:", err);
      return res.status(500).json({
        message: "Internal server error during verification.",
        error: err.message,
      });
    }
  }
);

module.exports = router;
