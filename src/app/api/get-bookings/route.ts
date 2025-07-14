import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/superbaseClient';

export async function POST(req: NextRequest) {
  const { email } = await req.json();

  if (!email) {
    return NextResponse.json({ message: 'Email is required' }, { status: 400 });
  }

  try {
    // ✅ Step 1: Get user
    const { data: user, error: userError } = await supabase
      .from('users')
      .select('id')
      .eq('email', email)
      .maybeSingle();

    if (userError || !user) {
      return NextResponse.json({ message: 'User not found' }, { status: 404 });
    }

    // ✅ Step 2: Fetch bookings with joined flights and passengers only
    const { data: bookings, error: bookingsError } = await supabase
      .from('bookings')
      .select(`
        id,
        payment_status,
        payment_id,
        created_at,
        flight_id,
        flights (
          flight_number,
          company_name,
          departure_time,
          arrival_time
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
      console.error('Error fetching bookings:', bookingsError.message);
      return NextResponse.json({ message: 'Failed to fetch bookings' }, { status: 500 });
    }

    return NextResponse.json({ bookings }, { status: 200 });
  } catch (err) {
    console.error('Unexpected error in booking fetch:', err);
    return NextResponse.json({ message: 'Server error' }, { status: 500 });
  }
}
