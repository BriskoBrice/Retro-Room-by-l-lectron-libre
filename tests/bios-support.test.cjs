const test = require('node:test');
const assert = require('node:assert/strict');
const BiosSupport = require('../src/bios-support.js');

test('3DO requires a recognized BIOS', () => {
  assert.equal(BiosSupport.requiresBios('threeDO'), true);
  assert.equal(BiosSupport.isCompatibleBiosFilename('threeDO', 'PANAFZ1.BIN'), true);
  assert.equal(BiosSupport.isCompatibleBiosFilename('threeDO', 'random.bin'), false);
});

test('findCompatibleBios returns the first recognized 3DO BIOS', () => {
  const files = [
    { name: 'random.bin' },
    { name: 'panafz10.bin' },
    { name: 'panafz1.bin' },
  ];
  assert.equal(BiosSupport.findCompatibleBios('threeDO', files), files[1]);
});

test('a registered 3DO BIOS is returned to EmulatorJS', () => {
  const bios = { name: 'panafz1.bin' };
  assert.equal(BiosSupport.setBios('threeDO', bios), true);
  assert.equal(BiosSupport.biosFor('threeDO'), bios);
});
