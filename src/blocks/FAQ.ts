import type { Block } from 'payload'

export const FAQBlock: Block = {
  slug: 'faq',
  labels: { singular: 'FAQ', plural: 'FAQ' },
  fields: [
    {
      name: 'title',
      type: 'text',
      label: 'Titre',
    },
    {
      name: 'items',
      type: 'array',
      label: 'Questions',
      fields: [
        { name: 'question', type: 'text', label: 'Question', required: true },
        { name: 'answer', type: 'richText', label: 'Réponse', required: true },
      ],
    },
  ],
}