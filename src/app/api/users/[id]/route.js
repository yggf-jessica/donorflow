import { NextResponse } from "next/server";
import { dbConnect } from "../../../../lib/db";
import User from "../../../../models/User";
import mongoose from "mongoose";

export async function PATCH(req, { params }) {
  await dbConnect();
  const { id } = params;
  if (!mongoose.isValidObjectId(id)) {
    return NextResponse.json({ error: "Invalid user id" }, { status: 400 });
  }

  const data = await req.json();
  const allowed = ["name", "email", "avatarUrl"]; // add password hash later
  const update = {};
  for (const k of allowed) if (k in data) update[k] = data[k];

  const user = await User.findByIdAndUpdate(id, update, { new: true }).lean();
  if (!user) return NextResponse.json({ error: "Not found" }, { status: 404 });

  return NextResponse.json({ user }, { status: 200 });
}