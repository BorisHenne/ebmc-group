import { buildConfig } from 'payload'
import { mongooseAdapter } from '@payloadcms/db-mongodb'
import { lexicalEditor } from '@payloadcms/richtext-lexical'
import { nodemailerAdapter } from '@payloadcms/email-nodemailer'
import { seoPlugin } from '@payloadcms/plugin-seo'
import { s3Storage } from '@payloadcms/storage-s3'
import path from 'path'
import { fileURLToPath } from 'url'
import sharp from 'sharp'

// Collections
import { Users } from './collections/Users'
import { Media } from './collections/Media'
import { Pages } from './collections/Pages'
import { Candidates } from './collections/Candidates'
import { Offers } from './collections/Offers'
import { Applications } from './collections/Applications'
import { Messages } from './collections/Messages'
import { Settings } from './globals/Settings'
import { Navigation } from './globals/Navigation'

const filename = fileURLToPath(import.meta.url)
const dirname = path.dirname(filename)

export default buildConfig({
  // Admin Panel
  admin: {
    user: Users.slug,
    meta: {
      titleSuffix: '- EBMC GROUP',
    },
    components: {
      graphics: {
        Logo: '/components/admin/Logo',
        Icon: '/components/admin/Icon',
      },
    },
    livePreview: {
      breakpoints: [
        { label: 'Mobile', name: 'mobile', width: 375, height: 667 },
        { label: 'Tablet', name: 'tablet', width: 768, height: 1024 },
        { label: 'Desktop', name: 'desktop', width: 1440, height: 900 },
      ],
    },
  },

  // Collections
  collections: [
    Users,
    Media,
    Pages,
    Candidates,
    Offers,
    Applications,
    Messages,
  ],

  // Globals
  globals: [
    Settings,
    Navigation,
  ],

  // Editor
  editor: lexicalEditor(),

  // Database
  db: mongooseAdapter({
    url: process.env.MONGODB_URI || 'mongodb://localhost:27017/ebmc',
  }),

  // Email
  email: nodemailerAdapter({
    defaultFromAddress: process.env.SMTP_FROM || 'noreply@ebmc-group.com',
    defaultFromName: 'EBMC GROUP',
    transportOptions: {
      host: process.env.SMTP_HOST || 'mail.infomaniak.com',
      port: parseInt(process.env.SMTP_PORT || '465'),
      secure: process.env.SMTP_SECURE === 'true',
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASSWORD,
      },
    },
  }),

  // File Upload
  upload: {
    limits: {
      fileSize: 10000000, // 10MB
    },
  },

  // Plugins
  plugins: [
    seoPlugin({
      collections: ['pages', 'offers'],
      uploadsCollection: 'media',
      generateTitle: ({ doc }) => `${doc.title} | EBMC GROUP`,
      generateDescription: ({ doc }) => doc.excerpt || doc.description,
    }),
    // S3 Storage (optional - configure if needed)
    // s3Storage({
    //   collections: { media: true },
    //   bucket: process.env.S3_BUCKET!,
    //   config: {
    //     credentials: {
    //       accessKeyId: process.env.S3_ACCESS_KEY!,
    //       secretAccessKey: process.env.S3_SECRET_KEY!,
    //     },
    //     region: process.env.S3_REGION,
    //   },
    // }),
  ],

  // Sharp for image processing
  sharp,

  // Secret
  secret: process.env.PAYLOAD_SECRET || 'your-secret-key-change-in-production',

  // TypeScript
  typescript: {
    outputFile: path.resolve(dirname, 'payload-types.ts'),
  },

  // GraphQL
  graphQL: {
    schemaOutputFile: path.resolve(dirname, 'generated-schema.graphql'),
  },

  // Localization
  localization: {
    locales: [
      { label: 'Français', code: 'fr' },
      { label: 'English', code: 'en' },
    ],
    defaultLocale: 'fr',
    fallback: true,
  },

  // CORS
  cors: [
    process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',
  ],

  // Rate Limiting
  rateLimit: {
    max: 500,
    window: 60000,
  },
})
