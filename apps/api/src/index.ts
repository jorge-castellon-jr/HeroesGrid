import { fetchRequestHandler } from '@trpc/server/adapters/fetch';
import { appRouter } from './router';
import { createContext, Env } from './context';
import { handleDiscordCallback } from './routes/discord-callback';

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url);
    
    // Handle Discord OAuth callback
    if (url.pathname === '/auth/discord/callback') {
      return handleDiscordCallback(request, env);
    }
    
    // CORS headers for local development
    const origin = request.headers.get('origin') || 'http://localhost:5173';
    const corsHeaders = {
      'Access-Control-Allow-Origin': origin,
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      'Access-Control-Allow-Credentials': 'true',
    };

    // Handle preflight requests
    if (request.method === 'OPTIONS') {
      return new Response(null, {
        headers: corsHeaders,
      });
    }

    // Handle tRPC requests
    const response = await fetchRequestHandler({
      endpoint: '/trpc',
      req: request,
      router: appRouter,
      createContext: (opts) => createContext(opts, env),
    });

    // Add CORS headers to response (create new response with headers)
    const headers = new Headers(response.headers);
    Object.entries(corsHeaders).forEach(([key, value]) => {
      headers.set(key, value);
    });

    return new Response(response.body, {
      status: response.status,
      statusText: response.statusText,
      headers,
    });
  },
};
