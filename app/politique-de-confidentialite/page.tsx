import type { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'Politique de confidentialité',
  description: 'Politique de confidentialité de Lov\'it — comment nous protégeons vos données personnelles.',
}

export default function PolitiqueConfidentialite() {
  return (
    <main style={{ maxWidth: 800, margin: '0 auto', padding: '60px 24px', fontFamily: 'Georgia, serif', color: '#3a2a1f', lineHeight: 1.7 }}>
      <Link href="/" style={{ color: '#C9A84C', textDecoration: 'none', fontSize: 14, display: 'inline-block', marginBottom: 32 }}>← Retour à l&apos;accueil</Link>

      <h1 style={{ fontSize: '2.4rem', fontWeight: 300, letterSpacing: '0.04em', marginBottom: 8 }}>Politique de confidentialit&eacute;</h1>
      <p style={{ fontSize: 13, color: '#8a7a6a', fontStyle: 'italic', marginBottom: 40 }}>Derni&egrave;re mise &agrave; jour : 4 mai 2026</p>

      <p>La pr&eacute;sente politique de confidentialit&eacute; d&eacute;crit comment Lov&apos;it (getlovit.fr), &eacute;dit&eacute; par Prescillia Zeitoun (micro-entreprise, SIRET 92436398900014), collecte, utilise et prot&egrave;ge vos donn&eacute;es personnelles conform&eacute;ment au R&egrave;glement G&eacute;n&eacute;ral sur la Protection des Donn&eacute;es (RGPD) et &agrave; la loi Informatique et Libert&eacute;s.</p>

      <h2 style={{ fontSize: '1.4rem', fontWeight: 400, marginTop: 40, marginBottom: 16 }}>1. Responsable du traitement</h2>
      <p>
        Prescillia Zeitoun<br />
        218 bis rue Saint-Denis, 75002 Paris, France<br />
        Email : <a href="mailto:contact@getlovit.fr" style={{ color: '#C9A84C' }}>contact@getlovit.fr</a>
      </p>

      <h2 style={{ fontSize: '1.4rem', fontWeight: 400, marginTop: 40, marginBottom: 16 }}>2. Donn&eacute;es collect&eacute;es</h2>
      <p>Nous collectons les donn&eacute;es suivantes :</p>
      <ul style={{ marginLeft: 20 }}>
        <li><strong>Donn&eacute;es de compte</strong> : adresse email, mot de passe (hash&eacute;, jamais stock&eacute; en clair)</li>
        <li><strong>Donn&eacute;es du faire-part</strong> : pr&eacute;noms et noms des mari&eacute;s, pr&eacute;noms et noms des parents et grands-parents, lieux et dates des c&eacute;r&eacute;monies, photos upload&eacute;es</li>
        <li><strong>R&eacute;ponses RSVP</strong> : nom de l&apos;invit&eacute;, pr&eacute;sence confirm&eacute;e ou non, nombre de personnes, message optionnel</li>
        <li><strong>Donn&eacute;es de paiement</strong> : trait&eacute;es exclusivement par Stripe. Nous ne stockons aucun num&eacute;ro de carte bancaire.</li>
        <li><strong>Donn&eacute;es techniques</strong> : adresse IP (via l&apos;h&eacute;bergeur), user-agent du navigateur, horodatage des visites</li>
      </ul>

      <h2 style={{ fontSize: '1.4rem', fontWeight: 400, marginTop: 40, marginBottom: 16 }}>3. Finalit&eacute;s du traitement</h2>
      <ul style={{ marginLeft: 20 }}>
        <li>Cr&eacute;ation et gestion de votre compte utilisateur</li>
        <li>G&eacute;n&eacute;ration et affichage de votre faire-part digital</li>
        <li>Gestion des r&eacute;ponses RSVP de vos invit&eacute;s</li>
        <li>Envoi d&apos;emails transactionnels (confirmation de paiement, magic link de connexion, notifications RSVP)</li>
        <li>Traitement du paiement via Stripe</li>
        <li>Am&eacute;lioration du service (statistiques anonymis&eacute;es)</li>
      </ul>

      <h2 style={{ fontSize: '1.4rem', fontWeight: 400, marginTop: 40, marginBottom: 16 }}>4. Base l&eacute;gale du traitement</h2>
      <ul style={{ marginLeft: 20 }}>
        <li><strong>Ex&eacute;cution du contrat</strong> (article 6.1.b RGPD) : n&eacute;cessaire pour fournir le service command&eacute;</li>
        <li><strong>Int&eacute;r&ecirc;t l&eacute;gitime</strong> (article 6.1.f RGPD) : am&eacute;lioration du service, s&eacute;curit&eacute;</li>
      </ul>

      <h2 style={{ fontSize: '1.4rem', fontWeight: 400, marginTop: 40, marginBottom: 16 }}>5. Dur&eacute;e de conservation</h2>
      <ul style={{ marginLeft: 20 }}>
        <li><strong>Donn&eacute;es de compte</strong> : conserv&eacute;es tant que le compte est actif, puis 3 ans apr&egrave;s la derni&egrave;re connexion</li>
        <li><strong>Faire-parts et RSVP</strong> : conserv&eacute;s 1 an apr&egrave;s la derni&egrave;re modification</li>
        <li><strong>Donn&eacute;es de paiement</strong> : conserv&eacute;es par Stripe selon leur propre politique</li>
        <li><strong>Logs techniques</strong> : 12 mois maximum</li>
      </ul>

      <h2 style={{ fontSize: '1.4rem', fontWeight: 400, marginTop: 40, marginBottom: 16 }}>6. Sous-traitants et transferts</h2>
      <p>Vos donn&eacute;es peuvent &ecirc;tre trait&eacute;es par les prestataires suivants :</p>
      <ul style={{ marginLeft: 20 }}>
        <li><strong>Vercel Inc.</strong> (USA) : h&eacute;bergement du site — <a href="https://vercel.com/legal/privacy-policy" target="_blank" rel="noopener noreferrer" style={{ color: '#C9A84C' }}>Politique de confidentialit&eacute;</a></li>
        <li><strong>Upstash</strong> (USA) : base de donn&eacute;es Redis — <a href="https://upstash.com/trust/privacy" target="_blank" rel="noopener noreferrer" style={{ color: '#C9A84C' }}>Politique de confidentialit&eacute;</a></li>
        <li><strong>Stripe Inc.</strong> (USA) : traitement des paiements — <a href="https://stripe.com/fr/privacy" target="_blank" rel="noopener noreferrer" style={{ color: '#C9A84C' }}>Politique de confidentialit&eacute;</a></li>
        <li><strong>Resend</strong> (USA) : envoi d&apos;emails transactionnels — <a href="https://resend.com/legal/privacy-policy" target="_blank" rel="noopener noreferrer" style={{ color: '#C9A84C' }}>Politique de confidentialit&eacute;</a></li>
        <li><strong>Cloudinary</strong> (USA) : stockage des images — <a href="https://cloudinary.com/privacy" target="_blank" rel="noopener noreferrer" style={{ color: '#C9A84C' }}>Politique de confidentialit&eacute;</a></li>
      </ul>
      <p>Ces transferts vers les &Eacute;tats-Unis sont encadr&eacute;s par le EU-US Data Privacy Framework ou les Clauses Contractuelles Types de la Commission Europ&eacute;enne.</p>

      <h2 style={{ fontSize: '1.4rem', fontWeight: 400, marginTop: 40, marginBottom: 16 }}>7. Vos droits</h2>
      <p>Conform&eacute;ment au RGPD, vous disposez des droits suivants :</p>
      <ul style={{ marginLeft: 20 }}>
        <li><strong>Droit d&apos;acc&egrave;s</strong> : obtenir une copie de vos donn&eacute;es personnelles</li>
        <li><strong>Droit de rectification</strong> : corriger des donn&eacute;es inexactes</li>
        <li><strong>Droit &agrave; l&apos;effacement</strong> : demander la suppression de vos donn&eacute;es</li>
        <li><strong>Droit &agrave; la portabilit&eacute;</strong> : recevoir vos donn&eacute;es dans un format structur&eacute;</li>
        <li><strong>Droit d&apos;opposition</strong> : vous opposer au traitement de vos donn&eacute;es</li>
        <li><strong>Droit &agrave; la limitation</strong> : restreindre le traitement dans certains cas</li>
      </ul>
      <p>Pour exercer ces droits, contactez-nous &agrave; <a href="mailto:contact@getlovit.fr" style={{ color: '#C9A84C' }}>contact@getlovit.fr</a>. Nous r&eacute;pondrons dans un d&eacute;lai de 30 jours.</p>
      <p>Vous pouvez &eacute;galement introduire une r&eacute;clamation aupr&egrave;s de la <strong>CNIL</strong> (Commission Nationale de l&apos;Informatique et des Libert&eacute;s) : <a href="https://www.cnil.fr" target="_blank" rel="noopener noreferrer" style={{ color: '#C9A84C' }}>www.cnil.fr</a></p>

      <h2 style={{ fontSize: '1.4rem', fontWeight: 400, marginTop: 40, marginBottom: 16 }}>8. S&eacute;curit&eacute;</h2>
      <p>Nous mettons en &oelig;uvre des mesures techniques et organisationnelles pour prot&eacute;ger vos donn&eacute;es :</p>
      <ul style={{ marginLeft: 20 }}>
        <li>Chiffrement HTTPS sur l&apos;ensemble du site</li>
        <li>Mots de passe hash&eacute;s avec bcrypt (12 rounds)</li>
        <li>Sessions s&eacute;curis&eacute;es (cookies httpOnly, Secure, SameSite)</li>
        <li>Limitation du taux de requ&ecirc;tes (rate limiting) sur les endpoints sensibles</li>
        <li>Aucun stockage de donn&eacute;es bancaires</li>
      </ul>

      <h2 style={{ fontSize: '1.4rem', fontWeight: 400, marginTop: 40, marginBottom: 16 }}>9. Cookies</h2>
      <p>Le site utilise uniquement des cookies essentiels au fonctionnement du service :</p>
      <ul style={{ marginLeft: 20 }}>
        <li><strong>lovit_session</strong> : cookie de session (authentification), dur&eacute;e 30 jours, httpOnly</li>
      </ul>
      <p>Nous n&apos;utilisons aucun cookie publicitaire, de tracking ou d&apos;analyse tiers. Aucun consentement n&apos;est donc requis pour ces cookies strictement n&eacute;cessaires (article 82 de la loi Informatique et Libert&eacute;s).</p>

      <h2 style={{ fontSize: '1.4rem', fontWeight: 400, marginTop: 40, marginBottom: 16 }}>10. Modifications</h2>
      <p>Cette politique peut &ecirc;tre mise &agrave; jour. La date de derni&egrave;re modification est indiqu&eacute;e en haut de cette page. Nous vous invitons &agrave; la consulter r&eacute;guli&egrave;rement.</p>

      <div style={{ marginTop: 60, paddingTop: 32, borderTop: '1px solid #e5d4b8', display: 'flex', gap: 20, flexWrap: 'wrap', justifyContent: 'center', fontSize: 13 }}>
        <Link href="/mentions-legales" style={{ color: '#8a7a6a' }}>Mentions l&eacute;gales</Link>
        <Link href="/cgv" style={{ color: '#8a7a6a' }}>CGV</Link>
      </div>
    </main>
  )
}
