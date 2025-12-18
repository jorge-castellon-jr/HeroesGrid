import { headers as getHeaders } from 'next/headers'
import Link from 'next/link'

import { getPayloadClient } from '@/getPayloadClient'

type Poll = {
  id: string
  title: string
  totalVotes?: number | null
  endDate?: string | null
  isActive?: boolean | null
  options?: Array<{ text: string }> | null
  pollType?: 'select' | 'ranking' | null
}

function isPollActive(poll: Poll): boolean {
  if (!poll.endDate) return true
  const endDate = new Date(poll.endDate)
  const now = new Date()
  return endDate > now
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

export default async function PollsPage(props: { searchParams: Promise<{ status?: string }> }) {
  const searchParams = await props.searchParams
  const status = searchParams.status || 'active'
  const headers = await getHeaders()
  const payload = await getPayloadClient()

  const { user } = await payload.auth({ headers })

  const allPolls = await payload.find({
    collection: 'polls',
    depth: 0,
    limit: 100,
    sort: ['-updatedAt'],
    overrideAccess: false,
  })

  const polls = (allPolls.docs ?? []) as unknown as Poll[]

  // Calculate total votes and winning option for each poll
  const pollsWithVotes = await Promise.all(
    polls.map(async (poll) => {
      const pollId = Number(poll.id)
      const pollIdForRelations = Number.isFinite(pollId) ? pollId : poll.id
      const active = isPollActive(poll)
      
      const votes = await payload.find({
        collection: 'poll-votes',
        limit: 0,
        overrideAccess: true,
        where: { poll: { equals: pollIdForRelations } },
      })
      
      let winningOption: string | null = null
      const pollType = poll.pollType || 'select'
      
      // For ended polls, calculate the winning option
      if (!active && votes.totalDocs > 0 && poll.options && Array.isArray(poll.options)) {
        const allVotes = await payload.find({
          collection: 'poll-votes',
          depth: 0,
          limit: 1000,
          overrideAccess: true,
          where: { poll: { equals: pollIdForRelations } },
        })

        if (pollType === 'ranking') {
          // For ranking polls, calculate points per option
          const optionPoints: Record<number, number> = {}
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
              }
            })
          }

          // Find the option(s) with the highest points
          const maxPoints = Math.max(...Object.values(optionPoints), 0)
          const winningIndices = Object.entries(optionPoints)
            .filter(([, points]) => points === maxPoints)
            .map(([index]) => Number(index))

          // If there's a clear winner (or tie), show the first winning option
          if (winningIndices.length > 0 && winningIndices[0] < poll.options.length) {
            winningOption = poll.options[winningIndices[0]].text
            // If there's a tie, indicate it
            if (winningIndices.length > 1) {
              winningOption = `${winningOption} (tie)`
            }
          }
        } else {
          // For select polls, count votes per option
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

          // Find the option(s) with the highest vote count
          const maxCount = Math.max(...Object.values(optionCounts), 0)
          const winningIndices = Object.entries(optionCounts)
            .filter(([, count]) => count === maxCount)
            .map(([index]) => Number(index))

          // If there's a clear winner (or tie), show the first winning option
          if (winningIndices.length > 0 && winningIndices[0] < poll.options.length) {
            winningOption = poll.options[winningIndices[0]].text
            // If there's a tie, indicate it
            if (winningIndices.length > 1) {
              winningOption = `${winningOption} (tie)`
            }
          }
        }
      }
      
      return {
        ...poll,
        totalVotes: votes.totalDocs,
        winningOption,
      }
    })
  )

  let filteredPolls: Poll[]
  if (status === 'all') {
    filteredPolls = pollsWithVotes
  } else if (status === 'ended') {
    filteredPolls = pollsWithVotes.filter((p) => !isPollActive(p))
  } else {
    // Default: active
    filteredPolls = pollsWithVotes.filter((p) => isPollActive(p))
  }

  return (
    <div className="rm-shell">
      <header className="rm-hero">
        <div>
          <h1 className="rm-h1">Polls</h1>
          <p className="rm-lede">Vote on community polls and see results after you vote.</p>
        </div>

        <div className="rm-heroActions">
          {!user ? (
            <Link className="rm-button rm-buttonPrimary" href="/api/auth/discord?returnTo=/polls">
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

      <div className="rm-viewBar">
        <div className="rm-viewToggle">
          <Link
            href="/polls?status=active"
            className={`rm-viewTab ${status === 'active' ? 'is-active' : ''}`}
          >
            Active
          </Link>
          <Link href="/polls?status=all" className={`rm-viewTab ${status === 'all' ? 'is-active' : ''}`}>
            All
          </Link>
          <Link
            href="/polls?status=ended"
            className={`rm-viewTab ${status === 'ended' ? 'is-active' : ''}`}
          >
            Ended
          </Link>
        </div>
      </div>

      {filteredPolls.length === 0 ? (
        <div className="rm-section">
          <p className="rm-muted">No polls found.</p>
        </div>
      ) : (
        <div className="rm-grid">
          {filteredPolls.map((poll) => {
            const active = isPollActive(poll)
            return (
              <Link key={poll.id} href={`/polls/${poll.id}`} className="rm-card">
                <div className="rm-cardOverlay" />
                <div className="rm-cardTop">
                  <div className="rm-status" data-status={active ? 'in_progress' : 'done'}>
                    {active ? 'Active' : 'Ended'}
                  </div>
                  <div className="rm-countPill">{poll.totalVotes || 0} votes</div>
                </div>
                <h2 className="rm-cardTitle">{poll.title}</h2>
                {poll.endDate && active && (
                  <p className="rm-muted" style={{ marginTop: '8px', marginBottom: 0, fontSize: '14px' }}>
                    {formatTimeRemaining(poll.endDate)}
                  </p>
                )}
                {!active && (poll as any).winningOption && (
                  <p className="rm-muted" style={{ marginTop: '8px', marginBottom: 0, fontSize: '14px', fontWeight: 600 }}>
                    Winner: {(poll as any).winningOption}
                  </p>
                )}
                <div className="rm-cardLinkRow">
                  <span className="rm-cardLinkText">View poll →</span>
                </div>
              </Link>
            )
          })}
        </div>
      )}

      <footer className="rm-footer" />
    </div>
  )
}

