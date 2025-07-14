import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/superbaseClient';

export async function POST(req: NextRequest) {
  const { flight_number, travel_class } = await req.json();

  if (!flight_number || !travel_class) {
    return NextResponse.json({ message: 'Missing required fields' }, { status: 400 });
  }

  const { data: flightData, error: flightError } = await supabase
    .from('flights')
    .select('id')
    .eq('flight_number', flight_number)
    .single();

  if (flightError || !flightData) {
    return NextResponse.json({ message: 'Flight not found' }, { status: 404 });
  }

  const flight_id = flightData.id;

  const { data: journeyData, error: journeyError } = await supabase
    .from('journeys')
    .select('flight_from, flight_to')
    .eq('flight_id', flight_id)
    .limit(1)
    .maybeSingle();

  if (journeyError || !journeyData) {
    return NextResponse.json({ message: 'Journey not found for this flight' }, { status: 404 });
  }

  const { flight_from, flight_to } = journeyData;

  const { data: fareData, error: fareError } = await supabase
    .from('fare_rules')
    .select('passenger_type, base_price')
    .eq('flight_from', flight_from)
    .eq('flight_to', flight_to)
    .eq('travel_class', travel_class);

  if (fareError || !fareData) {
    return NextResponse.json({ message: 'Failed to fetch fares' }, { status: 500 });
  }

  const fares = {
    infant: 0,
    child: 0,
    adult: 0,
  };

  for (const entry of fareData) {
    fares[entry.passenger_type as 'infant' | 'child' | 'adult'] = parseFloat(entry.base_price);
  }

  return NextResponse.json({ fares }, { status: 200 });
}
