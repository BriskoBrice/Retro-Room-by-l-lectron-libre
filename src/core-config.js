'use strict';
const EJS_DATA = 'https://cdn.emulatorjs.org/4.2.3/data/';
const EJS_LOADER = EJS_DATA + 'loader.js';
const LOWRES_DATA = 'https://cdn.jsdelivr.net/gh/timoinutilis/lowres-nx@master/platform/web/embed/package/';
const LOWRES_JS = LOWRES_DATA + 'LowResNX120.js';
const app = document.getElementById('app');
const canvas = document.getElementById('room3d');
const crtScreen = document.getElementById('crtScreen');
const gameDiv = document.getElementById('game');
const bootScreen = document.getElementById('bootScreen');
const romInput = document.getElementById('romInput');
const romBtn = document.getElementById('romBtn');
const fullBtn = document.getElementById('fullBtn');
const systemSelect = document.getElementById('systemSelect');
const romName = document.getElementById('romName');
const statusEl = document.getElementById('status');
const toast = document.getElementById('toast');
const threeError = document.getElementById('threeError');

let selectedFile = null;
let currentCore = null;
let currentSystemId = null;
let watchdog = null;
let emulatorStarted = false;
let emulatorReady = false;
let loaderInjected = false;
let romObjectUrl = null;
let lowResFrame = null;

const SYSTEMS = {
  gb:{label:'GB / GBC',core:'gb',profile:'two',exts:['gb','gbc','dmg']},
  gba:{label:'GAME BOY ADVANCE',core:'gba',profile:'gba',exts:['gba']},
  nes:{label:'NES / FAMICOM',core:'nes',profile:'two',exts:['nes','fds','unf','unif']},
  snes:{label:'SNES / SUPER FAMICOM',core:'snes',profile:'snes',exts:['sfc','smc','swc','fig','bs','st']},
  n64:{label:'NINTENDO 64',core:'n64',profile:'n64',exts:['n64','v64','z64','ndd']},
  nds:{label:'NINTENDO DS',core:'nds',profile:'snes',exts:['nds']},
  vb:{label:'VIRTUAL BOY',core:'vb',profile:'two',exts:['vb','vboy']},
  segaGG:{label:'GAME GEAR',core:'segaGG',profile:'two',exts:['gg']},
  segaMS:{label:'MASTER SYSTEM',core:'segaMS',profile:'two',exts:['sms','sg']},
  segaMD:{label:'MEGA DRIVE / GENESIS',core:'segaMD',profile:'md6',exts:['md','gen','smd','mdx','68k','sgd']},
  sega32x:{label:'SEGA 32X',core:'sega32x',profile:'md6',exts:['32x']},
  segaCD:{label:'MEGA-CD / SEGA CD',core:'segaCD',profile:'md6',exts:[]},
  segaSaturn:{label:'SEGA SATURN',core:'segaSaturn',profile:'saturn',exts:[]},
  psx:{label:'PLAYSTATION',core:'psx',profile:'psx',exts:['exe','cbn']},
  psp:{label:'PSP ⚠ THREADS',core:'psp',profile:'psp',exts:['cso','prx'],threads:true},
  atari2600:{label:'ATARI 2600',core:'atari2600',profile:'one',exts:['a26']},
  a5200:{label:'ATARI 5200',core:'a5200',profile:'two',exts:['a52']},
  atari7800:{label:'ATARI 7800',core:'atari7800',profile:'two',exts:['a78']},
  lynx:{label:'ATARI LYNX',core:'lynx',profile:'two',exts:['lnx']},
  jaguar:{label:'ATARI JAGUAR',core:'jaguar',profile:'six',exts:['j64','jag','abs','cof']},
  cps1:{label:'CAPCOM CPS I — FBNEO',core:'arcade',controlScheme:'arcade',profile:'arcade6',arcade:true,exts:[]},
  cps2:{label:'CAPCOM CPS II — FBNEO',core:'arcade',controlScheme:'arcade',profile:'arcade6',arcade:true,exts:[]},
  cps3:{label:'CAPCOM CPS III — FBNEO',core:'arcade',controlScheme:'arcade',profile:'arcade6',arcade:true,exts:[]},
  neogeo:{label:'NEO GEO MVS / AES — FBNEO',core:'arcade',controlScheme:'arcade',profile:'arcade4',arcade:true,exts:[]},
  arcade:{label:'ARCADE — FBNEO',core:'arcade',controlScheme:'arcade',profile:'arcade6',arcade:true,exts:[]},
  cps1legacy:{label:'CPS I — FBA2012 (ANCIEN ROMSET)',core:'fbalpha2012_cps1',controlScheme:'arcade',profile:'arcade6',arcade:true,exts:[]},
  cps2legacy:{label:'CPS II — FBA2012 (ANCIEN ROMSET)',core:'fbalpha2012_cps2',controlScheme:'arcade',profile:'arcade6',arcade:true,exts:[]},
  mame2003:{label:'MAME 2003+',core:'mame2003_plus',controlScheme:'mame',profile:'arcade6',arcade:true,exts:[]},
  pce:{label:'PC ENGINE / TURBOGRAFX / SUPERGRAFX',core:'pce',profile:'pce',exts:['pce']},
  pcfx:{label:'NEC PC-FX',core:'pcfx',profile:'pcfx',exts:[]},
  ngp:{label:'NEO GEO POCKET / COLOR',core:'ngp',profile:'two',exts:['ngp','ngc']},
  ws:{label:'WONDERSWAN / COLOR',core:'ws',profile:'ws',exts:['ws','wsc','pc2']},
  lowresnx:{label:'LOWRES NX',engine:'lowresnx',profile:'lowres',exts:['nx']},
  coleco:{label:'COLECOVISION',core:'coleco',profile:'two',exts:['col','cv']},
  threeDO:{label:'3DO',core:'3do',profile:'six',exts:[]},
  cdi:{label:'PHILIPS CD-i',core:'same_cdi',profile:'six',exts:[]},
  doom:{label:'DOOM / PRBOOM',core:'prboom',profile:'doom',exts:['wad','iwad','pwad']},
  c64:{label:'COMMODORE 64',core:'c64',profile:'computer',exts:['d64','d71','d81','g64','t64','crt']},
  c128:{label:'COMMODORE 128',core:'c128',profile:'computer',exts:[]},
  vic20:{label:'COMMODORE VIC-20',core:'vic20',profile:'computer',exts:[]},
  plus4:{label:'COMMODORE PLUS/4',core:'plus4',profile:'computer',exts:[]},
  pet:{label:'COMMODORE PET',core:'pet',profile:'computer',exts:[]},
  amiga:{label:'COMMODORE AMIGA',core:'amiga',profile:'computer',exts:['adf','adz','dms','ipf','hdf','lha']},
  zx81:{label:'ZX81',core:'81',profile:'computer',exts:['p','t81']},
  spectrum:{label:'ZX SPECTRUM',core:'fuse',profile:'computer',exts:['z80','rzx','scl','trd']},
  amstrad:{label:'AMSTRAD CPC',core:'cap32',profile:'computer',exts:['cdt','cpr','voc']},
  dos:{label:'DOSBOX PURE ⚠ THREADS',core:'dosbox_pure',profile:'computer',exts:['conf'],threads:true}
};
const SYSTEM_GROUPS=[['NINTENDO',['gb','gba','nes','snes','n64','nds','vb']],['SEGA',['segaGG','segaMS','segaMD','sega32x','segaCD','segaSaturn']],['SONY',['psx','psp']],['ATARI',['atari2600','a5200','atari7800','lynx','jaguar']],['BANDAI / NEC / SNK',['ws','ngp','pce','pcfx']],['ARCADE',['cps1','cps2','cps3','neogeo','arcade','cps1legacy','cps2legacy','mame2003']],['FANTASY CONSOLES',['lowresnx']],['ORDINATEURS',['c64','c128','vic20','plus4','pet','amiga','zx81','spectrum','amstrad','dos']],['AUTRES',['coleco','threeDO','cdi','doom']]];
const AUTO_EXT={};
for(const [id,sys] of Object.entries(SYSTEMS)){for(const ext of sys.exts){if(AUTO_EXT[ext]) AUTO_EXT[ext]=null;else if(!(ext in AUTO_EXT)) AUTO_EXT[ext]=id;}}
function populateSystemSelect(){for(const [groupName,ids] of SYSTEM_GROUPS){const group=document.createElement('optgroup');group.label=groupName;ids.forEach(id=>{const opt=document.createElement('option');opt.value=id;opt.textContent=SYSTEMS[id].label;group.appendChild(opt);});systemSelect.appendChild(group);}}
populateSystemSelect();
function setStatus(text){statusEl.textContent=text;}
function showToast(text,ms=2600){toast.textContent=text;toast.classList.add('show');clearTimeout(showToast.t);showToast.t=setTimeout(()=>toast.classList.remove('show'),ms);}
function cleanName(name){return name.replace(/\.[^.]+$/,'').replace(/[_-]+/g,' ').trim();}
function detectSystem(name){const ext=(name.split('.').pop()||'').toLowerCase();return AUTO_EXT[ext]||null;}
function chooseSystem(file){const manual=systemSelect.value;if(manual!=='auto') return manual;return detectSystem(file.name);}
function systemLabel(id){return SYSTEMS[id]?.label||String(id||'INCONNU').toUpperCase();}
function isAmbiguousFile(file){return !detectSystem(file.name);}
