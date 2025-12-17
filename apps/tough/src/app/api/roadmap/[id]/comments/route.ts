import { NextResponse } from 'next/server'

import { getPayloadClient } from '@/getPayloadClient'

export async function GET(request: Request, context: { params: Promise<{ id: string }> }) {
  const { id } = await context.params
  const itemId = Number(id)
  if (!Number.isFinite(itemId)) {
    return NextResponse.json({ error: 'Invalid id' }, { status: 400 })
  }
  const url = new URL(request.url)
  const page = Number(url.searchParams.get('page') || '1')
  const limit = Math.min(50, Math.max(1, Number(url.searchParams.get('limit') || '20')))

  const payload = await getPayloadClient()

  const comments = await payload.find({
    collection: 'roadmap-comments',
    depth: 0,
    limit,
    page: Number.isFinite(page) && page > 0 ? page : 1,
    sort: ['-createdAt'],
    where: { item: { equals: itemId } },
    overrideAccess: false,
  })

  return NextResponse.json(comments)
}

export async function POST(request: Request, context: { params: Promise<{ id: string }> }) {
  const { id } = await context.params
  const itemId = Number(id)
  if (!Number.isFinite(itemId)) {
    return NextResponse.json({ error: 'Invalid id' }, { status: 400 })
  }
  const payload = await getPayloadClient()

  const { user } = await payload.auth({ headers: request.headers })
  if (!user) return NextResponse.json({ error: 'Login required' }, { status: 401 })

  const req = { user, payload, headers: request.headers, body: {} } as any

  let body: { body?: string } | null = null
  try {
    body = (await request.json()) as { body?: string }
  } catch {
    body = null
  }
  const text = (body?.body || '').trim()
  if (!text) return NextResponse.json({ error: 'Missing body' }, { status: 400 })
  if (text.length > 2000) return NextResponse.json({ error: 'Comment too long' }, { status: 400 })

  // Payload local API may populate `data` from `req.body`—include it for hooks/validation.
  req.body = { item: itemId, user: user.id, body: text }
  const created = await payload.create({
    collection: 'roadmap-comments',
    req,
    data: { item: itemId, user: user.id, body: text },
  })

  const commentCount = await payload.find({
    collection: 'roadmap-comments',
    limit: 0,
    req,
    where: { item: { equals: itemId } },
  })

  return NextResponse.json({ comment: created, commentCount: commentCount.totalDocs }, { status: 201 })
}

