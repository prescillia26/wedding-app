'use client'

import React, { useState, useEffect, useRef } from 'react'

const GOLD = '#C9A84C'
const BTN: React.CSSProperties = { touchAction: 'manipulation', WebkitTapHighlightColor: 'transparent', cursor: 'pointer' }

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
  const autoGenRef = useRef(false)

  const i1 = (initial1 || 'A').charAt(0).toUpperCase()
  const i2 = (initial2 || 'B').charAt(0).toUpperCase()

  const generate = async () => {
    setGenerating(true)
    setError('')
    setCandidates([])
    try {
      const res = await fetch('/api/generate-monogram', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ initial1: i1, initial2: i2 }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Erreur')
      setCandidates(data.images)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur')
    } finally {
      setGenerating(false)
    }
  }

  // Auto-generate on mount if no saved monogram
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
    <div style={{ background: '#fdf8f0', borderRadius: 12, padding: 16, border: '1px solid #e8e0d8' }}>
      <div style={{ textAlign: 'center', marginBottom: 12 }}>
        <div style={{ fontSize: 11, color: accentColor, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em' }}>
          Monogramme {i1} & {i2}
        </div>
      </div>

      {/* Saved state */}
      {savedUrl && candidates.length === 0 && !generating && (
        <div style={{ textAlign: 'center' }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={savedUrl} alt={`${i1}&${i2}`} style={{ width: 100, height: 100, objectFit: 'contain', mixBlendMode: 'multiply', display: 'inline-block' }} />
          <div>
            <button type="button" onClick={generate} style={{ ...BTN, background: 'none', border: 'none', color: '#9a928a', fontSize: 10, textDecoration: 'underline', marginTop: 6 }}>
              Régénérer
            </button>
          </div>
        </div>
      )}

      {/* Generating */}
      {generating && (
        <div style={{ textAlign: 'center', padding: '16px 0' }}>
          <div style={{ fontFamily: 'var(--font-great-vibes)', fontSize: 18, color: GOLD }}>Création du monogramme…</div>
        </div>
      )}

      {/* Candidates */}
      {candidates.length > 0 && !generating && (
        <div>
          <p style={{ fontSize: 11, fontWeight: 600, color: '#3a3330', marginBottom: 8, textAlign: 'center' }}>Choisissez votre monogramme</p>
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
          <button type="button" onClick={generate} style={{ ...BTN, display: 'block', margin: '8px auto 0', background: 'none', border: 'none', color: '#9a928a', fontSize: 10, textDecoration: 'underline' }}>
            Régénérer
          </button>
        </div>
      )}

      {/* Initial state */}
      {!savedUrl && candidates.length === 0 && !generating && (
        <div style={{ textAlign: 'center', padding: '8px 0' }}>
          <div style={{ fontSize: 11, color: '#9a928a', fontStyle: 'italic' }}>En attente de génération…</div>
        </div>
      )}

      {error && <p style={{ color: '#dc2626', fontSize: 11, textAlign: 'center', marginTop: 6 }}>{error}</p>}
    </div>
  )
}
