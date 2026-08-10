import fs from 'node:fs';
import test from 'node:test';
import assert from 'node:assert/strict';
import { loadBrowserScripts } from './helpers/browser-script.mjs';

function loadSystems() {
  return loadBrowserScripts(
    ['src/core-config.js'],
    `globalThis.__TARGETS = {
      gameGear: [SYSTEMS.segaGG.core, SYSTEMS.segaGG.profile],
      wonderSwan: [SYSTEMS.ws.core, SYSTEMS.ws.profile],
      neoGeoPocket: [SYSTEMS.ngp.core, SYSTEMS.ngp.profile],
      lowRes: [SYSTEMS.lowresnx.engine, SYSTEMS.lowresnx.profile]
    };`
  ).__TARGETS;
}

test('remaining target systems keep their core and controller contracts', () => {
  const targets = loadSystems();
  assert.deepEqual(
    {
      gameGear: [...targets.gameGear],
      wonderSwan: [...targets.wonderSwan],
      neoGeoPocket: [...targets.neoGeoPocket],
      lowRes: [...targets.lowRes]
    },
    {
      gameGear: ['segaGG','two'],
      wonderSwan: ['ws','ws'],
      neoGeoPocket: ['ngp','two'],
      lowRes: ['lowresnx','lowres']
    }
  );
});

test('LowRes NX remains isolated from EmulatorJS globals', () => {
  const source = fs.readFileSync('src/emu-lowres.js', 'utf8');
  for (const required of ['iframe', 'srcdoc', 'retro-lowres-key', 'LOWRES_JS', 'postMessage']) {
    assert.match(source, new RegExp(required), `missing LowRes isolation marker: ${required}`);
  }
  assert.doesNotMatch(source, /EJS_core/);
  assert.doesNotMatch(source, /EJS_gameUrl/);
});
