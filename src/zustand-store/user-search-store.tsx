import { create } from 'zustand';


interface FlightSearchState {
  from: string;
  to: string;
  startDate: string;
  returnDate: string;
  setFrom: (from: string) => void;
  setTo: (to: string) => void;
  setStartDate: (date: string) => void;
  setReturnDate: (date: string) => void;
}

export const useFlightStore = create<FlightSearchState>((set) => ({
  from: '',
  to: '',
  startDate: '',
  returnDate: '',
  setFrom: (from) => set({ from }),
  setTo: (to) => set({ to }),
  setStartDate: (date) => set({ startDate: date }),
  setReturnDate: (date) => set({ returnDate: date }),
}));