import { NextResponse } from 'next/server'
import { getPayloadClient } from '@/getPayloadClient'

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

function getCookieValue(cookieHeader: string, name: string): string | undefined {
  const parts = cookieHeader.split(';')
  for (const part of parts) {
    const trimmed = part.trim()
    if (!trimmed.startsWith(`${name}=`)) continue
    const raw = trimmed.slice(name.length + 1)
    try {
      return decodeURIComponent(raw)
    } catch {
      return raw
    }
  }
  return undefined
}

function splitSetCookieHeader(headerValue: string): string[] {
  // Some runtimes collapse multiple Set-Cookie headers into one comma-separated string.
  // We must not split on the comma inside Expires.
  const out: string[] = []
  let start = 0
  let inExpires = false

  for (let i = 0; i < headerValue.length; i++) {
    const ch = headerValue[i]

    // detect start of Expires= attribute (case-insensitive)
    if (!inExpires && headerValue.slice(i, i + 8).toLowerCase() === 'expires=') {
      inExpires = true
      i += 7
      continue
    }

    if (inExpires && ch === ';') {
      inExpires = false
      continue
    }

    if (!inExpires && ch === ',') {
      const candidate = headerValue.slice(start, i).trim()
      if (candidate) out.push(candidate)
      start = i + 1
    }
  }

  const last = headerValue.slice(start).trim()
  if (last) out.push(last)
  return out
}

function describeSetCookie(setCookie: string) {
  const parts = setCookie.split(';').map((p) => p.trim())
  const [nameValue, ...attrs] = parts
  const name = nameValue?.split('=')?.[0] || '(unknown)'
  const value = nameValue?.split('=').slice(1).join('=') || ''
  const lowerAttrs = attrs.map((a) => a.toLowerCase())
  const secure = lowerAttrs.includes('secure')
  const httpOnly = lowerAttrs.includes('httponly')
  const sameSite = attrs.find((a) => a.toLowerCase().startsWith('samesite=')) || ''
  const path = attrs.find((a) => a.toLowerCase().startsWith('path=')) || ''
  const domain = attrs.find((a) => a.toLowerCase().startsWith('domain=')) || ''
  const maxAge = attrs.find((a) => a.toLowerCase().startsWith('max-age=')) || ''
  const expires = attrs.find((a) => a.toLowerCase().startsWith('expires=')) || ''
  return { name, valueLen: value.length, secure, httpOnly, sameSite, path, domain, maxAge, expires }
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
  const expectedState = getCookieValue(cookies, 'discord_oauth_state')

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

  const payload = await getPayloadClient()

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
          accountType: (existing as any).accountType || 'user',
          discordId: me.id,
          discordUsername: me.username,
          discordAvatar: me.avatar,
        },
      })
    } else {
      await payload.create({
        collection: 'users',
        overrideAccess: true,
        draft: false,
        data: {
          email,
          password,
          accountType: 'user',
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

    const returnTo = getCookieValue(cookies, 'discord_oauth_returnTo')

    const redirectTo = returnTo && returnTo.startsWith('/') ? returnTo : '/roadmap'
    const res = NextResponse.redirect(new URL(redirectTo, request.url))

    // Forward auth cookies from Payload login response.
    const setCookiesFromRuntime: string[] | undefined =
      typeof loginRes.headers.getSetCookie === 'function' ? loginRes.headers.getSetCookie() : undefined
    const setCookieHeader = loginRes.headers.get('set-cookie') || ''
    const setCookies = setCookiesFromRuntime || (setCookieHeader ? splitSetCookieHeader(setCookieHeader) : [])

    const cookieMeta = setCookies.map((c) => describeSetCookie(c))
    for (const c of setCookies) {
      if (c) res.headers.append('set-cookie', c)
    }

    // Clear temporary OAuth cookies (append manually so we don't accidentally overwrite Set-Cookie).
    res.headers.append('set-cookie', 'discord_oauth_state=; Path=/; Max-Age=0; SameSite=Lax')
    res.headers.append('set-cookie', 'discord_oauth_returnTo=; Path=/; Max-Age=0; SameSite=Lax')

    const finalSetCookieHeader = res.headers.get('set-cookie') || ''
    const finalCookies = finalSetCookieHeader ? splitSetCookieHeader(finalSetCookieHeader) : []
    return res
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}

