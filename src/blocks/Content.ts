import type { Block } from 'payload'

export const ContentBlock: Block = {
  slug: 'content',
  labels: {
    singular: 'Contenu',
    plural: 'Contenus',
  },
  fields: [
    {
      name: 'layout',
      label: 'Mise en page',
      type: 'select',
      defaultValue: 'full',
      options: [
        { label: 'Pleine largeur', value: 'full' },
        { label: 'Centré', value: 'centered' },
        { label: 'Deux colonnes', value: 'twoColumns' },
        { label: 'Texte + Image', value: 'textImage' },
        { label: 'Image + Texte', value: 'imageText' },
      ],
    },
    {
      name: 'backgroundColor',
      label: 'Couleur de fond',
      type: 'select',
      defaultValue: 'transparent',
      options: [
        { label: 'Transparent', value: 'transparent' },
        { label: 'Gris clair', value: 'muted' },
        { label: 'Turquoise clair', value: 'primary-light' },
        { label: 'Noir', value: 'dark' },
      ],
    },
    {
      name: 'content',
      label: 'Contenu',
      type: 'richText',
      required: true,
      localized: true,
    },
    {
      name: 'secondColumn',
      label: 'Deuxième colonne',
      type: 'richText',
      localized: true,
      admin: {
        condition: (_, siblingData) => siblingData?.layout === 'twoColumns',
      },
    },
    {
      name: 'image',
      label: 'Image',
      type: 'upload',
      relationTo: 'media',
      admin: {
        condition: (_, siblingData) => 
          siblingData?.layout === 'textImage' || siblingData?.layout === 'imageText',
      },
    },
    {
      name: 'imagePosition',
      label: "Position de l'image",
      type: 'select',
      defaultValue: 'right',
      options: [
        { label: 'Gauche', value: 'left' },
        { label: 'Droite', value: 'right' },
      ],
      admin: {
        condition: (_, siblingData) => 
          siblingData?.layout === 'textImage' || siblingData?.layout === 'imageText',
      },
    },
  ],
}
