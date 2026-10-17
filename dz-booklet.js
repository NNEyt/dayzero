/* Day Zero: the "rules booklet" look (loaded last, after dz-polish.js). Presentation only.
   - running head on every inner page, cover/paper switch on <body>
   - strips emoji from the interface so it reads like print (the share text keeps its emoji)
   - numbers and captions the framed art panels */
(function(){
 const EMOJI=/(?:[\u{1F000}-\u{1FAFF}]|[\u{2600}-\u{2604}\u{2607}-\u{2712}\u{2719}-\u{27BF}]|[\u{2300}-\u{23FF}]|[\u{2B00}-\u{2BFF}]|\u{FE0F}|\u{200D}|\u{20E3})+\s?/gu;
 const HAS=new RegExp(EMOJI.source,"u");
 const SKIP=/^(TEXTAREA|SCRIPT|STYLE|SVG|svg|text|title)$/;
 function strip(root){
  if(!root)return;const w=document.createTreeWalker(root,NodeFilter.SHOW_TEXT,{acceptNode:n=>{
   for(let p=n.parentNode;p&&p!==root;p=p.parentNode){if(SKIP.test(p.nodeName)||(p.hasAttribute&&p.hasAttribute("data-keep-emoji")))return NodeFilter.FILTER_REJECT}
   return HAS.test(n.nodeValue)?NodeFilter.FILTER_ACCEPT:NodeFilter.FILTER_SKIP}});
  const list=[];let n;while((n=w.nextNode()))list.push(n);
  for(const t of list){EMOJI.lastIndex=0;const v=t.nodeValue.replace(EMOJI,"");if(v!==t.nodeValue)t.nodeValue=v.replace(/^\s+(?=\S)/,m=>t.previousSibling?m:"")}
 }
 window.dzBkStrip=strip;
 const ROMAN=["I","II","III","IV","V","VI","VII","VIII","IX","X","XI","XII","XIII","XIV","XV","XVI"];
 function decorate(app){
  // framed art: corner number tab + caption
  let i=0;
  app.querySelectorAll(".art").forEach(a=>{
   if(a.closest(".dz-portrait,.dz24-role-icon"))return;
   i++;a.setAttribute("data-no",String(i));
   if(!a.hasAttribute("data-cap")){
    const head=a.closest(".dz21-page");
    if(head){const sp=head.querySelector(".dz21-head span");if(sp)a.setAttribute("data-cap",sp.textContent.trim())}
   }
  });
  app.querySelectorAll(".dz21-head").forEach(h=>{if(!h.querySelector(".bk-orn"))h.insertAdjacentHTML("beforeend",'<div class="bk-orn" aria-hidden="true"><i></i><b></b><i></i></div>')});
  strip(app);
 }
 // the sound toggle becomes a printed speaker glyph
 if(typeof window.dzMuteBtn==="function"){const base=window.dzMuteBtn;window.dzMuteBtn=function(){base();const b=document.getElementById("dz-mute");if(!b)return;
  const m=typeof dzMuted==="function"&&dzMuted();
  b.innerHTML='<svg viewBox="0 0 24 24" aria-hidden="true"><path class="cone" d="M4 9.5h3.5L12 5.5v13l-4.5-4H4z"/>'+(m?'<path d="M16 9.5l5 5M21 9.5l-5 5"/>':'<path d="M15.5 9a4 4 0 0 1 0 6M18 6.5a7.5 7.5 0 0 1 0 11"/>')+'</svg>'};
  try{if(document.getElementById("dz-mute"))window.dzMuteBtn()}catch(e){}}
 function screen(){
  const S_=typeof S!=="undefined"?S:null;
  const b=document.body;if(!b)return;
  const scr=!S_?"title":S_.lobby?"lobby":S_.ph;
  b.classList.add("bk");b.setAttribute("data-screen",scr);
  const app=document.getElementById("app");if(!app)return;
  if(S_&&typeof dzDayLabel==="function"){
   let beat="";try{const ph={vote:"decide",vreveal:"decide"}[S_.ph]||S_.ph,x=(typeof DZ_BEATS!=="undefined"?DZ_BEATS:[]).find(x=>x[0]===ph);beat=x?x[2]+" · "+x[1]:S_.ph==="end"?"The Chronicle":S_.ph==="goals"?"Private Goals":S_.ph==="accuse"||S_.ph==="accrev"?"The Accusation":""}catch(e){}
   let day="";try{day=S_.ph==="end"?"The End":dzDayLabel()}catch(e){}
   app.setAttribute("data-rh-l","Day Zero"+(S_.ep?" · Episode "+S_.ep:""));
   app.setAttribute("data-rh-r",[day,beat].filter(Boolean).join(" · "));
   let n=1;try{n=dzDayNo()}catch(e){}
   app.setAttribute("data-folio",S_.ph==="end"?"Fin":String(n));
  }else{app.removeAttribute("data-rh-l");app.removeAttribute("data-rh-r");app.removeAttribute("data-folio")}
 }
 let busy=false,queued=false;
 function run(){queued=false;if(busy)return;busy=true;try{screen();const app=document.getElementById("app")||document.getElementById("phone");if(app)decorate(app);
  ["dz-toast","dz-mute","dz-skip"].forEach(id=>{const e=document.getElementById(id);if(e&&id!=="dz-mute")strip(e)})}finally{setTimeout(()=>busy=false,0)}}
 function schedule(){if(!queued){queued=true;(window.requestAnimationFrame||setTimeout)(run)}}
 function start(){const app=document.getElementById("app")||document.getElementById("phone");if(!app)return;document.body.classList.add("bk");run();
  new MutationObserver(schedule).observe(app,{childList:true,subtree:true,characterData:true})}
 if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",start);else start();
})();
