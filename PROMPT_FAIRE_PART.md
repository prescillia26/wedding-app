Refais complètement le système de thèmes et les ornements dans app/faire-part/page.tsx.

## PROBLÈME ACTUEL
Les ornements SVG ne sont pas visibles et les animations ne fonctionnent pas. Il faut tout reconstruire proprement.

## PARTIE 1 — THÈMES VISUELS DANS LE FORMULAIRE

Dans Step4, remplace les 12 thèmes actuels par 5 grands thèmes avec aperçu visuel réel. Chaque thème a un nom, une vignette colorée et un style d'ornement associé.

Les 5 thèmes :
- "floral-bleu" → "Floral Bleu" — fond blanc, accent bleu #2c4a7c, ornements fleurs aquarelle bleues
- "rose-fleuri" → "Rose Fleuri" — fond #faf6f4, accent rose #c4829a, ornements roses aquarelle
- "or-dentelle" → "Or & Dentelle" — fond #fdf8f0, accent doré #C9A84C, ornements dentelle dorée
- "oriental-nuit" → "Oriental Nuit" — fond #0f0a1e, accent #D4A847, ornements arabesques dorées
- "champetre" → "Champêtre" — fond #f4f7f0, accent vert #7a9e6e, ornements branches

Afficher les 5 thèmes en grille avec pour chaque thème :
- Rectangle 120px × 80px avec fond du thème + un aperçu de l'ornement SVG dedans
- Nom du thème
- Bordure 3px accent si sélectionné

## PARTIE 2 — ORNEMENTS SVG VISIBLES ET BEAUX

Créer une fonction getOrnement(theme, position) qui retourne un SVG visible et élégant.

ORNEMENT FLORAL BLEU — à coller directement dans le JSX, taille 180px × 200px :

Pour le thème "floral-bleu", l'ornement est ce SVG exact (copie-le tel quel) :

```jsx
const OrnementFloralBleu = ({ style = {} }) => (
  <svg viewBox="0 0 200 220" width="180" height="200" style={{ ...style, pointerEvents: 'none' }}>
    {/* Grande fleur bleue principale */}
    <ellipse cx="100" cy="80" rx="40" ry="35" fill="#4a7ab5" opacity="0.75" transform="rotate(-20 100 80)"/>
    <ellipse cx="100" cy="80" rx="32" ry="27" fill="#6b9fd4" opacity="0.65" transform="rotate(40 100 80)"/>
    <ellipse cx="100" cy="80" rx="24" ry="20" fill="#8bbde8" opacity="0.55" transform="rotate(90 100 80)"/>
    <circle cx="100" cy="80" r="10" fill="#1a3a6a" opacity="0.85"/>
    <circle cx="100" cy="80" r="6" fill="#2c5490" opacity="0.95"/>
    {/* Petits points au centre */}
    <circle cx="95" cy="75" r="2" fill="white" opacity="0.6"/>
    <circle cx="105" cy="75" r="1.5" fill="white" opacity="0.5"/>
    
    {/* 2ème fleur bleue foncée */}
    <ellipse cx="155" cy="110" rx="30" ry="26" fill="#1e3a6a" opacity="0.8" transform="rotate(20 155 110)"/>
    <ellipse cx="155" cy="110" rx="23" ry="19" fill="#2d5490" opacity="0.7" transform="rotate(70 155 110)"/>
    <ellipse cx="155" cy="110" rx="16" ry="13" fill="#4a7ab5" opacity="0.6" transform="rotate(-30 155 110)"/>
    <circle cx="155" cy="110" r="7" fill="#0a1f40" opacity="0.9"/>
    
    {/* Petite fleur 3 */}
    <ellipse cx="55" cy="150" rx="20" ry="17" fill="#6b9fd4" opacity="0.6" transform="rotate(-40 55 150)"/>
    <ellipse cx="55" cy="150" rx="14" ry="11" fill="#8bbde8" opacity="0.5" transform="rotate(20 55 150)"/>
    <circle cx="55" cy="150" r="5" fill="#2c5490" opacity="0.8"/>
    
    {/* Branches et tiges */}
    <path d="M 20 210 Q 60 170 95 140 Q 120 120 140 100" stroke="#3a6a4a" strokeWidth="2.5" fill="none" opacity="0.5"/>
    <path d="M 30 200 Q 50 160 80 130" stroke="#4a7a5a" strokeWidth="2" fill="none" opacity="0.4"/>
    
    {/* Feuilles */}
    <ellipse cx="45" cy="185" rx="22" ry="11" fill="#4a7a5a" opacity="0.55" transform="rotate(-45 45 185)"/>
    <ellipse cx="65" cy="165" rx="18" ry="9" fill="#5a8a6a" opacity="0.5" transform="rotate(-55 65 165)"/>
    <ellipse cx="88" cy="145" rx="16" ry="8" fill="#4a7a5a" opacity="0.5" transform="rotate(15 88 145)"/>
    <ellipse cx="115" cy="125" rx="14" ry="7" fill="#6a9a7a" opacity="0.45" transform="rotate(-20 115 125)"/>
    
    {/* Petites feuilles bleues aquarelle */}
    <ellipse cx="170" cy="55" rx="14" ry="7" fill="#6b9fd4" opacity="0.45" transform="rotate(50 170 55)"/>
    <ellipse cx="180" cy="75" rx="11" ry="5.5" fill="#8bbde8" opacity="0.4" transform="rotate(-15 180 75)"/>
    <ellipse cx="165" cy="85" rx="16" ry="7" fill="#4a7ab5" opacity="0.4" transform="rotate(70 165 85)"/>
    <ellipse cx="30" cy="100" rx="12" ry="6" fill="#6b9fd4" opacity="0.35" transform="rotate(30 30 100)"/>
    
    {/* Petites baies */}
    <circle cx="130" cy="60" r="5" fill="#2c4a7c" opacity="0.65"/>
    <circle cx="140" cy="52" r="4" fill="#2c4a7c" opacity="0.55"/>
    <circle cx="148" cy="60" r="4.5" fill="#1e3a6a" opacity="0.6"/>
    <circle cx="138" cy="68" r="3.5" fill="#2c4a7c" opacity="0.5"/>
    <path d="M 130 60 Q 135 55 140 52" stroke="#3a5a8a" strokeWidth="1.5" fill="none" opacity="0.4"/>
    <path d="M 140 52 Q 145 56 148 60" stroke="#3a5a8a" strokeWidth="1.5" fill="none" opacity="0.4"/>
  </svg>
)
```

ORNEMENT FLORAL ROSE — même structure mais couleurs roses :
```jsx
const OrnementFloralRose = ({ style = {} }) => (
  <svg viewBox="0 0 200 220" width="180" height="200" style={{ ...style, pointerEvents: 'none' }}>
    <ellipse cx="100" cy="80" rx="38" ry="33" fill="#e8a0b8" opacity="0.75" transform="rotate(-20 100 80)"/>
    <ellipse cx="100" cy="80" rx="30" ry="25" fill="#d4829a" opacity="0.65" transform="rotate(40 100 80)"/>
    <ellipse cx="100" cy="80" rx="22" ry="18" fill="#f0c0d0" opacity="0.55" transform="rotate(90 100 80)"/>
    <circle cx="100" cy="80" r="9" fill="#8b3a5a" opacity="0.85"/>
    <circle cx="100" cy="80" r="5" fill="#a0506a" opacity="0.95"/>
    <circle cx="95" cy="75" r="2" fill="white" opacity="0.6"/>
    <ellipse cx="155" cy="110" rx="28" ry="24" fill="#c4729a" opacity="0.75" transform="rotate(20 155 110)"/>
    <ellipse cx="155" cy="110" rx="20" ry="16" fill="#e8a0b8" opacity="0.65" transform="rotate(70 155 110)"/>
    <circle cx="155" cy="110" r="6" fill="#7a2a4a" opacity="0.9"/>
    <ellipse cx="55" cy="150" rx="18" ry="15" fill="#e8a0b8" opacity="0.6" transform="rotate(-40 55 150)"/>
    <circle cx="55" cy="150" r="5" fill="#c4729a" opacity="0.8"/>
    <path d="M 20 210 Q 60 170 95 140 Q 120 120 140 100" stroke="#6a8a5a" strokeWidth="2.5" fill="none" opacity="0.5"/>
    <ellipse cx="45" cy="185" rx="20" ry="10" fill="#6a8a5a" opacity="0.55" transform="rotate(-45 45 185)"/>
    <ellipse cx="65" cy="165" rx="17" ry="8.5" fill="#7a9a6a" opacity="0.5" transform="rotate(-55 65 165)"/>
    <ellipse cx="88" cy="145" rx="15" ry="7.5" fill="#6a8a5a" opacity="0.5" transform="rotate(15 88 145)"/>
    <ellipse cx="170" cy="55" rx="13" ry="6.5" fill="#e8a0b8" opacity="0.45" transform="rotate(50 170 55)"/>
    <ellipse cx="180" cy="75" rx="10" ry="5" fill="#f0c0d0" opacity="0.4" transform="rotate(-15 180 75)"/>
    <circle cx="130" cy="60" r="4.5" fill="#c4729a" opacity="0.65"/>
    <circle cx="140" cy="52" r="3.5" fill="#d4829a" opacity="0.55"/>
    <circle cx="148" cy="60" r="4" fill="#c4729a" opacity="0.6"/>
    <path d="M 130 60 Q 135 55 140 52 Q 145 56 148 60" stroke="#c4829a" strokeWidth="1.5" fill="none" opacity="0.4"/>
  </svg>
)
```

ORNEMENT DORÉ — dentelle et feuilles :
```jsx
const OrnementDore = ({ style = {} }) => (
  <svg viewBox="0 0 200 220" width="180" height="200" style={{ ...style, pointerEvents: 'none' }}>
    {/* Volutes principales */}
    <path d="M 100 40 Q 130 20 160 40 Q 180 60 160 80 Q 140 100 120 90 Q 100 80 110 60 Q 120 40 140 50" stroke="#C9A84C" strokeWidth="2" fill="none" opacity="0.8"/>
    <path d="M 100 40 Q 70 20 40 40 Q 20 60 40 80 Q 60 100 80 90 Q 100 80 90 60 Q 80 40 60 50" stroke="#C9A84C" strokeWidth="2" fill="none" opacity="0.8"/>
    {/* Feuilles dorées */}
    <ellipse cx="150" cy="100" rx="20" ry="10" fill="#C9A84C" opacity="0.6" transform="rotate(30 150 100)"/>
    <ellipse cx="50" cy="100" rx="20" ry="10" fill="#C9A84C" opacity="0.6" transform="rotate(-30 50 100)"/>
    <ellipse cx="100" cy="140" rx="25" ry="12" fill="#D4A847" opacity="0.55" transform="rotate(0 100 140)"/>
    <ellipse cx="70" cy="160" rx="18" ry="9" fill="#C9A84C" opacity="0.5" transform="rotate(40 70 160)"/>
    <ellipse cx="130" cy="160" rx="18" ry="9" fill="#C9A84C" opacity="0.5" transform="rotate(-40 130 160)"/>
    {/* Petites fleurs */}
    <circle cx="100" cy="80" r="12" fill="#D4A847" opacity="0.7"/>
    <circle cx="100" cy="80" r="7" fill="#b8860b" opacity="0.8"/>
    <circle cx="100" cy="80" r="3" fill="#fff8e0" opacity="0.9"/>
    {/* Petites perles */}
    <circle cx="160" cy="50" r="4" fill="#C9A84C" opacity="0.7"/>
    <circle cx="170" cy="65" r="3" fill="#D4A847" opacity="0.6"/>
    <circle cx="40" cy="50" r="4" fill="#C9A84C" opacity="0.7"/>
    <circle cx="30" cy="65" r="3" fill="#D4A847" opacity="0.6"/>
    {/* Tige centrale avec ornements */}
    <path d="M 100 100 Q 100 140 100 180" stroke="#C9A84C" strokeWidth="2" fill="none" opacity="0.6"/>
    <path d="M 100 120 Q 80 130 70 150" stroke="#C9A84C" strokeWidth="1.5" fill="none" opacity="0.5"/>
    <path d="M 100 120 Q 120 130 130 150" stroke="#C9A84C" strokeWidth="1.5" fill="none" opacity="0.5"/>
    <path d="M 100 150 Q 75 155 65 170" stroke="#C9A84C" strokeWidth="1.5" fill="none" opacity="0.5"/>
    <path d="M 100 150 Q 125 155 135 170" stroke="#C9A84C" strokeWidth="1.5" fill="none" opacity="0.5"/>
  </svg>
)
```

ORNEMENT ARABESQUE (Oriental) :
```jsx
const OrnementArabesque = ({ style = {} }) => (
  <svg viewBox="0 0 200 220" width="180" height="200" style={{ ...style, pointerEvents: 'none' }}>
    <path d="M 100 10 L 120 50 L 165 50 L 130 75 L 145 120 L 100 95 L 55 120 L 70 75 L 35 50 L 80 50 Z" fill="none" stroke="#D4A847" strokeWidth="1.5" opacity="0.7"/>
    <path d="M 100 30 L 115 58 L 148 58 L 122 76 L 132 108 L 100 88 L 68 108 L 78 76 L 52 58 L 85 58 Z" fill="#D4A847" opacity="0.15"/>
    <circle cx="100" cy="70" r="15" fill="none" stroke="#D4A847" strokeWidth="1.5" opacity="0.7"/>
    <circle cx="100" cy="70" r="8" fill="#D4A847" opacity="0.5"/>
    <path d="M 20 140 Q 60 110 100 130 Q 140 150 180 120" stroke="#D4A847" strokeWidth="2" fill="none" opacity="0.6"/>
    <path d="M 20 160 Q 60 130 100 150 Q 140 170 180 140" stroke="#D4A847" strokeWidth="1.5" fill="none" opacity="0.5"/>
    <path d="M 20 180 Q 60 150 100 170 Q 140 190 180 160" stroke="#D4A847" strokeWidth="1" fill="none" opacity="0.4"/>
    <circle cx="40" cy="145" r="5" fill="#D4A847" opacity="0.6"/>
    <circle cx="160" cy="125" r="5" fill="#D4A847" opacity="0.6"/>
    <circle cx="100" cy="135" r="4" fill="#D4A847" opacity="0.7"/>
    <path d="M 60 200 Q 100 185 140 200" stroke="#D4A847" strokeWidth="1.5" fill="none" opacity="0.5"/>
  </svg>
)
```

ORNEMENT CHAMPÊTRE — branches olivier :
```jsx
const OrnementChampetre = ({ style = {} }) => (
  <svg viewBox="0 0 200 220" width="180" height="200" style={{ ...style, pointerEvents: 'none' }}>
    <path d="M 30 200 Q 80 160 120 120 Q 150 90 170 60" stroke="#5a7a4a" strokeWidth="3" fill="none" opacity="0.6"/>
    <path d="M 20 180 Q 60 150 90 120" stroke="#6a8a5a" strokeWidth="2" fill="none" opacity="0.5"/>
    {/* Feuilles d'olivier sur la branche principale */}
    {[
      [55, 175, -50], [75, 158, -45], [95, 140, -40],
      [110, 128, 20], [125, 114, -35], [140, 100, 25],
      [152, 88, -30], [162, 75, 20]
    ].map(([cx, cy, rotate], i) => (
      <ellipse key={i} cx={cx} cy={cy} rx="14" ry="6" fill="#6a9a5a" opacity="0.6" transform={`rotate(${rotate} ${cx} ${cy})`}/>
    ))}
    {/* Petites olives */}
    <circle cx="85" cy="145" r="4" fill="#3a5a2a" opacity="0.6"/>
    <circle cx="115" cy="120" r="3.5" fill="#3a5a2a" opacity="0.55"/>
    <circle cx="145" cy="95" r="4" fill="#3a5a2a" opacity="0.6"/>
    {/* Branche secondaire */}
    <path d="M 90 140 Q 50 120 30 90" stroke="#5a7a4a" strokeWidth="2" fill="none" opacity="0.5"/>
    {[
      [70, 128, 30], [55, 115, 40], [42, 103, 35]
    ].map(([cx, cy, rotate], i) => (
      <ellipse key={i} cx={cx} cy={cy} rx="13" ry="6" fill="#7aaa6a" opacity="0.55" transform={`rotate(${rotate} ${cx} ${cy})`}/>
    ))}
    {/* Petites fleurs blanches */}
    <circle cx="130" cy="65" r="6" fill="#f0f8e8" opacity="0.8"/>
    <circle cx="130" cy="65" r="3" fill="#C9A84C" opacity="0.7"/>
    <circle cx="170" cy="45" r="5" fill="#f0f8e8" opacity="0.75"/>
    <circle cx="170" cy="45" r="2.5" fill="#C9A84C" opacity="0.7"/>
    <circle cx="40" cy="80" r="5" fill="#f0f8e8" opacity="0.75"/>
    <circle cx="40" cy="80" r="2.5" fill="#C9A84C" opacity="0.7"/>
  </svg>
)
```

## PARTIE 3 — PLACEMENT DES ORNEMENTS SUR LA PAGE PARTAGÉE

Dans la vue partagée, placer les ornements ainsi :

Pour chaque section, wrapper dans un div avec position: 'relative', overflow: 'hidden' et placer l'ornement approprié en position absolute :

- SECTION INTRO : ornement en haut à droite (top: 0, right: -20px)
- SECTION PARENTS : ornement en bas à gauche (bottom: -20px, left: -20px)
- SECTION HOUPPA : ornement en haut à gauche (top: 0, left: -20px)
- SECTION MAIRIE : ornement en haut à droite (top: 0, right: -20px)
- SECTION HENNÉ : ornement en bas à gauche (bottom: 0, left: -20px)
- SECTION RSVP : ornement débordant à gauche (top: 50px, left: -30px)

La fonction pour obtenir le bon ornement selon le thème :
```jsx
function getOrnement(theme: string, style: React.CSSProperties = {}) {
  const props = { style: { position: 'absolute' as const, zIndex: 0, ...style } }
  switch(theme) {
    case 'floral-bleu': return <OrnementFloralBleu {...props} />
    case 'rose-fleuri': return <OrnementFloralRose {...props} />
    case 'or-dentelle': return <OrnementDore {...props} />
    case 'oriental-nuit': return <OrnementArabesque {...props} />
    case 'champetre': return <OrnementChampetre {...props} />
    default: return <OrnementFloralBleu {...props} />
  }
}
```

## PARTIE 4 — ANIMATIONS AU SCROLL

Ajouter ce useEffect dans le composant de la vue partagée :

```javascript
useEffect(() => {
  const elements = document.querySelectorAll('.scroll-animate')
  
  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry, index) => {
      if (entry.isIntersecting) {
        setTimeout(() => {
          (entry.target as HTMLElement).style.opacity = '1'
          ;(entry.target as HTMLElement).style.transform = 'translateY(0)'
        }, index * 100)
      }
    })
  }, { threshold: 0.1 })
  
  elements.forEach(el => observer.observe(el))
  return () => observer.disconnect()
}, [])
```

Ajouter la classe 'scroll-animate' à tous les éléments texte importants avec ces styles initiaux :
```javascript
const scrollStyle = {
  opacity: 0,
  transform: 'translateY(40px)',
  transition: 'opacity 0.9s ease, transform 0.9s ease'
}
```

## PARTIE 5 — FORMAT DATE ÉLÉGANT

Dans chaque section cérémonie, remplacer l'affichage de la date par ce format :

```jsx
<div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 16, margin: '24px 0' }}>
  <div style={{ textAlign: 'right' }}>
    <div style={{ borderBottom: `1px solid ${accent}`, paddingBottom: 4, marginBottom: 4, letterSpacing: 3, fontSize: 11, color: accent }}>
      {jourSemaine.toUpperCase()}
    </div>
    <div style={{ fontSize: 11, color: textColor, letterSpacing: 2 }}>
      {annee}
    </div>
  </div>
  <div style={{ 
    border: `1.5px solid ${accent}`, 
    borderRadius: 4,
    padding: '8px 16px',
    fontSize: 36,
    fontFamily: 'Playfair Display',
    color: accent,
    fontWeight: 600,
    minWidth: 60,
    textAlign: 'center'
  }}>
    {jour}
  </div>
  <div style={{ textAlign: 'left' }}>
    <div style={{ borderBottom: `1px solid ${accent}`, paddingBottom: 4, marginBottom: 4, letterSpacing: 3, fontSize: 11, color: accent }}>
      {mois.toUpperCase()}
    </div>
    <div style={{ fontSize: 11, color: textColor, letterSpacing: 2 }}>
      {annee}
    </div>
  </div>
</div>
```

Faire git add -A && git commit -m "Ornements SVG visibles + animations scroll + format date élégant" && git push