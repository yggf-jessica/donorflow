import { NextResponse } from "next/server";
import { dbConnect } from "../../../../lib/db";
import Campaign from "../../../../models/Campaign";
import mongoose from "mongoose";

export async function GET(req) {
  await dbConnect();
  const { searchParams } = new URL(req.url);
  const status = searchParams.get("status"); // PENDING/APPROVED/REJECTED
  const filter = {};
  if (status) filter.status = status;
  const campaigns = await Campaign.find(filter).sort({ createdAt: -1 }).lean();
  return NextResponse.json({ campaigns });
}

export async function PATCH(req) {
  await dbConnect();
  const { id, action } = await req.json(); // APPROVE | REJECT
  if (!id || !["APPROVE", "REJECT"].includes(action)) {
    return NextResponse.json({ error: "id and valid action required" }, { status: 400 });
  }
  if (!mongoose.isValidObjectId(id)) return NextResponse.json({ error: "Invalid id" }, { status: 400 });
  const status = action === "APPROVE" ? "APPROVED" : "REJECTED";
  const updated = await Campaign.findByIdAndUpdate(id, { status }, { new: true }).lean();
  if (!updated) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json({ campaign: updated });
}

export async function DELETE(req) {
  await dbConnect();
  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");
  if (!id) return NextResponse.json({ error: "id required" }, { status: 400 });
  const deleted = await Campaign.findByIdAndDelete(id).lean();
  if (!deleted) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json({ ok: true });
}