import { createClient } from "@supabase/supabase-js";

//const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
//const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
//export const supabase = createClient(supabaseUrl , supabaseKey);
export const supabase = createClient("https://qecwxkgqrqjrbxpspjnf.supabase.co", "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFlY3d4a2dxcnFqcmJ4cHNwam5mIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTIzMDQ5MTAsImV4cCI6MjA2Nzg4MDkxMH0.SP3eqOeTcEmY8jJcmS6AgZPo-wB1--2tNPxsTgV5alE");
