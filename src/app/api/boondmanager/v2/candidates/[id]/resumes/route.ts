import { NextRequest, NextResponse } from 'next/server'
import { getSession } from '@/lib/auth'
import { createBoondClient, BoondEnvironment, BoondPermissionError } from '@/lib/boondmanager-client'

function getEnvironment(request: NextRequest): BoondEnvironment {
  const env = request.nextUrl.searchParams.get('env') || 'production'
  return env === 'sandbox' ? 'sandbox' : 'production'
}

// GET - Get resumes/CVs for a candidate
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getSession()
  if (!session) {
    return NextResponse.json({ error: 'Non autorise' }, { status: 401 })
  }

  const { id } = await params
  const candidateId = parseInt(id)

  if (isNaN(candidateId)) {
    return NextResponse.json({ error: 'ID de candidat invalide' }, { status: 400 })
  }

  const environment = getEnvironment(request)

  try {
    const client = createBoondClient(environment)
    const documents = await client.getCandidateResumes(candidateId)

    return NextResponse.json({
      success: true,
      environment,
      candidateId,
      data: documents,
      count: documents.length
    })

  } catch (error) {
    console.error('BoondManager candidate resumes error:', error)

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
