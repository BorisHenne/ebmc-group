import type { GlobalConfig } from 'payload'
import { isAdmin } from '../access/roles'

export const Settings: GlobalConfig = {
  slug: 'settings',
  label: 'Paramètres',
  admin: {
    group: 'Configuration',
  },
  access: {
    read: () => true,
    update: isAdmin,
  },
  fields: [
    {
      type: 'tabs',
      tabs: [
        {
          label: 'Général',
          fields: [
            {
              name: 'siteName',
              label: 'Nom du site',
              type: 'text',
              defaultValue: 'EBMC GROUP',
            },
            {
              name: 'tagline',
              label: 'Slogan',
              type: 'text',
              defaultValue: "L'union européenne de l'expertise digitale",
              localized: true,
            },
            {
              name: 'logo',
              label: 'Logo',
              type: 'upload',
              relationTo: 'media',
            },
            {
              name: 'favicon',
              label: 'Favicon',
              type: 'upload',
              relationTo: 'media',
            },
          ],
        },
        {
          label: 'Contact',
          fields: [
            {
              name: 'email',
              label: 'Email principal',
              type: 'email',
              defaultValue: 'contact@ebmcgroup.eu',
            },
            {
              name: 'phone',
              label: 'Téléphone',
              type: 'text',
            },
            {
              name: 'addresses',
              label: 'Adresses',
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
                  label: 'Rôle',
                  type: 'text',
                },
                {
                  name: 'address',
                  label: 'Adresse',
                  type: 'textarea',
                },
                {
                  name: 'country',
                  label: 'Pays',
                  type: 'text',
                },
              ],
            },
          ],
        },
        {
          label: 'Réseaux sociaux',
          fields: [
            {
              name: 'social',
              label: 'Liens sociaux',
              type: 'group',
              fields: [
                {
                  name: 'linkedin',
                  label: 'LinkedIn',
                  type: 'text',
                },
                {
                  name: 'twitter',
                  label: 'Twitter / X',
                  type: 'text',
                },
                {
                  name: 'facebook',
                  label: 'Facebook',
                  type: 'text',
                },
                {
                  name: 'instagram',
                  label: 'Instagram',
                  type: 'text',
                },
                {
                  name: 'youtube',
                  label: 'YouTube',
                  type: 'text',
                },
                {
                  name: 'github',
                  label: 'GitHub',
                  type: 'text',
                },
              ],
            },
          ],
        },
        {
          label: 'SEO',
          fields: [
            {
              name: 'seo',
              label: 'SEO par défaut',
              type: 'group',
              fields: [
                {
                  name: 'title',
                  label: 'Titre par défaut',
                  type: 'text',
                  localized: true,
                },
                {
                  name: 'description',
                  label: 'Description par défaut',
                  type: 'textarea',
                  localized: true,
                },
                {
                  name: 'image',
                  label: 'OG Image par défaut',
                  type: 'upload',
                  relationTo: 'media',
                },
              ],
            },
            {
              name: 'analytics',
              label: 'Analytics',
              type: 'group',
              fields: [
                {
                  name: 'googleAnalytics',
                  label: 'Google Analytics ID',
                  type: 'text',
                },
                {
                  name: 'googleTagManager',
                  label: 'Google Tag Manager ID',
                  type: 'text',
                },
              ],
            },
          ],
        },
        {
          label: 'Scripts',
          fields: [
            {
              name: 'scripts',
              label: 'Scripts personnalisés',
              type: 'group',
              fields: [
                {
                  name: 'head',
                  label: 'Scripts Head',
                  type: 'code',
                  admin: {
                    language: 'html',
                  },
                },
                {
                  name: 'bodyStart',
                  label: 'Scripts Body (début)',
                  type: 'code',
                  admin: {
                    language: 'html',
                  },
                },
                {
                  name: 'bodyEnd',
                  label: 'Scripts Body (fin)',
                  type: 'code',
                  admin: {
                    language: 'html',
                  },
                },
              ],
            },
          ],
        },
      ],
    },
  ],
}
