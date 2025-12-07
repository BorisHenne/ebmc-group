import type { Block } from 'payload'
import { linkField } from '../fields/slug'

export const CTABlock: Block = {
  slug: 'cta',
  labels: {
    singular: 'Call to Action',
    plural: 'Calls to Action',
  },
  fields: [
    {
      name: 'style',
      label: 'Style',
      type: 'select',
      defaultValue: 'dark',
      options: [
        { label: 'Sombre', value: 'dark' },
        { label: 'Clair', value: 'light' },
        { label: 'Gradient', value: 'gradient' },
      ],
    },
    {
      name: 'title',
      label: 'Titre',
      type: 'text',
      required: true,
      localized: true,
    },
    {
      name: 'highlightedText',
      label: 'Texte mis en avant',
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
      name: 'primaryCta',
      label: 'Bouton principal',
      type: 'group',
      fields: [linkField({ name: 'link' })],
    },
    {
      name: 'secondaryCta',
      label: 'Bouton secondaire',
      type: 'group',
      fields: [linkField({ name: 'link' })],
    },
    {
      name: 'cards',
      label: 'Cartes (optionnel)',
      type: 'array',
      maxRows: 2,
      fields: [
        {
          name: 'icon',
          label: 'Icône',
          type: 'select',
          options: [
            { label: 'Message', value: 'message' },
            { label: 'Users', value: 'users' },
            { label: 'Briefcase', value: 'briefcase' },
            { label: 'Phone', value: 'phone' },
          ],
        },
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
        linkField({ name: 'link' }),
      ],
    },
    {
      name: 'testimonial',
      label: 'Témoignage',
      type: 'group',
      fields: [
        {
          name: 'quote',
          label: 'Citation',
          type: 'textarea',
          localized: true,
        },
        {
          name: 'author',
          label: 'Auteur',
          type: 'text',
        },
        {
          name: 'role',
          label: 'Poste',
          type: 'text',
          localized: true,
        },
      ],
    },
  ],
}
