const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const html = fs.readFileSync(path.join(__dirname, '..', 'index.html'), 'utf8');

test('V6.27.5 release markers are present', () => {
  assert.match(html, /<title>Retro Room V6\.27\.5 — L’électron libre<\/title>/);
  assert.match(html, /window\.EJS_gameUrl=file/);
  assert.match(html, /function listZipEntriesFast/);
  assert.match(html, /ensureJsZipRuntime,listZipEntriesFast,extractZipSelected,extractArchive/);
  assert.doesNotMatch(html, /extractZipWithJsZip/);
  assert.match(html, /PROFILES\.threeDO=\{/);
  assert.match(html, /id="n64AnalogStick"/);
  assert.match(html, /SYSTEMS\.vb\.profile='virtualboy'/);
  assert.match(html, /shoulder\('L',10,'left',0\)/);
  assert.match(html, /shoulder\('R',11,'right',0\)/);
});

test('experimental ES-DE media importer is absent from release', () => {
  assert.doesNotMatch(html, /id="esdeFolderBtn"/);
  assert.doesNotMatch(html, /__RETROOM_MEDIA_V6277__/);
});
