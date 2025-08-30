import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/superbaseClient";

function capitalizeFirstLetter(str: string) {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  let { from, to, travel_class, passenger_type } = body;

  console.log("Received fare request:", { from, to, travel_class, passenger_type });

  if (!from || !to || !travel_class) {
    return NextResponse.json({ message: "Missing required fields" }, { status: 400 });
  }

  // Capitalize the first letter of travel_class and passenger_type
  travel_class = capitalizeFirstLetter(travel_class);
  passenger_type = capitalizeFirstLetter(passenger_type ?? 'adult');

  console.log("Querying with:", { from, to, travel_class, passenger_type });

  const { data, error } = await supabase
    .from("fare_rules")
    .select("base_price")
    .eq("flight_from", from)
    .eq("flight_to", to)
    .eq("travel_class", travel_class)
    .eq("passenger_type", passenger_type)
    .limit(1)
    .maybeSingle();

  if (error) {
    console.error("Supabase error:", error);
  }

  if (!data) {
    console.log("No fare rule found for the given criteria.");
    return NextResponse.json({
      message: "Class does not exist on that flight",
      fare: null
    }, { status: 200 });
  }

  console.log("Found fare:", data.base_price);
  return NextResponse.json({ fare: data.base_price }, { status: 200 });
}
