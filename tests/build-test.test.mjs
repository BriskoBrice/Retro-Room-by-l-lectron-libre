import test from 'node:test';
import assert from 'node:assert/strict';
import { rewriteForCommit } from '../tools/build-test.mjs';

test('rewrites local src assets to one pinned jsDelivr commit', () => {
  const sha = 'a'.repeat(40);
  const input = '<link href="/src/a.css"><script src="/src/a.js"></script>';
  const output = rewriteForCommit(input, sha);
  assert.match(output, /cdn\.jsdelivr\.net\/gh\/BriskoBrice\/Retro-Room-by-l-lectron-libre@a{40}\/src\/a\.js/);
  assert.match(output, /cdn\.jsdelivr\.net\/gh\/BriskoBrice\/Retro-Room-by-l-lectron-libre@a{40}\/src\/a\.css/);
  assert.doesNotMatch(output, /src="\/src\//);
  assert.doesNotMatch(output, /href="\/src\//);
});

test('rejects non-commit refs', () => {
  assert.throws(() => rewriteForCommit('<p>x</p>', 'main'), /Commit SHA invalide/);
});
