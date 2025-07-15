'use server'
import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/superbaseClient';

export async function PATCH(req: NextRequest) {
  const body = await req.json();
  const { passenger_name, flight_id, new_flight_date } = body;

  if (!passenger_name || !flight_id || !new_flight_date) {
    return NextResponse.json(
      { message: 'Missing required fields' },
      { status: 400 }
    );
  }

  const { data: passengerData, error: passengerError } = await supabase
    .from('passengers')
    .select('booking_id')
    .like('name', passenger_name)
    .limit(1);

  if (passengerError || !passengerData?.length) {
    return NextResponse.json(
      { message: 'Passenger not found for the provided name', error: passengerError?.message },
      { status: 404 }
    );
  }

  const bookingId = passengerData[0].booking_id;

  const { data: booking, error: bookingError } = await supabase
    .from('bookings')
    .select('id')
    .eq('id', bookingId)
    .eq('flight_id', flight_id)
    .single();

  if (bookingError || !booking) {
    return NextResponse.json(
      { message: 'Booking not found for given passenger and flight' },
      { status: 404 }
    );
  }

  const { data: updatedBooking, error: updateError } = await supabase
    .from('bookings')
    .update({ flight_date: new_flight_date })
    .eq('id', booking.id)
    .select()
    .single();

  if (updateError) {
    return NextResponse.json(
      { message: 'Failed to update booking date', error: updateError.message },
      { status: 500 }
    );
  }

  return NextResponse.json(
    { message: 'Booking date updated successfully', updatedBooking },
    { status: 200 }
  );
}
