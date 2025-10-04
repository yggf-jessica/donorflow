import { NextResponse } from "next/server";
import { dbConnect } from "../../../lib/db";
import CampaignModel from "../../../models/Campaign";
import User from "../../../models/User";
import mongoose from "mongoose";

/* =========================
   GET /api/campaigns
   ========================= */
export async function GET(req) {
  await dbConnect();

  const { searchParams } = new URL(req.url);
  const receiverId = searchParams.get("receiverId");
  const receiverEmail = searchParams.get("receiverEmail");
  const q = searchParams.get("q")?.trim();
  const category = searchParams.get("category");
  const status = searchParams.get("status");

  const filter = {};

  if (receiverId && mongoose.isValidObjectId(receiverId)) {
    filter.receiver = receiverId;
  } else if (receiverEmail) {
    const usr = await User.findOne({ email: receiverEmail })
      .select("_id")
      .lean();
    if (usr?._id) filter.receiver = usr._id;
  }

  if (category && category !== "All") filter.category = category;
  if (status) filter.status = status;

  if (q) {
    filter.$or = [
      { title: { $regex: q, $options: "i" } },
      { description: { $regex: q, $options: "i" } },
      { category: { $regex: q, $options: "i" } },
    ];
  }

  const campaigns = await CampaignModel.find(filter)
    .sort({ createdAt: -1 })
    .lean();

  return NextResponse.json({ campaigns }, { status: 200 });
}

/* =========================
   POST /api/campaigns
   ========================= */
export async function POST(req) {
  await dbConnect();

  const body = await req.json();
  const {
    title,
    description = "",
    goalAmount,
    category = "General",
    images = [],
    receiverId,
    receiverEmail,
  } = body;

  if (!title || !goalAmount) {
    return NextResponse.json(
      { error: "title and goalAmount are required" },
      { status: 400 }
    );
  }

  let receiver = null;

  if (receiverId && mongoose.isValidObjectId(receiverId)) {
    receiver = receiverId;
  } else if (receiverEmail) {
    const usr = await User.findOne({ email: receiverEmail })
      .select("_id")
      .lean();
    if (usr?._id) receiver = usr._id.toString();
  }

  if (!receiver) {
    return NextResponse.json(
      { error: "Valid receiverId (ObjectId) or receiverEmail is required" },
      { status: 400 }
    );
  }

  const doc = await CampaignModel.create({
    title,
    description,
    goalAmount: Number(goalAmount),
    category,
    images,
    receiver,
    raisedAmount: 0,
    status: "PENDING",
  });

  const created = await CampaignModel.findById(doc._id).lean();
  return NextResponse.json({ campaign: created }, { status: 201 });
}
