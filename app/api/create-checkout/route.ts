import Stripe from 'stripe'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!)

const PACKS: Record<string, { amount: number; name: string }> = {
  essentiel: { amount: 100, name: "Lov'it TEST" },
  premium:   { amount: 100, name: "Lov'it TEST" },
  luxe:      { amount: 100, name: "Lov'it TEST" },
}
export async function POST(request: Request) {
  try {
    const { pack } = await request.json() as { pack: string }
    const selected = PACKS[pack]
    if (!selected) return Response.json({ error: 'Pack invalide' }, { status: 400 })

    const origin = request.headers.get('origin') || 'https://wedding-app-eight-kappa.vercel.app'

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      mode: 'payment',
      locale: 'fr',
      line_items: [{
        price_data: {
          currency: 'eur',
          product_data: { name: selected.name },
          unit_amount: selected.amount,
        },
        quantity: 1,
      }],
      metadata: { pack },
      success_url: `${origin}/succes?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}/paiement`,
    })

    return Response.json({ url: session.url })
  } catch (err) {
    console.error('create-checkout error:', err)
    return Response.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}
