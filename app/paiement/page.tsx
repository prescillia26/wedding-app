'use client'

import { useState } from 'react'
import { useT } from '@/lib/i18n'
import { LangSwitch } from '../components/LangSwitch'

const GOLD = '#C9A84C'
const CREAM = '#fff8ed'
const DARK = '#2d1f14'
const TEXT = '#6a5040'

function CheckIcon({ color, big }: { color: string; big?: boolean }) {
  const size = big ? 20 : 16
  return (
    <svg width={size} height={size} viewBox="0 0 16 16" fill="none" style={{ flexShrink: 0, marginTop: 2 }}>
      <circle cx="8" cy="8" r="8" fill={color} opacity="0.12" />
      <path d="M4.5 8.5L6.5 10.5L11.5 5.5" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

const PREMIUM_FEATURES = [
  'Design élégant et personnalisable',
  '12 thèmes au choix',
  'Cadres décoratifs & cadres vidéo animés',
  'RSVP intégré + notifications email',
  'Musique de fond, photos carrousel',
  'Clavier hébreu intégré',
  'Modifications illimitées — valable à vie',
]

const LUXE_FEATURES = [
  'Tout le pack Premium',
  'Aquarelles IA par événement (lieu réel)',
  'Illustrations décoratives (bagues, colombes, coupes…)',
  'Palette de couleurs personnalisée',
  'Design Luxe personnalisé par l\'IA',
]

export default function PaiementPage() {
  const [loading, setLoading] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const { t, locale } = useT()

  const startCheckout = async (pack: 'essentiel' | 'premium') => {
    setLoading(pack)
    setError(null)
    try {
      const res = await fetch('/api/create-checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ pack, locale }),
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
    <div style={{ minHeight: '100vh', background: `linear-gradient(180deg, #fff 0%, ${CREAM} 100%)`, padding: '48px 24px 64px' }}>

      {/* En-tête */}
      <div style={{ textAlign: 'center', marginBottom: 48 }}>
        <LangSwitch />
        <a href="/" style={{ fontFamily: 'var(--font-great-vibes)', fontSize: 42, color: GOLD, textDecoration: 'none', display: 'block', marginBottom: 4 }}>Lov&apos;it</a>
        <div style={{ fontFamily: 'var(--font-cormorant-garamond)', fontStyle: 'italic', fontSize: 13, color: `${GOLD}99`, letterSpacing: 4, textTransform: 'uppercase' }}>
          faire-parts de mariage digitaux
        </div>
      </div>

      {/* Titre section */}
      <div style={{ textAlign: 'center', marginBottom: 40 }}>
        <div style={{ fontFamily: 'var(--font-great-vibes)', fontSize: 'clamp(42px, 8vw, 58px)', color: GOLD, lineHeight: 1, marginBottom: 8 }}>
          {t.payment.title}
        </div>
        <div style={{ fontFamily: 'var(--font-cormorant-garamond)', fontStyle: 'italic', fontSize: 18, color: TEXT }}>
          Choisissez la formule qui vous correspond.
        </div>
      </div>

      {/* ── Pack unique ── */}
      <div style={{ maxWidth: 440, margin: '0 auto 40px' }}>

        {/* ── Premium — 69€ ── */}
        <div style={{
          background: `linear-gradient(160deg, #fff 0%, ${CREAM} 100%)`,
          borderRadius: 28, padding: '40px 32px',
          boxShadow: `0 16px 56px ${GOLD}22`,
          border: `1.5px solid ${GOLD}66`,
          position: 'relative', textAlign: 'center',
        }}>
          <div style={{ fontFamily: 'var(--font-cormorant-garamond)', fontStyle: 'italic', fontSize: 14, color: GOLD, letterSpacing: 3, textTransform: 'uppercase', marginBottom: 8 }}>
            Premium
          </div>
          <div style={{ display: 'inline-flex', alignItems: 'baseline', gap: 8, marginBottom: 4 }}>
            <span style={{ fontFamily: 'var(--font-playfair-display)', fontSize: 22, color: '#aaa', textDecoration: 'line-through' }}>
              {t.common.priceBefore}
            </span>
            <span style={{ fontFamily: 'var(--font-playfair-display)', fontSize: 64, fontWeight: 700, color: GOLD, lineHeight: 1 }}>
              {t.common.price}
            </span>
          </div>
          <div style={{ fontFamily: 'var(--font-cormorant-garamond)', fontStyle: 'italic', fontSize: 15, color: TEXT, marginBottom: 28 }}>
            {t.common.singlePayment} · {t.common.lifetimeAccess}
          </div>

          <div style={{ background: 'white', borderRadius: 16, padding: '24px 24px 20px', marginBottom: 28, border: `1px solid ${GOLD}22`, textAlign: 'left' }}>
            {PREMIUM_FEATURES.map(f => (
              <div key={f} style={{ display: 'flex', alignItems: 'flex-start', gap: 10, marginBottom: 12, fontFamily: 'var(--font-cormorant-garamond)', fontSize: 16, color: DARK, lineHeight: 1.4 }}>
                <CheckIcon color={GOLD} big />
                {f}
              </div>
            ))}
          </div>

          <button
            onClick={() => startCheckout('essentiel')}
            disabled={loading !== null}
            style={{
              width: '100%', padding: '16px 0', borderRadius: 9999,
              cursor: loading ? 'not-allowed' : 'pointer', border: 'none',
              background: `linear-gradient(135deg, ${GOLD}, #e8c96a)`,
              color: 'white',
              fontFamily: 'var(--font-playfair-display)', fontSize: 15, fontWeight: 700, letterSpacing: '0.06em',
              boxShadow: `0 8px 28px ${GOLD}44`,
              opacity: loading && loading !== 'essentiel' ? 0.5 : 1,
            }}
          >
            {loading === 'essentiel' ? 'Redirection…' : `Choisir le Premium — ${t.common.price}`}
          </button>
        </div>

      </div>

      {error && (
        <p style={{ textAlign: 'center', color: '#ef4444', fontFamily: 'var(--font-cormorant-garamond)', fontSize: 15, marginTop: 14 }}>{error}</p>
      )}

      {/* Réassurance */}
      <div style={{ display: 'flex', justifyContent: 'center', gap: 24, flexWrap: 'wrap', marginTop: 32, maxWidth: 600, margin: '32px auto 0' }}>
        {[
          { icon: '🔒', text: t.payment.trust.secure },
          { icon: '✨', text: t.payment.trust.instant },
          { icon: '✅', text: t.payment.trust.guarantee },
        ].map(({ icon, text }) => (
          <div key={text} style={{ display: 'flex', alignItems: 'center', gap: 6, fontFamily: 'var(--font-cormorant-garamond)', fontSize: 13, color: TEXT }}>
            <span>{icon}</span><span>{text}</span>
          </div>
        ))}
      </div>

      {/* Urgence */}
      <div style={{ textAlign: 'center', marginTop: 24, fontFamily: 'var(--font-cormorant-garamond)', fontStyle: 'italic', fontSize: 15, color: TEXT }}>
        ⏳ {t.payment.urgency} <strong style={{ fontStyle: 'normal', color: GOLD }}>{t.payment.urgencyCouples}</strong>
      </div>

      {/* Lien connexion */}
      <div style={{ textAlign: 'center', marginTop: 48 }}>
        <p style={{ fontFamily: 'var(--font-cormorant-garamond)', fontStyle: 'italic', fontSize: 14, color: '#9ca3af' }}>
          {t.payment.alreadyAccount}{' '}
          <a href="/connexion" style={{ color: GOLD, textDecoration: 'underline' }}>{t.common.login}</a>
        </p>
      </div>

      {/* Footer */}
      <div style={{ textAlign: 'center', marginTop: 64 }}>
        <div style={{ fontFamily: 'var(--font-great-vibes)', fontSize: 28, color: `${GOLD}66`, marginBottom: 8 }}>Lov&apos;it</div>
        <div style={{ display: 'flex', justifyContent: 'center', gap: 16, marginBottom: 8 }}>
          <a href="/mentions-legales" style={{ fontFamily: 'var(--font-cormorant-garamond)', fontSize: 13, color: '#8a7860', textDecoration: 'none' }}>{t.common.legalNotice}</a>
          <a href="/cgv" style={{ fontFamily: 'var(--font-cormorant-garamond)', fontSize: 13, color: '#8a7860', textDecoration: 'none' }}>{t.common.terms}</a>
          <a href="/politique-de-confidentialite" style={{ fontFamily: 'var(--font-cormorant-garamond)', fontSize: 13, color: '#8a7860', textDecoration: 'none' }}>{t.common.privacyPolicy}</a>
          <a href="/contact" style={{ fontFamily: 'var(--font-cormorant-garamond)', fontSize: 13, color: '#8a7860', textDecoration: 'none' }}>{t.common.contact}</a>
        </div>
        <p style={{ fontFamily: 'var(--font-cormorant-garamond)', fontStyle: 'italic', fontSize: 12, color: '#c4b5a0', margin: 0 }}>
          © 2026 Lov&apos;it — faire-parts de mariage digitaux
        </p>
      </div>
    </div>
  )
}
