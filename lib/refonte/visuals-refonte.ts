export interface VisualRefonte {
  id: string
  category: 'mairie' | 'houppa' | 'henne' | 'shabbat'
  url: string
}

export const VISUALS_REFONTE: VisualRefonte[] = [
  // Mairie
  { id: 'NM01', category: 'mairie', url: 'https://res.cloudinary.com/dau96mui2/image/upload/q_auto,f_auto/v1781204025/hq2ec39svmkagfa8oh1m.jpg' },
  { id: 'NM02', category: 'mairie', url: 'https://res.cloudinary.com/dau96mui2/image/upload/q_auto,f_auto/v1781018150/egcowtemzwvkvketjcwe.jpg' },

  // Houppa
  { id: 'NH01', category: 'houppa', url: 'https://res.cloudinary.com/dau96mui2/image/upload/q_auto,f_auto/v1781018171/t7fl3wjyzteye7ieyvxg.jpg' },
  { id: 'NH02', category: 'houppa', url: 'https://res.cloudinary.com/dau96mui2/image/upload/q_auto,f_auto/v1781018191/m2ymz5b4i966p1idkzpc.jpg' },
]

export const byCategory = (cat: string) =>
  VISUALS_REFONTE.filter(v => v.category === cat)

export const defaultForCategory = (cat: string) =>
  VISUALS_REFONTE.find(v => v.category === cat)
