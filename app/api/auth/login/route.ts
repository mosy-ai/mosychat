import { NextRequest, NextResponse } from 'next/server'
import { createSession } from '@/lib/session'
import { findUserByUsername, verifyPassword, initDB } from '@/lib/db'

export async function POST(request: NextRequest) {
  try {
    await initDB()
    const { username, password } = await request.json()

    const user = await findUserByUsername(username)
    if (!user) {
      return NextResponse.json(
        { success: false, error: 'Invalid credentials' },
        { status: 401 }
      )
    }

    const isValidPassword = await verifyPassword(password, user.password)
    if (!isValidPassword) {
      return NextResponse.json(
        { success: false, error: 'Invalid credentials' },
        { status: 401 }
      )
    }

    await createSession(user.id, user.username, user.role)
    
    return NextResponse.json(
      { success: true, message: 'Login successful', user: { username: user.username, role: user.role } },
      { status: 200 }
    )
  } catch (error) {
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}
