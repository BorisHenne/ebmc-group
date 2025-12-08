'use client'

import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { Key, Plus, Trash2, Loader2, X, Copy, CheckCircle, Clock } from 'lucide-react'

interface ApiToken {
  _id: string
  name: string
  token: string
  permissions: string[]
  expiresAt: string | null
  createdAt: string
  createdBy: string
  lastUsedAt: string | null
  usageCount: number
}

const availablePermissions = [
  { value: 'read', label: 'Lecture' },
  { value: 'write', label: 'Écriture' },
  { value: 'delete', label: 'Suppression' },
  { value: 'jobs:read', label: 'Lire les offres' },
  { value: 'jobs:write', label: 'Modifier les offres' },
  { value: 'consultants:read', label: 'Lire les consultants' },
  { value: 'consultants:write', label: 'Modifier les consultants' },
  { value: 'webhooks:trigger', label: 'Déclencher webhooks' },
]

const expirationOptions = [
  { value: '', label: 'Jamais' },
  { value: '7', label: '7 jours' },
  { value: '30', label: '30 jours' },
  { value: '90', label: '90 jours' },
  { value: '365', label: '1 an' },
]

export default function ApiTokensPage() {
  const [tokens, setTokens] = useState<ApiToken[]>([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [newToken, setNewToken] = useState<string | null>(null)
  const [copied, setCopied] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    permissions: ['read'],
    expiresIn: ''
  })
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    fetchTokens()
  }, [])

  const fetchTokens = async () => {
    try {
      const res = await fetch('/api/admin/api-tokens', { credentials: 'include' })
      if (res.ok) {
        const data = await res.json()
        setTokens(data.tokens || [])
      }
    } catch (error) {
      console.error('Error fetching tokens:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)

    try {
      const res = await fetch('/api/admin/api-tokens', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(formData)
      })

      const data = await res.json()

      if (res.ok) {
        setNewToken(data.token)
        fetchTokens()
      }
    } catch (error) {
      console.error('Error creating token:', error)
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer ce token ?')) return

    try {
      await fetch(`/api/admin/api-tokens/${id}`, { method: 'DELETE', credentials: 'include' })
      fetchTokens()
    } catch (error) {
      console.error('Error deleting token:', error)
    }
  }

  const copyToken = () => {
    if (newToken) {
      navigator.clipboard.writeText(newToken)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  const togglePermission = (perm: string) => {
    if (formData.permissions.includes(perm)) {
      setFormData({ ...formData, permissions: formData.permissions.filter(p => p !== perm) })
    } else {
      setFormData({ ...formData, permissions: [...formData.permissions, perm] })
    }
  }

  const closeModal = () => {
    setShowModal(false)
    setNewToken(null)
    setFormData({ name: '', permissions: ['read'], expiresIn: '' })
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Tokens API</h1>
          <p className="text-gray-600 mt-2">Gérez les tokens d&apos;accès à l&apos;API</p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
        >
          <Plus className="w-5 h-5" />
          Nouveau token
        </button>
      </div>

      {/* Info Box */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
        <p className="text-sm text-blue-800">
          <strong>Utilisation :</strong> Ajoutez le token dans le header de vos requêtes API :
          <code className="ml-2 px-2 py-1 bg-blue-100 rounded">Authorization: Bearer votre_token</code>
        </p>
      </div>

      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        {loading ? (
          <div className="flex justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
          </div>
        ) : tokens.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            <Key className="w-12 h-12 mx-auto mb-4 opacity-50" />
            Aucun token API configuré
          </div>
        ) : (
          <div className="divide-y">
            {tokens.map((token) => (
              <motion.div
                key={token._id}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="p-6 hover:bg-gray-50"
              >
                <div className="flex justify-between items-start">
                  <div>
                    <div className="flex items-center gap-3">
                      <Key className="w-5 h-5 text-amber-500" />
                      <span className="font-medium text-gray-900">{token.name}</span>
                    </div>
                    <p className="text-sm text-gray-500 mt-1 font-mono">{token.token}</p>
                    <div className="flex flex-wrap gap-1 mt-2">
                      {token.permissions?.map((perm) => (
                        <span key={perm} className="px-2 py-0.5 bg-amber-100 text-amber-700 text-xs rounded">
                          {perm}
                        </span>
                      ))}
                    </div>
                    <div className="flex gap-4 mt-2 text-xs text-gray-400">
                      <span>Créé par {token.createdBy}</span>
                      <span>Utilisé {token.usageCount} fois</span>
                      {token.expiresAt && (
                        <span className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          Expire le {new Date(token.expiresAt).toLocaleDateString('fr-FR')}
                        </span>
                      )}
                    </div>
                  </div>
                  <button
                    onClick={() => handleDelete(token._id)}
                    className="p-2 text-red-500 hover:bg-red-50 rounded-lg"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      {/* Create Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-xl shadow-xl w-full max-w-lg"
          >
            <div className="flex justify-between items-center p-6 border-b">
              <h2 className="text-xl font-semibold">
                {newToken ? 'Token créé' : 'Nouveau token API'}
              </h2>
              <button onClick={closeModal}>
                <X className="w-6 h-6 text-gray-400 hover:text-gray-600" />
              </button>
            </div>

            {newToken ? (
              <div className="p-6">
                <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mb-4">
                  <p className="text-sm text-amber-800 mb-2">
                    <strong>Important :</strong> Copiez ce token maintenant. Il ne sera plus affiché.
                  </p>
                </div>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={newToken}
                    readOnly
                    className="flex-1 px-3 py-2 border rounded-lg bg-gray-50 font-mono text-sm"
                  />
                  <button
                    onClick={copyToken}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
                  >
                    {copied ? <CheckCircle className="w-5 h-5" /> : <Copy className="w-5 h-5" />}
                  </button>
                </div>
              </div>
            ) : (
              <form onSubmit={handleCreate} className="p-6 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Nom du token</label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                    placeholder="Mon application"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Expiration</label>
                  <select
                    value={formData.expiresIn}
                    onChange={(e) => setFormData({ ...formData, expiresIn: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                  >
                    {expirationOptions.map(opt => (
                      <option key={opt.value} value={opt.value}>{opt.label}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Permissions</label>
                  <div className="space-y-2 max-h-48 overflow-y-auto">
                    {availablePermissions.map((perm) => (
                      <label key={perm.value} className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={formData.permissions.includes(perm.value)}
                          onChange={() => togglePermission(perm.value)}
                          className="w-4 h-4 text-blue-600 rounded"
                        />
                        <span className="text-sm text-gray-700">{perm.label}</span>
                      </label>
                    ))}
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={saving}
                  className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition disabled:opacity-50"
                >
                  {saving ? <Loader2 className="w-5 h-5 animate-spin" /> : <Key className="w-5 h-5" />}
                  Créer le token
                </button>
              </form>
            )}
          </motion.div>
        </div>
      )}
    </div>
  )
}
