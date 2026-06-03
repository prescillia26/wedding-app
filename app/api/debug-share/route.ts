import { Redis } from '@upstash/redis'

const redis = new Redis({
  url: process.env.KV_REST_API_URL!,
  token: process.env.KV_REST_API_TOKEN!,
})

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const slug = searchParams.get('slug')
  const id = searchParams.get('id')

  const result: Record<string, unknown> = {}

  // Si on a un slug, résoudre le shareId
  if (slug) {
    const shareId = await redis.get<string>(`slug:${slug}`)
    result.slug = slug
    result.shareIdFromSlug = shareId

    if (shareId) {
      const data = await redis.get<Record<string, unknown>>(shareId)
      result.dataFromSlug = {
        customLogoUrl: data?.customLogoUrl || '(vide)',
        luxeMonogramUrl: data?.luxeMonogramUrl || '(vide)',
        ownerEmail: data?.ownerEmail || '(vide)',
        slug: data?.slug || '(vide)',
        totalKeys: data ? Object.keys(data).length : 0,
      }
    }
  }

  // Si on a un ID direct, lire ses données
  if (id) {
    const data = await redis.get<Record<string, unknown>>(id)
    result.directId = id
    result.dataFromId = {
      customLogoUrl: data?.customLogoUrl || '(vide)',
      luxeMonogramUrl: data?.luxeMonogramUrl || '(vide)',
      ownerEmail: data?.ownerEmail || '(vide)',
      slug: data?.slug || '(vide)',
      totalKeys: data ? Object.keys(data).length : 0,
    }
  }

  return Response.json(result, { headers: { 'Cache-Control': 'no-store' } })
}
