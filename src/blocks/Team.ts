import type { Block } from 'payload'

export const TeamBlock: Block = {
  slug: 'team',
  labels: {
    singular: 'Équipe',
    plural: 'Équipes',
  },
  fields: [
    {
      name: 'title',
      label: 'Titre',
      type: 'text',
      localized: true,
    },
    {
      name: 'description',
      label: 'Description',
      type: 'textarea',
      localized: true,
    },
    {
      name: 'members',
      label: 'Membres',
      type: 'array',
      fields: [
        {
          name: 'name',
          label: 'Nom',
          type: 'text',
          required: true,
        },
        {
          name: 'role',
          label: 'Poste',
          type: 'text',
          localized: true,
        },
        {
          name: 'image',
          label: 'Photo',
          type: 'upload',
          relationTo: 'media',
        },
        {
          name: 'bio',
          label: 'Bio',
          type: 'textarea',
          localized: true,
        },
        {
          name: 'linkedin',
          label: 'LinkedIn',
          type: 'text',
        },
        {
          name: 'email',
          label: 'Email',
          type: 'email',
        },
      ],
    },
  ],
}

export const FAQBlock: Block = {
  slug: 'faq',
  labels: {
    singular: 'FAQ',
    plural: 'FAQs',
  },
  fields: [
    {
      name: 'title',
      label: 'Titre',
      type: 'text',
      localized: true,
    },
    {
      name: 'description',
      label: 'Description',
      type: 'textarea',
      localized: true,
    },
    {
      name: 'questions',
      label: 'Questions',
      type: 'array',
      fields: [
        {
          name: 'question',
          label: 'Question',
          type: 'text',
          required: true,
          localized: true,
        },
        {
          name: 'answer',
          label: 'Réponse',
          type: 'richText',
          required: true,
          localized: true,
        },
        {
          name: 'category',
          label: 'Catégorie',
          type: 'select',
          options: [
            { label: 'Général', value: 'general' },
            { label: 'Services', value: 'services' },
            { label: 'Tarifs', value: 'pricing' },
            { label: 'Technique', value: 'technical' },
            { label: 'Carrières', value: 'careers' },
          ],
        },
      ],
    },
  ],
}
