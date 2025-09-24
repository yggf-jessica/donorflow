import mongoose, { Schema, models } from "mongoose";

const UserSchema = new Schema(
  {
    name: { type: String, required: true },
    email: { type: String, unique: true, required: true },
    role: {
      type: String,
      enum: ["DONOR", "RECEIVER", "ADMIN"],
      default: "DONOR",
    },
    status: {
      type: String,
      enum: ["PENDING", "APPROVED", "REJECTED"],
      default: "PENDING", // only meaningful for RECEIVERs
    },
    avatarUrl: String,
    // ✅ Make optional
    passwordHash: { type: String, required: false },
  },
  { timestamps: true }
);

export default models.User || mongoose.model("User", UserSchema);