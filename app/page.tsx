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
  const { t } = useT()
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

  const ctaHref = isLoggedIn ? '/faire-part' : '/paiement'
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

        <div style={{ margin: '32px auto 40px', maxWidth: 400 }}>
          <div style={{ marginBottom: 16 }}>
            <span style={{ fontFamily: 'var(--font-cormorant-garamond)', fontSize: 16, color: '#9ca3af', textDecoration: 'line-through', marginRight: 8 }}>{h.priceBefore}</span>
            <span style={{ fontFamily: 'var(--font-playfair-display)', fontSize: 36, color: DARK, fontWeight: 700 }}>{c.price}</span>
            <span style={{ fontFamily: 'var(--font-cormorant-garamond)', fontStyle: 'italic', fontSize: 15, color: TEXT, marginLeft: 6 }}>{c.singlePayment}</span>
          </div>
          <a href={ctaHref} style={{ ...S.btnPrimary, display: 'block', width: '100%', boxSizing: 'border-box', textAlign: 'center', fontSize: 16 }}>
            {isLoggedIn ? c.createYourFairepart : c.startNow}
          </a>
          <p style={{ fontFamily: 'var(--font-cormorant-garamond)', fontStyle: 'italic', fontSize: 13, color: `${TEXT}77`, marginTop: 10 }}>
            {c.satisfiedOrRefunded} · {c.lifetimeAccess}
          </p>
        </div>

        <div style={{ maxWidth: 380, margin: '0 auto', transform: 'rotate(-1.5deg)', boxShadow: '0 24px 80px rgba(0,0,0,0.14)', borderRadius: 16, overflow: 'hidden' }}>
          <FakeCard name1="Léa" name2="Antoine" date="12 Juillet 2026 · Paris" accent={GOLD} fond="#fdf8f0" />
        </div>
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
              {isLoggedIn ? c.createYourFairepart : `${c.startNow} — ${c.price}`}
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

      {/* ── PRICING ── */}
      <div ref={pricing.ref} style={pricing.style}>
        <div style={S.section}>
          <div style={S.sectionTitle}>{h.pricing}</div>
          <p style={S.sectionSub}>{h.pricingSub}</p>
          <div style={{ maxWidth: 480, margin: '0 auto', background: 'white', borderRadius: 24, padding: '48px 40px', boxShadow: `0 16px 64px ${GOLD}22`, border: `1.5px solid ${GOLD}66`, textAlign: 'center' }}>
            <div style={{ fontFamily: 'var(--font-cormorant-garamond)', fontStyle: 'italic', fontSize: 14, color: GOLD, letterSpacing: 3, textTransform: 'uppercase', marginBottom: 8 }}>{h.pricingLabel}</div>
            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'center', gap: 4, marginBottom: 4 }}>
              <span style={{ fontFamily: 'var(--font-cormorant-garamond)', fontSize: 22, color: '#9ca3af', textDecoration: 'line-through', marginTop: 12, marginRight: 4 }}>{h.priceBefore}</span>
              <span style={{ fontFamily: 'var(--font-playfair-display)', fontSize: 72, color: DARK, lineHeight: 1, fontWeight: 700 }}>{c.price}</span>
            </div>
            <div style={{ fontFamily: 'var(--font-cormorant-garamond)', fontSize: 16, color: TEXT, marginBottom: 28 }}>{c.singlePayment} — {c.lifetimeAccess}</div>
            <div style={{ textAlign: 'left', marginBottom: 32 }}>
              {h.pricingFeatures.map(item => (
                <div key={item} style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}>
                  <span style={{ color: GOLD, fontSize: 16 }}>✓</span>
                  <span style={{ fontFamily: 'var(--font-cormorant-garamond)', fontSize: 17, color: TEXT }}>{item}</span>
                </div>
              ))}
            </div>
            <a href={ctaHref} style={{ ...S.btnPrimary, display: 'block', width: '100%', boxSizing: 'border-box', textAlign: 'center' }}>
              {isLoggedIn ? c.createYourFairepart : c.startNow}
            </a>
            <p style={{ fontFamily: 'var(--font-cormorant-garamond)', fontStyle: 'italic', fontSize: 13, color: `${TEXT}77`, marginTop: 14, marginBottom: 0 }}>
              {c.satisfiedOrRefunded}
            </p>
          </div>
        </div>
      </div>

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
          {isLoggedIn ? c.yourSpace : `${c.createYourFairepart} — ${c.price}`}
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
          <a href="mailto:contact@getlovit.fr" style={{ fontFamily: 'var(--font-cormorant-garamond)', fontSize: 14, color: 'rgba(255,255,255,0.5)', textDecoration: 'none' }}>{c.contact}</a>
        </div>
        <Separator />
        <p style={{ fontFamily: 'var(--font-cormorant-garamond)', fontSize: 13, color: 'rgba(255,255,255,0.3)', marginTop: 24, marginBottom: 0 }}>
          © 2026 Lov&apos;it — {c.allRightsReserved}
        </p>
      </footer>
    </div>
  )
}
