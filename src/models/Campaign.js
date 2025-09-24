import mongoose, { Schema, models } from "mongoose";

const CampaignSchema = new Schema(
  {
    title: { type: String, required: true },
    description: String,
    goalAmount: { type: Number, required: true },
    raisedAmount: { type: Number, default: 0 },
    status: {
      type: String,
      enum: ["DRAFT", "PENDING", "APPROVED", "REJECTED", "ARCHIVED"],
      default: "PENDING",
    },
    images: [String],
    category: { type: String }, // or ref to Category
    receiver: { type: Schema.Types.ObjectId, ref: "User", required: true },
    startDate: Date,
    endDate: Date,
  },
  { timestamps: true }
);

export default models.Campaign || mongoose.model("Campaign", CampaignSchema);