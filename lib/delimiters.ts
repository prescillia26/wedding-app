export interface Delimiter {
  id: string;
  name: string;
  url: string;
  category: 'floral' | 'geo' | 'jewish';
}

export const DELIMITERS: Delimiter[] = [
  // Floral
  { id: 'd01-violets', name: 'Bouquet de violettes', url: 'https://res.cloudinary.com/dau96mui2/image/upload/v1780478761/delimiters/delimiters/d01-violets.png', category: 'floral' },
  { id: 'd02-olive', name: "Branche d'olivier", url: 'https://res.cloudinary.com/dau96mui2/image/upload/v1780478762/delimiters/delimiters/d02-olive.png', category: 'floral' },
  { id: 'd03-rose-stem', name: 'Rose unique', url: 'https://res.cloudinary.com/dau96mui2/image/upload/v1780478763/delimiters/delimiters/d03-rose-stem.png', category: 'floral' },
  { id: 'd04-wisteria', name: 'Glycine cascadante', url: 'https://res.cloudinary.com/dau96mui2/image/upload/v1780478763/delimiters/delimiters/d04-wisteria.png', category: 'floral' },
  { id: 'd05-laurel', name: 'Couronne de laurier', url: 'https://res.cloudinary.com/dau96mui2/image/upload/v1780478765/delimiters/delimiters/d05-laurel.png', category: 'floral' },
  // Géométrique
  { id: 'd06-diamond', name: 'Diamant Art Nouveau', url: 'https://res.cloudinary.com/dau96mui2/image/upload/v1780478766/delimiters/delimiters/d06-diamond.png', category: 'geo' },
  { id: 'd07-magen', name: 'Étoile à 6 branches', url: 'https://res.cloudinary.com/dau96mui2/image/upload/v1780479343/delimiters/delimiters/d07-magen.png', category: 'geo' },
  { id: 'd08-heart', name: 'Coeur fleuri', url: 'https://res.cloudinary.com/dau96mui2/image/upload/v1780478767/delimiters/delimiters/d08-heart.png', category: 'geo' },
  { id: 'd09-crown', name: 'Couronne ornementale', url: 'https://res.cloudinary.com/dau96mui2/image/upload/v1780479344/delimiters/delimiters/d09-crown.png', category: 'geo' },
  { id: 'd10-circle', name: 'Cercle de feuilles', url: 'https://res.cloudinary.com/dau96mui2/image/upload/v1780479345/delimiters/delimiters/d10-circle.png', category: 'geo' },
  // Mariage juif
  { id: 'd11-doves', name: 'Deux colombes', url: 'https://res.cloudinary.com/dau96mui2/image/upload/v1780479346/delimiters/delimiters/d11-doves.png', category: 'jewish' },
  { id: 'd12-rings', name: 'Bagues entrelacées', url: 'https://res.cloudinary.com/dau96mui2/image/upload/v1780478768/delimiters/delimiters/d12-rings.png', category: 'jewish' },
  { id: 'd13-kiddush', name: 'Coupe de Kiddoush', url: 'https://res.cloudinary.com/dau96mui2/image/upload/v1780479347/delimiters/delimiters/d13-kiddush.png', category: 'jewish' },
  { id: 'd14-candles', name: 'Bougies de Shabbat', url: 'https://res.cloudinary.com/dau96mui2/image/upload/v1780479348/delimiters/delimiters/d14-candles.png', category: 'jewish' },
  { id: 'd15-hamsa', name: 'Hamsa stylisée', url: 'https://res.cloudinary.com/dau96mui2/image/upload/v1780479349/delimiters/delimiters/d15-hamsa.png', category: 'jewish' },
];
