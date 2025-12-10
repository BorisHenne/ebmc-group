import { NextRequest, NextResponse } from 'next/server'
import { getSession } from '@/lib/auth'
import { createBoondClient, BoondEnvironment, BoondPermissionError } from '@/lib/boondmanager-client'

function getEnvironment(request: NextRequest): BoondEnvironment {
  const env = request.nextUrl.searchParams.get('env') || 'production'
  return env === 'sandbox' ? 'sandbox' : 'production'
}

// GET - Download document content
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getSession()
  if (!session) {
    return NextResponse.json({ error: 'Non autorise' }, { status: 401 })
  }

  const { id } = await params
  const documentId = parseInt(id)

  if (isNaN(documentId)) {
    return NextResponse.json({ error: 'ID de document invalide' }, { status: 400 })
  }

  const environment = getEnvironment(request)

  try {
    const client = createBoondClient(environment)
    const { content, filename, mimeType } = await client.downloadDocument(documentId)

    // Return the file as binary response
    return new NextResponse(content, {
      status: 200,
      headers: {
        'Content-Type': mimeType,
        'Content-Disposition': `inline; filename="${filename}"`,
        'Content-Length': content.byteLength.toString(),
        'Cache-Control': 'private, max-age=3600', // Cache for 1 hour
      },
    })

  } catch (error) {
    console.error('BoondManager document download error:', error)

    if (error instanceof BoondPermissionError) {
      return NextResponse.json({
        success: false,
        error: 'Acces refuse au document',
        permissionError: true,
        environment
      }, { status: 403 })
    }

    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Erreur inconnue',
      environment
    }, { status: 500 })
  }
}
