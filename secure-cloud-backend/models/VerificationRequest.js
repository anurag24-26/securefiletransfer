const mongoose = require("mongoose");

const verificationRequestSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    documentUrl: { type: String, required: true },
    extractedText: { type: String },
    status: {
      type: String,
      enum: ["pending", "approved", "rejected"],
      default: "pending",
    },
    reason: { type: String, default: null },
  },
  { timestamps: true }
);

module.exports = mongoose.model("VerificationRequest", verificationRequestSchema);
