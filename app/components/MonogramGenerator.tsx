'use client'

import React, { useState, useEffect, useRef } from 'react'

const GOLD = '#C9A84C'
const BTN: React.CSSProperties = { touchAction: 'manipulation', WebkitTapHighlightColor: 'transparent', cursor: 'pointer' }

const STYLES = [
  { id: 'art-nouveau', label: 'Art Nouveau', icon: '✒️' },
  { id: 'laurel', label: 'Laurier', icon: '🌿' },
  { id: 'botanical', label: 'Botanique', icon: '🌸' },
  { id: 'floral-circle', label: 'Couronne florale', icon: '💐' },
  { id: 'minimal', label: 'Minimal', icon: '◆' },
  { id: 'oriental', label: 'Oriental', icon: '✦' },
]

export default function MonogramGenerator({
  initial1,
  initial2,
  accentColor,
  savedUrl,
  onSelect,
}: {
  initial1: string
  initial2: string
  accentColor: string
  savedUrl?: string
  onSelect: (url: string) => void
}) {
  const [generating, setGenerating] = useState(false)
  const [candidates, setCandidates] = useState<string[]>([])
  const [saving, setSaving] = useState<string | null>(null)
  const [error, setError] = useState('')
  const [selectedStyle, setSelectedStyle] = useState('art-nouveau')
  const autoGenRef = useRef(false)

  const i1 = (initial1 || 'A').charAt(0).toUpperCase()
  const i2 = (initial2 || 'B').charAt(0).toUpperCase()

  const generate = async (style?: string) => {
    setGenerating(true)
    setError('')
    setCandidates([])
    try {
      const controller = new AbortController()
      const timeout = setTimeout(() => controller.abort(), 90000)
      const res = await fetch('/api/generate-monogram', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ initial1: i1, initial2: i2, style: style || selectedStyle }),
        signal: controller.signal,
      })
      clearTimeout(timeout)
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Erreur')
      setCandidates(data.images)
    } catch (err) {
      if (err instanceof DOMException && err.name === 'AbortError') {
        setError('Trop long. Réessayez.')
      } else {
        setError(err instanceof Error ? err.message : 'Erreur')
      }
    } finally {
      setGenerating(false)
    }
  }

  useEffect(() => {
    if (!savedUrl && !autoGenRef.current && i1 && i2) {
      autoGenRef.current = true
      generate()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const selectImage = async (imageUrl: string) => {
    setSaving(imageUrl)
    try {
      const res = await fetch('/api/save-watercolor', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ imageUrl }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Erreur')
      onSelect(data.url)
      setCandidates([])
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur')
    } finally {
      setSaving(null)
    }
  }

  return (
    <div>
      {/* Sélecteur de style */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 6, marginBottom: 12 }}>
        {STYLES.map(s => {
          const sel = selectedStyle === s.id
          return (
            <button key={s.id} type="button" onClick={() => { setSelectedStyle(s.id); if (!generating) generate(s.id) }} style={{
              ...BTN, padding: '8px 4px', borderRadius: 8, fontSize: 10, fontWeight: sel ? 700 : 500,
              border: `1.5px solid ${sel ? accentColor : '#e8e0d8'}`,
              background: sel ? `${accentColor}10` : 'white',
              color: sel ? accentColor : '#3a3330',
            }}>
              <span style={{ fontSize: 14 }}>{s.icon}</span><br/>{s.label}
            </button>
          )
        })}
      </div>

      {/* Saved state */}
      {savedUrl && candidates.length === 0 && !generating && (
        <div style={{ textAlign: 'center' }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={savedUrl} alt={`${i1}&${i2}`} style={{ width: 100, height: 100, objectFit: 'contain', mixBlendMode: 'multiply', display: 'inline-block' }} />
          <div>
            <button type="button" onClick={() => generate()} style={{ ...BTN, background: 'none', border: 'none', color: '#9a928a', fontSize: 10, textDecoration: 'underline', marginTop: 6 }}>
              Régénérer
            </button>
          </div>
        </div>
      )}

      {/* Generating */}
      {generating && (
        <div style={{ textAlign: 'center', padding: '16px 0' }}>
          <div style={{ fontFamily: 'var(--font-great-vibes)', fontSize: 18, color: GOLD }}>Création du logo…</div>
        </div>
      )}

      {/* Candidates */}
      {candidates.length > 0 && !generating && (
        <div>
          <p style={{ fontSize: 11, fontWeight: 600, color: '#3a3330', marginBottom: 8, textAlign: 'center' }}>Choisissez votre logo</p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 6 }}>
            {candidates.map((url, idx) => (
              <button key={idx} type="button" onClick={() => selectImage(url)} disabled={saving !== null} style={{
                ...BTN, padding: 4, borderRadius: 8, border: `2px solid ${saving === url ? accentColor : '#e8e0d8'}`,
                background: 'white', opacity: saving && saving !== url ? 0.4 : 1,
              }}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={url} alt={`Option ${idx + 1}`} style={{ width: '100%', aspectRatio: '1/1', objectFit: 'contain', mixBlendMode: 'multiply' }} />
              </button>
            ))}
          </div>
          <button type="button" onClick={() => generate()} style={{ ...BTN, display: 'block', margin: '8px auto 0', background: 'none', border: 'none', color: '#9a928a', fontSize: 10, textDecoration: 'underline' }}>
            Régénérer
          </button>
        </div>
      )}

      {/* Initial waiting */}
      {!savedUrl && candidates.length === 0 && !generating && (
        <div style={{ textAlign: 'center', padding: '8px 0' }}>
          <div style={{ fontSize: 11, color: '#9a928a', fontStyle: 'italic' }}>En attente de génération…</div>
        </div>
      )}

      {error && <p style={{ color: '#dc2626', fontSize: 11, textAlign: 'center', marginTop: 6 }}>{error}</p>}
    </div>
  )
}
