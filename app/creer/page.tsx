'use client'

import { useState, useEffect, useCallback } from 'react'
import StepInfos, { type InfosData, EMPTY_INFOS } from './components/StepInfos'
import StepEvenements, { type EvenementsData, createEmptyEvenement } from './components/StepEvenements'
import StepDesign, { type DesignData, EMPTY_DESIGN } from './components/StepDesign'
import StepImages, { type ImagesData } from './components/StepImages'
import type { GenerateInput } from '@/lib/refonte/generate-html'

/* ── Données complètes du wizard ──────────────────────────── */

export interface WizardData {
  infos: InfosData
  evenements: EvenementsData
  design: DesignData
  images: ImagesData
}

const INITIAL_DATA: WizardData = {
  infos: { ...EMPTY_INFOS },
  evenements: [createEmptyEvenement()],
  design: { ...EMPTY_DESIGN },
  images: {},
}

/* ── Persistance localStorage ─────────────────────────────── */

const STORAGE_KEY = 'wizard-refonte'

interface SavedState {
  step: number
  data: WizardData
}

function saveToStorage(step: number, data: WizardData) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ step, data }))
  } catch { /* quota exceeded — on ignore silencieusement */ }
}

function loadFromStorage(): SavedState | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return null
    return JSON.parse(raw) as SavedState
  } catch {
    return null
  }
}

function clearStorage() {
  try { localStorage.removeItem(STORAGE_KEY) } catch { /* noop */ }
}

/* ── Styles ────────────────────────────────────────────────── */

const GOLD = '#C9A84C'
const CREAM = '#faf8f4'
const DARK = '#2a2520'
const TEXT = '#3a3330'

const STEPS = [
  { id: 'infos', label: 'Informations', icon: '👤' },
  { id: 'evenements', label: 'Événements', icon: '📅' },
  { id: 'design', label: 'Design', icon: '🎨' },
  { id: 'images', label: 'Images', icon: '🖼' },
]

/* ── Conversion wizard → API ──────────────────────────────── */

function wizardToGenerateInput(data: WizardData): GenerateInput {
  return {
    marie1Prenom: data.infos.marie1Prenom,
    marie1Nom: data.infos.marie1Nom,
    marie2Prenom: data.infos.marie2Prenom,
    marie2Nom: data.infos.marie2Nom,
    famille1: data.infos.famille1,
    famille2: data.infos.famille2,
    evenements: data.evenements.map(e => ({
      id: e.id,
      type: e.type,
      customName: e.customName,
      lieu: e.lieu,
      adresse: e.adresse,
      date: e.date,
      heure: e.heure,
      note: e.note,
      transport: e.transport,
      hebergement: e.hebergement,
    })),
    paletteId: data.design.paletteId,
    logoUrl: data.design.logoUrl,
    musicUrl: data.design.musicUrl,
    images: data.images,
    emailContact: data.infos.emailContact,
  }
}

/* ── Preview component ────────────────────────────────────── */

function Preview({ html, onBack, onDownload }: { html: string; onBack: () => void; onDownload: () => void }) {
  return (
    <div style={{ background: '#1a1a1a', minHeight: '100vh' }}>
      {/* Toolbar */}
      <div style={{
        position: 'sticky', top: 0, zIndex: 50,
        background: 'white', borderBottom: `1px solid ${GOLD}22`,
        padding: '12px 20px',
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
      }}>
        <button type="button" onClick={onBack} style={{
          padding: '8px 20px', borderRadius: 9999,
          border: `1.5px solid ${GOLD}`, background: 'transparent',
          color: GOLD, fontSize: 13, fontWeight: 600,
          fontFamily: 'var(--font-playfair-display)', cursor: 'pointer',
        }}>
          ← Modifier
        </button>

        <span style={{ fontFamily: 'var(--font-playfair-display)', fontSize: 14, color: DARK, fontWeight: 600 }}>
          Aperçu du faire-part
        </span>

        <button type="button" onClick={onDownload} style={{
          padding: '8px 20px', borderRadius: 9999,
          background: `linear-gradient(135deg, ${GOLD}, #e8c96a)`,
          color: 'white', fontSize: 13, fontWeight: 700,
          fontFamily: 'var(--font-playfair-display)',
          border: 'none', cursor: 'pointer',
          boxShadow: `0 4px 16px ${GOLD}44`,
        }}>
          Télécharger HTML
        </button>
      </div>

      {/* iframe preview */}
      <div style={{ display: 'flex', justifyContent: 'center', padding: '20px 0' }}>
        <div style={{
          width: 390, maxWidth: '100%',
          background: 'white', borderRadius: 20,
          overflow: 'hidden',
          boxShadow: '0 20px 80px rgba(0,0,0,0.4)',
          border: '8px solid #333',
        }}>
          <iframe
            srcDoc={html}
            title="Aperçu du faire-part"
            style={{ width: '100%', height: '80vh', border: 'none' }}
            sandbox="allow-scripts"
          />
        </div>
      </div>
    </div>
  )
}

/* ── Page principale ──────────────────────────────────────── */

export default function CreerPage() {
  const [step, setStep] = useState(0)
  const [data, setData] = useState<WizardData>(INITIAL_DATA)
  const [generating, setGenerating] = useState(false)
  const [previewHtml, setPreviewHtml] = useState<string | null>(null)
  const [error, setError] = useState('')
  const [restored, setRestored] = useState(false)

  // Restaurer depuis localStorage au montage
  useEffect(() => {
    const saved = loadFromStorage()
    if (saved) {
      setStep(saved.step)
      setData(saved.data)
    }
    setRestored(true)
  }, [])

  // Sauvegarder à chaque changement (après restauration)
  useEffect(() => {
    if (restored) saveToStorage(step, data)
  }, [step, data, restored])

  const handleReset = useCallback(() => {
    clearStorage()
    setStep(0)
    setData({ ...INITIAL_DATA, evenements: [createEmptyEvenement()] })
    setPreviewHtml(null)
    setError('')
  }, [])

  const canGoNext = () => {
    if (step === 0) {
      return data.infos.marie1Prenom.trim() !== '' && data.infos.marie2Prenom.trim() !== ''
    }
    if (step === 1) {
      return data.evenements.length > 0 && data.evenements.every(e => e.lieu.trim() !== '' && e.date !== '')
    }
    return true
  }

  const goNext = () => {
    if (step < STEPS.length - 1 && canGoNext()) setStep(step + 1)
  }
  const goPrev = () => {
    if (step > 0) setStep(step - 1)
  }

  const handleGenerate = async () => {
    setGenerating(true)
    setError('')
    try {
      const input = wizardToGenerateInput(data)
      const res = await fetch('/api/refonte/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(input),
      })
      const json = await res.json()
      if (!res.ok) {
        setError(json.error || 'Erreur lors de la génération')
        return
      }
      setPreviewHtml(json.html)
    } catch {
      setError('Erreur réseau lors de la génération')
    } finally {
      setGenerating(false)
    }
  }

  const handleDownload = () => {
    if (!previewHtml) return
    const blob = new Blob([previewHtml], { type: 'text/html' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `faire-part-${data.infos.marie1Prenom}-${data.infos.marie2Prenom}.html`.toLowerCase().replace(/\s+/g, '-')
    a.click()
    URL.revokeObjectURL(url)
  }

  // Mode preview
  if (previewHtml) {
    return (
      <Preview
        html={previewHtml}
        onBack={() => setPreviewHtml(null)}
        onDownload={handleDownload}
      />
    )
  }

  return (
    <div style={{ background: CREAM, minHeight: '100vh', fontFamily: 'var(--font-cormorant-garamond)' }}>
      {/* ── Header ── */}
      <header style={{ padding: '20px 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', maxWidth: 800, margin: '0 auto' }}>
        <a href="/" style={{ fontFamily: 'var(--font-great-vibes)', fontSize: 28, color: GOLD, textDecoration: 'none' }}>
          Lov&apos;it
        </a>
        <div style={{ display: 'flex', gap: 16, alignItems: 'center' }}>
          {restored && step > 0 && (
            <button type="button" onClick={() => { if (confirm('Recommencer le formulaire depuis zéro ?')) handleReset() }} style={{
              background: 'none', border: 'none', fontFamily: 'var(--font-cormorant-garamond)',
              fontSize: 13, color: '#d45050', cursor: 'pointer', opacity: 0.7,
            }}>
              Recommencer
            </button>
          )}
          <a href="/" style={{ fontFamily: 'var(--font-cormorant-garamond)', fontSize: 13, color: TEXT, textDecoration: 'none', opacity: 0.6 }}>
            ← Retour à l&apos;accueil
          </a>
        </div>
      </header>

      {/* ── Stepper ── */}
      <div style={{ maxWidth: 600, margin: '0 auto 32px', padding: '0 24px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', position: 'relative' }}>
          {/* Ligne de connexion */}
          <div style={{ position: 'absolute', top: 18, left: '10%', right: '10%', height: 2, background: `${GOLD}22`, zIndex: 0 }} />
          <div style={{ position: 'absolute', top: 18, left: '10%', height: 2, background: GOLD, zIndex: 1, width: `${(step / (STEPS.length - 1)) * 80}%`, transition: 'width 0.4s ease' }} />

          {STEPS.map((s, i) => (
            <button
              key={s.id}
              type="button"
              onClick={() => { if (i <= step) setStep(i) }}
              style={{
                display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6,
                background: 'none', border: 'none', cursor: i <= step ? 'pointer' : 'default',
                zIndex: 2, padding: 0, opacity: i <= step ? 1 : 0.4,
                transition: 'opacity 0.3s ease',
              }}
            >
              <div style={{
                width: 36, height: 36, borderRadius: '50%',
                background: i <= step ? GOLD : 'white',
                border: `2px solid ${i <= step ? GOLD : '#ddd'}`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 16,
                boxShadow: i === step ? `0 0 0 4px ${GOLD}22` : 'none',
                transition: 'all 0.3s ease',
              }}>
                {i < step ? (
                  <span style={{ color: 'white', fontSize: 14, fontWeight: 700 }}>✓</span>
                ) : (
                  <span style={{ filter: i <= step ? 'none' : 'grayscale(1)' }}>{s.icon}</span>
                )}
              </div>
              <span style={{
                fontFamily: 'var(--font-playfair-display)',
                fontSize: 11,
                color: i <= step ? DARK : '#aaa',
                fontWeight: i === step ? 700 : 400,
                whiteSpace: 'nowrap',
              }}>
                {s.label}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* ── Contenu de l'étape ── */}
      <div style={{ maxWidth: 640, margin: '0 auto', padding: '0 24px 120px' }}>
        {step === 0 && (
          <StepInfos data={data.infos} onChange={infos => setData({ ...data, infos })} />
        )}
        {step === 1 && (
          <StepEvenements data={data.evenements} onChange={evenements => setData({ ...data, evenements })} />
        )}
        {step === 2 && (
          <StepDesign data={data.design} onChange={design => setData({ ...data, design })} />
        )}
        {step === 3 && (
          <StepImages events={data.evenements} data={data.images} onChange={images => setData({ ...data, images })} />
        )}

        {error && (
          <p style={{ color: '#d45050', fontSize: 14, textAlign: 'center', marginTop: 16 }}>{error}</p>
        )}
      </div>

      {/* ── Navigation fixe en bas ── */}
      <div style={{
        position: 'fixed', bottom: 0, left: 0, right: 0,
        background: 'white', borderTop: `1px solid ${GOLD}22`,
        padding: '16px 24px',
        boxShadow: '0 -4px 20px rgba(0,0,0,0.06)',
        zIndex: 100,
      }}>
        <div style={{ maxWidth: 640, margin: '0 auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <button
            type="button"
            onClick={goPrev}
            disabled={step === 0}
            style={{
              padding: '12px 28px', borderRadius: 9999,
              border: `1.5px solid ${step === 0 ? '#ddd' : GOLD}`,
              background: 'transparent',
              color: step === 0 ? '#ccc' : GOLD,
              fontSize: 14, fontWeight: 600,
              fontFamily: 'var(--font-playfair-display)',
              cursor: step === 0 ? 'not-allowed' : 'pointer',
            }}
          >
            ← Précédent
          </button>

          <span style={{ fontFamily: 'var(--font-cormorant-garamond)', fontSize: 13, color: '#9ca3af' }}>
            {step + 1} / {STEPS.length}
          </span>

          {step < STEPS.length - 1 ? (
            <button
              type="button"
              onClick={goNext}
              disabled={!canGoNext()}
              style={{
                padding: '12px 28px', borderRadius: 9999,
                background: canGoNext() ? `linear-gradient(135deg, ${GOLD}, #e8c96a)` : '#ddd',
                color: 'white',
                fontSize: 14, fontWeight: 700,
                fontFamily: 'var(--font-playfair-display)',
                border: 'none',
                cursor: canGoNext() ? 'pointer' : 'not-allowed',
                boxShadow: canGoNext() ? `0 4px 16px ${GOLD}44` : 'none',
              }}
            >
              Suivant →
            </button>
          ) : (
            <button
              type="button"
              onClick={handleGenerate}
              disabled={generating}
              style={{
                padding: '12px 28px', borderRadius: 9999,
                background: generating ? '#ccc' : `linear-gradient(135deg, ${GOLD}, #e8c96a)`,
                color: 'white',
                fontSize: 14, fontWeight: 700,
                fontFamily: 'var(--font-playfair-display)',
                border: 'none',
                cursor: generating ? 'wait' : 'pointer',
                boxShadow: generating ? 'none' : `0 4px 16px ${GOLD}44`,
              }}
            >
              {generating ? 'Génération...' : 'Générer mon faire-part ✨'}
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
