'use client'

import { useState } from 'react'

const GOLD = '#C9A84C'
const CREAM = '#fff8ed'
const DARK = '#2d1f14'
const TEXT = '#6a5040'

const LAUNCH_FEATURES = [
  'Design élégant et personnalisable',
  'Photos carrousel, musique, compte à rebours',
  'Dashboard RSVP complet + export Excel',
  'Modifications illimitées — valable à vie',
  'Lien de partage WhatsApp optimisé',
]

const UPCOMING_PACKS = [
  { titre: 'Essentiel', prix: 79, features: ['1 faire-part', "Jusqu'à 3 événements", 'RSVP basique'] },
  { titre: 'Premium', prix: 129, features: ['Tout l\'Essentiel', 'Photos carrousel', 'Dashboard RSVP'] },
  { titre: 'Luxe', prix: 199, features: ['Tout le Premium', 'Plan de table', 'Save the date'] },
]

function CheckIcon({ color, big }: { color: string; big?: boolean }) {
  const size = big ? 20 : 16
  return (
    <svg width={size} height={size} viewBox="0 0 16 16" fill="none" style={{ flexShrink: 0, marginTop: 2 }}>
      <circle cx="8" cy="8" r="8" fill={color} opacity="0.12" />
      <path d="M4.5 8.5L6.5 10.5L11.5 5.5" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

export default function PaiementPage() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const startCheckout = async () => {
    setLoading(true)
    setError(null)
    try {
      const res = await fetch('/api/create-checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ pack: 'premium' }),  // ← toujours premium pour l'offre de lancement
      })
      const { url, error: err } = await res.json()
      if (err || !url) throw new Error(err || 'Erreur')
      window.location.href = url
    } catch {
      setError('Une erreur est survenue. Veuillez réessayer.')
      setLoading(false)
    }
  }

  return (
    <div style={{ minHeight: '100vh', background: `linear-gradient(180deg, #fff 0%, ${CREAM} 100%)`, padding: '48px 24px 64px' }}>

      {/* En-tête */}
      <div style={{ textAlign: 'center', marginBottom: 48 }}>
        <a href="/" style={{ fontFamily: 'var(--font-great-vibes)', fontSize: 42, color: GOLD, textDecoration: 'none', display: 'block', marginBottom: 4 }}>Lov&apos;it</a>
        <div style={{ fontFamily: 'var(--font-cormorant-garamond)', fontStyle: 'italic', fontSize: 13, color: `${GOLD}99`, letterSpacing: 4, textTransform: 'uppercase' }}>
          faire-parts de mariage digitaux
        </div>
      </div>

      {/* ✅ GRAND PANNEAU OFFRE DE LANCEMENT */}
      <div style={{
        maxWidth: 640, margin: '0 auto',
        background: `linear-gradient(160deg, #fff 0%, ${CREAM} 100%)`,
        borderRadius: 28,
        padding: '48px 40px 40px',
        boxShadow: `0 24px 72px ${GOLD}33`,
        border: `2.5px solid ${GOLD}`,
        position: 'relative',
      }}>
        {/* Badge supérieur */}
        <div style={{
          position: 'absolute', top: -18, left: '50%', transform: 'translateX(-50%)',
          background: `linear-gradient(135deg, ${GOLD}, #e8c96a)`,
          color: 'white', padding: '8px 24px', borderRadius: 9999,
          fontFamily: 'var(--font-playfair-display)', fontSize: 13, fontWeight: 700,
          letterSpacing: '0.1em', whiteSpace: 'nowrap',
          boxShadow: `0 6px 20px ${GOLD}66`,
        }}>
          ✨ OFFRE DE LANCEMENT
        </div>

        {/* Titre */}
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <div style={{ fontFamily: 'var(--font-great-vibes)', fontSize: 'clamp(42px, 8vw, 58px)', color: GOLD, lineHeight: 1, marginBottom: 8 }}>
            Votre faire-part
          </div>
          <div style={{ fontFamily: 'var(--font-cormorant-garamond)', fontStyle: 'italic', fontSize: 18, color: TEXT }}>
            digital, élégant, sur-mesure
          </div>
        </div>

        {/* Prix */}
        <div style={{ textAlign: 'center', marginBottom: 36 }}>
          <div style={{ display: 'inline-flex', alignItems: 'baseline', gap: 14 }}>
            <span style={{ fontFamily: 'var(--font-playfair-display)', fontSize: 28, fontWeight: 400, color: '#aaa', textDecoration: 'line-through' }}>
              149€
            </span>
            <span style={{ fontFamily: 'var(--font-playfair-display)', fontSize: 'clamp(64px, 12vw, 84px)', fontWeight: 700, color: GOLD, lineHeight: 1 }}>
              69€
            </span>
          </div>
          <div style={{ fontFamily: 'var(--font-cormorant-garamond)', fontStyle: 'italic', fontSize: 15, color: TEXT, marginTop: 4 }}>
            paiement unique · valable à vie
          </div>
        </div>

        {/* Features */}
        <div style={{ background: 'white', borderRadius: 16, padding: '28px 28px 24px', marginBottom: 32, border: `1px solid ${GOLD}22` }}>
          <div style={{ fontFamily: 'var(--font-playfair-display)', fontSize: 13, color: GOLD, letterSpacing: 3, textTransform: 'uppercase', marginBottom: 18, textAlign: 'center', fontWeight: 600 }}>
            Tout inclus
          </div>
          <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
            {LAUNCH_FEATURES.map(f => (
              <li key={f} style={{ display: 'flex', alignItems: 'flex-start', gap: 12, marginBottom: 14, fontFamily: 'var(--font-cormorant-garamond)', fontSize: 17, color: DARK, lineHeight: 1.5 }}>
                <CheckIcon color={GOLD} big />
                {f}
              </li>
            ))}
          </ul>
        </div>

        {/* Bouton principal */}
        <button
          onClick={startCheckout}
          disabled={loading}
          style={{
            width: '100%', padding: '18px 0', borderRadius: 9999,
            cursor: loading ? 'not-allowed' : 'pointer', border: 'none',
            background: `linear-gradient(135deg, ${GOLD}, #e8c96a)`,
            color: 'white',
            fontFamily: 'var(--font-playfair-display)', fontSize: 17, fontWeight: 700, letterSpacing: '0.08em',
            boxShadow: `0 10px 32px ${GOLD}55`,
            transition: 'transform 0.15s, box-shadow 0.15s',
          }}
        >
          {loading ? 'Redirection…' : 'Réserver mon accès 69€ →'}
        </button>

        {error && (
          <p style={{ textAlign: 'center', color: '#ef4444', fontFamily: 'var(--font-cormorant-garamond)', fontSize: 15, marginTop: 14 }}>{error}</p>
        )}

        {/* Urgence */}
        <div style={{ textAlign: 'center', marginTop: 20, fontFamily: 'var(--font-cormorant-garamond)', fontStyle: 'italic', fontSize: 15, color: TEXT }}>
          ⏳ Offre réservée aux <strong style={{ fontStyle: 'normal', color: GOLD }}>50 premiers couples</strong>
        </div>

        {/* Réassurance */}
        <div style={{ display: 'flex', justifyContent: 'center', gap: 24, flexWrap: 'wrap', marginTop: 24, paddingTop: 24, borderTop: `1px solid ${GOLD}22` }}>
          {[
            { icon: '🔒', text: 'Paiement sécurisé Stripe' },
            { icon: '✨', text: 'Accès immédiat' },
            { icon: '✅', text: 'Satisfait ou remboursé sous 7 jours' },
          ].map(({ icon, text }) => (
            <div key={text} style={{ display: 'flex', alignItems: 'center', gap: 6, fontFamily: 'var(--font-cormorant-garamond)', fontSize: 13, color: TEXT }}>
              <span>{icon}</span><span>{text}</span>
            </div>
          ))}
        </div>
      </div>

      {/* ── TARIFS APRÈS LANCEMENT ────────────────────────────────────── */}
      <div style={{ maxWidth: 800, margin: '80px auto 0' }}>
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <div style={{ fontFamily: 'var(--font-cormorant-garamond)', fontStyle: 'italic', fontSize: 14, color: '#9ca3af', letterSpacing: 3, textTransform: 'uppercase', marginBottom: 8 }}>
            Après la période de lancement
          </div>
          <div style={{ fontFamily: 'var(--font-playfair-display)', fontSize: 24, color: DARK, fontWeight: 400 }}>
            Les tarifs standards reviendront à :
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16 }}>
          {UPCOMING_PACKS.map(pack => (
            <div key={pack.titre} style={{
              background: '#f9f9f9', borderRadius: 16,
              padding: '24px 20px', border: '1px solid #e5e5e5',
              opacity: 0.75,
            }}>
              <div style={{ fontFamily: 'var(--font-great-vibes)', fontSize: 28, color: '#aaa', marginBottom: 4 }}>{pack.titre}</div>
              <div style={{ fontFamily: 'var(--font-playfair-display)', fontSize: 28, fontWeight: 700, color: '#888', marginBottom: 16 }}>
                {pack.prix}€
              </div>
              <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                {pack.features.map(f => (
                  <li key={f} style={{ display: 'flex', alignItems: 'flex-start', gap: 8, marginBottom: 8, fontFamily: 'var(--font-cormorant-garamond)', fontSize: 14, color: '#999' }}>
                    <CheckIcon color="#bbb" />
                    {f}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>

      {/* Lien connexion */}
      <div style={{ textAlign: 'center', marginTop: 48 }}>
        <p style={{ fontFamily: 'var(--font-cormorant-garamond)', fontStyle: 'italic', fontSize: 14, color: '#9ca3af' }}>
          Déjà un compte ?{' '}
          <a href="/connexion" style={{ color: GOLD, textDecoration: 'underline' }}>Se connecter</a>
        </p>
      </div>

      {/* Footer */}
      <div style={{ textAlign: 'center', marginTop: 64 }}>
        <div style={{ fontFamily: 'var(--font-great-vibes)', fontSize: 28, color: `${GOLD}66`, marginBottom: 8 }}>Lov&apos;it</div>
        <div style={{ display: 'flex', justifyContent: 'center', gap: 16, marginBottom: 8 }}>
          <a href="/mentions-legales" style={{ fontFamily: 'var(--font-cormorant-garamond)', fontSize: 13, color: '#8a7860', textDecoration: 'none' }}>Mentions légales</a>
          <a href="mailto:contact@getlovit.fr" style={{ fontFamily: 'var(--font-cormorant-garamond)', fontSize: 13, color: '#8a7860', textDecoration: 'none' }}>Contact</a>
        </div>
        <p style={{ fontFamily: 'var(--font-cormorant-garamond)', fontStyle: 'italic', fontSize: 12, color: '#c4b5a0', margin: 0 }}>
          © 2026 Lov&apos;it — faire-parts de mariage digitaux
        </p>
      </div>
    </div>
  )
}