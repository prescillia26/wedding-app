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

    const id = fixedId ?? randomUUID()

    const size = new TextEncoder().encode(JSON.stringify(shareData)).length
    if (size > MAX_BYTES) {
      return Response.json({ error: 'Données trop volumineuses.' }, { status: 413 })
    }

    await redis.set(id, shareData, { ex: 31536000 })

    if (shareData.emailMaries) {
      await redis.set(`email:${id}`, shareData.emailMaries, { ex: 31536000 })
    }

    // Debug slug
    console.log('slug reçu:', shareData.slug)

    if (shareData.slug) {
      const slug = shareData.slug.toLowerCase().replace(/[^a-z0-9-]/g, '')
      console.log('slug nettoyé:', slug)
      if (slug) {
        await redis.set(`slug:${slug}`, id, { ex: 31536000 })
        console.log('slug sauvegardé dans Redis:', slug, '→', id)
      }
    }

    return Response.json({ id, slug: shareData.slug || null })
  } catch (err) {
    console.error('save-share error:', err)
    return Response.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}