import { NextResponse } from "next/server";
import { dbConnect } from "../../../../lib/db";
import User from "../../../../models/User";

export async function POST(req) {
  await dbConnect();
  const { email, name, role = "DONOR" } = await req.json();

  if (!email) return NextResponse.json({ error: "Email required" }, { status: 400 });
  if (!["DONOR","RECEIVER","ADMIN"].includes(role)) {
    return NextResponse.json({ error: "Invalid role" }, { status: 400 });
  }

  let user = await User.findOne({ email });
  if (!user) {
    user = await User.create({
      email,
      name: name || email.split("@")[0],
      role,
      status: role === "RECEIVER" ? "PENDING" : undefined
    });
  } else {
    if (user.role !== role) {
      user.role = role;
      if (role === "RECEIVER" && user.status !== "APPROVED") user.status = "PENDING";
      await user.save();
    }
  }

  return NextResponse.json({
    id: user._id.toString(),
    name: user.name,
    email: user.email,
    role: user.role,
    status: user.status
  });
}