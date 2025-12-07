import type { Block } from 'payload'

export const FeaturesBlock: Block = {
  slug: 'features',
  labels: {
    singular: 'Caractéristiques',
    plural: 'Caractéristiques',
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
      name: 'layout',
      label: 'Mise en page',
      type: 'select',
      defaultValue: 'grid',
      options: [
        { label: 'Grille', value: 'grid' },
        { label: 'Liste', value: 'list' },
        { label: 'Alternée', value: 'alternate' },
      ],
    },
    {
      name: 'features',
      label: 'Caractéristiques',
      type: 'array',
      minRows: 1,
      fields: [
        {
          name: 'icon',
          label: 'Icône',
          type: 'select',
          options: [
            { label: 'Brain', value: 'brain' },
            { label: 'Chart', value: 'chart' },
            { label: 'Globe', value: 'globe' },
            { label: 'Puzzle', value: 'puzzle' },
            { label: 'Eye', value: 'eye' },
            { label: 'CheckCircle', value: 'check' },
            { label: 'Zap', value: 'zap' },
            { label: 'Target', value: 'target' },
            { label: 'Rocket', value: 'rocket' },
            { label: 'Heart', value: 'heart' },
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
          name: 'description',
          label: 'Description',
          type: 'textarea',
          localized: true,
        },
        {
          name: 'highlights',
          label: 'Points clés',
          type: 'array',
          fields: [
            {
              name: 'text',
              label: 'Texte',
              type: 'text',
              localized: true,
            },
          ],
        },
      ],
    },
    {
      name: 'bottomStats',
      label: 'Statistiques en bas',
      type: 'array',
      maxRows: 4,
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
      ],
    },
  ],
}
