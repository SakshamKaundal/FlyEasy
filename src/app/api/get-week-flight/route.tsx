import { NextRequest, NextResponse } from 'next/server';
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

interface RequestBody {
  from: string;
  to: string;
  outboundDate: string;
  returnDate: string;
}

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as RequestBody;
    const { from, to, outboundDate, returnDate } = body;

    if (!from || !to || !outboundDate || !returnDate) {
      return NextResponse.json({ message: 'Missing required search parameters.' }, { status: 400 });
    }

    const searchDates = [outboundDate, returnDate];

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
      .in('flight_date', searchDates)
      .eq('flight_from', from)
      .eq('flight_to', to)
      .order('flight_date', { ascending: true });

    if (error || !journeysRaw) {
      throw new Error(error?.message || 'Failed to fetch journeys.');
    }

    const journeys = journeysRaw as unknown as Journey[];

    const { data: fares, error: fareError } = await supabase
      .from('fare_rules')
      .select('flight_from, flight_to, travel_class, passenger_type, base_price')
      .eq('travel_class', 'economy')
      .eq('passenger_type', 'infant');

    if (fareError || !fares) {
      throw new Error(fareError?.message || 'Failed to fetch fares.');
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
  } catch (err) {
    const error = err as Error;
    return NextResponse.json({ message: 'Server Error', error: error.message }, { status: 500 });
  }
}
