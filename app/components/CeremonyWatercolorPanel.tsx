'use client'

import React, { useState, useEffect, useRef } from 'react'
import type { Palette } from '@/lib/watercolorPrompt'

interface CeremonyData {
  type: string
  customName?: string
  lieu: string
  adresse: string
  illustrationUrl?: string
}

const GOLD = '#C9A84C'
const BTN: React.CSSProperties = { touchAction: 'manipulation', WebkitTapHighlightColor: 'transparent', cursor: 'pointer' }

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
  // Photo de référence par cérémonie
  const [venuePhotos, setVenuePhotos] = useState<Record<number, string | null>>({})
  const [searchingPhoto, setSearchingPhoto] = useState<number | null>(null)
  const autoSearched = useRef<Set<number>>(new Set())

  const ceremoniesWithLieu = ceremonies.map((c, i) => ({ ...c, originalIndex: i })).filter(c => c.lieu.trim())

  // ── Recherche automatique de la photo du lieu ──
  useEffect(() => {
    ceremoniesWithLieu.forEach(c => {
      if (autoSearched.current.has(c.originalIndex)) return
      if (c.illustrationUrl) return // déjà une aquarelle
      if (venuePhotos[c.originalIndex] !== undefined) return
      autoSearched.current.add(c.originalIndex)
      searchVenuePhoto(c.originalIndex, c.lieu, c.adresse)
    })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ceremoniesWithLieu.length])

  const searchVenuePhoto = async (idx: number, lieu: string, adresse: string) => {
    setSearchingPhoto(idx)
    try {
      const res = await fetch('/api/search-venue-photo', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: `${lieu} ${adresse}`.trim() }),
      })
      const data = await res.json()
      setVenuePhotos(prev => ({ ...prev, [idx]: data.photo || null }))
    } catch {
      setVenuePhotos(prev => ({ ...prev, [idx]: null }))
    } finally {
      setSearchingPhoto(null)
    }
  }

  const generate = async (idx: number, lieu: string, adresse: string, type: string, referenceImageUrl?: string) => {
    setGeneratingIdx(idx)
    setError('')
    setCandidates(prev => ({ ...prev, [idx]: [] }))
    try {
      const controller = new AbortController()
      const timeout = setTimeout(() => controller.abort(), 90000)
      const res = await fetch('/api/generate-watercolor', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          mode: 'venue', lieu, adresse, ceremonyType: type, palette,
          ...(referenceImageUrl ? { referenceImageUrl } : {}),
        }),
        signal: controller.signal,
      })
      clearTimeout(timeout)
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Erreur')
      setCandidates(prev => ({ ...prev, [idx]: data.images }))
    } catch (err) {
      if (err instanceof DOMException && err.name === 'AbortError') {
        setError('La génération a pris trop de temps. Réessayez.')
      } else {
        setError(err instanceof Error ? err.message : 'Erreur lors de la génération')
      }
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
      setCandidates(prev => { const next = { ...prev }; delete next[ceremonyIdx]; return next })
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
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      {error && <p style={{ color: '#dc2626', fontSize: 13, textAlign: 'center' }}>{error}</p>}

      {ceremoniesWithLieu.map(c => {
        const idx = c.originalIndex
        const label = c.customName || CEREMONY_LABELS[c.type] || c.type
        const isGenerating = generatingIdx === idx
        const imgs = candidates[idx] || []
        const accepted = c.illustrationUrl
        const venuePhoto = venuePhotos[idx]
        const isSearching = searchingPhoto === idx

        return (
          <div key={idx} style={{ background: '#fdf8f0', borderRadius: 12, padding: 12, border: '1px solid #e8e0d8' }}>
            {/* Header */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
              <div>
                <div style={{ fontSize: 11, color: GOLD, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em' }}>{label}</div>
                <div style={{ fontSize: 12, color: '#3a3330', fontWeight: 600, marginTop: 1 }}>{c.lieu}</div>
              </div>
              {accepted && !imgs.length && (
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={accepted} alt={label} style={{ width: 56, height: 38, objectFit: 'cover', borderRadius: 6, border: '2px solid #7a9e6e' }} />
                  <button type="button" onClick={() => generate(idx, c.lieu, c.adresse, c.type, venuePhoto || undefined)} disabled={generatingIdx !== null} style={{ ...BTN, background: 'none', border: 'none', color: '#9a928a', fontSize: 10, textDecoration: 'underline', padding: 0 }}>
                    Changer
                  </button>
                </div>
              )}
            </div>

            {/* Recherche de photo en cours */}
            {isSearching && !accepted && (
              <div style={{ textAlign: 'center', padding: '8px 0' }}>
                <div style={{ fontSize: 11, color: '#9a928a', fontStyle: 'italic' }}>Recherche de la photo du lieu…</div>
              </div>
            )}

            {/* Photo de référence trouvée — proposition à la mariée */}
            {venuePhoto && !accepted && !imgs.length && !isGenerating && !isSearching && (
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: 11, color: '#3a3330', fontWeight: 600, marginBottom: 6 }}>Photo du lieu trouvée</div>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={venuePhoto} alt={c.lieu} style={{ width: '80%', maxHeight: 120, objectFit: 'cover', borderRadius: 8, display: 'block', margin: '0 auto', border: '1px solid #e8e0d8' }} />
                <div style={{ display: 'flex', gap: 8, justifyContent: 'center', marginTop: 10 }}>
                  <button type="button" onClick={() => generate(idx, c.lieu, c.adresse, c.type, venuePhoto)} disabled={generatingIdx !== null} style={{
                    ...BTN, padding: '8px 16px', borderRadius: 9999, border: 'none',
                    background: `linear-gradient(135deg, ${GOLD}, #e8c96a)`, color: 'white', fontSize: 12, fontWeight: 700,
                    opacity: generatingIdx !== null ? 0.5 : 1,
                  }}>
                    Transformer en aquarelle
                  </button>
                  <button type="button" onClick={() => { setVenuePhotos(prev => ({ ...prev, [idx]: null })); generate(idx, c.lieu, c.adresse, c.type) }} disabled={generatingIdx !== null} style={{ ...BTN, background: 'none', border: 'none', color: '#9a928a', fontSize: 10, textDecoration: 'underline' }}>
                    Sans photo
                  </button>
                </div>
              </div>
            )}

            {/* Pas de photo trouvée — génération texte classique */}
            {venuePhoto === null && !accepted && !imgs.length && !isGenerating && !isSearching && (
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: 11, color: '#9a928a', marginBottom: 8 }}>Aucune photo trouvée pour ce lieu</div>
                <button type="button" onClick={() => generate(idx, c.lieu, c.adresse, c.type)} disabled={generatingIdx !== null} style={{
                  ...BTN, padding: '8px 16px', borderRadius: 9999, border: 'none',
                  background: generatingIdx !== null ? '#e0d5c8' : `linear-gradient(135deg, ${GOLD}, #e8c96a)`,
                  color: 'white', fontSize: 12, fontWeight: 700,
                  opacity: generatingIdx !== null ? 0.5 : 1,
                }}>
                  Générer l&apos;aquarelle
                </button>
              </div>
            )}

            {/* Generating */}
            {isGenerating && (
              <div style={{ textAlign: 'center', padding: '14px 0' }}>
                <div style={{ fontFamily: 'var(--font-great-vibes)', fontSize: 18, color: GOLD, marginBottom: 4 }}>
                  L&apos;artiste peint…
                </div>
                <p style={{ fontFamily: 'var(--font-cormorant-garamond)', fontStyle: 'italic', fontSize: 11, color: '#9a928a', margin: 0 }}>
                  {venuePhoto ? 'Transformation de la photo en aquarelle…' : `Aquarelle de « ${c.lieu} » en cours`}
                </p>
              </div>
            )}

            {/* Candidates */}
            {imgs.length > 0 && !isGenerating && (
              <div>
                <p style={{ fontSize: 11, fontWeight: 600, color: '#3a3330', marginBottom: 6, textAlign: 'center' }}>Choisissez votre préférée</p>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 8 }}>
                  {imgs.map((url, i) => {
                    const saving = savingKey === `${idx}-${url}`
                    return (
                      <button key={i} type="button" onClick={() => selectImage(idx, url)} disabled={savingKey !== null} style={{
                        ...BTN, padding: 0, border: `2px solid ${saving ? GOLD : 'transparent'}`,
                        borderRadius: 8, overflow: 'hidden', position: 'relative',
                        opacity: savingKey !== null && !saving ? 0.5 : 1,
                      }}>
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={url} alt={`Option ${i + 1}`} style={{ width: '100%', aspectRatio: '3/2', objectFit: 'cover', display: 'block' }} />
                        {saving && (
                          <div style={{ position: 'absolute', inset: 0, background: 'rgba(255,255,255,0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <span style={{ fontSize: 11, color: GOLD, fontWeight: 700 }}>…</span>
                          </div>
                        )}
                        <div style={{ position: 'absolute', bottom: 4, left: '50%', transform: 'translateX(-50%)', background: 'rgba(255,255,255,0.9)', borderRadius: 9999, padding: '2px 10px', fontSize: 9, fontWeight: 600, color: GOLD }}>
                          Choisir
                        </div>
                      </button>
                    )
                  })}
                </div>
                <button type="button" onClick={() => generate(idx, c.lieu, c.adresse, c.type, venuePhoto || undefined)} disabled={generatingIdx !== null} style={{ ...BTN, display: 'block', margin: '8px auto 0', background: 'none', border: 'none', color: '#9a928a', fontSize: 10, textDecoration: 'underline' }}>
                  Régénérer
                </button>
              </div>
            )}
          </div>
        )
      })}
    </div>
  )
}
