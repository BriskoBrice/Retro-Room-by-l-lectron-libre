# RetroRoom Visual Realism Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Faire gagner à RetroRoom un net niveau de réalisme et de densité visuelle façon chambre retrogaming 90s, sans copier d’assets EmuVR et sans toucher aux chemins d’émulation validés.

**Architecture:** Toute la montée en qualité reste isolée dans des modules Three.js dédiés chargés après la scène de base. Le CRT actif conserve exactement ses coordonnées d’écran projeté ; les nouveaux détails habillent sa coque et l’environnement sans déplacer la surface de jeu. Les matériaux et props sont générés localement/procéduralement pour éviter les dépendances fragiles et les problèmes de licence pendant cette passe.

**Tech Stack:** Three.js 0.160.0, CanvasTexture, MeshStandardMaterial, géométries Three.js natives, HTML/CSS statique, Node.js `node:test`/`node --check` pour les gardes de régression.

## Global Constraints

- Ce plan ne commence qu’après le gate de validation du plan de stabilisation.
- Ne pas modifier `src/core-config.js`, `src/emu-launch.js`, `src/emu-overlay.js`, `src/emu-lowres.js`, `src/controls-layout.js`, `src/controls-input.js`, `src/controls-init.js` pendant les tâches visuelles.
- Ne pas modifier `tvX`, `tvY`, `tvZ` ni les quatre `screenLocalCorners` utilisés par `updateCrtOverlay()`.
- Conserver le rendu 3D plafonné à environ 30 fps pendant l’émulation.
- Conserver `renderer.shadowMap.enabled=false` ; utiliser des ombres de contact simulées peu coûteuses.
- Conserver une ambiance 90s chaude et crédible ; réduire le look néon/synthwave.
- Aucun asset propriétaire de console, affiche, jeu ou EmuVR n’est copié.
- Aucun déploiement Vercel pendant ce plan.

---

### Task 1: Ajouter des gardes de non-régression visuelle/émulation

**Files:**
- Create: `tests/visual-boundaries.test.mjs`

**Interfaces:**
- Consumes: `src/core-render.js`, `src/emu-launch.js`, `src/core-config.js`.
- Produces: tests texte empêchant les modifications accidentelles du contrat CRT et des cores gelés.

- [ ] **Step 1: Écrire le test des coordonnées CRT**

```js
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

test('CRT overlay contract remains unchanged', () => {
  const src = fs.readFileSync('src/core-render.js', 'utf8');
  assert.match(src, /new THREE\.Vector3\(-1\.09,\.71,\.53\)/);
  assert.match(src, /new THREE\.Vector3\(1\.09,-\.71,\.53\)/);
  assert.match(src, /updateCrtOverlay\(\)/);
});
```

- [ ] **Step 2: Écrire le test des fichiers interdits**

Le test lit les SHA/fixtures de référence enregistrés à la fin du plan de stabilisation dans `docs/validation/retro-room-systems.md` et vérifie que les tâches visuelles n’ont pas modifié les fichiers gelés. Si les SHA ne sont pas enregistrés, ajouter au document de validation une section `Frozen source hashes` avant d’implémenter ce plan.

- [ ] **Step 3: Exécuter les tests**

Run: `npm test`

Expected: PASS avant toute modification visuelle.

- [ ] **Step 4: Commit**

```bash
git add tests/visual-boundaries.test.mjs docs/validation/retro-room-systems.md
git commit -m "test: guard RetroRoom visual boundaries"
```

---

### Task 2: Centraliser les matériaux 90s réalistes

**Files:**
- Create: `src/room-materials.js`
- Modify: `index.html`
- Create: `tests/room-materials.test.mjs`

**Interfaces:**
- Produces: `globalThis.RetroRoomMaterials` avec `wall`, `carpet`, `woodDark`, `woodLight`, `blackPlastic`, `beigePlastic`, `metalDark`, `fabric`, `paper`, `glassTint`, `makePosterTexture(title, subtitle, paletteIndex)`.
- Consumes: `THREE` déjà chargé globalement.

- [ ] **Step 1: Écrire le test de présence des matériaux**

Le test exécute `room-materials.js` dans un contexte Three.js stub et vérifie que l’API expose exactement les clés ci-dessus et que `makePosterTexture` est une fonction.

- [ ] **Step 2: Exécuter le test avant implémentation**

Run: `node --test tests/room-materials.test.mjs`

Expected: FAIL parce que le module n’existe pas.

- [ ] **Step 3: Implémenter les textures procédurales**

Créer trois `CanvasTexture` répétables :
- mur : papier peint vertical légèrement irrégulier, couleurs brun/ocre désaturées ;
- moquette : bruit fin + fibres courtes, tonalité brun très sombre ;
- bois : veines horizontales avec variation subtile de luminance.

Configurer :

```js
texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
texture.colorSpace = THREE.SRGBColorSpace;
```

Créer les matériaux avec `MeshStandardMaterial`, roughness élevée pour mur/moquette/bois et metalness faible sauf `metalDark`.

- [ ] **Step 4: Créer les posters originaux procéduraux**

`makePosterTexture(title, subtitle, paletteIndex)` doit produire un `CanvasTexture` sans logo ni artwork de jeu existant. Titres autorisés dans le décor : `NIGHT DRIVE`, `PIXEL CLUB`, `ARCADE 98`, `GALAXY TOUR`, `L'ÉLECTRON LIBRE`.

- [ ] **Step 5: Charger le module après Three.js et avant les modules de décor**

Dans `index.html` :

```html
<script src="/src/room-materials.js"></script>
```

avant `core-room-a.js` ou, si la scène de base crée ses matériaux avant cette ligne, immédiatement après `core-room-b.js` et uniquement pour les nouveaux modules de détail.

- [ ] **Step 6: Exécuter les tests et syntax checks**

Run: `npm test && node --check src/room-materials.js`

Expected: PASS.

- [ ] **Step 7: Commit**

```bash
git add src/room-materials.js index.html tests/room-materials.test.mjs
git commit -m "feat: add realistic procedural room materials"
```

---

### Task 3: Rendre le CRT physiquement plus crédible sans déplacer l’écran actif

**Files:**
- Create: `src/crt-detail.js`
- Modify: `index.html`
- Create: `tests/crt-detail.test.mjs`

**Interfaces:**
- Consumes: `scene`, `tvX`, `tvY`, `tvZ`, helpers `box`, `cyl`, `plane`, `RetroRoomMaterials`.
- Produces: un `THREE.Group` nommé `retroRoomCrtDetail` ajouté à la scène.
- Interdiction: ne pas modifier `#crtScreen`, `screenLocalCorners` ni `updateCrtOverlay()`.

- [ ] **Step 1: Écrire un test statique de sécurité**

Le test vérifie que `src/crt-detail.js` ne contient aucune chaîne `crtScreen.style`, `screenLocalCorners`, `tvX=`, `tvY=` ou `tvZ=`.

- [ ] **Step 2: Exécuter le test avant création**

Run: `node --test tests/crt-detail.test.mjs`

Expected: FAIL parce que le fichier n’existe pas.

- [ ] **Step 3: Construire la coque en couches**

Ajouter autour de l’écran existant :
- coque arrière profonde en plastique sombre ;
- cadre frontal épais en quatre barres ;
- lèvre intérieure de 2 à 3 cm visuels autour du verre ;
- panneau inférieur avec bouton power, LED et deux molettes ;
- séries de fentes de ventilation sur le côté et le dessus ;
- poignée/renfort arrière discret.

Toutes les géométries doivent être dérivées de `tvX/tvY/tvZ` et rester derrière le plan de verre actif.

- [ ] **Step 4: Ajouter une impression de verre cathodique**

Créer un mesh frontal transparent indépendant :

```js
new THREE.MeshStandardMaterial({
  color: 0x14201c,
  roughness: 0.18,
  metalness: 0,
  transparent: true,
  opacity: 0.16
});
```

Le mesh ne doit pas intercepter l’UI DOM ; il s’agit uniquement d’un effet 3D autour/derrière la projection.

- [ ] **Step 5: Charger le module avant `core-render.js`**

- [ ] **Step 6: Exécuter les tests**

Run: `npm test && node --check src/crt-detail.js`

Expected: PASS.

- [ ] **Step 7: Commit**

```bash
git add src/crt-detail.js index.html tests/crt-detail.test.mjs
git commit -m "feat: add detailed CRT shell"
```

---

### Task 4: Augmenter la densité de vraie chambre 90s

**Files:**
- Create: `src/room-props.js`
- Modify: `index.html`
- Create: `tests/room-props.test.mjs`

**Interfaces:**
- Consumes: `scene`, helpers de géométrie existants, `RetroRoomMaterials`.
- Produces: `globalThis.RetroRoomProps.addAll()` et groupes nommés `shelfClutter`, `deskClutter`, `floorClutter`, `wallDecor`.

- [ ] **Step 1: Écrire le test d’API**

Le test vérifie que le script expose `RetroRoomProps.addAll` sans accéder à l’émulateur ou aux contrôles.

- [ ] **Step 2: Implémenter des builders simples et réutilisables**

Créer :

```js
makeVhs(x,y,z,rotation,labelIndex)
makeCdCase(x,y,z,rotation,labelIndex)
makeGameBox(x,y,z,rotation,labelIndex)
makeMagazine(x,y,z,rotation,labelIndex)
makeCassette(x,y,z,rotation,labelIndex)
makeSpeaker(x,y,z,scale)
makeControllerProp(x,y,z,rotation)
makeCable(points)
```

Chaque builder retourne un `THREE.Group` ou `THREE.Mesh` et n’utilise que des visuels originaux/génériques.

- [ ] **Step 3: Remplir les zones existantes sans créer de nouvelle UI**

Ajouter au minimum :
- 20 éléments étagères droite ;
- 14 éléments étagères gauche ;
- 8 éléments autour du bureau ;
- 8 éléments au sol ;
- 4 affiches/posters originaux ;
- 3 câbles visibles ;
- une multiprise ;
- un petit réveil digital ;
- deux enceintes hi-fi ;
- un pouf ou coussin de sol.

Utiliser des `Group` pour pouvoir désactiver facilement chaque zone si les performances chutent.

- [ ] **Step 4: Ajouter des faux contact shadows**

Sous le pouf, les cartons, la TV et les gros objets, ajouter des `PlaneGeometry` noirs transparents (`opacity` entre 0.08 et 0.18), horizontaux, sans activer le shadow map.

- [ ] **Step 5: Charger `room-props.js` avant `core-render.js` et appeler `RetroRoomProps.addAll()` une seule fois**

- [ ] **Step 6: Exécuter les tests et syntax check**

Run: `npm test && node --check src/room-props.js`

Expected: PASS.

- [ ] **Step 7: Commit**

```bash
git add src/room-props.js index.html tests/room-props.test.mjs
git commit -m "feat: fill RetroRoom with 90s props"
```

---

### Task 5: Recomposer l’éclairage pour une chambre, pas un décor néon

**Files:**
- Create: `src/room-lighting.js`
- Modify: `index.html`
- Modify: `src/core-final-polish.js`
- Create: `tests/room-lighting.test.mjs`

**Interfaces:**
- Consumes: `scene`, `renderer`, positions existantes du CRT et des lampes.
- Produces: `globalThis.RetroRoomLighting.apply()`.

- [ ] **Step 1: Écrire le test de budget lumière**

Le test vérifie que `room-lighting.js` contient au maximum quatre créations de `PointLight` supplémentaires et aucune activation de `shadowMap.enabled=true`.

- [ ] **Step 2: Réduire les doublons dans `core-final-polish.js`**

Supprimer uniquement les lumières qui seront recréées dans `room-lighting.js`; conserver les détails géométriques existants.

- [ ] **Step 3: Implémenter la palette lumineuse**

Utiliser :
- une source principale chaude proche de 2700–3000 K visuellement (`0xffc58f` environ) ;
- une petite source froide liée au CRT (`0x88a7bd`) ;
- une source chaude faible vers les étagères ;
- un rebond très faible au niveau du sol.

Limiter les intensités et distances pour éviter un éclairage uniforme de toute la pièce.

- [ ] **Step 4: Conserver l’exposition**

`renderer.toneMappingExposure` doit rester entre `1.00` et `1.10`.

- [ ] **Step 5: Charger le module avant `core-render.js`**

- [ ] **Step 6: Exécuter les tests**

Run: `npm test && node --check src/room-lighting.js src/core-final-polish.js`

Expected: PASS.

- [ ] **Step 7: Commit**

```bash
git add src/room-lighting.js src/core-final-polish.js index.html tests/room-lighting.test.mjs
git commit -m "feat: rebalance RetroRoom practical lighting"
```

---

### Task 6: Ajouter un budget qualité adaptatif sans toucher à l’émulateur

**Files:**
- Create: `src/room-quality.js`
- Modify: `index.html`
- Modify: `src/core-render.js`
- Create: `tests/room-quality.test.mjs`

**Interfaces:**
- Produces: `RetroRoomQuality.pixelRatio()` et `RetroRoomQuality.renderInterval()`.
- Consumes: `devicePixelRatio`, `innerWidth`, `innerHeight`; ne lit pas `EJS_*` et ne modifie pas l’émulateur.

- [ ] **Step 1: Écrire les tests de politique qualité**

Vérifier :
- ratio maximal `1.35` ;
- ratio minimal `1.0` ;
- portrait haute densité reste plafonné ;
- intervalle rendu reste au minimum `33ms`.

- [ ] **Step 2: Implémenter la politique**

```js
function pixelRatio() {
  const pixels = innerWidth * innerHeight;
  const cap = pixels > 1_800_000 ? 1.10 : pixels > 1_000_000 ? 1.20 : 1.35;
  return Math.max(1, Math.min(devicePixelRatio || 1, cap));
}
function renderInterval() { return 33; }
```

- [ ] **Step 3: Brancher `core-render.js`**

Remplacer uniquement :

```js
renderer.setPixelRatio(Math.min(devicePixelRatio||1,1.35));
```

par :

```js
renderer.setPixelRatio(RetroRoomQuality.pixelRatio());
```

et `33` dans la boucle par `RetroRoomQuality.renderInterval()`.

- [ ] **Step 4: Exécuter les tests**

Run: `npm test && npm run check`

Expected: PASS ; aucun fichier d’émulation gelé n’est modifié.

- [ ] **Step 5: Commit**

```bash
git add src/room-quality.js src/core-render.js index.html tests/room-quality.test.mjs
git commit -m "perf: add adaptive Three.js quality budget"
```

---

### Task 7: Vérification portrait, paysage et CRT avant livraison du TEST

**Files:**
- Modify: `docs/validation/retro-room-visual.md`
- Generated only: `dist/RetroRoom_TEST.html`

**Interfaces:**
- Consumes: build-test tool du plan de stabilisation.
- Produces: captures/validation portrait et paysage et un fichier TEST épinglé au SHA final.

- [ ] **Step 1: Créer le document de validation visuelle**

Inclure les critères binaires :
- CRT DOM alignée au verre en portrait ;
- CRT DOM alignée au verre en paysage ;
- deck sur une ligne ;
- D-pad et boutons hors CRT ;
- bibliothèque n’écrase pas les safe areas ;
- aucun gros objet ne traverse la TV ou les murs ;
- chambre visiblement plus dense que le baseline ;
- pas de retour à une dominante néon saturée.

- [ ] **Step 2: Lancer les tests automatisés**

Run: `npm test && npm run check`

Expected: PASS.

- [ ] **Step 3: Générer le fichier TEST au SHA exact**

Run: `node tools/build-test.mjs $(git rev-parse HEAD)`

- [ ] **Step 4: Test Android sans ROM**

Expected: la pièce s’affiche, le CRT et les contrôles restent correctement placés, la nouvelle densité visuelle est visible.

- [ ] **Step 5: Smoke test avec une ROM arcade validée**

Utiliser CPS II `sfa.zip` ou un CPS I déjà validé.

Expected: les performances restent jouables et le jeu reste contenu dans le CRT.

- [ ] **Step 6: Smoke test d’un système non arcade validé**

Utiliser Game Gear ou WonderSwan/Color validé lors du plan précédent.

Expected: profil tactile correct et aucun effet visuel ne recouvre les contrôles.

- [ ] **Step 7: Commit de validation**

```bash
git add docs/validation/retro-room-visual.md
git commit -m "docs: validate RetroRoom visual realism pass"
```

---

### Task 8: Livraison finale de cette passe sans déploiement

**Files:**
- Generated only: `dist/RetroRoom_TEST.html`

**Interfaces:**
- Produces: un seul fichier utilisateur pour Android et un dépôt GitHub synchronisé.

- [ ] **Step 1: Vérifier l’état git**

Run: `git status --short`

Expected: aucun fichier source non commit.

- [ ] **Step 2: Relancer la suite complète**

Run: `npm test && npm run check`

Expected: PASS.

- [ ] **Step 3: Générer le TEST sur le dernier commit**

Run: `node tools/build-test.mjs $(git rev-parse HEAD)`

- [ ] **Step 4: Vérifier le launcher**

Run: `grep -n 'src="/src/\|href="/src/' dist/RetroRoom_TEST.html`

Expected: aucune sortie.

- [ ] **Step 5: Fournir `dist/RetroRoom_TEST.html` au chat**

Ne pas déployer sur Vercel. Le test utilisateur reste local et utilise les ressources du commit GitHub épinglé.
