Fais ces 4 corrections dans app/faire-part/page.tsx :

1. RSVP PAR ÉVÉNEMENT : Dans la modal RSVP, ajouter une section "À quel(s) événement(s) serez-vous présent(e) ?" avec une case à cocher par cérémonie (afficher le type et la date de chaque cérémonie). Envoyer les événements sélectionnés dans le POST /api/rsvp.

2. NOMS DES PARENTS : Dans CardHouppa, vérifier que les noms des parents s'affichent correctement des deux côtés. Côté gauche : père mariée, gp paternels mariée, gp maternels mariée. Côté droit : mère marié, gp paternels marié, gp maternels marié. S'assurer que les champs non remplis ne laissent pas de lignes vides.

3. ADRESSE AFTER MAIRIE : Dans CardMairie, le champ "evenementSuivant" doit afficher proprement : le nom de l'événement suivant en gras, puis l'adresse en italique. Dans le formulaire Step3, pour la Mairie, améliorer les deux champs : "Nom de l'événement suivant" et "Adresse de l'événement suivant" séparément au lieu d'un seul champ.

4. PLUSIEURS PHOTOS : Dans Step4, remplacer l'upload d'une seule photo par un upload multiple (max 5 photos). Les photos s'affichent en miniatures. Dans les cartes, chaque cérémonie utilise une photo différente selon son index, ou la première photo si pas assez de photos.


5. PARTAGE DU LIEN : Vérifier et corriger le bouton "Partager" dans la vue créateur. Il doit :
- Appeler /api/save-share en POST avec toutes les données
- Générer l'URL complète : https://wedding-e8t1cx1ei-prescwedding.vercel.app/faire-part?share=[id]
- Copier automatiquement dans le presse-papier
- Afficher "✓ Lien copié !" pendant 3 secondes
- Ce lien doit s'ouvrir directement sur la carte sans formulaire ni code d'accès

Aussi vérifier que /api/save-share et /api/get-share fonctionnent bien sur Vercel avec /tmp pour stocker les fichiers.
Faire git add -A && git commit -m "Fix feedback copine" && git push après.