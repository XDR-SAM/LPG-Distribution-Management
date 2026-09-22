import { createClient, SupabaseClient } from '@supabase/supabase-js';

// Read Supabase credentials from Vite environment (browser) or process.env (Node/SSR/scripts)
const metaEnv = typeof import.meta !== 'undefined' && (import.meta as any).env ? (import.meta as any).env : {};
const procEnv = typeof process !== 'undefined' && process.env ? process.env : {};
const supabaseUrl = (metaEnv.VITE_SUPABASE_URL || procEnv.VITE_SUPABASE_URL) as string | undefined;
const supabaseAnonKey = (metaEnv.VITE_SUPABASE_ANON_KEY || procEnv.VITE_SUPABASE_ANON_KEY) as string | undefined;

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

export const supabase: SupabaseClient = createClient(
  supabaseUrl || 'https://placeholder.supabase.co',
  supabaseAnonKey || 'placeholder-anon-key',
  {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
    },
  }
);

export const getSupabase = (): SupabaseClient => supabase;



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
