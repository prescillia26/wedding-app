Dans app/faire-part/page.tsx, dans le composant CardHouppa, corriger l'affichage des familles. Actuellement seul le père d'un côté et la mère de l'autre s'affichent. Il faut afficher :

Colonne GAUCHE (famille de la mariée) :
- data.famille1Pere
- data.famille1Mere  
- data.famille1GpPaternels
- data.famille1GpMaternels

Colonne DROITE (famille du marié) :
- data.famille2Pere
- data.famille2Mere
- data.famille2GpPaternels
- data.famille2GpMaternels

Chaque ligne ne doit s'afficher que si le champ est rempli (pas de ligne vide). Les deux colonnes doivent être visibles en entier, pas tronquées.

Faire git add -A && git commit -m "Fix noms parents" && git push après.