import { getPayloadHMR } from '@payloadcms/next/utilities'
import config from '@payload-config'
import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'

const applicationSchema = z.object({
  firstName: z.string().min(2),
  lastName: z.string().min(2),
  email: z.string().email(),
  phone: z.string().optional(),
  linkedinUrl: z.string().url().optional().or(z.literal('')),
  coverLetter: z.string().optional(),
  offerId: z.string(),
  gdprConsent: z.boolean().refine((v) => v === true),
})

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    
    // Extract fields
    const data = {
      firstName: formData.get('firstName') as string,
      lastName: formData.get('lastName') as string,
      email: formData.get('email') as string,
      phone: formData.get('phone') as string || undefined,
      linkedinUrl: formData.get('linkedinUrl') as string || undefined,
      coverLetter: formData.get('coverLetter') as string || undefined,
      offerId: formData.get('offerId') as string,
      gdprConsent: formData.get('gdprConsent') === 'true',
    }

    // Validate
    const result = applicationSchema.safeParse(data)
    if (!result.success) {
      return NextResponse.json(
        { error: 'Invalid data', details: result.error.flatten() },
        { status: 400 }
      )
    }

    const payload = await getPayloadHMR({ config })

    // Check if offer exists
    const offer = await payload.findByID({
      collection: 'offers',
      id: data.offerId,
    })

    if (!offer) {
      return NextResponse.json(
        { error: 'Offer not found' },
        { status: 404 }
      )
    }

    // Check for existing candidate or create new one
    const existingCandidates = await payload.find({
      collection: 'candidates',
      where: { email: { equals: data.email } },
      limit: 1,
    })

    let candidateId: string

    if (existingCandidates.docs.length > 0) {
      candidateId = existingCandidates.docs[0].id.toString()
    } else {
      // Create new candidate
      const newCandidate = await payload.create({
        collection: 'candidates',
        data: {
          firstName: data.firstName,
          lastName: data.lastName,
          email: data.email,
          phone: data.phone,
          linkedinUrl: data.linkedinUrl,
          status: 'new',
          source: 'website',
          gdprConsent: true,
          gdprConsentDate: new Date().toISOString(),
        },
      })
      candidateId = newCandidate.id.toString()
    }

    // Handle CV upload
    let cvId: string | undefined
    const cvFile = formData.get('cv') as File | null
    
    if (cvFile && cvFile.size > 0) {
      const buffer = await cvFile.arrayBuffer()
      const media = await payload.create({
        collection: 'media',
        data: {
          alt: `CV - ${data.firstName} ${data.lastName}`,
          category: 'cv',
        },
        file: {
          data: Buffer.from(buffer),
          mimetype: cvFile.type,
          name: cvFile.name,
          size: cvFile.size,
        },
      })
      cvId = media.id.toString()

      // Update candidate with CV
      await payload.update({
        collection: 'candidates',
        id: candidateId,
        data: {
          cv: cvId,
        },
      })
    }

    // Get source tracking
    const referer = request.headers.get('referer') || ''
    const url = new URL(request.url)
    const utmParams: Record<string, string> = {}
    url.searchParams.forEach((value, key) => {
      if (key.startsWith('utm_')) {
        utmParams[key] = value
      }
    })

    // Create application
    const application = await payload.create({
      collection: 'applications',
      data: {
        candidate: candidateId,
        offer: data.offerId,
        coverLetter: data.coverLetter,
        status: 'received',
        source: {
          page: referer,
          referrer: referer,
          utmParams: Object.keys(utmParams).length > 0 ? JSON.stringify(utmParams) : undefined,
        },
      },
    })

    // Trigger Make.com webhook if configured
    const webhookUrl = process.env.MAKE_WEBHOOK_APPLICATION
    if (webhookUrl) {
      try {
        await fetch(webhookUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            id: application.id.toString(),
            candidateId,
            candidateName: `${data.firstName} ${data.lastName}`,
            candidateEmail: data.email,
            offerId: data.offerId,
            offerTitle: offer.title,
            status: 'received',
            createdAt: new Date().toISOString(),
          }),
        })
      } catch (webhookError) {
        console.error('Webhook error:', webhookError)
      }
    }

    return NextResponse.json(
      { 
        success: true, 
        applicationId: application.id.toString(),
        candidateId,
      },
      { status: 201 }
    )
  } catch (error) {
    console.error('Application creation error:', error)
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