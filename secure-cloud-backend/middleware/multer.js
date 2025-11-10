const multer = require("multer");

// ✅ Store file in memory instead of local uploads/
const storage = multer.memoryStorage();

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // max 5MB per file
});

module.exports = upload;
