/*
  Day Zero: phone controllers ("TV + phone controllers" mode).
  The TV is the host. Phones join over WebRTC data channels using PeerJS and its free
  public broker (0.peerjs.com) for the hand-shake, with Google STUN and the PeerJS TURN relays.
  After the hand-shake, messages go phone <-> TV directly (or via TURN); no game data is stored anywhere.
  Phones can: read their private cards, see their secret goal, choose their own actions,
  cast secret ballots and make the final accusation.
  If the link fails or a phone drops, that player simply carries on via the TV
  (pass-the-device), which is always offered alongside.
*/
let dzPeer=null,dzPeerState="off",dzPeerErr="",dzConns={},dzLiveSent={},dzPeerRetry=0;
const DZ_ID_CH="abcdefghijkmnpqrstuvwxyz23456789";
function dzRandId(n){const a=new Uint8Array(n);(window.crypto||{getRandomValues:x=>x.map(()=>Math.random()*256|0)}).getRandomValues(a);return Array.from(a,x=>DZ_ID_CH[x%DZ_ID_CH.length]).join("")}
function dzLiveOn(){return !!(S&&S.mode==="live"&&S.lv)}
function dzLiveConnected(i){const c=dzConns[i];return !!(c&&c.open)}
function dzLiveOrdersIn(i){return dzLiveOn()&&!!S.lv.ord[i]&&S.ph==="decide"}
/* Phones pick actions once today's big decision (if any) is settled. */
function dzLiveActing(){return S.ph==="decide"&&!(S.dl&&!S.dc)}
let dzLastLv=null;
function dzLiveSetup(o){
 if(S.mode!=="live")return;
 // Next episode / play again with the same table: keep the same room so phones stay connected.
 const keep=dzLastLv&&dzLastLv.names===S.pl.map(p=>p.n).join("|");
 S.lv={id:keep?dzLastLv.id:"dayzero-"+dzRandId(12),keys:keep?dzLastLv.keys.slice():S.pl.map(()=>dzRandId(10)),ord:{},read:{}};
 dzLastLv={id:S.lv.id,keys:S.lv.keys,names:S.pl.map(p=>p.n).join("|")};
 for(const i in dzLiveSent)delete dzLiveSent[i];
 S.lobby=true;
}
function dzLiveJoinUrl(i){
 const path=location.href.split("#")[0].split("?")[0],base=path.substring(0,path.lastIndexOf("/")+1);
 return base+"play.html#h="+encodeURIComponent(S.lv.id)+"&p="+i+"&k="+S.lv.keys[i];
}

/* ---------- host connection ---------- */
function dzLiveStart(){
 if(!dzLiveOn())return;
 if(dzPeer&&dzPeer.id===S.lv.id&&!dzPeer.destroyed)return;
 if(dzPeer)dzLiveStop();
 if(!dzLastLv)dzLastLv={id:S.lv.id,keys:S.lv.keys,names:S.pl.map(p=>p.n).join("|")};
 if(typeof Peer==="undefined"){dzPeerState="failed";dzPeerErr="The phone-link library didn't load (offline?).";return}
 dzPeerState="connecting";
 try{dzPeer=new Peer(S.lv.id,{debug:0})}catch(e){dzPeerState="failed";dzPeerErr=String(e&&e.message||e);dzPeer=null;return}
 dzPeer.on("open",()=>{dzPeerState="ready";dzPeerRetry=0;dzLiveStatus()});
 dzPeer.on("connection",conn=>{
  conn.on("data",d=>{try{dzLiveMsg(conn,d)}catch(e){console.error(e)}});
  conn.on("close",()=>dzLiveDrop(conn));conn.on("error",()=>dzLiveDrop(conn));
 });
 dzPeer.on("disconnected",()=>{if(dzPeer&&!dzPeer.destroyed){dzPeerState="connecting";dzLiveStatus();setTimeout(()=>{try{dzPeer&&dzPeer.reconnect()}catch(e){}},2000)}});
 dzPeer.on("error",err=>{
  const t=err&&err.type;dzPeerErr=t||String(err);
  if(t==="peer-unavailable"||t==="webrtc")return; // a single phone problem, not ours
  if(t==="unavailable-id"||t==="network"||t==="server-error"||t==="socket-error"||t==="socket-closed"){
   // e.g. after a page reload the broker still holds our id for a few seconds; try again
   try{dzPeer.destroy()}catch(e){}dzPeer=null;dzPeerState=++dzPeerRetry>4?"failed":"connecting";dzLiveStatus();
   setTimeout(dzLiveStart,Math.min(15000,2500*dzPeerRetry));return;
  }
  dzPeerState="failed";dzLiveStatus();
 });
}
function dzLiveStop(){try{dzPeer&&dzPeer.destroy()}catch(e){}dzPeer=null;dzConns={};dzPeerState="off"}
function dzLiveDrop(conn){if(conn.p!==undefined&&dzConns[conn.p]===conn){delete dzConns[conn.p];delete dzLiveSent[conn.p];dzLiveStatus()}}
function dzLiveSend(i,msg){const c=dzConns[i];if(c&&c.open){try{c.send(msg)}catch(e){}}}

/* ---------- messages from phones ---------- */
function dzLiveMsg(conn,d){
 if(!d||typeof d!=="object"||!S||!S.lv)return;
 if(d.t==="hello"){
  const p=Number(d.p);
  if(!Number.isInteger(p)||p<0||p>=S.pl.length||d.k!==S.lv.keys[p]){try{conn.send({t:"denied"})}catch(e){}setTimeout(()=>conn.close(),300);return}
  if(dzConns[p]&&dzConns[p]!==conn){try{dzConns[p].send({t:"replaced"});dzConns[p].close()}catch(e){}}
  conn.p=p;dzConns[p]=conn;delete dzLiveSent[p];
  conn.send({t:"welcome",name:S.pl[p].n,roles:S.pl[p].r,seed:S.seed});
  dzSfx("chime");dzLiveStatus();dzLiveSync();return;
 }
 const p=conn.p;if(p===undefined||dzConns[p]!==conn)return;
 if(d.t==="read"&&S.ph==="discuss"&&d.round===S.round){S.lv.read[p]=1;sv();dzLiveRefresh()}
 else if(d.t==="goalack"&&S.ph==="goals"){S.gi.seen=S.gi.seen||{};if(S.gi.i===p)return;S.gi.seen[p]=1;sv();if(Object.keys(S.gi.seen).length>=S.pl.length)dzGoalsDone();else dzLiveRefresh()}
 else if(d.t==="orders"&&dzLiveActing()&&d.round===S.round)dzLiveOrders(p,d.ord);
 else if(d.t==="ballot"&&S.ph==="vote"&&S.vt&&d.dl===S.dl)dzLiveBallot(p,d);
 else if(d.t==="accuse"&&S.ph==="accuse"&&S.ac&&!(p in S.ac.b)){const j=Number(d.j);if(Number.isInteger(j)&&j>=0&&j<S.pl.length&&j!==p){S.ac.b[p]=j;dzSfx("vote");dzAccuseCheck()}}
 else if(d.t==="unlock"&&S.ph==="decide"&&S.lv.ord[p]){delete S.lv.ord[p];sv();dzLiveOrderSection(p)}
 dzLiveSync();
}
function dzLiveOrders(p,ord){
 if(!ord||typeof ord!=="object")return;
 const clean={};
 for(const r of S.pl[p].r){
  const ok=new Set(opts(r).map(t=>t.id)),want=Array.isArray(ord[r])?ord[r]:[];
  clean[r]=want.filter(id=>typeof id==="string"&&ok.has(id)).slice(0,nA(r));
 }
 S.lv.ord[p]=clean;dzSfx("vote");sv();dzLiveOrderSection(p);
}
function dzLiveBallot(p,d){
 const vt=S.vt;if(vt.b.some(b=>b.who===p)||vt.i===p)return;
 const o=DL[S.dl][4].find(x=>x[0]===d.opt);if(!o||!dzVoteOptionOk(o))return;
 const ok=new Set(dzBallotExtras(p).map(x=>x.v));const x=typeof d.x==="string"&&ok.has(d.x)?d.x:"";
 vt.b.push({who:p,opt:o[0],x,via:"phone"});dzSfx("vote");sv();
 if(vt.b.length>=S.pl.length)dzTally();else dzLiveRefresh();
}
function dzBallotExtras(me){
 if(!S.insiderOn)return [];
 const others=S.pl.map((q,j)=>j).filter(j=>j!==me),out=[{v:"",l:"Nothing to note"}];
 if(me===S.insider){const left=2-(S.sab||[]).length;if(left>0)out.push({v:"sab:fuel",l:"🕵️ Quiet sabotage: drain 1 Fuel from the van ("+left+" left)"},{v:"sab:supplies",l:"🕵️ Quiet sabotage: spoil 1 Supplies ("+left+" left)"})}
 others.forEach(j=>out.push({v:"sus:"+j,l:"I don't fully trust "+S.pl[j].n}));
 return out;
}

/* ---------- what each phone shows ---------- */
function dzLiveView(i){
 const p=S.pl[i],ph=S.ph,v={ph,round:S.round,day:dzDayNo()+"/"+dzDays(),act:dzActLabel(),ep:S.ep||0,name:p.n,roles:p.r,seed:S.seed,title:dzArc().head};
 if((S.goalsShown||ph==="goals")&&(S.goalsOn||i===S.insider)&&S.goals[i])v.goal=i===S.insider?{insider:true}:{key:S.goals[i]};
 if(["discuss","decide","night","vote","vreveal"].includes(ph))v.cards=S.round;
 if(S.lobby&&ph==="news")v.k="lobby";
 else if(ph==="discuss")v.k="intel",v.read=!!S.lv.read[i];
 else if(ph==="goals")v.k="goal",v.acked=!!(S.gi.seen||{})[i];
 else if(dzLiveActing()){
  v.k="orders";v.locked=!!S.lv.ord[i];v.mine=S.lv.ord[i]||null;
  v.slots=p.r.map(r=>({r,role:RL[r].ch+" · "+RL[r].n,icon:RL[r].i,c:RL[r].c,kid:dzIsKid(r),n:nA(r),
   opts:opts(r).filter(t=>!dzIsKid(r)||t.av()).map(t=>({id:t.id,l:t.label+ctx(cost(t)),g:Object.keys(GRP).find(g=>GRP[g].includes(t.id))||""}))}));
 }else if(ph==="vote"&&S.vt){
  const d=DL[S.dl];v.k="vote";v.voted=S.vt.b.some(b=>b.who===i);v.dl=S.dl;
  v.d={t:d[1],i:d[2],x:d[3],opts:d[4].map((o,j)=>({id:o[0],l:"Option "+"ABC"[j]+": "+o[1],now:o[2],dis:!dzVoteOptionOk(o)}))};
  v.extra=dzBallotExtras(i);
 }else if(ph==="accuse"&&S.ac){
  v.k="accuse";v.done=i in S.ac.b;v.list=S.pl.map((q,j)=>({j,n:q.n})).filter(x=>x.j!==i);v.ruled=dzExonerated().map(j=>S.pl[j].n);
 }else{
  v.k="watch";v.msg={news:"📰 Today's news is on the TV.",decide:"✋ Settle today's big decision on the TV.",night:"🌙 Night falls… watch the TV.",goals:"Watch the TV.",vreveal:"The votes are being revealed!",accrev:"Who had the key?",end:"Read the Mill Lane Chronicle on the TV."}[ph]||"Watch the TV.";
 }
 return v;
}
function dzLiveSync(){
 if(!dzLiveOn())return;
 for(const i in dzConns){const v=dzLiveView(+i),j=JSON.stringify(v);if(dzLiveSent[i]!==j){dzLiveSent[i]=j;dzLiveSend(i,{t:"view",v})}}
}

/* ---------- TV screens ---------- */
function dzLiveBadge(i){return dzLiveConnected(i)?'<span class="dz-lv on" id="dz-lv-'+i+'">📱 connected</span>':'<span class="dz-lv" id="dz-lv-'+i+'">📵 not connected</span>'}
function dzLiveLinkState(){
 return {off:"",connecting:'<p class="dz-lvstate">⏳ Opening the phone link…</p>',ready:'<p class="dz-lvstate ok">✅ Phone link ready. Scan your code.</p>',failed:'<p class="dz-lvstate bad">⚠️ The phone link isn\'t working ('+esc(dzPeerErr||"no connection")+'). No problem: everything also works on this screen.</p>'}[dzPeerState]||"";
}
function vLobby(){
 return '<div class="dz24-lead"><div class="dz24-eyebrow">TV + PHONE CONTROLLERS</div><h2>Grab your phones</h2><p>Scan your own code. Your phone becomes your controller: your private cards, your secret goal, your own actions and your secret votes. Same Wi-Fi as the TV works best.</p></div>'+
 '<div id="dz-lvstate">'+dzLiveLinkState()+'</div>'+
 '<div class="dz24-qr-grid">'+S.pl.map((p,i)=>'<article class="dz24-qr-person"><div class="dz24-player-number">PLAYER '+(i+1)+'</div><h3>'+esc(p.n)+'</h3><div class="dz24-player-roles">'+p.r.map(r=>esc(RL[r].i+" "+RL[r].ch)).join(" · ")+'</div><div class="dz24-qr" id="dz-lvqr-'+i+'"></div>'+dzLiveBadge(i)+'<a class="dz24-open-link" href="'+esc(dzLiveJoinUrl(i))+'" target="_blank" rel="noopener">Open link</a></article>').join("")+'</div>'+
 '<div class="pn c"><button class="btn" onclick="dzLiveBegin()">📰 Start Day 1</button><p class="s">Anyone without a phone plays on this screen, as usual. You can join later too.</p><p class="s"><button class="dz24-linkbtn" onclick="dzLiveToTV()">Play without phones</button></p></div>';
}
function dzLiveBegin(){S.lobby=false;dzSfx("page");sv();R()}
function dzLiveToTV(){dzLiveStop();S.mode="tv";S.lobby=false;sv();R()}
function dzLiveQR(){
 if(!S||!S.lobby||typeof QRCode==="undefined")return;
 S.pl.forEach((p,i)=>{const node=document.getElementById("dz-lvqr-"+i);if(!node||node.childNodes.length)return;
  try{new QRCode(node,{text:dzLiveJoinUrl(i),width:178,height:178,colorDark:"#0a122a",colorLight:"#ffffff",correctLevel:QRCode.CorrectLevel.M})}catch(e){node.textContent="Use the link below."}});
}
/* Status panels shown while phones are busy; anyone can still use the TV instead. */
function dzLivePanel(kind){
 const n=S.pl.length;
 const cfg={
  goals:{h:"🤫 Secret goals",p:"Check your phone for your secret goal, then tap “Got it”.",done:j=>(S.gi.seen||{})[j],btn:j=>"S.gi.i="+j+";S.gi.show=false;R()",lbl:"Show it on this screen"},
  vote:{h:DL[S.dl]?DL[S.dl][2]+" Secret vote: "+DL[S.dl][1]:"Secret vote",p:"Vote on your phone. Nobody sees your ballot.",done:j=>S.vt.b.some(b=>b.who===j),btn:j=>"S.vt.i="+j+";S.vt.show=false;R()",lbl:"Vote on this screen"},
  accuse:{h:"🕵️ Who had the key?",p:"Make your secret accusation on your phone.",done:j=>j in S.ac.b,btn:j=>"S.ac.i="+j+";S.ac.show=false;R()",lbl:"Accuse on this screen"},
  intel:{h:"📇 Your cards",p:"Read your private cards on your phone, then tap “I've read my cards”. Then share what you know.",done:j=>S.lv.read[j],btn:j=>"dzLiveShowHand("+j+")",lbl:"Show their cards here"}
 }[kind];
 const done=S.pl.filter((p,j)=>cfg.done(j)).length;
 return '<div class="dz24-lead"><div class="dz24-eyebrow">TV + PHONE CONTROLLERS · '+done+' OF '+n+' READY</div><h2>'+cfg.h+'</h2><p>'+cfg.p+'</p></div>'+
 '<div class="dz-lvlist">'+S.pl.map((p,j)=>'<div class="dz-lvrow'+(cfg.done(j)?" done":"")+'"><b>'+esc(p.n)+'</b> '+(cfg.done(j)?'<span class="dz-lv on">✓ done</span>':dzLiveBadge(j)+' <button class="btn b sm2" onclick="'+cfg.btn(j)+'">'+cfg.lbl+'</button>')+'</div>').join("")+'</div>'+
 (kind==="intel"?'<div id="dz-lvhand"></div>':"")+
 '<div id="dz-lvstate">'+(dzPeerState==="failed"?dzLiveLinkState():"")+'</div>';
}
function dzLiveShowHand(j){
 const el=document.getElementById("dz-lvhand");if(!el)return;
 el.innerHTML='<div class="pn"><h3>'+esc(S.pl[j].n)+'’s cards</h3><p class="s">Shown on the TV, so everyone can see them.</p>'+dzVText(S.v,dz24PlayerHand(S.pl[j],S.round))+'</div>';
 S.lv.read[j]=1;sv();
}
function dzLiveOrderSection(p){
 const el=document.getElementById("dz-ordp-"+p);
 if(!el){dzLiveRefresh();return}
 const tmp=document.createElement("div");tmp.innerHTML=dzVText(S.v,dz24Orders());
 const nu=tmp.querySelector("#dz-ordp-"+p);if(nu)el.replaceWith(nu);
}
function dzLiveUnlock(i){delete S.lv.ord[i];sv();dzLiveSend(i,{t:"unlocked"});dzLiveOrderSection(i);delete dzLiveSent[i];dzLiveSync()}
/* Re-render without jumping the TV back to the top. */
function dzLiveRefresh(){const y=window.scrollY||0;R();try{window.scrollTo(0,y)}catch(e){}}
function dzLiveStatus(){
 const st=document.getElementById("dz-lvstate");if(st)st.innerHTML=S&&S.lobby||dzPeerState==="failed"?dzLiveLinkState():"";
 if(!S)return;
 S.pl.forEach((p,i)=>{const b=document.getElementById("dz-lv-"+i);if(b){b.className="dz-lv"+(dzLiveConnected(i)?" on":"");b.textContent=dzLiveConnected(i)?"📱 connected":"📵 not connected"}});
 if(S.ph==="decide")S.pl.forEach((p,i)=>{const d=document.querySelector("#dz-ordp-"+i+" .dz-live-dot");if(d)d.style.display=dzLiveConnected(i)?"":"none"});
}

/* ---------- hooks into the game ---------- */
const dzStartRoundBase=startRound;
startRound=function(){if(S&&S.lv){S.lv.ord={};S.lv.read={}}dzStartRoundBase()};
const dzRBase=R;
R=function(){
 if(S&&S.mode==="live"&&S.lv)dzLiveStart();else if(dzPeer&&!(S&&S.mode==="live"))dzLiveStop();
 dzRBase();
 if(dzLiveOn()){dzLiveQR();dzLiveSync()}
};
