'use client'

import { byCategory, type VisualCategory } from '@/lib/visuals'

interface Props {
  category: VisualCategory
  selectedId?: string
  onSelect: (id: string) => void
  accent?: string
}

export default function VisualPicker({ category, selectedId, onSelect, accent = '#C9A84C' }: Props) {
  const visuals = byCategory(category)

  if (visuals.length === 0) {
    return <p style={{ textAlign: 'center', color: '#999', fontSize: 13 }}>Aucun visuel disponible pour cette catégorie.</p>
  }

  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(130px, 1fr))', gap: 10 }}>
      {visuals.map(v => {
        const selected = selectedId === v.id
        // Cloudinary: miniature 400px pour le picker (chargement rapide)
        const thumbUrl = v.url.replace('/upload/', '/upload/w_400,c_fit,q_auto/')
        return (
          <button
            key={v.id}
            type="button"
            onClick={() => onSelect(v.id)}
            style={{
              padding: 4,
              borderRadius: 10,
              border: selected ? `2.5px solid ${accent}` : '2px solid #e8e0d8',
              background: 'white',
              cursor: 'pointer',
              transition: 'border-color 0.15s, box-shadow 0.15s',
              boxShadow: selected ? `0 0 0 3px ${accent}33` : 'none',
              outline: 'none',
            }}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={thumbUrl}
              alt={v.label}
              loading="lazy"
              style={{
                width: '100%',
                height: 'auto',
                borderRadius: 7,
                display: 'block',
                aspectRatio: '1',
                objectFit: 'cover',
              }}
            />
          </button>
        )
      })}
    </div>
  )
}
