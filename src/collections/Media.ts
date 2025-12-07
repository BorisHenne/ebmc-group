import type { CollectionConfig } from 'payload'
import { isEditorOrAbove, isPublic } from '../access/roles'

export const Media: CollectionConfig = {
  slug: 'media',
  labels: {
    singular: 'Média',
    plural: 'Médias',
  },
  admin: {
    useAsTitle: 'filename',
    defaultColumns: ['filename', 'alt', 'mimeType', 'createdAt'],
    group: 'Contenu',
  },
  access: {
    read: isPublic,
    create: isEditorOrAbove,
    update: isEditorOrAbove,
    delete: isEditorOrAbove,
  },
  upload: {
    staticDir: 'media',
    imageSizes: [
      {
        name: 'thumbnail',
        width: 300,
        height: 300,
        position: 'centre',
      },
      {
        name: 'card',
        width: 600,
        height: 400,
        position: 'centre',
      },
      {
        name: 'hero',
        width: 1920,
        height: 1080,
        position: 'centre',
      },
    ],
    adminThumbnail: 'thumbnail',
    mimeTypes: [
      'image/png',
      'image/jpeg',
      'image/gif',
      'image/webp',
      'image/svg+xml',
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    ],
  },
  fields: [
    {
      name: 'alt',
      label: 'Texte alternatif',
      type: 'text',
      required: true,
      localized: true,
    },
    {
      name: 'caption',
      label: 'Légende',
      type: 'text',
      localized: true,
    },
    {
      name: 'category',
      label: 'Catégorie',
      type: 'select',
      options: [
        { label: 'Image', value: 'image' },
        { label: 'Document', value: 'document' },
        { label: 'CV', value: 'cv' },
        { label: 'Logo', value: 'logo' },
        { label: 'Icône', value: 'icon' },
      ],
    },
  ],
}
