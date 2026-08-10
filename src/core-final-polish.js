/* Final visual pass: details only, no emulator changes. */
(() => {
  if (!window.THREE || typeof scene === 'undefined') return;
  try {
    renderer.toneMappingExposure = 1.08;

    const starMat = new THREE.MeshBasicMaterial({color:0xcbd8ed});
    for(let i=0;i<36;i++){
      const s=new THREE.Mesh(new THREE.SphereGeometry(.008+Math.random()*.009,7,7),starMat);
      s.position.set(-1.26+Math.random()*1.42,1.48+Math.random()*1.32,-5.63);scene.add(s);
    }

    const windowGlow=new THREE.PointLight(0x8ca6bf,1.8,2.7,2);windowGlow.position.set(-.55,2.12,-5.1);scene.add(windowGlow);
    const shelfGlow=new THREE.PointLight(0xffd7a0,2.5,2.15,2);shelfGlow.position.set(2.8,1.65,-3.25);scene.add(shelfGlow);
    const floorBounce=new THREE.PointLight(0xffbd8c,1.8,2.6,2);floorBounce.position.set(.45,.32,-.85);scene.add(floorBounce);
    const crtBounce=new THREE.PointLight(0x79d9b0,1.1,1.8,2);crtBounce.position.set(.35,1.45,-.78);scene.add(crtBounce);

    // Magazines / floor life.
    box(.42,.021,.30,new THREE.MeshStandardMaterial({color:0x456482,roughness:.82}),-1.88,.045,1.58,0,.16,.05);
    box(.37,.021,.27,new THREE.MeshStandardMaterial({color:0x8a4a59,roughness:.82}),-1.54,.048,1.48,0,-.15,-.04);
    box(.33,.018,.24,new THREE.MeshStandardMaterial({color:0x766a43,roughness:.86}),1.62,.038,1.38,0,.24,-.03);

    // Small floor lamp / electronics detail.
    box(.12,.48,.12,new THREE.MeshStandardMaterial({color:0x72513c,roughness:.88}),3.18,.25,-1.90);
    box(.18,.22,.17,new THREE.MeshStandardMaterial({color:0x303239,roughness:.62}),3.18,.59,-1.90);
    plane(.12,.055,new THREE.MeshBasicMaterial({color:0xa8c7dc}),3.18,.61,-1.81);

    // Loose controller/power cable.
    const curve=new THREE.CatmullRomCurve3([
      new THREE.Vector3(.92,.42,-.72),new THREE.Vector3(1.08,.20,-.52),
      new THREE.Vector3(1.16,.035,-.18),new THREE.Vector3(.86,.025,.22)
    ]);
    scene.add(new THREE.Mesh(new THREE.TubeGeometry(curve,18,.009,5,false),new THREE.MeshStandardMaterial({color:0x151418,roughness:.7})));

    // Beanbag to make the room feel occupied rather than staged.
    const bean=new THREE.Mesh(
      new THREE.SphereGeometry(.42,18,12),
      new THREE.MeshStandardMaterial({color:0x6b3f52,roughness:.96})
    );
    bean.scale.set(1.05,.62,.92);bean.position.set(-2.55,.28,.62);bean.rotation.z=-.12;scene.add(bean);

    // Rug under the gaming zone.
    const rug=new THREE.Mesh(
      new THREE.BoxGeometry(2.5,.018,1.55),
      new THREE.MeshStandardMaterial({color:0x353343,roughness:.98})
    );
    rug.position.set(.20,.014,.72);rug.rotation.y=-.03;scene.add(rug);
    for(let i=-3;i<=3;i++){
      const stripe=new THREE.Mesh(new THREE.BoxGeometry(.018,.021,1.48),new THREE.MeshStandardMaterial({color:i%2?0x5c4350:0x4e5360,roughness:.96}));
      stripe.position.set(.20+i*.28,.027,.72);stripe.rotation.y=-.03;scene.add(stripe);
    }

    // Generic VHS / jewel cases on the right shelf.
    const caseColors=[0x476183,0x8b4a54,0x6f6a43,0x4b7567,0x6e4d77,0x8a6b44];
    for(let i=0;i<12;i++){
      box(.055,.24,.16,new THREE.MeshStandardMaterial({color:caseColors[i%caseColors.length],roughness:.82}),2.47+(i%6)*.072,1.04+Math.floor(i/6)*.29,-4.28,0,0,(i%3-1)*.035);
    }

    // Fake contact shadows: cheap visually, no real-time shadow map cost.
    const shadowMat=new THREE.MeshBasicMaterial({color:0x000000,transparent:true,opacity:.18,depthWrite:false});
    const shadowGeo=new THREE.CircleGeometry(.5,24);
    const sh1=new THREE.Mesh(shadowGeo,shadowMat);sh1.scale.set(1.7,.65,1);sh1.rotation.x=-Math.PI/2;sh1.position.set(-2.55,.018,.62);scene.add(sh1);
    const sh2=new THREE.Mesh(shadowGeo,shadowMat.clone());sh2.scale.set(1.35,.42,1);sh2.rotation.x=-Math.PI/2;sh2.position.set(.42,.018,-.85);scene.add(sh2);

    // Tiny LED accents, subtle rather than cyberpunk.
    const ledMat=new THREE.MeshBasicMaterial({color:0x7bffb0});
    for(let i=0;i<3;i++){
      const led=new THREE.Mesh(new THREE.SphereGeometry(.012,8,8),ledMat);
      led.position.set(.67+i*.055,1.10,-1.00);scene.add(led);
    }
  }catch(_){}
})();