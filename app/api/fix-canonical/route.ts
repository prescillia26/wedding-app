import { redis } from '@/lib/redis'

// Endpoint temporaire pour poser le canonicalId sur l'ancien ID
export async function GET() {
  const oldId = '0018d2ce-f8eb-443b-a916-9348a0a4494f'
  const newId = 'db40befc-3620-429e-b9ad-9be473ed5a1e'

  const oldData = await redis.get<Record<string, unknown>>(oldId)
  if (!oldData) {
    return Response.json({ error: 'Ancien ID introuvable' }, { status: 404 })
  }

  // Poser le canonicalId
  await redis.set(oldId, { ...oldData, canonicalId: newId }, { ex: 31536000 })

  // Vérification
  const updated = await redis.get<Record<string, unknown>>(oldId)

  return Response.json({
    ok: true,
    oldId,
    newId,
    canonicalId: updated?.canonicalId,
  })
}
