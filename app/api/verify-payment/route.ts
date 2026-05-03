import Stripe from 'stripe'
import { redis } from '@/lib/redis'
import { createSession, type User } from '@/lib/auth'
import { Resend } from 'resend'

function getStripe() {
  return new Stripe(process.env.STRIPE_SECRET_KEY!)
}

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
    const existingCode = await redis.get<string>(`stripe-session:${sessionId}`)
    if (existingCode) {
      const data = await redis.get<Record<string, string>>(`access:${existingCode}`)
      return Response.json({ code: existingCode, ...data })
    }

    const session = await getStripe().checkout.sessions.retrieve(sessionId)
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
    await redis.set(`stripe-session:${sessionId}`, code, { ex: 60 * 60 * 24 * 365 })

    // ✅ Création automatique du compte utilisateur
    if (email) {
      const normalizedEmail = email.toLowerCase().trim()
      const existingUser = await redis.get<User>(`user:${normalizedEmail}`)

      if (!existingUser) {
        // Créer un nouveau compte sans mot de passe
        const user: User = {
          email: normalizedEmail,
          passwordHash: null,
          needsPassword: true,
          createdAt: new Date().toISOString(),
          faireparts: [],
        }
        await redis.set(`user:${normalizedEmail}`, user)
      }

      // Créer une session automatiquement pour la mariée
      await createSession(normalizedEmail)

      // Générer un magic link pour connexion future
      const magicToken = crypto.randomUUID() + crypto.randomUUID()
      await redis.set(`magic:${magicToken}`, {
        email: normalizedEmail,
        expiresAt: Date.now() + 24 * 60 * 60 * 1000, // 24h pour le 1er lien
        used: false,
      }, { ex: 86400 })

      // Envoyer l'email de bienvenue
      if (process.env.RESEND_API_KEY) {
        const baseUrl = process.env.NEXT_PUBLIC_BASE_URL ?? 'https://getlovit.fr'
        const magicUrl = `${baseUrl}/auth/verify?token=${magicToken}`
        const passwordUrl = `${baseUrl}/auth/definir-mot-de-passe?token=${magicToken}`
        const resend = new Resend(process.env.RESEND_API_KEY)

        await resend.emails.send({
          from: 'Lov\'it <noreply@getlovit.fr>',
          to: normalizedEmail,
          subject: 'Bienvenue sur Lov\'it — Votre faire-part vous attend !',
          html: `
            <!DOCTYPE html>
            <html>
            <body style="margin:0;padding:0;background:#fff8ed;font-family:Georgia,serif;">
              <div style="max-width:560px;margin:40px auto;background:white;border-radius:16px;overflow:hidden;box-shadow:0 8px 32px rgba(0,0,0,0.08);">
                <div style="background:linear-gradient(135deg,#C9A84C,#e8c96a);padding:32px;text-align:center;">
                  <h1 style="margin:0;font-size:28px;font-weight:300;color:white;letter-spacing:0.06em;">Lov'it</h1>
                  <p style="margin:8px 0 0;font-size:14px;color:rgba(255,255,255,0.85);">Paiement confirmé</p>
                </div>
                <div style="padding:32px;">
                  <p style="font-size:16px;color:#4a3728;margin:0 0 20px;line-height:1.6;">
                    Merci pour votre achat ! Votre faire-part digital est prêt à être créé.
                  </p>

                  <div style="background:#fff8ed;border-radius:12px;padding:20px;margin-bottom:24px;text-align:center;">
                    <div style="font-size:11px;color:#C9A84C;font-weight:700;text-transform:uppercase;letter-spacing:0.1em;margin-bottom:8px;">Votre code d'accès</div>
                    <div style="font-size:32px;font-weight:700;color:#C9A84C;letter-spacing:0.2em;">${code}</div>
                  </div>

                  <p style="font-size:14px;color:#4a3728;margin:0 0 24px;line-height:1.6;">
                    Pour accéder à votre espace depuis n'importe quel appareil, définissez votre mot de passe :
                  </p>

                  <div style="text-align:center;margin:24px 0;">
                    <a href="${passwordUrl}" style="display:inline-block;padding:14px 32px;background:linear-gradient(135deg,#C9A84C,#e8c96a);color:white;text-decoration:none;border-radius:9999px;font-size:14px;font-weight:700;letter-spacing:0.05em;">
                      Définir mon mot de passe
                    </a>
                  </div>

                  <div style="border-top:1px solid #f0e6d3;margin:24px 0;padding-top:20px;">
                    <p style="font-size:13px;color:#8a7860;margin:0 0 12px;">
                      Vous pouvez aussi vous connecter directement avec ce lien magique :
                    </p>
                    <div style="text-align:center;">
                      <a href="${magicUrl}" style="font-size:13px;color:#C9A84C;text-decoration:underline;">
                        Me connecter sans mot de passe
                      </a>
                    </div>
                  </div>
                </div>
                <div style="padding:16px 32px;border-top:1px solid #f0e6d3;text-align:center;">
                  <p style="margin:0;font-size:11px;color:#9ca3af;">Lov'it — Faire-parts de mariage digitaux</p>
                </div>
              </div>
            </body>
            </html>
          `,
        })
      }
    }

    return Response.json({ code, pack, email })
  } catch (err) {
    console.error('verify-payment error:', err)
    return Response.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}
