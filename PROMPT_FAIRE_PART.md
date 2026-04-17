Fais ces 2 améliorations dans app/faire-part/page.tsx :

1. PLUSIEURS PHOTOS : Dans Step4, remplace l'upload d'une seule photo par un upload multiple (max 5 photos). Affiche les miniatures avec un bouton X pour supprimer chaque photo. Stocke un tableau photosFond: string[] dans formData. Dans les cartes, chaque cérémonie utilise la photo correspondant à son index (ceremonies[0] → photos[0], etc.). Si moins de photos que de cérémonies, utilise la dernière photo disponible. Si aucune photo, fond uni selon le thème.

2. MUSIQUE via Cloudinary : Dans Step4, ajoute un bouton "Uploader ma musique" qui permet d'uploader un fichier MP3 directement vers Cloudinary. Utilise l'API Cloudinary unsigned upload avec cloud_name "wedding-app-music" (je créerai le compte après). L'URL du fichier audio est stockée dans formData.musicUrl. Sur la carte faire-part en vue partagée, un élément HTML5 <audio> avec autoplay loop joue la musique en fond. Sur mobile iOS, affiche un bouton élégant "♪ Lancer la musique" en bas de l'écran. Un bouton 🔊/🔇 fixe en bas à droite permet de couper le son.

Faire git add -A && git commit -m "Multi photos + musique Cloudinary" && git push