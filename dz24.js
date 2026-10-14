/*
  Day Zero 2.4 — Dual-screen view controller
  TV-only: one shared briefing at a time.
  TV + phones: the TV presents role QR codes; phones open role-specific static round data.
  No server or real-time mobile synchronization is claimed.
*/
function dz24Mode(){return S&&S.mode==="phones"?"phones":"tv"}
function dz24ArtFor(body,r){
 const t=String(body).toLowerCase();
 if(/generator|power station|substation|grid|electricity|repair/.test(t))return "dz23/generator.svg";
 if(/water|tap|tank|container|litre|flood/.test(t))return "dz23/water.svg";
 if(/fuel|diesel|petrol|pump|van|tanker/.test(t))return "dz23/fuel.svg";
 if(/clinic|oxygen|medical|patient|breath|bed|doctor/.test(t))return "dz23/log.svg";
 if(/sketch|map|bridge|route|stairs|footbridge|path/.test(t))return "dz23/route.svg";
 if(/fire|cold|freezing|wood|blanket|warm/.test(t))return "dz23/blankets.svg";
 if(/rumour|video|thieve|social media|broadcast|rumor|notice/.test(t))return "dz23/noticeboard.svg";
 if(/radio|phone|internet|message|contact|call/.test(t))return "dz23/receiver.svg";
 if(/food|supermarket|freezer|supply/.test(t))return "dz23/food.svg";
 return {SIG:"dz23/receiver.svg",QM:"dz23/fuel.svg",MED:"dz23/log.svg",LOC:"dz23/route.svg"}[r]||"dz23/noticeboard.svg";
}
function dz24IntelCard(r,x,i){
 const title={V:"VERIFIED",U:"UNCONFIRMED",R:"RUMOUR"}[x[0]]||"INTELLIGENCE";
 const cls=x[0]==="V"?"verified":x[0]==="R"?"rumour":"unconfirmed";
 const img=dz24ArtFor(x[1],r);
 const marking=x[2]?'<span class="dz24-mark">DOCUMENT</span>':"";
 return '<article class="dz24-intel-card '+cls+'"><div class="dz24-artwrap"><img src="art/'+esc(img)+'" alt="" loading="lazy"></div>'+
 '<div class="dz24-card-copy"><div class="dz24-meta"><span class="dz24-state">'+title+'</span>'+marking+'</div><p>'+esc(x[1])+'</p></div></article>';
}
function dz24RolePanel(r,round){
 const role=RL[r],notes={
 SIG:"Radio investigations and broadcasts use Signal.",
 QM:"Van journeys and deliveries consume Fuel.",
 MED:"Medical actions use limited Medkits; access can matter.",
 LOC:"Contacts and local knowledge can open doors."
 };
 const items=(IN[round]&&IN[round][r])||[];
 return '<section class="dz24-role-section" style="--dz24-role:'+role.c+'"><div class="dz24-role-line"><span class="dz24-role-icon">'+role.i+'</span><div><div class="dz24-role-name">'+role.ch+' · '+role.n+'</div><div class="dz24-role-mechanic">'+esc(notes[r])+'</div></div></div><div class="dz24-intel-grid">'+items.map((x,i)=>dz24IntelCard(r,x,i)).join("")+'</div></section>';
}
function dz24PlayerHand(p,round){
 return p.r.map(r=>dz24RolePanel(r,round)).join("");
}
function dz24PhoneUrl(index){
 const p=S.pl[index],path=window.location.href.split("#")[0].split("?")[0];
 const base=path.substring(0,path.lastIndexOf("/")+1);
 return base+"dayzero24-phone.html#round="+S.round+"&roles="+encodeURIComponent(p.r.join(","))+"&name="+encodeURIComponent(p.n);
}
function dz24PhoneBriefings(){
 const people=S.pl.length;
 return '<div class="dz24-lead"><div class="dz24-eyebrow">ROUND '+S.round+' · PRIVATE BRIEFINGS</div><h2>Everyone checks their own cards</h2><p>Scan the QR code beside your name with your phone. Only your own briefing opens. Keep it to yourself until the council.</p></div>'+
 '<div class="dz24-qr-grid">'+S.pl.map((p,i)=>'<article class="dz24-qr-person"><div class="dz24-player-number">PLAYER '+(i+1)+' OF '+people+'</div><h3>'+esc(p.n)+'</h3><div class="dz24-player-roles">'+p.r.map(r=>esc(RL[r].i+" "+RL[r].n)).join(" · ")+'</div><div class="dz24-qr" id="dz24-qr-'+i+'"></div><p class="dz24-qr-caption">Scan to open your Round '+S.round+' briefing</p><a class="dz24-openlink" target="_blank" rel="noopener" href="'+esc(dz24PhoneUrl(i))+'">Open this briefing on this device ↗</a></article>').join("")+'</div>'+
 '<div class="pn c"><p>The TV does not show anyone’s private information. Each QR is for this round only; you will scan again when the next round begins.</p><button class="btn" onclick="dz24FinishBriefings()">Everyone has their cards · Begin council</button><p class="s">No phones available? <button class="dz24-linkbtn" onclick="dz24SwitchToTV()">Use shared TV briefings instead</button></p></div>';
}
function dz24SharedBriefing(){
 const p=S.pl[S.pi],last=S.pi===S.pl.length-1;
 return '<div class="dz24-lead"><div class="dz24-eyebrow">ROUND '+S.round+' · BRIEFING '+(S.pi+1)+' OF '+S.pl.length+'</div><h2>'+esc(p.n)+'’s role briefing</h2><p>TV-only mode: information is shared openly with the group. '+esc(p.n)+' can present these cards to everyone. Discuss what is reliable at the council.</p></div>'+
 dz24PlayerHand(p,S.round)+
 '<div class="pn c"><button class="btn" onclick="next()">'+(last?"Finish briefings · Continue":"Next player’s briefing")+'</button><p class="s">This shared-screen mode does not conceal card information. For private information, start a game in TV + phones mode.</p></div>';
}
function dz24Briefing(){return dz24Mode()==="phones"?dz24PhoneBriefings():dz24SharedBriefing()}
function dz24FinishBriefings(){
 if(S.ph!=="intel")return;
 S.pi=S.pl.length-1;next();
}
function dz24SwitchToTV(){S.mode="tv";S.pi=0;sv();R()}
function dz24QR(){
 if(typeof QRCode==="undefined")return;
 S.pl.forEach((p,i)=>{
  const node=document.getElementById("dz24-qr-"+i);
  if(!node)return;
  try{new QRCode(node,{text:dz24PhoneUrl(i),width:178,height:178,colorDark:"#0a122a",colorLight:"#ffffff",correctLevel:QRCode.CorrectLevel.M})}
  catch(e){node.textContent="QR unavailable. Use the link below."; }
 });
}
function dz24Options(r){
 const available=opts(r);let html='<option value="">— No action —</option>';
 for(const name in GRP){
  const list=available.filter(t=>GRP[name].includes(t.id));
  if(list.length)html+='<optgroup label="'+esc(name)+'">'+list.map(t=>'<option value="'+esc(t.id)+'">'+esc(t.label+ctx(cost(t)))+'</option>').join("")+'</optgroup>';
 }
 return html;
}
function dz24Orders(){
 let html='<div class="dz24-lead"><div class="dz24-eyebrow">ROUND '+S.round+' · TEAM ACTIONS</div><h2>Decide together. Make your moves.</h2><p>The group has agreed on a plan. Enter each role’s actions on this screen. Actions still resolve in their original order, with the same costs and dependencies.</p></div>';
 html+='<div class="dz24-order-grid">'+S.pl.map(p=>{
  let out='<section class="dz24-order-player"><h3>'+esc(p.n)+'</h3>';
  p.r.forEach(r=>{
   const role=RL[r],n=nA(r),choices=dz24Options(r);
   out+='<div class="dz24-order-role" style="--dz24-role:'+role.c+'"><div class="dz24-order-role-head">'+role.i+' '+role.ch+' · '+role.n+'</div>';
   out+='<div class="dz24-role-mechanic">'+esc(({SIG:"Signal is spent on radio actions.",QM:"Fuel is needed for vehicle trips.",MED:"Medical supplies are limited.",LOC:"Some favours use Contacts."})[r])+'</div>';
   for(let i=0;i<n;i++)out+='<label class="dz24-order-label" for="o_'+r+'_'+i+'">Action '+(i+1)+' of '+n+'</label><select id="o_'+r+'_'+i+'">'+choices+'</select>';
   out+='</div>';
  });
  return out+'</section>';
 }).join("")+'</div>';
 return html+'<div class="pn c"><p>Some actions depend on another role acting earlier in the same round. Choices remain visible here, so this is a shared-cooperation mode.</p><button class="btn" onclick="dz24LockTeam()">Resolve the team’s actions</button></div>';
}
function dz24LockTeam(){
 const newOrders={};
 S.pl.forEach(p=>p.r.forEach(r=>{
  newOrders[r]=[];
  for(let i=0;i<nA(r);i++){
   const field=document.getElementById("o_"+r+"_"+i);
   if(field&&field.value)newOrders[r].push(field.value);
  }
 }));
 S.ord=newOrders;resolve();
}
