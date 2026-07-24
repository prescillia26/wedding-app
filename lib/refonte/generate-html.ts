/**
 * Générateur de HTML statique autonome pour le wizard de création.
 *
 * Structure fixe, contenu 100 % dynamique :
 * - Couleurs → palette choisie dans StepDesign
 * - Textes  → données saisies dans le wizard
 * - Sections événements → générées selon evenements[]
 */

import { getHarmonizedPalette, getGoogleFontsUrl, type HarmonizedPalette } from './palettes'

/* ── Types d'entrée ───────────────────────────────────────── */

export interface GenerateInput {
  marie1Prenom: string
  marie1Nom: string
  marie2Prenom: string
  marie2Nom: string
  famille1: FamilleInput
  famille2: FamilleInput
  evenements: EvenementInput[]
  paletteId: string
  logoUrl: string
  musicUrl: string
  images: Record<string, string>
  emailContact: string
  googleScriptUrl?: string
  mariageJuif?: boolean
  accueilImageUrl?: string
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
  suiviDAutre?: boolean
  evenementSuivantNom?: string
  evenementSuivantAdresse?: string
}

/* ── Mapping palette → noms du template ───────────────────── */

interface TemplatePalette {
  fondColor: string
  accentColor: string
  texteColor: string
  texteSecondaire: string
  titreFont: string   // calligraphie (Great Vibes…)
  texteFont: string   // texte courant (Cormorant Garamond…)
  labelFont: string   // labels (Playfair Display…)
  smallFont: string   // petits labels (Montserrat)
}

function toTemplatePalette(p: HarmonizedPalette): TemplatePalette {
  return {
    fondColor: p.fondColor,
    accentColor: p.accentColor,
    texteColor: p.texteColor,
    texteSecondaire: p.texteSecondaireColor,
    titreFont: p.prenomsFont,
    texteFont: p.texteFont,
    labelFont: p.titresFont,
    smallFont: 'Montserrat',
  }
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

const JOURS = ['Dimanche', 'Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi']
const MOIS_FR = ['Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin', 'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre']

function parseDate(dateStr: string): Date | null {
  if (!dateStr) return null
  try { return new Date(dateStr + 'T00:00:00') } catch { return null }
}

function formatHeure(heure: string): string {
  if (!heure) return ''
  return `à ${heure.replace(':', 'h')}`
}

function extractYoutubeId(url: string): string | null {
  const m = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([\w-]{11})/)
  return m ? m[1] : null
}

function joinName(prenom: string, nom: string): string {
  return [prenom, nom].filter(Boolean).join(' ')
}

function formatLieu(lieu: string): string {
  if (!lieu) return ''
  const l = lieu.toLowerCase()
  if (l.includes('salon') || l.includes('salle')) return `Dans les salons ${esc(lieu)}`
  if (l.includes('château') || l.includes('chateau')) return `Au château ${esc(lieu)}`
  if (l.includes('domaine')) return `Au domaine ${esc(lieu)}`
  return `À ${esc(lieu)}`
}

function getCeremonyDisplayName(type: string, customName?: string): string {
  if (type === 'Autre' && customName) return customName
  const map: Record<string, string> = {
    'Mairie': 'La Mairie',
    'Cérémonie religieuse / Houppa': 'La Houppa',
    'Henné': 'Le Henné',
    'Henna': 'Le Henné',
    'Réception / Soirée': 'La Soirée',
    'Cocktail': 'Le Cocktail',
    'Shabbat Hatan': 'Le Shabbat',
  }
  return map[type] || type
}

function getFooterMonths(evenements: EvenementInput[]): string {
  const dates = evenements.map(e => e.date).filter(Boolean).sort()
  if (dates.length === 0) return ''
  const first = new Date(dates[0] + 'T00:00:00')
  const last = new Date(dates[dates.length - 1] + 'T00:00:00')
  if (first.getMonth() === last.getMonth() && first.getFullYear() === last.getFullYear()) {
    return `${MOIS_FR[first.getMonth()]} ${first.getFullYear()}`
  }
  if (first.getFullYear() === last.getFullYear()) {
    return `${MOIS_FR[first.getMonth()]} – ${MOIS_FR[last.getMonth()]} ${first.getFullYear()}`
  }
  return `${MOIS_FR[first.getMonth()]} ${first.getFullYear()} – ${MOIS_FR[last.getMonth()]} ${last.getFullYear()}`
}

/* ── Familles — vivants / défunts ─────────────────────────── */

function fmtGpCoupleLiving(gp: GrandParentInput): string {
  const hasPere = (gp.grandPerePrenom || gp.grandPereNom) && !gp.grandPereDisparu
  const hasMere = (gp.grandMerePrenom || gp.grandMereNom) && !gp.grandMereDisparu
  if (hasPere && hasMere) return `M. &amp; Mme ${esc(joinName(gp.grandPerePrenom, gp.grandPereNom || gp.grandMereNom))}`
  if (hasPere) return `M. ${esc(joinName(gp.grandPerePrenom, gp.grandPereNom))}`
  if (hasMere) return `Mme ${esc(joinName(gp.grandMerePrenom, gp.grandMereNom))}`
  return ''
}

function fmtParentsLineLiving(
  pere: { prenom: string; nom: string; disparu: boolean },
  mere: { prenom: string; nom: string; disparu: boolean },
): string {
  const pFull = !pere.disparu ? joinName(pere.prenom, pere.nom) : ''
  const mFull = !mere.disparu ? joinName(mere.prenom, mere.nom) : ''
  if (pFull && mFull) return `M. &amp; Mme ${esc(pFull)}`
  if (pFull) return `M. ${esc(pFull)}`
  if (mFull) return `Mme ${esc(mFull)}`
  return ''
}

function collectDisparus(f1: FamilleInput, f2: FamilleInput): string[] {
  const noms: string[] = []
  if (f1.pere.disparu && (f1.pere.prenom || f1.pere.nom)) noms.push(joinName(f1.pere.prenom, f1.pere.nom))
  if (f1.mere.disparu && (f1.mere.prenom || f1.mere.nom)) noms.push(joinName(f1.mere.prenom, f1.mere.nom))
  if (f2.pere.disparu && (f2.pere.prenom || f2.pere.nom)) noms.push(joinName(f2.pere.prenom, f2.pere.nom))
  if (f2.mere.disparu && (f2.mere.prenom || f2.mere.nom)) noms.push(joinName(f2.mere.prenom, f2.mere.nom))
  for (const gp of [f1.grandParentsPaternels, f1.grandParentsMaternels, f2.grandParentsPaternels, f2.grandParentsMaternels]) {
    if (gp.grandPereDisparu && (gp.grandPerePrenom || gp.grandPereNom)) noms.push(joinName(gp.grandPerePrenom, gp.grandPereNom))
    if (gp.grandMereDisparu && (gp.grandMerePrenom || gp.grandMereNom)) noms.push(joinName(gp.grandMerePrenom, gp.grandMereNom))
  }
  return noms
}

/* ── Composants HTML réutilisables ────────────────────────── */

function bsdCorner(mariageJuif: boolean | undefined, tp: TemplatePalette): string {
  if (!mariageJuif) return ''
  return `<div style="position:absolute;top:12px;right:16px;font-family:serif;font-size:13px;color:${tp.accentColor};direction:rtl;opacity:0.85;">בס״ד</div>`
}

function separator(tp: TemplatePalette): string {
  return `<div class="separator">
    <span class="sep-line" style="background:linear-gradient(to right,transparent,${tp.accentColor}66)"></span>
    <span class="sep-dot" style="color:${tp.accentColor}">&#9670;</span>
    <span class="sep-line" style="background:linear-gradient(to left,transparent,${tp.accentColor}66)"></span>
  </div>`
}

function dateBox(dateStr: string, tp: TemplatePalette): string {
  const d = parseDate(dateStr)
  if (!d) return ''
  const year = String(d.getFullYear()).split('').join(' ')
  return `<div class="date-box">
    <div class="date-row">
      <span class="date-line"></span>
      <span class="date-day-name">${JOURS[d.getDay()].toUpperCase()}</span>
      <div class="date-num-frame"><span class="date-day-num">${d.getDate()}</span></div>
      <span class="date-month-name">${MOIS_FR[d.getMonth()].toUpperCase()}</span>
      <span class="date-line"></span>
    </div>
    <div class="date-year">${year}</div>
  </div>`
}

function mapButtons(adresse: string, tp: TemplatePalette): string {
  if (!adresse) return ''
  const q = encodeURIComponent(adresse)
  return `<div class="event-buttons">
    <a class="btn-map" href="https://maps.google.com/?q=${q}" target="_blank" rel="noopener">Maps</a>
    <a class="btn-map" href="https://waze.com/ul?q=${q}" target="_blank" rel="noopener">Waze</a>
  </div>`
}

function infoBlock(label: string, value: string): string {
  if (!value) return ''
  return `<div class="info-text-block"><span class="info-label">${esc(label)}</span><span class="info-detail">${esc(value)}</span></div>`
}

function noteBlock(note: string): string {
  if (!note) return ''
  return `<div class="event-note-block"><div class="event-note">${esc(note)}</div></div>`
}

function coupleNames(p1: string, p2: string): string {
  return `<div class="couple-names-inline">
    <span class="couple-name">${esc(p1)}</span>
    <span class="couple-amp">&amp;</span>
    <span class="couple-name">${esc(p2)}</span>
  </div>`
}

/* ── Rendus par type de cérémonie ─────────────────────────── */

function renderMairie(evt: EvenementInput, input: GenerateInput, tp: TemplatePalette): string {
  const imageUrl = input.images[evt.id] || ''
  return `
  <section class="event-section" style="position:relative;">
    ${bsdCorner(input.mariageJuif, tp)}
    ${imageUrl ? `<img class="event-image" src="${esc(imageUrl)}" alt="Mairie">` : ''}
    <div class="card-title-calligraphie">La Mairie</div>
    ${coupleNames(input.marie1Prenom, input.marie2Prenom)}
    <div class="mairie-sediront">se diront &laquo; OUI &raquo;</div>
    ${dateBox(evt.date, tp)}
    <div class="event-time-large">${formatHeure(evt.heure)}</div>
    ${separator(tp)}
    <div class="event-lieu-text">
      ${evt.lieu ? `<div class="lieu-bold">${esc(evt.lieu)}</div>` : ''}
      ${evt.adresse ? `<div class="event-adresse">${esc(evt.adresse)}</div>` : ''}
    </div>
    ${mapButtons(evt.adresse, tp)}
    ${infoBlock('Transport', evt.transport)}
    ${evt.suiviDAutre && evt.evenementSuivantNom ? `<div class="suivi-text-italic">La Mairie sera suivie ${esc(evt.evenementSuivantNom)}.</div>` : ''}
    ${noteBlock(evt.note)}
  </section>`
}

function renderHouppa(evt: EvenementInput, input: GenerateInput, tp: TemplatePalette): string {
  const imageUrl = input.images[evt.id] || ''
  const f1 = input.famille1, f2 = input.famille2

  const gpPa1 = fmtGpCoupleLiving(f1.grandParentsPaternels)
  const gpMa1 = fmtGpCoupleLiving(f1.grandParentsMaternels)
  const gpPa2 = fmtGpCoupleLiving(f2.grandParentsPaternels)
  const gpMa2 = fmtGpCoupleLiving(f2.grandParentsMaternels)

  const parents1 = fmtParentsLineLiving(f1.pere, f1.mere)
  const parents2 = fmtParentsLineLiving(f2.pere, f2.mere)

  // Construire les lignes en excluant les vides
  const lignesGauche = [gpPa1, gpMa1, parents1].filter(l => l?.trim())
  const lignesDroite = [gpPa2, gpMa2, parents2].filter(l => l?.trim())
  const maxLignes = Math.max(lignesGauche.length, lignesDroite.length)

  // Padding EN HAUT : les vides en haut, les noms en bas alignés
  const paddedGauche = [...Array(maxLignes - lignesGauche.length).fill(''), ...lignesGauche]
  const paddedDroite = [...Array(maxLignes - lignesDroite.length).fill(''), ...lignesDroite]

  const hasGp = !!(gpPa1 || gpMa1 || gpPa2 || gpMa2)
  const joie = hasGp
    ? 'ont la joie de vous faire part du mariage de leurs petits-enfants et enfants'
    : 'ont la joie de vous faire part du mariage de leurs enfants'

  const disparus = collectDisparus(f1, f2)
  let penseeHtml = ''
  if (disparus.length > 0) {
    const nomsStr = disparus.map(n => esc(n)).join(', ')
    penseeHtml = `<div class="pensee-text">En ce jour si important, nous aurons une forte pensée pour ${nomsStr} dont la mémoire veille sur nous.</div>`
  }

  return `
  <section class="event-section" style="position:relative;">
    ${bsdCorner(input.mariageJuif, tp)}
    ${imageUrl ? `<img class="event-image" src="${esc(imageUrl)}" alt="Houppa">` : ''}
    <div class="card-title-calligraphie">La Houppa</div>

    ${input.mariageJuif ? `<div class="hebrew-verse">קוֹל שָׂשׂוֹן וְקוֹל שִׂמְחָה קוֹל חָתָן וְקוֹל כַּלָּה</div>` : ''}
    <div class="thin-line"></div>

    <div class="famille-grid">
      <div class="famille-col">
        ${paddedGauche.map(l => l ? `<div>${l}</div>` : '<div>&nbsp;</div>').join('\n        ')}
      </div>
      <div class="famille-sep"></div>
      <div class="famille-col famille-col-right">
        ${paddedDroite.map(l => l ? `<div>${l}</div>` : '<div>&nbsp;</div>').join('\n        ')}
      </div>
    </div>

    <div class="joy-text">${joie}</div>
    ${coupleNames(input.marie1Prenom, input.marie2Prenom)}
    <div class="honore-text">et seront honorés de votre présence à la cérémonie religieuse qui sera célébrée le</div>

    ${dateBox(evt.date, tp)}
    <div class="event-time-large">${formatHeure(evt.heure)}</div>
    ${separator(tp)}

    <div class="event-lieu-text">
      ${evt.lieu ? `<div class="lieu-bold">${formatLieu(evt.lieu)}</div>` : ''}
      ${evt.adresse ? `<div class="event-adresse">${esc(evt.adresse)}</div>` : ''}
    </div>
    ${mapButtons(evt.adresse, tp)}

    <div class="reception-text">La cérémonie sera suivie d'une réception.</div>

    ${penseeHtml}
    ${infoBlock('Hébergement', evt.hebergement)}
    ${noteBlock(evt.note)}
  </section>`
}

function renderHenne(evt: EvenementInput, input: GenerateInput, tp: TemplatePalette): string {
  const imageUrl = input.images[evt.id] || ''
  return `
  <section class="event-section" style="position:relative;">
    ${bsdCorner(input.mariageJuif, tp)}
    ${imageUrl ? `<img class="event-image" src="${esc(imageUrl)}" alt="Henné">` : ''}
    <div class="card-title-calligraphie">Le Henné</div>
    <div class="ornements">&#10043; &#10047; &#10048;</div>
    <div class="henne-invite">Vous êtes chaleureusement invités à célébrer la soirée du henné de</div>
    ${coupleNames(input.marie1Prenom, input.marie2Prenom)}
    ${dateBox(evt.date, tp)}
    <div class="event-time-large">${formatHeure(evt.heure)}</div>
    ${separator(tp)}
    <div class="event-lieu-text">
      ${evt.lieu ? `<div class="lieu-bold">${formatLieu(evt.lieu)}</div>` : ''}
      ${evt.adresse ? `<div class="event-adresse">${esc(evt.adresse)}</div>` : ''}
    </div>
    ${mapButtons(evt.adresse, tp)}
    ${infoBlock('Transport', evt.transport)}
    ${noteBlock(evt.note)}
  </section>`
}

function renderShabbat(evt: EvenementInput, input: GenerateInput, tp: TemplatePalette): string {
  const imageUrl = input.images[evt.id] || ''
  const famille1Nom = input.famille1.pere.nom || input.famille1.mere.nom
  const famille2Nom = input.famille2.pere.nom || input.famille2.mere.nom
  return `
  <section class="event-section" style="position:relative;">
    ${bsdCorner(input.mariageJuif, tp)}
    ${imageUrl ? `<img class="event-image" src="${esc(imageUrl)}" alt="Shabbat Hatan">` : ''}
    <div class="card-title-calligraphie">Shabbat Hatan</div>
    <div class="shabbat-invite">Les familles ${esc(famille1Nom)} &amp; ${esc(famille2Nom)} vous convient au Shabbat Hatan de</div>
    ${coupleNames(input.marie1Prenom, input.marie2Prenom)}
    ${dateBox(evt.date, tp)}
    <div class="event-time-large">${formatHeure(evt.heure)}</div>
    ${separator(tp)}
    <div class="event-lieu-text">
      ${evt.lieu ? `<div class="lieu-bold">${formatLieu(evt.lieu)}</div>` : ''}
      ${evt.adresse ? `<div class="event-adresse">${esc(evt.adresse)}</div>` : ''}
    </div>
    ${mapButtons(evt.adresse, tp)}
    ${noteBlock(evt.note)}
  </section>`
}

function renderAutre(evt: EvenementInput, input: GenerateInput, tp: TemplatePalette): string {
  const imageUrl = input.images[evt.id] || ''
  const title = evt.type === 'Autre' && evt.customName ? evt.customName : evt.type
  return `
  <section class="event-section" style="position:relative;">
    ${bsdCorner(input.mariageJuif, tp)}
    ${imageUrl ? `<img class="event-image" src="${esc(imageUrl)}" alt="${esc(title)}">` : ''}
    <div class="card-title-calligraphie">${esc(title)}</div>
    <div class="autre-invite">Rejoignez ${esc(input.marie1Prenom)} &amp; ${esc(input.marie2Prenom)} pour ${esc(title.toLowerCase())}</div>
    ${dateBox(evt.date, tp)}
    <div class="event-time-large">${formatHeure(evt.heure)}</div>
    ${separator(tp)}
    <div class="event-lieu-text">
      ${evt.lieu ? `<div class="lieu-bold">${formatLieu(evt.lieu)}</div>` : ''}
      ${evt.adresse ? `<div class="event-adresse">${esc(evt.adresse)}</div>` : ''}
    </div>
    ${mapButtons(evt.adresse, tp)}
    ${noteBlock(evt.note)}
  </section>`
}

function renderCeremonySection(evt: EvenementInput, input: GenerateInput, tp: TemplatePalette): string {
  const t = evt.type.toLowerCase()
  if (t.includes('houppa') || t.includes('religieuse')) return renderHouppa(evt, input, tp)
  if (t.includes('mairie')) return renderMairie(evt, input, tp)
  if (t.includes('henn')) return renderHenne(evt, input, tp)
  if (t.includes('shabbat')) return renderShabbat(evt, input, tp)
  return renderAutre(evt, input, tp)
}

/* ── RSVP ─────────────────────────────────────────────────── */

function renderRsvp(evenements: EvenementInput[], tp: TemplatePalette): string {
  const rows = evenements.map((evt, i) => {
    const name = getCeremonyDisplayName(evt.type, evt.customName)
    return `
    <div class="rsvp-ceremony-row" data-idx="${i}">
      <span class="rsvp-ceremony-name">${esc(name)}</span>
      <div class="rsvp-presence-btns">
        <button type="button" class="rsvp-btn" data-idx="${i}" data-val="present" onclick="togglePresence(${i},true)">Présent</button>
        <button type="button" class="rsvp-btn" data-idx="${i}" data-val="absent" onclick="togglePresence(${i},false)">Absent</button>
      </div>
    </div>`
  }).join('')

  return `
  <section class="rsvp-section" id="rsvp">
    <div class="rsvp-header">CARTON-RÉPONSE</div>
    <div class="rsvp-sep">
      <div class="rsvp-sep-line"></div>
      <span class="rsvp-sep-dot">&#10022;</span>
      <div class="rsvp-sep-line"></div>
    </div>
    <div class="rsvp-titre-oui">À votre tour de nous dire Oui !</div>
    <p class="rsvp-description">Votre présence à nos côtés serait un immense bonheur.</p>

    <div id="rsvp-form-container">
      <form class="rsvp-form" id="rsvp-form" onsubmit="return false;">
        <div class="rsvp-field">
          <label class="rsvp-label">Votre nom</label>
          <input class="rsvp-input" type="text" id="rsvp-nom" placeholder="Prénom et nom" required>
        </div>

        <div class="rsvp-field">
          <div class="rsvp-ceremonies" id="rsvp-ceremonies">${rows}</div>
        </div>

        <div class="rsvp-field">
          <label class="rsvp-label">Nombre de personnes</label>
          <input class="rsvp-input" type="number" id="rsvp-nb" min="1" max="20" value="1">
        </div>

        <div class="rsvp-field">
          <label class="rsvp-label">Un mot pour les mariés <span style="opacity:0.5">(optionnel)</span></label>
          <textarea class="rsvp-input rsvp-textarea" id="rsvp-message" placeholder="Avec toute notre affection…"></textarea>
        </div>

        <button type="button" class="rsvp-submit" id="rsvp-submit" onclick="submitRsvp()">Envoyer ma réponse</button>
        <div class="rsvp-error" id="rsvp-error"></div>
      </form>
    </div>

    <div class="rsvp-success" id="rsvp-success">
      <h3 id="rsvp-success-title">Merci !</h3>
      <p>Votre réponse a bien été transmise aux mariés.</p>
    </div>
  </section>`
}

/* ── CSS ──────────────────────────────────────────────────── */

function buildCss(tp: TemplatePalette): string {
  return `
    *, *::before, *::after { margin:0; padding:0; box-sizing:border-box; }

    body {
      font-family: '${tp.texteFont}', serif;
      background: ${tp.fondColor};
      color: ${tp.texteColor};
      min-height: 100vh;
      -webkit-font-smoothing: antialiased;
    }

    .container { width:100%; max-width:600px; margin:0 auto; overflow:hidden; }

    /* ── Navbar ── */
    .navbar {
      position:sticky; top:0; z-index:100;
      display:flex; align-items:center; justify-content:space-between;
      padding:12px 16px;
      background:${tp.fondColor}f7;
      backdrop-filter:blur(12px); -webkit-backdrop-filter:blur(12px);
      border-bottom:0.5px solid ${tp.accentColor}22;
    }
    .nav-logo { height:36px; width:auto; }
    .nav-initials {
      font-family:'${tp.titreFont}',cursive; font-size:28px; color:${tp.accentColor};
    }
    .countdown {
      display:flex; align-items:center; gap:2px; flex:1; justify-content:center;
    }
    .countdown-unit {
      display:flex; flex-direction:column; align-items:center; text-align:center; min-width:32px;
    }
    .countdown-val {
      font-family:'${tp.texteFont}',serif; font-style:italic;
      font-size:24px; color:${tp.texteColor}; line-height:1; font-weight:300;
    }
    .countdown-label {
      font-family:'${tp.smallFont}',sans-serif; font-size:5px; letter-spacing:1.5px;
      color:${tp.accentColor}; text-transform:uppercase; margin-top:2px;
    }
    .countdown-sep {
      color:${tp.accentColor}; font-size:6px; margin-bottom:10px; opacity:0.6; flex-shrink:0;
    }

    /* ── Séparateur ── */
    .separator {
      display:flex; align-items:center; gap:12px;
      justify-content:center; max-width:200px; margin:0 auto; padding:32px 0;
    }
    .sep-line { flex:1; height:0.5px; }
    .sep-dot { font-size:8px; opacity:0.5; }

    /* ── Accueil ── */
    .accueil {
      text-align:center; padding:20px;
      min-height:100vh; display:flex; flex-direction:column;
      align-items:center; justify-content:center; position:relative;
    }
    .accueil-content {
      display:flex; flex-direction:column; align-items:center; justify-content:center; flex:1;
    }
    .bsd {
      position:absolute; top:12px; right:16px;
      font-family:serif; font-size:13px; color:${tp.accentColor};
      direction:rtl; opacity:0.85;
    }
    .scroll-hint {
      display:flex; flex-direction:column; align-items:center; gap:6px; padding-bottom:24px;
    }
    .scroll-label {
      font-family:'${tp.labelFont}',serif;
      font-size:10px; letter-spacing:4px; text-transform:uppercase;
      color:${tp.texteColor}; opacity:0.5;
    }
    .scroll-arrow {
      font-size:18px; color:${tp.texteColor}; opacity:0.4;
      animation:bounceDown 2s ease infinite;
    }
    @keyframes bounceDown {
      0%,100% { transform:translateY(0); }
      50% { transform:translateY(6px); }
    }
    .accueil-logo { width:120px; height:120px; object-fit:contain; margin-bottom:20px; }
    .accueil-label {
      font-family:'${tp.labelFont}',serif;
      font-size:11px; letter-spacing:5px; text-transform:uppercase;
      color:${tp.accentColor}; opacity:0.7; margin-bottom:8px;
    }
    .couple-names-display {
      display:flex; align-items:baseline; justify-content:center;
      gap:clamp(6px,2vw,12px); flex-wrap:wrap;
    }
    .couple-name-big {
      font-family:'${tp.titreFont}',cursive;
      font-size:clamp(28px,8vw,56px); color:${tp.accentColor}; line-height:1.1;
    }
    .couple-amp-big {
      font-family:'${tp.titreFont}',cursive;
      font-size:clamp(16px,4vw,24px); color:${tp.accentColor}; opacity:0.5;
    }
    .accueil-date {
      font-family:'${tp.labelFont}',serif;
      font-size:13px; letter-spacing:3px; text-transform:uppercase;
      color:${tp.texteColor}; margin-top:16px; opacity:0.8;
    }

    /* ── Sections événements ── */
    .event-section {
      text-align:center; padding:40px 20px;
      min-height:100vh; display:flex; flex-direction:column;
      align-items:center; justify-content:center;
    }
    .card-title-calligraphie {
      font-family:'${tp.titreFont}',cursive;
      font-size:clamp(36px,9vw,52px); color:${tp.accentColor};
      text-align:center; margin-bottom:20px; line-height:1.2;
    }
    .event-image {
      width:100%; max-width:100%; height:auto;
      margin:0 auto 24px; display:block;
    }

    /* ── Familles grille ── */
    .famille-grid {
      display:grid; grid-template-columns:1fr auto 1fr;
      gap:0 12px; margin-bottom:20px; align-items:center;
      max-width:95%; margin-left:auto; margin-right:auto;
    }
    .famille-col {
      font-family:'${tp.texteFont}',serif; font-style:italic;
      font-size:clamp(11px,2.8vw,14px); color:${tp.accentColor}; line-height:2;
    }
    .famille-col div { white-space:nowrap; overflow:hidden; text-overflow:ellipsis; }
    .famille-col-right { text-align:right; }
    .famille-sep {
      width:1px; background:${tp.accentColor}; opacity:0.3;
      align-self:stretch; min-height:40px;
    }

    /* ── Textes partagés ── */
    .joy-text {
      font-family:'${tp.texteFont}',serif; font-style:italic;
      font-size:22px; text-align:center; color:${tp.texteColor};
      margin:24px 0; line-height:1.5;
    }
    .couple-names-inline {
      text-align:center; margin:24px 0;
      display:flex; align-items:baseline; justify-content:center;
      gap:clamp(6px,2vw,12px); flex-wrap:wrap;
    }
    .couple-name {
      font-family:'${tp.titreFont}',cursive;
      font-size:clamp(28px,8vw,56px); color:${tp.accentColor}; line-height:1.1;
    }
    .couple-amp {
      font-family:'${tp.titreFont}',cursive;
      font-size:clamp(16px,4vw,24px); color:${tp.accentColor}; opacity:0.5;
    }
    .honore-text {
      font-family:'${tp.texteFont}',serif; font-style:italic;
      font-size:18px; text-align:center; color:${tp.texteColor};
      margin-bottom:16px; line-height:1.6;
    }

    /* ── Date encadrée ── */
    .date-box { text-align:center; margin-bottom:8px; }
    .date-row { display:flex; align-items:center; justify-content:center; gap:0; }
    .date-day-name {
      font-family:'${tp.labelFont}',serif;
      font-size:clamp(11px,2.5vw,14px); letter-spacing:4px; text-transform:uppercase;
      color:${tp.accentColor}; flex:1; text-align:right; padding-right:16px;
    }
    .date-num-frame { border:1.5px solid ${tp.accentColor}55; padding:12px 20px; }
    .date-day-num {
      font-family:'${tp.labelFont}',serif;
      font-size:clamp(28px,7vw,42px); color:${tp.texteColor}; line-height:1;
    }
    .date-month-name {
      font-family:'${tp.labelFont}',serif;
      font-size:clamp(11px,2.5vw,14px); letter-spacing:4px; text-transform:uppercase;
      color:${tp.accentColor}; flex:1; text-align:left; padding-left:16px;
    }
    .date-line { flex:1; height:1px; background:${tp.accentColor}; opacity:0.3; }
    .date-year {
      font-family:'${tp.labelFont}',serif;
      font-size:12px; letter-spacing:6px; color:${tp.accentColor};
      opacity:0.6; margin-top:8px; padding-left:6px;
    }
    .event-time-large {
      font-family:'${tp.texteFont}',serif; font-style:italic;
      font-size:clamp(20px,5vw,28px); color:${tp.accentColor};
      text-align:center; margin-bottom:8px;
    }

    /* ── Lieu & adresse ── */
    .event-lieu-text { text-align:center; max-width:90%; margin:0 auto 8px; line-height:1.6; }
    .lieu-bold {
      font-family:'${tp.labelFont}',serif; font-weight:700;
      font-size:clamp(16px,4vw,22px); color:${tp.texteColor}; margin-bottom:4px;
    }
    .event-adresse {
      font-family:'${tp.texteFont}',serif;
      font-size:clamp(13px,3vw,16px); color:${tp.texteSecondaire}; margin-top:4px;
    }
    .reception-text {
      font-family:'${tp.texteFont}',serif; font-style:italic;
      font-size:16px; color:${tp.texteColor}; margin-top:16px; line-height:1.6;
    }
    .suivi-text-italic {
      font-family:'${tp.texteFont}',serif; font-style:italic;
      font-size:16px; color:${tp.texteColor}; margin-top:16px; line-height:1.6;
    }

    /* ── Boutons Maps / Waze ── */
    .event-buttons { display:flex; gap:12px; justify-content:center; margin:20px 0 16px; }
    .btn-map {
      padding:12px 28px; border-radius:4px;
      border:1.5px solid ${tp.accentColor}55; background:transparent;
      color:${tp.accentColor};
      font-family:'${tp.labelFont}',serif;
      font-size:11px; font-weight:600; letter-spacing:3px; text-transform:uppercase;
      text-decoration:none; transition:opacity 0.2s;
    }
    .btn-map:hover { opacity:0.7; }

    /* ── Note ── */
    .event-note-block {
      margin-top:20px; padding-top:14px;
      border-top:1px solid ${tp.accentColor}; opacity:0.8;
    }
    .event-note {
      font-family:'${tp.texteFont}',serif; font-style:italic;
      font-size:13px; text-align:center; color:${tp.texteColor};
    }

    /* ── Info transport / hébergement ── */
    .info-text-block {
      font-family:'${tp.texteFont}',serif; font-style:italic;
      font-size:15px; color:${tp.texteColor}; text-align:center;
      margin-top:12px; line-height:1.6;
    }
    .info-label {
      display:block; font-style:normal;
      font-family:'${tp.labelFont}',serif; font-size:11px;
      letter-spacing:3px; text-transform:uppercase;
      color:${tp.accentColor}; margin-bottom:4px; opacity:0.7;
    }
    .info-detail { display:block; }

    /* ── Houppa spécifique ── */
    .hebrew-verse {
      font-family:serif; font-size:clamp(12px,3.5vw,16px);
      color:${tp.accentColor}; direction:rtl; text-align:center;
      line-height:1.9; margin-bottom:16px; padding:4px 14px;
    }
    .thin-line {
      height:1px; background:${tp.accentColor}; opacity:0.3;
      margin:0 auto 20px; max-width:80%;
    }
    .pensee-text {
      font-family:'${tp.texteFont}',serif; font-style:italic;
      font-size:16px; color:${tp.texteColor}; text-align:center;
      line-height:1.7; margin:24px auto; max-width:90%; padding:0 12px;
    }

    /* ── Mairie spécifique ── */
    .mairie-sediront {
      font-family:'${tp.texteFont}',serif; font-style:italic;
      font-size:clamp(16px,4vw,22px); text-align:center;
      color:${tp.texteColor}; margin-bottom:20px;
    }

    /* ── Henné spécifique ── */
    .ornements {
      font-size:16px; color:${tp.accentColor}; text-align:center;
      margin-bottom:16px; letter-spacing:8px;
    }
    .henne-invite {
      font-family:'${tp.texteFont}',serif; font-style:italic;
      font-size:18px; text-align:center; color:${tp.texteColor};
      line-height:1.7; margin-bottom:24px;
    }

    /* ── Shabbat spécifique ── */
    .shabbat-invite {
      font-family:'${tp.texteFont}',serif; font-style:italic;
      font-size:18px; text-align:center; color:${tp.texteColor};
      line-height:1.7; margin-bottom:24px;
    }

    /* ── Autre spécifique ── */
    .autre-invite {
      font-family:'${tp.texteFont}',serif; font-style:italic;
      font-size:20px; text-align:center; color:${tp.texteColor};
      line-height:1.7; margin-bottom:28px;
    }

    /* ── RSVP ── */
    .rsvp-section {
      padding:40px 20px; text-align:center;
      min-height:100vh; display:flex; flex-direction:column;
      align-items:center; justify-content:center;
    }
    .rsvp-header {
      font-family:'${tp.labelFont}',serif; font-weight:bold;
      font-size:clamp(12px,2.5vw,16px); color:${tp.accentColor};
      letter-spacing:0.35em; text-transform:uppercase; margin-bottom:24px;
    }
    .rsvp-sep { display:flex; align-items:center; justify-content:center; gap:10px; margin-bottom:16px; }
    .rsvp-sep-line { width:40px; height:0.5px; background:${tp.accentColor}; opacity:0.3; }
    .rsvp-sep-dot { color:${tp.accentColor}; font-size:10px; opacity:0.4; }
    .rsvp-titre-oui {
      font-family:'${tp.titreFont}',cursive;
      font-size:clamp(26px,7vw,36px); color:${tp.accentColor};
      margin-bottom:16px; line-height:1.3;
    }
    .rsvp-description {
      font-family:'${tp.texteFont}',serif; font-style:italic;
      font-size:15px; color:${tp.texteColor}; line-height:1.7;
      opacity:0.8; margin:0 0 28px;
    }
    .rsvp-form { text-align:left; max-width:380px; margin:0 auto; }
    .rsvp-field { margin-bottom:18px; }
    .rsvp-label {
      display:block; font-family:'${tp.labelFont}',serif;
      font-size:11px; font-weight:700; letter-spacing:2px;
      text-transform:uppercase; color:${tp.accentColor}; margin-bottom:6px;
    }
    .rsvp-input {
      width:100%; padding:12px 16px; border-radius:8px;
      border:1.5px solid ${tp.accentColor}33; background:white;
      font-family:'${tp.texteFont}',serif; font-size:15px;
      color:${tp.texteColor}; outline:none; box-sizing:border-box;
    }
    .rsvp-input:focus { border-color:${tp.accentColor}; }
    .rsvp-textarea { resize:vertical; min-height:70px; font-style:italic; font-size:14px; }
    .rsvp-ceremonies { display:flex; flex-direction:column; gap:0; }
    .rsvp-ceremony-row {
      display:flex; align-items:center; justify-content:space-between;
      padding:16px 0; border-bottom:1px solid ${tp.accentColor}15;
    }
    .rsvp-ceremony-row:last-child { border-bottom:none; }
    .rsvp-ceremony-name {
      font-family:'${tp.labelFont}',serif;
      font-size:16px; font-weight:600; color:${tp.texteColor};
    }
    .rsvp-presence-btns { display:flex; gap:0; }
    .rsvp-btn {
      padding:14px 0; width:90px; border:1.5px solid ${tp.accentColor}33;
      border-radius:4px; font-family:'${tp.texteFont}',serif;
      font-size:13px; font-weight:500; letter-spacing:0.1em;
      text-transform:uppercase; cursor:pointer; background:white;
      color:${tp.accentColor}; transition:all 0.3s ease;
    }
    .rsvp-btn:first-child { border-right:none; border-radius:4px 0 0 4px; }
    .rsvp-btn:last-child { border-radius:0 4px 4px 0; }
    .rsvp-btn.active-present { background:${tp.accentColor}; color:white; border-color:${tp.accentColor}; }
    .rsvp-btn.active-absent { background:#d45050; color:white; border-color:#d45050; }
    .rsvp-submit {
      width:100%; padding:16px; margin-top:8px;
      background:#1B2A5E; color:white;
      border:none; border-radius:4px;
      font-family:'${tp.texteFont}',serif;
      font-size:14px; font-weight:500; letter-spacing:0.25em;
      text-transform:uppercase; cursor:pointer; transition:opacity 0.2s;
    }
    .rsvp-submit:hover { opacity:0.85; }
    .rsvp-submit:disabled { opacity:0.5; cursor:not-allowed; }
    .rsvp-success { display:none; text-align:center; padding:32px 0; }
    .rsvp-success h3 {
      font-family:'${tp.titreFont}',cursive;
      font-size:28px; color:${tp.accentColor}; margin-bottom:8px;
    }
    .rsvp-success p { font-size:14px; color:${tp.texteSecondaire}; }
    .rsvp-error { display:none; color:#c44; font-size:13px; margin-top:8px; text-align:center; }

    /* ── Music ── */
    .music-section { text-align:center; padding:16px 20px; }
    .music-section iframe { width:100%; max-width:360px; border-radius:12px; border:none; }

    /* ── Footer ── */
    .footer { text-align:center; padding:48px 28px 64px; background:#0A1628; }
    .footer-diamond { color:${tp.accentColor}; font-size:12px; margin-bottom:18px; opacity:0.45; }
    .footer-names {
      font-family:'${tp.labelFont}',serif; font-style:italic;
      font-size:18px; color:${tp.accentColor}; margin-bottom:6px; opacity:0.8;
      letter-spacing:0.2em;
    }
    .footer-credit {
      font-family:'${tp.texteFont}',serif;
      font-size:11px; letter-spacing:0.2em; font-variant:small-caps;
      color:${tp.accentColor}; opacity:0.5;
    }
    .footer-credit a { color:${tp.accentColor}; text-decoration:none; }
    .footer-credit a:hover { opacity:0.85; }

    /* ── Animations ── */
    @keyframes fadeUp {
      from { opacity:0; transform:translateY(20px); }
      to { opacity:1; transform:translateY(0); }
    }
    .animate { animation:fadeUp 0.7s ease both; }
  `
}

/* ── JavaScript inline ────────────────────────────────────── */

function buildJs(input: GenerateInput): string {
  const firstDate = input.evenements[0]?.date || ''
  return `
    // === Countdown ===
    (function(){
      var targetDate='${firstDate}';
      if(!targetDate)return;
      var target=new Date(targetDate+'T00:00:00').getTime();
      function pad(n){return String(n).padStart(2,'0');}
      function update(){
        var diff=target-Date.now();
        if(diff<=0){document.getElementById('countdown').innerHTML='Jour J !';return;}
        var d=Math.floor(diff/86400000);
        var h=Math.floor((diff%86400000)/3600000);
        var m=Math.floor((diff%3600000)/60000);
        var s=Math.floor((diff%60000)/1000);
        var items=[{v:d,l:'Jours'},{v:h,l:'Heures'},{v:m,l:'Min'},{v:s,l:'Sec'}];
        var html='';
        for(var i=0;i<items.length;i++){
          html+='<div class="countdown-unit"><span class="countdown-val">'+pad(items[i].v)+'</span><span class="countdown-label">'+items[i].l+'</span></div>';
          if(i<3)html+='<span class="countdown-sep">&#9670;</span>';
        }
        document.getElementById('countdown').innerHTML=html;
      }
      update();setInterval(update,1000);
    })();

    // === RSVP ===
    var presenceState={};
    function togglePresence(idx,isPresent){
      presenceState[idx]=isPresent;
      var btns=document.querySelectorAll('.rsvp-btn[data-idx="'+idx+'"]');
      btns.forEach(function(btn){
        btn.classList.remove('active-present','active-absent');
        if(btn.dataset.val==='present'&&isPresent)btn.classList.add('active-present');
        if(btn.dataset.val==='absent'&&!isPresent)btn.classList.add('active-absent');
      });
    }

    function submitRsvp(){
      var nom=document.getElementById('rsvp-nom').value.trim();
      if(!nom){showError('Veuillez entrer votre nom.');return;}
      var ceremonies=[];
      var rows=document.querySelectorAll('.rsvp-ceremony-row');
      for(var i=0;i<rows.length;i++){
        var name=rows[i].querySelector('.rsvp-ceremony-name').textContent;
        if(presenceState[i]!==undefined){
          ceremonies.push(name+': '+(presenceState[i]?'Présent':'Absent'));
        }
      }
      if(ceremonies.length===0){showError('Veuillez indiquer votre présence pour au moins un événement.');return;}
      var nbPersonnes=document.getElementById('rsvp-nb').value||'1';
      var message=document.getElementById('rsvp-message').value.trim();
      var btn=document.getElementById('rsvp-submit');
      btn.disabled=true;btn.textContent='Envoi en cours...';hideError();

      var scriptUrl='${esc(input.googleScriptUrl || '')}';
      if(scriptUrl){
        fetch(scriptUrl,{
          method:'POST',
          headers:{'Content-Type':'application/json'},
          body:JSON.stringify({nom:nom,ceremonies:ceremonies.join(', '),present:Object.values(presenceState).some(function(v){return v;})?'Présent':'Absent',nbPersonnes:nbPersonnes,message:message}),
          mode:'no-cors'
        }).then(done).catch(done);
      } else {
        var email='${esc(input.emailContact || '')}';
        if(email){
          var subject=encodeURIComponent('RSVP - '+nom);
          var body=encodeURIComponent('Nom : '+nom+'\\nPrésence : '+ceremonies.join(', ')+'\\nNombre de personnes : '+nbPersonnes+(message?'\\nMessage : '+message:''));
          window.location.href='mailto:'+email+'?subject='+subject+'&body='+body;
          showFallbackSuccess();
        } else {
          showError('Le formulaire RSVP n\\'est pas encore configuré. Contactez les mariés directement.');
        }
      }

      function done(){
        var prenom=nom.split(' ')[0];
        document.getElementById('rsvp-success-title').textContent='Merci '+prenom+' !';
        document.getElementById('rsvp-form-container').style.display='none';
        document.getElementById('rsvp-success').style.display='block';
      }
      function showFallbackSuccess(){
        document.getElementById('rsvp-form-container').style.display='none';
        var s=document.getElementById('rsvp-success');
        s.querySelector('h3').textContent='Presque terminé !';
        s.querySelector('p').textContent='Votre application email va s\\'ouvrir — envoyez le message pour confirmer votre présence.';
        s.style.display='block';
      }
    }

    function showError(msg){var el=document.getElementById('rsvp-error');el.textContent=msg;el.style.display='block';}
    function hideError(){document.getElementById('rsvp-error').style.display='none';}
  `
}

/* ── Génération principale ────────────────────────────────── */

export function generateStaticHtml(input: GenerateInput): string {
  const rawPalette = getHarmonizedPalette(input.paletteId)
  const tp = toTemplatePalette(rawPalette)
  const fontsUrl = getGoogleFontsUrl()
  const footerMonths = getFooterMonths(input.evenements)

  const eventsSections = input.evenements
    .map(evt => renderCeremonySection(evt, input, tp))
    .join('')

  const ytId = input.musicUrl ? extractYoutubeId(input.musicUrl) : null

  return `<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${esc(input.marie1Prenom)} &amp; ${esc(input.marie2Prenom)} — Faire-part</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="${fontsUrl}" rel="stylesheet">
  <style>${buildCss(tp)}</style>
</head>
<body>
  <div class="container">

    <!-- Navbar -->
    <nav class="navbar">
      <div style="width:48px;height:48px;flex-shrink:0;display:flex;align-items:center">
        ${input.logoUrl
          ? `<img src="${esc(input.logoUrl)}" alt="logo" class="nav-logo">`
          : `<span class="nav-initials">${esc(input.marie1Prenom[0] || '')}${esc(input.marie2Prenom[0] || '')}</span>`
        }
      </div>
      <div class="countdown" id="countdown"></div>
    </nav>

    <!-- Accueil -->
    <section class="accueil animate"${input.accueilImageUrl ? ` style="background-image:url('${esc(input.accueilImageUrl)}');background-size:cover;background-position:center"` : ''}>
      ${input.mariageJuif ? '<div class="bsd">בס״ד</div>' : ''}
      <div class="accueil-content">
        ${input.logoUrl ? `<img src="${esc(input.logoUrl)}" alt="logo" class="accueil-logo">` : ''}
        <div class="accueil-label">MARIAGE</div>
        <div class="couple-names-display">
          <span class="couple-name-big">${esc(input.marie1Prenom)}</span>
          <span class="couple-amp-big">&amp;</span>
          <span class="couple-name-big">${esc(input.marie2Prenom)}</span>
        </div>
        ${separator(tp)}
        <p class="accueil-date">${footerMonths.toUpperCase()}</p>
      </div>
      <div class="scroll-hint">
        <span class="scroll-label">FAITES DÉFILER</span>
        <span class="scroll-arrow">&#8595;</span>
      </div>
    </section>

    <!-- Événements -->
    ${eventsSections}

    <!-- Musique -->
    ${ytId ? `<section class="music-section">
      <iframe src="https://www.youtube.com/embed/${ytId}?autoplay=1&loop=1&playlist=${ytId}" height="80" allow="autoplay; encrypted-media" allowfullscreen></iframe>
    </section>` : ''}

    <!-- RSVP -->
    ${renderRsvp(input.evenements, tp)}

    <!-- Footer -->
    <footer class="footer">
      <div class="footer-diamond">&#9670;</div>
      <p class="footer-names">${esc(input.marie1Prenom)} &amp; ${esc(input.marie2Prenom)} &middot; ${footerMonths}</p>
      <p class="footer-credit">créé avec <span style="font-size:10px;vertical-align:middle;margin:0 4px">&#9829;</span> par <a href="https://getlovit.fr" target="_blank" rel="noopener">Lov'it</a></p>
    </footer>

  </div>
  <script>${buildJs(input)}</script>
</body>
</html>`
}
