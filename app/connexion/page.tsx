'use client'

import { useState } from 'react'
import { useT } from '@/lib/i18n'
import { LangSwitch } from '../components/LangSwitch'

const GOLD = '#C9A84C'
const CREAM = '#fff8ed'

export default function ConnexionPage() {
  const { t } = useT()
  const a = t.auth
  const c = t.common

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [needsPassword, setNeedsPassword] = useState(false)
  const [magicLinkSent, setMagicLinkSent] = useState(false)
  const [sendingMagicLink, setSendingMagicLink] = useState(false)
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setLoading(true)

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      })
      const data = await res.json()

      if (!res.ok) {
        if (data.error === 'needsPassword') {
          setNeedsPassword(true)
          setError(null)
          return
        }
        setError(data.error || c.error)
        return
      }

      window.location.href = '/mon-espace'
    } catch {
      setError(c.error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: `linear-gradient(160deg, ${CREAM} 0%, #fffaf4 50%, ${CREAM} 100%)`, padding: 24 }}>
      <div style={{ width: '100%', maxWidth: 420 }}>
        <div style={{ textAlign: 'center', marginBottom: 36 }}>
          <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 16 }}><LangSwitch /></div>
          <a href="/" style={{ textDecoration: 'none' }}>
            <div style={{ fontFamily: 'var(--font-great-vibes)', fontSize: 48, color: GOLD, marginBottom: 4 }}>Lov&apos;it</div>
          </a>
          <div style={{ width: 40, height: 1, background: GOLD, opacity: 0.4, margin: '0 auto 16px' }} />
          <p style={{ fontFamily: 'var(--font-cormorant-garamond)', fontStyle: 'italic', fontSize: 18, color: '#4a3728' }}>
            {a.connectTitle}
          </p>
        </div>

        <form onSubmit={handleSubmit} style={{ background: 'white', borderRadius: 20, padding: '36px 32px', boxShadow: '0 12px 48px rgba(201,168,76,0.12)', border: `1px solid ${GOLD}22` }}>
          {error && (
            <div style={{ background: '#fef2f2', border: '1px solid #fecaca', borderRadius: 12, padding: '12px 16px', marginBottom: 20, fontSize: 13, color: '#dc2626' }}>
              {error}
            </div>
          )}

          {needsPassword && (
            <div style={{ background: '#fff8ed', border: `1px solid ${GOLD}44`, borderRadius: 12, padding: '16px 20px', marginBottom: 20, textAlign: 'center' }}>
              <p style={{ fontSize: 14, color: '#4a3728', margin: '0 0 12px', lineHeight: 1.5, whiteSpace: 'pre-line' }}>
                {a.needsPasswordMsg}
              </p>
              {magicLinkSent ? (
                <p style={{ fontSize: 13, color: '#16a34a', fontWeight: 600, margin: 0 }}>
                  {a.magicLinkSent}
                </p>
              ) : (
                <button
                  type="button"
                  disabled={sendingMagicLink}
                  onClick={async () => {
                    setSendingMagicLink(true)
                    await fetch('/api/auth/magic-link', {
                      method: 'POST',
                      headers: { 'Content-Type': 'application/json' },
                      body: JSON.stringify({ email }),
                    })
                    setMagicLinkSent(true)
                    setSendingMagicLink(false)
                  }}
                  style={{
                    padding: '10px 24px', borderRadius: 9999, border: 'none', cursor: 'pointer',
                    background: `linear-gradient(135deg, ${GOLD}, #e8c96a)`, color: 'white',
                    fontSize: 13, fontWeight: 700,
                  }}
                >
                  {sendingMagicLink ? a.sending : a.sendMagicLink}
                </button>
              )}
            </div>
          )}

          <div style={{ marginBottom: 20 }}>
            <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#4a3728', marginBottom: 6, letterSpacing: '0.05em', textTransform: 'uppercase' }}>
              {a.email}
            </label>
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
              placeholder={a.emailPlaceholder}
              style={{ width: '100%', padding: '12px 16px', borderRadius: 12, border: `1px solid ${GOLD}44`, fontSize: 15, color: '#4a3728', background: '#fefcf8', outline: 'none', boxSizing: 'border-box', fontFamily: 'Georgia, serif' }}
            />
          </div>

          <div style={{ marginBottom: 8 }}>
            <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#4a3728', marginBottom: 6, letterSpacing: '0.05em', textTransform: 'uppercase' }}>
              {a.password}
            </label>
            <input
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
              placeholder={a.passwordPlaceholder}
              style={{ width: '100%', padding: '12px 16px', borderRadius: 12, border: `1px solid ${GOLD}44`, fontSize: 15, color: '#4a3728', background: '#fefcf8', outline: 'none', boxSizing: 'border-box', fontFamily: 'Georgia, serif' }}
            />
          </div>

          <div style={{ textAlign: 'right', marginBottom: 24 }}>
            <a href="/auth/mot-de-passe-oublie" style={{ fontSize: 13, color: GOLD, textDecoration: 'none', fontFamily: 'var(--font-cormorant-garamond)', fontStyle: 'italic' }}>
              {a.forgotPassword}
            </a>
          </div>

          <button
            type="submit"
            disabled={loading}
            style={{
              width: '100%', padding: '14px 24px', borderRadius: 9999,
              background: loading ? '#d4b86a' : `linear-gradient(135deg, ${GOLD}, #e8c96a)`,
              color: 'white', border: 'none', fontSize: 15, fontWeight: 700,
              fontFamily: 'var(--font-playfair-display)', letterSpacing: '0.05em',
              cursor: loading ? 'not-allowed' : 'pointer',
              boxShadow: `0 6px 24px ${GOLD}44`,
            }}
          >
            {loading ? a.connecting : c.login}
          </button>
        </form>

        <div style={{ textAlign: 'center', marginTop: 28 }}>
          <p style={{ fontSize: 14, color: '#8a7860', fontFamily: 'var(--font-cormorant-garamond)', fontStyle: 'italic' }}>
            {a.noAccount}{' '}
            <a href="/paiement" style={{ color: GOLD, fontWeight: 600, textDecoration: 'none' }}>
              {c.createYourFairepart}
            </a>
          </p>
        </div>
      </div>
    </div>
  )
}
