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
      default: null,
      validate: {
        validator: async function (value) {
          if (!value) return true; // allow null
          if (value.equals(this._id)) return false; // cannot be own parent

          // Ensure referenced organization exists
          const org = await this.model("Organization").findById(value);
          return !!org;
        },
        message: "Invalid parent organization",
      },
    },
    joinCode: {
      type: String,
      index: true, // keep it indexed for searching
      default: null,
    },
    admins: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],
    // ✅ Add members array to track users
    members: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],
  },
  { timestamps: true }
);

// Optional: automatically generate a joinCode if missing
organizationSchema.pre("save", function (next) {
  if (!this.joinCode) {
    this.joinCode = Math.random().toString(36).substring(2, 8).toUpperCase();
  }
  next();
});

module.exports = mongoose.model("Organization", organizationSchema);
