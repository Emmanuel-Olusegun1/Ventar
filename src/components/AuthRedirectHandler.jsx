import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { supabase } from '../supabaseClient';
import { FaSpinner } from 'react-icons/fa';

function AuthRedirectHandler() {
  const location = useLocation();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    async function handleAuthRedirect() {
      setIsLoading(true);
      setErrorMessage('');
      console.log('Starting auth redirect handling');

      try {
        // Extract hash parameters
        const hash = location.hash.substring(1);
        const params = new URLSearchParams(hash);
        const access_token = params.get('access_token');
        const refresh_token = params.get('refresh_token');
        const expires_in = params.get('expires_in');
        const token_type = params.get('token_type');
        const type = params.get('type');

        console.log('Hash parameters:', { access_token, refresh_token, expires_in, token_type, type });

        if (!access_token || !refresh_token) {
          throw new Error('Missing access_token or refresh_token');
        }

        // Set the session
        console.log('Setting session with tokens');
        const { error: sessionError } = await supabase.auth.setSession({
          access_token,
          refresh_token,
        });

        if (sessionError) throw sessionError;

        // Verify the session
        const { data: { session }, error: getSessionError } = await supabase.auth.getSession();
        console.log('Session verification:', { session, getSessionError });

        if (getSessionError) throw getSessionError;
        if (!session) throw new Error('No active session after setSession');

        // Clear localStorage to prevent token reuse issues
        console.log('Clearing supabase.auth.token from localStorage');
        localStorage.removeItem('supabase.auth.token');

        // Redirect to dashboard
        console.log('Redirecting to /host-dashboard');
        navigate('/host-dashboard', { replace: true });
      } catch (error) {
        console.error('Error handling auth redirect:', error);
        setErrorMessage(error.message || 'Authentication failed. Please sign in again.');
        setTimeout(() => {
          console.log('Redirecting to /host-login');
          navigate('/host-login', { replace: true });
        }, 2000);
      } finally {
        setIsLoading(false);
        console.log('Auth redirect process completed, isLoading:', false);
      }
    }

    handleAuthRedirect();
  }, [location, navigate]);

  return (
    <div className="flex items-center justify-center min-h-screen bg-white">
      <div className="text-center">
        {isLoading ? (
          <>
            <FaSpinner className="animate-spin mx-auto h-8 w-8 text-green-600 mb-4" />
            <h2 className="text-xl font-semibold text-gray-800">Completing Authentication...</h2>
            <p className="mt-2 text-gray-600">Please wait while we verify your email.</p>
          </>
        ) : errorMessage ? (
          <>
            <h2 className="text-xl font-semibold text-red-600">Authentication Error</h2>
            <p className="mt-2 text-gray-600">{errorMessage}</p>
            <p className="mt-2 text-gray-600">Redirecting to sign-in page...</p>
          </>
        ) : (
          <p className="text-gray-600">Processing...</p>
        )}
      </div>
    </div>
  );
}

export default AuthRedirectHandler;