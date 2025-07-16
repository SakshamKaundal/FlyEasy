import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface FareMap {
  infant: number;
  child: number;
  adult: number;
}

interface FlightDetails {
  date: string;
  flight_id: string;
  flight_number?: string;
  company_name?: string;
  from: string;
  to: string;
  departure_time?: string;
  arrival_time?: string;
  journey_date?: string;
  travel_class?: string;
  fare: number;
}

interface DualFareState {
  outboundFares: FareMap;
  returnFares: FareMap;
  outboundFlight: FlightDetails | null;
  returnFlight: FlightDetails | null;
  setOutboundFares: (fares: FareMap, flight: FlightDetails) => void;
  setReturnFares: (fares: FareMap, flight: FlightDetails) => void;
  resetFares: () => void;
}

export const useDualFareStore = create<DualFareState>()(
  persist(
    (set) => ({
      outboundFares: { infant: 0, child: 0, adult: 0 },
      returnFares: { infant: 0, child: 0, adult: 0 },
      outboundFlight: null,
      returnFlight: null,
      setOutboundFares: (fares, flight) => set({ outboundFares: fares, outboundFlight: flight }),
      setReturnFares: (fares, flight) => set({ returnFares: fares, returnFlight: flight }),
      resetFares: () =>
        set({
          outboundFares: { infant: 0, child: 0, adult: 0 },
          returnFares: { infant: 0, child: 0, adult: 0 },
          outboundFlight: null,
          returnFlight: null,
        }),
    }),
    {
      name: 'dual-fare-storage',
    }
  )
);