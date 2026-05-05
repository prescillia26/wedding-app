'use client'

import { useEffect } from 'react'

export default function RedirectClient({ to }: { to: string }) {
  useEffect(() => {
    // Transmettre les query params de l'URL actuelle (ex: ?events=0,1) vers la redirection
    const currentParams = new URLSearchParams(window.location.search)
    const targetUrl = new URL(to, window.location.origin)
    currentParams.forEach((value, key) => {
      if (!targetUrl.searchParams.has(key)) targetUrl.searchParams.set(key, value)
    })
    window.location.replace(targetUrl.pathname + targetUrl.search)
  }, [to])

  return null
}