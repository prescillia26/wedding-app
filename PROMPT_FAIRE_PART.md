Refais COMPLÈTEMENT la vue partagée (isShared=true) dans app/faire-part/page.tsx.

L'objectif est de créer quelque chose de SUBLIME, comparable à invitationdigitale.fr mais en mieux.

## ARCHITECTURE GÉNÉRALE

Une seule page HTML qui défile de haut en bas. Pas de cartes séparées — tout est continu et fluide. Largeur max 480px centrée sur desktop, plein écran sur mobile.

## THÈMES VISUELS

Créer 4 thèmes complets, chacun avec ses propres ornements, couleurs et ambiance :

### THÈME 1 — "Rose Fleuri" (défaut)
- Fond : #faf6f4 (blanc rosé très doux)
- Accent : #c4829a (rose poudré)
- Texte : #2d2d2d
- Ornements : bouquets de roses aquarelle roses en PNG base64 (SVG simulant l'aquarelle avec des formes organiques roses, feuilles vertes pâles, touches dorées)
- Bordures des sections : 1px solid rgba(196, 130, 154, 0.3)
- Titres événements : uppercase Playfair Display, letter-spacing 4px

### THÈME 2 — "Or & Dentelle" (luxe)
- Fond : #fdf8f0 (crème chaud)
- Accent : #C9A84C (doré)
- Texte : #2d2014
- Ornements : dentelle et feuilles dorées SVG dans les coins (comme les captures beige & or)
- Bordures : 1px solid rgba(201, 168, 76, 0.4)

### THÈME 3 — "Oriental Nuit"
- Fond : #0f0a1e (nuit profonde)
- Accent : #D4A847 (or brillant)
- Texte : #f0e6d0
- Ornements : arabesques et motifs géométriques dorés SVG
- Effet : étoiles subtiles en background

### THÈME 4 — "Champêtre Vert"
- Fond : #f4f7f0 (blanc verdâtre)
- Accent : #7a9e6e (vert sauge)
- Texte : #2a3520
- Ornements : branches d'olivier et eucalyptus SVG vert et doré

## ORNEMENTS SVG

Pour chaque thème, créer des ornements SVG complexes et beaux :

ORNEMENT FLORAL ROSE (thème 1) :
```svg
Un bouquet de roses stylisées avec :
- 3-4 roses de tailles différentes (cercles avec pétales SVG)
- Des feuilles organiques
- Des petites fleurs
- Des touches dorées
- Couleurs : rose #e8a0b8, rose foncé #c4729a, vert #a8c890, or #d4a840
- Taille : 180px × 200px
```

Placer ces ornements :
- En haut à droite de la page
- En bas à gauche après la section parents
- En haut à droite de chaque section cérémonie (alternance)
- Position absolute, pointer-events: none, z-index: 0

## STRUCTURE DE LA PAGE (dans l'ordre du scroll)

### 1. ÉCRAN D'ACCUEIL (100vh)
- Fond plein thème
- Ornement floral en haut à droite
- Ornement floral en bas à gauche
- Centre :
  * Monogramme calligraphique (initiales entrelacées en Great Vibes 80px dans un cercle fin)
  * Bouton "DÉCOUVRIR" ou "פתח" en uppercase, fond accent, lettres blanches, border-radius 2px, padding 14px 40px
- Animation : monogramme apparaît en fadeIn 1s, bouton en fadeIn 1.5s

### 2. SECTION INTRO (après clic sur Découvrir)
- Ornement en haut à droite
- בס״ד en doré en haut à droite si mariage juif
- "The Wedding Of" ou "Le Mariage de" en Cormorant Garamond italic 16px, couleur accent, centré
- Séparateur : ——— ✦ ———
- Prénoms en Great Vibes 64px, couleur accent, centré
- Si mariage juif : prénoms hébreux en 28px en dessous, couleur accent
- Noms des familles en Cormorant Garamond 14px, deux colonnes
- "ont la joie de vous faire part du mariage de leurs petits-enfants et enfants"
- Séparateur ornementé

### 3. COMPTE À REBOURS
- "PRÉPAREZ VOUS !" en Playfair Display uppercase, letter-spacing 4px
- Emoji alliances 💍
- 4 cercles (border 2px accent, background transparent) :
  * Chiffres en Great Vibes 36px, couleur accent
  * Labels "Jours" "Heures" "Minutes" "Secondes" en 10px uppercase
  * Mis à jour chaque seconde avec setInterval
- Flèche animée ↓ qui rebondit doucement

### 4. POUR CHAQUE CÉRÉMONIE (répété autant de fois que nécessaire)

Section avec :
- Ornement floral qui alterne côté (droite, gauche, droite...)
- Bordure fine accent autour de toute la section
- בס״ד en doré en haut à droite si mariage juif
- Titre en Playfair Display uppercase letterspacing 4px : "LA HOUPPA" / "LA MAIRIE" / "LE HENNÉ"...
- Séparateur orné : ——— ◆ ———
- Si Houppa : verset hébreu קוֹל שָׂשׂוֹן en arc de cercle SVG (text on path) ou simplement centré en doré
- Noms des familles en deux colonnes Cormorant Garamond italic
- "ont la joie de vous faire part du mariage de leurs enfants"
- Prénoms mariés en Great Vibes 56px couleur accent (et hébreu si juif)
- "Et seraient honorés de votre présence"
- Date en Cormorant Garamond bold italic 22px : "Le Jeudi 11 Septembre 2025"
- Heure : "À 17h30 Précises"
- Lieu en italic
- Adresse complète
- Si note : "La cérémonie sera suivie d'une réception" en bold italic
- Si after mairie : "Un after mairie suivra la cérémonie / au [lieu] / [adresse]"
- Bouton itinéraire doré : "Itinéraire De La Houppa →" (lien Google Maps)
- Si note personnelle : texte en italic en bas de section

### 5. EN MÉMOIRE (si notePersonnelle contient "mémoire" ou toujours affiché si renseigné)
- Ornement floral délicat
- Texte en Cormorant Garamond italic centré
- Noms des défunts avec ז״ל si mariage juif

### 6. VOTRE RÉPONSE (RSVP)
- "VOTRE RÉPONSE" en Playfair Display uppercase
- Séparateur orné
- Encadré avec bordure accent
- Champs élégants (underline style, pas de border box) :
  * Nom
  * Prénom(s) (M. & Mme)
- Pour chaque cérémonie :
  * Checkbox "Présent(s) à [nom cérémonie]" / "Ne pourra(ons) pas être présent(s)..."
  * Dropdown "Nombre de personnes" (0 à 20)
- Textarea "Un petit mot pour les mariés..."
- Bouton ENVOYER doré

### 7. LOCALISATION
- "LOCALISATION" en uppercase Playfair Display
- Séparateur orné ——— ◈ ———
- Pour chaque cérémonie : carte Google Maps intégrée via iframe
  * URL : https://maps.google.com/maps?q=[adresse encodée]&output=embed
  * Hauteur 200px, width 100%, border-radius 8px
  * Titre de la cérémonie au-dessus

### 8. FOOTER
- Ornement floral centré petit
- Prénoms en Great Vibes 40px
- Séparateur ✦
- "Créé avec ❤️ par Lov'it" en Cormorant Garamond italic, lien vers landing page

## ANIMATIONS AU SCROLL

Utiliser Intersection Observer pour animer chaque section :

```javascript
const observer = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.style.opacity = '1'
      entry.target.style.transform = 'translateY(0)'
    }
  })
}, { threshold: 0.15 })
```

Appliquer à tous les éléments avec :
```css
initial: { opacity: 0, transform: 'translateY(40px)', transition: 'opacity 0.9s ease, transform 0.9s ease' }
```

Délais progressifs pour les enfants d'une même section (0ms, 150ms, 300ms, 450ms...)

## MUSIQUE

Si musicUrl existe :
- Élément <audio> caché, autoplay, loop
- Sur mobile : bouton fixe discret en bas à gauche "♪" qui démarre la musique au tap
- Bouton 🔊/🔇 fixe en bas à droite (rond, fond accent semi-transparent)

## TYPOGRAPHIE

Importer ces Google Fonts :
- Great Vibes : prénoms, monogramme, chiffres compte à rebours
- Playfair Display : titres uppercase
- Cormorant Garamond : tout le texte courant, dates, adresses
- Pour l'hébreu : laisser la font système (David CLM ou Arial Hebrew)

## RESPONSIVE

Sur mobile (< 480px) :
- Réduire Great Vibes de 64px → 52px pour les prénoms
- Ornements plus petits (70% de la taille desktop)
- Padding horizontal 24px

Faire git add -A && git commit -m "Refonte totale vue partagée - page unique animée luxury" && git push