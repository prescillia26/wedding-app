'use client'

import * as Sentry from "@sentry/nextjs";
import { useEffect } from "react";

export default function GlobalError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    Sentry.captureException(error);
  }, [error]);

  return (
    <html lang="fr">
      <body style={{ fontFamily: 'system-ui, sans-serif', display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', background: '#fdf8f0', color: '#3a3330', textAlign: 'center', padding: 32 }}>
        <div>
          <h1 style={{ fontSize: 28, marginBottom: 12, color: '#C9A84C' }}>Oups !</h1>
          <p style={{ fontSize: 16, marginBottom: 24, opacity: 0.7 }}>Une erreur inattendue est survenue.</p>
          <button onClick={reset} style={{ padding: '12px 32px', background: '#C9A84C', color: 'white', border: 'none', borderRadius: 8, fontSize: 14, fontWeight: 600, cursor: 'pointer' }}>
            Réessayer
          </button>
        </div>
      </body>
    </html>
  );
}
