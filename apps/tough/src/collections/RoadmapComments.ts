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

export const RoadmapComments: CollectionConfig = {
  slug: 'roadmap-comments',
  admin: {
    useAsTitle: 'id',
    defaultColumns: ['item', 'user', 'createdAt', 'updatedAt'],
  },
  access: {
    read: () => true,
    create: ({ req }) => Boolean(req.user),
    update: ({ req, id }) => {
      if (!req.user) return false
      // Only allow updates in code (we'll mostly not expose this), but keep safe:
      return { user: { equals: req.user.id }, id: { equals: id } }
    },
    delete: ({ req, id }) => {
      if (!req.user) return false
      return { user: { equals: req.user.id }, id: { equals: id } }
    },
  },
  fields: [
    {
      name: 'item',
      type: 'relationship',
      relationTo: 'roadmap-items',
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
      name: 'body',
      type: 'textarea',
      required: true,
    },
  ],
  hooks: {
    beforeChange: [
      async ({ data, req, operation }) => {
        if (operation === 'create') {
          if (!req.user) throw new Error('Login required')
          const itemId = getRelId(
            (data as any)?.item ?? (req as any)?.body?.item ?? (req as any)?.data?.item,
          )
          if (!itemId) throw new Error('Missing item')
          return { ...data, user: req.user.id }
        }
        return data
      },
    ],
    afterChange: [
      async ({ doc, req }) => {
        const itemId = getRelId(doc?.item as unknown as RelationshipValue)
        if (!itemId) return

        const comments = await req.payload.find({
          collection: 'roadmap-comments',
          limit: 0,
          overrideAccess: true,
          where: { item: { equals: itemId } },
        })

        await req.payload.update({
          collection: 'roadmap-items',
          id: itemId,
          overrideAccess: true,
          data: { commentCount: comments.totalDocs },
        })
      },
    ],
    afterDelete: [
      async ({ doc, req }) => {
        const itemId = getRelId(doc?.item as unknown as RelationshipValue)
        if (!itemId) return

        const comments = await req.payload.find({
          collection: 'roadmap-comments',
          limit: 0,
          overrideAccess: true,
          where: { item: { equals: itemId } },
        })

        await req.payload.update({
          collection: 'roadmap-items',
          id: itemId,
          overrideAccess: true,
          data: { commentCount: comments.totalDocs },
        })
      },
    ],
  },
}

