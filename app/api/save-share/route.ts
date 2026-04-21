import { Redis } from '@upstash/redis'
import { randomUUID } from 'crypto'

const redis = new Redis({
  url: process.env.KV_REST_API_URL!,
  token: process.env.KV_REST_API_TOKEN!,
})

const MAX_BYTES = 900_000 // 900KB — marge de sécurité sous la limite Upstash 1MB

export async function POST(request: Request) {
  try {
    const data = await request.json()
    const id = randomUUID()

    const size = new TextEncoder().encode(JSON.stringify(data)).length
    if (size > MAX_BYTES) {
      return Response.json({ error: 'Données trop volumineuses. Veuillez réduire la taille des photos.' }, { status: 413 })
    }

    await redis.set(id, data, { ex: 31536000 }) // 365 jours
    if (data.emailMaries) {
      await redis.set(`email:${id}`, data.emailMaries, { ex: 31536000 })
    }
    return Response.json({ id })
  } catch (err) {
    console.error('save-share error:', err)
    return Response.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}
