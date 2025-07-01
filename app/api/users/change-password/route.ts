import { NextRequest, NextResponse } from 'next/server'
import { verifySession } from '@/lib/session'
import { updateUserPassword, findUserById, verifyPassword, initDB } from '@/lib/db'

export async function POST(request: NextRequest) {
  try {
    const session = await verifySession()
    if (!session) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      )
    }

    await initDB()
    const { currentPassword, newPassword, targetUserId } = await request.json()

    // If targetUserId is provided, only admin can change other users' passwords
    if (targetUserId && targetUserId !== session.userId) {
      if (session.role !== 'admin') {
        return NextResponse.json(
          { success: false, error: 'Unauthorized' },
          { status: 401 }
        )
      }
      // Admin changing another user's password - no current password required
      const success = await updateUserPassword(targetUserId, newPassword)
      if (!success) {
        return NextResponse.json(
          { success: false, error: 'User not found' },
          { status: 404 }
        )
      }
    } else {
      // User changing their own password
      const user = await findUserById(session.userId)
      if (!user) {
        return NextResponse.json(
          { success: false, error: 'User not found' },
          { status: 404 }
        )
      }

      const isValidCurrentPassword = await verifyPassword(currentPassword, user.password)
      if (!isValidCurrentPassword) {
        return NextResponse.json(
          { success: false, error: 'Current password is incorrect' },
          { status: 400 }
        )
      }

      await updateUserPassword(session.userId, newPassword)
    }
    
    return NextResponse.json(
      { success: true, message: 'Password updated successfully' },
      { status: 200 }
    )
  } catch (error) {
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}
