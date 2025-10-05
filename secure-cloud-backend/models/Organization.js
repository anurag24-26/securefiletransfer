const mongoose = require("mongoose");

const organizationSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    type: {
      type: String,
      enum: ["university", "hospital", "business", "department"],
      required: true,
    },
    parentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Organization",
      default: null,
      validate: {
        validator: async function(value) {
          if (!value) return true; // allow null
          if (value.equals(this._id)) return false; // cannot be own parent
          // Additional: verify referenced org exists
          const org = await this.model("Organization").findById(value);
          return !!org;
        },
        message: "Invalid parent organization",
      },
    },
    joinCode: {
      type: String,
      unique: true,
      sparse: true,
      index: true,
    },
    // Allow multiple admins per organization
    admins: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],
  },
  { timestamps: true }
);

module.exports = mongoose.model("Organization", organizationSchema);
