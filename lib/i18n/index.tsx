'use client'

import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from 'react'
import type { Locale, Dictionary } from './types'
import fr from './dictionaries/fr'
import en from './dictionaries/en'

const dictionaries: Record<Locale, Dictionary> = { fr, en }
const STORAGE_KEY = 'lovit-lang'
const DEFAULT_LOCALE: Locale = 'fr'

function detectLocale(): Locale {
  if (typeof window === 'undefined') return DEFAULT_LOCALE
  const stored = localStorage.getItem(STORAGE_KEY)
  if (stored === 'fr' || stored === 'en') return stored
  const browserLang = navigator.language.slice(0, 2)
  return browserLang === 'en' ? 'en' : 'fr'
}

interface I18nContextValue {
  locale: Locale
  setLocale: (l: Locale) => void
  t: Dictionary
  formatDate: (date: Date | string, opts?: Intl.DateTimeFormatOptions) => string
}

const I18nContext = createContext<I18nContextValue | null>(null)

export function I18nProvider({ children }: { children: ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>(DEFAULT_LOCALE)

  useEffect(() => {
    setLocaleState(detectLocale())
  }, [])

  const setLocale = useCallback((l: Locale) => {
    setLocaleState(l)
    try { localStorage.setItem(STORAGE_KEY, l) } catch { /* ignore */ }
    document.documentElement.lang = l
  }, [])

  const formatDate = useCallback((date: Date | string, opts?: Intl.DateTimeFormatOptions) => {
    const d = typeof date === 'string' ? new Date(date + (date.includes('T') ? '' : 'T12:00:00')) : date
    return d.toLocaleDateString(locale === 'fr' ? 'fr-FR' : 'en-US', opts ?? {
      day: 'numeric', month: 'long', year: 'numeric',
    })
  }, [locale])

  return (
    <I18nContext.Provider value={{ locale, setLocale, t: dictionaries[locale], formatDate }}>
      {children}
    </I18nContext.Provider>
  )
}

export function useT() {
  const ctx = useContext(I18nContext)
  if (!ctx) {
    // Fallback pour les composants en dehors du provider (ex: emails server-side)
    return { locale: 'fr' as Locale, setLocale: () => {}, t: fr, formatDate: (d: Date | string) => String(d) }
  }
  return ctx
}

export type { Locale, Dictionary }
