import { NextRequest, NextResponse } from 'next/server'
import { getSession } from '@/lib/auth'
import { createBoondClient, BoondEnvironment } from '@/lib/boondmanager-client'

function getEnvironment(request: NextRequest): BoondEnvironment {
  const env = request.nextUrl.searchParams.get('env') || 'sandbox'
  return env === 'production' ? 'production' : 'sandbox'
}

// GET - Get single candidate with details
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getSession()
  if (!session) {
    return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
  }

  const { id } = await params
  const environment = getEnvironment(request)
  const tab = request.nextUrl.searchParams.get('tab') || 'information'

  try {
    const client = createBoondClient(environment)
    const candidateId = parseInt(id)

    let result

    switch (tab) {
      case 'information':
        result = await client.getCandidateInformation(candidateId)
        break
      case 'actions':
        result = await client.getCandidateActions(candidateId)
        break
      default:
        result = await client.getCandidate(candidateId)
    }

    return NextResponse.json({
      success: true,
      environment,
      data: result.data,
      included: result.included
    })

  } catch (error) {
    console.error('BoondManager candidate GET error:', error)
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Erreur inconnue',
      environment
    }, { status: 500 })
  }
}
