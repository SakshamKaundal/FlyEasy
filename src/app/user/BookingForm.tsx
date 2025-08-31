'use client';

import React, { useState, useEffect } from 'react';
import SearchFlights from '../components/animations/loadingFlights';
import FlightResults from './flightCardComponent';
import { saveSearch, getSearchHistoryByEmail } from '@/lib/indexedDb';
import { useUserInformation } from '@/components/context-api/save-user-context';
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

interface RecentSearchesProps {
  searchHistory: {
    id?: number;
    query: {
      from: string;
      to: string;
      date: string;
      returnDate?: string;
    };
  }[];
  onSelectSearch: (query: {
    from: string;
    to: string;
    date: string;
    returnDate?: string;
  }) => void;
}

const RecentSearches: React.FC<RecentSearchesProps> = ({ searchHistory, onSelectSearch }) => {
  if (searchHistory.length === 0) return null;

  return (
    <div className="w-full max-w-lg mt-6">
      <h3 className="text-lg font-medium mb-3 text-center">Recent Searches</h3>
      
      <div className="flex flex-row gap-3 overflow-x-auto pb-2 sm:pb-0 sm:flex-wrap sm:justify-center">
        {searchHistory.map((search, index) => (
          <button
            key={search.id || index}
            onClick={() => onSelectSearch(search.query)}
            className="flex-shrink-0 w-64 sm:w-auto sm:flex-shrink bg-white border border-gray-200 rounded-lg p-3 sm:p-2 hover:bg-gray-50 hover:border-gray-300 transition-colors duration-200 text-left"
          >
            <div className="text-sm text-gray-700 sm:text-xs">
              <div className="font-medium">
                {search.query.from} → {search.query.to}
              </div>
              <div className="text-xs text-gray-500 mt-1 sm:mt-0">
                {search.query.date}
                {search.query.returnDate && ` - ${search.query.returnDate}`}
              </div>
            </div>
          </button>
        ))}
      </div>
      
      <div className="sm:hidden text-center mt-2">
        <span className="text-xs text-gray-400">← Scroll for more →</span>
      </div>
    </div>
  );
};

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
  const [userContextUpdated, setUserContextUpdated] = useState(false);

  const { user, setUser, setIsRoundTrip } = useUserInformation();

  // Update user context when component mounts
  useEffect(() => {
    const updateUserFromLocalStorage = () => {
      try {
        const storedUser = localStorage.getItem('user');
        console.log('Stored user from localStorage:', storedUser); // Debug log
        
        if (storedUser) {
          const parsedUser = JSON.parse(storedUser);
          console.log('Parsed user:', parsedUser); // Debug log
          console.log('Current user in context:', user); // Debug log
          
          // Always update the user context with latest localStorage data
          if (setUser && parsedUser.email) {
            setUser(parsedUser);
            setUserContextUpdated(true);
            console.log('User context updated with:', parsedUser); // Debug log
          }
        } else {
          setUserContextUpdated(true); // Mark as updated even if no user found
        }
      } catch (error) {
        console.error('Error parsing user from localStorage:', error);
        setUserContextUpdated(true);
      }
    };

    // Run immediately on mount
    updateUserFromLocalStorage();
    
    // Also run after a small delay to ensure localStorage is fully loaded
    const timeoutId = setTimeout(updateUserFromLocalStorage, 100);
    
    return () => clearTimeout(timeoutId);
  }, [setUser, user]); // Include setUser in dependencies

  useEffect(() => {
    // Only fetch history after user context has been updated
    if (!userContextUpdated) return;
    
    const fetchHistory = async () => {
      // Get user email from context first, then fallback to localStorage
      let userEmail = user?.email;
      
      if (!userEmail) {
        try {
          const storedUser = localStorage.getItem('user');
          if (storedUser) {
            const parsedUser = JSON.parse(storedUser);
            userEmail = parsedUser.email;
          }
        } catch (error) {
          console.error('Error getting user email from localStorage:', error);
        }
      }
      
      // Use 'guest' as final fallback
      const emailToUse = userEmail || 'guest';
      console.log('Fetching search history for email:', emailToUse); // Debug log
      
      const history = await getSearchHistoryByEmail(emailToUse);
      setSearchHistory(history.reverse().slice(0, 5));
    };
    
    // Always fetch history when component mounts or user changes
    fetchHistory();
  }, [user?.email, userContextUpdated]); // Re-run when user email changes or context is updated

  // Validation function for return date
  const validateReturnDate = (startDate: string, returnDate: string): boolean => {
    if (!startDate || !returnDate) return true; // Allow empty dates
    
    const start = new Date(startDate);
    const returnD = new Date(returnDate);
    
    return returnD >= start;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!from || !to || !startDate) return alert('Please fill in all required fields.');

    // Validate return date if provided
    if (returnDate && !validateReturnDate(startDate, returnDate)) {
      alert('Return date cannot be before the start date.');
      return;
    }

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

      console.log("API Response in handleSubmit:", data);

      if (!res.ok) {
        alert(data.message || 'Failed to fetch flights.');
        setSearching(false);
        return;
      }

      setTimeout(async () => {
        setOneWayResults(data.oneWay || []);
        setReturnResults(data.return || []);
        
        const userEmail = user?.email || 
          (() => {
            try {
              const storedUser = localStorage.getItem('user');
              return storedUser ? JSON.parse(storedUser).email : 'guest';
            } catch {
              return 'guest';
            }
          })();

        await saveSearch(userEmail, { from, to, date: startDate, returnDate }, {
          oneWay: data.oneWay,
          return: data.return,
        });
        
        const history = await getSearchHistoryByEmail(userEmail);
        setSearchHistory(history.reverse().slice(0, 5));
        setSearching(false);
        setShowResults(true);
      }, 3000);
    } catch (error) {
      setSearching(false);
      alert('Something went wrong while fetching flights.');
      return error;
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

      console.log("API Response in handleRecentSearchClick:", data);

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

  // Handle start date change - clear return date if it becomes invalid
  const handleStartDateChange = (newStartDate: string) => {
    setStartDate(newStartDate);
    
    // If return date is set and now invalid, clear it
    if (returnDate && !validateReturnDate(newStartDate, returnDate)) {
      setReturnDate('');
    }
  };

  // Handle return date change with validation
  const handleReturnDateChange = (newReturnDate: string) => {
    if (!newReturnDate || validateReturnDate(startDate, newReturnDate)) {
      setReturnDate(newReturnDate);
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
                onChange={(e) => handleStartDateChange(e.target.value)}
                className="border rounded px-3 py-2 text-sm bg-white w-full"
                required
              />
            </div>

            <div className="flex flex-col">
              <label className="text-sm font-medium mb-1">Return Date (optional)</label>
              <input
                type="date"
                value={returnDate}
                onChange={(e) => handleReturnDateChange(e.target.value)}
                min={startDate} // Set minimum date to start date
                className="border rounded px-3 py-2 text-sm bg-white w-full"
              />
              {returnDate && !validateReturnDate(startDate, returnDate) && (
                <span className="text-red-500 text-xs mt-1">
                  Return date cannot be before start date
                </span>
              )}
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