'use client';

import React, { useEffect, useRef, useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useFlightStore } from '@/zustand-store/user-search-store';
import ErrorModal from '../error';

interface UpcomingFlight {
  flight_id: string;
  flight_number?: string;
  company_name?: string;
  from: string;
  to: string;
  date: string;
  fare: number;
}

interface Props {
  onSelect?: (query: { from: string; to: string; date: string }) => void;
}

const UpcomingFlights: React.FC<Props> = ({ onSelect }) => {
  const [flights, setFlights] = useState<UpcomingFlight[]>([]);
  const [loading, setLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  const from = useFlightStore((state) => state.from);
  const to = useFlightStore((state) => state.to);
  const outboundDate = useFlightStore((state) => state.startDate);
  const returnDate = useFlightStore((state) => state.returnDate);

  useEffect(() => {
    const fetchFlights = async () => {
      try {
        const res = await fetch('/api/get-week-flight', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            from,
            to,
            outboundDate,
            returnDate,
          }),
        });

        const data = await res.json();
        if (!res.ok) throw new Error(data.message || 'API Error');
        setFlights(data.flights || []);
      } catch {
        setHasError(true);
      } finally {
        setLoading(false);
      }
    };

    if (from && to && outboundDate && returnDate) fetchFlights();
    else setLoading(false);
  }, [from, to, outboundDate, returnDate]);

  const scroll = (direction: 'left' | 'right') => {
    if (scrollRef.current) {
      const scrollAmount = scrollRef.current.offsetWidth;
      scrollRef.current.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth',
      });
    }
  };

  if (loading) return <p className="text-sm text-center text-gray-500">Loading flights...</p>;
  if (hasError) return <ErrorModal message="Failed to load upcoming flights." onClose={() => setHasError(false)} />;
  if (flights.length === 0) return <p className="text-sm text-center text-gray-500">No upcoming flights found.</p>;

  return (
    <div className="w-full space-y-2">
      <div className="flex overflow-x-auto gap-3 px-2 scroll-smooth no-scrollbar" ref={scrollRef}>
        {flights.map((flight, idx) => (
          <div
            key={flight.flight_id + idx}
            className="min-w-[200px] max-w-[220px] border rounded shadow-sm bg-white px-3 py-2 text-sm cursor-pointer hover:border-l-blue-500 hover:border-l-4"
            onClick={() => onSelect?.({ from: flight.from, to: flight.to, date: flight.date })}
          >
            <p className="font-semibold text-black truncate">{flight.flight_number} ({flight.company_name})</p>
            <p className="text-gray-600 text-xs truncate">{flight.from} → {flight.to}</p>
            <p className="text-gray-600 text-xs">Date: {flight.date} ₹{flight.fare}</p>
          </div>
        ))}
      </div>

      <div className="flex justify-between px-2 mt-1">
        <button onClick={() => scroll('left')} className="p-2 bg-white shadow rounded">
          <ChevronLeft className="w-5 h-5 text-gray-500 hover:text-black" />
        </button>
        <button onClick={() => scroll('right')} className="p-2 bg-white shadow rounded">
          <ChevronRight className="w-5 h-5 text-gray-500 hover:text-black" />
        </button>
      </div>
    </div>
  );
};

export default UpcomingFlights;
