import type { Block } from 'payload'

export const ContactFormBlock: Block = {
  slug: 'contactForm',
  labels: { singular: 'Formulaire de contact', plural: 'Formulaires de contact' },
  fields: [
    {
      name: 'title',
      type: 'text',
      label: 'Titre',
    },
    {
      name: 'description',
      type: 'textarea',
      label: 'Description',
    },
    {
      name: 'email',
      type: 'email',
      label: 'Email de destination',
    },
  ],
}