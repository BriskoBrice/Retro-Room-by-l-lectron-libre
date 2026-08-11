import test from 'node:test';
import assert from 'node:assert/strict';
import { loadBrowserScripts } from './helpers/browser-script.mjs';

function loadFinalCatalog() {
  return loadBrowserScripts(
    ['src/core-config.js', 'src/arcade-compat.js', 'src/catalog-compat.js'],
    'globalThis.__SYSTEMS=SYSTEMS; globalThis.__AUTO_EXT=AUTO_EXT;'
  );
}

test('CPS I defaults to FBA2012 compatibility core and keeps FBNeo as fallback', () => {
  const { __SYSTEMS } = loadFinalCatalog();
  assert.equal(__SYSTEMS.cps1.core, 'fbalpha2012_cps1');
  assert.equal(__SYSTEMS.cps1.profile, 'arcade6');
  assert.equal(__SYSTEMS.cps1fbneo.core, 'arcade');
  assert.equal(__SYSTEMS.cps1fbneo.profile, 'arcade6');
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
