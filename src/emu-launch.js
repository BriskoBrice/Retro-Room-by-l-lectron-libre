function launchRom(file){
  const systemId=chooseSystem(file);
  if(!systemId||!SYSTEMS[systemId]){setStatus('FORMAT AMBIGU — CHOISIS LE SYSTÈME');showToast('Cette extension peut appartenir à plusieurs machines. Choisis la console dans SYSTEM.');return;}
  const sys=SYSTEMS[systemId];
  if(sys.engine==='lowresnx'){launchLowResNx(file,systemId);return;}
  const core=sys.core;
  if(sys.threads&&!(window.crossOriginIsolated&&typeof SharedArrayBuffer!=='undefined')){romName.textContent=file.name.toUpperCase();setStatus(systemLabel(systemId)+' — THREADS REQUIS');showToast(systemLabel(systemId)+' nécessite un serveur HTTP avec COOP/COEP. Le fichier local Android ne peut pas lancer ce core proprement.',6500);return;}
  if(loaderInjected){showToast('Le moteur est déjà chargé. NEW recharge Retro Room avant la prochaine ROM.',3000);return;}
  currentCore=core;currentSystemId=systemId;selectedFile=file;emulatorReady=false;emulatorStarted=false;romName.textContent=file.name.toUpperCase();updateController(systemId);
  const arcadeFileMode=!!sys.arcade;releaseRomUrl();if(!arcadeFileMode)romObjectUrl=URL.createObjectURL(file);
  setStatus('CHARGEMENT '+systemLabel(systemId)+'…');bootScreen.style.display='flex';bootScreen.innerHTML='<b>BRISKO VISION</b><span>CHARGEMENT '+systemLabel(systemId)+'</span><span class="tiny">ROM LOCALE • EMULATORJS 4.2.3</span>';
  window.EJS_player='#game';window.EJS_core=core;window.EJS_controlScheme=sys.controlScheme||core;window.EJS_VirtualGamepadSettings=[];window.EJS_gameUrl=arcadeFileMode?file:romObjectUrl;window.EJS_gameName=cleanName(file.name);window.EJS_pathtodata=EJS_DATA;window.EJS_startOnLoaded=false;window.EJS_startButtonName='LANCER LE JEU';window.EJS_alignStartButton='center';window.EJS_language='fr-FR';window.EJS_disableAutoLang=true;window.EJS_browserMode='desktop';window.EJS_threads=!!sys.threads;window.EJS_noAutoFocus=false;window.EJS_backgroundColor='#020504';window.EJS_color='#67e995';window.EJS_volume=.75;window.EJS_Buttons=minimalButtons();
  window.EJS_ready=function(){emulatorReady=true;clearTimeout(watchdog);bootScreen.style.display='none';setStatus('MOTEUR PRÊT — LANCE LE JEU DANS LA TV');showToast('Core '+systemLabel(systemId)+' prêt. Touche « LANCER LE JEU » dans la CRT.',3600);};
  window.EJS_onGameStart=function(){emulatorStarted=true;emulatorReady=true;clearTimeout(watchdog);bootScreen.style.display='none';startEmulatorUiCleaner();setStatus('PLAY — '+systemLabel(systemId));romBtn.textContent='NEW';showToast(systemLabel(systemId)+' lancée');};
  window.EJS_onExit=function(){emulatorStarted=false;setStatus('ÉMULATION ARRÊTÉE — NEW POUR UNE AUTRE ROM');};
  loaderInjected=true;const loader=document.createElement('script');loader.id='ejs-loader';loader.src=EJS_LOADER;loader.async=true;loader.addEventListener('load',()=>setStatus('LOADER REÇU — CORE '+systemLabel(systemId)+'…'));loader.addEventListener('error',()=>{clearTimeout(watchdog);setStatus('ERREUR CDN EMULATORJS');bootScreen.innerHTML='<b>ERREUR CDN</b><span>LOADER.JS INTROUVABLE</span>';showToast('Chrome n’a pas réussi à charger EmulatorJS depuis le CDN.',5000);});document.head.appendChild(loader);
  watchdog=setTimeout(()=>{if(emulatorReady||emulatorStarted)return;setStatus('LE CORE '+systemLabel(systemId)+' NE RÉPOND PAS');showToast('Le core ne répond pas. Pour les images disque, préfère CHD/PBP ou une archive contenant tous les fichiers nécessaires.',6000);},30000);
}
romBtn.addEventListener('click',()=>{if(loaderInjected){releaseRomUrl();location.reload();return;}romInput.click();});
