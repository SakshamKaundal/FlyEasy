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

  const { data, error: updateError } = await supabase
    .from('bookings')
    .update({ flight_date: new_flight_date })
    .eq('flight_id', flight.id)
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