/* ---------- seeker AI ---------- */
const spots=[[-4,-1],[-3,-4],[0,-3],[4,-2.5],[5,1],[4,4],[-1,3.5],[-5,3],[0,0],[-5,-1]];
let tgt=null,wait=0,look=0,sAcc=0,seen=0,stuck=0,alertCd=0;
function freeSpot(cx,cz,rx,rz){for(let i=0;i<40;i++){const x=Math.max(-RX+1.5,Math.min(GX-1.5,cx+(Math.random()-.5)*2*rx)),z=Math.max(-RZ+1.5,Math.min(RZ-1.5,cz+(Math.random()-.5)*2*rz));if(!hit(x,z))return{x,z}}return{x:P0.x,z:P0.z}}
let path=[];
function newTarget(){
  let dest;
  const tl=taskSpots();if(tl.length&&Math.random()<.2){const q=tl[Math.random()*tl.length|0];dest={x:q[0]+(Math.random()-.5)*2,z:q[1]+(Math.random()-.5)*2};if(hit(dest.x,dest.z))dest={x:q[0],z:q[1]}}else if(Math.random()<.6){for(let i=0;i<8;i++){dest=freeSpot(P.position.x,P.position.z,3.5,3.5);if(roomOf(dest.x,dest.z)===roomOf(P.position.x,P.position.z))break}}
  else{const k=Object.keys(ROOMR),r=ROOMR[k[Math.random()*k.length|0]];dest=freeSpot((r[0]+r[1])/2,(r[2]+r[3])/2,(r[1]-r[0])/2-1.5,(r[3]-r[2])/2-1.5)}
  path=route(roomOf(S.position.x,S.position.z),roomOf(dest.x,dest.z));path.push(dest);tgt=path[0];
}
function seekerUpdate(dt){
  if(phase!=='seek')return;
  if(wait>0){wait-=dt;look+=dt;S.rotation.y+=Math.sin(look*3)*dt*2.4}
  else{const dx=tgt.x-S.position.x,dz=tgt.z-S.position.z,d=Math.hypot(dx,dz);
    if(d<.5){path.shift();if(path.length)tgt=path[0];else{wait=.5;look=0;newTarget()}}
    else{let a=Math.atan2(dx,dz)-S.rotation.y;a=Math.atan2(Math.sin(a),Math.cos(a));S.rotation.y+=a*Math.min(1,dt*8);const nx=S.position.x+dx/d*4.6*dt,nz2=S.position.z+dz/d*4.6*dt;let mvd=false;if(!hit(nx,S.position.z)){S.position.x=nx;mvd=true}if(!hit(S.position.x,nz2)){S.position.z=nz2;mvd=true}stuck=mvd?0:stuck+dt;if(stuck>.6){stuck=0;newTarget()}}}
  sAcc+=dt;if(sAcc<.3)return;const step=sAcc;sAcc=0;alertCd-=step;
  const vx=P.position.x-S.position.x,vz=P.position.z-S.position.z,d=Math.hypot(vx,vz),fw=[Math.sin(S.rotation.y),Math.cos(S.rotation.y)];
  let gain=-.3;
  if(d<14&&(vx*fw[0]+vz*fw[1])/Math.max(d,.01)>.5){
    const eye=new THREE.Vector3(S.position.x,2.1,S.position.z),to=new THREE.Vector3(P.position.x,1.3,P.position.z);
    ray.set(eye,to.clone().sub(eye).normalize());ray.far=d;const blocked=ray.intersectObjects(occl)[0];ray.far=Infinity;
    if(!blocked){if(alertCd<=0&&d<10){alertCd=4;Snd.alert()}sc.position.copy(eye);sc.lookAt(to);sc.updateMatrixWorld();const e=exposure(sc),near=1-d/14;
      if(e.area>4){gain=((e.score-.07)*7+(moving?1.5:0)+(d<2?.8:0))*near;seen=e.score}}
  }
  sus=Math.max(0,Math.min(1.05,sus+gain*step));
  if(sus>=1)finish(false);
}