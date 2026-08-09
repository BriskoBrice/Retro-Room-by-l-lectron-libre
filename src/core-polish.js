/* ============================================================
   RETRO ROOM — POLISH 90s REALISTE
   Couche purement visuelle. Ne touche ni aux ROMs ni aux cores.
   ============================================================ */
(() => {
  if (!window.THREE || typeof scene === 'undefined') return;

  const srgb = tex => { tex.colorSpace = THREE.SRGBColorSpace; return tex; };

  function canvasTexture(w, h, draw, repeatX=1, repeatY=1){
    const c = document.createElement('canvas');
    c.width = w; c.height = h;
    const g = c.getContext('2d');
    draw(g, w, h);
    const tex = srgb(new THREE.CanvasTexture(c));
    tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
    tex.repeat.set(repeatX, repeatY);
    tex.anisotropy = Math.min(renderer.capabilities.getMaxAnisotropy?.() || 1, 4);
    return tex;
  }

  function noise(g,w,h,count=1400,alpha=.045){
    for(let i=0;i<count;i++){
      const a = Math.random()*alpha;
      g.fillStyle = `rgba(255,255,255,${a})`;
      g.fillRect(Math.random()*w,Math.random()*h,1,1);
    }
  }

  const wallpaper = canvasTexture(256,256,(g,w,h)=>{
    g.fillStyle='#493d46'; g.fillRect(0,0,w,h);
    for(let x=0;x<w;x+=32){
      g.fillStyle = x%64===0 ? '#5a4a55' : '#41363f';
      g.fillRect(x,0,13,h);
      g.fillStyle='rgba(205,185,170,.07)'; g.fillRect(x+13,0,2,h);
    }
    g.strokeStyle='rgba(24,15,21,.16)'; g.lineWidth=1;
    for(let y=0;y<h;y+=18){g.beginPath();g.moveTo(0,y);g.lineTo(w,y);g.stroke();}
    noise(g,w,h,800,.05);
  },5.2,2.35);

  const sideWallpaper = canvasTexture(256,256,(g,w,h)=>{
    g.fillStyle='#332b33'; g.fillRect(0,0,w,h);
    for(let x=0;x<w;x+=36){
      g.fillStyle = x%72===0 ? '#403440' : '#2d262f';
      g.fillRect(x,0,14,h);
    }
    noise(g,w,h,650,.04);
  },5.5,3);

  const carpet = canvasTexture(320,320,(g,w,h)=>{
    const gr=g.createLinearGradient(0,0,w,h);
    gr.addColorStop(0,'#322838');gr.addColorStop(.5,'#261e2d');gr.addColorStop(1,'#1e1725');
    g.fillStyle=gr;g.fillRect(0,0,w,h);
    for(let i=0;i<2100;i++){
      const v=38+Math.floor(Math.random()*40);
      g.fillStyle=`rgba(${v+28},${v},${v+34},${.08+Math.random()*.16})`;
      const x=Math.random()*w,y=Math.random()*h;
      g.fillRect(x,y,1+Math.random()*1.2,1+Math.random()*2.6);
    }
    g.strokeStyle='rgba(116,79,128,.05)';
    for(let x=0;x<w;x+=38){g.beginPath();g.moveTo(x,0);g.lineTo(x,h);g.stroke();}
    for(let y=0;y<h;y+=38){g.beginPath();g.moveTo(0,y);g.lineTo(w,y);g.stroke();}
  },4.8,6.5);

  const wood = canvasTexture(256,128,(g,w,h)=>{
    const grad=g.createLinearGradient(0,0,w,0);
    grad.addColorStop(0,'#4f3024');grad.addColorStop(.28,'#76503a');grad.addColorStop(.58,'#5c382a');grad.addColorStop(1,'#704932');
    g.fillStyle=grad;g.fillRect(0,0,w,h);
    for(let i=0;i<28;i++){
      const y=Math.random()*h;
      g.strokeStyle=`rgba(45,22,15,${.12+Math.random()*.18})`;
      g.lineWidth=.5+Math.random()*1.8;
      g.beginPath();g.moveTo(0,y);
      g.bezierCurveTo(w*.3,y+Math.random()*8-4,w*.7,y+Math.random()*8-4,w,y+Math.random()*5-2.5);g.stroke();
    }
    noise(g,w,h,350,.025);
  },3,1.5);

  if (mats?.wall)  { mats.wall.map=wallpaper; mats.wall.color.set(0xffffff); mats.wall.needsUpdate=true; }
  if (mats?.wall2) { mats.wall2.map=sideWallpaper; mats.wall2.color.set(0xffffff); mats.wall2.needsUpdate=true; }
  if (mats?.floor) { mats.floor.map=carpet; mats.floor.color.set(0xffffff); mats.floor.needsUpdate=true; }
  if (mats?.wood)  { mats.wood.map=wood; mats.wood.color.set(0xffffff); mats.wood.needsUpdate=true; }
  if (mats?.darkWood){ mats.darkWood.map=wood; mats.darkWood.color.set(0x6e4938); mats.darkWood.needsUpdate=true; }

  scene.background.set(0x09080a);
  scene.fog.color.set(0x0d0b0e);
  scene.fog.near=8.8; scene.fog.far=20;
  renderer.toneMappingExposure = 1.08;
  if(typeof hemi!=='undefined') hemi.intensity=.66;
  if(typeof warm!=='undefined'){warm.intensity=17;warm.color.set(0xffbd84);}
  if(typeof pink!=='undefined'){pink.intensity=6.5;pink.color.set(0xe55d7d);}
  if(typeof blue!=='undefined'){blue.intensity=6.2;blue.color.set(0x6087b9);}

  const warmCeiling = new THREE.PointLight(0xffcf96,8.5,5.5,2);
  warmCeiling.position.set(-.3,3.25,-1.5); scene.add(warmCeiling);
  const tvBounce = new THREE.PointLight(0x8fb3a1,3.5,3.0,2);
  tvBounce.position.set(.2,1.55,-.3); scene.add(tvBounce);

  box(7.55,.10,.08,new THREE.MeshStandardMaterial({color:0x6a4a38,roughness:.88}),0,.07,-5.66);
  box(.08,.10,11.15,new THREE.MeshStandardMaterial({color:0x5b4034,roughness:.9}),-3.75,.07,-.18);
  box(.08,.10,11.15,new THREE.MeshStandardMaterial({color:0x5b4034,roughness:.9}),3.75,.07,-.18);
  box(7.55,.045,.055,new THREE.MeshStandardMaterial({color:0x9a8673,roughness:.92}),0,1.18,-5.68);

  const curtainMat = new THREE.MeshStandardMaterial({color:0x635768,roughness:.98});
  for(const x of [-1.56,.46]){
    box(.20,1.96,.14,curtainMat,x,2.10,-5.47);
    for(let i=0;i<4;i++) box(.025,1.82,.16,new THREE.MeshStandardMaterial({color:0x514758,roughness:1}),x-.07+i*.045,2.08,-5.39);
  }
  box(2.14,.08,.08,new THREE.MeshStandardMaterial({color:0x8c7968,metalness:.08,roughness:.72}),-.55,3.08,-5.46);

  function textTex(title,sub,bg='#d8c9a4',ink='#382b25',accent='#8d283b'){
    return canvasTexture(512,320,(g,w,h)=>{
      g.fillStyle=bg;g.fillRect(0,0,w,h);
      g.fillStyle='rgba(40,28,24,.10)';
      for(let i=0;i<40;i++)g.fillRect(Math.random()*w,Math.random()*h,Math.random()*80,1);
      g.fillStyle=accent;g.fillRect(0,0,w,34);
      g.fillStyle=ink;g.font='900 68px Arial Black,Arial';g.textAlign='center';g.fillText(title,w/2,150);
      g.font='700 24px monospace';g.fillText(sub,w/2,205);
      g.strokeStyle='rgba(50,30,24,.25)';g.strokeRect(12,12,w-24,h-24);
    });
  }

  function framedPoster(title,sub,w,h,x,y,z,ry=0,bg,ink,accent){
    box(w+.06,h+.06,.035,new THREE.MeshStandardMaterial({color:0x211b19,roughness:.82}),x,y,z-.02,0,ry,0);
    plane(w,h,new THREE.MeshBasicMaterial({map:textTex(title,sub,bg,ink,accent)}),x,y,z,0,ry,0);
  }

  framedPoster('SEGA','16-BIT POWER',.68,.45,-2.85,2.72,-5.65,0,'#e8e5d9','#183057','#2d58a5');
  framedPoster('ARCADE','INSERT COIN',.60,.82,1.45,2.65,-5.65,0,'#19191d','#f5e6bb','#c8434d');
  framedPoster('RACING','NIGHT RUN',.64,.88,2.35,2.60,-5.65,0,'#111820','#e6ddc3','#c55743');
  framedPoster('VIDEO','CLUB 98',.58,.78,-3.74,2.28,-.35,Math.PI/2,'#eadac7','#333','#9b4052');
  framedPoster('MUSIC','MIX TAPE',.58,.76,-3.74,1.38,1.02,Math.PI/2,'#d5d0c4','#30303a','#6b557f');

  box(1.02,.68,.035,new THREE.MeshStandardMaterial({color:0x8a6543,roughness:1}),-2.15,1.84,-5.62);
  const paperColors=[0xe9e1c8,0xd6e7ef,0xf1d6cf,0xf0e8a9];
  for(let i=0;i<7;i++){
    const m=new THREE.MeshBasicMaterial({color:paperColors[i%paperColors.length]});
    plane(.18+.03*(i%2),.12+.02*(i%3),m,-2.47+(i%4)*.19,2.05-Math.floor(i/4)*.27,-5.59,0,0,(i-3)*.04);
  }

  function vhs(x,y,z,rot=0,color=0x17181c){
    box(.24,.035,.14,new THREE.MeshStandardMaterial({color,roughness:.55}),x,y,z,0,rot,0);
    plane(.13,.022,new THREE.MeshBasicMaterial({color:0xd7c5a2}),x,y+.019,z+.071,-Math.PI/2,0,0);
  }
  function gameBox(x,y,z,rot=0,color=0x67435b){
    box(.16,.27,.035,new THREE.MeshStandardMaterial({color,roughness:.72}),x,y,z,0,rot,0);
    plane(.10,.13,new THREE.MeshBasicMaterial({color:0xe1d5b0}),x,y+.015,z+.019,0,0,rot);
  }
  function controller(x,y,z,rot=0){
    const g=new THREE.Group();scene.add(g);g.position.set(x,y,z);g.rotation.y=rot;
    box(.40,.055,.22,new THREE.MeshStandardMaterial({color:0x34363b,roughness:.62}),0,0,0,0,0,0,g);
    cyl(.035,.018,new THREE.MeshStandardMaterial({color:0x16171a,roughness:.4}),-.11,.035,.02,Math.PI/2,0,0,g);
    cyl(.021,.018,new THREE.MeshStandardMaterial({color:0x9c3446,roughness:.38}),.11,.035,.04,Math.PI/2,0,0,g);
    cyl(.021,.018,new THREE.MeshStandardMaterial({color:0x365f87,roughness:.38}),.15,.035,-.01,Math.PI/2,0,0,g);
    return g;
  }

  if(typeof shelf!=='undefined'){
    for(let i=0;i<6;i++) vhs(2.30+i*.15,1.76,-3.55,(i-2)*.03,i%2?0x22262d:0x17191e);
    for(let i=0;i<5;i++) gameBox(2.30+i*.21,2.66,-3.53,(i-2)*.025,[0x456078,0x754750,0x6f6845,0x4d556d,0x805f3c][i]);
    controller(3.17,1.14,-3.46,-.14);
    box(.36,.20,.18,new THREE.MeshStandardMaterial({color:0x2a2b2d,roughness:.56}),3.16,.59,-3.50);
    plane(.15,.06,new THREE.MeshBasicMaterial({color:0xb63a3a}),3.16,.61,-3.405);
  }

  function speaker(x,y,z){
    box(.30,.50,.25,new THREE.MeshStandardMaterial({color:0x292a2d,roughness:.7}),x,y,z);
    cyl(.085,.022,new THREE.MeshStandardMaterial({color:0x18191b,roughness:.4}),x,y+.07,z+.132,Math.PI/2);
    cyl(.045,.022,new THREE.MeshStandardMaterial({color:0x202226,roughness:.4}),x,y-.11,z+.132,Math.PI/2);
  }
  speaker(-.78,1.12,-4.59); speaker(.48,1.12,-4.59);
  controller(.20,.92,-4.47,.12);
  for(let i=0;i<4;i++) vhs(.62,.91+i*.036,-4.88,i*.02,0x31343b);
  for(let i=0;i<3;i++){
    box(.17,.012,.17,new THREE.MeshStandardMaterial({color:i===0?0x314d65:0x4b4d55,roughness:.72}),-.75+i*.18,.90,-4.18,0,.06*i,0);
    plane(.09,.045,new THREE.MeshBasicMaterial({color:0xd9d3b9}),-.75+i*.18,.908,-4.09,-Math.PI/2,0,0);
  }
  cyl(.06,.18,new THREE.MeshStandardMaterial({color:0xc7b49a,roughness:.9}),.78,.97,-4.22);

  plane(.34,.09,new THREE.MeshBasicMaterial({color:0x5aa37b}),-2.72,.62,-4.34);
  plane(.30,.10,new THREE.MeshBasicMaterial({color:0x111318}),-2.72,.49,-4.34);
  for(let i=0;i<5;i++) cyl(.017,.012,new THREE.MeshStandardMaterial({color:0x8c8d8f,metalness:.6,roughness:.25}),-2.90+i*.09,.68,-4.32,Math.PI/2);
  box(.62,.085,.43,new THREE.MeshStandardMaterial({color:0x34373d,roughness:.56}),-2.72,.26,-4.55);
  box(.52,.075,.37,new THREE.MeshStandardMaterial({color:0x191a1d,roughness:.5}),-2.72,.36,-4.48);

  const ventMat=new THREE.MeshStandardMaterial({color:0x151519,roughness:.7});
  for(let i=0;i<12;i++) box(.10,.012,.02,ventMat,-.70+i*.12,.74,-.675);
  plane(.46,.065,new THREE.MeshBasicMaterial({color:0xb9aaa0}),-.43,.78,-.662);
  box(.88,.13,.48,new THREE.MeshStandardMaterial({color:0x282a2e,roughness:.55}),-.40,.40,-.69);
  plane(.38,.025,new THREE.MeshBasicMaterial({color:0x050506}),-.40,.42,-.445);
  for(let i=0;i<5;i++) vhs(.95,.51+i*.037,-.59,-.04*i,0x25272c);
  controller(.33,.57,-.55,-.1);

  for(let i=0;i<5;i++){
    box(.38,.018,.27,new THREE.MeshStandardMaterial({color:[0x385b7a,0x8c4357,0x776b39,0x4f475f,0x6a4b3b][i],roughness:.82}),-2.1+i*.36,.043,1.75+(i%2)*.13,0,(i-2)*.16,(i%2?.05:-.04));
  }
  box(.50,.055,.11,new THREE.MeshStandardMaterial({color:0xddd6c6,roughness:.8}),1.94,.055,1.62,0,.18,.03);
  for(let i=0;i<4;i++) cyl(.012,.018,new THREE.MeshStandardMaterial({color:0x3d3d3d,roughness:.5}),1.78+i*.11,.085,1.68,Math.PI/2);
  for(const [x,z,r] of [[2.45,1.43,.12],[2.73,1.34,-.08]]){
    const shoe=new THREE.Group();scene.add(shoe);shoe.position.set(x,.10,z);shoe.rotation.y=r;
    box(.30,.10,.13,new THREE.MeshStandardMaterial({color:0xcfd0cc,roughness:.95}),0,0,0,0,0,.05,shoe);
    box(.12,.12,.14,new THREE.MeshStandardMaterial({color:0x55575b,roughness:.9}),-.10,.05,0,0,0,.03,shoe);
  }

  function cable(points,color=0x151419,radius=.009){
    const curve=new THREE.CatmullRomCurve3(points.map(p=>new THREE.Vector3(...p)));
    const mesh=new THREE.Mesh(new THREE.TubeGeometry(curve,24,radius,5,false),new THREE.MeshStandardMaterial({color,roughness:.65}));
    scene.add(mesh);return mesh;
  }
  cable([[.32,.06,-.62],[.1,.035,-.2],[-.45,.03,.35],[-.75,.035,.75]],0x111116,.012);
  cable([[1.02,.06,-.55],[1.38,.03,-.15],[1.60,.03,.40],[1.30,.03,.88]],0x242026,.010);

  const bean = new THREE.Mesh(new THREE.SphereGeometry(.42,18,12),new THREE.MeshStandardMaterial({color:0x514653,roughness:1}));
  bean.scale.set(1.1,.52,.88);bean.position.set(-2.55,.23,.25);scene.add(bean);
  const cushion = new THREE.Mesh(new THREE.SphereGeometry(.28,16,10),new THREE.MeshStandardMaterial({color:0x744150,roughness:1}));
  cushion.scale.set(1.2,.32,.9);cushion.position.set(-2.46,.39,.22);scene.add(cushion);

  const clock=new THREE.Group();scene.add(clock);clock.position.set(2.93,2.92,-5.61);
  cyl(.18,.026,new THREE.MeshStandardMaterial({color:0xe1d9c9,roughness:.8}),0,0,0,Math.PI/2,0,0,clock);
  cyl(.015,.028,new THREE.MeshBasicMaterial({color:0x222}),0,0,.018,Math.PI/2,0,0,clock);
  box(.012,.11,.012,new THREE.MeshBasicMaterial({color:0x282828}),0,.04,.025,0,0,.25,clock);
  box(.012,.08,.012,new THREE.MeshBasicMaterial({color:0x282828}),.03,-.01,.025,0,0,1.18,clock);

  const signTex=canvasTexture(620,150,(g,w,h)=>{
    g.clearRect(0,0,w,h);g.font='italic 700 64px Arial';g.textAlign='center';g.textBaseline='middle';
    g.shadowColor='#6fd8ff';g.shadowBlur=22;g.strokeStyle='#8ce4ff';g.lineWidth=3;g.strokeText("L'électron libre",w/2,h/2);
    g.fillStyle='#d9f6ff';g.fillText("L'électron libre",w/2,h/2);
  });
  plane(1.35,.33,new THREE.MeshBasicMaterial({map:signTex,transparent:true,opacity:.78,blending:THREE.AdditiveBlending,depthWrite:false}),.25,3.27,-5.60);
  const signLight=new THREE.PointLight(0x64c8ff,2.2,2.1,2);signLight.position.set(.25,3.10,-5.25);scene.add(signLight);

  function contactShadow(x,z,sx,sz,opacity=.18){
    const tex=canvasTexture(128,128,(g,w,h)=>{
      const grd=g.createRadialGradient(w/2,h/2,2,w/2,h/2,w/2);
      grd.addColorStop(0,`rgba(0,0,0,${opacity})`);grd.addColorStop(1,'rgba(0,0,0,0)');
      g.fillStyle=grd;g.fillRect(0,0,w,h);
    });
    plane(sx,sz,new THREE.MeshBasicMaterial({map:tex,transparent:true,depthWrite:false}),x,.012,z,-Math.PI/2,0,0);
  }
  contactShadow(.35,-1.12,3.0,1.3,.28);
  contactShadow(-2.45,-3.25,1.9,3.2,.20);
  contactShadow(2.80,-4.00,1.9,1.15,.22);
  contactShadow(-.12,-4.72,2.4,1.25,.18);

  if(typeof lampLight!=='undefined'){lampLight.intensity=6.5;lampLight.color.set(0xff9b78);}
  if(typeof deskLamp!=='undefined'){deskLamp.intensity=5.2;deskLamp.color.set(0xffd09a);}
})();
