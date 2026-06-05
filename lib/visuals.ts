// Bibliothèque de visuels aquarelles curatés pour le Pack Luxe
// Les URLs seront ajoutées au fur et à mesure de l'upload sur Cloudinary

export type VisualCategory = 'couples' | 'mairie' | 'houppa' | 'shabbat' | 'beach' | 'rsvp' | 'delimiter'

export interface Visual {
  id: string
  category: VisualCategory
  label: string
  url: string
}

// Visuels à compléter avec les 58 URLs Cloudinary
export const VISUALS: Visual[] = [
  // -- Délimiteurs (déjà disponibles) --
  // Les délimiteurs existants sont dans DELIMITERS de page.tsx
  // On les référence ici pour la cohérence

  // -- Couples (à remplir) --
  // { id: 'C01', category: 'couples', label: 'Couple sous arche', url: '...' },

  // -- Mairie (à remplir) --
  // { id: 'M01', category: 'mairie', label: 'Manoir rose pâle', url: '...' },

  // -- Houppa (à remplir) --
  // { id: 'H01', category: 'houppa', label: 'Houppa fleurie', url: '...' },

  // -- Shabbat (à remplir) --
  // { id: 'S01', category: 'shabbat', label: 'Table de Shabbat', url: '...' },

  // -- Beach Party (à remplir) --
  // -- RSVP (à remplir) --
]

export function byCategory(category: VisualCategory): Visual[] {
  return VISUALS.filter(v => v.category === category)
}

export function byId(id: string): Visual | undefined {
  return VISUALS.find(v => v.id === id)
}

export function defaultForCategory(category: VisualCategory): Visual | undefined {
  return VISUALS.find(v => v.category === category)
}
