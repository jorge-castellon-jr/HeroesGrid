import type { CollectionConfig } from 'payload'

import { isEditorOrAdmin } from '../access/roles'

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

export const Polls: CollectionConfig = {
  slug: 'polls',
  admin: {
    useAsTitle: 'title',
    defaultColumns: ['title', 'totalVotes', 'isActive', 'endDate', 'updatedAt'],
  },
  access: {
    read: () => true,
    create: ({ req }) => isEditorOrAdmin(req.user as any),
    update: ({ req }) => isEditorOrAdmin(req.user as any),
    delete: ({ req }) => isEditorOrAdmin(req.user as any),
  },
  fields: [
    {
      name: 'title',
      type: 'text',
      required: true,
    },
    {
      name: 'details',
      type: 'richText',
    },
    {
      name: 'options',
      type: 'array',
      required: true,
      minRows: 2,
      fields: [
        {
          name: 'text',
          type: 'text',
          required: true,
        },
      ],
    },
    {
      name: 'pollType',
      type: 'select',
      required: true,
      defaultValue: 'select',
      options: [
        { label: 'Select', value: 'select' },
        { label: 'Ranking', value: 'ranking' },
      ],
      admin: {
        position: 'sidebar',
        description: 'Select: choose one or more options. Ranking: rank all options from best to worst.',
      },
    },
    {
      name: 'maxSelections',
      type: 'number',
      required: true,
      defaultValue: 1,
      admin: {
        position: 'sidebar',
        description: 'Maximum number of selections allowed (only used for select type). 1 = single choice, >1 = multiple choice.',
      },
      validate: async (value: unknown, { data }: { data: any }) => {
        const pollType = (data as any)?.pollType
        if (pollType === 'select' && (typeof value !== 'number' || value < 1)) {
          return 'maxSelections must be at least 1 for select polls'
        }
        return true
      },
    },
    {
      name: 'endDate',
      type: 'date',
      admin: {
        date: {
          pickerAppearance: 'dayAndTime',
        },
        description: 'Optional end date/time (UTC). If not set, poll never expires.',
      },
    },
    {
      name: 'isActive',
      type: 'checkbox',
      defaultValue: true,
      admin: {
        readOnly: true,
        position: 'sidebar',
        description: 'Computed: true if poll has no end date or end date is in the future.',
      },
    },
    {
      name: 'totalVotes',
      type: 'number',
      defaultValue: 0,
      admin: {
        readOnly: true,
        position: 'sidebar',
      },
    },
  ],
  hooks: {
    beforeChange: [
      async ({ data, operation }) => {
        if (operation === 'create' || operation === 'update') {
          const options = (data as any)?.options
          if (!Array.isArray(options) || options.length < 2) {
            throw new Error('Poll must have at least 2 options')
          }

          // Validate pollType
          const pollType = (data as any)?.pollType || 'select'
          if (pollType !== 'select' && pollType !== 'ranking') {
            throw new Error('pollType must be either "select" or "ranking"')
          }

          // Validate maxSelections for select type
          if (pollType === 'select') {
            const maxSelections = (data as any)?.maxSelections ?? 1
            if (typeof maxSelections !== 'number' || maxSelections < 1) {
              throw new Error('maxSelections must be at least 1 for select polls')
            }
            if (maxSelections > options.length) {
              throw new Error('maxSelections cannot exceed the number of options')
            }
          }

          // Compute isActive based on endDate
          const endDate = (data as any)?.endDate
          if (!endDate) {
            ;(data as any).isActive = true
          } else {
            const end = new Date(endDate)
            const now = new Date()
            ;(data as any).isActive = end > now
          }
        }
        return data
      },
    ],
    afterRead: [
      async ({ doc }) => {
        // Compute isActive when reading
        const endDate = (doc as any)?.endDate
        if (!endDate) {
          ;(doc as any).isActive = true
        } else {
          const end = new Date(endDate)
          const now = new Date()
          ;(doc as any).isActive = end > now
        }
        return doc
      },
    ],
    afterChange: [
      async ({ doc, req }) => {
        const pollId = getRelId(doc?.id as unknown as RelationshipValue)
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
        // Note: Poll votes will be cascade deleted if configured, but we don't need to update totalVotes here
        // since the poll is being deleted anyway
      },
    ],
  },
}

