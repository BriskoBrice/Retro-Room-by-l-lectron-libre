function updateController(systemId){
  const sys=SYSTEMS[systemId]||SYSTEMS.gb;activeProfile=sys.profile||'two';const p=PROFILES[activeProfile]||PROFILES.two;
  app.dataset.padProfile=activeProfile;actions.innerHTML='';shoulders.innerHTML='';middleBtns.innerHTML='';
  p.faces.forEach(cfg=>{const b=addInputButton(actions,cfg.label,cfg.input,'roundBtn '+(cfg.cls||''));b.style.left=cfg.x+'px';b.style.top=cfg.y+'px';});
  (p.shoulders||[]).forEach(cfg=>{const b=addInputButton(shoulders,cfg.label,cfg.input,'shoulderBtn');b.classList.add('side-'+cfg.side,'slot-'+(cfg.slot||0));});
  (p.middle||[]).forEach(([label,input])=>addInputButton(middleBtns,label,input,'miniBtn'));
  directionMode=p.defaultAnalog?'analog':'digital';
  if(p.analogToggle)addModeToggle('stickModeBtn','STICK',()=>{directionMode=directionMode==='analog'?'digital':'analog';applyDirectionMode();showToast(directionMode==='analog'?'Croix = stick analogique':'Croix = D-pad');});
  if(p.wsToggle){directionMode='wsX';addModeToggle('wsPadBtn','PAD X',()=>{directionMode=directionMode==='wsY'?'wsX':'wsY';applyDirectionMode();showToast(directionMode==='wsY'?'WonderSwan : croix Y':'WonderSwan : croix X');});}
  applyDirectionMode();
}
dpadButtons.forEach(bindInputButton);updateController('gb');
fullBtn.addEventListener('click',async()=>{try{if(!document.fullscreenElement&&!document.webkitFullscreenElement){if(app.requestFullscreen)await app.requestFullscreen();else if(app.webkitRequestFullscreen)app.webkitRequestFullscreen();}else{if(document.exitFullscreen)await document.exitFullscreen();else if(document.webkitExitFullscreen)document.webkitExitFullscreen();}}catch(_){showToast('Le navigateur a refusé le plein écran.');}});
document.addEventListener('fullscreenchange',()=>{fullBtn.textContent=document.fullscreenElement?'EXIT':'FULL';resize();});
window.addEventListener('beforeunload',()=>{if(ejsUiObserver)ejsUiObserver.disconnect();releaseRomUrl();lowResFrame=null;});
