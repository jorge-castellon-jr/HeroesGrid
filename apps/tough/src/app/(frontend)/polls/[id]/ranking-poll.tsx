'use client'

import React from 'react'

type RankingResult = {
  optionIndex: number
  points: number
  voteCount: number
}

export function RankingPoll(props: {
  pollId: string
  isLoggedIn: boolean
  initiallyVoted: boolean
  initialRankedIndices: number[] | null
  initialTotalVotes: number
  initialRankingResults?: Array<{ optionIndex: number; points: number; voteCount: number }>
  options: Array<{ text: string }>
  hasEnded: boolean
}) {
  const {
    pollId,
    isLoggedIn,
    initiallyVoted,
    initialRankedIndices,
    initialTotalVotes,
    initialRankingResults = [],
    options,
    hasEnded,
  } = props

  const [voted, setVoted] = React.useState(initiallyVoted)
  const [rankedIndices, setRankedIndices] = React.useState<number[]>(
    initialRankedIndices || options.map((_, i) => i),
  )
  const [totalVotes, setTotalVotes] = React.useState(initialTotalVotes)
  const [rankingResults, setRankingResults] = React.useState<RankingResult[]>(initialRankingResults)
  const [showResults, setShowResults] = React.useState(initiallyVoted || hasEnded)
  const [loading, setLoading] = React.useState(false)
  const [error, setError] = React.useState<string | null>(null)

  // Load results if user has voted or poll has ended (but only if we don't have initial results)
  React.useEffect(() => {
    if (showResults && initialRankingResults.length === 0) {
      loadResults()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [showResults])

  async function loadResults() {
    try {
      const res = await fetch(`/api/polls/${pollId}/results`)
      if (res.ok) {
        const json = (await res.json()) as { results?: RankingResult[] }
        if (Array.isArray(json.results)) {
          setRankingResults(json.results)
        }
      }
    } catch {
      // Silently fail - results might not be available yet
    }
  }

  function moveOption(index: number, direction: 'up' | 'down') {
    if (hasEnded || voted || loading) return

    setRankedIndices((prev) => {
      const newIndices = [...prev]
      const currentIndex = newIndices.indexOf(index)

      if (currentIndex === -1) return prev

      if (direction === 'up' && currentIndex > 0) {
        // Move up (better rank)
        ;[newIndices[currentIndex - 1], newIndices[currentIndex]] = [
          newIndices[currentIndex],
          newIndices[currentIndex - 1],
        ]
      } else if (direction === 'down' && currentIndex < newIndices.length - 1) {
        // Move down (worse rank)
        ;[newIndices[currentIndex], newIndices[currentIndex + 1]] = [
          newIndices[currentIndex + 1],
          newIndices[currentIndex],
        ]
      }

      return newIndices
    })
  }

  async function handleSubmit() {
    if (!isLoggedIn || hasEnded || voted) return
    setError(null)
    setLoading(true)

    try {
      const res = await fetch(`/api/polls/${pollId}/vote`, {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ rankedIndices: rankedIndices }),
      })
      let json:
        | { voted: boolean; rankedIndices?: number[]; totalVotes: number }
        | { error: string }
        | null = null
      try {
        json = (await res.json()) as typeof json
      } catch {
        json = null
      }

      if (!res.ok || !json || 'error' in json) {
        setError((json && 'error' in json && json.error) || 'Unable to vote')
        return
      }

      setVoted(true)
      setTotalVotes(json.totalVotes)
      setShowResults(true)
      // Reload results to get updated rankings
      await loadResults()
    } finally {
      setLoading(false)
    }
  }

  async function handleReset() {
    if (!isLoggedIn || hasEnded) return
    setError(null)
    setLoading(true)

    try {
      if (voted) {
        // Delete existing vote
        const res = await fetch(`/api/polls/${pollId}/reset`, { method: 'DELETE' })
        let json: { voted: boolean; totalVotes: number } | { error: string } | null = null
        try {
          json = (await res.json()) as typeof json
        } catch {
          json = null
        }

        if (!res.ok || !json || 'error' in json) {
          setError((json && 'error' in json && json.error) || 'Unable to reset vote')
          return
        }

        setVoted(false)
        setTotalVotes(json.totalVotes)
        setShowResults(false)
        setRankingResults([])
      }
      // Reset to default order
      setRankedIndices(options.map((_, i) => i))
    } finally {
      setLoading(false)
    }
  }

  function getRankingForOption(optionIndex: number): RankingResult | null {
    return rankingResults.find((r) => r.optionIndex === optionIndex) || null
  }

  function getRankPosition(optionIndex: number): number {
    // Find position in results sorted by points (descending)
    const sorted = [...rankingResults].sort((a, b) => b.points - a.points)
    const index = sorted.findIndex((r) => r.optionIndex === optionIndex)
    return index >= 0 ? index + 1 : 0
  }

  const canSubmit = !voted && !hasEnded && isLoggedIn

  return (
    <div className="rm-pollVoting">
      <div className="rm-pollRankingOptions">
        {rankedIndices.map((optionIndex, rankPosition) => {
          const option = options[optionIndex]
          const ranking = showResults ? getRankingForOption(optionIndex) : null
          const finalRank = showResults ? getRankPosition(optionIndex) : null
          const isTop = rankPosition === 0
          const isBottom = rankPosition === rankedIndices.length - 1
          const isDisabled = hasEnded || voted || loading || !isLoggedIn

          return (
            <div
              key={optionIndex}
              className="rm-pollRankingOption"
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                padding: '12px',
                border: '1px solid var(--rm-border)',
                borderRadius: '12px',
                marginBottom: '8px',
                background: 'var(--rm-surface-solid)',
              }}
            >
              <div
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '4px',
                }}
              >
                <button
                  type="button"
                  onClick={() => moveOption(optionIndex, 'up')}
                  disabled={isDisabled || isTop}
                  title="Move up (better rank)"
                  className="rm-rankArrowButton"
                  style={{
                    width: '32px',
                    height: '32px',
                    padding: 0,
                    border: '1px solid var(--rm-border)',
                    borderRadius: '8px',
                    background:
                      'radial-gradient(1200px 400px at 0% 0%, rgba(109, 40, 217, 0.18), rgba(0, 0, 0, 0)), radial-gradient(900px 360px at 100% 0%, rgba(37, 99, 235, 0.14), rgba(0, 0, 0, 0)), var(--rm-surface)',
                    color: 'var(--rm-text)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: isDisabled || isTop ? 'not-allowed' : 'pointer',
                    opacity: isDisabled || isTop ? 0.55 : 1,
                    fontSize: '16px',
                    fontWeight: 600,
                  }}
                >
                  ↑
                </button>
                <button
                  type="button"
                  onClick={() => moveOption(optionIndex, 'down')}
                  disabled={isDisabled || isBottom}
                  title="Move down (worse rank)"
                  className="rm-rankArrowButton"
                  style={{
                    width: '32px',
                    height: '32px',
                    padding: 0,
                    border: '1px solid var(--rm-border)',
                    borderRadius: '8px',
                    background:
                      'radial-gradient(1200px 400px at 0% 0%, rgba(109, 40, 217, 0.18), rgba(0, 0, 0, 0)), radial-gradient(900px 360px at 100% 0%, rgba(37, 99, 235, 0.14), rgba(0, 0, 0, 0)), var(--rm-surface)',
                    color: 'var(--rm-text)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: isDisabled || isBottom ? 'not-allowed' : 'pointer',
                    opacity: isDisabled || isBottom ? 0.55 : 1,
                    fontSize: '16px',
                    fontWeight: 600,
                  }}
                >
                  ↓
                </button>
              </div>

              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <span
                    style={{
                      fontWeight: 700,
                      fontSize: '14px',
                      color: 'var(--rm-muted)',
                      minWidth: '40px',
                    }}
                  >
                    #{rankPosition + 1}
                  </span>
                  <span style={{ fontWeight: 600, flex: 1 }}>{option.text}</span>
                  {showResults && ranking && (
                    <div
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '12px',
                        fontSize: '13px',
                        color: 'var(--rm-muted)',
                      }}
                    >
                      <span>
                        {ranking.points} point{ranking.points !== 1 ? 's' : ''}
                      </span>
                      {finalRank && finalRank > 0 && (
                        <span style={{ fontWeight: 700, color: 'var(--rm-accent)' }}>
                          Rank #{finalRank}
                        </span>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>
          )
        })}
      </div>

      {error ? <p className="rm-error">{error}</p> : null}

      {!isLoggedIn && !hasEnded ? (
        <p className="rm-muted">Login to vote on this poll.</p>
      ) : null}

      {!hasEnded && !voted && (
        <div className="rm-pollActions" style={{ marginTop: '16px', display: 'flex', gap: '10px' }}>
          <button
            type="button"
            className="rm-button rm-buttonPrimary"
            onClick={handleSubmit}
            disabled={!canSubmit || loading}
          >
            {loading ? 'Submitting...' : 'Submit Ranking'}
          </button>
          <button
            type="button"
            className="rm-button"
            onClick={handleReset}
            disabled={loading}
          >
            {loading ? 'Resetting...' : 'Reset'}
          </button>
        </div>
      )}
      {!hasEnded && voted && (
        <div className="rm-pollActions" style={{ marginTop: '16px', display: 'flex', gap: '10px' }}>
          <button
            type="button"
            className="rm-button"
            onClick={handleReset}
            disabled={loading}
          >
            {loading ? 'Resetting...' : 'Reset'}
          </button>
        </div>
      )}

      <div className="rm-pollTotal">
        <span className="rm-countPill">{totalVotes} total votes</span>
      </div>
    </div>
  )
}

