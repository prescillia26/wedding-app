import type { MetadataRoute } from 'next'

// ✅ Fichier robots.ts au format Next.js App Router
// Servi en priorité par Next.js, donc capture /robots.txt avant la route [slug]
// Et autorise explicitement les bots de preview sociale (WhatsApp, Facebook, Twitter, LinkedIn, Slack, iMessage…)
export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      // ── Bots de preview sociale : tout autoriser ────────────────────────
      // Ces bots lisent les balises Open Graph pour générer les previews
      {
        userAgent: 'facebookexternalhit',
        allow: '/',
      },
      {
        userAgent: 'WhatsApp',
        allow: '/',
      },
      {
        userAgent: 'Twitterbot',
        allow: '/',
      },
      {
        userAgent: 'LinkedInBot',
        allow: '/',
      },
      {
        userAgent: 'Slackbot',
        allow: '/',
      },
      {
        userAgent: 'TelegramBot',
        allow: '/',
      },
      {
        userAgent: 'Discordbot',
        allow: '/',
      },
      {
        userAgent: 'Applebot',
        allow: '/',
      },
      // ── Tous les autres bots (Google, Bing…) ────────────────────────────
      // On bloque l'indexation des invitations privées, mais on autorise
      // les pages publiques (homepage, paiement)
      {
        userAgent: '*',
        allow: ['/', '/paiement'],
        disallow: ['/faire-part', '/api/'],
      },
    ],
  }
}
