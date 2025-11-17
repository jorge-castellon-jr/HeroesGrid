import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

export default function AuthCallback() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { handleCallback } = useAuth();
  const [error, setError] = useState(null);

  useEffect(() => {
    const code = searchParams.get('code');
    const errorParam = searchParams.get('error');

    if (errorParam) {
      setError('Authentication cancelled or failed');
      setTimeout(() => navigate('/'), 3000);
      return;
    }

    if (code) {
      handleCallback(code).then((success) => {
        if (success) {
          navigate('/my-rangers');
        } else {
          setError('Authentication failed');
          setTimeout(() => navigate('/'), 3000);
        }
      });
    } else {
      setError('No authorization code received');
      setTimeout(() => navigate('/'), 3000);
    }
  }, [searchParams, handleCallback, navigate]);

  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-center">
        {error ? (
          <>
            <h2 className="text-2xl font-bold mb-4">Authentication Error</h2>
            <p className="text-muted-foreground">{error}</p>
            <p className="text-sm text-muted-foreground mt-2">
              Redirecting to home...
            </p>
          </>
        ) : (
          <>
            <h2 className="text-2xl font-bold mb-4">Logging you in...</h2>
            <p className="text-muted-foreground">
              Please wait while we complete your authentication
            </p>
          </>
        )}
      </div>
    </div>
  );
}
