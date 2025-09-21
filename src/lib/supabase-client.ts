import { createPagesBrowserClient } from '@supabase/auth-helpers-nextjs';
import { Database } from '@/types/supabase';

// Ambil variabel dari environment
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

// Validasi untuk memastikan variabel ada
if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error("Supabase URL and Anon Key must be defined in .env.local");
}

// Buat client dengan memberikan URL dan Key secara eksplisit
export const createClient = () => createPagesBrowserClient<Database>({
  supabaseUrl: supabaseUrl,
  supabaseKey: supabaseAnonKey,
});