# RetroRoom Stabilisation Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Verrouiller les chemins d’émulation déjà validés, rendre la détection de bibliothèque testable et terminer la validation Game Gear, WonderSwan/Color, Neo Geo Pocket/Color et LowRes NX sans régression CPS I/CPS II.

**Architecture:** Le moteur navigateur reste statique et sans framework. Les tests utilisent uniquement `node:test` et `node:vm` afin de vérifier les fichiers browser existants sans introduire de bundler. La détection de dossier est extraite de `library.js` vers une unité pure `library-detect.js`, puis `library.js` continue de gérer uniquement l’interface et le lancement.

**Tech Stack:** HTML/CSS/JavaScript statique, Three.js CDN, EmulatorJS 4.2.3, LowRes NX WebAssembly, Node.js built-in test runner.

## Global Constraints

- CPS I : FBNeo — validé ; ne pas modifier son core, son lancement ou son profil tactile sauf bug reproduit.
- CPS II : FBA2012 CPS-2 compat — validé avec `sfa.zip` ; ne pas modifier son core, son lancement ou son profil tactile sauf bug reproduit.
- EmulatorJS reste dans le document principal.
- LowRes NX reste isolé dans son iframe.
- Les contrôles tactiles restent hors de la CRT et sans chevauchement.
- Nintendo Switch reste catalogue uniquement ; aucun faux core Switch.
- Le dossier parent a priorité sur l’extension quand un format est ambigu.
- Le fichier de test utilisateur reste un seul HTML à télécharger et ouvrir.
- Aucun déploiement Vercel pendant ce plan.

---

### Task 1: Ajouter un harnais de régression sans dépendance

**Files:**
- Create: `package.json`
- Create: `tests/helpers/browser-script.mjs`
- Create: `tests/core-config.test.mjs`
- Create: `tests/controls-layout.test.mjs`

**Interfaces:**
- Consumes: `src/core-config.js`, `src/controls-layout.js`.
- Produces: `loadBrowserScript(path, appendCode, globals)` pour exécuter les scripts browser dans `node:vm`, plus une commande unique `npm test`.

- [ ] **Step 1: Créer le helper de test browser**

```js
// tests/helpers/browser-script.mjs
import fs from 'node:fs';
import vm from 'node:vm';

export function loadBrowserScript(path, appendCode = '', globals = {}) {
  const source = fs.readFileSync(path, 'utf8') + '\n' + appendCode;
  const sandbox = {
    console,
    window: {},
    document: {
      getElementById: () => ({ appendChild() {}, value: 'auto' }),
      querySelectorAll: () => [],
      createElement: () => ({ appendChild() {}, insertAdjacentElement() {} })
    },
    ...globals
  };
  vm.createContext(sandbox);
  vm.runInContext(source, sandbox, { filename: path });
  return sandbox;
}
```

- [ ] **Step 2: Écrire les tests de gel des cores**

```js
// tests/core-config.test.mjs
import test from 'node:test';
import assert from 'node:assert/strict';
import { loadBrowserScript } from './helpers/browser-script.mjs';

function loadCatalog() {
  return loadBrowserScript(
    'src/core-config.js',
    'globalThis.__SYSTEMS = SYSTEMS; globalThis.__AUTO_EXT = AUTO_EXT;'
  );
}

test('CPS I stays on FBNeo arcade', () => {
  const { __SYSTEMS } = loadCatalog();
  assert.equal(__SYSTEMS.cps1.core, 'arcade');
  assert.equal(__SYSTEMS.cps1.profile, 'arcade6');
});

test('CPS II keeps compatibility core', () => {
  const { __SYSTEMS } = loadCatalog();
  assert.ok(['fbalpha2012_cps2', 'arcade'].includes(__SYSTEMS.cps2.core));
});

test('remaining target systems keep expected cores', () => {
  const { __SYSTEMS } = loadCatalog();
  assert.equal(__SYSTEMS.segaGG.core, 'segaGG');
  assert.equal(__SYSTEMS.ws.core, 'ws');
  assert.equal(__SYSTEMS.ngp.core, 'ngp');
  assert.equal(__SYSTEMS.lowresnx.engine, 'lowresnx');
});
```

- [ ] **Step 3: Écrire les tests de profils tactiles**

```js
// tests/controls-layout.test.mjs
import test from 'node:test';
import assert from 'node:assert/strict';
import { loadBrowserScript } from './helpers/browser-script.mjs';

test('validated systems have controller profiles', () => {
  const { __PROFILES } = loadBrowserScript(
    'src/controls-layout.js',
    'globalThis.__PROFILES = PROFILES;'
  );
  for (const id of ['two', 'ws', 'lowres', 'arcade6']) assert.ok(__PROFILES[id]);
  assert.equal(__PROFILES.ws.wsToggle, true);
  assert.equal(__PROFILES.arcade6.faces.length, 6);
});
```

- [ ] **Step 4: Ajouter les scripts npm**

```json
{
  "name": "retro-room-electron-libre",
  "private": true,
  "scripts": {
    "test": "node --test tests/*.test.mjs",
    "check": "node --check src/core-config.js && node --check src/emu-launch.js && node --check src/emu-lowres.js && node --check src/library.js"
  }
}
```

- [ ] **Step 5: Exécuter le harnais**

Run: `npm test && npm run check`

Expected: tous les tests passent et tous les scripts ciblés passent `node --check`.

- [ ] **Step 6: Commit**

```bash
git add package.json tests
git commit -m "test: freeze RetroRoom emulator baseline"
```

---

### Task 2: Extraire et tester la détection de bibliothèque

**Files:**
- Create: `src/library-detect.js`
- Modify: `src/library.js`
- Modify: `index.html`
- Create: `tests/library-detect.test.mjs`

**Interfaces:**
- Produces: `globalThis.RetroRoomLibraryDetect` avec `normalizeToken(s)`, `extOf(file)`, `candidate(file)`, `folderSystem(file)`, `resolveSystem(file, detectByExtension)`.
- Consumes: `detectSystem(name)` fourni par `core-config.js` uniquement comme fonction injectée à `resolveSystem`.

- [ ] **Step 1: Écrire les tests de cas réellement rencontrés**

```js
// tests/library-detect.test.mjs
import test from 'node:test';
import assert from 'node:assert/strict';
import { loadBrowserScript } from './helpers/browser-script.mjs';

const { __D } = loadBrowserScript(
  'src/library-detect.js',
  'globalThis.__D = RetroRoomLibraryDetect;'
);
const f = (name, path, size = 1024) => ({ name, webkitRelativePath: path, size });
const noExtDetection = () => null;

test('folder wins over ambiguous ZIP', () => {
  assert.equal(__D.resolveSystem(f('Arcade Classics.zip', 'Roms/gamegear/Arcade Classics.zip'), noExtDetection), 'segaGG');
});

test('WonderSwan aliases map to ws', () => {
  assert.equal(__D.resolveSystem(f('game.zip', 'Roms/wonderswan/game.zip'), noExtDetection), 'ws');
  assert.equal(__D.resolveSystem(f('game.zip', 'Roms/wonderswancolor/game.zip'), noExtDetection), 'ws');
});

test('Neo Geo Pocket Color aliases map to ngp', () => {
  assert.equal(__D.resolveSystem(f('game.zip', 'Roms/Neogeo pocket color/game.zip'), noExtDetection), 'ngp');
});

test('Switch is catalogued, not unknown', () => {
  assert.equal(__D.resolveSystem(f('Mario.xci', 'Roms/switch/Mario.xci'), noExtDetection), 'switch');
});

test('.nomedia is ignored', () => {
  assert.equal(__D.candidate(f('.nomedia', 'Roms/.nomedia', 1)), false);
});
```

- [ ] **Step 2: Exécuter le test avant extraction**

Run: `node --test tests/library-detect.test.mjs`

Expected: FAIL parce que `src/library-detect.js` n’existe pas encore.

- [ ] **Step 3: Créer l’unité pure de détection**

```js
// src/library-detect.js
(() => {
  const SKIP = new Set(['png','jpg','jpeg','gif','webp','bmp','svg','txt','md','nfo','ini','db','pdf','xml','json','log','sav','srm','rtc','ips','ups','bps','cht','bak','tmp','state','thumbnail','nomedia']);
  const FOLDER_MAP = new Map(Object.entries({
    'gamegear':'segaGG','game gear':'segaGG','gg':'segaGG',
    'wonderswan':'ws','wonder swan':'ws','wonderswancolor':'ws','wonderswan color':'ws','wonder swan color':'ws','wscolor':'ws','wsc':'ws',
    'ngp':'ngp','ngpc':'ngp','neogeopocket':'ngp','neo geo pocket':'ngp','neogeopocketcolor':'ngp','neogeo pocket color':'ngp','neo geo pocket color':'ngp',
    'cps1':'cps1','cps 1':'cps1','cps2':'cps2','cps 2':'cps2','lowresnx':'lowresnx','lowres nx':'lowresnx',
    'switch':'switch','nintendo switch':'switch'
  }));
  const COMPACT = new Map([...FOLDER_MAP].map(([k,v]) => [k.replace(/\s+/g,''),v]));
  const normalizeToken = s => String(s || '').toLowerCase().replace(/[_\-.]+/g,' ').replace(/\s+/g,' ').trim();
  const extOf = file => { const p = file.name.split('.'); return p.length > 1 ? p.pop().toLowerCase() : ''; };
  function candidate(file) { const ext = extOf(file); return !!ext && !SKIP.has(ext) && file.size > 0; }
  function folderSystem(file) {
    const rel = file.webkitRelativePath || '';
    if (!rel.includes('/')) return null;
    const parts = rel.split('/').slice(0,-1).map(normalizeToken);
    for (let i = parts.length - 1; i >= 0; i--) {
      const token = parts[i];
      const hit = FOLDER_MAP.get(token) || COMPACT.get(token.replace(/\s+/g,''));
      if (hit) return hit;
    }
    return null;
  }
  function resolveSystem(file, detectByExtension) {
    return folderSystem(file) || detectByExtension(file.name) || null;
  }
  globalThis.RetroRoomLibraryDetect = { normalizeToken, extOf, candidate, folderSystem, resolveSystem };
})();
```

Pendant l’implémentation, recopier aussi dans `FOLDER_MAP` les alias déjà présents dans `library.js` pour Master System, Mega Drive, Nintendo, Sony, Atari, NEC, ordinateurs et arcade ; ne supprimer aucun alias actuel.

- [ ] **Step 4: Brancher `library.js` sur l’unité pure**

Dans `src/library.js`, remplacer les définitions locales de `SKIP`, `FOLDER_MAP`, `normalizeToken`, `extOf`, `folderSystem`, `candidate` et `resolveSystem` par :

```js
const D = globalThis.RetroRoomLibraryDetect;
const normalizeToken = D.normalizeToken;
const extOf = D.extOf;
const candidate = D.candidate;
const resolveSystem = file => D.resolveSystem(file, detectSystem);
```

Conserver tout le rendu, la recherche, les cartes et `launchEntry()` inchangés.

- [ ] **Step 5: Charger le détecteur avant `library.js`**

Dans `index.html`, ajouter :

```html
<script src="/src/library-detect.js"></script>
<script src="/src/library.js"></script>
```

- [ ] **Step 6: Exécuter les tests**

Run: `npm test && npm run check`

Expected: PASS ; `Arcade Classics.zip` sous `gamegear` reste Game Gear, WonderSwan Color et NGPC sont reconnus, Switch est catalogué, `.nomedia` est ignoré.

- [ ] **Step 7: Commit**

```bash
git add src/library-detect.js src/library.js index.html tests/library-detect.test.mjs
git commit -m "refactor: make ROM folder detection testable"
```

---

### Task 3: Verrouiller le comportement catalogue Switch

**Files:**
- Modify: `src/catalog-compat.js`
- Create: `tests/catalog-compat.test.mjs`

**Interfaces:**
- Consumes: `SYSTEMS`, `AUTO_EXT`, `launchRom`.
- Produces: `SYSTEMS.switch.engine === 'unsupported'`, extensions `xci/nsp/nsz/xcz`, et blocage explicite avant EmulatorJS.

- [ ] **Step 1: Écrire le test catalogue**

Le test charge `core-config.js`, puis `catalog-compat.js` avec des stubs pour `romName`, `setStatus`, `showToast` et `launchRom`, et vérifie :

```js
assert.equal(SYSTEMS.switch.engine, 'unsupported');
assert.equal(AUTO_EXT.xci, 'switch');
assert.equal(AUTO_EXT.nsp, 'switch');
```

- [ ] **Step 2: Lancer le test**

Run: `node --test tests/catalog-compat.test.mjs`

Expected: PASS si le comportement actuel est intact ; sinon corriger uniquement `catalog-compat.js`.

- [ ] **Step 3: Vérifier que la bibliothèque marque Switch comme catalogue**

Run: `grep -n "CATALOGUE SEUL\|engine==='unsupported'" src/library.js src/catalog-compat.js`

Expected: la carte système et les lignes de jeux utilisent l’état `unsupported` et ne passent jamais à `launchRom` EmulatorJS.

- [ ] **Step 4: Commit si modification nécessaire**

```bash
git add src/catalog-compat.js tests/catalog-compat.test.mjs
git commit -m "test: lock Switch catalog-only behavior"
```

---

### Task 4: Préparer la matrice de validation des quatre systèmes restants

**Files:**
- Create: `docs/validation/retro-room-systems.md`

**Interfaces:**
- Produces: une matrice de validation manuelle reproductible pour Android local `content://`.

- [ ] **Step 1: Créer la matrice**

Le document doit contenir exactement les colonnes : `Système | Détection dossier | Core/engine attendu | Profil tactile | CRT contenue | Résultat | Gelé`.

Préremplir :

```text
Game Gear | segaGG | segaGG | two
WonderSwan / Color | ws | ws | ws
Neo Geo Pocket / Color | ngp | ngp | two
LowRes NX | lowresnx | iframe LowRes NX | lowres
```

Et conserver CPS I/CPS II en haut comme `VALIDÉ / GELÉ`.

- [ ] **Step 2: Ajouter le protocole de test utilisateur**

Pour chaque système : `BIBLIO → système → une ROM simple → vérifier lancement → vérifier touches → vérifier CRT → NEW`.

- [ ] **Step 3: Commit**

```bash
git add docs/validation/retro-room-systems.md
git commit -m "docs: add Android system validation matrix"
```

---

### Task 5: Vérifier statiquement les quatre chemins avant test Android

**Files:**
- Modify only if a failing assertion proves it necessary: `src/core-config.js`, `src/controls-layout.js`, `src/emu-lowres.js`
- Create: `tests/target-systems.test.mjs`

**Interfaces:**
- Consumes: configuration système et profils existants.
- Produces: assertions empêchant les régressions de core/profile.

- [ ] **Step 1: Écrire les assertions**

```js
assert.deepEqual(
  {
    gg: [SYSTEMS.segaGG.core, SYSTEMS.segaGG.profile],
    ws: [SYSTEMS.ws.core, SYSTEMS.ws.profile],
    ngp: [SYSTEMS.ngp.core, SYSTEMS.ngp.profile],
    lowres: [SYSTEMS.lowresnx.engine, SYSTEMS.lowresnx.profile]
  },
  {
    gg: ['segaGG','two'],
    ws: ['ws','ws'],
    ngp: ['ngp','two'],
    lowres: ['lowresnx','lowres']
  }
);
```

Ajouter un test texte sur `src/emu-lowres.js` vérifiant la présence de `iframe`, `srcdoc`, `retro-lowres-key` et l’absence d’injection EmulatorJS dans ce chemin.

- [ ] **Step 2: Exécuter les tests**

Run: `npm test && npm run check`

Expected: PASS sans modifier les chemins validés.

- [ ] **Step 3: Corriger uniquement si un test échoue**

Aucune réécriture préventive : modifier seulement la propriété ou le mapping explicitement incorrect.

- [ ] **Step 4: Commit**

```bash
git add tests/target-systems.test.mjs src/core-config.js src/controls-layout.js src/emu-lowres.js
git commit -m "test: lock remaining target system paths"
```

---

### Task 6: Automatiser le fichier TEST unique

**Files:**
- Create: `tools/build-test.mjs`
- Create: `tests/build-test.test.mjs`
- Create at runtime only: `dist/RetroRoom_TEST.html`

**Interfaces:**
- Command: `node tools/build-test.mjs <40-char-commit-sha>`.
- Produces: `dist/RetroRoom_TEST.html` qui pointe tous les `/src/...` vers `https://cdn.jsdelivr.net/gh/BriskoBrice/Retro-Room-by-l-lectron-libre@<sha>/src/...`.

- [ ] **Step 1: Écrire le test du générateur**

Le test crée un HTML temporaire contenant `/src/a.js`, appelle la fonction de transformation et vérifie :

```js
assert.match(output, /cdn\.jsdelivr\.net\/gh\/BriskoBrice\/Retro-Room-by-l-lectron-libre@[0-9a-f]{40}\/src\/a\.js/);
assert.doesNotMatch(output, /src="\/src\//);
```

- [ ] **Step 2: Exécuter le test avant implémentation**

Run: `node --test tests/build-test.test.mjs`

Expected: FAIL parce que le générateur n’existe pas.

- [ ] **Step 3: Implémenter le générateur**

Le script doit : lire `index.html`, vérifier l’argument avec `/^[0-9a-f]{40}$/`, remplacer `href="/src/` et `src="/src/` par la base jsDelivr épinglée, créer `dist/`, puis écrire `dist/RetroRoom_TEST.html`.

- [ ] **Step 4: Exécuter les tests**

Run: `npm test && npm run check`

Expected: PASS.

- [ ] **Step 5: Générer le TEST sur le commit courant**

Run: `node tools/build-test.mjs $(git rev-parse HEAD)`

Expected: `dist/RetroRoom_TEST.html` existe et ne contient aucune référence racine `/src/`.

- [ ] **Step 6: Commit du générateur, pas du fichier dist**

```bash
git add tools/build-test.mjs tests/build-test.test.mjs package.json
git commit -m "build: automate single-file Android test launcher"
```

---

### Task 7: Gate de validation Android avant toute grosse passe graphique

**Files:**
- Modify after user results: `docs/validation/retro-room-systems.md`

**Interfaces:**
- Consumes: `dist/RetroRoom_TEST.html` généré au commit stabilisé.
- Produces: quatre lignes validées ou un bug reproduit précisément.

- [ ] **Step 1: Fournir le TEST utilisateur généré au commit stabilisé**

Le fichier donné dans le chat doit correspondre au SHA exact du dépôt.

- [ ] **Step 2: Valider Game Gear**

Expected: jeu démarre dans la CRT ; profil deux boutons ; aucune UI EmulatorJS parasite.

- [ ] **Step 3: Valider WonderSwan / Color**

Expected: jeu démarre ; profil `ws` ; toggle X/Y reste utilisable ; CRT propre.

- [ ] **Step 4: Valider Neo Geo Pocket / Color**

Expected: jeu démarre ; profil deux boutons ; CRT propre.

- [ ] **Step 5: Valider LowRes NX**

Expected: iframe LowRes NX démarre ; A/B/directions/pause répondent ; aucun conflit avec EmulatorJS.

- [ ] **Step 6: Rejouer un smoke test CPS I et CPS II**

Expected: un jeu CPS I et `sfa.zip` CPS II démarrent encore avec leurs profils arcade inchangés.

- [ ] **Step 7: Mettre la matrice à jour et commit**

```bash
git add docs/validation/retro-room-systems.md
git commit -m "docs: freeze validated RetroRoom systems"
```

**Gate:** ne pas commencer le plan visuel tant que les quatre systèmes restants ne sont pas soit validés, soit explicitement marqués incompatibles avec une raison reproduite.
