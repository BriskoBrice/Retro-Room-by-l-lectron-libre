(() => {
  try {
    const cps2Opt=systemSelect.querySelector('option[value="cps2"]');
    if(cps2Opt && SYSTEMS.cps2) cps2Opt.textContent=SYSTEMS.cps2.label;
    if(SYSTEMS.cps2fbneo && !systemSelect.querySelector('option[value="cps2fbneo"]')){
      const opt=document.createElement('option');opt.value='cps2fbneo';opt.textContent=SYSTEMS.cps2fbneo.label;cps2Opt?.insertAdjacentElement('afterend',opt);
    }
  }catch(_){}

  const libBtn=document.getElementById('libBtn');
  const folderInput=document.getElementById('romFolderInput');
  const overlay=document.getElementById('libraryOverlay');
  const folderBtn=document.getElementById('folderBtn');
  const closeBtn=document.getElementById('closeLibraryBtn');
  const backBtn=document.getElementById('libraryBack');
  const search=document.getElementById('librarySearch');
  const content=document.getElementById('libraryContent');
  const crumb=document.getElementById('libraryCrumbText');
  const badge=document.getElementById('libraryBadge');
  let library=[];let currentSystem=null;

  const D=globalThis.RetroRoomLibraryDetect;
  const normalizeToken=D.normalizeToken;
  const extOf=D.extOf;
  const candidate=D.candidate;
  const resolveSystem=file=>D.resolveSystem(file,detectSystem);

  function prettyName(file){return cleanName(file.name).toUpperCase();}
  function sysLabel(id){return id?systemLabel(id):'SYSTÈME INCONNU';}
  function openLibrary(){overlay.classList.add('open');overlay.setAttribute('aria-hidden','false');render();}
  function closeLibrary(){overlay.classList.remove('open');overlay.setAttribute('aria-hidden','true');}
  function totals(){const systems=new Set(library.map(x=>x.systemId).filter(Boolean));return {roms:library.length,systems:systems.size};}
  function updateBadge(){const t=totals();if(!t.roms){badge.style.display='none';return;}badge.style.display='block';badge.textContent=`${t.roms} ROMS • ${t.systems} SYSTÈMES`;}
  function groupsFor(rows){const m=new Map();rows.forEach(e=>{const k=e.systemId||'unknown';if(!m.has(k))m.set(k,[]);m.get(k).push(e)});return [...m.entries()].sort((a,b)=>sysLabel(a[0]).localeCompare(sysLabel(b[0]),'fr'));}
  function renderSystems(rows){const groups=groupsFor(rows);if(!groups.length){content.innerHTML='<div class="libraryEmpty"><b>RIEN TROUVÉ</b>Aucun jeu ne correspond à la recherche.</div>';return;}const grid=document.createElement('div');grid.id='systemGrid';groups.forEach(([id,entries])=>{const sys=SYSTEMS[id];const unsupported=sys?.engine==='unsupported';const b=document.createElement('button');b.type='button';b.className='systemCard'+(unsupported?' unsupported':'');b.innerHTML=`<div class="systemName">${sysLabel(id)}</div><div class="systemCount">${entries.length}</div><div class="systemHint">${unsupported?'CATALOGUE SEUL':'OUVRIR LES JEUX ›'}</div>`;b.addEventListener('click',()=>{currentSystem=id;search.value='';render();});grid.appendChild(b);});content.innerHTML='';content.appendChild(grid);}
  function renderGames(rows){const filtered=rows.filter(e=>(e.systemId||'unknown')===currentSystem).sort((a,b)=>a.name.localeCompare(b.name,'fr'));if(!filtered.length){content.innerHTML='<div class="libraryEmpty"><b>AUCUN JEU</b>Rien dans ce système.</div>';return;}const unsupported=SYSTEMS[currentSystem]?.engine==='unsupported';const list=document.createElement('div');list.id='gameList';filtered.forEach(entry=>{const b=document.createElement('button');b.type='button';b.className='gameRow'+(unsupported?' unsupported':'');b.innerHTML=`<div><div class="gameName">${entry.name}</div><div class="gamePath">${entry.path}</div></div><div class="gameExt">${unsupported?'CAT':entry.ext.toUpperCase()}</div>`;b.addEventListener('click',()=>launchEntry(entry));list.appendChild(b);});content.innerHTML='';content.appendChild(list);}
  function render(){const q=normalizeToken(search.value);let rows=library;if(q)rows=library.filter(e=>normalizeToken([e.name,e.path,sysLabel(e.systemId)].join(' ')).includes(q));if(currentSystem){backBtn.style.display='inline-flex';crumb.textContent=sysLabel(currentSystem);renderGames(rows);}else{backBtn.style.display='none';const t=totals();crumb.textContent=t.roms?`${t.roms} jeux détectés • ${t.systems} systèmes`:'Choisis un dossier ROM';renderSystems(rows);}}
  function scan(files){library=[...files].filter(candidate).map(file=>({file,systemId:resolveSystem(file),name:prettyName(file),path:file.webkitRelativePath||file.name,ext:extOf(file)}));currentSystem=null;search.value='';updateBadge();render();openLibrary();const unknown=library.filter(x=>!x.systemId).length,t=totals();setStatus(`${t.roms} ROMS • ${t.systems} SYSTÈMES`);showToast(unknown?`${t.roms} ROMs scannées • ${unknown} à identifier`:`${t.roms} ROMs • détection terminée`,3400);}
  function launchEntry(entry){
    if(loaderInjected){closeLibrary();showToast('Une ROM est déjà chargée. NEW recharge Retro Room pour changer de jeu.',4200);return;}
    selectedFile=entry.file;
    if(!entry.systemId){closeLibrary();systemSelect.value='auto';romName.textContent=entry.file.name.toUpperCase();setStatus('SYSTÈME INCONNU — CHOISIS SYSTEM');showToast('Choisis la console dans SYSTEM puis relance cette ROM.',4200);return;}
    const sys=SYSTEMS[entry.systemId];
    if(sys?.engine==='unsupported'){
      closeLibrary();romName.textContent=entry.file.name.toUpperCase();setStatus(`${sys.label} — NON ÉMULÉ`);showToast(`${sys.label} reconnu dans la bibliothèque, mais aucun core web n’est configuré.`,4600);return;
    }
    systemSelect.value=entry.systemId;closeLibrary();launchRom(entry.file);
  }
  libBtn.addEventListener('click',()=>{if(library.length)openLibrary();else folderInput.click();});folderBtn.addEventListener('click',()=>folderInput.click());folderInput.addEventListener('change',()=>{if(folderInput.files?.length)scan(folderInput.files);folderInput.value='';});closeBtn.addEventListener('click',closeLibrary);backBtn.addEventListener('click',()=>{currentSystem=null;search.value='';render();});search.addEventListener('input',()=>{if(currentSystem&&search.value.trim())currentSystem=null;render();});overlay.addEventListener('click',e=>{if(e.target===overlay)closeLibrary();});document.addEventListener('keydown',e=>{if(e.key==='Escape'&&overlay.classList.contains('open'))closeLibrary();});
  setTimeout(()=>showToast('ROM = un jeu • BIBLIO = ton dossier complet',3200),800);
})();