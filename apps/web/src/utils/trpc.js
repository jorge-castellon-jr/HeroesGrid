import { createTRPCReact } from '@trpc/react-query';
import { httpBatchLink } from '@trpc/client';

// Create tRPC React hooks
export const trpc = createTRPCReact();

// Get API URL from environment or default to localhost
const getApiUrl = () => {
  if (import.meta.env.VITE_API_URL) {
    return import.meta.env.VITE_API_URL;
  }
  // Default to local API for development
  return 'http://localhost:8787/trpc';
};

// Create tRPC client config
export function createTRPCClient() {
  return trpc.createClient({
    links: [
      httpBatchLink({
        url: getApiUrl(),
        // Add auth token to headers
        headers() {
          const token = localStorage.getItem('auth_token');
          return token
            ? {
                authorization: `Bearer ${token}`,
              }
            : {};
        },
        // Include credentials for cookie-based auth
        fetch(url, options) {
          return fetch(url, {
            ...options,
            credentials: 'include',
          });
        },
      }),
    ],
  });
}
