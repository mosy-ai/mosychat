import { NextResponse } from 'next/server'
import { verifySession } from '@/lib/session'

export async function GET() {
  try {
    const session = await verifySession()
    
    if (session) {
      console.log('Session verified:', session)
      return NextResponse.json(
        { 
          success: true, 
          authenticated: session.isValid,
          user: { 
            userId: session.userId, 
            username: session.username,
            role: session.role,
            langgr_url: session.langgr_url || null,
            agent_name: session.agent_name || null
          }
        },
        { status: 200 }
      )
    } else {
      return NextResponse.json(
        { success: true, authenticated: false },
        { status: 200 }
      )
    }
  } catch (error) {
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}
