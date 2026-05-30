'use client'

import React from 'react'
import { buildLuxeComposition, getLuxePalette, type LuxePalette } from '@/lib/luxeComposition'

// ── Types (reused from faire-part/page.tsx) ──
interface Ceremony {
  type: string
  customName: string
  lieu: string
  adresse: string
  date: string
  heure: string
  suiviDAutre: boolean
  evenementSuivantNom: string
  evenementSuivantAdresse: string
  note: string
  infosTransportActif: boolean
  transport: string
  hebergement: string
  penseesDefuntsActif: boolean
  penseesDefuntsIntro: string
  penseesDefuntsNoms: string[]
  penseesDefuntsFin: string
  illustrationUrl?: string
}

interface WeddingData {
  marie1Prenom: string
  marie1Nom: string
  marie2Prenom: string
  marie2Nom: string
  marie1PrenomHebreu?: string
  marie2PrenomHebreu?: string
  mariageJuif: boolean
  ceremonies: Ceremony[]
  famille1PerePrenom: string; famille1PereNom: string
  famille1MerePrenom: string; famille1MereNom: string
  famille2PerePrenom: string; famille2PereNom: string
  famille2MerePrenom: string; famille2MereNom: string
  luxeColor?: string
  luxeDecoUrls?: Record<string, string>
  rsvpDeadline?: string
}

// ── Fonts ──
const GV = 'var(--font-great-vibes)'
const PD = 'var(--font-playfair-display)'
const CG = 'var(--font-cormorant-garamond)'

// ── Ceremony title mapping ──
const CEREMONY_TITLES: Record<string, string> = {
  'Mairie': 'LA MAIRIE',
  'Cérémonie religieuse / Houppa': 'LA HOUPPA',
  'Shabbat Hatan': 'SHABBAT HATAN',
  'Henné': 'LE HENNÉ',
  'Cocktail': 'LE COCKTAIL',
  'Soirée': 'LA SOIRÉE',
  'Boat Party': 'BOAT PARTY',
}

// ── Phrases d'invitation par type ──
const INVITE_PHRASES: Record<string, string> = {
  'Mairie': 'ont le plaisir de vous convier à la cérémonie civile de',
  'Cérémonie religieuse / Houppa': 'et seront honorés de votre présence à la cérémonie religieuse qui sera célébrée le',
  'Shabbat Hatan': 'vous invitent chaleureusement au Shabbat Hatan de',
  'Henné': 'vous convient à la soirée du henné de',
  'Cocktail': 'vous invitent au cocktail en l\'honneur de',
  'Soirée': 'vous invitent à la soirée en l\'honneur de',
  'Boat Party': 'vous invitent à embarquer pour célébrer',
}

function formatDate(dateStr: string): string {
  if (!dateStr) return ''
  try {
    const d = new Date(dateStr)
    return d.toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })
  } catch { return dateStr }
}

// ══════════════════════════════════════════════════════════════════════
// ── COVER SECTION ──
// ══════════════════════════════════════════════════════════════════════
function CoverSection({ data, sceneUrl, palette }: { data: WeddingData; sceneUrl?: string; palette: LuxePalette }) {
  const p1 = data.marie1Prenom || 'Prénom'
  const p2 = data.marie2Prenom || 'Prénom'
  const firstCeremony = data.ceremonies[0]
  const lieu = firstCeremony?.lieu || ''

  return (
    <div style={{ background: palette.cream }}>
      {/* Aquarelle banner */}
      {sceneUrl && (
        <div style={{ width: '100%', overflow: 'hidden' }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={sceneUrl} alt="" style={{ width: '100%', height: 280, objectFit: 'cover', display: 'block' }} />
        </div>
      )}

      {/* Texte cover */}
      <div style={{ padding: '40px 24px 48px', textAlign: 'center' }}>
        {data.mariageJuif && (
          <div style={{ fontFamily: CG, fontSize: 11, color: palette.accent, marginBottom: 16, direction: 'rtl' }}>בס״ד</div>
        )}
        <div style={{ fontFamily: GV, fontSize: 'clamp(36px, 10vw, 52px)', color: palette.primary, lineHeight: 1.15, marginBottom: 8 }}>
          {p1}
        </div>
        <div style={{ fontFamily: CG, fontStyle: 'italic', fontSize: 18, color: palette.accent, marginBottom: 8 }}>&</div>
        <div style={{ fontFamily: GV, fontSize: 'clamp(36px, 10vw, 52px)', color: palette.primary, lineHeight: 1.15, marginBottom: 24 }}>
          {p2}
        </div>

        {data.marie1PrenomHebreu && data.marie2PrenomHebreu && (
          <div style={{ fontFamily: 'serif', fontSize: 16, color: palette.accent, direction: 'rtl', marginBottom: 20, opacity: 0.8 }}>
            {data.marie1PrenomHebreu} & {data.marie2PrenomHebreu}
          </div>
        )}

        {lieu && (
          <div style={{ fontFamily: PD, fontSize: 12, color: palette.textSecondary, letterSpacing: 2, textTransform: 'uppercase' }}>
            {lieu}
          </div>
        )}
      </div>
    </div>
  )
}

// ══════════════════════════════════════════════════════════════════════
// ── CEREMONY SECTION ──
// ══════════════════════════════════════════════════════════════════════
function CeremonySection({ ceremony, data, sceneUrl, palette }: { ceremony: Ceremony; data: WeddingData; sceneUrl?: string; palette: LuxePalette }) {
  const title = ceremony.customName?.toUpperCase() || CEREMONY_TITLES[ceremony.type] || ceremony.type.toUpperCase()
  const isHouppa = ceremony.type === 'Cérémonie religieuse / Houppa'
  const invitePhrase = INVITE_PHRASES[ceremony.type] || 'vous invitent à célébrer'
  const p1 = data.marie1Prenom || 'Prénom'
  const p2 = data.marie2Prenom || 'Prénom'

  // Parents
  const f1 = [data.famille1PerePrenom, data.famille1PereNom].filter(Boolean).join(' ')
  const m1 = [data.famille1MerePrenom, data.famille1MereNom].filter(Boolean).join(' ')
  const f2 = [data.famille2PerePrenom, data.famille2PereNom].filter(Boolean).join(' ')
  const m2 = [data.famille2MerePrenom, data.famille2MereNom].filter(Boolean).join(' ')
  const hasParents = f1 || m1 || f2 || m2

  return (
    <div style={{ background: palette.cream }}>
      {/* Aquarelle banner pleine largeur */}
      {sceneUrl && (
        <div style={{ width: '100%', overflow: 'hidden' }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={sceneUrl} alt={ceremony.lieu || ''} style={{ width: '100%', height: 240, objectFit: 'cover', display: 'block' }} />
        </div>
      )}

      {/* Bloc texte */}
      <div style={{ padding: '32px 24px 40px', textAlign: 'center', maxWidth: 500, margin: '0 auto', position: 'relative' }}>
        {/* בס״ד en haut à droite (Houppa seulement) */}
        {isHouppa && data.mariageJuif && (
          <div style={{ position: 'absolute', top: 12, right: 8, fontFamily: 'serif', fontSize: 11, color: palette.accent, opacity: 0.7, direction: 'rtl' }}>בס״ד</div>
        )}

        {/* Titre cérémonie */}
        <div style={{ fontFamily: PD, fontSize: 22, color: palette.primary, letterSpacing: 6, marginBottom: 24 }}>
          {title}
        </div>

        {/* קול ששון וקול שמחה (Houppa seulement, une seule ligne) */}
        {isHouppa && data.mariageJuif && (
          <div style={{ fontFamily: 'var(--font-bellefair, serif)', fontSize: 22, color: palette.accent, direction: 'rtl', marginBottom: 20, whiteSpace: 'nowrap' }}>
            קוֹל שָׂשׂוֹן וְקוֹל שִׂמְחָה קוֹל חָתָן וְקוֹל כַּלָּה
          </div>
        )}

        {/* Parents */}
        {hasParents && (
          <div style={{ fontFamily: CG, fontSize: 14, color: palette.textSecondary, marginBottom: 16, lineHeight: 1.8 }}>
            {(f1 || m1) && <div>{[f1, m1].filter(Boolean).join(' & ')}</div>}
            {(f2 || m2) && <div>{[f2, m2].filter(Boolean).join(' & ')}</div>}
          </div>
        )}

        {/* Phrase d'invitation */}
        <div style={{ fontFamily: CG, fontStyle: 'italic', fontSize: 14, color: palette.textSecondary, marginBottom: 20, lineHeight: 1.7 }}>
          {invitePhrase}
        </div>

        {/* Prénoms calligraphiés — toujours les deux ensemble */}
        <div style={{ marginBottom: 24 }}>
          <span style={{ fontFamily: GV, fontSize: 'clamp(28px, 8vw, 42px)', color: palette.primary, lineHeight: 1.2 }}>
            {p1}
          </span>
          <span style={{ fontFamily: CG, fontStyle: 'italic', fontSize: 16, color: palette.accent, margin: '0 8px' }}>&</span>
          <span style={{ fontFamily: GV, fontSize: 'clamp(28px, 8vw, 42px)', color: palette.primary, lineHeight: 1.2 }}>
            {p2}
          </span>
        </div>

        {/* Prénoms hébreux (Houppa) */}
        {isHouppa && data.marie1PrenomHebreu && data.marie2PrenomHebreu && (
          <div style={{ fontFamily: 'var(--font-bellefair, serif)', fontSize: 22, color: palette.primary, direction: 'rtl', marginBottom: 20, opacity: 0.7 }}>
            {data.marie1PrenomHebreu} ・ {data.marie2PrenomHebreu}
          </div>
        )}

        {/* Date · Heure */}
        {ceremony.date && (
          <div style={{ fontFamily: PD, fontSize: 12, color: palette.primary, letterSpacing: 1.5, textTransform: 'uppercase', marginBottom: 8 }}>
            {formatDate(ceremony.date)}
            {ceremony.heure && ` · ${ceremony.heure}`}
          </div>
        )}

        {/* Lieu */}
        {ceremony.lieu && (
          <div style={{ marginBottom: 8 }}>
            <div style={{ fontFamily: PD, fontSize: 14, color: palette.primary, fontWeight: 700 }}>{ceremony.lieu}</div>
            {ceremony.adresse && (
              <div style={{ fontFamily: CG, fontStyle: 'italic', fontSize: 12, color: palette.textSecondary, marginTop: 4 }}>{ceremony.adresse}</div>
            )}
          </div>
        )}

        {/* Note */}
        {ceremony.note && (
          <div style={{ fontFamily: CG, fontStyle: 'italic', fontSize: 12, color: palette.textSecondary, marginTop: 16, opacity: 0.8 }}>
            {ceremony.note}
          </div>
        )}

        {/* Mémorial (Houppa) */}
        {ceremony.penseesDefuntsActif && ceremony.penseesDefuntsNoms.length > 0 && (
          <div style={{ marginTop: 28, padding: '20px 0', borderTop: `1px solid ${palette.accent}22` }}>
            <div style={{ fontFamily: CG, fontStyle: 'italic', fontSize: 12, color: palette.textSecondary, marginBottom: 12 }}>
              {ceremony.penseesDefuntsIntro}
            </div>
            {ceremony.penseesDefuntsNoms.map((nom, i) => (
              <div key={i} style={{ fontFamily: PD, fontSize: 13, color: palette.primary, marginBottom: 6 }}>
                🕯 {nom} <span style={{ fontFamily: 'serif', direction: 'rtl', unicodeBidi: 'embed' }}>ז״ל</span>
              </div>
            ))}
            {ceremony.penseesDefuntsFin && (
              <div style={{ fontFamily: CG, fontStyle: 'italic', fontSize: 12, color: palette.textSecondary, marginTop: 10 }}>
                {ceremony.penseesDefuntsFin}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

// ══════════════════════════════════════════════════════════════════════
// ── MOTIF SÉPARATEUR ──
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
// ── INFOS PRATIQUES ──
// ══════════════════════════════════════════════════════════════════════
function InfosSection({ data, palette }: { data: WeddingData; palette: LuxePalette }) {
  const infos = data.ceremonies.filter(c => c.infosTransportActif && (c.transport || c.hebergement))
  if (infos.length === 0) return null

  return (
    <div style={{ background: palette.cream, padding: '32px 24px', textAlign: 'center' }}>
      <div style={{ fontFamily: PD, fontSize: 18, color: palette.primary, letterSpacing: 4, marginBottom: 24 }}>
        INFOS PRATIQUES
      </div>
      <div style={{ maxWidth: 420, margin: '0 auto' }}>
        {infos.map((c, i) => (
          <div key={i} style={{ marginBottom: 20 }}>
            {c.transport && (
              <div style={{ marginBottom: 12 }}>
                <div style={{ fontFamily: CG, fontStyle: 'italic', fontSize: 13, color: palette.primary, fontWeight: 600, marginBottom: 4 }}>Transport</div>
                <div style={{ fontFamily: CG, fontSize: 13, color: palette.textSecondary, lineHeight: 1.7, whiteSpace: 'pre-wrap' }}>{c.transport}</div>
              </div>
            )}
            {c.hebergement && (
              <div>
                <div style={{ fontFamily: CG, fontStyle: 'italic', fontSize: 13, color: palette.primary, fontWeight: 600, marginBottom: 4 }}>Hébergement</div>
                <div style={{ fontFamily: CG, fontSize: 13, color: palette.textSecondary, lineHeight: 1.7, whiteSpace: 'pre-wrap' }}>{c.hebergement}</div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}

// ══════════════════════════════════════════════════════════════════════
// ── BLOC RSVP ──
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
            transition: 'background 0.2s',
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
// ══════════════════════════════════════════════════════════════════════
export default function LuxeFairePartRenderer({
  data,
  onRsvpOpen,
}: {
  data: WeddingData
  onRsvpOpen?: () => void
}) {
  const paletteId = data.luxeColor || 'mauve'
  const palette = getLuxePalette(paletteId)
  const composition = buildLuxeComposition(data.ceremonies, paletteId, data.luxeDecoUrls)
  const decoImages = Object.entries(data.luxeDecoUrls || {}).filter(([, url]) => url).map(([id, url]) => ({ id, url }))

  return (
    <div style={{ background: palette.cream, minHeight: '100vh', maxWidth: 600, margin: '0 auto', boxShadow: '0 0 60px rgba(0,0,0,0.08)' }}>
      {composition.sections.map((section, i) => (
        <React.Fragment key={i}>
          {section.kind === 'cover' && (
            <CoverSection data={data} sceneUrl={section.sceneUrl} palette={palette} />
          )}

          {section.kind === 'ceremony' && section.ceremonyIndex !== undefined && (
            <CeremonySection
              ceremony={data.ceremonies[section.ceremonyIndex]}
              data={data}
              sceneUrl={section.sceneUrl}
              palette={palette}
            />
          )}

          {section.kind === 'infos' && (
            <InfosSection data={data} palette={palette} />
          )}

          {/* Motif final avant RSVP (un seul, le plus significatif) */}
          {section.kind === 'rsvp' && decoImages.length > 0 && (
            <MotifSeparator url={decoImages[decoImages.length - 1].url} palette={palette} />
          )}

          {section.kind === 'rsvp' && (
            <RsvpSection palette={palette} onRsvpOpen={onRsvpOpen} />
          )}

          {/* Motif séparateur entre les sections */}
          {section.motifAfterUrl !== undefined && (
            <MotifSeparator url={section.motifAfterUrl} palette={palette} />
          )}
          {/* Séparateur simple si pas de motif et pas la dernière section */}
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
