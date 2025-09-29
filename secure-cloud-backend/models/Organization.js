const mongoose = require("mongoose");

const organizationSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    type: {
      type: String,
      enum: ["university", "hospital", "business", "department"],
      required: true,
    },
    parentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Organization",
      default: null, // root org has null
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Organization", organizationSchema);
