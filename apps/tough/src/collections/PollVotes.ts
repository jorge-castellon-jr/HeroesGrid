import { isAdmin } from '@/access/roles'
import type { CollectionConfig } from 'payload'

type RelationshipValue =
  | number
  | string
  | {
      relationTo: string
      value: number | string
    }

function getRelId(value: RelationshipValue | undefined): number | string | undefined {
  if (!value) return undefined
  if (typeof value === 'number') return value
  if (typeof value === 'string') return value
  return value.value
}

export const PollVotes: CollectionConfig = {
  slug: 'poll-votes',
  admin: {
    useAsTitle: 'id',
    defaultColumns: ['poll', 'user', 'optionIndex', 'createdAt'],
    hidden: ({ user }) => !isAdmin(user as any),
  },
  access: {
    read: ({ req, id }) => {
      // Only allow users to read their own votes (for toggle functionality)
      if (!req.user) return false
      return { user: { equals: req.user.id }, id: { equals: id } }
    },
    create: ({ req }) => Boolean(req.user),
    update: () => false,
    delete: ({ req, id }) => {
      if (!req.user) return false
      return { user: { equals: req.user.id }, id: { equals: id } }
    },
  },
  fields: [
    {
      name: 'poll',
      type: 'relationship',
      relationTo: 'polls',
      required: true,
      index: true,
    },
    {
      name: 'user',
      type: 'relationship',
      relationTo: 'users',
      required: true,
      index: true,
      admin: { readOnly: true },
    },
    {
      name: 'optionIndex',
      type: 'number',
      required: true,
      admin: {
        description: 'Index of the selected option (0-based)',
      },
    },
  ],
  hooks: {
    beforeChange: [
      async ({ data, req, operation }) => {
        if (operation === 'create') {
          if (!req.user) throw new Error('Login required')

          const pollId = getRelId(
            (data as any)?.poll ?? (req as any)?.body?.poll ?? (req as any)?.data?.poll,
          )
          if (!pollId) throw new Error('Missing poll')

          // Fetch the poll to validate it's active and check options
          const poll = await req.payload.findByID({
            collection: 'polls',
            id: pollId,
            depth: 0,
            overrideAccess: true,
          })

          // Check if poll is active
          const endDate = (poll as any)?.endDate
          if (endDate) {
            const end = new Date(endDate)
            const now = new Date()
            if (end <= now) {
              throw new Error('Poll has ended')
            }
          }

          // Validate optionIndex
          const optionIndex = (data as any)?.optionIndex ?? (req as any)?.body?.optionIndex
          if (typeof optionIndex !== 'number' || optionIndex < 0) {
            throw new Error('Invalid optionIndex')
          }

          const options = (poll as any)?.options || []
          if (optionIndex >= options.length) {
            console.log('optionIndex out of range')
            console.log('poll', poll)
            console.log('options', options)
            throw new Error('optionIndex out of range')
          }

          // Check if user already voted for this poll
          const existing = await req.payload.find({
            collection: 'poll-votes',
            limit: 1,
            overrideAccess: true,
            where: {
              and: [{ poll: { equals: pollId } }, { user: { equals: req.user.id } }],
            },
          })

          if (existing.totalDocs > 0) {
            // If voting for the same option, we'll delete the vote (toggle off)
            // This is handled in the API route, but we can allow the create here
            // and the API will handle the toggle logic
            const existingVote = existing.docs[0] as any
            if (existingVote.optionIndex === optionIndex) {
              // Same option - this will be toggled off in the API
              throw new Error('Already voted for this option (use toggle)')
            }
            // Different option - delete old vote first (handled in API)
            throw new Error('Already voted (use toggle to change)')
          }

          return { ...data, user: req.user.id }
        }

        return data
      },
    ],
    afterChange: [
      async ({ doc, req }) => {
        const pollId = getRelId(doc?.poll as unknown as RelationshipValue)
        if (!pollId) return

        const votes = await req.payload.find({
          collection: 'poll-votes',
          limit: 0,
          overrideAccess: true,
          where: { poll: { equals: pollId } },
        })

        await req.payload.update({
          collection: 'polls',
          id: pollId,
          overrideAccess: true,
          data: { totalVotes: votes.totalDocs },
        })
      },
    ],
    afterDelete: [
      async ({ doc, req }) => {
        const pollId = getRelId(doc?.poll as unknown as RelationshipValue)
        if (!pollId) return

        const votes = await req.payload.find({
          collection: 'poll-votes',
          limit: 0,
          overrideAccess: true,
          where: { poll: { equals: pollId } },
        })

        await req.payload.update({
          collection: 'polls',
          id: pollId,
          overrideAccess: true,
          data: { totalVotes: votes.totalDocs },
        })
      },
    ],
  },
}
