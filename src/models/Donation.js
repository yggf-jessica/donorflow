import mongoose, { Schema, models } from "mongoose";

const DonationSchema = new Schema(
  {
    donor: { type: Schema.Types.ObjectId, ref: "User", required: true },
    campaign: { type: Schema.Types.ObjectId, ref: "Campaign", required: true },
    amount: { type: Number, required: true },
    paymentProvider: { type: String, enum: ["stripe", "omise", "manual"], default: "manual" },
    paymentRef: String,
    status: { type: String, enum: ["SUCCEEDED", "REFUNDED", "FAILED"], default: "SUCCEEDED" },
    receiptUrl: String,
  },
  { timestamps: true }
);

export default models.Donation || mongoose.model("Donation", DonationSchema);