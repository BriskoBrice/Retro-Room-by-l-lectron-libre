# Retro Room by L’électron libre

Chambre retrogaming 3D immersive 90s avec Three.js, EmulatorJS, LowRes NX et contrôles tactiles adaptatifs.

## État actuel — Final Test
- Émulation stable conservée (Game Gear, WonderSwan, CPS I testés).
- CPS II utilise par défaut le core FBA2012 CPS-2 pour compatibilité avec les romsets classiques, avec FBNeo disponible pour les romsets récents.
- Bibliothèque ROM : sélection d’un dossier complet, scan récursif, classement par système, recherche, choix automatique du core et de la manette.
- Le nom du dossier système a priorité sur le nom du fichier pour les archives ambiguës (ex. `Roms/gamegear/Arcade Classics.zip`).
- Interface mobile Android et CRT intégrée à la scène 3D.
- Vercel reste volontairement en pause pendant les tests locaux.

## Workflow
GitHub contient la version officielle du projet. Pour les tests Android, un fichier `RetroRoom_FINAL_TEST.html` est généré dans le chat et pointe vers un commit GitHub précis.
