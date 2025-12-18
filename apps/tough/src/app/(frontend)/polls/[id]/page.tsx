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

  const days = Math.floor(diff / (1000 * 60 * 60 * 24))
  const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))

  if (days > 0) return `${days} day${days !== 1 ? 's' : ''} remaining`
  if (hours > 0) return `${hours} hour${hours !== 1 ? 's' : ''} remaining`
  if (minutes > 0) return `${minutes} minute${minutes !== 1 ? 's' : ''} remaining`
  return 'Less than a minute remaining'
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

  let userVote: { optionIndex: number } | null = null
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

  // If user has voted or poll has ended, get vote counts for each option
  let initialVoteCounts: Array<{ optionIndex: number; count: number }> = []
  if (userVote || !active) {
    const allVotes = await payload.find({
      collection: 'poll-votes',
      depth: 0,
      limit: 1000,
      overrideAccess: true,
      where: { poll: { equals: pollIdForRelations } },
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
    initialVoteCounts = Object.entries(optionCounts).map(([index, count]) => ({
      optionIndex: Number(index),
      count,
    }))

    // Sort by optionIndex
    initialVoteCounts.sort((a, b) => a.optionIndex - b.optionIndex)
  }

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
            isLoggedIn={Boolean(user)}
            initiallyVoted={Boolean(userVote)}
            initialOptionIndex={userVote?.optionIndex ?? null}
            initialTotalVotes={totalVotes}
            initialVoteCounts={initialVoteCounts}
            options={options}
            hasEnded={!active}
          />
        </div>
      </section>
    </div>
  )
}

