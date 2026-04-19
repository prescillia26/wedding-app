'use client'

import { useState, useEffect, useRef } from 'react'

const GOLD = '#C9A84C'
const CREAM = '#faf8f5'
const DARK = '#2d2416'
const TEXT = '#4a3728'
const LIGHT_GOLD = '#f5edda'

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

function FakeCard({ name1, name2, date, accent, fond, style: cardStyle }: { name1: string; name2: string; date: string; accent: string; fond: string; style?: React.CSSProperties }) {
  return (
    <div style={{ background: fond, borderRadius: 12, padding: '32px 28px', boxShadow: '0 12px 48px rgba(0,0,0,0.12)', textAlign: 'center', minHeight: 260, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', border: `1px solid ${accent}33`, ...cardStyle }}>
      <div style={{ fontFamily: 'var(--font-great-vibes)', fontSize: 13, color: accent, letterSpacing: 3, marginBottom: 8, textTransform: 'uppercase' }}>Mariage</div>
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
      <button
        onClick={() => setOpen(o => !o)}
        style={{ width: '100%', background: 'none', border: 'none', cursor: 'pointer', padding: '20px 0', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 16, textAlign: 'left' }}
      >
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
  const hero = useFadeIn()
  const problem = useFadeIn()
  const howItWorks = useFadeIn()
  const examples = useFadeIn()
  const features = useFadeIn()
  const testimonials = useFadeIn()
  const pricing = useFadeIn()
  const faq = useFadeIn()

  const S: Record<string, React.CSSProperties> = {
    section: { padding: '80px 24px', maxWidth: 1000, margin: '0 auto' },
    sectionTitle: { fontFamily: 'var(--font-great-vibes)', fontSize: 'clamp(44px, 8vw, 64px)', color: GOLD, textAlign: 'center', marginBottom: 8, lineHeight: 1.2 },
    sectionSub: { fontFamily: 'var(--font-playfair-display)', fontSize: 'clamp(14px, 2.5vw, 18px)', color: TEXT, textAlign: 'center', marginBottom: 48, lineHeight: 1.7 },
    btnPrimary: { display: 'inline-block', padding: '14px 36px', borderRadius: 9999, background: `linear-gradient(135deg, ${GOLD}, #e8c96a)`, color: 'white', fontSize: 15, fontWeight: 700, textDecoration: 'none', letterSpacing: '0.08em', fontFamily: 'var(--font-playfair-display)', boxShadow: `0 6px 28px ${GOLD}55`, border: 'none', cursor: 'pointer' },
    btnOutline: { display: 'inline-block', padding: '14px 36px', borderRadius: 9999, background: 'transparent', color: GOLD, fontSize: 15, fontWeight: 600, textDecoration: 'none', letterSpacing: '0.08em', fontFamily: 'var(--font-playfair-display)', border: `1.5px solid ${GOLD}` },
  }

  return (
    <div style={{ background: CREAM, color: DARK, fontFamily: 'var(--font-cormorant-garamond)', overflowX: 'hidden' }}>

      {/* ── HERO ── */}
      <div ref={hero.ref} style={{ ...hero.style, background: `linear-gradient(180deg, #fff 0%, ${CREAM} 100%)`, padding: '80px 24px 60px', textAlign: 'center' }}>
        <div style={{ fontFamily: 'var(--font-great-vibes)', fontSize: 'clamp(56px, 12vw, 88px)', color: GOLD, lineHeight: 1, marginBottom: 4 }}>Lov&apos;it</div>
        <div style={{ fontFamily: 'var(--font-cormorant-garamond)', fontStyle: 'italic', fontSize: 14, color: `${GOLD}99`, letterSpacing: 4, textTransform: 'uppercase', marginBottom: 32 }}>faire-parts de mariage digitaux</div>
        <h1 style={{ fontFamily: 'var(--font-playfair-display)', fontSize: 'clamp(20px, 4vw, 32px)', color: DARK, maxWidth: 600, margin: '0 auto 16px', lineHeight: 1.45, fontWeight: 400 }}>
          Le faire-part digital qui rend<br />votre mariage inoubliable
        </h1>
        <p style={{ fontFamily: 'var(--font-cormorant-garamond)', fontStyle: 'italic', fontSize: 20, color: TEXT, maxWidth: 480, margin: '0 auto 40px', lineHeight: 1.7 }}>
          Créez en 5 minutes, partagez par WhatsApp, recevez les RSVP en temps réel.
        </p>
        <div style={{ display: 'flex', gap: 16, justifyContent: 'center', flexWrap: 'wrap', marginBottom: 64 }}>
          <a href="/faire-part" style={S.btnPrimary}>Créer mon faire-part</a>
          <a href="/faire-part?share=demo" style={S.btnOutline}>Voir un exemple</a>
        </div>
        {/* Aperçu carte */}
        <div style={{ maxWidth: 420, margin: '0 auto', transform: 'rotate(-1.5deg)', boxShadow: '0 24px 80px rgba(0,0,0,0.14)', borderRadius: 16, overflow: 'hidden' }}>
          <FakeCard name1="Léa" name2="Antoine" date="12 Juillet 2025 · Paris" accent={GOLD} fond="#fdf0f3" />
        </div>
        <div style={{ marginTop: 48 }}><Separator /></div>
      </div>

      {/* ── PROBLÈME / SOLUTION ── */}
      <div ref={problem.ref} style={{ ...problem.style, background: LIGHT_GOLD }}>
        <div style={S.section}>
          <div style={{ ...S.sectionTitle }}>Fini les faire-parts papier</div>
          <p style={{ ...S.sectionSub }}>qui finissent à la poubelle… Votre amour mérite mieux.</p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 32 }}>
            {[
              { icon: '✨', title: 'Beau', desc: 'Des designs luxueux avec 12 thèmes élégants, monogramme et photos en carrousel.' },
              { icon: '📱', title: 'Partageable', desc: 'Un lien par WhatsApp, SMS ou email. Accessible depuis n\'importe quel téléphone.' },
              { icon: '💌', title: 'Interactif', desc: 'RSVP intégré, musique d\'ambiance, itinéraire Google Maps. Vos invités adorent.' },
            ].map(({ icon, title, desc }) => (
              <div key={title} style={{ background: 'white', borderRadius: 16, padding: '36px 28px', textAlign: 'center', boxShadow: '0 4px 24px rgba(0,0,0,0.06)', border: `1px solid ${GOLD}22` }}>
                <div style={{ fontSize: 36, marginBottom: 12 }}>{icon}</div>
                <div style={{ fontFamily: 'var(--font-playfair-display)', fontSize: 22, color: DARK, marginBottom: 10 }}>{title}</div>
                <p style={{ fontFamily: 'var(--font-cormorant-garamond)', fontSize: 17, color: TEXT, lineHeight: 1.8, margin: 0 }}>{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── COMMENT ÇA MARCHE ── */}
      <div ref={howItWorks.ref} style={howItWorks.style}>
        <div style={S.section}>
          <div style={S.sectionTitle}>Comment ça marche</div>
          <p style={S.sectionSub}>Trois étapes simples, un résultat exceptionnel.</p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 40 }}>
            {[
              { n: '1', title: 'Remplissez le formulaire', desc: 'Prénoms, famille, cérémonies, thème, photos… En 5 minutes, tout est prêt.' },
              { n: '2', title: 'Faire-part généré', desc: 'Votre faire-part personnalisé apparaît instantanément, élégant et prêt à partager.' },
              { n: '3', title: 'Partagez le lien', desc: 'Envoyez à vos invités par WhatsApp. Recevez les RSVP par email en temps réel.' },
            ].map(({ n, title, desc }) => (
              <div key={n} style={{ textAlign: 'center', position: 'relative' }}>
                <div style={{ width: 60, height: 60, borderRadius: '50%', background: `linear-gradient(135deg, ${GOLD}, #e8c96a)`, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px', boxShadow: `0 8px 24px ${GOLD}44` }}>
                  <span style={{ fontFamily: 'var(--font-playfair-display)', fontSize: 22, color: 'white', fontWeight: 700 }}>{n}</span>
                </div>
                <div style={{ fontFamily: 'var(--font-playfair-display)', fontSize: 19, color: DARK, marginBottom: 10 }}>{title}</div>
                <p style={{ fontFamily: 'var(--font-cormorant-garamond)', fontSize: 17, color: TEXT, lineHeight: 1.8, margin: 0 }}>{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── EXEMPLES ── */}
      <div ref={examples.ref} style={{ ...examples.style, background: LIGHT_GOLD }}>
        <div style={S.section}>
          <div style={S.sectionTitle}>Exemples de thèmes</div>
          <p style={S.sectionSub}>12 thèmes disponibles pour correspondre à votre style.</p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 28 }}>
            <div>
              <div style={{ textAlign: 'center', marginBottom: 10, fontFamily: 'var(--font-playfair-display)', fontSize: 13, color: TEXT, letterSpacing: 2, textTransform: 'uppercase' }}>Classique doré</div>
              <FakeCard name1="Sophie" name2="Thomas" date="15 Juin 2025 · Lyon" accent="#C9A84C" fond="#fdf0f3" />
            </div>
            <div>
              <div style={{ textAlign: 'center', marginBottom: 10, fontFamily: 'var(--font-playfair-display)', fontSize: 13, color: TEXT, letterSpacing: 2, textTransform: 'uppercase' }}>Champêtre</div>
              <FakeCard name1="Camille" name2="Julien" date="4 Mai 2025 · Bordeaux" accent="#8fad6a" fond="#f5f0e8" />
            </div>
            <div>
              <div style={{ textAlign: 'center', marginBottom: 10, fontFamily: 'var(--font-playfair-display)', fontSize: 13, color: TEXT, letterSpacing: 2, textTransform: 'uppercase' }}>Oriental</div>
              <FakeCard name1="Yasmine" name2="Karim" date="8 Août 2025 · Marseille" accent="#D4A847" fond="#1a0a00" />
            </div>
          </div>
        </div>
      </div>

      {/* ── FONCTIONNALITÉS ── */}
      <div ref={features.ref} style={features.style}>
        <div style={S.section}>
          <div style={S.sectionTitle}>Tout ce dont vous avez besoin</div>
          <p style={S.sectionSub}>Pensé pour les mariés modernes, conçu avec amour.</p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 20 }}>
            {[
              { icon: '💌', title: 'RSVP intégré', desc: 'Vos invités confirment leur présence directement depuis le faire-part.' },
              { icon: '🎵', title: 'Musique de fond', desc: 'Ajoutez une chanson YouTube ou un fichier audio pour l\'ambiance.' },
              { icon: '🎨', title: 'Thèmes personnalisés', desc: '12 thèmes élégants : doré, oriental, champêtre, bleu nuit et plus.' },
              { icon: '📸', title: 'Photos carrousel', desc: 'Jusqu\'à 5 photos en diaporama automatique sur votre faire-part.' },
              { icon: '📧', title: 'Notifications email', desc: 'Recevez un email élégant à chaque nouveau RSVP de vos invités.' },
              { icon: '📱', title: 'Compatible iPhone', desc: 'Optimisé mobile, fonctionne parfaitement sur tous les appareils.' },
            ].map(({ icon, title, desc }) => (
              <div key={title} style={{ display: 'flex', gap: 16, alignItems: 'flex-start', padding: '20px 22px', background: 'white', borderRadius: 12, border: `1px solid ${GOLD}22`, boxShadow: '0 2px 12px rgba(0,0,0,0.04)' }}>
                <div style={{ fontSize: 28, flexShrink: 0 }}>{icon}</div>
                <div>
                  <div style={{ fontFamily: 'var(--font-playfair-display)', fontSize: 16, color: DARK, marginBottom: 4 }}>{title}</div>
                  <p style={{ fontFamily: 'var(--font-cormorant-garamond)', fontSize: 16, color: TEXT, margin: 0, lineHeight: 1.7 }}>{desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── TÉMOIGNAGES ── */}
      <div ref={testimonials.ref} style={{ ...testimonials.style, background: LIGHT_GOLD }}>
        <div style={S.section}>
          <div style={S.sectionTitle}>Elles nous ont fait confiance</div>
          <p style={S.sectionSub}>Des centaines de couples ont dit oui à Lov&apos;it.</p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 28 }}>
            {[
              { name: 'Chloé & Maxime', city: 'Paris', text: 'Nos invités ont adoré ! Plusieurs nous ont dit que c\'était le plus beau faire-part qu\'ils avaient reçu. Le RSVP intégré nous a sauvé des heures de relances !' },
              { name: 'Sarah & Younes', city: 'Marseille', text: 'Le thème oriental était parfait pour notre mariage. En 10 minutes tout était prêt. Merci Lov\'it pour ce souvenir numérique que nos parents ont précieusement gardé.' },
              { name: 'Émilie & Romain', city: 'Lyon', text: 'Simple, rapide et vraiment très élégant. On a reçu 80% de réponses RSVP en 48h ! Je recommande à toutes les futures mariées.' },
            ].map(({ name, city, text }) => (
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
          <div style={S.sectionTitle}>Une offre, tout inclus</div>
          <p style={S.sectionSub}>Payez une fois, utilisez pour toujours.</p>
          <div style={{ maxWidth: 480, margin: '0 auto', background: 'white', borderRadius: 24, padding: '48px 40px', boxShadow: `0 16px 64px ${GOLD}22`, border: `1px solid ${GOLD}44`, textAlign: 'center' }}>
            <div style={{ fontFamily: 'var(--font-cormorant-garamond)', fontStyle: 'italic', fontSize: 14, color: GOLD, letterSpacing: 3, textTransform: 'uppercase', marginBottom: 8 }}>Offre complète</div>
            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'center', gap: 4, marginBottom: 8 }}>
              <span style={{ fontFamily: 'var(--font-playfair-display)', fontSize: 24, color: TEXT, marginTop: 8 }}>€</span>
              <span style={{ fontFamily: 'var(--font-playfair-display)', fontSize: 72, color: DARK, lineHeight: 1, fontWeight: 700 }}>99</span>
            </div>
            <div style={{ fontFamily: 'var(--font-cormorant-garamond)', fontSize: 16, color: TEXT, marginBottom: 32 }}>paiement unique — valable à vie</div>
            <div style={{ textAlign: 'left', marginBottom: 36 }}>
              {[
                'Faire-part illimité dans le temps',
                '12 thèmes élégants au choix',
                'RSVP intégré avec tableau de bord',
                'Notifications email à chaque réponse',
                'Musique de fond YouTube ou MP3',
                'Photos en carrousel (jusqu\'à 5)',
                'Lien mariés + lien invités séparés',
                'Compatible tous appareils',
              ].map(item => (
                <div key={item} style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}>
                  <span style={{ color: GOLD, fontSize: 16 }}>✦</span>
                  <span style={{ fontFamily: 'var(--font-cormorant-garamond)', fontSize: 17, color: TEXT }}>{item}</span>
                </div>
              ))}
            </div>
            <a href="/faire-part" style={{ ...S.btnPrimary, display: 'block', width: '100%', boxSizing: 'border-box', textAlign: 'center' }}>
              Commander maintenant
            </a>
            <p style={{ fontFamily: 'var(--font-cormorant-garamond)', fontStyle: 'italic', fontSize: 14, color: `${TEXT}88`, marginTop: 16, marginBottom: 0 }}>
              Satisfait ou remboursé sous 7 jours
            </p>
          </div>
        </div>
      </div>

      {/* ── FAQ ── */}
      <div ref={faq.ref} style={{ ...faq.style, background: LIGHT_GOLD }}>
        <div style={{ ...S.section, maxWidth: 700 }}>
          <div style={S.sectionTitle}>Questions fréquentes</div>
          <p style={{ ...S.sectionSub, marginBottom: 40 }}>Tout ce que vous devez savoir avant de commencer.</p>
          {[
            { q: 'Mes invités ont-ils besoin de télécharger une application ?', a: 'Non, aucune application à télécharger. Vos invités ouvrent simplement le lien depuis leur téléphone ou ordinateur. C\'est instantané et accessible depuis n\'importe quel appareil.' },
            { q: 'Puis-je modifier mon faire-part après l\'avoir partagé ?', a: 'Oui, vous pouvez modifier votre faire-part à tout moment depuis votre interface créateur. Les changements sont appliqués immédiatement sur le lien partagé.' },
            { q: 'Comment je reçois les RSVP de mes invités ?', a: 'Vous recevez un email élégant à chaque réponse RSVP. Vous avez aussi accès à un tableau de bord complet avec toutes les réponses, exportable en CSV.' },
            { q: 'Est-ce que ça marche pour les mariages juifs et orientaux ?', a: 'Absolument ! Lov\'it propose un mode mariage juif avec l\'houppa, la date hébraïque, la mention בס״ד, et un thème Oriental spécialement conçu pour sublimer ces cérémonies.' },
            { q: 'Que se passe-t-il si mes photos sont trop lourdes ?', a: 'Lov\'it compresse automatiquement vos photos pour garantir un chargement rapide tout en préservant la qualité visuelle. Vous pouvez uploader jusqu\'à 5 photos en carrousel.' },
          ].map(item => <FAQItem key={item.q} {...item} />)}
        </div>
      </div>

      {/* ── FOOTER ── */}
      <footer style={{ background: DARK, padding: '48px 24px', textAlign: 'center' }}>
        <div style={{ fontFamily: 'var(--font-great-vibes)', fontSize: 52, color: GOLD, marginBottom: 12 }}>Lov&apos;it</div>
        <div style={{ fontFamily: 'var(--font-cormorant-garamond)', fontStyle: 'italic', fontSize: 18, color: `rgba(255,255,255,0.7)`, marginBottom: 24 }}>
          Fait avec ❤️ pour les plus beaux jours de votre vie
        </div>
        <Separator />
        <p style={{ fontFamily: 'var(--font-cormorant-garamond)', fontSize: 13, color: `rgba(255,255,255,0.35)`, marginTop: 28, marginBottom: 0 }}>
          © 2025 Lov&apos;it — Tous droits réservés
        </p>
      </footer>
    </div>
  )
}
