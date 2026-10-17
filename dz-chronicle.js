/*
  Day Zero: the Mill Lane Chronicle, a newspaper front page about THIS table's game,
  with a spoiler-free emoji summary for group chats. The answer key is behind
  an optional "show what you missed" reveal so replays aren't spoiled.
*/
const DZ_DEC_HEAD={
 DL1:{open:"Hall throws open its stores",keep:"Hall keeps its stores for the Hub"},
 DL2:{share:"Hall shares water with Hillside",cont:"Hillside handed empty containers",ref:"Hall turns Hillside away"},
 DL3:{aldous:"Last clinic bed goes to Mr Aldous",petrova:"Last clinic bed goes to Mrs Petrova"},
 DL3A:{visit:"Nurse walks every street",hall:"Hall becomes a hospital"},
 DL4:{claim:"Radio airs sabotage claim",known:"Radio sticks to the facts",sil:"Radio stays silent on sabotage"},
 DL5:{tonight:"Crew sent over the mill path at night",wait:"Crew waits for daylight"},
 DL6:{tower:"Power to the tower block first",clinic:"Power to the clinic street first",hallp:"Power to the hall first"}
};
const DZ_DEC_EMOJI={DL1:"🥫",DL2:"🚱",DL3:"🛏️",DL3A:"🏥",DL4:"📡",DL5:"🌉",DL6:"⚡"};
function dzNames(list){list=list.map(x=>esc(x));return list.length<2?list.join(""):list.slice(0,-1).join(", ")+" and "+list[list.length-1]}
function dzPlayerOfRole(r){return S.pl.find(p=>p.r.includes(r))}
function dzHeroes(){
 const tally=S.pl.map(p=>({p,done:0,best:null}));
 const big=["aldT","fW","bB","bC","bT","depV","frz","cF","gM","gW","info","woodV","cwV","gN","fill","osei","had","fR","fH"];
 (S.hist||[]).forEach(h=>h.rep.forEach(x=>{if(x.status!=="done")return;const p=dzPlayerOfRole(x.role);const t=tally.find(t=>t.p===p);if(!t)return;t.done++;if(!t.best||big.indexOf(x.id)>-1&&(big.indexOf(t.best.id)<0||big.indexOf(x.id)<big.indexOf(t.best.id)))t.best=x}));
 return tally;
}
function dzStars(n){return "★".repeat(n)+"☆".repeat(3-n)}
function dzEmojiLine(){
 const z=ending(),hub=["warmth","water","info"].map(k=>S.hub[k]?"🟩":"⬛").join("");
 const stars=z.m+z.p+z.c,goals=dzGoalResults(),met=goals.filter(g=>g.met&&!g.insider).length,tot=goals.filter(g=>!g.insider).length;
 const decs=(S.decLog||[]).map(x=>(DZ_DEC_EMOJI[x.dl]||"⚖️")+(x.tally?(Object.values(x.tally).filter(n=>n>0).sort((a,b)=>b-a).join("–")):"✓")).join(" ");
 const lines=["🌑 Day Zero · “"+z.e[0]+"”","🔥💧📻 "+hub+" · "+"⭐".repeat(stars)+"☆".repeat(9-stars)+" "+stars+"/9",
  "❤️"+S.t.health+" 🤝"+S.t.cohesion+" 🏘️"+S.t.trust+(decs?" · 🗳️ "+decs:"")];
 const extra=[];if(S.goalsOn&&tot)extra.push("🎯 "+met+"/"+tot+" goals");if(S.insider>=0)extra.push(S.broke?"🕵️ never unmasked":S.caught?"🕵️ Insider caught":"🕵️ Insider escaped");
 if(extra.length)lines.push(extra.join(" · "));
 const url=location.href.split("#")[0].split("?")[0];
 lines.push(DZ_LEN[S.len].label+" · "+dzDiff().label+" · town "+S.seed+" → "+url+"?seed="+S.seed);
 return lines.join("\n");
}
function dzShare(){
 const text=dzEmojiLine();
 if(navigator.share){navigator.share({title:"Day Zero: the Mill Lane Chronicle",text}).catch(()=>{});return}
 dzCopy();
}
function dzCopy(){
 const text=dzEmojiLine(),done=()=>{dzToast("Copied! Paste it into your group chat.");dzSfx("chime")};
 const fallback=()=>{const ta=document.getElementById("dz-emoji");if(ta){ta.select();try{document.execCommand("copy");done()}catch(e){dzToast("Select the text and copy it.")}}};
 if(navigator.clipboard&&navigator.clipboard.writeText)navigator.clipboard.writeText(text).then(done,fallback);else fallback();
}
function dzReplay(same){
 const names=S.pl.map(p=>p.n),o={kids:S.kids,mode:S.mode,diff:S.diff,len:S.len,goals:S.goalsOn,vote:S.vote,insider:S.insiderOn,seed:same?S.seed:""};
 try{localStorage.removeItem(DZ_SAVE)}catch(e){}start(names,o);
}
function dzChronicle(){
 const z=ending(),names=S.pl.map(p=>p.n),days=["Special"],heroes=dzHeroes(),goals=dzGoalResults();
 const hubN=["warmth","water","info"].filter(k=>S.hub[k]).length;
 const lead=dzNames(names)+(names.length>1?" never planned to be in charge.":" never planned to be in charge.")+" But when Kelderwick went dark, the Mill Lane community hall had to be run by somebody. "+
  (S.broke?"It did not end the way anyone hoped.":hubN===3?"By the end, the hall was warm, watered and on the radio: a real community hub.":hubN===2?"By the end, two of the three hub systems were running.":"The hub was never really finished, but the doors stayed open.")+
  (S.f.pw===6?" Thanks to neighbours who guided a repair crew through the dark, the power came back a whole day early.":S.f.pw?" The power returned on Day "+dzDays()+".":"");
 const decs=(S.decLog||[]).map(x=>{const h=(DZ_DEC_HEAD[x.dl]||{})[x.id]||x.id;const t=x.tally?Object.values(x.tally).sort((a,b)=>b-a).filter(n=>n>0).join("–"):"";
  return '<li class="dz-st" data-sfx="flip" data-wait="600"><b>'+(DZ_DEC_EMOJI[x.dl]||"")+" "+h+'</b>'+(t?' <span class="dz-vote-chip">secret vote '+t+'</span>':' <span class="dz-vote-chip">agreed together</span>')+'</li>'}).join("");
 const town=outc().concat(S.codas||[]).filter(Boolean).slice(0,6).map(x=>'<li>'+esc(x)+'</li>').join("");
 const cross=(S.evLog||[]).map(e=>{const ev=dzEventById(e.id);return '<li>'+(ev?ev.i+" ":"")+'<b>'+esc(e.by||"The hall")+'</b> faced “'+esc(ev?ev.t:e.id)+'”: '+esc(e.choice.charAt(0).toLowerCase()+e.choice.slice(1))+'.</li>'}).join("");
 const heroHtml=heroes.map(t=>'<li><b>'+esc(t.p.n)+'</b> ('+t.p.r.map(r=>RL[r].i+" "+RL[r].ch).join(", ")+'): '+t.done+' job'+(t.done===1?"":"s")+' done'+(t.best?'. Remembered for: <i>'+esc(t.best.label)+'</i>':"")+'.</li>').join("");
 const goalHtml=(S.goalsOn||S.insider>=0)?'<div class="dz-col"><h3>Hearts &amp; Hopes</h3><p class="s">What each of you was quietly hoping for…</p>'+goals.filter(g=>S.goalsOn||g.insider).map(g=>'<div class="dz-st dz-goal '+(g.met?"met":"miss")+'" data-sfx="'+(g.met?"success":"fail")+'" data-wait="1000"><b>'+esc(g.p.n)+'</b>: '+g.goal.i+" "+g.goal.t+'<br><span class="s">'+(g.insider?"Secretly the Insider.":esc(g.goal.x))+'</span><span class="dz-res">'+(g.met?"✅ Achieved":"❌ Missed")+'</span></div>').join("")+'</div>':"";
 let insider="";
 if(S.insider>=0){const ip=S.pl[S.insider];const sus={};(S.sus||[]).forEach(x=>sus[x.of]=(sus[x.of]||0)+1);const ms=Object.keys(sus).sort((a,b)=>sus[b]-sus[a])[0];
  insider='<div class="dz-col dz-st" data-sfx="drum" data-wait="1400"><h3>🕵️ Who Had the Key?</h3><p>'+(S.broke?"In the chaos, nobody asked. It was <b>"+esc(ip.n)+"</b> all along.":S.caught?"<b>"+esc(ip.n)+"</b> was unmasked by the hall and handed the substation key to the police.":"<b>"+esc(ip.n)+"</b> was the Insider, and walked away with the key.")+'</p>'+((S.sab||[]).length?'<p>Sabotage: '+S.sab.map(s=>s.what==="fuel"?"1 Fuel":"1 Supplies").join(", ")+' quietly went missing.</p>':'<p>They never sabotaged the stores.</p>')+(ms!==undefined?'<p>Most distrusted in private notes: <b>'+esc(S.pl[ms].n)+'</b>.</p>':"")+'</div>';}
 const mins=S.startedAt?Math.max(1,Math.round((Date.now()-S.startedAt)/60000)):null;
 const fool=dzFool();
 return '<article class="dz-paper">'+
 '<header class="dz-mast dz-st" data-sfx="press" data-wait="900"><div class="dz-mast-top"><span>'+(S.ep?'The Kelderwick Files · Episode '+S.ep+' of 3':days[0]+' Edition')+'</span><span>Kelderwick &amp; District</span><span>Price: one kind word</span></div><h1>The Mill Lane Chronicle</h1></header>'+
 '<div class="dz-st" data-sfx="press" data-wait="1100"><h2 class="dz-head">'+esc(z.e[0])+'</h2><p class="dz-stand">'+esc(z.e[1]+z.x)+'</p></div>'+
 (typeof dzFrame==="function"?'<div class="dz-st dz-chron-photo" data-sfx="flip" data-wait="700">'+dzFrame.apply(null,S.broke==="h"?["end_h","The tower block at dawn."]:S.broke==="c"?["end_c","The hall, the night the doors stayed shut."]:["end","Mill Lane, the evening the lights came back."])+'</div>':"")+
 '<div class="dz-stars dz-st" data-sfx="success" data-wait="900">Mission '+dzStars(z.m)+' · People '+dzStars(z.p)+' · Community '+dzStars(z.c)+'</div>'+
 '<div class="dz-cols"><div class="dz-col dz-lead"><h3>“We Just Kept the Kettle On”</h3><p>'+lead+'</p>'+(heroHtml?'<h3>Heroes of the Blackout</h3><ul>'+heroHtml+'</ul>':"")+'</div>'+
 '<div class="dz-col"><h3>The Big Decisions</h3>'+(decs?'<ul>'+decs+'</ul>':'<p>No big decisions were reached.</p>')+(cross?'<h3>Around the Hall</h3><ul>'+cross+'</ul>':"")+(town?'<h3>Around Town</h3><ul>'+town+'</ul>':"")+
 '<h3>Rumour Watch</h3><p>Theo checked '+dzRumoursChecked()+' rumour'+(dzRumoursChecked()===1?"":"s")+' this time. How many fooled you? See below, if you dare.</p></div>'+
 goalHtml+insider+'</div>'+
 '<footer class="dz-foot">'+esc(DZ_LEN[S.len].label)+' · '+dzDiff().label+' · Town seed <b>'+esc(S.seed)+'</b>'+(mins?' · played in about '+mins+' min':"")+'</footer></article>'+
 (typeof dzArcEndingBox==="function"?dzArcEndingBox():"")+'<div class="pn c dz-sharebox"><h3>📣 Tell the group chat</h3><textarea id="dz-emoji" readonly rows="5">'+esc(dzEmojiLine())+'</textarea><div><button class="btn" onclick="dzShare()">Share</button><button class="btn b" onclick="dzCopy()">Copy</button></div><p class="s">No spoilers: friends can replay the same town with the seed.</p></div>'+
 '<details class="pn dz-missed"><summary>🔍 Show what you missed (spoilers for this town)</summary><h3>What Fooled You?</h3>'+fool.map(f=>'<p><b>'+f[0]+'</b>: '+f[1]+'</p>').join("")+'<p><i>Rumours spread fastest when people are scared. Always ask: how do we know?</i></p>'+
 '<h3>Field Notes</h3>'+NOTES.map(n=>'<p><span class="rel '+(n[0]==="Real"?"V":"U")+'">'+n[0]+'</span> '+n[1]+'</p>').join("")+'<p class="s">General guidance only. Check your local official advice.</p>'+
 '<h3>Talk About It</h3><p>1. Which rumour fooled you, and why?</p><p>2. What would our household need for 72 hours?</p><p>3. Who in our street might need help in a blackout?</p><p>4. Which decision would you change?</p><p>5. When is it right to share something you can\'t prove?</p>'+
 '<h3>What Happens Next?</h3><p><i>Two weeks later, the grid operator\'s report blames “equipment failure.” But one photo still bothers you: the substation lock wasn\'t forced. Someone had a key. To be continued…</i></p><p>'+esc(dzEpilogue())+'</p></details>'+
 (S.ep?dzCampaignBox()+'<div class="c">':'<div class="c"><button class="btn" onclick="dzReplay(false)">Play again (new town)</button><button class="btn b" onclick="dzReplay(true)">Replay this town</button>')+'<button class="btn b sm2" onclick="try{localStorage.removeItem(DZ_SAVE)}catch(e){};S=null;R()">Main menu</button></div>';
}
