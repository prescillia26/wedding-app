'use client'

import React, { useState, useEffect, useRef } from 'react'

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
  customDesignCoverVideoUrl,
  videoOverlayText1,
  videoOverlayText2,
  videoOverlayText3,
  videoOverlayShowBsd,
  videoOverlayTextColor,
  videoOverlayBgColor,
  videoPosterUrl,
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
  customDesignCoverVideoUrl?: string
  videoOverlayText1?: string
  videoOverlayText2?: string
  videoOverlayText3?: string
  videoOverlayShowBsd?: boolean
  videoOverlayTextColor?: string
  videoOverlayBgColor?: string
  videoPosterUrl?: string
}) {
  const [phase, setPhase] = useState(0) // 0=idle, 1=opening, 2=revealing, 3=done
  const [sparkles, setSparkles] = useState<{ id: number; x: number; y: number; delay: number; size: number }[]>([])
  const videoRef = useRef<HTMLVideoElement>(null)
  const [videoEnded, setVideoEnded] = useState(false)

  // Show first frame of video on load — retry until video element is ready
  const [videoReady, setVideoReady] = useState(false)
  useEffect(() => {
    if (!customDesignCoverVideoUrl) return
    const tryShow = () => {
      const vid = videoRef.current
      if (!vid) return
      const show = () => {
        vid.currentTime = 0.001
        setVideoReady(true)
      }
      if (vid.readyState >= 2) {
        show()
      } else {
        vid.addEventListener('loadeddata', show, { once: true })
      }
    }
    // Try immediately + after a short delay (video element may not be mounted yet)
    tryShow()
    const t = setTimeout(tryShow, 100)
    return () => clearTimeout(t)
  }, [customDesignCoverVideoUrl])

  const handleOpen = () => {
    if (phase !== 0) return
    // Générer des particules dorées
    const newSparkles = Array.from({ length: 30 }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 100,
      delay: Math.random() * 0.8,
      size: Math.random() * 6 + 2,
    }))
    setSparkles(newSparkles)
    setPhase(1)
    // Phase 2 : révélation
    setTimeout(() => setPhase(2), 900)
    // Phase 3 : terminé — ouvrir le contenu
    setTimeout(() => {
      setPhase(3)
      onOpen()
      setTimeout(() => {
        const el = document.getElementById('ceremony-0')
        if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' })
      }, 100)
    }, 1600)
  }

  // Pré-animation subtile sur l'image
  const [shimmer, setShimmer] = useState(false)
  useEffect(() => {
    const t = setInterval(() => setShimmer(s => !s), 3000)
    return () => clearInterval(t)
  }, [])

  const p1 = prenom1 || 'Prénom'
  const p2 = prenom2 || 'Prénom'

  // ── Cover vidéo d'ouverture (enveloppe animée Canva/Etsy) ──
  if (customDesignCoverVideoUrl) {
    const handleVideoPlay = () => {
      if (phase !== 0) return
      setPhase(1)
      const vid = videoRef.current
      if (vid) {
        vid.play().catch(() => {})
      }
      // Start music when user taps (user gesture needed for autoplay)
      const audio = document.getElementById('lovit-audio') as HTMLAudioElement | null
      if (audio) audio.play().catch(() => {})
    }

    const handleVideoEnd = () => {
      setPhase(3)
      onOpen()
      window.scrollTo({ top: 0, behavior: 'instant' as ScrollBehavior })
    }

    return (
      <div style={{
        position: 'fixed', inset: 0, zIndex: 300,
        display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
        background: '#F7F3EC',
        opacity: phase === 3 ? 0 : 1,
        transition: 'opacity 0.8s ease, background 0.8s ease',
        pointerEvents: phase === 3 ? 'none' : 'auto',
        overflow: 'hidden',
      }}>
        <style>{`
          @keyframes videoButtonGlow {
            0%, 100% { box-shadow: 0 0 20px rgba(255,255,255,0.1), 0 0 60px rgba(255,255,255,0); }
            50% { box-shadow: 0 0 20px rgba(255,255,255,0.3), 0 0 60px rgba(255,255,255,0.1); }
          }
          @keyframes videoButtonAppear {
            from { opacity: 0; transform: translateY(20px); }
            to { opacity: 1; transform: translateY(0); }
          }
          @keyframes videoFadeOut {
            from { opacity: 1; }
            to { opacity: 0; }
          }
        `}</style>

        {/* Vidéo plein écran */}
        {phase < 3 && (
          <video
            ref={videoRef}
            src={customDesignCoverVideoUrl}
            poster={videoPosterUrl}
            playsInline
            muted
            preload="auto"
            onEnded={handleVideoEnd}
            style={{
              position: 'absolute',
              top: '50%', left: '50%',
              transform: 'translate(-50%, -50%)',
              width: '90%', height: '90%', objectFit: 'contain',
            }}
          />
        )}

        {/* Bouton "Ouvrir" avant que la vidéo ne démarre */}
        {phase === 0 && (
          <div style={{
            position: 'absolute', bottom: '10%', left: 0, right: 0,
            display: 'flex', justifyContent: 'center', zIndex: 5,
            animation: 'videoButtonAppear 1s ease 0.5s both',
          }}>
            <button
              type="button"
              onClick={handleVideoPlay}
              style={{
                fontFamily: PD, fontSize: 12, fontWeight: 700, letterSpacing: 4, textTransform: 'uppercase',
                padding: '16px 40px', borderRadius: 0,
                border: `1px solid ${videoOverlayTextColor ? videoOverlayTextColor + '99' : 'rgba(255,255,255,0.6)'}`,
                background: videoOverlayTextColor ? 'rgba(255,255,255,0.7)' : 'rgba(255,255,255,0.12)',
                color: videoOverlayTextColor || 'white', cursor: 'pointer',
                backdropFilter: 'blur(12px)', WebkitBackdropFilter: 'blur(12px)',
                animation: 'videoButtonGlow 3s ease infinite',
                transition: 'all 0.4s ease',
                touchAction: 'manipulation', WebkitTapHighlightColor: 'transparent',
              }}
              onMouseEnter={e => {
                e.currentTarget.style.background = 'rgba(255,255,255,0.25)'
                e.currentTarget.style.borderColor = 'rgba(255,255,255,0.9)'
                e.currentTarget.style.transform = 'scale(1.05)'
              }}
              onMouseLeave={e => {
                e.currentTarget.style.background = 'rgba(255,255,255,0.12)'
                e.currentTarget.style.borderColor = 'rgba(255,255,255,0.6)'
                e.currentTarget.style.transform = 'scale(1)'
              }}
            >
              {videoOverlayText1 || 'Ouvrir l\u0027enveloppe'} ✦
            </button>
          </div>
        )}

        {/* Possibilité de skipper en tapant pendant la vidéo */}
        {phase === 1 && !videoEnded && (
          <div
            onClick={handleVideoEnd}
            style={{
              position: 'absolute', bottom: '5%', left: 0, right: 0,
              display: 'flex', justifyContent: 'center', zIndex: 5,
            }}
          >
            <span style={{
              fontFamily: CG, fontStyle: 'italic', fontSize: 12, color: 'rgba(255,255,255,0.5)',
              letterSpacing: 1,
            }}>
              Tapez pour passer
            </span>
          </div>
        )}

      </div>
    )
  }

  if (customDesignCoverUrl) {
    return (
      <div style={{
        position: 'fixed', inset: 0, zIndex: 300,
        display: 'flex', flexDirection: 'column',
        background: '#000',
        opacity: phase === 3 ? 0 : 1,
        transition: 'opacity 0.6s ease',
        pointerEvents: phase === 3 ? 'none' : 'auto',
        overflow: 'hidden',
      }}>
        <style>{`
          @keyframes coverShimmer {
            0% { background-position: -200% center; }
            100% { background-position: 200% center; }
          }
          @keyframes sparkleFloat {
            0% { opacity: 0; transform: translateY(0) scale(0); }
            20% { opacity: 1; transform: translateY(-20px) scale(1); }
            100% { opacity: 0; transform: translateY(-120px) scale(0.3); }
          }
          @keyframes envelopeSlideUp {
            0% { transform: translateY(0) scale(1); }
            100% { transform: translateY(-110%) scale(0.95); }
          }
          @keyframes envelopeFadeScale {
            0% { opacity: 1; transform: scale(1); filter: brightness(1); }
            40% { opacity: 1; transform: scale(1.03); filter: brightness(1.15); }
            100% { opacity: 0; transform: scale(1.12); filter: brightness(1.4); }
          }
          @keyframes buttonGlow {
            0%, 100% { box-shadow: 0 0 20px rgba(255,255,255,0.1), 0 0 60px rgba(255,255,255,0); }
            50% { box-shadow: 0 0 20px rgba(255,255,255,0.3), 0 0 60px rgba(255,255,255,0.1); }
          }
          @keyframes buttonAppear {
            from { opacity: 0; transform: translateY(20px); }
            to { opacity: 1; transform: translateY(0); }
          }
          @keyframes imageAppear {
            from { opacity: 0; transform: scale(1.05); }
            to { opacity: 1; transform: scale(1); }
          }
          @keyframes overlayShine {
            0% { transform: translateX(-100%) rotate(25deg); }
            100% { transform: translateX(200%) rotate(25deg); }
          }
        `}</style>

        {/* Image de couverture */}
        <div style={{
          position: 'absolute', inset: 0,
          animation: phase >= 1
            ? 'envelopeFadeScale 1.5s cubic-bezier(0.4, 0, 0.2, 1) forwards'
            : 'imageAppear 1.5s ease both',
        }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={customDesignCoverUrl}
            alt=""
            style={{
              width: '100%', height: '100%', objectFit: 'cover',
            }}
          />

          {/* Shimmer subtil qui passe sur l'image */}
          {phase === 0 && (
            <div style={{
              position: 'absolute', inset: 0, pointerEvents: 'none',
              background: 'linear-gradient(105deg, transparent 40%, rgba(255,255,255,0.08) 45%, rgba(255,255,255,0.15) 50%, rgba(255,255,255,0.08) 55%, transparent 60%)',
              animation: 'overlayShine 4s ease-in-out infinite',
              animationDelay: '1s',
            }} />
          )}
        </div>

        {/* Particules dorées à l'ouverture */}
        {phase >= 1 && sparkles.map(s => (
          <div key={s.id} style={{
            position: 'absolute',
            left: `${s.x}%`,
            top: `${s.y}%`,
            width: s.size,
            height: s.size,
            borderRadius: '50%',
            background: `radial-gradient(circle, ${accent}, rgba(255,215,0,0.6))`,
            animation: `sparkleFloat 1.5s ease-out forwards`,
            animationDelay: `${s.delay}s`,
            boxShadow: `0 0 ${s.size * 2}px ${accent}80`,
            pointerEvents: 'none',
            zIndex: 10,
          }} />
        ))}

        {/* Bouton Découvrir */}
        {phase === 0 && (
          <div style={{
            position: 'absolute', bottom: '8%', left: 0, right: 0,
            display: 'flex', justifyContent: 'center', zIndex: 5,
            animation: 'buttonAppear 1s ease 0.8s both',
          }}>
            <button
              type="button"
              onClick={handleOpen}
              style={{
                fontFamily: PD, fontSize: 12, fontWeight: 700, letterSpacing: 4, textTransform: 'uppercase',
                padding: '16px 40px', borderRadius: 0,
                border: `1px solid rgba(255,255,255,0.6)`,
                background: 'rgba(255,255,255,0.12)',
                color: 'white', cursor: 'pointer',
                backdropFilter: 'blur(12px)', WebkitBackdropFilter: 'blur(12px)',
                animation: 'buttonGlow 3s ease infinite',
                transition: 'all 0.4s ease',
                touchAction: 'manipulation', WebkitTapHighlightColor: 'transparent',
              }}
              onMouseEnter={e => {
                e.currentTarget.style.background = 'rgba(255,255,255,0.25)'
                e.currentTarget.style.borderColor = 'rgba(255,255,255,0.9)'
                e.currentTarget.style.transform = 'scale(1.05)'
              }}
              onMouseLeave={e => {
                e.currentTarget.style.background = 'rgba(255,255,255,0.12)'
                e.currentTarget.style.borderColor = 'rgba(255,255,255,0.6)'
                e.currentTarget.style.transform = 'scale(1)'
              }}
            >
              Découvrir ✦
            </button>
          </div>
        )}
      </div>
    )
  }

  // ── Cover standard (sans design custom) ──
  const opened = phase === 3

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
          onClick={() => { setPhase(3); setTimeout(() => { onOpen(); setTimeout(() => { const el = document.getElementById('ceremony-0'); if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' }) }, 100) }, 700) }}
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
    </div>
  )
}
