import test from 'node:test';
import assert from 'node:assert/strict';
import { loadBrowserScripts } from './helpers/browser-script.mjs';

const { __D } = loadBrowserScripts(
  ['src/library-detect.js'],
  'globalThis.__D=RetroRoomLibraryDetect;'
);
const f = (name, path, size = 1024) => ({ name, webkitRelativePath: path, size });
const noExt = () => null;

test('folder wins over ambiguous ZIP', () => {
  assert.equal(__D.resolveSystem(f('Arcade Classics.zip','Roms/gamegear/Arcade Classics.zip'), noExt), 'segaGG');
});

test('WonderSwan and WonderSwan Color aliases map to ws', () => {
  assert.equal(__D.resolveSystem(f('a.zip','Roms/wonderswan/a.zip'), noExt), 'ws');
  assert.equal(__D.resolveSystem(f('b.zip','Roms/wonderswancolor/b.zip'), noExt), 'ws');
});

test('Neo Geo Pocket Color aliases map to ngp', () => {
  assert.equal(__D.resolveSystem(f('c.zip','Roms/Neogeo pocket color/c.zip'), noExt), 'ngp');
});

test('Switch folder is catalogued', () => {
  assert.equal(__D.resolveSystem(f('Mario.xci','Roms/switch/Mario.xci'), noExt), 'switch');
});

test('.nomedia is ignored', () => {
  assert.equal(__D.candidate(f('.nomedia','Roms/.nomedia',1)), false);
});
