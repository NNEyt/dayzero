/* Day Zero 2.4: presentation-only integration; preserve the existing story and game rules. */
(function(){
 const oldTitle=title,oldGo=go,oldStart=start,oldTeam=vTeam,oldBrief=vBrief,oldCouncil=vCouncil,oldContinue=cont,oldRender=R;
 title=function(){
  let h=oldTitle();
  h=h.replace("1–4 players · about 75 minutes · choose your TV setup.","1–4 players · about 75 minutes · play on a shared TV, with optional private briefings on phones.");
  const original='<div class="c"><button class="btn" onclick="go()">Start</button>';
  const selection='<div class="sec">📺 Choose how to play</div>'+
   '<label class="dz24-mode-select">Play setup<select id="dz24-play-mode">'+
   '<option value="tv">TV only · role information is shared</option>'+
   '<option value="phones">TV + phones · private role briefings</option></select></label>'+
   '<p class="s">TV only: the group reads each role’s cards together. TV + phones: each player scans a QR code every round. No app or account; the TV manages all group decisions.</p>';
  return h.replace(original,selection+original);
 };
 go=function(){
  const names=[0,1,2,3].map(i=>document.getElementById("n"+i).value.trim()).filter(Boolean);
  if(!names.length)names.push("Player 1");
  const m=document.getElementById("dz24-play-mode");
  start(names,m?m.value:"tv");
 };
 start=function(names,mode){
  oldStart(names);
  S.mode=mode==="phones"?"phones":"tv";sv();R();
 };
 cont=function(){oldContinue();if(!S.mode){S.mode="tv";sv();R()}};
 vTeam=function(){
  return oldTeam().replace("Each role receives different information each round. Cooperate by sharing what you learn.",
   dz24Mode()==="phones"?"Each role receives different information on their player’s phone. Share it with your teammates at the council.":"Each role receives different information. In TV-only mode you read the role briefings together before deciding what to do.");
 };
 vBrief=function(){
  return oldBrief().replace("Then deal private information cards.","Then open the role briefings.").replace("Deal private cards","Open role briefings");
 };
 vPass=function(){return S.ph==="intel"?dz24Briefing():dz24Orders()};
 vCouncil=function(){
  return oldCouncil().replace("Go to secret orders","Choose team actions");
 };
 R=function(){
  oldRender();
  if(S&&S.ph==="intel"&&dz24Mode()==="phones")dz24QR();
 };
 R();
})();
