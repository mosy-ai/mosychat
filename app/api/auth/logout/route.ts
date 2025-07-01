import { NextResponse } from 'next/server'
import { deleteSession } from '@/lib/session'

export async function POST() {
  try {
    await deleteSession()
    
    return NextResponse.json(
      { success: true, message: 'Logout successful' },
      { status: 200 }
    )
  } catch (error) {
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}
