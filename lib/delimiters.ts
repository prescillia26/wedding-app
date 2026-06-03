export interface Delimiter {
  id: string;
  name: string;
  url: string;
  category: 'floral' | 'geo' | 'jewish';
}

export const DELIMITERS: Delimiter[] = [
  { id: 'd01-violets', name: 'Bouquet de violettes', url: 'https://res.cloudinary.com/dau96mui2/image/upload/v1780478761/delimiters/delimiters/d01-violets.png', category: 'floral' },
  { id: 'd02-olive', name: "Branche d'olivier", url: 'https://res.cloudinary.com/dau96mui2/image/upload/v1780478762/delimiters/delimiters/d02-olive.png', category: 'floral' },
  { id: 'd03-rose-stem', name: 'Rose unique', url: 'https://res.cloudinary.com/dau96mui2/image/upload/v1780478763/delimiters/delimiters/d03-rose-stem.png', category: 'floral' },
  { id: 'd04-wisteria', name: 'Glycine cascadante', url: 'https://res.cloudinary.com/dau96mui2/image/upload/v1780478763/delimiters/delimiters/d04-wisteria.png', category: 'floral' },
  { id: 'd05-laurel', name: 'Couronne de laurier', url: 'https://res.cloudinary.com/dau96mui2/image/upload/v1780478765/delimiters/delimiters/d05-laurel.png', category: 'floral' },
  { id: 'd06-diamond', name: 'Diamant Art Nouveau', url: 'https://res.cloudinary.com/dau96mui2/image/upload/v1780478766/delimiters/delimiters/d06-diamond.png', category: 'geo' },
  { id: 'd08-heart', name: 'Coeur fleuri', url: 'https://res.cloudinary.com/dau96mui2/image/upload/v1780478767/delimiters/delimiters/d08-heart.png', category: 'geo' },
  { id: 'd12-rings', name: 'Bagues entrelacées', url: 'https://res.cloudinary.com/dau96mui2/image/upload/v1780478768/delimiters/delimiters/d12-rings.png', category: 'jewish' },
];
