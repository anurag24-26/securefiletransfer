const express = require("express");
const router = express.Router();
const User = require("../models/User");
const Organization = require("../models/Organization");
const authMiddleware = require("../middleware/authMiddleware");

// Assign a user to an organization/department
router.put("/:userId/assign-org/:orgId", authMiddleware, async (req, res) => {
  try {
    const { userId, orgId } = req.params;

    // check if org exists
    const org = await Organization.findById(orgId);
    if (!org) return res.status(404).json({ message: "Organization not found" });

    // update user orgId
    const user = await User.findByIdAndUpdate(
      userId,
      { orgId },
      { new: true }
    ).select("-passwordHash");

    if (!user) return res.status(404).json({ message: "User not found" });

    res.json({ message: "User assigned to organization", user });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
});
router.get("/org/:orgId", async (req, res) => {
  try {
    const { orgId } = req.params;

    const users = await User.find({ orgId }).populate("orgId", "name type");

    if (!users.length) {
      return res.status(404).json({ message: "No users found in this organization" });
    }

    res.json({
      message: "Users fetched successfully",
      count: users.length,
      users
    });

  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

module.exports = router;
