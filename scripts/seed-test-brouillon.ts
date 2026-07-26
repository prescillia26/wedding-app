/**
 * Seed script — creates a FICTIONAL test brouillon in Redis.
 * Data is 100% invented. NEVER use real client data.
 *
 * Usage:  npx tsx scripts/seed-test-brouillon.ts
 */
import { config } from 'dotenv'
import { Redis } from '@upstash/redis'

config({ path: '.env.local' })

const redis = new Redis({
  url: process.env.KV_REST_API_URL!,
  token: process.env.KV_REST_API_TOKEN!,
})

const SHARE_ID = 'test-brouillon-static-export'
const SLUG = 'test-et-test-brouillon'

const testData = {
  // Couple — prénoms fictifs
  marie1Prenom: 'Test',
  marie1Nom: 'Fictif',
  marie1Prenom2: '',
  marie2Prenom: 'Test',
  marie2Nom: 'Fictif',
  marie2Prenom2: '',

  // Familles — tout inventé
  famille1PerePrenom: 'Papa',
  famille1PereNom: 'Fictif',
  famille1MerePrenom: 'Maman',
  famille1MereNom: 'Fictif',
  famille1GpPaPerePrenom: '',
  famille1GpPaPereNom: '',
  famille1GpPaMerePrenom: '',
  famille1GpPaMereNom: '',
  famille1GpMaPerePrenom: '',
  famille1GpMaPereNom: '',
  famille1GpMaMerePrenom: '',
  famille1GpMaMereNom: '',

  famille2PerePrenom: 'Papa',
  famille2PereNom: 'Fictif2',
  famille2MerePrenom: 'Maman',
  famille2MereNom: 'Fictif2',
  famille2GpPaPerePrenom: '',
  famille2GpPaPereNom: '',
  famille2GpPaMerePrenom: '',
  famille2GpPaMereNom: '',
  famille2GpMaPerePrenom: '',
  famille2GpMaPereNom: '',
  famille2GpMaMerePrenom: '',
  famille2GpMaMereNom: '',

  // Cérémonie unique — données fictives
  ceremonies: [
    {
      type: 'Autre',
      customName: 'Cérémonie de test',
      lieu: 'Salle de test',
      adresse: '1 rue du Test, 75000 Testville',
      date: '2027-01-01',
      heure: '15:00',
      suiviDAutre: false,
      evenementSuivantNom: '',
      evenementSuivantAdresse: '',
      note: 'Ceci est un brouillon de test — aucune donnée réelle.',
      infosTransportActif: false,
      transport: '',
      hebergement: '',
      penseesDefuntsActif: false,
      penseesDefuntsIntro: '',
      penseesDefuntsNoms: [],
      penseesDefuntsFin: '',
      rsvpHidden: false,
      hideHebrewDate: true,
    },
  ],

  // Style & présentation
  style: 'ivoire-or',
  presentationStyle: 'page-unique',
  styleAccueil: 'monogramme',
  mariageJuif: false,

  // Pas de média
  youtubeUrl: '',
  musicUrl: '',
  musicName: '',
  photoFond: '',
  photosFond: [],
  photosData: [],
  photoPosition: 'center',

  // Contact fictif
  emailMaries: 'test@example.com',
  emailMaries2: '',

  // Déco minimale
  monogrammeStyle: 'cercle',
  monogrammeColor: '#C9A84C',
  frameId: '',
  ornamentId: '',
  fondCeremonie: 'ornements',
  illustrationCoupleId: '',
  effectTexte: 'aucun',

  // Texte par défaut
  textOpacity: 1,
  textBg: 0.5,
  globalTextColor: '',
  textOverrides: {},
  zoneStyles: {},

  // Animations minimales
  animationStyle: '',
  introAnimation: '',
  petalsEnabled: false,

  // Layout
  accueilCompact: false,
  premiumCover: false,
  continuousLayout: false,

  // Slug
  slug: SLUG,

  // Metadata
  ogVersion: Date.now(),
}

async function seed() {
  // Save main data
  await redis.set(SHARE_ID, testData, { ex: 86400 * 7 }) // TTL 7 jours

  // Save slug mapping
  await redis.set(`slug:${SLUG}`, SHARE_ID, { ex: 86400 * 7 })

  // Save email
  await redis.set(`email:${SHARE_ID}`, 'test@example.com', { ex: 86400 * 7 })

  console.log('--- Brouillon de test créé ---')
  console.log(`  shareId : ${SHARE_ID}`)
  console.log(`  slug    : ${SLUG}`)
  console.log(`  URL     : http://localhost:3000/${SLUG}`)
  console.log(`  TTL     : 7 jours (auto-suppression)`)
  console.log('')
  console.log('Prénoms : "Test & Test"')
  console.log('Date    : 01/01/2027')
  console.log('Lieu    : "Salle de test"')
  console.log('')
  console.log('Aucune donnée cliente utilisée.')
}

seed().catch((err) => {
  console.error('Erreur seed:', err)
  process.exit(1)
})
