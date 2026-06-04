'use client'

import React, { useState, useEffect } from 'react'

const GV = 'var(--font-great-vibes)'
const PD = 'var(--font-playfair-display)'
const CG = 'var(--font-cormorant-garamond)'

export default function InvitationCover({
  prenom1,
  prenom2,
  date,
  accent,
  fond,
  logoUrl,
  logoColor,
  onOpen,
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
      {/* Animations */}
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

        {/* Logo en gros */}
        {logoUrl ? (() => {
          const colorToUse = logoColor || accent.replace('#', '')
          let displayUrl = logoUrl
          if (logoUrl.includes('cloudinary.com')) {
            const hex = colorToUse.replace('#', '')
            displayUrl = hex
              ? logoUrl.replace('/upload/', `/upload/e_background_removal/e_trim/e_grayscale/e_tint:100:${hex}:0p/`)
              : logoUrl.replace('/upload/', '/upload/e_background_removal/e_trim/')
          }
          return (
            <div style={{ marginBottom: 32 }}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={displayUrl} alt="" style={{ width: 180, height: 180, objectFit: 'contain', display: 'inline-block' }} />
            </div>
          )
        })() : (
          <div style={{ marginBottom: 32 }}>
            <span style={{ fontFamily: GV, fontSize: 72, color: accent }}>{p1[0]}</span>
            <span style={{ fontFamily: CG, fontStyle: 'italic', fontSize: 28, color: accent, margin: '0 8px', opacity: 0.5 }}>&</span>
            <span style={{ fontFamily: GV, fontSize: 72, color: accent }}>{p2[0]}</span>
          </div>
        )}

        {/* Séparateur */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 12, marginBottom: 28 }}>
          <div style={{ width: 50, height: 0.5, background: accent, opacity: 0.3 }} />
          <span style={{ color: accent, fontSize: 8, opacity: 0.4 }}>✦</span>
          <div style={{ width: 50, height: 0.5, background: accent, opacity: 0.3 }} />
        </div>

        {/* Phrase — mariage de Prénom & Prénom */}
        <div style={{ marginBottom: 32 }}>
          <div style={{ fontFamily: PD, fontSize: 11, color: accent, letterSpacing: 4, textTransform: 'uppercase', marginBottom: 12, opacity: 0.6 }}>
            Vous êtes conviés au mariage de
          </div>
          <div>
            <span style={{ fontFamily: GV, fontSize: 'clamp(32px, 10vw, 52px)', color: accent }}>{p1}</span>
            <span style={{ fontFamily: CG, fontStyle: 'italic', fontSize: 20, color: accent, margin: '0 10px', opacity: 0.5 }}>&</span>
            <span style={{ fontFamily: GV, fontSize: 'clamp(32px, 10vw, 52px)', color: accent }}>{p2}</span>
          </div>
        </div>

        {/* Countdown */}
        {date && (
          <div style={{ display: 'flex', justifyContent: 'center', gap: 16, marginBottom: 40 }}>
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

        {/* Bouton Découvrir */}
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
