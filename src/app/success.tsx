'use client';

import { CircleCheckBig } from 'lucide-react';
import { useRouter } from 'next/navigation';

interface SuccessModalProps {
  message: string;
  onClose: () => void;
}

const SuccessModal: React.FC<SuccessModalProps> = ({ message, onClose }) => {
  const router = useRouter()
  return (
    <div
      className="fixed inset-0 bg-opacity-30 flex items-center justify-center z-50"
      style={{ backgroundColor: 'rgba(0, 0, 0, 0.5)' }}
    >
      <div className="bg-white shadow-xl rounded-lg p-6 w-[90%] max-w-md">
        <div className="flex items-center justify-center w-12 h-12 mx-auto bg-green-100 rounded-full">
          <CircleCheckBig className="w-6 h-6 text-green-600" />
        </div>

        <div className="mt-4 text-center">
          <p className="text-sm text-gray-700">{message}</p>
        </div>

        <div className="mt-6 flex justify-center">
         <button
  onClick={() => {
    onClose();
    router.push('/bookings');
  }}
  className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500"
>
  Close
</button>
        </div>
      </div>
    </div>
  );
};

export default SuccessModal;
