const express = require("express");
const crypto = require("crypto");
const router = express.Router();
const Organization = require("../models/Organization");
const User = require("../models/User");
const { authMiddleware, authorizeRoles } = require("../middleware/authMiddleware");

// Create new organization or department
router.post(
  "/create",
  authMiddleware,
  authorizeRoles("superAdmin", "orgAdmin"),
  async (req, res) => {
    try {
      const { name, type, parentId, deptAdminId } = req.body;
      if (!name || !type) {
        return res.status(400).json({ message: "Name and type are required" });
      }

      let admin = null;
      if (type === "department" && deptAdminId) {
        admin = deptAdminId;
      }

      const joinCode = crypto.randomBytes(3).toString("hex"); // e.g. '1a2b3c'
      const parent = parentId && parentId.trim() !== "" ? parentId : null;

      const org = new Organization({ name, type, parentId: parent, joinCode, admin });
      await org.save();

      // Automatically assign orgId to creator if they are orgAdmin creating a root org
      if (req.user.role === "orgAdmin" && type === "organization") {
        await User.findByIdAndUpdate(req.user.userId, { orgId: org._id });
      }

      // If creating a department and deptAdminId provided, assign orgId to that user
      if (type === "department" && deptAdminId) {
        await User.findByIdAndUpdate(deptAdminId, { orgId: org._id, role: "deptAdmin" });
      }

      res.status(201).json({ message: "Created successfully", organization: org, joinCode });
    } catch (error) {
      console.error("Create org error:", error);
      res.status(500).json({ message: "Server error", error: error.message });
    }
  }
);
// Regenerate join code for existing org/department
router.post(
  "/:id/generate-code",
  authMiddleware,
  authorizeRoles("superAdmin", "orgAdmin"),
  async (req, res) => {
    try {
      const org = await Organization.findById(req.params.id);
      if (!org) {
        return res.status(404).json({ message: "Organization not found" });
      }

      org.joinCode = crypto.randomBytes(3).toString("hex");
      await org.save();

      res.json({ message: "Join code regenerated", joinCode: org.joinCode });
    } catch (error) {
      console.error("Regenerate code error:", error);
      res.status(500).json({ message: "Server error", error: error.message });
    }
  }
);

// Get organizations based on user role
router.get("/", authMiddleware, async (req, res) => {
  try {
    const { role, userId } = req.user;
    let orgs = [];

    if (role === "superAdmin") {
      orgs = await Organization.find().populate("parentId", "name type");
    } else if (role === "orgAdmin") {
      const admin = await User.findById(userId);
      // Get orgs where the parentId is admin's orgId (children under this org)
      orgs = await Organization.find({ parentId: admin.orgId });
    } else {
      const user = await User.findById(userId);
      if (user.orgId) {
        orgs = await Organization.find({ _id: user.orgId });
      }
    }

    res.json({ count: orgs.length, organizations: orgs });
  } catch (error) {
    console.error("Get orgs error:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

// Get full hierarchy from an org id
router.get("/hierarchy/:id", authMiddleware, async (req, res) => {
  try {
    async function buildTree(parentId) {
      const children = await Organization.find({ parentId });
      return Promise.all(children.map(async (child) => ({
        ...child.toObject(),
        children: await buildTree(child._id),
      })));
    }

    const root = await Organization.findById(req.params.id);
    if (!root) {
      return res.status(404).json({ message: "Organization not found" });
    }

    const hierarchy = {
      ...root.toObject(),
      children: await buildTree(root._id),
    };

    res.json(hierarchy);
  } catch (error) {
    console.error("Hierarchy error:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

// Update organization
router.put(
  "/:id",
  authMiddleware,
  authorizeRoles("superAdmin", "orgAdmin"),
  async (req, res) => {
    try {
      const { name, type, parentId } = req.body;

      const org = await Organization.findById(req.params.id);
      if (!org) return res.status(404).json({ message: "Organization not found" });

      if (name) org.name = name;
      if (type) org.type = type;
      org.parentId = parentId && parentId.trim() !== "" ? parentId : null;

      await org.save();

      res.json({ message: "Updated successfully", organization: org });
    } catch (error) {
      console.error("Update org error:", error);
      res.status(500).json({ message: "Server error", error: error.message });
    }
  }
);

// Delete organization (only if no child departments)
router.delete(
  "/:id",
  authMiddleware,
  authorizeRoles("superAdmin", "orgAdmin"),
  async (req, res) => {
    try {
      const org = await Organization.findById(req.params.id);
      if (!org) return res.status(404).json({ message: "Organization not found" });

      const children = await Organization.find({ parentId: org._id });
      if (children.length > 0) {
        return res.status(400).json({ message: "Remove child departments before deleting" });
      }

      await org.deleteOne();
      res.json({ message: "Deleted successfully" });
    } catch (error) {
      console.error("Delete org error:", error);
      res.status(500).json({ message: "Server error", error: error.message });
    }
  }
);

module.exports = router;
