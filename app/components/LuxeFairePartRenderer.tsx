'use client'

import React, { useState, useEffect } from 'react'
import { buildLuxeComposition, getLuxePalette, type LuxePalette } from '@/lib/luxeComposition'

const GV = 'var(--font-great-vibes)'
const PD = 'var(--font-playfair-display)'
const CG = 'var(--font-cormorant-garamond)'

// ── Spacing tokens serrés (Fix 6) ──
const SP = { xs: 8, s: 16, m: 24, l: 48, xl: 48 }

// ══════════════════════════════════════════════════════════════════════
// ── STICKY HEADER — countdown GRAND centré (Fix 3) ──
// ══════════════════════════════════════════════════════════════════════
function LuxeStickyHeader({ monogramUrl, weddingDate, palette, p1, p2 }: {
  monogramUrl?: string; weddingDate?: string; palette: LuxePalette; p1: string; p2: string
}) {
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

  return (
    <div style={{
      position: 'sticky', top: 0, zIndex: 100, background: `${palette.cream}ee`,
      backdropFilter: 'blur(10px)', WebkitBackdropFilter: 'blur(10px)',
      borderBottom: `1px solid ${palette.accent}15`,
      padding: '0 16px', height: 64, display: 'flex', alignItems: 'center', justifyContent: 'space-between',
    }}>
      {/* GAUCHE : mini monogramme 36px */}
      <div style={{ width: '20%', display: 'flex', alignItems: 'center' }}>
        {monogramUrl ? (
          <button type="button" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={monogramUrl} alt="" style={{ width: 36, height: 36, objectFit: 'contain', mixBlendMode: 'multiply' }} />
          </button>
        ) : (
          <span style={{ fontFamily: GV, fontSize: 18, color: palette.primary }}>{p1[0]}{p2[0]}</span>
        )}
      </div>

      {/* CENTRE : countdown GRAND */}
      <div style={{ width: '60%', textAlign: 'center' }}>
        {weddingDate && (
          <div style={{ fontFamily: PD, fontSize: 16, color: palette.primary, letterSpacing: 3 }}>
            {cd.days} <span style={{ fontSize: 9, opacity: 0.5 }}>JOURS</span>
            {' · '}
            {cd.hours} <span style={{ fontSize: 9, opacity: 0.5 }}>H</span>
            {' · '}
            {cd.minutes} <span style={{ fontSize: 9, opacity: 0.5 }}>M</span>
            {' · '}
            {cd.seconds} <span style={{ fontSize: 9, opacity: 0.5 }}>S</span>
          </div>
        )}
      </div>

      {/* DROITE : espace réservé */}
      <div style={{ width: '20%' }} />
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
// ── MOTIF SÉPARATEUR — spacing serré (Fix 6) ──
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
    <div style={{ padding: `${SP.l}px 0`, textAlign: 'center', background: palette.cream }}>
      <DecorativeLine palette={palette} />
      <div style={{ padding: `${SP.m}px 0` }}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={url} alt="" style={{ height: 140, maxWidth: '55%', objectFit: 'contain', display: 'inline-block', mixBlendMode: 'multiply' }} />
      </div>
      <DecorativeLine palette={palette} />
    </div>
  )
}

// ══════════════════════════════════════════════════════════════════════
// ── NARRATIVE COPY ──
// ══════════════════════════════════════════════════════════════════════
function StorySection({ story, palette }: { story?: string; palette: LuxePalette }) {
  if (!story) return null
  return (
    <div style={{ background: palette.cream, padding: `${SP.l}px 24px`, textAlign: 'center' }}>
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
    <div style={{ background: palette.rsvpBg, padding: `${SP.l}px 24px`, textAlign: 'center' }}>
      <DecorativeLine palette={palette} />
      {inlineMotifUrl && (
        <div style={{ padding: `${SP.s}px 0` }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={inlineMotifUrl} alt="" style={{ height: 80, maxWidth: '35%', objectFit: 'contain', display: 'inline-block', mixBlendMode: 'multiply', opacity: 0.7 }} />
        </div>
      )}
      <div style={{ padding: `${SP.m}px 0` }}>
        <div style={{ fontFamily: PD, fontSize: 14, color: palette.rsvpAccent, letterSpacing: 4, marginBottom: SP.s, textTransform: 'uppercase' }}>
          À vous de nous dire
        </div>
        <div style={{ fontFamily: GV, fontSize: 'clamp(32px, 8vw, 48px)', color: palette.rsvpText, marginBottom: SP.m }}>
          Oui !
        </div>
        <button type="button" onClick={onRsvpOpen} style={{
          fontFamily: PD, fontSize: 13, fontWeight: 700, letterSpacing: 2, textTransform: 'uppercase',
          padding: '14px 36px', borderRadius: 9999, border: 'none',
          background: palette.rsvpText, color: palette.rsvpBg, cursor: 'pointer',
        }}>
          Confirmer ma présence
        </button>
      </div>
      <DecorativeLine palette={palette} />
    </div>
  )
}

// ══════════════════════════════════════════════════════════════════════
// ── FOOTER compact + monogramme 50px (Fix 7) ──
// ══════════════════════════════════════════════════════════════════════
function LuxeFooter({ palette, p1, p2, monogramUrl, weddingDate }: {
  palette: LuxePalette; p1: string; p2: string; monogramUrl?: string; weddingDate?: string
}) {
  return (
    <div style={{ padding: `${SP.l}px 24px ${SP.m}px`, textAlign: 'center', background: palette.cream }}>
      {monogramUrl && (
        <div style={{ marginBottom: SP.s }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={monogramUrl} alt="" style={{ width: 50, height: 50, objectFit: 'contain', mixBlendMode: 'multiply', display: 'inline-block', opacity: 0.4 }} />
        </div>
      )}
      <div style={{ fontFamily: PD, fontStyle: 'italic', fontSize: 14, color: palette.textSecondary, marginBottom: 4 }}>
        Avec amour, {p1} & {p2}
      </div>
      {weddingDate && (
        <div style={{ fontFamily: PD, fontSize: 11, color: palette.accent, letterSpacing: 3, opacity: 0.6, marginBottom: SP.s, textTransform: 'uppercase' }}>
          {new Date(weddingDate).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })}
        </div>
      )}
      <div style={{ fontFamily: CG, fontStyle: 'italic', fontSize: 10, color: `${palette.textSecondary}55`, opacity: 0.5 }}>
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

  // Fix 4 : chaque motif apparaît UNE SEULE FOIS — track les URLs déjà utilisées
  const usedMotifs = new Set<string>()

  const luxeTheme = {
    fond: palette.cream,
    accent: palette.primary,
    texte: palette.rsvpText,
    textSecondaire: palette.textSecondary,
    nom: palette.label,
  }

  // Trouver le motif pour le RSVP (coeurs ou bouquet, pas encore utilisé)
  const rsvpMotif = decoUrls['coeurs'] || decoUrls['bouquet'] || ''

  return (
    <div style={{ background: palette.cream, minHeight: '100vh', maxWidth: 600, margin: '0 auto', boxShadow: '0 0 60px rgba(0,0,0,0.08)' }}>
      {/* Sticky Header — countdown GRAND (Fix 3) */}
      <LuxeStickyHeader monogramUrl={monogramUrl} weddingDate={weddingDate} palette={palette} p1={p1} p2={p2} />

      {composition.sections.map((section, i) => (
        <React.Fragment key={i}>
          {/* ── COVER PLEIN ÉCRAN (Fix 1) ── */}
          {section.kind === 'cover' && (
            <div id="luxe-cover" style={{ background: palette.cream, minHeight: '100vh', display: 'flex', flexDirection: 'column', justifyContent: 'center', textAlign: 'center' }}>
              <div style={{ padding: `${SP.xl}px 24px ${SP.m}px`, flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                {monogramUrl && (
                  <div style={{ marginBottom: SP.m }}>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={monogramUrl} alt={`${p1} & ${p2}`} style={{ width: 150, height: 150, objectFit: 'contain', mixBlendMode: 'multiply', display: 'inline-block' }} />
                  </div>
                )}
                <div style={{ marginBottom: SP.m }}>
                  <span style={{ fontFamily: GV, fontSize: 'clamp(36px, 11vw, 60px)', color: palette.primary }}>{p1}</span>
                  <span style={{ fontFamily: CG, fontStyle: 'italic', fontSize: 22, color: palette.accent, margin: '0 12px' }}>&</span>
                  <span style={{ fontFamily: GV, fontSize: 'clamp(36px, 11vw, 60px)', color: palette.primary }}>{p2}</span>
                </div>
                <button type="button" onClick={() => document.getElementById('luxe-content')?.scrollIntoView({ behavior: 'smooth' })} style={{
                  fontFamily: PD, fontSize: 11, fontWeight: 700, letterSpacing: 5, textTransform: 'uppercase',
                  color: palette.primary, background: 'none', border: 'none', cursor: 'pointer',
                  marginBottom: SP.l, padding: '8px 0',
                }}>
                  Ouvrir l&apos;invitation
                </button>
                {lieu && (
                  <div style={{ fontFamily: PD, fontSize: 15, color: palette.primary, letterSpacing: 6, textTransform: 'uppercase', marginBottom: SP.xs }}>
                    {lieu}
                  </div>
                )}
                {weddingDate && (
                  <div style={{ fontFamily: PD, fontStyle: 'italic', fontSize: 14, color: palette.accent }}>
                    {new Date(weddingDate).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })}
                  </div>
                )}
              </div>
              {coverAquarelleUrl && (
                <div style={{ width: '100%', overflow: 'hidden' }}>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={coverAquarelleUrl} alt="" style={{ width: '100%', height: 'clamp(250px, 45vh, 400px)', objectFit: 'cover', display: 'block' }} />
                </div>
              )}
            </div>
          )}

          {/* ── Contenu après cover ── */}
          {section.kind === 'cover' && (
            <div id="luxe-content">
              {story && (
                <>
                  <StorySection story={story} palette={palette} />
                  <DecorativeLine palette={palette} />
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

          {/* Dress Code + Liste avant RSVP */}
          {section.kind === 'rsvp' && dressCode && (
            <div style={{ background: palette.cream, padding: `${SP.l}px 24px`, textAlign: 'center' }}>
              <div style={{ fontFamily: PD, fontSize: 16, color: palette.primary, letterSpacing: 4, marginBottom: SP.s, textTransform: 'uppercase' }}>Dress Code</div>
              <div style={{ fontFamily: CG, fontStyle: 'italic', fontSize: 14, color: palette.textSecondary, lineHeight: 1.8, maxWidth: 420, margin: '0 auto', whiteSpace: 'pre-wrap' }}>{dressCode}</div>
            </div>
          )}
          {section.kind === 'rsvp' && giftsUrl && (
            <div style={{ background: palette.cream, padding: `${SP.l}px 24px`, textAlign: 'center' }}>
              <div style={{ fontFamily: PD, fontSize: 16, color: palette.primary, letterSpacing: 4, marginBottom: SP.s, textTransform: 'uppercase' }}>Liste de Mariage</div>
              <a href={giftsUrl} target="_blank" rel="noopener noreferrer" style={{
                fontFamily: PD, fontSize: 12, fontWeight: 700, letterSpacing: 2, textTransform: 'uppercase',
                padding: '12px 28px', borderRadius: 9999, border: `1.5px solid ${palette.primary}`,
                background: 'transparent', color: palette.primary, textDecoration: 'none', display: 'inline-block',
              }}>{giftsLabel || 'Voir notre liste'}</a>
            </div>
          )}

          {/* Motif avant RSVP — UN SEUL, unique (Fix 4) */}
          {section.kind === 'rsvp' && rsvpMotif && !usedMotifs.has(rsvpMotif) && (() => {
            usedMotifs.add(rsvpMotif)
            return <MotifSeparator url={rsvpMotif} palette={palette} />
          })()}

          {section.kind === 'rsvp' && (
            <RsvpSection palette={palette} onRsvpOpen={onRsvpOpen} />
          )}

          {/* Motif entre cérémonies — UN SEUL par emplacement, jamais en double (Fix 4) */}
          {section.motifAfterUrl && !usedMotifs.has(section.motifAfterUrl) && (() => {
            usedMotifs.add(section.motifAfterUrl)
            return <MotifSeparator url={section.motifAfterUrl} palette={palette} />
          })()}
          {!section.motifAfterUrl && section.kind === 'ceremony' && i < composition.sections.length - 2 && (
            <MotifSeparator palette={palette} />
          )}
        </React.Fragment>
      ))}

      {/* Footer compact (Fix 7) */}
      <LuxeFooter palette={palette} p1={p1} p2={p2} monogramUrl={monogramUrl} weddingDate={weddingDate} />
    </div>
  )
}
