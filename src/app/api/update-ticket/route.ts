'use server';
import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/superbaseClient';

export async function PATCH(req: NextRequest) {
  const body = await req.json();
  const { payment_id, flight_number, new_flight_date } = body;

  if (!payment_id || !flight_number || !new_flight_date) {
    return NextResponse.json(
      { message: 'Missing required fields' },
      { status: 400 }
    );
  }

  // 1. Get the flight id from the flight number
  const { data: flight, error: flightError } = await supabase
    .from('flights')
    .select('id')
    .eq('flight_number', flight_number)
    .single();

  if (flightError || !flight) {
    return NextResponse.json(
      { message: 'Flight not found', error: flightError?.message },
      { status: 404 }
    );
  }

  // 2. Find the new journey with the given flight id and new date
  const { data: newJourney, error: journeyError } = await supabase
    .from('journeys')
    .select('id')
    .eq('flight_id', flight.id)
    .eq('flight_date', new_flight_date)
    .single();

  if (journeyError || !newJourney) {
    return NextResponse.json(
      { message: 'No journey found for the selected flight and date', error: journeyError?.message },
      { status: 404 }
    );
  }

  // 3. Update the booking with the new journey id and flight date
  const { data, error: updateError } = await supabase
    .from('bookings')
    .update({ 
      flight_id: newJourney.id, 
      flight_date: new_flight_date, 
      updated_at: new Date().toISOString() 
    })
    .eq('payment_id', payment_id)
    .select();

  if (updateError || !data?.length) {
    return NextResponse.json(
      { message: 'Failed to update flight date', error: updateError?.message },
      { status: 500 }
    );
  }

  return NextResponse.json({ message: 'Flight date updated', updated: data }, { status: 200 });
}