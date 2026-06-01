'use client'

import React, { useState, useEffect, useRef } from 'react'

const GOLD = '#C9A84C'
const BTN: React.CSSProperties = { touchAction: 'manipulation', WebkitTapHighlightColor: 'transparent', cursor: 'pointer' }

const STYLES = [
  { id: 'art-nouveau', label: 'Art Nouveau', icon: '✒️' },
  { id: 'laurel', label: 'Laurier', icon: '🌿' },
  { id: 'botanical', label: 'Botanique', icon: '🌸' },
  { id: 'floral-circle', label: 'Couronne', icon: '💐' },
  { id: 'minimal', label: 'Minimal', icon: '◆' },
  { id: 'oriental', label: 'Oriental', icon: '✦' },
]

// Prévisualisation du monogramme : cadre IA + initiales CSS
function MonogramPreview({ frameUrl, i1, i2, size, accentColor }: { frameUrl: string; i1: string; i2: string; size: number; accentColor: string }) {
  return (
    <div style={{ position: 'relative', width: size, height: size, display: 'inline-block' }}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={frameUrl} alt="" style={{ width: '100%', height: '100%', objectFit: 'contain', mixBlendMode: 'multiply' }} />
      {/* Initiales superposées au centre — toujours lisibles */}
      <div style={{
        position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}>
        <span style={{
          fontFamily: 'var(--font-playfair-display)', fontSize: size * 0.28, fontWeight: 700,
          color: accentColor, letterSpacing: -1, lineHeight: 1,
        }}>
          {i1}<span style={{ fontSize: size * 0.18, opacity: 0.4, margin: '0 1px' }}>&</span>{i2}
        </span>
      </div>
    </div>
  )
}

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
  const [selectedStyle, setSelectedStyle] = useState('laurel')
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

  const selectFrame = async (frameUrl: string) => {
    setSaving(frameUrl)
    try {
      // On sauvegarde l'URL du cadre — les initiales seront superposées en CSS
      const res = await fetch('/api/save-watercolor', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ imageUrl: frameUrl }),
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

      {/* Saved state — cadre + initiales */}
      {savedUrl && candidates.length === 0 && !generating && (
        <div style={{ textAlign: 'center' }}>
          <MonogramPreview frameUrl={savedUrl} i1={i1} i2={i2} size={110} accentColor={accentColor} />
          <div>
            <button type="button" onClick={() => generate()} style={{ ...BTN, background: 'none', border: 'none', color: '#9a928a', fontSize: 10, textDecoration: 'underline', marginTop: 6 }}>
              Régénérer le cadre
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

      {/* Candidates — cadre + initiales superposées */}
      {candidates.length > 0 && !generating && (
        <div>
          <p style={{ fontSize: 11, fontWeight: 600, color: '#3a3330', marginBottom: 8, textAlign: 'center' }}>Choisissez votre cadre</p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 8 }}>
            {candidates.map((url, idx) => (
              <button key={idx} type="button" onClick={() => selectFrame(url)} disabled={saving !== null} style={{
                ...BTN, padding: 8, borderRadius: 10, border: `2px solid ${saving === url ? accentColor : '#e8e0d8'}`,
                background: 'white', opacity: saving && saving !== url ? 0.4 : 1,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                <MonogramPreview frameUrl={url} i1={i1} i2={i2} size={120} accentColor={accentColor} />
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

      {error && (
        <div style={{ textAlign: 'center', marginTop: 8 }}>
          <p style={{ color: '#dc2626', fontSize: 11, marginBottom: 6 }}>{error}</p>
          <button type="button" onClick={() => generate()} style={{ ...BTN, padding: '6px 16px', borderRadius: 9999, border: '1px solid #C9A84C', background: 'white', color: '#C9A84C', fontSize: 11, fontWeight: 600 }}>
            Réessayer
          </button>
        </div>
      )}
    </div>
  )
}

// Export pour réutiliser dans InvitationCover et le rendu
export { MonogramPreview }
