'use client'

import React from 'react'
import { SelectPoll } from './select-poll'
import { RankingPoll } from './ranking-poll'

type VoteResult = {
  optionIndex: number
  count: number
}

type RankingResult = {
  optionIndex: number
  points: number
  voteCount: number
}

export function PollClient(props: {
  pollId: string
  pollType: 'select' | 'ranking'
  isLoggedIn: boolean
  initiallyVoted: boolean
  initialOptionIndices: number[] | null
  initialRankedIndices: number[] | null
  initialTotalVotes: number
  initialVoteCounts?: Array<{ optionIndex: number; count: number }>
  initialRankingResults?: Array<{ optionIndex: number; points: number; voteCount: number }>
  options: Array<{ text: string }>
  maxSelections: number
  hasEnded: boolean
}) {
  const { pollType } = props

  if (pollType === 'ranking') {
    return (
      <RankingPoll
        pollId={props.pollId}
        isLoggedIn={props.isLoggedIn}
        initiallyVoted={props.initiallyVoted}
        initialRankedIndices={props.initialRankedIndices}
        initialTotalVotes={props.initialTotalVotes}
        initialRankingResults={props.initialRankingResults}
        options={props.options}
        hasEnded={props.hasEnded}
      />
    )
  }

  // Default to select poll
  return (
    <SelectPoll
      pollId={props.pollId}
      isLoggedIn={props.isLoggedIn}
      initiallyVoted={props.initiallyVoted}
      initialOptionIndices={props.initialOptionIndices}
      initialTotalVotes={props.initialTotalVotes}
      initialVoteCounts={props.initialVoteCounts}
      options={props.options}
      maxSelections={props.maxSelections}
      hasEnded={props.hasEnded}
    />
  )
}

