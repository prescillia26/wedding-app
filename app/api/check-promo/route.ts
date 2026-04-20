import { Redis } from '@upstash/redis'

const redis = new Redis({
  url: process.env.KV_REST_API_URL!,
  token: process.env.KV_REST_API_TOKEN!,
})

export async function POST(request: Request) {
  try {
    const { code } = await request.json() as { code: string }
    const normalized = code?.toUpperCase().trim()
    if (!normalized) return Response.json({ valid: false })

    const data = await redis.get<Record<string, string>>(`promo:${normalized}`)
    if (!data) return Response.json({ valid: false })

    // Générer un code d'accès et le stocker
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'
    let accessCode = ''
    for (let i = 0; i < 6; i++) accessCode += chars[Math.floor(Math.random() * chars.length)]

    const entry = { pack: data.pack || 'premium', email: data.email || '', promo: normalized, date: new Date().toISOString() }
    await redis.set(`access:${accessCode}`, entry, { ex: 60 * 60 * 24 * 365 })

    return Response.json({ valid: true, accessCode, ...data })
  } catch (err) {
    console.error('check-promo error:', err)
    return Response.json({ valid: false }, { status: 500 })
  }
}
