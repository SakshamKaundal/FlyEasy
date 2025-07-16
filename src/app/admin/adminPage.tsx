'use client';
import React, { useState, useEffect } from 'react';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  CartesianGrid,
} from 'recharts';

interface RouteStats {
  flight_from: string;
  flight_to: string;
  trip_count: number;
  total_revenue: number;
}

interface GenderStat {
  gender: string;
  count: number;
}

interface BookingTrend {
  month: string;
  booking_count: number;
}

interface DashboardData {
  topRoutes: RouteStats[];
  totalEarnings: number;
  genderStats: GenderStat[];
  bookingTrends: BookingTrend[];
}

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d'];

export default function Dashboard() {
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);


  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        const response = await fetch('/api/dashboard');
        
        if (!response.ok) {
          throw new Error('Failed to fetch dashboard data');
        }
        
        const data = await response.json();
        setDashboardData(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="text-red-600 text-xl">Error: {error}</div>
      </div>
    );
  }

  if (!dashboardData) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="text-gray-600 text-xl">No data available</div>
      </div>
    );
  }

  const routeChartData = dashboardData.topRoutes.map(route => ({
    route: `${route.flight_from} → ${route.flight_to}`,
    bookings: route.trip_count,
    revenue: route.total_revenue,
  }));

  const genderChartData = dashboardData.genderStats.map(stat => ({
    gender: stat.gender.charAt(0).toUpperCase() + stat.gender.slice(1),
    count: stat.count,
  }));

  const bookingTrendsData = dashboardData.bookingTrends.map(trend => ({
    month: new Date(trend.month + '-01').toLocaleDateString('en-US', { 
      month: 'short', 
      year: 'numeric' 
    }),
    bookings: trend.booking_count,
  }));

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
    }).format(value);
  };

  return (
    
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-800 mb-4">Flight Booking Dashboard</h1>
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-6 rounded-2xl shadow-lg">
          <h2 className="text-2xl font-semibold mb-2">Total Earnings</h2>
          <p className="text-4xl font-bold">{formatCurrency(dashboardData.totalEarnings)}</p>
          <p className="text-blue-100 mt-2">Revenue generated from all bookings</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-2xl shadow-md">
          <h2 className="text-xl font-semibold mb-4 text-gray-800">Most Popular Routes</h2>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={routeChartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis 
                dataKey="route" 
                angle={-45}
                textAnchor="end"
                height={80}
                fontSize={12}
              />
              <YAxis />
              <Tooltip 
                formatter={(value, name) => [
                  name === 'bookings' ? `${value} bookings` : formatCurrency(Number(value)),
                  name === 'bookings' ? 'Bookings' : 'Revenue'
                ]}
              />
              <Legend />
              <Bar dataKey="bookings" fill="#3B82F6" name="Bookings" />
            </BarChart>
          </ResponsiveContainer>
          <p className="text-sm text-gray-600 mt-4">
            Shows the top 4 most booked flight routes based on booking frequency.
            Higher bars indicate more popular destinations among travelers.
          </p>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-md">
          <h2 className="text-xl font-semibold mb-4 text-gray-800">Passenger Gender Distribution</h2>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={genderChartData}
                dataKey="count"
                nameKey="gender"
                cx="50%"
                cy="50%"
                outerRadius={100}
                label={({ gender, count, percent }) => 
                  `${gender}: ${count} (${percent ? (percent * 100).toFixed(1) : '0'}%)`
                }
              >
                {genderChartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip formatter={(value) => [`${value} passengers`, 'Count']} />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
          <p className="text-sm text-gray-600 mt-4">
            Breakdown of passenger demographics by gender across all bookings.
            Helps understand customer base composition for targeted marketing.
          </p>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-md lg:col-span-2">
          <h2 className="text-xl font-semibold mb-4 text-gray-800">Monthly Booking Trends</h2>
          <ResponsiveContainer width="100%" height={350}>
            <LineChart data={bookingTrendsData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip formatter={(value) => [`${value} bookings`, 'Bookings']} />
              <Legend />
              <Line 
                type="monotone" 
                dataKey="bookings" 
                stroke="#8B5CF6" 
                strokeWidth={3}
                dot={{ r: 6 }}
                activeDot={{ r: 8 }}
                name="Monthly Bookings"
              />
            </LineChart>
          </ResponsiveContainer>
          <p className="text-sm text-gray-600 mt-4">
            Monthly booking volume over time showing seasonal patterns and growth trends.
            Peaks may indicate holiday seasons or promotional periods driving increased bookings.
          </p>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-md lg:col-span-2">
          <h2 className="text-xl font-semibold mb-4 text-gray-800">Revenue by Route</h2>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={routeChartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis 
                dataKey="route" 
                angle={-45}
                textAnchor="end"
                height={80}
                fontSize={12}
              />
              <YAxis tickFormatter={(value) => formatCurrency(value)} />
              <Tooltip 
                formatter={(value) => [formatCurrency(Number(value)), 'Revenue']}
              />
              <Legend />
              <Bar dataKey="revenue" fill="#10B981" name="Revenue" />
            </BarChart>
          </ResponsiveContainer>
          <p className="text-sm text-gray-600 mt-4">
            Revenue generated from each popular route, showing which destinations contribute most to earnings.
            Higher revenue routes may indicate premium pricing or higher booking volumes.
          </p>
        </div>
      </div>
    </div>
  );
}