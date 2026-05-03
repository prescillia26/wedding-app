'use client'

import React, { useState, useEffect, useRef, useCallback } from 'react'


type Theme = 'rose-fleuri' | 'ivoire-or' | 'bleu-floral' | 'champetre' | 'blanc-gris' | 'noir-blanc' | 'chocolat' | 'bordeaux' | 'bordeaux-nuit' | 'fuchsia' | 'marine-or' | 'menthe'
type PresentationStyle = 'page-unique' | 'cartes-scrollables' | 'cartes-separees'
// ⚙️ Nombre max de photos uploadables par couple (carrousel de la section d'accueil)
const MAX_PHOTOS = 3
// ── Styles personnalisables par zone ──────────────────────────────────────────

const TEXT_ZONES = ['titres', 'prenoms', 'narratif', 'dateHeure', 'lieu'] as const
type TextZone = typeof TEXT_ZONES[number]

const ZONE_LABELS: Record<TextZone, string> = {
  titres: '🏷️ Titres de cérémonie',
  prenoms: '💑 Prénoms des mariés',
  narratif: '📝 Textes narratifs',
  dateHeure: '📅 Date et heure',
  lieu: '📍 Lieu et adresse',
}

const FONT_OPTIONS = [
  { value: 'var(--font-great-vibes)',        label: 'Great Vibes (calligraphie)' },
  { value: 'var(--font-cormorant-garamond)', label: 'Cormorant (élégant)' },
  { value: 'var(--font-playfair-display)',   label: 'Playfair (serif)' },
  { value: 'Georgia, serif',                 label: 'Georgia (classique)' },
  { value: 'Helvetica, Arial, sans-serif',   label: 'Helvetica (moderne)' },
  { value: '"Times New Roman", serif',       label: 'Times (traditionnel)' },
  { value: '"Courier New", monospace',       label: 'Courier (machine à écrire)' },
  { value: 'cursive',                        label: 'Cursive (script)' },
]

const COLOR_OPTIONS = [
  { value: '',        label: 'Thème',    swatch: '#C9A84C' },
  { value: '#C9A84C', label: 'Doré',     swatch: '#C9A84C' },
  { value: '#1a1a1a', label: 'Noir',     swatch: '#1a1a1a' },
  { value: '#9e9e9e', label: 'Argent',   swatch: '#9e9e9e' },
  { value: '#d4829a', label: 'Rose',     swatch: '#d4829a' },
  { value: '#8b0000', label: 'Bordeaux', swatch: '#8b0000' },
  { value: '#2c4a7c', label: 'Marine',   swatch: '#2c4a7c' },
  { value: '#7a9e6e', label: 'Vert',     swatch: '#7a9e6e' },
  { value: '#d4a574', label: 'Cuivre',   swatch: '#d4a574' },
  { value: '#4a3728', label: 'Chocolat', swatch: '#4a3728' },
  { value: '#ffffff', label: 'Blanc',    swatch: '#ffffff' },
  { value: '#2a9a6a', label: 'Menthe',   swatch: '#2a9a6a' },
]

interface ZoneStyle {
  fontFamily?: string  // '' = police par défaut du thème
  color?: string       // '' = couleur du thème
  sizeScale?: number   // 0.8 | 1.0 | 1.2 (petit / normal / grand)
  bold?: boolean
  italic?: boolean
}

type ZoneStyles = Partial<Record<TextZone, ZoneStyle>>
const THEMES: Record<Theme, ThemeObj> = {
  'rose-fleuri':   { fond: '#faf6f4', accent: '#c4829a', texte: '#2d2d2d', textSecondaire: '#8a6070', nom: 'Rose Fleuri' },
  'ivoire-or':     { fond: '#fdf8f0', accent: '#C9A84C', texte: '#2d2014', textSecondaire: '#6a5040', nom: 'Ivoire & Or' },
  'bleu-floral':   { fond: '#f0f4f8', accent: '#2c4a7c', texte: '#1a2a3a', textSecondaire: '#4a6a8a', nom: 'Floral Bleu' },
  'champetre':     { fond: '#f4f7f0', accent: '#7a9e6e', texte: '#2a3520', textSecondaire: '#5a7050', nom: 'Champêtre' },
  'blanc-gris':    { fond: '#f8f8f8', accent: '#888888', texte: '#1a1a1a', textSecondaire: '#555555', nom: 'Blanc & Gris' },
  'noir-blanc':    { fond: '#1a1a1a', accent: '#e0e0e0', texte: '#f0f0f0', textSecondaire: '#aaaaaa', nom: 'Noir & Blanc', dark: true },
  'chocolat':      { fond: '#2c1a0e', accent: '#d4a574', texte: '#f5e6d0', textSecondaire: '#c0a080', nom: 'Chocolat', dark: true },
  'bordeaux':      { fond: '#fdf8f8', accent: '#8b1a2a', texte: '#2a0808', textSecondaire: '#7a3a3a', nom: 'Bordeaux' },
  'bordeaux-nuit': { fond: '#1a0810', accent: '#d4829a', texte: '#f5e0e5', textSecondaire: '#c09090', nom: 'Bordeaux Nuit', dark: true },
  'fuchsia':       { fond: '#fff0f8', accent: '#d4006a', texte: '#2a0020', textSecondaire: '#8a0050', nom: 'Fuchsia' },
  'marine-or':     { fond: '#0a1628', accent: '#C9A84C', texte: '#e8e0d0', textSecondaire: '#b0a880', nom: 'Marine & Or', dark: true },
  'menthe':        { fond: '#f0faf5', accent: '#2a9a6a', texte: '#0a2a1a', textSecondaire: '#4a7a5a', nom: 'Menthe' },
}

const ORNEMENTS_LIBRARY: { id: string; url: string; nom: string }[] = [
  { id: 'orn1', url: 'https://res.cloudinary.com/dau96mui2/image/upload/v1776765484/1_ruabdh.png', nom: 'Floral 1' },
  { id: 'orn2', url: 'https://res.cloudinary.com/dau96mui2/image/upload/v1776765486/2_xh3erh.png', nom: 'Floral 2' },
  { id: 'orn3', url: 'https://res.cloudinary.com/dau96mui2/image/upload/v1776765487/3_zdnq1l.png', nom: 'Floral 3' },
  { id: 'orn4', url: 'https://res.cloudinary.com/dau96mui2/image/upload/v1776765490/4_szuz80.png', nom: 'Floral 4' },
  { id: 'orn5', url: 'https://res.cloudinary.com/dau96mui2/image/upload/v1776765492/5_dgvzjn.png', nom: 'Floral 5' },
  { id: 'orn6', url: 'https://res.cloudinary.com/dau96mui2/image/upload/v1776765509/6_bbgeun.png', nom: 'Floral 6' },
  { id: 'orn7', url: 'https://res.cloudinary.com/dau96mui2/image/upload/v1776765511/7_h5mjjm.png', nom: 'Floral 7' },
  { id: 'orn8', url: 'https://res.cloudinary.com/dau96mui2/image/upload/v1776765513/8_grn4zh.png', nom: 'Floral 8' },
  { id: 'orn9', url: 'https://res.cloudinary.com/dau96mui2/image/upload/v1776783658/Design_sans_titre_tzwipm.png', nom: 'Floral 9' },
  { id: 'none', url: '', nom: 'Sans ornement' },
]

// ── Illustrations aquarelles Canva ────────────────────────────────────────────

const ILLUSTRATIONS_COUPLES = [
  { id: 'couple-01', label: '💕 Couple classique avec voile', url: 'https://res.cloudinary.com/dau96mui2/image/upload/v1776878822/81_pzfb2j.png' },
  { id: 'couple-02', label: '💕 Étreinte élégante', url: 'https://res.cloudinary.com/dau96mui2/image/upload/v1776878824/82_gbqs4r.png' },
  { id: 'couple-03', label: '💕 Baiser avec bouquet', url: 'https://res.cloudinary.com/dau96mui2/image/upload/v1776878831/83_iw0wq9.png' },
  { id: 'couple-04', label: '💕 Robe pailletée', url: 'https://res.cloudinary.com/dau96mui2/image/upload/v1776878834/88_e6oobi.png' },
  { id: 'couple-05', label: '💕 Couple brun + brune', url: 'https://res.cloudinary.com/dau96mui2/image/upload/v1776878835/87_hejtki.png' },
  { id: 'couple-06', label: '🌸 Arche florale rose', url: 'https://res.cloudinary.com/dau96mui2/image/upload/v1776878838/94_l7zjbv.png' },
] as const

const FRAMES: { id: string; label: string; url: string | null }[] = [
  { id: 'frame-02', label: '🤍 Roses Crème Haut/Bas', url: 'https://res.cloudinary.com/dau96mui2/image/upload/v1776785419/51_m9vx96.png' },
  { id: 'frame-03', label: '🌺 Cadre Floral Rose', url: 'https://res.cloudinary.com/dau96mui2/image/upload/v1776785419/53_ho1gq8.png' },
  { id: 'frame-05', label: '💙 Fleurs Aquarelle Bleues', url: 'https://res.cloudinary.com/dau96mui2/image/upload/v1776785418/48_t9qh5k.png' },
  { id: 'frame-06', label: '🌹 Cadre Géométrique Roses', url: 'https://res.cloudinary.com/dau96mui2/image/upload/v1776785416/50_iq0a5c.png' },
  { id: 'frame-07', label: '🌷 Fleurs Rose Aquarelle', url: 'https://res.cloudinary.com/dau96mui2/image/upload/v1776785416/49_ewrr8v.png' },
  { id: 'frame-09', label: '🌻 Cadre Champêtre', url: 'https://res.cloudinary.com/dau96mui2/image/upload/v1776785415/46_g1yqw8.png' },
  { id: 'frame-10', label: '🌸 Fleurs Roses Coins', url: 'https://res.cloudinary.com/dau96mui2/image/upload/v1776785414/45_roarfa.png' },
  { id: 'frame-30', label: '🌹 Floral 18', url: 'https://res.cloudinary.com/dau96mui2/image/upload/v1776778825/18_ushe4t.png' },
  { id: 'frame-32', label: '🌷 Floral 16', url: 'https://res.cloudinary.com/dau96mui2/image/upload/v1776778821/16_cibjrt.png' },
  { id: 'frame-34', label: '🌻 Floral 14', url: 'https://res.cloudinary.com/dau96mui2/image/upload/v1776778816/14_bzmmdm.png' },
  { id: 'frame-55', label: '🌸 Floral 55', url: 'https://res.cloudinary.com/dau96mui2/image/upload/v1776857011/55_l7xahl.png' },
  { id: 'frame-56', label: '🌸 Floral 56', url: 'https://res.cloudinary.com/dau96mui2/image/upload/v1776857012/56_siwk5j.png' },
  { id: 'frame-61', label: '🌸 Floral 61', url: 'https://res.cloudinary.com/dau96mui2/image/upload/v1776857014/61_nnkips.png' },
  { id: 'frame-65', label: '🌸 Floral 65', url: 'https://res.cloudinary.com/dau96mui2/image/upload/v1776857017/65_hzdotl.png' },
  { id: 'frame-67', label: '🌸 Floral 67', url: 'https://res.cloudinary.com/dau96mui2/image/upload/v1776857018/67_so3kot.png' },
  { id: 'frame-69', label: '🌸 Floral 69', url: 'https://res.cloudinary.com/dau96mui2/image/upload/v1776857021/69_vko7to.png' },
  { id: 'frame-70', label: '🌸 Floral 70', url: 'https://res.cloudinary.com/dau96mui2/image/upload/v1776857021/70_skvaop.png' },
  { id: 'frame-71', label: '🌸 Floral 71', url: 'https://res.cloudinary.com/dau96mui2/image/upload/v1776857022/71_ntcix8.png' },
  { id: 'frame-75', label: '🌸 Floral 75', url: 'https://res.cloudinary.com/dau96mui2/image/upload/v1776878823/75_qc4gsm.png' },
  { id: 'frame-76', label: '🌸 Floral 76', url: 'https://res.cloudinary.com/dau96mui2/image/upload/v1776878833/76_g2u8xr.png' },
  { id: 'frame-77', label: '🌸 Floral 77', url: 'https://res.cloudinary.com/dau96mui2/image/upload/v1776878824/77_rnfcni.png' },
  { id: 'frame-78', label: '🌸 Floral 78', url: 'https://res.cloudinary.com/dau96mui2/image/upload/v1776878816/78_umvdax.png' },
  { id: 'frame-79', label: '🌸 Floral 79', url: 'https://res.cloudinary.com/dau96mui2/image/upload/v1776878824/79_msrbl6.png' },
  { id: 'frame-80', label: '🌸 Floral 80', url: 'https://res.cloudinary.com/dau96mui2/image/upload/v1776878829/80_vsytvo.png' },
  { id: 'frame-95', label: '🌸 Floral 95', url: 'https://res.cloudinary.com/dau96mui2/image/upload/v1776878845/95_w9natp.png' },
  { id: 'frame-96', label: '🌸 Floral 96', url: 'https://res.cloudinary.com/dau96mui2/image/upload/v1776878838/96_bauksw.png' },
  { id: 'frame-97', label: '🌸 Floral 97', url: 'https://res.cloudinary.com/dau96mui2/image/upload/v1776878845/97_dcccon.png' },
  { id: 'frame-98', label: '🌸 Floral 98', url: 'https://res.cloudinary.com/dau96mui2/image/upload/v1776878848/98_jau9vb.png' },
  { id: 'frame-99', label: '🌸 Floral 99', url: 'https://res.cloudinary.com/dau96mui2/image/upload/v1776878852/99_webyut.png' },
  { id: 'frame-100', label: '🌸 Floral 100', url: 'https://res.cloudinary.com/dau96mui2/image/upload/v1776878852/100_kzuxzq.png' },
  { id: 'frame-101', label: '🌸 Floral 101', url: 'https://res.cloudinary.com/dau96mui2/image/upload/v1776878850/101_s1bjjf.png' },
  { id: 'frame-102', label: '🌸 Floral 102', url: 'https://res.cloudinary.com/dau96mui2/image/upload/v1776878855/102_atqmm6.png' },
  { id: 'frame-103', label: '🌸 Floral 103', url: 'https://res.cloudinary.com/dau96mui2/image/upload/v1776878853/103_siefgf.png' },
  { id: 'frame-104', label: '🌸 Floral 104', url: 'https://res.cloudinary.com/dau96mui2/image/upload/v1776878854/104_mafsu8.png' },
  { id: 'frame-105', label: '🌸 Floral 105', url: 'https://res.cloudinary.com/dau96mui2/image/upload/v1776878857/105_cyugrg.png' },
  { id: 'frame-106', label: '🌸 Floral 106', url: 'https://res.cloudinary.com/dau96mui2/image/upload/v1776878859/106_lv0kwe.png' },
  { id: 'frame-107', label: '🌸 Floral 107', url: 'https://res.cloudinary.com/dau96mui2/image/upload/v1776878857/107_jal3jp.png' },
  { id: 'frame-108', label: '🌸 Floral 108', url: 'https://res.cloudinary.com/dau96mui2/image/upload/v1776878858/108_xvumew.png' },
  { id: 'none', label: '⬜ Sans cadre', url: null },
]


const THEME_CARD_BG: Record<string, string> = {
  'rose-fleuri':   '#fff9f6',
  'ivoire-or':     '#fffdf5',
  'bleu-floral':   '#f6f9ff',
  'champetre':     '#f6faf4',
  'blanc-gris':    '#fafafa',
  'noir-blanc':    '#1a1a1a',
  'chocolat':      '#2c1a0e',
  'bordeaux':      '#fdf5f5',
  'bordeaux-nuit': '#1a0810',
  'fuchsia':       '#fff5fc',
  'marine-or':     '#0a1628',
  'menthe':        '#f2fbf7',
}

const CEREMONY_TYPES = ['Mairie', 'Cérémonie religieuse / Houppa', 'Shabbat Hatan', 'Henné', 'Cocktail', 'Soirée', 'Boat Party', 'Autre']

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
  // ── Infos pratiques (transport / hébergement) ──
  infosTransportActif: boolean
  transport: string
  hebergement: string
  // ── Pensées pour les défunts (Houppa principalement) ──
  penseesDefuntsActif: boolean
  penseesDefuntsIntro: string
  penseesDefuntsNoms: string[]
  penseesDefuntsFin: string
}
interface FormData {
  marie1Prenom: string
  marie1Nom: string
  marie1Prenom2: string
  marie2Prenom: string
  marie2Nom: string
  marie2Prenom2: string
  famille1PerePrenom: string
  famille1PereNom: string
  famille1MerePrenom: string
  famille1MereNom: string
  famille1GpPaPerePrenom: string
  famille1GpPaPereNom: string
  famille1GpPaMerePrenom: string
  famille1GpPaMereNom: string
  famille1GpMaPerePrenom: string
  famille1GpMaPereNom: string
  famille1GpMaMerePrenom: string
  famille1GpMaMereNom: string
  famille2PerePrenom: string
  famille2PereNom: string
  famille2MerePrenom: string
  famille2MereNom: string
  famille2GpPaPerePrenom: string
  famille2GpPaPereNom: string
  famille2GpPaMerePrenom: string
  famille2GpPaMereNom: string
  famille2GpMaPerePrenom: string
  famille2GpMaPereNom: string
  famille2GpMaMerePrenom: string
  famille2GpMaMereNom: string
  ceremonies: Ceremony[]
  style: Theme
  presentationStyle: PresentationStyle
  mariageJuif: boolean
  youtubeUrl: string
  musicUrl: string
  photoFond: string
  photosFond: string[]
  emailMaries: string
  textOverrides?: Record<string, string>
  monogrammeStyle?: string
  monogrammeColor?: string
  musicName?: string
  ornamentId?: string
  fondCeremonie?: 'ornements' | 'photo'
  photoPosition?: 'top' | 'center' | 'bottom' | 'left' | 'right'
  photosData?: { url: string; cropX: number; cropY: number; cropScale: number }[]
  marie1PrenomHebreu?: string
  marie2PrenomHebreu?: string
  frameId?: string
  frameOpacity?: number
  frameSize?: number
  framePaddingV?: number
  framePaddingH?: number
  textOpacity?: number
  textBg?: number
  animationStyle?: string
  introAnimation?: string
  slug?: string
  zoneStyles?: ZoneStyles 
  styleAccueil?: 'photo' | 'monogramme' | 'illustration'
  illustrationCoupleId?: string
  effetTexte?: 'aucun' | 'or' | 'aquarelle' | 'embosse'
  dateAccueilOverride?: string // Date affichée sur la page d'accueil (override manuel)
  customLogoUrl?: string
  customLogoSize?: number // 50-150, default 100
  customLogoColor?: string // '' = original, ou hex color
}
const defaultCeremony: Ceremony = {
  type: 'Cérémonie religieuse / Houppa',
  customName: '', lieu: '', adresse: '', date: '', heure: '',
  suiviDAutre: false, evenementSuivantNom: '', evenementSuivantAdresse: '', note: '',
  infosTransportActif: false, transport: '', hebergement: '',
  penseesDefuntsActif: false,
  penseesDefuntsIntro: 'Zihrona Levraha — Que leur mémoire soit une bénédiction',
  penseesDefuntsNoms: [],
  penseesDefuntsFin: 'Présents dans nos cœurs en ce jour',
}

const defaultFormData: FormData = {
  marie1Prenom: '', marie1Nom: '', marie1Prenom2: '',
  marie2Prenom: '', marie2Nom: '', marie2Prenom2: '',
  famille1PerePrenom: '', famille1PereNom: '', famille1MerePrenom: '', famille1MereNom: '',
  famille1GpPaPerePrenom: '', famille1GpPaPereNom: '', famille1GpPaMerePrenom: '', famille1GpPaMereNom: '',
  famille1GpMaPerePrenom: '', famille1GpMaPereNom: '', famille1GpMaMerePrenom: '', famille1GpMaMereNom: '',
  famille2PerePrenom: '', famille2PereNom: '', famille2MerePrenom: '', famille2MereNom: '',
  famille2GpPaPerePrenom: '', famille2GpPaPereNom: '', famille2GpPaMerePrenom: '', famille2GpPaMereNom: '',
  famille2GpMaPerePrenom: '', famille2GpMaPereNom: '', famille2GpMaMerePrenom: '', famille2GpMaMereNom: '',
  ceremonies: [{ ...defaultCeremony }],
  style: 'rose-fleuri', presentationStyle: 'page-unique', mariageJuif: false, youtubeUrl: '', musicUrl: '', musicName: '', photoFond: '', photosFond: [], emailMaries: '', textOverrides: {},
  monogrammeStyle: 'cercle', monogrammeColor: '',
  ornamentId: 'none',
  fondCeremonie: 'ornements',
  photoPosition: 'center',
  photosData: [],
  marie1PrenomHebreu: '',
  marie2PrenomHebreu: '',
  frameId: 'frame-09',
  frameOpacity: 1,
  frameSize: 100,
  framePaddingV: 35,
  framePaddingH: 16,
  textOpacity: 1,
  textBg: 0.5,
  animationStyle: 'slide-up',
  introAnimation: 'enveloppe',
  slug: '',
  zoneStyles: {},
  styleAccueil: 'photo',
  illustrationCoupleId: '',
}

// Propriétés mobiles partagées pour tous les boutons
const BTN: React.CSSProperties = {
  touchAction: 'manipulation',
  WebkitTapHighlightColor: 'transparent',
  cursor: 'pointer',
}

// ── Formatage affichage famille ────────────────────────────────────────────────

function joinName(prenom: string, nom: string) {
  return [prenom, nom].filter(Boolean).join(' ')
}
function fmtGpCouple(perePrenom: string, pereNom: string, merePrenom: string, mereNom: string): string {
  const hasPere = perePrenom || pereNom
  const hasMere = merePrenom || mereNom
  if (hasPere && hasMere) return ['M. & Mme', perePrenom, pereNom || mereNom].filter(Boolean).join(' ')
  if (hasPere) return ['M.', perePrenom, pereNom].filter(Boolean).join(' ')
  if (hasMere) return ['Mme', merePrenom, mereNom].filter(Boolean).join(' ')
  return ''
}
function fmtParentsLines(pPrenom: string, pNom: string, mPrenom: string, mNom: string): string[] {
  const pFull = joinName(pPrenom, pNom)
  const mFull = joinName(mPrenom, mNom)
  if (pFull && mFull) return ['M. & Mme ' + pFull]
  if (pFull) return ['M. ' + pFull]
  if (mFull) return ['Mme ' + mFull]
  return []
}

// Audio pré-démarré pendant le clic "Générer" pour contourner la politique autoplay
let _pendingAudio: HTMLAudioElement | null = null

function compressImage(base64: string, maxWidth = 800, quality = 0.7): Promise<string> {
  return new Promise(resolve => {
    const img = new Image()
    img.onload = () => {
      const scale = Math.min(1, maxWidth / (img.width || 1))
      const w = Math.round(img.width * scale)
      const h = Math.round(img.height * scale)
      const canvas = document.createElement('canvas')
      canvas.width = w
      canvas.height = h
      const ctx = canvas.getContext('2d')
      if (!ctx) { resolve(base64); return }
      ctx.drawImage(img, 0, 0, w, h)
      resolve(canvas.toDataURL('image/jpeg', quality))
    }
    img.onerror = () => resolve(base64)
    img.src = base64
  })
}

function applyTextEffect(effet?: string, accentColor?: string): React.CSSProperties {
  if (effet === 'or') {
    return {
      background: 'linear-gradient(135deg, #d4a574 0%, #f4e4b8 30%, #d4a574 60%, #a67c3f 100%)',
      WebkitBackgroundClip: 'text',
      WebkitTextFillColor: 'transparent',
      backgroundClip: 'text',
    }
  }
  if (effet === 'aquarelle') {
    return {
      position: 'relative' as const,
      color: accentColor,
      textShadow: `0 0 12px ${accentColor}55, 0 0 24px ${accentColor}33`,
    }
  }
  if (effet === 'embosse') {
    return {
      color: '#d4c9b8',
      textShadow: `
        1px 1px 0 rgba(255,255,255,0.9),
        -1px -1px 1px ${accentColor}66,
        0 0 2px ${accentColor}44
      `,
    }
  }
  return {}
}
// ── Génération automatique d'un slug joli pour l'URL ────────────────────────
// Format : "ornella-samuel-x7k" (prénoms + suffixe court pour éviter les collisions)
function generateAutoSlug(prenom1: string, prenom2: string): string {
  const clean = (s: string) =>
    (s || '')
      .toLowerCase()
      .normalize('NFD')                       // décompose les accents (é → e + ́)
      .replace(/[\u0300-\u036f]/g, '')        // supprime les diacritiques
      .replace(/[^a-z0-9]+/g, '')             // garde uniquement lettres+chiffres
      .slice(0, 12)                            // max 12 chars par prénom

  const p1 = clean(prenom1) || 'maries'
  const p2 = clean(prenom2) || 'maries'

  // Suffixe aléatoire 3 chars (alphanumérique) pour unicité
  const chars = 'abcdefghijkmnpqrstuvwxyz23456789' // sans 0/o/1/l/i (lisibilité)
  let suffix = ''
  for (let i = 0; i < 3; i++) {
    suffix += chars[Math.floor(Math.random() * chars.length)]
  }

  return `${p1}-${p2}-${suffix}`
}
// ── Recadrage IA automatique sur les visages (Cloudinary g_auto) ─────────────
// Transforme l'URL Cloudinary pour appliquer un crop intelligent qui détecte
// les visages et les positionne au centre. Format 9:16 (vertical mobile).
function toCloudinaryFaceCrop(url: string, width = 800, height = 1200): string {
  if (!url || !url.includes('/upload/')) return url
  // Si l'URL a déjà des transformations, on les remplace
  if (url.match(/\/upload\/[^/]+\//) && url.match(/\/upload\/(w_|h_|c_|g_)/)) {
    return url.replace(/\/upload\/[^/]+\//, `/upload/w_${width},h_${height},c_fill,g_auto:faces,q_auto,f_auto/`)
  }
  return url.replace('/upload/', `/upload/w_${width},h_${height},c_fill,g_auto:faces,q_auto,f_auto/`)
}
function getYouTubeId(url: string): string | null {
  const match = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&\n?#]+)/)
  return match ? match[1] : null
}

function formatDateFr(dateStr: string): string {
  if (!dateStr) return ''
  return new Intl.DateTimeFormat('fr-FR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })
    .format(new Date(dateStr + 'T12:00:00')).toUpperCase()
}

function formatDateFrCap(dateStr: string): string {
  if (!dateStr) return ''
  const d = new Date(dateStr + 'T12:00:00')
  const parts = new Intl.DateTimeFormat('fr-FR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' }).formatToParts(d)
  const cap = (s: string) => s.charAt(0).toUpperCase() + s.slice(1)
  const w = parts.find(p => p.type === 'weekday')?.value || ''
  const day = parts.find(p => p.type === 'day')?.value || ''
  const m = parts.find(p => p.type === 'month')?.value || ''
  const y = parts.find(p => p.type === 'year')?.value || ''
  return `Le ${cap(w)} ${day} ${cap(m)} ${y}`
}

function formatHeure(h: string): string {
  if (!h) return ''
  return 'À ' + h.replace(':', 'H')
}

function formatLieu(lieu: string): string {
  if (!lieu) return ''
  const l = lieu.toLowerCase()
  if (l.includes('salon') || l.includes('salle')) return `Dans les salons ${lieu}`
  if (l.includes('château') || l.includes('chateau')) return `Au château ${lieu}`
  if (l.includes('domaine')) return `Au domaine ${lieu}`
  return `À ${lieu}`
}

function conjonctionLieu(lieu: string): string {
  if (!lieu) return ''
  const t = lieu.trim()
  const low = t.toLowerCase()
  if (low.startsWith('le ')) return `au ${t.slice(3)}`
  if (low.startsWith('la ')) return `à la ${t.slice(3)}`
  if ('AEIOUÀÂÉÈÊËÎÏÔÙÛÜŒaeiouàâéèêëîïôùûüœ'.includes(t.charAt(0))) return `à l'${t}`
  return `à ${t}`
}

function getHebrewDate(dateStr: string): string {
  if (!dateStr) return ''
  try {
    return new Intl.DateTimeFormat('he-IL-u-ca-hebrew', { year: 'numeric', month: 'long', day: 'numeric' })
      .format(new Date(dateStr + 'T12:00:00'))
  } catch { return '' }
}

// ── Phrase d'invitation par défaut, mise en page élégante ─────────────────────
// Retourne un JSX avec la structure : intro + NOMS en valeur + suite
function renderInvitationPhrase(
  ceremony: Ceremony,
  data: FormData,
  accent: string,
  textColor: string
): React.ReactNode {
  const p1 = data.marie1Prenom || 'Prénom'
  const p2 = data.marie2Prenom || 'Prénom'
  const nom1 = data.famille1PereNom || data.marie1Nom || ''
  const nom2 = data.famille2PereNom || data.marie2Nom || ''

  const FC = 'var(--font-cormorant-garamond)'
  const FP = 'var(--font-playfair-display)'

  // Style des lignes "intro" et "fin de phrase"
  const introStyle: React.CSSProperties = {
    fontFamily: FC,
    fontStyle: 'italic',
    fontSize: 16,
    color: textColor,
    textAlign: 'center',
    lineHeight: 1.7,
    opacity: 0.85,
    margin: '0 0 10px',
  }

  // Style des NOMS et PRÉNOMS mis en avant
  const highlightStyle: React.CSSProperties = {
    fontFamily: FP,
    fontSize: 'clamp(18px, 4.5vw, 22px)',
    color: accent,
    fontWeight: 700,
    letterSpacing: 3,
    textTransform: 'uppercase',
    textAlign: 'center',
    margin: '6px 0 14px',
    whiteSpace: 'nowrap',          // ← NOMS jamais coupés
    overflowWrap: 'normal',
    wordBreak: 'keep-all',
  }

  switch (ceremony.type) {
    case 'Shabbat Hatan': {
      const familles = [nom1, nom2].filter(Boolean).join(' & ')
      return (
        <>
          {familles && <div style={introStyle}>Les familles</div>}
          {familles && <div style={highlightStyle}>{familles}</div>}
          <div style={introStyle}>
            {familles ? 'seront ravies de vous convier au' : 'Vous êtes conviés au'}
          </div>
          <div style={{ ...introStyle, margin: '0 0 4px' }}>Shabbat Hatan de</div>
          <div style={highlightStyle}>{p1} &amp; {p2}</div>
        </>
      )
    }
    case 'Henné':
      return (
        <>
          <div style={introStyle}>Vous êtes chaleureusement conviés à</div>
          <div style={{ ...introStyle, margin: '0 0 4px' }}>la soirée du henné de</div>
          <div style={highlightStyle}>{p1} &amp; {p2}</div>
          <div style={introStyle}>dans la tradition et la joie</div>
        </>
      )
    case 'Cocktail':
      return (
        <>
          <div style={{ ...introStyle, margin: '0 0 4px' }}>Levons notre verre avec</div>
          <div style={highlightStyle}>{p1} &amp; {p2}</div>
          <div style={introStyle}>pour célébrer ensemble<br />le début de cette belle aventure</div>
        </>
      )
    case 'Soirée':
      return (
        <>
          <div style={{ ...introStyle, margin: '0 0 4px' }}>Dansez, riez et célébrez avec</div>
          <div style={highlightStyle}>{p1} &amp; {p2}</div>
          <div style={introStyle}>jusqu&apos;au bout de la nuit</div>
        </>
      )
    case 'Boat Party':
      return (
        <>
          <div style={{ ...introStyle, margin: '0 0 4px' }}>Embarquez avec</div>
          <div style={highlightStyle}>{p1} &amp; {p2}</div>
          <div style={introStyle}>pour une soirée inoubliable,<br />entre ciel et mer</div>
        </>
      )
    case 'Autre': {
      const evt = ceremony.customName || 'cet événement'
      return (
        <>
          <div style={{ ...introStyle, margin: '0 0 4px' }}>Rejoignez</div>
          <div style={highlightStyle}>{p1} &amp; {p2}</div>
          <div style={introStyle}>pour {evt}</div>
        </>
      )
    }
    default:
      return null
  }
}
function sortByDate(ceremonies: Ceremony[]): Ceremony[] {
  return [...ceremonies].sort((a, b) => {
    if (!a.date) return 1
    if (!b.date) return -1
    return new Date(a.date).getTime() - new Date(b.date).getTime()
  })
}
function applyZoneStyle(baseStyle: React.CSSProperties, zone: TextZone, zoneStyles?: ZoneStyles): React.CSSProperties {
  const z = zoneStyles?.[zone]
  if (!z) return baseStyle
  const result: React.CSSProperties = { ...baseStyle }
  if (z.fontFamily) result.fontFamily = z.fontFamily
  if (z.color) result.color = z.color
  if (z.bold) result.fontWeight = 700
  if (z.italic) result.fontStyle = 'italic'
  if (z.sizeScale && z.sizeScale !== 1) {
    // Multiplie la fontSize si elle est définie
    const currentSize = baseStyle.fontSize
    if (typeof currentSize === 'number') {
      result.fontSize = Math.round(currentSize * z.sizeScale)
    } else if (typeof currentSize === 'string' && currentSize.includes('clamp')) {
      // On garde le clamp mais on peut jouer sur transform
      result.transform = `scale(${z.sizeScale})`
      result.transformOrigin = 'center'
      result.display = 'inline-block'
    }
  }
  return result
}
const S: Record<string, React.CSSProperties> = {
  input: {
    width: '100%', border: '1px solid #fecdd3', borderRadius: 10, padding: '10px 14px',
    background: 'white', fontSize: 14, outline: 'none', color: '#4a3728', boxSizing: 'border-box',
  },
  label: {
    display: 'block', fontSize: 10, textTransform: 'uppercase', letterSpacing: '0.15em',
    color: '#C9A84C', marginBottom: 6, fontWeight: 600,
  },
}

function Label({ children }: { children: React.ReactNode }) {
  return <label style={S.label}>{children}</label>
}

function Field({ label, value, onChange, placeholder, type = 'text' }: {
  label: string; value: string; onChange: (v: string) => void; placeholder?: string; type?: string
}) {
  return (
    <div style={{ marginBottom: 16 }}>
      <Label>{label}</Label>
      <input type={type} value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder} style={S.input} />
    </div>
  )
}

function ProgressBar({ step }: { step: number }) {
  const steps = ['Les mariés', 'Les familles', 'Cérémonies', 'Style']
  return (
    <div style={{ marginBottom: 32 }}>
      <div style={{ position: 'relative', display: 'flex', alignItems: 'center', marginBottom: 10 }}>
        <div style={{ position: 'absolute', left: 0, right: 0, height: 1, background: '#fce7f3' }} />
        <div style={{
          position: 'absolute', left: 0, height: 1,
          background: 'linear-gradient(to right, rgba(201,168,76,0.4), #C9A84C)',
          width: `${((step - 1) / (steps.length - 1)) * 100}%`,
          transition: 'width 0.5s ease',
        }} />
        <div style={{ position: 'relative', display: 'flex', justifyContent: 'space-between', width: '100%' }}>
          {steps.map((_, i) => (
            <div key={i} style={{
              width: 10, height: 10, borderRadius: '50%',
              border: `2px solid ${i + 1 <= step ? '#C9A84C' : '#fecdd3'}`,
              background: i + 1 < step ? '#C9A84C' : 'white',
              boxShadow: i + 1 === step ? '0 0 0 4px rgba(201,168,76,0.15)' : 'none',
              transition: 'all 0.3s',
            }} />
          ))}
        </div>
      </div>
      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
        {steps.map((label, i) => (
          <span key={i} style={{
            flex: 1, textAlign: 'center', fontSize: 9, fontWeight: 600,
            letterSpacing: '0.12em', textTransform: 'uppercase',
            color: i + 1 === step ? '#C9A84C' : i + 1 < step ? 'rgba(201,168,76,0.45)' : '#fecdd3',
          }}>{label}</span>
        ))}
      </div>
    </div>
  )
}

function Step1({ data, onChange }: { data: FormData; onChange: (d: Partial<FormData>) => void }) {
  return (
    <div>
      <h2 style={{ textAlign: 'center', fontSize: 22, fontWeight: 600, color: '#4a3728', marginBottom: 24 }}>Les mariés</h2>
      <div style={{ background: '#fdf8f9', borderRadius: 12, padding: 20, marginBottom: 16 }}>
        <div style={{ fontSize: 11, color: '#C9A84C', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 12 }}>Marié·e 1</div>
        <div style={{ display: 'flex', gap: 12 }}>
          <Field label="Prénom" value={data.marie1Prenom} onChange={v => onChange({ marie1Prenom: v })} placeholder="Sophie" />
          <Field label="Nom" value={data.marie1Nom} onChange={v => onChange({ marie1Nom: v })} placeholder="Martin" />
        </div>
        <Field label="2ème prénom (optionnel)" value={data.marie1Prenom2} onChange={v => onChange({ marie1Prenom2: v })} placeholder="Marie" />
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, margin: '16px 0' }}>
        <div style={{ flex: 1, height: 1, background: '#fecdd3' }} />
        <span style={{ color: '#C9A84C', fontSize: 20 }}>&</span>
        <div style={{ flex: 1, height: 1, background: '#fecdd3' }} />
      </div>
      <div style={{ background: '#fdf8f9', borderRadius: 12, padding: 20 }}>
        <div style={{ fontSize: 11, color: '#C9A84C', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 12 }}>Marié·e 2</div>
        <div style={{ display: 'flex', gap: 12 }}>
          <Field label="Prénom" value={data.marie2Prenom} onChange={v => onChange({ marie2Prenom: v })} placeholder="Thomas" />
          <Field label="Nom" value={data.marie2Nom} onChange={v => onChange({ marie2Nom: v })} placeholder="Dupont" />
        </div>
        <Field label="2ème prénom (optionnel)" value={data.marie2Prenom2} onChange={v => onChange({ marie2Prenom2: v })} placeholder="David" />
      </div>
      <div style={{ marginTop: 20, padding: 16, background: '#fdf8f9', borderRadius: 12 }}>
  <Label>Votre lien personnalisé (optionnel)</Label>
  <p style={{ fontSize: 11, color: '#9ca3af', marginBottom: 8 }}>Ex: sarah-et-david → lovit.fr/sarah-et-david</p>
  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
    <span style={{ fontSize: 12, color: '#9ca3af', whiteSpace: 'nowrap' }}>lovit.fr/</span>
    <input
      type="text"
      value={data.slug ?? ''}
      onChange={e => onChange({ slug: e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '').slice(0, 40) })}
      placeholder="prenom1-et-prenom2"
      style={S.input}
    />
  </div>
</div>
    </div>
  )
}

type GpGroupDef = {
  label: string
  perePrenom: keyof FormData; pereNom: keyof FormData
  merePrenom: keyof FormData; mereNom: keyof FormData
}

function GpGroupFields({ label, data, onChange, perePrenom, pereNom, merePrenom, mereNom }: GpGroupDef & { data: FormData; onChange: (d: Partial<FormData>) => void }) {
  return (
    <div style={{ marginBottom: 14 }}>
      <Label>{label}</Label>
      <div style={{ fontSize: 10, color: '#C9A84C99', marginTop: -6, marginBottom: 6 }}>Grand-père puis grand-mère (optionnels)</div>
      <div style={{ display: 'flex', gap: 6, marginBottom: 6 }}>
        <input type="text" value={data[perePrenom] as string} placeholder="Prénom GP" onChange={e => onChange({ [perePrenom]: e.target.value } as Partial<FormData>)} style={{ ...S.input, flex: 1, fontSize: 11 }} />
        <input type="text" value={data[pereNom] as string} placeholder="Nom GP" onChange={e => onChange({ [pereNom]: e.target.value } as Partial<FormData>)} style={{ ...S.input, flex: 1, fontSize: 11 }} />
      </div>
      <div style={{ display: 'flex', gap: 6 }}>
        <input type="text" value={data[merePrenom] as string} placeholder="Prénom GM" onChange={e => onChange({ [merePrenom]: e.target.value } as Partial<FormData>)} style={{ ...S.input, flex: 1, fontSize: 11 }} />
        <input type="text" value={data[mereNom] as string} placeholder="Nom GM" onChange={e => onChange({ [mereNom]: e.target.value } as Partial<FormData>)} style={{ ...S.input, flex: 1, fontSize: 11 }} />
      </div>
    </div>
  )
}

function Step2({ data, onChange }: { data: FormData; onChange: (d: Partial<FormData>) => void }) {
  const cols: Array<{ title: string; gps: GpGroupDef[]; pereKey: keyof FormData; pereNomKey: keyof FormData; mereKey: keyof FormData; mereNomKey: keyof FormData }> = [
    {
      title: data.marie1Prenom || 'Marié·e 1',
      gps: [
        { label: 'GP paternels', perePrenom: 'famille1GpPaPerePrenom', pereNom: 'famille1GpPaPereNom', merePrenom: 'famille1GpPaMerePrenom', mereNom: 'famille1GpPaMereNom' },
        { label: 'GP maternels', perePrenom: 'famille1GpMaPerePrenom', pereNom: 'famille1GpMaPereNom', merePrenom: 'famille1GpMaMerePrenom', mereNom: 'famille1GpMaMereNom' },
      ],
      pereKey: 'famille1PerePrenom', pereNomKey: 'famille1PereNom', mereKey: 'famille1MerePrenom', mereNomKey: 'famille1MereNom',
    },
    {
      title: data.marie2Prenom || 'Marié·e 2',
      gps: [
        { label: 'GP paternels', perePrenom: 'famille2GpPaPerePrenom', pereNom: 'famille2GpPaPereNom', merePrenom: 'famille2GpPaMerePrenom', mereNom: 'famille2GpPaMereNom' },
        { label: 'GP maternels', perePrenom: 'famille2GpMaPerePrenom', pereNom: 'famille2GpMaPereNom', merePrenom: 'famille2GpMaMerePrenom', mereNom: 'famille2GpMaMereNom' },
      ],
      pereKey: 'famille2PerePrenom', pereNomKey: 'famille2PereNom', mereKey: 'famille2MerePrenom', mereNomKey: 'famille2MereNom',
    },
  ]
  return (
    <div>
      <h2 style={{ textAlign: 'center', fontSize: 22, fontWeight: 600, color: '#4a3728', marginBottom: 24 }}>Les familles</h2>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
        {cols.map((col, ci) => (
          <div key={ci}>
            <div style={{ fontSize: 11, color: '#C9A84C', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', textAlign: 'center', marginBottom: 12 }}>{col.title}</div>
            {col.gps.map(g => (
              <GpGroupFields key={g.label + ci} {...g} data={data} onChange={onChange} />
            ))}
            <div style={{ marginBottom: 14 }}>
              <Label>Père</Label>
              <div style={{ display: 'flex', gap: 6 }}>
                <input type="text" value={data[col.pereKey] as string} placeholder="Prénom" onChange={e => onChange({ [col.pereKey]: e.target.value } as Partial<FormData>)} style={{ ...S.input, flex: 1 }} />
                <input type="text" value={data[col.pereNomKey] as string} placeholder="Nom" onChange={e => onChange({ [col.pereNomKey]: e.target.value } as Partial<FormData>)} style={{ ...S.input, flex: 1 }} />
              </div>
            </div>
            <div style={{ marginBottom: 14 }}>
              <Label>Mère</Label>
              <div style={{ display: 'flex', gap: 6 }}>
                <input type="text" value={data[col.mereKey] as string} placeholder="Prénom" onChange={e => onChange({ [col.mereKey]: e.target.value } as Partial<FormData>)} style={{ ...S.input, flex: 1 }} />
                <input type="text" value={data[col.mereNomKey] as string} placeholder="Nom" onChange={e => onChange({ [col.mereNomKey]: e.target.value } as Partial<FormData>)} style={{ ...S.input, flex: 1 }} />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

// ── IllustrationCoupleSelector : choix de l'illustration aquarelle ────────────

function IllustrationCoupleSelector({ data, onChange }: { data: FormData; onChange: (d: Partial<FormData>) => void }) {
  const selected = data.illustrationCoupleId
  return (
    <div style={{ marginBottom: 16 }}>
      <div style={{ fontFamily: 'var(--font-cormorant-garamond)', fontStyle: 'italic', fontSize: 15, color: '#4a3728', marginBottom: 12 }}>
        🎨 Choisissez votre illustration
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8 }}>
        {ILLUSTRATIONS_COUPLES.map(illu => {
          const isSel = selected === illu.id
          return (
            <button
              key={illu.id}
              type="button"
              onClick={() => onChange({ illustrationCoupleId: illu.id })}
              style={{
                ...BTN,
                padding: 4,
                border: isSel ? '2.5px solid #c48b9f' : '1px solid #fecdd3',
                borderRadius: 10,
                background: isSel ? '#fdf5e4' : 'white',
                cursor: 'pointer',
                position: 'relative',
                aspectRatio: '3/4',
                overflow: 'hidden',
              }}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={illu.url} alt={illu.label} style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
              {isSel && (
                <div style={{ position: 'absolute', top: 4, right: 4, background: '#c48b9f', color: 'white', borderRadius: '50%', width: 20, height: 20, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12 }}>✓</div>
              )}
            </button>
          )
        })}
      </div>
      <div style={{ fontSize: 11, color: '#9ca3af', marginTop: 8, fontStyle: 'italic' }}>
        Cette illustration remplacera votre monogramme sur la page d&apos;accueil du faire-part.
      </div>
    </div>
  )
}

// ── StyleAccueilSelector : photo / monogramme / illustration ──────────────────

function StyleAccueilSelector({ data, onChange }: { data: FormData; onChange: (d: Partial<FormData>) => void }) {
  const style = data.styleAccueil || 'photo'
  const options: Array<{ id: 'photo' | 'monogramme' | 'illustration'; label: string; emoji: string }> = [
    { id: 'photo', label: 'Photos', emoji: '📸' },
    { id: 'illustration', label: 'Illustration', emoji: '🎨' },
  ]
  return (
    <div style={{ marginBottom: 16 }}>
      <div style={{ fontFamily: 'var(--font-cormorant-garamond)', fontStyle: 'italic', fontSize: 15, color: '#4a3728', marginBottom: 12 }}>
        Style de la page d&apos;accueil
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 8, marginBottom: 12 }}>
        {options.map(opt => {
          const isSel = style === opt.id
          return (
            <button
              key={opt.id}
              type="button"
              onClick={() => onChange({ styleAccueil: opt.id })}
              style={{
                ...BTN,
                padding: '14px 8px',
                border: isSel ? '2.5px solid #c48b9f' : '1px solid #fecdd3',
                borderRadius: 10,
                background: isSel ? '#fdf5e4' : 'white',
                fontSize: 13,
                fontWeight: isSel ? 700 : 400,
                color: '#4a3728',
              }}
            >
              <div style={{ fontSize: 22, marginBottom: 4 }}>{opt.emoji}</div>
              {opt.label}
            </button>
          )
        })}
      </div>
      {style === 'illustration' && <IllustrationCoupleSelector data={data} onChange={onChange} />}
    </div>
  )
}
// ── PhotoSection : upload + recadrage interactif ──────────────────────────────

function PhotoSection({ data, onChange }: { data: FormData; onChange: (d: Partial<FormData>) => void }) {
  const [cropIdx, setCropIdx] = useState<number | null>(null)
  const [uploading, setUploading] = useState(false)
  const photos = data.photosFond ?? []
  const photosData = data.photosData ?? []

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? [])
    const toAdd = files.slice(0, 5 - photos.length)
    if (!toAdd.length) return
    setUploading(true)
    try {
      const uploaded: string[] = []
      for (const file of toAdd) {
        const fd = new FormData()
        fd.append('file', file)
        fd.append('upload_preset', 'wedding_music')
        const res = await fetch('https://api.cloudinary.com/v1_1/dau96mui2/upload', { method: 'POST', body: fd })
        const json = await res.json()
        if (json.secure_url) uploaded.push(json.secure_url)
      }
      const newPhotos = [...photos, ...uploaded].slice(0, 5)
      const newData = [...photosData, ...uploaded.map(url => ({ url, cropX: 0, cropY: 0, cropScale: 1 }))].slice(0, 5)
      onChange({ photosFond: newPhotos, photoFond: newPhotos[0] ?? '', photosData: newData, presentationStyle: 'page-unique' })
      setCropIdx(photos.length)
    } catch {
      alert('Erreur upload photo')
    } finally {
      setUploading(false)
    }
    e.target.value = ''
  }

  const handleDelete = (idx: number) => {
    const newPhotos = photos.filter((_, i) => i !== idx)
    const newData = photosData.filter((_, i) => i !== idx)
    onChange({ photosFond: newPhotos, photoFond: newPhotos[0] ?? '', photosData: newData })
    if (cropIdx === idx) setCropIdx(null)
    else if (cropIdx !== null && cropIdx > idx) setCropIdx(cropIdx - 1)
  }

  const updateCrop = (idx: number, crop: { x: number; y: number; scale: number }, close = false) => {
    const newData = [...photosData]
    newData[idx] = { url: photos[idx], cropX: crop.x, cropY: crop.y, cropScale: crop.scale }
    onChange({ photosData: newData })
    if (close) setCropIdx(null)
  }

  return (
    <div>
      <Label>Photos de fond (optionnel — max 5)</Label>
      <p style={{ fontSize: 11, color: '#9ca3af', marginBottom: 8 }}>Utilisée en fond de la section d&apos;accueil. Recadrez chaque photo individuellement.</p>

      {photos.length < 5 && (
        <label style={{ display: 'block', cursor: uploading ? 'wait' : 'pointer', marginBottom: photos.length > 0 ? 12 : 0 }}>
          <div style={{ border: '2px dashed #fecdd3', borderRadius: 10, padding: 16, textAlign: 'center', background: uploading ? '#fdf5e4' : 'white' }}>
            <div style={{ fontSize: 22, marginBottom: 4 }}>{uploading ? '⏳' : '📷'}</div>
            <p style={{ fontSize: 13, color: '#4a3728', margin: 0 }}>{uploading ? 'Upload en cours...' : 'Cliquer pour ajouter une photo'}</p>
          </div>
          <input type="file" accept="image/*" multiple disabled={uploading} onChange={handleUpload} style={{ display: 'none' }} />
        </label>
      )}

      {photos.length > 0 && (
        <div>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 12 }}>
            {photos.map((photo, idx) => {
              const crop = photosData[idx]
              const isCropping = cropIdx === idx
              return (
                <div key={idx}>
                  <div style={{ position: 'relative', width: 80, height: 80, borderRadius: 8, overflow: 'hidden', border: isCropping ? '2px solid #C9A84C' : '2px solid transparent' }}>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={photo} alt="" style={{ position: 'absolute', top: '50%', left: '50%', transform: crop ? `translate(calc(-50% + ${crop.cropX}px), calc(-50% + ${crop.cropY}px)) scale(${crop.cropScale})` : 'translate(-50%, -50%)', transformOrigin: 'center center', minWidth: '100%', minHeight: '100%', width: 'auto', height: 'auto' }} />
                    <div style={{ position: 'absolute', bottom: 2, left: 2, background: 'rgba(0,0,0,0.55)', color: 'white', fontSize: 8, borderRadius: 3, padding: '1px 4px' }}>Photo {idx + 1}</div>
                    <button type="button" onClick={() => handleDelete(idx)} style={{ ...BTN, position: 'absolute', top: 2, right: 2, background: 'white', border: 'none', borderRadius: '50%', width: 16, height: 16, fontSize: 9, color: '#fb7185', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 0 }}>✕</button>
                  </div>
                  <button type="button" onClick={() => setCropIdx(isCropping ? null : idx)} style={{ ...BTN, display: 'block', width: 80, marginTop: 4, padding: '4px 0', borderRadius: 6, border: `1px solid ${isCropping ? '#C9A84C' : '#fecdd3'}`, background: isCropping ? '#fdf5e4' : 'white', color: isCropping ? '#C9A84C' : '#4a3728', fontSize: 9, fontWeight: isCropping ? 700 : 400 }}>
                    {isCropping ? '▲ Fermer' : '✂ Recadrer'}
                  </button>
                </div>
              )
            })}
          </div>

          {cropIdx !== null && photos[cropIdx] && (
            <div style={{ background: '#fdf8f9', borderRadius: 12, padding: 16, marginBottom: 12, border: '1.5px solid #fecdd3' }}>
              <div style={{ fontSize: 12, color: '#C9A84C', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 12 }}>Recadrage — Photo {cropIdx + 1}</div>
              <ImageCropper
                src={photos[cropIdx]}
                onPreview={crop => updateCrop(cropIdx, crop)}
                onCrop={crop => updateCrop(cropIdx, crop, true)}
              />
            </div>
          )}
        </div>
      )}
    </div>
  )
}
// ── ImageCropper ───────────────────────────────────────────────────────────────

function ImageCropper({ src, onCrop, onPreview }: { src: string; onCrop: (position: { x: number; y: number; scale: number }) => void; onPreview?: (position: { x: number; y: number; scale: number }) => void }) {
  const [pos, setPos] = useState({ x: 0, y: 0 })
  const [scale, setScale] = useState(1)
  const [dragging, setDragging] = useState(false)
  const [startPos, setStartPos] = useState({ x: 0, y: 0 })

  const updatePos = (newPos: { x: number; y: number }) => {
    setPos(newPos)
    onPreview?.({ x: newPos.x, y: newPos.y, scale })
  }
  const updateScale = (newScale: number) => {
    setScale(newScale)
    onPreview?.({ x: pos.x, y: pos.y, scale: newScale })
  }

  const handleMouseDown = (e: React.MouseEvent) => {
    setDragging(true)
    setStartPos({ x: e.clientX - pos.x, y: e.clientY - pos.y })
  }
  const handleMouseMove = (e: React.MouseEvent) => {
    if (!dragging) return
    updatePos({ x: e.clientX - startPos.x, y: e.clientY - startPos.y })
  }
  const handleTouchStart = (e: React.TouchEvent) => {
    setDragging(true)
    setStartPos({ x: e.touches[0].clientX - pos.x, y: e.touches[0].clientY - pos.y })
  }
  const handleTouchMove = (e: React.TouchEvent) => {
    if (!dragging) return
    e.preventDefault()
    updatePos({ x: e.touches[0].clientX - startPos.x, y: e.touches[0].clientY - startPos.y })
  }

  return (
    <div style={{ textAlign: 'center' }}>
      <p style={{ fontSize: 12, color: '#9ca3af', marginBottom: 8 }}>🖐️ Glisse la photo pour cadrer, utilise le slider pour zoomer</p>
      <div style={{ width: 240, height: 320, overflow: 'hidden', border: '2px solid #C9A84C', borderRadius: 8, margin: '0 auto 12px', cursor: dragging ? 'grabbing' : 'grab', position: 'relative', userSelect: 'none' }}
        onMouseDown={handleMouseDown} onMouseMove={handleMouseMove}
        onMouseUp={() => setDragging(false)} onMouseLeave={() => setDragging(false)}
        onTouchStart={handleTouchStart} onTouchMove={handleTouchMove} onTouchEnd={() => setDragging(false)}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={src} alt="" style={{ position: 'absolute', top: '50%', left: '50%', transform: `translate(calc(-50% + ${pos.x}px), calc(-50% + ${pos.y}px)) scale(${scale})`, transformOrigin: 'center center', minWidth: '100%', minHeight: '100%', width: 'auto', height: 'auto', pointerEvents: 'none', transition: dragging ? 'none' : 'transform 0.1s ease' }} />
        {/* Grille des tiers */}
        <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }}>
          <div style={{ position: 'absolute', left: '33%', top: 0, bottom: 0, borderLeft: '1px solid rgba(255,255,255,0.3)' }} />
          <div style={{ position: 'absolute', left: '66%', top: 0, bottom: 0, borderLeft: '1px solid rgba(255,255,255,0.3)' }} />
          <div style={{ position: 'absolute', top: '33%', left: 0, right: 0, borderTop: '1px solid rgba(255,255,255,0.3)' }} />
          <div style={{ position: 'absolute', top: '66%', left: 0, right: 0, borderTop: '1px solid rgba(255,255,255,0.3)' }} />
        </div>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, maxWidth: 240, margin: '0 auto 4px' }}>
        <span style={{ fontSize: 11, color: '#9ca3af' }}>🔍</span>
        <input type="range" min="0.3" max="3" step="0.05" value={scale} onChange={e => updateScale(parseFloat(e.target.value))} style={{ flex: 1 }} />
        <span style={{ fontSize: 11, color: '#9ca3af', minWidth: 28, textAlign: 'right' }}>{scale.toFixed(2)}x</span>
      </div>
      <div style={{ fontSize: 10, color: '#c4b5a0', marginBottom: 10 }}>
        {scale < 0.8 ? 'Dézoom' : scale > 1.2 ? 'Zoom' : 'Normal'}
      </div>
      <div style={{ display: 'flex', gap: 8, justifyContent: 'center' }}>
        <button type="button" onClick={() => { setPos({ x: 0, y: 0 }); setScale(1); onPreview?.({ x: 0, y: 0, scale: 1 }) }} style={{ ...BTN, padding: '8px 16px', borderRadius: 20, border: '1px solid #C9A84C', background: 'transparent', color: '#C9A84C', fontSize: 12 }}>Réinitialiser</button>
        <button type="button" onClick={() => onCrop({ x: pos.x, y: pos.y, scale })} style={{ ...BTN, padding: '8px 16px', borderRadius: 20, background: '#C9A84C', color: 'white', border: 'none', fontSize: 12, fontWeight: 500 }}>✓ Valider</button>
      </div>
    </div>
  )
}

function Step3({ data, onChange }: { data: FormData; onChange: (d: Partial<FormData>) => void }) {
  const update = (i: number, u: Partial<Ceremony>) =>
    onChange({ ceremonies: data.ceremonies.map((c, idx) => idx === i ? { ...c, ...u } : c) })
  const add = () => data.ceremonies.length < 6 && onChange({ ceremonies: [...data.ceremonies, { ...defaultCeremony, type: 'Soirée' }] })
  const remove = (i: number) => onChange({ ceremonies: data.ceremonies.filter((_, idx) => idx !== i) })

  return (
    <div>
      <h2 style={{ textAlign: 'center', fontSize: 22, fontWeight: 600, color: '#4a3728', marginBottom: 24 }}>Les cérémonies</h2>
      {data.ceremonies.map((c, i) => (
        <div key={i} style={{ background: '#fdf8f9', borderRadius: 12, padding: 20, marginBottom: 16 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
            <span style={{ fontSize: 11, color: '#C9A84C', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em' }}>Événement {i + 1}</span>
            {data.ceremonies.length > 1 && (
              <button type="button" onClick={() => remove(i)} style={{ ...BTN, background: 'none', border: 'none', color: '#fb7185', fontSize: 12 }}>Supprimer</button>
            )}
          </div>
          <Label>Type</Label>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 16 }}>
            {CEREMONY_TYPES.map(t => (
              <button key={t} type="button" onClick={() => update(i, { type: t })} style={{
                ...BTN,
                padding: '6px 14px', borderRadius: 9999, fontSize: 12,
                border: '1px solid #C9A84C',
                background: c.type === t ? '#C9A84C' : 'transparent',
                color: c.type === t ? 'white' : '#C9A84C',
              }}>{t}</button>
            ))}
          </div>
          {c.type === 'Autre' && <Field label="Nom de l'événement" value={c.customName} onChange={v => update(i, { customName: v })} />}
          <Field label="Lieu / Salle" value={c.lieu} onChange={v => update(i, { lieu: v })} placeholder="Château de Vincennes" />
          <Field label="Adresse (optionnel)" value={c.adresse} onChange={v => update(i, { adresse: v })} />
          <div style={{ display: 'flex', gap: 12 }}>
            <Field label="Date" value={c.date} onChange={v => update(i, { date: v })} type="date" />
            <Field label="Heure" value={c.heure} onChange={v => update(i, { heure: v })} type="time" />
          </div>
          {c.type === 'Mairie' && (
            <div>
              <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer', fontSize: 13, color: '#4a3728' }}>
                <input type="checkbox" checked={c.suiviDAutre} onChange={e => update(i, { suiviDAutre: e.target.checked })} />
                Suivi d'un autre événement ?
              </label>
              {c.suiviDAutre && (
                <div style={{ marginTop: 10 }}>
                  <Field label="After Mairie" value={c.evenementSuivantNom} onChange={v => update(i, { evenementSuivantNom: v })} placeholder="ex: Cocktail, Vin d'honneur..." />
                  <Field label="Adresse (optionnel)" value={c.evenementSuivantAdresse} onChange={v => update(i, { evenementSuivantAdresse: v })} />
                </div>
              )}
            </div>
          )}
          <div style={{ marginTop: 4 }}>
            <Label>Note pour cet événement (optionnel)</Label>
            <textarea value={c.note} onChange={e => update(i, { note: e.target.value })}
              placeholder="ex: Tenue de soirée exigée / Parking disponible / Entrée par la rue de..."
              rows={2} style={{ ...S.input, resize: 'vertical', minHeight: 56, fontFamily: 'inherit', fontSize: 13 }} />
          </div>

          {/* ── Infos transport / hébergement (optionnel) ── */}
          <div style={{ marginTop: 16, paddingTop: 16, borderTop: '1px dashed #fecdd3' }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer', fontSize: 13, color: '#4a3728' }}>
              <input
                type="checkbox"
                checked={c.infosTransportActif}
                onChange={e => update(i, { infosTransportActif: e.target.checked })}
              />
              ➕ Ajouter des infos transport / hébergement
            </label>
            {c.infosTransportActif && (
              <div style={{ marginTop: 12 }}>
                <Label>🚌 Transport (optionnel)</Label>
                <textarea
                  value={c.transport}
                  onChange={e => update(i, { transport: e.target.value })}
                  placeholder="ex: Un car partira de la gare de Lyon à 14h, retour prévu à 2h. Inscription auprès de Sarah au 06..."
                  rows={3}
                  style={{ ...S.input, resize: 'vertical', minHeight: 70, fontFamily: 'inherit', fontSize: 13, marginBottom: 12 }}
                />
                <Label>🏨 Hébergement (optionnel)</Label>
                <textarea
                  value={c.hebergement}
                  onChange={e => update(i, { hebergement: e.target.value })}
                  placeholder="ex: Hôtel partenaire : Hôtel Le Domaine — code LOVIT pour -15% — réservations sur leur site..."
                  rows={3}
                  style={{ ...S.input, resize: 'vertical', minHeight: 70, fontFamily: 'inherit', fontSize: 13 }}
                />
              </div>
            )}
          </div>

          {/* ── Pensées pour les défunts (Houppa uniquement) ── */}
          {c.type === 'Cérémonie religieuse / Houppa' && (
            <div style={{ marginTop: 16, paddingTop: 16, borderTop: '1px dashed #fecdd3' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer', fontSize: 13, color: '#4a3728' }}>
                <input
                  type="checkbox"
                  checked={c.penseesDefuntsActif}
                  onChange={e => update(i, { penseesDefuntsActif: e.target.checked })}
                />
                🕯 En mémoire de proches disparus
              </label>
              {c.penseesDefuntsActif && (
                <div style={{ marginTop: 14 }}>
                  <Label>Formule introductive</Label>
                  <select
                    value={c.penseesDefuntsIntro}
                    onChange={e => update(i, { penseesDefuntsIntro: e.target.value })}
                    style={{ ...S.input, marginBottom: 8 }}
                  >
                    <option value="Zihrona Levraha — Que leur mémoire soit une bénédiction">Zihrona Levraha — Que leur mémoire soit une bénédiction</option>
                    <option value="En mémoire bénie de">En mémoire bénie de</option>
                    <option value="Avec une pensée pour ceux qui veillent sur nous">Avec une pensée pour ceux qui veillent sur nous</option>
                    <option value="Cette journée est aussi la leur">Cette journée est aussi la leur</option>
                    <option value="">— Personnalisée (écrire ci-dessous) —</option>
                  </select>
                  <input
                    type="text"
                    value={c.penseesDefuntsIntro}
                    onChange={e => update(i, { penseesDefuntsIntro: e.target.value })}
                    placeholder="Ou écrivez votre propre formule..."
                    style={{ ...S.input, marginBottom: 14, fontSize: 13 }}
                  />

                  <Label>Noms des proches disparus (ז״ל ajouté automatiquement)</Label>
                  {c.penseesDefuntsNoms.map((nom, nomIdx) => (
                    <div key={nomIdx} style={{ display: 'flex', gap: 6, marginBottom: 8 }}>
                      <input
                        type="text"
                        value={nom}
                        onChange={e => {
                          const newNoms = [...c.penseesDefuntsNoms]
                          newNoms[nomIdx] = e.target.value
                          update(i, { penseesDefuntsNoms: newNoms })
                        }}
                        placeholder="ex: Léa Cohen, grand-mère du marié"
                        style={{ ...S.input, flex: 1, fontSize: 13 }}
                      />
                      <button
                        type="button"
                        onClick={() => {
                          const newNoms = c.penseesDefuntsNoms.filter((_, j) => j !== nomIdx)
                          update(i, { penseesDefuntsNoms: newNoms })
                        }}
                        style={{ ...BTN, padding: '0 12px', borderRadius: 8, border: '1px solid #fecdd3', background: 'white', cursor: 'pointer', fontSize: 14 }}
                        title="Supprimer ce nom"
                      >
                        🗑
                      </button>
                    </div>
                  ))}
                  <button
                    type="button"
                    onClick={() => update(i, { penseesDefuntsNoms: [...c.penseesDefuntsNoms, ''] })}
                    style={{ ...BTN, marginTop: 4, marginBottom: 14, padding: '8px 14px', borderRadius: 8, border: '1px dashed #C9A84C', background: 'transparent', color: '#C9A84C', cursor: 'pointer', fontSize: 12, fontWeight: 500 }}
                  >
                    + Ajouter un nom
                  </button>

                  <Label>Phrase de fin (optionnelle)</Label>
                  <select
                    value={c.penseesDefuntsFin}
                    onChange={e => update(i, { penseesDefuntsFin: e.target.value })}
                    style={{ ...S.input, marginBottom: 8 }}
                  >
                    <option value="">— Aucune —</option>
                    <option value="Présents dans nos cœurs en ce jour">Présents dans nos cœurs en ce jour</option>
                    <option value="Veillant sur notre union depuis là-haut">Veillant sur notre union depuis là-haut</option>
                    <option value="Que leur âme repose en paix">Que leur âme repose en paix</option>
                    <option value="Toujours dans nos pensées">Toujours dans nos pensées</option>
                  </select>
                  <input
                    type="text"
                    value={c.penseesDefuntsFin}
                    onChange={e => update(i, { penseesDefuntsFin: e.target.value })}
                    placeholder="Ou écrivez votre propre phrase..."
                    style={{ ...S.input, fontSize: 13 }}
                  />
                </div>
              )}
            </div>
          )}
        </div>
      ))}
      {data.ceremonies.length < 6 && (
        <button type="button" onClick={add} style={{
          ...BTN,
          width: '100%', padding: 12, border: '2px dashed #C9A84C', borderRadius: 10,
          background: 'transparent', color: '#C9A84C', fontSize: 14,
        }}>+ Ajouter un événement</button>
      )}
    </div>
  )
}

function CustomLogoUpload({ logoUrl, logoSize = 100, logoColor = '', onChange, accent }: { logoUrl?: string; logoSize?: number; logoColor?: string; onChange: (d: Partial<FormData>) => void; accent: string }) {
  const [uploading, setUploading] = useState(false)

  const removeBackground = (file: File): Promise<Blob> => {
    return new Promise((resolve, reject) => {
      const img = new Image()
      img.onload = () => {
        const canvas = document.createElement('canvas')
        canvas.width = img.width
        canvas.height = img.height
        const ctx = canvas.getContext('2d')
        if (!ctx) { reject(new Error('Canvas non supporté')); return }
        ctx.drawImage(img, 0, 0)
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height)
        const d = imageData.data

        // Détecter la couleur de fond (pixel en haut à gauche)
        const bgR = d[0], bgG = d[1], bgB = d[2]

        // Seuil de tolérance pour la suppression du fond
        const tolerance = 45

        for (let i = 0; i < d.length; i += 4) {
          const dr = Math.abs(d[i] - bgR)
          const dg = Math.abs(d[i + 1] - bgG)
          const db = Math.abs(d[i + 2] - bgB)
          if (dr < tolerance && dg < tolerance && db < tolerance) {
            // Rendre transparent progressivement (plus le pixel est proche du fond, plus il est transparent)
            const maxDiff = Math.max(dr, dg, db)
            d[i + 3] = Math.round((maxDiff / tolerance) * 255)
          }
        }
        ctx.putImageData(imageData, 0, 0)
        canvas.toBlob(blob => blob ? resolve(blob) : reject(new Error('Erreur conversion')), 'image/png')
      }
      img.onerror = () => reject(new Error('Erreur chargement image'))
      img.src = URL.createObjectURL(file)
    })
  }

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    if (file.size > 5 * 1024 * 1024) { alert('Le fichier est trop lourd (max 5 Mo)'); return }
    setUploading(true)
    try {
      // Supprimer le fond côté client avant upload
      const transparentBlob = await removeBackground(file)

      const fd = new (globalThis.FormData)()
      fd.append('file', transparentBlob)
      fd.append('upload_preset', 'wedding_music')
      const res = await fetch('https://api.cloudinary.com/v1_1/dau96mui2/upload', { method: 'POST', body: fd })
      const json = await res.json()
      if (json.secure_url) {
        // Forcer le format PNG dans l'URL pour préserver la transparence
        const pngUrl = json.secure_url.replace(/\.\w+$/, '.png')
        onChange({ customLogoUrl: pngUrl })
      }
    } catch { alert('Erreur lors de l\'upload du logo') }
    finally { setUploading(false) }
    e.target.value = ''
  }

  if (logoUrl) {
    const LOGO_COLORS = [
      { value: '', label: 'Original', swatch: '' },
      { value: '#000000', label: 'Noir', swatch: '#000000' },
      { value: '#C9A84C', label: 'Doré', swatch: '#C9A84C' },
      { value: '#FFFFFF', label: 'Blanc', swatch: '#FFFFFF' },
      { value: '#D4A5A5', label: 'Rose', swatch: '#D4A5A5' },
      { value: '#1B2845', label: 'Marine', swatch: '#1B2845' },
      { value: '#7A9E6E', label: 'Sauge', swatch: '#7A9E6E' },
    ]
    const previewSize = 120 * (logoSize / 100)
    return (
      <div style={{ textAlign: 'center' }}>
        <p style={{ fontSize: 12, fontWeight: 600, color: '#4a3728', marginBottom: 8 }}>Votre logo</p>
        <div style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: 160, height: 160, borderRadius: 8, border: '1px solid #e5d5c5', background: 'repeating-conic-gradient(#f0f0f0 0% 25%, white 0% 50%) 0 0 / 16px 16px' }}>
          <img src={logoColor && logoUrl?.includes('cloudinary.com') ? logoUrl.replace('/upload/', `/upload/e_colorize:100,co_rgb:${logoColor.replace('#', '')}/`) : logoUrl!} alt="Logo" style={{ width: previewSize, height: previewSize, objectFit: 'contain' }} />
        </div>

        {/* Réglages avancés */}
        <div style={{ marginTop: 16, padding: '14px 16px', border: '1px solid #e5d5c5', borderRadius: 12, background: '#fefcf8', textAlign: 'left' }}>
          <p style={{ fontSize: 11, fontWeight: 600, color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 12 }}>Réglages avancés</p>

          {/* Taille */}
          <div style={{ marginBottom: 14 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
              <span style={{ fontSize: 12, color: '#4a3728' }}>Taille</span>
              <span style={{ fontSize: 11, color: '#9ca3af' }}>{logoSize}%</span>
            </div>
            <input type="range" min={50} max={150} step={5} value={logoSize} onChange={e => onChange({ customLogoSize: Number(e.target.value) })} style={{ width: '100%', accentColor: accent }} />
          </div>

          {/* Couleur */}
          <div>
            <span style={{ fontSize: 12, color: '#4a3728', display: 'block', marginBottom: 8 }}>Couleur</span>
            <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
              {LOGO_COLORS.map(opt => {
                const sel = logoColor === opt.value
                return (
                  <button key={opt.label} type="button" onClick={() => onChange({ customLogoColor: opt.value })} style={{
                    cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3,
                    padding: '4px 6px', borderRadius: 8,
                    border: `2px solid ${sel ? accent : 'transparent'}`,
                    background: sel ? `${accent}12` : 'transparent',
                  }}>
                    {opt.swatch ? (
                      <div style={{ width: 22, height: 22, borderRadius: '50%', background: opt.swatch, border: `1px solid ${opt.swatch === '#FFFFFF' ? '#d1d5db' : opt.swatch}`, boxShadow: sel ? `0 0 0 2px white, 0 0 0 3px ${accent}` : 'none' }} />
                    ) : (
                      <div style={{ width: 22, height: 22, borderRadius: '50%', background: 'conic-gradient(#f87171, #facc15, #34d399, #60a5fa, #a78bfa, #f87171)', border: '1px solid #d1d5db', boxShadow: sel ? `0 0 0 2px white, 0 0 0 3px ${accent}` : 'none' }} />
                    )}
                    <span style={{ fontSize: 9, color: '#4a3728' }}>{opt.label}</span>
                  </button>
                )
              })}
            </div>
          </div>
        </div>

        <div style={{ marginTop: 10 }}>
          <button type="button" onClick={() => onChange({ customLogoUrl: '', customLogoSize: 100, customLogoColor: '' })} style={{ cursor: 'pointer', background: 'transparent', border: `1px solid #fecdd3`, borderRadius: 9999, padding: '6px 16px', fontSize: 11, color: '#fb7185', fontWeight: 600 }}>
            Supprimer mon logo
          </button>
        </div>
      </div>
    )
  }

  return (
    <div style={{ textAlign: 'center' }}>
      <label style={{
        display: 'inline-flex', alignItems: 'center', gap: 8,
        padding: '12px 24px', borderRadius: 10, cursor: uploading ? 'wait' : 'pointer',
        border: `1.5px dashed ${accent}88`, background: `${accent}08`,
        fontSize: 13, color: accent, fontWeight: 600,
        opacity: uploading ? 0.6 : 1,
      }}>
        <span>{uploading ? 'Upload en cours…' : 'Importer mon propre logo'}</span>
        <input type="file" accept="image/png,image/jpg,image/jpeg" onChange={handleLogoUpload} style={{ display: 'none' }} disabled={uploading} />
      </label>
      <p style={{ fontSize: 10, color: '#9ca3af', marginTop: 8, fontStyle: 'italic', lineHeight: 1.5 }}>
        PNG ou JPG, max 5 Mo — le fond sera automatiquement supprimé.<br />
        Pour un meilleur rendu, choisissez un logo simple et élégant, idéalement en noir, doré, ou couleur unie.
      </p>
    </div>
  )
}

function Step4({ data, onChange }: { data: FormData; onChange: (d: Partial<FormData>) => void }) {
  return (
    <div>
      <h2 style={{ textAlign: 'center', fontSize: 22, fontWeight: 600, color: '#4a3728', marginBottom: 24 }}>Style & options</h2>

      <div style={{ marginBottom: 24 }}>
        <Label>Format</Label>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10 }}>
          {([
            {
              key: 'page-unique' as PresentationStyle,
              label: 'Page unique',
              desc: 'Défilement fluide',
              icon: (
                <svg width="36" height="36" viewBox="0 0 36 36" fill="none">
                  <rect x="6" y="4" width="24" height="28" rx="2" stroke="currentColor" strokeWidth="1.5"/>
                  <line x1="10" y1="11" x2="26" y2="11" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/>
                  <line x1="10" y1="15" x2="22" y2="15" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/>
                  <line x1="10" y1="19" x2="24" y2="19" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/>
                  <line x1="10" y1="23" x2="20" y2="23" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/>
                </svg>
              ),
            },
            {
              key: 'cartes-scrollables' as PresentationStyle,
              label: 'Cartes scroll',
              desc: 'Cartes enchaînées',
              icon: (
                <svg width="36" height="36" viewBox="0 0 36 36" fill="none">
                  <rect x="5" y="3" width="22" height="12" rx="2" stroke="currentColor" strokeWidth="1.5"/>
                  <rect x="5" y="18" width="22" height="12" rx="2" stroke="currentColor" strokeWidth="1.5"/>
                  <line x1="30" y1="14" x2="30" y2="22" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                  <polyline points="27,19 30,23 33,19" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              ),
            },
            {
              key: 'cartes-separees' as PresentationStyle,
              label: 'Cartes séparées',
              desc: 'Une carte à la fois',
              icon: (
                <svg width="36" height="36" viewBox="0 0 36 36" fill="none">
                  <rect x="4" y="6" width="20" height="24" rx="2" stroke="currentColor" strokeWidth="1.5"/>
                  <rect x="12" y="4" width="20" height="24" rx="2" stroke="currentColor" strokeWidth="1.5" strokeDasharray="3 2"/>
                </svg>
              ),
            },
          ]).map(opt => {
            const sel = (data.presentationStyle ?? 'page-unique') === opt.key
            return (
              <button key={opt.key} type="button" onClick={() => onChange({ presentationStyle: opt.key })} style={{
                ...BTN, padding: '12px 8px', borderRadius: 12,
                border: `2px solid ${sel ? '#C9A84C' : '#fecdd3'}`,
                background: sel ? '#fdf5e4' : 'white',
                display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6,
              }}>
                <div style={{ color: sel ? '#C9A84C' : '#9ca3af' }}>{opt.icon}</div>
                <div style={{ fontSize: 10, fontWeight: sel ? 700 : 500, color: sel ? '#C9A84C' : '#4a3728', textAlign: 'center', lineHeight: 1.3 }}>{opt.label}</div>
                <div style={{ fontSize: 9, color: '#9ca3af', textAlign: 'center' }}>{opt.desc}</div>
              </button>
            )
          })}
        </div>
      </div>

      <Label>Style visuel</Label>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 8, marginBottom: 16 }}>
        {(Object.entries(THEMES) as [Theme, ThemeObj][]).map(([key, t]) => {
          const sel = data.style === key
          return (
            <button key={key} type="button" onClick={() => onChange({ style: key })} style={{
              ...BTN, padding: 0, borderRadius: 8, overflow: 'hidden',
              border: `2px solid ${sel ? t.accent : '#e8e0d8'}`,
              background: 'transparent', textAlign: 'center',
              boxShadow: sel ? `0 0 0 1px ${t.accent}` : 'none',
            }}>
              <div style={{ background: t.fond, width: '100%', height: 55, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <span style={{ fontFamily: 'var(--font-cormorant-garamond)', fontStyle: 'italic', fontSize: 13, color: t.accent, letterSpacing: 0.5 }}>A &amp; B</span>
              </div>
              <div style={{ padding: '4px 2px 5px', background: sel ? t.accent : '#faf8f6', fontSize: 8, fontWeight: sel ? 700 : 400, color: sel ? 'white' : '#4a3728', lineHeight: 1.2, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                {t.nom}
              </div>
            </button>
          )
        })}
      </div>

      {/* ── Choix du cadre ── */}
      <div style={{ marginBottom: 24 }}>
        <Label>Choisissez votre cadre</Label>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10 }}>
          {FRAMES.map(fr => {
            const accent = THEMES[data.style].accent
            const sel = (data.frameId ?? 'frame-09') === fr.id
            return (
              <button key={fr.id} type="button" onClick={() => onChange({ frameId: fr.id })} style={{
                ...BTN, padding: 8, borderRadius: 10,
                border: `2px solid ${sel ? accent : '#f0e0d0'}`,
                background: sel ? `${accent}10` : 'white',
                display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6,
                boxShadow: sel ? `0 0 0 1px ${accent}` : '0 1px 4px rgba(0,0,0,0.08)',
              }}>
                {fr.url ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={fr.url} alt={fr.label} style={{ width: 80, height: 80, objectFit: 'cover', borderRadius: 6 }} />
                ) : (
                  <div style={{ width: 80, height: 80, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 24, opacity: 0.4, background: '#f5f5f5', borderRadius: 6 }}>✕</div>
                )}
                <span style={{ fontSize: 9, fontWeight: sel ? 700 : 400, color: sel ? accent : '#4a3728', textAlign: 'center', lineHeight: 1.3 }}>{fr.label}</span>
              </button>
            )
          })}
        </div>
      </div>
<div style={{ marginBottom: 24 }}>
  <Label>Animation des textes</Label>
  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8 }}>
    {([
      { key: 'fade',        label: '✨ Fondu' },
      { key: 'slide-up',   label: '⬆️ Monte' },
      { key: 'rideau',     label: '🎞️ Rideau' },
      { key: 'brille',     label: '💫 Brillance' },
      { key: 'deplie',     label: '📜 Déplie' },
      { key: 'flou',       label: '🌫️ Flou' },
      { key: 'slide-left', label: '⬅️ De droite' },
      { key: 'zoom',       label: '🔍 Zoom' },
      { key: 'flip',       label: '🔄 Flip' },
    ] as {key:string;label:string}[]).map(opt => {
      const sel = (data.animationStyle || 'slide-up') === opt.key
      return (
        <button key={opt.key} type="button" onClick={() => onChange({ animationStyle: opt.key })} style={{
          ...BTN, padding: '10px 6px', borderRadius: 10, fontSize: 11, fontWeight: sel ? 700 : 400,
          border: `2px solid ${sel ? THEMES[data.style].accent : '#fecdd3'}`,
          background: sel ? `${THEMES[data.style].accent}15` : 'white',
          color: sel ? THEMES[data.style].accent : '#4a3728',
        }}>{opt.label}</button>
      )
    })}
  </div>
</div>
      {/* ── Monogramme ── */}
      <div style={{ marginBottom: 24 }}>
        <Label>Style du monogramme</Label>
        <p style={{ fontSize: 11, color: '#9ca3af', marginBottom: 10 }}>Aperçu avec vos initiales en temps réel</p>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10, marginBottom: 14 }}>
          {([
            { key: 'cercle',      label: 'Entrelacé Luxe' },
            { key: 'enlace',      label: 'Calligraphie Pure' },
            { key: 'couronne',    label: 'Cercle Élégant' },
            { key: 'branches',    label: 'Vertical Luxe' },
            { key: 'losange',     label: 'Minimaliste Chic' },
            { key: 'minimaliste', label: 'Baroque' },
          ] as { key: string; label: string }[]).map(opt => {
            const sel = (data.monogrammeStyle || 'cercle') === opt.key
            const previewColor = data.monogrammeColor || '#C9A84C'
            const i1 = (data.marie1Prenom || 'A')[0].toUpperCase()
            const i2 = (data.marie2Prenom || 'B')[0].toUpperCase()
            return (
              <button key={opt.key} type="button" onClick={() => onChange({ monogrammeStyle: opt.key })} style={{
                ...BTN,
                padding: '12px 6px 8px',
                borderRadius: 10,
                border: `2px solid ${sel ? '#C9A84C' : '#fecdd3'}`,
                background: sel ? '#fdf5e4' : 'white',
                display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'space-between', gap: 6,
                minHeight: 110, overflow: 'hidden',
              }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', flex: 1, minHeight: 80 }}>
                  <MonogramByStyle initial1={i1} initial2={i2} color={previewColor} size={80} style={opt.key} />
                </div>
                <span style={{ fontSize: 9, color: sel ? '#C9A84C' : '#6a5040', fontWeight: sel ? 700 : 400, textAlign: 'center', lineHeight: 1.3 }}>{opt.label}</span>
              </button>
            )
          })}
        </div>
        <Label>Couleur du monogramme</Label>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginTop: 8 }}>
          {([
            { value: '',        label: 'Thème',    swatch: '#C9A84C' },
            { value: '#C9A84C', label: 'Doré',     swatch: '#C9A84C' },
            { value: '#9e9e9e', label: 'Argent',   swatch: '#9e9e9e' },
            { value: '#d4829a', label: 'Rose',     swatch: '#d4829a' },
            { value: '#8b0000', label: 'Bordeaux', swatch: '#8b0000' },
            { value: '#1a1a1a', label: 'Noir',     swatch: '#1a1a1a' },
          ] as { value: string; label: string; swatch: string }[]).map(opt => {
            const sel = (data.monogrammeColor ?? '') === opt.value
            return (
              <button key={opt.label} type="button" onClick={() => onChange({ monogrammeColor: opt.value })} style={{
                ...BTN,
                display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4,
                padding: '6px 10px', borderRadius: 8,
                border: `2px solid ${sel ? opt.swatch : 'transparent'}`,
                background: sel ? `${opt.swatch}18` : 'transparent',
              }}>
                <div style={{ width: 22, height: 22, borderRadius: '50%', background: opt.swatch, border: `1px solid ${opt.swatch}66`, boxShadow: sel ? `0 0 0 2px white, 0 0 0 3px ${opt.swatch}` : 'none' }} />
                <span style={{ fontSize: 10, color: '#4a3728' }}>{opt.label}</span>
              </button>
            )
          })}
        </div>
        {/* ── Logo personnalisé ── */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, margin: '18px 0 10px' }}>
          <div style={{ flex: 1, height: 1, background: '#e5d5c5' }} />
          <span style={{ fontSize: 12, color: '#9ca3af', fontStyle: 'italic' }}>ou</span>
          <div style={{ flex: 1, height: 1, background: '#e5d5c5' }} />
        </div>
        <CustomLogoUpload logoUrl={data.customLogoUrl} logoSize={data.customLogoSize} logoColor={data.customLogoColor} onChange={onChange} accent={THEMES[data.style].accent} />
      </div>

      <label style={{ display: 'flex', alignItems: 'center', gap: 10, padding: 14, border: '1px solid #fecdd3', borderRadius: 10, cursor: 'pointer', marginBottom: 20, fontSize: 14, color: '#4a3728' }}>
        <input type="checkbox" checked={data.mariageJuif} onChange={e => onChange({ mariageJuif: e.target.checked })} />
        Mariage juif ✡
      </label>
      <div style={{ marginBottom: 20 }}>
        <Label>Musique de fond — Fichier MP3</Label>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
          <p style={{ fontSize: 11, color: '#9ca3af', margin: 0, flex: 1 }}>Convertissez votre chanson en MP3, puis uploadez-la ici</p>
          <a href="https://yt2mp3.gs" target="_blank" rel="noopener noreferrer" style={{
            display: 'inline-flex', alignItems: 'center', gap: 5,
            padding: '7px 14px', borderRadius: 9999,
            background: 'linear-gradient(135deg, #C9A84C, #e8c96a)',
            color: 'white', fontSize: 12, fontWeight: 600,
            textDecoration: 'none', whiteSpace: 'nowrap',
            boxShadow: '0 2px 10px #C9A84C44',
            fontFamily: 'var(--font-playfair-display)',
          }}>
            🎵 Télécharger en MP3
          </a>
        </div>
        <MusicUploader musicUrl={data.musicUrl ?? ''} musicName={data.musicName} onChange={(url, name) => onChange({ musicUrl: url, musicName: name ?? '' })} />
      </div>
      <StyleAccueilSelector data={data} onChange={onChange} />
      <PhotoSection data={data} onChange={onChange} />
      <div style={{ marginTop: 20 }}>
        <Label>Votre email (notifications RSVP)</Label>
        <p style={{ fontSize: 11, color: '#9ca3af', marginBottom: 8 }}>Recevez une notification à chaque nouvelle réponse RSVP</p>
        <input type="email" value={data.emailMaries ?? ''} onChange={e => onChange({ emailMaries: e.target.value })} placeholder="marie@exemple.com" style={S.input} />
      </div>
    </div>
  )
}

function MairieIllustration({ color }: { color: string }) {
  return (
    <svg viewBox="0 0 200 120" width="140" height="84" xmlns="http://www.w3.org/2000/svg">
      <rect x="10" y="92" width="180" height="7" fill={color} opacity="0.7" />
      <rect x="40" y="52" width="120" height="44" fill="none" stroke={color} strokeWidth="1.5" />
      {[56, 74, 92, 110, 128].map(x => <rect key={x} x={x} y="52" width="4" height="44" fill={color} opacity="0.5" />)}
      <polygon points="28,52 100,14 172,52" fill="none" stroke={color} strokeWidth="1.5" />
      <path d="M 87 96 L 87 68 Q 100 58 113 68 L 113 96 Z" fill="none" stroke={color} strokeWidth="1.2" />
      <rect x="50" y="60" width="16" height="14" rx="2" fill="none" stroke={color} strokeWidth="1" />
      <rect x="134" y="60" width="16" height="14" rx="2" fill="none" stroke={color} strokeWidth="1" />
      <line x1="100" y1="4" x2="100" y2="14" stroke={color} strokeWidth="1.5" />
      <circle cx="100" cy="33" r="3" fill={color} opacity="0.4" />
    </svg>
  )
}

type ThemeObj = { fond: string; pageFond?: string; accent: string; texte: string; textSecondaire: string; nom: string; carteBordure?: string; dark?: boolean }
interface CardProps { ceremony: Ceremony; data: FormData; theme: ThemeObj; isShared?: boolean; cardIdx?: number }


function OrnementCorner({ url, corner, size = 130 }: {
  url: string
  corner: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right'
  size?: number
}) {
  if (!url) return null
  const positions: Record<string, React.CSSProperties> = {
    'top-left':     { top: 0, left: 0, transform: 'none' },
    'top-right':    { top: 0, right: 0, transform: 'scaleX(-1)' },
    'bottom-left':  { bottom: 0, left: 0, transform: 'scaleY(-1)' },
    'bottom-right': { bottom: 0, right: 0, transform: 'scale(-1)' },
  }
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img src={url} alt="" style={{ position: 'absolute', ...positions[corner], width: size, height: size, objectFit: 'contain', pointerEvents: 'none', zIndex: 0, opacity: 0.9 } as React.CSSProperties} />
  )
}

function CardFrameWrapper({ frameId, ornamentId, themeCardBg, frameOpacity = 1, frameSize = 100, framePaddingV = 22, framePaddingH = 18, textOpacity = 1, textBg = 0.5, children }: {
  frameId: string; ornamentId: string; themeCardBg: string
  frameOpacity?: number; frameSize?: number; framePaddingV?: number; framePaddingH?: number; textOpacity?: number; textBg?: number
  children: React.ReactNode
}) {
  const frame = FRAMES.find(f => f.id === frameId) ?? FRAMES[FRAMES.length - 1]
  const hasFrame = !!frame.url
  const ornUrl = hasFrame ? '' : (ORNEMENTS_LIBRARY.find(o => o.id === ornamentId)?.url ?? '')
  return (
    <div style={{ position: 'relative', width: '100%', margin: 0, padding: 0, background: hasFrame ? '#ffffff' : themeCardBg }}>
      {hasFrame && (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={frame.url!} alt="" style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', objectFit: 'cover', mixBlendMode: 'multiply', opacity: frameOpacity, transform: `scale(${frameSize / 100})`, transformOrigin: 'center center', pointerEvents: 'none', zIndex: 1 } as React.CSSProperties} />
      )}
      <OrnementCorner url={ornUrl} corner="top-right" size={130} />
      <OrnementCorner url={ornUrl} corner="bottom-left" size={130} />
      <div style={{ position: 'relative', zIndex: 10, paddingTop: `${framePaddingV}%`, paddingBottom: `${framePaddingV}%`, paddingLeft: `${framePaddingH}%`, paddingRight: `${framePaddingH}%`, textAlign: 'center', opacity: textOpacity, background: undefined, borderRadius: undefined, }}>
        {children}
      </div>
    </div>
  )
}

function CeremoniesDivider({ themeAccent }: { themeAccent: string }) {
  return (
    <div style={{ maxWidth: 600, margin: '0 auto', display: 'flex', alignItems: 'center', gap: 12, padding: '20px 24px' }}>
      <div style={{ flex: 1, height: 1, background: themeAccent, opacity: 0.3 }} />
      <span style={{ color: themeAccent }}>✦</span>
      <div style={{ flex: 1, height: 1, background: themeAccent, opacity: 0.3 }} />
    </div>
  )
}

function CarouselBackground({ photos, fond, isOriental, children }: {
  photos: string[],
  fond: string,
  isOriental: boolean,
  children: React.ReactNode
}) {
  const validPhotos = photos.filter(p => p && p.length > 0)
  const [idx, setIdx] = useState(0)
  const [visible, setVisible] = useState(true)

  useEffect(() => {
    if (validPhotos.length <= 1) return
    const interval = setInterval(() => {
      setVisible(false)
      setTimeout(() => {
        setIdx(prev => (prev + 1) % validPhotos.length)
        setVisible(true)
      }, 600)
    }, 4000)
    return () => clearInterval(interval)
  }, [validPhotos.length])

  const overlay = isOriental ? 'rgba(26,10,0,0.82)' : 'rgba(255,255,255,0.85)'

  return (
    <div style={{ position: 'relative', overflow: 'hidden', backgroundColor: fond }}>
      {validPhotos.length > 0 && (
        <>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={validPhotos[idx]}
            alt=""
            style={{
              position: 'absolute',
              inset: 0,
              width: '100%',
              height: '100%',
              objectFit: 'cover',
              opacity: visible ? 1 : 0,
              transition: 'opacity 0.6s ease',
            }}
          />
          <div style={{
            position: 'absolute',
            inset: 0,
            backgroundColor: overlay,
            opacity: visible ? 1 : 0,
            transition: 'opacity 0.6s ease',
          }} />
        </>
      )}
      {validPhotos.length > 1 && (
        <div style={{
          position: 'absolute',
          bottom: 12,
          left: '50%',
          transform: 'translateX(-50%)',
          display: 'flex',
          gap: 6,
          zIndex: 10,
        }}>
          {validPhotos.map((_, i) => (
            <div key={i} style={{
              width: 6,
              height: 6,
              borderRadius: '50%',
              backgroundColor: i === idx ? '#C9A84C' : 'rgba(255,255,255,0.6)',
              transition: 'background 0.3s',
            }} />
          ))}
        </div>
      )}
      <div style={{ position: 'relative', zIndex: 1 }}>{children}</div>
    </div>
  )
}

// ── ItineraireButtons : Google Maps + Waze avec design luxe ───────────────────

function ItineraireButtons({ adresse, theme, compact = false }: { 
  adresse: string
  theme: ThemeObj
  compact?: boolean 
}) {
  const encoded = encodeURIComponent(adresse)
  const googleUrl = `https://www.google.com/maps/search/?api=1&query=${encoded}`
  const wazeUrl = `https://waze.com/ul?q=${encoded}&navigate=yes`
  
  const primaryBtn: React.CSSProperties = {
    display: 'inline-flex',
    alignItems: 'center',
    gap: 8,
    padding: compact ? '10px 20px' : '12px 26px',
    background: theme.accent,
    color: 'white',
    fontFamily: 'var(--font-playfair-display)',
    fontSize: compact ? 12 : 13,
    fontWeight: 600,
    letterSpacing: 2,
    textTransform: 'uppercase',
    textDecoration: 'none',
    borderRadius: 2,
    boxShadow: `0 4px 14px ${theme.accent}44`,
    border: `1px solid ${theme.accent}`,
    transition: 'all 0.2s ease',
  }
  
  const secondaryBtn: React.CSSProperties = {
    display: 'inline-flex',
    alignItems: 'center',
    gap: 8,
    padding: compact ? '10px 20px' : '12px 26px',
    background: 'transparent',
    color: theme.accent,
    fontFamily: 'var(--font-playfair-display)',
    fontSize: compact ? 12 : 13,
    fontWeight: 600,
    letterSpacing: 2,
    textTransform: 'uppercase',
    textDecoration: 'none',
    borderRadius: 2,
    border: `1px solid ${theme.accent}`,
    transition: 'all 0.2s ease',
  }

  return (
    <div style={{ display: 'flex', gap: 10, justifyContent: 'center', flexWrap: 'wrap' }}>
      <a href={googleUrl} target="_blank" rel="noopener noreferrer" style={primaryBtn}>
        <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
          <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5a2.5 2.5 0 010-5 2.5 2.5 0 010 5z"/>
        </svg>
        Google Maps
      </a>
      <a href={wazeUrl} target="_blank" rel="noopener noreferrer" style={secondaryBtn}>
        <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
          <path d="M20.54 6.63c-.83-1.2-1.96-2.18-3.31-2.83C15.88 3.2 14.4 2.88 12.92 3c-1.48.12-2.92.65-4.14 1.54-1.22.89-2.22 2.11-2.86 3.53-.63 1.43-.89 3.01-.72 4.57.17 1.56.76 3.05 1.7 4.3.94 1.26 2.22 2.23 3.68 2.82 1.46.58 3.08.76 4.64.51 1.56-.25 3.04-.91 4.24-1.93 1.2-1.01 2.08-2.35 2.54-3.84.46-1.49.48-3.09.06-4.59-.42-1.51-1.24-2.87-2.38-3.94zM8.5 12.5c-.55 0-1-.45-1-1s.45-1 1-1 1 .45 1 1-.45 1-1 1zm7 0c-.55 0-1-.45-1-1s.45-1 1-1 1 .45 1 1-.45 1-1 1zm-3.5 3.5c-1.5 0-2.8-.9-3.4-2.2l1.4-.3c.4.7 1.2 1.2 2 1.2s1.6-.5 2-1.2l1.4.3c-.6 1.3-1.9 2.2-3.4 2.2z"/>
        </svg>
        Waze
      </a>
    </div>
  )
}

function CardHouppa({ ceremony, data, theme, isShared, cardIdx }: CardProps) {
  const gpPa1 = fmtGpCouple(data.famille1GpPaPerePrenom, data.famille1GpPaPereNom, data.famille1GpPaMerePrenom, data.famille1GpPaMereNom)
  const gpMa1 = fmtGpCouple(data.famille1GpMaPerePrenom, data.famille1GpMaPereNom, data.famille1GpMaMerePrenom, data.famille1GpMaMereNom)
  const gpPa2 = fmtGpCouple(data.famille2GpPaPerePrenom, data.famille2GpPaPereNom, data.famille2GpPaMerePrenom, data.famille2GpPaMereNom)
  const gpMa2 = fmtGpCouple(data.famille2GpMaPerePrenom, data.famille2GpMaPereNom, data.famille2GpMaMerePrenom, data.famille2GpMaMereNom)
  const hasGp = gpPa1 || gpMa1 || gpPa2 || gpMa2
  const parents1 = fmtParentsLines(data.famille1PerePrenom, data.famille1PereNom, data.famille1MerePrenom, data.famille1MereNom)
  const parents2 = fmtParentsLines(data.famille2PerePrenom, data.famille2PereNom, data.famille2MerePrenom, data.famille2MereNom)
  const hebrewDate = getHebrewDate(ceremony.date)
  const ov = data.textOverrides ?? {}
  const ci = cardIdx ?? 0
  const titre = ov[`ceremony_${ci}_titre`] || (data.mariageJuif ? 'Houppa & Soirée' : 'Cérémonie religieuse & Soirée')
  const joie = ov[`ceremony_${ci}_joie`] || (hasGp ? 'Ont la joie de vous faire part du mariage de leurs petits-enfants et enfants' : 'Ont la joie de vous faire part du mariage de leurs enfants')
  const honore = ov[`ceremony_${ci}_honore`] || 'et seront honorés de votre présence à la cérémonie religieuse qui sera célébrée le'
  const lieuDisplay = ov[`ceremony_${ci}_lieu`] || ceremony.lieu
  return (
    <CardFrameWrapper frameId={data.frameId ?? 'frame-09'} ornamentId={data.ornamentId ?? 'none'} themeCardBg={THEME_CARD_BG[data.style] ?? '#ffffff'} frameOpacity={data.frameOpacity ?? 1} frameSize={data.frameSize ?? 100} framePaddingV={data.framePaddingV ?? 22} framePaddingH={data.framePaddingH ?? 18} textOpacity={data.textOpacity ?? 1} textBg={data.textBg ?? 0.5}>
      <div style={{ position: 'relative' }}>
        {data.mariageJuif && <div style={{ position: 'absolute', top: '22%', right: '18%', fontSize: 13, fontFamily: 'serif', color: theme.accent, direction: 'rtl', opacity: 0.85, zIndex: 20 }}>בס״ד</div>}
        <div style={{ fontSize: 'small', letterSpacing: '3px', textTransform: 'uppercase', color: theme.accent, textAlign: 'center', marginBottom: 16 }}>La Houppa</div>
        <LogoOrMonogram data={data} theme={theme} />
        {data.mariageJuif && (
          <div style={{ marginBottom: 24 }}>
            <div style={{ height: 1, background: theme.accent, opacity: 0.35, marginBottom: 12 }} />
            <div style={{ fontFamily: 'serif', fontSize: 'clamp(10px, 3.5vw, 16px)', color: theme.accent, direction: 'rtl', textAlign: 'center', lineHeight: 1.9, whiteSpace: 'nowrap', background: 'rgba(255,255,255,0.75)', borderRadius: 6, padding: '4px 14px', display: 'inline-block', width: '100%', boxSizing: 'border-box' }}>
              קוֹל שָׂשׂוֹן וְקוֹל שִׂמְחָה, קוֹל חָתָן וְקוֹל כַּלָּה
            </div>
            <div style={{ height: 1, background: theme.accent, opacity: 0.35, marginTop: 12 }} />
          </div>
        )}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr auto 1fr', gap: 12, marginBottom: 24, alignItems: 'start' }}>
          <div style={{ fontFamily: 'var(--font-cormorant-garamond)', fontStyle: 'italic', fontSize: 13, color: theme.accent, lineHeight: 2 }}>
            {parents1.map((l, i) => <div key={i}>{l}</div>)}
            {gpPa1 && <div>{gpPa1}</div>}
            {gpMa1 && <div>{gpMa1}</div>}
          </div>
          <div style={{ width: 1, background: theme.accent, opacity: 0.3, alignSelf: 'stretch', minHeight: 40 }} />
          <div style={{ fontFamily: 'var(--font-cormorant-garamond)', fontStyle: 'italic', fontSize: 13, color: theme.accent, textAlign: 'right', lineHeight: 2 }}>
            {parents2.map((l, i) => <div key={i}>{l}</div>)}
            {gpPa2 && <div>{gpPa2}</div>}
            {gpMa2 && <div>{gpMa2}</div>}
          </div>
        </div>
        <div style={{ fontFamily: 'var(--font-cormorant-garamond)', fontStyle: 'italic', fontSize: 22, textAlign: 'center', color: theme.texte, marginBottom: 24, lineHeight: 1.5 }}>
          {joie}
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr auto 1fr', alignItems: 'center', gap: 8, marginBottom: 24 }}>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontFamily: 'var(--font-great-vibes)', fontSize: 'clamp(32px, 10vw, 68px)', color: theme.accent, lineHeight: 1.1 }}>{data.marie1Prenom || 'Prénom'}</div>
            {data.marie1Prenom2 && <div style={{ fontSize: 11, letterSpacing: 2, color: theme.textSecondaire, marginTop: 4 }}>{data.marie1Prenom2}</div>}
          </div>
          <div style={{ fontFamily: 'var(--font-cormorant-garamond)', fontSize: 'clamp(24px, 5vw, 36px)', color: theme.accent }}>&</div>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontFamily: 'var(--font-great-vibes)', fontSize: 'clamp(32px, 10vw, 68px)', color: theme.accent, lineHeight: 1.1 }}>{data.marie2Prenom || 'Prénom'}</div>
            {data.marie2Prenom2 && <div style={{ fontSize: 11, letterSpacing: 2, color: theme.textSecondaire, marginTop: 4 }}>{data.marie2Prenom2}</div>}
          </div>
        </div>
        <div style={{ fontFamily: 'var(--font-cormorant-garamond)', fontStyle: 'italic', fontSize: 18, textAlign: 'center', color: theme.texte, marginBottom: 16, lineHeight: 1.6 }}>
          {honore}
        </div>
        <div style={{ fontFamily: 'var(--font-playfair-display)', fontSize: 22, color: theme.accent, textAlign: 'center', letterSpacing: 3, textTransform: 'uppercase', marginBottom: 8 }}>{formatDateFr(ceremony.date)}</div>
        {data.mariageJuif && hebrewDate && <div style={{ fontFamily: 'serif', fontSize: 18, color: theme.accent, direction: 'rtl', textAlign: 'center', marginBottom: 16 }}>{hebrewDate}</div>}
        <div style={{ fontFamily: 'var(--font-playfair-display)', fontSize: 26, color: theme.accent, textAlign: 'center', marginBottom: 16, letterSpacing: 2 }}>{formatHeure(ceremony.heure)}</div>
        <div style={{ fontFamily: 'var(--font-cormorant-garamond)', fontStyle: 'italic', fontSize: 20, textAlign: 'center', color: theme.texte, lineHeight: 1.6 }}>
          {lieuDisplay && <><div>{formatLieu(lieuDisplay)}</div><div>ainsi qu'à la réception qui suivra</div></>}
          {ceremony.adresse && <div style={{ fontSize: 14, marginTop: 8, color: theme.textSecondaire }}>{ceremony.adresse}</div>}
        </div>
        {isShared && ceremony.adresse && (
          <div style={{ marginTop: 20, paddingBottom: 8 }}>
            <ItineraireButtons adresse={ceremony.adresse} theme={theme} compact />
          </div>
        )}
        {ceremony.note && (
          <div style={{ marginTop: 20, paddingTop: 14, borderTop: `1px solid ${theme.accent}`, opacity: 0.8 }}>
            <div style={{ fontFamily: 'var(--font-cormorant-garamond)', fontStyle: 'italic', fontSize: 13, textAlign: 'center', color: theme.texte }}>{ceremony.note}</div>
          </div>
        )}
        {isShared && (
          <div style={{ marginTop: 28, textAlign: 'center' }}>
            <a href="https://lovit.fr" target="_blank" rel="noopener noreferrer" style={{ fontFamily: 'var(--font-cormorant-garamond)', fontStyle: 'italic', fontSize: 11, color: theme.accent, textDecoration: 'none', opacity: 0.45, letterSpacing: 0.5 }}>
              Créé avec ❤️ par Lov&apos;it
            </a>
          </div>
        )}
      </div>
    </CardFrameWrapper>
  )
}

function CardMairie({ ceremony, data, theme, isShared, cardIdx }: CardProps) {
  const isDark = !!theme.dark
  const ov = data.textOverrides ?? {}
  const ci = cardIdx ?? 0
  const lieuDisplay = ov[`ceremony_${ci}_lieu`] || ceremony.lieu
  return (
    <CardFrameWrapper frameId={data.frameId ?? 'frame-09'} ornamentId={data.ornamentId ?? 'none'} themeCardBg={THEME_CARD_BG[data.style] ?? '#ffffff'} frameOpacity={data.frameOpacity ?? 1} frameSize={data.frameSize ?? 100} framePaddingV={data.framePaddingV ?? 22} framePaddingH={data.framePaddingH ?? 18} textOpacity={data.textOpacity ?? 1} textBg={data.textBg ?? 0.5}>
      <div style={{ position: 'relative' }}>
        {data.mariageJuif && <div style={{ position: 'absolute', top: '22%', right: '18%', fontSize: 13, fontFamily: 'serif', color: theme.accent, direction: 'rtl', opacity: 0.85, zIndex: 20 }}>בס״ד</div>}
        <div style={{ fontSize: 'small', letterSpacing: '3px', textTransform: 'uppercase', color: theme.accent, textAlign: 'center', marginBottom: 16 }}>La Mairie</div>
        <LogoOrMonogram data={data} theme={theme} />
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 20 }}><MairieIllustration color={theme.accent} /></div>
        <div style={{ fontFamily: 'var(--font-great-vibes)', fontSize: 'clamp(36px, 8vw, 60px)', color: theme.accent, textAlign: 'center', marginBottom: 12, lineHeight: 1.2 }}>{data.marie1Prenom} & {data.marie2Prenom}</div>
        <div style={{ fontFamily: 'var(--font-cormorant-garamond)', fontStyle: 'italic', fontSize: 22, textAlign: 'center', color: theme.texte, marginBottom: 8 }}>se diront</div>
        <div style={{ fontFamily: 'var(--font-great-vibes)', fontSize: 72, color: theme.accent, textAlign: 'center', marginBottom: 20, lineHeight: 1 }}>« Oui »</div>
        <div style={{ fontFamily: 'var(--font-playfair-display)', fontWeight: 'bold', fontSize: 20, textAlign: 'center', color: theme.texte, marginBottom: 12 }}>{formatDateFrCap(ceremony.date)}</div>
        <div style={{ fontFamily: 'var(--font-cormorant-garamond)', fontStyle: 'italic', fontSize: 18, textAlign: 'center', color: theme.texte, marginBottom: 12, lineHeight: 1.6 }}>
          <div>{lieuDisplay ? conjonctionLieu(lieuDisplay) : ''}</div>
          {ceremony.adresse && <div style={{ fontSize: 14, marginTop: 6, color: theme.textSecondaire }}>{ceremony.adresse}</div>}
        </div>
        <div style={{ fontFamily: 'var(--font-playfair-display)', fontSize: 22, color: theme.accent, textAlign: 'center', marginBottom: 20 }}>{formatHeure(ceremony.heure)}</div>
        {isShared && ceremony.adresse && (
          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 20 }}>
            <a href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(ceremony.adresse)}`} target="_blank" rel="noopener noreferrer"
              style={{ padding: '10px 24px', borderRadius: 9999, border: `1px solid ${theme.accent}`, background: 'transparent', color: theme.accent, fontFamily: 'var(--font-cormorant-garamond)', fontStyle: 'italic', fontSize: 15, textDecoration: 'none' }}>
              📍 Itinéraire
            </a>
          </div>
        )}
        {ceremony.suiviDAutre && ceremony.evenementSuivantNom && (
          <div style={{ textAlign: 'center', paddingTop: 20, borderTop: `1px solid ${theme.accent}`, lineHeight: 1.8 }}>
            <div style={{ fontFamily: 'var(--font-playfair-display)', fontWeight: 'bold', fontSize: 16, color: theme.texte }}>
              La mairie sera suivie de {ceremony.evenementSuivantNom}
            </div>
            {ceremony.evenementSuivantAdresse && (
              <div style={{ fontFamily: 'var(--font-cormorant-garamond)', fontStyle: 'italic', fontSize: 14, color: theme.textSecondaire, marginTop: 4 }}>
                {ceremony.evenementSuivantAdresse}
              </div>
            )}
          </div>
        )}
        {ceremony.note && (
          <div style={{ marginTop: 20, paddingTop: 14, borderTop: `1px solid ${theme.accent}`, opacity: 0.8 }}>
            <div style={{ fontFamily: 'var(--font-cormorant-garamond)', fontStyle: 'italic', fontSize: 13, textAlign: 'center', color: theme.texte }}>{ceremony.note}</div>
          </div>
        )}
        {isShared && (
          <div style={{ marginTop: 28, textAlign: 'center' }}>
            <a href="https://lovit.fr" target="_blank" rel="noopener noreferrer" style={{ fontFamily: 'var(--font-cormorant-garamond)', fontStyle: 'italic', fontSize: 11, color: theme.accent, textDecoration: 'none', opacity: 0.45, letterSpacing: 0.5 }}>
              Créé avec ❤️ par Lov&apos;it
            </a>
          </div>
        )}
      </div>
    </CardFrameWrapper>
  )
}

function CardHenne({ ceremony, data, theme, isShared, cardIdx }: CardProps) {
  const isDark = !!theme.dark
  const ov = data.textOverrides ?? {}
  const ci = cardIdx ?? 0
  const lieuDisplay = ov[`ceremony_${ci}_lieu`] || ceremony.lieu
  return (
    <CardFrameWrapper frameId={data.frameId ?? 'frame-09'} ornamentId={data.ornamentId ?? 'none'} themeCardBg={THEME_CARD_BG[data.style] ?? '#ffffff'} frameOpacity={data.frameOpacity ?? 1} frameSize={data.frameSize ?? 100} framePaddingV={data.framePaddingV ?? 22} framePaddingH={data.framePaddingH ?? 18} textOpacity={data.textOpacity ?? 1} textBg={data.textBg ?? 0.5}>
      <div style={{ position: 'relative' }}>
        {data.mariageJuif && <div style={{ position: 'absolute', top: '22%', right: '18%', fontSize: 13, fontFamily: 'serif', color: theme.accent, direction: 'rtl', opacity: 0.85, zIndex: 20 }}>בס״ד</div>}
        <div style={{ fontSize: 'small', letterSpacing: '3px', textTransform: 'uppercase', color: theme.accent, textAlign: 'center', marginBottom: 16 }}>Le Henné</div>
        <LogoOrMonogram data={data} theme={theme} />
        <div style={{ textAlign: 'center', fontSize: 24, letterSpacing: '0.5em', color: theme.accent, marginBottom: 24 }}>❋ ✿ ❀</div>
        <div style={{ fontFamily: 'var(--font-cormorant-garamond)', fontStyle: 'italic', fontSize: 20, textAlign: 'center', color: theme.texte, lineHeight: 1.7, marginBottom: 28 }}>
          Vous êtes chaleureusement invités à célébrer la soirée du henné de<br />
          <span style={{ fontFamily: 'var(--font-great-vibes)', fontSize: 36, color: theme.accent }}>{data.marie1Prenom} & {data.marie2Prenom}</span>
        </div>
        <div style={{ fontFamily: 'var(--font-playfair-display)', fontSize: 22, color: theme.accent, textAlign: 'center', letterSpacing: 3, textTransform: 'uppercase', marginBottom: 12 }}>{formatDateFr(ceremony.date)}</div>
        <div style={{ fontFamily: 'var(--font-playfair-display)', fontSize: 24, color: theme.accent, textAlign: 'center', marginBottom: 16 }}>{formatHeure(ceremony.heure)}</div>
        <div style={{ fontFamily: 'var(--font-cormorant-garamond)', fontStyle: 'italic', fontSize: 20, textAlign: 'center', color: theme.texte }}>
          {lieuDisplay && <div>{formatLieu(lieuDisplay)}</div>}
          {ceremony.adresse && <div style={{ fontSize: 14, marginTop: 8, color: theme.textSecondaire }}>{ceremony.adresse}</div>}
        </div>
        {isShared && ceremony.adresse && (
          <div style={{ marginTop: 20, paddingBottom: 8 }}>
            <ItineraireButtons adresse={ceremony.adresse} theme={theme} compact />
          </div>
        )}
        {ceremony.note && (
          <div style={{ marginTop: 20, paddingTop: 14, borderTop: `1px solid ${theme.accent}`, opacity: 0.8 }}>
            <div style={{ fontFamily: 'var(--font-cormorant-garamond)', fontStyle: 'italic', fontSize: 13, textAlign: 'center', color: theme.texte }}>{ceremony.note}</div>
          </div>
        )}
        {isShared && (
          <div style={{ marginTop: 28, textAlign: 'center' }}>
            <a href="https://lovit.fr" target="_blank" rel="noopener noreferrer" style={{ fontFamily: 'var(--font-cormorant-garamond)', fontStyle: 'italic', fontSize: 11, color: theme.accent, textDecoration: 'none', opacity: 0.45, letterSpacing: 0.5 }}>
              Créé avec ❤️ par Lov&apos;it
            </a>
          </div>
        )}
      </div>
    </CardFrameWrapper>
  )
}

function CardAutre({ ceremony, data, theme, isShared, cardIdx }: CardProps) {
  const name = ceremony.type === 'Autre' ? (ceremony.customName || 'Événement') : ceremony.type
  const isDark = !!theme.dark
  const ov = data.textOverrides ?? {}
  const ci = cardIdx ?? 0
  const titreDisplay = ov[`ceremony_${ci}_titre`] || name
  const lieuDisplay = ov[`ceremony_${ci}_lieu`] || ceremony.lieu
  return (
    <CardFrameWrapper frameId={data.frameId ?? 'frame-09'} ornamentId={data.ornamentId ?? 'none'} themeCardBg={THEME_CARD_BG[data.style] ?? '#ffffff'} frameOpacity={data.frameOpacity ?? 1} frameSize={data.frameSize ?? 100} framePaddingV={data.framePaddingV ?? 22} framePaddingH={data.framePaddingH ?? 18} textOpacity={data.textOpacity ?? 1} textBg={data.textBg ?? 0.5}>
      <div style={{ position: 'relative' }}>
        {data.mariageJuif && <div style={{ position: 'absolute', top: '22%', right: '18%', fontSize: 13, fontFamily: 'serif', color: theme.accent, direction: 'rtl', opacity: 0.85, zIndex: 20 }}>בס״ד</div>}
        <div style={{ fontSize: 'small', letterSpacing: '3px', textTransform: 'uppercase', color: theme.accent, textAlign: 'center', marginBottom: 16 }}>{titreDisplay}</div>
        <LogoOrMonogram data={data} theme={theme} />
        <div style={{ fontFamily: 'var(--font-cormorant-garamond)', fontStyle: 'italic', fontSize: 20, textAlign: 'center', color: theme.texte, lineHeight: 1.7, marginBottom: 28 }}>
          Rejoignez <span style={{ fontFamily: 'var(--font-great-vibes)', fontSize: 32, color: theme.accent }}>{data.marie1Prenom} & {data.marie2Prenom}</span> pour {titreDisplay.toLowerCase()}
        </div>
        <div style={{ fontFamily: 'var(--font-playfair-display)', fontSize: 22, color: theme.accent, textAlign: 'center', letterSpacing: 3, textTransform: 'uppercase', marginBottom: 12 }}>{formatDateFr(ceremony.date)}</div>
        <div style={{ fontFamily: 'var(--font-playfair-display)', fontSize: 24, color: theme.accent, textAlign: 'center', marginBottom: 16 }}>{formatHeure(ceremony.heure)}</div>
        <div style={{ fontFamily: 'var(--font-cormorant-garamond)', fontStyle: 'italic', fontSize: 20, textAlign: 'center', color: theme.texte }}>
          {lieuDisplay && <div>{formatLieu(lieuDisplay)}</div>}
          {ceremony.adresse && <div style={{ fontSize: 14, marginTop: 8, color: theme.textSecondaire }}>{ceremony.adresse}</div>}
        </div>
        {isShared && ceremony.adresse && (
          <div style={{ marginTop: 20, paddingBottom: 8 }}>
            <ItineraireButtons adresse={ceremony.adresse} theme={theme} compact />
          </div>
        )}
        {ceremony.note && (
          <div style={{ marginTop: 20, paddingTop: 14, borderTop: `1px solid ${theme.accent}`, opacity: 0.8 }}>
            <div style={{ fontFamily: 'var(--font-cormorant-garamond)', fontStyle: 'italic', fontSize: 13, textAlign: 'center', color: theme.texte }}>{ceremony.note}</div>
          </div>
        )}
        {isShared && (
          <div style={{ marginTop: 28, textAlign: 'center' }}>
            <a href="https://lovit.fr" target="_blank" rel="noopener noreferrer" style={{ fontFamily: 'var(--font-cormorant-garamond)', fontStyle: 'italic', fontSize: 11, color: theme.accent, textDecoration: 'none', opacity: 0.45, letterSpacing: 0.5 }}>
              Créé avec ❤️ par Lov&apos;it
            </a>
          </div>
        )}
      </div>
    </CardFrameWrapper>
  )
}

function CarteShabbatHatan({ ceremony, data, theme, isShared, cardIdx }: CardProps) {
  const ci = cardIdx ?? 0
  const ov = data.textOverrides ?? {}
  const lieuDisplay = ov[`ceremony_${ci}_lieu`] || ceremony.lieu
  const gpPa1 = fmtGpCouple(data.famille1GpPaPerePrenom, data.famille1GpPaPereNom, data.famille1GpPaMerePrenom, data.famille1GpPaMereNom)
  const gpMa1 = fmtGpCouple(data.famille1GpMaPerePrenom, data.famille1GpMaPereNom, data.famille1GpMaMerePrenom, data.famille1GpMaMereNom)
  const gpPa2 = fmtGpCouple(data.famille2GpPaPerePrenom, data.famille2GpPaPereNom, data.famille2GpPaMerePrenom, data.famille2GpPaMereNom)
  const gpMa2 = fmtGpCouple(data.famille2GpMaPerePrenom, data.famille2GpMaPereNom, data.famille2GpMaMerePrenom, data.famille2GpMaMereNom)
  const hasGp = gpPa1 || gpMa1 || gpPa2 || gpMa2
  const parents1 = fmtParentsLines(data.famille1PerePrenom, data.famille1PereNom, data.famille1MerePrenom, data.famille1MereNom)
  const parents2 = fmtParentsLines(data.famille2PerePrenom, data.famille2PereNom, data.famille2MerePrenom, data.famille2MereNom)
  const joie = ov[`ceremony_${ci}_joie`] || (hasGp ? 'Ont la joie de vous faire part du mariage de leurs petits-enfants et enfants' : 'Ont la joie de vous faire part du mariage de leurs enfants')
  return (
    <CardFrameWrapper frameId={data.frameId ?? 'frame-09'} ornamentId={data.ornamentId ?? 'none'} themeCardBg={THEME_CARD_BG[data.style] ?? '#ffffff'} frameOpacity={data.frameOpacity ?? 1} frameSize={data.frameSize ?? 100} framePaddingV={data.framePaddingV ?? 22} framePaddingH={data.framePaddingH ?? 18} textOpacity={data.textOpacity ?? 1} textBg={data.textBg ?? 0.5}>
      <div style={{ position: 'relative' }}>
        {data.mariageJuif && <div style={{ position: 'absolute', top: '22%', right: '18%', fontSize: 13, fontFamily: 'serif', color: theme.accent, direction: 'rtl', opacity: 0.85, zIndex: 20 }}>בס״ד</div>}
        <div style={{ fontSize: 'small', letterSpacing: '3px', textTransform: 'uppercase', color: theme.accent, textAlign: 'center', marginBottom: 16 }}>Shabbat Hatan</div>
        <LogoOrMonogram data={data} theme={theme} />
        <div style={{ textAlign: 'center', fontSize: 22, letterSpacing: '0.4em', color: theme.accent, marginBottom: 24 }}>✡ ✦ ✡</div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr auto 1fr', gap: 12, marginBottom: 24, alignItems: 'start' }}>
          <div style={{ fontFamily: 'var(--font-cormorant-garamond)', fontStyle: 'italic', fontSize: 13, color: theme.accent, lineHeight: 2 }}>
            {parents1.map((l, i) => <div key={i}>{l}</div>)}
            {gpPa1 && <div>{gpPa1}</div>}
            {gpMa1 && <div>{gpMa1}</div>}
          </div>
          <div style={{ width: 1, background: theme.accent, opacity: 0.3, alignSelf: 'stretch', minHeight: 40 }} />
          <div style={{ fontFamily: 'var(--font-cormorant-garamond)', fontStyle: 'italic', fontSize: 13, color: theme.accent, textAlign: 'right', lineHeight: 2 }}>
            {parents2.map((l, i) => <div key={i}>{l}</div>)}
            {gpPa2 && <div>{gpPa2}</div>}
            {gpMa2 && <div>{gpMa2}</div>}
          </div>
        </div>
        <div style={{ fontFamily: 'var(--font-cormorant-garamond)', fontStyle: 'italic', fontSize: 22, textAlign: 'center', color: theme.texte, marginBottom: 24, lineHeight: 1.5 }}>
          {joie}
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr auto 1fr', alignItems: 'center', gap: 8, marginBottom: 28 }}>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontFamily: 'var(--font-great-vibes)', fontSize: 'clamp(32px, 10vw, 68px)', color: theme.accent, lineHeight: 1.1 }}>{data.marie1Prenom || 'Prénom'}</div>
            {data.marie1Prenom2 && <div style={{ fontSize: 11, letterSpacing: 2, color: theme.textSecondaire, marginTop: 4 }}>{data.marie1Prenom2}</div>}
          </div>
          <div style={{ fontFamily: 'var(--font-cormorant-garamond)', fontSize: 'clamp(24px, 5vw, 36px)', color: theme.accent }}>&</div>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontFamily: 'var(--font-great-vibes)', fontSize: 'clamp(32px, 10vw, 68px)', color: theme.accent, lineHeight: 1.1 }}>{data.marie2Prenom || 'Prénom'}</div>
            {data.marie2Prenom2 && <div style={{ fontSize: 11, letterSpacing: 2, color: theme.textSecondaire, marginTop: 4 }}>{data.marie2Prenom2}</div>}
          </div>
        </div>
        <div style={{ fontFamily: 'var(--font-playfair-display)', fontSize: 22, color: theme.accent, textAlign: 'center', letterSpacing: 3, textTransform: 'uppercase', marginBottom: 12 }}>{formatDateFr(ceremony.date)}</div>
        <div style={{ fontFamily: 'var(--font-playfair-display)', fontSize: 24, color: theme.accent, textAlign: 'center', marginBottom: 16 }}>{formatHeure(ceremony.heure)}</div>
        <div style={{ fontFamily: 'var(--font-cormorant-garamond)', fontStyle: 'italic', fontSize: 20, textAlign: 'center', color: theme.texte }}>
          {lieuDisplay && <div>{formatLieu(lieuDisplay)}</div>}
          {ceremony.adresse && <div style={{ fontSize: 14, marginTop: 8, color: theme.textSecondaire }}>{ceremony.adresse}</div>}
        </div>
        {isShared && ceremony.adresse && (
          <div style={{ marginTop: 20, paddingBottom: 8 }}>
            <ItineraireButtons adresse={ceremony.adresse} theme={theme} compact />
          </div>
        )}
        {ceremony.note && (
          <div style={{ marginTop: 20, paddingTop: 14, borderTop: `1px solid ${theme.accent}`, opacity: 0.8 }}>
            <div style={{ fontFamily: 'var(--font-cormorant-garamond)', fontStyle: 'italic', fontSize: 13, textAlign: 'center', color: theme.texte }}>{ceremony.note}</div>
          </div>
        )}
        {isShared && (
          <div style={{ marginTop: 28, textAlign: 'center' }}>
            <a href="https://lovit.fr" target="_blank" rel="noopener noreferrer" style={{ fontFamily: 'var(--font-cormorant-garamond)', fontStyle: 'italic', fontSize: 11, color: theme.accent, textDecoration: 'none', opacity: 0.45, letterSpacing: 0.5 }}>
              Créé avec ❤️ par Lov&apos;it
            </a>
          </div>
        )}
      </div>
    </CardFrameWrapper>
  )
}

function renderCard(ceremony: Ceremony, data: FormData, theme: ThemeObj, photoIdx = 0, isShared = false) {
  const photos = data.photosFond ?? []
  const photoFond = photos[photoIdx] ?? photos[photos.length - 1] ?? data.photoFond ?? ''
  const props = { ceremony, data: { ...data, photoFond }, theme, isShared, cardIdx: photoIdx }
  if (ceremony.type === 'Mairie') return <CardMairie {...props} />
  if (ceremony.type === 'Cérémonie religieuse / Houppa') return <CardHouppa {...props} />
  if (ceremony.type === 'Shabbat Hatan') return <CarteShabbatHatan {...props} />
  if (ceremony.type === 'Henné') return <CardHenne {...props} />
  return <CardAutre {...props} />
}

// ── Style élégant ──────────────────────────────────────────────────────────────

function CustomLogo({ url, size, scale = 100, color }: { url: string; size: number; scale?: number; color?: string }) {
  const s = size * (scale / 100)
  let src = url
  if (color && url.includes('cloudinary.com')) {
    const hex = color.replace('#', '')
    src = url.replace('/upload/', `/upload/e_colorize:100,co_rgb:${hex}/`)
  }
  return <img src={src} alt="Logo" style={{ width: s, height: s, objectFit: 'contain' }} />
}

function LogoOrMonogram({ data, theme }: { data: FormData; theme: ThemeObj }) {
  if (data.customLogoUrl) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 12 }}>
        <CustomLogo url={data.customLogoUrl} scale={data.customLogoSize} color={data.customLogoColor} size={110} />
      </div>
    )
  }
  const i1 = (data.marie1Prenom || 'A')[0].toUpperCase()
  const i2 = (data.marie2Prenom || 'B')[0].toUpperCase()
  const color = data.monogrammeColor || theme.accent
  return (
    <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 12 }}>
      <MonogramByStyle initial1={i1} initial2={i2} color={color} size={110} style={data.monogrammeStyle || 'cercle'} />
    </div>
  )
}

function MonogramByStyle({ initial1, initial2, color, size = 220, style = 'cercle' }: { initial1: string; initial2: string; color: string; size?: number; style?: string }) {
  const a = initial1 || 'A'
  const b = initial2 || 'B'
  const fs = Math.round(size * 0.52)

  // ── Style 1 : Entrelacé Luxe ──────────────────────────────────────────────
  // Lettre A normale (z-index 2), lettre B en position absolute décalée (z-index 1)
  if (style === 'cercle') {
    const w = Math.round(fs * 1.55)
    const h = Math.round(fs * 1.2)
    const bX = Math.round(fs * 0.52)   // décalage horizontal : B commence à mi-A
    const bY = Math.round(fs * 0.14)   // décalage vertical : B légèrement en bas
    return (
      <div style={{ position: 'relative', display: 'inline-block', width: w, height: h }}>
        <span style={{ fontFamily: 'var(--font-great-vibes)', fontSize: fs, color, lineHeight: 1, position: 'absolute', top: 0, left: 0, zIndex: 2 }}>{a}</span>
        <span style={{ fontFamily: 'var(--font-great-vibes)', fontSize: fs, color, lineHeight: 1, position: 'absolute', top: 0, left: 0, transform: `translateX(${bX}px) translateY(${bY}px)`, opacity: 0.72, zIndex: 1 }}>{b}</span>
      </div>
    )
  }

  // ── Style 2 : Calligraphie Pure ───────────────────────────────────────────
  // A & B côte à côte, kerning négatif, & en Cormorant 45%
  if (style === 'enlace') return (
    <div style={{ display: 'inline-flex', alignItems: 'baseline' }}>
      <span style={{ fontFamily: 'var(--font-great-vibes)', fontSize: fs, color, lineHeight: 1, letterSpacing: -Math.round(fs * 0.04) }}>{a}</span>
      <span style={{ fontFamily: 'var(--font-cormorant-garamond)', fontStyle: 'italic', fontSize: Math.round(fs * 0.45), color, opacity: 0.55, lineHeight: 1, margin: `0 ${Math.round(fs * 0.06)}px` }}>&</span>
      <span style={{ fontFamily: 'var(--font-great-vibes)', fontSize: fs, color, lineHeight: 1, letterSpacing: -Math.round(fs * 0.04) }}>{b}</span>
    </div>
  )

  // ── Style 3 : Cercle Élégant ──────────────────────────────────────────────
  // SVG cercle fin autour des initiales entrelacées
  if (style === 'couronne') {
    const d = size
    const cx = d / 2, cy = d / 2
    const r1 = d / 2 - 2, r2 = d / 2 - Math.round(d * 0.07)
    const sw1 = Math.max(0.5, d * 0.005), sw2 = Math.max(0.3, d * 0.003)
    return (
      <div style={{ position: 'relative', display: 'inline-flex', width: d, height: d, alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
        <svg style={{ position: 'absolute', top: 0, left: 0 }} width={d} height={d} viewBox={`0 0 ${d} ${d}`} xmlns="http://www.w3.org/2000/svg">
          <circle cx={cx} cy={cy} r={r1} fill="none" stroke={color} strokeWidth={sw1} opacity="0.35" />
          <circle cx={cx} cy={cy} r={r2} fill="none" stroke={color} strokeWidth={sw2} opacity="0.2" />
        </svg>
        <span style={{ fontFamily: 'var(--font-great-vibes)', fontSize: Math.round(fs * 0.84), color, lineHeight: 1, position: 'relative', zIndex: 2 }}>{a}</span>
        <span style={{ fontFamily: 'var(--font-great-vibes)', fontSize: Math.round(fs * 0.84), color, lineHeight: 1, marginLeft: -Math.round(fs * 0.08), opacity: 0.72, transform: 'translateY(8%)', display: 'inline-block', position: 'relative', zIndex: 1 }}>{b}</span>
      </div>
    )
  }

  // ── Style 4 : Vertical Luxe ───────────────────────────────────────────────
  // A en haut, B en bas, se chevauchent au centre avec fine ligne dorée
  if (style === 'branches') {
    const letterFs = Math.round(fs * 0.9)
    const overlap = Math.round(letterFs * 0.28)
    return (
      <div style={{ display: 'inline-flex', flexDirection: 'column', alignItems: 'center', gap: 0 }}>
        <span style={{ fontFamily: 'var(--font-great-vibes)', fontSize: letterFs, color, lineHeight: 1, position: 'relative', zIndex: 2 }}>{a}</span>
        <div style={{ width: 1, height: Math.max(6, Math.round(size * 0.05)), background: color, opacity: 0.45, marginTop: -overlap, marginBottom: -overlap, position: 'relative', zIndex: 3 }} />
        <span style={{ fontFamily: 'var(--font-great-vibes)', fontSize: letterFs, color, lineHeight: 1, opacity: 0.78, position: 'relative', zIndex: 1 }}>{b}</span>
      </div>
    )
  }

  // ── Style 5 : Minimaliste Chic ────────────────────────────────────────────
  // Cormorant Garamond 300, très espacé, ultra-luxe
  if (style === 'losange') return (
    <div style={{ display: 'inline-flex', flexDirection: 'column', alignItems: 'center', gap: Math.round(size * 0.04) }}>
      <div style={{ display: 'inline-flex', alignItems: 'baseline', gap: Math.round(fs * 0.22) }}>
        <span style={{ fontFamily: 'var(--font-cormorant-garamond)', fontSize: Math.round(fs * 0.96), color, fontStyle: 'italic', lineHeight: 1, fontWeight: 300, letterSpacing: Math.round(fs * 0.04) }}>{a}</span>
        <span style={{ fontFamily: 'var(--font-cormorant-garamond)', fontSize: Math.round(fs * 0.96), color, fontStyle: 'italic', lineHeight: 1, fontWeight: 300, letterSpacing: Math.round(fs * 0.04) }}>{b}</span>
      </div>
      <div style={{ width: Math.round(size * 0.72), height: 0.5, background: color, opacity: 0.35 }} />
    </div>
  )

  // ── Style 6 : Baroque ────────────────────────────────────────────────────
  // Ornements SVG courbe (fleurs/étoiles) au-dessus et en-dessous des initiales
  const ornW = Math.round(size * 0.9)
  const ornH = Math.round(size * 0.14)
  const rDot = Math.max(1.5, size * 0.016)
  const bX6 = Math.round(fs * 0.5), bY6 = Math.round(fs * 0.13)
  return (
    <div style={{ display: 'inline-flex', flexDirection: 'column', alignItems: 'center' }}>
      <svg width={ornW} height={ornH} viewBox={`0 0 ${ornW} ${ornH}`} xmlns="http://www.w3.org/2000/svg">
        <path d={`M${ornW*0.04},${ornH*0.82} Q${ornW*0.25},${ornH*0.06} ${ornW*0.5},${ornH*0.58} Q${ornW*0.75},${ornH*0.06} ${ornW*0.96},${ornH*0.82}`} fill="none" stroke={color} strokeWidth="0.9" opacity="0.5" strokeLinecap="round"/>
        <circle cx={ornW*0.04} cy={ornH*0.82} r={rDot} fill={color} opacity="0.45"/>
        <circle cx={ornW*0.5} cy={ornH*0.58} r={rDot} fill={color} opacity="0.45"/>
        <circle cx={ornW*0.96} cy={ornH*0.82} r={rDot} fill={color} opacity="0.45"/>
      </svg>
      <div style={{ position: 'relative', display: 'inline-block', width: Math.round(fs * 1.55), height: Math.round(fs * 1.2) }}>
        <span style={{ fontFamily: 'var(--font-great-vibes)', fontSize: fs, color, lineHeight: 1, position: 'absolute', top: 0, left: 0, zIndex: 2 }}>{a}</span>
        <span style={{ fontFamily: 'var(--font-great-vibes)', fontSize: fs, color, lineHeight: 1, position: 'absolute', top: 0, left: 0, transform: `translateX(${bX6}px) translateY(${bY6}px)`, opacity: 0.72, zIndex: 1 }}>{b}</span>
      </div>
      <svg width={ornW} height={ornH} viewBox={`0 0 ${ornW} ${ornH}`} xmlns="http://www.w3.org/2000/svg">
        <path d={`M${ornW*0.04},${ornH*0.18} Q${ornW*0.25},${ornH*0.94} ${ornW*0.5},${ornH*0.42} Q${ornW*0.75},${ornH*0.94} ${ornW*0.96},${ornH*0.18}`} fill="none" stroke={color} strokeWidth="0.9" opacity="0.5" strokeLinecap="round"/>
        <circle cx={ornW*0.04} cy={ornH*0.18} r={rDot} fill={color} opacity="0.45"/>
        <circle cx={ornW*0.5} cy={ornH*0.42} r={rDot} fill={color} opacity="0.45"/>
        <circle cx={ornW*0.96} cy={ornH*0.18} r={rDot} fill={color} opacity="0.45"/>
      </svg>
    </div>
  )
}


function ElegantSeparator({ color, initial1, initial2 }: { color: string; initial1: string; initial2: string }) {
  return (
    <div style={{ maxWidth: 600, margin: '0 auto', display: 'flex', alignItems: 'center', gap: 14, padding: '20px 24px' }}>
      <div style={{ flex: 1, height: '0.5px', background: color, opacity: 0.45 }} />
      <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
        <span style={{ fontFamily: 'Georgia, serif', fontStyle: 'italic', fontSize: 14, color, opacity: 0.75 }}>{initial1}</span>
        <span style={{ color, opacity: 0.4, fontSize: 9 }}>✦</span>
        <span style={{ fontFamily: 'Georgia, serif', fontStyle: 'italic', fontSize: 14, color, opacity: 0.75 }}>{initial2}</span>
      </div>
      <div style={{ flex: 1, height: '0.5px', background: color, opacity: 0.45 }} />
    </div>
  )
}
function ElegantPage1({ data, theme }: { data: FormData; theme: ThemeObj }) {
  const photos = data.photosFond?.length ? data.photosFond : (data.photoFond ? [data.photoFond] : [])
  const firstDate = sortByDate(data.ceremonies)[0]?.date
  const [idx, setIdx] = useState(0)
  const [visible, setVisible] = useState(true)

  useEffect(() => {
    if (photos.length <= 1) return
    const interval = setInterval(() => {
      setVisible(false)
      setTimeout(() => {
        setIdx(prev => (prev + 1) % photos.length)
        setVisible(true)
      }, 600)
    }, 4000)
    return () => clearInterval(interval)
  }, [photos.length])

  return (
    <div style={{ maxWidth: 600, margin: '0 auto', borderRadius: 4, overflow: 'hidden', boxShadow: '0 8px 40px rgba(0,0,0,0.13)', position: 'relative', height: 600 }}>
      {photos.length > 0 ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={photos[idx]} alt="" style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'center', opacity: visible ? 1 : 0, transition: 'opacity 0.6s ease' }} />
      ) : (
        <div style={{ position: 'absolute', inset: 0, background: `linear-gradient(160deg, ${theme.fond}, ${theme.accent}22)` }} />
      )}
      <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(0,0,0,0.72) 0%, rgba(0,0,0,0.18) 45%, transparent 100%)' }} />
      {photos.length > 1 && (
        <div style={{ position: 'absolute', top: 16, left: '50%', transform: 'translateX(-50%)', display: 'flex', gap: 6, zIndex: 10 }}>
          {photos.map((_, i) => (
            <div key={i} style={{ width: 6, height: 6, borderRadius: '50%', backgroundColor: i === idx ? '#C9A84C' : 'rgba(255,255,255,0.5)', transition: 'background 0.3s' }} />
          ))}
        </div>
      )}
      <div style={{ position: 'absolute', bottom: 40, left: 40, right: 40, zIndex: 2 }}>
        <div style={{ fontFamily: 'var(--font-great-vibes)', fontSize: 'clamp(48px, 12vw, 80px)', color: 'white', lineHeight: 1.1, textShadow: '0 2px 20px rgba(0,0,0,0.4)' }}>
          {data.marie1Prenom || 'Prénom'}
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, margin: '6px 0' }}>
          <div style={{ width: 36, height: '0.5px', background: 'rgba(255,255,255,0.55)' }} />
          <span style={{ fontFamily: 'var(--font-great-vibes)', fontSize: 28, color: 'rgba(255,255,255,0.8)' }}>&</span>
          <div style={{ width: 36, height: '0.5px', background: 'rgba(255,255,255,0.55)' }} />
        </div>
        <div style={{ fontFamily: 'var(--font-great-vibes)', fontSize: 'clamp(48px, 12vw, 80px)', color: 'white', lineHeight: 1.1, textShadow: '0 2px 20px rgba(0,0,0,0.4)' }}>
          {data.marie2Prenom || 'Prénom'}
        </div>
        {firstDate && (
          <>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, margin: '14px 0 10px' }}>
              <div style={{ flex: 1, height: '0.5px', background: `${theme.accent}99` }} />
              <span style={{ color: theme.accent, fontSize: 10 }}>✦</span>
              <div style={{ flex: 1, height: '0.5px', background: `${theme.accent}99` }} />
            </div>
            <div style={{ fontFamily: 'var(--font-playfair-display)', fontSize: 12, color: 'rgba(255,255,255,0.85)', letterSpacing: 4, textTransform: 'uppercase' }}>
              {formatDateFr(firstDate)}
            </div>
          </>
        )}
      </div>
    </div>
  )
}

function ElegantPage2({ data, theme }: { data: FormData; theme: ThemeObj }) {
  const i1 = (data.marie1Prenom || 'A')[0].toUpperCase()
  const i2 = (data.marie2Prenom || 'B')[0].toUpperCase()
  const firstDate = sortByDate(data.ceremonies)[0]?.date
  return (
    <div style={{ maxWidth: 600, margin: '0 auto', borderRadius: 4, overflow: 'hidden', boxShadow: '0 8px 40px rgba(0,0,0,0.13)', backgroundColor: theme.fond, padding: '56px 48px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
      {data.mariageJuif && <div style={{ fontSize: 14, fontFamily: 'serif', color: theme.accent, direction: 'rtl', marginBottom: 20 }}>בס״ד</div>}
      {data.customLogoUrl ? <CustomLogo url={data.customLogoUrl} scale={data.customLogoSize} color={data.customLogoColor} size={200} /> : <MonogramByStyle initial1={i1} initial2={i2} color={data.monogrammeColor || theme.accent} size={200} style={data.monogrammeStyle || 'cercle'} />}
      <div style={{ fontFamily: 'var(--font-great-vibes)', fontSize: 52, color: theme.accent, marginTop: 20, textAlign: 'center', lineHeight: 1.2 }}>
        {data.marie1Prenom} & {data.marie2Prenom}
      </div>
      {firstDate && (
        <div style={{ fontFamily: 'var(--font-playfair-display)', fontSize: 13, color: theme.textSecondaire, letterSpacing: 4, textTransform: 'uppercase', marginTop: 18 }}>
          {formatDateFr(firstDate)}
        </div>
      )}
      <div style={{ fontFamily: 'var(--font-cormorant-garamond)', fontStyle: 'italic', fontSize: 18, color: theme.texte, marginTop: 18, textAlign: 'center', lineHeight: 1.8 }}>
        vous invitent à célébrer leur union
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginTop: 24, opacity: 0.5 }}>
        <div style={{ width: 32, height: '0.5px', background: theme.accent }} />
        <span style={{ color: theme.accent, fontSize: 10 }}>✦</span>
        <div style={{ width: 32, height: '0.5px', background: theme.accent }} />
      </div>
    </div>
  )
}

function ElegantCardsContent({ data, theme, isShared }: { data: FormData; theme: ThemeObj; isShared?: boolean }) {
  const sorted = sortByDate(data.ceremonies)
  const i1 = (data.marie1Prenom || 'A')[0].toUpperCase()
  const i2 = (data.marie2Prenom || 'B')[0].toUpperCase()
  return (
    <>
      <ElegantPage1 data={data} theme={theme} />
      <ElegantSeparator color={theme.accent} initial1={i1} initial2={i2} />
      <ElegantPage2 data={data} theme={theme} />
      <ElegantSeparator color={theme.accent} initial1={i1} initial2={i2} />
      {sorted.map((ceremony, i) => (
        <div key={i}>
          <div style={{ maxWidth: 600, margin: '0 auto', borderRadius: 4, boxShadow: '0 8px 40px rgba(0,0,0,0.13)', overflow: 'hidden' }}>
            {renderCard(ceremony, data, theme, i, isShared)}
          </div>
          {i < sorted.length - 1 && <CeremoniesDivider themeAccent={theme.accent} />}
        </div>
      ))}
    </>
  )
}

// ── RSVP ──────────────────────────────────────────────────────────────────────

interface RSVPReponse {
  ceremonie: string
  date: string
  present: boolean
  nbPersonnes: number
  accompagnants?: string[]   // ← NOUVEAU : prénoms des +1, +2...
}

interface RSVPEntry {
  nom: string
  email?: string
  message?: string
  reponses: RSVPReponse[]
  sentAt: string
  shareId?: string
  mariee1?: string
  mariee2?: string
}

function RSVPModal({ accent, onClose, mariee1, mariee2, shareId, ceremonies }: { accent: string; onClose: () => void; mariee1: string; mariee2: string; shareId: string | null; ceremonies: Ceremony[] }) {
  const getCeremonyName = (c: Ceremony) => c.type === 'Autre' ? (c.customName || 'Événement') : c.type

  // 🔒 Détection si déjà répondu (localStorage)
  const storageKey = shareId ? `lovit_rsvp_sent_${shareId}` : null
  const [alreadyAnswered, setAlreadyAnswered] = useState(false)
  const [forceReopen, setForceReopen] = useState(false)

  useEffect(() => {
    if (!storageKey) return
    try {
      const sent = localStorage.getItem(storageKey)
      if (sent) setAlreadyAnswered(true)
    } catch { /* ignore */ }
  }, [storageKey])

  const [step, setStep] = useState(1)
  const [nom, setNom] = useState('')
  const [email, setEmail] = useState('')
  const [reponses, setReponses] = useState<{ ceremonie: string; date: string; present: boolean | null; nbPersonnes: number }[]>(
    ceremonies.map(c => ({ ceremonie: getCeremonyName(c), date: c.date || '', present: null, nbPersonnes: 1 }))
  )
  const [message, setMessage] = useState('')
  const [sent, setSent] = useState(false)
  const [loading, setLoading] = useState(false)
  const [accompagnants, setAccompagnants] = useState<Record<number, string[]>>({})

  const setPresent = (i: number, val: boolean) => {
    setReponses(rs => rs.map((r, idx) => idx === i ? { ...r, present: r.present === val ? null : val } : r))
  }

  const setNbPersonnes = (i: number, delta: number) => {
    setReponses(rs => rs.map((r, idx) => idx === i ? { ...r, nbPersonnes: Math.max(1, r.nbPersonnes + delta) } : r))
  }

  const send = async () => {
    setLoading(true)
    try {
      const entry: RSVPEntry = {
        nom,
        email: email || undefined,
        message: message || undefined,
        reponses: reponses.map((r, i) => ({
          ceremonie: r.ceremonie,
          date: r.date,
          present: r.present ?? false,
          nbPersonnes: r.present ? r.nbPersonnes : 0,
          accompagnants: r.present ? (accompagnants[i] ?? []).filter(Boolean) : [],
        })),
        sentAt: new Date().toISOString(),
        shareId: shareId ?? undefined,
        mariee1,
        mariee2,
      }
      await fetch('/api/rsvp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(entry),
      })
      // 🔒 Marque comme déjà répondu
      if (storageKey) {
        try { localStorage.setItem(storageKey, new Date().toISOString()) } catch { /* ignore */ }
      }
      setSent(true)
    } catch {
      alert("Erreur lors de l'envoi")
    } finally {
      setLoading(false)
    }
  }

  const STEPS = 3
  const progressPct = (step / STEPS) * 100

  // 🔒 Écran "Déjà répondu"
  if (alreadyAnswered && !forceReopen) {
    return (
      <div style={{ position: 'fixed', inset: 0, zIndex: 200, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 }}>
        <div onClick={onClose} style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.55)' }} />
        <div style={{ position: 'relative', background: 'white', borderRadius: 20, padding: 48, width: '100%', maxWidth: 440, textAlign: 'center', boxShadow: '0 24px 64px rgba(0,0,0,0.2)' }}>
          <button onClick={onClose} style={{ ...BTN, position: 'absolute', top: 16, right: 16, background: 'none', border: 'none', fontSize: 20, color: '#9ca3af' }}>✕</button>
          <div style={{ fontSize: 48, marginBottom: 16 }}>✓</div>
          <div style={{ fontFamily: 'Georgia, serif', fontStyle: 'italic', fontSize: 24, color: accent, marginBottom: 16 }}>
            Merci !
          </div>
          <p style={{ fontSize: 15, color: '#4a3728', lineHeight: 1.7, marginBottom: 8 }}>
            Vous avez déjà répondu à cette invitation.
          </p>
          <p style={{ fontSize: 14, color: '#9ca3af', lineHeight: 1.6, marginBottom: 28 }}>
            Les mariés ont bien reçu votre réponse 💕
          </p>
          <button onClick={onClose} style={{ ...BTN, padding: '12px 32px', borderRadius: 9999, background: accent, color: 'white', border: 'none', fontSize: 14, fontWeight: 600, marginBottom: 20 }}>
            Fermer
          </button>
          <div style={{ borderTop: '1px solid #fce7f3', paddingTop: 16 }}>
            <button onClick={() => setForceReopen(true)} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 12, color: '#9ca3af', textDecoration: 'underline' }}>
              Ce n&apos;est pas moi — répondre en tant qu&apos;autre personne
            </button>
          </div>
        </div>
      </div>
    )
  }

  if (sent) {
    return (
      <div style={{ position: 'fixed', inset: 0, zIndex: 200, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 }}>
        <div onClick={onClose} style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.55)' }} />
        <div style={{ position: 'relative', background: 'white', borderRadius: 20, padding: 48, width: '100%', maxWidth: 420, textAlign: 'center', boxShadow: '0 24px 64px rgba(0,0,0,0.2)' }}>
          <div style={{ fontSize: 52, marginBottom: 16 }}>🎉</div>
          <div style={{ fontFamily: 'Georgia, serif', fontStyle: 'italic', fontSize: 22, color: accent, marginBottom: 12 }}>
            Merci {nom.split(' ')[0]} !
          </div>
          <p style={{ fontSize: 15, color: '#6a5040', lineHeight: 1.7 }}>
            Les mariés ont bien reçu votre réponse.
          </p>
          <button onClick={onClose} style={{ ...BTN, marginTop: 24, padding: '12px 32px', borderRadius: 9999, background: accent, color: 'white', border: 'none', fontSize: 14, fontWeight: 600 }}>Fermer</button>
        </div>
      </div>
    )
  }

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 200, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 }}>
      <div onClick={onClose} style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.55)' }} />
      <div style={{ position: 'relative', background: 'white', borderRadius: 20, padding: '32px 36px', width: '100%', maxWidth: 480, maxHeight: '90vh', overflowY: 'auto', boxShadow: '0 24px 64px rgba(0,0,0,0.2)' }}>
        <button onClick={onClose} style={{ ...BTN, position: 'absolute', top: 16, right: 16, background: 'none', border: 'none', fontSize: 20, color: '#9ca3af' }}>✕</button>

        <div style={{ fontFamily: 'Georgia, serif', fontStyle: 'italic', fontSize: 22, color: accent, textAlign: 'center', marginBottom: 4 }}>RSVP</div>
        <div style={{ fontSize: 13, color: '#9ca3af', textAlign: 'center', marginBottom: 20 }}>{mariee1} & {mariee2}</div>

        <div style={{ height: 4, background: '#f3e8ff', borderRadius: 9999, marginBottom: 28, overflow: 'hidden' }}>
          <div style={{ height: '100%', width: `${progressPct}%`, background: accent, borderRadius: 9999, transition: 'width 0.3s ease' }} />
        </div>

        {step === 1 && (
          <>
            <div style={{ fontSize: 12, color: '#9ca3af', textAlign: 'center', marginBottom: 20, textTransform: 'uppercase', letterSpacing: '0.1em' }}>Étape 1 / 3 — Vos coordonnées</div>
            <div style={{ marginBottom: 18 }}>
              <Label>Prénom et nom *</Label>
              <input value={nom} onChange={e => setNom(e.target.value)} placeholder="Marie Dupont" style={S.input} />
            </div>
            <div style={{ marginBottom: 28 }}>
              <Label>Email (optionnel)</Label>
              <input value={email} onChange={e => setEmail(e.target.value)} placeholder="marie@exemple.com" type="email" style={S.input} />
            </div>
            <button onClick={() => setStep(2)} disabled={!nom.trim()} style={{
              ...BTN, width: '100%', padding: '14px 0', borderRadius: 9999, border: 'none',
              background: !nom.trim() ? '#e5e7eb' : `linear-gradient(135deg, ${accent}, ${accent}cc)`,
              color: !nom.trim() ? '#9ca3af' : 'white', fontSize: 15, fontWeight: 700,
              cursor: !nom.trim() ? 'not-allowed' : 'pointer',
            }}>Suivant →</button>
          </>
        )}

        {step === 2 && (
          <>
            <div style={{ fontSize: 12, color: '#9ca3af', textAlign: 'center', marginBottom: 20, textTransform: 'uppercase', letterSpacing: '0.1em' }}>Étape 2 / 3 — Votre présence</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14, marginBottom: 28 }}>
              {reponses.map((r, i) => (
                <div key={i} style={{ border: `1.5px solid ${r.present === true ? accent : r.present === false ? '#fb7185' : '#fecdd3'}`, borderRadius: 14, padding: '14px 16px', transition: 'border-color 0.2s' }}>
                  <div style={{ fontSize: 13, fontWeight: 700, color: '#4a3728', marginBottom: 4 }}>{r.ceremonie}</div>
                  {r.date && <div style={{ fontSize: 11, color: '#9ca3af', marginBottom: 10 }}>{formatDateFrCap(r.date)}</div>}
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginBottom: r.present === true ? 12 : 0 }}>
                    <button type="button" onClick={() => setPresent(i, true)} style={{
                      ...BTN, padding: '10px 8px', borderRadius: 9, fontSize: 13, fontWeight: 600,
                      border: `2px solid ${r.present === true ? accent : '#fecdd3'}`,
                      background: r.present === true ? accent : 'white',
                      color: r.present === true ? 'white' : '#4a3728',
                    }}>Présent ✓</button>
                    <button type="button" onClick={() => setPresent(i, false)} style={{
                      ...BTN, padding: '10px 8px', borderRadius: 9, fontSize: 13, fontWeight: 600,
                      border: `2px solid ${r.present === false ? '#fb7185' : '#fecdd3'}`,
                      background: r.present === false ? '#fb7185' : 'white',
                      color: r.present === false ? 'white' : '#4a3728',
                    }}>Absent ✗</button>
                  </div>
                  {r.present === true && (
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginTop: 4 }}>
                        <span style={{ fontSize: 12, color: '#6a5040' }}>Nb de personnes :</span>
                        <button type="button" onClick={() => setNbPersonnes(i, -1)} style={{ ...BTN, width: 28, height: 28, borderRadius: 9999, border: `1.5px solid ${accent}44`, background: 'white', color: accent, fontWeight: 700, fontSize: 16, padding: 0 }}>−</button>
                        <span style={{ fontSize: 15, fontWeight: 700, color: accent, minWidth: 20, textAlign: 'center' }}>{r.nbPersonnes}</span>
                        <button type="button" onClick={() => setNbPersonnes(i, 1)} style={{ ...BTN, width: 28, height: 28, borderRadius: 9999, border: `1.5px solid ${accent}44`, background: 'white', color: accent, fontWeight: 700, fontSize: 16, padding: 0 }}>+</button>
                      </div>
                      {r.nbPersonnes > 1 && (
                        <div style={{ marginTop: 10, display: 'flex', flexDirection: 'column', gap: 6 }}>
                          {Array.from({ length: r.nbPersonnes - 1 }).map((_, j) => (
                            <input key={j} type="text"
                              placeholder={`Prénom personne ${j + 2}`}
                              value={accompagnants[i]?.[j] ?? ''}
                              onChange={e => {
                                const u = { ...accompagnants }
                                if (!u[i]) u[i] = []
                                u[i][j] = e.target.value
                                setAccompagnants(u)
                              }}
                              style={{ ...S.input, fontSize: 13 }} />
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
            <div style={{ display: 'flex', gap: 10 }}>
              <button onClick={() => setStep(1)} style={{ ...BTN, flex: 1, padding: '14px 0', borderRadius: 9999, border: `1.5px solid ${accent}44`, background: 'white', color: accent, fontSize: 14, fontWeight: 600 }}>← Retour</button>
              <button onClick={() => setStep(3)} style={{ ...BTN, flex: 2, padding: '14px 0', borderRadius: 9999, border: 'none', background: `linear-gradient(135deg, ${accent}, ${accent}cc)`, color: 'white', fontSize: 15, fontWeight: 700 }}>Suivant →</button>
            </div>
          </>
        )}

        {step === 3 && (
          <>
            <div style={{ fontSize: 12, color: '#9ca3af', textAlign: 'center', marginBottom: 20, textTransform: 'uppercase', letterSpacing: '0.1em' }}>Étape 3 / 3 — Message</div>
            <div style={{ marginBottom: 24 }}>
              <Label>Un petit mot pour les mariés (optionnel)</Label>
              <textarea
                value={message}
                onChange={e => e.target.value.length <= 300 && setMessage(e.target.value)}
                placeholder="Avec toute notre affection..."
                rows={4}
                style={{ ...S.input, resize: 'vertical', lineHeight: 1.6 } as React.CSSProperties}
              />
              <div style={{ fontSize: 11, color: '#9ca3af', textAlign: 'right', marginTop: 4 }}>{message.length}/300</div>
            </div>
            <div style={{ display: 'flex', gap: 10 }}>
              <button onClick={() => setStep(2)} style={{ ...BTN, flex: 1, padding: '14px 0', borderRadius: 9999, border: `1.5px solid ${accent}44`, background: 'white', color: accent, fontSize: 14, fontWeight: 600 }}>← Retour</button>
              <button onClick={send} disabled={loading} style={{
                ...BTN, flex: 2, padding: '14px 0', borderRadius: 9999, border: 'none',
                background: `linear-gradient(135deg, ${accent}, ${accent}cc)`,
                color: 'white', fontSize: 15, fontWeight: 700,
                boxShadow: `0 6px 20px ${accent}44`,
              }}>{loading ? 'Envoi...' : 'Envoyer ma réponse'}</button>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
function RSVPListModal({ accent, onClose, shareId, ceremonies }: { accent: string; onClose: () => void; shareId: string | null; ceremonies: Ceremony[] }) {
  const [entries, setEntries] = useState<RSVPEntry[]>([])
  const [loading, setLoading] = useState(true)
  const [views, setViews] = useState<{ timestamp: string; pays: string }[]>([])

  useEffect(() => {
    if (!shareId) { setLoading(false); return }
    fetch(`/api/get-rsvp?shareId=${shareId}`)
      .then(r => r.json())
      .then((d: RSVPEntry[]) => setEntries(Array.isArray(d) ? d : []))
      .catch(() => setEntries([]))
      .finally(() => setLoading(false))
    fetch(`/api/get-views?shareId=${shareId}`)
      .then(r => r.json())
      .then((d: { timestamp: string; pays: string }[]) => setViews(Array.isArray(d) ? d : []))
      .catch(() => {})
  }, [shareId])

  const getCeremonyName = (c: Ceremony) => c.type === 'Autre' ? (c.customName || 'Événement') : c.type

  const totalPresents = entries.reduce((s, e) => s + (e.reponses?.some(r => r.present) ? 1 : 0), 0)
  const totalPersonnes = entries.reduce((s, e) => s + (e.reponses?.filter(r => r.present).reduce((a, r) => a + (r.nbPersonnes || 0), 0) || 0), 0)
  const downloadExcel = async () => {
    const XLSX = await import('xlsx')
    const wb = XLSX.utils.book_new()
    const evtNames = ceremonies.map(getCeremonyName)

    // Feuille Résumé
    const totalPresents = entries.reduce((s, e) => s + (e.reponses?.some(r => r.present) ? 1 : 0), 0)
    const totalPersonnes = entries.reduce((s, e) => s + (e.reponses?.filter(r => r.present).reduce((a, r) => a + (r.nbPersonnes || 0), 0) || 0), 0)
    const resumeData = [
      ['RÉSUMÉ DES RSVP'],
      [''],
      ['Total réponses reçues', entries.length],
      ['Total personnes présentes', totalPersonnes],
      ['Total foyers présents', totalPresents],
      [''],
      ['DÉTAIL PAR CÉRÉMONIE'],
      [''],
    ]
    ceremonies.forEach(c => {
      const nomEvt = getCeremonyName(c)
      const presents = entries.filter(e => e.reponses?.find(r => r.ceremonie === nomEvt && r.present))
      const nbPers = presents.reduce((s, e) => s + (e.reponses?.find(r => r.ceremonie === nomEvt)?.nbPersonnes || 0), 0)
      resumeData.push([nomEvt, `${presents.length} foyers · ${nbPers} personnes`])
    })
    const wsResume = XLSX.utils.aoa_to_sheet(resumeData)
    wsResume['!cols'] = [{ wch: 35 }, { wch: 25 }]
    XLSX.utils.book_append_sheet(wb, wsResume, 'Résumé')

    // Une feuille par cérémonie
    ceremonies.forEach(c => {
      const nomEvt = getCeremonyName(c)
      const rows: (string | number)[][] = [
        ['Nom', 'Email', 'Présence', 'Nb personnes', 'Accompagnants', 'Message'],
      ]
      entries.forEach(e => {
        const rep = e.reponses?.find(r => r.ceremonie === nomEvt)
        const acc = (rep?.accompagnants ?? []).filter(Boolean).join(' / ')
        rows.push([
          e.nom,
          e.email || '',
          rep ? (rep.present ? 'Présent' : 'Absent') : '—',
          rep?.present ? rep.nbPersonnes : 0,
          rep?.present ? acc : '',
          e.message || '',
        ])
      })
      const ws = XLSX.utils.aoa_to_sheet(rows)
      ws['!cols'] = [{ wch: 25 }, { wch: 28 }, { wch: 12 }, { wch: 14 }, { wch: 30 }, { wch: 40 }]
      const sheetName = nomEvt.substring(0, 31).replace(/[\\/*?:[\]]/g, '')
      XLSX.utils.book_append_sheet(wb, ws, sheetName)
    })

    XLSX.writeFile(wb, 'rsvp-lovit.xlsx')
  }
  const downloadCSV = () => {
    const evtNames = ceremonies.map(getCeremonyName)
    const headers = [
      'Nom',
      'Email',
      ...evtNames.flatMap(n => [`${n} - Présence`, `${n} - Personnes`, `${n} - Accompagnants`]),
      'Message',
    ]
    const csvRows = entries.map(e => {
      const evtCols = evtNames.flatMap(nom => {
        const rep = e.reponses?.find(r => r.ceremonie === nom)
        const accList = (rep?.accompagnants ?? []).filter(Boolean).join(' / ')
        return [
          rep ? (rep.present ? 'Présent' : 'Absent') : '—',
          rep?.present ? String(rep.nbPersonnes) : '0',
          rep?.present ? accList : '',
        ]
      })
      return [e.nom, e.email || '', ...evtCols, e.message || ''].map(v => `"${String(v).replace(/"/g, '""')}"`)
    })
    const csv = [headers.map(h => `"${h}"`), ...csvRows].map(r => r.join(',')).join('\r\n')
    const blob = new Blob(['\ufeff' + csv], { type: 'text/csv;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'rsvp.csv'
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 200, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 }}>
      <div onClick={onClose} style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.55)' }} />
      <div style={{ position: 'relative', background: 'white', borderRadius: 20, padding: 32, width: '100%', maxWidth: 700, maxHeight: '85vh', overflow: 'hidden', display: 'flex', flexDirection: 'column', boxShadow: '0 24px 64px rgba(0,0,0,0.2)' }}>
        <button onClick={onClose} style={{ ...BTN, position: 'absolute', top: 16, right: 16, background: 'none', border: 'none', fontSize: 20, color: '#9ca3af' }}>✕</button>
        <div style={{ fontFamily: 'Georgia, serif', fontStyle: 'italic', fontSize: 22, color: accent, textAlign: 'center', marginBottom: 16 }}>Réponses RSVP</div>

        {views.length > 0 && (
          <div style={{ background: '#f0f9ff', borderRadius: 10, padding: '12px 16px', marginBottom: 16 }}>
            <div style={{ fontSize: 14, fontWeight: 700, color: '#0369a1', marginBottom: 8 }}>
              👁 {views.length} personne{views.length > 1 ? 's' : ''} ont ouvert votre faire-part
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
              {views.slice(-10).reverse().map((v, i) => (
                <span key={i} style={{ fontSize: 11, background: 'white', border: '1px solid #bae6fd', borderRadius: 6, padding: '3px 8px', color: '#0369a1' }}>
                  {v.pays.split('-')[0].toUpperCase()} · {new Date(v.timestamp).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
                </span>
              ))}
              {views.length > 10 && <span style={{ fontSize: 11, color: '#9ca3af' }}>+ {views.length - 10} autres</span>}
            </div>
          </div>
        )}

        {!loading && entries.length > 0 && (
          <>
            {/* Summary cards */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 20 }}>
              <div style={{ borderRadius: 12, padding: '16px 20px', background: `${accent}12`, textAlign: 'center' }}>
                <div style={{ fontSize: 28, fontWeight: 800, color: accent }}>{entries.length}</div>
                <div style={{ fontSize: 12, color: '#6a5040', marginTop: 2 }}>Réponse{entries.length > 1 ? 's' : ''} reçue{entries.length > 1 ? 's' : ''}</div>
              </div>
              <div style={{ borderRadius: 12, padding: '16px 20px', background: '#f0fdf4', textAlign: 'center' }}>
                <div style={{ fontSize: 28, fontWeight: 800, color: '#22c55e' }}>{totalPersonnes}</div>
                <div style={{ fontSize: 12, color: '#6a5040', marginTop: 2 }}>Personne{totalPersonnes > 1 ? 's' : ''} présente{totalPersonnes > 1 ? 's' : ''}</div>
              </div>
            </div>
            <div style={{ display: 'flex', gap: 10, justifyContent: 'center', flexWrap: 'wrap', marginBottom: 20 }}>
              <button onClick={downloadExcel} style={{ ...BTN, padding: '10px 24px', borderRadius: 9999, background: '#16a34a', color: 'white', border: 'none', fontSize: 13, fontWeight: 600, boxShadow: '0 4px 14px rgba(22,163,74,0.35)' }}>
                📊 Télécharger Excel
              </button>
              <button onClick={downloadCSV} style={{ ...BTN, padding: '10px 24px', borderRadius: 9999, background: '#22c55e', color: 'white', border: 'none', fontSize: 13, fontWeight: 600, boxShadow: '0 4px 14px rgba(34,197,94,0.35)' }}>
                Télécharger CSV
              </button>
              {shareId && (
                <a href={`/plan-table?shareId=${shareId}`} style={{ ...BTN, padding: '10px 24px', borderRadius: 9999, background: `linear-gradient(135deg,#C9A84C,#e8c96a)`, color: 'white', border: 'none', fontSize: 13, fontWeight: 600, textDecoration: 'none', display: 'inline-block' }}>
                  🪑 Créer le plan de table
                </a>
              )}
            </div>
          </>
        )}

        <div style={{ overflowY: 'auto', flex: 1 }}>
          {loading ? (
            <div style={{ textAlign: 'center', color: '#9ca3af', padding: 32 }}>Chargement...</div>
          ) : entries.length === 0 ? (
            <div style={{ textAlign: 'center', color: '#9ca3af', padding: 32, fontStyle: 'italic' }}>Aucune réponse pour le moment</div>
          ) : (
            ceremonies.map((c, ci) => {
              const nomEvt = getCeremonyName(c)
              const tableRows = entries.map(e => {
                const rep = e.reponses?.find(r => r.ceremonie === nomEvt)
                return { e, present: rep ? rep.present : null, nb: rep?.present ? rep.nbPersonnes : 0 }
              })
              const presentRows = tableRows.filter(x => x.present === true)
              const totalPresentsEvt = presentRows.length
              const totalNb = presentRows.reduce((s, x) => s + (x.nb || 0), 0)
              return (
                <div key={ci} style={{ marginBottom: 36 }}>
                  <div style={{ display: 'flex', alignItems: 'baseline', gap: 8, marginBottom: 12, paddingBottom: 10, borderBottom: `2px solid ${accent}33` }}>
                    <span style={{ fontSize: 15, fontWeight: 700, color: accent, textTransform: 'uppercase', letterSpacing: '0.1em' }}>{nomEvt}</span>
                    {c.date && <span style={{ fontSize: 12, color: '#9ca3af' }}>{formatDateFrCap(c.date)}</span>}
                  </div>
                  <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 14 }}>
                    <thead>
                      <tr style={{ borderBottom: `1px solid ${accent}22` }}>
                        <th style={{ padding: '8px 10px', textAlign: 'left', color: accent, fontWeight: 700, fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.1em' }}>Nom</th>
                        <th style={{ padding: '8px 10px', textAlign: 'center', color: accent, fontWeight: 700, fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.1em' }}>Présence</th>
                        <th style={{ padding: '8px 10px', textAlign: 'center', color: accent, fontWeight: 700, fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.1em' }}>Personnes</th>
                        <th style={{ padding: '8px 10px', textAlign: 'left', color: accent, fontWeight: 700, fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.1em' }}>Email</th>
                        <th style={{ padding: '8px 10px', textAlign: 'left', color: accent, fontWeight: 700, fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.1em' }}>Message</th>
                      </tr>
                    </thead>
                    <tbody>
                      {tableRows.map(({ e, present, nb }, i) => {
                        const rep = e.reponses?.find(r => r.ceremonie === nomEvt)
                        const acc = rep?.accompagnants?.filter(Boolean) ?? []
                        return (
                          <tr key={i} style={{ borderBottom: '1px solid #fce7f3', background: i % 2 === 0 ? 'white' : '#fdf8f9' }}>
                            <td style={{ padding: '10px', color: '#4a3728', fontWeight: 500, verticalAlign: 'top' }}>
                              {e.nom}
                              {present === true && acc.length > 0 && (
                                <div style={{ marginTop: 4, paddingLeft: 10, borderLeft: `2px solid ${accent}55` }}>
                                  {acc.map((prenom, j) => (
                                    <div key={j} style={{ fontSize: 12, color: '#8a7860', fontWeight: 400, lineHeight: 1.5 }}>
                                      <span style={{ color: accent, opacity: 0.6 }}>+</span> {prenom}
                                    </div>
                                  ))}
                                </div>
                              )}
                            </td>
                            <td style={{ padding: '10px', textAlign: 'center', fontSize: 16, verticalAlign: 'top' }}>
                              {present === true ? <span style={{ color: '#22c55e', fontWeight: 700 }}>✓</span>
                                : present === false ? <span style={{ color: '#fb7185', fontWeight: 700 }}>✗</span>
                                : <span style={{ color: '#9ca3af' }}>—</span>}
                            </td>
                            <td style={{ padding: '10px', textAlign: 'center', color: '#6a5040', verticalAlign: 'top' }}>{present === true ? nb : '—'}</td>
                            <td style={{ padding: '10px', color: '#6a5040', fontSize: 12, verticalAlign: 'top' }}>{e.email || '—'}</td>
                            <td style={{ padding: '10px', color: '#6a5040', fontStyle: 'italic', fontSize: 13, verticalAlign: 'top' }}>{e.message || '—'}</td>
                          </tr>
                        )
                      })}
                    </tbody>
                    <tfoot>
                      <tr style={{ borderTop: `2px solid ${accent}33`, background: `${accent}08` }}>
                        <td colSpan={2} style={{ padding: '10px', color: '#4a3728', fontWeight: 700, fontSize: 13 }}>
                          Total présents : <span style={{ color: accent, fontSize: 15 }}>{totalPresentsEvt}</span>
                        </td>
                        <td style={{ padding: '10px', textAlign: 'center', color: accent, fontWeight: 700, fontSize: 15 }}>{totalNb}</td>
                        <td colSpan={2} />
                      </tr>
                    </tfoot>
                  </table>
                </div>
              )
            })
          )}
        </div>
      </div>
    </div>
  )
}
// ── Music Upload (Cloudinary) ──────────────────────────────────────────────────

function MusicUploader({ musicUrl, musicName, onChange }: { musicUrl: string; musicName?: string; onChange: (url: string, name?: string) => void }) {
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState('')

  const upload = async (file: File) => {
    setUploading(true)
    setError('')
    try {
      const fd = new FormData()
      fd.append('file', file)
      fd.append('upload_preset', 'wedding_music')
      const res = await fetch('https://api.cloudinary.com/v1_1/dau96mui2/upload', { method: 'POST', body: fd })
      const json = await res.json()
      if (json.secure_url) {
        onChange(json.secure_url, file.name)
      } else {
        setError("Erreur upload : " + (json.error?.message ?? 'inconnu'))
      }
    } catch (e) {
      setError("Erreur réseau : " + (e instanceof Error ? e.message : String(e)))
    } finally {
      setUploading(false)
    }
  }

  if (musicUrl) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 14px', border: '1px solid #C9A84C44', borderRadius: 10, background: '#fdf5e4' }}>
        <span style={{ fontSize: 18 }}>🎵</span>
        <span style={{ flex: 1, fontSize: 12, color: '#4a3728', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{musicName || 'Musique uploadée'}</span>
        <button type="button" onClick={() => onChange('')} style={{ ...BTN, background: 'none', border: 'none', color: '#fb7185', fontSize: 13 }}>✕ Supprimer</button>
      </div>
    )
  }

  return (
    <div>
      <label style={{ display: 'block', cursor: uploading ? 'wait' : 'pointer' }}>
        <div style={{ border: '2px dashed #C9A84C66', borderRadius: 10, padding: 20, textAlign: 'center', background: uploading ? '#fdf5e4' : 'white' }}>
          <div style={{ fontSize: 24, marginBottom: 6 }}>{uploading ? '⏳' : '🎵'}</div>
          <p style={{ fontSize: 13, color: '#4a3728', margin: 0 }}>{uploading ? 'Upload en cours…' : 'Cliquer pour uploader un fichier MP3'}</p>
          <p style={{ fontSize: 11, color: '#9ca3af', marginTop: 4 }}>Format MP3, max 10 Mo</p>
        </div>
        <input type="file" accept="audio/mp3,audio/mpeg,audio/*" disabled={uploading} onChange={e => { const f = e.target.files?.[0]; if (f) upload(f); e.target.value = '' }} style={{ display: 'none' }} />
      </label>
      {error && <p style={{ fontSize: 12, color: '#fb7185', marginTop: 6 }}>{error}</p>}
    </div>
  )
}

// ── AudioPlayer HTML5 ──────────────────────────────────────────────────────────

function AudioPlayer({ musicUrl, accent, playRef }: { musicUrl: string; accent: string; playRef?: React.MutableRefObject<(() => void) | null> }) {
  const audioRef = useRef<HTMLAudioElement | null>(null)
  const [muted, setMuted] = useState(false)
  const [started, setStarted] = useState(false)

  useEffect(() => {
    const wasPreStarted = _pendingAudio !== null
    const audio = _pendingAudio ?? new Audio(musicUrl)
    if (_pendingAudio) _pendingAudio = null
    audio.loop = true
    audioRef.current = audio

    if (playRef) {
      playRef.current = () => { audio.play().then(() => setStarted(true)).catch(() => {}) }
    }

    if (wasPreStarted) {
      if (!audio.paused) {
        setStarted(true)
      } else {
        const onPlaying = () => setStarted(true)
        audio.addEventListener('playing', onPlaying, { once: true })
      }
      return () => { if (playRef) playRef.current = null }
    }

    let cleanupListeners: (() => void) | null = null
    audio.play().then(() => setStarted(true)).catch(() => {
      const tryPlay = () => {
        audio.play().then(() => setStarted(true)).catch(() => {})
        document.removeEventListener('click', tryPlay, true)
        document.removeEventListener('touchend', tryPlay, true)
      }
      document.addEventListener('click', tryPlay, true)
      document.addEventListener('touchend', tryPlay, true)
      cleanupListeners = () => {
        document.removeEventListener('click', tryPlay, true)
        document.removeEventListener('touchend', tryPlay, true)
      }
    })
    return () => { cleanupListeners?.(); if (playRef) playRef.current = null }
  }, [musicUrl, playRef])

  const toggleMute = () => {
    const audio = audioRef.current
    if (!audio) return
    if (!started) {
      audio.play().then(() => setStarted(true)).catch(() => {})
      return
    }
    audio.muted = !muted
    setMuted(m => !m)
  }

  return (
    <>
      <button
        onClick={toggleMute}
        onTouchEnd={e => { e.preventDefault(); toggleMute() }}
        style={{ ...BTN, position: 'fixed', bottom: 24, right: 24, zIndex: 50, width: 40, height: 40, borderRadius: '50%', background: accent, color: 'white', border: 'none', fontSize: 16, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
      >
        {!started ? '▶️' : muted ? '🔇' : '🔊'}
      </button>
    </>
  )
}

// ── Splash + Music ─────────────────────────────────────────────────────────────

function SplashScreen({ data, theme, onDone, isShared, onStartMusic }: { data: FormData; theme: ThemeObj; onDone: () => void; isShared: boolean; onStartMusic?: () => void }) {
  const [out, setOut] = useState(false)
  const [vis, setVis] = useState(0)
  const firstDate = sortByDate(data.ceremonies)[0]?.date
  const done = useCallback(() => { setOut(true); setTimeout(onDone, 600) }, [onDone])

  useEffect(() => {
    if (!isShared) { const t = setTimeout(done, 2200); return () => clearTimeout(t) }
    // Animation en cascade pour la vue partagée
    const timers = [
      setTimeout(() => setVis(1), 150),
      setTimeout(() => setVis(2), 700),
      setTimeout(() => setVis(3), 1200),
      setTimeout(() => setVis(4), 1700),
    ]
    return () => timers.forEach(clearTimeout)
  }, [isShared, done])

  const handleDiscover = useCallback(() => {
    onStartMusic?.()
    done()
  }, [onStartMusic, done])

  const fade = (n: number): React.CSSProperties => ({
    opacity: vis >= n ? 1 : 0,
    transform: vis >= n ? 'translateY(0)' : 'translateY(18px)',
    transition: 'opacity 0.75s ease, transform 0.75s ease',
  })

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 100, backgroundColor: theme.fond, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '0 24px', opacity: out ? 0 : 1, transition: 'opacity 0.6s ease', pointerEvents: out ? 'none' : 'auto' }}>

      {/* Prénoms */}
      <div style={{ ...fade(1), fontFamily: 'var(--font-great-vibes)', fontSize: 'clamp(48px, 12vw, 96px)', color: theme.accent, textAlign: 'center', lineHeight: 1.2 }}>
        {data.marie1Prenom || 'Prénom'}<br />&amp;<br />{data.marie2Prenom || 'Prénom'}
      </div>

      {/* Phrase touchante — vue partagée uniquement */}
      {isShared && (
        <div style={{ ...fade(2), fontFamily: 'var(--font-cormorant-garamond)', fontStyle: 'italic', fontSize: 18, color: theme.accent, textAlign: 'center', marginTop: 20, letterSpacing: '0.02em' }}>
          vous invitent à partager leur bonheur
        </div>
      )}

      {/* Séparateur + date */}
      {firstDate && (
        <div style={{ ...fade(isShared ? 3 : 1), textAlign: 'center', marginTop: isShared ? 20 : 24 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 12, marginBottom: 8 }}>
            <div style={{ width: 32, height: 1, background: theme.accent, opacity: 0.4 }} />
            <span style={{ color: theme.accent, opacity: 0.6, fontSize: 10 }}>✦</span>
            <div style={{ width: 32, height: 1, background: theme.accent, opacity: 0.4 }} />
          </div>
          <div style={{ fontFamily: 'var(--font-playfair-display)', fontSize: 13, color: theme.textSecondaire, letterSpacing: 3, textTransform: 'uppercase' }}>
            {formatDateFr(firstDate)}
          </div>
        </div>
      )}

      {/* Bouton */}
      {isShared && (
        <div style={{ ...fade(4), marginTop: 44 }}>
          <button
            onClick={handleDiscover}
            onTouchEnd={e => { e.preventDefault(); handleDiscover() }}
            style={{ ...BTN, padding: '16px 44px', border: `1px solid ${theme.accent}`, borderRadius: 9999, background: 'transparent', color: theme.accent, fontSize: 16, fontFamily: 'var(--font-playfair-display)', letterSpacing: '0.06em' }}
          >
            Ouvrir mon invitation ✦
          </button>
        </div>
      )}
    </div>
  )
}

function MusicPlayer({ youtubeUrl, accent }: { youtubeUrl: string; accent: string }) {
  const [mobile, setMobile] = useState(false)
  const [playerOpen, setPlayerOpen] = useState(false)
  const [muted, setMuted] = useState(false)
  const [desktopKey, setDesktopKey] = useState(0)
  const id = getYouTubeId(youtubeUrl)

  useEffect(() => {
    setMobile(/iPhone|iPad|iPod|Android/i.test(navigator.userAgent))
  }, [])

  if (!id) return null

  // ── Mobile : bouton fixe + popup lecteur 300×80 ──────────────────────────
  if (mobile) {
    return (
      <>
        {/* iframe 1×1 visible — tente l'autoplay en arrière-plan sur iOS */}
        <iframe
          src={`https://www.youtube.com/embed/${id}?autoplay=1&loop=1&playlist=${id}&controls=0&mute=1`}
          style={{ position: 'fixed', bottom: 0, right: 0, width: 1, height: 1, opacity: 0.01, border: 'none', pointerEvents: 'none' }}
          allow="autoplay; encrypted-media"
          title="music-bg"
        />

        {/* Bouton élégant fixe */}
        <button
          onTouchEnd={e => { e.preventDefault(); setPlayerOpen(o => !o) }}
          onClick={() => setPlayerOpen(o => !o)}
          style={{
            ...BTN,
            position: 'fixed', bottom: 24, right: 24, zIndex: 50,
            background: playerOpen ? accent : `${accent}dd`,
            color: 'white', border: 'none', borderRadius: 9999,
            padding: '11px 18px', fontSize: 14, fontWeight: 600,
            letterSpacing: '0.05em',
            boxShadow: '0 4px 20px rgba(0,0,0,0.22)',
            display: 'flex', alignItems: 'center', gap: 6,
          }}
        >
          ♪ Musique
        </button>

        {/* Popup lecteur YouTube 300×80 */}
        {playerOpen && (
          <div style={{
            position: 'fixed', bottom: 76, right: 16, zIndex: 51,
            borderRadius: 14, overflow: 'hidden',
            boxShadow: '0 8px 36px rgba(0,0,0,0.28)',
            width: 300, height: 80,
          }}>
            <iframe
              src={`https://www.youtube.com/embed/${id}?autoplay=1&loop=1&playlist=${id}&controls=1`}
              width="300"
              height="80"
              allow="autoplay; encrypted-media"
              style={{ display: 'block', border: 'none' }}
              title="music-player"
            />
          </div>
        )}
      </>
    )
  }

  // ── Desktop : iframe cachée + bouton mute ────────────────────────────────
  return (
    <>
      <iframe
        key={desktopKey}
        src={`https://www.youtube.com/embed/${id}?autoplay=1&loop=1&playlist=${id}&controls=0&mute=${muted ? 1 : 0}`}
        style={{ position: 'fixed', top: -9999, opacity: 0, pointerEvents: 'none', width: 1, height: 1 }}
        allow="autoplay"
        title="music"
      />
      <button
        onClick={() => { setMuted(m => !m); setDesktopKey(k => k + 1) }}
        style={{ ...BTN, position: 'fixed', bottom: 24, right: 24, width: 40, height: 40, borderRadius: '50%', background: accent, color: 'white', border: 'none', zIndex: 50, fontSize: 16, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
      >
        {muted ? '🔇' : '🔊'}
      </button>
    </>
  )
}

// ── ShareModal ────────────────────────────────────────────────────────────────

function CopyLinkRow({ label, url, accent }: { label: string; url: string; accent: string }) {
  const [copied, setCopied] = useState(false)
  const copy = () => {
    navigator.clipboard.writeText(url).catch(() => {
      const ta = document.createElement('textarea')
      ta.value = url
      ta.style.cssText = 'position:fixed;opacity:0'
      document.body.appendChild(ta)
      ta.focus(); ta.select()
      try { (document as unknown as { execCommand(c: string): void }).execCommand('copy') } catch { /* ignore */ }
      document.body.removeChild(ta)
    })
    setCopied(true)
    setTimeout(() => setCopied(false), 2500)
  }
  return (
    <div style={{ marginBottom: 16 }}>
      <div style={{ fontSize: 11, fontWeight: 700, color: accent, textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 6 }}>{label}</div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <input readOnly value={url} onFocus={e => e.target.select()} style={{ flex: 1, fontSize: 11, color: '#4a3728', background: '#fdf8f9', border: `1px solid ${accent}33`, borderRadius: 6, padding: '8px 10px', outline: 'none' }} />
        <button onClick={copy} style={{ ...BTN, padding: '8px 14px', borderRadius: 6, background: copied ? '#22c55e' : accent, color: 'white', border: 'none', fontSize: 12, whiteSpace: 'nowrap', transition: 'background 0.2s' }}>{copied ? '✓' : 'Copier'}</button>
      </div>
    </div>
  )
}

function shortDateFr(dateStr: string): string {
  if (!dateStr) return ''
  const d = new Date(dateStr + 'T12:00:00')
  const day = d.getDate()
  const month = new Intl.DateTimeFormat('fr-FR', { month: 'long' }).format(d)
  const year = d.getFullYear()
  return `${day === 1 ? '1er' : day} ${month} ${year}`
}

function buildWhatsAppMessage(data: FormData, guestUrl: string): string {
  const sorted = sortByDate(data.ceremonies).filter(c => c.date)
  let datesStr = ''
  if (sorted.length === 0) {
    datesStr = 'prochainement'
  } else if (sorted.length === 1) {
    datesStr = `le ${shortDateFr(sorted[0].date)}`
  } else {
    const parts = sorted.map(c => shortDateFr(c.date))
    datesStr = `les ${parts.slice(0, -1).join(', ')} et ${parts[parts.length - 1]}`
  }
  const firstLieu = sorted[0]?.lieu || data.ceremonies[0]?.lieu || ''
  const ville = firstLieu.trim().split(/\s+/).pop() || ''
  const firstDate = sorted[0]?.date || ''
  let dateLimite = '…'
  if (firstDate) {
    const d = new Date(firstDate + 'T12:00:00')
    d.setDate(d.getDate() - 30)
    dateLimite = shortDateFr(d.toISOString().split('T')[0])
  }
  const p1 = data.marie1Prenom || 'Prénom 1'
  const p2 = data.marie2Prenom || 'Prénom 2'
  return `Chères Familles, Chers Amis,

Nous sommes heureux de vous convier à notre mariage qui se tiendra ${datesStr}.

Nous serions ravis de vous compter parmi nous pour célébrer cet événement si précieux de notre vie.

Retrouvez votre invitation ici :
${guestUrl}

Merci de bien vouloir nous confirmer votre présence via le bouton RSVP.

À très bientôt,
${p1} & ${p2} 💍`
}

function CopyTextRow({ text, accent }: { text: string; accent: string }) {
  const [copied, setCopied] = useState(false)
  const copy = () => {
    navigator.clipboard.writeText(text).catch(() => {
      const ta = document.createElement('textarea'); ta.value = text; ta.style.cssText = 'position:fixed;opacity:0'
      document.body.appendChild(ta); ta.focus(); ta.select()
      try { (document as unknown as { execCommand(c: string): void }).execCommand('copy') } catch { /* ignore */ }
      document.body.removeChild(ta)
    })
    setCopied(true); setTimeout(() => setCopied(false), 2500)
  }
  return (
    <button onClick={copy} style={{ ...BTN, padding: '10px 20px', borderRadius: 8, background: copied ? '#22c55e' : accent, color: 'white', border: 'none', fontSize: 13, fontWeight: 600 }}>
      {copied ? '✓ Copié' : 'Copier le message'}
    </button>
  )
}

function ShareModal({ accent, guestUrl, coupleUrl, onClose, data }: { accent: string; guestUrl: string; coupleUrl: string; onClose: () => void; data: FormData }) {
  const [message, setMessage] = useState(() => buildWhatsAppMessage(data, guestUrl))
  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 200, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 }}>
      <div onClick={onClose} style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.6)' }} />
      <div style={{ position: 'relative', background: 'white', borderRadius: 20, padding: 40, width: '100%', maxWidth: 520, boxShadow: '0 24px 64px rgba(0,0,0,0.25)', maxHeight: '90vh', overflowY: 'auto' }}>
        <button onClick={onClose} style={{ ...BTN, position: 'absolute', top: 16, right: 16, background: 'none', border: 'none', fontSize: 22, color: '#9ca3af', lineHeight: 1 }}>✕</button>

        <div style={{ fontFamily: 'var(--font-great-vibes)', fontSize: 32, color: accent, textAlign: 'center', marginBottom: 28 }}>Votre faire-part est prêt ! ✨</div>

        {/* Section 1 — Lien invités */}
        <div style={{ marginBottom: 24 }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: accent, textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 10 }}>Lien à partager à vos invités</div>
          <CopyLinkRow label="" url={guestUrl} accent={accent} />
          <a href={`https://wa.me/?text=${encodeURIComponent(guestUrl)}`} target="_blank" rel="noopener noreferrer"
            style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, padding: '11px 20px', borderRadius: 9, background: '#25D366', color: 'white', textDecoration: 'none', fontSize: 14, fontWeight: 600, marginTop: 4 }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="white"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/><path d="M12 0C5.373 0 0 5.373 0 12c0 2.127.558 4.126 1.533 5.855L0 24l6.335-1.51A11.945 11.945 0 0012 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 21.818a9.818 9.818 0 01-5.006-1.37l-.36-.213-3.727.888.925-3.63-.234-.374A9.778 9.778 0 012.182 12C2.182 6.58 6.58 2.182 12 2.182c5.42 0 9.818 4.398 9.818 9.818 0 5.42-4.398 9.818-9.818 9.818z"/></svg>
            Partager sur WhatsApp
          </a>
        </div>

        {/* Section 2 — Message pré-écrit */}
        <div style={{ marginBottom: 24 }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: accent, textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 10 }}>Message pré-écrit</div>
          <textarea value={message} onChange={e => setMessage(e.target.value)} rows={12}
            style={{ width: '100%', padding: '12px 14px', border: '1px solid #e5e7eb', borderRadius: 10, fontSize: 13, color: '#374151', lineHeight: 1.7, resize: 'vertical', outline: 'none', fontFamily: 'inherit', boxSizing: 'border-box' }} />
          <div style={{ fontSize: 11, color: '#9ca3af', marginBottom: 12 }}>Vous pouvez personnaliser ce message</div>
          <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
            <CopyTextRow text={message} accent={accent} />
            <a href={`https://wa.me/?text=${encodeURIComponent(message)}`} target="_blank" rel="noopener noreferrer"
              style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '10px 20px', borderRadius: 8, background: '#25D366', color: 'white', textDecoration: 'none', fontSize: 13, fontWeight: 600 }}>
              <svg width="15" height="15" viewBox="0 0 24 24" fill="white"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/><path d="M12 0C5.373 0 0 5.373 0 12c0 2.127.558 4.126 1.533 5.855L0 24l6.335-1.51A11.945 11.945 0 0012 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 21.818a9.818 9.818 0 01-5.006-1.37l-.36-.213-3.727.888.925-3.63-.234-.374A9.778 9.778 0 012.182 12C2.182 6.58 6.58 2.182 12 2.182c5.42 0 9.818 4.398 9.818 9.818 0 5.42-4.398 9.818-9.818 9.818z"/></svg>
              Envoyer sur WhatsApp
            </a>
          </div>
        </div>

        {/* Section 3 — Lien mariés */}
        <div style={{ padding: '16px 18px', background: '#f0fdf4', borderRadius: 12 }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: accent, textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 6 }}>Votre lien personnel</div>
          <div style={{ fontSize: 12, color: '#6b7280', marginBottom: 12 }}>Gardez ce lien pour accéder à vos RSVP</div>
          <CopyLinkRow label="" url={coupleUrl} accent="#22c55e" />
        </div>
      </div>
    </div>
  )
}
function TextEditModal({ ceremonies, textOverrides, zoneStyles, onApply, onApplyStyles, onClose, theme }: {
  ceremonies: Ceremony[]
  textOverrides: Record<string, string>
  zoneStyles: ZoneStyles
  onApply: (overrides: Record<string, string>) => void
  onApplyStyles: (styles: ZoneStyles) => void
  onClose: () => void
  theme: ThemeObj
}) {
  const [tab, setTab] = useState<'texte' | 'style'>('texte')
  const [localText, setLocalText] = useState<Record<string, string>>(textOverrides)
  const [localStyles, setLocalStyles] = useState<ZoneStyles>(zoneStyles ?? {})
  const setText = (k: string, v: string) => {
    setLocalText(prev => {
      const next = { ...prev, [k]: v }
      onApply(next)  // ← Live preview du texte
      return next
    })
  }
  const setZoneStyle = (zone: TextZone, patch: Partial<ZoneStyle>) => {
    setLocalStyles(prev => {
      const next = { ...prev, [zone]: { ...(prev[zone] ?? {}), ...patch } }
      onApplyStyles(next)  // ← Live preview : applique immédiatement
      return next
    })
  }
  const resetZone = (zone: TextZone) => {
    setLocalStyles(prev => {
      const n = { ...prev }
      delete n[zone]
      onApplyStyles(n)  // ← Live preview
      return n
    })
  }
  const tabBtn = (active: boolean): React.CSSProperties => ({
    ...BTN, flex: 1, padding: '12px', borderRadius: 8, border: 'none',
    background: active ? theme.accent : 'transparent',
    color: active ? 'white' : theme.accent, fontSize: 13, fontWeight: 600,
    letterSpacing: 1, textTransform: 'uppercase',
  })

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 200, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'flex-end', justifyContent: 'center' }}>
      <div style={{ background: 'white', width: '100%', maxWidth: 640, borderRadius: '16px 16px 0 0', maxHeight: '88vh', overflowY: 'auto', padding: '24px 24px 40px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
          <h2 style={{ margin: 0, fontFamily: 'var(--font-playfair-display)', fontSize: 20, color: theme.texte }}>Personnalisation</h2>
          <button type="button" onClick={onClose} style={{ ...BTN, background: 'none', border: 'none', fontSize: 22, color: '#9ca3af', padding: 0 }}>✕</button>
        </div>

        {/* Tabs */}
        <div style={{ display: 'flex', gap: 4, marginBottom: 24, padding: 4, background: '#fdf5e4', borderRadius: 10 }}>
          <button type="button" onClick={() => setTab('texte')} style={tabBtn(tab === 'texte')}>✏️ Texte</button>
          <button type="button" onClick={() => setTab('style')} style={tabBtn(tab === 'style')}>🎨 Style</button>
        </div>

        {/* TAB TEXTE */}
        {tab === 'texte' && (
          <div>
            {ceremonies.map((c, i) => {
              const name = c.type === 'Autre' ? (c.customName || 'Événement') : c.type
              return (
                <div key={i} style={{ marginBottom: 24, paddingBottom: 20, borderBottom: i < ceremonies.length - 1 ? `1px solid ${theme.accent}33` : 'none' }}>
                  <div style={{ fontFamily: 'var(--font-cormorant-garamond)', fontStyle: 'italic', fontSize: 16, color: theme.accent, marginBottom: 12 }}>{name}</div>
                  <label style={{ display: 'block', fontSize: 11, fontWeight: 700, color: '#9ca3af', letterSpacing: 1, textTransform: 'uppercase', marginBottom: 4 }}>Titre</label>
                  <input value={localText[`ceremony_${i}_titre`] ?? ''} onChange={e => setText(`ceremony_${i}_titre`, e.target.value)} placeholder={name}
                    style={{ width: '100%', padding: '10px 12px', border: '1px solid #fecdd3', borderRadius: 8, fontSize: 14, color: '#4a3728', outline: 'none', boxSizing: 'border-box', marginBottom: 12 }} />
                  {c.type === 'Cérémonie religieuse / Houppa' && (
                    <>
                      <label style={{ display: 'block', fontSize: 11, fontWeight: 700, color: '#9ca3af', letterSpacing: 1, textTransform: 'uppercase', marginBottom: 4 }}>« Ont la joie de... »</label>
                      <textarea value={localText[`ceremony_${i}_joie`] ?? ''} onChange={e => setText(`ceremony_${i}_joie`, e.target.value)} placeholder="Ont la joie de vous faire part du mariage de leurs enfants"
                        style={{ width: '100%', padding: '10px 12px', border: '1px solid #fecdd3', borderRadius: 8, fontSize: 14, color: '#4a3728', outline: 'none', boxSizing: 'border-box', resize: 'vertical', minHeight: 56, marginBottom: 12 }} />
                      <label style={{ display: 'block', fontSize: 11, fontWeight: 700, color: '#9ca3af', letterSpacing: 1, textTransform: 'uppercase', marginBottom: 4 }}>« Et seraient honorés de votre présence »</label>
                      <textarea value={localText[`ceremony_${i}_honore`] ?? ''} onChange={e => setText(`ceremony_${i}_honore`, e.target.value)} placeholder="Et seraient honorés de votre présence"
                        style={{ width: '100%', padding: '10px 12px', border: '1px solid #fecdd3', borderRadius: 8, fontSize: 14, color: '#4a3728', outline: 'none', boxSizing: 'border-box', resize: 'vertical', minHeight: 56, marginBottom: 12 }} />
                    </>
                  )}
                  {c.type !== 'Mairie' && c.type !== 'Cérémonie religieuse / Houppa' && (
                    <>
                      <label style={{ display: 'block', fontSize: 11, fontWeight: 700, color: '#9ca3af', letterSpacing: 1, textTransform: 'uppercase', marginBottom: 4 }}>Phrase d&apos;invitation</label>
                      <textarea
                        value={localText[`ceremony_${i}_invitation`] ?? ''}
                        onChange={e => setText(`ceremony_${i}_invitation`, e.target.value)}
                        placeholder={`ex: ${c.type === 'Shabbat Hatan' ? 'Les familles X et Y seront ravies de vous convier au Shabbat Hatan de...' : c.type === 'Henné' ? 'Vous convient à célébrer leur soirée de henné...' : c.type === 'Cocktail' ? 'Vous invitent à lever leur verre...' : c.type === 'Soirée' ? 'Vous invitent à danser et célébrer leur amour...' : c.type === 'Boat Party' ? 'Embarquez avec eux pour une soirée inoubliable...' : 'Rejoignez-les pour cet événement...'}`}
                        style={{ width: '100%', padding: '10px 12px', border: '1px solid #fecdd3', borderRadius: 8, fontSize: 14, color: '#4a3728', outline: 'none', boxSizing: 'border-box', resize: 'vertical', minHeight: 70, marginBottom: 12 }}
                      />
                      <p style={{ fontSize: 11, color: '#9ca3af', fontStyle: 'italic', marginTop: -6, marginBottom: 12 }}>
                        Laissez vide pour utiliser le texte par défaut adapté à ce type d&apos;événement.
                      </p>
                    </>
                  )}
                  <label style={{ display: 'block', fontSize: 11, fontWeight: 700, color: '#9ca3af', letterSpacing: 1, textTransform: 'uppercase', marginBottom: 4 }}>Lieu</label>
                  <input value={localText[`ceremony_${i}_lieu`] ?? ''} onChange={e => setText(`ceremony_${i}_lieu`, e.target.value)} placeholder={c.lieu || 'Nom du lieu'}
                    style={{ width: '100%', padding: '10px 12px', border: '1px solid #fecdd3', borderRadius: 8, fontSize: 14, color: '#4a3728', outline: 'none', boxSizing: 'border-box' }} />
                </div>
              )
            })}
          </div>
        )}

        {/* TAB STYLE */}
        {tab === 'style' && (
          <div>
            <p style={{ fontSize: 12, color: '#6a5040', marginBottom: 20, lineHeight: 1.6, background: '#fdf5e4', padding: 12, borderRadius: 8 }}>
              💡 Personnalisez chaque zone de votre faire-part. Les changements s&apos;appliquent à toutes les cérémonies.
            </p>

            {TEXT_ZONES.map(zone => {
              const z = localStyles[zone] ?? {}
              return (
                <div key={zone} style={{ marginBottom: 20, padding: 16, border: `1.5px solid ${theme.accent}33`, borderRadius: 12, background: '#fdf8f9' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                    <div style={{ fontFamily: 'var(--font-cormorant-garamond)', fontStyle: 'italic', fontSize: 15, color: theme.accent, fontWeight: 600 }}>{ZONE_LABELS[zone]}</div>
                    <button type="button" onClick={() => resetZone(zone)} style={{ ...BTN, background: 'none', border: 'none', color: '#9ca3af', fontSize: 11, textDecoration: 'underline' }}>Réinitialiser</button>
                  </div>

                  {/* Police */}
                  <label style={{ display: 'block', fontSize: 10, fontWeight: 700, color: '#9ca3af', letterSpacing: 1, textTransform: 'uppercase', marginBottom: 4 }}>Police</label>
                  <select value={z.fontFamily ?? ''} onChange={e => setZoneStyle(zone, { fontFamily: e.target.value })}
                    style={{ width: '100%', padding: '8px 10px', border: '1px solid #fecdd3', borderRadius: 8, fontSize: 13, background: 'white', marginBottom: 12, color: '#4a3728' }}>
                    <option value="">Par défaut (thème)</option>
                    {FONT_OPTIONS.map(f => <option key={f.value} value={f.value}>{f.label}</option>)}
                  </select>

                  {/* Couleur */}
                  <label style={{ display: 'block', fontSize: 10, fontWeight: 700, color: '#9ca3af', letterSpacing: 1, textTransform: 'uppercase', marginBottom: 4 }}>Couleur</label>
                  <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 12 }}>
                    {COLOR_OPTIONS.map(c => {
                      const sel = (z.color ?? '') === c.value
                      return (
                        <button key={c.label} type="button" onClick={() => setZoneStyle(zone, { color: c.value })} 
                          title={c.label}
                          style={{
                            ...BTN,
                            width: 32, height: 32, borderRadius: '50%',
                            background: c.swatch,
                            border: sel ? `3px solid ${theme.accent}` : '2px solid white',
                            boxShadow: sel ? `0 0 0 1px ${theme.accent}` : '0 0 0 1px #e5e7eb',
                            padding: 0,
                          }}
                        />
                      )
                    })}
                  </div>

                  {/* Taille */}
                  <label style={{ display: 'block', fontSize: 10, fontWeight: 700, color: '#9ca3af', letterSpacing: 1, textTransform: 'uppercase', marginBottom: 4 }}>Taille</label>
                  <div style={{ display: 'flex', gap: 6, marginBottom: 12 }}>
                    {[{ v: 0.8, l: 'Petit' }, { v: 1, l: 'Normal' }, { v: 1.2, l: 'Grand' }].map(opt => {
                      const sel = (z.sizeScale ?? 1) === opt.v
                      return (
                        <button key={opt.v} type="button" onClick={() => setZoneStyle(zone, { sizeScale: opt.v })} style={{
                          ...BTN, flex: 1, padding: '8px', borderRadius: 8, fontSize: 12, fontWeight: sel ? 700 : 400,
                          border: `2px solid ${sel ? theme.accent : '#fecdd3'}`,
                          background: sel ? `${theme.accent}18` : 'white',
                          color: sel ? theme.accent : '#4a3728',
                        }}>{opt.l}</button>
                      )
                    })}
                  </div>

                  {/* Gras / Italique */}
                  <div style={{ display: 'flex', gap: 8 }}>
                    <button type="button" onClick={() => setZoneStyle(zone, { bold: !z.bold })} style={{
                      ...BTN, flex: 1, padding: '8px', borderRadius: 8, fontSize: 13, fontWeight: 700,
                      border: `2px solid ${z.bold ? theme.accent : '#fecdd3'}`,
                      background: z.bold ? `${theme.accent}18` : 'white',
                      color: z.bold ? theme.accent : '#4a3728',
                    }}>𝐁 Gras</button>
                    <button type="button" onClick={() => setZoneStyle(zone, { italic: !z.italic })} style={{
                      ...BTN, flex: 1, padding: '8px', borderRadius: 8, fontSize: 13, fontStyle: 'italic',
                      border: `2px solid ${z.italic ? theme.accent : '#fecdd3'}`,
                      background: z.italic ? `${theme.accent}18` : 'white',
                      color: z.italic ? theme.accent : '#4a3728',
                    }}>𝐼 Italique</button>
                  </div>
                </div>
              )
            })}
          </div>
        )}

        <button type="button" onClick={() => { onApply(localText); onApplyStyles(localStyles); onClose() }}
          style={{ ...BTN, width: '100%', padding: '14px', borderRadius: 9999, background: theme.accent, color: 'white', border: 'none', fontSize: 15, fontWeight: 700, letterSpacing: 1, marginTop: 8 }}>
          ✓ Appliquer
        </button>
      </div>
    </div>
  )
}
// ── Countdown ─────────────────────────────────────────────────────────────────

function Countdown({ targetDate, accent }: { targetDate: string; accent: string }) {
  const [time, setTime] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0, past: false })

  useEffect(() => {
    const calc = () => {
      const diff = new Date(targetDate).getTime() - Date.now()
      if (diff <= 0) { setTime({ days: 0, hours: 0, minutes: 0, seconds: 0, past: true }); return }
      setTime({
        days: Math.floor(diff / 86400000),
        hours: Math.floor((diff % 86400000) / 3600000),
        minutes: Math.floor((diff % 3600000) / 60000),
        seconds: Math.floor((diff % 60000) / 1000),
        past: false,
      })
    }
    calc()
    const id = setInterval(calc, 1000)
    return () => clearInterval(id)
  }, [targetDate])

  if (time.past) return (
    <div style={{ textAlign: 'center', padding: '20px 0', fontFamily: 'var(--font-great-vibes)', fontSize: 38, color: accent }}>
      Mazel Tov ! 🎉
    </div>
  )

  const Unit = ({ n, label, flash }: { n: number; label: string; flash?: boolean }) => (
    <div style={{ textAlign: 'center', minWidth: 52 }}>
      <style>{`@keyframes cdFade { from { opacity: 0.2; transform: translateY(-5px); } to { opacity: 1; transform: translateY(0); } }`}</style>
      <div key={flash ? `${label}-${n}` : label}
        style={{ fontFamily: 'var(--font-playfair-display)', fontSize: 28, color: accent, fontWeight: 700, lineHeight: 1, animation: flash ? 'cdFade 0.25s ease' : 'none' }}>
        {String(n).padStart(2, '0')}
      </div>
      <div style={{ fontSize: 10, color: accent, textTransform: 'uppercase', letterSpacing: 2, opacity: 0.7, marginTop: 5 }}>{label}</div>
    </div>
  )
  const Sep = () => <span style={{ color: accent, opacity: 0.4, fontSize: 22, lineHeight: '28px', alignSelf: 'flex-start', marginTop: 2 }}>:</span>

  return (
    <div style={{ display: 'flex', gap: 10, alignItems: 'flex-start', justifyContent: 'center',
      padding: '16px 24px', borderRadius: 12, border: `1px solid ${accent}44`, background: `${accent}0d` }}>
      <Unit n={time.days} label="jours" />
      <Sep />
      <Unit n={time.hours} label="heures" />
      <Sep />
      <Unit n={time.minutes} label="min" />
      <Sep />
      <Unit n={time.seconds} label="sec" flash />
    </div>
  )
}

// ── Ornement dentelle dorée (fallback SVG pour or-dentelle sans image) ─────────

const OrnementDentelleDore = ({ style = {} }: { style?: React.CSSProperties }) => (
  <svg viewBox="0 0 260 300" width="240" height="270" style={{...style, pointerEvents:'none'}}>
    <path d="M 10 280 Q 40 240 70 200 Q 100 160 130 130 Q 155 105 175 80 Q 190 60 200 40"
          stroke="#c8a96e" strokeWidth="5" fill="none" opacity="0.9" strokeLinecap="round"/>
    <path d="M 70 200 Q 45 185 30 165 Q 20 150 25 135"
          stroke="#c8a96e" strokeWidth="3.5" fill="none" opacity="0.8" strokeLinecap="round"/>
    <path d="M 100 160 Q 130 145 145 125 Q 155 110 150 95"
          stroke="#c8a96e" strokeWidth="3" fill="none" opacity="0.8" strokeLinecap="round"/>
    <path d="M 130 130 Q 105 110 95 85 Q 88 65 95 50"
          stroke="#c8a96e" strokeWidth="3" fill="none" opacity="0.75" strokeLinecap="round"/>
    <circle cx="165" cy="75" r="28" fill="#e8d5a8" opacity="0.7"/>
    <circle cx="165" cy="75" r="22" fill="none" stroke="#c8a96e" strokeWidth="1.5" opacity="0.8"/>
    <circle cx="165" cy="75" r="14" fill="#d4b87a" opacity="0.75"/>
    <circle cx="165" cy="75" r="8" fill="#b8963c" opacity="0.8"/>
    <circle cx="165" cy="75" r="4" fill="#fff8e0" opacity="0.9"/>
    {[0,45,90,135,180,225,270,315].map((angle, i) => {
      const rad = angle * Math.PI / 180
      const x = 165 + Math.cos(rad) * 22
      const y = 75 + Math.sin(rad) * 22
      return <ellipse key={i} cx={x} cy={y} rx="9" ry="5" fill="#d4b87a" opacity="0.65"
                      transform={`rotate(${angle} ${x} ${y})`}/>
    })}
    <circle cx="95" cy="55" r="20" fill="#e8d5a8" opacity="0.65"/>
    <circle cx="95" cy="55" r="12" fill="#d4b87a" opacity="0.7"/>
    <circle cx="95" cy="55" r="6" fill="#b8963c" opacity="0.8"/>
    <circle cx="95" cy="55" r="3" fill="#fff8e0" opacity="0.9"/>
    {[0,60,120,180,240,300].map((angle, i) => {
      const rad = angle * Math.PI / 180
      const x = 95 + Math.cos(rad) * 15
      const y = 55 + Math.sin(rad) * 15
      return <ellipse key={i} cx={x} cy={y} rx="7" ry="4" fill="#d4b87a" opacity="0.6"
                      transform={`rotate(${angle} ${x} ${y})`}/>
    })}
    <circle cx="35" cy="150" r="14" fill="#e8d5a8" opacity="0.65"/>
    <circle cx="35" cy="150" r="8" fill="#d4b87a" opacity="0.7"/>
    <circle cx="35" cy="150" r="4" fill="#b8963c" opacity="0.8"/>
    {[0,72,144,216,288].map((angle, i) => {
      const rad = angle * Math.PI / 180
      const x = 35 + Math.cos(rad) * 11
      const y = 150 + Math.sin(rad) * 11
      return <ellipse key={i} cx={x} cy={y} rx="6" ry="3.5" fill="#d4b87a" opacity="0.6"
                      transform={`rotate(${angle} ${x} ${y})`}/>
    })}
    {[
      [35, 255, -50, 28, 13],[55, 228, -45, 25, 12],[78, 200, -40, 24, 11],
      [100, 172, 20, 26, 12],[118, 152, -35, 22, 10],[138, 132, 25, 24, 11],
      [152, 115, -30, 20, 9],[165, 98, 20, 18, 8],
    ].map(([cx, cy, rotate, rx, ry], i) => (
      <g key={i}>
        <ellipse cx={cx} cy={cy} rx={rx} ry={ry} fill="#c8a96e" opacity="0.7"
                 transform={`rotate(${rotate} ${cx} ${cy})`}/>
        <line x1={cx - rx * 0.7 * Math.cos(rotate * Math.PI/180)}
              y1={cy - rx * 0.7 * Math.sin(rotate * Math.PI/180)}
              x2={cx + rx * 0.7 * Math.cos(rotate * Math.PI/180)}
              y2={cy + rx * 0.7 * Math.sin(rotate * Math.PI/180)}
              stroke="#b8963c" strokeWidth="1" opacity="0.5"/>
      </g>
    ))}
    <ellipse cx="28" cy="155" rx="16" ry="8" fill="#c8a96e" opacity="0.6" transform="rotate(30 28 155)"/>
    <ellipse cx="20" cy="140" rx="14" ry="7" fill="#d4b87a" opacity="0.55" transform="rotate(40 20 140)"/>
    <ellipse cx="140" cy="135" rx="18" ry="8" fill="#c8a96e" opacity="0.6" transform="rotate(-40 140 135)"/>
    <ellipse cx="150" cy="118" rx="15" ry="7" fill="#d4b87a" opacity="0.55" transform="rotate(-50 150 118)"/>
    {[
      [48, 240, 8],[65, 218, 7],[85, 192, 9],
      [108, 162, 7.5],[125, 143, 8],[145, 122, 7],
      [158, 108, 7.5],[170, 90, 6]
    ].map(([cx, cy, r], i) => (
      <g key={i}>
        <circle cx={cx} cy={cy} r={r} fill="white" opacity="0.9"/>
        <circle cx={cx} cy={cy} r={r} fill="none" stroke="#d4b87a" strokeWidth="1.5" opacity="0.8"/>
        <circle cx={cx - r*0.3} cy={cy - r*0.3} r={r*0.25} fill="white" opacity="0.7"/>
      </g>
    ))}
    <circle cx="120" cy="45" r="5" fill="white" opacity="0.85"/>
    <circle cx="120" cy="45" r="5" fill="none" stroke="#d4b87a" strokeWidth="1" opacity="0.7"/>
    <circle cx="130" cy="38" r="4" fill="white" opacity="0.8"/>
    <circle cx="140" cy="45" r="4.5" fill="white" opacity="0.85"/>
    <circle cx="183" cy="58" r="5" fill="white" opacity="0.85"/>
    <circle cx="190" cy="45" r="4" fill="white" opacity="0.8"/>
    <circle cx="198" cy="52" r="4.5" fill="white" opacity="0.85"/>
    <ellipse cx="200" cy="38" rx="8" ry="5" fill="#d4b87a" opacity="0.75" transform="rotate(-30 200 38)"/>
    <ellipse cx="210" cy="28" rx="6" ry="4" fill="#c8a96e" opacity="0.7" transform="rotate(-40 210 28)"/>
    <ellipse cx="185" cy="25" rx="7" ry="4.5" fill="#d4b87a" opacity="0.7" transform="rotate(-20 185 25)"/>
    <path d="M 155 80 Q 170 65 180 50" stroke="#d4b87a" strokeWidth="1" fill="none" opacity="0.5"/>
    <path d="M 170 85 Q 185 72 192 55" stroke="#d4b87a" strokeWidth="1" fill="none" opacity="0.45"/>
    <path d="M 88 58 Q 75 45 70 30" stroke="#d4b87a" strokeWidth="1" fill="none" opacity="0.5"/>
    <path d="M 102 50 Q 92 35 88 20" stroke="#d4b87a" strokeWidth="1" fill="none" opacity="0.45"/>
  </svg>
)

// ── IntroCarousel : fond photo de la section d'accueil ────────────────────────

type CropData = { url: string; cropX: number; cropY: number; cropScale: number }
function IntroCarousel({ photos, themeAccent, photosData }: { photos: string[]; themeAccent: string; photosData?: CropData[] }) {
  const valid = photos.filter(p => p && p.length > 0)
  const [idx, setIdx] = useState(0)
  const [visible, setVisible] = useState(true)

  useEffect(() => {
    if (valid.length <= 1) return
    const t = setInterval(() => {
      setVisible(false)
      setTimeout(() => { setIdx(p => (p + 1) % valid.length); setVisible(true) }, 600)
    }, 4000)
    return () => clearInterval(t)
  }, [valid.length])

  if (valid.length === 0) return null

  // Récupère le crop manuel pour la photo courante (si la mariée a recadré)
  const crop = photosData?.[idx]
  const hasCustomCrop = crop && (crop.cropX !== 0 || crop.cropY !== 0 || (crop.cropScale && crop.cropScale !== 1))

  // ── Source de la photo ──
  // - Si crop manuel : on utilise l'URL originale (le transform CSS gère le crop)
  // - Sinon : on utilise l'URL avec recadrage IA automatique sur les visages
  const photoSrc = hasCustomCrop ? valid[idx] : toCloudinaryFaceCrop(valid[idx])

  return (
    <>
      {hasCustomCrop ? (
        // ── Mode crop manuel : la mariée a recadré sa photo ──────────────
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            overflow: 'hidden',
            zIndex: 0,
            pointerEvents: 'none',
          }}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={photoSrc}
            alt=""
            style={{
              position: 'absolute',
              top: '50%',
              left: '50%',
              width: 'auto',
              height: '100%',
              transform: `translate(calc(-50% + ${crop!.cropX}px), calc(-50% + ${crop!.cropY}px)) scale(${crop!.cropScale})`,
              transformOrigin: 'center center',
              opacity: visible ? 1 : 0,
              transition: 'opacity 0.6s ease',
              maxWidth: 'none',
            }}
          />
        </div>
      ) : (
        // ── Mode IA automatique : crop sur les visages par Cloudinary ────
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={photoSrc}
          alt=""
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            objectPosition: 'center',
            opacity: visible ? 1 : 0,
            transition: 'opacity 0.6s ease',
            zIndex: 0,
            pointerEvents: 'none',
          }}
        />
      )}
      {/* Voile sombre en bas pour la lisibilité du texte */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          background: 'linear-gradient(to top, rgba(0,0,0,0.65) 0%, rgba(0,0,0,0.15) 50%, rgba(0,0,0,0) 100%)',
          zIndex: 1,
          pointerEvents: 'none',
        }}
      />
      {valid.length > 1 && (
        <div style={{ position: 'absolute', bottom: 80, left: '50%', transform: 'translateX(-50%)', display: 'flex', gap: 6, zIndex: 5, pointerEvents: 'none' }}>
          {valid.map((_, i) => (
            <div key={i} style={{ width: 6, height: 6, borderRadius: '50%', background: i === idx ? themeAccent : 'rgba(255,255,255,0.5)', transition: 'background 0.3s' }} />
          ))}
        </div>
      )}
    </>
  )
}
// ── AnimSection : fade-in au scroll ───────────────────────────────────────────
function AnimSection({ children, delay = 0, style, animStyle = 'slide-up' }: {
  children: React.ReactNode; delay?: number; style?: React.CSSProperties; animStyle?: string
}) {
  const ref = useRef<HTMLDivElement>(null)
  useEffect(() => {
    const el = ref.current
    if (!el) return
    el.style.opacity = '0'
    const getAnim = () => {
      switch(animStyle) {
        case 'fade':        return 'lovitFade 1s ease forwards'
        case 'slide-up':    return 'lovitSlideUp 0.9s cubic-bezier(0.22,1,0.36,1) forwards'
        case 'slide-left':  return 'lovitSlideLeft 0.9s cubic-bezier(0.22,1,0.36,1) forwards'
        case 'slide-right': return 'lovitSlideRight 0.9s cubic-bezier(0.22,1,0.36,1) forwards'
        case 'zoom':        return 'lovitZoom 0.7s cubic-bezier(0.34,1.56,0.64,1) forwards'
        case 'flip':        return 'lovitFlip 0.8s cubic-bezier(0.22,1,0.36,1) forwards'
        case 'rideau':      return 'lovitRideau 1.1s cubic-bezier(0.22,1,0.36,1) forwards'
        case 'brille':      return 'lovitBrille 1.2s ease forwards'
        case 'deplie':      return 'lovitDeplie 0.9s cubic-bezier(0.22,1,0.36,1) forwards'
        case 'flou':        return 'lovitFlou 1s ease forwards'
        default:            return 'lovitSlideUp 0.9s cubic-bezier(0.22,1,0.36,1) forwards'
      }
    }
    const obs = new IntersectionObserver(entries => {
      if (entries[0].isIntersecting) {
        el.style.animation = getAnim()
        el.style.animationDelay = `${delay}ms`
        obs.disconnect()
      }
    }, { threshold: 0.12 })
    obs.observe(el)
    return () => obs.disconnect()
  }, [animStyle, delay])
  return (
    <div ref={ref} style={{ opacity: 0, ...style }}>
      <style>{`
        @keyframes lovitFade { 
          from{opacity:0} to{opacity:1} 
        }
        @keyframes lovitSlideUp { 
          from{opacity:0;transform:translateY(60px)} 
          to{opacity:1;transform:translateY(0)} 
        }
        @keyframes lovitSlideLeft { 
          from{opacity:0;transform:translateX(60px)} 
          to{opacity:1;transform:translateX(0)} 
        }
        @keyframes lovitSlideRight { 
          from{opacity:0;transform:translateX(-60px)} 
          to{opacity:1;transform:translateX(0)} 
        }
        @keyframes lovitZoom { 
          from{opacity:0;transform:scale(0.7)} 
          to{opacity:1;transform:scale(1)} 
        }
        @keyframes lovitFlip { 
          from{opacity:0;transform:perspective(600px) rotateX(-90deg)} 
          to{opacity:1;transform:perspective(600px) rotateX(0)} 
        }
        @keyframes lovitRideau { 
          from{opacity:1;clip-path:inset(0 100% 0 0)} 
          to{opacity:1;clip-path:inset(0 0% 0 0)} 
        }
        @keyframes lovitBrille { 
          0%{opacity:0;filter:brightness(3) blur(4px)} 
          40%{opacity:1;filter:brightness(1.8) blur(1px)} 
          100%{opacity:1;filter:brightness(1) blur(0)} 
        }
        @keyframes lovitDeplie { 
          from{opacity:0;transform:scaleY(0);transform-origin:top} 
          to{opacity:1;transform:scaleY(1);transform-origin:top} 
        }
        @keyframes lovitFlou { 
          from{opacity:0;filter:blur(12px);transform:scale(1.05)} 
          to{opacity:1;filter:blur(0);transform:scale(1)} 
        }
      `}</style>
      {children}
    </div>
  )
}

// ── SharedPageContent : vue partagée page unique luxe ─────────────────────────

function CeremonyCard({ isCard, accent, children }: { isCard: boolean; accent: string; children: React.ReactNode }) {
  if (!isCard) return <>{children}</>
  return (
    <div style={{ margin: '24px 0', borderRadius: 16, overflow: 'hidden', boxShadow: '0 8px 32px rgba(0,0,0,0.13)', border: `1.5px solid ${accent}22` }}>
      {children}
    </div>
  )
}

interface SharedPageContentProps {
  data: FormData; theme: ThemeObj; sorted: Ceremony[]; role: string | null; lastShareId: string | null
  onRsvpOpen: () => void; onRsvpListOpen: () => void
  onStartYoutube?: () => void
  ytIframeRef: React.RefObject<HTMLIFrameElement | null>
  ytMuted: boolean; onToggleYtMute: () => void
}
// ── 💌 ENVELOPPE ──────────────────────────────────────────────────────────────
// ── 💌 ENVELOPPE INTERACTIVE ─────────────────────────────────────────────────
function AnimEnveloppe({ data, theme, onDone }: { data: FormData; theme: ThemeObj; onDone: () => void }) {
  const [clique, setClique] = useState(false)
  const [rabatOuvert, setRabatOuvert] = useState(false)
  const [carteVisible, setCarteVisible] = useState(false)
  const [disparait, setDisparait] = useState(false)

  const handleOpen = () => {
    if (clique) return
    setClique(true)
    setTimeout(() => setRabatOuvert(true), 100)
    setTimeout(() => setCarteVisible(true), 900)
    setTimeout(() => setDisparait(true), 2800)
    setTimeout(() => onDone(), 3400)
  }

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 9999, background: theme.fond, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', opacity: disparait ? 0 : 1, transition: 'opacity 0.6s ease', pointerEvents: disparait ? 'none' : 'auto' }}>
      <style>{`
        @keyframes envFloat{0%,100%{transform:translateY(0)}50%{transform:translateY(-8px)}}
        @keyframes carteSort{0%{opacity:0;transform:translateY(40px) scale(0.9)}60%{opacity:1;transform:translateY(-120px) scale(1.02)}100%{opacity:1;transform:translateY(-100px) scale(1)}}
        @keyframes btnPulse{0%,100%{box-shadow:0 0 0 0 ${theme.accent}44}70%{box-shadow:0 0 0 10px ${theme.accent}00}}
      `}</style>

      {/* Titre */}
      <div style={{ marginBottom: 36, textAlign: 'center', opacity: clique ? 0 : 1, transition: 'opacity 0.3s' }}>
        <div style={{ fontFamily: 'var(--font-cormorant-garamond)', fontStyle: 'italic', fontSize: 16, color: theme.accent, letterSpacing: 2 }}>
          Vous avez reçu une invitation
        </div>
        <div style={{ width: 40, height: '0.5px', background: theme.accent, opacity: 0.4, margin: '8px auto 0' }} />
      </div>

      <div style={{ position: 'relative', width: 300 }}>

        {/* Carte qui sort de l'enveloppe */}
        {carteVisible && (
          <div style={{ position: 'absolute', top: 0, left: 10, right: 10, zIndex: 5, animation: 'carteSort 1.2s cubic-bezier(0.22,1,0.36,1) forwards', background: 'white', borderRadius: 8, padding: '24px 20px', textAlign: 'center', boxShadow: `0 20px 60px ${theme.accent}44`, border: `1px solid ${theme.accent}33` }}>
            {data.mariageJuif && <div style={{ fontFamily: 'serif', fontSize: 13, color: theme.accent, direction: 'rtl', marginBottom: 12 }}>בס״ד</div>}
            {data.customLogoUrl ? <CustomLogo url={data.customLogoUrl} scale={data.customLogoSize} color={data.customLogoColor} size={60} /> : <MonogramByStyle initial1={(data.marie1Prenom || 'A')[0].toUpperCase()} initial2={(data.marie2Prenom || 'B')[0].toUpperCase()} color={theme.accent} size={60} style={data.monogrammeStyle || 'cercle'} />}
            <div style={{ fontFamily: 'var(--font-great-vibes)', fontSize: 38, color: theme.accent, lineHeight: 1.2, marginTop: 8 }}>
              {data.marie1Prenom}
            </div>
            <div style={{ fontFamily: 'var(--font-cormorant-garamond)', fontStyle: 'italic', fontSize: 18, color: theme.accent, opacity: 0.6 }}>&</div>
            <div style={{ fontFamily: 'var(--font-great-vibes)', fontSize: 38, color: theme.accent, lineHeight: 1.2 }}>
              {data.marie2Prenom}
            </div>
            <div style={{ width: 40, height: '0.5px', background: theme.accent, opacity: 0.3, margin: '12px auto' }} />
            <div style={{ fontFamily: 'var(--font-cormorant-garamond)', fontStyle: 'italic', fontSize: 12, color: theme.accent, opacity: 0.6, letterSpacing: 1 }}>
              vous invitent...
            </div>
          </div>
        )}

        {/* Enveloppe */}
        <div style={{ position: 'relative', animation: clique ? 'none' : 'envFloat 2.5s ease infinite', cursor: clique ? 'default' : 'pointer' }} onClick={handleOpen}>
          {/* Corps */}
          <div style={{ background: 'white', border: `1.5px solid ${theme.accent}33`, borderRadius: 12, height: 190, overflow: 'hidden', boxShadow: `0 12px 48px ${theme.accent}33` }}>
            {data.photosFond?.[0] ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={data.photosFond[0]} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover', opacity: 0.35 }} />
            ) : (
              <div style={{ width: '100%', height: '100%', background: `linear-gradient(135deg, ${theme.fond}, ${theme.accent}18)`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                {data.customLogoUrl ? <CustomLogo url={data.customLogoUrl} scale={data.customLogoSize} color={data.customLogoColor} size={70} /> : <MonogramByStyle initial1={(data.marie1Prenom || 'A')[0].toUpperCase()} initial2={(data.marie2Prenom || 'B')[0].toUpperCase()} color={theme.accent} size={70} style={data.monogrammeStyle || 'cercle'} />}
              </div>
            )}
            {/* V en bas */}
            <svg style={{ position: 'absolute', bottom: 0, left: 0, right: 0 }} width="300" height="70" viewBox="0 0 300 70">
              <path d="M0 70 L150 20 L300 70" fill={`${theme.accent}15`} stroke={`${theme.accent}22`} strokeWidth="1" />
            </svg>
          </div>

          {/* Rabat */}
          <div style={{
            position: 'absolute', top: 0, left: 0, right: 0, height: 105,
            transformOrigin: 'top center',
            transform: rabatOuvert ? 'rotateX(-185deg)' : 'rotateX(0deg)',
            transition: 'transform 1s cubic-bezier(0.22,1,0.36,1)',
            zIndex: 10,
            background: `linear-gradient(160deg, white, ${theme.fond}ee)`,
            border: `1.5px solid ${theme.accent}33`,
            borderBottom: 'none',
            borderRadius: '12px 12px 0 0',
            clipPath: 'polygon(0 0, 100% 0, 50% 100%)',
            boxShadow: `0 4px 20px ${theme.accent}11`,
          }} />

          {/* Sceau */}
          {!clique && (
            <div style={{ position: 'absolute', top: 48, left: '50%', transform: 'translateX(-50%)', zIndex: 20, width: 38, height: 38, borderRadius: '50%', background: `radial-gradient(circle at 35% 35%, ${theme.accent}, ${theme.accent}cc)`, display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: `0 2px 12px ${theme.accent}66` }}>
              <span style={{ fontFamily: 'serif', fontSize: 13, color: 'white', fontWeight: 700 }}>
                {(data.marie1Prenom || 'A')[0]}{(data.marie2Prenom || 'B')[0]}
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Bouton */}
      {!clique && (
        <button onClick={handleOpen} style={{ ...BTN, marginTop: 36, padding: '14px 40px', border: `1.5px solid ${theme.accent}`, borderRadius: 9999, background: 'transparent', color: theme.accent, fontFamily: 'var(--font-playfair-display)', fontSize: 13, fontWeight: 600, letterSpacing: 3, animation: 'btnPulse 2s ease infinite' }}>
          Ouvrir mon invitation ✦
        </button>
      )}
    </div>
  )
}
// ── 🕯️ BOUGIE ─────────────────────────────────────────────────────────────────
function AnimBougie({ data, theme, onDone }: { data: FormData; theme: ThemeObj; onDone: () => void }) {
  const [phase, setPhase] = useState(0)
  const [disparait, setDisparait] = useState(false)
  useEffect(() => {
    setTimeout(() => setPhase(1), 400)
    setTimeout(() => setPhase(2), 1400)
    setTimeout(() => setPhase(3), 2200)
    setTimeout(() => setDisparait(true), 3200)
    setTimeout(() => onDone(), 3800)
  }, [onDone])
  const radius = 280
  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 9999, background: '#0a0a0a', display: 'flex', alignItems: 'center', justifyContent: 'center', opacity: disparait ? 0 : 1, transition: 'opacity 0.6s ease', pointerEvents: disparait ? 'none' : 'auto' }}>
      <style>{`
        @keyframes flamme{0%,100%{transform:scaleX(1) scaleY(1)}25%{transform:scaleX(0.85) scaleY(1.1)}75%{transform:scaleX(1.1) scaleY(0.95)}}
        @keyframes lueur{0%,100%{opacity:0.6}50%{opacity:1}}
        @keyframes bougieReveal{from{opacity:0;transform:translateY(20px)}to{opacity:1;transform:translateY(0)}}
      `}</style>
      {/* Lueur rayonnante */}
      {phase >= 1 && (
        <div style={{ position: 'absolute', width: radius*2, height: radius*2, borderRadius: '50%', background: `radial-gradient(circle, ${theme.accent}44 0%, ${theme.accent}11 40%, transparent 70%)`, animation: 'lueur 1.5s ease infinite', transition: 'opacity 1s ease' }} />
      )}
      <div style={{ position: 'relative', display: 'flex', flexDirection: 'column', alignItems: 'center', zIndex: 2 }}>
        {/* Flamme SVG */}
        <div style={{ animation: phase >= 1 ? 'flamme 1.2s ease infinite' : 'none', transformOrigin: 'bottom center', marginBottom: -4 }}>
          <svg width="24" height="40" viewBox="0 0 24 40">
            <path d="M12 38 C6 38 2 32 2 26 C2 18 8 12 12 2 C16 12 22 18 22 26 C22 32 18 38 12 38Z" fill={`url(#fg)`} opacity={phase >= 1 ? 1 : 0} style={{ transition: 'opacity 0.5s' }} />
            <path d="M12 32 C9 32 8 28 8 25 C8 20 12 14 12 14 C12 14 16 20 16 25 C16 28 15 32 12 32Z" fill="white" opacity="0.6" />
            <defs>
              <radialGradient id="fg" cx="50%" cy="80%">
                <stop offset="0%" stopColor="#fff7aa" />
                <stop offset="40%" stopColor={theme.accent} />
                <stop offset="100%" stopColor="#ff6600" />
              </radialGradient>
            </defs>
          </svg>
        </div>
        {/* Bougie */}
        <div style={{ width: 20, height: 80, background: `linear-gradient(to bottom, #f5f0e8, #e8e0d0)`, borderRadius: '2px 2px 4px 4px', boxShadow: `0 0 20px ${theme.accent}44`, position: 'relative' }}>
          <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '60%', background: `linear-gradient(to right, rgba(255,255,255,0.3), transparent, rgba(255,255,255,0.1))` }} />
        </div>
        {/* Texte qui apparaît */}
        {phase >= 2 && (
          <div style={{ marginTop: 40, textAlign: 'center', animation: 'bougieReveal 0.9s ease forwards' }}>
            <div style={{ fontFamily: 'var(--font-great-vibes)', fontSize: 42, color: theme.accent, lineHeight: 1.2, textShadow: `0 0 30px ${theme.accent}88` }}>
              {data.marie1Prenom}
            </div>
            <div style={{ fontFamily: 'var(--font-cormorant-garamond)', fontStyle: 'italic', fontSize: 20, color: `${theme.accent}99`, margin: '4px 0' }}>&</div>
            <div style={{ fontFamily: 'var(--font-great-vibes)', fontSize: 42, color: theme.accent, lineHeight: 1.2, textShadow: `0 0 30px ${theme.accent}88` }}>
              {data.marie2Prenom}
            </div>
          </div>
        )}
        {phase >= 3 && (
          <div style={{ marginTop: 20, fontFamily: 'var(--font-cormorant-garamond)', fontStyle: 'italic', fontSize: 14, color: `${theme.accent}88`, letterSpacing: 2, animation: 'bougieReveal 0.6s ease forwards' }}>
            vous invitent...
          </div>
        )}
      </div>
    </div>
  )
}

// ── ✍️ PLUME ──────────────────────────────────────────────────────────────────
function AnimPlume({ data, theme, onDone }: { data: FormData; theme: ThemeObj; onDone: () => void }) {
  const [phase, setPhase] = useState(0)
  const [disparait, setDisparait] = useState(false)
  const prenom1 = data.marie1Prenom || 'Prénom'
  const prenom2 = data.marie2Prenom || 'Prénom'
  useEffect(() => {
    setTimeout(() => setPhase(1), 300)
    setTimeout(() => setPhase(2), 1800)
    setTimeout(() => setPhase(3), 3000)
    setTimeout(() => setDisparait(true), 4000)
    setTimeout(() => onDone(), 4600)
  }, [onDone])
  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 9999, background: theme.fond, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', opacity: disparait ? 0 : 1, transition: 'opacity 0.6s ease', pointerEvents: disparait ? 'none' : 'auto' }}>
      <style>{`
        @keyframes ecrire1{from{clip-path:inset(0 100% 0 0)}to{clip-path:inset(0 0% 0 0)}}
        @keyframes ecrire2{from{clip-path:inset(0 100% 0 0)}to{clip-path:inset(0 0% 0 0)}}
        @keyframes plumeMove{0%{transform:translateX(-60px) rotate(-15deg)}100%{transform:translateX(60px) rotate(-15deg)}}
        @keyframes plumeMove2{0%{transform:translateX(-40px) rotate(-15deg)}100%{transform:translateX(40px) rotate(-15deg)}}
        @keyframes separateur{from{width:0}to{width:80px}}
        @keyframes fadeInUp{from{opacity:0;transform:translateY(10px)}to{opacity:1;transform:translateY(0)}}
      `}</style>
      <div style={{ textAlign: 'center', position: 'relative' }}>
        {/* Plume qui écrit prénom 1 */}
        {phase >= 1 && (
          <div style={{ position: 'relative', marginBottom: 8 }}>
            <div style={{ fontFamily: 'var(--font-great-vibes)', fontSize: 'clamp(48px,12vw,72px)', color: theme.accent, animation: 'ecrire1 1.2s cubic-bezier(0.22,1,0.36,1) forwards', clipPath: 'inset(0 100% 0 0)' }}>
              {prenom1}
            </div>
            <div style={{ position: 'absolute', top: '30%', animation: 'plumeMove 1.2s cubic-bezier(0.22,1,0.36,1) forwards', opacity: phase === 1 ? 1 : 0, transition: 'opacity 0.3s' }}>
              <svg width="32" height="48" viewBox="0 0 32 48" fill="none">
                <path d="M28 2 C28 2 4 20 2 44 C2 44 14 30 20 28 C26 26 30 34 28 44" stroke={theme.accent} strokeWidth="1.5" strokeLinecap="round" fill="none" opacity="0.8"/>
                <path d="M28 2 C28 2 32 8 28 14 C24 20 18 22 16 28" stroke={theme.accent} strokeWidth="1" strokeLinecap="round" fill={`${theme.accent}33`} opacity="0.6"/>
                <circle cx="2" cy="44" r="2" fill={theme.accent} opacity="0.9"/>
              </svg>
            </div>
          </div>
        )}
        {/* Séparateur */}
        {phase >= 2 && (
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 12, marginBottom: 8, animation: 'fadeInUp 0.5s ease forwards' }}>
            <div style={{ height: '0.5px', background: theme.accent, opacity: 0.4, animation: 'separateur 0.6s ease forwards', width: 0 }} />
            <span style={{ fontFamily: 'var(--font-cormorant-garamond)', fontStyle: 'italic', fontSize: 22, color: theme.accent, opacity: 0.7 }}>&</span>
            <div style={{ height: '0.5px', background: theme.accent, opacity: 0.4, animation: 'separateur 0.6s ease forwards', width: 0 }} />
          </div>
        )}
        {/* Plume qui écrit prénom 2 */}
        {phase >= 2 && (
          <div style={{ position: 'relative' }}>
            <div style={{ fontFamily: 'var(--font-great-vibes)', fontSize: 'clamp(48px,12vw,72px)', color: theme.accent, animation: 'ecrire2 1.2s cubic-bezier(0.22,1,0.36,1) forwards', clipPath: 'inset(0 100% 0 0)' }}>
              {prenom2}
            </div>
            <div style={{ position: 'absolute', top: '30%', animation: 'plumeMove2 1.2s cubic-bezier(0.22,1,0.36,1) forwards', opacity: phase === 2 ? 1 : 0, transition: 'opacity 0.3s' }}>
              <svg width="32" height="48" viewBox="0 0 32 48" fill="none">
                <path d="M28 2 C28 2 4 20 2 44 C2 44 14 30 20 28 C26 26 30 34 28 44" stroke={theme.accent} strokeWidth="1.5" strokeLinecap="round" fill="none" opacity="0.8"/>
                <path d="M28 2 C28 2 32 8 28 14 C24 20 18 22 16 28" stroke={theme.accent} strokeWidth="1" strokeLinecap="round" fill={`${theme.accent}33`} opacity="0.6"/>
                <circle cx="2" cy="44" r="2" fill={theme.accent} opacity="0.9"/>
              </svg>
            </div>
          </div>
        )}
        {phase >= 3 && (
          <div style={{ marginTop: 24, fontFamily: 'var(--font-cormorant-garamond)', fontStyle: 'italic', fontSize: 15, color: theme.accent, opacity: 0.7, letterSpacing: 2, animation: 'fadeInUp 0.6s ease forwards' }}>
            vous invitent à célébrer leur union
          </div>
        )}
      </div>
    </div>
  )
}

// ── 💫 SCEAU DE CIRE ──────────────────────────────────────────────────────────
function AnimSceau({ data, theme, onDone }: { data: FormData; theme: ThemeObj; onDone: () => void }) {
  const [phase, setPhase] = useState(0)
  const [disparait, setDisparait] = useState(false)
  useEffect(() => {
    setTimeout(() => setPhase(1), 400)
    setTimeout(() => setPhase(2), 1200)
    setTimeout(() => setPhase(3), 2000)
    setTimeout(() => setDisparait(true), 3200)
    setTimeout(() => onDone(), 3800)
  }, [onDone])
  const i1 = (data.marie1Prenom || 'A')[0].toUpperCase()
  const i2 = (data.marie2Prenom || 'B')[0].toUpperCase()
  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 9999, background: theme.fond, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', opacity: disparait ? 0 : 1, transition: 'opacity 0.8s ease', pointerEvents: disparait ? 'none' : 'auto' }}>
      <style>{`
        @keyframes sceauAppear{0%{opacity:0;transform:scale(3) rotate(-30deg)}60%{transform:scale(0.9) rotate(2deg)}100%{opacity:1;transform:scale(1) rotate(0deg)}}
        @keyframes sceauPulse{0%,100%{box-shadow:0 0 0 0 ${theme.accent}44}50%{box-shadow:0 0 0 20px ${theme.accent}00}}
        @keyframes sceauCrack{0%{opacity:0}100%{opacity:1}}
        @keyframes textReveal{from{opacity:0;transform:scale(0.8)}to{opacity:1;transform:scale(1)}}
      `}</style>
      {/* Sceau principal */}
      {phase >= 1 && (
        <div style={{ position: 'relative', animation: 'sceauAppear 0.7s cubic-bezier(0.34,1.56,0.64,1) forwards', marginBottom: 40 }}>
          {/* Cercle extérieur */}
          <div style={{ width: 160, height: 160, borderRadius: '50%', background: `radial-gradient(circle at 35% 35%, ${theme.accent}ff, ${theme.accent}bb)`, display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: `0 8px 32px ${theme.accent}66, inset 0 2px 4px rgba(255,255,255,0.3)`, animation: phase === 1 ? 'sceauPulse 1s ease infinite' : 'none', position: 'relative', overflow: 'hidden' }}>
            {/* Texture cire */}
            <div style={{ position: 'absolute', inset: 0, borderRadius: '50%', background: `radial-gradient(circle at 60% 60%, rgba(0,0,0,0.15), transparent 60%)` }} />
            {/* Bordure décorative */}
            <svg style={{ position: 'absolute', inset: 0 }} width="160" height="160" viewBox="0 0 160 160">
              <circle cx="80" cy="80" r="72" fill="none" stroke="rgba(255,255,255,0.3)" strokeWidth="1" strokeDasharray="4 3" />
              <circle cx="80" cy="80" r="60" fill="none" stroke="rgba(255,255,255,0.2)" strokeWidth="0.5" />
            </svg>
            {/* Monogramme */}
            <div style={{ position: 'relative', zIndex: 2 }}>
              {data.customLogoUrl ? <CustomLogo url={data.customLogoUrl} scale={data.customLogoSize} color={data.customLogoColor} size={90} /> : <MonogramByStyle initial1={i1} initial2={i2} color="white" size={90} style={data.monogrammeStyle || 'cercle'} />}
            </div>
          </div>
          {/* Fissures quand le sceau s'ouvre */}
          {phase >= 2 && (
            <svg style={{ position: 'absolute', inset: 0, animation: 'sceauCrack 0.4s ease forwards' }} width="160" height="160" viewBox="0 0 160 160">
              <path d="M80 10 L75 50 L60 80 L80 80" stroke="rgba(255,255,255,0.5)" strokeWidth="1.5" fill="none" strokeLinecap="round"/>
              <path d="M80 150 L85 110 L100 80 L80 80" stroke="rgba(255,255,255,0.5)" strokeWidth="1.5" fill="none" strokeLinecap="round"/>
              <path d="M10 80 L50 75 L80 60 L80 80" stroke="rgba(255,255,255,0.4)" strokeWidth="1" fill="none" strokeLinecap="round"/>
            </svg>
          )}
        </div>
      )}
      {/* Prénoms qui apparaissent */}
      {phase >= 3 && (
        <div style={{ textAlign: 'center', animation: 'textReveal 0.7s cubic-bezier(0.22,1,0.36,1) forwards' }}>
          <div style={{ fontFamily: 'var(--font-great-vibes)', fontSize: 'clamp(36px,9vw,56px)', color: theme.accent, lineHeight: 1.2 }}>
            {data.marie1Prenom} & {data.marie2Prenom}
          </div>
          <div style={{ width: 60, height: '0.5px', background: theme.accent, opacity: 0.4, margin: '12px auto' }} />
          <div style={{ fontFamily: 'var(--font-cormorant-garamond)', fontStyle: 'italic', fontSize: 14, color: theme.accent, opacity: 0.7, letterSpacing: 2 }}>
            Brisez le sceau & découvrez
          </div>
        </div>
      )}
    </div>
  )
}

// ── 🌹 PÉTALES ────────────────────────────────────────────────────────────────
function AnimPetales({ data, theme, onDone }: { data: FormData; theme: ThemeObj; onDone: () => void }) {
  const [phase, setPhase] = useState(0)
  const [disparait, setDisparait] = useState(false)
  useEffect(() => {
    setTimeout(() => setPhase(1), 200)
    setTimeout(() => setPhase(2), 1400)
    setTimeout(() => setDisparait(true), 3400)
    setTimeout(() => onDone(), 4000)
  }, [onDone])
  const petales = Array.from({ length: 18 }, (_, i) => ({
    id: i,
    left: Math.random() * 100,
    delay: Math.random() * 1.5,
    duration: 2 + Math.random() * 2,
    size: 12 + Math.random() * 16,
    rotation: Math.random() * 360,
  }))
  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 9999, background: theme.fond, display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden', opacity: disparait ? 0 : 1, transition: 'opacity 0.6s ease', pointerEvents: disparait ? 'none' : 'auto' }}>
      <style>{`
        @keyframes petaleFall{0%{transform:translateY(-60px) rotate(0deg);opacity:0}10%{opacity:1}90%{opacity:0.7}100%{transform:translateY(110vh) rotate(720deg);opacity:0}}
        @keyframes prenomGlow{from{opacity:0;transform:scale(0.9)}to{opacity:1;transform:scale(1)}}
      `}</style>
      {/* Pétales */}
      {phase >= 1 && petales.map(p => (
        <div key={p.id} style={{ position: 'absolute', left: `${p.left}%`, top: -20, animation: `petaleFall ${p.duration}s ease ${p.delay}s infinite`, pointerEvents: 'none' }}>
          <svg width={p.size} height={p.size * 1.3} viewBox="0 0 20 26">
            <ellipse cx="10" cy="13" rx="8" ry="12" fill={theme.accent} opacity="0.6" transform={`rotate(${p.rotation} 10 13)`} />
            <ellipse cx="10" cy="13" rx="5" ry="9" fill={theme.accent} opacity="0.3" transform={`rotate(${p.rotation + 30} 10 13)`} />
          </svg>
        </div>
      ))}
      {/* Contenu central */}
      <div style={{ textAlign: 'center', position: 'relative', zIndex: 2 }}>
        {phase >= 2 && (
          <div style={{ animation: 'prenomGlow 1s cubic-bezier(0.22,1,0.36,1) forwards' }}>
            <div style={{ fontFamily: 'var(--font-great-vibes)', fontSize: 'clamp(48px,12vw,72px)', color: theme.accent, lineHeight: 1.1, textShadow: `0 2px 20px ${theme.accent}44` }}>
              {data.marie1Prenom}
            </div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 12, margin: '8px 0' }}>
              <div style={{ width: 32, height: '0.5px', background: theme.accent, opacity: 0.4 }} />
              <span style={{ color: theme.accent, fontSize: 10 }}>✦</span>
              <div style={{ width: 32, height: '0.5px', background: theme.accent, opacity: 0.4 }} />
            </div>
            <div style={{ fontFamily: 'var(--font-great-vibes)', fontSize: 'clamp(48px,12vw,72px)', color: theme.accent, lineHeight: 1.1, textShadow: `0 2px 20px ${theme.accent}44` }}>
              {data.marie2Prenom}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

// ── 📜 PARCHEMIN ──────────────────────────────────────────────────────────────
function AnimParchemin({ data, theme, onDone }: { data: FormData; theme: ThemeObj; onDone: () => void }) {
  const [ouvert, setOuvert] = useState(false)
  const [disparait, setDisparait] = useState(false)

  useEffect(() => {
    setTimeout(() => setOuvert(true), 400)
  }, [])

  const handleOpen = () => {
    setDisparait(true)
    setTimeout(() => onDone(), 600)
  }

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 9999, background: '#1a1008', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', opacity: disparait ? 0 : 1, transition: 'opacity 0.6s ease', pointerEvents: disparait ? 'none' : 'auto', padding: '20px' }}>
      <style>{`
        @keyframes derouler{from{max-height:80px}to{max-height:600px}}
        @keyframes parchTextIn{from{opacity:0;transform:translateY(16px)}to{opacity:1;transform:translateY(0)}}
      `}</style>

      <div style={{ position: 'relative', width: '100%', maxWidth: 300, overflowY: 'auto', maxHeight: '90vh' }}>
        {/* Rouleau haut */}
        <div style={{ height: 28, background: 'linear-gradient(to bottom, #d4b87a, #a07840, #d4b87a)', borderRadius: '6px 6px 0 0', boxShadow: '0 -4px 16px rgba(0,0,0,0.5), inset 0 2px 4px rgba(255,255,255,0.25)', position: 'relative', zIndex: 2 }}>
          <div style={{ position: 'absolute', left: '10%', right: '10%', top: '50%', transform: 'translateY(-50%)', height: 2, background: 'rgba(255,255,255,0.15)', borderRadius: 1 }} />
        </div>

        {/* Corps */}
        <div style={{ background: 'linear-gradient(135deg, #fdf5e4 0%, #f5e6c8 50%, #fdf5e4 100%)', overflow: 'hidden', maxHeight: ouvert ? 600 : 80, animation: ouvert ? 'derouler 1.8s cubic-bezier(0.22,1,0.36,1) forwards' : 'none', boxShadow: '6px 0 16px rgba(0,0,0,0.4), -6px 0 16px rgba(0,0,0,0.4)' }}>
          <div style={{ padding: '28px 32px', textAlign: 'center' }}>
            {data.mariageJuif && (
              <div style={{ fontFamily: 'serif', fontSize: 15, color: theme.accent, direction: 'rtl', marginBottom: 16, animation: 'parchTextIn 0.6s ease 0.8s forwards', opacity: 0 }}>בס״ד</div>
            )}
            <div style={{ fontFamily: 'var(--font-cormorant-garamond)', fontStyle: 'italic', fontSize: 11, color: '#8a6040', letterSpacing: 4, textTransform: 'uppercase', marginBottom: 16, animation: 'parchTextIn 0.6s ease 1s forwards', opacity: 0 }}>
              Invitation
            </div>
            <div style={{ width: 50, height: '0.5px', background: theme.accent, margin: '0 auto 20px', animation: 'parchTextIn 0.4s ease 1.1s forwards', opacity: 0 }} />
            <div style={{ animation: 'parchTextIn 0.6s ease 1.2s forwards', opacity: 0, marginBottom: 16 }}>
              {data.customLogoUrl ? <CustomLogo url={data.customLogoUrl} scale={data.customLogoSize} color={data.customLogoColor} size={60} /> : <MonogramByStyle initial1={(data.marie1Prenom || 'A')[0].toUpperCase()} initial2={(data.marie2Prenom || 'B')[0].toUpperCase()} color={theme.accent} size={60} style={data.monogrammeStyle || 'cercle'} />}
            </div>
            <div style={{ fontFamily: 'var(--font-great-vibes)', fontSize: 52, color: theme.accent, lineHeight: 1.1, animation: 'parchTextIn 0.8s ease 1.4s forwards', opacity: 0 }}>
              {data.marie1Prenom}
            </div>
            <div style={{ fontFamily: 'var(--font-cormorant-garamond)', fontStyle: 'italic', fontSize: 22, color: '#8a6040', animation: 'parchTextIn 0.5s ease 1.7s forwards', opacity: 0 }}>&</div>
            <div style={{ fontFamily: 'var(--font-great-vibes)', fontSize: 52, color: theme.accent, lineHeight: 1.1, marginBottom: 20, animation: 'parchTextIn 0.8s ease 1.9s forwards', opacity: 0 }}>
              {data.marie2Prenom}
            </div>
            <div style={{ width: 50, height: '0.5px', background: theme.accent, margin: '0 auto 16px', animation: 'parchTextIn 0.4s ease 2.2s forwards', opacity: 0 }} />
            <div style={{ fontFamily: 'var(--font-cormorant-garamond)', fontStyle: 'italic', fontSize: 12, color: '#8a6040', letterSpacing: 1, marginBottom: 28, animation: 'parchTextIn 0.6s ease 2.4s forwards', opacity: 0 }}>
              vous invitent à célébrer leur union
            </div>
            {/* Bouton découvrir en bas du parchemin */}
            <div style={{ animation: 'parchTextIn 0.6s ease 2.8s forwards', opacity: 0 }}>
              <button onClick={handleOpen} style={{ ...BTN, padding: '12px 32px', border: `1.5px solid ${theme.accent}`, borderRadius: 9999, background: 'transparent', color: theme.accent, fontFamily: 'var(--font-playfair-display)', fontSize: 11, fontWeight: 600, letterSpacing: 3 }}>
                Découvrir mon invitation ✦
              </button>
            </div>
          </div>
        </div>

        {/* Rouleau bas */}
        <div style={{ height: 28, background: 'linear-gradient(to top, #d4b87a, #a07840, #d4b87a)', borderRadius: '0 0 6px 6px', boxShadow: '0 4px 16px rgba(0,0,0,0.5), inset 0 -2px 4px rgba(255,255,255,0.25)', position: 'relative', zIndex: 2 }}>
          <div style={{ position: 'absolute', left: '10%', right: '10%', top: '50%', transform: 'translateY(-50%)', height: 2, background: 'rgba(255,255,255,0.15)', borderRadius: 1 }} />
        </div>
      </div>
    </div>
  )
}
// ── DISPATCHER ────────────────────────────────────────────────────────────────
function EnveloppeAnimation({ data, theme, onDone }: { data: FormData; theme: ThemeObj; onDone: () => void }) {
  const anim = data.introAnimation || 'none'
  if (anim === 'petales')   return <AnimPetales   data={data} theme={theme} onDone={onDone} />
  if (anim === 'parchemin') return <AnimParchemin data={data} theme={theme} onDone={onDone} />
  return <AnimEnveloppe data={data} theme={theme} onDone={onDone} />
}

// ── ItineraireButtons : Google Maps + Waze avec design luxe ───────────────────
function SharedPageContent({ data, theme, sorted, role, lastShareId: _lastShareId, onRsvpOpen, onRsvpListOpen, onStartYoutube, ytIframeRef, ytMuted, onToggleYtMute }: SharedPageContentProps) {
  const contentRef = useRef<HTMLDivElement>(null)
  const [currentCeremonyIdx, setCurrentCeremonyIdx] = useState(0)
  const [, setContainerWidth] = useState(360)
  const G = theme.accent
  const TEXT = theme.texte
  const FS = 'var(--font-great-vibes)'
  const FP = 'var(--font-playfair-display)'
  const FC = 'var(--font-cormorant-garamond)'
  const ov = data.textOverrides ?? {}
  const i1 = (data.marie1Prenom || 'A')[0].toUpperCase()
  const i2 = (data.marie2Prenom || 'B')[0].toUpperCase()
  const monoColor = data.monogrammeColor || G
  const parents1 = fmtParentsLines(data.famille1PerePrenom, data.famille1PereNom, data.famille1MerePrenom, data.famille1MereNom)
  const parents2 = fmtParentsLines(data.famille2PerePrenom, data.famille2PereNom, data.famille2MerePrenom, data.famille2MereNom)
  const gpPa1 = fmtGpCouple(data.famille1GpPaPerePrenom, data.famille1GpPaPereNom, data.famille1GpPaMerePrenom, data.famille1GpPaMereNom)
  const gpMa1 = fmtGpCouple(data.famille1GpMaPerePrenom, data.famille1GpMaPereNom, data.famille1GpMaMerePrenom, data.famille1GpMaMereNom)
  const gpPa2 = fmtGpCouple(data.famille2GpPaPerePrenom, data.famille2GpPaPereNom, data.famille2GpPaMerePrenom, data.famille2GpPaMereNom)
  const gpMa2 = fmtGpCouple(data.famille2GpMaPerePrenom, data.famille2GpMaPereNom, data.famille2GpMaMerePrenom, data.famille2GpMaMereNom)
  const hasGp = !!(gpPa1 || gpMa1 || gpPa2 || gpMa2)
  // Date affichée sur la page d'accueil : priorité à l'override manuel, 
// sinon la cérémonie religieuse/Houppa, sinon la première date
const dateAccueil = data.dateAccueilOverride 
  || sorted.find(c => c.type === 'Cérémonie religieuse / Houppa')?.date
  || sorted[0]?.date
const firstDate = sorted[0]?.date

  const hasIntroPhoto = (data.photosFond?.length ?? 0) > 0 || !!data.photoFond
  const introTextColor = hasIntroPhoto ? 'rgba(255,255,255,0.95)' : G
  const fondCeremonie = data.fondCeremonie ?? 'ornements'
  const firstPhoto = data.photosFond?.[0] ?? data.photoFond ?? ''

  const ornUrl = ORNEMENTS_LIBRARY.find(o => o.id === (data.ornamentId ?? 'none'))?.url ?? ''
  const frame = FRAMES.find(f => f.id === (data.frameId ?? 'frame-09')) ?? FRAMES[FRAMES.length - 1]
  const hasFrame = !!frame.url
  const OrnTR = () => <OrnementCorner url={ornUrl} corner="top-right" size={85} />
  const OrnBL = () => <OrnementCorner url={ornUrl} corner="bottom-left" size={85} />
  const OrnTL = () => <OrnementCorner url={ornUrl} corner="top-left" size={85} />
  const OrnBR = () => <OrnementCorner url={ornUrl} corner="bottom-right" size={85} />

  const anim = data.animationStyle || 'slide-up'

  const OrnSep = () => (
    <div style={{ display: 'flex', alignItems: 'center', gap: 10, justifyContent: 'center', margin: '0 auto 24px', maxWidth: 160 }}>
      <div style={{ flex: 1, height: 0.5, background: G, opacity: 0.3 }} />
      <span style={{ color: G, fontSize: 10, opacity: 0.7 }}>◆</span>
      <div style={{ flex: 1, height: 0.5, background: G, opacity: 0.3 }} />
    </div>
  )
  const LineSep = () => (
    <div style={{ display: 'flex', alignItems: 'center', gap: 10, justifyContent: 'center', margin: '20px auto' }}>
      <div style={{ width: 40, height: 0.5, background: G, opacity: 0.3 }} />
      <span style={{ color: G, fontSize: 9, opacity: 0.5 }}>✦</span>
      <div style={{ width: 40, height: 0.5, background: G, opacity: 0.3 }} />
    </div>
  )

  useEffect(() => {
    if (!contentRef.current) return
    const observer = new ResizeObserver(entries => {
      for (const entry of entries) setContainerWidth(entry.contentRect.width)
    })
    observer.observe(contentRef.current)
    return () => observer.disconnect()
  }, [])

  const audioPlayRef = useRef<(() => void) | null>(null)

 const handleDiscover = () => {
  audioPlayRef.current?.()
  onStartYoutube?.()
  setTimeout(() => contentRef.current?.scrollIntoView({ behavior: 'smooth' }), 50)
}

  return (
    <div style={{ backgroundColor: '#f5f0e8', minHeight: '100vh' }}>
      <div style={{ backgroundColor: theme.fond, color: TEXT, minHeight: '100vh', maxWidth: 480, margin: '0 auto', boxShadow: '0 0 40px rgba(0,0,0,0.08)' }}>
      <style>{`@keyframes sharedFadeIn{from{opacity:0;transform:translateY(18px)}to{opacity:1;transform:translateY(0)}}`}</style>
{/* SECTION 1 : Écran d'accueil */}
      <div style={{ position: 'relative', minHeight: '100svh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', overflow: 'hidden', maxWidth: 480, margin: '0 auto', boxShadow: '0 8px 60px rgba(0,0,0,0.15)' }}>
        {data.styleAccueil !== 'illustration' && (
          <IntroCarousel photos={data.photosFond?.length ? data.photosFond : (data.photoFond ? [data.photoFond] : [])} themeAccent={G} photosData={data.photosData} />
        )}
        <div style={{ textAlign: 'center', position: 'relative', zIndex: 1, padding: '0 32px', maxWidth: 480, width: '100%', margin: '0 auto' }}>
          {data.mariageJuif && <div style={{ fontFamily: 'serif', fontSize: 16, color: introTextColor, direction: 'rtl', marginBottom: 20, animation: 'sharedFadeIn 0.9s ease forwards' }}>בס״ד</div>}
          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 16, animation: 'sharedFadeIn 1s ease forwards', opacity: 0 }}>
            {data.customLogoUrl ? <CustomLogo url={data.customLogoUrl} scale={data.customLogoSize} color={data.customLogoColor} size={140} /> : <MonogramByStyle initial1={i1} initial2={i2} color={monoColor}size={140} style={data.monogrammeStyle || 'cercle'} />}
          </div>
          {data.styleAccueil === 'illustration' && data.illustrationCoupleId && (
            <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 30, animation: 'sharedFadeIn 1s 0.2s ease forwards', opacity: 0 }}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={ILLUSTRATIONS_COUPLES.find(ic => ic.id === data.illustrationCoupleId)?.url} alt="" style={{ maxWidth: '70%', maxHeight: 280, objectFit: 'contain' }} />
            </div>
          )}
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, justifyContent: 'center', margin: '0 auto 16px', maxWidth: 160 }}>
            <div style={{ flex: 1, height: 0.5, background: introTextColor, opacity: 0.4 }} />
            <span style={{ color: introTextColor, fontSize: 10, opacity: 0.7 }}>◆</span>
            <div style={{ flex: 1, height: 0.5, background: introTextColor, opacity: 0.4 }} />
          </div>
          <div style={{ fontFamily: FS, fontSize: 'clamp(30px,8vw,46px)', color: introTextColor, marginBottom: 16, animation: 'sharedFadeIn 1s 0.35s ease forwards', opacity: 0, lineHeight: 1.2, textShadow: hasIntroPhoto ? '0 2px 12px rgba(0,0,0,0.4)' : 'none' }}>
            {data.marie1Prenom || 'Prénom'} & {data.marie2Prenom || 'Prénom'}
          </div>
          <div style={{ fontFamily: FC, fontStyle: 'italic', fontSize: 15, color: introTextColor, marginBottom: 36, animation: 'sharedFadeIn 1s 0.55s ease forwards', opacity: 0, textAlign: 'center', lineHeight: 1.7, textShadow: hasIntroPhoto ? '0 1px 8px rgba(0,0,0,0.35)' : 'none' }}>
            ont le plaisir de vous convier à leur mariage
          </div>
          <button onClick={handleDiscover} style={{ ...BTN, background: G, color: 'white', border: 'none', borderRadius: 2, padding: '14px 40px', fontFamily: FP, fontSize: 11, fontWeight: 700, letterSpacing: 4, textTransform: 'uppercase', boxShadow: `0 4px 20px ${G}44`, animation: 'sharedFadeIn 1s 0.7s ease forwards', opacity: 0 } as React.CSSProperties}>
            DÉCOUVRIR TON INVITATION
          </button>
        </div>
        </div>
      </div>

      {/* CONTENU PRINCIPAL */}
      <div ref={contentRef} style={{ maxWidth: 480, margin: '0 auto', padding: '0 0 80px' }}>

        {/* SECTION 2 : Intro */}
        <section style={{ paddingTop: 96, paddingBottom: 96, position: 'relative', borderBottom: `1px solid ${G}1a`, overflow: 'visible' }}>
          {!hasFrame && <><OrnTL /><OrnBR /></>}
          <div style={{ position: 'relative', zIndex: 1 }}>
            <AnimSection animStyle={anim}>
              {data.mariageJuif && <div style={{ fontFamily: 'serif', fontSize: 14, color: G, direction: 'rtl', textAlign: 'right', marginBottom: 16 }}>בס״ד</div>}
              <div style={{ fontFamily: FC, fontStyle: 'italic', fontSize: 16, color: G, textAlign: 'center', letterSpacing: 1, marginBottom: 14 }}>
                Le Mariage de
              </div>
              <LineSep />
            </AnimSection>
            <AnimSection animStyle={anim} delay={150}>
              <style>{`@keyframes prenomAppear{from{opacity:0;transform:translateY(20px)}to{opacity:1;transform:translateY(0)}}`}</style>
              <div style={{ position: 'relative', textAlign: 'center', marginBottom: 8 }}>
                {data.marie1PrenomHebreu && (
                  <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'serif', fontSize: 'clamp(44px,11vw,70px)', color: G, direction: 'rtl', opacity: 0.12, zIndex: 0, pointerEvents: 'none', userSelect: 'none' }}>
                    {data.marie1PrenomHebreu}
                  </div>
                )}
                <div style={applyZoneStyle({ fontFamily: FS, fontSize: 'clamp(40px,10vw,60px)', color: G, lineHeight: 1.1, position: 'relative', zIndex: 1, opacity: 0, animation: 'prenomAppear 1.2s ease 0.3s forwards' }, 'prenoms', data.zoneStyles)}>
                  {data.marie1Prenom || 'Prénom'}
                </div>
              </div>
              <div style={{ fontFamily: FC, fontStyle: 'italic', fontSize: 24, color: TEXT, textAlign: 'center', marginBottom: 8, opacity: 0.7 }}>&</div>
              <div style={{ position: 'relative', textAlign: 'center', marginBottom: 24 }}>
                {data.marie2PrenomHebreu && (
                  <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'serif', fontSize: 'clamp(44px,11vw,70px)', color: G, direction: 'rtl', opacity: 0.12, zIndex: 0, pointerEvents: 'none', userSelect: 'none' }}>
                    {data.marie2PrenomHebreu}
                  </div>
                )}
                <div style={applyZoneStyle({ fontFamily: FS, fontSize: 'clamp(40px,10vw,60px)', color: G, lineHeight: 1.1, position: 'relative', zIndex: 1, opacity: 0, animation: 'prenomAppear 1.2s ease 0.7s forwards' }, 'prenoms', data.zoneStyles)}>
                  {data.marie2Prenom || 'Prénom'}
                </div>
              </div>
              {data.mariageJuif && (data.marie1Prenom2 || data.marie2Prenom2) && (
                <div style={{ display: 'flex', justifyContent: 'center', gap: 24, marginBottom: 16 }}>
                  {data.marie1Prenom2 && <div style={{ fontFamily: 'serif', fontSize: 22, color: G, direction: 'rtl' }}>{data.marie1Prenom2}</div>}
                  {data.marie2Prenom2 && <div style={{ fontFamily: 'serif', fontSize: 22, color: G, direction: 'rtl' }}>{data.marie2Prenom2}</div>}
                </div>
              )}
              
              {/* ✨ NOUVEAU — Date en grand + jour de la semaine */}
{dateAccueil && (
  <>
    <div style={{ width: 40, height: '0.5px', background: G, opacity: 0.4, margin: '24px auto 20px' }} />
    <div style={applyZoneStyle({ 
      fontFamily: FP, 
      fontSize: 'clamp(22px,6vw,28px)', 
      color: G, 
      letterSpacing: 3, 
      fontWeight: 300,
      textAlign: 'center',
      opacity: 0,
      animation: 'prenomAppear 1.2s ease 1s forwards',
    }, 'dateHeure', data.zoneStyles)}>
      {new Date(dateAccueil).toLocaleDateString('fr-FR', { 
        day: '2-digit', 
        month: '2-digit', 
        year: 'numeric' 
      }).replace(/\//g, ' · ')}
    </div>
    <div style={{ 
      fontFamily: FP, 
      fontSize: 10, 
      color: G, 
      marginTop: 8,
      letterSpacing: 3,
      textTransform: 'uppercase',
      opacity: 0.7,
      textAlign: 'center',
      animation: 'prenomAppear 1.2s ease 1.2s forwards',
    }}>
      {new Date(dateAccueil).toLocaleDateString('fr-FR', { weekday: 'long' })}
    </div>
  </>
)}
            </AnimSection>
          </div>
        </section>

        {/* SECTION 3 : Compte à rebours */}
        {firstDate && (
          <section style={{ paddingTop: 56, paddingBottom: 48, textAlign: 'center', borderBottom: `1px solid ${G}1a`, position: 'relative' }}>
            <AnimSection animStyle={anim}>
              <div style={{ fontFamily: FP, fontSize: 11, letterSpacing: 4, textTransform: 'uppercase', color: G, marginBottom: 6 }}>PRÉPAREZ-VOUS !</div>
              <div style={{ fontSize: 22, marginBottom: 24 }}>💍</div>
            </AnimSection>
            <AnimSection animStyle={anim} delay={150}>
              <Countdown targetDate={firstDate} accent={G} />
            </AnimSection>
            <AnimSection animStyle={anim} delay={300}>
              <div style={{ marginTop: 28, fontSize: 18, color: G, opacity: 0.45, animation: 'sharedBounce 1.5s infinite ease-in-out' }}>↓</div>
              <style>{`@keyframes sharedBounce{0%,100%{transform:translateY(0)}50%{transform:translateY(6px)}}`}</style>
            </AnimSection>
          </section>
        )}

        {/* SECTION 4 : Cérémonies */}
        {(data.presentationStyle === 'cartes-separees' ? [sorted[currentCeremonyIdx]].filter(Boolean) : sorted).map((ceremony, i) => {
          const realIdx = data.presentationStyle === 'cartes-separees' ? currentCeremonyIdx : i
          const typeTitle: Record<string, string> = {
            'Mairie': 'LA MAIRIE', 'Cérémonie religieuse / Houppa': data.mariageJuif ? 'LA HOUPPA' : 'LA CÉRÉMONIE',
            'Shabbat Hatan': 'SHABBAT HATAN', 'Henné': 'LE HENNÉ', 'Cocktail': 'LE COCKTAIL',
            'Soirée': 'LA SOIRÉE', 'Boat Party': 'BOAT PARTY',
          }
          const title = typeTitle[ceremony.type] || (ceremony.customName?.toUpperCase() || ceremony.type.toUpperCase())
          const hebrewDate = getHebrewDate(ceremony.date)
          const usePhotoBg = fondCeremonie === 'photo' && !!firstPhoto
          const isCard = (data.presentationStyle ?? 'page-unique') !== 'page-unique'
          return (
            <React.Fragment key={realIdx}>
              <CeremonyCard isCard={isCard} accent={G}>
                <section style={{ paddingTop: hasFrame ? `${data.framePaddingV ?? 22}%` : 96, paddingBottom: hasFrame ? `${data.framePaddingV ?? 22}%` : 96, paddingLeft: hasFrame ? `${data.framePaddingH ?? 18}%` : undefined, paddingRight: hasFrame ? `${data.framePaddingH ?? 18}%` : undefined, position: 'relative', overflow: 'visible', ...(!isCard ? { borderBottom: `1px solid ${G}1a` } : { background: hasFrame ? '#ffffff' : theme.fond }) }}>
                  {hasFrame ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={frame.url!} alt="" style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', objectFit: 'cover', mixBlendMode: 'multiply', opacity: data.frameOpacity ?? 1, transform: `scale(${(data.frameSize ?? 100) / 100})`, transformOrigin: 'center center', pointerEvents: 'none', zIndex: 0 } as React.CSSProperties} />
                  ) : usePhotoBg ? (
                    <>
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={firstPhoto} alt="" style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'center', pointerEvents: 'none', zIndex: 0 }} />
                      <div style={{ position: 'absolute', inset: 0, background: 'rgba(255,255,255,0.82)', pointerEvents: 'none', zIndex: 0 }} />
                    </>
                  ) : (
                    <>
                      {i % 2 === 0 ? <><OrnTR /><OrnBL /></> : <><OrnTL /><OrnBR /></>}
                    </>
                  )}
                  <div style={{ position: 'relative', zIndex: 1, opacity: data.textOpacity ?? 1, textShadow: '0 1px 3px rgba(255,255,255,0.95), 0 0 8px rgba(255,255,255,0.7)' }}>
                    {data.mariageJuif && (
                      <div style={{ position: 'absolute', top: 18, right: 22, fontSize: 16, fontFamily: 'serif', color: G, direction: 'rtl', fontWeight: 700, zIndex: 5, opacity: 0.85, letterSpacing: 1 }}>בס״ד</div>
                    )}
                    <AnimSection animStyle={anim}>
                     <div style={applyZoneStyle({ fontFamily: FP, fontSize: 12, letterSpacing: 4, textTransform: 'uppercase' as const, color: G, textAlign: 'center', marginBottom: 14 }, 'titres', data.zoneStyles)}>{ov[`ceremony_${i}_titre`] || title}</div>
                      <OrnSep />
                    </AnimSection>
                    {ceremony.type === 'Cérémonie religieuse / Houppa' && data.mariageJuif && (
                      <AnimSection animStyle={anim} delay={100}>
                        <div style={{ background: 'rgba(255,255,255,0.95)', borderRadius: 8, padding: '10px 20px', marginBottom: 22, overflow: 'hidden' }}>
                          <div style={{ fontFamily: 'serif', fontSize: 'clamp(10px, 3.2vw, 17px)', color: G, direction: 'rtl', textAlign: 'center', whiteSpace: 'nowrap', lineHeight: 1.9 }}>קוֹל שָׂשׂוֹן וְקוֹל שִׂמְחָה קוֹל חָתָן וְקוֹל כַּלָּה</div>
                        </div>
                      </AnimSection>
                    )}
                    {/* ── Pensées pour les défunts (Houppa uniquement) ── */}
                    {ceremony.type === 'Cérémonie religieuse / Houppa' && ceremony.penseesDefuntsActif && ceremony.penseesDefuntsNoms.filter(n => n.trim()).length > 0 && (
                      <AnimSection animStyle={anim} delay={120}>
                        <div style={{ textAlign: 'center', marginBottom: 32, paddingBottom: 24, borderBottom: `1px solid ${G}22` }}>
                          {/* Séparateur ornemental haut */}
                          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 14, marginBottom: 16 }}>
                            <div style={{ width: 60, height: 0.5, background: G, opacity: 0.4 }} />
                            <span style={{ fontSize: 14, color: G }}>🕯</span>
                            <div style={{ width: 60, height: 0.5, background: G, opacity: 0.4 }} />
                          </div>
                          {/* Formule introductive en italique */}
                          {ceremony.penseesDefuntsIntro && (
                            <div style={{ fontFamily: FC, fontStyle: 'italic', fontSize: 14, color: TEXT, opacity: 0.85, marginBottom: 14, lineHeight: 1.6, padding: '0 12px' }}>
                              {ceremony.penseesDefuntsIntro}
                            </div>
                          )}
                          {/* Liste des noms */}
                          <div style={{ display: 'flex', flexDirection: 'column', gap: 4, marginBottom: ceremony.penseesDefuntsFin ? 14 : 0 }}>
                            {ceremony.penseesDefuntsNoms.filter(n => n.trim()).map((nom, k) => (
                              <div key={k} style={{ fontFamily: FP, fontSize: 16, color: TEXT, fontWeight: 500, lineHeight: 1.6 }}>
                                {nom} <span style={{ color: G, fontSize: 14, fontFamily: 'serif' }}>ז״ל</span>
                              </div>
                            ))}
                          </div>
                          {/* Phrase de fin */}
                          {ceremony.penseesDefuntsFin && (
                            <div style={{ fontFamily: FC, fontStyle: 'italic', fontSize: 13, color: TEXT, opacity: 0.75, lineHeight: 1.6, padding: '0 12px' }}>
                              {ceremony.penseesDefuntsFin}
                            </div>
                          )}
                        </div>
                      </AnimSection>
                    )}
                    {(parents1.length > 0 || parents2.length > 0) && ceremony.type === 'Cérémonie religieuse / Houppa' && (
                      <AnimSection animStyle={anim} delay={150}>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 12, textAlign: 'center' }}>
                          <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                            {gpPa1 && <div style={{ fontFamily: FC, fontStyle: 'italic', fontSize: 13, color: TEXT, lineHeight: 1.5 }}>{gpPa1}</div>}
                            {gpMa1 && <div style={{ fontFamily: FC, fontStyle: 'italic', fontSize: 13, color: TEXT, lineHeight: 1.5 }}>{gpMa1}</div>}
                            {parents1.map((l,j)=><div key={j} style={{ fontFamily: FC, fontStyle: 'italic', fontSize: 13, color: TEXT, lineHeight: 1.5 }}>{l}</div>)}
                          </div>
                          <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                            {gpPa2 && <div style={{ fontFamily: FC, fontStyle: 'italic', fontSize: 13, color: TEXT, lineHeight: 1.5 }}>{gpPa2}</div>}
                            {gpMa2 && <div style={{ fontFamily: FC, fontStyle: 'italic', fontSize: 13, color: TEXT, lineHeight: 1.5 }}>{gpMa2}</div>}
                            {parents2.map((l,j)=><div key={j} style={{ fontFamily: FC, fontStyle: 'italic', fontSize: 13, color: TEXT, lineHeight: 1.5 }}>{l}</div>)}
                          </div>
                        </div>
                        <div style={applyZoneStyle({ fontFamily: FC, fontStyle: 'italic', fontSize: 13, color: TEXT, textAlign: 'center', marginBottom: 24, lineHeight: 1.9, opacity: 0.82 }, 'narratif', data.zoneStyles)}>
                          {ov[`ceremony_${i}_joie`] || (hasGp ? 'ont la joie de vous faire part du mariage de leurs petits-enfants et enfants' : 'ont la joie de vous faire part du mariage de leurs enfants')}
                        </div>
                      </AnimSection>
                    )}
                    <AnimSection animStyle={anim} delay={250}>
                      {/* Gros prénoms calligraphiés : SEULEMENT pour Houppa et Mairie */}
                      {(ceremony.type === 'Cérémonie religieuse / Houppa' || ceremony.type === 'Mairie') && (
                        <>
                          <div style={applyZoneStyle({ fontFamily: FS, fontSize: 'clamp(38px,9vw,56px)', color: G, textAlign: 'center', lineHeight: 1.1, marginBottom: 6, whiteSpace: 'nowrap' as const }, 'prenoms', data.zoneStyles)}>{data.marie1Prenom}</div>
                          <div style={{ fontFamily: FC, fontStyle: 'italic', fontSize: 20, color: TEXT, textAlign: 'center', marginBottom: 6, opacity: 0.65 }}>&</div>
                          <div style={applyZoneStyle({ fontFamily: FS, fontSize: 'clamp(38px,9vw,56px)', color: G, textAlign: 'center', lineHeight: 1.1, marginBottom: 18, whiteSpace: 'nowrap' as const }, 'prenoms', data.zoneStyles)}>{data.marie2Prenom}</div>
                        </>
                      )}

                      {/* Phrase narrative selon le type */}
                      {ceremony.type === 'Mairie' ? (
                        <>
                          <div style={{ fontFamily: FC, fontStyle: 'italic', fontSize: 18, color: TEXT, textAlign: 'center', marginBottom: 8, opacity: 0.78 }}>se diront</div>
                          <div style={{ fontFamily: FS, fontSize: 'clamp(48px,12vw,80px)', color: G, textAlign: 'center', lineHeight: 1, marginBottom: 28 }}>« Oui »</div>
                        </>
                      ) : ceremony.type === 'Cérémonie religieuse / Houppa' ? (
                        <div style={applyZoneStyle({ fontFamily: FC, fontStyle: 'italic', fontSize: 15, color: TEXT, textAlign: 'center', marginBottom: 28, opacity: 0.78 }, 'narratif', data.zoneStyles)}>{ov[`ceremony_${i}_honore`] || 'Et seraient honorés de votre présence'}</div>
                      ) : (
                        // Pour tous les autres types : phrase mise en page avec NOMS en valeur
                        <div style={{ marginBottom: 28 }}>
                          {ov[`ceremony_${i}_invitation`] ? (
                            // Si les mariés ont édité la phrase → affichage simple en italique
                            <div style={applyZoneStyle({ fontFamily: FC, fontStyle: 'italic', fontSize: 16, color: TEXT, textAlign: 'center', opacity: 0.85, lineHeight: 1.7, padding: '0 8px', whiteSpace: 'pre-wrap' as const }, 'narratif', data.zoneStyles)}>
                              {ov[`ceremony_${i}_invitation`]}
                            </div>
                          ) : (
                            // Sinon → mise en page élégante avec NOMS en valeur
                            <div style={applyZoneStyle({ padding: '0 8px' }, 'narratif', data.zoneStyles)}>
                              {renderInvitationPhrase(ceremony, data, G, TEXT)}
                            </div>
                          )}
                        </div>
                      )}
                    </AnimSection>
                    <AnimSection animStyle={anim} delay={380}>
                      <LineSep />
                      {ceremony.date && (() => {
                        const d = new Date(ceremony.date + 'T12:00:00')
                        const parts = new Intl.DateTimeFormat('fr-FR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' }).formatToParts(d)
                        const cap = (s: string) => s.charAt(0).toUpperCase() + s.slice(1)
                        const jourSemaine = cap(parts.find(p => p.type === 'weekday')?.value || '')
                        const jour = parts.find(p => p.type === 'day')?.value || ''
                        const mois = cap(parts.find(p => p.type === 'month')?.value || '')
                        const annee = parts.find(p => p.type === 'year')?.value || ''
                        return (
                          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 16, margin: '24px 0' }}>
                            <div style={{ textAlign: 'right' }}>
                              <div style={{ borderBottom: `1px solid ${G}`, paddingBottom: 4, marginBottom: 4, letterSpacing: 3, fontSize: 11, color: G }}>{jourSemaine.toUpperCase()}</div>
                              <div style={{ fontSize: 11, color: TEXT, letterSpacing: 2 }}>{annee}</div>
                            </div>
                            <div style={{ border: `1.5px solid ${G}`, borderRadius: 4, padding: '8px 16px', fontSize: 36, fontFamily: FP, color: G, fontWeight: 600, minWidth: 60, textAlign: 'center' }}>{jour}</div>
                            <div style={{ textAlign: 'left' }}>
                              <div style={{ borderBottom: `1px solid ${G}`, paddingBottom: 4, marginBottom: 4, letterSpacing: 3, fontSize: 11, color: G }}>{mois.toUpperCase()}</div>
                              <div style={{ fontSize: 11, color: TEXT, letterSpacing: 2 }}>{annee}</div>
                            </div>
                          </div>
                        )
                      })()}
                      {data.mariageJuif && hebrewDate && <div style={{ fontFamily: 'serif', fontSize: 15, color: G, direction: 'rtl', textAlign: 'center', marginBottom: 8, opacity: 0.8 }}>{hebrewDate}</div>}
                      {ceremony.heure && <div style={applyZoneStyle({ fontFamily: FC, fontStyle: 'italic', fontSize: 17, color: TEXT, textAlign: 'center', marginBottom: 18, opacity: 0.82 }, 'dateHeure', data.zoneStyles)}>{formatHeure(ceremony.heure)} précises</div>}
                      {(ov[`ceremony_${i}_lieu`] || ceremony.lieu) && <div style={applyZoneStyle({ fontFamily: FC, fontStyle: 'italic', fontSize: 16, color: TEXT, textAlign: 'center', lineHeight: 1.6, marginBottom: 4 }, 'lieu', data.zoneStyles)}>{ceremony.type === 'Mairie' ? conjonctionLieu(ov[`ceremony_${i}_lieu`] || ceremony.lieu) : formatLieu(ov[`ceremony_${i}_lieu`] || ceremony.lieu)}</div>}
                      {ceremony.adresse && <div style={{ fontFamily: FC, fontSize: 13, color: theme.textSecondaire, textAlign: 'center', lineHeight: 1.6, marginBottom: 20 }}>{ceremony.adresse}</div>}
                      {ceremony.suiviDAutre && ceremony.evenementSuivantNom && (
                        <div style={{ fontFamily: FC, fontStyle: 'italic', fontSize: 14, color: TEXT, textAlign: 'center', marginBottom: 16, borderTop: `1px solid ${G}22`, paddingTop: 14 }}>
                          <div style={{ fontWeight: 700 }}>La cérémonie sera suivie de {ceremony.evenementSuivantNom}</div>
                          {ceremony.evenementSuivantAdresse && <div style={{ fontSize: 12, opacity: 0.75, marginTop: 4 }}>{ceremony.evenementSuivantAdresse}</div>}
                        </div>
                      )}
                      {ceremony.note && (
                        <div style={{ fontFamily: FC, fontStyle: 'italic', fontSize: 13, color: theme.textSecondaire, textAlign: 'center', marginBottom: 16, padding: '12px 0', borderTop: `1px solid ${G}18` }}>{ceremony.note}</div>
                      )}
                      {ceremony.adresse && (
                        <div style={{ marginTop: 24 }}>
                          {/* Séparateur ornemental */}
                          <div style={{ textAlign: 'center' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 10, justifyContent: 'center', marginBottom: 14 }}>
                              <div style={{ width: 24, height: 0.5, background: G, opacity: 0.4 }} />
                              <span style={{ color: G, fontSize: 10, opacity: 0.6 }}>✦</span>
                              <div style={{ width: 24, height: 0.5, background: G, opacity: 0.4 }} />
                            </div>
                            <div style={{ fontFamily: FP, fontSize: 10, letterSpacing: 4, textTransform: 'uppercase' as const, color: G, marginBottom: 14, opacity: 0.7 }}>
                              Pour vous rendre sur place
                            </div>
                            <ItineraireButtons adresse={ceremony.adresse} theme={theme} />
                          </div>
                        </div>
                      )}

                      {/* ── Encart Infos pratiques (transport / hébergement) ── */}
                      {(ceremony.transport || ceremony.hebergement) && (
                        <div style={{ marginTop: 32, paddingTop: 24, borderTop: `1px solid ${G}22` }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 10, justifyContent: 'center', marginBottom: 14 }}>
                            <div style={{ width: 24, height: 0.5, background: G, opacity: 0.4 }} />
                            <span style={{ color: G, fontSize: 10, opacity: 0.6 }}>✦</span>
                            <div style={{ width: 24, height: 0.5, background: G, opacity: 0.4 }} />
                          </div>
                          <div style={{ fontFamily: FP, fontSize: 10, letterSpacing: 4, textTransform: 'uppercase' as const, color: G, textAlign: 'center', marginBottom: 20, opacity: 0.7 }}>
                            Infos pratiques
                          </div>
                          {ceremony.transport && (
                            <div style={{ marginBottom: ceremony.hebergement ? 18 : 0, textAlign: 'center' }}>
                              <div style={{ fontFamily: FC, fontStyle: 'italic', fontSize: 14, color: G, marginBottom: 6, fontWeight: 600 }}>🚌 Transport</div>
                              <div style={{ fontFamily: FC, fontSize: 13, color: TEXT, lineHeight: 1.7, whiteSpace: 'pre-wrap', opacity: 0.9 }}>{ceremony.transport}</div>
                            </div>
                          )}
                          {ceremony.hebergement && (
                            <div style={{ textAlign: 'center' }}>
                              <div style={{ fontFamily: FC, fontStyle: 'italic', fontSize: 14, color: G, marginBottom: 6, fontWeight: 600 }}>🏨 Hébergement</div>
                              <div style={{ fontFamily: FC, fontSize: 13, color: TEXT, lineHeight: 1.7, whiteSpace: 'pre-wrap', opacity: 0.9 }}>{ceremony.hebergement}</div>
                            </div>
                          )}
                        </div>
                      )}
                    </AnimSection>
                  </div>
                </section>
              </CeremonyCard>
              {!isCard && i < sorted.length - 1 && <CeremoniesDivider themeAccent={G} />}
            </React.Fragment>
          )
        })}

        {/* Navigation cartes séparées */}
        {(data.presentationStyle === 'cartes-separees') && sorted.length > 1 && (
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 20, padding: '20px 0 8px' }}>
            <button onClick={() => setCurrentCeremonyIdx(idx => Math.max(0, idx - 1))} disabled={currentCeremonyIdx === 0}
              style={{ ...BTN, padding: '10px 22px', borderRadius: 9999, border: `1.5px solid ${G}`, background: currentCeremonyIdx === 0 ? '#f5f5f5' : 'white', color: currentCeremonyIdx === 0 ? '#ccc' : G, fontSize: 13, fontWeight: 600, cursor: currentCeremonyIdx === 0 ? 'not-allowed' : 'pointer' }}>
              ← Précédent
            </button>
            <span style={{ fontFamily: FC, fontStyle: 'italic', fontSize: 13, color: G, opacity: 0.7 }}>{currentCeremonyIdx + 1} / {sorted.length}</span>
            <button onClick={() => setCurrentCeremonyIdx(idx => Math.min(sorted.length - 1, idx + 1))} disabled={currentCeremonyIdx === sorted.length - 1}
              style={{ ...BTN, padding: '10px 22px', borderRadius: 9999, border: `1.5px solid ${G}`, background: currentCeremonyIdx === sorted.length - 1 ? '#f5f5f5' : 'white', color: currentCeremonyIdx === sorted.length - 1 ? '#ccc' : G, fontSize: 13, fontWeight: 600, cursor: currentCeremonyIdx === sorted.length - 1 ? 'not-allowed' : 'pointer' }}>
              Suivant →
            </button>
          </div>
        )}

        {/* SECTION 5 : RSVP invité */}
        {role === 'guest' && (
          <section style={{ paddingTop: 60, paddingBottom: 52, borderBottom: `1px solid ${G}1a` }}>
            <AnimSection animStyle={anim}>
              <div style={{ fontFamily: FP, fontSize: 12, letterSpacing: 4, textTransform: 'uppercase' as const, color: G, textAlign: 'center', marginBottom: 14 }}>VOTRE RÉPONSE</div>
              <OrnSep />
              <div style={{ border: `1px solid ${G}33`, borderRadius: 4, padding: '32px 24px', textAlign: 'center' }}>
                <div style={{ fontFamily: FC, fontStyle: 'italic', fontSize: 16, color: TEXT, marginBottom: 28, lineHeight: 1.8, opacity: 0.85 }}>
                  Nous vous serions reconnaissants de bien vouloir nous faire part de votre réponse
                </div>
                <button onClick={onRsvpOpen} style={{ ...BTN, background: `linear-gradient(135deg,${G},${G}cc)`, color: 'white', border: 'none', borderRadius: 2, padding: '14px 48px', fontFamily: FP, fontSize: 12, fontWeight: 700, letterSpacing: 4, textTransform: 'uppercase' as const, boxShadow: `0 4px 20px ${G}44` }}>
                  RSVP
                </button>
              </div>
            </AnimSection>
          </section>
        )}

        {/* SECTION 5b : RSVP couple */}
        {role === 'couple' && (
          <section style={{ paddingTop: 52, paddingBottom: 40, borderBottom: `1px solid ${G}1a`, textAlign: 'center' }}>
            <AnimSection animStyle={anim}>
              <button onClick={onRsvpListOpen} style={{ ...BTN, background: G, color: 'white', border: 'none', borderRadius: 2, padding: '13px 28px', fontFamily: FP, fontSize: 12, fontWeight: 700, letterSpacing: 2, boxShadow: `0 4px 16px ${G}44` }}>
                📋 Voir les RSVP
              </button>
            </AnimSection>
          </section>
        )}
      </div>

      {/* SECTION 7 : Footer */}
      <footer style={{ padding: '48px 28px 64px', textAlign: 'center', background: `${G}08`, maxWidth: 480, margin: '0 auto' }}>
        <AnimSection animStyle={anim}>
          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 20 }}>
            {ornUrl && <img src={ornUrl} alt="" style={{ width: 160, height: 160, objectFit: 'contain', opacity: 0.65 } as React.CSSProperties} />}
          </div>
          <div style={{ fontFamily: FS, fontSize: 40, color: G, marginBottom: 12, lineHeight: 1.2 }}>
            {data.marie1Prenom} & {data.marie2Prenom}
          </div>
          <div style={{ color: G, fontSize: 12, marginBottom: 18, opacity: 0.45 }}>✦</div>
          <a href="https://getlovit.fr" target="_blank" rel="noopener noreferrer" style={{ fontFamily: FC, fontStyle: 'italic', fontSize: 12, color: G, textDecoration: 'none', opacity: 0.45 }}>
            Créé avec ❤️ par Lov&apos;it
          </a>
        </AnimSection>
      </footer>

      {/* Musique */}
      {data.musicUrl && <AudioPlayer musicUrl={data.musicUrl} accent={G} playRef={audioPlayRef} />}
      {!data.musicUrl && ytIframeRef.current && (
        <button onClick={onToggleYtMute} onTouchEnd={e=>{e.preventDefault();onToggleYtMute()}}
          style={{ ...BTN, position: 'fixed', bottom: 24, right: 24, zIndex: 50, width: 44, height: 44, borderRadius: '50%', background: G, color: 'white', border: 'none', fontSize: 18, display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 4px 16px rgba(0,0,0,0.2)' }}>
          {ytMuted ? '🔇' : '🔊'}
        </button>
      )}
    </div>
  )
}

// ── CardsView ─────────────────────────────────────────────────────────────────
function CardsView({ data, onEdit, onReset, isShared, role, onUpdate }: { data: FormData; onEdit: () => void; onReset: () => void; isShared: boolean; role: string | null; onUpdate?: (d: Partial<FormData>) => void }) {
  const theme = THEMES[data.style]
  const sorted = sortByDate(data.ceremonies)
  const [rsvpOpen, setRsvpOpen] = useState(false)
  const [rsvpListOpen, setRsvpListOpen] = useState(false)
  const [lastShareId, setLastShareId] = useState<string | null>(null)
  const [ytMuted, setYtMuted] = useState(false)
  const ytIframeRef = useRef<HTMLIFrameElement | null>(null)
  const [textOverrides, setTextOverrides] = useState<Record<string, string>>({})
  const [zoneStyles, setZoneStyles] = useState<ZoneStyles>(data.zoneStyles ?? {})
  const [textEditOpen, setTextEditOpen] = useState(false)
  const [shareModalOpen, setShareModalOpen] = useState(false)
  const [guestUrl, setGuestUrl] = useState<string | null>(null)
  const [coupleUrl, setCoupleUrl] = useState<string | null>(null)
  const [sharing, setSharing] = useState(false)
  const [sharingStatus, setSharingStatus] = useState('')
  const [enveloppeFinie] = useState(true)

  const startYoutubeMusic = useCallback((videoId: string) => {
    if (ytIframeRef.current) return
    const iframe = document.createElement('iframe')
    iframe.src = `https://www.youtube.com/embed/${videoId}?autoplay=1&loop=1&playlist=${videoId}&controls=0&enablejsapi=1`
    iframe.style.cssText = 'position:fixed;top:-9999px;width:1px;height:1px;border:none;pointer-events:none;'
    iframe.allow = 'autoplay; encrypted-media'
    iframe.title = 'music'
    document.body.appendChild(iframe)
    ytIframeRef.current = iframe
  }, [])

  const toggleYtMute = useCallback(() => {
    const iframe = ytIframeRef.current
    if (!iframe?.contentWindow) return
    const func = ytMuted ? 'unmuteVideo' : 'muteVideo'
    iframe.contentWindow.postMessage(JSON.stringify({ event: 'command', func, args: [] }), '*')
    setYtMuted(m => !m)
  }, [ytMuted])

  useEffect(() => {
    if (isShared) {
      const id = new URLSearchParams(window.location.search).get('share')
      if (id) {
        setLastShareId(id)
        fetch('/api/track-view', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ shareId: id, timestamp: new Date().toISOString(), userAgent: navigator.userAgent, country: navigator.language }),
        }).catch(() => {})
      }
    }
  }, [isShared])

 const handleShare = async () => {
    if (sharing) return
    setSharing(true)
    try {
      const originalPhotos = data.photosFond ?? []
      let compressedPhotos: string[] = originalPhotos
      const photosDataToSend = (data.photosData ?? []).map(({ cropX, cropY, cropScale }) => ({ cropX, cropY, cropScale }))
      const buildPayload = () => ({ ...data, photosFond: compressedPhotos, photoFond: compressedPhotos[0] ?? '', photosData: photosDataToSend })
      compressedPhotos = originalPhotos
      setSharingStatus('Envoi...')
      const dataToSend = buildPayload()

      // ✅ Auto-génération du slug si non renseigné par les mariés
      // → garantit toujours une URL propre + preview WhatsApp dynamique
      if (!dataToSend.slug || !dataToSend.slug.trim()) {
        dataToSend.slug = generateAutoSlug(dataToSend.marie1Prenom, dataToSend.marie2Prenom)
      }

      const existingId = (() => { try { return localStorage.getItem('lovit_share_id') } catch { return null } })()
      console.log('slug envoyé:', dataToSend.slug)
      const res = await fetch('/api/save-share', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ ...dataToSend, fixedId: existingId }) })
      const json = await res.json()
      if (!json.id) throw new Error('Pas d\'id retourné : ' + JSON.stringify(json))
      const id = json.id
      setLastShareId(id)
      try { localStorage.setItem('lovit_share_id', id) } catch { /* ignore */ }
      const base = window.location.origin + '/faire-part?share=' + id
      setGuestUrl(base + '&role=guest')
      if (data.slug) {
      const slugUrl = window.location.origin + '/' + data.slug
      setGuestUrl(slugUrl)
      }
      setCoupleUrl(base + '&role=couple')
      setShareModalOpen(true)
    } catch (err) {
      console.error('handleShare erreur:', err)
      alert('Erreur : ' + (err instanceof Error ? err.message : String(err)))
    } finally {
      setSharing(false)
      setSharingStatus('')
    }
  }

  if (isShared) {
    return (
      <div style={{ backgroundColor: theme.fond, minHeight: '100vh', color: theme.texte }}>
        <SharedPageContent
          data={{ ...data, zoneStyles: data.zoneStyles ?? {} }}
          theme={theme}
          sorted={sorted}
          role={role}
          lastShareId={lastShareId}
          onRsvpOpen={() => setRsvpOpen(true)}
          onRsvpListOpen={() => setRsvpListOpen(true)}
          onStartYoutube={data.youtubeUrl ? () => { const vid = getYouTubeId(data.youtubeUrl); if (vid) startYoutubeMusic(vid) } : undefined}
          ytIframeRef={ytIframeRef}
          ytMuted={ytMuted}
          onToggleYtMute={toggleYtMute}
        />
        {role === 'couple' && (
          <div style={{ position: 'fixed', bottom: 0, left: 0, right: 0, zIndex: 100, background: 'white', boxShadow: '0 -2px 20px rgba(0,0,0,0.10)', padding: '12px 16px', display: 'flex', gap: 8, justifyContent: 'center', flexWrap: 'wrap' }}>
            <button onClick={onEdit} style={{ ...BTN, padding: '10px 20px', borderRadius: 9999, border: `1.5px solid ${theme.accent}`, background: 'transparent', color: theme.accent, fontSize: 13, fontWeight: 600 }}>Modifier</button>
            <button onClick={() => setTextEditOpen(true)} style={{ ...BTN, padding: '10px 20px', borderRadius: 9999, border: `1.5px solid ${theme.accent}`, background: 'transparent', color: theme.accent, fontSize: 13, fontWeight: 600 }}>✏️ Texte</button>
            <button onClick={handleShare} disabled={sharing} style={{ ...BTN, padding: '10px 20px', borderRadius: 9999, background: theme.accent, color: 'white', border: 'none', fontSize: 13, fontWeight: 600, boxShadow: `0 4px 16px ${theme.accent}44`, opacity: sharing ? 0.7 : 1 }}>{sharing ? (sharingStatus || 'Chargement...') : '🔗 Partager'}</button>
            {lastShareId && (
              <button onClick={() => setRsvpListOpen(true)} style={{ ...BTN, padding: '10px 20px', borderRadius: 9999, border: `1.5px solid ${theme.accent}`, background: 'transparent', color: theme.accent, fontSize: 13, fontWeight: 600 }}>📋 RSVP</button>
            )}
          </div>
        )}
        {rsvpOpen && (
          <RSVPModal accent={theme.accent} onClose={() => setRsvpOpen(false)} mariee1={data.marie1Prenom} mariee2={data.marie2Prenom} shareId={lastShareId} ceremonies={sorted} />
        )}
        {rsvpListOpen && (
          <RSVPListModal accent={theme.accent} onClose={() => setRsvpListOpen(false)} shareId={lastShareId} ceremonies={sorted} />
        )}
        {textEditOpen && (
          <TextEditModal
            ceremonies={sorted}
            textOverrides={textOverrides}
            zoneStyles={zoneStyles}
            onApply={(t) => { setTextOverrides(t); onUpdate?.({ textOverrides: t }) }}
            onApplyStyles={(s) => { setZoneStyles(s); onUpdate?.({ zoneStyles: s }) }}
            onClose={() => setTextEditOpen(false)}
            theme={theme}
          />
        )}
        {shareModalOpen && guestUrl && coupleUrl && (
          <ShareModal accent={theme.accent} guestUrl={guestUrl} coupleUrl={coupleUrl} onClose={() => setShareModalOpen(false)} data={data} />
        )}
      </div>
    )
  }

  return (
    <div id="faire-part-preview-target" style={{ backgroundColor: theme.fond, minHeight: '100vh', color: theme.texte }}>
      <SharedPageContent
        data={{ ...data, textOverrides: { ...data.textOverrides, ...textOverrides }, zoneStyles }}
        theme={theme}
        sorted={sorted}
        role="guest"
        lastShareId={lastShareId}
        onRsvpOpen={() => setRsvpOpen(true)}
        onRsvpListOpen={() => setRsvpListOpen(true)}
        onStartYoutube={data.youtubeUrl ? () => { const vid = getYouTubeId(data.youtubeUrl); if (vid) startYoutubeMusic(vid) } : undefined}
        ytIframeRef={ytIframeRef}
        ytMuted={ytMuted}
        onToggleYtMute={toggleYtMute}
      />
      <div style={{ position: 'fixed', bottom: 0, left: 0, right: 0, zIndex: 100, background: 'white', boxShadow: '0 -2px 20px rgba(0,0,0,0.10)', padding: '12px 16px', display: 'flex', gap: 8, justifyContent: 'center', flexWrap: 'wrap' }}>
        <button onClick={onEdit} style={{ ...BTN, padding: '10px 20px', borderRadius: 9999, border: `1.5px solid ${theme.accent}`, background: 'transparent', color: theme.accent, fontSize: 13, fontWeight: 600 }}>Modifier</button>
        <button onClick={handleShare} disabled={sharing} style={{ ...BTN, padding: '10px 20px', borderRadius: 9999, background: theme.accent, color: 'white', border: 'none', fontSize: 13, fontWeight: 600, boxShadow: `0 4px 16px ${theme.accent}44`, opacity: sharing ? 0.7 : 1 }}>{sharing ? (sharingStatus || 'Chargement...') : '🔗 Partager'}</button>
        {lastShareId && (
          <button onClick={() => setRsvpListOpen(true)} style={{ ...BTN, padding: '10px 20px', borderRadius: 9999, border: `1.5px solid ${theme.accent}`, background: 'transparent', color: theme.accent, fontSize: 13, fontWeight: 600 }}>📋 RSVP</button>
        )}
        <button onClick={() => setTextEditOpen(true)} style={{ ...BTN, padding: '10px 20px', borderRadius: 9999, border: `1.5px solid ${theme.accent}`, background: 'transparent', color: theme.accent, fontSize: 13, fontWeight: 600 }}>✏️ Texte</button>
        <button onClick={onReset} style={{ ...BTN, padding: '10px 20px', borderRadius: 9999, border: '1.5px solid #fecdd3', background: 'transparent', color: '#fb7185', fontSize: 13, fontWeight: 600 }}>Nouveau</button>
      </div>
      {rsvpOpen && (
        <RSVPModal accent={theme.accent} onClose={() => setRsvpOpen(false)} mariee1={data.marie1Prenom} mariee2={data.marie2Prenom} shareId={lastShareId} ceremonies={sorted} />
      )}
      {rsvpListOpen && (
        <RSVPListModal accent={theme.accent} onClose={() => setRsvpListOpen(false)} shareId={lastShareId} ceremonies={sorted} />
      )}
      {textEditOpen && (
  <TextEditModal 
    ceremonies={sorted} 
    textOverrides={textOverrides} 
    zoneStyles={zoneStyles}
    onApply={(t) => { setTextOverrides(t); onUpdate?.({ textOverrides: t }) }}
    onApplyStyles={(s) => { setZoneStyles(s); onUpdate?.({ zoneStyles: s }) }}
    onClose={() => setTextEditOpen(false)} 
    theme={theme} 
  />
)}
      {shareModalOpen && guestUrl && coupleUrl && (
        <ShareModal accent={theme.accent} guestUrl={guestUrl} coupleUrl={coupleUrl} onClose={() => setShareModalOpen(false)} data={data} />
      )}
    </div>
  )
}


// ── Page principale ────────────────────────────────────────────────────────────

// ── Gate d'accès ──────────────────────────────────────────────────────────────

function AccessGate({ onGranted }: { onGranted: () => void }) {
  const GOLD = '#C9A84C'
  // ✅ Auto-validation si code dans l'URL (après paiement réussi)
  const [autoCheckDone, setAutoCheckDone] = useState(false)
  const [autoChecking, setAutoChecking] = useState(true)
  const [promoInput, setPromoInput] = useState('')
  const [promoEmail, setPromoEmail] = useState('')
  const [checking, setChecking] = useState(false)
  const [error, setError] = useState<string | null>(null)
  // Étape mot de passe après code promo
  const [showPasswordStep, setShowPasswordStep] = useState(false)
  const [pwInput, setPwInput] = useState('')
  const [pwConfirm, setPwConfirm] = useState('')
  const [pwError, setPwError] = useState<string | null>(null)
  const [pwLoading, setPwLoading] = useState(false)
  const savedAccessCodeRef = useRef<string | null>(null)

  const inputStyle: React.CSSProperties = { width: '100%', padding: '11px 14px', borderRadius: 8, border: `1.5px solid ${GOLD}33`, fontSize: 15, fontFamily: 'var(--font-cormorant-garamond)', outline: 'none', background: '#fdf8f9', boxSizing: 'border-box' }

  const checkPromo = async () => {
    if (!promoInput.trim() || !promoEmail.trim()) { setError('Veuillez renseigner votre code promo et votre email.'); return }
    setChecking(true); setError(null)
    try {
      const res = await fetch('/api/check-promo', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: promoInput, email: promoEmail }),
      })
      const d = await res.json()
      if (d.valid && d.accessCode) {
        try { localStorage.setItem('lovit_access_code', d.accessCode) } catch { /* ignore */ }
        savedAccessCodeRef.current = d.accessCode
        // Si c'est un retour (compte existant), accès direct
        if (d.returning) {
          onGranted()
        } else {
          // Nouveau compte → demander de définir un mot de passe
          setShowPasswordStep(true)
        }
      } else {
        setError(d.reason || 'Code promo invalide ou expiré.')
      }
    } catch { setError('Erreur réseau. Réessayez.') }
    finally { setChecking(false) }
  }

  const handleSetPassword = async (e: React.FormEvent) => {
    e.preventDefault()
    setPwError(null)
    if (pwInput.length < 8) { setPwError('Le mot de passe doit contenir au moins 8 caractères.'); return }
    if (pwInput !== pwConfirm) { setPwError('Les mots de passe ne correspondent pas.'); return }
    setPwLoading(true)
    try {
      const res = await fetch('/api/auth/set-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password: pwInput }),
      })
      if (res.ok) {
        onGranted()
      } else {
        const data = await res.json()
        setPwError(data.error || 'Erreur. Réessayez.')
      }
    } catch { setPwError('Erreur serveur.') }
    finally { setPwLoading(false) }
  }

  // ✅ Au chargement, si code dans l'URL → validation automatique + nettoyage URL
  useEffect(() => {
    if (autoCheckDone) return
    const params = new URLSearchParams(window.location.search)
    const urlCode = params.get('code')
    if (!urlCode) { setAutoChecking(false); setAutoCheckDone(true); return }

    ;(async () => {
      try {
        const res = await fetch(`/api/check-access?code=${encodeURIComponent(urlCode.toUpperCase().trim())}`)
        const d = await res.json()
        if (d.valid) {
          try { localStorage.setItem('lovit_access_code', urlCode.toUpperCase().trim()) } catch { /* ignore */ }
          // Nettoie l'URL pour que le code ne reste pas visible
          window.history.replaceState({}, '', '/faire-part')
          onGranted()
          return
        }
      } catch { /* ignore, fallback au formulaire manuel */ }
      setAutoChecking(false)
      setAutoCheckDone(true)
    })()
  }, [autoCheckDone, onGranted])

  // Pendant la validation auto, affiche un loader doré (pas le formulaire)
  if (autoChecking) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'linear-gradient(160deg, #fdf0f3 0%, #fff5f7 50%, #fdf0f3 100%)' }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontFamily: 'var(--font-great-vibes)', fontSize: 48, color: GOLD, marginBottom: 8 }}>Lov&apos;it</div>
          <div style={{ fontFamily: 'var(--font-cormorant-garamond)', fontStyle: 'italic', fontSize: 16, color: '#6a5040' }}>Activation de votre accès…</div>
        </div>
      </div>
    )
  }
  // Étape 2 : définir mot de passe après code promo validé
  if (showPasswordStep) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'linear-gradient(160deg, #fdf0f3 0%, #fff5f7 50%, #fdf0f3 100%)', padding: 24 }}>
        <div style={{ textAlign: 'center', maxWidth: 440, width: '100%' }}>
          <div style={{ fontFamily: 'var(--font-great-vibes)', fontSize: 48, color: GOLD, marginBottom: 4 }}>Lov&apos;it</div>
          <div style={{ width: 50, height: 1, background: GOLD, opacity: 0.3, margin: '0 auto 32px' }} />

          <form onSubmit={handleSetPassword} style={{ background: 'white', borderRadius: 20, padding: '36px 32px', boxShadow: '0 12px 48px rgba(201,168,76,0.12)', border: `1px solid ${GOLD}22`, marginBottom: 20, textAlign: 'left' }}>
            <div style={{ fontFamily: 'var(--font-playfair-display)', fontSize: 20, color: '#2d1f14', marginBottom: 6, textAlign: 'center' }}>Créez votre compte</div>
            <p style={{ fontFamily: 'var(--font-cormorant-garamond)', fontStyle: 'italic', fontSize: 15, color: '#6a5040', marginBottom: 24, textAlign: 'center' }}>
              Choisissez un mot de passe pour retrouver votre faire-part depuis n&apos;importe quel appareil
            </p>

            {pwError && <p style={{ marginBottom: 14, fontFamily: 'var(--font-cormorant-garamond)', fontSize: 14, color: '#ef4444', textAlign: 'center' }}>{pwError}</p>}

            <div style={{ marginBottom: 12 }}>
              <label style={{ display: 'block', fontFamily: 'var(--font-cormorant-garamond)', fontSize: 12, color: '#9ca3af', letterSpacing: 1, textTransform: 'uppercase', marginBottom: 6 }}>Mot de passe</label>
              <input
                type="password"
                value={pwInput}
                onChange={e => setPwInput(e.target.value)}
                required
                minLength={8}
                placeholder="8 caractères minimum"
                style={inputStyle}
              />
            </div>
            <div style={{ marginBottom: 20 }}>
              <label style={{ display: 'block', fontFamily: 'var(--font-cormorant-garamond)', fontSize: 12, color: '#9ca3af', letterSpacing: 1, textTransform: 'uppercase', marginBottom: 6 }}>Confirmer</label>
              <input
                type="password"
                value={pwConfirm}
                onChange={e => setPwConfirm(e.target.value)}
                required
                minLength={8}
                placeholder="••••••••"
                style={inputStyle}
              />
            </div>

            <button
              type="submit"
              disabled={pwLoading}
              style={{ width: '100%', padding: '14px', borderRadius: 9999, border: 'none', cursor: pwLoading ? 'not-allowed' : 'pointer', background: `linear-gradient(135deg, ${GOLD}, #e8c96a)`, color: 'white', fontFamily: 'var(--font-playfair-display)', fontSize: 15, fontWeight: 700, letterSpacing: '0.05em', boxShadow: `0 6px 24px ${GOLD}44` }}
            >
              {pwLoading ? 'Création…' : 'Créer mon compte et commencer'}
            </button>
          </form>

        </div>
      </div>
    )
  }

  // Étape 1 : code promo + email
  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'linear-gradient(160deg, #fdf0f3 0%, #fff5f7 50%, #fdf0f3 100%)', padding: 24 }}>
      <div style={{ textAlign: 'center', maxWidth: 440, width: '100%' }}>
        <div style={{ fontFamily: 'var(--font-great-vibes)', fontSize: 48, color: GOLD, marginBottom: 4 }}>Lov&apos;it</div>
        <div style={{ width: 50, height: 1, background: GOLD, opacity: 0.3, margin: '0 auto 32px' }} />

        {/* Formulaire principal : code promo + email */}
        <div style={{ background: 'white', borderRadius: 20, padding: '36px 32px', boxShadow: '0 12px 48px rgba(201,168,76,0.12)', border: `1px solid ${GOLD}22`, marginBottom: 20, textAlign: 'left' }}>
          <div style={{ fontFamily: 'var(--font-playfair-display)', fontSize: 20, color: '#2d1f14', marginBottom: 6, textAlign: 'center' }}>Accéder à mon faire-part</div>
          <p style={{ fontFamily: 'var(--font-cormorant-garamond)', fontStyle: 'italic', fontSize: 15, color: '#6a5040', marginBottom: 24, textAlign: 'center' }}>
            Entrez votre code promo et votre email
          </p>

          <div style={{ marginBottom: 12 }}>
            <label style={{ display: 'block', fontFamily: 'var(--font-cormorant-garamond)', fontSize: 12, color: '#9ca3af', letterSpacing: 1, textTransform: 'uppercase', marginBottom: 6 }}>Code promo</label>
            <input
              value={promoInput}
              onChange={e => setPromoInput(e.target.value.toUpperCase())}
              placeholder="MONCODE"
              style={{ ...inputStyle, fontFamily: 'var(--font-playfair-display)', letterSpacing: '0.12em', fontWeight: 700, fontSize: 16 }}
            />
          </div>
          <div style={{ marginBottom: 20 }}>
            <label style={{ display: 'block', fontFamily: 'var(--font-cormorant-garamond)', fontSize: 12, color: '#9ca3af', letterSpacing: 1, textTransform: 'uppercase', marginBottom: 6 }}>Votre email</label>
            <input
              value={promoEmail}
              onChange={e => setPromoEmail(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && checkPromo()}
              type="email"
              placeholder="marie@exemple.com"
              style={inputStyle}
            />
          </div>

          <button
            onClick={checkPromo}
            disabled={checking}
            style={{ width: '100%', padding: '14px', borderRadius: 9999, border: 'none', cursor: checking ? 'not-allowed' : 'pointer', background: `linear-gradient(135deg, ${GOLD}, #e8c96a)`, color: 'white', fontFamily: 'var(--font-playfair-display)', fontSize: 15, fontWeight: 700, letterSpacing: '0.05em', boxShadow: `0 6px 24px ${GOLD}44` }}
          >
            {checking ? 'Vérification…' : 'Accéder à mon faire-part'}
          </button>

          {error && <p style={{ marginTop: 14, fontFamily: 'var(--font-cormorant-garamond)', fontSize: 15, color: '#ef4444', textAlign: 'center' }}>{error}</p>}
        </div>

        <div style={{ marginTop: 24, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12 }}>
          <a href="/connexion" style={{ fontFamily: 'var(--font-cormorant-garamond)', fontStyle: 'italic', fontSize: 15, color: GOLD, textDecoration: 'underline' }}>
            Déjà un compte ? Me connecter
          </a>
          <a href="/paiement" style={{ fontFamily: 'var(--font-cormorant-garamond)', fontStyle: 'italic', fontSize: 14, color: '#9ca3af', textDecoration: 'underline' }}>
            Pas encore de compte ? Créer mon faire-part →
          </a>
        </div>
      </div>
    </div>
  )
}

export default function FairePartPage() {
  const [step, setStep] = useState(1)
  const [formData, setFormData] = useState<FormData>(defaultFormData)
  const [showCards, setShowCards] = useState(false)
  const [isShared, setIsShared] = useState(false)
  const [role, setRole] = useState<string | null>(null)
  const [loadingShare, setLoadingShare] = useState(false)
  const [hasDraft, setHasDraft] = useState(false)
  const [savedAt, setSavedAt] = useState<Date | null>(null)
  const [accessGranted, setAccessGranted] = useState(false)
  const [checkingAccess, setCheckingAccess] = useState(true)
  // Auth & sauvegarde serveur
  const [userEmail, setUserEmail] = useState<string | null>(null)
  const [userFaireparts, setUserFaireparts] = useState<string[]>([])
  const [serverSavedAt, setServerSavedAt] = useState<Date | null>(null)
  const [serverSaving, setServerSaving] = useState(false)
  const serverSaveTimer = useRef<ReturnType<typeof setTimeout> | null>(null)
  // Prevents double-firing when both onTouchEnd and onClick trigger
  const lastTap = useRef(0)

  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    const id = params.get('share')
    const r = params.get('role')
    const urlCode = params.get('code')

    // Mode dev : bypass code d'accès
    const devParam = params.get('dev')
    const isDevBypass = devParam === 'lovit2026' || (devParam === 'true' && process.env.NODE_ENV === 'development')
    if (isDevBypass) {
      setAccessGranted(true)
      setCheckingAccess(false)
      return
    }

    if (id) {
      // Vue partagée — pas de protection
      setIsShared(true)
      setRole(r)
      setAccessGranted(true)
      setCheckingAccess(false)
      setLoadingShare(true)
      fetch(`/api/get-share?id=${id}`)
        .then(res => res.json())
        .then((d: FormData) => {
          // Reconstruire photosData.url depuis photosFond (supprimé avant envoi pour économiser de l'espace)
          if (d.photosFond?.length && d.photosData?.length) {
            d.photosData = d.photosData.map((c, i) => ({ ...c, url: d.photosFond![i] ?? '' }))
          }
          setFormData(d)
          if (r === 'edit') {
            // Mode édition : revenir au formulaire local (pas en mode partagé)
            setIsShared(false)
            setRole(null)
            setShowCards(false)
            setStep(1)
          } else {
            setShowCards(true)
          }
        })
        .catch(() => { setLoadingShare(false) })
        .finally(() => setLoadingShare(false))
      return
    }

    // Vérifier code d'accès
    const checkAccess = async (code: string) => {
      try {
        const res = await fetch(`/api/check-access?code=${encodeURIComponent(code)}`)
        const d = await res.json()
        if (d.valid) {
          setAccessGranted(true)
          try { localStorage.setItem('lovit_access_code', code) } catch { /* ignore */ }

          // 1) D'abord essayer le brouillon localStorage
          let hasLocalDraft = false
          try {
            const draft = localStorage.getItem('wedding-draft')
            if (draft) { hasLocalDraft = true; setHasDraft(true) }
          } catch { /* ignore */ }

          // 2) Si pas de brouillon local, charger le faire-part depuis le serveur via shareId
          if (!hasLocalDraft) {
            try {
              const savedShareId = localStorage.getItem('lovit_share_id')
              if (savedShareId) {
                const shareRes = await fetch(`/api/get-share?id=${savedShareId}`)
                if (shareRes.ok) {
                  const shareData = await shareRes.json()
                  if (shareData && !shareData.error) {
                    // Reconstruire photosData.url depuis photosFond
                    if (shareData.photosFond?.length && shareData.photosData?.length) {
                      shareData.photosData = shareData.photosData.map((c: { cropX?: number; cropY?: number; cropScale?: number }, i: number) => ({ ...c, url: shareData.photosFond[i] ?? '' }))
                    }
                    setFormData(shareData as FormData)
                    setHasDraft(true)
                  }
                }
              }
            } catch { /* ignore */ }
          }
        }
      } catch { /* ignore */ }
      setCheckingAccess(false)
    }

    if (urlCode) {
      checkAccess(urlCode.toUpperCase().trim())
    } else {
      try {
        const saved = localStorage.getItem('lovit_access_code')
        if (saved) { checkAccess(saved); return }
      } catch { /* ignore */ }
      setCheckingAccess(false)
    }

    // Check for local draft
    try {
      const draft = localStorage.getItem('wedding-draft')
      if (draft) setHasDraft(true)
    } catch { /* ignore */ }
  }, [])

  // ✅ Vérifier l'authentification au chargement + charger brouillon serveur
  useEffect(() => {
    let cancelled = false
    async function checkAuth() {
      try {
        const res = await fetch('/api/auth/me')
        if (!res.ok) return
        const data = await res.json()
        if (cancelled) return
        setUserEmail(data.email)
        setUserFaireparts(data.faireparts ?? [])

        // Si connecté et qu'on a des faire-parts, tenter de charger le brouillon serveur
        const faireparts: string[] = data.faireparts ?? []
        if (faireparts.length > 0) {
          // Charger le dernier faire-part
          const shareId = faireparts[faireparts.length - 1]
          try {
            const draftRes = await fetch(`/api/get-draft?shareId=${shareId}`)
            if (draftRes.ok) {
              const draftData = await draftRes.json()
              if (!cancelled && draftData.formData) {
                // Le brouillon serveur a la priorité sur le localStorage
                // sauf si le localStorage est plus récent (on ne peut pas le savoir,
                // donc on privilégie le serveur)
                setFormData(draftData.formData as FormData)
                setHasDraft(true)
                setAccessGranted(true)
                setCheckingAccess(false)
              }
            }
          } catch { /* ignore */ }
        }
      } catch { /* pas connecté, ignore */ }
    }
    checkAuth()
    return () => { cancelled = true }
  }, [])

  // ✅ Sauvegarde serveur debounced
  const saveToServer = useCallback((data: FormData) => {
    if (!userEmail) return
    // Trouver le shareId actif
    const shareId = (() => { try { return localStorage.getItem('lovit_share_id') } catch { return null } })()
    if (!shareId || !userFaireparts.includes(shareId)) return

    if (serverSaveTimer.current) clearTimeout(serverSaveTimer.current)
    serverSaveTimer.current = setTimeout(async () => {
      setServerSaving(true)
      try {
        const res = await fetch('/api/save-draft', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ shareId, formData: data }),
        })
        if (res.ok) {
          setServerSavedAt(new Date())
        }
      } catch { /* ignore */ }
      setServerSaving(false)
    }, 1000) // debounce 1 seconde
  }, [userEmail, userFaireparts])

  const update = useCallback((u: Partial<FormData>) => {
    setFormData(p => {
      const next = { ...p, ...u }
      // ✅ AUTO-SAVE : à chaque modification, on sauvegarde dans le navigateur
      // pour que la mariée ne perde JAMAIS son travail si elle ferme l'onglet
      try {
        localStorage.setItem('wedding-draft', JSON.stringify(next))
        setSavedAt(new Date())
      } catch { /* quota localStorage dépassé, ignore */ }
      // ✅ Sauvegarde serveur (debounced) si connecté
      saveToServer(next)
      return next
    })
  }, [saveToServer])

  const resumeDraft = useCallback(() => {
    try {
      const draft = localStorage.getItem('wedding-draft')
      if (draft) {
        setFormData(JSON.parse(draft) as FormData)
        setHasDraft(false)
        setShowCards(true)
      }
    } catch { /* ignore */ }
  }, [])

  const next = useCallback(() => {
    if (step < 4) setStep(s => s + 1)
    else {
      // Save to localStorage on generate
      try { localStorage.setItem('wedding-draft', JSON.stringify(formData)) } catch { /* ignore */ }
      // Démarre l'audio PENDANT le clic (contexte interaction utilisateur) pour contourner l'autoplay
      if (formData.musicUrl) {
        _pendingAudio = new Audio(formData.musicUrl)
        _pendingAudio.loop = true
        _pendingAudio.play().catch(() => {})
      }
      setShowCards(true)
    }
  }, [step, formData])

  const prev = useCallback(() => setStep(s => s - 1), [])

  // onTouchEnd handler: fires immediately on touch release (bypasses iOS delays)
  // e.preventDefault() stops the subsequent click event so the action only runs once
  const onTouchNext = useCallback((e: React.TouchEvent) => {
    e.preventDefault()
    const now = Date.now()
    if (now - lastTap.current < 500) return
    lastTap.current = now
    next()
  }, [next])

  const onTouchPrev = useCallback((e: React.TouchEvent) => {
    e.preventDefault()
    const now = Date.now()
    if (now - lastTap.current < 500) return
    lastTap.current = now
    prev()
  }, [prev])

  // Vérification en cours
  if (checkingAccess) return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'linear-gradient(160deg, #fdf0f3 0%, #fff5f7 50%, #fdf0f3 100%)' }}>
      <div style={{ fontFamily: 'var(--font-great-vibes)', fontSize: 32, color: '#C9A84C' }}>Chargement…</div>
    </div>
  )

  // Gate d'accès
  if (!accessGranted && !isShared) return <AccessGate onGranted={() => { setAccessGranted(true); try { const draft = localStorage.getItem('wedding-draft'); if (draft) setHasDraft(true) } catch { /* ignore */ } }} />

  if (showCards) return <CardsView data={formData} onEdit={() => { try { localStorage.setItem('wedding-draft', JSON.stringify(formData)) } catch { /* ignore */ } setShowCards(false); setStep(1) }} onReset={() => { setFormData(defaultFormData); setShowCards(false); setStep(1); try { localStorage.removeItem('wedding-draft') } catch { /* ignore */ } }} isShared={isShared} role={role} onUpdate={update} />

  if (loadingShare) return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'linear-gradient(160deg, #fdf0f3 0%, #fff5f7 50%, #fdf0f3 100%)' }}>
      <div style={{ textAlign: 'center' }}>
        <div style={{ fontFamily: 'Georgia, serif', fontStyle: 'italic', fontSize: 28, color: '#C9A84C', marginBottom: 16 }}>Chargement…</div>
        <div style={{ width: 40, height: 1, background: '#C9A84C', opacity: 0.4, margin: '0 auto' }} />
      </div>
    </div>
  )

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'flex-start', padding: '48px 16px', background: 'linear-gradient(160deg, #fdf0f3 0%, #fff5f7 50%, #fdf0f3 100%)' }}>
      <div style={{ textAlign: 'center', marginBottom: 36 }}>
        <p style={{ fontSize: 9, textTransform: 'uppercase', letterSpacing: '0.3em', color: 'rgba(201,168,76,0.65)', fontWeight: 600, marginBottom: 10 }}>Invitation de mariage</p>
        {savedAt && (
          <div style={{ fontSize: 11, color: '#7a9e6e', fontFamily: 'var(--font-cormorant-garamond)', fontStyle: 'italic', marginBottom: 4, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
            <span style={{ fontSize: 13 }}>✓</span>
            Sauvegardé automatiquement à {savedAt.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
          </div>
        )}
        {userEmail && (
          <div style={{ fontSize: 11, color: serverSaving ? '#C9A84C' : '#7a9e6e', fontFamily: 'var(--font-cormorant-garamond)', fontStyle: 'italic', marginBottom: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
            {serverSaving ? (
              <>Sauvegarde sur le serveur…</>
            ) : serverSavedAt ? (
              <><span style={{ fontSize: 13 }}>☁</span> Sauvegardé sur le serveur à {serverSavedAt.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}</>
            ) : null}
          </div>
        )}
        {hasDraft && (
          <div style={{ marginTop: 16, marginBottom: 16, textAlign: 'center' }}>
            <div style={{ fontSize: 13, color: '#7a9e6e', fontFamily: 'var(--font-cormorant-garamond)', fontStyle: 'italic', marginBottom: 10 }}>
              ✓ Votre travail est sauvegardé sur cet appareil
            </div>
            <button onClick={resumeDraft} style={{ ...BTN, padding: '14px 32px', borderRadius: 9999, background: 'linear-gradient(135deg, #C9A84C, #e8c96a)', color: 'white', border: 'none', fontSize: 14, fontWeight: 700, boxShadow: '0 4px 16px rgba(201,168,76,0.35)' }}>
              Reprendre mon faire-part →
            </button>
            <button
              onClick={() => {
                if (confirm('Êtes-vous sûre de vouloir tout effacer et recommencer ?')) {
                  try { localStorage.removeItem('wedding-draft') } catch {}
                  setHasDraft(false)
                }
              }}
              style={{ ...BTN, display: 'block', margin: '12px auto 0', background: 'none', border: 'none', fontSize: 11, color: '#9ca3af', textDecoration: 'underline' }}
            >
              ou recommencer à zéro
            </button>
          </div>
        )}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 12 }}>
          <div style={{ width: 40, height: 1, background: 'rgba(201,168,76,0.3)' }} />
          <span style={{ color: 'rgba(201,168,76,0.4)' }}>✦</span>
          <div style={{ width: 40, height: 1, background: 'rgba(201,168,76,0.3)' }} />
        </div>
      </div>
      <div style={{ width: '100%', maxWidth: 600, background: 'white', borderRadius: 20, padding: '32px 24px', boxShadow: '0 12px 48px rgba(0,0,0,0.07)', border: '1px solid #fce7f3', boxSizing: 'border-box' }}>
        <ProgressBar step={step} />
        {step === 1 && <Step1 data={formData} onChange={update} />}
        {step === 2 && <Step2 data={formData} onChange={update} />}
        {step === 3 && <Step3 data={formData} onChange={update} />}
        {step === 4 && <Step4 data={formData} onChange={update} />}
        <div style={{ display: 'flex', gap: 12, marginTop: 32, position: 'relative', zIndex: 1 }}>
          {step > 1 && (
            <button
              type="button"
              onClick={prev}
              onTouchEnd={onTouchPrev}
              style={{ ...BTN, flex: 1, padding: '18px 0', borderRadius: 9999, border: '1.5px solid #fecdd3', background: 'white', color: '#fb7185', fontSize: 14, fontWeight: 600 }}
            >← Précédent</button>
          )}
          <button
            type="button"
            onClick={next}
            onTouchEnd={onTouchNext}
            style={{ ...BTN, flex: 1, padding: '18px 0', borderRadius: 9999, border: 'none', background: step === 4 ? 'linear-gradient(135deg, #C9A84C, #e8c96a)' : 'linear-gradient(135deg, #fb7185, #f43f5e)', color: 'white', fontSize: 14, fontWeight: 700, boxShadow: '0 6px 20px rgba(251,113,133,0.35)' }}
          >
            {step === 4 ? 'Générer ✦' : 'Suivant →'}
          </button>
        </div>
      </div>
    </div>
  )
}
