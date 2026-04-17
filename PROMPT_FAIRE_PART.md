Vérifie et corrige complètement le système de partage dans app/faire-part/page.tsx et les routes API.

1. Vérifie que app/api/save-share/route.ts existe et fonctionne — il doit recevoir les données en POST, générer un id unique, sauvegarder dans /tmp/shares/[id].json et retourner { id }

2. Vérifie que app/api/get-share/route.ts existe — il doit recevoir ?id=xxx et retourner les données du faire-part

3. Dans la vue créateur, le bouton "Partager" doit :
- Appeler /api/save-share avec toutes les données formData
- Récupérer l'id retourné
- Construire l'URL : window.location.origin + "/faire-part?share=" + id
- Copier dans le presse-papier avec navigator.clipboard.writeText
- Afficher "✓ Lien copié !" pendant 3 secondes

4. Quand un invité ouvre le lien ?share=xxx :
- Charger les données via /api/get-share?id=xxx
- Afficher directement la carte sans formulaire ni code d'accès
- Afficher le bouton RSVP en bas

Faire git add -A && git commit -m "Fix lien partage invités" && git push