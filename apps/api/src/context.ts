import { FetchCreateContextFnOptions } from '@trpc/server/adapters/fetch';
import { drizzle } from 'drizzle-orm/d1';

export interface Env {
  DB: D1Database;
}

export const createContext = (opts: FetchCreateContextFnOptions, env: Env) => {
  const db = drizzle(env.DB);
  
  return {
    db,
    req: opts.req,
  };
};

export type Context = ReturnType<typeof createContext>;
