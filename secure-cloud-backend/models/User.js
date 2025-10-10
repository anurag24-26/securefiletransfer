const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true },
    passwordHash: { type: String, required: true },
    role: {
      type: String,
      enum: ["superAdmin", "orgAdmin", "deptAdmin", "user"],
      default: "user",
    },
    orgId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Organization",
      default: null,
      index: true,
    },
    joinCode: {
      type: String,
      index: true, // optional for lookup, no unique constraint
      default: null,
    },
    // ✅ User avatar or profile image
    avatar: {
      type: String,
      default: "https://cdn-icons-png.flaticon.com/512/847/847969.png", // fallback default image
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("User", userSchema);
