import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error(
    'Supabase URL and Anon Key must be provided in environment variables'
  )
}

// Enhanced Supabase client configuration
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true,
    flowType: 'pkce', // More secure auth flow
    storage: typeof window !== 'undefined' ? localStorage : undefined,
    storageKey: 'sb-auth-token'
  },
  db: {
    schema: 'public'
  }
})

// Enhanced auth state listener with error handling
supabase.auth.onAuthStateChange(async (event, session) => {
  console.log('Auth state changed:', event, session)
  
  try {
    // Handle specific auth events
    switch (event) {
      case 'SIGNED_IN':
        // Ensure user exists in your profiles/hosts table
        if (session?.user) {
          const { data: profile } = await supabase
            .from('hosts')
            .select('id')
            .eq('id', session.user.id)
            .single()
            
          if (!profile) {
            // Create profile if doesn't exist
            await supabase.from('hosts').insert({
              id: session.user.id,
              email: session.user.email,
              // Add other default fields
            })
          }
        }
        break
        
      case 'SIGNED_OUT':
        // Clear any sensitive client-side data
        break
        
      case 'TOKEN_REFRESHED':
        // Handle token refresh
        break
    }
  } catch (error) {
    console.error('Auth state change error:', error)
  }
})

// Helper function to ensure session is valid
export const getValidSession = async () => {
  try {
    const { data: { session }, error } = await supabase.auth.getSession()
    if (error) throw error
    return session
  } catch (error) {
    console.error('Session error:', error)
    return null
  }
}

// Helper for RLS-enabled queries
export const secureQuery = async (table, query) => {
  const session = await getValidSession()
  if (!session) throw new Error('Not authenticated')
  
  return supabase
    .from(table)
    .select(query)
    .throwOnError()
}