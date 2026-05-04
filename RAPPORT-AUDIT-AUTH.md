# Rapport d'audit — Authentification, Sauvegarde et Multi-appareils

**Date** : 4 mai 2026

---

## TEST 1 — Inscription + Paiement ✅

**Flow tracé** : `/paiement` → Stripe → `/succes?session_id=xxx` → `/api/verify-payment`

- Le paiement crée un compte user dans Redis (sans mot de passe)
- Un magic link (24h) est généré et envoyé par email (Resend, noreply@getlovit.fr)
- Une session est automatiquement créée (cookie `lovit_session`, 30 jours)
- La page `/succes` propose de définir un mot de passe immédiatement
- Pas de demande de mdp obligatoire — connexion automatique via session

**Statut** : ✅ Fonctionnel

---

## TEST 2 — Définir un mot de passe ✅

**Flow tracé** : `/auth/definir-mot-de-passe?token=xxx`

- Le token magic link est vérifié via `/api/auth/verify`
- Le mot de passe est hashé avec bcrypt (12 rounds) et stocké dans Redis
- `needsPassword` passe à `false`
- Confirmation visuelle après sauvegarde, redirection auto

**Statut** : ✅ Fonctionnel

---

## TEST 3 — Déconnexion 🔧

**Flow tracé** : Bouton Déconnexion → `/api/auth/logout` → côté client

- Session Redis détruite ✅
- Cookie `lovit_session` supprimé (maxAge: 0) ✅
- localStorage nettoyé (wedding-draft, lovit_access_code, lovit_share_id, lovit_user_email) ✅ *(fixé dans commit précédent)*

**Bug trouvé et corrigé** : Redirection vers `/connexion` → changé vers `/`

**Statut** : 🔧 Corrigé

---

## TEST 4 — Reconnexion avec mot de passe ✅

**Flow tracé** : `/connexion` → `/api/auth/login`

- Rate limiting : 3 tentatives/min par email ✅
- Vérification bcrypt du mot de passe ✅
- Création session + redirection `/mon-espace` ✅
- L'email est comparé au localStorage pour nettoyer les données d'un autre compte ✅

**Statut** : ✅ Fonctionnel

---

## TEST 5 — Mot de passe oublié ✅

**Flow tracé** : `/auth/mot-de-passe-oublie` → `/api/auth/magic-link`

- Rate limiting ajouté : 5 demandes/min par email ✅
- Email envoyé avec magic link (15 min de validité) ✅
- Ne révèle pas si l'email existe (`{ ok: true }` dans tous les cas) ✅
- Magic link reconnecte et permet de redéfinir un mdp ✅

**Statut** : ✅ Fonctionnel

---

## TEST 6 — Sauvegarde brouillon (même appareil) ✅

**Flow tracé** : Chaque modification dans le formulaire

- **localStorage** : sauvegarde immédiate à chaque changement ✅
- **Redis** : sauvegarde debounced (1s) via `/api/save-draft` si connecté ✅
- Indicateur "Sauvegardé à HH:MM" visible (localStorage) ✅
- Indicateur "Sauvegardé sur le serveur à HH:MM" visible (Redis) ✅
- Ownership vérifié côté serveur (`user.faireparts.includes(shareId)`) ✅

**Statut** : ✅ Fonctionnel

---

## TEST 7 — Sauvegarde multi-appareils ✅

**Flow tracé** : Connexion sur un autre appareil → `/api/auth/me` → `/api/get-draft`

- À la connexion, le dernier faire-part est chargé depuis Redis ✅
- Le brouillon serveur a priorité sur le localStorage ✅
- Ownership vérifié (`user.faireparts.includes(shareId)`) ✅
- Pas besoin du localStorage de l'autre appareil ✅

**Statut** : ✅ Fonctionnel

---

## TEST 8 — Protection croisée des comptes 🔧

**Flow tracé** : Compte A → déconnexion → Compte B sur même navigateur

- Déconnexion nettoie tout le localStorage Lov'it ✅ *(fixé précédemment)*
- À la connexion, comparaison `lovit_user_email` vs email du compte ✅ *(fixé précédemment)*
- Si différent, localStorage nettoyé ✅
- API `get-draft` vérifie ownership côté serveur ✅

**Statut** : 🔧 Corrigé (commits précédents)

---

## TEST 9 — Session expirée 🔧

**Flow tracé** : Session expire pendant l'édition

- localStorage continue de sauvegarder (indépendant de la session) ✅
- Le server save échoue silencieusement → ~~pas d'avertissement~~ ✅

**Bug trouvé et corrigé** : Si `/api/save-draft` retourne 401, un toast d'erreur s'affiche : "Session expirée — reconnectez-vous pour sauvegarder sur le serveur"

- Après reconnexion, le brouillon localStorage est toujours là ✅
- Le brouillon serveur reprend la sauvegarde automatique ✅

**Statut** : 🔧 Corrigé

---

## TEST 10 — Plusieurs faire-parts par compte ✅

**Flow tracé** : 2ème paiement → nouveau `access:code` → nouveau faire-part

- Chaque faire-part a un `shareId` unique ✅
- `user.faireparts` est un tableau qui contient tous les IDs ✅
- `/mon-espace` affiche tous les faire-parts du compte ✅
- Les RSVP sont stockés par shareId (`rsvp:{shareId}`) → séparés ✅
- Modifier l'un ne modifie pas l'autre (shareId différent) ✅

**Statut** : ✅ Fonctionnel

---

## TEST 11 — Partage et confidentialité ✅

**Flow tracé** : Lien partagé `/faire-part?share=xxx&role=guest`

- Invités voient le faire-part en lecture seule ✅
- Pas de bouton Modifier/Texte pour les invités (seulement `role=couple`) ✅
- `get-share` ne retourne que les données du faire-part demandé ✅
- Pas d'accès au dashboard, aux autres faire-parts, ou aux données du compte ✅
- Les UUIDs ne sont pas devinables (128 bits d'entropie) ✅

**Note** : `get-share` et `get-rsvp` n'ont pas d'auth — c'est **by design** car les invités n'ont pas de compte. La sécurité repose sur la non-devinabilité des UUIDs.

**Statut** : ✅ Fonctionnel

---

## TEST 12 — RSVP et notifications ✅

**Flow tracé** : Invité soumet RSVP → `/api/rsvp` → email notification

- RSVP sauvegardé dans Redis (`rsvp:{shareId}`) ✅
- Email de notification envoyé depuis `noreply@getlovit.fr` ✅
- Email contient le nom de l'invité, ses réponses par cérémonie ✅
- La mariée voit les RSVP dans son dashboard (`/mon-espace` → "Voir RSVP") ✅

**Statut** : ✅ Fonctionnel

---

## BUGS TROUVÉS ET CORRIGÉS

| # | Sévérité | Description | Commit |
|---|----------|-------------|--------|
| 1 | 🔴 Critique | `?dev=lovit2026` contourne le paiement en production | `6d28559` |
| 2 | 🟠 Important | Pas d'avertissement si session expirée pendant l'édition | `f53c418` |
| 3 | 🟠 Important | `save-share` : faire-parts sans ownerEmail non protégés | `f53c418` |
| 4 | 🟡 Mineur | Déconnexion redirigeait vers /connexion au lieu de / | `f53c418` |

---

## POINTS DE VIGILANCE (non corrigés, risque faible)

| # | Description | Risque | Recommandation |
|---|-------------|--------|----------------|
| 1 | Race condition sur rate limiting (non-atomique) | Faible — exploitable seulement avec des requêtes simultanées ultra-rapides | Utiliser Redis INCR atomique en V2 |
| 2 | `set-password` ne demande pas l'ancien mdp | Faible — nécessite une session active (cookie httpOnly) | Ajouter confirmation ancien mdp en V2 |
| 3 | `get-rsvp` accessible sans auth | By design — les invités n'ont pas de compte | Acceptable tant que les UUIDs sont non-devinables |
| 4 | Pas de limite de taille sur `save-draft` | Faible — seuls les utilisateurs connectés peuvent sauvegarder | Ajouter limite 900KB comme save-share en V2 |
