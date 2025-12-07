import type { Block } from 'payload'

export const TestimonialsBlock: Block = {
  slug: 'testimonials',
  labels: { singular: 'Témoignages', plural: 'Témoignages' },
  fields: [
    {
      name: 'title',
      type: 'text',
      label: 'Titre',
    },
    {
      name: 'testimonials',
      type: 'array',
      label: 'Témoignages',
      fields: [
        { name: 'quote', type: 'textarea', label: 'Citation' },
        { name: 'author', type: 'text', label: 'Auteur' },
        { name: 'role', type: 'text', label: 'Rôle' },
        { name: 'company', type: 'text', label: 'Entreprise' },
        { name: 'rating', type: 'number', label: 'Note', min: 1, max: 5 },
      ],
    },
  ],
}