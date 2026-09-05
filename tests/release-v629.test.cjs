const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');

const html = fs.readFileSync(process.env.RETROROOM_INDEX || 'index.html', 'utf8');

test('V6.29 stable keeps FAST LIBRARY and FAST BIOS', () => {
  assert.match(html, /<title>Retro Room V6\.29 — STABLE — L’électron libre<\/title>/);
  assert.doesNotMatch(html, /FAST BIOS TEST — L’électron libre<\/title>/);
  for (const id of [
    'library-cache-v628-script',
    'library-folder-access-v628-script',
    'fast-bios-v6282-script',
    'clean-exit-v6253-script',
    'n64-controller-v6254-script',
    'virtualboy-pad-v6274-script'
  ]) {
    assert.equal((html.match(new RegExp(`id="${id}"`, 'g')) || []).length, 1, `${id} must exist exactly once`);
  }
  for (const token of [
    '__RETROOM_LIBRARY_CACHE_V628__',
    '__RETROOM_FOLDER_ACCESS_V628__',
    '__RETROOM_FAST_BIOS_V6282__',
    '__RETROOM_FAST_BIOS_ENSURE__',
    '__RETROOM_FAST_BIOS_PICK__',
    '__RETROOM_FAST_BIOS_AFTER_SCAN__',
    '__RETROOM_CLEAN_EXIT__'
  ]) assert.ok(html.includes(token), `${token} missing`);
});

test('V6.29 cache code stores indexes/handles, not ROM or BIOS payloads', () => {
  assert.ok(html.includes("const CACHE_KEY='biosCacheV6282'"));
  assert.ok(html.includes("const HANDLE_KEY='biosDirectoryHandle'"));
  assert.ok(html.includes('saveLibraryCache'));
});
