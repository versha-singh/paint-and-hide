/* ---------- input & camera ---------- */
const clampP=v=>{const f=fp&&!paintMode;return Math.max(f?-1.45:-.3,Math.min(f?1.45:1.3,v))};
const keys={};let fp=true,yaw=0,pitch=.05,dist=7.5,paintMode=false,locked=false,phase='menu',tleft=0,sus=0,eyeOn=false,painting=false,orbiting=false;
addEventListener('keydown',e=>{const k=e.key.toLowerCase();keys[k]=1;
  if(phase!=='hide'&&phase!=='seek')return;
  if(k==='e')setPaint(!paintMode);
  if(k==='v'&&!paintMode)toggleView();if(k==='q')cyclePose();if(k==='n')toggleMap();if(k==='h')$('hint').classList.toggle('dim')
  if('1234'.includes(k)&&k)setPose(+k-1);
  if(paintMode){if(k==='f')toggleEye();if(k==='b')fillBody();if(k==='c')clearBody()}});
addEventListener('keyup',e=>keys[e.key.toLowerCase()]=0);
document.addEventListener('mousemove',e=>{
  if(locked&&!paintMode){yaw-=e.movementX*.0025;pitch=clampP(pitch+e.movementY*.0025)}else if(!locked&&!paintMode&&playing()&&(e.buttons&1)){yaw-=e.movementX*.005;pitch=clampP(pitch+e.movementY*.005)}
  else if(paintMode){if(orbiting){yaw-=e.movementX*.006;pitch=Math.max(-.1,Math.min(1.2,pitch+e.movementY*.006))}else if(painting)paintAt(e)}});
cv.addEventListener('mousedown',e=>{
  if(!paintMode){if(playing()&&!locked)lock();return}
  if(e.button===2)orbiting=true;else if(eyeOn){pick(e);toggleEye()}else{painting=true;document.body.classList.add('brush');paintAt(e)}});
addEventListener('mouseup',()=>{painting=orbiting=false;document.body.classList.remove('brush')});
cv.addEventListener('contextmenu',e=>e.preventDefault());
cv.addEventListener('wheel',e=>{dist=Math.max(paintMode?2:4,Math.min(paintMode?6:11,dist+e.deltaY*.003))});
document.addEventListener('pointerlockchange',()=>{locked=document.pointerLockElement===cv;if(!locked&&playing()&&!paintMode)$('pause').hidden=false;else $('pause').hidden=true});
$('pause').onclick=()=>{$('pause').hidden=true;lock()};
const playing=()=>phase==='hide'||phase==='seek';
function setPaint(on){paintMode=on;$('paint').hidden=!on;document.body.classList.toggle('painting',on);
  if(on){unlock();$('pause').hidden=true;dist=3.4;pitch=.2;toast(isTouch?'Tap Pick colour, tap a wall to copy it, then drag on your body. Tap Done when finished.':'Press F, click a wall to copy its colour, then drag on your body. E when done.',3500)}else{dist=7.5;pitch=fp?.05:.5;eyeOn=false;document.body.classList.remove('eye','brush');$('eye').classList.remove('on');lock()}}
function setPose(p){pose=p;applyPose()}
document.querySelectorAll('[data-p]').forEach(b=>b.onclick=()=>setPose(+b.dataset.p));
$('done').onclick=()=>setPaint(false);
$('rl').onclick=()=>{yaw+=.5};$('rr').onclick=()=>{yaw-=.5};
/* touch: left side = joystick, right side = look, 1 finger paints in paint mode */
const joy={x:0,y:0},gp={x:0,y:0};let tj=null,tl=null,jx=0,jy=0,lx=0,ly=0;
if(isTouch){
  document.addEventListener('touchstart',e=>{if(!playing())return;for(const t of e.changedTouches){if(t.target.closest('button,#paint'))continue;
    if(paintMode){document.body.classList.add('brush');paintAt(t);continue}
    if(t.clientX<innerWidth*.45&&tj===null){tj=t.identifier;jx=t.clientX;jy=t.clientY;const J=$('joy');J.hidden=false;J.style.left=jx+'px';J.style.top=jy+'px'}else if(tl===null){tl=t.identifier;lx=t.clientX;ly=t.clientY}}},{passive:true});
  document.addEventListener('touchmove',e=>{for(const t of e.changedTouches){
    if(paintMode){if(!t.target.closest('#paint'))paintAt(t);continue}
    if(t.identifier===tj){const dx=Math.max(-50,Math.min(50,t.clientX-jx)),dy=Math.max(-50,Math.min(50,t.clientY-jy));joy.x=dx/50;joy.y=-dy/50;$('knob').style.transform=`translate(${dx}px,${dy}px)`}
    else if(t.identifier===tl){yaw-=(t.clientX-lx)*.006;pitch=clampP(pitch+(t.clientY-ly)*.006);lx=t.clientX;ly=t.clientY}}},{passive:true});
  const tend=e=>{document.body.classList.remove('brush');for(const t of e.changedTouches){if(t.identifier===tj){tj=null;joy.x=joy.y=0;$('knob').style.transform='';$('joy').hidden=true}if(t.identifier===tl)tl=null}};
  document.addEventListener('touchend',tend);document.addEventListener('touchcancel',tend);
  $('tP').onclick=()=>{if(playing())setPaint(!paintMode)};$('tV').onclick=()=>{if(playing())toggleView()};$('tS').onclick=()=>{if(playing())cyclePose()};$('tM').onclick=()=>toggleMap();
}

/* ---------- painting ---------- */
let col='#8a5a2b';
['#8a5a2b','#b58a52','#6b4423','#46290f','#7a7a7a','#a8302a','#e8e4dc','#2e6a3a'].forEach(c=>{const b=document.createElement('button');b.className='sw';b.style.background=c;b.onclick=()=>setCol(c);$('sws').appendChild(b)});
function setCol(c){col=c;$('col').value=c}
$('col').oninput=e=>col=e.target.value;
function toggleEye(){eyeOn=!eyeOn;document.body.classList.toggle('eye',eyeOn);$('eye').classList.toggle('on',eyeOn)}
$('eye').onclick=toggleEye;
function pick(e){Snd.blip();const gl=renderer.getContext(),s=cv.width/cv.clientWidth,px=new Uint8Array(4);
  gl.readPixels(Math.floor(e.clientX*s),Math.floor(cv.height-e.clientY*s),1,1,gl.RGBA,gl.UNSIGNED_BYTE,px);
  setCol('#'+[...px.slice(0,3)].map(v=>v.toString(16).padStart(2,'0')).join(''))}
const ray=new THREE.Raycaster();
function paintAt(e){
  ray.setFromCamera(new THREE.Vector2(e.clientX/innerWidth*2-1,-(e.clientY/innerHeight)*2+1),cam);
  const h=ray.intersectObjects(pmeshes)[0];if(!h)return;Snd.scratch();
  const f=h.object.userData.cvs[h.face.materialIndex],px=Math.floor(h.uv.x*16),py=Math.floor((1-h.uv.y)*16),r=+$('bs').value-1;
  f.t.fillStyle=col;for(let dx=-r;dx<=r;dx++)for(let dy=-r;dy<=r;dy++)if(dx*dx+dy*dy<=r*r+.5)f.t.fillRect(px+dx,py+dy,1,1);f.tx.needsUpdate=true}
function fillAll(c){Object.values(parts).forEach(p=>p.cvs.forEach(f=>{f.t.fillStyle=c;f.t.fillRect(0,0,16,16);f.tx.needsUpdate=true}))}
const fillBody=()=>fillAll(col),clearBody=()=>fillAll('#f4f4f4');
$('fill').onclick=fillBody;$('clr').onclick=clearBody;

/* ---------- movement ---------- */
const hit=(x,z)=>{const r=.35;if(x<-RX+.6||x>GX-.6||Math.abs(z)>RZ-.6)return true;for(const b of solids)if(b.max.y>.3&&x>b.min.x-r&&x<b.max.x+r&&z>b.min.z-r&&z<b.max.z+r)return true;return false};
const toggleView=()=>{fp=!fp;pitch=fp?.05:.5},cyclePose=()=>{if(playing())setPose((pose+1)%4)},toggleMap=()=>document.body.classList.toggle('map');
let padBlocked=false;const padPrev=[],dz=v=>Math.abs(v)>.18?v:0;
addEventListener('gamepadconnected',()=>toast('Controller connected',2500));
function pollPad(dt){
  let g=null;if(!padBlocked){try{g=(navigator.getGamepads?[...navigator.getGamepads()]:[]).find(p=>p&&p.connected)}catch(e){padBlocked=true}}if(!g){gp.x=gp.y=0;return}
  gp.x=dz(g.axes[0]);gp.y=-dz(g.axes[1]);
  if(playing()){yaw-=dz(g.axes[2]||0)*dt*3;pitch=clampP(pitch+dz(g.axes[3]||0)*dt*2.2)}
  g.buttons.forEach((b,i)=>{const d=b.pressed&&!padPrev[i];padPrev[i]=b.pressed;if(!d)return;
    if(i===0){if(playing())setPaint(!paintMode);else if(phase==='menu'||phase==='end')startGame()}
    if(i===3&&playing()&&!paintMode)toggleView();if(i===2)cyclePose();if(i===8||i===9)toggleMap()});
}
let mvx=0,mvz=0;
function movePlayer(dt){
  let ix=0,iz=0;
  if(!paintMode&&playing()){ix=(keys.d?1:0)-(keys.a?1:0)+joy.x+gp.x;iz=(keys.w?1:0)-(keys.s?1:0)+joy.y+gp.y}
  const l=Math.hypot(ix,iz),mag=l<.15?0:Math.min(1,l),fx=-Math.sin(yaw),fz=-Math.cos(yaw);
  const sp=(pose===1?2.2:4.4)*mag,dx=mag?(fx*iz-fz*ix)/l:0,dz2=mag?(fz*iz+fx*ix)/l:0;
  mvx+=(dx*sp-mvx)*Math.min(1,dt*10);mvz+=(dz2*sp-mvz)*Math.min(1,dt*10);
  const v=Math.hypot(mvx,mvz);moving=v>.4&&playing();
  if(v<.01){mvx=mvz=0;return}
  if(!hit(P.position.x+mvx*dt,P.position.z))P.position.x+=mvx*dt;
  if(!hit(P.position.x,P.position.z+mvz*dt))P.position.z+=mvz*dt;
  if(moving){let a=Math.atan2(mvx,mvz)-P.rotation.y;a=Math.atan2(Math.sin(a),Math.cos(a));P.rotation.y+=a*Math.min(1,dt*12);walk+=dt*v*2}
}