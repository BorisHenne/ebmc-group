import type { Block } from 'payload'

export const ContactFormBlock: Block = {
  slug: 'contactForm',
  labels: {
    singular: 'Formulaire de contact',
    plural: 'Formulaires de contact',
  },
  fields: [
    {
      name: 'title',
      label: 'Titre',
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
      name: 'showContactInfo',
      label: 'Afficher les infos de contact',
      type: 'checkbox',
      defaultValue: true,
    },
    {
      name: 'showMap',
      label: 'Afficher la carte',
      type: 'checkbox',
      defaultValue: false,
    },
    {
      name: 'defaultType',
      label: 'Type par défaut',
      type: 'select',
      defaultValue: 'general',
      options: [
        { label: 'Général', value: 'general' },
        { label: 'Projet', value: 'project' },
        { label: 'Partenariat', value: 'partnership' },
        { label: 'Carrières', value: 'careers' },
      ],
    },
    {
      name: 'successMessage',
      label: 'Message de succès',
      type: 'textarea',
      localized: true,
      defaultValue: 'Votre message a bien été envoyé. Nous vous répondrons dans les plus brefs délais.',
    },
  ],
}

export const OffersListBlock: Block = {
  slug: 'offersList',
  labels: {
    singular: 'Liste des offres',
    plural: 'Listes des offres',
  },
  fields: [
    {
      name: 'title',
      label: 'Titre',
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
      name: 'style',
      label: 'Style',
      type: 'select',
      defaultValue: 'grid',
      options: [
        { label: 'Grille', value: 'grid' },
        { label: 'Liste', value: 'list' },
        { label: 'Compact', value: 'compact' },
      ],
    },
    {
      name: 'filterCategory',
      label: 'Filtrer par catégorie',
      type: 'select',
      options: [
        { label: 'Toutes', value: 'all' },
        { label: 'SAP', value: 'sap' },
        { label: 'ICT', value: 'ict' },
        { label: 'Cybersécurité', value: 'cybersecurity' },
        { label: 'IA', value: 'ai' },
        { label: 'Management', value: 'management' },
      ],
    },
    {
      name: 'filterType',
      label: 'Filtrer par type',
      type: 'select',
      options: [
        { label: 'Tous', value: 'all' },
        { label: 'CDI', value: 'cdi' },
        { label: 'CDD', value: 'cdd' },
        { label: 'Freelance', value: 'freelance' },
        { label: 'Stage', value: 'internship' },
      ],
    },
    {
      name: 'limit',
      label: 'Nombre max à afficher',
      type: 'number',
      defaultValue: 10,
    },
    {
      name: 'showFilters',
      label: 'Afficher les filtres',
      type: 'checkbox',
      defaultValue: true,
    },
    {
      name: 'showSearch',
      label: 'Afficher la recherche',
      type: 'checkbox',
      defaultValue: true,
    },
    {
      name: 'featuredOnly',
      label: 'Offres en vedette uniquement',
      type: 'checkbox',
      defaultValue: false,
    },
  ],
}
