import { NextRequest, NextResponse } from 'next/server'
import { getSession } from '@/lib/auth'
import { connectToDatabase } from '@/lib/mongodb'
import { hasPermission } from '@/lib/roles'
import { sanitizeDocuments, sanitizeDocument } from '@/lib/sanitize'

// Collections that can be accessed
const ALLOWED_COLLECTIONS = ['candidates', 'consultants', 'users', 'jobs', 'messages', 'contacts']

// GET - Fetch collection data
export async function GET(request: NextRequest) {
  const session = await getSession()
  if (!session) {
    return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
  }

  // Only admin can access database
  if (!hasPermission(session.role, 'boondManagerAdmin')) {
    return NextResponse.json({ error: 'Permission refusee' }, { status: 403 })
  }

  try {
    const db = await connectToDatabase()
    const searchParams = request.nextUrl.searchParams
    const collection = searchParams.get('collection')
    const action = searchParams.get('action') || 'data'
    const limit = parseInt(searchParams.get('limit') || '100')
    const skip = parseInt(searchParams.get('skip') || '0')
    const search = searchParams.get('search') || ''

    // Get collections list
    if (action === 'collections') {
      const collections = await db.listCollections().toArray()
      const collectionNames = collections.map(c => c.name).filter(name =>
        ALLOWED_COLLECTIONS.includes(name) || name.startsWith('payload')
      )

      // Get counts for each collection
      const collectionStats = await Promise.all(
        collectionNames.map(async name => {
          try {
            const count = await db.collection(name).countDocuments()
            return { name, count }
          } catch {
            return { name, count: 0 }
          }
        })
      )

      return NextResponse.json({
        success: true,
        collections: collectionStats.sort((a, b) => a.name.localeCompare(b.name)),
      })
    }

    // Get collection data
    if (!collection) {
      return NextResponse.json({ error: 'Collection requise' }, { status: 400 })
    }

    // Validate collection access
    const isPayloadCollection = collection.startsWith('payload')
    if (!ALLOWED_COLLECTIONS.includes(collection) && !isPayloadCollection) {
      return NextResponse.json({ error: 'Collection non autorisee' }, { status: 403 })
    }

    // Build query
    let query = {}
    if (search) {
      // Search across common text fields
      query = {
        $or: [
          { firstName: { $regex: search, $options: 'i' } },
          { lastName: { $regex: search, $options: 'i' } },
          { email: { $regex: search, $options: 'i' } },
          { name: { $regex: search, $options: 'i' } },
          { title: { $regex: search, $options: 'i' } },
        ]
      }
    }

    // Fetch data
    const rawData = await db.collection(collection)
      .find(query)
      .sort({ updatedAt: -1, createdAt: -1, _id: -1 })
      .skip(skip)
      .limit(limit)
      .toArray()

    // Sanitize all documents to prevent React rendering errors
    const data = sanitizeDocuments(rawData as Record<string, unknown>[])

    // Get total count
    const total = await db.collection(collection).countDocuments(query)

    // Get sample document structure
    const sample = data[0]
    const fields = sample ? Object.keys(sample) : []

    return NextResponse.json({
      success: true,
      collection,
      data,
      total,
      limit,
      skip,
      fields,
      hasMore: skip + data.length < total,
    })

  } catch (error) {
    console.error('Database query error:', error)
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Erreur inconnue',
    }, { status: 500 })
  }
}

// POST - Export data
export async function POST(request: NextRequest) {
  const session = await getSession()
  if (!session) {
    return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
  }

  if (!hasPermission(session.role, 'boondManagerAdmin')) {
    return NextResponse.json({ error: 'Permission refusee' }, { status: 403 })
  }

  try {
    const db = await connectToDatabase()
    const body = await request.json()
    const { collection, format = 'json', fields, filter } = body

    if (!collection) {
      return NextResponse.json({ error: 'Collection requise' }, { status: 400 })
    }

    // Validate collection
    const isPayloadCollection = collection.startsWith('payload')
    if (!ALLOWED_COLLECTIONS.includes(collection) && !isPayloadCollection) {
      return NextResponse.json({ error: 'Collection non autorisee' }, { status: 403 })
    }

    // Build query
    const query = filter || {}

    // Fetch all data for export (no limit)
    let cursor = db.collection(collection).find(query).sort({ _id: -1 })

    // Project only selected fields if specified
    if (fields && fields.length > 0) {
      const projection: Record<string, number> = {}
      fields.forEach((field: string) => { projection[field] = 1 })
      cursor = cursor.project(projection)
    }

    const rawData = await cursor.toArray()
    const data = sanitizeDocuments(rawData as Record<string, unknown>[])

    if (format === 'csv') {
      // Convert to CSV
      if (data.length === 0) {
        return NextResponse.json({ success: true, csv: '', total: 0 })
      }

      const headers = fields && fields.length > 0 ? fields : Object.keys(data[0])
      const csvRows = [headers.join(',')]

      data.forEach(doc => {
        const row = headers.map((header: string) => {
          const value = doc[header]
          if (value === null || value === undefined) return ''
          if (typeof value === 'object') return JSON.stringify(value).replace(/,/g, ';')
          return String(value).replace(/,/g, ';').replace(/\n/g, ' ')
        })
        csvRows.push(row.join(','))
      })

      return NextResponse.json({
        success: true,
        format: 'csv',
        data: csvRows.join('\n'),
        total: data.length,
        filename: `${collection}_export_${new Date().toISOString().split('T')[0]}.csv`,
      })
    }

    // JSON format
    return NextResponse.json({
      success: true,
      format: 'json',
      data,
      total: data.length,
      filename: `${collection}_export_${new Date().toISOString().split('T')[0]}.json`,
    })

  } catch (error) {
    console.error('Export error:', error)
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Erreur inconnue',
    }, { status: 500 })
  }
}
