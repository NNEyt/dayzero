/*
  Day Zero views for the main build (index.html).
  Cold open, compact council, just-in-time tips, Crossroads cards, mode-aware briefings.
  Old 2.4 views (title/vTeam/vBrief/vPass/vCouncil/vEsc) are replaced here; the story and
  rules text they used are kept and shown when they matter instead of all at the start.
*/
function dzToast(msg){
 let t=document.getElementById("dz-toast");
 if(!t){t=document.createElement("div");t.id="dz-toast";t.setAttribute("role","status");document.body.appendChild(t)}
 t.textContent=msg;t.classList.add("on");clearTimeout(dzToast.h);dzToast.h=setTimeout(()=>t.classList.remove("on"),2600);
}
/* A tip is shown the first time its moment arrives, and stays for that screen. */
function dzTip(key,html){
 if(!S)return "";S.tips=S.tips||{};const here=S.round+":"+S.ph;
 if(S.tips[key]&&S.tips[key]!==here)return "";S.tips[key]=here;
 return '<div class="dz-tip"><b>💡 New:</b> '+html+'</div>';
}
function dzGo(ph){S.ph=ph;S.pi=0;S.show=false;sv();R()}
function dzSaved(){try{return localStorage.getItem(DZ_SAVE)}catch(e){return null}}

/* ---------- title: names, Play, everything else tucked away ---------- */
function title(){
 const saved=dzSaved(),q=new URLSearchParams(location.search),seedQ=dzCleanSeed(q.get("seed")||"");
 const prev=(()=>{try{return JSON.parse(localStorage.getItem("dz_last_setup")||"{}")}catch(e){return {}}})();
 const row=i=>'<div class="dz-namerow"><input id="n'+i+'" maxlength="16" autocomplete="off" placeholder="Player '+(i+1)+' name'+(i?" (optional)":"")+'" value="'+esc((prev.names||[])[i]||"")+'"><label class="dz-kidchk" title="Younger player"><input type="checkbox" id="k'+i+'"'+((prev.kids||[])[i]?" checked":"")+'> 🧒</label></div>';
 const sel=(id,opts,cur)=>'<select id="'+id+'">'+opts.map(([v,l])=>'<option value="'+v+'"'+(v===cur?" selected":"")+'>'+l+'</option>').join("")+'</select>';
 return '<h1 class="dz-title">DAY ZERO</h1><p class="c dz-tagline"><i>The lights go out. Nobody has the whole picture.</i></p>'+
 '<div class="pn dz-start"><h2>Who is playing?</h2>'+
 [0,1,2,3].map(row).join("")+'<details class="dz-more"'+((prev.names||[]).length>4?" open":"")+'><summary>➕ 5–8 players (adds Kit 👟, Bea 🫖, Dev 🔧 and Grace 🏛️)</summary>'+[4,5,6,7].map(row).join("")+'<p class="s">Tick 🧒 for younger players (about 7–11): with 5+ players they get Kit or Bea, kid-friendly roles with one simple job a chapter.</p></details>'+
 '<div class="dz-len" role="radiogroup" aria-label="Game length">'+["full","quick"].map(k=>'<label class="dz-chip-radio"><input type="radio" name="dzlen" value="'+k+'"'+((prev.len||"full")===k?" checked":"")+'> <b>'+DZ_LEN[k].label+'</b><span>'+DZ_LEN[k].mins+'</span></label>').join("")+'</div>'+
 '<div class="c"><button class="btn dz-play" onclick="go()">▶ Play</button>'+(saved?'<button class="btn b" onclick="cont()">Continue saved game</button>':"")+'</div>'+
 '<p class="c dz-rules-link"><a href="rules.html">📖 New here? How to play (a 2-minute teach)</a></p>'+
 '<details class="dz-opts"'+(seedQ?" open":"")+'><summary>⚙️ Game options</summary>'+
 '<label>Screens'+sel("dz-mode",[["tv","TV only · everyone sees the role briefings"],["phones","TV + phone briefings · private briefings by QR code"],["live","📱 TV + phone controllers · phones vote and act (beta, needs internet)"]],prev.mode||"tv")+'</label>'+
 '<label>Difficulty'+sel("dz-diff",Object.keys(DZ_DIFF).map(k=>[k,DZ_DIFF[k].label+" · "+DZ_DIFF[k].blurb]),prev.diff||"normal")+'</label>'+
 '<label class="dz-check"><input type="checkbox" id="dz-goals"'+(prev.goals===false?"":" checked")+'> Personal goals: each player gets a private goal, revealed at the end</label>'+
 '<label class="dz-check"><input type="checkbox" id="dz-vote"'+(prev.vote===false?"":" checked")+'> Secret votes on big decisions (pass the device)</label>'+
 '<label class="dz-check"><input type="checkbox" id="dz-insider"'+(prev.insider?" checked":"")+'> 🕵️ The Insider: one player is secretly working against you (3+ players, ages 12+)</label>'+
 '<label>Town seed <span class="s">(leave blank for a new town; share a seed to replay the same one)</span><input id="dz-seed" maxlength="8" placeholder="e.g. K7Q2" value="'+esc(seedQ)+'"></label>'+
 '</details>'+(typeof dzCampPanel==="function"?dzCampPanel():"")+'<p class="s c">1–8 players · best with 3–6 · one player = practice mode · <a href="versions.html">older versions</a></p></div>';
}
function go(x){
 const rows=[0,1,2,3,4,5,6,7].map(i=>({n:(document.getElementById("n"+i)||{value:""}).value.trim(),k:!!(document.getElementById("k"+i)||{}).checked})).filter(x=>x.n);
 if(!rows.length)rows.push({n:"Player 1",k:false});const names=rows.map(x=>x.n),kids=rows.map(x=>x.k);
 const val=id=>{const e=document.getElementById(id);return e?e.value:undefined},chk=id=>{const e=document.getElementById(id);return e?e.checked:undefined};
 const lenEl=document.querySelector('input[name="dzlen"]:checked');
 const o={kids,mode:val("dz-mode"),diff:val("dz-diff"),len:lenEl?lenEl.value:"full",goals:chk("dz-goals"),vote:chk("dz-vote"),insider:chk("dz-insider"),seed:val("dz-seed")};
 try{localStorage.setItem("dz_last_setup",JSON.stringify(Object.assign({names},o,{seed:""})))}catch(e){}
 Object.assign(o,x||{});
 dzSfx("page");start(names,o);
}
function cont(){
 try{S=JSON.parse(dzSaved())}catch(e){S=null}
 if(!S||!S.v){S=null;dzToast("That save is from an older version. Starting fresh.");try{localStorage.removeItem(DZ_SAVE)}catch(e){}R();return}
 dzInit();dz21Init();R();
}
function restart(){if(confirm("Start a new game? The saved game will be deleted.")){try{localStorage.removeItem(DZ_SAVE)}catch(e){}S=null;R()}}

/* ---------- the board ---------- */
function board(){
 const t=S.t,a=S.a,tk=(n,k,i)=>'<div class="trk" data-trk="'+k+'" data-v="'+t[k]+'">'+i+" "+n+'<b>'+t[k]+'</b><div class="pp">'+"●".repeat(t[k])+"○".repeat(6-t[k])+'</div></div>';
 return '<div class="pn c">'+tk("Supplies","supplies","🥫")+tk("Health","health","❤️")+tk("Cohesion","cohesion","🤝")+tk("Trust","trust","🏘️")+
 '<div style="margin:6px 0"><span data-trk="fuel" data-v="'+a.fuel+'">⛽ Fuel <b>'+a.fuel+'</b></span> · <span data-trk="signal" data-v="'+a.signal+'">📻 Signal <b>'+a.signal+'</b></span> · <span data-trk="medkits" data-v="'+a.medkits+'">✚ Medkits <b>'+a.medkits+'</b></span> · <span data-trk="contacts" data-v="'+a.contacts+'">🏠 Contacts <b>'+a.contacts+'</b></span> · ⏳ Crisis <b>'+S.crisis+'/'+dzCrisisMax()+'</b></div>'+
 '<div>MISSION: <span class="hb '+(S.hub.warmth?"on":"")+'">🔥 Warmth</span><span class="hb '+(S.hub.water?"on":"")+'">💧 Water</span><span class="hb '+(S.hub.info?"on":"")+'">📻 Information</span></div>'+
 '<div class="s">Chapter '+dzChapterNo()+' of '+dzChapters()+' · Coordinator: <b>'+esc(S.pl[S.co].n)+'</b> · '+dzDiff().label+' · Town seed <b class="dz-seed">'+esc(S.seed)+'</b></div>'+
 '<button class="btn b sm2" onclick="S.g=!S.g;R()">'+(S.g?"Hide help":"❓ What do these mean?")+'</button><button class="btn b sm2" onclick="S.rr=!S.rr;R()">'+(S.rr?"Hide roles":"📖 Roles & how to win")+'</button></div>'+
 (S.g?guideH():"")+(S.rr?dzRulesPanel():"");
}
function dzRulesPanel(){
 const own=r=>(S.pl.find(p=>p.r.includes(r))||{}).n||"";
 return '<div class="pn"><p><b>🏆 How you win:</b> get 🔥 Warmth, 💧 Water and 📻 Information running at the hall, keep ❤️ Health high, and keep 🤝 Cohesion and 🏘️ Trust high. Up to 9 stars and 7 different endings. If Health or Cohesion hits 0, the game ends early.</p>'+
 dzRoles().map(r=>'<div class="rb" style="border-color:'+RL[r].c+'"><h3 style="color:'+RL[r].c+'">'+RL[r].i+" "+RL[r].n+": "+esc(own(r))+'</h3><b>Who:</b> '+ROLEX[r].who+'<br><b>Knows:</b> '+ROLEX[r].knows+'<br><b>Can do:</b> '+ROLEX[r].does+'</div>').join("")+'</div>';
}
function thC(id){
 const d=TH[id],x=S.th[id],n=dzClock(id);let cl="";
 if(n){cl='<div class="clk">';for(let i=0;i<n;i++)cl+=id==="T3"&&!x.fail?"<i>?</i>":'<i class="'+(i<x.clock?"on":"")+(S.lastTick&&S.lastTick[id]&&i===x.clock-1?" dz-newpip":"")+'"></i>';cl+="</div>"}
 return card({t:d[0],a:id.toLowerCase(),i:IC[id],f:d[3],b:'<b>If the clock fills:</b> '+d[4]+cl,h:HINT[id],g:(id[0]==="O"?"OPPORTUNITY":id==="T7"?"WARNING":"THREAT")+" · "+d[1],c:"#e4572e"});
}
function dzClockStrip(){
 const A=Object.keys(S.th).filter(id=>act(id)&&dzClock(id));if(!A.length)return "";
 return '<div class="dz-strip">'+A.map(id=>{const x=S.th[id],n=dzClock(id),hot=x.clock>=n-1;return '<div class="dz-st dz-strip-i'+(hot?" hot":"")+'" data-sfx="'+(S.lastTick&&S.lastTick[id]?"tick":"none")+'" data-wait="450">'+IC[id]+" "+TH[id][0]+'<div class="clk">'+Array.from({length:n},(_,i)=>id==="T3"?"<i>?</i>":'<i class="'+(i<x.clock?"on":"")+(S.lastTick&&S.lastTick[id]&&i===x.clock-1?" dz-newpip":"")+'"></i>').join("")+'</div></div>'}).join("")+'</div>';
}

/* ---------- Chapter 1: the cold open ---------- */
const DZ_ONE_LINE={SIG:"knows which rumours are true, and runs the radio",QM:"drives the van and spends the Fuel",MED:"keeps people alive and spots deadly mistakes",LOC:"knows everyone in town, and every back door",RUN:"kid role: runs messages and quick jobs",HST:"kid role: tea, blankets and kindness",MEC:"fixes generators, pumps and radios",LIA:"gets official answers from the council"};
function vColdOpen(){
 const co=typeof dzColdOpenText==="function"&&dzColdOpenText()||{kick:"",title:"The lights go out.",paras:["Not just your street. The whole town is dark. Someone knocks on the community hall door: “Is anyone organising things here?” You look at each other. It seems you are."],ring:"📞 Then a phone rings. Mr Aldous’s daughter: <i>“Dad’s breathing machine is beeping. He’s on the 9th floor. Please help.”</i>"};
 const team=S.pl.map(p=>'<div class="dz-teamline"><b>'+esc(p.n)+'</b> '+p.r.map(r=>'<span style="color:'+RL[r].c+'">'+RL[r].i+" "+RL[r].ch+'</span> <span class="s">('+RL[r].n+": "+DZ_ONE_LINE[r]+')</span>').join(" & ")+'</div>').join("");
 return '<section class="dz21-page dz-cold"><div class="dz21-head"><div class="dz21-kicker">'+co.kick+'Chapter 1 of '+dzChapters()+' · Thursday 18:04</div><h2>'+co.title+'</h2></div><div class="dz21-hero">'+art("ev1","🌑")+'</div>'+
 '<div class="dz21-prose"><div class="dz21-reader">'+dz21Attribution()+'</div>'+co.paras.map(x=>'<p>'+x+'</p>').join("")+'<p class="dz-st" data-sfx="ring" data-wait="900">'+co.ring+'</p></div></section>'+
 '<div class="row dz-st" data-sfx="alarm">'+thC("T2")+'</div>'+
 '<div class="sec">👥 Who you are</div><div class="pn">'+team+'</div>'+
 '<div class="c"><button class="btn" onclick="dzGo(\'intel\')">See what you each know →</button></div><p class="c s">Everything else, you will learn as it happens.</p>';
}
/* Later chapters: the 2.1 story page with a length-aware chapter label. */
const DZ_BRIDGE={3:"Thursday night passes somehow, in coats and blankets.",5:"Friday passes in a blur of queues, rumours and cold tea…",6:"Friday and most of Saturday pass in a blur of queues, rumours and cold tea…",7:"Saturday is long and cold. Somehow, you get through it."};
const dz21ChapterBase=dz21Chapter;
dz21Chapter=function(){
 let h=dz21ChapterBase().replace("CHAPTER "+S.round+" OF 7",(S.ep?"EPISODE "+S.ep+" · ":"")+"CHAPTER "+dzChapterNo()+" OF "+dzChapters()+(S.len==="quick"?" · QUICK NIGHT":""));
 const seq=dzSeq(),prev=seq[dzRoundIdx()-1],extra=[];
 if(prev&&prev<S.round-1&&DZ_BRIDGE[S.round])extra.push('<i>'+DZ_BRIDGE[S.round]+'</i>');
 if(typeof dzEpisodeChapterLine==="function"){const l=dzEpisodeChapterLine();if(l)extra.push(l)}
 if(extra.length)h=h.replace('<div class="dz21-prose">','<div class="dz21-prose">'+extra.map(x=>'<p>'+x+'</p>').join(""));
 return h;
};

/* ---------- Round brief (chapters 2+) ---------- */
function dzEventCard(){
 if(!S.ev)return "";const e=dzEventById(S.ev.id);if(!e)return "";const who=dzEventWho(e);
 let body='<div class="fl">'+e.x+'</div><p><b>'+esc(who?who.n:"Coordinator")+'</b> decides'+(e.who!=="ANY"?" ("+RL[e.who].i+" "+RL[e.who].n+")":"")+'. Quickly!</p>';
 if(!S.ev.done)body+=e.o.map((o,i)=>'<button class="btn opt '+(i?"b":"")+'" '+(o[2]&&!o[2]()?"disabled":"")+' onclick="dzEventChoose('+i+')">'+o[0]+'<div>⚡ '+o[1]+'</div></button>').join("");
 else body+='<p class="dz-st" data-sfx="none">✔ <b>'+e.o[S.ev.done.i][0]+'.</b> '+esc(S.ev.done.msg)+'</p>';
 return '<div class="sec">🔀 Crossroads</div>'+dzTip("crossroads","Crossroads cards are small surprises. The named player makes the call, right now, without a long debate.")+'<div class="row"><div class="dz-st" data-sfx="flip">'+card({t:e.t,a:"echo",i:e.i,b:body,g:"CROSSROADS",c:"#c593e5"})+'</div></div>';
}
function vBrief(){
 const e=EV[S.round];
 let h='<h2>Chapter '+dzChapterNo()+' · '+e[0]+'</h2>'+goal();
 if(dzRoundIdx()===1)h+=dzTip("two","From now on, each role gets <b>two</b> actions per chapter.");
 if(S.br.length)h+=dzTip("echo","↩️ <b>Echo</b> cards are the consequences of choices you already made.")+'<div class="sec">↩️ Because of earlier choices</div><div class="row">'+S.br.map(b=>'<div class="dz-st" data-sfx="flip">'+card({t:b.t,a:"echo",i:"↩️",f:b.x,b:b.w?"<i>"+b.w+"</i>":"",g:b.w?"ECHO":"NEWS",sm:1})+'</div>').join("")+'</div>';
 if(S.nw.length)h+='<div class="sec">⚠️ New problems</div><div class="row">'+S.nw.map(id=>'<div class="dz-st" data-sfx="alarm">'+thC(id)+'</div>').join("")+'</div>';
 h+=dzEventCard();
 const blocked=S.ev&&!S.ev.done;
 return h+'<div class="sec">🏘️ Your town</div>'+board()+'<div class="c"><button class="btn" '+(blocked?"disabled":"")+' onclick="dzGo(\'intel\')">'+(dz24Mode()==="phones"?"Open role briefings":"Read the role briefings")+'</button>'+(blocked?'<p class="s">Resolve the Crossroads card first.</p>':"")+'</div>'+foot();
}

/* ---------- Briefings & orders ---------- */
function vPass(){
 if(S.ph==="ord")return (S.round===dzSeq()[0]?dzTip("orders","Actions happen together at the end of the chapter. If one action needs another (like unlocking the stairs before the climb), choose <b>both</b> now."):"")+dz24Orders();
 if(typeof dzLiveOn==="function"&&dzLiveOn())return dzLivePanel("intel");
 if(dz24Mode()==="phones")return dz24PhoneBriefings();
 if(S.round===dzSeq()[0]){
  return '<div class="dz24-lead"><div class="dz24-eyebrow">CHAPTER 1 · WHAT YOU EACH KNOW</div><h2>Your role cards</h2><p>Each of you reads your own cards out loud. Some are <b>verified</b>, some are <b>rumours</b>.</p></div>'+
  S.pl.map(p=>'<h3 class="dz-hand-name">'+esc(p.n)+'</h3>'+dz24PlayerHand(p,S.round)).join("")+
  '<div class="c"><button class="btn" onclick="S.pi=S.pl.length-1;next()">We\'ve shared · Make a plan</button></div>';
 }
 return dz24SharedBriefing();
}
function dz24PhoneUrl(index){
 const p=S.pl[index],path=window.location.href.split("#")[0].split("?")[0],base=path.substring(0,path.lastIndexOf("/")+1);
 let u=base+"phone.html#round="+S.round+"&ch="+dzChapterNo()+"/"+dzChapters()+"&roles="+encodeURIComponent(p.r.join(","))+"&name="+encodeURIComponent(p.n)+"&seed="+encodeURIComponent(S.seed);
 if(S.goalsShown&&(S.goalsOn||index===S.insider))u+="&g="+encodeURIComponent(dzGoalToken(S.seed,S.goals[index],index===S.insider));
 return u;
}

/* ---------- Council ---------- */
function dzDilemmaCard(){
 const d=DL[S.dl],showLater=S.diff==="easy";
 const who=d[0]?'<b>The '+RL[d[0]].n+'</b> breaks ties.':'<b>The Coordinator</b> breaks ties.';
 let side="";
 if(S.dc){const o=d[4].find(x=>x[0]===S.dc);side='<div class="dz-decided"><div class="dz-kick">DECIDED'+(S.decLog.length&&S.decLog[S.decLog.length-1].tally?" BY SECRET VOTE":"")+'</div><h3>'+o[1]+'</h3><p>⚡ '+o[2]+'</p></div>';}
 else if(S.vote&&!S.together){side=dzTip("vote","<b>Secret vote.</b> Talk it through, then pass the device round. Everyone votes privately; the majority decides. If three or more of you all agree, Cohesion +1.")+'<button class="btn" onclick="dzStartVote()">🗳️ Secret vote</button><p class="s">'+who+' <button class="dz24-linkbtn" onclick="S.together=1;R()">or decide together on this screen</button></p>';}
 else side=d[4].map((o,i)=>'<button class="btn opt '+(i?"b":"")+'" '+(o[0]==="share"&&S.t.supplies<1?"disabled":"")+' onclick="choose(\''+o[0]+'\')">Option '+"ABC"[i]+': '+o[1]+'<div>⚡ <b>Now:</b> '+o[2]+'</div>'+(showLater?'<div>🔮 <b>Later:</b> '+o[5]+'</div>':"")+'</button>').join("");
 return '<div class="sec">⚖️ Decision</div><div class="row">'+card({t:d[1],a:S.dl.toLowerCase(),i:d[2],f:d[3],b:d[0]?'Decided by the '+RL[d[0]].n+' after listening to everyone.':'A group decision.',g:"DILEMMA"})+'<div class="pn" style="max-width:460px">'+side+'</div></div>';
}
function vCouncil(){
 const first=S.round===dzSeq()[0];
 let h='<h2>The Council · Chapter '+dzChapterNo()+'</h2>'+goal();
 if(first)h+=dzTip("first","<b>Your first move:</b> Mr Aldous needs two people. 🏠 Marta can get Mr Osei to unlock the stairs, and ✚ Pavel can climb up. Everyone else: start on the Hub. This chapter, each role gets <b>one</b> action.");
 else h+='<details class="pn dz-scene"><summary>📖 Read the scene &amp; hints</summary>'+dz22CouncilScene()+'</details>';
 h+='<div class="pn dz-steps"><b>1.</b> Share what you know. <b>2.</b> Agree who does what. <b>3.</b> '+(S.dl?"Settle the decision below, then":"")+' choose your actions.</div>';
 if(S.dl)h+=dzDilemmaCard();
 const A=Object.keys(S.th).filter(act);if(A.length)h+='<div class="sec">⚠️ Problems right now</div><div class="row">'+A.map(thC).join("")+'</div>';
 return h+'<div class="sec">🏘️ Your town</div>'+board()+(first?"":dzPanel())+'<div class="c"><button class="btn" '+(S.dl&&!S.dc?"disabled":"")+' onclick="dzGo(\'ord\')">Choose team actions</button></div>';
}

/* ---------- Time passes ---------- */
function vEsc(){
 const seq=dzSeq(),i=dzRoundIdx(),nxR=seq[i+1];
 const nx=nxR&&!S.broke?'<div class="goal">🔜 <b>Coming next:</b> Chapter '+(i+2)+': '+EV[nxR][0]+'</div>':"";
 return '<h2>End of Chapter '+(i+1)+'</h2>'+dz21Outro()+'<div class="sec">⏰ Time passes…</div>'+dz22TimePassage()+dzClockStrip()+dif(S.pre)+nx+'<div class="sec">🏘️ Your town</div>'+board()+'<div class="c"><button class="btn" onclick="nextRound()">'+(nxR&&!S.broke?"Next chapter":"See how it ends")+'</button></div>';
}
function nextRound(){
 const seq=dzSeq(),i=dzRoundIdx();
 if(S.broke){S.ph="end";sv();R();return}
 if(i>=seq.length-1){dzFinish();return}
 let nx=seq[i+1];if(S.crisis>=dzCrisisMax())nx=seq[seq.length-1];
 S.round=nx;S.together=0;
 if(dzNeedGoals()){S.ph="goals";S.gi={i:typeof dzLiveOn==="function"&&dzLiveOn()?-1:0,show:false,seen:{}};sv();R();return}
 startRound();
}
function dzFinish(){
 if(S.insider>=0&&!S.broke&&!S.accDone){S.ph="accuse";S.ac={i:typeof dzLiveOn==="function"&&dzLiveOn()?-1:0,show:false,b:{}};}else S.ph="end";
 sv();R();
}

/* ---------- result & time cards: staged, with rumour stamps ---------- */
const DZ_VERDICT={iMid:"FALSE",iArm:"FALSE",iEva:"FALSE",iWat:"OUT OF DATE",iBrk:"FALSE",iSab:"UNPROVEN"};
function dzVerdict(id){if(id==="iTan")return S.v&&S.v.tanker==="tomorrow"?"HALF TRUE":"FALSE";return DZ_VERDICT[id]}
function dz22ResultCards(){
 const reports=Array.isArray(S.report)?S.report:[];
 if(!reports.length)return '<div class="pn"><p>No orders were completed this round.</p></div>';
 return '<div class="dz22-grid">'+reports.map(r=>{
  const role=RL[r.role]||{ch:"Neighbour",c:"#ffd166",i:"🎒"},blocked=r.status==="blocked",color=blocked?"#d9855f":role.c;
  const ttl=r.found?.length?DZ_ITEMS[r.found[0]]?.name:r.id==="gTest"?"Generator Tested":r.id==="info"?"Radio Point Ready":r.id==="fill"&&r.changes?.some(c=>c.includes("Water running"))?"Water Reserve Ready":r.id==="osei"?"Access Secured":r.id==="frz"?"Food Collected":blocked?"Plan Blocked":r.label;
  const verdict=!blocked&&dzVerdict(r.id);
  const good=!blocked&&(/^✅/.test(r.raw)||(r.changes||[]).some(c=>/running|\+/.test(c)));
  const changes=r.changes?.length?'<div class="dz22-chips">'+r.changes.map(t=>'<span>'+esc(t)+'</span>').join("")+'</div>':"";
  return '<article class="dz-st dz22-result dz23-result" data-sfx="'+(verdict?"stamp":blocked?"fail":good?"success":"flip")+'" data-wait="'+(verdict?1300:900)+'" style="--dz22:'+color+'"><div class="dz22-art">'+art(dz22Artwork(r.id,r.found),role.i)+(verdict?'<div class="dz-stamp v-'+verdict.replace(/ /g,"")+'">'+verdict+'</div>':"")+'</div>'+
  '<div class="dz22-details"><div class="dz22-kicker">'+esc(role.ch)+' · '+(blocked?"COULD NOT COMPLETE":"COMPLETED")+'</div><h4>'+esc(ttl||r.label)+'</h4><p>'+esc(dz22ResultText(r))+'</p>'+changes+'</div></article>';
 }).join("")+'</div>';
}
function dz22TimePassage(){
 const notes=Array.isArray(S.esc)?S.esc:[];
 const artFor=x=>/cold|freezing|shiver|bitter|frost/i.test(x)?"ev6":/water|tap|tower/i.test(x)?"t3":/fire|smoke/i.test(x)?"t8":/generator|fuel/i.test(x)?"t1":/rumour|trust|neighbour/i.test(x)?"ev5":/repair|substation|power|grid/i.test(x)?"t10":"echo";
 if(!notes.length)return '<div class="pn">The night passes without further news.</div>';
 return '<div class="dz22-grid">'+notes.map(note=>{
  const msg=dz22Plain(note),good=/✅/.test(note),warn=/✖/.test(note),full=/clock full/.test(note);
  const heading=good?"A welcome development":full?"Time ran out":warn?"Trouble in Kelderwick":"The hours pass";
  return '<article class="dz-st dz22-result'+(full?" dz-alarm":"")+'" data-sfx="'+(full?"alarm":good?"success":warn?"fail":"tick")+'" data-wait="'+(full?1400:900)+'"'+(full?' data-shake="1"':"")+' style="--dz22:'+(good?"#6bd59f":warn?"#e39b75":"#9bb4df")+'"><div class="dz22-art">'+art(artFor(note),"⏳")+'</div><div class="dz22-details"><div class="dz22-kicker">TIME PASSES · CHAPTER '+dzChapterNo()+'</div><h4>'+heading+'</h4><p>'+esc(msg)+'</p></div></article>';
 }).join("")+'</div>';
}
const dz22ResultTextBase=dz22ResultText;
dz22ResultText=function(x){
 if(S.v&&S.v.tanker==="tomorrow"&&x.status!=="blocked"){
  if(x.id==="bC")return "Theo told the whole truth: a tanker is due tomorrow, but the pumps can't run without power. The crowd began to disperse.";
  if(x.id==="bB")return "Theo said no tanker was coming. When one turned up the next day, people wondered what else the radio had got wrong.";
 }
 return dz22ResultTextBase(x);
};

/* ---------- render ---------- */
function R(){
 if(S){dzInit();dz21Init()}
 const A=document.getElementById("app");let html;
 if(!S)html=title();
 else{
  const V={chapter:S.round===dzSeq()[0]?(S.lobby&&typeof vLobby==="function"?vLobby:S.prevPending?vPrev:vColdOpen):dz21Chapter,brief:vBrief,intel:vPass,break:dz21Break,council:vCouncil,ord:vPass,res:vRes,esc:vEsc,end:dzChronicle,
   goals:dzGoalsView,vote:dzVoteView,vreveal:dzVoteReveal,accuse:dzAccuseView,accrev:dzAccuseReveal}[S.ph];
  html=V?V():'<p>Something went wrong. <button class="btn" onclick="restart()">New game</button></p>';
  html=dzVText(S.v,html);
 }
 A.innerHTML=html;window.scrollTo(0,0);
 if(S&&S.ph==="intel"&&dz24Mode()==="phones")dz24QR();
 dzAfterRender(S?S.ph+":"+S.round:"title");
}
