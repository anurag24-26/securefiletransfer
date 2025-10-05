const express = require("express");
const crypto = require("crypto");
const router = express.Router();
const Organization = require("../models/Organization");
const User = require("../models/User");
const { authMiddleware, authorizeRoles } = require("../middleware/authMiddleware");

/**
 * Utility: Recursively get all child orgIds
 */
async function getAllOrgIds(orgId) {
  const ids = [orgId];
  const children = await Organization.find({ parentId: orgId });
  for (const child of children) {
    ids.push(...(await getAllOrgIds(child._id)));
  }
  return ids;
}

/**
 * CREATE organization or department
 */
router.post(
  "/create",
  authMiddleware,
  authorizeRoles("superAdmin", "orgAdmin"),
  async (req, res) => {
    try {
      const { name, type, parentId, deptAdminId } = req.body;
      if (!name || !type) return res.status(400).json({ message: "Name and type required" });

      // Only superAdmin can create root organization
      if (type === "organization" && req.user.role !== "superAdmin") {
        return res.status(403).json({ message: "Only superAdmin can create root organizations" });
      }

      // If orgAdmin creates a department, ensure parentId belongs to their org
      if (type === "department" && req.user.role === "orgAdmin") {
        const parentOrg = await Organization.findById(parentId);
        if (!parentOrg || !parentOrg._id.equals(req.user.orgId)) {
          return res.status(403).json({ message: "Cannot create department outside your organization" });
        }
      }

      const joinCode = crypto.randomBytes(3).toString("hex");

      const org = new Organization({
        name,
        type,
        parentId: parentId || null,
        joinCode,
        admin: deptAdminId || null,
      });

      await org.save();

      // Assign orgId and role if deptAdmin assigned
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

/**
 * REGENERATE join code
 */
router.post(
  "/:id/generate-code",
  authMiddleware,
  authorizeRoles("superAdmin", "orgAdmin"),
  async (req, res) => {
    try {
      const org = await Organization.findById(req.params.id);
      if (!org) return res.status(404).json({ message: "Organization not found" });

      // orgAdmin can only regenerate codes for their org/dept
      if (req.user.role === "orgAdmin" && !org._id.equals(req.user.orgId) && !org.parentId.equals(req.user.orgId)) {
        return res.status(403).json({ message: "Not allowed to regenerate code for this org" });
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

/**
 * GET organizations for current user
 */
router.get("/", authMiddleware, async (req, res) => {
  try {
    const { role, userId, orgId } = req.user;
    let orgs = [];

    if (role === "superAdmin") {
      orgs = await Organization.find().populate("parentId", "name type admin");
    } else if (role === "orgAdmin") {
      const orgIds = await getAllOrgIds(req.user.orgId);
      orgs = await Organization.find({ _id: { $in: orgIds } }).populate("parentId", "name type admin");
    } else if (role === "deptAdmin") {
      const user = await User.findById(userId);
      if (user.orgId) orgs = await Organization.find({ _id: user.orgId });
    } else {
      // FOR NORMAL USERS
      if (orgId) {
        orgs = await Organization.find({ _id: orgId }).populate("parentId", "name type admin");
      }
    }

    res.json({ count: orgs.length, organizations: orgs });
  } catch (error) {
    console.error("Get orgs error:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
});



/**
 * GET full hierarchy from an org id
 */
router.get("/hierarchy/:id", authMiddleware, async (req, res) => {
  try {
    async function buildTree(parentId) {
      const children = await Organization.find({ parentId });
      return Promise.all(
        children.map(async (child) => ({
          ...child.toObject(),
          children: await buildTree(child._id),
        }))
      );
    }

    const root = await Organization.findById(req.params.id);
    if (!root) return res.status(404).json({ message: "Organization not found" });

    // Check permission: orgAdmin only on own org
    if (req.user.role === "orgAdmin" && !root._id.equals(req.user.orgId) && !root.parentId.equals(req.user.orgId)) {
      return res.status(403).json({ message: "Not allowed to view hierarchy for this org" });
    }
    if (req.user.role === "deptAdmin" && !root._id.equals(req.user.orgId)) {
      return res.status(403).json({ message: "Not allowed to view hierarchy for this department" });
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

/**
 * UPDATE organization
 */
router.put("/:id", authMiddleware, authorizeRoles("superAdmin", "orgAdmin", "deptAdmin"), async (req, res) => {
  try {
    const { name, type, parentId, deptAdminId } = req.body;
    const org = await Organization.findById(req.params.id);
    if (!org) return res.status(404).json({ message: "Organization not found" });

    // Permission checks
    if (req.user.role === "orgAdmin" && !org._id.equals(req.user.orgId) && !org.parentId.equals(req.user.orgId)) {
      return res.status(403).json({ message: "Not allowed to update this org" });
    }
    if (req.user.role === "deptAdmin" && !org._id.equals(req.user.orgId)) {
      return res.status(403).json({ message: "Not allowed to update this department" });
    }

    if (name) org.name = name;
    if (type) org.type = type;
    if (parentId) org.parentId = parentId;
    if (deptAdminId) {
      org.admin = deptAdminId;
      await User.findByIdAndUpdate(deptAdminId, { orgId: org._id, role: "deptAdmin" });
    }

    await org.save();
    res.json({ message: "Updated successfully", organization: org });
  } catch (error) {
    console.error("Update org error:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

/**
 * DELETE organization (only if no child departments)
 */
router.delete("/:id", authMiddleware, authorizeRoles("superAdmin", "orgAdmin"), async (req, res) => {
  try {
    const org = await Organization.findById(req.params.id);
    if (!org) return res.status(404).json({ message: "Organization not found" });

    // orgAdmin can delete only own org or child departments
    if (req.user.role === "orgAdmin" && !org._id.equals(req.user.orgId) && !org.parentId.equals(req.user.orgId)) {
      return res.status(403).json({ message: "Not allowed to delete this org" });
    }

    const children = await Organization.find({ parentId: org._id });
    if (children.length > 0) return res.status(400).json({ message: "Remove child departments before deleting" });

    await org.deleteOne();
    res.json({ message: "Deleted successfully" });
  } catch (error) {
    console.error("Delete org error:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

/**
 * LIST users under current admin
 */
router.get("/users/:orgId", authMiddleware, authorizeRoles("superAdmin", "orgAdmin", "deptAdmin"), async (req, res) => {
  const orgId = req.params.orgId;
  try {
    const { role, userId } = req.user;
    let users = [];

  

    if (role === "superAdmin") {
      users = await User.find().populate("orgId", "name type");
    } else if (role === "orgAdmin") {
      const orgIds = await getAllOrgIds(req.user.orgId);
      users = await User.find({ orgId: { $in: orgIds } }).populate("orgId", "name type");
    } else if (role === "deptAdmin") {
      users = await User.find({ orgId: req.user.orgId }).populate("orgId", "name type");
    }

    const userList = users.map(u => ({
      id: u._id,
      name: u.name,
      email: u.email,
      role: u.role,
      organization: u.orgId ? u.orgId.name : null,
    }));

    res.json({ count: userList.length, users: userList });
  } catch (error) {
    console.error("List users error:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

// GET users under an organization or department (including child departments)
router.get("/:id/users", authMiddleware, authorizeRoles("superAdmin", "orgAdmin", "deptAdmin"), async (req, res) => {
  try {
    const orgId = req.params.id;
    const currentUser = await User.findById(req.user.userId);
    if (!currentUser) return res.status(404).json({ message: "User not found" });

    // Recursive function to get all child org IDs
    async function getAllOrgIds(orgId) {
      const ids = [orgId];
      const children = await Organization.find({ parentId: orgId });
      for (const child of children) {
        const childIds = await getAllOrgIds(child._id);
        ids.push(...childIds);
      }
      return ids;
    }

    // Only allow access if user belongs to org or is superAdmin
    if (currentUser.role !== "superAdmin") {
      if (!currentUser.orgId) return res.status(403).json({ message: "Not allowed" });
      const allowedOrgIds = await getAllOrgIds(currentUser.orgId.toString());
      if (!allowedOrgIds.includes(orgId)) {
        return res.status(403).json({ message: "Not allowed to access this org" });
      }
    }

    const orgIds = await getAllOrgIds(orgId);

    const users = await User.find({ orgId: { $in: orgIds } }).select("name email role orgId").populate("orgId", "name type");

    res.json({
      count: users.length,
      users: users.map(u => ({
        id: u._id,
        name: u.name,
        email: u.email,
        role: u.role,
        organization: u.orgId?.name || null,
        orgType: u.orgId?.type || null,
      }))
    });
  } catch (error) {
    console.error("Fetch users under org error:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
});


module.exports = router;
