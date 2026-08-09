const screenLocalCorners=[new THREE.Vector3(-1.09,.71,.53),new THREE.Vector3(1.09,.71,.53),new THREE.Vector3(-1.09,-.71,.53),new THREE.Vector3(1.09,-.71,.53)];
function updateCrtOverlay(){
  const pts=screenLocalCorners.map(v=>v.clone().add(new THREE.Vector3(tvX-.08,tvY+.05,tvZ)).project(camera));
  const xs=pts.map(p=>(p.x*.5+.5)*innerWidth),ys=pts.map(p=>(-.5*p.y+.5)*innerHeight);
  const left=Math.min(...xs),right=Math.max(...xs),top=Math.min(...ys),bottom=Math.max(...ys);
  crtScreen.style.left=left+'px';crtScreen.style.top=top+'px';crtScreen.style.width=(right-left)+'px';crtScreen.style.height=(bottom-top)+'px';crtScreen.style.display='block';
}
function resize(){
  const w=innerWidth,h=innerHeight;camera.aspect=w/h;
  if(h>w){camera.position.set(.08,1.83,6.25);camera.fov=54;cameraTarget.set(.05,1.52,-1.85);}else{camera.position.set(.12,1.76,5.15);camera.fov=49;cameraTarget.set(.05,1.48,-2.15);}
  camera.updateProjectionMatrix();camera.lookAt(cameraTarget);renderer.setSize(w,h,false);renderer.setPixelRatio(Math.min(devicePixelRatio||1,1.35));updateCrtOverlay();
}
window.addEventListener('resize',resize,{passive:true});resize();
let lastRender=0;
function animate(t){requestAnimationFrame(animate);if(t-lastRender<33)return;lastRender=t;fan.rotation.y+=.07;bulbs.forEach((b,i)=>b.scale.setScalar(.94+Math.sin(t*.002+i)*.07));renderer.render(scene,camera);updateCrtOverlay();}
requestAnimationFrame(animate);
