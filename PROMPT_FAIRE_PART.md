Résous le problème d'accès à la carte côté mariés :

1. SAUVEGARDE LOCALE : Dans app/faire-part/page.tsx, quand les mariés génèrent leur faire-part, sauvegarder automatiquement les données dans localStorage avec la clé "wedding-draft". Au chargement de la page (sans paramètre ?share=), vérifier si un brouillon existe dans localStorage et proposer un bouton "Reprendre mon faire-part" sur l'écran d'accueil.

2. LIEN MARIÉS : Quand les mariés cliquent "Partager", générer DEUX liens :
- "Lien pour les invités" : ?share=[id]&role=guest → carte + RSVP uniquement
- "Lien mariés" : ?share=[id]&role=couple → carte + bouton "Voir les RSVP" + bouton "Partager aux invités"

Afficher ces deux liens clairement dans une modal après avoir cliqué Partager :
- Titre "Votre faire-part est prêt !"
- Section "Partagez à vos invités" avec le lien guest + bouton copier
- Section "Votre lien mariés" avec le lien couple + bouton copier
- Explication : "Gardez précieusement votre lien mariés pour accéder aux RSVP"

3. VUE COUPLE : Quand role=couple dans l'URL, afficher la carte + un bouton "Voir les RSVP" en bas. Pas de bouton Modifier ni Nouveau.


Ajoute un système de notifications email pour les mariés :

1. FORMULAIRE Step4 : Ajoute un champ "Votre email" avec label "Recevez une notification à chaque RSVP". Stocker dans formData.emailMaries. Sauvegarder cet email dans Redis avec le shareId.

2. ROUTE /api/rsvp : Après avoir sauvegardé la réponse RSVP, envoyer un email aux mariés via Resend (npm install resend). 

L'email doit être élégant avec :
- Objet : "[Prénom invité] a répondu à votre faire-part"
- Corps HTML élégant avec fond rose poudré #fdf0f3 et texte doré :
  * "Bonne nouvelle ! [Nom invité] a répondu à votre faire-part"
  * Pour chaque événement : nom cérémonie, présent/absent, nb personnes
  * Le petit mot de l'invité si renseigné
  * Lien "Voir tous les RSVP" qui pointe vers le lien mariés

3. ROUTE /api/save-share : Sauvegarder aussi emailMaries dans Redis sous la clé "email:[shareId]"

4. ROUTE /api/get-rsvp : Retourner aussi le résumé complet pour le dashboard

Pour Resend : utilise process.env.RESEND_API_KEY. Je créerai le compte Resend après.

Faire git add -A && git commit -m "Lien mariés vs invités + sauvegarde locale" && git push\