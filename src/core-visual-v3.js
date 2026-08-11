/* ============================================================
   RETRO ROOM — VISUAL V3
   Direction validee : chambre 90s dense, CRT central, vieux PC,
   etageres chargees, neon L'electron libre, lumiere chaude/bleue.
   Couche VISUELLE UNIQUEMENT : aucun code ROM/core/input.
   ============================================================ */
(() => {
  if (!window.THREE || typeof scene === 'undefined') return;

  try {
    const root = new THREE.Group();
    root.name = 'retroRoomVisualV3';
    scene.add(root);

    // La reference validee remplace le lit par un coin bureau/collection.
    if (typeof bed !== 'undefined') bed.visible = false;

    // Ambiance : tungsten + bleu nuit, sans basculer en cyberpunk.
    renderer.toneMappingExposure = 1.12;
    if (typeof hemi !== 'undefined') hemi.intensity = .52;
    if (typeof warm !== 'undefined') { warm.intensity = 14; warm.color.set(0xffb678); }
    if (typeof pink !== 'undefined') pink.intensity = 2.6;
    if (typeof blue !== 'undefined') { blue.intensity = 5.0; blue.color.set(0x426fa8); }

    const wood = new THREE.MeshStandardMaterial({color:0x4c2f24,roughness:.9});
    const wood2 = new THREE.MeshStandardMaterial({color:0x2b1b18,roughness:.94});
    const black = new THREE.MeshStandardMaterial({color:0x121216,roughness:.62,metalness:.08});
    const plastic = new THREE.MeshStandardMaterial({color:0x2c2d32,roughness:.55});
    const beige = new THREE.MeshStandardMaterial({color:0x948b79,roughness:.9});
    const paper = new THREE.MeshStandardMaterial({color:0xc8b99a,roughness:.95});
    const cableMat = new THREE.MeshStandardMaterial({color:0x111114,roughness:.72});

    const v3Box = (w,h,d,mat,x,y,z,rx=0,ry=0,rz=0) => box(w,h,d,mat,x,y,z,rx,ry,rz,root);
    const v3Plane = (w,h,mat,x,y,z,rx=0,ry=0,rz=0) => plane(w,h,mat,x,y,z,rx,ry,rz,root);
    const v3Cyl = (r,h,mat,x,y,z,rx=0,ry=0,rz=0) => cyl(r,h,mat,x,y,z,rx,ry,rz,root);

    function makeTextTexture(title, sub='', opts={}) {
      const c=document.createElement('canvas'); c.width=768; c.height=384;
      const g=c.getContext('2d');
      const bg=opts.bg||'#18151a', fg=opts.fg||'#e7d9bd', accent=opts.accent||'#b44652';
      const grad=g.createLinearGradient(0,0,768,384); grad.addColorStop(0,bg); grad.addColorStop(1,'#09080b');
      g.fillStyle=grad; g.fillRect(0,0,c.width,c.height);
      for(let i=0;i<90;i++){g.fillStyle=`rgba(255,255,255,${Math.random()*.035})`;g.fillRect(Math.random()*768,Math.random()*384,1+Math.random()*3,1);}
      g.strokeStyle='rgba(255,255,255,.10)';g.strokeRect(14,14,740,356);
      g.fillStyle=accent;g.fillRect(28,30,150,8);
      g.fillStyle=fg;g.textAlign='center';g.font='900 76px Arial Black,Arial';g.fillText(title,384,190);
      if(sub){g.font='700 27px monospace';g.fillStyle=opts.sub||'#a99d89';g.fillText(sub,384,248);}
      const t=new THREE.CanvasTexture(c);t.colorSpace=THREE.SRGBColorSpace;return t;
    }

    function posterV3(title, sub, w,h,x,y,z,ry=0,accent='#b44652') {
      v3Box(w+.06,h+.06,.035,black,x,y,z-.025,0,ry,0);
      v3Plane(w,h,new THREE.MeshBasicMaterial({map:makeTextTexture(title,sub,{accent})}),x,y,z,0,ry,0);
    }

    function makeNeonTexture(){
      const c=document.createElement('canvas');c.width=1024;c.height=256;const g=c.getContext('2d');
      g.clearRect(0,0,c.width,c.height);g.textAlign='center';g.textBaseline='middle';
      g.font='italic 92px cursive';
      g.shadowColor='#29a9ff';g.shadowBlur=42;g.fillStyle='#7ed1ff';g.fillText("L'électron libre",512,128);
      g.shadowBlur=14;g.fillStyle='#d6f2ff';g.fillText("L'électron libre",512,128);
      const t=new THREE.CanvasTexture(c);t.colorSpace=THREE.SRGBColorSpace;return t;
    }

    // Grande enseigne au fond, comme dans la direction validee.
    const neonMat=new THREE.MeshBasicMaterial({map:makeNeonTexture(),transparent:true,depthWrite:false});
    v3Plane(2.70,.68,neonMat,.72,3.08,-5.57);
    const neonGlow=new THREE.PointLight(0x359cff,4.2,4.2,2);neonGlow.position.set(.72,2.92,-5.05);root.add(neonGlow);

    // Ville de nuit derriere la fenetre.
    const cityBase=new THREE.MeshBasicMaterial({color:0x07131d});
    v3Plane(1.64,1.54,cityBase,-.55,2.15,-5.635);
    const cityColors=[0xffd99a,0xf2a66f,0x91c8ff,0xffefbd];
    for(let i=0;i<62;i++){
      const x=-1.31+Math.random()*1.52;
      const y=1.48+Math.random()*1.25;
      const s=.008+Math.random()*.014;
      const dot=new THREE.Mesh(new THREE.PlaneGeometry(s,s),new THREE.MeshBasicMaterial({color:cityColors[i%cityColors.length]}));
      dot.position.set(x,y,-5.60);root.add(dot);
    }
    // Silhouettes d'immeubles.
    for(let i=0;i<9;i++){
      const h=.22+Math.random()*.58,w=.10+Math.random()*.13;
      v3Box(w,h,.018,new THREE.MeshBasicMaterial({color:0x05090e}),-1.27+i*.18,1.43+h/2,-5.61);
    }

    // Deux bibliotheques massives de collection au mur du fond.
    function collectionShelf(cx, cy, width, height, rows, cols) {
      const depth=.38;
      v3Box(width,height,depth,wood2,cx,cy,-5.32);
      v3Box(width-.14,height-.12,depth-.08,new THREE.MeshStandardMaterial({color:0x201718,roughness:1}),cx,cy,-5.10);
      for(let r=0;r<=rows;r++){
        const yy=cy-height/2+r*(height/rows);
        v3Box(width-.05,.055,depth+.02,wood,cx,yy,-5.05);
      }
      const palette=[0x3f5064,0x67404c,0x6c6039,0x3c5b52,0x584168,0x765037,0x343d54,0x8b7446];
      for(let r=0;r<rows;r++){
        for(let i=0;i<cols;i++){
          const bw=(width-.22)/cols*.72;
          const bh=(height/rows)*.58;
          const x=cx-width/2+.13+(i+.5)*(width-.22)/cols;
          const y=cy-height/2+(r+.44)*(height/rows);
          const mat=new THREE.MeshStandardMaterial({color:palette[(r*cols+i)%palette.length],roughness:.86});
          v3Box(bw,bh,.12,mat,x,y,-4.82,0,0,(i%4-1.5)*.018);
          if((i+r)%3===0) v3Plane(bw*.55,bh*.15,new THREE.MeshBasicMaterial({color:0xd4c39f}),x,y,-4.752);
        }
      }
    }
    collectionShelf(-2.75,2.02,1.38,2.75,5,8);
    collectionShelf(2.62,2.02,1.70,2.82,5,9);

    // Etageres horizontales derriere/au-dessus du CRT.
    for(const y of [1.08,1.55,2.02,2.49]){
      v3Box(2.35,.07,.38,wood,.78,y,-5.08);
      v3Box(2.22,.34,.025,new THREE.MeshStandardMaterial({color:0x21181b,roughness:1}),.78,y+.16,-5.28);
      for(let i=0;i<11;i++){
        const mat=new THREE.MeshStandardMaterial({color:[0x445a70,0x704450,0x665c3d,0x3b594f,0x5a476b,0x7a5237][(i+Math.round(y*10))%6],roughness:.85});
        v3Box(.115,.285,.15,mat,-.28+i*.205,y+.18,-4.91,0,0,(i%3-1)*.025);
      }
    }

    // Vieux bureau informatique a gauche.
    v3Box(1.45,.11,.70,wood,-2.42,.78,-2.82);
    v3Box(.11,.78,.11,wood2,-3.03,.39,-3.05);v3Box(.11,.78,.11,wood2,-1.81,.39,-3.05);
    v3Box(.68,.61,.55,beige,-2.58,1.20,-2.88);
    v3Box(.54,.39,.028,new THREE.MeshBasicMaterial({color:0x10342e}),-2.58,1.22,-2.585);
    // lignes de terminal vertes
    for(let i=0;i<8;i++) v3Plane(.32-(i%3)*.035,.008,new THREE.MeshBasicMaterial({color:0x70d6a0}),-2.68+(i%2)*.04,1.34-i*.038,-2.568);
    v3Box(.72,.06,.30,beige,-2.55,.84,-2.48);
    for(let i=0;i<9;i++) v3Box(.045,.018,.055,new THREE.MeshStandardMaterial({color:0x565248,roughness:.9}),-2.84+i*.072,.885,-2.32);
    v3Box(.34,.50,.42,beige,-1.97,1.02,-2.90);
    // Petite lampe de bureau.
    v3Cyl(.08,.025,black,-3.00,.86,-2.37,Math.PI/2);
    v3Cyl(.018,.54,black,-3.00,1.13,-2.37,0,0,-.32);
    const shade=new THREE.Mesh(new THREE.ConeGeometry(.17,.27,16,1,true),new THREE.MeshStandardMaterial({color:0x7d5b48,roughness:.75,side:THREE.DoubleSide}));
    shade.position.set(-2.85,1.42,-2.36);shade.rotation.z=-1.05;root.add(shade);
    const deskGlow=new THREE.PointLight(0xffbd78,5.2,2.4,2);deskGlow.position.set(-2.82,1.38,-2.28);root.add(deskGlow);

    // Chaise + veste drapee (silhouette simple mais lisible).
    v3Box(.60,.08,.56,black,-2.35,.44,-1.94);
    v3Box(.08,.60,.08,black,-2.62,.18,-2.10);v3Box(.08,.60,.08,black,-2.08,.18,-2.10);
    v3Box(.56,.80,.07,black,-2.35,.87,-2.18,-.08,0,0);
    const jacket=new THREE.Mesh(new THREE.SphereGeometry(.46,16,12),new THREE.MeshStandardMaterial({color:0x26394a,roughness:.96}));
    jacket.scale.set(.78,1.08,.28);jacket.position.set(-2.35,.97,-2.11);jacket.rotation.z=.08;root.add(jacket);
    // Patch discret sur la veste.
    v3Plane(.18,.12,new THREE.MeshBasicMaterial({color:0x8b583a}),-2.18,1.05,-1.82,0,0,-.05);

    // Details du meuble TV : VCR / ampli / consoles.
    v3Box(1.72,.24,.53,new THREE.MeshStandardMaterial({color:0x24262b,roughness:.52}),.35,.28,-1.04);
    v3Box(1.58,.035,.025,new THREE.MeshBasicMaterial({color:0x090a0c}),.35,.31,-.755);
    v3Plane(.34,.065,new THREE.MeshBasicMaterial({color:0x6fe8bf}),.73,.30,-.735);
    v3Box(.76,.14,.42,new THREE.MeshStandardMaterial({color:0x9a9281,roughness:.72}),-.27,.49,-.72);
    v3Box(.58,.11,.38,new THREE.MeshStandardMaterial({color:0x34373c,roughness:.58}),.62,.50,-.72);
    for(let i=0;i<4;i++) v3Cyl(.025,.016,new THREE.MeshBasicMaterial({color:i===0?0xff4141:0x70747c}),.48+i*.08,.52,-.515,Math.PI/2);

    // Marque generique sur le CRT + grilles laterales.
    v3Plane(.34,.055,new THREE.MeshBasicMaterial({map:makeTextTexture('BRISKO','VISION',{bg:'#141417',fg:'#b5ada0',accent:'#444'})}),.32,.64,-.653);
    for(let i=0;i<13;i++){
      v3Box(.012,.22,.018,new THREE.MeshStandardMaterial({color:0x18181c,roughness:.7}),-1.03+i*.055,.80,-.655);
    }

    // Posters 90s generiques/originaux sur le mur gauche.
    posterV3('FIGHT','ROUND ONE',.66,.92,-3.72,2.72,-3.48,Math.PI/2,'#b5473e');
    posterV3('NIGHT','CITY RUN',.62,.84,-3.72,1.73,-2.65,Math.PI/2,'#387e9d');
    posterV3('VIDEO','CLUB 98',.60,.80,-3.72,2.72,-1.76,Math.PI/2,'#6f4b8d');

    // Petite chaine hi-fi/boombox au-dessus du meuble gauche.
    v3Box(.84,.34,.24,new THREE.MeshStandardMaterial({color:0x303238,roughness:.55,metalness:.12}),-2.62,2.32,-4.86);
    for(const dx of [-.23,.23]) v3Cyl(.115,.022,new THREE.MeshStandardMaterial({color:0x15161a,roughness:.45}),-2.62+dx,2.31,-4.73,Math.PI/2);
    v3Plane(.20,.065,new THREE.MeshBasicMaterial({color:0x5e9d87}),-2.62,2.39,-4.725);

    // Petits objets et figurines pour casser l'effet "etageres vides".
    for(let i=0;i<8;i++){
      const x=-.15+i*.28;
      v3Cyl(.035,.18,new THREE.MeshStandardMaterial({color:[0xa84a48,0x4473a0,0xb08a45,0x5c8a5d][i%4],roughness:.65}),x,2.77,-4.84);
      v3Cyl(.055,.06,new THREE.MeshStandardMaterial({color:0xd2b58e,roughness:.78}),x,2.89,-4.84);
    }

    // Magazines et boites dans la zone avant, beaucoup plus visibles depuis la camera portrait.
    const magColors=[0x8c3e4c,0x365d7c,0x9b7b3f,0x4f6a53,0x604a7a,0x9a5b38];
    function magazine(x,z,rot,color,label){
      v3Box(.48,.018,.34,new THREE.MeshStandardMaterial({color,roughness:.9}),x,.036,z,0,rot,0);
      const tex=makeTextTexture(label,'90s GAMING',{bg:'#161319',fg:'#ead8af',accent:'#be4f59'});
      v3Plane(.39,.25,new THREE.MeshBasicMaterial({map:tex}),x,.048,z+.005,-Math.PI/2,0,-rot);
    }
    magazine(-1.62,1.48,.20,magColors[0],'JOYPAD');
    magazine(-1.08,1.67,-.14,magColors[1],'MEGA');
    magazine(.92,1.46,.24,magColors[2],'CONSOLES');
    magazine(1.47,1.68,-.18,magColors[4],'PLAYER');
    magazine(.38,1.86,.08,magColors[5],'ARCADE');

    // VHS / cartouches empilees au sol.
    for(let i=0;i<7;i++){
      v3Box(.34,.038,.22,new THREE.MeshStandardMaterial({color:magColors[i%magColors.length],roughness:.78}),2.15+i*.035,.055+i*.041,.88+i*.028,0,-.18+i*.025,0);
    }
    for(let i=0;i<5;i++){
      v3Box(.18,.05,.24,new THREE.MeshStandardMaterial({color:0x292a30,roughness:.58}),-2.42+i*.21,.055,1.08+(i%2)*.16,0,(i-2)*.11,0);
      v3Plane(.10,.04,new THREE.MeshBasicMaterial({color:0xb8aa8f}),-2.42+i*.21,.082,1.20+(i%2)*.16,-Math.PI/2);
    }

    // Tasse + bol a gauche du premier plan.
    v3Cyl(.115,.22,new THREE.MeshStandardMaterial({color:0xc9c1ae,roughness:.82}),-2.72,.13,.82);
    v3Cyl(.23,.12,new THREE.MeshStandardMaterial({color:0x5a3a2f,roughness:.88}),-2.25,.08,.88);
    for(let i=0;i<13;i++) v3Box(.055,.018,.10,new THREE.MeshStandardMaterial({color:0xd28a3c,roughness:.8}),-2.42+Math.random()*.34,.15,-.03+.88+Math.random()*.15,0,Math.random()*Math.PI,Math.random()*.2);

    // Manette physique et cables dans le decor.
    function physicalPad(x,z,rot=0){
      v3Box(.38,.055,.22,plastic,x,.07,z,0,rot,0);
      v3Cyl(.032,.016,black,x-.10,.105,z+.025,Math.PI/2);
      v3Cyl(.025,.016,new THREE.MeshStandardMaterial({color:0x934251,roughness:.5}),x+.11,.105,z+.045,Math.PI/2);
      v3Cyl(.025,.016,new THREE.MeshStandardMaterial({color:0x4b6e93,roughness:.5}),x+.15,.105,z-.005,Math.PI/2);
    }
    physicalPad(.12,1.08,.15);
    const cableCurve=new THREE.CatmullRomCurve3([
      new THREE.Vector3(.12,.06,1.02),new THREE.Vector3(.35,.04,.72),new THREE.Vector3(.70,.03,.42),new THREE.Vector3(.88,.26,-.25)
    ]);
    root.add(new THREE.Mesh(new THREE.TubeGeometry(cableCurve,28,.008,5,false),cableMat));

    // Ombres de contact bon marche pour donner du poids aux objets.
    const shadowMat=new THREE.MeshBasicMaterial({color:0x000000,transparent:true,opacity:.24,depthWrite:false});
    function blob(x,z,sx,sz){const m=new THREE.Mesh(new THREE.CircleGeometry(.42,24),shadowMat.clone());m.rotation.x=-Math.PI/2;m.scale.set(sx,sz,1);m.position.set(x,.011,z);root.add(m);}
    blob(.32,-.88,2.0,.65);blob(-2.42,-2.10,1.0,.55);blob(.15,1.25,2.2,.8);

    // Micro-lumieres d'etageres, surtout chaudes.
    for(const [x,y,z,intensity,color] of [[-2.65,2.25,-4.7,2.2,0xffba78],[2.55,2.35,-4.7,2.4,0xffc58b],[.75,2.25,-4.55,1.7,0xffa96a]]){
      const l=new THREE.PointLight(color,intensity,1.8,2);l.position.set(x,y,z);root.add(l);
    }

    // Legere profondeur supplementaire autour de la TV.
    const tvHalo=new THREE.PointLight(0x77c4a8,1.8,2.0,2);tvHalo.position.set(.30,1.45,-.45);root.add(tvHalo);

  } catch (err) {
    console.warn('RetroRoom Visual V3 skipped:', err);
  }
})();
