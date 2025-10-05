const express = require("express");
const mongoose = require("mongoose");
const router = express.Router();

const User = require("../models/User");
const Organization = require("../models/Organization");
const { authMiddleware, authorizeRoles } = require("../middleware/authMiddleware");

/* ---------------------------------------------
   🧩 Unified Request Schema
   --------------------------------------------- */
const requestSchema = new mongoose.Schema(
  {
    type: {
      type: String,
      enum: ["join", "admin", "roleChange"],
      required: true,
    },
    sender: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    targetUser: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    email: { type: String, lowercase: true, trim: true },
    orgId: { type: mongoose.Schema.Types.ObjectId, ref: "Organization" },
    departmentId: { type: mongoose.Schema.Types.ObjectId, ref: "Organization" },
    requestedRole: {
      type: String,
      enum: ["user", "deptAdmin", "orgAdmin", "superAdmin"],
      required: true,
      default: "user",
    },
    message: { type: String, default: "" },
    status: {
      type: String,
      enum: ["pending", "approved", "rejected"],
      default: "pending",
    },
    processedAt: Date,
  },
  { timestamps: true }
);

const Request = mongoose.model("Request", requestSchema);

/* ---------------------------------------------
   🧭 Utility function — get all nested orgIds
   --------------------------------------------- */
async function getAllOrgIds(orgId) {
  const ids = [orgId];
  const children = await Organization.find({ parentId: orgId });
  for (const child of children) {
    ids.push(...(await getAllOrgIds(child._id)));
  }
  return ids;
}

/* ---------------------------------------------
   📨 Create a new Request
   --------------------------------------------- */
router.post("/", authMiddleware, async (req, res) => {
  try {
    const { type, targetUser, email, orgId, departmentId, requestedRole, message } = req.body;

    if (!type || !requestedRole)
      return res.status(400).json({ message: "Type and requestedRole are required" });

    const sender = await User.findById(req.user.userId);
    if (!sender) return res.status(404).json({ message: "Sender not found" });

    if (type === "join" && (!email || !orgId)) {
      return res.status(400).json({ message: "Email and orgId required for join request" });
    }

    if (type === "admin" && (!targetUser || !departmentId)) {
      return res.status(400).json({ message: "targetUser and departmentId required for admin request" });
    }

    const existingRequest = await Request.findOne({
      type,
      email: email || undefined,
      targetUser: targetUser || undefined,
      orgId: orgId || undefined,
      departmentId: departmentId || undefined,
      status: "pending",
    });

    if (existingRequest)
      return res.status(409).json({ message: "A similar pending request already exists" });

    const newRequest = new Request({
      type,
      sender: sender._id,
      targetUser,
      email,
      orgId,
      departmentId,
      requestedRole,
      message,
      status: "pending",
    });

    await newRequest.save();
    res.status(201).json({ message: "Request created successfully", request: newRequest });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

/* ---------------------------------------------
   📋 Get all pending requests (for admins)
   --------------------------------------------- */
router.get("/", authMiddleware, authorizeRoles("superAdmin", "orgAdmin", "deptAdmin"), async (req, res) => {
  try {
    const currentUser = await User.findById(req.user.userId);
    if (!currentUser) return res.status(404).json({ message: "User not found" });

    let orgIds = [];
    if (currentUser.role === "superAdmin") {
      orgIds = (await Organization.find()).map(o => o._id);
    } else if (currentUser.orgId) {
      orgIds = await getAllOrgIds(currentUser.orgId);
    }

    const requests = await Request.find({
      $or: [
        { orgId: { $in: orgIds } },
        { departmentId: { $in: orgIds } },
      ],
      status: "pending",
    })
      .populate("sender", "name email role")
      .populate("targetUser", "name email role")
      .populate("orgId", "name type")
      .populate("departmentId", "name type")
      .sort({ createdAt: -1 });

    res.json({ count: requests.length, requests });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

/* ---------------------------------------------
   ✅ Approve or ❌ Reject a request
   --------------------------------------------- */
router.post("/:id/action", authMiddleware, authorizeRoles("superAdmin", "orgAdmin", "deptAdmin"), async (req, res) => {
  try {
    const { id } = req.params;
    const { action } = req.body;

    if (!["approve", "reject"].includes(action))
      return res.status(400).json({ message: "Invalid action" });

    const request = await Request.findById(id);
    if (!request || request.status !== "pending")
      return res.status(404).json({ message: "Request not found or already processed" });

    if (action === "reject") {
      request.status = "rejected";
      request.processedAt = new Date();
      await request.save();
      return res.json({ message: "Request rejected" });
    }

    // ---- APPROVE LOGIC ----
    if (request.type === "join") {
      let user = await User.findOne({ email: request.email });
      if (!user) {
        user = new User({
          email: request.email,
          orgId: request.orgId,
          role: request.requestedRole,
        });
      } else {
        user.orgId = request.orgId;
        user.role = request.requestedRole;
      }
      await user.save();
    } else if (request.type === "admin") {
      const target = await User.findById(request.targetUser);
      if (!target) return res.status(404).json({ message: "Target user not found" });

      target.role = "deptAdmin";
      target.orgId = request.departmentId;
      await target.save();
    } else if (request.type === "roleChange") {
      const target = await User.findById(request.targetUser);
      if (!target) return res.status(404).json({ message: "User not found" });

      target.role = request.requestedRole;
      await target.save();
    }

    request.status = "approved";
    request.processedAt = new Date();
    await request.save();

    res.json({ message: "Request approved successfully", request });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

/* ---------------------------------------------
   🧠 Get users under current admin’s org/dept
   --------------------------------------------- */
router.get("/users/list", authMiddleware, authorizeRoles("superAdmin", "orgAdmin", "deptAdmin"), async (req, res) => {
  try {
    const currentUser = await User.findById(req.user.userId);
    if (!currentUser) return res.status(404).json({ message: "User not found" });

    let users = [];

    if (currentUser.role === "superAdmin") {
      users = await User.find().populate("orgId", "name");
    } else if (currentUser.role === "orgAdmin") {
      const orgIds = await getAllOrgIds(currentUser.orgId);
      users = await User.find({ orgId: { $in: orgIds } }).populate("orgId", "name");
    } else if (currentUser.role === "deptAdmin") {
      users = await User.find({ orgId: currentUser.orgId }).populate("orgId", "name");
    }

    res.json({ count: users.length, users });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
});


// GET requests targeted to current user (directly or by email)
router.get("/my-requests", authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.user.userId);
    if (!user) return res.status(404).json({ message: "User not found" });

    // Find requests either by targetUser or by email (if email stored)
    const requests = await Request.find({
      status: "pending",
      $or: [
        { targetUser: user._id },
        { email: user.email }
      ]
    })
    .populate("sender", "name email role")
    .populate("orgId", "name type")
    .populate("departmentId", "name type")
    .sort({ createdAt: -1 });

    res.json({ count: requests.length, requests });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

module.exports = router;
