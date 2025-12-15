import { NextResponse } from 'next/server'
import { getPayload } from 'payload'

import config from '@/payload.config'

export async function GET(request: Request, context: { params: { id: string } }) {
  const { id } = context.params
  const url = new URL(request.url)
  const page = Number(url.searchParams.get('page') || '1')
  const limit = Math.min(50, Math.max(1, Number(url.searchParams.get('limit') || '20')))

  const payload = await getPayload({ config: await config })

  const comments = await payload.find({
    collection: 'roadmap-comments',
    depth: 0,
    limit,
    page: Number.isFinite(page) && page > 0 ? page : 1,
    sort: ['-createdAt'],
    where: { item: { equals: id } },
    overrideAccess: false,
  })

  return NextResponse.json(comments)
}

export async function POST(request: Request, context: { params: { id: string } }) {
  const { id } = context.params
  const payload = await getPayload({ config: await config })

  const { user } = await payload.auth({ headers: request.headers })
  if (!user) return NextResponse.json({ error: 'Login required' }, { status: 401 })

  const body = (await request.json().catch(() => null)) as { body?: string } | null
  const text = (body?.body || '').trim()
  if (!text) return NextResponse.json({ error: 'Missing body' }, { status: 400 })
  if (text.length > 2000) return NextResponse.json({ error: 'Comment too long' }, { status: 400 })

  const created = await payload.create({
    collection: 'roadmap-comments',
    overrideAccess: true,
    data: { item: id, user: user.id, body: text },
  })

  const commentCount = await payload.find({
    collection: 'roadmap-comments',
    overrideAccess: true,
    limit: 0,
    where: { item: { equals: id } },
  })

  return NextResponse.json({ comment: created, commentCount: commentCount.totalDocs }, { status: 201 })
}

