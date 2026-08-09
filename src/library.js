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

  const SKIP=new Set(['png','jpg','jpeg','gif','webp','bmp','svg','txt','md','nfo','ini','db','pdf','xml','json','log','sav','srm','rtc','ips','ups','bps','cht','bak','tmp','state','thumbnail','nomedia']);
  const FOLDER_MAP=new Map(Object.entries({
    'gamegear':'segaGG','game gear':'segaGG','gg':'segaGG','mastersystem':'segaMS','master system':'segaMS','sms':'segaMS',
    'megadrive':'segaMD','mega drive':'segaMD','genesis':'segaMD','sega genesis':'segaMD','32x':'sega32x','segacd':'segaCD','sega cd':'segaCD','megacd':'segaCD','mega cd':'segaCD','saturn':'segaSaturn',
    'gb':'gb','gameboy':'gb','game boy':'gb','gbc':'gb','gameboycolor':'gb','game boy color':'gb','gba':'gba','gameboyadvance':'gba','game boy advance':'gba',
    'nes':'nes','famicom':'nes','snes':'snes','supernintendo':'snes','super nintendo':'snes','superfamicom':'snes','super famicom':'snes','n64':'n64','nintendo64':'n64','nintendo 64':'n64','nds':'nds','nintendods':'nds','nintendo ds':'nds','virtualboy':'vb','virtual boy':'vb',
    'psx':'psx','ps1':'psx','playstation':'psx','playstation1':'psx','psp':'psp','wonderswan':'ws','wonder swan':'ws','wonderswancolor':'ws','wonderswan color':'ws','wonder swan color':'ws','wscolor':'ws','wsc':'ws','ngp':'ngp','ngpc':'ngp','neogeopocket':'ngp','neo geo pocket':'ngp',
    'pcengine':'pce','pc engine':'pce','turbografx':'pce','supergrafx':'pce','pcfx':'pcfx','pc fx':'pcfx','atari2600':'atari2600','atari 2600':'atari2600','atari5200':'a5200','atari 5200':'a5200','atari7800':'atari7800','atari 7800':'atari7800','lynx':'lynx','jaguar':'jaguar',
    'cps1':'cps1','cps 1':'cps1','cpsi':'cps1','cps2':'cps2','cps 2':'cps2','cpsii':'cps2','cps3':'cps3','cps 3':'cps3','cpsiii':'cps3','neogeo':'neogeo','neo geo':'neogeo','fbneo':'arcade','arcade':'arcade','mame':'mame2003',
    'lowres':'lowresnx','lowresnx':'lowresnx','lowres nx':'lowresnx','amiga':'amiga','c64':'c64','commodore64':'c64','commodore 64':'c64','spectrum':'spectrum','zxspectrum':'spectrum','zx spectrum':'spectrum','amstrad':'amstrad','coleco':'coleco','3do':'threeDO','cdi':'cdi','cd i':'cdi'
  }));
  function normalizeToken(s){return String(s||'').toLowerCase().replace(/[_\-.]+/g,' ').replace(/\s+/g,' ').trim();}
  function extOf(file){const p=file.name.split('.');return p.length>1?p.pop().toLowerCase():'';}
  function folderSystem(file){const rel=file.webkitRelativePath||'';if(!rel.includes('/'))return null;const seg=rel.split('/').slice(0,-1).map(normalizeToken);for(let i=seg.length-1;i>=0;i--){const hit=FOLDER_MAP.get(seg[i]);if(hit)return hit;}return null;}
  function specialDiscSystem(file){const ext=extOf(file),path=normalizeToken(file.webkitRelativePath||file.name);if(!['cue','chd','iso','bin','img','mdf','pbp'].includes(ext))return null;if(path.includes('saturn'))return 'segaSaturn';if(path.includes('mega cd')||path.includes('sega cd')||path.includes('megacd')||path.includes('segacd'))return 'segaCD';if(path.includes('psx')||path.includes('ps1')||path.includes('playstation'))return 'psx';if(path.includes('pcfx')||path.includes('pc fx'))return 'pcfx';if(path.includes('3do'))return 'threeDO';if(path.includes('cdi')||path.includes('cd i'))return 'cdi';return null;}
  function resolveSystem(file){return folderSystem(file)||detectSystem(file.name)||specialDiscSystem(file)||null;}
  function candidate(file){const ext=extOf(file);return !!ext&&!SKIP.has(ext)&&file.size>0;}
  function prettyName(file){return cleanName(file.name).toUpperCase();}
  function sysLabel(id){return id?systemLabel(id):'SYSTÈME INCONNU';}
  function openLibrary(){overlay.classList.add('open');overlay.setAttribute('aria-hidden','false');render();}
  function closeLibrary(){overlay.classList.remove('open');overlay.setAttribute('aria-hidden','true');}
  function totals(){const systems=new Set(library.map(x=>x.systemId).filter(Boolean));return {roms:library.length,systems:systems.size};}
  function updateBadge(){const t=totals();if(!t.roms){badge.style.display='none';return;}badge.style.display='block';badge.textContent=`${t.roms} ROMS • ${t.systems} SYSTÈMES`;}
  function groupsFor(rows){const m=new Map();rows.forEach(e=>{const k=e.systemId||'unknown';if(!m.has(k))m.set(k,[]);m.get(k).push(e)});return [...m.entries()].sort((a,b)=>sysLabel(a[0]).localeCompare(sysLabel(b[0]),'fr'));}
  function renderSystems(rows){const groups=groupsFor(rows);if(!groups.length){content.innerHTML='<div class="libraryEmpty"><b>RIEN TROUVÉ</b>Aucun jeu ne correspond à la recherche.</div>';return;}const grid=document.createElement('div');grid.id='systemGrid';groups.forEach(([id,entries])=>{const b=document.createElement('button');b.type='button';b.className='systemCard';b.innerHTML=`<div class="systemName">${sysLabel(id)}</div><div class="systemCount">${entries.length}</div><div class="systemHint">OUVRIR LES JEUX ›</div>`;b.addEventListener('click',()=>{currentSystem=id;search.value='';render();});grid.appendChild(b);});content.innerHTML='';content.appendChild(grid);}
  function renderGames(rows){const filtered=rows.filter(e=>(e.systemId||'unknown')===currentSystem).sort((a,b)=>a.name.localeCompare(b.name,'fr'));if(!filtered.length){content.innerHTML='<div class="libraryEmpty"><b>AUCUN JEU</b>Rien dans ce système.</div>';return;}const list=document.createElement('div');list.id='gameList';filtered.forEach(entry=>{const b=document.createElement('button');b.type='button';b.className='gameRow';b.innerHTML=`<div><div class="gameName">${entry.name}</div><div class="gamePath">${entry.path}</div></div><div class="gameExt">${entry.ext.toUpperCase()}</div>`;b.addEventListener('click',()=>launchEntry(entry));list.appendChild(b);});content.innerHTML='';content.appendChild(list);}
  function render(){const q=normalizeToken(search.value);let rows=library;if(q)rows=library.filter(e=>normalizeToken([e.name,e.path,sysLabel(e.systemId)].join(' ')).includes(q));if(currentSystem){backBtn.style.display='inline-flex';crumb.textContent=sysLabel(currentSystem);renderGames(rows);}else{backBtn.style.display='none';const t=totals();crumb.textContent=t.roms?`${t.roms} jeux détectés • ${t.systems} systèmes`:'Choisis un dossier ROM';renderSystems(rows);}}
  function scan(files){library=[...files].filter(candidate).map(file=>({file,systemId:resolveSystem(file),name:prettyName(file),path:file.webkitRelativePath||file.name,ext:extOf(file)}));currentSystem=null;search.value='';updateBadge();render();openLibrary();const unknown=library.filter(x=>!x.systemId).length,t=totals();setStatus(`${t.roms} ROMS • ${t.systems} SYSTÈMES`);showToast(unknown?`${t.roms} ROMs scannées • ${unknown} à identifier`:`${t.roms} ROMs • détection terminée`,3400);}
  function launchEntry(entry){if(loaderInjected){closeLibrary();showToast('Une ROM est déjà chargée. NEW recharge Retro Room pour changer de jeu.',4200);return;}selectedFile=entry.file;if(!entry.systemId){closeLibrary();systemSelect.value='auto';romName.textContent=entry.file.name.toUpperCase();setStatus('SYSTÈME INCONNU — CHOISIS SYSTEM');showToast('Choisis la console dans SYSTEM puis relance cette ROM.',4200);return;}systemSelect.value=entry.systemId;closeLibrary();launchRom(entry.file);}
  libBtn.addEventListener('click',()=>{if(library.length)openLibrary();else folderInput.click();});folderBtn.addEventListener('click',()=>folderInput.click());folderInput.addEventListener('change',()=>{if(folderInput.files?.length)scan(folderInput.files);folderInput.value='';});closeBtn.addEventListener('click',closeLibrary);backBtn.addEventListener('click',()=>{currentSystem=null;search.value='';render();});search.addEventListener('input',()=>{if(currentSystem&&search.value.trim())currentSystem=null;render();});overlay.addEventListener('click',e=>{if(e.target===overlay)closeLibrary();});document.addEventListener('keydown',e=>{if(e.key==='Escape'&&overlay.classList.contains('open'))closeLibrary();});
  setTimeout(()=>showToast('ROM = un jeu • BIBLIO = ton dossier complet',3200),800);
})();