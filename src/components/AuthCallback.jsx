// src/components/AuthCallback.jsx
import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../supabaseClient'

function AuthCallback() {
  const navigate = useNavigate()

  useEffect(() => {
    async function handleAuthCallback() {
      try {
        // This will automatically parse the URL and set the session
        const { data: { session }, error } = await supabase.auth.getSession()
        
        if (error) throw error
        
        if (session?.user) {
          // Redirect to dashboard or wherever you want
          navigate('/host-dashboard')
        } else {
          // If no session, redirect to login
          navigate('/host-signin')
        }
      } catch (error) {
        console.error('Error handling auth callback:', error)
        navigate('/host-signin')
      }
    }

    handleAuthCallback()
  }, [navigate])

  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-center">
        <h2 className="text-xl font-semibold text-gray-800">Completing Authentication...</h2>
        <p className="mt-2 text-gray-600">Please wait while we verify your session.</p>
      </div>
    </div>
  )
}

export default AuthCallback