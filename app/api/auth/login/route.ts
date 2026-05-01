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

    // Rate limiting : 3 tentatives par minute par email
    const rateLimitKey = `ratelimit:login:${normalizedEmail}`
    const attempts = await redis.get<number>(rateLimitKey) ?? 0
    if (attempts >= 3) {
      return Response.json(
        { error: 'Trop de tentatives. Réessayez dans une minute.' },
        { status: 429 }
      )
    }

    // Incrémenter le compteur (expire après 60s)
    await redis.set(rateLimitKey, attempts + 1, { ex: 60 })

    // Vérifier l'utilisateur
    const user = await redis.get<User>(`user:${normalizedEmail}`)
    if (!user) {
      return Response.json({ error: 'Email ou mot de passe incorrect' }, { status: 401 })
    }
    if (!user.passwordHash) {
      return Response.json({ error: 'needsPassword' }, { status: 401 })
    }

    const valid = await bcrypt.compare(password, user.passwordHash)
    if (!valid) {
      return Response.json({ error: 'Email ou mot de passe incorrect' }, { status: 401 })
    }

    // Supprimer le rate limit après un login réussi
    await redis.del(rateLimitKey)

    // Créer la session
    await createSession(normalizedEmail)

    return Response.json({ ok: true, email: normalizedEmail })
  } catch (err) {
    console.error('login error:', err)
    return Response.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}
