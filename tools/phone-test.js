// Real PeerJS link test: one TV context + two phone contexts (separate browser contexts = separate devices).
// Usage: python3 -m http.server 8765 (repo root), npm i playwright-core, then: node phone-test.js
// DZ_BRIDGE=1 swaps the WebRTC transport for a relay through this script (for sandboxes that block WebRTC).
const {chromium}=require("playwright-core");
const OUT=process.env.DZ_SHOTS||"./phone-test-shots/";require("fs").mkdirSync(OUT,{recursive:true});
const URL=process.env.DZ_URL||"http://localhost:8765/";
const sleep=ms=>new Promise(r=>setTimeout(r,ms));
const BRIDGE=process.env.DZ_BRIDGE==="1";const ids={};const INIT=require("fs").readFileSync(__dirname+"/phone-bridge.js","utf8");
async function bridged(page){if(!BRIDGE)return;await page.addInitScript(INIT);
 await page.exposeFunction("__relay",async s=>{const m=JSON.parse(s);if(m.k==="register"){ids[m.id]=page;return}
  const t=ids[m.to];if(!t){if(m.k==="connect")page.evaluate(x=>window.__deliver(x),JSON.stringify({k:"unknown"})).catch(()=>{});return}
  t.evaluate(x=>window.__deliver(x),s).catch(()=>{})})}
(async()=>{
 const b=await chromium.launch({executablePath:process.env.CHROME||"/usr/bin/google-chrome",args:["--no-sandbox","--autoplay-policy=no-user-gesture-required"]});
 const errs=[];const watch=(p,tag)=>{p.on("pageerror",e=>errs.push(tag+": "+e.message));p.on("console",m=>{if(m.type()==="error"&&!/favicon|ERR_|net::/.test(m.text()))errs.push(tag+" console: "+m.text())})};
 const tvc=await b.newContext({viewport:{width:1280,height:900}});const tv=await tvc.newPage();watch(tv,"TV");await bridged(tv);console.log(BRIDGE?"transport: test relay (box Chrome policy blocks WebRTC)":"transport: real PeerJS/WebRTC");
 await tv.goto(URL+"?seed=K7Q2");await tv.evaluate(()=>localStorage.clear());await tv.reload();await tv.waitForTimeout(600);
 const NAMES=["Alex","Priya","Tom","Sam","Mia"];for(const [i,n] of NAMES.entries()){if(i>=4)await tv.evaluate(()=>{const d=document.querySelector("details.dz-more");if(d)d.open=true});await tv.fill("#n"+i,n)}
 await tv.check("#k4");await tv.evaluate(()=>{document.getElementById("dz-mode").value="live"});await tv.check("#dz-insider");
 await tv.screenshot({path:OUT+"01-title-live.png",fullPage:true});
 await tv.click("button.dz-play");
 await tv.waitForFunction(()=>typeof dzPeerState!=="undefined"&&(dzPeerState==="ready"||dzPeerState==="failed"),null,{timeout:30000});
 const state=await tv.evaluate(()=>dzPeerState+" "+(dzPeerErr||""));console.log("TV peer:",state);
 if(!state.startsWith("ready"))throw new Error("TV could not open the phone link: "+state);
 await tv.waitForTimeout(800);await tv.screenshot({path:OUT+"02-tv-lobby-qr.png",fullPage:true});
 const urls=await tv.evaluate(()=>S.pl.map((p,i)=>dzLiveJoinUrl(i)));
 // Alex (adult) and Mia (kid) join with phones; Priya plays on the TV.
 const phones=[];
 for(const [tag,i] of [["Alex",0],["Mia",4]]){
  const c=await b.newContext({viewport:{width:390,height:844},deviceScaleFactor:2,isMobile:true,hasTouch:true});
  const p=await c.newPage();watch(p,"phone-"+tag);await bridged(p);p.on("dialog",d=>d.accept());await p.goto(urls[i]);phones.push({tag,i,p,shots:new Set()});
 }
 await tv.waitForFunction(()=>dzLiveConnected(0)&&dzLiveConnected(4),null,{timeout:30000});
 console.log("both phones connected");
 await sleep(500);await tv.screenshot({path:OUT+"03-tv-lobby-connected.png"});
 await phones[0].p.screenshot({path:OUT+"04-phone-lobby.png"});
 const stats={phoneActs:0,tvSteps:0,phoneOrders:0,phoneVotes:0,phoneGoals:0,phoneReads:0};
 const phoneAct=async ph=>{const r=await ph.p.evaluate(()=>{
   if(typeof V==="undefined"||!V)return null;const v=V,B=t=>[...document.querySelectorAll("#phone button")].find(b=>!b.disabled&&b.textContent.includes(t));
   const k=v.k+(v.locked||v.voted||v.acked||v.read||v.done?"-done":"");
   if(v.k==="goal"&&!v.acked){const x=B("Got it");if(x){x.click();return "goal"}}
   if(v.k==="intel"&&!v.read){const x=B("read my cards");if(x){x.click();return "read"}}
   if(v.k==="orders"&&!v.locked){
     const kid=document.querySelector("#phone .kid button");if(kid&&!document.querySelector("#phone .kid button.on")){kid.click();return "kidpick"}
     const sels=[...document.querySelectorAll("#phone select")];for(const s of sels)if(!s.value){const o=[...s.options].map(o=>o.value).filter(x=>x&&!sels.some(q=>q.value===x));if(o.length){s.value=o[0];s.dispatchEvent(new Event("change"));return "sel"}}
     const l=B("Lock in");if(l){l.click();return "orders"}}
   if(v.k==="vote"&&!v.voted){const o=[...document.querySelectorAll("#phone .opts button")].filter(b=>!b.disabled);if(!document.querySelector("#phone .opts button.on")&&o.length){o[0].click();return "pickvote"}const c=B("Cast my secret");if(c){c.click();return "vote"}}
   if(v.k==="accuse"&&!v.done){const o=document.querySelector("#phone .opts button");if(o){o.click();return "accuse"}}
   return "idle:"+k});
  if(r&&!r.startsWith("idle")){stats.phoneActs++;if(r==="orders")stats.phoneOrders++;if(r==="vote")stats.phoneVotes++;if(r==="goal")stats.phoneGoals++;if(r==="read")stats.phoneReads++}
  return r};
 const tvStep=()=>tv.evaluate(()=>{
  const btns=()=>[...document.querySelectorAll("#app button")].filter(b=>!b.disabled),oc=b=>b.getAttribute("onclick")||"";
  const c=(s,req=true)=>{const x=btns().find(b=>oc(b).includes(s));if(x){x.click();return s}return req?"missing "+s:null};
  const ph=S.ph;
  if(ph==="end")return "end";
  if(ph==="news"){if(S.lobby)return c("dzLiveBegin");if(S.prevPending)return c("S.prevPending=false");if(S.ev&&!S.ev.done){const o=btns().filter(b=>oc(b).includes("dzEventChoose"));o[0].click();return "event"}return c("dzGo('discuss')")}
  if(ph==="discuss"){if(S.lv.read[0]&&S.lv.read[4]){const j=[1,2,3].find(j=>!S.lv.read[j]);if(j!=null)return c("dzLiveShowHand("+j+")");return c("dzGo('decide')")}return "wait-intel"}
  if(ph==="decide"&&S.dl&&!S.dc){if(btns().some(b=>oc(b).includes("dzStartVote")))return c("dzStartVote");c("S.together=1",false);const o=btns().filter(b=>oc(b).startsWith("choose("));if(o.length){o[0].click();return "choose"}return "?"}
  const panel=(S.ph==='vote'&&S.vt.i<0)||(S.ph==='goals'&&S.gi.i<0)||(S.ph==='accuse'&&S.ac.i<0);
  if(panel){const b=btns().find(b=>/S\.(vt|gi|ac)\.i=[123];/.test(oc(b)));if(b){b.click();return "tv-fallback"}return "wait-phones"}
  if(ph==="vote"){if(!S.vt.show)return c("S.vt.show=true");if(!S.vt.sel){btns().find(b=>oc(b).includes("S.vt.sel=")).click();return "sel"}return c("dzCast")}
  if(ph==="vreveal")return c("dzApplyVote");
  if(ph==="goals")return S.gi.show?c("dzGoalNext"):c("S.gi.show=true");
  if(ph==="accuse"){if(!S.ac.show)return c("S.ac.show=true");btns().find(b=>oc(b).includes("dzAccuse(")).click();return "accuse"}
  if(ph==="accrev")return c("S.ph='end'");
  if(ph==="decide"){
   if(!(S.lv.ord[0]&&S.lv.ord[4]))return "wait-orders";
   for(const sel of document.querySelectorAll("select[id^=o_]")){const used=[...document.querySelectorAll("select[id^=o_]")].map(x=>x.value);const o=[...sel.options].map(x=>x.value).slice(1).filter(id=>!used.includes(id)&&TI[id].av()&&have(cost(TI[id]))&&!["cmf","trt"].includes(id));if(o.length&&!sel.value)sel.value=o[0]}
   return c("dz24LockTeam")}
  if(ph==="night")return c("nextRound()");
  return "unknown "+ph});
 const want={goal:"05-phone-secret-goal",intel:"06-phone-cards",orders:"07-phone-orders",vote:"08-phone-secret-vote",accuse:"09-phone-accuse"};
 const tvWant={decide:"10-tv-orders-locked-on-phone",vote:"11-tv-vote-panel",goals:"12-tv-goals-panel",discuss:"13-tv-intel-panel",night:"14-tv-night"};const tvShot=new Set();
 let last="",same=0,t0=Date.now(),reloaded=false;
 while(Date.now()-t0<240000){
  for(const ph of phones){const v=await ph.p.evaluate(()=>typeof V!=="undefined"&&V?V.k+(V.locked||V.voted||V.acked||V.read||V.done?"-done":""):null);
   const base=v&&v.replace("-done","");if(base&&want[base]&&!v.endsWith("-done")&&!ph.shots.has(base)){ph.shots.add(base);
    if(base==="orders"&&ph.tag==="Mia"){await ph.p.screenshot({path:OUT+"07b-phone-kid-orders.png",fullPage:true})}
    else if(ph.tag==="Alex")await ph.p.screenshot({path:OUT+want[base]+".png",fullPage:true})}
   await phoneAct(ph)}
  await sleep(250);
  const ph=await tv.evaluate(()=>S.ph);
  if(tvWant[ph]&&!tvShot.has(ph)){const ok=ph!=="decide"||await tv.evaluate(()=>!!(S.lv.ord[0])&&!(S.dl&&!S.dc));if(ok&&(ph!=="discuss"||await tv.evaluate(()=>!!S.lv.read[0]))){tvShot.add(ph);await tv.screenshot({path:OUT+tvWant[ph]+".png",fullPage:true})}}
  if(!reloaded&&await tv.evaluate(()=>S.round>=2&&S.ph==="decide"&&!(S.dl&&!S.dc))){reloaded=true;
   await phones[0].p.reload();await tv.waitForFunction(()=>dzLiveConnected(0),null,{timeout:20000});
   await phones[0].p.waitForFunction(()=>typeof V!=="undefined"&&V&&V.k==="orders",null,{timeout:20000});console.log("phone reload: rejoined and got its orders view back")}
  const r=await tvStep();stats.tvSteps++;
  if(r==="end")break;
  const key=r+await tv.evaluate(()=>S.ph+S.round);if(key===last){if(++same>60)throw new Error("stuck: "+r)}else same=0;last=key;
  await sleep(150);
 }
 const fin=await tv.evaluate(()=>({ph:S.ph,round:S.round,text:document.getElementById("app").textContent}));
 await tv.screenshot({path:OUT+"14-tv-chronicle-after-live-game.png",fullPage:true});
 console.log("stats",JSON.stringify(stats),"final phase",fin.ph);
 console.log("bad text:",/undefined|NaN/.test(fin.text));
 // reconnect test: reload Alex's phone, it should reconnect with its key
 if(fin.ph==="end"){}
 console.log("errors",errs.length?errs:"none");
 await b.close();process.exit(fin.ph==="end"&&!errs.length?0:1);
})().catch(e=>{console.error("FAIL",e.message);process.exit(2)});
