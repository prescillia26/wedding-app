import type { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'Mentions légales — Lov\'it',
  description: 'Mentions légales du site Lov\'it, créateur de faire-parts de mariage digitaux.',
}

export default function MentionsLegales() {
  return (
    <main style={{ maxWidth: 800, margin: '0 auto', padding: '60px 24px', fontFamily: 'Georgia, serif', color: '#3a2a1f', lineHeight: 1.7 }}>
      <Link href="/" style={{ color: '#C9A84C', textDecoration: 'none', fontSize: 14, display: 'inline-block', marginBottom: 32 }}>← Retour à l&apos;accueil</Link>

      <h1 style={{ fontSize: '2.4rem', fontWeight: 300, letterSpacing: '0.04em', marginBottom: 8 }}>Mentions légales</h1>
      <p style={{ fontSize: 13, color: '#8a7a6a', fontStyle: 'italic', marginBottom: 40 }}>Dernière mise à jour : 28 avril 2026</p>

      <p>Conformément aux dispositions des articles 6-III et 19 de la Loi n° 2004-575 du 21 juin 2004 pour la Confiance dans l&apos;économie numérique, dite L.C.E.N., il est porté à la connaissance des utilisateurs et visiteurs du site getlovit.fr les présentes mentions légales.</p>

      <h2 style={{ fontSize: '1.4rem', fontWeight: 400, marginTop: 40, marginBottom: 16 }}>1. Éditeur du site</h2>
      <p>Le site getlovit.fr est édité par :</p>
      <p style={{ marginLeft: 16 }}>
        <strong>Prescillia Leana Ilana Zeitoun</strong><br />
        Entrepreneure individuelle (micro-entreprise)<br /><br />
        <strong>Adresse de domiciliation professionnelle :</strong><br />
        218 bis rue Saint-Denis<br />
        75002 Paris<br />
        France<br /><br />
        <strong>SIRET :</strong> 92436398900014<br />
        <strong>SIREN :</strong> 924 363 989<br /><br />
        <strong>Téléphone :</strong> 06 95 47 69 31<br />
        <strong>Email :</strong> presc1402@gmail.com<br /><br />
        <strong>Directrice de la publication :</strong> Prescillia Zeitoun
      </p>

      <h2 style={{ fontSize: '1.4rem', fontWeight: 400, marginTop: 40, marginBottom: 16 }}>2. Hébergement</h2>
      <p>Le site getlovit.fr est hébergé par :</p>
      <p style={{ marginLeft: 16 }}>
        <strong>Vercel Inc.</strong><br />
        340 S Lemon Ave #4133<br />
        Walnut, CA 91789<br />
        États-Unis<br /><br />
        Site web : <a href="https://vercel.com" target="_blank" rel="noopener noreferrer" style={{ color: '#C9A84C' }}>https://vercel.com</a>
      </p>

      <h2 style={{ fontSize: '1.4rem', fontWeight: 400, marginTop: 40, marginBottom: 16 }}>3. Propriété intellectuelle</h2>
      <p>L&apos;ensemble des éléments constituant le site getlovit.fr (textes, graphismes, logiciels, photographies, images, vidéos, sons, plans, logos, marques, créations et œuvres protégeables diverses, bases de données, etc.) ainsi que le site lui-même, relèvent des législations française et internationale sur le droit d&apos;auteur et sur la propriété intellectuelle.</p>
      <p>Ces éléments sont la propriété exclusive de Prescillia Zeitoun ou de ses partenaires. À ce titre, toute reproduction, représentation, utilisation, adaptation, modification, incorporation, traduction, commercialisation, partielles ou intégrales, par quelque procédé et sur quelque support que ce soit (papier, numérique, etc.) sont interdites sans l&apos;autorisation écrite préalable de Prescillia Zeitoun, à l&apos;exception des exceptions légales (article L.122-5 du Code de la Propriété Intellectuelle), sous peine de constituer un délit de contrefaçon de droit d&apos;auteur et/ou de dessins et modèles et/ou de marque.</p>

      <h2 style={{ fontSize: '1.4rem', fontWeight: 400, marginTop: 40, marginBottom: 16 }}>4. Données personnelles</h2>
      <p>Le traitement des données personnelles collectées sur le site getlovit.fr est régi par notre <Link href="/politique-de-confidentialite" style={{ color: '#C9A84C' }}>Politique de confidentialité</Link>.</p>
      <p>Conformément au Règlement Général sur la Protection des Données (RGPD) et à la loi Informatique et Libertés, vous disposez d&apos;un droit d&apos;accès, de rectification, de suppression, de portabilité et d&apos;opposition concernant vos données personnelles. Pour exercer ces droits, contactez-nous à : <a href="mailto:presc1402@gmail.com" style={{ color: '#C9A84C' }}>presc1402@gmail.com</a></p>

      <h2 style={{ fontSize: '1.4rem', fontWeight: 400, marginTop: 40, marginBottom: 16 }}>5. Cookies</h2>
      <p>Le site getlovit.fr utilise des cookies pour améliorer l&apos;expérience utilisateur et assurer le bon fonctionnement du service. Pour en savoir plus, consultez notre <Link href="/cookies" style={{ color: '#C9A84C' }}>Politique de cookies</Link>.</p>

      <h2 style={{ fontSize: '1.4rem', fontWeight: 400, marginTop: 40, marginBottom: 16 }}>6. Responsabilité</h2>
      <p>Les informations fournies sur le site getlovit.fr le sont à titre indicatif. Prescillia Zeitoun s&apos;efforce d&apos;assurer l&apos;exactitude et la mise à jour des informations diffusées sur ce site, mais ne peut garantir l&apos;absence d&apos;erreurs ou d&apos;omissions.</p>
      <p>L&apos;utilisateur reconnaît utiliser ce site sous sa seule et entière responsabilité.</p>

      <h2 style={{ fontSize: '1.4rem', fontWeight: 400, marginTop: 40, marginBottom: 16 }}>7. Liens hypertextes</h2>
      <p>Le site getlovit.fr peut contenir des liens vers d&apos;autres sites internet. Prescillia Zeitoun n&apos;exerce aucun contrôle sur ces sites et décline toute responsabilité quant à leur contenu.</p>

      <h2 style={{ fontSize: '1.4rem', fontWeight: 400, marginTop: 40, marginBottom: 16 }}>8. Droit applicable et juridiction compétente</h2>
      <p>Les présentes mentions légales sont régies par le droit français. En cas de litige, et après échec de toute tentative de résolution amiable, les tribunaux français seront seuls compétents.</p>

      <h2 style={{ fontSize: '1.4rem', fontWeight: 400, marginTop: 40, marginBottom: 16 }}>9. Contact</h2>
      <p>Pour toute question relative aux présentes mentions légales, vous pouvez nous contacter :</p>
      <ul style={{ marginLeft: 20 }}>
        <li>Par email : <a href="mailto:presc1402@gmail.com" style={{ color: '#C9A84C' }}>presc1402@gmail.com</a></li>
        <li>Par téléphone : 06 95 47 69 31</li>
        <li>Par courrier : 218 bis rue Saint-Denis, 75002 Paris, France</li>
      </ul>

      <div style={{ marginTop: 60, paddingTop: 32, borderTop: '1px solid #e5d4b8', display: 'flex', gap: 20, flexWrap: 'wrap', justifyContent: 'center', fontSize: 13 }}>
        <Link href="/cgv" style={{ color: '#8a7a6a' }}>CGV</Link>
        <Link href="/politique-de-confidentialite" style={{ color: '#8a7a6a' }}>Confidentialité</Link>
        <Link href="/cookies" style={{ color: '#8a7a6a' }}>Cookies</Link>
      </div>
    </main>
  )
}
