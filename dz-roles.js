/*
  Day Zero: roles 5–8 for bigger tables.
  Kit (Runner) and Bea (Host) are kid-friendly: one action a Day, no costs,
  a short list of plain-English choices, and one simple card a Day (never a rumour).
  Dev (Mechanic) and Grace (Liaison) are full adult roles.
*/
Object.assign(ROLEX,{
 RUN:{who:"Kit, 12, in the yellow raincoat, knows every shortcut on Mill Lane.",knows:"Simple, true things Kit sees around town.",does:"One quick job a Day: run messages, hand out torches, carry water up the tower.",why:"Fast legs save time. Kit can do the jobs nobody else has time for."},
 HST:{who:"Bea, 9, knows where everything in the hall kitchen is.",knows:"Who is scared, who is cold, and where the blankets are.",does:"One kind job a Day: tea and biscuits, stories for the little ones, blankets.",why:"A hall where people feel welcome holds together."},
 MEC:{who:"Dev, 33, runs the bike repair shop on Mill Lane.",knows:"Machines: generators, pumps, radios, bikes.",does:"Fix and tune things, move a dangerous generator, reconnect the tower's old pump.",why:"The right repair can save Fuel, Signal and lives."},
 LIA:{who:"Grace, 58, a parish councillor with the council's emergency number.",knows:"Official messages, and who at the council can help.",does:"Check rumours with officials, ask for the water bowser, open barriers, call the relay.",why:"Official answers beat rumours, if someone goes and gets them."}
});
const DZ_EXTRA_ROLES=["RUN","HST","MEC","LIA"],DZ_KID_ROLES=["RUN","HST"];
function dzRoles(){return S&&S.pl?S.pl.flatMap(p=>p.r):RO}
function dzIsKid(r){return !!(RL[r]&&RL[r].kid)}

/* Who plays what: 1–4 players share the four core roles as before. With 5–8 players the extra
   roles join in; players ticked as 🧒 get the kid roles first. */
function dzAssignRoles(n,kids){
 kids=kids||[];const pl=Array.from({length:n},()=>[]);
 if(n<=4){RO.forEach((r,i)=>pl[i%n].push(r));return pl}
 const kidIdx=[...Array(n).keys()].filter(i=>kids[i]),kidRoles=DZ_KID_ROLES.slice(0,Math.min(kidIdx.length,2));
 const extras=kidRoles.concat(["MEC","LIA"],DZ_KID_ROLES.filter(r=>!kidRoles.includes(r))).slice(0,n-4);
 const kr=extras.filter(dzIsKid),ar=RO.concat(extras.filter(r=>!dzIsKid(r)));
 const order=kidIdx.concat([...Array(n).keys()].filter(i=>!kids[i]));
 order.forEach(i=>{const r=kids[i]&&kr.length?kr.shift():ar.length?ar.shift():kr.shift();pl[i].push(r)});
 return pl;
}

/* ---------- actions ---------- */
const kidOnce=(id,who,label,av,run,o)=>K(id,who,2,label,()=>av()&&!S.r[id],()=>{S.r[id]=1;return run()},o);
// Kit, the Runner
K("rAld","RUN",1,"👟 Run to Mr Osei: “Please open the tower stairs!”",()=>act("T2")&&!S.f.acc,()=>{S.f.acc=1;S.r.osei=1;return "🔑 Kit sprints round. Mr Osei grabs his keys and opens the back stairs."});
K("rTor","RUN",2,"👟 Hand out torches on Marta's street",()=>!S.f.torch&&!S.th.T8&&S.round<=4,()=>{S.f.torch=1;return "🔦 Kit knocks on every door with a torch. Fewer candles tonight."});
K("rUp","RUN",2,"👟 Run water bottles up the tower stairs",()=>act("T4")&&!S.f.t4u,()=>{S.f.t4u=1;return "🧗 Up and down, up and down. The top floors have water."});
kidOnce("rMsg","RUN","👟 Run messages round the street",()=>true,()=>{if(S.a.contacts<4){S.a.contacts++;return "📨 Neighbours hear what's happening. Contacts +1."}return "📨 Everyone already knows Kit. Lots of waves, no change."});
// Bea, the Host
kidOnce("hTea","HST","🫖 Make tea and hand out biscuits",()=>true,()=>{if(S.t.cohesion<4){tr("cohesion",1);return "🫖 Tea and biscuits for everyone. Cohesion +1."}return "🫖 Everyone has a cuppa. Smiles all round."});
K("hKid","HST",2,"🧸 Read stories to the little ones",()=>!S.f.hKid,()=>{S.f.hKid=1;tr("trust",1);return "🧸 The little ones fall asleep. Their parents tell everyone. Trust +1."});
K("hBlk","HST",2,"🧣 Hand out the spare blankets",()=>S.round>=3&&!dzInit().coldShield&&!S.f.hBlk,()=>{S.f.hBlk=1;dzInit().coldShield=1;return "🧣 A blanket for everyone. The next cold night will hurt a little less."});
K("hPet","HST",2,"🫖 Take Mrs Petrova a hot drink",()=>S.round>=4&&!S.f.hPet,()=>{S.f.hPet=1;tr("health",1);return "🫖 Mrs Petrova holds the mug with both hands. Health +1."});
// Dev, the Mechanic
K("mGenO","MEC",1,"Move the generator safely outside",()=>S.hub.warmth&&S.wt==="gen"&&S.f.gPos&&S.f.gPos!=="N",()=>{S.f.gPos="N";S.f.e5=0;return "🔧 Dev wheels the generator to the sheltered north corner. No fumes indoors."});
K("mTune","MEC",2,"Tune up the generator to save fuel",()=>S.f.gTest&&!S.f.tuned,()=>{S.f.tuned=1;return "🔧 Clean filter, new plug. It will skip its next Fuel."});
K("mPump","MEC",2,"Reconnect the tower block's old hand pump",()=>act("T4")&&!S.f.t4p,()=>{S.f.t4p=1;return "🚰 A clank, a gurgle, and water at the ground floor."});
K("mRad","MEC",2,"Repair a spare radio for Theo",()=>!S.f.mRad&&S.a.signal<6,()=>{S.f.mRad=1;S.a.signal++;return "📻 A second radio crackles to life. Signal +1."});
K("mBike","MEC",2,"Cargo-bike run for supplies",()=>S.round>=2&&!S.f.mBike,()=>{S.f.mBike=1;tr("supplies",1);return "🚲 Dev pedals back with tins and bottled water. Supplies +1, no Fuel used."});
// Grace, the Liaison
K("lChk","LIA",2,"Check a rumour with the council",()=>!S.r.lChk&&T.some(t=>/^i[A-Z]/.test(t.id)&&t.who==="SIG"&&t.av()),()=>{S.r.lChk=1;const t=T.find(t=>/^i[A-Z]/.test(t.id)&&t.who==="SIG"&&t.av());return "🏛️ Grace calls the council. "+t.run()});
K("lCw","LIA",2,"Ask the council for the water bowser",()=>S.f.dry&&!S.hub.water&&!S.f.cw,()=>{S.f.cw=1;return "🏛️ “For Mill Lane? Send your van.”"});
K("lGate","LIA",2,"Ask the council to open the Hillside barrier",()=>S.f.e2&&!S.f.lGate,()=>{S.f.lGate=1;S.f.e2=0;tr("trust",1);return "🏛️ The council and Hillside talk. The barrier lifts. Trust +1."});
K("lRelay","LIA",2,"Call the fire service through the council relay",()=>act("T8")&&!S.f.fR,()=>{S.f.fR=1;S.r.fire=1;return "🏛️ The relay gets through. Fire engines are on the way."});
K("lBrief","LIA",2,"Brief the street with official news",()=>S.hub.info&&!S.f.lBrief,()=>{S.f.lBrief=1;tr("trust",1);return "🏛️ The noticeboard gets an official update. Trust +1."});
GRP["👟 Kit's jobs"]=["rAld","rTor","rUp","rMsg"];
GRP["🫖 Bea's jobs"]=["hTea","hKid","hBlk","hPet"];
GRP["🔧 Dev's repairs"]=["mGenO","mTune","mPump","mRad","mBike"];
GRP["🏛️ Grace and the council"]=["lChk","lCw","lGate","lRelay","lBrief"];

/* Kid roles: one action, and only their own simple jobs. */
function nA(r){if(dzIsKid(r))return 1;let n=S.round===dzSeq()[0]?1:2;if(r==="MED"&&S.f.mL&&(S.round===5||S.round===6))n--;return n}
function opts(r){return T.filter(t=>(t.who===r||(!dzIsKid(r)&&t.who==="ANY"))&&(t.sh?t.sh():t.av()))}

/* The order screen, with role notes for every role and simple buttons for kids. */
function dzOrderRole(r){
 const role=RL[r],n=nA(r);
 let out='<div class="dz24-order-role'+(dzIsKid(r)?" dz-kid":"")+'" style="--dz24-role:'+role.c+'"><div class="dz24-order-role-head">'+role.i+' '+role.ch+' · '+role.n+'</div><div class="dz24-role-mechanic">'+esc(DZ_ROLE_NOTE[r]||"")+'</div>';
 if(dzIsKid(r)){
  const o=opts(r).filter(t=>t.av()),cur=(S.kidPick||{})[r]||"";
  out+='<input type="hidden" id="o_'+r+'_0" value="'+esc(cur)+'"><div class="dz-kidopts">'+o.map(t=>'<button type="button" class="dz-kidbtn'+(cur===t.id?" on":"")+'" onclick="dzKidPick(\''+r+'\',\''+t.id+'\')">'+esc(t.label)+'</button>').join("")+'</div>';
 }else for(let i=0;i<n;i++)out+='<label class="dz24-order-label" for="o_'+r+'_'+i+'">Action '+(i+1)+' of '+n+'</label><select id="o_'+r+'_'+i+'">'+dz24Options(r)+'</select>';
 return out+'</div>';
}
function dzKidPick(r,id){
 S.kidPick=S.kidPick||{};S.kidPick[r]=S.kidPick[r]===id?"":id;
 const f=document.getElementById("o_"+r+"_0");if(f)f.value=S.kidPick[r];
 document.querySelectorAll('.dz-kidbtn').forEach(b=>{const m=(b.getAttribute("onclick")||"").match(/dzKidPick\('(\w+)','(\w+)'\)/);if(m&&m[1]===r)b.classList.toggle("on",S.kidPick[r]===m[2])});
 dzSfx("tick");
}
function dz24Orders(){
 const live=typeof dzLiveOn==="function"&&dzLiveOn();
 let html='<div class="dz24-lead"><div class="dz24-eyebrow">✋ '+(typeof dzDayLabel==="function"?dzDayLabel().toUpperCase():"TODAY")+' · TEAM ACTIONS</div><h2>Make your moves.</h2><p>'+(live?"Players with a connected phone choose their own actions on it. Anyone else enters theirs here.":"Enter each role’s actions on this screen. Actions still resolve in their original order, with the same costs and dependencies.")+'</p></div>';
 html+='<div class="dz24-order-grid">'+S.pl.map((p,i)=>{
  if(live&&dzLiveOrdersIn(i))return '<section class="dz24-order-player dz-live-locked" id="dz-ordp-'+i+'"><h3>'+esc(p.n)+'</h3><p>📱 ✓ Locked in on their phone.</p><button class="dz24-linkbtn" onclick="dzLiveUnlock('+i+')">Enter on this screen instead</button></section>';
  return '<section class="dz24-order-player" id="dz-ordp-'+i+'"><h3>'+esc(p.n)+(live&&dzLiveConnected(i)?' <span class="dz-live-dot" title="Phone connected">📱 choosing…</span>':'')+'</h3>'+p.r.map(dzOrderRole).join("")+'</section>';
 }).join("")+'</div>';
 return html+'<div class="pn c"><p>Some actions depend on another role acting earlier the same Day. Everything happens together when night falls.</p><button class="btn" onclick="dz24LockTeam()">🌙 Lock in &amp; let night fall</button></div>';
}
function dz24LockTeam(){
 const newOrders={},live=typeof dzLiveOn==="function"&&dzLiveOn();
 S.pl.forEach((p,i)=>p.r.forEach(r=>{
  if(live&&dzLiveOrdersIn(i)){newOrders[r]=(S.lv.ord[i][r]||[]).slice(0,nA(r));return}
  newOrders[r]=[];
  for(let k=0;k<nA(r);k++){const field=document.getElementById("o_"+r+"_"+k);if(field&&field.value)newOrders[r].push(field.value)}
 }));
 S.kidPick={};S.ord=newOrders;resolve();
}
/* Bigger tables get more hands, so the town asks more of them. */
function dzBigTable(){
 const n=S.pl.length;if(n<5)return;
 tr("supplies",-1);
 if(n>=7){S.a.fuel=Math.max(1,S.a.fuel-1)}
 S.bigTable=true;
}
