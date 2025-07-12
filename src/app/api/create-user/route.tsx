'use server';

import { NextResponse } from "next/server";
import { supabase } from "@/lib/superbaseClient";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { email, password, name } = body;

    if (!email || !password || !name) {
      return NextResponse.json({ message: "Missing fields" }, { status: 400 });
    }

    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password,
    });

    if (authError || !authData.user) {
      throw authError || new Error("Signup failed");
    }

    const userId = authData.user.id;

    const { error: userError } = await supabase.from("users").insert([
      {
        id: userId,
        email,
        name,
        is_admin: false,
      },
    ]);

    if (userError) throw userError;

    return NextResponse.json({ message: "Signup successful" }, { status: 200 });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Something went wrong";
    console.error(err);
    return NextResponse.json({ message }, { status: 500 });
  }
}
