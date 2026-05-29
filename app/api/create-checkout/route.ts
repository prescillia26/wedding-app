import Stripe from 'stripe'

function getStripe() {
  return new Stripe(process.env.STRIPE_SECRET_KEY!)
}


const PACKS: Record<string, { amount: number; amountUSD: number; name: string; nameEN: string }> = {
  essentiel: { amount: 6900, amountUSD: 7900, name: "Lov'it — Pack Essentiel", nameEN: "Lov'it — Essentials Pack" },
  premium:   { amount: 9900, amountUSD: 10900, name: "Lov'it — Pack Premium", nameEN: "Lov'it — Premium Pack" },
}

export async function POST(request: Request) {
  try {
    const { pack, locale } = await request.json() as { pack: string; locale?: string }
    const selected = PACKS[pack]
    if (!selected) return Response.json({ error: 'Pack invalide' }, { status: 400 })

    const origin = request.headers.get('origin') || 'https://getlovit.fr'
    const isEN = locale === 'en'

    const session = await getStripe().checkout.sessions.create({
      payment_method_types: ['card'],
      mode: 'payment',
      locale: isEN ? 'en' : 'fr',
      line_items: [{
        price_data: {
          currency: isEN ? 'usd' : 'eur',
          product_data: { name: isEN ? selected.nameEN : selected.name },
          unit_amount: isEN ? selected.amountUSD : selected.amount,
        },
        quantity: 1,
      }],
      allow_promotion_codes: true,
      metadata: { pack, locale: locale || 'fr' },
      success_url: `${origin}/succes?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}/paiement`,
    })
    return Response.json({ url: session.url })
  } catch (err) {
    return Response.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}
