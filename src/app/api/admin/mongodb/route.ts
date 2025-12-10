import { NextRequest, NextResponse } from 'next/server'
import { getSession } from '@/lib/auth'
import { connectToDatabase } from '@/lib/mongodb'
import { ObjectId } from 'mongodb'

export const dynamic = 'force-dynamic'

// GET - List collections or documents
export async function GET(request: NextRequest) {
  const session = await getSession()
  if (!session) {
    return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
  }

  const collection = request.nextUrl.searchParams.get('collection')
  const limit = parseInt(request.nextUrl.searchParams.get('limit') || '50')
  const skip = parseInt(request.nextUrl.searchParams.get('skip') || '0')

  try {
    const db = await connectToDatabase()

    if (!collection) {
      // List all collections with document counts
      const collections = await db.listCollections().toArray()
      const collectionStats = await Promise.all(
        collections.map(async (col) => {
          const count = await db.collection(col.name).countDocuments()
          return {
            name: col.name,
            type: col.type,
            count,
          }
        })
      )
      return NextResponse.json({
        success: true,
        collections: collectionStats.sort((a, b) => a.name.localeCompare(b.name)),
      })
    }

    // Get documents from collection
    const documents = await db
      .collection(collection)
      .find({})
      .skip(skip)
      .limit(limit)
      .toArray()

    const total = await db.collection(collection).countDocuments()

    return NextResponse.json({
      success: true,
      collection,
      documents,
      pagination: {
        total,
        limit,
        skip,
        hasMore: skip + documents.length < total,
      },
    })
  } catch (error) {
    console.error('MongoDB error:', error)
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Erreur MongoDB',
    }, { status: 500 })
  }
}

// POST - Create document
export async function POST(request: NextRequest) {
  const session = await getSession()
  if (!session) {
    return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
  }

  try {
    const { collection, document } = await request.json()

    if (!collection || !document) {
      return NextResponse.json({
        success: false,
        error: 'Collection et document requis',
      }, { status: 400 })
    }

    const db = await connectToDatabase()
    const result = await db.collection(collection).insertOne({
      ...document,
      createdAt: new Date(),
      updatedAt: new Date(),
    })

    return NextResponse.json({
      success: true,
      insertedId: result.insertedId,
    })
  } catch (error) {
    console.error('MongoDB error:', error)
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Erreur MongoDB',
    }, { status: 500 })
  }
}

// PATCH - Update document
export async function PATCH(request: NextRequest) {
  const session = await getSession()
  if (!session) {
    return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
  }

  try {
    const { collection, id, update } = await request.json()

    if (!collection || !id || !update) {
      return NextResponse.json({
        success: false,
        error: 'Collection, id et update requis',
      }, { status: 400 })
    }

    const db = await connectToDatabase()
    const result = await db.collection(collection).updateOne(
      { _id: new ObjectId(id) },
      {
        $set: {
          ...update,
          updatedAt: new Date(),
        },
      }
    )

    return NextResponse.json({
      success: true,
      matchedCount: result.matchedCount,
      modifiedCount: result.modifiedCount,
    })
  } catch (error) {
    console.error('MongoDB error:', error)
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Erreur MongoDB',
    }, { status: 500 })
  }
}

// DELETE - Delete document or drop collection
export async function DELETE(request: NextRequest) {
  const session = await getSession()
  if (!session) {
    return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
  }

  const collection = request.nextUrl.searchParams.get('collection')
  const id = request.nextUrl.searchParams.get('id')
  const dropCollection = request.nextUrl.searchParams.get('drop') === 'true'

  if (!collection) {
    return NextResponse.json({
      success: false,
      error: 'Collection requise',
    }, { status: 400 })
  }

  try {
    const db = await connectToDatabase()

    if (dropCollection) {
      // Drop entire collection
      await db.collection(collection).drop()
      return NextResponse.json({
        success: true,
        message: `Collection ${collection} supprimée`,
      })
    }

    if (!id) {
      return NextResponse.json({
        success: false,
        error: 'ID requis pour supprimer un document',
      }, { status: 400 })
    }

    const result = await db.collection(collection).deleteOne({
      _id: new ObjectId(id),
    })

    return NextResponse.json({
      success: true,
      deletedCount: result.deletedCount,
    })
  } catch (error) {
    console.error('MongoDB error:', error)
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Erreur MongoDB',
    }, { status: 500 })
  }
}
