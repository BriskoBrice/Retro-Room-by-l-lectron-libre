# RetroRoom — Stabilisation puis montée en qualité visuelle

## Objectif
Conserver intacte l’émulation déjà validée sur Android tout en terminant la compatibilité de la bibliothèque actuelle, puis améliorer nettement la chambre 3D sans retomber dans les régressions d’interface ou de cores.

## Périmètre de cette passe

### Systèmes gelés
- CPS I : FBNeo — validé.
- CPS II : FBA2012 CPS-2 compat — validé avec `sfa.zip`.
- Le comportement de lancement, la configuration EmulatorJS, le nettoyage de l’overlay CRT et la manette arcade associée à ces deux systèmes ne doivent plus être modifiés sauf bug reproduit.

### Systèmes à valider avant le gros travail graphique
- Game Gear.
- WonderSwan / WonderSwan Color.
- Neo Geo Pocket / Neo Geo Pocket Color.
- LowRes NX.

Nintendo Switch reste uniquement catalogué dans la bibliothèque : les fichiers XCI/NSP sont reconnus mais aucun core web n’est annoncé ni simulé.

## Architecture conservée
- `core-config.js` : catalogue systèmes / cores / profils de manette.
- `emu-launch.js` : lancement EmulatorJS en document principal ; aucune réarchitecture iframe pour les cores EJS.
- `emu-lowres.js` : LowRes NX reste isolé dans son iframe afin d’éviter les collisions WebAssembly/Module.
- `controls-*` : dispositions tactiles par système ; on ne déplace pas les contrôles stables pendant la passe émulation.
- `library.js` : le dossier parent a priorité sur l’extension quand un format est ambigu ; les variantes de noms de dossiers ES-DE sont normalisées.
- `core-room-*` / `core-polish*` : seules ces couches peuvent recevoir les améliorations visuelles tant que la phase de validation des systèmes n’est pas terminée.

## Flux utilisateur cible
1. Ouvrir `RetroRoom_TEST.html` localement sur Android.
2. `BIBLIO` → choisir le dossier ROM principal.
3. La bibliothèque classe automatiquement les ROMs par système.
4. Cliquer sur un jeu choisit automatiquement le système/core et le profil de manette.
5. `ROM` reste disponible pour charger un fichier seul ; `SYSTEM` reste un secours manuel.
6. `NEW` recharge RetroRoom avant de changer de ROM quand EmulatorJS est déjà injecté.

## Stratégie de validation
Pour chacun des quatre systèmes restants :
- choisir une ROM simple déjà présente dans la bibliothèque ;
- confirmer que la détection de dossier est correcte ;
- confirmer que le bon core démarre ;
- confirmer que le contrôleur tactile change correctement ;
- vérifier que l’écran EmulatorJS reste contenu dans la CRT ;
- une fois validé, considérer ce chemin comme gelé.

Aucun changement visuel ne doit modifier `core-config.js`, `emu-launch.js`, `emu-overlay.js`, `emu-lowres.js` ou `controls-*` sans raison fonctionnelle explicite.

## Direction visuelle après validation
Objectif : se rapprocher du ressenti EmuVR sans copier ses assets.

Priorités :
- composition de vraie chambre 90s avant l’UI ;
- CRT plus crédible (coque, verre, boutons, ventilation, reflets sobres) ;
- matériaux plus réalistes pour moquette, bois, murs et plastique ;
- éclairage pratique chaud + légère contribution froide du CRT ;
- densité crédible : étagères pleines, VHS, CD, boîtes de jeux génériques, hi-fi, magazines, câbles, accessoires ;
- silhouettes de meubles plus détaillées ;
- réduction des éléments trop « néon / synthwave » ;
- performances Android conservées via pixel ratio adaptatif, peu ou pas d’ombres dynamiques lourdes et rendu 3D plafonné pendant l’émulation.

## Critères de réussite
- CPS I et CPS II ne régressent pas.
- Les quatre systèmes restants peuvent chacun être validés ou explicitement marqués non compatibles sans faux positif.
- La bibliothèque du dossier actuel ne contient plus de catégorie `UNKNOWN` pour les systèmes connus.
- Les contrôles restent hors de la CRT et sans chevauchement.
- La chambre gagne visiblement en réalisme sans faire chuter l’émulation à un niveau inutilisable.
- Le fichier de test reste simple : un seul HTML à télécharger et ouvrir.

## Hors périmètre immédiat
- Déploiement Vercel.
- Supabase / comptes / cloud saves.
- Refonte complète en framework Node/Vite.
- Émulation Nintendo Switch.
- VR/WebXR avancée.
