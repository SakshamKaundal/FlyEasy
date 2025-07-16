"use server";

import { supabase } from "@/lib/superbaseClient";

// Type Definitions
interface RouteStats {
  flight_from: string;
  flight_to: string;
  trip_count: number;
  total_revenue: number;
}

interface GenderStat {
  gender: string;
  count: number;
}

interface BookingTrend {
  month: string;
  booking_count: number;
}

interface BookingWithAmount {
  id: string;
  user_id: string;
  flight_id: string;
  payment_status: boolean;
  payment_id: string | null;
  created_at: string;
  updated_at: string;
  flight_from: string;
  flight_to: string;
  flight_date: string;
  travel_class: string;
  total_amount: number;
}

export async function getDashboardStats(): Promise<{
  topRoutes: RouteStats[];
  totalEarnings: number;
  genderStats: GenderStat[];
  bookingTrends: BookingTrend[];
}> {
  try {
    const { data: bookingsData, error: bookingsError } = await supabase
      .from('bookings')
      .select('flight_from, flight_to, total_amount')
      .not('flight_from', 'is', null)
      .not('flight_to', 'is', null)
      .not('total_amount', 'is', null);

    if (bookingsError) throw new Error(bookingsError.message);

    const routeMap = new Map<string, { count: number; revenue: number }>();
    
    bookingsData?.forEach((booking) => {
      const route = `${booking.flight_from}-${booking.flight_to}`;
      const existing = routeMap.get(route) || { count: 0, revenue: 0 };
      routeMap.set(route, {
        count: existing.count + 1,
        revenue: existing.revenue + Number(booking.total_amount)
      });
    });

    const topRoutes: RouteStats[] = Array.from(routeMap.entries())
      .map(([route, stats]) => {
        const [flight_from, flight_to] = route.split('-');
        return {
          flight_from,
          flight_to,
          trip_count: stats.count,
          total_revenue: stats.revenue
        };
      })
      .sort((a, b) => b.trip_count - a.trip_count)
      .slice(0, 4);

    const { data: earningsData, error: earningsError } = await supabase
      .from('bookings')
      .select('total_amount')
      .not('total_amount', 'is', null);

    if (earningsError) throw new Error(earningsError.message);
    
    const totalEarnings = earningsData?.reduce(
      (acc, cur) => acc + Number(cur.total_amount),
      0
    ) || 0;

    const { data: rawGenderData, error: genderError } = await supabase
      .from('passengers')
      .select('gender')
      .not('gender', 'is', null);

    if (genderError) throw new Error(genderError.message);
    
    const genderCountMap: Record<string, number> = {};
    rawGenderData?.forEach((p) => {
      const gender = p.gender as string;
      genderCountMap[gender] = (genderCountMap[gender] || 0) + 1;
    });
    
    const genderStats: GenderStat[] = Object.entries(genderCountMap).map(
      ([gender, count]) => ({ gender, count })
    );

    const { data: bookingsByMonth, error: trendError } = await supabase
      .from('bookings')
      .select('created_at')
      .not('created_at', 'is', null);

    if (trendError) throw new Error(trendError.message);

    const monthMap = new Map<string, number>();
    
    bookingsByMonth?.forEach((booking) => {
      const date = new Date(booking.created_at);
      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      monthMap.set(monthKey, (monthMap.get(monthKey) || 0) + 1);
    });

    const bookingTrends: BookingTrend[] = Array.from(monthMap.entries())
      .map(([month, booking_count]) => ({ month, booking_count }))
      .sort((a, b) => a.month.localeCompare(b.month));

    return {
      topRoutes,
      totalEarnings,
      genderStats,
      bookingTrends,
    };
  } catch (error) {
    console.error('Error fetching dashboard stats:', error);
    throw error;
  }
}