# Retro Room by L’électron libre

**RetroRoom V6.26.2** est la version publique actuelle : une chambre retrogaming immersive inspirée des années 90, avec bibliothèque locale, contrôles tactiles adaptés aux systèmes et émulation multi-systèmes via EmulatorJS.

## Démarrage rapide

1. Télécharge `index.html` (ou le dépôt complet).
2. Ouvre `index.html` dans un navigateur moderne avec une connexion Internet : RetroRoom charge certains moteurs et fichiers de support depuis des CDN publics.
3. Ouvre **BIBLIO** puis touche **ROMS** et sélectionne ton dossier de jeux.
4. Si tes systèmes utilisent des BIOS, touche **BIOS** et sélectionne séparément ton dossier BIOS.
5. Lance un jeu depuis la bibliothèque. Pour changer de jeu : **QUITTER → BIBLIO → autre ROM**. La bibliothèque reste chargée tant que la page RetroRoom reste ouverte.

Les ROMs et BIOS ne sont pas fournis dans ce dépôt.

### Organisation des dossiers

Le nom du dossier racine n’est pas imposé : `ROM`, `ROMS`, `JEUX`, etc. fonctionnent. Des sous-dossiers explicites comme `PS1`, `3DO`, `N64`, `SNES`… améliorent la détection des formats ambigus.

Il est recommandé de garder le dossier **BIOS en dehors du dossier ROMS** : le scan des jeux est plus propre et Android/Chrome n’a pas à énumérer inutilement tous les BIOS pendant le scan ROM.

## Bibliothèque et scan

- scan optimisé à partir d’un seul snapshot du dossier ;
- images, vidéos et fichiers techniques ignorés très tôt ;
- la bibliothèque s’ouvre sur **TOUS** après chargement ou rescan ;
- favoris et récents disponibles ;
- sortie propre de l’émulateur sans recharger la page ;
- D-pad numérique 8 directions glissable pour les systèmes concernés.

Sur Android en mode fichier local (`content://`), les permissions de dossier restent soumises au navigateur. Après une fermeture/recharge complète de la page, il peut être nécessaire de sélectionner de nouveau le dossier ROMS. Une version Android native pourrait supprimer cette limite à l’avenir.

## PlayStation / PS1

RetroRoom gère les jeux PS1 en **CUE + BIN** comme un seul jeu dans la bibliothèque : les BIN référencés ne sont pas affichés en double mais restent montés pour l’émulation.

Les formats disque compatibles déjà pris en charge incluent notamment CUE/BIN, CHD, PBP, M3U et CCD selon le core utilisé.

Le gestionnaire BIOS reconnaît les BIOS PS1 courants et peut rechercher un BIOS compatible dans des fichiers bruts ainsi que dans des archives **ZIP, 7Z ou RAR**. Les fichiers auxiliaires PS1 ne sont pas affichés comme des jeux.

## 3DO

La 3DO utilise le core Opera. Les jeux **CUE + BIN** sont regroupés en une seule entrée et les BIN référencés sont montés automatiquement.

Le BIOS 3DO est sélectionné depuis le dossier BIOS séparé et la région est résolue automatiquement avec un repli sûr lorsque le nom du jeu ne permet pas de conclure.

La manette tactile 3DO utilise désormais une disposition unique pour tous les jeux :

`L · P · R`

`A · B · C`

avec **STOP** séparé. `P` correspond au bouton **PLAY** de la manette 3DO.

## Nintendo 64

Le profil N64 possède une vraie disposition dédiée : **D-pad + stick analogique tactile indépendant**, A/B, quatre boutons C, L/R/Z et Start. Le pad standard reste affiché au démarrage de RetroRoom et le profil N64 n’apparaît que lorsqu’un jeu N64 est sélectionné.

## État de V6.26.2

- FAST SCAN conservé ;
- CLEAN EXIT validé entre plusieurs systèmes sans rescan ;
- PS1 CUE/BIN corrigé pour lancer directement le disque ;
- BIOS PS1 + 3DO gérés depuis le sélecteur BIOS ;
- stick analogique N64 dédié ;
- disposition 3DO globale simplifiée ;
- aucune interface de diagnostic ou bouton TEST ROM de développement dans la release publique ;
- aucune ROM ni aucun BIOS distribué.

Le fichier `RELEASE_SHA256.txt` permet de vérifier l’intégrité du `index.html` public.
