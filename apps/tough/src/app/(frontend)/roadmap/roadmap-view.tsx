'use client'

import React from 'react'

import { RoadmapCard } from './roadmap-card'

type RoadmapItem = {
  id: string
  title: string
  summary?: string | null
  status: 'planned' | 'in_progress' | 'done'
  priority?: number | null
  upvoteCount?: number | null
  commentCount?: number | null
}

type ViewMode = 'sections' | 'board'

function getInitialView(): ViewMode {
  if (typeof window === 'undefined') return 'sections'
  const stored = window.localStorage.getItem('roadmap_view')
  return stored === 'board' ? 'board' : 'sections'
}

function Section(props: {
  title: string
  description: string
  items: RoadmapItem[]
  isLoggedIn: boolean
  upvotedItemIds: Set<string>
}) {
  const { title, description, items, isLoggedIn, upvotedItemIds } = props
  return (
    <section className="rm-section">
      <header className="rm-sectionHeader">
        <div>
          <h2 className="rm-h2">{title}</h2>
          <p className="rm-muted">{description}</p>
        </div>
        <div className="rm-countPill">{items.length}</div>
      </header>

      <div className="rm-grid">
        {items.map((item) => (
          <RoadmapCard
            key={item.id}
            item={item}
            isLoggedIn={isLoggedIn}
            initiallyUpvoted={upvotedItemIds.has(item.id)}
          />
        ))}
      </div>

      {items.length === 0 ? (
        <div className="rm-empty">
          <p className="rm-muted">Nothing here yet.</p>
        </div>
      ) : null}
    </section>
  )
}

function BoardColumn(props: {
  title: string
  description: string
  items: RoadmapItem[]
  isLoggedIn: boolean
  upvotedItemIds: Set<string>
}) {
  const { title, description, items, isLoggedIn, upvotedItemIds } = props

  return (
    <section className="rm-boardColumn">
      <header className="rm-boardHeader">
        <div>
          <h2 className="rm-h2">{title}</h2>
          <p className="rm-muted">{description}</p>
        </div>
        <div className="rm-countPill">{items.length}</div>
      </header>

      <div className="rm-boardList">
        {items.map((item) => (
          <RoadmapCard
            key={item.id}
            item={item}
            isLoggedIn={isLoggedIn}
            initiallyUpvoted={upvotedItemIds.has(item.id)}
          />
        ))}
        {items.length === 0 ? (
          <div className="rm-empty">
            <p className="rm-muted">Nothing here yet.</p>
          </div>
        ) : null}
      </div>
    </section>
  )
}

export function RoadmapView(props: {
  inProgress: RoadmapItem[]
  planned: RoadmapItem[]
  done: RoadmapItem[]
  isLoggedIn: boolean
  upvotedItemIds: string[]
}) {
  const { inProgress, planned, done, isLoggedIn } = props
  const upvotedSet = React.useMemo(() => new Set(props.upvotedItemIds), [props.upvotedItemIds])

  const [view, setView] = React.useState<ViewMode>('sections')

  React.useEffect(() => {
    const initial = getInitialView()
    console.log(`\n\n[tough][ui][roadmapView][mount] initialView=${initial} isLoggedIn=${isLoggedIn} upvotedCount=${props.upvotedItemIds.length}\n\n`)
    setView(initial)
  }, [])

  function setAndPersist(next: ViewMode) {
    console.log(`\n\n[tough][ui][roadmapView][toggle] next=${next}\n\n`)
    setView(next)
    try {
      window.localStorage.setItem('roadmap_view', next)
    } catch {}
  }

  return (
    <>
      <div className="rm-viewBar">
        <div className="rm-viewToggle" role="tablist" aria-label="Roadmap view">
          <button
            type="button"
            role="tab"
            aria-selected={view === 'sections'}
            className={`rm-viewTab ${view === 'sections' ? 'is-active' : ''}`}
            onClick={() => setAndPersist('sections')}
          >
            Sections
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={view === 'board'}
            className={`rm-viewTab ${view === 'board' ? 'is-active' : ''}`}
            onClick={() => setAndPersist('board')}
          >
            Board
          </button>
        </div>
      </div>

      {view === 'sections' ? (
        <div className="rm-columns">
          <Section
            title="Currently worked on"
            description="Active work in progress."
            items={inProgress}
            isLoggedIn={isLoggedIn}
            upvotedItemIds={upvotedSet}
          />
          <Section
            title="New (not started)"
            description="Queued up and ready to be picked up."
            items={planned}
            isLoggedIn={isLoggedIn}
            upvotedItemIds={upvotedSet}
          />
          <Section
            title="Completed"
            description="Shipped and done."
            items={done}
            isLoggedIn={isLoggedIn}
            upvotedItemIds={upvotedSet}
          />
        </div>
      ) : (
        <div className="rm-boardWrap">
          <div className="rm-board" role="region" aria-label="Roadmap board">
            <BoardColumn
              title="New (not started)"
              description="Ready to be picked up."
              items={planned}
              isLoggedIn={isLoggedIn}
              upvotedItemIds={upvotedSet}
            />
            <BoardColumn
              title="Currently worked on"
              description="Active work in progress."
              items={inProgress}
              isLoggedIn={isLoggedIn}
              upvotedItemIds={upvotedSet}
            />
            <BoardColumn
              title="Completed"
              description="Shipped and done."
              items={done}
              isLoggedIn={isLoggedIn}
              upvotedItemIds={upvotedSet}
            />
          </div>
        </div>
      )}
    </>
  )
}

