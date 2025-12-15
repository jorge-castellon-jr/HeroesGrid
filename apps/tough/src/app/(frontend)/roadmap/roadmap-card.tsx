'use client'

import React from 'react'
import Link from 'next/link'

type RoadmapItem = {
  id: string
  title: string
  summary?: string | null
  status: 'planned' | 'in_progress' | 'done'
  upvoteCount?: number | null
  commentCount?: number | null
}

export function RoadmapCard(props: {
  item: RoadmapItem
  isLoggedIn: boolean
  initiallyUpvoted: boolean
}) {
  const { item, isLoggedIn, initiallyUpvoted } = props

  const [upvoted, setUpvoted] = React.useState(initiallyUpvoted)
  const [upvoteCount, setUpvoteCount] = React.useState(item.upvoteCount ?? 0)
  const [commentCount] = React.useState(item.commentCount ?? 0)
  const [error, setError] = React.useState<string | null>(null)

  async function toggleUpvote() {
    if (!isLoggedIn) return
    setError(null)

    const res = await fetch(`/api/roadmap/${item.id}/upvote`, { method: 'POST' })
    const json = (await res.json().catch(() => null)) as
      | { upvoted: boolean; upvoteCount: number }
      | { error: string }
      | null

    if (!res.ok || !json || 'error' in json) {
      setError((json && 'error' in json && json.error) || 'Unable to upvote')
      return
    }

    setUpvoted(json.upvoted)
    setUpvoteCount(json.upvoteCount)
  }

  return (
    <article className="rm-card">
      <Link className="rm-cardOverlay" href={`/roadmap/${item.id}`} aria-label={`View details: ${item.title}`} />
      <div className="rm-cardTop">
        <div className="rm-status" data-status={item.status}>
          {item.status === 'in_progress'
            ? 'In progress'
            : item.status === 'done'
              ? 'Completed'
              : 'Planned'}
        </div>

        <div className="rm-actions">
          <button
            className={`rm-iconButton ${upvoted ? 'is-active' : ''}`}
            type="button"
            onClick={toggleUpvote}
            disabled={!isLoggedIn}
            title={isLoggedIn ? 'Upvote' : 'Login to upvote'}
          >
            <span aria-hidden>▲</span>
            <span className="rm-iconCount">{upvoteCount}</span>
          </button>
          <Link className="rm-iconButton" href={`/roadmap/${item.id}#comments`} title="View comments">
            <span aria-hidden>💬</span>
            <span className="rm-iconCount">{commentCount}</span>
          </Link>
        </div>
      </div>

      <h3 className="rm-h3 rm-cardTitle">{item.title}</h3>
      {item.summary ? <p className="rm-summary rm-cardSummary">{item.summary}</p> : null}
      <div className="rm-cardLinkRow" aria-hidden>
        <span className="rm-cardLinkText">View details</span>
        <span aria-hidden>→</span>
      </div>

      {error ? <p className="rm-error">{error}</p> : null}
    </article>
  )
}

