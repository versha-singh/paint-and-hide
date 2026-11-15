/* ---------- tasks ---------- */
const TASKPOTS=[[3,6.5],[-17,-7.5],[31,-4.5]],POSEPAD=[0,13.3],WATERPAD=[38,5.8];
const tk={got:[false,false,false],pots:0,pose:0,water:0,POSE:5,WATER:4,reset:false};
const TG=new THREE.Group();TG.visible=false;scene.add(TG);
const beamMat=c=>new THREE.MeshBasicMaterial({color:c,transparent:true,opacity:.28,depthWrite:false,blending:THREE.AdditiveBlending,side:THREE.DoubleSide});
const potG=TASKPOTS.map(([x,z])=>{const g=new THREE.Group();g.position.set(x,0,z);
  const pot=new THREE.Mesh(new THREE.BoxGeometry(.5,.5,.5),new THREE.MeshBasicMaterial({color:0xffd23a}));pot.position.y=.9;
  const lid=new THREE.Mesh(new THREE.BoxGeometry(.3,.15,.3),new THREE.MeshBasicMaterial({color:0xd9534f}));lid.position.y=1.25;pot.add(lid);lid.position.y=.32;
  const bm=new THREE.Mesh(new THREE.CylinderGeometry(.5,.5,6,12,1,true),beamMat(0xffd23a));bm.position.y=3;
  g.add(pot,bm);g.userData.pot=pot;TG.add(g);return g});
const makePad=(a,c)=>{const g=new THREE.Group();g.position.set(a[0],0,a[1]);
  const r=new THREE.Mesh(new THREE.RingGeometry(.7,1.1,32),new THREE.MeshBasicMaterial({color:c,side:THREE.DoubleSide}));r.rotation.x=-Math.PI/2;r.position.y=.09;
  const bm=new THREE.Mesh(new THREE.CylinderGeometry(.9,.9,5,16,1,true),beamMat(c));bm.position.y=2.5;g.add(r,bm);TG.add(g);return g};
const posePad=makePad(POSEPAD,0xd96cb0),waterPad=makePad(WATERPAD,0x4fc3c3);
const taskDone=()=>tk.pots>=3&&tk.pose>=tk.POSE&&tk.water>=tk.WATER;
function taskSpots(){const a=[];TASKPOTS.forEach((q,i)=>{if(!tk.got[i])a.push(q)});if(tk.pose<tk.POSE)a.push(POSEPAD);if(tk.water<tk.WATER)a.push(WATERPAD);return a}
let lastTxt='';
function renderTasks(){const row=(ok,t,x)=>'<div class="'+(ok?'ok':'')+'">'+(ok?'[x] ':'[ ] ')+t+(ok?'':x)+'</div>';
  const h='<div class="t">TASKS</div>'+row(tk.pots>=3,'Collect paint pots',' '+tk.pots+'/3')+row(tk.pose>=tk.POSE,'Pose at meadow painting',tk.pose>0?' '+Math.ceil(tk.POSE-tk.pose)+'s':'')+row(tk.water>=tk.WATER,'Water the garden',tk.water>0?' '+Math.ceil(tk.WATER-tk.water)+'s':'');
  if(h!==lastTxt){lastTxt=h;$('tasks').innerHTML=h}}
function resetTasks(){tk.got=[false,false,false];tk.pots=tk.pose=tk.water=0;potG.forEach(g=>g.visible=true);posePad.visible=waterPad.visible=true;TG.visible=false;$('tasks').style.display='none';lastTxt='';renderTasks()}
function updateTasks(dt,now){
  if(!playing())return;TG.visible=true;$('tasks').style.display='block';
  const near=(a,r)=>Math.hypot(P.position.x-a[0],P.position.z-a[1])<r;
  potG.forEach((g,i)=>{if(tk.got[i])return;g.userData.pot.position.y=.9+Math.sin(now*.004+i)*.12;g.userData.pot.rotation.y+=dt*2;
    if(near(TASKPOTS[i],1.2)){tk.got[i]=true;tk.pots++;g.visible=false;Snd.chime(1);toast('Paint pot '+tk.pots+' of 3',1800)}});
  if(tk.pose<tk.POSE){
    if(near(POSEPAD,1.1)&&!moving&&sus<.6){tk.pose+=dt;if(tk.pose>=tk.POSE){tk.pose=tk.POSE;posePad.visible=false;Snd.chime(2);toast('Pose task done!',2000)}}else tk.pose=0}
  if(tk.water<tk.WATER){
    if(near(WATERPAD,1.3)){
      if(sus>.45){tk.water=0;if(!tk.reset){tk.reset=true;toast('The seeker noticed you. Watering reset!',2200)}}
      else{tk.reset=false;tk.water+=dt;if(tk.water>=tk.WATER){tk.water=tk.WATER;waterPad.visible=false;Snd.chime(2);toast('Garden watered!',2000)}}
    }else tk.water=0}
  renderTasks();
  if(taskDone())startFinal();
}

/* ---------- game flow ---------- */
function toast(t,ms=3000){const e=$('toast');e.textContent=t;e.style.opacity=1;clearTimeout(toast.h);toast.h=setTimeout(()=>e.style.opacity=0,ms)}
function startGame(){Snd.init();resetTasks();finalOn=false;$('count').style.display='none';Snd.sting('spawn');mvx=mvz=0;
  $('menu').hidden=$('end').hidden=true;$('hud').hidden=false;
  phase='intro';introT=0;tleft=60;sus=0;document.body.classList.add('intro');pname=($('pname').value.trim()||'Chameleon').slice(0,12);$('welcome').textContent='WELCOME, '+pname.toUpperCase();$('welcome').hidden=false;P.rotation.y=Math.PI;P.position.set(P0.x,0,P0.z);S.visible=false;S.position.set(seekSpawn.x,0,seekSpawn.z);yaw=0;pitch=fp?.05:.5;dist=7.5;pose=0;applyPose();
  lock();
}
function beginSeek(){Snd.sting('seek');phase='seek';tleft=120;alertCd=0;S.visible=true;S.position.set(seekSpawn.x,0,seekSpawn.z);S.rotation.y=Math.atan2(-seekSpawn.x,-seekSpawn.z);newTarget();wait=.8;toast('The seeker is in! Keep doing the tasks, but stay out of sight.',4000)}
let finalOn=false,finalT=0,tickT=0,warned30=false;
function startFinal(){if(finalOn)return;finalOn=true;finalT=60;tickT=0;warned30=false;if(phase==='hide')beginSeek();Snd.chime(2);toast('ALL TASKS DONE! Stay hidden for 60 seconds!',4000)}
function finish(win,why){
  phase='end';finalOn=false;$('count').style.display='none';if(win)Snd.fanfare();else Snd.sting('lose');unlock();if(paintMode)setPaint(false);S.visible=false;TG.visible=false;$('tasks').style.display='none';$('hud').hidden=true;$('paint').hidden=true;
  $('etitle').textContent=win?'ALL TASKS DONE':why==='time'?'TIME UP':'FOUND YOU!';
  $('etext').textContent=win?'You finished every task and stayed hidden. Nicely done!':why==='time'?'You ran out of time before finishing the tasks. Be quicker next round.':'The seeker spotted you. Match the colours behind you more closely, and stay still.';
  $('end').hidden=false;
}
const goFull=()=>{if(!lowGfx)return;try{const d=document.documentElement,f=d.requestFullscreen||d.webkitRequestFullscreen;if(f)Promise.resolve(f.call(d)).then(()=>screen.orientation&&screen.orientation.lock&&screen.orientation.lock('landscape').catch(()=>{})).catch(()=>{})}catch(e){}};
$('play').onclick=()=>{goFull();startGame()};$('again').onclick=startGame;
document.addEventListener('gesturestart',e=>e.preventDefault());
buildRoom();
{const sp=$('splash');sp.onclick=()=>sp.remove();setTimeout(()=>sp.remove(),3800)}

/* ---------- minimap ---------- */
const mm=$('mm'),mx=mm.getContext('2d');
function drawMap(){const sx=mm.width/(RX+GX),sz=mm.height/(2*RZ);mx.fillStyle='rgba(15,9,4,.8)';mx.fillRect(0,0,mm.width,mm.height);mx.fillStyle='rgba(70,130,50,.45)';mx.fillRect(2*RX*sx,0,mm.width-2*RX*sx,mm.height);mx.fillStyle='#8a6a40';
  for(const b of solids)if(b.max.y>.3)mx.fillRect((b.min.x+RX)*sx,(b.min.z+RZ)*sz,(b.max.x-b.min.x)*sx,(b.max.z-b.min.z)*sz);
  const px=(P.position.x+RX)*sx,pz=(P.position.z+RZ)*sz;mx.strokeStyle='#fff';mx.lineWidth=2;mx.beginPath();mx.moveTo(px,pz);mx.lineTo(px-Math.sin(yaw)*12,pz-Math.cos(yaw)*12);mx.stroke();
  mx.fillStyle='#7bbf3f';mx.beginPath();mx.arc(px,pz,5,0,7);mx.fill()}
/* ---------- main loop ---------- */
let last=performance.now(),mtimer=0,idle=0,fc=0,sBlocked=false;
function loop(now){
  requestAnimationFrame(loop);const dt=Math.min(.05,(now-last)/1000);last=now;
  if(phase==='menu'){idle+=dt*.15;yaw=idle;pitch=.5;dist=13}
  if(playing()){
    if(finalOn){finalT-=dt;tickT-=dt;if(!warned30&&finalT<=30){warned30=true;Snd.alert();toast('30 SECONDS LEFT! The seeker is closing in!',2500)}if(tickT<=0){tickT=finalT>30?1:finalT>10?.5:.33;Snd.tick(finalT<=3,finalT<=30)}if(finalT<=0){finalOn=false;finish(true)}}
    else{tleft-=dt;if(phase==='hide'&&tleft<=0)beginSeek();else if(phase==='seek'&&tleft<=0)finish(false,'time')}
    {const ce=$('count');if(finalOn){const cn=Math.max(0,Math.ceil(finalT));ce.style.display='block';if(ce.dataset.v!=cn){ce.dataset.v=cn;ce.querySelector('b').textContent=cn}ce.classList.toggle('hot',finalT<=10)}else ce.style.display='none'}
    $('phase').textContent=finalOn?'SURVIVE':phase==='hide'?'HIDE':'TASKS';$('time').textContent=Math.max(0,Math.ceil(finalOn?finalT:tleft));
    mtimer+=dt;if(mtimer>1.1){mtimer=0;{const e=exposure(meterCam());$('hid').style.width=Math.round(Math.max(0,1-e.score/.3)*100)+'%'}}
    $('sus').style.width=Math.round(sus*100)+'%'}
  if(phase==='intro'){introT+=dt;FXG.visible=true;updateIntro(Math.min(1,introT/INTRO),dt);if(introT>=INTRO)endIntro()}
  if(playing()){yaw+=((keys.arrowleft?1:0)-(keys.arrowright?1:0))*dt*2.2;pitch=clampP(pitch+((keys.arrowdown?1:0)-(keys.arrowup?1:0))*dt*1.6)}
  pollPad(dt);movePlayer(dt);seekerUpdate(dt);updateTasks(dt,now);Snd.update(dt,now);
  // animation
  if(moving&&pose===0){const s=Math.sin(walk)*.7;parts.legL.pv.rotation.x=s;parts.legR.pv.rotation.x=-s;parts.armL.pv.rotation.x=-s;parts.armR.pv.rotation.x=s}
  else if(pose===0||pose===1){['legL','legR','armL','armR'].forEach(n=>parts[n].pv.rotation.x*=.8)}
  flick.forEach((l,i)=>l.intensity=(l.userData.b||1)*(1+Math.sin(now*.02+i*2)*.12+Math.random()*.15));
  sun.position.set(P.position.x-5,12,P.position.z-3);sun.target.position.set(P.position.x,0,P.position.z);sun.target.updateMatrixWorld();
  // camera: first person (free 360-degree look) or third-person boom
  const fpv=fp&&!paintMode&&playing();P.visible=!fpv;
  if(fpv){const cp=Math.cos(pitch);cam.position.set(P.position.x,1.95,P.position.z);cam.lookAt(P.position.x-Math.sin(yaw)*cp,1.95-Math.sin(pitch),P.position.z-Math.cos(yaw)*cp)}
  else{
    const t=new THREE.Vector3(P.position.x,(paintMode||phase==='intro')?1.3:1.7,P.position.z);if(phase==='menu')t.set(P0.x,1.5,P0.z);
    const cp=Math.cos(pitch),dv=new THREE.Vector3(Math.sin(yaw)*cp,Math.sin(pitch),Math.cos(yaw)*cp).normalize(),D=boom(t,dv,dist);
    cam.position.copy(t).addScaledVector(dv,D);cam.position.y=Math.min(5.6,Math.max(.4,cam.position.y));cam.lookAt(t)}
  skyUpdate(dt);renderer.render(scene,cam);
  const tg=$('tag');if(phase==='intro'||phase==='menu'||(playing()&&!fpv)){const v=new THREE.Vector3(P.position.x,2.75*Math.max(.4,P.scale.y),P.position.z).project(cam);
    if(v.z<1){tg.hidden=false;tg.textContent=phase==='menu'?($('pname').value.trim()||'Chameleon'):pname;tg.style.left=(v.x*.5+.5)*innerWidth+'px';tg.style.top=(-v.y*.5+.5)*innerHeight+'px'}else tg.hidden=true}else tg.hidden=true;
  {const st=$('stag');
  if(phase==='seek'&&S.visible){
    const v=new THREE.Vector3(S.position.x,3.2,S.position.z).project(cam),d=Math.round(Math.hypot(S.position.x-P.position.x,S.position.z-P.position.z));
    fc++;if(fc%6===0){const o=cam.position,tv=new THREE.Vector3(S.position.x,1.6,S.position.z).sub(o),L=tv.length();ray.set(o,tv.normalize());ray.far=L;sBlocked=!!ray.intersectObjects(occl)[0];ray.far=Infinity}
    let x=v.x,y=v.y;const off=v.z>1||Math.abs(x)>.9||y>.9||y<-.85;
    if(v.z>1){x=v.x>0?-.9:.9;y=-.5}
    x=Math.max(-.9,Math.min(.9,x));y=Math.max(-.85,Math.min(.88,y));
    st.hidden=false;st.textContent=(off&&x<0?'< ':'')+'SEEKER '+d+'m'+(off&&x>0?' >':'');
    st.style.left=(x*.5+.5)*innerWidth+'px';st.style.top=(-y*.5+.5)*innerHeight+'px';st.style.opacity=sBlocked?.55:1;
  }else st.hidden=true}
  if(playing()&&document.body.classList.contains('map'))drawMap();
}
applyPose();requestAnimationFrame(loop);