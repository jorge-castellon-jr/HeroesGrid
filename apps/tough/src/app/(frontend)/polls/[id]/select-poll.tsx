'use client'

import React from 'react'

type VoteResult = {
  optionIndex: number
  count: number
}

export function SelectPoll(props: {
  pollId: string
  isLoggedIn: boolean
  initiallyVoted: boolean
  initialOptionIndices: number[] | null
  initialTotalVotes: number
  initialVoteCounts?: Array<{ optionIndex: number; count: number }>
  options: Array<{ text: string }>
  maxSelections: number
  hasEnded: boolean
}) {
  const {
    pollId,
    isLoggedIn,
    initiallyVoted,
    initialOptionIndices,
    initialTotalVotes,
    initialVoteCounts = [],
    options,
    maxSelections,
    hasEnded,
  } = props

  const [voted, setVoted] = React.useState(initiallyVoted)
  const [selectedIndices, setSelectedIndices] = React.useState<Set<number>>(
    new Set(initialOptionIndices || []),
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

  function handleToggleOption(index: number) {
    if (!isLoggedIn || hasEnded || voted) return

    setSelectedIndices((prev) => {
      const newSet = new Set(prev)
      if (maxSelections === 1) {
        // Radio button behavior: only one selection
        newSet.clear()
        newSet.add(index)
      } else {
        // Checkbox behavior: toggle selection
        if (newSet.has(index)) {
          newSet.delete(index)
        } else {
          if (newSet.size >= maxSelections) {
            // Can't select more
            return prev
          }
          newSet.add(index)
        }
      }
      return newSet
    })
  }

  async function handleSubmit() {
    if (!isLoggedIn || hasEnded || selectedIndices.size === 0) return
    setError(null)
    setLoading(true)

    try {
      const optionIndices = Array.from(selectedIndices)
      const res = await fetch(`/api/polls/${pollId}/vote`, {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ optionIndices }),
      })
      let json:
        | { voted: boolean; optionIndices?: number[]; totalVotes: number }
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
      // Reload results to get updated counts
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
        setVoteCounts([])
      }
      // Clear draft selections
      setSelectedIndices(new Set())
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

  const isAtLimit = selectedIndices.size >= maxSelections
  const canSubmit = selectedIndices.size > 0 && !voted && !hasEnded && isLoggedIn

  if (!options || options.length === 0) {
    return (
      <div className="rm-pollVoting">
        <p className="rm-error">No options available for this poll.</p>
      </div>
    )
  }

  return (
    <div className="rm-pollVoting">
      <div className="rm-pollOptions">
        {options.map((option, index) => {
          if (!option || !option.text) {
            return null
          }
          const isSelected = selectedIndices.has(index)
          const count = showResults ? getVoteCount(index) : null
          const percentage = showResults ? getPercentage(index) : null
          const isDisabled = hasEnded || voted || loading || (!isLoggedIn && !hasEnded)

          return (
            <button
              key={index}
              type="button"
              className={`rm-pollOption ${isSelected ? 'is-selected' : ''} ${loading ? 'is-loading' : ''}`}
              onClick={() => handleToggleOption(index)}
              disabled={isDisabled}
              title={
                hasEnded
                  ? 'Poll has ended'
                  : !isLoggedIn
                    ? 'Login to vote'
                    : voted
                      ? 'Already voted'
                      : isAtLimit && !isSelected
                        ? `Maximum ${maxSelections} selection(s) allowed`
                        : isSelected
                          ? 'Click to deselect'
                          : 'Click to select'
              }
            >
              <div className="rm-pollOptionContent">
                <div className="rm-pollOptionText">
                  {maxSelections === 1 ? (
                    <span style={{ marginRight: '8px' }}>{isSelected ? '●' : '○'}</span>
                  ) : (
                    <span style={{ marginRight: '8px' }}>{isSelected ? '☑' : '☐'}</span>
                  )}
                  {option.text}
                </div>
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

      {!hasEnded && !voted && (
        <div className="rm-pollActions" style={{ marginTop: '16px', display: 'flex', gap: '10px' }}>
          <button
            type="button"
            className="rm-button rm-buttonPrimary"
            onClick={handleSubmit}
            disabled={!canSubmit || loading}
          >
            {loading ? 'Submitting...' : 'Submit Vote'}
          </button>
          {selectedIndices.size > 0 && (
            <button
              type="button"
              className="rm-button"
              onClick={handleReset}
              disabled={loading}
            >
              {loading ? 'Resetting...' : 'Reset'}
            </button>
          )}
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

