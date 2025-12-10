import { NextRequest, NextResponse } from 'next/server'
import { getSession } from '@/lib/auth'
import { createBoondClient, BoondEnvironment, BOOND_FEATURES } from '@/lib/boondmanager-client'

function getEnvironment(request: NextRequest): BoondEnvironment {
  const env = request.nextUrl.searchParams.get('env') || 'sandbox'
  return env === 'production' ? 'production' : 'sandbox'
}

// GET - Get single company with details
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
    const companyId = parseInt(id)

    let result

    switch (tab) {
      case 'information':
        result = await client.getCompanyInformation(companyId)
        break
      case 'contacts':
        // Return empty when contacts API is disabled
        if (!BOOND_FEATURES.CONTACTS_ENABLED) {
          return NextResponse.json({
            success: true,
            environment,
            data: [],
            disabled: true,
            message: 'API Contacts desactivee'
          })
        }
        result = await client.getCompanyContacts(companyId)
        break
      case 'opportunities':
        result = await client.getCompanyOpportunities(companyId)
        break
      case 'projects':
        result = await client.getCompanyProjects(companyId)
        break
      default:
        result = await client.getCompany(companyId)
    }

    return NextResponse.json({
      success: true,
      environment,
      data: result.data,
      included: result.included
    })

  } catch (error) {
    console.error('BoondManager company GET error:', error)
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Erreur inconnue',
      environment
    }, { status: 500 })
  }
}
