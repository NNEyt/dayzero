/*
  Day Zero views for the main build (index.html).
  Just-in-time tips, story and Crossroads cards, mode-aware briefings.
  Every Day has four beats: Morning News (vNews), Discuss (vDiscuss), Decide (vDecide) and Night (vNight).
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

/* ---------- title: the booklet cover, then a "Setting Up" page ---------- */
const DZ_BULB='<svg class="bk-bulb" viewBox="0 0 64 84" aria-hidden="true"><g class="rays"><path d="M6 20l7 4M2 36h8M58 20l-7 4M62 36h-8M14 6l5 6M50 6l-5 6M32 0v7"/></g><path d="M32 12a19 19 0 0 0-11 34.5c3 2.3 4.5 5 4.5 8.5v3h13v-3c0-3.5 1.5-6.2 4.5-8.5A19 19 0 0 0 32 12z"/><path d="M25.5 63h13M26.5 68h11M29 73h6"/><path class="fil" d="M27.5 47V38c0-2 1.5-3 2.2-1.5l2.3 4.5 2.3-4.5c.7-1.5 2.2-.5 2.2 1.5v9"/></svg>';
function dzOrn(){return '<div class="bk-orn" aria-hidden="true"><i></i><b></b><i></i></div>'}
function title(){
 const saved=dzSaved(),q=new URLSearchParams(location.search),seedQ=dzCleanSeed(q.get("seed")||"");
 const prev=(()=>{try{return JSON.parse(localStorage.getItem("dz_last_setup")||"{}")}catch(e){return {}}})();
 const row=i=>'<div class="dz-namerow"><input id="n'+i+'" maxlength="16" autocomplete="off" aria-label="Player '+(i+1)+' name" placeholder="Player '+(i+1)+' name'+(i?" (optional)":"")+'" value="'+esc((prev.names||[])[i]||"")+'"><label class="dz-kidchk" title="Younger player (about 7–11)"><input type="checkbox" id="k'+i+'"'+((prev.kids||[])[i]?" checked":"")+'> Kid</label></div>';
 const sel=(id,opts,cur)=>'<select id="'+id+'">'+opts.map(([v,l])=>'<option value="'+v+'"'+(v===cur?" selected":"")+'>'+l+'</option>').join("")+'</select>';
 const cover='<section class="bk-cover" aria-label="Day Zero"><div class="bk-cv-frame">'+
  '<div class="bk-cv-top"><span>A Game of the Long Blackout</span><span>Family Edition</span></div>'+
  '<div class="bk-logo">'+DZ_BULB+'<h1 class="dz-title"><span class="w1">DAY</span><span class="w2">ZERO</span></h1></div>'+
  '<p class="dz-tagline">The lights go out. Nobody has the whole picture.</p>'+
  '<figure class="bk-panel bk-cv-art"><div class="bk-img" style="background-image:url(art/t9.jpg)"></div><figcaption>Mill Lane, the night the lights went out.</figcaption></figure>'+
  '<div class="bk-cv-bot"><div class="bk-cv-meta"><b>1&ndash;8</b><span>Players</span></div><div class="bk-cv-meta"><b>40&ndash;75</b><span>Minutes</span></div><div class="bk-cv-meta"><b>Co-op</b><span>Family</span></div>'+
  '<div class="bk-cv-by">Day by Day<span>a game by Non Native Entrepreneur</span></div></div>'+
 '</div></section>';
 const setup='<section class="pn dz-start bk-page" aria-label="Setting up">'+
  '<header class="bk-chap"><div class="bk-no">I</div><h2>Setting Up</h2>'+dzOrn()+'</header>'+
  '<ol class="bk-setup">'+
  '<li><h3>Who is playing?</h3>'+[0,1,2,3].map(row).join("")+
   '<details class="dz-more"'+((prev.names||[]).length>4?" open":"")+'><summary>5–8 players <span>(adds Kit, Bea, Dev and Grace)</span></summary>'+[4,5,6,7].map(row).join("")+'<p class="s">Tick <b>Kid</b> for younger players (about 7–11): with 5+ players they get Kit or Bea, kid-friendly roles with one simple job a Day.</p></details></li>'+
  '<li><h3>Choose a length</h3><div class="dz-len" role="radiogroup" aria-label="Game length">'+["full","quick"].map(k=>'<label class="dz-chip-radio"><input type="radio" name="dzlen" value="'+k+'"'+((prev.len||"full")===k?" checked":"")+'> <b>'+DZ_LEN[k].label+'</b><span>'+DZ_LEN[k].mins+'</span></label>').join("")+'</div></li>'+
  '<li><h3>Press play</h3><div class="bk-go"><button class="btn dz-play" onclick="go()">Play</button>'+(saved?'<button class="btn b" onclick="cont()">Continue saved game</button>':"")+'</div></li>'+
  '</ol>'+
  '<p class="dz-rules-link"><a href="rules.html">New here? How to play</a><span aria-hidden="true">&#8226;</span><a href="booklet.pdf" target="_blank" rel="noopener">Rules booklet (PDF)</a></p>'+
  '<details class="dz-opts"'+(seedQ?" open":"")+'><summary>Game options</summary>'+
  '<label>Screens'+sel("dz-mode",[["tv","TV only · everyone sees the role briefings"],["phones","TV + phone briefings · private briefings by QR code"],["live","TV + phone controllers · phones vote and act (beta, needs internet)"]],prev.mode||"tv")+'</label>'+
  '<label>Difficulty'+sel("dz-diff",Object.keys(DZ_DIFF).map(k=>[k,DZ_DIFF[k].label+" · "+DZ_DIFF[k].blurb]),prev.diff||"normal")+'</label>'+
  '<label class="dz-check"><input type="checkbox" id="dz-goals"'+(prev.goals===false?"":" checked")+'> Personal goals: each player gets a private goal, revealed at the end</label>'+
  '<label class="dz-check"><input type="checkbox" id="dz-vote"'+(prev.vote===false?"":" checked")+'> Secret votes on big decisions (pass the device)</label>'+
  '<label class="dz-check"><input type="checkbox" id="dz-insider"'+(prev.insider?" checked":"")+'> The Insider: one player is secretly working against you (3+ players, ages 12+)</label>'+
  '<label>Town seed <span class="s">(leave blank for a new town; share a seed to replay the same one)</span><input id="dz-seed" maxlength="8" placeholder="e.g. K7Q2" value="'+esc(seedQ)+'"></label>'+
  '</details>'+(typeof dzCampPanel==="function"?dzCampPanel():"")+
  '<p class="s c bk-small">1–8 players · best with 3–6 · one player = practice mode · <a href="versions.html">older versions</a></p></section>';
 return '<div class="bk-spread">'+cover+setup+'</div>';
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
 if(!S||!S.v||S.ver!==DZ_SAVE_VER){S=null;dzToast("That save is from an older version. Starting fresh.");try{localStorage.removeItem(DZ_SAVE)}catch(e){}R();return}
 dzInit();dz21Init();dzArcPrepDilemmas();R();
}
function restart(){if(confirm("Start a new game? The saved game will be deleted.")){try{localStorage.removeItem(DZ_SAVE)}catch(e){}S=null;R()}}

/* ---------- the board ---------- */
function board(){
 const t=S.t,a=S.a,tk=(n,k,i)=>'<div class="trk" data-trk="'+k+'" data-v="'+t[k]+'">'+i+" "+n+'<b>'+t[k]+'</b><div class="pp">'+"●".repeat(t[k])+"○".repeat(6-t[k])+'</div></div>';
 return '<div class="pn c">'+tk("Supplies","supplies","🥫")+tk("Health","health","❤️")+tk("Cohesion","cohesion","🤝")+tk("Trust","trust","🏘️")+
 '<div style="margin:6px 0"><span data-trk="fuel" data-v="'+a.fuel+'">⛽ Fuel <b>'+a.fuel+'</b></span> · <span data-trk="signal" data-v="'+a.signal+'">📻 Signal <b>'+a.signal+'</b></span> · <span data-trk="medkits" data-v="'+a.medkits+'">✚ Medkits <b>'+a.medkits+'</b></span> · <span data-trk="contacts" data-v="'+a.contacts+'">🏠 Contacts <b>'+a.contacts+'</b></span> · ⏳ Crisis <b>'+S.crisis+'/'+dzCrisisMax()+'</b></div>'+
 '<div>MISSION: <span class="hb '+(S.hub.warmth?"on":"")+'">🔥 Warmth</span><span class="hb '+(S.hub.water?"on":"")+'">💧 Water</span><span class="hb '+(S.hub.info?"on":"")+'">📻 Information</span></div>'+
 '<div class="s">'+dzDayLabel()+' · '+esc(dzActLabel())+' · Coordinator: <b>'+esc(S.pl[S.co].n)+'</b> · '+dzDiff().label+' · Town seed <b class="dz-seed">'+esc(S.seed)+'</b></div>'+
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
 return '<div class="dz-strip">'+A.map(id=>{const x=S.th[id],n=dzClock(id),hot=x.clock>=n-1;return '<div class="dz-st dz-strip-i'+(hot?" hot":"")+'" data-sfx="'+(S.lastTick&&S.lastTick[id]?"tick":"none")+'" data-wait="450"><span class="dz-strip-art" aria-hidden="true" style="background-image:url(art/'+id.toLowerCase()+'.jpg)"></span><b class="dz-strip-n">'+IC[id]+" "+TH[id][0]+'</b><div class="clk">'+Array.from({length:n},(_,i)=>id==="T3"?"<i>?</i>":'<i class="'+(i<x.clock?"on":"")+(S.lastTick&&S.lastTick[id]&&i===x.clock-1?" dz-newpip":"")+'"></i>').join("")+'</div></div>'}).join("")+'</div>';
}
/* A framed booklet panel for an existing picture (colour art, caption box, numbered corner tab). */
function dzFrame(key,cap,cls){return '<figure class="dz-panel'+(cls?" "+cls:"")+'">'+art(key,"").replace('class="art"','class="art"'+(cap?' data-cap="'+esc(cap)+'"':""))+'</figure>'}

/* ---------- the Day: 📰 Morning News → 🗣️ Discuss → ✋ Decide → 🌙 Night ---------- */
const DZ_ONE_LINE={SIG:"knows which rumours are true, and runs the radio desk",QM:"drives the van and spends the Fuel",MED:"keeps people alive and spots deadly mistakes",LOC:"knows everyone in town, and every back door",RUN:"kid role: runs messages and quick jobs",HST:"kid role: tea, blankets and kindness",MEC:"fixes generators, pumps and radios",LIA:"gets official answers from the council"};
function dzTeamBox(){
 return '<div class="sec">👥 Who you are</div><div class="pn">'+S.pl.map(p=>'<div class="dz-teamline">'+(typeof dzPortrait==="function"?dzPortrait(RL[p.r[0]].ch):"")+'<b>'+esc(p.n)+'</b> '+p.r.map(r=>'<span style="color:'+RL[r].c+'">'+RL[r].i+" "+RL[r].ch+'</span> <span class="s">('+RL[r].n+": "+DZ_ONE_LINE[r]+')</span>').join(" & ")+'</div>').join("")+'</div>';
}
function dzCastRow(names){
 const n=(names||[]).filter(x=>DZ_CAST[x]);if(!n.length)return "";
 return '<div class="dz-cast">'+n.map(x=>'<span class="dz-cast-i">'+dzFace(x)+'<b>'+esc(x)+'</b></span>').join("")+'</div>';
}
/* "Previously…": yesterday's key choice + yesterday's cliffhanger (+ a linking line if a short game skipped ahead). */
function dzRecap(){
 const p=dzPrevRound();if(!p)return "";
 const lines=[],d=(S.decLog||[]).filter(x=>x.round===p).pop();
 if(d&&typeof DZ_DEC_HEAD!=="undefined"&&(DZ_DEC_HEAD[d.dl]||{})[d.id])lines.push((DZ_DEC_EMOJI[d.dl]||"⚖️")+" Yesterday: "+DZ_DEC_HEAD[d.dl][d.id]+".");
 else if(S.prevDay&&S.prevDay.sum)lines.push("Yesterday: "+S.prevDay.sum);
 if(S.prevDay&&S.prevDay.cliff)lines.push(S.prevDay.cliff);
 const br=dzArcBridge();
 if(!lines.length&&!br)return "";
 return '<div class="dz-prevon"><div class="dz-kick">Previously…</div>'+lines.slice(0,2).map(x=>'<p>'+esc(x)+'</p>').join("")+(br?'<p class="dz-bridge"><i>'+esc(br)+'</i></p>':"")+'</div>';
}
function vNews(){
 const r=S.round,a=dzArc(),first=dzRoundIdx()===0;
 const co=first&&typeof dzColdOpenText==="function"?dzColdOpenText():null;
 let prose="";
 if(first){
  const ring=co&&co.ring||"📞 Then a phone rings. Mr Aldous’s daughter: <i>“Dad’s breathing machine is beeping. He’s on the 9th floor. Please help.”</i>";
  prose=(co&&co.paras&&S.ep>1?co.paras.map(x=>'<p>'+x+'</p>').join(""):'<p class="dz-lede">'+esc(a.lede)+'</p>')+'<p class="dz-st" data-sfx="ring" data-wait="900">'+ring+'</p>';
 }else prose=dzRecap()+'<p class="dz-lede">'+esc(a.lede)+'</p>';
 let h=dzTrack()+'<section class="dz21-page dz-news"><div class="dz21-head"><div class="dz21-kicker">'+(first?"📰 Breaking news":"📰 Morning news")+' · '+dzDayLabel()+'</div><h2>'+esc(a.head)+'</h2><span>'+esc(dzActLabel()+(a.when?" · "+a.when:""))+'</span></div>'+
  '<div class="dz21-hero">'+art("ev"+r,"📰")+'</div><div class="dz21-prose"><div class="dz21-reader">'+dz21Attribution()+'</div>'+prose+
  '<div class="dz-question"><span>❓ Today’s question</span>'+esc(a.q)+'</div>'+dzCastRow(a.cast)+'</div></section>';
 h+=goal();
 if(first)h+=dzTeamBox();
 if(S.br.length)h+=dzTip("echo","🔖 <b>Remembered</b> cards are earlier choices coming back. Watch the story track: a ⏳ chip means a choice will come back later.")+'<div class="sec">🔖 Because of earlier choices</div><div class="row">'+S.br.map(b=>'<div class="dz-st" data-sfx="flip">'+card({t:b.t,a:"echo",i:"🔖",f:b.x,b:b.w?"<i>"+b.w+"</i>":"",g:b.w?"REMEMBERED":"NEWS",sm:1})+'</div>').join("")+'</div>';
 if(S.nw.length)h+='<div class="sec">⚠️ New problems</div><div class="row">'+S.nw.map(id=>'<div class="dz-st" data-sfx="alarm">'+thC(id)+'</div>').join("")+'</div>';
 h+=dzEventCard();
 const blocked=S.ev&&!S.ev.done;
 return h+'<div class="c"><button class="btn" '+(blocked?"disabled":"")+' onclick="dzGo(\'discuss\')">🗣️ Discuss: what do you each know? →</button>'+(blocked?'<p class="s">Settle the card above first.</p>':"")+'</div>'+foot();
}

/* Story & Crossroads cards */
function dzEventCard(){
 if(!S.ev)return "";const e=dzEventById(S.ev.id);if(!e)return "";const who=dzEventWho(e);
 let body=(e.cast?'<div class="dz-cardcast">'+dzFace(e.cast)+'<b>'+esc(e.cast)+'</b></div>':"")+'<div class="fl">'+e.x+'</div><p><b>'+esc(who?who.n:"The coordinator")+'</b> decides'+(e.who!=="ANY"?" ("+RL[e.who].i+" "+RL[e.who].n+")":"")+'. Quickly!</p>';
 if(!S.ev.done)body+=e.o.map((o,i)=>'<button class="btn opt '+(i?"b":"")+'" '+(o[2]&&!o[2]()?"disabled":"")+' onclick="dzEventChoose('+i+')">'+o[0]+'<div>⚡ '+o[1]+'</div></button>').join("");
 else body+='<p class="dz-st" data-sfx="none">✔ <b>'+e.o[S.ev.done.i][0]+'.</b> '+esc(S.ev.done.msg)+'</p>';
 const story=!!e.story;
 return '<div class="sec">'+(story?"🔖 Story card":"🔀 Crossroads")+'</div>'+(story?"":dzTip("crossroads","Crossroads cards are small surprises. The named player makes the call, right now, without a long debate."))+'<div class="row"><div class="dz-st" data-sfx="flip">'+card({t:e.t,a:"echo",i:e.i,b:body,g:story?"STORY CARD":"CROSSROADS",c:story?"#ffc24a":"#c593e5"})+'</div></div>';
}

/* ---------- 🗣️ Discuss ---------- */
function dzHints(){
 const advice=[];
 if(act("T2")&&!S.f.acc)advice.push("Tower block: Marta can ask Mr Osei to unlock the back stairs, and Pavel can climb up the same Day.");
 if(act("O1")&&!S.f.lind)advice.push("Supermarket: Marta must get Mrs Lindqvist's agreement before Ines collects the freezer food. Both can happen the same Day.");
 if(!S.f.gTest&&!S.hub.warmth)advice.push("Warmth: test the generator first, then set it up somewhere safe outdoors. Or ask Bram for firewood.");
 if(S.a.signal<=1&&dzRoundIdx()>=1)advice.push("Signal is low. A working hall radio point gives Theo +1 Signal every morning.");
 if(act("T10"))advice.push("Grid crew: they need a guide, fuel and someone on the radio, all on the same Day.");
 if(!advice.length)return "";
 return '<details class="pn dz22-teamwork"><summary>💡 Stuck? Open a hint</summary>'+advice.slice(0,3).map(x=>'<p>'+esc(x)+'</p>').join("")+'</details>';
}
function dzDayQR(){
 return '<div class="dz24-qr-grid">'+S.pl.map((p,i)=>'<article class="dz24-qr-person"><div class="dz24-player-number">PLAYER '+(i+1)+' OF '+S.pl.length+'</div><h3>'+esc(p.n)+'</h3><div class="dz24-player-roles">'+p.r.map(r=>esc(RL[r].i+" "+RL[r].n)).join(" · ")+'</div><div class="dz24-qr" id="dz24-qr-'+i+'"></div><p class="dz24-qr-caption">Scan for your Day '+dzDayNo()+' cards</p><a class="dz24-openlink" target="_blank" rel="noopener" href="'+esc(dz24PhoneUrl(i))+'">Open on this device ↗</a></article>').join("")+'</div>'+
 '<p class="c s">Each code is for today only. No phones? <button class="dz24-linkbtn" onclick="dz24SwitchToTV()">Show the cards on the TV instead</button></p>';
}
function vDiscuss(){
 const first=dzRoundIdx()===0,live=typeof dzLiveOn==="function"&&dzLiveOn(),mode=live?"live":dz24Mode();
 let h=dzTrack()+'<div class="dz24-lead"><div class="dz24-eyebrow">🗣️ Discuss · '+dzDayLabel()+'</div><h2>What do you each know?</h2><p>'+
  (mode==="live"?"Read your private cards on your phone.":mode==="phones"?"Scan your code to read your private cards on your phone.":"Each of you reads your own cards out loud.")+
  ' Some are <b>verified</b>, some are <b>rumours</b>. Then agree a plan.</p></div>';
 if(first)h+=dzTip("first","<b>Your first move:</b> Mr Aldous needs two people. 🏠 Marta can get Mr Osei to unlock the stairs, and ✚ Pavel can climb up. Everyone else: start on the Hub. On Day 1, each role gets <b>one</b> action.");
 else if(dzRoundIdx()===1)h+=dzTip("two","From Day 2, each role gets <b>two</b> actions a Day.");
 if(live)h+=dzLivePanel("intel");
 else if(mode==="phones")h+=dzDayQR();
 else h+=S.pl.map(p=>'<h3 class="dz-hand-name">'+esc(p.n)+'</h3>'+dz24PlayerHand(p,S.round)).join("");
 const A=Object.keys(S.th).filter(act);
 if(A.length)h+='<div class="sec">⚠️ Problems right now</div><div class="row">'+A.map(thC).join("")+'</div>';
 h+=dzHints()+(first?"":dzPanel());
 h+='<div class="pn dz-steps"><b>1.</b> Share what you know. <b>2.</b> Which cards are rumours? <b>3.</b> Agree who does what.</div>';
 return h+'<div class="c"><button class="btn" onclick="dzGo(\'decide\')">✋ We\'ve talked · Decide →</button></div>';
}
function dz24FinishBriefings(){if(S.ph==="discuss")dzGo("decide")}

/* ---------- ✋ Decide ---------- */
function dzDilemmaCard(){
 const d=DL[S.dl],showLater=S.diff==="easy";
 const who=d[0]?'<b>The '+RL[d[0]].n+'</b> breaks ties.':'<b>The coordinator</b> breaks ties.';
 let side="";
 if(S.dc){const o=d[4].find(x=>x[0]===S.dc);side='<div class="dz-decided"><div class="dz-kick">DECIDED'+(S.decLog.length&&S.decLog[S.decLog.length-1].tally?" BY SECRET VOTE":"")+'</div><h3>'+o[1]+'</h3><p>⚡ '+o[2]+'</p><p class="s">🔖 The town will remember this.</p></div>';}
 else if(S.vote&&!S.together){side=dzTip("vote","<b>Secret vote.</b> Talk it through, then pass the device around. Everyone votes privately; the majority decides. If three or more of you all agree, Cohesion +1.")+'<button class="btn" onclick="dzStartVote()">🗳️ Secret vote</button><p class="s">'+who+' <button class="dz24-linkbtn" onclick="S.together=1;R()">or decide together on this screen</button></p>';}
 else side=d[4].map((o,i)=>'<button class="btn opt '+(i?"b":"")+'" '+(o[0]==="share"&&S.t.supplies<1?"disabled":"")+' onclick="choose(\''+o[0]+'\')">Option '+"ABC"[i]+': '+o[1]+'<div>⚡ <b>Now:</b> '+o[2]+'</div>'+(showLater?'<div>🔮 <b>Later:</b> '+o[5]+'</div>':"")+'</button>').join("");
 return '<div class="sec">⚖️ Today’s big decision</div><div class="row">'+card({t:d[1],a:S.dl.toLowerCase(),i:d[2],f:d[3],b:d[0]?'Decided by the '+RL[d[0]].n+' after listening to everyone.':'A group decision.',g:"DILEMMA"})+'<div class="pn" style="max-width:460px">'+side+'</div></div>';
}
function vDecide(){
 const pending=!!(S.dl&&!S.dc);
 let h=dzTrack()+'<div class="dz24-lead"><div class="dz24-eyebrow">✋ Decide · '+dzDayLabel()+'</div><h2>'+esc(dzArc().q)+'</h2></div>';
 if(S.dl)h+=dzDilemmaCard();
 else h+=dzFrame(dzRoundIdx()===0?"teach":"ev"+S.round,dzRoundIdx()===0?"Planning by candlelight at the hall.":dzArc().head+" · making the plan","dz-decide-panel");
 if(pending)return h+dzClockStrip()+'<p class="c s">Settle the big decision first. Then each role picks its actions.</p>';
 if(dzRoundIdx()===0)h+=dzTip("orders","Everything you choose happens together when night falls. If one action needs another (like unlocking the stairs before the climb), choose <b>both</b> now.");
 return h+dzClockStrip()+dz24Orders();
}

/* ---------- 🌙 Night ---------- */
function dzOutroParts(){
 const html=dz21Outro(),t=(html.match(/<h3>([\s\S]*?)<\/h3>/)||[])[1]||"Night falls",b=(html.match(/<p>([\s\S]*?)<\/p>/)||[])[1]||"";
 const un=x=>x.replace(/&amp;/g,"&").replace(/&lt;/g,"<").replace(/&gt;/g,">").replace(/&quot;/g,'"');
 return {title:un(t),body:un(b)};
}
function dzNightStory(){
 const rs=Array.isArray(S.report)?S.report:[],ok=rs.filter(x=>x.status==="done"),miss=rs.filter(x=>x.status!=="done");
 const first=s=>{const m=String(s).match(/^.*?[.!?](\s|$)/);return (m?m[0]:String(s)).trim()};
 const paras=[];
 const o=S.prevDay&&S.prevDay.r===S.round?S.prevDay:dzOutroParts();
 if(o.body||o.sum)paras.push(o.sum||o.body);
 const hi=ok.filter(x=>!["cmf","trt"].includes(x.id)).slice(0,2).map(x=>first(dz22ResultText(x)));
 if(hi.length)paras.push(hi.join(" "));
 if(!rs.length)paras.push("Nobody made it out of the hall today.");
 else if(miss.length)paras.push(miss.length===1?"One plan fell through.":miss.length+" plans fell through.");
 const notes=(S.esc||[]).map(dz22Plain),bad=notes.filter((x,i)=>/clock full|Bitter cold|shivers|freezing|Nobody climbed|Rain soaks/.test(S.esc[i]));
 if(bad.length)paras.push("Then the night closed in. "+bad.slice(0,2).map(x=>x.replace(/: clock full!/,": time ran out.")).join(" "));
 else if(notes.some((x,i)=>/✅/.test(S.esc[i])))paras.push(notes.filter((x,i)=>/✅/.test(S.esc[i]))[0]);
 return paras;
}
/* "While you slept": a night picture, the night told as short story lines, then the problem clocks. */
const DZ_TICK={T2:"Up on the 9th floor, Mr Aldous's oxygen machine beeps a little faster.",T1:"Across the river, the clinic's generator coughs through another night.",O1:"Mrs Lindqvist's freezers creep a few degrees warmer.",T4:"The tower block's upper floors go another night without water.",T6:"The queue at the petrol station grows longer, and angrier.",O2:"Somewhere in town, the hidden fuel is slowly being used up.",T8:"On Marta's street, another candle burns too close to the curtains.",T9:"The break-in rumour creeps from door to door.",T10:"The grid crew waits another night at the council point."};
const DZ_FULL={T2:"Time ran out for Mr Aldous. An ambulance took him to hospital.",T1:"The clinic generator died in the night.",O1:"Mrs Lindqvist's freezers thawed. The food is spoiled.",T3:"The water tower ran dry.",T4:"The tower block's upper floors ran out of water.",T6:"The crowd at the petrol station boiled over.",O2:"The hidden fuel is gone.",T8:"The candle fire took hold on Marta's street.",T9:"Scared neighbours started guarding their doors against each other.",T10:"The grid crew gave up waiting."};
/* Per-Day night pictures (art/<key>.jpg), filled in as new art arrives; until then every night uses the snowy window. */
const DZ_NIGHT_ART={};
function dzNightLine(x){
 const t=String(x||""),idOf=n=>Object.keys(TH).find(k=>TH[k][0]===n);
 let m=t.match(/^⏳\s*(.+): clock (\d+)\/(\d+)$/);
 if(m){const id=idOf(m[1]);return {cls:"",txt:DZ_TICK[id]||m[1]+" gets worse ("+m[2]+" of "+m[3]+")."}}
 m=t.match(/^✖\s*⏰\s*(.+): clock full! (.*)$/);
 if(m){const id=idOf(m[1]);return {cls:"no",txt:(DZ_FULL[id]||"Time ran out: "+m[1]+".")+" "+m[2]}}
 return {cls:/✖/.test(t)?"no":/✅/.test(t)?"ok":"",txt:dz22Plain(t)};
}
function dzSlept(){
 const told=dzNightStory().join(" "),key=DZ_NIGHT_ART[S.round]||"echo";
 let L=(S.esc||[]).map(dzNightLine).filter(l=>!(l.cls!=="no"&&l.txt&&told.includes(l.txt)));
 if(!L.length)L=[{cls:"",txt:"A quiet night on Mill Lane. Nothing new went wrong."}];
 return '<div class="sec">⏳ While you slept</div><div class="dz-slept">'+dzFrame(key,"Night "+dzDayNo()+" on Mill Lane","dz-night-panel")+
  '<div class="dz-slept-txt">'+L.map(l=>'<p class="dz-st'+(l.cls?" "+l.cls:"")+'" data-sfx="'+(l.cls==="no"?"fail":l.cls==="ok"?"success":"tick")+'" data-wait="500">'+esc(l.txt)+'</p>').join("")+dzClockStrip()+'</div></div>';
}
function vNight(){
 const seq=dzSeq(),i=dzRoundIdx(),nxR=seq[i+1],more=nxR&&!S.broke;
 const pd=S.prevDay&&S.prevDay.r===S.round?S.prevDay:{title:dzOutroParts().title,cliff:dzArc().cliff};
 let h=dzTrack()+'<section class="dz21-page dz-night"><div class="dz21-head"><div class="dz21-kicker">🌙 Night · '+dzDayLabel()+'</div><h2>'+esc(pd.title||"Night falls")+'</h2><span>'+esc(dzArc().head)+'</span></div>'+
  '<div class="dz21-prose"><div class="dz21-reader">'+dz21Attribution()+'</div>'+dzNightStory().map(p=>'<p>'+esc(p)+'</p>').join("")+'</div></section>';
 h+='<div class="sec">🃏 How each plan went</div>'+dz22ResultCards();
 if((S.esc||[]).length)h+=dzSlept();
 h+=dif(S.pre);
 if(pd.cliff)h+='<div class="dz-cliff dz-st" data-sfx="drum" data-wait="1200"><div class="dz-kick">'+(more?"To be continued…":"And then…")+'</div><p>'+esc(pd.cliff)+'</p>'+(more?'<p class="dz-tomorrow">☀️ Tomorrow: <b>Day '+(i+2)+' · '+esc(dzArc(nxR).head)+'</b></p>':"")+'</div>';
 h+='<div class="sec">🏘️ Your town</div>'+board();
 return h+'<div class="c"><button class="btn" onclick="nextRound()">'+(more?"☀️ Next morning: Day "+(i+2)+" →":"📰 See how it ends →")+'</button></div>';
}
/* Lock-in resolves the actions AND the night in one go, so the Night is one screen. */
const dzResolveBase=resolve;
resolve=function(){
 const pre=snap(),r0=R;R=function(){};
 try{dzResolveBase();if(S.ph==="res")escal()}finally{R=r0}
 if(S.ph==="esc"){
  S.pre=pre;S.ph="night";const o=dzOutroParts(),a=dzArc();
  S.prevDay={r:S.round,head:a.head,title:o.title,sum:o.body,cliff:a.cliff};
 }
 sv();R();
};
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

function dz24PhoneUrl(index){
 const p=S.pl[index],path=window.location.href.split("#")[0].split("?")[0],base=path.substring(0,path.lastIndexOf("/")+1);
 let u=base+"phone.html#round="+S.round+"&day="+dzDayNo()+"/"+dzDays()+"&act="+encodeURIComponent(dzActLabel())+"&roles="+encodeURIComponent(p.r.join(","))+"&name="+encodeURIComponent(p.n)+"&seed="+encodeURIComponent(S.seed);
 if(S.goalsShown&&(S.goalsOn||index===S.insider))u+="&g="+encodeURIComponent(dzGoalToken(S.seed,S.goals[index],index===S.insider));
 return u;
}
/* ---------- result & time cards: staged, with rumour stamps ---------- */
const DZ_VERDICT={iMid:"FALSE",iArm:"FALSE",iEva:"FALSE",iWat:"OUT OF DATE",iBrk:"FALSE",iSab:"UNPROVEN"};
function dzVerdict(id){if(id==="iTan")return S.v&&S.v.tanker==="tomorrow"?"HALF TRUE":"FALSE";return DZ_VERDICT[id]}
function dz22ResultCards(){
 const reports=Array.isArray(S.report)?S.report:[];
 if(!reports.length)return '<div class="pn"><p>Nobody acted today.</p></div>';
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
  return '<article class="dz-st dz22-result'+(full?" dz-alarm":"")+'" data-sfx="'+(full?"alarm":good?"success":warn?"fail":"tick")+'" data-wait="'+(full?1400:900)+'"'+(full?' data-shake="1"':"")+' style="--dz22:'+(good?"#6bd59f":warn?"#e39b75":"#9bb4df")+'"><div class="dz22-art">'+art(artFor(note),"⏳")+'</div><div class="dz22-details"><div class="dz22-kicker">NIGHT · DAY '+dzDayNo()+'</div><h4>'+heading+'</h4><p>'+esc(msg)+'</p></div></article>';
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
  const V={news:S.lobby&&typeof vLobby==="function"?vLobby:S.prevPending?vPrev:vNews,discuss:vDiscuss,decide:vDecide,night:vNight,end:dzChronicle,
   goals:dzGoalsView,vote:dzVoteView,vreveal:dzVoteReveal,accuse:dzAccuseView,accrev:dzAccuseReveal}[S.ph];
  html=V?V():'<p>Something went wrong. <button class="btn" onclick="restart()">New game</button></p>';
  html=dzVText(S.v,html);
 }
 A.innerHTML=html;window.scrollTo(0,0);
 if(S&&S.ph==="discuss"&&dz24Mode()==="phones")dz24QR();
 dzAfterRender(S?S.ph+":"+S.round:"title");
}
