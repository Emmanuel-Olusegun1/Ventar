import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error(
    'Supabase URL and Anon Key must be provided in environment variables'
  )
}

// Enhanced Supabase client with error handling for extension conflicts
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true,
    flowType: 'pkce',
    storage: {
      getItem: (key) => {
        try {
          return localStorage.getItem(key);
        } catch (error) {
          if (error.message.includes('Failed to read')) {
            console.warn('LocalStorage access blocked by browser settings');
            return null;
          }
          throw error;
        }
      },
      setItem: (key, value) => {
        try {
          localStorage.setItem(key, value);
        } catch (error) {
          if (error.message.includes('Failed to write')) {
            console.warn('LocalStorage write blocked by browser settings');
          }
        }
      },
      removeItem: (key) => {
        try {
          localStorage.removeItem(key);
        } catch (error) {
          if (error.message.includes('Failed to remove')) {
            console.warn('LocalStorage remove blocked by browser settings');
          }
        }
      }
    }
  },
  global: {
    headers: {
      'X-Client-Info': 'ventar-app'
    }
  }
})

// Enhanced auth state listener with error handling
export const setupAuthListener = (callback) => {
  const { data: { subscription } } = supabase.auth.onAuthStateChange(
    async (event, session) => {
      try {
        await callback(event, session);
      } catch (error) {
        console.error('Auth listener error:', error);
        // Don't throw to prevent breaking the auth flow
      }
    }
  );

  return () => {
    if (subscription) {
      subscription.unsubscribe();
    }
  };
}

// Helper function to ensure session is valid
export const getValidSession = async () => {
  try {
    const { data: { session }, error } = await supabase.auth.getSession();
    
    if (error) {
      console.error('Session error:', error);
      return null;
    }
    
    if (!session) {
      console.log('No active session found');
      return null;
    }
    
    return session;
  } catch (error) {
    console.error('Unexpected session error:', error);
    return null;
  }
}

// Safe query function with error handling
export const safeQuery = async (table, options = {}) => {
  try {
    const { select = '*', filters = {}, order = {} } = options;
    
    let query = supabase.from(table).select(select);
    
    // Apply filters
    Object.entries(filters).forEach(([key, value]) => {
      query = query.eq(key, value);
    });
    
    // Apply ordering
    if (order.column) {
      query = query.order(order.column, { 
        ascending: order.ascending !== false 
      });
    }
    
    const { data, error } = await query;
    
    if (error) {
      console.error(`Query error for table ${table}:`, error);
      throw error;
    }
    
    return data;
  } catch (error) {
    console.error(`Unexpected error querying ${table}:`, error);
    throw error;
  }
}

// Error handler for extension conflicts
if (typeof window !== 'undefined') {
  const originalConsoleError = console.error;
  console.error = function(...args) {
    // Suppress extension communication errors
    if (args[0]?.message?.includes?.('Could not establish connection') ||
        args[0]?.includes?.('Receiving end does not exist')) {
      return;
    }
    originalConsoleError.apply(console, args);
  };
}