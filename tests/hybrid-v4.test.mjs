import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const index = await readFile(new URL('../index.html', import.meta.url), 'utf8');
const css = await readFile(new URL('../src/hybrid-v4.css', import.meta.url), 'utf8');
const js = await readFile(new URL('../src/hybrid-v4.js', import.meta.url), 'utf8');

test('index loads hybrid V4 assets around the existing stable runtime', () => {
  assert.match(index, /src\/hybrid-v4\.css/);
  assert.match(index, /src\/hybrid-v4\.js/);
  assert.ok(index.indexOf('src/core-render.js') < index.indexOf('src/hybrid-v4.js'));
  assert.ok(index.indexOf('src/hybrid-v4.js') < index.indexOf('src/emu-overlay.js'));
});

test('hybrid V4 keeps the real dynamic library badge visible over the baked counter', () => {
  assert.match(css, /#libraryBadge\s*\{/);
  assert.match(css, /display:block!important/);
  assert.doesNotMatch(css, /#roomTag,#libraryBadge\s*\{[^}]*display:none/);
});

test('hybrid V4 masks the baked lower UI without covering the real controls', () => {
  assert.match(css, /#photoRoom::after/);
  assert.match(css, /pointer-events:none/);
  assert.match(css, /linear-gradient/);
});

test('hybrid V4 maps the live emulator onto the validated CRT glass', () => {
  assert.match(js, /const CRT=\{x:346,y:525,w:380,h:322\}/);
  assert.match(js, /updateCrtOverlay=hybridCrt/);
  assert.match(js, /window\.addEventListener\('resize',hybridCrt/);
});
