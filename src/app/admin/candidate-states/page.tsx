'use client'

import { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence, Reorder } from 'framer-motion'
import {
  Tags,
  Plus,
  Edit2,
  Trash2,
  Save,
  X,
  GripVertical,
  Eye,
  EyeOff,
  AlertCircle,
  Loader2,
  RefreshCw,
  Check,
  Palette,
  Cloud,
  CloudDownload
} from 'lucide-react'

interface CandidateState {
  _id?: string
  id: number
  value: string
  color: number
  isEnabled: boolean
  isExcludedFromSentState: boolean
  reason: string[]
  order: number
}

interface ColorOption {
  name: string
  hex: string
  tailwind: string
}

export default function CandidateStatesPage() {
  const [states, setStates] = useState<CandidateState[]>([])
  const [colors, setColors] = useState<Record<number, ColorOption>>({})
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [syncing, setSyncing] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)
  const [editingState, setEditingState] = useState<CandidateState | null>(null)
  const [isCreating, setIsCreating] = useState(false)
  const [hasOrderChanges, setHasOrderChanges] = useState(false)
  const [showColorPicker, setShowColorPicker] = useState<string | null>(null)

  // Formulaire pour création/édition
  const [formData, setFormData] = useState({
    value: '',
    color: 0,
    isEnabled: true,
    isExcludedFromSentState: false
  })

  const fetchStates = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      const res = await fetch('/api/admin/candidate-states')
      if (!res.ok) throw new Error('Erreur lors du chargement')
      const data = await res.json()
      setStates(data.states || [])
      setColors(data.colors || {})
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur inconnue')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchStates()
  }, [fetchStates])

  const syncFromBoond = async () => {
    try {
      setSyncing(true)
      setError(null)
      setSuccessMessage(null)
      const res = await fetch('/api/admin/candidate-states?sync=true')
      if (!res.ok) throw new Error('Erreur lors de la synchronisation')
      const data = await res.json()
      setStates(data.states || [])
      setColors(data.colors || {})
      setSuccessMessage(`Synchronisation réussie - ${data.states?.length || 0} états chargés depuis BoondManager`)
      setTimeout(() => setSuccessMessage(null), 5000)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur inconnue')
    } finally {
      setSyncing(false)
    }
  }

  const handleReorder = (newOrder: CandidateState[]) => {
    setStates(newOrder)
    setHasOrderChanges(true)
  }

  const saveOrder = async () => {
    try {
      setSaving(true)
      const orderedStates = states.map((state: CandidateState, index: number) => ({
        _id: state._id,
        id: state.id,
        order: index
      }))

      const res = await fetch('/api/admin/candidate-states', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ states: orderedStates })
      })

      if (!res.ok) throw new Error('Erreur lors de la sauvegarde')
      setHasOrderChanges(false)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur inconnue')
    } finally {
      setSaving(false)
    }
  }

  const handleCreate = async () => {
    if (!formData.value.trim()) {
      setError('Le nom est requis')
      return
    }

    try {
      setSaving(true)
      setError(null)
      const res = await fetch('/api/admin/candidate-states', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      })

      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || 'Erreur lors de la création')
      }

      const data = await res.json()
      setStates([...states, data.state])
      setIsCreating(false)
      setFormData({ value: '', color: 0, isEnabled: true, isExcludedFromSentState: false })
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur inconnue')
    } finally {
      setSaving(false)
    }
  }

  const handleUpdate = async () => {
    if (!editingState) return

    try {
      setSaving(true)
      setError(null)
      const res = await fetch('/api/admin/candidate-states', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          _id: editingState._id,
          id: editingState.id,
          ...formData
        })
      })

      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || 'Erreur lors de la mise à jour')
      }

      setStates(states.map((s: CandidateState) =>
        (s._id === editingState._id || s.id === editingState.id)
          ? { ...s, ...formData }
          : s
      ))
      setEditingState(null)
      setFormData({ value: '', color: 0, isEnabled: true, isExcludedFromSentState: false })
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur inconnue')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (state: CandidateState) => {
    if (!confirm(`Supprimer l'état "${state.value}" ?`)) return

    try {
      setSaving(true)
      setError(null)
      const params = state._id ? `_id=${state._id}` : `id=${state.id}`
      const res = await fetch(`/api/admin/candidate-states?${params}`, {
        method: 'DELETE'
      })

      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || 'Erreur lors de la suppression')
      }

      setStates(states.filter((s: CandidateState) => s._id !== state._id && s.id !== state.id))
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur inconnue')
    } finally {
      setSaving(false)
    }
  }

  const toggleEnabled = async (state: CandidateState) => {
    try {
      const res = await fetch('/api/admin/candidate-states', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          _id: state._id,
          id: state.id,
          isEnabled: !state.isEnabled
        })
      })

      if (!res.ok) throw new Error('Erreur')

      setStates(states.map((s: CandidateState) =>
        (s._id === state._id || s.id === state.id)
          ? { ...s, isEnabled: !s.isEnabled }
          : s
      ))
    } catch {
      setError('Erreur lors de la mise à jour')
    }
  }

  const startEdit = (state: CandidateState) => {
    setEditingState(state)
    setFormData({
      value: state.value,
      color: state.color,
      isEnabled: state.isEnabled,
      isExcludedFromSentState: state.isExcludedFromSentState
    })
    setIsCreating(false)
  }

  const startCreate = () => {
    setIsCreating(true)
    setEditingState(null)
    setFormData({ value: '', color: 0, isEnabled: true, isExcludedFromSentState: false })
  }

  const cancelEdit = () => {
    setEditingState(null)
    setIsCreating(false)
    setFormData({ value: '', color: 0, isEnabled: true, isExcludedFromSentState: false })
    setShowColorPicker(null)
  }

  const getColorStyle = (colorId: number) => {
    const color = colors[colorId]
    return color ? { backgroundColor: color.hex } : { backgroundColor: '#6B7280' }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin text-ebmc-turquoise mx-auto mb-4" />
          <p className="text-gray-500 dark:text-gray-400">Chargement des états...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-gradient-to-r from-orange-500 to-amber-500 rounded-xl">
            <Tags className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white">
              États Candidats
            </h1>
            <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">
              Gérez les catégories du parcours de recrutement (Kanban)
            </p>
          </div>
        </div>
        <div className="flex gap-2 flex-wrap">
          <button
            onClick={syncFromBoond}
            disabled={syncing}
            className="px-4 py-2 bg-gradient-to-r from-blue-500 to-indigo-500 text-white rounded-xl font-medium hover:shadow-lg transition flex items-center gap-2 disabled:opacity-50"
          >
            {syncing ? <Loader2 className="w-4 h-4 animate-spin" /> : <CloudDownload className="w-4 h-4" />}
            Sync BoondManager
          </button>
          <button
            onClick={fetchStates}
            disabled={loading}
            className="px-4 py-2 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-slate-700 rounded-xl transition flex items-center gap-2"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            Actualiser
          </button>
          <button
            onClick={startCreate}
            className="px-4 py-2 bg-gradient-to-r from-ebmc-turquoise to-cyan-500 text-white rounded-xl font-medium hover:shadow-lg transition flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            Nouvel état
          </button>
        </div>
      </div>

      {/* Success message */}
      <AnimatePresence>
        {successMessage && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-xl flex items-center gap-3"
          >
            <Cloud className="w-5 h-5 text-green-500" />
            <span className="text-green-700 dark:text-green-400">{successMessage}</span>
            <button
              onClick={() => setSuccessMessage(null)}
              className="ml-auto p-1 hover:bg-green-100 dark:hover:bg-green-900/30 rounded-lg"
            >
              <X className="w-4 h-4 text-green-500" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Error message */}
      <AnimatePresence>
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl flex items-center gap-3"
          >
            <AlertCircle className="w-5 h-5 text-red-500" />
            <span className="text-red-700 dark:text-red-400">{error}</span>
            <button
              onClick={() => setError(null)}
              className="ml-auto p-1 hover:bg-red-100 dark:hover:bg-red-900/30 rounded-lg"
            >
              <X className="w-4 h-4 text-red-500" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Order save button */}
      <AnimatePresence>
        {hasOrderChanges && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="p-4 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-xl flex items-center justify-between"
          >
            <span className="text-amber-700 dark:text-amber-400 flex items-center gap-2">
              <GripVertical className="w-5 h-5" />
              Ordre modifié - pensez à sauvegarder
            </span>
            <button
              onClick={saveOrder}
              disabled={saving}
              className="px-4 py-2 bg-amber-500 text-white rounded-xl font-medium hover:bg-amber-600 transition flex items-center gap-2"
            >
              {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
              Sauvegarder l&apos;ordre
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Create/Edit Form */}
      <AnimatePresence>
        {(isCreating || editingState) && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="glass-card p-6"
          >
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
              {isCreating ? (
                <>
                  <Plus className="w-5 h-5" /> Nouvel état
                </>
              ) : (
                <>
                  <Edit2 className="w-5 h-5" /> Modifier &quot;{editingState?.value}&quot;
                </>
              )}
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Nom */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Nom de l&apos;état *
                </label>
                <input
                  type="text"
                  value={formData.value}
                  onChange={(e) => setFormData({ ...formData, value: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-200 dark:border-slate-600 rounded-xl bg-white dark:bg-slate-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-ebmc-turquoise focus:border-transparent"
                  placeholder="Ex: En attente"
                />
              </div>

              {/* Couleur */}
              <div className="relative">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Couleur
                </label>
                <button
                  type="button"
                  onClick={() => setShowColorPicker(showColorPicker ? null : 'form')}
                  className="w-full px-4 py-2 border border-gray-200 dark:border-slate-600 rounded-xl bg-white dark:bg-slate-700 flex items-center gap-3 hover:border-ebmc-turquoise transition"
                >
                  <div
                    className="w-6 h-6 rounded-lg"
                    style={getColorStyle(formData.color)}
                  />
                  <span className="text-gray-900 dark:text-white">
                    {colors[formData.color]?.name || 'Gris'}
                  </span>
                  <Palette className="w-4 h-4 ml-auto text-gray-400" />
                </button>

                {/* Color picker dropdown */}
                <AnimatePresence>
                  {showColorPicker === 'form' && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className="absolute z-50 top-full mt-2 left-0 right-0 p-3 bg-white dark:bg-slate-800 rounded-xl shadow-xl border border-gray-200 dark:border-slate-600"
                    >
                      <div className="grid grid-cols-6 gap-2">
                        {Object.entries(colors).map(([id, color]) => (
                          <button
                            key={id}
                            onClick={() => {
                              setFormData({ ...formData, color: parseInt(id) })
                              setShowColorPicker(null)
                            }}
                            className={`w-8 h-8 rounded-lg transition hover:scale-110 ${formData.color === parseInt(id) ? 'ring-2 ring-ebmc-turquoise ring-offset-2 dark:ring-offset-slate-800' : ''}`}
                            style={{ backgroundColor: color.hex }}
                            title={color.name}
                          />
                        ))}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Options */}
              <div className="md:col-span-2 flex flex-wrap gap-4">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.isEnabled}
                    onChange={(e) => setFormData({ ...formData, isEnabled: e.target.checked })}
                    className="w-4 h-4 rounded border-gray-300 text-ebmc-turquoise focus:ring-ebmc-turquoise"
                  />
                  <span className="text-sm text-gray-700 dark:text-gray-300">Activé</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.isExcludedFromSentState}
                    onChange={(e) => setFormData({ ...formData, isExcludedFromSentState: e.target.checked })}
                    className="w-4 h-4 rounded border-gray-300 text-ebmc-turquoise focus:ring-ebmc-turquoise"
                  />
                  <span className="text-sm text-gray-700 dark:text-gray-300">
                    Exclure des états envoyés
                  </span>
                </label>
              </div>
            </div>

            {/* Actions */}
            <div className="flex justify-end gap-3 mt-6">
              <button
                onClick={cancelEdit}
                className="px-4 py-2 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-slate-700 rounded-xl transition"
              >
                Annuler
              </button>
              <button
                onClick={isCreating ? handleCreate : handleUpdate}
                disabled={saving || !formData.value.trim()}
                className="px-4 py-2 bg-gradient-to-r from-ebmc-turquoise to-cyan-500 text-white rounded-xl font-medium hover:shadow-lg transition flex items-center gap-2 disabled:opacity-50"
              >
                {saving ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Check className="w-4 h-4" />
                )}
                {isCreating ? 'Créer' : 'Enregistrer'}
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* States list */}
      <div className="glass-card overflow-hidden">
        <div className="p-4 border-b border-gray-100 dark:border-slate-700 flex items-center justify-between">
          <h2 className="font-semibold text-gray-900 dark:text-white">
            Liste des états ({states.length})
          </h2>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Glissez-déposez pour réorganiser
          </p>
        </div>

        {states.length === 0 ? (
          <div className="p-8 text-center text-gray-500 dark:text-gray-400">
            <Tags className="w-12 h-12 mx-auto mb-4 opacity-50" />
            <p>Aucun état configuré</p>
            <button
              onClick={startCreate}
              className="mt-4 text-ebmc-turquoise hover:underline"
            >
              Créer le premier état
            </button>
          </div>
        ) : (
          <Reorder.Group
            axis="y"
            values={states}
            onReorder={handleReorder}
            className="divide-y divide-gray-100 dark:divide-slate-700"
          >
            {states.map((state) => (
              <Reorder.Item
                key={state._id || state.id}
                value={state}
                className="p-4 flex items-center gap-4 bg-white dark:bg-slate-800 hover:bg-gray-50 dark:hover:bg-slate-700/50 transition cursor-grab active:cursor-grabbing"
              >
                {/* Drag handle */}
                <GripVertical className="w-5 h-5 text-gray-400 flex-shrink-0" />

                {/* Color indicator */}
                <div
                  className="w-4 h-4 rounded-full flex-shrink-0"
                  style={getColorStyle(state.color)}
                />

                {/* State info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className={`font-medium ${state.isEnabled ? 'text-gray-900 dark:text-white' : 'text-gray-400 dark:text-gray-500 line-through'}`}>
                      {state.value}
                    </span>
                    {!state.isEnabled && (
                      <span className="px-2 py-0.5 text-xs bg-gray-100 dark:bg-slate-700 text-gray-500 rounded-full">
                        Désactivé
                      </span>
                    )}
                    {state.isExcludedFromSentState && (
                      <span className="px-2 py-0.5 text-xs bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 rounded-full">
                        Exclu
                      </span>
                    )}
                  </div>
                  <span className="text-xs text-gray-400 dark:text-gray-500">
                    ID: {state.id} | Couleur: {colors[state.color]?.name || 'Gris'}
                  </span>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => toggleEnabled(state)}
                    className={`p-2 rounded-lg transition ${state.isEnabled ? 'text-green-500 hover:bg-green-50 dark:hover:bg-green-900/20' : 'text-gray-400 hover:bg-gray-100 dark:hover:bg-slate-700'}`}
                    title={state.isEnabled ? 'Désactiver' : 'Activer'}
                  >
                    {state.isEnabled ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                  </button>
                  <button
                    onClick={() => startEdit(state)}
                    className="p-2 text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition"
                    title="Modifier"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(state)}
                    className="p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition"
                    title="Supprimer"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </Reorder.Item>
            ))}
          </Reorder.Group>
        )}
      </div>

      {/* Info */}
      <div className="glass-card p-4 flex items-start gap-3">
        <Cloud className="w-5 h-5 text-blue-500 flex-shrink-0 mt-0.5" />
        <div className="text-sm text-gray-600 dark:text-gray-300">
          <p className="font-medium text-gray-900 dark:text-white mb-1">
            À propos des états candidats
          </p>
          <ul className="list-disc list-inside space-y-1 text-gray-500 dark:text-gray-400">
            <li><strong>Sync BoondManager</strong> : Récupère les états depuis le dictionnaire BoondManager</li>
            <li>Ces états correspondent aux statuts dans le parcours de recrutement (Kanban)</li>
            <li>L&apos;ordre détermine l&apos;affichage dans le Kanban (de gauche à droite)</li>
            <li>Les états désactivés ne seront plus proposés lors de la modification d&apos;un candidat</li>
            <li>Les états &quot;Exclus&quot; ne seront pas synchronisés vers BoondManager</li>
            <li>Les modifications locales (couleur, ordre) sont conservées lors de la synchronisation</li>
          </ul>
        </div>
      </div>
    </div>
  )
}
