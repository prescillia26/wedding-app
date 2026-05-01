import { redis } from '@/lib/redis'
import { getCurrentUser, type User } from '@/lib/auth'
import bcrypt from 'bcryptjs'

export async function POST(request: Request) {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return Response.json({ error: 'Non connecté' }, { status: 401 })
    }

    const { password } = await request.json()

    if (!password || password.length < 8) {
      return Response.json({ error: 'Le mot de passe doit contenir au moins 8 caractères' }, { status: 400 })
    }

    const passwordHash = await bcrypt.hash(password, 12)

    const updatedUser: User = {
      ...user,
      passwordHash,
      needsPassword: false,
    }

    await redis.set(`user:${user.email}`, updatedUser)

    return Response.json({ ok: true })
  } catch (err) {
    console.error('set-password error:', err)
    return Response.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}
