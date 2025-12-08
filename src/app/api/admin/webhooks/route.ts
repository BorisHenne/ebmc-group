import { NextRequest, NextResponse } from 'next/server'
import { getSession } from '@/lib/auth'
import { getCollection } from '@/lib/mongodb'

export async function GET() {
  const session = await getSession()
  if (!session || session.role !== 'admin') {
    return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
  }

  try {
    const webhooks = await getCollection('webhooks')
    const allWebhooks = await webhooks.find({}).toArray()

    // Return default config structure if empty
    if (allWebhooks.length === 0) {
      const defaultConfig = {
        make: {
          enabled: false,
          webhooks: {
            newCandidate: process.env.MAKE_WEBHOOK_NEW_CANDIDATE || '',
            newOffer: process.env.MAKE_WEBHOOK_NEW_OFFER || '',
            application: process.env.MAKE_WEBHOOK_APPLICATION || '',
            contact: process.env.MAKE_WEBHOOK_CONTACT || '',
            sync: process.env.MAKE_WEBHOOK_SYNC || '',
          }
        },
        boondmanager: {
          enabled: false,
          prodUrl: process.env.BOOND_PROD_URL || 'https://ui.boondmanager.com/api',
          prodClientId: process.env.BOOND_PROD_CLIENT_ID || '',
          prodUsername: process.env.BOOND_PROD_USERNAME || '',
          prodToken: process.env.BOOND_PROD_TOKEN || '',
          sandboxUrl: process.env.BOOND_SANDBOX_URL || 'https://sandbox.boondmanager.com/api',
          sandboxClientId: process.env.BOOND_SANDBOX_CLIENT_ID || '',
          sandboxUsername: process.env.BOOND_SANDBOX_USERNAME || '',
          sandboxToken: process.env.BOOND_SANDBOX_TOKEN || '',
          useSandbox: process.env.BOOND_USE_SANDBOX === 'true',
        }
      }
      return NextResponse.json({ config: defaultConfig })
    }

    return NextResponse.json({ config: allWebhooks[0].config })
  } catch (error) {
    console.error('Error fetching webhooks:', error)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}

export async function PUT(request: NextRequest) {
  const session = await getSession()
  if (!session || session.role !== 'admin') {
    return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
  }

  try {
    const config = await request.json()
    const webhooks = await getCollection('webhooks')

    // Upsert the config
    await webhooks.updateOne(
      {},
      { $set: { config, updatedAt: new Date() } },
      { upsert: true }
    )

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error updating webhooks:', error)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  const session = await getSession()
  if (!session || session.role !== 'admin') {
    return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
  }

  try {
    const { type, webhookName, data } = await request.json()

    // Test webhook by sending data
    const webhooks = await getCollection('webhooks')
    const config = await webhooks.findOne({})

    let url = ''
    if (type === 'make' && config?.config?.make?.webhooks?.[webhookName]) {
      url = config.config.make.webhooks[webhookName]
    }

    if (!url) {
      return NextResponse.json({ error: 'URL webhook non configurée' }, { status: 400 })
    }

    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data || { test: true, timestamp: new Date().toISOString() })
    })

    return NextResponse.json({
      success: response.ok,
      status: response.status,
      message: response.ok ? 'Webhook envoyé avec succès' : 'Erreur lors de l\'envoi'
    })
  } catch (error) {
    console.error('Error testing webhook:', error)
    return NextResponse.json({ error: 'Erreur lors du test' }, { status: 500 })
  }
}
