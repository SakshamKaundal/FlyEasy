import { TravelClass } from '@/app/types/application.types';
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface Flight {
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

interface FlightSearchState {
  from: string;
  to: string;
  startDate: string;
  returnDate: string;
  oneWay: Flight[];
  returnFlights: Flight[];
  setFrom: (from: string) => void;
  setTo: (to: string) => void;
  setStartDate: (date: string) => void;
  setReturnDate: (date: string) => void;
  setResults: (data: { oneWay: Flight[]; return: Flight[] }) => void;
}

export const useFlightStore = create<FlightSearchState>()(
  persist(
    (set) => ({
      from: '',
      to: '',
      startDate: '',
      returnDate: '',
      oneWay: [],
      returnFlights: [],
      setFrom: (from) => set({ from }),
      setTo: (to) => set({ to }),
      setStartDate: (date) => set({ startDate: date }),
      setReturnDate: (date) => set({ returnDate: date }),
      setResults: (data) => set({ oneWay: data.oneWay || [], returnFlights: data.return || [] }),
    }),
    {
      name: 'flight-search-storage', // unique name for localStorage key
      // Optional: Only persist search parameters, not results
      // partialize: (state) => ({
      //   from: state.from,
      //   to: state.to,
      //   startDate: state.startDate,
      //   returnDate: state.returnDate
      // }),
    }
  )
);