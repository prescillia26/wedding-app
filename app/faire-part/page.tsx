'use client'

import { useState, useEffect, useRef, useCallback } from 'react'

type Theme = 'classique-dore' | 'moderne' | 'champetre' | 'oriental'
type PresentationStyle = 'photo' | 'elegant'

const THEMES = {
  'classique-dore': { fond: '#fdf0f3', accent: '#C9A84C', texte: '#4a3728', textSecondaire: '#6a5040' },
  'moderne': { fond: '#f8f8f8', accent: '#888888', texte: '#1a1a1a', textSecondaire: '#555555' },
  'champetre': { fond: '#f5f0e8', accent: '#8fad6a', texte: '#3d4a2e', textSecondaire: '#5a6040' },
  'oriental': { fond: '#1a0a00', accent: '#D4A847', texte: '#f5e6c8', textSecondaire: '#d4c0a0' },
} as const

const CEREMONY_TYPES = ['Mairie', 'Cérémonie religieuse / Houppa', 'Henné', 'Cocktail', 'Soirée', 'Boat Party', 'Autre']

interface Ceremony {
  type: string
  customName: string
  lieu: string
  adresse: string
  date: string
  heure: string
  suiviDAutre: boolean
  evenementSuivantNom: string
  evenementSuivantAdresse: string
}

interface FormData {
  marie1Prenom: string
  marie1Nom: string
  marie1Prenom2: string
  marie2Prenom: string
  marie2Nom: string
  marie2Prenom2: string
  famille1Pere: string
  famille1Mere: string
  famille1GpPaternels: string
  famille1GpMaternels: string
  famille2Pere: string
  famille2Mere: string
  famille2GpPaternels: string
  famille2GpMaternels: string
  ceremonies: Ceremony[]
  style: Theme
  presentationStyle: PresentationStyle
  mariageJuif: boolean
  youtubeUrl: string
  musicUrl: string
  photoFond: string
  photosFond: string[]
}

const defaultCeremony: Ceremony = {
  type: 'Cérémonie religieuse / Houppa',
  customName: '', lieu: '', adresse: '', date: '', heure: '',
  suiviDAutre: false, evenementSuivantNom: '', evenementSuivantAdresse: '',
}

const defaultFormData: FormData = {
  marie1Prenom: '', marie1Nom: '', marie1Prenom2: '',
  marie2Prenom: '', marie2Nom: '', marie2Prenom2: '',
  famille1Pere: '', famille1Mere: '', famille1GpPaternels: '', famille1GpMaternels: '',
  famille2Pere: '', famille2Mere: '', famille2GpPaternels: '', famille2GpMaternels: '',
  ceremonies: [{ ...defaultCeremony }],
  style: 'classique-dore', presentationStyle: 'photo', mariageJuif: false, youtubeUrl: '', musicUrl: '', photoFond: '', photosFond: [],
}

// Propriétés mobiles partagées pour tous les boutons
const BTN: React.CSSProperties = {
  touchAction: 'manipulation',
  WebkitTapHighlightColor: 'transparent',
  cursor: 'pointer',
}

function getYouTubeId(url: string): string | null {
  const match = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&\n?#]+)/)
  return match ? match[1] : null
}

function formatDateFr(dateStr: string): string {
  if (!dateStr) return ''
  return new Intl.DateTimeFormat('fr-FR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })
    .format(new Date(dateStr + 'T12:00:00')).toUpperCase()
}

function formatDateFrCap(dateStr: string): string {
  if (!dateStr) return ''
  const d = new Date(dateStr + 'T12:00:00')
  const parts = new Intl.DateTimeFormat('fr-FR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' }).formatToParts(d)
  const cap = (s: string) => s.charAt(0).toUpperCase() + s.slice(1)
  const w = parts.find(p => p.type === 'weekday')?.value || ''
  const day = parts.find(p => p.type === 'day')?.value || ''
  const m = parts.find(p => p.type === 'month')?.value || ''
  const y = parts.find(p => p.type === 'year')?.value || ''
  return `Le ${cap(w)} ${day} ${cap(m)} ${y}`
}

function formatHeure(h: string): string {
  if (!h) return ''
  return 'À ' + h.replace(':', 'H')
}

function formatLieu(lieu: string): string {
  if (!lieu) return ''
  const l = lieu.toLowerCase()
  if (l.includes('salon') || l.includes('salle')) return `Dans les salons ${lieu}`
  if (l.includes('château') || l.includes('chateau')) return `Au château ${lieu}`
  if (l.includes('domaine')) return `Au domaine ${lieu}`
  return `À ${lieu}`
}

function getHebrewDate(dateStr: string): string {
  if (!dateStr) return ''
  try {
    return new Intl.DateTimeFormat('he-IL-u-ca-hebrew', { year: 'numeric', month: 'long', day: 'numeric' })
      .format(new Date(dateStr + 'T12:00:00'))
  } catch { return '' }
}

function sortByDate(ceremonies: Ceremony[]): Ceremony[] {
  return [...ceremonies].sort((a, b) => {
    if (!a.date) return 1
    if (!b.date) return -1
    return new Date(a.date).getTime() - new Date(b.date).getTime()
  })
}

const S: Record<string, React.CSSProperties> = {
  input: {
    width: '100%', border: '1px solid #fecdd3', borderRadius: 10, padding: '10px 14px',
    background: 'white', fontSize: 14, outline: 'none', color: '#4a3728', boxSizing: 'border-box',
  },
  label: {
    display: 'block', fontSize: 10, textTransform: 'uppercase', letterSpacing: '0.15em',
    color: '#C9A84C', marginBottom: 6, fontWeight: 600,
  },
}

function Label({ children }: { children: React.ReactNode }) {
  return <label style={S.label}>{children}</label>
}

function Field({ label, value, onChange, placeholder, type = 'text' }: {
  label: string; value: string; onChange: (v: string) => void; placeholder?: string; type?: string
}) {
  return (
    <div style={{ marginBottom: 16 }}>
      <Label>{label}</Label>
      <input type={type} value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder} style={S.input} />
    </div>
  )
}

function ProgressBar({ step }: { step: number }) {
  const steps = ['Les mariés', 'Les familles', 'Cérémonies', 'Style']
  return (
    <div style={{ marginBottom: 32 }}>
      <div style={{ position: 'relative', display: 'flex', alignItems: 'center', marginBottom: 10 }}>
        <div style={{ position: 'absolute', left: 0, right: 0, height: 1, background: '#fce7f3' }} />
        <div style={{
          position: 'absolute', left: 0, height: 1,
          background: 'linear-gradient(to right, rgba(201,168,76,0.4), #C9A84C)',
          width: `${((step - 1) / (steps.length - 1)) * 100}%`,
          transition: 'width 0.5s ease',
        }} />
        <div style={{ position: 'relative', display: 'flex', justifyContent: 'space-between', width: '100%' }}>
          {steps.map((_, i) => (
            <div key={i} style={{
              width: 10, height: 10, borderRadius: '50%',
              border: `2px solid ${i + 1 <= step ? '#C9A84C' : '#fecdd3'}`,
              background: i + 1 < step ? '#C9A84C' : 'white',
              boxShadow: i + 1 === step ? '0 0 0 4px rgba(201,168,76,0.15)' : 'none',
              transition: 'all 0.3s',
            }} />
          ))}
        </div>
      </div>
      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
        {steps.map((label, i) => (
          <span key={i} style={{
            flex: 1, textAlign: 'center', fontSize: 9, fontWeight: 600,
            letterSpacing: '0.12em', textTransform: 'uppercase',
            color: i + 1 === step ? '#C9A84C' : i + 1 < step ? 'rgba(201,168,76,0.45)' : '#fecdd3',
          }}>{label}</span>
        ))}
      </div>
    </div>
  )
}

function Step1({ data, onChange }: { data: FormData; onChange: (d: Partial<FormData>) => void }) {
  return (
    <div>
      <h2 style={{ textAlign: 'center', fontSize: 22, fontWeight: 600, color: '#4a3728', marginBottom: 24 }}>Les mariés</h2>
      <div style={{ background: '#fdf8f9', borderRadius: 12, padding: 20, marginBottom: 16 }}>
        <div style={{ fontSize: 11, color: '#C9A84C', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 12 }}>Marié·e 1</div>
        <div style={{ display: 'flex', gap: 12 }}>
          <Field label="Prénom" value={data.marie1Prenom} onChange={v => onChange({ marie1Prenom: v })} placeholder="Sophie" />
          <Field label="Nom" value={data.marie1Nom} onChange={v => onChange({ marie1Nom: v })} placeholder="Martin" />
        </div>
        <Field label="2ème prénom (optionnel)" value={data.marie1Prenom2} onChange={v => onChange({ marie1Prenom2: v })} placeholder="Marie" />
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, margin: '16px 0' }}>
        <div style={{ flex: 1, height: 1, background: '#fecdd3' }} />
        <span style={{ color: '#C9A84C', fontSize: 20 }}>&</span>
        <div style={{ flex: 1, height: 1, background: '#fecdd3' }} />
      </div>
      <div style={{ background: '#fdf8f9', borderRadius: 12, padding: 20 }}>
        <div style={{ fontSize: 11, color: '#C9A84C', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 12 }}>Marié·e 2</div>
        <div style={{ display: 'flex', gap: 12 }}>
          <Field label="Prénom" value={data.marie2Prenom} onChange={v => onChange({ marie2Prenom: v })} placeholder="Thomas" />
          <Field label="Nom" value={data.marie2Nom} onChange={v => onChange({ marie2Nom: v })} placeholder="Dupont" />
        </div>
        <Field label="2ème prénom (optionnel)" value={data.marie2Prenom2} onChange={v => onChange({ marie2Prenom2: v })} placeholder="David" />
      </div>
    </div>
  )
}

function Step2({ data, onChange }: { data: FormData; onChange: (d: Partial<FormData>) => void }) {
  return (
    <div>
      <h2 style={{ textAlign: 'center', fontSize: 22, fontWeight: 600, color: '#4a3728', marginBottom: 24 }}>Les familles</h2>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
        {[
          { title: data.marie1Prenom || 'Marié·e 1', fields: [
            { label: 'Père', value: data.famille1Pere, key: 'famille1Pere', hint: 'M. Richard Portugais' },
            { label: 'Mère', value: data.famille1Mere, key: 'famille1Mere', hint: 'Mme Marie Benchetrit' },
            { label: 'GP paternels', value: data.famille1GpPaternels, key: 'famille1GpPaternels', hint: 'M. & Mme Sydney Zeitoun' },
            { label: 'GP maternels', value: data.famille1GpMaternels, key: 'famille1GpMaternels', hint: 'M. & Mme Jacques Portugais' },
          ]},
          { title: data.marie2Prenom || 'Marié·e 2', fields: [
            { label: 'Père', value: data.famille2Pere, key: 'famille2Pere', hint: 'M. Paul Dupont' },
            { label: 'Mère', value: data.famille2Mere, key: 'famille2Mere', hint: 'Mme Claire Dupont' },
            { label: 'GP paternels', value: data.famille2GpPaternels, key: 'famille2GpPaternels', hint: 'M. & Mme Georges Dupont' },
            { label: 'GP maternels', value: data.famille2GpMaternels, key: 'famille2GpMaternels', hint: 'M. & Mme André Leroy' },
          ]},
        ].map((col, ci) => (
          <div key={ci}>
            <div style={{ fontSize: 11, color: '#C9A84C', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', textAlign: 'center', marginBottom: 12 }}>{col.title}</div>
            {col.fields.map(f => (
              <div key={f.key} style={{ marginBottom: 12 }}>
                <Label>{f.label}</Label>
                <input type="text" value={f.value} onChange={e => onChange({ [f.key]: e.target.value } as Partial<FormData>)} style={S.input} />
                <p style={{ fontSize: 10, color: '#9ca3af', marginTop: 3 }}>ex: {f.hint}</p>
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  )
}

function Step3({ data, onChange }: { data: FormData; onChange: (d: Partial<FormData>) => void }) {
  const update = (i: number, u: Partial<Ceremony>) =>
    onChange({ ceremonies: data.ceremonies.map((c, idx) => idx === i ? { ...c, ...u } : c) })
  const add = () => data.ceremonies.length < 6 && onChange({ ceremonies: [...data.ceremonies, { ...defaultCeremony, type: 'Soirée' }] })
  const remove = (i: number) => onChange({ ceremonies: data.ceremonies.filter((_, idx) => idx !== i) })

  return (
    <div>
      <h2 style={{ textAlign: 'center', fontSize: 22, fontWeight: 600, color: '#4a3728', marginBottom: 24 }}>Les cérémonies</h2>
      {data.ceremonies.map((c, i) => (
        <div key={i} style={{ background: '#fdf8f9', borderRadius: 12, padding: 20, marginBottom: 16 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
            <span style={{ fontSize: 11, color: '#C9A84C', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em' }}>Événement {i + 1}</span>
            {data.ceremonies.length > 1 && (
              <button type="button" onClick={() => remove(i)} style={{ ...BTN, background: 'none', border: 'none', color: '#fb7185', fontSize: 12 }}>Supprimer</button>
            )}
          </div>
          <Label>Type</Label>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 16 }}>
            {CEREMONY_TYPES.map(t => (
              <button key={t} type="button" onClick={() => update(i, { type: t })} style={{
                ...BTN,
                padding: '6px 14px', borderRadius: 9999, fontSize: 12,
                border: '1px solid #C9A84C',
                background: c.type === t ? '#C9A84C' : 'transparent',
                color: c.type === t ? 'white' : '#C9A84C',
              }}>{t}</button>
            ))}
          </div>
          {c.type === 'Autre' && <Field label="Nom de l'événement" value={c.customName} onChange={v => update(i, { customName: v })} />}
          <Field label="Lieu / Salle" value={c.lieu} onChange={v => update(i, { lieu: v })} placeholder="Salons Kahi Resort" />
          <Field label="Adresse (optionnel)" value={c.adresse} onChange={v => update(i, { adresse: v })} />
          <div style={{ display: 'flex', gap: 12 }}>
            <Field label="Date" value={c.date} onChange={v => update(i, { date: v })} type="date" />
            <Field label="Heure" value={c.heure} onChange={v => update(i, { heure: v })} type="time" />
          </div>
          {c.type === 'Mairie' && (
            <div>
              <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer', fontSize: 13, color: '#4a3728' }}>
                <input type="checkbox" checked={c.suiviDAutre} onChange={e => update(i, { suiviDAutre: e.target.checked })} />
                Suivi d'un autre événement ?
              </label>
              {c.suiviDAutre && (
                <div style={{ marginTop: 10 }}>
                  <Field label="Nom de l'événement suivant" value={c.evenementSuivantNom} onChange={v => update(i, { evenementSuivantNom: v })} placeholder="Soirée Henné" />
                  <Field label="Adresse de l'événement suivant" value={c.evenementSuivantAdresse} onChange={v => update(i, { evenementSuivantAdresse: v })} placeholder="Salle Michkenot Israël, 6 rue Jean Nohain Paris 75019" />
                </div>
              )}
            </div>
          )}
        </div>
      ))}
      {data.ceremonies.length < 6 && (
        <button type="button" onClick={add} style={{
          ...BTN,
          width: '100%', padding: 12, border: '2px dashed #C9A84C', borderRadius: 10,
          background: 'transparent', color: '#C9A84C', fontSize: 14,
        }}>+ Ajouter un événement</button>
      )}
    </div>
  )
}

function Step4({ data, onChange }: { data: FormData; onChange: (d: Partial<FormData>) => void }) {
  return (
    <div>
      <h2 style={{ textAlign: 'center', fontSize: 22, fontWeight: 600, color: '#4a3728', marginBottom: 24 }}>Style & options</h2>

      <div style={{ marginBottom: 24 }}>
        <Label>Présentation</Label>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
          {([
            { key: 'photo' as PresentationStyle, label: '📷 Style photo en fond', desc: 'Votre photo en arrière-plan' },
            { key: 'elegant' as PresentationStyle, label: '✨ Style élégant', desc: 'Monogramme & calligraphie' },
          ]).map(opt => (
            <button key={opt.key} type="button" onClick={() => onChange({ presentationStyle: opt.key })} style={{
              ...BTN,
              padding: 16, borderRadius: 12,
              border: `2px solid ${data.presentationStyle === opt.key ? '#C9A84C' : '#fecdd3'}`,
              background: data.presentationStyle === opt.key ? '#fdf5e4' : 'white',
              textAlign: 'left', position: 'relative',
            }}>
              <div style={{ fontSize: 13, fontWeight: 700, color: data.presentationStyle === opt.key ? '#C9A84C' : '#4a3728', marginBottom: 4 }}>{opt.label}</div>
              <div style={{ fontSize: 11, color: '#9ca3af' }}>{opt.desc}</div>
              {data.presentationStyle === opt.key && (
                <div style={{ position: 'absolute', top: 8, right: 8, width: 18, height: 18, borderRadius: '50%', background: '#C9A84C', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 10 }}>✓</div>
              )}
            </button>
          ))}
        </div>
      </div>

      <Label>Style visuel</Label>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 24 }}>
        {(Object.entries(THEMES) as [Theme, typeof THEMES[Theme]][]).map(([key, t]) => (
          <button key={key} type="button" onClick={() => onChange({ style: key })} style={{
            ...BTN,
            padding: 16, borderRadius: 12, border: `2px solid ${data.style === key ? t.accent : '#fecdd3'}`,
            background: t.fond, textAlign: 'left', position: 'relative',
          }}>
            <div style={{ fontSize: 12, fontWeight: 700, color: t.texte, marginBottom: 4 }}>
              {{ 'classique-dore': 'Classique doré', 'moderne': 'Moderne', 'champetre': 'Champêtre', 'oriental': 'Oriental' }[key]}
            </div>
            <div style={{ fontSize: 11, color: t.accent }}>✦ Accent</div>
            {data.style === key && (
              <div style={{ position: 'absolute', top: 8, right: 8, width: 18, height: 18, borderRadius: '50%', background: t.accent, color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 10 }}>✓</div>
            )}
          </button>
        ))}
      </div>
      <label style={{ display: 'flex', alignItems: 'center', gap: 10, padding: 14, border: '1px solid #fecdd3', borderRadius: 10, cursor: 'pointer', marginBottom: 20, fontSize: 14, color: '#4a3728' }}>
        <input type="checkbox" checked={data.mariageJuif} onChange={e => onChange({ mariageJuif: e.target.checked })} />
        Mariage juif ✡
      </label>
      <div style={{ marginBottom: 20 }}>
        <Label>Musique de fond — Fichier MP3</Label>
        <MusicUploader musicUrl={data.musicUrl ?? ''} onChange={url => onChange({ musicUrl: url })} />
        {!data.musicUrl && (
          <>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, margin: '12px 0' }}>
              <div style={{ flex: 1, height: 1, background: '#fecdd3' }} />
              <span style={{ fontSize: 11, color: '#9ca3af' }}>ou lien YouTube</span>
              <div style={{ flex: 1, height: 1, background: '#fecdd3' }} />
            </div>
            <input type="url" value={data.youtubeUrl} onChange={e => onChange({ youtubeUrl: e.target.value })} placeholder="https://www.youtube.com/watch?v=..." style={S.input} />
          </>
        )}
      </div>
      <div>
        <Label>Photos de fond (optionnel — max 5)</Label>
        <p style={{ fontSize: 11, color: '#9ca3af', marginBottom: 8 }}>Chaque cérémonie utilisera une photo différente selon son ordre</p>
        {(data.photosFond ?? []).length < 5 && (
          <label style={{ display: 'block', cursor: 'pointer' }}>
            <div style={{ border: '2px dashed #fecdd3', borderRadius: 10, padding: 20, textAlign: 'center' }}>
              <div style={{ fontSize: 24, marginBottom: 6 }}>📷</div>
              <p style={{ fontSize: 13, color: '#4a3728' }}>Cliquer pour ajouter une photo</p>
            </div>
            <input type="file" accept="image/*" multiple onChange={e => {
              const files = Array.from(e.target.files ?? [])
              const current = data.photosFond ?? []
              const toAdd = files.slice(0, 5 - current.length)
              if (!toAdd.length) return
              const results: string[] = new Array(toAdd.length)
              let done = 0
              toAdd.forEach((f, fi) => {
                const r = new FileReader()
                r.onload = ev => {
                  results[fi] = ev.target?.result as string
                  done++
                  if (done === toAdd.length) {
                    const updated = [...current, ...results].slice(0, 5)
                    onChange({ photosFond: updated, photoFond: updated[0] ?? '' })
                  }
                }
                r.readAsDataURL(f)
              })
              e.target.value = ''
            }} style={{ display: 'none' }} />
          </label>
        )}
        {(data.photosFond ?? []).length > 0 && (
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginTop: 12 }}>
            {(data.photosFond ?? []).map((photo, idx) => (
              <div key={idx} style={{ position: 'relative', width: 88, height: 72 }}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={photo} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: 8 }} />
                <div style={{ position: 'absolute', bottom: 2, left: 2, background: 'rgba(0,0,0,0.55)', color: 'white', fontSize: 9, borderRadius: 4, padding: '1px 4px' }}>Photo {idx + 1}</div>
                <button type="button" onClick={() => {
                  const updated = (data.photosFond ?? []).filter((_, i) => i !== idx)
                  onChange({ photosFond: updated, photoFond: updated[0] ?? '' })
                }} style={{ ...BTN, position: 'absolute', top: 2, right: 2, background: 'white', border: 'none', borderRadius: '50%', width: 18, height: 18, fontSize: 10, color: '#fb7185', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 0 }}>✕</button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

function MairieIllustration({ color }: { color: string }) {
  return (
    <svg viewBox="0 0 200 120" width="140" height="84" xmlns="http://www.w3.org/2000/svg">
      <rect x="10" y="92" width="180" height="7" fill={color} opacity="0.7" />
      <rect x="40" y="52" width="120" height="44" fill="none" stroke={color} strokeWidth="1.5" />
      {[56, 74, 92, 110, 128].map(x => <rect key={x} x={x} y="52" width="4" height="44" fill={color} opacity="0.5" />)}
      <polygon points="28,52 100,14 172,52" fill="none" stroke={color} strokeWidth="1.5" />
      <path d="M 87 96 L 87 68 Q 100 58 113 68 L 113 96 Z" fill="none" stroke={color} strokeWidth="1.2" />
      <rect x="50" y="60" width="16" height="14" rx="2" fill="none" stroke={color} strokeWidth="1" />
      <rect x="134" y="60" width="16" height="14" rx="2" fill="none" stroke={color} strokeWidth="1" />
      <line x1="100" y1="4" x2="100" y2="14" stroke={color} strokeWidth="1.5" />
      <circle cx="100" cy="33" r="3" fill={color} opacity="0.4" />
    </svg>
  )
}

type ThemeObj = { fond: string; accent: string; texte: string; textSecondaire: string }
interface CardProps { ceremony: Ceremony; data: FormData; theme: ThemeObj }

function CardHouppa({ ceremony, data, theme }: CardProps) {
  const hasGp = data.famille1GpPaternels || data.famille1GpMaternels || data.famille2GpPaternels || data.famille2GpMaternels
  const hebrewDate = getHebrewDate(ceremony.date)
  return (
    <div style={{ backgroundColor: theme.fond, padding: '60px 48px', position: 'relative' }}>
      {data.photoFond && <>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={data.photoFond} alt="" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' }} />
        <div style={{ position: 'absolute', inset: 0, background: theme.fond === '#1a0a00' ? 'rgba(26,10,0,0.85)' : 'rgba(255,255,255,0.88)' }} />
      </>}
      <div style={{ position: 'relative', zIndex: 1 }}>
        {data.mariageJuif && <div style={{ position: 'absolute', top: -40, right: 0, fontSize: 14, fontFamily: 'serif', color: theme.accent, direction: 'rtl' }}>בס״ד</div>}
        <div style={{ fontFamily: 'var(--font-great-vibes)', fontSize: 42, color: theme.accent, textAlign: 'center', marginBottom: 20, lineHeight: 1.2 }}>
          {data.mariageJuif ? 'Houppa & Soirée' : 'Cérémonie religieuse & Soirée'}
        </div>
        {data.mariageJuif && (
          <div style={{ marginBottom: 24 }}>
            <div style={{ height: 1, background: theme.accent, opacity: 0.35, marginBottom: 12 }} />
            <div style={{ fontFamily: 'serif', fontSize: 16, color: theme.accent, direction: 'rtl', textAlign: 'center', lineHeight: 1.9 }}>
              קוֹל שָׂשׂוֹן וְקוֹל שִׂמְחָה, קוֹל חָתָן וְקוֹל כַּלָּה
            </div>
            <div style={{ height: 1, background: theme.accent, opacity: 0.35, marginTop: 12 }} />
          </div>
        )}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr auto 1fr', gap: 12, marginBottom: 24, alignItems: 'start' }}>
          <div style={{ fontFamily: 'var(--font-cormorant-garamond)', fontStyle: 'italic', fontSize: 13, color: theme.accent, lineHeight: 2 }}>
            {data.famille1Pere && <div>{data.famille1Pere}</div>}
            {data.famille1Mere && <div>{data.famille1Mere}</div>}
            {data.famille1GpPaternels && <div>{data.famille1GpPaternels}</div>}
            {data.famille1GpMaternels && <div>{data.famille1GpMaternels}</div>}
          </div>
          <div style={{ width: 1, background: theme.accent, opacity: 0.3, alignSelf: 'stretch', minHeight: 40 }} />
          <div style={{ fontFamily: 'var(--font-cormorant-garamond)', fontStyle: 'italic', fontSize: 13, color: theme.accent, textAlign: 'right', lineHeight: 2 }}>
            {data.famille2Pere && <div>{data.famille2Pere}</div>}
            {data.famille2Mere && <div>{data.famille2Mere}</div>}
            {data.famille2GpPaternels && <div>{data.famille2GpPaternels}</div>}
            {data.famille2GpMaternels && <div>{data.famille2GpMaternels}</div>}
          </div>
        </div>
        <div style={{ fontFamily: 'var(--font-cormorant-garamond)', fontStyle: 'italic', fontSize: 22, textAlign: 'center', color: theme.texte, marginBottom: 24, lineHeight: 1.5 }}>
          {hasGp ? 'Ont la joie de vous faire part du mariage de leurs petits-enfants et enfants' : 'Ont la joie de vous faire part du mariage de leurs enfants'}
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr auto 1fr', alignItems: 'center', gap: 8, marginBottom: 24 }}>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontFamily: 'var(--font-great-vibes)', fontSize: 'clamp(32px, 10vw, 68px)', color: theme.accent, lineHeight: 1.1 }}>{data.marie1Prenom || 'Prénom'}</div>
            {data.marie1Prenom2 && <div style={{ fontSize: 11, letterSpacing: 2, color: theme.textSecondaire, marginTop: 4 }}>{data.marie1Prenom2}</div>}
          </div>
          <div style={{ fontFamily: 'var(--font-cormorant-garamond)', fontSize: 'clamp(24px, 5vw, 36px)', color: theme.accent }}>&</div>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontFamily: 'var(--font-great-vibes)', fontSize: 'clamp(32px, 10vw, 68px)', color: theme.accent, lineHeight: 1.1 }}>{data.marie2Prenom || 'Prénom'}</div>
            {data.marie2Prenom2 && <div style={{ fontSize: 11, letterSpacing: 2, color: theme.textSecondaire, marginTop: 4 }}>{data.marie2Prenom2}</div>}
          </div>
        </div>
        <div style={{ fontFamily: 'var(--font-cormorant-garamond)', fontStyle: 'italic', fontSize: 18, textAlign: 'center', color: theme.texte, marginBottom: 16, lineHeight: 1.6 }}>
          et seront honorés de votre présence à la cérémonie religieuse qui sera célébrée le
        </div>
        <div style={{ fontFamily: 'var(--font-playfair-display)', fontSize: 22, color: theme.accent, textAlign: 'center', letterSpacing: 3, textTransform: 'uppercase', marginBottom: 8 }}>{formatDateFr(ceremony.date)}</div>
        {data.mariageJuif && hebrewDate && <div style={{ fontFamily: 'serif', fontSize: 18, color: theme.accent, direction: 'rtl', textAlign: 'center', marginBottom: 16 }}>{hebrewDate}</div>}
        <div style={{ fontFamily: 'var(--font-playfair-display)', fontSize: 26, color: theme.accent, textAlign: 'center', marginBottom: 16, letterSpacing: 2 }}>{formatHeure(ceremony.heure)}</div>
        <div style={{ fontFamily: 'var(--font-cormorant-garamond)', fontStyle: 'italic', fontSize: 20, textAlign: 'center', color: theme.texte, lineHeight: 1.6 }}>
          {ceremony.lieu && <><div>{formatLieu(ceremony.lieu)}</div><div>ainsi qu'à la réception qui suivra</div></>}
          {ceremony.adresse && <div style={{ fontSize: 14, marginTop: 8, color: theme.textSecondaire }}>{ceremony.adresse}</div>}
        </div>
      </div>
    </div>
  )
}

function CardMairie({ ceremony, data, theme }: CardProps) {
  return (
    <div style={{ backgroundColor: theme.fond, padding: '60px 48px', position: 'relative' }}>
      {data.photoFond && <>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={data.photoFond} alt="" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' }} />
        <div style={{ position: 'absolute', inset: 0, background: theme.fond === '#1a0a00' ? 'rgba(26,10,0,0.85)' : 'rgba(255,255,255,0.88)' }} />
      </>}
      <div style={{ position: 'relative', zIndex: 1 }}>
        {data.mariageJuif && <div style={{ position: 'absolute', top: -40, right: 0, fontSize: 14, fontFamily: 'serif', color: theme.accent, direction: 'rtl' }}>בס״ד</div>}
        <div style={{ fontFamily: 'var(--font-great-vibes)', fontSize: 48, color: theme.accent, textAlign: 'center', marginBottom: 20 }}>Mairie</div>
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 20 }}><MairieIllustration color={theme.accent} /></div>
        <div style={{ fontFamily: 'var(--font-great-vibes)', fontSize: 'clamp(36px, 8vw, 60px)', color: theme.accent, textAlign: 'center', marginBottom: 12, lineHeight: 1.2 }}>{data.marie1Prenom} & {data.marie2Prenom}</div>
        <div style={{ fontFamily: 'var(--font-cormorant-garamond)', fontStyle: 'italic', fontSize: 22, textAlign: 'center', color: theme.texte, marginBottom: 8 }}>se diront</div>
        <div style={{ fontFamily: 'var(--font-great-vibes)', fontSize: 72, color: theme.accent, textAlign: 'center', marginBottom: 20, lineHeight: 1 }}>« Oui »</div>
        <div style={{ fontFamily: 'var(--font-playfair-display)', fontWeight: 'bold', fontSize: 20, textAlign: 'center', color: theme.texte, marginBottom: 12 }}>{formatDateFrCap(ceremony.date)}</div>
        <div style={{ fontFamily: 'var(--font-cormorant-garamond)', fontStyle: 'italic', fontSize: 18, textAlign: 'center', color: theme.texte, marginBottom: 12, lineHeight: 1.6 }}>
          <div>à la Mairie {ceremony.lieu}</div>
          {ceremony.adresse && <div style={{ fontSize: 14, marginTop: 6, color: theme.textSecondaire }}>{ceremony.adresse}</div>}
        </div>
        <div style={{ fontFamily: 'var(--font-playfair-display)', fontSize: 22, color: theme.accent, textAlign: 'center', marginBottom: 20 }}>{formatHeure(ceremony.heure)}</div>
        {ceremony.adresse && (
          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 20 }}>
            <a href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(ceremony.adresse)}`} target="_blank" rel="noopener noreferrer"
              style={{ background: theme.accent, color: 'white', padding: '10px 24px', borderRadius: 8, fontSize: 14, textDecoration: 'none' }}>
              📍 Itinéraire
            </a>
          </div>
        )}
        {ceremony.suiviDAutre && ceremony.evenementSuivantNom && (
          <div style={{ textAlign: 'center', paddingTop: 20, borderTop: `1px solid ${theme.accent}`, lineHeight: 1.8 }}>
            <div style={{ fontFamily: 'var(--font-playfair-display)', fontWeight: 'bold', fontSize: 16, color: theme.texte }}>
              La mairie sera suivie de {ceremony.evenementSuivantNom}
            </div>
            {ceremony.evenementSuivantAdresse && (
              <div style={{ fontFamily: 'var(--font-cormorant-garamond)', fontStyle: 'italic', fontSize: 14, color: theme.textSecondaire, marginTop: 4 }}>
                {ceremony.evenementSuivantAdresse}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

function CardHenne({ ceremony, data, theme }: CardProps) {
  return (
    <div style={{ backgroundColor: theme.fond, padding: '60px 48px', position: 'relative' }}>
      {data.photoFond && <>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={data.photoFond} alt="" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' }} />
        <div style={{ position: 'absolute', inset: 0, background: 'rgba(255,255,255,0.88)' }} />
      </>}
      <div style={{ position: 'relative', zIndex: 1 }}>
        {data.mariageJuif && <div style={{ position: 'absolute', top: -40, right: 0, fontSize: 14, fontFamily: 'serif', color: theme.accent, direction: 'rtl' }}>בס״ד</div>}
        <div style={{ fontFamily: 'var(--font-great-vibes)', fontSize: 52, color: theme.accent, textAlign: 'center', marginBottom: 16 }}>Soirée Henné</div>
        <div style={{ textAlign: 'center', fontSize: 24, letterSpacing: '0.5em', color: theme.accent, marginBottom: 24 }}>❋ ✿ ❀</div>
        <div style={{ fontFamily: 'var(--font-cormorant-garamond)', fontStyle: 'italic', fontSize: 20, textAlign: 'center', color: theme.texte, lineHeight: 1.7, marginBottom: 28 }}>
          Vous êtes chaleureusement invités à célébrer la soirée du henné de<br />
          <span style={{ fontFamily: 'var(--font-great-vibes)', fontSize: 36, color: theme.accent }}>{data.marie1Prenom} & {data.marie2Prenom}</span>
        </div>
        <div style={{ fontFamily: 'var(--font-playfair-display)', fontSize: 22, color: theme.accent, textAlign: 'center', letterSpacing: 3, textTransform: 'uppercase', marginBottom: 12 }}>{formatDateFr(ceremony.date)}</div>
        <div style={{ fontFamily: 'var(--font-playfair-display)', fontSize: 24, color: theme.accent, textAlign: 'center', marginBottom: 16 }}>{formatHeure(ceremony.heure)}</div>
        <div style={{ fontFamily: 'var(--font-cormorant-garamond)', fontStyle: 'italic', fontSize: 20, textAlign: 'center', color: theme.texte }}>
          {ceremony.lieu && <div>{formatLieu(ceremony.lieu)}</div>}
          {ceremony.adresse && <div style={{ fontSize: 14, marginTop: 8, color: theme.textSecondaire }}>{ceremony.adresse}</div>}
        </div>
      </div>
    </div>
  )
}

function CardAutre({ ceremony, data, theme }: CardProps) {
  const name = ceremony.type === 'Autre' ? (ceremony.customName || 'Événement') : ceremony.type
  return (
    <div style={{ backgroundColor: theme.fond, padding: '60px 48px', position: 'relative' }}>
      {data.photoFond && <>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={data.photoFond} alt="" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' }} />
        <div style={{ position: 'absolute', inset: 0, background: 'rgba(255,255,255,0.88)' }} />
      </>}
      <div style={{ position: 'relative', zIndex: 1 }}>
        {data.mariageJuif && <div style={{ position: 'absolute', top: -40, right: 0, fontSize: 14, fontFamily: 'serif', color: theme.accent, direction: 'rtl' }}>בס״ד</div>}
        <div style={{ fontFamily: 'var(--font-great-vibes)', fontSize: 52, color: theme.accent, textAlign: 'center', marginBottom: 20 }}>{name}</div>
        <div style={{ fontFamily: 'var(--font-cormorant-garamond)', fontStyle: 'italic', fontSize: 20, textAlign: 'center', color: theme.texte, lineHeight: 1.7, marginBottom: 28 }}>
          Rejoignez <span style={{ fontFamily: 'var(--font-great-vibes)', fontSize: 32, color: theme.accent }}>{data.marie1Prenom} & {data.marie2Prenom}</span> pour {name.toLowerCase()}
        </div>
        <div style={{ fontFamily: 'var(--font-playfair-display)', fontSize: 22, color: theme.accent, textAlign: 'center', letterSpacing: 3, textTransform: 'uppercase', marginBottom: 12 }}>{formatDateFr(ceremony.date)}</div>
        <div style={{ fontFamily: 'var(--font-playfair-display)', fontSize: 24, color: theme.accent, textAlign: 'center', marginBottom: 16 }}>{formatHeure(ceremony.heure)}</div>
        <div style={{ fontFamily: 'var(--font-cormorant-garamond)', fontStyle: 'italic', fontSize: 20, textAlign: 'center', color: theme.texte }}>
          {ceremony.lieu && <div>{formatLieu(ceremony.lieu)}</div>}
          {ceremony.adresse && <div style={{ fontSize: 14, marginTop: 8, color: theme.textSecondaire }}>{ceremony.adresse}</div>}
        </div>
      </div>
    </div>
  )
}

function renderCard(ceremony: Ceremony, data: FormData, theme: ThemeObj, photoIdx = 0) {
  const photos = data.photosFond ?? []
  const photoFond = photos[photoIdx] ?? photos[photos.length - 1] ?? data.photoFond ?? ''
  const props = { ceremony, data: { ...data, photoFond }, theme }
  if (ceremony.type === 'Mairie') return <CardMairie {...props} />
  if (ceremony.type === 'Cérémonie religieuse / Houppa') return <CardHouppa {...props} />
  if (ceremony.type === 'Henné') return <CardHenne {...props} />
  return <CardAutre {...props} />
}

// ── Style élégant ──────────────────────────────────────────────────────────────

function MonogramSVG({ initial1, initial2, color, size = 220 }: { initial1: string; initial2: string; color: string; size?: number }) {
  return (
    <svg viewBox="0 0 220 220" width={size} height={size} xmlns="http://www.w3.org/2000/svg">
      <circle cx="110" cy="110" r="100" fill="none" stroke={color} strokeWidth="0.8" opacity="0.35" />
      <circle cx="110" cy="110" r="93" fill="none" stroke={color} strokeWidth="0.4" opacity="0.2" />
      <text x="78" y="148" fontFamily="Georgia, 'Times New Roman', serif" fontStyle="italic" fontSize="105" fill={color} fillOpacity="0.9" textAnchor="middle">{initial1 || 'A'}</text>
      <text x="142" y="148" fontFamily="Georgia, 'Times New Roman', serif" fontStyle="italic" fontSize="105" fill={color} fillOpacity="0.9" textAnchor="middle">{initial2 || 'B'}</text>
      <path d="M 28 170 Q 110 163 192 170" fill="none" stroke={color} strokeWidth="0.6" opacity="0.5" />
      <path d="M 38 176 Q 110 169 182 176" fill="none" stroke={color} strokeWidth="0.3" opacity="0.3" />
    </svg>
  )
}

function ElegantSeparator({ color, initial1, initial2 }: { color: string; initial1: string; initial2: string }) {
  return (
    <div style={{ maxWidth: 600, margin: '0 auto', display: 'flex', alignItems: 'center', gap: 14, padding: '20px 24px' }}>
      <div style={{ flex: 1, height: '0.5px', background: color, opacity: 0.45 }} />
      <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
        <span style={{ fontFamily: 'Georgia, serif', fontStyle: 'italic', fontSize: 14, color, opacity: 0.75 }}>{initial1}</span>
        <span style={{ color, opacity: 0.4, fontSize: 9 }}>✦</span>
        <span style={{ fontFamily: 'Georgia, serif', fontStyle: 'italic', fontSize: 14, color, opacity: 0.75 }}>{initial2}</span>
      </div>
      <div style={{ flex: 1, height: '0.5px', background: color, opacity: 0.45 }} />
    </div>
  )
}

function ElegantPage1({ data, theme }: { data: FormData; theme: ThemeObj }) {
  const coverPhoto = (data.photosFond ?? [])[0] ?? data.photoFond ?? ''
  return (
    <div style={{ maxWidth: 600, margin: '0 auto', borderRadius: 4, overflow: 'hidden', boxShadow: '0 8px 40px rgba(0,0,0,0.13)', position: 'relative', height: 560 }}>
      {coverPhoto ? (
        /* eslint-disable-next-line @next/next/no-img-element */
        <img src={coverPhoto} alt="" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' }} />
      ) : (
        <div style={{ position: 'absolute', inset: 0, background: `linear-gradient(160deg, ${theme.fond}, ${theme.accent}22)` }} />
      )}
      <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(0,0,0,0.58) 0%, rgba(0,0,0,0.1) 55%, transparent 100%)' }} />
      <div style={{ position: 'absolute', bottom: 44, left: 40, right: 40 }}>
        <div style={{ fontFamily: 'var(--font-great-vibes)', fontSize: 'clamp(44px, 12vw, 76px)', color: 'white', lineHeight: 1.15, textShadow: '0 2px 24px rgba(0,0,0,0.35)' }}>
          {data.marie1Prenom || 'Prénom'}
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, margin: '4px 0' }}>
          <div style={{ width: 48, height: '0.5px', background: 'rgba(255,255,255,0.6)' }} />
          <span style={{ fontFamily: 'var(--font-great-vibes)', fontSize: 32, color: 'rgba(255,255,255,0.85)' }}>&</span>
        </div>
        <div style={{ fontFamily: 'var(--font-great-vibes)', fontSize: 'clamp(44px, 12vw, 76px)', color: 'white', lineHeight: 1.15, textShadow: '0 2px 24px rgba(0,0,0,0.35)' }}>
          {data.marie2Prenom || 'Prénom'}
        </div>
      </div>
    </div>
  )
}

function ElegantPage2({ data, theme }: { data: FormData; theme: ThemeObj }) {
  const i1 = (data.marie1Prenom || 'A')[0].toUpperCase()
  const i2 = (data.marie2Prenom || 'B')[0].toUpperCase()
  const firstDate = sortByDate(data.ceremonies)[0]?.date
  return (
    <div style={{ maxWidth: 600, margin: '0 auto', borderRadius: 4, overflow: 'hidden', boxShadow: '0 8px 40px rgba(0,0,0,0.13)', backgroundColor: theme.fond, padding: '56px 48px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
      {data.mariageJuif && <div style={{ fontSize: 14, fontFamily: 'serif', color: theme.accent, direction: 'rtl', marginBottom: 20 }}>בס״ד</div>}
      <MonogramSVG initial1={i1} initial2={i2} color={theme.accent} size={200} />
      <div style={{ fontFamily: 'var(--font-great-vibes)', fontSize: 52, color: theme.accent, marginTop: 20, textAlign: 'center', lineHeight: 1.2 }}>
        {data.marie1Prenom} & {data.marie2Prenom}
      </div>
      {firstDate && (
        <div style={{ fontFamily: 'var(--font-playfair-display)', fontSize: 13, color: theme.textSecondaire, letterSpacing: 4, textTransform: 'uppercase', marginTop: 18 }}>
          {formatDateFr(firstDate)}
        </div>
      )}
      <div style={{ fontFamily: 'var(--font-cormorant-garamond)', fontStyle: 'italic', fontSize: 18, color: theme.texte, marginTop: 18, textAlign: 'center', lineHeight: 1.8 }}>
        vous invitent à célébrer leur union
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginTop: 24, opacity: 0.5 }}>
        <div style={{ width: 32, height: '0.5px', background: theme.accent }} />
        <span style={{ color: theme.accent, fontSize: 10 }}>✦</span>
        <div style={{ width: 32, height: '0.5px', background: theme.accent }} />
      </div>
    </div>
  )
}

function ElegantCardsContent({ data, theme }: { data: FormData; theme: ThemeObj }) {
  const sorted = sortByDate(data.ceremonies)
  const i1 = (data.marie1Prenom || 'A')[0].toUpperCase()
  const i2 = (data.marie2Prenom || 'B')[0].toUpperCase()
  const noPhotoData = { ...data, photoFond: '', photosFond: [] }

  return (
    <>
      <ElegantPage1 data={data} theme={theme} />
      <ElegantSeparator color={theme.accent} initial1={i1} initial2={i2} />
      <ElegantPage2 data={data} theme={theme} />
      <ElegantSeparator color={theme.accent} initial1={i1} initial2={i2} />
      {sorted.map((ceremony, i) => (
        <div key={i}>
          <div style={{ maxWidth: 600, margin: '0 auto', borderRadius: 4, boxShadow: '0 8px 40px rgba(0,0,0,0.13)', overflow: 'hidden' }}>
            {renderCard(ceremony, noPhotoData, theme, i)}
          </div>
          {i < sorted.length - 1 && <ElegantSeparator color={theme.accent} initial1={i1} initial2={i2} />}
        </div>
      ))}
    </>
  )
}

// ── RSVP ──────────────────────────────────────────────────────────────────────

interface RSVPData {
  nom: string
  nbPersonnes: string
  presence: boolean | null
  evenements: string[]
  message: string
}

interface RSVPResponse {
  nom: string
  presence: boolean | null
  nbPersonnes: string
  message?: string
  sentAt?: string
}

function RSVPModal({ accent, onClose, mariee1, mariee2, shareId, ceremonies }: { accent: string; onClose: () => void; mariee1: string; mariee2: string; shareId: string | null; ceremonies: Ceremony[] }) {
  const [rsvp, setRsvp] = useState<RSVPData>({ nom: '', nbPersonnes: '0', presence: null, evenements: [], message: '' })
  const [sent, setSent] = useState(false)
  const [loading, setLoading] = useState(false)

  const disabled = !rsvp.nom || rsvp.presence === null

  const send = async () => {
    if (disabled) return
    setLoading(true)
    try {
      await fetch('/api/rsvp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...rsvp, mariee1, mariee2, shareId, sentAt: new Date().toISOString() }),
      })
      setSent(true)
    } catch {
      alert("Erreur lors de l'envoi")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 200, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 }}>
      <div onClick={onClose} style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.55)' }} />
      <div style={{ position: 'relative', background: 'white', borderRadius: 20, padding: 36, width: '100%', maxWidth: 480, boxShadow: '0 24px 64px rgba(0,0,0,0.2)' }}>
        <button onClick={onClose} style={{ ...BTN, position: 'absolute', top: 16, right: 16, background: 'none', border: 'none', fontSize: 20, color: '#9ca3af' }}>✕</button>

        {sent ? (
          <div style={{ textAlign: 'center', padding: '24px 0' }}>
            <div style={{ fontSize: 48, marginBottom: 16 }}>💌</div>
            <div style={{ fontFamily: 'Georgia, serif', fontStyle: 'italic', fontSize: 22, color: accent, marginBottom: 12 }}>Merci !</div>
            <p style={{ fontSize: 15, color: '#6a5040', lineHeight: 1.7 }}>
              Votre réponse a bien été transmise à {mariee1} & {mariee2}.
            </p>
            <button onClick={onClose} style={{ ...BTN, marginTop: 24, padding: '12px 32px', borderRadius: 9999, background: accent, color: 'white', border: 'none', fontSize: 14 }}>Fermer</button>
          </div>
        ) : (
          <>
            <div style={{ fontFamily: 'Georgia, serif', fontStyle: 'italic', fontSize: 24, color: accent, textAlign: 'center', marginBottom: 6 }}>RSVP</div>
            <div style={{ fontFamily: 'Georgia, serif', fontStyle: 'italic', fontSize: 14, color: '#9ca3af', textAlign: 'center', marginBottom: 28 }}>
              {mariee1} & {mariee2}
            </div>

            <div style={{ marginBottom: 16 }}>
              <Label>Prénom et nom</Label>
              <input value={rsvp.nom} onChange={e => setRsvp(r => ({ ...r, nom: e.target.value }))} placeholder="Marie Dupont" style={S.input} />
            </div>

            <div style={{ marginBottom: 20 }}>
              <Label>Votre réponse</Label>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                <button type="button" onClick={() => setRsvp(r => ({ ...r, presence: true }))} style={{
                  ...BTN,
                  padding: '14px 12px', borderRadius: 12, fontSize: 13, fontWeight: 600,
                  border: `2px solid ${rsvp.presence === true ? accent : '#fecdd3'}`,
                  background: rsvp.presence === true ? accent : 'white',
                  color: rsvp.presence === true ? 'white' : '#4a3728',
                }}>
                  Je serai présent(e) ✓
                </button>
                <button type="button" onClick={() => setRsvp(r => ({ ...r, presence: false }))} style={{
                  ...BTN,
                  padding: '14px 12px', borderRadius: 12, fontSize: 13, fontWeight: 600,
                  border: `2px solid ${rsvp.presence === false ? '#fb7185' : '#fecdd3'}`,
                  background: rsvp.presence === false ? '#fb7185' : 'white',
                  color: rsvp.presence === false ? 'white' : '#4a3728',
                }}>
                  Je ne pourrai pas être là ✗
                </button>
              </div>
            </div>

            <div style={{ marginBottom: 16 }}>
              <Label>Combien de personnes vous accompagnent ?</Label>
              <input type="number" min="0" max="10" value={rsvp.nbPersonnes} onChange={e => setRsvp(r => ({ ...r, nbPersonnes: e.target.value }))} style={S.input} />
            </div>

            {ceremonies.length > 1 && (
              <div style={{ marginBottom: 16 }}>
                <Label>À quel(s) événement(s) serez-vous présent(e) ?</Label>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginTop: 4 }}>
                  {ceremonies.map((c, i) => {
                    const label = c.type === 'Autre' ? (c.customName || 'Événement') : c.type
                    const key = `${label}${c.date ? ' – ' + formatDateFrCap(c.date) : ''}`
                    const checked = rsvp.evenements.includes(key)
                    return (
                      <label key={i} style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer', fontSize: 13, color: '#4a3728', padding: '8px 12px', borderRadius: 8, border: `1px solid ${checked ? accent : '#fecdd3'}`, background: checked ? `${accent}11` : 'white' }}>
                        <input type="checkbox" checked={checked} onChange={() => setRsvp(r => ({
                          ...r,
                          evenements: checked ? r.evenements.filter(e => e !== key) : [...r.evenements, key]
                        }))} style={{ accentColor: accent }} />
                        <span>{label}{c.date ? <span style={{ color: '#9ca3af', fontSize: 11 }}> – {formatDateFrCap(c.date)}</span> : null}</span>
                      </label>
                    )
                  })}
                </div>
              </div>
            )}

            <div style={{ marginBottom: 24 }}>
              <Label>Un petit mot pour les mariés (optionnel)</Label>
              <textarea value={rsvp.message} onChange={e => setRsvp(r => ({ ...r, message: e.target.value }))} placeholder="Avec toute notre affection..." rows={3} style={{ ...S.input, resize: 'vertical', lineHeight: 1.6 } as React.CSSProperties} />
            </div>

            <button type="button" onClick={send} disabled={disabled || loading} style={{
              ...BTN,
              width: '100%', padding: '15px 0', borderRadius: 9999, border: 'none',
              background: disabled ? '#e5e7eb' : `linear-gradient(135deg, ${accent}, ${accent}cc)`,
              color: disabled ? '#9ca3af' : 'white',
              fontSize: 15, fontWeight: 700,
              cursor: disabled ? 'not-allowed' : 'pointer',
              boxShadow: disabled ? 'none' : `0 6px 20px ${accent}44`,
            }}>
              {loading ? 'Envoi...' : 'Envoyer ma réponse'}
            </button>
          </>
        )}
      </div>
    </div>
  )
}

function RSVPListModal({ accent, onClose, shareId }: { accent: string; onClose: () => void; shareId: string | null }) {
  const [responses, setResponses] = useState<RSVPResponse[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!shareId) { setLoading(false); return }
    fetch(`/api/get-rsvp?shareId=${shareId}`)
      .then(r => r.json())
      .then((d: RSVPResponse[]) => setResponses(Array.isArray(d) ? d : []))
      .catch(() => setResponses([]))
      .finally(() => setLoading(false))
  }, [shareId])

  const totalPresents = responses.filter(r => r.presence === true).reduce((sum, r) => sum + 1 + (parseInt(r.nbPersonnes) || 0), 0)

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 200, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 }}>
      <div onClick={onClose} style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.55)' }} />
      <div style={{ position: 'relative', background: 'white', borderRadius: 20, padding: 32, width: '100%', maxWidth: 600, maxHeight: '80vh', overflow: 'hidden', display: 'flex', flexDirection: 'column', boxShadow: '0 24px 64px rgba(0,0,0,0.2)' }}>
        <button onClick={onClose} style={{ ...BTN, position: 'absolute', top: 16, right: 16, background: 'none', border: 'none', fontSize: 20, color: '#9ca3af' }}>✕</button>
        <div style={{ fontFamily: 'Georgia, serif', fontStyle: 'italic', fontSize: 22, color: accent, textAlign: 'center', marginBottom: 24 }}>Réponses RSVP</div>
        <div style={{ overflowY: 'auto', flex: 1 }}>
          {loading ? (
            <div style={{ textAlign: 'center', color: '#9ca3af', padding: 32 }}>Chargement...</div>
          ) : responses.length === 0 ? (
            <div style={{ textAlign: 'center', color: '#9ca3af', padding: 32, fontStyle: 'italic' }}>Aucune réponse pour le moment</div>
          ) : (
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 14 }}>
              <thead>
                <tr style={{ borderBottom: `2px solid ${accent}33` }}>
                  <th style={{ padding: '10px 12px', textAlign: 'left', color: accent, fontWeight: 700, fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.1em' }}>Nom</th>
                  <th style={{ padding: '10px 12px', textAlign: 'center', color: accent, fontWeight: 700, fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.1em' }}>Présence</th>
                  <th style={{ padding: '10px 12px', textAlign: 'center', color: accent, fontWeight: 700, fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.1em' }}>Accompagnants</th>
                  <th style={{ padding: '10px 12px', textAlign: 'left', color: accent, fontWeight: 700, fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.1em' }}>Message</th>
                </tr>
              </thead>
              <tbody>
                {responses.map((r, i) => (
                  <tr key={i} style={{ borderBottom: '1px solid #fce7f3', background: i % 2 === 0 ? 'white' : '#fdf8f9' }}>
                    <td style={{ padding: '12px', color: '#4a3728', fontWeight: 500 }}>{r.nom}</td>
                    <td style={{ padding: '12px', textAlign: 'center', fontSize: 18 }}>{r.presence === true ? '✓' : r.presence === false ? '✗' : '—'}</td>
                    <td style={{ padding: '12px', textAlign: 'center', color: '#6a5040' }}>{r.nbPersonnes || '0'}</td>
                    <td style={{ padding: '12px', color: '#6a5040', fontStyle: 'italic', fontSize: 13 }}>{r.message || '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
        {!loading && responses.length > 0 && (
          <div style={{ marginTop: 20, paddingTop: 16, borderTop: `1px solid ${accent}33`, textAlign: 'right', color: '#4a3728', fontSize: 14 }}>
            Total présents (avec accompagnants) : <span style={{ color: accent, fontWeight: 700, fontSize: 16 }}>{totalPresents}</span>
          </div>
        )}
      </div>
    </div>
  )
}

// ── Music Upload (Cloudinary) ──────────────────────────────────────────────────

function MusicUploader({ musicUrl, onChange }: { musicUrl: string; onChange: (url: string) => void }) {
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState('')

  const upload = async (file: File) => {
    setUploading(true)
    setError('')
    try {
      const fd = new FormData()
      fd.append('file', file)
      fd.append('upload_preset', 'wedding_music')
      const res = await fetch('https://api.cloudinary.com/v1_1/wedding-app-music/video/upload', { method: 'POST', body: fd })
      const json = await res.json()
      if (json.secure_url) {
        onChange(json.secure_url)
      } else {
        setError("Erreur upload : " + (json.error?.message ?? 'inconnu'))
      }
    } catch (e) {
      setError("Erreur réseau : " + (e instanceof Error ? e.message : String(e)))
    } finally {
      setUploading(false)
    }
  }

  if (musicUrl) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 14px', border: '1px solid #C9A84C44', borderRadius: 10, background: '#fdf5e4' }}>
        <span style={{ fontSize: 18 }}>🎵</span>
        <span style={{ flex: 1, fontSize: 12, color: '#4a3728', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>Musique uploadée</span>
        <button type="button" onClick={() => onChange('')} style={{ ...BTN, background: 'none', border: 'none', color: '#fb7185', fontSize: 13 }}>✕ Supprimer</button>
      </div>
    )
  }

  return (
    <div>
      <label style={{ display: 'block', cursor: uploading ? 'wait' : 'pointer' }}>
        <div style={{ border: '2px dashed #C9A84C66', borderRadius: 10, padding: 20, textAlign: 'center', background: uploading ? '#fdf5e4' : 'white' }}>
          <div style={{ fontSize: 24, marginBottom: 6 }}>{uploading ? '⏳' : '🎵'}</div>
          <p style={{ fontSize: 13, color: '#4a3728', margin: 0 }}>{uploading ? 'Upload en cours…' : 'Cliquer pour uploader un fichier MP3'}</p>
          <p style={{ fontSize: 11, color: '#9ca3af', marginTop: 4 }}>Format MP3, max 10 Mo</p>
        </div>
        <input type="file" accept="audio/mp3,audio/mpeg,audio/*" disabled={uploading} onChange={e => { const f = e.target.files?.[0]; if (f) upload(f); e.target.value = '' }} style={{ display: 'none' }} />
      </label>
      {error && <p style={{ fontSize: 12, color: '#fb7185', marginTop: 6 }}>{error}</p>}
    </div>
  )
}

// ── AudioPlayer HTML5 ──────────────────────────────────────────────────────────

function AudioPlayer({ musicUrl, accent }: { musicUrl: string; accent: string }) {
  const audioRef = useRef<HTMLAudioElement>(null)
  const [muted, setMuted] = useState(false)
  const [needsInteraction, setNeedsInteraction] = useState(false)
  const [started, setStarted] = useState(false)

  useEffect(() => {
    const audio = audioRef.current
    if (!audio) return
    audio.play().then(() => setStarted(true)).catch(() => setNeedsInteraction(true))
  }, [])

  const toggleMute = () => {
    if (!audioRef.current) return
    audioRef.current.muted = !muted
    setMuted(m => !m)
  }

  const startMusic = () => {
    if (!audioRef.current) return
    audioRef.current.play().then(() => { setStarted(true); setNeedsInteraction(false) }).catch(() => {})
  }

  return (
    <>
      {/* eslint-disable-next-line jsx-a11y/media-has-caption */}
      <audio ref={audioRef} src={musicUrl} loop autoPlay style={{ display: 'none' }} />

      {needsInteraction && !started && (
        <button
          onClick={startMusic}
          onTouchEnd={e => { e.preventDefault(); startMusic() }}
          style={{
            ...BTN,
            position: 'fixed', bottom: 24, right: 72, zIndex: 50,
            background: `${accent}dd`, color: 'white', border: 'none',
            borderRadius: 9999, padding: '11px 18px',
            fontSize: 14, fontWeight: 600, letterSpacing: '0.05em',
            boxShadow: '0 4px 20px rgba(0,0,0,0.22)',
          }}
        >
          ♪ Lancer la musique
        </button>
      )}

      {(started || !needsInteraction) && (
        <button
          onClick={toggleMute}
          onTouchEnd={e => { e.preventDefault(); toggleMute() }}
          style={{ ...BTN, position: 'fixed', bottom: 24, right: 24, zIndex: 50, width: 40, height: 40, borderRadius: '50%', background: accent, color: 'white', border: 'none', fontSize: 16, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
        >
          {muted ? '🔇' : '🔊'}
        </button>
      )}
    </>
  )
}

// ── Splash + Music ─────────────────────────────────────────────────────────────

function SplashScreen({ data, theme, onDone, isShared }: { data: FormData; theme: ThemeObj; onDone: () => void; isShared: boolean }) {
  const [out, setOut] = useState(false)
  const firstDate = sortByDate(data.ceremonies)[0]?.date
  const done = useCallback(() => { setOut(true); setTimeout(onDone, 600) }, [onDone])
  useEffect(() => { if (!isShared) { const t = setTimeout(done, 2200); return () => clearTimeout(t) } }, [isShared, done])
  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 100, backgroundColor: theme.fond, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', opacity: out ? 0 : 1, transition: 'opacity 0.6s ease', pointerEvents: out ? 'none' : 'auto' }}>
      <div style={{ fontFamily: 'var(--font-great-vibes)', fontSize: 'clamp(48px, 12vw, 96px)', color: theme.accent, textAlign: 'center', lineHeight: 1.2 }}>
        {data.marie1Prenom || 'Prénom'}<br />&amp;<br />{data.marie2Prenom || 'Prénom'}
      </div>
      {firstDate && <div style={{ fontFamily: 'var(--font-playfair-display)', fontSize: 14, color: theme.textSecondaire, letterSpacing: 3, marginTop: 24, textTransform: 'uppercase' }}>{formatDateFr(firstDate)}</div>}
      {isShared && (
        <button onClick={done} style={{ ...BTN, marginTop: 48, padding: '16px 40px', border: `1px solid ${theme.accent}`, borderRadius: 9999, background: 'transparent', color: theme.accent, fontSize: 16, fontFamily: 'var(--font-playfair-display)' }}>
          Découvrir votre faire-part
        </button>
      )}
    </div>
  )
}

function MusicPlayer({ youtubeUrl, accent }: { youtubeUrl: string; accent: string }) {
  const [mobile, setMobile] = useState(false)
  const [playerOpen, setPlayerOpen] = useState(false)
  const [muted, setMuted] = useState(false)
  const [desktopKey, setDesktopKey] = useState(0)
  const id = getYouTubeId(youtubeUrl)

  useEffect(() => {
    setMobile(/iPhone|iPad|iPod|Android/i.test(navigator.userAgent))
  }, [])

  if (!id) return null

  // ── Mobile : bouton fixe + popup lecteur 300×80 ──────────────────────────
  if (mobile) {
    return (
      <>
        {/* iframe 1×1 visible — tente l'autoplay en arrière-plan sur iOS */}
        <iframe
          src={`https://www.youtube.com/embed/${id}?autoplay=1&loop=1&playlist=${id}&controls=0&mute=1`}
          style={{ position: 'fixed', bottom: 0, right: 0, width: 1, height: 1, opacity: 0.01, border: 'none', pointerEvents: 'none' }}
          allow="autoplay; encrypted-media"
          title="music-bg"
        />

        {/* Bouton élégant fixe */}
        <button
          onTouchEnd={e => { e.preventDefault(); setPlayerOpen(o => !o) }}
          onClick={() => setPlayerOpen(o => !o)}
          style={{
            ...BTN,
            position: 'fixed', bottom: 24, right: 24, zIndex: 50,
            background: playerOpen ? accent : `${accent}dd`,
            color: 'white', border: 'none', borderRadius: 9999,
            padding: '11px 18px', fontSize: 14, fontWeight: 600,
            letterSpacing: '0.05em',
            boxShadow: '0 4px 20px rgba(0,0,0,0.22)',
            display: 'flex', alignItems: 'center', gap: 6,
          }}
        >
          ♪ Musique
        </button>

        {/* Popup lecteur YouTube 300×80 */}
        {playerOpen && (
          <div style={{
            position: 'fixed', bottom: 76, right: 16, zIndex: 51,
            borderRadius: 14, overflow: 'hidden',
            boxShadow: '0 8px 36px rgba(0,0,0,0.28)',
            width: 300, height: 80,
          }}>
            <iframe
              src={`https://www.youtube.com/embed/${id}?autoplay=1&loop=1&playlist=${id}&controls=1`}
              width="300"
              height="80"
              allow="autoplay; encrypted-media"
              style={{ display: 'block', border: 'none' }}
              title="music-player"
            />
          </div>
        )}
      </>
    )
  }

  // ── Desktop : iframe cachée + bouton mute ────────────────────────────────
  return (
    <>
      <iframe
        key={desktopKey}
        src={`https://www.youtube.com/embed/${id}?autoplay=1&loop=1&playlist=${id}&controls=0&mute=${muted ? 1 : 0}`}
        style={{ position: 'fixed', top: -9999, opacity: 0, pointerEvents: 'none', width: 1, height: 1 }}
        allow="autoplay"
        title="music"
      />
      <button
        onClick={() => { setMuted(m => !m); setDesktopKey(k => k + 1) }}
        style={{ ...BTN, position: 'fixed', bottom: 24, right: 24, width: 40, height: 40, borderRadius: '50%', background: accent, color: 'white', border: 'none', zIndex: 50, fontSize: 16, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
      >
        {muted ? '🔇' : '🔊'}
      </button>
    </>
  )
}

// ── CardsView ─────────────────────────────────────────────────────────────────

function CardsView({ data, onEdit, onReset, isShared }: { data: FormData; onEdit: () => void; onReset: () => void; isShared: boolean }) {
  const theme = THEMES[data.style]
  const sorted = sortByDate(data.ceremonies)
  const [splashDone, setSplashDone] = useState(false)
  const [active, setActive] = useState(0)
  const [rsvpOpen, setRsvpOpen] = useState(false)
  const [rsvpListOpen, setRsvpListOpen] = useState(false)
  const [lastShareId, setLastShareId] = useState<string | null>(null)
  const [shareFeedback, setShareFeedback] = useState(false)
  const [shareUrl, setShareUrl] = useState<string | null>(null)
  const refs = useRef<(HTMLDivElement | null)[]>([])
  const isElegant = data.presentationStyle === 'elegant'

  useEffect(() => {
    if (isShared) {
      const id = new URLSearchParams(window.location.search).get('share')
      if (id) setLastShareId(id)
    }
  }, [isShared])

  useEffect(() => {
    if (!splashDone) return
    const obs = refs.current.map((r, i) => {
      if (!r) return null
      const o = new IntersectionObserver(e => { if (e[0].isIntersecting) setActive(i) }, { threshold: 0.4 })
      o.observe(r)
      return o
    })
    return () => obs.forEach(o => o?.disconnect())
  }, [splashDone, sorted.length])

  const handleShare = async () => {
    try {
      const res = await fetch('/api/save-share', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data) })
      const json = await res.json()
      console.log('save-share response:', json)
      if (!json.id) throw new Error('Pas d\'id retourné : ' + JSON.stringify(json))
      const id = json.id
      setLastShareId(id)
      const url = window.location.origin + '/faire-part?share=' + id
      setShareUrl(url)
      try {
        await navigator.clipboard.writeText(url)
        setShareFeedback(true)
        setTimeout(() => setShareFeedback(false), 3000)
      } catch {
        // clipboard échouée — le lien reste affiché dans l'UI
      }
    } catch (err) {
      console.error('handleShare erreur:', err)
      alert('Erreur : ' + (err instanceof Error ? err.message : String(err)))
    }
  }

  return (
    <div style={{ backgroundColor: theme.fond, minHeight: '100vh', color: theme.texte }}>
      {!splashDone && <SplashScreen data={data} theme={theme} onDone={() => setSplashDone(true)} isShared={isShared} />}
      {splashDone && <>
        {!isElegant && (
          <div style={{ position: 'fixed', left: 16, top: '50%', transform: 'translateY(-50%)', display: 'flex', flexDirection: 'column', gap: 10, zIndex: 40 }}>
            {sorted.map((_, i) => (
              <button key={i} onClick={() => refs.current[i]?.scrollIntoView({ behavior: 'smooth' })} style={{ ...BTN, width: 10, height: 10, borderRadius: '50%', border: `1.5px solid ${theme.accent}`, background: active === i ? theme.accent : 'transparent', padding: 0 }} />
            ))}
          </div>
        )}
        <div style={{ padding: '40px 20px 80px' }}>
          {isElegant ? (
            <ElegantCardsContent data={data} theme={theme} />
          ) : (
            sorted.map((ceremony, i) => (
              <div key={i}>
                <div ref={el => { refs.current[i] = el }} style={{ maxWidth: 600, margin: '0 auto', borderRadius: 4, boxShadow: '0 8px 40px rgba(0,0,0,0.13)', overflow: 'hidden' }}>
                  {renderCard(ceremony, data, theme, i)}
                </div>
                {i < sorted.length - 1 && (
                  <div style={{ maxWidth: 600, margin: '32px auto', display: 'flex', alignItems: 'center', gap: 12 }}>
                    <div style={{ flex: 1, height: 1, background: theme.accent, opacity: 0.3 }} />
                    <span style={{ color: theme.accent }}>✦</span>
                    <div style={{ flex: 1, height: 1, background: theme.accent, opacity: 0.3 }} />
                  </div>
                )}
              </div>
            ))
          )}

          {/* Bouton RSVP doré — visible uniquement en vue partagée */}
          {isShared && (
            <div style={{ maxWidth: 600, margin: '40px auto 0', display: 'flex', justifyContent: 'center' }}>
              <button onClick={() => setRsvpOpen(true)} style={{
                ...BTN,
                padding: '15px 48px', borderRadius: 9999,
                background: 'linear-gradient(135deg, #C9A84C, #e8c96a)',
                color: 'white', border: 'none',
                fontSize: 16, fontWeight: 700, letterSpacing: '0.12em',
                boxShadow: '0 6px 28px rgba(201,168,76,0.45)',
                fontFamily: 'var(--font-playfair-display)',
              }}>
                RSVP
              </button>
            </div>
          )}

          {!isShared && (
            <div style={{ maxWidth: 600, margin: '40px auto 0' }}>
              <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
                <button onClick={onEdit} style={{ ...BTN, padding: '12px 28px', borderRadius: 9999, border: `1px solid ${theme.accent}`, background: 'transparent', color: theme.accent, fontSize: 14 }}>Modifier</button>
                <button onClick={handleShare} style={{ ...BTN, padding: '12px 28px', borderRadius: 9999, background: shareFeedback ? '#22c55e' : theme.accent, color: 'white', border: 'none', fontSize: 14, transition: 'background 0.3s' }}>{shareFeedback ? '✓ Lien copié !' : '🔗 Partager'}</button>
                {lastShareId && (
                  <button onClick={() => setRsvpListOpen(true)} style={{ ...BTN, padding: '12px 28px', borderRadius: 9999, border: `1px solid ${theme.accent}`, background: 'transparent', color: theme.accent, fontSize: 14 }}>📋 Voir les RSVP</button>
                )}
                <button onClick={onReset} style={{ ...BTN, padding: '12px 28px', borderRadius: 9999, border: '1px solid #fecdd3', background: 'transparent', color: '#fb7185', fontSize: 14 }}>Nouveau</button>
              </div>
              {shareUrl && (
                <div style={{ marginTop: 16, padding: '12px 16px', background: `${theme.accent}11`, border: `1px solid ${theme.accent}44`, borderRadius: 10 }}>
                  <div style={{ fontSize: 11, color: theme.accent, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 6 }}>Lien à envoyer à tes invités</div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <input
                      readOnly
                      value={shareUrl}
                      onFocus={e => e.target.select()}
                      style={{ flex: 1, fontSize: 12, color: theme.texte, background: 'white', border: `1px solid ${theme.accent}33`, borderRadius: 6, padding: '8px 10px', outline: 'none' }}
                    />
                    <button onClick={() => {
                      navigator.clipboard.writeText(shareUrl).catch(() => {
                        const ta = document.createElement('textarea')
                        ta.value = shareUrl
                        ta.style.position = 'fixed'
                        ta.style.opacity = '0'
                        document.body.appendChild(ta)
                        ta.focus(); ta.select()
                        document.execCommand('copy')
                        document.body.removeChild(ta)
                      })
                      setShareFeedback(true)
                      setTimeout(() => setShareFeedback(false), 3000)
                    }} style={{ ...BTN, padding: '8px 14px', borderRadius: 6, background: theme.accent, color: 'white', border: 'none', fontSize: 12, whiteSpace: 'nowrap' }}>
                      {shareFeedback ? '✓' : 'Copier'}
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
        {data.musicUrl ? <AudioPlayer musicUrl={data.musicUrl} accent={theme.accent} /> : data.youtubeUrl && <MusicPlayer youtubeUrl={data.youtubeUrl} accent={theme.accent} />}
      </>}

      {rsvpOpen && (
        <RSVPModal
          accent={theme.accent}
          onClose={() => setRsvpOpen(false)}
          mariee1={data.marie1Prenom}
          mariee2={data.marie2Prenom}
          shareId={lastShareId}
          ceremonies={sorted}
        />
      )}
      {rsvpListOpen && (
        <RSVPListModal
          accent={theme.accent}
          onClose={() => setRsvpListOpen(false)}
          shareId={lastShareId}
        />
      )}
    </div>
  )
}

// ── Page principale ────────────────────────────────────────────────────────────

export default function FairePartPage() {
  const [step, setStep] = useState(1)
  const [formData, setFormData] = useState<FormData>(defaultFormData)
  const [showCards, setShowCards] = useState(false)
  const [isShared, setIsShared] = useState(false)
  const [loadingShare, setLoadingShare] = useState(false)
  // Prevents double-firing when both onTouchEnd and onClick trigger
  const lastTap = useRef(0)

  useEffect(() => {
    const id = new URLSearchParams(window.location.search).get('share')
    if (id) {
      setIsShared(true)
      setLoadingShare(true)
      fetch(`/api/get-share?id=${id}`)
        .then(r => r.json())
        .then((d: FormData) => { setFormData(d); setShowCards(true) })
        .catch(() => { setLoadingShare(false) })
        .finally(() => setLoadingShare(false))
    }
  }, [])

  const update = useCallback((u: Partial<FormData>) => setFormData(p => ({ ...p, ...u })), [])

  const next = useCallback(() => {
    if (step < 4) setStep(s => s + 1)
    else setShowCards(true)
  }, [step])

  const prev = useCallback(() => setStep(s => s - 1), [])

  // onTouchEnd handler: fires immediately on touch release (bypasses iOS delays)
  // e.preventDefault() stops the subsequent click event so the action only runs once
  const onTouchNext = useCallback((e: React.TouchEvent) => {
    e.preventDefault()
    const now = Date.now()
    if (now - lastTap.current < 500) return
    lastTap.current = now
    next()
  }, [next])

  const onTouchPrev = useCallback((e: React.TouchEvent) => {
    e.preventDefault()
    const now = Date.now()
    if (now - lastTap.current < 500) return
    lastTap.current = now
    prev()
  }, [prev])

  if (showCards) return <CardsView data={formData} onEdit={() => { setShowCards(false); setStep(4) }} onReset={() => { setFormData(defaultFormData); setShowCards(false); setStep(1) }} isShared={isShared} />

  if (loadingShare) return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'linear-gradient(160deg, #fdf0f3 0%, #fff5f7 50%, #fdf0f3 100%)' }}>
      <div style={{ textAlign: 'center' }}>
        <div style={{ fontFamily: 'Georgia, serif', fontStyle: 'italic', fontSize: 28, color: '#C9A84C', marginBottom: 16 }}>Chargement…</div>
        <div style={{ width: 40, height: 1, background: '#C9A84C', opacity: 0.4, margin: '0 auto' }} />
      </div>
    </div>
  )

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'flex-start', padding: '48px 16px', background: 'linear-gradient(160deg, #fdf0f3 0%, #fff5f7 50%, #fdf0f3 100%)' }}>
      <div style={{ textAlign: 'center', marginBottom: 36 }}>
        <p style={{ fontSize: 9, textTransform: 'uppercase', letterSpacing: '0.3em', color: 'rgba(201,168,76,0.65)', fontWeight: 600, marginBottom: 10 }}>Invitation de mariage</p>
        <h1 style={{ fontFamily: 'Georgia, serif', fontSize: '2.2rem', fontWeight: 300, color: 'rgba(74,55,40,0.7)', letterSpacing: '0.06em', margin: '0 0 12px' }}>Votre faire-part</h1>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 12 }}>
          <div style={{ width: 40, height: 1, background: 'rgba(201,168,76,0.3)' }} />
          <span style={{ color: 'rgba(201,168,76,0.4)' }}>✦</span>
          <div style={{ width: 40, height: 1, background: 'rgba(201,168,76,0.3)' }} />
        </div>
      </div>
      <div style={{ width: '100%', maxWidth: 600, background: 'white', borderRadius: 20, padding: '32px 24px', boxShadow: '0 12px 48px rgba(0,0,0,0.07)', border: '1px solid #fce7f3', boxSizing: 'border-box' }}>
        <ProgressBar step={step} />
        {step === 1 && <Step1 data={formData} onChange={update} />}
        {step === 2 && <Step2 data={formData} onChange={update} />}
        {step === 3 && <Step3 data={formData} onChange={update} />}
        {step === 4 && <Step4 data={formData} onChange={update} />}
        <div style={{ display: 'flex', gap: 12, marginTop: 32, position: 'relative', zIndex: 1 }}>
          {step > 1 && (
            <button
              type="button"
              onClick={prev}
              onTouchEnd={onTouchPrev}
              style={{ ...BTN, flex: 1, padding: '18px 0', borderRadius: 9999, border: '1.5px solid #fecdd3', background: 'white', color: '#fb7185', fontSize: 14, fontWeight: 600 }}
            >← Précédent</button>
          )}
          <button
            type="button"
            onClick={next}
            onTouchEnd={onTouchNext}
            style={{ ...BTN, flex: 1, padding: '18px 0', borderRadius: 9999, border: 'none', background: step === 4 ? 'linear-gradient(135deg, #C9A84C, #e8c96a)' : 'linear-gradient(135deg, #fb7185, #f43f5e)', color: 'white', fontSize: 14, fontWeight: 700, boxShadow: '0 6px 20px rgba(251,113,133,0.35)' }}
          >
            {step === 4 ? 'Générer ✦' : 'Suivant →'}
          </button>
        </div>
      </div>
    </div>
  )
}
