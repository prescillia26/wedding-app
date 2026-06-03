export const PALETTES = {
  lavande:  { main: '#4A2576', accent: '#7B4FB5', cream: '#F8F5FD', rsvpBg: '#EDE5F7' },
  rose:     { main: '#993556', accent: '#D4537E', cream: '#FDF7F8', rsvpBg: '#FBE9EE' },
  sauge:    { main: '#3B6D11', accent: '#97C459', cream: '#F7FAF1', rsvpBg: '#EAF3DE' },
  bleunuit: { main: '#042C53', accent: '#378ADD', cream: '#F5F9FD', rsvpBg: '#E6F1FB' },
} as const;

export type PaletteKey = keyof typeof PALETTES;
