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
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(100px, 1fr))', gap: 8 }}>
      {visuals.map(v => {
        const selected = selectedId === v.id
        const thumbUrl = v.url.replace('/upload/', '/upload/w_300,c_fit,q_auto/')
        return (
          <button
            key={v.id}
            type="button"
            onClick={() => onSelect(v.id)}
            style={{
              padding: 3,
              borderRadius: 8,
              border: selected ? `3px solid ${accent}` : '2px solid #e8e0d8',
              background: selected ? `${accent}15` : 'white',
              cursor: 'pointer',
              transition: 'all 0.15s',
              boxShadow: selected ? `0 0 0 2px white, 0 0 0 4px ${accent}` : 'none',
              outline: 'none',
              position: 'relative',
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
                borderRadius: 5,
                display: 'block',
                aspectRatio: '1',
                objectFit: 'cover',
              }}
            />
            {selected && (
              <div style={{
                position: 'absolute', top: 4, right: 4,
                width: 22, height: 22, borderRadius: '50%',
                background: accent, color: 'white',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 13, fontWeight: 700, lineHeight: 1,
                boxShadow: '0 2px 6px rgba(0,0,0,0.3)',
              }}>
                ✓
              </div>
            )}
          </button>
        )
      })}
    </div>
  )
}
