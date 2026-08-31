# ES-DE System Catalog Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make RetroRoom know the full ES-DE folder catalog while displaying only systems that contain at least one real game file.

**Architecture:** Add a focused `src/system-catalog.js` module as the single source of truth for canonical system IDs, ES-DE folder aliases, game extensions and support state. `src/library.js` consumes that module for folder-first detection and filtering; `src/core-config.js` keeps the existing launch definitions for already-supported systems and receives catalog-only entries without inventing cores.

**Tech Stack:** Browser JavaScript, Node.js `node:test`, EmulatorJS 4.2.3, existing RetroRoom HTML release.

**Spec:** `docs/superpowers/specs/2026-08-31-esde-catalog-global-bios-design.md`

## Global Constraints

- Base behavior is RetroRoom V6.26.2.
- Empty ES-DE folders containing only `systeminfo.txt` must never appear.
- `systems.txt` and `.nomedia` must never count as ROMs.
- Folder name wins over extension during full-folder scans.
- Extension detection remains a fallback for loose files.
- PS1 CUE/BIN canonicalization must remain one game entry.
- 3DO CUE/BIN canonicalization must remain one game entry.
- N64 touch layout/stick, 3DO global pad, FAST SCAN and CLEAN EXIT must not regress.
- Unsupported systems are `catalog-only`; they are visible only when real game content exists and must not try to load a nonexistent core.
- Public `main` and `RELEASE_SHA256.txt` are updated only after Android validation.

---

### Task 1: Create the canonical ES-DE system registry

**Files:**
- Create: `src/system-catalog.js`
- Test: `tests/system-catalog.test.cjs`

**Interfaces:**
- Produces: `SystemCatalog.CATALOG`, `SystemCatalog.canonicalFromFolder(name)`, `SystemCatalog.system(id)`, `SystemCatalog.isKnownFolder(name)`, `SystemCatalog.isGameExtension(id, ext)`, `SystemCatalog.supportState(id)`.
- Consumes: no production module.

- [ ] **Step 1: Write the failing registry tests**

```js
const test = require('node:test');
const assert = require('node:assert/strict');
const SystemCatalog = require('../src/system-catalog.js');

test('ES-DE aliases resolve to one canonical system', () => {
  assert.equal(SystemCatalog.canonicalFromFolder('megadrive'), 'segaMD');
  assert.equal(SystemCatalog.canonicalFromFolder('genesis'), 'segaMD');
  assert.equal(SystemCatalog.canonicalFromFolder('megadrivejp'), 'segaMD');
  assert.equal(SystemCatalog.canonicalFromFolder('saturnjp'), 'segaSaturn');
  assert.equal(SystemCatalog.canonicalFromFolder('atarijaguar'), 'jaguar');
});

test('catalog knows ES-DE folders that RetroRoom cannot launch yet', () => {
  assert.equal(SystemCatalog.isKnownFolder('ps3'), true);
  assert.equal(SystemCatalog.supportState(SystemCatalog.canonicalFromFolder('ps3')), 'catalog-only');
});

test('known systems expose game extensions', () => {
  assert.equal(SystemCatalog.isGameExtension('jaguar', 'j64'), true);
  assert.equal(SystemCatalog.isGameExtension('segaMD', 'md'), true);
  assert.equal(SystemCatalog.isGameExtension('psx', 'cue'), true);
});
```

- [ ] **Step 2: Run the test and verify RED**

Run: `node --test tests/system-catalog.test.cjs`
Expected: FAIL because `src/system-catalog.js` does not exist.

- [ ] **Step 3: Implement the UMD/CommonJS catalog shell and canonical aliases**

Use this public API shape:

```js
(function(root, factory){
  const api = factory();
  if(typeof module !== 'undefined' && module.exports) module.exports = api;
  if(root) root.SystemCatalog = api;
})(typeof globalThis !== 'undefined' ? globalThis : this, function(){
  'use strict';

  const CATALOG = {
    segaMD: {
      label: 'MEGA DRIVE / GENESIS',
      folders: ['megadrive','genesis','megadrivejp'],
      exts: ['md','gen','smd','mdx','68k','sgd'],
      support: 'supported'
    },
    segaSaturn: {
      label: 'SEGA SATURN',
      folders: ['saturn','saturnjp'],
      exts: ['cue','chd','iso'],
      support: 'supported'
    },
    jaguar: {
      label: 'ATARI JAGUAR',
      folders: ['atarijaguar'],
      exts: ['j64','jag','abs','cof'],
      support: 'supported'
    },
    ps3: {
      label: 'PLAYSTATION 3',
      folders: ['ps3'],
      exts: ['iso','pkg'],
      support: 'catalog-only'
    }
  };

  const folderToId = new Map();
  for(const [id, entry] of Object.entries(CATALOG)){
    for(const folder of entry.folders || []) folderToId.set(normalize(folder), id);
  }

  function normalize(value){return String(value||'').toLowerCase().trim();}
  function canonicalFromFolder(name){return folderToId.get(normalize(name)) || null;}
  function system(id){return CATALOG[id] || null;}
  function isKnownFolder(name){return !!canonicalFromFolder(name);}
  function isGameExtension(id, ext){return !!system(id)?.exts?.includes(normalize(ext).replace(/^\./,''));}
  function supportState(id){return system(id)?.support || null;}

  return {CATALOG, canonicalFromFolder, system, isKnownFolder, isGameExtension, supportState};
});
```

Then expand `CATALOG` to cover every ES-DE folder listed in the approved spec. Existing RetroRoom-supported systems keep their current canonical IDs (`gb`, `gba`, `nes`, `snes`, `n64`, `nds`, `vb`, `segaGG`, `segaMS`, `segaMD`, `sega32x`, `segaCD`, `segaSaturn`, `psx`, `psp`, `atari2600`, `a5200`, `atari7800`, `lynx`, `jaguar`, `pce`, `pcfx`, `ngp`, `ws`, `coleco`, `threeDO`, `cdi`, `doom`, `c64`, `c128`, `vic20`, `plus4`, `pet`, `amiga`, `zx81`, `spectrum`, `amstrad`, `dos`, arcade IDs). New systems use stable IDs matching their ES-DE folder unless an alias converges on an existing canonical ID.

- [ ] **Step 4: Run registry tests GREEN**

Run: `node --test tests/system-catalog.test.cjs`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add src/system-catalog.js tests/system-catalog.test.cjs
git commit -m "feat: add ES-DE system catalog"
```

---

### Task 2: Move folder-first detection and non-game filtering into testable helpers

**Files:**
- Create: `src/library-scan.js`
- Test: `tests/library-scan.test.cjs`

**Interfaces:**
- Consumes: `SystemCatalog.canonicalFromFolder`, `SystemCatalog.isGameExtension`.
- Produces: `LibraryScan.extOf(file)`, `LibraryScan.folderSystem(file)`, `LibraryScan.isIgnoredFile(file)`, `LibraryScan.isIgnoredPath(file)`, `LibraryScan.resolveSystem(file, fallbackDetect)`, `LibraryScan.isGameCandidate(file, fallbackDetect)`.

- [ ] **Step 1: Write failing scan tests for the exact ES-DE structure**

```js
const test = require('node:test');
const assert = require('node:assert/strict');
const LibraryScan = require('../src/library-scan.js');

function f(name, rel, size=100){return {name, webkitRelativePath: rel, size};}

test('systeminfo alone does not activate Jaguar', () => {
  const info = f('systeminfo.txt', 'Roms/atarijaguar/systeminfo.txt', 1100);
  assert.equal(LibraryScan.isGameCandidate(info), false);
});

test('a Jaguar ROM is a game candidate and resolves from the folder', () => {
  const rom = f('Alien vs Predator.j64', 'Roms/atarijaguar/Alien vs Predator.j64');
  assert.equal(LibraryScan.isGameCandidate(rom), true);
  assert.equal(LibraryScan.resolveSystem(rom), 'jaguar');
});

test('root metadata never counts as games', () => {
  assert.equal(LibraryScan.isGameCandidate(f('systems.txt','Roms/systems.txt',4800)), false);
  assert.equal(LibraryScan.isGameCandidate(f('.nomedia','Roms/.nomedia',0)), false);
});

test('media folders never create false games', () => {
  const cover = f('game.jpg','Roms/atarijaguar/media/covers/game.jpg',50000);
  const video = f('game.mp4','Roms/atarijaguar/videos/game.mp4',1000000);
  assert.equal(LibraryScan.isGameCandidate(cover), false);
  assert.equal(LibraryScan.isGameCandidate(video), false);
});

test('folder context wins for ambiguous disc extensions', () => {
  assert.equal(LibraryScan.resolveSystem(f('game.bin','Roms/psx/game.bin')), 'psx');
  assert.equal(LibraryScan.resolveSystem(f('game.bin','Roms/3do/game.bin')), 'threeDO');
});
```

- [ ] **Step 2: Run RED**

Run: `node --test tests/library-scan.test.cjs`
Expected: FAIL because `library-scan.js` does not exist.

- [ ] **Step 3: Implement minimal scan helpers**

Use these constants and rules:

```js
const SKIP_EXT = new Set([
  'png','jpg','jpeg','gif','webp','bmp','svg','mp4','mkv','webm','avi','mov',
  'txt','md','nfo','ini','db','pdf','xml','json','log','sav','srm','rtc',
  'ips','ups','bps','cht','bak','tmp','state','thumbnail','nomedia'
]);
const SKIP_NAMES = new Set(['systeminfo.txt','systems.txt','.nomedia']);
const MEDIA_DIRS = new Set(['media','images','image','covers','cover','boxart','videos','video','screenshots','screenshot','snaps','snap','manuals','manual']);
```

`folderSystem(file)` must inspect `webkitRelativePath`, ignore the selected root name, and use the first recognized ES-DE system-folder segment. `resolveSystem(file, fallbackDetect)` returns folder result first, then fallback extension detector. `isGameCandidate` rejects zero-byte files, ignored names/extensions/media paths, then requires a recognized system plus an extension accepted by that system, or a positive fallback detector for loose-file mode.

- [ ] **Step 4: Run GREEN**

Run: `node --test tests/library-scan.test.cjs`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add src/library-scan.js tests/library-scan.test.cjs
git commit -m "feat: add ES-DE aware library scanner"
```

---

### Task 3: Integrate the catalog into RetroRoom without exposing empty systems

**Files:**
- Modify: `src/core-config.js`
- Modify: `src/library.js`
- Modify: `index.html`
- Test: `tests/library-default-all.test.cjs`
- Test: `tests/system-catalog.test.cjs`
- Test: `tests/library-scan.test.cjs`

**Interfaces:**
- Consumes: `SystemCatalog.CATALOG`, `SystemCatalog.supportState`, `LibraryScan.resolveSystem`, `LibraryScan.isGameCandidate`.
- Produces: runtime `SYSTEMS[id]` entries for supported and catalog-only systems; library groups only from actual `library` entries.

- [ ] **Step 1: Add failing integration assertions**

Extend `tests/system-catalog.test.cjs` with:

```js
test('empty ES-DE folders do not need runtime SYSTEMS entries to be visible', () => {
  assert.equal(SystemCatalog.canonicalFromFolder('xbox360'), 'xbox360');
  assert.equal(SystemCatalog.supportState('xbox360'), 'catalog-only');
});
```

Add a source-level regression test `tests/library-source-integration.test.cjs`:

```js
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const source = fs.readFileSync('src/library.js','utf8');

test('library uses shared scan helpers instead of a private FOLDER_MAP', () => {
  assert.match(source, /LibraryScan\.isGameCandidate/);
  assert.match(source, /LibraryScan\.resolveSystem/);
  assert.doesNotMatch(source, /const FOLDER_MAP=/);
});
```

- [ ] **Step 2: Run RED**

Run: `node --test tests/system-catalog.test.cjs tests/library-scan.test.cjs tests/library-source-integration.test.cjs`
Expected: integration test FAIL on current `library.js`.

- [ ] **Step 3: Wire modules into runtime**

In `src/core-config.js`, after existing supported `SYSTEMS` definitions, merge catalog-only definitions without overwriting supported runtime config:

```js
for(const [id, entry] of Object.entries(globalThis.SystemCatalog?.CATALOG || {})){
  if(!SYSTEMS[id]){
    SYSTEMS[id] = {
      label: entry.label,
      profile: entry.profile || 'two',
      exts: entry.exts || [],
      engine: 'unsupported'
    };
  }
}
```

In `src/library.js`:

- remove private `FOLDER_MAP`, `FOLDER_COMPACT`, `folderSystem`, `specialDiscSystem`, `candidate` duplication;
- replace scan filtering with `LibraryScan.isGameCandidate(file, detectSystem)`;
- replace system resolution with `LibraryScan.resolveSystem(file, detectSystem)`;
- keep `groupsFor(rows)` based only on entries actually present in `library`;
- preserve the existing `engine==='unsupported'` rendering and launch guard;
- do not populate cards from the catalog alone.

In `index.html`, load `system-catalog.js` and `library-scan.js` before `core-config.js`/`library.js`. During local test builds, pin them to the working commit or inline them consistently with the current release mechanism; do not point public `main` at an uncommitted branch.

- [ ] **Step 4: Run all Node tests GREEN**

Run: `npm test`
Expected: all tests PASS.

- [ ] **Step 5: Commit**

```bash
git add src/core-config.js src/library.js index.html tests/library-source-integration.test.cjs tests/system-catalog.test.cjs
git commit -m "feat: detect ES-DE systems dynamically"
```

---

### Task 4: Preserve disc canonicalization and validated controller regressions

**Files:**
- Test: `tests/release-regressions.test.cjs`
- Modify only if a regression is found: `index.html`, related `src/*.js`

**Interfaces:**
- Consumes the final test-build `index.html`.
- Produces automated gates for PS1 direct CUE, 3DO global pad and N64 stick attachment.

- [ ] **Step 1: Add release regression tests**

Create `tests/release-regressions.test.cjs` that reads `index.html` and asserts these exact release contracts:

```js
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const html = fs.readFileSync('index.html','utf8');

test('PS1 direct CUE fix remains present', () => {
  assert.match(html, /if\(ext==='cue'\)[\s\S]*EJS_gameUrl=file[\s\S]*EJS_disableCue=false/);
});

test('3DO global pad remains L P R over A B C', () => {
  assert.match(html, /face\('L',10,'six1'/);
  assert.match(html, /face\('P',3,'six2'/);
  assert.match(html, /face\('R',11,'six3'/);
  assert.doesNotMatch(html, /POING|PIED/);
});

test('N64 analog stick is attached inside app', () => {
  assert.match(html, /app\.appendChild\(analogStick\)/);
});
```

- [ ] **Step 2: Run RED/GREEN check**

Run: `node --test tests/release-regressions.test.cjs`
Expected: PASS on V6.26.2 before any further changes. If it fails, stop and reconcile the regex with the validated release before continuing.

- [ ] **Step 3: Run the complete suite after integration**

Run: `npm test`
Expected: PASS with no regression.

- [ ] **Step 4: Commit**

```bash
git add tests/release-regressions.test.cjs
git commit -m "test: lock V6.26.2 runtime regressions"
```

---

### Task 5: Build a local ES-DE catalog test release and validate on Android

**Files:**
- Modify: `index.html` on the implementation branch only
- Do not modify yet: `README.md`, `RELEASE_SHA256.txt` on public `main`

**Interfaces:**
- Consumes completed Tasks 1-4.
- Produces one downloadable local HTML test build.

- [ ] **Step 1: Run syntax checks on every inline script**

Extract inline `<script>` blocks and run `node --check` on each temporary JS file. Expected: every script reports no syntax error.

- [ ] **Step 2: Run automated tests**

Run: `npm test`
Expected: PASS.

- [ ] **Step 3: Create the local test artifact**

Name: `RetroRoom_V6_27_ESDE_CATALOG_TEST.html`.

The artifact must include the new catalog/scanner behavior while preserving the validated V6.26.2 runtime patches.

- [ ] **Step 4: Android acceptance test**

Use the user's ES-DE-generated `Roms` folder. Verify:

```text
atarijaguar/systeminfo.txt only -> Jaguar absent
ps3/systeminfo.txt only         -> PS3 absent
3do/real games                  -> 3DO present
psx/real games                  -> PS1 present
atariLynx/real games            -> Lynx present
gamegear/real games             -> Game Gear present
```

Then add one real ROM to a previously empty known folder such as `atarijaguar`; rescan; expected: Jaguar appears without a code change.

- [ ] **Step 5: Do not publish yet**

Keep public `main` at V6.26.2 until the Android acceptance test is explicitly confirmed.
