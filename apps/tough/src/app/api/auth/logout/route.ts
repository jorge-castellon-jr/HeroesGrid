import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  // Use Payload's logout endpoint so cookies are cleared correctly.
  const logoutUrl = new URL('/api/users/logout', request.url)
  const logoutRes = await fetch(logoutUrl, {
    method: 'POST',
    headers: {
      cookie: request.headers.get('cookie') || '',
    },
  })

  const res = NextResponse.redirect(new URL('/roadmap', request.url))

  const setCookies =
    // @ts-expect-error - available in some runtimes
    (typeof logoutRes.headers.getSetCookie === 'function' ? logoutRes.headers.getSetCookie() : null) ||
    (logoutRes.headers.get('set-cookie') ? [logoutRes.headers.get('set-cookie')] : [])

  for (const c of setCookies) {
    if (c) res.headers.append('set-cookie', c)
  }

  return res
}

