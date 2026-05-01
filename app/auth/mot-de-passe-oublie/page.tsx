'use client'

import { useState } from 'react'

const GOLD = '#C9A84C'
const CREAM = '#fff8ed'

export default function MotDePasseOubliePage() {
  const [email, setEmail] = useState('')
  const [sent, setSent] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setLoading(true)

    try {
      const res = await fetch('/api/auth/magic-link', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      })
      const data = await res.json()

      if (!res.ok) {
        setError(data.error || 'Erreur lors de l\'envoi.')
        return
      }

      setSent(true)
    } catch {
      setError('Erreur serveur. Réessayez.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: `linear-gradient(160deg, ${CREAM} 0%, #fff5f7 50%, ${CREAM} 100%)`, padding: 24 }}>
      <div style={{ width: '100%', maxWidth: 420 }}>
        {/* En-tête */}
        <div style={{ textAlign: 'center', marginBottom: 36 }}>
          <a href="/" style={{ textDecoration: 'none' }}>
            <div style={{ fontFamily: 'var(--font-great-vibes)', fontSize: 48, color: GOLD, marginBottom: 4 }}>Lov&apos;it</div>
          </a>
          <div style={{ width: 40, height: 1, background: GOLD, opacity: 0.4, margin: '0 auto 16px' }} />
          <p style={{ fontFamily: 'var(--font-cormorant-garamond)', fontStyle: 'italic', fontSize: 18, color: '#4a3728' }}>
            Mot de passe oublié
          </p>
        </div>

        {sent ? (
          <div style={{ background: 'white', borderRadius: 20, padding: '36px 32px', boxShadow: '0 12px 48px rgba(201,168,76,0.12)', border: `1px solid ${GOLD}22`, textAlign: 'center' }}>
            <div style={{ fontSize: 40, marginBottom: 16 }}>&#9993;</div>
            <div style={{ fontFamily: 'var(--font-cormorant-garamond)', fontStyle: 'italic', fontSize: 18, color: '#4a3728', marginBottom: 12, lineHeight: 1.6 }}>
              Si un compte existe avec cet email, vous recevrez un lien de connexion dans quelques instants.
            </div>
            <p style={{ fontFamily: 'var(--font-cormorant-garamond)', fontStyle: 'italic', fontSize: 13, color: '#9ca3af', marginBottom: 24 }}>
              Pensez à vérifier vos spams.
            </p>
            <a
              href="/connexion"
              style={{
                display: 'inline-block', padding: '12px 28px', borderRadius: 9999,
                border: `1px solid ${GOLD}`, background: 'transparent',
                color: GOLD, textDecoration: 'none', fontSize: 14, fontWeight: 600,
                fontFamily: 'var(--font-playfair-display)',
              }}
            >
              Retour à la connexion
            </a>
          </div>
        ) : (
          <form onSubmit={handleSubmit} style={{ background: 'white', borderRadius: 20, padding: '36px 32px', boxShadow: '0 12px 48px rgba(201,168,76,0.12)', border: `1px solid ${GOLD}22` }}>
            <p style={{ fontFamily: 'var(--font-cormorant-garamond)', fontStyle: 'italic', fontSize: 15, color: '#8a7860', marginBottom: 24, lineHeight: 1.6 }}>
              Entrez votre adresse email et nous vous enverrons un lien magique pour vous connecter.
            </p>

            {error && (
              <div style={{ background: '#fef2f2', border: '1px solid #fecaca', borderRadius: 12, padding: '12px 16px', marginBottom: 20, fontSize: 13, color: '#dc2626' }}>
                {error}
              </div>
            )}

            <div style={{ marginBottom: 24 }}>
              <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#4a3728', marginBottom: 6, letterSpacing: '0.05em', textTransform: 'uppercase' }}>
                Email
              </label>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
                placeholder="votre@email.com"
                style={{ width: '100%', padding: '12px 16px', borderRadius: 12, border: `1px solid ${GOLD}44`, fontSize: 15, color: '#4a3728', background: '#fefcf8', outline: 'none', boxSizing: 'border-box', fontFamily: 'Georgia, serif' }}
              />
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
              {loading ? 'Envoi…' : 'Recevoir un lien de connexion'}
            </button>

            <div style={{ textAlign: 'center', marginTop: 20 }}>
              <a href="/connexion" style={{ fontSize: 13, color: GOLD, textDecoration: 'none', fontFamily: 'var(--font-cormorant-garamond)', fontStyle: 'italic' }}>
                Retour à la connexion
              </a>
            </div>
          </form>
        )}
      </div>
    </div>
  )
}
