/**
 * Deep sanitization utilities for MongoDB/BoondManager data
 * Ensures all values are React-renderable (no complex objects as children)
 */

/**
 * List of known document-level keys that should remain as objects
 * All other objects will be converted to strings if they're not plain data objects
 */
const ALLOWED_OBJECT_KEYS = new Set([
  // Root document keys that should remain as objects
])

/**
 * List of keys that should always be string arrays
 */
const STRING_ARRAY_KEYS = new Set([
  'missions',
  'missionsEn',
  'requirements',
  'requirementsEn',
  'skills',
  'certifications',
])

/**
 * Extract string value from any complex object
 * Handles BoondManager objects and other nested structures
 */
function extractStringFromObject(obj: Record<string, unknown>): string {
  // Try common string field names
  if ('detail' in obj && typeof obj.detail === 'string') {
    return obj.detail
  }
  if ('value' in obj && typeof obj.value === 'string') {
    return obj.value
  }
  if ('label' in obj && typeof obj.label === 'string') {
    return obj.label
  }
  if ('name' in obj && typeof obj.name === 'string') {
    return obj.name
  }
  if ('title' in obj && typeof obj.title === 'string') {
    return obj.title
  }
  if ('text' in obj && typeof obj.text === 'string') {
    return obj.text
  }
  // Fallback to JSON string
  try {
    return JSON.stringify(obj)
  } catch {
    return '[Object]'
  }
}

/**
 * Deep sanitize any value to ensure it's React-renderable
 * Recursively processes all nested objects and arrays
 * @param value - The value to sanitize
 * @param key - Optional key name for context-aware sanitization
 * @param forceString - If true, converts objects to strings instead of recursing
 */
export function sanitizeValue(value: unknown, key?: string, forceString = false): unknown {
  // Handle null/undefined
  if (value === null || value === undefined) {
    return value
  }

  // Handle primitives
  if (typeof value === 'string' || typeof value === 'number' || typeof value === 'boolean') {
    return value
  }

  // Handle Date objects
  if (value instanceof Date) {
    return value.toISOString()
  }

  // Handle arrays
  if (Array.isArray(value)) {
    // For known string array keys, ensure all elements are strings
    if (key && STRING_ARRAY_KEYS.has(key)) {
      return value.map(item => {
        if (typeof item === 'string') return item
        if (item === null || item === undefined) return ''
        if (typeof item === 'object') {
          return extractStringFromObject(item as Record<string, unknown>)
        }
        return String(item)
      })
    }
    // Otherwise recursively sanitize
    return value.map(item => sanitizeValue(item, undefined, forceString))
  }

  // Handle objects
  if (typeof value === 'object' && value !== null) {
    const obj = value as Record<string, unknown>

    // Check if it's a MongoDB ObjectId
    if ('_bsontype' in obj && obj._bsontype === 'ObjectId') {
      return String(obj)
    }

    // Check if it's a MongoDB BSON type (like Decimal128, etc.)
    if ('_bsontype' in obj) {
      return String(obj)
    }

    // If forceString is true, convert to string
    if (forceString) {
      return extractStringFromObject(obj)
    }

    // Check for BoondManager-style objects (have typeOf field)
    if ('typeOf' in obj && typeof obj.typeOf === 'number') {
      return extractStringFromObject(obj)
    }

    // Check for objects with only metadata (not data objects)
    // These are likely complex types that should be stringified
    const keys = Object.keys(obj)
    if (keys.length > 0 && keys.every(k => k.startsWith('$') || k.startsWith('_'))) {
      return extractStringFromObject(obj)
    }

    // Recursively sanitize all object properties
    const sanitized: Record<string, unknown> = {}
    for (const [objKey, val] of Object.entries(obj)) {
      // Skip internal MongoDB fields except _id
      if (objKey.startsWith('$')) continue
      sanitized[objKey] = sanitizeValue(val, objKey, false)
    }
    return sanitized
  }

  // Fallback - convert to string
  return String(value)
}

/**
 * Sanitize a MongoDB document for safe React rendering
 * Ensures _id is always a string and all nested values are sanitized
 */
export function sanitizeDocument<T extends Record<string, unknown>>(doc: T): T {
  const sanitized = sanitizeValue(doc) as Record<string, unknown>
  // Ensure _id is a string
  if (sanitized._id !== undefined && sanitized._id !== null) {
    sanitized._id = String(sanitized._id)
  }
  return sanitized as T
}

/**
 * Sanitize an array of MongoDB documents
 */
export function sanitizeDocuments<T extends Record<string, unknown>>(docs: T[]): T[] {
  return docs.map(doc => sanitizeDocument(doc))
}
