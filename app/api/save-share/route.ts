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
    let toStore = data

    if (size > MAX_BYTES) {
      // Retirer les photos base64 pour passer sous la limite
      toStore = { ...data, photosFond: [], photoFond: '', _photosStripped: true }
      const sizeStripped = new TextEncoder().encode(JSON.stringify(toStore)).length
      if (sizeStripped > MAX_BYTES) {
        return Response.json({ error: 'Données trop volumineuses même sans photos' }, { status: 413 })
      }
    }

    await redis.set(id, toStore)
    // Sauvegarder l'email des mariés séparément pour les notifications RSVP
    if (data.emailMaries) {
      await redis.set(`email:${id}`, data.emailMaries)
    }
    return Response.json({ id, photosStripped: toStore._photosStripped ?? false })
  } catch (err) {
    console.error('save-share error:', err)
    return Response.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}
