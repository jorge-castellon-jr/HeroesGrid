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

  let body: { optionIndices?: number[]; rankedIndices?: number[] } | null = null
  try {
    body = (await request.json()) as { optionIndices?: number[]; rankedIndices?: number[] }
  } catch {
    body = null
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

  const pollType = poll?.pollType || 'select'
  const options = poll?.options || []
  const maxSelections = poll?.maxSelections ?? 1

  let optionIndices: number[] | null = null

  // Validate and extract vote data based on poll type
  if (pollType === 'select') {
    optionIndices = body?.optionIndices || null
    if (!Array.isArray(optionIndices) || optionIndices.length === 0) {
      return NextResponse.json({ error: 'optionIndices is required for select polls' }, { status: 400 })
    }
    if (optionIndices.length > maxSelections) {
      return NextResponse.json(
        { error: `Cannot select more than ${maxSelections} option(s)` },
        { status: 400 },
      )
    }
    if (optionIndices.length < 1) {
      return NextResponse.json({ error: 'Must select at least 1 option' }, { status: 400 })
    }
    // Check for duplicates
    const uniqueIndices = new Set(optionIndices)
    if (uniqueIndices.size !== optionIndices.length) {
      return NextResponse.json({ error: 'Cannot select the same option multiple times' }, { status: 400 })
    }
  } else if (pollType === 'ranking') {
    optionIndices = body?.rankedIndices || null
    if (!Array.isArray(optionIndices) || optionIndices.length === 0) {
      return NextResponse.json({ error: 'rankedIndices is required for ranking polls' }, { status: 400 })
    }
    // For ranking, must rank all options exactly once
    if (optionIndices.length !== options.length) {
      return NextResponse.json(
        { error: `Must rank all ${options.length} options` },
        { status: 400 },
      )
    }
    // Check for duplicates
    const uniqueIndices = new Set(optionIndices)
    if (uniqueIndices.size !== optionIndices.length) {
      return NextResponse.json({ error: 'Cannot rank the same option multiple times' }, { status: 400 })
    }
  } else {
    return NextResponse.json({ error: 'Invalid poll type' }, { status: 400 })
  }

  // Validate all indices are within range
  for (const index of optionIndices) {
    if (typeof index !== 'number' || index < 0 || index >= options.length) {
      return NextResponse.json({ error: `Invalid option index: ${index}` }, { status: 400 })
    }
  }

  const req = { user, payload, headers: request.headers, body: {} } as any

  // Check if user already voted - if so, update; otherwise create
  const existing = await payload.find({
    collection: 'poll-votes',
    limit: 1,
    overrideAccess: true,
    where: {
      and: [{ poll: { equals: pollId } }, { user: { equals: user.id } }],
    },
  })

  if (existing.totalDocs > 0) {
    // Update existing vote
    const existingVote = existing.docs[0] as any
    await payload.update({
      collection: 'poll-votes',
      id: existingVote.id,
      req,
      data: { optionIndices },
    })
  } else {
    // Create new vote
    req.body = { poll: pollId, user: user.id, optionIndices }
    await payload.create({
      collection: 'poll-votes',
      req,
      data: { poll: pollId, user: user.id, optionIndices },
    })
  }

  // Get updated total votes
  const votes = await payload.find({
    collection: 'poll-votes',
    limit: 0,
    overrideAccess: true,
    where: { poll: { equals: pollId } },
  })

  return NextResponse.json({
    voted: true,
    optionIndices: pollType === 'select' ? optionIndices : undefined,
    rankedIndices: pollType === 'ranking' ? optionIndices : undefined,
    totalVotes: votes.totalDocs,
  })
}

// DELETE endpoint is now handled by the reset route

