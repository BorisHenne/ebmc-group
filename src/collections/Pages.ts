import type { CollectionConfig } from 'payload'
import { isEditorOrAbove, isPublishedOrAdmin } from '../access/roles'
import { slugField } from '../fields/slug'
import { HeroBlock } from '../blocks/Hero'
import { ContentBlock } from '../blocks/Content'
import { ServicesBlock } from '../blocks/Services'
import { CTABlock } from '../blocks/CTA'
import { FeaturesBlock } from '../blocks/Features'
import { TestimonialsBlock } from '../blocks/Testimonials'
import { StatsBlock } from '../blocks/Stats'
import { TeamBlock } from '../blocks/Team'
import { FAQBlock } from '../blocks/FAQ'
import { ContactFormBlock } from '../blocks/ContactForm'
import { OffersListBlock } from '../blocks/OffersList'

export const Pages: CollectionConfig = {
  slug: 'pages',
  labels: {
    singular: 'Page',
    plural: 'Pages',
  },
  admin: {
    useAsTitle: 'title',
    defaultColumns: ['title', 'slug', '_status', 'updatedAt'],
    group: 'Contenu',
    livePreview: {
      url: ({ data }) => {
        const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'
        return `${baseUrl}/${data.slug === 'home' ? '' : data.slug}`
      },
    },
  },
  versions: {
    drafts: {
      autosave: {
        interval: 30000, // 30 seconds
      },
    },
    maxPerDoc: 25,
  },
  access: {
    read: isPublishedOrAdmin,
    create: isEditorOrAbove,
    update: isEditorOrAbove,
    delete: isEditorOrAbove,
  },
  fields: [
    {
      name: 'title',
      label: 'Titre',
      type: 'text',
      required: true,
      localized: true,
    },
    slugField('title'),
    {
      name: 'layout',
      label: 'Mise en page',
      type: 'blocks',
      localized: true,
      blocks: [
        HeroBlock,
        ContentBlock,
        ServicesBlock,
        CTABlock,
        FeaturesBlock,
        TestimonialsBlock,
        StatsBlock,
        TeamBlock,
        FAQBlock,
        ContactFormBlock,
        OffersListBlock,
      ],
    },
    {
      name: 'meta',
      label: 'SEO',
      type: 'group',
      fields: [
        {
          name: 'title',
          label: 'Meta Title',
          type: 'text',
          localized: true,
        },
        {
          name: 'description',
          label: 'Meta Description',
          type: 'textarea',
          localized: true,
        },
        {
          name: 'image',
          label: 'OG Image',
          type: 'upload',
          relationTo: 'media',
        },
      ],
    },
  ],
  hooks: {
    beforeChange: [
      ({ data }) => {
        // Auto-generate slug from title if not set
        if (data.title && !data.slug) {
          data.slug = data.title
            .toLowerCase()
            .normalize('NFD')
            .replace(/[\u0300-\u036f]/g, '')
            .replace(/[^a-z0-9]+/g, '-')
            .replace(/(^-|-$)/g, '')
        }
        return data
      },
    ],
  },
}
