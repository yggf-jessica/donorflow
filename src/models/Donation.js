import mongoose, { Schema, models } from "mongoose";

const DonationSchema = new Schema(
  {
    donor: { type: Schema.Types.ObjectId, ref: "User", required: true },
    campaign: { type: Schema.Types.ObjectId, ref: "Campaign", required: true },
    amount: { type: Number, required: true }, // in Baht (฿)
    paymentProvider: {
      type: String,
      enum: ["stripe", "omise", "manual"],
      default: "manual",
    },
    paymentRef: String,
    status: {
      type: String,
      enum: ["SUCCEEDED", "REFUNDED", "FAILED"],
      default: "SUCCEEDED",
    },
    receiptUrl: String,
  },
  { timestamps: true }
);

// ⚡️ Indexes for faster queries
DonationSchema.index({ donor: 1, createdAt: -1 }); // donor history
DonationSchema.index({ campaign: 1 });             // campaign donations

export default models.Donation || mongoose.model("Donation", DonationSchema);
