# RetroRoom — catalogue ES-DE dynamique + BIOS globaux

Date : 2026-08-31
Statut : design à valider avant implémentation
Base de départ : RetroRoom V6.26.2

## 1. Objectif

RetroRoom doit connaître en interne un catalogue très large de systèmes, basé en priorité sur la structure de dossiers créée par ES-DE, sans afficher les systèmes vides.

Le comportement attendu est :

- un système peut être connu par RetroRoom sans apparaître dans l'interface ;
- il apparaît uniquement lorsqu'au moins un vrai contenu de jeu est détecté pour ce système ;
- `systeminfo.txt`, `systems.txt`, `.nomedia`, images, vidéos, sauvegardes, fichiers techniques et dossiers médias ne doivent jamais activer un système ;
- les BIOS sont indexés indépendamment de la présence des ROMs ;
- un BIOS connu pour un système absent peut déjà être reconnu et conservé dans l'index BIOS ;
- si un système est reconnu mais que RetroRoom n'a pas encore de moteur fonctionnel pour lui, il apparaît lorsque des ROMs sont présentes mais un lancement affiche un message propre « moteur non encore configuré » au lieu de planter ;
- les systèmes déjà validés en V6.26.2, notamment PS1, 3DO et N64, ne doivent pas régresser.

## 2. Principe central : séparer reconnaissance, présence et lancement

Chaque système possède trois états indépendants.

### 2.1 Système connu

Le système existe dans le registre interne avec :

- un identifiant canonique RetroRoom ;
- un label lisible ;
- un ou plusieurs noms de dossiers ES-DE / alias ;
- une liste d'extensions de contenu ;
- éventuellement un core EmulatorJS et un profil de contrôles ;
- éventuellement des besoins BIOS ;
- un état de moteur : `supported` ou `catalog-only`.

Un système connu n'est pas automatiquement visible.

### 2.2 Système présent

Un système devient présent uniquement lorsqu'au moins un fichier de jeu valide lui est associé pendant le scan.

Exemple :

```text
Roms/atarijaguar/systeminfo.txt
```

=> Jaguar reste invisible.

```text
Roms/atarijaguar/systeminfo.txt
Roms/atarijaguar/Alien vs Predator.j64
```

=> Jaguar apparaît.

### 2.3 Système lançable

- `supported` : RetroRoom possède déjà un moteur/core et lance le contenu normalement ;
- `catalog-only` : RetroRoom sait reconnaître/classer le système, mais aucun moteur n'est encore branché ou validé. Le système peut apparaître avec ses ROMs, mais le clic affiche un message propre et ne tente pas un lancement cassé.

Un système pourra être promu de `catalog-only` vers `supported` plus tard sans modifier la logique de scan.

## 3. Registre systèmes unique

Créer un module dédié, par exemple `src/system-catalog.js`, qui devient la source de vérité pour les noms de dossiers, labels, extensions, alias et état de support.

Le `SYSTEMS` actuel reste compatible avec les systèmes déjà fonctionnels, mais sa définition doit être alimentée ou complétée par ce catalogue au lieu de disperser les alias entre `core-config.js`, `library.js` et les patches inline.

### 3.1 Catalogue ES-DE de base

Le registre doit connaître, sans distinction de casse, les dossiers observés dans la structure ES-DE fournie :

`3do`, `adam`, `amiga`, `amiga1200`, `amiga600`, `amigacd32`, `amstradcpc`, `androidapps`, `androidgames`, `apple2`, `apple2gs`, `arcade`, `arcadia`, `archimedes`, `arduboy`, `astrocde`, `atari2600`, `atari5200`, `atari7800`, `atari800`, `atarijaguar`, `atarilynx`, `atarist`, `atarixe`, `atomiswave`, `bbcmicro`, `c64`, `cdimono1`, `cdtv`, `chailove`, `channelf`, `coco`, `colecovision`, `consolearcade`, `cps`, `cps1`, `cps2`, `cps3`, `crvision`, `daphne`, `doom`, `dos`, `dragon32`, `dreamcast`, `easyrpg`, `electron`, `emulators`, `epic`, `famicom`, `fba`, `fbneo`, `fds`, `flash`, `fm7`, `fmtowns`, `gamate`, `gameandwatch`, `gamecom`, `gamegear`, `gb`, `gba`, `gbc`, `gc`, `genesis`, `gmaster`, `gx4000`, `intellivision`, `j2me`, `laserdisc`, `lcdgames`, `lowresnx`, `lutro`, `macintosh`, `mame`, `mark3`, `mastersystem`, `megacd`, `megacdjp`, `megadrive`, `megadrivejp`, `megaduck`, `mess`, `model2`, `model3`, `moto`, `msx`, `msx1`, `msx2`, `msxturbor`, `multivision`, `n3ds`, `n64`, `n64dd`, `naomi`, `naomi2`, `naomigd`, `nds`, `neogeo`, `neogeocd`, `neogeocdjp`, `nes`, `ngage`, `ngp`, `ngpc`, `odyssey2`, `openbor`, `oric`, `palm`, `pc`, `pc88`, `pc98`, `pcarcade`, `pcengine`, `pcenginecd`, `pcfx`, `pico8`, `plus4`, `pokemini`, `ports`, `ps2`, `ps3`, `psp`, `psvita`, `psx`, `pv1000`, `quake`, `samcoupe`, `satellaview`, `saturn`, `saturnjp`, `scummvm`, `scv`, `sega32x`, `sega32xjp`, `sega32xna`, `segacd`, `sfc`, `sg-1000`, `sgb`, `snes`, `snesna`, `spectravideo`, `steam`, `stv`, `sufami`, `supergrafx`, `supervision`, `supracan`, `switch`, `symbian`, `tanodragon`, `tg-cd`, `tg16`, `ti99`, `tic80`, `to8`, `triforce`, `type-x`, `uzebox`, `vectrex`, `vic20`, `videopac`, `vircon32`, `virtualboy`, `vpinball`, `vsmile`, `wasm4`, `wii`, `wiiu`, `windows`, `windows3x`, `windows9x`, `wonderswan`, `wonderswancolor`, `x1`, `x68000`, `xbox`, `xbox360`, `zmachine`, `zx81`, `zxspectrum`.

Les variantes régionales ou synonymes peuvent pointer vers un même identifiant canonique lorsqu'elles utilisent le même moteur et le même profil. Exemples : `megadrive`, `genesis` et `megadrivejp` peuvent converger vers Mega Drive ; `saturn` et `saturnjp` vers Saturn ; `segacd`, `megacd` et `megacdjp` vers Mega-CD/Sega CD.

Les variantes restent séparées uniquement lorsqu'une différence de moteur, de firmware ou de contrôles le justifie réellement.

## 4. Détection des systèmes : dossier d'abord, extension ensuite

### 4.1 Règle principale

Lors d'un scan de dossier complet, le nom du dossier système est prioritaire sur l'extension.

Exemple : un `.bin` dans `Roms/psx/` est PS1, alors qu'un `.bin` dans `Roms/3do/` est 3DO. Cela évite les ambiguïtés des formats disque.

### 4.2 Détermination du dossier système

Avec `webkitRelativePath`, RetroRoom identifie le dossier enfant du dossier ROM sélectionné et le compare au registre des alias.

Le scanner ne doit pas interpréter arbitrairement n'importe quel sous-dossier média comme un système.

Si l'utilisateur sélectionne un dossier atypique ou un fichier seul, la détection par extension actuelle reste un fallback.

### 4.3 Fichiers qui ne comptent jamais comme jeux

Blacklist commune au scan :

- `.nomedia` ;
- `systeminfo.txt` ;
- `systems.txt` ;
- `txt`, `md`, `nfo`, `ini`, `db`, `pdf`, `xml`, `json`, `log` ;
- sauvegardes et états : `sav`, `srm`, `rtc`, `state`, etc. ;
- patches : `ips`, `ups`, `bps` ;
- images : `png`, `jpg`, `jpeg`, `webp`, `gif`, `bmp`, `svg` ;
- vidéos et médias ;
- dossiers `images`, `covers`, `boxart`, `videos`, `media`, `screenshots`, `snaps`, `manuals` et variantes usuelles ;
- BIOS/firmwares connus.

Le fichier `systeminfo.txt` fourni par ES-DE est donc explicitement ignoré comme contenu de jeu.

## 5. Extensions et archives

Chaque entrée système possède ses extensions de contenu connues.

Les archives (`zip`, `7z`, éventuellement autres formats déjà acceptés par le moteur) peuvent compter comme contenu pour les systèmes qui les utilisent, mais elles ne doivent pas être attribuées à un système uniquement par leur extension ; le dossier système sert alors de contexte principal.

Pour les systèmes disque, les traitements particuliers restent explicites :

- PS1 : CUE + BIN = une entrée, BIN référencé masqué ;
- 3DO : CUE + BIN = une entrée, BIN référencé masqué ;
- futurs systèmes disque : ajout progressif d'un canonicaliseur spécifique ou générique quand nécessaire, sans casser PS1/3DO.

## 6. Interface : afficher uniquement les systèmes actifs

Après un scan :

- la bibliothèque ne crée une carte que pour les systèmes ayant au moins un jeu réel ;
- le compteur « X SYSTÈMES » compte seulement ces systèmes ;
- les dossiers ES-DE vides ne sont jamais visibles ;
- le sélecteur manuel de système ne doit pas exposer une longue liste de systèmes absents après un scan complet ; il est reconstruit à partir des systèmes détectés, avec `AUTO` conservé ;
- lorsqu'un fichier seul impose un système non encore présent dans le scan, RetroRoom peut ajouter temporairement ce système au sélecteur si nécessaire.

Un système `catalog-only` avec de vraies ROMs apparaît normalement dans la bibliothèque, mais son lancement affiche clairement que le moteur n'est pas encore configuré.

## 7. BIOS globaux

Créer un registre BIOS global séparé du registre des systèmes visibles, par exemple dans `src/bios-catalog.js` ou en faisant évoluer `src/bios-support.js`.

### 7.1 Règle principale

Le sélecteur BIOS indexe tous les BIOS/firmwares connus, même lorsque le système correspondant n'est pas présent dans le dossier ROM.

Exemple : un BIOS Saturn peut être reconnu aujourd'hui alors qu'aucune ROM Saturn n'existe. Si des jeux Saturn sont ajoutés plus tard, le BIOS est déjà connu pendant la session.

### 7.2 Source du catalogue BIOS

La stratégie et les noms/patterns déjà validés dans RetroStation doivent être repris lorsque disponibles. Il ne faut pas inventer des hashes ou des correspondances non vérifiées.

La base V6.26.2 déjà fonctionnelle pour PS1 et 3DO reste prioritaire et ne doit pas régresser.

Le registre doit pouvoir couvrir progressivement les familles déjà prévues dans RetroStation : notamment 3DO, PS1, Mega-CD/Sega CD, Saturn, Dreamcast/Naomi/Atomiswave, FDS, DS/DSi, PC Engine CD, PC-FX, Neo Geo/Neo Geo CD, Atari Lynx/Jaguar, MSX, CD-i, Amiga et autres systèmes nécessitant firmware/BIOS.

### 7.3 Archives BIOS

Conserver la logique V6.26 permettant l'inspection des archives ZIP/7Z/RAR. Les fichiers extraits sont comparés au registre BIOS comme les fichiers bruts.

Le scan BIOS ne doit jamais faire apparaître un système dans la bibliothèque.

## 8. Compatibilité avec la V6.26.2

Cette évolution ne doit pas modifier sans nécessité :

- le CLEAN EXIT ;
- le FAST SCAN ;
- le lancement PS1 CUE/BIN direct ;
- la reconnaissance BIOS PS1 actuelle ;
- le bundle CUE/BIN 3DO et la sélection Opera BIOS ;
- le layout 3DO global `L · P · R / A · B · C` + STOP ;
- le stick analogique N64 et son layout ;
- les contrôles déjà validés des systèmes existants.

Les nouveaux systèmes ne doivent pas être ajoutés via une accumulation de patches spécifiques dans `index.html`. Le nouveau catalogue doit vivre dans des modules `src/` testables et être consommé par la release.

## 9. Gestion des systèmes non supportés

Les systèmes modernes ou spécialisés présents dans ES-DE mais sans moteur web RetroRoom validé (par exemple selon l'état actuel : certaines générations PlayStation, Xbox, Switch, Wii U, systèmes arcade spécialisés, etc.) sont enregistrés comme `catalog-only`.

Leur présence avec des ROMs doit :

1. afficher le système et les jeux ;
2. ne pas tenter de charger un core inexistant ;
3. afficher un message explicite ;
4. permettre une future promotion vers `supported` sans changer le scan ni la bibliothèque.

## 10. Tests obligatoires

Ajouter des tests automatisés couvrant au minimum :

1. `atarijaguar/systeminfo.txt` seul => aucun système Jaguar ;
2. `atarijaguar/Alien vs Predator.j64` => Jaguar détecté ;
3. `systems.txt` et `.nomedia` à la racine => jamais comptés comme jeux ;
4. un fichier image/vidéo dans un dossier système => ne l'active pas ;
5. un dossier `media` imbriqué => aucun faux système ;
6. `megadrive`, `genesis`, `megadrivejp` => alias canonique cohérent ;
7. `saturn` et `saturnjp` => alias canonique cohérent ;
8. un système `catalog-only` avec une ROM => visible mais non lancé ;
9. BIOS reconnu sans ROM correspondante => le système reste invisible ;
10. PS1 CUE/BIN => une seule entrée et lancement direct préservé ;
11. 3DO CUE/BIN => une seule entrée et BIN externe préservé ;
12. N64 => régression layout/stick interdite ;
13. scan d'une structure ES-DE contenant de nombreux dossiers vides => seuls les dossiers avec vrais jeux comptent dans le total systèmes.

## 11. Fichiers prévus

Implémentation cible :

- nouveau `src/system-catalog.js` ;
- nouveau `src/bios-catalog.js` ou extension propre de `src/bios-support.js` ;
- adaptation de `src/core-config.js` ;
- adaptation de `src/library.js` ;
- adaptation contrôlée de la logique BIOS dans la release ;
- nouveaux tests dans `tests/` ;
- mise à jour du README après validation réelle sur Android ;
- mise à jour de `index.html` public et `RELEASE_SHA256.txt` uniquement après tests locaux et validation sur appareil.

## 12. Critère de réussite utilisateur

Avec un dossier ROM créé par ES-DE contenant une centaine de dossiers système mais seulement quelques dossiers réellement remplis, RetroRoom n'affiche que les systèmes contenant de vraies ROMs.

Si l'utilisateur ajoute demain des ROMs dans un dossier jusque-là vide, par exemple `atarijaguar`, un nouveau scan suffit pour faire apparaître Jaguar automatiquement. Aucun changement de code n'est nécessaire pour « créer » le système.

Si le moteur Jaguar fonctionne déjà, le jeu part. S'il n'est pas encore validé, le jeu est correctement classé et RetroRoom indique proprement que le moteur doit encore être configuré.

En parallèle, le dossier BIOS peut déjà contenir et faire reconnaître des firmwares de systèmes qui ne possèdent encore aucune ROM.
