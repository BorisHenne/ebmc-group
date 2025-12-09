import { NextRequest, NextResponse } from 'next/server'
import { getSession } from '@/lib/auth'
import { createBoondClient, BoondEnvironment } from '@/lib/boondmanager-client'

function getEnvironment(request: NextRequest): BoondEnvironment {
  const env = request.nextUrl.searchParams.get('env') || 'sandbox'
  return env === 'production' ? 'production' : 'sandbox'
}

// GET - Get single project with details
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getSession()
  if (!session) {
    return NextResponse.json({ error: 'Non autorise' }, { status: 401 })
  }

  const { id } = await params
  const environment = getEnvironment(request)
  const tab = request.nextUrl.searchParams.get('tab') || 'information'

  try {
    const client = createBoondClient(environment)
    const projectId = parseInt(id)

    let result

    switch (tab) {
      case 'information':
        result = await client.getProjectInformation(projectId)
        break
      case 'actions':
        result = await client.getProjectActions(projectId)
        break
      case 'batches-markers':
        result = await client.getProjectBatchesMarkers(projectId)
        break
      case 'deliveries':
        result = await client.getProjectDeliveries(projectId)
        break
      default:
        result = await client.getProject(projectId)
    }

    return NextResponse.json({
      success: true,
      environment,
      data: result.data,
      included: result.included
    })

  } catch (error) {
    console.error('BoondManager project GET error:', error)
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Erreur inconnue',
      environment
    }, { status: 500 })
  }
}
