"use client";

import { useEffect, useState } from 'react';
import { ArrowRight, ChevronDown, ChevronUp, User, Calendar, CreditCard } from 'lucide-react';
import { getRandomHexColor } from '@/lib/utils';
import CalendarPopup from '@/app/updateCalendar';

interface Booking {
  id: string;
  flight_id: string;
  payment_id: string;
  payment_status: boolean;
  created_at: string;
  travel_class: 'economy' | 'premium' | 'business' | null;
  total_amount: number | null;
  flight: {
    id: string;
    flight_number: string;
    company_name: string;
    departure_time: string;
    arrival_time: string;
  } | null;
  journey: {
    flight_from: string;
    flight_to: string;
    flight_date: string;
  } | null;
  passengers: {
    name: string;
    age: number;
    gender: string;
    seat_number?: string;
    is_primary: boolean;
  }[];
}

const BookingCard = () => {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedBookings, setExpandedBookings] = useState<Set<string>>(new Set());
  const [calendarOpen, setCalendarOpen] = useState<boolean>(false);
  const [activeBookingId, setActiveBookingId] = useState<string | null>(null);
  const [updateLoading, setUpdateLoading] = useState(false);

  useEffect(() => {
    const fetchBookings = async () => {
      // Get email from localStorage instead of context API
      const userEmail = localStorage.getItem('email');
      
      if (!userEmail) {
        console.warn('No email found in localStorage');
        setLoading(false);
        return;
      }

      try {
        const res = await fetch('/api/get-bookings', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email: userEmail }),
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
  }, []);

  const toggleExpanded = (bookingId: string) => {
    setExpandedBookings(prev => {
      const newSet = new Set(prev);
      if (newSet.has(bookingId)) {
        newSet.delete(bookingId);
      } else {
        newSet.add(bookingId);
      }
      return newSet;
    });
  };

const handleDateUpdate = async (newDate: Date) => {
  if (!activeBookingId) return;

  const formattedDate = `${newDate.getFullYear()}-${String(newDate.getMonth() + 1).padStart(2, '0')}-${String(newDate.getDate()).padStart(2, '0')}`;

  setUpdateLoading(true);
  try {
    const activeBooking = bookings.find(b => b.id === activeBookingId);
    if (!activeBooking) throw new Error('Booking not found');

    const response = await fetch('/api/update-ticket', {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        payment_id: activeBooking.payment_id,
        flight_number: activeBooking.flight?.flight_number,
        new_flight_date: formattedDate,
      }),
    });

    const result = await response.json();

    if (response.ok) {
      setBookings(prev => prev.map(b =>
        b.id === activeBookingId
          ? {
              ...b,
              journey: {
                ...b.journey!,
                flight_date: formattedDate, // ✅ use the same fixed value here
              },
            }
          : b
      ));
      alert('Flight date updated successfully!');
    } else {
      throw new Error(result.message || 'Failed to update flight date');
    }
  } catch (error) {
    console.error('Error updating flight date:', error);
    alert('Failed to update flight date. Please try again.');
  } finally {
    setUpdateLoading(false);
    setCalendarOpen(false);
    setActiveBookingId(null);
  }
};


  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const formatTime = (timeString: string) => {
    if (!timeString) return '--:--';
    return new Date(`2000-01-01T${timeString}`).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });
  };

  if (loading) return <p className="text-center mt-4">Loading your bookings...</p>;

  if (!bookings.length) {
    return <p className="text-center mt-4 text-gray-500">No bookings found.</p>;
  }

  return (
    <div className="space-y-4 mt-4">
      {/* Common heading for all bookings */}
      <h2 className="text-2xl font-bold text-gray-900 mb-6">Your Bookings</h2>
      
      {bookings.map((booking) => {
        const from = booking.journey?.flight_from || 'N/A';
        const to = booking.journey?.flight_to || 'N/A';
        const flight = booking.flight;
        const passengerCount = booking.passengers?.length || 0;
        const isExpanded = expandedBookings.has(booking.id);

        return (
          <div
            key={booking.id}
            className="bg-white border shadow rounded-xl overflow-hidden transition-all transform hover:shadow-lg hover:border-l-4 hover:border-l-green-500 w-full"
          >
            <div className="px-4 py-3">
              <div className="block sm:hidden">
                <div className="flex items-center justify-between gap-4 mb-4">
                  <div className="flex items-center gap-3 flex-shrink-0">
                    <div
                      className="w-10 h-10 rounded-full flex items-center justify-center text-sm font-semibold text-white"
                      style={{ background: getRandomHexColor() }}
                    >
                      {(flight?.company_name || 'U')
                        .split(' ')
                        .map((w) => w[0])
                        .join('')
                        .toUpperCase()}
                    </div>
                    <div className="flex flex-col min-w-0">
                      <p className="text-sm font-bold text-gray-800 truncate">
                        {flight?.flight_number || 'Unknown'}
                      </p>
                      <p className="text-xs text-gray-600 italic truncate">
                        {formatDate(booking.created_at)}
                      </p>
                    </div>
                  </div>

                  <button
                    onClick={() => toggleExpanded(booking.id)}
                    className="flex items-center justify-center w-8 h-8 rounded-full hover:bg-gray-100 transition-colors flex-shrink-0"
                    aria-label={isExpanded ? 'Collapse details' : 'Expand details'}
                  >
                    {isExpanded ? (
                      <ChevronUp className="w-5 h-5 text-gray-600" />
                    ) : (
                      <ChevronDown className="w-5 h-5 text-gray-600" />
                    )}
                  </button>
                </div>

                <div className="flex items-center justify-between gap-4">
                  <div className="flex items-center gap-2 flex-grow min-w-0">
                    <div className="flex flex-col items-start">
                      <p className="text-sm font-medium">{from}</p>
                      <p className="text-xs text-gray-500">{formatTime(flight?.departure_time || '')}</p>
                    </div>
                    <ArrowRight className="w-4 h-4 text-gray-500" />
                    <div className="flex flex-col items-start">
                      <p className="text-sm font-medium">{to}</p>
                      <p className="text-xs text-gray-500">{formatTime(flight?.arrival_time || '')}</p>
                    </div>
                  </div>

                  <div className="text-right flex-shrink-0">
                    <p className="text-xs text-gray-500">Class</p>
                    <p className="text-sm font-semibold capitalize">
                      {booking.travel_class || 'N/A'}
                    </p>
                    <p className="text-xs text-gray-400 mt-1">
                      {passengerCount} Passenger{passengerCount > 1 ? 's' : ''}
                    </p>
                    <p className="text-base font-bold text-black italic mt-1">
                      ₹{booking.total_amount || '--'}
                    </p>
                  </div>
                </div>
              </div>

              <div className="hidden sm:flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 min-w-0">
                <div className="flex flex-col sm:flex-row sm:items-center gap-4 w-full min-w-0">
                  <div className="flex items-center gap-3 flex-shrink-0">
                    <div
                      className="w-10 h-10 rounded-full flex items-center justify-center text-sm font-semibold text-white"
                      style={{ background: getRandomHexColor() }}
                    >
                      {(flight?.company_name || 'U')
                        .split(' ')
                        .map((w) => w[0])
                        .join('')
                        .toUpperCase()}
                    </div>
                    <div className="flex flex-col min-w-0">
                      <p className="text-sm font-bold text-gray-800 truncate">
                        {flight?.flight_number || 'Unknown'}
                      </p>
                      <p className="text-xs text-gray-600 italic truncate">
                        {formatDate(booking.created_at)}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 flex-grow min-w-0">
                    <div className="flex flex-col items-start">
                      <p className="text-sm font-medium">{from}</p>
                      <p className="text-xs text-gray-500">{formatTime(flight?.departure_time || '')}</p>
                    </div>
                    <ArrowRight className="w-4 h-4 text-gray-500" />
                    <div className="flex flex-col items-start">
                      <p className="text-sm font-medium">{to}</p>
                      <p className="text-xs text-gray-500">{formatTime(flight?.arrival_time || '')}</p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between gap-2">
                    <div className="text-right">
                      <p className="text-xs text-gray-500">Class</p>
                      <p className="text-sm font-semibold capitalize">
                        {booking.travel_class || 'N/A'}
                      </p>
                      <p className="text-xs text-gray-400 mt-1">
                        {passengerCount} Passenger{passengerCount > 1 ? 's' : ''}
                      </p>
                      <p className="text-base font-bold text-black italic mt-1">
                        ₹{booking.total_amount || '--'}
                      </p>
                    </div>
                  </div>
                </div>

                <button
                  onClick={() => toggleExpanded(booking.id)}
                  className="flex items-center justify-center w-8 h-8 rounded-full hover:bg-gray-100 transition-colors flex-shrink-0"
                  aria-label={isExpanded ? 'Collapse details' : 'Expand details'}
                >
                  {isExpanded ? (
                    <ChevronUp className="w-5 h-5 text-gray-600" />
                  ) : (
                    <ChevronDown className="w-5 h-5 text-gray-600" />
                  )}
                </button>
              </div>
            </div>

            {isExpanded && (
              <div className="px-4 pb-4 border-t bg-gray-50">
                <div className="pt-4 space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <h4 className="font-semibold text-gray-800 flex items-center gap-2">
                        <Calendar className="w-4 h-4" />
                        Flight Details
                      </h4>
                      <div className="space-y-1 text-sm">
                        <p><span className="font-medium">Flight Date:</span> {formatDate(booking.journey?.flight_date || '')}</p>
                        <p><span className="font-medium">Company:</span> {flight?.company_name || 'N/A'}</p>
                        <p><span className="font-medium">Flight Number:</span> {flight?.flight_number || 'N/A'}</p>
                        <p><span className="font-medium">Travel Class:</span> <span className="capitalize">{booking.travel_class || 'N/A'}</span></p>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <h4 className="font-semibold text-gray-800 flex items-center gap-2">
                        <CreditCard className="w-4 h-4" />
                        Payment Details
                      </h4>
                      <div className="space-y-1 text-sm">
                        <p><span className="font-medium">Payment ID:</span> {booking.payment_id || 'N/A'}</p>
                        <p><span className="font-medium">Status:</span> 
                          <span className={`ml-2 px-2 py-1 rounded-full text-xs ${
                            booking.payment_status 
                              ? 'bg-green-100 text-green-800' 
                              : 'bg-red-100 text-red-800'
                          }`}>
                            {booking.payment_status ? 'Paid' : 'Pending'}
                          </span>
                        </p>
                        <p><span className="font-medium">Total Amount:</span> ₹{booking.total_amount || '--'}</p>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <h4 className="font-semibold text-gray-800 flex items-center gap-2">
                      <User className="w-4 h-4" />
                      Passengers ({passengerCount})
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {booking.passengers?.map((passenger, index) => (
                        <div key={index} className="bg-white p-3 rounded-lg border">
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="font-medium text-gray-800">
                                {passenger.name}
                                {passenger.is_primary && (
                                  <span className="ml-2 px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
                                    Primary
                                  </span>
                                )}
                              </p>
                              <p className="text-sm text-gray-600">
                                {passenger.age} years • {passenger.gender}
                              </p>
                            </div>
                            <div className="text-right">
                              <p className="text-sm font-medium">
                                Seat: {passenger.seat_number || 'Not assigned'}
                              </p>
                            </div>
                          </div>
                        </div>
                      ))}
                      <div className="pt-4">
                        <button
                          onClick={() => {
                            setActiveBookingId(booking.id);
                            setCalendarOpen(true);
                          }}
                          disabled={updateLoading}
                          className="bg-black text-white px-4 py-2 rounded-md text-sm hover:scale-95 transform duration-100 transition disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          {updateLoading ? 'Updating...' : 'Edit Flight'}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        );
      })}
      
      {calendarOpen && (
        <CalendarPopup
          isOpen={calendarOpen}
          onClose={() => {
            setCalendarOpen(false);
            setActiveBookingId(null);
          }}
          onDateSelect={handleDateUpdate}
          bookingId={activeBookingId}
          
        />
      )}
    </div>
  );
};

export default BookingCard;