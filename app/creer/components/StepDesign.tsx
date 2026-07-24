'use client'

import { useState } from 'react'
import { HARMONIZED_PALETTES, type HarmonizedPalette } from '@/lib/refonte/palettes'

/* ── Types ─────────────────────────────────────────────────── */

export interface DesignData {
  paletteId: string
  logoUrl: string
  logoSize: number
  musicUrl: string
  musicName: string
}

export const EMPTY_DESIGN: DesignData = {
  paletteId: 'ivoire-dore',
  logoUrl: '',
  logoSize: 160,
  musicUrl: '',
  musicName: '',
}

/* ── Styles ────────────────────────────────────────────────── */

const GOLD = '#C9A84C'
const DARK = '#2a2520'
const TEXT = '#3a3330'

const S = {
  label: { display: 'block', fontFamily: 'var(--font-cormorant-garamond)', fontSize: 14, color: TEXT, marginBottom: 4, fontWeight: 600 } as React.CSSProperties,
  section: { marginBottom: 32 } as React.CSSProperties,
  sectionTitle: { fontFamily: 'var(--font-playfair-display)', fontSize: 16, color: DARK, marginBottom: 14, fontWeight: 600 } as React.CSSProperties,
}

/* ── Mini-preview d'une palette ───────────────────────────── */

function PaletteCard({ palette, selected, onSelect }: { palette: HarmonizedPalette; selected: boolean; onSelect: () => void }) {
  const isDark = isColorDark(palette.fondColor)

  return (
    <button
      type="button"
      onClick={onSelect}
      style={{
        display: 'block',
        width: '100%',
        border: selected ? `2.5px solid ${GOLD}` : '1.5px solid #e0d8cc',
        borderRadius: 14,
        overflow: 'hidden',
        cursor: 'pointer',
        background: palette.fondColor,
        boxShadow: selected ? `0 0 0 3px ${GOLD}33, 0 6px 24px rgba(0,0,0,0.1)` : '0 2px 8px rgba(0,0,0,0.06)',
        transition: 'all 0.2s ease',
        textAlign: 'center' as const,
        padding: 0,
        transform: selected ? 'scale(1.02)' : 'none',
      }}
    >
      {/* Mini-aperçu du faire-part */}
      <div style={{ padding: '20px 16px 16px' }}>
        {/* Couleurs de la palette */}
        <div style={{ display: 'flex', justifyContent: 'center', gap: 6, marginBottom: 12 }}>
          {[palette.fondColor, palette.prenomsColor, palette.titresColor, palette.accentColor, palette.texteColor].map((c, i) => (
            <div key={i} style={{
              width: 18, height: 18, borderRadius: '50%', background: c,
              border: `1px solid ${isDark ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.1)'}`,
            }} />
          ))}
        </div>

        {/* Prénoms */}
        <div style={{ fontFamily: `'${palette.prenomsFont}', cursive`, fontSize: 22, color: palette.prenomsColor, lineHeight: 1.2 }}>
          Sarah
        </div>
        <div style={{ fontFamily: 'var(--font-cormorant-garamond)', fontSize: 14, color: palette.accentColor, margin: '2px 0' }}>
          &
        </div>
        <div style={{ fontFamily: `'${palette.prenomsFont}', cursive`, fontSize: 22, color: palette.prenomsColor, lineHeight: 1.2 }}>
          David
        </div>

        {/* Séparateur */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, justifyContent: 'center', margin: '8px 0' }}>
          <div style={{ width: 20, height: '0.5px', background: palette.accentColor, opacity: 0.5 }} />
          <span style={{ color: palette.accentColor, fontSize: 7 }}>✦</span>
          <div style={{ width: 20, height: '0.5px', background: palette.accentColor, opacity: 0.5 }} />
        </div>

        {/* Titre */}
        <div style={{ fontFamily: `'${palette.titresFont}', serif`, fontSize: 10, color: palette.titresColor, letterSpacing: 2, textTransform: 'uppercase', fontWeight: 600, marginBottom: 4 }}>
          La Houppa
        </div>

        {/* Texte */}
        <div style={{ fontFamily: `'${palette.texteFont}', serif`, fontSize: 11, color: palette.texteColor, lineHeight: 1.5 }}>
          15 Juin 2026 · Paris
        </div>
      </div>

      {/* Label */}
      <div style={{
        padding: '8px 12px',
        background: selected ? GOLD : (isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.03)'),
        borderTop: `1px solid ${isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.06)'}`,
      }}>
        <div style={{
          fontFamily: 'var(--font-playfair-display)',
          fontSize: 12,
          color: selected ? 'white' : (isDark ? 'rgba(255,255,255,0.8)' : TEXT),
          fontWeight: 600,
        }}>
          {palette.label}
        </div>
        <div style={{
          fontFamily: 'var(--font-cormorant-garamond)',
          fontSize: 11,
          color: selected ? 'rgba(255,255,255,0.8)' : (isDark ? 'rgba(255,255,255,0.5)' : '#9ca3af'),
          fontStyle: 'italic',
        }}>
          {palette.description}
        </div>
      </div>
    </button>
  )
}

function isColorDark(hex: string): boolean {
  const r = parseInt(hex.slice(1, 3), 16)
  const g = parseInt(hex.slice(3, 5), 16)
  const b = parseInt(hex.slice(5, 7), 16)
  return (r * 299 + g * 587 + b * 114) / 1000 < 128
}

/* ── Filtre CSS pour coloriser le logo ─────────────────────── */

export function hexToFilter(hex: string): string {
  const r = parseInt(hex.slice(1, 3), 16) / 255
  const g = parseInt(hex.slice(3, 5), 16) / 255
  const b = parseInt(hex.slice(5, 7), 16) / 255
  const luminance = 0.299 * r + 0.587 * g + 0.114 * b
  const saturation = Math.max(r, g, b) - Math.min(r, g, b)
  let hue = 0
  if (saturation > 0) {
    if (r === Math.max(r, g, b)) hue = ((g - b) / saturation) * 60
    else if (g === Math.max(r, g, b)) hue = (2 + (b - r) / saturation) * 60
    else hue = (4 + (r - g) / saturation) * 60
    if (hue < 0) hue += 360
  }
  return `invert(1) sepia(1) saturate(${Math.round(saturation * 500)}%) hue-rotate(${Math.round(hue - 45)}deg) brightness(${Math.round(luminance * 120)}%)`
}

/* ── Suppression de fond blanc ─────────────────────────────── */

function removeBackground(file: File): Promise<string> {
  return new Promise((resolve) => {
    const img = new Image()
    const url = URL.createObjectURL(file)
    img.onload = () => {
      const canvas = document.createElement('canvas')
      canvas.width = img.width
      canvas.height = img.height
      const ctx = canvas.getContext('2d')!
      ctx.drawImage(img, 0, 0)
      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height)
      const d = imageData.data
      for (let i = 0; i < d.length; i += 4) {
        if (d[i] > 240 && d[i + 1] > 240 && d[i + 2] > 240) {
          d[i + 3] = 0
        }
      }
      ctx.putImageData(imageData, 0, 0)
      resolve(canvas.toDataURL('image/png'))
      URL.revokeObjectURL(url)
    }
    img.src = url
  })
}

/* ── Upload de logo ───────────────────────────────────────── */

const MAX_LOGO_SIZE = 2 * 1024 * 1024 // 2 Mo

function LogoUploader({ logoUrl, onChange }: { logoUrl: string; onChange: (url: string) => void }) {
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState('')

  const handleFile = async (file: File) => {
    setError('')
    if (file.size > MAX_LOGO_SIZE) {
      setError(`Le logo est trop lourd (${(file.size / 1024 / 1024).toFixed(1)} Mo). Maximum : 2 Mo.`)
      return
    }
    setUploading(true)
    try {
      const result = await removeBackground(file)
      onChange(result)
    } catch {
      setError('Erreur lors du traitement du logo.')
    } finally {
      setUploading(false)
    }
  }

  if (logoUrl) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={logoUrl} alt="Logo" style={{ width: 80, height: 80, objectFit: 'contain', borderRadius: 8, border: `1px solid ${GOLD}33` }} />
        <button type="button" onClick={() => onChange('')} style={{ background: 'none', border: 'none', color: '#d45050', fontSize: 13, fontFamily: 'var(--font-cormorant-garamond)', cursor: 'pointer' }}>
          Supprimer
        </button>
      </div>
    )
  }

  return (
    <div>
      <label style={{ display: 'block', cursor: uploading ? 'wait' : 'pointer' }}>
        <div style={{ border: `2px dashed ${GOLD}66`, borderRadius: 10, padding: 20, textAlign: 'center', background: uploading ? '#faf5ea' : 'white' }}>
          <p style={{ fontSize: 13, color: TEXT, margin: 0 }}>{uploading ? 'Suppression du fond...' : 'Cliquez pour importer votre logo ou monogramme'}</p>
          <p style={{ fontSize: 11, color: '#9ca3af', marginTop: 4 }}>PNG, JPG — le fond blanc sera automatiquement supprimé</p>
        </div>
        <input type="file" accept="image/*" disabled={uploading} onChange={e => { const f = e.target.files?.[0]; if (f) handleFile(f); e.target.value = '' }} style={{ display: 'none' }} />
      </label>
      {error && <p style={{ fontSize: 12, color: '#d45050', marginTop: 6 }}>{error}</p>}
    </div>
  )
}

/* ── Upload de musique ────────────────────────────────────── */

function MusicInput({ musicUrl, onChange }: { musicUrl: string; onChange: (url: string) => void }) {
  return (
    <div>
      <p style={{ fontSize: 13, color: '#9ca3af', margin: '0 0 10px', fontStyle: 'italic' }}>
        Collez un lien YouTube pour ajouter une musique de fond à votre faire-part
      </p>
      <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
        <input
          type="url"
          value={musicUrl}
          onChange={e => onChange(e.target.value)}
          placeholder="https://www.youtube.com/watch?v=..."
          style={{
            flex: 1, padding: '10px 14px', borderRadius: 10,
            border: `1.5px solid ${GOLD}44`, fontSize: 13,
            fontFamily: 'var(--font-cormorant-garamond)', color: TEXT,
            background: 'white', outline: 'none',
          }}
        />
        {musicUrl && (
          <button type="button" onClick={() => onChange('')} style={{
            background: 'none', border: 'none', color: '#d45050',
            fontSize: 13, fontFamily: 'var(--font-cormorant-garamond)', cursor: 'pointer',
          }}>
            Retirer
          </button>
        )}
      </div>
      <p style={{ fontSize: 11, color: '#9ca3af', marginTop: 6 }}>
        Formats acceptés : youtube.com/watch?v=… ou youtu.be/…
      </p>
    </div>
  )
}

/* ── Composant principal ──────────────────────────────────── */

export default function StepDesign({ data, onChange }: { data: DesignData; onChange: (d: DesignData) => void }) {
  return (
    <div>
      <h2 style={{ fontFamily: 'var(--font-great-vibes)', fontSize: 36, color: GOLD, textAlign: 'center', marginBottom: 8 }}>
        Le design
      </h2>
      <p style={{ fontFamily: 'var(--font-cormorant-garamond)', fontSize: 15, color: TEXT, textAlign: 'center', marginBottom: 32, fontStyle: 'italic' }}>
        Choisissez une palette de couleurs harmonisée et personnalisez votre faire-part
      </p>

      {/* ── Palettes ── */}
      <div style={S.section}>
        <div style={S.sectionTitle}>Palette de couleurs</div>
        <p style={{ fontFamily: 'var(--font-cormorant-garamond)', fontSize: 13, color: '#9ca3af', marginBottom: 16, fontStyle: 'italic' }}>
          Chaque palette définit automatiquement les couleurs et polices pour un rendu harmonieux
        </p>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 14 }}>
          {HARMONIZED_PALETTES.map(p => (
            <PaletteCard
              key={p.id}
              palette={p}
              selected={data.paletteId === p.id}
              onSelect={() => onChange({ ...data, paletteId: p.id })}
            />
          ))}
        </div>
      </div>

      {/* ── Logo / Monogramme ── */}
      <div style={S.section}>
        <div style={S.sectionTitle}>Logo ou monogramme (optionnel)</div>
        <LogoUploader logoUrl={data.logoUrl} onChange={url => onChange({ ...data, logoUrl: url })} />
        {data.logoUrl && (
          <div style={{ marginTop: 16 }}>
            <label style={{ ...S.label, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span>Taille du logo</span>
              <span style={{ fontWeight: 400, color: '#9ca3af' }}>{data.logoSize}px</span>
            </label>
            <input
              type="range"
              min={80}
              max={200}
              value={data.logoSize}
              onChange={e => onChange({ ...data, logoSize: Number(e.target.value) })}
              style={{ width: '100%', accentColor: GOLD }}
            />
            <div style={{ display: 'flex', justifyContent: 'space-between', fontFamily: 'var(--font-cormorant-garamond)', fontSize: 11, color: '#9ca3af' }}>
              <span>80px</span>
              <span>200px</span>
            </div>

            {/* Aperçu sur fond palette */}
            {(() => {
              const palette = HARMONIZED_PALETTES.find(p => p.id === data.paletteId) || HARMONIZED_PALETTES[0]
              const filter = hexToFilter(palette.accentColor)
              return (
                <div style={{ marginTop: 16 }}>
                  <div style={{ ...S.label, marginBottom: 8 }}>Aperçu sur votre faire-part</div>
                  <div style={{
                    background: palette.fondColor, borderRadius: 12,
                    padding: 24, textAlign: 'center',
                    border: `1px solid ${palette.accentColor}22`,
                  }}>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={data.logoUrl}
                      alt="Aperçu logo"
                      style={{
                        width: data.logoSize, height: data.logoSize,
                        objectFit: 'contain',
                        filter,
                      }}
                    />
                    <p style={{
                      fontFamily: `'${palette.prenomsFont}', cursive`,
                      fontSize: 11, color: palette.accentColor,
                      marginTop: 8, letterSpacing: 4, textTransform: 'uppercase',
                    }}>
                      MARIAGE
                    </p>
                  </div>
                </div>
              )
            })()}
          </div>
        )}
      </div>

      {/* ── Musique ── */}
      <div style={S.section}>
        <div style={S.sectionTitle}>Musique de fond (optionnel)</div>
        <MusicInput
          musicUrl={data.musicUrl}
          onChange={url => onChange({ ...data, musicUrl: url })}
        />
      </div>
    </div>
  )
}
