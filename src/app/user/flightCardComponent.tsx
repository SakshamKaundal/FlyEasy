"use client";

import React, { useEffect, useState } from 'react';
import { ArrowRight, ChevronDown, ChevronUp } from 'lucide-react';
import { getRandomHexColor } from '@/lib/utils';
import { useFlightStore } from '@/zustand-store/user-search-store';
import { TravelClass } from '../types/application.types';
import ErrorModal from '../error';
import UpcomingFlights from './GetUpcomingFlights';
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
  console.log("FlightResults props:", { oneWay, returnFlights });
  const hasOneWay = oneWay.length > 0;
  const hasReturn = returnFlights.length > 0;
  const [isMobile, setIsMobile] = useState(false);

  const setFrom = useFlightStore((state) => state.setFrom);
  const setTo = useFlightStore((state) => state.setTo);
  const setStartDate = useFlightStore((state) => state.setStartDate);
  const setReturnDate = useFlightStore((state) => state.setReturnDate);
  const { isRoundTrip } = useUserInformation();
  const { setOutboundFares, setReturnFares } = useDualFareStore();
  const router = useRouter();
  console.log(isMobile)
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
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const handlePayNow = () => {
    const selectedStore = useSelectedFlightsStore.getState();

    if (selectedOutbound) {
      selectedStore.setOutboundFlight(selectedOutbound);
    }
    if (selectedReturn) {
      selectedStore.setReturnFlight(selectedReturn);
    }

    if (isRoundTrip && selectedOutbound && selectedReturn) {
      setOutboundFares(
        {
          adult: selectedOutbound.fare || 0,
          child: 0,
          infant: 0,
        },
        {
          ...selectedOutbound,
          date: selectedOutbound.date ?? selectedOutbound.journey_date ?? ''
        }
      );

      setReturnFares(
        {
          adult: selectedReturn.fare || 0,
          child: 0,
          infant: 0,
        },
        {
          ...selectedReturn,
          date: selectedReturn.date ?? selectedReturn.journey_date ?? ''
        }
      );
    }

    router.push('/payments');
  };

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
        <div className="border rounded-lg bg-white shadow-md space-y-4 p-4">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Selected Flights</h3>
          
          <div className="flex flex-col space-y-4 md:flex-row md:space-y-0 md:space-x-4">
            {selectedOutbound ? (
              <div className="flex-1 border rounded-lg p-3 bg-gray-50">
                <div className="flex items-start gap-3">
                  <div
                    className="w-10 h-10 rounded-full flex items-center justify-center text-sm font-semibold text-white flex-shrink-0"
                    style={{ background: getRandomHexColor() }}
                  >
                    {(selectedOutbound.company_name || 'U').split(' ').map(word => word[0]).join('').toUpperCase()}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex flex-col space-y-2">
                      <div className="flex justify-between items-start">
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Outbound</p>
                          <p className="text-sm font-bold text-gray-800 truncate">{selectedOutbound.company_name}</p>
                          <p className="text-sm text-gray-600 truncate">{selectedOutbound.flight_number}</p>
                        </div>
                        <div className="text-right ml-2">
                          <p className="text-lg font-bold text-black">₹{selectedOutbound.fare.toFixed(2)}</p>
                        </div>
                      </div>

                      <div className="flex flex-col space-y-1 text-xs text-gray-600">
                        <div className="flex items-center justify-between">
                          <span>{selectedOutbound.from} → {selectedOutbound.to}</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span>{selectedOutbound.departure_time} - {selectedOutbound.arrival_time}</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="font-medium">{selectedOutbound.date || selectedOutbound.journey_date || 'Date not available'}</span>
                          <span className="text-blue-600 font-medium capitalize">
                            {selectedOutbound.travel_class || 'Economy'}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex-1 border-2 border-dashed border-gray-300 rounded-lg p-4 text-center bg-gray-50">
                <p className="text-gray-500 text-sm">Select an outbound flight</p>
              </div>
            )}

            {selectedReturn ? (
              <div className="flex-1 border rounded-lg p-3 bg-gray-50">
                <div className="flex items-start gap-3">
                  <div
                    className="w-10 h-10 rounded-full flex items-center justify-center text-sm font-semibold text-white flex-shrink-0"
                    style={{ background: getRandomHexColor() }}
                  >
                    {(selectedReturn.company_name || 'U').split(' ').map(word => word[0]).join('').toUpperCase()}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex flex-col space-y-2">
                      <div className="flex justify-between items-start">
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Return</p>
                          <p className="text-sm font-bold text-gray-800 truncate">{selectedReturn.company_name}</p>
                          <p className="text-sm text-gray-600 truncate">{selectedReturn.flight_number}</p>
                        </div>
                        <div className="text-right ml-2">
                          <p className="text-lg font-bold text-black">₹{selectedReturn.fare.toFixed(2)}</p>
                        </div>
                      </div>

                      <div className="flex flex-col space-y-1 text-xs text-gray-600">
                        <div className="flex items-center justify-between">
                          <span>{selectedReturn.from} → {selectedReturn.to}</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span>{selectedReturn.departure_time} - {selectedReturn.arrival_time}</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="font-medium">{selectedReturn.date || selectedReturn.journey_date || 'Date not available'}</span>
                          <span className="text-blue-600 font-medium capitalize">
                            {selectedReturn.travel_class || 'Economy'}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex-1 border-2 border-dashed border-gray-300 rounded-lg p-4 text-center bg-gray-50">
                <p className="text-gray-500 text-sm">Select a return flight</p>
              </div>
            )}
          </div>

          <div className="flex flex-col sm:flex-row justify-between items-center gap-4 pt-4 border-t">
            <div className="flex flex-col items-center sm:items-start">
              <p className="text-sm text-gray-500">Total Fare</p>
              <p className="text-2xl font-bold text-black">₹{totalFare.toFixed(2)}</p>
            </div>
            
            {((isRoundTrip && selectedOutbound && selectedReturn) || (!isRoundTrip && selectedOutbound)) && (
              <div className="flex justify-center sm:justify-end w-full sm:w-auto">
                <button
                  className="bg-black text-white cursor-pointer w-full sm:w-[140px] h-[42px] px-6 rounded-lg text-sm font-medium hover:bg-gray-800 transition-colors flex items-center justify-center"
                  onClick={handlePayNow}
                  disabled={isRoundTrip && (!selectedOutbound || !selectedReturn)}
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
          <h3 className="text-lg font-semibold text-gray-800">Available Flights</h3>
          {oneWay.map((flight, index) => (
            <div key={`oneway-${index}-${flight.flight_id}`} className={`cursor-pointer ${selectedOutbound?.flight_id === flight.flight_id && selectedOutbound?.from === flight.from && selectedOutbound?.to === flight.to && selectedOutbound?.departure_time === flight.departure_time ? 'ring-2 ring-blue-500 ring-offset-2 rounded-xl' : ''}`}>
              <FlightCard 
                flight={flight} 
                label="" 
                full 
                isOutbound={true}
                index={index}
                onFlightSelect={(selectedFlight) => setSelectedOutbound(selectedFlight)}
                onClassUpdate={(travelClass, newFare) => handleOutboundUpdate(flight, travelClass, newFare)}
              />
            </div>
          ))}
        </div>
      )}

      {hasOneWay && hasReturn && (
        <div className="w-full space-y-6">
          <div className="flex flex-col lg:flex-row gap-6 w-full">
            <div className={`w-full lg:w-1/2 ${isMobile && selectedOutbound ? 'order-2' : 'order-1'}`}>
              <h3 className="text-lg font-semibold mb-4 text-gray-800">Outbound Flights</h3>
              <div className="space-y-4">
                {oneWay.map((flight, index) => (
                  <div 
                    key={`outbound-${index}-${flight.flight_id}`} 
                    className={`cursor-pointer ${selectedOutbound?.flight_id === flight.flight_id && selectedOutbound?.from === flight.from && selectedOutbound?.to === flight.to && selectedOutbound?.departure_time === flight.departure_time ? 'ring-2 ring-blue-500 ring-offset-2 rounded-xl' : ''}`}
                  >
                    <FlightCard 
                      flight={flight} 
                      label="" 
                      full 
                      showBook={false} 
                      isOutbound={true}
                      index={index}
                      onFlightSelect={(selectedFlight) => setSelectedOutbound(selectedFlight)}
                      onClassUpdate={(travelClass, newFare) => handleOutboundUpdate(flight, travelClass, newFare)}
                    />
                  </div>
                ))}
              </div>
            </div>
            
            <div className={`w-full lg:w-1/2 ${isMobile && selectedOutbound ? 'order-1' : 'order-2'}`}>
              <h3 className="text-lg font-semibold mb-4 text-gray-800">Return Flights</h3>
              <div className="space-y-4">
                {returnFlights.map((flight, index) => (
                  <div 
                    key={`return-${index}-${flight.flight_id}`} 
                    className={`cursor-pointer ${selectedReturn?.flight_id === flight.flight_id && selectedReturn?.from === flight.from && selectedReturn?.to === flight.to && selectedReturn?.departure_time === flight.departure_time ? 'ring-2 ring-green-500 ring-offset-2 rounded-xl' : ''}`}
                  >
                    <FlightCard 
                      flight={flight} 
                      label="" 
                      full 
                      showBook={false} 
                      isOutbound={false}
                      index={index}
                      onFlightSelect={(selectedFlight) => setSelectedReturn(selectedFlight)}
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
  isOutbound = true,
  onFlightSelect,
  onClassUpdate,
}: {
  flight: Flight;
  label: string;
  full?: boolean;
  showBook?: boolean;
  isOutbound?: boolean;
  index: number;
  onFlightSelect?: (flight: SelectedFlightWithClass) => void;
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
  console.log(isOutbound)

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
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
          travel_class: travelClass
        }),
      });

      const data = await res.json();

      console.log("data is ", data);
      if (res.ok && data.fare !== null && data.fare !== undefined) {
        setSelectedClass(travelClass);
        setFare(data.fare);
        
        const selectedFlight = {
          ...flight,
          travel_class: travelClass,
          fare: data.fare
        };
        
        if (onClassUpdate) {
          onClassUpdate(travelClass, data.fare);
        }
        if (onFlightSelect) {
          onFlightSelect(selectedFlight);
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

  const handleCardClick = () => {
    if (onFlightSelect) {
      onFlightSelect({
        ...flight,
        travel_class: selectedClass,
        fare: fare || flight.fare
      });
    }
  };

  return (
    <>
      <div 
        className={`bg-white border shadow rounded-xl overflow-hidden hover:shadow-lg transition-all duration-200 ${full ? 'w-full' : ''} w-full min-w-0`}
        onClick={handleCardClick}
      >      
        <div className="px-4 py-4">
          {isMobile ? (
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <div
                  className="w-12 h-12 rounded-full flex items-center justify-center text-sm font-semibold text-white flex-shrink-0"
                  style={{ background: getRandomHexColor() }}
                >
                  {(flight.company_name || 'U').split(' ').map(word => word[0]).join('').toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-bold text-gray-800 truncate">{flight.flight_number}</p>
                  <p className="text-xs text-gray-600 truncate">{flight.company_name}</p>
                </div>
                <div className="text-right">
                  <p className="text-lg font-bold text-black">
                    {loadingFare ? 'Loading...' : fare !== null ? `₹${fare.toFixed(2)}` : '--'}
                  </p>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="text-center">
                    <p className="text-sm font-medium">{flight.from}</p>
                    <p className="text-xs text-gray-500">{flight.departure_time}</p>
                  </div>
                  <ArrowRight className="w-4 h-4 text-gray-500 mx-2" />
                  <div className="text-center">
                    <p className="text-sm font-medium">{flight.to}</p>
                    <p className="text-xs text-gray-500">{flight.arrival_time}</p>
                  </div>
                </div>
                <button
                  onClick={(e) => {
                  e.stopPropagation();
                  setExpanded(!expanded);
                }}
                  className="text-gray-500 hover:text-black"
                >
                  {expanded ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                </button>
              </div>

              <div className="text-center">
                <p className="text-xs text-gray-500">{flightDate || 'Date not available'}</p>
              </div>
            </div>
          ) : (
            <div className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <div
                  className="w-12 h-12 rounded-full flex items-center justify-center text-sm font-semibold text-white flex-shrink-0"
                  style={{ background: getRandomHexColor() }}
                >
                  {(flight.company_name || 'U').split(' ').map(word => word[0]).join('').toUpperCase()}
                </div>
                <div className="flex flex-col">
                  <p className="text-sm font-bold text-gray-800">{flight.flight_number}</p>
                  <p className="text-xs text-gray-600">{flight.company_name}</p>
                  <p className="text-xs text-gray-500">{flightDate || 'Date not available'}</p>
                </div>
              </div>

              <div className="flex items-center gap-6">
                <div className="flex items-center gap-2">
                  <div className="text-center">
                    <p className="text-sm font-medium">{flight.from}</p>
                    <p className="text-xs text-gray-500">{flight.departure_time}</p>
                  </div>
                  <ArrowRight className="w-4 h-4 text-gray-500 mx-2" />
                  <div className="text-center">
                    <p className="text-sm font-medium">{flight.to}</p>
                    <p className="text-xs text-gray-500">{flight.arrival_time}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="text-right">
                    <p className="text-lg font-bold text-black">
                      {loadingFare ? 'Loading...' : fare !== null ? `₹${fare.toFixed(2)}` : '--'}
                    </p>
                  </div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setExpanded(!expanded);
                    }}
                    className="text-gray-500 hover:text-black"
                  >
                    {expanded ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        {expanded && (
          <div className="px-4 py-4 border-t bg-gray-50">
            <div className="flex flex-col space-y-4">
              <div className="flex flex-col sm:flex-row gap-3">
                {(['economy', 'premium', 'business'] as TravelClass[]).map((option) => (
                  <button
                    key={option}
                    className={`flex-1 sm:flex-none sm:w-32 h-10 rounded-lg border text-sm font-medium flex items-center justify-center transition-colors ${
                      selectedClass === option 
                        ? 'bg-black text-white border-black' 
                        : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-100'
                    } ${loadingFare ? 'opacity-50 cursor-not-allowed' : ''}`}
                    onClick={(e) => {
                      e.stopPropagation();
                      handleClassSelect(option);
                    }}
                    disabled={loadingFare}
                  >
                    {option.charAt(0).toUpperCase() + option.slice(1)}
                  </button>
                ))}
              </div>
              
              {showBook && (
                <div className="flex justify-center sm:justify-end">
                  <button
                    className="bg-black text-white w-full sm:w-32 h-10 rounded-lg text-sm font-medium hover:bg-gray-800 transition-colors flex items-center justify-center"
                    onClick={(e) => {
                      e.stopPropagation();
                      const selectedStore = useSelectedFlightsStore.getState();
                      selectedStore.setOutboundFlight({
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