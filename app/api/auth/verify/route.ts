import { redis } from '@/lib/redis'
import { createSession } from '@/lib/auth'

interface MagicToken {
  email: string
  expiresAt: number
  used: boolean
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const token = searchParams.get('token')

    if (!token) {
      return Response.json({ error: 'Token manquant' }, { status: 400 })
    }

    const magic = await redis.get<MagicToken>(`magic:${token}`)
    if (!magic) {
      return Response.json({ error: 'Lien invalide ou expiré' }, { status: 401 })
    }

    if (magic.used) {
      return Response.json({ error: 'Ce lien a déjà été utilisé' }, { status: 401 })
    }

    if (Date.now() > magic.expiresAt) {
      await redis.del(`magic:${token}`)
      return Response.json({ error: 'Ce lien a expiré' }, { status: 401 })
    }

    // Marquer comme utilisé
    await redis.set(`magic:${token}`, { ...magic, used: true }, { ex: 60 })

    // Créer la session
    await createSession(magic.email)

    return Response.json({ ok: true, email: magic.email })
  } catch (err) {
    console.error('verify error:', err)
    return Response.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}
