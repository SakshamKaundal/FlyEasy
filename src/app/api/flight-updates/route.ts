import { supabase } from "@/lib/superbaseClient";
import { NextRequest } from "next/server";

export const dynamic = 'force-dynamic'; 

export async function GET(req: NextRequest) {
  const { readable, writable } = new TransformStream();
  const writer = writable.getWriter();
  const encoder = new TextEncoder();

  const send = (data: unknown) => {
    writer.write(encoder.encode(`data: ${JSON.stringify(data)}\n\n`));
  };

  let lastCheck = new Date().toISOString(); 

  const interval = setInterval(async () => {
    const { data, error } = await supabase
      .from('bookings')
      .select('id, updated_at')
      .gt('updated_at', lastCheck);

    if (error) {
      console.error("Supabase polling error:", error.message);
      return;
    }

    if (data && data.length > 0) {
      lastCheck = new Date().toISOString();
      console.log("📦 SSE Update: Booking changes detected", data);
      send(data);
    }
  }, 5000);

  req.signal.addEventListener('abort', () => {
    clearInterval(interval);
    writer.close();
  });

  return new Response(readable, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache, no-transform',
      'Connection': 'keep-alive',
    },
  });
}
