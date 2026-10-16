/*
  Day Zero: game setup, difficulty, game length, the Crossroads event deck,
  personal-goal scoring and the per-game answer key.
  Everything random here uses the game seed (S.seed), so a seed replays the same town.
*/
const DZ_DIFF={
 easy:{label:"Easy",blurb:"A gentler weekend: more supplies, slower clocks, neighbours rally twice.",start:{supplies:1,health:1,fuel:1},clock:1,crisisMax:12,rally:2},
 normal:{label:"Normal",blurb:"The weekend as written. Neighbours rally once if Health gets very low.",start:{},clock:0,crisisMax:10,rally:1},
 hard:{label:"Hard",blurb:"Less fuel, less goodwill, faster clocks, and nobody comes to rescue you.",start:{fuel:-1,trust:-1},clock:-1,crisisMax:9,rally:0}
};
const DZ_LEN={
 full:{label:"Full weekend",mins:"about 60–75 min",seq:[1,2,3,4,5,6,7]},
 quick:{label:"Quick Night",mins:"about 30 min",seq:[1,2,6,7]}
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
 const base=TH[id][2];if(!base)return 0;
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
 S={story:{mode:"rotate",fixed:0,seen:{}},dx:{inventory:[],searched:{hall:0,tower:0,clinic:0},used:{},clues:{},coldShield:0,history:[]},
  pl:names.map(x=>({n:x,r:[]})),round:1,co:0,
  t:{supplies:(n<=2?5:4)+(D.supplies||0),health:5+(D.health||0),cohesion:4,trust:3+(D.trust||0)},
  a:{fuel:3+(D.fuel||0),signal:3,medkits:2,contacts:3},
  hub:{warmth:false,water:false,info:false},wt:null,f:{},th:{},dec:{},codas:[],crisis:0,ph:"chapter",nw:[],r:{},br:[],log:[],ord:{},pi:0,show:false,esc:[],
  mode:o.mode==="phones"?"phones":"tv",seed,diff,len,
  vote:o.vote!==false&&n>1,goalsOn:o.goals!==false,insiderOn:!!o.insider&&n>=3,
  v:dzVariant(seed),tips:{},rallies:0,decLog:[],hist:[],evLog:[],sab:[],sus:[],goals:[],insider:-1,startedAt:Date.now()};
 for(const k of Object.keys(S.t))S.t[k]=Math.max(1,Math.min(6,S.t[k]));
 S.a.fuel=Math.max(1,S.a.fuel);
 RO.forEach((r,i)=>S.pl[i%n].r.push(r));
 dzDealGoals();
 startRound();
}
/* Goals are decided at the start (so they're fixed by the seed) but only shown after Chapter 1. */
function dzDealGoals(){
 const rng=dzRng(S.seed,"goals"),seq=dzSeq();
 const ok=Object.keys(DZ_GOALS).filter(k=>seq.some(r=>r>=DZ_GOALS[k].need)&&(DZ_GOALS[k].need<=1||seq.includes(DZ_GOALS[k].need)));
 const deck=dzShuffle(rng,ok);
 S.goals=S.pl.map((p,i)=>deck[i%deck.length]);
 S.insider=S.insiderOn?Math.floor(dzRng(S.seed,"insider"+S.pl.length)()*S.pl.length):-1;
 S.goalsShown=!(S.goalsOn||S.insiderOn);
}
function dzNeedGoals(){return !S.goalsShown&&dzRoundIdx()>=1}

/* ---------- Crossroads event deck ---------- */
const DZ_EVENTS=[
 {id:"dog",who:"LOC",t:"Mrs Grant's Dog",i:"🐕",x:"Mrs Grant's terrier has bolted into the dark. She is in tears at the hall door.",
  o:[["Send Marta's friends to search","Contacts −1, Trust +1",()=>S.a.contacts>=1,()=>{S.a.contacts--;tr("trust",1);return "Half the street joins the search. The dog is found asleep in a garden shed."}],["Promise to look in the morning","No change",null,()=>"Mrs Grant sits by the door all night, listening for barking."]]},
 {id:"torch",who:"QM",t:"A Box of Torches",i:"🔦",x:"The hardware shop owner offers a box of battery torches in exchange for some of the hall's tinned food.",
  o:[["Trade for the torches","Supplies −1, fewer candles in homes",()=>S.t.supplies>=1,()=>{tr("supplies",-1);S.f.torch=1;return "Torches go to the houses still burning candles."}],["Keep the food","No change",null,()=>"The shop owner shrugs and walks on into the dark."]]},
 {id:"cough",who:"QM",t:"The Generator Coughs",i:"🔧",x:"The generator splutters and belches smoke. It might settle, or it might die.",cond:()=>S.hub.warmth&&S.wt==="gen",
  o:[["Service it now","Fuel −1",()=>S.a.fuel>=1,()=>{S.a.fuel--;return "Ines cleans the filter. The generator purrs again."}],["Hope for the best","50/50",null,()=>{if(dzRng(S.seed,"cough"+S.round)()<0.5){S.hub.warmth=false;return "It splutters and dies. Warmth stopped. Set it up again (no fuel cost)."}return "It coughs twice, then settles. Lucky."}]]},
 {id:"msg",who:"SIG",t:"A Message for Home",i:"📨",x:"A student asks Theo to relay a message to her parents in the next town.",cond:()=>S.a.signal>=1,
  o:[["Send it on the radio","Signal −1, Trust +1",()=>S.a.signal>=1,()=>{S.a.signal--;tr("trust",1);return "Ten minutes later, a reply crackles back. She cries with relief."}],["Signal is too precious","No change",null,()=>"She nods, and keeps checking her dead phone."]]},
 {id:"vol",who:"ANY",t:"A Volunteer Arrives",i:"🧑‍🚒",x:"A retired firefighter turns up with a flask of tea and steady hands. “Where do you want me?”",
  o:[["Looking after the sick","Health +1",null,()=>{tr("health",1);return "She settles the coughing and the frightened."}],["Keeping spirits up","Cohesion +1",null,()=>{tr("cohesion",1);return "By midnight she has the whole hall singing."}]]},
 {id:"soup",who:"ANY",t:"Soup on the Stove",i:"🍲",x:"Someone has found a giant pan. A hot meal for everyone would cost some of the stores.",
  o:[["Make soup for everyone","Supplies −1, Health +1, Cohesion +1",()=>S.t.supplies>=1,()=>{tr("supplies",-1);tr("health",1);tr("cohesion",1);return "The hall smells of onions. For an hour, nobody talks about the dark."}],["Save the food","No change",null,()=>"The pan goes back on the shelf."]]},
 {id:"batt",who:"SIG",t:"A Drawer of Batteries",i:"🔋",x:"A neighbour clearing her kitchen finds a drawer full of batteries.",
  o:[["Use them for the radio","Signal +1",null,()=>{S.a.signal=Math.min(6,S.a.signal+1);return "Theo's radio gets a little more life."}],["Give them to families with torches","Trust +1",null,()=>{tr("trust",1);return "Small lights appear in windows along Mill Lane."}]]},
 {id:"queue",who:"LOC",t:"An Argument in the Queue",i:"😠",x:"Two neighbours are shouting about who was first in line. Others are taking sides.",
  o:[["Marta calls in a favour to calm it","Contacts −1, Cohesion +1",()=>S.a.contacts>=1,()=>{S.a.contacts--;tr("cohesion",1);return "Marta knows both their mothers. It stops very quickly."}],["Let it burn itself out","Cohesion −1",null,()=>{tr("cohesion",-1);return "It burns out, eventually. Nobody forgets it."}]]},
 {id:"kit",who:"MED",t:"A First-Aid Kit",i:"🧰",x:"A neighbour offers a spare first-aid kit, if someone drives her to her sister's.",cond:()=>S.a.fuel>=1,
  o:[["Drive her over","Fuel −1, Medkits +1",()=>S.a.fuel>=1,()=>{S.a.fuel--;S.a.medkits++;return "Pavel gets a proper kit: bandages, a thermometer, foil blankets."}],["The van is needed here","No change",null,()=>"She decides to walk in the morning."]]},
 {id:"lantern",who:"ANY",t:"Lantern Walk",i:"🏮",x:"The children have made jam-jar lanterns and want to walk them down Mill Lane.",min:3,
  o:[["Everyone joins in","Cohesion +1 (Trust +1 if the noticeboard is up)",null,()=>{tr("cohesion",1);if(S.hub.info)tr("trust",1);return "A string of little lights moves down the dark street. People come out to watch."}],["Too dangerous tonight","No change",null,()=>"The lanterns stay on the windowsill."]]},
 {id:"draught",who:"ANY",t:"The Cold Gets In",i:"🥶",x:"Wind howls through a broken window at the back of the hall.",min:5,
  o:[["Board it with blankets from the stores","Supplies −1",()=>S.t.supplies>=1,()=>{tr("supplies",-1);return "The draught stops. The stores are a little thinner."}],["Leave it","Health −1",null,()=>{tr("health",-1);return "By morning, three people have chesty coughs."}]]},
 {id:"fever",who:"MED",t:"Fever in the Hall",i:"🤒",x:"A toddler has a high temperature. Her mum is frightened.",
  o:[["Use a medkit","Medkits −1, Health +1, Cohesion +1",()=>S.a.medkits>=1,()=>{S.a.medkits--;tr("health",1);tr("cohesion",1);return "Pavel brings the fever down. The mum hugs him."}],["Cool cloths and watch","50/50: Health −1",null,()=>{if(dzRng(S.seed,"fever"+S.round)()<0.5){tr("health",-1);return "A long, worrying night. Health −1."}return "By dawn the fever breaks on its own."}]]}
];
function dzEventById(id){return DZ_EVENTS.find(e=>e.id===id)}
function dzEventWho(e){if(e.who==="ANY")return S.pl[S.co];return S.pl.find(p=>p.r.includes(e.who))}

/* Called by startRound() before the dilemma is chosen. */
function dzRoundExtras(r,B){
 S.ev=null;
 if(S.len==="quick"&&r===6&&!S.th.T7)add("T7");
 // catch-up: neighbours rally (Easy twice, Normal once, Hard never)
 if(r>1&&S.t.health<=2&&S.rallies<dzDiff().rally){S.rallies++;tr("health",2);B("The Neighbours Rally","Word spreads that the hall is struggling. People bring soup, blankets and a spare heater. Health +2.","Because the town noticed you were in trouble.");}
 // Crossroads: most rounds after the first draw one card
 if(dzRoundIdx(r)===0||dzIsFinal())return;
 const rng=dzRng(S.seed,"events"+r);
 if(rng()>0.75)return;
 const seen=new Set((S.evLog||[]).map(x=>x.id));
 const pool=DZ_EVENTS.filter(e=>!seen.has(e.id)&&(!e.min||r>=e.min)&&(!e.cond||e.cond()));
 if(!pool.length)return;
 S.ev={id:dzPick(rng,pool).id,done:null};
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
 aldous:()=>!!S.th.T2&&!S.th.T2.fail,
 clinic:()=>!!S.th.T1&&!S.th.T1.fail,
 rumour:()=>dzRumoursChecked()>=2,
 trust:()=>S.t.trust>=4,
 peace:()=>S.t.cohesion>=5,
 scav:()=>dzFoundCount()>=4,
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
 if(has(1))out.push(["“Power back by midnight” (Ch. "+(dzSeq().indexOf(1)+1)+")","False."]);
 if(has(2)){out.push(["“Army generators tonight”","False."]);out.push(["Marta: “The East Bridge floods”","True this time."]);out.push(["Clinic: “Fuel until morning”","True."])}
 if(has(3)){out.push(["Water board: “until Saturday”","The message was old. This time the tower ran dry by "+DZ_WATER_WHEN[v.water||3]+"."]);out.push(["“The clinic is evacuating”","False."])}
 if(has(4))out.push(["“A fuel tanker is coming”",v.tanker==="tomorrow"?"Half true: one came the next day, but the pumps still couldn't work without power.":"False. No tanker was planned."]);
 if(has(5)){out.push(["“Thieves on Mill Lane”","False: "+({fox:"a fox in the bins",cat:"a banging cat flap"}[v.thieves]||"a video game")+"."]);out.push(["“It was sabotage”","Unknown. Nobody could prove it."])}
 for(const e of v.extra||[]){if(!has(e.round))continue;const x=DZ_RUMOURS.find(r=>r.id===e.id);if(x)out.push([x.text.replace(/^[^“]*/,""),x.truth])}
 return out;
}
