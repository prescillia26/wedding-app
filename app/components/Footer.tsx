const GOLD = '#C9A84C'

export default function Footer() {
  return (
    <footer style={{
      borderTop: `1px solid ${GOLD}22`,
      padding: '32px 24px',
      textAlign: 'center',
      fontFamily: 'var(--font-cormorant-garamond)',
    }}>
      <a href="/" style={{ textDecoration: 'none' }}>
        <div style={{ fontFamily: 'var(--font-great-vibes)', fontSize: 24, color: GOLD, marginBottom: 12 }}>Lov&apos;it</div>
      </a>
      <div style={{ display: 'flex', justifyContent: 'center', gap: 20, flexWrap: 'wrap', marginBottom: 12 }}>
        <a href="/mentions-legales" style={{ fontSize: 13, color: '#8a7860', textDecoration: 'none' }}>Mentions légales</a>
        <a href="mailto:contact@getlovit.fr" style={{ fontSize: 13, color: '#8a7860', textDecoration: 'none' }}>Contact</a>
      </div>
      <div style={{ fontSize: 11, color: '#9ca3af' }}>
        © {new Date().getFullYear()} Lov&apos;it — Faire-parts de mariage digitaux
      </div>
    </footer>
  )
}
