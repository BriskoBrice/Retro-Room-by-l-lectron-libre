import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

export function rewriteForCommit(html, sha) {
  if (!/^[0-9a-f]{40}$/.test(sha)) throw new Error('Commit SHA invalide');
  const base = `https://cdn.jsdelivr.net/gh/BriskoBrice/Retro-Room-by-l-lectron-libre@${sha}`;
  return html
    .replaceAll('href="/src/', `href="${base}/src/`)
    .replaceAll('src="/src/', `src="${base}/src/`);
}

const isCli = process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url);
if (isCli) {
  const sha = process.argv[2];
  if (!sha) throw new Error('Usage: node tools/build-test.mjs <40-char-commit-sha>');
  const html = fs.readFileSync('index.html', 'utf8');
  fs.mkdirSync('dist', { recursive: true });
  fs.writeFileSync('dist/RetroRoom_TEST.html', rewriteForCommit(html, sha));
  console.log(`dist/RetroRoom_TEST.html généré pour ${sha}`);
}
