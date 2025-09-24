import { NextResponse } from "next/server";
import { dbConnect } from "../../../../lib/db";
import User from "../../../../models/User";

export async function GET(req) {
  await dbConnect();
  const { searchParams } = new URL(req.url);
  const status = searchParams.get("status"); // PENDING/APPROVED/REJECTED
  const filter = { role: "RECEIVER" };
  if (status) filter.status = status;
  const receivers = await User.find(filter).sort({ createdAt: -1 }).lean();
  return NextResponse.json({ receivers });
}

export async function PATCH(req) {
  await dbConnect();
  const { id, action } = await req.json(); // action: APPROVE | REJECT
  if (!id || !["APPROVE", "REJECT"].includes(action)) {
    return NextResponse.json({ error: "id and valid action required" }, { status: 400 });
  }
  const status = action === "APPROVE" ? "APPROVED" : "REJECTED";
  const updated = await User.findByIdAndUpdate(id, { status }, { new: true }).lean();
  if (!updated) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json({ receiver: updated });
}