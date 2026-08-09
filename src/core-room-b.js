// Étagères droites chargées de jeux / VHS / CD.
const shelf=new THREE.Group();scene.add(shelf);
box(1.55,3.1,.40,mats.darkWood,2.80,1.55,-4.06,0,0,0,shelf);
box(1.36,2.86,.32,new THREE.MeshStandardMaterial({color:0x2b2021,roughness:1}),2.80,1.55,-3.82,0,0,0,shelf);
for(let y=.38;y<2.95;y+=.52) box(1.48,.08,.43,mats.wood,2.80,y,-3.82,0,0,0,shelf);
for(let row=0;row<5;row++){for(let i=0;i<9;i++){const w=.105+(i%3)*.012;box(w,.33,.18,randomColorMat(row*9+i),2.23+i*.14,.58+row*.52,-3.55,0,0,(i%2?-.025:.018),shelf);}}
box(.82,1.72,.38,mats.darkWood,-3.25,.86,-1.40);for(let y=.28;y<1.62;y+=.43) box(.75,.07,.42,mats.wood,-3.25,y,-1.38);
for(let row=0;row<3;row++) for(let i=0;i<5;i++) box(.105,.29,.18,randomColorMat(i+row*4),-3.54+i*.14,.48+row*.43,-1.13);
poster(['NIGHT','DRIVE'],.68,1.02,-2.95,2.67,-5.66,0,'#131523','#e7d6a9','#ee5c70');
poster(['GALAXY'],.62,.92,1.30,2.73,-5.66,0,'#082238','#ddf2ff','#36b9ff');
poster(['RACING'],.72,1.06,2.35,2.67,-5.66,0,'#1a1214','#f0d6ba','#d4493c');
poster(['ARCADE'],.70,1.0,3.70,2.28,-3.0,-Math.PI/2,'#151428','#f2d6ff','#ad4cff');
const bulbColors=[0xff495b,0xffbc44,0x5bdbff,0xf958aa,0x74ff9b,0xffc64c];
const bulbs=[];
for(let i=0;i<10;i++){const x=-3.1+i*.69;const y=3.33-Math.sin((i/9)*Math.PI)*.28;const mat=new THREE.MeshBasicMaterial({color:bulbColors[i%bulbColors.length]});const b=new THREE.Mesh(new THREE.SphereGeometry(.055,10,8),mat);b.position.set(x,y,-5.56);scene.add(b);bulbs.push(b);}
box(6.5,.018,.018,new THREE.MeshBasicMaterial({color:0x17131a}),0,3.22,-5.58,0,0,-.01);
cyl(.18,.12,mats.metal,2.0,.08,-1.5);cyl(.035,1.65,mats.metal,2.0,.86,-1.5);
const lampShade=new THREE.Mesh(new THREE.ConeGeometry(.31,.52,20,1,true),new THREE.MeshStandardMaterial({color:0xe86b75,roughness:.7,emissive:0x7a1e31,emissiveIntensity:.45}));lampShade.position.set(2,1.73,-1.5);scene.add(lampShade);
const lampLight=new THREE.PointLight(0xff5b85,13,4.5,2);lampLight.position.set(2,1.65,-1.45);scene.add(lampLight);
box(1.25,.48,.40,mats.black,-2.7,.56,-4.55);box(.44,.35,.42,mats.black,-3.25,.55,-4.55);box(.44,.35,.42,mats.black,-2.15,.55,-4.55);
for(const x of [-3.25,-2.15]) cyl(.14,.02,new THREE.MeshStandardMaterial({color:0x222228,metalness:.2,roughness:.4}),x,.55,-4.32,Math.PI/2,0,0);
const tv=new THREE.Group();scene.add(tv);const tvX=.35,tvY=1.55,tvZ=-1.15;
box(2.72,1.92,.88,mats.black,tvX,tvY,tvZ,0,0,0,tv);
box(2.48,1.66,.055,new THREE.MeshStandardMaterial({color:0x27262d,roughness:.48}),tvX,tvY,tvZ+.468,0,0,0,tv);
const screenAnchor=box(2.18,1.42,.03,mats.glass,tvX-.08,tvY+.05,tvZ+.505,0,0,0,tv);
for(let i=0;i<4;i++) cyl(.055,.035,new THREE.MeshStandardMaterial({color:i===3?0x3ddf88:0x25252b,emissive:i===3?0x15a34e:0x000000,emissiveIntensity:.8}),1.22+i*.17,.80,-.66,Math.PI/2,0,0,tv);
box(2.72,.18,.78,mats.darkWood,tvX,.47,tvZ);box(2.55,.72,.68,mats.wood,tvX,.03,tvZ);box(.20,.77,.20,mats.darkWood,-.68,-.35,tvZ);box(.20,.77,.20,mats.darkWood,1.38,-.35,tvZ);
box(1.10,.18,.54,new THREE.MeshStandardMaterial({color:0x3b3d45,metalness:.12,roughness:.5}),tvX,.58,-.68);box(.62,.035,.03,mats.black,tvX,.61,-.38);cyl(.028,.02,new THREE.MeshBasicMaterial({color:0xff3d59}),.76,.58,-.38,Math.PI/2);
for(let i=0;i<7;i++) box(.42,.055,.58,randomColorMat(i),-1.5+i*.52,.055,1.04+(i%2)*.18,0,(i-3)*.09,(i%2?-.05:.04));
for(let i=0;i<3;i++) cyl(.16,.012,new THREE.MeshStandardMaterial({color:0xb7bfca,metalness:.7,roughness:.18}),1.0+i*.38,.05,.68+i*.16,Math.PI/2,0,0);
cyl(.07,.30,new THREE.MeshStandardMaterial({color:0xa33042,metalness:.45,roughness:.34}),2.85,.15,.65);
box(.72,.45,.68,new THREE.MeshStandardMaterial({color:0x90704f,roughness:1}),3.12,.23,-.25,0,.08,.02);box(.60,.35,.58,new THREE.MeshStandardMaterial({color:0x7c5d42,roughness:1}),2.70,.18,.25,0,-.12,-.03);
const fan=new THREE.Group();fan.position.set(.25,3.50,-1.05);scene.add(fan);cyl(.14,.24,mats.metal,0,0,0,0,0,0,fan);
for(let i=0;i<4;i++){const blade=box(1.15,.035,.18,new THREE.MeshStandardMaterial({color:0x8b7966,roughness:.8}),0,0,0,0,i*Math.PI/2,0,fan);blade.geometry.translate(.52,0,0);}
const deskLamp=new THREE.PointLight(0xffd29d,7,2.3,2);deskLamp.position.set(-.9,1.45,-4.2);scene.add(deskLamp);
box(.14,2.65,.18,mats.darkWood,3.66,1.33,1.25);box(.14,2.65,.18,mats.darkWood,3.66,1.33,3.0);box(.14,1.85,.18,mats.darkWood,3.66,2.65,2.12,0,0,Math.PI/2);
