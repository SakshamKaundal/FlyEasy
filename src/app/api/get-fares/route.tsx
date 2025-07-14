import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/superbaseClient";

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { from, to, travel_class, passenger_type = "infant" } = body;

  if (!from || !to || !travel_class) {
    return NextResponse.json({ message: "Missing required fields" }, { status: 400 });
  }

  const { data, error } = await supabase
    .from("fare_rules")
    .select("base_price")
    .eq("flight_from", from)
    .eq("flight_to", to)
    .eq("travel_class", travel_class)
    .eq("passenger_type", passenger_type)
    .limit(1)
    .maybeSingle();

  if (!data) {
    return NextResponse.json({
      message: "Class does not exist on that flight",
      fare: error
    }, { status: 200 });
  }

  return NextResponse.json({ fare: data.base_price }, { status: 200 });
}
