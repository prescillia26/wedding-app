# AUDIT LOV'IT — Pré-lancement

**Date** : 4 mai 2026
**Auditeur** : Claude (IA)
**Périmètre** : Toutes les pages, API routes, emails, parcours utilisateur complet

---

## 1. RÉSUMÉ EXÉCUTIF

L'app est à **~75%** du niveau pro attendu pour un lancement public. Le produit fonctionne mais manque de polish. **Les 3 priorités absolues** : (1) harmoniser le langage (tutoiement/vouvoiement, inclusivité genrée), (2) ajouter les pages légales manquantes et un footer cohérent, (3) nettoyer les `console.log` et les `alert()` en production.

---

## 2. LISTE COMPLÈTE DES PROBLÈMES

### A. LANGAGE — Tutoiement vs Vouvoiement

| # | Sévérité | Description | Exemple précis | Fichier | Effort |
|---|----------|-------------|----------------|---------|--------|
| 1 | 🔴 Critique | Bouton "DÉCOUVRIR TON INVITATION" tutoie l'invité | `faire-part/page.tsx:4434` — `"DÉCOUVRIR TON INVITATION"` | `app/faire-part/page.tsx` | Petit |
| 2 | 🔴 Critique | Même action, autre bouton vouvoie : "Découvrir mon invitation" | `faire-part/page.tsx:4305` — `"Découvrir mon invitation ✦"` | `app/faire-part/page.tsx` | Petit |
| 3 | 🟠 Important | Page connexion : titre vouvoie, bouton tutoie | `"Connectez-vous"` (l.58) vs `"Me connecter"` (l.152) | `app/connexion/page.tsx` | Petit |
| 4 | 🟠 Important | Page définir MDP : titre vouvoie, bouton tutoie | `"Définissez votre mot de passe"` vs `"Définir mon mot de passe"` | `app/auth/definir-mot-de-passe/page.tsx` | Petit |
| 5 | 🟡 Souhaitable | Boutons dashboard mélangent "mon" et verbes neutres | `"Créer mon faire-part"` vs `"Modifier"` vs `"Partager"` | `app/mon-espace/page.tsx` | Petit |

**Recommandation** : Choisir le **vouvoiement** partout (plus pro, plus inclusif). Remplacer tous les "ton/ta/mon/ma" par "votre". Boutons : "Découvrir votre invitation", "Créer votre faire-part", "Votre espace".

---

### B. LANGAGE — Inclusivité (Genre)

| # | Sévérité | Description | Exemple précis | Fichier | Effort |
|---|----------|-------------|----------------|---------|--------|
| 6 | 🔴 Critique | Homepage : "Elles nous ont fait confiance" (féminin exclusif) | `page.tsx:206` — `"Elles nous ont fait confiance"` | `app/page.tsx` | Petit |
| 7 | 🔴 Critique | Homepage : "futures mariées" (exclut les hommes, couples gays) | `page.tsx:212` — `"Je recommande à toutes les futures mariées."` | `app/page.tsx` | Petit |
| 8 | 🔴 Critique | Paiement : "50 premières mariées" | `paiement/page.tsx:152` — `"50 premières mariées"` | `app/paiement/page.tsx` | Petit |
| 9 | 🟠 Important | Commentaires code : "la mariée" partout | `faire-part/page.tsx:5439` — `"pour que la mariée ne perde JAMAIS son travail si elle ferme l'onglet"` | `app/faire-part/page.tsx` | Petit |
| 10 | 🟠 Important | Commentaire API : "session pour la mariée" | `verify-payment/route.ts:69` — `"Créer une session automatiquement pour la mariée"` | `app/api/verify-payment/route.ts` | Petit |
| 11 | 🟡 Souhaitable | Champs DB : `marie1Prenom`, `marie2Prenom` (genré) | Interface FormData et toutes les API | `app/faire-part/page.tsx` | Gros |

**Recommandation** : Remplacer "mariées" → "couples" ou "futurs mariés", "Elles" → "Ils/Elles" ou "Nos clients". Les champs DB (`marie1Prenom`) sont coûteux à renommer (migration), à reporter en V2.

---

### C. LANGAGE — Contenu et ton

| # | Sévérité | Description | Exemple précis | Fichier | Effort |
|---|----------|-------------|----------------|---------|--------|
| 12 | 🟠 Important | Contradiction prix : homepage dit "valable à vie", paiement dit "1 an" | `page.tsx` vs `paiement/page.tsx:110` — `"accès pendant 1 an"` | Deux fichiers | Petit |
| 13 | 🟡 Souhaitable | Loading text tronqué "Envoi…" au lieu de "Envoi en cours…" | `connexion/page.tsx:100` | `app/connexion/page.tsx` | Petit |
| 14 | 🟡 Souhaitable | Email RSVP utilise des labels "mariee1" / "mariee2" dans le code | `rsvp/route.ts:59` | `app/api/rsvp/route.ts` | Petit |

---

### D. INCOHÉRENCES VISUELLES

| # | Sévérité | Description | Exemple précis | Fichier | Effort |
|---|----------|-------------|----------------|---------|--------|
| 15 | 🟠 Important | Couleur CREAM varie entre pages | `connexion` utilise `#fff8ed`, d'autres `#fdf0f3`, succes utilise `#fdf0f3` | Multiples | Petit |
| 16 | 🟠 Important | Loading states : juste du texte, pas de spinner/animation | `"Chargement…"` partout sans feedback visuel | Multiples | Moyen |
| 17 | 🟡 Souhaitable | Bouton logout n'a pas de changement visuel quand disabled | `mon-espace/page.tsx:118` — pas de style disabled | `app/mon-espace/page.tsx` | Petit |
| 18 | 🟡 Souhaitable | Grid du dashboard : `minmax(340, 1fr)` manque l'unité px | `mon-espace/page.tsx:153` — devrait être `340px` | `app/mon-espace/page.tsx` | Petit |
| 19 | 🟡 Souhaitable | Checkmark succès utilise HTML entity au lieu d'emoji | `succes/page.tsx:172` — `&#10003;` peut ne pas rendre partout | `app/succes/page.tsx` | Petit |

---

### E. INCOHÉRENCES UX

| # | Sévérité | Description | Exemple précis | Fichier | Effort |
|---|----------|-------------|----------------|---------|--------|
| 20 | 🟠 Important | Deux CTA sur homepage sans hiérarchie claire | `"Créer mon faire-part"` et `"Accéder à mon espace"` côte à côte | `app/page.tsx` | Petit |
| 21 | 🟠 Important | Pas de confirmation visuelle après "Lien copié" (juste alert) | `mon-espace/page.tsx:270` — `alert('Lien copié !')` | `app/mon-espace/page.tsx` | Moyen |
| 22 | 🟠 Important | Nom affiché = préfixe email si pas de faire-part | `mon-espace/page.tsx:81` — `data.email.split('@')[0]` | `app/mon-espace/page.tsx` | Petit |
| 23 | 🟡 Souhaitable | Pas de validation mot de passe en temps réel | Les erreurs n'apparaissent qu'au submit | `app/succes/page.tsx`, `definir-mot-de-passe` | Moyen |
| 24 | 🟡 Souhaitable | Pas de jauge de force du mot de passe | Juste "8 caractères min" sans feedback visuel | Multiples | Moyen |
| 25 | 🟡 Souhaitable | Pas de bouton "Renvoyer le lien" sur page MDP oublié | Si l'email n'arrive pas, l'utilisateur est bloqué | `app/auth/mot-de-passe-oublie/page.tsx` | Petit |
| 26 | 🟡 Souhaitable | Pas de bouton "Renvoyer" sur page de vérification magic link | `app/auth/verify/page.tsx` — erreur sans recours | `app/auth/verify/page.tsx` | Petit |

---

### F. PROBLÈMES TECHNIQUES

| # | Sévérité | Description | Exemple précis | Fichier | Effort |
|---|----------|-------------|----------------|---------|--------|
| 27 | 🔴 Critique | `console.log` en production (14+ instances) | `console.log('slug envoyé:', ...)` (l.4905), `console.error(...)` dans toutes les API | Multiples | Petit |
| 28 | 🔴 Critique | `JSON.parse` sans try/catch — crash si localStorage corrompu | `faire-part/page.tsx:5454` — `JSON.parse(draft) as FormData` | `app/faire-part/page.tsx` | Petit |
| 29 | 🟠 Important | `alert()` utilisé pour les erreurs (bloque le flow, amateur) | `alert('Erreur upload photo')` (l.904), `alert("Erreur lors de l'envoi")` (l.2512) | `app/faire-part/page.tsx` | Moyen |
| 30 | 🟠 Important | Erreurs silencieuses (30+ `catch { /* ignore */ }`) | Multiples dans faire-part, mon-espace, admin | Multiples | Moyen |
| 31 | 🟠 Important | Code d'accès stocké en sessionStorage — perdu si onglet fermé | `succes/page.tsx:39` — `sessionStorage.setItem(...)` | `app/succes/page.tsx` | Petit |
| 32 | 🟡 Souhaitable | Pas de validation email côté client (HTML5 only) | `connexion/page.tsx` — `type="email" required` mais pas de regex | `app/connexion/page.tsx` | Petit |

---

### G. SÉCURITÉ

| # | Sévérité | Description | Exemple précis | Fichier | Effort |
|---|----------|-------------|----------------|---------|--------|
| 33 | 🟠 Important | Pas de rate limiting sur `/api/check-promo` (brute force 6 chars) | Code promo = 6 caractères, aucune limite de tentatives | `app/api/check-promo/route.ts` | Moyen |
| 34 | 🟠 Important | Pas de rate limiting sur `/api/auth/magic-link` (spam email) | On peut demander 1000 magic links pour une même adresse | `app/api/auth/magic-link/route.ts` | Moyen |
| 35 | 🟠 Important | Pas de rate limiting sur `/api/auth/register` (spam comptes) | Création illimitée de comptes | `app/api/auth/register/route.ts` | Moyen |
| 36 | 🟡 Souhaitable | Input RSVP non sanitisé — injecté dans email HTML | `data.nom`, `data.message` utilisés directement dans le template HTML | `app/api/rsvp/route.ts` | Moyen |
| 37 | 🟡 Souhaitable | `Math.random()` pour génération de slugs (faible entropie) | `faire-part/page.tsx:389` — pas critique pour des slugs publics | `app/faire-part/page.tsx` | Petit |

---

### H. CE QUI MANQUE POUR ÊTRE PRO

| # | Sévérité | Description | Recommandation | Effort |
|---|----------|-------------|----------------|--------|
| 38 | 🔴 Critique | Pas de footer cohérent sur aucune page | Ajouter un footer global : Lov'it, Mentions légales, Contact, FAQ | Moyen |
| 39 | 🔴 Critique | Pas de page Contact | Ajouter `/contact` avec email et/ou formulaire | Moyen |
| 40 | 🟠 Important | Pas de FAQ dédiée | Ajouter `/faq` avec questions fréquentes | Moyen |
| 41 | 🟠 Important | Pages légales manquantes : Politique de confidentialité, CGV, Cookies | Liens dans mentions-legales pointent vers des pages inexistantes | Gros |
| 42 | 🟠 Important | Pas de garantie "Satisfait ou remboursé" sur la page paiement | Mentionné sur homepage mais absent de la page critique d'achat | Petit |
| 43 | 🟠 Important | Pas d'onboarding première utilisation | Après paiement, pas de guide "Étape 1/4" pour créer le faire-part | Gros |
| 44 | 🟡 Souhaitable | Pas d'indicateur de progression sur les faire-parts | Dashboard ne montre pas "50% complété" ou "Brouillon" | Moyen |
| 45 | 🟡 Souhaitable | Pas de toast/notification — que des `alert()` | Remplacer par des toasts élégants (style doré) | Moyen |
| 46 | 🟡 Souhaitable | Pas de duplication de faire-part | Pas de bouton "Dupliquer" pour créer un 2e faire-part similaire | Moyen |
| 47 | 🟡 Souhaitable | Pas d'export RSVP (CSV/Excel) depuis /mon-espace | Lib xlsx installée mais pas connectée au dashboard | Moyen |

---

### I. POSITIONNEMENT / IMAGE PRO

| # | Sévérité | Description | Recommandation | Effort |
|---|----------|-------------|----------------|--------|
| 48 | 🟠 Important | Témoignages probablement fictifs | `"Sophie & Thomas"`, `"Léa & Marc"` — ajouter des vrais avis ou retirer | Petit |
| 49 | 🟡 Souhaitable | Pas de démo/preview sans payer | Un aperçu gratuit donnerait confiance avant l'achat | Gros |
| 50 | 🟡 Souhaitable | Pas de vidéo de démonstration | Une vidéo 30s montrant le résultat final serait très vendeuse | Gros |

---

## 3. PRIORITÉS LANCEMENT (Top 10)

| Priorité | # | Description | Effort |
|----------|---|-------------|--------|
| **P1** | 6-8 | Neutraliser le langage genré ("mariées" → "couples") | Petit |
| **P2** | 1-2 | Harmoniser tutoiement → vouvoiement partout | Petit |
| **P3** | 27 | Supprimer tous les `console.log` / `console.error` en prod | Petit |
| **P4** | 28 | Ajouter try/catch au `JSON.parse` du localStorage | Petit |
| **P5** | 38 | Ajouter un footer global cohérent | Moyen |
| **P6** | 12 | Corriger la contradiction "à vie" vs "1 an" | Petit |
| **P7** | 15 | Harmoniser les couleurs CREAM entre pages | Petit |
| **P8** | 29,45 | Remplacer les `alert()` par des toasts élégants | Moyen |
| **P9** | 33-35 | Ajouter du rate limiting sur check-promo, magic-link, register | Moyen |
| **P10** | 42 | Ajouter "Satisfait ou remboursé" sur la page paiement | Petit |

---

## 4. POST-LANCEMENT (V1.1)

- Pages légales complètes (Politique de confidentialité, CGV, Cookies)
- Page Contact avec formulaire
- Page FAQ dédiée
- Onboarding première utilisation (guide interactif)
- Export RSVP en CSV/Excel depuis /mon-espace
- Indicateur de progression des faire-parts
- Duplication de faire-part
- Toast notifications à la place des alert()
- Validation mot de passe en temps réel + jauge de force
- Démo gratuite / preview sans payer
- Renommer les champs DB `marie1/marie2` → `prenom1/prenom2` (migration)
