'use client'

import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Users,
  Plus,
  Trash2,
  Edit,
  Loader2,
  X,
  Save,
  Mail,
  Shield,
  Search,
  AlertCircle,
  Building2,
  UserCheck,
  Briefcase,
  SearchIcon,
  UserCog,
  Zap,
  UserPlus,
  Filter
} from 'lucide-react'
import {
  ROLES,
  ROLE_LABELS,
  ROLE_COLORS,
  ROLE_CATEGORIES,
  RoleType,
  RoleCategory,
  getRolesByCategory,
  getRoleCategory,
  isBureauRole,
  isTerrainRole
} from '@/lib/roles'

interface User {
  _id: string
  email: string
  name: string
  role: string
  createdAt: string
  updatedAt?: string
  candidateId?: string // Link to candidate profile for terrain roles
}

const emptyFormData = {
  email: '',
  name: '',
  password: '',
  role: 'commercial'
}

// Role icons mapping
const ROLE_ICONS: Record<string, React.ReactNode> = {
  admin: <Shield className="w-4 h-4" />,
  commercial: <Briefcase className="w-4 h-4" />,
  sourceur: <SearchIcon className="w-4 h-4" />,
  rh: <UserCog className="w-4 h-4" />,
  consultant_cdi: <UserCheck className="w-4 h-4" />,
  freelance: <Zap className="w-4 h-4" />,
  candidat: <UserPlus className="w-4 h-4" />
}

export default function UsersPage() {
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [editingUser, setEditingUser] = useState<User | null>(null)
  const [formData, setFormData] = useState(emptyFormData)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [searchTerm, setSearchTerm] = useState('')
  const [filterRole, setFilterRole] = useState<string>('all')
  const [filterCategory, setFilterCategory] = useState<RoleCategory | 'all'>('all')

  useEffect(() => {
    fetchUsers()
  }, [])

  const fetchUsers = async () => {
    try {
      const res = await fetch('/api/admin/users', { credentials: 'include' })
      if (res.ok) {
        const data = await res.json()
        setUsers(data.users || [])
      }
    } catch (error) {
      console.error('Error fetching users:', error)
    } finally {
      setLoading(false)
    }
  }

  const openCreateModal = () => {
    setEditingUser(null)
    setFormData(emptyFormData)
    setError('')
    setShowModal(true)
  }

  const openEditModal = (user: User) => {
    setEditingUser(user)
    setFormData({
      email: user.email,
      name: user.name,
      password: '',
      role: user.role
    })
    setError('')
    setShowModal(true)
  }

  const closeModal = () => {
    setShowModal(false)
    setEditingUser(null)
    setFormData(emptyFormData)
    setError('')
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    setError('')

    try {
      const url = editingUser
        ? `/api/admin/users/${editingUser._id}`
        : '/api/admin/users'

      const method = editingUser ? 'PUT' : 'POST'

      // For create, password is required
      if (!editingUser && !formData.password) {
        setError('Le mot de passe est requis')
        setSaving(false)
        return
      }

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(formData)
      })

      const data = await res.json()

      if (!res.ok) {
        setError(data.error || 'Une erreur est survenue')
        setSaving(false)
        return
      }

      closeModal()
      fetchUsers()
    } catch (error) {
      console.error('Error saving user:', error)
      setError('Erreur de connexion au serveur')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (user: User) => {
    if (!confirm(`Êtes-vous sûr de vouloir supprimer l'utilisateur "${user.name}" ?`)) return

    try {
      const res = await fetch(`/api/admin/users/${user._id}`, {
        method: 'DELETE',
        credentials: 'include'
      })

      const data = await res.json()

      if (!res.ok) {
        alert(data.error || 'Erreur lors de la suppression')
        return
      }

      fetchUsers()
    } catch (error) {
      console.error('Error deleting user:', error)
      alert('Erreur de connexion au serveur')
    }
  }

  // Filter users
  const filteredUsers = users.filter(user => {
    const matchesSearch = user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesRole = filterRole === 'all' || user.role === filterRole
    const matchesCategory = filterCategory === 'all' || getRoleCategory(user.role) === filterCategory
    return matchesSearch && matchesRole && matchesCategory
  })

  // Group users by category
  const bureauUsers = filteredUsers.filter(u => isBureauRole(u.role))
  const terrainUsers = filteredUsers.filter(u => isTerrainRole(u.role))

  // Count by category
  const bureauCount = users.filter(u => isBureauRole(u.role)).length
  const terrainCount = users.filter(u => isTerrainRole(u.role)).length

  const getRoleBadgeClass = (role: string) => {
    const colors = ROLE_COLORS[role as RoleType] || 'from-slate-500 to-slate-600'
    return `bg-gradient-to-r ${colors} text-white`
  }

  const renderUserRow = (user: User, index: number) => (
    <motion.tr
      key={user._id}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.03 }}
      onClick={() => openEditModal(user)}
      className="hover:bg-gray-50/50 dark:hover:bg-slate-700/50 transition cursor-pointer"
    >
      <td className="px-6 py-4">
        <div className="flex items-center gap-3">
          <div className={`w-10 h-10 rounded-full bg-gradient-to-r ${ROLE_COLORS[user.role as RoleType] || 'from-slate-500 to-slate-600'} flex items-center justify-center`}>
            <span className="text-white font-bold text-sm">
              {user.name?.charAt(0).toUpperCase() || user.email?.charAt(0).toUpperCase()}
            </span>
          </div>
          <span className="font-medium text-gray-900 dark:text-white">{user.name}</span>
        </div>
      </td>
      <td className="px-6 py-4">
        <div className="flex items-center gap-2 text-gray-600 dark:text-gray-300">
          <Mail className="w-4 h-4 text-gray-400 dark:text-gray-500" />
          {user.email}
        </div>
      </td>
      <td className="px-6 py-4">
        <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium ${getRoleBadgeClass(user.role)}`}>
          {ROLE_ICONS[user.role] || <Shield className="w-3 h-3" />}
          {ROLE_LABELS[user.role as RoleType] || user.role}
        </span>
      </td>
      <td className="px-6 py-4 text-gray-500 dark:text-gray-400 text-sm">
        {new Date(user.createdAt).toLocaleDateString('fr-FR', {
          day: 'numeric',
          month: 'short',
          year: 'numeric'
        })}
      </td>
      <td className="px-6 py-4">
        <div className="flex justify-end gap-2">
          <button
            onClick={(e) => { e.stopPropagation(); handleDelete(user); }}
            className="p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition"
            title="Supprimer"
          >
            <Trash2 className="w-5 h-5" />
          </button>
        </div>
      </td>
    </motion.tr>
  )

  const bureauRoles = getRolesByCategory('bureau')
  const terrainRoles = getRolesByCategory('terrain')

  return (
    <div>
      {/* Header */}
      <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4 mb-8">
        <div>
          <div className="flex items-center gap-3">
            <div className="p-2 bg-gradient-to-r from-orange-500 to-amber-500 rounded-xl">
              <Users className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white">Utilisateurs</h1>
              <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">{users.length} utilisateur{users.length > 1 ? 's' : ''} au total</p>
            </div>
          </div>
        </div>
        <button
          onClick={openCreateModal}
          className="flex items-center justify-center gap-2 bg-gradient-to-r from-ebmc-turquoise to-cyan-500 text-white px-5 py-2.5 rounded-xl hover:shadow-lg hover:shadow-ebmc-turquoise/25 transition-all font-medium"
        >
          <Plus className="w-5 h-5" />
          Nouvel utilisateur
        </button>
      </div>

      {/* Category Stats */}
      <div className="grid md:grid-cols-2 gap-4 mb-6">
        <motion.button
          onClick={() => setFilterCategory(filterCategory === 'bureau' ? 'all' : 'bureau')}
          className={`glass-card p-4 text-left transition-all ${filterCategory === 'bureau' ? 'ring-2 ring-blue-500' : ''}`}
          whileHover={{ scale: 1.01 }}
          whileTap={{ scale: 0.99 }}
        >
          <div className="flex items-center gap-3">
            <div className="p-2 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-xl">
              <Building2 className="w-5 h-5 text-white" />
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-gray-900 dark:text-white">Bureau</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400">{ROLE_CATEGORIES.bureau.description}</p>
            </div>
            <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">{bureauCount}</div>
          </div>
          <div className="flex flex-wrap gap-2 mt-3">
            {bureauRoles.map(role => {
              const count = users.filter(u => u.role === role.id).length
              return count > 0 ? (
                <span key={role.id} className="text-xs px-2 py-1 bg-gray-100 dark:bg-slate-700 text-gray-600 dark:text-gray-300 rounded">
                  {role.label}: {count}
                </span>
              ) : null
            })}
          </div>
        </motion.button>

        <motion.button
          onClick={() => setFilterCategory(filterCategory === 'terrain' ? 'all' : 'terrain')}
          className={`glass-card p-4 text-left transition-all ${filterCategory === 'terrain' ? 'ring-2 ring-green-500' : ''}`}
          whileHover={{ scale: 1.01 }}
          whileTap={{ scale: 0.99 }}
        >
          <div className="flex items-center gap-3">
            <div className="p-2 bg-gradient-to-r from-green-500 to-emerald-500 rounded-xl">
              <UserCheck className="w-5 h-5 text-white" />
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-gray-900 dark:text-white">Terrain</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400">{ROLE_CATEGORIES.terrain.description}</p>
            </div>
            <div className="text-2xl font-bold text-green-600 dark:text-green-400">{terrainCount}</div>
          </div>
          <div className="flex flex-wrap gap-2 mt-3">
            {terrainRoles.map(role => {
              const count = users.filter(u => u.role === role.id).length
              return count > 0 ? (
                <span key={role.id} className="text-xs px-2 py-1 bg-gray-100 dark:bg-slate-700 text-gray-600 dark:text-gray-300 rounded">
                  {role.label}: {count}
                </span>
              ) : null
            })}
          </div>
        </motion.button>
      </div>

      {/* Filters */}
      <div className="glass-card p-4 mb-6">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 dark:text-gray-500" />
            <input
              type="text"
              placeholder="Rechercher par nom ou email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 border border-gray-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-ebmc-turquoise/20 focus:border-ebmc-turquoise outline-none transition bg-white dark:bg-slate-800 text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-500"
            />
          </div>
          <div className="flex items-center gap-2">
            <Filter className="w-5 h-5 text-gray-400" />
            <select
              value={filterRole}
              onChange={(e) => setFilterRole(e.target.value)}
              className="px-4 py-2.5 border border-gray-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-ebmc-turquoise/20 focus:border-ebmc-turquoise outline-none transition bg-white dark:bg-slate-800 text-gray-900 dark:text-white"
            >
              <option value="all">Tous les rôles</option>
              <optgroup label="Bureau">
                {bureauRoles.map(role => (
                  <option key={role.id} value={role.id}>{role.label}</option>
                ))}
              </optgroup>
              <optgroup label="Terrain">
                {terrainRoles.map(role => (
                  <option key={role.id} value={role.id}>{role.label}</option>
                ))}
              </optgroup>
            </select>
          </div>
          {filterCategory !== 'all' && (
            <button
              onClick={() => setFilterCategory('all')}
              className="px-4 py-2.5 bg-gray-100 dark:bg-slate-700 text-gray-600 dark:text-gray-300 rounded-xl hover:bg-gray-200 dark:hover:bg-slate-600 transition text-sm font-medium"
            >
              Effacer le filtre
            </button>
          )}
        </div>
      </div>

      {/* Users Tables - Show separately if filtering by category */}
      {filterCategory === 'all' ? (
        // Show all users in one table
        <div className="glass-card overflow-hidden">
          {loading ? (
            <div className="flex justify-center py-12">
              <Loader2 className="w-8 h-8 animate-spin text-ebmc-turquoise" />
            </div>
          ) : filteredUsers.length === 0 ? (
            <div className="text-center py-12">
              <Users className="w-12 h-12 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
              <p className="text-gray-500 dark:text-gray-400">
                {searchTerm || filterRole !== 'all'
                  ? 'Aucun utilisateur ne correspond aux critères'
                  : 'Aucun utilisateur trouvé'}
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50/80 dark:bg-slate-800/80 border-b border-gray-100 dark:border-slate-700">
                  <tr>
                    <th className="text-left px-6 py-4 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Utilisateur</th>
                    <th className="text-left px-6 py-4 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Email</th>
                    <th className="text-left px-6 py-4 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Rôle</th>
                    <th className="text-left px-6 py-4 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Créé le</th>
                    <th className="text-right px-6 py-4 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-slate-700">
                  {filteredUsers.map((user, index) => renderUserRow(user, index))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      ) : (
        // Show filtered category
        <div className="glass-card overflow-hidden">
          <div className="p-4 border-b border-gray-100 dark:border-slate-700 bg-gray-50/50 dark:bg-slate-800/50">
            <h3 className="font-semibold text-gray-900 dark:text-white flex items-center gap-2">
              {filterCategory === 'bureau' ? (
                <>
                  <Building2 className="w-5 h-5 text-blue-500" />
                  Équipe Bureau ({bureauUsers.length})
                </>
              ) : (
                <>
                  <UserCheck className="w-5 h-5 text-green-500" />
                  Équipe Terrain ({terrainUsers.length})
                </>
              )}
            </h3>
          </div>
          {loading ? (
            <div className="flex justify-center py-12">
              <Loader2 className="w-8 h-8 animate-spin text-ebmc-turquoise" />
            </div>
          ) : (filterCategory === 'bureau' ? bureauUsers : terrainUsers).length === 0 ? (
            <div className="text-center py-12">
              <Users className="w-12 h-12 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
              <p className="text-gray-500 dark:text-gray-400">Aucun utilisateur dans cette catégorie</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50/80 dark:bg-slate-800/80 border-b border-gray-100 dark:border-slate-700">
                  <tr>
                    <th className="text-left px-6 py-4 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Utilisateur</th>
                    <th className="text-left px-6 py-4 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Email</th>
                    <th className="text-left px-6 py-4 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Rôle</th>
                    <th className="text-left px-6 py-4 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Créé le</th>
                    <th className="text-right px-6 py-4 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-slate-700">
                  {(filterCategory === 'bureau' ? bureauUsers : terrainUsers).map((user, index) => renderUserRow(user, index))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Create/Edit Modal */}
      <AnimatePresence>
        {showModal && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl w-full max-w-md overflow-hidden"
            >
              {/* Modal Header */}
              <div className="flex justify-between items-center p-6 border-b border-gray-100 dark:border-slate-700">
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-xl bg-gradient-to-r ${editingUser ? 'from-blue-500 to-indigo-500' : 'from-ebmc-turquoise to-cyan-500'}`}>
                    {editingUser ? <Edit className="w-5 h-5 text-white" /> : <Plus className="w-5 h-5 text-white" />}
                  </div>
                  <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                    {editingUser ? 'Modifier l\'utilisateur' : 'Nouvel utilisateur'}
                  </h2>
                </div>
                <button
                  onClick={closeModal}
                  className="p-2 hover:bg-gray-100 dark:hover:bg-slate-700 rounded-lg transition"
                >
                  <X className="w-5 h-5 text-gray-400 dark:text-gray-500" />
                </button>
              </div>

              {/* Modal Body */}
              <form onSubmit={handleSubmit} className="p-6 space-y-5">
                {/* Error Alert */}
                {error && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex items-center gap-3 p-4 bg-red-50 dark:bg-red-900/20 border border-red-100 dark:border-red-800 rounded-xl text-red-600 dark:text-red-400"
                  >
                    <AlertCircle className="w-5 h-5 flex-shrink-0" />
                    <span className="text-sm">{error}</span>
                  </motion.div>
                )}

                {/* Name */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Nom complet
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-ebmc-turquoise/20 focus:border-ebmc-turquoise outline-none transition bg-white dark:bg-slate-700 text-gray-900 dark:text-white"
                    placeholder="Jean Dupont"
                    required
                  />
                </div>

                {/* Email */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Adresse email
                  </label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-ebmc-turquoise/20 focus:border-ebmc-turquoise outline-none transition bg-white dark:bg-slate-700 text-gray-900 dark:text-white"
                    placeholder="jean@exemple.com"
                    required
                  />
                </div>

                {/* Password */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Mot de passe
                    {editingUser && <span className="text-gray-400 dark:text-gray-500 font-normal ml-1">(laisser vide pour ne pas changer)</span>}
                  </label>
                  <input
                    type="password"
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-ebmc-turquoise/20 focus:border-ebmc-turquoise outline-none transition bg-white dark:bg-slate-700 text-gray-900 dark:text-white"
                    placeholder="••••••••"
                    required={!editingUser}
                  />
                </div>

                {/* Role */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Rôle
                  </label>
                  <select
                    value={formData.role}
                    onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-ebmc-turquoise/20 focus:border-ebmc-turquoise outline-none transition bg-white dark:bg-slate-700 text-gray-900 dark:text-white"
                  >
                    <optgroup label="🏢 Bureau">
                      {bureauRoles.map(role => (
                        <option key={role.id} value={role.id}>{role.label}</option>
                      ))}
                    </optgroup>
                    <optgroup label="👷 Terrain">
                      {terrainRoles.map(role => (
                        <option key={role.id} value={role.id}>{role.label}</option>
                      ))}
                    </optgroup>
                  </select>
                  <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">
                    {ROLES[formData.role as RoleType]?.description || ''}
                  </p>
                </div>

                {/* Actions */}
                <div className="flex gap-3 pt-4">
                  <button
                    type="button"
                    onClick={closeModal}
                    className="flex-1 px-4 py-3 border border-gray-200 dark:border-slate-700 text-gray-700 dark:text-gray-300 rounded-xl hover:bg-gray-50 dark:hover:bg-slate-700 transition font-medium"
                  >
                    Annuler
                  </button>
                  <button
                    type="submit"
                    disabled={saving}
                    className="flex-1 flex items-center justify-center gap-2 bg-gradient-to-r from-ebmc-turquoise to-cyan-500 text-white px-4 py-3 rounded-xl hover:shadow-lg hover:shadow-ebmc-turquoise/25 transition disabled:opacity-50 font-medium"
                  >
                    {saving ? (
                      <>
                        <Loader2 className="w-5 h-5 animate-spin" />
                        {editingUser ? 'Mise à jour...' : 'Création...'}
                      </>
                    ) : (
                      <>
                        <Save className="w-5 h-5" />
                        {editingUser ? 'Mettre à jour' : 'Créer'}
                      </>
                    )}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  )
}
