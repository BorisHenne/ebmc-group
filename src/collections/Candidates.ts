import type { CollectionConfig } from 'payload'
import { isManagerOrAbove, isLoggedIn } from '../access/roles'

export const Candidates: CollectionConfig = {
  slug: 'candidates',
  labels: {
    singular: 'Candidat',
    plural: 'Candidats',
  },
  admin: {
    useAsTitle: 'fullName',
    defaultColumns: ['fullName', 'email', 'status', 'category', 'createdAt'],
    group: 'Recrutement',
    listSearchableFields: ['firstName', 'lastName', 'email', 'skills'],
  },
  access: {
    read: isLoggedIn,
    create: isLoggedIn,
    update: isLoggedIn,
    delete: isManagerOrAbove,
  },
  fields: [
    // Virtual field for display
    {
      name: 'fullName',
      label: 'Nom complet',
      type: 'text',
      admin: {
        hidden: true,
      },
      hooks: {
        beforeChange: [
          ({ siblingData }) => {
            delete siblingData.fullName
          },
        ],
        afterRead: [
          ({ data }) => {
            return `${data?.firstName || ''} ${data?.lastName || ''}`.trim()
          },
        ],
      },
    },
    {
      type: 'tabs',
      tabs: [
        {
          label: 'Informations personnelles',
          fields: [
            {
              type: 'row',
              fields: [
                {
                  name: 'firstName',
                  label: 'Prénom',
                  type: 'text',
                  required: true,
                  admin: { width: '50%' },
                },
                {
                  name: 'lastName',
                  label: 'Nom',
                  type: 'text',
                  required: true,
                  admin: { width: '50%' },
                },
              ],
            },
            {
              type: 'row',
              fields: [
                {
                  name: 'email',
                  label: 'Email',
                  type: 'email',
                  required: true,
                  unique: true,
                  admin: { width: '50%' },
                },
                {
                  name: 'phone',
                  label: 'Téléphone',
                  type: 'text',
                  admin: { width: '50%' },
                },
              ],
            },
            {
              name: 'photo',
              label: 'Photo',
              type: 'upload',
              relationTo: 'media',
            },
            {
              type: 'row',
              fields: [
                {
                  name: 'location',
                  label: 'Ville',
                  type: 'text',
                  admin: { width: '50%' },
                },
                {
                  name: 'country',
                  label: 'Pays',
                  type: 'select',
                  defaultValue: 'luxembourg',
                  options: [
                    { label: 'Luxembourg', value: 'luxembourg' },
                    { label: 'France', value: 'france' },
                    { label: 'Belgique', value: 'belgium' },
                    { label: 'Allemagne', value: 'germany' },
                    { label: 'Espagne', value: 'spain' },
                    { label: 'Autre', value: 'other' },
                  ],
                  admin: { width: '50%' },
                },
              ],
            },
            {
              name: 'linkedinUrl',
              label: 'Profil LinkedIn',
              type: 'text',
            },
          ],
        },
        {
          label: 'Profil professionnel',
          fields: [
            {
              type: 'row',
              fields: [
                {
                  name: 'currentTitle',
                  label: 'Poste actuel',
                  type: 'text',
                  admin: { width: '50%' },
                },
                {
                  name: 'currentCompany',
                  label: 'Entreprise actuelle',
                  type: 'text',
                  admin: { width: '50%' },
                },
              ],
            },
            {
              type: 'row',
              fields: [
                {
                  name: 'yearsExperience',
                  label: "Années d'expérience",
                  type: 'number',
                  min: 0,
                  max: 50,
                  admin: { width: '33%' },
                },
                {
                  name: 'category',
                  label: "Domaine d'expertise",
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
                  name: 'experienceLevel',
                  label: "Niveau d'expérience",
                  type: 'select',
                  options: [
                    { label: 'Junior (0-2 ans)', value: 'junior' },
                    { label: 'Confirmé (3-5 ans)', value: 'mid' },
                    { label: 'Senior (6-10 ans)', value: 'senior' },
                    { label: 'Expert (10+ ans)', value: 'expert' },
                  ],
                  admin: { width: '34%' },
                },
              ],
            },
            {
              name: 'skills',
              label: 'Compétences',
              type: 'array',
              fields: [
                {
                  name: 'name',
                  label: 'Compétence',
                  type: 'text',
                  required: true,
                },
                {
                  name: 'level',
                  label: 'Niveau',
                  type: 'select',
                  options: [
                    { label: 'Débutant', value: 'beginner' },
                    { label: 'Intermédiaire', value: 'intermediate' },
                    { label: 'Avancé', value: 'advanced' },
                    { label: 'Expert', value: 'expert' },
                  ],
                },
              ],
            },
            {
              name: 'languages',
              label: 'Langues',
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
                    { label: 'Autre', value: 'other' },
                  ],
                },
                {
                  name: 'level',
                  label: 'Niveau',
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
              name: 'certifications',
              label: 'Certifications',
              type: 'array',
              fields: [
                {
                  name: 'name',
                  label: 'Certification',
                  type: 'text',
                },
                {
                  name: 'year',
                  label: 'Année',
                  type: 'number',
                },
              ],
            },
          ],
        },
        {
          label: 'Disponibilité & Prétentions',
          fields: [
            {
              type: 'row',
              fields: [
                {
                  name: 'availability',
                  label: 'Disponibilité',
                  type: 'select',
                  defaultValue: 'available',
                  options: [
                    { label: 'Immédiate', value: 'immediately' },
                    { label: 'Disponible', value: 'available' },
                    { label: 'Préavis 1 mois', value: 'notice_1' },
                    { label: 'Préavis 2 mois', value: 'notice_2' },
                    { label: 'Préavis 3 mois', value: 'notice_3' },
                    { label: 'Non disponible', value: 'not_available' },
                  ],
                  admin: { width: '50%' },
                },
                {
                  name: 'availableFrom',
                  label: 'Disponible à partir du',
                  type: 'date',
                  admin: { width: '50%' },
                },
              ],
            },
            {
              type: 'row',
              fields: [
                {
                  name: 'remotePreference',
                  label: 'Préférence télétravail',
                  type: 'select',
                  defaultValue: 'hybrid',
                  options: [
                    { label: 'Sur site', value: 'onsite' },
                    { label: 'Hybride', value: 'hybrid' },
                    { label: '100% Remote', value: 'remote' },
                    { label: 'Flexible', value: 'flexible' },
                  ],
                  admin: { width: '50%' },
                },
                {
                  name: 'contractPreference',
                  label: 'Type de contrat souhaité',
                  type: 'select',
                  hasMany: true,
                  options: [
                    { label: 'CDI', value: 'cdi' },
                    { label: 'CDD', value: 'cdd' },
                    { label: 'Freelance', value: 'freelance' },
                    { label: 'Stage', value: 'internship' },
                  ],
                  admin: { width: '50%' },
                },
              ],
            },
            {
              type: 'row',
              fields: [
                {
                  name: 'desiredSalary',
                  label: 'Salaire souhaité',
                  type: 'number',
                  admin: { width: '33%' },
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
                  admin: { width: '33%' },
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
                  admin: { width: '34%' },
                },
              ],
            },
          ],
        },
        {
          label: 'Documents',
          fields: [
            {
              name: 'cv',
              label: 'CV',
              type: 'upload',
              relationTo: 'media',
            },
            {
              name: 'coverLetter',
              label: 'Lettre de motivation',
              type: 'upload',
              relationTo: 'media',
            },
            {
              name: 'otherDocuments',
              label: 'Autres documents',
              type: 'array',
              fields: [
                {
                  name: 'document',
                  label: 'Document',
                  type: 'upload',
                  relationTo: 'media',
                },
                {
                  name: 'description',
                  label: 'Description',
                  type: 'text',
                },
              ],
            },
          ],
        },
        {
          label: 'Gestion',
          fields: [
            {
              type: 'row',
              fields: [
                {
                  name: 'status',
                  label: 'Statut',
                  type: 'select',
                  required: true,
                  defaultValue: 'new',
                  options: [
                    { label: 'Nouveau', value: 'new' },
                    { label: 'En screening', value: 'screening' },
                    { label: 'Qualifié', value: 'qualified' },
                    { label: 'En entretien', value: 'interviewing' },
                    { label: 'Offre en cours', value: 'offer_pending' },
                    { label: 'Recruté', value: 'hired' },
                    { label: 'Rejeté', value: 'rejected' },
                    { label: 'Désisté', value: 'withdrawn' },
                    { label: 'En attente', value: 'on_hold' },
                  ],
                  admin: { width: '50%' },
                },
                {
                  name: 'source',
                  label: 'Source',
                  type: 'select',
                  defaultValue: 'website',
                  options: [
                    { label: 'Site web', value: 'website' },
                    { label: 'LinkedIn', value: 'linkedin' },
                    { label: 'Cooptation', value: 'referral' },
                    { label: 'Job board', value: 'jobboard' },
                    { label: 'Approche directe', value: 'direct' },
                    { label: 'Événement', value: 'event' },
                    { label: 'Autre', value: 'other' },
                  ],
                  admin: { width: '50%' },
                },
              ],
            },
            {
              name: 'rating',
              label: 'Note (1-5)',
              type: 'number',
              min: 1,
              max: 5,
            },
            {
              name: 'assignedTo',
              label: 'Assigné à',
              type: 'relationship',
              relationTo: 'users',
            },
            {
              name: 'tags',
              label: 'Tags',
              type: 'text',
              hasMany: true,
            },
            {
              name: 'notes',
              label: 'Notes internes',
              type: 'richText',
            },
            {
              name: 'gdprConsent',
              label: 'Consentement RGPD',
              type: 'checkbox',
              defaultValue: false,
            },
            {
              name: 'gdprConsentDate',
              label: 'Date consentement RGPD',
              type: 'date',
              admin: {
                condition: (data) => data?.gdprConsent,
              },
            },
            {
              name: 'marketingConsent',
              label: 'Consentement marketing',
              type: 'checkbox',
              defaultValue: false,
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
        // Trigger Make.com webhook on new candidate
        if (operation === 'create' && process.env.MAKE_WEBHOOK_NEW_CANDIDATE) {
          try {
            await fetch(process.env.MAKE_WEBHOOK_NEW_CANDIDATE, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                id: doc.id,
                name: `${doc.firstName} ${doc.lastName}`,
                email: doc.email,
                category: doc.category,
                status: doc.status,
                createdAt: doc.createdAt,
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
