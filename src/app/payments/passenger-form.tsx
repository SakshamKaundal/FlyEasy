'use client';

import { useEffect, useState } from 'react';
import { useUserInformation } from '@/components/context-api/save-user-context';
import { useBookingStore } from '@/zustand-store/flight-booking-store';
import { useFareStore } from '@/zustand-store/base-fare-store';
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
  const { user } = useUserInformation();
  const { selectedFlight } = useBookingStore();
  const { fares, setFares } = useFareStore();

  const [passengerCount, setPassengerCount] = useState(1);
  const [passengers, setPassengers] = useState<Passenger[]>([
    { name: '', age: '', gender: '', passenger_type: 'adult' },
  ]);
  const [showErrorModal, setShowErrorModal] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [showValidation, setShowValidation] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    const fetchFares = async () => {
      if (!selectedFlight?.flight_number || !selectedFlight?.travel_class) return;
      try {
        const res = await fetch('/api/base-fare-with-id', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            flight_number: selectedFlight.flight_number,
            travel_class: selectedFlight.travel_class,
          }),
        });
        const data = await res.json();
        if (res.ok && data.fares) {
          setFares(data.fares);
        }
      } catch (err) {
        return err;
      }
    };
    fetchFares();
  }, [selectedFlight]);

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

  const handlePassengerCountChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const count = parseInt(e.target.value, 10);
    setPassengerCount(count);
    const updated = Array.from({ length: count }, (_, i) =>
      passengers[i] || { name: '', age: '', gender: '', passenger_type: 'adult' }
    );
    setPassengers(updated);
  };

  const totalFare = passengers.reduce(
    (sum, p) => sum + (fares[p.passenger_type] || 0),
    0
  );

  const loadRazorpayScript = (): Promise<boolean> => {
    return new Promise((resolve) => {
      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  };

  const saveBookingToDatabase = async (paymentId: string) => {
    try {
      const bookingRes = await fetch('/api/book-flight', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
        body: JSON.stringify({
          user_id: user?.id,
          user_email: user?.email,
          user_name: user?.name || '',
          flight_id: selectedFlight?.flight_id,
          payment_id: paymentId,
          passengers: passengers,
        }),
      });

      const bookingData = await bookingRes.json();
      if (!bookingRes.ok) {
        throw new Error(bookingData.message || `API Error: ${bookingRes.status}`);
      }
    } catch (error) {
      throw error;
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

    if (!user?.id || !selectedFlight?.flight_id) {
      setErrorMessage('User or flight information is incomplete.');
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
      description: 'Test Transaction',
      handler: async function (response: RazorpayResponse) {
        setIsProcessing(true);
        try {
          await saveBookingToDatabase(response.razorpay_payment_id);
          setSuccessMessage('Booking successful! ✈️ Your payment was processed.');
          setShowSuccessModal(true);
        } catch (error) {
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
        flight: selectedFlight.flight_number ?? '',
      },
      theme: {
        color: '#000000',
      },
    };

    const rzp = new window.Razorpay(options);
    rzp.open();
  };

  return (
    <div className="max-w-3xl mx-auto mt-6 bg-white shadow-md rounded-lg p-6 space-y-4">
      <h2 className="text-xl font-semibold">Passenger Details</h2>
      <p className="text-sm text-gray-600">
        Booking for: <strong>{user?.email}</strong>
      </p>

      <label className="block mt-4 font-medium">Number of Passengers</label>
      <select
        value={passengerCount}
        onChange={handlePassengerCountChange}
        className="border rounded px-3 py-2"
      >
        {[...Array(10)].map((_, i) => (
          <option key={i + 1} value={i + 1}>
            {i + 1}
          </option>
        ))}
      </select>

      {passengers.map((p, idx) => {
        const isNameMissing = !p.name.trim();
        const isAgeMissing = !p.age.trim();
        const isGenderMissing = !p.gender.trim();

        return (
          <div key={idx} className="p-4 border rounded bg-gray-50 mt-2 space-y-2">
            <h4 className="font-semibold text-sm">Passenger {idx + 1}</h4>

            <label className="text-sm font-medium">
              Name<span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              placeholder="Name"
              className={`border rounded w-full mt-1 p-2 ${
                showValidation && isNameMissing ? 'border-red-500' : ''
              }`}
              value={p.name}
              onChange={(e) => updatePassenger(idx, 'name', e.target.value)}
            />

            <label className="text-sm font-medium">
              Age<span className="text-red-500">*</span>
            </label>
            <input
              type="number"
              placeholder="Age"
              className={`border rounded w-full mt-1 p-2 ${
                showValidation && isAgeMissing ? 'border-red-500' : ''
              }`}
              value={p.age}
              onChange={(e) => updatePassenger(idx, 'age', e.target.value)}
            />

            <label className="text-sm font-medium">
              Gender<span className="text-red-500">*</span>
            </label>
            <select
              value={p.gender}
              onChange={(e) => updatePassenger(idx, 'gender', e.target.value)}
              className={`border rounded w-full mt-1 p-2 ${
                showValidation && isGenderMissing ? 'border-red-500' : ''
              }`}
            >
              <option value="">Select Gender</option>
              <option value="male">Male</option>
              <option value="female">Female</option>
              <option value="other">Other</option>
            </select>

            <p className="text-xs mt-1 italic text-gray-600">
              Passenger Type: <strong>{p.passenger_type}</strong> — ₹
              {fares[p.passenger_type]}
            </p>
          </div>
        );
      })}

      <div className="mt-4 text-lg font-bold">
        Total Fare: ₹{totalFare.toFixed(2)}
      </div>

      <button
        onClick={handlePay}
        disabled={isProcessing}
        className={`px-6 py-2 rounded mt-4 ${
          isProcessing ? 'bg-gray-400 cursor-not-allowed' : 'bg-black hover:bg-gray-800'
        } text-white`}
      >
        {isProcessing ? 'Processing...' : 'Pay'}
      </button>

      {showErrorModal && (
        <ErrorModal
          message={errorMessage}
          onClose={() => setShowErrorModal(false)}
        />
      )}

      {showSuccessModal && (
        <SuccessModal
          message={successMessage}
          onClose={() => setShowSuccessModal(false)}
        />
      )}
    </div>
  );
};

export default PassengerPaymentForm;
