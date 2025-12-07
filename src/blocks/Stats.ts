import type { Block } from 'payload'

export const StatsBlock: Block = {
  slug: 'stats',
  labels: {
    singular: 'Statistiques',
    plural: 'Statistiques',
  },
  fields: [
    {
      name: 'style',
      label: 'Style',
      type: 'select',
      defaultValue: 'default',
      options: [
        { label: 'Par défaut', value: 'default' },
        { label: 'Avec fond', value: 'background' },
        { label: 'Cartes', value: 'cards' },
      ],
    },
    {
      name: 'stats',
      label: 'Statistiques',
      type: 'array',
      minRows: 1,
      maxRows: 6,
      fields: [
        {
          name: 'value',
          label: 'Valeur',
          type: 'text',
          required: true,
        },
        {
          name: 'label',
          label: 'Libellé',
          type: 'text',
          required: true,
          localized: true,
        },
        {
          name: 'description',
          label: 'Description',
          type: 'text',
          localized: true,
        },
        {
          name: 'icon',
          label: 'Icône',
          type: 'select',
          options: [
            { label: 'Users', value: 'users' },
            { label: 'Calendar', value: 'calendar' },
            { label: 'Building', value: 'building' },
            { label: 'Award', value: 'award' },
            { label: 'Trophy', value: 'trophy' },
            { label: 'Star', value: 'star' },
          ],
        },
      ],
    },
  ],
}

export const TestimonialsBlock: Block = {
  slug: 'testimonials',
  labels: {
    singular: 'Témoignages',
    plural: 'Témoignages',
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
      name: 'style',
      label: 'Style',
      type: 'select',
      defaultValue: 'carousel',
      options: [
        { label: 'Carrousel', value: 'carousel' },
        { label: 'Grille', value: 'grid' },
        { label: 'Featured', value: 'featured' },
      ],
    },
    {
      name: 'testimonials',
      label: 'Témoignages',
      type: 'array',
      fields: [
        {
          name: 'quote',
          label: 'Citation',
          type: 'textarea',
          required: true,
          localized: true,
        },
        {
          name: 'author',
          label: 'Auteur',
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
          name: 'company',
          label: 'Entreprise',
          type: 'text',
        },
        {
          name: 'image',
          label: 'Photo',
          type: 'upload',
          relationTo: 'media',
        },
        {
          name: 'rating',
          label: 'Note (1-5)',
          type: 'number',
          min: 1,
          max: 5,
        },
      ],
    },
  ],
}
