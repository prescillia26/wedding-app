'use client'

import { useState } from 'react'
import type { Evenement } from './StepEvenements'
import { byCategory, type Visual } from '@/lib/visuals'

/* ── Types ─────────────────────────────────────────────────── */

export interface ImageEntry {
  url: string
  isCustom: boolean
}

export interface ImagesData {
  [eventId: string]: ImageEntry
}

/* ── Galerie par type d'événement ─────────────────────────── */

function getImagesForType(type: string): Visual[] {
  const t = type.toLowerCase()
  if (t.includes('mairie')) return byCategory('mairie')
  if (t.includes('houppa') || t.includes('religieuse')) return byCategory('houppa')
  if (t.includes('shabbat')) return byCategory('shabbat')
  if (t.includes('henn')) return byCategory('beach')
  return byCategory('couples')
}

function getDefaultImage(type: string): ImageEntry {
  const images = getImagesForType(type)
  return images.length > 0
    ? { url: images[0].url, isCustom: false }
    : { url: '', isCustom: false }
}

/* ── Styles ────────────────────────────────────────────────── */

const GOLD = '#C9A84C'
const DARK = '#2a2520'
const TEXT = '#3a3330'

const MAX_IMAGE_SIZE = 2 * 1024 * 1024 // 2 MB

/* ── Composant pour un événement ──────────────────────────── */

function EventImagePicker({ event, entry, onChange }: {
  event: Evenement
  entry: ImageEntry
  onChange: (e: ImageEntry) => void
}) {
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState('')
  const gallery = getImagesForType(event.type)
  const eventName = event.type === 'Autre' && event.customName ? event.customName : event.type

  const handleImport = (file: File) => {
    setError('')
    if (file.size > MAX_IMAGE_SIZE) {
      setError(`L'image est trop lourde (${(file.size / 1024 / 1024).toFixed(1)} Mo). Maximum : 2 Mo.`)
      return
    }
    setUploading(true)
    const reader = new FileReader()
    reader.onload = () => {
      onChange({ url: reader.result as string, isCustom: true })
      setUploading(false)
    }
    reader.onerror = () => { setUploading(false); setError('Erreur lors de la lecture du fichier.') }
    reader.readAsDataURL(file)
  }

  return (
    <div style={{ marginBottom: 24, padding: 20, background: 'white', borderRadius: 14, border: `1px solid ${GOLD}33`, boxShadow: '0 2px 12px rgba(0,0,0,0.04)' }}>
      <div style={{ fontFamily: 'var(--font-playfair-display)', fontSize: 16, color: DARK, marginBottom: 4, fontWeight: 600 }}>
        {eventName}
      </div>
      <p style={{ fontFamily: 'var(--font-cormorant-garamond)', fontSize: 13, color: '#9ca3af', fontStyle: 'italic', margin: '0 0 14px' }}>
        Cette image apparaîtra sous le titre de l&apos;événement
      </p>

      {/* Image custom sélectionnée */}
      {entry.isCustom && entry.url && (
        <div style={{ marginBottom: 14, textAlign: 'center' }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={entry.url}
            alt={eventName}
            style={{ maxWidth: '100%', maxHeight: 160, objectFit: 'contain', borderRadius: 10, border: `1px solid ${GOLD}33` }}
          />
          <div style={{ marginTop: 6 }}>
            <button type="button" onClick={() => onChange(getDefaultImage(event.type))} style={{ background: 'none', border: 'none', color: '#d45050', fontSize: 12, fontFamily: 'var(--font-cormorant-garamond)', cursor: 'pointer' }}>
              Supprimer et revenir à la galerie
            </button>
          </div>
        </div>
      )}

      {/* Galerie */}
      {!entry.isCustom && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 10, marginBottom: 14 }}>
          {gallery.map(img => (
            <button
              key={img.id}
              type="button"
              onClick={() => onChange({ url: img.url, isCustom: false })}
              style={{
                padding: 4,
                border: entry.url === img.url ? `2.5px solid ${GOLD}` : '1.5px solid #e0d8cc',
                borderRadius: 10,
                background: 'white',
                cursor: 'pointer',
                boxShadow: entry.url === img.url ? `0 0 0 3px ${GOLD}33` : 'none',
                transition: 'all 0.15s ease',
              }}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={img.url} alt={img.label} style={{ width: '100%', height: 100, objectFit: 'contain', borderRadius: 6 }} />
            </button>
          ))}
        </div>
      )}

      {/* Erreur upload */}
      {error && (
        <p style={{ color: '#d45050', fontSize: 13, fontFamily: 'var(--font-cormorant-garamond)', margin: '0 0 8px', textAlign: 'center' }}>
          {error}
        </p>
      )}

      {/* Import custom */}
      {!entry.isCustom && (
        <label style={{ display: 'block', cursor: uploading ? 'wait' : 'pointer' }}>
          <div style={{
            border: `1.5px dashed ${GOLD}55`,
            borderRadius: 8,
            padding: '10px 14px',
            textAlign: 'center',
            background: uploading ? '#faf5ea' : '#faf8f4',
          }}>
            <span style={{ fontSize: 13, color: TEXT, fontFamily: 'var(--font-cormorant-garamond)' }}>
              {uploading ? 'Importation...' : 'Utiliser ma propre image'}
            </span>
          </div>
          <input type="file" accept="image/png,image/jpeg,image/webp" disabled={uploading} onChange={e => { const f = e.target.files?.[0]; if (f) handleImport(f); e.target.value = '' }} style={{ display: 'none' }} />
        </label>
      )}
    </div>
  )
}

/* ── Composant principal ──────────────────────────────────── */

export default function StepImages({ events, data, onChange }: {
  events: Evenement[]
  data: ImagesData
  onChange: (d: ImagesData) => void
}) {
  if (events.length === 0) {
    return (
      <div style={{ textAlign: 'center', padding: '60px 20px' }}>
        <p style={{ fontFamily: 'var(--font-cormorant-garamond)', fontSize: 17, color: TEXT, fontStyle: 'italic' }}>
          Ajoutez d&apos;abord vos événements à l&apos;étape 2 pour pouvoir choisir des images
        </p>
      </div>
    )
  }

  return (
    <div>
      <h2 style={{ fontFamily: 'var(--font-great-vibes)', fontSize: 36, color: GOLD, textAlign: 'center', marginBottom: 8 }}>
        Les images
      </h2>
      <p style={{ fontFamily: 'var(--font-cormorant-garamond)', fontSize: 15, color: TEXT, textAlign: 'center', marginBottom: 32, fontStyle: 'italic' }}>
        Choisissez une image pour chaque événement — elle apparaîtra sous le titre
      </p>

      {events.map(event => {
        const entry = data[event.id] || getDefaultImage(event.type)
        return (
          <EventImagePicker
            key={event.id}
            event={event}
            entry={entry}
            onChange={e => onChange({ ...data, [event.id]: e })}
          />
        )
      })}
    </div>
  )
}
