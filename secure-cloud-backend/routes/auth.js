const express = require("express");
const router = express.Router();
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/User");
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const Organization = require("../models/Organization");
const { authMiddleware } = require("../middleware/authMiddleware");
const upload = require("../middleware/multer"); // ✅ your multer setup
const s3=require("../utils/s3Client");
// ===================== SIGNUP =====================
router.post("/signup", async (req, res) => {
  try {
    const { name, email, password, role } = req.body;

    if (!name || !email || !password || !role)
      return res.status(400).json({ message: "Required fields missing" });

    const existingUser = await User.findOne({ email });
    if (existingUser)
      return res.status(400).json({ message: "User already exists" });

    const orgId = null; // for now
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    const user = new User({ name, email, passwordHash, role, orgId });
    await user.save();

    res.status(201).json({ message: "User created successfully" });
  } catch (error) {
    console.error("Signup error:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

// ===================== LOGIN =====================
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password)
      return res.status(400).json({ message: "Email and password required" });

    const user = await User.findOne({ email });
    if (!user)
      return res.status(400).json({ message: "Invalid credentials" });

    const isMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isMatch)
      return res.status(400).json({ message: "Invalid credentials" });

    const payload = { userId: user._id, role: user.role , orgId: user.orgId};
    const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: "7d" });

    let org = null;
    if (user.orgId) {
      org = await Organization.findById(user.orgId).select("name type");
    }

    res.json({
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        avatar: user.avatar, // ✅ include avatar
        org: org ? { id: org._id, name: org.name, type: org.type } : null,
      },
    });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

// ===================== GET CURRENT USER =====================
router.get("/me", authMiddleware, async (req, res) => {
  try {
    // Find user (excluding password)
    const user = await User.findById(req.user.userId)
      .select("-passwordHash")
      .populate({
        path: "orgId",
        select: "name type parentId",
      });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // ✅ Build org hierarchy (from top-level parent → current org)
    const orgHierarchy = [];
    let currentOrgId = user.orgId ? user.orgId._id : null;

    while (currentOrgId) {
      const org = await Organization.findById(currentOrgId).select("name type parentId");
      if (!org) break;
      orgHierarchy.unshift({
        id: org._id,
        name: org.name,
        type: org.type,
      });
      currentOrgId = org.parentId;
    }

    // ✅ Prepare clean, structured response
    const userData = {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      avatar: user.avatar || null, // Always include avatar field
      org: user.orgId
        ? { id: user.orgId._id, name: user.orgId.name, type: user.orgId.type }
        : null,
      orgHierarchy, // Full chain up to top org
    };

    res.status(200).json({ success: true, user: userData });
  } catch (error) {
    console.error("Error fetching user:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

// ===================== FORGOT PASSWORD =====================
router.post("/forgot-password", async (req, res) => {
  try {
    const { email, newPassword, confirmPassword } = req.body;

    if (!email || !newPassword || !confirmPassword)
      return res.status(400).json({ message: "All fields are required." });

    if (newPassword !== confirmPassword)
      return res.status(400).json({ message: "Passwords do not match." });

    const user = await User.findOne({ email });
    if (!user)
      return res.status(404).json({ message: "User not found." });

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    user.passwordHash = hashedPassword;
    await user.save();

    res.json({ message: "Password updated successfully!" });
  } catch (err) {
    console.error("Forgot Password Error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

// ===================== UPDATE PROFILE DETAILS =====================
router.put("/update-profile", authMiddleware, upload.single("avatar"), async (req, res) => {
  try {
    const { name } = req.body;
    const user = await User.findById(req.user.userId);
    if (!user) return res.status(404).json({ message: "User not found" });

    if (name) user.name = name;

   if (req.file) {
  const ext = path.extname(req.file.originalname);
  const filename = `${user._id}_${Date.now()}${ext}`;
  const key = `profileimage/${filename}`;

  const uploadResult = await s3.upload({
    Bucket: process.env.B2_BUCKET_NAME,
    Key: key,
    Body: req.file.buffer,
    ContentType: req.file.mimetype || "image/jpeg",
  }).promise();

  console.log("Profile image uploaded to B2:", uploadResult.Key);

  const fileUrl = `${process.env.B2_ENDPOINT}/${process.env.B2_BUCKET_NAME}/${key}`;
  user.avatar = fileUrl;
}


    await user.save();

    res.json({
      message: "Profile updated successfully!",
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        avatar: user.avatar,
        role: user.role,
      },
    });
  } catch (error) {
    console.error("Update profile error:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

module.exports = router;
