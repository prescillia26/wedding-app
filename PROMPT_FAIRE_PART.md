Ajoute un système RSVP complet à l'app :

1. Dans app/faire-part/page.tsx, ajoute un bouton "RSVP" doré en bas de chaque carte faire-part (visible uniquement en vue partagée, pas en vue créateur). Le bouton ouvre une modal élégante avec :
- Champ : Prénom et nom
- Boutons radio élégants : "Je serai présent(e) ✓" / "Je ne pourrai pas être là ✗"
- Champ nombre : Combien de personnes vous accompagnent ? (0 à 10)
- Champ texte : Un petit mot pour les mariés (optionnel)
- Bouton "Envoyer ma réponse" doré
- Après envoi : message de confirmation élégant

2. Crée app/api/rsvp/route.ts qui reçoit en POST : nom, presence (boolean), nbPersonnes, message, shareId. Sauvegarde dans /tmp/rsvp/[shareId].json en ajoutant chaque réponse au tableau existant.

3. Crée app/api/get-rsvp/route.ts qui reçoit en GET ?shareId=xxx et retourne toutes les réponses.

4. Dans app/faire-part/page.tsx, dans la vue créateur (pas partagée), ajoute un bouton "Voir les RSVP" qui affiche toutes les réponses reçues dans un tableau élégant : nom, présence (✓ ou ✗), nombre de personnes, message, avec le total des présents en bas.

Faire un git commit après.