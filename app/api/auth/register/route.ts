import { redis } from '@/lib/redis'
import { createSession, type User } from '@/lib/auth'
import bcrypt from 'bcryptjs'

export async function POST(request: Request) {
  try {
    const { email, password } = await request.json()

    if (!email || !password) {
      return Response.json({ error: 'Email et mot de passe requis' }, { status: 400 })
    }

    const normalizedEmail = email.toLowerCase().trim()

    // Rate limiting : 5 inscriptions par minute par email
    const rlKey = `ratelimit:register:${normalizedEmail}`
    const rlAttempts = await redis.get<number>(rlKey) ?? 0
    if (rlAttempts >= 5) {
      return Response.json({ error: 'Trop de tentatives. Réessayez dans une minute.' }, { status: 429 })
    }
    await redis.set(rlKey, rlAttempts + 1, { ex: 60 })

    if (password.length < 8) {
      return Response.json({ error: 'Le mot de passe doit contenir au moins 8 caractères' }, { status: 400 })
    }

    // Vérifier si l'email existe déjà
    const existing = await redis.get<User>(`user:${normalizedEmail}`)
    if (existing) {
      return Response.json({ error: 'Un compte existe déjà avec cet email' }, { status: 409 })
    }

    // Créer l'utilisateur
    const passwordHash = await bcrypt.hash(password, 12)
    const user: User = {
      email: normalizedEmail,
      passwordHash,
      needsPassword: false,
      createdAt: new Date().toISOString(),
      faireparts: [],
    }

    await redis.set(`user:${normalizedEmail}`, user)

    // Créer la session
    await createSession(normalizedEmail)

    return Response.json({ ok: true, email: normalizedEmail })
  } catch (err) {
    return Response.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}
