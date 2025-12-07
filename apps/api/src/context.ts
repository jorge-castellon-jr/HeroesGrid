import { FetchCreateContextFnOptions } from '@trpc/server/adapters/fetch';
import { drizzle } from 'drizzle-orm/d1';

export interface Env {
  DB: D1Database;
  R2: R2Bucket;
  DISCORD_CLIENT_ID: string;
  DISCORD_CLIENT_SECRET: string;
  DISCORD_REDIRECT_URI: string;
  DISCORD_CALLBACK_URL: string;
  FRONTEND_URL: string;
  SESSION_SECRET: string;
}

export const createContext = (opts: FetchCreateContextFnOptions, env: Env) => {
  const db = drizzle(env.DB);
  
  return {
    db,
    req: opts.req,
    env,
  };
};

export type Context = ReturnType<typeof createContext>;
