export interface Delimiter {
  id: string;
  name: string;
  url: string;
  category: 'floral' | 'geo' | 'jewish';
}

export const DELIMITERS: Delimiter[] = [
  // Floral
  { id: 'd01-violets', name: 'Bouquet de violettes', url: 'https://gsihevihnthjsm8z.public.blob.vercel-storage.com/static/delimiters/d01-violets.png', category: 'floral' },
  { id: 'd02-olive', name: "Branche d'olivier", url: 'https://gsihevihnthjsm8z.public.blob.vercel-storage.com/static/delimiters/d02-olive.png', category: 'floral' },
  { id: 'd03-rose-stem', name: 'Rose unique', url: 'https://gsihevihnthjsm8z.public.blob.vercel-storage.com/static/delimiters/d03-rose-stem.png', category: 'floral' },
  { id: 'd04-wisteria', name: 'Glycine cascadante', url: 'https://gsihevihnthjsm8z.public.blob.vercel-storage.com/static/delimiters/d04-wisteria.png', category: 'floral' },
  { id: 'd05-laurel', name: 'Couronne de laurier', url: 'https://gsihevihnthjsm8z.public.blob.vercel-storage.com/static/delimiters/d05-laurel.png', category: 'floral' },
  // Géométrique
  { id: 'd06-diamond', name: 'Diamant Art Nouveau', url: 'https://gsihevihnthjsm8z.public.blob.vercel-storage.com/static/delimiters/d06-diamond.png', category: 'geo' },
  { id: 'd07-magen', name: 'Étoile à 6 branches', url: 'https://gsihevihnthjsm8z.public.blob.vercel-storage.com/static/delimiters/d07-magen.png', category: 'geo' },
  { id: 'd08-heart', name: 'Coeur fleuri', url: 'https://gsihevihnthjsm8z.public.blob.vercel-storage.com/static/delimiters/d08-heart.png', category: 'geo' },
  { id: 'd09-crown', name: 'Couronne ornementale', url: 'https://gsihevihnthjsm8z.public.blob.vercel-storage.com/static/delimiters/d09-crown.png', category: 'geo' },
  { id: 'd10-circle', name: 'Cercle de feuilles', url: 'https://gsihevihnthjsm8z.public.blob.vercel-storage.com/static/delimiters/d10-circle.png', category: 'geo' },
  // Mariage juif
  { id: 'd11-doves', name: 'Deux colombes', url: 'https://gsihevihnthjsm8z.public.blob.vercel-storage.com/static/delimiters/d11-doves.png', category: 'jewish' },
  { id: 'd12-rings', name: 'Bagues entrelacées', url: 'https://gsihevihnthjsm8z.public.blob.vercel-storage.com/static/delimiters/d12-rings.png', category: 'jewish' },
  { id: 'd13-kiddush', name: 'Coupe de Kiddoush', url: 'https://gsihevihnthjsm8z.public.blob.vercel-storage.com/static/delimiters/d13-kiddush.png', category: 'jewish' },
  { id: 'd14-candles', name: 'Bougies de Shabbat', url: 'https://gsihevihnthjsm8z.public.blob.vercel-storage.com/static/delimiters/d14-candles.png', category: 'jewish' },
  { id: 'd15-hamsa', name: 'Hamsa stylisée', url: 'https://gsihevihnthjsm8z.public.blob.vercel-storage.com/static/delimiters/d15-hamsa.png', category: 'jewish' },
];
