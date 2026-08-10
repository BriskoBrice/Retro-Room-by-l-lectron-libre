# RetroRoom — matrice de validation Android

Cette matrice fige les chemins déjà validés et sert de gate avant la grosse passe graphique.

| Système | Détection dossier | Core/engine attendu | Profil tactile | CRT contenue | Résultat | Gelé |
|---|---|---|---|---|---|---|
| CPS I | cps1 | arcade / FBNeo | arcade6 | oui | VALIDÉ | oui |
| CPS II | cps2 | fbalpha2012_cps2 | arcade6 | oui | VALIDÉ avec sfa.zip | oui |
| Game Gear | segaGG | segaGG | two | à tester | EN ATTENTE | non |
| WonderSwan / Color | ws | ws | ws | à tester | EN ATTENTE | non |
| Neo Geo Pocket / Color | ngp | ngp | two | à tester | EN ATTENTE | non |
| LowRes NX | lowresnx | iframe LowRes NX | lowres | à tester | EN ATTENTE | non |
| Nintendo Switch | switch | unsupported | aucun lancement | n/a | CATALOGUE | oui |

## Protocole Android

Pour chaque système lançable : **BIBLIO → système → ROM simple → lancement → touches → CRT → NEW**.

À valider :
- le dossier est classé dans le bon système ;
- le bon core/engine démarre ;
- la disposition tactile attendue apparaît ;
- l’émulation reste contenue dans la CRT ;
- aucun overlay EmulatorJS parasite ne recouvre la chambre ou les contrôles.

## Frozen source hashes

Empreintes SHA-256 produites par GitHub Actions sur le commit `236271cc90f01a28a6dde76d46d120921bc8e5d0` :

```text
a56ef3ca85fec3c918f4f525daabd47456ddad8be959c2e24e999e55e3c3c63b  src/core-config.js
2f2c9dcaea64330d4eba18ba6b7c053c3ebaea563602cea83c97a22e82142fa9  src/arcade-compat.js
17da1c1b6336f1e4330ebca5af4c88a2d36b81068c1774e73fc4fc9f750bb242  src/emu-launch.js
fd7b3a4f2052ac76e93c9cc0fd62bbda0fc022efc2d841506c9305fcd5529f5d  src/emu-overlay.js
320db6e4021af12868dc99e7d6b6459c1378cdee10d6dce7ac2e7d32ce79d15f  src/emu-lowres.js
d378e5c800a7c0366b248bdf71761a79206eadebec8356a92b9c7811a4e6c128  src/controls-layout.js
6a6169d2fc0721e76ffbb07e4a5251545c4d1756b6f74fb084589d19a0a64aa9  src/controls-input.js
2d07aac1359ae426cf4284d31c8ccc0f3c9e8fb4b05b892a2d7811b3ef26ed30  src/controls-init.js
```

Toute modification ultérieure d’un de ces fichiers doit être motivée par un bug reproduit et suivie d’une nouvelle validation des systèmes concernés.
