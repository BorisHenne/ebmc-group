import type { Field } from 'payload'

export const slugField = (fieldToUse: string = 'title'): Field => ({
  name: 'slug',
  label: 'Slug',
  type: 'text',
  unique: true,
  admin: {
    position: 'sidebar',
    description: `Généré automatiquement depuis "${fieldToUse}" si laissé vide`,
  },
  hooks: {
    beforeValidate: [
      ({ value, data }) => {
        if (value) return value

        const sourceField = data?.[fieldToUse]
        if (typeof sourceField === 'string') {
          return sourceField
            .toLowerCase()
            .normalize('NFD')
            .replace(/[\u0300-\u036f]/g, '')
            .replace(/[^a-z0-9]+/g, '-')
            .replace(/(^-|-$)/g, '')
        }

        return value
      },
    ],
  },
})

export const linkField = (options?: {
  name?: string
  label?: string
  required?: boolean
}): Field => ({
  name: options?.name || 'link',
  label: options?.label || 'Lien',
  type: 'group',
  fields: [
    {
      name: 'type',
      label: 'Type',
      type: 'radio',
      defaultValue: 'internal',
      options: [
        { label: 'Page interne', value: 'internal' },
        { label: 'URL externe', value: 'external' },
      ],
    },
    {
      name: 'page',
      label: 'Page',
      type: 'relationship',
      relationTo: 'pages',
      required: options?.required,
      admin: {
        condition: (_, siblingData) => siblingData?.type === 'internal',
      },
    },
    {
      name: 'url',
      label: 'URL',
      type: 'text',
      required: options?.required,
      admin: {
        condition: (_, siblingData) => siblingData?.type === 'external',
      },
    },
    {
      name: 'label',
      label: 'Libellé',
      type: 'text',
      localized: true,
    },
    {
      name: 'newTab',
      label: 'Ouvrir dans un nouvel onglet',
      type: 'checkbox',
      defaultValue: false,
    },
  ],
})
