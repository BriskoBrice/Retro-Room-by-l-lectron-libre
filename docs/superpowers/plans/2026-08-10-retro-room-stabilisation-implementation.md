# RetroRoom Stabilisation Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Verrouiller les chemins d’émulation déjà validés, rendre la détection de bibliothèque testable et terminer la validation Game Gear, WonderSwan/Color, Neo Geo Pocket/Color et LowRes NX sans régression CPS I/CPS II.

**Architecture:** Le projet reste HTML/CSS/JavaScript statique. Les tests utilisent uniquement `node:test` et `node:vm`, sans bundler ni dépendance runtime. La détection des ROMs devient une unité pure séparée de l’UI de bibliothèque ; EmulatorJS, LowRes NX et les contrôles existants gardent leurs architectures actuelles.

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
- Produces: `loadBrowserScripts(paths, appendCode, globals)`.
- Consumes: scripts browser globaux actuels sans les convertir en modules.

- [ ] **Step 1: Créer le helper `node:vm`**

```js
// tests/helpers/browser-script.mjs
import fs from 'node:fs';
import vm from 'node:vm';

export function loadBrowserScripts(paths, appendCode = '', globals = {}) {
  const systemSelect = {
    value: 'auto',
    appendChild() {},
    querySelector() { return null; }
  };
  const sandbox = {
    console,
    window: {},
    document: {
      getElementById(id) { return id === 'systemSelect' ? systemSelect : { appendChild() {}, value: 'auto' }; },
      querySelectorAll() { return []; },
      createElement() { return { appendChild() {}, insertAdjacentElement() {}, textContent: '', value: '' }; }
    },
    ...globals
  };
  vm.createContext(sandbox);
  for (const path of paths) {
    vm.runInContext(fs.readFileSync(path, 'utf8'), sandbox, { filename: path });
  }
  if (appendCode) vm.runInContext(appendCode, sandbox);
  return sandbox;
}
```

- [ ] **Step 2: Écrire les tests du comportement final des cores**

```js
// tests/core-config.test.mjs
import test from 'node:test';
import assert from 'node:assert/strict';
import { loadBrowserScripts } from './helpers/browser-script.mjs';

function loadFinalCatalog() {
  return loadBrowserScripts(
    ['src/core-config.js', 'src/arcade-compat.js', 'src/catalog-compat.js'],
    'globalThis.__SYSTEMS=SYSTEMS; globalThis.__AUTO_EXT=AUTO_EXT;'
  );
}

test('CPS I stays FBNeo', () => {
  const { __SYSTEMS } = loadFinalCatalog();
  assert.equal(__SYSTEMS.cps1.core, 'arcade');
  assert.equal(__SYSTEMS.cps1.profile, 'arcade6');
});

test('CPS II stays FBA2012 compatibility core', () => {
  const { __SYSTEMS } = loadFinalCatalog();
  assert.equal(__SYSTEMS.cps2.core, 'fbalpha2012_cps2');
  assert.equal(__SYSTEMS.cps2.controlScheme, 'arcade');
  assert.equal(__SYSTEMS.cps2.profile, 'arcade6');
});

test('target systems keep expected engines and cores', () => {
  const { __SYSTEMS } = loadFinalCatalog();
  assert.deepEqual(
    [__SYSTEMS.segaGG.core, __SYSTEMS.ws.core, __SYSTEMS.ngp.core, __SYSTEMS.lowresnx.engine],
    ['segaGG', 'ws', 'ngp', 'lowresnx']
  );
});

test('Switch remains catalog-only', () => {
  const { __SYSTEMS, __AUTO_EXT } = loadFinalCatalog();
  assert.equal(__SYSTEMS.switch.engine, 'unsupported');
  assert.equal(__AUTO_EXT.xci, 'switch');
  assert.equal(__AUTO_EXT.nsp, 'switch');
});
```

- [ ] **Step 3: Écrire le test des profils tactiles**

```js
// tests/controls-layout.test.mjs
import test from 'node:test';
import assert from 'node:assert/strict';
import { loadBrowserScripts } from './helpers/browser-script.mjs';

test('required controller profiles stay available', () => {
  const { __PROFILES } = loadBrowserScripts(
    ['src/controls-layout.js'],
    'globalThis.__PROFILES=PROFILES;'
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
    "check": "node --check src/core-config.js && node --check src/arcade-compat.js && node --check src/catalog-compat.js && node --check src/emu-launch.js && node --check src/emu-lowres.js && node --check src/library.js"
  }
}
```

- [ ] **Step 5: Exécuter le harnais**

Run: `npm test && npm run check`

Expected: PASS.

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
- Produces: `globalThis.RetroRoomLibraryDetect` avec `normalizeToken`, `extOf`, `candidate`, `folderSystem`, `specialDiscSystem`, `resolveSystem`.
- `resolveSystem(file, detectByExtension)` conserve exactement l’ordre : dossier parent → détection extension → détection image disque par chemin.

- [ ] **Step 1: Écrire les tests des bugs réellement observés**

```js
// tests/library-detect.test.mjs
import test from 'node:test';
import assert from 'node:assert/strict';
import { loadBrowserScripts } from './helpers/browser-script.mjs';

const { __D } = loadBrowserScripts(
  ['src/library-detect.js'],
  'globalThis.__D=RetroRoomLibraryDetect;'
);
const f = (name, path, size = 1024) => ({ name, webkitRelativePath: path, size });
const noExt = () => null;

test('folder wins over ambiguous ZIP', () => {
  assert.equal(__D.resolveSystem(f('Arcade Classics.zip','Roms/gamegear/Arcade Classics.zip'), noExt), 'segaGG');
});

test('WonderSwan and WonderSwan Color aliases map to ws', () => {
  assert.equal(__D.resolveSystem(f('a.zip','Roms/wonderswan/a.zip'), noExt), 'ws');
  assert.equal(__D.resolveSystem(f('b.zip','Roms/wonderswancolor/b.zip'), noExt), 'ws');
});

test('Neo Geo Pocket Color aliases map to ngp', () => {
  assert.equal(__D.resolveSystem(f('c.zip','Roms/Neogeo pocket color/c.zip'), noExt), 'ngp');
});

test('Switch folder is catalogued', () => {
  assert.equal(__D.resolveSystem(f('Mario.xci','Roms/switch/Mario.xci'), noExt), 'switch');
});

test('.nomedia is ignored', () => {
  assert.equal(__D.candidate(f('.nomedia','Roms/.nomedia',1)), false);
});
```

- [ ] **Step 2: Lancer le test avant extraction**

Run: `node --test tests/library-detect.test.mjs`

Expected: FAIL parce que `src/library-detect.js` n’existe pas.

- [ ] **Step 3: Créer `src/library-detect.js` avec tous les alias actuels**

```js
(() => {
  const SKIP = new Set([
    'png','jpg','jpeg','gif','webp','bmp','svg','txt','md','nfo','ini','db','pdf','xml','json','log',
    'sav','srm','rtc','ips','ups','bps','cht','bak','tmp','state','thumbnail','nomedia'
  ]);

  const FOLDER_MAP = new Map(Object.entries({
    'gamegear':'segaGG','game gear':'segaGG','gg':'segaGG',
    'mastersystem':'segaMS','master system':'segaMS','sms':'segaMS',
    'megadrive':'segaMD','mega drive':'segaMD','genesis':'segaMD','sega genesis':'segaMD',
    '32x':'sega32x','segacd':'segaCD','sega cd':'segaCD','megacd':'segaCD','mega cd':'segaCD','saturn':'segaSaturn',
    'gb':'gb','gameboy':'gb','game boy':'gb','gbc':'gb','gameboycolor':'gb','game boy color':'gb',
    'gba':'gba','gameboyadvance':'gba','game boy advance':'gba',
    'nes':'nes','famicom':'nes','snes':'snes','supernintendo':'snes','super nintendo':'snes',
    'superfamicom':'snes','super famicom':'snes','n64':'n64','nintendo64':'n64','nintendo 64':'n64',
    'nds':'nds','nintendods':'nds','nintendo ds':'nds','virtualboy':'vb','virtual boy':'vb',
    'switch':'switch','nintendo switch':'switch','nswitch':'switch',
    'psx':'psx','ps1':'psx','playstation':'psx','playstation1':'psx','psp':'psp',
    'wonderswan':'ws','wonder swan':'ws','wonderswancolor':'ws','wonderswan color':'ws',
    'wonder swan color':'ws','wscolor':'ws','wsc':'ws',
    'ngp':'ngp','ngpc':'ngp','neogeopocket':'ngp','neo geo pocket':'ngp',
    'neogeopocketcolor':'ngp','neogeo pocket color':'ngp','neo geo pocket color':'ngp',
    'pcengine':'pce','pc engine':'pce','turbografx':'pce','supergrafx':'pce','pcfx':'pcfx','pc fx':'pcfx',
    'atari2600':'atari2600','atari 2600':'atari2600','atari5200':'a5200','atari 5200':'a5200',
    'atari7800':'atari7800','atari 7800':'atari7800','lynx':'lynx','jaguar':'jaguar',
    'cps1':'cps1','cps 1':'cps1','cpsi':'cps1','cps2':'cps2','cps 2':'cps2','cpsii':'cps2',
    'cps3':'cps3','cps 3':'cps3','cpsiii':'cps3','neogeo':'neogeo','neo geo':'neogeo',
    'fbneo':'arcade','arcade':'arcade','mame':'mame2003',
    'lowres':'lowresnx','lowresnx':'lowresnx','lowres nx':'lowresnx',
    'amiga':'amiga','c64':'c64','commodore64':'c64','commodore 64':'c64',
    'spectrum':'spectrum','zxspectrum':'spectrum','zx spectrum':'spectrum','amstrad':'amstrad',
    'coleco':'coleco','3do':'threeDO','cdi':'cdi','cd i':'cdi'
  }));

  const COMPACT = new Map([...FOLDER_MAP].map(([name,id]) => [name.replace(/\s+/g,''), id]));
  const normalizeToken = s => String(s || '').toLowerCase().replace(/[_\-.]+/g,' ').replace(/\s+/g,' ').trim();
  const extOf = file => { const p = file.name.split('.'); return p.length > 1 ? p.pop().toLowerCase() : ''; };

  function candidate(file) {
    const ext = extOf(file);
    return !!ext && !SKIP.has(ext) && file.size > 0;
  }

  function folderSystem(file) {
    const rel = file.webkitRelativePath || '';
    if (!rel.includes('/')) return null;
    const segments = rel.split('/').slice(0,-1).map(normalizeToken);
    for (let i = segments.length - 1; i >= 0; i--) {
      const token = segments[i];
      const hit = FOLDER_MAP.get(token) || COMPACT.get(token.replace(/\s+/g,''));
      if (hit) return hit;
    }
    return null;
  }

  function specialDiscSystem(file) {
    const ext = extOf(file);
    const path = normalizeToken(file.webkitRelativePath || file.name);
    if (!['cue','chd','iso','bin','img','mdf','pbp'].includes(ext)) return null;
    if (path.includes('saturn')) return 'segaSaturn';
    if (path.includes('mega cd') || path.includes('sega cd') || path.includes('megacd') || path.includes('segacd')) return 'segaCD';
    if (path.includes('psx') || path.includes('ps1') || path.includes('playstation')) return 'psx';
    if (path.includes('pcfx') || path.includes('pc fx')) return 'pcfx';
    if (path.includes('3do')) return 'threeDO';
    if (path.includes('cdi') || path.includes('cd i')) return 'cdi';
    return null;
  }

  function resolveSystem(file, detectByExtension) {
    return folderSystem(file) || detectByExtension(file.name) || specialDiscSystem(file) || null;
  }

  globalThis.RetroRoomLibraryDetect = {
    normalizeToken, extOf, candidate, folderSystem, specialDiscSystem, resolveSystem
  };
})();
```

- [ ] **Step 4: Brancher `library.js` sur ce module sans toucher au rendu/lancement**

Remplacer uniquement les helpers de détection par :

```js
const D = globalThis.RetroRoomLibraryDetect;
const normalizeToken = D.normalizeToken;
const extOf = D.extOf;
const candidate = D.candidate;
const resolveSystem = file => D.resolveSystem(file, detectSystem);
```

Conserver `renderSystems`, `renderGames`, `scan`, `launchEntry` et les listeners fonctionnellement identiques.

- [ ] **Step 5: Charger le module avant `library.js`**

```html
<script src="/src/library-detect.js"></script>
<script src="/src/library.js"></script>
```

- [ ] **Step 6: Étendre le script `check`**

Ajouter `node --check src/library-detect.js` à `npm run check`.

- [ ] **Step 7: Exécuter les tests**

Run: `npm test && npm run check`

Expected: PASS.

- [ ] **Step 8: Commit**

```bash
git add src/library-detect.js src/library.js index.html package.json tests/library-detect.test.mjs
git commit -m "refactor: make ROM folder detection testable"
```

---

### Task 3: Verrouiller le catalogue Switch et les plateformes non lançables

**Files:**
- Create: `tests/catalog-compat.test.mjs`
- Modify only if test fails: `src/catalog-compat.js`

**Interfaces:**
- Consumes: `SYSTEMS`, `AUTO_EXT`, `launchRom`.
- Produces: Switch reconnu comme `engine: 'unsupported'` et jamais envoyé à EmulatorJS.

- [ ] **Step 1: Écrire le test**

Charger `core-config.js` puis `catalog-compat.js` dans le même contexte et vérifier :

```js
assert.equal(SYSTEMS.switch.label, 'NINTENDO SWITCH — CATALOGUE');
assert.equal(SYSTEMS.switch.engine, 'unsupported');
assert.deepEqual(SYSTEMS.switch.exts, ['xci','nsp','nsz','xcz']);
assert.equal(AUTO_EXT.xci, 'switch');
assert.equal(AUTO_EXT.nsp, 'switch');
```

- [ ] **Step 2: Lancer le test**

Run: `node --test tests/catalog-compat.test.mjs`

Expected: PASS avec le code actuel.

- [ ] **Step 3: Vérifier la garde UI**

Run: `grep -n "engine==='unsupported'\|CATALOGUE SEUL" src/library.js`

Expected: la bibliothèque intercepte ces entrées avant `launchRom`.

- [ ] **Step 4: Commit du test**

```bash
git add tests/catalog-compat.test.mjs
git commit -m "test: lock Switch catalog-only behavior"
```

---

### Task 4: Créer la matrice de validation Android

**Files:**
- Create: `docs/validation/retro-room-systems.md`

**Interfaces:**
- Produces: état reproductible par système et SHA des fichiers gelés.

- [ ] **Step 1: Créer le tableau**

Colonnes exactes :

```text
Système | Détection dossier | Core/engine attendu | Profil tactile | CRT contenue | Résultat | Gelé
```

Lignes initiales :

```text
CPS I | cps1 | arcade / FBNeo | arcade6 | oui | VALIDÉ | oui
CPS II | cps2 | fbalpha2012_cps2 | arcade6 | oui | VALIDÉ avec sfa.zip | oui
Game Gear | segaGG | segaGG | two | à tester | EN ATTENTE | non
WonderSwan / Color | ws | ws | ws | à tester | EN ATTENTE | non
Neo Geo Pocket / Color | ngp | ngp | two | à tester | EN ATTENTE | non
LowRes NX | lowresnx | iframe LowRes NX | lowres | à tester | EN ATTENTE | non
Nintendo Switch | switch | unsupported | aucun lancement | n/a | CATALOGUE | oui
```

- [ ] **Step 2: Ajouter le protocole manuel**

Pour chaque système lançable : `BIBLIO → système → ROM simple → lancement → touches → CRT → NEW`.

- [ ] **Step 3: Ajouter une section `Frozen source hashes`**

Au moment d’exécuter cette tâche, enregistrer :

```bash
sha256sum src/core-config.js src/arcade-compat.js src/emu-launch.js src/emu-overlay.js src/emu-lowres.js src/controls-layout.js src/controls-input.js src/controls-init.js
```

Copier les huit lignes de sortie telles quelles dans le document.

- [ ] **Step 4: Commit**

```bash
git add docs/validation/retro-room-systems.md
git commit -m "docs: add Android system validation matrix"
```

---

### Task 5: Ajouter les gardes statiques des quatre systèmes restants

**Files:**
- Create: `tests/target-systems.test.mjs`
- Modify only if a failing assertion proves it necessary: `src/core-config.js`, `src/controls-layout.js`, `src/emu-lowres.js`

**Interfaces:**
- Produces: assertions durables sur les cores, engines et profils.

- [ ] **Step 1: Écrire les assertions système**

```js
assert.deepEqual(
  {
    gameGear: [SYSTEMS.segaGG.core, SYSTEMS.segaGG.profile],
    wonderSwan: [SYSTEMS.ws.core, SYSTEMS.ws.profile],
    neoGeoPocket: [SYSTEMS.ngp.core, SYSTEMS.ngp.profile],
    lowRes: [SYSTEMS.lowresnx.engine, SYSTEMS.lowresnx.profile]
  },
  {
    gameGear: ['segaGG','two'],
    wonderSwan: ['ws','ws'],
    neoGeoPocket: ['ngp','two'],
    lowRes: ['lowresnx','lowres']
  }
);
```

- [ ] **Step 2: Écrire la garde LowRes NX**

Lire `src/emu-lowres.js` et vérifier les chaînes : `iframe`, `srcdoc`, `retro-lowres-key`, `LOWRES_JS` et `postMessage`. Vérifier aussi que le fichier ne contient pas `EJS_core` ni `EJS_gameUrl`.

- [ ] **Step 3: Exécuter**

Run: `npm test && npm run check`

Expected: PASS sans modification des fichiers gelés.

- [ ] **Step 4: Ne corriger qu’un échec reproduit**

Si un test échoue, changer uniquement la propriété exacte qui viole l’attendu, puis relancer toute la suite.

- [ ] **Step 5: Commit**

```bash
git add tests/target-systems.test.mjs
git commit -m "test: lock remaining target system paths"
```

---

### Task 6: Automatiser le fichier TEST Android unique

**Files:**
- Create: `tools/build-test.mjs`
- Create: `tests/build-test.test.mjs`
- Modify: `package.json`
- Generated only: `dist/RetroRoom_TEST.html`

**Interfaces:**
- Command: `node tools/build-test.mjs <40-char-commit-sha>`.
- Produces: launcher local qui pointe chaque `/src/...` vers le même commit jsDelivr.

- [ ] **Step 1: Écrire le test du transformateur**

Tester un HTML minimal et vérifier :

```js
assert.match(output, /cdn\.jsdelivr\.net\/gh\/BriskoBrice\/Retro-Room-by-l-lectron-libre@[0-9a-f]{40}\/src\/a\.js/);
assert.doesNotMatch(output, /src="\/src\//);
assert.doesNotMatch(output, /href="\/src\//);
```

- [ ] **Step 2: Lancer avant implémentation**

Run: `node --test tests/build-test.test.mjs`

Expected: FAIL parce que `tools/build-test.mjs` n’existe pas.

- [ ] **Step 3: Implémenter le générateur**

Le module doit exporter :

```js
export function rewriteForCommit(html, sha) {
  if (!/^[0-9a-f]{40}$/.test(sha)) throw new Error('Commit SHA invalide');
  const base = `https://cdn.jsdelivr.net/gh/BriskoBrice/Retro-Room-by-l-lectron-libre@${sha}`;
  return html
    .replaceAll('href="/src/', `href="${base}/src/`)
    .replaceAll('src="/src/', `src="${base}/src/`);
}
```

Le mode CLI lit `index.html`, crée `dist/`, puis écrit `dist/RetroRoom_TEST.html`.

- [ ] **Step 4: Ajouter le script npm**

```json
"build:test": "node tools/build-test.mjs"
```

Le SHA reste un argument CLI direct lors de l’usage réel.

- [ ] **Step 5: Exécuter la suite**

Run: `npm test && npm run check`

Expected: PASS.

- [ ] **Step 6: Générer le TEST du commit courant**

Run: `node tools/build-test.mjs $(git rev-parse HEAD)`

Expected: `dist/RetroRoom_TEST.html` existe et ne contient aucune référence racine `/src/`.

- [ ] **Step 7: Commit du générateur uniquement**

```bash
git add tools/build-test.mjs tests/build-test.test.mjs package.json
git commit -m "build: automate Android test launcher"
```

---

### Task 7: Gate de validation Android avant la passe graphique

**Files:**
- Modify: `docs/validation/retro-room-systems.md`
- Generated only: `dist/RetroRoom_TEST.html`

**Interfaces:**
- Consumes: launcher épinglé au SHA stabilisé.
- Produces: quatre systèmes validés ou une incompatibilité explicitement reproduite.

- [ ] **Step 1: Fournir le TEST généré au SHA exact**

- [ ] **Step 2: Valider Game Gear**

Expected: core `segaGG`, profil `two`, jeu dans la CRT, aucune UI EJS parasite.

- [ ] **Step 3: Valider WonderSwan / Color**

Expected: core `ws`, profil `ws`, toggle X/Y utilisable, CRT propre.

- [ ] **Step 4: Valider Neo Geo Pocket / Color**

Expected: core `ngp`, profil `two`, CRT propre.

- [ ] **Step 5: Valider LowRes NX**

Expected: iframe LowRes NX, directions/A/B/pause fonctionnels, aucun conflit global `Module` avec EmulatorJS.

- [ ] **Step 6: Rejouer CPS I et CPS II**

Expected: CPS I FBNeo et `sfa.zip` CPS II FBA2012 démarrent encore avec profil `arcade6`.

- [ ] **Step 7: Mettre la matrice à jour**

Marquer chaque ligne `VALIDÉ / gelé` ou noter l’erreur reproduite exacte.

- [ ] **Step 8: Commit**

```bash
git add docs/validation/retro-room-systems.md
git commit -m "docs: freeze validated RetroRoom systems"
```

**Gate:** le plan visuel ne commence qu’après cette validation ou après qu’un système soit explicitement classé incompatible avec une raison reproduite.
