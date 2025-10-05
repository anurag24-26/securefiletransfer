const express = require("express");
const router = express.Router();
const User = require("../models/User");
const Organization = require("../models/Organization");
const { authMiddleware, authorizeRoles } = require("../middleware/authMiddleware");

// Assign user to organization or department
router.put(
  "/:userId/assign-org/:orgId",
  authMiddleware,
  authorizeRoles("superAdmin", "orgAdmin", "deptAdmin"),
  async (req, res) => {
    try {
      const { userId, orgId } = req.params;

      const org = await Organization.findById(orgId);
      if (!org) return res.status(404).json({ message: "Organization not found" });

      const user = await User.findById(userId);
      if (!user) return res.status(404).json({ message: "User not found" });

      user.orgId = org._id;
      await user.save();

      res.json({ message: "User assigned to organization", user });
    } catch (error) {
      console.error("Assign org error:", error);
      res.status(500).json({ message: "Server error", error: error.message });
    }
  }
);

// Get users in the entire organization including departments
router.get(
  "/org/:orgId",
  authMiddleware,
  authorizeRoles("superAdmin", "orgAdmin"),
  async (req, res) => {
    try {
      const { orgId } = req.params;

      // Recursive function to get all department IDs under this org
      async function getAllOrgIds(parentId, ids = []) {
        ids.push(parentId);
        const children = await Organization.find({ parentId });
        for (const child of children) {
          await getAllOrgIds(child._id, ids);
        }
        return ids;
      }

      const orgIds = await getAllOrgIds(orgId);

      // Find all users belonging to these orgs
      const users = await User.find({ orgId: { $in: orgIds } }).populate("orgId", "name type");

      if (!users.length) {
        return res.status(404).json({ message: "No users found in the organization" });
      }

      res.json({ message: "Users fetched", count: users.length, users });
    } catch (error) {
      console.error("Fetch users error:", error);
      res.status(500).json({ message: "Server error", error: error.message });
    }
  }
);

router.get(
  "/my-org-info",
  authMiddleware,
  async (req, res) => {
    try {
      const user = await User.findById(req.user.userId);
      if (!user || !user.orgId) return res.status(404).json({ message: "No organization assigned" });

      async function getAllOrgIds(orgId) {
        const ids = [orgId];
        const children = await Organization.find({ parentId: orgId });
        for (const child of children) {
          ids.push(...(await getAllOrgIds(child._id)));
        }
        return ids;
      }

      const orgIds = await getAllOrgIds(user.orgId);

      const org = await Organization.findById(user.orgId).select('name type parentId joinCode');

      const admins = await User.find({
        orgId: { $in: orgIds },
        role: { $regex: "Admin$", $options: "i" } // roles ending with Admin (superAdmin, orgAdmin, deptAdmin)
      }).select("name email role");

      let parentName = null;
      if (org.parentId) {
        const parent = await Organization.findById(org.parentId).select("name");
        parentName = parent?.name || null;
      }

      res.json({
        organization: {
          id: org._id,
          name: org.name,
          type: org.type,
          parent: parentName,
          joinCode: org.joinCode,
          admins: admins.map(a => ({
            id: a._id,
            name: a.name,
            email: a.email,
            role: a.role
          })),
        }
      });
    } catch (error) {
      console.error("Fetch my org info error:", error);
      res.status(500).json({ message: "Server error", error: error.message });
    }
  }
);

module.exports = router;
