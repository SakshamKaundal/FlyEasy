"use client";

import { useState } from 'react';
import { useUserInformation } from '@/components/context-api/save-user-context';
import { useDualFareStore } from '@/zustand-store/round-trip-fares';
import { useSelectedFlightsStore } from '@/zustand-store/selected-flights-store';
import ErrorModal from '../error';
import SuccessModal from '../success';

type Passenger = {
  name: string;
  age: string;
  gender: string;
  passenger_type: 'adult' | 'infant';
};

type RazorpayResponse = {
  razorpay_payment_id: string;
  razorpay_order_id: string;
  razorpay_signature: string;
};

declare global {
  interface Window {
    Razorpay: new (options: RazorpayOptions) => RazorpayInstance;
  }
}

type RazorpayOptions = {
  key: string;
  amount: number;
  currency: string;
  name: string;
  description: string;
  handler: (response: RazorpayResponse) => void;
  prefill: {
    name: string;
    email: string;
  };
  notes?: Record<string, string>;
  theme?: { color: string };
};

type RazorpayInstance = {
  open: () => void;
};

const PassengerPaymentForm = () => {
  const { user, isRoundTrip } = useUserInformation();
  const {
    outboundFares,
    returnFares,
    outboundFlight,
    returnFlight
  } = useDualFareStore();

  // Fallback to useSelectedFlightsStore for one-way trips
  const selectedFlightsStore = useSelectedFlightsStore();

  const [passengers, setPassengers] = useState<Passenger[]>([
    { name: '', age: '', gender: '', passenger_type: 'adult' },
  ]);

  const [showErrorModal, setShowErrorModal] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [showValidation, setShowValidation] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  // Get the correct flight data based on trip type
  const getFlightData = () => {
    if (isRoundTrip) {
      return {
        outbound: outboundFlight,
        return: returnFlight
      };
    } else {
      // For one-way trips, use the selected flights store
      return {
        outbound: selectedFlightsStore.outboundFlight,
        return: null
      };
    }
  };

  const { outbound: currentOutboundFlight, return: currentReturnFlight } = getFlightData();

  const updatePassenger = (
    index: number,
    field: keyof Omit<Passenger, 'passenger_type'>,
    value: string
  ) => {
    const updated = [...passengers];

    updated[index] = {
      ...updated[index],
      [field]: value,
    };
    if (field === 'age') {
      const ageNum = parseInt(value, 10);
      updated[index].passenger_type = ageNum < 5 ? 'infant' : 'adult';
    }
    setPassengers(updated);
  };

  const addPassenger = () => {
    setPassengers((prev) => [...prev, { name: '', age: '', gender: '', passenger_type: 'adult' }]);
  };

  // Helper function to get fare for display - FIXED
  const getPassengerFare = (passenger: Passenger, isReturn: boolean = false) => {
    if (isRoundTrip) {
      if (isReturn) {
        // Return flight fare
        return returnFares[passenger.passenger_type] || 0;
      } else {
        // Outbound flight fare
        return outboundFares[passenger.passenger_type] || 0;
      }
    } else {
      // One-way trip
      if (isReturn) {
        return 0; // No return flight for one-way
      } else {
        return currentOutboundFlight?.fare || 0;
      }
    }
  };

  // Helper function to get individual flight totals for display
  const getFlightTotal = (isReturn: boolean = false) => {
    return passengers.reduce((sum, p) => {
      return sum + getPassengerFare(p, isReturn);
    }, 0);
  };

  const totalFare = passengers.reduce((sum, p) => {
    let outboundFare = 0;
    let returnFare = 0;

    if (isRoundTrip) {
      // For round trips, use the fares from useDualFareStore
      outboundFare = outboundFares[p.passenger_type] || 0;
      returnFare = returnFares[p.passenger_type] || 0;
    } else {
      // For one-way trips, use the flight fare directly
      if (currentOutboundFlight) {
        outboundFare = currentOutboundFlight.fare || 0;
      }
    }

    return sum + outboundFare + returnFare;
  }, 0);

  const loadRazorpayScript = (): Promise<boolean> => {
    return new Promise((resolve) => {
      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  };

  // Helper function to calculate individual flight fares
  const getIndividualFlightFare = (isReturnFlight: boolean) => {
    return passengers.reduce((sum, p) => {
      if (isRoundTrip) {
        return sum + (isReturnFlight ? (returnFares[p.passenger_type] || 0) : (outboundFares[p.passenger_type] || 0));
      } else {
        return sum + (currentOutboundFlight?.fare || 0);
      }
    }, 0);
  };

  const saveBookingToDatabase = async (paymentId: string) => {
    const bookings = [];

    console.log("🔍 Debug - Flight Data:");
    console.log("Outbound Flight:", currentOutboundFlight);
    console.log("Return Flight:", currentReturnFlight);
    console.log("Is Round Trip:", isRoundTrip);

    if (currentOutboundFlight) {
      // FIXED: Use the correct date field and ensure it's properly formatted
      const flightDate = currentOutboundFlight.journey_date || currentOutboundFlight.date;
      
      if (!flightDate) {
        console.error("❌ Missing flight date in outbound flight:", currentOutboundFlight);
        throw new Error('Flight date is missing from outbound flight data');
      }

      const outboundFare = getIndividualFlightFare(false);
      
      // FIXED: Ensure total_amount is never 0 or null
      if (outboundFare <= 0) {
        throw new Error('Invalid fare amount for outbound flight');
      }

      const outboundBooking = {
        user_id: user?.id,
        user_email: user?.email,
        user_name: user?.name || '',
        flight_id: currentOutboundFlight.flight_id,
        payment_id: paymentId,
        passengers: [...passengers],
        travel_class: currentOutboundFlight.travel_class || 'economy',
        flight_from: currentOutboundFlight.from,
        flight_to: currentOutboundFlight.to,
        flight_date: flightDate,
        total_amount: outboundFare, // FIXED: Use calculated fare
      };

      console.log("📤 Sending outbound booking:", outboundBooking);
      bookings.push(outboundBooking);
    }

    if (isRoundTrip && currentReturnFlight) {
      // FIXED: Use the correct date field and ensure it's properly formatted
      const returnFlightDate = currentReturnFlight.journey_date || currentReturnFlight.date;

      if (!returnFlightDate) {
        console.error("❌ Missing flight date in return flight:", currentReturnFlight);
        throw new Error('Flight date is missing from return flight data');
      }

      const returnFare = getIndividualFlightFare(true);
      
      // FIXED: Ensure total_amount is never 0 or null
      if (returnFare <= 0) {
        throw new Error('Invalid fare amount for return flight');
      }

      const returnBooking = {
        user_id: user?.id,
        user_email: user?.email,
        user_name: user?.name || '',
        flight_id: currentReturnFlight.flight_id,
        payment_id: paymentId,
        passengers: [...passengers],
        travel_class: currentReturnFlight.travel_class || 'economy',
        flight_from: currentReturnFlight.from,
        flight_to: currentReturnFlight.to,
        flight_date: returnFlightDate,
        total_amount: returnFare, // FIXED: Use calculated fare
      };

      console.log("📤 Sending return booking:", returnBooking);
      bookings.push(returnBooking);
    }

    for (const booking of bookings) {
      console.log("📤 Final booking data being sent:", booking);
      
      const bookingRes = await fetch('/api/book-flight', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
        body: JSON.stringify(booking),
      });

      const bookingData = await bookingRes.json();
      if (!bookingRes.ok) {
        console.error("❌ API Error Response:", bookingData);
        throw new Error(bookingData.message || `API Error: ${bookingRes.status}`);
      }
    }
  };

  const handlePay = async () => {
    setShowValidation(true);

    const hasEmptyField = passengers.some(
      (p) => !p.name.trim() || !p.age.trim() || !p.gender.trim()
    );

    if (hasEmptyField) {
      setErrorMessage('Please fill all required fields (Name, Age, Gender) for all passengers.');
      setShowErrorModal(true);
      return;
    }

    if (!user?.id || !currentOutboundFlight?.flight_id) {
      setErrorMessage('User or flight information is incomplete.');
      setShowErrorModal(true);
      return;
    }

    // FIXED: Validate total fare before payment
    if (totalFare <= 0) {
      setErrorMessage('Invalid fare amount. Please refresh and try again.');
      setShowErrorModal(true);
      return;
    }

    const sdkLoaded = await loadRazorpayScript();
    if (!sdkLoaded) {
      alert('Razorpay SDK failed to load.');
      return;
    }

    const options: RazorpayOptions = {
      key: 'rzp_test_WnFqacWYcdg5qe',
      amount: totalFare * 100,
      currency: 'INR',
      name: 'Flight Booking',
      description: 'Flight Fare Payment',
      handler: async function (response: RazorpayResponse) {
        setIsProcessing(true);
        try {
          await saveBookingToDatabase(response.razorpay_payment_id);
          setSuccessMessage('Booking successful! ✈️ Your payment was processed.');
          setShowSuccessModal(true);
       
          
        } catch (error) {
          console.error("❌ Booking error:", error);
          setErrorMessage(
            error instanceof Error
              ? error.message
              : 'Payment succeeded but booking failed. Please contact support.'
          );
          setShowErrorModal(true);
        } finally {
          setIsProcessing(false);
        }
      },
      prefill: {
        name: passengers[0].name,
        email: user.email,
      },
      notes: {
        flight: currentOutboundFlight.flight_number ?? '',
      },
      theme: {
        color: '#000000',
      },
    };

    const rzp = new window.Razorpay(options);
    rzp.open();
  };

  return (
    <div className="max-w-5xl mx-auto mt-6 bg-white shadow-md rounded-lg p-6 space-y-4">
      <h2 className="text-xl font-semibold">Passenger Details</h2>
      <p className="text-sm text-gray-600">
        Booking for: <strong>{user?.email}</strong>
      </p>

      {/* Debug info - remove in production */}
      <div className="text-xs text-gray-500 border p-2 rounded">
        <p>Trip Type: {isRoundTrip ? 'Round Trip' : 'One Way'}</p>
        <p>Outbound Flight: {currentOutboundFlight?.flight_number || 'Not found'}</p>
        <p>Return Flight: {currentReturnFlight?.flight_number || 'Not found'}</p>
        <p>Total Fare: ₹{totalFare.toFixed(2)}</p>
        {isRoundTrip && (
          <>
            <p>Outbound Flight Total: ₹{getFlightTotal(false).toFixed(2)}</p>
            <p>Return Flight Total: ₹{getFlightTotal(true).toFixed(2)}</p>
          </>
        )}
      </div>

      {passengers.map((p, idx) => {
        const isNameMissing = !p.name.trim();
        const isAgeMissing = !p.age.trim();
        const isGenderMissing = !p.gender.trim();

        return (
          <div key={idx} className="grid grid-cols-1 lg:grid-cols-2 gap-4 mt-4">
            <div className="p-4 border rounded bg-gray-50 space-y-2">
              <h4 className="font-semibold text-sm">Outbound Passenger {idx + 1}</h4>

              <label className="text-sm font-medium block">Name*</label>
              <input
                type="text"
                placeholder="Name"
                className={`border rounded w-full mt-1 p-2 ${showValidation && isNameMissing ? 'border-red-500' : ''}`}
                value={p.name}
                onChange={(e) => updatePassenger(idx, 'name', e.target.value)}
              />

              <label className="text-sm font-medium block">Age*</label>
              <input
                type="number"
                placeholder="Age"
                className={`border rounded w-full mt-1 p-2 ${showValidation && isAgeMissing ? 'border-red-500' : ''}`}
                value={p.age}
                onChange={(e) => updatePassenger(idx, 'age', e.target.value)}
              />

              <label className="text-sm font-medium block">Gender*</label>
              <select
                value={p.gender}
                onChange={(e) => updatePassenger(idx, 'gender', e.target.value)}
                className={`border rounded w-full mt-1 p-2 ${showValidation && isGenderMissing ? 'border-red-500' : ''}`}
              >
                <option value="">Select</option>
                <option value="male">Male</option>
                <option value="female">Female</option>
                <option value="other">Other</option>
              </select>

              <p className="text-xs mt-1 italic text-gray-600">
                Passenger Type: <strong>{p.passenger_type}</strong> — ₹{getPassengerFare(p, false).toFixed(2)}
              </p>
            </div>

            {isRoundTrip && currentReturnFlight && (
              <div className="p-4 border rounded bg-gray-100 space-y-2">
                <h4 className="font-semibold text-sm">Return Passenger {idx + 1}</h4>

                <label className="text-sm font-medium block">Name*</label>
                <input
                  type="text"
                  value={p.name}
                  readOnly
                  className="border rounded w-full mt-1 p-2 bg-gray-200"
                />

                <label className="text-sm font-medium block">Age*</label>
                <input
                  type="number"
                  value={p.age}
                  readOnly
                  className="border rounded w-full mt-1 p-2 bg-gray-200"
                />

                <label className="text-sm font-medium block">Gender*</label>
                <input
                  type="text"
                  value={p.gender}
                  readOnly
                  className="border rounded w-full mt-1 p-2 bg-gray-200"
                />

                <p className="text-xs mt-1 italic text-gray-600">
                  Passenger Type: <strong>{p.passenger_type}</strong> — ₹{getPassengerFare(p, true).toFixed(2)}
                </p>
              </div>
            )}
          </div>
        );
      })}

      <button
        onClick={addPassenger}
        className="mt-2 text-sm text-blue-600 underline hover:text-blue-800"
      >
        + Add Traveller
      </button>

      {isRoundTrip && (
        <div className="mt-4 p-4 bg-gray-50 rounded border">
          <h4 className="font-semibold text-sm mb-2">Flight Breakdown:</h4>
          <div className="space-y-1 text-sm">
            <div className="flex justify-between">
              <span>Outbound Flight ({currentOutboundFlight?.flight_number}):</span>
              <span>₹{getFlightTotal(false).toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span>Return Flight ({currentReturnFlight?.flight_number}):</span>
              <span>₹{getFlightTotal(true).toFixed(2)}</span>
            </div>
            <div className="border-t pt-1 mt-2 flex justify-between font-semibold">
              <span>Total:</span>
              <span>₹{totalFare.toFixed(2)}</span>
            </div>
          </div>
        </div>
      )}

      <div className="mt-4 text-lg font-bold">Total Fare: ₹{totalFare.toFixed(2)}</div>

      <button
        onClick={handlePay}
        disabled={isProcessing}
        className={`px-6 py-2 rounded mt-4 ${isProcessing ? 'bg-gray-400 cursor-not-allowed' : 'bg-black hover:bg-gray-800'} text-white`}
      >
        {isProcessing ? 'Processing...' : 'Pay'}
      </button>

      {showErrorModal && <ErrorModal message={errorMessage} onClose={() => setShowErrorModal(false)} />}
      {showSuccessModal && <SuccessModal message={successMessage} onClose={() => setShowSuccessModal(false)} />}
    </div>
  );
};

export default PassengerPaymentForm;