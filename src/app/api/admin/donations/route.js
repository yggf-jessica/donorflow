import { NextResponse } from "next/server";
import { dbConnect } from "../../../../lib/db";
import Donation from "../../../../models/Donation";

export async function GET() {
  await dbConnect();
  const donations = await Donation.find({})
    .sort({ createdAt: -1 })
    .populate({ path: "donor", select: "name email" })
    .populate({ path: "campaign", select: "title" })
    .lean();
  return NextResponse.json({ donations });
}