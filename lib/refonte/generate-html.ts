/**
 * Générateur de HTML statique autonome pour le wizard de création.
 *
 * Reproduit exactement la structure et les textes de app/faire-part/page.tsx
 * avec un rendu spécifique par type de cérémonie (Houppa, Mairie, Henné, Autre).
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
  penseesDefuntsActif?: boolean
  penseesDefuntsIntro?: string
  penseesDefuntsNoms?: string[]
  penseesDefuntsFin?: string
}

/* ── Utilitaires ──────────────────────────────────────────── */

function esc(str: string): string {
  return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#039;')
}

const JOURS = ['Dimanche', 'Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi']
const MOIS = ['Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin', 'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre']

function formatDateFr(dateStr: string): string {
  if (!dateStr) return ''
  try {
    const d = new Date(dateStr + 'T00:00:00')
    return `${JOURS[d.getDay()]} ${d.getDate()} ${MOIS[d.getMonth()]} ${d.getFullYear()}`
  } catch { return dateStr }
}

function formatDateFrCap(dateStr: string): string {
  if (!dateStr) return ''
  try {
    const d = new Date(dateStr + 'T00:00:00')
    return `Le ${JOURS[d.getDay()]} ${d.getDate()} ${MOIS[d.getMonth()].toLowerCase()} ${d.getFullYear()}`
  } catch { return dateStr }
}

function formatDateBox(dateStr: string): string {
  if (!dateStr) return ''
  try {
    const d = new Date(dateStr + 'T00:00:00')
    const year = String(d.getFullYear()).split('').join(' ')
    return `
      <div class="date-box">
        <div class="date-row">
          <span class="date-line"></span>
          <span class="date-day-name">${JOURS[d.getDay()].toUpperCase()}</span>
          <div class="date-num-frame"><span class="date-day-num">${d.getDate()}</span></div>
          <span class="date-month-name">${MOIS[d.getMonth()].toUpperCase()}</span>
          <span class="date-line"></span>
        </div>
        <div class="date-year">${year}</div>
      </div>`
  } catch { return '' }
}

function formatHeure(heure: string): string {
  if (!heure) return ''
  return `à ${heure.replace(':', 'h')}`
}

function extractYoutubeId(url: string): string | null {
  const m = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([\w-]{11})/)
  return m ? m[1] : null
}

function isDarkColor(hex: string): boolean {
  const r = parseInt(hex.slice(1, 3), 16)
  const g = parseInt(hex.slice(3, 5), 16)
  const b = parseInt(hex.slice(5, 7), 16)
  return (r * 299 + g * 587 + b * 114) / 1000 < 128
}

/* ── Fonctions portées depuis page.tsx ────────────────────── */

function joinName(prenom: string, nom: string): string {
  return [prenom, nom].filter(Boolean).join(' ')
}

// Format GP couple — only living (non-disparu)
function fmtGpCoupleLiving(gp: GrandParentInput): string {
  const hasPere = (gp.grandPerePrenom || gp.grandPereNom) && !gp.grandPereDisparu
  const hasMere = (gp.grandMerePrenom || gp.grandMereNom) && !gp.grandMereDisparu
  if (hasPere && hasMere) return `M. &amp; Mme ${esc(joinName(gp.grandPerePrenom, gp.grandPereNom || gp.grandMereNom))}`
  if (hasPere) return `M. ${esc(joinName(gp.grandPerePrenom, gp.grandPereNom))}`
  if (hasMere) return `Mme ${esc(joinName(gp.grandMerePrenom, gp.grandMereNom))}`
  return ''
}

// Format parent line — only living (non-disparu)
function fmtParentsLineLiving(pere: { prenom: string; nom: string; disparu: boolean }, mere: { prenom: string; nom: string; disparu: boolean }): string {
  const pFull = !pere.disparu ? joinName(pere.prenom, pere.nom) : ''
  const mFull = !mere.disparu ? joinName(mere.prenom, mere.nom) : ''
  if (pFull && mFull) return `M. &amp; Mme ${esc(pFull)}`
  if (pFull) return `M. ${esc(pFull)}`
  if (mFull) return `Mme ${esc(mFull)}`
  return ''
}

// Collect all deceased names from families
function collectDisparus(f1: FamilleInput, f2: FamilleInput): string[] {
  const noms: string[] = []
  // Parents
  if (f1.pere.disparu && (f1.pere.prenom || f1.pere.nom)) noms.push(joinName(f1.pere.prenom, f1.pere.nom))
  if (f1.mere.disparu && (f1.mere.prenom || f1.mere.nom)) noms.push(joinName(f1.mere.prenom, f1.mere.nom))
  if (f2.pere.disparu && (f2.pere.prenom || f2.pere.nom)) noms.push(joinName(f2.pere.prenom, f2.pere.nom))
  if (f2.mere.disparu && (f2.mere.prenom || f2.mere.nom)) noms.push(joinName(f2.mere.prenom, f2.mere.nom))
  // Grands-parents
  const gps = [f1.grandParentsPaternels, f1.grandParentsMaternels, f2.grandParentsPaternels, f2.grandParentsMaternels]
  for (const gp of gps) {
    if (gp.grandPereDisparu && (gp.grandPerePrenom || gp.grandPereNom)) noms.push(joinName(gp.grandPerePrenom, gp.grandPereNom))
    if (gp.grandMereDisparu && (gp.grandMerePrenom || gp.grandMereNom)) noms.push(joinName(gp.grandMerePrenom, gp.grandMereNom))
  }
  return noms
}

function formatLieu(lieu: string): string {
  if (!lieu) return ''
  const l = lieu.toLowerCase()
  if (l.includes('salon') || l.includes('salle')) return `Dans les salons ${esc(lieu)}`
  if (l.includes('château') || l.includes('chateau')) return `Au château ${esc(lieu)}`
  if (l.includes('domaine')) return `Au domaine ${esc(lieu)}`
  return `À ${esc(lieu)}`
}

function conjonctionLieu(lieu: string): string {
  if (!lieu) return ''
  const t = lieu.trim()
  const low = t.toLowerCase()
  if (low.startsWith('le ')) return `au ${esc(t.slice(3))}`
  if (low.startsWith('la ')) return `à la ${esc(t.slice(3))}`
  if ('AEIOUÀÂÉÈÊËÎÏÔÙÛÜŒaeiouàâéèêëîïôùûüœ'.includes(t.charAt(0))) return `à l&#039;${esc(t)}`
  return `à ${esc(t)}`
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
  if (evenements.length === 0) return ''
  const dates = evenements.map(e => e.date).filter(Boolean).sort()
  if (dates.length === 0) return ''
  const first = new Date(dates[0] + 'T00:00:00')
  const last = new Date(dates[dates.length - 1] + 'T00:00:00')
  if (first.getMonth() === last.getMonth() && first.getFullYear() === last.getFullYear()) {
    return `${MOIS[first.getMonth()]} ${first.getFullYear()}`
  }
  if (first.getFullYear() === last.getFullYear()) {
    return `${MOIS[first.getMonth()]} – ${MOIS[last.getMonth()]} ${first.getFullYear()}`
  }
  return `${MOIS[first.getMonth()]} ${first.getFullYear()} – ${MOIS[last.getMonth()]} ${last.getFullYear()}`
}

/* ── Sous-sections réutilisables ──────────────────────────── */

function renderLogo(logoUrl: string, p: HarmonizedPalette, m1Initial: string, m2Initial: string): string {
  if (logoUrl) return `<div class="logo-section"><img src="${esc(logoUrl)}" alt="logo" class="logo-img"></div>`
  return `<div class="logo-section"><span class="logo-text">${esc(m1Initial)}&amp;${esc(m2Initial)}</span></div>`
}

function renderMapButtons(adresse: string): string {
  if (!adresse) return ''
  return `<div class="event-buttons">
    <a class="btn-map" href="https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(adresse)}" target="_blank" rel="noopener">GOOGLE MAPS</a>
    <a class="btn-map" href="https://waze.com/ul?q=${encodeURIComponent(adresse)}" target="_blank" rel="noopener">WAZE</a>
  </div>`
}

function renderNote(note: string, p: HarmonizedPalette): string {
  if (!note) return ''
  return `<div class="event-note-block"><div class="event-note">${esc(note)}</div></div>`
}

function renderInfoBlocks(evt: EvenementInput): string {
  let html = ''
  if (evt.transport) {
    html += `<div class="info-text-block"><span class="info-label">Transport</span><span class="info-detail">${esc(evt.transport)}</span></div>`
  }
  if (evt.hebergement) {
    html += `<div class="info-text-block"><span class="info-label">Hébergement</span><span class="info-detail">${esc(evt.hebergement)}</span></div>`
  }
  return html
}

function renderSeparator(): string {
  return `<div class="separator"><span class="sep-line"></span><span class="sep-dot">◆</span><span class="sep-line"></span></div>`
}

/* ── Rendus par type de cérémonie ─────────────────────────── */

function renderHouppa(evt: EvenementInput, input: GenerateInput, imageUrl: string, p: HarmonizedPalette): string {
  const f1 = input.famille1, f2 = input.famille2

  // Grands-parents VIVANTS uniquement pour la grille
  const gpPa1 = fmtGpCoupleLiving(f1.grandParentsPaternels)
  const gpMa1 = fmtGpCoupleLiving(f1.grandParentsMaternels)
  const gpPa2 = fmtGpCoupleLiving(f2.grandParentsPaternels)
  const gpMa2 = fmtGpCoupleLiving(f2.grandParentsMaternels)
  const hasGp = gpPa1 || gpMa1 || gpPa2 || gpMa2

  // Parents VIVANTS uniquement pour la grille
  const parents1 = fmtParentsLineLiving(f1.pere, f1.mere)
  const parents2 = fmtParentsLineLiving(f2.pere, f2.mere)

  const joie = hasGp
    ? 'ont la joie de vous faire part du mariage de leurs petits-enfants et enfants'
    : 'ont la joie de vous faire part du mariage de leurs enfants'

  // Pensée défunts — auto-générée à partir des parents/GP marqués disparu
  const disparus = collectDisparus(f1, f2)
  let penseeHtml = ''
  if (disparus.length > 0) {
    const nomsStr = disparus.map(n => esc(n)).join(', ')
    penseeHtml = `<div class="pensee-text">En ce jour si solennel, nous aurons une pensée pour ${nomsStr} dont la mémoire veille sur nous.</div>`
  }

  return `
    <section class="event-section">
      ${input.mariageJuif ? '<div class="bsd-corner">בס״ד</div>' : ''}
      <div class="card-title-calligraphie">La Houppa</div>
      ${renderLogo(input.logoUrl, p, input.marie1Prenom[0] || '', input.marie2Prenom[0] || '')}
      ${imageUrl ? `<img class="event-image" src="${esc(imageUrl)}" alt="Houppa">` : ''}

      <div class="hebrew-verse">קוֹל שָׂשׂוֹן וְקוֹל שִׂמְחָה קוֹל חָתָן וְקוֹל כַּלָּה</div>
      <div class="thin-line"></div>

      <div class="famille-grid">
        <div class="famille-col">
          ${hasGp ? `${gpPa1 ? `<div>${gpPa1}</div>` : '<div>&nbsp;</div>'}` : ''}
          ${hasGp ? `${gpMa1 ? `<div>${gpMa1}</div>` : '<div>&nbsp;</div>'}` : ''}
          ${parents1 ? `<div>${parents1}</div>` : ''}
        </div>
        <div class="famille-sep"></div>
        <div class="famille-col famille-col-right">
          ${hasGp ? `${gpPa2 ? `<div>${gpPa2}</div>` : '<div>&nbsp;</div>'}` : ''}
          ${hasGp ? `${gpMa2 ? `<div>${gpMa2}</div>` : '<div>&nbsp;</div>'}` : ''}
          ${parents2 ? `<div>${parents2}</div>` : ''}
        </div>
      </div>

      <div class="joy-text">${joie}</div>

      <div class="couple-names-inline">
        <span class="couple-name">${esc(input.marie1Prenom)}</span>
        <span class="couple-amp">&amp;</span>
        <span class="couple-name">${esc(input.marie2Prenom)}</span>
      </div>

      <div class="honore-text">et seront honorés de votre présence à la cérémonie religieuse qui sera célébrée le</div>

      ${formatDateBox(evt.date)}
      <div class="event-time-large">${formatHeure(evt.heure)}</div>

      ${renderSeparator()}
      <div class="event-lieu-text">
        ${evt.lieu ? `<div class="lieu-bold">${formatLieu(evt.lieu)}</div>` : ''}
        ${evt.adresse ? `<div class="event-adresse">${esc(evt.adresse)}</div>` : ''}
      </div>

      ${renderMapButtons(evt.adresse)}

      <div class="reception-text">La cérémonie sera suivie d'une réception.</div>

      ${penseeHtml}
      ${renderNote(evt.note, p)}
      ${renderInfoBlocks(evt)}
    </section>`
}

function renderMairie(evt: EvenementInput, input: GenerateInput, imageUrl: string, p: HarmonizedPalette): string {
  return `
    <section class="event-section">
      ${input.mariageJuif ? '<div class="bsd-corner">בס״ד</div>' : ''}
      <div class="card-title-calligraphie">La Mairie</div>
      ${renderLogo(input.logoUrl, p, input.marie1Prenom[0] || '', input.marie2Prenom[0] || '')}
      ${imageUrl ? `<img class="event-image" src="${esc(imageUrl)}" alt="Mairie">` : ''}

      <div class="couple-names-inline">
        <span class="couple-name">${esc(input.marie1Prenom)}</span>
        <span class="couple-amp">&amp;</span>
        <span class="couple-name">${esc(input.marie2Prenom)}</span>
      </div>

      <div class="mairie-sediront">se diront « OUI »</div>

      ${formatDateBox(evt.date)}
      <div class="event-time-large">${formatHeure(evt.heure)}</div>

      ${renderSeparator()}
      <div class="event-lieu-text">
        ${evt.lieu ? `<div class="lieu-bold">${esc(evt.lieu)}</div>` : ''}
        ${evt.adresse ? `<div class="event-adresse">${esc(evt.adresse)}</div>` : ''}
      </div>

      ${renderMapButtons(evt.adresse)}

      ${evt.suiviDAutre && evt.evenementSuivantNom ? `
      <div class="suivi-text-italic">La Mairie sera suivie ${esc(evt.evenementSuivantNom)}.</div>` : ''}

      ${renderNote(evt.note, p)}
      ${renderInfoBlocks(evt)}
    </section>`
}

function renderHenne(evt: EvenementInput, input: GenerateInput, imageUrl: string, p: HarmonizedPalette): string {
  return `
    <section class="event-section">
      ${input.mariageJuif ? '<div class="bsd-corner">בס״ד</div>' : ''}
      <div class="card-title-calligraphie">Le Henné</div>
      ${renderLogo(input.logoUrl, p, input.marie1Prenom[0] || '', input.marie2Prenom[0] || '')}
      ${imageUrl ? `<img class="event-image" src="${esc(imageUrl)}" alt="Henné">` : ''}

      <div class="familles-label">Les Familles</div>
      <div class="familles-noms">${esc(input.famille1.pere.nom || input.famille1.mere.nom)} <span class="couple-amp">&amp;</span> ${esc(input.famille2.pere.nom || input.famille2.mere.nom)}</div>

      <div class="henne-invite">
        ont le plaisir de vous convier à une soirée<br>
        des Mille et Une Nuits pour célébrer le Henné de
      </div>

      <div class="couple-names-inline">
        <span class="couple-name">${esc(input.marie1Prenom)}</span>
        <span class="couple-amp">&amp;</span>
        <span class="couple-name">${esc(input.marie2Prenom)}</span>
      </div>

      ${formatDateBox(evt.date)}
      <div class="event-time-large">${formatHeure(evt.heure)}</div>

      ${renderSeparator()}
      <div class="event-lieu-text">
        ${evt.lieu ? `<div class="lieu-bold">${formatLieu(evt.lieu)}</div>` : ''}
        ${evt.adresse ? `<div class="event-adresse">${esc(evt.adresse)}</div>` : ''}
      </div>

      ${renderMapButtons(evt.adresse)}
      ${renderNote(evt.note, p)}
      ${renderInfoBlocks(evt)}
    </section>`
}

function renderAutre(evt: EvenementInput, input: GenerateInput, imageUrl: string, p: HarmonizedPalette): string {
  const title = evt.type === 'Autre' && evt.customName ? evt.customName : evt.type

  return `
    <section class="event-section">
      ${input.mariageJuif ? '<div class="bsd-corner">בס״ד</div>' : ''}
      ${renderSeparator()}
      <div class="card-title-calligraphie">${esc(title)}</div>
      ${renderLogo(input.logoUrl, p, input.marie1Prenom[0] || '', input.marie2Prenom[0] || '')}
      ${imageUrl ? `<img class="event-image" src="${esc(imageUrl)}" alt="${esc(title)}">` : ''}

      <div class="autre-invite">
        Rejoignez <span class="couple-name-inline">${esc(input.marie1Prenom)} &amp; ${esc(input.marie2Prenom)}</span> pour ${esc(title.toLowerCase())}
      </div>

      ${formatDateBox(evt.date)}
      <div class="event-time-large">${formatHeure(evt.heure)}</div>

      ${renderSeparator()}
      <div class="event-lieu-text">
        ${evt.lieu ? `<div class="lieu-bold">${formatLieu(evt.lieu)}</div>` : ''}
        ${evt.adresse ? `<div class="event-adresse">${esc(evt.adresse)}</div>` : ''}
      </div>

      ${renderMapButtons(evt.adresse)}
      ${renderNote(evt.note, p)}
      ${renderInfoBlocks(evt)}
    </section>`
}

function renderShabbat(evt: EvenementInput, input: GenerateInput, imageUrl: string, p: HarmonizedPalette): string {
  const famille1Nom = input.famille1.pere.nom || input.famille1.mere.nom
  const famille2Nom = input.famille2.pere.nom || input.famille2.mere.nom

  return `
    <section class="event-section">
      ${input.mariageJuif ? '<div class="bsd-corner">בס״ד</div>' : ''}
      <div class="card-title-calligraphie">Shabbat Hatan</div>
      ${renderLogo(input.logoUrl, p, input.marie1Prenom[0] || '', input.marie2Prenom[0] || '')}
      ${imageUrl ? `<img class="event-image" src="${esc(imageUrl)}" alt="Shabbat Hatan">` : ''}

      <div class="familles-label">Les Familles</div>
      <div class="familles-noms">${esc(famille1Nom)} <span class="couple-amp">&amp;</span> ${esc(famille2Nom)}</div>

      <div class="shabbat-invite">sont ravies de vous convier au Shabbat Hatan de</div>

      <div class="couple-names-inline">
        <span class="couple-name">${esc(input.marie1Prenom)}</span>
        <span class="couple-amp">&amp;</span>
        <span class="couple-name">${esc(input.marie2Prenom)}</span>
      </div>

      ${formatDateBox(evt.date)}
      <div class="event-time-large">${formatHeure(evt.heure)}</div>

      ${renderSeparator()}
      <div class="event-lieu-text">
        ${evt.lieu ? `<div class="lieu-bold">${formatLieu(evt.lieu)}</div>` : ''}
        ${evt.adresse ? `<div class="event-adresse">${esc(evt.adresse)}</div>` : ''}
      </div>

      ${renderMapButtons(evt.adresse)}
      ${renderNote(evt.note, p)}
      ${renderInfoBlocks(evt)}
    </section>`
}

function renderCeremonySection(evt: EvenementInput, input: GenerateInput, p: HarmonizedPalette): string {
  const imageUrl = input.images[evt.id] || ''
  const t = evt.type.toLowerCase()
  if (t.includes('houppa') || t.includes('religieuse')) return renderHouppa(evt, input, imageUrl, p)
  if (t.includes('mairie')) return renderMairie(evt, input, imageUrl, p)
  if (t.includes('henn')) return renderHenne(evt, input, imageUrl, p)
  if (t.includes('shabbat')) return renderShabbat(evt, input, imageUrl, p)
  return renderAutre(evt, input, imageUrl, p)
}

/* ── RSVP ─────────────────────────────────────────────────── */

function renderRsvpSection(evenements: EvenementInput[], p: HarmonizedPalette, dark: boolean): string {
  return `
    <section class="rsvp-section" id="rsvp">
      <div class="rsvp-header">CARTON-RÉPONSE</div>
      <div class="rsvp-sep">
        <div class="rsvp-sep-line"></div>
        <span class="rsvp-sep-dot">✦</span>
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
            <div class="rsvp-ceremonies" id="rsvp-ceremonies">
              ${evenements.map((evt, i) => {
                const name = getCeremonyDisplayName(evt.type, evt.customName)
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

/* ── Génération principale ────────────────────────────────── */

export function generateStaticHtml(input: GenerateInput): string {
  const p = getHarmonizedPalette(input.paletteId)
  const dark = isDarkColor(p.fondColor)
  const fontsUrl = getGoogleFontsUrl()
  const firstDate = input.evenements[0]?.date || ''
  const footerMonths = getFooterMonths(input.evenements)

  const eventsSections = input.evenements
    .map(evt => renderCeremonySection(evt, input, p))
    .join('')

  const rsvpSection = renderRsvpSection(input.evenements, p, dark)

  return `<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${esc(input.marie1Prenom)} & ${esc(input.marie2Prenom)} — Faire-part</title>
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
      width: 100%; max-width: 600px; margin: 0 auto; overflow: hidden;
    }

    /* ── Navbar ── */
    .navbar {
      position: sticky; top: 0; z-index: 100;
      display: flex; align-items: center; justify-content: space-between;
      padding: 12px 16px;
      background: ${p.fondColor}f7;
      backdrop-filter: blur(12px); -webkit-backdrop-filter: blur(12px);
      border-bottom: 0.5px solid ${p.accentColor}22;
    }
    .logo-section { margin-bottom: 12px; text-align: center; }
    .logo-img { height: 36px; width: auto; }
    .logo-text {
      font-family: '${p.prenomsFont}', cursive;
      font-size: 20px; color: ${p.prenomsColor};
    }
    .navbar .logo-section { margin-bottom: 0; }
    .countdown {
      display: flex; align-items: center; gap: 2px; flex: 1; justify-content: center;
    }
    .countdown-unit { display: flex; flex-direction: column; align-items: center; text-align: center; min-width: 32px; }
    .countdown-val {
      font-family: 'Cormorant Garamond', serif; font-style: italic;
      font-size: 24px; color: #1B2A5E; line-height: 1; font-weight: 300;
    }
    .countdown-label {
      font-family: Montserrat, sans-serif; font-size: 5px; letter-spacing: 1.5px;
      color: ${p.accentColor}; text-transform: uppercase; margin-top: 2px;
    }
    .countdown-sep {
      color: ${p.accentColor}; font-size: 6px; margin-bottom: 10px; opacity: 0.6; flex-shrink: 0;
    }

    /* ── Séparateurs ── */
    .separator {
      display: flex; align-items: center; gap: 12px;
      justify-content: center; max-width: 200px; margin: 0 auto; padding: 32px 0;
    }
    .sep-line {
      flex: 1; height: 0.5px;
      background: linear-gradient(to right, transparent, ${p.accentColor}66);
    }
    .sep-line:last-child {
      background: linear-gradient(to left, transparent, ${p.accentColor}66);
    }
    .sep-dot { color: ${p.accentColor}; font-size: 8px; opacity: 0.5; }

    /* ── Accueil ── */
    .accueil {
      text-align: center; padding: 20px;
      min-height: 100vh; display: flex; flex-direction: column;
      align-items: center; justify-content: center;
      position: relative;
    }
    .accueil-content {
      display: flex; flex-direction: column; align-items: center;
      justify-content: center; flex: 1;
    }
    .bsd {
      font-family: serif; font-size: 16px; color: ${p.texteColor};
      direction: rtl; margin-bottom: 16px; opacity: 0.8;
    }
    .bsd-corner {
      font-family: serif; font-size: 13px; color: ${p.accentColor};
      direction: rtl; text-align: right; opacity: 0.85;
      padding: 0 20px; margin-bottom: 8px;
    }
    .scroll-hint {
      display: flex; flex-direction: column; align-items: center;
      gap: 6px; padding-bottom: 24px;
    }
    .scroll-label {
      font-family: '${p.titresFont}', serif;
      font-size: 10px; letter-spacing: 4px; text-transform: uppercase;
      color: ${p.texteColor}; opacity: 0.5;
    }
    .scroll-arrow {
      font-size: 18px; color: ${p.texteColor}; opacity: 0.4;
      animation: bounceDown 2s ease infinite;
    }
    @keyframes bounceDown {
      0%, 100% { transform: translateY(0); }
      50% { transform: translateY(6px); }
    }
    .couple-names-display {
      display: flex; align-items: baseline; justify-content: center;
      gap: clamp(6px, 2vw, 12px); flex-wrap: wrap;
    }
    .couple-name-big {
      font-family: '${p.prenomsFont}', cursive;
      font-size: clamp(28px, 8vw, 56px); color: ${p.accentColor}; line-height: 1.1;
    }
    .couple-amp-big {
      font-family: '${p.prenomsFont}', cursive;
      font-size: clamp(16px, 4vw, 24px); color: ${p.accentColor}; opacity: 0.5;
    }
    .accueil-logo {
      width: 80px; height: 80px; object-fit: contain; margin-bottom: 16px;
    }
    .accueil-label {
      font-family: '${p.titresFont}', serif;
      font-size: 11px; letter-spacing: 5px; text-transform: uppercase;
      color: ${p.accentColor}; opacity: 0.7; margin-bottom: 8px;
    }
    .accueil-date {
      font-family: '${p.titresFont}', serif;
      font-size: 13px; letter-spacing: 3px; text-transform: uppercase;
      color: ${p.titresColor}; margin-top: 16px; opacity: 0.8;
    }

    /* ── Cartes cérémonies ── */
    .event-section {
      text-align: center; padding: 40px 20px;
      min-height: 100vh; display: flex; flex-direction: column;
      align-items: center; justify-content: center;
    }
    .card-title-calligraphie {
      font-family: '${p.prenomsFont}', cursive;
      font-size: clamp(36px, 9vw, 52px); color: ${p.accentColor};
      text-align: center; margin-bottom: 20px; line-height: 1.2;
    }
    .event-image {
      width: 100%; max-width: 100%; height: auto;
      margin: 0 auto 24px; display: block;
    }

    /* ── Familles (grille 3 colonnes alignées) ── */
    .famille-grid {
      display: grid; grid-template-columns: 1fr auto 1fr;
      gap: 0 12px; margin-bottom: 20px; align-items: center;
      max-width: 95%; margin-left: auto; margin-right: auto;
    }
    .famille-col {
      font-family: 'Cormorant Garamond', serif; font-style: italic;
      font-size: clamp(11px, 2.8vw, 14px); color: ${p.accentColor};
      line-height: 2;
    }
    .famille-col div {
      white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
    }
    .famille-col-right { text-align: right; }
    .famille-sep {
      width: 1px; background: ${p.accentColor}; opacity: 0.3;
      align-self: stretch; min-height: 40px;
    }

    /* ── Textes partagés ── */
    .joy-text {
      font-family: 'Cormorant Garamond', serif; font-style: italic;
      font-size: 22px; text-align: center; color: ${p.texteColor};
      margin: 24px 0; line-height: 1.5;
    }
    .couple-names-inline {
      text-align: center; margin: 24px 0;
      display: flex; align-items: baseline; justify-content: center;
      gap: clamp(6px, 2vw, 12px); flex-wrap: wrap;
    }
    .couple-name {
      font-family: '${p.prenomsFont}', cursive;
      font-size: clamp(28px, 8vw, 56px); color: ${p.accentColor}; line-height: 1.1;
    }
    .couple-amp {
      font-family: '${p.prenomsFont}', cursive;
      font-size: clamp(16px, 4vw, 24px); color: ${p.accentColor}; opacity: 0.5;
    }
    .couple-name-inline {
      font-family: '${p.prenomsFont}', cursive;
      font-size: clamp(28px, 7vw, 52px); color: ${p.accentColor};
    }
    .honore-text {
      font-family: 'Cormorant Garamond', serif; font-style: italic;
      font-size: 18px; text-align: center; color: ${p.texteColor};
      margin-bottom: 16px; line-height: 1.6;
    }

    /* ── Date encadrée ── */
    .date-box { text-align: center; margin-bottom: 8px; }
    .date-row {
      display: flex; align-items: center; justify-content: center; gap: 0;
    }
    .date-day-name {
      font-family: '${p.titresFont}', serif;
      font-size: clamp(11px, 2.5vw, 14px); letter-spacing: 4px; text-transform: uppercase;
      color: ${p.accentColor}; flex: 1; text-align: right; padding-right: 16px;
    }
    .date-num-frame {
      border: 1.5px solid ${p.accentColor}55; padding: 12px 20px;
    }
    .date-day-num {
      font-family: '${p.titresFont}', serif;
      font-size: clamp(28px, 7vw, 42px); color: ${p.texteColor}; line-height: 1;
    }
    .date-month-name {
      font-family: '${p.titresFont}', serif;
      font-size: clamp(11px, 2.5vw, 14px); letter-spacing: 4px; text-transform: uppercase;
      color: ${p.accentColor}; flex: 1; text-align: left; padding-left: 16px;
    }
    .date-line {
      flex: 1; height: 1px; background: ${p.accentColor}; opacity: 0.3;
    }
    .date-year {
      font-family: '${p.titresFont}', serif;
      font-size: 12px; letter-spacing: 6px; color: ${p.accentColor};
      opacity: 0.6; margin-top: 8px;
    }
    .event-time-large {
      font-family: 'Cormorant Garamond', serif; font-style: italic;
      font-size: clamp(20px, 5vw, 28px); color: ${p.accentColor};
      text-align: center; margin-bottom: 16px;
    }

    /* ── Lieu & adresse ── */
    .event-lieu-text {
      text-align: center; max-width: 90%; margin: 0 auto 16px;
      line-height: 1.6;
    }
    .lieu-bold {
      font-family: '${p.titresFont}', serif; font-weight: 700;
      font-size: clamp(16px, 4vw, 22px); color: ${p.texteColor};
      margin-bottom: 4px;
    }
    .event-adresse {
      font-family: 'Cormorant Garamond', serif;
      font-size: clamp(13px, 3vw, 16px); color: ${p.texteSecondaireColor};
      margin-top: 4px;
    }
    .reception-text {
      font-family: 'Cormorant Garamond', serif; font-style: italic;
      font-size: 16px; color: ${p.texteColor}; margin-top: 16px; line-height: 1.6;
    }
    .suivi-text-italic {
      font-family: 'Cormorant Garamond', serif; font-style: italic;
      font-size: 16px; color: ${p.texteColor}; margin-top: 16px; line-height: 1.6;
    }

    /* ── Boutons Maps/Waze ── */
    .event-buttons { display: flex; gap: 12px; justify-content: center; margin: 20px 0 16px; }
    .btn-map {
      padding: 12px 28px; border-radius: 4px;
      border: 1.5px solid ${p.accentColor}55; background: transparent;
      color: ${p.accentColor};
      font-family: '${p.titresFont}', serif;
      font-size: 11px; font-weight: 600; letter-spacing: 3px; text-transform: uppercase;
      text-decoration: none; transition: opacity 0.2s;
    }
    .btn-map:hover { opacity: 0.7; }

    /* ── Note ── */
    .event-note-block {
      margin-top: 20px; padding-top: 14px;
      border-top: 1px solid ${p.accentColor}; opacity: 0.8;
    }
    .event-note {
      font-family: 'Cormorant Garamond', serif; font-style: italic;
      font-size: 13px; text-align: center; color: ${p.texteColor};
    }

    /* ── Info transport/hébergement ── */
    .info-text-block {
      font-family: 'Cormorant Garamond', serif; font-style: italic;
      font-size: 15px; color: ${p.texteColor}; text-align: center;
      margin-top: 12px; line-height: 1.6;
    }
    .info-label {
      display: block; font-style: normal;
      font-family: '${p.titresFont}', serif; font-size: 11px;
      letter-spacing: 3px; text-transform: uppercase;
      color: ${p.accentColor}; margin-bottom: 4px; opacity: 0.7;
    }
    .info-detail { display: block; }

    /* ── Houppa spécifique ── */
    .hebrew-verse {
      font-family: serif; font-size: clamp(12px, 3.5vw, 16px);
      color: ${p.accentColor}; direction: rtl; text-align: center;
      line-height: 1.9; margin-bottom: 16px; padding: 4px 14px;
    }
    .thin-line {
      height: 1px; background: ${p.accentColor}; opacity: 0.3;
      margin: 0 auto 20px; max-width: 80%;
    }

    /* ── Mairie spécifique ── */
    .mairie-sediront {
      font-family: 'Cormorant Garamond', serif; font-style: italic;
      font-size: clamp(16px, 4vw, 22px); text-align: center;
      color: ${p.texteColor}; margin-bottom: 20px;
    }

    /* ── Henné spécifique ── */
    .familles-label {
      font-family: 'Cormorant Garamond', serif; font-style: italic;
      font-size: 16px; color: ${p.texteColor}; text-align: center; margin-bottom: 8px;
    }
    .familles-noms {
      font-family: '${p.prenomsFont}', cursive;
      font-size: clamp(28px, 7vw, 40px); color: ${p.accentColor};
      text-align: center; margin-bottom: 16px;
    }
    .henne-invite {
      font-family: 'Cormorant Garamond', serif; font-style: italic;
      font-size: 18px; text-align: center; color: ${p.texteColor};
      line-height: 1.7; margin-bottom: 24px;
    }
    .shabbat-invite {
      font-family: 'Cormorant Garamond', serif; font-style: italic;
      font-size: 18px; text-align: center; color: ${p.texteColor};
      line-height: 1.7; margin-bottom: 24px;
    }
    .autre-invite {
      font-family: 'Cormorant Garamond', serif; font-style: italic;
      font-size: 20px; text-align: center; color: ${p.texteColor};
      line-height: 1.7; margin-bottom: 28px;
    }

    /* ── Pensée défunts ── */
    .pensee-text {
      font-family: 'Cormorant Garamond', serif; font-style: italic;
      font-size: 16px; color: ${p.texteColor}; text-align: center;
      line-height: 1.7; margin: 24px auto; max-width: 90%; padding: 0 12px;
    }

    /* ── RSVP ── */
    .rsvp-section {
      padding: 40px 20px; text-align: center;
      min-height: 100vh; display: flex; flex-direction: column;
      align-items: center; justify-content: center;
    }
    .rsvp-header {
      font-family: '${p.titresFont}', serif; font-weight: bold;
      font-size: clamp(12px, 2.5vw, 16px); color: ${p.accentColor};
      letter-spacing: 0.35em; text-transform: uppercase; margin-bottom: 24px;
    }
    .rsvp-sep {
      display: flex; align-items: center; justify-content: center;
      gap: 10px; margin-bottom: 16px;
    }
    .rsvp-sep-line { width: 40px; height: 0.5px; background: ${p.accentColor}; opacity: 0.3; }
    .rsvp-sep-dot { color: ${p.accentColor}; font-size: 10px; opacity: 0.4; }
    .rsvp-titre-oui {
      font-family: '${p.prenomsFont}', cursive;
      font-size: clamp(26px, 7vw, 36px); color: ${p.accentColor};
      margin-bottom: 16px; line-height: 1.3;
    }
    .rsvp-description {
      font-family: 'Cormorant Garamond', serif; font-style: italic;
      font-size: 15px; color: ${p.texteColor}; line-height: 1.7;
      opacity: 0.8; margin: 0 0 28px;
    }
    .rsvp-form { text-align: left; max-width: 380px; margin: 0 auto; }
    .rsvp-field { margin-bottom: 18px; }
    .rsvp-label {
      display: block; font-family: '${p.titresFont}', serif;
      font-size: 11px; font-weight: 700; letter-spacing: 2px;
      text-transform: uppercase; color: ${p.accentColor}; margin-bottom: 6px;
    }
    .rsvp-input {
      width: 100%; padding: 12px 16px; border-radius: 8px;
      border: 1.5px solid ${p.accentColor}33; background: white;
      font-family: 'Cormorant Garamond', serif; font-size: 15px;
      color: ${p.texteColor}; outline: none; box-sizing: border-box;
    }
    .rsvp-input:focus { border-color: ${p.accentColor}; }
    .rsvp-textarea {
      resize: vertical; min-height: 70px;
      font-style: italic; font-size: 14px;
    }
    .rsvp-ceremonies { display: flex; flex-direction: column; gap: 0; }
    .rsvp-ceremony-row {
      display: flex; align-items: center; justify-content: space-between;
      padding: 16px 0; border-bottom: 1px solid ${p.accentColor}15;
    }
    .rsvp-ceremony-row:last-child { border-bottom: none; }
    .rsvp-ceremony-name {
      font-family: '${p.titresFont}', serif;
      font-size: 16px; font-weight: 600; color: ${p.texteColor};
    }
    .rsvp-presence-btns { display: flex; gap: 0; }
    .rsvp-btn {
      padding: 14px 0; width: 90px; border: 1.5px solid ${p.accentColor}33;
      border-radius: 4px; font-family: 'Cormorant Garamond', serif;
      font-size: 13px; font-weight: 500; letter-spacing: 0.1em;
      text-transform: uppercase; cursor: pointer; background: white;
      color: ${p.accentColor}; transition: all 0.3s ease;
    }
    .rsvp-btn:first-child { border-right: none; border-radius: 4px 0 0 4px; }
    .rsvp-btn:last-child { border-radius: 0 4px 4px 0; }
    .rsvp-btn.active-present {
      background: ${p.accentColor}; color: white; border-color: ${p.accentColor};
    }
    .rsvp-btn.active-absent {
      background: #d45050; color: white; border-color: #d45050;
    }
    .rsvp-submit {
      width: 100%; padding: 16px; margin-top: 8px;
      background: #1B2A5E; color: white;
      border: none; border-radius: 4px;
      font-family: 'Cormorant Garamond', serif;
      font-size: 14px; font-weight: 500; letter-spacing: 0.25em;
      text-transform: uppercase; cursor: pointer;
      transition: opacity 0.2s;
    }
    .rsvp-submit:hover { opacity: 0.85; }
    .rsvp-submit:disabled { opacity: 0.5; cursor: not-allowed; }
    .rsvp-success { display: none; text-align: center; padding: 32px 0; }
    .rsvp-success h3 {
      font-family: '${p.prenomsFont}', cursive;
      font-size: 28px; color: ${p.prenomsColor}; margin-bottom: 8px;
    }
    .rsvp-success p { font-size: 14px; color: ${p.texteSecondaireColor}; }
    .rsvp-error { display: none; color: #c44; font-size: 13px; margin-top: 8px; text-align: center; }

    /* ── Music ── */
    .music-section { text-align: center; padding: 16px 20px; }
    .music-section iframe { width: 100%; max-width: 360px; border-radius: 12px; }

    /* ── Footer ── */
    .footer {
      text-align: center; padding: 48px 28px 64px;
      background: #0A1628;
    }
    .footer-diamond { color: ${p.accentColor}; font-size: 12px; margin-bottom: 18px; opacity: 0.45; }
    .footer-names {
      font-family: '${p.titresFont}', serif; font-style: italic;
      font-size: 18px; color: ${p.accentColor}; margin-bottom: 6px; opacity: 0.8;
      letter-spacing: 0.2em;
    }
    .footer-credit {
      font-family: 'Cormorant Garamond', serif;
      font-size: 11px; letter-spacing: 0.2em; font-variant: small-caps;
      color: ${p.accentColor}; opacity: 0.5;
    }
    .footer-credit a { color: ${p.accentColor}; text-decoration: none; }
    .footer-credit a:hover { opacity: 0.85; }

    /* ── Animations ── */
    @keyframes fadeUp {
      from { opacity: 0; transform: translateY(20px); }
      to { opacity: 1; transform: translateY(0); }
    }
    .animate { animation: fadeUp 0.7s ease both; }
    .delay-1 { animation-delay: 0.15s; }
    .delay-2 { animation-delay: 0.3s; }
  </style>
</head>
<body>
  <div class="container">

    <!-- Navbar -->
    <nav class="navbar">
      <div style="width:36px;height:36px;flex-shrink:0">
        ${input.logoUrl
          ? `<img src="${esc(input.logoUrl)}" alt="logo" style="height:36px;width:auto">`
          : `<span class="logo-text">${esc(input.marie1Prenom[0] || '')}&amp;${esc(input.marie2Prenom[0] || '')}</span>`
        }
      </div>
      <div class="countdown" id="countdown"></div>
    </nav>

    <!-- Accueil -->
    <section class="accueil animate" ${input.accueilImageUrl ? `style="background-image:url('${esc(input.accueilImageUrl)}');background-size:cover;background-position:center"` : ''}>
      <div class="accueil-content">
        ${input.mariageJuif ? '<div class="bsd">בס״ד</div>' : ''}
        ${input.logoUrl ? `<img src="${esc(input.logoUrl)}" alt="logo" class="accueil-logo">` : ''}
        <div class="accueil-label">MARIAGE</div>
        <div class="couple-names-display">
          <span class="couple-name-big">${esc(input.marie1Prenom)}</span>
          <span class="couple-amp-big">&amp;</span>
          <span class="couple-name-big">${esc(input.marie2Prenom)}</span>
        </div>
        ${renderSeparator()}
        <p class="accueil-date">${footerMonths.toUpperCase()}</p>
      </div>
      <div class="scroll-hint">
        <span class="scroll-label">FAITES DÉFILER</span>
        <span class="scroll-arrow">↓</span>
      </div>
    </section>

    <!-- Cérémonies -->
    ${eventsSections}

    <!-- Music -->
    ${input.musicUrl && extractYoutubeId(input.musicUrl) ? `
    <div class="music-section">
      <iframe src="https://www.youtube.com/embed/${extractYoutubeId(input.musicUrl)}?autoplay=1&loop=1" height="80" frameborder="0" allow="autoplay; encrypted-media" allowfullscreen></iframe>
    </div>` : ''}

    <!-- RSVP -->
    ${rsvpSection}

    <!-- Footer -->
    <footer class="footer">
      <div class="footer-diamond">◆</div>
      <p class="footer-names">${esc(input.marie1Prenom)} &amp; ${esc(input.marie2Prenom)} · ${footerMonths}</p>
      <p class="footer-credit">créé avec <span style="font-size:10px;vertical-align:middle;margin:0 4px">♥</span> par <a href="https://getlovit.fr" target="_blank" rel="noopener">Lov'it</a></p>
    </footer>

  </div>

  <script>
    // === Countdown ===
    (function() {
      var targetDate = '${firstDate}';
      if (!targetDate) return;
      var target = new Date(targetDate + 'T00:00:00').getTime();
      function pad(n) { return String(n).padStart(2, '0'); }
      function update() {
        var now = Date.now();
        var diff = target - now;
        if (diff <= 0) {
          document.getElementById('countdown').innerHTML = '✨ Jour J !';
          return;
        }
        var d = Math.floor(diff / 86400000);
        var h = Math.floor((diff % 86400000) / 3600000);
        var m = Math.floor((diff % 3600000) / 60000);
        var s = Math.floor((diff % 60000) / 1000);
        var items = [
          { v: d, l: 'Jours' },
          { v: h, l: 'Heures' },
          { v: m, l: 'Min' },
          { v: s, l: 'Sec' }
        ];
        var html = '';
        for (var i = 0; i < items.length; i++) {
          html += '<div class="countdown-unit"><span class="countdown-val">' + pad(items[i].v) + '</span><span class="countdown-label">' + items[i].l + '</span></div>';
          if (i < 3) html += '<span class="countdown-sep">◆</span>';
        }
        document.getElementById('countdown').innerHTML = html;
      }
      update();
      setInterval(update, 1000);
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
        var prenom = nom.split(' ')[0];
        document.getElementById('rsvp-success-title').textContent = 'Merci ' + prenom + ' !';
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
