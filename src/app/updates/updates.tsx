'use client'
import { useEffect } from "react";

const Updates = () => {
  useEffect(() => {
    const eventSource = new EventSource('/api/flight-updates');

    eventSource.onmessage = (event) => {
      const data = JSON.parse(event.data);
      console.log('📦 Booking update:', data);
    };

    eventSource.onerror = (err) => {
      console.error('❌ SSE connection error:', err);
      eventSource.close();
    };

    return () => {
      eventSource.close();
    };
  }, []);

  return null; // Invisible component
};

export default Updates;
