/*
  Day Zero "juice": synthesised sound (WebAudio, no audio files, nothing to license),
  a quiet ambient wind bed, a remembered mute toggle, and staged reveals.
  Respects prefers-reduced-motion: staging is skipped and nothing shakes.
*/
const DZ_MOTION_OK=!(window.matchMedia&&window.matchMedia("(prefers-reduced-motion: reduce)").matches);
let dzAC=null,dzWind=null;
function dzMuted(){try{return localStorage.getItem("dz_muted")==="1"}catch(e){return false}}
function dzAudio(){
 if(dzMuted())return null;
 if(!dzAC){const C=window.AudioContext||window.webkitAudioContext;if(!C)return null;try{dzAC=new C()}catch(e){return null}}
 if(dzAC.state==="suspended")dzAC.resume().catch(()=>{});
 return dzAC;
}
function dzTone(ac,o){
 const t=ac.currentTime+(o.at||0),osc=ac.createOscillator(),g=ac.createGain();
 osc.type=o.type||"sine";osc.frequency.setValueAtTime(o.f,t);if(o.to)osc.frequency.exponentialRampToValueAtTime(o.to,t+o.d);
 g.gain.setValueAtTime(0.0001,t);g.gain.exponentialRampToValueAtTime(o.v||0.15,t+(o.a||0.01));g.gain.exponentialRampToValueAtTime(0.0001,t+o.d);
 osc.connect(g).connect(ac.destination);osc.start(t);osc.stop(t+o.d+0.05);
}
function dzNoise(ac,o){
 const len=Math.floor(ac.sampleRate*o.d),buf=ac.createBuffer(1,len,ac.sampleRate),d=buf.getChannelData(0);
 for(let i=0;i<len;i++)d[i]=(Math.random()*2-1)*Math.pow(1-i/len,o.decay||2);
 const s=ac.createBufferSource(),f=ac.createBiquadFilter(),g=ac.createGain();s.buffer=buf;f.type=o.filter||"lowpass";f.frequency.value=o.fq||1200;g.gain.value=o.v||0.2;
 s.connect(f).connect(g).connect(ac.destination);s.start(ac.currentTime+(o.at||0));
}
const DZ_SFX={
 tick:ac=>dzTone(ac,{f:1400,d:0.06,type:"square",v:0.06}),
 press:ac=>{dzNoise(ac,{d:0.25,fq:500,v:0.25});dzTone(ac,{f:90,d:0.2,v:0.2})},
 page:ac=>dzNoise(ac,{d:0.35,fq:3000,filter:"bandpass",v:0.12,decay:1}),
 flip:ac=>dzNoise(ac,{d:0.12,fq:2500,filter:"bandpass",v:0.15}),
 chime:ac=>{dzTone(ac,{f:660,d:0.5,v:0.1});dzTone(ac,{f:990,d:0.6,v:0.08,at:0.08})},
 success:ac=>{[523,659,784].forEach((f,i)=>dzTone(ac,{f,d:0.35,v:0.1,at:i*0.09}))},
 fail:ac=>{dzTone(ac,{f:300,to:180,d:0.45,type:"triangle",v:0.14})},
 alarm:ac=>{[0,0.22].forEach(at=>dzTone(ac,{f:880,to:620,d:0.18,type:"sawtooth",v:0.06,at}))},
 drum:ac=>{[0,0.12,0.24,0.36].forEach((at,i)=>dzTone(ac,{f:110-i*8,to:50,d:0.15,v:0.22,at}))},
 stamp:ac=>{dzNoise(ac,{d:0.18,fq:400,v:0.35});dzTone(ac,{f:70,to:40,d:0.2,v:0.3})},
 vote:ac=>dzTone(ac,{f:520,to:780,d:0.12,v:0.08}),
 ring:ac=>{for(let i=0;i<6;i++)dzTone(ac,{f:i%2?1300:1100,d:0.06,v:0.06,at:i*0.07})},
 up:ac=>dzTone(ac,{f:600,to:900,d:0.15,v:0.07}),
 down:ac=>dzTone(ac,{f:420,to:260,d:0.18,type:"triangle",v:0.08}),
 power:ac=>{dzTone(ac,{f:60,to:240,d:0.8,type:"sawtooth",v:0.05});dzTone(ac,{f:880,d:0.5,v:0.06,at:0.6})},
 none:()=>{}
};
function dzSfx(name){const ac=dzAudio();if(!ac||!DZ_SFX[name])return;try{DZ_SFX[name](ac)}catch(e){}}
/* Ambient: filtered noise swelling slowly, like wind round a dark building. Very quiet. */
function dzAmbient(on){
 if(!on||dzMuted()){if(dzWind){try{dzWind.s.stop()}catch(e){}dzWind=null}return}
 const ac=dzAudio();if(!ac||dzWind)return;
 const len=ac.sampleRate*4,buf=ac.createBuffer(1,len,ac.sampleRate),d=buf.getChannelData(0);let last=0;
 for(let i=0;i<len;i++){last=(last+0.02*(Math.random()*2-1))/1.02;d[i]=last*3}
 const s=ac.createBufferSource(),f=ac.createBiquadFilter(),g=ac.createGain(),lfo=ac.createOscillator(),lg=ac.createGain();
 s.buffer=buf;s.loop=true;f.type="lowpass";f.frequency.value=500;g.gain.value=0.035;lfo.frequency.value=0.08;lg.gain.value=0.025;
 lfo.connect(lg).connect(g.gain);s.connect(f).connect(g).connect(ac.destination);s.start();lfo.start();dzWind={s};
}
function dzToggleMute(){
 const m=!dzMuted();try{localStorage.setItem("dz_muted",m?"1":"0")}catch(e){}
 if(m)dzAmbient(false);else{dzSfx("chime");dzAmbient(!!S)}
 dzMuteBtn();
}
function dzMuteBtn(){
 let b=document.getElementById("dz-mute");
 if(!b){b=document.createElement("button");b.id="dz-mute";b.type="button";b.onclick=dzToggleMute;document.body.appendChild(b)}
 const m=dzMuted();b.textContent=m?"🔇":"🔊";b.title=m?"Sound off (click to turn on)":"Sound on (click to mute)";b.setAttribute("aria-label",b.title);b.setAttribute("aria-pressed",m?"true":"false");
}
/* Browsers only allow audio after a tap; start the wind on the first one. */
document.addEventListener("pointerdown",()=>{if(S)dzAmbient(true)},{passive:true});

/* ---------- staged reveals ---------- */
let dzStageRun=0,dzPrevTrk={};
function dzAfterRender(key){
 dzMuteBtn();
 const run=++dzStageRun,A=document.getElementById("app");if(!A)return;
 /* board: highlight anything that went up or down since the last screen */
 A.querySelectorAll("[data-trk]").forEach(el=>{const k=el.dataset.trk,v=+el.dataset.v;if(k in dzPrevTrk&&dzPrevTrk[k]!==v)el.classList.add(v>dzPrevTrk[k]?"dz-up":"dz-down")});
 const seen={};A.querySelectorAll("[data-trk]").forEach(el=>seen[el.dataset.trk]=+el.dataset.v);if(Object.keys(seen).length)dzPrevTrk=seen;
 if(!S)dzPrevTrk={};
 /* the same screen re-rendered (e.g. a select changed) shouldn't replay its reveal */
 const same=dzAfterRender.last===key;dzAfterRender.last=key;
 const items=[...A.querySelectorAll(".dz-st")];
 const sk=document.getElementById("dz-skip");if(sk)sk.style.display="none";A.classList.remove("dz-staging");
 if(!items.length)return;
 if(!DZ_MOTION_OK||same||navigator.webdriver&&!window.DZ_FORCE_STAGE){items.forEach(el=>el.classList.add("dz-in"));return}
 const btns=[...A.querySelectorAll("button.btn:not(.opt)")].filter(b=>!b.disabled);
 A.classList.add("dz-staging");btns.forEach(b=>b.classList.add("dz-wait"));
 let skip=document.getElementById("dz-skip");
 if(!skip){skip=document.createElement("button");skip.id="dz-skip";skip.type="button";skip.textContent="Skip ⏭";document.body.appendChild(skip)}
 skip.style.display="";
 const finish=()=>{if(run!==dzStageRun)return;items.forEach(el=>el.classList.add("dz-in"));A.classList.remove("dz-staging");btns.forEach(b=>b.classList.remove("dz-wait"));skip.style.display="none"};
 skip.onclick=()=>{dzStageRun++;run===dzStageRun-1&&(items.forEach(el=>el.classList.add("dz-in")),A.classList.remove("dz-staging"),btns.forEach(b=>b.classList.remove("dz-wait")),skip.style.display="none")};
 let i=0;
 const step=()=>{
  if(run!==dzStageRun)return;
  if(i>=items.length){finish();return}
  const el=items[i++];el.classList.add("dz-in");dzSfx(el.dataset.sfx||"flip");
  if(el.dataset.shake){el.classList.add("dz-shake");setTimeout(()=>el.classList.remove("dz-shake"),600)}
  el.querySelectorAll(".dz-stamp").forEach(s=>s.classList.add("dz-stamped"));
  setTimeout(step,+(el.dataset.wait||700));
 };
 setTimeout(step,250);
}
