'use client'

import { useState, useRef, useEffect } from 'react'
import { useT } from '@/lib/i18n'

const LANGS = [
  { code: 'fr' as const, flag: '🇫🇷', label: 'Français' },
  { code: 'en' as const, flag: '🇺🇸', label: 'English' },
]

export function LangSwitch({ color = '#C9A84C' }: { color?: string }) {
  const { locale, setLocale } = useT()
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  const current = LANGS.find(l => l.code === locale) || LANGS[0]

  return (
    <div ref={ref} style={{ position: 'relative', display: 'inline-block' }}>
      <button
        onClick={() => setOpen(o => !o)}
        aria-label="Switch language"
        style={{
          cursor: 'pointer',
          padding: '5px 12px',
          borderRadius: 9999,
          border: `1px solid ${color}44`,
          background: 'transparent',
          fontSize: 12,
          fontWeight: 600,
          color,
          letterSpacing: '0.04em',
          fontFamily: 'var(--font-playfair-display)',
          display: 'flex',
          alignItems: 'center',
          gap: 5,
        }}
      >
        <span>{current.flag}</span>
        <span>{current.label}</span>
        <span style={{ fontSize: 8, opacity: 0.6, marginLeft: 2 }}>▼</span>
      </button>
      {open && (
        <div style={{
          position: 'absolute',
          top: '100%',
          right: 0,
          marginTop: 4,
          background: 'white',
          borderRadius: 10,
          boxShadow: '0 4px 20px rgba(0,0,0,0.12)',
          border: `1px solid ${color}22`,
          overflow: 'hidden',
          zIndex: 1000,
          minWidth: 130,
        }}>
          {LANGS.map(lang => (
            <button
              key={lang.code}
              onClick={() => { setLocale(lang.code); setOpen(false) }}
              style={{
                width: '100%',
                padding: '10px 14px',
                border: 'none',
                background: lang.code === locale ? `${color}10` : 'transparent',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                fontSize: 13,
                color: lang.code === locale ? color : '#3a3330',
                fontWeight: lang.code === locale ? 700 : 400,
                fontFamily: 'var(--font-cormorant-garamond)',
              }}
            >
              <span>{lang.flag}</span>
              <span>{lang.label}</span>
              {lang.code === locale && <span style={{ marginLeft: 'auto', fontSize: 11 }}>✓</span>}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
