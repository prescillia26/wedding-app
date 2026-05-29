'use client'

import React, { useState } from 'react'
import { DECO_TYPES, DECO_LABELS, type Palette } from '@/lib/watercolorPrompt'

const GOLD = '#C9A84C'

const BTN: React.CSSProperties = {
  touchAction: 'manipulation',
  WebkitTapHighlightColor: 'transparent',
  cursor: 'pointer',
}

export default function DecoIllustrationPanel({
  palette,
  accentColor,
  locale = 'fr',
  onSelectIllustration,
  selectedIllustrations,
}: {
  palette: Palette
  accentColor: string
  locale?: string
  onSelectIllustration: (decoId: string, url: string) => void
  selectedIllustrations: Record<string, string> // decoId → saved url
}) {
  const [generatingId, setGeneratingId] = useState<string | null>(null)
  const [candidates, setCandidates] = useState<Record<string, string[]>>({})
  const [savingKey, setSavingKey] = useState<string | null>(null)
  const [error, setError] = useState('')

  const generate = async (decoId: string) => {
    setGeneratingId(decoId)
    setError('')
    setCandidates(prev => ({ ...prev, [decoId]: [] }))
    try {
      const res = await fetch('/api/generate-watercolor', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mode: 'deco', decoId, palette }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Erreur')
      setCandidates(prev => ({ ...prev, [decoId]: data.images }))
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur lors de la génération')
    } finally {
      setGeneratingId(null)
    }
  }

  const selectImage = async (decoId: string, imageUrl: string) => {
    const key = `${decoId}-${imageUrl}`
    setSavingKey(key)
    setError('')
    try {
      const res = await fetch('/api/save-watercolor', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ imageUrl }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Erreur')
      onSelectIllustration(decoId, data.url)
      setCandidates(prev => {
        const next = { ...prev }
        delete next[decoId]
        return next
      })
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur lors de la sauvegarde')
    } finally {
      setSavingKey(null)
    }
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      {error && (
        <p style={{ color: '#dc2626', fontSize: 13, textAlign: 'center' }}>{error}</p>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 10 }}>
        {DECO_TYPES.map(decoId => {
          const label = DECO_LABELS[decoId]?.[locale === 'en' ? 'en' : 'fr'] || decoId
          const isGenerating = generatingId === decoId
          const imgs = candidates[decoId] || []
          const savedUrl = selectedIllustrations[decoId]

          return (
            <div key={decoId} style={{ background: '#fdf8f0', borderRadius: 12, padding: 12, border: `1px solid ${savedUrl ? accentColor : '#e8e0d8'}`, position: 'relative' }}>
              {/* Label */}
              <div style={{ fontSize: 11, fontWeight: 700, color: accentColor, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 8, textAlign: 'center' }}>
                {label}
              </div>

              {/* Saved state */}
              {savedUrl && !imgs.length && !isGenerating && (
                <div style={{ textAlign: 'center' }}>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={savedUrl} alt={label} style={{ width: '80%', borderRadius: 8, margin: '0 auto', display: 'block', boxShadow: '0 2px 8px rgba(0,0,0,0.08)' }} />
                  <div style={{ display: 'flex', gap: 6, justifyContent: 'center', marginTop: 8 }}>
                    <button type="button" onClick={() => generate(decoId)} disabled={generatingId !== null} style={{ ...BTN, background: 'none', border: 'none', color: '#9a928a', fontSize: 10, textDecoration: 'underline' }}>
                      {locale === 'en' ? 'Regenerate' : 'Régénérer'}
                    </button>
                    <button type="button" onClick={() => onSelectIllustration(decoId, '')} style={{ ...BTN, background: 'none', border: 'none', color: '#dc2626', fontSize: 10, textDecoration: 'underline' }}>
                      {locale === 'en' ? 'Remove' : 'Retirer'}
                    </button>
                  </div>
                </div>
              )}

              {/* Generating state */}
              {isGenerating && (
                <div style={{ textAlign: 'center', padding: '16px 0' }}>
                  <div style={{ fontFamily: 'var(--font-great-vibes)', fontSize: 18, color: GOLD, marginBottom: 4 }}>
                    {locale === 'en' ? 'Painting...' : 'L\u2019artiste peint\u2026'}
                  </div>
                  <p style={{ fontSize: 10, color: '#9a928a', fontStyle: 'italic', margin: 0 }}>
                    {locale === 'en' ? 'Generating watercolor' : 'Génération en cours'}
                  </p>
                </div>
              )}

              {/* Candidates to choose from */}
              {imgs.length > 0 && !isGenerating && (
                <div>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 6 }}>
                    {imgs.map((url, i) => {
                      const saving = savingKey === `${decoId}-${url}`
                      return (
                        <button key={i} type="button" onClick={() => selectImage(decoId, url)} disabled={savingKey !== null} style={{
                          ...BTN, padding: 0, border: `2px solid ${saving ? accentColor : 'transparent'}`,
                          borderRadius: 8, overflow: 'hidden', position: 'relative',
                          opacity: savingKey !== null && !saving ? 0.5 : 1,
                        }}>
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img src={url} alt={`${label} ${i + 1}`} style={{ width: '100%', aspectRatio: '1/1', objectFit: 'cover', display: 'block' }} />
                          {saving && (
                            <div style={{ position: 'absolute', inset: 0, background: 'rgba(255,255,255,0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                              <span style={{ fontSize: 10, color: GOLD, fontWeight: 700 }}>...</span>
                            </div>
                          )}
                        </button>
                      )
                    })}
                  </div>
                  <button type="button" onClick={() => generate(decoId)} disabled={generatingId !== null} style={{ ...BTN, display: 'block', margin: '6px auto 0', background: 'none', border: 'none', color: '#9a928a', fontSize: 10, textDecoration: 'underline' }}>
                    {locale === 'en' ? 'Regenerate' : 'Régénérer'}
                  </button>
                </div>
              )}

              {/* Initial state: generate button */}
              {!savedUrl && !imgs.length && !isGenerating && (
                <button type="button" onClick={() => generate(decoId)} disabled={generatingId !== null} style={{
                  ...BTN, width: '100%', padding: '10px', borderRadius: 9999, border: 'none',
                  background: generatingId !== null ? '#e0d5c8' : `linear-gradient(135deg, ${accentColor}, ${accentColor}bb)`,
                  color: 'white', fontSize: 11, fontWeight: 700, letterSpacing: '0.03em',
                  opacity: generatingId !== null ? 0.5 : 1,
                }}>
                  {locale === 'en' ? 'Generate' : 'Générer'}
                </button>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
