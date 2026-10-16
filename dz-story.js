/*
  Day Zero: the Day-by-Day story spine (index.html only).
  One unit everywhere: the Day. Every Day has the same four beats:
    📰 Morning News  →  🗣️ Discuss  →  ✋ Decide  →  🌙 Night
  DZ_ARC holds each episode's headlines, dramatic questions and cliffhangers.
  dzArcRound() (called from startRound) fires the callbacks that make earlier
  choices visibly change later Days. Content rounds (S.round) are still the 7
  scenario beats; a short game plays some of them as Days 1–5.
*/
const DZ_SAVE_VER=2;
/* ---------- the cast (they match the comic artwork) ---------- */
const DZ_CAST={
 Kit:{i:"🧥",who:"Kit",d:"the kid in the yellow raincoat who runs every message"},
 Marta:{i:"🧣",who:"Marta",d:"the gran in the green scarf who knows everyone in Hillside"},
 Sam:{i:"📻",who:"Sam",d:"the dad with the handheld radio who repeats everything he hears"},
 Ines:{i:"🧢",who:"Ines",d:"the hall's quartermaster in the orange beanie, who drives the van"},
 Theo:{i:"🎧",who:"Theo",d:"headphones on, running the hall's radio desk"},
 Pavel:{i:"✚",who:"Pavel",d:"the night-shift nurse"}
};
function dzFace(n){return typeof window.dzPortrait==="function"?window.dzPortrait(n):(DZ_CAST[n]||{}).i||""}

/* ---------- acts and Days ---------- */
const DZ_ACTS={1:["Lights Out","The Cold","The Way Back"],2:["The Ice Storm","Running Dry","The Thaw"],3:["Third Time","Questions","Who Had the Key?"]};
function dzArcEp(){return S&&S.ep?S.ep:1}
function dzActOf(r){r=r===undefined?S.round:r;return r<=2?0:r<=5?1:2}
function dzActName(r){return DZ_ACTS[dzArcEp()][dzActOf(r)]}
function dzActRoman(r){return ["I","II","III"][dzActOf(r)]}
function dzActStart(r){const i=dzRoundIdx(r);return i>0&&dzActOf(dzSeq()[i-1])!==dzActOf(r)}
function dzDayNo(r){return dzRoundIdx(r)+1}
function dzDays(){return dzSeq().length}
function dzDayLabel(r){return "Day "+dzDayNo(r)+" of "+dzDays()}
function dzActLabel(r){return "Act "+dzActRoman(r)+": "+dzActName(r)}
function dzPrevRound(r){const i=dzRoundIdx(r===undefined?S.round:r);return i>0?dzSeq()[i-1]:0}
function dzDecRound(dl){const d=(S.decLog||[]).find(x=>x.dl===dl);return d?d.round:0}
/* did this decision happen on the Day just before today? */
function dzYesterday(dl){const p=dzPrevRound();return !!p&&dzDecRound(dl)===p}

/* ---------- the arcs ---------- */
const dzD=dl=>S.dec[dl];
const DZ_ARC={
 1:{
  1:{head:"The Lights Go Out",when:"Evening",cast:["Pavel","Marta"],lede:"The whole town is dark. On the 9th floor of the tower block, Mr Aldous's breathing machine is beeping.",
     q:"Who climbs nine floors in the dark, and who gets the hall ready?",
     cliff:()=>(S.f.stab?"Mr Aldous is breathing easier. ":(S.th.T2||{}).fail?"An ambulance siren fades into the dark. ":"Up on the 9th floor, the beeping gets faster. ")+"Then Kit bursts in, dripping: “The clinic lights are flickering!”"},
  2:{head:"The Freezer",when:"Morning",cast:["Kit","Ines"],lede:"Kit runs in with a message: Mrs Lindqvist's freezers are thawing. The clinic generator is gasping. And the street is at the hall door.",
     q:"Do you open the hall's stores to the street?",
     cliff:()=>dzD("DL1")==="open"?"Word spreads fast. By morning, the queue reaches the corner.":dzD("DL1")==="keep"?"From his window, Sam's radio crackles: “The hall's hoarding food. Just saying what I heard.”":"The street goes quiet. Everyone is waiting to see what the hall does next."},
  3:{head:"Hillside's Water",when:"Morning",cast:["Kit","Marta"],lede:"The taps cough and stop up on the hill. Kit leads three Hillside neighbours in, carrying empty bottles. Marta knows every one of them.",
     q:"Do you share your water with Hillside?",
     cliff:()=>dzD("DL2")==="share"?"Marta's phone buzzes with a text from Hillside: “We won't forget this.”":dzD("DL2")==="ref"?"Marta watches the Hillside families walk away. She doesn't say a word.":dzD("DL2")==="cont"?"Hillside walk home with empty containers. Nobody says thank you.":"The water tower creaks. Nobody knows how long it will last."},
  4:{head:"One Bed",when:"Morning",cast:["Pavel","Theo"],lede:"The phones go silent. A queue snakes round the petrol station. Then the clinic radios Theo: one bed left.",
     q:()=>S.dl==="DL3A"?"The clinic has closed. Where does Pavel go?":S.dl==="DL3"?"Mr Aldous or Mrs Petrova: who gets the last bed?":"Who do you believe about the fuel tanker?",
     cliff:()=>dzD("DL3")==="aldous"?"Mrs Petrova is coming to the hall. She'll need it warm by the coldest night.":dzD("DL3")==="petrova"?"Mrs Petrova sleeps warm at the clinic. Up on the 9th floor, Mr Aldous waits for Pavel.":dzD("DL3A")==="hall"?"The hall is a little hospital now. It must stay warm.":dzD("DL3A")==="visit"?"Pavel sets off on his rounds with a torch and a flask. He'll be stretched thin.":"A car horn at the petrol station won't stop."},
  5:{head:"The Rumour",when:"Morning",cast:["Sam","Theo"],lede:()=>S.f.samAlly?"Sam knocks quietly and pulls Theo aside: “My mate at the grid says it was sabotage. Should we say?”":S.f.samRival?"Sam is already telling the whole street: “It was sabotage! My mate at the grid says so!”":"Sam bursts in, waving his radio: “It was sabotage! My mate at the grid says so!”",
     q:"Does the hall's radio repeat something it can't prove?",
     cliff:()=>(dzD("DL4")==="claim"?"By midnight the story is everywhere. People are gathering at the substation.":dzD("DL4")==="known"?"Theo's headphones crackle: the repair crew heard your broadcast. They trust the hall.":"Sam keeps talking. The hall's radio stays quiet.")+" Tomorrow night: minus six."},
  6:{head:"The Coldest Night",when:"Evening",cast:["Marta","Kit"],lede:"Minus six. The grid crew is stuck: fallen lines block the main roads. They need a guide.",
     q:()=>S.f.e2?"Hillside's barrier blocks the mill path. Can you keep everyone warm until daylight?":"Do you send the crew over the old mill path tonight?",
     cliff:()=>S.f.pw===6?"Across town, a streetlight flickers on. Then another. Then the tower block.":"The crew waits out the night in their van. The whole hall listens to the radio."},
  7:{head:"The Way Back",when:"Afternoon",cast:["Theo","Marta"],lede:"The council is on the radio: power will come back in stages. They want to know where first.",
     q:"Who gets the power first?",
     cliff:()=>"Two weeks later, one photo still bothers Theo: the substation lock wasn't forced. Someone had a key."}
 },
 2:{
  1:{head:"Not Again",when:"Evening",cast:["Kit","Ines"],lede:"January. An ice storm coats every wire in Kelderwick. At six minutes past six, the lights go out again.",
     q:"The hall knows what to do this time. Does it move fast enough?",
     cliff:()=>"Ice cracks on the power lines all night. By morning, the freezers are failing again."},
  2:{head:"Frozen Stores",when:"Morning",cast:["Ines","Sam"],lede:"The van won't start until Ines thaws the lock with a kettle. At the door, the street wants to know what the hall has.",
     q:"Do you open the hall's stores again?",
     cliff:()=>dzD("DL1")==="open"?"Mrs Grant hugs Ines in the queue. Then the taps start to splutter.":"Sam's radio is busy again. Then the taps start to splutter."},
  3:{head:"Running Dry",when:"Morning",cast:["Marta","Kit"],lede:"The mains have frozen solid on the hill. Kit slides down the icy lane with a message from Hillside.",
     q:"Hillside needs water again. What does the hall do?",
     cliff:()=>(dzD("DL2")==="share"?"Hillside sends a sledge of firewood down the lane before dark. ":"")+"That night, one by one, the phone masts freeze and fall silent."},
  4:{head:"The Silent Masts",when:"Morning",cast:["Theo","Pavel"],lede:"No phones. Ice on every mast. Only the hall's radio still reaches the clinic.",
     q:()=>S.dl==="DL3A"?"The clinic has closed. Where does Pavel go?":S.dl==="DL3"?"Mr Aldous or Mrs Petrova: who gets the last bed?":"Who do you believe, with no phones to check?",
     cliff:()=>"For two more days the ice holds. Then, at last, the thaw begins."},
  7:{head:"The Thaw",when:"Afternoon",cast:["Theo","Marta"],lede:"Water drips from every roof. The grid crew is back, and the council wants your advice again.",
     q:"Who gets the power first this time?",
     cliff:()=>"A grid inspector has booked a room at the Kelderwick Arms. She wants to know why the town keeps going dark."}
 },
 3:{
  1:{head:"Third Time",when:"Evening",cast:["Theo","Marta"],lede:"March. As the grid inspector's car pulls up at the substation, the lights go out for the third time.",
     q:"The inspector is watching. Can the hall keep the town safe and tell her the truth?",
     cliff:()=>"The inspector writes something in her notebook and underlines it twice."},
  4:{head:"The Inspector",when:"Morning",cast:["Theo","Pavel"],lede:"The inspector sets up in the corner of the hall with a flask and a lot of questions.",
     q:()=>S.dl==="DL3A"?"The clinic has closed. Where does Pavel go?":S.dl==="DL3"?"Mr Aldous or Mrs Petrova: who gets the last bed?":"Who do you trust with what you've found?",
     cliff:()=>"That night, a note is pushed under the hall door. No name. Just: “Ask Sam's mate about the key.”"},
  5:{head:"Sam's Secret",when:"Morning",cast:["Sam","Theo"],lede:"Sam won't meet anyone's eye. Then he blurts it out: “My mate at the grid lost a key. I didn't want to get him in trouble.”",
     q:"Does the hall's radio say what it knows, or what it suspects?",
     cliff:()=>"Frost on the windows again. The crew radios: “We could reach the substation tonight, with a guide.”"},
  6:{head:"Cold Trail",when:"Evening",cast:["Marta","Kit"],lede:"Minus four. The crew wants to reach the substation before the inspector does.",
     q:()=>S.f.e2?"Hillside's barrier is still up. Can you keep everyone warm until daylight?":"Do you send the crew over the old mill path tonight?",
     cliff:()=>"At dawn the inspector calls everyone into the hall. She has one question left."},
  7:{head:"Who Had the Key?",when:"Afternoon",cast:["Theo","Marta"],lede:"Power is coming back for good. The inspector wants to hear from everyone who saw anything.",
     q:"Who gets the power first, and what will you tell the inspector?",
     cliff:()=>"The Kelderwick Files are closed. Mill Lane's hall is not."}
 }
};
/* Linking lines when a short game skips content between two Days. */
const DZ_ARC_BRIDGE={
 1:{4:"Another day of queues and cold tea. Up on the hill, the taps ran dry and Hillside managed somehow.",6:"A long, tense day. Sam swore on his radio that the blackout was sabotage. Nobody could prove it.",7:"The cold held for one more day. Somehow, you got through it."},
 2:{7:"For two more days the ice held. Then, at last, the thaw."},
 3:{4:"The first night passed. By morning the inspector was asking questions all over town."}
};
function dzArc(r){
 r=r===undefined?S.round:r;
 const a=(DZ_ARC[dzArcEp()]||DZ_ARC[1])[r]||DZ_ARC[1][r]||{head:(EV[r]||["Day"])[0],lede:"",q:"",cliff:()=>""};
 const val=x=>typeof x==="function"?x():(x||"");
 return {head:a.head,when:a.when||"",cast:a.cast||[],lede:val(a.lede),q:val(a.q),cliff:a.cliff?val(a.cliff):""};
}
function dzArcBridge(r){
 r=r===undefined?S.round:r;const p=dzPrevRound(r);if(!p||p>=r-1)return "";
 return ((DZ_ARC_BRIDGE[dzArcEp()]||{})[r])||"";
}

/* ---------- what the town remembers (track chips) ---------- */
const DZ_MEM=[
 ["DL1","open","🥫 Opened the stores",1],["DL1","keep","🥫 Kept the stores",1],
 ["DL2","share","🚱 Shared with Hillside",6],["DL2","cont","🚱 Gave Hillside containers",1],["DL2","ref","🚧 Turned Hillside away",6],
 ["DL3","aldous","🛏️ Bed for Mr Aldous",6],["DL3","petrova","🛏️ Bed for Mrs Petrova",6],
 ["DL3A","visit","🩺 Pavel's home visits",6],["DL3A","hall","🏥 Hall hospital",6],
 ["DL4","claim","📡 Aired the sabotage claim",6],["DL4","known","📡 Only the facts",1],["DL4","sil","📡 Kept quiet",0],
 ["DL5","tonight","🌉 Mill path tonight",7],["DL5","wait","🌉 Waited for daylight",7],
 ["DL6","tower","⚡ Tower block first",0],["DL6","clinic","⚡ Clinic first",0],["DL6","hallp","⚡ Hall first",0]
];
/* each chip: [label, still in play?] — a choice is "in play" while a callback is still to come */
function dzRemembered(){
 const out=[];
 for(const [dl,id,label,until] of DZ_MEM){
  if(S.dec[dl]!==id)continue;
  const dr=dzDecRound(dl),cur=S.round;
  // until 1 = the callback comes the next morning; until N = it comes on content round N
  const live=until===1?cur===dr:until>1?cur<until&&dzSeq().includes(until):false;
  out.push([label,!!live]);
 }
 const samLive=!S.dec.DL4&&dzSeq().includes(5)&&S.round<=5;
 if(S.f.samAlly)out.push(["📻 Sam is on your side",samLive]);
 if(S.f.samRival)out.push(["📻 Sam is against you",samLive]);
 (S.carried||[]).forEach(c=>out.push([c[0],false,1]));
 return out;
}

/* ---------- the story track header ---------- */
function dzTrack(){
 const seq=dzSeq(),i=dzRoundIdx(),acts=[0,1,2].map(a=>seq.map((r,j)=>({r,j})).filter(x=>dzActOf(x.r)===a)).filter(x=>x.length);
 const dots=acts.map(list=>{const a=dzActOf(list[0].r);return '<div class="dz-act'+(a===dzActOf()?" now":"")+'"><div class="dz-act-name">'+["I","II","III"][a]+' · '+esc(DZ_ACTS[dzArcEp()][a])+'</div><ol>'+
  list.map(x=>'<li class="'+(x.j<i?"done":x.j===i?"now":"next")+'" title="Day '+(x.j+1)+'"><span>'+(x.j+1)+'</span></li>').join("")+'</ol></div>'}).join("");
 const mem=dzRemembered();
 const ep=S.ep&&typeof DZ_EPISODES!=="undefined"?'Episode '+S.ep+': '+esc(DZ_EPISODES[S.ep].t):"";
 return '<nav class="dz-track" aria-label="Story track"><div class="dz-track-top"><b>'+dzDayLabel()+'</b><span class="dz-track-act">'+esc(dzActLabel())+'</span>'+(ep?'<span class="dz-track-ep">'+ep+'</span>':"")+'<span class="dz-track-beat">'+dzBeat()+'</span></div>'+
 '<div class="dz-dots">'+dots+'</div>'+
 (mem.length?'<div class="dz-mem"><span class="dz-mem-k">🔖 Remembered</span>'+mem.map(m=>'<span class="dz-chip-mem'+(m[1]?" live":"")+(m[2]?" carried":"")+'" title="'+(m[1]?"Still in play: this will come back":"")+'">'+esc(m[0])+(m[1]?" ⏳":"")+'</span>').join("")+'</div>':"")+
 '</nav>';
}
const DZ_BEATS=[["news","📰 Morning News"],["discuss","🗣️ Discuss"],["decide","✋ Decide"],["night","🌙 Night"]];
function dzBeat(){
 const ph={vote:"decide",vreveal:"decide"}[S.ph]||S.ph;
 return '<span class="dz-beats">'+DZ_BEATS.map(([k,l])=>'<i class="'+(k===ph?"on":"")+'">'+l+'</i>').join("")+'</span>';
}

/* ---------- callbacks: earlier choices change later Days ---------- */
/* Called by startRound() with B(title,text,why). Returns nothing; may set S.ev to a story card. */
function dzArcRound(r,B){
 S.storyCard=null;
 // Freezer → the next morning: a crowd at the door, or Sam's rumour + a story card
 if(dzYesterday("DL1")){
  if(dzD("DL1")==="open"){if(S.hub.info){tr("trust",1);B("The Line at the Hall","Thanks to Theo's noticeboard, the queue is calm and orderly. Trust +1.","Because you opened the stores.")}else{tr("supplies",-1);B("The Line at the Hall","A crowd pushes and argues at the door. Supplies −1. (A noticeboard would have helped.)","Because you opened the stores.")}}
  else if(dzD("DL1")==="keep"){tr("trust",-1);B("Sam on the Radio","Sam tells anyone listening that the hall is hoarding food. Trust −1. Theo can still answer him (see the story card).","Because you kept the stores.");if(!S.f.samAlly&&!S.f.samRival)S.storyCard="sam"}
 }
 // Hillside water → the next morning: Marta's friends remember
 if(dzYesterday("DL2")){
  if(dzD("DL2")==="share"){S.a.contacts++;B("A Thank-You from Hillside","Kit runs in with a note for Marta: Hillside will help if you ever need it. Contacts +1.","Because you shared your water.")}
  else if(dzD("DL2")==="ref"){if(S.a.contacts>0)S.a.contacts--;B("A Door Closes","Marta's oldest friend in Hillside won't answer the door any more. Contacts −1.","Because you refused to share water.")}
 }
 // The Rumour → the next morning: the town trusts the radio
 if(dzYesterday("DL4")&&dzD("DL4")==="known"){S.a.signal=Math.min(6,S.a.signal+1);B("The Radio People Trust","Neighbours bring Theo spare batteries: the hall only says what it knows. Signal +1.","Because you only broadcast the facts.")}
}
/* Episode-specific beats (called from dzRoundExtras). */
function dzEpisodeRound(r,B){
 const f=(S.camp&&S.camp.flags)||{};
 if(S.ep===2){
  if(r===2){
   if(f.hillside==="share"){tr("supplies",1);B("Hillside Digs You Out","Kit slides in ahead of a Hillside work party with shovels and a sack of potatoes. Supplies +1.","Because you shared water last time.")}
   else if(f.hillside==="ref"){if(S.a.contacts>0)S.a.contacts--;B("The Barrier Is Still Up","Hillside's barrier is frozen into the lane. Marta can't reach her friends. Contacts −1.","Because you turned Hillside away last time.")}
  }
  if(r===3&&!S.storyCard)S.storyCard="burst";
  if(r===4){
   if(f.claim||f.sam==="rival"){tr("cohesion",-1);B("Sam's Ice Theory","Sam says the ice storm was sabotage too. Some people believe him. Cohesion −1.","Because Sam's rumours went unanswered last time.")}
   else{S.a.signal=Math.min(6,S.a.signal+1);B("The Radio People Trust","People tune to the hall first now. Theo gets an extra battery pack. Signal +1.","Because the hall's radio told the truth last time.")}
  }
 }
 if(S.ep===3){
  if(r===4&&!S.storyCard)S.storyCard="insp";
  if(r===5){
   const d=dzInit();
   if(f.sam==="ally"||S.f.inspTold){const k=!d.clues.dispatch?"dispatch":!d.clues.service?"service":null;if(k)d.clues[k]=1;B("Sam Comes Clean","Sam hands Theo a crumpled work email from his mate at the grid. "+(k?"A new clue goes in the evidence journal.":"It matches what you already have."),"Because Sam trusts the hall.")}
   else{tr("cohesion",-1);B("Sam Blames the Inspector","Sam tells the street the inspector is part of a cover-up. Cohesion −1.","Because Sam never trusted the hall.")}
  }
 }
}

/* ---------- story cards (Crossroads cards scheduled by the story) ---------- */
const DZ_STORY_CARDS=[
 {id:"sam",story:1,cast:"Sam",who:"SIG",t:"Sam on the Radio",i:"📻",x:"Sam is telling the street the hall is hoarding. Theo can answer him.",
  o:[["Invite Sam in to see the stores","Cohesion +1, Sam joins your side",null,()=>{tr("cohesion",1);S.f.samAlly=1;return "Sam looks at the half-empty shelves for a long time. “Right. I'll tell them.” Sam is on your side now."}],
     ["Ignore him","Trust −1, Sam keeps talking",null,()=>{tr("trust",-1);S.f.samRival=1;return "Sam's radio keeps going all evening. He will be back."}]]},
 {id:"burst",story:1,cast:"Ines",who:"QM",t:"The Burst Main",i:"🧊",x:"A frozen water main bursts outside the school. Families are filling kettles from the gutter.",
  o:[["Send the van with containers","Fuel −1, Trust +2",()=>S.a.fuel>=1,()=>{S.a.fuel--;tr("trust",2);return "Ines skids the van up to the school gates. The queue cheers."}],
     ["Leave it to the council","Trust −1",null,()=>{tr("trust",-1);return "The council comes the next day. People remember who didn't."}]]},
 {id:"insp",story:1,cast:"Theo",who:"SIG",t:"The Inspector's Questions",i:"🗂️",x:"The inspector asks Theo straight out: “What have you found?”",
  o:[["Show her your evidence journal","Trust +1 (needs a clue in the journal)",()=>dzJournal().length>0,()=>{tr("trust",1);S.f.inspTold=1;return "She reads every page, twice. “This is exactly what I needed.”"}],
     ["Keep it to yourselves for now","No change",null,()=>"She closes her notebook. “When you're ready, then.”"]]}
];

/* ---------- dilemmas that change with the story so far ---------- */
const DZ_DL_BASE={};
function dzArcPrepDilemmas(){
 if(!S)return;
 for(const k of ["DL1","DL2","DL4"])if(!DZ_DL_BASE[k])DZ_DL_BASE[k]={x:DL[k][3],o:DL[k][4].map(o=>[o[2],o[3]])};
 const reset=k=>{DL[k][3]=DZ_DL_BASE[k].x;DL[k][4].forEach((o,i)=>{o[2]=DZ_DL_BASE[k].o[i][0];o[3]=DZ_DL_BASE[k].o[i][1]})};
 ["DL1","DL2","DL4"].forEach(reset);
 // The Rumour: Sam's side in the story changes what silence and the facts are worth
 if(S.f.samAlly){
  DL.DL4[3]="Sam has come to Theo first, quietly: his mate at the grid says the blackout was sabotage. Theo: “People deserve to know!” Nobody can prove it.";
  const k=DL.DL4[4].find(o=>o[0]==="known");k[2]="Cohesion +1, Trust +1 (Sam backs you up)";const base=DZ_DL_BASE.DL4.o[1][1];k[3]=()=>{base();tr("trust",1)};
 }else if(S.f.samRival){
  DL.DL4[3]="Sam is already shouting it down the street: the blackout was sabotage. Theo: “People deserve to know!” Nobody can prove it.";
  const k=DL.DL4[4].find(o=>o[0]==="sil");k[2]="Trust −1 (Sam fills the silence)";k[3]=()=>{tr("trust",-1)};
 }else DL.DL4[3]="Sam bursts in, waving his radio: his mate at the grid says the blackout was sabotage. Theo: “People deserve to know!” Nobody can prove it.";
 if(S.ep===2){DL.DL1[3]="Ice on the windows, and neighbours at the door again: “The hall shared last time. Will you share now?”";DL.DL2[3]="Kit slides in with a message: Hillside's mains have frozen solid. “Our children need water. Can you share?”"}
 if(S.ep===3)DL.DL4[3]="Sam's secret is out: his mate lost a substation key. Theo wants to broadcast that it was sabotage. Nobody can prove it.";
}

/* ---------- the ending, assembled from the story's big choices ---------- */
function dzArcEnding(){
 const s=[],d=dzD,early=S.f.pw&&S.f.pw<7;
 if(d("DL1")==="open")s.push("You opened the hall's stores, and the street queued, grumbled, then pulled together.");
 else if(d("DL1")==="keep")s.push("You kept the stores for the Hub"+(S.f.samAlly?", and won Sam round by showing him the empty shelves.":S.f.samRival?", and Sam never let anyone forget it.":"."));
 if(d("DL2")==="share")s.push("When Hillside ran dry, you shared your water"+(early&&d("DL5")==="tonight"?", and Hillside's mill path brought the power back a day early.":", and Hillside never forgot it."));
 else if(d("DL2")==="ref")s.push("You turned Hillside away"+(S.f.e2?", and their barrier closed the mill path on the coldest night.":"."));
 else if(d("DL2")==="cont")s.push("You gave Hillside containers, but no water.");
 if(d("DL3")==="aldous")s.push("Mr Aldous got the last clinic bed"+(S.f.petH?(S.hub.warmth?", and Mrs Petrova slept warm at the hall.":", while Mrs Petrova shivered at the hall."):"."));
 else if(d("DL3")==="petrova")s.push("Mrs Petrova got the last clinic bed"+(S.f.cared?", and Pavel climbed nine floors for Mr Aldous on the coldest night.":"."));
 else if(d("DL3A")==="hall")s.push("When the clinic closed, the hall became a little hospital.");
 else if(d("DL3A")==="visit")s.push("When the clinic closed, Pavel walked every street with a torch and a flask.");
 if(d("DL4")==="claim")s.push("The sabotage story spread faster than the facts.");
 else if(d("DL4")==="known")s.push("The hall's radio only ever said what it knew.");
 else if(d("DL4")==="sil")s.push("On sabotage, the hall's radio said nothing at all.");
 if(d("DL5")==="tonight")s.push(early?"Neighbours led the repair crew over the old footbridge in the dark.":"The crew set off over the mill path in the dark, but couldn't finish the job that night.");
 else if(d("DL5")==="wait")s.push("You kept the crew safe until daylight.");
 if(!s.length)s.push("Day by day, the hall kept its doors open.");
 return s;
}
function dzArcEndingBox(){
 const lines=dzArcEnding(),cl=(S.prevDay&&S.prevDay.r===S.round&&S.prevDay.cliff)||dzArc(dzSeq()[dzSeq().length-1]).cliff;
 return '<div class="dz-cliff dz-story-end dz-st" data-sfx="page" data-wait="1000"><div class="dz-kick">📖 The story of your '+(dzDays()===7?"week":dzDays()+" Days")+'</div>'+lines.map(x=>'<p>'+esc(x)+'</p>').join("")+
 (cl&&!S.broke?'<div class="dz-kick" style="margin-top:10px">To be continued…</div><p><i>'+esc(cl)+'</i></p>':"")+'</div>';
}
