'use client'

import React, { useState } from 'react'
import type { Palette } from '@/lib/watercolorPrompt'

interface CeremonyData {
  type: string
  customName?: string
  lieu: string
  adresse: string
  illustrationUrl?: string
}

const GOLD = '#C9A84C'

const BTN: React.CSSProperties = {
  touchAction: 'manipulation',
  WebkitTapHighlightColor: 'transparent',
  cursor: 'pointer',
}

const CEREMONY_LABELS: Record<string, string> = {
  'Mairie': 'Mairie',
  'Cérémonie religieuse / Houppa': 'Houppa',
  'Shabbat Hatan': 'Shabbat Hatan',
  'Henné': 'Henné',
  'Cocktail': 'Cocktail',
  'Soirée': 'Soirée',
  'Boat Party': 'Boat Party',
  'Autre': 'Événement',
}

export default function CeremonyWatercolorPanel({
  ceremonies,
  palette,
  onUpdateCeremony,
}: {
  ceremonies: CeremonyData[]
  palette: Palette
  onUpdateCeremony: (index: number, updates: { illustrationUrl?: string }) => void
}) {
  const [generatingIdx, setGeneratingIdx] = useState<number | null>(null)
  const [candidates, setCandidates] = useState<Record<number, string[]>>({})
  const [savingKey, setSavingKey] = useState<string | null>(null)
  const [error, setError] = useState('')

  const ceremoniesWithLieu = ceremonies.map((c, i) => ({ ...c, originalIndex: i })).filter(c => c.lieu.trim())

  const generate = async (idx: number, lieu: string, adresse: string, type: string) => {
    setGeneratingIdx(idx)
    setError('')
    setCandidates(prev => ({ ...prev, [idx]: [] }))
    try {
      const res = await fetch('/api/generate-watercolor', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mode: 'venue', lieu, adresse, ceremonyType: type, palette }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Erreur')
      setCandidates(prev => ({ ...prev, [idx]: data.images }))
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur lors de la génération')
    } finally {
      setGeneratingIdx(null)
    }
  }

  const selectImage = async (ceremonyIdx: number, imageUrl: string) => {
    const key = `${ceremonyIdx}-${imageUrl}`
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
      onUpdateCeremony(ceremonyIdx, { illustrationUrl: data.url })
      setCandidates(prev => {
        const next = { ...prev }
        delete next[ceremonyIdx]
        return next
      })
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur lors de la sauvegarde')
    } finally {
      setSavingKey(null)
    }
  }

  if (ceremoniesWithLieu.length === 0) {
    return (
      <p style={{ fontSize: 13, color: '#9a928a', textAlign: 'center', padding: 20, fontStyle: 'italic' }}>
        Renseignez les lieux de vos événements à l&apos;étape 3 pour générer des aquarelles personnalisées.
      </p>
    )
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      {error && (
        <p style={{ color: '#dc2626', fontSize: 13, textAlign: 'center' }}>{error}</p>
      )}

      {ceremoniesWithLieu.map(c => {
        const idx = c.originalIndex
        const label = c.customName || CEREMONY_LABELS[c.type] || c.type
        const isGenerating = generatingIdx === idx
        const imgs = candidates[idx] || []
        const accepted = c.illustrationUrl

        return (
          <div key={idx} style={{ background: '#fdf8f0', borderRadius: 12, padding: 16, border: '1px solid #e8e0d8' }}>
            {/* Header */}
            <div style={{ marginBottom: 12 }}>
              <div style={{ fontSize: 11, color: GOLD, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em' }}>{label}</div>
              <div style={{ fontSize: 14, color: '#3a3330', fontWeight: 600, marginTop: 2 }}>{c.lieu}</div>
              {c.adresse && <div style={{ fontSize: 11, color: '#9a928a' }}>{c.adresse}</div>}
            </div>

            {/* Accepted state */}
            {accepted && !imgs.length && (
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: 11, color: '#7a9e6e', fontWeight: 600, marginBottom: 6 }}>Aquarelle choisie</div>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={accepted} alt={`Aquarelle ${label}`} style={{ width: '70%', borderRadius: 10, boxShadow: '0 2px 12px rgba(0,0,0,0.08)', margin: '0 auto', display: 'block' }} />
                <button
                  type="button"
                  onClick={() => generate(idx, c.lieu, c.adresse, c.type)}
                  disabled={generatingIdx !== null}
                  style={{ ...BTN, marginTop: 10, background: 'none', border: 'none', color: '#9a928a', fontSize: 11, textDecoration: 'underline' }}
                >
                  Régénérer
                </button>
              </div>
            )}

            {/* Generating state */}
            {isGenerating && (
              <div style={{ textAlign: 'center', padding: '20px 0' }}>
                <div style={{ fontFamily: 'var(--font-great-vibes)', fontSize: 22, color: GOLD, marginBottom: 6 }}>
                  L&apos;artiste peint...
                </div>
                <p style={{ fontFamily: 'var(--font-cormorant-garamond)', fontStyle: 'italic', fontSize: 12, color: '#9a928a' }}>
                  2 aquarelles de &laquo;&nbsp;{c.lieu}&nbsp;&raquo; en cours
                </p>
              </div>
            )}

            {/* Candidates to choose from */}
            {imgs.length > 0 && !isGenerating && (
              <div>
                <p style={{ fontSize: 12, fontWeight: 600, color: '#3a3330', marginBottom: 8, textAlign: 'center' }}>
                  Choisissez votre préférée
                </p>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 10 }}>
                  {imgs.map((url, i) => {
                    const saving = savingKey === `${idx}-${url}`
                    return (
                      <button
                        key={i}
                        type="button"
                        onClick={() => selectImage(idx, url)}
                        disabled={savingKey !== null}
                        style={{
                          ...BTN, padding: 0, border: `3px solid ${saving ? GOLD : 'transparent'}`,
                          borderRadius: 10, overflow: 'hidden', position: 'relative',
                          opacity: savingKey !== null && !saving ? 0.5 : 1,
                        }}
                      >
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={url} alt={`Option ${i + 1}`} style={{ width: '100%', aspectRatio: '2/3', objectFit: 'cover', display: 'block' }} />
                        {saving && (
                          <div style={{ position: 'absolute', inset: 0, background: 'rgba(255,255,255,0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <span style={{ fontSize: 12, color: GOLD, fontWeight: 700 }}>Enregistrement...</span>
                          </div>
                        )}
                        <div style={{ position: 'absolute', bottom: 6, left: '50%', transform: 'translateX(-50%)', background: 'rgba(255,255,255,0.9)', borderRadius: 9999, padding: '3px 12px', fontSize: 10, fontWeight: 600, color: GOLD }}>
                          Choisir
                        </div>
                      </button>
                    )
                  })}
                </div>
                <button
                  type="button"
                  onClick={() => generate(idx, c.lieu, c.adresse, c.type)}
                  disabled={generatingIdx !== null}
                  style={{ ...BTN, display: 'block', margin: '10px auto 0', background: 'none', border: 'none', color: '#9a928a', fontSize: 11, textDecoration: 'underline' }}
                >
                  Régénérer de nouvelles options
                </button>
              </div>
            )}

            {/* Initial state: no illustration yet, not generating */}
            {!accepted && !imgs.length && !isGenerating && (
              <button
                type="button"
                onClick={() => generate(idx, c.lieu, c.adresse, c.type)}
                disabled={generatingIdx !== null}
                style={{
                  ...BTN, width: '100%', padding: '12px', borderRadius: 9999, border: 'none',
                  background: generatingIdx !== null ? '#e0d5c8' : `linear-gradient(135deg, ${GOLD}, #e8c96a)`,
                  color: 'white', fontSize: 13, fontWeight: 700, letterSpacing: '0.03em',
                  opacity: generatingIdx !== null ? 0.5 : 1,
                }}
              >
                Générer l&apos;aquarelle
              </button>
            )}
          </div>
        )
      })}
    </div>
  )
}
