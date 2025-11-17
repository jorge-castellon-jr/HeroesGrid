import { createContext, useContext, useState, useEffect } from 'react';
import { trpc } from '../utils/trpc';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [token, setToken] = useState(() => {
    // Get token from localStorage on mount
    return localStorage.getItem('auth_token') || null;
  });
  const [user, setUser] = useState(null);

  // Get session query
  const sessionQuery = trpc.auth.getSession.useQuery(
    { token: token || '' },
    {
      enabled: !!token,
      retry: false,
    }
  );

  // Get login URL
  const loginUrlQuery = trpc.auth.getLoginUrl.useQuery();

  // Handle OAuth callback mutation
  const handleCallbackMutation = trpc.auth.handleCallback.useMutation();

  // Logout mutation
  const logoutMutation = trpc.auth.logout.useMutation();

  // Update user when session query succeeds
  useEffect(() => {
    if (sessionQuery.isSuccess && sessionQuery.data) {
      setUser(sessionQuery.data.user);
    } else if (sessionQuery.isError || (sessionQuery.isSuccess && !sessionQuery.data)) {
      // Token invalid, clear it
      setToken(null);
      setUser(null);
      localStorage.removeItem('auth_token');
    }
  }, [sessionQuery.isSuccess, sessionQuery.isError, sessionQuery.data]);

  const loading = token ? sessionQuery.isLoading : false;

  const login = () => {
    if (loginUrlQuery.data?.url) {
      window.location.href = loginUrlQuery.data.url;
    }
  };

  const handleCallback = async (code) => {
    try {
      const data = await handleCallbackMutation.mutateAsync({ code });
      setToken(data.token);
      setUser(data.user);
      localStorage.setItem('auth_token', data.token);
      return true;
    } catch (error) {
      console.error('Auth callback error:', error);
      return false;
    }
  };

  const logout = async () => {
    if (token) {
      try {
        await logoutMutation.mutateAsync({ token });
        setToken(null);
        setUser(null);
        localStorage.removeItem('auth_token');
      } catch (error) {
        console.error('Logout error:', error);
      }
    }
  };

  const value = {
    user,
    token,
    loading,
    isAuthenticated: !!user,
    login,
    logout,
    handleCallback,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
