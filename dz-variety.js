/*
  Day Zero: game setup, difficulty, game length, the Crossroads event deck,
  personal-goal scoring and the per-game answer key.
  Everything random here uses the game seed (S.seed), so a seed replays the same town.
*/
const DZ_DIFF={
 easy:{label:"Easy",blurb:"A gentler blackout: more supplies, slower clocks, neighbours rally twice.",start:{supplies:1,health:1,fuel:1},clock:1,crisisMax:12,rally:2},
 normal:{label:"Normal",blurb:"The story as written. Neighbours rally once if Health gets very low.",start:{},clock:0,crisisMax:10,rally:1},
 hard:{label:"Hard",blurb:"Less fuel, less goodwill, faster clocks, and nobody comes to rescue you.",start:{fuel:-1,trust:-1},clock:-1,crisisMax:9,rally:0}
};
const DZ_LEN={
 full:{label:"Full story · 7 Days",mins:"about 60–75 min",seq:[1,2,3,4,5,6,7]},
 quick:{label:"Quick game · 5 Days",mins:"about 40 min",seq:[1,2,4,6,7]}
};
function dzSeq(){return (DZ_LEN[S&&S.len]||DZ_LEN.full).seq}
function dzRoundIdx(r){const i=dzSeq().indexOf(r===undefined?S.round:r);return i<0?0:i}
function dzChapterNo(){return dzRoundIdx()+1}
function dzChapters(){return dzSeq().length}
function dzIsFinal(){return S.round===dzSeq()[dzSeq().length-1]}
function dzDiff(){return DZ_DIFF[S&&S.diff]||DZ_DIFF.normal}
function dzCrisisMax(){return dzDiff().crisisMax}
/* Threat clock length after difficulty and the seeded water timing. */
function dzClock(id){
 const base=TH[id][2]+(id==="T2"&&S.campT2?1:0);if(!base)return 0;
 if(id==="T3")return (S.v&&S.v.water)||base;
 const adj=dzDiff().clock;
 if(adj<0)return base>=3?base-1:base;
 return base+adj;
}

/* ---------- new game ---------- */
function start(names,o){
 o=o||{};
 const seed=dzCleanSeed(o.seed)||dzNewSeed();
 const diff=DZ_DIFF[o.diff]?o.diff:"normal",len=DZ_LEN[o.len]?o.len:"full",D=DZ_DIFF[diff].start;
 const n=names.length;
 S={ver:DZ_SAVE_VER,story:{mode:"rotate",fixed:0,seen:{}},dx:{inventory:[],searched:{hall:0,tower:0,clinic:0},used:{},clues:{},coldShield:0,history:[]},
  pl:names.map(x=>({n:x,r:[]})),round:1,co:0,
  t:{supplies:(n<=2?5:4)+(D.supplies||0),health:5+(D.health||0),cohesion:4,trust:3+(D.trust||0)},
  a:{fuel:3+(D.fuel||0),signal:3,medkits:2,contacts:3},
  hub:{warmth:false,water:false,info:false},wt:null,f:{},th:{},dec:{},codas:[],crisis:0,ph:"news",nw:[],r:{},br:[],log:[],ord:{},pi:0,show:false,esc:[],
  mode:["phones","live"].includes(o.mode)?o.mode:"tv",seed,diff,len,
  vote:o.vote!==false&&n>1,goalsOn:o.goals!==false,insiderOn:!!o.insider&&n>=3,
  v:dzVariant(seed),tips:{},rallies:0,decLog:[],hist:[],evLog:[],sab:[],sus:[],goals:[],insider:-1,startedAt:Date.now()};
 for(const k of Object.keys(S.t))S.t[k]=Math.max(1,Math.min(6,S.t[k]));
 S.a.fuel=Math.max(1,S.a.fuel);
 dzAssignRoles(n,o.kids).forEach((rs,i)=>S.pl[i].r=rs);
 S.kids=(o.kids||[]).slice(0,n);
 dzBigTable();
 if(o.episode&&typeof dzEpisodeSetup==="function")dzEpisodeSetup(o);
 if(typeof dzLiveSetup==="function")dzLiveSetup(o);
 dzDealGoals();
 startRound();
}
/* Goals are decided at the start (so they're fixed by the seed) but only shown after Day 1. */
function dzDealGoals(){
 const rng=dzRng(S.seed,"goals"),seq=dzSeq();
 const ok=Object.keys(DZ_GOALS).filter(k=>seq.some(r=>r>=DZ_GOALS[k].need)&&(DZ_GOALS[k].need<=1||seq.includes(DZ_GOALS[k].need)));
 const deck=dzShuffle(rng,ok);
 S.goals=S.pl.map((p,i)=>deck[i%deck.length]);
 {const adults=S.pl.map((p,i)=>i).filter(i=>!(S.kids||[])[i]);if(!adults.length)S.insiderOn=false;S.insider=S.insiderOn?adults[Math.floor(dzRng(S.seed,"insider"+S.pl.length)()*adults.length)]:-1;}
 S.goalsShown=!(S.goalsOn||S.insiderOn);
}
function dzNeedGoals(){return !S.goalsShown&&dzRoundIdx()>=1}

/* ---------- Crossroads event deck ---------- */
const DZ_EVENTS=[
 {id:"dog",who:"LOC",cast:"Marta",acts:[0,1],t:"Mrs Grant's Dog",i:"🐕",x:"Mrs Grant's terrier has bolted into the dark. She is in tears at the hall door.",
  o:[["Send Marta's friends to search","Contacts −1, Trust +1",()=>S.a.contacts>=1,()=>{S.a.contacts--;tr("trust",1);return "Half the street joins the search. The dog is found asleep in a garden shed."}],["Promise to look in the morning","No change",null,()=>"Mrs Grant sits by the door all night, listening for barking."]]},
 {id:"torch",who:"QM",cast:"Ines",acts:[0,1],t:"A Box of Torches",i:"🔦",x:"The hardware shop owner offers Ines a box of battery torches in exchange for some of the hall's tinned food.",
  o:[["Trade for the torches","Supplies −1, fewer candles in homes",()=>S.t.supplies>=1,()=>{tr("supplies",-1);S.f.torch=1;return "Torches go to the houses still burning candles."}],["Keep the food","No change",null,()=>"The shop owner shrugs and walks on into the dark."]]},
 {id:"cough",who:"QM",cast:"Ines",t:"The Generator Coughs",i:"🔧",x:"The generator splutters and belches smoke. It might settle, or it might die.",cond:()=>S.hub.warmth&&S.wt==="gen",
  o:[["Service it now","Fuel −1",()=>S.a.fuel>=1,()=>{S.a.fuel--;return "Ines cleans the filter. The generator purrs again."}],["Hope for the best","50/50",null,()=>{if(dzRng(S.seed,"cough"+S.round)()<0.5){S.hub.warmth=false;return "It splutters and dies. Warmth stopped. Set it up again (no fuel cost)."}return "It coughs twice, then settles. Lucky."}]]},
 {id:"msg",who:"SIG",cast:"Theo",t:"A Message for Home",i:"📨",x:"A student asks Theo to relay a message to her parents in the next town.",cond:()=>S.a.signal>=1,
  o:[["Send it on the radio","Signal −1, Trust +1",()=>S.a.signal>=1,()=>{S.a.signal--;tr("trust",1);return "Ten minutes later, a reply crackles back. She cries with relief."}],["Signal is too precious","No change",null,()=>"She nods, and keeps checking her dead phone."]]},
 {id:"vol",who:"ANY",cast:"Kit",acts:[0,1],t:"A Volunteer Arrives",i:"🧑‍🚒",x:"Kit brings in a retired firefighter with a flask of tea and steady hands. “Where do you want me?”",
  o:[["Looking after the sick","Health +1",null,()=>{tr("health",1);return "She settles the coughing and the frightened."}],["Keeping spirits up","Cohesion +1",null,()=>{tr("cohesion",1);return "By midnight she has the whole hall singing."}]]},
 {id:"soup",who:"ANY",cast:"Marta",acts:[1,2],t:"Soup on the Stove",i:"🍲",x:"Marta has found a giant pan. A hot meal for everyone would cost some of the stores.",
  o:[["Make soup for everyone","Supplies −1, Health +1, Cohesion +1",()=>S.t.supplies>=1,()=>{tr("supplies",-1);tr("health",1);tr("cohesion",1);return "The hall smells of onions. For an hour, nobody talks about the dark."}],["Save the food","No change",null,()=>"The pan goes back on the shelf."]]},
 {id:"batt",who:"SIG",cast:"Sam",acts:[0,1],t:"A Drawer of Batteries",i:"🔋",x:"Sam turns up with a drawer full of batteries. “Found them in the kitchen. Any use?”",
  o:[["Use them for the hall radio","Signal +1",null,()=>{S.a.signal=Math.min(6,S.a.signal+1);return "Theo's radio desk gets a little more life."}],["Give them to families with torches","Trust +1",null,()=>{tr("trust",1);return "Small lights appear in windows along Mill Lane."}]]},
 {id:"queue",who:"LOC",cast:"Marta",acts:[1,2],t:"An Argument in the Queue",i:"😠",x:"Two neighbours are shouting about who was first in line. Others are taking sides.",
  o:[["Marta calls in a favour to calm it","Contacts −1, Cohesion +1",()=>S.a.contacts>=1,()=>{S.a.contacts--;tr("cohesion",1);return "Marta knows both their mothers. It stops very quickly."}],["Let it burn itself out","Cohesion −1",null,()=>{tr("cohesion",-1);return "It burns out, eventually. Nobody forgets it."}]]},
 {id:"kit",who:"MED",cast:"Pavel",t:"A First-Aid Kit",i:"🧰",x:"A neighbour offers Pavel a spare first-aid kit, if someone drives her to her sister's.",cond:()=>S.a.fuel>=1,
  o:[["Drive her over","Fuel −1, Medkits +1",()=>S.a.fuel>=1,()=>{S.a.fuel--;S.a.medkits++;return "Pavel gets a proper kit: bandages, a thermometer, foil blankets."}],["The van is needed here","No change",null,()=>"She decides to walk in the morning."]]},
 {id:"lantern",who:"ANY",cast:"Kit",acts:[1,2],t:"Lantern Walk",i:"🏮",x:"Kit and the other children have made jam-jar lanterns and want to walk them down Mill Lane.",min:3,
  o:[["Everyone joins in","Cohesion +1 (Trust +1 if the noticeboard is up)",null,()=>{tr("cohesion",1);if(S.hub.info)tr("trust",1);return "A string of little lights moves down the dark street. People come out to watch."}],["Too dangerous tonight","No change",null,()=>"The lanterns stay on the windowsill."]]},
 {id:"draught",who:"ANY",cast:"Ines",acts:[1,2],t:"The Cold Gets In",i:"🥶",x:"Wind howls through a broken window at the back of the hall.",min:5,
  o:[["Board it with blankets from the stores","Supplies −1",()=>S.t.supplies>=1,()=>{tr("supplies",-1);return "The draught stops. The stores are a little thinner."}],["Leave it","Health −1",null,()=>{tr("health",-1);return "By morning, three people have chesty coughs."}]]},
 {id:"fever",who:"MED",cast:"Pavel",acts:[1,2],t:"Fever in the Hall",i:"🤒",x:"A toddler has a high temperature. Her mum is frightened.",
  o:[["Use a medkit","Medkits −1, Health +1, Cohesion +1",()=>S.a.medkits>=1,()=>{S.a.medkits--;tr("health",1);tr("cohesion",1);return "Pavel brings the fever down. The mum hugs him."}],["Cool cloths and watch","50/50: Health −1",null,()=>{if(dzRng(S.seed,"fever"+S.round)()<0.5){tr("health",-1);return "A long, worrying night. Health −1."}return "By dawn the fever breaks on its own."}]]}
];
function dzEventById(id){return DZ_EVENTS.find(e=>e.id===id)||(typeof DZ_STORY_CARDS!=="undefined"?DZ_STORY_CARDS.find(e=>e.id===id):null)}
function dzEventWho(e){if(e.who==="ANY")return S.pl[S.co];return S.pl.find(p=>p.r.includes(e.who))}

/* Called by startRound() before the dilemma is chosen. */
function dzRoundExtras(r,B){
 S.ev=null;
 if(!dzSeq().includes(5)&&(r===6||(r===4&&!dzSeq().includes(6)))&&!S.th.T7)add("T7");
 if(r===7&&!S.th.T10&&!dzSeq().includes(6))add("T10");
 if(typeof dzEpisodeRound==="function")dzEpisodeRound(r,B);
 // catch-up: neighbours rally (Easy twice, Normal once, Hard never)
 if(r>1&&S.t.health<=2&&S.rallies<dzDiff().rally){S.rallies++;tr("health",2);B("The Neighbours Rally","Word spreads that the hall is struggling. People bring soup, blankets and a spare heater. Health +2.","Because the town noticed you were in trouble.");}
 // Story cards: scheduled by the story (a callback to an earlier choice) always come first
 if(S.storyCard){S.ev={id:S.storyCard,done:null};return}
 // Crossroads: most Days after the first draw one card that fits the act, preferring today's cast
 if(dzRoundIdx(r)===0||dzIsFinal())return;
 const rng=dzRng(S.seed,"events"+r);
 if(rng()>0.75)return;
 const seen=new Set((S.evLog||[]).map(x=>x.id)),act=dzActOf(r),cast=dzArc(r).cast;
 const pool=DZ_EVENTS.filter(e=>!seen.has(e.id)&&(!e.acts||e.acts.includes(act))&&(!e.min||r>=e.min)&&(!e.cond||e.cond()));
 if(!pool.length)return;
 const mine=pool.filter(e=>cast.includes(e.cast));
 S.ev={id:dzPick(rng,mine.length?mine:pool).id,done:null};
}
function dzEventChoose(i){
 if(!S.ev||S.ev.done)return;const e=dzEventById(S.ev.id),o=e&&e.o[i];if(!o)return;
 if(o[2]&&!o[2]()){dzToast("You don't have enough for that.");return}
 const msg=o[3]();S.ev.done={i,msg};
 S.evLog.push({id:e.id,round:S.round,choice:o[0],by:(dzEventWho(e)||{}).n||"",msg});
 dzSfx(i===0?"success":"page");chk();sv();R();
}

/* ---------- personal goals: scoring ---------- */
function dzRumoursChecked(){return ["iMid","iArm","iEva","iWat","iTan","iBrk","iSab"].filter(k=>S.f[k]).length}
function dzFoundCount(){return (dzInit().history||[]).filter(h=>h.action==="found").length}
const DZ_GOAL_CHECK={
 open:()=>S.dec.DL1==="open",
 hill:()=>!!S.dec.DL2&&S.dec.DL2!=="ref",
 truth:()=>!S.f.e6s&&S.dec.DL4!=="claim"&&!(S.hist||[]).some(h=>h.rep.some(x=>x.id==="bA"&&x.status==="done")),
 reserve:()=>S.a.fuel>=1,
 warm:()=>!!S.hub.warmth,
 aldous:()=>!!S.th.T2&&!(S.th.T2||DZ_NOTH).fail,
 clinic:()=>!!S.th.T1&&!(S.th.T1||DZ_NOTH).fail,
 rumour:()=>dzRumoursChecked()>=2,
 trust:()=>S.t.trust>=4,
 peace:()=>S.t.cohesion>=6,
 scav:()=>dzFoundCount()>=5,
 tower:()=>S.dec.DL6==="tower",
 health:()=>S.t.health>=4,
 hub:()=>S.hub.warmth&&S.hub.water&&S.hub.info
};
function dzGoalResults(){
 return S.pl.map((p,i)=>{
  if(i===S.insider)return {i,p,insider:true,goal:DZ_INSIDER,met:!S.broke&&!S.caught};
  const k=S.goals[i],g=DZ_GOALS[k];return {i,p,key:k,goal:g,met:!!(DZ_GOAL_CHECK[k]&&DZ_GOAL_CHECK[k]())};
 });
}

/* ---------- this game's answer key ("show what you missed") ---------- */
function dzFool(){
 const v=S.v||{},seq=dzSeq(),has=r=>seq.includes(r),out=[];
 if(has(1))out.push(["“Power back by midnight” (Day 1)","False."]);
 if(has(2)){out.push(["“Army generators tonight”","False."]);out.push(["Marta: “The East Bridge floods”","True this time."]);out.push(["Clinic: “Fuel until morning”","True."])}
 if(has(3)){out.push(["Water board: “at least a week”","The message was old. This time the tower ran dry after "+(v.water||3)+" Days."]);out.push(["“The clinic is evacuating”","False."])}
 if(has(4))out.push(["“A fuel tanker is coming”",v.tanker==="tomorrow"?"Half true: one came the next day, but the pumps still couldn't work without power.":"False. No tanker was planned."]);
 if(has(5)){out.push(["“Thieves on Mill Lane”","False: "+({fox:"a fox in the bins",cat:"a banging cat flap"}[v.thieves]||"a video game")+"."]);out.push(["“It was sabotage”","Unknown. Nobody could prove it."])}
 for(const e of v.extra||[]){if(!has(e.round))continue;const x=DZ_RUMOURS.find(r=>r.id===e.id);if(x)out.push([x.text.replace(/^[^“]*/,""),x.truth])}
 return out;
}
