'use client'

import { useState, useEffect, useRef, useCallback } from 'react'

type Theme = 'classique-dore' | 'moderne' | 'champetre' | 'oriental'

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
  evenementSuivant: string
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
  mariageJuif: boolean
  youtubeUrl: string
  photoFond: string
}

const defaultCeremony: Ceremony = {
  type: 'Cérémonie religieuse / Houppa',
  customName: '', lieu: '', adresse: '', date: '', heure: '',
  suiviDAutre: false, evenementSuivant: '',
}

const defaultFormData: FormData = {
  marie1Prenom: '', marie1Nom: '', marie1Prenom2: '',
  marie2Prenom: '', marie2Nom: '', marie2Prenom2: '',
  famille1Pere: '', famille1Mere: '', famille1GpPaternels: '', famille1GpMaternels: '',
  famille2Pere: '', famille2Mere: '', famille2GpPaternels: '', famille2GpMaternels: '',
  ceremonies: [{ ...defaultCeremony }],
  style: 'classique-dore', mariageJuif: false, youtubeUrl: '', photoFond: '',
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
              <button type="button" onClick={() => remove(i)} style={{ background: 'none', border: 'none', color: '#fb7185', cursor: 'pointer', fontSize: 12 }}>Supprimer</button>
            )}
          </div>
          <Label>Type</Label>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 16 }}>
            {CEREMONY_TYPES.map(t => (
              <button key={t} type="button" onClick={() => update(i, { type: t })} style={{
                padding: '6px 14px', borderRadius: 9999, fontSize: 12, cursor: 'pointer',
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
              {c.suiviDAutre && <Field label="Lequel ?" value={c.evenementSuivant} onChange={v => update(i, { evenementSuivant: v })} placeholder="Henné à la salle Michkenot Israël, 6 rue Jean Nohain Paris 75019" />}
            </div>
          )}
        </div>
      ))}
      {data.ceremonies.length < 6 && (
        <button type="button" onClick={add} style={{
          width: '100%', padding: 12, border: '2px dashed #C9A84C', borderRadius: 10,
          background: 'transparent', color: '#C9A84C', cursor: 'pointer', fontSize: 14,
        }}>+ Ajouter un événement</button>
      )}
    </div>
  )
}

function Step4({ data, onChange }: { data: FormData; onChange: (d: Partial<FormData>) => void }) {
  return (
    <div>
      <h2 style={{ textAlign: 'center', fontSize: 22, fontWeight: 600, color: '#4a3728', marginBottom: 24 }}>Style & options</h2>
      <Label>Style visuel</Label>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 24 }}>
        {(Object.entries(THEMES) as [Theme, typeof THEMES[Theme]][]).map(([key, t]) => (
          <button key={key} type="button" onClick={() => onChange({ style: key })} style={{
            padding: 16, borderRadius: 12, border: `2px solid ${data.style === key ? t.accent : '#fecdd3'}`,
            background: t.fond, cursor: 'pointer', textAlign: 'left', position: 'relative',
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
        <Label>Musique de fond (lien YouTube)</Label>
        <input type="url" value={data.youtubeUrl} onChange={e => onChange({ youtubeUrl: e.target.value })} placeholder="https://www.youtube.com/watch?v=..." style={S.input} />
        <p style={{ fontSize: 11, color: '#9ca3af', marginTop: 4 }}>La musique jouera à l'ouverture de la carte</p>
      </div>
      <div>
        <Label>Photo de fond (optionnel)</Label>
        <label style={{ display: 'block', cursor: 'pointer' }}>
          <div style={{ border: '2px dashed #fecdd3', borderRadius: 10, padding: 24, textAlign: 'center' }}>
            <div style={{ fontSize: 24, marginBottom: 8 }}>📷</div>
            <p style={{ fontSize: 13, color: '#4a3728' }}>Cliquer pour choisir une photo</p>
          </div>
          <input type="file" accept="image/*" onChange={e => {
            const f = e.target.files?.[0]
            if (!f) return
            const r = new FileReader()
            r.onload = ev => onChange({ photoFond: ev.target?.result as string })
            r.readAsDataURL(f)
          }} style={{ display: 'none' }} />
        </label>
        {data.photoFond && (
          <div style={{ marginTop: 12, position: 'relative' }}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={data.photoFond} alt="" style={{ width: '100%', height: 120, objectFit: 'cover', borderRadius: 10 }} />
            <button type="button" onClick={() => onChange({ photoFond: '' })} style={{ position: 'absolute', top: 8, right: 8, background: 'white', border: 'none', borderRadius: '50%', width: 24, height: 24, cursor: 'pointer', color: '#fb7185' }}>✕</button>
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
            {data.famille1GpPaternels && <div>{data.famille1GpPaternels}</div>}
            {data.famille1GpMaternels && <div>{data.famille1GpMaternels}</div>}
          </div>
          <div style={{ width: 1, background: theme.accent, opacity: 0.3, alignSelf: 'stretch', minHeight: 40 }} />
          <div style={{ fontFamily: 'var(--font-cormorant-garamond)', fontStyle: 'italic', fontSize: 13, color: theme.accent, textAlign: 'right', lineHeight: 2 }}>
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
        {ceremony.suiviDAutre && ceremony.evenementSuivant && (
          <div style={{ textAlign: 'center', paddingTop: 20, borderTop: `1px solid ${theme.accent}`, lineHeight: 1.8 }}>
            <div style={{ fontFamily: 'var(--font-playfair-display)', fontWeight: 'bold', fontSize: 16, color: theme.texte }}>
              La mairie sera suivie {ceremony.evenementSuivant.includes(',') ? `de ${ceremony.evenementSuivant.split(',')[0].trim()}` : `de ${ceremony.evenementSuivant}`}
            </div>
            {ceremony.evenementSuivant.includes(',') && (
              <div style={{ fontFamily: 'var(--font-cormorant-garamond)', fontStyle: 'italic', fontSize: 14, color: theme.textSecondaire, marginTop: 4 }}>
                {ceremony.evenementSuivant.split(',').slice(1).join(',').trim()}
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

function renderCard(ceremony: Ceremony, data: FormData, theme: ThemeObj) {
  const props = { ceremony, data, theme }
  if (ceremony.type === 'Mairie') return <CardMairie {...props} />
  if (ceremony.type === 'Cérémonie religieuse / Houppa') return <CardHouppa {...props} />
  if (ceremony.type === 'Henné') return <CardHenne {...props} />
  return <CardAutre {...props} />
}

function SplashScreen({ data, theme, onDone, isShared }: { data: FormData; theme: ThemeObj; onDone: () => void; isShared: boolean }) {
  const [out, setOut] = useState(false)
  const firstDate = sortByDate(data.ceremonies)[0]?.date
  const done = useCallback(() => { setOut(true); setTimeout(onDone, 600) }, [onDone])
  useEffect(() => { if (!isShared) { const t = setTimeout(done, 2200); return () => clearTimeout(t) } }, [isShared, done])
  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 100, backgroundColor: theme.fond, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', opacity: out ? 0 : 1, transition: 'opacity 0.6s ease' }}>
      <div style={{ fontFamily: 'var(--font-great-vibes)', fontSize: 'clamp(48px, 12vw, 96px)', color: theme.accent, textAlign: 'center', lineHeight: 1.2 }}>
        {data.marie1Prenom || 'Prénom'}<br />&amp;<br />{data.marie2Prenom || 'Prénom'}
      </div>
      {firstDate && <div style={{ fontFamily: 'var(--font-playfair-display)', fontSize: 14, color: theme.textSecondaire, letterSpacing: 3, marginTop: 24, textTransform: 'uppercase' }}>{formatDateFr(firstDate)}</div>}
      {isShared && (
        <button onClick={done} style={{ marginTop: 48, padding: '16px 40px', border: `1px solid ${theme.accent}`, borderRadius: 9999, background: 'transparent', color: theme.accent, fontSize: 16, cursor: 'pointer', fontFamily: 'var(--font-playfair-display)' }}>
          Découvrir votre faire-part
        </button>
      )}
    </div>
  )
}

function MusicPlayer({ youtubeUrl, accent }: { youtubeUrl: string; accent: string }) {
  const [muted, setMuted] = useState(false)
  const [key, setKey] = useState(0)
  const [mobile, setMobile] = useState(false)
  const id = getYouTubeId(youtubeUrl)
  useEffect(() => { setMobile(/iPhone|iPad|iPod|Android/i.test(navigator.userAgent)) }, [])
  if (!id) return null
  return (
    <>
      <iframe key={key} src={`https://www.youtube.com/embed/${id}?autoplay=1&loop=1&playlist=${id}&controls=0&mute=${muted ? 1 : 0}`} style={{ position: 'fixed', top: -9999, opacity: 0, pointerEvents: 'none', width: 1, height: 1 }} allow="autoplay" title="music" />
      {mobile && <button onClick={() => setMobile(false)} style={{ position: 'fixed', bottom: 80, left: '50%', transform: 'translateX(-50%)', background: accent, color: 'white', padding: '12px 28px', borderRadius: 9999, border: 'none', cursor: 'pointer', zIndex: 50, fontSize: 14 }}>▶ Lancer la musique</button>}
      <button onClick={() => { setMuted(m => !m); setKey(k => k + 1) }} style={{ position: 'fixed', bottom: 24, right: 24, width: 40, height: 40, borderRadius: '50%', background: accent, color: 'white', border: 'none', cursor: 'pointer', zIndex: 50, fontSize: 16, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        {muted ? '🔇' : '🔊'}
      </button>
    </>
  )
}

function CardsView({ data, onEdit, onReset, isShared }: { data: FormData; onEdit: () => void; onReset: () => void; isShared: boolean }) {
  const theme = THEMES[data.style]
  const sorted = sortByDate(data.ceremonies)
  const [splashDone, setSplashDone] = useState(false)
  const [active, setActive] = useState(0)
  const refs = useRef<(HTMLDivElement | null)[]>([])

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
      const { id } = await res.json()
      await navigator.clipboard.writeText(`${window.location.origin}/faire-part?share=${id}`)
      alert('Lien copié !')
    } catch { alert('Erreur') }
  }

  return (
    <div style={{ backgroundColor: theme.fond, minHeight: '100vh', color: theme.texte }}>
      {!splashDone && <SplashScreen data={data} theme={theme} onDone={() => setSplashDone(true)} isShared={isShared} />}
      {splashDone && <>
        <div style={{ position: 'fixed', left: 16, top: '50%', transform: 'translateY(-50%)', display: 'flex', flexDirection: 'column', gap: 10, zIndex: 40 }}>
          {sorted.map((_, i) => (
            <button key={i} onClick={() => refs.current[i]?.scrollIntoView({ behavior: 'smooth' })} style={{ width: 10, height: 10, borderRadius: '50%', border: `1.5px solid ${theme.accent}`, background: active === i ? theme.accent : 'transparent', cursor: 'pointer', padding: 0 }} />
          ))}
        </div>
        <div style={{ padding: '40px 20px 80px' }}>
          {sorted.map((ceremony, i) => (
            <div key={i}>
              <div ref={el => { refs.current[i] = el }} style={{ maxWidth: 600, margin: '0 auto', borderRadius: 4, boxShadow: '0 8px 40px rgba(0,0,0,0.13)', overflow: 'hidden' }}>
                {renderCard(ceremony, data, theme)}
              </div>
              {i < sorted.length - 1 && (
                <div style={{ maxWidth: 600, margin: '32px auto', display: 'flex', alignItems: 'center', gap: 12 }}>
                  <div style={{ flex: 1, height: 1, background: theme.accent, opacity: 0.3 }} />
                  <span style={{ color: theme.accent }}>✦</span>
                  <div style={{ flex: 1, height: 1, background: theme.accent, opacity: 0.3 }} />
                </div>
              )}
            </div>
          ))}
          {!isShared && (
            <div style={{ maxWidth: 600, margin: '48px auto 0', display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
              <button onClick={onEdit} style={{ padding: '12px 28px', borderRadius: 9999, border: `1px solid ${theme.accent}`, background: 'transparent', color: theme.accent, cursor: 'pointer', fontSize: 14 }}>Modifier</button>
              <button onClick={handleShare} style={{ padding: '12px 28px', borderRadius: 9999, background: theme.accent, color: 'white', border: 'none', cursor: 'pointer', fontSize: 14 }}>🔗 Partager</button>
              <button onClick={onReset} style={{ padding: '12px 28px', borderRadius: 9999, border: '1px solid #fecdd3', background: 'transparent', color: '#fb7185', cursor: 'pointer', fontSize: 14 }}>Nouveau</button>
            </div>
          )}
        </div>
        {data.youtubeUrl && <MusicPlayer youtubeUrl={data.youtubeUrl} accent={theme.accent} />}
      </>}
    </div>
  )
}

export default function FairePartPage() {
  const [step, setStep] = useState(1)
  const [formData, setFormData] = useState<FormData>(defaultFormData)
  const [showCards, setShowCards] = useState(false)
  const [isShared, setIsShared] = useState(false)

  useEffect(() => {
    const id = new URLSearchParams(window.location.search).get('share')
    if (id) {
      setIsShared(true)
      fetch(`/api/get-share?id=${id}`).then(r => r.json()).then((d: FormData) => { setFormData(d); setShowCards(true) }).catch(console.error)
    }
  }, [])

  const update = useCallback((u: Partial<FormData>) => setFormData(p => ({ ...p, ...u })), [])
  const next = () => step < 4 ? setStep(s => s + 1) : setShowCards(true)
  const prev = () => setStep(s => s - 1)

  if (showCards) return <CardsView data={formData} onEdit={() => { setShowCards(false); setStep(4) }} onReset={() => { setFormData(defaultFormData); setShowCards(false); setStep(1) }} isShared={isShared} />

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
      <div style={{ width: '100%', maxWidth: 600, background: 'white', borderRadius: 20, padding: 40, boxShadow: '0 12px 48px rgba(0,0,0,0.07)', border: '1px solid #fce7f3', boxSizing: 'border-box' }}>
        <ProgressBar step={step} />
        {step === 1 && <Step1 data={formData} onChange={update} />}
        {step === 2 && <Step2 data={formData} onChange={update} />}
        {step === 3 && <Step3 data={formData} onChange={update} />}
        {step === 4 && <Step4 data={formData} onChange={update} />}
        <div style={{ display: 'flex', gap: 12, marginTop: 32 }}>
          {step > 1 && (
            <button type="button" onClick={prev} style={{ flex: 1, padding: '16px 0', borderRadius: 9999, border: '1.5px solid #fecdd3', background: 'white', color: '#fb7185', fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>← Précédent</button>
          )}
          <button type="button" onClick={next} style={{ flex: 1, padding: '16px 0', borderRadius: 9999, border: 'none', background: step === 4 ? 'linear-gradient(135deg, #C9A84C, #e8c96a)' : 'linear-gradient(135deg, #fb7185, #f43f5e)', color: 'white', fontSize: 13, fontWeight: 700, cursor: 'pointer', boxShadow: '0 6px 20px rgba(251,113,133,0.35)' }}>
            {step === 4 ? 'Générer ✦' : 'Suivant →'}
          </button>
        </div>
      </div>
    </div>
  )
}
