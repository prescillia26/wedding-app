// Bibliothèque de délimiteurs — URLs à remplir après exécution de :
// npx tsx scripts/generate-delimiters.ts

export interface Delimiter {
  id: string;
  name: string;
  url: string;
  category: 'floral' | 'geo' | 'jewish';
}

// PLACEHOLDER — remplacer par les URLs Cloudinary après génération
export const DELIMITERS: Delimiter[] = [
  { id: 'd01-violets', name: 'Bouquet de violettes', url: '', category: 'floral' },
  { id: 'd02-olive', name: "Branche d'olivier", url: '', category: 'floral' },
  { id: 'd03-rose-stem', name: 'Rose unique', url: '', category: 'floral' },
  { id: 'd04-wisteria', name: 'Glycine cascadante', url: '', category: 'floral' },
  { id: 'd05-laurel', name: 'Couronne de laurier', url: '', category: 'floral' },
  { id: 'd06-diamond', name: 'Diamant Art Nouveau', url: '', category: 'geo' },
  { id: 'd07-magen', name: 'Étoile à 6 branches', url: '', category: 'geo' },
  { id: 'd08-heart', name: 'Coeur fleuri', url: '', category: 'geo' },
  { id: 'd09-crown', name: 'Couronne ornementale', url: '', category: 'geo' },
  { id: 'd10-circle', name: 'Cercle de feuilles', url: '', category: 'geo' },
  { id: 'd11-doves', name: 'Deux colombes', url: '', category: 'jewish' },
  { id: 'd12-rings', name: 'Bagues entrelacées', url: '', category: 'jewish' },
  { id: 'd13-kiddush', name: 'Coupe de Kiddoush', url: '', category: 'jewish' },
  { id: 'd14-candles', name: 'Bougies de Shabbat', url: '', category: 'jewish' },
  { id: 'd15-hamsa', name: 'Hamsa stylisée', url: '', category: 'jewish' },
];
