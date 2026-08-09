/* ============================================================
   RETRO ROOM — CATALOG COMPATIBILITY
   Classe les plateformes présentes dans la bibliothèque mais
   non émulables par le moteur web actuel.
   ============================================================ */
(() => {
  if (typeof SYSTEMS === 'undefined' || typeof AUTO_EXT === 'undefined') return;

  SYSTEMS.switch = {
    label: 'NINTENDO SWITCH — CATALOGUE',
    engine: 'unsupported',
    profile: 'two',
    exts: ['xci','nsp','nsz','xcz']
  };

  for (const ext of SYSTEMS.switch.exts) AUTO_EXT[ext] = 'switch';

  if (typeof launchRom === 'function') {
    const originalLaunchRom = launchRom;
    launchRom = function(file) {
      const detected = detectSystem(file?.name || '');
      if (detected === 'switch') {
        selectedFile = file;
        currentSystemId = 'switch';
        romName.textContent = file.name.toUpperCase();
        setStatus('NINTENDO SWITCH — CATALOGUÉE, NON ÉMULÉE');
        showToast('Jeu Switch reconnu dans la bibliothèque, mais aucun core Switch web n’est configuré dans Retro Room.', 4800);
        return;
      }
      return originalLaunchRom(file);
    };
  }
})();
