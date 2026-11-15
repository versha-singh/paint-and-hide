const $=id=>document.getElementById(id);
const cv=$('cv');
const isTouch='ontouchstart' in window||navigator.maxTouchPoints>0;if(isTouch)document.body.classList.add('touch');
const lowGfx=matchMedia('(pointer:coarse)').matches&&!matchMedia('(any-pointer:fine)').matches;
const lock=()=>{if(!isTouch&&cv.requestPointerLock)cv.requestPointerLock()},unlock=()=>{document.exitPointerLock&&document.exitPointerLock()};
const renderer=new THREE.WebGLRenderer({canvas:cv,antialias:!lowGfx,preserveDrawingBuffer:true});
renderer.setPixelRatio(Math.min(devicePixelRatio,lowGfx?1.5:2));
renderer.shadowMap.enabled=true;renderer.shadowMap.type=THREE.PCFSoftShadowMap;
const scene=new THREE.Scene();scene.background=new THREE.Color(0x1a120b);
const cam=new THREE.PerspectiveCamera(72,1,.15,700);
function resize(){renderer.setSize(innerWidth,innerHeight,false);cam.aspect=innerWidth/innerHeight;cam.updateProjectionMatrix()}
addEventListener('resize',resize);resize();

/* ---------- procedural pixel textures ---------- */
let seed=7;const rnd=()=>(seed=seed*16807%2147483647)/2147483647;
const shade=(c,v)=>{const n=parseInt(c.slice(1),16),f=s=>Math.max(0,Math.min(255,((n>>s)&255)+v));return`rgb(${f(16)},${f(8)},${f(0)})`};
function tex(w,h,fn,rx=1,ry=1){const c=document.createElement('canvas');c.width=w;c.height=h;fn(c.getContext('2d'),w,h);const t=new THREE.CanvasTexture(c);t.magFilter=t.minFilter=THREE.NearestFilter;t.wrapS=t.wrapT=THREE.RepeatWrapping;t.repeat.set(rx,ry);return t}
const planks=(base,seam,n=4)=>(x,w,h)=>{const ph=h/n;for(let j=0;j<n;j++){const off=rnd()*6;for(let i=0;i<w;i++)for(let k=0;k<ph;k++){x.fillStyle=shade(base,(rnd()-.5)*20+(k===0?-18:0));x.fillRect(i,j*ph+k,1,1)}x.fillStyle=seam;x.fillRect(0,j*ph,w,1);x.fillRect((off+j*5)%w,j*ph,1,ph)}};
const Mat=(map,o={})=>new THREE.MeshPhongMaterial(Object.assign({map,shininess:0,specular:0x000000},o));
const flat=c=>new THREE.MeshPhongMaterial({color:c,shininess:0,specular:0x000000});
const glow=c=>new THREE.MeshBasicMaterial({color:c});

const floorM=Mat(tex(16,16,planks('#b58a52','#6e4a22',4),20,12));
const wallA=Mat(tex(16,16,planks('#6b4423','#2e1c0c',4),24,3));
const wallB=Mat(tex(16,16,planks('#6b4423','#2e1c0c',4),12,3));
const darkM=Mat(tex(16,16,planks('#46290f','#22130a',2)));
const logM=Mat(tex(16,16,(x,w,h)=>{for(let i=0;i<w;i++)for(let j=0;j<h;j++){x.fillStyle=shade('#5a3a1a',(i%4<1?-25:0)+(rnd()-.5)*16);x.fillRect(i,j,1,1)}}));
const ceilM=Mat(tex(16,16,planks('#7b5230','#3a2410',4),24,15));
const stoneM=Mat(tex(16,16,(x,w,h)=>{for(let i=0;i<w;i++)for(let j=0;j<h;j++){x.fillStyle=shade('#7a7a7a',(rnd()-.5)*40);x.fillRect(i,j,1,1)}}));
const woolRed=Mat(tex(16,16,(x,w,h)=>{for(let i=0;i<w;i++)for(let j=0;j<h;j++){x.fillStyle=shade('#b8302a',(rnd()-.5)*16);x.fillRect(i,j,1,1)}}));
const woolWhite=Mat(tex(16,16,(x,w,h)=>{for(let i=0;i<w;i++)for(let j=0;j<h;j++){x.fillStyle=shade('#e8e4dc',(rnd()-.5)*12);x.fillRect(i,j,1,1)}}));
const carpetM=Mat(tex(16,16,(x,w,h)=>{for(let i=0;i<w;i++)for(let j=0;j<h;j++){const e=i<2||j<2||i>13||j>13,m=(i+j)%4===0;x.fillStyle=shade(e?'#f0e6c8':m?'#a8302a':'#7e2420',(rnd()-.5)*10);x.fillRect(i,j,1,1)}},5,4));
const bookM=Mat(tex(16,16,(x,w,h)=>{x.fillStyle='#5a3a1a';x.fillRect(0,0,w,h);const cs=['#a8302a','#2e6a3a','#2a4a8a','#c8a030','#6a2a7a','#d8d0b8'];for(const r of[1,6,11]){for(let i=0;i<w;){const bw=1+(rnd()*2|0);x.fillStyle=cs[rnd()*6|0];x.fillRect(i,r,bw,4);i+=bw}x.fillStyle='#3a2410';x.fillRect(0,r+4,w,1)}},4,3));
const crateM=Mat(tex(16,16,(x,w,h)=>{planks('#a8793e','#4a2e12',4)(x,w,h);x.fillStyle='#4a2e12';x.fillRect(0,0,w,2);x.fillRect(0,h-2,w,2);x.fillRect(0,0,2,h);x.fillRect(w-2,0,2,h)}));
const barrelM=Mat(tex(16,16,(x,w,h)=>{for(let i=0;i<w;i++)for(let j=0;j<h;j++){x.fillStyle=shade(j%8<1?'#2a2a2a':'#7b5026',(i%3?0:-14)+(rnd()-.5)*12);x.fillRect(i,j,1,1)}}));
const doorM=Mat(tex(16,16,planks('#4a2e14','#1e1008',6)));
const paintingM=Mat(tex(16,16,(x,w,h)=>{x.fillStyle='#8fc4e8';x.fillRect(0,0,w,10);x.fillStyle='#f8e058';x.fillRect(11,2,3,3);x.fillStyle='#7a8a9a';for(let i=0;i<w;i++){const t=4+Math.abs(((i+3)%10)-5);x.fillRect(i,t+2,1,10)}x.fillStyle='#4e9a38';x.fillRect(0,10,w,6);x.fillStyle='#2e6a22';for(let i=0;i<9;i++)x.fillRect(rnd()*w|0,10+rnd()*6|0,1,1);x.fillStyle='#b8402a';x.fillRect(3,8,3,3);x.fillStyle='#5a3a1a';x.fillRect(4,6,1,2)}));