'use client'

import React, { useState, useEffect } from 'react'
import { buildLuxeComposition, getLuxePalette, type LuxePalette } from '@/lib/luxeComposition'

// ── Fonts ──
const GV = 'var(--font-great-vibes)'
const PD = 'var(--font-playfair-display)'
const CG = 'var(--font-cormorant-garamond)'

// ── Spacing tokens (#9) ──
const SP = { xs: 8, s: 16, m: 24, l: 40, xl: 64, xxl: 96 }

// ══════════════════════════════════════════════════════════════════════
// ── STICKY HEADER (#2 + #12) ──
// ══════════════════════════════════════════════════════════════════════
function LuxeStickyHeader({ monogramUrl, weddingDate, palette, p1, p2 }: {
  monogramUrl?: string; weddingDate?: string; palette: LuxePalette; p1: string; p2: string
}) {
  const [countdown, setCountdown] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 })

  useEffect(() => {
    if (!weddingDate) return
    const target = new Date(weddingDate).getTime()
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
  }, [weddingDate])

  return (
    <div style={{
      position: 'sticky', top: 0, zIndex: 50, background: `${palette.cream}ee`,
      backdropFilter: 'blur(8px)', WebkitBackdropFilter: 'blur(8px)',
      borderBottom: `1px solid ${palette.accent}20`,
      padding: '8px 16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
    }}>
      {/* Mini monogramme ou initiales */}
      <div style={{ width: 32 }}>
        {monogramUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={monogramUrl} alt="" style={{ width: 28, height: 28, objectFit: 'contain', mixBlendMode: 'multiply' }} />
        ) : (
          <span style={{ fontFamily: GV, fontSize: 16, color: palette.primary }}>{p1[0]}{p2[0]}</span>
        )}
      </div>

      {/* Countdown */}
      {weddingDate && (
        <div style={{ fontFamily: PD, fontSize: 11, color: palette.primary, letterSpacing: 2, textTransform: 'uppercase' }}>
          {countdown.days}<span style={{ fontSize: 8, opacity: 0.6, margin: '0 2px' }}>J</span>{' '}
          {countdown.hours}<span style={{ fontSize: 8, opacity: 0.6, margin: '0 2px' }}>H</span>{' '}
          {countdown.minutes}<span style={{ fontSize: 8, opacity: 0.6, margin: '0 2px' }}>M</span>{' '}
          {countdown.seconds}<span style={{ fontSize: 8, opacity: 0.6, margin: '0 2px' }}>S</span>
        </div>
      )}

      <div style={{ width: 32 }} />
    </div>
  )
}

// ══════════════════════════════════════════════════════════════════════
// ── COUNTDOWN BLOCK (#12) ──
// ══════════════════════════════════════════════════════════════════════
function CountdownBlock({ weddingDate, palette, p1, p2 }: { weddingDate?: string; palette: LuxePalette; p1: string; p2: string }) {
  const [cd, setCd] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 })

  useEffect(() => {
    if (!weddingDate) return
    const target = new Date(weddingDate).getTime()
    const tick = () => {
      const diff = Math.max(0, target - Date.now())
      setCd({
        days: Math.floor(diff / 86400000),
        hours: Math.floor((diff % 86400000) / 3600000),
        minutes: Math.floor((diff % 3600000) / 60000),
        seconds: Math.floor((diff % 60000) / 1000),
      })
    }
    tick()
    const id = setInterval(tick, 1000)
    return () => clearInterval(id)
  }, [weddingDate])

  if (!weddingDate) return null

  const items = [
    { value: cd.days, label: 'JOURS' },
    { value: cd.hours, label: 'H' },
    { value: cd.minutes, label: 'M' },
    { value: cd.seconds, label: 'S' },
  ]

  return (
    <div style={{ background: palette.cream, padding: `${SP.l}px 24px`, textAlign: 'center' }}>
      <div style={{ display: 'flex', justifyContent: 'center', gap: 12 }}>
        {items.map(({ value, label }) => (
          <div key={label} style={{ minWidth: 52 }}>
            <div style={{ fontFamily: PD, fontSize: 28, color: palette.primary, fontWeight: 700, lineHeight: 1 }}>{value}</div>
            <div style={{ fontFamily: PD, fontSize: 8, color: palette.accent, letterSpacing: 2, marginTop: 4 }}>{label}</div>
          </div>
        ))}
      </div>
      <div style={{ fontFamily: CG, fontStyle: 'italic', fontSize: 12, color: palette.textSecondary, marginTop: SP.s }}>
        avant que {p1} & {p2} se disent oui
      </div>
    </div>
  )
}

// ══════════════════════════════════════════════════════════════════════
// ── AQUARELLE BANNER ──
// ══════════════════════════════════════════════════════════════════════
function AquarelleBanner({ sceneUrl }: { sceneUrl?: string }) {
  if (!sceneUrl) return null
  return (
    <div style={{ width: '100%', overflow: 'hidden' }}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={sceneUrl} alt="" style={{ width: '100%', height: 240, objectFit: 'cover', display: 'block' }} />
    </div>
  )
}

// ══════════════════════════════════════════════════════════════════════
// ── LIGNES DÉCORATIVES ──
// ══════════════════════════════════════════════════════════════════════
function DecorativeLine({ palette }: { palette: LuxePalette }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10 }}>
      <div style={{ width: 60, height: 0.5, background: palette.accent, opacity: 0.4 }} />
      <span style={{ color: palette.accent, fontSize: 10, opacity: 0.4 }}>✦</span>
      <div style={{ width: 60, height: 0.5, background: palette.accent, opacity: 0.4 }} />
    </div>
  )
}

// ══════════════════════════════════════════════════════════════════════
// ── MOTIF SÉPARATEUR ──
// ══════════════════════════════════════════════════════════════════════
function MotifSeparator({ url, palette }: { url?: string; palette: LuxePalette }) {
  if (!url) {
    return (
      <div style={{ padding: `${SP.l}px 0`, textAlign: 'center', background: palette.cream }}>
        <DecorativeLine palette={palette} />
      </div>
    )
  }
  return (
    <div style={{ padding: `${SP.xl}px 0`, textAlign: 'center', background: palette.cream }}>
      <DecorativeLine palette={palette} />
      <div style={{ padding: `${SP.m}px 0` }}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={url} alt="" style={{ height: 160, maxWidth: '65%', objectFit: 'contain', display: 'inline-block', mixBlendMode: 'multiply' }} />
      </div>
      <DecorativeLine palette={palette} />
    </div>
  )
}

// ══════════════════════════════════════════════════════════════════════
// ── NARRATIVE COPY (#5) ──
// ══════════════════════════════════════════════════════════════════════
function StorySection({ story, palette }: { story?: string; palette: LuxePalette }) {
  if (!story) return null
  return (
    <div style={{ background: palette.cream, padding: `${SP.xl}px 24px`, textAlign: 'center' }}>
      <div style={{ maxWidth: 480, margin: '0 auto' }}>
        <div style={{ fontFamily: CG, fontStyle: 'italic', fontSize: 15, color: palette.textSecondary, lineHeight: 1.8, whiteSpace: 'pre-wrap' }}>
          {story}
        </div>
      </div>
    </div>
  )
}

// ══════════════════════════════════════════════════════════════════════
// ── BLOC RSVP ──
// ══════════════════════════════════════════════════════════════════════
function RsvpSection({ palette, onRsvpOpen, inlineMotifUrl }: { palette: LuxePalette; onRsvpOpen?: () => void; inlineMotifUrl?: string }) {
  return (
    <div style={{ background: palette.rsvpBg, padding: `${SP.xl}px 24px`, textAlign: 'center' }}>
      <DecorativeLine palette={palette} />
      {/* Illustration inline (enveloppe / coeur) */}
      {inlineMotifUrl && (
        <div style={{ padding: `${SP.s}px 0` }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={inlineMotifUrl} alt="" style={{ height: 100, maxWidth: '40%', objectFit: 'contain', display: 'inline-block', mixBlendMode: 'multiply', opacity: 0.8 }} />
        </div>
      )}
      <div style={{ padding: `${SP.m}px 0` }}>
        <div style={{ fontFamily: PD, fontSize: 14, color: palette.rsvpAccent, letterSpacing: 4, marginBottom: SP.s, textTransform: 'uppercase' }}>
          À vous de nous dire
        </div>
        <div style={{ fontFamily: GV, fontSize: 'clamp(32px, 8vw, 48px)', color: palette.rsvpText, marginBottom: SP.m }}>
          Oui !
        </div>
        <button
          type="button"
          onClick={onRsvpOpen}
          style={{
            fontFamily: PD, fontSize: 13, fontWeight: 700, letterSpacing: 2, textTransform: 'uppercase',
            padding: '14px 36px', borderRadius: 9999, border: 'none',
            background: palette.rsvpText, color: palette.rsvpBg, cursor: 'pointer',
          }}
        >
          Confirmer ma présence
        </button>
      </div>
      <DecorativeLine palette={palette} />
    </div>
  )
}

// ══════════════════════════════════════════════════════════════════════
// ── FOOTER PRO (#11) ──
// ══════════════════════════════════════════════════════════════════════
function LuxeFooter({ palette, p1, p2, monogramUrl, weddingDate }: {
  palette: LuxePalette; p1: string; p2: string; monogramUrl?: string; weddingDate?: string
}) {
  return (
    <div style={{ padding: `${SP.l}px 24px ${SP.m}px`, textAlign: 'center', background: palette.cream }}>
      {monogramUrl && (
        <div style={{ marginBottom: SP.s }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={monogramUrl} alt="" style={{ width: 36, height: 36, objectFit: 'contain', mixBlendMode: 'multiply', display: 'inline-block', opacity: 0.5 }} />
        </div>
      )}
      <div style={{ fontFamily: CG, fontStyle: 'italic', fontSize: 13, color: palette.textSecondary, marginBottom: 4 }}>
        Avec amour, {p1} & {p2}
      </div>
      {weddingDate && (
        <div style={{ fontFamily: PD, fontSize: 10, color: palette.accent, letterSpacing: 2, opacity: 0.6, marginBottom: SP.s }}>
          {new Date(weddingDate).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })}
        </div>
      )}
      <div style={{ fontFamily: CG, fontStyle: 'italic', fontSize: 10, color: `${palette.textSecondary}66` }}>
        Faire-part créé avec Lov&apos;it · getlovit.fr
      </div>
    </div>
  )
}

// ══════════════════════════════════════════════════════════════════════
// ── RENDERER PRINCIPAL ──
// ══════════════════════════════════════════════════════════════════════
export default function LuxeFairePartRenderer({
  data,
  renderCard,
  onRsvpOpen,
}: {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  data: any
  renderCard: (ceremony: any, data: any, theme: any, photoIdx: number, isShared: boolean) => React.ReactNode
  onRsvpOpen?: () => void
}) {
  const paletteId = data.luxeColor || 'mauve'
  const palette = getLuxePalette(paletteId)
  const composition = buildLuxeComposition(data.ceremonies, paletteId, data.luxeDecoUrls)
  const decoUrls = (data.luxeDecoUrls || {}) as Record<string, string>
  const decoImages = Object.entries(decoUrls).filter(([, url]) => url).map(([id, url]) => ({ id, url }))
  const monogramUrl = data.luxeMonogramUrl as string | undefined
  const p1 = data.marie1Prenom || 'Prénom'
  const p2 = data.marie2Prenom || 'Prénom'
  const firstCeremony = data.ceremonies?.[0]
  const lieu = firstCeremony?.lieu || ''
  const weddingDate = firstCeremony?.date || ''
  const story = data.luxeStory as string | undefined
  const coverAquarelleUrl = firstCeremony?.illustrationUrl || ''
  const dressCode = data.luxeDressCode as string | undefined
  const giftsUrl = data.luxeGiftsUrl as string | undefined
  const giftsLabel = data.luxeGiftsLabel as string | undefined

  const luxeTheme = {
    fond: palette.cream,
    accent: palette.primary,
    texte: palette.rsvpText,
    textSecondaire: palette.textSecondary,
    nom: palette.label,
  }

  return (
    <div style={{ background: palette.cream, minHeight: '100vh', maxWidth: 600, margin: '0 auto', boxShadow: '0 0 60px rgba(0,0,0,0.08)' }}>
      {/* Sticky Header */}
      <LuxeStickyHeader monogramUrl={monogramUrl} weddingDate={weddingDate} palette={palette} p1={p1} p2={p2} />

      {composition.sections.map((section, i) => (
        <React.Fragment key={i}>
          {/* ── COVER PLEIN ÉCRAN ── */}
          {section.kind === 'cover' && (
            <div id="luxe-cover" style={{ background: palette.cream, minHeight: '100vh', display: 'flex', flexDirection: 'column', justifyContent: 'center', textAlign: 'center', position: 'relative' }}>
              <div style={{ padding: `${SP.xl}px 24px ${SP.m}px`, flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                {/* Monogramme */}
                {monogramUrl && (
                  <div style={{ marginBottom: SP.m }}>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={monogramUrl} alt={`${p1} & ${p2}`} style={{ width: 120, height: 120, objectFit: 'contain', mixBlendMode: 'multiply', display: 'inline-block' }} />
                  </div>
                )}

                {/* Prénoms calligraphiés */}
                <div style={{ marginBottom: SP.m }}>
                  <span style={{ fontFamily: GV, fontSize: 'clamp(34px, 10vw, 52px)', color: palette.primary }}>{p1}</span>
                  <span style={{ fontFamily: CG, fontStyle: 'italic', fontSize: 20, color: palette.accent, margin: '0 10px' }}>&</span>
                  <span style={{ fontFamily: GV, fontSize: 'clamp(34px, 10vw, 52px)', color: palette.primary }}>{p2}</span>
                </div>

                {/* "OUVRIR L'INVITATION" */}
                <button
                  type="button"
                  onClick={() => document.getElementById('luxe-content')?.scrollIntoView({ behavior: 'smooth' })}
                  style={{
                    fontFamily: PD, fontSize: 11, fontWeight: 700, letterSpacing: 4, textTransform: 'uppercase',
                    color: palette.primary, background: 'none', border: 'none', cursor: 'pointer',
                    marginBottom: SP.l, padding: '8px 0',
                  }}
                >
                  Ouvrir l&apos;invitation
                </button>

                {/* Lieu en small caps espacées */}
                {lieu && (
                  <div style={{ fontFamily: PD, fontSize: 14, color: palette.primary, letterSpacing: 6, textTransform: 'uppercase', marginBottom: SP.xs }}>
                    {lieu}
                  </div>
                )}

                {/* Dates */}
                {weddingDate && (
                  <div style={{ fontFamily: PD, fontSize: 14, color: palette.accent, letterSpacing: 2 }}>
                    {new Date(weddingDate).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' }).toUpperCase()}
                  </div>
                )}
              </div>

              {/* Aquarelle du portail / entrée en bas de la cover */}
              {coverAquarelleUrl && (
                <div style={{ width: '100%', overflow: 'hidden' }}>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={coverAquarelleUrl} alt="" style={{ width: '100%', height: 'clamp(250px, 45vh, 400px)', objectFit: 'cover', display: 'block' }} />
                </div>
              )}
            </div>
          )}

          {/* ── COUNTDOWN + STORY après la cover ── */}
          {section.kind === 'cover' && (
            <div id="luxe-content">
              <CountdownBlock weddingDate={weddingDate} palette={palette} p1={p1} p2={p2} />
              {story && (
                <>
                  <DecorativeLine palette={palette} />
                  <StorySection story={story} palette={palette} />
                </>
              )}
            </div>
          )}

          {/* ── CÉRÉMONIE ── */}
          {section.kind === 'ceremony' && section.ceremonyIndex !== undefined && (() => {
            const ceremony = data.ceremonies[section.ceremonyIndex]
            return (
              <div>
                <AquarelleBanner sceneUrl={section.sceneUrl} />
                <div style={{ maxWidth: 600, margin: '0 auto', overflow: 'hidden' }}>
                  {renderCard(ceremony, data, luxeTheme, section.ceremonyIndex, false)}
                </div>
              </div>
            )
          })()}

          {section.kind === 'infos' && null}

          {/* ── DRESS CODE (avant RSVP) ── */}
          {section.kind === 'rsvp' && dressCode && (
            <div style={{ background: palette.cream, padding: `${SP.l}px 24px`, textAlign: 'center' }}>
              <div style={{ fontFamily: PD, fontSize: 18, color: palette.primary, letterSpacing: 4, marginBottom: SP.s, textTransform: 'uppercase' }}>
                Dress Code
              </div>
              <div style={{ fontFamily: CG, fontStyle: 'italic', fontSize: 14, color: palette.textSecondary, lineHeight: 1.8, maxWidth: 420, margin: '0 auto', whiteSpace: 'pre-wrap' }}>
                {dressCode}
              </div>
            </div>
          )}

          {/* ── LISTE DE MARIAGE (avant RSVP) ── */}
          {section.kind === 'rsvp' && giftsUrl && (
            <div style={{ background: palette.cream, padding: `${SP.l}px 24px`, textAlign: 'center' }}>
              <div style={{ fontFamily: PD, fontSize: 18, color: palette.primary, letterSpacing: 4, marginBottom: SP.s, textTransform: 'uppercase' }}>
                Liste de Mariage
              </div>
              <a
                href={giftsUrl}
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  fontFamily: PD, fontSize: 12, fontWeight: 700, letterSpacing: 2, textTransform: 'uppercase',
                  padding: '12px 28px', borderRadius: 9999, border: `1.5px solid ${palette.primary}`,
                  background: 'transparent', color: palette.primary, textDecoration: 'none', display: 'inline-block',
                }}
              >
                {giftsLabel || 'Voir notre liste'}
              </a>
            </div>
          )}

          {/* Motif avant RSVP */}
          {section.kind === 'rsvp' && decoImages.length > 0 && (
            <MotifSeparator url={decoImages[decoImages.length - 1].url} palette={palette} />
          )}

          {section.kind === 'rsvp' && (
            <RsvpSection palette={palette} onRsvpOpen={onRsvpOpen} inlineMotifUrl={decoUrls['coeurs'] || decoUrls['bouquet']} />
          )}

          {/* Motif entre cérémonies */}
          {section.motifAfterUrl !== undefined && (
            <MotifSeparator url={section.motifAfterUrl} palette={palette} />
          )}
          {section.motifAfterUrl === undefined && section.kind === 'ceremony' && i < composition.sections.length - 2 && (
            <MotifSeparator palette={palette} />
          )}
        </React.Fragment>
      ))}

      {/* Footer pro */}
      <LuxeFooter palette={palette} p1={p1} p2={p2} monogramUrl={monogramUrl} weddingDate={weddingDate} />
    </div>
  )
}
