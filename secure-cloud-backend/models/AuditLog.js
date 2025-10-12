// models/AuditLog.js
const mongoose = require("mongoose");

const auditLogSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  file: { type: mongoose.Schema.Types.ObjectId, ref: "File", required: true },
  action: {
    type: String,
    enum: ["upload", "download", "delete", "share", "view"],
    required: true,
  },
  ipAddress: { type: String },
  userAgent: { type: String },
  timestamp: { type: Date, default: Date.now },
  details: { type: String },
});

module.exports = mongoose.model("AuditLog", auditLogSchema);
