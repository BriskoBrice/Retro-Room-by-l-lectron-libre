# Retro Room by L’électron libre

**RetroRoom V6.25.1 CLEAN** est la version publique actuelle : une chambre retrogaming 3D immersive inspirée des années 90, avec bibliothèque ROM, contrôles tactiles et émulation multi-systèmes via EmulatorJS.

## Utilisation

1. Télécharge `index.html` ou le dépôt complet.
2. Ouvre `index.html` dans un navigateur moderne avec une connexion Internet : RetroRoom charge certains moteurs et fichiers de support depuis des CDN publics.
3. Ouvre **BIBLIO**, puis sélectionne ton dossier de ROMs.
4. Pour les systèmes qui en ont besoin, sélectionne séparément ton dossier **BIOS**.

Les ROMs et BIOS ne sont pas fournis dans ce dépôt.

## 3DO

La 3DO utilise le core Opera. RetroRoom gère les jeux au format **CUE + BIN**, injecte les BIN référencés par le CUE et utilise un BIOS Opera sélectionné depuis le dossier BIOS. La région est choisie automatiquement avec un repli sûr sur NTSC quand le nom du jeu ne permet pas de conclure.

La disposition tactile 3DO a été ajustée pour Android. `Super Street Fighter II Turbo` reçoit automatiquement sa disposition combat 6 boutons et son réglage de performance dédié.

## Contrôles tactiles

Les croix numériques utilisent un **D-pad 8 directions glissable**, diagonales comprises, afin de permettre les quarts de cercle, demi-cercles et autres combinaisons des jeux de combat. Les profils réellement analogiques conservent leur logique dédiée.

## État de V6.25.1 CLEAN

- interface de diagnostic et logs de développement retirés ;
- bouton TEST ROM expérimental retiré ;
- bibliothèque et sélection BIOS séparées ;
- la bibliothèque s’ouvre désormais toujours sur **TOUS** après chargement ou rescan ;
- chaîne 3DO CUE/BIN + BIOS validée ;
- région 3DO automatique ;
- ergonomie du bouton C 3DO corrigée ;
- D-pad numérique 8 directions généralisé ;
- aucune ROM ni aucun BIOS distribué.

Le fichier `RELEASE_SHA256.txt` permet de vérifier l'intégrité de la version publique.
