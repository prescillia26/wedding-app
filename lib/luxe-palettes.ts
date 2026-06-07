export type LuxePalette = 'lavande' | 'rose' | 'sauge' | 'bleunuit' | 'sable_dore' | 'fuchsia' | 'rose_peche' | 'bleu_med' | 'buttercup' | 'orange_sunset' | 'bleu_mer'

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
  sable_dore: {
    primary:    '#C97F4C',
    accent:     '#9DBBA1',
    accentSoft: '#E8D4A2',
    text:       '#3a2a1a',
    textSoft:   '#8a7060',
    background: '#EDE3D2',
  },
  fuchsia: {
    primary:    '#D63384',
    accent:     '#5DBDC8',
    accentSoft: '#FCE4F0',
    text:       '#2a1a2e',
    textSoft:   '#7A8B5C',
    background: '#FFFFFF',
  },
  rose_peche: {
    primary:    '#1B3A5C',
    accent:     '#E07856',
    accentSoft: '#F5C6B0',
    text:       '#1B3A5C',
    textSoft:   '#6a5a50',
    background: '#FAF5EB',
  },
  bleu_med: {
    primary:    '#1E5BA8',
    accent:     '#E5B847',
    accentSoft: '#8FB8A8',
    text:       '#1a2a3e',
    textSoft:   '#4a6a8a',
    background: '#FBF9F4',
  },
  buttercup: {
    primary:    '#D4A830',
    accent:     '#F0CD7A',
    accentSoft: '#F8F0D8',
    text:       '#3a3010',
    textSoft:   '#8a7a40',
    background: '#FEFBF0',
  },
  orange_sunset: {
    primary:    '#D07838',
    accent:     '#F4A165',
    accentSoft: '#FDE8D5',
    text:       '#3a2010',
    textSoft:   '#8a5a30',
    background: '#FEF6F0',
  },
  bleu_mer: {
    primary:    '#5A9AB0',
    accent:     '#91BDC9',
    accentSoft: '#DFF0F5',
    text:       '#1a2a34',
    textSoft:   '#4a7a8a',
    background: '#F2F8FA',
  },
}

export function getPalette(name: LuxePalette): PaletteColors {
  return PALETTES[name] ?? PALETTES.lavande
}
