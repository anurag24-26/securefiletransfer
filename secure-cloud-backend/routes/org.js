const express = require("express");
const router = express.Router();
const Organization = require("../models/Organization");
const authMiddleware = require("../middleware/authMiddleware");

// Create an organization
router.post("/create", authMiddleware, async (req, res) => {
  try {
    const { name, type, parentId } = req.body;

    const org = new Organization({ name, type, parentId: parentId || null });
    await org.save();

    res.status(201).json({ message: "Organization created successfully", org });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

// Get all organizations
router.get("/", authMiddleware, async (req, res) => {
  try {
    const orgs = await Organization.find();
    res.json(orgs);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

// Get hierarchy
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

    const hierarchy = {
      ...root.toObject(),
      children: await buildTree(root._id),
    };

    res.json(hierarchy);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

module.exports = router;
