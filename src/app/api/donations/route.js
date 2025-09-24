import { NextResponse } from "next/server";
import { dbConnect } from "../../../lib/db";
import Donation from "../../../models/Donation";
import mongoose from "mongoose";

export async function GET(req) {
  await dbConnect();
  const { searchParams } = new URL(req.url);
  const donorId = searchParams.get("donorId");

  const filter = {};
  if (donorId && mongoose.isValidObjectId(donorId)) {
    filter.donor = donorId;
  } else if (donorId) {
    // ignore invalid donorId to avoid 400 and just return nothing
    return NextResponse.json({ donations: [] }, { status: 200 });
  }

  const donations = await Donation.find(filter)
    .sort({ createdAt: -1 })
    .populate({ path: "campaign", select: "title images" })
    .lean();

  return NextResponse.json({ donations }, { status: 200 });
}