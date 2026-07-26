'use client'

import { useState } from 'react'

/* ── Types ─────────────────────────────────────────────────── */

export interface ParentInfo {
  prenom: string
  nom: string
  disparu: boolean
}

export interface GrandParentCouple {
  grandPerePrenom: string
  grandPereNom: string
  grandPereDisparu: boolean
  grandMerePrenom: string
  grandMereNom: string
  grandMereDisparu: boolean
}

export interface FamilleInfo {
  pere: ParentInfo
  mere: ParentInfo
  grandParentsPaternels: GrandParentCouple
  grandParentsMaternels: GrandParentCouple
}

export interface InfosData {
  marie1Prenom: string
  marie1Nom: string
  marie2Prenom: string
  marie2Nom: string
  famille1: FamilleInfo
  famille2: FamilleInfo
  emailContact: string
  mariageJuif: boolean
}

export const EMPTY_PARENT: ParentInfo = { prenom: '', nom: '', disparu: false }
export const EMPTY_GP: GrandParentCouple = {
  grandPerePrenom: '', grandPereNom: '', grandPereDisparu: false,
  grandMerePrenom: '', grandMereNom: '', grandMereDisparu: false,
}
export const EMPTY_FAMILLE: FamilleInfo = {
  pere: { ...EMPTY_PARENT },
  mere: { ...EMPTY_PARENT },
  grandParentsPaternels: { ...EMPTY_GP },
  grandParentsMaternels: { ...EMPTY_GP },
}

export const EMPTY_INFOS: InfosData = {
  marie1Prenom: '', marie1Nom: '',
  marie2Prenom: '', marie2Nom: '',
  famille1: { ...EMPTY_FAMILLE, pere: { ...EMPTY_PARENT }, mere: { ...EMPTY_PARENT }, grandParentsPaternels: { ...EMPTY_GP }, grandParentsMaternels: { ...EMPTY_GP } },
  famille2: { ...EMPTY_FAMILLE, pere: { ...EMPTY_PARENT }, mere: { ...EMPTY_PARENT }, grandParentsPaternels: { ...EMPTY_GP }, grandParentsMaternels: { ...EMPTY_GP } },
  emailContact: '',
  mariageJuif: false,
}

/* ── Styles ────────────────────────────────────────────────── */

const GOLD = '#C9A84C'
const DARK = '#2a2520'
const TEXT = '#3a3330'

const S = {
  section: { marginBottom: 32 } as React.CSSProperties,
  sectionTitle: { fontFamily: 'var(--font-playfair-display)', fontSize: 18, color: DARK, marginBottom: 16, fontWeight: 600 } as React.CSSProperties,
  subTitle: { fontFamily: 'var(--font-playfair-display)', fontSize: 14, color: GOLD, marginBottom: 12, fontWeight: 600 } as React.CSSProperties,
  label: { display: 'block', fontFamily: 'var(--font-cormorant-garamond)', fontSize: 14, color: TEXT, marginBottom: 4, fontWeight: 600 } as React.CSSProperties,
  input: { width: '100%', padding: '10px 14px', border: `1px solid ${GOLD}44`, borderRadius: 8, fontSize: 15, fontFamily: 'var(--font-cormorant-garamond)', color: DARK, background: 'white', outline: 'none', boxSizing: 'border-box' as const } as React.CSSProperties,
  row: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 12 } as React.CSSProperties,
  disparuLabel: { display: 'flex', alignItems: 'center', gap: 6, fontFamily: 'var(--font-cormorant-garamond)', fontSize: 12, color: '#9ca3af', cursor: 'pointer', marginTop: 4 } as React.CSSProperties,
  gpBlock: { padding: '14px 16px', background: '#faf8f4', borderRadius: 10, border: `1px solid ${GOLD}22`, marginBottom: 12 } as React.CSSProperties,
  toggle: { display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer', fontFamily: 'var(--font-cormorant-garamond)', fontSize: 13, color: GOLD, marginBottom: 12, background: 'none', border: 'none', padding: 0 } as React.CSSProperties,
}

/* ── Sous-composants ──────────────────────────────────────── */

function Field({ label, value, onChange, placeholder }: { label: string; value: string; onChange: (v: string) => void; placeholder?: string }) {
  return (
    <div>
      <label style={S.label}>{label}</label>
      <input style={S.input} value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder} />
    </div>
  )
}

function ParentFields({ title, parent, onChange }: { title: string; parent: ParentInfo; onChange: (p: ParentInfo) => void }) {
  return (
    <div style={{ marginBottom: 12 }}>
      <div style={{ ...S.label, fontWeight: 600, marginBottom: 8 }}>{title}</div>
      <div style={S.row}>
        <Field label="Prénom" value={parent.prenom} onChange={v => onChange({ ...parent, prenom: v })} />
        <Field label="Nom" value={parent.nom} onChange={v => onChange({ ...parent, nom: v })} />
      </div>
      <label style={S.disparuLabel}>
        <input type="checkbox" checked={parent.disparu} onChange={e => onChange({ ...parent, disparu: e.target.checked })} />
        Disparu(e) — ז״ל
      </label>
    </div>
  )
}

function GrandParentFields({ title, gp, onChange }: { title: string; gp: GrandParentCouple; onChange: (gp: GrandParentCouple) => void }) {
  return (
    <div style={S.gpBlock}>
      <div style={{ ...S.label, fontWeight: 600, marginBottom: 10, fontSize: 13 }}>{title}</div>
      <div style={S.row}>
        <Field label="Grand-père — Prénom" value={gp.grandPerePrenom} onChange={v => onChange({ ...gp, grandPerePrenom: v })} />
        <Field label="Nom" value={gp.grandPereNom} onChange={v => onChange({ ...gp, grandPereNom: v })} />
      </div>
      <label style={S.disparuLabel}>
        <input type="checkbox" checked={gp.grandPereDisparu} onChange={e => onChange({ ...gp, grandPereDisparu: e.target.checked })} />
        Disparu — ז״ל
      </label>
      <div style={{ ...S.row, marginTop: 8 }}>
        <Field label="Grand-mère — Prénom" value={gp.grandMerePrenom} onChange={v => onChange({ ...gp, grandMerePrenom: v })} />
        <Field label="Nom" value={gp.grandMereNom} onChange={v => onChange({ ...gp, grandMereNom: v })} />
      </div>
      <label style={S.disparuLabel}>
        <input type="checkbox" checked={gp.grandMereDisparu} onChange={e => onChange({ ...gp, grandMereDisparu: e.target.checked })} />
        Disparue — ז״ל
      </label>
    </div>
  )
}

function FamilleSection({ title, famille, onChange }: { title: string; famille: FamilleInfo; onChange: (f: FamilleInfo) => void }) {
  const [showGP, setShowGP] = useState(false)

  return (
    <div style={S.section}>
      <div style={S.subTitle}>{title}</div>
      <ParentFields title="Père" parent={famille.pere} onChange={p => onChange({ ...famille, pere: p })} />
      <ParentFields title="Mère" parent={famille.mere} onChange={p => onChange({ ...famille, mere: p })} />

      <button type="button" style={S.toggle} onClick={() => setShowGP(!showGP)}>
        <span style={{ transform: showGP ? 'rotate(90deg)' : 'none', transition: 'transform 0.2s', display: 'inline-block' }}>▸</span>
        {showGP ? 'Masquer les grands-parents' : 'Ajouter les grands-parents'}
      </button>

      {showGP && (
        <>
          <GrandParentFields title="Grands-parents paternels" gp={famille.grandParentsPaternels} onChange={gp => onChange({ ...famille, grandParentsPaternels: gp })} />
          <GrandParentFields title="Grands-parents maternels" gp={famille.grandParentsMaternels} onChange={gp => onChange({ ...famille, grandParentsMaternels: gp })} />
        </>
      )}
    </div>
  )
}

/* ── Composant principal ──────────────────────────────────── */

export default function StepInfos({ data, onChange }: { data: InfosData; onChange: (d: InfosData) => void }) {
  return (
    <div>
      <h2 style={{ fontFamily: 'var(--font-great-vibes)', fontSize: 36, color: GOLD, textAlign: 'center', marginBottom: 8 }}>
        Les mariés
      </h2>
      <p style={{ fontFamily: 'var(--font-cormorant-garamond)', fontSize: 15, color: TEXT, textAlign: 'center', marginBottom: 32, fontStyle: 'italic' }}>
        Renseignez les informations des futurs mariés et de leurs familles
      </p>

      {/* ── Marié(e) 1 ── */}
      <div style={S.section}>
        <div style={S.sectionTitle}>Marié(e) 1</div>
        <div style={S.row}>
          <Field label="Prénom" value={data.marie1Prenom} onChange={v => onChange({ ...data, marie1Prenom: v })} placeholder="Sarah" />
          <Field label="Nom de famille" value={data.marie1Nom} onChange={v => onChange({ ...data, marie1Nom: v })} placeholder="Cohen" />
        </div>
        <FamilleSection title="Famille du/de la marié(e) 1" famille={data.famille1} onChange={f => onChange({ ...data, famille1: f })} />
      </div>

      {/* ── Marié(e) 2 ── */}
      <div style={S.section}>
        <div style={S.sectionTitle}>Marié(e) 2</div>
        <div style={S.row}>
          <Field label="Prénom" value={data.marie2Prenom} onChange={v => onChange({ ...data, marie2Prenom: v })} placeholder="David" />
          <Field label="Nom de famille" value={data.marie2Nom} onChange={v => onChange({ ...data, marie2Nom: v })} placeholder="Lévy" />
        </div>
        <FamilleSection title="Famille du/de la marié(e) 2" famille={data.famille2} onChange={f => onChange({ ...data, famille2: f })} />
      </div>

      {/* ── Email ── */}
      <div style={S.section}>
        <div style={S.sectionTitle}>Contact</div>
        <Field label="Email des mariés (pour recevoir les RSVP)" value={data.emailContact} onChange={v => onChange({ ...data, emailContact: v })} placeholder="sarah.david@email.com" />
      </div>

      {/* ── Mariage juif ── */}
      <div style={S.section}>
        <label style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer' }}>
          <input
            type="checkbox"
            checked={data.mariageJuif}
            onChange={e => onChange({ ...data, mariageJuif: e.target.checked })}
            style={{ width: 18, height: 18, accentColor: GOLD }}
          />
          <span style={{ fontFamily: 'var(--font-cormorant-garamond)', fontSize: 15, color: TEXT }}>
            Mariage juif <span style={{ fontSize: 13, opacity: 0.6 }}>(affiche בס״ד sur chaque page)</span>
          </span>
        </label>
      </div>
    </div>
  )
}
