import { NextResponse } from "next/server";
import { SignJWT } from "jose";

const JWT_SECRET = process.env.JWT_SECRET || "flight_management";

export async function POST(req: Request) {
  try {
    const { email } = await req.json();

    if (!email) {
      return NextResponse.json({ message: "Missing email" }, { status: 400 });
    }

    const secret = new TextEncoder().encode(JWT_SECRET);
    const token = await new SignJWT({ email })
      .setProtectedHeader({ alg: "HS256" })
      .setIssuedAt()
      .setExpirationTime("1h")
      .sign(secret);

    const response = NextResponse.json({ message: "Token created" });

    response.cookies.set("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      path: "/",
      maxAge: 60 * 60, 
    });

    return response;
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Failed to create token";
    return NextResponse.json({ message }, { status: 500 });
  }
}