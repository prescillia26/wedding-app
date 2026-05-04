'use client'

import { useEffect, useState } from 'react'

const GOLD = '#C9A84C'
const CREAM = '#fff8ed'

const inputStyle: React.CSSProperties = {
  width: '100%', padding: '12px 16px', borderRadius: 12,
  border: `1px solid ${GOLD}44`, fontSize: 15, color: '#4a3728',
  background: '#fefcf8', outline: 'none', boxSizing: 'border-box',
  fontFamily: 'Georgia, serif',
}

export default function SuccesPage() {
  const [code, setCode] = useState<string | null>(null)
  const [pack, setPack] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  // Mot de passe
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [pwError, setPwError] = useState<string | null>(null)
  const [pwLoading, setPwLoading] = useState(false)
  const [pwDone, setPwDone] = useState(false)

  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    const sessionId = params.get('session_id')
    if (!sessionId) { setError('Paramètre manquant.'); setLoading(false); return }

    fetch(`/api/verify-payment?session_id=${sessionId}`)
      .then(r => r.json())
      .then(d => {
        if (d.error) { setError(d.error); return }
        setCode(d.code)
        setPack(d.pack)
        try { sessionStorage.setItem('lovit_access_code', d.code) } catch { /* ignore */ }
      })
      .catch(() => setError('Erreur de vérification. Contactez-nous.'))
      .finally(() => setLoading(false))
  }, [])

  const handleSetPassword = async (e: React.FormEvent) => {
    e.preventDefault()
    setPwError(null)

    if (password.length < 8) {
      setPwError('Le mot de passe doit contenir au moins 8 caractères.')
      return
    }
    if (password !== confirm) {
      setPwError('Les mots de passe ne correspondent pas.')
      return
    }

    setPwLoading(true)
    try {
      const res = await fetch('/api/auth/set-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password }),
      })
      if (res.ok) {
        setPwDone(true)
      } else {
        const data = await res.json()
        setPwError(data.error || 'Erreur lors de la création du mot de passe.')
      }
    } catch {
      setPwError('Erreur serveur. Réessayez.')
    } finally {
      setPwLoading(false)
    }
  }

  if (loading) return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: CREAM }}>
      <div style={{ fontFamily: 'var(--font-great-vibes)', fontSize: 32, color: GOLD }}>Vérification…</div>
    </div>
  )

  if (error) return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: CREAM, padding: 24 }}>
      <div style={{ textAlign: 'center', maxWidth: 480 }}>
        <div style={{ fontFamily: 'var(--font-great-vibes)', fontSize: 36, color: GOLD, marginBottom: 16 }}>Oops…</div>
        <p style={{ fontFamily: 'var(--font-cormorant-garamond)', fontSize: 18, color: '#4a3728', marginBottom: 24 }}>{error}</p>
        <a href="/paiement" style={{ padding: '12px 28px', borderRadius: 9999, background: GOLD, color: 'white', textDecoration: 'none', fontSize: 14, fontWeight: 600 }}>Retour</a>
      </div>
    </div>
  )

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: `linear-gradient(160deg, ${CREAM} 0%, #fffaf4 50%, ${CREAM} 100%)`, padding: 24 }}>
      <div style={{ textAlign: 'center', maxWidth: 540 }}>
        <div style={{ fontFamily: 'var(--font-cormorant-garamond)', fontStyle: 'italic', fontSize: 13, color: `${GOLD}99`, letterSpacing: 4, textTransform: 'uppercase', marginBottom: 12 }}>
          Paiement confirmé
        </div>
        <div style={{ fontFamily: 'var(--font-great-vibes)', fontSize: 'clamp(40px, 8vw, 60px)', color: GOLD, marginBottom: 8, lineHeight: 1.2 }}>
          Félicitations !
        </div>
        <div style={{ width: 60, height: 1, background: GOLD, opacity: 0.4, margin: '0 auto 28px' }} />

        <p style={{ fontFamily: 'var(--font-cormorant-garamond)', fontStyle: 'italic', fontSize: 20, color: '#4a3728', lineHeight: 1.7, marginBottom: 36 }}>
          Votre pack <strong style={{ fontStyle: 'normal', color: GOLD, textTransform: 'capitalize' }}>{pack}</strong> est activé.
        </p>

        {/* Formulaire mot de passe */}
        {!pwDone ? (
          <form onSubmit={handleSetPassword} style={{ background: 'white', borderRadius: 20, padding: '32px 32px', boxShadow: '0 12px 48px rgba(201,168,76,0.15)', border: `1px solid ${GOLD}33`, marginBottom: 28, textAlign: 'left' }}>
            <div style={{ fontFamily: 'var(--font-playfair-display)', fontSize: 17, color: '#4a3728', marginBottom: 4, textAlign: 'center' }}>
              Créez votre compte
            </div>
            <p style={{ fontFamily: 'var(--font-cormorant-garamond)', fontStyle: 'italic', fontSize: 14, color: '#9ca3af', marginBottom: 24, textAlign: 'center' }}>
              Pour retrouver votre faire-part depuis n&apos;importe quel appareil
            </p>

            {pwError && (
              <div style={{ background: '#fef2f2', border: '1px solid #fecaca', borderRadius: 12, padding: '10px 14px', marginBottom: 16, fontSize: 13, color: '#dc2626', textAlign: 'center' }}>
                {pwError}
              </div>
            )}

            <div style={{ marginBottom: 16 }}>
              <label style={{ display: 'block', fontSize: 11, fontWeight: 600, color: '#4a3728', marginBottom: 6, letterSpacing: '0.05em', textTransform: 'uppercase' }}>
                Mot de passe
              </label>
              <input
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                required
                minLength={8}
                placeholder="8 caractères minimum"
                style={inputStyle}
              />
            </div>

            <div style={{ marginBottom: 20 }}>
              <label style={{ display: 'block', fontSize: 11, fontWeight: 600, color: '#4a3728', marginBottom: 6, letterSpacing: '0.05em', textTransform: 'uppercase' }}>
                Confirmer le mot de passe
              </label>
              <input
                type="password"
                value={confirm}
                onChange={e => setConfirm(e.target.value)}
                required
                minLength={8}
                placeholder="••••••••"
                style={inputStyle}
              />
            </div>

            <button
              type="submit"
              disabled={pwLoading}
              style={{
                width: '100%', padding: '14px 24px', borderRadius: 9999,
                background: pwLoading ? '#d4b86a' : `linear-gradient(135deg, ${GOLD}, #e8c96a)`,
                color: 'white', border: 'none', fontSize: 15, fontWeight: 700,
                fontFamily: 'var(--font-playfair-display)', letterSpacing: '0.05em',
                cursor: pwLoading ? 'not-allowed' : 'pointer',
                boxShadow: `0 6px 24px ${GOLD}44`,
              }}
            >
              {pwLoading ? 'Création…' : 'Créer votre compte'}
            </button>
          </form>
        ) : (
          <div style={{ background: 'white', borderRadius: 20, padding: '32px 32px', boxShadow: '0 12px 48px rgba(201,168,76,0.15)', border: `1px solid ${GOLD}33`, marginBottom: 28 }}>
            <div style={{ fontSize: 36, marginBottom: 12, color: '#16a34a' }}>&#10003;</div>
            <div style={{ fontFamily: 'var(--font-playfair-display)', fontSize: 17, color: '#4a3728', marginBottom: 8 }}>
              Compte créé avec succès !
            </div>
            <p style={{ fontFamily: 'var(--font-cormorant-garamond)', fontStyle: 'italic', fontSize: 14, color: '#9ca3af', margin: 0 }}>
              Vous pourrez vous reconnecter avec votre email et mot de passe.
            </p>
          </div>
        )}

        <a
          href={`/faire-part?code=${code}`}
          style={{
            display: 'inline-block', padding: '16px 40px', borderRadius: 9999,
            background: `linear-gradient(135deg, ${GOLD}, #e8c96a)`,
            color: 'white', textDecoration: 'none', fontSize: 16, fontWeight: 700,
            fontFamily: 'var(--font-playfair-display)', letterSpacing: '0.06em',
            boxShadow: `0 8px 28px ${GOLD}55`,
          }}
        >
          Créer votre faire-part →
        </a>

        <div style={{ marginTop: 16 }}>
          <a
            href="/mon-espace"
            style={{ fontFamily: 'var(--font-cormorant-garamond)', fontStyle: 'italic', fontSize: 14, color: GOLD, textDecoration: 'underline' }}
          >
            Aller à votre espace
          </a>
        </div>
      </div>
    </div>
  )
}
