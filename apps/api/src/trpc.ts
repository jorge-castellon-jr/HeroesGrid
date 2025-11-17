import { initTRPC, TRPCError } from '@trpc/server';
import { Context } from './context';
import { users, sessions } from './db/schema';
import { eq } from 'drizzle-orm';

const t = initTRPC.context<Context>().create();

// Middleware to check authentication
const isAuthed = t.middleware(async ({ ctx, next }) => {
  // Get token from header
  const authHeader = ctx.req.headers.get('authorization');
  const token = authHeader?.replace('Bearer ', '');

  if (!token) {
    throw new TRPCError({ code: 'UNAUTHORIZED', message: 'No token provided' });
  }

  // Verify session
  const session = await ctx.db
    .select({
      id: sessions.id,
      userId: sessions.userId,
      expiresAt: sessions.expiresAt,
      username: users.username,
      discriminator: users.discriminator,
      avatar: users.avatar,
      email: users.email,
      discordId: users.discordId,
    })
    .from(sessions)
    .innerJoin(users, eq(sessions.userId, users.id))
    .where(eq(sessions.token, token))
    .get();

  if (!session) {
    throw new TRPCError({ code: 'UNAUTHORIZED', message: 'Invalid or expired token' });
  }

  // Check if session is expired
  if (new Date(session.expiresAt) < new Date()) {
    await ctx.db.delete(sessions).where(eq(sessions.id, session.id)).run();
    throw new TRPCError({ code: 'UNAUTHORIZED', message: 'Session expired' });
  }

  // Add user to context
  return next({
    ctx: {
      ...ctx,
      user: {
        id: session.userId,
        discordId: session.discordId,
        username: session.username,
        discriminator: session.discriminator,
        avatar: session.avatar,
        email: session.email,
      },
    },
  });
});

export const router = t.router;
export const publicProcedure = t.procedure;
export const protectedProcedure = t.procedure.use(isAuthed);
