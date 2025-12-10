import { NextResponse } from 'next/server'
import { connectToDatabase } from '@/lib/mongodb'
import { sanitizeDocuments } from '@/lib/sanitize'

export async function GET() {
  const startTime = Date.now()
  console.log('[Jobs API] Starting GET request')

  try {
    console.log('[Jobs API] Connecting to database...')
    const db = await connectToDatabase()
    console.log(`[Jobs API] Connected to database in ${Date.now() - startTime}ms`)

    console.log('[Jobs API] Fetching jobs from collection...')
    const fetchStart = Date.now()

    // Add limit and timeout to prevent hanging
    const jobs = await db.collection('jobs')
      .find({})
      .sort({ createdAt: -1 })
      .limit(500) // Limit to 500 jobs max
      .maxTimeMS(15000) // 15 second timeout for the query
      .toArray()

    console.log(`[Jobs API] Fetched ${jobs.length} jobs in ${Date.now() - fetchStart}ms`)

    console.log('[Jobs API] Sanitizing jobs data...')
    const sanitizeStart = Date.now()

    // Wrap sanitization in try-catch to identify problematic documents
    let sanitizedJobs
    try {
      sanitizedJobs = sanitizeDocuments(jobs as Record<string, unknown>[])
    } catch (sanitizeError) {
      console.error('[Jobs API] Sanitization failed:', sanitizeError)
      // Try to sanitize one by one to find problematic document
      sanitizedJobs = []
      for (let i = 0; i < jobs.length; i++) {
        try {
          const sanitized = sanitizeDocuments([jobs[i] as Record<string, unknown>])
          sanitizedJobs.push(sanitized[0])
        } catch (docError) {
          console.error(`[Jobs API] Failed to sanitize job at index ${i}, _id: ${jobs[i]._id}`, docError)
          // Skip this document
        }
      }
    }

    console.log(`[Jobs API] Sanitized ${sanitizedJobs.length} jobs in ${Date.now() - sanitizeStart}ms`)
    console.log(`[Jobs API] Total request time: ${Date.now() - startTime}ms`)

    return NextResponse.json({ jobs: sanitizedJobs })
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'
    const errorStack = error instanceof Error ? error.stack : ''
    console.error(`[Jobs API] Error after ${Date.now() - startTime}ms:`, errorMessage)
    console.error('[Jobs API] Stack:', errorStack)

    // Return more detailed error in development
    return NextResponse.json({
      error: 'Erreur serveur',
      details: process.env.NODE_ENV === 'development' ? errorMessage : undefined
    }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const data = await request.json()
    const db = await connectToDatabase()

    const job = {
      ...data,
      createdAt: new Date(),
      updatedAt: new Date()
    }

    const result = await db.collection('jobs').insertOne(job)
    return NextResponse.json({ id: result.insertedId })
  } catch (error) {
    console.error('Error creating job:', error)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}
