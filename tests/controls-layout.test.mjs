import test from 'node:test';
import assert from 'node:assert/strict';
import { loadBrowserScripts } from './helpers/browser-script.mjs';

test('required controller profiles stay available', () => {
  const { __PROFILES } = loadBrowserScripts(
    ['src/controls-layout.js'],
    'globalThis.__PROFILES=PROFILES;'
  );
  for (const id of ['two', 'ws', 'lowres', 'arcade6']) assert.ok(__PROFILES[id]);
  assert.equal(__PROFILES.ws.wsToggle, true);
  assert.equal(__PROFILES.arcade6.faces.length, 6);
});
