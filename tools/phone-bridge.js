// Injected in Playwright when the box's Chrome policy blocks WebRTC networking:
// replaces PeerJS's transport with a relay through the test runner, so the real TV page and the
// real play.html run in separate browser contexts and exchange exactly the messages they would over a data channel.
(()=>{
 const H={};let seq=0;const conns={};
 class Em{constructor(){this._h={}}on(e,f){(this._h[e]=this._h[e]||[]).push(f);return this}_emit(e,...a){(this._h[e]||[]).slice().forEach(f=>{try{f(...a)}catch(x){console.error(x)}})}}
 class Conn extends Em{constructor(cid,peer,remote){super();this.cid=cid;this.peer=remote;this._me=peer;this.open=false;conns[cid]=this}
  send(d){if(this.open)window.__relay(JSON.stringify({k:"data",cid:this.cid,to:this.peer,from:this._me.id,d}))}
  close(){if(!this.open)return;this.open=false;window.__relay(JSON.stringify({k:"close",cid:this.cid,to:this.peer}));this._emit("close")}}
 class FakePeer extends Em{constructor(id,opts){super();if(typeof id!=="string"){id="ph-"+Math.random().toString(36).slice(2,10)}this.id=id;this.open=false;this.destroyed=false;H.self=this;
   setTimeout(()=>{window.__relay(JSON.stringify({k:"register",id}));this.open=true;this._emit("open",id)},200)}
  connect(to){const cid=this.id+"-"+(++seq);const c=new Conn(cid,this,to);window.__relay(JSON.stringify({k:"connect",cid,to,from:this.id}));return c}
  destroy(){this.destroyed=true;this.open=false;Object.values(conns).forEach(c=>c.close())}
  reconnect(){}disconnect(){}}
 window.__deliver=s=>{const m=JSON.parse(s),me=H.self;if(!me||me.destroyed)return;
  if(m.k==="connect"){const c=new Conn(m.cid,me,m.from);c.open=true;me._emit("connection",c);setTimeout(()=>{c._emit("open");window.__relay(JSON.stringify({k:"accepted",cid:m.cid,to:m.from}))},50)}
  else if(m.k==="accepted"){const c=conns[m.cid];if(c){c.open=true;c._emit("open")}}
  else if(m.k==="unknown"){me._emit("error",{type:"peer-unavailable"})}
  else if(m.k==="data"){const c=conns[m.cid];if(c&&c.open)c._emit("data",m.d)}
  else if(m.k==="close"){const c=conns[m.cid];if(c&&c.open){c.open=false;c._emit("close")}}};
 Object.defineProperty(window,"Peer",{configurable:true,get(){return FakePeer},set(){}});
 window.__DZ_BRIDGE=true;
})();
