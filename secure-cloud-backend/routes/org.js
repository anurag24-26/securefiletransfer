// routes/organization.js
const express = require("express");
const router = express.Router();
const Organization = require("../models/Organization");
const authMiddleware = require("../middleware/authMiddleware");
const authorizeRoles = require("../middleware/authorizeRoles");

// CREATE an organization (Admin only)
router.post("/create", authMiddleware, authorizeRoles("admin"), async (req, res) => {
  try {
    const { name, type, parentId } = req.body;
    const org = new Organization({ name, type, parentId: parentId || null });
    await org.save();
    res.status(201).json({ message: "Organization created successfully", org });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

// READ all organizations
router.get("/", authMiddleware, async (req, res) => {
  try {
    const orgs = await Organization.find();
    res.json(orgs);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

// READ organization hierarchy
router.get("/hierarchy/:id", authMiddleware, async (req, res) => {
  try {
    const buildTree = async (parentId) => {
      const children = await Organization.find({ parentId });
      return Promise.all(
        children.map(async (child) => ({
          ...child.toObject(),
          children: await buildTree(child._id),
        }))
      );
    };

    const root = await Organization.findById(req.params.id);
    if (!root) return res.status(404).json({ message: "Organization not found" });

    const hierarchy = { ...root.toObject(), children: await buildTree(root._id) };
    res.json(hierarchy);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

// UPDATE organization name/type/parentId (Admin only)
router.put("/:id", authMiddleware, authorizeRoles("admin"), async (req, res) => {
  try {
    const { name, type, parentId } = req.body;
    const org = await Organization.findById(req.params.id);
    if (!org) return res.status(404).json({ message: "Organization not found" });

    org.name = name || org.name;
    org.type = type || org.type;
    org.parentId = parentId !== undefined ? parentId : org.parentId;

    await org.save();
    res.json({ message: "Organization updated successfully", org });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

// DELETE organization (Admin only)
router.delete("/:id", authMiddleware, authorizeRoles("admin"), async (req, res) => {
  try {
    const org = await Organization.findById(req.params.id);
    if (!org) return res.status(404).json({ message: "Organization not found" });

    // Optional: Prevent deleting orgs with children
    const children = await Organization.find({ parentId: org._id });
    if (children.length > 0) {
      return res.status(400).json({ message: "Cannot delete organization with child departments" });
    }

    await org.remove();
    res.json({ message: "Organization deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

module.exports = router;
