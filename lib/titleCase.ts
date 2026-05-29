const PARTICLES = new Set(['de', 'du', 'des', 'la', 'le', 'les', 'et', 'en', 'au', 'aux', 'sur', 'à'])
const ACRONYMS = new Set(['tlv', 'nyc', 'cdg', 'usa', 'uk', 'ii', 'iii', 'iv'])

export function toTitleCase(str: string): string {
  if (!str) return str
  return str
    .trim()
    .replace(/\s+/g, ' ')
    .split(' ')
    .map((word, i) => {
      const lower = word.toLowerCase()
      if (ACRONYMS.has(lower)) return word.toUpperCase()
      if (i > 0 && PARTICLES.has(lower)) return lower
      if (word.length === 0) return word
      return lower.charAt(0).toUpperCase() + lower.slice(1)
    })
    .join(' ')
}
