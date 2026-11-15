/* ---------- levels: 48 x 30 blocks, five rooms joined by doorways ---------- */
const RX=24,RZ=15,GX=42;let P0={x:0,z:-3},seekSpawn={x:20,z:11};
const solids=[],occl=[],camBlock=[],roomG=new THREE.Group();scene.add(roomG);
let fire=null;const flick=[];
function B(w,h,d,m,x,y,z,col){const o=new THREE.Mesh(new THREE.BoxGeometry(w,h,d),m);o.position.set(x,y+h/2,z);o.castShadow=h>.45&&w<20&&d<20;o.receiveShadow=true;roomG.add(o);occl.push(o);if(col)solids.push(new THREE.Box3().setFromObject(o));return o}
const cb=(...a)=>{const o=B(...a);camBlock.push(o);return o};
const camRay=new THREE.Raycaster();
function boom(o,dir,maxD){camRay.set(o,dir);camRay.far=maxD;const h=camRay.intersectObjects(camBlock,false)[0];return h?Math.max(.5,h.distance-.4):maxD}
const hemi=new THREE.HemisphereLight(0xcfe8ff,0x8a7a6a,.7);scene.add(hemi);
const sun=new THREE.DirectionalLight(0xfff2d0,.5);sun.castShadow=true;
sun.shadow.mapSize.set(lowGfx?1024:2048,lowGfx?1024:2048);Object.assign(sun.shadow.camera,{left:-14,right:14,top:14,bottom:-14,near:1,far:40});scene.add(sun,sun.target);
const env=(bg,hi,si)=>{scene.background=new THREE.Color(bg);scene.fog=null;hemi.intensity=hi;sun.intensity=si};
const lamp=(x,y,z,c,i,r)=>{B(.4,.5,.4,glow(c),x,y,z);const l=new THREE.PointLight(c,i,r);l.position.set(x,y-.2,z);roomG.add(l);return l};
const flame=(x,y,z,c,i,r)=>{const l=new THREE.PointLight(c,i,r);l.position.set(x,y,z);l.userData.b=i;roomG.add(l);flick.push(l);return l};
const nz=(c,v,rx=1,ry=1)=>Mat(tex(16,16,(x,w,h)=>{for(let i=0;i<w;i++)for(let j=0;j<h;j++){x.fillStyle=shade(c,(rnd()-.5)*v);x.fillRect(i,j,1,1)}},rx,ry));
const frameZ=(x,z,m)=>{B(2.7,2.2,.12,darkM,x,1.6,z);B(2.3,1.8,.16,m,x,1.8,z)},frameX=(z,x,m)=>{B(.12,2.2,2.7,darkM,x,1.6,z);B(.16,1.8,2.3,m,x,1.8,z)};
const winZ=(x,z)=>{B(2.6,2.2,.1,glow(0xd6ecff),x,1.8,z);for(const[w,h,dx,y]of[[2.8,.2,0,3.9],[2.8,.2,0,1.6],[.2,2.5,-1.3,1.6],[.2,2.5,1.3,1.6],[.15,2.2,0,1.8],[2.6,.15,0,2.8]])B(w,h,.2,logM,x+dx,y,z)};
const winX=(z,x)=>{B(.1,2.2,2.6,glow(0xd6ecff),x,1.8,z);for(const[w,h,dz,y]of[[2.8,.2,0,3.9],[2.8,.2,0,1.6],[.2,2.5,-1.3,1.6],[.2,2.5,1.3,1.6],[.15,2.2,0,1.8],[2.6,.15,0,2.8]])B(.2,h,w,logM,x,y,z+dz)};
const rail=flat(0x8a8a90),iron=flat(0x4a4c52);

// the room layout shared by every level
const ROOMR={L:[-24,-8,-15,15],C:[-8,8,-15,15],R1:[8,24,-15,0],R2:[8,24,0,15],G:[24,42,-15,15]};
const DOORS=[['L','C',-8,-7.5],['L','C',-8,7.5],['R1','C',8,-7.5],['R2','C',8,7.5],['R1','R2',16,0],['R1','G',24,-7.5],['R2','G',24,7.5]];
const roomOf=(x,z)=>x>24?'G':x<-8?'L':x>8?(z<0?'R1':'R2'):'C';
function route(a,b){if(a===b)return[];const q=[[a,[]]],seen={[a]:1};
  while(q.length){const[r,p]=q.shift();for(const d of DOORS){const o=d[0]===r?d[1]:d[1]===r?d[0]:null;if(!o||seen[o])continue;seen[o]=1;const np=p.concat([{x:d[2],z:d[3]}]);if(o===b)return np;q.push([o,np])}}return[]}
function shell(fl,wa,wb,ce){const W=2*RX+.8,D=2*RZ+.8;cb(W,.4,D,fl,0,-.4,0);cb(W,6,.4,wa,0,0,-RZ-.2);cb(W,6,.4,wa,0,0,RZ+.2);cb(.4,6,D,wb,-RX-.2,0,0);
  // east wall with two doorways out to the garden
  const seg=(a,b)=>{if(b-a>.1)cb(.4,6,b-a,wb,RX+.2,0,(a+b)/2,1)};let a=-RZ-.4;
  for(const g of[-7.5,7.5]){seg(a,g-1.6);a=g+1.6;cb(.4,2.6,3.2,wb,RX+.2,3.4,g);for(const o of[-1.6,1.6])B(.7,3.4,.5,logM,RX+.2,0,g+o)}
  seg(a,RZ+.4);
  // ceiling, so no sky shows indoors
  cb(W,.4,D,ce,0,6,0)}
function partitions(m){
  const seg=(v,c,a,b)=>{if(b-a>.1)cb(v?.4:b-a,6,v?b-a:.4,m,v?c:(a+b)/2,0,v?(a+b)/2:c,1)};
  const run=(v,c,lo,hi,gaps)=>{let a=lo;for(const g of gaps){seg(v,c,a,g-1.6);a=g+1.6;cb(v?.4:3.2,2.6,v?3.2:.4,m,v?c:g,3.4,v?g:c);
    for(const o of[-1.6,1.6])B(v?.7:.5,3.4,v?.5:.7,logM,v?c:g+o,0,v?g+o:c)}seg(v,c,a,hi)};
  run(true,-8,-RZ,RZ,[-7.5,7.5]);run(true,8,-RZ,RZ,[-7.5,7.5]);run(false,0,8,RX,[16]);
}

function gallery(){
  const pw=nz('#e6e0d2',10,3,3),pl=nz('#e6e0d2',10,24,3),pl2=nz('#e6e0d2',10,12,3);
  const marble=Mat(tex(16,16,(x,w,h)=>{for(let i=0;i<w;i++)for(let j=0;j<h;j++){x.fillStyle=shade(((i>>3)+(j>>3))%2?'#2e2e34':'#d8d4cc',(rnd()-.5)*10);x.fillRect(i,j,1,1)}},24,15));
  env(0x9fd0f5,1,1.1);shell(marble,pl,pl2,nz('#efe9dc',8,24,15));partitions(pw);P0={x:0,z:8};seekSpawn={x:-3,z:-9.5};
  const pal=[['#f2c14e','#d9534f','#2a4a8a','#1f1f1f','#f4efe0'],['#2e6a3a','#9fd356','#fff1b8','#3a2a1a','#6fb3d2'],['#d96cb0','#6a2a7a','#ffd3e8','#2a1a3a','#4fc3c3'],['#ff8a3a','#ffd23a','#6a1a1a','#1a1a3a','#f8e8d0']];
  const A=[...Array(8)].map((_,k)=>Mat(tex(16,16,(x,w,h)=>{const p=pal[k%4];x.fillStyle=p[4];x.fillRect(0,0,w,h);for(let i=0;i<10;i++){x.fillStyle=p[rnd()*4|0];x.fillRect(rnd()*12|0,rnd()*12|0,2+rnd()*6|0,2+rnd()*6|0)}})));
  const r=(x,c,a,b,w,h)=>{x.fillStyle=c;x.fillRect(a|0,b|0,Math.max(1,w|0),Math.max(1,h|0))};
  const paints=[
    (x,w,h)=>{r(x,'#f4efe0',0,0,w,h);r(x,'#d9342b',0,0,w*.38,h*.55);r(x,'#2a4aa0',w*.7,h*.6,w*.3,h*.4);r(x,'#f2c230',w*.7,0,w*.3,h*.2);[[w*.38-1,0,2,h],[w*.7-1,0,2,h],[0,h*.55-1,w,2],[w*.38,h*.2-1,w*.62,2],[w*.7,h*.6-1,w*.3,2]].forEach(l=>r(x,'#111',...l))},
    (x,w,h)=>{['#2b1a4a','#6a2a6a','#c0406a','#ff7a4a','#ffc060','#ffe9a0'].forEach((c,j)=>r(x,c,0,j*h*.11,w,h*.12));r(x,'#fff2c0',w*.4,h*.4,w*.2,h*.22);for(let i=0;i<w;i++){const t=Math.abs(((i+5)%18)-9)*.14*h/4;r(x,'#1a1030',i,h*.66-t,1,t+2)}r(x,'#1a1a3a',0,h*.66,w,h*.34);for(let j=0;j<5;j++)r(x,'#c0406a',w*(.3+rnd()*.3),h*(.7+j*.06),w*.15,1)},
    (x,w,h)=>{const pc=['#2e6a3a','#f2c14e','#d9534f','#2a4a8a','#f4efe0'];for(let i=0;i<w;i++)r(x,pc[(i/3|0)%5],i,0,1,h)},
    (x,w,h)=>{r(x,'#cfe8f5',0,0,w,h);['#1f4e8a','#2e7ac0','#4fa8dc','#8cc8ea','#1f4e8a'].forEach((c,k)=>{for(let i=0;i<w;i++){const y=h*(.15+.17*k)+Math.sin(i*.45+k*1.7)*2;r(x,c,i,y,1,h-y)}})},
    (x,w,h)=>{r(x,'#9fd0f5',0,0,w,h);r(x,'#f8e058',w*.78,h*.08,w*.1,h*.16);r(x,'#6aaa4a',0,h*.5,w,h*.5);for(let i=0;i<w;i++){const t=Math.abs(((i+4)%24)-12)*.25;r(x,'#4e9a38',i,h*.5-t,1,t+2)}for(let i=0;i<70;i++)r(x,['#ffffff','#f2c14e','#d9534f','#d96cb0','#4fc3c3'][i%5],rnd()*w,h*.6+rnd()*h*.4,1+(rnd()*2|0),1+(rnd()*2|0))},
    (x,w,h)=>{['#d9534f','#f2c14e','#2a4a8a','#f4efe0','#2e6a3a','#1f1f1f'].forEach((c,j)=>r(x,c,j*w*.07,j*h*.09,w-2*j*w*.07,h-2*j*h*.09))}
  ];
  const PM=(j,tw=32,th=32)=>Mat(tex(tw,th,paints[j%6]));
  A.push(...paints.map((_,j)=>PM(j)));
  let k=0;const art=()=>A[k++%A.length];
  [-20,-12,-4,4,12,20].forEach(x=>frameZ(x,-RZ+.06,art()));[-20,-12,-5,5,12,20].forEach(x=>frameZ(x,RZ-.06,art()));
  [-10,-5,5,10].forEach(z=>frameX(z,-RX+.06,art()));[-12.5,-2.8,2.8,12.5].forEach(z=>frameX(z,RX-.06,art()));
  // big murals on the long walls, and standing paintings you can hide in front of
  const mural=(x,z,m)=>{B(5,2.6,.12,darkM,x,1.5,z);B(4.6,2.2,.16,m,x,1.7,z)};
  [[-16,0],[0,1],[16,2]].forEach(([x,j])=>{mural(x,-RZ+.06,PM(j,64,32));mural(x,RZ-.06,PM(j+3,64,32))});
  const board=(x,z,j1,j2)=>{B(3.6,3.4,.24,darkM,x,0,z,1);B(3.2,2.8,.06,PM(j1),x,.3,z+.14);B(3.2,2.8,.06,PM(j2),x,.3,z-.14);for(const o of[-1.5,1.5])B(.3,.18,1,darkM,x+o,0,z)};
  board(-17,0,0,1);board(0,-5,2,3);board(14,-7,4,5);board(13.5,7.2,1,4);
  // give every room its own look: floor, wall band and props
  const fL=Mat(tex(16,16,(x,w,h)=>{for(let i=0;i<w;i++)for(let j=0;j<h;j++){x.fillStyle=(i%8===0||j%8===0)?'#7a4030':shade(((i>>3)+(j>>3))%2?'#b5654a':'#a35840',(rnd()-.5)*14);x.fillRect(i,j,1,1)}},8,15));
  const fR1=Mat(tex(16,16,planks('#b07a45','#5a3418',4),8,15));
  const fR2=Mat(tex(16,16,(x,w,h)=>{for(let i=0;i<w;i++)for(let j=0;j<h;j++){x.fillStyle=shade(((i>>3)+(j>>3))%2?'#bfe8d8':'#f4f1ea',(rnd()-.5)*8);x.fillRect(i,j,1,1)}},8,15));
  B(16,.02,30,fL,-16,0,0);B(16,.02,15,fR1,16,0,-7.5);B(16,.02,15,fR2,16,0,7.5);
  const band=(w,d,x,z,c1,c2)=>{const ns=d<w;B(ns?w:.08,1.1,ns?.08:d,flat(c1),x,0,z);B(ns?w:.08,.35,ns?.08:d,flat(c2),x,5.3,z)};
  const TL=[0x1f5a63,0xd8b25a],TC=[0x5a1a22,0xd8b25a],TR1=[0x6b4423,0xf0e2c0],TR2=[0x6fbfa8,0xe99bc0];
  band(16,.08,-16,-RZ+.04,...TL);band(16,.08,-16,RZ-.04,...TL);band(.08,30,-RX+.04,0,...TL);
  band(16,.08,0,-RZ+.04,...TC);band(16,.08,0,RZ-.04,...TC);
  band(16,.08,16,-RZ+.04,...TR1);band(16,.08,16,RZ-.04,...TR2);
  band(.08,5.6,RX-.04,-12.2,...TR1);band(.08,5.6,RX-.04,-2.8,...TR1);band(.08,5.6,RX-.04,2.8,...TR2);band(.08,5.6,RX-.04,12.2,...TR2);
  // library corner (wood room): a bookcase
  const books=Mat(tex(16,16,(x,w,h)=>{r(x,'#3a2412',0,0,w,h);for(let j=0;j<4;j++){let i=0;while(i<w){const bw=1+(rnd()*2|0);r(x,['#d9534f','#2a4a8a','#f2c14e','#2e6a3a','#f4efe0','#7a2a7a'][rnd()*6|0],i,j*4,bw,3);i+=bw}}},1,1));
  B(.6,3,2.4,books,8.6,0,-3.8,1);
  // plants in the pastel room
  const leafP=nz('#3f9a34',60,2,2),plant=(x,z)=>{B(.8,.5,.8,flat(0xb5654a),x,0,z,1);B(1.1,1.4,1.1,leafP,x,.5,z)};
  plant(9.4,2.6);plant(23.2,1.3);plant(9.6,13.9);
  // ceiling lights
  for(const lx of[-16,0,16])for(const lz of[-9,9])B(2.2,.08,.5,glow(lx<0?0xdfefff:lx===0?0xfff4d8:lz<0?0xffd9a0:0xffd9ee),lx,5.9,lz);
  [[-16,0,0xcfe4ff],[0,-8,0xfff0d0],[0,8,0xfff0d0],[16,-7.5,0xffc58a],[16,7.5,0xffd6ee]].forEach(([lx,lz,lc])=>{const l=new THREE.PointLight(lc,.4,26);l.position.set(lx,5.2,lz);roomG.add(l)});
  for(const sx of[-1,1])for(const z of[-12,0,12])for(const o of[-.26,.26])frameX(z,sx*8+o,art());
  for(const x of[11,21])for(const o of[-.26,.26])frameZ(x,o,art());
  const lea=flat(0x2a2024),ped=(x,z,c)=>{B(.9,1.2,.9,pw,x,0,z,1);B(.6,.6,.6,flat(c),x,1.2,z)};
  const tower=(x,z,i)=>{const c=[0x2a4a8a,0xd9534f,0xf2c14e,0x4fc3c3,0x9fd356,0xd96cb0];B(1.4,1.4,1.4,flat(c[i%6]),x,0,z,1);B(.9,.9,.9,flat(c[(i+2)%6]),x,1.4,z);B(.5,.5,.5,flat(c[(i+4)%6]),x,2.3,z)};
  // C grand hall
  B(4,.04,28,flat(0x7a1a2a),0,0,0);B(5,.04,26,flat(0x1a3a6a),-16,0,0);B(5,.04,12,flat(0x1a3a6a),16,0,-7);for(const x of[-5,5])for(const z of[-11,-4,3,10])B(.9,6,.9,pw,x,0,z,1);
  B(2.6,2.6,2.6,flat(0x2a4a8a),0,0,0,1);B(1.8,1.8,1.8,flat(0xd9534f),0,2.6,0);B(1,1,1,flat(0xf2c14e),0,4.4,0);
  B(4,.5,1,lea,0,0,-8,1);B(4,.5,1,lea,0,0,-13,1);
  // L1 pop-art, L2 sculptures, R1 portraits, R2 cube forest
  [[-21,-11,0xd9534f],[-17,-11,0x4fc3c3],[-13,-11,0xf2c14e],[-21,-4,0x9fd356],[-13,-4,0xd96cb0]].forEach(p=>ped(...p));
  [[-21,4],[-21,11],[-12,12],[-17,12],[-20,8]].forEach(([x,z],i)=>tower(x,z,i));B(1,.5,4,lea,-12,0,4,1);
  B(1,.5,4,lea,10,0,-4,1);B(4,.5,1,lea,17,0,-13,1);ped(20,-11,0x4fc3c3);ped(14,-11,0xf2c14e);ped(20,-3,0xd96cb0);
  for(const gx of[11.5,15.5,19.5,22.5])for(const gz of[4,10.5,13.5]){const i=(gx*3+gz)|0;B(1+i%3*.4,1+i%4*.5,1+i%3*.4,flat([0xd9534f,0x4fc3c3,0xf2c14e,0x9fd356,0xd96cb0][i%5]),gx,0,gz,1)}
  garden();
  
}

function garden(){
  const grass=nz('#5aa040',46,8,12),leaf=nz('#2f7a2c',60,3,1),crown=nz('#3f9a34',60,3,3),crown2=nz('#56b043',50,2,2);
  const fenceNS=Mat(tex(16,16,planks('#a87a42','#4a2e12',3),8,2)),fenceE=Mat(tex(16,16,planks('#a87a42','#4a2e12',3),14,2));
  const bloom=Mat(tex(16,16,(x,w,h)=>{for(let i=0;i<w;i++)for(let j=0;j<h;j++){x.fillStyle=shade('#2f7a2c',(rnd()-.5)*30);x.fillRect(i,j,1,1)}const cs=['#d9534f','#f2c14e','#d96cb0','#ffffff','#7a5ad9'];for(let n=0;n<26;n++){x.fillStyle=cs[rnd()*5|0];x.fillRect(rnd()*15|0,rnd()*15|0,1+(rnd()*2|0),1+(rnd()*2|0))}},2,1));
  const pathH=nz('#b9a98a',36,5,1),pathV=nz('#b9a98a',36,1,8),water=flat(0x3a8fd0);
  // grass floor and the wooden fence (open sky above)
  cb(18,.4,2*RZ+.8,grass,RX+9.4,-.4,0);
  cb(18.2,5,.4,fenceNS,33.3,0,-RZ-.2);cb(18.2,5,.4,fenceNS,33.3,0,RZ+.2);cb(.4,5,2*RZ+.8,fenceE,GX+.2,0,0);
  B(18.4,.3,.6,logM,33.3,5,-RZ-.2);B(18.4,.3,.6,logM,33.3,5,RZ+.2);B(.6,.3,31,logM,GX+.2,5,0);
  for(const x of[26.5,31,35.5,40]){B(.6,5.4,.6,logM,x,0,-RZ+.1);B(.6,5.4,.6,logM,x,0,RZ-.1)}
  for(const z of[-12,-6,0,6,12])B(.6,5.4,.6,logM,GX-.1,0,z);
  // stone paths from both doors
  B(11.1,.05,2,pathH,29.95,0,-7.5);B(11.1,.05,2,pathH,29.95,0,7.5);B(2,.05,17,pathV,34.5,0,0);
  // pond with a little fountain
  B(4.4,.5,4.4,stoneM,38,0,0,1);B(3.4,.52,3.4,water,38,0,0);B(.6,1.2,.6,stoneM,38,0,0);
  // flower beds and hedges
  B(4,.5,2.4,bloom,38,0,-8,1);B(4,.5,2.4,bloom,38,0,8,1);B(2.4,.5,5,bloom,29.5,0,0,1);
  B(8,1.6,1,leaf,29,0,-11,1);B(8,1.6,1,leaf,29,0,11,1);B(1,1.6,6,leaf,41,0,0,1);
  // trees
  [[28,-13.3],[40.3,-12.8],[28,13.3],[40.3,12.8]].forEach(([x,z])=>{B(.9,3.4,.9,logM,x,0,z,1);B(3.4,1.8,3.4,crown,x,3.2,z);B(2.4,1.5,2.4,crown2,x,5,z)});
  // benches, crates and barrels
  for(const s of[-1,1]){B(2.8,.45,.8,logM,34.5,0,s*14.5,1);B(2.8,.9,.15,logM,34.5,.45,s*14.8);B(1.2,1.2,1.2,crateM,37.5,0,s*13.6,1);B(.9,1.1,.9,barrelM,38.9,0,s*13.7,1)}
}

function buildRoom(){
  roomG.children.slice().forEach(o=>{if(o.geometry)o.geometry.dispose();roomG.remove(o)});
  solids.length=occl.length=camBlock.length=flick.length=0;gallery();fire=flick[0]||null;P.position.set(P0.x,0,P0.z);
}

/* ---------- sky, sun, clouds and the grass outside ---------- */
const sky=(()=>{const c=document.createElement('canvas');c.width=4;c.height=256;const x=c.getContext('2d'),g=x.createLinearGradient(0,0,0,256);
  g.addColorStop(0,'#2a62c8');g.addColorStop(.28,'#4f95e6');g.addColorStop(.5,'#bfe4ff');g.addColorStop(1,'#d8eeff');x.fillStyle=g;x.fillRect(0,0,4,256);
  const m=new THREE.Mesh(new THREE.SphereGeometry(300,24,16),new THREE.MeshBasicMaterial({map:new THREE.CanvasTexture(c),side:THREE.BackSide,fog:false,depthWrite:false}));m.renderOrder=-10;scene.add(m);return m})();
const SUNDIR=new THREE.Vector3(-5,12,-3).normalize();
const sunDisc=new THREE.Group();sunDisc.add(new THREE.Mesh(new THREE.BoxGeometry(22,22,1),new THREE.MeshBasicMaterial({color:0xfff6c0,fog:false})),new THREE.Mesh(new THREE.BoxGeometry(40,40,1),new THREE.MeshBasicMaterial({color:0xfff2a0,transparent:true,opacity:.28,fog:false,depthWrite:false})));scene.add(sunDisc);
const cloudM=new THREE.MeshBasicMaterial({color:0xffffff,transparent:true,opacity:.93,fog:false});
const clouds=[...Array(24)].map(()=>{const c=new THREE.Group();for(let i=0;i<3;i++){const m=new THREE.Mesh(new THREE.BoxGeometry(14+rnd()*16,3,8+rnd()*8),cloudM);m.position.set(i*10-10,rnd()*2,rnd()*6-3);c.add(m)}c.position.set((rnd()-.5)*260,45+rnd()*25,(rnd()-.5)*260);scene.add(c);return c});
const ground=new THREE.Mesh(new THREE.PlaneGeometry(800,800),nz('#4f8a3a',44,200,200));ground.rotation.x=-Math.PI/2;ground.position.y=-.45;ground.receiveShadow=true;scene.add(ground);
function skyUpdate(dt){sky.position.copy(cam.position);sunDisc.position.copy(cam.position).addScaledVector(SUNDIR,250);sunDisc.lookAt(cam.position);for(const c of clouds){c.position.x+=dt*2.5;if(c.position.x>140)c.position.x=-140}}