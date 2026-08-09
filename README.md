# Retro Room by L’électron libre

Chambre retrogaming 3D immersive inspirée de l’ambiance des chambres 90s et des frontends VR de retrogaming, sans reprendre leurs assets.

## État actuel

La branche `main` contient la **base fonctionnelle stabilisée** avant la refonte graphique réaliste :

- Three.js pour la chambre 3D
- EmulatorJS 4.2.3
- chargement de ROMs locales
- Game Gear validée
- WonderSwan validée
- CPS I / FBNeo validé
- contrôles tactiles externes à la CRT
- sélection multi-systèmes
- LowRes NX intégré séparément

## Objectif graphique

La prochaine étape est une refonte multi-fichiers plus proche d’une vraie chambre d’ado/geek des années 90 : matériaux plus réalistes, mobilier détaillé, densité d’objets, éclairage crédible, textures et modèles 3D optimisés mobile.

## Lancer en local

```bash
npm install
npm run dev
```

Le projet peut aussi être servi comme site statique. Les ROMs ne sont pas incluses dans le dépôt : elles sont chargées localement par l’utilisateur.
