# BRIEF COMPOSITION — Pack Luxe Lov'it (rendu type Esther & Mendel)

> **Diagnostic en une phrase :** aujourd'hui Lov'it Luxe = 1 aquarelle de fond pour TOUTE la carte.
> La cible (Esther & Mendel) = 1 aquarelle DIFFÉRENTE en bandeau pour CHAQUE cérémonie + petits motifs entre.
>
> Ce brief décrit LA STRUCTURE de rendu à implémenter. Il complète les briefs précédents
> (Intégration Replicate v1, EXTENSION Multi-illustrations + motifs, Pack Luxe 99€).

---

## ⚠️ RÈGLES DE SÉCURITÉ (toujours)
1. Ne pas casser le Pack Premium ni l'existant.
2. Cette composition est **réservée au Pack Luxe** (`plan === "luxe"`).
3. Branche : `feature/composition-luxe`, étape par étape, validation à chaque fois.
4. Feature flag : `ENABLE_LUXE_COMPOSITION`. Off = ancien rendu (1 fond).

---

## 🎯 LE PRINCIPE DE COMPOSITION (le secret du rendu Esther & Mendel)

Le faire-part Luxe n'est PAS une carte. C'est une **histoire** qui se déroule en faisant défiler.
Chaque cérémonie est une **section autonome** composée comme ça :

```
┌──────────────────────────────────────────┐
│  AQUARELLE DE LA CÉRÉMONIE                │  ← bandeau pleine largeur, scène spécifique
│  (banner, height ≈ 200-280px)             │     au lieu de cette cérémonie précise
└──────────────────────────────────────────┘
        TITRE DE LA CÉRÉMONIE                   ← Playfair Display, MAJUSCULES espacées
                                                  (taille ≈ 22px, letter-spacing 6px)

        Phrase d'invitation italique            ← Cormorant Garamond italique
        Prénoms calligraphiés                   ← Great Vibes
        Date · Heure · Lieu                     ← Playfair Display caps espacées
                                                  + lieu en bold + adresse en italique

┌──────────────────────────────────────────┐
│            MOTIF DÉCORATIF                  │  ← petit PNG détouré (avion, bagues,
│         (height ≈ 60-80px)                  │     colombes, glycine…) centré
└──────────────────────────────────────────┘

┌──────────────────────────────────────────┐
│  AQUARELLE DE LA CÉRÉMONIE SUIVANTE         │  ← idem, scène différente
│  ...                                         │
```

**Trois règles d'or :**
1. **UNE AQUARELLE PAR CÉRÉMONIE**, pas une seule globale.
2. **L'AQUARELLE EST EN BANDEAU PLEINE LARGEUR**, pas un petit élément perdu.
3. **DES MOTIFS DÉTOURÉS ENTRE LES SECTIONS** créent le rythme storybook.

---

## 🧩 LES SECTIONS À COMPOSER (dans l'ordre)

À partir des données du faire-part (`wedding.ceremonies[]`, `wedding.coverData`), génère
ces sections automatiquement, dans cet ordre :

### 1. COVER (page d'ouverture)
- **Aquarelle** : portail / entrée / vue d'ensemble du lieu principal
- **Texte au-dessous** : prénoms en grande calligraphie + nom du domaine + dates globales
  + CTA « OUVRIR L'INVITATION »

### 2. POUR CHAQUE CÉRÉMONIE de `wedding.ceremonies[]`
- **Titre cérémonie** au-dessus (LA MAIRIE, LA HOUPPA, LE HENNÉ, LE SHABBAT, LE SAMEDI MIDI, etc.)
- **Aquarelle banner** : scène générée pour cette cérémonie précise (lieu + type)
- **Texte de la cérémonie** au-dessous (familles, phrase d'invitation, prénoms, date, heure, lieu, adresse)
- **Pour LA HOUPPA spécifiquement** : intégrer les éléments juifs (בס״ד, קול ששון וקול שמחה, prénoms hébreux, mémorial ז״ל)
- **Motif décoratif détouré** APRÈS chaque section (sauf la dernière) :
  - Après Mairie → avion (si voyage) OU colombes
  - Après Houppa → bagues OU couronne de fleurs
  - Après Henné → main de Fatma stylisée OU coupes de champagne
  - Après Shabbat → bougies OU pain (challah)
  - Après Samedi midi → cocktail OU bouquet

### 3. INFOS PRATIQUES (dernière section)
- Aquarelle plus petite ou motif (carte stylisée du domaine, voiture…)
- Texte : accès, transport, hébergement

### 4. RSVP (bloc final coloré)
- Pas d'aquarelle : un bloc coloré pleine largeur dans la teinte principale de la palette
- Titre « À VOUS DE NOUS DIRE » + « Oui ! » en calligraphie + bouton « CONFIRMER MA PRÉSENCE »

---

## 🎨 PALETTES (cohérence stricte par faire-part)

Une fois la palette choisie en début de Luxe, **toutes les aquarelles ET toutes les sections
de texte ET le bloc RSVP utilisent cette même palette**. JAMAIS mélanger.

| Palette | Couleur principale | Fond crème | Couleur accent | Couleur RSVP |
|---|---|---|---|---|
| Lavande | #4A2576 / #5A2D8C | #F8F5FD | #9B6FD0 | #5A2D8C |
| Rosé poudré | #993556 | #FDF7F8 | #D4537E | #993556 |
| Vert sauge | #3B6D11 | #F7FAF1 | #97C459 | #3B6D11 |
| Bleu nuit | #185FA5 | #F5F9FD | #85B7EB | #042C53 |

---

## ✍️ TYPOGRAPHIE COHÉRENTE (toute la carte)

- **Titres de section** (LA HOUPPA, etc.) : Playfair Display, taille 22px, letter-spacing 6px, MAJUSCULES, couleur principale palette.
- **Prénoms des mariés** : Great Vibes, taille 32-48px selon contexte, couleur principale.
- **Phrases d'invitation** : Cormorant Garamond Italic, taille 13px, couleur secondaire.
- **Dates / heures / labels** : Playfair Display caps, letter-spacing 1.5px, taille 12px.
- **Adresses / petits textes** : Cormorant Garamond Italic, taille 12px.
- **Hébreu** : Frank Ruhl Libre (ou serif RTL), direction:rtl. JAMAIS sur 2 lignes pour « קול ששון וקול שמחה ».

---

## 📋 ÉTAPES D'IMPLÉMENTATION (validation à chaque)

### Étape 1 — Modèle de composition (data)
- Type `LuxeComposition = { sections: LuxeSection[] }`
- Type `LuxeSection = { kind: "cover" | "ceremony" | "infos" | "rsvp"; ceremonyId?; sceneUrl?; motifAfterUrl? }`
- Fonction `buildLuxeComposition(wedding)` qui construit la composition à partir des cérémonies.
- Stop, validation.

### Étape 2 — Génération de TOUTES les scènes en une fois
- Au moment où la mariée valide sa palette (étape 5.a du brief Pack Luxe), pour CHAQUE cérémonie :
  - Appelle `/api/generate-scene` avec `{ ambiance: <type>, palette, freeText: <lieu> }` → 4 options par cérémonie.
- Présente une **grille par cérémonie** : la mariée passe en revue **toutes les cérémonies**, choisit une scène pour chacune.
- Pas de scène pour Mairie ? Skip cette cérémonie ou laisser un fallback minimal sans bandeau.
- Stop, validation.

### Étape 3 — Génération automatique des motifs entre sections
- Pour chaque "séparateur" entre cérémonies, suggère un motif par défaut (cf. liste ci-dessus).
- La mariée peut : **garder le défaut**, **changer** (avec sélection dans la bibliothèque ou texte libre), ou **supprimer**.
- Génération via `/api/generate-motif` avec détourage. Toujours 4 options à choisir.
- Stop, validation.

### Étape 4 — Composant de rendu `<LuxeFairePartRenderer />`
Crée le composant qui rend la composition. Structure de base :

```tsx
<div className="luxe-fairepart" style={{ background: palette.cream }}>
  {composition.sections.map((s, i) => (
    <React.Fragment key={i}>
      {s.kind === "cover" && <CoverSection wedding={wedding} sceneUrl={s.sceneUrl} palette={palette} />}
      {s.kind === "ceremony" && <CeremonySection ceremony={s.ceremony} sceneUrl={s.sceneUrl} palette={palette} />}
      {s.kind === "infos" && <InfosSection wedding={wedding} palette={palette} />}
      {s.kind === "rsvp" && <RsvpSection palette={palette} />}
      {s.motifAfterUrl && i < composition.sections.length - 1 && (
        <Motif url={s.motifAfterUrl} />
      )}
    </React.Fragment>
  ))}
</div>
```

Chaque `Section` enchaîne :
- une `<div>` aquarelle pleine largeur (height ≈ 200-280px, `background-image` ou `<img>`)
- un bloc texte centré dessous (padding ≈ 24px), typographies ci-dessus
- Le `<Motif>` est un petit `<img>` détouré, centré, 50-80px de haut.
- Stop, validation.

### Étape 5 — Édition (DraggableElement)
- Chaque section reste éditable : la mariée peut **swapper la scène** (régénérer 4 options), **changer le motif**, **réordonner les sections**, ou **supprimer une section**.
- Réutilise le système `DraggableElement` existant.
- Stop, validation.

### Étape 6 — Garde-fous qualité
- **Détecte les aquarelles ratées** : si Replicate sort un template à texte/œil (cf. l'incident), on log un warning + on n'affiche pas cette option à la mariée (filtrage côté API : à étudier — un check basique sur les dimensions ou un score IA est trop complexe, mais on peut au moins demander 4 options et laisser la mariée filtrer).
- **Toujours générer 4 options pour les scènes ET pour les motifs.**
- **Coût** : pour 5 cérémonies × 4 options = 20 générations par faire-part luxe. À ~0,03€/img sur flux-dev = ~0,60€ de coût Replicate par tentative complète. Prévoir un **quota de régénérations** (ex. 3 tentatives de régénération par scène) pour ne pas qu'une mariée brûle 50€ avant achat.
- Stop, validation.

### Étape 7 — Tests finaux
- Faire-part Premium : strictement inchangé.
- Faire-part Luxe : rendu = structure multi-sections type Esther & Mendel.
- Faire-parts existants : intacts (ils n'ont pas de `composition`, fallback ancien rendu OK).
- Sur mobile : chaque bandeau scène reste lisible, les motifs ne sont pas trop gros.
- Hébreu impeccable partout (jamais cassé par l'IA).

---

## 💡 PRINCIPES DE MISE EN PAGE (les "non-négociables" du beau)

- **L'aquarelle doit déborder visuellement** : `width: 100%`, `object-fit: cover`. Jamais un petit timbre.
- **Beaucoup d'AIR autour du texte** : padding généreux (24-32px) entre les blocs.
- **Texte JAMAIS sur l'aquarelle** : le texte se met TOUJOURS dans un bloc SOUS l'aquarelle (sauf le bloc COVER, où le titre peut overlap si bien géré).
- **Hiérarchie typographique stricte** : 3 tailles max par section (titre / prénoms / détails).
- **Une seule palette par faire-part** — strictement.
- **Pas de bordures épaisses ni d'ombres** : c'est du papier aquarelle, pas une UI app.

---

## 🚀 OBJECTIF DE RENDU
Quand on scrolle un faire-part Luxe finalisé, on doit ressentir qu'on **traverse le mariage**.
On voit le portail → on entre → la Mairie → un avion (voyage) → la plage de la Houppa →
les bagues → la pergola du Samedi midi → l'invitation à répondre.
**Ce n'est pas une carte. C'est un voyage.**

C'est ÇA qui vaut 99€.
