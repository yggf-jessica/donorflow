import { NextResponse } from "next/server";
import { dbConnect } from "../../../../lib/db";
import Category from "../../../../models/Category";
import mongoose from "mongoose";

export async function PATCH(req, { params }) {
  await dbConnect();
  const { id } = params;
  const { name } = await req.json();

  if (!mongoose.isValidObjectId(id)) {
    return NextResponse.json({ error: "Invalid id" }, { status: 400 });
  }
  if (!name) {
    return NextResponse.json({ error: "Name required" }, { status: 400 });
  }

  const updated = await Category.findByIdAndUpdate(id, { name }, { new: true });
  if (!updated) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json({ category: updated });
}

export async function DELETE(_req, { params }) {
  await dbConnect();
  const { id } = params;

  if (!mongoose.isValidObjectId(id)) {
    return NextResponse.json({ error: "Invalid id" }, { status: 400 });
  }

  await Category.findByIdAndDelete(id);
  return NextResponse.json({ ok: true });
}
