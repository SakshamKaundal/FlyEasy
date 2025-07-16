// app/unauthorized/page.tsx
'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function UnauthorizedPage() {
  const router = useRouter();

  useEffect(() => {
    const timer = setTimeout(() => {
      router.push('/user');
    }, 5000);

    return () => clearTimeout(timer);
  }, [router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full bg-white shadow-lg rounded-lg p-8 text-center">
        <div className="mb-6">
          <div className="text-6xl font-bold text-red-500 mb-2">404</div>
          <h1 className="text-2xl font-semibold text-gray-800 mb-4">
            Unauthorized Access
          </h1>
          <p className="text-gray-600 mb-6">
            You don't have permission to access this page. Admin privileges are required.
          </p>
        </div>
        
        <div className="space-y-4">
          <button
            onClick={() => router.push('/login')}
            className="w-full bg-blue-500 hover:bg-blue-600 text-white font-medium py-2 px-4 rounded-md transition-colors"
          >
            Go to Login
          </button>
          
          <button
            onClick={() => router.push('/')}
            className="w-full bg-gray-500 hover:bg-gray-600 text-white font-medium py-2 px-4 rounded-md transition-colors"
          >
            Go to Home
          </button>
        </div>
        
        <div className="mt-6 text-sm text-gray-500">
          <p>Redirecting to login in 5 seconds...</p>
        </div>
      </div>
    </div>
  );
}