import type { CollectionConfig } from 'payload'
import { isLoggedIn, isManagerOrAbove } from '../access/roles'

export const Applications: CollectionConfig = {
  slug: 'applications',
  labels: {
    singular: 'Candidature',
    plural: 'Candidatures',
  },
  admin: {
    useAsTitle: 'id',
    defaultColumns: ['candidate', 'offer', 'status', 'rating', 'createdAt'],
    group: 'Recrutement',
  },
  access: {
    read: isLoggedIn,
    create: () => true, // Public can apply
    update: isLoggedIn,
    delete: isManagerOrAbove,
  },
  fields: [
    {
      type: 'row',
      fields: [
        {
          name: 'candidate',
          label: 'Candidat',
          type: 'relationship',
          relationTo: 'candidates',
          required: true,
          admin: { width: '50%' },
        },
        {
          name: 'offer',
          label: 'Offre',
          type: 'relationship',
          relationTo: 'offers',
          required: true,
          admin: { width: '50%' },
        },
      ],
    },
    {
      name: 'coverLetter',
      label: 'Lettre de motivation',
      type: 'textarea',
    },
    {
      name: 'answers',
      label: 'Réponses aux questions',
      type: 'array',
      fields: [
        {
          name: 'question',
          label: 'Question',
          type: 'text',
        },
        {
          name: 'answer',
          label: 'Réponse',
          type: 'textarea',
        },
      ],
    },
    {
      type: 'row',
      fields: [
        {
          name: 'status',
          label: 'Statut',
          type: 'select',
          required: true,
          defaultValue: 'received',
          options: [
            { label: 'Reçue', value: 'received' },
            { label: 'En cours de révision', value: 'reviewing' },
            { label: 'Présélectionnée', value: 'shortlisted' },
            { label: 'Entretien planifié', value: 'interview_scheduled' },
            { label: 'Entretien passé', value: 'interviewed' },
            { label: 'Offre envoyée', value: 'offer_made' },
            { label: 'Acceptée', value: 'accepted' },
            { label: 'Refusée', value: 'rejected' },
            { label: 'Retirée', value: 'withdrawn' },
          ],
          admin: { width: '50%' },
        },
        {
          name: 'rating',
          label: 'Note (1-5)',
          type: 'number',
          min: 1,
          max: 5,
          admin: { width: '50%' },
        },
      ],
    },
    {
      name: 'interview',
      label: 'Entretien',
      type: 'group',
      fields: [
        {
          name: 'scheduledAt',
          label: 'Date prévue',
          type: 'date',
          admin: {
            date: {
              pickerAppearance: 'dayAndTime',
            },
          },
        },
        {
          name: 'type',
          label: "Type d'entretien",
          type: 'select',
          options: [
            { label: 'Téléphone', value: 'phone' },
            { label: 'Visio', value: 'video' },
            { label: 'Présentiel', value: 'onsite' },
          ],
        },
        {
          name: 'interviewer',
          label: 'Intervieweur',
          type: 'relationship',
          relationTo: 'users',
        },
        {
          name: 'notes',
          label: "Notes d'entretien",
          type: 'richText',
        },
        {
          name: 'feedback',
          label: 'Feedback',
          type: 'textarea',
        },
      ],
    },
    {
      name: 'rejectionReason',
      label: 'Motif de refus',
      type: 'select',
      options: [
        { label: 'Profil non adapté', value: 'not_fit' },
        { label: 'Expérience insuffisante', value: 'experience' },
        { label: 'Compétences manquantes', value: 'skills' },
        { label: 'Prétentions salariales', value: 'salary' },
        { label: 'Poste pourvu', value: 'filled' },
        { label: 'Autre', value: 'other' },
      ],
      admin: {
        condition: (data) => data?.status === 'rejected',
      },
    },
    {
      name: 'rejectionDetails',
      label: 'Détails du refus',
      type: 'textarea',
      admin: {
        condition: (data) => data?.status === 'rejected',
      },
    },
    {
      name: 'assignedTo',
      label: 'Assigné à',
      type: 'relationship',
      relationTo: 'users',
    },
    {
      name: 'notes',
      label: 'Notes internes',
      type: 'richText',
    },
    {
      name: 'source',
      label: 'Source',
      type: 'group',
      fields: [
        {
          name: 'page',
          label: 'Page',
          type: 'text',
        },
        {
          name: 'referrer',
          label: 'Referrer',
          type: 'text',
        },
        {
          name: 'utm',
          label: 'UTM',
          type: 'json',
        },
      ],
    },
  ],
  timestamps: true,
  hooks: {
    afterChange: [
      async ({ doc, operation, req }) => {
        // Update application count on offer
        if (operation === 'create') {
          const offer = await req.payload.findByID({
            collection: 'offers',
            id: doc.offer as string,
          })
          await req.payload.update({
            collection: 'offers',
            id: doc.offer as string,
            data: {
              applicationCount: (offer.applicationCount || 0) + 1,
            },
          })
        }

        // Trigger Make.com webhook
        if (operation === 'create' && process.env.MAKE_WEBHOOK_APPLICATION) {
          try {
            await fetch(process.env.MAKE_WEBHOOK_APPLICATION, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                id: doc.id,
                candidateId: doc.candidate,
                offerId: doc.offer,
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
