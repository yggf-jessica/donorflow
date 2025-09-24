import { NextResponse } from "next/server";
import { dbConnect } from "../../../../../lib/db";
import Campaign from "../../../../../models/Campaign";
import Donation from "../../../../../models/Donation";
import mongoose from "mongoose";

export async function POST(req, { params }) {
  await dbConnect();
  const { id } = params;

  if (!mongoose.isValidObjectId(id)) {
    return NextResponse.json({ error: "Invalid campaign id" }, { status: 400 });
  }

  const { amount, donorId, provider = "manual", paymentRef } = await req.json();
  const amt = Number(amount);
  if (!Number.isFinite(amt) || amt <= 0) {
    return NextResponse.json({ error: "Invalid amount" }, { status: 400 });
  }

  // 1) increment raisedAmount
  const campaign = await Campaign.findByIdAndUpdate(
    id,
    { $inc: { raisedAmount: amt } },
    { new: true }
  );
  if (!campaign) return NextResponse.json({ error: "Campaign not found" }, { status: 404 });

  // 2) create Donation record (only if donorId valid)
  if (donorId && mongoose.isValidObjectId(donorId)) {
    await Donation.create({
      donor: donorId,
      campaign: campaign._id,
      amount: amt,
      paymentProvider: provider,
      paymentRef,
      status: "SUCCEEDED",
    });
  }

  return NextResponse.json({ campaign }, { status: 200 });
}