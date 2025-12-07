import type { Block } from 'payload'
import { linkField } from '../fields/slug'

export const HeroBlock: Block = {
  slug: 'hero',
  labels: {
    singular: 'Hero',
    plural: 'Heroes',
  },
  imageURL: '/blocks/hero.png',
  fields: [
    {
      name: 'style',
      label: 'Style',
      type: 'select',
      defaultValue: 'default',
      options: [
        { label: 'Par défaut', value: 'default' },
        { label: 'Centré', value: 'centered' },
        { label: 'Avec image', value: 'withImage' },
        { label: 'Avec vidéo', value: 'withVideo' },
        { label: 'Plein écran', value: 'fullscreen' },
      ],
    },
    {
      name: 'badge',
      label: 'Badge',
      type: 'text',
      localized: true,
    },
    {
      name: 'title',
      label: 'Titre',
      type: 'text',
      required: true,
      localized: true,
    },
    {
      name: 'highlightedText',
      label: 'Texte mis en avant (gradient)',
      type: 'text',
      localized: true,
      admin: {
        description: 'Ce texte sera affiché avec un effet de dégradé',
      },
    },
    {
      name: 'description',
      label: 'Description',
      type: 'textarea',
      localized: true,
    },
    {
      name: 'primaryCta',
      label: 'Bouton principal',
      type: 'group',
      fields: [
        linkField({ name: 'link' }),
      ],
    },
    {
      name: 'secondaryCta',
      label: 'Bouton secondaire',
      type: 'group',
      fields: [
        linkField({ name: 'link' }),
      ],
    },
    {
      name: 'image',
      label: 'Image',
      type: 'upload',
      relationTo: 'media',
      admin: {
        condition: (_, siblingData) => 
          siblingData?.style === 'withImage' || siblingData?.style === 'fullscreen',
      },
    },
    {
      name: 'videoUrl',
      label: 'URL Vidéo (YouTube/Vimeo)',
      type: 'text',
      admin: {
        condition: (_, siblingData) => siblingData?.style === 'withVideo',
      },
    },
    {
      name: 'stats',
      label: 'Statistiques',
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
        {
          name: 'icon',
          label: 'Icône',
          type: 'select',
          options: [
            { label: 'Users', value: 'users' },
            { label: 'Calendar', value: 'calendar' },
            { label: 'Building', value: 'building' },
            { label: 'Award', value: 'award' },
            { label: 'Globe', value: 'globe' },
            { label: 'Shield', value: 'shield' },
          ],
        },
      ],
    },
    {
      name: 'showScrollIndicator',
      label: 'Afficher indicateur de scroll',
      type: 'checkbox',
      defaultValue: true,
    },
  ],
}
