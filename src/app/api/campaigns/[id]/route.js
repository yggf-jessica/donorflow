import { NextResponse } from "next/server";
import { dbConnect } from "../../../../lib/db";
import CampaignModel from "../../../../models/Campaign"; // ← alias
import mongoose from "mongoose";

export async function GET(_req, { params }) {
  await dbConnect();
  const { id } = params;
  if (!mongoose.isValidObjectId(id)) {
    return NextResponse.json({ error: "Invalid id" }, { status: 400 });
  }
  const doc = await CampaignModel.findById(id).lean();
  if (!doc) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json({ campaign: doc }, { status: 200 });
}

export async function PATCH(req, { params }) {
  await dbConnect();
  const { id } = params;
  if (!mongoose.isValidObjectId(id)) {
    return NextResponse.json({ error: "Invalid id" }, { status: 400 });
  }
  const data = await req.json();

  const allowed = ["title", "description", "goalAmount", "category", "images", "status"];
  const update = {};
  for (const k of allowed) if (k in data) update[k] = data[k];

  const updated = await CampaignModel.findByIdAndUpdate(id, update, { new: true });
  if (!updated) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json({ campaign: updated }, { status: 200 });
}

export async function DELETE(_req, { params }) {
  await dbConnect();
  const { id } = params;
  if (!mongoose.isValidObjectId(id)) {
    return NextResponse.json({ error: "Invalid id" }, { status: 400 });
  }
  const deleted = await CampaignModel.findByIdAndDelete(id);
  if (!deleted) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json({ ok: true }, { status: 200 });
}