import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { TravelClass } from '@/app/types/application.types';

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

interface SelectedFlightsState {
  outboundFlight: Flight | null;
  returnFlight: Flight | null;
  setOutboundFlight: (flight: Flight) => void;
  setReturnFlight: (flight: Flight) => void;
  clearFlights: () => void;
}

export const useSelectedFlightsStore = create<SelectedFlightsState>()(
  persist(
    (set) => ({
      outboundFlight: null,
      returnFlight: null,
      setOutboundFlight: (flight) => set({ outboundFlight: flight }),
      setReturnFlight: (flight) => set({ returnFlight: flight }),
      clearFlights: () => set({ outboundFlight: null, returnFlight: null }),
    }),
    {
      name: 'selected-flights-storage', // unique name for localStorage key
      // Optional: you can customize what gets persisted
      // partialize: (state) => ({ 
      //   outboundFlight: state.outboundFlight,
      //   returnFlight: state.returnFlight 
      // }),
    }
  )
);