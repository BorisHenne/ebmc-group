import { NextResponse } from 'next/server'

export async function GET() {
  const healthcheck = {
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV,
  }

  try {
    return NextResponse.json(healthcheck, { status: 200 })
  } catch (error) {
    return NextResponse.json(
      { 
        status: 'unhealthy', 
        error: error instanceof Error ? error.message : 'Unknown error' 
      },
      { status: 503 }
    )
  }
}
