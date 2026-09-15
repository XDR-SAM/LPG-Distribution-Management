import { createClient, SupabaseClient } from '@supabase/supabase-js';

// Read Supabase credentials from Vite environment
const metaEnv = (import.meta as unknown as { env?: Record<string, string | undefined> }).env || {};
const supabaseUrl = metaEnv.VITE_SUPABASE_URL;
const supabaseAnonKey = metaEnv.VITE_SUPABASE_ANON_KEY;

export const isSupabaseConfigured = (): boolean => {
  return Boolean(
    supabaseUrl && 
    supabaseAnonKey && 
    supabaseUrl.startsWith('https://') && 
    supabaseAnonKey.length > 20
  );
};

export const getSupabaseConfig = () => {
  return {
    url: supabaseUrl || '',
    anonKey: supabaseAnonKey || '',
    isConfigured: isSupabaseConfigured(),
  };
};

let supabaseInstance: SupabaseClient | null = null;

export const getSupabase = (): SupabaseClient | null => {
  if (!isSupabaseConfigured()) {
    return null;
  }

  if (!supabaseInstance && supabaseUrl && supabaseAnonKey) {
    supabaseInstance = createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
      },
    });
  }

  return supabaseInstance;
};

export interface SupabaseHealth {
  configured: boolean;
  connected: boolean;
  message: string;
  latencyMs?: number;
  tables?: { name: string; count: number }[];
}

export const checkSupabaseConnection = async (): Promise<SupabaseHealth> => {
  if (!isSupabaseConfigured()) {
    return {
      configured: false,
      connected: false,
      message: 'Supabase URL and Anon Key are not yet configured in environment variables (VITE_SUPABASE_URL, VITE_SUPABASE_ANON_KEY). Operating in local storage mode.',
    };
  }

  const client = getSupabase();
  if (!client) {
    return {
      configured: false,
      connected: false,
      message: 'Failed to initialize Supabase client instance.',
    };
  }

  const start = performance.now();
  try {
    // Attempt a light query to test connectivity
    const { data, error } = await client.from('products').select('id', { count: 'exact', head: true });
    const latency = Math.round(performance.now() - start);

    if (error) {
      // Table may not exist yet if migrations haven't run (Postgres 42P01 or PostgREST PGRST205)
      if (
        error.code === '42P01' || 
        error.code === 'PGRST205' || 
        error.message.includes('does not exist') || 
        error.message.includes('schema cache')
      ) {
        return {
          configured: true,
          connected: true,
          message: 'Connected to Supabase project! Database tables need to be created using the provided SQL schema migration script in Supabase SQL Editor.',
          latencyMs: latency,
        };
      }
      return {
        configured: true,
        connected: false,
        message: `Supabase query error: ${error.message}`,
        latencyMs: latency,
      };
    }

    return {
      configured: true,
      connected: true,
      message: 'Successfully connected to Supabase PostgreSQL database.',
      latencyMs: latency,
    };
  } catch (err: any) {
    return {
      configured: true,
      connected: false,
      message: `Network or connection failure: ${err?.message || 'Unknown error'}`,
    };
  }
};
