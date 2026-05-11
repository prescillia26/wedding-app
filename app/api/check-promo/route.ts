import { redis } from '@/lib/redis'
import { createSession, type User } from '@/lib/auth'
import { Resend } from 'resend'
import { getEmailT, emailLayout, emailButton, emailSecondaryLink } from '@/lib/email-templates'

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
    const { code, email, locale: clientLocale } = await request.json() as { code: string; email: string; locale?: string }
    const normalized = code?.toUpperCase().trim()
    const normalizedEmail = email?.trim().toLowerCase()

    if (!normalized) return Response.json({ valid: false, reason: 'Code manquant' })
    if (!normalizedEmail) return Response.json({ valid: false, reason: 'Email manquant' })

    // Rate limiting : 10 tentatives par minute par email
    const rlKey = `ratelimit:promo:${normalizedEmail}`
    const rlAttempts = await redis.get<number>(rlKey) ?? 0
    if (rlAttempts >= 10) {
      return Response.json({ valid: false, reason: 'Trop de tentatives. Réessayez dans une minute.' }, { status: 429 })
    }
    await redis.set(rlKey, rlAttempts + 1, { ex: 60 })

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
    const locale = clientLocale || existingUser?.locale || 'fr'

    if (!existingUser) {
      const user: User = {
        email: normalizedEmail,
        passwordHash: null,
        needsPassword: true,
        createdAt: new Date().toISOString(),
        faireparts: [],
        locale,
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
      const et = getEmailT(locale)

      const bodyHtml = `
        <p style="font-size:16px;color:#3a3330;margin:0 0 20px;line-height:1.6;">
          ${et.promo.body}
        </p>

        <p style="font-size:14px;color:#3a3330;margin:0 0 24px;line-height:1.6;">
          ${et.promo.passwordBody}
        </p>

        ${emailButton(passwordUrl, et.promo.passwordCta)}

        <div style="border-top:1px solid #f0e6d3;margin:24px 0;padding-top:20px;">
          <p style="font-size:13px;color:#8a7860;margin:0 0 12px;">
            ${et.promo.magicSub}
          </p>
          ${emailSecondaryLink(magicUrl, et.promo.magicLink)}
        </div>
      `

      await resend.emails.send({
        from: 'Lov\'it <noreply@getlovit.fr>',
        to: normalizedEmail,
        subject: et.promo.subject,
        html: emailLayout(et.promo.headerSub, bodyHtml, locale),
      })
    }

    return Response.json({
      valid: true,
      accessCode,
      pack: data.pack,
      returning: !!data.usedAt,
    })
  } catch (err) {
    return Response.json({ valid: false, reason: 'Erreur serveur' }, { status: 500 })
  }
}
