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

  const pollType = poll?.pollType || 'select'
  const options = poll?.options || []

  // Get all votes for this poll
  const allVotes = await payload.find({
    collection: 'poll-votes',
    depth: 0,
    limit: 1000,
    overrideAccess: true,
    where: { poll: { equals: pollId } },
  })

  if (pollType === 'ranking') {
    // For ranking polls, calculate points per option
    // Points = position from top (1-based: top = N points, bottom = 1 point)
    const optionPoints: Record<number, number> = {}
    const optionVoteCounts: Record<number, number> = {}

    for (const vote of allVotes.docs) {
      let rankedIndices = (vote as any).optionIndices
      // Backward compatibility: convert old optionIndex to array
      if (!Array.isArray(rankedIndices) && typeof (vote as any).optionIndex === 'number') {
        rankedIndices = [(vote as any).optionIndex]
      }
      if (!Array.isArray(rankedIndices)) continue

      const numOptions = rankedIndices.length
      // Top position gets N points, 2nd gets N-1, etc.
      rankedIndices.forEach((optionIndex: number, position: number) => {
        if (typeof optionIndex === 'number') {
          const points = numOptions - position // 1-based: top = N, bottom = 1
          optionPoints[optionIndex] = (optionPoints[optionIndex] || 0) + points
          optionVoteCounts[optionIndex] = (optionVoteCounts[optionIndex] || 0) + 1
        }
      })
    }

    // Convert to array format with points
    const results = Object.entries(optionPoints).map(([index, points]) => ({
      optionIndex: Number(index),
      points,
      voteCount: optionVoteCounts[Number(index)] || 0,
    }))

    // Sort by points (descending), then by optionIndex
    results.sort((a, b) => {
      if (b.points !== a.points) return b.points - a.points
      return a.optionIndex - b.optionIndex
    })

    return NextResponse.json({ results, pollType: 'ranking' })
    } else {
      // For select polls, count votes per option (current logic)
      const optionCounts: Record<number, number> = {}
      for (const vote of allVotes.docs) {
        let optionIndices = (vote as any).optionIndices
        // Backward compatibility: convert old optionIndex to array
        if (!Array.isArray(optionIndices) && typeof (vote as any).optionIndex === 'number') {
          optionIndices = [(vote as any).optionIndex]
        }
        if (Array.isArray(optionIndices)) {
          for (const optionIndex of optionIndices) {
            if (typeof optionIndex === 'number') {
              optionCounts[optionIndex] = (optionCounts[optionIndex] || 0) + 1
            }
          }
        }
      }

    // Convert to array format
    const results = Object.entries(optionCounts).map(([index, count]) => ({
      optionIndex: Number(index),
      count,
    }))

    // Sort by optionIndex
    results.sort((a, b) => a.optionIndex - b.optionIndex)

    return NextResponse.json({ results, pollType: 'select' })
  }
}

