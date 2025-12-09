import { NextRequest, NextResponse } from 'next/server'
import { getSession } from '@/lib/auth'
import { getCollection } from '@/lib/mongodb'
import { ObjectId } from 'mongodb'
import { writeFile, mkdir, unlink } from 'fs/promises'
import path from 'path'

// POST - Upload document
export async function POST(request: NextRequest) {
  const session = await getSession()
  if (!session) {
    return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
  }

  try {
    const formData = await request.formData()
    const file = formData.get('file') as File | null
    const month = formData.get('month') as string | null

    if (!file || !month) {
      return NextResponse.json({ error: 'Fichier et mois requis' }, { status: 400 })
    }

    // Validate file type
    const validTypes = [
      'application/pdf',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/msword'
    ]
    if (!validTypes.includes(file.type)) {
      return NextResponse.json({ error: 'Type de fichier non supporté' }, { status: 400 })
    }

    // Validate file size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      return NextResponse.json({ error: 'Fichier trop volumineux (max 10MB)' }, { status: 400 })
    }

    // Create upload directory
    const uploadDir = path.join(process.cwd(), 'public', 'uploads', 'timesheets', session.userId.toString())
    await mkdir(uploadDir, { recursive: true })

    // Generate unique filename
    const timestamp = Date.now()
    const ext = path.extname(file.name)
    const safeName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_')
    const filename = `${month}_${timestamp}_${safeName}`
    const filepath = path.join(uploadDir, filename)

    // Write file
    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)
    await writeFile(filepath, buffer)

    // Create document record
    const document = {
      id: new ObjectId().toString(),
      name: file.name,
      type: file.type,
      size: file.size,
      filename,
      uploadedAt: new Date().toISOString(),
      url: `/uploads/timesheets/${session.userId}/${filename}`
    }

    // Update timesheet with document
    const timesheets = await getCollection('timesheets')
    const timesheetsAny = timesheets as unknown as { updateOne: (filter: object, update: object, options?: object) => Promise<unknown> }
    await timesheetsAny.updateOne(
      { userId: session.userId, month },
      {
        $push: { documents: document },
        $set: { updatedAt: new Date() }
      },
      { upsert: true }
    )

    return NextResponse.json({ success: true, document })
  } catch (error) {
    console.error('Document upload error:', error)
    return NextResponse.json({ error: 'Erreur lors de l\'upload' }, { status: 500 })
  }
}

// DELETE - Delete document
export async function DELETE(request: NextRequest) {
  const session = await getSession()
  if (!session) {
    return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
  }

  try {
    const { searchParams } = new URL(request.url)
    const docId = searchParams.get('id')

    if (!docId) {
      return NextResponse.json({ error: 'ID du document requis' }, { status: 400 })
    }

    const timesheets = await getCollection('timesheets')

    // Find the timesheet containing this document
    const timesheet = await timesheets.findOne({
      userId: session.userId,
      'documents.id': docId
    })

    if (!timesheet) {
      return NextResponse.json({ error: 'Document non trouvé' }, { status: 404 })
    }

    // Check if timesheet is not validated
    if (timesheet.status === 'validated') {
      return NextResponse.json({ error: 'Impossible de supprimer un document d\'un CRA validé' }, { status: 400 })
    }

    // Find the document to get filename
    const doc = timesheet.documents?.find((d: { id: string }) => d.id === docId)
    if (doc?.filename) {
      // Delete file from filesystem
      const filepath = path.join(process.cwd(), 'public', 'uploads', 'timesheets', session.userId.toString(), doc.filename)
      try {
        await unlink(filepath)
      } catch {
        // File might not exist, continue anyway
      }
    }

    // Remove document from timesheet
    const timesheetsUpdate = timesheets as unknown as { updateOne: (filter: object, update: object) => Promise<unknown> }
    await timesheetsUpdate.updateOne(
      { _id: timesheet._id },
      {
        $pull: { documents: { id: docId } },
        $set: { updatedAt: new Date() }
      }
    )

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Document delete error:', error)
    return NextResponse.json({ error: 'Erreur lors de la suppression' }, { status: 500 })
  }
}

// GET - List documents for a month
export async function GET(request: NextRequest) {
  const session = await getSession()
  if (!session) {
    return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
  }

  try {
    const { searchParams } = new URL(request.url)
    const month = searchParams.get('month')

    if (!month) {
      return NextResponse.json({ error: 'Paramètre month requis' }, { status: 400 })
    }

    const timesheets = await getCollection('timesheets')
    const timesheet = await timesheets.findOne({
      userId: session.userId,
      month
    })

    return NextResponse.json({
      documents: timesheet?.documents || []
    })
  } catch (error) {
    console.error('Documents GET error:', error)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}
