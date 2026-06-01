'use client'

import React, { useState, useEffect } from 'react'

const GV = 'var(--font-great-vibes)'
const PD = 'var(--font-playfair-display)'
const CG = 'var(--font-cormorant-garamond)'

export default function InvitationCover({
  prenom1,
  prenom2,
  lieu,
  date,
  accent,
  fond,
  logoUrl,
  onOpen,
}: {
  prenom1: string
  prenom2: string
  lieu?: string
  date?: string
  accent: string
  fond: string
  logoUrl?: string
  onOpen: () => void
}) {
  const [countdown, setCountdown] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 })
  const [opened, setOpened] = useState(false)

  useEffect(() => {
    if (!date) return
    const target = new Date(date).getTime()
    const tick = () => {
      const diff = Math.max(0, target - Date.now())
      setCountdown({
        days: Math.floor(diff / 86400000),
        hours: Math.floor((diff % 86400000) / 3600000),
        minutes: Math.floor((diff % 3600000) / 60000),
        seconds: Math.floor((diff % 60000) / 1000),
      })
    }
    tick()
    const id = setInterval(tick, 1000)
    return () => clearInterval(id)
  }, [date])

  const handleOpen = () => {
    setOpened(true)
    setTimeout(onOpen, 800)
  }

  const p1 = prenom1 || 'Prénom'
  const p2 = prenom2 || 'Prénom'

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 300, display: 'flex', alignItems: 'center', justifyContent: 'center',
      background: fond,
      opacity: opened ? 0 : 1,
      transform: opened ? 'scale(1.05)' : 'scale(1)',
      transition: 'opacity 0.8s ease, transform 0.8s ease',
      pointerEvents: opened ? 'none' : 'auto',
    }}>
      {/* Particules décoratives animées */}
      <style>{`
        @keyframes coverFloat1 { 0%,100% { transform: translateY(0) rotate(0deg); opacity: 0.15; } 50% { transform: translateY(-20px) rotate(5deg); opacity: 0.3; } }
        @keyframes coverFloat2 { 0%,100% { transform: translateY(0) rotate(0deg); opacity: 0.1; } 50% { transform: translateY(-15px) rotate(-3deg); opacity: 0.2; } }
        @keyframes coverPulse { 0%,100% { opacity: 0.6; } 50% { opacity: 1; } }
        @keyframes coverFadeIn { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
      `}</style>

      {/* Ornements coins */}
      <div style={{ position: 'absolute', top: 40, left: 40, width: 60, height: 60, borderTop: `1px solid ${accent}30`, borderLeft: `1px solid ${accent}30`, animation: 'coverFloat1 6s ease infinite' }} />
      <div style={{ position: 'absolute', top: 40, right: 40, width: 60, height: 60, borderTop: `1px solid ${accent}30`, borderRight: `1px solid ${accent}30`, animation: 'coverFloat2 7s ease infinite' }} />
      <div style={{ position: 'absolute', bottom: 40, left: 40, width: 60, height: 60, borderBottom: `1px solid ${accent}30`, borderLeft: `1px solid ${accent}30`, animation: 'coverFloat2 6s ease infinite' }} />
      <div style={{ position: 'absolute', bottom: 40, right: 40, width: 60, height: 60, borderBottom: `1px solid ${accent}30`, borderRight: `1px solid ${accent}30`, animation: 'coverFloat1 7s ease infinite' }} />

      <div style={{ textAlign: 'center', padding: '0 32px', animation: 'coverFadeIn 1.2s ease both' }}>
        {/* Petit séparateur haut */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 12, marginBottom: 32 }}>
          <div style={{ width: 40, height: 0.5, background: accent, opacity: 0.3 }} />
          <span style={{ color: accent, fontSize: 10, opacity: 0.4 }}>✦</span>
          <div style={{ width: 40, height: 0.5, background: accent, opacity: 0.3 }} />
        </div>

        {/* Logo / Monogramme */}
        {logoUrl ? (
          <div style={{ marginBottom: 28 }}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={logoUrl} alt="" style={{ width: 120, height: 120, objectFit: 'contain', mixBlendMode: 'multiply', display: 'inline-block' }} />
          </div>
        ) : (
          <div style={{ marginBottom: 28 }}>
            <span style={{ fontFamily: GV, fontSize: 56, color: accent }}>{p1[0]}</span>
            <span style={{ fontFamily: CG, fontStyle: 'italic', fontSize: 24, color: accent, margin: '0 4px', opacity: 0.5 }}>&</span>
            <span style={{ fontFamily: GV, fontSize: 56, color: accent }}>{p2[0]}</span>
          </div>
        )}

        {/* Prénoms */}
        <div style={{ marginBottom: 24 }}>
          <span style={{ fontFamily: GV, fontSize: 'clamp(32px, 10vw, 52px)', color: accent }}>{p1}</span>
          <span style={{ fontFamily: CG, fontStyle: 'italic', fontSize: 20, color: accent, margin: '0 10px', opacity: 0.5 }}>&</span>
          <span style={{ fontFamily: GV, fontSize: 'clamp(32px, 10vw, 52px)', color: accent }}>{p2}</span>
        </div>

        {/* Séparateur */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 12, marginBottom: 24 }}>
          <div style={{ width: 50, height: 0.5, background: accent, opacity: 0.3 }} />
          <span style={{ color: accent, fontSize: 8, opacity: 0.4 }}>✦</span>
          <div style={{ width: 50, height: 0.5, background: accent, opacity: 0.3 }} />
        </div>

        {/* Lieu */}
        {lieu && (
          <div style={{ fontFamily: PD, fontSize: 13, color: accent, letterSpacing: 5, textTransform: 'uppercase', marginBottom: 8, opacity: 0.8 }}>
            {lieu}
          </div>
        )}

        {/* Date */}
        {date && (
          <div style={{ fontFamily: PD, fontStyle: 'italic', fontSize: 13, color: accent, marginBottom: 32, opacity: 0.6 }}>
            {new Date(date).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })}
          </div>
        )}

        {/* Countdown */}
        {date && (
          <div style={{ display: 'flex', justifyContent: 'center', gap: 16, marginBottom: 36 }}>
            {[
              { v: countdown.days, l: 'JOURS' },
              { v: countdown.hours, l: 'H' },
              { v: countdown.minutes, l: 'MIN' },
              { v: countdown.seconds, l: 'SEC' },
            ].map(({ v, l }) => (
              <div key={l}>
                <div style={{ fontFamily: PD, fontSize: 24, color: accent, fontWeight: 700, lineHeight: 1 }}>{v}</div>
                <div style={{ fontFamily: PD, fontSize: 7, color: accent, letterSpacing: 2, marginTop: 4, opacity: 0.5 }}>{l}</div>
              </div>
            ))}
          </div>
        )}

        {/* Bouton "Découvrir votre invitation" */}
        <button
          type="button"
          onClick={handleOpen}
          style={{
            fontFamily: PD, fontSize: 12, fontWeight: 700, letterSpacing: 4, textTransform: 'uppercase',
            padding: '16px 40px', borderRadius: 0, border: `1.5px solid ${accent}`,
            background: 'transparent', color: accent, cursor: 'pointer',
            animation: 'coverPulse 3s ease infinite',
            transition: 'background 0.3s, color 0.3s',
          }}
          onMouseEnter={e => { e.currentTarget.style.background = accent; e.currentTarget.style.color = fond }}
          onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = accent }}
        >
          Découvrir votre invitation
        </button>
      </div>
    </div>
  )
}
