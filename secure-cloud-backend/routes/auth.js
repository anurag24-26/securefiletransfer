const express = require("express");
const router = express.Router();
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/User");
const Organization = require("../models/Organization");
const { authMiddleware } = require("../middleware/authMiddleware");

// ===================== SIGNUP =====================
router.post("/signup", async (req, res) => {
  try {
    const { name, email, password, role } = req.body;

    if (!name || !email || !password || !role)
      return res.status(400).json({ message: "Required fields missing" });

    const existingUser = await User.findOne({ email });
    if (existingUser)
      return res.status(400).json({ message: "User already exists" });

    // 🔹 (Later) We'll handle joinCode logic here when you enable it
    const orgId = null; // For now, users are not assigned automatically

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

    const payload = { userId: user._id, role: user.role };
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
    const user = await User.findById(req.user.userId).select("-passwordHash");
    if (!user) return res.status(404).json({ message: "User not found" });

    let orgHierarchy = [];
    let currentOrgId = user.orgId;

    while (currentOrgId) {
      const org = await Organization.findById(currentOrgId);
      if (!org) break;
      orgHierarchy.unshift({ id: org._id, name: org.name, type: org.type });
      currentOrgId = org.parentId;
    }

    res.json({
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        orgHierarchy,
      },
    });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

// ===================== FORGOT PASSWORD (Simple Version) =====================
router.post("/forgot-password", async (req, res) => {
  try {
    const { email, newPassword, confirmPassword } = req.body;

    if (!email || !newPassword || !confirmPassword) {
      return res.status(400).json({ message: "All fields are required." });
    }

    if (newPassword !== confirmPassword) {
      return res.status(400).json({ message: "Passwords do not match." });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: "User not found." });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    user.passwordHash = hashedPassword;
    await user.save();

    res.json({ message: "Password updated successfully!" });
  } catch (err) {
    console.error("Forgot Password Error:", err);
    res.status(500).json({ message: "Server error" });
  }
});


module.exports = router;
