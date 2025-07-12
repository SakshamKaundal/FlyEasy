import { NextResponse } from "next/server";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "flight_management";

export async function POST(req: Request) {
  try {
    const { email } = await req.json();

    if (!email) {
      return NextResponse.json({ message: "Missing email" }, { status: 400 });
    }

    const token = jwt.sign({ email }, JWT_SECRET, { expiresIn: "1h" });

    const response = NextResponse.json({ message: "Token created" });

    response.cookies.set("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      path: "/",
      maxAge: 60 * 60, // 1 hour
    });

    return response;
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Failed to create token";
    return NextResponse.json({ message }, { status: 500 });
  }
}
