import { NextResponse } from 'next/server'

import { getPayloadClient } from '@/getPayloadClient'

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

  // Is there an existing vote?
  const existing = await payload.find({
    collection: 'roadmap-votes',
    limit: 1,
    req,
    where: {
      and: [{ item: { equals: itemId } }, { user: { equals: user.id } }],
    },
  })

  let upvoted: boolean

  if (existing.totalDocs > 0) {
    await payload.delete({
      collection: 'roadmap-votes',
      id: existing.docs[0].id,
      req,
    })
    upvoted = false
  } else {
    // Payload local API may populate `data` from `req.body`—include it for hooks/validation.
    req.body = { item: itemId, user: user.id }
    await payload.create({
      collection: 'roadmap-votes',
      req,
      data: { item: itemId, user: user.id },
    })
    upvoted = true
  }

  const votes = await payload.find({
    collection: 'roadmap-votes',
    limit: 0,
    req,
    where: { item: { equals: itemId } },
  })

  return NextResponse.json({ upvoted, upvoteCount: votes.totalDocs })
}

