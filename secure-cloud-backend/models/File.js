import mongoose from "mongoose";

const fileSchema = new mongoose.Schema(
  {
    filename: { type: String, required: true }, // stored name on server
    originalName: { type: String, required: true }, // original uploaded name
    orgId: { type: mongoose.Schema.Types.ObjectId, ref: "Organization", required: true },
    uploadedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    encrypted: { type: Boolean, default: true },
    expiryDate: { type: Date }, // optional expiry
  },
  { timestamps: true }
);

export default mongoose.model("File", fileSchema);
