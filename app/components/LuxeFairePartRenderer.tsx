'use client'

import React from 'react'
import { buildLuxeComposition, getLuxePalette, type LuxePalette } from '@/lib/luxeComposition'

// ── Fonts ──
const GV = 'var(--font-great-vibes)'
const PD = 'var(--font-playfair-display)'
const CG = 'var(--font-cormorant-garamond)'

// ══════════════════════════════════════════════════════════════════════
// ── AQUARELLE BANNER (couche visuelle Luxe) ──
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
// ── MOTIF SÉPARATEUR (couche visuelle Luxe) ──
// ══════════════════════════════════════════════════════════════════════
function MotifSeparator({ url, palette }: { url?: string; palette: LuxePalette }) {
  if (!url) {
    return (
      <div style={{ padding: '40px 0', textAlign: 'center', background: palette.cream }}>
        <DecorativeLine palette={palette} />
      </div>
    )
  }
  return (
    <div style={{ padding: '48px 0', textAlign: 'center', background: palette.cream }}>
      <DecorativeLine palette={palette} />
      <div style={{ padding: '24px 0' }}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={url} alt="" style={{ height: 160, maxWidth: '65%', objectFit: 'contain', display: 'inline-block', mixBlendMode: 'multiply' }} />
      </div>
      <DecorativeLine palette={palette} />
    </div>
  )
}

// ══════════════════════════════════════════════════════════════════════
// ── BLOC RSVP (couche visuelle Luxe) ──
// ══════════════════════════════════════════════════════════════════════
function RsvpSection({ palette, onRsvpOpen }: { palette: LuxePalette; onRsvpOpen?: () => void }) {
  return (
    <div style={{ background: palette.rsvpBg, padding: '48px 24px', textAlign: 'center' }}>
      <DecorativeLine palette={palette} />
      <div style={{ padding: '28px 0' }}>
        <div style={{ fontFamily: PD, fontSize: 14, color: palette.rsvpAccent, letterSpacing: 4, marginBottom: 16, textTransform: 'uppercase' }}>
          À vous de nous dire
        </div>
        <div style={{ fontFamily: GV, fontSize: 'clamp(32px, 8vw, 48px)', color: palette.rsvpText, marginBottom: 28 }}>
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
// ── RENDERER PRINCIPAL ──
// Luxe = Premium + couches visuelles (aquarelle + motif + palette)
// Le texte vient EXACTEMENT du même renderCard que Premium
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

  // Crée un thème "override" qui utilise les couleurs de la palette Luxe
  // pour que les composants Premium utilisent les bonnes couleurs
  const luxeTheme = {
    fond: palette.cream,
    accent: palette.primary,
    texte: palette.rsvpText,
    textSecondaire: palette.textSecondary,
    nom: palette.label,
  }

  return (
    <div style={{ background: palette.cream, minHeight: '100vh', maxWidth: 600, margin: '0 auto', boxShadow: '0 0 60px rgba(0,0,0,0.08)' }}>
      {composition.sections.map((section, i) => (
        <React.Fragment key={i}>
          {section.kind === 'cover' && (
            <div style={{ background: palette.cream }}>
              {/* Cover utilise ElegantPage1 via renderCard — on la skip car
                  les prénoms sont déjà dans chaque carte de cérémonie Premium */}
            </div>
          )}

          {section.kind === 'ceremony' && section.ceremonyIndex !== undefined && (() => {
            const ceremony = data.ceremonies[section.ceremonyIndex]
            return (
              <div>
                {/* Couche visuelle Luxe : aquarelle banner */}
                <AquarelleBanner sceneUrl={section.sceneUrl} />
                {/* Texte : IDENTIQUE au Premium via renderCard */}
                <div style={{ maxWidth: 600, margin: '0 auto', overflow: 'hidden' }}>
                  {renderCard(ceremony, data, luxeTheme, section.ceremonyIndex, false)}
                </div>
              </div>
            )
          })()}

          {section.kind === 'infos' && null /* Les infos pratiques sont déjà dans les cartes Premium */}

          {/* Motif final avant RSVP */}
          {section.kind === 'rsvp' && decoImages.length > 0 && (
            <MotifSeparator url={decoImages[decoImages.length - 1].url} palette={palette} />
          )}

          {section.kind === 'rsvp' && (
            <RsvpSection palette={palette} onRsvpOpen={onRsvpOpen} />
          )}

          {/* Motif séparateur entre les cérémonies */}
          {section.motifAfterUrl !== undefined && (
            <MotifSeparator url={section.motifAfterUrl} palette={palette} />
          )}
          {section.motifAfterUrl === undefined && section.kind === 'ceremony' && i < composition.sections.length - 2 && (
            <MotifSeparator palette={palette} />
          )}
        </React.Fragment>
      ))}

      {/* Crédit */}
      <div style={{ padding: '20px 0', textAlign: 'center', background: palette.cream }}>
        <span style={{ fontFamily: CG, fontStyle: 'italic', fontSize: 11, color: `${palette.textSecondary}88` }}>
          Créé avec ❤️ par Lov&apos;it
        </span>
      </div>
    </div>
  )
}
