import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/superbaseClient';

export async function POST(req: NextRequest) {
  const { email } = await req.json();

  if (!email) {
    return NextResponse.json({ message: 'Email is required' }, { status: 400 });
  }

  try {
    // Get user
    const { data: user, error: userError } = await supabase
      .from('users')
      .select('id')
      .eq('email', email)
      .maybeSingle();

    if (userError || !user) {
      return NextResponse.json({ message: 'User not found' }, { status: 404 });
    }

    // Get bookings with flights and passengers - now including flight_from, flight_to, flight_date from bookings table
    const { data: bookings, error: bookingsError } = await supabase
      .from('bookings')
      .select(`
        id,
        flight_id,
        payment_id,
        payment_status,
        created_at,
        travel_class,
        total_amount,
        flight_from,
        flight_to,
        flight_date,
        journeys (
          flights (
            id,
            flight_number,
            company_name,
            departure_time,
            arrival_time
          )
        ),
        passengers (
          name,
          age,
          gender,
          seat_number,
          is_primary
        )
      `)
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    if (bookingsError) {
      console.error('Bookings fetch error:', bookingsError);
      return NextResponse.json({ message: 'Failed to fetch bookings' }, { status: 500 });
    }

    if (!bookings || bookings.length === 0) {
      return NextResponse.json({ bookings: [] }, { status: 200 });
    }

    // Transform bookings data - no need for separate journey lookup
    const enrichedBookings = bookings.map(booking => ({
      id: booking.id,
      flight_id: booking.flight_id,
      payment_id: booking.payment_id,
      payment_status: booking.payment_status,
      created_at: booking.created_at,
      travel_class: booking.travel_class,
      total_amount: booking.total_amount,
      flight: booking.journeys.flights,
      journey: {
        flight_from: booking.flight_from,
        flight_to: booking.flight_to,
        flight_date: booking.flight_date
      },
      passengers: booking.passengers || []
    }));

    return NextResponse.json({ bookings: enrichedBookings }, { status: 200 });
    
  } catch (err) {
    console.error('Unexpected error in booking fetch:', err);
    return NextResponse.json({ message: 'Server error' }, { status: 500 });
  }
}