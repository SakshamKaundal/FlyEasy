'use server';

import { NextResponse } from "next/server";
import { supabase } from "@/lib/superbaseClient";

export async function POST(req: Request) {
  try {
    const { email, password } = await req.json();

    if (!email || !password) {
      return NextResponse.json({ message: "Email and password are required" }, { status: 400 });
    }

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      if (error.message === "Email not confirmed") {
        return NextResponse.json({ message: "Please verify your email before logging in." }, { status: 401 });
      }
      return NextResponse.json({ message: error.message }, { status: 401 });
    }

    return NextResponse.json({ message: "Login successful", user: data.user }, { status: 200 });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Login failed";
    return NextResponse.json({ message }, { status: 500 });
  }
}
