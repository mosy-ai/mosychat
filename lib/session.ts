import { SignJWT, jwtVerify, JWTPayload } from 'jose'
import { cookies } from 'next/headers'
import { NextRequest } from 'next/server'

const secretKey = process.env.SESSION_SECRET
const encodedKey = new TextEncoder().encode(secretKey)

export interface SessionPayload extends JWTPayload {
  userId: string
  username: string
  role: 'admin' | 'user'
  langgr_url?: string | null
  agent_name?: string | null
  expiresAt: Date
}

export async function encrypt(payload: SessionPayload) {
  return new SignJWT(payload)
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('24h')
    .sign(encodedKey)
}

export async function decrypt(session: string | undefined = '') {
  try {
    if (!session || typeof session !== 'string' || session.split('.').length !== 3) {
      return null
    }

    const { payload } = await jwtVerify(session, encodedKey, {
      algorithms: ['HS256'],
    })
    return payload as SessionPayload
  } catch (error) {
    // Silently handle JWT verification errors - invalid tokens are expected
    return null
  }
}

export async function createSession(userId: string, username: string, role: 'admin' | 'user') {
  const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000) // 24 hours
  const session = await encrypt({ userId, username, role, expiresAt, langgr_url: null, agent_name: null })

  const cookieStore = await cookies()
  cookieStore.set('session', session, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    expires: expiresAt,
    sameSite: 'lax',
    path: '/',
  })
}

export async function verifySession() {
  const cookieStore = await cookies()
  const cookie = cookieStore.get('session')?.value
  const session = await decrypt(cookie)

  if (!session?.userId) {
    return {
      isValid: false,
      error: 'No valid session found',
      userId: null,
      username: null,
      role: null,
      langgr_url: null,
      agent_name: null,
      sessionExpiry: null
    }
  }

  try {
    // Get fresh user data from database to ensure latest agent config
    const { findUserById } = await import('./db')
    const user = await findUserById(session.userId)
    
    if (!user) {
      return {
        isValid: false,
        error: 'User not found in database',
        userId: session.userId,
        username: session.username,
        role: session.role,
        langgr_url: null,
        agent_name: null,
        sessionExpiry: session.expiresAt
      }
    }

    return { 
      isValid: true,
      error: null,
      userId: session.userId, 
      username: session.username, 
      role: session.role, 
      langgr_url: user.langgr_url, 
      agent_name: user.agent_name,
      sessionExpiry: session.expiresAt,
      userLastUpdated: user.updated_at || null
    }
  } catch (dbError) {
    console.error('Database error during session verification:', dbError)
    return {
      isValid: false,
      error: `Database connection failed: ${dbError instanceof Error ? dbError.message : 'Unknown error'}`,
      userId: session.userId,
      username: session.username,
      role: session.role,
      langgr_url: null,
      agent_name: null,
      sessionExpiry: session.expiresAt
    }
  }
}

export async function deleteSession() {
  const cookieStore = await cookies()
  cookieStore.delete('session')
}

export async function verifySessionFromRequest(request: NextRequest) {
  const cookie = request.cookies.get('session')?.value
  const session = await decrypt(cookie)

  if (!session?.userId) {
    return {
      isValid: false,
      error: 'No valid session found',
      userId: null,
      username: null,
      role: null,
      langgr_url: null,
      agent_name: null,
      sessionExpiry: null
    }
  }

  try {
    // Get fresh user data from database to ensure latest agent config
    const { findUserById } = await import('./db')
    const user = await findUserById(session.userId)
    
    if (!user) {
      return {
        isValid: false,
        error: 'User not found in database',
        userId: session.userId,
        username: session.username,
        role: session.role,
        langgr_url: null,
        agent_name: null,
        sessionExpiry: session.expiresAt
      }
    }

    return { 
      isValid: true,
      error: null,
      userId: session.userId, 
      username: session.username, 
      role: session.role, 
      langgr_url: user.langgr_url, 
      agent_name: user.agent_name,
      sessionExpiry: session.expiresAt,
      userLastUpdated: user.updated_at || null
    }
  } catch (dbError) {
    console.error('Database error during session verification:', dbError)
    return {
      isValid: false,
      error: `Database connection failed: ${dbError instanceof Error ? dbError.message : 'Unknown error'}`,
      userId: session.userId,
      username: session.username,
      role: session.role,
      langgr_url: null,
      agent_name: null,
      sessionExpiry: session.expiresAt
    }
  }
}
