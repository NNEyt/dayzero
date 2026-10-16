/* Day Zero: presentational artwork only (no game logic).
   An inline SVG icon set for roles, resources and missions, plus ring-shaped threat clocks.
   Runs after each render and swaps known emoji in HUD/role labels for crisp icons. */
(function(){
const P={
 supplies:'<rect x="6" y="4" width="12" height="16" rx="2"/><path d="M6 8h12M6 16h12"/>',
 health:'<path d="M12 20s-7.5-4.6-7.5-10.2A4.3 4.3 0 0 1 12 7.3a4.3 4.3 0 0 1 7.5 2.5C19.5 15.4 12 20 12 20z"/>',
 cohesion:'<circle cx="8" cy="8" r="3"/><circle cx="16" cy="8" r="3"/><path d="M2.5 20c0-3.2 2.5-5.4 5.5-5.4s5.5 2.2 5.5 5.4M10.5 20c0-3.2 2.5-5.4 5.5-5.4s5.5 2.2 5.5 5.4"/>',
 trust:'<path d="M2 20h20M3.5 20v-8.5L8.5 7l5 4.5V20M13.5 20v-6l4-3.5 4 3.5v6"/><path d="M7 20v-4h3v4"/>',
 fuel:'<path d="M5 7.5 7.5 5H17l2 2v13H5z"/><path d="M9 3h5M9 11l6 5.5M15 11l-6 5.5"/>',
 signal:'<rect x="3" y="9" width="18" height="11" rx="2"/><circle cx="15.5" cy="14.5" r="2.5"/><path d="M6 13h4M6 16.5h4M7 9l10-5"/>',
 medkits:'<rect x="3" y="7" width="18" height="13" rx="2"/><path d="M9 7V4.5h6V7M12 10v7M8.5 13.5h7"/>',
 contacts:'<path d="M5 4h3.5l2 5L8 10.5a11 11 0 0 0 5.5 5.5L15 13.5l5 2V19a1.5 1.5 0 0 1-1.5 1.5A15.5 15.5 0 0 1 3.5 5.5 1.5 1.5 0 0 1 5 4z"/>',
 crisis:'<path d="M6 3h12M6 21h12M7.5 3v3.5L12 12l-4.5 5.5V21M16.5 3v3.5L12 12l4.5 5.5V21"/>',
 warmth:'<path d="M12 21a6 6 0 0 0 6-6c0-4.2-3.2-6.4-4.2-10.5C11.6 6.6 10.6 8.6 10.5 11c-1-.8-1.6-1.9-1.8-3C7 9.8 6 12.4 6 15a6 6 0 0 0 6 6z"/>',
 water:'<path d="M12 3.5s6 6.8 6 11a6 6 0 0 1-12 0c0-4.2 6-11 6-11z"/>',
 info:'<circle cx="12" cy="12" r="2"/><path d="M8.2 8.2a5.4 5.4 0 0 0 0 7.6M15.8 8.2a5.4 5.4 0 0 1 0 7.6M5.3 5.3a9.5 9.5 0 0 0 0 13.4M18.7 5.3a9.5 9.5 0 0 1 0 13.4"/>',
 SIG:'<path d="M12 11v10M8.5 21 12 11l3.5 10M9.5 17.5h5"/><circle cx="12" cy="8.5" r="2"/><path d="M7.5 4.5a6.5 6.5 0 0 0 0 8M16.5 4.5a6.5 6.5 0 0 1 0 8"/>',
 QM:'<path d="M3 7.5 12 3.5l9 4v9l-9 4-9-4z"/><path d="M3 7.5l9 4 9-4M12 11.5v9M7.5 5.5l9 4"/>',
 MED:'<circle cx="12" cy="12" r="9"/><path d="M12 7v10M7 12h10"/>',
 LOC:'<circle cx="7.5" cy="12" r="4"/><path d="M11.5 12H21M17.5 12v3.5M20.5 12v2.5"/>',
 RUN:'<path d="M13.5 3 5 14h6.5l-1.5 7L18.5 10H12z"/>',
 HST:'<path d="M5 10.5h12V15a5 5 0 0 1-5 5h-2a5 5 0 0 1-5-5z"/><path d="M17 11.5h1.2a2.6 2.6 0 0 1 0 5.2H17M5 12.5 2.5 9.5M9 10.5V8.5h4v2M11 6.5v2"/>',
 MEC:'<path d="M14.7 6.3a4.5 4.5 0 0 0 5.8 5.8l-8.8 8.8a2.4 2.4 0 0 1-3.4-3.4l8.8-8.8a4.5 4.5 0 0 0-2.4-2.4z"/><path d="M14.7 6.3 17 4"/>',
 LIA:'<path d="M3 21h18M5 21v-10M9.5 21v-10M14.5 21v-10M19 21v-10M2.5 11h19L12 4z"/>',
 vote:'<path d="M4 12h16v8H4zM8 12V5h8v7M10.5 8.5h3"/>',
 goal:'<circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="5"/><circle cx="12" cy="12" r="1.5"/>'
};
const svg=(k,cls)=>'<svg class="dz-ico'+(cls?" "+cls:"")+'" viewBox="0 0 24 24" aria-hidden="true" focusable="false">'+P[k]+'</svg>';
window.dzIcon=svg;
const BASE={"🥫":"supplies","❤️":"health","🤝":"cohesion","🏘️":"trust","⛽":"fuel","📻":"signal","✚":"medkits","🏠":"contacts","⏳":"crisis","🔥":"warmth","💧":"water"};
const HUB=Object.assign({},BASE,{"📻":"info"});
const ROLE={"📻":"SIG","📦":"QM","✚":"MED","🏠":"LOC","👟":"RUN","🫖":"HST","🔧":"MEC","🏛️":"LIA","🏛":"LIA"};
const KEYS=m=>new RegExp("("+Object.keys(m).sort((a,b)=>b.length-a.length).map(k=>k.replace(/[.*+?^${}()|[\]\\]/g,"\\$&")).join("|")+")\uFE0F?","g");
const RX={base:KEYS(BASE),hub:KEYS(HUB),role:KEYS(ROLE)};
const MAPS={base:BASE,hub:HUB,role:ROLE};
function swapText(el,kind){
 const w=document.createTreeWalker(el,NodeFilter.SHOW_TEXT),nodes=[];let n;
 while((n=w.nextNode()))if(RX[kind].test(n.nodeValue)){RX[kind].lastIndex=0;nodes.push(n)}
 nodes.forEach(t=>{const span=document.createElement("span");
  span.innerHTML=t.nodeValue.replace(/[<>&]/g,c=>({"<":"&lt;",">":"&gt;","&":"&amp;"}[c])).replace(RX[kind],(m,k)=>svg(MAPS[kind][k]||MAPS[kind][k.replace("\uFE0F","")]));
  t.replaceWith(...span.childNodes)});
}
function ring(clk){
 const segs=[...clk.querySelectorAll("i")],n=segs.length;if(!n)return;
 const unknown=segs.every(i=>i.textContent==="?"),on=segs.filter(i=>i.classList.contains("on")).length,fresh=segs.findIndex(i=>i.classList.contains("dz-newpip"));
 const r=20,c=24,gap=n>1?10:0;let paths="";
 for(let i=0;i<n;i++){const a0=(-90+i*360/n+gap/2)*Math.PI/180,a1=(-90+(i+1)*360/n-gap/2)*Math.PI/180;
  const x0=c+r*Math.cos(a0),y0=c+r*Math.sin(a0),x1=c+r*Math.cos(a1),y1=c+r*Math.sin(a1),large=(360/n-gap)>180?1:0;
  paths+='<path class="'+(unknown?"q":i<on?"on":"off")+(i===fresh?" fresh":"")+'" d="M'+x0.toFixed(2)+" "+y0.toFixed(2)+"A"+r+" "+r+" 0 "+large+" 1 "+x1.toFixed(2)+" "+y1.toFixed(2)+'"/>'}
 const label=unknown?"?":on+"/"+n,hot=!unknown&&on>=n-1&&n>1;
 const el=document.createElement("span");el.className="dz-ring"+(hot?" hot":"")+(unknown?" unknown":"");el.setAttribute("role","img");
 el.setAttribute("aria-label",unknown?"Clock hidden":"Clock "+on+" of "+n+(hot?", nearly full":""));
 el.innerHTML='<svg viewBox="0 0 48 48" aria-hidden="true">'+paths+'<text x="24" y="28.5" text-anchor="middle">'+label+'</text></svg><span class="dz-ring-cap">'+(unknown?"Clock: unknown":hot?"Nearly full!":"Clock "+on+" of "+n)+'</span>';
 clk.classList.add("dz-clk-ringed");clk.setAttribute("aria-hidden","true");clk.parentNode.insertBefore(el,clk);
}
function decorate(root){
 root=root||document.getElementById("app")||document.getElementById("phone");if(!root)return;
 root.querySelectorAll(".trk:not([data-dza]),[data-trk]:not(.trk):not([data-dza])").forEach(e=>{e.dataset.dza=1;swapText(e,"base")});
 root.querySelectorAll(".hb:not([data-dza])").forEach(e=>{e.dataset.dza=1;swapText(e,"hub")});
 root.querySelectorAll(".pn.c > div:not([data-dza])").forEach(e=>{if(e.querySelector("[data-trk]")){e.dataset.dza=1;e.classList.add("dz-assets");swapText(e,"base")}});
 root.querySelectorAll(".dz24-role-icon:not([data-dza]),.dz24-order-role-head:not([data-dza]),.dz24-player-roles:not([data-dza]),#phone .subtitle:not([data-dza]),#phone .slot h3:not([data-dza])").forEach(e=>{e.dataset.dza=1;swapText(e,"role")});
 root.querySelectorAll(".clk:not(.dz-clk-ringed)").forEach(ring);
}
window.dzDecorate=decorate;
let pend=false;
function schedule(){if(pend)return;pend=true;(window.queueMicrotask||setTimeout)(()=>{pend=false;try{decorate()}catch(e){}})}
function start(){const app=document.getElementById("app")||document.getElementById("phone");if(!app)return;decorate(app);new MutationObserver(schedule).observe(app,{childList:true,subtree:true})}
if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",start);else start();
})();
