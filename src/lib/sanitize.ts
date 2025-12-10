/**
 * Deep sanitization utilities for MongoDB/BoondManager data
 * Ensures all values are React-renderable (no complex objects as children)
 */

/**
 * Check if a value is a BoondManager complex object like {typeOf, detail}
 */
function isBoondManagerObject(obj: Record<string, unknown>): boolean {
  return (
    ('typeOf' in obj && 'detail' in obj) ||
    ('typeOf' in obj && typeof obj.typeOf === 'number')
  )
}

/**
 * Extract string value from BoondManager complex object
 */
function extractBoondManagerValue(obj: Record<string, unknown>): string | undefined {
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
  return undefined
}

/**
 * Deep sanitize any value to ensure it's React-renderable
 * Recursively processes all nested objects and arrays
 */
export function sanitizeValue(value: unknown): unknown {
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

  // Handle arrays - recursively sanitize each element
  if (Array.isArray(value)) {
    return value.map(item => sanitizeValue(item))
  }

  // Handle objects
  if (typeof value === 'object' && value !== null) {
    const obj = value as Record<string, unknown>

    // Check if it's a MongoDB ObjectId
    if ('_bsontype' in obj && obj._bsontype === 'ObjectId') {
      return String(obj)
    }

    // Check for BoondManager complex objects - extract the meaningful value
    if (isBoondManagerObject(obj)) {
      const extracted = extractBoondManagerValue(obj)
      if (extracted !== undefined) {
        return extracted
      }
      // If we can't extract, stringify it
      return JSON.stringify(obj)
    }

    // Recursively sanitize all object properties
    const sanitized: Record<string, unknown> = {}
    for (const [key, val] of Object.entries(obj)) {
      sanitized[key] = sanitizeValue(val)
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
