(() => {
  const SKIP = new Set([
    'png','jpg','jpeg','gif','webp','bmp','svg','txt','md','nfo','ini','db','pdf','xml','json','log',
    'sav','srm','rtc','ips','ups','bps','cht','bak','tmp','state','thumbnail','nomedia'
  ]);

  const FOLDER_MAP = new Map(Object.entries({
    'gamegear':'segaGG','game gear':'segaGG','gg':'segaGG',
    'mastersystem':'segaMS','master system':'segaMS','sms':'segaMS',
    'megadrive':'segaMD','mega drive':'segaMD','genesis':'segaMD','sega genesis':'segaMD',
    '32x':'sega32x','segacd':'segaCD','sega cd':'segaCD','megacd':'segaCD','mega cd':'segaCD','saturn':'segaSaturn',
    'gb':'gb','gameboy':'gb','game boy':'gb','gbc':'gb','gameboycolor':'gb','game boy color':'gb',
    'gba':'gba','gameboyadvance':'gba','game boy advance':'gba',
    'nes':'nes','famicom':'nes','snes':'snes','supernintendo':'snes','super nintendo':'snes',
    'superfamicom':'snes','super famicom':'snes','n64':'n64','nintendo64':'n64','nintendo 64':'n64',
    'nds':'nds','nintendods':'nds','nintendo ds':'nds','virtualboy':'vb','virtual boy':'vb',
    'switch':'switch','nintendo switch':'switch','nswitch':'switch',
    'psx':'psx','ps1':'psx','playstation':'psx','playstation1':'psx','psp':'psp',
    'wonderswan':'ws','wonder swan':'ws','wonderswancolor':'ws','wonderswan color':'ws',
    'wonder swan color':'ws','wscolor':'ws','wsc':'ws',
    'ngp':'ngp','ngpc':'ngp','neogeopocket':'ngp','neo geo pocket':'ngp',
    'neogeopocketcolor':'ngp','neogeo pocket color':'ngp','neo geo pocket color':'ngp',
    'pcengine':'pce','pc engine':'pce','turbografx':'pce','supergrafx':'pce','pcfx':'pcfx','pc fx':'pcfx',
    'atari2600':'atari2600','atari 2600':'atari2600','atari5200':'a5200','atari 5200':'a5200',
    'atari7800':'atari7800','atari 7800':'atari7800','lynx':'lynx','jaguar':'jaguar',
    'cps1':'cps1','cps 1':'cps1','cpsi':'cps1','cps2':'cps2','cps 2':'cps2','cpsii':'cps2',
    'cps3':'cps3','cps 3':'cps3','cpsiii':'cps3','neogeo':'neogeo','neo geo':'neogeo',
    'fbneo':'arcade','arcade':'arcade','mame':'mame2003',
    'lowres':'lowresnx','lowresnx':'lowresnx','lowres nx':'lowresnx',
    'amiga':'amiga','c64':'c64','commodore64':'c64','commodore 64':'c64',
    'spectrum':'spectrum','zxspectrum':'spectrum','zx spectrum':'spectrum','amstrad':'amstrad',
    'coleco':'coleco','3do':'threeDO','cdi':'cdi','cd i':'cdi'
  }));

  const COMPACT = new Map([...FOLDER_MAP].map(([name,id]) => [name.replace(/\s+/g,''), id]));
  const normalizeToken = s => String(s || '').toLowerCase().replace(/[_\-.]+/g,' ').replace(/\s+/g,' ').trim();
  const extOf = file => { const p = file.name.split('.'); return p.length > 1 ? p.pop().toLowerCase() : ''; };

  function candidate(file) {
    const ext = extOf(file);
    return !!ext && !SKIP.has(ext) && file.size > 0;
  }

  function folderSystem(file) {
    const rel = file.webkitRelativePath || '';
    if (!rel.includes('/')) return null;
    const segments = rel.split('/').slice(0,-1).map(normalizeToken);
    for (let i = segments.length - 1; i >= 0; i--) {
      const token = segments[i];
      const hit = FOLDER_MAP.get(token) || COMPACT.get(token.replace(/\s+/g,''));
      if (hit) return hit;
    }
    return null;
  }

  function specialDiscSystem(file) {
    const ext = extOf(file);
    const path = normalizeToken(file.webkitRelativePath || file.name);
    if (!['cue','chd','iso','bin','img','mdf','pbp'].includes(ext)) return null;
    if (path.includes('saturn')) return 'segaSaturn';
    if (path.includes('mega cd') || path.includes('sega cd') || path.includes('megacd') || path.includes('segacd')) return 'segaCD';
    if (path.includes('psx') || path.includes('ps1') || path.includes('playstation')) return 'psx';
    if (path.includes('pcfx') || path.includes('pc fx')) return 'pcfx';
    if (path.includes('3do')) return 'threeDO';
    if (path.includes('cdi') || path.includes('cd i')) return 'cdi';
    return null;
  }

  function resolveSystem(file, detectByExtension) {
    return folderSystem(file) || detectByExtension(file.name) || specialDiscSystem(file) || null;
  }

  globalThis.RetroRoomLibraryDetect = {
    normalizeToken, extOf, candidate, folderSystem, specialDiscSystem, resolveSystem
  };
})();
