# RetroRoom V6.28 — Fast Library / Adaptive Folder Access

Date: 2026-09-03
Base stable: RetroRoom V6.27.5
Status: design approved in principle; implementation not started

## Goal

Make RetroRoom feel immediate on Android even with 1,000+ ROMs, while keeping the current single-HTML workflow and without copying ROM data into browser storage.

Success means:
- the previous library appears immediately after opening RetroRoom;
- when the browser allows persistent directory access, RetroRoom can reconnect to the ROM folder without re-enumerating the whole tree on every launch;
- when persistent access is unavailable, the existing Android folder picker remains as a fallback but RetroRoom performs only a cheap reconnect/index step after the picker returns;
- launching PS1/3DO CUE+BIN, N64, Virtual Boy and other validated systems remains unchanged;
- no ROM bytes are duplicated into IndexedDB/OPFS/local storage;
- V6.27.5 remains the public stable release until V6.28 is validated on the user's Android phone.

## Research findings that drive the design

1. `<input type="file" webkitdirectory>` returns a flat `FileList` containing the whole selected hierarchy. The browser therefore has to enumerate the tree before RetroRoom gets control. This cost cannot be optimized by JavaScript after the picker is already running.
2. Modern Chromium exposes the File System Access API on supported platforms. `showDirectoryPicker()` returns a directory handle that JavaScript can enumerate itself, which lets RetroRoom prune irrelevant folders early instead of forcing the picker to materialize every file.
3. `FileSystemDirectoryHandle` objects are serializable and can be stored in IndexedDB. Chrome documents this as the basis for reopening previously used folders.
4. Persistent permissions are not guaranteed in every browsing context. The API also requires a secure/trustworthy context and user activation for permission prompts. RetroRoom must therefore feature-detect at runtime and keep the existing `webkitdirectory` path as a first-class fallback.
5. File/Directory handles can be used to retrieve a known file by path. This enables a cached game to be launched directly without a full rescan when a saved directory handle remains usable.

## User experience

### Startup

- RetroRoom loads the last known library metadata immediately from its cache.
- Cards, filters, favorites, recent games and system counts are visible before the ROM folder is physically reconnected.
- Cached entries are visually normal; only launch availability differs internally.
- The library status uses simple language: `CACHE • 1219 ROMS` while detached, then `PRÊT • 1219 ROMS` once the folder is connected.

### ROMS button

RetroRoom chooses the best available path automatically:

**Modern path**
- If `showDirectoryPicker` is usable, ROMS opens that picker on first setup.
- The selected directory handle is stored in IndexedDB.
- On later sessions RetroRoom retrieves the handle. If access is still granted, it reconnects silently. If Chrome requires confirmation, ROMS asks once on a user tap.

**Fallback path**
- If the modern API is unavailable or blocked in the current local `content://`/file context, RetroRoom keeps the current `webkitdirectory` input.
- The previous library still appears immediately from cache.
- Once Android returns the `FileList`, RetroRoom builds one path map and attaches `File` objects to existing cached entries instead of rerunning every detection step unnecessarily.

### Refreshing the collection

- ROMS acts as reconnect/refresh, not as a mandatory full rebuild every time.
- A full rescan happens only on first setup, explicit refresh, cache version change, or detected inconsistency.
- New/changed files are integrated into a fresh cache after a refresh.

### Launching a cached game

- If a real `File` is already attached, launch exactly as V6.27.5 does.
- If only cached metadata exists and a usable directory handle is available, RetroRoom resolves that exact path lazily and retrieves only the files required for that game.
- For CUE games, RetroRoom reads the CUE only when needed and retrieves its referenced sibling tracks. It does not enumerate the entire collection just to launch one known game.
- If no usable handle is available, the user is asked to reconnect ROMS once; after reconnection the selected game can launch.

## Architecture

### 1. Library metadata cache

A versioned cache stores only lightweight metadata:
- cache schema version;
- game key;
- display name and raw name;
- system ID / label;
- relative path;
- extension;
- optional size and lastModified fingerprints;
- optional cached CUE reference list once known.

Primary store: IndexedDB.
Fallback store: localStorage metadata when IndexedDB is unavailable.

The cache never stores Blob/File contents or full ROM bytes.

### 2. Directory handle store

When supported, the ROM `FileSystemDirectoryHandle` is stored in IndexedDB separately from library metadata.

At startup:
- retrieve handle;
- call `queryPermission({mode:'read'})` when available;
- if granted, mark folder connected;
- if prompt is required, wait for a ROMS button gesture before calling `requestPermission()`;
- if denied/stale, fall back cleanly.

### 3. Pruned directory walker

For the modern path, traversal is controlled by RetroRoom instead of the HTML picker.

Directory-level pruning happens before files are opened:
- BIOS and known media/technical directories are skipped where safe;
- technical files (`systeminfo.txt`, XML, images, video, manuals, logs, saves, etc.) are rejected by name/extension without calling `getFile()`;
- only plausible ROM candidates become `File` objects.

`getFile()` calls are processed with bounded concurrency rather than one-at-a-time awaits or an unbounded `Promise.all`. The exact concurrency is tuned conservatively for Android.

The traversal periodically yields to the UI so progress remains responsive.

### 4. Fast reconnect for `webkitdirectory`

The browser still performs its unavoidable folder enumeration. After it returns:
- take a single `Array.from(FileList)` snapshot;
- build a normalized relative-path map once;
- reject technical/media files in one pass;
- attach matches to cached game rows by path;
- canonicalize only entries that cannot be matched safely to the cache;
- rebuild the cache only when the collection changed.

### 5. Lazy CUE/BIN resolution

The existing validated PS1/3DO launch behavior remains authoritative.

V6.28 adds a path-based provider beneath it:
- current scan session can resolve siblings from the in-memory path map;
- persistent handle mode can resolve sibling file handles directly;
- cached CUE references may be reused if the CUE fingerprint is unchanged;
- any mismatch falls back to rereading the CUE safely.

### 6. Cover behavior

Do not revive the ES-DE mass-media importer.
Network/local cover behavior from V6.27.5 stays unchanged and lazy.

## Performance strategy

The optimization targets the real costs in this order:

1. Avoid mandatory rescans at startup by rendering cached metadata immediately.
2. Prefer persistent directory handles when the runtime supports them.
3. In handle mode, enumerate selectively and prune before `getFile()`.
4. In legacy picker mode, process the returned list once and reconnect cached rows by path.
5. Defer expensive CUE parsing and file retrieval until launch when possible.
6. Keep UI work paged/lazy as V6.27.5 already does.

A small timing recorder captures:
- picker/permission wait (where measurable);
- enumeration/reconnect time;
- canonicalization time;
- cache write time;
- total until library is usable.

User-facing output stays simple, e.g. `Bibliothèque prête en 4,8 s`. Detailed timings remain available only in a diagnostic object for development.

## Compatibility and failure handling

- Feature detection decides modern vs fallback path; no browser-specific assumption is hard-coded.
- If IndexedDB fails, RetroRoom keeps working without persistence and can fall back to localStorage metadata.
- If a stored handle becomes invalid, clear only that handle, not favorites/recents/library metadata.
- If cache data cannot be parsed or has the wrong schema version, discard only the library cache and rescan.
- If a cached game no longer exists, mark/rebuild on refresh rather than crashing.
- User cancellation of a picker never clears a valid cached library.

## Scope boundaries

Included:
- cached library metadata;
- persistent directory handle where supported;
- adaptive modern/fallback ROM folder access;
- fast reconnect;
- lazy known-path game retrieval;
- timing instrumentation;
- regression protection for V6.27.5 systems.

Not included:
- APK/SAF implementation;
- storing ROM binaries in browser storage;
- ES-DE media import;
- scraper changes;
- changes to emulator cores or controller layouts;
- public `main` release before phone validation.

## Testing

TDD coverage will include:
- cache serialization/deserialization/version invalidation;
- cached rows render without `File` objects;
- path-map reconnect attaches the correct files;
- cancellation preserves cache;
- fake `FileSystemDirectoryHandle` tree proves directory pruning and lazy file retrieval;
- walker does not call `getFile()` for known technical/media files;
- CUE path provider resolves referenced siblings without a global rescan;
- fallback behavior when the modern API or IndexedDB is unavailable;
- regression markers for PS1, 3DO, N64, Virtual Boy, BIOS fast index and CLEAN EXIT;
- syntax check of every inline script.

Phone validation compares V6.27.5 and V6.28 on the same ROM folder, focusing on:
- time to visible library after page open;
- time after tapping ROMS until library is ready;
- second-session behavior;
- launch of representative cartridge/ZIP and CUE+BIN games.

## Release policy

V6.28 is distributed as a local test HTML first. GitHub `main` stays on V6.27.5 until the user validates V6.28 on the Xiaomi Android device. After validation, release files and README are updated cleanly and experimental test artifacts are excluded.
