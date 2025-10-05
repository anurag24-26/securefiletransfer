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

// Get all users’ emails within org admin’s organization (including all departments)
router.get("/users/emails", authMiddleware, authorizeRoles("orgAdmin", "superAdmin"), async (req, res) => {
  try {
    const { user } = req;
    // Get all org and sub-org IDs under this org admin’s organization
    const orgIds = [];

    async function getAllOrgIds(orgId) {
      orgIds.push(orgId);
      const children = await Organization.find({ parentId: orgId });
      for (let c of children) {
        await getAllOrgIds(c._id);
      }
    }

    // Find orgId of current orgAdmin user
   const adminUser = await User.findById(req.user.id);

    if (!adminUser || !adminUser.orgId) {
      return res.status(400).json({ message: "Organization not assigned" });
    }

    await getAllOrgIds(adminUser.orgId);

    // Find all users with orgId in collected orgIds
    const users = await User.find({ orgId: { $in: orgIds } }).select("email name role orgId").populate("orgId", "name");

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

// Get all departments under org admin's organization
router.get("/departments", authMiddleware, authorizeRoles("orgAdmin", "superAdmin"), async (req, res) => {
  try {
    const user = await User.findById(req.user.userId);
    if (!user || !user.orgId) {
      return res.status(400).json({ message: "Organization not assigned" });
    }

    // Find deparments with parentId as orgAdmin's orgId
    const departments = await Organization.find({ parentId: user.orgId, type: "department" });
    res.json({ count: departments.length, departments });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

// Send admin request to user
router.post("/requests", authMiddleware, authorizeRoles("orgAdmin", "superAdmin"), async (req, res) => {
  try {
    const { targetUserId, departmentId } = req.body;
    if (!targetUserId || !departmentId) {
      return res.status(400).json({ message: "targetUserId and departmentId required" });
    }

    // Verify department exists
    const dept = await Organization.findById(departmentId);
    if (!dept || dept.type !== "department") {
      return res.status(400).json({ message: "Invalid department" });
    }

    // Check that the sender is admin of the department's parent org
    const sender = await User.findById(req.user.userId);
    if (!sender) {
      return res.status(400).json({ message: "Sender not found" });
    }
    // Only orgAdmins of parent orgs can send admin requests
    if (!sender.orgId.equals(dept.parentId) && sender.role !== "superAdmin") {
      return res.status(403).json({ message: "You are not allowed to assign admins for this department" });
    }

    // Create AdminRequest document
    const existingRequest = await AdminRequest.findOne({ target: targetUserId, department: departmentId, status: "pending" });
    if (existingRequest) {
      return res.status(409).json({ message: "Admin request already pending for this user and department" });
    }

    const adminRequest = new AdminRequest({
      sender: req.user.userId,
      target: targetUserId,
      department: departmentId,
    });

    await adminRequest.save();

    // TODO: Notify user via email/notification about pending request

    res.status(201).json({ message: "Admin request sent", adminRequest });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

// User fetches their admin requests
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

// User responds to admin request
router.post("/requests/:id/respond", authMiddleware, async (req, res) => {
  try {
    const { id } = req.params;
    const { action } = req.body; // accept or reject

    if (!["accept", "reject"].includes(action)) {
      return res.status(400).json({ message: "Invalid action" });
    }

    const adminRequest = await AdminRequest.findById(id);
    if (!adminRequest || !adminRequest.target.equals(req.user.userId)) {
      return res.status(404).json({ message: "Request not found" });
    }

    if (adminRequest.status !== "pending") {
      return res.status(400).json({ message: "Request already processed" });
    }

    if (action === "accept") {
      // Make user a dept admin and assign department
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

router.get("/debug", (req, res) => {
  res.json({ routes: ["/users/emails", "/departments", "/requests", "/requests/:id/respond"] });
});


module.exports = router;
