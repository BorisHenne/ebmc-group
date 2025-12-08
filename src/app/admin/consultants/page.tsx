'use client'

import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import {
  User,
  Plus,
  Edit,
  Trash2,
  Loader2,
  X,
  MapPin,
  Award,
  Save
} from 'lucide-react'

interface Consultant {
  _id: string
  name: string
  title: string
  titleEn: string
  location: string
  experience: string
  experienceEn: string
  category: string
  available: boolean
  skills: string[]
  certifications: string[]
  createdAt: string
}

const emptyConsultant: Omit<Consultant, '_id' | 'createdAt'> = {
  name: '',
  title: '',
  titleEn: '',
  location: '',
  experience: '',
  experienceEn: '',
  category: 'sap',
  available: true,
  skills: [''],
  certifications: ['']
}

export default function ConsultantsPage() {
  const [consultants, setConsultants] = useState<Consultant[]>([])
  const [loading, setLoading] = useState(true)
  const [editingConsultant, setEditingConsultant] = useState<Partial<Consultant> | null>(null)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    fetchConsultants()
  }, [])

  const fetchConsultants = async () => {
    try {
      const res = await fetch('/api/admin/consultants')
      if (res.ok) {
        const data = await res.json()
        setConsultants(data.consultants || [])
      }
    } catch (error) {
      console.error('Error fetching consultants:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSave = async () => {
    if (!editingConsultant) return
    setSaving(true)

    try {
      const method = editingConsultant._id ? 'PUT' : 'POST'
      const url = editingConsultant._id
        ? `/api/admin/consultants/${editingConsultant._id}`
        : '/api/admin/consultants'

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editingConsultant)
      })

      if (res.ok) {
        fetchConsultants()
        setEditingConsultant(null)
      }
    } catch (error) {
      console.error('Error saving consultant:', error)
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer ce consultant ?')) return

    try {
      await fetch(`/api/admin/consultants/${id}`, { method: 'DELETE' })
      fetchConsultants()
    } catch (error) {
      console.error('Error deleting consultant:', error)
    }
  }

  const updateField = (field: string, value: string | boolean | string[]) => {
    setEditingConsultant(prev => prev ? { ...prev, [field]: value } : null)
  }

  const updateArrayField = (field: string, index: number, value: string) => {
    if (!editingConsultant) return
    const arr = [...((editingConsultant[field as keyof typeof editingConsultant] as string[]) || [])]
    arr[index] = value
    updateField(field, arr)
  }

  const addArrayItem = (field: string) => {
    if (!editingConsultant) return
    const arr = [...((editingConsultant[field as keyof typeof editingConsultant] as string[]) || []), '']
    updateField(field, arr)
  }

  const removeArrayItem = (field: string, index: number) => {
    if (!editingConsultant) return
    const arr = ((editingConsultant[field as keyof typeof editingConsultant] as string[]) || []).filter((_, i) => i !== index)
    updateField(field, arr)
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Consultants</h1>
          <p className="text-gray-600 mt-2">Gérez les consultants disponibles</p>
        </div>
        <button
          onClick={() => setEditingConsultant(emptyConsultant)}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
        >
          <Plus className="w-5 h-5" />
          Nouveau consultant
        </button>
      </div>

      {/* Consultants List */}
      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        {loading ? (
          <div className="flex justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
          </div>
        ) : consultants.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            <User className="w-12 h-12 mx-auto mb-4 opacity-50" />
            Aucun consultant
          </div>
        ) : (
          <div className="divide-y">
            {consultants.map((consultant) => (
              <motion.div
                key={consultant._id}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="p-6 hover:bg-gray-50"
              >
                <div className="flex justify-between items-start">
                  <div className="flex gap-4">
                    <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-cyan-400 rounded-full flex items-center justify-center">
                      <User className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <div className="flex items-center gap-3">
                        <span className="font-medium text-gray-900">{consultant.name}</span>
                        <span className={`px-2 py-0.5 text-xs rounded-full ${
                          consultant.available
                            ? 'bg-green-100 text-green-700'
                            : 'bg-orange-100 text-orange-700'
                        }`}>
                          {consultant.available ? 'Disponible' : 'En mission'}
                        </span>
                        <span className="px-2 py-0.5 bg-blue-100 text-blue-700 text-xs rounded-full">
                          {consultant.category.toUpperCase()}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600 mt-1">{consultant.title}</p>
                      <div className="flex gap-4 mt-2 text-sm text-gray-500">
                        <span className="flex items-center gap-1">
                          <MapPin className="w-4 h-4" />
                          {consultant.location}
                        </span>
                        <span className="flex items-center gap-1">
                          <Award className="w-4 h-4" />
                          {consultant.certifications?.length || 0} certifications
                        </span>
                      </div>
                      <div className="flex flex-wrap gap-1 mt-2">
                        {consultant.skills?.slice(0, 4).map((skill, i) => (
                          <span key={i} className="px-2 py-0.5 bg-gray-100 text-gray-600 text-xs rounded">
                            {skill}
                          </span>
                        ))}
                        {(consultant.skills?.length || 0) > 4 && (
                          <span className="text-xs text-gray-400">+{consultant.skills.length - 4}</span>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => setEditingConsultant(consultant)}
                      className="p-2 text-blue-500 hover:bg-blue-50 rounded-lg"
                    >
                      <Edit className="w-5 h-5" />
                    </button>
                    <button
                      onClick={() => handleDelete(consultant._id)}
                      className="p-2 text-red-500 hover:bg-red-50 rounded-lg"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      {/* Edit Modal */}
      {editingConsultant && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-xl shadow-xl w-full max-w-3xl max-h-[90vh] overflow-hidden flex flex-col"
          >
            <div className="flex justify-between items-center p-6 border-b">
              <h2 className="text-xl font-semibold">
                {editingConsultant._id ? 'Modifier le consultant' : 'Nouveau consultant'}
              </h2>
              <button onClick={() => setEditingConsultant(null)}>
                <X className="w-6 h-6 text-gray-400 hover:text-gray-600" />
              </button>
            </div>

            <div className="p-6 overflow-y-auto flex-1 space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Nom</label>
                <input
                  type="text"
                  value={editingConsultant.name || ''}
                  onChange={(e) => updateField('name', e.target.value)}
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Titre (FR)</label>
                  <input
                    type="text"
                    value={editingConsultant.title || ''}
                    onChange={(e) => updateField('title', e.target.value)}
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                    placeholder="Consultant SAP Senior"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Title (EN)</label>
                  <input
                    type="text"
                    value={editingConsultant.titleEn || ''}
                    onChange={(e) => updateField('titleEn', e.target.value)}
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                    placeholder="Senior SAP Consultant"
                  />
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Localisation</label>
                  <input
                    type="text"
                    value={editingConsultant.location || ''}
                    onChange={(e) => updateField('location', e.target.value)}
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                    placeholder="Paris"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Catégorie</label>
                  <select
                    value={editingConsultant.category || 'sap'}
                    onChange={(e) => updateField('category', e.target.value)}
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="sap">SAP</option>
                    <option value="security">Sécurité</option>
                    <option value="dev">Développement</option>
                    <option value="data">Data</option>
                  </select>
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Expérience (FR)</label>
                  <input
                    type="text"
                    value={editingConsultant.experience || ''}
                    onChange={(e) => updateField('experience', e.target.value)}
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                    placeholder="10 ans"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Experience (EN)</label>
                  <input
                    type="text"
                    value={editingConsultant.experienceEn || ''}
                    onChange={(e) => updateField('experienceEn', e.target.value)}
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                    placeholder="10 years"
                  />
                </div>
              </div>

              {/* Skills */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Compétences</label>
                {(editingConsultant.skills || ['']).map((s, i) => (
                  <div key={i} className="flex gap-2 mb-2">
                    <input
                      type="text"
                      value={s}
                      onChange={(e) => updateArrayField('skills', i, e.target.value)}
                      className="flex-1 px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                      placeholder="SAP S/4HANA, React, Python..."
                    />
                    <button
                      onClick={() => removeArrayItem('skills', i)}
                      className="px-3 py-2 text-red-500 hover:bg-red-50 rounded-lg"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ))}
                <button
                  onClick={() => addArrayItem('skills')}
                  className="text-blue-600 text-sm hover:underline"
                >
                  + Ajouter une compétence
                </button>
              </div>

              {/* Certifications */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Certifications</label>
                {(editingConsultant.certifications || ['']).map((c, i) => (
                  <div key={i} className="flex gap-2 mb-2">
                    <input
                      type="text"
                      value={c}
                      onChange={(e) => updateArrayField('certifications', i, e.target.value)}
                      className="flex-1 px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                      placeholder="AWS Solutions Architect, PMP..."
                    />
                    <button
                      onClick={() => removeArrayItem('certifications', i)}
                      className="px-3 py-2 text-red-500 hover:bg-red-50 rounded-lg"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ))}
                <button
                  onClick={() => addArrayItem('certifications')}
                  className="text-blue-600 text-sm hover:underline"
                >
                  + Ajouter une certification
                </button>
              </div>

              {/* Available toggle */}
              <div className="flex items-center gap-3">
                <input
                  type="checkbox"
                  id="available"
                  checked={editingConsultant.available !== false}
                  onChange={(e) => updateField('available', e.target.checked)}
                  className="w-4 h-4 text-blue-600 rounded"
                />
                <label htmlFor="available" className="text-sm text-gray-700">Disponible pour mission</label>
              </div>
            </div>

            <div className="flex justify-end gap-3 p-6 border-t bg-gray-50">
              <button
                onClick={() => setEditingConsultant(null)}
                className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg transition"
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
