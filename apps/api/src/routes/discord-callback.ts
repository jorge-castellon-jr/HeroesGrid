import { users, sessions } from '../db/schema';
import { eq } from 'drizzle-orm';
import { drizzle } from 'drizzle-orm/d1';

interface Env {
  DISCORD_CLIENT_ID: string;
  DISCORD_CLIENT_SECRET: string;
  DISCORD_REDIRECT_URI: string;
  DISCORD_CALLBACK_URL: string;
  FRONTEND_URL: string;
  DB: D1Database;
}

const DISCORD_API = 'https://discord.com/api/v10';
const DISCORD_TOKEN = 'https://discord.com/api/oauth2/token';

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

export async function handleDiscordCallback(
  request: Request,
  env: Env
): Promise<Response> {
  const url = new URL(request.url);
  const code = url.searchParams.get('code');
  const error = url.searchParams.get('error');

  // Handle OAuth errors
  if (error) {
    return Response.redirect(
      `${env.FRONTEND_URL}/login?error=${encodeURIComponent(error)}`
    );
  }

  if (!code) {
    return Response.redirect(
      `${env.FRONTEND_URL}/login?error=no_code`
    );
  }

  try {
    const db = drizzle(env.DB);

    // Exchange code for access token
    const tokenResponse = await fetch(DISCORD_TOKEN, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        client_id: env.DISCORD_CLIENT_ID,
        client_secret: env.DISCORD_CLIENT_SECRET,
        grant_type: 'authorization_code',
        code,
        redirect_uri: env.DISCORD_CALLBACK_URL,
      }),
    });

    if (!tokenResponse.ok) {
      const errorData = await tokenResponse.text();
      console.error('Discord token exchange failed:', errorData);
      return Response.redirect(
        `${env.FRONTEND_URL}/login?error=token_exchange_failed`
      );
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
      return Response.redirect(
        `${env.FRONTEND_URL}/login?error=user_fetch_failed`
      );
    }

    const discordUser = (await userResponse.json()) as DiscordUser;

    // Create or update user in database
    const existingUser = await db
      .select()
      .from(users)
      .where(eq(users.discordId, discordUser.id))
      .get();

    let userId: string;

    if (existingUser) {
      // Update existing user
      await db
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
      await db
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

    await db
      .insert(sessions)
      .values({
        id: sessionId,
        userId,
        token,
        expiresAt,
      })
      .run();

    // Redirect to frontend with token
    return Response.redirect(
      `${env.FRONTEND_URL}/auth/success?token=${token}`
    );
  } catch (error) {
    console.error('Discord callback error:', error);
    return Response.redirect(
      `${env.FRONTEND_URL}/login?error=auth_failed`
    );
  }
}
