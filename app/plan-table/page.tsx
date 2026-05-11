'use client'

import { useState, useEffect } from 'react'
import { DragDropContext, Droppable, Draggable, DropResult } from '@hello-pangea/dnd'
import { useT } from '@/lib/i18n'

const GOLD = '#C9A84C'
const CREAM = '#faf8f5'
const TEXT = '#4a3728'
const BTN: React.CSSProperties = { cursor: 'pointer', touchAction: 'manipulation', WebkitTapHighlightColor: 'transparent' }

interface RSVPEntry {
  nom: string
  reponses?: { ceremonie: string; present: boolean; nbPersonnes: number; accompagnants?: string[] }[]
}

interface TableData {
  id: string
  nom: string
  maxPersonnes: number
  invites: string[]
}

let _tableCounter = 9

function makeTable(n: number): TableData {
  return { id: `t${Date.now()}-${n}`, nom: `Table ${n}`, maxPersonnes: 8, invites: [] }
}

function initTables(): TableData[] {
  return Array.from({ length: 8 }, (_, i) => makeTable(i + 1))
}

// ── Guest view (read-only) ──────────────────────────────────────────────────

function GuestView({ tables }: { tables: TableData[] }) {
  const { t } = useT()
  const allAssigned = tables.flatMap(t => t.invites.map(nom => ({ nom, table: t.nom })))
  return (
    <div style={{ background: CREAM, minHeight: '100vh', padding: '40px 24px', fontFamily: 'var(--font-cormorant-garamond)' }}>
      <div style={{ maxWidth: 680, margin: '0 auto' }}>
        <div style={{ fontFamily: 'var(--font-great-vibes)', fontSize: 52, color: GOLD, textAlign: 'center', marginBottom: 4 }}>{t.planTable.guestViewTitle}</div>
        <div style={{ fontFamily: 'var(--font-cormorant-garamond)', fontStyle: 'italic', fontSize: 16, color: TEXT, textAlign: 'center', marginBottom: 40 }}>{t.planTable.guestViewSub}</div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: 20 }}>
          {tables.filter(t => t.invites.length > 0).map(table => (
            <div key={table.id} style={{ background: 'white', borderRadius: 16, padding: '24px 20px', boxShadow: '0 4px 20px rgba(0,0,0,0.07)', border: `1px solid ${GOLD}33` }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14 }}>
                <div style={{ width: 40, height: 40, borderRadius: '50%', background: `linear-gradient(135deg,${GOLD},#e8c96a)`, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontFamily: 'var(--font-playfair-display)', fontSize: 14, fontWeight: 700, flexShrink: 0 }}>
                  {table.invites.length}
                </div>
                <div style={{ fontFamily: 'var(--font-playfair-display)', fontSize: 17, color: TEXT }}>{table.nom}</div>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                {table.invites.map(nom => (
                  <div key={nom} style={{ fontSize: 15, color: TEXT, padding: '6px 10px', background: `${GOLD}0d`, borderRadius: 8, borderLeft: `3px solid ${GOLD}66` }}>
                    {nom}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
        {allAssigned.length === 0 && (
          <div style={{ textAlign: 'center', color: '#9ca3af', fontStyle: 'italic', marginTop: 60 }}>{t.planTable.notAvailable}</div>
        )}
      </div>
    </div>
  )
}

// ── Editor view ─────────────────────────────────────────────────────────────

export default function PlanTablePage() {
  const { t } = useT()
  const [shareId, setShareId] = useState<string | null>(null)
  const [isGuest, setIsGuest] = useState(false)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [editingTable, setEditingTable] = useState<string | null>(null)
  const [copyDone, setCopyDone] = useState(false)

  // Per-ceremony data
  const [ceremonies, setCeremonies] = useState<string[]>([])
  const [activeCeremony, setActiveCeremony] = useState<string>('')
  const [guestsByCeremony, setGuestsByCeremony] = useState<Record<string, string[]>>({})
  const [tablesByCeremony, setTablesByCeremony] = useState<Record<string, TableData[]>>({})

  // Current ceremony shortcuts
  const guests = guestsByCeremony[activeCeremony] ?? []
  const tables = tablesByCeremony[activeCeremony] ?? initTables()
  const setTables = (updater: TableData[] | ((prev: TableData[]) => TableData[])) => {
    setTablesByCeremony(prev => ({
      ...prev,
      [activeCeremony]: typeof updater === 'function' ? updater(prev[activeCeremony] ?? initTables()) : updater,
    }))
  }
  const setGuests = (updater: string[] | ((prev: string[]) => string[])) => {
    setGuestsByCeremony(prev => ({
      ...prev,
      [activeCeremony]: typeof updater === 'function' ? updater(prev[activeCeremony] ?? []) : updater,
    }))
  }

  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    const id = params.get('shareId')
    const view = params.get('view')
    setShareId(id)
    setIsGuest(view === 'guest')

    if (!id) { setLoading(false); return }

    const fetchAll = async () => {
      try {
        const [rsvpRes, planRes] = await Promise.all([
          fetch(`/api/get-rsvp?shareId=${id}`).then(r => r.json()),
          fetch(`/api/get-plan?shareId=${id}`).then(r => r.json()),
        ])
        const entries: RSVPEntry[] = Array.isArray(rsvpRes) ? rsvpRes : []

        // Extraire les cérémonies uniques depuis les RSVP
        const ceremonySet = new Set<string>()
        for (const e of entries) {
          for (const r of (e.reponses ?? [])) {
            if (r.ceremonie) ceremonySet.add(r.ceremonie)
          }
        }
        const ceremonyList = Array.from(ceremonySet)
        if (ceremonyList.length === 0) ceremonyList.push('Tous les invités')
        setCeremonies(ceremonyList)
        setActiveCeremony(ceremonyList[0])

        // Construire les invités par cérémonie
        const gBC: Record<string, string[]> = {}
        for (const ceremony of ceremonyList) {
          const presentGuests: string[] = []
          for (const e of entries) {
            if (ceremony === 'Tous les invités') {
              const isPresent = e.reponses?.some(r => r.present)
              if (!isPresent) continue
              if (!presentGuests.includes(e.nom)) presentGuests.push(e.nom)
              for (const r of (e.reponses ?? [])) {
                if (r.present && r.accompagnants) {
                  for (const acc of r.accompagnants) {
                    if (acc.trim() && !presentGuests.includes(acc.trim())) presentGuests.push(acc.trim())
                  }
                }
              }
            } else {
              const rep = e.reponses?.find(r => r.ceremonie === ceremony)
              if (!rep?.present) continue
              if (!presentGuests.includes(e.nom)) presentGuests.push(e.nom)
              if (rep.accompagnants) {
                for (const acc of rep.accompagnants) {
                  if (acc.trim() && !presentGuests.includes(acc.trim())) presentGuests.push(acc.trim())
                }
              }
            }
          }
          gBC[ceremony] = presentGuests
        }
        setGuestsByCeremony(gBC)

        // Charger les tables sauvegardées (format: { [ceremony]: TableData[] } ou TableData[] pour rétrocompatibilité)
        const tBC: Record<string, TableData[]> = {}
        if (planRes && typeof planRes === 'object' && !Array.isArray(planRes)) {
          // Nouveau format : objet par cérémonie
          for (const ceremony of ceremonyList) {
            tBC[ceremony] = planRes[ceremony] ?? initTables()
          }
        } else {
          // Ancien format : tableau unique → assigner à la première cérémonie
          const savedTables: TableData[] = Array.isArray(planRes) && planRes.length > 0 ? planRes : initTables()
          tBC[ceremonyList[0]] = savedTables
          for (let i = 1; i < ceremonyList.length; i++) {
            tBC[ceremonyList[i]] = initTables()
          }
        }
        setTablesByCeremony(tBC)

        // Compute next counter from all tables
        const allTables = Object.values(tBC).flat()
        const maxN = allTables.reduce((m, t) => {
          const n = parseInt(t.nom.replace(/\D/g, '')) || 0
          return Math.max(m, n)
        }, allTables.length)
        _tableCounter = maxN + 1
      } finally {
        setLoading(false)
      }
    }
    fetchAll()
  }, [])

  // Guests not yet assigned
  const assignedGuests = new Set(tables.flatMap(t => t.invites))
  const unassigned = guests.filter(g => !assignedGuests.has(g))

  const handleDragEnd = (result: DropResult) => {
    const { source, destination, draggableId } = result
    if (!destination) return
    if (source.droppableId === destination.droppableId && source.index === destination.index) return

    const newTables = tables.map(t => ({ ...t, invites: [...t.invites] }))
    const newUnassigned = [...unassigned]

    // Remove from source
    if (source.droppableId === 'guest-list') {
      newUnassigned.splice(source.index, 1)
    } else {
      const src = newTables.find(t => t.id === source.droppableId)
      if (src) src.invites.splice(source.index, 1)
    }

    // Add to destination
    if (destination.droppableId === 'guest-list') {
      newUnassigned.splice(destination.index, 0, draggableId)
    } else {
      const dst = newTables.find(t => t.id === destination.droppableId)
      if (dst) dst.invites.splice(destination.index, 0, draggableId)
    }

    // Rebuild full guest list preserving assigned order
    const allGuests = [...guests]
    const newAssigned = new Set(newTables.flatMap(t => t.invites))
    const missing = allGuests.filter(g => !newAssigned.has(g) && !newUnassigned.includes(g))
    setGuests([...newUnassigned, ...newTables.flatMap(t => t.invites), ...missing].filter((v, i, a) => a.indexOf(v) === i && allGuests.includes(v)))
    setTables(newTables)
  }

  const addTable = () => {
    setTables(prev => [...prev, makeTable(_tableCounter++)])
  }

  const removeTable = (id: string) => {
    setTables(prev => prev.filter(t => t.id !== id))
  }

  const updateTableName = (id: string, nom: string) => {
    setTables(prev => prev.map(t => t.id === id ? { ...t, nom } : t))
  }

  const updateTableMax = (id: string, max: number) => {
    setTables(prev => prev.map(t => t.id === id ? { ...t, maxPersonnes: max } : t))
  }

  const savePlan = async () => {
    if (!shareId) return
    setSaving(true)
    try {
      await fetch('/api/save-plan', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ shareId, tables: tablesByCeremony }) })
      setSaved(true)
      setTimeout(() => setSaved(false), 2500)
    } finally {
      setSaving(false)
    }
  }

  const [showAutoPanel, setShowAutoPanel] = useState(false)
  const [autoNbTables, setAutoNbTables] = useState(8)
  const [autoMaxPerTable, setAutoMaxPerTable] = useState(8)

  const TABLE_NAME_THEMES: { label: string; names: string[] }[] = [
    { label: `🌸 ${t.planTable.themeFlowers}`, names: ['Rose', 'Pivoine', 'Jasmin', 'Orchidée', 'Lilas', 'Camélia', 'Magnolia', 'Dahlia', 'Iris', 'Tulipe', 'Hortensia', 'Lavande', 'Freesia', 'Amaryllis', 'Lys'] },
    { label: `🌍 ${t.planTable.themeCities}`, names: ['Paris', 'Rome', 'Barcelone', 'Lisbonne', 'Marrakech', 'Tokyo', 'New York', 'Athènes', 'Jérusalem', 'Venise', 'Florence', 'Londres', 'Prague', 'Amsterdam', 'Santorini'] },
    { label: `✈️ ${t.planTable.themeTravel}`, names: ['Bali', 'Toscane', 'Mykonos', 'Maldives', 'Seychelles', 'Amalfi', 'Capri', 'Zanzibar', 'Tahiti', 'Bora Bora', 'Hawaï', 'Dubrovnik', 'Majorque', 'Sardaigne', 'Corfou'] },
    { label: `💎 ${t.planTable.themeGems}`, names: ['Diamant', 'Émeraude', 'Rubis', 'Saphir', 'Perle', 'Améthyste', 'Topaze', 'Opale', 'Jade', 'Grenat', 'Cristal', 'Agate', 'Onyx', 'Quartz', 'Turquoise'] },
    { label: `🎵 ${t.planTable.themeMusic}`, names: ['Adagio', 'Allegro', 'Sérénade', 'Valse', 'Nocturne', 'Mélodie', 'Harmonie', 'Symphonie', 'Ballade', 'Bolero', 'Sonate', 'Prelude', 'Cantate', 'Aria', 'Rondo'] },
    { label: `⭐ ${t.planTable.themeStars}`, names: ['Sirius', 'Véga', 'Altaïr', 'Polaris', 'Cassiopée', 'Orion', 'Andromède', 'Lyra', 'Pégase', 'Antarès', 'Bételgeuse', 'Rigel', 'Aldébaran', 'Arcturus', 'Capella'] },
  ]

  const generateRandomPlan = () => {
    const shuffled = [...guests].sort(() => Math.random() - 0.5)
    const newTables: TableData[] = []
    for (let i = 0; i < autoNbTables; i++) {
      newTables.push({
        id: `t${Date.now()}-${i}`,
        nom: `Table ${i + 1}`,
        maxPersonnes: autoMaxPerTable,
        invites: [],
      })
    }
    let tableIdx = 0
    for (const guest of shuffled) {
      if (newTables[tableIdx].invites.length >= autoMaxPerTable) {
        tableIdx++
        if (tableIdx >= newTables.length) break
      }
      newTables[tableIdx].invites.push(guest)
    }
    _tableCounter = autoNbTables + 1
    setTables(newTables)
    setShowAutoPanel(false)
  }

  const applyTableNames = (names: string[]) => {
    setTables(prev => prev.map((t, i) => ({ ...t, nom: names[i] || t.nom })))
  }

  const copyGuestLink = () => {
    const url = `${window.location.origin}/plan-table?shareId=${shareId}&view=guest`
    navigator.clipboard.writeText(url).then(() => { setCopyDone(true); setTimeout(() => setCopyDone(false), 2000) })
  }

  if (loading) return (
    <div style={{ background: CREAM, minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'var(--font-cormorant-garamond)', fontSize: 18, color: GOLD }}>
      {t.common.loading}
    </div>
  )

  if (isGuest) return <GuestView tables={tables} />

  if (!shareId) return (
    <div style={{ background: CREAM, minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'var(--font-cormorant-garamond)', fontSize: 17, color: TEXT }}>
      Lien invalide — shareId manquant dans l&apos;URL.
    </div>
  )

  return (
    <div style={{ background: CREAM, minHeight: '100vh', fontFamily: 'var(--font-cormorant-garamond)', display: 'flex', flexDirection: 'column' }}>
      {/* Header */}
      <div style={{ background: 'white', borderBottom: `1px solid ${GOLD}33`, padding: '16px 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
        <div>
          <div style={{ fontFamily: 'var(--font-great-vibes)', fontSize: 36, color: GOLD, lineHeight: 1 }}>{t.planTable.title}</div>
          <div style={{ fontSize: 13, color: '#9ca3af', marginTop: 2 }}>{guests.length} {t.planTable.guests} · {tables.length} {t.planTable.tables} · {unassigned.length} {t.planTable.unassigned}</div>
          {/* Onglets par cérémonie */}
          {ceremonies.length > 1 && (
            <div style={{ display: 'flex', gap: 6, marginTop: 10, flexWrap: 'wrap' }}>
              {ceremonies.map(c => (
                <button key={c} onClick={() => setActiveCeremony(c)} style={{
                  ...BTN, padding: '6px 14px', borderRadius: 9999, fontSize: 12, fontWeight: activeCeremony === c ? 700 : 400,
                  border: `1.5px solid ${activeCeremony === c ? GOLD : '#d1d5db'}`,
                  background: activeCeremony === c ? `${GOLD}15` : 'white',
                  color: activeCeremony === c ? GOLD : TEXT,
                }}>{c} ({(guestsByCeremony[c] ?? []).length})</button>
              ))}
            </div>
          )}
        </div>
        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
          <button onClick={() => setShowAutoPanel(p => !p)} style={{ ...BTN, padding: '9px 18px', borderRadius: 9999, border: `1px solid ${GOLD}`, background: showAutoPanel ? `${GOLD}15` : 'transparent', color: GOLD, fontSize: 13 }}>
            🎲 {t.planTable.autoBtn}
          </button>
          <button onClick={addTable} style={{ ...BTN, padding: '9px 18px', borderRadius: 9999, border: `1px solid ${GOLD}`, background: 'transparent', color: GOLD, fontSize: 13 }}>
            + {t.planTable.addTable}
          </button>
          <button onClick={copyGuestLink} style={{ ...BTN, padding: '9px 18px', borderRadius: 9999, border: `1px solid ${GOLD}`, background: 'transparent', color: GOLD, fontSize: 13 }}>
            {copyDone ? `✓ ${t.common.linkCopied}` : `🔗 ${t.planTable.shareGuests}`}
          </button>
          <button onClick={savePlan} disabled={saving} style={{ ...BTN, padding: '9px 20px', borderRadius: 9999, background: saved ? '#22c55e' : `linear-gradient(135deg,${GOLD},#e8c96a)`, color: 'white', border: 'none', fontSize: 13, fontWeight: 700 }}>
            {saving ? t.planTable.saving : saved ? `✓ ${t.planTable.savedOk}` : `💾 ${t.planTable.save}`}
          </button>
        </div>
      </div>

      {/* Panneau placement automatique */}
      {showAutoPanel && (
        <div style={{ background: 'white', borderBottom: `1px solid ${GOLD}22`, padding: '16px 24px' }}>
          <div style={{ display: 'flex', gap: 24, flexWrap: 'wrap', alignItems: 'flex-end' }}>
            {/* Config tables */}
            <div style={{ display: 'flex', gap: 16, alignItems: 'flex-end' }}>
              <div>
                <label style={{ fontSize: 11, color: '#9ca3af', display: 'block', marginBottom: 4 }}>{t.planTable.nbTables}</label>
                <input type="number" min={1} max={30} value={autoNbTables} onChange={e => setAutoNbTables(Number(e.target.value))}
                  style={{ width: 60, padding: '6px 8px', borderRadius: 8, border: `1px solid ${GOLD}44`, fontSize: 14, textAlign: 'center' }} />
              </div>
              <div>
                <label style={{ fontSize: 11, color: '#9ca3af', display: 'block', marginBottom: 4 }}>{t.planTable.placesPerTable}</label>
                <input type="number" min={4} max={15} value={autoMaxPerTable} onChange={e => setAutoMaxPerTable(Number(e.target.value))}
                  style={{ width: 60, padding: '6px 8px', borderRadius: 8, border: `1px solid ${GOLD}44`, fontSize: 14, textAlign: 'center' }} />
              </div>
              <button onClick={generateRandomPlan} style={{ ...BTN, padding: '8px 20px', borderRadius: 9999, background: `linear-gradient(135deg,${GOLD},#e8c96a)`, color: 'white', border: 'none', fontSize: 13, fontWeight: 700 }}>
                🎲 {t.planTable.generateBtn}
              </button>
            </div>

            {/* Séparateur */}
            <div style={{ width: 1, height: 40, background: `${GOLD}33` }} />

            {/* Noms de tables */}
            <div>
              <label style={{ fontSize: 11, color: '#9ca3af', display: 'block', marginBottom: 6 }}>{t.planTable.tableNames}</label>
              <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                {TABLE_NAME_THEMES.map(theme => (
                  <button key={theme.label} onClick={() => applyTableNames(theme.names)} style={{ ...BTN, padding: '5px 12px', borderRadius: 9999, border: `1px solid ${GOLD}44`, background: 'transparent', color: TEXT, fontSize: 12 }}>
                    {theme.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
          <div style={{ fontSize: 11, color: '#9ca3af', marginTop: 8, fontStyle: 'italic' }}>
            {guests.length} {t.planTable.guests} → {autoNbTables} {t.planTable.tables} × {autoMaxPerTable} places = {autoNbTables * autoMaxPerTable} places ({autoNbTables * autoMaxPerTable >= guests.length ? `✓ ${t.planTable.sufficient}` : `⚠ ${t.planTable.missing} ${guests.length - autoNbTables * autoMaxPerTable} places`})
          </div>
        </div>
      )}

      {/* Body */}
      <DragDropContext onDragEnd={handleDragEnd}>
        <div style={{ display: 'flex', flex: 1, gap: 0, overflow: 'hidden' }}>

          {/* Guest list */}
          <div style={{ width: 220, flexShrink: 0, background: 'white', borderRight: `1px solid ${GOLD}22`, display: 'flex', flexDirection: 'column', height: 'calc(100vh - 73px)' }}>
            <div style={{ padding: '14px 16px 10px', borderBottom: `1px solid ${GOLD}22` }}>
              <div style={{ fontFamily: 'var(--font-playfair-display)', fontSize: 13, color: TEXT, letterSpacing: 1, textTransform: 'uppercase' }}>{t.planTable.subtitle}</div>
              <div style={{ fontSize: 12, color: '#9ca3af', marginTop: 2 }}>{unassigned.length} {t.planTable.guests}</div>
            </div>
            <Droppable droppableId="guest-list">
              {(provided, snapshot) => (
                <div
                  ref={provided.innerRef}
                  {...provided.droppableProps}
                  style={{ flex: 1, overflowY: 'auto', padding: '8px 10px', background: snapshot.isDraggingOver ? `${GOLD}08` : 'white', transition: 'background 0.2s', minHeight: 40 }}
                >
                  {unassigned.length === 0 && !snapshot.isDraggingOver && (
                    <div style={{ fontSize: 13, color: '#9ca3af', fontStyle: 'italic', textAlign: 'center', marginTop: 24 }}>{t.planTable.allPlaced} ✓</div>
                  )}
                  {unassigned.map((nom, index) => (
                    <Draggable key={nom} draggableId={nom} index={index}>
                      {(prov, snap) => (
                        <div
                          ref={prov.innerRef}
                          {...prov.draggableProps}
                          {...prov.dragHandleProps}
                          style={{
                            padding: '8px 10px', borderRadius: 8, marginBottom: 5, fontSize: 14, color: TEXT,
                            background: snap.isDragging ? `${GOLD}22` : `${GOLD}0d`,
                            border: `1px solid ${snap.isDragging ? GOLD : `${GOLD}33`}`,
                            boxShadow: snap.isDragging ? '0 4px 12px rgba(0,0,0,0.12)' : 'none',
                            cursor: 'grab',
                            ...prov.draggableProps.style,
                          }}
                        >
                          {nom}
                        </div>
                      )}
                    </Draggable>
                  ))}
                  {provided.placeholder}
                </div>
              )}
            </Droppable>
          </div>

          {/* Tables grid */}
          <div style={{ flex: 1, overflowY: 'auto', padding: '24px 20px', display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: 20, alignContent: 'start' }}>
            {tables.map(table => {
              const isFull = table.invites.length >= table.maxPersonnes
              return (
                <div key={table.id} style={{ background: 'white', borderRadius: 16, boxShadow: '0 4px 20px rgba(0,0,0,0.06)', border: `1px solid ${isFull ? GOLD : `${GOLD}33`}`, overflow: 'hidden' }}>
                  {/* Table header */}
                  <div style={{ padding: '12px 14px 10px', borderBottom: `1px solid ${GOLD}22`, display: 'flex', alignItems: 'center', gap: 8 }}>
                    <div style={{ width: 36, height: 36, borderRadius: '50%', background: `linear-gradient(135deg,${GOLD},#e8c96a)`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                      <span style={{ color: 'white', fontSize: 12, fontWeight: 700, fontFamily: 'var(--font-playfair-display)' }}>{table.invites.length}/{table.maxPersonnes}</span>
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      {editingTable === table.id ? (
                        <input
                          autoFocus
                          value={table.nom}
                          onChange={e => updateTableName(table.id, e.target.value)}
                          onBlur={() => setEditingTable(null)}
                          onKeyDown={e => e.key === 'Enter' && setEditingTable(null)}
                          style={{ width: '100%', border: 'none', borderBottom: `1px solid ${GOLD}`, outline: 'none', fontFamily: 'var(--font-playfair-display)', fontSize: 14, color: TEXT, background: 'transparent', padding: '2px 0' }}
                        />
                      ) : (
                        <div onClick={() => setEditingTable(table.id)} style={{ fontFamily: 'var(--font-playfair-display)', fontSize: 14, color: TEXT, cursor: 'text', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }} title={t.planTable.rename}>
                          {table.nom}
                        </div>
                      )}
                      <div style={{ display: 'flex', alignItems: 'center', gap: 4, marginTop: 2 }}>
                        <span style={{ fontSize: 10, color: '#9ca3af' }}>{t.planTable.max}</span>
                        <select value={table.maxPersonnes} onChange={e => updateTableMax(table.id, Number(e.target.value))}
                          style={{ fontSize: 11, color: '#9ca3af', border: 'none', outline: 'none', background: 'transparent', cursor: 'pointer', padding: 0 }}>
                          {[6, 7, 8, 9, 10, 11, 12].map(n => <option key={n} value={n}>{n}</option>)}
                        </select>
                      </div>
                    </div>
                    <button onClick={() => removeTable(table.id)} style={{ ...BTN, background: 'none', border: 'none', color: '#fca5a5', fontSize: 14, padding: '2px 4px', flexShrink: 0 }}>✕</button>
                  </div>

                  {/* Drop zone */}
                  <Droppable droppableId={table.id} isDropDisabled={isFull}>
                    {(provided, snapshot) => (
                      <div
                        ref={provided.innerRef}
                        {...provided.droppableProps}
                        style={{ padding: '8px 10px', minHeight: 52, background: snapshot.isDraggingOver && !isFull ? `${GOLD}10` : 'white', transition: 'background 0.2s' }}
                      >
                        {table.invites.length === 0 && !snapshot.isDraggingOver && (
                          <div style={{ fontSize: 12, color: '#d1d5db', fontStyle: 'italic', textAlign: 'center', padding: '10px 0' }}>{t.planTable.dragHere}</div>
                        )}
                        {isFull && !snapshot.isDraggingOver && table.invites.length > 0 && (
                          <div style={{ fontSize: 11, color: GOLD, textAlign: 'center', marginBottom: 4, fontWeight: 600 }}>{t.planTable.tableFull}</div>
                        )}
                        {table.invites.map((nom, i) => (
                          <Draggable key={nom} draggableId={nom} index={i}>
                            {(prov, snap) => (
                              <div
                                ref={prov.innerRef}
                                {...prov.draggableProps}
                                {...prov.dragHandleProps}
                                style={{
                                  padding: '6px 10px', borderRadius: 7, marginBottom: 4, fontSize: 13, color: TEXT,
                                  background: snap.isDragging ? `${GOLD}22` : `${GOLD}08`,
                                  border: `1px solid ${snap.isDragging ? GOLD : `${GOLD}22`}`,
                                  cursor: 'grab',
                                  boxShadow: snap.isDragging ? '0 4px 12px rgba(0,0,0,0.1)' : 'none',
                                  ...prov.draggableProps.style,
                                }}
                              >
                                {nom}
                              </div>
                            )}
                          </Draggable>
                        ))}
                        {provided.placeholder}
                      </div>
                    )}
                  </Droppable>
                </div>
              )
            })}
          </div>
        </div>
      </DragDropContext>
    </div>
  )
}
