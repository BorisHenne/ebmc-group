import type { CollectionConfig } from 'payload'
import { isEditorOrAbove, isPublishedOrAdmin } from '../access/roles'
import { slugField } from '../fields/slug'

export const Offers: CollectionConfig = {
  slug: 'offers',
  labels: {
    singular: 'Offre',
    plural: 'Offres',
  },
  admin: {
    useAsTitle: 'title',
    defaultColumns: ['title', 'category', 'type', 'location', '_status', 'publishedAt'],
    group: 'Recrutement',
    livePreview: {
      url: ({ data }) => {
        const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'
        return `${baseUrl}/careers/${data.slug}`
      },
    },
  },
  versions: {
    drafts: {
      autosave: {
        interval: 30000,
      },
    },
  },
  access: {
    read: isPublishedOrAdmin,
    create: isEditorOrAbove,
    update: isEditorOrAbove,
    delete: isEditorOrAbove,
  },
  fields: [
    {
      type: 'tabs',
      tabs: [
        {
          label: 'Informations générales',
          fields: [
            {
              name: 'title',
              label: 'Titre du poste',
              type: 'text',
              required: true,
              localized: true,
            },
            slugField('title'),
            {
              name: 'excerpt',
              label: 'Résumé court',
              type: 'textarea',
              maxLength: 300,
              localized: true,
            },
            {
              name: 'description',
              label: 'Description complète',
              type: 'richText',
              required: true,
              localized: true,
            },
            {
              type: 'row',
              fields: [
                {
                  name: 'category',
                  label: 'Catégorie',
                  type: 'select',
                  required: true,
                  options: [
                    { label: 'SAP', value: 'sap' },
                    { label: 'ICT', value: 'ict' },
                    { label: 'Cybersécurité', value: 'cybersecurity' },
                    { label: 'IA', value: 'ai' },
                    { label: 'Management', value: 'management' },
                    { label: 'Autre', value: 'other' },
                  ],
                  admin: { width: '33%' },
                },
                {
                  name: 'type',
                  label: 'Type de contrat',
                  type: 'select',
                  required: true,
                  options: [
                    { label: 'CDI', value: 'cdi' },
                    { label: 'CDD', value: 'cdd' },
                    { label: 'Freelance', value: 'freelance' },
                    { label: 'Stage', value: 'internship' },
                    { label: 'Alternance', value: 'apprenticeship' },
                  ],
                  admin: { width: '33%' },
                },
                {
                  name: 'experienceLevel',
                  label: "Niveau d'expérience",
                  type: 'select',
                  required: true,
                  options: [
                    { label: 'Junior (0-2 ans)', value: 'junior' },
                    { label: 'Confirmé (3-5 ans)', value: 'mid' },
                    { label: 'Senior (6-10 ans)', value: 'senior' },
                    { label: 'Lead / Expert', value: 'lead' },
                    { label: 'Executive', value: 'executive' },
                  ],
                  admin: { width: '34%' },
                },
              ],
            },
          ],
        },
        {
          label: 'Localisation',
          fields: [
            {
              type: 'row',
              fields: [
                {
                  name: 'location',
                  label: 'Ville',
                  type: 'text',
                  required: true,
                  admin: { width: '50%' },
                },
                {
                  name: 'country',
                  label: 'Pays',
                  type: 'select',
                  required: true,
                  defaultValue: 'luxembourg',
                  options: [
                    { label: 'Luxembourg', value: 'luxembourg' },
                    { label: 'France', value: 'france' },
                    { label: 'Belgique', value: 'belgium' },
                    { label: 'Espagne', value: 'spain' },
                    { label: 'Allemagne', value: 'germany' },
                  ],
                  admin: { width: '50%' },
                },
              ],
            },
            {
              name: 'remote',
              label: 'Politique télétravail',
              type: 'select',
              defaultValue: 'hybrid',
              options: [
                { label: 'Sur site uniquement', value: 'onsite' },
                { label: 'Hybride', value: 'hybrid' },
                { label: '100% Remote', value: 'remote' },
                { label: 'Flexible', value: 'flexible' },
              ],
            },
          ],
        },
        {
          label: 'Rémunération',
          fields: [
            {
              type: 'row',
              fields: [
                {
                  name: 'salaryMin',
                  label: 'Salaire minimum',
                  type: 'number',
                  admin: { width: '25%' },
                },
                {
                  name: 'salaryMax',
                  label: 'Salaire maximum',
                  type: 'number',
                  admin: { width: '25%' },
                },
                {
                  name: 'salaryCurrency',
                  label: 'Devise',
                  type: 'select',
                  defaultValue: 'eur',
                  options: [
                    { label: 'EUR', value: 'eur' },
                    { label: 'CHF', value: 'chf' },
                    { label: 'USD', value: 'usd' },
                  ],
                  admin: { width: '25%' },
                },
                {
                  name: 'salaryPeriod',
                  label: 'Période',
                  type: 'select',
                  defaultValue: 'yearly',
                  options: [
                    { label: 'Par heure', value: 'hourly' },
                    { label: 'Par jour', value: 'daily' },
                    { label: 'Par mois', value: 'monthly' },
                    { label: 'Par an', value: 'yearly' },
                  ],
                  admin: { width: '25%' },
                },
              ],
            },
            {
              name: 'salaryVisible',
              label: 'Afficher le salaire publiquement',
              type: 'checkbox',
              defaultValue: false,
            },
            {
              name: 'benefits',
              label: 'Avantages',
              type: 'array',
              localized: true,
              fields: [
                {
                  name: 'benefit',
                  label: 'Avantage',
                  type: 'text',
                },
              ],
            },
          ],
        },
        {
          label: 'Prérequis',
          fields: [
            {
              name: 'skills',
              label: 'Compétences requises',
              type: 'array',
              fields: [
                {
                  name: 'skill',
                  label: 'Compétence',
                  type: 'text',
                  required: true,
                },
                {
                  name: 'required',
                  label: 'Obligatoire',
                  type: 'checkbox',
                  defaultValue: true,
                },
              ],
            },
            {
              name: 'languages',
              label: 'Langues requises',
              type: 'array',
              fields: [
                {
                  name: 'language',
                  label: 'Langue',
                  type: 'select',
                  options: [
                    { label: 'Français', value: 'french' },
                    { label: 'Anglais', value: 'english' },
                    { label: 'Allemand', value: 'german' },
                    { label: 'Espagnol', value: 'spanish' },
                    { label: 'Luxembourgeois', value: 'luxembourgish' },
                  ],
                },
                {
                  name: 'level',
                  label: 'Niveau minimum',
                  type: 'select',
                  options: [
                    { label: 'Notions', value: 'basic' },
                    { label: 'Intermédiaire', value: 'intermediate' },
                    { label: 'Courant', value: 'fluent' },
                    { label: 'Bilingue', value: 'native' },
                  ],
                },
              ],
            },
            {
              name: 'requirements',
              label: 'Autres prérequis',
              type: 'richText',
              localized: true,
            },
          ],
        },
        {
          label: 'Publication',
          fields: [
            {
              name: 'featured',
              label: 'Mise en avant',
              type: 'checkbox',
              defaultValue: false,
              admin: {
                description: "Afficher cette offre en priorité sur la page d'accueil",
              },
            },
            {
              name: 'publishedAt',
              label: 'Date de publication',
              type: 'date',
              admin: {
                date: {
                  pickerAppearance: 'dayAndTime',
                },
              },
            },
            {
              name: 'expiresAt',
              label: "Date d'expiration",
              type: 'date',
              admin: {
                date: {
                  pickerAppearance: 'dayOnly',
                },
              },
            },
            {
              name: 'applicationCount',
              label: 'Nombre de candidatures',
              type: 'number',
              defaultValue: 0,
              admin: {
                readOnly: true,
              },
            },
          ],
        },
        {
          label: 'SEO',
          fields: [
            {
              name: 'meta',
              label: 'Métadonnées',
              type: 'group',
              fields: [
                {
                  name: 'title',
                  label: 'Meta Title',
                  type: 'text',
                  localized: true,
                },
                {
                  name: 'description',
                  label: 'Meta Description',
                  type: 'textarea',
                  maxLength: 160,
                  localized: true,
                },
                {
                  name: 'image',
                  label: 'OG Image',
                  type: 'upload',
                  relationTo: 'media',
                },
              ],
            },
          ],
        },
        {
          label: 'Intégrations',
          fields: [
            {
              name: 'boondId',
              label: 'ID Boondmanager',
              type: 'text',
              unique: true,
              admin: {
                readOnly: true,
              },
            },
            {
              name: 'boondSyncedAt',
              label: 'Dernière sync Boond',
              type: 'date',
              admin: {
                readOnly: true,
              },
            },
          ],
        },
      ],
    },
  ],
  timestamps: true,
  hooks: {
    afterChange: [
      async ({ doc, operation }) => {
        // Trigger Make.com webhook on publish
        if (
          doc._status === 'published' &&
          process.env.MAKE_WEBHOOK_NEW_OFFER
        ) {
          try {
            await fetch(process.env.MAKE_WEBHOOK_NEW_OFFER, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                id: doc.id,
                title: doc.title,
                category: doc.category,
                type: doc.type,
                location: doc.location,
                slug: doc.slug,
              }),
            })
          } catch (error) {
            console.error('Failed to trigger Make.com webhook:', error)
          }
        }
      },
    ],
  },
}
