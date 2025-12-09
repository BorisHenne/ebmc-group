'use client'

import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { Shield, Plus, Trash2, Edit, Loader2, X, Save } from 'lucide-react'

interface Role {
  _id: string
  name: string
  label: string
  permissions: string[]
  createdAt: string
}

const availablePermissions = [
  { value: '*', label: 'Toutes les permissions (Admin)' },
  { value: 'dashboard:view', label: 'Voir le tableau de bord' },
  { value: 'candidates:view', label: 'Voir les candidats' },
  { value: 'candidates:manage', label: 'Gérer les candidats' },
  { value: 'recruitment:manage', label: 'Gérer le recrutement (Kanban)' },
  { value: 'freelance:portal', label: 'Accès portail Freelance' },
  { value: 'freelance:timesheets', label: 'Gérer ses CRA' },
  { value: 'commercial:view', label: 'Voir les opportunités commerciales' },
  { value: 'commercial:manage', label: 'Gérer les opportunités' },
  { value: 'users:manage', label: 'Gérer les utilisateurs' },
  { value: 'roles:manage', label: 'Gérer les rôles' },
  { value: 'settings:manage', label: 'Gérer les paramètres' },
  { value: 'api:manage', label: 'Gérer les tokens API' },
]

export default function RolesPage() {
  const [roles, setRoles] = useState<Role[]>([])
  const [loading, setLoading] = useState(true)
  const [editingRole, setEditingRole] = useState<Partial<Role> | null>(null)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    fetchRoles()
  }, [])

  const fetchRoles = async () => {
    try {
      const res = await fetch('/api/admin/roles', { credentials: 'include' })
      if (res.ok) {
        const data = await res.json()
        setRoles(data.roles || [])
      }
    } catch (error) {
      console.error('Error fetching roles:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSave = async () => {
    if (!editingRole) return
    setSaving(true)

    try {
      const method = editingRole._id ? 'PUT' : 'POST'
      const url = editingRole._id
        ? `/api/admin/roles/${editingRole._id}`
        : '/api/admin/roles'

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(editingRole)
      })

      if (res.ok) {
        fetchRoles()
        setEditingRole(null)
      }
    } catch (error) {
      console.error('Error saving role:', error)
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer ce rôle ?')) return

    try {
      await fetch(`/api/admin/roles/${id}`, { method: 'DELETE', credentials: 'include' })
      fetchRoles()
    } catch (error) {
      console.error('Error deleting role:', error)
    }
  }

  const togglePermission = (permission: string) => {
    if (!editingRole) return
    const perms = editingRole.permissions || []
    if (perms.includes(permission)) {
      setEditingRole({ ...editingRole, permissions: perms.filter(p => p !== permission) })
    } else {
      setEditingRole({ ...editingRole, permissions: [...perms, permission] })
    }
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Rôles utilisateurs</h1>
          <p className="text-gray-600 dark:text-gray-300 mt-2">
            Gérez les rôles et permissions des utilisateurs (Admin, Sourceur, Commercial, Freelance)
          </p>
        </div>
        <button
          onClick={() => setEditingRole({ name: '', label: '', permissions: [] })}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
        >
          <Plus className="w-5 h-5" />
          Nouveau rôle
        </button>
      </div>

      <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm overflow-hidden">
        {loading ? (
          <div className="flex justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
          </div>
        ) : roles.length === 0 ? (
          <div className="text-center py-12 text-gray-500 dark:text-gray-400">
            <Shield className="w-12 h-12 mx-auto mb-4 opacity-50" />
            Aucun rôle configuré
          </div>
        ) : (
          <div className="divide-y divide-gray-100 dark:divide-slate-700">
            {roles.map((role) => (
              <motion.div
                key={role._id}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="p-6 hover:bg-gray-50 dark:hover:bg-slate-700"
              >
                <div className="flex justify-between items-start">
                  <div>
                    <div className="flex items-center gap-3">
                      <Shield className="w-5 h-5 text-blue-500" />
                      <span className="font-medium text-gray-900 dark:text-white">{role.label}</span>
                      <span className="px-2 py-0.5 bg-gray-100 dark:bg-slate-700 text-gray-600 dark:text-gray-300 text-xs rounded-full">
                        {role.name}
                      </span>
                    </div>
                    <div className="flex flex-wrap gap-1 mt-2">
                      {role.permissions?.map((perm) => (
                        <span key={perm} className="px-2 py-0.5 bg-blue-100 text-blue-700 text-xs rounded">
                          {perm}
                        </span>
                      ))}
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => setEditingRole(role)}
                      className="p-2 text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg"
                    >
                      <Edit className="w-5 h-5" />
                    </button>
                    {role.name !== 'admin' && (
                      <button
                        onClick={() => handleDelete(role._id)}
                        className="p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    )}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      {/* Edit Modal */}
      {editingRole && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white dark:bg-slate-800 rounded-xl shadow-xl w-full max-w-lg"
          >
            <div className="flex justify-between items-center p-6 border-b border-gray-200 dark:border-slate-700">
              <h2 className="text-xl font-semibold">
                {editingRole._id ? 'Modifier le rôle' : 'Nouveau rôle'}
              </h2>
              <button onClick={() => setEditingRole(null)}>
                <X className="w-6 h-6 text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300" />
              </button>
            </div>

            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Identifiant</label>
                <input
                  type="text"
                  value={editingRole.name || ''}
                  onChange={(e) => setEditingRole({ ...editingRole, name: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="editor"
                  disabled={editingRole._id !== undefined}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Nom affiché</label>
                <input
                  type="text"
                  value={editingRole.label || ''}
                  onChange={(e) => setEditingRole({ ...editingRole, label: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="Éditeur"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Permissions</label>
                <div className="space-y-2 max-h-48 overflow-y-auto">
                  {availablePermissions.map((perm) => (
                    <label key={perm.value} className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={editingRole.permissions?.includes(perm.value) || false}
                        onChange={() => togglePermission(perm.value)}
                        className="w-4 h-4 text-blue-600 rounded"
                      />
                      <span className="text-sm text-gray-700 dark:text-gray-300">{perm.label}</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-3 p-6 border-t border-gray-200 dark:border-slate-700 bg-gray-50 dark:bg-slate-800">
              <button
                onClick={() => setEditingRole(null)}
                className="px-4 py-2 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-slate-600 rounded-lg transition"
              >
                Annuler
              </button>
              <button
                onClick={handleSave}
                disabled={saving}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition disabled:opacity-50"
              >
                {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                Enregistrer
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  )
}
