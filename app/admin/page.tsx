'use client'

import { useEffect, useState, useCallback } from 'react'

const GOLD = '#C9A84C'
const CREAM = '#faf8f5'
const DARK = '#2d1f14'
const TEXT = '#6a5040'
const LIGHT = '#f5f0e8'

// ── Helpers ────────────────────────────────────────────────────────────────────

function fmtDate(iso: string) {
  if (!iso) return '—'
  return new Date(iso).toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit', year: 'numeric' })
}

function fmtEuro(n: number) {
  return n.toLocaleString('fr-FR') + ' €'
}

function randomCode() {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'
  let c = ''
  for (let i = 0; i < 8; i++) c += chars[Math.floor(Math.random() * chars.length)]
  return c
}

const PACK_LABELS: Record<string, string> = { essentiel: 'Essentiel', premium: 'Premium', luxe: 'Luxe' }
const PACK_COLORS: Record<string, string> = { essentiel: '#6b7280', premium: GOLD, luxe: '#7c3aed' }

// ── Types ──────────────────────────────────────────────────────────────────────

interface Promo { code: string; email: string; pack: string; createdAt: string; usedAt?: string; usedBy?: string }
interface Stats {
  totalSales: number; totalRsvp: number; revenue: number
  byPack: Record<string, number>
  salesByDay: { date: string; count: number }[]
  clients: { email: string; pack: string; date: string; sessionId?: string }[]
}

// ── Composants UI ──────────────────────────────────────────────────────────────

function Card({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div style={{ background: 'white', borderRadius: 16, padding: '28px 32px', boxShadow: '0 4px 24px rgba(0,0,0,0.06)', border: `1px solid ${GOLD}20`, marginBottom: 28 }}>
      <div style={{ fontFamily: 'var(--font-playfair-display)', fontSize: 18, color: DARK, fontWeight: 600, marginBottom: 20, paddingBottom: 12, borderBottom: `1px solid ${GOLD}20` }}>{title}</div>
      {children}
    </div>
  )
}

function StatBox({ label, value, sub }: { label: string; value: string; sub?: string }) {
  return (
    <div style={{ background: LIGHT, borderRadius: 12, padding: '20px 24px', textAlign: 'center', border: `1px solid ${GOLD}22` }}>
      <div style={{ fontFamily: 'var(--font-playfair-display)', fontSize: 28, fontWeight: 700, color: GOLD, marginBottom: 4 }}>{value}</div>
      <div style={{ fontFamily: 'var(--font-cormorant-garamond)', fontSize: 14, color: TEXT, textTransform: 'uppercase', letterSpacing: 1 }}>{label}</div>
      {sub && <div style={{ fontFamily: 'var(--font-cormorant-garamond)', fontStyle: 'italic', fontSize: 13, color: '#9ca3af', marginTop: 4 }}>{sub}</div>}
    </div>
  )
}

function Badge({ used }: { used: boolean }) {
  return (
    <span style={{ display: 'inline-block', padding: '3px 10px', borderRadius: 9999, fontSize: 11, fontWeight: 700, letterSpacing: 0.5, background: used ? '#fee2e2' : '#dcfce7', color: used ? '#dc2626' : '#16a34a' }}>
      {used ? 'Utilisé' : 'Disponible'}
    </span>
  )
}

const inputStyle: React.CSSProperties = {
  width: '100%', padding: '10px 14px', borderRadius: 8, border: `1.5px solid ${GOLD}33`,
  fontSize: 14, color: DARK, outline: 'none', background: '#fdfaf6', boxSizing: 'border-box',
  fontFamily: 'inherit',
}

const btnPrimary: React.CSSProperties = {
  padding: '11px 24px', borderRadius: 9999, border: 'none', cursor: 'pointer',
  background: `linear-gradient(135deg, ${GOLD}, #e8c96a)`, color: 'white',
  fontSize: 14, fontWeight: 700, letterSpacing: '0.04em',
  boxShadow: `0 4px 16px ${GOLD}44`, fontFamily: 'inherit',
}

const btnSecondary: React.CSSProperties = {
  padding: '10px 18px', borderRadius: 8, border: `1.5px solid ${GOLD}55`, cursor: 'pointer',
  background: 'transparent', color: GOLD, fontSize: 13, fontWeight: 600, fontFamily: 'inherit',
}

// ── Section 1 : Créer un code promo ───────────────────────────────────────────

function CreatePromoSection({ adminPassword }: { adminPassword: string }) {
  const [code, setCode] = useState(randomCode())
  const [email, setEmail] = useState('')
  const [pack, setPack] = useState('premium')
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  const create = async () => {
    if (!email.trim()) { setError('Email obligatoire'); return }
    setLoading(true); setError(null); setSuccess(null)
    try {
      const res = await fetch('/api/admin/create-promo', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code, email, pack, adminPassword }),
      })
      const d = await res.json()
      if (d.success) {
        setSuccess(`Code ${code} créé pour ${email} ✓`)
        setCode(randomCode()); setEmail('')
      } else {
        setError(d.error || 'Erreur')
      }
    } catch { setError('Erreur réseau') }
    finally { setLoading(false) }
  }

  return (
    <Card title="✨ Créer un code promo">
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 14 }}>
        <div>
          <label style={{ display: 'block', fontSize: 11, color: '#9ca3af', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 6 }}>Code promo</label>
          <div style={{ display: 'flex', gap: 8 }}>
            <input value={code} onChange={e => setCode(e.target.value.toUpperCase())} style={{ ...inputStyle, fontWeight: 700, letterSpacing: '0.1em' }} />
            <button onClick={() => setCode(randomCode())} style={{ ...btnSecondary, whiteSpace: 'nowrap', fontSize: 12 }}>🎲 Générer</button>
          </div>
        </div>
        <div>
          <label style={{ display: 'block', fontSize: 11, color: '#9ca3af', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 6 }}>Email autorisé *</label>
          <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="marie@exemple.com" style={inputStyle} />
        </div>
        <div>
          <label style={{ display: 'block', fontSize: 11, color: '#9ca3af', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 6 }}>Pack</label>
          <select value={pack} onChange={e => setPack(e.target.value)} style={{ ...inputStyle }}>
            <option value="essentiel">Essentiel — 79€</option>
            <option value="premium">Premium — 129€</option>
            <option value="luxe">Luxe — 199€</option>
          </select>
        </div>
      </div>
      <div style={{ marginTop: 18 }}>
        <button onClick={create} disabled={loading} style={{ ...btnPrimary, opacity: loading ? 0.7 : 1 }}>
          {loading ? 'Création…' : 'Créer le code'}
        </button>
      </div>
      {success && <div style={{ marginTop: 14, padding: '10px 16px', borderRadius: 8, background: '#f0fdf4', border: '1px solid #86efac', color: '#16a34a', fontSize: 14, fontWeight: 600 }}>{success}</div>}
      {error && <div style={{ marginTop: 14, padding: '10px 16px', borderRadius: 8, background: '#fef2f2', border: '1px solid #fca5a5', color: '#dc2626', fontSize: 14 }}>{error}</div>}
    </Card>
  )
}

// ── Section 2 : Liste des codes promos ────────────────────────────────────────

function PromoListSection({ adminPassword }: { adminPassword: string }) {
  const [promos, setPromos] = useState<Promo[]>([])
  const [loading, setLoading] = useState(true)

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const res = await fetch(`/api/admin/list-promos?adminPassword=${encodeURIComponent(adminPassword)}`)
      const d = await res.json()
      if (Array.isArray(d)) setPromos(d)
    } catch { /* ignore */ }
    finally { setLoading(false) }
  }, [adminPassword])

  useEffect(() => { load() }, [load])

  return (
    <Card title="🎟️ Codes promos">
      <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 16 }}>
        <button onClick={load} style={btnSecondary}>↻ Actualiser</button>
      </div>
      {loading ? (
        <div style={{ textAlign: 'center', padding: 24, color: GOLD, fontStyle: 'italic' }}>Chargement…</div>
      ) : promos.length === 0 ? (
        <div style={{ textAlign: 'center', padding: 24, color: '#9ca3af', fontStyle: 'italic', fontSize: 15 }}>Aucun code promo créé</div>
      ) : (
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 14 }}>
            <thead>
              <tr style={{ borderBottom: `2px solid ${GOLD}22` }}>
                {['Code', 'Email', 'Pack', 'Statut', 'Créé le'].map(h => (
                  <th key={h} style={{ textAlign: 'left', padding: '8px 12px', fontSize: 11, color: '#9ca3af', textTransform: 'uppercase', letterSpacing: 1, fontWeight: 600 }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {promos.map((p, i) => (
                <tr key={p.code} style={{ borderBottom: `1px solid ${GOLD}11`, background: i % 2 === 0 ? 'white' : '#fdfaf6' }}>
                  <td style={{ padding: '10px 12px', fontWeight: 700, letterSpacing: '0.1em', color: DARK }}>{p.code}</td>
                  <td style={{ padding: '10px 12px', color: TEXT }}>{p.email}</td>
                  <td style={{ padding: '10px 12px' }}>
                    <span style={{ color: PACK_COLORS[p.pack] || GOLD, fontWeight: 600 }}>{PACK_LABELS[p.pack] || p.pack}</span>
                  </td>
                  <td style={{ padding: '10px 12px' }}><Badge used={!!p.usedAt} /></td>
                  <td style={{ padding: '10px 12px', color: '#9ca3af' }}>{fmtDate(p.createdAt)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </Card>
  )
}

// ── Section 3 & 4 : Stats + Clients ──────────────────────────────────────────

function StatsSection({ adminPassword }: { adminPassword: string }) {
  const [stats, setStats] = useState<Stats | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch(`/api/admin/stats?adminPassword=${encodeURIComponent(adminPassword)}`)
      .then(r => r.json())
      .then(d => { if (!d.error) setStats(d) })
      .catch(() => { /* ignore */ })
      .finally(() => setLoading(false))
  }, [adminPassword])

  if (loading) return <div style={{ textAlign: 'center', padding: 40, color: GOLD, fontStyle: 'italic' }}>Chargement des statistiques…</div>
  if (!stats) return null

  const maxDay = Math.max(...stats.salesByDay.map(d => d.count), 1)

  return (
    <>
      {/* Statistiques */}
      <Card title="📊 Statistiques">
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: 16, marginBottom: 28 }}>
          <StatBox label="Faire-parts vendus" value={String(stats.totalSales)} />
          <StatBox label="RSVP reçus" value={String(stats.totalRsvp)} />
          <StatBox label="Revenus estimés" value={fmtEuro(stats.revenue)} />
          <StatBox
            label="Répartition packs"
            value={`${stats.byPack.premium || 0} Premium`}
            sub={`${stats.byPack.essentiel || 0} Ess. · ${stats.byPack.luxe || 0} Luxe`}
          />
        </div>

        {/* Mini graphique ventes par jour */}
        {stats.salesByDay.length > 0 && (
          <div>
            <div style={{ fontSize: 12, color: '#9ca3af', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 12 }}>Ventes par jour (30 derniers jours)</div>
            <div style={{ display: 'flex', alignItems: 'flex-end', gap: 4, height: 80 }}>
              {stats.salesByDay.map(({ date, count }) => (
                <div key={date} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
                  <div
                    title={`${fmtDate(date)} : ${count} vente(s)`}
                    style={{
                      width: '100%', borderRadius: '3px 3px 0 0',
                      height: `${Math.round((count / maxDay) * 64)}px`,
                      minHeight: 4,
                      background: `linear-gradient(180deg, ${GOLD}, #e8c96a)`,
                      opacity: 0.85,
                    }}
                  />
                </div>
              ))}
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 6, fontSize: 10, color: '#c4b5a0' }}>
              <span>{stats.salesByDay[0]?.date ? fmtDate(stats.salesByDay[0].date) : ''}</span>
              <span>{stats.salesByDay[stats.salesByDay.length - 1]?.date ? fmtDate(stats.salesByDay[stats.salesByDay.length - 1].date) : ''}</span>
            </div>
          </div>
        )}
      </Card>

      {/* Liste clients */}
      <Card title="👥 Clients récents">
        {stats.clients.length === 0 ? (
          <div style={{ textAlign: 'center', padding: 24, color: '#9ca3af', fontStyle: 'italic', fontSize: 15 }}>Aucun client pour le moment</div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 14 }}>
              <thead>
                <tr style={{ borderBottom: `2px solid ${GOLD}22` }}>
                  {['Email', 'Pack acheté', 'Date'].map(h => (
                    <th key={h} style={{ textAlign: 'left', padding: '8px 12px', fontSize: 11, color: '#9ca3af', textTransform: 'uppercase', letterSpacing: 1, fontWeight: 600 }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {stats.clients.map((c, i) => (
                  <tr key={i} style={{ borderBottom: `1px solid ${GOLD}11`, background: i % 2 === 0 ? 'white' : '#fdfaf6' }}>
                    <td style={{ padding: '10px 12px', color: DARK }}>{c.email || '—'}</td>
                    <td style={{ padding: '10px 12px' }}>
                      <span style={{ color: PACK_COLORS[c.pack] || GOLD, fontWeight: 600 }}>{PACK_LABELS[c.pack] || c.pack}</span>
                    </td>
                    <td style={{ padding: '10px 12px', color: '#9ca3af' }}>{fmtDate(c.date)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </>
  )
}

// ── Page principale ────────────────────────────────────────────────────────────

export default function AdminPage() {
  const [password, setPassword] = useState('')
  const [adminPassword, setAdminPassword] = useState<string | null>(null)
  const [checking, setChecking] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    try {
      const saved = sessionStorage.getItem('lovit_admin_auth')
      if (saved) setAdminPassword(saved)
    } catch { /* ignore */ }
  }, [])

  const login = async () => {
    if (!password.trim()) return
    setChecking(true); setError(null)
    try {
      const res = await fetch('/api/admin/verify-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password }),
      })
      const d = await res.json()
      if (d.valid) {
        try { sessionStorage.setItem('lovit_admin_auth', password) } catch { /* ignore */ }
        setAdminPassword(password)
      } else {
        setError('Mot de passe incorrect.')
        setPassword('')
      }
    } catch { setError('Erreur réseau.') }
    finally { setChecking(false) }
  }

  // ── Écran de connexion ──────────────────────────────────────────────────────
  if (!adminPassword) return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: CREAM, padding: 24 }}>
      <div style={{ textAlign: 'center', maxWidth: 380, width: '100%' }}>
        <div style={{ fontFamily: 'var(--font-great-vibes)', fontSize: 44, color: GOLD, marginBottom: 4 }}>Lov&apos;it</div>
        <div style={{ fontFamily: 'var(--font-cormorant-garamond)', fontStyle: 'italic', fontSize: 13, color: `${GOLD}88`, letterSpacing: 4, textTransform: 'uppercase', marginBottom: 32 }}>Admin</div>

        <div style={{ background: 'white', borderRadius: 20, padding: '36px 32px', boxShadow: '0 12px 48px rgba(201,168,76,0.1)', border: `1px solid ${GOLD}22` }}>
          <div style={{ fontFamily: 'var(--font-playfair-display)', fontSize: 18, color: DARK, marginBottom: 20 }}>Accès sécurisé</div>
          <input
            type="password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && login()}
            placeholder="Mot de passe admin"
            style={{ ...inputStyle, marginBottom: 16, fontSize: 16 }}
          />
          <button onClick={login} disabled={checking || !password} style={{ ...btnPrimary, width: '100%', opacity: !password ? 0.6 : 1 }}>
            {checking ? 'Vérification…' : 'Accéder'}
          </button>
          {error && <p style={{ marginTop: 14, color: '#ef4444', fontSize: 14, margin: '14px 0 0' }}>{error}</p>}
        </div>
      </div>
    </div>
  )

  // ── Dashboard ───────────────────────────────────────────────────────────────
  return (
    <div style={{ minHeight: '100vh', background: CREAM, padding: '40px 24px' }}>
      <div style={{ maxWidth: 960, margin: '0 auto' }}>

        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 36, flexWrap: 'wrap', gap: 12 }}>
          <div>
            <div style={{ fontFamily: 'var(--font-great-vibes)', fontSize: 40, color: GOLD, lineHeight: 1 }}>Lov&apos;it</div>
            <div style={{ fontFamily: 'var(--font-cormorant-garamond)', fontStyle: 'italic', fontSize: 14, color: `${GOLD}88`, letterSpacing: 3, textTransform: 'uppercase' }}>Dashboard Admin</div>
          </div>
          <button
            onClick={() => { try { sessionStorage.removeItem('lovit_admin_auth') } catch { /* ignore */ } setAdminPassword(null) }}
            style={{ ...btnSecondary, fontSize: 13 }}
          >
            Déconnexion
          </button>
        </div>

        <CreatePromoSection adminPassword={adminPassword} />
        <PromoListSection adminPassword={adminPassword} />
        <StatsSection adminPassword={adminPassword} />
      </div>
    </div>
  )
}
