'use client'

import { useState, useEffect, useRef } from 'react'
import { useT } from '@/lib/i18n'
import { LangSwitch } from './components/LangSwitch'

const GOLD = '#C9A84C'
const CREAM = '#faf8f4'
const DARK = '#2a2520'
const TEXT = '#3a3330'
const LIGHT_GOLD = '#f5f1e8'

function useFadeIn() {
  const ref = useRef<HTMLDivElement>(null)
  const [visible, setVisible] = useState(false)
  useEffect(() => {
    const el = ref.current
    if (!el) return
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) { setVisible(true); obs.disconnect() } }, { threshold: 0.15 })
    obs.observe(el)
    return () => obs.disconnect()
  }, [])
  return { ref, style: { opacity: visible ? 1 : 0, transform: visible ? 'translateY(0)' : 'translateY(32px)', transition: 'opacity 0.7s ease, transform 0.7s ease' } as React.CSSProperties }
}

function Separator() {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 12, margin: '0 auto', width: '100%', maxWidth: 240 }}>
      <div style={{ flex: 1, height: '0.5px', background: GOLD, opacity: 0.45 }} />
      <span style={{ color: GOLD, fontSize: 10 }}>✦</span>
      <div style={{ flex: 1, height: '0.5px', background: GOLD, opacity: 0.45 }} />
    </div>
  )
}

function FakeCard({ name1, name2, date, accent, fond }: { name1: string; name2: string; date: string; accent: string; fond: string }) {
  return (
    <div style={{ background: fond, borderRadius: 12, padding: '32px 28px', boxShadow: '0 12px 48px rgba(0,0,0,0.12)', textAlign: 'center', minHeight: 260, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', border: `1px solid ${accent}33` }}>
      <div style={{ fontFamily: 'var(--font-great-vibes)', fontSize: 13, color: accent, letterSpacing: 3, marginBottom: 8, textTransform: 'uppercase' }}>Wedding</div>
      <div style={{ fontFamily: 'var(--font-great-vibes)', fontSize: 38, color: accent, lineHeight: 1.15 }}>{name1}</div>
      <div style={{ fontFamily: 'var(--font-cormorant-garamond)', fontSize: 22, color: accent, margin: '4px 0' }}>&</div>
      <div style={{ fontFamily: 'var(--font-great-vibes)', fontSize: 38, color: accent, lineHeight: 1.15 }}>{name2}</div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, margin: '14px 0 10px' }}>
        <div style={{ width: 28, height: '0.5px', background: accent, opacity: 0.5 }} />
        <span style={{ color: accent, fontSize: 9 }}>✦</span>
        <div style={{ width: 28, height: '0.5px', background: accent, opacity: 0.5 }} />
      </div>
      <div style={{ fontFamily: 'var(--font-playfair-display)', fontSize: 11, color: accent, letterSpacing: 3, textTransform: 'uppercase', opacity: 0.85 }}>{date}</div>
    </div>
  )
}

function ShowcaseCarousel() {
  const [active, setActive] = useState(0)
  const cards: { event: string; name1: string; name2: string; he1?: string; he2?: string; date: string; lieu: string; accent: string; fond: string; verse?: string; parents?: string; joie?: string; honore?: string; oui?: boolean; dark?: boolean; bsd?: boolean; defunt?: string; buttons?: boolean; frame?: string }[] = [
    // 1 — Houppa bordeaux
    { event: 'LA HOUPPA', name1: 'Sarah', name2: 'David', he1: 'שרה', he2: 'דוד', date: '15 Juin 2026', lieu: 'Synagogue Beth-El, Paris', accent: '#8b1a2a', fond: '#fdf8f8', verse: 'קוֹל שָׂשׂוֹן וְקוֹל שִׂמְחָה קוֹל חָתָן וְקוֹל כַּלָּה', parents: 'M. & Mme Cohen · M. & Mme Lévy', joie: 'ont la joie de vous faire part du mariage de leurs enfants', honore: 'et seront honorés de votre présence à la cérémonie religieuse', bsd: true, defunt: 'Marie Cohen ז״ל', buttons: true, frame: 'https://res.cloudinary.com/dau96mui2/image/upload/v1776785419/51_m9vx96.png' },
    // 2 — Mairie doré
    { event: 'LA MAIRIE', name1: 'Léa', name2: 'Antoine', date: '12 Juillet 2026', lieu: 'Mairie du 16e, Paris', accent: '#a08930', fond: '#fdf8f0', oui: true, honore: 'se diront', buttons: true, frame: 'https://res.cloudinary.com/dau96mui2/image/upload/v1776857011/55_l7xahl.png' },
    // 3 — Shabbat Hatan bleu
    { event: 'SHABBAT HATAN', name1: 'Esther', name2: 'Nathan', he1: 'אסתר', he2: 'נתן', date: '20 Mars 2026', lieu: 'Synagogue Buffault, Paris', accent: '#2c4a7c', fond: '#f0f4f8', verse: '✡ ✦ ✡', parents: 'Les familles Azoulay & Mimoun', joie: 'ont la joie de vous convier au Shabbat Hatan de leurs enfants', bsd: true, buttons: true, frame: 'https://res.cloudinary.com/dau96mui2/image/upload/v1776878838/96_bauksw.png' },
    // 4 — Houppa rose
    { event: 'LA HOUPPA', name1: 'Rachel', name2: 'Yossef', he1: 'רחל', he2: 'יוסף', date: '8 Mai 2026', lieu: 'Espace Rachi, Paris', accent: '#9a5a6a', fond: '#faf6f4', verse: 'קוֹל שָׂשׂוֹן וְקוֹל שִׂמְחָה קוֹל חָתָן וְקוֹל כַּלָּה', parents: 'M. & Mme Benaim · M. & Mme Toledano', joie: 'ont la joie de vous faire part du mariage de leurs enfants', honore: 'et seront honorés de votre présence à la houppa', bsd: true, defunt: 'Simha Benaim ז״ל', buttons: true, frame: 'https://res.cloudinary.com/dau96mui2/image/upload/v1776878823/75_qc4gsm.png' },
    // 5 — Soirée champêtre
    { event: 'SOIRÉE', name1: 'Emma', name2: 'Raphaël', date: '28 Août 2026', lieu: 'Domaine de Montceau', accent: '#7a9e6e', fond: '#f4f7f0', joie: 'vous invitent à célébrer leur union', buttons: true, frame: 'https://res.cloudinary.com/dau96mui2/image/upload/v1777896746/149_jwshu6.png' },
    // 6 — Mairie gris
    { event: 'LA MAIRIE', name1: 'Chloé', name2: 'Alexandre', date: '3 Avril 2026', lieu: 'Mairie du 8e, Paris', accent: '#555555', fond: '#f8f8f8', oui: true, honore: 'se diront', buttons: true, frame: 'https://res.cloudinary.com/dau96mui2/image/upload/v1776878824/77_rnfcni.png' },
    // 7 — Beach party fuchsia
    { event: 'BEACH PARTY', name1: 'Inès', name2: 'Michaël', date: '10 Juillet 2026', lieu: 'Plage de Pampelonne', accent: '#d4006a', fond: '#fff0f8', joie: 'vous invitent à faire la fête avec eux', buttons: true, frame: 'https://res.cloudinary.com/dau96mui2/image/upload/v1776878845/95_w9natp.png' },
    // 8 — Houppa marine & or
    { event: 'LA HOUPPA', name1: 'Déborah', name2: 'Élie', he1: 'דבורה', he2: 'אליהו', date: '22 Décembre 2026', lieu: 'Grande Synagogue, Paris', accent: '#C9A84C', fond: '#0a1628', dark: true, verse: 'קוֹל שָׂשׂוֹן וְקוֹל שִׂמְחָה קוֹל חָתָן וְקוֹל כַּלָּה', parents: 'M. & Mme Abecassis · M. & Mme Sebag', joie: 'ont la joie de vous faire part du mariage de leurs enfants', honore: 'et seront honorés de votre présence à la cérémonie religieuse', bsd: true, defunt: 'Jacob Abecassis ז״ל', buttons: true },
    // 9 — Cocktail menthe
    { event: 'COCKTAIL', name1: 'Julie', name2: 'Thomas', date: '14 Juin 2026', lieu: 'Jardin du Luxembourg', accent: '#2a9a6a', fond: '#f0faf5', joie: 'vous invitent à lever leur verre', buttons: true, frame: 'https://res.cloudinary.com/dau96mui2/image/upload/v1777896741/150_rzlu80.png' },
    // 10 — Shabbat Hatan bordeaux
    { event: 'SHABBAT HATAN', name1: 'Léa', name2: 'Ariel', he1: 'לאה', he2: 'אריאל', date: '11 Octobre 2026', lieu: 'Synagogue de Boulogne', accent: '#8b1a2a', fond: '#fdf8f8', verse: '✡ ✦ ✡', parents: 'Les familles Benchetrit & Ohayon', joie: 'ont la joie de vous convier au Shabbat Hatan de leurs enfants', bsd: true, buttons: true, frame: 'https://res.cloudinary.com/dau96mui2/image/upload/v1776878824/79_msrbl6.png' },
  ]

  useEffect(() => {
    const t = setInterval(() => setActive(p => (p + 1) % cards.length), 3500)
    return () => clearInterval(t)
  }, [cards.length])

  const c = cards[active]
  const textColor = c.dark ? '#f5e6d0' : c.accent

  return (
    <div style={{ maxWidth: 380, margin: '0 auto' }}>
      <div style={{ position: 'relative', borderRadius: 16, overflow: 'hidden', boxShadow: '0 24px 80px rgba(0,0,0,0.14)', background: c.fond, transition: 'background 0.6s ease', height: 480, border: c.dark && !c.frame ? `1px solid ${textColor}33` : 'none' }}>
        {/* Cadre décoratif en fond */}
        {c.frame && (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={c.frame} alt="" style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', objectFit: 'cover', mixBlendMode: 'multiply', opacity: 0.8, pointerEvents: 'none', zIndex: 0 }} />
        )}
        <div key={active} style={{ padding: '36px 32px', textAlign: 'center', position: 'relative', zIndex: 1, animation: 'showcaseFade 0.6s ease', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', boxSizing: 'border-box' }}>
          <style>{`@keyframes showcaseFade{from{opacity:0;transform:translateY(10px)}to{opacity:1;transform:translateY(0)}}`}</style>
          {/* בס״ד */}
          {c.bsd && <div style={{ position: 'absolute', top: 14, right: 18, fontFamily: 'serif', fontSize: 12, color: textColor, direction: 'rtl', opacity: 0.7 } as React.CSSProperties}>בס״ד</div>}
          <div style={{ fontFamily: 'var(--font-playfair-display)', fontSize: 11, fontWeight: 700, letterSpacing: 5, textTransform: 'uppercase', color: textColor, marginBottom: 10 }}>{c.event}</div>
          {c.verse && <div style={{ fontFamily: 'serif', fontSize: 12, color: textColor, direction: 'rtl', marginBottom: 12, opacity: 0.7, lineHeight: 1.6 } as React.CSSProperties}>{c.verse}</div>}
          {c.defunt && (
            <div style={{ marginBottom: 12, paddingBottom: 10, borderBottom: `1px solid ${textColor}22` }}>
              <div style={{ fontSize: 12, color: textColor, opacity: 0.5, marginBottom: 4 }}>🕯</div>
              <div style={{ fontFamily: 'var(--font-cormorant-garamond)', fontStyle: 'italic', fontSize: 11, color: textColor, opacity: 0.65 }}>{c.defunt}</div>
            </div>
          )}
          {c.parents && <div style={{ fontFamily: 'var(--font-cormorant-garamond)', fontStyle: 'italic', fontSize: 11, color: textColor, marginBottom: 4, opacity: 0.7 }}>{c.parents}</div>}
          {/* Phrase de joie */}
          {c.joie && <div style={{ fontFamily: 'var(--font-cormorant-garamond)', fontStyle: 'italic', fontSize: 11, color: textColor, marginBottom: 10, opacity: 0.65, lineHeight: 1.5 }}>{c.joie}</div>}
          {/* Prénoms avec hébreu à côté */}
          <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'center', gap: 8, flexWrap: 'wrap' }}>
            <div style={{ fontFamily: 'var(--font-great-vibes)', fontSize: 40, color: textColor, lineHeight: 1.15 }}>{c.name1}</div>
            {c.he1 && <div style={{ fontFamily: 'var(--font-bellefair), serif', fontSize: 19, color: textColor, opacity: 0.65, direction: 'rtl' } as React.CSSProperties}>{c.he1}</div>}
          </div>
          <div style={{ fontFamily: 'var(--font-cormorant-garamond)', fontSize: 18, color: textColor, opacity: 0.45, margin: '2px 0' }}>&</div>
          <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'center', gap: 8, flexWrap: 'wrap', marginBottom: 8 }}>
            {c.he2 && <div style={{ fontFamily: 'var(--font-bellefair), serif', fontSize: 19, color: textColor, opacity: 0.65, direction: 'rtl' } as React.CSSProperties}>{c.he2}</div>}
            <div style={{ fontFamily: 'var(--font-great-vibes)', fontSize: 40, color: textColor, lineHeight: 1.15 }}>{c.name2}</div>
          </div>
          {/* Phrase d'honneur */}
          {c.honore && !c.oui && <div style={{ fontFamily: 'var(--font-cormorant-garamond)', fontStyle: 'italic', fontSize: 11, color: textColor, opacity: 0.65, marginBottom: 10, lineHeight: 1.5 }}>{c.honore}</div>}
          {c.oui && (
            <>
              <div style={{ fontFamily: 'var(--font-cormorant-garamond)', fontStyle: 'italic', fontSize: 14, color: textColor, opacity: 0.8, marginBottom: 2 }}>{c.honore || 'se diront'}</div>
              <div style={{ fontFamily: 'var(--font-great-vibes)', fontSize: 52, color: textColor, lineHeight: 1, marginBottom: 14 }}>&laquo; Oui &raquo;</div>
            </>
          )}
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, justifyContent: 'center', marginBottom: 10 }}>
            <div style={{ width: 24, height: '0.5px', background: textColor, opacity: 0.4 }} />
            <span style={{ color: textColor, fontSize: 8, opacity: 0.5 }}>✦</span>
            <div style={{ width: 24, height: '0.5px', background: textColor, opacity: 0.4 }} />
          </div>
          <div style={{ fontFamily: 'var(--font-playfair-display)', fontSize: 12, fontWeight: 700, color: textColor, letterSpacing: 3, textTransform: 'uppercase', marginBottom: 4 }}>{c.date}</div>
          <div style={{ fontFamily: 'var(--font-cormorant-garamond)', fontStyle: 'italic', fontSize: 13, color: textColor, opacity: 0.7, marginBottom: c.buttons ? 14 : 0 }}>{c.lieu}</div>
          {/* Boutons Maps / Waze */}
          {c.buttons && (
            <div style={{ display: 'flex', gap: 8, justifyContent: 'center', marginTop: 10 }}>
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: 4, padding: '6px 14px', borderRadius: 2, background: textColor, color: c.dark ? c.fond : 'white', fontSize: 9, fontWeight: 700, letterSpacing: 1, textTransform: 'uppercase', fontFamily: 'var(--font-playfair-display)' }}>
                <svg width="10" height="10" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5a2.5 2.5 0 010-5 2.5 2.5 0 010 5z"/></svg>
                Maps
              </div>
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: 4, padding: '6px 14px', borderRadius: 2, border: `1px solid ${textColor}`, color: textColor, fontSize: 9, fontWeight: 700, letterSpacing: 1, textTransform: 'uppercase', fontFamily: 'var(--font-playfair-display)' }}>
                Waze
              </div>
            </div>
          )}
        </div>
      </div>
      {/* Dots */}
      <div style={{ display: 'flex', justifyContent: 'center', gap: 6, marginTop: 16 }}>
        {cards.map((_, i) => (
          <button key={i} onClick={() => setActive(i)} style={{ width: i === active ? 20 : 6, height: 6, borderRadius: 3, background: i === active ? GOLD : `${GOLD}44`, border: 'none', cursor: 'pointer', transition: 'all 0.3s ease', padding: 0 }} />
        ))}
      </div>
      <div style={{ textAlign: 'center', marginTop: 8 }}>
        <span style={{ fontFamily: 'var(--font-cormorant-garamond)', fontStyle: 'italic', fontSize: 12, color: `${TEXT}88` }}>{c.event.charAt(0) + c.event.slice(1).toLowerCase()}</span>
      </div>
    </div>
  )
}

function FAQItem({ q, a }: { q: string; a: string }) {
  const [open, setOpen] = useState(false)
  return (
    <div style={{ borderBottom: `1px solid ${GOLD}33`, overflow: 'hidden' }}>
      <button onClick={() => setOpen(o => !o)} style={{ width: '100%', background: 'none', border: 'none', cursor: 'pointer', padding: '20px 0', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 16, textAlign: 'left' }}>
        <span style={{ fontFamily: 'var(--font-playfair-display)', fontSize: 16, color: DARK, flex: 1 }}>{q}</span>
        <span style={{ color: GOLD, fontSize: 20, fontWeight: 300, transform: open ? 'rotate(45deg)' : 'none', transition: 'transform 0.3s', flexShrink: 0 }}>+</span>
      </button>
      <div style={{ maxHeight: open ? 300 : 0, overflow: 'hidden', transition: 'max-height 0.4s ease' }}>
        <p style={{ fontFamily: 'var(--font-cormorant-garamond)', fontSize: 17, color: TEXT, lineHeight: 1.8, margin: '0 0 20px', paddingRight: 32 }}>{a}</p>
      </div>
    </div>
  )
}

export default function Home() {
  const { t, locale } = useT()
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  useEffect(() => {
    fetch('/api/auth/me').then(r => { if (r.ok) setIsLoggedIn(true) }).catch(() => {})
  }, [])

  const social = useFadeIn()
  const howItWorks = useFadeIn()
  const examples = useFadeIn()
  const features = useFadeIn()
  const pricing = useFadeIn()
  const faq = useFadeIn()

  const S: Record<string, React.CSSProperties> = {
    section: { padding: '80px 24px', maxWidth: 1000, margin: '0 auto' },
    sectionTitle: { fontFamily: 'var(--font-great-vibes)', fontSize: 'clamp(44px, 8vw, 64px)', color: GOLD, textAlign: 'center', marginBottom: 8, lineHeight: 1.2 },
    sectionSub: { fontFamily: 'var(--font-playfair-display)', fontSize: 'clamp(14px, 2.5vw, 18px)', color: TEXT, textAlign: 'center', marginBottom: 48, lineHeight: 1.7 },
    btnPrimary: { display: 'inline-block', padding: '16px 40px', borderRadius: 9999, background: `linear-gradient(135deg, ${GOLD}, #e8c96a)`, color: 'white', fontSize: 16, fontWeight: 700, textDecoration: 'none', letterSpacing: '0.08em', fontFamily: 'var(--font-playfair-display)', boxShadow: `0 6px 28px ${GOLD}55`, border: 'none', cursor: 'pointer' },
    btnOutline: { display: 'inline-block', padding: '14px 36px', borderRadius: 9999, background: 'transparent', color: GOLD, fontSize: 15, fontWeight: 600, textDecoration: 'none', letterSpacing: '0.08em', fontFamily: 'var(--font-playfair-display)', border: `1.5px solid ${GOLD}` },
  }

  const ctaHref = '/faire-part'
  const h = t.home
  const c = t.common

  return (
    <div style={{ background: CREAM, color: DARK, fontFamily: 'var(--font-cormorant-garamond)', overflowX: 'hidden' }}>

      {/* ── HERO ── */}
      <div style={{ background: `linear-gradient(180deg, #fff 0%, ${CREAM} 100%)`, padding: '60px 24px 48px', textAlign: 'center' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', maxWidth: 1000, margin: '0 auto 40px' }}>
          <div style={{ fontFamily: 'var(--font-great-vibes)', fontSize: 32, color: GOLD }}>Lov&apos;it</div>
          <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
            <LangSwitch />
            {isLoggedIn ? (
              <a href="/mon-espace" style={{ fontFamily: 'var(--font-playfair-display)', fontSize: 13, color: GOLD, textDecoration: 'none', padding: '8px 20px', borderRadius: 9999, border: `1px solid ${GOLD}` }}>{c.yourSpace}</a>
            ) : (
              <a href="/connexion" style={{ fontFamily: 'var(--font-playfair-display)', fontSize: 13, color: GOLD, textDecoration: 'none', padding: '8px 20px', borderRadius: 9999, border: `1px solid ${GOLD}` }}>{c.login}</a>
            )}
          </div>
        </div>

        <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '6px 16px', borderRadius: 9999, background: `${GOLD}12`, border: `1px solid ${GOLD}33`, marginBottom: 24 }}>
          <span style={{ color: GOLD, fontSize: 12 }}>✦✦✦✦✦</span>
          <span style={{ fontFamily: 'var(--font-cormorant-garamond)', fontSize: 13, color: TEXT }}>{h.badge}</span>
        </div>

        <h1 style={{ fontFamily: 'var(--font-playfair-display)', fontSize: 'clamp(24px, 5vw, 40px)', color: DARK, maxWidth: 650, margin: '0 auto 16px', lineHeight: 1.35, fontWeight: 400 }}>
          {h.heroTitle1}<br />
          <span style={{ fontFamily: 'var(--font-great-vibes)', color: GOLD, fontSize: 'clamp(32px, 7vw, 56px)' }}>{h.heroTitle2}</span>
        </h1>

        <p style={{ fontFamily: 'var(--font-cormorant-garamond)', fontStyle: 'italic', fontSize: 19, color: TEXT, maxWidth: 520, margin: '0 auto 12px', lineHeight: 1.7 }}>
          {h.heroSubtitle}
        </p>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 24, maxWidth: 800, margin: '32px auto 40px' }}>

          {/* ── Pack Premium — 69€ ── */}
          <div style={{ background: 'white', borderRadius: 24, padding: '36px 28px', boxShadow: `0 16px 64px ${GOLD}22`, border: `1.5px solid ${GOLD}66`, textAlign: 'center', position: 'relative' }}>
            <div style={{ fontFamily: 'var(--font-cormorant-garamond)', fontStyle: 'italic', fontSize: 13, color: GOLD, letterSpacing: 3, textTransform: 'uppercase', marginBottom: 8 }}>Premium</div>
            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'center', gap: 4, marginBottom: 4 }}>
              <span style={{ fontFamily: 'var(--font-cormorant-garamond)', fontSize: 18, color: '#9ca3af', textDecoration: 'line-through', marginTop: 8, marginRight: 4 }}>{h.priceBefore}</span>
              <span style={{ fontFamily: 'var(--font-playfair-display)', fontSize: 48, color: DARK, lineHeight: 1, fontWeight: 700 }}>{c.price}</span>
            </div>
            <div style={{ fontFamily: 'var(--font-cormorant-garamond)', fontSize: 14, color: TEXT, marginBottom: 20 }}>{c.singlePayment} — {c.lifetimeAccess}</div>
            <div style={{ textAlign: 'left', marginBottom: 24 }}>
              {h.pricingFeatures.map(item => (
                <div key={item} style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
                  <span style={{ color: GOLD, fontSize: 13 }}>✓</span>
                  <span style={{ fontFamily: 'var(--font-cormorant-garamond)', fontSize: 14, color: TEXT }}>{item}</span>
                </div>
              ))}
            </div>
            <a href="/faire-part?pack=premium" style={{ ...S.btnPrimary, display: 'block', width: '100%', boxSizing: 'border-box', textAlign: 'center', fontSize: 14, textDecoration: 'none' }}>
              {isLoggedIn ? c.createYourFairepart : c.startNow}
            </a>
            <p style={{ fontFamily: 'var(--font-cormorant-garamond)', fontStyle: 'italic', fontSize: 11, color: `${TEXT}77`, marginTop: 10, marginBottom: 0 }}>
              {c.satisfiedOrRefunded}
            </p>
          </div>

          {/* ── Pack Luxe Aquarelle — 99€ ── */}
          <div style={{ background: 'white', borderRadius: 24, padding: '36px 28px', boxShadow: `0 24px 72px ${GOLD}33`, border: `2.5px solid ${GOLD}`, textAlign: 'center', position: 'relative' }}>
            <div style={{ position: 'absolute', top: -12, left: '50%', transform: 'translateX(-50%)', background: `linear-gradient(135deg, ${GOLD}, #e8c96a)`, color: 'white', fontSize: 9, fontWeight: 800, letterSpacing: '0.15em', textTransform: 'uppercase', padding: '5px 16px', borderRadius: 9999, whiteSpace: 'nowrap', boxShadow: `0 4px 16px ${GOLD}55` }}>
              Recommandé
            </div>
            <div style={{ fontFamily: 'var(--font-cormorant-garamond)', fontStyle: 'italic', fontSize: 13, color: GOLD, letterSpacing: 3, textTransform: 'uppercase', marginBottom: 8 }}>Luxe Aquarelle</div>
            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'center', gap: 4, marginBottom: 4 }}>
              <span style={{ fontFamily: 'var(--font-playfair-display)', fontSize: 48, color: DARK, lineHeight: 1, fontWeight: 700 }}>99&euro;</span>
            </div>
            <div style={{ fontFamily: 'var(--font-cormorant-garamond)', fontSize: 14, color: TEXT, marginBottom: 20 }}>{c.singlePayment} — {c.lifetimeAccess}</div>
            <div style={{ textAlign: 'left', marginBottom: 24 }}>
              {[
                locale === 'en' ? 'Everything in Premium' : 'Tout le pack Premium',
                locale === 'en' ? 'AI watercolors per event (real venue)' : 'Aquarelles IA par événement (lieu réel)',
                locale === 'en' ? 'Decorative illustrations (rings, doves…)' : 'Illustrations décoratives (bagues, colombes…)',
                locale === 'en' ? 'Custom color palette' : 'Palette de couleurs personnalisée',
                locale === 'en' ? 'AI-personalized Luxe design' : 'Design Luxe personnalisé par l\'IA',
              ].map(item => (
                <div key={item} style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
                  <span style={{ color: GOLD, fontSize: 13 }}>✓</span>
                  <span style={{ fontFamily: 'var(--font-cormorant-garamond)', fontSize: 14, color: TEXT }}>{item}</span>
                </div>
              ))}
            </div>
            <a href="/faire-part?pack=luxe" style={{ ...S.btnPrimary, display: 'block', width: '100%', boxSizing: 'border-box', textAlign: 'center', fontSize: 14, textDecoration: 'none' }}>
              {locale === 'en' ? 'Create my Luxe invitation' : 'Créer mon faire-part Luxe'}
            </a>
          </div>

        </div>

        <ShowcaseCarousel />
      </div>

      {/* ── PREUVE SOCIALE ── */}
      <div ref={social.ref} style={{ ...social.style, background: LIGHT_GOLD, padding: '48px 24px' }}>
        <div style={{ display: 'flex', justifyContent: 'center', gap: 40, flexWrap: 'wrap', maxWidth: 800, margin: '0 auto' }}>
          {(['couples', 'time', 'rsvp', 'rating'] as const).map(key => (
            <div key={key} style={{ textAlign: 'center', minWidth: 100 }}>
              <div style={{ fontFamily: 'var(--font-playfair-display)', fontSize: 28, color: GOLD, fontWeight: 700, marginBottom: 4 }}>{h.stats[key]}</div>
              <div style={{ fontFamily: 'var(--font-cormorant-garamond)', fontSize: 14, color: TEXT }}>{h.statsLabels[key]}</div>
            </div>
          ))}
        </div>
      </div>

      {/* ── COMMENT ÇA MARCHE ── */}
      <div ref={howItWorks.ref} style={howItWorks.style}>
        <div style={S.section}>
          <div style={S.sectionTitle}>{h.howItWorks}</div>
          <p style={S.sectionSub}>{h.howItWorksSub}</p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 40 }}>
            {h.steps.map((step, i) => (
              <div key={i} style={{ textAlign: 'center' }}>
                <div style={{ width: 56, height: 56, borderRadius: '50%', background: `linear-gradient(135deg, ${GOLD}, #e8c96a)`, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 18px', boxShadow: `0 8px 24px ${GOLD}44` }}>
                  <span style={{ fontFamily: 'var(--font-playfair-display)', fontSize: 20, color: 'white', fontWeight: 700 }}>{i + 1}</span>
                </div>
                <div style={{ fontFamily: 'var(--font-playfair-display)', fontSize: 19, color: DARK, marginBottom: 8 }}>{step.title}</div>
                <p style={{ fontFamily: 'var(--font-cormorant-garamond)', fontSize: 17, color: TEXT, lineHeight: 1.8, margin: 0 }}>{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── EXEMPLES ── */}
      <div ref={examples.ref} style={{ ...examples.style, background: LIGHT_GOLD }}>
        <div style={S.section}>
          <div style={S.sectionTitle}>{h.themes}</div>
          <p style={S.sectionSub}>{h.themesSub}</p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 28 }}>
            <div>
              <div style={{ textAlign: 'center', marginBottom: 10, fontFamily: 'var(--font-playfair-display)', fontSize: 13, color: TEXT, letterSpacing: 2, textTransform: 'uppercase' }}>{h.themeNames.classic}</div>
              <FakeCard name1="Sophie" name2="Thomas" date="15 Juin 2026 · Lyon" accent="#C9A84C" fond="#fdf8f0" />
            </div>
            <div>
              <div style={{ textAlign: 'center', marginBottom: 10, fontFamily: 'var(--font-playfair-display)', fontSize: 13, color: TEXT, letterSpacing: 2, textTransform: 'uppercase' }}>{h.themeNames.country}</div>
              <FakeCard name1="Camille" name2="Julien" date="4 Mai 2026 · Bordeaux" accent="#8fad6a" fond="#f5f0e8" />
            </div>
            <div>
              <div style={{ textAlign: 'center', marginBottom: 10, fontFamily: 'var(--font-playfair-display)', fontSize: 13, color: TEXT, letterSpacing: 2, textTransform: 'uppercase' }}>{h.themeNames.oriental}</div>
              <FakeCard name1="Yasmine" name2="Karim" date="8 Août 2026 · Marseille" accent="#D4A847" fond="#1a0a00" />
            </div>
          </div>
        </div>
      </div>

      {/* ── FEATURES ── */}
      <div ref={features.ref} style={features.style}>
        <div style={S.section}>
          <div style={S.sectionTitle}>{h.features}</div>
          <p style={S.sectionSub}>{h.featuresSub}</p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 20 }}>
            {h.featuresList.map(({ icon, title, desc }) => (
              <div key={title} style={{ display: 'flex', gap: 16, alignItems: 'flex-start', padding: '20px 22px', background: 'white', borderRadius: 12, border: `1px solid ${GOLD}22`, boxShadow: '0 2px 12px rgba(0,0,0,0.04)' }}>
                <div style={{ fontSize: 28, flexShrink: 0 }}>{icon}</div>
                <div>
                  <div style={{ fontFamily: 'var(--font-playfair-display)', fontSize: 16, color: DARK, marginBottom: 4 }}>{title}</div>
                  <p style={{ fontFamily: 'var(--font-cormorant-garamond)', fontSize: 16, color: TEXT, margin: 0, lineHeight: 1.7 }}>{desc}</p>
                </div>
              </div>
            ))}
          </div>
          <div style={{ textAlign: 'center', marginTop: 48 }}>
            <a href={ctaHref} style={S.btnPrimary}>
              {isLoggedIn ? c.createYourFairepart : c.startNow}
            </a>
          </div>
        </div>
      </div>

      {/* ── TÉMOIGNAGES ── */}
      <div style={{ background: LIGHT_GOLD }}>
        <div style={S.section}>
          <div style={S.sectionTitle}>{h.testimonials}</div>
          <p style={S.sectionSub}>{h.testimonialsSub}</p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 28 }}>
            {h.reviews.map(({ name, city, text }) => (
              <div key={name} style={{ background: 'white', borderRadius: 16, padding: '32px 28px', boxShadow: '0 4px 24px rgba(0,0,0,0.06)', border: `1px solid ${GOLD}22` }}>
                <div style={{ color: GOLD, fontSize: 22, marginBottom: 14, letterSpacing: 2 }}>✦✦✦✦✦</div>
                <p style={{ fontFamily: 'var(--font-cormorant-garamond)', fontStyle: 'italic', fontSize: 17, color: TEXT, lineHeight: 1.85, margin: '0 0 20px' }}>&quot;{text}&quot;</p>
                <div style={{ fontFamily: 'var(--font-playfair-display)', fontSize: 14, color: DARK }}>{name}</div>
                <div style={{ fontFamily: 'var(--font-cormorant-garamond)', fontSize: 14, color: `${GOLD}aa` }}>{city}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── PRICING (ancre pour le scroll) ── */}
      <div ref={pricing.ref} style={pricing.style} />

      {/* ── FAQ ── */}
      <div ref={faq.ref} style={{ ...faq.style, background: LIGHT_GOLD }}>
        <div style={{ ...S.section, maxWidth: 700 }}>
          <div style={S.sectionTitle}>{h.faq}</div>
          <p style={{ ...S.sectionSub, marginBottom: 40 }}>{h.faqSub}</p>
          {h.faqItems.map(item => <FAQItem key={item.q} {...item} />)}
        </div>
      </div>

      {/* ─��� CTA FINAL ── */}
      <div style={{ background: CREAM, padding: '64px 24px', textAlign: 'center' }}>
        <div style={{ fontFamily: 'var(--font-great-vibes)', fontSize: 'clamp(36px, 8vw, 52px)', color: GOLD, marginBottom: 16, lineHeight: 1.2 }}>
          {h.ctaTitle}
        </div>
        <p style={{ fontFamily: 'var(--font-cormorant-garamond)', fontStyle: 'italic', fontSize: 18, color: TEXT, maxWidth: 500, margin: '0 auto 28px', lineHeight: 1.7 }}>
          {h.ctaSub}
        </p>
        <a href={ctaHref} style={S.btnPrimary}>
          {isLoggedIn ? c.yourSpace : c.createYourFairepart}
        </a>
      </div>

      {/* ── FOOTER ── */}
      <footer style={{ background: DARK, padding: '48px 24px', textAlign: 'center' }}>
        <div style={{ fontFamily: 'var(--font-great-vibes)', fontSize: 44, color: GOLD, marginBottom: 12 }}>Lov&apos;it</div>
        <div style={{ fontFamily: 'var(--font-cormorant-garamond)', fontStyle: 'italic', fontSize: 16, color: 'rgba(255,255,255,0.6)', marginBottom: 24 }}>
          {h.footerTagline}
        </div>
        <div style={{ display: 'flex', gap: 24, justifyContent: 'center', flexWrap: 'wrap', marginBottom: 24 }}>
          <a href="/connexion" style={{ fontFamily: 'var(--font-cormorant-garamond)', fontSize: 14, color: 'rgba(255,255,255,0.5)', textDecoration: 'none' }}>{c.yourSpace}</a>
          <a href="/mentions-legales" style={{ fontFamily: 'var(--font-cormorant-garamond)', fontSize: 14, color: 'rgba(255,255,255,0.5)', textDecoration: 'none' }}>{c.legalNotice}</a>
          <a href="/cgv" style={{ fontFamily: 'var(--font-cormorant-garamond)', fontSize: 14, color: 'rgba(255,255,255,0.5)', textDecoration: 'none' }}>{c.terms}</a>
          <a href="/politique-de-confidentialite" style={{ fontFamily: 'var(--font-cormorant-garamond)', fontSize: 14, color: 'rgba(255,255,255,0.5)', textDecoration: 'none' }}>{c.privacyPolicy}</a>
          <a href="/contact" style={{ fontFamily: 'var(--font-cormorant-garamond)', fontSize: 14, color: 'rgba(255,255,255,0.5)', textDecoration: 'none' }}>{c.contact}</a>
        </div>
        <Separator />
        <p style={{ fontFamily: 'var(--font-cormorant-garamond)', fontSize: 13, color: 'rgba(255,255,255,0.3)', marginTop: 24, marginBottom: 0 }}>
          © 2026 Lov&apos;it — {c.allRightsReserved}
        </p>
      </footer>
    </div>
  )
}
