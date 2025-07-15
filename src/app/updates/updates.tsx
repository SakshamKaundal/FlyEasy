'use client'
import { useEffect, useState } from "react";

interface BookingUpdate {
  id: string;
  updated_at: string;
  timestamp: string;
}

const Updates = () => {
  const [updates, setUpdates] = useState<BookingUpdate[]>([]);
  const [connectionStatus, setConnectionStatus] = useState<'connecting' | 'connected' | 'disconnected'>('connecting');
  const [lastHeartbeat, setLastHeartbeat] = useState<string>('');

  useEffect(() => {
    const eventSource = new EventSource('/api/flight-updates');

    eventSource.onopen = () => {
      console.log('✅ SSE connection opened');
      setConnectionStatus('connected');
    };

    eventSource.onmessage = (event) => {
      const message = JSON.parse(event.data);
      console.log('📦 SSE message:', message);
      
      switch (message.type) {
        case 'connected':
          console.log('🔗 Connected to SSE');
          setConnectionStatus('connected');
          break;
          
        case 'heartbeat':
          setLastHeartbeat(message.timestamp);
          console.log('💓 Heartbeat received:', message.timestamp);
          break;
          
        case 'update':
          console.log('📦 Booking update:', message.data);
          // Add new updates to the state
          setUpdates(prev => [...message.data.map((update: { id: string; updated_at: string }) => ({
            ...update,
            timestamp: message.timestamp
          })), ...prev]);
          break;
          
        case 'error':
          console.error('❌ Server error:', message.message);
          break;
          
        default:
          // Handle legacy format (your original data structure)
          if (Array.isArray(message)) {
            setUpdates(prev => [...message.map((update: { id: string; updated_at: string }) => ({
              ...update,
              timestamp: new Date().toISOString()
            })), ...prev]);
          }
      }
    };

    eventSource.onerror = (err) => {
      console.error('❌ SSE connection error:', err);
      setConnectionStatus('disconnected');
    };

    return () => {
      eventSource.close();
      setConnectionStatus('disconnected');
    };
  }, []);

  const formatTime = (timestamp: string) => {
    return new Date(timestamp).toLocaleString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });
  };

  const clearUpdates = () => {
    setUpdates([]);
  };

  const getStatusColor = () => {
    switch (connectionStatus) {
      case 'connected': return 'bg-green-500';
      case 'connecting': return 'bg-yellow-500';
      case 'disconnected': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-4">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-800">Flight Updates</h2>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <div className={`w-2 h-2 rounded-full ${getStatusColor()}`}></div>
            <span className="text-sm text-gray-600 capitalize">{connectionStatus}</span>
          </div>
          <button
            onClick={clearUpdates}
            className="px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600 transition-colors text-sm"
          >
            Clear All
          </button>
        </div>
      </div>

      {lastHeartbeat && (
        <div className="mb-4 text-sm text-gray-500">
          Last heartbeat: {formatTime(lastHeartbeat)}
        </div>
      )}
      
      {updates.length === 0 ? (
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-6 text-center">
          <div className="text-gray-500 text-lg mb-2">🔄 Listening for flight updates...</div>
          <div className="text-gray-400 text-sm">Updates will appear here when bookings are modified</div>
        </div>
      ) : (
        <div className="space-y-4">
          {updates.map((update: BookingUpdate, index: number) => (
            <div
              key={`${update.id}-${index}`}
              className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm hover:shadow-md transition-shadow"
            >
              <div className="flex justify-between items-start mb-3">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
                  <span className="text-sm font-medium text-blue-600">Booking Updated</span>
                </div>
                <span className="text-xs text-gray-500">
                  {formatTime(update.timestamp)}
                </span>
              </div>
              
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium text-gray-700">Booking ID:</span>
                  <code className="text-sm bg-gray-100 px-2 py-1 rounded text-gray-800 font-mono">
                    {update.id}
                  </code>
                </div>
                
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium text-gray-700">Updated At:</span>
                  <span className="text-sm text-gray-600">
                    {formatTime(update.updated_at)}
                  </span>
                </div>
              </div>
              
              <div className="mt-3 pt-3 border-t border-gray-100">
                <div className="flex items-center gap-2 text-sm text-gray-500">
                  <span>📦</span>
                  <span>Booking details have been modified</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
      
      {updates.length > 0 && (
        <div className="mt-6 text-center">
          <div className="text-sm text-gray-500">
            Showing {updates.length} recent update{updates.length !== 1 ? 's' : ''}
          </div>
        </div>
      )}
    </div>
  );
};

export default Updates;