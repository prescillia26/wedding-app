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
    return `
      <div class="date-box">
        <span class="date-day-name">${JOURS[d.getDay()]}</span>
        <span class="date-day-num">${d.getDate()}</span>
        <span class="date-month">${MOIS[d.getMonth()]}</span>
        <span class="date-year">${d.getFullYear()}</span>
      </div>`
  } catch { return `<div class="event-date-upper">${dateStr}</div>` }
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

function fmtGpCouple(pPrenom: string, pNom: string, mPrenom: string, mNom: string): string {
  const hasPere = pPrenom || pNom
  const hasMere = mPrenom || mNom
  if (hasPere && hasMere) return `M. &amp; Mme ${esc(joinName(pPrenom, pNom || mNom))}`
  if (hasPere) return `M. ${esc(joinName(pPrenom, pNom))}`
  if (hasMere) return `Mme ${esc(joinName(mPrenom, mNom))}`
  return ''
}

function fmtParentsLine(pere: { prenom: string; nom: string }, mere: { prenom: string; nom: string }): string {
  const pFull = joinName(pere.prenom, pere.nom)
  const mFull = joinName(mere.prenom, mere.nom)
  if (pFull && mFull) return `M. &amp; Mme ${esc(pFull)}`
  if (pFull) return `M. ${esc(pFull)}`
  if (mFull) return `Mme ${esc(mFull)}`
  return ''
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

function renderItineraireBtn(adresse: string, p: HarmonizedPalette): string {
  if (!adresse) return ''
  return `<div class="event-buttons">
    <a class="btn-itineraire" href="https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(adresse)}" target="_blank" rel="noopener">Itinéraire</a>
  </div>`
}

function renderNote(note: string, p: HarmonizedPalette): string {
  if (!note) return ''
  return `<div class="event-note-block"><div class="event-note">${esc(note)}</div></div>`
}

function renderInfoBlocks(evt: EvenementInput): string {
  let html = ''
  if (evt.transport) {
    html += `<div class="event-info-block"><span class="info-icon">&#9654;</span><div><strong>Transport</strong><p>${esc(evt.transport)}</p></div></div>`
  }
  if (evt.hebergement) {
    html += `<div class="event-info-block"><span class="info-icon">&#9654;</span><div><strong>Hébergement</strong><p>${esc(evt.hebergement)}</p></div></div>`
  }
  return html
}

function renderSeparator(): string {
  return `<div class="separator"><span class="sep-line"></span><span class="sep-dot">◆</span><span class="sep-line"></span></div>`
}

/* ── Rendus par type de cérémonie ─────────────────────────── */

function renderHouppa(evt: EvenementInput, input: GenerateInput, imageUrl: string, p: HarmonizedPalette): string {
  const f1 = input.famille1, f2 = input.famille2

  // Grands-parents
  const gpPa1 = fmtGpCouple(f1.grandParentsPaternels.grandPerePrenom, f1.grandParentsPaternels.grandPereNom, f1.grandParentsPaternels.grandMerePrenom, f1.grandParentsPaternels.grandMereNom)
  const gpMa1 = fmtGpCouple(f1.grandParentsMaternels.grandPerePrenom, f1.grandParentsMaternels.grandPereNom, f1.grandParentsMaternels.grandMerePrenom, f1.grandParentsMaternels.grandMereNom)
  const gpPa2 = fmtGpCouple(f2.grandParentsPaternels.grandPerePrenom, f2.grandParentsPaternels.grandPereNom, f2.grandParentsPaternels.grandMerePrenom, f2.grandParentsPaternels.grandMereNom)
  const gpMa2 = fmtGpCouple(f2.grandParentsMaternels.grandPerePrenom, f2.grandParentsMaternels.grandPereNom, f2.grandParentsMaternels.grandMerePrenom, f2.grandParentsMaternels.grandMereNom)
  const hasGp = gpPa1 || gpMa1 || gpPa2 || gpMa2

  const parents1 = fmtParentsLine(f1.pere, f1.mere)
  const parents2 = fmtParentsLine(f2.pere, f2.mere)

  const joie = hasGp
    ? 'ont la joie de vous faire part du mariage de leurs petits-enfants et enfants'
    : 'ont la joie de vous faire part du mariage de leurs enfants'

  // Pensée défunts
  let penseeHtml = ''
  if (evt.penseesDefuntsActif && evt.penseesDefuntsNoms && evt.penseesDefuntsNoms.length > 0) {
    const intro = evt.penseesDefuntsIntro || 'Zihrona Levraha — Que leur mémoire soit une bénédiction'
    const fin = evt.penseesDefuntsFin || 'Présents dans nos cœurs en ce jour'
    const noms = evt.penseesDefuntsNoms.filter(n => n.trim()).map(n => `<div class="pensee-nom">${esc(n)} ז״ל</div>`).join('')
    penseeHtml = `
      <div class="pensee-section">
        <div class="pensee-header">
          <div class="pensee-line"></div>
          <img src="https://res.cloudinary.com/dau96mui2/image/upload/v1781685771/bnl1dqjjovgay8l4wmlu.png" alt="" class="pensee-candle">
          <div class="pensee-line"></div>
        </div>
        <div class="pensee-intro">${esc(intro)}</div>
        <div class="pensee-noms">${noms}</div>
        <div class="pensee-fin">${esc(fin)}</div>
      </div>`
  }

  return `
    <section class="event-section">
      ${renderSeparator()}
      <div class="card-title">LA HOUPPA</div>
      ${renderLogo(input.logoUrl, p, input.marie1Prenom[0] || '', input.marie2Prenom[0] || '')}
      ${imageUrl ? `<img class="event-image" src="${esc(imageUrl)}" alt="Houppa">` : ''}

      ${hasGp ? `
      <div class="famille-grid">
        <div class="famille-col">
          ${gpPa1 ? `<div>${gpPa1}</div>` : '<div>&nbsp;</div>'}
          ${gpMa1 ? `<div>${gpMa1}</div>` : '<div>&nbsp;</div>'}
        </div>
        <div class="famille-sep"></div>
        <div class="famille-col famille-col-right">
          ${gpPa2 ? `<div>${gpPa2}</div>` : '<div>&nbsp;</div>'}
          ${gpMa2 ? `<div>${gpMa2}</div>` : '<div>&nbsp;</div>'}
        </div>
      </div>` : ''}

      <div class="famille-grid">
        <div class="famille-col">
          ${parents1 ? `<div>${parents1}</div>` : ''}
        </div>
        <div class="famille-sep"></div>
        <div class="famille-col famille-col-right">
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

      <div class="event-date-upper">${formatDateFr(evt.date).toUpperCase()}</div>
      <div class="event-time-large">${formatHeure(evt.heure)}</div>

      <div class="event-lieu-text">
        ${evt.lieu ? `<div>${formatLieu(evt.lieu)}</div>` : ''}
        <div class="reception-text">ainsi qu'à la réception qui suivra</div>
        ${evt.adresse ? `<div class="event-adresse">${esc(evt.adresse)}</div>` : ''}
      </div>

      ${renderItineraireBtn(evt.adresse, p)}
      ${penseeHtml}
      ${renderNote(evt.note, p)}
      ${renderInfoBlocks(evt)}
    </section>`
}

function renderMairie(evt: EvenementInput, input: GenerateInput, imageUrl: string, p: HarmonizedPalette): string {
  return `
    <section class="event-section">
      ${renderSeparator()}
      <div class="card-title">LA MAIRIE</div>
      ${renderLogo(input.logoUrl, p, input.marie1Prenom[0] || '', input.marie2Prenom[0] || '')}
      ${imageUrl ? `<img class="event-image" src="${esc(imageUrl)}" alt="Mairie">` : ''}

      <div class="couple-names-inline">
        <span class="couple-name">${esc(input.marie1Prenom)}</span>
        <span class="couple-amp">&amp;</span>
        <span class="couple-name">${esc(input.marie2Prenom)}</span>
      </div>

      <div class="mairie-sediront">se diront</div>
      <div class="mairie-oui">« Oui »</div>

      <div class="event-date-bold">${formatDateFrCap(evt.date)}</div>

      <div class="event-lieu-text">
        ${evt.lieu ? `<div>${conjonctionLieu(evt.lieu)}</div>` : ''}
        ${evt.adresse ? `<div class="event-adresse">${esc(evt.adresse)}</div>` : ''}
      </div>

      <div class="event-time-large">${formatHeure(evt.heure)}</div>

      ${renderItineraireBtn(evt.adresse, p)}

      ${evt.suiviDAutre && evt.evenementSuivantNom ? `
      <div class="suivi-section">
        <div class="suivi-text">La mairie sera suivie de ${esc(evt.evenementSuivantNom)}</div>
        ${evt.evenementSuivantAdresse ? `<div class="suivi-adresse">${esc(evt.evenementSuivantAdresse)}</div>` : ''}
      </div>` : ''}

      ${renderNote(evt.note, p)}
      ${renderInfoBlocks(evt)}
    </section>`
}

function renderHenne(evt: EvenementInput, input: GenerateInput, imageUrl: string, p: HarmonizedPalette): string {
  return `
    <section class="event-section">
      ${renderSeparator()}
      <div class="card-title">LE HENNÉ</div>
      ${renderLogo(input.logoUrl, p, input.marie1Prenom[0] || '', input.marie2Prenom[0] || '')}
      ${imageUrl ? `<img class="event-image" src="${esc(imageUrl)}" alt="Henné">` : ''}

      <div class="henne-ornament">✦  ✦  ✦</div>

      <div class="henne-invite">
        Vous êtes chaleureusement invités à célébrer la soirée du henné de<br>
        <span class="couple-name-inline">${esc(input.marie1Prenom)} &amp; ${esc(input.marie2Prenom)}</span>
      </div>

      <div class="event-date-upper">${formatDateFr(evt.date).toUpperCase()}</div>
      <div class="event-time-large">${formatHeure(evt.heure)}</div>

      <div class="event-lieu-text">
        ${evt.lieu ? `<div>${formatLieu(evt.lieu)}</div>` : ''}
        ${evt.adresse ? `<div class="event-adresse">${esc(evt.adresse)}</div>` : ''}
      </div>

      ${renderItineraireBtn(evt.adresse, p)}
      ${renderNote(evt.note, p)}
      ${renderInfoBlocks(evt)}
    </section>`
}

function renderAutre(evt: EvenementInput, input: GenerateInput, imageUrl: string, p: HarmonizedPalette): string {
  const title = evt.type === 'Autre' && evt.customName ? evt.customName : evt.type

  return `
    <section class="event-section">
      ${renderSeparator()}
      <div class="card-title">${esc(title).toUpperCase()}</div>
      ${renderLogo(input.logoUrl, p, input.marie1Prenom[0] || '', input.marie2Prenom[0] || '')}
      ${imageUrl ? `<img class="event-image" src="${esc(imageUrl)}" alt="${esc(title)}">` : ''}

      <div class="autre-invite">
        Rejoignez <span class="couple-name-inline">${esc(input.marie1Prenom)} &amp; ${esc(input.marie2Prenom)}</span> pour ${esc(title.toLowerCase())}
      </div>

      <div class="event-date-upper">${formatDateFr(evt.date).toUpperCase()}</div>
      <div class="event-time-large">${formatHeure(evt.heure)}</div>

      <div class="event-lieu-text">
        ${evt.lieu ? `<div>${formatLieu(evt.lieu)}</div>` : ''}
        ${evt.adresse ? `<div class="event-adresse">${esc(evt.adresse)}</div>` : ''}
      </div>

      ${renderItineraireBtn(evt.adresse, p)}
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
    .accueil { text-align: center; padding: 52px 20px 40px; }
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
    .accueil-date {
      font-family: '${p.titresFont}', serif;
      font-size: 13px; letter-spacing: 3px; text-transform: uppercase;
      color: ${p.titresColor}; margin-top: 16px; opacity: 0.8;
    }

    /* ── Cartes cérémonies ── */
    .event-section { text-align: center; padding: 0 20px 40px; }
    .card-title {
      font-size: small; letter-spacing: 3px; text-transform: uppercase;
      color: ${p.accentColor}; text-align: center; margin-bottom: 16px;
    }
    .event-image {
      max-width: 180px; width: 80%; height: auto;
      margin: 0 auto 20px; display: block; opacity: 0.85;
    }

    /* ── Familles (grille 3 colonnes) ── */
    .famille-grid {
      display: grid; grid-template-columns: 1fr auto 1fr;
      gap: 8px; margin-bottom: 4px; align-items: start;
    }
    .famille-col {
      font-family: 'Cormorant Garamond', serif; font-style: italic;
      font-size: clamp(10px, 2.8vw, 13px); color: ${p.accentColor};
      line-height: 2; white-space: nowrap;
    }
    .famille-col-right { text-align: right; }
    .famille-sep {
      width: 1px; background: ${p.accentColor}; opacity: 0.3;
      align-self: stretch; min-height: 20px;
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

    /* ── Dates & heures ── */
    .event-date-upper {
      font-family: '${p.titresFont}', serif;
      font-size: clamp(14px, 3.5vw, 22px); color: ${p.accentColor};
      text-align: center; letter-spacing: 3px; text-transform: uppercase; margin-bottom: 8px;
    }
    .event-date-bold {
      font-family: '${p.titresFont}', serif; font-weight: bold;
      font-size: clamp(14px, 3.5vw, 20px); text-align: center;
      color: ${p.texteColor}; margin-bottom: 12px;
    }
    .event-time-large {
      font-family: '${p.titresFont}', serif;
      font-size: clamp(18px, 4.5vw, 26px); color: ${p.accentColor};
      text-align: center; margin-bottom: 16px; letter-spacing: 2px;
    }

    /* ── Lieu & adresse ── */
    .event-lieu-text {
      font-family: 'Cormorant Garamond', serif; font-style: italic;
      font-size: clamp(14px, 3.5vw, 20px); text-align: center;
      color: ${p.texteColor}; line-height: 1.6; max-width: 90%; margin: 0 auto; margin-bottom: 16px;
    }
    .event-adresse {
      font-size: clamp(11px, 2.5vw, 14px); margin-top: 8px;
      color: ${p.texteSecondaireColor};
    }
    .reception-text {
      margin-top: 4px;
    }

    /* ── Boutons ── */
    .event-buttons { display: flex; gap: 8px; justify-content: center; margin: 20px 0 8px; }
    .btn-itineraire {
      display: inline-flex; align-items: center; gap: 4px;
      padding: 10px 24px; border-radius: 9999px;
      border: 1px solid ${p.accentColor}; background: transparent;
      color: ${p.accentColor}; font-family: 'Cormorant Garamond', serif;
      font-style: italic; font-size: 15px; text-decoration: none;
      transition: opacity 0.2s;
    }
    .btn-itineraire:hover { opacity: 0.8; }

    /* ── Note ── */
    .event-note-block {
      margin-top: 20px; padding-top: 14px;
      border-top: 1px solid ${p.accentColor}; opacity: 0.8;
    }
    .event-note {
      font-family: 'Cormorant Garamond', serif; font-style: italic;
      font-size: 13px; text-align: center; color: ${p.texteColor};
    }

    /* ── Info blocks ── */
    .event-info-block {
      display: flex; align-items: flex-start; gap: 10px;
      text-align: left; margin-top: 16px;
      padding: 12px 16px; border-radius: 8px;
      background: ${p.fondSecondaryColor}; border: 1px solid ${p.accentColor}15;
    }
    .info-icon { font-size: 18px; flex-shrink: 0; margin-top: 2px; }
    .event-info-block strong {
      font-size: 13px; letter-spacing: 1px; text-transform: uppercase; color: ${p.titresColor};
    }
    .event-info-block p {
      font-size: 14px; color: ${p.texteSecondaireColor}; margin-top: 4px; line-height: 1.5;
    }

    /* ── Mairie spécifique ── */
    .mairie-sediront {
      font-family: 'Cormorant Garamond', serif; font-style: italic;
      font-size: clamp(16px, 4vw, 22px); text-align: center;
      color: ${p.texteColor}; margin-bottom: 8px;
    }
    .mairie-oui {
      font-family: '${p.prenomsFont}', cursive;
      font-size: clamp(48px, 12vw, 72px); color: ${p.accentColor};
      text-align: center; margin-bottom: 20px; line-height: 1;
    }
    .suivi-section {
      text-align: center; padding-top: 20px; margin-top: 20px;
      border-top: 1px solid ${p.accentColor}; line-height: 1.8; max-width: 90%; margin-left: auto; margin-right: auto;
    }
    .suivi-text {
      font-family: '${p.titresFont}', serif; font-weight: bold;
      font-size: clamp(12px, 3vw, 16px); color: ${p.texteColor};
    }
    .suivi-adresse {
      font-family: 'Cormorant Garamond', serif; font-style: italic;
      font-size: clamp(11px, 2.5vw, 14px); color: ${p.texteSecondaireColor}; margin-top: 4px;
    }

    /* ── Henné spécifique ── */
    .henne-ornament {
      text-align: center; font-size: 24px; letter-spacing: 0.5em;
      color: ${p.accentColor}; margin-bottom: 24px;
    }
    .henne-invite {
      font-family: 'Cormorant Garamond', serif; font-style: italic;
      font-size: 20px; text-align: center; color: ${p.texteColor};
      line-height: 1.7; margin-bottom: 28px;
    }
    .autre-invite {
      font-family: 'Cormorant Garamond', serif; font-style: italic;
      font-size: 20px; text-align: center; color: ${p.texteColor};
      line-height: 1.7; margin-bottom: 28px;
    }

    /* ── Pensée défunts ── */
    .pensee-section {
      text-align: center; margin: 32px 0; padding-bottom: 24px;
      border-bottom: 1px solid ${p.accentColor}22;
    }
    .pensee-header {
      display: flex; align-items: center; justify-content: center;
      gap: 14px; margin-bottom: 16px;
    }
    .pensee-line { width: 60px; height: 0.5px; background: ${p.accentColor}; opacity: 0.4; }
    .pensee-candle { width: 50px; height: 50px; object-fit: contain; }
    .pensee-intro {
      font-family: 'Cormorant Garamond', serif; font-style: italic;
      font-size: 14px; color: ${p.texteColor}; opacity: 0.85;
      margin-bottom: 14px; line-height: 1.6; padding: 0 12px;
    }
    .pensee-noms { display: flex; flex-direction: column; gap: 4px; margin-bottom: 14px; }
    .pensee-nom {
      font-family: '${p.titresFont}', serif;
      font-size: 16px; color: ${p.texteColor}; font-weight: 500; line-height: 1.6;
    }
    .pensee-fin {
      font-family: 'Cormorant Garamond', serif; font-style: italic;
      font-size: 13px; color: ${p.texteColor}; opacity: 0.75; line-height: 1.6; padding: 0 12px;
    }

    /* ── RSVP ── */
    .rsvp-section { padding: 40px 20px; text-align: center; }
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
    <section class="accueil animate">
      <div class="couple-names-display">
        <span class="couple-name-big">${esc(input.marie1Prenom)}</span>
        <span class="couple-amp-big">&amp;</span>
        <span class="couple-name-big">${esc(input.marie2Prenom)}</span>
      </div>
      <p class="accueil-date delay-1 animate">${formatDateFr(firstDate).toUpperCase()}</p>
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
