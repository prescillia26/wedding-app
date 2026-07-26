/**
 * Palettes harmonisées pour la refonte du wizard de création.
 *
 * Chaque palette garantit un rendu cohérent en définissant :
 * - Les couleurs par zone (fond, prénoms, titres, texte, accents)
 * - Les polices par zone (prénoms, titres, texte courant)
 *
 * Polices disponibles (chargées via Google Fonts dans le HTML statique) :
 * - Great Vibes        → calligraphie élégante
 * - Cormorant Garamond → serif raffiné
 * - Playfair Display   → serif classique
 * - Lora               → serif chaleureux
 * - Montserrat         → sans-serif moderne
 * - Raleway            → sans-serif fin et aéré
 */

export interface HarmonizedPalette {
  id: string
  label: string
  description: string

  // Couleurs
  fondColor: string           // fond de page
  fondSecondaryColor: string  // fond des cartes / sections alternées
  accentColor: string         // boutons, séparateurs, décorations

  // Prénoms des mariés
  prenomsColor: string
  prenomsFont: string

  // Titres d'événements (Mairie, Houppa, Réception...)
  titresColor: string
  titresFont: string

  // Texte courant (lieux, dates, heures, infos)
  texteColor: string
  texteFont: string

  // Texte secondaire (notes, infos complémentaires)
  texteSecondaireColor: string
}

export const HARMONIZED_PALETTES: HarmonizedPalette[] = [
  // ── Classiques & Intemporels ──────────────────────────────

  {
    id: 'ivoire-dore',
    label: 'Ivoire & Doré',
    description: 'Élégance intemporelle, tons chauds et dorés',
    fondColor: '#FDF8F0',
    fondSecondaryColor: '#F7F0E3',
    accentColor: '#C9A84C',
    prenomsColor: '#C9A84C',
    prenomsFont: 'Great Vibes',
    titresColor: '#2D2014',
    titresFont: 'Playfair Display',
    texteColor: '#3A3020',
    texteFont: 'Cormorant Garamond',
    texteSecondaireColor: '#8A7A5A',
  },

  {
    id: 'blanc-argent',
    label: 'Blanc & Argent',
    description: 'Pureté et modernité, minimaliste chic',
    fondColor: '#FAFAFA',
    fondSecondaryColor: '#F0F0F0',
    accentColor: '#9E9E9E',
    prenomsColor: '#2D2D2D',
    prenomsFont: 'Great Vibes',
    titresColor: '#1A1A1A',
    titresFont: 'Playfair Display',
    texteColor: '#2D2D2D',
    texteFont: 'Raleway',
    texteSecondaireColor: '#757575',
  },

  {
    id: 'noir-or',
    label: 'Noir & Or',
    description: 'Luxe absolu, contraste dramatique',
    fondColor: '#0A0A0A',
    fondSecondaryColor: '#1A1814',
    accentColor: '#D4AF37',
    prenomsColor: '#D4AF37',
    prenomsFont: 'Great Vibes',
    titresColor: '#E8D8B0',
    titresFont: 'Playfair Display',
    texteColor: '#E0D8C8',
    texteFont: 'Cormorant Garamond',
    texteSecondaireColor: '#A09880',
  },

  // ── Bleus ─────────────────────────────────────────────────

  {
    id: 'marine-ivoire',
    label: 'Bleu Marine & Ivoire',
    description: 'Chic nautique, élégance côtière',
    fondColor: '#0A1628',
    fondSecondaryColor: '#0E1E34',
    accentColor: '#C9A84C',
    prenomsColor: '#C9A84C',
    prenomsFont: 'Great Vibes',
    titresColor: '#E8E0D0',
    titresFont: 'Playfair Display',
    texteColor: '#D8D0C0',
    texteFont: 'Cormorant Garamond',
    texteSecondaireColor: '#B0A880',
  },

  {
    id: 'bleu-ciel-blanc',
    label: 'Bleu Ciel & Blanc',
    description: 'Frais et lumineux, douceur méditerranéenne',
    fondColor: '#F0F6FC',
    fondSecondaryColor: '#E4EFF8',
    accentColor: '#1E5BA8',
    prenomsColor: '#1E5BA8',
    prenomsFont: 'Great Vibes',
    titresColor: '#0A1A30',
    titresFont: 'Playfair Display',
    texteColor: '#1A2A3A',
    texteFont: 'Lora',
    texteSecondaireColor: '#4A6A8A',
  },

  {
    id: 'bleu-nuit-etoile',
    label: 'Bleu Nuit Étoilé',
    description: 'Romantique nocturne, profond et mystérieux',
    fondColor: '#0E1E34',
    fondSecondaryColor: '#142844',
    accentColor: '#7AAED4',
    prenomsColor: '#E8D8B0',
    prenomsFont: 'Great Vibes',
    titresColor: '#D8E4F0',
    titresFont: 'Cormorant Garamond',
    texteColor: '#C8D8E8',
    texteFont: 'Raleway',
    texteSecondaireColor: '#90A8C0',
  },

  // ── Roses & Rouges ───────────────────────────────────────

  {
    id: 'rose-poudre-dore',
    label: 'Rose Poudré & Doré',
    description: 'Romantique et délicat, douceur féminine',
    fondColor: '#FDF5F5',
    fondSecondaryColor: '#F8ECEC',
    accentColor: '#C9A84C',
    prenomsColor: '#C4829A',
    prenomsFont: 'Great Vibes',
    titresColor: '#8A3A5A',
    titresFont: 'Playfair Display',
    texteColor: '#2D2D2D',
    texteFont: 'Cormorant Garamond',
    texteSecondaireColor: '#8A6070',
  },

  {
    id: 'bordeaux-or',
    label: 'Bordeaux & Or',
    description: 'Passion et noblesse, automne chic',
    fondColor: '#FDF8F6',
    fondSecondaryColor: '#F5EDEA',
    accentColor: '#C9A84C',
    prenomsColor: '#8B1A2A',
    prenomsFont: 'Great Vibes',
    titresColor: '#8B1A2A',
    titresFont: 'Playfair Display',
    texteColor: '#2A1A1A',
    texteFont: 'Cormorant Garamond',
    texteSecondaireColor: '#7A4A4A',
  },

  {
    id: 'fuchsia-turquoise',
    label: 'Fuchsia & Turquoise',
    description: 'Audacieux et festif, mariage coloré',
    fondColor: '#FFFFFF',
    fondSecondaryColor: '#FFF5FA',
    accentColor: '#5DBDC8',
    prenomsColor: '#D63384',
    prenomsFont: 'Great Vibes',
    titresColor: '#2A1A2E',
    titresFont: 'Montserrat',
    texteColor: '#2A1A2E',
    texteFont: 'Raleway',
    texteSecondaireColor: '#7A5A6A',
  },

  // ── Verts & Nature ────────────────────────────────────────

  {
    id: 'sauge-creme',
    label: 'Vert Sauge & Crème',
    description: 'Nature et sérénité, bohème raffiné',
    fondColor: '#F7F5F0',
    fondSecondaryColor: '#EFF0E8',
    accentColor: '#6A9A70',
    prenomsColor: '#365314',
    prenomsFont: 'Great Vibes',
    titresColor: '#365314',
    titresFont: 'Playfair Display',
    texteColor: '#2A3520',
    texteFont: 'Lora',
    texteSecondaireColor: '#5A7050',
  },

  {
    id: 'olive-dore',
    label: 'Olive & Doré',
    description: 'Méditerranéen, chaleureux et organique',
    fondColor: '#FAF8F0',
    fondSecondaryColor: '#F0EDE2',
    accentColor: '#C9A84C',
    prenomsColor: '#C9A84C',
    prenomsFont: 'Great Vibes',
    titresColor: '#4A5A30',
    titresFont: 'Cormorant Garamond',
    texteColor: '#3A3A28',
    texteFont: 'Lora',
    texteSecondaireColor: '#7A7A5A',
  },

  // ── Terres & Chauds ───────────────────────────────────────

  {
    id: 'terracotta-ivoire',
    label: 'Terracotta & Ivoire',
    description: 'Chaleur provençale, tons terre',
    fondColor: '#FAF0E8',
    fondSecondaryColor: '#F2E6DA',
    accentColor: '#C97F4C',
    prenomsColor: '#C97F4C',
    prenomsFont: 'Great Vibes',
    titresColor: '#3A2010',
    titresFont: 'Playfair Display',
    texteColor: '#3A2A1A',
    texteFont: 'Cormorant Garamond',
    texteSecondaireColor: '#8A5A3A',
  },

  {
    id: 'sable-sauge',
    label: 'Sable & Sauge',
    description: 'Douceur naturelle, bohème chic',
    fondColor: '#EDE3D2',
    fondSecondaryColor: '#E3D8C6',
    accentColor: '#9DBBA1',
    prenomsColor: '#C97F4C',
    prenomsFont: 'Great Vibes',
    titresColor: '#3A2A1A',
    titresFont: 'Playfair Display',
    texteColor: '#3A2A1A',
    texteFont: 'Lora',
    texteSecondaireColor: '#8A7060',
  },

  // ── Violets & Parme ───────────────────────────────────────

  {
    id: 'lavande-argent',
    label: 'Lavande & Argent',
    description: 'Douceur provençale, élégance florale',
    fondColor: '#FAF5FF',
    fondSecondaryColor: '#F0E8F8',
    accentColor: '#A855F7',
    prenomsColor: '#6B21A8',
    prenomsFont: 'Great Vibes',
    titresColor: '#1E1B4B',
    titresFont: 'Playfair Display',
    texteColor: '#2A1A3A',
    texteFont: 'Cormorant Garamond',
    texteSecondaireColor: '#6B5A7A',
  },

  {
    id: 'parme-ivoire',
    label: 'Parme & Ivoire',
    description: 'Subtil et poétique, charme discret',
    fondColor: '#FAF7F5',
    fondSecondaryColor: '#F2EDE8',
    accentColor: '#9B72AA',
    prenomsColor: '#9B72AA',
    prenomsFont: 'Great Vibes',
    titresColor: '#2A1A30',
    titresFont: 'Cormorant Garamond',
    texteColor: '#2A1A30',
    texteFont: 'Lora',
    texteSecondaireColor: '#7A5A8A',
  },
]

/** Retrouver une palette par son ID (fallback sur ivoire-dore) */
export function getHarmonizedPalette(id: string): HarmonizedPalette {
  return HARMONIZED_PALETTES.find((p) => p.id === id) ?? HARMONIZED_PALETTES[0]
}

/** Liste des polices Google Fonts nécessaires pour le HTML statique */
export const GOOGLE_FONTS_FAMILIES = [
  'Great+Vibes',
  'Cormorant+Garamond:ital,wght@0,400;0,600;1,400',
  'Playfair+Display:wght@400;700',
  'Lora:ital,wght@0,400;0,700;1,400',
  'Montserrat:wght@400;600;700',
  'Raleway:wght@300;400;600',
]

/** URL Google Fonts prête à embarquer dans le HTML */
export function getGoogleFontsUrl(): string {
  const families = GOOGLE_FONTS_FAMILIES.map((f) => `family=${f}`).join('&')
  return `https://fonts.googleapis.com/css2?${families}&display=swap`
}
