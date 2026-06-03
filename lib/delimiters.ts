export interface Delimiter {
  id: string;
  name: string;
  url: string;
  category: 'floral' | 'geo' | 'jewish';
}

export const DELIMITERS: Delimiter[] = [
  { id: 'd01-violets', name: 'Bouquet de violettes', url: 'https://replicate.delivery/xezq/ogVMmutnqH4pOBgYeHWMhdIhX9zO2tFJXo2gasGSb58M5sVLA/out-0.png', category: 'floral' },
  { id: 'd02-olive', name: "Branche d'olivier", url: 'https://replicate.delivery/xezq/bUzTF51FO8IQB1AqXdK7eEHtaICezJqvWf07hGAFR9C1kzWtA/out-0.png', category: 'floral' },
  { id: 'd03-rose-stem', name: 'Rose unique', url: 'https://replicate.delivery/xezq/Xk7oFIaAXO5kHdJKTD1hevcu1AQqmxJn8D78e5gaiiObyZrWA/out-0.png', category: 'floral' },
  { id: 'd04-wisteria', name: 'Glycine cascadante', url: 'https://replicate.delivery/xezq/ne6git7kGTzsAqCDEvYLf4jR2YVBVRW2QfIU85YHtWh7kzWtA/out-0.png', category: 'floral' },
  { id: 'd05-laurel', name: 'Couronne de laurier', url: 'https://replicate.delivery/xezq/TAcnE9YkfE0rWq9lwiE1vWTJfXTBBXt9TolX4GILfmi9kzWtA/out-0.png', category: 'floral' },
  { id: 'd06-diamond', name: 'Diamant Art Nouveau', url: 'https://replicate.delivery/xezq/gDtceCByol1JUqCezQElW2BXQSHEFDlvl10eSvEVvAPfJntaB/out-0.png', category: 'geo' },
  { id: 'd08-heart', name: 'Coeur fleuri', url: 'https://replicate.delivery/xezq/f47QzA0vz63TDSq62WoNEg5urJ65lSfaO63JRgKi5djhyZrWA/out-0.png', category: 'geo' },
  { id: 'd12-rings', name: 'Bagues entrelacées', url: 'https://replicate.delivery/xezq/LzhWyl4ZShKFNdl64yxhwF60zDhGJrgc0810sTeNpeJjyZrWA/out-0.png', category: 'jewish' },
];
