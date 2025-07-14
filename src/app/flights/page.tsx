'use client';

import React from 'react';
import { useFlightStore } from '@/zustand-store/user-search-store';
import FlightResults from '../user/flightCardComponent';

const FlightsPage = () => {
  const oneWay = useFlightStore((state) => state.oneWay);
  const returnFlights = useFlightStore((state) => state.returnFlights);

  return (
    <div className="px-4 pt-10">
      <FlightResults oneWay={oneWay} returnFlights={returnFlights} />
    </div>
  );
};

export default FlightsPage;
