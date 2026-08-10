import fs from 'node:fs';
import vm from 'node:vm';

export function loadBrowserScripts(paths, appendCode = '', globals = {}) {
  const systemSelect = {
    value: 'auto',
    appendChild() {},
    querySelector() { return null; }
  };
  const sandbox = {
    console,
    window: {},
    document: {
      getElementById(id) { return id === 'systemSelect' ? systemSelect : { appendChild() {}, value: 'auto' }; },
      querySelectorAll() { return []; },
      createElement() { return { appendChild() {}, insertAdjacentElement() {}, textContent: '', value: '' }; }
    },
    ...globals
  };
  vm.createContext(sandbox);
  for (const path of paths) {
    vm.runInContext(fs.readFileSync(path, 'utf8'), sandbox, { filename: path });
  }
  if (appendCode) vm.runInContext(appendCode, sandbox);
  return sandbox;
}
