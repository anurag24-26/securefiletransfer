const mongoose = require("mongoose");

const fileSchema = new mongoose.Schema(
  {
    filename: { type: String, required: true }, // stored file name
    originalName: { type: String, required: true }, // uploaded file original name
    orgId: { type: mongoose.Schema.Types.ObjectId, ref: "Organization", required: true, index: true },
    uploadedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    sharedWith: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
    encrypted: { type: Boolean, default: true },
    expiryDate: { type: Date, index: true },
  },
  { timestamps: true }
);
module.exports = mongoose.model("File", fileSchema);

