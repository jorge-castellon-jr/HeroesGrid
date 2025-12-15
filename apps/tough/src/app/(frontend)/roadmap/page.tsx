import { headers as getHeaders } from 'next/headers'
import Link from 'next/link'
import { getPayload } from 'payload'

import config from '@/payload.config'
import { RoadmapView } from './roadmap-view'

type RoadmapItem = {
  id: string
  title: string
  summary?: string | null
  status: 'planned' | 'in_progress' | 'done'
  priority?: number | null
  upvoteCount?: number | null
  commentCount?: number | null
}

export default async function RoadmapPage() {
  const headers = await getHeaders()
  const payload = await getPayload({ config: await config })

  const { user } = await payload.auth({ headers })

  const items = await payload.find({
    collection: 'roadmap-items',
    depth: 0,
    limit: 100,
    sort: ['-priority', '-updatedAt'],
    overrideAccess: false,
  })

  const all = (items.docs ?? []) as unknown as RoadmapItem[]
  const itemIds = all.map((i) => i.id)

  const upvotedItemIds = new Set<string>()
  if (user && itemIds.length > 0) {
    const votes = await payload.find({
      collection: 'roadmap-votes',
      depth: 0,
      limit: 500,
      overrideAccess: true,
      where: {
        and: [{ user: { equals: user.id } }, { item: { in: itemIds } }],
      },
    })

    for (const vote of votes.docs as Array<{ item: string | { value: string } }>) {
      const value = typeof vote.item === 'string' ? vote.item : vote.item.value
      if (value) upvotedItemIds.add(value)
    }
  }

  const inProgress = all.filter((i) => i.status === 'in_progress')
  const planned = all.filter((i) => i.status === 'planned')
  const done = all.filter((i) => i.status === 'done')

  return (
    <div className="rm-shell">
      <header className="rm-hero">
        <div>
          <h1 className="rm-h1">Roadmap</h1>
          <p className="rm-lede">
            What we’re building now, what’s next, and what’s shipped. Vote and comment to help
            prioritize.
          </p>
        </div>

        <div className="rm-heroActions">
          {!user ? (
            <Link className="rm-button rm-buttonPrimary" href="/api/auth/discord?returnTo=/roadmap">
              Login with Discord
            </Link>
          ) : (
            <div className="rm-userPill">
              <span className="rm-userDot" />
              <span className="rm-userText">{user.email}</span>
              <form action="/api/auth/logout" method="post">
                <button className="rm-linkButton" type="submit">
                  Logout
                </button>
              </form>
            </div>
          )}
        </div>
      </header>

      <RoadmapView
        inProgress={inProgress}
        planned={planned}
        done={done}
        isLoggedIn={Boolean(user)}
        upvotedItemIds={[...upvotedItemIds]}
      />

      <footer className="rm-footer" />
    </div>
  )
}

