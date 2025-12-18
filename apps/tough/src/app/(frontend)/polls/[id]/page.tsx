import { headers as getHeaders } from 'next/headers'
import Link from 'next/link'
import { notFound } from 'next/navigation'

import { getPayloadClient } from '@/getPayloadClient'
import { LexicalRender } from '../../roadmap/lexical-render'
import { PollClient } from './poll-client'

function isPollActive(endDate: string | null | undefined): boolean {
  if (!endDate) return true
  const end = new Date(endDate)
  const now = new Date()
  return end > now
}

function formatTimeRemaining(endDate: string): string {
  const end = new Date(endDate)
  const now = new Date()
  const diff = end.getTime() - now.getTime()

  if (diff <= 0) return 'Ended'

  const totalHours = diff / (1000 * 60 * 60)
  const totalMinutes = diff / (1000 * 60)
  const days = Math.floor(diff / (1000 * 60 * 60 * 24))
  const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))

  // Priority: days, then hours (when < 12 hours total), then minutes (when < 30 min total)
  if (days > 0) {
    return `${days} day${days !== 1 ? 's' : ''} left`
  }
  if (totalHours < 12 && hours > 0) {
    return `${hours} hour${hours !== 1 ? 's' : ''} left`
  }
  if (totalMinutes < 30 && minutes > 0) {
    return `${minutes} minute${minutes !== 1 ? 's' : ''} left`
  }
  if (hours > 0) {
    return `${hours} hour${hours !== 1 ? 's' : ''} left`
  }
  if (minutes > 0) {
    return `${minutes} minute${minutes !== 1 ? 's' : ''} left`
  }
  return 'Less than a minute left'
}

export default async function PollDetailPage(props: { params: Promise<{ id: string }> }) {
  const { id } = await props.params
  const headers = await getHeaders()
  const payload = await getPayloadClient()

  const { user } = await payload.auth({ headers })

  let poll: any = null
  try {
    poll = await payload.findByID({
      collection: 'polls',
      id,
      depth: 0,
      overrideAccess: false,
    })
  } catch {
    poll = null
  }

  if (!poll) notFound()

  const pollId = Number(id)
  const pollIdForRelations = Number.isFinite(pollId) ? pollId : id
  const pollType = (poll.pollType || 'select') as 'select' | 'ranking'
  const maxSelections = poll.maxSelections ?? 1

  let userVote: { optionIndices?: number[]; optionIndex?: number } | null = null
  if (user) {
    const votes = await payload.find({
      collection: 'poll-votes',
      depth: 0,
      limit: 1,
      overrideAccess: true,
      where: {
        and: [{ poll: { equals: pollIdForRelations } }, { user: { equals: user.id } }],
      },
    })
    if (votes.totalDocs > 0) {
      userVote = votes.docs[0] as any
      // Backward compatibility: convert old optionIndex to optionIndices
      if (!userVote.optionIndices && typeof userVote.optionIndex === 'number') {
        userVote.optionIndices = [userVote.optionIndex]
      }
    }
  }

  const active = isPollActive(poll.endDate)
  const options = (poll.options || []) as Array<{ text: string }>

  // Calculate total votes
  const votes = await payload.find({
    collection: 'poll-votes',
    limit: 0,
    overrideAccess: true,
    where: { poll: { equals: pollIdForRelations } },
  })
  const totalVotes = votes.totalDocs

  // Get initial vote data based on poll type
  let initialVoteCounts: Array<{ optionIndex: number; count: number }> = []
  let initialRankingResults: Array<{ optionIndex: number; points: number; voteCount: number }> = []

  if (userVote || !active) {
    const allVotes = await payload.find({
      collection: 'poll-votes',
      depth: 0,
      limit: 1000,
      overrideAccess: true,
      where: { poll: { equals: pollIdForRelations } },
    })

    if (pollType === 'ranking') {
      // Calculate points per option for ranking polls
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
        rankedIndices.forEach((optionIndex: number, position: number) => {
          if (typeof optionIndex === 'number') {
            const points = numOptions - position // 1-based: top = N, bottom = 1
            optionPoints[optionIndex] = (optionPoints[optionIndex] || 0) + points
            optionVoteCounts[optionIndex] = (optionVoteCounts[optionIndex] || 0) + 1
          }
        })
      }

      initialRankingResults = Object.entries(optionPoints).map(([index, points]) => ({
        optionIndex: Number(index),
        points,
        voteCount: optionVoteCounts[Number(index)] || 0,
      }))

      // Sort by points (descending), then by optionIndex
      initialRankingResults.sort((a, b) => {
        if (b.points !== a.points) return b.points - a.points
        return a.optionIndex - b.optionIndex
      })
    } else {
      // Count votes per option for select polls
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

      initialVoteCounts = Object.entries(optionCounts).map(([index, count]) => ({
        optionIndex: Number(index),
        count,
      }))

      // Sort by optionIndex
      initialVoteCounts.sort((a, b) => a.optionIndex - b.optionIndex)
    }
  }

  // Extract user's vote data
  const initialOptionIndices = userVote?.optionIndices || null
  const initialRankedIndices = pollType === 'ranking' ? initialOptionIndices : null

  return (
    <div className="rm-shell">
      <header className="rm-detailHeader">
        <div className="rm-detailHeaderLeft">
          <Link className="rm-backLink" href="/polls">
            ← Back to polls
          </Link>
          <div className="rm-detailTitleRow">
            <div className="rm-status" data-status={active ? 'in_progress' : 'done'}>
              {active ? 'Active' : 'Ended'}
            </div>
            <h1 className="rm-detailTitle">{poll.title}</h1>
          </div>
          {poll.endDate && (
            <p className="rm-muted">
              {active ? formatTimeRemaining(poll.endDate) : 'This poll has ended'}
            </p>
          )}
        </div>

        <div className="rm-heroActions">
          {!user ? (
            <Link
              className="rm-button rm-buttonPrimary"
              href={`/api/auth/discord?returnTo=/polls/${id}`}
            >
              Login with Discord
            </Link>
          ) : (
            <div className="rm-userPill">
              <span className="rm-userDot" />
              <span className="rm-userText">{(user as any).discordUsername || user.email}</span>
              <form action="/api/auth/logout" method="post">
                <button className="rm-linkButton" type="submit">
                  Logout
                </button>
              </form>
            </div>
          )}
        </div>
      </header>

      <section className="rm-detailBody">
        {poll.details ? (
          <>
            <h2 className="rm-h2">Details</h2>
            <LexicalRender value={poll.details} />
          </>
        ) : null}

        <div className="rm-pollSection">
          <h2 className="rm-h2">Vote</h2>
          <PollClient
            pollId={id}
            pollType={pollType}
            isLoggedIn={Boolean(user)}
            initiallyVoted={Boolean(userVote)}
            initialOptionIndices={pollType === 'select' ? initialOptionIndices : null}
            initialRankedIndices={initialRankedIndices}
            initialTotalVotes={totalVotes}
            initialVoteCounts={pollType === 'select' ? initialVoteCounts : undefined}
            initialRankingResults={pollType === 'ranking' ? initialRankingResults : undefined}
            options={options}
            maxSelections={maxSelections}
            hasEnded={!active}
          />
        </div>
      </section>
    </div>
  )
}

