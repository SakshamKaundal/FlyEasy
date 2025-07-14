'use client';

import React, { useState, useEffect } from 'react';
import SearchFlights from '../components/animations/loadingFlights';
import FlightResults from './flightCardComponent';
import { saveSearch, getSearchHistoryByEmail } from '@/lib/indexedDb';
import { useUserInformation } from '@/components/context-api/save-user-context';
import RecentSearches from './recentSearch';
import { useFlightStore } from '@/zustand-store/user-search-store';


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

const cities = [
  'Delhi', 'Mumbai', 'Bangalore', 'Hyderabad', 'Chennai',
  'Kolkata', 'Pune', 'Goa', 'Ahmedabad', 'Lucknow',
];

const BookingForm = () => {
const from = useFlightStore((state) => state.from);
const to = useFlightStore((state) => state.to);
const setFrom = useFlightStore((state) => state.setFrom);
const setTo = useFlightStore((state) => state.setTo);
const startDate = useFlightStore((state) => state.startDate);
const returnDate = useFlightStore((state) => state.returnDate);
const setStartDate = useFlightStore((state) => state.setStartDate);
const setReturnDate = useFlightStore((state) => state.setReturnDate);
  const [searching, setSearching] = useState(false);
  const [oneWayResults, setOneWayResults] = useState<Flight[]>([]);
  const [returnResults, setReturnResults] = useState<Flight[]>([]);
  const [showResults, setShowResults] = useState(false);
  const [searchHistory, setSearchHistory] = useState<
    { id?: number; query: { from: string; to: string; date: string; returnDate?: string } }[]
  >([]);


  const { user , setIsRoundTrip } = useUserInformation();





  useEffect(() => {
    const fetchHistory = async () => {
      const history = await getSearchHistoryByEmail(user?.email || 'guest');
      setSearchHistory(history.reverse().slice(0, 5));
    };
    fetchHistory();
  }, [user?.email]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!from || !to || !startDate) return alert('Please fill in all required fields.');

    setSearching(true);
    setIsRoundTrip(!!returnDate);
    setShowResults(false);

    try {
      const res = await fetch('/api/get-flights', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ from, to, date: startDate, returnDate: returnDate || undefined }),
      });

      const data = await res.json();

      if (!res.ok) {
        alert(data.message || 'Failed to fetch flights.');
        setSearching(false);
        return;
      }

      setTimeout(async () => {
        setOneWayResults(data.oneWay || []);
        setReturnResults(data.return || []);
        await saveSearch(user?.email || 'guest', { from, to, date: startDate, returnDate }, {
          oneWay: data.oneWay,
          return: data.return,
        });
        const history = await getSearchHistoryByEmail(user?.email || 'guest');
        setSearchHistory(history.reverse().slice(0, 5));
        setSearching(false);
        setShowResults(true);
      }, 3000);
    } catch (error) {
      setSearching(false);
      alert('Something went wrong while fetching flights.');
      return error
    }
  };

  const handleRecentSearchClick = async (query: {
  from: string;
  to: string;
  date: string;
  returnDate?: string;
}) => {
  setFrom(query.from);
  setTo(query.to);
  setStartDate(query.date);
  setReturnDate(query.returnDate || '');
  setSearching(true);
  setShowResults(false);

  try {
    const res = await fetch('/api/get-flights', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        from: query.from,
        to: query.to,
        date: query.date,
        returnDate: query.returnDate || undefined,
      }),
    });

    const data = await res.json();

    if (!res.ok) {
      alert(data.message || 'Failed to fetch flights.');
      setSearching(false);
      return;
    }

    setOneWayResults(data.oneWay || []);
    setReturnResults(data.return || []);
    setShowResults(true);
  } catch (error) {
    console.error('Error fetching flights:', error);
    alert('Something went wrong.');
  } finally {
    setSearching(false);
  }
};

  return (
    <div className="w-full px-4 sm:px-6 lg:px-0 flex flex-col items-center py-10 overflow-x-hidden">
      {searching && <SearchFlights />}

      {!searching && !showResults && (
        <>
          <form
            onSubmit={handleSubmit}
            className="w-full max-w-lg bg-gray-50 shadow-xl rounded-2xl p-6 space-y-5"
          >
            <h2 className="text-2xl font-semibold text-center">Book Your Flight</h2>

            <div className="flex flex-col">
              <label className="text-sm font-medium mb-1">From</label>
              <select
                value={from}
                onChange={(e) => setFrom(e.target.value)}
                className="border rounded px-3 py-2 text-sm bg-white w-full"
              >
                <option value="">Select city</option>
                {cities.map((city) => (
                  <option key={city} value={city}>{city}</option>
                ))}
              </select>
            </div>

            <div className="flex flex-col">
              <label className="text-sm font-medium mb-1">To</label>
              <select
                value={to}
                onChange={(e) => setTo(e.target.value)}
                className="border rounded px-3 py-2 text-sm bg-white w-full"
              >
                <option value="">Select city</option>
                {cities.filter((city) => city !== from).map((city) => (
                  <option key={city} value={city}>{city}</option>
                ))}
              </select>
            </div>

            <div className="flex flex-col">
              <label className="text-sm font-medium mb-1">Start Date</label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="border rounded px-3 py-2 text-sm bg-white w-full"
                required
              />
            </div>

            <div className="flex flex-col">
              <label className="text-sm font-medium mb-1">Return Date (optional)</label>
              <input
                type="date"
                value={returnDate}
                onChange={(e) => setReturnDate(e.target.value)}
                className="border rounded px-3 py-2 text-sm bg-white w-full"
              />
            </div>

            <div className="flex flex-col sm:flex-row justify-end gap-3 sm:gap-4">
              <button
                type="submit"
                className="w-full sm:w-auto px-6 bg-black text-white text-lg py-2 rounded hover:scale-110 duration-100 transition"
              >
                Search Flights
              </button>
              <button
                type="reset"
                className="w-full sm:w-auto px-6 bg-black text-white text-lg py-2 rounded hover:scale-110 duration-100 transition"
           onClick={() => {
  setFrom('');
  setTo('');
  setStartDate('');
  setReturnDate('');
  setOneWayResults([]);
  setReturnResults([]);
  setShowResults(false);
}}
              >
                Reset Search
              </button>
            </div>
          </form>

{searchHistory.length > 0 && !showResults && (
  <RecentSearches
    searchHistory={searchHistory}
    onSelectSearch={handleRecentSearchClick}
  />
)}
        </>
      )}

      {!searching && showResults && (
        <div className="w-full max-w-full overflow-x-hidden">
          <FlightResults oneWay={oneWayResults} returnFlights={returnResults} />
        </div>
      )}
    </div>
  );
};

export default BookingForm;
