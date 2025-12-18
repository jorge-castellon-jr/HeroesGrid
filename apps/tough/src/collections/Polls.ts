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

