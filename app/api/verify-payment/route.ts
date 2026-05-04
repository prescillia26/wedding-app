import Stripe from 'stripe'
import { redis } from '@/lib/redis'
import { createSession, type User } from '@/lib/auth'
import { Resend } from 'resend'
import { getEmailT, emailLayout, emailButton, emailSecondaryLink } from '@/lib/email-templates'

function getStripe() {
  return new Stripe(process.env.STRIPE_SECRET_KEY!)
}

function generateCode(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'
  let code = ''
  for (let i = 0; i < 6; i++) code += chars[Math.floor(Math.random() * chars.length)]
  return code
}

function detectLocale(request: Request): string {
  const url = new URL(request.url)
  const paramLocale = url.searchParams.get('locale')
  if (paramLocale === 'en' || paramLocale === 'fr') return paramLocale
  const accept = request.headers.get('accept-language') || ''
  return accept.toLowerCase().startsWith('en') ? 'en' : 'fr'
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const sessionId = searchParams.get('session_id')
    if (!sessionId) return Response.json({ error: 'session_id manquant' }, { status: 400 })

    const existingCode = await redis.get<string>(`stripe-session:${sessionId}`)
    if (existingCode) {
      const data = await redis.get<Record<string, string>>(`access:${existingCode}`)
      return Response.json({ code: existingCode, ...data })
    }

    const session = await getStripe().checkout.sessions.retrieve(sessionId)
    if (session.payment_status !== 'paid') {
      return Response.json({ error: 'Paiement non complété' }, { status: 402 })
    }

    let code = generateCode()
    let attempts = 0
    while ((await redis.exists(`access:${code}`)) && attempts < 10) {
      code = generateCode()
      attempts++
    }

    const pack = session.metadata?.pack || 'premium'
    const email = session.customer_details?.email || ''
    const entry = { pack, email, sessionId, date: new Date().toISOString() }

    await redis.set(`access:${code}`, entry, { ex: 60 * 60 * 24 * 365 })
    await redis.set(`stripe-session:${sessionId}`, code, { ex: 60 * 60 * 24 * 365 })

    const locale = detectLocale(request)

    if (email) {
      const normalizedEmail = email.toLowerCase().trim()
      const existingUser = await redis.get<User>(`user:${normalizedEmail}`)

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
      } else if (!existingUser.locale) {
        await redis.set(`user:${normalizedEmail}`, { ...existingUser, locale })
      }

      await createSession(normalizedEmail)

      const magicToken = crypto.randomUUID() + crypto.randomUUID()
      await redis.set(`magic:${magicToken}`, {
        email: normalizedEmail,
        expiresAt: Date.now() + 24 * 60 * 60 * 1000,
        used: false,
      }, { ex: 86400 })

      if (process.env.RESEND_API_KEY) {
        const baseUrl = process.env.NEXT_PUBLIC_BASE_URL ?? 'https://getlovit.fr'
        const magicUrl = `${baseUrl}/auth/verify?token=${magicToken}`
        const passwordUrl = `${baseUrl}/auth/definir-mot-de-passe?token=${magicToken}`
        const resend = new Resend(process.env.RESEND_API_KEY)
        const et = getEmailT(locale)

        const body = `
          <p style="font-size:16px;color:#4a3728;margin:0 0 8px;line-height:1.6;">${et.welcome.thanks}</p>
          <p style="font-size:15px;color:#4a3728;margin:0 0 28px;line-height:1.6;">${et.welcome.body}</p>
          ${emailButton(magicUrl, et.welcome.cta)}
          <p style="font-size:13px;color:#8a7860;margin:0 0 20px;line-height:1.7;text-align:center;">${et.welcome.ctaSub}</p>
          <div style="border-top:1px solid #f0e6d3;margin:24px 0;padding-top:16px;text-align:center;">
            ${emailSecondaryLink(passwordUrl, et.welcome.passwordLink)}
          </div>
        `

        await resend.emails.send({
          from: 'Lov\'it <noreply@getlovit.fr>',
          to: normalizedEmail,
          subject: et.welcome.subject,
          html: emailLayout(et.welcome.headerSub, body, locale),
        })
      }
    }

    return Response.json({ code, pack, email })
  } catch (err) {
    return Response.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}
