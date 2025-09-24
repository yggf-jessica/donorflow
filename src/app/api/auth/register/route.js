import { NextResponse } from "next/server";
import { dbConnect } from "../../../../lib/db";
import User from "../../../../models/User";

export async function POST(req) {
  try {
    await dbConnect();
    const { name, email, role = "DONOR" } = await req.json();

    if (!email || !name) {
      return NextResponse.json(
        { error: "Name and email are required" },
        { status: 400 }
      );
    }

    if (!["DONOR", "RECEIVER", "ADMIN"].includes(role)) {
      return NextResponse.json({ error: "Invalid role" }, { status: 400 });
    }

    const existing = await User.findOne({ email });
    if (existing) {
      return NextResponse.json(
        { error: "Email already registered" },
        { status: 409 }
      );
    }

    const user = await User.create({
      name,
      email,
      role,
      status: role === "RECEIVER" ? "PENDING" : undefined,
      // passwordHash optional (can be added later with bcrypt)
    });

    return NextResponse.json(
      {
        id: user._id.toString(),
        dbId: user._id.toString(),
        name: user.name,
        email: user.email,
        role: user.role,
        status: user.status,
      },
      { status: 201 }
    );
  } catch (err) {
    console.error("Registration error:", err);
    return NextResponse.json(
      { error: "Server error, please try again later" },
      { status: 500 }
    );
  }
}