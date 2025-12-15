import { NextResponse } from 'next/server'
import { getPayload } from 'payload'

import config from '@/payload.config'

type DiscordMe = {
  id: string
  username: string
  avatar: string | null
  email?: string | null
}

function randomPassword() {
  // Strong enough, not user-facing.
  return `discord_${crypto.randomUUID()}_${crypto.randomUUID()}`
}

async function exchangeCodeForToken(params: {
  code: string
  redirectUri: string
  clientId: string
  clientSecret: string
}) {
  const body = new URLSearchParams()
  body.set('client_id', params.clientId)
  body.set('client_secret', params.clientSecret)
  body.set('grant_type', 'authorization_code')
  body.set('code', params.code)
  body.set('redirect_uri', params.redirectUri)

  const tokenRes = await fetch('https://discord.com/api/oauth2/token', {
    method: 'POST',
    headers: {
      'content-type': 'application/x-www-form-urlencoded',
    },
    body,
  })

  if (!tokenRes.ok) {
    const text = await tokenRes.text().catch(() => '')
    throw new Error(`Discord token exchange failed (${tokenRes.status}): ${text}`)
  }

  return (await tokenRes.json()) as { access_token: string; token_type: string }
}

async function fetchDiscordMe(accessToken: string): Promise<DiscordMe> {
  const meRes = await fetch('https://discord.com/api/users/@me', {
    headers: {
      authorization: `Bearer ${accessToken}`,
    },
  })

  if (!meRes.ok) {
    const text = await meRes.text().catch(() => '')
    throw new Error(`Discord /users/@me failed (${meRes.status}): ${text}`)
  }

  return (await meRes.json()) as DiscordMe
}

export async function GET(request: Request) {
  const url = new URL(request.url)
  const code = url.searchParams.get('code')
  const state = url.searchParams.get('state')

  if (!code || !state) {
    return NextResponse.json({ error: 'Missing code/state' }, { status: 400 })
  }

  const cookies = request.headers.get('cookie') || ''
  const expectedState = cookies
    .split(';')
    .map((c) => c.trim())
    .find((c) => c.startsWith('discord_oauth_state='))
    ?.split('=')[1]

  if (!expectedState || expectedState !== state) {
    return NextResponse.json({ error: 'Invalid state' }, { status: 400 })
  }

  const clientId = process.env.DISCORD_CLIENT_ID
  const clientSecret = process.env.DISCORD_CLIENT_SECRET
  const redirectUri = process.env.DISCORD_REDIRECT_URI

  if (!clientId || !clientSecret || !redirectUri) {
    return NextResponse.json(
      { error: 'Missing DISCORD_CLIENT_ID, DISCORD_CLIENT_SECRET, or DISCORD_REDIRECT_URI' },
      { status: 500 },
    )
  }

  const payload = await getPayload({ config: await config })

  try {
    const token = await exchangeCodeForToken({ code, redirectUri, clientId, clientSecret })
    const me = await fetchDiscordMe(token.access_token)

    const email = me.email && me.email.length > 0 ? me.email : `${me.id}@users.discord.invalid`
    const password = randomPassword()

    const existingByDiscord = await payload.find({
      collection: 'users',
      overrideAccess: true,
      limit: 1,
      where: { discordId: { equals: me.id } },
    })

    const existingByEmail =
      existingByDiscord.totalDocs > 0
        ? null
        : await payload.find({
            collection: 'users',
            overrideAccess: true,
            limit: 1,
            where: { email: { equals: email } },
          })

    const existing =
      existingByDiscord.totalDocs > 0
        ? existingByDiscord.docs[0]
        : existingByEmail?.totalDocs
          ? existingByEmail.docs[0]
          : null

    if (existing) {
      await payload.update({
        collection: 'users',
        id: existing.id,
        overrideAccess: true,
        data: {
          email,
          password,
          discordId: me.id,
          discordUsername: me.username,
          discordAvatar: me.avatar,
        },
      })
    } else {
      await payload.create({
        collection: 'users',
        overrideAccess: true,
        data: {
          email,
          password,
          discordId: me.id,
          discordUsername: me.username,
          discordAvatar: me.avatar,
        },
      })
    }

    // Use Payload's own login endpoint to produce the correct auth cookie.
    const loginUrl = new URL('/api/users/login', request.url)
    const loginRes = await fetch(loginUrl, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ email, password }),
    })

    if (!loginRes.ok) {
      const text = await loginRes.text().catch(() => '')
      throw new Error(`Payload login failed (${loginRes.status}): ${text}`)
    }

    const returnTo = cookies
      .split(';')
      .map((c) => c.trim())
      .find((c) => c.startsWith('discord_oauth_returnTo='))
      ?.split('=')
      .slice(1)
      .join('=')

    const redirectTo = returnTo && returnTo.startsWith('/') ? returnTo : '/roadmap'
    const res = NextResponse.redirect(new URL(redirectTo, request.url))

    // Forward auth cookies from Payload login response.
    const setCookies =
      // @ts-expect-error - available in some runtimes
      (typeof loginRes.headers.getSetCookie === 'function' ? loginRes.headers.getSetCookie() : null) ||
      (loginRes.headers.get('set-cookie') ? [loginRes.headers.get('set-cookie')] : [])

    for (const c of setCookies) {
      if (c) res.headers.append('set-cookie', c)
    }

    // Clear temporary OAuth cookies.
    res.cookies.set('discord_oauth_state', '', { path: '/', maxAge: 0 })
    res.cookies.set('discord_oauth_returnTo', '', { path: '/', maxAge: 0 })

    return res
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}

