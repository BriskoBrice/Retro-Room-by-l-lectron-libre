# RetroRoom V6.28 Fast Library Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make RetroRoom's library appear immediately on Android and avoid unnecessary full ROM rescans by combining a metadata cache, optional persistent directory handles, and a fast legacy reconnect path.

**Architecture:** Keep V6.27.5 behavior authoritative for detection and launch, and add a persistence/access layer beneath Library+. Cached metadata renders detached rows at startup. When available, File System Access directory handles are persisted and resolve known games lazily; otherwise the existing `webkitdirectory` picker reconnects cached rows by path and only performs full canonicalization when a collection fingerprint changed.

**Tech Stack:** Vanilla JavaScript, IndexedDB, localStorage fallback, File System Access API with feature detection, existing RetroRoom single-HTML runtime, Node `node:test` regression tests.

**Spec:** `docs/superpowers/specs/2026-09-03-v628-fast-library-design.md`

## Global Constraints

- Base stable release is RetroRoom V6.27.5.
- Do not store ROM Blob/File contents in IndexedDB, OPFS, or localStorage.
- Keep `webkitdirectory` as a fully functional fallback.
- Preserve PS1/3DO CUE+BIN, N64, Virtual Boy, BIOS fast index, FAST SCAN and CLEAN EXIT behavior.
- Do not reintroduce ES-DE mass media import.
- Do not update GitHub `main` until the Android phone test is validated.
- The deliverable for validation is a single local HTML test file.

---

### Task 1: Versioned library metadata cache

**Files:**
- Create: `src/library-cache-v628.js`
- Create: `tests/library-cache-v628.test.cjs`
- Modify in test build: `index.html` Library+ script around cache restore/save hooks

**Interfaces:**
- Produces: `globalThis.__RETROOM_LIBRARY_CACHE_V628__`
- Produces functions: `serializeEntry(entry)`, `serializeRows(rows, fingerprint)`, `loadLibraryCache()`, `saveLibraryCache(snapshot)`, `clearLibraryCache()`, `fingerprintFiles(files)`
- Snapshot shape: `{version:1, fingerprint:string, rows:Array<CacheRow>, savedAt:number}`

- [ ] **Step 1: Write failing cache tests**

```js
const test = require('node:test');
const assert = require('node:assert/strict');
const api = require('../src/library-cache-v628.js');

test('serializeEntry strips File bytes and keeps launch metadata', () => {
  const row = api.serializeEntry({
    file:{name:'Armageddon.cue',size:123,lastModified:456},
    name:'ARMAGEDDON',rawName:'Armageddon',path:'Roms/3do/Armageddon.cue',
    ext:'cue',systemId:'threeDO',systemLabel:'3DO'
  });
  assert.deepEqual(row, {
    name:'ARMAGEDDON',rawName:'Armageddon',path:'Roms/3do/Armageddon.cue',
    ext:'cue',systemId:'threeDO',systemLabel:'3DO',size:123,lastModified:456
  });
  assert.equal('file' in row, false);
});

test('fingerprintFiles is stable regardless of FileList order', () => {
  const a={name:'A.zip',size:10,lastModified:1,webkitRelativePath:'Roms/snes/A.zip'};
  const b={name:'B.zip',size:20,lastModified:2,webkitRelativePath:'Roms/nes/B.zip'};
  assert.equal(api.fingerprintFiles([a,b]), api.fingerprintFiles([b,a]));
});
```

- [ ] **Step 2: Run tests and confirm RED**

Run: `node --test tests/library-cache-v628.test.cjs`

Expected: FAIL because `src/library-cache-v628.js` does not exist.

- [ ] **Step 3: Implement pure serialization/fingerprint functions**

Implement a UMD-style module that exports in Node and attaches in browser. `fingerprintFiles()` sorts normalized `path|size|lastModified` strings and hashes them with a small deterministic 32-bit FNV-1a implementation; it never reads file contents.

- [ ] **Step 4: Add IndexedDB storage with localStorage fallback**

Use database `retroom-v628`, object store `state`, keys `library` and `romDirectoryHandle`. Implement `idbGet`, `idbSet`, `idbDelete` and catch all storage errors. For metadata only, fallback to localStorage key `retroom.library.v628`.

- [ ] **Step 5: Run cache tests GREEN**

Run: `node --test tests/library-cache-v628.test.cjs`

Expected: PASS.

- [ ] **Step 6: Commit design-source change when repository integration is allowed**

```bash
git add src/library-cache-v628.js tests/library-cache-v628.test.cjs
git commit -m "feat: add V6.28 library metadata cache"
```

---

### Task 2: Adaptive directory access and pruned walker

**Files:**
- Create: `src/library-folder-access-v628.js`
- Create: `tests/library-folder-access-v628.test.cjs`

**Interfaces:**
- Consumes: `__RETROOM_LIBRARY_CACHE_V628__` handle store helpers
- Produces: `globalThis.__RETROOM_FOLDER_ACCESS_V628__`
- Produces functions: `supportsDirectoryPicker()`, `annotateRelativePath(file,path)`, `walkRomDirectory(rootHandle, options)`, `resolveFileByPath(rootHandle,path)`, `resolveCueBundleByHandle(rootHandle,cuePath)`
- `walkRomDirectory()` returns `{files, allCandidateMeta, stats}`.

- [ ] **Step 1: Write failing fake-handle tests**

Create fake directory/file handles whose `values()` methods expose a tree containing `Roms/3do/Armageddon.cue`, `Roms/3do/Armageddon.bin`, `Roms/3do/systeminfo.txt`, `Roms/3do/videos/demo.mp4`, and `Roms/snes/Game.zip`. Track every fake `getFile()` call.

Assertions:

```js
assert.deepEqual(result.files.map(f=>f.webkitRelativePath).sort(), [
  'Roms/3do/Armageddon.bin',
  'Roms/3do/Armageddon.cue',
  'Roms/snes/Game.zip'
]);
assert.equal(getFileCalls.includes('systeminfo.txt'), false);
assert.equal(getFileCalls.includes('demo.mp4'), false);
```

- [ ] **Step 2: Run tests RED**

Run: `node --test tests/library-folder-access-v628.test.cjs`

Expected: FAIL because module/functions do not exist.

- [ ] **Step 3: Implement feature detection and safe path annotation**

`supportsDirectoryPicker()` returns true only when `isSecureContext !== false` and `typeof showDirectoryPicker === 'function'`. `annotateRelativePath()` tries `Object.defineProperty(file,'webkitRelativePath',{value:path,configurable:true})`, then falls back to `file.__retroomRelativePath=path`.

- [ ] **Step 4: Implement recursive walker with pruning**

Reject media/technical directories before descending. Reject technical/media extensions before calling `getFile()`. Use a bounded promise pool of 16 `getFile()` calls and yield every ~150 entries with `await new Promise(requestAnimationFrame)` in browser or `setImmediate`/`setTimeout(0)` fallback.

- [ ] **Step 5: Implement exact path resolver and CUE sibling resolver**

Traverse path segments with `getDirectoryHandle()`/`getFileHandle()`. For CUE, read only the CUE text, parse `FILE` references using the existing accepted syntax, and retrieve only referenced siblings. Return `{cue, refs, files, externalFiles}`.

- [ ] **Step 6: Run fake-handle tests GREEN**

Run: `node --test tests/library-folder-access-v628.test.cjs`

Expected: PASS and zero `getFile()` calls for skipped technical/media entries.

- [ ] **Step 7: Commit when integration is allowed**

```bash
git add src/library-folder-access-v628.js tests/library-folder-access-v628.test.cjs
git commit -m "feat: add adaptive ROM folder access"
```

---

### Task 3: Fast legacy reconnect by cached fingerprint

**Files:**
- Create: `tests/library-reconnect-v628.test.cjs`
- Modify: `src/library-cache-v628.js`
- Modify in test build: Library+ `scanPlus()` and `retroom-fast-folder-scan` listener

**Interfaces:**
- Produces: `attachCachedRows(cacheRows, files)` -> `{rows,missing}`
- Cached attached row shape equals Library+ entry shape with a real `file` property.

- [ ] **Step 1: Write failing reconnect tests**

```js
test('attachCachedRows reconnects canonical CUE rows without promoting BIN tracks', () => {
  const cacheRows=[{path:'Roms/3do/Armageddon.cue',name:'ARMAGEDDON',rawName:'Armageddon',ext:'cue',systemId:'threeDO',systemLabel:'3DO'}];
  const files=[
    fakeFile('Roms/3do/Armageddon.cue',100),
    fakeFile('Roms/3do/Armageddon.bin',1000)
  ];
  const out=api.attachCachedRows(cacheRows,files);
  assert.equal(out.rows.length,1);
  assert.equal(out.rows[0].file.name,'Armageddon.cue');
  assert.deepEqual(out.missing,[]);
});
```

- [ ] **Step 2: Run RED**

Run: `node --test tests/library-reconnect-v628.test.cjs`

- [ ] **Step 3: Implement normalized path map reconnect**

Build one `Map(normalizedPath -> File)` and attach by exact cached path. Never fuzzy-match. Return missing paths separately.

- [ ] **Step 4: Integrate fingerprint shortcut into Library+**

On `retroom-fast-folder-scan`, compute the same raw-ROM fingerprint used when the cache was saved. If fingerprint matches and all cached canonical rows attach, set `rows` from attached cache and render immediately without 3DO/PS1 canonicalization. If fingerprint differs or any cached canonical row is missing, call existing `scanPlus(snapshot)` unchanged, then persist a fresh cache.

- [ ] **Step 5: Run reconnect tests GREEN and existing regressions**

Run:

```bash
node --test tests/library-reconnect-v628.test.cjs tests/library-cache-v628.test.cjs tests/library-folder-access-v628.test.cjs
```

Expected: PASS.

---

### Task 4: Cached startup and lazy launch rehydration

**Files:**
- Modify in test build: Library+ initialization and `launchEntryPlus()`
- Create: `tests/library-v628-integration.test.cjs`

**Interfaces:**
- Consumes: cache snapshot and folder-access resolver
- Adds `file:null` cached rows at startup
- Produces global dev diagnostics: `globalThis.__RETROOM_V628_DIAG__`

- [ ] **Step 1: Write failing integration marker tests**

Assert the test HTML contains:

```js
assert.match(html,/CACHE •/);
assert.match(html,/__RETROOM_LIBRARY_CACHE_V628__/);
assert.match(html,/__RETROOM_FOLDER_ACCESS_V628__/);
assert.match(html,/rehydrateCachedEntry/);
assert.doesNotMatch(html,/esdeFolderBtn/);
```

- [ ] **Step 2: Run RED on V6.27.5**

Run: `node --test tests/library-v628-integration.test.cjs`

Expected: FAIL because V6.28 markers are absent.

- [ ] **Step 3: Restore cached rows before the first Library+ render**

After `rows=[]`, asynchronously load the cache. Convert each cached row to an entry with `file:null`, set `rows`, update the library badge and render if the library is open. Never erase cache because a picker was cancelled.

- [ ] **Step 4: Add lazy `rehydrateCachedEntry(entry)`**

Order:
1. return entry when `entry.file` exists;
2. if a session path map exists, attach exact file and return;
3. if stored directory handle permission is granted, resolve exact path;
4. for `.cue`, resolve referenced siblings and set the existing PS1/3DO scan globals to the small resolved bundle;
5. otherwise prompt the user with the existing ROMS button and leave the cached library visible.

Change `launchEntryPlus()` to await rehydration only for detached cached entries. Keep existing `launchRom(file)` path untouched after rehydration.

- [ ] **Step 5: Keep user-facing status simple**

Detached cache: `CACHE • N ROMS`.
Connected handle or legacy session: `PRÊT • N ROMS`.
After scan/reconnect: toast `Bibliothèque prête en X,X s`.
Detailed values stay in `__RETROOM_V628_DIAG__` only.

- [ ] **Step 6: Run integration tests GREEN**

Run: `node --test tests/library-v628-integration.test.cjs`

---

### Task 5: ROMS button modern path with automatic fallback

**Files:**
- Modify in test build: ROMS button binding / fast scan bootstrap
- Modify: `src/library-folder-access-v628.js`
- Extend: `tests/library-folder-access-v628.test.cjs`

**Interfaces:**
- Produces `connectRomDirectoryFromGesture()` -> `{mode:'handle'|'legacy', ...}`

- [ ] **Step 1: Add tests for picker decision logic**

Test three cases: modern API usable, modern API absent, modern picker throws `SecurityError`. The latter two must return legacy fallback rather than fail the library.

- [ ] **Step 2: Run RED**

Run: `node --test tests/library-folder-access-v628.test.cjs`

- [ ] **Step 3: Implement ROMS capture handler**

On user tap, if modern picker is usable, stop the old button path and call `showDirectoryPicker({id:'retroom-roms',mode:'read'})`. Persist handle, walk/prune, feed resulting File array into the existing `retroom-fast-folder-scan` pipeline, and save cache. On unsupported/security failure, trigger the hidden legacy `romFolderInput` exactly as V6.27.5 does.

- [ ] **Step 4: Restore stored handle on startup without prompting**

Load handle from IndexedDB and call `queryPermission({mode:'read'})`. If `granted`, mark connected. If `prompt`, do not call `requestPermission()` automatically; wait for ROMS/user launch gesture. If denied, keep cache only.

- [ ] **Step 5: Run tests GREEN**

Run: `node --test tests/library-folder-access-v628.test.cjs`

---

### Task 6: Full regression and performance validation artifact

**Files:**
- Generate: `/mnt/data/RetroRoom_V6_28_FAST_LIBRARY_TEST.html`
- Create: `/mnt/data/test_v628_regressions.js`
- Keep public GitHub `main` unchanged

**Interfaces:**
- Deliverable is one clickable local HTML test file.

- [ ] **Step 1: Build the single-file test HTML**

Start byte-for-byte from V6.27.5 final and inject the reviewed V6.28 modules/scripts. Change only the title to `Retro Room V6.28 — FAST LIBRARY TEST — L’électron libre`.

- [ ] **Step 2: Run all Node tests**

Run:

```bash
node --test tests/*.test.cjs
```

Expected: zero failures.

- [ ] **Step 3: Syntax-check every inline script**

Extract each inline `<script>` and run `node --check` on each. Expected: zero syntax errors.

- [ ] **Step 4: Run V6.27.5 regression markers**

Assert final HTML still contains PS1 real-CUE launch marker, 3DO profile, N64 analog stick, Virtual Boy dual-pad + L/R, fast ZIP BIOS index, and no ES-DE media importer.

- [ ] **Step 5: Synthetic performance test**

Run the fake directory walker on a generated 10,000-entry tree containing mostly media/technical files. Assert skipped entries do not call `getFile()` and the result only contains ROM candidates. Record elapsed time for comparison between builds; do not enforce a fragile millisecond threshold in CI.

- [ ] **Step 6: Deliver for Android validation**

Provide the clickable V6.28 test HTML. Ask the user only to compare normal usage: first ROMS connection, reopen page, open library, launch one cartridge/ZIP game and one CUE+BIN game. Do not ask them to interpret technical diagnostics.

- [ ] **Step 7: Release only after user validation**

If validated, update structured `src/` files, README and release hash on GitHub using the established release workflow. If not validated, keep V6.27.5 public and iterate only in the local test build.
