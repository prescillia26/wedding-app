'use client'

import { useState } from 'react'

const GOLD = '#C9A84C'
const CREAM = '#fdf0f3'
const DARK = '#2d1f14'
const TEXT = '#6a5040'
const LIGHT_GOLD = '#fdf8ef'

type Pack = 'essentiel' | 'premium' | 'luxe'

const PACKS: { key: Pack; prix: number; titre: string; badge?: string; features: string[] }[] = [
  {
    key: 'essentiel',
    prix: 79,
    titre: 'Essentiel',
    features: [
      '1 faire-part digital',
      "Jusqu'à 3 événements",
      'RSVP basique',
      '1 thème au choix',
      'Lien de partage WhatsApp',
    ],
  },
  {
    key: 'premium',
    prix: 129,
    titre: 'Premium',
    badge: 'Le plus populaire ⭐',
    features: [
      'Tout l\'Essentiel',
      'Photos carrousel (5 max)',
      'Musique de fond',
      'Compte à rebours',
      'Dashboard RSVP complet + export Excel',
      'Bilingue français / hébreu',
      'Modifications illimitées',
    ],
  },
  {
    key: 'luxe',
    prix: 199,
    titre: 'Luxe',
    features: [
      'Tout le Premium',
      'Plan de table interactif',
      'Save the date inclus',
      'Rappels automatiques invités',
      'Support prioritaire 24h',
    ],
  },
]

function CheckIcon({ color }: { color: string }) {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" style={{ flexShrink: 0, marginTop: 2 }}>
      <circle cx="8" cy="8" r="8" fill={color} opacity="0.12" />
      <path d="M4.5 8.5L6.5 10.5L11.5 5.5" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

export default function PaiementPage() {
  const [loading, setLoading] = useState<Pack | null>(null)
  const [error, setError] = useState<string | null>(null)

  const startCheckout = async (pack: Pack) => {
    setLoading(pack)
    setError(null)
    try {
      const res = await fetch('/api/create-checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ pack }),
      })
      const { url, error: err } = await res.json()
      if (err || !url) throw new Error(err || 'Erreur')
      window.location.href = url
    } catch {
      setError('Une erreur est survenue. Veuillez réessayer.')
      setLoading(null)
    }
  }

  return (
    <div style={{ minHeight: '100vh', background: `linear-gradient(180deg, #fff 0%, ${CREAM} 100%)`, padding: '64px 24px' }}>

      {/* En-tête */}
      <div style={{ textAlign: 'center', marginBottom: 56 }}>
        <a href="/" style={{ fontFamily: 'var(--font-great-vibes)', fontSize: 40, color: GOLD, textDecoration: 'none', display: 'block', marginBottom: 4 }}>Lov&apos;it</a>
        <div style={{ fontFamily: 'var(--font-cormorant-garamond)', fontStyle: 'italic', fontSize: 13, color: `${GOLD}99`, letterSpacing: 4, textTransform: 'uppercase', marginBottom: 24 }}>
          faire-parts de mariage digitaux
        </div>
        <div style={{ fontFamily: 'var(--font-playfair-display)', fontSize: 'clamp(22px, 4vw, 34px)', color: DARK, marginBottom: 12, fontWeight: 400 }}>
          Choisissez votre formule
        </div>
        <p style={{ fontFamily: 'var(--font-cormorant-garamond)', fontStyle: 'italic', fontSize: 18, color: TEXT, maxWidth: 480, margin: '0 auto' }}>
          Un seul paiement, un faire-part inoubliable.
        </p>
      </div>

      {/* Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 24, maxWidth: 960, margin: '0 auto 48px' }}>
        {PACKS.map(pack => {
          const isPremium = pack.key === 'premium'
          return (
            <div key={pack.key} style={{
              position: 'relative',
              background: isPremium ? `linear-gradient(160deg, ${CREAM} 0%, #fff 100%)` : 'white',
              borderRadius: 20,
              padding: '36px 32px 32px',
              boxShadow: isPremium ? `0 16px 56px ${GOLD}33` : '0 4px 24px rgba(0,0,0,0.07)',
              border: isPremium ? `2px solid ${GOLD}` : '1px solid #f0e0d0',
              display: 'flex',
              flexDirection: 'column',
            }}>
              {/* Badge populaire */}
              {pack.badge && (
                <div style={{
                  position: 'absolute', top: -14, left: '50%', transform: 'translateX(-50%)',
                  background: `linear-gradient(135deg, ${GOLD}, #e8c96a)`,
                  color: 'white', padding: '5px 18px', borderRadius: 9999,
                  fontFamily: 'var(--font-playfair-display)', fontSize: 12, fontWeight: 700,
                  whiteSpace: 'nowrap', boxShadow: `0 4px 16px ${GOLD}55`,
                }}>
                  {pack.badge}
                </div>
              )}

              {/* Titre & Prix */}
              <div style={{ fontFamily: 'var(--font-great-vibes)', fontSize: 36, color: GOLD, marginBottom: 4 }}>{pack.titre}</div>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: 4, marginBottom: 24 }}>
                <span style={{ fontFamily: 'var(--font-playfair-display)', fontSize: 42, fontWeight: 700, color: DARK }}>{pack.prix}€</span>
                <span style={{ fontFamily: 'var(--font-cormorant-garamond)', fontStyle: 'italic', fontSize: 16, color: TEXT }}>une seule fois</span>
              </div>

              {/* Séparateur */}
              <div style={{ height: 1, background: `${GOLD}22`, marginBottom: 24 }} />

              {/* Features */}
              <ul style={{ listStyle: 'none', padding: 0, margin: '0 0 32px', flex: 1 }}>
                {pack.features.map(f => (
                  <li key={f} style={{ display: 'flex', alignItems: 'flex-start', gap: 10, marginBottom: 12, fontFamily: 'var(--font-cormorant-garamond)', fontSize: 16, color: TEXT, lineHeight: 1.5 }}>
                    <CheckIcon color={GOLD} />{f}
                  </li>
                ))}
              </ul>

              {/* CTA */}
              <button
                onClick={() => startCheckout(pack.key)}
                disabled={loading !== null}
                style={{
                  width: '100%', padding: '14px 0', borderRadius: 9999, cursor: loading ? 'not-allowed' : 'pointer',
                  background: isPremium ? `linear-gradient(135deg, ${GOLD}, #e8c96a)` : 'transparent',
                  border: isPremium ? 'none' : `1.5px solid ${GOLD}`,
                  color: isPremium ? 'white' : GOLD,
                  fontFamily: 'var(--font-playfair-display)', fontSize: 15, fontWeight: 700, letterSpacing: '0.05em',
                  boxShadow: isPremium ? `0 6px 24px ${GOLD}44` : 'none',
                  opacity: loading && loading !== pack.key ? 0.5 : 1,
                  transition: 'opacity 0.2s',
                } as React.CSSProperties}
              >
                {loading === pack.key ? 'Redirection…' : 'Commencer'}
              </button>
            </div>
          )
        })}
      </div>

      {error && (
        <p style={{ textAlign: 'center', color: '#ef4444', fontFamily: 'var(--font-cormorant-garamond)', fontSize: 16, marginBottom: 24 }}>{error}</p>
      )}

      {/* Réassurance */}
      <div style={{ textAlign: 'center', maxWidth: 600, margin: '0 auto' }}>
        <div style={{ display: 'flex', justifyContent: 'center', gap: 32, flexWrap: 'wrap', marginBottom: 20 }}>
          {[
            { icon: '🔒', text: 'Paiement sécurisé Stripe' },
            { icon: '✨', text: 'Accès immédiat après paiement' },
            { icon: '💌', text: 'Code envoyé par email' },
          ].map(({ icon, text }) => (
            <div key={text} style={{ display: 'flex', alignItems: 'center', gap: 6, fontFamily: 'var(--font-cormorant-garamond)', fontSize: 15, color: TEXT }}>
              <span>{icon}</span><span>{text}</span>
            </div>
          ))}
        </div>
        <p style={{ fontFamily: 'var(--font-cormorant-garamond)', fontStyle: 'italic', fontSize: 14, color: '#9ca3af' }}>
          Vous avez déjà un code ?{' '}
          <a href="/faire-part" style={{ color: GOLD, textDecoration: 'underline' }}>Accéder directement</a>
        </p>
      </div>

      {/* Footer */}
      <div style={{ textAlign: 'center', marginTop: 64 }}>
        <div style={{ fontFamily: 'var(--font-great-vibes)', fontSize: 28, color: `${GOLD}66`, marginBottom: 8 }}>Lov&apos;it</div>
        <p style={{ fontFamily: 'var(--font-cormorant-garamond)', fontStyle: 'italic', fontSize: 13, color: '#c4b5a0' }}>
          © 2025 Lov&apos;it — faire-parts de mariage digitaux
        </p>
      </div>
    </div>
  )
}
