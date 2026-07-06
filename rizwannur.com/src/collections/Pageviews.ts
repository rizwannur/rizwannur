import type { CollectionConfig } from 'payload'

export const Pageviews: CollectionConfig = {
  slug: 'pageviews',
  admin: {
    useAsTitle: 'path',
    defaultColumns: ['path', 'country', 'device', 'createdAt'],
    hidden: true,
    description: 'Self-hosted pageview log. Surfaced via the analytics view.',
  },
  access: {
    read: ({ req }) => Boolean(req.user),
    create: () => true,
    update: ({ req }) => Boolean(req.user),
    delete: ({ req }) => Boolean(req.user),
  },
  fields: [
    { name: 'path', type: 'text', required: true, index: true },
    { name: 'country', type: 'text', index: true },
    { name: 'city', type: 'text' },
    { name: 'region', type: 'text' },
    {
      name: 'device',
      type: 'select',
      required: true,
      index: true,
      options: [
        { label: 'Desktop', value: 'desktop' },
        { label: 'Mobile', value: 'mobile' },
        { label: 'Tablet', value: 'tablet' },
        { label: 'Bot', value: 'bot' },
      ],
    },
    { name: 'browser', type: 'text' },
    { name: 'os', type: 'text' },
    { name: 'referrer', type: 'text' },
    { name: 'ipHash', type: 'text', required: true, index: true },
    { name: 'userAgent', type: 'text' },
  ],
  timestamps: true,
}
