# Retro Room by L’électron libre

**RetroRoom V6.29 STABLE** est la version publique actuelle : une chambre retrogaming immersive inspirée des années 90, pensée d’abord pour Android/mobile, avec bibliothèque locale, contrôles tactiles adaptés aux systèmes et émulation via EmulatorJS.

## Nouveautés V6.29 STABLE

- **FAST LIBRARY** : après un premier scan, la bibliothèque ROMS est mémorisée et réapparaît immédiatement au prochain lancement ;
- **FAST BIOS** : même principe pour l’index BIOS, sans rescanner massivement le dossier à chaque ouverture ;
- seuls les **métadonnées/index** et, quand le navigateur l’autorise, les handles de dossier sont mémorisés : RetroRoom ne copie pas les ROMs ni les BIOS dans son cache ;
- fallback Android/Chrome conservé : si l’autorisation persistante n’est pas disponible, RetroRoom redemande simplement l’accès au dossier au moment nécessaire ;
- FAST SCAN, CLEAN EXIT, CUE/BIN PS1 et 3DO, contrôles N64 et Virtual Boy restent inchangés.

Validation terrain de cette release sur **Xiaomi 13T Pro / Android / Chrome** : bibliothèque de **1219 ROMs / 17 systèmes**. Le test BIOS utilisé pendant la validation contenait **353 BIOS reconnus / 85 systèmes / 81 archives indexées**.

## Démarrage rapide

1. Ouvre RetroRoom dans un navigateur moderne avec une connexion Internet.
2. Ouvre **BIBLIO**.
3. Touche **ROMS** et sélectionne ton dossier de jeux.
4. Touche **BIOS** et sélectionne ton dossier BIOS si nécessaire.
5. Lance un jeu depuis la bibliothèque.
6. Pour changer de jeu : **QUITTER → BIBLIO → autre ROM**.

Au prochain lancement, RetroRoom recharge immédiatement les index mémorisés. Selon les permissions accordées par Android/Chrome, le premier lancement d’un jeu peut demander une autorisation du dossier ROMS ou BIOS ; après autorisation, il n’y a pas de rescan massif inutile.

Les ROMs et BIOS ne sont pas fournis dans ce dépôt.

## Organisation des dossiers

Le nom du dossier racine n’est pas imposé : `ROM`, `ROMS`, `JEUX`, etc. fonctionnent.

RetroRoom connaît un large catalogue de noms de dossiers compatibles avec la structure **ES-DE**. Un dossier système vide ne s’affiche pas : `systeminfo.txt`, `systems.txt`, `.nomedia`, images, vidéos et autres fichiers techniques ne comptent jamais comme jeux.

Il est recommandé de garder le dossier **BIOS en dehors du dossier ROMS** : le scan des jeux reste plus propre et Android/Chrome n’a pas à parcourir inutilement les BIOS pendant le scan ROM.

## Bibliothèque et cache

- scan initial FAST SCAN ;
- cache de bibliothèque FAST LIBRARY ;
- cache d’index BIOS FAST BIOS ;
- détection prioritaire par dossier système, puis extension en secours ;
- images, vidéos, fichiers techniques et médias ignorés ;
- CUE + BIN regroupés en une seule entrée lorsque nécessaire ;
- bibliothèque ouverte sur **TOUS** après chargement ou rescan ;
- favoris et récents ;
- CLEAN EXIT : changement de jeu sans recharger la page ;
- D-pad numérique 8 directions glissable pour les systèmes concernés.

## BIOS global

Le bouton **BIOS** indexe les firmwares indépendamment des systèmes présents dans le dossier ROMS.

Le scanner reconnaît des BIOS bruts ainsi que le contenu d’archives **ZIP, 7Z et RAR**. Les ZIP sont indexés rapidement par leur répertoire interne afin d’éviter de tout décompresser pendant le scan. Le registre peut compléter sa base locale avec le catalogue RetroArch disponible en ligne.

Avec V6.29, l’état de cet index est restauré depuis le cache au redémarrage. Les fichiers BIOS eux-mêmes ne sont pas copiés dans le cache.

## Systèmes

RetroRoom contient des cores/configurations pour de nombreuses machines Nintendo, Sega, Sony, Atari, NEC, SNK, arcade et micro-ordinateurs. La détection d’un système dans la bibliothèque ne signifie pas automatiquement qu’il a été retesté physiquement sur chaque release.

La liste détaillée avec la différence entre **core configuré** et **validation réelle sur Xiaomi 13T Pro** est disponible dans [`docs/SYSTEMS.md`](docs/SYSTEMS.md).

Validation explicitement tracée dans le projet : **SNES / Super Famicom, Nintendo 64, PlayStation, Atari Lynx, CPS II, 3DO et Virtual Boy**. Les autres lignes du tableau sont des systèmes dont le moteur/core est configuré par RetroRoom mais qui ne sont pas présentés comme individuellement revalidés sur V6.29.

## Points particuliers

### PlayStation / PS1

Les jeux PS1 **CUE + BIN** sont regroupés en une seule entrée. Les BIN référencés ne sont pas affichés en double mais restent montés pour l’émulation. Les formats disque pris en compte incluent notamment CUE/BIN, CHD, PBP, M3U et CCD selon le core utilisé.

### 3DO

La 3DO utilise Opera. Les jeux **CUE + BIN** sont regroupés et les BIN référencés sont montés automatiquement. La manette tactile utilise la disposition globale :

`L · P · R`

`A · B · C`

avec **STOP** séparé. `P` correspond à **PLAY**.

### Nintendo 64

Profil dédié avec **D-pad + vrai stick analogique tactile**, A/B, quatre boutons C, L/R/Z et Start.

### Virtual Boy

Profil tactile dédié avec **deux croix directionnelles indépendantes**, A/B, SELECT/START et L/R.

## Intégrité

`RELEASE_SHA256.txt` contient le SHA-256 du `index.html` public de V6.29 STABLE.
