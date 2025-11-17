import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';

export default function AuthSuccess() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [error, setError] = useState(null);

  useEffect(() => {
    const token = searchParams.get('token');
    const errorParam = searchParams.get('error');

    if (errorParam) {
      setError('Authentication failed');
      setTimeout(() => navigate('/'), 3000);
      return;
    }

    if (token) {
      // Store token
      localStorage.setItem('auth_token', token);
      
      // Force page reload to trigger AuthContext to fetch session
      window.location.href = '/my-rangers';
    } else {
      setError('No token received');
      setTimeout(() => navigate('/'), 3000);
    }
  }, [searchParams, navigate]);

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
            <h2 className="text-2xl font-bold mb-4">Login Successful!</h2>
            <p className="text-muted-foreground">
              Redirecting to your rangers...
            </p>
          </>
        )}
      </div>
    </div>
  );
}
