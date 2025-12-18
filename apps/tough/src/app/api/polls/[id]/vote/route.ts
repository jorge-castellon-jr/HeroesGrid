import { NextResponse } from 'next/server'

import { getPayloadClient } from '@/getPayloadClient'

export async function POST(request: Request, context: { params: Promise<{ id: string }> }) {
  const { id } = await context.params
  const pollId = Number(id)
  if (!Number.isFinite(pollId)) {
    return NextResponse.json({ error: 'Invalid id' }, { status: 400 })
  }

  const payload = await getPayloadClient()
  const { user } = await payload.auth({ headers: request.headers })
  if (!user) return NextResponse.json({ error: 'Login required' }, { status: 401 })

  let body: { optionIndex?: number } | null = null
  try {
    body = (await request.json()) as { optionIndex?: number }
  } catch {
    body = null
  }

  const optionIndex = body?.optionIndex
  if (typeof optionIndex !== 'number' || optionIndex < 0) {
    return NextResponse.json({ error: 'Invalid optionIndex' }, { status: 400 })
  }

  // Fetch poll to validate
  let poll: any
  try {
    poll = await payload.findByID({
      collection: 'polls',
      id: pollId,
      depth: 0,
      overrideAccess: true,
    })
  } catch {
    return NextResponse.json({ error: 'Poll not found' }, { status: 404 })
  }

  // Check if poll is active
  const endDate = poll?.endDate
  if (endDate) {
    const end = new Date(endDate)
    const now = new Date()
    if (end <= now) {
      return NextResponse.json({ error: 'Poll has ended' }, { status: 400 })
    }
  }

  // Validate optionIndex
  const options = poll?.options || []
  if (optionIndex >= options.length) {
    return NextResponse.json({ error: 'optionIndex out of range' }, { status: 400 })
  }

  const req = { user, payload, headers: request.headers, body: {} } as any

  // Check if user already voted
  const existing = await payload.find({
    collection: 'poll-votes',
    limit: 1,
    overrideAccess: true,
    where: {
      and: [{ poll: { equals: pollId } }, { user: { equals: user.id } }],
    },
  })

  let voted: boolean
  let finalOptionIndex: number

  if (existing.totalDocs > 0) {
    const existingVote = existing.docs[0] as any
    const existingOptionIndex = existingVote.optionIndex

    // If voting for the same option, toggle off (delete vote)
    if (existingOptionIndex === optionIndex) {
      await payload.delete({
        collection: 'poll-votes',
        id: existingVote.id,
        req,
      })
      voted = false
      finalOptionIndex = optionIndex
    } else {
      // Different option - delete old vote and create new one
      await payload.delete({
        collection: 'poll-votes',
        id: existingVote.id,
        req,
      })

      req.body = { poll: pollId, user: user.id, optionIndex }
      await payload.create({
        collection: 'poll-votes',
        req,
        data: { poll: pollId, user: user.id, optionIndex },
      })
      voted = true
      finalOptionIndex = optionIndex
    }
  } else {
    // Create new vote
    req.body = { poll: pollId, user: user.id, optionIndex }
    await payload.create({
      collection: 'poll-votes',
      req,
      data: { poll: pollId, user: user.id, optionIndex },
    })
    voted = true
    finalOptionIndex = optionIndex
  }

  // Get updated total votes
  const votes = await payload.find({
    collection: 'poll-votes',
    limit: 0,
    overrideAccess: true,
    where: { poll: { equals: pollId } },
  })

  return NextResponse.json({
    voted,
    optionIndex: voted ? finalOptionIndex : undefined,
    totalVotes: votes.totalDocs,
  })
}

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

