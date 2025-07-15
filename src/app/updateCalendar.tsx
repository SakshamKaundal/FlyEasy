"use client";

import { useEffect, useRef } from "react";
import Calendar from "react-calendar";
import 'react-calendar/dist/Calendar.css';
interface CalendarPopupProps {
  isOpen: boolean;
  onClose: () => void;
  onDateSelect: (date: Date) => void;
  bookingId: string | null;
}

const CalendarPopup: React.FC<CalendarPopupProps> = ({ isOpen, onClose, onDateSelect }) => {
  const modalRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (modalRef.current && !modalRef.current.contains(event.target as Node)) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0  bg-opacity-40 flex justify-center items-center z-50"
     style={{ backgroundColor: "#101010CC" }}
    >
      <div
        ref={modalRef}
        className="bg-white rounded-lg shadow-xl p-6 max-w-sm w-full"
      >
        <h2 className="text-lg font-semibold mb-4">Select new Journey Date</h2>
        <Calendar
          onChange={(date) => {
            onDateSelect(date as Date);
            onClose();
          }}
        />
       <div className="flex justify-center items-center gap-5 mt-4">
  <button
    onClick={onClose}
    className="text-sm text-gray-600 hover:text-black"
  >
    Cancel
  </button>
  <button className="bg-black text-white px-4 py-2 rounded-md text-sm hover:scale-95 transform transition duration-100">
    Update
  </button>
</div>

      </div>
    </div>
  );
};

export default CalendarPopup;
