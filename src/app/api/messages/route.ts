import { getPayloadHMR } from '@payloadcms/next/utilities'
import config from '@payload-config'
import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'

const messageSchema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  phone: z.string().optional(),
  company: z.string().optional(),
  type: z.enum(['general', 'project', 'partnership', 'careers', 'support', 'press']).default('general'),
  subject: z.string().min(5),
  message: z.string().min(20),
})

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    // Validate
    const result = messageSchema.safeParse(body)
    if (!result.success) {
      return NextResponse.json(
        { error: 'Invalid data', details: result.error.flatten() },
        { status: 400 }
      )
    }

    const data = result.data
    const payload = await getPayloadHMR({ config })

    // Get request metadata
    const ip = request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown'
    const userAgent = request.headers.get('user-agent') || 'unknown'
    const referer = request.headers.get('referer') || ''

    // Create message
    const message = await payload.create({
      collection: 'messages',
      data: {
        ...data,
        status: 'new',
        metadata: {
          ip,
          userAgent,
          source: 'website',
          referer,
        },
      },
    })

    // Trigger Make.com webhook if configured
    const webhookUrl = process.env.MAKE_WEBHOOK_CONTACT
    if (webhookUrl) {
      try {
        await fetch(webhookUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            id: message.id,
            name: data.name,
            email: data.email,
            type: data.type,
            subject: data.subject,
            createdAt: new Date().toISOString(),
          }),
        })
      } catch (webhookError) {
        console.error('Webhook error:', webhookError)
        // Don't fail the request if webhook fails
      }
    }

    return NextResponse.json(
      { success: true, id: message.id },
      { status: 201 }
    )
  } catch (error) {
    console.error('Message creation error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function GET() {
  return NextResponse.json(
    { error: 'Method not allowed' },
    { status: 405 }
  )
}
