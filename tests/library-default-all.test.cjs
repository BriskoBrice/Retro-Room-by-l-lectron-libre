const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const html = fs.readFileSync(path.join(__dirname, '..', 'index.html'), 'utf8');

test('Retro Library starts on TOUS instead of restoring the previous system tab', () => {
  assert.match(html, /let state=\{tab:'all',query:'',sort:prefs\.sort\|\|'az',page:1\};/);
  assert.doesNotMatch(html, /let state=\{tab:prefs\.tab\|\|'all'/);
});

test('rescanning a ROM folder returns the library to TOUS', () => {
  const scan = html.match(/async function scanPlus\(files,fingerprint=''\)\{[\s\S]*?saveV628Cache\(fingerprint\);\n  \}/)?.[0] || '';
  assert.match(scan, /rows=libraryFiles\.map\(entryFromFile\);state\.tab='all';state\.page=1;state\.query='';search\.value='';/);
});
