import type { CollectionConfig } from 'payload'
import { isAdmin, isAdminOrSelf } from '../access/roles'

export const Users: CollectionConfig = {
  slug: 'users',
  labels: {
    singular: 'Utilisateur',
    plural: 'Utilisateurs',
  },
  admin: {
    useAsTitle: 'name',
    defaultColumns: ['name', 'email', 'role', 'createdAt'],
    group: 'Administration',
  },
  auth: {
    tokenExpiration: 7200, // 2 hours
    maxLoginAttempts: 5,
    lockTime: 600000, // 10 minutes
    cookies: {
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
    },
  },
  access: {
    read: isAdminOrSelf,
    create: isAdmin,
    update: isAdminOrSelf,
    delete: isAdmin,
    admin: ({ req: { user } }) => {
      if (!user) return false
      return ['admin', 'super_admin', 'editor', 'manager'].includes(user.role)
    },
  },
  fields: [
    {
      name: 'name',
      label: 'Nom complet',
      type: 'text',
      required: true,
    },
    {
      name: 'role',
      label: 'Rôle',
      type: 'select',
      required: true,
      defaultValue: 'user',
      options: [
        { label: 'Utilisateur', value: 'user' },
        { label: 'Éditeur', value: 'editor' },
        { label: 'Manager', value: 'manager' },
        { label: 'Administrateur', value: 'admin' },
        { label: 'Super Admin', value: 'super_admin' },
      ],
      access: {
        update: isAdmin,
      },
    },
    {
      name: 'avatar',
      label: 'Avatar',
      type: 'upload',
      relationTo: 'media',
    },
    {
      name: 'phone',
      label: 'Téléphone',
      type: 'text',
    },
    {
      name: 'position',
      label: 'Poste',
      type: 'text',
    },
    {
      type: 'row',
      fields: [
        {
          name: 'linkedin',
          label: 'LinkedIn',
          type: 'text',
          admin: { width: '50%' },
        },
        {
          name: 'twitter',
          label: 'Twitter',
          type: 'text',
          admin: { width: '50%' },
        },
      ],
    },
    {
      name: 'bio',
      label: 'Bio',
      type: 'textarea',
    },
    {
      name: 'notifications',
      label: 'Notifications',
      type: 'group',
      fields: [
        {
          name: 'newCandidates',
          label: 'Nouveaux candidats',
          type: 'checkbox',
          defaultValue: true,
        },
        {
          name: 'newApplications',
          label: 'Nouvelles candidatures',
          type: 'checkbox',
          defaultValue: true,
        },
        {
          name: 'newMessages',
          label: 'Nouveaux messages',
          type: 'checkbox',
          defaultValue: true,
        },
      ],
    },
  ],
  timestamps: true,
}
