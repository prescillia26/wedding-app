'use client'

import { useState } from 'react'

interface RSVPResponse {
  nom: string
  presence: boolean | null
  nbPersonnes: string
  message?: string
  evenements?: string[]
  sentAt?: string
}

const ACCENT = '#C9A84C'
const FOND = '#fdf0f3'

const BTN: React.CSSProperties = {
  touchAction: 'manipulation',
  WebkitTapHighlightColor: 'transparent',
  cursor: 'pointer',
}

export default function DashboardPage() {
  const [shareId, setShareId] = useState('')
  const [responses, setResponses] = useState<RSVPResponse[] | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [activeTab, setActiveTab] = useState<string>('__all__')

  const load = async () => {
    if (!shareId.trim()) return
    setLoading(true)
    setError('')
    setResponses(null)
    try {
      const res = await fetch(`/api/get-rsvp?shareId=${encodeURIComponent(shareId.trim())}`)
      const data = await res.json()
      if (!Array.isArray(data)) throw new Error('Faire-part introuvable ou aucune réponse')
      setResponses(data)
      setActiveTab('__all__')
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Erreur inconnue')
    } finally {
      setLoading(false)
    }
  }

  // Collect all unique event names across responses
  const allEvents: string[] = []
  if (responses) {
    responses.forEach(r => {
      (r.evenements ?? []).forEach(ev => {
        if (!allEvents.includes(ev)) allEvents.push(ev)
      })
    })
  }

  const filteredResponses = responses
    ? activeTab === '__all__'
      ? responses
      : responses.filter(r => (r.evenements ?? []).includes(activeTab))
    : []

  const presents = responses?.filter(r => r.presence === true) ?? []
  const absents = responses?.filter(r => r.presence === false) ?? []
  const totalPersonnes = presents.reduce((s, r) => s + 1 + (parseInt(r.nbPersonnes) || 0), 0)

  return (
    <div style={{ minHeight: '100vh', background: `linear-gradient(160deg, ${FOND} 0%, #fff5f7 50%, ${FOND} 100%)`, padding: '48px 16px', fontFamily: 'Arial, Helvetica, sans-serif' }}>

      {/* En-tête */}
      <div style={{ textAlign: 'center', marginBottom: 40 }}>
        <p style={{ fontSize: 10, textTransform: 'uppercase', letterSpacing: '0.3em', color: `${ACCENT}aa`, fontWeight: 600, marginBottom: 8 }}>Espace mariés</p>
        <h1 style={{ fontFamily: 'Georgia, serif', fontSize: '2rem', fontWeight: 300, color: 'rgba(74,55,40,0.8)', letterSpacing: '0.06em', margin: '0 0 12px' }}>Dashboard RSVP</h1>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 12 }}>
          <div style={{ width: 40, height: 1, background: `${ACCENT}44` }} />
          <span style={{ color: `${ACCENT}66` }}>✦</span>
          <div style={{ width: 40, height: 1, background: `${ACCENT}44` }} />
        </div>
      </div>

      {/* Champ shareId */}
      <div style={{ maxWidth: 560, margin: '0 auto 40px', background: 'white', borderRadius: 20, padding: '28px 24px', boxShadow: '0 8px 40px rgba(0,0,0,0.07)', border: '1px solid #eae6e1' }}>
        <label style={{ display: 'block', fontSize: 10, textTransform: 'uppercase', letterSpacing: '0.15em', color: ACCENT, marginBottom: 8, fontWeight: 700 }}>
          Identifiant de votre faire-part
        </label>
        <div style={{ display: 'flex', gap: 10 }}>
          <input
            value={shareId}
            onChange={e => setShareId(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && load()}
            placeholder="Collez votre shareId ici…"
            style={{ flex: 1, border: '1px solid #d6d1cb', borderRadius: 10, padding: '12px 14px', fontSize: 14, outline: 'none', color: '#3a3330' }}
          />
          <button
            onClick={load}
            disabled={loading}
            style={{ ...BTN, padding: '12px 22px', borderRadius: 10, background: loading ? '#e5e7eb' : `linear-gradient(135deg, ${ACCENT}, #e8c96a)`, color: loading ? '#9ca3af' : 'white', border: 'none', fontSize: 14, fontWeight: 700, whiteSpace: 'nowrap' }}
          >
            {loading ? '…' : 'Voir les RSVP'}
          </button>
        </div>
        {error && <p style={{ marginTop: 10, fontSize: 13, color: '#d45050' }}>{error}</p>}
      </div>

      {/* Résultats */}
      {responses !== null && (
        <div style={{ maxWidth: 860, margin: '0 auto' }} className="rsvp-content">

          {/* Résumé */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 14, marginBottom: 32 }}>
            {[
              { label: 'Présents', value: presents.length, color: '#22c55e', icon: '✓' },
              { label: 'Absents', value: absents.length, color: '#d45050', icon: '✗' },
              { label: 'Personnes au total', value: totalPersonnes, color: ACCENT, icon: '♦' },
            ].map(s => (
              <div key={s.label} style={{ background: 'white', borderRadius: 16, padding: '20px 16px', textAlign: 'center', boxShadow: '0 4px 20px rgba(0,0,0,0.06)', border: '1px solid #eae6e1' }}>
                <div style={{ fontSize: 28, color: s.color, fontWeight: 700, marginBottom: 4 }}>{s.value}</div>
                <div style={{ fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.1em', color: '#9ca3af', fontWeight: 600 }}>{s.label}</div>
              </div>
            ))}
          </div>

          {/* Onglets événements */}
          {allEvents.length > 0 && (
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 20 }}>
              {['__all__', ...allEvents].map(ev => (
                <button
                  key={ev}
                  onClick={() => setActiveTab(ev)}
                  style={{
                    ...BTN,
                    padding: '8px 18px', borderRadius: 9999, fontSize: 13, fontWeight: 600,
                    border: `1.5px solid ${activeTab === ev ? ACCENT : '#d6d1cb'}`,
                    background: activeTab === ev ? ACCENT : 'white',
                    color: activeTab === ev ? 'white' : '#3a3330',
                    transition: 'all 0.2s',
                  }}
                >
                  {ev === '__all__' ? 'Tous les invités' : ev}
                </button>
              ))}
            </div>
          )}

          {/* Bouton export PDF */}
          <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 16 }}>
            <button
              onClick={() => window.print()}
              style={{ ...BTN, padding: '10px 20px', borderRadius: 9999, border: `1px solid ${ACCENT}`, background: 'transparent', color: ACCENT, fontSize: 13, fontWeight: 600, display: 'flex', alignItems: 'center', gap: 6 }}
            >
              🖨 Exporter en PDF
            </button>
          </div>

          {/* Tableau */}
          <div style={{ background: 'white', borderRadius: 20, boxShadow: '0 8px 40px rgba(0,0,0,0.07)', border: '1px solid #eae6e1', overflow: 'hidden' }}>
            {filteredResponses.length === 0 ? (
              <div style={{ padding: 48, textAlign: 'center', color: '#9ca3af', fontStyle: 'italic' }}>
                Aucune réponse pour cet événement
              </div>
            ) : (
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ background: `${ACCENT}11`, borderBottom: `2px solid ${ACCENT}22` }}>
                    {['Invité', 'Présence', 'Pers.', 'Événements', 'Petit mot'].map(h => (
                      <th key={h} style={{ padding: '14px 16px', textAlign: 'left', fontSize: 10, textTransform: 'uppercase', letterSpacing: '0.12em', color: ACCENT, fontWeight: 700 }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filteredResponses.map((r, i) => (
                    <tr key={i} style={{ borderBottom: '1px solid #eae6e1', background: i % 2 === 0 ? 'white' : '#f9f8f6' }}>
                      <td style={{ padding: '14px 16px', color: '#3a3330', fontWeight: 600, fontSize: 14 }}>{r.nom}</td>
                      <td style={{ padding: '14px 16px' }}>
                        <span style={{
                          display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                          width: 28, height: 28, borderRadius: '50%',
                          background: r.presence === true ? '#dcfce7' : r.presence === false ? '#fee2e2' : '#f3f4f6',
                          color: r.presence === true ? '#16a34a' : r.presence === false ? '#dc2626' : '#9ca3af',
                          fontWeight: 700, fontSize: 14,
                        }}>
                          {r.presence === true ? '✓' : r.presence === false ? '✗' : '?'}
                        </span>
                      </td>
                      <td style={{ padding: '14px 16px', color: '#6a5040', fontSize: 14, textAlign: 'center' }}>
                        {r.presence === true ? 1 + (parseInt(r.nbPersonnes) || 0) : '—'}
                      </td>
                      <td style={{ padding: '14px 16px', fontSize: 12, color: '#9ca3af' }}>
                        {(r.evenements ?? []).length > 0
                          ? (r.evenements ?? []).map((ev, ei) => (
                            <span key={ei} style={{ display: 'inline-block', background: `${ACCENT}18`, color: ACCENT, borderRadius: 4, padding: '2px 6px', fontSize: 11, marginRight: 4, marginBottom: 2 }}>{ev}</span>
                          ))
                          : '—'}
                      </td>
                      <td style={{ padding: '14px 16px', color: '#6a5040', fontStyle: r.message ? 'italic' : 'normal', fontSize: 13 }}>
                        {r.message || <span style={{ color: '#d1d5db' }}>—</span>}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>

          <p style={{ textAlign: 'center', marginTop: 16, fontSize: 12, color: '#d1d5db' }}>
            {filteredResponses.length} réponse{filteredResponses.length > 1 ? 's' : ''}
          </p>
        </div>
      )}

      {/* Styles d'impression */}
      <style>{`
        @media print {
          body { background: white !important; }
          button { display: none !important; }
          input { display: none !important; }
          .rsvp-content { margin: 0 !important; }
        }
      `}</style>
    </div>
  )
}
