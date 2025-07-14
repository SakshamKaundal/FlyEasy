'use client';

import { useEffect, useState } from 'react';
import { ArrowRight } from 'lucide-react';
import { getRandomHexColor } from '@/lib/utils';
import { useUserInformation } from '@/components/context-api/save-user-context';

interface Booking {
  id: string;
  flight_id: string;
  payment_id: string;
  payment_status: boolean;
  created_at: string;
  travel_class: 'economy' | 'premium' | 'business';
  flights: {
    flight_number: string;
    company_name: string;
    departure_time: string;
    arrival_time: string;
  };
  passengers: {
    name: string;
    age: number;
    gender: string;
    seat_number?: string;
    is_primary: boolean;
  }[];
  journeys?: {
    flight_from: string;
    flight_to: string;
    flight_date: string;
  };
}

const BookingCard = () => {
  const { user } = useUserInformation();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchBookings = async () => {
      if (!user?.email) return;
      try {
        const res = await fetch('/api/get-bookings', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email: user.email }),
        });

        const data = await res.json();
        if (res.ok && Array.isArray(data.bookings)) {
          setBookings(data.bookings);
        } else {
          console.warn('No bookings found');
        }
      } catch (err) {
        console.error('Failed to fetch bookings:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchBookings();
  }, [user?.email]);

  if (loading) return <p className="text-center mt-4">Loading your bookings...</p>;

  if (!bookings.length) {
    return <p className="text-center mt-4 text-gray-500">No bookings found.</p>;
  }

  return (
    <div className="space-y-4 mt-4">
      {bookings.map((booking) => {
        const from = booking.journeys?.flight_from || 'N/A';
        const to = booking.journeys?.flight_to || 'N/A';
        const flight = booking.flights;
        const passengerCount = booking.passengers?.length || 0;

        return (
          <div
            key={booking.id}
            className="bg-white border shadow rounded-xl overflow-hidden transition-all transform hover:shadow-lg hover:border-l-4 hover:border-l-green-500 w-full"
          >
            <div className="px-4 py-3 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 min-w-0">
              <div className="flex flex-col sm:flex-row sm:items-center gap-4 w-full min-w-0">
                <div className="flex items-center gap-3 flex-shrink-0">
                  <div
                    className="w-10 h-10 rounded-full flex items-center justify-center text-sm font-semibold text-white"
                    style={{ background: getRandomHexColor() }}
                  >
                    {(flight.company_name || 'U')
                      .split(' ')
                      .map((w) => w[0])
                      .join('')
                      .toUpperCase()}
                  </div>
                  <div className="flex flex-col min-w-0">
                    <p className="text-xs text-gray-700 font-semibold">Booking</p>
                    <p className="text-sm font-bold text-gray-800 truncate">
                      {flight.flight_number}
                    </p>
                    <p className="text-xs text-gray-600 italic truncate">
                      {new Date(booking.created_at).toLocaleDateString()}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 flex-grow min-w-0">
                  <div className="flex flex-col items-start">
                    <p className="text-sm font-medium">{from}</p>
                    <p className="text-xs text-gray-500">{flight.departure_time}</p>
                  </div>
                  <ArrowRight className="w-4 h-4 text-gray-500" />
                  <div className="flex flex-col items-start">
                    <p className="text-sm font-medium">{to}</p>
                    <p className="text-xs text-gray-500">{flight.arrival_time}</p>
                  </div>
                </div>

                <div className="flex items-center justify-between gap-2">
                  <div className="text-right">
                    <p className="text-xs text-gray-500">Class</p>
                    <p className="text-sm font-semibold capitalize">{booking.travel_class}</p>
                    <p className="text-xs text-gray-400 mt-1">
                      {passengerCount} Passenger{passengerCount > 1 ? 's' : ''}
                    </p>
                    <p className="text-base font-bold text-black italic mt-1">₹--</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default BookingCard;
