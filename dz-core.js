/* Day Zero engine (from 2.4, extended for the engagement upgrade). Views live in dz-views.js. */
const RO=["SIG","QM","MED","LOC"];
const ROLEX={SIG:{who:"Theo, 19, never takes his headphones off. He runs the hall's radio desk.",knows:"Radio news, official messages and rumours. Some are true. Some are false.",does:"Check rumours, broadcast messages, call emergency services, run the hall's radio point.",why:"Without you, the group acts on false information. You decide what is true."},
QM:{who:"Ines, 46, runs the community hall.",knows:"What the hall has, how much fuel is left, and what every trip costs.",does:"Drive the van (deliver fuel, fetch food, wood and water), set up the generator.",why:"Almost every plan needs the van, and fuel is very limited. You decide what it's spent on."},
MED:{who:"Pavel, 38, a night-shift nurse.",knows:"Who is sick or at risk, and what is dangerous (like generators indoors).",does:"Treat people, climb to Mr Aldous, care for the most vulnerable.",why:"You protect everyone's Health, and you spot the deadly mistakes before they happen."},
LOC:{who:"Marta, 74, has lived on Mill Lane for 46 years.",knows:"The town: people, routes, history, and who owes whom a favour.",does:"Talk to people (the caretaker, shop owners, the depot) and open doors others can't.",why:"Many solutions start with knowing the right person. You hold the maps."}};
const RES=[["🥫","Supplies","Food, drinking water and batteries for everyone at the hall.","Freezer food (+2).","Sharing with others, batteries for the radio point, water for the tower block.","If Supplies are 1 or less, the cold hurts more."],
["❤️","Health","How well your neighbours are.","The Medic treats people (+1).","Threats that go wrong, cold nights, failed care.","At 0, the game ends badly."],
["🤝","Cohesion","How united your group is.","Comforting people, good decisions, a warm hall.","Fear, failures, bad decisions.","At 0, the game ends: everyone for themselves."],
["🏘️","Trust","How much the wider community trusts the hall.","Helping others, telling the truth.","False messages, refusing help.","Some help needs Trust 3+ (e.g. council water)."],
["⛽","Fuel","Runs the van and the generator. Only the Quartermaster spends it.","Finding the fuel reserve.","Every van trip. The generator needs 1 when each new Act begins (see the story track).","At 0: no van trips, and the generator stops."],
["📻","Signal","Theo's limited radio capacity.","A working radio point restores +1 at the start of each new Day (max 6); receiver + batteries adds +1 once.","Investigations, broadcasts, emergency calls.","If it reaches 0, Theo must wait for a recharge before spending more."],
["✚","Medkits","Limited medical equipment carried by Pavel.","No repeatable refill in this first adventure; start with 2.","Treating people.","At 0: no more medkit treatments."],
["🏠","Contacts","Limited favours Marta can ask for.","No repeatable refill in this first adventure; start with 3.","Special requests, including access to the bus depot.","At 0: no more favours to spend."],
["⏳","Crisis","Time pressure.","—","Rises every Day, and when any threat clock fills.","At 10, the last Day starts immediately."]];
const EV={1:["Lights Out","Day 1 · Evening","🌑","The lights flicker, then go out. Not just your street — the whole town is dark. Phones still work, for now. Someone knocks on the hall door: “Is anyone organising things here?” You look at each other. It seems you are."],
2:["The First Night","Morning","🕯️","The town is quiet and cold. Across the river, the clinic's lights flicker. Mrs Lindqvist from the supermarket is at the door: “My freezers are full. What do I do?” Behind her, neighbours want to know what the hall has."],
3:["Morning Without Power","Morning","🚰","A silent town wakes up. No traffic lights, no radios in kitchens. On the hill streets, the taps are sputtering. Three people from the Hillside estate wait at the door with empty bottles."],
4:["Phones Go Quiet","Morning","📵","One by one, phones show “No Service”. The mobile masts have run out of battery. Car horns across town: a long queue at the petrol station. Someone says a fuel tanker is coming."],
5:["Rumours in the Dark","Morning","🗞️","People are tired and scared. A note passes from house to house: “Thieves are breaking into homes on Mill Lane.” Theo looks pale: “Someone says this blackout wasn't an accident.” The forecast: freezing tomorrow night."],
6:["The Coldest Night","Evening","❄️","Frost covers the windows. Your breath turns white indoors. Then the radio crackles: a grid repair crew has reached Kelderwick! But fallen lines block the main roads in the dark. They need help."],
7:["Restoration","Afternoon","💡","The council speaks on the radio: “Power will return in stages. Tell us where it is needed first.” Everyone in the hall turns to look at you. This is the last Day."]};
const GOAL={1:"Help Mr Aldous, and start building the Hub (Warmth, Water, Information).",2:"Save the clinic, grab the freezer food, and decide about the hall's stores.",3:"The water is running out. Fill containers before the taps stop, and help the tower block.",4:"Phones are dead. Calm the petrol crowd, find fuel, and decide who gets the clinic bed.",5:"Fight rumours with facts, and prepare for the freezing night.",6:"Keep people warm, and get the repair crew to the substation.",7:"Last Day! Finish the Hub, and choose where the power goes first."};
const TH={T2:["Mr Aldous's Oxygen","Tower block",3,"His daughter calls: “Dad's breathing machine is beeping. He's on the 9th floor. Please help.”","Health −2, Cohesion −1"],
T1:["Clinic Generator","Clinic, across the river",3,"The clinic's lights flicker. Their generator is running — but for how long?","Health −2. Mr Aldous can't go to the clinic."],
O1:["Supermarket Freezers","Supermarket, across the river",3,"Mrs Lindqvist's freezers are full of food. Soon it will spoil.","The food spoils."],
T3:["Failing Water","Whole town",3,"The water tower is slowly emptying. Nobody knows exactly when the taps will stop.","Taps stop. Supplies −1. No more filling at the hall."],
T4:["Tower Block Water","Tower block",3,"The upper floors have no water. The pumps need electricity.","Health −1, Trust −1"],
T6:["Petrol Station Crowd","Petrol station",3,"Cars queue down the road. People are angry. Everyone wants fuel.","Trust −2, Cohesion −1"],
O2:["Fuel Reserve","Somewhere in town",3,"Somewhere in Kelderwick there is fuel. Who has it?","The chance is gone."],
T8:["Candle Fire","Marta's street",2,"Smoke from a house on Marta's street. Someone used candles for light.","Health −2, Supplies −1, Cohesion −1"],
T9:["Break-in Rumour","Mill Lane",2,"People are scared. Some talk about guarding their homes at night.","Cohesion −2, Trust −1"],
T7:["Cold Snap","Whole town",0,"Below freezing from tomorrow night. Without Warmth at the hall, people suffer.","Each Day without Warmth: Health −1"],
T10:["Grid Crew","Council point → substation",2,"The repair crew is ready, but they can't reach the substation alone.","No power for days. Health −1."]};
const HINT={T2:"Clues: 🏠 Local (how to get in) and ✚ Medic (what he needs).",T1:"Clues: 📻 Signal and 🏠 Local (which bridge?), 📦 Quartermaster (cost).",O1:"Clues: 🏠 Local (who to ask) and 📦 Quartermaster (the van).",T3:"Clues: 📦 Quartermaster (how to fill) and 🏠 Local (when it runs out).",T4:"Clues: ✚ Medic, 🏠 Local and 📦 Quartermaster.",T6:"Clues: 📻 Signal (the rumour), 📦 Quartermaster (pumps), 🏠 Local (owner).",O2:"Clues: 🏠 Local (where) and 📦 Quartermaster (how).",T8:"Clues: 📻 Signal (how to call help) and 🏠 Local.",T9:"Clues: 📻 Signal and 🏠 Local. ✚ Medic can help.",T7:"Get Warmth running at the hall before tomorrow night.",T10:"Needs 3 things: a guide (🏠 knows the routes), fuel (📦) and radio (📻)."};
const IC={T2:"🫁",T1:"🏥",O1:"🧊",T3:"💧",T4:"🏢",T6:"⛽",O2:"🛢️",T8:"🔥",T9:"🚨",T7:"🥶",T10:"⚡"};
let S=null;
const DZ_SAVE="dayzero_save_days";
const sv=()=>{try{localStorage.setItem(DZ_SAVE,JSON.stringify(S))}catch(e){}};
const DZ_NOTH=Object.freeze({});
const tr=(k,n)=>{S.t[k]=Math.max(0,Math.min(6,S.t[k]+n))};
const act=id=>{const x=S.th[id];return !!x&&!x.res&&!x.fail};
const esc=s=>String(s).replace(/[<>&"]/g,c=>({"<":"&lt;",">":"&gt;","&":"&amp;",'"':"&quot;"}[c]));
const T=[];const TI={};

// --- Day Zero 2.0: discoveries and inventory. No change to core round/action economy. ---
const DZ_ITEMS={
 batteries:{name:"Spare Batteries",icon:"🔋",kind:"CONSUMABLE",use:"Combine with the Emergency Receiver to improve communications."},
 receiver:{name:"Emergency Receiver",icon:"📡",kind:"EQUIPMENT",use:"Theo can tune this using batteries to uncover a dated message."},
 route:{name:"Caretaker's Route Sketch",icon:"🗺️",kind:"INTELLIGENCE",use:"Combine with a worklight to examine the old mill route."},
 blankets:{name:"Thermal Blankets",icon:"🧣",kind:"CONSUMABLE",use:"Pavel can protect the vulnerable from one later cold-related health loss."},
 log:{name:"Clinic Service Log",icon:"📋",kind:"EVIDENCE",use:"Theo or Marta can examine its unusual maintenance timestamp."},
 worklight:{name:"Portable Worklight",icon:"🔦",kind:"EQUIPMENT",use:"Marta can use this with the route sketch to guide the crew."}
};
const DZ_LOC={
 hall:{name:"Community Hall Storeroom",icon:"🏠",ids:["batteries","receiver"],help:"Available immediately. Searching competes with urgent community work."},
 tower:{name:"Tower Block Cupboard",icon:"🏢",ids:["route","blankets"],help:"Mr Osei must first unlock the stairs. Blankets become available from Day 3."},
 clinic:{name:"Riverside Clinic Maintenance",icon:"🏥",ids:["log","worklight"],help:"Available once the clinic generator has been refuelled."}
};
function dzInit(){
 if(!S)return null;
 if(!S.dx||typeof S.dx!=="object")S.dx={};
 const d=S.dx;
 if(!Array.isArray(d.inventory))d.inventory=[];
 if(!d.searched||typeof d.searched!=="object")d.searched={};
 for(const id of Object.keys(DZ_LOC))if(!Number.isSafeInteger(d.searched[id])||d.searched[id]<0)d.searched[id]=0;
 if(!d.used||typeof d.used!=="object")d.used={};
 if(!d.clues||typeof d.clues!=="object")d.clues={};
 if(!Array.isArray(d.history))d.history=[];
 if(!Number.isInteger(d.coldShield)||d.coldShield<0)d.coldShield=0;
 return d;
}
function dzHas(id){return dzInit().inventory.includes(id)}
function dzOpen(id){
 if(id==="hall")return S.round>=1;
 if(id==="tower")return !!S.f.acc;
 if(id==="clinic")return S.round>=2&&!!(S.th.T1&&(S.th.T1||DZ_NOTH).res);
 return false;
}
function dzNext(id){
 const d=dzInit(),loc=DZ_LOC[id];if(!loc||!dzOpen(id))return null;
 const item=loc.ids[d.searched[id]];
 if(!item||dzHas(item))return null;
 if(item==="blankets"&&S.round<3)return null;
 return item;
}
function dzFind(id){
 const item=dzNext(id),d=dzInit();if(!item)return "✖ Nothing else can be found here right now.";
 d.inventory.push(item);d.searched[id]++;
 d.history.push({round:S.round,action:"found",item:item,place:id});
 return "🎒 Discovered "+DZ_ITEMS[item].icon+" "+DZ_ITEMS[item].name+" at "+DZ_LOC[id].name+". Added to the team's shared inventory.";
}
function dzRemove(id){const d=dzInit(),i=d.inventory.indexOf(id);if(i>=0)d.inventory.splice(i,1)}
function dzCan(id){
 const d=dzInit();if(d.used[id])return false;
 if(id==="receiver")return S.round>=2&&dzHas("batteries")&&dzHas("receiver");
 if(id==="blankets")return S.round>=3&&dzHas("blankets")&&!d.coldShield;
 if(id==="log")return S.round>=2&&dzHas("log");
 if(id==="route")return S.round>=6&&dzHas("route")&&dzHas("worklight")&&!S.f.e2&&act("T10")&&!S.f.guide;
 return false;
}
function dzUse(id){
 if(!dzCan(id))return "✖ Required equipment or conditions are missing.";
 const d=dzInit();let result="";
 if(id==="receiver"){
  dzRemove("batteries");S.a.signal=Math.min(6,S.a.signal+1);d.clues.dispatch=1;
  result="📡 Theo tunes the receiver. Signal +1 (maximum 6). An earlier-dated grid-crew transmission is recorded in the evidence journal. It does not prove sabotage.";
 }else if(id==="blankets"){
  dzRemove("blankets");d.coldShield=1;
  result="🧣 Pavel distributes thermal blankets. The next eligible cold-related Health loss will be reduced by 1.";
 }else if(id==="log"){
  d.clues.service=1;
  result="📋 The clinic service log contains a maintenance work order dated before the blackout. Its significance is unclear. Evidence added to the journal.";
 }else if(id==="route"){
  S.f.guide=1;
  result="🗺️ Marta uses the sketch and worklight to locate a service route. The grid crew still needs fuel and radio coordination.";
 }
 d.used[id]=1;d.history.push({round:S.round,action:"used",item:id});
 return result;
}
function dzCold(n,E){
 const d=dzInit();let penalty=n;
 if(n>0&&d.coldShield){penalty=Math.max(0,n-1);d.coldShield=0;E.push("🧣 Thermal blankets prevent 1 point of cold-related Health loss.");}
 tr("health",-penalty);return penalty;
}
function dzJournal(){
 const d=dzInit(),arr=[];
 if(d.clues.service)arr.push("📋 The clinic work order was dated before the blackout, but the reason is unknown.");
 if(d.clues.dispatch)arr.push("📡 An earlier-dated repair transmission suggests grid work was discussed in advance.");
 return arr;
}
function dzPanel(){
 const d=dzInit(),ids=d.inventory,ev=dzJournal();
 const possessions=ids.length?ids.map(id=>{
  const x=DZ_ITEMS[id];return '<article class="dz23-item"><div class="dz23-item-art">'+art("dz23/"+id+".svg",x.icon)+'</div><div class="dz23-item-body"><strong>'+esc(x.name)+'</strong><span>'+esc(x.kind)+'</span><p>'+esc(x.use)+'</p></div></article>';
 }).join(""):'<p class="dx-note">No equipment discovered yet. Search locations using available actions, but remember that time is limited.</p>';
 const locs=Object.keys(DZ_LOC).map(id=>{
  const x=DZ_LOC[id],left=dzNext(id),open=dzOpen(id),done=d.searched[id]>=x.ids.length;
  const status=done?"CLEARED":left?"SEARCHABLE":open?"NOTHING AVAILABLE YET":"LOCKED";
  const cls=done?"done":open?"":"locked";
  return '<div class="dx-item dx-place '+cls+'"><b>'+x.icon+" "+x.name+'</b><div class="dx-label">'+status+'</div><small>'+esc(x.help)+'</small></div>';
 }).join("");
 return '<div class="sec">🎒 Discovered equipment</div><div class="pn"><div class="dz23-item-grid">'+possessions+'</div>'+
 (d.coldShield?'<p class="dx-note">🧣 Thermal protection ready: the next cold-related Health loss is reduced by one.</p>':"")+'</div>'+
 '<details class="pn dz23-drawer"><summary>🗺️ Explore Kelderwick · view locations</summary><p class="dx-note">Searching uses one role action. Equipment found belongs to the whole team.</p><div class="dx-grid">'+locs+'</div></details>'+
 '<details class="pn dz23-drawer"><summary>🔎 Evidence journal · '+ev.length+' clue'+(ev.length===1?"":"s")+'</summary>'+(ev.length?ev.map(e=>'<p>'+esc(e)+'</p>').join(""):'<p class="dx-note">No physical evidence investigated yet.</p>')+'</details>';
}

function dzEpilogue(){
 const d=dzInit(),a=!!d.clues.service,b=!!d.clues.dispatch;
 if(a&&b)return "You found both an early maintenance work order and a dated repair transmission. They raise further questions about the timing, but neither proves sabotage. The team decides to keep investigating.";
 if(a)return "The clinic's unusually dated work order remains unexplained. Without more evidence, you cannot say whether it relates to the blackout.";
 if(b)return "The old grid-crew transmission hints that maintenance was discussed earlier than expected, but it does not establish what caused the failure.";
 return "You kept the town going, but found no further documentary evidence about the cause of the failure.";
}
// --- end Day Zero 2.0 shared-inventory rules ---

function K(id,who,step,label,av,run,o={}){const t=Object.assign({id,who,step,label,av,run},o);t.ix=T.length;T.push(t);TI[id]=t}
const inv=(id,l,av,txt,f)=>K(id,"SIG",2,"Investigate: "+l,()=>av()&&!S.f[id],()=>{S.f[id]=1;if(f)S.f[f]=1;return "🔎 "+(typeof txt==="function"?txt():txt)},{cost:{signal:1}});
inv("iMid","the “power back by midnight” post",()=>S.round<=3,"No official source. The account was created today. Probably false.");
inv("iArm","the “army generators” rumour",()=>S.round>=2&&S.round<=3,"Nobody official said this. False.");
inv("iEva","“the clinic is evacuating”",()=>S.round>=3&&S.round<=4,"False. The clinic is staying open.");
inv("iWat","the water board's estimate",()=>S.round>=3&&S.round<=5,"The message is from Day 1. They don't really know.");
inv("iTan","the fuel tanker rumour",()=>act("T6"),()=>S.v&&S.v.tanker==="tomorrow"?"A tanker IS booked, but for tomorrow. And the pumps can't work without power anyway.":"No tanker is planned. Someone misread an old post.","tank");
inv("iBrk","the thieves note",()=>act("T9"),"Mrs Grant heard a video game. Nothing was stolen.","brk");
inv("iSab","the sabotage claim",()=>S.round>=5,"A friend of a friend “heard it at work”. No evidence.");
K("gTest","ANY",2,"Test the old generator",()=>!S.f.gTest,()=>{S.f.gTest=1;return "🔧 It works. It needs 1 Fuel to start, and 1 Fuel whenever a new Act begins."});
[["N","outside, in the sheltered corner by the north wall"],["S","outside, in the open south yard"],["ST","in the storeroom"],["MH","in the main hall"]].forEach(([k,w])=>
K("g"+k,"QM",2,"Set up the generator "+w,()=>S.f.gTest&&!S.hub.warmth,()=>{S.f.gFuel=1;S.hub.warmth=true;S.wt="gen";S.f.gPos=k;
if(k==="N")return "🔥 The generator hums outside, sheltered. Warmth: RUNNING.";if(k==="S")return "🔥 The generator runs in the open yard. Warmth: RUNNING… for now.";
S.f.e5=S.round+1;return "🔥 The generator runs "+w+". It gets warm. Warmth: RUNNING."},{sh:()=>!S.hub.warmth,cost:()=>S.f.gFuel?{}:{fuel:1},no:"Nobody has tested the generator yet."}));
K("wood","LOC",2,"Ask Bram Hollis for firewood",()=>!S.f.wood&&!S.hub.warmth,()=>{S.f.wood=1;return "🪵 Bram grumbles: “Fine. Send your van.”"});
K("woodV","QM",3,"Fetch firewood by van",()=>S.f.wood&&!S.hub.warmth,()=>{S.hub.warmth=true;S.wt="stove";return "🔥 The old stove crackles to life. Warmth: RUNNING."},{cost:{fuel:1},sh:()=>!S.hub.warmth,no:"Bram hasn't agreed yet."});
K("fill","ANY",2,"Fill water containers at the kitchen tap",()=>!S.hub.water&&!S.f.dry,()=>{S.f.fill=(S.f.fill||0)+1;if(S.f.fill>=2){S.hub.water=true;return "💧 All 20 containers are full. Water: RUNNING."}return "💧 Half full. One more fill needed."},{no:"The taps are dry."});
K("cw","LOC",2,"Ask the council officer for water",()=>S.f.dry&&!S.hub.water&&!S.f.cw,()=>{if(S.t.trust>=3){S.f.cw=1;return "🏛️ The officer agrees. Send the van."}return "🏛️ “We don't know you.” (Needs Trust 3+.)"});
K("cwV","QM",3,"Collect council water by van",()=>S.f.cw&&!S.hub.water,()=>{S.hub.water=true;return "💧 Water: RUNNING."},{cost:{fuel:2},sh:()=>S.f.dry&&!S.hub.water,no:"The council hasn't agreed."});
K("info","SIG",2,"Set up the hall's radio point and noticeboard",()=>!S.hub.info,()=>{S.hub.info=true;return "📻 Information: RUNNING."},{cost:{signal:1,supplies:1}});
K("osei","LOC",2,"Ask Mr Osei to unlock the tower block stairs",()=>act("T2")&&!S.f.acc,()=>{S.f.acc=1;S.r.osei=1;return "🔑 Mr Osei unlocks the back stairs and leaves the door open."});
K("aldT","MED",3,"Climb to Mr Aldous and help him",()=>act("T2")&&!S.f.stab,()=>{if(!S.f.acc)return "🚪 The back door is locked. Pavel can't get in.";S.f.stab=1;S.th.T2.clock=0;S.f.pT2=Math.max(3,S.round+1);return "🫁 Pavel finds the backup cylinder. Mr Aldous is stable — for now."});
K("aldW","MED",2,"Travel with Mr Aldous to the clinic",()=>act("T2")&&S.dec.DL3==="aldous",()=>{S.r.withA=1;return "🧳 Pavel gets ready to travel."});
K("aldV","QM",3,"Drive Mr Aldous to the clinic",()=>act("T2")&&S.r.withA&&!!(S.th.T1&&(S.th.T1||DZ_NOTH).res),()=>{S.th.T2.res=true;return "✅ Mr Aldous reaches the clinic safely."},{cost:{fuel:2},sh:()=>act("T2")&&S.dec.DL3==="aldous",no:"He needs the Medic with him, and the clinic needs power."});
K("aldC","MED",3,"Climb to Mr Aldous with a medkit",()=>S.f.care&&S.round===6&&!S.f.cared,()=>{S.f.cared=1;return "🩺 Mr Aldous is safe tonight."},{cost:{medkits:1}});
K("fW","QM",3,"Deliver fuel to the clinic via the WEST Bridge",()=>act("T1"),()=>{S.th.T1.res=true;return "✅ The clinic generator is refuelled."},{cost:{fuel:2}});
K("fE","QM",3,"Deliver fuel to the clinic via the EAST Bridge",()=>act("T1"),()=>{S.a.fuel++;return "🌊 The East Bridge is flooded! The van turns back."},{cost:{fuel:3}});
K("lind","LOC",2,"Talk to Mrs Lindqvist about her freezer food",()=>act("O1")&&!S.f.lind,()=>{S.f.lind=1;return "🛒 “For Marta, anything. Send your van.”"});
K("frz","QM",3,"Collect the freezer food by van",()=>act("O1")&&S.f.lind,()=>{tr("supplies",2);S.th.O1.res=true;return "✅ Supplies +2."},{cost:{fuel:2},sh:()=>act("O1"),no:"Mrs Lindqvist hasn't agreed yet."});
K("t4w","ANY",2,"Carry water to the tower block",()=>act("T4")&&!S.f.t4w,()=>{S.f.t4w=1;return "💧 Water delivered to the entrance."},{cost:{supplies:1}});
K("t4p","LOC",2,"Ask Mr Osei to run a ground-floor water point",()=>act("T4")&&!S.f.t4p,()=>{S.f.t4p=1;return "🚰 Mr Osei sets up a table."});
K("t4u","ANY",2,"Carry water up to the top floors",()=>act("T4")&&!S.f.t4u,()=>{S.f.t4u=1;return "🧗 You climb with water for the older residents."});
K("bA","SIG",2,"Broadcast: “A tanker is coming tonight.”",()=>act("T6"),()=>{S.th.T6.clock++;tr("trust",-1);return "📢 The crowd waits for nothing. Clock +1, Trust −1."},{cost:{signal:1}});
K("bB","SIG",2,"Broadcast: “No tanker is coming, and the pumps can't work without power.”",()=>act("T6"),()=>{if(S.v&&S.v.tanker==="tomorrow"){S.r.t6=1;tr("trust",-1);return "📢 Half right: a tanker does turn up tomorrow, and people feel misled. Trust −1. (Clock paused.)"}S.th.T6.res=true;return "✅ The crowd slowly leaves."},{cost:{signal:1}});
K("bC","SIG",2,"Broadcast: “A tanker comes tomorrow, but the pumps can't work.”",()=>act("T6"),()=>{if(S.v&&S.v.tanker==="tomorrow"){S.th.T6.res=true;return "✅ The whole truth. The crowd slowly leaves."}S.r.t6=1;return "📢 Half right. Some stay. (Clock paused.)"},{cost:{signal:1}});
K("had","LOC",2,"Talk to Mr Haddad at the petrol station",()=>act("T6"),()=>{if(S.f.tank){S.th.T6.res=true;return "✅ Mr Haddad puts up a clear sign. The queue melts away."}return "⛽ “Is a tanker coming or not?” You don't know. No sign."});
K("dep","LOC",2,"Ask Ruth at the bus depot for diesel",()=>act("O2")&&!S.f.dep,()=>{S.f.dep=1;return "⛽ “Bring your van.”"},{cost:{contacts:1}});
K("depV","QM",3,"Fill up the van at the bus depot",()=>act("O2")&&S.f.dep,()=>{S.a.fuel+=2;S.th.O2.res=true;return "✅ Fuel +2 (after the trip)."},{sh:()=>act("O2"),no:"Ruth hasn't agreed yet."});
K("fR","SIG",2,"Call the fire service via the council radio relay",()=>act("T8")&&!S.f.fR,()=>{S.f.fR=1;S.r.fire=1;return "📻 The fire service is coming."},{cost:{signal:1}});
K("fH","ANY",2,"Help neighbours get out (never fight the fire)",()=>act("T8")&&!S.f.fH,()=>{S.f.fH=1;S.r.fire=1;return "🏃 You help people outside."});
K("bT","SIG",2,"Broadcast the truth about the thieves note",()=>act("T9"),()=>{if(S.f.brk){S.th.T9.res=true;return "✅ “It was a video game.” Relief and laughter."}tr("trust",-1);return "📢 You don't know the truth yet. Confusion. Trust −1."},{cost:{signal:1}});
K("wat","ANY",2,"Organise a night watch",()=>act("T9")&&!S.f.wat,()=>{S.f.wat=1;return "🔦 Volunteers will watch the street."});
K("wel","LOC",2,"Organise welfare visits to neighbours",()=>act("T9")&&!S.f.wel,()=>{S.f.wel=1;return "🚪 Marta organises visits."});
K("welM","MED",2,"Join welfare visits to vulnerable neighbours",()=>act("T9")&&!S.f.welM,()=>{S.f.welM=1;return "🩺 Pavel joins the visits."});
K("gM","ANY",2,"Guide the crew by the old mill path",()=>act("T10")&&!S.f.e2&&(S.round===7||S.dec.DL5==="tonight"),()=>{S.f.guide=1;return "🧭 Over the old mill footbridge."},{sh:()=>act("T10"),no:"The path is closed to you (decision or barrier)."});
K("gW","ANY",2,"Guide the crew over the West Bridge",()=>act("T10")&&S.round===7,()=>{S.f.guide=1;return "🧭 Over the West Bridge in daylight."},{sh:()=>act("T10"),no:"Main roads are too dangerous in the dark."});
K("gE","ANY",2,"Guide the crew over the East Bridge",()=>act("T10")&&S.round===7,()=>"🌊 Still flooded. The crew turns back.",{sh:()=>act("T10"),no:"Main roads are too dangerous in the dark."});
K("cF","QM",3,"Take 1 Fuel to the substation",()=>act("T10")&&!S.f.cF,()=>{S.f.cF=1;return "⛽ Fuel delivered."},{cost:{fuel:2}});
K("cR","SIG",2,"Coordinate the crew by radio",()=>act("T10")&&!S.f.cR,()=>{S.f.cR=1;return "📻 Theo talks them through."},{cost:{signal:1}});
K("calm","ANY",2,"Calm the crowd at the substation",()=>act("T10")&&S.f.e6&&!S.f.calm,()=>{S.f.calm=1;return "🤝 The crowd calms."},{sh:()=>act("T10")&&S.f.e6});
K("trt","MED",3,"Treat sick neighbours at the hall",()=>S.t.health<6,()=>{tr("health",1);return "🩹 Health +1."},{cost:{medkits:1}});
K("cmf","ANY",2,"Comfort scared neighbours at the hall",()=>!S.r.cmf,()=>{S.r.cmf=1;tr("cohesion",1);return "🤗 Cohesion +1."},{no:"Someone is already doing this."});

// Day Zero 2.0: discoveries (step 1) and item uses (step 2).
K("exHall","ANY",1,"Search community hall storeroom",()=>!!dzNext("hall"),()=>dzFind("hall"),{no:"Nothing is currently searchable at the hall."});
K("exTower","ANY",1,"Search tower block caretaker cupboard",()=>!!dzNext("tower"),()=>dzFind("tower"),{no:"Tower access is locked or nothing is ready to find."});
K("exClinic","ANY",1,"Search clinic maintenance room",()=>!!dzNext("clinic"),()=>dzFind("clinic"),{no:"The clinic must be safe and accessible before searching."});
K("useReceiver","SIG",2,"Combine receiver and batteries",()=>dzCan("receiver"),()=>dzUse("receiver"),{no:"Theo needs both the receiver and batteries (from Day 2)."});
K("useBlankets","MED",2,"Distribute thermal blankets",()=>dzCan("blankets"),()=>dzUse("blankets"),{no:"Pavel needs blankets (from Day 3)."});
K("useLogSIG","SIG",2,"Examine clinic maintenance record",()=>dzCan("log"),()=>dzUse("log"),{no:"You need the clinic service log first."});
K("useLogLOC","LOC",2,"Examine clinic maintenance record",()=>dzCan("log"),()=>dzUse("log"),{no:"You need the clinic service log first."});
K("useRoute","LOC",2,"Survey old mill service route with worklight",()=>dzCan("route"),()=>dzUse("route"),{no:"Marta needs both items, an active grid-crew crisis, and an open route."});
const cost=t=>typeof t.cost==="function"?t.cost():(t.cost||{});
const CN={fuel:"Fuel",signal:"Signal",supplies:"Supplies",medkits:"Medkit",contacts:"Contact"};
const ctx=c=>{const k=Object.keys(c);return k.length?" ("+k.map(x=>c[x]+" "+CN[x]).join(", ")+")":""};
const have=c=>Object.keys(c).every(k=>(k==="supplies"?S.t.supplies:S.a[k])>=c[k]);
const pay=c=>{for(const k in c)k==="supplies"?tr("supplies",-c[k]):S.a[k]-=c[k]};
const GRP={"🏠 Build the Hub":["gTest","gN","gS","gST","gMH","wood","woodV","fill","cw","cwV","info"],"🫁 Mr Aldous":["osei","aldT","aldW","aldV","aldC"],"🏥 Clinic":["fW","fE"],"🧊 Freezer food":["lind","frz"],"🏢 Tower block water":["t4w","t4p","t4u"],"⛽ Petrol crowd":["iTan","bA","bB","bC","had"],"🛢️ Fuel reserve":["dep","depV"],"🔥 Candle fire":["fR","fH"],"🚨 Break-in rumour":["iBrk","bT","wat","wel","welM"],"⚡ Grid crew":["gM","gW","gE","cF","cR","calm"],"🔎 Check rumours":["iMid","iArm","iEva","iWat","iSab"],"❤️ Look after people":["trt","cmf"],"🎒 Search for equipment":["exHall","exTower","exClinic"],"🧩 Combine & use items":["useReceiver","useBlankets","useLogSIG","useLogLOC","useRoute"]};
const DL={DL1:["QM","Open the Stores?","🥫","Neighbours at the door: “The hall has food. Will you share it now?” Some are scared. Some are angry.",[["open","Open to the street","Supplies −1, Cohesion +1, Trust +1",()=>{tr("supplies",-1);tr("cohesion",1);tr("trust",1);S.f.e3=1},"People still talk about the night the hall opened its doors.","A crowd may come to the hall (calmer if Information is running)."],["keep","Keep for the Hub","No change",()=>{S.f.e4=1},"The Hub had enough. Not everyone understood why.","Some people may say the hall is hoarding."]]],
DL2:[0,"Hillside Water","🚱","Hillside residents with empty bottles: “Our tank is broken. Our children need water. Can you share?”",[["share","Share our water","Supplies −1, Trust +2",()=>{tr("supplies",-1);tr("trust",2);S.f.e1=1},"Hillside still talks about the water you shared.","Hillside may return the favour."],["cont","Give containers only","Trust +1",()=>tr("trust",1),"You gave Hillside a way to help themselves.","Nothing special."],["ref","Refuse","No change",()=>{S.f.e2s=1},"Hillside remembers the door that stayed closed.","Hillside may not forget this."]]],
DL3:["MED","One Bed","🛏️","The clinic radios: “One bed left. Who gets it?” Mr Aldous needs oxygen. Mrs Petrova is 88, alone and freezing.",[["aldous","Mr Aldous","Mrs Petrova moves to the hall",()=>{S.f.petH=1},"Mr Aldous's daughter flew home on Monday. She brought Pavel a card.","Drive him to the clinic (Medic travels + Quartermaster drives). Mrs Petrova needs Warmth at the hall tomorrow night."],["petrova","Mrs Petrova","The clinic collects her",()=>{if(S.th.T2)S.th.T2.res=true;S.f.care=1},"Mrs Petrova slept warm at the clinic. Pavel climbed nine floors twice more.","On the coldest night, the Medic must climb to Mr Aldous with a medkit."]]],
DL3A:["MED","The Clinic Is Closed","🏥","The clinic's generator stopped. Its patients were moved away. Pavel can't be in two places.",[["visit","Visit people at home","No cost now",()=>{if(S.th.T2)S.th.T2.res=true;S.f.mL=1},"Pavel walked every street of Mill Lane that weekend.","The Medic has 1 action fewer on the next two Days."],["hall","Bring everyone to the hall","Fuel −1, Supplies −1",()=>{if(S.th.T2)S.th.T2.res=true;S.a.fuel=Math.max(0,S.a.fuel-1);tr("supplies",-1);S.f.hC=1},"The hall became a small hospital.","The hall needs Warmth tomorrow night."]]],
DL4:[0,"The Sabotage Claim","📡","Theo's contact says the blackout was sabotage. Theo: “People deserve to know!” Nobody can prove it.",[["claim","Broadcast the claim","Cohesion −1",()=>{tr("cohesion",-1);S.f.e6s=1},"The sabotage story spread faster than the facts.","Unproven claims can cause trouble later."],["known","Broadcast only what we know","Cohesion +1",()=>tr("cohesion",1),"Mill Lane trusted the hall's radio. It never said more than it knew.","Nothing special."],["sil","Stay silent","No change",()=>{},"You kept quiet. Some wondered what you knew.","Nothing special."]]],
DL5:["LOC","The Old Mill Path","🌉","The crew could go tonight by the old mill path through Hillside, or wait for daylight and a bridge. Waiting means another freezing night.",[["tonight","Go tonight","The crew can be guided today",()=>{},"The crew still tells the story of the night neighbours led them over the footbridge.","Power could come back a night early."],["wait","Wait for daylight","The crew waits",()=>{},"You chose the safe way. The town waited one more cold night.","The crew can only be guided on the last Day."]]],
DL6:[0,"Who Gets Power First?","⚡","The council asks where power goes first.",[["tower","The tower block","—",()=>{tr("health",1);tr("trust",1)},"When the lift started, the 9th floor cheered.","If the crew fixes the substation: Health +1, Trust +1."],["clinic","The clinic street","—",()=>{(S.th.T1||DZ_NOTH).fail?tr("health",2):tr("cohesion",1)},"The clinic lit up first, like the town's heart starting again.","If the crew fixes the substation: Health +2 if the clinic closed, otherwise Cohesion +1."],["hallp","Our hall","—",()=>{S.f.hb=1},"The hall lit up first. Some said that was fair.","If the crew fixes the substation: one missing Hub system counts as running."]]]};
const NOTES=[["Real","Many water systems need electric pumps. In tall buildings, upper floors often lose water first."],["Real","Mobile masts often have backup batteries that may last only a few hours."],["Real","Card machines and cash machines usually need power. Some cash at home helps."],["Real","Most petrol pumps need electricity."],["Real","Generators make carbon monoxide, which you can't see or smell. Never use one indoors or in a garage."],["Real","Candles cause many house fires. Battery torches are safer. In a fire: get out, stay out, call for help."],["Real","A full freezer keeps food frozen about 48 hours (half-full, about 24)."],["Real","Many agencies suggest households can manage alone for at least 72 hours."],["Real","A battery or wind-up radio keeps you informed when phones fail."],["Invented","Kelderwick, Mill Lane, all characters and the substation mystery."]];
const NM={supplies:"🥫 Supplies",health:"❤️ Health",cohesion:"🤝 Cohesion",trust:"🏘️ Trust",fuel:"⛽ Fuel",signal:"📻 Signal",medkits:"✚ Medkits",contacts:"🏠 Contacts"};
const HN={warmth:"🔥 Warmth",water:"💧 Water",info:"📻 Information"};
const snap=()=>JSON.parse(JSON.stringify({t:S.t,a:S.a,hub:S.hub,items:dzInit().inventory}));
function dif(p){
 if(!p)return "";
 const changes=dz22Changes(p,dz22Frame());
 return '<div class="sec">📊 What changed</div><div class="pn">'+
 (changes.length?'<div class="dz22-delta-list">'+changes.map(t=>{const neg=/[−-]\d|stopped|Used/.test(t);return '<span class="dz-st dz-chip '+(neg?"neg":"pos")+'" data-sfx="'+(neg?"down":"up")+'" data-wait="380">'+esc(t)+'</span>'}).join("")+'</div>':
 '<p>No resource counters or inventory totals changed. The team may still have unlocked access, tested equipment or advanced the story; see the illustrated action cards above.</p>')+
 '</div>';
}

function art(k,ic){const url=k.endsWith(".svg")?`art/${k}`:`art/${k}.jpg`;return `<div class="art">${ic}<div style="background-image:url(${url})"></div></div>`}
function card(o){return `<div class="card ${o.sm?"sm":""}" style="--r:${o.c||"#ffd166"}"><div class="ct">${o.t}</div>${art(o.a,o.i)}<div class="box">${o.f?`<div class="fl">${o.f}</div>`:""}${o.b||""}${o.h?`<div class="hint">💡 ${o.h}</div>`:""}</div><div class="tag">${o.g||""}</div></div>`}
function guideH(){
 return '<div class="pn"><p><b>What these numbers mean:</b> Some resources can be replenished, while others are scarce. You need to decide when to spend them.</p><div class="dz22-resource-grid">'+RES.map(r=>
 '<div class="dz22-resource"><b>'+r[0]+' '+r[1]+'</b><p>'+r[2]+'</p><p><strong>➕ Get more:</strong> '+r[3]+'</p><p><strong>➖ Use:</strong> '+r[4]+'</p><small>⚠️ '+r[5]+'</small></div>'
 ).join("")+'</div><p><b>🏠 Your mission:</b> get Warmth, Water and Information running at the hall before the last Day ends.</p></div>';
}

function add(id){S.th[id]={clock:id==="T1"?1:0};S.nw.push(id)}
function chk(){if(S.t.health<=0)S.broke="h";else if(S.t.cohesion<=0)S.broke="c";if(S.broke)S.ph="end"}
function startRound(){const r=S.round;S.r={};S.nw=[];S.br=[];S.ord={};S.co=dzRoundIdx(r)%S.pl.length;S.dc=null;
const B=(t,x,w)=>S.br.push({t,x,w});
if(r>1&&S.hub.info&&S.a.signal<6){S.a.signal++;B("A Fresh Radio Shift","With the hall radio point staffed, Theo gains 1 Signal today (up to 6).","Because you established the Information hub.");}
if(S.f.e5===r){tr("health",-2);S.hub.warmth=false;B("Headaches at the Hall","People feel dizzy and sick. The generator was running indoors: carbon monoxide. Health −2. The generator is off until someone sets it up outside.","Because the generator was set up indoors.")}
if(dzActStart(r)&&S.hub.warmth&&S.wt==="gen"){if(S.f.tuned&&!S.f.tunedUsed){S.f.tunedUsed=1;B("Generator","Dev's tune-up pays off: the generator sips its fuel. No Fuel needed this time.","Because the Mechanic tuned the generator.")}else if(S.a.fuel>0){S.a.fuel--;B("Generator","A new act begins: the generator uses 1 Fuel to keep running.")}else{S.hub.warmth=false;S.f.gFuel=0;B("Generator","No fuel left. The generator stops.")}}
if(r===1)add("T2");
if(r===2){add("T1");add("O1")}
if(r===3){add("T3");if(S.pl.length>2)add("T4")}
if(r===4){if(!S.hub.info&&!S.f.torch)add("T8");add("T6");add("O2")}
if(r===5){if(S.pl.length>2)add("T9");add("T7")}
if(r===6){if(S.f.e1){if(S.hub.warmth)tr("supplies",1);else S.f.wood=1;B("Neighbours Return the Favour","A cart from Hillside, piled with firewood. "+(S.hub.warmth?"Supplies +1.":"The Quartermaster just needs to fetch it by van."),"Because you shared your water.")}
if(S.f.e2s){S.f.e2=1;tr("trust",-1);B("The Neighbours Remember","A barrier blocks the road into Hillside. The old mill path is closed to you. Trust −1.","Because you refused to share water.")}
if(S.f.e6s){S.f.e6=1;tr("trust",-1);B("A Crowd at the Substation","Angry people gather at the substation. Someone must calm them. Trust −1.","Because you broadcast an unproven claim.")}
if(S.f.wat){tr("trust",-1);tr("cohesion",-1);B("Suspicion on Mill Lane","The night watch stopped a frightened teenager walking home. Trust −1, Cohesion −1.","Because you organised a watch over a false rumour.")}
add("T10")}
if(r===7&&S.f.pw===6)B("Early Restoration","Across town, a streetlight flickers on. Power is coming back a day early!");
dzArcRound(r,B);dzRoundExtras(r,B);
let d=null;if(r===2)d="DL1";if(r===3)d="DL2";
if(r===4){if(S.th.T1&&(S.th.T1||DZ_NOTH).fail)d="DL3A";else if(act("T2"))d="DL3";else{S.codas.push("Mrs Petrova got the last clinic bed.");B("The Clinic Bed","Mrs Petrova gets the last clinic bed.")}}
if(r===5)d="DL4";
if(r===6){if(S.f.e2){S.dec.DL5="wait";S.codas.push("The Hillside barrier blocked the old mill path.")}else d="DL5"}
if(r===7)d="DL6";
if(r===5&&dzInit().clues.service)B("The Mismatched Timestamp","A clinic work order predates the blackout. It could be routine work—or an important clue. Nobody knows yet.","Because you examined the clinic service log.");
if(r===6&&dzInit().clues.dispatch)B("A Broadcast Remembered","Theo compares the repair message with the unfolding crisis. The dates deserve checking, but do not identify who caused the failure.","Because you tuned the emergency receiver.");
S.dl=d;dzArcPrepDilemmas();S.ph="news";chk();sv();R()}
function choose(id){const o=DL[S.dl][4].find(x=>x[0]===id);if(!o)return;if(id==="share"&&S.t.supplies<1){dzToast("Not enough Supplies to share.");return}
S.dec[S.dl]=id;S.dc=id;(S.decLog=S.decLog||[]).push({dl:S.dl,id,round:S.round,tally:S.lastTally||null,how:S.lastHow||"together"});S.lastTally=null;S.lastHow=null;dzSfx("chime");
if(S.dl==="DL6"){S.d6=id;if(S.f.pw===6){o[3]();S.f.d6=1}}else{o[3]();S.codas.push(o[4])}
chk();sv();R()}
function nA(r){let n=S.round===1?1:2;if(r==="MED"&&S.f.mL&&(S.round===5||S.round===6))n--;return n}
function opts(r){return T.filter(t=>(t.who===r||t.who==="ANY")&&(t.sh?t.sh():t.av()))}
function lock(){S.pl[S.pi].r.forEach(r=>{S.ord[r]=[];for(let i=0;i<nA(r);i++){const v=document.getElementById("o_"+r+"_"+i).value;if(v)S.ord[r].push(v)}});next()}
function next(){S.show=false;S.pi++;if(S.pi>=S.pl.length){S.pi=0;if(S.ph==="intel"){if(DZ21_BREAK_ROUNDS.includes(S.round)&&!S.story.seen[S.round]){S.story.seen[S.round]=1;S.ph="break"}else S.ph="council"}else if(S.ph==="ord"){resolve();return}}sv();R()}
function resolve(){S.pre=snap();dzSfx("drum");S.log=[];S.report=[];const L=[];dzRoles().forEach(r=>(S.ord[r]||[]).forEach(id=>L.push({r,id})));
S.rev=L.map(o=>RL[o.r].i+" "+RL[o.r].ch+": "+TI[o.id].label);
L.sort((a,b)=>TI[a.id].step-TI[b.id].step||TI[a.id].ix-TI[b.id].ix);
L.forEach(o=>{
 const t=TI[o.id],w="<b>"+RL[o.r].ch+"</b>: "+t.label+"<br>",before=dz22Frame();
 if(!t.av()){
  const msg=t.no||"Not possible right now.";
  S.log.push(w+"✖ "+msg);S.report.push(dz22Record(o,"blocked",msg,before));return;
 }
 const c=cost(t);
 if(!have(c)){
  const msg="Not enough resources"+ctx(c)+".";
  S.log.push(w+"✖ "+msg);S.report.push(dz22Record(o,"blocked",msg,before));return;
 }
 pay(c);const message=t.run();
 S.log.push(w+message);
 S.report.push(dz22Record(o,dz22Status(o.id,message),message,before));
});
if(act("T4")&&S.f.t4w&&S.f.t4p&&S.f.t4u){S.th.T4.res=true;S.log.push("✅ Tower Block Water: SOLVED.")}else if(act("T4")&&S.f.t4w&&S.f.t4p){S.r.t4=1;S.log.push("◐ Tower Block Water: partly solved. The top floors still need water carried up. (Clock paused.)")}
if(act("T8")&&S.f.fR&&S.f.fH){S.th.T8.res=true;S.log.push("✅ Candle Fire: SOLVED. Everyone got out.")}else if(act("T8")&&S.r.fire)S.log.push("◐ Candle Fire: half done. Clock paused today.");
if(act("T9")&&S.f.wel&&S.f.welM){S.th.T9.res=true;S.log.push("✅ Break-in Rumour: SOLVED. The visits calm the street.")}
if(act("T10")&&S.f.guide&&S.f.cF&&S.f.cR&&(!S.f.e6||S.f.calm)){S.th.T10.res=true;S.f.pw=S.round;S.log.push("✅ Grid Crew: SOLVED! The crew reaches the substation."+(S.round===6?" Power returns a day early!":""))}
if(act("T2")&&S.r.osei&&!S.f.stab)S.log.push("◐ Someone keeps Mr Aldous calm. (Clock paused today.)");
if(!L.length)S.log.push("No actions were taken.");
(S.hist=S.hist||[]).push({round:S.round,rep:S.report.map(x=>({id:x.id,role:x.role,status:x.status,label:x.label}))});
S.ph="res";chk();sv();R()}
function escal(){S.pre=snap();const r=S.round,E=[];S.crisis++;S.lastTick={};
const FX={T2:()=>{tr("health",-2);tr("cohesion",-1)},T1:()=>{tr("health",-2);if(act("T2")){S.th.T2.clock++;if((S.th.T2||DZ_NOTH).clock>=3)fail("T2")}},T3:()=>{tr("supplies",-1);S.f.dry=1},T4:()=>{tr("health",-1);tr("trust",-1)},T6:()=>{tr("trust",-2);tr("cohesion",-1)},T8:()=>{tr("health",-2);tr("supplies",-1);tr("cohesion",-1)},T9:()=>{tr("cohesion",-2);tr("trust",-1)},T10:()=>{tr("health",-1)}};
function fail(id){S.th[id].fail=true;if(id[0]!=="O")S.crisis++;E.push("✖ ⏰ "+TH[id][0]+": clock full! "+TH[id][4]);if(FX[id])FX[id]()}
const tk=(id,skip)=>{if(!act(id)||skip||!dzClock(id))return;S.th[id].clock++;S.lastTick[id]=1;if(S.th[id].clock>=dzClock(id))fail(id);else if(id!=="T3")E.push("⏳ "+TH[id][0]+": clock "+S.th[id].clock+"/"+TH[id][2])};
tk("T2",r<(S.f.pT2||0)||(S.r.osei&&!S.f.stab));tk("T1");tk("O1");
if(act("T3")){tk("T3");if(act("T3"))E.push("💧 The water tower level drops…")}
tk("T4",S.r.t4);tk("T6",S.r.t6);tk("O2");tk("T8",S.r.fire);tk("T9");tk("T10");
if(S.hub.warmth&&S.wt==="gen"&&S.f.gPos==="S"){S.hub.warmth=false;E.push("✖ 🌧️ Rain soaks the generator in the open yard. It stops. (Set it up again somewhere sheltered, no fuel cost.)")}
if(r===2&&S.hub.warmth){tr("cohesion",1);E.push("✅ 🔥 The hall is warm. People relax. Cohesion +1.")}
if(r>=6&&!(r===7&&S.f.pw===6)&&!S.hub.warmth){const d=S.t.supplies<=1?2:1,loss=dzCold(d,E);E.push("✖ 🥶 Bitter cold and no Warmth at the hall. Health −"+loss+".")}
if(r===6){if(S.f.petH&&!S.hub.warmth){const loss=dzCold(1,E);E.push("✖ 🥶 Mrs Petrova shivers in the cold hall. Health −"+loss+".")}if(S.f.hC&&!S.hub.warmth){const loss=dzCold(2,E);E.push("✖ 🥶 The patients at the hall are freezing. Health −"+loss+".")}if(S.f.care&&!S.f.cared){tr("health",-2);E.push("✖ 🫁 Nobody climbed to Mr Aldous tonight. Health −2.")}}
if(r===7&&S.f.pw===7&&S.d6&&!S.f.d6){DL.DL6[4].find(x=>x[0]===S.d6)[3]();S.f.d6=1;E.push("✅ 💡 The lights come back on, in the order you chose.")}
if(!E.length)E.push("A quiet hour. Nothing new goes wrong.");
S.esc=E;S.ph="esc";chk();sv();R()}
function ending(){const t=S.t;let hub=["warmth","water","info"].filter(k=>S.hub[k]).length;if(S.f.hb&&hub<3)hub++;
const m=hub===3?3:hub===2?2:1,p=t.health>=5?3:t.health>=3?2:1,cs=t.cohesion+t.trust,c=cs>=8?3:cs>=5?2:1,tot=m+p+c;let e;
if(S.broke==="h")e=["The Ambulances at Dawn","Before dawn, ambulances came for several neighbours. They will recover, but Mill Lane learned something painful: some problems are too big to solve alone, and help must start earlier."];
else if(S.broke==="c")e=["Every House for Itself","Somewhere in the long nights, people stopped knocking on each other's doors. The hall stood empty. When the lights came back, something had changed."];
else if(tot>=8)e=["The Lights of Mill Lane","When the power came back, nobody wanted to go home. The hall was warm, the kettle was on, and Marta was telling stories about 1998. Kelderwick had a blackout. Mill Lane had a community."];
else if(m>=2&&c===1)e=["Warm Hall, Cold Shoulders","The Hub worked. But some neighbours remember the doors that stayed closed. Next time, will they come to the hall?"];
else if(c>=2&&m===1)e=["Together in the Dark","The hall was never really ready. But nobody on Mill Lane faced the dark alone. Sometimes, that's what matters most."];
else if(tot<=4)e=["Barely Through","You made it. Just. Some mistakes cost more than they should have. But you survived, and you learned."];
else e=["The Long Weekend","Not perfect. Not a disaster. Mill Lane got through the blackout, mostly together."];
const x=S.broke?"":S.f.pw===6?" And thanks to you, the power came back a whole day early.":S.f.pw?"":" The power finally returned two days later.";return {e,x,m,p,c}}
function outc(){const o=[];if(S.th.T2){if((S.th.T2||DZ_NOTH).fail)o.push("Mr Aldous was taken to hospital. His daughter is with him now.");else if(S.dec.DL3==="aldous"&&(S.th.T2||DZ_NOTH).res)o.push("Mr Aldous made it to the clinic, nine floors down.")}
if(S.th.T1)o.push((S.th.T1||DZ_NOTH).fail?"The clinic's patients were moved out of town in the night.":(S.th.T1||DZ_NOTH).res?"The clinic never went dark.":"");
if(S.th.T8)o.push((S.th.T8||DZ_NOTH).res?"Mrs Petrova's house was damaged, but everyone got out.":(S.th.T8||DZ_NOTH).fail?"The fire spread to two houses. Everyone got out, but some lost everything.":"");
if(S.hub.water&&!S.f.dry)o.push("You filled the containers before the taps went dry.");
if(S.th.T9&&(S.th.T9||DZ_NOTH).res)o.push("The thieves story stopped with the hall's radio.");return o}
const goal=()=>`<div class="goal">🎯 <b>Today:</b> ${GOAL[S.round]}</div>`;
const foot=()=>`<p class="c"><button class="btn b sm2" onclick="restart()">New game</button></p>`;
function roleBox(r){return `<div class="rb" style="border-color:${RL[r].c}"><h3 style="color:${RL[r].c}">${RL[r].i} You are the ${RL[r].n} (${RL[r].ch})</h3><b>Your job:</b> ${ROLEX[r].does}<br><span class="s">${ROLEX[r].why}</span></div>`}
const lg=a=>`<div class="pn lg">${a.map(x=>`<p class="${x.includes("✖")?"no":x.includes("✅")?"ok":""}">${x}</p>`).join("")}</div>`;
