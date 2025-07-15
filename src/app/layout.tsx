// ✅ app/layout.tsx — SERVER COMPONENT (no 'use client')
import './globals.css';
import { Geist, Geist_Mono } from 'next/font/google';
import ClientLayout from './ClientLayout';
import { ReactNode } from 'react';

const geistSans = Geist({ variable: '--font-geist-sans', subsets: ['latin'] });
const geistMono = Geist_Mono({ variable: '--font-geist-mono', subsets: ['latin'] });

export const metadata = {
  title: 'Flight Booking',
  description: 'Flight Bookings',
 
};

export const viewport = {
  themeColor: '#fff',
};
export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        <ClientLayout>{children}</ClientLayout>
      </body>
    </html>
  );
}
