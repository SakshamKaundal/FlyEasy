import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/superbaseClient';
import { Passengers } from '@/app/types/application.types';

function generateRandomSeat(existingSeats: Set<string>): string {
  const rows = 'ABCDEFGHIJ';
  const maxColumns = 6;

  let seat;
  do {
    const row = rows[Math.floor(Math.random() * rows.length)];
    const col = Math.floor(Math.random() * maxColumns) + 1;
    seat = `${row}${col}`;
  } while (existingSeats.has(seat));

  existingSeats.add(seat);
  return seat;
}

type RequestBody = {
  user_id: string;
  user_email: string;
  user_name: string;
  flight_id: string;
  payment_id?: string;
  flight_from: string;
  flight_to: string;
  flight_date: string;
  travel_class: 'economy' | 'premium' | 'business';
  total_amount: number;
  passengers: {
    name: string;
    age: string;
    gender: string;
  }[];
};

export async function POST(req: NextRequest) {
  const body: RequestBody = await req.json();
  let { user_id } = body;
  const { 
    user_email, 
    user_name, 
    flight_id, 
    passengers, 
    payment_id,
    flight_from,
    flight_to,
    flight_date,
    travel_class,
    total_amount
  } = body;

  if (!user_id || !user_email || !user_name || !flight_id || !Array.isArray(passengers) || passengers.length === 0 || !flight_from || !flight_to || !flight_date || !travel_class || total_amount === undefined || total_amount === null) {
    return NextResponse.json({ 
      message: 'Missing required fields.',
      received: {
        user_id: !!user_id,
        user_email: !!user_email,
        user_name: !!user_name,
        flight_id: !!flight_id,
        passengers: Array.isArray(passengers) && passengers.length > 0,
        flight_from: !!flight_from,
        flight_to: !!flight_to,
        flight_date: !!flight_date,
        travel_class: !!travel_class,
        total_amount: total_amount !== undefined && total_amount !== null
      }
    }, { status: 400 });
  }

  const { data: existingUserById } = await supabase
    .from('users')
    .select('id')
    .eq('id', user_id)
    .single();

  const { data: existingUserByEmail } = await supabase
    .from('users')
    .select('id')
    .eq('email', user_email)
    .single();

  if (!existingUserById && !existingUserByEmail) {
    const { error: insertUserError } = await supabase.from('users').insert([{
      id: user_id,
      email: user_email,
      name: user_name,
      is_admin: false,
    }]);

    if (insertUserError) {
      return NextResponse.json({
        message: 'Failed to create user in public.users',
        error: insertUserError.message,
      }, { status: 500 });
    }
  } else if (!existingUserById && existingUserByEmail) {
    user_id = existingUserByEmail.id;
  }

  const { data: booking, error: bookingError } = await supabase
    .from('bookings')
    .insert({
      user_id,
      flight_id,
      payment_id: payment_id || null,
      payment_status: true,
      flight_from,
      flight_to,
      flight_date,
      travel_class,
      total_amount,
    })
    .select()
    .single();

  if (bookingError || !booking) {
    return NextResponse.json({
      message: 'Failed to create booking',
      error: bookingError?.message,
    }, { status: 500 });
  }

  const allocatedSeats = new Set<string>();
  const passengerRows: Omit<Passengers, 'id'>[] = passengers.map((p, index) => ({
    booking_id: booking.id,
    name: p.name,
    age: parseInt(p.age, 10),
    gender: p.gender,
    seat_number: generateRandomSeat(allocatedSeats),
    is_primary: index === 0,
  }));

  const { error: passengerError } = await supabase
    .from('passengers')
    .insert(passengerRows);

  if (passengerError) {
    return NextResponse.json({
      message: 'Failed to save passengers',
      error: passengerError.message,
    }, { status: 500 });
  }

  return NextResponse.json({
    message: 'Booking successful',
    booking_id: booking.id,
  }, { status: 200 });
}