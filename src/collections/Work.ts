import type { CollectionConfig } from 'payload'
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

export const Work: CollectionConfig = {
  slug: 'work',
  admin: {
    useAsTitle: 'title',
    defaultColumns: ['title', 'subtitle', 'date', 'order'],
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
      name: 'subtitle',
      type: 'text',
      required: true,
      admin: {
        description: 'e.g. "Marketing Website"',
      },
    },
    {
      name: 'cover',
      type: 'upload',
      relationTo: 'media',
      admin: {
        description: 'Leave empty to auto-generate from the live site URL',
      },
    },
    {
      name: 'date',
      type: 'text',
      required: true,
      admin: {
        position: 'sidebar',
        description: 'Display date, e.g. "Mar 2026"',
      },
    },
    {
      name: 'href',
      type: 'text',
      admin: {
        position: 'sidebar',
        description: 'Optional live site URL',
      },
    },
    {
      name: 'description',
      type: 'textarea',
      required: true,
      admin: {
        description: 'One-line summary shown on project cards',
      },
    },
    {
      name: 'tech',
      type: 'text',
      hasMany: true,
      admin: {
        description: 'Tech stack entries e.g. Next.js, Tailwind',
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
                fields: [{ name: 'caption', type: 'text' }],
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
      admin: {
        description: 'Full project writeup',
      },
    },
    {
      name: 'images',
      type: 'array',
      admin: {
        description: 'Optional gallery images shown below the body',
      },
      fields: [
        {
          name: 'image',
          type: 'upload',
          relationTo: 'media',
          required: true,
        },
        {
          name: 'caption',
          type: 'text',
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
