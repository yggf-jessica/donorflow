import mongoose, { Schema, models } from "mongoose";

const CategorySchema = new Schema(
  {
    name: { type: String, required: true, unique: true, trim: true },
    // ✅ NOT required; will be auto-generated if missing
    slug: { type: String, unique: true, sparse: true, trim: true },
  },
  { timestamps: true }
);

// Auto-generate slug from name if not provided
CategorySchema.pre("save", function (next) {
  if (!this.slug && this.name) {
    this.slug = this.name
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)+/g, "");
  }
  next();
});

export default models.Category || mongoose.model("Category", CategorySchema);