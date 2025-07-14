"use client";

import React, { useEffect, useState } from 'react';
import { ArrowRight, ChevronDown,  ChevronUp } from 'lucide-react';
import { getRandomHexColor } from '@/lib/utils';
import { useFlightStore } from '@/zustand-store/user-search-store';
import { TravelClass } from '../types/application.types';
import ErrorModal from '../error';
import UpcomingFlights from './GetUpcomingFlights';
import { useBookingStore } from '@/zustand-store/flight-booking-store';
import { useRouter } from 'next/navigation';
import { useSelectedFlightsStore } from '@/zustand-store/selected-flights-store';
import { useDualFareStore } from '@/zustand-store/round-trip-fares';
import { useUserInformation } from '@/components/context-api/save-user-context';
interface Flight {
  flight_id: string;
  company_name?: string;
  flight_number?: string;
  departure_time?: string;
  arrival_time?: string;
  journey_date?: string;
  date?: string;
  fare: number;
  from: string;
  to: string;
  travel_class?: TravelClass;
}

interface SelectedFlightWithClass extends Flight {
  travel_class?: TravelClass;
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
  const { isRoundTrip } = useUserInformation();
const { setOutboundFares, setReturnFares } = useDualFareStore();
  const router = useRouter()

  const [selectedOutbound, setSelectedOutbound] = useState<SelectedFlightWithClass | null>(null);
  const [selectedReturn, setSelectedReturn] = useState<SelectedFlightWithClass | null>(null);

  const totalFare = (selectedOutbound?.fare || 0) + (selectedReturn?.fare || 0);

  const handleOutboundUpdate = (flight: Flight, travelClass: TravelClass, newFare: number) => {
    setSelectedOutbound({
      ...flight,
      travel_class: travelClass,
      fare: newFare
    });
  };

  const handleReturnUpdate = (flight: Flight, travelClass: TravelClass, newFare: number) => {
    setSelectedReturn({
      ...flight,
      travel_class: travelClass,
      fare: newFare
    });
  };

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
        <h3 className="text-md font-medium mb-2 text-gray-700 px-2">Weekly Suggestions</h3>
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

{hasOneWay && hasReturn && (selectedOutbound || selectedReturn) && (
  <div className="border p-4 rounded-lg bg-white shadow-md space-y-4">
  
    <div className="flex flex-col lg:flex-row gap-4">
      {selectedOutbound && (
        <div className="flex-1 border rounded-lg p-3 bg-gray-50">
          <div className="flex items-center gap-3">
            <div
              className="w-10 h-10 rounded-full flex items-center justify-center text-sm font-semibold text-white flex-shrink-0"
              style={{ background: getRandomHexColor() }}
            >
              {(selectedOutbound.company_name || 'U').split(' ').map(word => word[0]).join('').toUpperCase()}
            </div>

            <div className="flex flex-col sm:flex-row sm:justify-between w-full sm:items-center gap-2 sm:gap-4">
              <div className="flex flex-col">
                <p className="text-xs font-semibold text-gray-500">Outbound</p>
                <p className="text-sm font-bold">{selectedOutbound.company_name}</p>
                <p className="text-sm">{selectedOutbound.flight_number}</p>
              </div>

              <div className="text-xs text-gray-600 flex flex-col gap-1">
                <p>{selectedOutbound.from} → {selectedOutbound.to}</p>
                <p>{selectedOutbound.departure_time} - {selectedOutbound.arrival_time}</p>
              </div>

              <div className="flex flex-col text-xs text-gray-600 items-start sm:items-end gap-1" style={{ marginLeft: '10px' }}>
                <p className="font-medium">{selectedOutbound.date || selectedOutbound.journey_date || 'Date not available'}</p>
                <p className="text-blue-600 font-medium">
                  {selectedOutbound.travel_class ? 
                    selectedOutbound.travel_class.charAt(0).toUpperCase() + selectedOutbound.travel_class.slice(1) : 
                    'Economy'
                  }
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {selectedReturn && (
        <div className="flex-1 border rounded-lg p-3 bg-gray-50">
          <div className="flex items-center gap-3">
            <div
              className="w-10 h-10 rounded-full flex items-center justify-center text-sm font-semibold text-white flex-shrink-0"
              style={{ background: getRandomHexColor() }}
            >
              {(selectedReturn.company_name || 'U').split(' ').map(word => word[0]).join('').toUpperCase()}
            </div>

            <div className="flex flex-col sm:flex-row sm:justify-between w-full sm:items-center gap-2 sm:gap-4">
              <div className="flex flex-col">
                <p className="text-xs font-semibold text-gray-500">Return</p>
                <p className="text-sm font-bold">{selectedReturn.company_name}</p>
                <p className="text-sm">{selectedReturn.flight_number}</p>
              </div>

              <div className="text-xs text-gray-600 flex flex-col gap-1">
                <p>{selectedReturn.from} → {selectedReturn.to}</p>
                <p>{selectedReturn.departure_time} - {selectedReturn.arrival_time}</p>
              </div>

              <div className="flex flex-col text-xs text-gray-600 items-start sm:items-end gap-1" style={{ marginLeft: '10px' }}>
                <p className="font-medium">{selectedReturn.date || selectedReturn.journey_date || 'Date not available'}</p>
                <p className="text-blue-600 font-medium">
                  {selectedReturn.travel_class ? 
                    selectedReturn.travel_class.charAt(0).toUpperCase() + selectedReturn.travel_class.slice(1) : 
                    'Economy'
                  }
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>

    <div className="flex flex-col sm:flex-row justify-between items-center gap-4 pt-3 border-t">
      <div className="flex flex-col items-center sm:items-start">
        <p className="text-sm text-gray-500">Total Fare</p>
        <p className="text-2xl font-bold italic">₹{totalFare.toFixed(2)}</p>
      </div>
      
     {selectedOutbound && selectedReturn && (
  <div className="flex justify-center sm:justify-end w-full sm:w-auto">
    <button
      className="bg-black text-white cursor-pointer w-full sm:w-[120px] h-[36px] px-4 rounded text-sm hover:bg-gray-800 transition flex items-center justify-center"
     onClick={() => {
  const selectedStore = useSelectedFlightsStore.getState();

  selectedStore.setOutboundFlight(selectedOutbound);
  selectedStore.setReturnFlight(selectedReturn);

  if (isRoundTrip) {
 setOutboundFares(
  {
    adult: selectedOutbound?.fare || 0,
    child: 0,
    infant: 0,
  },
  {
    ...selectedOutbound,
    date: selectedOutbound?.date ?? selectedOutbound?.journey_date ?? ''
  }
);


 setReturnFares(
  {
    adult: selectedReturn?.fare || 0,
    child: 0,
    infant: 0,
  },
  {
    ...selectedReturn,
    date: selectedReturn?.date ?? selectedReturn?.journey_date ?? ''
  }
);
}

  router.push('/payments');
}}
    >
      Pay Now
    </button>
  </div>
)}
    </div>
  </div>
)}


      {!hasOneWay && !hasReturn && (
        <p className="text-center text-gray-500 mt-4">No flights found.</p>
      )}

      {hasOneWay && !hasReturn && (
        <div className="w-full space-y-4">
          {oneWay.map((flight, index) => (
            <div key={`oneway-${flight.flight_id}-${index}`} onClick={() => setSelectedOutbound({...flight, travel_class: 'economy'})}>
              <FlightCard 
                flight={flight} 
                label="" 
                full 
                onClassUpdate={(travelClass, newFare) => handleOutboundUpdate(flight, travelClass, newFare)}
              />
            </div>
          ))}
        </div>
      )}

      {hasOneWay && hasReturn && (
        <div className="w-full space-y-6">
          <div className="flex flex-col sm:flex-row gap-4 w-full">
            <div className="w-full sm:w-1/2">
              <h3 className="text-lg font-semibold mb-4 text-gray-800">Outbound Flights</h3>
              <div className="space-y-4">
                {oneWay.map((flight, index) => (
                  <div key={`outbound-${flight.flight_id}-${index}`} onClick={() => setSelectedOutbound({...flight, travel_class: 'economy'})}>
                    <FlightCard 
                      flight={flight} 
                      label="" 
                      full 
                      showBook={false} 
                      onClassUpdate={(travelClass, newFare) => handleOutboundUpdate(flight, travelClass, newFare)}
                    />
                  </div>
                ))}
              </div>
            </div>
            <div className="w-full sm:w-1/2">
              <h3 className="text-lg font-semibold mb-4 text-gray-800">Return Flights</h3>
              <div className="space-y-4">
                {returnFlights.map((flight, index) => (
                  <div key={`return-${flight.flight_id}-${index}`} onClick={() => setSelectedReturn({...flight, travel_class: 'economy'})}>
                    <FlightCard 
                      flight={flight} 
                      label="" 
                      full 
                      showBook={false} 
                      onClassUpdate={(travelClass, newFare) => handleReturnUpdate(flight, travelClass, newFare)}
                    />
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const FlightCard = ({
  flight,
  full = false,
  showBook = true,
  onClassUpdate,
}: {
  flight: Flight;
  label: string;
  full?: boolean;
  showBook?: boolean;
  onClassUpdate?: (travelClass: TravelClass, newFare: number) => void;
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
  const router = useRouter();
  const flightDate = flight.date || flight.journey_date;

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
        if (onClassUpdate) {
          onClassUpdate(travelClass, data.fare);
        }
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
      <div className={`bg-white border shadow rounded-xl overflow-hidden transform hover:scale-[1.01] hover:translate-x-1 hover:shadow-lg hover:border-l-4 hover:border-l-blue-500 ${full ? 'w-full' : ''} w-full min-w-0`}>      
        <div className="px-4 py-3 flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
          <div className="flex flex-col lg:flex-row lg:items-center gap-4 w-full">
            <div className="flex items-center gap-3">
              <div
                className="w-10 h-10 rounded-full flex items-center justify-center text-sm font-semibold text-white"
                style={{ background: getRandomHexColor() }}
              >
                {(flight.company_name || 'U').split(' ').map(word => word[0]).join('').toUpperCase()}
              </div>
              <div className="flex flex-col">
                <p className="text-sm font-bold text-gray-800 truncate">{flight.flight_number}</p>
                <p className="text-xs text-gray-600 italic truncate">{flight.company_name}</p>
                <p className="text-xs text-gray-600 italic truncate">{flightDate || 'Date not available'}</p>
              </div>
            </div>

            <div className="flex items-center gap-4 flex-wrap">
              <div className="flex flex-col items-start">
                <p className="text-sm font-medium">{flight.from}</p>
                <p className="text-xs text-gray-500">{flight.departure_time}</p>
              </div>
              <ArrowRight className="w-4 h-4 text-gray-500" />
              <div className="flex flex-col items-start">
                <p className="text-sm font-medium">{flight.to}</p>
                <p className="text-xs text-gray-500">{flight.arrival_time}</p>
              </div>
            </div>

             <div className="flex flex-col items-end gap-1 ml-auto lg:flex-row lg:items-center lg:gap-2">
              <div className="text-right lg:text-left">
                <p className="text-lg font-bold text-black italic">
                  {loadingFare ? 'Loading...' : fare !== null ? `₹${fare.toFixed(2)}` : '--'}
                </p>
                <p className="text-xs text-gray-500">{flightDate || 'Date not available'}</p>
              </div>
              {!isMobile && (
                <button
                  onClick={() => setExpanded((prev) => !prev)}
                  className="text-xs text-gray-500 hover:text-black flex items-center gap-1"
                >
                  {expanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                </button>
              )}
            </div>
          </div>
        </div>

        {(isMobile || expanded) && (
          <div className="px-4 py-2 border-t bg-gray-50">
            <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-3 w-full">
              <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
                {(['economy', 'premium', 'business'] as TravelClass[]).map((option) => (
                  <button
                    key={option}
                    className={`w-full sm:w-[120px] h-[30px] rounded-full border text-sm flex items-center justify-center ${
                      selectedClass === option ? 'bg-black text-white' : 'bg-white text-gray-700 border-gray-300'
                    } ${loadingFare ? 'opacity-50 cursor-not-allowed' : 'hover:bg-gray-100'}`}
                    onClick={() => handleClassSelect(option)}
                    disabled={loadingFare}
                  >
                    {option.charAt(0).toUpperCase() + option.slice(1)}
                  </button>
                ))}
              </div>
              {showBook && (
                <div className="flex justify-center sm:justify-end w-full sm:w-auto">
                  <button
                    className="bg-black text-white w-full sm:w-[120px] h-[30px] px-4 rounded text-sm hover:bg-gray-800 transition flex items-center justify-center"
                    onClick={() => {
                      useBookingStore.getState().setSelectedFlight({
                        flight_id: flight.flight_id,
                        company_name: flight.company_name,
                        flight_number: flight.flight_number,
                        from: flight.from,
                        to: flight.to,
                        journey_date: (flight.date ?? flight.journey_date) ?? '',
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