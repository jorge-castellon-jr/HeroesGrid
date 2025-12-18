import { headers as getHeaders } from 'next/headers'
import Link from 'next/link'

import { getPayloadClient } from '@/getPayloadClient'

type Poll = {
  id: string
  title: string
  totalVotes?: number | null
  endDate?: string | null
  isActive?: boolean | null
}

function isPollActive(poll: Poll): boolean {
  if (!poll.endDate) return true
  const endDate = new Date(poll.endDate)
  const now = new Date()
  return endDate > now
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

  // Calculate total votes for each poll
  const pollsWithVotes = await Promise.all(
    polls.map(async (poll) => {
      const pollId = Number(poll.id)
      const pollIdForRelations = Number.isFinite(pollId) ? pollId : poll.id
      
      const votes = await payload.find({
        collection: 'poll-votes',
        limit: 0,
        overrideAccess: true,
        where: { poll: { equals: pollIdForRelations } },
      })
      
      return {
        ...poll,
        totalVotes: votes.totalDocs,
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

