/* =========================
   VRAIE PIÈCE THREE.JS 3D
   ========================= */
if(!window.THREE){
  threeError.style.display='flex';
  throw new Error('Three.js unavailable');
}

const scene = new THREE.Scene();
scene.background = new THREE.Color(0x090711);
scene.fog = new THREE.Fog(0x090711, 8.5, 18);

const camera = new THREE.PerspectiveCamera(50, innerWidth/innerHeight, .05, 60);
camera.position.set(0.12, 1.78, 5.35);
const cameraTarget = new THREE.Vector3(0.05,1.48,-2.15);
camera.lookAt(cameraTarget);

const renderer = new THREE.WebGLRenderer({canvas,antialias:true,powerPreference:'high-performance'});
renderer.setPixelRatio(Math.min(devicePixelRatio||1,1.35));
renderer.setSize(innerWidth,innerHeight,false);
renderer.outputColorSpace = THREE.SRGBColorSpace;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.03;
renderer.shadowMap.enabled = false;

const hemi = new THREE.HemisphereLight(0xa9b9ff,0x2d1620,1.05); scene.add(hemi);
const warm = new THREE.PointLight(0xffa45d,23,7,2); warm.position.set(-2.8,2.3,-2.4); scene.add(warm);
const pink = new THREE.PointLight(0xff3d82,18,6,2); pink.position.set(2.7,1.3,-2.7); scene.add(pink);
const blue = new THREE.PointLight(0x4e8fff,14,5,2); blue.position.set(.1,2.4,-5.2); scene.add(blue);

const mats = {
  wall:new THREE.MeshStandardMaterial({color:0x453448,roughness:.94}),
  wall2:new THREE.MeshStandardMaterial({color:0x302533,roughness:.95}),
  floor:new THREE.MeshStandardMaterial({color:0x332934,roughness:1}),
  wood:new THREE.MeshStandardMaterial({color:0x6d4936,roughness:.8}),
  darkWood:new THREE.MeshStandardMaterial({color:0x34231f,roughness:.9}),
  black:new THREE.MeshStandardMaterial({color:0x101014,roughness:.5,metalness:.12}),
  metal:new THREE.MeshStandardMaterial({color:0x44454e,roughness:.5,metalness:.55}),
  cream:new THREE.MeshStandardMaterial({color:0xb3a38c,roughness:.92}),
  mattress:new THREE.MeshStandardMaterial({color:0x56697a,roughness:1}),
  blanket:new THREE.MeshStandardMaterial({color:0x35363e,roughness:1}),
  red:new THREE.MeshStandardMaterial({color:0x7f273e,roughness:.7}),
  glass:new THREE.MeshStandardMaterial({color:0x08140f,roughness:.18,metalness:.05,emissive:0x02140b,emissiveIntensity:.35})
};
function box(w,h,d,mat,x,y,z,rx=0,ry=0,rz=0,parent=scene){const m=new THREE.Mesh(new THREE.BoxGeometry(w,h,d),mat);m.position.set(x,y,z);m.rotation.set(rx,ry,rz);parent.add(m);return m;}
function cyl(r,h,mat,x,y,z,rx=0,ry=0,rz=0,parent=scene){const m=new THREE.Mesh(new THREE.CylinderGeometry(r,r,h,20),mat);m.position.set(x,y,z);m.rotation.set(rx,ry,rz);parent.add(m);return m;}
function plane(w,h,mat,x,y,z,rx=0,ry=0,rz=0,parent=scene){const m=new THREE.Mesh(new THREE.PlaneGeometry(w,h),mat);m.position.set(x,y,z);m.rotation.set(rx,ry,rz);parent.add(m);return m;}
function textTexture(lines,bg='#11121b',fg='#e8d98c',accent='#ff4c7d'){
  const c=document.createElement('canvas');c.width=512;c.height=700;const x=c.getContext('2d');
  const g=x.createLinearGradient(0,0,512,700);g.addColorStop(0,bg);g.addColorStop(1,'#08090e');x.fillStyle=g;x.fillRect(0,0,512,700);
  x.globalAlpha=.18;x.strokeStyle=accent;x.lineWidth=18;for(let i=-300;i<800;i+=90){x.beginPath();x.moveTo(0,i);x.lineTo(512,i+260);x.stroke()}x.globalAlpha=1;
  x.fillStyle=fg;x.textAlign='center';x.font='900 64px Arial Black,Arial';lines.forEach((t,i)=>x.fillText(t,256,250+i*82));
  x.fillStyle=accent;x.fillRect(92,445,328,10);x.font='700 23px monospace';x.fillText('VIDEO • MUSIC • GAMES',256,505);
  const tex=new THREE.CanvasTexture(c);tex.colorSpace=THREE.SRGBColorSpace;return tex;
}
function poster(lines,w,h,x,y,z,ry=0,bg='#11121b',fg='#f2e7c0',accent='#ff4d83'){box(w+.08,h+.08,.045,mats.black,x,y,z-.015,0,ry,0);const mat=new THREE.MeshBasicMaterial({map:textTexture(lines,bg,fg,accent)});plane(w,h,mat,x,y,z,0,ry,0);}
function randomColorMat(i){const colors=[0xa54455,0x385f7d,0x9c7b37,0x57466e,0x315a4c,0x8d4e32,0xb8a868];return new THREE.MeshStandardMaterial({color:colors[i%colors.length],roughness:.85});}

box(7.8,.12,11.5,mats.floor,0,-.06,-.2);
box(7.8,3.8,.12,mats.wall,0,1.85,-5.75);
box(.12,3.8,11.5,mats.wall2,-3.84,1.85,-.2);
box(.12,3.8,11.5,mats.wall2,3.84,1.85,-.2);
box(7.8,.08,11.5,new THREE.MeshStandardMaterial({color:0x29212d,roughness:1}),0,3.73,-.2);
box(5.5,.025,3.8,new THREE.MeshStandardMaterial({color:0x221722,roughness:1}),.15,.02,1.35);

const nightMat=new THREE.MeshBasicMaterial({color:0x1b5d80});
plane(1.68,1.58,nightMat,-.55,2.15,-5.67);
box(1.92,.10,.10,mats.cream,-.55,2.97,-5.58);box(1.92,.10,.10,mats.cream,-.55,1.34,-5.58);
box(.10,1.72,.10,mats.cream,-1.47,2.15,-5.58);box(.10,1.72,.10,mats.cream,.37,2.15,-5.58);
box(.07,1.58,.08,mats.cream,-.55,2.15,-5.55);box(1.68,.07,.08,mats.cream,-.55,2.15,-5.55);
for(let i=0;i<10;i++) box(1.64,.035,.025,new THREE.MeshStandardMaterial({color:0x78899a,roughness:.8}),-.55,2.84-i*.14,-5.49);

const bed=new THREE.Group();scene.add(bed);const bedX=-2.45,bedZ=-3.25;
[[-3.15,-4.6],[-1.72,-4.6],[-3.15,-1.9],[-1.72,-1.9]].forEach(([x,z])=>box(.11,3.15,.11,mats.metal,x,1.55,z,0,0,0,bed));
box(1.55,.12,2.85,mats.metal,bedX,.83,bedZ,0,0,0,bed);box(1.55,.12,2.85,mats.metal,bedX,2.40,bedZ,0,0,0,bed);
box(1.43,.18,2.66,mats.mattress,bedX,.96,bedZ,0,0,0,bed);box(1.43,.18,2.66,mats.mattress,bedX,2.53,bedZ,0,0,0,bed);
box(1.30,.13,1.65,mats.blanket,bedX,1.10,bedZ+.38,0,0,.02,bed);box(1.32,.14,1.48,mats.red,bedX,2.67,bedZ+.34,0,0,.03,bed);
box(.43,.15,.62,mats.cream,-2.72,1.13,bedZ-1.0,0,0,0,bed);box(.43,.15,.62,mats.cream,-2.72,2.70,bedZ-1.0,0,0,0,bed);
for(let i=0;i<5;i++) box(.72,.06,.06,mats.metal,-1.58,.68+i*.48,-2.15,0,0,-.02,bed);
box(.07,2.45,.07,mats.metal,-1.92,1.55,-2.15,0,0,-.10,bed);box(.07,2.45,.07,mats.metal,-1.26,1.55,-2.15,0,0,-.10,bed);

box(2.05,.11,.82,mats.wood,-.12,.84,-4.72);box(.10,.82,.10,mats.darkWood,-1.02,.42,-4.95);box(.10,.82,.10,mats.darkWood,.78,.42,-4.95);
box(.74,.62,.57,mats.black,-.15,1.26,-4.68);box(.59,.42,.025,new THREE.MeshBasicMaterial({color:0x102b3f}),-.15,1.29,-4.38);
box(.75,.06,.40,mats.black,-.15,.92,-4.15);box(.42,.48,.48,new THREE.MeshStandardMaterial({color:0x8c826f,roughness:.9}),.75,1.10,-4.62);
box(.76,.10,.75,mats.darkWood,.03,.48,-3.77);box(.08,.68,.08,mats.darkWood,-.28,.16,-3.95);box(.08,.68,.08,mats.darkWood,.32,.16,-3.95);box(.78,.74,.10,mats.darkWood,.03,.91,-4.09,-.08,0,0);
