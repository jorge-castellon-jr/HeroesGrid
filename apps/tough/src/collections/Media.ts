import type { CollectionConfig } from 'payload'

import { isAdmin, isEditorOrAdmin } from '../access/roles'

export const Media: CollectionConfig = {
  slug: 'media',
  admin: {
    hidden: ({ user }) => !isAdmin(user as any),
  },
  access: {
    read: () => true,
    create: ({ req }) => isEditorOrAdmin(req.user as any),
    update: ({ req }) => isEditorOrAdmin(req.user as any),
    delete: ({ req }) => isEditorOrAdmin(req.user as any),
  },
  fields: [
    {
      name: 'alt',
      type: 'text',
      required: true,
    },
  ],
  upload: {
    // These are not supported on Workers yet due to lack of sharp
    crop: false,
    focalPoint: false,
  },
}
