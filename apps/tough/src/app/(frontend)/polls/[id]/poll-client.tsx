'use client'

import React from 'react'

type VoteResult = {
  optionIndex: number
  count: number
}

export function PollClient(props: {
  pollId: string
  isLoggedIn: boolean
  initiallyVoted: boolean
  initialOptionIndex: number | null
  initialTotalVotes: number
  initialVoteCounts?: Array<{ optionIndex: number; count: number }>
  options: Array<{ text: string }>
  hasEnded: boolean
}) {
  const {
    pollId,
    isLoggedIn,
    initiallyVoted,
    initialOptionIndex,
    initialTotalVotes,
    initialVoteCounts = [],
    options,
    hasEnded,
  } = props

  const [voted, setVoted] = React.useState(initiallyVoted)
  const [selectedOptionIndex, setSelectedOptionIndex] = React.useState<number | null>(
    initialOptionIndex,
  )
  const [totalVotes, setTotalVotes] = React.useState(initialTotalVotes)
  const [voteCounts, setVoteCounts] = React.useState<VoteResult[]>(initialVoteCounts)
  const [showResults, setShowResults] = React.useState(initiallyVoted || hasEnded)
  const [loading, setLoading] = React.useState(false)
  const [error, setError] = React.useState<string | null>(null)

  // Load results if user has voted or poll has ended (but only if we don't have initial counts)
  React.useEffect(() => {
    if (showResults && initialVoteCounts.length === 0) {
      loadResults()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [showResults])

  async function loadResults() {
    try {
      const res = await fetch(`/api/polls/${pollId}/results`)
      if (res.ok) {
        const json = (await res.json()) as { results?: VoteResult[] }
        if (Array.isArray(json.results)) {
          setVoteCounts(json.results)
        }
      }
    } catch {
      // Silently fail - results might not be available yet
    }
  }

  async function handleVote(optionIndex: number) {
    if (!isLoggedIn) return
    setError(null)
    setLoading(true)

    try {
      // If already voted for this option, toggle off (delete vote)
      if (voted && selectedOptionIndex === optionIndex) {
        const res = await fetch(`/api/polls/${pollId}/vote`, { method: 'DELETE' })
        let json: { voted: boolean; totalVotes: number } | { error: string } | null = null
        try {
          json = (await res.json()) as typeof json
        } catch {
          json = null
        }

        if (!res.ok || !json || 'error' in json) {
          setError((json && 'error' in json && json.error) || 'Unable to remove vote')
          return
        }

        setVoted(false)
        setSelectedOptionIndex(null)
        setTotalVotes(json.totalVotes)
        setShowResults(false)
        setVoteCounts([])
      } else {
        // Create or update vote
        const res = await fetch(`/api/polls/${pollId}/vote`, {
          method: 'POST',
          headers: { 'content-type': 'application/json' },
          body: JSON.stringify({ optionIndex }),
        })
        let json:
          | { voted: boolean; optionIndex?: number; totalVotes: number }
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

        setVoted(json.voted)
        setSelectedOptionIndex(json.optionIndex ?? optionIndex)
        setTotalVotes(json.totalVotes)
        setShowResults(true)
        // Reload results to get updated counts
        await loadResults()
      }
    } finally {
      setLoading(false)
    }
  }

  function getVoteCount(optionIndex: number): number {
    const result = voteCounts.find((r) => r.optionIndex === optionIndex)
    return result?.count || 0
  }

  function getPercentage(optionIndex: number): number {
    if (totalVotes === 0) return 0
    const count = getVoteCount(optionIndex)
    return Math.round((count / totalVotes) * 100)
  }

  return (
    <div className="rm-pollVoting">
      <div className="rm-pollOptions">
        {options.map((option, index) => {
          const isSelected = selectedOptionIndex === index
          const count = showResults ? getVoteCount(index) : null
          const percentage = showResults ? getPercentage(index) : null

          return (
            <button
              key={index}
              type="button"
              className={`rm-pollOption ${isSelected ? 'is-selected' : ''} ${loading ? 'is-loading' : ''}`}
              onClick={() => void handleVote(index)}
              disabled={!isLoggedIn || loading || hasEnded}
              title={
                hasEnded
                  ? 'Poll has ended'
                  : !isLoggedIn
                    ? 'Login to vote'
                    : isSelected
                      ? 'Click to remove vote'
                      : 'Click to vote'
              }
            >
              <div className="rm-pollOptionContent">
                <div className="rm-pollOptionText">{option.text}</div>
                {showResults && count !== null && (
                  <div className="rm-pollOptionStats">
                    <span className="rm-pollOptionCount">{count} votes</span>
                    <span className="rm-pollOptionPercentage">{percentage}%</span>
                  </div>
                )}
              </div>
              {showResults && (
                <div className="rm-pollOptionBar">
                  <div
                    className="rm-pollOptionBarFill"
                    style={{ width: `${percentage || 0}%` }}
                  />
                </div>
              )}
            </button>
          )
        })}
      </div>

      {error ? <p className="rm-error">{error}</p> : null}

      {!isLoggedIn && !hasEnded ? (
        <p className="rm-muted">Login to vote on this poll.</p>
      ) : null}

      <div className="rm-pollTotal">
        <span className="rm-countPill">{totalVotes} total votes</span>
      </div>
    </div>
  )
}

