'use client'

import { useEffect, useState } from 'react'
import { useT } from '@/lib/i18n'

const GOLD = '#C9A84C'
const CREAM = '#fff8ed'

export default function VerifyPage() {
  const { t } = useT()
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading')
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    const token = params.get('token')

    if (!token) {
      setError(t.auth.verifyError)
      setStatus('error')
      return
    }

    fetch(`/api/auth/verify?token=${token}`)
      .then(res => res.json().then(data => ({ ok: res.ok, data })))
      .then(({ ok, data }) => {
        if (ok && data.ok) {
          setStatus('success')
          // Rediriger vers /mon-espace après 2 secondes
          setTimeout(() => {
            window.location.href = '/mon-espace'
          }, 2000)
        } else {
          setError(data.error || t.auth.verifyError)
          setStatus('error')
        }
      })
      .catch(() => {
        setError(t.auth.verifyError)
        setStatus('error')
      })
  }, [])

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: `linear-gradient(160deg, ${CREAM} 0%, #fff5f7 50%, ${CREAM} 100%)`, padding: 24 }}>
      <div style={{ textAlign: 'center', maxWidth: 480 }}>
        <a href="/" style={{ textDecoration: 'none' }}>
          <div style={{ fontFamily: 'var(--font-great-vibes)', fontSize: 48, color: GOLD, marginBottom: 4 }}>Lov&apos;it</div>
        </a>
        <div style={{ width: 40, height: 1, background: GOLD, opacity: 0.4, margin: '0 auto 32px' }} />

        {status === 'loading' && (
          <div>
            <div style={{ fontFamily: 'var(--font-cormorant-garamond)', fontStyle: 'italic', fontSize: 20, color: '#4a3728', marginBottom: 16 }}>
              {t.auth.verifyLoading}
            </div>
            <div style={{ width: 40, height: 2, background: GOLD, opacity: 0.5, margin: '0 auto', borderRadius: 1, animation: 'pulse 1.5s ease-in-out infinite' }} />
          </div>
        )}

        {status === 'success' && (
          <div>
            <div style={{ fontSize: 48, marginBottom: 16 }}>&#10003;</div>
            <div style={{ fontFamily: 'var(--font-cormorant-garamond)', fontStyle: 'italic', fontSize: 20, color: '#4a3728', marginBottom: 8 }}>
              {t.auth.verifySuccess}
            </div>
            <p style={{ fontFamily: 'var(--font-cormorant-garamond)', fontStyle: 'italic', fontSize: 14, color: '#9ca3af' }}>
              {t.auth.verifyRedirect}
            </p>
          </div>
        )}

        {status === 'error' && (
          <div>
            <div style={{ fontFamily: 'var(--font-cormorant-garamond)', fontStyle: 'italic', fontSize: 20, color: '#dc2626', marginBottom: 16 }}>
              {error}
            </div>
            <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap', marginTop: 24 }}>
              <a
                href="/connexion"
                style={{
                  padding: '12px 28px', borderRadius: 9999,
                  background: `linear-gradient(135deg, ${GOLD}, #e8c96a)`,
                  color: 'white', textDecoration: 'none', fontSize: 14, fontWeight: 700,
                  fontFamily: 'var(--font-playfair-display)',
                }}
              >
                {t.common.login}
              </a>
              <a
                href="/auth/mot-de-passe-oublie"
                style={{
                  padding: '12px 28px', borderRadius: 9999,
                  border: `1px solid ${GOLD}`, background: 'transparent',
                  color: GOLD, textDecoration: 'none', fontSize: 14, fontWeight: 600,
                  fontFamily: 'var(--font-playfair-display)',
                }}
              >
                {t.auth.sendMagicLink}
              </a>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
