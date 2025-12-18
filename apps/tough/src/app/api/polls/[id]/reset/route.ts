import { NextResponse } from 'next/server'

import { getPayloadClient } from '@/getPayloadClient'

export async function DELETE(request: Request, context: { params: Promise<{ id: string }> }) {
  const { id } = await context.params
  const pollId = Number(id)
  if (!Number.isFinite(pollId)) {
    return NextResponse.json({ error: 'Invalid id' }, { status: 400 })
  }

  const payload = await getPayloadClient()
  const { user } = await payload.auth({ headers: request.headers })
  if (!user) return NextResponse.json({ error: 'Login required' }, { status: 401 })

  const req = { user, payload, headers: request.headers, body: {} } as any

  // Find user's vote
  const existing = await payload.find({
    collection: 'poll-votes',
    limit: 1,
    overrideAccess: true,
    where: {
      and: [{ poll: { equals: pollId } }, { user: { equals: user.id } }],
    },
  })

  if (existing.totalDocs === 0) {
    return NextResponse.json({ error: 'No vote found' }, { status: 404 })
  }

  const existingVote = existing.docs[0]
  await payload.delete({
    collection: 'poll-votes',
    id: existingVote.id,
    req,
  })

  // Get updated total votes
  const votes = await payload.find({
    collection: 'poll-votes',
    limit: 0,
    overrideAccess: true,
    where: { poll: { equals: pollId } },
  })

  return NextResponse.json({
    voted: false,
    totalVotes: votes.totalDocs,
  })
}

