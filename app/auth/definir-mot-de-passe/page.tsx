'use client'

import { useEffect, useState } from 'react'

const GOLD = '#C9A84C'
const CREAM = '#fff8ed'

export default function DefinirMotDePassePage() {
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [verifying, setVerifying] = useState(true)
  const [verified, setVerified] = useState(false)
  const [done, setDone] = useState(false)

  // D'abord valider le magic link pour créer la session
  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    const token = params.get('token')

    if (!token) {
      setError('Lien invalide.')
      setVerifying(false)
      return
    }

    fetch(`/api/auth/verify?token=${token}`)
      .then(res => res.json().then(data => ({ ok: res.ok, data })))
      .then(({ ok, data }) => {
        if (ok && data.ok) {
          setVerified(true)
        } else {
          setError(data.error || 'Lien invalide ou expiré.')
        }
      })
      .catch(() => setError('Erreur de vérification.'))
      .finally(() => setVerifying(false))
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    if (password.length < 8) {
      setError('Le mot de passe doit contenir au moins 8 caractères.')
      return
    }
    if (password !== confirm) {
      setError('Les mots de passe ne correspondent pas.')
      return
    }

    setLoading(true)
    try {
      const res = await fetch('/api/auth/set-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password }),
      })
      const data = await res.json()

      if (!res.ok) {
        setError(data.error || 'Erreur lors de la définition du mot de passe.')
        return
      }

      setDone(true)
      setTimeout(() => {
        window.location.href = '/mon-espace'
      }, 2000)
    } catch {
      setError('Erreur serveur. Réessayez.')
    } finally {
      setLoading(false)
    }
  }

  if (verifying) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: `linear-gradient(160deg, ${CREAM} 0%, #fff5f7 50%, ${CREAM} 100%)` }}>
        <div style={{ fontFamily: 'var(--font-great-vibes)', fontSize: 32, color: GOLD }}>Vérification…</div>
      </div>
    )
  }

  if (done) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: `linear-gradient(160deg, ${CREAM} 0%, #fff5f7 50%, ${CREAM} 100%)`, padding: 24 }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontFamily: 'var(--font-great-vibes)', fontSize: 48, color: GOLD, marginBottom: 16 }}>Lov&apos;it</div>
          <div style={{ fontSize: 48, marginBottom: 16 }}>&#10003;</div>
          <div style={{ fontFamily: 'var(--font-cormorant-garamond)', fontStyle: 'italic', fontSize: 20, color: '#4a3728' }}>
            Mot de passe défini avec succès !
          </div>
          <p style={{ fontFamily: 'var(--font-cormorant-garamond)', fontStyle: 'italic', fontSize: 14, color: '#9ca3af', marginTop: 8 }}>
            Redirection vers votre espace…
          </p>
        </div>
      </div>
    )
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
            Définissez votre mot de passe
          </p>
          <p style={{ fontFamily: 'var(--font-cormorant-garamond)', fontStyle: 'italic', fontSize: 14, color: '#9ca3af', marginTop: 4 }}>
            Pour vous connecter depuis n&apos;importe quel appareil
          </p>
        </div>

        {!verified && error ? (
          <div style={{ background: 'white', borderRadius: 20, padding: '36px 32px', boxShadow: '0 12px 48px rgba(201,168,76,0.12)', border: `1px solid ${GOLD}22`, textAlign: 'center' }}>
            <div style={{ fontSize: 14, color: '#dc2626', marginBottom: 20 }}>{error}</div>
            <a
              href="/auth/mot-de-passe-oublie"
              style={{
                display: 'inline-block', padding: '12px 28px', borderRadius: 9999,
                background: `linear-gradient(135deg, ${GOLD}, #e8c96a)`,
                color: 'white', textDecoration: 'none', fontSize: 14, fontWeight: 700,
              }}
            >
              Recevoir un nouveau lien
            </a>
          </div>
        ) : (
          <form onSubmit={handleSubmit} style={{ background: 'white', borderRadius: 20, padding: '36px 32px', boxShadow: '0 12px 48px rgba(201,168,76,0.12)', border: `1px solid ${GOLD}22` }}>
            {error && (
              <div style={{ background: '#fef2f2', border: '1px solid #fecaca', borderRadius: 12, padding: '12px 16px', marginBottom: 20, fontSize: 13, color: '#dc2626' }}>
                {error}
              </div>
            )}

            <div style={{ marginBottom: 20 }}>
              <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#4a3728', marginBottom: 6, letterSpacing: '0.05em', textTransform: 'uppercase' }}>
                Nouveau mot de passe
              </label>
              <input
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                required
                minLength={8}
                placeholder="8 caractères minimum"
                style={{ width: '100%', padding: '12px 16px', borderRadius: 12, border: `1px solid ${GOLD}44`, fontSize: 15, color: '#4a3728', background: '#fefcf8', outline: 'none', boxSizing: 'border-box', fontFamily: 'Georgia, serif' }}
              />
            </div>

            <div style={{ marginBottom: 28 }}>
              <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#4a3728', marginBottom: 6, letterSpacing: '0.05em', textTransform: 'uppercase' }}>
                Confirmer le mot de passe
              </label>
              <input
                type="password"
                value={confirm}
                onChange={e => setConfirm(e.target.value)}
                required
                minLength={8}
                placeholder="••••••••"
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
              {loading ? 'Enregistrement…' : 'Définir votre mot de passe'}
            </button>
          </form>
        )}
      </div>
    </div>
  )
}
