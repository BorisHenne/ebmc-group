import type { GlobalConfig } from 'payload'
import { isEditorOrAbove } from '../access/roles'

export const Navigation: GlobalConfig = {
  slug: 'navigation',
  label: 'Navigation',
  admin: {
    group: 'Configuration',
  },
  access: {
    read: () => true,
    update: isEditorOrAbove,
  },
  fields: [
    {
      name: 'header',
      label: 'Menu Header',
      type: 'array',
      fields: [
        {
          name: 'label',
          label: 'Libellé',
          type: 'text',
          required: true,
          localized: true,
        },
        {
          name: 'type',
          label: 'Type',
          type: 'select',
          defaultValue: 'link',
          options: [
            { label: 'Lien simple', value: 'link' },
            { label: 'Dropdown', value: 'dropdown' },
          ],
        },
        {
          name: 'link',
          label: 'Lien',
          type: 'group',
          admin: {
            condition: (data, siblingData) => siblingData?.type === 'link',
          },
          fields: [
            {
              name: 'type',
              label: 'Type de lien',
              type: 'radio',
              defaultValue: 'internal',
              options: [
                { label: 'Interne', value: 'internal' },
                { label: 'Externe', value: 'external' },
              ],
            },
            {
              name: 'page',
              label: 'Page',
              type: 'relationship',
              relationTo: 'pages',
              admin: {
                condition: (data, siblingData) => siblingData?.type === 'internal',
              },
            },
            {
              name: 'url',
              label: 'URL',
              type: 'text',
              admin: {
                condition: (data, siblingData) => siblingData?.type === 'external',
              },
            },
            {
              name: 'newTab',
              label: 'Ouvrir dans un nouvel onglet',
              type: 'checkbox',
              defaultValue: false,
            },
          ],
        },
        {
          name: 'children',
          label: 'Sous-menus',
          type: 'array',
          admin: {
            condition: (data, siblingData) => siblingData?.type === 'dropdown',
          },
          fields: [
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
                { label: 'Server', value: 'server' },
                { label: 'Monitor', value: 'monitor' },
                { label: 'Shield', value: 'shield' },
                { label: 'Brain', value: 'brain' },
                { label: 'Users', value: 'users' },
                { label: 'Mail', value: 'mail' },
                { label: 'Building', value: 'building' },
                { label: 'Briefcase', value: 'briefcase' },
              ],
            },
            {
              name: 'link',
              label: 'Lien',
              type: 'group',
              fields: [
                {
                  name: 'type',
                  label: 'Type de lien',
                  type: 'radio',
                  defaultValue: 'internal',
                  options: [
                    { label: 'Interne', value: 'internal' },
                    { label: 'Externe', value: 'external' },
                  ],
                },
                {
                  name: 'page',
                  label: 'Page',
                  type: 'relationship',
                  relationTo: 'pages',
                  admin: {
                    condition: (data, siblingData) => siblingData?.type === 'internal',
                  },
                },
                {
                  name: 'url',
                  label: 'URL',
                  type: 'text',
                  admin: {
                    condition: (data, siblingData) => siblingData?.type === 'external',
                  },
                },
              ],
            },
          ],
        },
      ],
    },
    {
      name: 'footer',
      label: 'Colonnes Footer',
      type: 'array',
      maxRows: 4,
      fields: [
        {
          name: 'title',
          label: 'Titre',
          type: 'text',
          required: true,
          localized: true,
        },
        {
          name: 'links',
          label: 'Liens',
          type: 'array',
          fields: [
            {
              name: 'label',
              label: 'Libellé',
              type: 'text',
              required: true,
              localized: true,
            },
            {
              name: 'type',
              label: 'Type de lien',
              type: 'radio',
              defaultValue: 'internal',
              options: [
                { label: 'Interne', value: 'internal' },
                { label: 'Externe', value: 'external' },
              ],
            },
            {
              name: 'page',
              label: 'Page',
              type: 'relationship',
              relationTo: 'pages',
              admin: {
                condition: (data, siblingData) => siblingData?.type === 'internal',
              },
            },
            {
              name: 'url',
              label: 'URL',
              type: 'text',
              admin: {
                condition: (data, siblingData) => siblingData?.type === 'external',
              },
            },
          ],
        },
      ],
    },
    {
      name: 'cta',
      label: 'Bouton CTA Header',
      type: 'group',
      fields: [
        {
          name: 'label',
          label: 'Libellé',
          type: 'text',
          localized: true,
          defaultValue: 'Nous contacter',
        },
        {
          name: 'page',
          label: 'Page',
          type: 'relationship',
          relationTo: 'pages',
        },
      ],
    },
  ],
}
