# Retro Room by L’électron libre

**RetroRoom V6.27.5** est la version publique actuelle : une chambre retrogaming immersive inspirée des années 90, avec bibliothèque locale, contrôles tactiles adaptés aux systèmes et émulation multi-systèmes via EmulatorJS.

## Démarrage rapide

1. Télécharge `index.html` (ou le dépôt complet).
2. Ouvre `index.html` dans un navigateur moderne avec une connexion Internet : RetroRoom charge certains moteurs et fichiers de support depuis des CDN publics.
3. Ouvre **BIBLIO**, touche **ROMS** et sélectionne ton dossier de jeux.
4. Si tes systèmes utilisent des BIOS, touche **BIOS** et sélectionne séparément ton dossier BIOS.
5. Lance un jeu depuis la bibliothèque. Pour changer de jeu : **QUITTER → BIBLIO → autre ROM**. La bibliothèque reste chargée tant que la page RetroRoom reste ouverte.

Les ROMs et BIOS ne sont pas fournis dans ce dépôt.

## Organisation des dossiers

Le nom du dossier racine n’est pas imposé : `ROM`, `ROMS`, `JEUX`, etc. fonctionnent.

RetroRoom connaît un large catalogue de noms de dossiers compatibles avec la structure créée par **ES-DE**. Un dossier système vide ne s’affiche pas : `systeminfo.txt`, `systems.txt`, `.nomedia`, images, vidéos et autres fichiers techniques ne comptent jamais comme jeux. Un système apparaît uniquement lorsqu’au moins une vraie ROM compatible est détectée.

Il est recommandé de garder le dossier **BIOS en dehors du dossier ROMS** : le scan des jeux est plus propre et Android/Chrome n’a pas à énumérer inutilement tous les BIOS pendant le scan ROM.

## Bibliothèque et scan

- FAST SCAN à partir d’un seul snapshot du dossier ;
- détection prioritaire par dossier système, puis extension en secours ;
- images, vidéos, fichiers techniques et médias ignorés très tôt ;
- CUE + BIN regroupés en une seule entrée lorsque nécessaire ;
- la bibliothèque s’ouvre sur **TOUS** après chargement ou rescan ;
- favoris et récents disponibles ;
- CLEAN EXIT : changement de jeu sans recharger la page ni rescanner la bibliothèque ;
- D-pad numérique 8 directions glissable pour les systèmes concernés.

Sur Android en mode fichier local (`content://`), les permissions de dossier restent soumises au navigateur. Après une fermeture/recharge complète de la page, il peut être nécessaire de sélectionner de nouveau le dossier ROMS et le dossier BIOS.

## BIOS global

Le bouton **BIOS** indexe les firmwares indépendamment des systèmes actuellement présents dans le dossier ROMS. Cela permet de préparer à l’avance les BIOS de systèmes qui seront ajoutés plus tard.

Le scanner reconnaît des BIOS bruts ainsi que le contenu d’archives **ZIP, 7Z et RAR**. Les ZIP sont indexés rapidement par leur répertoire interne afin d’éviter de tout décompresser pendant le scan. Le registre peut compléter sa base locale avec le catalogue RetroArch disponible en ligne.

La présence d’un BIOS ne fait jamais apparaître un système vide dans la bibliothèque.

## PlayStation / PS1

RetroRoom gère les jeux PS1 en **CUE + BIN** comme un seul jeu : les BIN référencés ne sont pas affichés en double mais restent montés pour l’émulation.

Les formats disque pris en compte incluent notamment CUE/BIN, CHD, PBP, M3U et CCD selon le core utilisé. Le correctif de lancement conserve le vrai fichier `.cue` comme média principal afin d’éviter un démarrage à vide dans le menu RetroArch.

## 3DO

La 3DO utilise le core Opera. Les jeux **CUE + BIN** sont regroupés en une seule entrée et les BIN référencés sont montés automatiquement.

La manette tactile 3DO utilise une disposition unique pour tous les jeux :

`L · P · R`

`A · B · C`

avec **STOP** séparé. `P` correspond au bouton **PLAY** de la manette 3DO.

## Nintendo 64

Le profil N64 possède une vraie disposition dédiée : **D-pad + stick analogique tactile indépendant**, A/B, quatre boutons C, L/R/Z et Start. Le pad standard reste affiché au démarrage et le profil N64 n’apparaît que lorsqu’un jeu N64 est sélectionné.

## Virtual Boy

Le Virtual Boy possède maintenant son profil tactile dédié, fidèle au principe de la manette originale :

- deux croix directionnelles indépendantes ;
- A / B ;
- SELECT / START ;
- L / R.

Le système est détecté automatiquement avec les dossiers ES-DE `virtualboy` et les formats pris en charge par son core.

## État de V6.27.5

- catalogue systèmes étendu pour les structures ES-DE ;
- systèmes vides invisibles ;
- BIOS global et indexation rapide des archives ;
- FAST SCAN et CLEAN EXIT conservés ;
- PS1 CUE/BIN validé ;
- 3DO CUE/BIN et pad global validés ;
- N64 avec stick analogique dédié ;
- Virtual Boy avec double D-pad et L/R ;
- aucune ROM ni aucun BIOS distribué ;
- l’expérimentation d’import massif des médias ES-DE n’est pas incluse dans cette release.

Le fichier `RELEASE_SHA256.txt` permet de vérifier l’intégrité du `index.html` public.
