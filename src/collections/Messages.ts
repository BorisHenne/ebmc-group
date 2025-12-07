import type { CollectionConfig } from 'payload'
import { isLoggedIn, isManagerOrAbove } from '../access/roles'

export const Messages: CollectionConfig = {
  slug: 'messages',
  labels: {
    singular: 'Message',
    plural: 'Messages',
  },
  admin: {
    useAsTitle: 'subject',
    defaultColumns: ['name', 'email', 'type', 'status', 'createdAt'],
    group: 'Communication',
  },
  access: {
    read: isLoggedIn,
    create: () => true, // Public can send messages
    update: isLoggedIn,
    delete: isManagerOrAbove,
  },
  fields: [
    {
      type: 'row',
      fields: [
        {
          name: 'type',
          label: 'Type',
          type: 'select',
          required: true,
          defaultValue: 'general',
          options: [
            { label: 'Général', value: 'general' },
            { label: 'Projet', value: 'project' },
            { label: 'Partenariat', value: 'partnership' },
            { label: 'Carrières', value: 'careers' },
            { label: 'Support', value: 'support' },
            { label: 'Presse', value: 'press' },
          ],
          admin: { width: '50%' },
        },
        {
          name: 'status',
          label: 'Statut',
          type: 'select',
          required: true,
          defaultValue: 'new',
          options: [
            { label: 'Nouveau', value: 'new' },
            { label: 'Lu', value: 'read' },
            { label: 'En cours', value: 'in_progress' },
            { label: 'Répondu', value: 'responded' },
            { label: 'Fermé', value: 'closed' },
            { label: 'Spam', value: 'spam' },
          ],
          admin: { width: '50%' },
        },
      ],
    },
    {
      type: 'row',
      fields: [
        {
          name: 'name',
          label: 'Nom',
          type: 'text',
          required: true,
          admin: { width: '50%' },
        },
        {
          name: 'email',
          label: 'Email',
          type: 'email',
          required: true,
          admin: { width: '50%' },
        },
      ],
    },
    {
      type: 'row',
      fields: [
        {
          name: 'phone',
          label: 'Téléphone',
          type: 'text',
          admin: { width: '50%' },
        },
        {
          name: 'company',
          label: 'Entreprise',
          type: 'text',
          admin: { width: '50%' },
        },
      ],
    },
    {
      name: 'subject',
      label: 'Sujet',
      type: 'text',
      required: true,
    },
    {
      name: 'message',
      label: 'Message',
      type: 'textarea',
      required: true,
    },
    {
      name: 'assignedTo',
      label: 'Assigné à',
      type: 'relationship',
      relationTo: 'users',
    },
    {
      name: 'response',
      label: 'Réponse',
      type: 'group',
      fields: [
        {
          name: 'content',
          label: 'Contenu de la réponse',
          type: 'textarea',
        },
        {
          name: 'sentAt',
          label: 'Envoyée le',
          type: 'date',
          admin: {
            date: {
              pickerAppearance: 'dayAndTime',
            },
            readOnly: true,
          },
        },
        {
          name: 'sentBy',
          label: 'Envoyée par',
          type: 'relationship',
          relationTo: 'users',
          admin: {
            readOnly: true,
          },
        },
      ],
    },
    {
      name: 'notes',
      label: 'Notes internes',
      type: 'textarea',
    },
    {
      name: 'metadata',
      label: 'Métadonnées',
      type: 'group',
      admin: {
        condition: () => false, // Hidden from admin
      },
      fields: [
        {
          name: 'ip',
          label: 'Adresse IP',
          type: 'text',
        },
        {
          name: 'userAgent',
          label: 'User Agent',
          type: 'text',
        },
        {
          name: 'source',
          label: 'Page source',
          type: 'text',
        },
        {
          name: 'referrer',
          label: 'Referrer',
          type: 'text',
        },
      ],
    },
  ],
  timestamps: true,
  hooks: {
    afterChange: [
      async ({ doc, operation, req }) => {
        // Send email notification to admin
        if (operation === 'create') {
          try {
            await req.payload.sendEmail({
              to: process.env.CONTACT_EMAIL || 'contact@ebmcgroup.eu',
              subject: `[${doc.type.toUpperCase()}] Nouveau message: ${doc.subject}`,
              html: `
                <h2>Nouveau message de contact</h2>
                <p><strong>De:</strong> ${doc.name} (${doc.email})</p>
                ${doc.phone ? `<p><strong>Téléphone:</strong> ${doc.phone}</p>` : ''}
                ${doc.company ? `<p><strong>Entreprise:</strong> ${doc.company}</p>` : ''}
                <p><strong>Type:</strong> ${doc.type}</p>
                <p><strong>Sujet:</strong> ${doc.subject}</p>
                <hr/>
                <p>${doc.message.replace(/\n/g, '<br/>')}</p>
              `,
            })
          } catch (error) {
            console.error('Failed to send notification email:', error)
          }
        }

        // Trigger Make.com webhook
        if (operation === 'create' && process.env.MAKE_WEBHOOK_CONTACT) {
          try {
            await fetch(process.env.MAKE_WEBHOOK_CONTACT, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                id: doc.id,
                name: doc.name,
                email: doc.email,
                type: doc.type,
                subject: doc.subject,
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
