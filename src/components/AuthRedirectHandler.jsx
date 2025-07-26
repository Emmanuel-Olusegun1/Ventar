// src/components/AuthRedirectHandler.js
import { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { supabase } from '../supabaseClient';

function AuthRedirectHandler() {
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    async function handleAuthRedirect() {
      try {
        // Extract the hash fragment from the URL
        const hash = location.hash.substring(1); // Remove the '#' character
        const params = new URLSearchParams(hash);
        
        // Get the access token and other parameters
        const access_token = params.get('access_token');
        const refresh_token = params.get('refresh_token');
        const expires_in = params.get('expires_in');
        const token_type = params.get('token_type');
        const type = params.get('type');

        if (access_token && refresh_token) {
          // Set the session using the tokens
          const { error } = await supabase.auth.setSession({
            access_token,
            refresh_token
          });

          if (error) throw error;

          // Redirect to dashboard after successful authentication
          navigate('/host-dashboard');
        } else {
          navigate('/host-signin');
        }
      } catch (error) {
        console.error('Error handling auth redirect:', error);
        navigate('/host-signin');
      }
    }

    handleAuthRedirect();
  }, [location, navigate]);

  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-center">
        <h2 className="text-xl font-semibold text-gray-800">Completing Authentication...</h2>
        <p className="mt-2 text-gray-600">Please wait while we verify your email.</p>
      </div>
    </div>
  );
}

export default AuthRedirectHandler;