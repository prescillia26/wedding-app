import { Redis } from '@upstash/redis'

const redis = new Redis({
  url: process.env.KV_REST_API_URL!,
  token: process.env.KV_REST_API_TOKEN!,
})

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const code = searchParams.get('code')?.toUpperCase().trim()
    if (!code) return Response.json({ valid: false })

    const data = await redis.get<Record<string, string>>(`access:${code}`)
    if (!data) return Response.json({ valid: false })

    return Response.json({ valid: true, ...data })
  } catch (err) {
    console.error('check-access error:', err)
    return Response.json({ valid: false }, { status: 500 })
  }
}
