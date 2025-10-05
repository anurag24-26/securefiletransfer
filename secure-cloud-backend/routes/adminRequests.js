const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");
const { authMiddleware, authorizeRoles } = require("../middleware/authMiddleware");
const User = require("../models/User");
const Organization = require("../models/Organization");

const adminRequestSchema = new mongoose.Schema({
  sender: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  target: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  department: { type: mongoose.Schema.Types.ObjectId, ref: "Organization", required: true },
  status: { type: String, enum: ["pending", "accepted", "rejected"], default: "pending" },
  createdAt: { type: Date, default: Date.now },
});
const AdminRequest = mongoose.model("AdminRequest", adminRequestSchema);

// Utility: Get all orgIds recursively
async function getAllOrgIds(orgId) {
  const ids = [orgId];
  const children = await Organization.find({ parentId: orgId });
  for (const child of children) {
    const childIds = await getAllOrgIds(child._id);
    ids.push(...childIds);
  }
  return ids;
}

// GET all users
router.get("/users/emails", authMiddleware, authorizeRoles("orgAdmin", "superAdmin"), async (req, res) => {
  try {
    const currentUser = await User.findById(req.user.userId);
    if (!currentUser) return res.status(404).json({ message: "User not found" });

    let orgIds = [];

    if (currentUser.role === "superAdmin") {
      // SuperAdmin can see all orgs
      const allOrgs = await Organization.find();
      orgIds = allOrgs.map(o => o._id);
    } else {
      if (!currentUser.orgId) return res.status(400).json({ message: "Organization not assigned" });
      orgIds = await getAllOrgIds(currentUser.orgId);
    }

    const users = await User.find({ orgId: { $in: orgIds } })
      .select("email name role orgId")
      .populate("orgId", "name");

    const userList = users.map(u => ({
      id: u._id,
      name: u.name,
      email: u.email,
      role: u.role,
      organization: u.orgId ? u.orgId.name : null,
    }));

    res.json({ count: users.length, users: userList });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

// GET departments
router.get("/departments", authMiddleware, authorizeRoles("orgAdmin", "superAdmin"), async (req, res) => {
  try {
    const currentUser = await User.findById(req.user.userId);
    if (!currentUser) return res.status(404).json({ message: "User not found" });

    let filter = {};
    if (currentUser.role !== "superAdmin") {
      if (!currentUser.orgId) return res.status(400).json({ message: "Organization not assigned" });
      filter = { parentId: currentUser.orgId, type: "department" };
    } else {
      filter = { type: "department" };
    }

    const departments = await Organization.find(filter);
    res.json({ count: departments.length, departments });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

// POST admin request
router.post("/requests", authMiddleware, authorizeRoles("orgAdmin", "superAdmin"), async (req, res) => {
  try {
    const { targetUserId, departmentId } = req.body;
    if (!targetUserId || !departmentId) return res.status(400).json({ message: "targetUserId and departmentId required" });

    const dept = await Organization.findById(departmentId);
    if (!dept || dept.type !== "department") return res.status(400).json({ message: "Invalid department" });

    const sender = await User.findById(req.user.userId);
    if (!sender) return res.status(400).json({ message: "Sender not found" });

    if (!sender.orgId.equals(dept.parentId) && sender.role !== "superAdmin") {
      return res.status(403).json({ message: "Not allowed to assign admins for this department" });
    }

    const existingRequest = await AdminRequest.findOne({ target: targetUserId, department: departmentId, status: "pending" });
    if (existingRequest) return res.status(409).json({ message: "Admin request already pending" });

    const adminRequest = new AdminRequest({ sender: req.user.userId, target: targetUserId, department: departmentId });
    await adminRequest.save();

    res.status(201).json({ message: "Admin request sent", adminRequest });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

// GET requests for current user
router.get("/requests", authMiddleware, async (req, res) => {
  try {
    const requests = await AdminRequest.find({ target: req.user.userId, status: "pending" })
      .populate("sender", "name email")
      .populate("department", "name");

    res.json({ count: requests.length, requests });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

// POST respond to request
router.post("/requests/:id/respond", authMiddleware, async (req, res) => {
  try {
    const { id } = req.params;
    const { action } = req.body;

    if (!["accept", "reject"].includes(action)) return res.status(400).json({ message: "Invalid action" });

    const adminRequest = await AdminRequest.findById(id);
    if (!adminRequest || !adminRequest.target.equals(req.user.userId)) return res.status(404).json({ message: "Request not found" });

    if (adminRequest.status !== "pending") return res.status(400).json({ message: "Request already processed" });

    if (action === "accept") {
      const user = await User.findById(req.user.userId);
      user.role = "deptAdmin";
      user.orgId = adminRequest.department;
      await user.save();

      adminRequest.status = "accepted";
      await adminRequest.save();

      return res.json({ message: "You are now department admin", user });
    } else {
      adminRequest.status = "rejected";
      await adminRequest.save();
      return res.json({ message: "Admin request rejected" });
    }
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

module.exports = router;
