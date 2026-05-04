import Stripe from 'stripe'

function getStripe() {
  return new Stripe(process.env.STRIPE_SECRET_KEY!)
}


const PACKS: Record<string, { amount: number; name: string }> = {
  essentiel: { amount: 6900, name: "Lov'it — Offre de lancement" },  // 69€
  premium:   { amount: 6900, name: "Lov'it — Offre de lancement" },  // 69€
  luxe:      { amount: 6900, name: "Lov'it — Offre de lancement" },  // 69€
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
          product_data: { name: isEN ? "Lov'it — Launch offer" : selected.name },
          unit_amount: isEN ? 7900 : selected.amount,  // $79 USD ou 69€ EUR
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
