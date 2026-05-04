import type { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'Conditions Générales de Vente',
  description: 'CGV de Lov\'it — conditions d\'utilisation du service de faire-parts de mariage digitaux.',
}

export default function CGV() {
  return (
    <main style={{ maxWidth: 800, margin: '0 auto', padding: '60px 24px', fontFamily: 'Georgia, serif', color: '#3a2a1f', lineHeight: 1.7 }}>
      <Link href="/" style={{ color: '#C9A84C', textDecoration: 'none', fontSize: 14, display: 'inline-block', marginBottom: 32 }}>← Retour à l&apos;accueil</Link>

      <h1 style={{ fontSize: '2.4rem', fontWeight: 300, letterSpacing: '0.04em', marginBottom: 8 }}>Conditions G&eacute;n&eacute;rales de Vente</h1>
      <p style={{ fontSize: 13, color: '#8a7a6a', fontStyle: 'italic', marginBottom: 40 }}>Derni&egrave;re mise &agrave; jour : 4 mai 2026</p>

      <h2 style={{ fontSize: '1.4rem', fontWeight: 400, marginTop: 40, marginBottom: 16 }}>Article 1 — Objet</h2>
      <p>Les pr&eacute;sentes Conditions G&eacute;n&eacute;rales de Vente (CGV) r&eacute;gissent la vente du service de cr&eacute;ation de faire-parts de mariage digitaux propos&eacute; sur le site getlovit.fr (&laquo; Lov&apos;it &raquo;), &eacute;dit&eacute; par Prescillia Zeitoun, micro-entreprise (SIRET 92436398900014).</p>
      <p>Toute commande implique l&apos;acceptation sans r&eacute;serve des pr&eacute;sentes CGV.</p>

      <h2 style={{ fontSize: '1.4rem', fontWeight: 400, marginTop: 40, marginBottom: 16 }}>Article 2 — Service propos&eacute;</h2>
      <p>Lov&apos;it propose un service en ligne de cr&eacute;ation, personnalisation et partage de faire-parts de mariage digitaux, incluant :</p>
      <ul style={{ marginLeft: 20 }}>
        <li>Cr&eacute;ation d&apos;un faire-part personnalis&eacute; (th&egrave;me, photos, musique, textes)</li>
        <li>H&eacute;bergement du faire-part en ligne avec un lien de partage unique</li>
        <li>Syst&egrave;me de RSVP int&eacute;gr&eacute; avec notifications email</li>
        <li>Modifications illimit&eacute;es du faire-part</li>
        <li>Acc&egrave;s au tableau de bord des r&eacute;ponses</li>
      </ul>

      <h2 style={{ fontSize: '1.4rem', fontWeight: 400, marginTop: 40, marginBottom: 16 }}>Article 3 — Prix et paiement</h2>
      <p>Le prix du service est indiqu&eacute; en euros TTC sur la page de paiement. Le tarif en vigueur au moment de la commande est celui applicable.</p>
      <p>Le paiement s&apos;effectue en une seule fois par carte bancaire via la plateforme s&eacute;curis&eacute;e Stripe. Aucune donn&eacute;e bancaire n&apos;est stock&eacute;e par Lov&apos;it.</p>
      <p>La TVA n&apos;est pas applicable (article 293 B du CGI — r&eacute;gime de la micro-entreprise).</p>

      <h2 style={{ fontSize: '1.4rem', fontWeight: 400, marginTop: 40, marginBottom: 16 }}>Article 4 — Acc&egrave;s au service</h2>
      <p>L&apos;acc&egrave;s au service est imm&eacute;diat apr&egrave;s confirmation du paiement. Un email de bienvenue contenant un lien de connexion est envoy&eacute; &agrave; l&apos;adresse email utilis&eacute;e lors du paiement.</p>
      <p>Le service est accessible sans limite de dur&eacute;e. Votre faire-part reste en ligne aussi longtemps que le service Lov&apos;it est op&eacute;rationnel.</p>

      <h2 style={{ fontSize: '1.4rem', fontWeight: 400, marginTop: 40, marginBottom: 16 }}>Article 5 — Droit de r&eacute;tractation</h2>
      <p>Conform&eacute;ment &agrave; l&apos;article L.221-28 du Code de la consommation, le droit de r&eacute;tractation ne peut &ecirc;tre exerc&eacute; pour les contrats de fourniture de contenu num&eacute;rique non fourni sur un support mat&eacute;riel dont l&apos;ex&eacute;cution a commenc&eacute; avec l&apos;accord du consommateur.</p>
      <p>Toutefois, Lov&apos;it offre une <strong>garantie satisfait ou rembours&eacute; de 7 jours</strong> &agrave; compter de la date d&apos;achat. Pour en b&eacute;n&eacute;ficier, contactez-nous &agrave; <a href="mailto:contact@getlovit.fr" style={{ color: '#C9A84C' }}>contact@getlovit.fr</a> avec votre email de commande. Le remboursement sera effectu&eacute; via Stripe dans un d&eacute;lai de 14 jours.</p>

      <h2 style={{ fontSize: '1.4rem', fontWeight: 400, marginTop: 40, marginBottom: 16 }}>Article 6 — Obligations de l&apos;utilisateur</h2>
      <p>L&apos;utilisateur s&apos;engage &agrave; :</p>
      <ul style={{ marginLeft: 20 }}>
        <li>Fournir des informations exactes lors de la cr&eacute;ation de son compte</li>
        <li>Ne pas utiliser le service &agrave; des fins ill&eacute;gales ou contraires aux bonnes m&oelig;urs</li>
        <li>Ne pas publier de contenu portant atteinte aux droits de tiers (photos, textes)</li>
        <li>Prot&eacute;ger la confidentialit&eacute; de ses identifiants de connexion</li>
      </ul>

      <h2 style={{ fontSize: '1.4rem', fontWeight: 400, marginTop: 40, marginBottom: 16 }}>Article 7 — Propri&eacute;t&eacute; intellectuelle</h2>
      <p>Le contenu upload&eacute; par l&apos;utilisateur (photos, textes personnels) reste sa propri&eacute;t&eacute;. L&apos;utilisateur accorde &agrave; Lov&apos;it une licence limit&eacute;e pour afficher ce contenu dans le cadre du service.</p>
      <p>Les th&egrave;mes, designs, code source et &eacute;l&eacute;ments graphiques du site sont la propri&eacute;t&eacute; exclusive de Lov&apos;it.</p>

      <h2 style={{ fontSize: '1.4rem', fontWeight: 400, marginTop: 40, marginBottom: 16 }}>Article 8 — Responsabilit&eacute;</h2>
      <p>Lov&apos;it s&apos;engage &agrave; fournir le service avec diligence. Toutefois, Lov&apos;it ne peut &ecirc;tre tenue responsable :</p>
      <ul style={{ marginLeft: 20 }}>
        <li>Des interruptions temporaires du service pour maintenance ou force majeure</li>
        <li>Du contenu publi&eacute; par les utilisateurs</li>
        <li>De la perte de donn&eacute;es r&eacute;sultant d&apos;une mauvaise utilisation du service</li>
        <li>Des dommages indirects li&eacute;s &agrave; l&apos;utilisation du service</li>
      </ul>

      <h2 style={{ fontSize: '1.4rem', fontWeight: 400, marginTop: 40, marginBottom: 16 }}>Article 9 — Disponibilit&eacute;</h2>
      <p>Lov&apos;it s&apos;efforce d&apos;assurer la disponibilit&eacute; du service 24h/24, 7j/7. Des interruptions pour maintenance peuvent survenir. En cas d&apos;interruption prolong&eacute;e, les utilisateurs seront inform&eacute;s par email.</p>

      <h2 style={{ fontSize: '1.4rem', fontWeight: 400, marginTop: 40, marginBottom: 16 }}>Article 10 — R&eacute;siliation</h2>
      <p>L&apos;utilisateur peut demander la suppression de son compte et de ses donn&eacute;es &agrave; tout moment en contactant <a href="mailto:contact@getlovit.fr" style={{ color: '#C9A84C' }}>contact@getlovit.fr</a>.</p>
      <p>Lov&apos;it se r&eacute;serve le droit de suspendre ou supprimer un compte en cas de violation des pr&eacute;sentes CGV, apr&egrave;s notification pr&eacute;alable.</p>

      <h2 style={{ fontSize: '1.4rem', fontWeight: 400, marginTop: 40, marginBottom: 16 }}>Article 11 — M&eacute;diation</h2>
      <p>En cas de litige, l&apos;utilisateur peut recourir gratuitement au service de m&eacute;diation de la consommation. Conform&eacute;ment &agrave; l&apos;article L.612-1 du Code de la consommation, vous pouvez contacter le m&eacute;diateur via la plateforme europ&eacute;enne de r&egrave;glement en ligne des litiges : <a href="https://ec.europa.eu/consumers/odr" target="_blank" rel="noopener noreferrer" style={{ color: '#C9A84C' }}>https://ec.europa.eu/consumers/odr</a></p>

      <h2 style={{ fontSize: '1.4rem', fontWeight: 400, marginTop: 40, marginBottom: 16 }}>Article 12 — Droit applicable</h2>
      <p>Les pr&eacute;sentes CGV sont soumises au droit fran&ccedil;ais. En cas de litige, et apr&egrave;s &eacute;chec de toute tentative de r&eacute;solution amiable, les tribunaux fran&ccedil;ais seront seuls comp&eacute;tents.</p>

      <h2 style={{ fontSize: '1.4rem', fontWeight: 400, marginTop: 40, marginBottom: 16 }}>Article 13 — Contact</h2>
      <p>Pour toute question relative aux pr&eacute;sentes CGV :</p>
      <ul style={{ marginLeft: 20 }}>
        <li>Email : <a href="mailto:contact@getlovit.fr" style={{ color: '#C9A84C' }}>contact@getlovit.fr</a></li>
        <li>Courrier : 218 bis rue Saint-Denis, 75002 Paris, France</li>
      </ul>

      <div style={{ marginTop: 60, paddingTop: 32, borderTop: '1px solid #e5d4b8', display: 'flex', gap: 20, flexWrap: 'wrap', justifyContent: 'center', fontSize: 13 }}>
        <Link href="/mentions-legales" style={{ color: '#8a7a6a' }}>Mentions l&eacute;gales</Link>
        <Link href="/politique-de-confidentialite" style={{ color: '#8a7a6a' }}>Confidentialit&eacute;</Link>
      </div>
    </main>
  )
}
