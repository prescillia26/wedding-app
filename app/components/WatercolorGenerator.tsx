'use client'

import React, { useState } from 'react'
import type { Ambiance, Palette } from '@/lib/watercolorPrompt'

const AMBIANCES: { id: Ambiance; label: string; emoji: string }[] = [
  { id: 'plage', label: 'Plage', emoji: '🏖️' },
  { id: 'chateau', label: 'Château', emoji: '🏰' },
  { id: 'jardin', label: 'Jardin', emoji: '🌿' },
  { id: 'salle', label: 'Salle de réception', emoji: '✨' },
  { id: 'synagogue', label: 'Synagogue', emoji: '🕍' },
  { id: 'israel', label: 'Israël', emoji: '🇮🇱' },
  { id: 'universel', label: 'Universel', emoji: '💐' },
]

const PALETTES: { id: Palette; label: string; colors: string[] }[] = [
  { id: 'lavande', label: 'Lavande', colors: ['#b39ddb', '#ce93d8', '#f3e5f5', '#c8e6c9'] },
  { id: 'rose', label: 'Rose poudré', colors: ['#f48fb1', '#f8bbd0', '#fce4ec', '#c8e6c9'] },
  { id: 'sauge', label: 'Vert sauge', colors: ['#a5d6a7', '#c5e1a5', '#f5f5dc', '#d7ccc8'] },
  { id: 'bleu_nuit', label: 'Bleu nuit', colors: ['#1a237e', '#7986cb', '#c0c0c0', '#fffde7'] },
]

const GOLD = '#C9A84C'

const BTN: React.CSSProperties = {
  touchAction: 'manipulation',
  WebkitTapHighlightColor: 'transparent',
  cursor: 'pointer',
}

export default function WatercolorGenerator({ onSelect }: { onSelect: (url: string) => void }) {
  const [ambiance, setAmbiance] = useState<Ambiance>('universel')
  const [palette, setPalette] = useState<Palette>('rose')
  const [freeText, setFreeText] = useState('')
  const [images, setImages] = useState<string[]>([])
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState<number | null>(null)
  const [error, setError] = useState('')

  const generate = async () => {
    setLoading(true)
    setError('')
    setImages([])
    try {
      const res = await fetch('/api/generate-watercolor', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ambiance, palette, freeText: freeText.trim() || undefined }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Erreur')
      setImages(data.images)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur lors de la génération')
    } finally {
      setLoading(false)
    }
  }

  const selectImage = async (idx: number) => {
    setSaving(idx)
    setError('')
    try {
      const res = await fetch('/api/save-watercolor', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ imageUrl: images[idx] }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Erreur')
      onSelect(data.url)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur lors de la sauvegarde')
    } finally {
      setSaving(null)
    }
  }

  return (
    <div>
      {/* Ambiance */}
      <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: '#3a3330', marginBottom: 8 }}>
        Ambiance du lieu
      </label>
      <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 16 }}>
        {AMBIANCES.map(a => {
          const sel = ambiance === a.id
          return (
            <button key={a.id} type="button" onClick={() => setAmbiance(a.id)} style={{
              ...BTN, padding: '8px 14px', borderRadius: 9999, fontSize: 12, fontWeight: sel ? 700 : 400,
              border: `1.5px solid ${sel ? GOLD : '#e0d5c8'}`,
              background: sel ? `${GOLD}15` : 'white',
              color: sel ? GOLD : '#3a3330',
            }}>
              {a.emoji} {a.label}
            </button>
          )
        })}
      </div>

      {/* Palette */}
      <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: '#3a3330', marginBottom: 8 }}>
        Palette de couleurs
      </label>
      <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginBottom: 16 }}>
        {PALETTES.map(p => {
          const sel = palette === p.id
          return (
            <button key={p.id} type="button" onClick={() => setPalette(p.id)} style={{
              ...BTN, padding: '10px 14px', borderRadius: 12, textAlign: 'center',
              border: `2px solid ${sel ? GOLD : '#e0d5c8'}`,
              background: sel ? `${GOLD}10` : 'white',
              display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6, minWidth: 80,
            }}>
              <div style={{ display: 'flex', gap: 3 }}>
                {p.colors.map((c, i) => (
                  <div key={i} style={{ width: 14, height: 14, borderRadius: '50%', background: c, border: '1px solid #e0d5c8' }} />
                ))}
              </div>
              <span style={{ fontSize: 10, fontWeight: sel ? 700 : 400, color: sel ? GOLD : '#6a5a48' }}>{p.label}</span>
            </button>
          )
        })}
      </div>

      {/* Texte libre */}
      <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: '#3a3330', marginBottom: 4 }}>
        Nom ou type de lieu (optionnel)
      </label>
      <input
        value={freeText}
        onChange={e => setFreeText(e.target.value)}
        placeholder="Ex: Domaine de Montceau, Plage de Tel-Aviv..."
        maxLength={200}
        style={{ width: '100%', padding: '10px 12px', border: '1px solid #e0d5c8', borderRadius: 8, fontSize: 14, color: '#3a3330', outline: 'none', boxSizing: 'border-box', marginBottom: 20 }}
      />

      {/* Bouton générer */}
      <button
        type="button"
        onClick={generate}
        disabled={loading}
        style={{
          ...BTN, width: '100%', padding: '14px', borderRadius: 9999, border: 'none',
          background: loading ? '#e0d5c8' : `linear-gradient(135deg, ${GOLD}, #e8c96a)`,
          color: 'white', fontSize: 14, fontWeight: 700, letterSpacing: '0.05em',
          opacity: loading ? 0.7 : 1,
        }}
      >
        {loading ? (
          <span>Génération en cours... (30-60 secondes)</span>
        ) : (
          <span>🎨 Générer mes aquarelles</span>
        )}
      </button>

      {/* Erreur */}
      {error && (
        <p style={{ color: '#dc2626', fontSize: 13, textAlign: 'center', marginTop: 12 }}>{error}</p>
      )}

      {/* Loading animation */}
      {loading && (
        <div style={{ textAlign: 'center', padding: '32px 0' }}>
          <div style={{ fontFamily: 'var(--font-great-vibes)', fontSize: 28, color: GOLD, marginBottom: 8 }}>
            L&apos;artiste peint...
          </div>
          <p style={{ fontFamily: 'var(--font-cormorant-garamond)', fontStyle: 'italic', fontSize: 14, color: '#9a928a' }}>
            4 aquarelles uniques sont en cours de création
          </p>
        </div>
      )}

      {/* Grille de résultats */}
      {images.length > 0 && (
        <div style={{ marginTop: 20 }}>
          <p style={{ fontSize: 13, fontWeight: 700, color: '#3a3330', marginBottom: 12, textAlign: 'center' }}>
            Choisissez votre aquarelle préférée
          </p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 12 }}>
            {images.map((url, i) => (
              <button
                key={i}
                type="button"
                onClick={() => selectImage(i)}
                disabled={saving !== null}
                style={{
                  ...BTN, padding: 0, border: `3px solid ${saving === i ? GOLD : 'transparent'}`,
                  borderRadius: 12, overflow: 'hidden', position: 'relative',
                  opacity: saving !== null && saving !== i ? 0.5 : 1,
                  transition: 'all 0.2s ease',
                }}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={url}
                  alt={`Aquarelle option ${i + 1}`}
                  style={{ width: '100%', aspectRatio: '2/3', objectFit: 'cover', display: 'block' }}
                />
                {saving === i && (
                  <div style={{ position: 'absolute', inset: 0, background: 'rgba(255,255,255,0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <span style={{ fontFamily: 'var(--font-cormorant-garamond)', fontSize: 14, color: GOLD, fontWeight: 700 }}>Enregistrement...</span>
                  </div>
                )}
                <div style={{ position: 'absolute', bottom: 8, left: '50%', transform: 'translateX(-50%)', background: 'rgba(255,255,255,0.9)', borderRadius: 9999, padding: '4px 14px', fontSize: 11, fontWeight: 600, color: GOLD }}>
                  Choisir
                </div>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
