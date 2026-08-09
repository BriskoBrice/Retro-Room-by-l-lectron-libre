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

/* ============================================================
   ROM LIBRARY V2.1 — dossier récursif quand le navigateur le permet
   Ne modifie pas le moteur d'émulation : il choisit seulement le bon
   SYSTEM puis appelle launchRom(file).
   ============================================================ */
(() => {
  const deck = document.getElementById('deck');
  if(!deck || document.getElementById('dirBtn')) return;

  const style=document.createElement('style');
  style.textContent=`
    #deck{width:min(840px,calc(100vw - 24px));grid-template-columns:minmax(140px,1fr) 120px 76px 76px 70px}
    #romFolderInput{position:absolute!important;width:1px!important;height:1px!important;opacity:0!important;pointer-events:none!important;clip-path:inset(50%)!important}
    #dirBtn{color:#aef3c2}
    #folderCount{position:absolute;right:14px;top:calc(var(--safe-top) + 2px);z-index:9;padding:6px 10px;border-radius:999px;background:rgba(12,14,18,.72);border:1px solid rgba(255,255,255,.12);font:700 10px/1 "Courier New",monospace;letter-spacing:.06em;color:#d6f8e1;backdrop-filter:blur(8px);display:none}
    #libraryOverlay{position:fixed;inset:0;z-index:60;display:none;background:rgba(6,7,10,.76);backdrop-filter:blur(10px);-webkit-backdrop-filter:blur(10px)}
    #libraryOverlay.open{display:block}
    #libraryPanel{position:absolute;left:50%;top:50%;transform:translate(-50%,-50%);width:min(920px,calc(100vw - 18px));height:min(82vh,720px);display:flex;flex-direction:column;border:2px solid #0c0b10;border-radius:16px;background:linear-gradient(180deg,rgba(32,28,37,.96),rgba(14,12,17,.98));box-shadow:0 24px 70px rgba(0,0,0,.55),inset 0 1px rgba(255,255,255,.08)}
    #libraryTop{display:flex;align-items:center;gap:10px;padding:12px 12px 10px;border-bottom:1px solid rgba(255,255,255,.09)}
    #libraryTitle{font:800 13px/1 "Courier New",monospace;letter-spacing:.18em;color:#f5f3ee}
    #libraryMeta{font:700 10px/1.1 "Courier New",monospace;letter-spacing:.08em;color:#91f2b4;opacity:.92}
    #librarySearch{flex:1;min-width:0;height:40px;border-radius:10px;border:1px solid rgba(255,255,255,.12);background:#100e13;color:#efece6;padding:0 12px;font:700 12px/1 "Courier New",monospace;outline:none}
    .libBtn{height:40px;padding:0 14px;border-radius:10px;border:1px solid rgba(255,255,255,.12);background:linear-gradient(#2f2a33,#16131a);color:#eee;font:800 11px/1 "Courier New",monospace;letter-spacing:.06em}
    #libraryBody{flex:1;min-height:0;overflow:auto;padding:12px}
    .libGroup{margin:0 0 14px}.libRows{display:grid;gap:8px;margin-top:8px}
    .libGroupHeader{display:flex;align-items:center;justify-content:space-between;gap:10px;padding:8px 10px;border-radius:10px;background:rgba(19,17,24,.92);font:800 11px/1 "Courier New",monospace;letter-spacing:.08em;color:#ffe5a9;border:1px solid rgba(255,255,255,.06)}
    .libRow{display:grid;grid-template-columns:minmax(0,1fr) auto;align-items:center;gap:10px;padding:10px 12px;border-radius:12px;border:1px solid rgba(255,255,255,.08);background:linear-gradient(180deg,rgba(31,28,37,.92),rgba(17,15,21,.96));color:#fff;text-align:left}
    .libName{font:800 12px/1.2 "Courier New",monospace;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}.libPath{margin-top:4px;font:700 9px/1.2 "Courier New",monospace;color:#96a1ad;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
    .libBadge{padding:7px 10px;border-radius:999px;background:rgba(123,241,170,.10);border:1px solid rgba(123,241,170,.18);font:800 10px/1 "Courier New",monospace;color:#8cf0b0;white-space:nowrap}
    #libraryEmpty{padding:28px 10px;text-align:center;color:#d6d1c6;font:700 12px/1.6 "Courier New",monospace}
    #libraryHint{padding:10px 14px 14px;color:#b7b1c4;font:700 10px/1.5 "Courier New",monospace;border-top:1px solid rgba(255,255,255,.08)}
    @media(max-width:760px){#deck{width:calc(100vw - 16px);grid-template-columns:minmax(0,1fr) 98px 56px 56px 56px;height:64px;padding:6px;gap:4px}#libraryPanel{height:min(86vh,760px);width:calc(100vw - 12px)}#libraryTop{flex-wrap:wrap}#librarySearch{order:3;width:100%}}
    @media(orientation:landscape) and (max-height:600px){#deck{width:min(620px,62vw);grid-template-columns:minmax(0,1fr) 95px 52px 52px 52px;height:54px;padding:4px;gap:4px}}
  `;
  document.head.appendChild(style);

  const dirBtn=document.createElement('button');
  dirBtn.type='button';dirBtn.className='deckBtn';dirBtn.id='dirBtn';dirBtn.textContent='DIR';
  deck.insertBefore(dirBtn,fullBtn);

  const folderInput=document.createElement('input');
  folderInput.type='file';folderInput.id='romFolderInput';folderInput.multiple=true;
  folderInput.setAttribute('webkitdirectory','');folderInput.setAttribute('directory','');
  deck.appendChild(folderInput);

  const folderCount=document.createElement('div');folderCount.id='folderCount';app.appendChild(folderCount);
  const overlay=document.createElement('div');overlay.id='libraryOverlay';overlay.innerHTML=`
    <div id="libraryPanel">
      <div id="libraryTop">
        <div><div id="libraryTitle">BIBLIOTHÈQUE ROMS</div><div id="libraryMeta">DOSSIER • AUTO CORE • MANETTE AUTO</div></div>
        <input id="librarySearch" type="search" placeholder="Rechercher une ROM, un système…">
        <button class="libBtn" id="libraryRescanBtn" type="button">DOSSIER</button>
        <button class="libBtn" id="libraryCloseBtn" type="button">FERMER</button>
      </div>
      <div id="libraryBody"></div>
      <div id="libraryHint">DIR tente d'abord un vrai accès récursif au dossier. Si Android/Chrome refuse ce mode, le sélecteur classique reste disponible en secours.</div>
    </div>`;
  document.body.appendChild(overlay);

  const search=document.getElementById('librarySearch'), body=document.getElementById('libraryBody');
  const closeBtn=document.getElementById('libraryCloseBtn'), rescanBtn=document.getElementById('libraryRescanBtn');
  let entries=[];
  const skip=new Set(['png','jpg','jpeg','gif','webp','bmp','svg','txt','md','nfo','ini','db','pdf','xml','json','log','sav','srm','rtc','ips','ups','bps','cht','bak','tmp','state']);
  const hints=[
    ['game gear','segaGG'],['master system','segaMS'],['mega drive','segaMD'],['megadrive','segaMD'],['genesis','segaMD'],['32x','sega32x'],['mega cd','segaCD'],['sega cd','segaCD'],['saturn','segaSaturn'],
    ['game boy advance','gba'],['gba','gba'],['game boy color','gb'],['gbc','gb'],['game boy','gb'],['super nintendo','snes'],['super famicom','snes'],['snes','snes'],['famicom','nes'],['nes','nes'],['nintendo 64','n64'],['n64','n64'],['nintendo ds','nds'],['virtual boy','vb'],
    ['playstation','psx'],['psx','psx'],['ps1','psx'],['psp','psp'],['wonderswan','ws'],['wonder swan','ws'],['neo geo pocket','ngp'],['ngpc','ngp'],['pc engine','pce'],['turbografx','pce'],['pc-fx','pcfx'],
    ['cps1','cps1'],['cps 1','cps1'],['cps2','cps2'],['cps 2','cps2'],['cps3','cps3'],['cps 3','cps3'],['neo geo','neogeo'],['fbneo','arcade'],['arcade','arcade'],['mame','mame2003'],
    ['lowres nx','lowresnx'],['lowres','lowresnx'],['amiga','amiga'],['commodore 64','c64'],['c64','c64'],['spectrum','spectrum'],['amstrad','amstrad'],['3do','threeDO'],['cdi','cdi'],['cd-i','cdi'],['coleco','coleco'],['lynx','lynx'],['jaguar','jaguar']
  ];
  const extOf=n=>(n.split('.').pop()||'').toLowerCase();
  const cleanPath=p=>(' '+String(p||'').toLowerCase().replace(/[\\/_\-.]+/g,' ')+' ');
  function infer(file,path){
    const automatic=detectSystem(file.name);if(automatic)return automatic;
    const p=cleanPath(path);
    for(const [token,id] of hints)if(p.includes(' '+token+' '))return id;
    return null;
  }
  function isCandidate(file){const e=extOf(file.name);return !!e&&!skip.has(e)&&file.size>0;}
  function openLib(){overlay.classList.add('open');overlay.setAttribute('aria-hidden','false');render();}
  function closeLib(){overlay.classList.remove('open');overlay.setAttribute('aria-hidden','true');}
  function setEntries(list,mode){
    entries=list.filter(x=>isCandidate(x.file)).map(x=>({file:x.file,path:x.path||x.file.name,ext:extOf(x.file.name),systemId:infer(x.file,x.path||x.file.name),name:cleanName(x.file.name).toUpperCase()}));
    folderCount.style.display=entries.length?'block':'none';folderCount.textContent=entries.length+' ROMS';
    setStatus(entries.length+' ROMS SCANNÉES — '+mode);openLib();showToast(entries.length+' ROMS détectées',2600);
  }
  function render(){
    const q=search.value.trim().toLowerCase();const filtered=entries.filter(e=>!q||(`${e.name} ${e.path} ${e.systemId?systemLabel(e.systemId):'inconnu'}`).toLowerCase().includes(q));
    if(!filtered.length){body.innerHTML='<div id="libraryEmpty">Aucune ROM trouvée.</div>';return;}
    const groups=new Map();for(const e of filtered){const k=e.systemId||'unknown';if(!groups.has(k))groups.set(k,[]);groups.get(k).push(e);}
    body.innerHTML='';for(const [id,list] of [...groups.entries()].sort((a,b)=>systemLabel(a[0]).localeCompare(systemLabel(b[0]),'fr'))){
      const s=document.createElement('section');s.className='libGroup';const h=document.createElement('div');h.className='libGroupHeader';h.innerHTML=`<span>${systemLabel(id)}</span><span>${list.length}</span>`;s.appendChild(h);const rows=document.createElement('div');rows.className='libRows';
      list.sort((a,b)=>a.name.localeCompare(b.name,'fr')).forEach(e=>{const b=document.createElement('button');b.type='button';b.className='libRow';b.innerHTML=`<div><div class="libName">${e.name}</div><div class="libPath">${e.path}</div></div><div class="libBadge">${e.ext.toUpperCase()}</div>`;b.onclick=()=>{if(loaderInjected){showToast('NEW avant de changer de ROM',3000);return;}selectedFile=e.file;if(!e.systemId){closeLib();romName.textContent=e.file.name.toUpperCase();setStatus('SYSTÈME INCONNU — CHOISIS SYSTEM');showToast('Impossible de deviner ce fichier automatiquement',3600);return;}systemSelect.value=e.systemId;closeLib();launchRom(e.file);};rows.appendChild(b);});s.appendChild(rows);body.appendChild(s);
    }
  }
  async function walkDir(dir,prefix=''){
    const out=[];for await(const [name,handle] of dir.entries()){
      const path=prefix?prefix+'/'+name:name;
      if(handle.kind==='file'){try{out.push({file:await handle.getFile(),path});}catch(_){}}
      else if(handle.kind==='directory'){out.push(...await walkDir(handle,path));}
    }return out;
  }
  async function pickDirectory(){
    if(window.isSecureContext && 'showDirectoryPicker' in window){
      try{setStatus('OUVERTURE DU DOSSIER…');const handle=await window.showDirectoryPicker({mode:'read'});const list=await walkDir(handle,handle.name);setEntries(list,'DOSSIER RÉCURSIF');return;}catch(err){if(err&&err.name==='AbortError')return;}
    }
    showToast('Mode local Android : Chrome utilise le sélecteur de fichiers en secours.',4200);folderInput.click();
  }
  folderInput.addEventListener('change',()=>{
    const files=[...(folderInput.files||[])];if(!files.length)return;
    const list=files.map(f=>({file:f,path:f.webkitRelativePath||f.name}));
    const gotHierarchy=list.some(x=>x.path.includes('/'));
    setEntries(list,gotHierarchy?'DOSSIER':'SÉLECTION FICHIERS');
    if(!gotHierarchy&&list.length===1)showToast('Chrome ne donne pas accès au dossier depuis content://. Le scan complet demandera un contexte HTTPS ou une version Android native.',6000);
    folderInput.value='';
  });
  dirBtn.addEventListener('click',pickDirectory);rescanBtn.addEventListener('click',pickDirectory);closeBtn.addEventListener('click',closeLib);search.addEventListener('input',render);overlay.addEventListener('click',e=>{if(e.target===overlay)closeLib();});
})();
