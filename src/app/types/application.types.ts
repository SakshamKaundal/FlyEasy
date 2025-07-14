export interface UserInformation {
  id: string;
  name: string;
  email: string;
}

export interface Flights {
  id: string;
  company_name: string;
  flight_number: string;
  departure_time: string;
  arrival_time: string;
}

export interface Journeys {
  id: string;
  flight_id: string;
  flight_from: string;
  flight_to: string;
  flight_date: string;
  flights?: Flights; 
}

export type TravelClass = "economy" | "premium" | "business";
export type PassengerType = "adult" | "child" | "infant";

export interface FareRules {
  id: string;
  flight_from: string;
  flight_to: string;
  travel_class: TravelClass;
  passenger_type: PassengerType;
  base_price: number;
}

export interface Bookings {
  id: string;
  user_id: string;
  flight_id: string;
  payment_status: boolean;
  payment_id: string | null;
  created_at: string;
}

export interface Users {
  id: string;
  name: string;
  email: string;
  is_admin: boolean;
}

export interface Passengers {
  id: string;
  booking_id: string;
  name: string;
  age: number;
  gender: string;
  seat_number: string;
  is_primary: boolean;
}


export interface EnrichedFlight {
  direction: "outbound" | "return";
  flight_id: string;
  company_name?: string;
  flight_number?: string;
  departure_time?: string;
  arrival_time?: string;
  journey_date: string;
  fare: number;
}
