// app/api/categories/route.js
import { NextResponse } from "next/server";
import { dbConnect } from "../../../lib/db";
import Category from "../../../models/Category";

export async function GET() {
  await dbConnect();
  const categories = await Category.find().sort({ name: 1 }).lean();
  return NextResponse.json({ categories });
}

export async function POST(req) {
  await dbConnect();
  const { name } = await req.json();
  if (!name) return NextResponse.json({ error: "Name required" }, { status: 400 });

  try {
    const cat = await Category.create({ name }); // slug auto-fills in pre-save
    return NextResponse.json({ category: cat }, { status: 201 });
  } catch (err) {
    if (err?.code === 11000) {
      return NextResponse.json({ error: "Category already exists" }, { status: 409 });
    }
    console.error("Create category error:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}