import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type TravelClass = 'economy' | 'premium' | 'business';
export type PassengerType = 'infant' | 'adult';
export type Gender = 'male' | 'female' | 'other';

export interface FlightInfo {
  flight_id: string;
  company_name?: string;
  flight_number?: string;
  from: string;
  to: string;
  journey_date: string;
  fare: number;
  travel_class: 'economy' | 'premium' | 'business';
}

interface Passenger {
  name: string;
  age: number;
  gender: Gender;
  passenger_type: PassengerType;
}

interface BookingState {
  selectedFlight: FlightInfo | null;
  selectedClass: TravelClass;
  passengerCount: number;
  passengers: Passenger[];

  setSelectedFlight: (flight: FlightInfo) => void;
  setSelectedClass: (travelClass: TravelClass) => void;
  setPassengerCount: (count: number) => void;
  setPassenger: (index: number, passenger: Passenger) => void;
  resetBooking: () => void;
}

export const useBookingStore = create<BookingState>()(
  persist(
    (set) => ({
      selectedFlight: null,
      selectedClass: 'economy',
      passengerCount: 1,
      passengers: [],

      setSelectedFlight: (flight) => set({ selectedFlight: flight }),
      setSelectedClass: (travelClass) => set({ selectedClass: travelClass }),
      setPassengerCount: (count) =>
        set(() => ({
          passengerCount: count,
          passengers: Array.from({ length: count }, () => ({
            name: '',
            age: 0,
            gender: 'male',
            passenger_type: 'adult',
          })),
        })),
      setPassenger: (index, passenger) =>
        set((state) => {
          const updated = [...state.passengers];
          updated[index] = passenger;
          return { passengers: updated };
        }),
      resetBooking: () =>
        set({
          selectedFlight: null,
          selectedClass: 'economy',
          passengerCount: 1,
          passengers: [],
        }),
    }),
    {
      name: 'booking-storage',
    }
  )
);