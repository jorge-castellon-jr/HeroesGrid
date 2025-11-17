import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { publicProcedure, router } from "../trpc";
import { users, sessions } from "../db/schema";
import { eq } from "drizzle-orm";

interface Env {
  DISCORD_CLIENT_ID: string;
  DISCORD_CLIENT_SECRET: string;
  DISCORD_REDIRECT_URI: string;
  SESSION_SECRET: string;
}

// Discord OAuth endpoints
const DISCORD_API = "https://discord.com/api/v10";
const DISCORD_OAUTH = "https://discord.com/oauth2/authorize";
const DISCORD_TOKEN = "https://discord.com/api/oauth2/token";

// Discord types
interface DiscordTokenResponse {
  access_token: string;
  token_type: string;
  expires_in: number;
  refresh_token: string;
  scope: string;
}

interface DiscordUser {
  id: string;
  username: string;
  discriminator: string;
  avatar: string | null;
  email?: string;
}

export const authRouter = router({
  // Get Discord OAuth URL
  getLoginUrl: publicProcedure.query(({ ctx }) => {
    const env = ctx.env as Env;
    console.log(env.DISCORD_REDIRECT_URI);

    return {
      url: env.DISCORD_REDIRECT_URI,
    };
  }),

  // Handle OAuth callback
  handleCallback: publicProcedure
    .input(
      z.object({
        code: z.string(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const env = ctx.env as Env;

      try {
        // Exchange code for access token
        const tokenResponse = await fetch(DISCORD_TOKEN, {
          method: "POST",
          headers: {
            "Content-Type": "application/x-www-form-urlencoded",
          },
          body: new URLSearchParams({
            client_id: env.DISCORD_CLIENT_ID,
            client_secret: env.DISCORD_CLIENT_SECRET,
            grant_type: "authorization_code",
            code: input.code,
            redirect_uri: env.DISCORD_REDIRECT_URI,
          }),
        });

        if (!tokenResponse.ok) {
          throw new TRPCError({
            code: "UNAUTHORIZED",
            message: "Failed to exchange code for token",
          });
        }

        const tokenData = (await tokenResponse.json()) as DiscordTokenResponse;
        const accessToken = tokenData.access_token;

        // Fetch user info from Discord
        const userResponse = await fetch(`${DISCORD_API}/users/@me`, {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        });

        if (!userResponse.ok) {
          throw new TRPCError({
            code: "UNAUTHORIZED",
            message: "Failed to fetch user info",
          });
        }

        const discordUser = (await userResponse.json()) as DiscordUser;

        // Create or update user in database
        const existingUser = await ctx.db
          .select()
          .from(users)
          .where(eq(users.discordId, discordUser.id))
          .get();

        let userId: string;

        if (existingUser) {
          // Update existing user
          await ctx.db
            .update(users)
            .set({
              username: discordUser.username,
              discriminator: discordUser.discriminator,
              avatar: discordUser.avatar,
              email: discordUser.email,
              lastLoginAt: new Date(),
            })
            .where(eq(users.id, existingUser.id))
            .run();

          userId = existingUser.id;
        } else {
          // Create new user
          userId = crypto.randomUUID();
          await ctx.db
            .insert(users)
            .values({
              id: userId,
              discordId: discordUser.id,
              username: discordUser.username,
              discriminator: discordUser.discriminator,
              avatar: discordUser.avatar,
              email: discordUser.email,
              lastLoginAt: new Date(),
            })
            .run();
        }

        // Create session
        const sessionId = crypto.randomUUID();
        const token = crypto.randomUUID();
        const expiresAt = new Date();
        expiresAt.setDate(expiresAt.getDate() + 7); // 7 days

        await ctx.db
          .insert(sessions)
          .values({
            id: sessionId,
            userId,
            token,
            expiresAt,
          })
          .run();

        return {
          token,
          user: {
            id: userId,
            discordId: discordUser.id,
            username: discordUser.username,
            discriminator: discordUser.discriminator,
            avatar: discordUser.avatar,
            email: discordUser.email,
          },
        };
      } catch (error) {
        console.error("OAuth callback error:", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Authentication failed",
        });
      }
    }),

  // Get current session
  getSession: publicProcedure
    .input(
      z.object({
        token: z.string(),
      })
    )
    .query(async ({ ctx, input }) => {
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
        .where(eq(sessions.token, input.token))
        .get();

      if (!session) {
        return null;
      }

      // Check if session is expired
      if (new Date(session.expiresAt) < new Date()) {
        // Delete expired session
        await ctx.db.delete(sessions).where(eq(sessions.id, session.id)).run();
        return null;
      }

      return {
        user: {
          id: session.userId,
          discordId: session.discordId,
          username: session.username,
          discriminator: session.discriminator,
          avatar: session.avatar,
          email: session.email,
        },
      };
    }),

  // Logout
  logout: publicProcedure
    .input(
      z.object({
        token: z.string(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      await ctx.db
        .delete(sessions)
        .where(eq(sessions.token, input.token))
        .run();

      return { success: true };
    }),
});
