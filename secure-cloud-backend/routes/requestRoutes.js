const express = require("express");
const mongoose = require("mongoose");
const router = express.Router();

const User = require("../models/User");
const Organization = require("../models/Organization");
const { authMiddleware, authorizeRoles } = require("../middleware/authMiddleware");

/* --------------------- Request Schema --------------------- */
const requestSchema = new mongoose.Schema(
  {
    type: {
      type: String,
      enum: ["join", "admin", "roleChange"],
      required: true,
    },
    sender: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    targetUser: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    email: { type: String, lowercase: true, trim: true },
    orgId: { type: mongoose.Schema.Types.ObjectId, ref: "Organization" },
    departmentId: { type: mongoose.Schema.Types.ObjectId, ref: "Organization" },
    requestedRole: {
      type: String,
      enum: ["user", "deptAdmin", "orgAdmin", "superAdmin"],
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

/* --------------------- Helper to fetch all orgIds --------------------- */
async function getAllOrgIds(orgId) {
  const ids = [orgId];
  const children = await Organization.find({ parentId: orgId });
  for (const child of children) ids.push(...(await getAllOrgIds(child._id)));
  return ids;
}

/* --------------------- Create Request --------------------- */
router.post("/", authMiddleware, async (req, res) => {
  try {
    const { type, targetUser, email, orgId, departmentId, requestedRole, message } = req.body;
    const sender = await User.findById(req.user.userId);
    if (!sender) return res.status(404).json({ message: "Sender not found" });

    if (type === "admin" && (!targetUser || !departmentId))
      return res.status(400).json({ message: "targetUser and departmentId required" });

    const existingRequest = await Request.findOne({
      type,
      targetUser,
      departmentId,
      status: "pending",
    });

    if (existingRequest)
      return res.status(409).json({ message: "Similar request already pending" });

    const newReq = new Request({
      type,
      sender: sender._id,
      targetUser,
      email,
      orgId,
      departmentId,
      requestedRole: requestedRole || "deptAdmin",
      message,
    });

    await newReq.save();
    res.status(201).json({ message: "Request created successfully", request: newReq });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

/* --------------------- Fetch Pending Requests (Admins) --------------------- */
/* --------------------- Fetch Pending Requests (Admins) --------------------- */
router.get("/", authMiddleware, authorizeRoles("superAdmin", "orgAdmin", "deptAdmin"), async (req, res) => {
  try {
    const currentUser = await User.findById(req.user.userId);
    if (!currentUser) return res.status(404).json({ message: "User not found" });

    let orgIds = [];
    if (currentUser.role === "superAdmin") {
      orgIds = (await Organization.find()).map((o) => o._id);
    } else if (currentUser.orgId) {
      orgIds = await getAllOrgIds(currentUser.orgId);
    }

    const requests = await Request.find({
      $or: [
        { orgId: { $in: orgIds } },
        { departmentId: { $in: orgIds } }
      ],
      status: "pending",
      sender: { $ne: currentUser._id }  // 🔥 FIX: Don't show your own requests
    })
      .populate("sender", "name email role")
      .populate("targetUser", "name email role")
      .populate("orgId", "name type")
      .populate("departmentId", "name type")
      .sort({ createdAt: -1 });

    res.json({ requests });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
});


/* --------------------- Approve / Reject Request --------------------- */
/* --------------------- Approve / Reject Request --------------------- */
router.post("/:id/action", authMiddleware, async (req, res) => {
  try {
    const { id } = req.params;
    const { action } = req.body;

    if (!["approve", "reject"].includes(action))
      return res.status(400).json({ message: "Invalid action" });

    const request = await Request.findById(id);
    if (!request) return res.status(404).json({ message: "Request not found" });

    const currentUser = await User.findById(req.user.userId);
    if (!currentUser)
      return res.status(404).json({ message: "Current user not found" });

    let allowed = false;

    /* ---------------- ADMIN PERMISSION ---------------- */
    if (["superAdmin", "orgAdmin", "deptAdmin"].includes(currentUser.role)) {
      let orgIds = [];

      if (currentUser.role === "superAdmin") {
        orgIds = (await Organization.find()).map((o) => o._id.toString());
      } else if (currentUser.orgId) {
        orgIds = await getAllOrgIds(currentUser.orgId);
        orgIds = orgIds.map((id) => id.toString());
      }

      const reqOrg = request.orgId ? request.orgId.toString() : null;
      const reqDept = request.departmentId ? request.departmentId.toString() : null;

      if ((reqOrg && orgIds.includes(reqOrg)) || (reqDept && orgIds.includes(reqDept)))
        allowed = true;
    }

    /* ------------ ONLY TARGET USER CAN ACCEPT JOIN REQUESTS ----------- */
    if (request.type === "join") {
      if (
        request.targetUser &&
        request.targetUser.toString() === currentUser._id.toString()
      ) {
        allowed = true;
      }
    }

    /* --------- DO NOT ALLOW SENDER TO APPROVE THEIR OWN REQUEST -------- */
    if (request.sender.toString() === currentUser._id.toString()) {
      return res.status(403).json({
        message: "You cannot approve your own request",
      });
    }

    if (!allowed)
      return res.status(403).json({
        message: "Forbidden: You are not allowed to manage this request",
      });

    /* ----------------- REJECT ------------------ */
    if (action === "reject") {
      request.status = "rejected";
      request.processedAt = new Date();
      await request.save();
      return res.json({ message: "Request rejected" });
    }

    /* ----------------- APPROVE ------------------ */
    if (request.type === "admin") {
      const target = await User.findById(request.targetUser);
      if (!target) return res.status(404).json({ message: "Target user not found" });

      target.role = "deptAdmin";
      target.orgId = request.departmentId;
      await target.save();
    } else if (request.type === "join") {
      let user = await User.findOne({ email: request.email });

      if (user) {
        user.orgId = request.orgId;
        user.role = request.requestedRole;
      } else {
        user = new User({
          email: request.email,
          orgId: request.orgId,
          role: request.requestedRole,
        });
      }

      await user.save();
    } else if (request.type === "roleChange") {
      const target = await User.findById(request.targetUser);
      if (!target) return res.status(404).json({ message: "Target user not found" });

      target.role = request.requestedRole;
      await target.save();
    }

    request.status = "approved";
    request.processedAt = new Date();
    await request.save();

    res.json({ message: "Request processed", request });
  } catch (error) {
    console.error("Action request error:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
});


/* --------------------- Get All Users under Admin’s Org --------------------- */
router.get("/users/list", authMiddleware, authorizeRoles("superAdmin", "orgAdmin", "deptAdmin"), async (req, res) => {
  try {
    const admin = await User.findById(req.user.userId);
    if (!admin) return res.status(404).json({ message: "User not found" });

    let users = [];
    if (admin.role === "superAdmin") {
      users = await User.find().populate("orgId", "name");
    } else if (admin.role === "orgAdmin") {
      const orgIds = await getAllOrgIds(admin.orgId);
      users = await User.find({ orgId: { $in: orgIds } }).populate("orgId", "name");
    } else if (admin.role === "deptAdmin") {
      users = await User.find({ orgId: admin.orgId }).populate("orgId", "name");
    }

    res.json({ users });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
});


// Fetch departments visible to current admin (for promotion UI)
router.get("/departments/list", authMiddleware, authorizeRoles("superAdmin", "orgAdmin", "deptAdmin"), async (req, res) => {
  try {
    const admin = await User.findById(req.user.userId);
    if (!admin) return res.status(404).json({ message: "User not found" });

    let filter = { type: "department" };

    if (admin.role === "superAdmin") {
      // Can see all departments
      // filter stays as { type: "department" }
    } else if (admin.role === "orgAdmin") {
      filter.parentId = admin.orgId;
    } else if (admin.role === "deptAdmin") {
      filter._id = admin.orgId;
    }

    const departments = await Organization.find(filter).select("_id name type parentId");
    res.json({ departments });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
});


/* --------------------- My Requests (for normal users) --------------------- */
router.get("/my-requests", authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.user.userId);
    const requests = await Request.find({
      status: "pending",
      $or: [{ targetUser: user._id }, { email: user.email }],
    })
      .populate("sender", "name email role")
      .populate("orgId", "name")
      .populate("departmentId", "name")
      .sort({ createdAt: -1 });

    res.json({ requests });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
});


/* --------------------- Fetch ALL Admins Under Admin’s Organization --------------------- */
router.get(
  "/admins/list",
  authMiddleware,
  authorizeRoles("superAdmin", "orgAdmin", "deptAdmin"),
  async (req, res) => {
    try {
      const currentUser = await User.findById(req.user.userId);
      if (!currentUser)
        return res.status(404).json({ message: "User not found" });

      let orgIds = [];

      if (currentUser.role === "superAdmin") {
        orgIds = (await Organization.find()).map((o) => o._id);
      } else if (currentUser.orgId) {
        orgIds = await getAllOrgIds(currentUser.orgId);
      }

      const admins = await User.find({
        orgId: { $in: orgIds },
        role: { $in: ["orgAdmin", "deptAdmin"] },
      })
        .select("name email role orgId")
        .populate("orgId", "name type")
        .lean();

      res.json({ admins });
    } catch (error) {
      console.error("Error fetching admins:", error);
      res.status(500).json({ message: "Server error", error: error.message });
    }
  }
);

/* --------------------- Remove Admin (Demote to User) --------------------- */
router.post(
  "/admin/remove/:userId",
  authMiddleware,
  authorizeRoles("superAdmin", "orgAdmin"),
  async (req, res) => {
    try {
      const { userId } = req.params;
      const currentUser = await User.findById(req.user.userId);

      if (!currentUser) return res.status(404).json({ message: "Current user not found" });

      // Fetch the target admin
      const target = await User.findById(userId);
      if (!target) return res.status(404).json({ message: "Target user not found" });

      // Only admins can be removed
      if (!["orgAdmin", "deptAdmin"].includes(target.role)) {
        return res.status(400).json({ message: "User is not an admin" });
      }

      // Permission rules
      if (currentUser.role === "orgAdmin") {
        // orgAdmin can remove admins ONLY under their org tree
        let orgIds = await getAllOrgIds(currentUser.orgId);
        orgIds = orgIds.map((id) => id.toString());

        if (!orgIds.includes(target.orgId.toString())) {
          return res
            .status(403)
            .json({ message: "Forbidden: You cannot remove admins outside your organization" });
        }
      }

      // Demote admin to normal user
      target.role = "user";
      await target.save();

      res.json({ message: "Admin removed successfully", user: target });
    } catch (error) {
      console.error("Remove admin error:", error);
      res.status(500).json({ message: "Server error", error: error.message });
    }
  }
);

module.exports = router;
