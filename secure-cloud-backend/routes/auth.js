const express = require("express");
const router = express.Router();
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const File = require("../models/File");

const User = require("../models/User");
const multer = require("multer");
const Organization = require("../models/Organization");
const { authMiddleware } = require("../middleware/authMiddleware");

const streamifier = require("streamifier");
const cloudinary = require("../config/cloudinary");

// Use multer memory storage
const storage = multer.memoryStorage();
const upload = multer({ storage });
// ===================== SIGNUP =====================
router.post("/signup", async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password)
      return res.status(400).json({ message: "Required fields missing" });

    const existingUser = await User.findOne({ email });
    if (existingUser)
      return res.status(400).json({ message: "User already exists" });

    const orgId = null; // for now
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    const user = new User({ name, email, passwordHash, orgId });
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
    const user = await User.findById(req.user.userId)
      .select("-passwordHash")
      .populate({
        path: "orgId",
        select: "name type parentId",
      });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // User's file stats
    const userFilesStats = await File.aggregate([
      { $match: { uploadedBy: user._id } },
      {
        $group: {
          _id: null,
          totalSize: { $sum: "$size" },
          fileCount: { $sum: 1 },
        },
      },
    ]);
    const userTotalSize = userFilesStats[0]?.totalSize || 0;
    const userFileCount = userFilesStats[0]?.fileCount || 0;

    // Organization stats
    let orgTotalSize = null;
    let orgFileCount = null;
    let orgUserCount = null;
   if (user.orgId) {
  // ✅ 1. Collect all org IDs in hierarchy (current + sub-orgs)
  const orgIds = [];
  async function collectOrgIds(parentId) {
    orgIds.push(parentId);
    const children = await Organization.find({ parentId }).select("_id");
    for (const child of children) {
      await collectOrgIds(child._id);
    }
  }
  await collectOrgIds(user.orgId._id);

  // ✅ 2. Aggregate across all orgIds
  const orgFilesStats = await File.aggregate([
    { $match: { orgId: { $in: orgIds } } },
    {
      $group: {
        _id: null,
        totalSize: { $sum: "$size" },
        fileCount: { $sum: 1 },
      },
    },
  ]);

  orgTotalSize = orgFilesStats[0]?.totalSize || 0;
  orgFileCount = orgFilesStats[0]?.fileCount || 0;

  // ✅ 3. Count all users (including admins) in those orgs
  orgUserCount = await User.countDocuments({ orgId: { $in: orgIds } });
}


    // Build org hierarchy
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

    // Build response
    const userData = {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      avatar: user.avatar || null,
      org: user.orgId
        ? { id: user.orgId._id, name: user.orgId.name, type: user.orgId.type }
        : null,
      orgHierarchy,
      totalUploadSize: userTotalSize,
      totalFilesUploaded: userFileCount,
      orgTotalUploadSize: orgTotalSize,
      orgTotalFiles: orgFileCount,
      orgTotalUsers: orgUserCount,
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
      // ✅ Upload to Cloudinary
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          folder: "profileimage",
          public_id: `${user._id}_${Date.now()}`,
          resource_type: "image",
        },
        async (error, result) => {
          if (error) {
            console.error("Cloudinary upload error:", error);
            return res.status(500).json({ message: "Upload failed", error: error.message });
          }

          console.log("✅ Uploaded to Cloudinary:", result.secure_url);
          user.avatar = result.secure_url;
          await user.save();

          return res.json({
            message: "Profile updated successfully!",
            user: {
              id: user._id,
              name: user.name,
              email: user.email,
              avatar: user.avatar,
              role: user.role,
            },
          });
        }
      );

      // Convert file buffer to stream and upload
      streamifier.createReadStream(req.file.buffer).pipe(uploadStream);
      return; // prevent multiple responses
    }

    // ✅ If no image uploaded, only update name
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
