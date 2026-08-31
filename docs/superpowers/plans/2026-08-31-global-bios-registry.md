# Global BIOS Registry Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make one BIOS selection index firmware for all known RetroRoom/ES-DE systems, even when no ROM for those systems is currently present.

**Architecture:** Add a data-only `src/bios-catalog.js` registry containing verified filenames/patterns grouped by canonical system ID, then evolve `src/bios-support.js` into a generic indexer that can register multiple firmware files per system without changing library visibility. Existing V6.26.2 PS1 and 3DO launch behavior remains authoritative; new BIOS families are recognized first and only wired into a core when that system's launch path is implemented or validated.

**Tech Stack:** Browser JavaScript, Node.js `node:test`, existing ZIP/7Z/RAR extraction path in V6.26.2, EmulatorJS 4.2.3, official Libretro core firmware naming as reference.

**Spec:** `docs/superpowers/specs/2026-08-31-esde-catalog-global-bios-design.md`

## Global Constraints

- BIOS scanning is independent from ROM/system visibility.
- Selecting a BIOS folder must never make a system appear in the library.
- Existing 3DO BIOS filenames and PS1 BIOS behavior from V6.26.2 must not regress.
- No BIOS binary is distributed by RetroRoom.
- No hash is invented. Hashes are metadata only when sourced from official core documentation; filename matching remains the primary compatibility mechanism unless a launch path explicitly requires hash validation.
- ZIP/7Z/RAR BIOS archive inspection remains available.
- A firmware may be optional for a core and still be recognized by the registry.
- Public `main` is updated only after local automated tests and Android validation.

---

### Task 1: Create the verified firmware catalog

**Files:**
- Create: `src/bios-catalog.js`
- Test: `tests/bios-catalog.test.cjs`

**Interfaces:**
- Produces: `BiosCatalog.CATALOG`, `BiosCatalog.entriesFor(systemId)`, `BiosCatalog.matchFilename(name)`, `BiosCatalog.matchForSystem(systemId,name)`, `BiosCatalog.systemsForFilename(name)`.
- Consumes: canonical system IDs from `src/system-catalog.js` when available, but remains CommonJS-testable by itself.

- [ ] **Step 1: Write failing tests for cross-system recognition**

```js
const test = require('node:test');
const assert = require('node:assert/strict');
const BiosCatalog = require('../src/bios-catalog.js');

test('recognizes validated 3DO and PS1 firmware names', () => {
  assert.equal(BiosCatalog.matchForSystem('threeDO','PANAFZ1.BIN')?.id, 'panafz1');
  assert.equal(BiosCatalog.matchForSystem('psx','SCPH5501.BIN')?.id, 'scph5501');
  assert.equal(BiosCatalog.matchForSystem('psx','PSXONPSP660.BIN')?.id, 'psxonpsp660');
});

test('recognizes future system BIOS without any ROM state', () => {
  assert.equal(BiosCatalog.systemsForFilename('sega_101.bin').includes('segaSaturn'), true);
  assert.equal(BiosCatalog.systemsForFilename('bios_CD_U.bin').includes('segaCD'), true);
  assert.equal(BiosCatalog.systemsForFilename('dc_boot.bin').includes('dreamcast'), true);
  assert.equal(BiosCatalog.systemsForFilename('pcfx.rom').includes('pcfx'), true);
  assert.equal(BiosCatalog.systemsForFilename('lynxboot.img').includes('lynx'), true);
});

test('recognizes shared Nintendo firmware', () => {
  assert.equal(BiosCatalog.systemsForFilename('gba_bios.bin').includes('gba'), true);
  assert.equal(BiosCatalog.systemsForFilename('bios7.bin').includes('nds'), true);
  assert.equal(BiosCatalog.systemsForFilename('disksys.rom').includes('nes'), true);
});
```

- [ ] **Step 2: Run RED**

Run: `node --test tests/bios-catalog.test.cjs`
Expected: FAIL because `src/bios-catalog.js` does not exist.

- [ ] **Step 3: Implement the catalog API and concrete verified entries**

Use this entry format:

```js
{
  id: 'scph5501',
  systems: ['psx'],
  names: ['scph5501.bin'],
  required: false,
  description: 'PlayStation US BIOS'
}
```

The first catalog must include at minimum these verified families and names:

```text
3DO
panafz1.bin
panafz10.bin
panafz10-norsa.bin
panafz10e-anvil.bin
panafz10e-anvil-norsa.bin
panafz1j.bin
panafz1j-norsa.bin
goldstar.bin
sanyotry.bin
3do_arcade_saot.bin

PlayStation
scph5500.bin
scph5501.bin
scph5502.bin
scph1001.bin
scph101.bin
scph7001.bin
PSXONPSP660.bin
ps1_rom.bin
openbios.bin

Game Boy / Game Boy Color / GBA / Super Game Boy
gb_bios.bin
gbc_bios.bin
gba_bios.bin
sgb_bios.bin

Nintendo DS / DSi
bios7.bin
bios9.bin
firmware.bin
dsi_bios7.bin
dsi_bios9.bin
dsi_firmware.bin
dsi_nand.bin
dsi_sd_card.bin

Famicom Disk System
disksys.rom

Sega CD / Mega-CD
bios_CD_E.bin
bios_CD_U.bin
bios_CD_J.bin

Sega Saturn
sega_101.bin
mpr-17933.bin
saturn_bios.bin
kronos/saturn_bios.bin
kronos/stvbios.zip
mpr-18811-mx.ic1
mpr-19367-mx.ic1

Dreamcast / Naomi / Atomiswave
dc_boot.bin
dc_flash.bin
naomi.zip
naomi2.zip
awbios.zip
hod2bios.zip
f355dlx.zip
f355bios.zip
airlbios.zip
segasp.zip

PC Engine CD / SuperGrafx
syscard3.pce
syscard2.pce
syscard1.pce
gexpress.pce

PC-FX
pcfx.rom

Atari Lynx
lynxboot.img

Atari Jaguar CD optional overrides
[BIOS] Atari Jaguar CD (World).j64
[BIOS] Atari Jaguar Developer CD (World).j64

ColecoVision
colecovision.rom
coleco.rom

Odyssey2 / Videopac
o2rom.bin
c52.bin
g7400.bin
jopac.bin

MSX / MSX2
MSX.ROM
MSX2.ROM
MSX2EXT.ROM
MSX2P.ROM
MSX2PEXT.ROM
DISK.ROM
FMPAC.ROM
MSXDOS2.ROM
PAINTER.ROM
KANJI.ROM

Philips CD-i
cdibios.zip
cdimono1.zip
cdimono2.zip

Intellivision
exec.bin
grom.bin

Atari 7800
7800 BIOS (U).rom

Atari 8-bit / 5200 family
ATARIBAS.ROM
ATARIOSA.ROM
ATARIOSB.ROM

Amiga / A600 / A1200 / CDTV / CD32
kick31034.A1000
kick32034.A1000
kick33180.A500
kick34005.A500
kick37175.A500
kick37350.A600
kick40063.A600
kick39106.A1200
kick40068.A1200
kick39106.A4000
kick40068.A4000
kick34005.CDTV
kick40060.CD32
kick40060.CD32.ext
```

Use case-insensitive exact matching. Preserve slash-containing logical names such as `kronos/saturn_bios.bin` as aliases, while also allowing the basename `saturn_bios.bin` to match Saturn because a browser folder picker may flatten the selected file's `.name` while retaining path information separately.

- [ ] **Step 4: Run GREEN**

Run: `node --test tests/bios-catalog.test.cjs`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add src/bios-catalog.js tests/bios-catalog.test.cjs
git commit -m "feat: add global BIOS catalog"
```

---

### Task 2: Generalize BIOS storage from one 3DO file to a multi-system index

**Files:**
- Modify: `src/bios-support.js`
- Test: `tests/bios-support.test.cjs`

**Interfaces:**
- Consumes: `BiosCatalog.matchFilename`, `BiosCatalog.matchForSystem`.
- Produces: existing methods plus `indexFiles(files)`, `biosFilesFor(systemId)`, `allIndexed()`, `hasBios(systemId)`.

- [ ] **Step 1: Write failing tests for independent indexing**

Extend `tests/bios-support.test.cjs`:

```js
test('one BIOS selection indexes multiple systems independently', () => {
  const files = [
    {name:'panafz1.bin'},
    {name:'scph5501.bin'},
    {name:'sega_101.bin'},
    {name:'pcfx.rom'}
  ];
  const result = BiosSupport.indexFiles(files);
  assert.equal(result.matched, 4);
  assert.equal(BiosSupport.hasBios('threeDO'), true);
  assert.equal(BiosSupport.hasBios('psx'), true);
  assert.equal(BiosSupport.hasBios('segaSaturn'), true);
  assert.equal(BiosSupport.hasBios('pcfx'), true);
});

test('indexing BIOS does not depend on ROM state', () => {
  BiosSupport.indexFiles([{name:'dc_boot.bin'}]);
  assert.equal(BiosSupport.biosFilesFor('dreamcast').length, 1);
});
```

Keep the existing 3DO tests unchanged.

- [ ] **Step 2: Run RED**

Run: `node --test tests/bios-support.test.cjs`
Expected: FAIL because `indexFiles`, `hasBios` and `biosFilesFor` do not exist.

- [ ] **Step 3: Implement multi-system indexing while preserving old API**

Replace the single `biosFiles` concept with:

```js
const biosFiles = new Map(); // systemId -> Map<entryId, File>

function store(systemId, entryId, file){
  if(!biosFiles.has(systemId)) biosFiles.set(systemId, new Map());
  biosFiles.get(systemId).set(entryId, file);
}

function indexFiles(files){
  let matched = 0;
  for(const file of Array.from(files || [])){
    const hits = BiosCatalog.matchFilename(file.name);
    if(!hits.length) continue;
    matched++;
    for(const hit of hits){
      for(const systemId of hit.systems) store(systemId, hit.id, file);
    }
  }
  return {matched, total:Array.from(files||[]).length};
}

function biosFilesFor(systemId){return [...(biosFiles.get(systemId)?.values() || [])];}
function hasBios(systemId){return biosFilesFor(systemId).length > 0;}
function allIndexed(){return biosFiles;}
```

Keep `setBios(systemId,file)` and `biosFor(systemId)` backward-compatible. `biosFor` returns the preferred single file for launch paths that still expect one BIOS. For 3DO and PS1, preference order must remain V6.26.2-compatible.

- [ ] **Step 4: Run GREEN**

Run: `node --test tests/bios-support.test.cjs tests/bios-catalog.test.cjs`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add src/bios-support.js tests/bios-support.test.cjs
git commit -m "feat: index BIOS for every known system"
```

---

### Task 3: Preserve 3DO/PS1 preferred BIOS selection and archive extraction

**Files:**
- Modify: `src/bios-support.js`
- Modify: `index.html`
- Test: `tests/bios-preference.test.cjs`
- Test: `tests/release-regressions.test.cjs`

**Interfaces:**
- Consumes: multi-system BIOS index from Task 2.
- Produces: `preferredBios(systemId)` and runtime compatibility with `EJS_biosUrl` paths already validated for PS1/3DO.

- [ ] **Step 1: Write failing preference tests**

```js
const test = require('node:test');
const assert = require('node:assert/strict');
const BiosSupport = require('../src/bios-support.js');

test('3DO keeps panafz1 preference when several Opera BIOS files exist', () => {
  const p10 = {name:'panafz10.bin'};
  const p1 = {name:'panafz1.bin'};
  BiosSupport.indexFiles([p10,p1]);
  assert.equal(BiosSupport.preferredBios('threeDO'), p1);
});

test('PS1 follows the V6.26 preference order', () => {
  const f5502 = {name:'scph5502.bin'};
  const f5501 = {name:'scph5501.bin'};
  const psp = {name:'PSXONPSP660.bin'};
  BiosSupport.indexFiles([f5502,f5501,psp]);
  assert.equal(BiosSupport.preferredBios('psx'), psp);
});
```

Use the PS1 order already validated in V6.26.2:

```text
PSXONPSP660.bin
scph101.bin
scph7001.bin
scph5501.bin
scph1001.bin
scph5502.bin
scph5500.bin
ps1_rom.bin
openbios.bin
```

- [ ] **Step 2: Run RED**

Run: `node --test tests/bios-preference.test.cjs`
Expected: FAIL because `preferredBios` does not exist.

- [ ] **Step 3: Implement preferred BIOS selection**

Add exact order tables for `threeDO` and `psx`, and default to the first indexed firmware for recognition-only systems:

```js
function preferredBios(systemId){
  const files = biosFilesFor(systemId);
  const order = PREFERENCE[systemId] || [];
  for(const wanted of order){
    const hit = files.find(file => normalizeName(file.name) === wanted);
    if(hit) return hit;
  }
  return files[0] || '';
}
```

Preserve the existing ZIP/7Z/RAR extraction code in `index.html`: extracted entries must pass through the same `BiosCatalog` matcher and be indexed exactly like raw files.

Do not wire Saturn/Dreamcast/etc. to `EJS_biosUrl` in this task. This plan recognizes their firmware globally; launch integration remains system-specific work when those cores are validated.

- [ ] **Step 4: Run GREEN and release regressions**

Run: `node --test tests/bios-preference.test.cjs tests/bios-support.test.cjs tests/bios-catalog.test.cjs tests/release-regressions.test.cjs`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add src/bios-support.js index.html tests/bios-preference.test.cjs
git commit -m "feat: preserve preferred BIOS selection"
```

---

### Task 4: Improve BIOS scan reporting without exposing systems

**Files:**
- Modify: `index.html`
- Test: `tests/bios-ui-regression.test.cjs`

**Interfaces:**
- Consumes: `BiosSupport.indexFiles`, `BiosSupport.allIndexed`.
- Produces: user-facing BIOS scan summary only; no library mutation.

- [ ] **Step 1: Write a source regression test**

```js
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const html = fs.readFileSync('index.html','utf8');

test('BIOS scan does not add library entries or system cards', () => {
  assert.doesNotMatch(html, /indexFiles\([^)]*\)[\s\S]{0,300}library\.push/);
  assert.doesNotMatch(html, /indexFiles\([^)]*\)[\s\S]{0,300}renderSystems/);
});
```

- [ ] **Step 2: Run the test**

Run: `node --test tests/bios-ui-regression.test.cjs`
Expected: PASS on a correct implementation; if it fails, stop and remove the coupling.

- [ ] **Step 3: Report useful BIOS counts**

After scan, show a compact status derived only from the BIOS index:

```text
BIOS : 34 fichiers reconnus • 12 systèmes couverts
```

Do not list systems in the ROM library and do not alter the ROM-system count.

For ignored BIOS files, keep them ignored silently except for the aggregate count; this avoids flooding the UI when the user selects a large all-in-one BIOS pack.

- [ ] **Step 4: Run complete tests**

Run: `npm test`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add index.html tests/bios-ui-regression.test.cjs
git commit -m "feat: report global BIOS scan coverage"
```

---

### Task 5: Build and validate the combined ES-DE + BIOS test release

**Files:**
- Modify: `index.html` on implementation branch
- Do not publish yet: `README.md`, `RELEASE_SHA256.txt` on `main`

**Interfaces:**
- Consumes the completed ES-DE system-catalog plan plus Tasks 1-4 above.
- Produces one Android-testable HTML artifact.

- [ ] **Step 1: Run the complete automated suite**

Run: `npm test`
Expected: PASS.

- [ ] **Step 2: Syntax-check inline scripts**

Extract each inline `<script>` block and run `node --check`. Expected: no syntax errors.

- [ ] **Step 3: Build local artifact**

Name: `RetroRoom_V6_27_ESDE_GLOBAL_BIOS_TEST.html`.

- [ ] **Step 4: Android acceptance test**

With the user's large BIOS folder selected and ES-DE ROM structure loaded, verify:

```text
BIOS folder can contain firmware for absent systems
-> BIOS scan recognizes them
-> ROM system count does not change
-> empty ES-DE folders remain invisible
-> PS1 still boots Gran Turismo 2 CUE/BIN directly
-> 3DO still boots a known working title
-> N64 controller layout remains correct
-> QUITTER -> BIBLIO -> another game works without rescan
```

- [ ] **Step 5: Publish only after explicit validation**

After the Android test is confirmed, update `README.md`, `index.html`, `RELEASE_SHA256.txt`, run tests again, then promote the validated release to `main`.
