"use client";

import { Mail, Phone, PlaneTakeoff, MapPin } from "lucide-react";

export default function ContactUs() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-white flex items-center justify-center px-4 py-10">
      <div className="w-full max-w-3xl bg-white shadow-2xl rounded-3xl p-8 sm:p-12 space-y-8 border border-blue-100">
        <div className="text-center">
          <h1 className="text-3xl sm:text-4xl font-bold text-blue-700">Contact Us</h1>
          <p className="mt-2 text-gray-600 text-sm sm:text-base">
            We’d love to hear from you! For any flight booking-related queries, feel free to reach out.
          </p>
        </div>

        <div className="space-y-6">
          <div className="flex items-center gap-4 bg-blue-50 p-4 rounded-xl shadow-sm">
            <Mail className="text-blue-600 w-6 h-6" />
            <div>
              <p className="text-sm text-gray-600">Email</p>
              <a href="mailto:saxena.ritank@gmail.com" className="text-blue-800 font-medium text-base">saxena.ritank@gmail.com</a>
            </div>
          </div>

          <div className="flex items-center gap-4 bg-blue-50 p-4 rounded-xl shadow-sm">
            <Phone className="text-blue-600 w-6 h-6" />
            <div>
              <p className="text-sm text-gray-600">Phone</p>
              <a href="tel:+919399039501" className="text-blue-800 font-medium text-base">+91 93990 39501</a>
            </div>
          </div>

          <div className="flex items-center gap-4 bg-blue-50 p-4 rounded-xl shadow-sm">
            <PlaneTakeoff className="text-blue-600 w-6 h-6" />
            <div>
              <p className="text-sm text-gray-600">Booking Queries</p>
              <p className="text-blue-800 font-medium text-base">Feel free to contact us for updates and queries related to your flight bookings.</p>
            </div>
          </div>

          <div className="flex items-center gap-4 bg-blue-50 p-4 rounded-xl shadow-sm">
            <MapPin className="text-blue-600 w-6 h-6" />
            <div>
              <p className="text-sm text-gray-600">Location</p>
              <p className="text-blue-800 font-medium text-base">Available online across India</p>
            </div>
          </div>
        </div>

        <div className="text-center pt-4">
          <p className="text-sm text-gray-500">We usually respond within a few hours!</p>
        </div>
      </div>
    </div>
  );
}
