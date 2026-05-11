import { Redis } from '@upstash/redis'
import { Resend } from 'resend'
import { getEmailT, emailLayout } from '@/lib/email-templates'
import type { User } from '@/lib/auth'

const redis = new Redis({
  url: process.env.KV_REST_API_URL!,
  token: process.env.KV_REST_API_TOKEN!,
})

// Resend est initialisé à la demande pour éviter l'erreur au build si la clé est absente

export async function POST(request: Request) {
  try {
    const data = await request.json()
    const shareId = data.shareId
    if (!shareId) return Response.json({ error: 'shareId manquant' }, { status: 400 })

    const key = `rsvp:${shareId}`
    const existing = await redis.get<unknown[]>(key) ?? []
    existing.push(data)
    await redis.set(key, existing)

    // Envoyer email de notification aux mariés
    const emailMaries = await redis.get<string>(`email:${shareId}`)

    let locale = 'fr'
    if (emailMaries) {
      const user = await redis.get<User>(`user:${emailMaries.toLowerCase().trim()}`)
      if (user?.locale) locale = user.locale
    }

    const et = getEmailT(locale)

    if (emailMaries && process.env.RESEND_API_KEY) {
      const resend = new Resend(process.env.RESEND_API_KEY)
      const nom: string = data.nom ?? 'Un invité'
      const mariee1: string = data.mariee1 ?? ''
      const mariee2: string = data.mariee2 ?? ''
      const coupleUrl = `${process.env.NEXT_PUBLIC_BASE_URL ?? 'https://your-app.vercel.app'}/faire-part?share=${shareId}&role=couple`

      const reponsesHtml = (data.reponses ?? []).map((r: { ceremonie: string; present: boolean; nbPersonnes: number; accompagnants?: string[] }) => {
  const accList = (r.accompagnants ?? []).filter(Boolean)
  const accHtml = r.present && accList.length > 0
    ? `<div style="margin-top:6px;padding-left:12px;border-left:2px solid #C9A84C55;font-size:12px;color:#8a7860;line-height:1.6;">
         ${accList.map(n => `<div>+ ${n}</div>`).join('')}
       </div>`
    : ''
  return `
    <tr>
      <td style="padding:10px 16px;font-size:14px;color:#3a3330;border-bottom:1px solid #efe5d8;">
        ${r.ceremonie}
        ${accHtml}
      </td>
      <td style="padding:10px 16px;font-size:14px;text-align:center;border-bottom:1px solid #efe5d8;vertical-align:top;">
        <span style="color:${r.present ? '#22c55e' : '#d45050'};font-weight:700;">${r.present ? et.rsvp.present : et.rsvp.absent}</span>
      </td>
      <td style="padding:10px 16px;font-size:14px;text-align:center;color:#6a5040;border-bottom:1px solid #efe5d8;vertical-align:top;">${r.present ? r.nbPersonnes : '—'}</td>
    </tr>
  `
}).join('')

      const body = `
              <p style="font-size:15px;color:#3a3330;margin:0 0 20px;">Bonne nouvelle ! <strong>${nom}</strong> a répondu à votre faire-part.</p>

              <table style="width:100%;border-collapse:collapse;margin-bottom:24px;">
                <thead>
                  <tr style="background:#fdf0f3;">
                    <th style="padding:10px 16px;font-size:11px;color:#C9A84C;text-align:left;text-transform:uppercase;letter-spacing:0.1em;">${et.rsvp.ceremony}</th>
                    <th style="padding:10px 16px;font-size:11px;color:#C9A84C;text-align:center;text-transform:uppercase;letter-spacing:0.1em;">${et.rsvp.status}</th>
                    <th style="padding:10px 16px;font-size:11px;color:#C9A84C;text-align:center;text-transform:uppercase;letter-spacing:0.1em;">${et.rsvp.guests}</th>
                  </tr>
                </thead>
                <tbody>${reponsesHtml}</tbody>
              </table>

              ${data.message ? `
              <div style="background:#fdf8f0;border-left:3px solid #C9A84C;padding:14px 16px;border-radius:0 8px 8px 0;margin-bottom:24px;">
                <div style="font-size:11px;color:#C9A84C;font-weight:700;text-transform:uppercase;letter-spacing:0.1em;margin-bottom:6px;">${et.rsvp.message}</div>
                <p style="margin:0;font-size:14px;color:#3a3330;font-style:italic;">"${data.message}"</p>
              </div>
              ` : ''}

              <div style="text-align:center;">
                <a href="${coupleUrl}" style="display:inline-block;padding:14px 32px;background:linear-gradient(135deg,#C9A84C,#e8c96a);color:white;text-decoration:none;border-radius:9999px;font-size:14px;font-weight:700;letter-spacing:0.05em;">
                  ${et.rsvp.viewAll}
                </a>
              </div>
      `

      const html = emailLayout(et.rsvp.headerSub, body, locale)

      await resend.emails.send({
        from: 'Lov\'it <noreply@getlovit.fr>',
        to: emailMaries,
        subject: et.rsvp.subject(nom),
        html,
      })
    }

    return Response.json({ ok: true })
  } catch (err) {
    return Response.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}
