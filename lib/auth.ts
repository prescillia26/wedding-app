import { cookies } from 'next/headers'
import { redis } from './redis'

const SESSION_COOKIE = 'lovit_session'
const SESSION_DURATION = 30 * 24 * 60 * 60 // 30 jours en secondes

export interface User {
  email: string
  passwordHash: string | null
  needsPassword: boolean
  createdAt: string
  faireparts: string[]
  locale?: string
}

export interface Session {
  email: string
  expiresAt: number
}

/** Lit le cookie de session et retourne la session si valide */
export async function getSession(): Promise<Session | null> {
  const cookieStore = await cookies()
  const token = cookieStore.get(SESSION_COOKIE)?.value
  if (!token) return null

  const session = await redis.get<Session>(`session:${token}`)
  if (!session) return null

  if (Date.now() > session.expiresAt) {
    await redis.del(`session:${token}`)
    return null
  }

  return session
}

/** Retourne l'utilisateur connecté ou null */
export async function getCurrentUser(): Promise<User | null> {
  const session = await getSession()
  if (!session) return null

  const user = await redis.get<User>(`user:${session.email}`)
  return user
}

/** Crée une session et set le cookie. Retourne le token. */
export async function createSession(email: string): Promise<string> {
  const token = crypto.randomUUID() + crypto.randomUUID() // 64+ chars
  const expiresAt = Date.now() + SESSION_DURATION * 1000

  await redis.set(`session:${token}`, { email, expiresAt }, { ex: SESSION_DURATION })

  const cookieStore = await cookies()
  cookieStore.set(SESSION_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: SESSION_DURATION,
  })

  return token
}

/** Supprime la session courante */
export async function destroySession(): Promise<void> {
  const cookieStore = await cookies()
  const token = cookieStore.get(SESSION_COOKIE)?.value
  if (token) {
    await redis.del(`session:${token}`)
  }
  cookieStore.set(SESSION_COOKIE, '', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: 0,
  })
}
