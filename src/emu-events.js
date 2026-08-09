romInput.addEventListener('change',()=>{
  const file=romInput.files&&romInput.files[0];if(!file)return;selectedFile=file;
  if(systemSelect.value==='auto'&&isAmbiguousFile(file)){romName.textContent=file.name.toUpperCase();setStatus('FORMAT AMBIGU — CHOISIS LE SYSTÈME');showToast('Extension .'+((file.name.split('.').pop()||'?').toUpperCase())+' ambiguë : choisis la machine dans SYSTEM. La ROM reste sélectionnée.',4200);}else{launchRom(file);}romInput.value='';
});
systemSelect.addEventListener('change',()=>{const v=systemSelect.value;const resolved=v==='auto'?(selectedFile?detectSystem(selectedFile.name):'gb'):v;updateController(resolved||'gb');if(selectedFile&&!loaderInjected&&v!=='auto')launchRom(selectedFile);else if(!selectedFile)setStatus(v==='auto'?'AUTO — EN ATTENTE D’UNE ROM':'FORCÉ : '+systemLabel(v));});
