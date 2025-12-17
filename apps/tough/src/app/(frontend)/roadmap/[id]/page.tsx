import { headers as getHeaders } from 'next/headers'
import Link from 'next/link'
import { notFound } from 'next/navigation'

import { getPayloadClient } from '@/getPayloadClient'
import { LexicalRender } from '../lexical-render'
import { RoadmapDetailClient } from './detail-client'

export default async function RoadmapDetailPage(props: { params: Promise<{ id: string }> }) {
  const { id } = await props.params
  const headers = await getHeaders()
  const payload = await getPayloadClient()

  const { user } = await payload.auth({ headers })

  let item: any = null
  try {
    item = await payload.findByID({
      collection: 'roadmap-items',
      id,
      depth: 0,
      overrideAccess: false,
    })
  } catch {
    item = null
  }

  if (!item) notFound()

  const numericId = Number(id)
  const itemIdForRelations = Number.isFinite(numericId) ? numericId : id

  const upvotedItemIds = new Set<string>()
  if (user) {
    const votes = await payload.find({
      collection: 'roadmap-votes',
      depth: 0,
      limit: 1,
      overrideAccess: true,
      where: {
        and: [{ user: { equals: user.id } }, { item: { equals: itemIdForRelations } }],
      },
    })
    if (votes.totalDocs > 0) upvotedItemIds.add(id)
  }

  return (
    <div className="rm-shell">
      <header className="rm-detailHeader">
        <div className="rm-detailHeaderLeft">
          <Link className="rm-backLink" href="/roadmap">
            ← Back to roadmap
          </Link>
          <div className="rm-detailTitleRow">
            <div className="rm-status" data-status={(item as any).status}>
              {(item as any).status === 'in_progress'
                ? 'In progress'
                : (item as any).status === 'done'
                  ? 'Completed'
                  : 'Planned'}
            </div>
            <h1 className="rm-detailTitle">{(item as any).title}</h1>
          </div>
          {(item as any).summary ? <p className="rm-lede">{(item as any).summary}</p> : null}
        </div>

        <div className="rm-heroActions">
          {!user ? (
            <Link className="rm-button rm-buttonPrimary" href={`/api/auth/discord?returnTo=/roadmap/${id}`}>
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
        <h2 className="rm-h2">Details</h2>
        <LexicalRender value={(item as any).details} />
        {!(item as any).details ? <p className="rm-muted">No additional details yet.</p> : null}

        <RoadmapDetailClient
          id={id}
          isLoggedIn={Boolean(user)}
          initiallyUpvoted={upvotedItemIds.has(id)}
          initialUpvoteCount={Number((item as any).upvoteCount || 0)}
          initialCommentCount={Number((item as any).commentCount || 0)}
        />
      </section>
    </div>
  )
}

