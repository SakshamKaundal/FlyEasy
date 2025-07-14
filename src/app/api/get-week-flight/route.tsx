import { NextResponse } from 'next/server';
import { supabase } from '@/lib/superbaseClient';

interface FlightInfo {
  company_name: string;
  flight_number: string;
}

interface Journey {
  flight_id: string;
  flight_date: string;
  flight_from: string;
  flight_to: string;
  flights: FlightInfo | null;
}

interface FareRule {
  flight_from: string;
  flight_to: string;
  travel_class: string;
  passenger_type: string;
  base_price: number;
}

export async function GET() {
  const today = new Date();
  const upcomingDates: string[] = [];

  for (let i = 0; i < 7; i++) {
    const future = new Date(today);
    future.setDate(today.getDate() + i);
    upcomingDates.push(future.toISOString().split('T')[0]);
  }

  const { data: journeysRaw, error } = await supabase
    .from('journeys')
    .select(`
      flight_id,
      flight_date,
      flight_from,
      flight_to,
      flights:flights!journeys_flight_id_fkey (
        company_name,
        flight_number
      )
    `)
    .in('flight_date', upcomingDates)
    .order('flight_date', { ascending: true });

  if (error || !journeysRaw) {
    return NextResponse.json({ message: 'Failed to fetch flights', error }, { status: 500 });
  }

  const journeys = journeysRaw as unknown as Journey[];

  const { data: fares, error: fareError } = await supabase
    .from('fare_rules')
    .select('flight_from, flight_to, travel_class, passenger_type, base_price')
    .eq('travel_class', 'economy')
    .eq('passenger_type', 'infant');

  if (fareError || !fares) {
    return NextResponse.json({ message: 'Failed to fetch fares', fareError }, { status: 500 });
  }

  const flights = journeys.map((journey) => {
    const fareMatch = fares.find(
      (f: FareRule) =>
        f.flight_from === journey.flight_from &&
        f.flight_to === journey.flight_to
    );

    return {
      flight_id: journey.flight_id,
      date: journey.flight_date,
      from: journey.flight_from,
      to: journey.flight_to,
      fare: fareMatch ? Number(fareMatch.base_price) : null,
      flight_number: journey.flights?.flight_number ?? 'N/A',
      company_name: journey.flights?.company_name ?? 'N/A',
    };
  });

  return NextResponse.json({ flights }, { status: 200 });
}
