/* ---------- player: a blank, paintable blocky body ---------- */
const P=new THREE.Group();scene.add(P);P.position.set(0,0,3.8);
const parts={};
function part(n,w,h,d,x,y,top){
  const cvs=[],mats=[];
  for(let i=0;i<6;i++){const c=document.createElement('canvas');c.width=c.height=16;const t=c.getContext('2d');t.fillStyle='#f4f4f4';t.fillRect(0,0,16,16);
    const tx=new THREE.CanvasTexture(c);tx.magFilter=tx.minFilter=THREE.NearestFilter;cvs.push({c,t,tx});mats.push(new THREE.MeshPhongMaterial({map:tx,shininess:0,specular:0x000000}))}
  const g=new THREE.BoxGeometry(w,h,d);if(top)g.translate(0,-h/2,0);
  const m=new THREE.Mesh(g,mats);m.userData.cvs=cvs;const pv=new THREE.Group();pv.position.set(x,y,0);pv.add(m);P.add(pv);parts[n]={m,pv,cvs};
}
part('head',.7,.7,.7,0,2.1);part('torso',.8,.95,.4,0,1.275);
part('legL',.38,.8,.4,-.2,.8,1);part('legR',.38,.8,.4,.2,.8,1);
part('armL',.36,.95,.4,-.58,1.7,1);part('armR',.36,.95,.4,.58,1.7,1);
const pmeshes=Object.values(parts).map(p=>p.m);
let pose=0,walk=0,moving=false;
function applyPose(){
  const{armL,armR,legL,legR}=parts;[armL,armR,legL,legR].forEach(p=>p.pv.rotation.set(0,0,0));P.scale.set(1,1,1);
  if(pose===1)P.scale.set(1,.7,1);
  if(pose===2){armL.pv.rotation.z=-1.57;armR.pv.rotation.z=1.57}
  if(pose===3){legL.pv.rotation.x=legR.pv.rotation.x=-1.5;P.scale.set(1,.85,1)}
}

/* ---------- spawn effect ---------- */
let pname='Chameleon',introT=0;const INTRO=4.2;
const FXG=new THREE.Group();FXG.visible=false;scene.add(FXG);
const addM=c=>new THREE.MeshBasicMaterial({color:c,transparent:true,opacity:0,depthWrite:false,blending:THREE.AdditiveBlending,side:THREE.DoubleSide});
const beam=new THREE.Mesh(new THREE.CylinderGeometry(.9,.9,10,24,1,true),addM(0x9aff66));beam.position.y=5;
const ring1=new THREE.Mesh(new THREE.RingGeometry(.7,1,40),addM(0x7bbf3f)),ring2=new THREE.Mesh(new THREE.RingGeometry(.7,1,40),addM(0xffffff));
[ring1,ring2].forEach(r=>{r.rotation.x=-Math.PI/2;r.position.y=.05});
const glowL=new THREE.PointLight(0x9aff66,0,12);glowL.position.y=1.5;
const sparks=[...Array(48)].map(()=>{const m=new THREE.Mesh(new THREE.BoxGeometry(.12,.12,.12),addM(0xdaffb0));m.userData={life:0,max:1,v:2};m.visible=false;FXG.add(m);return m});
FXG.add(beam,ring1,ring2,glowL);
function updateIntro(k,dt){
  const e=k*k*(3-2*k);yaw=Math.PI*(1-e);pitch=.2-.15*e;dist=4.6-1.0*e;
  const m=Math.max(0,Math.min(1,(k-.2)/.4)),c1=1.70158,f=1+(c1+1)*Math.pow(m-1,3)+c1*Math.pow(m-1,2);
  P.scale.set(1,Math.max(.001,f),1);pmeshes.forEach(o=>o.material.forEach(q=>{q.transparent=m<1;q.opacity=m}));
  FXG.position.set(P.position.x,0,P.position.z);
  const bo=k<.1?k*10:k<.7?1:Math.max(0,1-(k-.7)/.3);
  beam.material.opacity=.45*bo;beam.scale.set(1+.12*Math.sin(k*50),1,1+.12*Math.sin(k*50));
  const p1=(k*1.6)%1,p2=(k*1.6+.5)%1;ring1.scale.setScalar(1+p1*3.5);ring1.material.opacity=.9*(1-p1)*bo;ring2.scale.setScalar(1+p2*3.5);ring2.material.opacity=.7*(1-p2)*bo;glowL.intensity=3*bo;
  for(const s of sparks){const u=s.userData;
    if(u.life<=0){if(k<.8&&Math.random()<dt*16){const a=Math.random()*6.28,r=.3+Math.random()*.7;s.position.set(Math.cos(a)*r,.1,Math.sin(a)*r);u.life=u.max=.8+Math.random()*.8;u.v=2+Math.random()*3}else{s.visible=false;continue}}
    s.visible=true;u.life-=dt;s.position.y+=u.v*dt;s.material.opacity=Math.max(0,u.life/u.max);s.rotation.y+=dt*4}
}
function endIntro(){FXG.visible=false;pmeshes.forEach(o=>o.material.forEach(q=>{q.transparent=false;q.opacity=1}));applyPose();
  phase='hide';document.body.classList.remove('intro');$('welcome').hidden=true;yaw=0;pitch=fp?.05:.5;dist=7.5;
  $('hint').classList.remove('dim');clearTimeout(window._h);window._h=setTimeout(()=>$('hint').classList.add('dim'),14000);toast('Hide phase! Press E, pick colours off the walls and paint yourself.',5000);lock()}