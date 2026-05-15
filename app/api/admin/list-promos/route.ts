import { Redis } from '@upstash/redis'

const redis = new Redis({
  url: process.env.KV_REST_API_URL!,
  token: process.env.KV_REST_API_TOKEN!,
})

export async function GET(request: Request) {
  // Rate limiting admin
  const ip = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'unknown'
  const rlKey = `ratelimit:admin:${ip}`
  const attempts = await redis.get<number>(rlKey) ?? 0
  if (attempts >= 10) return Response.json({ error: 'Trop de tentatives' }, { status: 429 })
  await redis.set(rlKey, attempts + 1, { ex: 60 })

  const { searchParams } = new URL(request.url)
  if (searchParams.get('adminPassword') !== process.env.ADMIN_PASSWORD) {
    return Response.json({ error: 'Non autorisé' }, { status: 401 })
  }

  try {
    const keys = await redis.keys('promo:*')
    if (!keys.length) return Response.json([])

    const values = await Promise.all(
      keys.map(k => redis.get<Record<string, string>>(k))
    )

    interface PromoEntry extends Record<string, string> { createdAt: string }
    const promos = keys.map((k, i) => ({
      code: k.replace('promo:', ''),
      ...values[i] as PromoEntry,
    }))

    // Tri par date de création décroissante
    promos.sort((a, b) => (b.createdAt || '').localeCompare(a.createdAt || ''))

    return Response.json(promos)
  } catch (err) {
    return Response.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}
