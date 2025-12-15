import { NextResponse } from 'next/server'

function randomState() {
  return crypto.randomUUID()
}

export async function GET(request: Request) {
  const url = new URL(request.url)
  const returnTo = url.searchParams.get('returnTo') || '/roadmap'

  const clientId = process.env.DISCORD_CLIENT_ID
  const redirectUri = process.env.DISCORD_REDIRECT_URI

  if (!clientId || !redirectUri) {
    return NextResponse.json(
      { error: 'Missing DISCORD_CLIENT_ID or DISCORD_REDIRECT_URI' },
      { status: 500 },
    )
  }

  const state = randomState()
  const secure = process.env.NODE_ENV === 'production'

  const authorize = new URL('https://discord.com/api/oauth2/authorize')
  authorize.searchParams.set('client_id', clientId)
  authorize.searchParams.set('redirect_uri', redirectUri)
  authorize.searchParams.set('response_type', 'code')
  authorize.searchParams.set('scope', 'identify email')
  authorize.searchParams.set('state', state)

  const res = NextResponse.redirect(authorize.toString())

  // Short-lived, HttpOnly cookies for CSRF + where to return after login.
  res.cookies.set('discord_oauth_state', state, {
    httpOnly: true,
    sameSite: 'lax',
    secure,
    path: '/',
    maxAge: 60 * 10,
  })
  res.cookies.set('discord_oauth_returnTo', returnTo, {
    httpOnly: true,
    sameSite: 'lax',
    secure,
    path: '/',
    maxAge: 60 * 10,
  })

  return res
}

