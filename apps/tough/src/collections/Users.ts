import type { CollectionConfig } from 'payload'

import { isAdmin } from '../access/roles'

export const Users: CollectionConfig = {
  slug: 'users',
  admin: {
    useAsTitle: 'email',
    defaultColumns: ['email', 'accountType', 'updatedAt'],
    hidden: ({ user }) => !isAdmin(user as any),
  },
  auth: true,
  access: {
    // Only admins can manage users (editors can use admin but not access Users).
    read: ({ req }) => isAdmin(req.user as any),
    create: ({ req }) => isAdmin(req.user as any),
    update: ({ req }) => isAdmin(req.user as any),
    delete: ({ req }) => isAdmin(req.user as any),
  },
  fields: [
    // Email added by default
    {
      name: 'accountType',
      type: 'select',
      required: true,
      defaultValue: 'user',
      options: [
        { label: 'Admin', value: 'admin' },
        { label: 'Editor', value: 'editor' },
        { label: 'User', value: 'user' },
      ],
      admin: {
        position: 'sidebar',
      },
    },
    {
      name: 'discordId',
      type: 'text',
      unique: true,
      index: true,
    },
    {
      name: 'discordUsername',
      type: 'text',
    },
    {
      name: 'discordAvatar',
      type: 'text',
    },
  ],
}
