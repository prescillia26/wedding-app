// ── Pack Luxe — Composition multi-sections type Esther & Mendel ──

export interface LuxePalette {
  id: string
  label: string
  primary: string    // couleur principale (titres, prénoms)
  cream: string      // fond crème
  accent: string     // couleur accent
  rsvp: string       // couleur du bloc RSVP
  textSecondary: string // texte secondaire
}

export const LUXE_PALETTES: Record<string, LuxePalette> = {
  mauve:      { id: 'mauve',      label: 'Mauve',        primary: '#4A2576', cream: '#F8F5FD', accent: '#9B6FD0', rsvp: '#5A2D8C', textSecondary: '#6a5080' },
  rose_clair: { id: 'rose_clair', label: 'Rosé poudré',  primary: '#993556', cream: '#FDF7F8', accent: '#D4537E', rsvp: '#993556', textSecondary: '#8a5060' },
  rose:       { id: 'rose',       label: 'Rose',         primary: '#993556', cream: '#FDF7F8', accent: '#D4537E', rsvp: '#993556', textSecondary: '#8a5060' },
  sauge:      { id: 'sauge',      label: 'Vert sauge',   primary: '#3B6D11', cream: '#F7FAF1', accent: '#97C459', rsvp: '#3B6D11', textSecondary: '#5a7050' },
  bleu_ciel:  { id: 'bleu_ciel',  label: 'Bleu ciel',    primary: '#2970A0', cream: '#F5F9FD', accent: '#85C7EB', rsvp: '#185FA5', textSecondary: '#4a6a8a' },
  bleu_nuit:  { id: 'bleu_nuit',  label: 'Bleu nuit',    primary: '#185FA5', cream: '#F5F9FD', accent: '#85B7EB', rsvp: '#042C53', textSecondary: '#4a6a8a' },
  lavande:    { id: 'lavande',    label: 'Lavande',      primary: '#4A2576', cream: '#F8F5FD', accent: '#9B6FD0', rsvp: '#5A2D8C', textSecondary: '#6a5080' },
  dore:       { id: 'dore',       label: 'Doré',         primary: '#8A6914', cream: '#FDF8F0', accent: '#C9A84C', rsvp: '#6A5010', textSecondary: '#6a5040' },
  bordeaux:   { id: 'bordeaux',   label: 'Bordeaux',     primary: '#6B1020', cream: '#FDF7F8', accent: '#A83050', rsvp: '#4A0A18', textSecondary: '#7a3a3a' },
  menthe:     { id: 'menthe',     label: 'Menthe',       primary: '#1A7A4A', cream: '#F0FAF5', accent: '#4AC88A', rsvp: '#0A5A30', textSecondary: '#4a7a5a' },
  peche:      { id: 'peche',      label: 'Pêche',        primary: '#A06030', cream: '#FDF8F2', accent: '#E8A870', rsvp: '#8A5020', textSecondary: '#8a6050' },
  terracotta: { id: 'terracotta', label: 'Terracotta',   primary: '#8A4A2A', cream: '#FDF6F2', accent: '#C4704A', rsvp: '#6A3A1A', textSecondary: '#8a5a40' },
}

// ── Motifs par défaut entre cérémonies ──
export const DEFAULT_MOTIFS: Record<string, string> = {
  'Mairie': 'colombes',
  'Cérémonie religieuse / Houppa': 'bagues',
  'Shabbat Hatan': 'calligraphie',
  'Henné': 'champagne',
  'Cocktail': 'champagne',
  'Soirée': 'bouquet',
  'Boat Party': 'arche',
}

// ── Types de section ──
export type LuxeSectionKind = 'cover' | 'ceremony' | 'infos' | 'rsvp'

export interface LuxeSection {
  kind: LuxeSectionKind
  ceremonyIndex?: number      // index dans wedding.ceremonies[]
  sceneUrl?: string           // URL de l'aquarelle choisie
  motifAfterUrl?: string      // URL du motif détouré après cette section
  motifAfterType?: string     // type de motif (colombes, bagues, etc.)
}

export interface LuxeComposition {
  paletteId: string
  sections: LuxeSection[]
}

// ── Construit la composition à partir des données du faire-part ──
export interface CeremonyData {
  type: string
  customName?: string
  lieu: string
  adresse: string
  date: string
  heure: string
  illustrationUrl?: string
  // ... autres champs existants
}

export function buildLuxeComposition(
  ceremonies: CeremonyData[],
  paletteId: string,
  luxeDecoUrls?: Record<string, string>,
): LuxeComposition {
  const sections: LuxeSection[] = []
  const decoUrls = luxeDecoUrls || {}
  const allDecoIds = Object.keys(decoUrls).filter(k => decoUrls[k])

  // 1. COVER — texte seul (pas d'aquarelle pour éviter le doublon avec la 1ère cérémonie)
  sections.push({
    kind: 'cover',
  })

  // 2. UNE SECTION PAR CÉRÉMONIE
  ceremonies.forEach((ceremony, i) => {
    // Motif entre cérémonies : utiliser le motif par défaut pour ce type de cérémonie
    const defaultMotif = DEFAULT_MOTIFS[ceremony.type] || 'colombes'
    const isLast = i === ceremonies.length - 1
    // Chercher un motif généré qui correspond, sinon prendre un motif disponible
    let motifUrl: string | undefined
    if (!isLast) {
      motifUrl = decoUrls[defaultMotif]
      // Si pas de motif par défaut, prendre le premier deco disponible non encore utilisé
      if (!motifUrl && allDecoIds.length > 0) {
        const fallbackId = allDecoIds[i % allDecoIds.length]
        motifUrl = decoUrls[fallbackId]
      }
    }

    sections.push({
      kind: 'ceremony',
      ceremonyIndex: i,
      sceneUrl: ceremony.illustrationUrl,
      motifAfterUrl: motifUrl,
      motifAfterType: !isLast ? defaultMotif : undefined,
    })
  })

  // 2b. Si une seule cérémonie et des décos existent, ajouter les motifs après la cérémonie
  // (avant infos pratiques) pour qu'ils soient visibles
  if (ceremonies.length === 1 && allDecoIds.length > 0) {
    // Le premier motif va après la cérémonie (avant infos)
    const firstDecoUrl = decoUrls[allDecoIds[0]]
    if (firstDecoUrl && sections.length > 1) {
      sections[1].motifAfterUrl = firstDecoUrl
    }
  }

  // 3. INFOS PRATIQUES
  sections.push({ kind: 'infos' })

  // 4. RSVP
  sections.push({ kind: 'rsvp' })

  return { paletteId, sections }
}

export function getLuxePalette(paletteId: string): LuxePalette {
  return LUXE_PALETTES[paletteId] || LUXE_PALETTES.mauve
}
