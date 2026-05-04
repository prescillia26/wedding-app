import { Redis } from '@upstash/redis'

const redis = new Redis({
  url: process.env.KV_REST_API_URL!,
  token: process.env.KV_REST_API_TOKEN!,
})

// Vérifie si un code d'accès (généré après paiement Stripe) est valide
// Accepte GET ?code=XXX (pour l'auto-validation) et POST (pour compat future)
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const code = searchParams.get('code')
    if (!code) return Response.json({ valid: false, reason: 'Code manquant' })

    const normalized = code.toUpperCase().trim()
    const data = await redis.get(`access:${normalized}`)

    if (!data) return Response.json({ valid: false, reason: 'Code invalide' })
    return Response.json({ valid: true })
  } catch (err) {
    return Response.json({ valid: false, reason: 'Erreur serveur' }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const { code } = await request.json() as { code: string }
    const normalized = code?.toUpperCase().trim()
    if (!normalized) return Response.json({ valid: false, reason: 'Code manquant' })

    const data = await redis.get(`access:${normalized}`)
    if (!data) return Response.json({ valid: false, reason: 'Code invalide' })

    return Response.json({ valid: true })
  } catch (err) {
    return Response.json({ valid: false, reason: 'Erreur serveur' }, { status: 500 })
  }
}
