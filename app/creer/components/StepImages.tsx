'use client'

import { useState } from 'react'
import type { Evenement } from './StepEvenements'

/* ── Types ─────────────────────────────────────────────────── */

export interface ImagesData {
  /** Clé = event.id, valeur = URL de l'image (galerie ou importée en base64) */
  [eventId: string]: string
}

/* ── Galerie d'images proposées par type d'événement ──────── */

const GALLERY_IMAGES: Record<string, { url: string; label: string }[]> = {
  'Mairie': [
    { url: 'https://res.cloudinary.com/dau96mui2/image/upload/v1776765484/1_ruabdh.png', label: 'Floral 1' },
    { url: 'https://res.cloudinary.com/dau96mui2/image/upload/v1776765486/2_xh3erh.png', label: 'Floral 2' },
    { url: 'https://res.cloudinary.com/dau96mui2/image/upload/v1776765487/3_zdnq1l.png', label: 'Floral 3' },
    { url: 'https://res.cloudinary.com/dau96mui2/image/upload/v1776765490/4_szuz80.png', label: 'Floral 4' },
  ],
  'Cérémonie religieuse / Houppa': [
    { url: 'https://res.cloudinary.com/dau96mui2/image/upload/v1776765492/5_dgvzjn.png', label: 'Floral 5' },
    { url: 'https://res.cloudinary.com/dau96mui2/image/upload/v1776765509/6_bbgeun.png', label: 'Floral 6' },
    { url: 'https://res.cloudinary.com/dau96mui2/image/upload/v1776765511/7_h5mjjm.png', label: 'Floral 7' },
    { url: 'https://res.cloudinary.com/dau96mui2/image/upload/v1776765513/8_grn4zh.png', label: 'Floral 8' },
  ],
  'default': [
    { url: 'https://res.cloudinary.com/dau96mui2/image/upload/v1776765484/1_ruabdh.png', label: 'Floral 1' },
    { url: 'https://res.cloudinary.com/dau96mui2/image/upload/v1776765486/2_xh3erh.png', label: 'Floral 2' },
    { url: 'https://res.cloudinary.com/dau96mui2/image/upload/v1776765487/3_zdnq1l.png', label: 'Floral 3' },
    { url: 'https://res.cloudinary.com/dau96mui2/image/upload/v1776765490/4_szuz80.png', label: 'Floral 4' },
    { url: 'https://res.cloudinary.com/dau96mui2/image/upload/v1776765492/5_dgvzjn.png', label: 'Floral 5' },
    { url: 'https://res.cloudinary.com/dau96mui2/image/upload/v1776765509/6_bbgeun.png', label: 'Floral 6' },
    { url: 'https://res.cloudinary.com/dau96mui2/image/upload/v1776783658/Design_sans_titre_tzwipm.png', label: 'Floral 9' },
  ],
}

function getGalleryForEvent(type: string): { url: string; label: string }[] {
  return GALLERY_IMAGES[type] || GALLERY_IMAGES['default']
}

/* ── Styles ────────────────────────────────────────────────── */

const GOLD = '#C9A84C'
const DARK = '#2a2520'
const TEXT = '#3a3330'

/* ── Composant pour un événement ──────────────────────────── */

function EventImagePicker({ event, imageUrl, onChange }: {
  event: Evenement
  imageUrl: string
  onChange: (url: string) => void
}) {
  const [uploading, setUploading] = useState(false)
  const gallery = getGalleryForEvent(event.type)
  const eventName = event.type === 'Autre' && event.customName ? event.customName : event.type

  const handleImport = async (file: File) => {
    setUploading(true)
    try {
      // Convertir en base64 pour embarquer dans le HTML statique
      const reader = new FileReader()
      reader.onload = () => {
        onChange(reader.result as string)
        setUploading(false)
      }
      reader.onerror = () => setUploading(false)
      reader.readAsDataURL(file)
    } catch {
      setUploading(false)
    }
  }

  return (
    <div style={{ marginBottom: 24, padding: 20, background: 'white', borderRadius: 14, border: `1px solid ${GOLD}33`, boxShadow: '0 2px 12px rgba(0,0,0,0.04)' }}>
      <div style={{ fontFamily: 'var(--font-playfair-display)', fontSize: 16, color: DARK, marginBottom: 4, fontWeight: 600 }}>
        {eventName}
      </div>
      <p style={{ fontFamily: 'var(--font-cormorant-garamond)', fontSize: 13, color: '#9ca3af', fontStyle: 'italic', margin: '0 0 14px' }}>
        Cette image apparaîtra sous le titre de l&apos;événement
      </p>

      {/* Image sélectionnée */}
      {imageUrl && (
        <div style={{ marginBottom: 14, textAlign: 'center' }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={imageUrl}
            alt={eventName}
            style={{ maxWidth: '100%', maxHeight: 160, objectFit: 'contain', borderRadius: 10, border: `1px solid ${GOLD}33` }}
          />
          <div style={{ marginTop: 6 }}>
            <button type="button" onClick={() => onChange('')} style={{ background: 'none', border: 'none', color: '#d45050', fontSize: 12, fontFamily: 'var(--font-cormorant-garamond)', cursor: 'pointer' }}>
              Retirer l&apos;image
            </button>
          </div>
        </div>
      )}

      {/* Galerie */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(80px, 1fr))', gap: 8, marginBottom: 12 }}>
        {gallery.map(img => (
          <button
            key={img.url}
            type="button"
            onClick={() => onChange(img.url)}
            style={{
              padding: 4,
              border: imageUrl === img.url ? `2px solid ${GOLD}` : '1.5px solid #e0d8cc',
              borderRadius: 8,
              background: 'white',
              cursor: 'pointer',
              boxShadow: imageUrl === img.url ? `0 0 0 2px ${GOLD}33` : 'none',
              transition: 'all 0.15s ease',
            }}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={img.url} alt={img.label} style={{ width: '100%', height: 70, objectFit: 'contain', borderRadius: 4 }} />
          </button>
        ))}
      </div>

      {/* Import custom */}
      <label style={{ display: 'block', cursor: uploading ? 'wait' : 'pointer' }}>
        <div style={{
          border: `1.5px dashed ${GOLD}55`,
          borderRadius: 8,
          padding: '10px 14px',
          textAlign: 'center',
          background: uploading ? '#faf5ea' : '#faf8f4',
        }}>
          <span style={{ fontSize: 13, color: TEXT, fontFamily: 'var(--font-cormorant-garamond)' }}>
            {uploading ? '⏳ Importation...' : '📁 Importer votre propre image'}
          </span>
        </div>
        <input type="file" accept="image/*" disabled={uploading} onChange={e => { const f = e.target.files?.[0]; if (f) handleImport(f); e.target.value = '' }} style={{ display: 'none' }} />
      </label>
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

      {events.map(event => (
        <EventImagePicker
          key={event.id}
          event={event}
          imageUrl={data[event.id] || ''}
          onChange={url => onChange({ ...data, [event.id]: url })}
        />
      ))}
    </div>
  )
}
