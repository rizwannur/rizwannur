import type { CollectionConfig } from 'payload'
import { revalidateSection } from '@/lib/revalidate'
import {
  BoldFeature,
  BlocksFeature,
  CodeBlock,
  FixedToolbarFeature,
  HeadingFeature,
  InlineToolbarFeature,
  ItalicFeature,
  LinkFeature,
  OrderedListFeature,
  UnderlineFeature,
  UnorderedListFeature,
  UploadFeature,
  lexicalEditor,
} from '@payloadcms/richtext-lexical'

export const Posts: CollectionConfig = {
  slug: 'posts',
  admin: {
    useAsTitle: 'title',
    defaultColumns: ['title', 'date', 'readTime', '_status'],
    livePreview: {
      url: ({ data }) => {
        const slug = (data as { slug?: string }).slug ?? ''
        const path = `/thoughts/${slug}`
        const qs = new URLSearchParams({ collection: 'posts', slug, path })
        return `/api/preview?${qs.toString()}`
      },
      breakpoints: [
        { label: 'Mobile', name: 'mobile', width: 375, height: 667 },
        { label: 'Tablet', name: 'tablet', width: 768, height: 1024 },
        { label: 'Desktop', name: 'desktop', width: 1440, height: 900 },
      ],
    },
  },
  versions: {
    drafts: {
      autosave: { interval: 800 },
    },
  },
  hooks: {
    afterChange: [() => { revalidateSection('thoughts') }],
    afterDelete: [() => { revalidateSection('thoughts') }],
  },
  access: {
    // Authed users see everything; public sees only explicitly-published items.
    // Don't allow `_status: exists: false` — Payload's response synthesizes
    // `_status` from the latest version, but the access filter runs against the
    // stored field, and legacy rows missing it would leak unfinished drafts.
    read: ({ req }) => {
      if (req.user) return true
      return { _status: { equals: 'published' } }
    },
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
      type: 'date',
      required: true,
      admin: {
        position: 'sidebar',
        date: {
          pickerAppearance: 'dayOnly',
          displayFormat: 'MMM d, yyyy',
        },
      },
    },
    {
      name: 'readTime',
      type: 'text',
      required: true,
      admin: {
        position: 'sidebar',
        description: 'e.g. "6 min read"',
      },
    },
    {
      name: 'excerpt',
      type: 'textarea',
      required: true,
      admin: {
        description: 'Shown on the index page and homepage preview',
      },
    },
    {
      name: 'coverImage',
      type: 'upload',
      relationTo: 'media',
      admin: {
        description: 'Optional cover image shown at the top of the post and used as default OG image',
      },
    },
    {
      name: 'tags',
      type: 'text',
      hasMany: true,
      admin: {
        description: 'Topic tags e.g. nextjs, performance',
      },
    },
    {
      name: 'body',
      type: 'richText',
      required: true,
      editor: lexicalEditor({
        features: ({ rootFeatures }) => [
          ...rootFeatures,
          HeadingFeature({ enabledHeadingSizes: ['h2', 'h3', 'h4'] }),
          BoldFeature(),
          ItalicFeature(),
          UnderlineFeature(),
          OrderedListFeature(),
          UnorderedListFeature(),
          LinkFeature(),
          UploadFeature({
            collections: {
              media: {
                fields: [
                  {
                    name: 'caption',
                    type: 'text',
                  },
                ],
              },
            },
          }),
          BlocksFeature({
            blocks: [
              CodeBlock({
                defaultLanguage: 'ts',
                languages: {
                  plaintext: 'Plain Text',
                  js: 'JavaScript',
                  ts: 'TypeScript',
                  tsx: 'TSX',
                  jsx: 'JSX',
                  css: 'CSS',
                  html: 'HTML',
                  json: 'JSON',
                  bash: 'Bash',
                  sh: 'Shell',
                  md: 'Markdown',
                  sql: 'SQL',
                  py: 'Python',
                  go: 'Go',
                  rust: 'Rust',
                  yaml: 'YAML',
                },
              }),
            ],
          }),
          FixedToolbarFeature(),
          InlineToolbarFeature(),
        ],
      }),
    },
  ],
}
