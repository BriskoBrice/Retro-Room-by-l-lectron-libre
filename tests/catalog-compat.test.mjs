import test from 'node:test';
import assert from 'node:assert/strict';
import { loadBrowserScripts } from './helpers/browser-script.mjs';

test('Switch stays catalog-only and maps its extensions', () => {
  const { __SYSTEMS, __AUTO_EXT } = loadBrowserScripts(
    ['src/core-config.js', 'src/catalog-compat.js'],
    'globalThis.__SYSTEMS=SYSTEMS; globalThis.__AUTO_EXT=AUTO_EXT;'
  );
  assert.equal(__SYSTEMS.switch.label, 'NINTENDO SWITCH — CATALOGUE');
  assert.equal(__SYSTEMS.switch.engine, 'unsupported');
  assert.deepEqual([...__SYSTEMS.switch.exts], ['xci','nsp','nsz','xcz']);
  assert.equal(__AUTO_EXT.xci, 'switch');
  assert.equal(__AUTO_EXT.nsp, 'switch');
});
