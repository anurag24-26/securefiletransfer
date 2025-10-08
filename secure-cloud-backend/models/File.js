const mongoose = require("mongoose");

const fileSchema = new mongoose.Schema(
  {
    filename: { type: String, required: true },
    originalName: { type: String, required: true },
    description: { type: String },
    orgId: { type: mongoose.Schema.Types.ObjectId, ref: "Organization" },
    uploadedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    visibleTo: [
      {
        type: mongoose.Schema.Types.ObjectId,
        refPath: "visibleToType",
      },
    ],
    visibleToType: {
      type: String,
      enum: ["Organization", "User", "Department"],
    },
    encrypted: { type: Boolean, default: true },
    iv: { type: String, required: true },
    expiryDate: { type: Date },
    audit: [
      {
        action: String,
        user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
        timestamp: Date,
        details: String,
      },
    ],
  },
  { timestamps: true }
);

module.exports = mongoose.model("File", fileSchema);
