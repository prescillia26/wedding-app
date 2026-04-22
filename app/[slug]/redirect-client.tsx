'use client'

import { useEffect } from 'react'

export default function RedirectClient({ to }: { to: string }) {
  useEffect(() => {
    // Remplace l'URL actuelle dans l'historique (pas de bouton "retour" qui boucle)
    window.location.replace(to)
  }, [to])

  return null
}