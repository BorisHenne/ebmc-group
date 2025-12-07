import type { Block } from 'payload'
import { linkField } from '../fields/slug'

export const ServicesBlock: Block = {
  slug: 'services',
  labels: {
    singular: 'Services',
    plural: 'Services',
  },
  fields: [
    {
      name: 'title',
      label: 'Titre',
      type: 'text',
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
      name: 'services',
      label: 'Services',
      type: 'array',
      minRows: 1,
      maxRows: 6,
      fields: [
        {
          name: 'year',
          label: 'Année',
          type: 'text',
        },
        {
          name: 'icon',
          label: 'Icône',
          type: 'select',
          options: [
            { label: 'Server (SAP)', value: 'server' },
            { label: 'Monitor (ICT)', value: 'monitor' },
            { label: 'Shield (Cyber)', value: 'shield' },
            { label: 'Brain (IA)', value: 'brain' },
            { label: 'Cloud', value: 'cloud' },
            { label: 'Code', value: 'code' },
            { label: 'Database', value: 'database' },
            { label: 'Lock', value: 'lock' },
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
          name: 'subtitle',
          label: 'Sous-titre',
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
          name: 'features',
          label: 'Points clés',
          type: 'array',
          fields: [
            {
              name: 'feature',
              label: 'Point',
              type: 'text',
              localized: true,
            },
          ],
        },
        {
          name: 'gradient',
          label: 'Dégradé de couleur',
          type: 'select',
          defaultValue: 'turquoise',
          options: [
            { label: 'Turquoise', value: 'turquoise' },
            { label: 'Bleu', value: 'blue' },
            { label: 'Violet', value: 'purple' },
            { label: 'Rouge', value: 'red' },
            { label: 'Vert', value: 'green' },
          ],
        },
        linkField({ name: 'link' }),
      ],
    },
  ],
}
