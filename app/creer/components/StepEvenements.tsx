'use client'

import { useState } from 'react'

/* ── Types ─────────────────────────────────────────────────── */

export interface Evenement {
  id: string
  type: string
  customName: string
  lieu: string
  adresse: string
  date: string
  heure: string
  note: string
  // Infos supplémentaires
  showInfos: boolean
  transport: string
  hebergement: string
}

export type EvenementsData = Evenement[]

const TYPES_EVENEMENTS = [
  'Mairie',
  'Cérémonie religieuse / Houppa',
  'Réception / Soirée',
  'Cocktail',
  'Brunch',
  'Shabbat Hatan',
  'Henna',
  'Autre',
]

export function createEmptyEvenement(): Evenement {
  return {
    id: crypto.randomUUID(),
    type: 'Mairie',
    customName: '',
    lieu: '',
    adresse: '',
    date: '',
    heure: '',
    note: '',
    showInfos: false,
    transport: '',
    hebergement: '',
  }
}

/* ── Styles ────────────────────────────────────────────────── */

const GOLD = '#C9A84C'
const DARK = '#2a2520'
const TEXT = '#3a3330'

const S = {
  label: { display: 'block', fontFamily: 'var(--font-cormorant-garamond)', fontSize: 14, color: TEXT, marginBottom: 4, fontWeight: 600 } as React.CSSProperties,
  input: { width: '100%', padding: '10px 14px', border: `1px solid ${GOLD}44`, borderRadius: 8, fontSize: 15, fontFamily: 'var(--font-cormorant-garamond)', color: DARK, background: 'white', outline: 'none', boxSizing: 'border-box' as const } as React.CSSProperties,
  select: { width: '100%', padding: '10px 14px', border: `1px solid ${GOLD}44`, borderRadius: 8, fontSize: 15, fontFamily: 'var(--font-cormorant-garamond)', color: DARK, background: 'white', outline: 'none', boxSizing: 'border-box' as const, cursor: 'pointer' } as React.CSSProperties,
  textarea: { width: '100%', padding: '10px 14px', border: `1px solid ${GOLD}44`, borderRadius: 8, fontSize: 15, fontFamily: 'var(--font-cormorant-garamond)', color: DARK, background: 'white', outline: 'none', boxSizing: 'border-box' as const, resize: 'vertical' as const, minHeight: 60 } as React.CSSProperties,
  row: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 12 } as React.CSSProperties,
  card: { padding: '20px', background: 'white', borderRadius: 14, border: `1px solid ${GOLD}33`, boxShadow: '0 2px 12px rgba(0,0,0,0.04)', marginBottom: 16 } as React.CSSProperties,
  toggle: { display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer', fontFamily: 'var(--font-cormorant-garamond)', fontSize: 13, color: GOLD, marginTop: 8, background: 'none', border: 'none', padding: 0 } as React.CSSProperties,
  btnAdd: { display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, width: '100%', padding: '14px', borderRadius: 10, border: `2px dashed ${GOLD}55`, background: 'transparent', color: GOLD, fontSize: 15, fontFamily: 'var(--font-cormorant-garamond)', fontWeight: 600, cursor: 'pointer' } as React.CSSProperties,
  btnDelete: { background: 'none', border: 'none', color: '#d45050', fontSize: 12, fontFamily: 'var(--font-cormorant-garamond)', cursor: 'pointer', padding: '4px 8px' } as React.CSSProperties,
}

/* ── Sous-composants ──────────────────────────────────────── */

function Field({ label, value, onChange, placeholder, type = 'text' }: { label: string; value: string; onChange: (v: string) => void; placeholder?: string; type?: string }) {
  return (
    <div>
      <label style={S.label}>{label}</label>
      <input style={S.input} type={type} value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder} />
    </div>
  )
}

function EvenementCard({ event, index, total, onChange, onDelete }: {
  event: Evenement
  index: number
  total: number
  onChange: (e: Evenement) => void
  onDelete: () => void
}) {
  const [showInfos, setShowInfos] = useState(event.showInfos)

  const toggleInfos = () => {
    const next = !showInfos
    setShowInfos(next)
    onChange({ ...event, showInfos: next })
  }

  return (
    <div style={S.card}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
        <div style={{ fontFamily: 'var(--font-playfair-display)', fontSize: 16, color: DARK, fontWeight: 600 }}>
          Événement {index + 1}
        </div>
        {total > 1 && (
          <button type="button" style={S.btnDelete} onClick={onDelete}>
            Supprimer
          </button>
        )}
      </div>

      <div style={{ marginBottom: 12 }}>
        <label style={S.label}>Type d&apos;événement</label>
        <select style={S.select} value={event.type} onChange={e => onChange({ ...event, type: e.target.value })}>
          {TYPES_EVENEMENTS.map(t => <option key={t} value={t}>{t}</option>)}
        </select>
      </div>

      {event.type === 'Autre' && (
        <div style={{ marginBottom: 12 }}>
          <Field label="Nom personnalisé" value={event.customName} onChange={v => onChange({ ...event, customName: v })} placeholder="Ex: Pré-soirée" />
        </div>
      )}

      <div style={{ marginBottom: 12 }}>
        <Field label="Lieu" value={event.lieu} onChange={v => onChange({ ...event, lieu: v })} placeholder="Synagogue Beth-El" />
      </div>

      <div style={{ marginBottom: 12 }}>
        <Field label="Adresse" value={event.adresse} onChange={v => onChange({ ...event, adresse: v })} placeholder="3 Rue de Turbigo, 75001 Paris" />
      </div>

      <div style={S.row}>
        <Field label="Date" value={event.date} onChange={v => onChange({ ...event, date: v })} type="date" />
        <Field label="Heure" value={event.heure} onChange={v => onChange({ ...event, heure: v })} type="time" />
      </div>

      <div style={{ marginBottom: 8 }}>
        <label style={S.label}>Notes (optionnel)</label>
        <textarea style={S.textarea} value={event.note} onChange={e => onChange({ ...event, note: e.target.value })} placeholder="Informations complémentaires..." />
      </div>

      {/* ── Infos supplémentaires ── */}
      <button type="button" style={S.toggle} onClick={toggleInfos}>
        <span style={{ transform: showInfos ? 'rotate(90deg)' : 'none', transition: 'transform 0.2s', display: 'inline-block' }}>▸</span>
        {showInfos ? 'Masquer les infos pratiques' : 'Ajouter transport / hébergement'}
      </button>

      {showInfos && (
        <div style={{ marginTop: 12, padding: '14px 16px', background: '#faf8f4', borderRadius: 10, border: `1px solid ${GOLD}22` }}>
          <div style={{ marginBottom: 12 }}>
            <label style={S.label}>Transport</label>
            <textarea style={S.textarea} value={event.transport} onChange={e => onChange({ ...event, transport: e.target.value })} placeholder="Ex: Parking disponible sur place. Navette depuis la gare." />
          </div>
          <div>
            <label style={S.label}>Hébergement</label>
            <textarea style={S.textarea} value={event.hebergement} onChange={e => onChange({ ...event, hebergement: e.target.value })} placeholder="Ex: Hôtel Le Grand Paris — tarif préférentiel avec le code MARIAGE2026" />
          </div>
        </div>
      )}
    </div>
  )
}

/* ── Composant principal ──────────────────────────────────── */

export default function StepEvenements({ data, onChange }: { data: EvenementsData; onChange: (d: EvenementsData) => void }) {
  const addEvent = () => {
    onChange([...data, createEmptyEvenement()])
  }

  const updateEvent = (index: number, event: Evenement) => {
    const next = [...data]
    next[index] = event
    onChange(next)
  }

  const deleteEvent = (index: number) => {
    onChange(data.filter((_, i) => i !== index))
  }

  return (
    <div>
      <h2 style={{ fontFamily: 'var(--font-great-vibes)', fontSize: 36, color: GOLD, textAlign: 'center', marginBottom: 8 }}>
        Les événements
      </h2>
      <p style={{ fontFamily: 'var(--font-cormorant-garamond)', fontSize: 15, color: TEXT, textAlign: 'center', marginBottom: 32, fontStyle: 'italic' }}>
        Ajoutez chaque cérémonie ou événement de votre mariage
      </p>

      {data.map((event, i) => (
        <EvenementCard
          key={event.id}
          event={event}
          index={i}
          total={data.length}
          onChange={e => updateEvent(i, e)}
          onDelete={() => deleteEvent(i)}
        />
      ))}

      <button type="button" style={S.btnAdd} onClick={addEvent}>
        + Ajouter un événement
      </button>
    </div>
  )
}
