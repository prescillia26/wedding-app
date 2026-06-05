export type LuxePalette = 'lavande' | 'rose' | 'sauge' | 'bleunuit'

export interface PaletteColors {
  primary: string
  accent: string
  accentSoft: string
  text: string
  textSoft: string
  background: string
}

export const PALETTES: Record<LuxePalette, PaletteColors> = {
  lavande: {
    primary:    '#6b21a8',
    accent:     '#a855f7',
    accentSoft: '#e9d5ff',
    text:       '#1e1b4b',
    textSoft:   '#6b7280',
    background: '#faf5ff',
  },
  rose: {
    primary:    '#9f1239',
    accent:     '#f43f5e',
    accentSoft: '#fecdd3',
    text:       '#1a1a2e',
    textSoft:   '#6b7280',
    background: '#fff1f2',
  },
  sauge: {
    primary:    '#365314',
    accent:     '#84cc16',
    accentSoft: '#d9f99d',
    text:       '#1a1a2e',
    textSoft:   '#6b7280',
    background: '#f7fee7',
  },
  bleunuit: {
    primary:    '#1e3a8a',
    accent:     '#3b82f6',
    accentSoft: '#bfdbfe',
    text:       '#1a1a2e',
    textSoft:   '#6b7280',
    background: '#eff6ff',
  },
}

export function getPalette(name: LuxePalette): PaletteColors {
  return PALETTES[name] ?? PALETTES.lavande
}
