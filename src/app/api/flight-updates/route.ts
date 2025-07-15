import { supabase } from "@/lib/superbaseClient";
import { NextRequest } from "next/server";

export const dynamic = 'force-dynamic'; 

export async function GET(req: NextRequest) {
  const { readable, writable } = new TransformStream();
  const writer = writable.getWriter();
  const encoder = new TextEncoder();

  const send = (data: unknown) => {
    const message = `data: ${JSON.stringify(data)}\n\n`;
    writer.write(encoder.encode(message));
  };

  let lastCheck = new Date().toISOString(); 
  console.log("🚀 SSE Connection established, lastCheck:", lastCheck);

  // Send initial heartbeat
  send({ type: 'connected', timestamp: new Date().toISOString() });

  const interval = setInterval(async () => {
    try {
      const { data, error } = await supabase
        .from('bookings')
        .select('id, updated_at')
        .gt('updated_at', lastCheck)
        .order('updated_at', { ascending: false });

      if (error) {
        console.error("❌ Supabase polling error:", error.message);
        send({ type: 'error', message: error.message });
        return;
      }

      // Send heartbeat every interval
      send({ type: 'heartbeat', timestamp: new Date().toISOString(), lastCheck });
    
      if (data && data.length > 0) {
        // Update lastCheck to the latest updated_at timestamp
        const latestUpdate = data.reduce((latest, current) => 
          current.updated_at > latest ? current.updated_at : latest, 
          data[0].updated_at
        );
        lastCheck = latestUpdate;
        
        console.log("📦 SSE Update: Booking changes detected", data);
        send({ type: 'update', data, timestamp: new Date().toISOString() });
      }
    } catch (err) {
      console.error("❌ Polling error:", err);
      send({ type: 'error', message: 'Polling failed' });
    }
  }, 5000);

  req.signal.addEventListener('abort', () => {
    console.log("🔌 SSE Connection closed");
    clearInterval(interval);
    writer.close();
  });

  return new Response(readable, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache, no-transform',
      'Connection': 'keep-alive',
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Headers': 'Cache-Control',
    },
  });
}