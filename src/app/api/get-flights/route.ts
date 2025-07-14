import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/superbaseClient';

interface Flights {
  id: string;
  company_name: string;
  flight_number: string;
  departure_time: string;
  arrival_time: string;
}

interface Journey {
  flight_id: string;
  flight_date: string;
  flight_from: string;
  flight_to: string;
  flights: Flights;
}



export async function POST(req: NextRequest) {
  const { from, to, date, returnDate } = await req.json();

  if (!from || !to || !date) {
    return NextResponse.json({ message: 'Missing required fields' }, { status: 400 });
  }

  const travelDates = [date];
  if (returnDate) travelDates.push(returnDate);

  const { data: journeysRaw, error } = await supabase
    .from('journeys')
    .select(`
      flight_id,
      flight_date,
      flight_from,
      flight_to,
      flights:flights!journeys_flight_id_fkey (
        id,
        company_name,
        flight_number,
        departure_time,
        arrival_time
      )
    `)
    .in('flight_date', travelDates)
    .order('flight_date', { ascending: true });

  if (error || !journeysRaw) {
    return NextResponse.json({ message: 'Failed to fetch journeys', error }, { status: 500 });
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

  const allFlights = journeys.map((journey) => {
    const fareMatch = fares.find(
      (f) =>
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
      departure_time: journey.flights?.departure_time ?? 'N/A',
      arrival_time: journey.flights?.arrival_time ?? 'N/A',
    };
  });

  const oneWay = allFlights.filter((f) => f.date === date);
  const returnFlights = returnDate ? allFlights.filter((f) => f.date === returnDate) : [];

  return NextResponse.json({ oneWay, return: returnFlights }, { status: 200 });
}
