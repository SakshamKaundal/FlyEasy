import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/superbaseClient";

export async function POST(req: NextRequest) {
  try {
    if (req.method !== "POST") {
      return NextResponse.json({ message: "Method not allowed" }, { status: 405 });
    }

    const { from, to, travel_class } = await req.json();

    if (!from || !to || !travel_class) {
      return NextResponse.json({ message: "Missing required fields" }, { status: 400 });
    }

    const { data, error } = await supabase
      .from("fare_rules")
      .select("base_price")
      .eq("flight_from", from)
      .eq("flight_to", to)
      .eq("travel_class", travel_class)
      .eq("passenger_type", "adult") 
      .maybeSingle();

    if (error) {
      console.error("Error fetching fare:", error);
      return NextResponse.json({ message: "Failed to fetch fare" }, { status: 500 });
    }

    if (!data) {
      return NextResponse.json({ message: "Class does not exist on that flight", fare: null }, { status: 200 });
    }

    return NextResponse.json({ fare: data.base_price }, { status: 200 });
  } catch {
    return NextResponse.json({ message: "Something went wrong" }, { status: 500 });
  }
}