# EXTENSION POUR CLAUDE CODE — Multi-illustrations + motifs

> **Contexte :** tu viens de terminer une 1re version qui génère UNE aquarelle de fond via
> Replicate (branche `feature/aquarelles-ia`, flag `ENABLE_AI_WATERCOLOR`, route
> `generate-watercolor`, composant `WatercolorGenerator`, champ `illustrationUrl`).
> On VEUT GARDER tout ça. Cette extension l'enrichit, **sans rien casser**.

---

## ⚠️ RÈGLES (identiques)
1. Ne casse pas la v1 ni l'existant. Tout en **additif**.
2. Continue sur la même branche (ou `feature/illustrations-ia` si tu préfères repartir propre).
3. **Étape par étape**, validation + `npm run dev` OK à chaque fois.
4. Token Replicate **serveur uniquement**. L'IA ne génère **jamais de texte** (hébreu géré par l'app).
5. Champs de données **optionnels** → faire-parts existants intacts.

---

## 🎯 CE QU'ON AJOUTE
La v1 = 1 aquarelle de fond. On veut maintenant **plusieurs illustrations** réparties dans
le faire-part, de **deux types** :

- **SCÈNES** : grandes illustrations, **une par cérémonie** (houppa, mairie, plage, grotte…).
  → tu as déjà la génération de scène (réutilise-la, généralise-la à plusieurs sections).
- **MOTIFS** : petits éléments isolés (avion, bagues, colombes, glycine…), **fond transparent**
  (générés puis **détourés**), à poser comme accents.

Placement : **auto malin (v1) + éditable** (la mariée déplace / redimensionne / supprime via le
système `DraggableElement` existant). L'IA "directrice artistique" complète = **plus tard (v2)**.

---

## 📋 ÉTAPES

### Étape A — Passer d'un champ unique à un TABLEAU d'illustrations (additif, non destructif)
- Garde `illustrationUrl` qui existe (pour ne rien casser).
- Ajoute un champ optionnel `illustrations: IllustrationElement[]` au faire-part :
```ts
type IllustrationKind = "scene" | "motif";
interface IllustrationElement {
  id: string;
  kind: IllustrationKind;
  url: string;            // URL permanente (après stockage)
  sectionId?: string;    // cérémonie/section rattachée
  x: number; y: number; width: number; height: number;
  rotation?: number; zIndex?: number;
}
```
- Si tu peux, fais que l'ancienne `illustrationUrl` soit lue comme un élément `scene` du tableau
  (rétrocompat). Sinon, garde les deux en parallèle. Stop, validation.

### Étape B — Recette de prompt pour les MOTIFS
- Dans le fichier de prompts existant, ajoute :
```ts
export function buildMotifPrompt(objet: string, palette: string): string {
  return [
    `A single small hand-painted WATERCOLOR illustration of ${objet},`,
    "centered, isolated on a plain pure white background, lots of empty white space.",
    "Fine black ink linework, delicate watercolor, visible brush strokes.",
    `Color palette: ${palette}.`,
    "NO text, NO words, NO logo, NO frame, NO shadow. Just the object.",
  ].join(" ");
}
```
- Stop, validation.

### Étape C — Route API motifs + DÉTOURAGE (fond transparent)
- Crée `app/api/generate-motif/route.ts` :
  1) génère 4 motifs sur fond blanc via `flux-dev` (`aspect_ratio: "1:1"`),
  2) **détoure** chacun via un modèle background-removal Replicate
     (ex. `851-labs/background-remover` — **confirme-moi le modèle et son format avant de finaliser**),
  3) renvoie 4 PNG transparents.
- Teste la route seule (vérifie la transparence). Stop, validation.

### Étape D — Stockage permanent (réutilise la v1)
- Réutilise la fonction de stockage déjà créée en v1 pour stocker aussi les motifs et les scènes
  multiples (URLs Replicate expirent ~1h). Stop, validation.

### Étape E — Placement auto malin
- Crée `lib/autoLayout.ts` : positionne par défaut une **scène** en haut de chaque cérémonie et
  les **motifs** en accents/séparateurs. Réutilise les conventions de `DraggableElement`.
- Stop, validation.

### Étape F — UI
- Généralise `WatercolorGenerator` pour générer une **scène par section** (pas une seule globale).
- Ajoute `MotifGenerator` : champ texte (« un avion ») → 4 motifs → la mariée choisit.
- Chaque illustration choisie devient un `DraggableElement` (déplacer/redimensionner/supprimer).
- Intégration **additive** dans l'éditeur (onglet « Illustrations »), derrière le flag.
- Stop, validation.

### Étape G — Rendu
- Affiche tous les éléments `illustrations` **sous le calque texte**. Vide → inchangé.
- Le rendu du texte (hébreu inclus) n'est pas modifié. Stop, validation.

### Étape H — Tests finaux
- Flag off = identique à avant ; faire-parts existants intacts ; token absent du client ;
  motifs bien transparents ; scènes sans texte. Récap des fichiers avant merge.

---

## 🔮 PLUS TARD (NE PAS CODER) — IA directrice artistique (v2)
Un LLM proposera la composition complète (quels éléments, où, quelle taille) à partir des
sections + du style. La mariée ajuste ensuite. Le placement auto malin sert de fallback.

## 💡 RAPPELS
- Toujours **4 options, la mariée choisit** (anti-ratés).
- Même palette pour tout un faire-part (cohérence).
- Scènes `2:3`, motifs `1:1` + transparence.
- L'IA = décor seulement. Texte/hébreu = code Lov'it.