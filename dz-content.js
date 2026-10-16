/*
  Day Zero: shared content and per-game variation.
  Loaded by the main game (index.html) AND the phone briefing page (phone.html),
  so a phone shows exactly the same seeded intel as the TV.
  Everything here is deterministic from the game seed.
*/
const RL={SIG:{n:"Signal",ch:"Theo",c:"#4aa3ff",i:"📻"},QM:{n:"Quartermaster",ch:"Ines",c:"#f0a500",i:"📦"},MED:{n:"Medic",ch:"Pavel",c:"#e07ac0",i:"✚"},LOC:{n:"Local",ch:"Marta",c:"#2fd09c",i:"🏠"}};

const IN={1:{SIG:[["V","Radio: the grid operator confirms a major fault. No time for repairs yet."],["R","Social media post: “Power back by midnight! My cousin works at the power station.” (2,000 shares)"],["V","Phones still work, but messages take minutes."]],
QM:[["V","Hall inventory: 3 Fuel · the van · 1 generator in the storeroom (not tested for 2 years) · 20 empty water containers · 1 box of batteries · an old wood stove (no wood)."],["V","Van trips cost Fuel. Delivering fuel also costs the fuel you deliver."]],
MED:[["V","Mr Aldous uses a breathing machine. Its battery lasts about 6 hours."],["V","Generators make carbon monoxide. You can't see or smell it. A generator must NEVER run inside a building."],["V","Home oxygen users usually keep a backup cylinder. Mr Aldous may have one."]],
LOC:[["V","Sketch of the tower block: the lift is crossed out. The back stairs are “LOCKED AT NIGHT”. Note: Mr Osei, caretaker, has the keys.",1],["V","Sketch of the hall from above: a small roofed corner OUTSIDE by the north wall, circled: “good shelter”. The storeroom has no windows.",1],["V","Bram Hollis at the woodyard sells firewood. Grumpy, but fair."],["U","“In the 1998 storm, the taps ran dry after the first day.”"]]},
2:{SIG:[["U","Clinic volunteer: “Our generator has fuel until tomorrow morning.”"],["V","Police: “The EAST Bridge is closed — flooding. Use the West Bridge.”"],["V","Card machines don't work. Cash only."],["R","“The army is bringing free generators tonight!”"]],
QM:[["V","Van to the clinic: West Bridge = 1 Fuel trip + 1 delivered = 2 Fuel. East Bridge = 2 + 1 = 3 Fuel."],["V","Supermarket freezer food = +2 Supplies. Van trip: 2 Fuel."]],
MED:[["V","The clinic has 4 patients on oxygen. If its generator stops, they're in danger."],["V","The clinic could take ONE more patient — only while its power is safe."],["V","A full freezer keeps food frozen about 2 days; half-full, about 1 day."]],
LOC:[["U","Sketch of both bridges: wavy lines over the East Bridge. “Floods every time it rains like this.”",1],["V","Mrs Lindqvist owes Marta a favour — Marta fed her cat for a month."],["V","Mr Osei says three older people live above the 6th floor."]]},
3:{SIG:[["V","Council: “Save water. Drinking and cooking only.”"],["U","Water board: “Supply should last at least a week.”"],["R","“The clinic is evacuating!”"]],
QM:[["V","Filling the 20 containers at the kitchen tap takes TWO fill actions."],["V","If the generator is running, it needs 1 Fuel whenever a new Act begins (see the story track)."]],
MED:[["V","Older people on the top floors can't do the stairs. A water point downstairs won't help them — someone must carry water UP."],["V","People need 2–3 litres of drinking water a day."]],
LOC:[["V","Hillside's water tank broke last month. Never repaired."],["V","Mr Osei will run a ground-floor water point if someone brings water."],["V","Mr Osei's daughter works at the water company: “The tower will be empty {WATER_WHEN}.”"]]},
4:{SIG:[["V","Phones and internet have stopped. Only radios work."],["V","Emergency calls only through the council radio relay."],["R","“A fuel tanker is coming to the petrol station tonight!”"]],
QM:[["V","Petrol pumps need electricity. Without power, they CANNOT work."],["V","At a fuel store, the van can fill up and pay for the trip from what it collects."]],
MED:[["V","The clinic has one bed left. Mr Aldous needs oxygen. Mrs Petrova, 88, lives alone in a freezing house."],["V","Candles cause many house fires. Torches are safer."]],
LOC:[["V","Mr Haddad owns the petrol station. He'll put up a sign — but only if you can tell him the truth."],["V","Ruth Adeyemi runs the bus depot. Big diesel tank. She owes the hall a favour."],["V","Mrs Petrova on Marta's street has no heating. She lights candles every evening."]]},
5:{SIG:[["R","Note: “Thieves are breaking into homes on Mill Lane. Guard your doors.”"],["U","Radio contact: “The blackout was sabotage. Someone at the grid company told me.”"],["V","Weather service: below freezing tomorrow night."]],
QM:[["V","The generator needs 1 Fuel tomorrow night. The wood stove needs none once it has wood."]],
MED:[["V","Most at risk from cold: Mrs Petrova, Mr Aldous, two babies in the tower block."],["V","One shared warm room is safer than people alone in cold houses."]],
LOC:[["V","Marta asked around: Mrs Grant heard her grandson's video game and thought it was a break-in."],["V","Bram Hollis has plenty of wood if the hall asks."]]},
6:{SIG:[["V","Crew on channel 4: “We need a guide, 1 Fuel at the substation, and someone on the radio.”"],["V","Tonight: minus 6 degrees."],["R","“Power back for everyone at midnight!”"]],
QM:[["V","Taking 1 Fuel to the substation: van trip 1 + 1 delivered = 2 Fuel."]],
MED:[["V","Danger signs of cold: strong shivering, confusion, slow speech, sleepiness."],["V","Stay warm: layers, hats, blankets, food, warm drinks, one room."]],
LOC:[["V","Sketch: the old mill path, down through Hillside and over a wooden footbridge. “Safe, even at night.”",1],["V","In daylight the crew could use the West Bridge. The East Bridge is still under water."]]},
7:{SIG:[["V","Council: power returns in stages. They ask where it's needed first."],["V","Photo from a crew member: the substation lock was opened, not forced. Someone used a key.",1]],
QM:[["V","Final check: make sure Warmth, Water and Information are running."]],
MED:[["V","Tower block: babies and older people on the top floors. Power there means water and the lift."]],
LOC:[["V","Marta counted: 120 people in the tower block, 40 on the clinic street, 60 at the hall."]]}};

/* ---------- seeded randomness ---------- */
const DZ_SEED_CHARS="ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
function dzNewSeed(){let s="";for(let i=0;i<4;i++)s+=DZ_SEED_CHARS[Math.floor(Math.random()*DZ_SEED_CHARS.length)];return s}
function dzCleanSeed(s){s=String(s||"").toUpperCase().replace(/[^A-Z0-9]/g,"").slice(0,8);return s}
function dzHash(str){let h=1779033703^str.length;for(let i=0;i<str.length;i++){h=Math.imul(h^str.charCodeAt(i),3432918353);h=h<<13|h>>>19}return function(){h=Math.imul(h^h>>>16,2246822507);h=Math.imul(h^h>>>13,3266489909);return (h^=h>>>16)>>>0}}
/* mulberry32 seeded from a string + a salt, so separate streams never interfere */
function dzRng(seed,salt){let a=dzHash(String(seed)+"|"+(salt||""))();return function(){a|=0;a=a+0x6D2B79F5|0;let t=Math.imul(a^a>>>15,1|a);t=t+Math.imul(t^t>>>7,61|t)^t;return((t^t>>>14)>>>0)/4294967296}}
function dzPick(rng,arr){return arr[Math.floor(rng()*arr.length)]}
function dzShuffle(rng,arr){const a=arr.slice();for(let i=a.length-1;i>0;i--){const j=Math.floor(rng()*(i+1));[a[i],a[j]]=[a[j],a[i]]}return a}

/* ---------- extra rumours: sampled into each game ---------- */
const DZ_RUMOURS=[
 {id:"xFree",r:[2,3],role:"SIG",t:"R",text:"Text from a cousin: “The big supermarket in town is giving all its food away free at nine tonight!”",truth:"False. Nobody was giving food away; people queued in the cold for nothing."},
 {id:"xPoison",r:[3,4],role:"LOC",t:"R",text:"Over the garden fence: “The tap water's poisoned now the pumps have stopped.”",truth:"False. Tap water stayed safe to drink; the problem was that it ran out."},
 {id:"xCountry",r:[1,2],role:"SIG",t:"U",text:"Forum post: “It's not just us, the whole country is dark.”",truth:"False. The outage covered Kelderwick and the valley, not the whole country."},
 {id:"xGarage",r:[2,5],role:"MED",t:"R",text:"Leaflet pushed through doors: “Generators are fine in a garage if you leave the door open.”",truth:"False and dangerous. Generators must never run in a garage, even with the door open."},
 {id:"xDepot",r:[4,4],role:"QM",t:"R",text:"A van driver: “The bus depot sold all its diesel this morning.”",truth:"False. Ruth still had diesel at the depot."},
 {id:"xHeaters",r:[4,6],role:"LOC",t:"R",text:"“The council has a warehouse full of heaters it isn't telling anyone about.”",truth:"False. There was no hidden warehouse."},
 {id:"xHillPower",r:[5,6],role:"SIG",t:"R",text:"Radio caller: “Power's already back on in Hillside!”",truth:"False. Hillside was as dark as everyone else."},
 {id:"xIbu",r:[3,6],role:"MED",t:"U",text:"Overheard in the queue: “Painkillers stop working when you're cold.”",truth:"False. Cold doesn't stop ordinary painkillers working."}
];

/* ---------- personal goals (text only here; scoring lives in dz-variety.js) ---------- */
const DZ_GOALS={
 open:{i:"🚪",t:"Open Doors",x:"The hall should share its stores with the street when asked.",need:2},
 hill:{i:"🚱",t:"Good Neighbours",x:"Hillside must not be turned away when they ask for water.",need:3},
 truth:{i:"📢",t:"Only the Truth",x:"The hall's radio must never broadcast something unproven.",need:1},
 reserve:{i:"⛽",t:"Rainy-Day Tank",x:"Finish the game with at least 1 Fuel left in the van.",need:1},
 warm:{i:"🔥",t:"Warm Hearts",x:"The hall must be warm when the game ends.",need:1},
 aldous:{i:"🫁",t:"The Ninth Floor",x:"Mr Aldous must come through the blackout safely.",need:1},
 clinic:{i:"🏥",t:"Lights at the Clinic",x:"The clinic must never go dark.",need:2},
 rumour:{i:"🔎",t:"Rumour Hunter",x:"Get at least 2 rumours checked on Theo's radio.",need:1},
 trust:{i:"🏘️",t:"Pillar of the Community",x:"Finish with Trust 4 or more.",need:1},
 peace:{i:"🤝",t:"Keep the Peace",x:"Finish with Cohesion at the very top (6 of 6).",need:1},
 scav:{i:"🎒",t:"Scavenger",x:"Find at least 5 pieces of equipment around town.",need:1},
 tower:{i:"🏢",t:"Tower Lights",x:"When the council asks, the tower block should get power first.",need:7},
 health:{i:"❤️",t:"Nobody to Hospital",x:"Finish with Health 4 or more.",need:1},
 hub:{i:"🏠",t:"The Full Hub",x:"Have Warmth, Water and Information all running at the end.",need:1}
};
const DZ_INSIDER={i:"🕵️",t:"The Insider",x:"Weeks ago someone gave you a key to the substation, and you know more about this blackout than you admit. Keep it secret. You win if the town survives AND the others do not name you at the end. Twice, during a secret vote, you may quietly sabotage the hall's stores."};

/* ---------- the variant: everything that changes from game to game ---------- */
const DZ_WATER_WHEN={2:"by tomorrow night",3:"in about two days",4:"in about three days"};

/* ---------- Roles 5–8 (Phase 2). Kit and Bea are kid-friendly: one action, short simple cards, no rumours. ---------- */
Object.assign(RL,{
 RUN:{n:"Runner",ch:"Kit",c:"#ff9f43",i:"👟",kid:true},
 HST:{n:"Host",ch:"Bea",c:"#ff6fa8",i:"🫖",kid:true},
 MEC:{n:"Mechanic",ch:"Dev",c:"#9fb3c8",i:"🔧"},
 LIA:{n:"Liaison",ch:"Grace",c:"#b388ff",i:"🏛️"}
});
const DZ_ROLE_NOTE={SIG:"Radio investigations and broadcasts use Signal.",QM:"Van journeys and deliveries consume Fuel.",MED:"Medical actions use limited Medkits; access can matter.",LOC:"Contacts and local knowledge can open doors.",
 RUN:"Kid role · one quick job each Day. Fast legs, no costs.",HST:"Kid role · one kind job each Day. No costs.",MEC:"Fixes things. Tools, not Fuel.",LIA:"Talks to the council. Official answers, no Signal needed."};
const DZ_EXTRA_IN={
 RUN:{1:[["V","Kit knows every shortcut on Mill Lane. Kit can run messages and carry light things."]],
  2:[["V","Lots of houses on Marta's street are using candles. Candles can start fires."]],
  3:[["V","The old people at the top of the tower block can't carry heavy water up the stairs. Kit is fast on stairs!"]],
  4:[["V","The phones have stopped. People need someone to carry messages. That's Kit's job!"]],
  5:[["V","Last night Kit saw Mrs Grant's grandson playing a loud video game. He was shouting at the screen!"]],
  6:[["V","It's going to be very, very cold tonight. Hats, gloves and blankets help."]],
  7:[["V","From the top of the hill, Kit can see lights coming on in the next town!"]]},
 HST:{1:[["V","Bea knows where the hall keeps the teabags, the biscuits and the spare blankets."]],
  2:[["V","Some of the little children at the hall are scared of the dark. A story or a game helps."]],
  3:[["V","Bea found the big water jugs in the kitchen. They are empty."]],
  4:[["V","Mrs Petrova lives on her own. She is very old, and her house is very cold."]],
  5:[["V","People are whispering and looking worried. A cup of tea and a friendly hello help."]],
  6:[["V","Bea counted the blankets. There are enough for everyone, if we share."]],
  7:[["V","Everyone is tired. Bea thinks the hall needs a party when the lights come on!"]]},
 MEC:{1:[["V","Dev's bike shop has tools, a tyre pump and a cargo bike with a trailer."],["V","Generators must run outside. The exhaust is deadly indoors."]],
  2:[["V","A generator that hasn't run for two years will need a clean and a tune-up to run well."],["R","“Someone on Hillside has a solar battery that can power the whole street!”"]],
  3:[["V","The tower block has an old hand pump in the basement. It was disconnected years ago, but it could be reconnected."]],
  4:[["V","Petrol pumps need electricity. Even a full tanker can't help until the power is back."],["U","A man at the garage: “My mate drives tankers. One's on its way.”"]],
  5:[["V","A well-tuned generator uses noticeably less fuel."]],
  6:[["V","Night repairs need the crew, light, and someone who knows the route."]],
  7:[["V","When power returns, switch big appliances on slowly, or the street can trip again."]]},
 LIA:{1:[["V","Grace has the council emergency officer's direct number."],["U","Council email: “Restoration expected within 48 hours.”"]],
  2:[["V","The council can check rumours with official sources. It takes a call, not radio Signal."]],
  3:[["V","The council has a water bowser. It goes to whoever asks first."]],
  4:[["V","Emergency calls still work through the radio relay at the town hall. Grace can use it."]],
  5:[["V","Police: no break-ins have been reported in Kelderwick this week."],["R","“The grid company is covering something up.”"]],
  6:[["V","The old mill path crosses Hillside land. The council can open a road barrier if it asks nicely."]],
  7:[["V","The council will ask where power should go first. It listens to people who have told the truth."]]}
};
for(const r in DZ_EXTRA_IN)for(const k in DZ_EXTRA_IN[r]){IN[k]=IN[k]||{};IN[k][r]=DZ_EXTRA_IN[r][k]}
/* Kit's Day-5 card follows the seeded truth about the "thieves". */
const DZ_KIT_THIEVES={fox:"Last night Kit saw a fox knocking over the bins on Mill Lane. What a racket!",cat:"Last night Kit heard a cat flap banging and banging next door to Mrs Grant's."};
function dzVariant(seed){
 const rng=dzRng(seed,"variant");
 const v={flood:rng()<0.5?"E":"W",tanker:rng()<0.5?"none":"tomorrow",thieves:dzPick(rng,["game","fox","cat"]),water:dzPick(rng,[2,3,3,4])};
 // 3 extra rumours spread across the weekend, at most one per round
 const pool=dzShuffle(rng,DZ_RUMOURS);const used={};v.extra=[];
 for(const x of pool){if(v.extra.length>=3)break;const r=x.r[0]+Math.floor(rng()*(x.r[1]-x.r[0]+1));if(used[r])continue;used[r]=1;v.extra.push({id:x.id,round:r})}
 v.order=Math.floor(rng()*1e9);
 return v;
}
/* Text swaps applied to everything shown on screen (TV and phone). */
const DZ_THIEVES={
 fox:[["Mrs Grant heard her grandson's video game and thought it was a break-in.","Mrs Grant heard a fox knocking over the bins and thought it was a break-in."],["Mrs Grant heard a video game. Nothing was stolen.","It was a fox in the bins. Nothing was stolen."],["“It was a video game.” Relief and laughter.","“It was a fox in the bins.” Relief and laughter."],["False: a video game.","False: a fox in the bins."]],
 cat:[["Mrs Grant heard her grandson's video game and thought it was a break-in.","Mrs Grant heard her neighbour's cat flap banging all night and thought it was a break-in."],["Mrs Grant heard a video game. Nothing was stolen.","A banging cat flap. Nothing was stolen."],["“It was a video game.” Relief and laughter.","“It was a cat flap.” Relief and laughter."],["False: a video game.","False: a banging cat flap."]]
};
function dzVText(v,html){
 if(!v)return html;let s=String(html);
 if(DZ_KIT_THIEVES[v.thieves])s=s.split(DZ_EXTRA_IN.RUN[5][0][1]).join(DZ_KIT_THIEVES[v.thieves]);
 if(v.flood==="W")s=s.replace(/\b(East|West|EAST|WEST)( Bridge)/g,(m,w,b)=>({East:"West",West:"East",EAST:"WEST",WEST:"EAST"})[w]+b);
 for(const [a,b] of (DZ_THIEVES[v.thieves]||[]))s=s.split(a).join(b);
 s=s.split("{WATER_WHEN}").join(DZ_WATER_WHEN[v.water]||DZ_WATER_WHEN[3]);
 return s;
}
/* Intel cards for one role in one round, for this game's variant. */
function dzIntel(v,round,role){
 let list=((IN[round]||{})[role]||[]).map(x=>x.slice());
 if(v){
  if(round===4&&role==="SIG"&&v.tanker==="tomorrow")list=list.map(x=>/fuel tanker is coming/.test(x[1])?["R","“A fuel tanker is coming to the petrol station!” (Nobody agrees on when.)"]:x);
  for(const e of v.extra||[]){const x=DZ_RUMOURS.find(r=>r.id===e.id);if(x&&e.round===round&&x.role===role)list.push([x.t,x.text])}
  const rng=dzRng(String(v.order),"cards"+round+role);list=dzShuffle(rng,list);
 }
 return list;
}
/* Override of dz24.js role panel: use the variant intel. */
function dz24RolePanel(r,round){
 const role=RL[r],notes=DZ_ROLE_NOTE;
 const v=(typeof S!=="undefined"&&S&&S.v)||window.DZ_PHONE_V||null;
 const items=dzIntel(v,round,r);
 return '<section class="dz24-role-section" style="--dz24-role:'+role.c+'"><div class="dz24-role-line"><span class="dz24-role-icon">'+role.i+'</span><div><div class="dz24-role-name">'+role.ch+' · '+role.n+'</div><div class="dz24-role-mechanic">'+esc(notes[r])+'</div></div></div><div class="dz24-intel-grid">'+items.map((x,i)=>dz24IntelCard(r,x,i)).join("")+'</div></section>';
}
/* Light obfuscation for the private-goal token carried in phone links (not security, just not plain text). */
function dzGoalToken(seed,goal,insider){const s=goal+"."+(insider?1:0)+"."+seed;let o="";for(let i=0;i<s.length;i++)o+=String.fromCharCode(s.charCodeAt(i)^7);return btoa(o).replace(/=+$/,"")}
function dzReadGoalToken(tok){try{const s=atob(tok);let o="";for(let i=0;i<s.length;i++)o+=String.fromCharCode(s.charCodeAt(i)^7);const p=o.split(".");return {goal:p[0],insider:p[1]==="1",seed:p[2]}}catch(e){return null}}
