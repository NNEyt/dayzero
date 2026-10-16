/*
  Day Zero: "The Kelderwick Files", a three-episode campaign.
  Each episode is a complete ~30-minute game (four chapters). A few consequences carry
  forward in localStorage (key dz_campaign): Hillside remembers, Mr Aldous remembers,
  the street remembers what the radio told it, and the evidence piles up for Episode 3.
*/
const DZ_CAMP_KEY="dz_campaign";
const DZ_EPISODES={
 1:{t:"Blackout",month:"November",seq:[1,2,6,7],blurb:"The night the lights went out. Help Mr Aldous, save the clinic, and get the repair crew to the substation."},
 2:{t:"The Water Week",month:"January",seq:[1,3,4,7],blurb:"An ice storm, frozen mains, and a town that runs dry while the phones fall silent."},
 3:{t:"Who Had the Key?",month:"March",seq:[1,5,6,7],blurb:"A grid inspector comes to town. The lights go out a third time. Somebody had a key."}
};
for(const n in DZ_EPISODES)DZ_LEN["ep"+n]={label:"Episode "+n+": "+DZ_EPISODES[n].t,mins:"about 30 min",seq:DZ_EPISODES[n].seq,episode:+n};

function dzCamp(){try{const c=JSON.parse(localStorage.getItem(DZ_CAMP_KEY)||"null");return c&&c.v===1?c:null}catch(e){return null}}
function dzCampSave(c){try{localStorage.setItem(DZ_CAMP_KEY,JSON.stringify(c))}catch(e){}}
function dzCampNew(diff){const c={v:1,diff:diff||"normal",started:Date.now(),eps:[],flags:{},next:1};dzCampSave(c);return c}
function dzCampCode(c){return btoa(unescape(encodeURIComponent(JSON.stringify(c))))}
function dzCampLoadCode(code){try{const c=JSON.parse(decodeURIComponent(escape(atob(String(code).trim()))));if(c&&c.v===1&&Array.isArray(c.eps)){dzCampSave(c);return c}}catch(e){}return null}

/* ---------- what carries over ---------- */
/* Each effect: [condition on flags, short label, story line, apply()] */
const DZ_CARRY=[
 [f=>f.aldous==="saved","🫁 Mr Aldous remembers","After last time, his daughter bought a spare battery. His clock runs one step longer.",()=>{S.campT2=1}],
 [f=>f.aldous==="hospital","🚑 The street remembers the ambulance","People haven't forgotten the night Mr Aldous was taken to hospital. Trust −1.",()=>tr("trust",-1)],
 [f=>f.stores==="open","🥫 You opened the stores","The street remembers the hall that shared. Trust +1.",()=>tr("trust",1)],
 [f=>f.stores==="keep","🥫 You kept the stores","There are still tins left from last time (Supplies +1), but some neighbours remember the closed door (Trust −1).",()=>{tr("supplies",1);tr("trust",-1)}],
 [f=>f.hillside==="share","🚱 Hillside remembers your water","Hillside owes you. On the coldest night, they will bring firewood, and the mill path is open to you.",()=>{S.f.e1=1}],
 [f=>f.hillside==="ref","🚧 Hillside remembers you said no","Hillside has put a barrier across the old mill path. Trust −1.",()=>{S.f.e2s=1}],
 [f=>f.hillside==="cont","🚱 Hillside remembers the containers","You gave them containers but no water. Nobody mentions it. Everybody remembers it.",()=>{}],
 [f=>f.tankerLie,"📢 The tanker that never came","People remember the radio promising a tanker. Trust −1.",()=>tr("trust",-1)],
 [f=>f.claim,"📡 The sabotage broadcast","Your sabotage broadcast is still being repeated around town. Cohesion −1.",()=>tr("cohesion",-1)],
 [f=>f.warmth,"🔧 The hall kept its generator","The generator was serviced after last time. It is already tested.",()=>{S.f.gTest=1}],
 [f=>f.info,"📻 The radio point stayed up","Theo kept the hall's radio point. Signal +1.",()=>{S.a.signal=Math.min(6,S.a.signal+1)}],
 [f=>f.early,"⚡ The crew remembers Mill Lane","The grid engineers remember who guided them through the dark. Trust +1.",()=>tr("trust",1)],
 [f=>f.broke,"💔 Last time ended badly","People are slower to come to the hall this time. Cohesion −1.",()=>tr("cohesion",-1)],
 [f=>(f.clues||[]).length>0,"🗂️ Your evidence file","You kept the evidence you found. It is in your journal again, and it will matter.",()=>{const d=dzInit();(S.camp.flags.clues||[]).forEach(k=>d.clues[k]=1)}]
];
function dzCarryList(flags){return DZ_CARRY.filter(x=>x[0](flags||{}))}

/* Called from start() when o.episode is set (after roles, before Chapter 1). */
function dzEpisodeSetup(o){
 const c=dzCamp()||dzCampNew(o.diff);
 S.ep=o.episode;S.camp={flags:JSON.parse(JSON.stringify(c.flags||{})),eps:c.eps.map(e=>({n:e.n,t:e.t,head:e.head,stars:e.stars}))};
 S.prevPending=S.ep>1;S.carried=[];
 if(S.ep>1)for(const x of dzCarryList(c.flags)){x[3]();S.carried.push([x[1],x[2]])}
 for(const k of Object.keys(S.t))S.t[k]=Math.max(1,Math.min(6,S.t[k]));
}
/* ---------- episode text ---------- */
function dzColdOpenText(){
 if(!S.ep||S.ep===1)return S.ep===1?{kick:"Episode 1 · ",title:"The lights go out.",paras:["November. Not just your street: the whole of Kelderwick is dark. Someone knocks on the community hall door: “Is anyone organising things here?” You look at each other. It seems you are."],ring:"📞 Then a phone rings. Mr Aldous’s daughter: <i>“Dad’s breathing machine is beeping. He’s on the 9th floor. Please help.”</i>"}:null;
 const f=S.camp.flags,ald=f.aldous==="saved"?"<i>“The spare battery’s working, but it won’t last for ever. Can you come?”</i>":f.aldous==="hospital"?"<i>“He’s only just home from hospital, and the machine is beeping again. Please, not like last time.”</i>":"<i>“Dad’s breathing machine is beeping. He’s on the 9th floor. Please help.”</i>";
 if(S.ep===2)return {kick:"Episode 2 · ",title:"Not again.",paras:["January. Seven weeks after the blackout, an ice storm coats every wire in Kelderwick with glass. At six minutes past six, the lights go out again.","Nobody knocks on the hall door this time. They just come in, stamping snow off their boots. "+(f.stores==="open"||f.early?"“We knew you'd be here,” says Mrs Grant.":"“Is it you lot again?” says Mrs Grant. It's hard to tell if she's pleased.")],ring:"📞 The phone rings. Mr Aldous’s daughter: "+ald};
 return {kick:"Episode 3 · ",title:"Third time.",paras:["March. Spring is late, and Kelderwick has questions. A grid inspector has come from the city to find out why the town keeps going dark.","That evening, as the inspector's car pulls up at the substation, the lights go out for the third time. Minutes later she is at the hall door: “I'm told this is where things get done. I'd like to know what you've seen.”"],ring:"📞 Before anyone can answer, the phone rings. Mr Aldous’s daughter: "+ald};
}
const DZ_EP_LINES={2:{3:"The ice storm has frozen the mains on the hill. In January, a dry tap isn't an inconvenience. It's dangerous.",4:"With ice on the masts, the phones fall silent a day early this time.",7:"The thaw comes on Sunday. So does the grid crew, if somebody can get them through."},
 3:{5:"The inspector asks to see the hall's noticeboard. “People here check things,” Marta tells her. “Mostly.”",6:"The crew's lead engineer is the same one as in November. She remembers Mill Lane.",7:"Before the power comes back, the inspector wants a word with everyone who saw anything."}};
function dzEpisodeChapterLine(){return S.ep&&DZ_EP_LINES[S.ep]&&DZ_EP_LINES[S.ep][S.round]||""}

/* ---------- "previously on" ---------- */
function vPrev(){
 const c=dzCamp()||{eps:[]},last=c.eps[c.eps.length-1],ep=DZ_EPISODES[S.ep];
 const decs=(last&&last.decs||[]).map(d=>'<li>'+(DZ_DEC_EMOJI[d.dl]||"⚖️")+" "+esc((DZ_DEC_HEAD[d.dl]||{})[d.id]||d.id)+'</li>').join("");
 return '<section class="dz21-page dz-prev"><div class="dz21-head"><div class="dz21-kicker">THE KELDERWICK FILES · EPISODE '+S.ep+' OF 3</div><h2>Previously on Day Zero…</h2></div><div class="dz21-prose">'+
 (last?'<p class="dz-st" data-sfx="page" data-wait="900"><b>Episode '+last.n+': '+esc(last.t)+'.</b> '+esc(last.recap||"")+'</p>':"")+
 (decs?'<div class="dz-st" data-sfx="flip" data-wait="900"><p><b>What you decided:</b></p><ul>'+decs+'</ul></div>':"")+
 (S.carried.length?'<div class="dz-st" data-sfx="drum" data-wait="1200"><p><b>What the town remembers:</b></p><ul class="dz-carry">'+S.carried.map(x=>'<li><b>'+x[0]+'.</b> '+x[1]+'</li>').join("")+'</ul></div>':'<p>The town starts this episode with a clean slate.</p>')+
 '<p class="dz-st" data-sfx="press" data-wait="700"><i>And now… Episode '+S.ep+': '+esc(ep.t)+'.</i></p></div></section>'+
 '<div class="c"><button class="btn" onclick="S.prevPending=false;dzSfx(\'page\');sv();R()">Start Episode '+S.ep+' →</button></div>';
}

/* ---------- end of an episode ---------- */
function dzEpisodeFlags(){
 const f={};
 if(S.th.T2)f.aldous=(S.th.T2||DZ_NOTH).fail?"hospital":"saved";
 if(S.dec.DL1)f.stores=S.dec.DL1;
 if(S.dec.DL2)f.hillside=S.dec.DL2;
 if((S.hist||[]).some(h=>h.rep.some(x=>x.id==="bA"&&x.status==="done")))f.tankerLie=true;
 if(S.dec.DL4==="claim")f.claim=true;
 if(S.hub.warmth)f.warmth=true;if(S.hub.info)f.info=true;
 if(S.f.pw&&S.f.pw<7)f.early=true;
 if(S.broke)f.broke=true;
 f.clues=Object.keys(dzInit().clues||{}).filter(k=>dzInit().clues[k]);
 if(S.insider>=0&&!S.broke)f.insider=S.caught?"caught":"escaped";
 return f;
}
function dzEpisodeRecord(){
 if(!S.ep||S.campDone)return;
 const c=dzCamp()||dzCampNew(S.diff),z=ending(),nf=dzEpisodeFlags(),of=c.flags||{};
 const merged=Object.assign({},of);
 // consequences that are one-off fade; long memories (Hillside, Aldous, clues) persist
 ["tankerLie","claim","broke","early"].forEach(k=>delete merged[k]);
 Object.assign(merged,nf);merged.clues=[...new Set([...(of.clues||[]),...(nf.clues||[])])];
 if(!nf.hillside&&of.hillside)merged.hillside=of.hillside;if(!nf.stores&&of.stores)merged.stores=of.stores;
 const rec={n:S.ep,t:DZ_EPISODES[S.ep].t,head:z.e[0],recap:z.e[1],stars:z.m+z.p+z.c,decs:(S.decLog||[]).map(d=>({dl:d.dl,id:d.id})),names:S.pl.map(p=>p.n),seed:S.seed};
 c.eps=c.eps.filter(e=>e.n!==S.ep);c.eps.push(rec);c.eps.sort((a,b)=>a.n-b.n);
 c.flags=merged;c.next=Math.min(4,S.ep+1);dzCampSave(c);
 S.campDone=true;sv();
}
function dzInquiry(){
 const c=dzCamp()||{flags:{}},clues=(c.flags.clues||[]).length,claim=S.dec.DL4==="claim";
 let h,t;
 if(clues>=2){h="Negligence, Then a Cover-Up";t="The clinic work order and the early repair message fit together. Substation maintenance was skipped for two winters, then the paperwork was backdated. The key was a contractor's spare that was never handed back. Not sabotage, but carelessness, and then people protecting themselves. Mill Lane's evidence goes into the report word for word."}
 else if(clues===1){h="Questions Remain";t="Your evidence gets the inspector asking the right questions. The report admits that maintenance records “cannot be fully reconciled”. It is not the whole truth, but it is more than Kelderwick had before."}
 else{h="“Equipment Failure”";t="Without hard evidence, the report blames old equipment and recommends investment. Maybe that is the whole story. Marta doesn't think so."}
 if(claim)t+=" The sabotage broadcast didn't help: the inspector lost a week chasing it.";
 return {h,t,clues};
}
const DZ_BADGES=[
 ["🤝","Good Neighbours","Shared water with Hillside",c=>c.flags.hillside==="share"],
 ["🫁","Nobody Left Behind","Mr Aldous never went to hospital",c=>c.eps.length>=3&&c.flags.aldous!=="hospital"&&!c.eps.some(e=>/Ambulances/.test(e.head))],
 ["📻","Straight Talkers","Never broadcast an unproven claim",c=>!c.eps.some(e=>(e.decs||[]).some(d=>d.dl==="DL4"&&d.id==="claim"))],
 ["🗂️","Detectives","Found two pieces of evidence",c=>(c.flags.clues||[]).length>=2],
 ["💡","Lights On","Restored power early in an episode",c=>!!c.everEarly]
];
function dzCampaignBox(){
 if(!S.ep)return "";
 dzEpisodeRecord();
 const c=dzCamp();if(!c)return "";
 if(S.f.pw&&S.f.pw<7){c.everEarly=true;dzCampSave(c)}
 if(S.ep<3){
  const nx=DZ_EPISODES[S.ep+1],carry=dzCarryList(c.flags);
  return '<div class="pn dz-campbox"><div class="dz-kick">THE KELDERWICK FILES · EPISODE '+S.ep+' OF 3 COMPLETE</div><h3>Next time: Episode '+(S.ep+1)+': '+esc(nx.t)+'</h3><p>'+esc(nx.month)+'. '+esc(nx.blurb)+'</p>'+
  (carry.length?'<p><b>What the town will remember:</b></p><ul>'+carry.map(x=>'<li>'+x[1]+'</li>').join("")+'</ul>':"")+
  '<p class="s">Saved on this device. Play the next episode tonight or next week.</p><button class="btn" onclick="dzCampPlay('+(S.ep+1)+')">▶ Play Episode '+(S.ep+1)+'</button></div>';
 }
 const inq=dzInquiry(),tot=c.eps.reduce((a,e)=>a+e.stars,0),badges=DZ_BADGES.filter(b=>b[3](c));
 return '<div class="pn dz-campbox dz-final"><div class="dz-kick">THE KELDERWICK FILES · CAMPAIGN COMPLETE</div><h3>🗂️ The Inquiry: '+esc(inq.h)+'</h3><p>'+esc(inq.t)+'</p>'+
 '<table class="dz-camptable">'+c.eps.map(e=>'<tr><td>Episode '+e.n+'</td><td><b>'+esc(e.t)+'</b></td><td><i>'+esc(e.head)+'</i></td><td>'+"⭐".repeat(e.stars)+'</td></tr>').join("")+'</table>'+
 '<p class="dz-total">Campaign total: <b>'+tot+' / 27 ⭐</b></p>'+
 (badges.length?'<div class="dz-badges">'+badges.map(b=>'<span class="dz-badge" title="'+esc(b[2])+'">'+b[0]+' '+esc(b[1])+'</span>').join("")+'</div>':"")+
 '<button class="btn b" onclick="dzCampReset()">Start a new campaign</button></div>';
}
/* ---------- title-screen panel ---------- */
function dzCampPanel(){
 const c=dzCamp(),n=c?c.next:1;
 let h='<details class="pn dz-camp"'+(c&&n<=3?" open":"")+'><summary>📚 Campaign: <b>The Kelderwick Files</b> · 3 episodes · about 30 min each</summary>';
 h+='<ol class="dz-eplist">'+[1,2,3].map(i=>{const e=DZ_EPISODES[i],done=c&&c.eps.find(x=>x.n===i);return '<li class="'+(done?"done":i===n?"next":"")+'"><b>'+esc(e.t)+'</b> <span class="s">'+e.month+'</span>'+(done?' · <i>'+esc(done.head)+'</i> '+"⭐".repeat(done.stars):"")+'<br><span class="s">'+esc(e.blurb)+'</span></li>'}).join("")+'</ol>';
 if(c&&n<=3)h+='<button class="btn" onclick="dzCampPlay('+n+')">▶ Play Episode '+n+'</button>';
 else if(c)h+='<p>Campaign complete! '+c.eps.reduce((a,e)=>a+e.stars,0)+' / 27 ⭐</p>';
 h+=c?'<button class="btn b" onclick="dzCampReset()">'+(n<=3?"Restart campaign":"Start a new campaign")+'</button>':'<button class="btn" onclick="dzCampPlay(1)">▶ Start the campaign</button>';
 h+='<p class="s">Uses the names and options above. Choices carry over between episodes and are saved on this device.</p>';
 h+='<details class="dz-code"><summary>Move the campaign to another device</summary>'+(c?'<textarea id="dz-campcode" readonly rows="3">'+esc(dzCampCode(c))+'</textarea>':"")+'<input id="dz-campin" placeholder="Paste a campaign code"><button class="btn b sm2" onclick="dzCampImport()">Load code</button></details></details>';
 return h;
}
function dzCampPlay(n){
 if(S&&S.ph==="end"){const names=S.pl.map(p=>p.n),o={kids:S.kids,mode:S.mode,diff:S.diff,goals:S.goalsOn,vote:S.vote,insider:S.insiderOn,len:"ep"+n,episode:n,seed:""};try{localStorage.removeItem(DZ_SAVE)}catch(e){}start(names,o);return}
 const c=dzCamp();if(!c||n===1&&!c.eps.length){const d=document.getElementById("dz-diff");dzCampNew(d?d.value:"normal")}
 go({len:"ep"+n,episode:n});
}
function dzCampReset(){if(!confirm("Start a new campaign? The saved campaign progress will be deleted."))return;try{localStorage.removeItem(DZ_CAMP_KEY)}catch(e){}if(S&&S.ph==="end"){S=null;try{localStorage.removeItem(DZ_SAVE)}catch(e){}}R()}
function dzCampImport(){const v=(document.getElementById("dz-campin")||{}).value;if(dzCampLoadCode(v)){dzToast("Campaign loaded.");R()}else dzToast("That code didn't work. Check it was copied in full.")}
