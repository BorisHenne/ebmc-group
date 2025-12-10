import { NextRequest, NextResponse } from 'next/server'
import { getSession } from '@/lib/auth'
import { createBoondClient, BoondEnvironment, BoondPermissionError } from '@/lib/boondmanager-client'

function getEnvironment(request: NextRequest): BoondEnvironment {
  const env = request.nextUrl.searchParams.get('env') || 'production'
  return env === 'sandbox' ? 'sandbox' : 'production'
}

// GET - Get resumes/CVs for a resource
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getSession()
  if (!session) {
    return NextResponse.json({ error: 'Non autorise' }, { status: 401 })
  }

  const { id } = await params
  const resourceId = parseInt(id)

  if (isNaN(resourceId)) {
    return NextResponse.json({ error: 'ID de ressource invalide' }, { status: 400 })
  }

  const environment = getEnvironment(request)

  try {
    const client = createBoondClient(environment)
    const documents = await client.getResourceResumes(resourceId)

    return NextResponse.json({
      success: true,
      environment,
      resourceId,
      data: documents,
      count: documents.length
    })

  } catch (error) {
    console.error('BoondManager resource resumes error:', error)

    if (error instanceof BoondPermissionError) {
      return NextResponse.json({
        success: false,
        error: 'Acces refuse aux documents',
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
