import type { CollectionConfig } from 'payload'

import { isEditorOrAdmin } from '../access/roles'

export const RoadmapItems: CollectionConfig = {
  slug: 'roadmap-items',
  admin: {
    useAsTitle: 'title',
    defaultColumns: ['title', 'status', 'priority', 'upvoteCount', 'commentCount', 'updatedAt'],
  },
  access: {
    read: () => true,
    // Only admin/editor can manage roadmap items.
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
      name: 'summary',
      type: 'textarea',
    },
    {
      name: 'details',
      type: 'richText',
    },
    {
      name: 'status',
      type: 'select',
      required: true,
      defaultValue: 'planned',
      options: [
        { label: 'Planned', value: 'planned' },
        { label: 'In progress', value: 'in_progress' },
        { label: 'Done', value: 'done' },
      ],
      admin: {
        position: 'sidebar',
      },
    },
    {
      name: 'priority',
      type: 'number',
      defaultValue: 0,
      admin: {
        position: 'sidebar',
      },
    },
    {
      name: 'upvoteCount',
      type: 'number',
      defaultValue: 0,
      admin: {
        position: 'sidebar',
        readOnly: true,
      },
    },
    {
      name: 'commentCount',
      type: 'number',
      defaultValue: 0,
      admin: {
        position: 'sidebar',
        readOnly: true,
      },
    },
  ],
}

