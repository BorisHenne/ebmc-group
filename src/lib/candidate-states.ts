/**
 * Candidate States Configuration
 * Colors and default states for the recruitment Kanban
 */

// Interface pour un état candidat
export interface CandidateState {
  _id?: string
  id: number // Boond ID
  value: string
  color: number
  isEnabled: boolean
  isExcludedFromSentState: boolean
  reason: string[]
  order: number
  createdAt?: Date
  updatedAt?: Date
}

// Couleurs disponibles (basées sur BoondManager)
const CANDIDATE_STATE_COLORS: Record<number, { name: string; hex: string; tailwind: string }> = {
  0: { name: 'Gris', hex: '#6B7280', tailwind: 'bg-gray-500' },
  1: { name: 'Bleu clair', hex: '#3B82F6', tailwind: 'bg-blue-500' },
  2: { name: 'Vert', hex: '#22C55E', tailwind: 'bg-green-500' },
  3: { name: 'Orange', hex: '#F97316', tailwind: 'bg-orange-500' },
  4: { name: 'Rouge', hex: '#EF4444', tailwind: 'bg-red-500' },
  5: { name: 'Violet', hex: '#8B5CF6', tailwind: 'bg-violet-500' },
  6: { name: 'Rose', hex: '#EC4899', tailwind: 'bg-pink-500' },
  7: { name: 'Cyan', hex: '#06B6D4', tailwind: 'bg-cyan-500' },
  8: { name: 'Rouge foncé', hex: '#DC2626', tailwind: 'bg-red-600' },
  9: { name: 'Jaune', hex: '#EAB308', tailwind: 'bg-yellow-500' },
  10: { name: 'Vert émeraude', hex: '#10B981', tailwind: 'bg-emerald-500' },
  11: { name: 'Indigo', hex: '#6366F1', tailwind: 'bg-indigo-500' },
  12: { name: 'Gris foncé', hex: '#374151', tailwind: 'bg-gray-700' },
  13: { name: 'Ambre', hex: '#F59E0B', tailwind: 'bg-amber-500' },
  14: { name: 'Bleu ardoise', hex: '#64748B', tailwind: 'bg-slate-500' },
  15: { name: 'Turquoise', hex: '#14B8A6', tailwind: 'bg-teal-500' },
  16: { name: 'Lime', hex: '#84CC16', tailwind: 'bg-lime-500' },
  17: { name: 'Fuchsia', hex: '#D946EF', tailwind: 'bg-fuchsia-500' },
}

// États par défaut (basés sur BoondManager)
const DEFAULT_CANDIDATE_STATES: Omit<CandidateState, '_id'>[] = [
  { id: 0, color: 3, value: 'A traiter !', isEnabled: true, isExcludedFromSentState: false, reason: [], order: 0 },
  { id: 1, color: 1, value: 'En cours de qualif.', isEnabled: true, isExcludedFromSentState: false, reason: [], order: 1 },
  { id: 2, color: 10, value: 'Vivier++', isEnabled: true, isExcludedFromSentState: false, reason: [], order: 2 },
  { id: 3, color: 7, value: 'Converti en Ressource', isEnabled: true, isExcludedFromSentState: false, reason: [], order: 3 },
  { id: 4, color: 8, value: 'Blacklist', isEnabled: true, isExcludedFromSentState: false, reason: [], order: 4 },
  { id: 5, color: 12, value: 'Ne plus contacter', isEnabled: true, isExcludedFromSentState: false, reason: [], order: 5 },
  { id: 6, color: 5, value: 'Freelance', isEnabled: true, isExcludedFromSentState: false, reason: [], order: 6 },
  { id: 7, color: 14, value: 'Ne répond plus', isEnabled: true, isExcludedFromSentState: false, reason: [], order: 7 },
  { id: 8, color: 13, value: 'Refus de Proposition', isEnabled: true, isExcludedFromSentState: false, reason: [], order: 8 },
  { id: 9, color: 9, value: 'Vivier', isEnabled: true, isExcludedFromSentState: false, reason: [], order: 9 },
  { id: 10, color: 17, value: 'Ancien Salarié', isEnabled: true, isExcludedFromSentState: false, reason: [], order: 10 },
  { id: 11, color: 15, value: 'Junior', isEnabled: true, isExcludedFromSentState: false, reason: [], order: 11 },
  { id: 12, color: 16, value: 'CV Partenaire', isEnabled: true, isExcludedFromSentState: false, reason: [], order: 12 },
  { id: 13, color: 13, value: 'Need LU Work Permit', isEnabled: true, isExcludedFromSentState: false, reason: [], order: 13 },
  { id: 14, color: 14, value: 'Envoyé aux Sales', isEnabled: true, isExcludedFromSentState: false, reason: [], order: 14 },
]

// Getters to avoid Next.js route export detection issues
export function getCandidateStateColors() {
  return CANDIDATE_STATE_COLORS
}

export function getDefaultCandidateStates() {
  return DEFAULT_CANDIDATE_STATES
}
