/**
 * Application-wide constants
 * Centralizes magic numbers and configuration values
 */

// =============================================================================
// AUTHENTICATION & SESSION
// =============================================================================

/** Cookie expiration time in seconds (7 days) */
export const AUTH_COOKIE_MAX_AGE = 60 * 60 * 24 * 7

/** JWT token expiration (7 days) */
export const JWT_EXPIRATION = '7d'

/** Cookie names */
export const COOKIE_NAMES = {
  AUTH_TOKEN: 'auth-token',
  BOOND_TOKEN: 'boond-token',
  BOOND_SUBDOMAIN: 'boond-subdomain',
} as const

// =============================================================================
// API PAGINATION
// =============================================================================

/** Default page size for API requests */
export const DEFAULT_PAGE_SIZE = 50

/** Maximum page size for API requests */
export const MAX_PAGE_SIZE = 500

/** BoondManager API page size for imports */
export const BOOND_IMPORT_PAGE_SIZE = 500

// =============================================================================
// FREELANCE / HR
// =============================================================================

/** Default annual leave days */
export const DEFAULT_ANNUAL_LEAVE_DAYS = 25

/** RTT days per year (France) */
export const DEFAULT_RTT_DAYS = 10

// =============================================================================
// ERROR MESSAGES (French)
// =============================================================================

export const ERROR_MESSAGES = {
  // Authentication
  UNAUTHORIZED: 'Non autorisé',
  NOT_AUTHENTICATED: 'Non authentifié',
  INVALID_CREDENTIALS: 'Identifiants incorrects',
  SESSION_EXPIRED: 'Session expirée',

  // Validation
  MISSING_DATA: 'Données manquantes',
  INVALID_DATA: 'Données invalides',
  INVALID_ID: 'ID invalide',
  INVALID_FORMAT: 'Format invalide',

  // Resources
  NOT_FOUND: 'Ressource non trouvée',
  USER_NOT_FOUND: 'Utilisateur non trouvé',
  ALREADY_EXISTS: 'Cette ressource existe déjà',

  // Operations
  CREATE_ERROR: 'Erreur lors de la création',
  UPDATE_ERROR: 'Erreur lors de la mise à jour',
  DELETE_ERROR: 'Erreur lors de la suppression',
  FETCH_ERROR: 'Erreur lors de la récupération',
  IMPORT_ERROR: 'Erreur lors de l\'import',
  EXPORT_ERROR: 'Erreur lors de l\'export',
  SYNC_ERROR: 'Erreur de synchronisation',

  // BoondManager
  BOOND_CONNECTION_ERROR: 'Erreur de connexion à BoondManager',
  BOOND_AUTH_ERROR: 'Erreur d\'authentification BoondManager',
  BOOND_NOT_CONFIGURED: 'BoondManager non configuré',

  // Generic
  SERVER_ERROR: 'Erreur serveur',
  UNKNOWN_ERROR: 'Erreur inconnue',
} as const

// =============================================================================
// SUCCESS MESSAGES (French)
// =============================================================================

export const SUCCESS_MESSAGES = {
  CREATED: 'Créé avec succès',
  UPDATED: 'Mis à jour avec succès',
  DELETED: 'Supprimé avec succès',
  IMPORTED: 'Import réussi',
  EXPORTED: 'Export réussi',
  SYNCED: 'Synchronisation réussie',
} as const

// =============================================================================
// HTTP STATUS CODES (for reference)
// =============================================================================

export const HTTP_STATUS = {
  OK: 200,
  CREATED: 201,
  NO_CONTENT: 204,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  CONFLICT: 409,
  UNPROCESSABLE_ENTITY: 422,
  INTERNAL_SERVER_ERROR: 500,
} as const

// =============================================================================
// ROLE DEFINITIONS
// =============================================================================

/** Bureau (internal staff) roles */
export const BUREAU_ROLES = ['admin', 'commercial', 'sourceur', 'rh'] as const

/** Terrain (consultants/candidates) roles */
export const TERRAIN_ROLES = ['consultant_cdi', 'freelance', 'candidat'] as const

/** All roles */
export const ALL_ROLES = [...BUREAU_ROLES, ...TERRAIN_ROLES] as const

// =============================================================================
// BOONDMANAGER STATES
// =============================================================================
// Note: State labels are now fetched dynamically from BoondManager API.
// Use functions from '@/lib/boondmanager-dictionary' for dynamic state lookup.
// The fallback constants below are re-exported for backwards compatibility.

export {
  FALLBACK_CANDIDATE_STATES as CANDIDATE_STATES,
  FALLBACK_RESOURCE_STATES as RESOURCE_STATES,
  FALLBACK_OPPORTUNITY_STATES as OPPORTUNITY_STATES,
  FALLBACK_PROJECT_STATES as PROJECT_STATES,
  FALLBACK_COMPANY_STATES as COMPANY_STATES,
  // Also export the dynamic getters for modern usage
  getCandidateStates,
  getResourceStates,
  getOpportunityStates,
  getProjectStates,
  getCompanyStates,
  getAllStates,
} from './boondmanager-dictionary'

// =============================================================================
// ABSENCE TYPES
// =============================================================================

export const ABSENCE_TYPES = [
  'conges_payes',
  'rtt',
  'maladie',
  'sans_solde',
  'autre',
] as const

export type AbsenceType = typeof ABSENCE_TYPES[number]

// =============================================================================
// VALIDATION PATTERNS
// =============================================================================

export const VALIDATION_PATTERNS = {
  EMAIL: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  PHONE_FR: /^(?:(?:\+|00)33|0)\s*[1-9](?:[\s.-]*\d{2}){4}$/,
  MONGO_ID: /^[0-9a-fA-F]{24}$/,
} as const

// =============================================================================
// API RESPONSE HELPERS
// =============================================================================

export type ApiSuccessResponse<T> = {
  success: true
  data: T
  meta?: {
    page?: number
    limit?: number
    total?: number
    hasMore?: boolean
  }
}

export type ApiErrorResponse = {
  success: false
  error: string
  details?: unknown
}

export type ApiResponse<T> = ApiSuccessResponse<T> | ApiErrorResponse

/**
 * Create a success response
 */
export function createSuccessResponse<T>(data: T, meta?: ApiSuccessResponse<T>['meta']): ApiSuccessResponse<T> {
  const response: ApiSuccessResponse<T> = { success: true, data }
  if (meta) {
    response.meta = meta
  }
  return response
}

/**
 * Create an error response
 */
export function createErrorResponse(error: string, details?: unknown): ApiErrorResponse {
  const response: ApiErrorResponse = { success: false, error }
  if (details !== undefined) {
    response.details = details
  }
  return response
}
