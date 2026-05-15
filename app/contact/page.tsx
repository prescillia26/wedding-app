import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Contact',
  description: 'Contactez l\'équipe Lov\'it pour toute question ou assistance.',
}

export default function ContactPage() {
  const GOLD = '#C9A84C'
  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(160deg, #fff8ed 0%, #fffaf4 50%, #fff8ed 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '40px 20px' }}>
      <div style={{ maxWidth: 520, width: '100%' }}>
        <div style={{ textAlign: 'center', marginBottom: 40 }}>
          <div style={{ fontFamily: 'var(--font-great-vibes)', fontSize: 48, color: GOLD, marginBottom: 8 }}>Lov&apos;it</div>
          <h1 style={{ fontFamily: 'var(--font-playfair-display)', fontSize: 28, fontWeight: 700, color: '#2a2018', margin: '0 0 12px' }}>Nous contacter</h1>
          <p style={{ fontFamily: 'var(--font-cormorant-garamond)', fontStyle: 'italic', fontSize: 17, color: '#6a5a48', lineHeight: 1.7 }}>
            Une question ? Un bug ? Un besoin spécifique ?<br />Nous sommes là pour vous aider.
          </p>
        </div>

        <div style={{ background: 'white', borderRadius: 16, padding: '36px 32px', boxShadow: '0 8px 40px rgba(0,0,0,0.06)', border: '1px solid #f0e8d8' }}>
          <div style={{ marginBottom: 28 }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: '#9ca3af', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 8 }}>Email</div>
            <a href="mailto:contact@getlovit.fr" style={{ fontFamily: 'var(--font-playfair-display)', fontSize: 20, color: GOLD, textDecoration: 'none', fontWeight: 600 }}>
              contact@getlovit.fr
            </a>
          </div>

          <div style={{ marginBottom: 28 }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: '#9ca3af', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 8 }}>Temps de réponse</div>
            <p style={{ fontFamily: 'var(--font-cormorant-garamond)', fontSize: 16, color: '#3a3330', lineHeight: 1.6, margin: 0 }}>
              Sous 24 à 48 heures, du dimanche au vendredi.
            </p>
          </div>

          <div style={{ borderTop: '1px solid #f0e8d8', paddingTop: 24 }}>
            <p style={{ fontFamily: 'var(--font-cormorant-garamond)', fontStyle: 'italic', fontSize: 16, color: '#6a5a48', lineHeight: 1.7, margin: 0, textAlign: 'center' }}>
              Nous lisons et répondons personnellement à chaque message. À très vite !
            </p>
          </div>
        </div>

        <div style={{ textAlign: 'center', marginTop: 32 }}>
          <a href="/faire-part" style={{ fontFamily: 'var(--font-cormorant-garamond)', fontStyle: 'italic', fontSize: 15, color: GOLD, textDecoration: 'underline' }}>
            ← Retour au faire-part
          </a>
        </div>
      </div>
    </div>
  )
}
