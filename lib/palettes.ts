export const PALETTES = {
  lavande:  { main: '#4A2576', accent: '#7B4FB5', cream: '#F8F5FD', rsvpBg: '#EDE5F7' },
  rose:     { main: '#993556', accent: '#D4537E', cream: '#FDF7F8', rsvpBg: '#FBE9EE' },
  sauge:    { main: '#3B6D11', accent: '#97C459', cream: '#F7FAF1', rsvpBg: '#EAF3DE' },
  bleunuit:    { main: '#042C53', accent: '#378ADD', cream: '#F5F9FD', rsvpBg: '#E6F1FB' },
  sable_dore:  { main: '#C97F4C', accent: '#9DBBA1', cream: '#EDE3D2', rsvpBg: '#E8D4A2' },
  fuchsia:     { main: '#D63384', accent: '#5DBDC8', cream: '#FFFFFF', rsvpBg: '#FCE4F0' },
  rose_peche:  { main: '#1B3A5C', accent: '#E07856', cream: '#FAF5EB', rsvpBg: '#FDE8E0' },
  bleu_med:    { main: '#1E5BA8', accent: '#E5B847', cream: '#FBF9F4', rsvpBg: '#E0ECF8' },
} as const;

export type PaletteKey = keyof typeof PALETTES;
