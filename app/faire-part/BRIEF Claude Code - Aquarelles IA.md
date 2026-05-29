# BRIEF POUR CLAUDE CODE — Génération d'aquarelles IA dans Lov'it

> **Comment l'utiliser :** ouvre ton projet Lov'it dans Claude Code, puis copie-colle
> ce brief en lui disant : « Voici un brief détaillé. Lis-le en entier, propose-moi un
> plan, et n'exécute QUE étape par étape en me demandant validation à chaque étape. »

---

## ⚠️ RÈGLES DE SÉCURITÉ — À RESPECTER ABSOLUMENT (lis-les en premier)

1. **NE RIEN CASSER de l'existant.** Tout le code de génération d'aquarelle doit être
   AJOUTÉ dans de nouveaux fichiers. Ne modifie aucun composant existant, sauf le seul
   point d'insertion décrit à l'Étape 5 (et de façon purement additive).
2. **Travaille sur une nouvelle branche git** : `git checkout -b feature/aquarelles-ia`.
   Ne commit jamais directement sur main.
3. **Procède étape par étape.** Après CHAQUE étape : arrête-toi, montre le diff,
   attends ma validation, vérifie que l'app démarre toujours (`npm run dev`) avant de continuer.
4. **Feature flag.** Toute la fonctionnalité est derrière un flag `ENABLE_AI_WATERCOLOR`.
   Si le flag est off, l'app se comporte EXACTEMENT comme avant.
5. **Le token Replicate ne doit JAMAIS apparaître côté client.** Il reste uniquement
   côté serveur (route API), lu depuis une variable d'environnement.
6. **Ne touche pas** à la logique de rendu du texte du faire-part (surtout l'hébreu).
   L'IA ne génère QUE l'image de fond/illustration. Le texte reste géré par le code existant.
7. Si une étape risque de toucher à quelque chose d'existant : **demande-moi avant**.

---

## 🎯 OBJECTIF

Permettre à la mariée de générer une **aquarelle personnalisée selon son lieu de mariage**,
qui servira d'illustration/fond décoratif au faire-part. Le texte (français + hébreu)
reste posé par-dessus par le code Lov'it existant.

**Principe clé : l'IA peint le décor, l'app gère le texte.** L'IA ne produit jamais de texte.

**Flux utilisateur cible :**
1. La mariée choisit une **ambiance** (plage, château, jardin, salle de réception,
   synagogue, Israël, universel) + éventuellement saisit le **nom/type de son lieu** en texte libre,
   + choisit une **palette de couleur** (lavande, rosé poudré, vert sauge, bleu nuit…).
2. L'app appelle Replicate et génère **4 aquarelles**.
3. La mariée **choisit celle qu'elle préfère** (garde-fou essentiel : on ne place jamais
   une image auto, on laisse choisir — ça élimine les ratés).
4. L'app **stocke l'image choisie de façon permanente** et l'utilise comme illustration du faire-part.

---

## 🧰 STACK & OUTILS

- App : **Next.js (React)** — utilise l'App Router si présent (`app/`), sinon Pages Router (`pages/`).
- Génération d'images : **Replicate**, modèle **`black-forest-labs/flux-dev`**
  (excellent pour l'aquarelle, supporte `num_outputs` jusqu'à 4, bon rapport qualité/prix).
  - Alternative plus rapide/moins chère pour les tests : `black-forest-labs/flux-schnell`.
- Package npm officiel : **`replicate`**.

---

## 📋 ÉTAPES D'IMPLÉMENTATION (une par une, validation à chaque fois)

### Étape 0 — Préparation (ne change pas le code)
- Crée la branche : `git checkout -b feature/aquarelles-ia`.
- Installe le package : `npm install replicate`.
- Vérifie que l'app démarre toujours (`npm run dev`). Stop, montre-moi, attends validation.

### Étape 1 — Variables d'environnement (token sécurisé)
- Ajoute dans `.env.local` (et NON dans le code, et NON commité — vérifie qu'il est dans `.gitignore`) :
  ```
  REPLICATE_API_TOKEN=r8_xxxxxxxxxxxxxxxxxxxxx
  ENABLE_AI_WATERCOLOR=true
  ```
- Rappelle-moi d'ajouter aussi `REPLICATE_API_TOKEN` dans les variables d'environnement Vercel
  (Settings → Environment Variables) pour la production.
- Stop, validation.

### Étape 2 — La "recette" de prompt (fonction pure, testable)
- Crée `lib/watercolorPrompt.ts` avec une fonction qui construit le prompt à partir des
  choix de la mariée. Utilise EXACTEMENT cette recette (validée visuellement) :

```ts
type Ambiance = "plage" | "chateau" | "jardin" | "salle" | "synagogue" | "israel" | "universel";
type Palette = "lavande" | "rose" | "sauge" | "bleu_nuit";

const SCENES: Record<Ambiance, string> = {
  plage: "a Mediterranean beach wedding setup, turquoise calm sea, soft sand, granite rocks",
  chateau: "an elegant French château with romantic gardens",
  jardin: "a Provençal garden with olive trees, lavender and cascading wisteria",
  salle: "an elegant wedding reception hall with refined floral decoration",
  synagogue: "an elegant synagogue interior prepared for a wedding ceremony",
  israel: "a romantic Jerusalem stone landscape at golden hour",
  universel: "an elegant half-circle wedding arch of flowers and foliage on a soft cream background, no specific location",
};

const PALETTES: Record<Palette, string> = {
  lavande: "lavender, lilac and wisteria purple, cream, soft green, gentle turquoise accents",
  rose: "dusty rose, blush pink, cream, soft green",
  sauge: "sage green, eucalyptus, ivory, soft beige",
  bleu_nuit: "deep navy blue, periwinkle, silver, cream",
};

export function buildWatercolorPrompt(ambiance: Ambiance, palette: Palette, freeText?: string): string {
  const scene = SCENES[ambiance];
  const colors = PALETTES[palette];
  const extra = freeText ? `, inspired by: ${freeText}` : "";
  return [
    "A full-page hand-painted WATERCOLOR illustration filling the entire frame, fine art wedding style.",
    "NOT a poster, NOT a template, NO text, NO words, NO logo, NO icons, no solid color blocks.",
    `Scene: ${scene}${extra}.`,
    `Color palette: ${colors}.`,
    "Delicate watercolor with fine black ink linework, visible brush strokes, transparencies,",
    "soft romantic light, the painting fades softly toward the edges. Timeless elegance.",
  ].join(" ");
}

// Prompt négatif (pour les modèles qui le supportent) :
export const WATERCOLOR_NEGATIVE = "text, words, letters, logo, watermark, poster, template, frame, border, UI, flat vector, photo, 3d render";
```

- Stop, montre-moi la fonction, validation.

### Étape 3 — La route API serveur (le token reste ici)
- Crée `app/api/generate-watercolor/route.ts` (App Router). Si Pages Router : `pages/api/generate-watercolor.ts`.
- Cette route :
  - Vérifie `process.env.ENABLE_AI_WATERCOLOR === "true"`, sinon renvoie 404.
  - Lit `ambiance`, `palette`, `freeText` du body.
  - Construit le prompt via `buildWatercolorPrompt`.
  - Appelle Replicate `flux-dev` avec `num_outputs: 4`, `aspect_ratio: "2:3"` (portrait), `output_format: "png"`.
  - Renvoie un tableau de 4 URLs d'images.

```ts
import Replicate from "replicate";
import { buildWatercolorPrompt } from "@/lib/watercolorPrompt";

export async function POST(req: Request) {
  if (process.env.ENABLE_AI_WATERCOLOR !== "true") {
    return new Response("Not found", { status: 404 });
  }
  const { ambiance, palette, freeText } = await req.json();
  const replicate = new Replicate({ auth: process.env.REPLICATE_API_TOKEN });

  const output = await replicate.run("black-forest-labs/flux-dev", {
    input: {
      prompt: buildWatercolorPrompt(ambiance, palette, freeText),
      num_outputs: 4,
      aspect_ratio: "2:3",
      output_format: "png",
      output_quality: 90,
    },
  });

  // ⚠️ Selon la version du client `replicate`, `output` peut être un tableau de strings (URLs)
  // OU un tableau d'objets FileOutput. Gère les deux cas :
  const urls = (output as any[]).map((o) =>
    typeof o === "string" ? o : (typeof o?.url === "function" ? o.url() : String(o))
  );

  return Response.json({ images: urls });
}
```

- Teste la route seule (ex. via `curl` ou un fichier de test) AVANT de brancher l'UI.
- Stop, validation.

### Étape 4 — Stockage permanent de l'image choisie (IMPORTANT)
- ⚠️ **Les URLs Replicate expirent (~1h).** Quand la mariée choisit son aquarelle,
  il faut **télécharger l'image et la stocker durablement**.
- Utilise le système de stockage déjà présent dans Lov'it (regarde ce qui existe :
  Vercel Blob, Supabase Storage, S3, Cloudinary…). **Demande-moi lequel on utilise** si
  ce n'est pas évident dans le code.
- Crée une petite fonction qui, à la sélection : télécharge l'URL Replicate → upload dans
  notre stockage → renvoie l'URL permanente à enregistrer avec le faire-part.
- Stop, validation.

### Étape 5 — UI : choix + génération + sélection (point d'insertion unique)
- Crée un nouveau composant isolé `components/WatercolorGenerator.tsx` :
  - Sélecteurs : ambiance, palette, champ texte libre (lieu).
  - Bouton « Générer mes aquarelles » → appelle `/api/generate-watercolor`.
  - Affiche les **4 images** en grille, état de chargement, gestion d'erreur.
  - La mariée clique pour **choisir** → déclenche le stockage permanent (Étape 4) → renvoie
    l'URL finale via un callback `onSelect(url)`.
- Intègre ce composant dans l'éditeur de faire-part existant **de façon additive uniquement**
  (ex. un nouvel onglet/section « Illustration »), derrière le feature flag. Ne déplace ni
  ne modifie les sections existantes.
- L'illustration choisie est stockée dans le modèle de données du faire-part comme un champ
  **optionnel** `illustrationUrl` (nouveau champ, ne casse pas les faire-parts existants).
- Stop, validation.

### Étape 6 — Affichage de l'illustration dans le faire-part (calque sous le texte)
- Là où le faire-part est rendu, ajoute l'affichage de `illustrationUrl` **en fond/bandeau
  décoratif, SOUS le calque texte existant**. Si `illustrationUrl` est vide → comportement
  inchangé (rien ne s'affiche). Le rendu du texte (et de l'hébreu) n'est pas modifié.
- Stop, validation.

### Étape 7 — Tests & vérification finale
- Vérifie : app démarre, flag off = comportement identique à avant, flag on = nouvelle section
  fonctionne, faire-parts existants non impactés (champ optionnel), token absent du bundle client
  (cherche "r8_" dans le build client → doit être introuvable).
- Montre-moi un récap des fichiers créés/modifiés avant tout merge.

---

## 💡 PARAMÈTRES & ASTUCES

- **Ratio** : `2:3` (portrait) convient bien à un faire-part. Ajustable.
- **Coût** : flux-dev ≈ quelques centimes pour 4 images. Pense à prévoir une limite
  (ex. X générations gratuites par faire-part) plus tard.
- **Cohérence** : garder la même palette pour toutes les illustrations d'un même faire-part.
- **Qualité** : toujours générer 4 options et laisser choisir (jamais auto-placer).
- **Aucun texte de l'IA** : le prompt l'interdit déjà ; le texte du faire-part reste 100% géré
  par le code Lov'it (garantie hébreu parfait).

---

## ✅ DÉFINITION DE "TERMINÉ"
- [ ] L'app démarre et fonctionne comme avant quand le flag est off.
- [ ] La mariée peut générer 4 aquarelles selon son lieu/ambiance/palette.
- [ ] Elle peut en choisir une, qui est stockée durablement.
- [ ] L'aquarelle s'affiche en fond, le texte (hébreu inclus) reste parfait par-dessus.
- [ ] Aucun fichier existant cassé ; le token n'est jamais exposé côté client.
- [ ] Tout est sur la branche `feature/aquarelles-ia`, prêt pour relecture avant merge.
