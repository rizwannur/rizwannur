import { postgresAdapter } from '@payloadcms/db-postgres'
import { nodemailerAdapter } from '@payloadcms/email-nodemailer'
import { lexicalEditor } from '@payloadcms/richtext-lexical'
import { searchPlugin } from '@payloadcms/plugin-search'
import { seoPlugin } from '@payloadcms/plugin-seo'
import { vercelBlobStorage } from '@payloadcms/storage-vercel-blob'
import path from 'path'
import { buildConfig } from 'payload'
import { fileURLToPath } from 'url'
import sharp from 'sharp'

import { Users } from './collections/Users'
import { Media } from './collections/Media'
import { Work } from './collections/Work'
import { Posts } from './collections/Posts'
import { Craft } from './collections/Craft'
import { Profile } from './collections/Profile'
import { Pageviews } from './collections/Pageviews'

const filename = fileURLToPath(import.meta.url)
const dirname = path.dirname(filename)

export default buildConfig({
  admin: {
    user: Users.slug,
    importMap: {
      baseDir: path.resolve(dirname),
    },
  },
  collections: [Users, Media, Work, Posts, Craft, Pageviews],
  globals: [Profile],
  editor: lexicalEditor(),
  secret: process.env.PAYLOAD_SECRET || '',
  typescript: {
    outputFile: path.resolve(dirname, 'payload-types.ts'),
  },
  db: postgresAdapter({
    pool: {
      connectionString: process.env.DATABASE_URL || '',
    },
    migrationDir: path.resolve(dirname, 'lib/migrations'),
  }),
  email: nodemailerAdapter({
    defaultFromAddress: 'noreply@example.com',
    defaultFromName: 'Rafey',
    transportOptions: process.env.SMTP_HOST
      ? {
          host: process.env.SMTP_HOST,
          port: 587,
          auth: {
            user: process.env.SMTP_USER,
            pass: process.env.SMTP_PASS,
          },
        }
      : {
          streamTransport: true,
        },
  }),
  sharp,
  plugins: [
    seoPlugin({
      collections: ['work', 'posts'],
      uploadsCollection: 'media',
      generateTitle: ({ doc }) => `${doc?.title ?? ''} — Rafey`,
      generateDescription: ({ doc }) =>
        (doc as { excerpt?: string; description?: string })?.excerpt ??
        (doc as { description?: string })?.description ??
        '',
    }),
    searchPlugin({
      collections: ['work', 'posts'],
      defaultPriorities: {
        work: 10,
        posts: 20,
      },
    }),
    vercelBlobStorage({
      enabled: Boolean(
        process.env.BLOB_READ_WRITE_TOKEN &&
          process.env.BLOB_READ_WRITE_TOKEN !== 'your_token_here',
      ),
      collections: {
        media: true,
      },
      token: process.env.BLOB_READ_WRITE_TOKEN || '',
      addRandomSuffix: true,
    }),
  ],
})
