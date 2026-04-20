'use client'

import { useEffect, useState } from 'react'

const GOLD = '#C9A84C'
const CREAM = '#fdf0f3'

export default function SuccesPage() {
  const [code, setCode] = useState<string | null>(null)
  const [pack, setPack] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

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
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: `linear-gradient(160deg, ${CREAM} 0%, #fff5f7 50%, ${CREAM} 100%)`, padding: 24 }}>
      <div style={{ textAlign: 'center', maxWidth: 540 }}>
        {/* Décoration */}
        <div style={{ fontFamily: 'var(--font-cormorant-garamond)', fontStyle: 'italic', fontSize: 13, color: `${GOLD}99`, letterSpacing: 4, textTransform: 'uppercase', marginBottom: 12 }}>
          Paiement confirmé
        </div>
        <div style={{ fontFamily: 'var(--font-great-vibes)', fontSize: 'clamp(40px, 8vw, 60px)', color: GOLD, marginBottom: 8, lineHeight: 1.2 }}>
          Félicitations !
        </div>
        <div style={{ width: 60, height: 1, background: GOLD, opacity: 0.4, margin: '0 auto 28px' }} />

        <p style={{ fontFamily: 'var(--font-cormorant-garamond)', fontStyle: 'italic', fontSize: 20, color: '#4a3728', lineHeight: 1.7, marginBottom: 36 }}>
          Votre pack <strong style={{ fontStyle: 'normal', color: GOLD, textTransform: 'capitalize' }}>{pack}</strong> est activé.<br />
          Conservez précieusement votre code d&apos;accès.
        </p>

        {/* Code d'accès */}
        <div style={{ background: 'white', borderRadius: 20, padding: '32px 40px', boxShadow: '0 12px 48px rgba(201,168,76,0.15)', border: `1px solid ${GOLD}33`, marginBottom: 36 }}>
          <div style={{ fontFamily: 'var(--font-playfair-display)', fontSize: 13, color: '#9ca3af', letterSpacing: 3, textTransform: 'uppercase', marginBottom: 16 }}>
            Votre code d&apos;accès
          </div>
          <div style={{ fontFamily: 'var(--font-playfair-display)', fontSize: 'clamp(36px, 8vw, 52px)', fontWeight: 700, color: GOLD, letterSpacing: '0.25em', marginBottom: 20 }}>
            {code}
          </div>
          <p style={{ fontFamily: 'var(--font-cormorant-garamond)', fontStyle: 'italic', fontSize: 14, color: '#9ca3af', margin: 0 }}>
            Notez ce code — il vous donnera accès à votre faire-part
          </p>
        </div>

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
          Accéder à mon faire-part →
        </a>

        <p style={{ fontFamily: 'var(--font-cormorant-garamond)', fontStyle: 'italic', fontSize: 13, color: '#9ca3af', marginTop: 24 }}>
          Un email de confirmation vous a été envoyé avec votre code.
        </p>
      </div>
    </div>
  )
}
