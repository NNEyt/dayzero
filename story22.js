
// DAY ZERO 2.2 — STORY-LED PLANNING, OUTCOMES AND RECORDED PROGRESS
// Uses the existing action economy, crisis clocks, inventory and chapter engine.
const DZ22_LABELS={
 supplies:"🥫 Supplies",health:"❤️ Health",cohesion:"🤝 Cohesion",trust:"🏘️ Trust",
 fuel:"⛽ Fuel",signal:"📻 Signal",medkits:"✚ Medkits",contacts:"🏠 Contacts",
 warmth:"🔥 Warmth",water:"💧 Water",info:"📻 Information"
};
function dz22Frame(){
 return {t:{...S.t},a:{...S.a},hub:{...S.hub},items:[...dzInit().inventory]};
}
function dz22Changes(before,after){
 const out=[];if(!before||!after)return out;
 for(const domain of ["t","a"])for(const k of Object.keys(after[domain])){
  const diff=after[domain][k]-(before[domain]?.[k]??after[domain][k]);
  if(diff)out.push(DZ22_LABELS[k]+" "+(diff>0?"+":"")+diff);
 }
 for(const k of Object.keys(after.hub))if(!!after.hub[k]!==!!before.hub[k])out.push(DZ22_LABELS[k]+(after.hub[k]?" running":" stopped"));
 for(const id of after.items.filter(id=>!before.items.includes(id)))out.push("🎒 Found "+(DZ_ITEMS[id]?.name||id));
 for(const id of before.items.filter(id=>!after.items.includes(id)))out.push("🎒 Used "+(DZ_ITEMS[id]?.name||id));
 return out;
}
function dz22Status(id,raw){
 const x=String(raw||"");
 if(/^🚪|^🌊/.test(x)||/don't know you|needs trust|don't know\. no sign/i.test(x))return "blocked";
 return "done";
}
function dz22Record(action,status,raw,before){
 const after=dz22Frame();
 const found=after.items.filter(id=>!before.items.includes(id));
 return {id:action.id,role:action.r,label:TI[action.id]?.label||action.id,status,
 raw:String(raw||""),changes:dz22Changes(before,after),found};
}
function dz22Artwork(id,found){
 if(found?.length){
  const x=found[0];return {batteries:"r_SIG",receiver:"r_SIG",route:"dl5",blankets:"ev6",log:"t1",worklight:"t10"}[x]||"teach";
 }
 if(["fill","cw","cwV","t4w","t4p","t4u"].includes(id))return "t4";
 if(["gTest","gN","gS","gST","gMH","wood","woodV"].includes(id))return "ev6";
 if(["info","iMid","iArm","iEva","iWat","iTan","iBrk","iSab","bA","bB","bC","bT","fR","cR","useReceiver"].includes(id))return "r_SIG";
 if(["osei","aldT","aldW","aldV","aldC"].includes(id))return "t2";
 if(["fW","fE","useLogSIG","useLogLOC"].includes(id))return "t1";
 if(["lind","frz"].includes(id))return "o1";
 if(["had","dep","depV"].includes(id))return id==="had"?"t6":"o2";
 if(["fH"].includes(id))return "t8";
 if(["wat","wel","welM"].includes(id))return "t9";
 if(["gM","gW","gE","cF","calm","useRoute"].includes(id))return "t10";
 if(["trt","useBlankets"].includes(id))return "r_MED";
 if(id==="cmf")return "teach";
 if(id==="exTower")return "t4";
 if(id==="exClinic")return "t1";
 if(id==="exHall")return "teach";
 return "ev"+S.round;
}
function dz22Plain(s){
 return String(s||"").replace(/<[^>]*>/g,"").replace(/^[\s✖✅◐✚🔧🔥🪵💧🏛️📻🔑🫁🧳🩺⛽🌊🛒🚰📢🛢️🚨🧭🤗🔎🎒🧣📋📡🏃🧗☑️]+/u,"").trim();
}
function dz22ResultText(x){
 const who=RL[x.role]?.ch||"Someone";
 const raw=dz22Plain(x.raw);
 if(x.status==="blocked"){
  if(x.id==="aldT")return who+" went to reach Mr Aldous, but the tower's back entrance was still locked. The group needed Marta to speak to Mr Osei first.";
  if(x.id==="woodV")return "Ines was ready to collect firewood, but Bram hadn't agreed to provide any. Marta needs to secure his help before the van can leave.";
  if(x.id==="frz")return "Ines tried to collect the supermarket food, but Mrs Lindqvist hadn't given permission yet. Marta must speak to her first.";
  if(x.id?.startsWith("ex"))return who+" searched for more equipment, but the location had nothing else available. The others may have reached it first.";
  return who+" tried to "+x.label.toLowerCase()+", but the plan couldn't proceed: "+raw;
 }
 switch(x.id){
  case "fill":return /Half full/.test(x.raw)?who+" carried water containers to the kitchen and filled the first half. Another trip is still needed before the hall has a full reserve.":who+" turned off the tap after filling the last containers. The hall now has an emergency water reserve.";
  case "info":return "Theo cleared a table for the radio and pinned the first verified updates to the hall noticeboard. The community finally has a place to look for reliable news.";
  case "gTest":return who+" examined the long-unused generator and coaxed it into life. It works, but running it will require fuel and a safe outdoor position.";
  case "osei":return "Marta found Mr Osei and persuaded him to unlock the tower's back stairs. Pavel finally has a route towards the ninth floor.";
  case "aldT":return "Pavel climbed the dark stairwell to Mr Aldous's flat and found a backup cylinder. Mr Aldous is stable for now, though the danger hasn't fully passed.";
  case "wood":return "Marta's request finally persuaded Bram Hollis to share his firewood. A van journey is still needed to bring it back to the hall.";
  case "woodV":return "Ines drove across Kelderwick and returned with enough firewood to start warming the hall.";
  case "lind":return "Marta spoke with Mrs Lindqvist, who agreed to hand over the freezer food before it spoiled. The Quartermaster can now collect it.";
  case "frz":return "Ines returned from the supermarket with boxes of thawing food. The group's shared supplies increased, at least for the next few meals.";
  case "fW":return "Ines used the West Bridge to get fuel safely to the clinic. Its generator can keep vital equipment running.";
  case "fE":return "Ines reached the East Bridge only to find it flooded. She had to turn the van back, losing precious time.";
  case "cw":return "Marta appealed to the council officer for more water. "+raw;
  case "cwV":return "Ines collected council water and delivered it to the hall. A workable water supply is now in place.";
  case "dep":return "Marta called in a favour at the bus depot. Ruth Adeyemi agreed to let the team collect diesel.";
  case "depV":return "Ines brought back fuel from the depot. The van and generator have a little more time.";
  case "trt":return "Pavel tended to the sick and exhausted neighbours, easing the pressure on the hall's makeshift medical area.";
  case "cmf":return who+" stayed with frightened neighbours, listened to their worries and helped the room settle.";
  case "exHall":case "exTower":case "exClinic":{
   if(x.found.length){const item=DZ_ITEMS[x.found[0]];return who+" searched "+({exHall:"the community hall storeroom",exTower:"the tower caretaker's cupboard",exClinic:"the clinic maintenance room"}[x.id])+" and discovered "+item.name.toLowerCase()+". The find is now available to the whole team.";}
   return who+" searched the location but found nothing useful this time.";
  }
  case "useReceiver":return "Theo connected the spare batteries to the receiver and caught an earlier-dated grid transmission. It may help establish a timeline, but it doesn't prove sabotage.";
  case "useBlankets":return "Pavel handed out thermal blankets to those most vulnerable to the cold. One future cold-related Health loss can now be reduced.";
  case "useLogSIG":case "useLogLOC":return who+" examined the clinic's service log. The timestamp predates the blackout. The journal gains a clue, but the explanation is still uncertain.";
  case "useRoute":return "Marta compared the old route sketch with the worklight's view of the mill path. She now knows a possible way to guide the grid crew.";
  case "bA":return "Theo broadcast an unverified promise of a fuel tanker. At the petrol station, the growing queue took the message as a fact—and trust suffered.";
  case "bB":return "Theo confirmed there was no tanker coming and explained why the pumps were out of action. The crowd began to disperse.";
  case "bC":return "Theo gave the petrol crowd only part of the truth. Some people left; others stayed waiting for a tanker that wasn't coming.";
  case "fR":return "Theo reached the fire service using the council radio relay. Help is on its way, but the neighbours still need a safe route outside.";
  case "fH":return who+" helped neighbours get safely away from the burning house. They stayed outside and waited for trained firefighters.";
  case "gM":return who+" set off to guide the repair crew by the old mill route. The path might get them through before morning.";
  case "cF":return "Ines managed to get fuel to the substation. The crew now has one of the resources it needs.";
  case "cR":return "Theo established a radio link with the repair crew. Directions can finally be passed through the darkness.";
  default:return who+" acted on the team's plan: "+x.label.charAt(0).toLowerCase()+x.label.slice(1)+". "+raw;
 }
}
function dz22Moment(){
 const rs=S.report||[],positive=rs.filter(x=>x.status==="done"),miss=rs.filter(x=>x.status!=="done");
 const date=DZ21_CHAPTERS[S.round]?.time||"The blackout continues";
 const lead=positive.length===0?"When the team returns to the community hall, there is little good news to share. Their plans have run into obstacles, and precious time has slipped away.":"When the team gathers again at Mill Lane, everybody has something to report. The decisions made around the table have now become real journeys, conversations and discoveries across town.";
 let detail="";
 if(rs.some(x=>x.id==="fill"&&x.raw.includes("All 20")))detail="The hall has finally filled its water containers.";
 else if(rs.some(x=>x.id==="osei"&&x.status==="done"))detail="Marta's conversation with the caretaker has opened a route into the tower block.";
 else if(rs.some(x=>x.found?.length))detail="At least one useful object has been recovered and placed in the group's shared equipment.";
 else if(rs.some(x=>x.id==="frz"&&x.status==="done"))detail="The supermarket's food is now part of the hall's provisions.";
 if(miss.length)detail+=(detail?" But ":"")+(miss.length===1?"one plan":"several plans")+" could not go ahead. The team will need to rethink its next steps.";
 if(!detail)detail= "Some efforts have helped; others may matter later. The group's resources and relationships will determine which opportunities remain open.";
 return '<div class="dz22-story"><div class="dz22-scene-image">'+art("ev"+S.round,"📖")+'</div><div class="dz22-story-prose"><div class="dz22-kicker">CHAPTER "+S.round+" · AFTER THE ORDERS</div><h3>Back at the Hall</h3><div class="dz22-read">📖 '+dz21Attribution()+'</div><p>'+esc(lead)+'</p><p>'+esc(detail)+'</p></div></div>';
}
function dz22ResultCards(){
 const reports=Array.isArray(S.report)?S.report:[];
 if(!reports.length)return '<div class="pn"><p>No recorded actions this round.</p></div>';
 return '<div class="dz22-grid">'+reports.map(r=>{
 const role=RL[r.role]||{ch:"Neighbour",n:"Team",c:"#ffd166",i:"🎒"};
 const status=r.status==="blocked"?"BLOCKED":"ACTION COMPLETED";
 const color=r.status==="blocked"?"#d9855f":role.c;
 const chips=r.changes?.length?'<div class="dz22-chips">'+r.changes.map(t=>'<span>'+esc(t)+'</span>').join("")+'</div>':(r.status==="done"?'<div class="dz22-chips"><span>Progress made · no resource spent or gained</span></div>':"");
 return '<article class="dz22-result" style="--dz22:'+color+'"><div class="dz22-art">'+art(dz22Artwork(r.id,r.found),role.i)+'</div>'+
 '<div class="dz22-details"><div class="dz22-kicker">'+esc(role.ch)+" · "+status+'</div><h4>'+esc(r.label)+'</h4><p>'+esc(dz22ResultText(r))+'</p>'+chips+'</div></article>';
 }).join("")+'</div>';
}
function dz22CouncilScene(){
 const r=S.round;const scenes={
 1:"Four neighbours sit around a table in the community hall. A man in the tower block needs help, and the hall itself is not ready for a long outage. Your time is limited. Who speaks to the caretaker, who reaches the patient, and what should be prepared for everyone else?",
 2:"It is nearly midnight. Food may spoil, the clinic needs fuel and neighbours are asking for supplies. The team cannot be everywhere at once. Decide which promises you can actually keep—and which role must act before another can succeed.",
 3:"The morning brings empty bottles and pressure on the town's water supply. A container filled now may prevent trouble later, but there are neighbours further up the tower who need help immediately. Divide the work before the taps go dry.",
 4:"As phones stop working, rumours move through Kelderwick faster than the facts. The petrol station crowd is growing, and a medical decision is waiting. What do you really know, and whose information should the group trust?",
 5:"The hall is full of whispers about thieves and sabotage. The cold is coming. Each role knows something different, but hearsay is not proof. Decide whether to verify the story, reassure the neighbours or prepare for the night.",
 6:"The repair crew is within reach of the substation, yet the roads are blocked. The hall is freezing. Can the team guide the workers, find the fuel and maintain radio contact without abandoning vulnerable neighbours?",
 7:"The lights may finally return, but there isn't enough power for every building at once. Think about the people you helped, the promises you made and which part of the community needs power first."
 };
 const advice=[];
 if(act("T2")&&!S.f.acc)advice.push("Tower block: Marta can ask Mr Osei to unlock the back stairs. Pavel cannot reach Mr Aldous until someone arranges access. Both actions can be chosen for the same round.");
 if(act("O1")&&!S.f.lind)advice.push("Supermarket: Marta must gain Mrs Lindqvist's agreement before Ines collects the freezer food. Coordinate both roles.");
 if(!S.f.gTest&&!S.hub.warmth)advice.push("Warmth: someone needs to test the generator before it can be set up safely outdoors. Firewood is another option, but Bram must first agree to help.");
 if(S.a.signal<=1&&S.round>=2)advice.push("Radio capacity is low. An operating hall radio point restores 1 Signal at the beginning of later rounds; spare batteries and the receiver offer a separate one-time boost.");
 if(act("T10"))advice.push("Grid crew: the repair needs a guide, fuel and radio coordination. These can involve different roles during the same round.");
 return '<div class="dz22-story dz22-council"><div class="dz22-scene-image">'+art("teach","🕯️")+'</div><div class="dz22-story-prose"><div class="dz22-kicker">THE COUNCIL · ROUND '+r+'</div><h3>What Will Your Team Do?</h3><div class="dz22-read">📖 '+dz21Attribution()+'</div><p>'+esc(scenes[r])+'</p><p><b>Each player now shares everything they learned.</b> Read ordinary information cards aloud. Cards marked DESCRIBE ONLY must be explained in your own words. Discuss and agree on a plan before choosing orders.</p></div></div>'+
 (advice.length?'<div class="pn dz22-teamwork"><b>🤝 Ways to work together</b>'+advice.slice(0,3).map(x=>'<p>'+esc(x)+'</p>').join("")+'</div>':"");
}
function dz22RolePrompt(role){
 const names={
 SIG:"Theo listens to the radio while everybody waits for news. You cannot spend Signal everywhere. Which warning is worth investigating, and what needs to be communicated?",
 QM:"Ines has the keys, the van and responsibility for the hall. Journeys cost fuel. Which delivery must happen first—and who needs to arrange access?",
 MED:"Pavel understands what delay means for the sick and vulnerable. Who needs attention right now, and can the team clear the route before you go?",
 LOC:"Marta knows Kelderwick's people, shortcuts and old promises. Often, someone must earn permission before another role can complete the job."
 };
 return '<div class="dz22-role-cue"><b>In the story:</b> '+esc(names[role]||"Discuss the team's plan.")+'</div>';
}

function dz22TimePassage(){
 const notes=Array.isArray(S.esc)?S.esc:[];
 const artFor=(x)=>/cold|freezing|shiver|bitter|frost/i.test(x)?"ev6":
 /water|tap|tower/i.test(x)?"t3":
 /fire|smoke/i.test(x)?"t8":
 /generator|fuel/i.test(x)?"t1":
 /rumour|trust|neighbour/i.test(x)?"ev5":
 /repair|substation|power|grid/i.test(x)?"t10":
 "echo";
 if(!notes.length)return '<div class="pn">The night passes without further news.</div>';
 return '<div class="dz22-grid">'+notes.map(note=>{
  const msg=dz22Plain(note),good=/✅/.test(note),warn=/✖/.test(note);
  const heading=good?"A welcome development":warn?"Trouble in Kelderwick":"The hours pass";
  return '<article class="dz22-result" style="--dz22:'+(good?"#6bd59f":warn?"#e39b75":"#9bb4df")+'"><div class="dz22-art">'+art(artFor(note),"⏳")+'</div><div class="dz22-details"><div class="dz22-kicker">TIME PASSES · ROUND '+S.round+'</div><h4>'+heading+'</h4><p>'+esc(msg)+'</p></div></article>';
 }).join("")+'</div>';
}
function dz22Results(){
 return '<h2>What Happened · Chapter '+S.round+'</h2>'+dz22Moment()+
 '<div class="sec">🃏 The results of your choices</div><p class="c s">Each illustrated card is a completed or blocked action. The coordinator can read the outcomes aloud.</p>'+dz22ResultCards()+
 '<details class="pn dz22-technical"><summary>See the original orders and action log</summary><p>'+(S.rev||[]).map(esc).join("<br>")+'</p><div>'+((S.log||[]).map(t=>'<p>'+t+'</p>').join(""))+'</div></details>'+
 dif(S.pre)+dzPanel()+'<div class="sec">🏘️ Your town</div>'+board()+
 '<div class="c"><button class="btn" onclick="escal()">The hours pass…</button></div>';
}
