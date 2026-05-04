'use client'

import { useEffect, useState } from 'react'
import { showToast } from '../components/Toast'
import { useT } from '@/lib/i18n'
import { LangSwitch } from '../components/LangSwitch'

const GOLD = '#C9A84C'
const CREAM = '#fff8ed'

interface Ceremony {
  type: string
  date: string
  lieu: string
}

interface FairepartCard {
  shareId: string
  marie1Prenom: string
  marie2Prenom: string
  ceremonies: Ceremony[]
  photo: string | null
  style: string
  slug: string
  rsvp: { total: number; confirmes: number }
}

interface DashboardData {
  email: string
  needsPassword: boolean
  faireparts: FairepartCard[]
}

const THEME_COLORS: Record<string, string> = {
  'rose-fleuri': '#f9c6d0',
  'ivoire-or': '#C9A84C',
  'bleu-floral': '#6b8cae',
  'champetre': '#8aaa6e',
  'blanc-gris': '#9ca3af',
  'noir-blanc': '#1f2937',
  'chocolat': '#6b4226',
  'bordeaux': '#7c2d3e',
  'bordeaux-nuit': '#5c1a2a',
  'fuchsia': '#c026d3',
  'marine-or': '#1e3a5f',
  'menthe': '#6bc9a0',
}

export default function MonEspacePage() {
  const { t, locale, formatDate } = useT()
  const d_ = t.dashboard
  const c = t.common

  const [data, setData] = useState<DashboardData | null>(null)
  const [loading, setLoading] = useState(true)
  const [loggingOut, setLoggingOut] = useState(false)

  useEffect(() => {
    fetch('/api/auth/dashboard')
      .then(res => {
        if (res.status === 401) {
          window.location.href = '/connexion'
          return null
        }
        return res.json()
      })
      .then(d => {
        if (d) {
          setData(d)
          try {
            const storedEmail = localStorage.getItem('lovit_user_email')
            if (storedEmail && storedEmail !== d.email) {
              localStorage.removeItem('wedding-draft')
              localStorage.removeItem('lovit_access_code')
              localStorage.removeItem('lovit_share_id')
            }
            localStorage.setItem('lovit_user_email', d.email)
          } catch { /* ignore */ }
        }
      })
      .catch(() => { window.location.href = '/connexion' })
      .finally(() => setLoading(false))
  }, [])

  const handleLogout = async () => {
    setLoggingOut(true)
    await fetch('/api/auth/logout', { method: 'POST' })
    try {
      localStorage.removeItem('wedding-draft')
      localStorage.removeItem('lovit_access_code')
      localStorage.removeItem('lovit_share_id')
      localStorage.removeItem('lovit_user_email')
    } catch { /* ignore */ }
    window.location.href = '/'
  }

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: `linear-gradient(160deg, ${CREAM} 0%, #fffaf4 50%, ${CREAM} 100%)` }}>
        <div style={{ fontFamily: 'var(--font-great-vibes)', fontSize: 32, color: GOLD }}>{c.loading}</div>
      </div>
    )
  }

  if (!data) return null

  const firstPrenom = data.faireparts[0]?.marie1Prenom || data.email.split('@')[0]

  return (
    <div style={{ minHeight: '100vh', background: `linear-gradient(160deg, ${CREAM} 0%, #fffaf4 50%, ${CREAM} 100%)`, padding: '32px 16px 64px' }}>
      <div style={{ maxWidth: 800, margin: '0 auto' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 40, flexWrap: 'wrap', gap: 16 }}>
          <div>
            <a href="/" style={{ textDecoration: 'none' }}>
              <div style={{ fontFamily: 'var(--font-great-vibes)', fontSize: 36, color: GOLD, marginBottom: 4 }}>Lov&apos;it</div>
            </a>
            <h1 style={{ fontFamily: 'var(--font-cormorant-garamond)', fontStyle: 'italic', fontSize: 28, color: '#4a3728', fontWeight: 400, margin: 0 }}>
              {d_.hello} {firstPrenom}
            </h1>
            <p style={{ fontFamily: 'var(--font-cormorant-garamond)', fontStyle: 'italic', fontSize: 14, color: '#9ca3af', marginTop: 4 }}>
              {data.email}
            </p>
          </div>
          <div style={{ display: 'flex', gap: 10, alignItems: 'center', flexWrap: 'wrap' }}>
            <LangSwitch />
            {data.needsPassword && (
              <a href="/auth/mot-de-passe-oublie" style={{
                padding: '10px 20px', borderRadius: 9999,
                border: `1px solid ${GOLD}`, background: 'transparent',
                color: GOLD, textDecoration: 'none', fontSize: 13, fontWeight: 600,
                fontFamily: 'var(--font-playfair-display)',
              }}>
                {d_.setPassword}
              </a>
            )}
            <button onClick={handleLogout} disabled={loggingOut} style={{
              padding: '10px 20px', borderRadius: 9999,
              background: 'transparent', border: '1px solid #d1d5db',
              color: '#6b7280', fontSize: 13, fontWeight: 500, cursor: 'pointer',
              fontFamily: 'var(--font-playfair-display)',
            }}>
              {loggingOut ? c.logoutPending : c.logout}
            </button>
          </div>
        </div>

        {data.faireparts.length === 0 ? (
          <div style={{ background: 'white', borderRadius: 20, padding: '48px 32px', boxShadow: '0 12px 48px rgba(201,168,76,0.1)', border: `1px solid ${GOLD}22`, textAlign: 'center' }}>
            <div style={{ fontSize: 48, marginBottom: 16 }}>&#128141;</div>
            <h2 style={{ fontFamily: 'var(--font-cormorant-garamond)', fontStyle: 'italic', fontSize: 22, color: '#4a3728', fontWeight: 400, marginBottom: 12 }}>
              {d_.noFairepart}
            </h2>
            <p style={{ fontFamily: 'var(--font-cormorant-garamond)', fontStyle: 'italic', fontSize: 15, color: '#9ca3af', marginBottom: 28 }}>
              {d_.noFairepartDesc}
            </p>
            <a href="/faire-part" style={{
              display: 'inline-block', padding: '14px 32px', borderRadius: 9999,
              background: `linear-gradient(135deg, ${GOLD}, #e8c96a)`,
              color: 'white', textDecoration: 'none', fontSize: 15, fontWeight: 700,
              fontFamily: 'var(--font-playfair-display)', letterSpacing: '0.05em',
              boxShadow: `0 6px 24px ${GOLD}44`,
            }}>
              {c.createYourFairepart}
            </a>
          </div>
        ) : (
          <>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: 24 }}>
              {data.faireparts.map((fp) => (
                <FairepartCardComponent key={fp.shareId} fp={fp} locale={locale} formatDate={formatDate} t={{ ...d_, linkCopied: c.linkCopied }} />
              ))}
            </div>

            <div style={{ textAlign: 'center', marginTop: 40 }}>
              <a href="/paiement" style={{
                display: 'inline-block', padding: '14px 32px', borderRadius: 9999,
                background: `linear-gradient(135deg, ${GOLD}, #e8c96a)`,
                color: 'white', textDecoration: 'none', fontSize: 15, fontWeight: 700,
                fontFamily: 'var(--font-playfair-display)', letterSpacing: '0.05em',
                boxShadow: `0 6px 24px ${GOLD}44`,
              }}>
                {d_.newFairepartPrice}
              </a>
            </div>
          </>
        )}
      </div>
    </div>
  )
}

function FairepartCardComponent({ fp, locale, formatDate, t }: { fp: FairepartCard; locale: string; formatDate: (d: string) => string; t: { edit: string; shareBtn: string; viewRsvp: string; tablePlan: string; confirmed: string; responses: string; linkCopied: string } }) {
  const themeColor = THEME_COLORS[fp.style] ?? GOLD
  const firstCeremony = fp.ceremonies[0]
  const dateStr = firstCeremony?.date ? formatDate(firstCeremony.date) : null

  const shareUrl = fp.slug
    ? `/${fp.slug}`
    : `/faire-part?share=${fp.shareId}&role=couple`

  return (
    <div style={{
      background: 'white', borderRadius: 20, overflow: 'hidden',
      boxShadow: '0 8px 32px rgba(201,168,76,0.1)', border: `1px solid ${GOLD}22`,
    }}>
      <div style={{
        height: 140, background: fp.photo
          ? `url(${fp.photo}) center/cover`
          : `linear-gradient(135deg, ${themeColor}44, ${themeColor}22)`,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        position: 'relative',
      }}>
        {!fp.photo && (
          <div style={{ fontFamily: 'var(--font-great-vibes)', fontSize: 32, color: themeColor, opacity: 0.7 }}>
            {fp.marie1Prenom || '?'} & {fp.marie2Prenom || '?'}
          </div>
        )}
        {fp.photo && (
          <div style={{
            position: 'absolute', bottom: 0, left: 0, right: 0,
            background: 'linear-gradient(transparent, rgba(0,0,0,0.5))',
            padding: '20px 20px 12px', color: 'white',
          }}>
            <div style={{ fontFamily: 'var(--font-great-vibes)', fontSize: 26 }}>
              {fp.marie1Prenom} & {fp.marie2Prenom}
            </div>
          </div>
        )}
      </div>

      <div style={{ padding: '20px 24px 24px' }}>
        {!fp.photo && (
          <div style={{ fontFamily: 'var(--font-playfair-display)', fontSize: 18, color: '#4a3728', fontWeight: 600, marginBottom: 4 }}>
            {fp.marie1Prenom} & {fp.marie2Prenom}
          </div>
        )}

        {dateStr && (
          <div style={{ fontFamily: 'var(--font-cormorant-garamond)', fontStyle: 'italic', fontSize: 14, color: '#8a7860', marginBottom: 12 }}>
            {dateStr}
          </div>
        )}

        <div style={{
          display: 'flex', gap: 16, marginBottom: 20, padding: '12px 16px',
          background: '#fefcf8', borderRadius: 12,
        }}>
          <div style={{ textAlign: 'center', flex: 1 }}>
            <div style={{ fontFamily: 'var(--font-playfair-display)', fontSize: 22, fontWeight: 700, color: GOLD }}>{fp.rsvp.confirmes}</div>
            <div style={{ fontSize: 11, color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{t.confirmed}</div>
          </div>
          <div style={{ width: 1, background: `${GOLD}33` }} />
          <div style={{ textAlign: 'center', flex: 1 }}>
            <div style={{ fontFamily: 'var(--font-playfair-display)', fontSize: 22, fontWeight: 700, color: '#4a3728' }}>{fp.rsvp.total}</div>
            <div style={{ fontSize: 11, color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{t.responses}</div>
          </div>
        </div>

        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          <a href={`/faire-part?share=${fp.shareId}&role=edit`} style={{
            flex: 1, textAlign: 'center', padding: '10px 12px', borderRadius: 9999,
            background: `linear-gradient(135deg, ${GOLD}, #e8c96a)`,
            color: 'white', textDecoration: 'none', fontSize: 12, fontWeight: 700,
            fontFamily: 'var(--font-playfair-display)', minWidth: 80,
          }}>
            {t.edit}
          </a>
          <button onClick={() => {
            const url = `${window.location.origin}${shareUrl}`
            navigator.clipboard.writeText(url).then(() => showToast(t.linkCopied))
          }} style={{
            flex: 1, textAlign: 'center', padding: '10px 12px', borderRadius: 9999,
            background: 'transparent', border: `1px solid ${GOLD}`,
            color: GOLD, fontSize: 12, fontWeight: 600, cursor: 'pointer',
            fontFamily: 'var(--font-playfair-display)', minWidth: 80,
          }}>
            {t.shareBtn}
          </button>
          <a href={`/faire-part?share=${fp.shareId}&role=couple`} style={{
            flex: 1, textAlign: 'center', padding: '10px 12px', borderRadius: 9999,
            background: 'transparent', border: '1px solid #d1d5db',
            color: '#6b7280', textDecoration: 'none', fontSize: 12, fontWeight: 600,
            fontFamily: 'var(--font-playfair-display)', minWidth: 80,
          }}>
            {t.viewRsvp}
          </a>
          <a href={`/plan-table?shareId=${fp.shareId}`} style={{
            flex: 1, textAlign: 'center', padding: '10px 12px', borderRadius: 9999,
            background: 'transparent', border: '1px solid #d1d5db',
            color: '#6b7280', textDecoration: 'none', fontSize: 12, fontWeight: 600,
            fontFamily: 'var(--font-playfair-display)', minWidth: 80,
          }}>
            {t.tablePlan}
          </a>
        </div>
      </div>
    </div>
  )
}
