import { NextResponse } from 'next/server'

import { getPayloadClient } from '@/getPayloadClient'

export async function GET(request: Request, context: { params: Promise<{ id: string }> }) {
  const { id } = await context.params
  const pollId = Number(id)
  if (!Number.isFinite(pollId)) {
    return NextResponse.json({ error: 'Invalid id' }, { status: 400 })
  }

  const payload = await getPayloadClient()
  const { user } = await payload.auth({ headers: request.headers })

  // Fetch poll
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

  // Check if poll has ended
  const endDate = poll?.endDate
  const hasEnded = endDate ? new Date(endDate) <= new Date() : false

  // Check if user has voted
  let hasVoted = false
  if (user) {
    const votes = await payload.find({
      collection: 'poll-votes',
      limit: 1,
      overrideAccess: true,
      where: {
        and: [{ poll: { equals: pollId } }, { user: { equals: user.id } }],
      },
    })
    hasVoted = votes.totalDocs > 0
  }

  // Only return results if user has voted or poll has ended
  if (!hasVoted && !hasEnded) {
    return NextResponse.json({ error: 'Results not available' }, { status: 403 })
  }

  // Get all votes for this poll
  const allVotes = await payload.find({
    collection: 'poll-votes',
    depth: 0,
    limit: 1000,
    overrideAccess: true,
    where: { poll: { equals: pollId } },
  })

  // Count votes per option
  const optionCounts: Record<number, number> = {}
  for (const vote of allVotes.docs) {
    const optionIndex = (vote as any).optionIndex
    if (typeof optionIndex === 'number') {
      optionCounts[optionIndex] = (optionCounts[optionIndex] || 0) + 1
    }
  }

  // Convert to array format
  const results = Object.entries(optionCounts).map(([index, count]) => ({
    optionIndex: Number(index),
    count,
  }))

  // Sort by optionIndex
  results.sort((a, b) => a.optionIndex - b.optionIndex)

  return NextResponse.json({ results })
}

