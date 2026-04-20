Les ornements SVG actuels ne sont pas assez beaux. Remplace-les par de vraies images PNG aquarelle hébergées sur des URLs publiques gratuites.

Crée un objet ORNEMENTS_THEMES avec les URLs Cloudinary :

const ORNEMENTS_THEMES = {
  'rose-fleuri': [
    'https://res.cloudinary.com/dau96mui2/image/upload/v1776717218/20171005_019_vdhnev.jpg',
    'https://res.cloudinary.com/dau96mui2/image/upload/v1776717246/66409_puhith.jpg',
    'https://res.cloudinary.com/dau96mui2/image/upload/v1776717314/anuj31may_1_j0pavz.jpg',
    'https://res.cloudinary.com/dau96mui2/image/upload/v1776717363/1200f225-a3cc-4f16-9e1f-1506fe39d391_rq7wsv.jpg',
    'https://res.cloudinary.com/dau96mui2/image/upload/v1776717404/9580620_dq9fdq.png',
  ],
  'floral-bleu': [
    'https://res.cloudinary.com/dau96mui2/image/upload/v1776718390/16_sep_14_bzf6dr.jpg',
    'https://res.cloudinary.com/dau96mui2/image/upload/v1776719196/19195_y8izaq.jpg',
    'https://res.cloudinary.com/dau96mui2/image/upload/v1776719185/16_sep_14_apqwtk.jpg',
    'https://res.cloudinary.com/dau96mui2/image/upload/v1776719178/OP0ITX0_kymmwl.jpg',
    'https://res.cloudinary.com/dau96mui2/image/upload/v1776719150/82080d7a-d487-4894-8f10-397c8cb49537_fyhmi9.jpg',
    'https://res.cloudinary.com/dau96mui2/image/upload/v1776718431/3018234_fzcxop.jpg',
  ],
  'champetre': [
    'https://res.cloudinary.com/dau96mui2/image/upload/v1776718577/pdproject20batch45-01-a_ta7kvb.jpg',
    'https://res.cloudinary.com/dau96mui2/image/upload/v1776718564/5669340_vewejg.jpg',
    'https://res.cloudinary.com/dau96mui2/image/upload/v1776718554/beautiful-leaf-watercolor-background-brown-autumn-season_kfslxw.jpg',
  ],
  'or-dentelle': [
    'https://res.cloudinary.com/dau96mui2/image/upload/v1776719304/OM8PMY0_qiwjoc.jpg',
    'https://res.cloudinary.com/dau96mui2/image/upload/v1776719294/5381953_fog6nb.jpg',
  ],
}

Dans Step4 du formulaire, ajouter une section "Choisir votre ornement" qui s'affiche après le choix du thème :
- Afficher les images du thème sélectionné en grille 3 colonnes
- Chaque image est un aperçu 80px × 80px cliquable avec object-fit: cover et border-radius 8px
- Image sélectionnée : bordure 3px accent
- Stocker dans formData.ornementUrl: string (l'URL de l'image choisie)
- Si aucun ornement choisi : utiliser le premier par défaut

Dans la vue partagée ET dans la vue créateur, afficher l'ornement choisi :
- En haut à droite de chaque section : <img src={ornementUrl} style={{ position: 'absolute', top: -30, right: -30, width: 200, height: 200, objectFit: 'cover', opacity: 0.85, pointerEvents: 'none', zIndex: 0, borderRadius: 8 }} />
- En bas à gauche : même image avec transform: 'rotate(180deg)'
- Les images alternent entre les sections : haut droite, bas gauche, haut droite...

Supprimer tous les anciens ornements SVG.

1. Depuis Cloudinary CDN public (gratuit) : cherche des URLs d'images PNG aquarelle avec fond transparent sur cloudinary.com/samples
2. Depuis rawpixel.com public URLs de fleurs aquarelle PNG transparentes
3. Depuis pngtree.com free PNG URLs

En attendant de trouver les bonnes URLs, crée une fonction qui génère un ornement SVG VRAIMENT beau et riche pour le thème or-dentelle en imitant la dentelle avec perles de la capture d'écran Ornella & Alexandre :

Pour "or-dentelle", créer un SVG de dentelle avec perles :
- Branches épaisses avec texture (stroke-width 4-6)
- Feuilles avec nervures détaillées
- Perles (circles blancs avec ombre)
- Fleurs de dentelle avec pétales multiples
- Tout en couleur #d4b896 (or crème) avec opacity 0.9
- Taille 250px × 280px minimum
- Très dense, beaucoup d'éléments

Voici le SVG exact à utiliser pour "or-dentelle" :

const OrnementDentelleDore = ({ style = {} }) => (
  <svg viewBox="0 0 260 300" width="240" height="270" style={{...style, pointerEvents:'none'}}>
    {/* Branche principale épaisse */}
    <path d="M 10 280 Q 40 240 70 200 Q 100 160 130 130 Q 155 105 175 80 Q 190 60 200 40" 
          stroke="#c8a96e" strokeWidth="5" fill="none" opacity="0.9" strokeLinecap="round"/>
    
    {/* Branches secondaires */}
    <path d="M 70 200 Q 45 185 30 165 Q 20 150 25 135" 
          stroke="#c8a96e" strokeWidth="3.5" fill="none" opacity="0.8" strokeLinecap="round"/>
    <path d="M 100 160 Q 130 145 145 125 Q 155 110 150 95" 
          stroke="#c8a96e" strokeWidth="3" fill="none" opacity="0.8" strokeLinecap="round"/>
    <path d="M 130 130 Q 105 110 95 85 Q 88 65 95 50" 
          stroke="#c8a96e" strokeWidth="3" fill="none" opacity="0.75" strokeLinecap="round"/>
    
    {/* Grande fleur centrale de dentelle */}
    <circle cx="165" cy="75" r="28" fill="#e8d5a8" opacity="0.7"/>
    <circle cx="165" cy="75" r="22" fill="none" stroke="#c8a96e" strokeWidth="1.5" opacity="0.8"/>
    <circle cx="165" cy="75" r="14" fill="#d4b87a" opacity="0.75"/>
    <circle cx="165" cy="75" r="8" fill="#b8963c" opacity="0.8"/>
    <circle cx="165" cy="75" r="4" fill="#fff8e0" opacity="0.9"/>
    {/* Pétales de la grande fleur */}
    {[0,45,90,135,180,225,270,315].map((angle, i) => {
      const rad = angle * Math.PI / 180
      const x = 165 + Math.cos(rad) * 22
      const y = 75 + Math.sin(rad) * 22
      return <ellipse key={i} cx={x} cy={y} rx="9" ry="5" fill="#d4b87a" opacity="0.65"
                      transform={`rotate(${angle} ${x} ${y})`}/>
    })}
    
    {/* Fleur 2 */}
    <circle cx="95" cy="55" r="20" fill="#e8d5a8" opacity="0.65"/>
    <circle cx="95" cy="55" r="12" fill="#d4b87a" opacity="0.7"/>
    <circle cx="95" cy="55" r="6" fill="#b8963c" opacity="0.8"/>
    <circle cx="95" cy="55" r="3" fill="#fff8e0" opacity="0.9"/>
    {[0,60,120,180,240,300].map((angle, i) => {
      const rad = angle * Math.PI / 180
      const x = 95 + Math.cos(rad) * 15
      const y = 55 + Math.sin(rad) * 15
      return <ellipse key={i} cx={x} cy={y} rx="7" ry="4" fill="#d4b87a" opacity="0.6"
                      transform={`rotate(${angle} ${x} ${y})`}/>
    })}
    
    {/* Petite fleur 3 */}
    <circle cx="35" cy="150" r="14" fill="#e8d5a8" opacity="0.65"/>
    <circle cx="35" cy="150" r="8" fill="#d4b87a" opacity="0.7"/>
    <circle cx="35" cy="150" r="4" fill="#b8963c" opacity="0.8"/>
    {[0,72,144,216,288].map((angle, i) => {
      const rad = angle * Math.PI / 180
      const x = 35 + Math.cos(rad) * 11
      const y = 150 + Math.sin(rad) * 11
      return <ellipse key={i} cx={x} cy={y} rx="6" ry="3.5" fill="#d4b87a" opacity="0.6"
                      transform={`rotate(${angle} ${x} ${y})`}/>
    })}
    
    {/* Feuilles avec nervures sur branche principale */}
    {[
      [35, 255, -50, 28, 13],
      [55, 228, -45, 25, 12],
      [78, 200, -40, 24, 11],
      [100, 172, 20, 26, 12],
      [118, 152, -35, 22, 10],
      [138, 132, 25, 24, 11],
      [152, 115, -30, 20, 9],
      [165, 98, 20, 18, 8],
    ].map(([cx, cy, rotate, rx, ry], i) => (
      <g key={i}>
        <ellipse cx={cx} cy={cy} rx={rx} ry={ry} fill="#c8a96e" opacity="0.7"
                 transform={`rotate(${rotate} ${cx} ${cy})`}/>
        <line x1={cx - rx * 0.7 * Math.cos(rotate * Math.PI/180)} 
              y1={cy - rx * 0.7 * Math.sin(rotate * Math.PI/180)}
              x2={cx + rx * 0.7 * Math.cos(rotate * Math.PI/180)} 
              y2={cy + rx * 0.7 * Math.sin(rotate * Math.PI/180)}
              stroke="#b8963c" strokeWidth="1" opacity="0.5"/>
      </g>
    ))}
    
    {/* Feuilles sur branches secondaires */}
    <ellipse cx="28" cy="155" rx="16" ry="8" fill="#c8a96e" opacity="0.6" transform="rotate(30 28 155)"/>
    <ellipse cx="20" cy="140" rx="14" ry="7" fill="#d4b87a" opacity="0.55" transform="rotate(40 20 140)"/>
    <ellipse cx="140" cy="135" rx="18" ry="8" fill="#c8a96e" opacity="0.6" transform="rotate(-40 140 135)"/>
    <ellipse cx="150" cy="118" rx="15" ry="7" fill="#d4b87a" opacity="0.55" transform="rotate(-50 150 118)"/>
    
    {/* Perles sur les branches */}
    {[
      [48, 240, 8], [65, 218, 7], [85, 192, 9],
      [108, 162, 7.5], [125, 143, 8], [145, 122, 7],
      [158, 108, 7.5], [170, 90, 6]
    ].map(([cx, cy, r], i) => (
      <g key={i}>
        <circle cx={cx} cy={cy} r={r} fill="white" opacity="0.9"/>
        <circle cx={cx} cy={cy} r={r} fill="none" stroke="#d4b87a" strokeWidth="1.5" opacity="0.8"/>
        <circle cx={cx - r*0.3} cy={cy - r*0.3} r={r*0.25} fill="white" opacity="0.7"/>
      </g>
    ))}
    
    {/* Petites perles décoratives */}
    <circle cx="120" cy="45" r="5" fill="white" opacity="0.85"/>
    <circle cx="120" cy="45" r="5" fill="none" stroke="#d4b87a" strokeWidth="1" opacity="0.7"/>
    <circle cx="130" cy="38" r="4" fill="white" opacity="0.8"/>
    <circle cx="130" cy="38" r="4" fill="none" stroke="#d4b87a" strokeWidth="1" opacity="0.65"/>
    <circle cx="140" cy="45" r="4.5" fill="white" opacity="0.85"/>
    <circle cx="140" cy="45" r="4.5" fill="none" stroke="#d4b87a" strokeWidth="1" opacity="0.7"/>
    <circle cx="183" cy="58" r="5" fill="white" opacity="0.85"/>
    <circle cx="183" cy="58" r="5" fill="none" stroke="#d4b87a" strokeWidth="1" opacity="0.7"/>
    <circle cx="190" cy="45" r="4" fill="white" opacity="0.8"/>
    <circle cx="198" cy="52" r="4.5" fill="white" opacity="0.85"/>
    
    {/* Bourgeons */}
    <ellipse cx="200" cy="38" rx="8" ry="5" fill="#d4b87a" opacity="0.75" transform="rotate(-30 200 38)"/>
    <ellipse cx="210" cy="28" rx="6" ry="4" fill="#c8a96e" opacity="0.7" transform="rotate(-40 210 28)"/>
    <ellipse cx="185" cy="25" rx="7" ry="4.5" fill="#d4b87a" opacity="0.7" transform="rotate(-20 185 25)"/>
    
    {/* Lignes de dentelle délicates */}
    <path d="M 155 80 Q 170 65 180 50" stroke="#d4b87a" strokeWidth="1" fill="none" opacity="0.5"/>
    <path d="M 170 85 Q 185 72 192 55" stroke="#d4b87a" strokeWidth="1" fill="none" opacity="0.45"/>
    <path d="M 88 58 Q 75 45 70 30" stroke="#d4b87a" strokeWidth="1" fill="none" opacity="0.5"/>
    <path d="M 102 50 Q 92 35 88 20" stroke="#d4b87a" strokeWidth="1" fill="none" opacity="0.45"/>
  </svg>
)

Utiliser cet ornement pour le thème 'or-dentelle' et créer des ornements similaires en richesse pour les autres thèmes.

Placer les ornements :
- position: 'absolute', zIndex: 0, pointerEvents: 'none'
- topRight: { top: -20, right: -20 }
- bottomLeft: { bottom: -20, left: -20, transform: 'rotate(180deg)' }






Faire git add -A && git commit -m "Ornements dentelle dorée avec perles" && git push