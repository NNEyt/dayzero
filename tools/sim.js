// Day Zero headless simulator: plays complete games in jsdom by pressing the real buttons.
// usage: node sim.js N [smart|random] [filter-json]
//   env DZ_FORCE='{"DL1":"keep","DL2":"ref","card":0}'  force dilemma options / story-card choices (branch tests)
//   env DZ_PLAYERS='[1,2,...]'  player counts (default 1–8)
//   env DZ_SUITE=campaign      play full 3-episode campaigns instead of single games
//   env DZ_URL=http://localhost:8765/   where the site is served
// Live mode (phone controllers) uses an in-memory fake PeerJS: simulated phones answer
// the TV's messages asynchronously, some players have no phone, and phones drop out at random.
const {JSDOM,VirtualConsole}=require("jsdom");
const N=+process.argv[2]||3,POLICY=process.argv[3]||"smart",ONLY=process.argv[4]?JSON.parse(process.argv[4]):{};
const BASE=process.env.DZ_URL||"http://localhost:8765/",SUITE=process.env.DZ_SUITE||"games";
const BAD=/undefined|NaN|\[object|\{WATER_WHEN\}/;
// player-facing wording that the Day-by-Day structure retired
const OLDTERM=/\b[Cc]hapters?\b|\bRounds?\b|\b(?:[Tt]his|[Ee]ach|[Ee]very|[Nn]ext|[Ff]inal|[Ll]ater|[Pp]er|[Ss]ame) rounds?\b|Quick Night/;
const DAYPH=["news","discuss","decide","night"];
// DZ_FORCE='{"DL1":"keep","DL2":"ref","card":1}' forces dilemma options (decided together) and story-card choices
const FORCE=process.env.DZ_FORCE?JSON.parse(process.env.DZ_FORCE):{};
// DZ_EXPECT='["Sam on the Radio","A Door Closes"]'  text that must appear somewhere in a (full-length) game
const EXPECT=process.env.DZ_EXPECT?JSON.parse(process.env.DZ_EXPECT):[];
async function openGame(errs){
 const vc=new VirtualConsole();vc.on("jsdomError",e=>errs.push(e.message));vc.on("error",e=>errs.push(String(e)));
 const dom=await JSDOM.fromURL(BASE+"index.html",{runScripts:"dangerously",resources:"usable",virtualConsole:vc,pretendToBeVisual:true,beforeParse(w){w.scrollTo=()=>{}}});
 await new Promise(r=>dom.window.addEventListener("load",r));
 return dom.window;
}
function makeNet(w,rnd,cfg,stats){
 // fake PeerJS host + fake phones
 const net={host:null,phones:{},queue:[]};
 w.Peer=class{constructor(id){this.id=id;this.h={};this.destroyed=false;net.host=this;setTimeout(()=>this.h.open&&this.h.open(),0)}on(e,f){this.h[e]=f}destroy(){this.destroyed=true}reconnect(){}};
 net.join=(p,key)=>{
  const hc={open:true,h:{},on(e,f){this.h[e]=f},send(m){net.queue.push(()=>phone.recv(m))},close(){if(!this.open)return;this.open=false;this.h.close&&this.h.close()}};
  const phone={p,hc,views:0,recv(m){if(m.t==="view"){this.views++;this.v=m.v;this.act()}},
   say(m){net.queue.push(()=>{if(hc.open&&hc.h.data)hc.h.data(m)})},
   act(){const v=this.v;if(!v)return;
    if(v.k==="intel"&&!v.read)this.say({t:"read",round:v.round});
    else if(v.k==="goal"&&!v.acked)this.say({t:"goalack"});
    else if(v.k==="orders"&&!v.locked){const ord={};for(const s of v.slots){const ids=[...new Set(s.opts.map(o=>o.id))];const pick=[];for(let i=0;i<s.n;i++){const c=ids.filter(x=>!pick.includes(x));if(c.length&&rnd()<0.9)pick.push(c[Math.floor(rnd()*c.length)])}ord[s.r]=pick}
     if(rnd()<0.1)ord[v.slots[0].r]=["notAnAction"];this.say({t:"orders",round:v.round,ord});stats.phoneOrders++}
    else if(v.k==="vote"&&!v.voted){const o=v.d.opts.filter(x=>!x.dis);const x=(v.extra||[]);this.say({t:"ballot",dl:v.dl,opt:o[Math.floor(rnd()*o.length)].id,x:x.length?x[Math.floor(rnd()*x.length)].v:""});stats.phoneVotes++}
    else if(v.k==="accuse"&&!v.done){const l=v.list;this.say({t:"accuse",j:l[Math.floor(rnd()*l.length)].j})}
   }};
  net.phones[p]=phone;
  net.host.h.connection(hc);phone.say({t:"hello",p,k:key});
  return phone;
 };
 net.flush=()=>{let n=0;while(net.queue.length&&n++<500)net.queue.shift()()};
 return net;
}
async function playOne(w,cfg,rnd,res,episodeBtn){
 const doc=w.document,errs=res.errs,E=x=>w.eval(x),app=()=>doc.getElementById("app");
 const btns=()=>[...app().querySelectorAll("button")].filter(b=>!b.disabled);
 let clicks=0;
 const click=(sub,req=true)=>{const b=btns().find(b=>(b.getAttribute("onclick")||"").includes(sub));if(b){b.click();clicks++;return true}if(req)throw new Error("no button "+sub+" in phase "+E("S&&S.ph"));return false};
 let net=null;
 if(cfg.mode==="live"){net=w.__net||(w.__net=makeNet(w,rnd,cfg,res.st))}
 if(episodeBtn)episodeBtn();else{
  const names=["Alex","Sam","Jo","Kim","Lee","Ash","Max","Ivy"].slice(0,cfg.players);
  names.forEach((n,i)=>{doc.getElementById("n"+i).value=n;doc.getElementById("k"+i).checked=!!(cfg.kids&&i>=cfg.players-cfg.kids)});
  doc.getElementById("dz-mode").value=cfg.mode;doc.getElementById("dz-diff").value=cfg.diff;
  const lr=doc.querySelector('input[name="dzlen"][value="'+cfg.len+'"]');if(lr)lr.checked=true;
  doc.getElementById("dz-insider").checked=cfg.insider;doc.getElementById("dz-goals").checked=cfg.goals;doc.getElementById("dz-vote").checked=cfg.vote;
  if(cfg.episode)E("dzCampPlay("+cfg.episode+")");else click("go()");
 }
 await new Promise(r=>setTimeout(r,5));
 if(net){const keys=JSON.parse(E("JSON.stringify(S.lv.keys)"));keys.forEach((k,p)=>{if(p%3!==2&&!net.phones[p])net.join(p,k)});await new Promise(r=>setTimeout(r,5));net.flush()}
 let coldWords=0,coldClicks=null,coldDone=false,same=0,lastKey="",guard=0,lastView="",seenDay=new Set(),allText="";
 const S_has_track=()=>!!app().querySelector(".dz-track");
 const st=res.st;
 while(guard++<900){
  if(net){
   net.flush();
   // random drop-outs and re-joins
   if(rnd()<0.01){const ps=Object.keys(net.phones);if(ps.length){const p=ps[Math.floor(rnd()*ps.length)];net.phones[p].hc.close();delete net.phones[p];st.drops++}}
   if(rnd()<0.02){const keys=JSON.parse(E("JSON.stringify(S.lv.keys)"));const p=Math.floor(rnd()*keys.length);if(!net.phones[p]){net.join(p,keys[p]);net.flush();st.rejoins++}}
  }
  const ph=E("S?S.ph:'title'");if(ph==="title")throw new Error("back at title");
  const txt=app().textContent;st.screens++;
  if(BAD.test(txt))res.bad.add(ph+":"+(txt.match(/.{0,40}(undefined|NaN|\[object|\{WATER_WHEN\}).{0,20}/)||[""])[0]);
  if(EXPECT.length)allText+=" "+txt;
  {const m=txt.match(OLDTERM);if(m)res.bad.add("old wording on "+ph+": "+txt.slice(Math.max(0,m.index-30),m.index+30).replace(/\s+/g," "));}
  {const vk=ph+"|"+E("S.round")+"|"+(ph==="vote"?E("S.vt.show+''+S.vt.b.length"):ph==="goals"?E("S.gi.show+''+S.gi.i"):ph==="accuse"?E("S.ac.show+''+Object.keys(S.ac.b).length"):E("S.lobby||S.prevPending?'pre':''"));if(vk!==lastView){if(process.env.DZ_VDBG)console.log("VIEW",vk);lastView=vk;st.views++;if(!["vote","vreveal","goals","accuse","accrev","end"].includes(ph)){const dk=E("S.round")+ph+(E("S.lobby||S.prevPending")?"pre":"");if(!seenDay.has(dk)){seenDay.add(dk);st.dayViews++}}}}
  if(net)for(const p in net.phones){const v=JSON.stringify(net.phones[p].v||{});if(BAD.test(v.replace(/"(undefined)"/g,"")))res.bad.add("phone view:"+v.slice(0,120))}
  if(!coldDone){coldWords+=txt.split(/\s+/).filter(Boolean).length;if(ph==="decide"&&E("!(S.dl&&!S.dc)")){coldDone=true;coldClicks=clicks}}
  if(ph==="end")break;
  const key=ph+E("S.round")+E("S.pi")+E("JSON.stringify([S.show,S.vt,S.gi,S.ac,S.ev&&S.ev.done,S.dc,S.lobby,S.prevPending,S.lv&&S.lv.read])");
  if(key===lastKey){if(++same>4)throw new Error("stuck in "+ph+(process.env.DZ_DEBUG?" ep="+E("S.ep")+" round="+E("S.round")+" btns="+btns().map(b=>b.getAttribute("onclick")).join("|")+" errs="+errs.slice(-3).join(" ; "):""))}else same=0;lastKey=key;
  if(DAYPH.includes(ph)&&!E("!!S.lobby||!!S.prevPending")&&!S_has_track())errs.push("no story track on "+ph);
  if(ph==="news"){
   if(E("!!S.lobby"))click("dzLiveBegin");
   else if(E("!!S.prevPending")){if(!app().innerHTML.includes("Previously on"))errs.push("no previously-on screen");res.st.prev++;click("S.prevPending=false")}
   else if(E("!!(S.ev&&!S.ev.done)")){const o=btns().filter(b=>(b.getAttribute("onclick")||"").includes("dzEventChoose"));const story=E("!!dzEventById(S.ev.id).story");
    let pick=o[Math.floor(rnd()*o.length)];const fi=story&&FORCE.card!==undefined?o.find(b=>b.getAttribute("onclick")==="dzEventChoose("+FORCE.card+")"):null;if(fi)pick=fi;
    if(story)st.storyCards++;pick.click();clicks++;st.events++}
   else{if(E("dzRoundIdx()>0")&&!app().innerHTML.includes("Previously…")&&E("!!S.prevDay"))errs.push("no Previously recap on day "+E("dzDayNo()"));click("dzGo('discuss')")}
  }
  else if(ph==="discuss"){
   if(net&&rnd()<0.3){const unread=JSON.parse(E("JSON.stringify(S.pl.map((p,j)=>j).filter(j=>!S.lv.read[j]))"));const b=btns().find(b=>unread.some(j=>(b.getAttribute("onclick")||"")==="dzLiveShowHand("+j+")"));if(b){b.click();continue}}
   click("dzGo('decide')")}
  else if(ph==="decide"&&E("!!S.dl&&!S.dc")){
   const forced=FORCE[E("S.dl")];
   if(!forced&&btns().some(b=>(b.getAttribute("onclick")||"").includes("dzStartVote"))&&rnd()<0.85){click("dzStartVote");st.votes++}
   else{click("S.together=1",false);
    if(E("!!S.dl&&!S.dc")){const o=btns().filter(b=>(b.getAttribute("onclick")||"").startsWith("choose("));if(!o.length)throw new Error("no dilemma options");
     let pick=o[Math.floor(rnd()*o.length)];if(forced){const f=o.find(b=>b.getAttribute("onclick")==="choose('"+forced+"')");if(f)pick=f}pick.click();clicks++}}
  }
  else if(["vote","goals","accuse"].includes(ph)&&E("(S.vt&&S.ph==='vote'&&S.vt.i<0)||(S.ph==='goals'&&S.gi.i<0)||(S.ph==='accuse'&&S.ac.i<0)")){
   // live panel: wait for phones, or use the TV for someone without one
   const onTV=btns().filter(b=>/S\.(vt|gi|ac)\.i=\d/.test(b.getAttribute("onclick")||""));
   const waiting=net?Object.keys(net.phones).length:0;
   if(onTV.length&&(rnd()<0.5||!waiting||same>1)){onTV[Math.floor(rnd()*onTV.length)].click();st.tvFallback++}
  }
  else if(ph==="vote"){
   if(!E("S.vt.show"))click("S.vt.show=true");
   else if(!E("S.vt.sel")){const o=btns().filter(b=>(b.getAttribute("onclick")||"").includes("S.vt.sel="));o[Math.floor(rnd()*o.length)].click();clicks++}
   else{const x=doc.getElementById("dz-x");if(x){const os=[...x.options].map(o=>o.value);x.value=os[Math.floor(rnd()*os.length)]}click("dzCast")}
  }
  else if(ph==="vreveal")click("dzApplyVote");
  else if(ph==="goals"){E("S.gi.show")?click("dzGoalNext"):click("S.gi.show=true")}
  else if(ph==="accuse"){
   if(!E("S.ac.show"))click("S.ac.show=true");
   else{const o=btns().filter(b=>(b.getAttribute("onclick")||"").includes("dzAccuse("));
    const ins=E("S.insider"),me=E("S.ac.i");let pick=o[Math.floor(rnd()*o.length)];
    if(rnd()<0.5&&me!==ins){const t=o.find(b=>b.getAttribute("onclick")==="dzAccuse("+ins+")");if(t)pick=t}
    pick.click();clicks++}
  }
  else if(ph==="accrev")click("S.ph='end'");
  else if(ph==="decide"){
   if(net&&same===0&&Object.keys(net.phones).length&&rnd()<0.7)continue; // give phones a moment
   for(const sel of app().querySelectorAll("select[id^=o_]")){const o=[...sel.options].map(x=>x.value);
    let v;const used=[...app().querySelectorAll("select[id^=o_]")].map(x=>x.value);
    if(POLICY==="smart"){const good=o.slice(1).filter(id=>!used.includes(id)&&E(`TI["${id}"].av()&&have(cost(TI["${id}"]))&&!["cmf","trt"].includes("${id}")`));const pool=good.length?good:o.slice(1).filter(id=>!used.includes(id));v=pool[Math.floor(rnd()*pool.length)]||""}
    else v=o[1+Math.floor(rnd()*(o.length-1))]||"";sel.value=v}
   for(const r of E("dzRoles().filter(dzIsKid)")){const o=btns().filter(b=>(b.getAttribute("onclick")||"").startsWith("dzKidPick('"+r+"'"));if(o.length&&rnd()<0.95)o[Math.floor(rnd()*o.length)].click()}
   click("dz24LockTeam");
  }
  else if(ph==="night"){JSON.parse(E("JSON.stringify(S.report||[])")).forEach(r=>r.status==="blocked"?st.blocked++:st.done++);
   if(!app().querySelector(".dz-cliff")&&E("!S.broke"))errs.push("night without cliffhanger on day "+E("dzDayNo()"));
   st.days++;click("nextRound()")}
  else throw new Error("unknown phase "+ph);
  await null;
 }
 if(E("S.ph")!=="end")throw new Error("did not finish, stuck at "+E("S.ph"));
 const html=app().innerHTML;
 if(!html.includes("Mill Lane Chronicle"))errs.push("no chronicle");
 if(BAD.test(app().textContent))res.bad.add("end:"+(app().textContent.match(/.{0,40}(undefined|NaN).{0,20}/)||[""])[0]);
 const line=E("dzEmojiLine()");if(BAD.test(line))errs.push("bad emoji line "+line);
 const z=JSON.parse(E("JSON.stringify(ending())"));
 allText+=" "+app().textContent;if(!E("S.broke"))for(const x of EXPECT)if(!allText.includes(x))errs.push("expected text missing: "+x);
 return {ending:z.e[0],stars:z.m+z.p+z.c,broke:E("S.broke")||null,seed:E("S.seed"),caught:E("S.caught||false"),insider:E("S.insider"),sab:E("S.sab.length"),
  goals:JSON.parse(E("JSON.stringify(dzGoalResults().map(g=>({k:g.key||'insider',met:g.met})))")),
  fin:JSON.parse(E("JSON.stringify({t:S.t,a:S.a,found:dzFoundCount(),hub:S.hub})")),coldWords,coldClicks,ex:E("S.v.extra.map(e=>e.id).join(',')"),
  phonesIn:net?Object.keys(net.phones).length:0};
}
async function game(cfg,seedNum){
 const res={cfg,errs:[],bad:new Set(),st:{blocked:0,done:0,votes:0,events:0,screens:0,views:0,dayViews:0,days:0,storyCards:0,phoneOrders:0,phoneVotes:0,drops:0,rejoins:0,tvFallback:0,prev:0}};
 let s=seedNum;const rnd=()=>{s=(s*1103515245+12345)%2147483648;return s/2147483648};
 const w=await openGame(res.errs);
 if(SUITE==="campaign"){
  w.localStorage.removeItem("dz_campaign");
  const eps=[];
  for(let ep=1;ep<=3;ep++){
   const out=await playOne(w,Object.assign({},cfg,{episode:ep===1?1:0,len:"ep"+ep}),rnd,res,ep===1?null:()=>{const b=[...w.document.querySelectorAll("#app button")].find(b=>(b.getAttribute("onclick")||"")==="dzCampPlay("+ep+")");if(!b)throw new Error("no next-episode button for ep"+ep);b.click()});
   out.ep=w.eval("S.ep");out.carried=w.eval("JSON.stringify(S.carried||[])");eps.push(out);
   if(out.ep!==ep)res.errs.push("expected episode "+ep+" got "+out.ep);
  }
  const camp=JSON.parse(w.localStorage.getItem("dz_campaign"));
  if(!camp||camp.eps.length!==3)res.errs.push("campaign not recorded");
  if(!w.document.getElementById("app").innerHTML.includes("CAMPAIGN COMPLETE"))res.errs.push("no campaign summary");
  res.eps=eps;res.camp=camp;res.stars=eps.reduce((a,e)=>a+e.stars,0);
 }else Object.assign(res,await playOne(w,cfg,rnd,res));
 res.bad=[...res.bad];w.close();return res;
}
(async()=>{
 const cfgs=[],P=process.env.DZ_PLAYERS?JSON.parse(process.env.DZ_PLAYERS):[1,2,3,4,5,6,7,8];
 if(SUITE==="campaign"){for(const players of P)for(const mode of ["tv","live"])for(const diff of ["easy","normal","hard"]){const c={diff,mode,players,insider:players>=3&&players%2===1,goals:true,vote:true,kids:players>=5?1:0,campaign:true};if(Object.entries(ONLY).every(([k,v])=>c[k]===v))cfgs.push(c)}}
 else{
  for(const diff of ["easy","normal","hard"])for(const len of ["full","quick"])for(const mode of ["tv","phones","live"])for(const insider of [false,true])for(const players of P){
   if(insider&&players<3)continue;const c={diff,len,mode,insider,players,goals:true,vote:true,kids:players>=5?(players%2?1:2):0};
   if(Object.entries(ONLY).every(([k,v])=>c[k]===v))cfgs.push(c)}
  if(!Object.keys(ONLY).length){cfgs.push({diff:"normal",len:"full",mode:"tv",insider:false,players:3,goals:false,vote:false,kids:0});cfgs.push({diff:"hard",len:"quick",mode:"live",insider:true,players:8,goals:false,vote:true,kids:2})}
 }
 if(process.env.DZ_CFG){cfgs.length=0;cfgs.push(JSON.parse(process.env.DZ_CFG))}
 const res=[];let g=Number(process.env.DZ_G0||0);
 for(const cfg of cfgs)for(let i=0;i<N;i++){g++;try{res.push(await game(cfg,g*7919+i))}catch(e){res.push({cfg,fatal:e.message})}}
 const ok=res.filter(r=>!r.fatal),fat=res.filter(r=>r.fatal);
 console.log("suite",SUITE,"policy",POLICY,"configs",cfgs.length,"runs",res.length,"fatal",fat.length);
 const fm={};fat.forEach(r=>fm[r.fatal]=(fm[r.fatal]||0)+1);if(fat.length)console.log("fatal kinds",fm);
 const errs={};ok.forEach(r=>r.errs.concat(r.bad.map(b=>"bad text "+b)).forEach(e=>errs[e]=(errs[e]||0)+1));console.log("errors",errs);
 const sum=k=>ok.reduce((a,r)=>a+(r.st[k]||0),0);
 console.log("phone orders",sum("phoneOrders"),"phone votes",sum("phoneVotes"),"drops",sum("drops"),"rejoins",sum("rejoins"),"tv fallbacks",sum("tvFallback"),"previously-on screens",sum("prev"));
 if(SUITE==="campaign"){
  const by={};ok.forEach(r=>{const k=r.cfg.players+"p/"+r.cfg.diff;(by[k]=by[k]||[]).push(r.stars)});
  console.log("campaign total stars (of 27) by players/diff",Object.fromEntries(Object.entries(by).map(([k,a])=>[k,(a.reduce((x,y)=>x+y,0)/a.length).toFixed(1)])));
  const fl={};ok.forEach(r=>Object.entries(r.camp.flags).forEach(([k,v])=>{const kk=k+"="+(Array.isArray(v)?v.length:v);fl[kk]=(fl[kk]||0)+1}));console.log("final campaign flags",fl);
  const car={};ok.forEach(r=>r.eps.slice(1).forEach(e=>JSON.parse(e.carried).forEach(c=>car[c[0]]=(car[c[0]]||0)+1)));console.log("carried effects seen",car);
  require("fs").writeFileSync(process.env.DZ_OUT||"sim-results.json",JSON.stringify(res,null,1));return;
 }
 const grp=f=>{const m={};ok.forEach(r=>{const k=f(r);(m[k]=m[k]||[]).push(r)});return m};
 const summ=a=>({n:a.length,stars:(a.reduce((x,r)=>x+r.stars,0)/a.length).toFixed(2),collapse:(100*a.filter(r=>r.broke).length/a.length).toFixed(0)+"%",best:(100*a.filter(r=>r.ending==="The Lights of Mill Lane").length/a.length).toFixed(0)+"%"});
 for(const k of ["diff","len","mode","insider","players"]){const m=grp(r=>r.cfg[k]);console.log("by "+k,JSON.stringify(Object.fromEntries(Object.entries(m).map(([a,b])=>[a,summ(b)]))))}
 const ins=ok.filter(r=>r.cfg.insider);if(ins.length)console.log("insider games",ins.length,"caught",ins.filter(r=>r.caught).length,"avg sabotage",(ins.reduce((x,r)=>x+r.sab,0)/ins.length).toFixed(2));
 const gm={};ok.forEach(r=>r.goals.forEach(g=>{gm[g.k]=gm[g.k]||[0,0];gm[g.k][1]++;if(g.met)gm[g.k][0]++}));console.log("goal hit rates",JSON.stringify(Object.fromEntries(Object.entries(gm).map(([k,v])=>[k,Math.round(100*v[0]/v[1])+"%/"+v[1]]))));
 const cold=ok.filter(r=>r.coldClicks!=null&&r.cfg.mode!=="live");if(cold.length)console.log("cold open (tv/phones): avg clicks to first orders",(cold.reduce((x,r)=>x+r.coldClicks,0)/cold.length).toFixed(1),"avg words",Math.round(cold.reduce((x,r)=>x+r.coldWords,0)/cold.length));
 console.log("days played",sum("days"),"distinct screens per Day (excluding votes/goals/accusation)",(sum("dayViews")/Math.max(1,sum("days"))).toFixed(2),"story cards",sum("storyCards"));
 console.log("avg votes/game",(sum("votes")/ok.length).toFixed(2),"avg crossroads/game",(sum("events")/ok.length).toFixed(2),"avg screens",Math.round(sum("screens")/ok.length));
 require("fs").writeFileSync(process.env.DZ_OUT||"sim-results.json",JSON.stringify(res,null,1));
})();
