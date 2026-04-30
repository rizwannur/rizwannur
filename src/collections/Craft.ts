import type { CollectionConfig } from 'payload'

export const Craft: CollectionConfig = {
  slug: 'craft',
  admin: {
    useAsTitle: 'title',
    defaultColumns: ['title', 'date', 'order'],
  },
  access: {
    read: () => true,
  },
  fields: [
    {
      name: 'title',
      type: 'text',
      required: true,
    },
    {
      name: 'slug',
      type: 'text',
      required: true,
      unique: true,
      admin: {
        position: 'sidebar',
        description: 'URL-safe identifier. Auto-filled from title on first save.',
      },
      hooks: {
        beforeValidate: [
          ({ value, data }) => {
            if (!value && data?.title) {
              return (data.title as string)
                .toLowerCase()
                .replace(/[^a-z0-9]+/g, '-')
                .replace(/(^-|-$)/g, '')
            }
            return value
          },
        ],
      },
    },
    {
      name: 'date',
      type: 'text',
      required: true,
      admin: {
        position: 'sidebar',
        description: 'Display date, e.g. "Apr 2026"',
      },
    },
    {
      name: 'description',
      type: 'textarea',
      required: true,
      admin: {
        description: 'One-line summary shown on craft cards',
      },
    },
    {
      name: 'tags',
      type: 'text',
      hasMany: true,
      admin: {
        description: 'Topic tags e.g. animation, button',
      },
    },
    {
      name: 'cover',
      type: 'upload',
      relationTo: 'media',
      admin: {
        description: 'Optional cover image for the craft item',
      },
    },
    {
      name: 'credit',
      type: 'group',
      admin: {
        description: 'Optional credit for the craft item',
      },
      fields: [
        {
          name: 'name',
          type: 'text',
        },
        {
          name: 'href',
          type: 'text',
          admin: {
            description: 'Optional link for the credit',
          },
        },
      ],
    },
    {
      name: 'order',
      type: 'number',
      required: true,
      defaultValue: 99,
      admin: {
        position: 'sidebar',
        description: 'Sort order — lower numbers appear first (1 = top)',
      },
    },
  ],
}
