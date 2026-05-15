import { redis } from '@/lib/redis'

export async function POST(request: Request) {
  try {
    // Rate limiting : 5 tentatives par minute par IP
    const ip = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'unknown'
    const rlKey = `ratelimit:admin:${ip}`
    const attempts = await redis.get<number>(rlKey) ?? 0
    if (attempts >= 5) {
      return Response.json({ valid: false, reason: 'Trop de tentatives' }, { status: 429 })
    }
    await redis.set(rlKey, attempts + 1, { ex: 60 })

    const { password } = await request.json() as { password: string }
    const valid = password === process.env.ADMIN_PASSWORD
    return Response.json({ valid })
  } catch {
    return Response.json({ valid: false }, { status: 500 })
  }
}
