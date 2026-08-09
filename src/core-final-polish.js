/* Final visual pass: details only, no emulator changes. */
(() => {
  if (!window.THREE || typeof scene === 'undefined') return;
  try {
    renderer.toneMappingExposure = 1.07;
    const starMat = new THREE.MeshBasicMaterial({color:0xcbd8ed});
    for(let i=0;i<36;i++){
      const s=new THREE.Mesh(new THREE.SphereGeometry(.008+Math.random()*.009,7,7),starMat);
      s.position.set(-1.26+Math.random()*1.42,1.48+Math.random()*1.32,-5.63);scene.add(s);
    }
    const windowGlow=new THREE.PointLight(0x8ca6bf,2.0,2.7,2);windowGlow.position.set(-.55,2.12,-5.1);scene.add(windowGlow);
    const shelfGlow=new THREE.PointLight(0xffd7a0,2.4,2.15,2);shelfGlow.position.set(2.8,1.65,-3.25);scene.add(shelfGlow);
    const floorBounce=new THREE.PointLight(0xffbd8c,1.8,2.6,2);floorBounce.position.set(.45,.32,-.85);scene.add(floorBounce);
    box(.42,.021,.30,new THREE.MeshStandardMaterial({color:0x456482,roughness:.82}),-1.88,.045,1.58,0,.16,.05);
    box(.37,.021,.27,new THREE.MeshStandardMaterial({color:0x8a4a59,roughness:.82}),-1.54,.048,1.48,0,-.15,-.04);
    box(.12,.48,.12,new THREE.MeshStandardMaterial({color:0x72513c,roughness:.88}),3.18,.25,-1.90);
    box(.18,.22,.17,new THREE.MeshStandardMaterial({color:0x303239,roughness:.62}),3.18,.59,-1.90);
    plane(.12,.055,new THREE.MeshBasicMaterial({color:0xa8c7dc}),3.18,.61,-1.81);
    const curve=new THREE.CatmullRomCurve3([new THREE.Vector3(.92,.42,-.72),new THREE.Vector3(1.08,.20,-.52),new THREE.Vector3(1.16,.035,-.18),new THREE.Vector3(.86,.025,.22)]);
    scene.add(new THREE.Mesh(new THREE.TubeGeometry(curve,18,.009,5,false),new THREE.MeshStandardMaterial({color:0x151418,roughness:.7})));
  }catch(_){}
})();