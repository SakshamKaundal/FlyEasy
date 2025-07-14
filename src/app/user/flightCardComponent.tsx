'use client';

import React, { useEffect, useState } from 'react';
import { ArrowRight, ChevronDown, ChevronUp } from 'lucide-react';
import { getRandomHexColor } from '@/lib/utils';
import { useFlightStore } from '@/zustand-store/user-search-store';
import { TravelClass } from '../types/application.types';
import ErrorModal from '../error';
import UpcomingFlights from './GetUpcomingFlights';
import { useBookingStore } from '@/zustand-store/flight-booking-store';
import { useRouter } from 'next/navigation';

interface Flight {
  flight_id: string;
  company_name?: string;
  flight_number?: string;
  departure_time?: string;
  arrival_time?: string;
  journey_date: string;
  fare: number;
  from: string;
  to: string;
}

interface Props {
  oneWay: Flight[];
  returnFlights: Flight[];
}

const FlightResults: React.FC<Props> = ({ oneWay, returnFlights }) => {
  const hasOneWay = oneWay.length > 0;
  const hasReturn = returnFlights.length > 0;

  const setFrom = useFlightStore((state) => state.setFrom);
  const setTo = useFlightStore((state) => state.setTo);
  const setStartDate = useFlightStore((state) => state.setStartDate);
  const setReturnDate = useFlightStore((state) => state.setReturnDate);

  useEffect(() => {
    const updateItemsPerPage = () => {
      const width = window.innerWidth;
      if (width < 640) return 1;
      else if (width < 768) return 2;
      else if (width < 1024) return 3;
      else if (width < 1280) return 4;
      else if (width < 1536) return 5;
      else return 6;
    };
    updateItemsPerPage();
    window.addEventListener('resize', updateItemsPerPage);
    return () => window.removeEventListener('resize', updateItemsPerPage);
  }, []);

  return (
    <div className="mt-6 w-full space-y-6 overflow-x-hidden">
      <div className="relative">
        <h3 className="text-md font-medium mb-2 text-gray-700 px-2">Upcoming Flights</h3>
        <div className="w-full overflow-hidden">
          <UpcomingFlights
            onSelect={(query) => {
              setFrom(query.from);
              setTo(query.to);
              setStartDate(query.date);
              setReturnDate('');
            }}
          />
        </div>
      </div>

      {!hasOneWay && !hasReturn && (
        <p className="text-center text-gray-500 mt-4">No flights found.</p>
      )}

      {hasOneWay && !hasReturn && (
        <div className="w-full space-y-4">
          {oneWay.map((flight, index) => (
            <FlightCard key={`oneway-${flight.flight_id}-${index}`} flight={flight} label="Flight" full />
          ))}
        </div>
      )}

      {hasOneWay && hasReturn && (
        <div className="w-full space-y-6">
          {Array.from({ length: Math.max(oneWay.length, returnFlights.length) }).map((_, index) => {
            const outbound = oneWay[index];
            const inbound = returnFlights[index];

            return (
              <div key={`flight-pair-${index}`} className="flex flex-col sm:flex-row gap-4 w-full items-stretch">
                {outbound && (
                  <div className="w-full sm:w-1/2 min-w-0">
                    <FlightCard key={`outbound-${outbound.flight_id}-${index}`} flight={outbound} label="Outbound" />
                  </div>
                )}
                {inbound && (
                  <div className="w-full sm:w-1/2 min-w-0">
                    <FlightCard key={`return-${inbound.flight_id}-${index}`} flight={inbound} label="Return" />
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

const FlightCard = ({
  flight,
  label,
  full = false,
}: {
  flight: Flight;
  label: string;
  full?: boolean;
}) => {
  const [expanded, setExpanded] = useState(false);
  const [selectedClass, setSelectedClass] = useState<TravelClass>('economy');
  const [isMobile, setIsMobile] = useState(false);
  const [fare, setFare] = useState<number | null>(flight.fare);
  const [loadingFare, setLoadingFare] = useState(false);
  const [showErrorModal, setShowErrorModal] = useState(false);
  const [errorText, setErrorText] = useState('');
  const from = useFlightStore((state) => state.from);
  const to = useFlightStore((state) => state.to);
  const returnDate = useFlightStore((state) => state.returnDate);
  const router = useRouter();

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 640);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const handleClassSelect = async (travelClass: TravelClass) => {
    setLoadingFare(true);
    setErrorText('');
    setShowErrorModal(false);

    const fromLocation = flight.from || from;
    const toLocation = flight.to || to;

    try {
      const res = await fetch("/api/get-fares", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          from: fromLocation,
          to: toLocation,
          travel_class: travelClass,
          passenger_type: "infant",
        }),
      });

      const data = await res.json();

      if (res.ok && data.fare !== null && data.fare !== undefined) {
        setSelectedClass(travelClass);
        setFare(data.fare);
      } else {
        setErrorText(data.message || 'Class does not exist on that flight.');
        setShowErrorModal(true);
      }
    } catch {
      setErrorText('Something went wrong while fetching fare.');
      setShowErrorModal(true);
    } finally {
      setLoadingFare(false);
    }
  };

  return (
    <>
      <div className={`bg-white border shadow rounded-xl overflow-hidden transition-all transform hover:scale-100 hover:translate-x-1 hover:shadow-lg hover:border-l-4 hover:border-l-blue-500 ${full ? 'w-full' : ''} min-w-0`}>
        <div className="px-4 py-3 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 min-w-0">
          <div className="flex flex-col sm:flex-row sm:items-center gap-4 w-full min-w-0">
            <div className="flex items-center gap-3 flex-shrink-0">
              <div
                className="w-10 h-10 rounded-full flex items-center justify-center text-sm font-semibold text-white flex-shrink-0"
                style={{ background: getRandomHexColor() }}
              >
                {(flight.company_name || 'U').split(' ').map(word => word[0]).join('').toUpperCase()}
              </div>
              <div className="flex flex-col min-w-0">
                <p className="text-xs text-gray-700 font-semibold">{label}</p>
                <p className="text-sm font-bold text-gray-800 truncate">{flight.flight_number}</p>
                <p className="text-xs text-gray-600 italic truncate">{flight.journey_date}</p>
              </div>
            </div>

            <div className="flex items-center gap-2 flex-grow min-w-0">
              <div className="flex flex-col items-start flex-shrink-0">
                <p className="text-sm font-medium">{from}</p>
                <p className="text-xs text-gray-500">{flight.departure_time}</p>
              </div>
              <ArrowRight className="w-4 h-4 text-gray-500 flex-shrink-0" />
              <div className="flex flex-col items-start flex-shrink-0">
                <p className="text-sm font-medium">{to}</p>
                <p className="text-xs text-gray-500">{flight.arrival_time}</p>
              </div>
            </div>

            <div className="flex items-center justify-between gap-2 flex-shrink-0">
              <p className="text-lg font-bold text-black italic">
                {loadingFare ? 'Loading...' : fare !== null ? `₹${fare.toFixed(2)}` : '--'}
              </p>
              {!isMobile && (
                <button
                  onClick={() => setExpanded((prev) => !prev)}
                  className="text-xs text-gray-500 hover:text-black flex items-center gap-1 flex-shrink-0"
                >
                  {expanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                </button>
              )}
            </div>
          </div>
        </div>

        {(isMobile || expanded) && (
          <div className="px-4 py-2 border-t bg-gray-50">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 w-full">
              <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
                {(['economy', 'premium', 'business'] as TravelClass[]).map((option) => (
                  <button
                    key={option}
                    className={`w-full sm:w-[120px] h-[30px] rounded-full border text-sm flex items-center justify-center ${
                      selectedClass === option
                        ? 'bg-black text-white'
                        : 'bg-white text-gray-700 border-gray-300'
                    } ${loadingFare ? 'opacity-50 cursor-not-allowed' : 'hover:bg-gray-100'}`}
                    onClick={() => handleClassSelect(option)}
                    disabled={loadingFare}
                  >
                    {option.charAt(0).toUpperCase() + option.slice(1)}
                  </button>
                ))}
              </div>
              {!returnDate && (
                <div className="flex justify-center sm:justify-end w-full sm:w-auto">
                  <button
                    className="bg-black text-white w-full sm:w-[120px] h-[30px] px-4 rounded text-sm hover:bg-gray-800 transition flex items-center justify-center"
                    onClick={() => {
                      const { from, to, startDate } = useFlightStore.getState();

                      useBookingStore.getState().setSelectedFlight({
                        flight_id: flight.flight_id,
                        company_name: flight.company_name,
                        flight_number: flight.flight_number,
                        from,
                        to,
                        journey_date: startDate,
                        fare: fare || 0,
                        travel_class: selectedClass,
                      });

                      router.push("/payments");
                    }}
                  >
                    Book Now
                  </button>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {showErrorModal && (
        <ErrorModal message={errorText} onClose={() => setShowErrorModal(false)} />
      )}
    </>
  );
};

export default FlightResults;
