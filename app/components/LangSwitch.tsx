'use client'

import { useT } from '@/lib/i18n'

export function LangSwitch({ color = '#C9A84C' }: { color?: string }) {
  const { locale, setLocale } = useT()
  return (
    <button
      onClick={() => setLocale(locale === 'fr' ? 'en' : 'fr')}
      aria-label="Switch language"
      style={{
        cursor: 'pointer',
        padding: '4px 10px',
        borderRadius: 9999,
        border: `1px solid ${color}44`,
        background: 'transparent',
        fontSize: 12,
        fontWeight: 600,
        color,
        letterSpacing: '0.05em',
        fontFamily: 'var(--font-playfair-display)',
      }}
    >
      {locale === 'fr' ? '🇬🇧 EN' : '🇫🇷 FR'}
    </button>
  )
}
