/*
  Day Zero: hidden information without a server.
  - Private personal goals (and the optional Insider), dealt by passing the device after Chapter 1.
  - Secret simultaneous votes on dilemmas: everyone votes in private, then a staged reveal.
  - The Insider's final accusation.
  Every private screen looks the same for every player (same buttons, same extra field),
  so onlookers can't tell who is the Insider from the screen.
*/
function dzLive(){return typeof dzLiveOn==="function"&&dzLiveOn()}
function dzMissing(done){for(let j=0;j<S.pl.length;j++)if(!done(j))return j;return -1}
function dzPassScreen(kicker,title,p,btn,onclick,extra){
 return '<div class="pn c dz-pass"><div class="dz24-eyebrow">'+kicker+'</div><h2>'+title+'</h2><p style="font-size:26px">Pass the device to<br><b style="color:#ffd166;font-size:46px">'+esc(p.n)+'</b></p>'+(extra||"")+'<p class="s">Everyone else, look away.</p><button class="btn" onclick="'+onclick+'">'+btn+'</button></div>';
}

/* ---------- goals ---------- */
function dzGoalCard(i){
 if(i===S.insider)return card({t:DZ_INSIDER.t,a:"echo",i:DZ_INSIDER.i,f:DZ_INSIDER.x,b:'<b>Your cover:</b> play along. Vote and plan like everyone else. In secret votes you will see an extra “quiet sabotage” choice.',g:"SECRET · INSIDER",c:"#e4572e"});
 const k=S.goals[i],g=DZ_GOALS[k];
 return card({t:g.t,a:"echo",i:g.i,f:g.x,b:'Keep it to yourself. Steer the group towards it if you can. It is revealed and scored when the story ends.'+(S.insiderOn?'<br><br><b>🕵️ Remember:</b> one of you is the Insider. It is not you.':""),g:"YOUR PRIVATE GOAL",c:"#c593e5"});
}
function dzGoalsView(){
 const g=S.gi;g.seen=g.seen||{};if(g.i<0)return dzLivePanel("goals");const p=S.pl[g.i];
 const intro=g.i===0&&!g.show?'<div class="dz-tip"><b>💡 New: private goals.</b> Each of you is quietly hoping for something. You still win or lose together, but your own goal is revealed and scored at the end.'+(S.insiderOn?" <b>And one of you is not what they seem…</b>":"")+'</div>':"";
 if(!g.show)return intro+dzPassScreen("BEFORE CHAPTER 2 · PRIVATE GOALS","Something only you know",p,"I'm "+esc(p.n)+": show me","S.gi.show=true;dzSfx('flip');R()");
 return '<h2>'+esc(p.n)+', this is for you only</h2><div class="row dz-st" data-sfx="none">'+dzGoalCard(g.i)+'</div><div class="c"><button class="btn" onclick="dzGoalNext()">Got it · hide &amp; pass on</button></div>';
}
function dzGoalNext(){
 const g=S.gi;g.seen=g.seen||{};if(g.i>=0)g.seen[g.i]=1;g.show=false;
 g.i=dzLive()?-1:dzMissing(j=>g.seen[j]);
 if(Object.keys(g.seen).length>=S.pl.length){dzGoalsDone();return}
 sv();R();
}
function dzGoalsDone(){if(S.ph!=="goals")return;S.goalsShown=true;startRound()}

/* ---------- secret votes ---------- */
function dzStartVote(){S.vt={i:dzLive()?-1:0,show:false,sel:null,b:[],dl:S.dl};S.ph="vote";dzSfx("vote");sv();R()}
function dzVoteOptionOk(o){return !(o[0]==="share"&&S.t.supplies<1)}
function dzVoteView(){
 const d=DL[S.dl],vt=S.vt,n=S.pl.length;if(vt.i<0)return dzLivePanel("vote");const p=S.pl[vt.i];
 if(!vt.show)return dzPassScreen("SECRET VOTE · BALLOT "+(vt.b.length+1)+" OF "+n,d[2]+" "+d[1],p,"I'm "+esc(p.n)+": open my ballot","S.vt.show=true;dzSfx('flip');R()");
 const me=vt.i,ins=me===S.insider;
 const others=S.pl.map((q,j)=>j).filter(j=>j!==me);
 let extra='<label class="dz-private">🤫 Private note <span class="s">(nobody sees this until the end)</span><select id="dz-x">';
 if(ins){const left=2-(S.sab||[]).length;extra+='<option value="">Nothing to note</option>'+(left>0?'<option value="sab:fuel">🕵️ Quiet sabotage: drain 1 Fuel from the van ('+left+' left)</option><option value="sab:supplies">🕵️ Quiet sabotage: spoil 1 Supplies ('+left+' left)</option>':"")+others.map(j=>'<option value="sus:'+j+'">I don\'t fully trust '+esc(S.pl[j].n)+'</option>').join("");}
 else extra+='<option value="">Nothing to note</option>'+others.map(j=>'<option value="sus:'+j+'">I don\'t fully trust '+esc(S.pl[j].n)+'</option>').join("");
 extra+='</select></label>';
 if(!S.insiderOn)extra="";
 return '<div class="dz24-lead"><div class="dz24-eyebrow">SECRET BALLOT · '+esc(p.n).toUpperCase()+'</div><h2>'+d[2]+" "+d[1]+'</h2><p>'+d[3]+'</p></div><div class="pn dz-ballot">'+
 d[4].map((o,i)=>'<button class="btn opt '+(vt.sel===o[0]?"":"b")+'" '+(dzVoteOptionOk(o)?"":"disabled")+' onclick="S.vt.sel=\''+o[0]+'\';dzSfx(\'tick\');R()">'+(vt.sel===o[0]?"☑ ":"☐ ")+'Option '+"ABC"[i]+': '+o[1]+'<div>⚡ '+o[2]+'</div></button>').join("")+extra+
 '<div class="c"><button class="btn" '+(vt.sel?"":"disabled")+' onclick="dzCast()">Cast my vote &amp; hide</button></div></div>';
}
function dzCast(){
 const vt=S.vt;if(!vt.sel)return;const x=document.getElementById("dz-x");
 if(!vt.b.some(b=>b.who===vt.i))vt.b.push({who:vt.i,opt:vt.sel,x:x?x.value:""});vt.show=false;vt.sel=null;dzSfx("vote");
 vt.i=dzLive()?-1:dzMissing(j=>vt.b.some(b=>b.who===j));
 if(vt.b.length>=S.pl.length){dzTally();return}
 sv();R();
}
function dzTally(){
 if(S.ph!=="vote")return;
 const d=DL[S.dl],vt=S.vt,counts={};d[4].forEach(o=>counts[o[0]]=0);
 vt.b.forEach(b=>counts[b.opt]++);
 const max=Math.max(...Object.values(counts)),tied=Object.keys(counts).filter(k=>counts[k]===max);
 let winner=tied[0],tieBy=null;
 if(tied.length>1){
  const breakerIdx=d[0]?S.pl.findIndex(p=>p.r.includes(d[0])):S.co;const bb=vt.b.find(b=>b.who===breakerIdx);
  if(bb&&tied.includes(bb.opt))winner=bb.opt;tieBy=S.pl[breakerIdx].n+(d[0]?" ("+RL[d[0]].n+")":" (Coordinator)");
 }
 const unanimous=S.pl.length>=3&&max===S.pl.length;
 const sab=[];
 vt.b.forEach(b=>{
  if(b.x.startsWith("sab:")&&b.who===S.insider&&(S.sab||[]).length+sab.length<2)sab.push({round:S.round,what:b.x.slice(4)});
  if(b.x.startsWith("sus:"))S.sus.push({round:S.round,by:b.who,of:+b.x.slice(4)});
 });
 const rng=dzRng(S.seed,"ballots"+S.round);
 S.vr={dl:S.dl,counts,winner,tieBy,unanimous,sab,order:dzShuffle(rng,vt.b.map(b=>b.opt))};
 S.lastTally=counts;S.lastHow="secret vote";
 S.ph="vreveal";sv();R();
}
function dzVoteReveal(){
 const d=DL[S.dl],vr=S.vr,n=S.pl.length,o=d[4].find(x=>x[0]===vr.winner),label=k=>{const i=d[4].findIndex(x=>x[0]===k);return "ABC"[i]+": "+d[4][i][1]};
 let h='<h2>'+d[2]+' The votes are in…</h2><div class="dz-ballots">'+vr.order.map((k,i)=>'<div class="dz-st dz-ballotcard" data-sfx="flip" data-wait="900"><div class="dz-bk">BALLOT '+(i+1)+'</div><div class="dz-bv">'+label(k)+'</div></div>').join("")+'</div>';
 h+='<div class="pn dz-st dz-tally" data-sfx="drum" data-wait="1500">'+d[4].map(x=>'<div class="dz-bar"><span>'+label(x[0])+'</span><i style="--w:'+(100*vr.counts[x[0]]/n)+'%"></i><b>'+vr.counts[x[0]]+'</b></div>').join("")+(vr.tieBy?'<p>⚖️ A tie. <b>'+esc(vr.tieBy)+'</b> casts the deciding vote.</p>':"")+'</div>';
 h+='<div class="dz-st dz-verdict" data-sfx="success" data-wait="1200"><div class="dz-kick">THE HALL DECIDES</div><h3>'+o[1]+'</h3><p>⚡ '+o[2]+'</p>'+(vr.unanimous?'<p class="dz-uni">🤝 Unanimous! The hall speaks with one voice. Cohesion +1.</p>':"")+'</div>';
 if(vr.sab.length)h+=vr.sab.map(s=>'<div class="dz-st dz-sab" data-sfx="alarm" data-shake="1" data-wait="1400">🕵️ While everyone was voting, someone slipped into the storeroom. '+(s.what==="fuel"?"<b>1 Fuel is missing from the van.</b>":"<b>1 Supplies has been spoiled.</b>")+'</div>').join("");
 return h+'<div class="c"><button class="btn" onclick="dzApplyVote()">Continue</button></div>';
}
function dzApplyVote(){
 const vr=S.vr;if(!vr||S.ph!=="vreveal")return;S.ph="council";
 choose(vr.winner);
 if(!S.dc){S.together=1;sv();R();return}
 if(vr.unanimous)tr("cohesion",1);
 vr.sab.forEach(s=>{S.sab.push(s);if(s.what==="fuel")S.a.fuel=Math.max(0,S.a.fuel-1);else tr("supplies",-1)});
 S.vr=null;chk();sv();R();
}

/* ---------- the Insider: final accusation ---------- */
function dzExonerated(){
 const clues=dzJournal().length,inn=S.pl.map((p,j)=>j).filter(j=>j!==S.insider);
 return dzShuffle(dzRng(S.seed,"exonerate"),inn).slice(0,Math.min(clues,inn.length-1));
}
function dzAccuseView(){
 const ac=S.ac;if(ac.i<0)return dzLivePanel("accuse");const p=S.pl[ac.i];
 const ex=dzExonerated();
 const evidence='<div class="pn"><h3>🔎 The evidence</h3>'+(ex.length?ex.map(j=>'<p>📋 Your evidence rules out <b>'+esc(S.pl[j].n)+'</b>.</p>').join(""):'<p>You found no hard evidence about the substation key. Trust your instincts.</p>')+'</div>';
 if(!ac.show)return (Object.keys(ac.b).length===0?'<h2>🕵️ Who had the key?</h2><div class="pn">The lights are coming back, but one question remains. One of you has been working against the hall all weekend. Each of you now names who you think the Insider is, in secret.</div>'+evidence:"")+dzPassScreen("THE ACCUSATION · BALLOT "+(Object.keys(ac.b).length+1)+" OF "+S.pl.length,"Who is the Insider?",p,"I'm "+esc(p.n)+": open my ballot","S.ac.show=true;dzSfx('flip');R()");
 return '<h2>'+esc(p.n)+': who do you accuse?</h2>'+evidence+'<div class="pn dz-ballot">'+S.pl.map((q,j)=>j===ac.i?"":'<button class="btn opt b" onclick="dzAccuse('+j+')">🫵 '+esc(q.n)+'</button>').join("")+'</div>';
}
function dzAccuse(j){
 const ac=S.ac;if(ac.i>=0&&j!==ac.i&&j>=0&&j<S.pl.length)ac.b[ac.i]=j;ac.show=false;dzSfx("vote");
 ac.i=dzLive()?-1:dzMissing(k=>k in ac.b);
 dzAccuseCheck();
}
function dzAccuseCheck(){
 const ac=S.ac;if(S.ph!=="accuse")return;
 if(Object.keys(ac.b).length>=S.pl.length){
  const c={};Object.values(ac.b).forEach(x=>c[x]=(c[x]||0)+1);const max=Math.max(...Object.values(c)),top=Object.keys(c).filter(k=>c[k]===max).map(Number);
  S.caught=top.length===1&&top[0]===S.insider;S.accTop=top;S.accVotes=c;S.accDone=true;S.ph="accrev";
 }
 sv();R();
}
function dzAccuseReveal(){
 const c=S.accVotes||{},ins=S.pl[S.insider];
 return '<h2>🕵️ The accusation</h2><div class="pn dz-tally dz-st" data-sfx="drum" data-wait="1600">'+S.pl.map((p,j)=>'<div class="dz-bar"><span>'+esc(p.n)+'</span><i style="--w:'+(100*(c[j]||0)/S.pl.length)+'%"></i><b>'+(c[j]||0)+'</b></div>').join("")+'</div>'+
 '<div class="dz-st dz-verdict '+(S.caught?"":"dz-bad")+'" data-sfx="'+(S.caught?"success":"alarm")+'" data-shake="'+(S.caught?"":"1")+'" data-wait="1400"><div class="dz-kick">THE INSIDER WAS…</div><h3>'+esc(ins.n)+'</h3><p>'+(S.caught?"Caught! The key is handed to the police.":"…and they got away with it. The key is never found.")+'</p></div>'+
 '<div class="c"><button class="btn" onclick="S.ph=\'end\';sv();R()">Read the Mill Lane Chronicle</button></div>';
}
