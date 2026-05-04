import { redis } from '@/lib/redis'
import { Resend } from 'resend'
import type { User } from '@/lib/auth'

export async function POST(request: Request) {
  try {
    const { email } = await request.json()

    if (!email) {
      return Response.json({ error: 'Email requis' }, { status: 400 })
    }

    const normalizedEmail = email.toLowerCase().trim()

    // Rate limiting : 5 demandes par minute par email
    const rlKey = `ratelimit:magic:${normalizedEmail}`
    const rlAttempts = await redis.get<number>(rlKey) ?? 0
    if (rlAttempts >= 5) {
      return Response.json({ ok: true }) // Ne pas révéler le rate limit
    }
    await redis.set(rlKey, rlAttempts + 1, { ex: 60 })

    // Vérifier que l'utilisateur existe
    const user = await redis.get<User>(`user:${normalizedEmail}`)
    if (!user) {
      // On retourne OK même si l'email n'existe pas (sécurité : pas de leak d'info)
      return Response.json({ ok: true })
    }

    // Générer le token magic
    const token = crypto.randomUUID() + crypto.randomUUID()
    await redis.set(`magic:${token}`, {
      email: normalizedEmail,
      expiresAt: Date.now() + 15 * 60 * 1000, // 15 min
      used: false,
    }, { ex: 900 }) // 15 min TTL

    // Envoyer l'email
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL ?? 'https://getlovit.fr'
    const magicUrl = `${baseUrl}/auth/verify?token=${token}`

    if (process.env.RESEND_API_KEY) {
      const resend = new Resend(process.env.RESEND_API_KEY)
      await resend.emails.send({
        from: 'Lov\'it <noreply@getlovit.fr>',
        to: normalizedEmail,
        subject: 'Votre lien de connexion Lov\'it',
        html: `
          <!DOCTYPE html>
          <html>
          <body style="margin:0;padding:0;background:#fff8ed;font-family:Georgia,serif;">
            <div style="max-width:560px;margin:40px auto;background:white;border-radius:16px;overflow:hidden;box-shadow:0 8px 32px rgba(0,0,0,0.08);">
              <div style="background:linear-gradient(135deg,#C9A84C,#e8c96a);padding:32px;text-align:center;">
                <h1 style="margin:0;font-size:24px;font-weight:300;color:white;letter-spacing:0.06em;">Lov'it</h1>
                <p style="margin:8px 0 0;font-size:14px;color:rgba(255,255,255,0.85);">Votre lien de connexion</p>
              </div>
              <div style="padding:32px;">
                <p style="font-size:15px;color:#4a3728;margin:0 0 20px;">
                  Cliquez sur le bouton ci-dessous pour vous connecter à votre espace Lov'it.
                  Ce lien est valable 15 minutes.
                </p>
                <div style="text-align:center;margin:32px 0;">
                  <a href="${magicUrl}" style="display:inline-block;padding:14px 32px;background:linear-gradient(135deg,#C9A84C,#e8c96a);color:white;text-decoration:none;border-radius:9999px;font-size:14px;font-weight:700;letter-spacing:0.05em;">
                    Se connecter
                  </a>
                </div>
                <p style="font-size:12px;color:#9ca3af;margin:20px 0 0;text-align:center;">
                  Si vous n'avez pas demandé ce lien, ignorez cet email.
                </p>
              </div>
            </div>
          </body>
          </html>
        `,
      })
    }

    return Response.json({ ok: true })
  } catch (err) {
    return Response.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}
