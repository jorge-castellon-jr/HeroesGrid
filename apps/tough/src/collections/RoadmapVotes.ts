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

export const RoadmapVotes: CollectionConfig = {
  slug: 'roadmap-votes',
  admin: {
    useAsTitle: 'id',
    defaultColumns: ['item', 'user', 'createdAt'],
  },
  access: {
    read: ({ req }) => Boolean(req.user),
    create: ({ req }) => Boolean(req.user),
    update: () => false,
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
  ],
  hooks: {
    beforeChange: [
      async ({ data, req, operation }) => {
        if (operation === 'create') {
          if (!req.user) throw new Error('Login required')

          // Force vote ownership to the authenticated user.
          const itemId = getRelId(
            (data as any)?.item ?? (req as any)?.body?.item ?? (req as any)?.data?.item,
          )
          if (!itemId) throw new Error('Missing item')

          const existing = await req.payload.find({
            collection: 'roadmap-votes',
            limit: 1,
            overrideAccess: true,
            where: {
              and: [{ item: { equals: itemId } }, { user: { equals: req.user.id } }],
            },
          })
          if (existing.totalDocs > 0) {
            throw new Error('Already voted')
          }

          return { ...data, user: req.user.id }
        }

        return data
      },
    ],
    afterChange: [
      async ({ doc, req }) => {
        const itemId = getRelId(doc?.item as unknown as RelationshipValue)
        if (!itemId) return

        const votes = await req.payload.find({
          collection: 'roadmap-votes',
          limit: 0,
          overrideAccess: true,
          where: { item: { equals: itemId } },
        })

        await req.payload.update({
          collection: 'roadmap-items',
          id: itemId,
          overrideAccess: true,
          data: { upvoteCount: votes.totalDocs },
        })
      },
    ],
    afterDelete: [
      async ({ doc, req }) => {
        const itemId = getRelId(doc?.item as unknown as RelationshipValue)
        if (!itemId) return

        const votes = await req.payload.find({
          collection: 'roadmap-votes',
          limit: 0,
          overrideAccess: true,
          where: { item: { equals: itemId } },
        })

        await req.payload.update({
          collection: 'roadmap-items',
          id: itemId,
          overrideAccess: true,
          data: { upvoteCount: votes.totalDocs },
        })
      },
    ],
  },
}
