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
    defaultColumns: ['poll', 'user', 'optionIndices', 'createdAt'],
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
      name: 'optionIndices',
      type: 'json',
      required: true,
      admin: {
        description:
          'For select polls: array of selected option indices [0] or [0, 2]. For ranking polls: array of option indices in rank order (top to bottom) [3, 1, 0, 2].',
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

          const pollType = (poll as any)?.pollType || 'select'
          const options = (poll as any)?.options || []
          const optionIndices =
            (data as any)?.optionIndices ?? (req as any)?.body?.optionIndices ?? (req as any)?.data?.optionIndices

          // Validate optionIndices based on poll type
          if (!Array.isArray(optionIndices) || optionIndices.length === 0) {
            throw new Error('optionIndices must be a non-empty array')
          }

          if (pollType === 'select') {
            const maxSelections = (poll as any)?.maxSelections ?? 1
            if (optionIndices.length > maxSelections) {
              throw new Error(`Cannot select more than ${maxSelections} option(s)`)
            }
            if (optionIndices.length < 1) {
              throw new Error('Must select at least 1 option')
            }
            // Check for duplicates
            const uniqueIndices = new Set(optionIndices)
            if (uniqueIndices.size !== optionIndices.length) {
              throw new Error('Cannot select the same option multiple times')
            }
          } else if (pollType === 'ranking') {
            // For ranking, must rank all options exactly once
            if (optionIndices.length !== options.length) {
              throw new Error(`Must rank all ${options.length} options`)
            }
            // Check for duplicates
            const uniqueIndices = new Set(optionIndices)
            if (uniqueIndices.size !== optionIndices.length) {
              throw new Error('Cannot rank the same option multiple times')
            }
          }

          // Validate all indices are within range
          for (const index of optionIndices) {
            if (typeof index !== 'number' || index < 0 || index >= options.length) {
              throw new Error(`Invalid option index: ${index}`)
            }
          }

          // Note: We no longer check for existing votes here - the API will handle updates
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
