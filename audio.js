/* ---------- sound (all synthesised, no audio files) ---------- */
const Snd=(()=>{
  let ctx,master,nb,droneG,hb=0,dgT=0,fireT=0,scrT=0,lastS=0,sAcc=0,sPos=null,muted=false;
  function init(){
    if(ctx){ctx.resume();return}
    ctx=new(window.AudioContext||window.webkitAudioContext)();master=ctx.createGain();master.gain.value=1.8;const comp=ctx.createDynamicsCompressor();comp.threshold.value=-14;comp.ratio.value=8;master.connect(comp);comp.connect(ctx.destination);
    nb=ctx.createBuffer(1,ctx.sampleRate,ctx.sampleRate);const d=nb.getChannelData(0);for(let i=0;i<d.length;i++)d[i]=Math.random()*2-1;
    droneG=ctx.createGain();droneG.gain.value=0;droneG.connect(master);
    [55,55.8,82.4].forEach(f=>{const o=ctx.createOscillator(),lp=ctx.createBiquadFilter();o.type='sawtooth';o.frequency.value=f;lp.type='lowpass';lp.frequency.value=170;o.connect(lp);lp.connect(droneG);o.start()});
  }
  function noise(dur,freq,type,vol,q=1){
    if(!ctx)return;const s=ctx.createBufferSource(),f=ctx.createBiquadFilter(),g=ctx.createGain(),t=ctx.currentTime;
    s.buffer=nb;f.type=type;f.frequency.value=freq;f.Q.value=q;g.gain.setValueAtTime(vol,t);g.gain.exponentialRampToValueAtTime(.001,t+dur);
    s.connect(f);f.connect(g);g.connect(master);s.start(t,Math.random()*.5,dur);
  }
  function tone(f,dur,vol,type='sine',slide=0,delay=0){
    if(!ctx)return;const o=ctx.createOscillator(),g=ctx.createGain(),t=ctx.currentTime+delay;
    o.type=type;o.frequency.setValueAtTime(f,t);if(slide)o.frequency.exponentialRampToValueAtTime(Math.max(20,f+slide),t+dur);
    g.gain.setValueAtTime(vol,t);g.gain.exponentialRampToValueAtTime(.001,t+dur);o.connect(g);g.connect(master);o.start(t);o.stop(t+dur+.05);
  }
  const step=(v,low)=>{noise(.09,low?260:420+Math.random()*120,'lowpass',v,.8);tone(low?70:95,.09,v*.9,'sine',-30)};
  return{
    init,
    toggle(){muted=!muted;if(master)master.gain.value=muted?0:1.8;toast(muted?'Sound off':'Sound on',1200)},
    blip(){tone(880,.08,.15,'square');tone(1320,.1,.12,'square',0,.06)},
    chime(n){const f=n===2?[523,659,784,1047,1319]:[660,880,1320];f.forEach((q,i)=>tone(q,.2,.35,'triangle',0,i*.08))},
    alert(){tone(320,.12,.45,'square',200);tone(320,.12,.45,'square',200,.18)},
    tick(hi,loud){const m=loud?1.7:1;tone(hi?1800:1100,.03,.6*m,'square');tone(hi?900:550,.05,.3*m,'triangle')},
    fanfare(){[[523,0],[659,.14],[784,.28],[1047,.42],[784,.62],[1047,.76],[1319,.9]].forEach(([f,d])=>{tone(f,.28,.4,'triangle',0,d);tone(f/2,.28,.22,'square',0,d)});
      tone(1568,.8,.45,'triangle',0,1.15);[523,659,784,1047].forEach(f=>tone(f,1,.28,'triangle',0,1.4))},
    scratch(){if(!ctx||ctx.currentTime<scrT)return;scrT=ctx.currentTime+.07;noise(.06,2600+Math.random()*900,'bandpass',.12,2)},
    sting(k){
      if(k==='seek'){tone(110,1.4,.3,'sawtooth',-40);tone(116,1.4,.25,'sawtooth',-40);noise(.8,200,'lowpass',.4)}
      if(k==='lose'){[392,330,262,196].forEach((f,i)=>tone(f,.35,.28,'square',-10,i*.18));noise(.5,150,'lowpass',.5)}
      if(k==='win'){[523,659,784,1047].forEach((f,i)=>tone(f,.4,.22,'triangle',0,i*.13))}
      if(k==='spawn'){tone(220,1.8,.18,'sine',700);tone(440,1.8,.1,'triangle',700,.25);[1,2,3,4,5].forEach(i=>tone(500+i*180,.3,.08,'sine',0,i*.3))}
      if(droneG)droneG.gain.setTargetAtTime(0,ctx.currentTime,.2);
    },
    update(dt,now){
      if(!ctx)return;const t=ctx.currentTime,play=phase==='hide'||phase==='seek';
      // fireplace crackle, louder near the hearth
      fireT-=dt;if(fireT<=0){fireT=.08+Math.random()*.5;const d=fire?Math.hypot(P.position.x-fire.position.x,P.position.z-fire.position.z):99;if(fire&&(play||phase==='menu'))noise(.03+Math.random()*.04,2500+Math.random()*3500,'highpass',.35/(1+d*.35),.7)}
      // your footsteps
      const sg=Math.sin(walk);if(moving&&play){if(lastS&&Math.sign(sg)!==lastS)step(pose===1?.12:.35,0);lastS=Math.sign(sg)||1}else lastS=0;
      // seeker footsteps, fading with distance
      if(phase==='seek'&&S.visible){
        if(sPos){sAcc+=Math.hypot(S.position.x-sPos.x,S.position.z-sPos.z)}sPos={x:S.position.x,z:S.position.z};
        if(sAcc>1){sAcc=0;const d=Math.hypot(S.position.x-P.position.x,S.position.z-P.position.z);step(Math.min(1,3/(1+d*.5)),1)}
      }else sPos=null;
      // heartbeat and tension drone rise with suspicion
      droneG.gain.setTargetAtTime(phase==='seek'?.08+sus*.22+(finalOn&&finalT<=30?.12:0):0,t,.4);
      hb-=dt;if(phase==='seek'&&sus>.12&&hb<=0){hb=.95-sus*.55;tone(62,.14,.9,'sine',-25);tone(58,.14,.6,'sine',-25,.16)}
      // danger pulses: faster, lower and louder the closer the seeker is, plus a siren when very close
      if(phase==='seek'&&S.visible){const dd=Math.hypot(S.position.x-P.position.x,S.position.z-P.position.z);
        const U=finalOn&&finalT<=30,R=U?26:18,m=U?1.5:1;if(dd<R){const c=1-dd/R;dgT-=dt;if(dgT<=0){dgT=U?.2+dd*.04:.25+dd*.055;tone(60+c*70,.32,(.25+c*.75)*m,'sawtooth',-22);if(dd<9)tone(120+c*90,.22,(.2+c*.4)*m,'square',-30,.04)}
          if(dd<5&&Math.floor(now/160)%2===0&&Math.random()<.5)tone(Math.floor(now/320)%2?880:932,.14,.25,'square')}
      }
    }
  };
})();
addEventListener('keydown',e=>{if(e.key.toLowerCase()==='m')Snd.toggle()});
const FILTERS=[['NORMAL',''],['WARM','sepia(.3) saturate(1.35) hue-rotate(-8deg) brightness(1.05)'],['COOL','saturate(1.2) hue-rotate(18deg) contrast(1.05)'],['VIVID','saturate(1.7) contrast(1.15)'],['RETRO','sepia(.7) contrast(1.15) saturate(1.3)'],['NOIR','grayscale(1) contrast(1.3)'],['CINEMA','saturate(1.25) contrast(1.2) brightness(.95)',true]];
let fi=0;
function setFilter(i){fi=(i+FILTERS.length)%FILTERS.length;cv.style.filter=FILTERS[fi][1];$('vig').style.display=FILTERS[fi][2]?'block':'none';$('fbtn').textContent='FILTER: '+FILTERS[fi][0];toast('Filter: '+FILTERS[fi][0],1200)}
$('fbtn').onclick=()=>setFilter(fi+1);
if(isTouch){$('tF').onclick=()=>setFilter(fi+1);$('tX').onclick=()=>Snd.toggle()}
addEventListener('keydown',e=>{if(e.key.toLowerCase()==='g'&&!/INPUT|TEXTAREA/.test(document.activeElement.tagName))setFilter(fi+1)});