import Stripe from 'stripe'
import { Redis } from '@upstash/redis'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!)
const redis = new Redis({
  url: process.env.KV_REST_API_URL!,
  token: process.env.KV_REST_API_TOKEN!,
})

function generateCode(): string {
  // Exclut 0/O et 1/I pour éviter confusions
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'
  let code = ''
  for (let i = 0; i < 6; i++) code += chars[Math.floor(Math.random() * chars.length)]
  return code
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const sessionId = searchParams.get('session_id')
    if (!sessionId) return Response.json({ error: 'session_id manquant' }, { status: 400 })

    // Idempotence : si déjà généré pour cette session, retourner le même code
    const existingCode = await redis.get<string>(`session:${sessionId}`)
    if (existingCode) {
      const data = await redis.get<Record<string, string>>(`access:${existingCode}`)
      return Response.json({ code: existingCode, ...data })
    }

    const session = await stripe.checkout.sessions.retrieve(sessionId)
    if (session.payment_status !== 'paid') {
      return Response.json({ error: 'Paiement non complété' }, { status: 402 })
    }

    // Générer un code unique
    let code = generateCode()
    let attempts = 0
    while ((await redis.exists(`access:${code}`)) && attempts < 10) {
      code = generateCode()
      attempts++
    }

    const pack = session.metadata?.pack || 'premium'
    const email = session.customer_details?.email || ''
    const entry = { pack, email, sessionId, date: new Date().toISOString() }

    // Stocker 1 an
    await redis.set(`access:${code}`, entry, { ex: 60 * 60 * 24 * 365 })
    await redis.set(`session:${sessionId}`, code, { ex: 60 * 60 * 24 * 365 })

    return Response.json({ code, pack, email })
  } catch (err) {
    console.error('verify-payment error:', err)
    return Response.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}
