import type { CollectionConfig } from 'payload'

export const Users: CollectionConfig = {
  slug: 'users',
  admin: {
    useAsTitle: 'email',
  },
  auth: true,
  fields: [
    // Email added by default
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
