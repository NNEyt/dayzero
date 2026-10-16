// Headless sim for the upgraded index.html: drives the real buttons where it can.
// usage: node sim.js N policy(random|smart) [filter json]
const {JSDOM,VirtualConsole}=require("jsdom");
const N=+process.argv[2]||40, POLICY=process.argv[3]||"smart", ONLY=process.argv[4]?JSON.parse(process.argv[4]):{};
const BASE=process.env.DZ_URL||"http://localhost:8765/";
async function game(cfg,seedNum){
 const errs=[];const vc=new VirtualConsole();vc.on("jsdomError",e=>errs.push(e.message));vc.on("error",e=>errs.push(String(e)));
 const dom=await JSDOM.fromURL(BASE+"index.html",{runScripts:"dangerously",resources:"usable",virtualConsole:vc,pretendToBeVisual:true,beforeParse(w){w.scrollTo=()=>{}}});
 await new Promise(r=>dom.window.addEventListener("load",r));
 const w=dom.window,doc=w.document;w.alert=()=>errs.push("alert used");w.confirm=()=>true;w.scrollTo=()=>{};
 let s=seedNum;const rnd=()=>{s=(s*1103515245+12345)%2147483648;return s/2147483648};
 const E=x=>w.eval(x),app=()=>doc.getElementById("app");
 const btns=()=>[...app().querySelectorAll("button")].filter(b=>!b.disabled);
 const click=(sub,req=true)=>{const b=btns().find(b=>(b.getAttribute("onclick")||"").includes(sub));if(b){b.click();clicks++;return true}if(req)throw new Error("no button "+sub+" in phase "+E("S&&S.ph"));return false};
 const names=["Alex","Sam","Jo","Kim"].slice(0,cfg.players);
 names.forEach((n,i)=>doc.getElementById("n"+i).value=n);
 doc.getElementById("dz-mode").value=cfg.mode;doc.getElementById("dz-diff").value=cfg.diff;
 doc.querySelector('input[name="dzlen"][value="'+cfg.len+'"]').checked=true;
 doc.getElementById("dz-insider").checked=cfg.insider;doc.getElementById("dz-goals").checked=cfg.goals;doc.getElementById("dz-vote").checked=cfg.vote;
 let clicks=0,coldWords=0,coldClicks=null,coldDone=false;const bad=new Set();
 click("go()");
 const st={blocked:0,done:0,votes:0,events:0,screens:0};let guard=0,lastKey="";
 while(guard++<600){
  const ph=E("S?S.ph:'title'");if(ph==="title")throw new Error("back at title");
  const txt=app().textContent;st.screens++;
  if(/undefined|NaN|\[object|\{WATER_WHEN\}/.test(txt))bad.add(ph+":"+(txt.match(/.{0,40}(undefined|NaN|\[object|\{WATER_WHEN\}).{0,20}/)||[""])[0]);
  if(!coldDone&&process.env.DZ_COLD)console.log("COLD",ph,txt.split(/\s+/).filter(Boolean).length);
  if(!coldDone){coldWords+=txt.split(/\s+/).filter(Boolean).length;if(ph==="ord"){coldDone=true;coldClicks=clicks}}
  if(ph==="end")break;
  const key=ph+E("S.round")+E("S.pi")+E("JSON.stringify([S.show,S.vt,S.gi,S.ac,S.ev&&S.ev.done,S.dc])");
  if(key===lastKey&&ph!=="ord")throw new Error("stuck in "+ph);lastKey=key;
  if(ph==="chapter"){click("dzGo('intel')",false)||click("dz21Continue")}
  else if(ph==="brief"){
   if(E("!!(S.ev&&!S.ev.done)")){const o=btns().filter(b=>(b.getAttribute("onclick")||"").includes("dzEventChoose"));o[Math.floor(rnd()*o.length)].click();clicks++;st.events++}
   else click("dzGo('intel')");
  }
  else if(ph==="intel"){click("next()",false)||click("dz24FinishBriefings",false)||E("next()")}
  else if(ph==="break")click("dz21Continue");
  else if(ph==="council"){
   if(E("!!S.dl&&!S.dc")){
    if(btns().some(b=>(b.getAttribute("onclick")||"").includes("dzStartVote"))&&rnd()<0.85){click("dzStartVote");st.votes++}
    else{if(!click("S.together=1",false)){}
     if(E("!!S.dl&&!S.dc")){const o=btns().filter(b=>(b.getAttribute("onclick")||"").startsWith("choose("));if(!o.length)throw new Error("no dilemma options");o[Math.floor(rnd()*o.length)].click();clicks++}}
   }else click("dzGo('ord')");
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
  else if(ph==="accrev")click("S.ph=\\'end\\'",false)||click("S.ph='end'");
  else if(ph==="ord"){
   for(const sel of app().querySelectorAll("select[id^=o_]")){const o=[...sel.options].map(x=>x.value);
    let v;const used=[...app().querySelectorAll("select[id^=o_]")].map(x=>x.value);
    if(POLICY==="smart"){const good=o.slice(1).filter(id=>!used.includes(id)&&E(`TI["${id}"].av()&&have(cost(TI["${id}"]))&&!["cmf","trt"].includes("${id}")`));const pool=good.length?good:o.slice(1).filter(id=>!used.includes(id));v=pool[Math.floor(rnd()*pool.length)]||""}
    else v=o[1+Math.floor(rnd()*(o.length-1))]||"";sel.value=v}
   click("dz24LockTeam",false)||click("lock()");
  }
  else if(ph==="res"){JSON.parse(E("JSON.stringify(S.report||[])")).forEach(r=>r.status==="blocked"?st.blocked++:st.done++);click("escal()")}
  else if(ph==="esc")click("nextRound()");
  else throw new Error("unknown phase "+ph);
 }
 if(E("S.ph")!=="end")throw new Error("did not finish, stuck at "+E("S.ph"));
 const html=app().innerHTML;
 if(!html.includes("Mill Lane Chronicle"))errs.push("no chronicle");
 const line=E("dzEmojiLine()");if(/undefined|NaN/.test(line))errs.push("bad emoji line "+line);
 const z=JSON.parse(E("JSON.stringify(ending())"));
 const goals=JSON.parse(E("JSON.stringify(dzGoalResults().map(g=>({k:g.key||'insider',met:g.met})))"));
 return {cfg,ending:z.e[0],stars:z.m+z.p+z.c,broke:E("S.broke")||null,chapters:E("S.decLog.length"),seed:E("S.seed"),caught:E("S.caught||false"),insider:E("S.insider"),sab:E("S.sab.length"),
  goals,errs:errs.concat([...bad].map(b=>"bad text "+b)),st,clicks,coldWords,coldClicks,ex:E("S.v.extra.map(e=>e.id).join(',')")};
}
(async()=>{
 const cfgs=[];
 for(const diff of ["easy","normal","hard"])for(const len of ["full","quick"])for(const mode of ["tv","phones"])for(const insider of [false,true])for(const players of [1,2,3,4]){
  if(insider&&players<3)continue;const c={diff,len,mode,insider,players,goals:true,vote:true};
  if(Object.entries(ONLY).every(([k,v])=>c[k]===v))cfgs.push(c)}
 // a few with goals/votes off
 cfgs.push({diff:"normal",len:"full",mode:"tv",insider:false,players:3,goals:false,vote:false});
 cfgs.push({diff:"hard",len:"quick",mode:"tv",insider:true,players:4,goals:false,vote:true});
 const res=[];let g=0;
 for(const cfg of cfgs)for(let i=0;i<N;i++){g++;try{res.push(await game(cfg,g*7919+i))}catch(e){res.push({cfg,fatal:e.message})}}
 const ok=res.filter(r=>!r.fatal),fat=res.filter(r=>r.fatal);
 console.log("policy",POLICY,"configs",cfgs.length,"games",res.length,"fatal",fat.length);
 const fm={};fat.forEach(r=>fm[r.fatal]=(fm[r.fatal]||0)+1);if(fat.length)console.log("fatal kinds",fm);
 const errs={};ok.forEach(r=>r.errs.forEach(e=>errs[e]=(errs[e]||0)+1));console.log("errors",errs);
 const grp=(f)=>{const m={};ok.forEach(r=>{const k=f(r);(m[k]=m[k]||[]).push(r)});return m};
 const summ=a=>({n:a.length,stars:(a.reduce((x,r)=>x+r.stars,0)/a.length).toFixed(2),collapse:(100*a.filter(r=>r.broke).length/a.length).toFixed(0)+"%",best:(100*a.filter(r=>r.ending==="The Lights of Mill Lane").length/a.length).toFixed(0)+"%",blocked:(100*a.reduce((x,r)=>x+r.st.blocked,0)/Math.max(1,a.reduce((x,r)=>x+r.st.blocked+r.st.done,0))).toFixed(0)+"%"});
 for(const k of ["diff","len","mode","insider","players"]){const m=grp(r=>r.cfg[k]);console.log("by "+k,Object.fromEntries(Object.entries(m).map(([a,b])=>[a,summ(b)])))}
 const ins=ok.filter(r=>r.cfg.insider);if(ins.length)console.log("insider games",ins.length,"caught",ins.filter(r=>r.caught).length,"collapsed",ins.filter(r=>r.broke).length,"avg sabotage",(ins.reduce((x,r)=>x+r.sab,0)/ins.length).toFixed(2));
 const gm={};ok.forEach(r=>r.goals.forEach(g=>{gm[g.k]=gm[g.k]||[0,0];gm[g.k][1]++;if(g.met)gm[g.k][0]++}));console.log("goal hit rates",Object.fromEntries(Object.entries(gm).map(([k,v])=>[k,Math.round(100*v[0]/v[1])+"% of "+v[1]])));
 const end={};ok.forEach(r=>end[r.ending]=(end[r.ending]||0)+1);console.log("endings",end);
 const cold=ok.filter(r=>r.coldClicks!=null);console.log("cold open: avg clicks to first orders",(cold.reduce((x,r)=>x+r.coldClicks,0)/cold.length).toFixed(1),"avg words",Math.round(cold.reduce((x,r)=>x+r.coldWords,0)/cold.length),"by mode",Object.fromEntries(Object.entries(grp(r=>r.cfg.mode+"/"+r.cfg.players)).map(([k,a])=>[k,Math.round(a.reduce((x,r)=>x+r.coldWords,0)/a.length)+"w/"+(a.reduce((x,r)=>x+r.coldClicks,0)/a.length).toFixed(1)+"c"])));
 console.log("avg votes/game",(ok.reduce((x,r)=>x+r.st.votes,0)/ok.length).toFixed(2),"avg crossroads/game",(ok.reduce((x,r)=>x+r.st.events,0)/ok.length).toFixed(2),"avg screens",Math.round(ok.reduce((x,r)=>x+r.st.screens,0)/ok.length));
 console.log("distinct seeds",new Set(ok.map(r=>r.seed)).size,"distinct extra-rumour sets",new Set(ok.map(r=>r.ex)).size);
 require("fs").writeFileSync(process.env.DZ_OUT||"sim-results.json",JSON.stringify(res,null,1));
})();
