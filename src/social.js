/* ---------- conversations with characters ---------- */
function topicFeel(id,t){const I=INTERESTS[id];return I.like.includes(t)?1:I.dis.includes(t)?-1:0}
function fill(s,id){return s.replace('{n}',NPCS[id].name).replace('{me}',S.name)}
function topicChoices(id){
  const n=S.npcs[id],all=Object.keys(TOPICS);
  const knownLike=all.filter(t=>n.known[t]===1);
  const pool=all.filter(t=>!knownLike.includes(t));
  const out=[];
  if(knownLike.length)out.push(pick(knownLike));
  while(out.length<3){const t=pick(pool);if(!out.includes(t))out.push(t)}
  return out.sort(()=>Math.random()-.5);
}
function startTalk(id){
  const n=S.npcs[id];n.met=true;
  const g=n.rel>=50?GREET.close:n.rel>=8?GREET.friend:GREET.stranger;
  return {type:'talk',id,lines:[{who:'npc',text:fill(pick(g),id)}],turns:0,choices:topicChoices(id),q:null,done:false,gain:0};
}
function talkTopic(t){
  const T=sheet,id=T.id,n=S.npcs[id],f=topicFeel(id,t),N=NPCS[id];
  const fresh=S.fresh?1.2:1,ch=1+S.skills.charisma*.05;
  T.lines.push({who:'me',text:pick(TOPICS[t].me)});
  const reply=f>0?pick(TOPICS[t].like):f<0?pick(TOPICS[t].meh):pick([...TOPICS[t].like,...TOPICS[t].meh]);
  T.lines.push({who:'npc',text:reply});
  const already=n.known[t]!==undefined;
  if(f!==0)n.known[t]=f;
  if(n.talkDay!==S.day){n.talkDay=S.day;n.talkTurns=0}n.talkTurns++;const tired=n.talkTurns>6?.3:1;
  const d=(f>0?4:f<0?-3:1)*(f>=0?tired:1);rel(id,d*(d>0?fresh*ch:1));T.gain+=d;
  if(f!==0&&!already)T.lines.push({who:'sys',text:f>0?`${N.name} loves talking about ${TOPICS[t].l.toLowerCase()}. ★ Remembered.`:`${N.name} isn't into ${TOPICS[t].l.toLowerCase()}. Noted.`});
  add('social',f>0?7:4);skill('charisma',.06);advance(.25);
  afterTurn();
}
function afterTurn(){
  const T=sheet;T.turns++;
  if(T.turns>=5||S.needs.energy<5){T.lines.push({who:'npc',text:pick(BYE)});T.done=true;T.choices=[];return}
  if(T.turns%2===0&&Math.random()<.65){
    const qs=QUESTIONS.filter(q=>!q.npc||q.npc===T.id);T.q=pick(qs);T.lines.push({who:'npc',text:T.q.q});T.choices=[];return}
  T.choices=topicChoices(T.id);
}
function answerQ(i){
  const T=sheet,q=T.q,[txt,base]=q.a[i];let d=base;if(q.flip&&q.flip===T.id)d=-base;
  T.lines.push({who:'me',text:txt});
  T.lines.push({who:'npc',text:d>=2?pick(['Exactly! You get me.','My person!','I knew I liked you.']):d>0?pick(['Fair enough.','Okay, I hear you.']):pick(['Ehn? We cannot be friends again 😂','Hmm. Interesting choice.'])});
  rel(T.id,d);T.gain+=d;add('social',4);advance(.25);T.q=null;afterTurn();
}
function endTalk(){const T=sheet;if(!T.done)advance(.1);log(`Talked with ${NPCS[T.id].name}. ${T.gain>=8?'Great conversation.':T.gain>0?'Nice chat.':'A bit awkward.'}`,T.gain>=8?'good':'');checkGoals();save();sheet={type:'npc',id:T.id}}

/* WhatsApp messages to characters */
function canText(id){const n=S.npcs[id];if(!n.met||n.rel<8)return 'Get to know them in person first';if(n.msgDay===S.day&&n.msgs>=3)return `${NPCS[id].name} has gone quiet. Try tomorrow`;return false}
function textTopic(id,t){
  const n=S.npcs[id],f=topicFeel(id,t);if(n.msgDay!==S.day){n.msgDay=S.day;n.msgs=0}n.msgs++;
  if(!S.chats[id])S.chats[id]={msgs:[],unread:0};
  const c=S.chats[id],ts=`${DAYS[dow()]} ${hhmm(S.hour)}`;
  c.msgs.push({me:true,text:pick(TOPICS[t].me),t:ts,done:true});
  c.msgs.push({me:false,text:f>0?pick(TOPICS[t].like):f<0?pick(TOPICS[t].meh):pick([...TOPICS[t].like,...TOPICS[t].meh]),t:ts,done:true});
  if(f!==0&&n.known[t]===undefined){n.known[t]=f}
  rel(id,f>0?2:f<0?-2:.5);add('social',3);advance(.1);c.msgs=c.msgs.slice(-30);
}

/* ---------- live chat with real players (ntfy.sh) ---------- */
const LIVE={base:'https://ntfy.sh',prefix:'japalife-q7m2-',es:null,scope:null,msgs:[],people:{},ok:null,last:0,timer:null};
const BAD=['fuck','shit','cunt','bitch','nigga','nigger','whore','slut','dick','pussy','bastard','wanker','twat','faggot','retard'];
function clean(s){let t=String(s).slice(0,200);BAD.forEach(w=>{t=t.replace(new RegExp(w,'gi'),'*'.repeat(w.length))});return t}
function liveTopic(scope){return LIVE.prefix+S.city+'-'+scope}
function safeLook(l){l=l||{};return {skin:Number.isInteger(l.skin)&&l.skin>=0&&l.skin<5?l.skin:2,hair:HAIRS.some(h=>h[0]===l.hair)?l.hair:'lowcut',fabric:FABRICS.some(f=>f.id===l.fabric)?l.fabric:'green'}}
function liveWanted(){if(!S||!S.flags.liveOK)return null;if(sheet?.type==='phone'&&sheet.app==='live')return 'all';return S.at!=='home'?S.at:null}
function liveSync(){const w=liveWanted();if(w===LIVE.scope)return;liveLeave();if(w)liveJoin(w)}
function liveJoin(scope){
  LIVE.scope=scope;LIVE.msgs=[];LIVE.people={};
  if(typeof EventSource==='undefined'){LIVE.ok=false;return}
  try{
    const es=new EventSource(`${LIVE.base}/${liveTopic(scope)}/sse?since=45m`);LIVE.es=es;
    es.onopen=()=>{LIVE.ok=true;livePresence();liveRefresh()};
    es.onmessage=ev=>{try{const d=JSON.parse(ev.data);if(d.event!=='message')return;livePush(JSON.parse(d.message),d.time*1000)}catch(e){}};
    es.onerror=()=>{if(LIVE.ok!==true){LIVE.ok=false;liveLeave(true);liveRefresh()}};
  }catch(e){LIVE.ok=false}
  LIVE.timer=setInterval(()=>{if(!document.hidden)livePresence()},90000);
}
function liveLeave(keepScope){if(LIVE.es){LIVE.es.close();LIVE.es=null}clearInterval(LIVE.timer);if(!keepScope)LIVE.scope=null}
function livePush(m,time){
  if(!m||typeof m.pid!=='string'||typeof m.name!=='string')return;
  const name=clean(m.name).slice(0,16);
  const p=LIVE.people[m.pid]=LIVE.people[m.pid]||{};Object.assign(p,{name,look:safeLook(m.look),seen:Math.max(p.seen||0,time)});
  if(m.t==='msg'&&typeof m.text==='string'){LIVE.msgs.push({pid:m.pid,name,text:clean(m.text),time});LIVE.msgs=LIVE.msgs.slice(-40)}
  liveRefresh();
}
function livePost(body){return fetch(`${LIVE.base}/${liveTopic(LIVE.scope)}`,{method:'POST',body:JSON.stringify(body)})}
function livePresence(){if(LIVE.ok&&LIVE.scope)livePost({t:'here',pid:S.pid,name:S.name,look:S.look}).catch(()=>{})}
function liveSend(text){
  text=text.trim();if(!text)return;
  if(Date.now()-LIVE.last<3000){toast('Slow down a little.');return}
  LIVE.last=Date.now();
  livePost({t:'msg',pid:S.pid,name:S.name,look:S.look,text:clean(text)}).then(r=>{if(!r.ok)toast('Message not sent. Try again in a moment.');else{S.flags.liveChatted=true;checkGoals();save()}}).catch(()=>toast('Message not sent. Check your connection.'));
}
function livePeople(){const now=Date.now();return Object.entries(LIVE.people).filter(([pid,p])=>pid!==S.pid&&!S.muted[pid]&&now-p.seen<6*60000).map(([pid,p])=>({pid,...p}))}
function liveBox(){
  const where=LIVE.scope==='all'?`everyone in ${CITIES[S.city].name}`:'people here';
  if(!S.flags.liveOK)return `<div class="card live"><h2>Live chat</h2><p class="lmeta">Chat with real players who are in the same place as you.</p><button class="act go" data-live-consent><span class="main"><span class="lbl">Join live chat</span><span class="sub">18+ only. Messages are public</span></span></button></div>`;
  if(LIVE.ok===false)return `<div class="card live"><h2>Live chat</h2><p class="lmeta">Live chat isn't available here. It works in the installed app (your game link), when you're online.</p></div>`;
  const ppl=livePeople();
  const msgs=LIVE.msgs.filter(m=>!S.muted[m.pid]);
  return `<div class="card live"><h2>Live chat · ${where}</h2>
    <div class="lmeta">${LIVE.ok?`${ppl.length} other player${ppl.length===1?'':'s'} online`:'Connecting…'}</div>
    ${ppl.length?`<div class="people">${ppl.map(p=>`<button class="person" data-liveperson="${p.pid}"><img class="face" src="${faceURL(p.look)}" alt=""><span>${esc(p.name)}<small>Player · online</small></span></button>`).join('')}</div>`:''}
    <div class="lmsgs" id="lmsgs">${msgs.length?msgs.map(m=>`<div class="lmsg ${m.pid===S.pid?'me':''}"><b>${esc(m.pid===S.pid?'You':m.name)}</b> ${esc(m.text)}</div>`).join(''):'<div class="lmeta">No messages yet. Say hello!</div>'}</div>
    <form class="lform" data-liveform><input id="livein" maxlength="200" placeholder="Message ${esc(where)}" autocomplete="off"><button class="go" type="submit">Send</button></form>
    <div class="lmeta">Be kind. Never share your address, phone number or bank details. Tap a player to mute them.</div></div>`;
}
function liveRefresh(){
  const el=document.getElementById('livewrap');
  if(el){const inp=document.getElementById('livein');const v=inp?inp.value:'';const foc=document.activeElement===inp;el.innerHTML=liveBox();const ni=document.getElementById('livein');if(ni){ni.value=v;if(foc)ni.focus()}const lm=document.getElementById('lmsgs');if(lm)lm.scrollTop=lm.scrollHeight}
  const pa=document.getElementById('phonelive');if(pa)pa.innerHTML=liveBox();
}
