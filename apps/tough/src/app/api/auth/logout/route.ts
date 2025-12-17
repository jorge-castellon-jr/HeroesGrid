import { NextResponse } from 'next/server'

function splitSetCookieHeader(headerValue: string): string[] {
  const out: string[] = []
  let start = 0
  let inExpires = false

  for (let i = 0; i < headerValue.length; i++) {
    const ch = headerValue[i]

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

  const setCookiesFromRuntime: string[] | undefined =
    typeof logoutRes.headers.getSetCookie === 'function' ? logoutRes.headers.getSetCookie() : undefined
  const setCookieHeader = logoutRes.headers.get('set-cookie') || ''
  const setCookies = setCookiesFromRuntime || (setCookieHeader ? splitSetCookieHeader(setCookieHeader) : [])

  for (const c of setCookies) {
    if (c) res.headers.append('set-cookie', c)
  }

  return res
}

