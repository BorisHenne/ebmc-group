import { NextResponse } from 'next/server'
import { connectToDatabase } from '@/lib/mongodb'

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const detailed = searchParams.get('detailed') === 'true'

  try {
    const startTime = Date.now()
    const db = await connectToDatabase()
    const connectTime = Date.now() - startTime

    await db.command({ ping: 1 })
    const pingTime = Date.now() - startTime

    const result: Record<string, unknown> = {
      status: 'ok',
      database: 'connected',
      timing: {
        connect: `${connectTime}ms`,
        ping: `${pingTime}ms`
      },
      timestamp: new Date().toISOString()
    }

    // If detailed mode, check collections
    if (detailed) {
      const collections = await db.listCollections().toArray()
      const collectionStats: Record<string, unknown> = {}

      for (const col of collections) {
        try {
          const count = await db.collection(col.name).countDocuments()
          collectionStats[col.name] = { count }

          // For jobs collection, get a sample document to check structure
          if (col.name === 'jobs') {
            const sample = await db.collection('jobs').findOne({})
            if (sample) {
              collectionStats[col.name] = {
                count,
                sampleKeys: Object.keys(sample),
                sampleId: String(sample._id)
              }
            }
          }
        } catch (colError) {
          collectionStats[col.name] = {
            error: colError instanceof Error ? colError.message : 'Unknown'
          }
        }
      }

      result.collections = collectionStats
      result.timing = {
        ...result.timing as object,
        total: `${Date.now() - startTime}ms`
      }
    }

    return NextResponse.json(result)
  } catch (error) {
    return NextResponse.json({
      status: 'error',
      database: 'disconnected',
      error: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString()
    }, { status: 500 })
  }
}
