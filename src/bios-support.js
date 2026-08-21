(function(root, factory){
  const api = factory(root || {});
  if(typeof module !== 'undefined' && module.exports) module.exports = api;
  if(root) root.BiosSupport = api;
})(typeof globalThis !== 'undefined' ? globalThis : this, function(root){
  'use strict';

  const REQUIREMENTS = {
    threeDO: {
      label: 'BIOS 3DO',
      names: [
        'panafz1.bin',
        'panafz10.bin',
        'panafz10-norsa.bin',
        'panafz10e-anvil.bin',
        'panafz10e-anvil-norsa.bin',
        'panafz1j.bin',
        'panafz1j-norsa.bin',
        'goldstar.bin',
        'sanyotry.bin',
        '3do_arcade_saot.bin'
      ]
    }
  };

  const biosFiles = new Map();
  let picker = null;
  let pending = null;

  function requirement(systemId){
    return REQUIREMENTS[systemId] || null;
  }

  function requiresBios(systemId){
    return !!requirement(systemId);
  }

  function normalizeName(name){
    return String(name || '').trim().toLowerCase();
  }

  function isCompatibleBiosFilename(systemId, name){
    const req = requirement(systemId);
    return !!req && req.names.includes(normalizeName(name));
  }

  function findCompatibleBios(systemId, files){
    return Array.from(files || []).find(file => isCompatibleBiosFilename(systemId, file && file.name)) || null;
  }

  function isKnownBiosFilename(name){
    const normalized = normalizeName(name);
    return Object.values(REQUIREMENTS).some(req => req.names.includes(normalized));
  }

  function setBios(systemId, file){
    if(!file || !isCompatibleBiosFilename(systemId, file.name)) return false;
    biosFiles.set(systemId, file);
    return true;
  }

  function biosFor(systemId){
    return biosFiles.get(systemId) || '';
  }

  function status(text){
    if(typeof root.setStatus === 'function') root.setStatus(text);
  }

  function toast(text, ms){
    if(typeof root.showToast === 'function') root.showToast(text, ms);
  }

  function ensureBios(systemId, gameFile, resume){
    if(!requiresBios(systemId) || biosFor(systemId)) return true;
    pending = { systemId, gameFile, resume };
    const req = requirement(systemId);
    status(req.label + ' REQUIS');
    toast('3DO : choisis ton BIOS panafz1.bin ou panafz10.bin.', 6000);
    if(picker && typeof picker.click === 'function') picker.click();
    else toast('Sélecteur BIOS indisponible. Recharge Retro Room.', 5000);
    return false;
  }

  function onPickerChange(){
    const file = picker && picker.files && picker.files[0];
    if(!file) return;
    const systemId = pending && pending.systemId ? pending.systemId : 'threeDO';
    if(!setBios(systemId, file)){
      status('BIOS INCOMPATIBLE');
      toast('BIOS non reconnu. Utilise par exemple panafz1.bin ou panafz10.bin.', 6000);
      if(picker) picker.value = '';
      return;
    }
    const next = pending;
    pending = null;
    status(requirement(systemId).label + ' CHARGÉ');
    toast(requirement(systemId).label + ' chargé — lancement du jeu…', 2600);
    if(picker) picker.value = '';
    if(next && typeof next.resume === 'function') next.resume(next.gameFile);
  }

  function installPicker(input){
    if(!input || input === picker) return !!picker;
    picker = input;
    picker.addEventListener('change', onPickerChange);
    return true;
  }

  if(root.document && typeof root.document.getElementById === 'function'){
    installPicker(root.document.getElementById('biosInput'));
  }

  return {
    REQUIREMENTS,
    requirement,
    requiresBios,
    isCompatibleBiosFilename,
    findCompatibleBios,
    isKnownBiosFilename,
    setBios,
    biosFor,
    ensureBios,
    installPicker
  };
});
