
import { create } from 'zustand';
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

export const useSelectedFlightsStore = create<SelectedFlightsState>((set) => ({
  outboundFlight: null,
  returnFlight: null,
  setOutboundFlight: (flight) => set({ outboundFlight: flight }),
  setReturnFlight: (flight) => set({ returnFlight: flight }),
  clearFlights: () => set({ outboundFlight: null, returnFlight: null }),
}));
