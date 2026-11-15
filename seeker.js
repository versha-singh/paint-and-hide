/* ---------- seeker ---------- */
const S=new THREE.Group();scene.add(S);S.visible=false;
const sm=(w,h,d,x,y,c)=>{const m=new THREE.Mesh(new THREE.BoxGeometry(w,h,d),flat(c));m.position.set(x,y,0);m.castShadow=true;S.add(m);return m};
sm(.8,.95,.4,0,1.275,0xff7a1a);sm(.7,.7,.7,0,2.1,0x2a2a2a);sm(.36,.9,.4,-.58,1.25,0xff7a1a);sm(.36,.9,.4,.58,1.25,0xff7a1a);{const gem=new THREE.Mesh(new THREE.OctahedronGeometry(.22),glow(0xff3020));gem.position.y=3;S.add(gem)}sm(.38,.8,.4,-.2,.4,0x1e1e1e);sm(.38,.8,.4,.2,.4,0x1e1e1e);
for(const x of[-.18,.18]){const e=new THREE.Mesh(new THREE.BoxGeometry(.14,.1,.05),glow(0xff3020));e.position.set(x,2.15,.36);S.add(e)}
const torch=new THREE.SpotLight(0xfff0c0,1.4,14,.55,.5);torch.position.set(0,2,.3);torch.target.position.set(0,1.2,5);S.add(torch,torch.target);
const sc=new THREE.PerspectiveCamera(70,1,.1,30);

/* ---------- how visible are you? render with and without the player, compare ---------- */
const N=72,RT=new THREE.WebGLRenderTarget(N,N),bA=new Uint8Array(N*N*4),bB=new Uint8Array(N*N*4);
function exposure(c){P.visible=true;
  renderer.setRenderTarget(RT);renderer.render(scene,c);renderer.readRenderTargetPixels(RT,0,0,N,N,bA);
  P.visible=false;renderer.render(scene,c);renderer.readRenderTargetPixels(RT,0,0,N,N,bB);P.visible=true;
  renderer.setRenderTarget(null);
  let sum=0,n=0;
  for(let i=0;i<bA.length;i+=4){const d=Math.abs(bA[i]-bB[i])+Math.abs(bA[i+1]-bB[i+1])+Math.abs(bA[i+2]-bB[i+2]);if(d>0){sum+=d/765;n++}}
  return{score:n?sum/n:0,area:n};
}

const mc=new THREE.PerspectiveCamera(60,1,.1,40);
function meterCam(){let best=null,bd=-1;const o=new THREE.Vector3(P.position.x,1.4,P.position.z);
  for(let k=0;k<8;k++){const a=k*Math.PI/4+Math.PI/8,dv=new THREE.Vector3(Math.sin(a),.25,Math.cos(a)).normalize(),d=boom(o,dv,4);if(d>bd){bd=d;best=dv}}
  mc.position.copy(o).addScaledVector(best,bd);mc.lookAt(P.position.x,1.3,P.position.z);mc.updateMatrixWorld();return mc}