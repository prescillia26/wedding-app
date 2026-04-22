import { Redis } from '@upstash/redis'
import { randomUUID } from 'crypto'

const redis = new Redis({
  url: process.env.KV_REST_API_URL!,
  token: process.env.KV_REST_API_TOKEN!,
})

const MAX_BYTES = 900_000

export async function POST(request: Request) {
  try {
    const data = await request.json()
    const { fixedId, ...shareData } = data

    // Si un ID fixe existe → on réutilise le même, sinon on en crée un nouveau
    const id = fixedId ?? randomUUID()

    const size = new TextEncoder().encode(JSON.stringify(shareData)).length
    if (size > MAX_BYTES) {
      return Response.json({ error: 'Données trop volumineuses.' }, { status: 413 })
    }

    await redis.set(id, shareData, { ex: 31536000 })

    if (shareData.emailMaries) {
      await redis.set(`email:${id}`, shareData.emailMaries, { ex: 31536000 })
    }

    return Response.json({ id })
  } catch (err) {
    console.error('save-share error:', err)
    return Response.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}