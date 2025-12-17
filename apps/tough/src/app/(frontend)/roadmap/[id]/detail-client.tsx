'use client'

import React from 'react'

type CommentDoc = {
  id: string
  body: string
  createdAt: string
}

export function RoadmapDetailClient(props: {
  id: string
  isLoggedIn: boolean
  initiallyUpvoted: boolean
  initialUpvoteCount: number
  initialCommentCount: number
}) {
  const { id, isLoggedIn, initiallyUpvoted, initialUpvoteCount, initialCommentCount } = props

  React.useEffect(() => {
    console.log(
      `\n\n[tough][ui][roadmapDetail][mount] id=${id} isLoggedIn=${isLoggedIn} initiallyUpvoted=${initiallyUpvoted} upvotes=${initialUpvoteCount} comments=${initialCommentCount}\n\n`,
    )
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const [upvoted, setUpvoted] = React.useState(initiallyUpvoted)
  const [upvoteCount, setUpvoteCount] = React.useState(initialUpvoteCount)

  const [commentCount, setCommentCount] = React.useState(initialCommentCount)
  const [commentsLoading, setCommentsLoading] = React.useState(false)
  const [comments, setComments] = React.useState<CommentDoc[]>([])
  const [commentBody, setCommentBody] = React.useState('')
  const [error, setError] = React.useState<string | null>(null)

  async function toggleUpvote() {
    if (!isLoggedIn) return
    setError(null)

    console.log(`\n\n[tough][ui][roadmapDetail][upvote][start] id=${id}\n\n`)
    const res = await fetch(`/api/roadmap/${id}/upvote`, { method: 'POST' })
    const json = (await res.json().catch(() => null)) as
      | { upvoted: boolean; upvoteCount: number }
      | { error: string }
      | null

    if (!res.ok || !json || 'error' in json) {
      setError((json && 'error' in json && json.error) || 'Unable to upvote')
      console.log(`\n\n[tough][ui][roadmapDetail][upvote][error] id=${id} status=${res.status}\n\n`)
      return
    }

    setUpvoted(json.upvoted)
    setUpvoteCount(json.upvoteCount)
    console.log(
      `\n\n[tough][ui][roadmapDetail][upvote][done] id=${id} upvoted=${json.upvoted} upvoteCount=${json.upvoteCount}\n\n`,
    )
  }

  async function loadComments() {
    setCommentsLoading(true)
    setError(null)
    try {
      console.log(`\n\n[tough][ui][roadmapDetail][comments][get][start] id=${id}\n\n`)
      const res = await fetch(`/api/roadmap/${id}/comments?limit=50`)
      const json = (await res.json()) as { docs?: CommentDoc[] }
      setComments(Array.isArray(json.docs) ? json.docs : [])
      console.log(
        `\n\n[tough][ui][roadmapDetail][comments][get][done] id=${id} count=${Array.isArray(json.docs) ? json.docs.length : 0}\n\n`,
      )
    } catch {
      setError('Unable to load comments')
      console.log(`\n\n[tough][ui][roadmapDetail][comments][get][error] id=${id}\n\n`)
    } finally {
      setCommentsLoading(false)
    }
  }

  async function submitComment(e: React.FormEvent) {
    e.preventDefault()
    if (!isLoggedIn) return

    const text = commentBody.trim()
    if (!text) return

    setError(null)
    console.log(`\n\n[tough][ui][roadmapDetail][comments][post][start] id=${id} len=${text.length}\n\n`)
    const res = await fetch(`/api/roadmap/${id}/comments`, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ body: text }),
    })

    const json = (await res.json().catch(() => null)) as
      | { comment: CommentDoc; commentCount: number }
      | { error: string }
      | null

    if (!res.ok || !json || 'error' in json) {
      setError((json && 'error' in json && json.error) || 'Unable to comment')
      console.log(
        `\n\n[tough][ui][roadmapDetail][comments][post][error] id=${id} status=${res.status}\n\n`,
      )
      return
    }

    setCommentBody('')
    setCommentCount(json.commentCount)
    setComments((prev) => [json.comment, ...prev])
    console.log(
      `\n\n[tough][ui][roadmapDetail][comments][post][done] id=${id} commentCount=${json.commentCount}\n\n`,
    )
  }

  // Lazy-load comments when a user hits the anchor.
  React.useEffect(() => {
    const hash = typeof window !== 'undefined' ? window.location.hash : ''
    console.log(`\n\n[tough][ui][roadmapDetail][hash] hash=${hash}\n\n`)
    if (hash === '#comments') void loadComments()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return (
    <div className="rm-detailActions">
      <div className="rm-detailPills">
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

        <a className="rm-iconButton" href="#comments" onClick={() => void loadComments()}>
          <span aria-hidden>💬</span>
          <span className="rm-iconCount">{commentCount}</span>
        </a>
      </div>

      {error ? <p className="rm-error">{error}</p> : null}

      <section id="comments" className="rm-comments">
        <h2 className="rm-h2">Comments</h2>

        {!isLoggedIn ? (
          <p className="rm-muted">Login to add a comment.</p>
        ) : (
          <form className="rm-commentForm" onSubmit={submitComment}>
            <textarea
              className="rm-textarea"
              value={commentBody}
              onChange={(e) => setCommentBody(e.target.value)}
              placeholder="Add a comment…"
              rows={4}
            />
            <div className="rm-commentActions">
              <button className="rm-button rm-buttonSmall" type="submit">
                Post
              </button>
              <button
                className="rm-button rm-buttonSmall rm-buttonGhost"
                type="button"
                onClick={() => void loadComments()}
              >
                Refresh
              </button>
            </div>
          </form>
        )}

        {commentsLoading ? (
          <p className="rm-muted">Loading comments…</p>
        ) : comments.length === 0 ? (
          <p className="rm-muted">No comments yet.</p>
        ) : (
          <ul className="rm-commentList">
            {comments.map((c) => (
              <li key={c.id} className="rm-comment">
                <p className="rm-commentBody">{c.body}</p>
                <p className="rm-commentMeta">{new Date(c.createdAt).toLocaleString()}</p>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  )
}

