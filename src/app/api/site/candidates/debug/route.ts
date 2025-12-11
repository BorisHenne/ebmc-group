import { NextRequest, NextResponse } from 'next/server'
import { getSession } from '@/lib/auth'
import { connectToDatabase } from '@/lib/mongodb'

// Debug endpoint to check raw MongoDB candidate data
export async function GET(request: NextRequest) {
  const session = await getSession()
  if (!session) {
    return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
  }

  try {
    const db = await connectToDatabase()
    const searchParams = request.nextUrl.searchParams
    const limit = parseInt(searchParams.get('limit') || '10')

    // Get raw candidates from MongoDB without any transformation
    const rawCandidates = await db.collection('candidates')
      .find({})
      .sort({ updatedAt: -1 })
      .limit(limit)
      .toArray()

    // Analyze the structure
    const analysis = {
      totalCount: await db.collection('candidates').countDocuments(),
      sampleCount: rawCandidates.length,
      fieldsPresent: new Set<string>(),
      fieldsWithValues: new Map<string, number>(),
      fieldsEmpty: new Map<string, number>(),
    }

    // Analyze each candidate
    for (const candidate of rawCandidates) {
      for (const [key, value] of Object.entries(candidate)) {
        analysis.fieldsPresent.add(key)

        const hasValue = value !== undefined && value !== null && value !== ''
        if (hasValue) {
          analysis.fieldsWithValues.set(key, (analysis.fieldsWithValues.get(key) || 0) + 1)
        } else {
          analysis.fieldsEmpty.set(key, (analysis.fieldsEmpty.get(key) || 0) + 1)
        }
      }
    }

    // Count how many have firstName, lastName
    const withFirstName = rawCandidates.filter(c => c.firstName && c.firstName.trim() !== '').length
    const withLastName = rawCandidates.filter(c => c.lastName && c.lastName.trim() !== '').length
    const withEmail = rawCandidates.filter(c => c.email && c.email.trim() !== '').length
    const withBoondId = rawCandidates.filter(c => c.boondManagerId !== undefined).length

    // Check for "attributes" field (might indicate unmapped data)
    const withAttributes = rawCandidates.filter(c => 'attributes' in c).length

    return NextResponse.json({
      success: true,
      analysis: {
        totalInDB: analysis.totalCount,
        sampleSize: analysis.sampleCount,
        withFirstName,
        withLastName,
        withEmail,
        withBoondId,
        withAttributesField: withAttributes,
        fieldsPresent: Array.from(analysis.fieldsPresent),
        fieldsWithValues: Object.fromEntries(analysis.fieldsWithValues),
        fieldsEmpty: Object.fromEntries(analysis.fieldsEmpty),
      },
      // Show first 5 raw documents for inspection
      rawSamples: rawCandidates.slice(0, 5).map(c => ({
        _id: String(c._id),
        boondManagerId: c.boondManagerId,
        firstName: c.firstName,
        lastName: c.lastName,
        email: c.email,
        state: c.state,
        stateLabel: c.stateLabel,
        // Check if there's an 'attributes' field (shouldn't be)
        hasAttributesField: 'attributes' in c,
        attributes: c.attributes, // This should be undefined if properly mapped
        // All raw fields for debugging
        allKeys: Object.keys(c),
        // Show full raw object for first candidate
        ...(rawCandidates.indexOf(c) === 0 ? { fullRaw: c } : {}),
      })),
    })

  } catch (error) {
    console.error('Debug candidates error:', error)
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Erreur inconnue',
    }, { status: 500 })
  }
}
