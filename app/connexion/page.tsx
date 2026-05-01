'use client'

import { useState } from 'react'

const GOLD = '#C9A84C'
const CREAM = '#fff8ed'

export default function ConnexionPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
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
        setError(data.error || 'Erreur de connexion')
        return
      }

      window.location.href = '/mon-espace'
    } catch {
      setError('Erreur de connexion. Réessayez.')
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
            Connectez-vous à votre espace
          </p>
        </div>

        {/* Formulaire */}
        <form onSubmit={handleSubmit} style={{ background: 'white', borderRadius: 20, padding: '36px 32px', boxShadow: '0 12px 48px rgba(201,168,76,0.12)', border: `1px solid ${GOLD}22` }}>
          {error && (
            <div style={{ background: '#fef2f2', border: '1px solid #fecaca', borderRadius: 12, padding: '12px 16px', marginBottom: 20, fontSize: 13, color: '#dc2626' }}>
              {error}
            </div>
          )}

          <div style={{ marginBottom: 20 }}>
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

          <div style={{ marginBottom: 8 }}>
            <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#4a3728', marginBottom: 6, letterSpacing: '0.05em', textTransform: 'uppercase' }}>
              Mot de passe
            </label>
            <input
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
              placeholder="••••••••"
              style={{ width: '100%', padding: '12px 16px', borderRadius: 12, border: `1px solid ${GOLD}44`, fontSize: 15, color: '#4a3728', background: '#fefcf8', outline: 'none', boxSizing: 'border-box', fontFamily: 'Georgia, serif' }}
            />
          </div>

          <div style={{ textAlign: 'right', marginBottom: 24 }}>
            <a href="/auth/mot-de-passe-oublie" style={{ fontSize: 13, color: GOLD, textDecoration: 'none', fontFamily: 'var(--font-cormorant-garamond)', fontStyle: 'italic' }}>
              Mot de passe oublié ?
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
            {loading ? 'Connexion…' : 'Me connecter'}
          </button>
        </form>

        {/* Lien vers achat */}
        <div style={{ textAlign: 'center', marginTop: 28 }}>
          <p style={{ fontSize: 14, color: '#8a7860', fontFamily: 'var(--font-cormorant-garamond)', fontStyle: 'italic' }}>
            Pas encore de compte ?{' '}
            <a href="/paiement" style={{ color: GOLD, fontWeight: 600, textDecoration: 'none' }}>
              Créer mon faire-part
            </a>
          </p>
        </div>
      </div>
    </div>
  )
}
