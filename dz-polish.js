/* Day Zero: polish layer (presentation only; reads game state, never changes it).
   - Inline SVG scenes in chapter / story-break headers (blackout, night, water, silence, rumours, cold, dawn, flood, fire, key)
   - Role portraits (SVG) for role cards and the cold-open team list
   - An engraved masthead ornament for the Chronicle
   - Screen and chapter transitions (CSS; switched off by prefers-reduced-motion) */
(function(){
const NS='xmlns="http://www.w3.org/2000/svg"';
/* ---------- chapter header scenes (viewBox 0 0 240 96) ---------- */
const town=(lit)=>{ // silhouettes + windows; lit = which windows stay warm
 const W=[[18,70],[30,70],[56,60],[68,60],[56,74],[68,74],[93,64],[127,64],[156,40],[164,40],[156,52],[164,52],[156,64],[164,64],[156,76],[164,76],[190,74],[200,74]];
 return '<g class="sil"><path d="M8 96V64l18-14 18 14v32Z"/><path d="M48 96V52h32v44Z"/><path d="M86 96V60l27-21 27 21v36Z"/><path d="M109 42h8v-9h-8z"/><path d="M148 96V30h28v66Z"/><path d="M182 96V66l16-12 16 12v30Z"/><path d="M0 96h240v-3H0z"/></g>'+
  W.map((w,i)=>'<rect class="win'+(lit==="all"||(lit&&lit.includes(i))?" on":"")+'" style="--i:'+i+'" x="'+w[0]+'" y="'+w[1]+'" width="6" height="7" rx="1"/>').join("")+
  '<rect class="win on hall" x="108" y="72" width="10" height="12" rx="1.5"/>';
};
const moon='<path class="moon" d="M206 12a14 14 0 1 0 12 22 11 11 0 1 1-12-22z"/>';
const stars=n=>Array.from({length:n},(_,i)=>{const x=(i*53+17)%230+5,y=(i*29+7)%38+4;return '<circle class="star" style="--i:'+i+'" cx="'+x+'" cy="'+y+'" r="'+(i%3?1:1.6)+'"/>'}).join("");
const SC={
 blackout:()=>stars(6)+moon+town([2,9,14]),
 night:()=>stars(12)+moon+town([3,8,13,17]),
 cold:()=>stars(8)+moon+town([8])+Array.from({length:14},(_,i)=>'<circle class="snow" style="--i:'+i+'" cx="'+((i*37)%236+2)+'" cy="'+((i*23)%60)+'" r="'+(i%2?1.4:2)+'"/>').join(""),
 water:()=>'<circle class="sun" cx="40" cy="96" r="26"/>'+'<g class="sil"><path d="M150 96l8-44h4l-6 44zM196 96l-8-44h-4l6 44zM166 96V52h4v44zM176 96V52h4v44z"/><path d="M152 52h44v-4h-44z"/><path d="M148 48V24c0-6 52-6 52 0v24z"/><path d="M0 96h240v-3H0z"/><path d="M20 96V70l14-10 14 10v26Z"/><path d="M60 96V64h22v32Z"/></g><rect class="win on" x="66" y="70" width="6" height="7" rx="1"/><path class="band" d="M152 34h44"/><path class="drop" d="M174 56c3 5 5 8 5 10a5 5 0 0 1-10 0c0-2 2-5 5-10z"/>',
 quiet:()=>stars(5)+'<g class="sil"><path d="M150 96 166 20h4l16 76h-6l-12-58-12 58z"/><path d="M158 70h20M161 56h14M164 42h8" class="lat"/><path d="M0 96h240v-3H0z"/><path d="M14 96V62h30v34Z"/><path d="M52 96V70l15-11 15 11v26Z"/></g><circle class="tip" cx="168" cy="18" r="3"/><path class="arc a1" d="M158 10a14 14 0 0 0 0 16M178 10a14 14 0 0 1 0 16"/><path class="arc a2" d="M151 4a24 24 0 0 0 0 28M185 4a24 24 0 0 1 0 28"/><path class="cross" d="M196 6l12 12M208 6l-12 12"/>',
 rumours:()=>stars(4)+town([4,11])+'<g class="bub"><path d="M150 8h40a6 6 0 0 1 6 6v14a6 6 0 0 1-6 6h-24l-8 7v-7h-8a6 6 0 0 1-6-6V14a6 6 0 0 1 6-6z"/><text x="170" y="27">?!</text></g><g class="bub b2"><path d="M30 14h30a6 6 0 0 1 6 6v10a6 6 0 0 1-6 6H48l-6 6v-6H30a6 6 0 0 1-6-6V20a6 6 0 0 1 6-6z"/><text x="45" y="30">…</text></g>',
 dawn:()=>'<circle class="sun big" cx="190" cy="96" r="34"/>'+Array.from({length:7},(_,i)=>{const a=(-170+i*25)*Math.PI/180;return '<path class="ray" style="--i:'+i+'" d="M'+(190+42*Math.cos(a)).toFixed(1)+' '+(96+42*Math.sin(a)).toFixed(1)+'L'+(190+56*Math.cos(a)).toFixed(1)+' '+(96+56*Math.sin(a)).toFixed(1)+'"/>'}).join("")+town("all").replace('<path d="M148 96V30h28v66Z"/>','').replace(/<rect class="win on" style="--i:(8|9|1[0-5])"[^>]*>/g,'')+'<g class="sil"><path d="M232 96l-8-60h-4l-8 60h4l6-46 6 46z"/><path d="M210 44h28M213 54h22"/></g><path class="line" d="M140 46q36 10 78 2"/>',
 flood:()=>stars(5)+moon+'<g class="sil"><path d="M40 70a60 30 0 0 1 120 0v4h-8a52 24 0 0 0-104 0h-8z"/><path d="M0 96h240v-3H0z"/></g><path class="wave w1" d="M-20 82q15-8 30 0t30 0 30 0 30 0 30 0 30 0 30 0 30 0 30 0"/><path class="wave w2" d="M-40 90q15-8 30 0t30 0 30 0 30 0 30 0 30 0 30 0 30 0 30 0 30 0"/>',
 fire:()=>stars(6)+town([5])+'<path class="flame" d="M200 92c-14 0-20-10-18-20 2-8 8-12 8-20 6 4 10 10 9 16 3-2 4-6 4-9 6 6 9 13 9 19 0 8-6 14-12 14z"/><path class="flame in" d="M200 92c-6 0-9-5-8-10 1-4 4-6 4-10 3 3 6 6 5 10 2-1 2-3 2-4 3 3 5 6 5 9 0 3-3 5-8 5z"/>',
 key:()=>stars(6)+town([1,12])+'<g class="key"><circle cx="186" cy="30" r="12"/><circle class="hole" cx="186" cy="30" r="4"/><path d="M196 36l28 18-4 6-6-4-3 5-5-3 3-5-17-11z"/></g>'
};
const ROUND={1:"blackout",2:"night",3:"water",4:"quiet",5:"rumours",6:"cold",7:"dawn"};
function sceneFor(head){
 const t=(head.textContent||"").toLowerCase(),brk=/story break/.test(t);
 if(/flood|bridge|river/.test(t))return "flood";
 if(/fire|candle|flame|smoke/.test(t))return "fire";
 if(/\bkey\b|inquiry|inspector/.test(t))return "key";
 if(/water|tap|tank|dry/.test(t)&&brk)return "water";
 if(/phone|message|signal|line goes|radio/.test(t)&&brk)return "quiet";
 if(brk&&/rumou?r/.test(t))return "rumours";
 const r=typeof S!=="undefined"&&S&&S.round;return ROUND[r]||"night";
}
function headArt(head){
 const k=sceneFor(head);
 const s=document.createElement("span");s.className="dz-head-art dz-sc-"+k;s.setAttribute("aria-hidden","true");
 s.innerHTML='<svg '+NS+' viewBox="0 0 240 96" preserveAspectRatio="xMaxYMax meet" focusable="false">'+SC[k]()+'</svg>';
 head.classList.add("dz-has-art");head.appendChild(s);
}
/* ---------- role portraits (viewBox 0 0 64 64) ---------- */
const FACE=(skin)=>'<path class="nk" d="M28 34h8v10h-8z" fill="'+skin+'"/><ellipse cx="32" cy="27" rx="10" ry="11.5" fill="'+skin+'"/><circle cx="28" cy="27.5" r="1.3" fill="#1b1612"/><circle cx="36" cy="27.5" r="1.3" fill="#1b1612"/><path d="M29 32.5q3 2 6 0" stroke="#1b1612" stroke-width="1.3" fill="none" stroke-linecap="round"/>';
const BODY=c=>'<path d="M6 66c2-14 12-22 26-22s24 8 26 22z" fill="'+c+'"/><path d="M6 66c2-14 12-22 26-22s24 8 26 22z" fill="#000" opacity=".28"/>';
const PORT={
 Theo:{skin:"#c58c5c",c:"#4aa3ff",d:'<path d="M22 25c0-11 20-11 20 0-3-5-17-5-20 0z" fill="#2b1d14"/><path d="M19.5 29c0-17 25-17 25 0" fill="none" stroke="#1d2433" stroke-width="3"/><rect x="17" y="24" width="5" height="10" rx="2" fill="#1d2433"/><rect x="42" y="24" width="5" height="10" rx="2" fill="#1d2433"/>'},
 Ines:{skin:"#8d5a3b",c:"#f0a500",d:'<path d="M22 24l-1 14h3l1-12zM42 24l1 14h-3l-1-12z" fill="#151010"/><path d="M21 23c0-12 22-12 22 0z" fill="#f0a500"/><rect x="20" y="20" width="24" height="5" rx="2" fill="#b77a00"/><circle cx="32" cy="11" r="3" fill="#ffd77f"/>'},
 Pavel:{skin:"#e2b48c",c:"#e07ac0",d:'<path d="M22 24c1-9 19-9 20 0-4-4-16-4-20 0z" fill="#6b4a2c"/><path d="M26 44l6 7 6-7" fill="none" stroke="#f3f0e8" stroke-width="2"/><path d="M24 46c0 10 16 10 16 0" fill="none" stroke="#c9d1e3" stroke-width="2"/><circle cx="32" cy="56" r="2.4" fill="#c9d1e3"/><path d="M44 52h6M47 49v6" stroke="#fff" stroke-width="2"/>'},
 Marta:{skin:"#f0c9a6",c:"#2fd09c",d:'<circle cx="32" cy="13" r="5" fill="#c9c6c0"/><path d="M21 28c-2-14 24-14 22 0-2-7-20-7-22 0z" fill="#d8d5cf"/><path d="M22 41c5 6 15 6 20 0l2 5c-7 6-17 6-24 0z" fill="#2fd09c"/><path d="M38 46l3 9-4 1-2-8z" fill="#26a87e"/>'},
 Kit:{skin:"#d9a273",c:"#ff9f43",d:'<path d="M22 26c-1-4 0-7 2-8l16 0c2 1 3 4 2 8z" fill="#b5502a"/><path d="M21 22c0-11 22-11 22 0z" fill="#ff9f43"/><path d="M41 21l12 2-11 2z" fill="#d97a1f"/><circle cx="27" cy="31" r=".7" fill="#9b5a33"/><circle cx="37" cy="31" r=".7" fill="#9b5a33"/>'},
 Bea:{skin:"#6e4630",c:"#ff6fa8",d:'<circle cx="21" cy="18" r="6" fill="#1a1210"/><circle cx="43" cy="18" r="6" fill="#1a1210"/><path d="M22 25c0-10 20-10 20 0-4-4-16-4-20 0z" fill="#1a1210"/><path d="M24 46v18M40 46v18" stroke="#ffd1e3" stroke-width="2.5"/><path d="M24 54h16v10H24z" fill="#ffd1e3" opacity=".85"/>'},
 Dev:{skin:"#a86f45",c:"#9fb0c8",d:'<path d="M22 24c0-10 20-10 20 0-4-3-16-3-20 0z" fill="#20160f"/><path d="M21 19h22" stroke="#3a3f4a" stroke-width="2.5"/><circle cx="27.5" cy="19" r="3.6" fill="#7fd1ff" stroke="#3a3f4a" stroke-width="1.6"/><circle cx="36.5" cy="19" r="3.6" fill="#7fd1ff" stroke="#3a3f4a" stroke-width="1.6"/><path d="M44 50l8-8m-2-2 4 4" stroke="#dfe5ee" stroke-width="2.4" stroke-linecap="round"/>'},
 Grace:{skin:"#4a3022",c:"#b48cff",d:'<path d="M20 31c-2-19 26-19 24 0h-4c0-10-16-10-16 0z" fill="#bdb8b0"/><circle cx="28" cy="27.5" r="3" fill="none" stroke="#e8e2d6" stroke-width="1.2"/><circle cx="36" cy="27.5" r="3" fill="none" stroke="#e8e2d6" stroke-width="1.2"/><path d="M31 27.5h2" stroke="#e8e2d6" stroke-width="1.2"/><path d="M27 44l5 9 5-9" fill="none" stroke="#ffc24a" stroke-width="1.5"/><rect x="29" y="53" width="6" height="7" rx="1" fill="#f7f0df"/>'}
};
function portrait(name,ring){
 const p=PORT[name];if(!p)return "";const id="dzp"+name+Math.random().toString(36).slice(2,6);
 return '<svg class="dz-portrait" '+NS+' viewBox="0 0 64 64" aria-hidden="true" focusable="false"><defs><clipPath id="'+id+'"><circle cx="32" cy="32" r="29"/></clipPath><radialGradient id="'+id+'g" cx="50%" cy="30%" r="75%"><stop offset="0" stop-color="#2a375c"/><stop offset="1" stop-color="#0d1428"/></radialGradient></defs>'+
  '<circle cx="32" cy="32" r="29" fill="url(#'+id+'g)"/><g clip-path="url(#'+id+')">'+BODY(p.c)+FACE(p.skin)+p.d+'</g><circle cx="32" cy="32" r="30" fill="none" stroke="'+(ring||p.c)+'" stroke-width="3"/></svg>';
}
window.dzPortrait=portrait;
/* ---------- Chronicle masthead ornament ---------- */
const ORN_HALL='<svg class="dz-orn" '+NS+' viewBox="0 0 80 56" aria-hidden="true"><g fill="none" stroke="currentColor" stroke-width="1.6" stroke-linejoin="round"><path d="M6 52h68M12 52V26L40 8l28 18v26"/><path d="M34 52V36h12v16M18 32h10v8H18zM52 32h10v8H52z"/><path d="M40 8V2M37 4h6"/></g><rect x="19.5" y="33.5" width="7" height="5" fill="#c58a1a"/><path d="M8 52l0 0" stroke="currentColor"/></svg>';
const ORN_MAST='<svg class="dz-orn" '+NS+' viewBox="0 0 80 56" aria-hidden="true"><g fill="none" stroke="currentColor" stroke-width="1.6" stroke-linejoin="round"><path d="M6 52h68M30 52 40 10l10 42M34 36h12M32 44h16M37 24h6"/><path d="M30 12a14 14 0 0 0 0 14M50 12a14 14 0 0 1 0 14M24 6a22 22 0 0 0 0 26M56 6a22 22 0 0 1 0 26"/></g><circle cx="40" cy="9" r="2.6" fill="#c58a1a"/></svg>';
const RULE='<svg class="dz-mast-rule" '+NS+' viewBox="0 0 600 14" preserveAspectRatio="none" aria-hidden="true"><path d="M0 7h270M330 7h270" stroke="currentColor" stroke-width="1.2"/><path d="M0 11h270M330 11h270" stroke="currentColor" stroke-width=".6"/><g transform="translate(300 7)"><path d="M-22 0h-6M22 0h6" stroke="currentColor" stroke-width="1.2"/><path d="M-6-6h12l-2 12h-8z" fill="none" stroke="currentColor" stroke-width="1.2"/><path d="M0-3c2 2 2 4 0 6-2-2-2-4 0-6z" fill="#c58a1a"/><path d="M-3-6v-3h6v3" fill="none" stroke="currentColor" stroke-width="1.2"/></g></svg>';
function masthead(m){
 const h=m.querySelector("h1");if(!h)return;
 const row=document.createElement("div");row.className="dz-mast-row";h.parentNode.insertBefore(row,h);
 row.insertAdjacentHTML("beforeend",ORN_HALL);row.appendChild(h);row.insertAdjacentHTML("beforeend",ORN_MAST);
 row.insertAdjacentHTML("afterend",RULE);
}
/* ---------- decorate after each render ---------- */
function decorate(root){
 root.querySelectorAll(".dz21-head:not([data-dzp])").forEach(h=>{h.dataset.dzp=1;headArt(h)});
 root.querySelectorAll(".dz24-role-section:not([data-dzp])").forEach(sec=>{sec.dataset.dzp=1;
  const nm=(sec.querySelector(".dz24-role-name")||{}).textContent||"",first=nm.split("·")[0].trim(),ic=sec.querySelector(".dz24-role-icon");
  if(ic&&PORT[first]){const badge=ic.innerHTML;ic.innerHTML=portrait(first,getComputedStyle(sec).getPropertyValue("--dz24-role").trim()||null)+'<span class="dz-portrait-badge">'+badge+'</span>';ic.classList.add("dz-has-portrait")}});
 root.querySelectorAll(".dz-teamline:not([data-dzp])").forEach(l=>{l.dataset.dzp=1;const sp=l.querySelector("span[style]");if(!sp)return;
  const m=sp.textContent.match(/(Theo|Ines|Pavel|Marta|Kit|Bea|Dev|Grace)/);if(m){l.insertAdjacentHTML("afterbegin",portrait(m[1],sp.style.color));l.classList.add("dz-has-portrait")}});
 root.querySelectorAll(".dz24-order-role-head:not([data-dzp])").forEach(h=>{h.dataset.dzp=1;const m=(h.textContent||"").match(/(Theo|Ines|Pavel|Marta|Kit|Bea|Dev|Grace)/);if(!m)return;
  const ic=h.querySelector(".dz-ico");const holder=h.closest("[style*='--dz24-role']");const col=holder?holder.style.getPropertyValue("--dz24-role").trim():"";
  if(ic)ic.remove();h.insertAdjacentHTML("afterbegin",portrait(m[1],col||null));h.classList.add("dz-has-portrait")});
 root.querySelectorAll(".dz-mast:not([data-dzp])").forEach(m=>{m.dataset.dzp=1;masthead(m)});
}
/* ---------- transitions ---------- */
let last=null;
function stateKey(){
 if(typeof S!=="undefined"&&S&&S.ph)return [S.ph,S.round,S.ph==="vote"?(S.vt&&S.vt.show?"o":"p")+(S.vt&&S.vt.b?S.vt.b.length:""):"",S.ph==="goals"&&S.gi?String(S.gi.show)+S.gi.i:""].join("|");
 if(typeof V!=="undefined"&&V&&V.k)return "p|"+V.k+"|"+(V.round||"");
 return "title";
}
function animate(app){
 const k=stateKey();if(k===last)return;const prev=last;last=k;if(prev===null)return;
 const ch=/^(chapter|break)\|/.test(k)&&!/^(chapter|break)\|/.test(prev||"");
 app.classList.remove("dz-enter","dz-enter-ch");void app.offsetWidth;app.classList.add(ch?"dz-enter-ch":"dz-enter");
 clearTimeout(animate.t);animate.t=setTimeout(()=>app.classList.remove("dz-enter","dz-enter-ch"),1200);
}
let pend=false;
function run(){pend=false;const app=document.getElementById("app")||document.getElementById("phone");if(!app)return;try{decorate(app)}catch(e){}try{animate(app)}catch(e){}}
function schedule(){if(pend)return;pend=true;(window.queueMicrotask||setTimeout)(run)}
function start(){const app=document.getElementById("app")||document.getElementById("phone");if(!app)return;last=null;run();new MutationObserver(schedule).observe(app,{childList:true,subtree:true})}
if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",start);else start();
})();
