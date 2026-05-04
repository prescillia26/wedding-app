import { redis } from '@/lib/redis'
import { createSession, type User } from '@/lib/auth'
import { Resend } from 'resend'

interface PromoEntry {
  email: string
  pack: string
  createdAt: string
  usedAt?: string
  usedBy?: string
  accessCode?: string
}

const ACCESS_CHARS = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'

function generateAccessCode(): string {
  let code = ''
  for (let i = 0; i < 6; i++) {
    code += ACCESS_CHARS[Math.floor(Math.random() * ACCESS_CHARS.length)]
  }
  return code
}

export async function POST(request: Request) {
  try {
    const { code, email } = await request.json() as { code: string; email: string }
    const normalized = code?.toUpperCase().trim()
    const normalizedEmail = email?.trim().toLowerCase()

    if (!normalized) return Response.json({ valid: false, reason: 'Code manquant' })
    if (!normalizedEmail) return Response.json({ valid: false, reason: 'Email manquant' })

    const data = await redis.get<PromoEntry>(`promo:${normalized}`)
    if (!data) return Response.json({ valid: false, reason: 'Code promo invalide' })

    if (data.email.toLowerCase() !== normalizedEmail) {
      return Response.json({ valid: false, reason: 'Cet email ne correspond pas à ce code promo' })
    }

    // CAS 1 : Code déjà utilisé par cette personne → on lui redonne son accès
    if (data.usedAt && data.accessCode) {
      const existingAccess = await redis.get(`access:${data.accessCode}`)
      if (existingAccess) {
        // Créer la session quand même (reconnexion)
        await createSession(normalizedEmail)

        return Response.json({
          valid: true,
          accessCode: data.accessCode,
          pack: data.pack,
          returning: true,
        })
      }
    }

    // CAS 2/3 : Première utilisation OU accessCode expiré → on en génère un nouveau
    const accessCode = generateAccessCode()
    const entry = {
      pack: data.pack || 'premium',
      email: normalizedEmail,
      promo: normalized,
      date: new Date().toISOString(),
    }

    await redis.set(`access:${accessCode}`, entry, { ex: 60 * 60 * 24 * 365 })

    await redis.set(`promo:${normalized}`, {
      ...data,
      usedAt: data.usedAt || new Date().toISOString(),
      usedBy: normalizedEmail,
      accessCode,
    })

    await redis.set(`email-access:${normalizedEmail}`, accessCode, { ex: 60 * 60 * 24 * 365 })

    // ✅ Création automatique du compte utilisateur (même logique que verify-payment)
    const existingUser = await redis.get<User>(`user:${normalizedEmail}`)
    if (!existingUser) {
      const user: User = {
        email: normalizedEmail,
        passwordHash: null,
        needsPassword: true,
        createdAt: new Date().toISOString(),
        faireparts: [],
      }
      await redis.set(`user:${normalizedEmail}`, user)
    }

    // Créer une session automatiquement
    await createSession(normalizedEmail)

    // Générer un magic link pour connexion future
    const magicToken = crypto.randomUUID() + crypto.randomUUID()
    await redis.set(`magic:${magicToken}`, {
      email: normalizedEmail,
      expiresAt: Date.now() + 24 * 60 * 60 * 1000,
      used: false,
    }, { ex: 86400 })

    // Envoyer l'email de bienvenue
    if (process.env.RESEND_API_KEY) {
      const baseUrl = process.env.NEXT_PUBLIC_BASE_URL ?? 'https://getlovit.fr'
      const passwordUrl = `${baseUrl}/auth/definir-mot-de-passe?token=${magicToken}`
      const magicUrl = `${baseUrl}/auth/verify?token=${magicToken}`
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
                <p style="margin:8px 0 0;font-size:14px;color:rgba(255,255,255,0.85);">Votre code promo a été activé</p>
              </div>
              <div style="padding:32px;">
                <p style="font-size:16px;color:#4a3728;margin:0 0 20px;line-height:1.6;">
                  Votre faire-part digital est prêt à être créé !
                </p>

                <div style="background:#fff8ed;border-radius:12px;padding:20px;margin-bottom:24px;text-align:center;">
                  <div style="font-size:11px;color:#C9A84C;font-weight:700;text-transform:uppercase;letter-spacing:0.1em;margin-bottom:8px;">Votre code d'accès</div>
                  <div style="font-size:32px;font-weight:700;color:#C9A84C;letter-spacing:0.2em;">${accessCode}</div>
                </div>

                <p style="font-size:14px;color:#4a3728;margin:0 0 24px;line-height:1.6;">
                  Pour accéder à votre espace depuis n'importe quel appareil, définissez votre mot de passe :
                </p>

                <div style="text-align:center;margin:24px 0;">
                  <a href="${passwordUrl}" style="display:inline-block;padding:14px 32px;background:linear-gradient(135deg,#C9A84C,#e8c96a);color:white;text-decoration:none;border-radius:9999px;font-size:14px;font-weight:700;letter-spacing:0.05em;">
                    Définir votre mot de passe
                  </a>
                </div>

                <div style="border-top:1px solid #f0e6d3;margin:24px 0;padding-top:20px;">
                  <p style="font-size:13px;color:#8a7860;margin:0 0 12px;">
                    Vous pouvez aussi vous connecter directement avec ce lien magique :
                  </p>
                  <div style="text-align:center;">
                    <a href="${magicUrl}" style="font-size:13px;color:#C9A84C;text-decoration:underline;">
                      Se connecter sans mot de passe
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

    return Response.json({
      valid: true,
      accessCode,
      pack: data.pack,
      returning: !!data.usedAt,
    })
  } catch (err) {
    console.error('check-promo error:', err)
    return Response.json({ valid: false, reason: 'Erreur serveur' }, { status: 500 })
  }
}
