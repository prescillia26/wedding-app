'use client'

import React, { useState, useEffect, useRef, useCallback, useMemo, useId, useLayoutEffect } from 'react'
import { createPortal } from 'react-dom'
import { useSearchParams } from 'next/navigation'
import { showToast } from '../components/Toast'
import { useT } from '@/lib/i18n'
import CeremonyWatercolorPanel from '../components/CeremonyWatercolorPanel'
import DecoIllustrationPanel from '../components/DecoIllustrationPanel'
import LuxeFairePartRenderer from '../components/LuxeFairePartRenderer'
import MonogramGenerator from '../components/MonogramGenerator'
import InvitationCover from '../components/InvitationCover'
import type { Palette } from '@/lib/watercolorPrompt'
import { toTitleCase } from '@/lib/titleCase'
import { DELIMITERS } from '@/lib/delimiters'
import VisualPicker from '../components/luxe/VisualPicker'
import { byId as visualById, VISUALS } from '@/lib/visuals'
import type { VisualCategory } from '@/lib/visuals'


type Theme = 'rose-fleuri' | 'ivoire-or' | 'bleu-floral' | 'champetre' | 'blanc-gris' | 'noir-blanc' | 'chocolat' | 'bordeaux' | 'bordeaux-nuit' | 'fuchsia' | 'marine-or' | 'menthe' | 'sable-dore' | 'terracotta' | 'lin-ecru' | 'vert-sauge' | 'rose-peche' | 'orange-terra' | 'bleu-nuit' | 'creme' | 'bleu-med' | 'blanc-imm' | 'jaune-ocre' | 'vert-celadon' | 'buttercup' | 'orange-sunset' | 'bleu-mer' | 'parme-ivoire'
type PresentationStyle = 'page-unique' | 'cartes-scrollables' | 'cartes-separees'
// ⚙️ Nombre max de photos uploadables par couple (carrousel de la section d'accueil)
const MAX_PHOTOS = 3
// ── Styles personnalisables par zone ──────────────────────────────────────────

const TEXT_ZONES = ['titres', 'prenoms', 'narratif', 'dateHeure', 'lieu', 'parents', 'infos'] as const
type TextZone = typeof TEXT_ZONES[number]

const ZONE_LABELS: Record<TextZone, string> = {
  titres: '🏷️ Titres de cérémonie',
  prenoms: '💑 Prénoms des mariés',
  narratif: '📝 Textes narratifs',
  dateHeure: '📅 Date et heure',
  lieu: '📍 Lieu et adresse',
  parents: '👨‍👩‍👧 Noms des parents',
  infos: '📌 Infos pratiques',
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

// Placeholder — sera rempli après THEMES (voir buildColorOptions)
const COLOR_OPTIONS: { value: string; label: string; swatch: string }[] = []

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
  'sable-dore':    { fond: '#faf6ee', accent: '#C9A84C', texte: '#3a3020', textSecondaire: '#8a7a5a', nom: 'Sable Doré' },
  'terracotta':    { fond: '#faf0e8', accent: '#C97F4C', texte: '#3a2010', textSecondaire: '#8a5a3a', nom: 'Terracotta' },
  'lin-ecru':      { fond: '#f8f4ee', accent: '#b0a080', texte: '#3a3528', textSecondaire: '#7a7060', nom: 'Lin Écru' },
  'vert-sauge':    { fond: '#f2f7f3', accent: '#6a9a70', texte: '#1a3020', textSecondaire: '#4a7050', nom: 'Vert Sauge' },
  'rose-peche':    { fond: '#fef5f0', accent: '#d4826a', texte: '#3a2018', textSecondaire: '#8a5a4a', nom: 'Rose Pêche' },
  'orange-terra':  { fond: '#faf0e8', accent: '#E07856', texte: '#3a1810', textSecondaire: '#8a4a30', nom: 'Orange Terracotta' },
  'bleu-nuit':     { fond: '#0e1e34', accent: '#7aaed4', texte: '#d8e4f0', textSecondaire: '#90a8c0', nom: 'Bleu Nuit', dark: true },
  'creme':         { fond: '#faf5eb', accent: '#b0a070', texte: '#3a3520', textSecondaire: '#7a7050', nom: 'Crème' },
  'bleu-med':      { fond: '#f0f6fc', accent: '#1E5BA8', texte: '#0a1a30', textSecondaire: '#3a5a80', nom: 'Bleu Méditerranée' },
  'blanc-imm':     { fond: '#fbf9f4', accent: '#9a9080', texte: '#2a2820', textSecondaire: '#6a6558', nom: 'Blanc Immaculé' },
  'jaune-ocre':    { fond: '#faf6e8', accent: '#C9A030', texte: '#3a3010', textSecondaire: '#8a7a30', nom: 'Jaune Ocre' },
  'vert-celadon':  { fond: '#f0f6f3', accent: '#5a9a80', texte: '#1a3028', textSecondaire: '#4a7a68', nom: 'Vert Céladon' },
  'buttercup':     { fond: '#fefbf0', accent: '#D4A830', texte: '#3a3010', textSecondaire: '#8a7a40', nom: 'Jaune Buttercup' },
  'orange-sunset': { fond: '#fef6f0', accent: '#F4A165', texte: '#3a2010', textSecondaire: '#8a5a30', nom: 'Orange Sunset' },
  'bleu-mer':      { fond: '#f2f8fa', accent: '#5a9ab0', texte: '#1a2a34', textSecondaire: '#4a7a8a', nom: 'Bleu Mer' },
  'parme-ivoire':  { fond: '#faf7f5', accent: '#9b72aa', texte: '#2a1a30', textSecondaire: '#7a5a8a', nom: 'Parme & Ivoire' },
}

const ORNEMENTS_LIBRARY: { id: string; url: string; nom: string }[] = [
  { id: 'orn1', url: 'https://gsihevihnthjsm8z.public.blob.vercel-storage.com/static/v1776765484/1_ruabdh.png', nom: 'Floral 1' },
  { id: 'orn2', url: 'https://gsihevihnthjsm8z.public.blob.vercel-storage.com/static/v1776765486/2_xh3erh.png', nom: 'Floral 2' },
  { id: 'orn3', url: 'https://gsihevihnthjsm8z.public.blob.vercel-storage.com/static/v1776765487/3_zdnq1l.png', nom: 'Floral 3' },
  { id: 'orn4', url: 'https://gsihevihnthjsm8z.public.blob.vercel-storage.com/static/v1776765490/4_szuz80.png', nom: 'Floral 4' },
  { id: 'orn5', url: 'https://res.cloudinary.com/dau96mui2/image/upload/v1776765492/5_dgvzjn.png', nom: 'Floral 5' },
  { id: 'orn6', url: 'https://res.cloudinary.com/dau96mui2/image/upload/v1776765509/6_bbgeun.png', nom: 'Floral 6' },
  { id: 'orn7', url: 'https://res.cloudinary.com/dau96mui2/image/upload/v1776765511/7_h5mjjm.png', nom: 'Floral 7' },
  { id: 'orn8', url: 'https://gsihevihnthjsm8z.public.blob.vercel-storage.com/static/v1776765513/8_grn4zh.png', nom: 'Floral 8' },
  { id: 'orn9', url: 'https://gsihevihnthjsm8z.public.blob.vercel-storage.com/static/v1776783658/Design_sans_titre_tzwipm.png', nom: 'Floral 9' },
  { id: 'none', url: '', nom: 'Sans ornement' },
]

// Construire COLOR_OPTIONS avec TOUTES les couleurs (base + chaque thème)
;(() => {
  const base = [
    { value: '',        label: 'Thème',    swatch: '#C9A84C' },
    { value: '#000000', label: 'Noir',     swatch: '#000000' },
    { value: '#ffffff', label: 'Blanc',    swatch: '#ffffff' },
    { value: '#9e9e9e', label: 'Argent',   swatch: '#9e9e9e' },
    { value: '#8b0000', label: 'Bordeaux', swatch: '#8b0000' },
    { value: '#4a3728', label: 'Chocolat', swatch: '#4a3728' },
    { value: '#FFD700', label: 'Jaune vif',       swatch: '#FFD700' },
    { value: '#FFEA00', label: 'Jaune fluo',      swatch: '#FFEA00' },
    { value: '#E8D4A2', label: 'Sable doré',      swatch: '#E8D4A2' },
    { value: '#EDE3D2', label: 'Lin écru',        swatch: '#EDE3D2' },
    { value: '#9DBBA1', label: 'Vert sauge',      swatch: '#9DBBA1' },
    { value: '#D63384', label: 'Fuchsia rose',    swatch: '#D63384' },
    { value: '#5DBDC8', label: 'Turquoise lagune', swatch: '#5DBDC8' },
    { value: '#7A8B5C', label: 'Vert olivier',    swatch: '#7A8B5C' },
    { value: '#F5C6B0', label: 'Rose pêche',      swatch: '#F5C6B0' },
    { value: '#1B3A5C', label: 'Bleu nuit profond', swatch: '#1B3A5C' },
    { value: '#FAF5EB', label: 'Crème',           swatch: '#FAF5EB' },
    { value: '#FBF9F4', label: 'Blanc immaculé',  swatch: '#FBF9F4' },
    { value: '#F0CD7A', label: 'Jaune buttercup', swatch: '#F0CD7A' },
    { value: '#F5D480', label: 'Or doux',         swatch: '#F5D480' },
    { value: '#E8C26E', label: 'Miel pastel',     swatch: '#E8C26E' },
    { value: '#91BDC9', label: 'Bleu mer doux',   swatch: '#91BDC9' },
    { value: '#E07856', label: 'Orange terracotta', swatch: '#E07856' },
    { value: '#1E5BA8', label: 'Bleu méditerranée', swatch: '#1E5BA8' },
    { value: '#E5B847', label: 'Jaune ocre',      swatch: '#E5B847' },
    { value: '#8FB8A8', label: 'Vert céladon',    swatch: '#8FB8A8' },
    { value: '#C97F4C', label: 'Terracotta',      swatch: '#C97F4C' },
    { value: '#F4A165', label: 'Orange sunset',   swatch: '#F4A165' },
    { value: '#C9A84C', label: 'Doré',            swatch: '#C9A84C' },
    { value: '#2c4a7c', label: 'Marine',          swatch: '#2c4a7c' },
    { value: '#7a9e6e', label: 'Vert',            swatch: '#7a9e6e' },
    { value: '#d4a574', label: 'Cuivre',          swatch: '#d4a574' },
    { value: '#d4829a', label: 'Rose',            swatch: '#d4829a' },
    { value: '#2a9a6a', label: 'Menthe',          swatch: '#2a9a6a' },
  ]
  const seen = new Set(base.map(c => c.value.toLowerCase()))
  const themeColors: typeof base = []
  Object.values(THEMES).forEach(t => {
    for (const hex of [t.accent, t.texte, t.textSecondaire, t.fond]) {
      const low = hex.toLowerCase()
      if (!seen.has(low)) {
        seen.add(low)
        themeColors.push({ value: hex, label: t.nom, swatch: hex })
      }
    }
  })
  COLOR_OPTIONS.push(...base, ...themeColors)
})()

// ── Illustrations aquarelles Canva ────────────────────────────────────────────

const ILLUSTRATIONS_COUPLES = [
  { id: 'couple-01', label: '💕 Couple classique avec voile', url: 'https://gsihevihnthjsm8z.public.blob.vercel-storage.com/static/v1776878822/81_pzfb2j.png' },
  { id: 'couple-02', label: '💕 Étreinte élégante', url: 'https://gsihevihnthjsm8z.public.blob.vercel-storage.com/static/v1776878824/82_gbqs4r.png' },
  { id: 'couple-03', label: '💕 Baiser avec bouquet', url: 'https://gsihevihnthjsm8z.public.blob.vercel-storage.com/static/v1776878831/83_iw0wq9.png' },
  { id: 'couple-04', label: '💕 Robe pailletée', url: 'https://gsihevihnthjsm8z.public.blob.vercel-storage.com/static/v1776878834/88_e6oobi.png' },
  { id: 'couple-05', label: '💕 Couple brun + brune', url: 'https://gsihevihnthjsm8z.public.blob.vercel-storage.com/static/v1776878835/87_hejtki.png' },
  { id: 'couple-06', label: '🌸 Arche florale rose', url: 'https://gsihevihnthjsm8z.public.blob.vercel-storage.com/static/v1776878838/94_l7zjbv.png' },
  { id: 'couple-07', label: '💕 Couple aquarelle', url: 'https://gsihevihnthjsm8z.public.blob.vercel-storage.com/static/v1780498222/1_dpwtiu.png' },
  { id: 'couple-08', label: '💕 Portail fleuri', url: 'https://gsihevihnthjsm8z.public.blob.vercel-storage.com/static/v1780498299/56_wny8tt.png' },
  { id: 'couple-09', label: '💕 Jardin romantique', url: 'https://gsihevihnthjsm8z.public.blob.vercel-storage.com/static/v1780498296/55_oxmray.png' },
  { id: 'couple-10', label: '💕 Arche végétale', url: 'https://gsihevihnthjsm8z.public.blob.vercel-storage.com/static/v1780498291/49_iv6cle.png' },
  { id: 'couple-11', label: '💕 Couple sous glycine', url: 'https://gsihevihnthjsm8z.public.blob.vercel-storage.com/static/v1780498289/43_xziory.png' },
  { id: 'couple-12', label: '💕 Allée fleurie', url: 'https://gsihevihnthjsm8z.public.blob.vercel-storage.com/static/v1780498289/46_nqxkzg.png' },
  { id: 'couple-13', label: '💕 Terrasse méditerranéenne', url: 'https://gsihevihnthjsm8z.public.blob.vercel-storage.com/static/v1780498287/38_usomhj.png' },
  { id: 'couple-14', label: '💕 Château aquarelle', url: 'https://gsihevihnthjsm8z.public.blob.vercel-storage.com/static/v1780498283/34_wnjgyc.png' },
  { id: 'couple-15', label: '💕 Domaine champêtre', url: 'https://gsihevihnthjsm8z.public.blob.vercel-storage.com/static/v1780498279/24_yh2poc.png' },
  { id: 'couple-16', label: '💕 Vignoble', url: 'https://gsihevihnthjsm8z.public.blob.vercel-storage.com/static/v1780498272/21_uq53kw.png' },
  { id: 'couple-17', label: '💕 Mas provençal', url: 'https://gsihevihnthjsm8z.public.blob.vercel-storage.com/static/v1780498271/20_fsei03.png' },
  { id: 'couple-18', label: '💕 Villa élégante', url: 'https://gsihevihnthjsm8z.public.blob.vercel-storage.com/static/v1780498230/13_vtlmbu.png' },
  { id: 'couple-19', label: '🎨 Fond aquarelle 1', url: 'https://gsihevihnthjsm8z.public.blob.vercel-storage.com/static/v1780836630/watercolor_back_1_n62jqo.png' },
  { id: 'couple-20', label: '🎨 Fond aquarelle 2', url: 'https://gsihevihnthjsm8z.public.blob.vercel-storage.com/static/v1780836663/watercolor_back_2_uj4ama.png' },
  { id: 'couple-21', label: '🎨 Fond aquarelle 3', url: 'https://gsihevihnthjsm8z.public.blob.vercel-storage.com/static/v1780836667/watercolor_back_3_fjtbqm.png' },
] as const

// ── Illustrations RSVP (boîte aux lettres, enveloppes, etc.) ──
const ILLUSTRATIONS_RSVP = [
  { id: 'rsvp-01', url: 'https://gsihevihnthjsm8z.public.blob.vercel-storage.com/static/v1780679794/87_k4isjc.png' },
  { id: 'rsvp-02', url: 'https://gsihevihnthjsm8z.public.blob.vercel-storage.com/static/v1780679796/86_owvqqb.png' },
  { id: 'rsvp-03', url: 'https://gsihevihnthjsm8z.public.blob.vercel-storage.com/static/v1780679801/88_l3pukk.png' },
  { id: 'rsvp-04', url: 'https://gsihevihnthjsm8z.public.blob.vercel-storage.com/static/v1780679813/90_aicvrs.png' },
  { id: 'rsvp-05', url: 'https://gsihevihnthjsm8z.public.blob.vercel-storage.com/static/v1780679819/91_dvzxei.png' },
  { id: 'rsvp-06', url: 'https://gsihevihnthjsm8z.public.blob.vercel-storage.com/static/v1780679836/89_ms4ox1.png' },
  { id: 'rsvp-07', url: 'https://gsihevihnthjsm8z.public.blob.vercel-storage.com/static/v1780679848/92_slsvpe.png' },
  { id: 'rsvp-08', url: 'https://gsihevihnthjsm8z.public.blob.vercel-storage.com/static/v1780679848/93_kyhcqx.png' },
  { id: 'rsvp-09', url: 'https://gsihevihnthjsm8z.public.blob.vercel-storage.com/static/v1780679849/94_aogybr.png' },
] as const

// ── Couleurs Luxe Aquarelle ──
const LUXE_COLORS: { id: string; label: string; hex: string; palette: Palette }[] = [
  { id: 'dore',       label: 'Doré',         hex: '#C9A84C', palette: 'dore' },
  { id: 'rose_clair', label: 'Rose clair',   hex: '#e8a0b4', palette: 'rose_clair' },
  { id: 'rose',       label: 'Rose',         hex: '#d4829a', palette: 'rose' },
  { id: 'fuchsia',    label: 'Fuchsia',      hex: '#d4006a', palette: 'rose' },
  { id: 'corail',     label: 'Corail',       hex: '#e87461', palette: 'peche' },
  { id: 'peche',      label: 'Pêche',        hex: '#e8a870', palette: 'peche' },
  { id: 'terracotta', label: 'Terracotta',   hex: '#c4704a', palette: 'terracotta' },
  { id: 'bordeaux',   label: 'Bordeaux',     hex: '#8b1a2a', palette: 'bordeaux' },
  { id: 'chocolat',   label: 'Chocolat',     hex: '#6b4226', palette: 'terracotta' },
  { id: 'mauve',      label: 'Mauve',        hex: '#9b72aa', palette: 'mauve' },
  { id: 'lavande',    label: 'Lavande',      hex: '#8a7cb8', palette: 'lavande' },
  { id: 'violet',     label: 'Violet',       hex: '#6b21a8', palette: 'lavande' },
  { id: 'bleu_ciel',  label: 'Bleu ciel',    hex: '#7aaed4', palette: 'bleu_ciel' },
  { id: 'bleu',       label: 'Bleu nuit',    hex: '#2c4a7c', palette: 'bleu_nuit' },
  { id: 'marine',     label: 'Marine',       hex: '#1e3a5f', palette: 'bleu_nuit' },
  { id: 'turquoise',  label: 'Turquoise',    hex: '#2a9d8f', palette: 'menthe' },
  { id: 'sauge',      label: 'Vert sauge',   hex: '#7a9e6e', palette: 'sauge' },
  { id: 'menthe',     label: 'Menthe',       hex: '#2a9a6a', palette: 'menthe' },
  { id: 'olive',      label: 'Olive',        hex: '#5a6e3a', palette: 'sauge' },
  { id: 'foret',      label: 'Vert forêt',   hex: '#2d5a3d', palette: 'sauge' },
  { id: 'gris',       label: 'Gris',         hex: '#7a7a7a', palette: 'dore' },
  { id: 'noir',       label: 'Noir',         hex: '#2a2a2a', palette: 'dore' },
  { id: 'blanc',      label: 'Blanc',        hex: '#c8c0b8', palette: 'dore' },
  { id: 'ivoire',     label: 'Ivoire',       hex: '#d4c5a0', palette: 'dore' },
  { id: 'sable_dore', label: 'Sable doré',   hex: '#E8D4A2', palette: 'sable_dore' },
  { id: 'rose_peche', label: 'Rose pêche',   hex: '#F5C6B0', palette: 'rose_peche' },
  { id: 'bleu_med',   label: 'Bleu méditerranée', hex: '#1E5BA8', palette: 'bleu_med' },
  { id: 'jaune_ocre', label: 'Jaune ocre',   hex: '#E5B847', palette: 'bleu_med' },
  { id: 'vert_celadon', label: 'Vert céladon', hex: '#8FB8A8', palette: 'bleu_med' },
  { id: 'turquoise_lagune', label: 'Turquoise lagune', hex: '#5DBDC8', palette: 'fuchsia' },
  { id: 'vert_olivier', label: 'Vert olivier', hex: '#7A8B5C', palette: 'fuchsia' },
  { id: 'lin_ecru',   label: 'Lin écru',     hex: '#EDE3D2', palette: 'sable_dore' },
  { id: 'orange_terra', label: 'Orange terracotta', hex: '#E07856', palette: 'rose_peche' },
  { id: 'blanc_imm',  label: 'Blanc immaculé', hex: '#FBF9F4', palette: 'bleu_med' },
  { id: 'buttercup',  label: 'Jaune buttercup', hex: '#F0CD7A', palette: 'buttercup' },
  { id: 'or_doux',    label: 'Or doux',       hex: '#F5D480', palette: 'buttercup' },
  { id: 'miel',       label: 'Miel pastel',   hex: '#E8C26E', palette: 'buttercup' },
  { id: 'orange_sunset', label: 'Orange sunset', hex: '#F4A165', palette: 'orange_sunset' },
  { id: 'bleu_mer',   label: 'Bleu mer doux', hex: '#91BDC9', palette: 'bleu_mer' },
]


// Vidéos animées supprimées (inutilisées) — tableau vide pour rétrocompatibilité
const VIDEO_BACKGROUNDS: { id: string; label: string; url: string; textPosition: 'top' | 'center' | 'center-top'; needsOverlay: boolean; dark?: boolean }[] = []

const FRAMES_STRONG_BG = new Set(['frame-80', 'frame-107', 'frame-108'])
// Padding personnalisé pour les cadres à bordure — top/bottom/h adaptés à chaque cadre
const FRAMES_CUSTOM_PADDING: Record<string, { top: number; bottom: number; h: number }> = {}
// Types de templates décoratifs
type FrameType = 'floral-corners' | 'full-border' | 'watermark'

// Rendering helpers per frameType — pour l'instant tous identiques (cover + multiply)
// La distinction par frameType sera activée plus tard cadre par cadre
function frameImgStyle(_ft: FrameType | undefined, opacity: number, size: number): React.CSSProperties {
  return { position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', objectFit: 'cover', mixBlendMode: 'multiply', opacity, transform: `scale(${size / 100})`, transformOrigin: 'center center', pointerEvents: 'none' }
}

const FRAMES: { id: string; label: string; url: string | null; video?: boolean; frameType?: FrameType }[] = [
  // ── Floral corners : fleurs dans les coins, centre vide pour le texte ──
  { id: 'frame-55', label: '🌸 Bouquet Bleu', url: 'https://gsihevihnthjsm8z.public.blob.vercel-storage.com/static/v1781115458/55_l7xahl.png', frameType: 'floral-corners' },
  { id: 'frame-69', label: '🌸 Roses Pâles', url: 'https://gsihevihnthjsm8z.public.blob.vercel-storage.com/static/v1781685863/calgznugulyoc8ywwptq.png', frameType: 'floral-corners' },
  { id: 'frame-70', label: '🌸 Fleurs Sauvages', url: 'https://gsihevihnthjsm8z.public.blob.vercel-storage.com/static/v1781685866/dpatdrrz0bikckoocsd7.png', frameType: 'floral-corners' },
  { id: 'frame-71', label: '🌸 Pivoine Rose', url: 'https://gsihevihnthjsm8z.public.blob.vercel-storage.com/static/v1781685869/yt7c9cm2gtlwdugh2pbb.png', frameType: 'floral-corners' },
  { id: 'frame-96', label: '🌸 Bouquet Délicat', url: 'https://gsihevihnthjsm8z.public.blob.vercel-storage.com/static/v1781685872/tufhxphvbr2yk4gfglsu.png', frameType: 'floral-corners' },
  { id: 'frame-97', label: '🌸 Floral Doux', url: 'https://gsihevihnthjsm8z.public.blob.vercel-storage.com/static/v1781685876/unxr2tthzlwq1ae9br1y.png', frameType: 'floral-corners' },
  { id: 'frame-147', label: '🌿 Feuillage Vert', url: 'https://gsihevihnthjsm8z.public.blob.vercel-storage.com/static/v1781685883/qnajhywttdhhqrnczvlr.png', frameType: 'floral-corners' },
  { id: 'frame-154', label: '🌿 Laurier', url: 'https://gsihevihnthjsm8z.public.blob.vercel-storage.com/static/v1781685885/nhrvz13kb6wht2x7fq5p.png', frameType: 'floral-corners' },
  // ── Full border : cadre complet autour de toute la section ──
  { id: 'frame-02', label: '🤍 Roses Crème', url: 'https://gsihevihnthjsm8z.public.blob.vercel-storage.com/static/v1776785419/51_m9vx96.png', frameType: 'full-border' },
  { id: 'frame-03', label: '🌺 Cadre Rose', url: 'https://gsihevihnthjsm8z.public.blob.vercel-storage.com/static/v1776785419/53_ho1gq8.png', frameType: 'full-border' },
  { id: 'frame-07', label: '🌷 Aquarelle Rose', url: 'https://gsihevihnthjsm8z.public.blob.vercel-storage.com/static/v1776785416/49_ewrr8v.png', frameType: 'full-border' },
  { id: 'frame-34', label: '🌻 Floral Doré', url: 'https://gsihevihnthjsm8z.public.blob.vercel-storage.com/static/v1776778816/14_bzmmdm.png', frameType: 'full-border' },
  { id: 'frame-61', label: '🌸 Couronne Florale', url: 'https://res.cloudinary.com/dau96mui2/image/upload/v1776857014/61_nnkips.png', frameType: 'full-border' },
  { id: 'frame-75', label: '🌸 Cadre Complet', url: 'https://gsihevihnthjsm8z.public.blob.vercel-storage.com/static/v1776878823/75_qc4gsm.png', frameType: 'full-border' },
  { id: 'frame-78', label: '🌸 Cadre Pêche', url: 'https://gsihevihnthjsm8z.public.blob.vercel-storage.com/static/v1776878816/78_umvdax.png', frameType: 'full-border' },
  { id: 'frame-79', label: '🌸 Cadre Pastel', url: 'https://gsihevihnthjsm8z.public.blob.vercel-storage.com/static/v1776878824/79_msrbl6.png', frameType: 'full-border' },
  // ── Watermark : fond pâle en filigrane ──
  // ── Sans cadre ──
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
  'sable-dore':    '#faf6ee',
  'terracotta':    '#faf0e8',
  'lin-ecru':      '#f8f4ee',
  'vert-sauge':    '#f2f7f3',
  'rose-peche':    '#fef5f0',
  'orange-terra':  '#faf0e8',
  'bleu-nuit':     '#0e1e34',
  'creme':         '#faf5eb',
  'bleu-med':      '#f0f6fc',
  'blanc-imm':     '#fbf9f4',
  'jaune-ocre':    '#faf6e8',
  'vert-celadon':  '#f0f6f3',
  'parme-ivoire':  '#faf7f5',
}

const CEREMONY_TYPES = ['Mairie', 'Cérémonie religieuse / Houppa', 'Shabbat Hatan', 'Henné', 'Cocktail', 'Soirée', 'Boat Party', 'Beach Party', 'Autre']

// ── Pages supplémentaires (pages libres entre les cérémonies) ──
interface CustomPageImage {
  url: string
}

interface CustomPage {
  id: string
  texte?: string
  texteColor?: string
  texteFont?: string
  texteOffsetX?: number
  texteOffsetY?: number
  images: CustomPageImage[]
  imagesMode: 'carousel' | 'statique'
  position: number
}

// ── Shabbat Hatan : moments multi-jours ──
interface ShabbatMoment {
  id: string
  label: string
  heure?: string
  lieu?: string
  adresse?: string
  note?: string
}

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
  // ── Aquarelle IA v2 (par événement) ──
  illustrationUrl?: string
  illustrationSize?: number // % de largeur (30-150, défaut 80)
  illustrationOffsetX?: number // décalage horizontal en px
  illustrationOffsetY?: number // décalage vertical en px
  // ── Masquer du carton-réponse ──
  rsvpHidden?: boolean
  // ── Shabbat multi-jours ──
  multiJours?: ShabbatMoment[]
  // ── Photo de fond du lieu ──
  ceremonyImage?: string
  ceremonyImageOpacity?: number // 0-100, default 30
  // ── Fond personnalisé par cérémonie ──
  bgColor?: string // couleur de fond custom (ex: '#EBF2FA' bleu clair)
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
  emailMaries2?: string
  textOverrides?: Record<string, string>
  monogrammeStyle?: string
  monogrammeColor?: string
  musicName?: string
  ornamentId?: string
  fondCeremonie?: 'ornements' | 'photo'
  photoPosition?: 'top' | 'center' | 'bottom' | 'left' | 'right'
  photosData?: { url: string; cropX: number; cropY: number; cropScale: number; faceCropUrl?: string }[]
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
  styleAccueil?: 'photo' | 'monogramme' | 'illustration' | 'video'
  illustrationCoupleId?: string
  effetTexte?: 'aucun' | 'or' | 'aquarelle' | 'embosse'
  dateAccueilOverride?: string // Date affichée sur la page d'accueil (override manuel)
  videoAccueilId?: string // ID vidéo animée pour page d'accueil
  accueilLayout?: Record<string, { x: number; y: number; scale: number; color?: string; fontFamily?: string }>
  customLogoUrl?: string
  customLogoOriginalUrl?: string // URL brute avant transformations (pour re-générer)
  customLogoSize?: number // 50-150, default 100
  customLogoColor?: string // '' = original, ou hex color
  headerLogoColor?: string // couleur du logo dans la bannière sticky
  headerLogoSize?: number // taille du logo bannière (30-80, default 48)
  headerLogoBold?: number // intensité du logo bannière (100-300, default 100)
  hideAccueilLogo?: boolean // masquer le logo/monogramme sur la page d'accueil
  textOffsetY?: number // décalage vertical du texte en px (négatif = plus haut)
  petalsEnabled?: boolean // pétales/particules sur le faire-part (false par défaut)
  illustrationUrl?: string // aquarelle IA v1 (rétrocompat)
  illustrations?: IllustrationElement[] // v2 : tableau d'illustrations (scènes + motifs)
  rsvpDeadline?: string // date limite de confirmation (YYYY-MM-DD)
  rsvpIllustrationUrl?: string // illustration choisie pour le carton-réponse
  rsvpIllustrationSize?: number // taille illustration RSVP (30-150, default 60)
  rsvpIllustrationOffsetX?: number
  rsvpIllustrationOffsetY?: number
  illustrationCoupleSize?: number // taille illustration couple page d'accueil (30-150, default 70)
  illustrationCoupleOffsetX?: number
  illustrationCoupleOffsetY?: number
  luxeColor?: string // couleur choisie pour le pack Luxe Aquarelle
  luxeDecoUrls?: Record<string, string> // decoId → saved URL des illustrations décoratives générées par IA
  luxeMonogramUrl?: string // URL du monogramme entrelacé IA (pack Luxe)
  luxeStory?: string // texte narratif optionnel (pack Luxe)
  luxeDressCode?: string // dress code optionnel (pack Luxe)
  luxeGiftsUrl?: string // lien liste de mariage (pack Luxe)
  luxeGiftsLabel?: string // label du lien (ex: "Notre liste sur Zankyou")
  luxeDelimiterId?: string // id du délimiteur signature (pack Luxe Pro)
  luxePalette?: string // palette Luxe Pro (lavande/rose/sauge/bleunuit)
  // ── Couleur globale de tous les textes ──
  globalTextColor?: string
  phraseColor?: string // couleur de la phrase "ont le plaisir..."
  // ── Mode Design Custom (upload images Canva/Etsy) ──
  customDesignMode?: boolean // si true, affiche les images custom au lieu des cartes cérémonies
  customDesignPages?: string[] // URLs des pages uploadées (ordre d'affichage)
  customDesignCoverUrl?: string // image de couverture custom (remplace la cover getlovit)
  customDesignCoverVideoUrl?: string // vidéo de couverture custom (ex: enveloppe Canva/Etsy)
  videoPosterUrl?: string // image poster (première frame) de la vidéo d'ouverture
  // ── Overlay texte sur vidéo d'ouverture ──
  videoOverlayText1?: string // ligne 1 (ex: prénoms)
  videoOverlayText2?: string // ligne 2 (ex: "ont le plaisir de vous convier")
  videoOverlayText3?: string // ligne 3 (ex: "à leur mariage")
  videoOverlayShowBsd?: boolean // afficher בס״ד
  videoOverlayTextColor?: string // couleur du texte overlay
  videoOverlayBgColor?: string // couleur de fond après la vidéo
  // ── Pages supplémentaires (libres, entre les cérémonies) ──
  customPages?: CustomPage[]
  // ── Position du bouton Découvrir (page d'accueil) ──
  decouvrirButtonPosition?: { x: number; y: number }
  // ── Zones de texte personnalisées (ajoutées par les mariés) ──
  customTextZones?: { id: string; text: string; x: number; y: number; style?: string }[]
  // ── Logo en filigrane (watermark) derrière le contenu ──
  logoWatermark?: boolean // afficher le logo en filigrane derrière chaque cérémonie
  logoWatermarkOpacity?: number // 0-1, default 0.06
  logoWatermarkSize?: number // taille en px (80-400, default 180)
  logoWatermarkColor?: string // couleur du filigrane (hex, '' = utiliser le logo tel quel)
  // ── Layout accueil compact ──
  accueilCompact?: boolean // si true, pas de minHeight 100svh sur la couverture
  premiumCover?: boolean
  premiumCeremonyStyle?: boolean // if true, premium date format + tighter spacing + SVG separators
  continuousLayout?: boolean // if true, minimal spacing between ceremonies (per-invitation flag)
}

type IllustrationKind = 'scene' | 'motif'
interface IllustrationElement {
  id: string
  kind: IllustrationKind
  url: string
  sectionId?: string   // ex: 'c0', 'c1', 'accueil'
  x: number; y: number; width: number; height: number
  rotation?: number
  zIndex?: number
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
  frameId: 'none',
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
function fmtGpCouple(perePrenom: string, pereNom: string, merePrenom: string, mereNom: string, titles?: { mr: string; mrs: string; mrAndMrs: string }): string {
  const mr = titles?.mr ?? 'M.'
  const mrs = titles?.mrs ?? 'Mme'
  const mrAndMrs = titles?.mrAndMrs ?? 'M. & Mme'
  const hasPere = perePrenom || pereNom
  const hasMere = merePrenom || mereNom
  if (hasPere && hasMere) return [mrAndMrs, perePrenom, pereNom || mereNom].filter(Boolean).join(' ')
  if (hasPere) return [mr, perePrenom, pereNom].filter(Boolean).join(' ')
  if (hasMere) return [mrs, merePrenom, mereNom].filter(Boolean).join(' ')
  return ''
}
function fmtParentsLines(pPrenom: string, pNom: string, mPrenom: string, mNom: string, titles?: { mr: string; mrs: string; mrAndMrs: string }): string[] {
  const mr = titles?.mr ?? 'M.'
  const mrs = titles?.mrs ?? 'Mme'
  const mrAndMrs = titles?.mrAndMrs ?? 'M. & Mme'
  const pFull = joinName(pPrenom, pNom)
  const mFull = joinName(mPrenom, mNom)
  if (pFull && mFull) return [mrAndMrs + ' ' + pFull]
  if (pFull) return [mr + ' ' + pFull]
  if (mFull) return [mrs + ' ' + mFull]
  return []
}

/** Retourne un textShadow adapté pour la lisibilité selon le thème et le fond */
function readableShadow(theme: ThemeObj, hasPhotoBg = false, hasFrame = false): string {
  if (theme.dark) {
    // Thème sombre : double halo — glow clair autour du texte clair pour le détacher du fond
    return '0 0 8px rgba(0,0,0,0.8), 0 0 20px rgba(0,0,0,0.5), 0 1px 3px rgba(0,0,0,0.9)'
  }
  if (hasPhotoBg) {
    // Photo de fond avec overlay : halo blanc épais pour contraste
    return '0 1px 3px rgba(255,255,255,0.95), 0 0 12px rgba(255,255,255,0.9), 0 0 24px rgba(255,255,255,0.6)'
  }
  if (hasFrame) {
    return 'none'
  }
  // Thème clair sans photo : halo blanc subtil pour la profondeur
  return '0 1px 2px rgba(255,255,255,0.8), 0 0 8px rgba(255,255,255,0.5)'
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
      filter: 'drop-shadow(0 1px 3px rgba(0,0,0,0.4)) drop-shadow(0 0 8px rgba(255,255,255,0.5))',
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
// ── Logo display URL — pré-généré si dispo, sinon fallback transformations ───
function getLogoDisplayUrl(data: { luxeMonogramUrl?: string; customLogoUrl?: string; customLogoOriginalUrl?: string; customLogoColor?: string }): string | undefined {
  if (data.luxeMonogramUrl) return data.luxeMonogramUrl
  if (!data.customLogoUrl) return undefined
  // Si customLogoOriginalUrl existe, le logo est déjà pré-généré → utiliser directement
  if (data.customLogoOriginalUrl) return data.customLogoUrl
  // Ancien faire-part sans pré-génération → fallback sur transformations à la volée
  if (data.customLogoUrl.includes('cloudinary.com')) {
    const hex = (data.customLogoColor || '').replace('#', '')
    return hex
      ? data.customLogoUrl.replace('/upload/', `/upload/e_background_removal/e_trim/e_grayscale/e_tint:100:${hex}:0p/`)
      : data.customLogoUrl.replace('/upload/', '/upload/e_background_removal/e_trim/')
  }
  return data.customLogoUrl
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

function formatHeure(h: string, locale = 'fr'): string {
  if (!h) return ''
  if (locale === 'en') {
    const [hh, mm] = h.split(':').map(Number)
    const ampm = hh >= 12 ? 'PM' : 'AM'
    const h12 = hh % 12 || 12
    return `at ${h12}:${String(mm).padStart(2, '0')} ${ampm}`
  }
  return `à ${h.replace(':', 'h')}`
}

function formatLieu(lieu: string, locale = 'fr'): string {
  if (!lieu) return ''
  if (locale === 'en') return `At ${lieu}`
  const l = lieu.toLowerCase()
  if (l.includes('salon') || l.includes('salle')) return `Dans les salons ${lieu}`
  if (l.includes('château') || l.includes('chateau')) return `Au château ${lieu}`
  if (l.includes('domaine')) return `Au domaine ${lieu}`
  return `À ${lieu}`
}

function conjonctionLieu(lieu: string, locale = 'fr'): string {
  if (!lieu) return ''
  if (locale === 'en') return `at ${lieu}`
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
    const d = new Date(dateStr + 'T12:00:00')
    const parts = new Intl.DateTimeFormat('he-IL-u-ca-hebrew', { year: 'numeric', month: 'long', day: 'numeric' }).formatToParts(d)
    const day = parts.find(p => p.type === 'day')?.value || ''
    let month = parts.find(p => p.type === 'month')?.value || ''
    const year = parts.find(p => p.type === 'year')?.value || ''
    // Retirer le ב (be) au début du mois
    if (month.startsWith('ב')) month = month.slice(1)
    return `${day} ${month} ${year}`
  } catch { return '' }
}

// ── Phrase d'invitation par défaut, mise en page élégante ─────────────────────
// Retourne un JSX avec la structure : intro + NOMS en valeur + suite
function renderInvitationPhrase(
  ceremony: Ceremony,
  data: FormData,
  accent: string,
  textColor: string,
  dict?: import('@/lib/i18n/types').FairepartDict
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
  // Si le client a défini une police custom pour les prénoms (zoneStyles), on l'utilise
  // Sinon on garde le style par défaut Playfair MAJUSCULES
  const hasCustomPrenomFont = !!data.zoneStyles?.prenoms?.fontFamily
  const highlightStyle: React.CSSProperties = hasCustomPrenomFont
    ? applyZoneStyle({
        fontFamily: FP,
        fontSize: 'clamp(28px,7vw,42px)',
        color: accent,
        textAlign: 'center',
        margin: '6px 0 14px',
        lineHeight: 1.4,
      }, 'prenoms', data.zoneStyles)
    : {
        fontFamily: FP,
        fontSize: 'clamp(18px, 4.5vw, 22px)',
        color: accent,
        fontWeight: 700,
        letterSpacing: 3,
        textTransform: 'uppercase',
        textAlign: 'center',
        margin: '6px 0 14px',
        whiteSpace: 'nowrap',
        overflowWrap: 'normal',
        wordBreak: 'keep-all',
      }

  switch (ceremony.type) {
    case 'Shabbat Hatan': {
      const familles = [nom1, nom2].filter(Boolean).join(' & ')
      return (
        <>
          {familles && <div style={introStyle}>{dict?.inviteFamilies ?? 'Les familles'}</div>}
          {familles && <div style={highlightStyle}>{familles}</div>}
          <div style={introStyle}>
            {familles ? (dict?.inviteWillBeDelightedToInviteYou ?? 'seront ravies de vous convier au') : (dict?.inviteYouAreInvitedTo ?? 'Vous êtes conviés au')}
          </div>
          <div style={{ ...introStyle, margin: '0 0 4px' }}>{dict?.inviteShabbatHatanOf ?? 'Shabbat Hatan de'}</div>
          <div style={highlightStyle}>{p1} &amp; {p2}</div>
        </>
      )
    }
    case 'Henné':
      return (
        <>
          <div style={introStyle}>{dict?.inviteHenneIntro ?? 'Vous êtes chaleureusement conviés à'}</div>
          <div style={{ ...introStyle, margin: '0 0 4px' }}>{dict?.inviteHenneOf ?? 'la soirée du henné de'}</div>
          <div style={highlightStyle}>{p1} &amp; {p2}</div>
          <div style={introStyle}>{dict?.inviteHenneTradition ?? 'dans la tradition et la joie'}</div>
        </>
      )
    case 'Cocktail':
      return (
        <>
          <div style={{ ...introStyle, margin: '0 0 4px' }}>{dict?.inviteCocktailIntro ?? 'Levons notre verre avec'}</div>
          <div style={highlightStyle}>{p1} &amp; {p2}</div>
          <div style={introStyle}>{(dict?.inviteCocktailCelebrate ?? 'pour célébrer ensemble\nle début de cette belle aventure').split('\n').map((line, i) => <React.Fragment key={i}>{i > 0 && <br />}{line}</React.Fragment>)}</div>
        </>
      )
    case 'Soirée':
      return (
        <>
          <div style={{ ...introStyle, margin: '0 0 4px' }}>{dict?.inviteSoireeIntro ?? 'Dansez, riez et célébrez avec'}</div>
          <div style={highlightStyle}>{p1} &amp; {p2}</div>
          <div style={introStyle}>{dict?.inviteSoireeAllNight ?? "jusqu'au bout de la nuit"}</div>
        </>
      )
    case 'Boat Party':
      return (
        <>
          <div style={{ ...introStyle, margin: '0 0 4px' }}>{dict?.inviteBoatPartyIntro ?? 'Embarquez avec'}</div>
          <div style={highlightStyle}>{p1} &amp; {p2}</div>
          <div style={introStyle}>{(dict?.inviteBoatPartySea ?? 'pour une soirée inoubliable,\nentre ciel et mer').split('\n').map((line, i) => <React.Fragment key={i}>{i > 0 && <br />}{line}</React.Fragment>)}</div>
        </>
      )
    case 'Beach Party':
      return (
        <>
          <div style={{ ...introStyle, margin: '0 0 4px' }}>{dict?.inviteBeachPartyIntro ?? 'Retrouvez'}</div>
          <div style={highlightStyle}>{p1} &amp; {p2}</div>
          <div style={introStyle}>{(dict?.inviteBeachPartySea ?? 'les pieds dans le sable,\npour une fête inoubliable').split('\n').map((line, i) => <React.Fragment key={i}>{i > 0 && <br />}{line}</React.Fragment>)}</div>
        </>
      )
    case 'Autre': {
      const evt = ceremony.customName || (dict?.inviteAutreDefaultEvent ?? 'cet événement')
      return (
        <>
          <div style={{ ...introStyle, margin: '0 0 4px' }}>{dict?.inviteAutreJoin ?? 'Rejoignez'}</div>
          <div style={highlightStyle}>{p1} &amp; {p2}</div>
          <div style={introStyle}>{dict?.inviteAutreFor ?? 'pour'} {evt}</div>
        </>
      )
    }
    default:
      return null
  }
}
function Linkify({ text, color }: { text: string; color: string }) {
  // Supporte 2 formats :
  // 1. [texte cliquable](https://url) → lien hypertexte sur le texte
  // 2. https://url brute → lien cliquable sur l'URL
  const mdLinkRegex = /\[([^\]]+)\]\(([^)]+)\)/g
  const urlRegex = /(https?:\/\/[^\s,)]+)/g

  // D'abord traiter les liens markdown [texte](url)
  const segments: { type: 'text' | 'mdlink' | 'url'; content: string; href?: string }[] = []
  let lastIndex = 0
  let match: RegExpExecArray | null
  while ((match = mdLinkRegex.exec(text)) !== null) {
    if (match.index > lastIndex) segments.push({ type: 'text', content: text.slice(lastIndex, match.index) })
    const rawHref = match[2]
    const href = rawHref.match(/^https?:\/\//) ? rawHref : `https://${rawHref}`
    segments.push({ type: 'mdlink', content: match[1], href })
    lastIndex = match.index + match[0].length
  }
  if (lastIndex < text.length) segments.push({ type: 'text', content: text.slice(lastIndex) })

  return (
    <>
      {segments.map((seg, i) => {
        if (seg.type === 'mdlink') {
          return <a key={i} href={seg.href} target="_blank" rel="noopener noreferrer" style={{ color, textDecoration: 'underline', fontWeight: 600 }}>{seg.content}</a>
        }
        // Pour les segments texte, chercher les URLs brutes
        const parts = seg.content.split(urlRegex)
        return parts.map((part, j) =>
          urlRegex.test(part) ? (
            <a key={`${i}-${j}`} href={part} target="_blank" rel="noopener noreferrer" style={{ color, textDecoration: 'underline', wordBreak: 'break-all' }}>{part}</a>
          ) : (
            <span key={`${i}-${j}`}>{part}</span>
          )
        )
      })}
    </>
  )
}

function sortByDate(ceremonies: Ceremony[]): Ceremony[] {
  // Tri stable : par date, puis par index original en cas d'égalité
  return ceremonies.map((c, i) => ({ c, i })).sort((a, b) => {
    if (!a.c.date && !b.c.date) return a.i - b.i
    if (!a.c.date) return 1
    if (!b.c.date) return -1
    const diff = new Date(a.c.date).getTime() - new Date(b.c.date).getTime()
    return diff !== 0 ? diff : a.i - b.i
  }).map(x => x.c)
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
      result.display = 'block'
    }
  }
  return result
}
// ── Drag & drop pour positionner les éléments sur la page d'accueil ──
type LayoutEntry = { x: number; y: number; scale: number; color?: string; fontFamily?: string }
type LayoutMap = Record<string, LayoutEntry>

// Couleurs pour le DraggableElement inline style popup — dédupliquées, essentielles
// Mêmes couleurs que le logo — dédupliquées depuis COLOR_OPTIONS
const DRAG_COLORS = (() => {
  const seen = new Set<string>()
  return COLOR_OPTIONS.map(c => c.value).filter(v => { const k = v.toLowerCase(); if (seen.has(k)) return false; seen.add(k); return true })
})()
const DRAG_FONTS = [
  { value: '', label: 'Défaut' },
  { value: 'var(--font-great-vibes)', label: 'Great Vibes' },
  { value: 'var(--font-cormorant-garamond)', label: 'Cormorant' },
  { value: 'var(--font-playfair-display)', label: 'Playfair' },
  { value: 'var(--font-bellefair)', label: 'Bellefair' },
  { value: 'var(--font-cinzel)', label: 'Cinzel' },
  { value: 'var(--font-pinyon-script)', label: 'Pinyon Script' },
  { value: 'var(--font-alex-brush)', label: 'Alex Brush' },
  { value: 'var(--font-tenor-sans)', label: 'Tenor Sans' },
  { value: 'Georgia, serif', label: 'Georgia' },
  { value: '"Times New Roman", serif', label: 'Times' },
  { value: 'Helvetica, Arial, sans-serif', label: 'Helvetica' },
]

function DraggableElement({ id, layout, onLayoutChange, editable, children }: {
  id: string
  layout?: LayoutMap
  onLayoutChange?: (layout: LayoutMap) => void
  editable: boolean
  children: React.ReactNode
}) {
  const pos = layout?.[id] ?? { x: 0, y: 0, scale: 1 }
  const dragRef = useRef<{ startX: number; startY: number; origX: number; origY: number } | null>(null)
  const [selected, setSelected] = useState(false)
  const [showPanel, setShowPanel] = useState(false)

  const containerRef = useRef<HTMLDivElement>(null)
  useEffect(() => {
    if (!selected) return
    const close = (e: PointerEvent) => {
      if (containerRef.current?.contains(e.target as Node)) return
      setSelected(false)
      setShowPanel(false)
    }
    const timer = setTimeout(() => document.addEventListener('pointerdown', close), 10)
    return () => { clearTimeout(timer); document.removeEventListener('pointerdown', close) }
  }, [selected])

  const toolbarRef = useRef<HTMLDivElement>(null)
  const panelRef = useRef<HTMLDivElement>(null)

  const handlePointerDown = (e: React.PointerEvent) => {
    if (!editable) return
    if (toolbarRef.current?.contains(e.target as Node)) return
    if (panelRef.current?.contains(e.target as Node)) return
    // Ne pas intercepter les clics sur les boutons enfants (✕, pastilles couleur, etc.)
    const target = e.target as HTMLElement
    if (target.closest('button, a, input, select, textarea, [role="button"]')) return
    e.preventDefault()
    e.stopPropagation()
    setSelected(true)
    dragRef.current = { startX: e.clientX, startY: e.clientY, origX: pos.x, origY: pos.y }
    containerRef.current?.setPointerCapture(e.pointerId)
  }

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!dragRef.current || !onLayoutChange) return
    const dx = e.clientX - dragRef.current.startX
    const dy = e.clientY - dragRef.current.startY
    onLayoutChange({ ...layout, [id]: { ...pos, x: dragRef.current.origX + dx, y: dragRef.current.origY + dy } })
  }

  const handlePointerUp = () => { dragRef.current = null }

  const update = (patch: Partial<LayoutEntry>) => {
    onLayoutChange?.({ ...layout, [id]: { ...pos, ...patch } })
  }

  const customColor = pos.color || ''
  const customFont = pos.fontFamily || ''

  return (
    <div
      ref={containerRef}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      className={`drag-el-${id}`}
      style={{
        transform: `translate(${pos.x}px, ${pos.y}px) scale(${pos.scale})`,
        cursor: editable ? 'grab' : 'default',
        position: 'relative',
        outline: editable && selected ? '1.5px dashed rgba(201,168,76,0.5)' : editable ? '1px dashed rgba(201,168,76,0.15)' : 'none',
        outlineOffset: 6,
        borderRadius: 4,
        touchAction: editable ? 'none' : 'auto',
        userSelect: editable ? 'none' : 'auto',
      } as React.CSSProperties}
    >
      {(customColor || customFont) && (
        <style>{`
          .drag-el-${id}, .drag-el-${id} * {
            ${customColor ? `color: ${customColor} !important;` : ''}
            ${customFont ? `font-family: ${customFont} !important;` : ''}
          }
        `}</style>
      )}
      {editable && selected && (
        <div ref={toolbarRef} style={{ position: 'absolute', top: -28, left: '50%', transform: 'translateX(-50%)', display: 'flex', gap: 3, zIndex: 20, background: 'white', borderRadius: 8, padding: '3px 5px', boxShadow: '0 2px 12px rgba(0,0,0,0.15)', border: '1px solid #e0d5c8' }}>
          <button type="button" onClick={() => update({ scale: Math.max(0.4, pos.scale - 0.1) })} style={{ ...BTN, width: 20, height: 20, borderRadius: 4, border: 'none', background: '#f5f0e8', color: '#C9A84C', fontSize: 13, fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 0 }}>−</button>
          <div style={{ fontSize: 8, color: '#8a7e72', display: 'flex', alignItems: 'center', padding: '0 3px', fontWeight: 600 }}>{Math.round(pos.scale * 100)}%</div>
          <button type="button" onClick={() => update({ scale: Math.min(2.5, pos.scale + 0.1) })} style={{ ...BTN, width: 20, height: 20, borderRadius: 4, border: 'none', background: '#f5f0e8', color: '#C9A84C', fontSize: 13, fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 0 }}>+</button>
          <div style={{ width: 1, background: '#e0d5c8', margin: '2px 2px' }} />
          <button type="button" onClick={() => setShowPanel(p => !p)} style={{ ...BTN, width: 20, height: 20, borderRadius: 4, border: 'none', background: showPanel ? '#C9A84C' : '#f5f0e8', color: showPanel ? 'white' : '#C9A84C', fontSize: 11, fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 0 }}>🎨</button>
        </div>
      )}
      {editable && selected && showPanel && (
        <div ref={panelRef} style={{ position: 'absolute', bottom: '100%', left: '50%', transform: 'translateX(-50%)', marginBottom: 8, zIndex: 30, background: 'white', borderRadius: 10, padding: '10px 12px', boxShadow: '0 4px 20px rgba(0,0,0,0.18)', border: '1px solid #e0d5c8', minWidth: 220, maxWidth: 280 }}>
          <div style={{ fontSize: 9, color: '#8a7e72', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 6 }}>Couleur</div>
          <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap', marginBottom: 8 }}>
            {DRAG_COLORS.map(c => (
              <button key={c || 'def'} type="button" onClick={() => update({ color: c })} style={{
                ...BTN, width: 18, height: 18, borderRadius: '50%', padding: 0,
                background: c || 'linear-gradient(135deg, #ccc 25%, #fff 25%, #fff 50%, #ccc 50%, #ccc 75%, #fff 75%)',
                backgroundSize: c ? undefined : '6px 6px',
                border: (pos.color ?? '') === c ? '2px solid #C9A84C' : '1px solid #d6d1cb',
                boxShadow: (pos.color ?? '') === c ? '0 0 0 1px #C9A84C' : 'none',
              }} />
            ))}
          </div>
          <div style={{ fontSize: 9, color: '#8a7e72', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 4 }}>Police</div>
          <div style={{ display: 'flex', gap: 3, flexWrap: 'wrap' }}>
            {DRAG_FONTS.map(f => (
              <button key={f.value || 'def'} type="button" onClick={() => update({ fontFamily: f.value })} style={{
                ...BTN, padding: '3px 8px', borderRadius: 6, fontSize: 9, fontWeight: (pos.fontFamily ?? '') === f.value ? 700 : 400,
                border: `1px solid ${(pos.fontFamily ?? '') === f.value ? '#C9A84C' : '#e0d5c8'}`,
                background: (pos.fontFamily ?? '') === f.value ? '#faf5ea' : 'white',
                color: (pos.fontFamily ?? '') === f.value ? '#C9A84C' : '#3a3330',
                fontFamily: f.value || 'inherit',
              }}>{f.label}</button>
            ))}
          </div>
        </div>
      )}
      {children}
    </div>
  )
}

const S: Record<string, React.CSSProperties> = {
  input: {
    width: '100%', border: '1px solid #e0d5c8', borderRadius: 8, padding: '12px 15px',
    background: '#fffdf9', fontSize: 14, outline: 'none', color: '#2c2622', boxSizing: 'border-box',
    transition: 'border-color 0.2s', textTransform: 'capitalize',
  },
  label: {
    display: 'block', fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.14em',
    color: '#b09a7c', marginBottom: 7, fontWeight: 700,
  },
}

function Label({ children }: { children: React.ReactNode }) {
  return <label style={S.label}>{children}</label>
}

function Field({ label, value, onChange, placeholder, type = 'text', autoCapitalize: shouldCapitalize = false }: {
  label: string; value: string; onChange: (v: string) => void; placeholder?: string; type?: string; autoCapitalize?: boolean
}) {
  return (
    <div style={{ marginBottom: 16 }}>
      <Label>{label}</Label>
      <input
        type={type} value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder} style={S.input}
        onBlur={shouldCapitalize ? () => { const tc = toTitleCase(value); if (tc !== value) onChange(tc) } : undefined}
      />
    </div>
  )
}

function ProgressBar({ step }: { step: number }) {
  const { t } = useT()
  const steps = [t.fairepart.step1Title, t.fairepart.step2Title, t.fairepart.step3Title, t.fairepart.step4Title]
  return (
    <div style={{ marginBottom: 36 }}>
      <div style={{ position: 'relative', display: 'flex', alignItems: 'center', marginBottom: 12 }}>
        <div style={{ position: 'absolute', left: 0, right: 0, height: 2, background: '#e8e4df', borderRadius: 1 }} />
        <div style={{
          position: 'absolute', left: 0, height: 2, borderRadius: 1,
          background: '#C9A84C',
          width: `${((step - 1) / (steps.length - 1)) * 100}%`,
          transition: 'width 0.5s ease',
        }} />
        <div style={{ position: 'relative', display: 'flex', justifyContent: 'space-between', width: '100%' }}>
          {steps.map((_, i) => (
            <div key={i} style={{
              width: 10, height: 10, borderRadius: '50%',
              border: `2px solid ${i + 1 <= step ? '#C9A84C' : '#d1ccc6'}`,
              background: i + 1 < step ? '#C9A84C' : i + 1 === step ? '#fff' : '#f5f3f0',
              boxShadow: i + 1 === step ? '0 0 0 4px rgba(201,168,76,0.12)' : 'none',
              transition: 'all 0.3s',
            }} />
          ))}
        </div>
      </div>
      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
        {steps.map((label, i) => (
          <span key={i} style={{
            flex: 1, textAlign: 'center', fontSize: 9.5, fontWeight: 600,
            letterSpacing: '0.1em', textTransform: 'uppercase',
            color: i + 1 === step ? '#C9A84C' : i + 1 < step ? '#b0a48a' : '#c5bfb8',
          }}>{label}</span>
        ))}
      </div>
    </div>
  )
}

const HEBREW_ROWS = [
  ['ק', 'ר', 'א', 'ט', 'ו', 'ן', 'ם', 'פ'],
  ['ש', 'ד', 'ג', 'כ', 'ע', 'י', 'ח', 'ל'],
  ['ז', 'ס', 'ב', 'ה', 'נ', 'מ', 'צ', 'ת'],
]
const HEBREW_NIQQUD = ['ָ', 'ַ', 'ִ', 'ֵ', 'ֶ', 'ֹ', 'ּ', 'ְ']

function HebrewKeyboard({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  const [open, setOpen] = useState(false)
  const addChar = (ch: string) => onChange(value + ch)
  const backspace = () => onChange(value.slice(0, -1))

  if (!open) return (
    <button type="button" onClick={() => setOpen(true)} style={{ ...BTN, background: 'none', border: 'none', fontSize: 11, color: '#C9A84C', textDecoration: 'underline', marginTop: 4, padding: 0 }}>
      Ouvrir le clavier hébreu
    </button>
  )

  const keyStyle: React.CSSProperties = {
    ...BTN, minWidth: 32, height: 36, borderRadius: 6, border: '1px solid #e0d5c8',
    background: 'white', fontFamily: 'var(--font-bellefair), serif', fontSize: 18,
    color: '#3a3330', display: 'flex', alignItems: 'center', justifyContent: 'center',
    boxShadow: '0 1px 2px rgba(0,0,0,0.06)', padding: '0 4px',
  }
  const niqqudStyle: React.CSSProperties = {
    ...keyStyle, minWidth: 28, height: 30, fontSize: 20, color: '#C9A84C', border: '1px solid #f0e8d8',
  }

  return (
    <div style={{ marginTop: 8, padding: 12, background: '#f8f4ee', borderRadius: 12, border: '1px solid #e8e0d4' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
        <span style={{ fontSize: 11, color: '#8a7e72', fontWeight: 600 }}>Clavier hébreu</span>
        <button type="button" onClick={() => setOpen(false)} style={{ ...BTN, background: 'none', border: 'none', fontSize: 14, color: '#9ca3af', padding: 0 }}>✕</button>
      </div>
      {HEBREW_ROWS.map((row, ri) => (
        <div key={ri} style={{ display: 'flex', gap: 4, justifyContent: 'center', marginBottom: 4 }}>
          {row.map(ch => (
            <button key={ch} type="button" onClick={() => addChar(ch)} style={keyStyle}>{ch}</button>
          ))}
        </div>
      ))}
      <div style={{ display: 'flex', gap: 4, justifyContent: 'center', marginTop: 4, marginBottom: 4 }}>
        {HEBREW_NIQQUD.map(ch => (
          <button key={ch} type="button" onClick={() => addChar(ch)} style={niqqudStyle}>{'א' + ch}</button>
        ))}
      </div>
      <div style={{ display: 'flex', gap: 6, justifyContent: 'center', marginTop: 6 }}>
        <button type="button" onClick={() => addChar(' ')} style={{ ...keyStyle, flex: 1, fontSize: 11, color: '#9ca3af' }}>Espace</button>
        <button type="button" onClick={backspace} style={{ ...keyStyle, minWidth: 60, fontSize: 13, color: '#dc2626' }}>← Effacer</button>
      </div>
    </div>
  )
}

function Step1({ data, onChange }: { data: FormData; onChange: (d: Partial<FormData>) => void }) {
  const { t } = useT()
  return (
    <div>
      <h2 style={{ textAlign: 'center', fontSize: 22, fontWeight: 600, color: '#3a3330', marginBottom: 24 }}>{t.fairepart.step1Title}</h2>

      {/* Mariage juif + Email — EN PREMIER */}
      <div style={{ display: 'flex', gap: 12, marginBottom: 20 }}>
        <label style={{ flex: 1, display: 'flex', alignItems: 'center', gap: 10, padding: 14, border: '1px solid #e0d5c8', borderRadius: 10, cursor: 'pointer', fontSize: 14, color: '#3a3330', background: data.mariageJuif ? '#fdf8f0' : 'white' }}>
          <input type="checkbox" checked={data.mariageJuif} onChange={e => onChange({ mariageJuif: e.target.checked })} />
          {t.fairepart.jewishWedding}
        </label>
      </div>
      <div style={{ marginBottom: 20 }}>
        <Label>{t.fairepart.emailSectionTitle}</Label>
        <p style={{ fontSize: 11, color: '#9ca3af', marginBottom: 6 }}>{t.fairepart.emailSectionHelp}</p>
        <input type="email" value={data.emailMaries ?? ''} onChange={e => onChange({ emailMaries: e.target.value })} placeholder="email-marie1@exemple.com" style={{ ...S.input, marginBottom: 8 }} />
        <input type="email" value={data.emailMaries2 ?? ''} onChange={e => onChange({ emailMaries2: e.target.value })} placeholder="email-marie2@exemple.com (optionnel)" style={S.input} />
      </div>

      {/* Marié·e 1 */}
      <div style={{ background: '#fdf8f0', borderRadius: 12, padding: 20, marginBottom: 16 }}>
        <div style={{ fontSize: 11, color: '#C9A84C', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 12 }}>{t.fairepart.person1}</div>
        <div style={{ display: 'flex', gap: 12 }}>
          <Field label={t.fairepart.firstName} value={data.marie1Prenom} onChange={v => onChange({ marie1Prenom: v })} placeholder={t.fairepart.placeholderFirstName1} autoCapitalize />
          <Field label={t.fairepart.lastName} value={data.marie1Nom} onChange={v => onChange({ marie1Nom: v })} placeholder={t.fairepart.placeholderLastName1} autoCapitalize />
        </div>
        {data.mariageJuif ? (
          <div style={{ marginTop: 8 }}>
            <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#3a3330', marginBottom: 4 }}>{t.fairepart.hebrewFirstName}</label>
            <input dir="rtl" lang="he" value={data.marie1PrenomHebreu ?? ''} onChange={e => onChange({ marie1PrenomHebreu: e.target.value })} placeholder="שרה"
              style={{ ...S.input, fontFamily: 'var(--font-bellefair), serif', fontSize: 18, textAlign: 'right' }} />
            <HebrewKeyboard value={data.marie1PrenomHebreu ?? ''} onChange={v => onChange({ marie1PrenomHebreu: v })} />
          </div>
        ) : (
          <Field label={t.fairepart.secondName} value={data.marie1Prenom2} onChange={v => onChange({ marie1Prenom2: v })} placeholder="" />
        )}
      </div>

      {/* & separator */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, margin: '16px 0' }}>
        <div style={{ flex: 1, height: 1, background: '#e0d5c8' }} />
        <span style={{ color: '#C9A84C', fontSize: 20 }}>&</span>
        <div style={{ flex: 1, height: 1, background: '#e0d5c8' }} />
      </div>

      {/* Marié·e 2 */}
      <div style={{ background: '#fdf8f0', borderRadius: 12, padding: 20 }}>
        <div style={{ fontSize: 11, color: '#C9A84C', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 12 }}>{t.fairepart.person2}</div>
        <div style={{ display: 'flex', gap: 12 }}>
          <Field label={t.fairepart.firstName} value={data.marie2Prenom} onChange={v => onChange({ marie2Prenom: v })} placeholder={t.fairepart.placeholderFirstName2} autoCapitalize />
          <Field label={t.fairepart.lastName} value={data.marie2Nom} onChange={v => onChange({ marie2Nom: v })} placeholder={t.fairepart.placeholderLastName2} autoCapitalize />
        </div>
        {data.mariageJuif ? (
          <div style={{ marginTop: 8 }}>
            <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#3a3330', marginBottom: 4 }}>{t.fairepart.hebrewFirstName}</label>
            <input dir="rtl" lang="he" value={data.marie2PrenomHebreu ?? ''} onChange={e => onChange({ marie2PrenomHebreu: e.target.value })} placeholder="דוד"
              style={{ ...S.input, fontFamily: 'var(--font-bellefair), serif', fontSize: 18, textAlign: 'right' }} />
            <HebrewKeyboard value={data.marie2PrenomHebreu ?? ''} onChange={v => onChange({ marie2PrenomHebreu: v })} />
          </div>
        ) : (
          <Field label={t.fairepart.secondName} value={data.marie2Prenom2} onChange={v => onChange({ marie2Prenom2: v })} placeholder="" />
        )}
      </div>

      {/* Custom link */}
      <div style={{ marginTop: 20, padding: 16, background: '#fdf8f0', borderRadius: 12 }}>
        <Label>{t.fairepart.customLink} (optionnel)</Label>
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
  const { t } = useT()
  return (
    <div style={{ marginBottom: 14 }}>
      <Label>{label}</Label>
      <div style={{ fontSize: 10, color: '#C9A84C99', marginTop: -6, marginBottom: 6 }}>{t.fairepart.gpHelp}</div>
      <div style={{ display: 'flex', gap: 6, marginBottom: 6 }}>
        <input type="text" value={data[perePrenom] as string} placeholder={t.fairepart.placeholderGpFirstName} onChange={e => onChange({ [perePrenom]: e.target.value } as Partial<FormData>)} style={{ ...S.input, flex: 1, fontSize: 11 }} />
        <input type="text" value={data[pereNom] as string} placeholder={t.fairepart.placeholderGpLastName} onChange={e => onChange({ [pereNom]: e.target.value } as Partial<FormData>)} style={{ ...S.input, flex: 1, fontSize: 11 }} />
      </div>
      <div style={{ display: 'flex', gap: 6 }}>
        <input type="text" value={data[merePrenom] as string} placeholder={t.fairepart.placeholderGmFirstName} onChange={e => onChange({ [merePrenom]: e.target.value } as Partial<FormData>)} style={{ ...S.input, flex: 1, fontSize: 11 }} />
        <input type="text" value={data[mereNom] as string} placeholder={t.fairepart.placeholderGmLastName} onChange={e => onChange({ [mereNom]: e.target.value } as Partial<FormData>)} style={{ ...S.input, flex: 1, fontSize: 11 }} />
      </div>
    </div>
  )
}

function Step2({ data, onChange }: { data: FormData; onChange: (d: Partial<FormData>) => void }) {
  const { t } = useT()
  const cols: Array<{ title: string; gps: GpGroupDef[]; pereKey: keyof FormData; pereNomKey: keyof FormData; mereKey: keyof FormData; mereNomKey: keyof FormData }> = [
    {
      title: data.marie1Prenom || t.fairepart.person1,
      gps: [
        { label: t.fairepart.gpPaternal, perePrenom: 'famille1GpPaPerePrenom', pereNom: 'famille1GpPaPereNom', merePrenom: 'famille1GpPaMerePrenom', mereNom: 'famille1GpPaMereNom' },
        { label: t.fairepart.gpMaternal, perePrenom: 'famille1GpMaPerePrenom', pereNom: 'famille1GpMaPereNom', merePrenom: 'famille1GpMaMerePrenom', mereNom: 'famille1GpMaMereNom' },
      ],
      pereKey: 'famille1PerePrenom', pereNomKey: 'famille1PereNom', mereKey: 'famille1MerePrenom', mereNomKey: 'famille1MereNom',
    },
    {
      title: data.marie2Prenom || t.fairepart.person2,
      gps: [
        { label: t.fairepart.gpPaternal, perePrenom: 'famille2GpPaPerePrenom', pereNom: 'famille2GpPaPereNom', merePrenom: 'famille2GpPaMerePrenom', mereNom: 'famille2GpPaMereNom' },
        { label: t.fairepart.gpMaternal, perePrenom: 'famille2GpMaPerePrenom', pereNom: 'famille2GpMaPereNom', merePrenom: 'famille2GpMaMerePrenom', mereNom: 'famille2GpMaMereNom' },
      ],
      pereKey: 'famille2PerePrenom', pereNomKey: 'famille2PereNom', mereKey: 'famille2MerePrenom', mereNomKey: 'famille2MereNom',
    },
  ]
  return (
    <div>
      <h2 style={{ textAlign: 'center', fontSize: 22, fontWeight: 600, color: '#3a3330', marginBottom: 24 }}>{t.fairepart.step2Title}</h2>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
        {cols.map((col, ci) => (
          <div key={ci}>
            <div style={{ fontSize: 11, color: '#C9A84C', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', textAlign: 'center', marginBottom: 12 }}>{col.title}</div>
            {col.gps.map(g => (
              <GpGroupFields key={g.label + ci} {...g} data={data} onChange={onChange} />
            ))}
            <div style={{ marginBottom: 14 }}>
              <Label>{t.fairepart.fatherLabel}</Label>
              <div style={{ display: 'flex', gap: 6 }}>
                <input type="text" value={data[col.pereKey] as string} placeholder={t.fairepart.firstName} onChange={e => onChange({ [col.pereKey]: e.target.value } as Partial<FormData>)} onBlur={() => { const v = data[col.pereKey] as string; const tc = toTitleCase(v); if (tc !== v) onChange({ [col.pereKey]: tc } as Partial<FormData>) }} style={{ ...S.input, flex: 1 }} />
                <input type="text" value={data[col.pereNomKey] as string} placeholder={t.fairepart.lastName} onChange={e => onChange({ [col.pereNomKey]: e.target.value } as Partial<FormData>)} onBlur={() => { const v = data[col.pereNomKey] as string; const tc = toTitleCase(v); if (tc !== v) onChange({ [col.pereNomKey]: tc } as Partial<FormData>) }} style={{ ...S.input, flex: 1 }} />
              </div>
            </div>
            <div style={{ marginBottom: 14 }}>
              <Label>{t.fairepart.motherLabel}</Label>
              <div style={{ display: 'flex', gap: 6 }}>
                <input type="text" value={data[col.mereKey] as string} placeholder={t.fairepart.firstName} onChange={e => onChange({ [col.mereKey]: e.target.value } as Partial<FormData>)} onBlur={() => { const v = data[col.mereKey] as string; const tc = toTitleCase(v); if (tc !== v) onChange({ [col.mereKey]: tc } as Partial<FormData>) }} style={{ ...S.input, flex: 1 }} />
                <input type="text" value={data[col.mereNomKey] as string} placeholder={t.fairepart.lastName} onChange={e => onChange({ [col.mereNomKey]: e.target.value } as Partial<FormData>)} onBlur={() => { const v = data[col.mereNomKey] as string; const tc = toTitleCase(v); if (tc !== v) onChange({ [col.mereNomKey]: tc } as Partial<FormData>) }} style={{ ...S.input, flex: 1 }} />
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
  const { t } = useT()
  const selected = data.illustrationCoupleId
  return (
    <div style={{ marginBottom: 16 }}>
      <div style={{ fontFamily: 'var(--font-cormorant-garamond)', fontStyle: 'italic', fontSize: 15, color: '#3a3330', marginBottom: 12 }}>
        🎨 {t.fairepart.illustrationLabel}
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
                border: isSel ? '2.5px solid #c48b9f' : '1px solid #e0d5c8',
                borderRadius: 10,
                background: isSel ? '#faf5ea' : 'white',
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
        {t.fairepart.illustrationReplacesMonogram}
      </div>
    </div>
  )
}

// ── StyleAccueilSelector : photo / monogramme / illustration ──────────────────

function StyleAccueilSelector({ data, onChange }: { data: FormData; onChange: (d: Partial<FormData>) => void }) {
  const { t } = useT()
  const style = data.styleAccueil || 'photo'
  const options: Array<{ id: string; label: string; emoji: string }> = [
    { id: 'photo', label: 'Photos', emoji: '📸' },
    { id: 'illustration', label: 'Illustration', emoji: '🎨' },
  ]
  return (
    <div style={{ marginBottom: 16 }}>
      <div style={{ fontFamily: 'var(--font-cormorant-garamond)', fontStyle: 'italic', fontSize: 15, color: '#3a3330', marginBottom: 12 }}>
        {t.fairepart.accueilStyleLabel}
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 8, marginBottom: 12 }}>
        {options.map(opt => {
          const isSel = style === opt.id
          return (
            <button
              key={opt.id}
              type="button"
              onClick={() => onChange({ styleAccueil: opt.id as FormData['styleAccueil'] })}
              style={{
                ...BTN,
                padding: '14px 8px',
                border: isSel ? '2.5px solid #c48b9f' : '1px solid #e0d5c8',
                borderRadius: 10,
                background: isSel ? '#faf5ea' : 'white',
                fontSize: 13,
                fontWeight: isSel ? 700 : 400,
                color: '#3a3330',
              }}
            >
              <div style={{ fontSize: 22, marginBottom: 4 }}>{opt.emoji}</div>
              {opt.label}
            </button>
          )
        })}
      </div>
      {style === 'illustration' && <IllustrationCoupleSelector data={data} onChange={onChange} />}
      {style === 'video' && (
        <div>
          <div style={{ fontSize: 11, color: '#9a928a', marginBottom: 10 }}>
            Choisissez un fond animé pour votre page d&apos;accueil
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8 }}>
            {VIDEO_BACKGROUNDS.map(v => {
              const sel = data.videoAccueilId === v.id
              return (
                <button key={v.id} type="button" onClick={() => onChange({ videoAccueilId: v.id, styleAccueil: 'video' })} style={{
                  ...BTN, padding: 4, borderRadius: 10, overflow: 'hidden',
                  border: `2px solid ${sel ? '#C9A84C' : '#e0d5c8'}`,
                  background: sel ? '#faf5ea' : '#fffdf9',
                  display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4,
                }}>
                  <video src={v.url} muted playsInline autoPlay loop style={{ width: '100%', aspectRatio: '3/4', objectFit: 'cover', borderRadius: 6 }} />
                  <span style={{ fontSize: 8, color: sel ? '#C9A84C' : '#3a3330', fontWeight: sel ? 700 : 400, padding: '0 2px 2px', textAlign: 'center', lineHeight: 1.2 }}>{v.label.replace(/^.+?\s/, '')}</span>
                </button>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}
// ── PhotoSection : upload + recadrage interactif ──────────────────────────────

function PhotoSection({ data, onChange }: { data: FormData; onChange: (d: Partial<FormData>) => void }) {
  const { t } = useT()
  const [cropIdx, setCropIdx] = useState<number | null>(null)
  const [uploading, setUploading] = useState(false)
  const [dragIdx, setDragIdx] = useState<number | null>(null)
  const [dragOverIdx, setDragOverIdx] = useState<number | null>(null)
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
        const res = await fetch('/api/upload', { method: 'POST', body: fd })
        const json = await res.json()
        if (json.url) uploaded.push(json.url)
      }
      const newPhotos = [...photos, ...uploaded].slice(0, 5)
      const newData = [...photosData, ...uploaded.map(url => ({ url, cropX: 0, cropY: 0, cropScale: 1, faceCropUrl: undefined }))].slice(0, 5)
      onChange({ photosFond: newPhotos, photoFond: newPhotos[0] ?? '', photosData: newData, presentationStyle: 'page-unique' })
      setCropIdx(photos.length)
      // Pré-générer les face crops en arrière-plan (0 transformation côté visiteur)
      const pregenData = [...newData]
      let pregenCount = 0
      for (let idx = 0; idx < uploaded.length; idx++) {
        const photoIdx = photos.length + idx
        fetch('/api/pregenerate-photo', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ photoUrl: uploaded[idx] }),
        })
          .then(r => r.json())
          .then(d => {
            if (d.url && pregenData[photoIdx]) {
              pregenData[photoIdx] = { ...pregenData[photoIdx], faceCropUrl: d.url }
              pregenCount++
              if (pregenCount === uploaded.length) {
                onChange({ photosData: pregenData })
              }
            }
          })
          .catch(() => {})
      }
    } catch {
      showToast(t.fairepart.errorUploadPhoto, 'error')
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

  const movePhoto = (idx: number, dir: -1 | 1) => {
    const target = idx + dir
    if (target < 0 || target >= photos.length) return
    const newPhotos = [...photos]
    const newData = [...photosData]
    ;[newPhotos[idx], newPhotos[target]] = [newPhotos[target], newPhotos[idx]]
    ;[newData[idx], newData[target]] = [newData[target], newData[idx]]
    onChange({ photosFond: newPhotos, photoFond: newPhotos[0] ?? '', photosData: newData })
    if (cropIdx === idx) setCropIdx(target)
    else if (cropIdx === target) setCropIdx(idx)
  }

  const handleDrop = (targetIdx: number) => {
    if (dragIdx === null || dragIdx === targetIdx) return
    const newPhotos = [...photos]
    const newData = [...photosData]
    const [movedPhoto] = newPhotos.splice(dragIdx, 1)
    const [movedData] = newData.splice(dragIdx, 1)
    newPhotos.splice(targetIdx, 0, movedPhoto)
    newData.splice(targetIdx, 0, movedData)
    onChange({ photosFond: newPhotos, photoFond: newPhotos[0] ?? '', photosData: newData })
    if (cropIdx === dragIdx) setCropIdx(targetIdx)
    else if (cropIdx !== null) {
      if (dragIdx < cropIdx && targetIdx >= cropIdx) setCropIdx(cropIdx - 1)
      else if (dragIdx > cropIdx && targetIdx <= cropIdx) setCropIdx(cropIdx + 1)
    }
    setDragIdx(null)
    setDragOverIdx(null)
  }

  return (
    <div>
      <Label>{t.fairepart.photoSectionTitle}</Label>
      <p style={{ fontSize: 11, color: '#9ca3af', marginBottom: 8 }}>{t.fairepart.photoSectionHelp}</p>

      {photos.length < 5 && (
        <label style={{ display: 'block', cursor: uploading ? 'wait' : 'pointer', marginBottom: photos.length > 0 ? 12 : 0 }}>
          <div style={{ border: '2px dashed #e0d5c8', borderRadius: 10, padding: 16, textAlign: 'center', background: uploading ? '#faf5ea' : 'white' }}>
            <div style={{ fontSize: 22, marginBottom: 4 }}>{uploading ? '⏳' : '📷'}</div>
            <p style={{ fontSize: 13, color: '#3a3330', margin: 0 }}>{uploading ? t.fairepart.photoUploading : t.fairepart.photoClickToAdd}</p>
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
              const isDragOver = dragOverIdx === idx && dragIdx !== idx
              return (
                <div key={idx}
                  draggable
                  onDragStart={() => setDragIdx(idx)}
                  onDragOver={e => { e.preventDefault(); setDragOverIdx(idx) }}
                  onDragLeave={() => { if (dragOverIdx === idx) setDragOverIdx(null) }}
                  onDrop={e => { e.preventDefault(); handleDrop(idx) }}
                  onDragEnd={() => { setDragIdx(null); setDragOverIdx(null) }}
                  style={{ cursor: 'grab', opacity: dragIdx === idx ? 0.4 : 1, transition: 'opacity 0.15s, transform 0.15s', transform: isDragOver ? 'scale(1.05)' : 'scale(1)' }}
                >
                  <div style={{ position: 'relative', width: 80, height: 80, borderRadius: 8, overflow: 'hidden', border: isDragOver ? '2px solid #C9A84C' : isCropping ? '2px solid #C9A84C' : '2px solid transparent' }}>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={photo} alt="" style={{ position: 'absolute', top: '50%', left: '50%', transform: crop ? `translate(calc(-50% + ${crop.cropX}px), calc(-50% + ${crop.cropY}px)) scale(${crop.cropScale})` : 'translate(-50%, -50%)', transformOrigin: 'center center', minWidth: '100%', minHeight: '100%', width: 'auto', height: 'auto' }} />
                    <div style={{ position: 'absolute', bottom: 2, left: 2, background: 'rgba(0,0,0,0.55)', color: 'white', fontSize: 8, borderRadius: 3, padding: '1px 4px' }}>Photo {idx + 1}</div>
                    <button type="button" onClick={() => handleDelete(idx)} style={{ ...BTN, position: 'absolute', top: 2, right: 2, background: 'white', border: 'none', borderRadius: '50%', width: 16, height: 16, fontSize: 9, color: '#d45050', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 0 }}>✕</button>
                  </div>
                  <div style={{ display: 'flex', gap: 2, marginTop: 4 }}>
                    {idx > 0 && (
                      <button type="button" onClick={() => movePhoto(idx, -1)} style={{ ...BTN, flex: '0 0 20px', padding: '4px 0', borderRadius: 6, border: '1px solid #e0d5c8', background: 'white', color: '#3a3330', fontSize: 10 }}>←</button>
                    )}
                    <button type="button" onClick={() => setCropIdx(isCropping ? null : idx)} style={{ ...BTN, flex: 1, padding: '4px 0', borderRadius: 6, border: `1px solid ${isCropping ? '#C9A84C' : '#e0d5c8'}`, background: isCropping ? '#faf5ea' : 'white', color: isCropping ? '#C9A84C' : '#3a3330', fontSize: 9, fontWeight: isCropping ? 700 : 400 }}>
                      {isCropping ? t.fairepart.photoCropClose : t.fairepart.photoCropBtn}
                    </button>
                    {idx < photos.length - 1 && (
                      <button type="button" onClick={() => movePhoto(idx, 1)} style={{ ...BTN, flex: '0 0 20px', padding: '4px 0', borderRadius: 6, border: '1px solid #e0d5c8', background: 'white', color: '#3a3330', fontSize: 10 }}>→</button>
                    )}
                  </div>
                </div>
              )
            })}
          </div>

          {cropIdx !== null && photos[cropIdx] && (
            <div style={{ background: '#fdf8f0', borderRadius: 12, padding: 16, marginBottom: 12, border: '1.5px solid #e0d5c8' }}>
              <div style={{ fontSize: 12, color: '#C9A84C', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 12 }}>{t.fairepart.photoCropTitle} {cropIdx + 1}</div>
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
  const { t } = useT()
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
      <p style={{ fontSize: 12, color: '#9ca3af', marginBottom: 8 }}>{t.fairepart.cropDragHelp}</p>
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
        {scale < 0.8 ? t.fairepart.cropDezoom : scale > 1.2 ? t.fairepart.cropZoom : t.fairepart.cropNormal}
      </div>
      <div style={{ display: 'flex', gap: 8, justifyContent: 'center' }}>
        <button type="button" onClick={() => { setPos({ x: 0, y: 0 }); setScale(1); onPreview?.({ x: 0, y: 0, scale: 1 }) }} style={{ ...BTN, padding: '8px 16px', borderRadius: 20, border: '1px solid #C9A84C', background: 'transparent', color: '#C9A84C', fontSize: 12 }}>{t.fairepart.cropReset}</button>
        <button type="button" onClick={() => onCrop({ x: pos.x, y: pos.y, scale })} style={{ ...BTN, padding: '8px 16px', borderRadius: 20, background: '#C9A84C', color: 'white', border: 'none', fontSize: 12, fontWeight: 500 }}>{t.fairepart.cropValidate}</button>
      </div>
    </div>
  )
}

function Step3({ data, onChange }: { data: FormData; onChange: (d: Partial<FormData>) => void }) {
  const { t, locale } = useT()
  const update = (i: number, u: Partial<Ceremony>) =>
    onChange({ ceremonies: data.ceremonies.map((c, idx) => idx === i ? { ...c, ...u } : c) })
  const add = () => data.ceremonies.length < 6 && onChange({ ceremonies: [...data.ceremonies, { ...defaultCeremony, type: 'Soirée' }] })
  const remove = (i: number) => onChange({ ceremonies: data.ceremonies.filter((_, idx) => idx !== i) })

  return (
    <div>
      <h2 style={{ textAlign: 'center', fontSize: 22, fontWeight: 600, color: '#3a3330', marginBottom: 24 }}>{t.fairepart.step3Title}</h2>
      {data.ceremonies.map((c, i) => (
        <div key={i} style={{ background: '#fdf8f0', borderRadius: 12, padding: 20, marginBottom: 16 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
            <span style={{ fontSize: 11, color: '#C9A84C', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em' }}>Événement {i + 1}</span>
            {data.ceremonies.length > 1 && (
              <button type="button" onClick={() => remove(i)} style={{ ...BTN, background: 'none', border: 'none', color: '#d45050', fontSize: 12 }}>{t.fairepart.removeCeremony}</button>
            )}
          </div>
          <Label>Type</Label>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 16 }}>
            {CEREMONY_TYPES.map(ct => (
              <button key={ct} type="button" onClick={() => update(i, { type: ct })} style={{
                ...BTN,
                padding: '6px 14px', borderRadius: 9999, fontSize: 12,
                border: '1px solid #C9A84C',
                background: c.type === ct ? '#C9A84C' : 'transparent',
                color: c.type === ct ? 'white' : '#C9A84C',
              }}>{t.fairepart.ceremonyTypes[ct] || ct}</button>
            ))}
          </div>
          {c.type === 'Autre' && <Field label={t.fairepart.customEventName} value={c.customName} onChange={v => update(i, { customName: v })} />}
          <Field label={t.fairepart.venue} value={c.lieu} onChange={v => update(i, { lieu: v })} placeholder={t.fairepart.placeholderVenue} autoCapitalize />
          <Field label={t.fairepart.address} value={c.adresse} onChange={v => update(i, { adresse: v })} autoCapitalize />
          <div style={{ display: 'flex', gap: 12 }}>
            <Field label={t.fairepart.date} value={c.date} onChange={v => update(i, { date: v })} type="date" />
            <Field label={t.fairepart.time} value={c.heure} onChange={v => update(i, { heure: v })} type="time" />
          </div>
          <div>
              <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer', fontSize: 13, color: '#3a3330' }}>
                <input type="checkbox" checked={c.suiviDAutre} onChange={e => update(i, { suiviDAutre: e.target.checked })} />
                {t.fairepart.afterEvent}
              </label>
              {c.suiviDAutre && (
                <div style={{ marginTop: 10 }}>
                  <Field label={t.fairepart.afterEventName} value={c.evenementSuivantNom} onChange={v => update(i, { evenementSuivantNom: v })} placeholder={t.fairepart.afterEventPlaceholder} />
                  <Field label={t.fairepart.afterEventAddress} value={c.evenementSuivantAdresse} onChange={v => update(i, { evenementSuivantAdresse: v })} />
                </div>
              )}
          </div>
          <div style={{ marginTop: 4 }}>
            <Label>{t.fairepart.eventNoteLabel}</Label>
            <textarea value={c.note} onChange={e => update(i, { note: e.target.value })}
              placeholder={t.fairepart.eventNotePlaceholder}
              rows={2} style={{ ...S.input, resize: 'vertical', minHeight: 56, fontFamily: 'inherit', fontSize: 13 }} />
          </div>

          {/* ── Infos transport / hébergement (optionnel) ── */}
          <div style={{ marginTop: 16, paddingTop: 16, borderTop: '1px dashed #e0d5c8' }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer', fontSize: 13, color: '#3a3330' }}>
              <input
                type="checkbox"
                checked={c.infosTransportActif}
                onChange={e => update(i, { infosTransportActif: e.target.checked })}
              />
              {`➕ ${t.fairepart.transportToggle}`}
            </label>
            {c.infosTransportActif && (
              <div style={{ marginTop: 12 }}>
                <Label>{`🚌 ${t.fairepart.transportLabel}`}</Label>
                <textarea
                  value={c.transport}
                  onChange={e => update(i, { transport: e.target.value })}
                  placeholder={t.fairepart.transportPlaceholder}
                  rows={3}
                  style={{ ...S.input, resize: 'vertical', minHeight: 70, fontFamily: 'inherit', fontSize: 13, marginBottom: 12 }}
                />
                <Label>{`🏨 ${t.fairepart.accommodationLabel}`}</Label>
                <textarea
                  value={c.hebergement}
                  onChange={e => update(i, { hebergement: e.target.value })}
                  placeholder={t.fairepart.accommodationPlaceholder}
                  rows={3}
                  style={{ ...S.input, resize: 'vertical', minHeight: 70, fontFamily: 'inherit', fontSize: 13 }}
                />
                <p style={{ fontSize: 10, color: '#9ca3af', marginTop: 4 }}>
                  {locale === 'en'
                    ? 'Tip: write [Hotel Name](https://link) to make "Hotel Name" clickable. Or just paste a URL.'
                    : 'Astuce : écrivez [Nom de l\'hôtel](https://lien) pour rendre "Nom de l\'hôtel" cliquable. Ou collez simplement un lien.'}
                </p>
              </div>
            )}
          </div>

          {/* ── Photo du lieu (illustration sous le titre) ── */}
          <div style={{ marginTop: 16, paddingTop: 16, borderTop: '1px dashed #e0d5c8' }}>
            <Label>Photo du lieu (s&apos;affiche comme illustration)</Label>
            {c.ceremonyImage ? (
              <div style={{ position: 'relative', marginBottom: 8 }}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={c.ceremonyImage} alt="" style={{ width: '100%', height: 120, objectFit: 'cover', borderRadius: 8 }} />
                <button type="button" onClick={() => update(i, { ceremonyImage: '' })} style={{ ...BTN, position: 'absolute', top: 4, right: 4, width: 22, height: 22, borderRadius: '50%', background: '#d45050', color: 'white', border: 'none', fontSize: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 0 }}>✕</button>
              </div>
            ) : (
              <label style={{ display: 'block', padding: '14px', border: '2px dashed #C9A84C44', borderRadius: 10, textAlign: 'center', cursor: 'pointer', color: '#C9A84C', fontSize: 12, fontWeight: 600 }}>
                + Ajouter une photo du lieu
                <input type="file" accept="image/*" hidden onChange={async e => {
                  const file = e.target.files?.[0]
                  if (!file) return
                  if (file.size > 5 * 1024 * 1024) { showToast('Fichier trop volumineux (max 5 Mo)', 'error'); return }
                  try {
                    const fd = new (globalThis.FormData)()
                    fd.append('file', file)
                    const res = await fetch('/api/upload', { method: 'POST', body: fd })
                    const json = await res.json()
                    if (json.url) update(i, { ceremonyImage: json.url, illustrationUrl: '' })
                  } catch { showToast('Erreur upload', 'error') }
                }} />
              </label>
            )}
          </div>

          {/* ── Shabbat Hatan multi-jours ── */}
          {c.type === 'Shabbat Hatan' && (
            <div style={{ marginTop: 16, paddingTop: 16, borderTop: '1px dashed #e0d5c8' }}>
              <Label>Moments du Shabbat</Label>
              <p style={{ fontSize: 11, color: '#9ca3af', marginBottom: 10 }}>Ajoutez les différents moments (Vendredi soir, Samedi midi, etc.)</p>
              {(c.multiJours ?? []).map((moment, mi) => (
                <div key={moment.id} style={{ background: 'white', borderRadius: 10, padding: 12, marginBottom: 8, border: '1px solid #e0d5c8' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                    <span style={{ fontSize: 12, fontWeight: 700, color: '#C9A84C' }}>{moment.label}</span>
                    <div style={{ display: 'flex', gap: 4 }}>
                      {mi > 0 && <button type="button" onClick={() => {
                        const mj = [...(c.multiJours ?? [])]
                        ;[mj[mi - 1], mj[mi]] = [mj[mi], mj[mi - 1]]
                        update(i, { multiJours: mj })
                      }} style={{ ...BTN, background: 'none', border: '1px solid #e0d5c8', borderRadius: 6, padding: '2px 6px', fontSize: 11 }}>↑</button>}
                      {mi < (c.multiJours ?? []).length - 1 && <button type="button" onClick={() => {
                        const mj = [...(c.multiJours ?? [])]
                        ;[mj[mi], mj[mi + 1]] = [mj[mi + 1], mj[mi]]
                        update(i, { multiJours: mj })
                      }} style={{ ...BTN, background: 'none', border: '1px solid #e0d5c8', borderRadius: 6, padding: '2px 6px', fontSize: 11 }}>↓</button>}
                      <button type="button" onClick={() => {
                        update(i, { multiJours: (c.multiJours ?? []).filter((_, j) => j !== mi) })
                      }} style={{ ...BTN, background: 'none', border: 'none', color: '#d45050', fontSize: 11 }}>✕</button>
                    </div>
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                    <div><Label>Heure</Label><input type="time" value={moment.heure ?? ''} onChange={e => { const mj = [...(c.multiJours ?? [])]; mj[mi] = { ...mj[mi], heure: e.target.value }; update(i, { multiJours: mj }) }} style={S.input} /></div>
                    <div><Label>Lieu</Label><input type="text" value={moment.lieu ?? ''} onChange={e => { const mj = [...(c.multiJours ?? [])]; mj[mi] = { ...mj[mi], lieu: e.target.value }; update(i, { multiJours: mj }) }} style={S.input} placeholder="Nom du lieu" /></div>
                  </div>
                  <div style={{ marginTop: 8 }}><Label>Adresse</Label><input type="text" value={moment.adresse ?? ''} onChange={e => { const mj = [...(c.multiJours ?? [])]; mj[mi] = { ...mj[mi], adresse: e.target.value }; update(i, { multiJours: mj }) }} style={S.input} placeholder="Adresse complète" /></div>
                  <div style={{ marginTop: 8 }}><Label>Note</Label><input type="text" value={moment.note ?? ''} onChange={e => { const mj = [...(c.multiJours ?? [])]; mj[mi] = { ...mj[mi], note: e.target.value }; update(i, { multiJours: mj }) }} style={S.input} placeholder="Info complémentaire (optionnel)" /></div>
                </div>
              ))}
              <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                {['Vendredi soir', 'Samedi midi', 'Samedi soir', 'Personnalisé'].map(label => (
                  <button key={label} type="button" onClick={() => {
                    const newMoment: ShabbatMoment = { id: `sm-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`, label, heure: '', lieu: '', adresse: '', note: '' }
                    update(i, { multiJours: [...(c.multiJours ?? []), newMoment] })
                  }} style={{ ...BTN, padding: '6px 12px', borderRadius: 9999, border: '1px dashed #C9A84C', background: 'transparent', color: '#C9A84C', fontSize: 11, fontWeight: 600 }}>+ {label}</button>
                ))}
              </div>
            </div>
          )}

          {/* ── Pensées pour les défunts (Houppa uniquement) ── */}
          {c.type === 'Cérémonie religieuse / Houppa' && (
            <div style={{ marginTop: 16, paddingTop: 16, borderTop: '1px dashed #e0d5c8' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer', fontSize: 13, color: '#3a3330' }}>
                <input
                  type="checkbox"
                  checked={c.penseesDefuntsActif}
                  onChange={e => update(i, { penseesDefuntsActif: e.target.checked })}
                />
                {`🕯 ${t.fairepart.memorialToggle}`}
              </label>
              {c.penseesDefuntsActif && (
                <div style={{ marginTop: 14 }}>
                  <Label>{t.fairepart.introPhrase}</Label>
                  <select
                    value={c.penseesDefuntsIntro}
                    onChange={e => update(i, { penseesDefuntsIntro: e.target.value })}
                    style={{ ...S.input, marginBottom: 8 }}
                  >
                    {t.fairepart.memorialOptions.slice(0, 4).map(opt => (
                      <option key={opt} value={opt}>{opt}</option>
                    ))}
                    <option value="">—</option>
                  </select>
                  <input
                    type="text"
                    value={c.penseesDefuntsIntro}
                    onChange={e => update(i, { penseesDefuntsIntro: e.target.value })}
                    placeholder={t.fairepart.memorialCustomPlaceholder}
                    style={{ ...S.input, marginBottom: 14, fontSize: 13 }}
                  />

                  <Label>{t.fairepart.memorialNames}</Label>
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
                        placeholder={t.fairepart.memorialNamePlaceholder}
                        style={{ ...S.input, flex: 1, fontSize: 13 }}
                      />
                      <button
                        type="button"
                        onClick={() => {
                          const newNoms = c.penseesDefuntsNoms.filter((_, j) => j !== nomIdx)
                          update(i, { penseesDefuntsNoms: newNoms })
                        }}
                        style={{ ...BTN, padding: '0 12px', borderRadius: 8, border: '1px solid #e0d5c8', background: 'white', cursor: 'pointer', fontSize: 14 }}
                        title={t.fairepart.memorialDeleteName}
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
                    {t.fairepart.memorialAddName}
                  </button>

                  <Label>{t.fairepart.memorialEnd}</Label>
                  <select
                    value={c.penseesDefuntsFin}
                    onChange={e => update(i, { penseesDefuntsFin: e.target.value })}
                    style={{ ...S.input, marginBottom: 8 }}
                  >
                    <option value="">—</option>
                    {t.fairepart.memorialOptions.slice(4).map(opt => (
                      <option key={opt} value={opt}>{opt}</option>
                    ))}
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
        }}>{`+ ${t.fairepart.addCeremony}`}</button>
      )}

      {/* ── Pages supplémentaires ── */}
      <div style={{ marginTop: 24, borderTop: '1px solid #e8d5c8', paddingTop: 20 }}>
        <h3 style={{ fontSize: 15, fontWeight: 700, color: '#3a3330', marginBottom: 12 }}>Pages supplémentaires</h3>
        <p style={{ fontSize: 11, color: '#9ca3af', marginBottom: 16 }}>Ajoutez des pages libres entre vos événements (photos, textes, etc.)</p>
        {(data.customPages ?? []).map((page, pi) => (
          <div key={page.id} style={{ background: '#FAF6F0', borderRadius: 12, padding: 16, marginBottom: 12, border: '1px solid #E8D5D8' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
              <span style={{ fontSize: 11, color: '#8B3A52', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em' }}>Page {pi + 1}</span>
              <div style={{ display: 'flex', gap: 4 }}>
                {pi > 0 && <button type="button" onClick={() => {
                  const pages = [...(data.customPages ?? [])]
                  ;[pages[pi - 1], pages[pi]] = [pages[pi], pages[pi - 1]]
                  onChange({ customPages: pages })
                }} style={{ ...BTN, background: 'none', border: '1px solid #E8D5D8', borderRadius: 6, padding: '2px 8px', fontSize: 12, color: '#3D2B1F' }}>↑</button>}
                {pi < (data.customPages ?? []).length - 1 && <button type="button" onClick={() => {
                  const pages = [...(data.customPages ?? [])]
                  ;[pages[pi], pages[pi + 1]] = [pages[pi + 1], pages[pi]]
                  onChange({ customPages: pages })
                }} style={{ ...BTN, background: 'none', border: '1px solid #E8D5D8', borderRadius: 6, padding: '2px 8px', fontSize: 12, color: '#3D2B1F' }}>↓</button>}
                <button type="button" onClick={() => {
                  if (!confirm('Supprimer cette page ?')) return
                  onChange({ customPages: (data.customPages ?? []).filter((_, j) => j !== pi) })
                }} style={{ ...BTN, background: 'none', border: 'none', color: '#d45050', fontSize: 12 }}>Supprimer</button>
              </div>
            </div>
            {/* Position : avant quel événement */}
            <Label>Afficher avant l&apos;événement</Label>
            <select value={page.position} onChange={e => {
              const pages = [...(data.customPages ?? [])]
              pages[pi] = { ...pages[pi], position: Number(e.target.value) }
              onChange({ customPages: pages })
            }} style={{ ...S.input, marginBottom: 12 }}>
              {data.ceremonies.map((c, ci) => (
                <option key={ci} value={ci}>{c.type === 'Autre' ? (c.customName || 'Événement') : c.type}</option>
              ))}
            </select>
            {/* Texte */}
            <Label>Texte (optionnel)</Label>
            <textarea value={page.texte ?? ''} onChange={e => {
              const pages = [...(data.customPages ?? [])]
              pages[pi] = { ...pages[pi], texte: e.target.value }
              onChange({ customPages: pages })
            }} placeholder="Texte libre..." style={{ ...S.input, minHeight: 60, resize: 'vertical', marginBottom: 12 }} />
            {/* Upload images */}
            <Label>Images</Label>
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 8 }}>
              {page.images.map((img, ii) => (
                <div key={ii} style={{ position: 'relative', width: 70, height: 70, borderRadius: 8, overflow: 'hidden', border: '1px solid #E8D5D8' }}>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={img.url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  <button type="button" onClick={() => {
                    const pages = [...(data.customPages ?? [])]
                    pages[pi] = { ...pages[pi], images: pages[pi].images.filter((_, j) => j !== ii) }
                    onChange({ customPages: pages })
                  }} style={{ ...BTN, position: 'absolute', top: 2, right: 2, width: 18, height: 18, borderRadius: '50%', background: '#d45050', color: 'white', border: 'none', fontSize: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 0 }}>✕</button>
                </div>
              ))}
              <label style={{ width: 70, height: 70, borderRadius: 8, border: '2px dashed #C9A84C', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', fontSize: 24, color: '#C9A84C' }}>
                +
                <input type="file" accept="image/*" multiple hidden onChange={async e => {
                  const files = Array.from(e.target.files ?? [])
                  const newImages: CustomPageImage[] = []
                  for (const file of files) {
                    if (file.size > 5 * 1024 * 1024) { showToast('Fichier trop volumineux (max 5 Mo)', 'error'); continue }
                    try {
                      const fd = new (globalThis.FormData)()
                      fd.append('file', file)
                      const res = await fetch('/api/upload', { method: 'POST', body: fd })
                      const json = await res.json()
                      if (json.url) newImages.push({ url: json.url })
                    } catch { showToast('Erreur upload image', 'error') }
                  }
                  if (newImages.length > 0) {
                    const pages = [...(data.customPages ?? [])]
                    pages[pi] = { ...pages[pi], images: [...pages[pi].images, ...newImages] }
                    onChange({ customPages: pages })
                  }
                }} />
              </label>
            </div>
            {/* Mode affichage */}
            {page.images.length > 1 && (
              <div style={{ display: 'flex', gap: 8, marginBottom: 8 }}>
                {(['carousel', 'statique'] as const).map(mode => (
                  <button key={mode} type="button" onClick={() => {
                    const pages = [...(data.customPages ?? [])]
                    pages[pi] = { ...pages[pi], imagesMode: mode }
                    onChange({ customPages: pages })
                  }} style={{
                    ...BTN, flex: 1, padding: '8px', borderRadius: 8, fontSize: 12,
                    border: `1.5px solid ${page.imagesMode === mode ? '#C9A84C' : '#E8D5D8'}`,
                    background: page.imagesMode === mode ? '#C9A84C10' : 'white',
                    color: page.imagesMode === mode ? '#C9A84C' : '#3D2B1F', fontWeight: page.imagesMode === mode ? 700 : 400,
                  }}>{mode === 'carousel' ? 'Carrousel' : 'Statique'}</button>
                ))}
              </div>
            )}
          </div>
        ))}
        <button type="button" onClick={() => {
          const newPage: CustomPage = {
            id: `page-${Date.now()}`,
            texte: '',
            images: [],
            imagesMode: 'carousel',
            position: 0, // Par défaut avant le 1er événement
          }
          onChange({ customPages: [...(data.customPages ?? []), newPage] })
        }} style={{
          ...BTN, width: '100%', padding: 12, border: '2px dashed #8B3A52', borderRadius: 10,
          background: 'transparent', color: '#8B3A52', fontSize: 13, fontWeight: 600,
        }}>+ Ajouter une page</button>
      </div>
    </div>
  )
}

function CustomLogoUpload({ logoUrl, logoOriginalUrl, logoSize = 100, logoColor = '', onChange, accent }: { logoUrl?: string; logoOriginalUrl?: string; logoSize?: number; logoColor?: string; onChange: (d: Partial<FormData>) => void; accent: string }) {
  const { t } = useT()
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

  // Pré-générer le logo transformé (bg removal + couleur) côté serveur
  const pregenerateLogo = async (originalUrl: string, color: string) => {
    try {
      const res = await fetch('/api/pregenerate-logo', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ logoUrl: originalUrl, color }),
      })
      const d = await res.json()
      return d.url || null
    } catch { return null }
  }

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    if (file.size > 5 * 1024 * 1024) { showToast(t.fairepart.errorFileTooLarge, 'error'); return }
    setUploading(true)
    try {
      // 1. Upload le fichier sur Vercel Blob
      const fd = new (globalThis.FormData)()
      fd.append('file', file)
      const res = await fetch('/api/upload', { method: 'POST', body: fd })
      const json = await res.json()
      if (json.url) {
        const uploadedUrl = json.url
        // 2. Stocker l'URL brute pour référence ET pré-générer avec bg removal
        const pregenUrl = await pregenerateLogo(uploadedUrl, logoColor)
        onChange({ customLogoUrl: pregenUrl || uploadedUrl, customLogoOriginalUrl: uploadedUrl })
      }
    } catch { showToast(t.fairepart.errorUploadLogo, 'error') }
    finally { setUploading(false) }
    e.target.value = ''
  }

  if (logoUrl) {
    const LOGO_COLORS = [
      { value: '', label: 'Original', swatch: '' },
      ...COLOR_OPTIONS.filter(c => c.value !== '').map(c => ({ value: c.value, label: c.label, swatch: c.swatch })),
    ]
    const previewSize = Math.min(220, 140 * (logoSize / 100))
    // Le logo est déjà pré-généré (bg removal + couleur) — utiliser directement
    const imgSrc = logoUrl!
    return (
      <div style={{ textAlign: 'center' }}>
        {/* Preview — pas de cadre, fond propre */}
        <div style={{ marginBottom: 16 }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={imgSrc} alt="Logo" style={{ width: previewSize, height: previewSize, objectFit: 'contain', display: 'inline-block' }} />
        </div>

        {/* Couleurs — directement visibles, changement en direct */}
        <div style={{ marginBottom: 14 }}>
          <div style={{ display: 'flex', gap: 5, flexWrap: 'wrap', justifyContent: 'center' }}>
            {LOGO_COLORS.map(opt => {
              const sel = logoColor === opt.value
              return (
                <button key={opt.label} type="button" onClick={async () => {
                  onChange({ customLogoColor: opt.value })
                  // Pré-générer le logo avec la nouvelle couleur (depuis l'original)
                  const srcUrl = logoOriginalUrl || (logoUrl?.includes('cloudinary.com') ? logoUrl : null)
                  if (srcUrl) {
                    const pregenUrl = await pregenerateLogo(srcUrl, opt.value)
                    if (pregenUrl) onChange({ customLogoUrl: pregenUrl })
                  }
                }} style={{
                  cursor: 'pointer', padding: 0, borderRadius: 9999, border: 'none', background: 'none',
                }}>
                  {opt.swatch ? (
                    <div style={{ width: 26, height: 26, borderRadius: '50%', background: opt.swatch, border: sel ? `3px solid ${accent}` : '2px solid #e0d5c8', boxShadow: sel ? `0 0 0 2px white, 0 0 0 4px ${accent}` : 'none', transition: 'all 0.15s' }} />
                  ) : (
                    <div style={{ width: 26, height: 26, borderRadius: '50%', background: 'conic-gradient(#f87171, #facc15, #34d399, #60a5fa, #a78bfa, #f87171)', border: sel ? `3px solid ${accent}` : '2px solid #e0d5c8', boxShadow: sel ? `0 0 0 2px white, 0 0 0 4px ${accent}` : 'none', transition: 'all 0.15s' }} />
                  )}
                </button>
              )
            })}
          </div>
        </div>

        {/* Taille */}
        <div style={{ marginBottom: 14, padding: '0 20px' }}>
          <input type="range" min={50} max={250} step={5} value={logoSize} onChange={e => onChange({ customLogoSize: Number(e.target.value) })} style={{ width: '100%', accentColor: accent }} />
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 10, color: '#9ca3af', marginTop: 2 }}>
            <span>Petit</span><span>{logoSize}%</span><span>Grand</span>
          </div>
        </div>

        <button type="button" onClick={() => onChange({ customLogoUrl: '', customLogoSize: 100, customLogoColor: '' })} style={{ cursor: 'pointer', background: 'transparent', border: `1px solid #e0d5c8`, borderRadius: 9999, padding: '6px 16px', fontSize: 11, color: '#d45050', fontWeight: 600 }}>
          {t.fairepart.logoDelete}
        </button>
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
        <span>{uploading ? t.fairepart.logoUploading : t.fairepart.logoUpload}</span>
        <input type="file" accept="image/png,image/jpg,image/jpeg" onChange={handleLogoUpload} style={{ display: 'none' }} disabled={uploading} />
      </label>
      <p style={{ fontSize: 10, color: '#9ca3af', marginTop: 8, fontStyle: 'italic', lineHeight: 1.5 }}>
        PNG ou JPG, max 5 Mo — le fond sera automatiquement supprimé.<br />
        Pour un meilleur rendu, choisissez un logo simple et élégant, idéalement en noir, doré, ou couleur unie.
      </p>
    </div>
  )
}

function AccordionSection({ title, defaultOpen = false, children }: { title: string; defaultOpen?: boolean; children: React.ReactNode }) {
  const [open, setOpen] = useState(defaultOpen)
  return (
    <div style={{ marginBottom: 14, border: '1px solid #e8ddd0', borderRadius: 12, overflow: 'hidden', background: '#fffdf9' }}>
      <button type="button" onClick={() => setOpen(!open)} style={{
        ...BTN, width: '100%', padding: '16px 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        background: open ? '#faf5ea' : '#fffdf9', border: 'none', borderBottom: open ? '1px solid #efe5d8' : 'none',
        transition: 'background 0.2s',
      }}>
        <span style={{ fontFamily: 'var(--font-playfair-display)', fontSize: 14, fontWeight: 600, color: '#3a3028', letterSpacing: '0.02em' }}>{title}</span>
        <span style={{ fontSize: 16, color: '#C9A84C', fontWeight: 300, transition: 'transform 0.25s', transform: open ? 'rotate(45deg)' : 'rotate(0)' }}>+</span>
      </button>
      {open && <div style={{ padding: '20px 20px 16px' }}>{children}</div>}
    </div>
  )
}

function Step4({ data, onChange, pack = 'essentiel' }: { data: FormData; onChange: (d: Partial<FormData>) => void; pack?: 'essentiel' | 'premium' }) {
  const { t, locale } = useT()
  const selectedLuxeColor = LUXE_COLORS.find(c => c.id === data.luxeColor) || LUXE_COLORS[0]
  const accent = THEMES[data.style].accent
  const [customDesignUploading, setCustomDesignUploading] = useState(false)
  const [customCoverUploading, setCustomCoverUploading] = useState(false)
  const [customCoverVideoUploading, setCustomCoverVideoUploading] = useState(false)

  const uploadToCloudinary = async (file: File): Promise<string | null> => {
    const fd = new window.FormData()
    fd.append('file', file)
    try {
      const res = await fetch('/api/upload', { method: 'POST', body: fd })
      const json = await res.json()
      return json.url || null
    } catch {
      return null
    }
  }

  const handleCustomCoverUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setCustomCoverUploading(true)
    const url = await uploadToCloudinary(file)
    if (url) onChange({ customDesignCoverUrl: url })
    else showToast('Erreur lors de l\'upload', 'error')
    setCustomCoverUploading(false)
    e.target.value = ''
  }

  const handleCustomCoverVideoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    if (file.size > 50 * 1024 * 1024) {
      showToast(locale === 'en' ? 'Video must be under 50MB' : 'La vidéo doit faire moins de 50 Mo', 'error')
      return
    }
    setCustomCoverVideoUploading(true)
    const fd = new window.FormData()
    fd.append('file', file)
    try {
      const res = await fetch('/api/upload', { method: 'POST', body: fd })
      const json = await res.json()
      if (json.url) onChange({ customDesignCoverVideoUrl: json.url })
      else showToast('Erreur lors de l\'upload vidéo', 'error')
    } catch {
      showToast('Erreur lors de l\'upload vidéo', 'error')
    }
    setCustomCoverVideoUploading(false)
    e.target.value = ''
  }

  const handleCustomPagesUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (!files?.length) return
    setCustomDesignUploading(true)
    const urls: string[] = []
    for (let i = 0; i < files.length; i++) {
      const url = await uploadToCloudinary(files[i])
      if (url) urls.push(url)
    }
    if (urls.length) {
      onChange({ customDesignPages: [...(data.customDesignPages ?? []), ...urls] })
    } else {
      showToast('Erreur lors de l\'upload', 'error')
    }
    setCustomDesignUploading(false)
    e.target.value = ''
  }

  const removeCustomPage = (idx: number) => {
    const pages = [...(data.customDesignPages ?? [])]
    pages.splice(idx, 1)
    onChange({ customDesignPages: pages })
  }

  return (
    <div>
      <h2 style={{ textAlign: 'center', fontFamily: 'var(--font-playfair-display)', fontSize: 20, fontWeight: 600, color: '#3a3330', marginBottom: 6 }}>{t.fairepart.step4Title}</h2>
      <p style={{ textAlign: 'center', fontFamily: 'var(--font-cormorant-garamond)', fontStyle: 'italic', fontSize: 14, color: '#9a928a', marginBottom: 24 }}>
        {locale === 'en' ? 'Design your invitation' : 'Définissez le design de votre invitation'}
      </p>

      {/* ── 0. Mode Design Custom (Canva / Etsy) ── */}
      <AccordionSection title="📱 Mon design (Canva / Etsy)">
        <div style={{ marginBottom: 16 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}>
            <button type="button" onClick={() => onChange({ customDesignMode: !data.customDesignMode })} style={{
              ...BTN, width: 44, height: 24, borderRadius: 12, border: 'none', padding: 0, position: 'relative',
              background: data.customDesignMode ? accent : '#d1d5db', transition: 'background 0.2s',
            }}>
              <span style={{
                position: 'absolute', top: 2, left: data.customDesignMode ? 22 : 2,
                width: 20, height: 20, borderRadius: '50%', background: 'white',
                transition: 'left 0.2s', boxShadow: '0 1px 3px rgba(0,0,0,0.2)',
              }} />
            </button>
            <span style={{ fontFamily: 'var(--font-cormorant-garamond)', fontSize: 14, color: '#3a3330', fontWeight: 600 }}>
              {locale === 'en' ? 'Use my custom design' : 'Utiliser mon propre design'}
            </span>
          </div>
          <p style={{ fontSize: 11, color: '#9a928a', lineHeight: 1.5, marginBottom: 4 }}>
            {locale === 'en'
              ? 'Upload your wedding card images from Canva, Etsy or any design tool. Your pages will be displayed as-is with the opening animation, music and RSVP.'
              : 'Uploadez vos images de faire-part depuis Canva, Etsy ou tout outil de design. Vos pages seront affichées telles quelles avec l\'animation d\'ouverture, la musique et le RSVP.'}
          </p>
        </div>

        {data.customDesignMode && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            {/* Couverture */}
            <div>
              <Label>{locale === 'en' ? 'Cover image (the 1st page)' : 'Image de couverture (la 1ère page)'}</Label>
              {data.customDesignCoverUrl ? (
                <div style={{ position: 'relative', display: 'inline-block', marginBottom: 8 }}>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={data.customDesignCoverUrl} alt="" style={{ width: 120, height: 160, objectFit: 'cover', borderRadius: 8, border: `2px solid ${accent}30` }} />
                  <button type="button" onClick={() => onChange({ customDesignCoverUrl: undefined })} style={{
                    ...BTN, position: 'absolute', top: -6, right: -6, width: 22, height: 22, borderRadius: '50%',
                    background: '#ef4444', color: 'white', border: 'none', fontSize: 12, fontWeight: 700,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                  }}>x</button>
                </div>
              ) : (
                <label style={{
                  ...BTN, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                  padding: '14px 20px', borderRadius: 10, border: `2px dashed ${accent}40`,
                  background: `${accent}08`, color: accent, fontSize: 13, fontWeight: 600,
                  fontFamily: 'var(--font-cormorant-garamond)',
                }}>
                  <span>{customCoverUploading ? (locale === 'en' ? 'Uploading...' : 'Upload en cours...') : (locale === 'en' ? '+ Upload cover' : '+ Uploader la couverture')}</span>
                  <input type="file" accept="image/*" onChange={handleCustomCoverUpload} style={{ display: 'none' }} disabled={customCoverUploading} />
                </label>
              )}
            </div>

            {/* Vidéo d'ouverture (enveloppe animée Canva/Etsy) */}
            <div>
              <Label>{locale === 'en' ? 'Opening video (envelope animation)' : 'Vidéo d\'ouverture (animation enveloppe)'}</Label>
              <p style={{ fontSize: 11, color: '#9a928a', lineHeight: 1.5, marginBottom: 8 }}>
                {locale === 'en'
                  ? 'Upload a video (MP4, max 50MB) — e.g. an animated envelope from Canva/Etsy. It will play as intro before revealing your invitation.'
                  : 'Uploadez une vidéo (MP4, max 50 Mo) — ex : une enveloppe animée Canva/Etsy. Elle sera jouée en intro avant de révéler votre faire-part.'}
              </p>
              {data.customDesignCoverVideoUrl ? (
                <div style={{ position: 'relative', display: 'inline-block', marginBottom: 8 }}>
                  <video src={data.customDesignCoverVideoUrl} style={{ width: 120, height: 213, objectFit: 'cover', borderRadius: 8, border: `2px solid ${accent}30` }} muted playsInline />
                  <button type="button" onClick={() => onChange({ customDesignCoverVideoUrl: undefined })} style={{
                    ...BTN, position: 'absolute', top: -6, right: -6, width: 22, height: 22, borderRadius: '50%',
                    background: '#ef4444', color: 'white', border: 'none', fontSize: 12, fontWeight: 700,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                  }}>x</button>
                </div>
              ) : (
                <label style={{
                  ...BTN, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                  padding: '14px 20px', borderRadius: 10, border: `2px dashed ${accent}40`,
                  background: `${accent}08`, color: accent, fontSize: 13, fontWeight: 600,
                  fontFamily: 'var(--font-cormorant-garamond)',
                }}>
                  <span>{customCoverVideoUploading ? (locale === 'en' ? 'Uploading video...' : 'Upload vidéo en cours...') : (locale === 'en' ? '+ Upload opening video' : '+ Uploader la vidéo d\'ouverture')}</span>
                  <input type="file" accept="video/mp4,video/quicktime,video/webm" onChange={handleCustomCoverVideoUpload} style={{ display: 'none' }} disabled={customCoverVideoUploading} />
                </label>
              )}
            </div>

            {/* ── Personnalisation texte overlay (après la vidéo) ── */}
            {data.customDesignCoverVideoUrl && (
              <div style={{ background: `${accent}06`, borderRadius: 12, padding: 16, border: `1px solid ${accent}15` }}>
                <Label>{locale === 'en' ? 'Text displayed after the video' : 'Texte affiché après la vidéo'}</Label>
                <p style={{ fontSize: 11, color: '#9a928a', lineHeight: 1.5, marginBottom: 12 }}>
                  {locale === 'en'
                    ? 'Customize the elegant screen that appears after your envelope opens.'
                    : 'Personnalisez l\'écran élégant qui apparaît après l\'ouverture de l\'enveloppe.'}
                </p>

                <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                  {/* Ligne 1 — Prénoms */}
                  <div>
                    <label style={{ fontSize: 11, color: '#6b6560', fontWeight: 600, marginBottom: 4, display: 'block' }}>
                      {locale === 'en' ? 'Line 1 (names)' : 'Ligne 1 (prénoms)'}
                    </label>
                    <input
                      type="text"
                      value={data.videoOverlayText1 ?? ''}
                      placeholder={`${data.marie1Prenom || 'Prénom'} & ${data.marie2Prenom || 'Prénom'}`}
                      onChange={e => onChange({ videoOverlayText1: e.target.value || undefined })}
                      style={{ width: '100%', padding: '10px 12px', borderRadius: 8, border: '1px solid #e0dbd6', fontSize: 14, fontFamily: 'var(--font-cormorant-garamond)', boxSizing: 'border-box' }}
                    />
                  </div>

                  {/* Ligne 2 */}
                  <div>
                    <label style={{ fontSize: 11, color: '#6b6560', fontWeight: 600, marginBottom: 4, display: 'block' }}>
                      {locale === 'en' ? 'Line 2' : 'Ligne 2'}
                    </label>
                    <input
                      type="text"
                      value={data.videoOverlayText2 ?? ''}
                      placeholder="ont le plaisir de vous convier"
                      onChange={e => onChange({ videoOverlayText2: e.target.value || undefined })}
                      style={{ width: '100%', padding: '10px 12px', borderRadius: 8, border: '1px solid #e0dbd6', fontSize: 14, fontFamily: 'var(--font-cormorant-garamond)', boxSizing: 'border-box' }}
                    />
                  </div>

                  {/* Ligne 3 */}
                  <div>
                    <label style={{ fontSize: 11, color: '#6b6560', fontWeight: 600, marginBottom: 4, display: 'block' }}>
                      {locale === 'en' ? 'Line 3' : 'Ligne 3'}
                    </label>
                    <input
                      type="text"
                      value={data.videoOverlayText3 ?? ''}
                      placeholder="à leur mariage"
                      onChange={e => onChange({ videoOverlayText3: e.target.value || undefined })}
                      style={{ width: '100%', padding: '10px 12px', borderRadius: 8, border: '1px solid #e0dbd6', fontSize: 14, fontFamily: 'var(--font-cormorant-garamond)', boxSizing: 'border-box' }}
                    />
                  </div>

                  {/* בס״ד toggle */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <button type="button" onClick={() => onChange({ videoOverlayShowBsd: !(data.videoOverlayShowBsd !== false) })} style={{
                      ...BTN, width: 38, height: 20, borderRadius: 10, border: 'none', padding: 0, position: 'relative',
                      background: (data.videoOverlayShowBsd !== false) ? accent : '#d1d5db', transition: 'background 0.2s',
                    }}>
                      <span style={{
                        position: 'absolute', top: 2, left: (data.videoOverlayShowBsd !== false) ? 20 : 2,
                        width: 16, height: 16, borderRadius: '50%', background: 'white',
                        transition: 'left 0.2s', boxShadow: '0 1px 3px rgba(0,0,0,0.2)',
                      }} />
                    </button>
                    <span style={{ fontSize: 13, color: '#3a3330' }}>בס״ד</span>
                  </div>

                  {/* Couleurs */}
                  <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
                    <div>
                      <label style={{ fontSize: 11, color: '#6b6560', fontWeight: 600, marginBottom: 4, display: 'block' }}>
                        {locale === 'en' ? 'Text color' : 'Couleur du texte'}
                      </label>
                      <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                        {[
                          { id: '#1B2A4A', label: 'Bleu marine' },
                          { id: '#C4784A', label: 'Terracotta' },
                          { id: '#3a3330', label: 'Brun' },
                          { id: '#2D4A3E', label: 'Vert sauge' },
                          { id: '#8B6F47', label: 'Doré' },
                          { id: '#FFFFFF', label: 'Blanc' },
                        ].map(c => (
                          <button key={c.id} type="button" title={c.label} onClick={() => onChange({ videoOverlayTextColor: c.id })} style={{
                            ...BTN, width: 28, height: 28, borderRadius: '50%', border: (data.videoOverlayTextColor || '#1B2A4A') === c.id ? `3px solid ${accent}` : '2px solid #e0dbd6',
                            background: c.id, boxShadow: c.id === '#FFFFFF' ? 'inset 0 0 0 1px #ccc' : undefined,
                          }} />
                        ))}
                      </div>
                    </div>
                    <div>
                      <label style={{ fontSize: 11, color: '#6b6560', fontWeight: 600, marginBottom: 4, display: 'block' }}>
                        {locale === 'en' ? 'Background color' : 'Couleur de fond'}
                      </label>
                      <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                        {[
                          { id: '#F5F0EB', label: 'Ivoire' },
                          { id: '#1B2A4A', label: 'Bleu marine' },
                          { id: '#2D4A3E', label: 'Vert sauge' },
                          { id: '#3a3330', label: 'Brun' },
                          { id: '#F8F4F0', label: 'Crème' },
                          { id: '#000000', label: 'Noir' },
                        ].map(c => (
                          <button key={c.id} type="button" title={c.label} onClick={() => onChange({ videoOverlayBgColor: c.id })} style={{
                            ...BTN, width: 28, height: 28, borderRadius: '50%', border: (data.videoOverlayBgColor || '#F5F0EB') === c.id ? `3px solid ${accent}` : '2px solid #e0dbd6',
                            background: c.id,
                          }} />
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Pages de contenu */}
            <div>
              <Label>{locale === 'en' ? 'Content pages' : 'Pages de contenu'}</Label>
              {(data.customDesignPages ?? []).length > 0 && (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8, marginBottom: 12 }}>
                  {(data.customDesignPages ?? []).map((url, idx) => (
                    <div key={idx} style={{ position: 'relative' }}>
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={url} alt={`Page ${idx + 1}`} style={{ width: '100%', aspectRatio: '3/4', objectFit: 'cover', borderRadius: 8, border: `1px solid ${accent}20` }} />
                      <button type="button" onClick={() => removeCustomPage(idx)} style={{
                        ...BTN, position: 'absolute', top: -6, right: -6, width: 20, height: 20, borderRadius: '50%',
                        background: '#ef4444', color: 'white', border: 'none', fontSize: 10, fontWeight: 700,
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                      }}>x</button>
                      <div style={{ textAlign: 'center', fontSize: 9, color: '#9a928a', marginTop: 2 }}>Page {idx + 1}</div>
                    </div>
                  ))}
                </div>
              )}
              <label style={{
                ...BTN, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                padding: '14px 20px', borderRadius: 10, border: `2px dashed ${accent}40`,
                background: `${accent}08`, color: accent, fontSize: 13, fontWeight: 600,
                fontFamily: 'var(--font-cormorant-garamond)',
              }}>
                <span>{customDesignUploading ? (locale === 'en' ? 'Uploading...' : 'Upload en cours...') : (locale === 'en' ? '+ Add pages' : '+ Ajouter des pages')}</span>
                <input type="file" accept="image/*" multiple onChange={handleCustomPagesUpload} style={{ display: 'none' }} disabled={customDesignUploading} />
              </label>
              <p style={{ fontSize: 10, color: '#9a928a', marginTop: 8, fontStyle: 'italic', lineHeight: 1.5 }}>
                {locale === 'en'
                  ? 'Upload multiple images at once. They will appear in the order you uploaded them.'
                  : 'Uploadez plusieurs images en une fois. Elles apparaîtront dans l\'ordre d\'upload.'}
              </p>
            </div>
          </div>
        )}
      </AccordionSection>

      {/* ── 1. Thème & couleurs ── */}
      <AccordionSection title={locale === 'en' ? '🎨 Theme & colors' : '🎨 Thème & couleurs'} defaultOpen>
        <Label>{locale === 'en' ? 'Visual style' : 'Style visuel'}</Label>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: 6, marginBottom: 16 }}>
          {(Object.entries(THEMES) as [Theme, ThemeObj][]).map(([key, t]) => {
            const sel = data.style === key
            return (
              <button key={key} type="button" onClick={() => onChange({ style: key })} style={{
                ...BTN, padding: 0, borderRadius: 8, overflow: 'hidden',
                border: `2px solid ${sel ? t.accent : '#e8e0d8'}`,
                background: 'transparent', textAlign: 'center',
                boxShadow: sel ? `0 0 0 1px ${t.accent}` : 'none',
              }}>
                <div style={{ background: t.fond, width: '100%', height: 40, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <span style={{ fontFamily: 'var(--font-cormorant-garamond)', fontStyle: 'italic', fontSize: 11, color: t.accent, letterSpacing: 0.5 }}>A &amp; B</span>
                </div>
                <div style={{ padding: '3px 2px 4px', background: sel ? t.accent : '#faf8f6', fontSize: 7, fontWeight: sel ? 700 : 400, color: sel ? 'white' : '#3a3330', lineHeight: 1.2, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  {t.nom}
                </div>
              </button>
            )
          })}
        </div>
      </AccordionSection>

      {/* ── 2. Cadre ou Design libre ── */}
      <AccordionSection title={locale === 'en' ? '🖼️ Frame & design' : '🖼️ Cadre & design'} defaultOpen>
        <p style={{ fontSize: 11, color: '#9a928a', marginBottom: 14, lineHeight: 1.5 }}>
          {locale === 'en'
            ? 'Choose a decorative frame, or select "Design it yourself" to add illustrations after generation.'
            : 'Choisissez un cadre décoratif, ou sélectionnez "Designer moi-même" pour ajouter vos illustrations après la génération.'}
        </p>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10 }}>
          {/* Option "Designer moi-même" en premier */}
          <button type="button" onClick={() => onChange({ frameId: 'none' })} style={{
            ...BTN, padding: 8, borderRadius: 10,
            border: `2px solid ${(data.frameId ?? 'none') === 'none' ? accent : '#f0e0d0'}`,
            background: (data.frameId ?? 'none') === 'none' ? `${accent}10` : 'white',
            display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6,
            boxShadow: (data.frameId ?? 'none') === 'none' ? `0 0 0 1px ${accent}` : '0 1px 4px rgba(0,0,0,0.08)',
          }}>
            <div style={{ width: 80, height: 80, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: '#faf8f5', borderRadius: 6, gap: 4 }}>
              <span style={{ fontSize: 20 }}>+</span>
              <span style={{ fontSize: 8, color: '#9a928a', lineHeight: 1.2, textAlign: 'center', padding: '0 4px' }}>Designer moi-même</span>
            </div>
            <span style={{ fontSize: 9, fontWeight: (data.frameId ?? 'none') === 'none' ? 700 : 400, color: (data.frameId ?? 'none') === 'none' ? accent : '#3a3330', textAlign: 'center', lineHeight: 1.3 }}>Design libre</span>
          </button>
          {/* Cadres décoratifs */}
          {FRAMES.filter(fr => !fr.video && fr.url).map(fr => {
            const sel = data.frameId === fr.id
            return (
              <button key={fr.id} type="button" onClick={() => onChange({ frameId: fr.id })} style={{
                ...BTN, padding: 8, borderRadius: 10,
                border: `2px solid ${sel ? accent : '#f0e0d0'}`,
                background: sel ? `${accent}10` : 'white',
                display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6,
                boxShadow: sel ? `0 0 0 1px ${accent}` : '0 1px 4px rgba(0,0,0,0.08)',
              }}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={fr.url!} alt={fr.label} style={{ width: 80, height: 80, objectFit: 'cover', borderRadius: 6 }} />
                <span style={{ fontSize: 9, fontWeight: sel ? 700 : 400, color: sel ? accent : '#3a3330', textAlign: 'center', lineHeight: 1.3 }}>{fr.label}</span>
              </button>
            )
          })}
        </div>
      </AccordionSection>

      <AccordionSection title={locale === 'en' ? '✨ Text animations' : '✨ Animations de texte'}>
        <Label>{t.fairepart.animationTextLabel}</Label>
        <p style={{ fontSize: 11, color: '#9a928a', marginBottom: 12 }}>
          {locale === 'en' ? 'Hover to preview each effect.' : 'Survolez pour voir l\'effet en direct.'}
        </p>
        <style>{`
          @keyframes adSlideUp{from{opacity:0;transform:translateY(14px)}to{opacity:1;transform:translateY(0)}}
          @keyframes adSlideLeft{from{opacity:0;transform:translateX(16px)}to{opacity:1;transform:translateX(0)}}
          @keyframes adZoom{from{opacity:0;transform:scale(0.5)}to{opacity:1;transform:scale(1)}}
          @keyframes adFlip{from{opacity:0;transform:perspective(200px) rotateX(90deg)}to{opacity:1;transform:perspective(200px) rotateX(0)}}
          @keyframes adFade{from{opacity:0}to{opacity:1}}
          @keyframes adRideau{0%{clip-path:inset(0 100% 0 0)}100%{clip-path:inset(0 0 0 0)}}
          @keyframes adBrille{0%{opacity:0;color:#fff;text-shadow:0 0 30px currentColor,0 0 60px currentColor}30%{opacity:1;text-shadow:0 0 20px currentColor,0 0 40px currentColor}100%{opacity:1;text-shadow:none}}
          @keyframes adDeplie{from{opacity:0;transform:scaleY(0);transform-origin:top}to{opacity:1;transform:scaleY(1)}}
          @keyframes adFlou{0%{filter:blur(10px);opacity:0.3}50%{filter:blur(4px);opacity:0.7}100%{filter:blur(0);opacity:1}}
          ${Object.keys(t.fairepart.animationTextOptions).map(k => {
            const a: Record<string, string> = { fade:'adFade', 'slide-up':'adSlideUp', rideau:'adRideau', brille:'adBrille', deplie:'adDeplie', flou:'adFlou', 'slide-left':'adSlideLeft', zoom:'adZoom', flip:'adFlip' }
            return `.anim-${k} .anim-${k}-t{opacity:0.35;transition:opacity 0.3s;}\n.anim-${k}:hover .anim-${k}-t{animation:${a[k] || 'adFade'} 1s ease both;opacity:1;}`
          }).join('\n')}
        `}</style>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10 }}>
          {(Object.entries(t.fairepart.animationTextOptions).map(([key, label]) => ({ key, label }))).map(opt => {
            const sel = (data.animationStyle || 'slide-up') === opt.key
            const accent = THEMES[data.style].accent
            const p1 = data.marie1Prenom || 'Sarah'
            const p2 = data.marie2Prenom || 'David'
            return (
              <button key={opt.key} type="button" onClick={() => onChange({ animationStyle: opt.key })}
                className={`anim-${opt.key}`}
                style={{
                  ...BTN, padding: '18px 6px 14px', borderRadius: 12, overflow: 'hidden',
                  border: `2px solid ${sel ? accent : '#e0d5c8'}`,
                  background: sel ? `${accent}10` : '#fffdf9',
                  display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10,
                }}>
                <div style={{ height: 52, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', overflow: 'hidden', width: '100%' }}>
                  <div className={`anim-${opt.key}-t`} style={{
                    fontFamily: 'var(--font-great-vibes)', fontSize: 22, color: sel ? accent : '#b0a898',
                    lineHeight: 1.15, whiteSpace: 'nowrap', textAlign: 'center',
                  }}>{p1}<br/><span style={{ fontSize: 13, opacity: 0.5 }}>&</span> {p2}</div>
                </div>
                <div style={{ fontSize: 9.5, fontWeight: sel ? 700 : 500, color: sel ? accent : '#3a3330', lineHeight: 1.2, textAlign: 'center' }}>
                  {(opt.label as string).replace(/^.+?\s/, '')}
                </div>
              </button>
            )
          })}
        </div>
      </AccordionSection>

      <AccordionSection title={locale === 'en' ? '✒️ Initials' : '✒️ Initiales'} defaultOpen>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8, marginBottom: 14 }}>
          {([
            { key: 'cercle', label: locale === 'en' ? 'Intertwined' : 'Entrelacé' },
            { key: 'enlace', label: locale === 'en' ? 'Calligraphy' : 'Calligraphie' },
            { key: 'couronne', label: locale === 'en' ? 'Circle' : 'Cercle' },
            { key: 'branches', label: locale === 'en' ? 'Vertical' : 'Vertical' },
            { key: 'losange', label: locale === 'en' ? 'Chic' : 'Chic' },
            { key: 'minimaliste', label: locale === 'en' ? 'Baroque' : 'Baroque' },
          ] as { key: string; label: string }[]).map(opt => {
            const sel = (data.monogrammeStyle || 'cercle') === opt.key
            const previewColor = data.monogrammeColor || THEMES[data.style].accent
            const mi1 = (data.marie1Prenom || 'S')[0].toUpperCase()
            const mi2 = (data.marie2Prenom || 'D')[0].toUpperCase()
            return (
              <button key={opt.key} type="button" onClick={() => onChange({ monogrammeStyle: opt.key })} style={{
                ...BTN, padding: '10px 4px 6px', borderRadius: 10,
                border: `2px solid ${sel ? THEMES[data.style].accent : '#e0d5c8'}`,
                background: sel ? `${THEMES[data.style].accent}10` : 'white',
                display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4,
              }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: 55, overflow: 'visible' }}>
                  <MonogramByStyle initial1={mi1} initial2={mi2} color={previewColor} size={50} style={opt.key} />
                </div>
                <span style={{ fontSize: 8, color: sel ? THEMES[data.style].accent : '#6a5040', fontWeight: sel ? 700 : 400 }}>{opt.label}</span>
              </button>
            )
          })}
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, margin: '8px 0 10px' }}>
          <div style={{ flex: 1, height: 1, background: '#e5d5c5' }} />
          <span style={{ fontSize: 11, color: '#9ca3af', fontStyle: 'italic' }}>{locale === 'en' ? 'or upload your logo' : 'ou importez votre logo'}</span>
          <div style={{ flex: 1, height: 1, background: '#e5d5c5' }} />
        </div>
        <CustomLogoUpload logoUrl={data.customLogoUrl} logoOriginalUrl={data.customLogoOriginalUrl} logoSize={data.customLogoSize} logoColor={data.customLogoColor} onChange={onChange} accent={THEMES[data.style].accent} />

        {/* ── Filigrane (watermark) ── */}
        {data.customLogoUrl && (
          <div style={{ marginTop: 20, padding: '16px 12px', background: '#faf8f5', borderRadius: 12, border: '1px solid #e8ddd0' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
              <span style={{ fontSize: 12, fontWeight: 600, color: '#3a3330', fontFamily: 'var(--font-playfair-display)' }}>✨ Logo en filigrane</span>
              <button type="button" onClick={() => onChange({ logoWatermark: !data.logoWatermark })} style={{
                cursor: 'pointer', padding: '4px 12px', borderRadius: 9999, border: 'none',
                background: data.logoWatermark ? THEMES[data.style].accent : '#e0d5c8',
                color: data.logoWatermark ? 'white' : '#6a6560', fontSize: 11, fontWeight: 600,
              }}>{data.logoWatermark ? 'Activé' : 'Désactivé'}</button>
            </div>
            {data.logoWatermark && (
              <>
                <div style={{ marginBottom: 10 }}>
                  <span style={{ fontSize: 10, color: '#9ca3af', fontWeight: 600 }}>Taille</span>
                  <input type="range" min={80} max={400} step={10} value={data.logoWatermarkSize ?? 180}
                    onChange={e => onChange({ logoWatermarkSize: Number(e.target.value) })}
                    style={{ width: '100%', accentColor: THEMES[data.style].accent }} />
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 9, color: '#9ca3af' }}>
                    <span>Petit</span><span>{data.logoWatermarkSize ?? 180}px</span><span>Grand</span>
                  </div>
                </div>
                <div style={{ marginBottom: 10 }}>
                  <span style={{ fontSize: 10, color: '#9ca3af', fontWeight: 600 }}>Opacité</span>
                  <input type="range" min={2} max={20} step={1} value={Math.round((data.logoWatermarkOpacity ?? 0.06) * 100)}
                    onChange={e => onChange({ logoWatermarkOpacity: Number(e.target.value) / 100 })}
                    style={{ width: '100%', accentColor: THEMES[data.style].accent }} />
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 9, color: '#9ca3af' }}>
                    <span>Subtil</span><span>{Math.round((data.logoWatermarkOpacity ?? 0.06) * 100)}%</span><span>Visible</span>
                  </div>
                </div>
                <div>
                  <span style={{ fontSize: 10, color: '#9ca3af', fontWeight: 600, display: 'block', marginBottom: 4 }}>Couleur du filigrane</span>
                  <div style={{ display: 'flex', gap: 5, flexWrap: 'wrap' }}>
                    {[
                      { value: '', label: 'Original', swatch: '' },
                      { value: THEMES[data.style].accent, label: 'Accent', swatch: THEMES[data.style].accent },
                      { value: '#1B3A5C', label: 'Marine', swatch: '#1B3A5C' },
                      { value: '#C9A84C', label: 'Doré', swatch: '#C9A84C' },
                      { value: '#9ca3af', label: 'Gris', swatch: '#9ca3af' },
                    ].map(opt => {
                      const sel = (data.logoWatermarkColor ?? '') === opt.value
                      return (
                        <button key={opt.label} type="button" onClick={() => onChange({ logoWatermarkColor: opt.value })} style={{
                          cursor: 'pointer', padding: '4px 10px', borderRadius: 9999, fontSize: 10, fontWeight: sel ? 700 : 400,
                          border: sel ? `2px solid ${THEMES[data.style].accent}` : '1px solid #e0d5c8',
                          background: sel ? `${THEMES[data.style].accent}15` : 'white',
                          color: '#3a3330', display: 'flex', alignItems: 'center', gap: 4,
                        }}>
                          {opt.swatch ? <div style={{ width: 12, height: 12, borderRadius: '50%', background: opt.swatch }} /> : <div style={{ width: 12, height: 12, borderRadius: '50%', background: 'conic-gradient(#f87171, #facc15, #34d399, #60a5fa, #a78bfa, #f87171)' }} />}
                          {opt.label}
                        </button>
                      )
                    })}
                  </div>
                </div>
              </>
            )}
          </div>
        )}
      </AccordionSection>

      <AccordionSection title={locale === 'en' ? '🎵 Music & photos' : '🎵 Musique & photos'}>
      <div style={{ marginBottom: 16 }}>
        <Label>{t.fairepart.musicLabel}</Label>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
          <p style={{ fontSize: 11, color: '#9ca3af', margin: 0, flex: 1 }}>{t.fairepart.musicHelp}</p>
          <a href="https://yt2mp3.gs" target="_blank" rel="noopener noreferrer" style={{
            display: 'inline-flex', alignItems: 'center', gap: 5,
            padding: '7px 14px', borderRadius: 9999,
            background: 'linear-gradient(135deg, #C9A84C, #e8c96a)',
            color: 'white', fontSize: 12, fontWeight: 600,
            textDecoration: 'none', whiteSpace: 'nowrap',
            boxShadow: '0 2px 10px #C9A84C44',
            fontFamily: 'var(--font-playfair-display)',
          }}>
            {t.fairepart.musicDownloadMp3}
          </a>
        </div>
        <MusicUploader musicUrl={data.musicUrl ?? ''} musicName={data.musicName} onChange={(url, name) => onChange({ musicUrl: url, musicName: name ?? '' })} />
      </div>
      <StyleAccueilSelector data={data} onChange={onChange} />
      <PhotoSection data={data} onChange={onChange} />
      </AccordionSection>

      <AccordionSection title={locale === 'en' ? '⚙️ Options' : '⚙️ Options'}>
        <div>
          <Label>Date limite de confirmation</Label>
          <p style={{ fontSize: 11, color: '#9ca3af', marginBottom: 8 }}>Les invités verront cette date sur la section de confirmation de présence</p>
          <input type="date" value={data.rsvpDeadline ?? ''} onChange={e => onChange({ rsvpDeadline: e.target.value })} style={S.input} />
        </div>
        <div style={{ marginTop: 16, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <Label>Événements enchaînés</Label>
            <p style={{ fontSize: 11, color: '#9ca3af', margin: 0 }}>Supprime les espaces entre les cérémonies</p>
          </div>
          <button type="button" onClick={() => onChange({ continuousLayout: !data.continuousLayout })} style={{
            cursor: 'pointer', padding: '4px 12px', borderRadius: 9999, border: 'none',
            background: data.continuousLayout ? THEMES[data.style].accent : '#e0d5c8',
            color: data.continuousLayout ? 'white' : '#6a6560', fontSize: 11, fontWeight: 600,
          }}>{data.continuousLayout ? 'Activé' : 'Désactivé'}</button>
        </div>
      </AccordionSection>
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
    <img src={url} alt="" style={{ position: 'absolute', ...positions[corner], width: size, height: size, maxWidth: '25%', maxHeight: 200, objectFit: 'contain', pointerEvents: 'none', zIndex: 0, opacity: 0.7 } as React.CSSProperties} />
  )
}

function CardFrameWrapper({ frameId, ornamentId, themeCardBg, frameOpacity = 1, frameSize = 100, framePaddingV = 22, framePaddingH = 18, textOpacity = 1, textBg = 0.5, textOffsetY = 0, children }: {
  frameId: string; ornamentId: string; themeCardBg: string
  frameOpacity?: number; frameSize?: number; framePaddingV?: number; framePaddingH?: number; textOpacity?: number; textBg?: number; textOffsetY?: number
  children: React.ReactNode
}) {
  const frame = FRAMES.find(f => f.id === frameId) ?? FRAMES[FRAMES.length - 1]
  const hasFrame = !!frame.url
  const isVideo = frame.video
  const ornUrl = hasFrame ? '' : (ORNEMENTS_LIBRARY.find(o => o.id === ornamentId)?.url ?? '')
  return (
    <div style={{ position: 'relative', width: '100%', margin: 0, padding: 0, background: hasFrame ? '#ffffff' : themeCardBg, overflow: hasFrame ? 'hidden' : 'visible' }}>
      {hasFrame && !isVideo && (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={frame.url!} alt="" style={{ ...frameImgStyle(frame.frameType, frameOpacity, frameSize), zIndex: 1 } as React.CSSProperties} />
      )}
      {hasFrame && isVideo && (
        <video src={frame.url!} autoPlay loop muted playsInline style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', objectFit: 'cover', opacity: frameOpacity, pointerEvents: 'none', zIndex: 1 }} />
      )}
      <OrnementCorner url={ornUrl} corner="top-right" size={90} />
      <OrnementCorner url={ornUrl} corner="bottom-left" size={90} />
      {/* Zone texte avec voile blanc semi-transparent derrière pour garantir la lisibilité sur cadres chargés */}
      <div style={{ position: 'relative', zIndex: 10, paddingTop: `${FRAMES_CUSTOM_PADDING[frameId]?.top ?? framePaddingV}%`, paddingBottom: `${FRAMES_CUSTOM_PADDING[frameId]?.bottom ?? framePaddingV}%`, paddingLeft: `${FRAMES_CUSTOM_PADDING[frameId]?.h ?? framePaddingH}%`, paddingRight: `${FRAMES_CUSTOM_PADDING[frameId]?.h ?? framePaddingH}%`, textAlign: 'center', opacity: textOpacity, transform: textOffsetY ? `translateY(${textOffsetY}px)` : undefined, overflowWrap: 'break-word', wordBreak: 'break-word' }}>
        {hasFrame && FRAMES_STRONG_BG.has(frameId) && (
          <div style={{ position: 'absolute', inset: '12% 18%', background: 'radial-gradient(ellipse at center, rgba(255,255,255,0.82) 0%, rgba(255,255,255,0.6) 60%, rgba(255,255,255,0) 100%)', pointerEvents: 'none', zIndex: -1 }} />
        )}
        {children}
      </div>
    </div>
  )
}

function CeremoniesDivider({ themeAccent }: { themeAccent: string }) {
  return (
    <div style={{ maxWidth: 200, margin: '0 auto', display: 'flex', alignItems: 'center', gap: 12, padding: '32px 0' }}>
      <div style={{ flex: 1, height: 0.5, background: `linear-gradient(to right, transparent, ${themeAccent}40)` }} />
      <span style={{ color: themeAccent, fontSize: 8, opacity: 0.5 }}>◆</span>
      <div style={{ flex: 1, height: 0.5, background: `linear-gradient(to left, transparent, ${themeAccent}40)` }} />
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
    padding: compact ? '10px 20px' : '14px 28px',
    background: theme.accent,
    color: 'white',
    fontFamily: 'var(--font-cormorant-garamond)',
    fontSize: compact ? 12 : 13,
    fontWeight: 500,
    letterSpacing: '0.25em',
    textTransform: 'uppercase',
    textDecoration: 'none',
    borderRadius: 4,
    border: `1px solid ${theme.accent}`,
    boxShadow: `0 0 0 4px transparent`,
    transition: 'all 0.4s ease',
  }

  const secondaryBtn: React.CSSProperties = {
    display: 'inline-flex',
    alignItems: 'center',
    gap: 8,
    padding: compact ? '10px 20px' : '14px 28px',
    background: 'transparent',
    color: theme.accent,
    fontFamily: 'var(--font-cormorant-garamond)',
    fontSize: compact ? 12 : 13,
    fontWeight: 500,
    letterSpacing: '0.2em',
    textTransform: 'uppercase',
    textDecoration: 'none',
    borderRadius: 4,
    border: `1px solid ${theme.accent}`,
    transition: 'all 0.4s ease',
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
  const { t } = useT()
  const titles = { mr: t.fairepart.mr, mrs: t.fairepart.mrs, mrAndMrs: t.fairepart.mrAndMrs }
  const gpPa1 = fmtGpCouple(data.famille1GpPaPerePrenom, data.famille1GpPaPereNom, data.famille1GpPaMerePrenom, data.famille1GpPaMereNom, titles)
  const gpMa1 = fmtGpCouple(data.famille1GpMaPerePrenom, data.famille1GpMaPereNom, data.famille1GpMaMerePrenom, data.famille1GpMaMereNom, titles)
  const gpPa2 = fmtGpCouple(data.famille2GpPaPerePrenom, data.famille2GpPaPereNom, data.famille2GpPaMerePrenom, data.famille2GpPaMereNom, titles)
  const gpMa2 = fmtGpCouple(data.famille2GpMaPerePrenom, data.famille2GpMaPereNom, data.famille2GpMaMerePrenom, data.famille2GpMaMereNom, titles)
  const hasGp = gpPa1 || gpMa1 || gpPa2 || gpMa2
  const parents1 = fmtParentsLines(data.famille1PerePrenom, data.famille1PereNom, data.famille1MerePrenom, data.famille1MereNom, titles)
  const parents2 = fmtParentsLines(data.famille2PerePrenom, data.famille2PereNom, data.famille2MerePrenom, data.famille2MereNom, titles)
  const hebrewDate = getHebrewDate(ceremony.date)
  const ov = data.textOverrides ?? {}
  const ci = cardIdx ?? 0
  const titre = ov[`ceremony_${ci}_titre`] || (data.mariageJuif ? t.fairepart.cardHouppaAndSoiree : t.fairepart.cardReligiousAndSoiree)
  const joie = ov[`ceremony_${ci}_joie`] || (hasGp ? t.fairepart.joyMessageGp : t.fairepart.joyMessage)
  const honore = ov[`ceremony_${ci}_honore`] || t.fairepart.cardHonore
  const lieuDisplay = ov[`ceremony_${ci}_lieu`] || ceremony.lieu
  return (
    <CardFrameWrapper frameId={data.frameId ?? 'none'} ornamentId={data.ornamentId ?? 'none'} themeCardBg={THEME_CARD_BG[data.style] ?? '#ffffff'} frameOpacity={data.frameOpacity ?? 1} frameSize={data.frameSize ?? 100} framePaddingV={data.framePaddingV ?? 22} framePaddingH={data.framePaddingH ?? 18} textOpacity={data.textOpacity ?? 1} textBg={data.textBg ?? 0.5} textOffsetY={data.textOffsetY ?? 0}>
      <div style={{ position: 'relative' }}>
        {data.mariageJuif && <div style={{ position: 'absolute', top: '22%', right: '18%', fontSize: 13, fontFamily: 'serif', color: theme.accent, direction: 'rtl', opacity: 0.85, zIndex: 20 }}>בס״ד</div>}
        <div style={{ fontSize: 'small', letterSpacing: '3px', textTransform: 'uppercase', color: theme.accent, textAlign: 'center', marginBottom: 16 }}>{t.fairepart.cardLaHouppa}</div>
        <LogoOrMonogram data={data} theme={theme} />
        {data.mariageJuif && (
          <div style={{ marginBottom: 24 }}>
            <div style={{ height: 1, background: theme.accent, opacity: 0.35, marginBottom: 12 }} />
            <div style={{ fontFamily: 'serif', fontSize: 'clamp(10px, 3.5vw, 16px)', color: theme.accent, direction: 'rtl', textAlign: 'center', lineHeight: 1.9, whiteSpace: 'nowrap', padding: '4px 14px' }}>
              קוֹל שָׂשׂוֹן וְקוֹל שִׂמְחָה, קוֹל חָתָן וְקוֹל כַּלָּה
            </div>
            <div style={{ height: 1, background: theme.accent, opacity: 0.35, marginTop: 12 }} />
          </div>
        )}
        {/* Grands-parents alignés — espace vide si un côté manque */}
        {hasGp && (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr auto 1fr', gap: 8, marginBottom: 4, alignItems: 'start' }}>
            <div style={{ fontFamily: 'var(--font-cormorant-garamond)', fontStyle: 'italic', fontSize: 'clamp(10px, 2.8vw, 13px)', color: theme.accent, lineHeight: 2, whiteSpace: 'nowrap' }}>
              <div style={{ visibility: gpPa1 ? 'visible' : 'hidden' }}>{gpPa1 || '\u00A0'}</div>
              <div style={{ visibility: gpMa1 ? 'visible' : 'hidden' }}>{gpMa1 || '\u00A0'}</div>
            </div>
            <div style={{ width: 1, background: theme.accent, opacity: 0.3, alignSelf: 'stretch', minHeight: 20 }} />
            <div style={{ fontFamily: 'var(--font-cormorant-garamond)', fontStyle: 'italic', fontSize: 'clamp(10px, 2.8vw, 13px)', color: theme.accent, textAlign: 'right', lineHeight: 2, whiteSpace: 'nowrap' }}>
              <div style={{ visibility: gpPa2 ? 'visible' : 'hidden' }}>{gpPa2 || '\u00A0'}</div>
              <div style={{ visibility: gpMa2 ? 'visible' : 'hidden' }}>{gpMa2 || '\u00A0'}</div>
            </div>
          </div>
        )}
        {/* Parents toujours alignés */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr auto 1fr', gap: 8, marginBottom: 24, alignItems: 'start' }}>
          <div style={{ fontFamily: 'var(--font-cormorant-garamond)', fontStyle: 'italic', fontSize: 'clamp(10px, 2.8vw, 13px)', color: theme.accent, lineHeight: 2, whiteSpace: 'nowrap' }}>
            {parents1.map((l, i) => <div key={i}>{l}</div>)}
          </div>
          <div style={{ width: 1, background: theme.accent, opacity: 0.3, alignSelf: 'stretch', minHeight: 40 }} />
          <div style={{ fontFamily: 'var(--font-cormorant-garamond)', fontStyle: 'italic', fontSize: 'clamp(10px, 2.8vw, 13px)', color: theme.accent, textAlign: 'right', lineHeight: 2, whiteSpace: 'nowrap' }}>
            {parents2.map((l, i) => <div key={i}>{l}</div>)}
          </div>
        </div>
        <div style={{ fontFamily: 'var(--font-cormorant-garamond)', fontStyle: 'italic', fontSize: 22, textAlign: 'center', color: theme.texte, marginBottom: 24, lineHeight: 1.5 }}>
          {joie}
        </div>
        <div style={{ textAlign: 'center', marginBottom: 24 }}>
          <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'center', gap: 'clamp(6px,2vw,12px)', flexWrap: 'wrap' }}>
            <div style={{ fontFamily: 'var(--font-great-vibes)', fontSize: 'clamp(28px, 8vw, 56px)', color: theme.accent, lineHeight: 1.1 }}>{data.marie1Prenom || 'Prénom'}</div>
            <div style={{ fontFamily: 'var(--font-great-vibes)', fontSize: 'clamp(16px, 4vw, 24px)', color: theme.accent, opacity: 0.5 }}>&</div>
            <div style={{ fontFamily: 'var(--font-great-vibes)', fontSize: 'clamp(28px, 8vw, 56px)', color: theme.accent, lineHeight: 1.1 }}>{data.marie2Prenom || 'Prénom'}</div>
          </div>
          {!data.mariageJuif && (data.marie1Prenom2 || data.marie2Prenom2) && (
            <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'center', gap: 'clamp(16px,4vw,32px)', marginTop: 2 }}>
              <div style={{ fontFamily: 'var(--font-cormorant-garamond)', fontStyle: 'italic', fontSize: 'clamp(12px,3vw,18px)', letterSpacing: '0.04em', color: theme.accent, opacity: 0.7 }}>{data.marie1Prenom2 || ''}</div>
              {(data.marie1Prenom2 && data.marie2Prenom2) && <div style={{ width: 1, height: 14, background: theme.accent, opacity: 0.2 }} />}
              <div style={{ fontFamily: 'var(--font-cormorant-garamond)', fontStyle: 'italic', fontSize: 'clamp(12px,3vw,18px)', letterSpacing: '0.04em', color: theme.accent, opacity: 0.7 }}>{data.marie2Prenom2 || ''}</div>
            </div>
          )}
          {data.mariageJuif && (data.marie1PrenomHebreu || data.marie2PrenomHebreu) && (
            <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'center', gap: 'clamp(16px,4vw,32px)', marginTop: 4 }}>
              {data.marie1PrenomHebreu && <div dir="rtl" lang="he" style={{ fontFamily: 'var(--font-bellefair), serif', fontSize: 'clamp(14px, 3.5vw, 20px)', color: theme.accent, opacity: 0.55 }}>{data.marie1PrenomHebreu}</div>}
              {data.marie2PrenomHebreu && <div dir="rtl" lang="he" style={{ fontFamily: 'var(--font-bellefair), serif', fontSize: 'clamp(14px, 3.5vw, 20px)', color: theme.accent, opacity: 0.55 }}>{data.marie2PrenomHebreu}</div>}
            </div>
          )}
        </div>
        <div style={{ fontFamily: 'var(--font-cormorant-garamond)', fontStyle: 'italic', fontSize: 18, textAlign: 'center', color: theme.texte, marginBottom: 16, lineHeight: 1.6 }}>
          {honore}
        </div>
        <div style={{ fontFamily: 'var(--font-playfair-display)', fontSize: 'clamp(14px, 3.5vw, 22px)', color: theme.accent, textAlign: 'center', letterSpacing: 3, textTransform: 'uppercase', marginBottom: 8 }}>{formatDateFr(ceremony.date)}</div>
        {data.mariageJuif && hebrewDate && <div style={{ fontFamily: 'serif', fontSize: 'clamp(14px, 3vw, 18px)', color: theme.accent, direction: 'rtl', textAlign: 'center', marginBottom: 16 }}>{hebrewDate}</div>}
        <div style={{ fontFamily: 'var(--font-playfair-display)', fontSize: 'clamp(18px, 4.5vw, 26px)', color: theme.accent, textAlign: 'center', marginBottom: 16, letterSpacing: 2 }}>{formatHeure(ceremony.heure)}</div>
        <div style={{ fontFamily: 'var(--font-cormorant-garamond)', fontStyle: 'italic', fontSize: 'clamp(14px, 3.5vw, 20px)', textAlign: 'center', color: theme.texte, lineHeight: 1.6, maxWidth: '90%', margin: '0 auto', textWrap: 'balance' } as React.CSSProperties}>
          {lieuDisplay && <><div>{formatLieu(lieuDisplay)}</div><div>{t.fairepart.cardFollowedByReception}</div></>}
          {ceremony.adresse && <div style={{ fontSize: 'clamp(11px, 2.5vw, 14px)', marginTop: 8, color: theme.textSecondaire, textWrap: 'balance' } as React.CSSProperties}>{ceremony.adresse}</div>}
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
              {t.fairepart.cardCreatedWith}
            </a>
          </div>
        )}
      </div>
    </CardFrameWrapper>
  )
}

function CardMairie({ ceremony, data, theme, isShared, cardIdx }: CardProps) {
  const { t } = useT()
  const isDark = !!theme.dark
  const ov = data.textOverrides ?? {}
  const ci = cardIdx ?? 0
  const lieuDisplay = ov[`ceremony_${ci}_lieu`] || ceremony.lieu
  return (
    <CardFrameWrapper frameId={data.frameId ?? 'none'} ornamentId={data.ornamentId ?? 'none'} themeCardBg={THEME_CARD_BG[data.style] ?? '#ffffff'} frameOpacity={data.frameOpacity ?? 1} frameSize={data.frameSize ?? 100} framePaddingV={data.framePaddingV ?? 22} framePaddingH={data.framePaddingH ?? 18} textOpacity={data.textOpacity ?? 1} textBg={data.textBg ?? 0.5} textOffsetY={data.textOffsetY ?? 0}>
      <div style={{ position: 'relative' }}>
        {data.mariageJuif && <div style={{ position: 'absolute', top: '22%', right: '18%', fontSize: 13, fontFamily: 'serif', color: theme.accent, direction: 'rtl', opacity: 0.85, zIndex: 20 }}>בס״ד</div>}
        <div style={{ fontSize: 'small', letterSpacing: '3px', textTransform: 'uppercase', color: theme.accent, textAlign: 'center', marginBottom: 16 }}>{t.fairepart.cardLaMairie}</div>
        <LogoOrMonogram data={data} theme={theme} />
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 20 }}><MairieIllustration color={theme.accent} /></div>
        <div style={{ fontFamily: 'var(--font-great-vibes)', fontSize: 'clamp(28px, 7vw, 52px)', color: theme.accent, textAlign: 'center', marginBottom: 12, lineHeight: 1.2 }}>{data.marie1Prenom} & {data.marie2Prenom}</div>
        <div style={{ fontFamily: 'var(--font-cormorant-garamond)', fontStyle: 'italic', fontSize: 'clamp(16px, 4vw, 22px)', textAlign: 'center', color: theme.texte, marginBottom: 8 }}>{t.fairepart.cardSeDiront}</div>
        <div style={{ fontFamily: 'var(--font-great-vibes)', fontSize: 'clamp(48px, 12vw, 72px)', color: theme.accent, textAlign: 'center', marginBottom: 20, lineHeight: 1 }}>{t.fairepart.cardOui}</div>
        <div style={{ fontFamily: 'var(--font-playfair-display)', fontWeight: 'bold', fontSize: 'clamp(14px, 3.5vw, 20px)', textAlign: 'center', color: theme.texte, marginBottom: 12 }}>{formatDateFrCap(ceremony.date)}</div>
        <div style={{ fontFamily: 'var(--font-cormorant-garamond)', fontStyle: 'italic', fontSize: 'clamp(13px, 3vw, 18px)', textAlign: 'center', color: theme.texte, marginBottom: 12, lineHeight: 1.6, maxWidth: '90%', margin: '0 auto 12px', textWrap: 'balance' } as React.CSSProperties}>
          <div>{lieuDisplay ? conjonctionLieu(lieuDisplay) : ''}</div>
          {ceremony.adresse && <div style={{ fontSize: 'clamp(11px, 2.5vw, 14px)', marginTop: 6, color: theme.textSecondaire, textWrap: 'balance' } as React.CSSProperties}>{ceremony.adresse}</div>}
        </div>
        <div style={{ fontFamily: 'var(--font-playfair-display)', fontSize: 'clamp(16px, 4vw, 22px)', color: theme.accent, textAlign: 'center', marginBottom: 20 }}>{formatHeure(ceremony.heure)}</div>
        {isShared && ceremony.adresse && (
          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 20 }}>
            <a href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(ceremony.adresse)}`} target="_blank" rel="noopener noreferrer"
              style={{ padding: '10px 24px', borderRadius: 9999, border: `1px solid ${theme.accent}`, background: 'transparent', color: theme.accent, fontFamily: 'var(--font-cormorant-garamond)', fontStyle: 'italic', fontSize: 15, textDecoration: 'none' }}>
              {t.fairepart.cardItineraire}
            </a>
          </div>
        )}
        {ceremony.suiviDAutre && ceremony.evenementSuivantNom && (
          <div style={{ textAlign: 'center', paddingTop: 20, borderTop: `1px solid ${theme.accent}`, lineHeight: 1.8, maxWidth: '90%', margin: '0 auto' }}>
            <div style={{ fontFamily: 'var(--font-playfair-display)', fontWeight: 'bold', fontSize: 'clamp(12px, 3vw, 16px)', color: theme.texte, textWrap: 'balance' } as React.CSSProperties}>
              {t.fairepart.cardMairieFollowedBy} {ceremony.evenementSuivantNom}
            </div>
            {ceremony.evenementSuivantAdresse && (
              <div style={{ fontFamily: 'var(--font-cormorant-garamond)', fontStyle: 'italic', fontSize: 'clamp(11px, 2.5vw, 14px)', color: theme.textSecondaire, marginTop: 4, textWrap: 'balance' } as React.CSSProperties}>
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
              {t.fairepart.cardCreatedWith}
            </a>
          </div>
        )}
      </div>
    </CardFrameWrapper>
  )
}

function CardHenne({ ceremony, data, theme, isShared, cardIdx }: CardProps) {
  const { t } = useT()
  const isDark = !!theme.dark
  const ov = data.textOverrides ?? {}
  const ci = cardIdx ?? 0
  const lieuDisplay = ov[`ceremony_${ci}_lieu`] || ceremony.lieu
  return (
    <CardFrameWrapper frameId={data.frameId ?? 'none'} ornamentId={data.ornamentId ?? 'none'} themeCardBg={THEME_CARD_BG[data.style] ?? '#ffffff'} frameOpacity={data.frameOpacity ?? 1} frameSize={data.frameSize ?? 100} framePaddingV={data.framePaddingV ?? 22} framePaddingH={data.framePaddingH ?? 18} textOpacity={data.textOpacity ?? 1} textBg={data.textBg ?? 0.5} textOffsetY={data.textOffsetY ?? 0}>
      <div style={{ position: 'relative' }}>
        {data.mariageJuif && <div style={{ position: 'absolute', top: '22%', right: '18%', fontSize: 13, fontFamily: 'serif', color: theme.accent, direction: 'rtl', opacity: 0.85, zIndex: 20 }}>בס״ד</div>}
        <div style={{ fontSize: 'small', letterSpacing: '3px', textTransform: 'uppercase', color: theme.accent, textAlign: 'center', marginBottom: 16 }}>{t.fairepart.cardLeHenne}</div>
        <LogoOrMonogram data={data} theme={theme} />
        <div style={{ textAlign: 'center', fontSize: 24, letterSpacing: '0.5em', color: theme.accent, marginBottom: 24 }}>❋ ✿ ❀</div>
        <div style={{ fontFamily: 'var(--font-cormorant-garamond)', fontStyle: 'italic', fontSize: 20, textAlign: 'center', color: theme.texte, lineHeight: 1.7, marginBottom: 28 }}>
          {t.fairepart.cardHenneInvite}<br />
          <span style={{ fontFamily: 'var(--font-great-vibes)', fontSize: 'clamp(28px, 7vw, 52px)', color: theme.accent }}>{data.marie1Prenom} & {data.marie2Prenom}</span>
        </div>
        <div style={{ fontFamily: 'var(--font-playfair-display)', fontSize: 'clamp(14px, 3.5vw, 22px)', color: theme.accent, textAlign: 'center', letterSpacing: 3, textTransform: 'uppercase', marginBottom: 12 }}>{formatDateFr(ceremony.date)}</div>
        <div style={{ fontFamily: 'var(--font-playfair-display)', fontSize: 'clamp(16px, 4vw, 22px)', color: theme.accent, textAlign: 'center', marginBottom: 16 }}>{formatHeure(ceremony.heure)}</div>
        <div style={{ fontFamily: 'var(--font-cormorant-garamond)', fontStyle: 'italic', fontSize: 20, textAlign: 'center', color: theme.texte }}>
          {lieuDisplay && <div style={{ maxWidth: '90%', margin: '0 auto', textWrap: 'balance' } as React.CSSProperties}>{formatLieu(lieuDisplay)}</div>}
          {ceremony.adresse && <div style={{ fontSize: 'clamp(11px, 2.5vw, 14px)', marginTop: 8, color: theme.textSecondaire, textWrap: 'balance' } as React.CSSProperties}>{ceremony.adresse}</div>}
        </div>
        {isShared && ceremony.adresse && (
          <div style={{ marginTop: 20, paddingBottom: 8 }}>
            <ItineraireButtons adresse={ceremony.adresse} theme={theme} compact />
          </div>
        )}
        {ceremony.note && (
          <div style={{ marginTop: 20, paddingTop: 14, borderTop: `1px solid ${theme.accent}`, opacity: 0.8 }}>
            <div style={{ fontFamily: 'var(--font-cormorant-garamond)', fontStyle: 'italic', fontSize: 13, textAlign: 'center', color: theme.texte, maxWidth: '90%', margin: '0 auto' }}>{ceremony.note}</div>
          </div>
        )}
        {isShared && (
          <div style={{ marginTop: 28, textAlign: 'center' }}>
            <a href="https://lovit.fr" target="_blank" rel="noopener noreferrer" style={{ fontFamily: 'var(--font-cormorant-garamond)', fontStyle: 'italic', fontSize: 11, color: theme.accent, textDecoration: 'none', opacity: 0.45, letterSpacing: 0.5 }}>
              {t.fairepart.cardCreatedWith}
            </a>
          </div>
        )}
      </div>
    </CardFrameWrapper>
  )
}

function CardAutre({ ceremony, data, theme, isShared, cardIdx }: CardProps) {
  const { t } = useT()
  const name = ceremony.type === 'Autre' ? (ceremony.customName || t.fairepart.cardAutreDefaultEvent) : ceremony.type
  const isDark = !!theme.dark
  const ov = data.textOverrides ?? {}
  const ci = cardIdx ?? 0
  const titreDisplay = ov[`ceremony_${ci}_titre`] || name
  const lieuDisplay = ov[`ceremony_${ci}_lieu`] || ceremony.lieu
  return (
    <CardFrameWrapper frameId={data.frameId ?? 'none'} ornamentId={data.ornamentId ?? 'none'} themeCardBg={THEME_CARD_BG[data.style] ?? '#ffffff'} frameOpacity={data.frameOpacity ?? 1} frameSize={data.frameSize ?? 100} framePaddingV={data.framePaddingV ?? 22} framePaddingH={data.framePaddingH ?? 18} textOpacity={data.textOpacity ?? 1} textBg={data.textBg ?? 0.5} textOffsetY={data.textOffsetY ?? 0}>
      <div style={{ position: 'relative' }}>
        {data.mariageJuif && <div style={{ position: 'absolute', top: '22%', right: '18%', fontSize: 13, fontFamily: 'serif', color: theme.accent, direction: 'rtl', opacity: 0.85, zIndex: 20 }}>בס״ד</div>}
        <div style={{ fontSize: 'small', letterSpacing: '3px', textTransform: 'uppercase', color: theme.accent, textAlign: 'center', marginBottom: 16 }}>{titreDisplay}</div>
        <LogoOrMonogram data={data} theme={theme} />
        <div style={{ fontFamily: 'var(--font-cormorant-garamond)', fontStyle: 'italic', fontSize: 20, textAlign: 'center', color: theme.texte, lineHeight: 1.7, marginBottom: 28 }}>
          {t.fairepart.cardAutreJoin} <span style={{ fontFamily: 'var(--font-great-vibes)', fontSize: 'clamp(28px, 7vw, 52px)', color: theme.accent }}>{data.marie1Prenom} & {data.marie2Prenom}</span> {t.fairepart.cardAutreFor} {titreDisplay.toLowerCase()}
        </div>
        <div style={{ fontFamily: 'var(--font-playfair-display)', fontSize: 'clamp(14px, 3.5vw, 22px)', color: theme.accent, textAlign: 'center', letterSpacing: 3, textTransform: 'uppercase', marginBottom: 12 }}>{formatDateFr(ceremony.date)}</div>
        <div style={{ fontFamily: 'var(--font-playfair-display)', fontSize: 'clamp(16px, 4vw, 22px)', color: theme.accent, textAlign: 'center', marginBottom: 16 }}>{formatHeure(ceremony.heure)}</div>
        <div style={{ fontFamily: 'var(--font-cormorant-garamond)', fontStyle: 'italic', fontSize: 20, textAlign: 'center', color: theme.texte }}>
          {lieuDisplay && <div style={{ maxWidth: '90%', margin: '0 auto', textWrap: 'balance' } as React.CSSProperties}>{formatLieu(lieuDisplay)}</div>}
          {ceremony.adresse && <div style={{ fontSize: 'clamp(11px, 2.5vw, 14px)', marginTop: 8, color: theme.textSecondaire, textWrap: 'balance' } as React.CSSProperties}>{ceremony.adresse}</div>}
        </div>
        {isShared && ceremony.adresse && (
          <div style={{ marginTop: 20, paddingBottom: 8 }}>
            <ItineraireButtons adresse={ceremony.adresse} theme={theme} compact />
          </div>
        )}
        {ceremony.note && (
          <div style={{ marginTop: 20, paddingTop: 14, borderTop: `1px solid ${theme.accent}`, opacity: 0.8 }}>
            <div style={{ fontFamily: 'var(--font-cormorant-garamond)', fontStyle: 'italic', fontSize: 13, textAlign: 'center', color: theme.texte, maxWidth: '90%', margin: '0 auto' }}>{ceremony.note}</div>
          </div>
        )}
        {isShared && (
          <div style={{ marginTop: 28, textAlign: 'center' }}>
            <a href="https://lovit.fr" target="_blank" rel="noopener noreferrer" style={{ fontFamily: 'var(--font-cormorant-garamond)', fontStyle: 'italic', fontSize: 11, color: theme.accent, textDecoration: 'none', opacity: 0.45, letterSpacing: 0.5 }}>
              {t.fairepart.cardCreatedWith}
            </a>
          </div>
        )}
      </div>
    </CardFrameWrapper>
  )
}

function CarteShabbatHatan({ ceremony, data, theme, isShared, cardIdx }: CardProps) {
  const { t } = useT()
  const titles = { mr: t.fairepart.mr, mrs: t.fairepart.mrs, mrAndMrs: t.fairepart.mrAndMrs }
  const ci = cardIdx ?? 0
  const ov = data.textOverrides ?? {}
  const lieuDisplay = ov[`ceremony_${ci}_lieu`] || ceremony.lieu
  const gpPa1 = fmtGpCouple(data.famille1GpPaPerePrenom, data.famille1GpPaPereNom, data.famille1GpPaMerePrenom, data.famille1GpPaMereNom, titles)
  const gpMa1 = fmtGpCouple(data.famille1GpMaPerePrenom, data.famille1GpMaPereNom, data.famille1GpMaMerePrenom, data.famille1GpMaMereNom, titles)
  const gpPa2 = fmtGpCouple(data.famille2GpPaPerePrenom, data.famille2GpPaPereNom, data.famille2GpPaMerePrenom, data.famille2GpPaMereNom, titles)
  const gpMa2 = fmtGpCouple(data.famille2GpMaPerePrenom, data.famille2GpMaPereNom, data.famille2GpMaMerePrenom, data.famille2GpMaMereNom, titles)
  const hasGp = gpPa1 || gpMa1 || gpPa2 || gpMa2
  const parents1 = fmtParentsLines(data.famille1PerePrenom, data.famille1PereNom, data.famille1MerePrenom, data.famille1MereNom, titles)
  const parents2 = fmtParentsLines(data.famille2PerePrenom, data.famille2PereNom, data.famille2MerePrenom, data.famille2MereNom, titles)
  const joie = ov[`ceremony_${ci}_joie`] || (hasGp ? t.fairepart.joyMessageGp : t.fairepart.joyMessage)
  return (
    <CardFrameWrapper frameId={data.frameId ?? 'none'} ornamentId={data.ornamentId ?? 'none'} themeCardBg={THEME_CARD_BG[data.style] ?? '#ffffff'} frameOpacity={data.frameOpacity ?? 1} frameSize={data.frameSize ?? 100} framePaddingV={data.framePaddingV ?? 22} framePaddingH={data.framePaddingH ?? 18} textOpacity={data.textOpacity ?? 1} textBg={data.textBg ?? 0.5} textOffsetY={data.textOffsetY ?? 0}>
      <div style={{ position: 'relative' }}>
        {data.mariageJuif && <div style={{ position: 'absolute', top: '22%', right: '18%', fontSize: 13, fontFamily: 'serif', color: theme.accent, direction: 'rtl', opacity: 0.85, zIndex: 20 }}>בס״ד</div>}
        <div style={{ fontSize: 'small', letterSpacing: '3px', textTransform: 'uppercase', color: theme.accent, textAlign: 'center', marginBottom: 16 }}>{t.fairepart.cardShabbatHatan}</div>
        <LogoOrMonogram data={data} theme={theme} />
        <div style={{ textAlign: 'center', fontSize: 22, letterSpacing: '0.4em', color: theme.accent, marginBottom: 24 }}>✡ ✦ ✡</div>
        {/* Grands-parents alignés — espace vide si un côté manque */}
        {hasGp && (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr auto 1fr', gap: 8, marginBottom: 4, alignItems: 'start' }}>
            <div style={{ fontFamily: 'var(--font-cormorant-garamond)', fontStyle: 'italic', fontSize: 'clamp(10px, 2.8vw, 13px)', color: theme.accent, lineHeight: 2, whiteSpace: 'nowrap' }}>
              <div style={{ visibility: gpPa1 ? 'visible' : 'hidden' }}>{gpPa1 || '\u00A0'}</div>
              <div style={{ visibility: gpMa1 ? 'visible' : 'hidden' }}>{gpMa1 || '\u00A0'}</div>
            </div>
            <div style={{ width: 1, background: theme.accent, opacity: 0.3, alignSelf: 'stretch', minHeight: 20 }} />
            <div style={{ fontFamily: 'var(--font-cormorant-garamond)', fontStyle: 'italic', fontSize: 'clamp(10px, 2.8vw, 13px)', color: theme.accent, textAlign: 'right', lineHeight: 2, whiteSpace: 'nowrap' }}>
              <div style={{ visibility: gpPa2 ? 'visible' : 'hidden' }}>{gpPa2 || '\u00A0'}</div>
              <div style={{ visibility: gpMa2 ? 'visible' : 'hidden' }}>{gpMa2 || '\u00A0'}</div>
            </div>
          </div>
        )}
        {/* Parents toujours alignés */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr auto 1fr', gap: 8, marginBottom: 24, alignItems: 'start' }}>
          <div style={{ fontFamily: 'var(--font-cormorant-garamond)', fontStyle: 'italic', fontSize: 'clamp(10px, 2.8vw, 13px)', color: theme.accent, lineHeight: 2, whiteSpace: 'nowrap' }}>
            {parents1.map((l, i) => <div key={i}>{l}</div>)}
          </div>
          <div style={{ width: 1, background: theme.accent, opacity: 0.3, alignSelf: 'stretch', minHeight: 40 }} />
          <div style={{ fontFamily: 'var(--font-cormorant-garamond)', fontStyle: 'italic', fontSize: 'clamp(10px, 2.8vw, 13px)', color: theme.accent, textAlign: 'right', lineHeight: 2, whiteSpace: 'nowrap' }}>
            {parents2.map((l, i) => <div key={i}>{l}</div>)}
          </div>
        </div>
        {/* Texte d'invitation — toujours affiché */}
        <div style={{ fontFamily: 'var(--font-cormorant-garamond)', fontStyle: 'italic', fontSize: 18, textAlign: 'center', color: theme.texte, marginBottom: 16, lineHeight: 1.7, padding: '0 12px' }}>
          {ov[`ceremony_${ci}_joie`] || `Les familles ${data.famille1PereNom || data.marie1Nom || '...'} et ${data.famille2PereNom || data.marie2Nom || '...'} sont ravies de vous convier au Shabbat Hatan de`}
        </div>
        {/* Prénoms */}
        <div style={{ textAlign: 'center', marginBottom: 24 }}>
          <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'center', gap: 'clamp(6px,2vw,12px)', flexWrap: 'wrap' }}>
            <div style={{ fontFamily: 'var(--font-great-vibes)', fontSize: 'clamp(28px, 8vw, 56px)', color: theme.accent, lineHeight: 1.1 }}>{data.marie1Prenom || 'Prénom'}</div>
            <div style={{ fontFamily: 'var(--font-great-vibes)', fontSize: 'clamp(16px, 4vw, 24px)', color: theme.accent, opacity: 0.5 }}>&</div>
            <div style={{ fontFamily: 'var(--font-great-vibes)', fontSize: 'clamp(28px, 8vw, 56px)', color: theme.accent, lineHeight: 1.1 }}>{data.marie2Prenom || 'Prénom'}</div>
          </div>
          {data.mariageJuif && (data.marie1PrenomHebreu || data.marie2PrenomHebreu) && (
            <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'center', gap: 'clamp(16px,4vw,32px)', marginTop: 4 }}>
              {data.marie1PrenomHebreu && <div dir="rtl" lang="he" style={{ fontFamily: 'var(--font-bellefair), serif', fontSize: 'clamp(14px, 3.5vw, 20px)', color: theme.accent, opacity: 0.55 }}>{data.marie1PrenomHebreu}</div>}
              {data.marie2PrenomHebreu && <div dir="rtl" lang="he" style={{ fontFamily: 'var(--font-bellefair), serif', fontSize: 'clamp(14px, 3.5vw, 20px)', color: theme.accent, opacity: 0.55 }}>{data.marie2PrenomHebreu}</div>}
            </div>
          )}
        </div>
        {/* Moments du Shabbat OU date unique */}
        {ceremony.multiJours && ceremony.multiJours.length > 0 ? (
          <div>
            {ceremony.multiJours.map((moment, mi) => (
              <div key={moment.id} style={{ marginBottom: mi < ceremony.multiJours!.length - 1 ? 28 : 0 }}>
                {/* Séparateur */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 12, justifyContent: 'center', marginBottom: 14, maxWidth: 200, margin: '0 auto 14px' }}>
                  <div style={{ flex: 1, height: 0.5, background: `linear-gradient(to right, transparent, ${theme.accent}40)` }} />
                  <span style={{ color: theme.accent, fontSize: 8, opacity: 0.5 }}>✡</span>
                  <div style={{ flex: 1, height: 0.5, background: `linear-gradient(to left, transparent, ${theme.accent}40)` }} />
                </div>
                <div style={{ fontFamily: 'var(--font-playfair-display)', fontSize: 13, fontWeight: 600, letterSpacing: 4, textTransform: 'uppercase', color: theme.accent, textAlign: 'center', marginBottom: 10 }}>{moment.label}</div>
                {moment.heure && <div style={{ fontFamily: 'var(--font-playfair-display)', fontSize: 'clamp(16px, 4vw, 22px)', color: theme.accent, textAlign: 'center', marginBottom: 6 }}>{formatHeure(moment.heure)}</div>}
                {moment.lieu && <div style={{ fontFamily: 'var(--font-cormorant-garamond)', fontStyle: 'italic', fontSize: 19, color: theme.texte, textAlign: 'center', marginBottom: 4 }}>{moment.lieu}</div>}
                {moment.adresse && <div style={{ fontFamily: 'var(--font-cormorant-garamond)', fontSize: 13, color: theme.textSecondaire, textAlign: 'center', marginBottom: 4 }}>{moment.adresse}</div>}
                {moment.note && <div style={{ fontFamily: 'var(--font-cormorant-garamond)', fontStyle: 'italic', fontSize: 12, color: theme.textSecondaire, textAlign: 'center', opacity: 0.8 }}>{moment.note}</div>}
                {isShared && moment.adresse && (
                  <div style={{ marginTop: 10 }}>
                    <ItineraireButtons adresse={moment.adresse} theme={theme} compact />
                  </div>
                )}
              </div>
            ))}
          </div>
        ) : (
          <>
            <div style={{ fontFamily: 'var(--font-playfair-display)', fontSize: 'clamp(14px, 3.5vw, 22px)', color: theme.accent, textAlign: 'center', letterSpacing: 3, textTransform: 'uppercase', marginBottom: 12 }}>{formatDateFr(ceremony.date)}</div>
            <div style={{ fontFamily: 'var(--font-playfair-display)', fontSize: 'clamp(16px, 4vw, 22px)', color: theme.accent, textAlign: 'center', marginBottom: 16 }}>{formatHeure(ceremony.heure)}</div>
            <div style={{ fontFamily: 'var(--font-cormorant-garamond)', fontStyle: 'italic', fontSize: 20, textAlign: 'center', color: theme.texte }}>
              {lieuDisplay && <div style={{ maxWidth: '90%', margin: '0 auto', textWrap: 'balance' } as React.CSSProperties}>{formatLieu(lieuDisplay)}</div>}
              {ceremony.adresse && <div style={{ fontSize: 'clamp(11px, 2.5vw, 14px)', marginTop: 8, color: theme.textSecondaire, textWrap: 'balance' } as React.CSSProperties}>{ceremony.adresse}</div>}
            </div>
            {isShared && ceremony.adresse && (
              <div style={{ marginTop: 20, paddingBottom: 8 }}>
                <ItineraireButtons adresse={ceremony.adresse} theme={theme} compact />
              </div>
            )}
          </>
        )}
        {ceremony.note && (
          <div style={{ marginTop: 20, paddingTop: 14, borderTop: `1px solid ${theme.accent}22`, opacity: 0.8 }}>
            <div style={{ fontFamily: 'var(--font-cormorant-garamond)', fontStyle: 'italic', fontSize: 13, textAlign: 'center', color: theme.texte, maxWidth: '90%', margin: '0 auto' }}>{ceremony.note}</div>
          </div>
        )}
        {isShared && (
          <div style={{ marginTop: 28, textAlign: 'center' }}>
            <a href="https://lovit.fr" target="_blank" rel="noopener noreferrer" style={{ fontFamily: 'var(--font-cormorant-garamond)', fontStyle: 'italic', fontSize: 11, color: theme.accent, textDecoration: 'none', opacity: 0.45, letterSpacing: 0.5 }}>
              {t.fairepart.cardCreatedWith}
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

function CustomLogo({ url, size, scale = 100, color }: { url: string; size: number; scale?: number; color?: string; bgColor?: string }) {
  const s = size * (scale / 100)
  // Utiliser l'URL telle quelle — les transformations sont pré-appliquées au moment de l'upload/sauvegarde
  const src = url
  // eslint-disable-next-line @next/next/no-img-element
  return <img src={src} alt="Logo" style={{ width: s, height: s, objectFit: 'contain' }} />
}

function LogoOrMonogram({ data, theme }: { data: FormData; theme: ThemeObj }) {
  if (data.customLogoUrl) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 12 }}>
        <CustomLogo url={data.customLogoUrl} scale={data.customLogoSize} color={data.customLogoColor} size={110} bgColor={theme.fond} />
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
  const a = (initial1 || 'A').toUpperCase()
  const b = (initial2 || 'B').toUpperCase()
  const GV = 'var(--font-great-vibes)'
  const CG = 'var(--font-cormorant-garamond)'
  const fs = Math.round(size * 0.52)
  // Great Vibes : les fioritures des majuscules (J, P, Q, Y…) dépassent la boîte CSS.
  // On ajoute du padding sur chaque span + letter-spacing pour éviter tout clipping.
  const gv: React.CSSProperties = { fontFamily: GV, fontSize: fs, color, padding: '0 0.08em', lineHeight: 1.1 }
  // Le "&" calligraphique entre les initiales — serré contre les lettres
  const ampersand = <span style={{ fontFamily: GV, fontSize: Math.round(fs * 0.4), color, opacity: 0.5, margin: '0 1px', lineHeight: 1 }}>&</span>

  // ── Style 1 : Entrelacé Luxe ──────────────────────────────────────────────
  if (style === 'cercle') return (
    <div style={{ display: 'inline-flex', alignItems: 'baseline' }}>
      <span style={gv}>{a}</span>
      {ampersand}
      <span style={gv}>{b}</span>
    </div>
  )

  // ── Style 2 : Calligraphie Pure ───────────────────────────────────────────
  if (style === 'enlace') return (
    <div style={{ display: 'inline-flex', alignItems: 'baseline' }}>
      <span style={gv}>{a}</span>
      {ampersand}
      <span style={gv}>{b}</span>
    </div>
  )

  // ── Style 3 : Cercle Élégant ──────────────────────────────────────────────
  if (style === 'couronne') {
    const d = size
    const cx = d / 2, cy = d / 2
    const r1 = d / 2 - 2, r2 = d / 2 - Math.round(d * 0.07)
    const sw1 = Math.max(0.5, d * 0.005), sw2 = Math.max(0.3, d * 0.003)
    const sfs = Math.round(fs * 0.84)
    const ampSmall = <span style={{ fontFamily: GV, fontSize: Math.round(sfs * 0.4), color, opacity: 0.5, margin: '0 1px', lineHeight: 1 }}>&</span>
    return (
      <div style={{ position: 'relative', display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}>
        <svg style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%,-50%)', pointerEvents: 'none' }} width={d} height={d} viewBox={`0 0 ${d} ${d}`} xmlns="http://www.w3.org/2000/svg">
          <circle cx={cx} cy={cy} r={r1} fill="none" stroke={color} strokeWidth={sw1} opacity="0.35" />
          <circle cx={cx} cy={cy} r={r2} fill="none" stroke={color} strokeWidth={sw2} opacity="0.2" />
        </svg>
        <span style={{ ...gv, fontSize: sfs, position: 'relative', zIndex: 1 }}>{a}</span>
        {ampSmall}
        <span style={{ ...gv, fontSize: sfs, opacity: 0.72, position: 'relative', zIndex: 1 }}>{b}</span>
      </div>
    )
  }

  // ── Style 4 : Vertical Luxe ───────────────────────────────────────────────
  if (style === 'branches') {
    const lfs = Math.round(fs * 0.9)
    return (
      <div style={{ display: 'inline-flex', flexDirection: 'column', alignItems: 'center', gap: 0 }}>
        <span style={{ ...gv, fontSize: lfs, textAlign: 'center', marginBottom: Math.round(lfs * -0.2) }}>{a}</span>
        <span style={{ fontFamily: GV, fontSize: Math.round(lfs * 0.35), color, opacity: 0.5, lineHeight: 1, margin: `${Math.round(lfs * -0.05)}px 0` }}>&</span>
        <span style={{ ...gv, fontSize: lfs, opacity: 0.78, textAlign: 'center', marginTop: Math.round(lfs * -0.2) }}>{b}</span>
      </div>
    )
  }

  // ── Style 5 : Minimaliste Chic ────────────────────────────────────────────
  if (style === 'losange') {
    const cfs = Math.round(fs * 0.96)
    return (
      <div style={{ display: 'inline-flex', flexDirection: 'column', alignItems: 'center', gap: Math.round(size * 0.04) }}>
        <div style={{ display: 'inline-flex', alignItems: 'baseline', gap: Math.round(fs * 0.06) }}>
          <span style={{ fontFamily: CG, fontSize: cfs, color, fontStyle: 'italic', fontWeight: 300, letterSpacing: Math.round(fs * 0.04) }}>{a}</span>
          <span style={{ fontFamily: GV, fontSize: Math.round(cfs * 0.45), color, opacity: 0.5 }}>&</span>
          <span style={{ fontFamily: CG, fontSize: cfs, color, fontStyle: 'italic', fontWeight: 300, letterSpacing: Math.round(fs * 0.04) }}>{b}</span>
        </div>
        <div style={{ width: Math.round(size * 0.72), height: 0.5, background: color, opacity: 0.35 }} />
      </div>
    )
  }

  // ── Style 6 : Baroque ────────────────────────────────────────────────────
  const ornW = Math.round(size * 0.9)
  const ornH = Math.round(size * 0.14)
  const rDot = Math.max(1.5, size * 0.016)
  return (
    <div style={{ display: 'inline-flex', flexDirection: 'column', alignItems: 'center' }}>
      <svg width={ornW} height={ornH} viewBox={`0 0 ${ornW} ${ornH}`} xmlns="http://www.w3.org/2000/svg">
        <path d={`M${ornW*0.04},${ornH*0.82} Q${ornW*0.25},${ornH*0.06} ${ornW*0.5},${ornH*0.58} Q${ornW*0.75},${ornH*0.06} ${ornW*0.96},${ornH*0.82}`} fill="none" stroke={color} strokeWidth="0.9" opacity="0.5" strokeLinecap="round"/>
        <circle cx={ornW*0.04} cy={ornH*0.82} r={rDot} fill={color} opacity="0.45"/>
        <circle cx={ornW*0.5} cy={ornH*0.58} r={rDot} fill={color} opacity="0.45"/>
        <circle cx={ornW*0.96} cy={ornH*0.82} r={rDot} fill={color} opacity="0.45"/>
      </svg>
      <div style={{ display: 'inline-flex', alignItems: 'baseline' }}>
        <span style={gv}>{a}</span>
        {ampersand}
        <span style={{ ...gv, opacity: 0.72 }}>{b}</span>
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
      {data.customLogoUrl ? <CustomLogo url={data.customLogoUrl} scale={data.customLogoSize} color={data.customLogoColor} size={200} bgColor={theme.fond} /> : <MonogramByStyle initial1={i1} initial2={i2} color={data.monogrammeColor || theme.accent} size={200} style={data.monogrammeStyle || 'cercle'} />}
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
      {sorted.map((ceremony, i) => {
        const aquarelleUrl = ceremony.illustrationUrl || ''
        return (
          <div key={i}>
            {/* Aquarelle IA du lieu — image décorative entre les sections */}
            {aquarelleUrl && (
              <div style={{ maxWidth: 600, margin: '0 auto', padding: '8px 24px' }}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={aquarelleUrl} alt={ceremony.lieu || ''} style={{ width: '100%', maxHeight: 280, display: 'block', objectFit: 'cover', borderRadius: 16 }} />
              </div>
            )}
            <div style={{ maxWidth: 600, margin: '0 auto', borderRadius: 4, boxShadow: '0 8px 40px rgba(0,0,0,0.13)', overflow: 'hidden' }}>
              {renderCard(ceremony, data, theme, i, isShared)}
            </div>
            {i < sorted.length - 1 && <CeremoniesDivider themeAccent={theme.accent} />}
          </div>
        )
      })}
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
  allergies?: string
  reponses: RSVPReponse[]
  sentAt: string
  shareId?: string
  mariee1?: string
  mariee2?: string
}

function RSVPModal({ accent, onClose, mariee1, mariee2, shareId, ceremonies }: { accent: string; onClose: () => void; mariee1: string; mariee2: string; shareId: string | null; ceremonies: Ceremony[] }) {
  const { t } = useT()
  const getCeremonyName = (c: Ceremony) => c.type === 'Autre' ? (c.customName || t.fairepart.cardAutreDefaultEvent) : c.type

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
  const [nom, setNom] = useState(() => {
    try { return new URLSearchParams(window.location.search).get('guest') || '' } catch { return '' }
  })
  const [email, setEmail] = useState('')
  const [reponses, setReponses] = useState<{ ceremonie: string; ceremonieIdx: number; date: string; present: boolean | null; nbPersonnes: number }[]>(
    ceremonies.map((c, idx) => ({ ceremonie: getCeremonyName(c), ceremonieIdx: idx, date: c.date || '', present: null, nbPersonnes: 1 }))
  )
  const [message, setMessage] = useState('')
  const [allergies, setAllergies] = useState('')
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
        allergies: allergies || undefined,
        reponses: reponses.map((r, i) => ({
          ceremonie: r.ceremonie,
          ceremonieIdx: r.ceremonieIdx,
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
      showToast(t.fairepart.errorRsvp, 'error')
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
            {t.fairepart.rsvpThankYou}
          </div>
          <p style={{ fontSize: 15, color: '#3a3330', lineHeight: 1.7, marginBottom: 8 }}>
            {t.fairepart.rsvpAlreadyRespondedMsg}
          </p>
          <p style={{ fontSize: 14, color: '#9ca3af', lineHeight: 1.6, marginBottom: 28 }}>
            {t.fairepart.rsvpCoupleReceivedResponse}
          </p>
          <button onClick={onClose} style={{ ...BTN, padding: '12px 32px', borderRadius: 9999, background: accent, color: 'white', border: 'none', fontSize: 14, fontWeight: 600, marginBottom: 20 }}>
            {t.fairepart.rsvpClose}
          </button>
          <div style={{ borderTop: '1px solid #efe5d8', paddingTop: 16 }}>
            <button onClick={() => setForceReopen(true)} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 12, color: '#9ca3af', textDecoration: 'underline' }}>
              {t.fairepart.rsvpNotMeBtn}
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
            {t.fairepart.rsvpThankYouName.replace('{name}', nom.split(' ')[0])}
          </div>
          <p style={{ fontSize: 15, color: '#6a5040', lineHeight: 1.7 }}>
            {t.fairepart.rsvpSent}
          </p>
          <button onClick={onClose} style={{ ...BTN, marginTop: 24, padding: '12px 32px', borderRadius: 9999, background: accent, color: 'white', border: 'none', fontSize: 14, fontWeight: 600 }}>{t.fairepart.rsvpClose}</button>
        </div>
      </div>
    )
  }

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 200, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 }}>
      <div onClick={onClose} style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.55)' }} />
      <div style={{ position: 'relative', background: 'white', borderRadius: 20, padding: '32px 36px', width: '100%', maxWidth: 480, maxHeight: '90vh', overflowY: 'auto', boxShadow: '0 24px 64px rgba(0,0,0,0.2)' }}>
        <button onClick={onClose} style={{ ...BTN, position: 'absolute', top: 16, right: 16, background: 'none', border: 'none', fontSize: 20, color: '#9ca3af' }}>✕</button>

        <div style={{ fontFamily: 'Georgia, serif', fontStyle: 'italic', fontSize: 20, color: accent, textAlign: 'center', marginBottom: 4 }}>Confirmer ma présence</div>
        <div style={{ fontSize: 13, color: '#9ca3af', textAlign: 'center', marginBottom: 20 }}>{mariee1} & {mariee2}</div>

        <div style={{ height: 4, background: '#f3e8ff', borderRadius: 9999, marginBottom: 28, overflow: 'hidden' }}>
          <div style={{ height: '100%', width: `${progressPct}%`, background: accent, borderRadius: 9999, transition: 'width 0.3s ease' }} />
        </div>

        {step === 1 && (
          <>
            <div style={{ fontSize: 12, color: '#9ca3af', textAlign: 'center', marginBottom: 20, textTransform: 'uppercase', letterSpacing: '0.1em' }}>Étape 1 / 3 — Vos coordonnées</div>
            <div style={{ marginBottom: 18 }}>
              <Label>{t.fairepart.rsvpName} *</Label>
              <input value={nom} onChange={e => setNom(e.target.value)} placeholder={t.fairepart.rsvpNamePlaceholder} style={S.input} />
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
                <div key={i} style={{ border: `1.5px solid ${r.present === true ? accent : r.present === false ? '#d45050' : '#e0d5c8'}`, borderRadius: 14, padding: '14px 16px', transition: 'border-color 0.2s' }}>
                  <div style={{ fontSize: 13, fontWeight: 700, color: '#3a3330', marginBottom: 4 }}>{r.ceremonie}</div>
                  {r.date && <div style={{ fontSize: 11, color: '#9ca3af', marginBottom: 10 }}>{formatDateFrCap(r.date)}</div>}
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginBottom: r.present === true ? 12 : 0 }}>
                    <button type="button" onClick={() => setPresent(i, true)} style={{
                      ...BTN, padding: '10px 8px', borderRadius: 9, fontSize: 13, fontWeight: 600,
                      border: `2px solid ${r.present === true ? accent : '#e0d5c8'}`,
                      background: r.present === true ? accent : 'white',
                      color: r.present === true ? 'white' : '#3a3330',
                    }}>{t.fairepart.rsvpPresent}</button>
                    <button type="button" onClick={() => setPresent(i, false)} style={{
                      ...BTN, padding: '10px 8px', borderRadius: 9, fontSize: 13, fontWeight: 600,
                      border: `2px solid ${r.present === false ? '#d45050' : '#e0d5c8'}`,
                      background: r.present === false ? '#d45050' : 'white',
                      color: r.present === false ? 'white' : '#3a3330',
                    }}>{t.fairepart.rsvpAbsent}</button>
                  </div>
                  {r.present === true && (
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginTop: 4 }}>
                        <span style={{ fontSize: 12, color: '#6a5040' }}>{t.fairepart.rsvpNbPersons} :</span>
                        <button type="button" onClick={() => setNbPersonnes(i, -1)} style={{ ...BTN, width: 28, height: 28, borderRadius: 9999, border: `1.5px solid ${accent}44`, background: 'white', color: accent, fontWeight: 700, fontSize: 16, padding: 0 }}>−</button>
                        <span style={{ fontSize: 15, fontWeight: 700, color: accent, minWidth: 20, textAlign: 'center' }}>{r.nbPersonnes}</span>
                        <button type="button" onClick={() => setNbPersonnes(i, 1)} style={{ ...BTN, width: 28, height: 28, borderRadius: 9999, border: `1.5px solid ${accent}44`, background: 'white', color: accent, fontWeight: 700, fontSize: 16, padding: 0 }}>+</button>
                      </div>
                      {r.nbPersonnes > 1 && (
                        <div style={{ marginTop: 10, display: 'flex', flexDirection: 'column', gap: 6 }}>
                          {Array.from({ length: r.nbPersonnes - 1 }).map((_, j) => (
                            <input key={j} type="text"
                              placeholder={`${t.fairepart.placeholderCompanion} ${j + 2}`}
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
                placeholder={t.fairepart.rsvpMessagePlaceholder}
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
              }}>{loading ? t.fairepart.rsvpSending : t.fairepart.rsvpSend}</button>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
function RSVPListModal({ accent, onClose, shareId: propShareId, ceremonies }: { accent: string; onClose: () => void; shareId: string | null; ceremonies: Ceremony[] }) {
  const { t } = useT()
  const [entries, setEntries] = useState<RSVPEntry[]>([])
  const [loading, setLoading] = useState(true)
  // Matcher une réponse par nom OU par index (fallback si le nom de cérémonie a changé)
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const findRep = (e: RSVPEntry, nomEvt: string, evtIdx: number) =>
    e.reponses?.find(r => r.ceremonie === nomEvt || (r as any).ceremonieIdx === evtIdx)
  const [views, setViews] = useState<{ timestamp: string; pays: string }[]>([])

  // Bulletproof : shareId depuis prop, sinon URL, sinon rien
  const shareId = propShareId || (typeof window !== 'undefined' ? new URLSearchParams(window.location.search).get('share') : null)

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

  const getCeremonyName = (c: Ceremony) => c.type === 'Autre' ? (c.customName || t.fairepart.cardAutreDefaultEvent) : c.type

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
    ceremonies.forEach((c, ci) => {
      const nomEvt = getCeremonyName(c)
      const presents = entries.filter(e => findRep(e, nomEvt, ci)?.present)
      const nbPers = presents.reduce((s, e) => s + (findRep(e, nomEvt, ci)?.nbPersonnes || 0), 0)
      resumeData.push([nomEvt, `${presents.length} foyers · ${nbPers} personnes`])
    })
    const wsResume = XLSX.utils.aoa_to_sheet(resumeData)
    wsResume['!cols'] = [{ wch: 35 }, { wch: 25 }]
    XLSX.utils.book_append_sheet(wb, wsResume, 'Résumé')

    // Une feuille par cérémonie
    ceremonies.forEach((c, ci) => {
      const nomEvt = getCeremonyName(c)
      const rows: (string | number)[][] = [
        ['Nom', 'Email', 'Présence', 'Nb personnes', 'Accompagnants', 'Message', 'Date de réponse'],
      ]
      entries.forEach(e => {
        const rep = findRep(e, nomEvt, ci)
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
        <div style={{ fontFamily: 'Georgia, serif', fontStyle: 'italic', fontSize: 22, color: accent, textAlign: 'center', marginBottom: 16 }}>{t.fairepart.rsvpListTitle}</div>

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
                <div style={{ fontSize: 12, color: '#6a5040', marginTop: 2 }}>{t.fairepart.rsvpTotal}</div>
              </div>
              <div style={{ borderRadius: 12, padding: '16px 20px', background: '#f0fdf4', textAlign: 'center' }}>
                <div style={{ fontSize: 28, fontWeight: 800, color: '#22c55e' }}>{totalPersonnes}</div>
                <div style={{ fontSize: 12, color: '#6a5040', marginTop: 2 }}>{t.fairepart.rsvpPersonsPresent}</div>
              </div>
            </div>
            <div style={{ display: 'flex', gap: 10, justifyContent: 'center', flexWrap: 'wrap', marginBottom: 20 }}>
              <button onClick={downloadExcel} style={{ ...BTN, padding: '10px 24px', borderRadius: 9999, background: '#16a34a', color: 'white', border: 'none', fontSize: 13, fontWeight: 600, boxShadow: '0 4px 14px rgba(22,163,74,0.35)' }}>
                📊 {t.fairepart.rsvpDownloadExcel}
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
            <div style={{ textAlign: 'center', color: '#9ca3af', padding: 32, fontStyle: 'italic' }}>{t.fairepart.rsvpNoResponses}</div>
          ) : (
            ceremonies.map((c, ci) => {
              const nomEvt = getCeremonyName(c)
              const tableRows = entries.map(e => {
                const rep = findRep(e, nomEvt, ci)
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
                        const rep = findRep(e, nomEvt, ci)
                        const acc = rep?.accompagnants?.filter(Boolean) ?? []
                        return (
                          <tr key={i} style={{ borderBottom: '1px solid #efe5d8', background: i % 2 === 0 ? 'white' : '#fdf8f0' }}>
                            <td style={{ padding: '10px', color: '#3a3330', fontWeight: 500, verticalAlign: 'top' }}>
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
                                : present === false ? <span style={{ color: '#d45050', fontWeight: 700 }}>✗</span>
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
                        <td colSpan={2} style={{ padding: '10px', color: '#3a3330', fontWeight: 700, fontSize: 13 }}>
                          {t.fairepart.rsvpConfirmed} : <span style={{ color: accent, fontSize: 15 }}>{totalPresentsEvt}</span>
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
  const { t } = useT()
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState('')

  const upload = async (file: File) => {
    setUploading(true)
    setError('')
    try {
      const fd = new FormData()
      fd.append('file', file)
      const res = await fetch('/api/upload', { method: 'POST', body: fd })
      const json = await res.json()
      if (json.url) {
        onChange(json.url, file.name)
      } else {
        setError(t.fairepart.musicUploadError + " : " + (json.error?.message ?? 'inconnu'))
      }
    } catch (e) {
      setError(t.fairepart.musicNetworkError + " : " + (e instanceof Error ? e.message : String(e)))
    } finally {
      setUploading(false)
    }
  }

  if (musicUrl) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 14px', border: '1px solid #C9A84C44', borderRadius: 10, background: '#faf5ea' }}>
        <span style={{ fontSize: 18 }}>🎵</span>
        <span style={{ flex: 1, fontSize: 12, color: '#3a3330', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{musicName || t.fairepart.musicUploaded}</span>
        <button type="button" onClick={() => onChange('')} style={{ ...BTN, background: 'none', border: 'none', color: '#d45050', fontSize: 13 }}>{t.fairepart.musicDelete}</button>
      </div>
    )
  }

  return (
    <div>
      <label style={{ display: 'block', cursor: uploading ? 'wait' : 'pointer' }}>
        <div style={{ border: '2px dashed #C9A84C66', borderRadius: 10, padding: 20, textAlign: 'center', background: uploading ? '#faf5ea' : 'white' }}>
          <div style={{ fontSize: 24, marginBottom: 6 }}>{uploading ? '⏳' : '🎵'}</div>
          <p style={{ fontSize: 13, color: '#3a3330', margin: 0 }}>{uploading ? t.fairepart.musicUploadInProgress : t.fairepart.musicClickToUpload}</p>
          <p style={{ fontSize: 11, color: '#9ca3af', marginTop: 4 }}>{t.fairepart.musicFormatHelp}</p>
        </div>
        <input type="file" accept="audio/mp3,audio/mpeg,audio/*" disabled={uploading} onChange={e => { const f = e.target.files?.[0]; if (f) upload(f); e.target.value = '' }} style={{ display: 'none' }} />
      </label>
      {error && <p style={{ fontSize: 12, color: '#d45050', marginTop: 6 }}>{error}</p>}
    </div>
  )
}

// ── WebView → force ouverture dans le vrai navigateur ────────────────────────
function WebViewRedirect() {
  useEffect(() => {
    const ua = navigator.userAgent || ''
    const isWebView = /wv|WebView|FBAN|FBAV|Instagram|Line\/|Twitter/i.test(ua)
    if (!isWebView) return
    const url = window.location.href
    const isAndroid = /Android/i.test(ua)
    if (isAndroid) {
      // intent:// force Chrome sur Android
      const intentUrl = `intent://${url.replace(/^https?:\/\//, '')}#Intent;scheme=https;end`
      window.location.href = intentUrl
    } else {
      // iOS : window.open force Safari
      window.open(url, '_system')
    }
  }, [])
  return null
}

// ── AudioPlayer HTML5 ──────────────────────────────────────────────────────────

function AudioPlayer({ musicUrl, accent, playRef }: { musicUrl: string; accent: string; playRef?: React.MutableRefObject<(() => void) | null> }) {
  const audioRef = useRef<HTMLAudioElement | null>(null)
  const [muted, setMuted] = useState(false)
  const [started, setStarted] = useState(false)

  // playRef : appelé au clic sur "Découvrir" — joue l'audio DOM directement
  useEffect(() => {
    if (playRef) {
      playRef.current = () => {
        const el = audioRef.current
        if (!el) return
        el.play().then(() => setStarted(true)).catch(() => {})
      }
    }
    return () => { if (playRef) playRef.current = null }
  }, [playRef])

  const toggleMute = () => {
    // Accès DOM direct en fallback si ref pas prête
    const el = audioRef.current || document.getElementById('lovit-audio') as HTMLAudioElement | null
    if (!el) return
    if (!started) {
      el.play().then(() => setStarted(true)).catch(() => {})
      return
    }
    el.muted = !muted
    setMuted(m => !m)
  }

  return (
    <>
      {/* Audio DOM — plus fiable que new Audio() sur Android */}
      {/* eslint-disable-next-line jsx-a11y/media-has-caption */}
      <audio id="lovit-audio" ref={audioRef} src={musicUrl} loop preload="metadata" playsInline crossOrigin="anonymous" style={{ position: 'absolute', width: 0, height: 0, opacity: 0 }} />
      <button
        onClick={toggleMute}
        onTouchEnd={e => { e.preventDefault(); toggleMute() }}
        style={{ ...BTN, position: 'fixed', bottom: 32, right: 16, zIndex: 999, width: 48, height: 48, borderRadius: '50%', background: accent, color: 'white', border: `2px solid white`, fontSize: 20, display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 4px 16px rgba(0,0,0,0.3)' }}
      >
        {!started ? '▶️' : muted ? '🔇' : '🔊'}
      </button>
    </>
  )
}

// ── Splash + Music ─────────────────────────────────────────────────────────────

function SplashScreen({ data, theme, onDone, isShared, onStartMusic }: { data: FormData; theme: ThemeObj; onDone: () => void; isShared: boolean; onStartMusic?: () => void }) {
  const { t } = useT()
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
          {t.fairepart.inviteShareJoy}
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
            {t.fairepart.openInvitation}
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
  const { t } = useT()
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
        <input readOnly value={url} onFocus={e => e.target.select()} style={{ flex: 1, fontSize: 11, color: '#3a3330', background: '#fdf8f0', border: `1px solid ${accent}33`, borderRadius: 6, padding: '8px 10px', outline: 'none' }} />
        <button onClick={copy} style={{ ...BTN, padding: '8px 14px', borderRadius: 6, background: copied ? '#22c55e' : accent, color: 'white', border: 'none', fontSize: 12, whiteSpace: 'nowrap', transition: 'background 0.2s' }}>{copied ? `✓ ${t.fairepart.shareCopied}` : t.fairepart.shareCopyBtn}</button>
      </div>
    </div>
  )
}

function shortDateLocale(dateStr: string, locale: string): string {
  if (!dateStr) return ''
  const d = new Date(dateStr + 'T12:00:00')
  const day = d.getDate()
  const loc = locale === 'en' ? 'en-US' : 'fr-FR'
  const month = new Intl.DateTimeFormat(loc, { month: 'long' }).format(d)
  const year = d.getFullYear()
  if (locale === 'en') return `${month} ${day}, ${year}`
  return `${day === 1 ? '1er' : day} ${month} ${year}`
}

function buildWhatsAppMessage(data: FormData, guestUrl: string, dict: import('@/lib/i18n/types').FairepartDict, locale: string): string {
  const sorted = sortByDate(data.ceremonies).filter(c => c.date)
  let datesStr = ''
  if (sorted.length === 0) {
    datesStr = dict.whatsappSoon
  } else if (sorted.length === 1) {
    datesStr = `${dict.whatsappOn} ${shortDateLocale(sorted[0].date, locale)}`
  } else {
    const parts = sorted.map(c => shortDateLocale(c.date, locale))
    datesStr = `${dict.whatsappOnDates} ${parts.slice(0, -1).join(', ')} ${dict.whatsappAnd} ${parts[parts.length - 1]}`
  }
  const firstLieu = sorted[0]?.lieu || data.ceremonies[0]?.lieu || ''
  const ville = firstLieu.trim().split(/\s+/).pop() || ''
  const firstDate = sorted[0]?.date || ''
  let dateLimite = '…'
  if (firstDate) {
    const d = new Date(firstDate + 'T12:00:00')
    d.setDate(d.getDate() - 30)
    dateLimite = shortDateLocale(d.toISOString().split('T')[0], locale)
  }
  const p1 = data.marie1Prenom || dict.whatsappDefaultName1
  const p2 = data.marie2Prenom || dict.whatsappDefaultName2
  return `${dict.whatsappDearFriends}

${dict.whatsappInviteText} ${datesStr}.

${dict.whatsappCelebrateText}

${dict.whatsappFindInvitation}
${guestUrl}

${dict.whatsappConfirmPresence}

${dict.whatsappSeeYouSoon}
${p1} & ${p2} 💍`
}

function CopyTextRow({ text, accent }: { text: string; accent: string }) {
  const { t } = useT()
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
      {copied ? `✓ ${t.fairepart.shareCopied}` : t.fairepart.shareCopyMsg}
    </button>
  )
}

function ShareModal({ accent, guestUrl, coupleUrl, onClose, data }: { accent: string; guestUrl: string; coupleUrl: string; onClose: () => void; data: FormData }) {
  const { t, locale } = useT()
  const [message, setMessage] = useState(() => buildWhatsAppMessage(data, guestUrl, t.fairepart, locale))
  const sorted = sortByDate(data.ceremonies)
  const [customLinks, setCustomLinks] = useState<{ name: string; events: number[] }[]>([])
  const [showCustom, setShowCustom] = useState(false)

  const [newLinkName, setNewLinkName] = useState('')
  const [newLinkEvents, setNewLinkEvents] = useState<number[]>([])

  const typeTitle: Record<string, string> = {
    'Mairie': t.fairepart.cardTitles['Mairie'], 'Cérémonie religieuse / Houppa': t.fairepart.cardTitles['Cérémonie religieuse / Houppa'],
    'Shabbat Hatan': t.fairepart.cardTitles['Shabbat Hatan'], 'Henné': t.fairepart.cardTitles['Henné'],
    'Cocktail': t.fairepart.cardTitles['Cocktail'], 'Soirée': t.fairepart.cardTitles['Soirée'], 'Boat Party': t.fairepart.cardTitles['Boat Party'], 'Beach Party': t.fairepart.cardTitles['Beach Party'],
  }
  const getCName = (c: Ceremony) => typeTitle[c.type] || c.customName || c.type

  const buildCustomUrl = (events: number[]) => {
    // Toujours utiliser le lien invité avec role=guest et les événements sélectionnés
    const url = new URL(guestUrl, window.location.origin)
    url.searchParams.set('events', events.join(','))
    // S'assurer que role=guest est présent (même pour les liens avec slug)
    if (!url.pathname.startsWith('/faire-part')) {
      // Lien slug — events sera transmis par le RedirectClient
      return url.toString()
    }
    url.searchParams.set('role', 'guest')
    return url.toString()
  }

  const addCustomLink = () => {
    if (newLinkEvents.length === 0) return
    setCustomLinks(prev => [...prev, { name: newLinkName || newLinkEvents.map(i => getCName(sorted[i])).join(' + '), events: newLinkEvents }])
    setNewLinkName('')
    setNewLinkEvents([])
  }

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 200, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 }}>
      <div onClick={onClose} style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.6)' }} />
      <div style={{ position: 'relative', background: 'white', borderRadius: 20, padding: 40, width: '100%', maxWidth: 520, boxShadow: '0 24px 64px rgba(0,0,0,0.25)', maxHeight: '90vh', overflowY: 'auto' }}>
        <button onClick={onClose} style={{ ...BTN, position: 'absolute', top: 16, right: 16, background: 'none', border: 'none', fontSize: 22, color: '#9ca3af', lineHeight: 1 }}>✕</button>

        <div style={{ fontFamily: 'var(--font-great-vibes)', fontSize: 32, color: accent, textAlign: 'center', marginBottom: 28 }}>{t.fairepart.shareReadyTitle}</div>

        {/* Section 1 — Lien invités (tous les événements) */}
        <div style={{ marginBottom: 24 }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: accent, textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 10 }}>{t.fairepart.shareGuestLink}</div>
          <CopyLinkRow label="" url={guestUrl} accent={accent} />
          <a href={`https://wa.me/?text=${encodeURIComponent(message)}`} target="_blank" rel="noopener noreferrer"
            style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, padding: '11px 20px', borderRadius: 9, background: '#25D366', color: 'white', textDecoration: 'none', fontSize: 14, fontWeight: 600, marginTop: 4 }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="white"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/><path d="M12 0C5.373 0 0 5.373 0 12c0 2.127.558 4.126 1.533 5.855L0 24l6.335-1.51A11.945 11.945 0 0012 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 21.818a9.818 9.818 0 01-5.006-1.37l-.36-.213-3.727.888.925-3.63-.234-.374A9.778 9.778 0 012.182 12C2.182 6.58 6.58 2.182 12 2.182c5.42 0 9.818 4.398 9.818 9.818 0 5.42-4.398 9.818-9.818 9.818z"/></svg>
            {t.fairepart.shareOnWhatsApp}
          </a>
        </div>

        {/* Section 2 — Message pré-écrit */}
        <div style={{ marginBottom: 24 }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: accent, textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 10 }}>{t.fairepart.sharePreWrittenMsg}</div>
          <textarea value={message} onChange={e => setMessage(e.target.value)} rows={12}
            style={{ width: '100%', padding: '12px 14px', border: '1px solid #e5e7eb', borderRadius: 10, fontSize: 13, color: '#374151', lineHeight: 1.7, resize: 'vertical', outline: 'none', fontFamily: 'inherit', boxSizing: 'border-box' }} />
          <div style={{ fontSize: 11, color: '#9ca3af', marginBottom: 12 }}>{t.fairepart.shareCustomizeMsg}</div>
          <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
            <CopyTextRow text={message} accent={accent} />
            <a href={`https://wa.me/?text=${encodeURIComponent(message)}`} target="_blank" rel="noopener noreferrer"
              style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '10px 20px', borderRadius: 8, background: '#25D366', color: 'white', textDecoration: 'none', fontSize: 13, fontWeight: 600 }}>
              <svg width="15" height="15" viewBox="0 0 24 24" fill="white"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/><path d="M12 0C5.373 0 0 5.373 0 12c0 2.127.558 4.126 1.533 5.855L0 24l6.335-1.51A11.945 11.945 0 0012 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 21.818a9.818 9.818 0 01-5.006-1.37l-.36-.213-3.727.888.925-3.63-.234-.374A9.778 9.778 0 012.182 12C2.182 6.58 6.58 2.182 12 2.182c5.42 0 9.818 4.398 9.818 9.818 0 5.42-4.398 9.818-9.818 9.818z"/></svg>
              {t.fairepart.shareSendOnWhatsApp}
            </a>
          </div>
        </div>

        {/* Section 3 — Liens personnalisés par événement */}
        {sorted.length >= 2 && (
          <div style={{ marginBottom: 24 }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: accent, textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 10 }}>
              {locale === 'en' ? 'Custom links by event' : 'Liens personnalisés par événement'}
            </div>
            <div style={{ fontSize: 12, color: '#6b7280', marginBottom: 12 }}>
              {locale === 'en' ? 'Create different links with only the events you want to share with each group of guests.' : 'Créez des liens différents avec seulement les événements que vous souhaitez partager à chaque groupe d\'invités.'}
            </div>

            {/* Liens déjà créés */}
            {customLinks.map((link, li) => (
              <div key={li} style={{ marginBottom: 10, padding: '10px 14px', background: '#fdf8f0', borderRadius: 10, border: `1px solid ${accent}22` }}>
                <div style={{ fontSize: 12, fontWeight: 600, color: accent, marginBottom: 6 }}>{link.name}</div>
                <CopyLinkRow label="" url={buildCustomUrl(link.events)} accent={accent} />
                <button onClick={() => setCustomLinks(prev => prev.filter((_, i) => i !== li))} style={{ ...BTN, background: 'none', border: 'none', fontSize: 11, color: '#9ca3af', padding: '4px 0', cursor: 'pointer', marginTop: 4 }}>
                  {locale === 'en' ? 'Remove' : 'Supprimer'}
                </button>
              </div>
            ))}

            {/* Créer un nouveau lien */}
            {!showCustom ? (
              <button onClick={() => setShowCustom(true)} style={{ ...BTN, width: '100%', padding: '10px', borderRadius: 10, border: `1.5px dashed ${accent}44`, background: 'transparent', color: accent, fontSize: 13, fontWeight: 500, cursor: 'pointer' }}>
                + {locale === 'en' ? 'Create a custom link' : 'Créer un lien personnalisé'}
              </button>
            ) : (
              <div style={{ padding: '14px', background: '#fafafa', borderRadius: 10, border: '1px solid #e5e7eb' }}>
                <input value={newLinkName} onChange={e => setNewLinkName(e.target.value)} placeholder={locale === 'en' ? 'Link name (optional)' : 'Nom du lien (optionnel)'} style={{ width: '100%', padding: '8px 12px', border: '1px solid #e5e7eb', borderRadius: 8, fontSize: 13, marginBottom: 10, boxSizing: 'border-box', outline: 'none' }} />
                <div style={{ fontSize: 12, fontWeight: 600, color: '#374151', marginBottom: 8 }}>
                  {locale === 'en' ? 'Select events to include:' : 'Sélectionner les événements à inclure :'}
                </div>
                {sorted.map((c, i) => (
                  <label key={i} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '6px 0', fontSize: 13, color: '#374151', cursor: 'pointer' }}>
                    <input type="checkbox" checked={newLinkEvents.includes(i)} onChange={e => { if (e.target.checked) setNewLinkEvents(prev => [...prev, i]); else setNewLinkEvents(prev => prev.filter(x => x !== i)) }} style={{ accentColor: accent }} />
                    {getCName(c)}
                    {c.date && <span style={{ fontSize: 11, color: '#9ca3af', marginLeft: 4 }}>({new Date(c.date + 'T12:00:00').toLocaleDateString(locale === 'en' ? 'en-US' : 'fr-FR', { day: 'numeric', month: 'short' })})</span>}
                  </label>
                ))}
                <div style={{ display: 'flex', gap: 8, marginTop: 12 }}>
                  <button onClick={addCustomLink} disabled={newLinkEvents.length === 0} style={{ ...BTN, flex: 1, padding: '8px', borderRadius: 8, border: 'none', background: newLinkEvents.length > 0 ? accent : '#e5e7eb', color: 'white', fontSize: 13, fontWeight: 600, cursor: newLinkEvents.length > 0 ? 'pointer' : 'default' }}>
                    {locale === 'en' ? 'Create' : 'Créer'}
                  </button>
                  <button onClick={() => { setShowCustom(false); setNewLinkEvents([]); setNewLinkName('') }} style={{ ...BTN, padding: '8px 16px', borderRadius: 8, border: '1px solid #e5e7eb', background: 'white', color: '#6b7280', fontSize: 13, cursor: 'pointer' }}>
                    {locale === 'en' ? 'Cancel' : 'Annuler'}
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Section 4 — Lien mariés */}
        <div style={{ padding: '16px 18px', background: '#f0fdf4', borderRadius: 12 }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: accent, textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 6 }}>{t.fairepart.shareCoupleLink}</div>
          <div style={{ fontSize: 12, color: '#6b7280', marginBottom: 12 }}>{t.fairepart.shareKeepLink}</div>
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
  const { t } = useT()
  const [tab, setTab] = useState<'texte' | 'style'>('texte')
  const [localText, setLocalText] = useState<Record<string, string>>(textOverrides)
  const [localStyles, setLocalStyles] = useState<ZoneStyles>(zoneStyles ?? {})
  // Mêmes couleurs que le logo — dédupliquées
  const localizedColors = (() => {
    const all = [{ value: '', label: 'Thème', swatch: theme.accent }, ...COLOR_OPTIONS.filter(c => c.value !== '')]
    const seen = new Set<string>()
    return all.filter(c => { const k = c.value.toLowerCase(); if (seen.has(k)) return false; seen.add(k); return true })
  })()
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
          <h2 style={{ margin: 0, fontFamily: 'var(--font-playfair-display)', fontSize: 20, color: theme.texte }}>{t.fairepart.zoneStyleLabel}</h2>
          <button type="button" onClick={onClose} style={{ ...BTN, background: 'none', border: 'none', fontSize: 22, color: '#9ca3af', padding: 0 }}>✕</button>
        </div>

        {/* Tabs */}
        <div style={{ display: 'flex', gap: 4, marginBottom: 24, padding: 4, background: '#faf5ea', borderRadius: 10 }}>
          <button type="button" onClick={() => setTab('texte')} style={tabBtn(tab === 'texte')}>{`✏️ ${t.fairepart.textEditTabText}`}</button>
          <button type="button" onClick={() => setTab('style')} style={tabBtn(tab === 'style')}>{`🎨 ${t.fairepart.textEditTabStyle}`}</button>
        </div>

        {/* TAB TEXTE */}
        {tab === 'texte' && (
          <div>
            {/* Texte global page d'accueil */}
            <div style={{ marginBottom: 24, paddingBottom: 20, borderBottom: `1px solid ${theme.accent}33` }}>
              <div style={{ fontFamily: 'var(--font-cormorant-garamond)', fontStyle: 'italic', fontSize: 16, color: theme.accent, marginBottom: 12 }}>Page d&apos;accueil</div>
              <label style={{ display: 'block', fontSize: 11, fontWeight: 700, color: '#9ca3af', letterSpacing: 1, textTransform: 'uppercase', marginBottom: 4 }}>Phrase d&apos;invitation</label>
              <textarea value={localText['global_pleaseJoin'] ?? ''} onChange={e => setText('global_pleaseJoin', e.target.value)} placeholder={t.fairepart.pleaseJoin}
                style={{ width: '100%', padding: '10px 12px', border: '1px solid #e0d5c8', borderRadius: 8, fontSize: 14, color: '#3a3330', outline: 'none', boxSizing: 'border-box', resize: 'vertical', minHeight: 56 }} />
            </div>
            {ceremonies.map((c, i) => {
              const name = c.type === 'Autre' ? (c.customName || t.fairepart.cardAutreDefaultEvent) : c.type
              return (
                <div key={i} style={{ marginBottom: 24, paddingBottom: 20, borderBottom: i < ceremonies.length - 1 ? `1px solid ${theme.accent}33` : 'none' }}>
                  <div style={{ fontFamily: 'var(--font-cormorant-garamond)', fontStyle: 'italic', fontSize: 16, color: theme.accent, marginBottom: 12 }}>{name}</div>
                  <label style={{ display: 'block', fontSize: 11, fontWeight: 700, color: '#9ca3af', letterSpacing: 1, textTransform: 'uppercase', marginBottom: 4 }}>{t.fairepart.textEditTitreLabel}</label>
                  <input value={localText[`ceremony_${i}_titre`] ?? ''} onChange={e => setText(`ceremony_${i}_titre`, e.target.value)} placeholder={name}
                    style={{ width: '100%', padding: '10px 12px', border: '1px solid #e0d5c8', borderRadius: 8, fontSize: 14, color: '#3a3330', outline: 'none', boxSizing: 'border-box', marginBottom: 12 }} />
                  {c.type === 'Cérémonie religieuse / Houppa' && (
                    <>
                      <label style={{ display: 'block', fontSize: 11, fontWeight: 700, color: '#9ca3af', letterSpacing: 1, textTransform: 'uppercase', marginBottom: 4 }}>{t.fairepart.textEditJoyLabel}</label>
                      <textarea value={localText[`ceremony_${i}_joie`] ?? ''} onChange={e => setText(`ceremony_${i}_joie`, e.target.value)} placeholder={t.fairepart.textEditJoyPlaceholder}
                        style={{ width: '100%', padding: '10px 12px', border: '1px solid #e0d5c8', borderRadius: 8, fontSize: 14, color: '#3a3330', outline: 'none', boxSizing: 'border-box', resize: 'vertical', minHeight: 56, marginBottom: 12 }} />
                      <label style={{ display: 'block', fontSize: 11, fontWeight: 700, color: '#9ca3af', letterSpacing: 1, textTransform: 'uppercase', marginBottom: 4 }}>{t.fairepart.textEditHonoreLabel}</label>
                      <textarea value={localText[`ceremony_${i}_honore`] ?? ''} onChange={e => setText(`ceremony_${i}_honore`, e.target.value)} placeholder={t.fairepart.textEditHonorePlaceholder}
                        style={{ width: '100%', padding: '10px 12px', border: '1px solid #e0d5c8', borderRadius: 8, fontSize: 14, color: '#3a3330', outline: 'none', boxSizing: 'border-box', resize: 'vertical', minHeight: 56, marginBottom: 12 }} />
                    </>
                  )}
                  {c.type === 'Mairie' && (
                    <>
                      <label style={{ display: 'block', fontSize: 11, fontWeight: 700, color: '#9ca3af', letterSpacing: 1, textTransform: 'uppercase', marginBottom: 4 }}>Phrase narrative</label>
                      <input value={localText[`ceremony_${i}_sediront`] ?? ''} onChange={e => setText(`ceremony_${i}_sediront`, e.target.value)} placeholder={t.fairepart.cardSeDiront}
                        style={{ width: '100%', padding: '10px 12px', border: '1px solid #e0d5c8', borderRadius: 8, fontSize: 14, color: '#3a3330', outline: 'none', boxSizing: 'border-box', marginBottom: 12 }} />
                    </>
                  )}
                  {c.type !== 'Mairie' && c.type !== 'Cérémonie religieuse / Houppa' && (
                    <>
                      <label style={{ display: 'block', fontSize: 11, fontWeight: 700, color: '#9ca3af', letterSpacing: 1, textTransform: 'uppercase', marginBottom: 4 }}>{t.fairepart.textEditInvitationLabel}</label>
                      <textarea
                        value={localText[`ceremony_${i}_invitation`] ?? ''}
                        onChange={e => setText(`ceremony_${i}_invitation`, e.target.value)}
                        placeholder={`ex: ${c.type === 'Shabbat Hatan' ? 'Les familles X et Y seront ravies de vous convier au Shabbat Hatan de...' : c.type === 'Henné' ? 'Vous convient à célébrer leur soirée de henné...' : c.type === 'Cocktail' ? 'Vous invitent à lever leur verre...' : c.type === 'Soirée' ? 'Vous invitent à danser et célébrer leur amour...' : c.type === 'Boat Party' ? 'Embarquez avec eux pour une soirée inoubliable...' : c.type === 'Beach Party' ? 'Retrouvez-les les pieds dans le sable pour une fête inoubliable...' : 'Rejoignez-les pour cet événement...'}`}
                        style={{ width: '100%', padding: '10px 12px', border: '1px solid #e0d5c8', borderRadius: 8, fontSize: 14, color: '#3a3330', outline: 'none', boxSizing: 'border-box', resize: 'vertical', minHeight: 70, marginBottom: 12 }}
                      />
                      <p style={{ fontSize: 11, color: '#9ca3af', fontStyle: 'italic', marginTop: -6, marginBottom: 12 }}>
                        {t.fairepart.textEditInvitationHelp}
                      </p>
                    </>
                  )}
                  <label style={{ display: 'block', fontSize: 11, fontWeight: 700, color: '#9ca3af', letterSpacing: 1, textTransform: 'uppercase', marginBottom: 4 }}>{t.fairepart.textEditLieuLabel}</label>
                  <input value={localText[`ceremony_${i}_lieu`] ?? ''} onChange={e => setText(`ceremony_${i}_lieu`, e.target.value)} placeholder={c.lieu || t.fairepart.placeholderVenueName}
                    style={{ width: '100%', padding: '10px 12px', border: '1px solid #e0d5c8', borderRadius: 8, fontSize: 14, color: '#3a3330', outline: 'none', boxSizing: 'border-box' }} />
                </div>
              )
            })}
          </div>
        )}

        {/* TAB STYLE */}
        {tab === 'style' && (
          <div>
            <p style={{ fontSize: 12, color: '#6a5040', marginBottom: 20, lineHeight: 1.6, background: '#faf5ea', padding: 12, borderRadius: 8 }}>
              {`💡 ${t.fairepart.textEditStyleSub}`}
            </p>

            {/* Couleur globale — toute la carte d'un coup */}
            <div style={{ marginBottom: 24, padding: 16, border: `2px solid ${theme.accent}`, borderRadius: 12, background: `${theme.accent}08` }}>
              <div style={{ fontFamily: 'var(--font-playfair-display)', fontSize: 14, fontWeight: 700, color: theme.accent, marginBottom: 10 }}>
                🎨 Couleur de tous les textes
              </div>
              <p style={{ fontSize: 11, color: '#9ca3af', marginBottom: 10 }}>Appliquer une couleur à toutes les zones en un clic</p>
              <div style={{ display: 'flex', gap: 5, flexWrap: 'wrap' }}>
                {localizedColors.filter(c => c.value).map(c => (
                  <button key={c.value} type="button" onClick={() => {
                    const next: ZoneStyles = {}
                    TEXT_ZONES.forEach(zone => {
                      next[zone] = { ...(localStyles[zone] ?? {}), color: c.value }
                    })
                    setLocalStyles(next)
                    onApplyStyles(next)
                  }}
                    title={c.label}
                    style={{
                      ...BTN, width: 28, height: 28, borderRadius: '50%',
                      background: c.swatch, padding: 0,
                      border: '2px solid white',
                      boxShadow: '0 0 0 1px #e5e7eb',
                    }}
                  />
                ))}
              </div>
              <button type="button" onClick={() => {
                const next: ZoneStyles = {}
                TEXT_ZONES.forEach(zone => {
                  const z = { ...(localStyles[zone] ?? {}) }
                  delete z.color
                  if (Object.keys(z).length > 0) next[zone] = z
                })
                setLocalStyles(next)
                onApplyStyles(next)
              }} style={{ ...BTN, marginTop: 8, background: 'none', border: 'none', color: '#9ca3af', fontSize: 11, textDecoration: 'underline' }}>
                Réinitialiser toutes les couleurs
              </button>
            </div>

            {TEXT_ZONES.map(zone => {
              const z = localStyles[zone] ?? {}
              return (
                <div key={zone} style={{ marginBottom: 20, padding: 16, border: `1.5px solid ${theme.accent}33`, borderRadius: 12, background: '#fdf8f0' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                    <div style={{ fontFamily: 'var(--font-cormorant-garamond)', fontStyle: 'italic', fontSize: 15, color: theme.accent, fontWeight: 600 }}>{t.fairepart.zones[zone] ?? zone}</div>
                    <button type="button" onClick={() => resetZone(zone)} style={{ ...BTN, background: 'none', border: 'none', color: '#9ca3af', fontSize: 11, textDecoration: 'underline' }}>{t.fairepart.cropReset}</button>
                  </div>

                  {/* Police */}
                  <label style={{ display: 'block', fontSize: 10, fontWeight: 700, color: '#9ca3af', letterSpacing: 1, textTransform: 'uppercase', marginBottom: 4 }}>{t.fairepart.zoneFont}</label>
                  <select value={z.fontFamily ?? ''} onChange={e => setZoneStyle(zone, { fontFamily: e.target.value })}
                    style={{ width: '100%', padding: '8px 10px', border: '1px solid #e0d5c8', borderRadius: 8, fontSize: 13, background: 'white', marginBottom: 12, color: '#3a3330' }}>
                    <option value="">{t.fairepart.zoneFontDefault}</option>
                    {FONT_OPTIONS.map(f => <option key={f.value} value={f.value}>{f.label}</option>)}
                  </select>

                  {/* Couleur */}
                  <label style={{ display: 'block', fontSize: 10, fontWeight: 700, color: '#9ca3af', letterSpacing: 1, textTransform: 'uppercase', marginBottom: 4 }}>{t.fairepart.zoneColor}</label>
                  <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 12 }}>
                    {localizedColors.map(c => {
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
                  <label style={{ display: 'block', fontSize: 10, fontWeight: 700, color: '#9ca3af', letterSpacing: 1, textTransform: 'uppercase', marginBottom: 4 }}>{t.fairepart.zoneSize}</label>
                  <div style={{ display: 'flex', gap: 6, marginBottom: 12 }}>
                    {[{ v: 0.7, l: 'XS' }, { v: 0.85, l: 'S' }, { v: 1, l: 'M' }, { v: 1.15, l: 'L' }, { v: 1.3, l: 'XL' }].map(opt => {
                      const sel = (z.sizeScale ?? 1) === opt.v
                      return (
                        <button key={opt.v} type="button" onClick={() => setZoneStyle(zone, { sizeScale: opt.v })} style={{
                          ...BTN, flex: 1, padding: '8px', borderRadius: 8, fontSize: 12, fontWeight: sel ? 700 : 400,
                          border: `2px solid ${sel ? theme.accent : '#e0d5c8'}`,
                          background: sel ? `${theme.accent}18` : 'white',
                          color: sel ? theme.accent : '#3a3330',
                        }}>{opt.l}</button>
                      )
                    })}
                  </div>

                  {/* Gras / Italique */}
                  <div style={{ display: 'flex', gap: 8 }}>
                    <button type="button" onClick={() => setZoneStyle(zone, { bold: !z.bold })} style={{
                      ...BTN, flex: 1, padding: '8px', borderRadius: 8, fontSize: 13, fontWeight: 700,
                      border: `2px solid ${z.bold ? theme.accent : '#e0d5c8'}`,
                      background: z.bold ? `${theme.accent}18` : 'white',
                      color: z.bold ? theme.accent : '#3a3330',
                    }}>{`𝐁 ${t.fairepart.zoneBold}`}</button>
                    <button type="button" onClick={() => setZoneStyle(zone, { italic: !z.italic })} style={{
                      ...BTN, flex: 1, padding: '8px', borderRadius: 8, fontSize: 13, fontStyle: 'italic',
                      border: `2px solid ${z.italic ? theme.accent : '#e0d5c8'}`,
                      background: z.italic ? `${theme.accent}18` : 'white',
                      color: z.italic ? theme.accent : '#3a3330',
                    }}>{`𝐼 ${t.fairepart.zoneItalic}`}</button>
                  </div>
                </div>
              )
            })}
          </div>
        )}

        <button type="button" onClick={() => { onApply(localText); onApplyStyles(localStyles); onClose() }}
          style={{ ...BTN, width: '100%', padding: '14px', borderRadius: 9999, background: theme.accent, color: 'white', border: 'none', fontSize: 15, fontWeight: 700, letterSpacing: 1, marginTop: 8 }}>
          {`✓ ${t.fairepart.textEditApply}`}
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

type CropData = { url: string; cropX: number; cropY: number; cropScale: number; faceCropUrl?: string }
function IntroCarousel({ photos, themeAccent, photosData }: { photos: string[]; themeAccent: string; photosData?: CropData[] }) {
  const valid = photos.filter(p => p && p.length > 0)
  const [activeIdx, setActiveIdx] = useState(0)

  useEffect(() => {
    if (valid.length <= 1) return
    const t = setInterval(() => {
      setActiveIdx(p => (p + 1) % valid.length)
    }, 4500)
    return () => clearInterval(t)
  }, [valid.length])

  if (valid.length === 0) return null

  return (
    <>
      {/* Toutes les photos empilées — seule l'active a opacity 1 */}
      {valid.map((photo, i) => {
        const crop = photosData?.[i]
        const hasCustomCrop = crop && (crop.cropX !== 0 || crop.cropY !== 0 || (crop.cropScale && crop.cropScale !== 1))
        const photoSrc = hasCustomCrop ? photo : (crop?.faceCropUrl || toCloudinaryFaceCrop(photo))
        const isActive = i === activeIdx

        if (hasCustomCrop) {
          return (
            <div key={i} style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', overflow: 'hidden', zIndex: 0, pointerEvents: 'none', opacity: isActive ? 1 : 0, transition: 'opacity 1s ease' }}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={photoSrc} alt="" style={{ position: 'absolute', top: '50%', left: '50%', width: 'auto', height: '100%', transform: `translate(calc(-50% + ${crop!.cropX}px), calc(-50% + ${crop!.cropY}px)) scale(${crop!.cropScale})`, transformOrigin: 'center center', maxWidth: 'none' }} />
            </div>
          )
        }
        return (
          // eslint-disable-next-line @next/next/no-img-element
          <img key={i} src={photoSrc} alt="" style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'center', opacity: isActive ? 1 : 0, transition: 'opacity 1s ease', zIndex: 0, pointerEvents: 'none' }} />
        )
      })}
      {/* Voile sombre couvrant tout l'écran pour la lisibilité du texte sur n'importe quelle photo */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          background: 'linear-gradient(to top, rgba(0,0,0,0.7) 0%, rgba(0,0,0,0.35) 40%, rgba(0,0,0,0.2) 70%, rgba(0,0,0,0.15) 100%)',
          zIndex: 1,
          pointerEvents: 'none',
        }}
      />
      {valid.length > 1 && (
        <div style={{ position: 'absolute', bottom: 80, left: '50%', transform: 'translateX(-50%)', display: 'flex', gap: 6, zIndex: 5, pointerEvents: 'none' }}>
          {valid.map((_, i) => (
            <div key={i} style={{ width: 6, height: 6, borderRadius: '50%', background: i === activeIdx ? themeAccent : 'rgba(255,255,255,0.5)', transition: 'background 0.3s' }} />
          ))}
        </div>
      )}
    </>
  )
}
// ── Particules persistantes (pétales ou paillettes selon le thème) ─────────
function PersistentParticles({ theme, style: themeStyle }: { theme: ThemeObj; style: string }) {
  // Déterminer le type de particules selon le thème
  const isLuxe = ['ivoire-or', 'marine-or', 'chocolat', 'noir-blanc'].includes(themeStyle)
  const isFloral = ['rose-fleuri', 'champetre', 'fuchsia', 'menthe'].includes(themeStyle)
  const isMinimal = ['blanc-gris', 'bordeaux', 'bordeaux-nuit'].includes(themeStyle)
  if (isMinimal) return null // Pas de particules pour les styles sobres

  const count = isLuxe ? 18 : 10
  const particles = useRef(
    Array.from({ length: count }, (_, i) => ({
      id: i,
      left: Math.random() * 100,
      delay: Math.random() * 12,
      duration: 10 + Math.random() * 8,
      size: isLuxe ? 3 + Math.random() * 4 : 8 + Math.random() * 10,
      rotation: Math.random() * 360,
      drift: -20 + Math.random() * 40,
    }))
  ).current

  return (
    <div style={{ position: 'fixed', inset: 0, pointerEvents: 'none', zIndex: 50, overflow: 'hidden' }} aria-hidden="true">
      <style>{`
        @keyframes lovitFloat{
          0%{transform:translateY(-5vh) translateX(0) rotate(var(--r));opacity:0}
          10%{opacity:var(--o)}
          90%{opacity:var(--o)}
          100%{transform:translateY(105vh) translateX(var(--drift)) rotate(calc(var(--r) + 180deg));opacity:0}
        }
        @keyframes lovitSparkle{
          0%,100%{opacity:0.2;transform:scale(0.8)}
          50%{opacity:0.7;transform:scale(1.2)}
        }
      `}</style>
      {particles.map(p => isLuxe ? (
        // Paillette dorée
        <div key={p.id} style={{
          position: 'absolute',
          left: `${p.left}%`,
          top: `${Math.random() * 100}%`,
          width: p.size,
          height: p.size,
          borderRadius: '50%',
          background: `radial-gradient(circle, ${theme.accent} 0%, ${theme.accent}00 70%)`,
          animation: `lovitSparkle ${2 + Math.random() * 3}s ${p.delay}s ease-in-out infinite`,
          opacity: 0.3,
        } as React.CSSProperties} />
      ) : (
        // Pétale
        <div key={p.id} style={{
          '--r': `${p.rotation}deg`,
          '--o': `${0.25 + Math.random() * 0.2}`,
          '--drift': `${p.drift}px`,
          position: 'absolute',
          left: `${p.left}%`,
          top: 0,
          width: p.size,
          height: p.size * 1.4,
          borderRadius: '50% 0 50% 0',
          background: isFloral ? `${theme.accent}55` : `${theme.accent}33`,
          animation: `lovitFloat ${p.duration}s ${p.delay}s linear infinite`,
          opacity: 0,
        } as React.CSSProperties} />
      ))}
    </div>
  )
}

// ── AnimSection : fade-in au scroll ───────────────────────────────────────────
function AnimSection({ children, delay = 0, style, animStyle = 'slide-up', skipAnim = false }: {
  children: React.ReactNode; delay?: number; style?: React.CSSProperties; animStyle?: string; skipAnim?: boolean
}) {
  const ref = useRef<HTMLDivElement>(null)
  useEffect(() => {
    const el = ref.current
    if (!el || skipAnim) return
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
  }, [animStyle, delay, skipAnim])
  return (
    <div ref={ref} style={{ opacity: skipAnim ? 1 : 0, ...style }}>
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

// ── Menu flottant pour naviguer entre les événements ──────────────────────────
function StickyHeader({ ceremonies, accent, theme, logoUrl, logoColor, logoSize = 48, logoBold = 100, firstDate, editable, onLogoChange, premiumStyle }: { ceremonies: { type: string; customName?: string }[]; accent: string; theme: ThemeObj; logoUrl?: string; logoColor?: string; logoSize?: number; logoBold?: number; firstDate?: string; editable?: boolean; onLogoChange?: (d: Partial<FormData>) => void; premiumStyle?: boolean }) {
  const [open, setOpen] = useState(false)
  const [countdown, setCountdown] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 })
  const { t } = useT()

  useEffect(() => {
    if (!firstDate) return
    const target = new Date(firstDate).getTime()
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
  }, [firstDate])

  const typeTitle: Record<string, string> = {
    'Mairie': t.fairepart.cardTitles['Mairie'],
    'Cérémonie religieuse / Houppa': t.fairepart.cardTitles['Cérémonie religieuse / Houppa'],
    'Shabbat Hatan': t.fairepart.cardTitles['Shabbat Hatan'],
    'Henné': t.fairepart.cardTitles['Henné'],
    'Cocktail': t.fairepart.cardTitles['Cocktail'],
    'Soirée': t.fairepart.cardTitles['Soirée'],
    'Boat Party': t.fairepart.cardTitles['Boat Party'],
  }

  const [showLogoEdit, setShowLogoEdit] = useState(false)
  // Logo affiché — URL utilisée telle quelle (transformations pré-appliquées)
  const effectiveLogoColor = logoColor || accent
  const logoSrc = logoUrl || ''

  const PD = 'var(--font-playfair-display)'
  const countdownItems = [
    { value: countdown.days, label: 'Jours' },
    { value: countdown.hours, label: 'Heures' },
    { value: countdown.minutes, label: 'Minutes' },
    { value: countdown.seconds, label: 'Secondes' },
  ]

  const CG = 'var(--font-cormorant-garamond)'
  const premiumCountdownItems = [
    { value: countdown.days, label: 'Jours' },
    { value: countdown.hours, label: 'Heures' },
    { value: countdown.minutes, label: 'Min' },
    { value: countdown.seconds, label: 'Sec' },
  ]
  const separatorLine = <div style={{ width: 0.5, height: 28, background: 'rgba(201,162,100,0.3)', flexShrink: 0 }} />

  return (
    <>
      <div style={premiumStyle ? {
        position: 'fixed', top: 0, left: '50%', transform: 'translateX(-50%)',
        width: '100%', maxWidth: 480, zIndex: 100,
        background: 'rgba(247,243,236,0.97)',
        backdropFilter: 'blur(12px)', WebkitBackdropFilter: 'blur(12px)',
        borderBottom: '0.5px solid rgba(201,162,100,0.2)',
        height: 68, padding: '0 16px', boxSizing: 'border-box',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      } as React.CSSProperties : {
        position: 'fixed', top: 0, left: '50%', transform: 'translateX(-50%)',
        width: '100%', maxWidth: 480, zIndex: 100,
        background: theme.dark ? 'rgba(20,20,20,0.95)' : 'rgba(255,255,255,0.95)',
        backdropFilter: 'blur(16px)', WebkitBackdropFilter: 'blur(16px)',
        borderBottom: `1px solid ${accent}22`,
        padding: '6px 14px', boxSizing: 'border-box',
        height: 48, overflow: 'hidden',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      } as React.CSSProperties}>
        {/* Logo */}
        <div style={{ width: premiumStyle ? logoSize * 1.4 : logoSize, height: premiumStyle ? logoSize * 1.4 : logoSize, flexShrink: 0, cursor: editable ? 'pointer' : undefined, transformOrigin: 'left center' }} onClick={editable ? () => setShowLogoEdit(!showLogoEdit) : undefined}>
          {logoSrc ? (
            <div style={{
              width: premiumStyle ? logoSize * 1.4 : logoSize, height: premiumStyle ? logoSize * 1.4 : logoSize,
              backgroundColor: effectiveLogoColor,
              WebkitMaskImage: `url(${logoSrc})`,
              WebkitMaskSize: 'contain',
              WebkitMaskRepeat: 'no-repeat',
              WebkitMaskPosition: 'center',
              maskImage: `url(${logoSrc})`,
              maskSize: 'contain',
              maskRepeat: 'no-repeat',
              maskPosition: 'center',
            } as React.CSSProperties} />
          ) : null}
        </div>

        {premiumStyle && separatorLine}

        {/* Countdown */}
        {firstDate && premiumStyle ? (
          <div style={{ display: 'flex', alignItems: 'center', gap: 2, flex: 1, justifyContent: 'center' }}>
            {premiumCountdownItems.map((item, idx) => (
              <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <div style={{ textAlign: 'center', minWidth: 32 }}>
                  <div style={{ fontFamily: CG, fontStyle: 'italic', fontSize: 24, color: '#1B2A5E', lineHeight: 1, fontWeight: 300 }}>
                    {String(item.value).padStart(2, '0')}
                  </div>
                  <div style={{ fontFamily: 'Montserrat, sans-serif', fontSize: 5, letterSpacing: 1.5, color: '#C9A264', textTransform: 'uppercase', marginTop: 2 }}>
                    {item.label}
                  </div>
                </div>
                {idx < 3 && <div style={{ color: '#C9A264', fontSize: 6, marginBottom: 10, opacity: 0.6, flexShrink: 0 }}>◆</div>}
              </div>
            ))}
          </div>
        ) : firstDate ? (
          <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
            {countdownItems.map((item, idx) => (
              <div key={idx} style={{ textAlign: 'center' }}>
                <div style={{ fontFamily: PD, fontSize: 20, fontWeight: 700, color: accent, lineHeight: 1 }}>
                  {String(item.value).padStart(2, '0')}
                </div>
                <div style={{ fontFamily: PD, fontSize: 7, fontWeight: 600, letterSpacing: 1, textTransform: 'uppercase', color: accent, opacity: 0.7, marginTop: 2 }}>
                  {item.label}
                </div>
              </div>
            ))}
          </div>
        ) : null}

        {premiumStyle && separatorLine}

        {/* Menu burger */}
        {premiumStyle ? (
          <div onClick={() => setOpen(!open)} style={{
            width: 34, height: 34, border: '0.5px solid rgba(201,162,100,0.5)', borderRadius: '50%',
            display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
            gap: 4, cursor: 'pointer', flexShrink: 0,
          }}>
            {open ? <span style={{ color: '#1B2A5E', fontSize: 14, lineHeight: 1 }}>✕</span> : <>
              <div style={{ width: 13, height: 0.5, background: '#1B2A5E' }} />
              <div style={{ width: 13, height: 0.5, background: '#1B2A5E' }} />
              <div style={{ width: 13, height: 0.5, background: '#1B2A5E' }} />
            </>}
          </div>
        ) : (
          <button onClick={() => setOpen(!open)} style={{
            width: 36, height: 36, borderRadius: '50%', border: `1.5px solid ${accent}44`,
            background: 'transparent', display: 'flex', alignItems: 'center', justifyContent: 'center',
            cursor: 'pointer', color: accent, fontSize: 18, padding: 0, flexShrink: 0,
          }}>
            {open ? '✕' : '☰'}
          </button>
        )}
      </div>

      {/* Menu déroulant */}
      {open && (
        <div style={{
          position: 'fixed', top: 54, right: 16, zIndex: 101,
          background: theme.dark ? 'rgba(20,20,20,0.95)' : 'rgba(255,255,255,0.97)',
          backdropFilter: 'blur(12px)', WebkitBackdropFilter: 'blur(12px)',
          borderRadius: 12, border: `1px solid ${accent}33`,
          boxShadow: '0 8px 32px rgba(0,0,0,0.15)', padding: '8px 0', minWidth: 180,
        } as React.CSSProperties}>
          {ceremonies.map((c, i) => (
            <button key={i} onClick={() => { setOpen(false); document.getElementById(`ceremony-${i}`)?.scrollIntoView({ behavior: 'smooth', block: 'start' }) }} style={{ display: 'block', width: '100%', padding: '10px 20px', background: 'none', border: 'none', textAlign: 'left', cursor: 'pointer', fontFamily: 'var(--font-cormorant-garamond)', fontStyle: 'italic', fontSize: 15, color: theme.texte, letterSpacing: 0.5 }}>
              {typeTitle[c.type] || c.customName || c.type}
            </button>
          ))}
          <div style={{ height: 1, background: `${accent}22`, margin: '4px 12px' }} />
          <button onClick={() => { setOpen(false); document.getElementById('rsvp-section')?.scrollIntoView({ behavior: 'smooth', block: 'start' }) }} style={{ display: 'block', width: '100%', padding: '10px 20px', background: 'none', border: 'none', textAlign: 'left', cursor: 'pointer', fontFamily: 'var(--font-playfair-display)', fontSize: 13, fontWeight: 600, color: accent, letterSpacing: 1, textTransform: 'uppercase' }}>
            RSVP
          </button>
        </div>
      )}
      {/* Popup édition logo bannière */}
      {editable && showLogoEdit && (
        <div style={{ position: 'fixed', top: 60, left: 14, zIndex: 102, background: theme.dark ? 'rgba(20,20,20,0.97)' : '#fff', borderRadius: 12, border: `1px solid ${accent}33`, boxShadow: '0 8px 32px rgba(0,0,0,0.18)', padding: '14px 16px', minWidth: 200 }}>
          <div style={{ fontFamily: 'var(--font-cormorant-garamond)', fontSize: 12, fontWeight: 700, color: accent, letterSpacing: 1, textTransform: 'uppercase', marginBottom: 10 }}>Logo bannière</div>
          {/* Taille */}
          <div style={{ marginBottom: 10 }}>
            <label style={{ fontSize: 11, color: theme.texte, opacity: 0.7 }}>Taille : {logoSize}px</label>
            <input type="range" min={24} max={80} value={logoSize} onChange={e => onLogoChange?.({ headerLogoSize: +e.target.value })} style={{ width: '100%', accentColor: accent }} />
          </div>
          {/* Intensité */}
          <div style={{ marginBottom: 10 }}>
            <label style={{ fontSize: 11, color: theme.texte, opacity: 0.7 }}>Intensité (+ foncé →)</label>
            <input type="range" min={100} max={300} step={10} value={logoBold} onChange={e => onLogoChange?.({ headerLogoBold: +e.target.value })} style={{ width: '100%', accentColor: accent }} />
          </div>
          {/* Couleur */}
          <div style={{ fontSize: 11, color: theme.texte, opacity: 0.7, marginBottom: 6 }}>Couleur</div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
            {[accent, '#1a1a1a', '#ffffff', '#C9A84C', '#8b6914', '#2c4a7c', '#8b1a2a', '#7a9e6e', '#d4006a', '#888888', '#c4829a', '#d4a574', '#5a9a80', '#E07856', '#9b72aa', '#F4A165'].map(c => (
              <button key={c} onClick={() => onLogoChange?.({ headerLogoColor: c })} style={{ width: 24, height: 24, borderRadius: '50%', background: c, border: effectiveLogoColor === c ? `2.5px solid ${accent}` : '1px solid #d6d1cb', cursor: 'pointer', padding: 0 }} />
            ))}
            {/* Custom color picker */}
            <label style={{ width: 24, height: 24, borderRadius: '50%', border: '1px solid #d6d1cb', overflow: 'hidden', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'conic-gradient(red, yellow, lime, aqua, blue, magenta, red)', flexShrink: 0 }}>
              <input type="color" value={effectiveLogoColor || '#000000'} onChange={e => onLogoChange?.({ headerLogoColor: e.target.value })} style={{ opacity: 0, width: 0, height: 0, position: 'absolute' }} />
            </label>
          </div>
          <button onClick={() => setShowLogoEdit(false)} style={{ marginTop: 10, width: '100%', padding: '6px 0', background: 'transparent', border: `1px solid ${accent}33`, borderRadius: 8, fontSize: 11, color: accent, cursor: 'pointer' }}>Fermer</button>
        </div>
      )}
    </>
  )
}

// ── SharedPageContent : vue partagée page unique luxe ─────────────────────────

function CeremonyCard({ isCard, accent, hasFrame, children }: { isCard: boolean; accent: string; hasFrame?: boolean; children: React.ReactNode }) {
  if (!isCard) return <>{children}</>
  return (
    <div style={{ margin: hasFrame ? '0' : '24px 0', borderRadius: hasFrame ? 0 : 16, overflow: hasFrame ? 'hidden' : 'visible', boxShadow: hasFrame ? 'none' : '0 8px 32px rgba(0,0,0,0.13)', border: hasFrame ? 'none' : `1.5px solid ${accent}22` }}>
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
  onUpdate?: (d: Partial<FormData>) => void
  onTextEdit?: () => void
}
// ── 💌 ENVELOPPE PREMIUM ─────────────────────────────────────────────────────
// Design : prénoms en haut, sceau au centre, "Touchez" en bas, ornements SVG
// ── Palette enveloppe par thème ──
const ENV_STYLES: Record<string, { bg: string; bgDark: string; liner: string; sealColor: string; variant: 'seal' | 'ribbon'; ribbonColor?: string }> = {
  'rose-fleuri':   { bg: '#f8ede8', bgDark: '#e8d0c8', liner: '#f5d5d0', sealColor: '#c4829a', variant: 'ribbon', ribbonColor: '#d4a0b0' },
  'fuchsia':       { bg: '#fce8f2', bgDark: '#f0c8d8', liner: '#fdd5e8', sealColor: '#d4006a', variant: 'ribbon', ribbonColor: '#e84098' },
  'bordeaux':      { bg: '#f5e8e8', bgDark: '#e0c8c8', liner: '#f0d0d0', sealColor: '#8b1a2a', variant: 'ribbon', ribbonColor: '#a83040' },
  'bordeaux-nuit': { bg: '#3a1828', bgDark: '#280e18', liner: '#4a2038', sealColor: '#d4829a', variant: 'ribbon', ribbonColor: '#c06880' },
  'ivoire-or':     { bg: '#fdf5e6', bgDark: '#f0e0c0', liner: '#f8ecd0', sealColor: '#C9A84C', variant: 'seal' },
  'marine-or':     { bg: '#152540', bgDark: '#0a1628', liner: '#1a3050', sealColor: '#C9A84C', variant: 'seal' },
  'chocolat':      { bg: '#3a2818', bgDark: '#2c1a0e', liner: '#4a3020', sealColor: '#d4a574', variant: 'seal' },
  'noir-blanc':    { bg: '#282828', bgDark: '#1a1a1a', liner: '#333333', sealColor: '#c0c0c0', variant: 'seal' },
  'bleu-floral':   { bg: '#e8eef5', bgDark: '#d0d8e8', liner: '#dce5f0', sealColor: '#2c4a7c', variant: 'seal' },
  'champetre':     { bg: '#eef4e8', bgDark: '#d8e4c8', liner: '#e0ecd0', sealColor: '#7a9e6e', variant: 'seal' },
  'blanc-gris':    { bg: '#f2f2f2', bgDark: '#dcdcdc', liner: '#eaeaea', sealColor: '#888888', variant: 'seal' },
  'menthe':        { bg: '#e6f5ee', bgDark: '#c8e8d8', liner: '#d4f0e0', sealColor: '#2a9a6a', variant: 'seal' },
  'parme-ivoire':  { bg: '#f0e8f5', bgDark: '#d8c8e8', liner: '#e8d8f0', sealColor: '#9b72aa', variant: 'ribbon', ribbonColor: '#b090c0' },
}

// Transition : fade-out élégant de l'enveloppe → fade-in du faire-part
function AnimEnveloppe({ data, theme, onDone }: { data: FormData; theme: ThemeObj; onDone: () => void }) {
  const { locale } = useT()
  const [phase, setPhase] = useState(0) // 0=idle, 1=ouverture, 2=fade out→done
  const a = theme.accent
  const fond = theme.fond
  const GV = 'var(--font-great-vibes)'
  const CG = 'var(--font-cormorant-garamond)'
  const FP = 'var(--font-playfair-display)'
  const es = ENV_STYLES[data.style] || ENV_STYLES['ivoire-or']

  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) onDone()
  }, [onDone])

  const handleOpen = () => {
    if (phase > 0) return
    setPhase(2)                          // fondu direct
    setTimeout(() => onDone(), 800)      // terminé
  }

  const textColor = theme.dark ? '#e8ddd0' : a

  // Couleur texte premium
  const txtMain = theme.dark ? '#f0e8dc' : a
  const txtSoft = theme.dark ? '#c8b8a4' : `${a}99`

  return (
    <div onClick={phase === 0 ? handleOpen : undefined} style={{
      position: 'fixed', inset: 0, zIndex: 9999,
      background: `radial-gradient(ellipse at 50% 38%, ${es.liner}80 0%, ${fond} 65%)`,
      display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column',
      cursor: phase === 0 ? 'pointer' : 'default',
      opacity: phase >= 2 ? 0 : 1,
      transition: phase >= 2 ? 'opacity 0.8s cubic-bezier(0.4,0,0.2,1)' : 'none',
      pointerEvents: phase >= 2 ? 'none' : 'auto',
    }}>
      <style>{`
        @keyframes envFloat{0%,100%{transform:translateY(0)}50%{transform:translateY(-8px)}}
        @keyframes envAppear{from{opacity:0;transform:translateY(30px) scale(0.95)}to{opacity:1;transform:translateY(0) scale(1)}}
        @keyframes tapPulse{0%,100%{opacity:0.5}50%{opacity:0.85}}
        @keyframes nameSlideL{from{opacity:0;transform:translateX(-20px)}to{opacity:1;transform:translateX(0)}}
        @keyframes nameSlideR{from{opacity:0;transform:translateX(20px)}to{opacity:1;transform:translateX(0)}}
        @keyframes ornFadeIn{from{opacity:0;transform:scale(0.8)}to{opacity:1;transform:scale(1)}}
      `}</style>

      {/* Skip */}
      <button onClick={e => { e.stopPropagation(); onDone() }} style={{
        position: 'absolute', top: 20, right: 20, background: 'none', border: 'none',
        color: theme.dark ? '#ffffff40' : `${a}35`, fontSize: 10, fontFamily: FP, letterSpacing: 4,
        cursor: 'pointer', zIndex: 10, textTransform: 'uppercase',
      } as React.CSSProperties}>SKIP</button>

      {/* ═══ CARTE LUXE ═══ */}
      <div style={{
        position: 'relative', width: 320, maxWidth: '85vw',
        animation: phase === 0 ? 'envFloat 4s ease-in-out infinite' : 'none',
        willChange: 'transform',
      }}>
        <div style={{ animation: 'envAppear 1.2s cubic-bezier(0.16,1,0.3,1) forwards' }}>
          <div style={{
            position: 'relative', width: '100%',
            background: `linear-gradient(170deg, ${es.bg} 0%, ${es.bgDark} 100%)`,
            borderRadius: 3,
            boxShadow: `0 40px 80px rgba(0,0,0,0.12), 0 16px 32px rgba(0,0,0,0.08), 0 0 0 0.5px ${a}15`,
            overflow: 'hidden',
            display: 'flex', flexDirection: 'column', alignItems: 'center',
            padding: '52px 36px 44px',
          }}>
            {/* Texture papier vergé */}
            <svg style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', opacity: 0.02, pointerEvents: 'none', mixBlendMode: 'multiply' }}>
              <filter id="envLuxPaper"><feTurbulence type="fractalNoise" baseFrequency="0.8" numOctaves="5" /><feComposite in="SourceGraphic" operator="in" /></filter>
              <rect width="100%" height="100%" filter="url(#envLuxPaper)" />
            </svg>

            {/* Filet doré intérieur */}
            <div style={{ position: 'absolute', inset: 10, borderRadius: 2, border: `0.5px solid ${a}15`, pointerEvents: 'none' }} />

            {/* Cadre ornemental SVG — en haut */}
            <svg width="200" height="30" viewBox="0 0 200 30" style={{ position: 'relative', zIndex: 2, opacity: 0.18, marginBottom: 20 }}>
              <path d="M20,15 Q30,4 50,12 Q65,4 80,12 Q100,2 120,12 Q135,4 150,12 Q170,4 180,15" fill="none" stroke={a} strokeWidth="0.6" strokeLinecap="round" />
              <path d="M40,18 Q55,10 70,16 Q85,10 100,15 Q115,10 130,16 Q145,10 160,18" fill="none" stroke={a} strokeWidth="0.4" strokeLinecap="round" />
              <circle cx="100" cy="8" r="1.5" fill={a} opacity="0.4" />
              <circle cx="60" cy="12" r="0.8" fill={a} opacity="0.3" />
              <circle cx="140" cy="12" r="0.8" fill={a} opacity="0.3" />
            </svg>

            {/* ── Prénoms décalés avec animation ── */}
            <div style={{ position: 'relative', zIndex: 2, width: '100%', marginBottom: 4 }}>
              {/* Premier prénom — décalé à droite */}
              <div style={{
                fontFamily: GV, fontSize: 44, color: txtMain, lineHeight: 1.1, letterSpacing: 2,
                textAlign: 'right', paddingRight: 16,
                animation: 'nameSlideL 1s cubic-bezier(0.16,1,0.3,1) 0.3s both',
              }}>
                {data.marie1Prenom || 'Prénom'}
              </div>

              {/* Ornement floral SVG entre les deux prénoms */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '10px 0', animation: 'ornFadeIn 0.8s ease 0.6s both' }}>
                <svg width="120" height="24" viewBox="0 0 120 24" style={{ opacity: 0.22 }}>
                  {/* Branche gauche */}
                  <path d="M10,12 Q20,6 35,10 Q42,8 50,12" fill="none" stroke={a} strokeWidth="0.7" strokeLinecap="round" />
                  <path d="M22,8 Q26,4 30,8" fill="none" stroke={a} strokeWidth="0.5" />
                  <path d="M18,14 Q22,18 26,14" fill="none" stroke={a} strokeWidth="0.5" />
                  <circle cx="35" cy="9" r="1" fill={a} opacity="0.4" />
                  {/* Centre — petite fleur */}
                  <ellipse cx="60" cy="12" rx="4" ry="3" fill="none" stroke={a} strokeWidth="0.6" />
                  <ellipse cx="60" cy="12" rx="2" ry="1.5" fill={a} opacity="0.15" />
                  <circle cx="60" cy="12" r="0.8" fill={a} opacity="0.4" />
                  {/* Branche droite */}
                  <path d="M110,12 Q100,6 85,10 Q78,8 70,12" fill="none" stroke={a} strokeWidth="0.7" strokeLinecap="round" />
                  <path d="M98,8 Q94,4 90,8" fill="none" stroke={a} strokeWidth="0.5" />
                  <path d="M102,14 Q98,18 94,14" fill="none" stroke={a} strokeWidth="0.5" />
                  <circle cx="85" cy="9" r="1" fill={a} opacity="0.4" />
                </svg>
              </div>

              {/* Deuxième prénom — décalé à gauche */}
              <div style={{
                fontFamily: GV, fontSize: 44, color: txtMain, lineHeight: 1.1, letterSpacing: 2,
                textAlign: 'left', paddingLeft: 16,
                animation: 'nameSlideR 1s cubic-bezier(0.16,1,0.3,1) 0.5s both',
              }}>
                {data.marie2Prenom || 'Prénom'}
              </div>
            </div>

            {/* ── Ligne séparatrice ── */}
            <div style={{ position: 'relative', zIndex: 2, width: 80, height: '0.5px', background: `linear-gradient(90deg, transparent, ${a}30, transparent)`, margin: '16px 0 18px' }} />

            {/* ── Phrase d'invitation ── */}
            <div style={{ position: 'relative', zIndex: 2, textAlign: 'center', maxWidth: 230 }}>
              <div style={{
                fontFamily: CG, fontStyle: 'italic', fontSize: 13.5, color: txtMain, opacity: 0.65,
                lineHeight: 1.7, letterSpacing: 0.3,
                animation: phase === 0 ? 'tapPulse 3s ease-in-out infinite' : 'none',
              }}>
                {locale === 'en'
                  ? 'are delighted to invite you to share in their joy'
                  : 'ont la joie de vous convier à célébrer leur union'}
              </div>
            </div>

            {/* ── Appuyez ── */}
            <div style={{
              fontFamily: FP, fontSize: 8.5, color: txtMain, opacity: 0.35,
              letterSpacing: 4, textTransform: 'uppercase', marginTop: 14,
            }}>
              {locale === 'en' ? 'Tap to open' : 'Appuyez pour ouvrir'}
            </div>

            {/* Cadre ornemental SVG — en bas */}
            <svg width="200" height="30" viewBox="0 0 200 30" style={{ position: 'relative', zIndex: 2, opacity: 0.18, marginTop: 16, transform: 'scaleY(-1)' }}>
              <path d="M20,15 Q30,4 50,12 Q65,4 80,12 Q100,2 120,12 Q135,4 150,12 Q170,4 180,15" fill="none" stroke={a} strokeWidth="0.6" strokeLinecap="round" />
              <path d="M40,18 Q55,10 70,16 Q85,10 100,15 Q115,10 130,16 Q145,10 160,18" fill="none" stroke={a} strokeWidth="0.4" strokeLinecap="round" />
              <circle cx="100" cy="8" r="1.5" fill={a} opacity="0.4" />
              <circle cx="60" cy="12" r="0.8" fill={a} opacity="0.3" />
              <circle cx="140" cy="12" r="0.8" fill={a} opacity="0.3" />
            </svg>
          </div>
        </div>
      </div>
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
            <div style={{ fontFamily: 'var(--font-great-vibes)', fontSize: 20, color: `${theme.accent}99`, margin: '4px 0' }}>&</div>
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
            <span style={{ fontFamily: 'var(--font-great-vibes)', fontSize: 22, color: theme.accent, opacity: 0.5 }}>&</span>
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
              {data.customLogoUrl ? <CustomLogo url={data.customLogoUrl} scale={data.customLogoSize} color={data.customLogoColor} size={90} bgColor={theme.fond} /> : <MonogramByStyle initial1={i1} initial2={i2} color="white" size={90} style={data.monogrammeStyle || 'cercle'} />}
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

// ── 🌹 PÉTALES PERMANENTS (overlay sur la carte) ─────────────────────────────
function FloatingPetals({ accent }: { accent: string }) {
  const petals = useMemo(() => Array.from({ length: 12 }, (_, i) => ({
    id: i,
    left: Math.random() * 100,
    delay: Math.random() * 8,
    duration: 6 + Math.random() * 6,
    size: 8 + Math.random() * 10,
    rotation: Math.random() * 360,
    opacity: 0.15 + Math.random() * 0.2,
  })), [])
  return (
    <div style={{ position: 'fixed', inset: 0, pointerEvents: 'none', zIndex: 50, overflow: 'hidden' }}>
      <style>{`
        @keyframes floatPetal{0%{transform:translateY(-20px) rotate(0deg) translateX(0);opacity:0}5%{opacity:1}95%{opacity:0.5}100%{transform:translateY(105vh) rotate(540deg) translateX(40px);opacity:0}}
      `}</style>
      {petals.map(p => (
        <div key={p.id} style={{ position: 'absolute', left: `${p.left}%`, top: -20, animation: `floatPetal ${p.duration}s ease-in-out ${p.delay}s infinite` }}>
          <svg width={p.size} height={p.size * 1.4} viewBox="0 0 16 22">
            <ellipse cx="8" cy="11" rx="6" ry="10" fill={accent} opacity={p.opacity} transform={`rotate(${p.rotation} 8 11)`} />
            <ellipse cx="8" cy="11" rx="3.5" ry="7" fill={accent} opacity={p.opacity * 0.5} transform={`rotate(${p.rotation + 25} 8 11)`} />
          </svg>
        </div>
      ))}
    </div>
  )
}

// ── 🌹 PÉTALES (animation d'ouverture) ──────────────────────────────────────
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
        <div style={{ background: 'linear-gradient(135deg, #faf5ea 0%, #f5e6c8 50%, #faf5ea 100%)', overflow: 'hidden', maxHeight: ouvert ? 600 : 80, animation: ouvert ? 'derouler 1.8s cubic-bezier(0.22,1,0.36,1) forwards' : 'none', boxShadow: '6px 0 16px rgba(0,0,0,0.4), -6px 0 16px rgba(0,0,0,0.4)' }}>
          <div style={{ padding: '28px 32px', textAlign: 'center' }}>
            {data.mariageJuif && (
              <div style={{ fontFamily: 'serif', fontSize: 15, color: theme.accent, direction: 'rtl', marginBottom: 16, animation: 'parchTextIn 0.6s ease 0.8s forwards', opacity: 0 }}>בס״ד</div>
            )}
            <div style={{ fontFamily: 'var(--font-cormorant-garamond)', fontStyle: 'italic', fontSize: 11, color: '#8a6040', letterSpacing: 4, textTransform: 'uppercase', marginBottom: 16, animation: 'parchTextIn 0.6s ease 1s forwards', opacity: 0 }}>
              Invitation
            </div>
            <div style={{ width: 50, height: '0.5px', background: theme.accent, margin: '0 auto 20px', animation: 'parchTextIn 0.4s ease 1.1s forwards', opacity: 0 }} />
            <div style={{ animation: 'parchTextIn 0.6s ease 1.2s forwards', opacity: 0, marginBottom: 16 }}>
              {data.customLogoUrl ? <CustomLogo url={data.customLogoUrl} scale={data.customLogoSize} color={data.customLogoColor} size={60} bgColor={theme.fond} /> : <MonogramByStyle initial1={(data.marie1Prenom || 'A')[0].toUpperCase()} initial2={(data.marie2Prenom || 'B')[0].toUpperCase()} color={theme.accent} size={60} style={data.monogrammeStyle || 'cercle'} />}
            </div>
            <div style={{ fontFamily: 'var(--font-great-vibes)', fontSize: 52, color: theme.accent, lineHeight: 1.1, animation: 'parchTextIn 0.8s ease 1.4s forwards', opacity: 0 }}>
              {data.marie1Prenom}
            </div>
            <div style={{ fontFamily: 'var(--font-great-vibes)', fontSize: 22, color: '#8a6040', animation: 'parchTextIn 0.5s ease 1.7s forwards', opacity: 0 }}>&</div>
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
                Découvrir votre invitation ✦
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
  const anim = data.introAnimation || 'enveloppe'
  if (anim === 'none') { onDone(); return null }
  if (anim === 'petales')   return <AnimPetales   data={data} theme={theme} onDone={onDone} />
  if (anim === 'parchemin') return <AnimParchemin data={data} theme={theme} onDone={onDone} />
  return <AnimEnveloppe data={data} theme={theme} onDone={onDone} />
}

// ── Carton-réponse intégré (inline, pas de popup) ─────────────────────────────
function InlineRSVP({ ceremonies, accent, textColor, shareId, mariee1, mariee2, rsvpText, rsvpDeadline, locale }: {
  ceremonies: Ceremony[]; accent: string; textColor: string; shareId: string | null; mariee1: string; mariee2: string; rsvpText?: string; rsvpDeadline?: string; locale: string
}) {
  const FP = 'var(--font-playfair-display)'
  const FC = 'var(--font-cormorant-garamond)'
  const GV = 'var(--font-great-vibes)'

  const getCeremonyName = (c: Ceremony) => {
    if (c.type === 'Autre') return c.customName || 'Événement'
    const names: Record<string, string> = { 'Cérémonie religieuse / Houppa': 'La Houppa', 'Mairie': 'La Mairie', 'Shabbat Hatan': 'Le Shabbat', 'Henné': 'Le Henné', 'Cocktail': 'Le Cocktail', 'Soirée': 'La Soirée', 'Boat Party': 'Boat Party', 'Beach Party': 'Beach Party' }
    return names[c.type] || c.type
  }

  const [nom, setNom] = useState('')
  const [reponses, setReponses] = useState<Record<number, boolean | null>>({})
  const [nbPersonnes, setNbPersonnes] = useState<Record<number, number>>({})
  const [accompagnants, setAccompagnants] = useState<Record<number, string[]>>({})
  const [message, setMessage] = useState('')
  const [sending, setSending] = useState(false)
  const [sent, setSent] = useState(false)
  const [error, setError] = useState('')

  const togglePresent = (idx: number, present: boolean) => {
    setReponses(prev => ({ ...prev, [idx]: prev[idx] === present ? null : present }))
    if (present && !nbPersonnes[idx]) setNbPersonnes(prev => ({ ...prev, [idx]: 1 }))
  }

  const send = async () => {
    if (!nom.trim()) { setError(locale === 'en' ? 'Please enter your name' : 'Veuillez entrer votre nom'); return }
    setSending(true)
    setError('')
    try {
      const entry = {
        nom,
        reponses: ceremonies.map((c, i) => ({
          ceremonie: getCeremonyName(c),
          ceremonieIdx: i,
          date: c.date || '',
          present: reponses[i] ?? false,
          nbPersonnes: reponses[i] ? (nbPersonnes[i] || 1) : 0,
          accompagnants: reponses[i] ? (accompagnants[i] || []).filter(Boolean) : [],
        })),
        message: message || undefined,
        sentAt: new Date().toISOString(),
        shareId: shareId ?? undefined,
        mariee1,
        mariee2,
      }
      await fetch('/api/rsvp', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(entry) })
      if (shareId) try { localStorage.setItem(`lovit_rsvp_sent_${shareId}`, new Date().toISOString()) } catch { /* */ }
      setSent(true)
    } catch { setError(locale === 'en' ? 'Error sending' : 'Erreur lors de l\'envoi') }
    finally { setSending(false) }
  }

  if (sent) {
    return (
      <div style={{ textAlign: 'center', padding: '48px 24px' }}>
        <div style={{ fontSize: 48, marginBottom: 16 }}>💕</div>
        <div style={{ fontFamily: GV, fontSize: 32, color: accent, marginBottom: 12 }}>Merci {nom.split(' ')[0]} !</div>
        <p style={{ fontFamily: FC, fontStyle: 'italic', fontSize: 15, color: textColor, opacity: 0.7 }}>
          {locale === 'en' ? 'Your response has been sent to the couple.' : 'Votre réponse a bien été transmise aux mariés.'}
        </p>
      </div>
    )
  }

  const deadlineText = rsvpDeadline ? (() => {
    const dl = new Date(rsvpDeadline + 'T12:00:00')
    const fmt = new Intl.DateTimeFormat(locale === 'en' ? 'en-US' : 'fr-FR', { day: 'numeric', month: 'long', year: 'numeric' }).format(dl)
    return locale === 'en' ? `Please respond before ${fmt}.` : `Merci de répondre avant le ${fmt}.`
  })() : ''

  return (
    <div style={{ maxWidth: 480, margin: '0 auto', padding: '0 16px' }}>
      {/* Titre */}
      <div style={{ textAlign: 'center', marginBottom: 24 }}>
        <div style={{ fontFamily: FP, fontSize: 'clamp(12px, 2.5vw, 16px)', fontWeight: 400, letterSpacing: '0.35em', textTransform: 'uppercase', color: accent, marginBottom: 12 }}>
          {locale === 'en' ? 'RSVP' : 'CARTON-RÉPONSE'}
        </div>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10, marginBottom: 16 }}>
          <div style={{ width: 40, height: 0.5, background: accent, opacity: 0.3 }} />
          <span style={{ color: accent, fontSize: 10, opacity: 0.4 }}>✦</span>
          <div style={{ width: 40, height: 0.5, background: accent, opacity: 0.3 }} />
        </div>
        <div style={{ fontFamily: GV, fontSize: 'clamp(26px, 7vw, 36px)', color: accent, marginBottom: 16, lineHeight: 1.3 }}>
          {locale === 'en' ? "It's your turn to say yes!" : 'À votre tour de nous dire Oui\u00A0!'}
        </div>
        <p style={{ fontFamily: FC, fontStyle: 'italic', fontSize: 15, color: textColor, lineHeight: 1.7, opacity: 0.8, margin: 0 }}>
          {rsvpText || (locale === 'en' ? 'Your presence would mean the world to us.' : 'Votre présence à nos côtés serait un immense bonheur.')}
        </p>
        {deadlineText && <p style={{ fontFamily: FC, fontSize: 12, color: accent, marginTop: 8 }}>{deadlineText}</p>}
      </div>

      {/* Nom */}
      <div style={{ marginBottom: 24 }}>
        <label style={{ fontFamily: FP, fontSize: 11, letterSpacing: 2, textTransform: 'uppercase', color: accent, display: 'block', marginBottom: 6 }}>
          {locale === 'en' ? 'Your name' : 'Votre nom'}
        </label>
        <input value={nom} onChange={e => setNom(e.target.value)} placeholder={locale === 'en' ? 'First and last name' : 'Prénom et nom'}
          style={{ width: '100%', padding: '12px 16px', borderRadius: 8, border: `1.5px solid ${accent}33`, background: 'white', fontFamily: FC, fontSize: 15, color: textColor, outline: 'none', boxSizing: 'border-box' }} />
      </div>

      {/* Cérémonies */}
      {ceremonies.map((c, idx) => {
        const present = reponses[idx]
        const nb = nbPersonnes[idx] || 1
        const accs = accompagnants[idx] || []
        return (
          <div key={idx} style={{ marginBottom: 24, paddingBottom: 24, borderBottom: idx < ceremonies.length - 1 ? `1px solid ${accent}15` : 'none' }}>
            <div style={{ fontFamily: FP, fontSize: 16, color: textColor, fontWeight: 600, marginBottom: 12 }}>{getCeremonyName(c)}</div>
            <div style={{ display: 'flex', gap: 8 }}>
              <button type="button" onClick={() => togglePresent(idx, true)} style={{
                flex: 1, padding: '14px 0', borderRadius: 4, fontFamily: 'var(--font-cormorant-garamond)', fontSize: 13, fontWeight: 500, letterSpacing: '0.1em', textTransform: 'uppercase', cursor: 'pointer',
                border: `1.5px solid ${present === true ? accent : `${accent}33`}`,
                background: present === true ? accent : 'white',
                color: present === true ? 'white' : accent,
                transition: 'all 0.3s ease',
              }}>
                {locale === 'en' ? 'Will attend' : 'Présent'}
              </button>
              <button type="button" onClick={() => togglePresent(idx, false)} style={{
                flex: 1, padding: '14px 0', borderRadius: 4, fontFamily: 'var(--font-cormorant-garamond)', fontSize: 13, fontWeight: 500, letterSpacing: '0.1em', textTransform: 'uppercase', cursor: 'pointer',
                border: `1.5px solid ${present === false ? '#d45050' : `${accent}33`}`,
                background: present === false ? '#d45050' : 'white',
                color: present === false ? 'white' : '#d45050',
                transition: 'all 0.3s ease',
              }}>
                {locale === 'en' ? 'Absent' : 'Absent'}
              </button>
            </div>

            {/* Nombre de personnes + accompagnants (si présent) */}
            {present === true && (
              <div style={{ marginTop: 14, padding: '14px 16px', background: `${accent}08`, borderRadius: 10 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: accs.length > 0 || nb > 1 ? 12 : 0 }}>
                  <span style={{ fontFamily: FC, fontSize: 13, color: textColor }}>{locale === 'en' ? 'Guests:' : 'Personnes :'}</span>
                  <button type="button" onClick={() => setNbPersonnes(p => ({ ...p, [idx]: Math.max(1, nb - 1) }))} style={{ width: 28, height: 28, borderRadius: 9999, border: `1px solid ${accent}44`, background: 'white', color: accent, fontSize: 16, fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>−</button>
                  <span style={{ fontFamily: FP, fontSize: 16, fontWeight: 700, color: accent, minWidth: 20, textAlign: 'center' }}>{nb}</span>
                  <button type="button" onClick={() => setNbPersonnes(p => ({ ...p, [idx]: nb + 1 }))} style={{ width: 28, height: 28, borderRadius: 9999, border: `1px solid ${accent}44`, background: 'white', color: accent, fontSize: 16, fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>+</button>
                </div>
                {nb > 1 && Array.from({ length: nb - 1 }).map((_, j) => (
                  <input key={j} value={accs[j] || ''} onChange={e => {
                    const u = [...accs]; u[j] = e.target.value; setAccompagnants(p => ({ ...p, [idx]: u }))
                  }} placeholder={`${locale === 'en' ? 'Guest' : 'Accompagnant'} ${j + 2}`}
                  style={{ width: '100%', padding: '8px 12px', borderRadius: 6, border: `1px solid ${accent}22`, fontFamily: FC, fontSize: 13, color: textColor, marginBottom: 6, boxSizing: 'border-box', outline: 'none' }} />
                ))}
              </div>
            )}
          </div>
        )
      })}

      {/* Message */}
      <div style={{ marginBottom: 24 }}>
        <label style={{ fontFamily: FP, fontSize: 11, letterSpacing: 2, textTransform: 'uppercase', color: accent, display: 'block', marginBottom: 6 }}>
          {locale === 'en' ? 'A word for the couple' : 'Un mot pour les mariés'} <span style={{ opacity: 0.5 }}>(optionnel)</span>
        </label>
        <textarea value={message} onChange={e => e.target.value.length <= 300 && setMessage(e.target.value)} placeholder={locale === 'en' ? 'With all our love...' : 'Avec toute notre affection…'} rows={3}
          style={{ width: '100%', padding: '12px 16px', borderRadius: 8, border: `1.5px solid ${accent}33`, background: 'white', fontFamily: FC, fontStyle: 'italic', fontSize: 14, color: textColor, resize: 'vertical', outline: 'none', boxSizing: 'border-box' }} />
      </div>

      {/* Erreur */}
      {error && <p style={{ color: '#d45050', fontSize: 13, textAlign: 'center', marginBottom: 12 }}>{error}</p>}

      {/* Bouton envoyer */}
      <div style={{ textAlign: 'center' }}>
        <button type="button" onClick={send} disabled={sending} style={{
          fontFamily: 'var(--font-cormorant-garamond)', fontSize: 14, fontWeight: 500, letterSpacing: '0.25em', textTransform: 'uppercase',
          padding: '16px 48px', borderRadius: 4, border: `1px solid ${accent}`, cursor: sending ? 'not-allowed' : 'pointer',
          background: accent, color: 'white',
          boxShadow: `0 0 0 4px transparent`, opacity: sending ? 0.7 : 1,
          transition: 'all 0.4s ease',
        }}>
          {sending ? '...' : (locale === 'en' ? 'SEND MY RESPONSE' : 'ENVOYER MA RÉPONSE')}
        </button>
      </div>
    </div>
  )
}

// ── Illustration éditable (redimensionner, déplacer, changer, retirer) ───────
function EditableIllustration({ url, size, offsetX, offsetY, editable, accent, ceremonyType, onChangeSize, onChangeOffsetX, onChangeOffsetY, onChangeUrl, onRemove, darkBg, isPhoto }: {
  url: string; size: number; offsetX: number; offsetY: number; editable: boolean; accent: string; ceremonyType: string
  onChangeSize: (s: number) => void; onChangeOffsetX: (x: number) => void; onChangeOffsetY: (y: number) => void; onChangeUrl: (url: string) => void; onRemove: () => void
  darkBg?: boolean; isPhoto?: boolean
}) {
  const [showPicker, setShowPicker] = useState(false)
  // Position locale pendant le drag (pas de re-render à chaque pixel)
  const [localPos, setLocalPos] = useState<{ x: number; y: number } | null>(null)
  const draggingRef = useRef(false)
  const dragStart = useRef({ x: 0, y: 0 })
  const dragOffset = useRef({ x: 0, y: 0 })
  const typeToCategory: Record<string, VisualCategory> = {
    'Mairie': 'mairie', 'Cérémonie religieuse / Houppa': 'houppa', 'Shabbat Hatan': 'shabbat',
    'Henné': 'couples', 'Cocktail': 'couples', 'Soirée': 'couples', 'Boat Party': 'beach', 'Beach Party': 'beach', 'RSVP': 'rsvp', 'Autre': 'couples',
  }
  const category = typeToCategory[ceremonyType] || 'couples'
  const w = Math.max(20, Math.min(400, size))
  const cx = localPos?.x ?? offsetX
  const cy = localPos?.y ?? offsetY

  useEffect(() => {
    const mm = (e: MouseEvent) => {
      if (!draggingRef.current) return
      e.preventDefault()
      const nx = Math.max(-150, Math.min(150, dragOffset.current.x + e.clientX - dragStart.current.x))
      const ny = Math.max(-200, Math.min(200, dragOffset.current.y + e.clientY - dragStart.current.y))
      setLocalPos({ x: nx, y: ny })
    }
    const tm = (e: TouchEvent) => {
      if (!draggingRef.current) return
      const nx = Math.max(-150, Math.min(150, dragOffset.current.x + e.touches[0].clientX - dragStart.current.x))
      const ny = Math.max(-200, Math.min(200, dragOffset.current.y + e.touches[0].clientY - dragStart.current.y))
      setLocalPos({ x: nx, y: ny })
    }
    const up = () => {
      if (!draggingRef.current) return
      draggingRef.current = false
      setLocalPos(p => { if (p) { onChangeOffsetX(p.x); onChangeOffsetY(p.y) }; return null })
    }
    window.addEventListener('mousemove', mm)
    window.addEventListener('mouseup', up)
    window.addEventListener('touchmove', tm, { passive: false })
    window.addEventListener('touchend', up)
    return () => { window.removeEventListener('mousemove', mm); window.removeEventListener('mouseup', up); window.removeEventListener('touchmove', tm); window.removeEventListener('touchend', up) }
  }, [onChangeOffsetX, onChangeOffsetY])

  const startDrag = (ex: number, ey: number) => {
    if (!editable) return
    draggingRef.current = true
    dragStart.current = { x: ex, y: ey }
    dragOffset.current = { x: offsetX, y: offsetY }
  }

  return (
    <div style={{ textAlign: 'center', position: 'relative', margin: '0 0 4px', padding: 0, overflow: isPhoto ? 'hidden' : 'visible', lineHeight: 0 }}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={url} alt="" draggable={false}
        onMouseDown={editable ? (e) => { e.preventDefault(); startDrag(e.clientX, e.clientY) } : undefined}
        onTouchStart={editable ? (e) => { startDrag(e.touches[0].clientX, e.touches[0].clientY) } : undefined}
        style={{
          width: isPhoto ? '100%' : `${w}%`, maxHeight: isPhoto ? 280 : undefined,
          objectFit: isPhoto ? 'cover' : 'contain', display: 'inline-block',
          borderRadius: isPhoto ? 10 : 0,
          boxShadow: isPhoto ? '0 4px 20px rgba(0,0,0,0.12)' : 'none',
          mixBlendMode: isPhoto ? undefined : (darkBg ? undefined : 'multiply'),
          WebkitMaskImage: isPhoto ? undefined : 'radial-gradient(ellipse 88% 85% at 50% 50%, black 40%, transparent 100%)',
          maskImage: isPhoto ? undefined : 'radial-gradient(ellipse 88% 85% at 50% 50%, black 40%, transparent 100%)',
          verticalAlign: 'middle',
          transform: `translate(${cx}px, ${cy}px)`,
          cursor: editable ? (draggingRef.current ? 'grabbing' : 'grab') : 'default',
          transition: draggingRef.current ? 'none' : 'width 0.2s',
          userSelect: 'none', margin: 0, padding: 0,
        }}
      />
      {editable && !showPicker && (
        <div onPointerDown={e => e.stopPropagation()} onMouseDown={e => e.stopPropagation()} onTouchStart={e => e.stopPropagation()} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 5, marginTop: 2, lineHeight: 1, position: 'relative', zIndex: 10 }}>
          <button type="button" onClick={(e) => { e.stopPropagation(); onChangeSize(Math.max(20, w - 10)) }} style={{
            ...BTN, width: 28, height: 28, borderRadius: '50%', border: `2px solid ${accent}`,
            background: 'white', color: accent, fontSize: 18, lineHeight: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 0, cursor: 'pointer',
          }}>−</button>
          <span style={{ fontSize: 10, color: accent, fontWeight: 600, minWidth: 30, textAlign: 'center' }}>{w}%</span>
          <button type="button" onClick={(e) => { e.stopPropagation(); onChangeSize(Math.min(400, w + 10)) }} style={{
            ...BTN, width: 28, height: 28, borderRadius: '50%', border: `2px solid ${accent}`,
            background: 'white', color: accent, fontSize: 18, lineHeight: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 0, cursor: 'pointer',
          }}>+</button>
          <button type="button" onClick={() => setShowPicker(true)} style={{
            ...BTN, padding: '3px 8px', borderRadius: 9999, border: `1px solid ${accent}30`,
            background: 'white', color: accent, fontSize: 9, fontWeight: 600, cursor: 'pointer',
          }}>Changer</button>
          <button type="button" onClick={() => onRemove()} style={{
            ...BTN, padding: '3px 8px', borderRadius: 9999, border: '1px solid #d4505030',
            background: 'white', color: '#d45050', fontSize: 9, fontWeight: 600, cursor: 'pointer',
          }}>Retirer</button>
        </div>
      )}
      {editable && showPicker && (
        <div style={{ background: 'white', borderRadius: 12, border: '1px solid #e8e0d8', padding: '12px', marginTop: 4, boxShadow: '0 4px 16px rgba(0,0,0,0.06)', textAlign: 'left' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
            <span style={{ fontSize: 11, fontWeight: 600, color: '#3a3330' }}>Choisir une illustration</span>
            <button type="button" onClick={() => setShowPicker(false)} style={{ ...BTN, background: '#f5f3f0', border: 'none', borderRadius: 9999, width: 24, height: 24, fontSize: 12, color: '#9a928a', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 0 }}>✕</button>
          </div>
          {/* Upload custom */}
          <label style={{
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
            padding: '10px', marginBottom: 8, borderRadius: 8,
            border: `1.5px dashed ${accent}40`, background: `${accent}08`,
            cursor: 'pointer', fontSize: 11, fontWeight: 600, color: accent,
          }}>
            📷 Importer votre image
            <input type="file" accept="image/*" hidden onChange={async e => {
              const file = e.target.files?.[0]
              if (!file) return
              if (file.size > 5 * 1024 * 1024) { showToast('Max 5 Mo', 'error'); return }
              try {
                const fd = new (globalThis.FormData)()
                fd.append('file', file)
                const res = await fetch('/api/upload', { method: 'POST', body: fd })
                const json = await res.json()
                if (json.url) { onChangeUrl(json.url); setShowPicker(false) }
              } catch { showToast('Erreur upload', 'error') }
            }} />
          </label>
          <VisualPicker category={category} onSelect={(id) => {
            const visual = visualById(id)
            if (visual) { onChangeUrl(visual.url); setShowPicker(false) }
          }} accent={accent} />
        </div>
      )}
    </div>
  )
}

// ── Picker illustration RSVP ─────────────────────────────────────────────────
function RsvpIllustrationPicker({ accent, onSelect }: { accent: string; onSelect: (url: string) => void }) {
  const [open, setOpen] = useState(false)
  if (!open) {
    return (
      <div style={{ marginTop: 4 }}>
        <button type="button" onClick={() => setOpen(true)} style={{
          ...BTN, padding: '3px 10px', borderRadius: 9999, border: `1px solid ${accent}30`,
          background: 'white', color: accent, fontSize: 9, fontWeight: 600, cursor: 'pointer',
        }}>Changer l&apos;illustration</button>
      </div>
    )
  }
  return (
    <div style={{ background: 'white', borderRadius: 12, border: '1px solid #e8e0d8', padding: '12px', marginTop: 8, boxShadow: '0 4px 16px rgba(0,0,0,0.06)' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
        <span style={{ fontSize: 11, fontWeight: 600, color: '#3a3330' }}>Choisir une illustration</span>
        <button type="button" onClick={() => setOpen(false)} style={{ ...BTN, background: '#f5f3f0', border: 'none', borderRadius: 9999, width: 24, height: 24, fontSize: 12, color: '#9a928a', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 0 }}>✕</button>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8 }}>
        {ILLUSTRATIONS_RSVP.map(illu => (
          <button key={illu.id} type="button" onClick={() => { onSelect(illu.url); setOpen(false) }} style={{
            ...BTN, padding: 4, borderRadius: 8, border: '2px solid #e8e0d8', background: 'white', cursor: 'pointer',
          }}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={illu.url.replace('/upload/', '/upload/w_200,c_fit,q_auto/')} alt="" loading="lazy" style={{ width: '100%', height: 'auto', borderRadius: 5, display: 'block', aspectRatio: '1', objectFit: 'contain' }} />
          </button>
        ))}
      </div>
    </div>
  )
}

// ── Zone d'ajout d'illustration entre les cérémonies ─────────────────────────
function IllustrationAdder({ ceremonyType, accent, onSelect }: { ceremonyType: string; accent: string; onSelect: (url: string) => void }) {
  const [open, setOpen] = useState(false)
  const typeToCategory: Record<string, VisualCategory> = {
    'Mairie': 'mairie', 'Cérémonie religieuse / Houppa': 'houppa', 'Shabbat Hatan': 'shabbat',
    'Henné': 'couples', 'Cocktail': 'couples', 'Soirée': 'couples', 'Boat Party': 'beach', 'Beach Party': 'beach', 'RSVP': 'rsvp', 'Autre': 'couples',
  }
  const category = typeToCategory[ceremonyType] || 'couples'

  if (!open) {
    return (
      <div style={{ maxWidth: 480, margin: '0 auto', padding: '16px 24px' }}>
        <button type="button" onClick={() => setOpen(true)} style={{
          ...BTN, width: '100%', padding: '20px 16px', borderRadius: 14,
          border: `2px dashed ${accent}40`, background: `${accent}08`,
          display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8,
          cursor: 'pointer', transition: 'all 0.2s',
        }}>
          <div style={{ width: 40, height: 40, borderRadius: '50%', background: `${accent}15`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20, color: accent }}>+</div>
          <span style={{ fontFamily: 'var(--font-playfair-display)', fontSize: 12, fontWeight: 600, color: accent, letterSpacing: '0.05em' }}>
            Ajouter une illustration ici
          </span>
          <span style={{ fontFamily: 'var(--font-cormorant-garamond)', fontStyle: 'italic', fontSize: 11, color: '#9a928a' }}>
            Parcourez notre bibliothèque d&apos;aquarelles
          </span>
        </button>
      </div>
    )
  }

  return (
    <div style={{ maxWidth: 520, margin: '0 auto', padding: '16px 24px' }}>
      <div style={{ background: 'white', borderRadius: 16, border: '1px solid #e8e0d8', padding: '20px 16px', boxShadow: '0 4px 20px rgba(0,0,0,0.06)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
          <div>
            <div style={{ fontFamily: 'var(--font-playfair-display)', fontSize: 13, fontWeight: 600, color: '#3a3330' }}>Choisissez une illustration</div>
            <div style={{ fontFamily: 'var(--font-cormorant-garamond)', fontStyle: 'italic', fontSize: 11, color: '#9a928a', marginTop: 2 }}>Cliquez sur une image pour l&apos;ajouter</div>
          </div>
          <button type="button" onClick={() => setOpen(false)} style={{ ...BTN, background: '#f5f3f0', border: 'none', borderRadius: 9999, width: 28, height: 28, fontSize: 14, color: '#9a928a', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 0 }}>✕</button>
        </div>
        {/* Upload custom */}
        <label style={{
          display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
          padding: '12px 16px', marginBottom: 12, borderRadius: 10,
          border: `2px dashed ${accent}40`, background: `${accent}08`,
          cursor: 'pointer', fontSize: 12, fontWeight: 600, color: accent,
          fontFamily: 'var(--font-playfair-display)',
        }}>
          📷 Importer votre propre image
          <input type="file" accept="image/*" hidden onChange={async e => {
            const file = e.target.files?.[0]
            if (!file) return
            if (file.size > 5 * 1024 * 1024) { showToast('Fichier trop volumineux (max 5 Mo)', 'error'); return }
            try {
              const fd = new (globalThis.FormData)()
              fd.append('file', file)
              const res = await fetch('/api/upload', { method: 'POST', body: fd })
              const json = await res.json()
              if (json.url) { onSelect(json.url); setOpen(false) }
            } catch { showToast('Erreur upload', 'error') }
          }} />
        </label>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
          <div style={{ flex: 1, height: 1, background: '#e8e0d8' }} />
          <span style={{ fontSize: 10, color: '#9a928a', fontStyle: 'italic' }}>ou choisissez dans notre bibliothèque</span>
          <div style={{ flex: 1, height: 1, background: '#e8e0d8' }} />
        </div>
        <VisualPicker
          category={category}
          onSelect={(id) => {
            const visual = visualById(id)
            if (visual) {
              onSelect(visual.url)
              setOpen(false)
            }
          }}
          accent={accent}
        />
      </div>
    </div>
  )
}

// ── Rendu texte avec **gras** (markdown simple) ──
function renderRichText(text: string) {
  // Sépare les lignes, puis dans chaque ligne gère **gras**
  return text.split('\n').map((line, i) => {
    const parts = line.split(/(\*\*[^*]+\*\*)/)
    return (
      <React.Fragment key={i}>
        {i > 0 && <br />}
        {parts.map((part, j) => {
          if (part.startsWith('**') && part.endsWith('**')) {
            return <strong key={j}>{part.slice(2, -2)}</strong>
          }
          return <React.Fragment key={j}>{part}</React.Fragment>
        })}
      </React.Fragment>
    )
  })
}

// ── Composant d'édition inline — clic pour modifier le texte directement ──
// Supporte **gras** : entourez un mot de ** pour le mettre en gras
// Toolbar flottant : couleur, police, taille, édition texte
const INLINE_EDIT_COLORS = DRAG_COLORS.filter(c => c) // toutes les couleurs (sans vide)
const INLINE_EDIT_FONTS = DRAG_FONTS

function InlineEdit({ value, defaultValue, onChange, editable, style, onStyleChange }: {
  value: string; defaultValue: string; onChange: (v: string) => void; editable: boolean
  style?: React.CSSProperties
  onStyleChange?: (patch: { color?: string; fontFamily?: string; fontSize?: string; textAlign?: string; letterSpacing?: string; fontWeight?: string; fontStyle?: string }) => void
}) {
  const ref = useRef<HTMLDivElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const toolbarRef = useRef<HTMLDivElement>(null)
  const display = value || defaultValue
  const [editing, setEditing] = useState(false)
  const [selected, setSelected] = useState(false)
  const [showColors, setShowColors] = useState(false)
  const [showFonts, setShowFonts] = useState(false)
  const [toolbarPos, setToolbarPos] = useState<{ top: number; left: number } | null>(null)

  // Recalculate toolbar fixed position when selected
  useEffect(() => {
    if (!selected || !containerRef.current) { setToolbarPos(null); return }
    const update = () => {
      const rect = containerRef.current?.getBoundingClientRect()
      if (rect) setToolbarPos({ top: rect.top, left: rect.left + rect.width / 2 })
    }
    update()
    window.addEventListener('scroll', update, true)
    window.addEventListener('resize', update)
    return () => { window.removeEventListener('scroll', update, true); window.removeEventListener('resize', update) }
  }, [selected, showColors, showFonts])

  // Unique class to override DraggableElement's !important styles
  const uid = useId().replace(/:/g, '_')
  const ieCls = `ie${uid}`
  const hasOverrides = !!(style?.color || style?.fontFamily || style?.fontSize || style?.fontWeight || style?.fontStyle)
  const ieStyleTag = hasOverrides ? (
    <style>{`
      .${ieCls} {
        ${style?.color ? `color: ${style.color} !important;` : ''}
        ${style?.fontFamily ? `font-family: ${style.fontFamily} !important;` : ''}
        ${typeof style?.fontSize === 'number' ? `font-size: ${style.fontSize}px !important;` : typeof style?.fontSize === 'string' ? `font-size: ${style.fontSize} !important;` : ''}
        ${style?.fontWeight ? `font-weight: ${style.fontWeight} !important;` : ''}
        ${style?.fontStyle === 'italic' || style?.fontStyle === 'normal' ? `font-style: ${style.fontStyle} !important;` : ''}
      }
    `}</style>
  ) : null

  // Close toolbar on outside click
  useEffect(() => {
    if (!selected) return
    const close = (e: PointerEvent) => {
      if (containerRef.current?.contains(e.target as Node)) return
      setSelected(false)
      setShowColors(false)
      setShowFonts(false)
    }
    const timer = setTimeout(() => document.addEventListener('pointerdown', close), 10)
    return () => { clearTimeout(timer); document.removeEventListener('pointerdown', close) }
  }, [selected])

  // Current style values for highlighting active selections
  const currentColor = style?.color ?? ''
  const currentFont = style?.fontFamily ?? ''
  // Parser le fontSize — gère number, "16px", "16", et "clamp(14px,4vw,22px)" (prend la valeur du milieu ou la première)
  const currentSize = (() => {
    const fs = style?.fontSize
    if (typeof fs === 'number') return fs
    if (typeof fs !== 'string') return 0
    // clamp(min, preferred, max) → extraire la première valeur px
    const clampMatch = fs.match(/clamp\((\d+)/)
    if (clampMatch) return parseInt(clampMatch[1], 10)
    const n = parseInt(fs, 10)
    return isNaN(n) ? 0 : n
  })()

  if (!editable) {
    return <div className={ieCls} style={style}>{ieStyleTag}{renderRichText(display)}</div>
  }

  if (!editing) {
    return (
      <div
        ref={containerRef}
        className={ieCls}
        style={{ ...style, cursor: 'text', position: 'relative' }}
        onClick={(e) => {
          e.stopPropagation()
          e.preventDefault()
          if (!selected) {
            setSelected(true)
          }
        }}
        onMouseDown={(e) => e.stopPropagation()}
        onTouchStart={(e) => e.stopPropagation()}
      >
        {ieStyleTag}
        {renderRichText(display)}
        {/* Pencil badge — always visible in edit mode */}
        {!selected && (
          <span style={{ position: 'absolute', top: -8, right: -8, fontSize: 12, background: 'white', borderRadius: '50%', padding: 2, boxShadow: '0 1px 4px rgba(0,0,0,0.15)' }}>✏️</span>
        )}
        {/* Floating style toolbar — rendered via portal to escape overflow:hidden */}
        {selected && toolbarPos && typeof document !== 'undefined' && createPortal(
          <div
            ref={toolbarRef}
            onPointerDown={(e) => e.stopPropagation()}
            onMouseDown={(e) => e.stopPropagation()}
            onTouchStart={(e) => e.stopPropagation()}
            style={{
              position: 'fixed', top: toolbarPos.top - 6, left: toolbarPos.left, transform: 'translate(-50%, -100%)',
              zIndex: 9999, background: 'white', borderRadius: 10,
              padding: '6px 8px', boxShadow: '0 4px 20px rgba(0,0,0,0.18)',
              border: '1px solid #e0d5c8', minWidth: 180, maxWidth: 'calc(100vw - 16px)',
            }}
          >
            {/* Main toolbar row */}
            <div style={{ display: 'flex', gap: 3, alignItems: 'center', justifyContent: 'center' }}>
              {/* Size controls */}
              <button type="button" onClick={() => onStyleChange?.({ fontSize: `${Math.max(8, (currentSize || 14) - 1)}` })} style={{ ...BTN, width: 22, height: 22, borderRadius: 4, border: 'none', background: '#f5f0e8', color: '#C9A84C', fontSize: 14, fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 0 }}>−</button>
              <div style={{ fontSize: 9, color: '#8a7e72', display: 'flex', alignItems: 'center', padding: '0 2px', fontWeight: 600, minWidth: 20, justifyContent: 'center' }}>{currentSize || '—'}</div>
              <button type="button" onClick={() => onStyleChange?.({ fontSize: `${Math.min(72, (currentSize || 14) + 1)}` })} style={{ ...BTN, width: 22, height: 22, borderRadius: 4, border: 'none', background: '#f5f0e8', color: '#C9A84C', fontSize: 14, fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 0 }}>+</button>

              <div style={{ width: 1, background: '#e0d5c8', margin: '2px 2px', alignSelf: 'stretch' }} />

              {/* Bold toggle */}
              <button type="button" onClick={() => onStyleChange?.({ fontWeight: style?.fontWeight === 700 || style?.fontWeight === 'bold' ? 'normal' : 'bold' })} style={{ ...BTN, width: 22, height: 22, borderRadius: 4, border: 'none', background: (style?.fontWeight === 700 || style?.fontWeight === 'bold') ? '#C9A84C' : '#f5f0e8', color: (style?.fontWeight === 700 || style?.fontWeight === 'bold') ? 'white' : '#3a3330', fontSize: 13, fontWeight: 900, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 0, fontFamily: 'serif' }}>B</button>

              {/* Italic toggle */}
              <button type="button" onClick={() => onStyleChange?.({ fontStyle: style?.fontStyle === 'italic' ? 'normal' : 'italic' })} style={{ ...BTN, width: 22, height: 22, borderRadius: 4, border: 'none', background: style?.fontStyle === 'italic' ? '#C9A84C' : '#f5f0e8', color: style?.fontStyle === 'italic' ? 'white' : '#3a3330', fontSize: 13, fontWeight: 700, fontStyle: 'italic', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 0, fontFamily: 'serif' }}>I</button>

              <div style={{ width: 1, background: '#e0d5c8', margin: '2px 2px', alignSelf: 'stretch' }} />

              {/* Color toggle */}
              <button type="button" onClick={() => { setShowColors(p => !p); setShowFonts(false) }} style={{ ...BTN, width: 22, height: 22, borderRadius: 4, border: 'none', background: showColors ? '#C9A84C' : '#f5f0e8', color: showColors ? 'white' : '#C9A84C', fontSize: 12, fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 0 }}>🎨</button>

              {/* Font toggle */}
              <button type="button" onClick={() => { setShowFonts(p => !p); setShowColors(false) }} style={{ ...BTN, width: 22, height: 22, borderRadius: 4, border: 'none', background: showFonts ? '#C9A84C' : '#f5f0e8', color: showFonts ? 'white' : '#3a3330', fontSize: 10, fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 0, fontFamily: 'serif' }}>Aa</button>

              <div style={{ width: 1, background: '#e0d5c8', margin: '2px 2px', alignSelf: 'stretch' }} />

              {/* Alignment buttons */}
              {(['left', 'center', 'right'] as const).map(align => (
                <button key={align} type="button" onClick={() => onStyleChange?.({ textAlign: align })} style={{
                  ...BTN, width: 22, height: 22, borderRadius: 4, border: 'none',
                  background: (style?.textAlign || 'center') === align ? '#C9A84C' : '#f5f0e8',
                  color: (style?.textAlign || 'center') === align ? 'white' : '#8a7e72',
                  fontSize: 10, fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 0,
                }}>
                  {align === 'left' ? '⫷' : align === 'center' ? '≡' : '⫸'}
                </button>
              ))}

              <div style={{ width: 1, background: '#e0d5c8', margin: '2px 2px', alignSelf: 'stretch' }} />

              {/* Spacing (letter-spacing) */}
              <button type="button" onClick={() => { const cur = typeof style?.letterSpacing === 'number' ? style.letterSpacing : (parseInt(String(style?.letterSpacing || '0'), 10) || 0); onStyleChange?.({ letterSpacing: `${Math.max(0, cur - 1)}` }) }} style={{ ...BTN, width: 18, height: 22, borderRadius: 4, border: 'none', background: '#f5f0e8', color: '#8a7e72', fontSize: 8, fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 0 }}>A←</button>
              <button type="button" onClick={() => { const cur = typeof style?.letterSpacing === 'number' ? style.letterSpacing : (parseInt(String(style?.letterSpacing || '0'), 10) || 0); onStyleChange?.({ letterSpacing: `${Math.min(20, cur + 1)}` }) }} style={{ ...BTN, width: 18, height: 22, borderRadius: 4, border: 'none', background: '#f5f0e8', color: '#8a7e72', fontSize: 8, fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 0 }}>A→</button>

              <div style={{ width: 1, background: '#e0d5c8', margin: '2px 2px', alignSelf: 'stretch' }} />

              {/* Edit text button */}
              <button type="button" onClick={() => { setSelected(false); setShowColors(false); setShowFonts(false); setEditing(true) }} style={{ ...BTN, width: 22, height: 22, borderRadius: 4, border: 'none', background: '#f5f0e8', fontSize: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 0 }}>✏️</button>
            </div>

            {/* Color panel */}
            {showColors && (
              <div style={{ marginTop: 6, paddingTop: 6, borderTop: '1px solid #e0d5c8' }}>
                <div style={{ fontSize: 9, color: '#8a7e72', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 4 }}>Couleur</div>
                <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
                  {INLINE_EDIT_COLORS.map(c => (
                    <button key={c || 'def'} type="button" onClick={() => onStyleChange?.({ color: c })} style={{
                      ...BTN, width: 18, height: 18, borderRadius: '50%', padding: 0,
                      background: c || 'linear-gradient(135deg, #ccc 25%, #fff 25%, #fff 50%, #ccc 50%, #ccc 75%, #fff 75%)',
                      backgroundSize: c ? undefined : '6px 6px',
                      border: currentColor === c ? '2px solid #C9A84C' : '1px solid #d6d1cb',
                      boxShadow: currentColor === c ? '0 0 0 1px #C9A84C' : 'none',
                    }} />
                  ))}
                  {/* Custom color picker */}
                  <label style={{ width: 18, height: 18, borderRadius: '50%', border: '1px solid #d6d1cb', overflow: 'hidden', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'conic-gradient(red, yellow, lime, aqua, blue, magenta, red)', flexShrink: 0 }}>
                    <input type="color" value={currentColor || '#000000'} onChange={e => onStyleChange?.({ color: e.target.value })} style={{ opacity: 0, width: 0, height: 0, position: 'absolute' }} />
                  </label>
                </div>
              </div>
            )}

            {/* Font panel */}
            {showFonts && (
              <div style={{ marginTop: 6, paddingTop: 6, borderTop: '1px solid #e0d5c8' }}>
                <div style={{ fontSize: 9, color: '#8a7e72', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 4 }}>Police</div>
                <div style={{ display: 'flex', gap: 3, flexWrap: 'wrap' }}>
                  {INLINE_EDIT_FONTS.map(f => (
                    <button key={f.value || 'def'} type="button" onClick={() => onStyleChange?.({ fontFamily: f.value })} style={{
                      ...BTN, padding: '3px 8px', borderRadius: 6, fontSize: 9, fontWeight: currentFont === f.value ? 700 : 400,
                      border: `1px solid ${currentFont === f.value ? '#C9A84C' : '#e0d5c8'}`,
                      background: currentFont === f.value ? '#faf5ea' : 'white',
                      color: currentFont === f.value ? '#C9A84C' : '#3a3330',
                      fontFamily: f.value || 'inherit',
                    }}>{f.label}</button>
                  ))}
                </div>
              </div>
            )}
          </div>
        , document.body)}
        {/* Selection outline */}
        {selected && (
          <div style={{ position: 'absolute', inset: -3, border: '1.5px dashed rgba(201,168,76,0.5)', borderRadius: 6, pointerEvents: 'none' }} />
        )}
      </div>
    )
  }

  const toggleBold = () => {
    const ta = ref.current as unknown as HTMLTextAreaElement | null
    if (!ta) return
    const start = ta.selectionStart
    const end = ta.selectionEnd
    const text = ta.value
    if (start === end) return // pas de sélection
    const sel = text.slice(start, end)
    if (sel.startsWith('**') && sel.endsWith('**')) {
      // Retirer le gras
      ta.value = text.slice(0, start) + sel.slice(2, -2) + text.slice(end)
    } else {
      // Ajouter le gras
      ta.value = text.slice(0, start) + '**' + sel + '**' + text.slice(end)
    }
    ta.focus()
  }

  return (
    <div style={{ position: 'relative' }}>
      <button type="button" onMouseDown={(e) => { e.preventDefault(); e.stopPropagation(); toggleBold() }} style={{ position: 'absolute', top: -24, right: 0, fontSize: 11, fontWeight: 900, padding: '2px 8px', borderRadius: 4, border: '1px solid #ccc', background: 'white', cursor: 'pointer', zIndex: 5, fontFamily: 'serif' }}>B</button>
    <textarea
      ref={ref as unknown as React.RefObject<HTMLTextAreaElement>}
      autoFocus
      defaultValue={display}
      onMouseDown={(e) => e.stopPropagation()}
      onTouchStart={(e) => e.stopPropagation()}
      onBlur={(e) => {
        // Délai pour laisser le bouton B fonctionner avant le blur
        setTimeout(() => {
          const text = e.target.value.trim()
          setEditing(false)
          if (text !== (value || defaultValue)) {
            onChange(text)
          }
        }, 150)
      }}
      onKeyDown={(e) => {
        e.stopPropagation()
        if (e.key === 'Escape') { setEditing(false) }
      }}
      style={{
        ...style,
        width: '100%', boxSizing: 'border-box',
        border: '2px solid currentColor', borderRadius: 8,
        padding: '8px 12px', resize: 'vertical', minHeight: 60,
        outline: 'none', background: 'rgba(255,255,255,0.95)',
        whiteSpace: 'pre-wrap',
      }}
    />
    </div>
  )
}

// ── CustomPageCard — page libre entre les cérémonies ──────────────────────────
function CustomPageCard({ page, theme, editable, onUpdate, onRemove }: {
  page: CustomPage; theme: ThemeObj; editable: boolean
  onUpdate?: (patch: Partial<CustomPage>) => void; onRemove?: () => void
}) {
  const [carouselIdx, setCarouselIdx] = useState(0)
  const [showStylePanel, setShowStylePanel] = useState(false)
  const scrollRef = useRef<HTMLDivElement>(null)
  const FC = 'var(--font-cormorant-garamond)'
  const G = theme.accent
  const hasImages = page.images.length > 0

  const textColor = page.texteColor || 'white'
  const textFont = page.texteFont || 'var(--font-great-vibes)'
  const textOffsetX = page.texteOffsetX ?? 0
  const textOffsetY = page.texteOffsetY ?? 0

  // Drag du texte sur la photo
  const dragging = useRef(false)
  const dragStart = useRef({ x: 0, y: 0, ox: 0, oy: 0 })
  const [localOff, setLocalOff] = useState<{ x: number; y: number } | null>(null)

  useEffect(() => {
    const mm = (e: MouseEvent) => { if (!dragging.current) return; e.preventDefault(); setLocalOff({ x: Math.max(-150, Math.min(150, dragStart.current.ox + e.clientX - dragStart.current.x)), y: Math.max(-200, Math.min(200, dragStart.current.oy + e.clientY - dragStart.current.y)) }) }
    const tm = (e: TouchEvent) => { if (!dragging.current) return; setLocalOff({ x: Math.max(-150, Math.min(150, dragStart.current.ox + e.touches[0].clientX - dragStart.current.x)), y: Math.max(-200, Math.min(200, dragStart.current.oy + e.touches[0].clientY - dragStart.current.y)) }) }
    const up = () => { if (!dragging.current) return; dragging.current = false; setLocalOff(p => { if (p) onUpdate?.({ texteOffsetX: p.x, texteOffsetY: p.y }); return null }) }
    window.addEventListener('mousemove', mm); window.addEventListener('mouseup', up)
    window.addEventListener('touchmove', tm, { passive: false }); window.addEventListener('touchend', up)
    return () => { window.removeEventListener('mousemove', mm); window.removeEventListener('mouseup', up); window.removeEventListener('touchmove', tm); window.removeEventListener('touchend', up) }
  }, [onUpdate])

  const startDrag = (ex: number, ey: number) => { if (!editable) return; dragging.current = true; dragStart.current = { x: ex, y: ey, ox: textOffsetX, oy: textOffsetY } }
  const cx = localOff?.x ?? textOffsetX
  const cy = localOff?.y ?? textOffsetY

  const CUSTOM_FONTS = [
    { value: 'var(--font-great-vibes)', label: 'Calligraphie' },
    { value: 'var(--font-cormorant-garamond)', label: 'Élégant' },
    { value: 'var(--font-playfair-display)', label: 'Serif' },
    { value: 'Georgia, serif', label: 'Georgia' },
    { value: 'Helvetica, Arial, sans-serif', label: 'Moderne' },
  ]

  // Auto-slide du carousel (fondu enchaîné)
  const imgCount = page.images.length
  useEffect(() => {
    if (page.imagesMode !== 'carousel' || imgCount <= 1) return
    const interval = setInterval(() => {
      setCarouselIdx(prev => (prev + 1) % imgCount)
    }, 4000)
    return () => clearInterval(interval)
  }, [imgCount, page.imagesMode])

  // État édition inline du texte
  const [editingText, setEditingText] = useState(false)

  // Bloc texte réutilisable (sur image) — draggable + éditable
  const renderOverlayText = () => {
    if (!page.texte && !editable) return null

    if (editable && editingText) {
      return (
        <div
          onMouseDown={e => e.stopPropagation()}
          onTouchStart={e => e.stopPropagation()}
          style={{ position: 'absolute', left: 16, right: 16, bottom: 24, zIndex: 10, transform: `translate(${cx}px, ${cy}px)` }}
        >
          <textarea
            autoFocus
            defaultValue={page.texte ?? ''}
            onBlur={(e) => {
              setEditingText(false)
              const v = e.currentTarget.value.trim()
              if (v !== (page.texte ?? '')) onUpdate?.({ texte: v })
            }}
            onKeyDown={e => { e.stopPropagation(); if (e.key === 'Escape') setEditingText(false) }}
            style={{
              width: '100%', boxSizing: 'border-box', padding: '10px 14px',
              fontFamily: textFont, fontSize: 18, color: textColor,
              background: 'rgba(0,0,0,0.7)', border: `2px solid ${textColor}`,
              borderRadius: 10, resize: 'vertical', minHeight: 60,
              outline: 'none', textAlign: 'center', lineHeight: 1.5,
            }}
          />
        </div>
      )
    }

    return (
      <div
        onPointerDown={editable ? (e) => {
          e.stopPropagation()
          e.preventDefault()
          startDrag(e.clientX, e.clientY)
        } : undefined}
        onDoubleClick={editable ? (e) => { e.stopPropagation(); setEditingText(true) } : undefined}
        style={{
          position: 'absolute', left: 24, right: 24, bottom: 32, zIndex: 2,
          transform: `translate(${cx}px, ${cy}px)`,
          cursor: editable ? 'grab' : 'default',
          transition: dragging.current ? 'none' : 'transform 0.15s',
        }}
      >
        <div style={{
          fontFamily: textFont, fontSize: 'clamp(20px, 5vw, 30px)', color: textColor,
          textAlign: 'center', lineHeight: 1.4, whiteSpace: 'pre-wrap',
          textShadow: '0 2px 8px rgba(0,0,0,0.6)',
        }}>
          {page.texte || (editable ? 'Double-clic pour ajouter du texte' : '')}
        </div>
        {editable && <span style={{ position: 'absolute', top: -10, right: -10, fontSize: 12, background: 'rgba(255,255,255,0.9)', borderRadius: '50%', padding: 3, boxShadow: '0 1px 4px rgba(0,0,0,0.2)' }}>✏️</span>}
      </div>
    )
  }

  return (
    <section style={{ background: theme.fond, borderBottom: `1px solid ${G}1a` }}>
      {/* Images */}
      {hasImages && (
        page.imagesMode === 'carousel' ? (
          <div style={{ position: 'relative', overflow: 'hidden' }}>
            {/* Première image pour définir la hauteur */}
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={page.images[0].url} alt="" style={{ width: '100%', height: 'auto', display: 'block', visibility: 'hidden' }} />
            {/* Images empilées avec fondu */}
            {page.images.map((img, i) => (
              // eslint-disable-next-line @next/next/no-img-element
              <img key={i} src={img.url} alt="" style={{
                position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', objectFit: 'cover',
                opacity: i === carouselIdx ? 1 : 0,
                transition: 'opacity 1.2s ease-in-out',
              }} />
            ))}
            {/* Voile gradient */}
            {page.texte && <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: '50%', background: 'linear-gradient(to top, rgba(0,0,0,0.5), transparent)', pointerEvents: 'none', zIndex: 1 }} />}
            {/* Texte draggable */}
            {renderOverlayText()}
          </div>
        ) : (
          <div>
            {page.images.map((img, i) => {
              const isLast = i === page.images.length - 1
              return (
                <div key={i} style={{ position: 'relative' }}>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={img.url} alt="" style={{ width: '100%', height: 'auto', display: 'block' }} />
                  {isLast && page.texte && <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: '50%', background: 'linear-gradient(to top, rgba(0,0,0,0.5), transparent)', pointerEvents: 'none' }} />}
                  {isLast && renderOverlayText()}
                </div>
              )
            })}
          </div>
        )
      )}
      {/* Texte seul si pas d'images */}
      {!hasImages && (
        <div style={{ padding: '48px 32px', textAlign: 'center' }}>
          {page.texte && (
            <div style={{ fontFamily: textFont, fontStyle: 'italic', fontSize: 18, color: page.texteColor || theme.texte, lineHeight: 1.8, whiteSpace: 'pre-wrap' }}>
              {page.texte}
            </div>
          )}
          {editable && !page.texte && (
            <div style={{ fontFamily: 'var(--font-cormorant-garamond)', fontStyle: 'italic', fontSize: 14, color: theme.textSecondaire, opacity: 0.6 }}>
              Page vide — ajoutez des images ou du texte dans le formulaire
            </div>
          )}
        </div>
      )}
      {/* Contrôles édition : style du texte + supprimer */}
      {editable && (
        <div style={{ padding: '12px 16px', background: theme.fond }}>
          {page.texte && (
            <>
              <button type="button" onClick={() => setShowStylePanel(p => !p)} style={{
                ...BTN, display: 'block', margin: '0 auto 8px', padding: '6px 16px', borderRadius: 9999,
                border: `1px solid ${G}44`, background: showStylePanel ? `${G}15` : 'white',
                color: G, fontSize: 11, fontWeight: 600,
              }}>🎨 Style du texte</button>
              {showStylePanel && (
                <div style={{ background: 'white', borderRadius: 12, padding: 14, border: '1px solid #e0d5c8', marginBottom: 8 }}>
                  {/* Couleur */}
                  <div style={{ fontSize: 9, color: '#8a7e72', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 6 }}>Couleur</div>
                  <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap', marginBottom: 10 }}>
                    {['white', '#000000', '#C9A84C', '#d4829a', '#8b0000', '#2c4a7c', '#7a9e6e', '#F0CD7A', '#E07856', '#D63384', '#1E5BA8', G].map(c => (
                      <button key={c} type="button" onClick={() => onUpdate?.({ texteColor: c })} style={{
                        ...BTN, width: 22, height: 22, borderRadius: '50%', padding: 0,
                        background: c, border: textColor === c ? `2px solid ${G}` : '1px solid #d6d1cb',
                      }} />
                    ))}
                  </div>
                  {/* Police */}
                  <div style={{ fontSize: 9, color: '#8a7e72', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 4 }}>Police</div>
                  <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
                    {CUSTOM_FONTS.map(f => (
                      <button key={f.value} type="button" onClick={() => onUpdate?.({ texteFont: f.value })} style={{
                        ...BTN, padding: '4px 10px', borderRadius: 8, fontSize: 10,
                        fontFamily: f.value, fontWeight: textFont === f.value ? 700 : 400,
                        border: `1.5px solid ${textFont === f.value ? G : '#e0d5c8'}`,
                        background: textFont === f.value ? `${G}15` : 'white',
                        color: textFont === f.value ? G : '#3a3330',
                      }}>{f.label}</button>
                    ))}
                  </div>
                </div>
              )}
            </>
          )}
          <div style={{ display: 'flex', justifyContent: 'center', gap: 8 }}>
            <button type="button" onClick={() => onRemove?.()} style={{
              ...BTN, padding: '6px 16px', borderRadius: 9999,
              border: '1px solid #d4505030', background: 'white',
              color: '#d45050', fontSize: 11, fontWeight: 600,
            }}>Supprimer</button>
          </div>
        </div>
      )}
    </section>
  )
}

// ── SharedPageContent ─────────────────────────────────────────────────────────
function SharedPageContent({ data, theme, sorted: allSorted, role, lastShareId: _lastShareId, onRsvpOpen, onRsvpListOpen, onStartYoutube, ytIframeRef, ytMuted, onToggleYtMute, onUpdate, onTextEdit }: SharedPageContentProps) {
  const { t, locale } = useT()
  const contentRef = useRef<HTMLDivElement>(null)
  const [currentCeremonyIdx, setCurrentCeremonyIdx] = useState(0)
  const [, setContainerWidth] = useState(360)

  // Filtrage des cérémonies par paramètre URL ?events=0,2
  // Les indices correspondent aux positions dans allSorted (trié par date)
  const sorted = (() => {
    if (typeof window === 'undefined') return allSorted
    const eventsParam = new URLSearchParams(window.location.search).get('events')
    if (!eventsParam) return allSorted
    const indices = eventsParam.split(',').map(Number).filter(i => !isNaN(i) && i >= 0 && i < allSorted.length)
    return indices.length > 0 ? indices.map(i => allSorted[i]) : allSorted
  })()
  const _gc = data.globalTextColor
  const G = _gc || theme.accent
  const TEXT = _gc || theme.texte
  const FS = 'var(--font-great-vibes)'
  const FP = 'var(--font-playfair-display)'

  // Ombre dorée pour donner de la profondeur aux textes or (comme le logo)
  const _GOLD_SET = new Set(['#c9a84c', '#c9a030', '#d4a830', '#e5b847', '#f0cd7a', '#f5d480', '#e8c26e', '#ffd700', '#e8d4a2', '#d4a574'])
  const isGold = _GOLD_SET.has(G.toLowerCase())
  const goldShadow = isGold ? '0 1px 2px rgba(139,105,20,0.6), 0 0 8px rgba(201,168,76,0.3)' : ''
  const FC = 'var(--font-cormorant-garamond)'
  const ov = data.textOverrides ?? {}
  const getInlineStyle = (key: string): React.CSSProperties => {
    const raw = ov[`style_${key}`]
    if (!raw) return {}
    try {
      const parsed = JSON.parse(raw)
      // Convertir fontSize et letterSpacing string en number pour que React l'applique correctement
      if (parsed.fontSize && typeof parsed.fontSize === 'string') {
        const n = parseInt(parsed.fontSize, 10)
        if (!isNaN(n)) parsed.fontSize = n
      }
      if (parsed.letterSpacing && typeof parsed.letterSpacing === 'string') {
        const n = parseInt(parsed.letterSpacing, 10)
        if (!isNaN(n)) parsed.letterSpacing = n
      }
      return parsed
    } catch { return {} }
  }
  const setInlineStyle = (key: string, patch: { color?: string; fontFamily?: string; fontSize?: string }) => {
    const existing = getInlineStyle(key)
    const merged = { ...existing, ...patch }
    onUpdate?.({ textOverrides: { ...data.textOverrides, [`style_${key}`]: JSON.stringify(merged) } })
  }
  const i1 = (data.marie1Prenom || 'A')[0].toUpperCase()
  const i2 = (data.marie2Prenom || 'B')[0].toUpperCase()
  const monoColor = data.monogrammeColor || G
  const titles = { mr: t.fairepart.mr, mrs: t.fairepart.mrs, mrAndMrs: t.fairepart.mrAndMrs }
  const parents1 = fmtParentsLines(data.famille1PerePrenom, data.famille1PereNom, data.famille1MerePrenom, data.famille1MereNom, titles)
  const parents2 = fmtParentsLines(data.famille2PerePrenom, data.famille2PereNom, data.famille2MerePrenom, data.famille2MereNom, titles)
  const gpPa1 = fmtGpCouple(data.famille1GpPaPerePrenom, data.famille1GpPaPereNom, data.famille1GpPaMerePrenom, data.famille1GpPaMereNom, titles)
  const gpMa1 = fmtGpCouple(data.famille1GpMaPerePrenom, data.famille1GpMaPereNom, data.famille1GpMaMerePrenom, data.famille1GpMaMereNom, titles)
  const gpPa2 = fmtGpCouple(data.famille2GpPaPerePrenom, data.famille2GpPaPereNom, data.famille2GpPaMerePrenom, data.famille2GpPaMereNom, titles)
  const gpMa2 = fmtGpCouple(data.famille2GpMaPerePrenom, data.famille2GpMaPereNom, data.famille2GpMaMerePrenom, data.famille2GpMaMereNom, titles)
  const hasGp = !!(gpPa1 || gpMa1 || gpPa2 || gpMa2)
const firstDate = sorted[0]?.date

  const hasIntroPhoto = (data.photosFond?.length ?? 0) > 0 || !!data.photoFond
  const introTextColor = _gc || (hasIntroPhoto ? 'rgba(255,255,255,0.95)' : G)
  const fondCeremonie = data.fondCeremonie ?? 'ornements'
  const firstPhoto = data.photosFond?.[0] ?? data.photoFond ?? ''

  const ornUrl = ORNEMENTS_LIBRARY.find(o => o.id === (data.ornamentId ?? 'none'))?.url ?? ''
  const frame = FRAMES.find(f => f.id === (data.frameId ?? 'none')) ?? FRAMES[FRAMES.length - 1]
  const hasFrame = !!frame.url
  const OrnTR = () => <OrnementCorner url={ornUrl} corner="top-right" size={70} />
  const OrnBL = () => <OrnementCorner url={ornUrl} corner="bottom-left" size={70} />
  const OrnTL = () => <OrnementCorner url={ornUrl} corner="top-left" size={70} />
  const OrnBR = () => <OrnementCorner url={ornUrl} corner="bottom-right" size={70} />

  const anim = data.animationStyle || 'slide-up'

  const OrnSep = () => (
    <div style={{ display: 'flex', alignItems: 'center', gap: 12, justifyContent: 'center', margin: '0 auto 24px', maxWidth: 200 }}>
      <div style={{ flex: 1, height: 0.5, background: `linear-gradient(to right, transparent, ${G}40)` }} />
      <span style={{ color: G, fontSize: 8, opacity: 0.5 }}>◆</span>
      <div style={{ flex: 1, height: 0.5, background: `linear-gradient(to left, transparent, ${G}40)` }} />
    </div>
  )
  const LineSep = () => (
    <div style={{ display: 'flex', alignItems: 'center', gap: 8, justifyContent: 'center', margin: '24px auto' }}>
      <div style={{ width: 36, height: 0.5, background: `linear-gradient(to right, transparent, ${G}35)` }} />
      {[0,1,2].map(k => <span key={k} style={{ width: 3, height: 3, borderRadius: '50%', background: G, opacity: 0.25 }} />)}
      <div style={{ width: 36, height: 0.5, background: `linear-gradient(to left, transparent, ${G}35)` }} />
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
    <div style={{ backgroundColor: theme.fond, minHeight: '100vh', overflowX: 'hidden' }}>
      {data.petalsEnabled && <PersistentParticles theme={theme} style={data.style} />}
      <div style={{ backgroundColor: theme.fond, color: TEXT, minHeight: '100vh', maxWidth: 480, margin: '0 auto', boxShadow: '0 0 40px rgba(0,0,0,0.08)', paddingTop: data.premiumCover ? 68 : 48, overflowX: 'hidden' }}>
      <StickyHeader
        ceremonies={sorted}
        accent={G}
        theme={theme}
        logoUrl={data.customLogoUrl || data.luxeMonogramUrl}
        logoColor={data.headerLogoColor}
        logoSize={data.headerLogoSize ?? 48}
        logoBold={data.headerLogoBold ?? 100}
        firstDate={sorted[0]?.date}
        editable={role !== 'guest' && !!onUpdate}
        onLogoChange={onUpdate}
        premiumStyle={data.premiumCover}
      />
      <style>{`
        @keyframes sharedFadeIn{from{opacity:0;transform:translateY(18px)}to{opacity:1;transform:translateY(0)}}
        .lovit-btn{transition:all 0.25s cubic-bezier(0.22,1,0.36,1)}
        .lovit-btn:hover{transform:translateY(-1px);filter:brightness(1.06);box-shadow:0 6px 24px rgba(0,0,0,0.12)}
        .lovit-btn:active{transform:translateY(0);filter:brightness(0.98)}
      `}</style>
      {/* WebView → redirection automatique vers le vrai navigateur */}
      <WebViewRedirect />
{/* Indicateur PAGE 1 — visible uniquement pour les mariés */}
      {role !== 'guest' && (
        <div style={{ textAlign: 'center', padding: '12px 0 4px', background: `${G}08`, borderBottom: `1px dashed ${G}30` }}>
          <span style={{ fontFamily: FP, fontSize: 10, fontWeight: 700, letterSpacing: 4, textTransform: 'uppercase', color: G, opacity: 0.5 }}>— PAGE 1 : ACCUEIL —</span>
        </div>
      )}
{/* SECTION 1 : Écran d'accueil */}
      {data.premiumCover && (() => {
  const canEdit = role !== 'guest' && !!onUpdate
  const layout = data.accueilLayout ?? {}
  const setLayout = (l: Record<string, { x: number; y: number; scale: number; color?: string; fontFamily?: string }>) => onUpdate?.({ accueilLayout: l })
  const coupleUrl = data.illustrationCoupleId?.startsWith('http') ? data.illustrationCoupleId : ILLUSTRATIONS_COUPLES.find(ic => ic.id === data.illustrationCoupleId)?.url
  return (
<div style={{
  position: 'relative', maxWidth: 480, margin: '0 auto',
  minHeight: '100svh',
  boxShadow: '0 8px 60px rgba(0,0,0,0.15)',
  overflow: 'hidden',
  backgroundColor: '#F7F3EC',
  backgroundImage: 'radial-gradient(ellipse at 15% 15%, rgba(201,162,100,0.07) 0%, transparent 50%), radial-gradient(ellipse at 85% 85%, rgba(27,42,94,0.05) 0%, transparent 50%), radial-gradient(ellipse at 85% 15%, rgba(196,113,74,0.04) 0%, transparent 40%), radial-gradient(ellipse at 15% 85%, rgba(201,162,100,0.04) 0%, transparent 40%)',
}}>
  <style>{`@keyframes premiumPulse{0%,100%{transform:scale(1)}50%{transform:scale(1.03)}}`}</style>
  {/* Illustration aquarelle — fond principal */}
  {coupleUrl && (
    <div style={{ position: 'relative', width: '100%', minHeight: '100svh' }}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={coupleUrl} alt="" style={{
        width: '100%', height: '100%', minHeight: '100svh',
        objectFit: 'cover', objectPosition: 'center 20%', display: 'block',
        WebkitMaskImage: 'radial-gradient(ellipse 90% 85% at 50% 50%, black 30%, transparent 100%)',
        maskImage: 'radial-gradient(ellipse 90% 85% at 50% 50%, black 30%, transparent 100%)',
      } as React.CSSProperties} />
    </div>
  )}
  {!coupleUrl && (
    <div style={{ width: '100%', minHeight: '100svh' }} />
  )}
  {/* Overlay — tout le texte par-dessus l'illustration */}
  <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'flex-start', padding: '12px 24px 8px', zIndex: 2, pointerEvents: 'none' }}>
    {/* בס״ד avec ornements — draggable */}
    {data.mariageJuif && (
      <div style={{ pointerEvents: 'auto', position: 'relative', zIndex: 10 }}>
        <DraggableElement id="pc_bsd" layout={layout} onLayoutChange={setLayout} editable={canEdit}>
          <div style={{ textAlign: 'center', marginBottom: 8 }}>
            <div style={{ fontFamily: 'var(--font-playfair-display)', fontSize: 13, color: '#C9A264', letterSpacing: 6, margin: '4px 0', direction: 'rtl' }}>בס״ד</div>
          </div>
        </DraggableElement>
      </div>
    )}
    {/* Prénoms — 3 lignes, avec halo — draggable */}
    <div style={{ pointerEvents: 'auto', position: 'relative', zIndex: 10 }}>
      <DraggableElement id="pc_names" layout={layout} onLayoutChange={setLayout} editable={canEdit}>
        <div style={{ textAlign: 'center', padding: '10px 12px', background: 'radial-gradient(ellipse 90% 100% at 50% 50%, rgba(247,243,236,0.6) 0%, transparent 100%)', position: 'relative', zIndex: 2, marginTop: 12, whiteSpace: 'nowrap' }}>
          <span style={{ fontFamily: 'var(--font-great-vibes)', fontSize: 'clamp(32px,7.5vw,52px)', color: '#1B2A5E', lineHeight: 1.15, textShadow: '0 2px 20px rgba(247,243,236,0.9)' }}>
            {data.marie1Prenom || 'Prénom'}
          </span>
          <span style={{ fontFamily: 'var(--font-playfair-display)', fontStyle: 'italic', fontSize: 'clamp(18px,4vw,26px)', color: '#C9A264', letterSpacing: 6, margin: '0 6px', verticalAlign: 'middle' }}>
            {'&'}
          </span>
          <span style={{ fontFamily: 'var(--font-great-vibes)', fontSize: 'clamp(32px,7.5vw,52px)', color: '#1B2A5E', lineHeight: 1.15, textShadow: '0 2px 20px rgba(247,243,236,0.9)' }}>
            {data.marie2Prenom || 'Prénom'}
          </span>
        </div>
      </DraggableElement>
    </div>
    {/* "ont le plaisir..." — draggable */}
    <div style={{ pointerEvents: 'auto', position: 'relative', zIndex: 10 }}>
      <DraggableElement id="pc_phrase" layout={layout} onLayoutChange={setLayout} editable={canEdit}>
        <div style={{ fontFamily: 'var(--font-playfair-display)', fontStyle: 'italic', fontSize: 15, color: '#1B2A5E', letterSpacing: 3, textAlign: 'center', marginTop: 14, textShadow: '0 1px 10px rgba(247,243,236,0.8)' }}>
          {data.textOverrides?.['global_pleaseJoin'] !== '__hidden__' && (data.textOverrides?.['global_pleaseJoin'] || 'ont le plaisir de vous convier à leur mariage')}
        </div>
      </DraggableElement>
    </div>
    {/* Spacer */}
    <div style={{ flex: 1 }} />
    {/* Séparateur + bouton DÉCOUVRIR + dates — en bas */}
    <div style={{ textAlign: 'center', flexShrink: 0, pointerEvents: 'auto', marginTop: -60 }}>
      <div>
        <button type="button" onClick={() => { const audio = document.getElementById('lovit-audio') as HTMLAudioElement | null; if (audio) audio.play().catch(() => {}); onStartYoutube?.(); const el = document.getElementById('first-content'); if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' }) }} onTouchEnd={(e) => { e.preventDefault(); const audio = document.getElementById('lovit-audio') as HTMLAudioElement | null; if (audio) audio.play().catch(() => {}); onStartYoutube?.(); const el = document.getElementById('first-content'); if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' }) }} style={{ fontFamily: 'var(--font-tenor-sans)', fontSize: 11, fontWeight: 500, letterSpacing: '0.35em', textTransform: 'uppercase' as const, padding: '16px 52px', borderRadius: 0, minWidth: 200, border: '0.5px solid #C9A264', background: 'rgba(247,243,236,0.6)', color: '#1B2A5E', cursor: 'pointer', transition: 'all 0.3s ease', animation: 'premiumPulse 2.5s ease-in-out infinite', touchAction: 'manipulation', WebkitTapHighlightColor: 'transparent', backdropFilter: 'blur(4px)' }}>
          DÉCOUVRIR ◆
        </button>
      </div>
      {/* Dates élégantes */}
      <div style={{ display: 'flex', justifyContent: 'center', gap: 12, alignItems: 'center', marginTop: 14, flexWrap: 'wrap' }}>
        {(data.ceremonies || []).map((c: { date?: string; lieu?: string }, idx: number) => {
          if (!c.date && !c.lieu) return null
          const formatted = c.date ? (() => { const d = new Date(c.date + 'T12:00:00'); return `${String(d.getDate()).padStart(2,'0')}.${String(d.getMonth()+1).padStart(2,'0')}` })() : ''
          const lieu = c.lieu || ''
          return (
            <span key={idx} style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              {idx > 0 && <span style={{ color: '#C9A264', fontSize: 6 }}>◆</span>}
              <span style={{ fontFamily: 'var(--font-tenor-sans)', fontWeight: 300, fontSize: 8, letterSpacing: 2, color: '#C9A264' }}>
                {formatted}{formatted && lieu ? ' · ' : ''}{lieu}
              </span>
            </span>
          )
        })}
      </div>
    </div>
  </div>
</div>
  )
})()}
      <div style={{ position: 'relative', minHeight: data.accueilCompact ? 'auto' : '100svh', display: data.premiumCover ? 'none' : 'flex', flexDirection: 'column', alignItems: 'center',
        justifyContent: data.accueilCompact ? 'flex-start' : 'center', gap: 0,
        paddingTop: data.styleAccueil === 'video' ? (() => { const v = VIDEO_BACKGROUNDS.find(x => x.id === data.videoAccueilId); return v?.textPosition === 'top' ? '4%' : v?.textPosition === 'center-top' ? '8%' : '12%' })() : (data.accueilCompact ? 32 : 24),
        paddingBottom: data.accueilCompact ? 32 : 24,
        maxWidth: 480, margin: '0 auto', boxShadow: '0 8px 60px rgba(0,0,0,0.15)' }}>
        {/* Voile de lisibilité sur les photos de fond */}
        {(data.styleAccueil === 'photo' || (!data.styleAccueil)) && (data.photosFond?.length || data.photoFond) && (
          <div style={{ position: 'absolute', inset: 0, background: theme.dark
            ? 'linear-gradient(180deg, rgba(0,0,0,0.5) 0%, rgba(0,0,0,0.3) 40%, rgba(0,0,0,0.5) 100%)'
            : 'linear-gradient(180deg, rgba(255,255,255,0.6) 0%, rgba(255,255,255,0.35) 40%, rgba(255,255,255,0.6) 100%)',
            zIndex: 0, pointerEvents: 'none' }} />
        )}
        {/* Wrapper overflow:hidden pour le fond (photo carousel ou vidéo) */}
        {data.styleAccueil === 'video' && data.videoAccueilId ? (
          <div style={{ position: 'absolute', inset: 0, overflow: 'hidden', zIndex: 0, pointerEvents: 'none' }}>
            <video
              src={VIDEO_BACKGROUNDS.find(v => v.id === data.videoAccueilId)?.url}
              autoPlay loop muted playsInline
              style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', objectFit: 'cover' }}
            />
            {/* Voile pour lisibilité du texte */}
            {VIDEO_BACKGROUNDS.find(v => v.id === data.videoAccueilId)?.needsOverlay && (
              <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(ellipse at center, rgba(255,255,255,0.7) 0%, rgba(255,255,255,0.3) 70%, transparent 100%)' }} />
            )}
            {VIDEO_BACKGROUNDS.find(v => v.id === data.videoAccueilId)?.dark && (
              <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.15)' }} />
            )}
          </div>
        ) : data.styleAccueil !== 'illustration' && (
          <div style={{ position: 'absolute', inset: 0, overflow: 'hidden', zIndex: 0, pointerEvents: 'none' }}>
            <IntroCarousel photos={data.photosFond?.length ? data.photosFond : (data.photoFond ? [data.photoFond] : [])} themeAccent={G} photosData={data.photosData} />
          </div>
        )}
        {/* Cadre (frame) réservé aux pages événements — PAS sur l'accueil */}
        <div style={{ textAlign: 'center', position: 'relative', zIndex: 1, padding: '0 32px', maxWidth: 480, width: '100%', margin: '0 auto' }}>
          {(() => {
            const canEdit = role !== 'guest' && !!onUpdate
            const layout = data.accueilLayout ?? {}
            const setLayout = (l: LayoutMap) => onUpdate?.({ accueilLayout: l })
            // Couleurs dédupliquées pour logo et texte — mêmes partout
            const dedupColors = (() => {
              const seen = new Set<string>()
              return COLOR_OPTIONS.filter(c => { if (!c.value) return false; const k = c.value.toLowerCase(); if (seen.has(k)) return false; seen.add(k); return true })
            })()
            return (<>
          {data.mariageJuif && (
            <DraggableElement id="bsd" layout={layout} onLayoutChange={setLayout} editable={canEdit}>
              <div style={{ fontFamily: 'serif', fontSize: 14, color: G, direction: 'rtl', fontWeight: 700, opacity: 0.85, letterSpacing: 1, marginBottom: 6, textShadow: goldShadow }}>בס״ד</div>
            </DraggableElement>
          )}
          <DraggableElement id="monogram" layout={layout} onLayoutChange={setLayout} editable={canEdit}>
          {!data.hideAccueilLogo && (
          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 6 }}>
            {(() => {
              const logoSz = data.illustrationCoupleId ? 80 : hasIntroPhoto ? 90 : 110
              return data.customLogoUrl ? <CustomLogo url={data.customLogoUrl} scale={data.customLogoSize} color={data.customLogoColor} size={logoSz} bgColor={theme.fond} /> : <MonogramByStyle initial1={i1} initial2={i2} color={monoColor} size={logoSz} style={data.monogrammeStyle || 'cercle'} />
            })()}
          </div>
          )}
          {canEdit && !data.hideAccueilLogo && (
            <div onPointerDown={e => e.stopPropagation()} onMouseDown={e => e.stopPropagation()} onTouchStart={e => e.stopPropagation()} style={{ display: 'flex', gap: 3, flexWrap: 'wrap', justifyContent: 'center', marginBottom: 6, maxWidth: 240, margin: '0 auto 6px' }}>
              {dedupColors.slice(0, 30).map(c => (
                <button key={c.value} type="button" onClick={async () => {
                  if (data.customLogoUrl) {
                    onUpdate?.({ customLogoColor: c.value })
                    // Pré-générer le logo avec la nouvelle couleur
                    const srcUrl = data.customLogoOriginalUrl || data.customLogoUrl
                    if (srcUrl?.includes('cloudinary.com')) {
                      try {
                        const res = await fetch('/api/pregenerate-logo', {
                          method: 'POST',
                          headers: { 'Content-Type': 'application/json' },
                          body: JSON.stringify({ logoUrl: srcUrl, color: c.value }),
                        })
                        const d = await res.json()
                        if (d.url) onUpdate?.({ customLogoUrl: d.url })
                      } catch { /* ignore */ }
                    }
                  } else {
                    onUpdate?.({ monogrammeColor: c.value })
                  }
                }} style={{
                  ...BTN, width: 16, height: 16, borderRadius: '50%', padding: 0,
                  background: c.swatch,
                  border: ((data.customLogoColor || data.monogrammeColor || '') === c.value) ? `2px solid ${G}` : '1px solid #d6d1cb',
                }} />
              ))}
            </div>
          )}
          {canEdit && (
            <div onPointerDown={e => e.stopPropagation()} onMouseDown={e => e.stopPropagation()} onTouchStart={e => e.stopPropagation()} style={{ textAlign: 'center', marginBottom: 6 }}>
              <button type="button" onClick={() => onUpdate?.({ hideAccueilLogo: !data.hideAccueilLogo })} style={{ ...BTN, fontSize: 10, padding: '4px 12px', borderRadius: 9999, border: `1px solid ${G}33`, color: G, opacity: 0.7 }}>
                {data.hideAccueilLogo ? 'Afficher le logo' : 'Masquer le logo'}
              </button>
            </div>
          )}
          </DraggableElement>
          {data.illustrationCoupleId && (() => {
            const coupleUrl = ILLUSTRATIONS_COUPLES.find(ic => ic.id === data.illustrationCoupleId)?.url || (data.illustrationCoupleId.startsWith('http') ? data.illustrationCoupleId : '')
            if (!coupleUrl) return null
            return (
              <div style={{ marginBottom: 4 }}>
                <EditableIllustration
                  url={coupleUrl}
                  size={data.illustrationCoupleSize ?? (hasIntroPhoto ? 50 : 70)}
                  offsetX={data.illustrationCoupleOffsetX ?? 0}
                  offsetY={data.illustrationCoupleOffsetY ?? 0}
                  editable={canEdit}
                  accent={G}
                  ceremonyType="Cocktail"
                  onChangeSize={(sz) => onUpdate?.({ illustrationCoupleSize: sz })}
                  onChangeOffsetX={(x) => onUpdate?.({ illustrationCoupleOffsetX: x })}
                  onChangeOffsetY={(y) => onUpdate?.({ illustrationCoupleOffsetY: y })}
                  onChangeUrl={(url) => {
                    const found = ILLUSTRATIONS_COUPLES.find(ic => ic.url === url)
                    if (found) {
                      onUpdate?.({ illustrationCoupleId: found.id })
                    } else {
                      // Illustration venant du VisualPicker — stocker l'URL directement
                      onUpdate?.({ illustrationCoupleId: url })
                    }
                  }}
                  onRemove={() => onUpdate?.({ illustrationCoupleId: '', illustrationCoupleSize: 70, illustrationCoupleOffsetX: 0, illustrationCoupleOffsetY: 0 })}
                  darkBg={!!theme.dark}
                />
              </div>
            )
          })()}
          <DraggableElement id="names" layout={layout} onLayoutChange={setLayout} editable={canEdit}>
          <div style={applyZoneStyle({ fontFamily: FS, fontSize: 'clamp(28px,7vw,42px)', color: introTextColor, marginBottom: 8, lineHeight: 1.4, textAlign: 'center', textShadow: hasIntroPhoto ? '0 2px 12px rgba(0,0,0,0.7), 0 0 24px rgba(0,0,0,0.5), 0 0 48px rgba(0,0,0,0.3)' : (goldShadow || readableShadow(theme)) }, 'prenoms', data.zoneStyles)}>
            {data.marie1Prenom || 'Prénom'} <span style={{ fontFamily: 'var(--font-great-vibes)', fontSize: '0.65em', opacity: 0.55 }}>&</span> {data.marie2Prenom || 'Prénom'}
          </div>
          </DraggableElement>
          {(data.textOverrides?.['global_pleaseJoin'] !== '__hidden__') && (
          <>
          <DraggableElement id="phrase" layout={layout} onLayoutChange={setLayout} editable={canEdit}>
          <InlineEdit
            value={data.textOverrides?.['global_pleaseJoin'] || ''}
            defaultValue={t.fairepart.pleaseJoin}
            editable={canEdit}
            onChange={(v) => onUpdate?.({ textOverrides: { ...data.textOverrides, global_pleaseJoin: v } })}
            onStyleChange={(patch) => setInlineStyle('global_pleaseJoin', patch)}
            style={{ ...applyZoneStyle({ fontFamily: FC, fontStyle: 'italic', fontSize: 14, color: data.phraseColor || introTextColor, marginBottom: 0, textAlign: 'center', lineHeight: 1.6, textShadow: hasIntroPhoto ? '0 1px 8px rgba(0,0,0,0.6), 0 0 20px rgba(0,0,0,0.4), 0 0 40px rgba(0,0,0,0.2)' : (goldShadow || readableShadow(theme)) }, 'narratif', data.zoneStyles), ...getInlineStyle('global_pleaseJoin') }}
          />
          </DraggableElement>
          {canEdit && (
            <div style={{ display: 'flex', gap: 4, justifyContent: 'center', marginTop: 4 }}>
              {DRAG_COLORS.filter(c => c).slice(0, 12).map(c => (
                <button key={c} type="button" onClick={() => onUpdate?.({ phraseColor: c })} style={{
                  ...BTN, width: 14, height: 14, borderRadius: '50%', padding: 0,
                  background: c, border: (data.phraseColor || '') === c ? `2px solid ${G}` : '1px solid #d6d1cb',
                }} />
              ))}
              <button type="button" onClick={() => { onUpdate?.({ textOverrides: { ...data.textOverrides, global_pleaseJoin: '__hidden__' } }); onUpdate?.({ accueilLayout: { ...layout, phrase: { x: 0, y: 0, scale: 1 } } }) }} style={{
                ...BTN, padding: '4px 10px', borderRadius: 9999, border: '1px solid #d4505030',
                background: 'white', color: '#d45050', fontSize: 12, fontWeight: 600, minWidth: 28, minHeight: 28,
              }}>✕ Masquer</button>
            </div>
          )}
          </>
          )}
          {/* Compte à rebours déplacé dans le sticky header */}
          {/* Bouton "Découvrir" — draggable par les mariés */}
          <DraggableElement id="decouvrir" layout={layout} onLayoutChange={setLayout} editable={canEdit}>
          <div style={{ marginTop: 12 }}>
            <button
              type="button"
              onClick={() => {
                // Lancer la musique — accès DOM direct, pas de ref, 100% fiable sur Android
                const audio = document.getElementById('lovit-audio') as HTMLAudioElement | null
                if (audio) audio.play().catch(() => {})
                onStartYoutube?.()
                const el = document.getElementById('first-content')
                if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' })
              }}
              onTouchEnd={(e) => {
                e.preventDefault()
                const audio = document.getElementById('lovit-audio') as HTMLAudioElement | null
                if (audio) audio.play().catch(() => {})
                onStartYoutube?.()
                const el = document.getElementById('first-content')
                if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' })
              }}
              style={{
                fontFamily: 'var(--font-cormorant-garamond)', fontSize: 13, fontWeight: 500, letterSpacing: '0.25em', textTransform: 'uppercase',
                padding: '16px 36px', borderRadius: 4, border: `1px solid ${introTextColor}`,
                background: 'transparent', color: introTextColor, cursor: 'pointer', transition: 'all 0.4s ease',
                touchAction: 'manipulation', WebkitTapHighlightColor: 'transparent',
                textShadow: hasIntroPhoto ? '0 1px 4px rgba(0,0,0,0.5)' : goldShadow,
                borderImage: isGold ? 'linear-gradient(135deg, #8b6914, #c9a84c, #f2d87a, #c9a84c, #8b6914) 1' : undefined,
              }}
            >
              Découvrir ✦
            </button>
          </div>
          </DraggableElement>
          </>)
          })()}
        </div>
        </div>
      </div>

      {/* CONTENU PRINCIPAL — directement les événements */}
      <div ref={contentRef} style={{ maxWidth: 480, margin: '0 auto', padding: '0 0 80px' }}>

        {/* ── Mode Design Custom : affiche les pages uploadées au lieu des cérémonies ── */}
        {data.customDesignMode && (data.customDesignPages?.length ?? 0) > 0 ? (
          <>
            <div id="first-content" style={{ scrollMarginTop: 60 }} />
            <style>{`
              @keyframes customPageFadeIn { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
            `}</style>
            {data.customDesignPages!.map((url, idx) => (
              <div key={idx} style={{
                animation: 'customPageFadeIn 0.8s ease both',
                animationDelay: `${idx * 0.15}s`,
              }}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={url}
                  alt={`Page ${idx + 1}`}
                  style={{ width: '100%', height: 'auto', display: 'block' }}
                />
              </div>
            ))}
          </>
        ) : (
        <>
        {/* Cérémonies */}
        {(data.presentationStyle === 'cartes-separees' ? [sorted[currentCeremonyIdx]].filter(Boolean) : sorted).map((ceremony, i) => {
          const sortedIdx = data.presentationStyle === 'cartes-separees' ? currentCeremonyIdx : i
          // Trouver l'index dans le tri COMPLET (toutes les cérémonies, pas juste celles filtrées par events=)
          // Les textOverrides sont stockés avec cet index (ceremony_X_lieu, etc.)
          const fullSorted = sortByDate(data.ceremonies ?? [])
          const fullSortedIdx = fullSorted.indexOf(ceremony)
          const safeIdx = fullSortedIdx >= 0 ? fullSortedIdx : sortedIdx
          const typeTitle: Record<string, string> = {
            'Mairie': t.fairepart.cardTitles['Mairie'], 'Cérémonie religieuse / Houppa': data.mariageJuif ? t.fairepart.cardTitles['Cérémonie religieuse / Houppa'] : t.fairepart.cardTitles['Cérémonie'],
            'Shabbat Hatan': t.fairepart.cardTitles['Shabbat Hatan'], 'Henné': t.fairepart.cardTitles['Henné'], 'Cocktail': t.fairepart.cardTitles['Cocktail'],
            'Soirée': t.fairepart.cardTitles['Soirée'], 'Boat Party': t.fairepart.cardTitles['Boat Party'], 'Beach Party': t.fairepart.cardTitles['Beach Party'],
          }
          const title = typeTitle[ceremony.type] || (ceremony.customName?.toUpperCase() || ceremony.type.toUpperCase())
          const hebrewDate = getHebrewDate(ceremony.date)
          const usePhotoBg = fondCeremonie === 'photo' && !!firstPhoto
          const isCard = (data.presentationStyle ?? 'page-unique') !== 'page-unique'
          const pageNum = i + 2 // Page 2 = 1er événement, etc.
          const ceremonyLabel = ceremony.type === 'Autre' ? (ceremony.customName || 'Événement') : ceremony.type
          return (
            <React.Fragment key={safeIdx}>
              {/* Pages supplémentaires AVANT cette cérémonie */}
              {(data.customPages ?? []).filter(p => p.position === safeIdx).map((page, pi) => (
                <div key={page.id + '-wrap'} id={i === 0 && pi === 0 ? 'first-content' : undefined} style={{ scrollMarginTop: 60 }}>
                <CustomPageCard
                  key={page.id}
                  page={page}
                  theme={theme}
                  editable={role !== 'guest' && !!onUpdate}
                  onUpdate={(patch) => {
                    const pages = (data.customPages ?? []).map(p => p.id === page.id ? { ...p, ...patch } : p)
                    onUpdate?.({ customPages: pages })
                  }}
                  onRemove={() => onUpdate?.({ customPages: (data.customPages ?? []).filter(p => p.id !== page.id) })}
                />
                </div>
              ))}
              {/* Indicateur de page — visible uniquement pour les mariés */}
              {role !== 'guest' && !data.continuousLayout && (
                <div style={{ textAlign: 'center', padding: '12px 0 4px', background: `${G}08`, borderTop: `1px dashed ${G}30`, borderBottom: `1px dashed ${G}30` }}>
                  <span style={{ fontFamily: FP, fontSize: 10, fontWeight: 700, letterSpacing: 4, textTransform: 'uppercase', color: G, opacity: 0.5 }}>— PAGE {pageNum} : {ceremonyLabel.toUpperCase()} —</span>
                </div>
              )}
              {/* Illustration aquarelle — rendue à l'intérieur de la carte (voir ci-dessous) */}
              <CeremonyCard isCard={isCard} accent={G} hasFrame={hasFrame}>
                {i === 0 && !(data.customPages ?? []).some(p => p.position === safeIdx) && <div id="first-content" style={{ scrollMarginTop: 60 }} />}
                <section id={`ceremony-${safeIdx}`} style={{ paddingTop: hasFrame ? `${FRAMES_CUSTOM_PADDING[data.frameId ?? '']?.top ?? data.framePaddingV ?? 22}%` : (data.premiumCover ? 40 : data.continuousLayout ? 0 : data.premiumCeremonyStyle ? 32 : 48), paddingBottom: hasFrame ? `${FRAMES_CUSTOM_PADDING[data.frameId ?? '']?.bottom ?? data.framePaddingV ?? 22}%` : (data.premiumCover ? 40 : data.continuousLayout ? 0 : data.premiumCeremonyStyle ? 32 : 48), paddingLeft: hasFrame ? `${FRAMES_CUSTOM_PADDING[data.frameId ?? '']?.h ?? data.framePaddingH ?? 18}%` : undefined, paddingRight: hasFrame ? `${FRAMES_CUSTOM_PADDING[data.frameId ?? '']?.h ?? data.framePaddingH ?? 18}%` : undefined, position: 'relative', overflow: hasFrame ? 'hidden' : 'visible', scrollMarginTop: 60, overflowWrap: 'break-word', ...(!isCard ? { borderBottom: data.continuousLayout ? 'none' : `1px solid ${G}1a`, background: ceremony.bgColor || theme.fond } : { background: hasFrame ? '#ffffff' : (ceremony.bgColor || theme.fond) }) }}>
                  {hasFrame && frame.video ? (
                    <video src={frame.url!} autoPlay loop muted playsInline style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', objectFit: 'cover', opacity: data.frameOpacity ?? 1, pointerEvents: 'none', zIndex: 0 }} />
                  ) : hasFrame ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={frame.url!} alt="" style={{ ...frameImgStyle(frame.frameType, data.frameOpacity ?? 1, data.frameSize ?? 100), zIndex: 0 } as React.CSSProperties} />
                  ) : usePhotoBg ? (
                    <>
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={firstPhoto} alt="" style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'center', pointerEvents: 'none', zIndex: 0 }} />
                      <div style={{ position: 'absolute', inset: 0, background: theme.dark ? `${theme.fond}e0` : 'rgba(255,255,255,0.82)', pointerEvents: 'none', zIndex: 0 }} />
                    </>
                  ) : data.continuousLayout ? null : (
                    <>
                      {i % 2 === 0 ? <><OrnTR /><OrnBL /></> : <><OrnTL /><OrnBR /></>}
                    </>
                  )}
                  {/* Logo en filigrane (watermark) — positionné derrière le titre */}
                  {data.logoWatermark && data.customLogoUrl && (() => {
                    const wmSize = data.logoWatermarkSize ?? 180
                    const wmColor = data.logoWatermarkColor ?? ''
                    if (wmColor) {
                      // Utiliser le logo comme mask-image pour appliquer une couleur CSS
                      return (
                        <div style={{ position: 'absolute', top: hasFrame ? '15%' : 20, left: '50%', transform: 'translateX(-50%)', width: wmSize, height: wmSize, backgroundColor: wmColor, WebkitMaskImage: `url(${data.customLogoUrl})`, WebkitMaskSize: 'contain', WebkitMaskRepeat: 'no-repeat', WebkitMaskPosition: 'center', maskImage: `url(${data.customLogoUrl})`, maskSize: 'contain', maskRepeat: 'no-repeat', maskPosition: 'center', opacity: data.logoWatermarkOpacity ?? 0.06, pointerEvents: 'none', zIndex: 0 } as React.CSSProperties} />
                      )
                    }
                    return (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={data.customLogoUrl} alt="" style={{ position: 'absolute', top: hasFrame ? '15%' : 20, left: '50%', transform: 'translateX(-50%)', width: wmSize, height: wmSize, objectFit: 'contain', opacity: data.logoWatermarkOpacity ?? 0.06, pointerEvents: 'none', zIndex: 0 }} />
                    )
                  })()}
                  {hasFrame && FRAMES_STRONG_BG.has(data.frameId ?? '') && (
                    <div style={{ position: 'absolute', inset: '12% 18%', background: 'radial-gradient(ellipse at center, rgba(255,255,255,0.82) 0%, rgba(255,255,255,0.6) 60%, rgba(255,255,255,0) 100%)', pointerEvents: 'none', zIndex: 0 }} />
                  )}
                  {/* Photo du lieu — affichée comme illustration sous le titre */}
                  {(() => {
                    const canEdit = role !== 'guest' && !!onUpdate
                    const layout = data.accueilLayout ?? {}
                    const setLayout = (l: LayoutMap) => onUpdate?.({ accueilLayout: l })
                    const pre = `c${safeIdx}_`
                    return (
                  <div style={{ position: 'relative', zIndex: 1, opacity: data.textOpacity ?? 1, textShadow: readableShadow(theme, usePhotoBg, hasFrame), transform: data.textOffsetY ? `translateY(${data.textOffsetY}px)` : undefined }}>
                    {data.mariageJuif && (
                      <div style={{ textAlign: 'right', fontSize: 14, fontFamily: 'serif', color: G, direction: 'rtl', fontWeight: 700, opacity: 0.85, letterSpacing: 1, marginBottom: 8, paddingRight: 4, textShadow: goldShadow }}>בס״ד</div>
                    )}
                    <div style={{ position: 'relative', zIndex: 2 }}><DraggableElement id={pre+"titre"} layout={layout} onLayoutChange={setLayout} editable={canEdit}><AnimSection animStyle={anim} skipAnim={canEdit}>
                      <InlineEdit
                        value={ov[`ceremony_${safeIdx}_titre`] || ''}
                        defaultValue={title}
                        editable={canEdit}
                        onChange={(v) => onUpdate?.({ textOverrides: { ...data.textOverrides, [`ceremony_${safeIdx}_titre`]: v } })}
                        onStyleChange={(patch) => setInlineStyle(`ceremony_${safeIdx}_titre`, patch)}
                        style={{ ...applyZoneStyle({ fontFamily: FP, fontSize: 13, fontWeight: 600, letterSpacing: 5, textTransform: 'uppercase' as const, color: G, textAlign: 'center', marginBottom: data.premiumCover ? 20 : 24, lineHeight: 1.4 }, 'titres', data.zoneStyles), ...getInlineStyle(`ceremony_${safeIdx}_titre`) }}
                      />
                    </AnimSection></DraggableElement></div>
                    {/* Illustration intégrée directement dans la carte */}
                    {(ceremony.illustrationUrl || ceremony.ceremonyImage) ? (
                      <AnimSection animStyle={anim} delay={200} skipAnim={canEdit}>
                        <EditableIllustration
                          url={ceremony.illustrationUrl || ceremony.ceremonyImage!}
                          size={ceremony.illustrationSize ?? (ceremony.ceremonyImage && !ceremony.illustrationUrl ? 100 : 80)}
                          offsetX={ceremony.illustrationOffsetX ?? 0}
                          offsetY={ceremony.illustrationOffsetY ?? 0}
                          editable={canEdit}
                          accent={G}
                          ceremonyType={ceremony.type}
                          onChangeSize={(sz) => { const u = [...(data.ceremonies ?? [])]; u[safeIdx] = { ...u[safeIdx], illustrationSize: sz }; onUpdate?.({ ceremonies: u }) }}
                          onChangeOffsetX={(x) => { const u = [...(data.ceremonies ?? [])]; u[safeIdx] = { ...u[safeIdx], illustrationOffsetX: x }; onUpdate?.({ ceremonies: u }) }}
                          onChangeOffsetY={(y) => { const u = [...(data.ceremonies ?? [])]; u[safeIdx] = { ...u[safeIdx], illustrationOffsetY: y }; onUpdate?.({ ceremonies: u }) }}
                          onChangeUrl={(url) => {
                            const u = [...(data.ceremonies ?? [])]
                            const isFromLibrary = VISUALS.some(v => v.url === url)
                            if (isFromLibrary) {
                              u[safeIdx] = { ...u[safeIdx], illustrationUrl: url, ceremonyImage: '' }
                            } else {
                              u[safeIdx] = { ...u[safeIdx], ceremonyImage: url, illustrationUrl: '' }
                            }
                            onUpdate?.({ ceremonies: u })
                          }}
                          onRemove={() => { const u = [...(data.ceremonies ?? [])]; u[safeIdx] = { ...u[safeIdx], illustrationUrl: '', ceremonyImage: '', illustrationSize: 80, illustrationOffsetX: 0, illustrationOffsetY: 0 }; onUpdate?.({ ceremonies: u }) }}
                          darkBg={!!theme.dark}
                          isPhoto={!!ceremony.ceremonyImage && !ceremony.illustrationUrl}
                        />
                      </AnimSection>
                    ) : canEdit ? (
                      <IllustrationAdder ceremonyType={ceremony.type} accent={G} onSelect={(url) => {
                        const u = [...(data.ceremonies ?? [])]
                        const isFromLibrary = VISUALS.some(v => v.url === url)
                        if (isFromLibrary) {
                          u[safeIdx] = { ...u[safeIdx], illustrationUrl: url }
                        } else {
                          u[safeIdx] = { ...u[safeIdx], ceremonyImage: url }
                        }
                        onUpdate?.({ ceremonies: u })
                      }} />
                    ) : null}
                    {ceremony.type === 'Cérémonie religieuse / Houppa' && data.mariageJuif && (
                      <DraggableElement id={pre+"hebrewVerse"} layout={layout} onLayoutChange={setLayout} editable={canEdit}><AnimSection animStyle={anim} delay={100} skipAnim={canEdit}>
                        <div style={{ padding: '0 20px', marginBottom: data.premiumCover ? 24 : 22 }}>
                          <InlineEdit
                            value={ov[`ceremony_${safeIdx}_hebrewVerse`] || ''}
                            defaultValue="קוֹל שָׂשׂוֹן וְקוֹל שִׂמְחָה קוֹל חָתָן וְקוֹל כַּלָּה"
                            editable={canEdit}
                            onChange={(v) => onUpdate?.({ textOverrides: { ...data.textOverrides, [`ceremony_${safeIdx}_hebrewVerse`]: v } })}
                            onStyleChange={(patch) => setInlineStyle(`ceremony_${safeIdx}_hebrewVerse`, patch)}
                            style={{ fontFamily: 'serif', fontSize: 'clamp(10px, 3.2vw, 17px)', color: G, direction: 'rtl', textAlign: 'center', whiteSpace: 'nowrap', lineHeight: 1.9, ...getInlineStyle(`ceremony_${safeIdx}_hebrewVerse`) }}
                          />
                        </div>
                      </AnimSection></DraggableElement>
                    )}
                    {ceremony.type === 'Cérémonie religieuse / Houppa' && ceremony.penseesDefuntsActif && ceremony.penseesDefuntsNoms.filter(n => n.trim()).length > 0 && (
                      <DraggableElement id={pre+"defunts"} layout={layout} onLayoutChange={setLayout} editable={canEdit}><AnimSection animStyle={anim} delay={120} skipAnim={canEdit}>
                        <div style={{ textAlign: 'center', marginBottom: data.premiumCover ? 28 : 32, paddingBottom: data.premiumCover ? 16 : 24, borderBottom: `1px solid ${G}22` }}>
                          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 14, marginBottom: data.premiumCover ? 12 : 16 }}>
                            <div style={{ width: 60, height: 0.5, background: G, opacity: 0.4 }} />
                            <img src="https://gsihevihnthjsm8z.public.blob.vercel-storage.com/static/v1781685771/bnl1dqjjovgay8l4wmlu.png" alt="" style={{ width: 50, height: 50, objectFit: 'contain' }} />
                            <div style={{ width: 60, height: 0.5, background: G, opacity: 0.4 }} />
                          </div>
                          {ceremony.penseesDefuntsIntro && (
                            <InlineEdit
                              value={ov[`ceremony_${safeIdx}_defuntsIntro`] || ''}
                              defaultValue={ceremony.penseesDefuntsIntro}
                              editable={canEdit}
                              onChange={(v) => onUpdate?.({ textOverrides: { ...data.textOverrides, [`ceremony_${safeIdx}_defuntsIntro`]: v } })}
                              onStyleChange={(patch) => setInlineStyle(`ceremony_${safeIdx}_defuntsIntro`, patch)}
                              style={{ fontFamily: FC, fontStyle: 'italic', fontSize: 14, color: TEXT, opacity: 0.85, marginBottom: 14, lineHeight: 1.6, padding: '0 12px', textAlign: 'center', ...getInlineStyle(`ceremony_${safeIdx}_defuntsIntro`) }}
                            />
                          )}
                          <div style={{ display: 'flex', flexDirection: 'column', gap: 4, marginBottom: ceremony.penseesDefuntsFin ? 14 : 0 }}>
                            {ceremony.penseesDefuntsNoms.filter(n => n.trim()).map((nom, k) => (
                              <InlineEdit key={k}
                                value={ov[`ceremony_${safeIdx}_defunt_${k}`] || ''}
                                defaultValue={`${nom} ז״ל`}
                                editable={canEdit}
                                onChange={(v) => onUpdate?.({ textOverrides: { ...data.textOverrides, [`ceremony_${safeIdx}_defunt_${k}`]: v } })}
                                onStyleChange={(patch) => setInlineStyle(`ceremony_${safeIdx}_defunt_${k}`, patch)}
                                style={{ fontFamily: FP, fontSize: 16, color: TEXT, fontWeight: 500, lineHeight: 1.6, textAlign: 'center', ...getInlineStyle(`ceremony_${safeIdx}_defunt_${k}`) }}
                              />
                            ))}
                          </div>
                          {ceremony.penseesDefuntsFin && (
                            <InlineEdit
                              value={ov[`ceremony_${safeIdx}_defuntsFin`] || ''}
                              defaultValue={ceremony.penseesDefuntsFin}
                              editable={canEdit}
                              onChange={(v) => onUpdate?.({ textOverrides: { ...data.textOverrides, [`ceremony_${safeIdx}_defuntsFin`]: v } })}
                              onStyleChange={(patch) => setInlineStyle(`ceremony_${safeIdx}_defuntsFin`, patch)}
                              style={{ fontFamily: FC, fontStyle: 'italic', fontSize: 13, color: TEXT, opacity: 0.75, lineHeight: 1.6, padding: '0 12px', textAlign: 'center', ...getInlineStyle(`ceremony_${safeIdx}_defuntsFin`) }}
                            />
                          )}
                        </div>
                      </AnimSection></DraggableElement>
                    )}
                    {(hasGp || parents1.length > 0 || parents2.length > 0) && ceremony.type === 'Cérémonie religieuse / Houppa' && (() => {
                      const ovIf = (key: string, def: string) => ov[key] && ov[key] !== def ? ov[key] : ''

                      // ── Premium layout: 2 colonnes famille mariée (gauche) / marié (droite) ──
                      if (data.premiumCover) {
                        const PF = 'var(--font-playfair-display)'
                        const nameStyle: React.CSSProperties = { fontFamily: PF, fontStyle: 'italic', fontSize: 13, color: '#1B2A5E', lineHeight: 1.8, textAlign: 'center' }
                        return (
                        <AnimSection animStyle={anim} delay={120} skipAnim={canEdit}>
                          <div style={{ padding: '0 24px 24px', overflow: 'hidden' }}>
                            {/* 2 colonnes : famille 1 (gauche) — famille 2 (droite) */}
                            <div style={{ display: 'flex', justifyContent: 'center', gap: 24 }}>
                              {/* Colonne gauche — Famille Prescillia */}
                              <div style={{ flex: 1, maxWidth: 200, textAlign: 'center' }}>
                                {gpPa1 && <div style={nameStyle}>{ov.gpPa1 || gpPa1}</div>}
                                {gpMa1 && <div style={nameStyle}>{ov.gpMa1 || gpMa1}</div>}
                                {hasGp && parents1.length > 0 && <div style={{ width: 40, height: 0.5, background: '#C9A264', opacity: 0.3, margin: '8px auto' }} />}
                                {parents1.map((l,j) => <div key={`p1_${j}`} style={nameStyle}>{ov[`parents1_${j}`] || l}</div>)}
                              </div>
                              {/* Colonne droite — Famille Jonas */}
                              <div style={{ flex: 1, maxWidth: 200, textAlign: 'center' }}>
                                {gpPa2 && <div style={nameStyle}>{ov.gpPa2 || gpPa2}</div>}
                                {gpMa2 && <div style={nameStyle}>{ov.gpMa2 || gpMa2}</div>}
                                {hasGp && parents2.length > 0 && <div style={{ width: 40, height: 0.5, background: '#C9A264', opacity: 0.3, margin: '8px auto' }} />}
                                {parents2.map((l,j) => <div key={`p2_${j}`} style={nameStyle}>{ov[`parents2_${j}`] || l}</div>)}
                              </div>
                            </div>
                            {/* Texte invitation centré */}
                            <div style={{ textAlign: 'center', marginTop: 24, fontFamily: PF, fontStyle: 'italic', fontSize: 14, color: '#1B2A5E', lineHeight: 1.7, marginBottom: 20 }}>
                              <InlineEdit
                                value={ov[`ceremony_${safeIdx}_joie`] || ''}
                                defaultValue={hasGp ? t.fairepart.joyMessageGp : t.fairepart.joyMessage}
                                editable={canEdit}
                                onChange={(v) => onUpdate?.({ textOverrides: { ...data.textOverrides, [`ceremony_${safeIdx}_joie`]: v } })}
                                onStyleChange={(patch) => setInlineStyle(`ceremony_${safeIdx}_joie`, patch)}
                                style={{ fontFamily: PF, fontStyle: 'italic', fontSize: 14, color: '#1B2A5E', textAlign: 'center', lineHeight: 1.7 }}
                              />
                            </div>
                          </div>
                        </AnimSection>
                        )
                      }

                      // ── Standard layout (original, unchanged) ──
                      const gpStyle = { fontFamily: FC, fontStyle: 'italic' as const, fontSize: 'clamp(10px, 2.8vw, 13px)', color: TEXT, lineHeight: 1.5, whiteSpace: 'nowrap' as const }
                      return (
                      <>
                      <AnimSection animStyle={anim} delay={120} skipAnim={canEdit}>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 6, marginBottom: 2, textAlign: 'center' }}>
                          <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                            {gpPa1 && <DraggableElement id={pre+"gpPa1"} layout={layout} onLayoutChange={setLayout} editable={canEdit}><InlineEdit value={ovIf('gpPa1', gpPa1)} defaultValue={gpPa1} editable={canEdit} onChange={(v) => onUpdate?.({ textOverrides: { ...data.textOverrides, gpPa1: v } })} onStyleChange={(patch) => setInlineStyle('gpPa1', patch)} style={{ ...gpStyle, ...getInlineStyle('gpPa1') }} /></DraggableElement>}
                            {gpMa1 && <DraggableElement id={pre+"gpMa1"} layout={layout} onLayoutChange={setLayout} editable={canEdit}><InlineEdit value={ovIf('gpMa1', gpMa1)} defaultValue={gpMa1} editable={canEdit} onChange={(v) => onUpdate?.({ textOverrides: { ...data.textOverrides, gpMa1: v } })} onStyleChange={(patch) => setInlineStyle('gpMa1', patch)} style={{ ...gpStyle, ...getInlineStyle('gpMa1') }} /></DraggableElement>}
                          </div>
                          <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                            {gpPa2 && <DraggableElement id={pre+"gpPa2"} layout={layout} onLayoutChange={setLayout} editable={canEdit}><InlineEdit value={ovIf('gpPa2', gpPa2)} defaultValue={gpPa2} editable={canEdit} onChange={(v) => onUpdate?.({ textOverrides: { ...data.textOverrides, gpPa2: v } })} onStyleChange={(patch) => setInlineStyle('gpPa2', patch)} style={{ ...gpStyle, ...getInlineStyle('gpPa2') }} /></DraggableElement>}
                            {gpMa2 && <DraggableElement id={pre+"gpMa2"} layout={layout} onLayoutChange={setLayout} editable={canEdit}><InlineEdit value={ovIf('gpMa2', gpMa2)} defaultValue={gpMa2} editable={canEdit} onChange={(v) => onUpdate?.({ textOverrides: { ...data.textOverrides, gpMa2: v } })} onStyleChange={(patch) => setInlineStyle('gpMa2', patch)} style={{ ...gpStyle, ...getInlineStyle('gpMa2') }} /></DraggableElement>}
                          </div>
                        </div>
                      </AnimSection>
                      {(parents1.length > 0 || parents2.length > 0) && (
                        <AnimSection animStyle={anim} delay={150} skipAnim={canEdit}>
                          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 6, marginBottom: 6, textAlign: 'center' }}>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                              {parents1.map((l,j)=><DraggableElement key={j} id={pre+`p1_${j}`} layout={layout} onLayoutChange={setLayout} editable={canEdit}><InlineEdit value={ov[`parents1_${j}`] && ov[`parents1_${j}`] !== l ? ov[`parents1_${j}`] : ''} defaultValue={l} editable={canEdit} onChange={(v) => onUpdate?.({ textOverrides: { ...data.textOverrides, [`parents1_${j}`]: v } })} onStyleChange={(patch) => setInlineStyle(`parents1_${j}`, patch)} style={{ ...applyZoneStyle({ fontFamily: FC, fontStyle: 'italic', fontSize: 'clamp(10px, 2.8vw, 13px)', color: TEXT, lineHeight: 1.5, whiteSpace: 'nowrap' }, 'parents', data.zoneStyles), ...getInlineStyle(`parents1_${j}`) }} /></DraggableElement>)}
                            </div>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                              {parents2.map((l,j)=><DraggableElement key={j} id={pre+`p2_${j}`} layout={layout} onLayoutChange={setLayout} editable={canEdit}><InlineEdit value={ov[`parents2_${j}`] && ov[`parents2_${j}`] !== l ? ov[`parents2_${j}`] : ''} defaultValue={l} editable={canEdit} onChange={(v) => onUpdate?.({ textOverrides: { ...data.textOverrides, [`parents2_${j}`]: v } })} onStyleChange={(patch) => setInlineStyle(`parents2_${j}`, patch)} style={{ ...applyZoneStyle({ fontFamily: FC, fontStyle: 'italic', fontSize: 'clamp(10px, 2.8vw, 13px)', color: TEXT, lineHeight: 1.5, whiteSpace: 'nowrap' }, 'parents', data.zoneStyles), ...getInlineStyle(`parents2_${j}`) }} /></DraggableElement>)}
                            </div>
                          </div>
                        </AnimSection>
                      )}
                      </>
                    )})()}
                    {(parents1.length > 0 || parents2.length > 0 || hasGp) && ceremony.type === 'Cérémonie religieuse / Houppa' && !data.premiumCover && (
                      <DraggableElement id={pre+"joie"} layout={layout} onLayoutChange={setLayout} editable={canEdit}><AnimSection animStyle={anim} delay={180} skipAnim={canEdit}>
                        <InlineEdit
                          value={ov[`ceremony_${safeIdx}_joie`] || ''}
                          defaultValue={hasGp ? t.fairepart.joyMessageGp : t.fairepart.joyMessage}
                          editable={canEdit}
                          onChange={(v) => onUpdate?.({ textOverrides: { ...data.textOverrides, [`ceremony_${safeIdx}_joie`]: v } })}
                          onStyleChange={(patch) => setInlineStyle(`ceremony_${safeIdx}_joie`, patch)}
                          style={{ ...applyZoneStyle({ fontFamily: FC, fontStyle: 'italic', fontSize: 13, color: TEXT, textAlign: 'center', marginBottom: 24, lineHeight: 1.9, opacity: 0.82 }, 'narratif', data.zoneStyles), ...getInlineStyle(`ceremony_${safeIdx}_joie`) }}
                        />
                      </AnimSection></DraggableElement>
                    )}
                    {(ceremony.type === 'Cérémonie religieuse / Houppa' || ceremony.type === 'Mairie' || ceremony.type === 'Henné') && (
                      <DraggableElement id={pre+"prenoms"} layout={layout} onLayoutChange={setLayout} editable={canEdit}><AnimSection animStyle={anim} delay={250} skipAnim={canEdit}>
                        {/* Prénoms sur la même ligne — même style que l'accueil */}
                        <div style={applyZoneStyle({ fontFamily: FS, fontSize: 'clamp(28px,7vw,42px)', color: G, marginBottom: 8, lineHeight: 1.4, textAlign: 'center' }, 'prenoms', data.zoneStyles)}>
                          {data.marie1Prenom} <span style={{ fontFamily: 'var(--font-great-vibes)', fontSize: '0.65em', opacity: 0.55 }}>&</span> {data.marie2Prenom}
                        </div>
                        {/* Prénoms hébraïques */}
                        {data.mariageJuif && (data.marie1PrenomHebreu || data.marie2PrenomHebreu) && (
                          <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'center', gap: 'clamp(20px,5vw,40px)', marginBottom: 4 }}>
                            {data.marie1PrenomHebreu && <div dir="rtl" lang="he" style={{ fontFamily: 'var(--font-bellefair), serif', fontSize: 'clamp(18px,4.5vw,26px)', color: G, opacity: 0.6, lineHeight: 1.2 }}>{data.marie1PrenomHebreu}</div>}
                            {data.marie2PrenomHebreu && <div dir="rtl" lang="he" style={{ fontFamily: 'var(--font-bellefair), serif', fontSize: 'clamp(18px,4.5vw,26px)', color: G, opacity: 0.6, lineHeight: 1.2 }}>{data.marie2PrenomHebreu}</div>}
                          </div>
                        )}
                        {/* Deuxièmes prénoms (civil) */}
                        {!data.mariageJuif && (data.marie1Prenom2 || data.marie2Prenom2) && (
                          <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'center', gap: 'clamp(24px,6vw,48px)', marginBottom: 4 }}>
                            <div style={{ fontFamily: FC, fontStyle: 'italic', fontSize: 'clamp(14px,3.5vw,22px)', letterSpacing: '0.04em', color: G, opacity: 0.75, lineHeight: 1.3 }}>{data.marie1Prenom2 || ''}</div>
                            {(data.marie1Prenom2 && data.marie2Prenom2) && <div style={{ width: 1, height: 16, background: G, opacity: 0.2 }} />}
                            <div style={{ fontFamily: FC, fontStyle: 'italic', fontSize: 'clamp(14px,3.5vw,22px)', letterSpacing: '0.04em', color: G, opacity: 0.75, lineHeight: 1.3 }}>{data.marie2Prenom2 || ''}</div>
                          </div>
                        )}
                      </AnimSection></DraggableElement>
                    )}
                    <DraggableElement id={pre+"narratif"} layout={layout} onLayoutChange={setLayout} editable={canEdit}><AnimSection animStyle={anim} delay={280} skipAnim={canEdit}>
                      {ceremony.type === 'Mairie' ? (
                        <>
                          <InlineEdit
                            value={ov[`ceremony_${safeIdx}_sediront`] || ''}
                            defaultValue={t.fairepart.cardSeDiront}
                            editable={canEdit}
                            onChange={(v) => onUpdate?.({ textOverrides: { ...data.textOverrides, [`ceremony_${safeIdx}_sediront`]: v } })}
                            onStyleChange={(patch) => setInlineStyle(`ceremony_${safeIdx}_sediront`, patch)}
                            style={{ ...applyZoneStyle({ fontFamily: FC, fontStyle: 'italic', fontSize: 18, color: TEXT, textAlign: 'center', marginBottom: 8, opacity: 0.78 }, 'narratif', data.zoneStyles), ...getInlineStyle(`ceremony_${safeIdx}_sediront`) }}
                          />
                          <div style={applyZoneStyle({ fontFamily: FS, fontSize: 'clamp(48px,12vw,80px)', color: G, textAlign: 'center', lineHeight: 1, marginBottom: 12 }, 'prenoms', data.zoneStyles)}>{t.fairepart.cardOui}</div>
                          {!data.premiumCover && <div style={applyZoneStyle({ fontFamily: FC, fontStyle: 'italic', fontSize: 16, color: TEXT, textAlign: 'center', opacity: 0.7, marginBottom: 16 }, 'narratif', data.zoneStyles)}>le</div>}
                        </>
                      ) : ceremony.type === 'Cérémonie religieuse / Houppa' ? (
                        <InlineEdit
                          value={ov[`ceremony_${safeIdx}_honore`] || ''}
                          defaultValue={t.fairepart.cardHonore}
                          editable={canEdit}
                          onChange={(v) => onUpdate?.({ textOverrides: { ...data.textOverrides, [`ceremony_${safeIdx}_honore`]: v } })}
                          onStyleChange={(patch) => setInlineStyle(`ceremony_${safeIdx}_honore`, patch)}
                          style={{ ...applyZoneStyle({ fontFamily: FC, fontStyle: 'italic', fontSize: 15, color: TEXT, textAlign: 'center', marginTop: data.premiumCover ? 20 : 16, marginBottom: data.premiumCover ? 24 : 28, opacity: 0.78, lineHeight: 1.7, padding: '0 8px' }, 'narratif', data.zoneStyles), ...getInlineStyle(`ceremony_${safeIdx}_honore`) }}
                        />
                      ) : ceremony.type === 'Henné' ? (
                        <InlineEdit
                          value={ov[`ceremony_${safeIdx}_honore`] || ''}
                          defaultValue="ont le plaisir de vous inviter à leur Henné"
                          editable={canEdit}
                          onChange={(v) => onUpdate?.({ textOverrides: { ...data.textOverrides, [`ceremony_${safeIdx}_honore`]: v } })}
                          onStyleChange={(patch) => setInlineStyle(`ceremony_${safeIdx}_honore`, patch)}
                          style={{ ...applyZoneStyle({ fontFamily: FC, fontStyle: 'italic', fontSize: 15, color: TEXT, textAlign: 'center', marginTop: data.premiumCover ? 16 : 16, marginBottom: data.premiumCover ? 20 : 28, opacity: 0.78, lineHeight: 1.7, padding: '0 8px' }, 'narratif', data.zoneStyles), ...getInlineStyle(`ceremony_${safeIdx}_honore`) }}
                        />
                      ) : ceremony.type === 'Shabbat Hatan' ? (
                        <div style={{ textAlign: 'center', marginTop: data.premiumCover ? 0 : 32, marginBottom: data.premiumCover ? 0 : 16, padding: '0 12px' }}>
                          <InlineEdit
                            value={ov[`ceremony_${safeIdx}_lesfamilles`] || ''}
                            defaultValue="Les Familles"
                            editable={canEdit}
                            onChange={(v) => onUpdate?.({ textOverrides: { ...data.textOverrides, [`ceremony_${safeIdx}_lesfamilles`]: v } })}
                            onStyleChange={(patch) => setInlineStyle(`ceremony_${safeIdx}_lesfamilles`, patch)}
                            style={{ ...applyZoneStyle({ fontFamily: FC, fontStyle: 'italic', fontSize: 16, color: TEXT, lineHeight: 1.8, opacity: 0.85 }, 'narratif', data.zoneStyles), ...getInlineStyle(`ceremony_${safeIdx}_lesfamilles`) }}
                          />
                          <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'center', gap: 'clamp(6px,2vw,10px)', marginTop: 4, marginBottom: 4 }}>
                            <InlineEdit value={ov.shabbat_nom1 || ''} defaultValue={data.famille1PereNom || data.marie1Nom || '...'} editable={canEdit} onChange={(v) => onUpdate?.({ textOverrides: { ...data.textOverrides, shabbat_nom1: v } })} onStyleChange={(patch) => setInlineStyle('shabbat_nom1', patch)} style={{ ...applyZoneStyle({ fontFamily: FS, fontSize: 'clamp(24px,6vw,38px)', color: G, lineHeight: 1.3, overflow: 'visible', paddingBottom: 4 }, 'prenoms', data.zoneStyles), ...getInlineStyle('shabbat_nom1') }} />
                            <div style={{ fontFamily: 'var(--font-great-vibes)', fontSize: '0.65em', color: data.zoneStyles?.prenoms?.color || G, opacity: 0.55 }}>&</div>
                            <InlineEdit value={ov.shabbat_nom2 || ''} defaultValue={data.famille2PereNom || data.marie2Nom || '...'} editable={canEdit} onChange={(v) => onUpdate?.({ textOverrides: { ...data.textOverrides, shabbat_nom2: v } })} onStyleChange={(patch) => setInlineStyle('shabbat_nom2', patch)} style={{ ...applyZoneStyle({ fontFamily: FS, fontSize: 'clamp(24px,6vw,38px)', color: G, lineHeight: 1.3, overflow: 'visible', paddingBottom: 4 }, 'prenoms', data.zoneStyles), ...getInlineStyle('shabbat_nom2') }} />
                          </div>
                          <InlineEdit
                            value={ov[`ceremony_${safeIdx}_ravies`] || ''}
                            defaultValue="sont ravies de vous convier au Shabbat Hatan de"
                            editable={canEdit}
                            onChange={(v) => onUpdate?.({ textOverrides: { ...data.textOverrides, [`ceremony_${safeIdx}_ravies`]: v } })}
                            onStyleChange={(patch) => setInlineStyle(`ceremony_${safeIdx}_ravies`, patch)}
                            style={{ ...applyZoneStyle({ fontFamily: FC, fontStyle: 'italic', fontSize: 16, color: TEXT, lineHeight: 1.8, opacity: 0.85, marginBottom: 8 }, 'narratif', data.zoneStyles), ...getInlineStyle(`ceremony_${safeIdx}_ravies`) }}
                          />
                          <div style={applyZoneStyle({ fontFamily: FS, fontSize: 'clamp(28px,7vw,42px)', color: G, marginBottom: 8, lineHeight: 1.4, textAlign: 'center' }, 'prenoms', data.zoneStyles)}>
                            {data.marie1Prenom || 'Prénom'} <span style={{ fontFamily: 'var(--font-great-vibes)', fontSize: '0.65em', opacity: 0.55 }}>&</span> {data.marie2Prenom || 'Prénom'}
                          </div>
                        </div>
                      ) : (
                        <div style={{ marginBottom: 28 }}>
                          {ov[`ceremony_${safeIdx}_invitation`] === ' ' ? (
                            /* Phrase masquée — bouton pour la remettre (mariés uniquement) */
                            canEdit && <button type="button" onClick={() => onUpdate?.({ textOverrides: { ...data.textOverrides, [`ceremony_${safeIdx}_invitation`]: '' } })} style={{ ...BTN, fontSize: 10, padding: '4px 12px', borderRadius: 9999, border: `1px solid ${G}33`, color: G, opacity: 0.5, display: 'block', margin: '0 auto' }}>Afficher la phrase d&apos;invitation</button>
                          ) : ov[`ceremony_${safeIdx}_invitation`] ? (
                            /* Phrase personnalisée */
                            <>
                              <InlineEdit
                                value={ov[`ceremony_${safeIdx}_invitation`]}
                                defaultValue=""
                                editable={canEdit}
                                onChange={(v) => onUpdate?.({ textOverrides: { ...data.textOverrides, [`ceremony_${safeIdx}_invitation`]: v } })}
                                onStyleChange={(patch) => setInlineStyle(`ceremony_${safeIdx}_invitation`, patch)}
                                style={{ ...applyZoneStyle({ fontFamily: FC, fontStyle: 'italic', fontSize: 16, color: TEXT, textAlign: 'center', opacity: 0.85, lineHeight: 1.7, padding: '0 8px' }, 'narratif', data.zoneStyles), ...getInlineStyle(`ceremony_${safeIdx}_invitation`) }}
                              />
                              {canEdit && <button type="button" onClick={() => onUpdate?.({ textOverrides: { ...data.textOverrides, [`ceremony_${safeIdx}_invitation`]: ' ' } })} style={{ ...BTN, fontSize: 9, padding: '2px 10px', borderRadius: 9999, border: `1px solid ${G}22`, color: G, opacity: 0.4, display: 'block', margin: '4px auto 0' }}>Masquer</button>}
                            </>
                          ) : (
                            /* Phrase par défaut */
                            <>
                              <div style={applyZoneStyle({ padding: '0 8px' }, 'narratif', data.zoneStyles)}>
                                {renderInvitationPhrase(ceremony, data, G, TEXT, t.fairepart)}
                              </div>
                              {canEdit && (
                                <div style={{ display: 'flex', gap: 6, justifyContent: 'center', marginTop: 4 }}>
                                  <button type="button" onClick={() => onUpdate?.({ textOverrides: { ...data.textOverrides, [`ceremony_${safeIdx}_invitation`]: ' ' } })} style={{ ...BTN, fontSize: 9, padding: '2px 10px', borderRadius: 9999, border: `1px solid ${G}22`, color: G, opacity: 0.4 }}>Masquer</button>
                                  <button type="button" onClick={() => onUpdate?.({ textOverrides: { ...data.textOverrides, [`ceremony_${safeIdx}_invitation`]: 'ont le plaisir de vous convier à célébrer leur mariage' } })} style={{ ...BTN, fontSize: 9, padding: '2px 10px', borderRadius: 9999, border: `1px solid ${G}22`, color: G, opacity: 0.4 }}>Modifier</button>
                                </div>
                              )}
                            </>
                          )}
                        </div>
                      )}
                    </AnimSection></DraggableElement>
                    <div style={{ height: data.premiumCover ? 0 : data.continuousLayout ? 4 : data.premiumCeremonyStyle ? 4 : 20 }} />
                    {/* Date + lieu : masqués si Shabbat Hatan avec multiJours (les moments ont leur propre date/lieu) */}
                    {!(ceremony.type === 'Shabbat Hatan' && ceremony.multiJours && ceremony.multiJours.length > 0) && (<>
                    <DraggableElement id={pre+"date"} layout={layout} onLayoutChange={setLayout} editable={canEdit}><AnimSection animStyle={anim} delay={400} skipAnim={canEdit}>{ceremony.date ? (() => {
                        const d = new Date(ceremony.date + 'T12:00:00')
                        const parts = new Intl.DateTimeFormat(locale === 'en' ? 'en-US' : 'fr-FR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' }).formatToParts(d)
                        const cap = (s: string) => s.charAt(0).toUpperCase() + s.slice(1)
                        const jourSemaine = cap(parts.find(p => p.type === 'weekday')?.value || '')
                        const jour = parts.find(p => p.type === 'day')?.value || ''
                        const mois = cap(parts.find(p => p.type === 'month')?.value || '')
                        const annee = parts.find(p => p.type === 'year')?.value || ''
                        return (
                          <>
                          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', margin: data.continuousLayout ? '4px 0 4px' : data.premiumCeremonyStyle ? '8px 0 4px' : '24px 0 8px' }}>
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 16 }}>
                              <div style={{ width: 80, textAlign: 'right' }}>
                                <div style={applyZoneStyle({ fontFamily: FP, borderBottom: `1px solid ${G}44`, paddingBottom: 4, letterSpacing: 4, fontSize: 10, fontWeight: 600, color: G, display: 'inline-block', textTransform: 'uppercase' }, 'dateHeure', data.zoneStyles)}>{jourSemaine}</div>
                              </div>
                              <div style={applyZoneStyle({ border: `1.5px solid ${G}`, borderRadius: 4, padding: '10px 18px', fontSize: 40, fontFamily: FP, color: G, fontWeight: 700, minWidth: 64, textAlign: 'center', lineHeight: 1 }, 'dateHeure', data.zoneStyles)}>{jour}</div>
                              <div style={{ width: 80, textAlign: 'left' }}>
                                <div style={applyZoneStyle({ fontFamily: FP, borderBottom: `1px solid ${G}44`, paddingBottom: 4, letterSpacing: 4, fontSize: 10, fontWeight: 600, color: G, display: 'inline-block', textTransform: 'uppercase' }, 'dateHeure', data.zoneStyles)}>{mois}</div>
                              </div>
                            </div>
                            <div style={applyZoneStyle({ fontFamily: FC, fontSize: 12, color: TEXT, letterSpacing: 3, marginTop: 8, opacity: 0.7 }, 'dateHeure', data.zoneStyles)}>{annee}</div>
                          </div>
                          {data.mariageJuif && hebrewDate && <div style={{ fontFamily: 'serif', fontSize: 15, color: G, direction: 'rtl', textAlign: 'center', marginBottom: 8, opacity: 0.8 }}>{hebrewDate}</div>}
                          {ceremony.heure && <div style={applyZoneStyle({ fontFamily: FP, fontSize: 20, fontWeight: 600, color: G, textAlign: 'center', marginBottom: data.continuousLayout ? 8 : 24, letterSpacing: 3, lineHeight: 1.2 }, 'dateHeure', data.zoneStyles)}>{formatHeure(ceremony.heure, locale)}</div>}
                          </>
                        )
                      })() : null}</AnimSection></DraggableElement>
                    <DraggableElement id={pre+"lieu"} layout={layout} onLayoutChange={setLayout} editable={canEdit}><AnimSection animStyle={anim} delay={440} skipAnim={canEdit}>
                      {(ov[`ceremony_${safeIdx}_lieu`] || ceremony.lieu) && <InlineEdit
                        value={ov[`ceremony_${safeIdx}_lieu`] || ''}
                        defaultValue={ceremony.type === 'Mairie' ? conjonctionLieu(ceremony.lieu, locale) : formatLieu(ceremony.lieu, locale)}
                        editable={canEdit}
                        onChange={(v) => onUpdate?.({ textOverrides: { ...data.textOverrides, [`ceremony_${safeIdx}_lieu`]: v } })}
                        onStyleChange={(patch) => setInlineStyle(`ceremony_${safeIdx}_lieu`, patch)}
                        style={{ ...applyZoneStyle({ fontFamily: FP, fontWeight: 700, fontSize: 19, color: TEXT, textAlign: 'center', lineHeight: 1.5, marginBottom: 8, letterSpacing: 0.5 }, 'lieu', data.zoneStyles), ...getInlineStyle(`ceremony_${safeIdx}_lieu`) }}
                      />}
                      {ceremony.adresse && <InlineEdit
                        value={ov[`ceremony_${safeIdx}_adresse`] || ''}
                        defaultValue={ceremony.adresse}
                        editable={canEdit}
                        onChange={(v) => onUpdate?.({ textOverrides: { ...data.textOverrides, [`ceremony_${safeIdx}_adresse`]: v } })}
                        onStyleChange={(patch) => setInlineStyle(`ceremony_${safeIdx}_adresse`, patch)}
                        style={{ fontFamily: FC, fontSize: 14, color: theme.textSecondaire, textAlign: 'center', lineHeight: 1.65, marginBottom: data.premiumCover ? 8 : 24, letterSpacing: 0.3, ...getInlineStyle(`ceremony_${safeIdx}_adresse`) }}
                      />}
                      {ceremony.suiviDAutre && ceremony.evenementSuivantNom && (
                        <div style={{ fontFamily: FC, fontStyle: 'italic', fontSize: 'clamp(11px, 2.8vw, 14px)', color: TEXT, textAlign: 'center', marginBottom: 8, borderTop: `1px solid ${G}22`, paddingTop: 14, maxWidth: '90%', margin: '0 auto 8px', textWrap: 'balance' } as React.CSSProperties}>
                          <InlineEdit
                            value={ov[`ceremony_${safeIdx}_suivide`] || ''}
                            defaultValue={`${t.fairepart.eventFollowedBy} ${ceremony.evenementSuivantNom}${ceremony.evenementSuivantAdresse ? '\n' + ceremony.evenementSuivantAdresse : ''}`}
                            editable={canEdit}
                            onChange={(v) => onUpdate?.({ textOverrides: { ...data.textOverrides, [`ceremony_${safeIdx}_suivide`]: v } })}
                            onStyleChange={(patch) => setInlineStyle(`ceremony_${safeIdx}_suivide`, patch)}
                            style={{ fontFamily: FC, fontStyle: 'italic', fontSize: 'clamp(11px, 2.8vw, 14px)', color: TEXT, textAlign: 'center', lineHeight: 1.7, ...getInlineStyle(`ceremony_${safeIdx}_suivide`) }}
                          />
                        </div>
                      )}
                    </AnimSection></DraggableElement>
                    </>)}
                    {/* Shabbat Hatan multi-jours */}
                    {ceremony.type === 'Shabbat Hatan' && ceremony.multiJours && ceremony.multiJours.length > 0 && (
                      <AnimSection animStyle={anim} delay={460} skipAnim={canEdit}>
                        {(() => {
                          const moments = ceremony.multiJours!
                          const allLieux = moments.map(m => m.lieu || '').filter(Boolean)
                          const allAdresses = moments.map(m => m.adresse || '').filter(Boolean)
                          const sameLieu = allLieux.length > 0 && allLieux.every(l => l === allLieux[0])
                          const sameAdresse = allAdresses.length > 0 && allAdresses.every(a => a === allAdresses[0])
                          // Lieu global : celui de la cérémonie OU le lieu commun des moments
                          const globalLieu = ceremony.lieu || (sameLieu ? allLieux[0] : '')
                          const globalAdresse = ceremony.adresse || (sameAdresse ? allAdresses[0] : '')
                          const showGlobalLieu = !!globalLieu && (sameLieu || !allLieux.length)

                          return (
                          <div style={{ marginTop: data.premiumCover ? 0 : 8 }}>
                            {/* Lieu commun affiché une seule fois au-dessus */}
                            {showGlobalLieu && (
                              <div style={{ textAlign: 'center', marginBottom: 20 }}>
                                <div style={{ fontFamily: FP, fontWeight: 700, fontSize: 17, color: TEXT, marginBottom: 4 }}>{globalLieu}</div>
                                {globalAdresse && <div style={{ fontFamily: FC, fontSize: 13, color: theme.textSecondaire }}>{globalAdresse}</div>}
                              </div>
                            )}
                            {moments.map((moment, mi) => {
                              // Afficher le lieu seulement s'il est différent du lieu global
                              const showMomentLieu = !showGlobalLieu && !!moment.lieu
                              const showMomentAdresse = !showGlobalLieu && !!moment.adresse
                              return (
                              <div key={moment.id} style={{ marginBottom: mi < moments.length - 1 ? 24 : 16 }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: 12, justifyContent: 'center', marginBottom: 12, maxWidth: 200, margin: '0 auto 12px' }}>
                                  <div style={{ flex: 1, height: 0.5, background: `linear-gradient(to right, transparent, ${G}40)` }} />
                                  <span style={{ color: G, fontSize: 8, opacity: 0.5 }}>✡</span>
                                  <div style={{ flex: 1, height: 0.5, background: `linear-gradient(to left, transparent, ${G}40)` }} />
                                </div>
                                <div style={{ fontFamily: FP, fontSize: 12, fontWeight: 600, letterSpacing: 4, textTransform: 'uppercase', color: G, textAlign: 'center', marginBottom: 8 }}>{moment.label}</div>
                                {moment.heure && <div style={{ fontFamily: FP, fontSize: 18, fontWeight: 600, color: G, textAlign: 'center', marginBottom: 6, letterSpacing: 2 }}>{formatHeure(moment.heure, locale)}</div>}
                                {showMomentLieu && <div style={{ fontFamily: FP, fontWeight: 700, fontSize: 17, color: TEXT, textAlign: 'center', marginBottom: 4 }}>{moment.lieu}</div>}
                                {showMomentAdresse && <div style={{ fontFamily: FC, fontSize: 13, color: theme.textSecondaire, textAlign: 'center', marginBottom: 4 }}>{moment.adresse}</div>}
                                {moment.note && <div style={{ fontFamily: FC, fontStyle: 'italic', fontSize: 12, color: theme.textSecondaire, textAlign: 'center', opacity: 0.8 }}>{moment.note}</div>}
                                {role === 'guest' && showMomentAdresse && moment.adresse && (
                                  <div style={{ marginTop: 10, textAlign: 'center' }}>
                                    <ItineraireButtons adresse={moment.adresse} theme={theme} compact />
                                  </div>
                                )}
                              </div>
                            )})}
                          </div>
                          )
                        })()}
                      </AnimSection>
                    )}
                    {ceremony.note && (
                      <DraggableElement id={pre+"note"} layout={layout} onLayoutChange={setLayout} editable={canEdit}><AnimSection animStyle={anim} delay={460} skipAnim={canEdit}><div style={{ fontFamily: FC, fontStyle: 'italic', fontSize: 13, color: theme.textSecondaire, textAlign: 'center', marginBottom: 16, padding: '12px 0', borderTop: `1px solid ${G}18` }}>{ceremony.note}</div></AnimSection></DraggableElement>
                    )}
                    {ceremony.adresse && (
                      <DraggableElement id={pre+"itineraire"} layout={layout} onLayoutChange={setLayout} editable={canEdit}><AnimSection animStyle={anim} delay={480} skipAnim={canEdit}><div style={{ marginTop: data.continuousLayout ? 12 : 32 }}>
                          <div style={{ textAlign: 'center' }}>
                            <div style={{ width: 60, height: 0.5, background: `linear-gradient(to right, transparent, ${G}30, transparent)`, margin: '0 auto 16px' }} />
                            <div style={{ fontFamily: FP, fontSize: 10, fontWeight: 600, letterSpacing: 5, textTransform: 'uppercase' as const, color: G, marginBottom: 16, opacity: 0.6 }}>
                              {locale === 'en' ? 'Get there' : 'S\'y rendre'}
                            </div>
                            <ItineraireButtons adresse={ceremony.adresse} theme={theme} />
                          </div>
                      </div></AnimSection></DraggableElement>
                    )}
                    {(ceremony.transport || ceremony.hebergement) && (
                      <DraggableElement id={pre+"infos"} layout={layout} onLayoutChange={setLayout} editable={canEdit}><AnimSection animStyle={anim} delay={500} skipAnim={canEdit}><div style={{ marginTop: data.continuousLayout ? 12 : 32, paddingTop: data.continuousLayout ? 8 : 24 }}>
                          <div style={{ width: 60, height: 0.5, background: `linear-gradient(to right, transparent, ${G}30, transparent)`, margin: '0 auto 16px' }} />
                          <div style={{ fontFamily: FP, fontSize: 10, fontWeight: 600, letterSpacing: 5, textTransform: 'uppercase' as const, color: G, textAlign: 'center', marginBottom: 20, opacity: 0.6 }}>
                            {t.fairepart.infoPratiques}
                          </div>
                          {ceremony.transport && (
                            <div style={{ marginBottom: ceremony.hebergement ? 18 : 0, textAlign: 'center' }}>
                              <div style={{ fontFamily: FC, fontStyle: 'italic', fontSize: 14, color: G, marginBottom: 6, fontWeight: 600 }}>{t.fairepart.transportIcon}</div>
                              <div style={applyZoneStyle({ fontFamily: FC, fontSize: 13, color: TEXT, lineHeight: 1.7, whiteSpace: 'pre-wrap', opacity: 0.9 }, 'infos', data.zoneStyles)}><Linkify text={ceremony.transport} color={G} /></div>
                            </div>
                          )}
                          {ceremony.hebergement && (
                            <div style={{ textAlign: 'center' }}>
                              <div style={{ fontFamily: FC, fontStyle: 'italic', fontSize: 14, color: G, marginBottom: 6, fontWeight: 600 }}>{t.fairepart.hebergementIcon}</div>
                              <div style={applyZoneStyle({ fontFamily: FC, fontSize: 13, color: TEXT, lineHeight: 1.7, whiteSpace: 'pre-wrap', opacity: 0.9 }, 'infos', data.zoneStyles)}><Linkify text={ceremony.hebergement} color={G} /></div>
                            </div>
                          )}
                      </div></AnimSection></DraggableElement>
                    )}
                  </div>
                    )
                  })()}
                </section>
              </CeremonyCard>
              {data.premiumCeremonyStyle && !data.continuousLayout && i < sorted.length - 1 && (
                <div style={{ textAlign: 'center', padding: '12px 0' }}>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src="https://gsihevihnthjsm8z.public.blob.vercel-storage.com/8-m1qRmlxuohr4uM00k8cFNWcigTbJO5.png" alt="" style={{ width: 180, height: 'auto', objectFit: 'contain', display: 'inline-block', opacity: 0.85 }} />
                </div>
              )}
              {/* Séparateur entre cérémonies retiré — les indicateurs de page suffisent */}
              {/* Pages supplémentaires rendues AVANT chaque cérémonie (voir plus haut) */}
            </React.Fragment>
          )
        })}

        {/* Pages supplémentaires qui ne matchent aucune cérémonie → après tout */}
        {(data.customPages ?? []).filter(p => {
          return !sorted.some((_, si) => {
            const di = (data.ceremonies ?? []).findIndex(c => c.type === sorted[si].type && c.date === sorted[si].date && c.lieu === sorted[si].lieu)
            return p.position === (di >= 0 ? di : si)
          })
        }).map(page => (
          <CustomPageCard
            key={page.id}
            page={page}
            theme={theme}
            editable={role !== 'guest' && !!onUpdate}
            onUpdate={(patch) => {
              const pages = (data.customPages ?? []).map(p => p.id === page.id ? { ...p, ...patch } : p)
              onUpdate?.({ customPages: pages })
            }}
            onRemove={() => onUpdate?.({ customPages: (data.customPages ?? []).filter(p => p.id !== page.id) })}
          />
        ))}

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

        </>
        )}

        {/* ── Zones de texte personnalisées (ajoutées par les mariés) ── */}
        {(data.customTextZones ?? []).map((zone) => {
          const canEditZone = role !== 'guest' && !!onUpdate
          const zLayout = data.accueilLayout ?? {}
          const zSetLayout = (l: LayoutMap) => onUpdate?.({ accueilLayout: l })
          const zoneInlineStyle = (() => {
            if (!zone.style) return {}
            try { return JSON.parse(zone.style) as React.CSSProperties } catch { return {} }
          })()
          return (
            <div key={zone.id} style={{ position: 'relative', padding: '16px 24px', textAlign: 'center' }}>
              {canEditZone && (
                <button
                  type="button"
                  onClick={() => {
                    onUpdate?.({ customTextZones: (data.customTextZones ?? []).filter(z => z.id !== zone.id) })
                  }}
                  style={{ ...BTN, position: 'absolute', top: 4, right: 4, zIndex: 20, width: 22, height: 22, borderRadius: '50%', border: '1px solid #e0d5c8', background: 'white', color: '#c9a84c', fontSize: 12, fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 0, boxShadow: '0 1px 4px rgba(0,0,0,0.1)', cursor: 'pointer' }}
                >
                  ✕
                </button>
              )}
              <DraggableElement id={`ctz-${zone.id}`} layout={zLayout} onLayoutChange={zSetLayout} editable={canEditZone}>
                <InlineEdit
                  value={zone.text}
                  defaultValue="Votre texte ici"
                  editable={canEditZone}
                  onChange={(v) => {
                    const zones = (data.customTextZones ?? []).map(z => z.id === zone.id ? { ...z, text: v } : z)
                    onUpdate?.({ customTextZones: zones })
                  }}
                  onStyleChange={(patch) => {
                    const existing = zoneInlineStyle
                    const merged = { ...existing, ...patch }
                    const zones = (data.customTextZones ?? []).map(z => z.id === zone.id ? { ...z, style: JSON.stringify(merged) } : z)
                    onUpdate?.({ customTextZones: zones })
                  }}
                  style={{
                    fontFamily: FC, fontSize: 16, color: TEXT, lineHeight: 1.7, textAlign: 'center' as const,
                    ...zoneInlineStyle,
                  }}
                />
              </DraggableElement>
            </div>
          )
        })}
        {/* Bouton ajout zone de texte — visible uniquement pour les mariés */}
        {role !== 'guest' && !!onUpdate && (
          <div style={{ textAlign: 'center', padding: '8px 0 16px' }}>
            <button
              type="button"
              onClick={() => {
                const newZone = { id: `tz-${Date.now()}`, text: 'Votre texte ici', x: 0, y: 0 }
                onUpdate?.({ customTextZones: [...(data.customTextZones ?? []), newZone] })
              }}
              style={{ ...BTN, padding: '8px 20px', borderRadius: 9999, border: `1.5px dashed ${G}60`, background: 'transparent', color: G, fontSize: 12, fontWeight: 600, fontFamily: FC, cursor: 'pointer', opacity: 0.7, transition: 'opacity 0.2s' }}
              onMouseEnter={e => (e.currentTarget.style.opacity = '1')}
              onMouseLeave={e => (e.currentTarget.style.opacity = '0.7')}
            >
              + Ajouter un texte
            </button>
          </div>
        )}

        {/* Indicateur page RSVP — visible uniquement pour les mariés */}
        {role !== 'guest' && (
          <div style={{ textAlign: 'center', padding: '12px 0 4px', background: `${G}08`, borderTop: `1px dashed ${G}30`, borderBottom: `1px dashed ${G}30` }}>
            <span style={{ fontFamily: FP, fontSize: 10, fontWeight: 700, letterSpacing: 4, textTransform: 'uppercase', color: G, opacity: 0.5 }}>— PAGE {sorted.length + 2} : CONFIRMATION —</span>
          </div>
        )}
        {/* SECTION 5 : Illustration RSVP + Carton-réponse */}
        <section id="rsvp-section" style={{ paddingTop: 40, paddingBottom: 52, scrollMarginTop: 60 }}>
          {/* Illustration RSVP — éditable par les mariés */}
          {(() => {
            const rsvpUrl = data.rsvpIllustrationUrl || (() => {
              const hash = ((data.marie1Prenom || '').length + (data.marie2Prenom || '').length) % ILLUSTRATIONS_RSVP.length
              return ILLUSTRATIONS_RSVP[hash].url
            })()
            const canEditRsvp = role !== 'guest' && !!onUpdate
            return (
              <div style={{ marginBottom: 8 }}>
                <EditableIllustration
                  url={rsvpUrl}
                  size={data.rsvpIllustrationSize ?? 60}
                  offsetX={data.rsvpIllustrationOffsetX ?? 0}
                  offsetY={data.rsvpIllustrationOffsetY ?? 0}
                  editable={canEditRsvp}
                  accent={G}
                  ceremonyType="RSVP"
                  onChangeSize={(sz) => onUpdate?.({ rsvpIllustrationSize: sz })}
                  onChangeOffsetX={(x) => onUpdate?.({ rsvpIllustrationOffsetX: x })}
                  onChangeOffsetY={(y) => onUpdate?.({ rsvpIllustrationOffsetY: y })}
                  onChangeUrl={(url) => onUpdate?.({ rsvpIllustrationUrl: url })}
                  onRemove={() => onUpdate?.({ rsvpIllustrationUrl: '', rsvpIllustrationSize: 60, rsvpIllustrationOffsetX: 0, rsvpIllustrationOffsetY: 0 })}
                  darkBg={!!theme.dark}
                />
              </div>
            )
          })()}
          {role === 'guest' && (
            <InlineRSVP ceremonies={sorted.filter(c => !c.rsvpHidden)} accent={G} textColor={TEXT} shareId={_lastShareId} mariee1={data.marie1Prenom} mariee2={data.marie2Prenom} rsvpText={data.textOverrides?.['global_rsvpText']} rsvpDeadline={data.rsvpDeadline} locale={locale} />
          )}
          {role === 'couple' && (
            <div style={{ textAlign: 'center', paddingTop: 20 }}>
              <button onClick={onRsvpListOpen} style={{ ...BTN, background: G, color: 'white', border: 'none', borderRadius: 2, padding: '13px 28px', fontFamily: FP, fontSize: 12, fontWeight: 700, letterSpacing: 2, boxShadow: `0 4px 16px ${G}44` }}>
                Voir les réponses
              </button>
            </div>
          )}
        </section>
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
          <a href="https://getlovit.fr" target="_blank" rel="noopener noreferrer" style={{ fontFamily: 'var(--font-cormorant-garamond)', fontSize: 11, letterSpacing: '0.2em', fontVariant: 'small-caps', color: G, textDecoration: 'none', opacity: 0.5, transition: 'opacity 0.3s ease' }}
            onMouseEnter={e => (e.currentTarget.style.opacity = '0.85')}
            onMouseLeave={e => (e.currentTarget.style.opacity = '0.5')}>
            créé avec <span style={{ fontSize: 10, verticalAlign: 'middle', margin: '0 4px' }}>♥</span> par Lov&apos;it
          </a>
        </AnimSection>
      </footer>

      {/* Musique — déplacé en bas du DOM mais position:fixed donc visible partout */}
      {data.musicUrl && <AudioPlayer musicUrl={data.musicUrl} accent={G} playRef={audioPlayRef} />}
      {/* Le bouton 🔊 est en position:fixed, visible sur toutes les pages */}
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
function CardsView({ data, onEdit, onReset, isShared, role, onUpdate, isPaid = true, activeShareId: parentShareId }: { data: FormData; onEdit: () => void; onReset: () => void; isShared: boolean; role: string | null; onUpdate?: (d: Partial<FormData>) => void; isPaid?: boolean; activeShareId?: string | null }) {
  const { t } = useT()
  const theme = THEMES[data.style]
  const allSorted = sortByDate(data.ceremonies)
  // Filtrer par ?events= — les indices correspondent à allSorted (trié par date)
  const sorted = (() => {
    if (typeof window === 'undefined') return allSorted
    const eventsParam = new URLSearchParams(window.location.search).get('events')
    if (!eventsParam) return allSorted
    const indices = eventsParam.split(',').map(Number).filter(i => !isNaN(i) && i >= 0 && i < allSorted.length)
    return indices.length > 0 ? indices.map(i => allSorted[i]) : allSorted
  })()
  const [rsvpOpen, setRsvpOpen] = useState(false)
  const [rsvpListOpen, setRsvpListOpen] = useState(false)
  const [_lastShareId, setLastShareId] = useState<string | null>(null)
  // lastShareId = toujours une valeur valide : soit sauvegardé localement, soit parentShareId, soit URL
  const lastShareId = _lastShareId || parentShareId || (typeof window !== 'undefined' ? new URLSearchParams(window.location.search).get('share') : null)
  const [ytMuted, setYtMuted] = useState(false)
  const ytIframeRef = useRef<HTMLIFrameElement | null>(null)
  const [textOverrides, setTextOverrides] = useState<Record<string, string>>({})
  const [zoneStyles, setZoneStyles] = useState<ZoneStyles>(data.zoneStyles ?? {})
  const [textEditOpen, setTextEditOpen] = useState(false)
  const [globalColorOpen, setGlobalColorOpen] = useState(false)
  const [shareModalOpen, setShareModalOpen] = useState(false)
  const [restoreModalOpen, setRestoreModalOpen] = useState(false)
  const [restoring, setRestoring] = useState(false)
  const [guestUrl, setGuestUrl] = useState<string | null>(null)
  const [coupleUrl, setCoupleUrl] = useState<string | null>(null)
  const [sharing, setSharing] = useState(false)
  const [sharingStatus, setSharingStatus] = useState('')
  const [saving, setSaving] = useState(false)
  const [coverOpen, setCoverOpen] = useState(!data.customDesignMode) // cover fermée si design custom (pour montrer la cover image)

  // Ouvrir directement le modal RSVP si ?rsvp=1 dans l'URL
  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    if (params.get('rsvp') === '1') {
      const id = params.get('share')
      if (id) setLastShareId(id)
      setCoverOpen(true)
      setRsvpListOpen(true)
    }
  }, [])

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

 // ✅ Enregistrer les modifications et mettre à jour la version publiée (visible par les invités)
  const handleSave = async () => {
    const existingId = parentShareId || lastShareId
      || (() => { try { return new URLSearchParams(window.location.search).get('share') } catch { return null } })()
    if (!existingId) {
      showToast('Aucun faire-part à enregistrer — partagez d\'abord', 'error')
      return
    }
    if (saving) return
    setSaving(true)
    try {
      const mergedData = { ...data, textOverrides: { ...data.textOverrides, ...textOverrides }, zoneStyles }
      const photosDataToSend = (data.photosData ?? []).map(({ cropX, cropY, cropScale, faceCropUrl }) => ({ cropX, cropY, cropScale, faceCropUrl }))
      // Nettoyer les base64 des customPages et ceremonyImage avant envoi
      if (mergedData.customPages) {
        mergedData.customPages = mergedData.customPages.map(p => ({
          ...p,
          images: p.images.filter(img => !img.url.startsWith('data:'))
        }))
      }
      if (mergedData.ceremonies) {
        mergedData.ceremonies = mergedData.ceremonies.map(c => ({
          ...c,
          ceremonyImage: c.ceremonyImage?.startsWith('data:') ? '' : c.ceremonyImage
        }))
      }
      const dataToSend = { ...mergedData, photosFond: data.photosFond ?? [], photoFond: (data.photosFond ?? [])[0] ?? '', photosData: photosDataToSend }
      if (!dataToSend.slug || !dataToSend.slug.trim()) {
        dataToSend.slug = generateAutoSlug(dataToSend.marie1Prenom, dataToSend.marie2Prenom)
      }
      const res = await fetch('/api/save-share', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ ...dataToSend, fixedId: existingId }) })
      const json = await res.json()
      if (res.ok && json.id) {
        setLastShareId(json.id)
        showToast('Modifications enregistrées ! Les invités verront les changements.', 'success')
      } else {
        showToast('Erreur lors de l\'enregistrement : ' + (json.error || 'Réessayez'), 'error')
      }
    } catch {
      showToast('Erreur réseau — vérifiez votre connexion', 'error')
    } finally {
      setSaving(false)
    }
  }

  const handleShare = async () => {
    if (!isPaid) {
      // Sauvegarder le brouillon avant de rediriger
      try { localStorage.setItem('wedding-draft', JSON.stringify(data)) } catch { /* ignore */ }
      // Rediriger directement vers Stripe Checkout
      try {
        const pack = (() => { try { return localStorage.getItem('lovit_pack') === 'premium' ? 'premium' : 'essentiel' } catch { return 'essentiel' } })()
        const res = await fetch('/api/create-checkout', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ pack, locale: 'fr' }),
        })
        const { url } = await res.json()
        if (url) { window.location.href = url; return }
      } catch { /* fallback */ }
      window.location.href = '/paiement'
      return
    }
    if (sharing) return
    setSharing(true)
    try {
      const originalPhotos = data.photosFond ?? []
      let compressedPhotos: string[] = originalPhotos
      const photosDataToSend = (data.photosData ?? []).map(({ cropX, cropY, cropScale, faceCropUrl }) => ({ cropX, cropY, cropScale, faceCropUrl }))
      // Merger les modifications locales (textOverrides, zoneStyles) avec les données du formulaire
      const mergedData = { ...data, textOverrides: { ...data.textOverrides, ...textOverrides }, zoneStyles }
      // Nettoyer les base64 avant envoi
      if (mergedData.customPages) {
        mergedData.customPages = mergedData.customPages.map(p => ({
          ...p,
          images: p.images.filter(img => !img.url.startsWith('data:'))
        }))
      }
      if (mergedData.ceremonies) {
        mergedData.ceremonies = mergedData.ceremonies.map(c => ({
          ...c,
          ceremonyImage: c.ceremonyImage?.startsWith('data:') ? '' : c.ceremonyImage
        }))
      }
      const buildPayload = () => ({ ...mergedData, photosFond: compressedPhotos, photoFond: compressedPhotos[0] ?? '', photosData: photosDataToSend })
      compressedPhotos = originalPhotos
      setSharingStatus('Envoi...')
      const dataToSend = buildPayload()

      // ✅ Auto-génération du slug si non renseigné par les mariés
      // → garantit toujours une URL propre + preview WhatsApp dynamique
      if (!dataToSend.slug || !dataToSend.slug.trim()) {
        dataToSend.slug = generateAutoSlug(dataToSend.marie1Prenom, dataToSend.marie2Prenom)
      }

      const existingId = parentShareId || lastShareId
        || (() => { try { return new URLSearchParams(window.location.search).get('share') } catch { return null } })()
      if (!existingId) {
        showToast('Nouveau lien créé', 'success')
      }
      const res = await fetch('/api/save-share', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ ...dataToSend, fixedId: existingId }) })
      const json = await res.json()
      if (!res.ok || !json.id) {
        showToast('Erreur lors de la sauvegarde : ' + (json.error || 'Réessayez'), 'error')
        throw new Error(json.error || 'save-share failed')
      }
      // Forcer le MÊME ID pour le lien — ne jamais créer un 2ème lien
      if (existingId && json.id !== existingId) {
        console.warn('[handleShare] ID changé :', existingId, '→', json.id)
      }
      const id = json.id
      setLastShareId(id)
      // Ajouter ?v=timestamp pour forcer WhatsApp à recharger la preview
      const cacheBust = `?v=${Math.floor(Date.now() / 1000)}`
      const base = window.location.origin + '/faire-part?share=' + id
      if (data.slug) {
        setGuestUrl(window.location.origin + '/' + data.slug + cacheBust)
      } else {
        setGuestUrl(base + '&role=guest')
      }
      setCoupleUrl(base + '&role=couple')
      setShareModalOpen(true)
    } catch (err) {
      void err
      showToast(t.fairepart.errorShare, 'error')
    } finally {
      setSharing(false)
      setSharingStatus('')
    }
  }

  if (isShared) {
    return (
      <div style={{ backgroundColor: theme.fond, minHeight: '100vh', color: theme.texte, overflowX: 'hidden' }}>
        {/* Cover page pour les invités */}
        {!coverOpen && (
          <InvitationCover
            prenom1={data.marie1Prenom}
            prenom2={data.marie2Prenom}
            lieu={data.ceremonies?.[0]?.lieu}
            date={data.ceremonies?.[0]?.date}
            accent={theme.accent}
            fond={theme.fond}
            logoUrl={getLogoDisplayUrl(data)}
            logoColor={data.customLogoColor}
            onOpen={() => setCoverOpen(true)}
            mariageJuif={data.mariageJuif}
            illustrationUrl={data.illustrationCoupleId ? ILLUSTRATIONS_COUPLES.find(ic => ic.id === data.illustrationCoupleId)?.url : undefined}
            customDesignCoverUrl={data.customDesignMode ? data.customDesignCoverUrl : undefined}
            customDesignCoverVideoUrl={data.customDesignMode ? data.customDesignCoverVideoUrl : undefined}
            videoOverlayText1={data.videoOverlayText1}
            videoOverlayText2={data.videoOverlayText2}
            videoOverlayText3={data.videoOverlayText3}
            videoOverlayShowBsd={data.videoOverlayShowBsd}
            videoOverlayTextColor={data.videoOverlayTextColor}
            videoOverlayBgColor={data.videoOverlayBgColor}
            videoPosterUrl={data.videoPosterUrl}
          />
        )}
        {data.petalsEnabled && <FloatingPetals accent={theme.accent} />}
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
          onUpdate={onUpdate}
          onTextEdit={() => setTextEditOpen(true)}
        />
        {role === 'couple' && (
          <>
          {/* Panneau couleur globale */}
          {globalColorOpen && (
            <div style={{ position: 'fixed', bottom: 56, left: 0, right: 0, zIndex: 101, display: 'flex', justifyContent: 'center' }}>
              <div style={{ background: 'white', borderRadius: 16, padding: '16px 20px', boxShadow: '0 -4px 30px rgba(0,0,0,0.15)', border: '1px solid #e0d5c8', maxWidth: 380, width: '90%' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
                  <span style={{ fontFamily: 'var(--font-playfair-display)', fontSize: 13, fontWeight: 700, color: theme.accent }}>🎨 Couleur de tous les textes</span>
                  <button type="button" onClick={() => setGlobalColorOpen(false)} style={{ ...BTN, background: 'none', border: 'none', fontSize: 18, color: '#9ca3af', padding: 0 }}>✕</button>
                </div>
                <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 10 }}>
                  {DRAG_COLORS.filter(c => c !== '').slice(0, 30).map(c => (
                    <button key={c} type="button" onClick={() => {
                      onUpdate?.({ globalTextColor: c })
                    }} style={{
                      ...BTN, width: 28, height: 28, borderRadius: '50%', padding: 0,
                      background: c, border: data.globalTextColor === c ? `3px solid ${theme.accent}` : '2px solid white',
                      boxShadow: data.globalTextColor === c ? `0 0 0 1px ${theme.accent}` : '0 0 0 1px #e5e7eb',
                    }} />
                  ))}
                </div>
                <button type="button" onClick={() => {
                  onUpdate?.({ globalTextColor: '' })
                }} style={{ ...BTN, background: 'none', border: 'none', color: '#9ca3af', fontSize: 11, textDecoration: 'underline' }}>
                  Réinitialiser
                </button>
              </div>
            </div>
          )}
          <div style={{ position: 'fixed', bottom: 0, left: 0, right: 0, zIndex: 100, background: 'white', boxShadow: '0 -2px 20px rgba(0,0,0,0.10)', padding: '10px 12px', display: 'flex', gap: 6, justifyContent: 'center', flexWrap: 'wrap' }}>
            <button onClick={onEdit} style={{ ...BTN, padding: '8px 12px', borderRadius: 9999, border: `1.5px solid ${theme.accent}`, background: 'transparent', color: theme.accent, fontSize: 10, fontWeight: 600 }}>{t.fairepart.editBtn}</button>
            <button onClick={() => setGlobalColorOpen(p => !p)} style={{ ...BTN, padding: '8px 12px', borderRadius: 9999, border: `1.5px solid ${theme.accent}`, background: globalColorOpen ? theme.accent : 'transparent', color: globalColorOpen ? 'white' : theme.accent, fontSize: 10, fontWeight: 600 }}>🎨 Couleurs</button>
            <button onClick={() => setTextEditOpen(true)} style={{ ...BTN, padding: '8px 12px', borderRadius: 9999, border: `1.5px solid ${theme.accent}`, background: 'transparent', color: theme.accent, fontSize: 10, fontWeight: 600 }}>✏️ Textes</button>
            <button onClick={() => setRsvpListOpen(true)} style={{ ...BTN, padding: '8px 12px', borderRadius: 9999, border: `1.5px solid ${theme.accent}`, background: 'transparent', color: theme.accent, fontSize: 10, fontWeight: 600 }}>📋</button>
            <button onClick={handleSave} disabled={saving} style={{ ...BTN, padding: '8px 12px', borderRadius: 9999, background: '#2a7d4f', color: 'white', border: 'none', fontSize: 10, fontWeight: 600, opacity: saving ? 0.7 : 1 }}>{saving ? '...' : 'Sauver'}</button>
            <button onClick={handleShare} disabled={sharing} style={{ ...BTN, padding: '8px 12px', borderRadius: 9999, background: theme.accent, color: 'white', border: 'none', fontSize: 10, fontWeight: 600, opacity: sharing ? 0.7 : 1 }}>{sharing ? '...' : 'Partager'}</button>
          </div>
          </>
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
    <div id="faire-part-preview-target" style={{ backgroundColor: theme.fond, minHeight: '100vh', color: theme.texte, position: 'relative', overflowX: 'hidden' }}>
      {/* Cover page universelle — "Découvrir votre invitation" */}
      {!coverOpen && (
        <InvitationCover
          prenom1={data.marie1Prenom}
          prenom2={data.marie2Prenom}
          lieu={data.ceremonies?.[0]?.lieu}
          date={data.ceremonies?.[0]?.date}
          accent={theme.accent}
          fond={theme.fond}
          logoUrl={getLogoDisplayUrl(data)}
          logoColor={data.customLogoColor}
          onOpen={() => setCoverOpen(true)}
          mariageJuif={data.mariageJuif}
          illustrationUrl={data.illustrationCoupleId ? ILLUSTRATIONS_COUPLES.find(ic => ic.id === data.illustrationCoupleId)?.url : undefined}
          customDesignCoverUrl={data.customDesignMode ? data.customDesignCoverUrl : undefined}
          customDesignCoverVideoUrl={data.customDesignMode ? data.customDesignCoverVideoUrl : undefined}
        />
      )}
      {!isPaid && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 40, pointerEvents: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
          <div style={{ fontFamily: 'var(--font-playfair-display)', fontSize: 'clamp(60px,15vw,120px)', color: 'rgba(201,168,76,0.05)', fontWeight: 700, letterSpacing: 8, transform: 'rotate(-30deg)', whiteSpace: 'nowrap', userSelect: 'none' }}>
            LOV&apos;IT
          </div>
        </div>
      )}
      {data.petalsEnabled && <FloatingPetals accent={theme.accent} />}
      <SharedPageContent
        data={{ ...data, textOverrides: { ...data.textOverrides, ...textOverrides }, zoneStyles }}
        theme={theme}
        sorted={sorted}
        role="couple"
        lastShareId={lastShareId}
        onRsvpOpen={() => setRsvpOpen(true)}
        onRsvpListOpen={() => setRsvpListOpen(true)}
        onStartYoutube={data.youtubeUrl ? () => { const vid = getYouTubeId(data.youtubeUrl); if (vid) startYoutubeMusic(vid) } : undefined}
        ytIframeRef={ytIframeRef}
        ytMuted={ytMuted}
        onToggleYtMute={toggleYtMute}
        onUpdate={onUpdate}
        onTextEdit={() => setTextEditOpen(true)}
      />
      <div style={{ position: 'fixed', bottom: 0, left: 0, right: 0, zIndex: 100, background: 'white', boxShadow: '0 -2px 20px rgba(0,0,0,0.10)', padding: '8px 16px 12px' }}>
        <div style={{ textAlign: 'center', marginBottom: 6 }}>
          <span style={{ fontSize: 11, color: '#8a7e72', fontWeight: 700, lineHeight: 1.4 }}>
            {(data.frameId ?? 'none') === 'none'
              ? 'Personnalisez votre faire-part : ajoutez des illustrations entre les sections avec le bouton +'
              : 'Glissez chaque texte pour le repositionner. Cliquez dessus pour changer la taille, couleur et police.'}
          </span>
        </div>
        <div style={{ display: 'flex', gap: 8, justifyContent: 'center', flexWrap: 'wrap' }}>
        <button onClick={onEdit} style={{ ...BTN, padding: '10px 20px', borderRadius: 9999, border: `1.5px solid ${theme.accent}`, background: 'transparent', color: theme.accent, fontSize: 13, fontWeight: 600 }}>{t.fairepart.editBtn}</button>
        <button onClick={handleSave} disabled={saving} style={{ ...BTN, padding: '10px 20px', borderRadius: 9999, background: '#2a7d4f', color: 'white', border: 'none', fontSize: 13, fontWeight: 600, boxShadow: '0 4px 16px rgba(42,125,79,0.25)', opacity: saving ? 0.7 : 1 }}>{saving ? 'Enregistrement...' : 'Enregistrer'}</button>
        <button onClick={handleShare} disabled={sharing} style={{ ...BTN, padding: '10px 20px', borderRadius: 9999, background: isPaid ? theme.accent : 'linear-gradient(135deg, #C9A84C, #e8c96a)', color: 'white', border: 'none', fontSize: 13, fontWeight: 600, boxShadow: `0 4px 16px ${theme.accent}44`, opacity: sharing ? 0.7 : 1 }}>{!isPaid ? 'Débloquer le partage' : sharing ? (sharingStatus || 'Chargement...') : t.common.share}</button>
        </div>
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
      {restoreModalOpen && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 9999, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 }} onClick={() => setRestoreModalOpen(false)}>
          <div onClick={e => e.stopPropagation()} style={{ background: 'white', borderRadius: 16, padding: '28px 24px', maxWidth: 380, width: '100%', textAlign: 'center', boxShadow: '0 20px 60px rgba(0,0,0,0.2)' }}>
            <div style={{ fontSize: 32, marginBottom: 12 }}>⚠️</div>
            <h3 style={{ margin: '0 0 12px', fontSize: 18, fontWeight: 700, color: '#1a1a1a' }}>Restaurer la version initiale ?</h3>
            <p style={{ fontSize: 14, color: '#666', lineHeight: 1.6, marginBottom: 24 }}>
              Toutes vos modifications depuis la première génération seront perdues. Le lien de partage restera le même.
            </p>
            <div style={{ display: 'flex', gap: 10, justifyContent: 'center' }}>
              <button onClick={() => setRestoreModalOpen(false)} style={{ ...BTN, padding: '12px 24px', borderRadius: 9999, border: '1.5px solid #ddd', background: 'white', color: '#666', fontSize: 14, fontWeight: 600 }}>Annuler</button>
              <button disabled={restoring} onClick={async () => {
                if (!lastShareId) return
                setRestoring(true)
                try {
                  const res = await fetch('/api/restore-initial', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ shareId: lastShareId }) })
                  const json = await res.json()
                  if (json.success) {
                    // Recharger le faire-part restauré
                    const shareRes = await fetch(`/api/get-share?id=${lastShareId}`)
                    const restored = await shareRes.json()
                    if (restored && !restored.error) {
                      if (restored.photosFond?.length && restored.photosData?.length) {
                        restored.photosData = restored.photosData.map((c: { cropX?: number; cropY?: number; cropScale?: number }, idx: number) => ({ ...c, url: restored.photosFond[idx] ?? '' }))
                      }
                      onUpdate?.(restored)
                      setTextOverrides({})
                      setZoneStyles({})
                      showToast('Votre faire-part a été restauré à sa version initiale', 'success')
                    }
                  } else {
                    showToast(json.error || 'Erreur lors de la restauration', 'error')
                  }
                } catch { showToast('Erreur réseau', 'error') }
                setRestoring(false)
                setRestoreModalOpen(false)
              }} style={{ ...BTN, padding: '12px 24px', borderRadius: 9999, border: 'none', background: '#dc2626', color: 'white', fontSize: 14, fontWeight: 600, opacity: restoring ? 0.6 : 1 }}>
                {restoring ? 'Restauration...' : 'Oui, restaurer'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}


// ── Page principale ────────────────────────────────────────────────────────────

// ── Gate d'accès ──────────────────────────────────────────────────────────────

function AccessGate({ onGranted }: { onGranted: () => void }) {
  const GOLD = '#C9A84C'
  const { t } = useT()
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

  const inputStyle: React.CSSProperties = { width: '100%', padding: '11px 14px', borderRadius: 8, border: `1.5px solid ${GOLD}33`, fontSize: 15, fontFamily: 'var(--font-cormorant-garamond)', outline: 'none', background: '#fdf8f0', boxSizing: 'border-box' }

  const checkPromo = async () => {
    if (!promoInput.trim() || !promoEmail.trim()) { setError(t.fairepart.accessGateFillFields); return }
    setChecking(true); setError(null)
    try {
      const res = await fetch('/api/check-promo', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: promoInput, email: promoEmail, locale: typeof window !== 'undefined' ? localStorage.getItem('lovit-lang') || 'fr' : 'fr' }),
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
        setError(d.reason || t.fairepart.promoError)
      }
    } catch { setError(t.fairepart.accessGateNetworkError) }
    finally { setChecking(false) }
  }

  const handleSetPassword = async (e: React.FormEvent) => {
    e.preventDefault()
    setPwError(null)
    if (pwInput.length < 8) { setPwError(t.fairepart.accessGatePasswordMin); return }
    if (pwInput !== pwConfirm) { setPwError(t.fairepart.accessGatePasswordMismatch); return }
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
        setPwError(data.error || t.fairepart.accessGateGenericError)
      }
    } catch { setPwError(t.fairepart.accessGateServerError) }
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
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'linear-gradient(160deg, #fff8ed 0%, #fffaf4 50%, #fff8ed 100%)' }}>
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
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'linear-gradient(160deg, #fff8ed 0%, #fffaf4 50%, #fff8ed 100%)', padding: 24 }}>
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
              {pwLoading ? 'Création…' : 'Créer votre compte et commencer'}
            </button>
          </form>

        </div>
      </div>
    )
  }

  // Étape 1 : code promo + email
  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'linear-gradient(160deg, #fff8ed 0%, #fffaf4 50%, #fff8ed 100%)', padding: 24 }}>
      <div style={{ textAlign: 'center', maxWidth: 440, width: '100%' }}>
        <div style={{ fontFamily: 'var(--font-great-vibes)', fontSize: 48, color: GOLD, marginBottom: 4 }}>Lov&apos;it</div>
        <div style={{ width: 50, height: 1, background: GOLD, opacity: 0.3, margin: '0 auto 32px' }} />

        {/* Formulaire principal : code promo + email */}
        <div style={{ background: 'white', borderRadius: 20, padding: '36px 32px', boxShadow: '0 12px 48px rgba(201,168,76,0.12)', border: `1px solid ${GOLD}22`, marginBottom: 20, textAlign: 'left' }}>
          <div style={{ fontFamily: 'var(--font-playfair-display)', fontSize: 20, color: '#2d1f14', marginBottom: 6, textAlign: 'center' }}>Accéder à votre faire-part</div>
          <p style={{ fontFamily: 'var(--font-cormorant-garamond)', fontStyle: 'italic', fontSize: 15, color: '#6a5040', marginBottom: 24, textAlign: 'center' }}>
            {t.fairepart.promoTitle}
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
            {checking ? 'Vérification…' : 'Accéder à votre faire-part'}
          </button>

          {error && <p style={{ marginTop: 14, fontFamily: 'var(--font-cormorant-garamond)', fontSize: 15, color: '#ef4444', textAlign: 'center' }}>{error}</p>}
        </div>

        <div style={{ marginTop: 24, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12 }}>
          <a href="/connexion" style={{ fontFamily: 'var(--font-cormorant-garamond)', fontStyle: 'italic', fontSize: 15, color: GOLD, textDecoration: 'underline' }}>
            Déjà un compte ? Se connecter
          </a>
          <a href="/paiement" style={{ fontFamily: 'var(--font-cormorant-garamond)', fontStyle: 'italic', fontSize: 14, color: '#9ca3af', textDecoration: 'underline' }}>
            Pas encore de compte ? Créer votre faire-part →
          </a>
        </div>
      </div>
    </div>
  )
}

function FairePartPageInner() {
  const searchParams = useSearchParams()
  const [step, setStep] = useState(1)
  const [formData, setFormData] = useState<FormData>(defaultFormData)
  const [showCards, setShowCards] = useState(false)
  const [isShared, setIsShared] = useState(false)
  const [role, setRole] = useState<string | null>(null)
  const [loadingShare, setLoadingShare] = useState(false)
  const [hasDraft, setHasDraft] = useState(false)
  const [savedAt, setSavedAt] = useState<Date | null>(null)
  const [accessGranted, setAccessGranted] = useState(true) // Freemium : accès ouvert à tous
  const [checkingAccess, setCheckingAccess] = useState(false) // Plus de gate
  const [isPaid, setIsPaid] = useState(false) // false par défaut — sera true uniquement si connecté (checkAuth)
  const [activeShareId, setActiveShareId] = useState<string | null>(null) // shareId du faire-part actuellement chargé
  const [userPack, setUserPack] = useState<'essentiel' | 'premium'>(() => {
    try {
      // URL ?pack=luxe → interne 'premium', ?pack=premium → interne 'essentiel'
      const urlPack = new URLSearchParams(window.location.search).get('pack')
      if (urlPack === 'luxe') { localStorage.setItem('lovit_pack', 'premium'); return 'premium' }
      if (urlPack === 'premium') { localStorage.setItem('lovit_pack', 'essentiel'); return 'essentiel' }
      return (localStorage.getItem('lovit_pack') === 'premium' ? 'premium' : 'essentiel')
    } catch { return 'essentiel' }
  })
  // Auth & sauvegarde serveur
  const [userEmail, setUserEmail] = useState<string | null>(null)
  const [userFaireparts, setUserFaireparts] = useState<string[]>([])
  const [serverSavedAt, setServerSavedAt] = useState<Date | null>(null)
  const [serverSaving, setServerSaving] = useState(false)
  const serverSaveTimer = useRef<ReturnType<typeof setTimeout> | null>(null)
  const { t } = useT()
  // Prevents double-firing when both onTouchEnd and onClick trigger
  const lastTap = useRef(0)

  // Utiliser searchParams de Next.js pour réagir aux changements d'URL (navigation soft)
  const spShare = searchParams.get('share')
  const spRole = searchParams.get('role')
  const spCode = searchParams.get('code')

  useEffect(() => {
    const id = spShare
    const r = spRole
    const urlCode = spCode

    // Mode dev : bypass code d'accès (uniquement en développement local)
    if (searchParams.get('dev') === 'true' && process.env.NODE_ENV === 'development') {
      setAccessGranted(true)
      setCheckingAccess(false)
      return
    }

    if (id) {
      // Vue partagée — supprimer le brouillon local pour éviter tout mélange entre comptes
      try { localStorage.removeItem('wedding-draft') } catch { /* ignore */ }
      setIsShared(true)
      setRole(r ?? 'guest')
      setAccessGranted(true)
      setCheckingAccess(false)
      // Lien couple = déjà partagé = déjà payé
      if (r === 'couple') setIsPaid(true)
      setLoadingShare(true)
      fetch(`/api/get-share?id=${id}`)
        .then(res => res.json())
        .then((d: FormData) => {
          // Reconstruire photosData.url depuis photosFond (supprimé avant envoi pour économiser de l'espace)
          if (d.photosFond?.length && d.photosData?.length) {
            d.photosData = d.photosData.map((c, i) => ({ ...c, url: d.photosFond![i] ?? '' }))
          }
          setFormData(d)
          // Sauvegarder le shareId dans le state React (source de vérité)
          setActiveShareId(id)
          if (r === 'edit') {
            setIsShared(false)
            setRole(null)
            setShowCards(false)
            setStep(1)
            setIsPaid(true)
          } else {
            // Pas d'auto-upgrade — les mariés utilisent "Modifier" dans Mon Espace pour éditer
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
          // Nouveau faire-part — réinitialiser l'ancien shareId pour éviter de charger un ancien faire-part
          setActiveShareId(null)
          try { localStorage.removeItem('lovit_share_id') } catch { /* ignore */ }
          setAccessGranted(true)
          setIsPaid(true)
          if (d.pack === 'premium') setUserPack('premium')
          try { localStorage.setItem('lovit_access_code', code); if (d.pack) localStorage.setItem('lovit_pack', d.pack) } catch { /* ignore */ }

          // 1) D'abord essayer le brouillon localStorage
          let hasLocalDraft = false
          try {
            const draft = localStorage.getItem('wedding-draft')
            if (draft) { hasLocalDraft = true; setHasDraft(true) }
          } catch { /* ignore */ }

          // 2) Si pas de brouillon local, charger le faire-part depuis le serveur via shareId
          // ⚠️ UNIQUEMENT si on n'arrive PAS d'un nouveau paiement (code=) — sinon on pollue avec l'ancien faire-part
          const isNewFromPayment = !!spCode
          if (!hasLocalDraft && !isNewFromPayment) {
            try {
              const savedShareId = activeShareId || localStorage.getItem('lovit_share_id')
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
      // Ne PAS vérifier lovit_access_code du localStorage
      // → seule l'authentification serveur (checkAuth) détermine isPaid
      // → empêche de partager sans être connecté même si un ancien code existe
      setCheckingAccess(false)
    }

    // Check for local draft
    try {
      const draft = localStorage.getItem('wedding-draft')
      if (draft) setHasDraft(true)
    } catch { /* ignore */ }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [spShare, spRole, spCode])

  // ✅ Vérifier l'authentification au chargement + charger brouillon serveur
  useEffect(() => {
    // ⚠️ En mode partagé (?share=XXX), ne JAMAIS charger le brouillon de l'utilisateur connecté
    // pour ne pas écraser le faire-part partagé avec les données de l'utilisateur B
    // En mode share (guest ou edit), skip le chargement de brouillon
    // Le faire-part est déjà chargé via get-share dans le 1er useEffect
    // On vérifie juste l'auth pour setIsPaid
    const isShareMode = !!spShare

    let cancelled = false
    async function checkAuth() {
      try {
        const res = await fetch('/api/auth/me')
        if (!res.ok) return
        const data = await res.json()
        if (cancelled) return
        setUserEmail(data.email)
        setUserFaireparts(data.faireparts ?? [])

        // Utilisateur connecté = a payé → accès au formulaire
        setAccessGranted(true)
        setCheckingAccess(false)
        setIsPaid(true)

        // Vérifier que le localStorage appartient au compte connecté
        try {
          const storedEmail = localStorage.getItem('lovit_user_email')
          if (storedEmail && storedEmail !== data.email) {
            // Autre compte → nettoyer le localStorage
            localStorage.removeItem('wedding-draft')
            localStorage.removeItem('lovit_access_code')
            localStorage.removeItem('lovit_share_id')
          }
          localStorage.setItem('lovit_user_email', data.email)
        } catch { /* ignore */ }

        // Si connecté et qu'on a des faire-parts, tenter de charger le brouillon serveur
        // SAUF en mode share/edit (le faire-part est déjà chargé via get-share)
        // AUSSI vérifier que activeShareId n'est pas déjà set (= le 1er useEffect a déjà chargé)
        if (!isShareMode && !activeShareId) {
          // Ne PAS charger automatiquement — l'utilisateur doit aller sur Mon Espace
          // pour choisir quel faire-part modifier
        }
      } catch { /* pas connecté, ignore */ }
    }
    checkAuth()
    return () => { cancelled = true }
  }, [])

  // ✅ Sauvegarde serveur debounced — publie aussi pour que les invités voient les modifs
  const saveToServer = useCallback((data: FormData) => {
    // Trouver le shareId actif depuis le state React ou l'URL (jamais localStorage)
    const shareId = activeShareId
      || (() => { try { return new URLSearchParams(window.location.search).get('share') } catch { return null } })()
    if (!shareId) return

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
        } else if (res.status === 401) {
          // Pas connecté — ignorer silencieusement (le localStorage sauvegarde quand même)
        }
      } catch { /* ignore */ }
      setServerSaving(false)
    }, 1000) // debounce 1 seconde
  }, [])

  // Protection contre la fermeture accidentelle
  useEffect(() => {
    const handler = (e: BeforeUnloadEvent) => {
      if (showCards || step > 1) {
        e.preventDefault()
        e.returnValue = ''
      }
    }
    window.addEventListener('beforeunload', handler)
    return () => window.removeEventListener('beforeunload', handler)
  }, [showCards, step])

  const update = useCallback((u: Partial<FormData>) => {
    setFormData(p => {
      const next = { ...p, ...u }
      // ✅ AUTO-SAVE : à chaque modification, on sauvegarde dans le navigateur
      // pour ne JAMAIS perdre le travail si l'onglet est fermé
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
        const parsed = JSON.parse(draft)
        if (parsed && typeof parsed === 'object' && parsed.marie1Prenom !== undefined) {
          setFormData(parsed as FormData)
          setHasDraft(false)
          setShowCards(true)
        } else {
          localStorage.removeItem('wedding-draft')
        }
      }
    } catch {
      localStorage.removeItem('wedding-draft')
    }
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
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'linear-gradient(160deg, #fff8ed 0%, #fffaf4 50%, #fff8ed 100%)' }}>
      <div style={{ fontFamily: 'var(--font-great-vibes)', fontSize: 32, color: '#C9A84C' }}>Chargement…</div>
    </div>
  )

  // Freemium : plus de gate d'accès, tout le monde peut créer
  // Le partage est bloqué si pas payé (isPaid=false)

  if (showCards) {
    const onEdit = () => { try { localStorage.setItem('wedding-draft', JSON.stringify(formData)) } catch { /* ignore */ } setShowCards(false); setStep(4) }
    const onReset = () => { setFormData(defaultFormData); setShowCards(false); setStep(1); try { localStorage.removeItem('wedding-draft') } catch { /* ignore */ } }

    return <CardsView data={formData} onEdit={onEdit} onReset={onReset} isShared={isShared} role={role} onUpdate={update} isPaid={isPaid} activeShareId={activeShareId} />
  }

  if (loadingShare) return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'linear-gradient(160deg, #fff8ed 0%, #fffaf4 50%, #fff8ed 100%)' }}>
      <div style={{ textAlign: 'center' }}>
        <div style={{ fontFamily: 'Georgia, serif', fontStyle: 'italic', fontSize: 28, color: '#C9A84C', marginBottom: 16 }}>Chargement…</div>
        <div style={{ width: 40, height: 1, background: '#C9A84C', opacity: 0.4, margin: '0 auto' }} />
      </div>
    </div>
  )

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'flex-start', padding: '48px 16px', background: 'linear-gradient(160deg, #fff8ed 0%, #fffaf4 50%, #fff8ed 100%)' }}>
      <div style={{ textAlign: 'center', marginBottom: 36 }}>
        <p style={{ fontSize: 9, textTransform: 'uppercase', letterSpacing: '0.3em', color: 'rgba(201,168,76,0.65)', fontWeight: 600, marginBottom: 10 }}>{t.fairepart.invitationLabel}</p>
        {savedAt && (
          <div style={{ fontSize: 11, color: '#7a9e6e', fontFamily: 'var(--font-cormorant-garamond)', fontStyle: 'italic', marginBottom: 4, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
            <span style={{ fontSize: 13 }}>✓</span>
            {t.fairepart.savedAt.replace('{time}', savedAt.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }))}
          </div>
        )}
        {userEmail && (
          <div style={{ fontSize: 11, color: serverSaving ? '#C9A84C' : '#7a9e6e', fontFamily: 'var(--font-cormorant-garamond)', fontStyle: 'italic', marginBottom: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
            {serverSaving ? (
              <>{t.fairepart.savingServer}</>
            ) : serverSavedAt ? (
              <><span style={{ fontSize: 13 }}>☁</span> {t.fairepart.savedServer.replace('{time}', serverSavedAt.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }))}</>
            ) : null}
          </div>
        )}
        {hasDraft && (
          <div style={{ marginTop: 16, marginBottom: 16, textAlign: 'center' }}>
            <div style={{ fontSize: 13, color: '#7a9e6e', fontFamily: 'var(--font-cormorant-garamond)', fontStyle: 'italic', marginBottom: 10 }}>
              ✓ Votre travail est sauvegardé sur cet appareil
            </div>
            <button onClick={resumeDraft} style={{ ...BTN, padding: '14px 32px', borderRadius: 9999, background: 'linear-gradient(135deg, #C9A84C, #e8c96a)', color: 'white', border: 'none', fontSize: 14, fontWeight: 700, boxShadow: '0 4px 16px rgba(201,168,76,0.35)' }}>
              {t.fairepart.resumeDraft}
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
      <div style={{ width: '100%', maxWidth: 600, background: 'white', borderRadius: 20, padding: '32px 24px', boxShadow: '0 12px 48px rgba(0,0,0,0.07)', border: '1px solid #efe5d8', boxSizing: 'border-box' }}>
        <ProgressBar step={step} />
        {step === 1 && <p style={{ textAlign: 'center', fontFamily: 'var(--font-cormorant-garamond)', fontStyle: 'italic', fontSize: 14, color: '#C9A84C', marginBottom: 16 }}>Commençons par les prénoms des mariés</p>}
        {step === 2 && <p style={{ textAlign: 'center', fontFamily: 'var(--font-cormorant-garamond)', fontStyle: 'italic', fontSize: 14, color: '#C9A84C', marginBottom: 16 }}>Superbe ! Ajoutons les familles</p>}
        {step === 3 && <p style={{ textAlign: 'center', fontFamily: 'var(--font-cormorant-garamond)', fontStyle: 'italic', fontSize: 14, color: '#C9A84C', marginBottom: 16 }}>Parfait ! Plus que les cérémonies et le style</p>}
        {step === 4 && <p style={{ textAlign: 'center', fontFamily: 'var(--font-cormorant-garamond)', fontStyle: 'italic', fontSize: 14, color: '#C9A84C', marginBottom: 16 }}>Dernière étape — personnalisez le style ✨</p>}
        {step === 1 && <Step1 data={formData} onChange={update} />}
        {step === 2 && <Step2 data={formData} onChange={update} />}
        {step === 3 && <Step3 data={formData} onChange={update} />}
        {step === 4 && <Step4 data={formData} onChange={update} pack={userPack} />}
        <div style={{ display: 'flex', gap: 12, marginTop: 32, position: 'relative', zIndex: 1 }}>
          {step > 1 && (
            <button
              type="button"
              onClick={prev}
              onTouchEnd={onTouchPrev}
              style={{ ...BTN, flex: 1, padding: '18px 0', borderRadius: 9999, border: '1.5px solid #e0d5c8', background: 'white', color: '#d45050', fontSize: 14, fontWeight: 600 }}
            >← Précédent</button>
          )}
          <button
            type="button"
            onClick={next}
            onTouchEnd={onTouchNext}
            style={{ ...BTN, flex: 1, padding: '18px 0', borderRadius: 9999, border: 'none', background: step === 4 ? 'linear-gradient(135deg, #C9A84C, #e8c96a)' : 'linear-gradient(135deg, #d45050, #f43f5e)', color: 'white', fontSize: 14, fontWeight: 700, boxShadow: '0 6px 20px rgba(251,113,133,0.35)' }}
          >
            {step === 4 ? 'Voir mon faire-part ✨' : 'Suivant →'}
          </button>
        </div>
      </div>
    </div>
  )
}

import { Suspense } from 'react'

export default function FairePartPage() {
  return (
    <Suspense>
      <FairePartPageInner />
    </Suspense>
  )
}
