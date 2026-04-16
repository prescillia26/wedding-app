'use client'

import { useState, useEffect, useRef, useCallback } from 'react'

// ============================================================
// TYPES & CONSTANTS
// ============================================================

type Theme = 'classique-dore' | 'moderne' | 'champetre' | 'oriental'

const THEMES = {
  'classique-dore': { fond: '#fdf0f3', accent: '#C9A84C', texte: '#4a3728', textSecondaire: '#6a5040' },
  'moderne': { fond: '#f8f8f8', accent: '#888888', texte: '#1a1a1a', textSecondaire: '#555555' },
  'champetre': { fond: '#f5f0e8', accent: '#8fad6a', texte: '#3d4a2e', textSecondaire: '#5a6040' },
  'oriental': { fond: '#1a0a00', accent: '#D4A847', texte: '#f5e6c8', textSecondaire: '#d4c0a0' },
} as const

const CEREMONY_TYPES = [
  'Mairie',
  'Cérémonie religieuse / Houppa',
  'Henné',
  'Cocktail',
  'Soirée',
  'Boat Party',
  'Autre',
]

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
  customName: '',
  lieu: '',
  adresse: '',
  date: '',
  heure: '',
  suiviDAutre: false,
  evenementSuivant: '',
}

const defaultFormData: FormData = {
  marie1Prenom: '',
  marie1Nom: '',
  marie1Prenom2: '',
  marie2Prenom: '',
  marie2Nom: '',
  marie2Prenom2: '',
  famille1Pere: '',
  famille1Mere: '',
  famille1GpPaternels: '',
  famille1GpMaternels: '',
  famille2Pere: '',
  famille2Mere: '',
  famille2GpPaternels: '',
  famille2GpMaternels: '',
  ceremonies: [{ ...defaultCeremony }],
  style: 'classique-dore',
  mariageJuif: false,
  youtubeUrl: '',
  photoFond: '',
}

// ============================================================
// HELPERS
// ============================================================

function getYouTubeId(url: string): string | null {
  const match = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&\n?#]+)/)
  return match ? match[1] : null
}

function formatDateFr(dateStr: string): string {
  if (!dateStr) return ''
  const date = new Date(dateStr + 'T12:00:00')
  return new Intl.DateTimeFormat('fr-FR', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }).format(date).toUpperCase()
}

function formatDateFrCapitalized(dateStr: string): string {
  if (!dateStr) return ''
  const date = new Date(dateStr + 'T12:00:00')
  const parts = new Intl.DateTimeFormat('fr-FR', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }).formatToParts(date)
  const cap = (s: string) => s.charAt(0).toUpperCase() + s.slice(1)
  const weekday = parts.find(p => p.type === 'weekday')?.value || ''
  const day = parts.find(p => p.type === 'day')?.value || ''
  const month = parts.find(p => p.type === 'month')?.value || ''
  const year = parts.find(p => p.type === 'year')?.value || ''
  return `Le ${cap(weekday)} ${day} ${cap(month)} ${year}`
}

function formatHeure(heure: string): string {
  if (!heure) return ''
  return 'À ' + heure.replace(':', 'H')
}

function formatLieu(lieu: string): string {
  if (!lieu) return ''
  const lower = lieu.toLowerCase()
  if (lower.includes('salon') || lower.includes('salle')) return `Dans les salons ${lieu}`
  if (lower.includes('château') || lower.includes('chateau')) return `Au château ${lieu}`
  if (lower.includes('domaine')) return `Au domaine ${lieu}`
  return `À ${lieu}`
}

function getHebrewDate(dateStr: string): string {
  if (!dateStr) return ''
  try {
    const date = new Date(dateStr + 'T12:00:00')
    return new Intl.DateTimeFormat('he-IL-u-ca-hebrew', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    }).format(date)
  } catch {
    return ''
  }
}

function getEventDisplayName(type: string, customName: string): string {
  if (type === 'Autre') return customName || 'Événement'
  return type
}

function sortCeremoniesByDate(ceremonies: Ceremony[]): Ceremony[] {
  return [...ceremonies].sort((a, b) => {
    if (!a.date) return 1
    if (!b.date) return -1
    return new Date(a.date).getTime() - new Date(b.date).getTime()
  })
}

// ============================================================
// FORM HELPERS
// ============================================================

function FormLabel({ children, required }: { children: React.ReactNode; required?: boolean }) {
  return (
    <label className="block text-[10px] uppercase tracking-[0.15em] text-[#C9A84C] mb-1.5">
      {children}
      {required && <span className="text-[#fb7185] ml-1">*</span>}
    </label>
  )
}

const inputCls =
  'w-full border border-[#fecdd3] rounded-[10px] px-3 py-2.5 bg-white focus:border-[#C9A84C] focus:outline-none text-sm transition-colors'

function FormInput({
  label,
  value,
  onChange,
  placeholder,
  required,
  type = 'text',
  hint,
}: {
  label: string
  value: string
  onChange: (v: string) => void
  placeholder?: string
  required?: boolean
  type?: string
  hint?: string
}) {
  return (
    <div className="mb-4">
      <FormLabel required={required}>{label}</FormLabel>
      <input
        type={type}
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder={placeholder}
        className={inputCls}
      />
      {hint && <p className="text-[11px] text-gray-400 mt-1 italic">{hint}</p>}
    </div>
  )
}

// ============================================================
// PROGRESS BAR
// ============================================================

function ProgressBar({ step }: { step: number }) {
  const steps = ['Les mariés', 'Les familles', 'Cérémonies', 'Style']
  return (
    <div className="flex items-start mb-8">
      {steps.map((label, i) => (
        <div key={i} className="flex items-center flex-1">
          <div className="flex flex-col items-center">
            <div
              className="w-3 h-3 rounded-full border-2 transition-all duration-300"
              style={{
                backgroundColor: i + 1 <= step ? '#C9A84C' : 'white',
                borderColor: '#C9A84C',
              }}
            />
            <span className="text-[9px] uppercase tracking-wider text-[#C9A84C] mt-1 text-center leading-tight max-w-[60px]">
              {label}
            </span>
          </div>
          {i < steps.length - 1 && (
            <div
              className="flex-1 h-px mb-4 transition-all duration-300"
              style={{ backgroundColor: i + 1 < step ? '#C9A84C' : '#fecdd3' }}
            />
          )}
        </div>
      ))}
    </div>
  )
}

// ============================================================
// STEP 1 — LES MARIÉS
// ============================================================

function Step1({ data, onChange }: { data: FormData; onChange: (d: Partial<FormData>) => void }) {
  return (
    <div>
      <h2 className="text-center text-xl font-semibold text-[#4a3728] mb-6">Les mariés</h2>

      <div className="mb-2">
        <FormInput label="Prénom" value={data.marie1Prenom} onChange={v => onChange({ marie1Prenom: v })} required />
        <FormInput label="Nom" value={data.marie1Nom} onChange={v => onChange({ marie1Nom: v })} required />
        <FormInput
          label="2ème prénom ou prénom hébreu"
          value={data.marie1Prenom2}
          onChange={v => onChange({ marie1Prenom2: v })}
        />
      </div>

      <div className="flex items-center my-6">
        <div className="flex-1 h-px bg-[#fecdd3]" />
        <span
          className="mx-4 text-2xl text-[#C9A84C] font-light"
          style={{ fontFamily: 'var(--font-cormorant-garamond)' }}
        >
          &
        </span>
        <div className="flex-1 h-px bg-[#fecdd3]" />
      </div>

      <div>
        <FormInput label="Prénom" value={data.marie2Prenom} onChange={v => onChange({ marie2Prenom: v })} required />
        <FormInput label="Nom" value={data.marie2Nom} onChange={v => onChange({ marie2Nom: v })} required />
        <FormInput
          label="2ème prénom ou prénom hébreu"
          value={data.marie2Prenom2}
          onChange={v => onChange({ marie2Prenom2: v })}
        />
      </div>
    </div>
  )
}

// ============================================================
// STEP 2 — LES FAMILLES
// ============================================================

function FamilleColumn({
  title,
  pere,
  mere,
  gpPaternels,
  gpMaternels,
  onChangePere,
  onChangeMere,
  onChangeGpP,
  onChangeGpM,
}: {
  title: string
  pere: string
  mere: string
  gpPaternels: string
  gpMaternels: string
  onChangePere: (v: string) => void
  onChangeMere: (v: string) => void
  onChangeGpP: (v: string) => void
  onChangeGpM: (v: string) => void
}) {
  return (
    <div>
      <h3 className="text-center text-[11px] font-medium text-[#C9A84C] mb-4 uppercase tracking-widest">
        {title}
      </h3>
      <div className="mb-3">
        <FormLabel>Père</FormLabel>
        <input type="text" value={pere} onChange={e => onChangePere(e.target.value)} className={inputCls} />
        <p className="text-[10px] text-gray-400 mt-0.5">ex: M. Richard Portugais</p>
      </div>
      <div className="mb-3">
        <FormLabel>Mère</FormLabel>
        <input type="text" value={mere} onChange={e => onChangeMere(e.target.value)} className={inputCls} />
        <p className="text-[10px] text-gray-400 mt-0.5">ex: Mme Marie Benchetrit</p>
      </div>
      <div className="mb-3">
        <FormLabel>GP paternels</FormLabel>
        <input type="text" value={gpPaternels} onChange={e => onChangeGpP(e.target.value)} className={inputCls} />
        <p className="text-[10px] text-gray-400 mt-0.5">ex: M. &amp; Mme Sydney Zeitoun</p>
      </div>
      <div className="mb-3">
        <FormLabel>GP maternels</FormLabel>
        <input type="text" value={gpMaternels} onChange={e => onChangeGpM(e.target.value)} className={inputCls} />
        <p className="text-[10px] text-gray-400 mt-0.5">ex: M. &amp; Mme Jacques Portugais</p>
      </div>
    </div>
  )
}

function Step2({ data, onChange }: { data: FormData; onChange: (d: Partial<FormData>) => void }) {
  return (
    <div>
      <h2 className="text-center text-xl font-semibold text-[#4a3728] mb-6">Les familles</h2>
      <div className="grid grid-cols-2 gap-5">
        <FamilleColumn
          title={data.marie1Prenom || 'Marié(e) 1'}
          pere={data.famille1Pere}
          mere={data.famille1Mere}
          gpPaternels={data.famille1GpPaternels}
          gpMaternels={data.famille1GpMaternels}
          onChangePere={v => onChange({ famille1Pere: v })}
          onChangeMere={v => onChange({ famille1Mere: v })}
          onChangeGpP={v => onChange({ famille1GpPaternels: v })}
          onChangeGpM={v => onChange({ famille1GpMaternels: v })}
        />
        <FamilleColumn
          title={data.marie2Prenom || 'Marié(e) 2'}
          pere={data.famille2Pere}
          mere={data.famille2Mere}
          gpPaternels={data.famille2GpPaternels}
          gpMaternels={data.famille2GpMaternels}
          onChangePere={v => onChange({ famille2Pere: v })}
          onChangeMere={v => onChange({ famille2Mere: v })}
          onChangeGpP={v => onChange({ famille2GpPaternels: v })}
          onChangeGpM={v => onChange({ famille2GpMaternels: v })}
        />
      </div>
    </div>
  )
}

// ============================================================
// STEP 3 — CÉRÉMONIES
// ============================================================

function CeremonyBlock({
  ceremony,
  index,
  total,
  onUpdate,
  onRemove,
}: {
  ceremony: Ceremony
  index: number
  total: number
  onUpdate: (updates: Partial<Ceremony>) => void
  onRemove: () => void
}) {
  return (
    <div className="mb-8 pb-8 border-b border-[#fecdd3] last:border-0 last:pb-0 last:mb-0">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-semibold text-[#4a3728]">Événement {index + 1}</h3>
        {total > 1 && (
          <button
            type="button"
            onClick={onRemove}
            className="text-[#fb7185] text-xs hover:text-[#f87171] transition-colors"
          >
            Supprimer
          </button>
        )}
      </div>

      {/* Type buttons */}
      <div className="mb-4">
        <FormLabel>Type d&apos;événement</FormLabel>
        <div className="flex flex-wrap gap-2">
          {CEREMONY_TYPES.map(type => (
            <button
              key={type}
              type="button"
              onClick={() => onUpdate({ type })}
              className="px-3 py-1.5 rounded-full text-xs border transition-all"
              style={{
                backgroundColor: ceremony.type === type ? '#C9A84C' : 'transparent',
                borderColor: '#C9A84C',
                color: ceremony.type === type ? 'white' : '#C9A84C',
              }}
            >
              {type}
            </button>
          ))}
        </div>
      </div>

      {ceremony.type === 'Autre' && (
        <div className="mb-4">
          <FormLabel>Nom de l&apos;événement</FormLabel>
          <input
            type="text"
            value={ceremony.customName}
            onChange={e => onUpdate({ customName: e.target.value })}
            className={inputCls}
          />
        </div>
      )}

      <div className="mb-4">
        <FormLabel>Lieu / Salle</FormLabel>
        <input
          type="text"
          value={ceremony.lieu}
          onChange={e => onUpdate({ lieu: e.target.value })}
          placeholder="ex: Salons Kahi Resort"
          className={inputCls}
        />
      </div>

      <div className="mb-4">
        <FormLabel>Adresse complète (optionnel)</FormLabel>
        <input
          type="text"
          value={ceremony.adresse}
          onChange={e => onUpdate({ adresse: e.target.value })}
          className={inputCls}
        />
      </div>

      <div className="grid grid-cols-2 gap-4 mb-4">
        <div>
          <FormLabel>Date</FormLabel>
          <input
            type="date"
            value={ceremony.date}
            onChange={e => onUpdate({ date: e.target.value })}
            className={inputCls}
          />
        </div>
        <div>
          <FormLabel>Heure</FormLabel>
          <input
            type="time"
            value={ceremony.heure}
            onChange={e => onUpdate({ heure: e.target.value })}
            className={inputCls}
          />
        </div>
      </div>

      {ceremony.type === 'Mairie' && (
        <div className="mb-2">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={ceremony.suiviDAutre}
              onChange={e => onUpdate({ suiviDAutre: e.target.checked })}
              className="accent-[#C9A84C] w-4 h-4"
            />
            <span className="text-sm text-[#4a3728]">Cet événement est suivi d&apos;un autre ?</span>
          </label>
          {ceremony.suiviDAutre && (
            <div className="mt-3">
              <FormLabel>Lequel ?</FormLabel>
              <input
                type="text"
                value={ceremony.evenementSuivant}
                onChange={e => onUpdate({ evenementSuivant: e.target.value })}
                placeholder="ex: Henné à la salle Michkenot Israël, 6 rue Jean Nohain Paris 75019"
                className={inputCls}
              />
            </div>
          )}
        </div>
      )}
    </div>
  )
}

function Step3({ data, onChange }: { data: FormData; onChange: (d: Partial<FormData>) => void }) {
  const updateCeremony = (index: number, updates: Partial<Ceremony>) => {
    onChange({
      ceremonies: data.ceremonies.map((c, i) => (i === index ? { ...c, ...updates } : c)),
    })
  }

  const addCeremony = () => {
    if (data.ceremonies.length < 6) {
      onChange({ ceremonies: [...data.ceremonies, { ...defaultCeremony, type: 'Soirée' }] })
    }
  }

  const removeCeremony = (index: number) => {
    onChange({ ceremonies: data.ceremonies.filter((_, i) => i !== index) })
  }

  return (
    <div>
      <h2 className="text-center text-xl font-semibold text-[#4a3728] mb-6">Les cérémonies</h2>
      {data.ceremonies.map((ceremony, i) => (
        <CeremonyBlock
          key={i}
          ceremony={ceremony}
          index={i}
          total={data.ceremonies.length}
          onUpdate={updates => updateCeremony(i, updates)}
          onRemove={() => removeCeremony(i)}
        />
      ))}
      {data.ceremonies.length < 6 && (
        <button
          type="button"
          onClick={addCeremony}
          className="w-full border border-dashed border-[#C9A84C] text-[#C9A84C] rounded-[10px] py-3 text-sm hover:bg-[#fdf0f3] transition-colors mt-4"
        >
          + Ajouter un événement
        </button>
      )}
    </div>
  )
}

// ============================================================
// STEP 4 — STYLE & OPTIONS
// ============================================================

function Step4({ data, onChange }: { data: FormData; onChange: (d: Partial<FormData>) => void }) {
  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = ev => onChange({ photoFond: ev.target?.result as string })
    reader.readAsDataURL(file)
  }

  const themeLabels: Record<Theme, string> = {
    'classique-dore': 'Classique doré',
    'moderne': 'Moderne minimaliste',
    'champetre': 'Champêtre',
    'oriental': 'Oriental',
  }

  return (
    <div>
      <h2 className="text-center text-xl font-semibold text-[#4a3728] mb-6">Style & options</h2>

      {/* Style grid */}
      <div className="mb-6">
        <FormLabel>Style visuel</FormLabel>
        <div className="grid grid-cols-2 gap-3 mt-2">
          {(Object.keys(THEMES) as Theme[]).map(key => {
            const theme = THEMES[key]
            const selected = data.style === key
            return (
              <button
                key={key}
                type="button"
                onClick={() => onChange({ style: key })}
                className="relative p-4 rounded-[10px] border-2 text-left transition-all"
                style={{
                  backgroundColor: theme.fond,
                  borderColor: selected ? theme.accent : '#fecdd3',
                }}
              >
                <div className="text-xs font-semibold mb-1" style={{ color: theme.texte }}>
                  {themeLabels[key]}
                </div>
                <div className="text-xs" style={{ color: theme.accent }}>
                  ✦ Accent
                </div>
                {selected && (
                  <div
                    className="absolute top-2 right-2 w-5 h-5 rounded-full flex items-center justify-center text-white text-[10px] font-bold"
                    style={{ backgroundColor: theme.accent }}
                  >
                    ✓
                  </div>
                )}
              </button>
            )
          })}
        </div>
      </div>

      {/* Mariage juif */}
      <div className="mb-6">
        <label className="flex items-center gap-3 cursor-pointer p-3 border border-[#fecdd3] rounded-[10px] hover:bg-[#fdf0f3] transition-colors select-none">
          <input
            type="checkbox"
            checked={data.mariageJuif}
            onChange={e => onChange({ mariageJuif: e.target.checked })}
            className="accent-[#C9A84C] w-4 h-4"
          />
          <span className="text-sm text-[#4a3728]">Mariage juif ✡</span>
        </label>
      </div>

      {/* YouTube */}
      <div className="mb-6">
        <FormLabel>Musique de fond</FormLabel>
        <input
          type="url"
          value={data.youtubeUrl}
          onChange={e => onChange({ youtubeUrl: e.target.value })}
          placeholder="https://www.youtube.com/watch?v=..."
          className={inputCls}
        />
        <p className="text-[11px] text-gray-400 mt-1">
          La musique jouera automatiquement à l&apos;ouverture de la carte
        </p>
      </div>

      {/* Photo upload */}
      <div className="mb-2">
        <FormLabel>Photo de fond</FormLabel>
        <label className="block cursor-pointer">
          <div className="border border-dashed border-[#fecdd3] rounded-[10px] p-5 text-center hover:bg-[#fdf0f3] transition-colors">
            <div className="text-2xl mb-1">📷</div>
            <p className="text-sm text-[#4a3728]">Cliquer pour uploader une photo</p>
            <p className="text-[11px] text-gray-400 mt-1">
              La photo sera appliquée en fond de toutes les cartes
            </p>
          </div>
          <input type="file" accept="image/*" onChange={handlePhotoUpload} className="hidden" />
        </label>
        {data.photoFond && (
          <div className="mt-3 relative">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={data.photoFond}
              alt="Aperçu fond"
              className="w-full h-32 object-cover rounded-[10px]"
            />
            <button
              type="button"
              onClick={() => onChange({ photoFond: '' })}
              className="absolute top-2 right-2 bg-white rounded-full w-6 h-6 flex items-center justify-center text-[#fb7185] text-xs shadow hover:shadow-md transition-shadow"
            >
              ✕
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

// ============================================================
// MAIRIE SVG ILLUSTRATION
// ============================================================

function MairieIllustration({ color }: { color: string }) {
  return (
    <svg viewBox="0 0 200 120" width="160" height="96" xmlns="http://www.w3.org/2000/svg">
      <rect x="10" y="92" width="180" height="7" fill={color} opacity="0.7" />
      <rect x="40" y="52" width="120" height="44" fill="none" stroke={color} strokeWidth="1.5" />
      {[56, 74, 92, 110, 128].map(x => (
        <rect key={x} x={x} y="52" width="4" height="44" fill={color} opacity="0.5" />
      ))}
      <polygon points="28,52 100,14 172,52" fill="none" stroke={color} strokeWidth="1.5" />
      <path d="M 87 96 L 87 68 Q 100 58 113 68 L 113 96 Z" fill="none" stroke={color} strokeWidth="1.2" />
      <rect x="50" y="60" width="16" height="14" rx="2" fill="none" stroke={color} strokeWidth="1" />
      <rect x="134" y="60" width="16" height="14" rx="2" fill="none" stroke={color} strokeWidth="1" />
      <line x1="100" y1="4" x2="100" y2="14" stroke={color} strokeWidth="1.5" />
      <rect x="100" y="4" width="16" height="9" fill={color} opacity="0.6" />
      <circle cx="100" cy="33" r="3" fill={color} opacity="0.4" />
    </svg>
  )
}

// ============================================================
// CARD BACKGROUND WRAPPER
// ============================================================

function CardBackground({
  photoFond,
  fond,
  isOriental,
  children,
}: {
  photoFond: string
  fond: string
  isOriental: boolean
  children: React.ReactNode
}) {
  return (
    <div style={{ position: 'relative', overflow: 'hidden', backgroundColor: fond }}>
      {photoFond && (
        <>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={photoFond}
            alt=""
            style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' }}
          />
          <div
            style={{
              position: 'absolute',
              inset: 0,
              backgroundColor: isOriental ? 'rgba(26,10,0,0.83)' : 'rgba(255,255,255,0.86)',
            }}
          />
        </>
      )}
      <div style={{ position: 'relative', zIndex: 1 }}>{children}</div>
    </div>
  )
}

// ============================================================
// CARD TYPE 1 — HOUPPA / CÉRÉMONIE RELIGIEUSE
// ============================================================

type ThemeObj = {
  fond: string
  accent: string
  texte: string
  textSecondaire: string
}

interface CardProps {
  ceremony: Ceremony
  data: FormData
  theme: ThemeObj
}

function CardHouppa({ ceremony, data, theme }: CardProps) {
  const hasGp =
    data.famille1GpPaternels ||
    data.famille1GpMaternels ||
    data.famille2GpPaternels ||
    data.famille2GpMaternels
  const hebrewDate = getHebrewDate(ceremony.date)
  const isOriental = theme.fond === '#1a0a00'

  return (
    <CardBackground photoFond={data.photoFond} fond={theme.fond} isOriental={isOriental}>
      <div style={{ padding: '60px 48px', position: 'relative' }}>
        {data.mariageJuif && (
          <div
            style={{
              position: 'absolute',
              top: 20,
              right: 24,
              fontSize: 14,
              fontFamily: 'serif',
              color: theme.accent,
              direction: 'rtl',
            }}
          >
            בס״ד
          </div>
        )}

        {/* [1] Titre */}
        <div
          style={{
            fontFamily: 'var(--font-great-vibes)',
            fontSize: 42,
            color: theme.accent,
            textAlign: 'center',
            marginBottom: 24,
            lineHeight: 1.2,
          }}
        >
          {data.mariageJuif ? 'Houppa & Soirée' : 'Cérémonie religieuse & Soirée'}
        </div>

        {/* [2] Verset hébreu */}
        {data.mariageJuif && (
          <div style={{ marginBottom: 28 }}>
            <div style={{ height: 1, backgroundColor: theme.accent, opacity: 0.35, marginBottom: 14 }} />
            <div
              style={{
                fontFamily: 'serif',
                fontSize: 16,
                color: theme.accent,
                direction: 'rtl',
                textAlign: 'center',
                lineHeight: 1.9,
              }}
            >
              קוֹל שָׂשׂוֹן וְקוֹל שִׂמְחָה, קוֹל חָתָן וְקוֹל כַּלָּה
            </div>
            <div style={{ height: 1, backgroundColor: theme.accent, opacity: 0.35, marginTop: 14 }} />
          </div>
        )}

        {/* [3] Familles */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: '1fr auto 1fr',
            gap: 16,
            marginBottom: 28,
            alignItems: 'start',
          }}
        >
          <div
            style={{
              fontFamily: 'var(--font-cormorant-garamond)',
              fontStyle: 'italic',
              fontSize: 13,
              color: theme.accent,
              lineHeight: 2,
            }}
          >
            {data.famille1Pere && <div>{data.famille1Pere}</div>}
            {data.famille1GpPaternels && <div>{data.famille1GpPaternels}</div>}
            {data.famille1GpMaternels && <div>{data.famille1GpMaternels}</div>}
          </div>
          <div
            style={{
              width: 1,
              backgroundColor: theme.accent,
              opacity: 0.35,
              alignSelf: 'stretch',
              minHeight: 40,
            }}
          />
          <div
            style={{
              fontFamily: 'var(--font-cormorant-garamond)',
              fontStyle: 'italic',
              fontSize: 13,
              color: theme.accent,
              textAlign: 'right',
              lineHeight: 2,
            }}
          >
            {data.famille2Mere && <div>{data.famille2Mere}</div>}
            {data.famille2GpPaternels && <div>{data.famille2GpPaternels}</div>}
            {data.famille2GpMaternels && <div>{data.famille2GpMaternels}</div>}
          </div>
        </div>

        {/* [4] Phrase centrale */}
        <div
          style={{
            fontFamily: 'var(--font-cormorant-garamond)',
            fontStyle: 'italic',
            fontSize: 22,
            textAlign: 'center',
            color: theme.texte,
            marginBottom: 28,
            lineHeight: 1.5,
          }}
        >
          {hasGp
            ? 'Ont la joie de vous faire part du mariage de leurs petits-enfants et enfants'
            : 'Ont la joie de vous faire part du mariage de leurs enfants'}
        </div>

        {/* [5] Prénoms */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: '1fr auto 1fr',
            alignItems: 'center',
            gap: 12,
            marginBottom: 28,
          }}
        >
          <div style={{ textAlign: 'center' }}>
            <div
              style={{
                fontFamily: 'var(--font-great-vibes)',
                fontSize: 'clamp(36px, 10vw, 70px)',
                color: theme.accent,
                lineHeight: 1.1,
              }}
            >
              {data.marie2Prenom || 'Prénom'}
            </div>
            {data.marie2Prenom2 && (
              <div
                style={{
                  fontFamily: 'var(--font-playfair-display)',
                  fontSize: 11,
                  letterSpacing: 2,
                  color: theme.textSecondaire,
                  marginTop: 4,
                }}
              >
                {data.marie2Prenom2}
              </div>
            )}
          </div>
          <div
            style={{
              fontFamily: 'var(--font-cormorant-garamond)',
              fontSize: 'clamp(28px, 6vw, 42px)',
              color: theme.accent,
              lineHeight: 1,
            }}
          >
            &
          </div>
          <div style={{ textAlign: 'center' }}>
            <div
              style={{
                fontFamily: 'var(--font-great-vibes)',
                fontSize: 'clamp(36px, 10vw, 70px)',
                color: theme.accent,
                lineHeight: 1.1,
              }}
            >
              {data.marie1Prenom || 'Prénom'}
            </div>
            {data.marie1Prenom2 && (
              <div
                style={{
                  fontFamily: 'var(--font-playfair-display)',
                  fontSize: 11,
                  letterSpacing: 2,
                  color: theme.textSecondaire,
                  marginTop: 4,
                }}
              >
                {data.marie1Prenom2}
              </div>
            )}
          </div>
        </div>

        {/* [6] Phrase de présence */}
        <div
          style={{
            fontFamily: 'var(--font-cormorant-garamond)',
            fontStyle: 'italic',
            fontSize: 18,
            textAlign: 'center',
            color: theme.texte,
            marginBottom: 20,
            lineHeight: 1.6,
          }}
        >
          et seront honorés de votre présence à la cérémonie religieuse qui sera célébrée le
        </div>

        {/* [7] Date */}
        <div
          style={{
            fontFamily: 'var(--font-playfair-display)',
            fontSize: 22,
            color: theme.accent,
            textAlign: 'center',
            letterSpacing: 3,
            textTransform: 'uppercase',
            marginBottom: 8,
          }}
        >
          {formatDateFr(ceremony.date)}
        </div>

        {/* [8] Date hébraïque */}
        {data.mariageJuif && hebrewDate && (
          <div
            style={{
              fontFamily: 'serif',
              fontSize: 18,
              color: theme.accent,
              direction: 'rtl',
              textAlign: 'center',
              marginBottom: 20,
            }}
          >
            {hebrewDate}
          </div>
        )}

        {/* [9] Heure */}
        <div
          style={{
            fontFamily: 'var(--font-playfair-display)',
            fontSize: 26,
            color: theme.accent,
            textAlign: 'center',
            marginBottom: 20,
            letterSpacing: 2,
          }}
        >
          {formatHeure(ceremony.heure)}
        </div>

        {/* [10] Lieu */}
        <div
          style={{
            fontFamily: 'var(--font-cormorant-garamond)',
            fontStyle: 'italic',
            fontSize: 20,
            textAlign: 'center',
            color: theme.texte,
            lineHeight: 1.6,
          }}
        >
          {ceremony.lieu && (
            <>
              <div>{formatLieu(ceremony.lieu)}</div>
              <div>ainsi qu&apos;à la réception qui suivra</div>
            </>
          )}
          {ceremony.adresse && (
            <div style={{ fontSize: 14, marginTop: 8, color: theme.textSecondaire }}>
              {ceremony.adresse}
            </div>
          )}
        </div>
      </div>
    </CardBackground>
  )
}

// ============================================================
// CARD TYPE 2 — MAIRIE
// ============================================================

function CardMairie({ ceremony, data, theme }: CardProps) {
  const isOriental = theme.fond === '#1a0a00'
  return (
    <CardBackground photoFond={data.photoFond} fond={theme.fond} isOriental={isOriental}>
      <div style={{ padding: '60px 48px', position: 'relative' }}>
        {data.mariageJuif && (
          <div
            style={{
              position: 'absolute',
              top: 20,
              right: 24,
              fontSize: 14,
              fontFamily: 'serif',
              color: theme.accent,
              direction: 'rtl',
            }}
          >
            בס״ד
          </div>
        )}

        {/* [1] Titre */}
        <div
          style={{
            fontFamily: 'var(--font-great-vibes)',
            fontSize: 48,
            color: theme.accent,
            textAlign: 'center',
            marginBottom: 24,
          }}
        >
          Mairie
        </div>

        {/* [2] Illustration */}
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 24 }}>
          <MairieIllustration color={theme.accent} />
        </div>

        {/* [3] Prénoms */}
        <div
          style={{
            fontFamily: 'var(--font-great-vibes)',
            fontSize: 'clamp(40px, 8vw, 64px)',
            color: theme.accent,
            textAlign: 'center',
            marginBottom: 16,
            lineHeight: 1.2,
          }}
        >
          {data.marie2Prenom || 'Prénom'} &amp; {data.marie1Prenom || 'Prénom'}
        </div>

        {/* [4] se diront */}
        <div
          style={{
            fontFamily: 'var(--font-cormorant-garamond)',
            fontStyle: 'italic',
            fontSize: 22,
            textAlign: 'center',
            color: theme.texte,
            marginBottom: 12,
          }}
        >
          se diront
        </div>

        {/* [5] OUI */}
        <div
          style={{
            fontFamily: 'var(--font-great-vibes)',
            fontSize: 72,
            color: theme.accent,
            textAlign: 'center',
            marginBottom: 24,
            lineHeight: 1,
          }}
        >
          « Oui »
        </div>

        {/* [6] Date */}
        <div
          style={{
            fontFamily: 'var(--font-playfair-display)',
            fontWeight: 'bold',
            fontSize: 20,
            textAlign: 'center',
            color: theme.texte,
            marginBottom: 16,
          }}
        >
          {formatDateFrCapitalized(ceremony.date)}
        </div>

        {/* [7] Lieu */}
        <div
          style={{
            fontFamily: 'var(--font-cormorant-garamond)',
            fontStyle: 'italic',
            fontSize: 18,
            textAlign: 'center',
            color: theme.texte,
            marginBottom: 16,
            lineHeight: 1.6,
          }}
        >
          <div>à la Mairie {ceremony.lieu}</div>
          {ceremony.adresse && (
            <div style={{ fontSize: 14, marginTop: 6, color: theme.textSecondaire }}>
              {ceremony.adresse}
            </div>
          )}
        </div>

        {/* [8] Heure */}
        <div
          style={{
            fontFamily: 'var(--font-playfair-display)',
            fontSize: 22,
            color: theme.accent,
            textAlign: 'center',
            marginBottom: 24,
            letterSpacing: 2,
          }}
        >
          {formatHeure(ceremony.heure)}
        </div>

        {/* [9] Itinéraire */}
        {ceremony.adresse && (
          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 24 }}>
            <a
              href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(ceremony.adresse)}`}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                backgroundColor: theme.accent,
                color: isOriental ? '#1a0a00' : 'white',
                padding: '10px 24px',
                borderRadius: 8,
                fontFamily: 'var(--font-playfair-display)',
                fontSize: 14,
                textDecoration: 'none',
                display: 'inline-block',
              }}
            >
              📍 Itinéraire
            </a>
          </div>
        )}

        {/* [10] Suite de l'événement */}
        {ceremony.suiviDAutre && ceremony.evenementSuivant && (
          <div
            style={{
              textAlign: 'center',
              lineHeight: 1.7,
              marginTop: 8,
              paddingTop: 20,
              borderTop: `1px solid ${theme.accent}`,
              opacity: 0.85,
            }}
          >
            <div
              style={{
                fontFamily: 'var(--font-playfair-display)',
                fontWeight: 'bold',
                fontSize: 16,
                color: theme.texte,
              }}
            >
              La mairie sera suivie de{' '}
              {ceremony.evenementSuivant.includes(',')
                ? ceremony.evenementSuivant.split(',')[0].trim()
                : ceremony.evenementSuivant}
            </div>
            {ceremony.evenementSuivant.includes(',') && (
              <div
                style={{
                  fontFamily: 'var(--font-cormorant-garamond)',
                  fontStyle: 'italic',
                  fontSize: 14,
                  color: theme.textSecondaire,
                  marginTop: 6,
                }}
              >
                {ceremony.evenementSuivant
                  .split(',')
                  .slice(1)
                  .join(',')
                  .trim()}
              </div>
            )}
          </div>
        )}
      </div>
    </CardBackground>
  )
}

// ============================================================
// CARD TYPE 3 — HENNÉ
// ============================================================

function CardHenne({ ceremony, data, theme }: CardProps) {
  const isOriental = theme.fond === '#1a0a00'
  return (
    <CardBackground photoFond={data.photoFond} fond={theme.fond} isOriental={isOriental}>
      <div style={{ padding: '60px 48px', position: 'relative' }}>
        {data.mariageJuif && (
          <div
            style={{
              position: 'absolute',
              top: 20,
              right: 24,
              fontSize: 14,
              fontFamily: 'serif',
              color: theme.accent,
              direction: 'rtl',
            }}
          >
            בס״ד
          </div>
        )}

        {/* [1] Titre */}
        <div
          style={{
            fontFamily: 'var(--font-great-vibes)',
            fontSize: 52,
            color: theme.accent,
            textAlign: 'center',
            marginBottom: 20,
          }}
        >
          Soirée Henné
        </div>

        {/* [2] Ornements */}
        <div
          style={{
            textAlign: 'center',
            fontSize: 24,
            letterSpacing: '0.5em',
            color: theme.accent,
            marginBottom: 28,
          }}
        >
          ❋ ✿ ❀
        </div>

        {/* [3] Texte */}
        <div
          style={{
            fontFamily: 'var(--font-cormorant-garamond)',
            fontStyle: 'italic',
            fontSize: 20,
            textAlign: 'center',
            color: theme.texte,
            lineHeight: 1.7,
            marginBottom: 32,
          }}
        >
          Vous êtes chaleureusement invités à célébrer la soirée du henné de
          <br />
          <span
            style={{
              fontFamily: 'var(--font-great-vibes)',
              fontSize: 36,
              color: theme.accent,
              display: 'inline-block',
              marginTop: 8,
            }}
          >
            {data.marie2Prenom || 'Prénom'} &amp; {data.marie1Prenom || 'Prénom'}
          </span>
        </div>

        {/* [4] Date, Heure, Lieu */}
        <div
          style={{
            fontFamily: 'var(--font-playfair-display)',
            fontSize: 22,
            color: theme.accent,
            textAlign: 'center',
            letterSpacing: 3,
            textTransform: 'uppercase',
            marginBottom: 12,
          }}
        >
          {formatDateFr(ceremony.date)}
        </div>
        <div
          style={{
            fontFamily: 'var(--font-playfair-display)',
            fontSize: 24,
            color: theme.accent,
            textAlign: 'center',
            marginBottom: 16,
            letterSpacing: 2,
          }}
        >
          {formatHeure(ceremony.heure)}
        </div>
        <div
          style={{
            fontFamily: 'var(--font-cormorant-garamond)',
            fontStyle: 'italic',
            fontSize: 20,
            textAlign: 'center',
            color: theme.texte,
            lineHeight: 1.6,
          }}
        >
          {ceremony.lieu && <div>{formatLieu(ceremony.lieu)}</div>}
          {ceremony.adresse && (
            <div style={{ fontSize: 14, marginTop: 8, color: theme.textSecondaire }}>
              {ceremony.adresse}
            </div>
          )}
        </div>
      </div>
    </CardBackground>
  )
}

// ============================================================
// CARD TYPE 4 — AUTRES ÉVÉNEMENTS
// ============================================================

function CardAutre({ ceremony, data, theme }: CardProps) {
  const eventName = getEventDisplayName(ceremony.type, ceremony.customName)
  const isOriental = theme.fond === '#1a0a00'
  return (
    <CardBackground photoFond={data.photoFond} fond={theme.fond} isOriental={isOriental}>
      <div style={{ padding: '60px 48px', position: 'relative' }}>
        {data.mariageJuif && (
          <div
            style={{
              position: 'absolute',
              top: 20,
              right: 24,
              fontSize: 14,
              fontFamily: 'serif',
              color: theme.accent,
              direction: 'rtl',
            }}
          >
            בס״ד
          </div>
        )}

        {/* [1] Titre */}
        <div
          style={{
            fontFamily: 'var(--font-great-vibes)',
            fontSize: 52,
            color: theme.accent,
            textAlign: 'center',
            marginBottom: 24,
          }}
        >
          {eventName}
        </div>

        {/* [2] Texte */}
        <div
          style={{
            fontFamily: 'var(--font-cormorant-garamond)',
            fontStyle: 'italic',
            fontSize: 20,
            textAlign: 'center',
            color: theme.texte,
            lineHeight: 1.7,
            marginBottom: 32,
          }}
        >
          Rejoignez{' '}
          <span
            style={{
              fontFamily: 'var(--font-great-vibes)',
              fontSize: 32,
              color: theme.accent,
            }}
          >
            {data.marie2Prenom || 'Prénom'} &amp; {data.marie1Prenom || 'Prénom'}
          </span>
          {' '}pour {eventName.toLowerCase()}
        </div>

        {/* [3] Date, Heure, Lieu */}
        <div
          style={{
            fontFamily: 'var(--font-playfair-display)',
            fontSize: 22,
            color: theme.accent,
            textAlign: 'center',
            letterSpacing: 3,
            textTransform: 'uppercase',
            marginBottom: 12,
          }}
        >
          {formatDateFr(ceremony.date)}
        </div>
        <div
          style={{
            fontFamily: 'var(--font-playfair-display)',
            fontSize: 24,
            color: theme.accent,
            textAlign: 'center',
            marginBottom: 16,
            letterSpacing: 2,
          }}
        >
          {formatHeure(ceremony.heure)}
        </div>
        <div
          style={{
            fontFamily: 'var(--font-cormorant-garamond)',
            fontStyle: 'italic',
            fontSize: 20,
            textAlign: 'center',
            color: theme.texte,
            lineHeight: 1.6,
          }}
        >
          {ceremony.lieu && <div>{formatLieu(ceremony.lieu)}</div>}
          {ceremony.adresse && (
            <div style={{ fontSize: 14, marginTop: 8, color: theme.textSecondaire }}>
              {ceremony.adresse}
            </div>
          )}
        </div>
      </div>
    </CardBackground>
  )
}

function renderCard(ceremony: Ceremony, data: FormData, theme: ThemeObj) {
  const props = { ceremony, data, theme }
  switch (ceremony.type) {
    case 'Mairie':
      return <CardMairie {...props} />
    case 'Cérémonie religieuse / Houppa':
      return <CardHouppa {...props} />
    case 'Henné':
      return <CardHenne {...props} />
    default:
      return <CardAutre {...props} />
  }
}

// ============================================================
// SPLASH SCREEN
// ============================================================

function SplashScreen({
  data,
  theme,
  onDone,
  isShared,
}: {
  data: FormData
  theme: ThemeObj
  onDone: () => void
  isShared: boolean
}) {
  const [fadeOut, setFadeOut] = useState(false)
  const sorted = sortCeremoniesByDate(data.ceremonies)
  const firstDate = sorted[0]?.date

  const handleDone = useCallback(() => {
    setFadeOut(true)
    setTimeout(onDone, 600)
  }, [onDone])

  useEffect(() => {
    if (!isShared) {
      const t = setTimeout(handleDone, 2200)
      return () => clearTimeout(t)
    }
  }, [isShared, handleDone])

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 100,
        backgroundColor: theme.fond,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        opacity: fadeOut ? 0 : 1,
        transition: 'opacity 0.6s ease',
      }}
    >
      <div
        style={{
          fontFamily: 'var(--font-great-vibes)',
          fontSize: 'clamp(48px, 12vw, 96px)',
          color: theme.accent,
          textAlign: 'center',
          animation: 'splashFadeIn 1s ease forwards',
          lineHeight: 1.2,
        }}
      >
        {data.marie2Prenom || 'Prénom'}
        <br />
        &amp;
        <br />
        {data.marie1Prenom || 'Prénom'}
      </div>
      {firstDate && (
        <div
          style={{
            fontFamily: 'var(--font-playfair-display)',
            fontSize: 14,
            color: theme.textSecondaire,
            letterSpacing: 3,
            marginTop: 24,
            textTransform: 'uppercase',
            animation: 'splashFadeIn 1.4s ease forwards',
          }}
        >
          {formatDateFr(firstDate)}
        </div>
      )}
      {isShared && (
        <button
          onClick={handleDone}
          style={{
            marginTop: 48,
            padding: '16px 40px',
            border: `1px solid ${theme.accent}`,
            borderRadius: 9999,
            backgroundColor: 'transparent',
            color: theme.accent,
            fontFamily: 'var(--font-playfair-display)',
            fontSize: 16,
            cursor: 'pointer',
            letterSpacing: 1,
            animation: 'splashFadeIn 1.8s ease forwards',
          }}
        >
          Découvrir votre faire-part
        </button>
      )}
      <style>{`
        @keyframes splashFadeIn {
          from { opacity: 0; transform: translateY(24px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  )
}

// ============================================================
// MUSIC PLAYER
// ============================================================

function MusicPlayer({ youtubeUrl, themeAccent }: { youtubeUrl: string; themeAccent: string }) {
  const [muted, setMuted] = useState(false)
  const [muteKey, setMuteKey] = useState(0)
  const [showMobileBtn, setShowMobileBtn] = useState(false)
  const videoId = getYouTubeId(youtubeUrl)

  useEffect(() => {
    const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent)
    setShowMobileBtn(isMobile)
  }, [])

  const toggleMute = () => {
    setMuted(m => !m)
    setMuteKey(k => k + 1)
  }

  if (!videoId) return null

  return (
    <>
      <iframe
        key={muteKey}
        src={`https://www.youtube.com/embed/${videoId}?autoplay=1&loop=1&playlist=${videoId}&controls=0&mute=${muted ? 1 : 0}`}
        style={{ position: 'fixed', top: -9999, opacity: 0, pointerEvents: 'none', width: 1, height: 1 }}
        allow="autoplay"
        title="background music"
      />
      {showMobileBtn && (
        <button
          onClick={() => setShowMobileBtn(false)}
          style={{
            position: 'fixed',
            bottom: 80,
            left: '50%',
            transform: 'translateX(-50%)',
            backgroundColor: themeAccent,
            color: 'white',
            padding: '12px 28px',
            borderRadius: 9999,
            border: 'none',
            cursor: 'pointer',
            zIndex: 50,
            fontSize: 14,
            fontFamily: 'var(--font-playfair-display)',
          }}
        >
          ▶ Lancer la musique
        </button>
      )}
      <button
        onClick={toggleMute}
        title={muted ? 'Activer le son' : 'Couper le son'}
        style={{
          position: 'fixed',
          bottom: 24,
          right: 24,
          width: 40,
          height: 40,
          borderRadius: '50%',
          backgroundColor: themeAccent,
          color: 'white',
          border: 'none',
          cursor: 'pointer',
          zIndex: 50,
          fontSize: 16,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        {muted ? '🔇' : '🔊'}
      </button>
    </>
  )
}

// ============================================================
// CARDS VIEW
// ============================================================

function CardsView({
  data,
  onEdit,
  onReset,
  isShared,
}: {
  data: FormData
  onEdit: () => void
  onReset: () => void
  isShared: boolean
}) {
  const theme = THEMES[data.style]
  const sortedCeremonies = sortCeremoniesByDate(data.ceremonies)
  const [splashDone, setSplashDone] = useState(false)
  const [activeCard, setActiveCard] = useState(0)
  const cardRefs = useRef<(HTMLDivElement | null)[]>([])

  useEffect(() => {
    if (!splashDone) return
    const observers = cardRefs.current.map((ref, i) => {
      if (!ref) return null
      const obs = new IntersectionObserver(
        entries => {
          if (entries[0].isIntersecting) setActiveCard(i)
        },
        { threshold: 0.4 }
      )
      obs.observe(ref)
      return obs
    })
    return () => observers.forEach(obs => obs?.disconnect())
  }, [splashDone, sortedCeremonies.length])

  const scrollTo = (i: number) => {
    cardRefs.current[i]?.scrollIntoView({ behavior: 'smooth' })
  }

  const handleShare = async () => {
    try {
      const res = await fetch('/api/save-share', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })
      const { id } = await res.json()
      const url = `${window.location.origin}/faire-part?share=${id}`
      await navigator.clipboard.writeText(url)
      alert('Lien copié dans le presse-papier !')
    } catch {
      alert('Erreur lors du partage')
    }
  }

  return (
    <div style={{ backgroundColor: theme.fond, minHeight: '100vh', color: theme.texte }}>
      {!splashDone && (
        <SplashScreen
          data={data}
          theme={theme}
          onDone={() => setSplashDone(true)}
          isShared={isShared}
        />
      )}

      {splashDone && (
        <>
          {/* Side navigation */}
          <div
            style={{
              position: 'fixed',
              left: 20,
              top: '50%',
              transform: 'translateY(-50%)',
              display: 'flex',
              flexDirection: 'column',
              gap: 10,
              zIndex: 40,
            }}
          >
            {sortedCeremonies.map((_, i) => (
              <button
                key={i}
                onClick={() => scrollTo(i)}
                title={getEventDisplayName(sortedCeremonies[i].type, sortedCeremonies[i].customName)}
                style={{
                  width: 10,
                  height: 10,
                  borderRadius: '50%',
                  border: `1.5px solid ${theme.accent}`,
                  backgroundColor: activeCard === i ? theme.accent : 'transparent',
                  cursor: 'pointer',
                  padding: 0,
                  transition: 'background-color 0.3s ease',
                }}
              />
            ))}
          </div>

          {/* Cards */}
          <div style={{ padding: '40px 20px 80px' }}>
            {sortedCeremonies.map((ceremony, i) => (
              <div key={i}>
                <div
                  ref={el => {
                    cardRefs.current[i] = el
                  }}
                  style={{
                    maxWidth: 600,
                    margin: '0 auto',
                    borderRadius: 4,
                    boxShadow: '0 8px 40px rgba(0,0,0,0.13)',
                    overflow: 'hidden',
                    animation: `cardFadeIn 0.7s ease ${i * 0.12}s both`,
                  }}
                >
                  {renderCard(ceremony, data, theme)}
                </div>

                {i < sortedCeremonies.length - 1 && (
                  <div
                    style={{
                      maxWidth: 600,
                      margin: '36px auto',
                      display: 'flex',
                      alignItems: 'center',
                      gap: 12,
                    }}
                  >
                    <div
                      style={{ flex: 1, height: 1, backgroundColor: theme.accent, opacity: 0.3 }}
                    />
                    <span style={{ color: theme.accent, fontSize: 16 }}>✦</span>
                    <div
                      style={{ flex: 1, height: 1, backgroundColor: theme.accent, opacity: 0.3 }}
                    />
                  </div>
                )}
              </div>
            ))}

            {!isShared && (
              <div
                style={{
                  maxWidth: 600,
                  margin: '48px auto 0',
                  display: 'flex',
                  gap: 12,
                  justifyContent: 'center',
                  flexWrap: 'wrap',
                }}
              >
                <button
                  onClick={onEdit}
                  style={{
                    padding: '12px 28px',
                    borderRadius: 9999,
                    border: `1px solid ${theme.accent}`,
                    backgroundColor: 'transparent',
                    color: theme.accent,
                    cursor: 'pointer',
                    fontSize: 14,
                    fontFamily: 'var(--font-playfair-display)',
                  }}
                >
                  Modifier
                </button>
                <button
                  onClick={handleShare}
                  style={{
                    padding: '12px 28px',
                    borderRadius: 9999,
                    backgroundColor: theme.accent,
                    color: theme.fond === '#1a0a00' ? '#1a0a00' : 'white',
                    border: 'none',
                    cursor: 'pointer',
                    fontSize: 14,
                    fontFamily: 'var(--font-playfair-display)',
                  }}
                >
                  🔗 Partager
                </button>
                <button
                  onClick={onReset}
                  style={{
                    padding: '12px 28px',
                    borderRadius: 9999,
                    border: '1px solid #fecdd3',
                    backgroundColor: 'transparent',
                    color: '#fb7185',
                    cursor: 'pointer',
                    fontSize: 14,
                    fontFamily: 'var(--font-playfair-display)',
                  }}
                >
                  Nouveau
                </button>
              </div>
            )}
          </div>

          {data.youtubeUrl && (
            <MusicPlayer youtubeUrl={data.youtubeUrl} themeAccent={theme.accent} />
          )}
        </>
      )}

      <style>{`
        @keyframes cardFadeIn {
          from { opacity: 0; transform: translateY(40px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  )
}

// ============================================================
// MAIN COMPONENT
// ============================================================

export default function FairePartPage() {
  const [step, setStep] = useState(1)
  const [formData, setFormData] = useState<FormData>(defaultFormData)
  const [showCards, setShowCards] = useState(false)
  const [isShared, setIsShared] = useState(false)

  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    const shareId = params.get('share')
    if (shareId) {
      setIsShared(true)
      fetch(`/api/get-share?id=${shareId}`)
        .then(r => r.json())
        .then((d: FormData) => {
          setFormData(d)
          setShowCards(true)
        })
        .catch(console.error)
    }
  }, [])

  const updateFormData = useCallback((updates: Partial<FormData>) => {
    setFormData(prev => ({ ...prev, ...updates }))
  }, [])

  const handleNext = () => {
    if (step < 4) setStep(step + 1)
    else setShowCards(true)
  }

  const handlePrev = () => {
    if (step > 1) setStep(step - 1)
  }

  if (showCards) {
    return (
      <CardsView
        data={formData}
        onEdit={() => { setShowCards(false); setStep(4) }}
        onReset={() => { setFormData(defaultFormData); setShowCards(false); setStep(1) }}
        isShared={isShared}
      />
    )
  }

  return (
    <div
      className="min-h-screen flex items-start justify-center py-12 px-4"
      style={{ background: 'linear-gradient(160deg, #fdf0f3 0%, #fff5f7 50%, #fdf0f3 100%)' }}
    >
      <div
        className="w-full"
        style={{
          maxWidth: 600,
          backgroundColor: 'white',
          borderRadius: 20,
          padding: 40,
          boxShadow: '0 12px 48px rgba(0,0,0,0.07)',
        }}
      >
        <ProgressBar step={step} />

        {step === 1 && <Step1 data={formData} onChange={updateFormData} />}
        {step === 2 && <Step2 data={formData} onChange={updateFormData} />}
        {step === 3 && <Step3 data={formData} onChange={updateFormData} />}
        {step === 4 && <Step4 data={formData} onChange={updateFormData} />}

        <div className="flex gap-3 mt-8">
          {step > 1 && (
            <button
              type="button"
              onClick={handlePrev}
              className="flex-1 border border-[#fecdd3] bg-transparent text-[#fb7185] rounded-full py-4 font-medium hover:bg-[#fdf0f3] transition-colors"
            >
              Précédent
            </button>
          )}
          <button
            type="button"
            onClick={handleNext}
            className="flex-1 text-white rounded-full py-4 font-bold hover:opacity-90 transition-opacity"
            style={{ background: 'linear-gradient(to right, #f87171, #fb7185)' }}
          >
            {step === 4 ? 'Générer le faire-part ✦' : 'Suivant →'}
          </button>
        </div>
      </div>
    </div>
  )
}
