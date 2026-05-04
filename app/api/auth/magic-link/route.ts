import { redis } from '@/lib/redis'
import { Resend } from 'resend'
import type { User } from '@/lib/auth'
import { getEmailT, emailLayout, emailButton } from '@/lib/email-templates'

export async function POST(request: Request) {
  try {
    const { email, locale: clientLocale } = await request.json()

    if (!email) {
      return Response.json({ error: 'Email requis' }, { status: 400 })
    }

    const normalizedEmail = email.toLowerCase().trim()

    const rlKey = `ratelimit:magic:${normalizedEmail}`
    const rlAttempts = await redis.get<number>(rlKey) ?? 0
    if (rlAttempts >= 5) {
      return Response.json({ ok: true })
    }
    await redis.set(rlKey, rlAttempts + 1, { ex: 60 })

    const user = await redis.get<User>(`user:${normalizedEmail}`)
    if (!user) {
      return Response.json({ ok: true })
    }

    const locale = clientLocale || user.locale || 'fr'

    const token = crypto.randomUUID() + crypto.randomUUID()
    await redis.set(`magic:${token}`, {
      email: normalizedEmail,
      expiresAt: Date.now() + 15 * 60 * 1000,
      used: false,
    }, { ex: 900 })

    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL ?? 'https://getlovit.fr'
    const magicUrl = `${baseUrl}/auth/verify?token=${token}`

    if (process.env.RESEND_API_KEY) {
      const resend = new Resend(process.env.RESEND_API_KEY)
      const et = getEmailT(locale)

      const body = `
        <p style="font-size:15px;color:#4a3728;margin:0 0 20px;">${et.magicLink.body}</p>
        ${emailButton(magicUrl, et.magicLink.cta)}
        <p style="font-size:12px;color:#9ca3af;margin:20px 0 0;text-align:center;">${et.magicLink.ignore}</p>
      `

      await resend.emails.send({
        from: 'Lov\'it <noreply@getlovit.fr>',
        to: normalizedEmail,
        subject: et.magicLink.subject,
        html: emailLayout(et.magicLink.headerSub, body, locale),
      })
    }

    return Response.json({ ok: true })
  } catch (err) {
    return Response.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}
