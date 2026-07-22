/**
 * Générateur de HTML statique autonome pour le wizard de création.
 *
 * Produit un fichier HTML complet avec :
 * - CSS inline (pas de fichier externe)
 * - Polices Google Fonts chargées via @import
 * - Images embarquées (base64 ou URL)
 * - Formulaire RSVP → Google Apps Script
 * - Countdown JavaScript
 * - Design responsive mobile-first
 * - Palette harmonisée appliquée automatiquement
 */

import { getHarmonizedPalette, getGoogleFontsUrl, type HarmonizedPalette } from './palettes'

/* ── Types d'entrée ───────────────────────────────────────── */

export interface GenerateInput {
  // Mariés
  marie1Prenom: string
  marie1Nom: string
  marie2Prenom: string
  marie2Nom: string

  // Familles
  famille1: FamilleInput
  famille2: FamilleInput

  // Événements
  evenements: EvenementInput[]

  // Design
  paletteId: string
  logoUrl: string      // URL ou base64
  musicUrl: string

  // Images par événement (clé = event id)
  images: Record<string, string>

  // RSVP
  emailContact: string
  googleScriptUrl?: string
}

export interface FamilleInput {
  pere: { prenom: string; nom: string; disparu: boolean }
  mere: { prenom: string; nom: string; disparu: boolean }
  grandParentsPaternels: GrandParentInput
  grandParentsMaternels: GrandParentInput
}

export interface GrandParentInput {
  grandPerePrenom: string; grandPereNom: string; grandPereDisparu: boolean
  grandMerePrenom: string; grandMereNom: string; grandMereDisparu: boolean
}

export interface EvenementInput {
  id: string
  type: string
  customName: string
  lieu: string
  adresse: string
  date: string
  heure: string
  note: string
  transport: string
  hebergement: string
}

/* ── Utilitaires ──────────────────────────────────────────── */

function esc(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;')
}

function formatDateFr(dateStr: string): string {
  if (!dateStr) return ''
  try {
    const d = new Date(dateStr + 'T00:00:00')
    const jours = ['Dimanche', 'Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi']
    const mois = ['Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin', 'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre']
    return `${jours[d.getDay()]} ${d.getDate()} ${mois[d.getMonth()]} ${d.getFullYear()}`
  } catch {
    return dateStr
  }
}

function formatHeure(heure: string): string {
  if (!heure) return ''
  return heure.replace(':', 'h')
}

function extractYoutubeId(url: string): string | null {
  const m = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([\w-]{11})/)
  return m ? m[1] : null
}

function eventTitle(type: string, customName: string): string {
  if (type === 'Autre' && customName) return customName
  return type
}

function isDark(hex: string): boolean {
  const r = parseInt(hex.slice(1, 3), 16)
  const g = parseInt(hex.slice(3, 5), 16)
  const b = parseInt(hex.slice(5, 7), 16)
  return (r * 299 + g * 587 + b * 114) / 1000 < 128
}

/* ── Sections HTML ────────────────────────────────────────── */

function renderParent(p: { prenom: string; nom: string; disparu: boolean }): string {
  if (!p.prenom && !p.nom) return ''
  const name = `${esc(p.prenom)} ${esc(p.nom)}`
  return p.disparu ? `${name} <span class="zal">ז״ל</span>` : name
}

function renderGrandParent(gp: GrandParentInput, label: string): string {
  const gpe = gp.grandPerePrenom || gp.grandPereNom
    ? `${esc(gp.grandPerePrenom)} ${esc(gp.grandPereNom)}${gp.grandPereDisparu ? ' <span class="zal">ז״ל</span>' : ''}`
    : ''
  const gme = gp.grandMerePrenom || gp.grandMereNom
    ? `${esc(gp.grandMerePrenom)} ${esc(gp.grandMereNom)}${gp.grandMereDisparu ? ' <span class="zal">ז״ל</span>' : ''}`
    : ''
  if (!gpe && !gme) return ''
  const parts = [gpe, gme].filter(Boolean).join(' & ')
  return `<p class="gp-line"><span class="gp-label">${esc(label)}</span>${parts}</p>`
}

function renderFamillesSection(f1: FamilleInput, f2: FamilleInput, palette: HarmonizedPalette): string {
  const pere1 = renderParent(f1.pere)
  const mere1 = renderParent(f1.mere)
  const pere2 = renderParent(f2.pere)
  const mere2 = renderParent(f2.mere)

  const parents1 = [pere1, mere1].filter(Boolean)
  const parents2 = [pere2, mere2].filter(Boolean)

  if (parents1.length === 0 && parents2.length === 0) return ''

  const gp1Pa = renderGrandParent(f1.grandParentsPaternels, 'Grands-parents paternels : ')
  const gp1Ma = renderGrandParent(f1.grandParentsMaternels, 'Grands-parents maternels : ')
  const gp2Pa = renderGrandParent(f2.grandParentsPaternels, 'Grands-parents paternels : ')
  const gp2Ma = renderGrandParent(f2.grandParentsMaternels, 'Grands-parents maternels : ')
  const hasGP = gp1Pa || gp1Ma || gp2Pa || gp2Ma

  return `
    <section class="familles-section">
      <div class="separator">
        <span class="sep-line"></span>
        <span class="sep-dot">✦</span>
        <span class="sep-line"></span>
      </div>
      <h2 class="section-title">Les Familles</h2>
      ${parents1.length > 0 ? `<p class="parents-line">${parents1.join(' & ')}</p>` : ''}
      ${parents2.length > 0 ? `<p class="parents-line">${parents2.join(' & ')}</p>` : ''}
      <p class="joy-text">ont la joie de vous faire part du mariage de leurs enfants</p>
      ${hasGP ? `
        <div class="grandparents-block">
          ${gp1Pa}${gp1Ma}${gp2Pa}${gp2Ma}
        </div>
      ` : ''}
    </section>
  `
}

function renderEvenement(evt: EvenementInput, imageUrl: string, palette: HarmonizedPalette): string {
  const title = eventTitle(evt.type, evt.customName)

  return `
    <section class="event-section">
      <div class="separator">
        <span class="sep-line"></span>
        <span class="sep-dot">✦</span>
        <span class="sep-line"></span>
      </div>
      <h2 class="event-title">${esc(title)}</h2>
      ${imageUrl ? `<img class="event-image" src="${esc(imageUrl)}" alt="${esc(title)}">` : ''}
      <p class="event-date">${formatDateFr(evt.date)}</p>
      ${evt.heure ? `<p class="event-time">à ${formatHeure(evt.heure)}</p>` : ''}
      <p class="event-lieu">${esc(evt.lieu)}</p>
      ${evt.adresse ? `
        <p class="event-adresse">${esc(evt.adresse)}</p>
        <div class="event-buttons">
          <a class="btn-maps" href="https://maps.google.com/?q=${encodeURIComponent(evt.adresse)}" target="_blank" rel="noopener">📍 Maps</a>
          <a class="btn-waze" href="https://waze.com/ul?q=${encodeURIComponent(evt.adresse)}" target="_blank" rel="noopener">🚗 Waze</a>
        </div>
      ` : ''}
      ${evt.note ? `<p class="event-note">${esc(evt.note)}</p>` : ''}
      ${evt.transport ? `
        <div class="event-info-block">
          <span class="info-icon">🚌</span>
          <div>
            <strong>Transport</strong>
            <p>${esc(evt.transport)}</p>
          </div>
        </div>
      ` : ''}
      ${evt.hebergement ? `
        <div class="event-info-block">
          <span class="info-icon">🏨</span>
          <div>
            <strong>Hébergement</strong>
            <p>${esc(evt.hebergement)}</p>
          </div>
        </div>
      ` : ''}
    </section>
  `
}

function renderRsvpSection(evenements: EvenementInput[], palette: HarmonizedPalette, googleScriptUrl: string): string {
  return `
    <section class="rsvp-section" id="rsvp">
      <div class="separator">
        <span class="sep-line"></span>
        <span class="sep-dot">✦</span>
        <span class="sep-line"></span>
      </div>
      <h2 class="rsvp-title">RSVP</h2>
      <p class="rsvp-subtitle">Nous serions honorés de votre présence</p>

      <div id="rsvp-form-container">
        <form class="rsvp-form" id="rsvp-form" onsubmit="return false;">
          <div class="rsvp-field">
            <label class="rsvp-label">Votre nom</label>
            <input class="rsvp-input" type="text" id="rsvp-nom" placeholder="Prénom Nom" required>
          </div>

          <div class="rsvp-field">
            <label class="rsvp-label">Votre présence</label>
            <div class="rsvp-ceremonies" id="rsvp-ceremonies">
              ${evenements.map((evt, i) => {
                const name = eventTitle(evt.type, evt.customName)
                return `
                <div class="rsvp-ceremony-row" data-idx="${i}">
                  <span class="rsvp-ceremony-name">${esc(name)}</span>
                  <div class="rsvp-presence-btns">
                    <button type="button" class="rsvp-btn" data-idx="${i}" data-val="present" onclick="togglePresence(${i}, true)">Présent</button>
                    <button type="button" class="rsvp-btn" data-idx="${i}" data-val="absent" onclick="togglePresence(${i}, false)">Absent</button>
                  </div>
                </div>`
              }).join('')}
            </div>
          </div>

          <div class="rsvp-field">
            <label class="rsvp-label">Nombre de personnes</label>
            <input class="rsvp-input" type="number" id="rsvp-nb" min="1" max="20" value="1">
          </div>

          <div class="rsvp-field">
            <label class="rsvp-label">Un petit mot (optionnel)</label>
            <textarea class="rsvp-input rsvp-textarea" id="rsvp-message" placeholder="Mazal Tov !"></textarea>
          </div>

          <button type="button" class="rsvp-submit" id="rsvp-submit" onclick="submitRsvp()">Envoyer ma réponse</button>
          <div class="rsvp-error" id="rsvp-error"></div>
        </form>
      </div>

      <div class="rsvp-success" id="rsvp-success">
        <h3>Merci !</h3>
        <p>Votre réponse a bien été enregistrée.</p>
      </div>
    </section>
  `
}

/* ── Génération principale ────────────────────────────────── */

export function generateStaticHtml(input: GenerateInput): string {
  const p = getHarmonizedPalette(input.paletteId)
  const dark = isDark(p.fondColor)
  const fontsUrl = getGoogleFontsUrl()

  const firstDate = input.evenements[0]?.date || ''

  const eventsSections = input.evenements
    .map(evt => renderEvenement(evt, input.images[evt.id] || '', p))
    .join('')

  const famillesSection = renderFamillesSection(input.famille1, input.famille2, p)

  const rsvpSection = renderRsvpSection(input.evenements, p, input.googleScriptUrl || '')

  return `<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${esc(input.marie1Prenom)} & ${esc(input.marie2Prenom)} — Faire-part</title>
  <meta name="description" content="Faire-part de mariage de ${esc(input.marie1Prenom)} & ${esc(input.marie2Prenom)}">
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="${fontsUrl}" rel="stylesheet">
  <style>
    *, *::before, *::after { margin: 0; padding: 0; box-sizing: border-box; }

    body {
      font-family: '${p.texteFont}', serif;
      background: ${p.fondColor};
      color: ${p.texteColor};
      min-height: 100vh;
      -webkit-font-smoothing: antialiased;
    }

    .container {
      width: 100%;
      max-width: 520px;
      margin: 0 auto;
      overflow: hidden;
    }

    /* ── Navbar ── */
    .navbar {
      display: flex; align-items: center; justify-content: space-between;
      padding: 14px 20px;
      border-bottom: 1px solid ${p.accentColor}22;
    }
    .navbar-logo img { height: 36px; width: auto; }
    .navbar-logo-text {
      font-family: '${p.prenomsFont}', cursive;
      font-size: 20px; color: ${p.prenomsColor};
    }
    .countdown { font-size: 12px; color: ${p.texteSecondaireColor}; text-align: right; }
    .countdown-val { font-weight: 700; color: ${p.accentColor}; }

    /* ── Séparateurs ── */
    .separator {
      display: flex; align-items: center; gap: 10px;
      justify-content: center; margin: 0 auto 20px; width: 160px;
    }
    .sep-line { flex: 1; height: 0.5px; background: ${p.accentColor}; opacity: 0.4; }
    .sep-dot { color: ${p.accentColor}; font-size: 8px; opacity: 0.6; }

    /* ── Accueil ── */
    .accueil {
      text-align: center; padding: 52px 20px 40px;
    }
    .couple-names {
      font-family: '${p.prenomsFont}', cursive;
      font-size: clamp(36px, 10vw, 52px);
      color: ${p.prenomsColor};
      line-height: 1.3;
      margin-bottom: 4px;
    }
    .ampersand {
      font-family: '${p.titresFont}', serif;
      font-size: 22px; color: ${p.accentColor}; opacity: 0.6;
      margin: 4px 0;
    }
    .accueil-date {
      font-family: '${p.titresFont}', serif;
      font-size: 13px; letter-spacing: 3px; text-transform: uppercase;
      color: ${p.titresColor}; margin-top: 16px; opacity: 0.8;
    }

    /* ── Familles ── */
    .familles-section {
      text-align: center; padding: 36px 20px;
    }
    .section-title {
      font-family: '${p.titresFont}', serif;
      font-size: 22px; color: ${p.titresColor};
      margin-bottom: 16px; font-weight: 600;
    }
    .parents-line {
      font-size: 16px; color: ${p.texteColor};
      margin-bottom: 6px; line-height: 1.6;
    }
    .joy-text {
      font-style: italic; font-size: 15px;
      color: ${p.texteSecondaireColor}; margin: 14px 0 8px;
      line-height: 1.6;
    }
    .grandparents-block {
      margin-top: 16px; padding-top: 16px;
      border-top: 1px solid ${p.accentColor}22;
    }
    .gp-line {
      font-size: 14px; color: ${p.texteSecondaireColor};
      margin-bottom: 6px; line-height: 1.5;
    }
    .gp-label { font-style: italic; opacity: 0.7; }
    .zal { font-style: italic; opacity: 0.6; font-size: 0.9em; }

    /* ── Événements ── */
    .event-section {
      text-align: center; padding: 40px 20px;
    }
    .event-title {
      font-family: '${p.titresFont}', serif;
      font-size: 24px; color: ${p.titresColor};
      margin-bottom: 16px; font-weight: 600;
      letter-spacing: 1px; text-transform: uppercase;
    }
    .event-image {
      max-width: 180px; width: 80%; height: auto;
      margin: 0 auto 20px; display: block;
      opacity: 0.85;
    }
    .event-date {
      font-family: '${p.titresFont}', serif;
      font-size: 16px; font-weight: 600;
      color: ${p.texteColor}; margin-bottom: 4px;
    }
    .event-time {
      font-size: 15px; color: ${p.texteSecondaireColor};
      margin-bottom: 14px;
    }
    .event-lieu {
      font-size: 17px; font-weight: 600;
      color: ${p.texteColor}; margin-bottom: 4px;
    }
    .event-adresse {
      font-size: 14px; color: ${p.texteSecondaireColor};
      margin-bottom: 14px; line-height: 1.5;
    }
    .event-buttons {
      display: flex; gap: 8px; justify-content: center; margin-bottom: 16px;
    }
    .btn-maps, .btn-waze {
      display: inline-flex; align-items: center; gap: 4px;
      padding: 8px 18px; border-radius: 4px;
      font-size: 12px; font-weight: 600;
      text-decoration: none; letter-spacing: 1px;
      text-transform: uppercase;
      transition: opacity 0.2s;
    }
    .btn-maps {
      background: ${p.accentColor}; color: ${dark ? p.fondColor : 'white'};
    }
    .btn-waze {
      border: 1px solid ${p.accentColor}; color: ${p.accentColor};
      background: transparent;
    }
    .btn-maps:hover, .btn-waze:hover { opacity: 0.8; }
    .event-note {
      font-style: italic; font-size: 14px;
      color: ${p.texteSecondaireColor}; margin-top: 12px;
      line-height: 1.6;
    }
    .event-info-block {
      display: flex; align-items: flex-start; gap: 10px;
      text-align: left; margin-top: 16px;
      padding: 12px 16px; border-radius: 8px;
      background: ${p.fondSecondaryColor};
      border: 1px solid ${p.accentColor}15;
    }
    .info-icon { font-size: 18px; flex-shrink: 0; margin-top: 2px; }
    .event-info-block strong {
      font-size: 13px; letter-spacing: 1px;
      text-transform: uppercase; color: ${p.titresColor};
    }
    .event-info-block p {
      font-size: 14px; color: ${p.texteSecondaireColor};
      margin-top: 4px; line-height: 1.5;
    }

    /* ── RSVP ── */
    .rsvp-section { padding: 40px 20px; text-align: center; }
    .rsvp-title {
      font-family: '${p.titresFont}', serif;
      font-size: 28px; color: ${p.titresColor}; margin-bottom: 6px;
    }
    .rsvp-subtitle {
      font-size: 14px; color: ${p.texteSecondaireColor};
      font-style: italic; margin-bottom: 28px;
    }
    .rsvp-form {
      text-align: left; max-width: 380px; margin: 0 auto;
    }
    .rsvp-field { margin-bottom: 18px; }
    .rsvp-label {
      display: block; font-size: 11px; font-weight: 700;
      letter-spacing: 2px; text-transform: uppercase;
      color: ${p.texteSecondaireColor}; margin-bottom: 6px;
    }
    .rsvp-input {
      width: 100%; padding: 11px 14px;
      border: 1px solid ${p.accentColor}44;
      border-radius: 6px; font-size: 15px;
      font-family: '${p.texteFont}', serif;
      background: transparent; color: ${p.texteColor};
      outline: none; box-sizing: border-box;
    }
    .rsvp-input:focus { border-color: ${p.accentColor}; }
    .rsvp-textarea { resize: vertical; min-height: 70px; }
    .rsvp-ceremonies { display: flex; flex-direction: column; gap: 8px; }
    .rsvp-ceremony-row {
      display: flex; align-items: center; justify-content: space-between;
      padding: 10px 14px; border: 1px solid ${p.accentColor}22;
      border-radius: 6px;
    }
    .rsvp-ceremony-name {
      font-size: 14px; font-weight: 600; color: ${p.texteColor};
    }
    .rsvp-presence-btns { display: flex; gap: 6px; }
    .rsvp-btn {
      padding: 6px 14px; border: 1px solid ${p.accentColor}44;
      border-radius: 4px; font-size: 11px; font-weight: 600;
      letter-spacing: 1px; text-transform: uppercase;
      cursor: pointer; background: transparent;
      color: ${p.texteSecondaireColor}; transition: all 0.2s;
      font-family: '${p.texteFont}', serif;
    }
    .rsvp-btn.active-present {
      background: ${p.accentColor};
      color: ${dark ? p.fondColor : 'white'};
      border-color: ${p.accentColor};
    }
    .rsvp-btn.active-absent {
      background: ${p.texteSecondaireColor};
      color: ${dark ? p.fondColor : 'white'};
      border-color: ${p.texteSecondaireColor};
    }
    .rsvp-submit {
      width: 100%; padding: 14px;
      background: ${p.accentColor};
      color: ${dark ? p.fondColor : 'white'};
      border: none; border-radius: 6px;
      font-size: 13px; font-weight: 700;
      letter-spacing: 2px; text-transform: uppercase;
      cursor: pointer; transition: opacity 0.2s;
      margin-top: 8px;
      font-family: '${p.texteFont}', serif;
    }
    .rsvp-submit:hover { opacity: 0.85; }
    .rsvp-submit:disabled { opacity: 0.5; cursor: not-allowed; }
    .rsvp-success {
      display: none; text-align: center; padding: 32px 0;
    }
    .rsvp-success h3 {
      font-family: '${p.prenomsFont}', cursive;
      font-size: 28px; color: ${p.prenomsColor}; margin-bottom: 8px;
    }
    .rsvp-success p {
      font-size: 14px; color: ${p.texteSecondaireColor};
    }
    .rsvp-error {
      display: none; color: #c44;
      font-size: 13px; margin-top: 8px; text-align: center;
    }

    /* ── Music ── */
    .music-section {
      text-align: center; padding: 16px 20px;
    }
    .music-section iframe {
      width: 100%; max-width: 360px; border-radius: 12px;
    }

    /* ── Footer ── */
    .footer {
      text-align: center; padding: 40px 20px;
      border-top: 1px solid ${p.accentColor}22;
    }
    .footer-names {
      font-family: '${p.prenomsFont}', cursive;
      font-size: 28px; color: ${p.prenomsColor}; margin-bottom: 8px;
    }
    .footer-credit {
      font-size: 11px; color: ${p.texteSecondaireColor}; opacity: 0.5;
    }
    .footer-credit a {
      color: ${p.accentColor}; text-decoration: none;
    }

    /* ── Animations ── */
    @keyframes fadeUp {
      from { opacity: 0; transform: translateY(20px); }
      to { opacity: 1; transform: translateY(0); }
    }
    .animate { animation: fadeUp 0.7s ease both; }
    .delay-1 { animation-delay: 0.15s; }
    .delay-2 { animation-delay: 0.3s; }
    .delay-3 { animation-delay: 0.45s; }
  </style>
</head>
<body>
  <div class="container">

    <!-- Navbar -->
    <nav class="navbar">
      <div class="navbar-logo">
        ${input.logoUrl
          ? `<img src="${esc(input.logoUrl)}" alt="logo">`
          : `<span class="navbar-logo-text">${esc(input.marie1Prenom[0] || '')}♡${esc(input.marie2Prenom[0] || '')}</span>`
        }
      </div>
      <div class="countdown" id="countdown"></div>
    </nav>

    <!-- Accueil -->
    <section class="accueil animate">
      <div class="couple-names">${esc(input.marie1Prenom)}</div>
      <div class="ampersand">&</div>
      <div class="couple-names delay-1 animate">${esc(input.marie2Prenom)}</div>
      <p class="accueil-date delay-2 animate">${formatDateFr(firstDate)}</p>
    </section>

    <!-- Familles -->
    ${famillesSection}

    <!-- Événements -->
    ${eventsSections}

    <!-- Music -->
    ${input.musicUrl && extractYoutubeId(input.musicUrl) ? `
    <div class="music-section">
      <iframe src="https://www.youtube.com/embed/${extractYoutubeId(input.musicUrl)}?autoplay=1&loop=1" height="80" frameborder="0" allow="autoplay; encrypted-media" allowfullscreen></iframe>
    </div>
    ` : ''}

    <!-- RSVP -->
    ${rsvpSection}

    <!-- Footer -->
    <footer class="footer">
      <p class="footer-names">${esc(input.marie1Prenom)} & ${esc(input.marie2Prenom)}</p>
      <p class="footer-credit">créé avec ♥ par <a href="https://getlovit.fr" target="_blank">Lov'it</a></p>
    </footer>

  </div>

  <script>
    // === Countdown ===
    (function() {
      var targetDate = '${firstDate}';
      if (!targetDate) return;
      var target = new Date(targetDate + 'T00:00:00').getTime();
      function update() {
        var now = Date.now();
        var diff = target - now;
        if (diff <= 0) {
          document.getElementById('countdown').innerHTML = '✨ Jour J !';
          return;
        }
        var d = Math.floor(diff / 86400000);
        var h = Math.floor((diff % 86400000) / 3600000);
        document.getElementById('countdown').innerHTML =
          '<span class="countdown-val">' + d + '</span> jours <span class="countdown-val">' + h + '</span>h';
      }
      update();
      setInterval(update, 60000);
    })();

    // === RSVP ===
    var presenceState = {};

    function togglePresence(idx, isPresent) {
      presenceState[idx] = isPresent;
      var btns = document.querySelectorAll('.rsvp-btn[data-idx="' + idx + '"]');
      btns.forEach(function(btn) {
        btn.classList.remove('active-present', 'active-absent');
        if (btn.dataset.val === 'present' && isPresent) btn.classList.add('active-present');
        if (btn.dataset.val === 'absent' && !isPresent) btn.classList.add('active-absent');
      });
    }

    function submitRsvp() {
      var nom = document.getElementById('rsvp-nom').value.trim();
      if (!nom) { showError('Veuillez entrer votre nom.'); return; }

      var ceremonies = [];
      var rows = document.querySelectorAll('.rsvp-ceremony-row');
      for (var i = 0; i < rows.length; i++) {
        var name = rows[i].querySelector('.rsvp-ceremony-name').textContent;
        if (presenceState[i] !== undefined) {
          ceremonies.push(name + ': ' + (presenceState[i] ? 'Présent' : 'Absent'));
        }
      }
      if (ceremonies.length === 0) {
        showError('Veuillez indiquer votre présence pour au moins un événement.');
        return;
      }

      var nbPersonnes = document.getElementById('rsvp-nb').value || '1';
      var message = document.getElementById('rsvp-message').value.trim();

      var btn = document.getElementById('rsvp-submit');
      btn.disabled = true;
      btn.textContent = 'Envoi en cours...';
      hideError();

      var scriptUrl = '${esc(input.googleScriptUrl || '')}';

      if (scriptUrl) {
        fetch(scriptUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            nom: nom,
            ceremonies: ceremonies.join(', '),
            present: Object.values(presenceState).some(function(v) { return v; }) ? 'Présent' : 'Absent',
            nbPersonnes: nbPersonnes,
            message: message
          }),
          mode: 'no-cors'
        }).then(done).catch(done);
      } else {
        // Pas de Google Apps Script configuré — fallback mailto
        var email = '${esc(input.emailContact || '')}';
        if (email) {
          var subject = encodeURIComponent('RSVP - ' + nom);
          var body = encodeURIComponent(
            'Nom : ' + nom + '\\n' +
            'Présence : ' + ceremonies.join(', ') + '\\n' +
            'Nombre de personnes : ' + nbPersonnes +
            (message ? '\\nMessage : ' + message : '')
          );
          window.location.href = 'mailto:' + email + '?subject=' + subject + '&body=' + body;
          showFallbackSuccess();
        } else {
          showError('Le formulaire RSVP n\\'est pas encore configuré. Contactez les mariés directement.');
        }
      }

      function done() {
        document.getElementById('rsvp-form-container').style.display = 'none';
        document.getElementById('rsvp-success').style.display = 'block';
      }

      function showFallbackSuccess() {
        document.getElementById('rsvp-form-container').style.display = 'none';
        var s = document.getElementById('rsvp-success');
        s.querySelector('h3').textContent = 'Presque terminé !';
        s.querySelector('p').textContent = 'Votre application email va s\\'ouvrir — envoyez le message pour confirmer votre présence.';
        s.style.display = 'block';
      }
    }

    function showError(msg) {
      var el = document.getElementById('rsvp-error');
      el.textContent = msg; el.style.display = 'block';
    }
    function hideError() {
      document.getElementById('rsvp-error').style.display = 'none';
    }
  </script>
</body>
</html>`
}
