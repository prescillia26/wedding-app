'use client'

import React, { useState } from 'react'

const GV = 'var(--font-great-vibes)'
const PD = 'var(--font-playfair-display)'
const CG = 'var(--font-cormorant-garamond)'

export default function InvitationCover({
  prenom1,
  prenom2,
  accent,
  fond,
  logoUrl,
  onOpen,
  mariageJuif,
  illustrationUrl,
  customDesignCoverUrl,
}: {
  prenom1: string
  prenom2: string
  lieu?: string
  date?: string
  accent: string
  fond: string
  logoUrl?: string
  logoColor?: string
  onOpen: () => void
  mariageJuif?: boolean
  illustrationUrl?: string
  customDesignCoverUrl?: string
}) {
  const [opened, setOpened] = useState(false)

  const handleOpen = () => {
    setOpened(true)
    // Scroll vers le premier événement après la transition
    setTimeout(() => {
      onOpen()
      setTimeout(() => {
        const el = document.getElementById('ceremony-0')
        if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' })
      }, 100)
    }, 700)
  }

  const p1 = prenom1 || 'Prénom'
  const p2 = prenom2 || 'Prénom'

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 300,
      display: 'flex', flexDirection: 'column',
      background: fond,
      opacity: opened ? 0 : 1,
      transform: opened ? 'scale(1.05)' : 'scale(1)',
      transition: 'opacity 0.7s ease, transform 0.7s ease',
      pointerEvents: opened ? 'none' : 'auto',
      overflowY: 'auto', WebkitOverflowScrolling: 'touch',
    }}>
      <style>{`
        @keyframes coverPulse { 0%,100% { opacity: 0.6; } 50% { opacity: 1; } }
        @keyframes coverFadeIn { from { opacity: 0; transform: translateY(16px); } to { opacity: 1; transform: translateY(0); } }
      `}</style>

      {/* Contenu centré verticalement avec min-height */}
      {customDesignCoverUrl ? (
        /* ── Mode design custom : affiche l'image de couverture uploadée ── */
        <div style={{
          flex: 1, display: 'flex', flexDirection: 'column',
          alignItems: 'center', justifyContent: 'center',
          minHeight: '100vh', padding: 0,
          animation: 'coverFadeIn 1.2s ease both',
          boxSizing: 'border-box',
          position: 'relative',
        }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={customDesignCoverUrl} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover', position: 'absolute', inset: 0 }} />
          {/* Bouton Découvrir superposé en bas */}
          <div style={{ position: 'absolute', bottom: '8%', left: 0, right: 0, display: 'flex', justifyContent: 'center', zIndex: 1 }}>
            <button
              type="button"
              onClick={handleOpen}
              style={{
                fontFamily: PD, fontSize: 11, fontWeight: 700, letterSpacing: 3, textTransform: 'uppercase',
                padding: '14px 32px', borderRadius: 0, border: `1.5px solid ${accent}`,
                background: 'rgba(255,255,255,0.85)', color: accent, cursor: 'pointer',
                animation: 'coverPulse 3s ease infinite',
                transition: 'background 0.3s, color 0.3s',
                touchAction: 'manipulation', WebkitTapHighlightColor: 'transparent',
                backdropFilter: 'blur(4px)',
              }}
              onMouseEnter={e => { e.currentTarget.style.background = accent; e.currentTarget.style.color = fond }}
              onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.85)'; e.currentTarget.style.color = accent }}
            >
              Découvrir votre invitation
            </button>
          </div>
        </div>
      ) : (
      <div style={{
        flex: 1, display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center',
        minHeight: '100vh', padding: '40px 32px',
        animation: 'coverFadeIn 1.2s ease both',
        boxSizing: 'border-box',
      }}>

        {/* בס״ד */}
        {mariageJuif && (
          <div style={{ fontFamily: 'serif', fontSize: 14, color: accent, direction: 'rtl', marginBottom: 16, opacity: 0.85, fontWeight: 700 }}>בס״ד</div>
        )}

        {/* Logo */}
        {logoUrl ? (() => {
          return (
            <div style={{ marginBottom: 20 }}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={logoUrl} alt="" style={{ width: 140, height: 140, objectFit: 'contain', display: 'inline-block' }} />
            </div>
          )
        })() : (
          <div style={{ marginBottom: 20 }}>
            <span style={{ fontFamily: GV, fontSize: 56, color: accent }}>{p1[0]}</span>
            <span style={{ fontFamily: CG, fontStyle: 'italic', fontSize: 22, color: accent, margin: '0 6px', opacity: 0.5 }}>&</span>
            <span style={{ fontFamily: GV, fontSize: 56, color: accent }}>{p2[0]}</span>
          </div>
        )}

        {/* Illustration couple */}
        {illustrationUrl && (
          <div style={{ marginBottom: 20, display: 'flex', justifyContent: 'center' }}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={illustrationUrl} alt="" style={{ maxWidth: '55%', maxHeight: 180, objectFit: 'contain' }} />
          </div>
        )}

        {/* Prénoms */}
        <div style={{ textAlign: 'center', marginBottom: 24 }}>
          <div>
            <span style={{ fontFamily: GV, fontSize: 'clamp(28px, 8vw, 44px)', color: accent }}>{p1}</span>
            <span style={{ fontFamily: CG, fontStyle: 'italic', fontSize: 18, color: accent, margin: '0 8px', opacity: 0.5 }}>&</span>
            <span style={{ fontFamily: GV, fontSize: 'clamp(28px, 8vw, 44px)', color: accent }}>{p2}</span>
          </div>
          <div style={{ fontFamily: CG, fontStyle: 'italic', fontSize: 14, color: accent, letterSpacing: 1, marginTop: 12, opacity: 0.7, lineHeight: 1.6 }}>
            ont le plaisir de vous convier<br />à leur mariage
          </div>
        </div>

        {/* Bouton Découvrir */}
        <button
          type="button"
          onClick={handleOpen}
          style={{
            fontFamily: PD, fontSize: 11, fontWeight: 700, letterSpacing: 3, textTransform: 'uppercase',
            padding: '14px 32px', borderRadius: 0, border: `1.5px solid ${accent}`,
            background: 'transparent', color: accent, cursor: 'pointer',
            animation: 'coverPulse 3s ease infinite',
            transition: 'background 0.3s, color 0.3s',
            touchAction: 'manipulation', WebkitTapHighlightColor: 'transparent',
          }}
          onMouseEnter={e => { e.currentTarget.style.background = accent; e.currentTarget.style.color = fond }}
          onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = accent }}
        >
          Découvrir votre invitation
        </button>
      </div>
      )}
    </div>
  )
}
