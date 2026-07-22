'use client'

import { useState } from 'react'
import { HARMONIZED_PALETTES, type HarmonizedPalette } from '@/lib/refonte/palettes'

/* ── Types ─────────────────────────────────────────────────── */

export interface DesignData {
  paletteId: string
  logoUrl: string
  musicUrl: string
  musicName: string
}

export const EMPTY_DESIGN: DesignData = {
  paletteId: 'ivoire-dore',
  logoUrl: '',
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

/* ── Upload de logo ───────────────────────────────────────── */

function LogoUploader({ logoUrl, onChange }: { logoUrl: string; onChange: (url: string) => void }) {
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState('')

  const upload = async (file: File) => {
    setUploading(true)
    setError('')
    try {
      const fd = new FormData()
      fd.append('file', file)
      const res = await fetch('/api/upload', { method: 'POST', body: fd })
      const json = await res.json()
      if (json.url) onChange(json.url)
      else setError('Erreur lors du téléchargement')
    } catch {
      setError('Erreur réseau')
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
          <div style={{ fontSize: 24, marginBottom: 6 }}>{uploading ? '⏳' : '🖼'}</div>
          <p style={{ fontSize: 13, color: TEXT, margin: 0 }}>{uploading ? 'Téléchargement...' : 'Cliquez pour importer votre logo ou monogramme'}</p>
          <p style={{ fontSize: 11, color: '#9ca3af', marginTop: 4 }}>PNG, JPG — fond transparent recommandé</p>
        </div>
        <input type="file" accept="image/*" disabled={uploading} onChange={e => { const f = e.target.files?.[0]; if (f) upload(f); e.target.value = '' }} style={{ display: 'none' }} />
      </label>
      {error && <p style={{ fontSize: 12, color: '#d45050', marginTop: 6 }}>{error}</p>}
    </div>
  )
}

/* ── Upload de musique ────────────────────────────────────── */

function MusicUploader({ musicUrl, musicName, onChange }: { musicUrl: string; musicName: string; onChange: (url: string, name: string) => void }) {
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState('')

  const upload = async (file: File) => {
    setUploading(true)
    setError('')
    try {
      const fd = new FormData()
      fd.append('file', file)
      const res = await fetch('/api/upload', { method: 'POST', body: fd })
      const json = await res.json()
      if (json.url) onChange(json.url, file.name)
      else setError('Erreur lors du téléchargement')
    } catch {
      setError('Erreur réseau')
    } finally {
      setUploading(false)
    }
  }

  if (musicUrl) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 14px', border: `1px solid ${GOLD}44`, borderRadius: 10, background: '#faf5ea' }}>
        <span style={{ fontSize: 18 }}>🎵</span>
        <span style={{ flex: 1, fontSize: 12, color: TEXT, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{musicName || 'Musique importée'}</span>
        <button type="button" onClick={() => onChange('', '')} style={{ background: 'none', border: 'none', color: '#d45050', fontSize: 13, fontFamily: 'var(--font-cormorant-garamond)', cursor: 'pointer' }}>
          Supprimer
        </button>
      </div>
    )
  }

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
        <p style={{ fontSize: 11, color: '#9ca3af', margin: 0, flex: 1 }}>
          Importez un fichier MP3 pour ajouter une musique de fond à votre faire-part
        </p>
        <a href="https://yt2mp3.gs" target="_blank" rel="noopener noreferrer" style={{
          display: 'inline-flex', alignItems: 'center', gap: 5,
          padding: '7px 14px', borderRadius: 9999,
          background: `linear-gradient(135deg, ${GOLD}, #e8c96a)`,
          color: 'white', fontSize: 12, fontWeight: 600,
          textDecoration: 'none', whiteSpace: 'nowrap',
          boxShadow: `0 2px 10px ${GOLD}44`,
          fontFamily: 'var(--font-playfair-display)',
        }}>
          🎵 YouTube → MP3
        </a>
      </div>
      <label style={{ display: 'block', cursor: uploading ? 'wait' : 'pointer' }}>
        <div style={{ border: `2px dashed ${GOLD}66`, borderRadius: 10, padding: 20, textAlign: 'center', background: uploading ? '#faf5ea' : 'white' }}>
          <div style={{ fontSize: 24, marginBottom: 6 }}>{uploading ? '⏳' : '🎵'}</div>
          <p style={{ fontSize: 13, color: TEXT, margin: 0 }}>{uploading ? 'Téléchargement...' : 'Cliquez pour importer votre musique'}</p>
          <p style={{ fontSize: 11, color: '#9ca3af', marginTop: 4 }}>MP3, M4A, WAV</p>
        </div>
        <input type="file" accept="audio/mp3,audio/mpeg,audio/*" disabled={uploading} onChange={e => { const f = e.target.files?.[0]; if (f) upload(f); e.target.value = '' }} style={{ display: 'none' }} />
      </label>
      {error && <p style={{ fontSize: 12, color: '#d45050', marginTop: 6 }}>{error}</p>}
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
      </div>

      {/* ── Musique ── */}
      <div style={S.section}>
        <div style={S.sectionTitle}>Musique de fond (optionnel)</div>
        <MusicUploader
          musicUrl={data.musicUrl}
          musicName={data.musicName}
          onChange={(url, name) => onChange({ ...data, musicUrl: url, musicName: name })}
        />
      </div>
    </div>
  )
}
