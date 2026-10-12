/* ---------- UI ---------- */
const $=id=>document.getElementById(id);
let sheet=null,toastT=null,busy=false,faceCache={};
const esc=s=>String(s).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
function toast(m){const t=$('toast');t.textContent=m;t.hidden=false;clearTimeout(toastT);toastT=setTimeout(()=>t.hidden=true,2600)}
function save(){try{localStorage.setItem(KEY,JSON.stringify(S))}catch(e){}}
function face(id){const look=lookOf(id);const k=id+JSON.stringify(look);if(!faceCache[k])faceCache[k]=faceURL(look);return faceCache[k]}
function meter(label,v,inv){const good=inv?100-v:v,col=good>50?'var(--green)':good>25?'var(--danfo)':'var(--clay)';
  return `<div class="need ${good<=25?'bad':''}"><div class="row"><span>${label}</span><span>${Math.round(v)}</span></div><div class="bar"><i style="width:${clamp(v)}%;background:${col}"></i></div></div>`}
function moodLine(){
  const n=S.needs;
  if(S.sponsorless)return "I have days to find a sponsor. I can't sleep.";
  if(n.bladder<15)return 'Where is the toilet? Quick!';
  if(n.energy<20)return 'My body no be firewood.';
  if(n.hunger<20)return 'Belle dey make noise.';
  if(S.homesick>75)return 'I miss home. I even miss the generator noise.';
  if(S.pressure>75)return 'Mummy has called six times today.';
  if(n.hygiene<20)return 'I need to baff, seriously.';
  if(n.social<20)return 'Nobody has checked on me in days.';
  if(n.fun<20)return 'This UK life is too quiet, abeg.';
  if(S.money<60)return 'Sapa is close. I can feel it.';
  return ['We dey kampe.','Steady, steady.','God is good, the bills are paid.','No shaking.'][S.day%4];
}

function render(){
  if(!S){$('app').hidden=true;$('nav').hidden=true;showCreator();return}
  $('app').hidden=false;$('nav').hidden=false;readColors();
  const v=here();
  $('top').innerHTML=`<div class="brand">Japa <span>Life</span></div><div class="chips"><span class="chip">${DAYS[dow()]} · Day ${S.day}</span><span class="chip">${hhmm(S.hour)}</span><span class="chip">${S.weather}</span><span class="chip money ${S.money<0?'neg':''}">${gbp(S.money)}</span></div>`;
  const cr=crowd(v);$('loc').innerHTML=`<span>${esc(v.name)}</span>${cr?`<span>${cr}</span>`:''}${v.type!=='home'&&!isOpen(v.type)?'<span class="closed">Closed</span>':''}${v.type==='home'&&S.meterOff?'<span class="closed">Meter empty</span>':''}`;
  $('say').innerHTML=`<div style="min-width:0"><div class="who">${esc(S.name)} · ${esc(jobTitle())}</div><b>"${moodLine()}"</b></div>`;
  const n=S.needs;
  $('needs').innerHTML=meter('Belle',n.hunger)+meter('Energy',n.energy)+meter('Freshness',n.hygiene)+meter('Bladder',n.bladder)+meter('Enjoyment',n.fun)+meter('Gist',n.social)+meter('Homesick',S.homesick,true)+meter('Home pressure',S.pressure,true);
  // people
  const ppl=peopleAt(v);
  $('peoplewrap').innerHTML=ppl.length?`<div class="sect" style="margin-bottom:6px">People here</div><div class="people">${ppl.map(id=>`<button class="person" data-npc="${id}"><img class="face" src="${face(id)}" alt=""><span>${NPCS[id].name}<small>${relLabel(id)}</small></span></button>`).join('')}</div>`:'';
  // actions
  const acts=ACTS.filter(a=>{const at=Array.isArray(a.at)?a.at:[a.at];return at.includes(v.type)}).concat(gigActs());
  const rows=acts.filter(a=>v.type==='home'||isOpen(v.type)||a.id==='vloo'&&false).map(actRow);
  let html='';
  if(v.type==='home'){ensureItems();const n=S.items.length+S.store.length+S.acc.length;html+=`<div class="row2"><button class="act go" data-buy><span class="main"><span class="lbl">Buy furniture</span><span class="sub">${n} items · ${'★'.repeat(homeStars())}${'☆'.repeat(5-homeStars())}</span></span></button><button class="act ${DEC.on?'go':''}" data-decorate><span class="main"><span class="lbl">${DEC.on?'Done decorating':'Decorate'}</span><span class="sub">${DEC.on?'Tap an item, then move it':'Move, turn, store or sell'}</span></span></button></div>${DEC.on?decPanel():''}`}
  else html+=`<button class="act" data-gohome><span class="main"><span class="lbl">Go home</span><span class="sub">${travelOptions('home').map(o=>`${o.label} ${o.cost?gbp2(o.cost):'free'}`).join(' · ')}</span></span><span class="meta"><b>Home</b></span></button>`;
  if(v.type!=='home'&&!isOpen(v.type))html+=`<div class="card" style="padding:12px 14px;font-size:13.5px"><b>Closed right now.</b> ${hoursText(v.type)}</div>`;
  const gigRows=rows.filter(r=>r.includes('data-act="gig-'));html+=gigRows.join('')+rows.filter(r=>!r.includes('data-act="gig-')).join('');
  if(v.type!=='home')html+=`<button class="act" data-map><span class="main"><span class="lbl">Go somewhere else</span><span class="sub">Open the map</span></span><span class="meta"><b>Map</b></span></button>`;
  $('acts').innerHTML=html;
  const lw=$('livewrap');if(lw){lw.hidden=v.type==='home';if(v.type!=='home')lw.innerHTML=liveBox()}
  liveSync();
  $('feed').innerHTML=S.log.map(l=>`<li><time>${l.t}</time><span class="${l.tone}">${esc(l.msg)}</span></li>`).join('')||'<li>Your story starts now.</li>';
  const u=unread();$('pbadge').hidden=!u;$('pbadge').textContent=u;
  document.querySelectorAll('[data-nav]').forEach(b=>b.classList.toggle('on',(b.dataset.nav==='home'&&!sheet)||b.dataset.nav===sheet?.type));
  $('app').classList.toggle('busy',busy);
  renderSheet();renderModal();
}
function actRow(a){
  const why=a.cond&&a.cond();const cost=val(a.cost)||0;const poor=cost&&S.money<cost;const off=why||poor;
  const h=val(a.h);const dur=h>=24?`${Math.round(h/24)}d`:h>=1?`${+h.toFixed(1)}h`:`${Math.round(h*60)}m`;
  const right=a.menu?'<b>Menu</b>':a.invite?'<b>Invite</b>':a.earn?`<b class="plus">+${gbp(a.earn())}</b>`:cost?`<b>${gbp2(cost)}</b>`:'<b>Free</b>';
  return `<button class="act ${off?'off':''} ${a.menu?'go':''}" data-act="${a.id}"><span class="main"><span class="lbl">${esc(val(a.label))}</span><span class="sub">${esc(why||(poor?'Not enough money':val(a.sub)||''))}</span></span><span class="meta">${right}${a.menu||a.invite?'':dur}</span></button>`;
}
function doAct(id){
  if(busy||S.over||S.queue.length)return;if(DEC.on){DEC.on=false;DEC.sel=null}
  const a=ACTS.concat(gigActs()).find(x=>x.id===id);if(!a)return;if(a.books){openSheet({type:'phone',app:'biz'});return}const why=a.cond&&a.cond();if(why){toast(why);return}
  if(a.menu){openSheet({type:'menu'});return}
  if(a.invite){openSheet({type:'invite',pick:[]});return}
  const cost=val(a.cost)||0;if(cost&&S.money<cost){toast(`You need ${gbp2(cost)}. Sapa is real.`);return}
  const go=()=>{
    if(cost)spend(cost,val(a.label));
    advance(val(a.h),{sleep:a.sleep,away:a.away});
    if(!S.over){log(a.run(),a.earn?'good':'');
      if(S.needs.energy<=0){log('You passed out from tiredness and slept for 6 hours.','bad');advance(6,{sleep:true})}}
    anim.tvOn=false;anim.bbq=false;checkGoals();save();busy=false;render();
  };
  busy=true;anim.emote=a.emote||'✨';anim.emoteUntil=performance.now()+(reduceMotion?400:900);
  if(here().type==='home'){
    const item=val(a.item);const sp=a.spot;
    const spot=item?spotForTag(item):sp==='loo'?spotForTag('toilet'):sp==='shower'?spotForTag('bath'):sp==='washer'?spotForTag('washer'):sp==='door'?doorPos():idleSpot();
    anim.path=cellPath([anim.x,anim.y],spot);anim.tx=spot[0];anim.ty=spot[1];if(a.tv)anim.tvOn=true;if(a.id==='bbqparty')anim.bbq=true;
    anim.onArrive=()=>{anim.emoteUntil=performance.now()+700;setTimeout(go,reduceMotion?50:650)};
  }else setTimeout(go,reduceMotion?50:650);
  $('app').classList.add('busy');
}

/* ---------- sheets ---------- */
function openSheet(s){sheet=s;render()}
function closeSheet(){sheet=null;render()}
function renderSheet(){
  const el=$('sheet');
  if(lmap&&(!sheet||sheet.type!=='map'||!sheet.real)){lmap.remove();lmap=null}
  if(!sheet){el.innerHTML='';return}
  if(sheet.type==='map'&&((sheet.real&&lmap&&$('lmap'))||(!sheet.real&&$('citycv')&&CM&&CM.city===S.city))){const vi=$('vinfo');if(vi&&!CMV.trip)vi.innerHTML=mapInfo();return}
  let body='',cls='panel';
  if(['restart','liveok','liveperson','bizsell','movehome'].includes(sheet.type)){el.innerHTML='';return}
  if(sheet.type==='map')body=mapSheet();
  if(sheet.type==='phone'){cls='panel phone';body=phoneSheet()}
  if(sheet.type==='me')body=meSheet();
  if(sheet.type==='buy')body=buySheet();
  if(sheet.type==='npc')body=npcSheet();
  if(sheet.type==='menu')body=menuSheet();
  if(sheet.type==='invite')body=inviteSheet();
  if(sheet.type==='talk')body=talkSheet();
  el.innerHTML=`<div class="scrim" data-close-sheet><div class="${cls}" role="dialog" aria-modal="true">${body}</div></div>`;
  if(sheet.type==='map'&&sheet.real&&useLeaflet())initLeaflet();
  if(sheet.type==='map'&&!sheet.real)initCity();
  if(sheet.type==='me'){const c=el.querySelector('#meav');if(c)drawAvatar(c,S.look,1.5)}
  if(sheet.type==='npc'){const c=el.querySelector('#npcav');if(c)drawAvatar(c,lookOf(sheet.id),1.5)}
  if(sheet.type==='talk'){const b=el.querySelector('.talklog');if(b)b.scrollTop=b.scrollHeight}
}
const hd=(t,sub='')=>`<div class="hd"><div><h3>${t}</h3>${sub?`<div style="font-size:13px;opacity:.75">${sub}</div>`:''}</div><button class="x" data-x aria-label="Close">×</button></div>`;

const CATCOL={work:'#2B5BA8',food:'#C24E36',shop:'#C9921B',social:'#7A3FA0',learn:'#0E7C86',home:'#08774C',travel:'#475569'};
let lmap=null,lmarks={},lHere=null,lTiles=null,lOK=null;
const useLeaflet=()=>typeof L!=='undefined'&&lOK!==false;
function shortName(v){return v.type==='home'?'Home':v.type==='restaurant'||v.type==='fine'?v.name:VT[v.type].label}
function mapInfo(){
  const sel=sheet.sel?venue(sheet.sel):null;
  if(!sel)return '<div class="vinfo"><div class="meta">Tap a place to see opening hours and how to get there. Pinch to zoom.</div></div>';
  const open=isOpen(sel.type),ppl=peopleAt(sel).filter(()=>open);
  const opts=sel.id===S.at?[]:travelOptions(sel.id);
  return `<div class="vinfo"><div class="nm">${esc(sel.name)}</div><div class="meta">${sel.dish?esc(sel.area)+' · '+esc(sel.dish)+' · about '+gbp(price(sel.cost))+' · ':''}${hoursText(sel.type)} · <b style="color:${open?'var(--green)':'var(--clay)'}">${open?'Open now':'Closed now'}</b>${opts[0]?.km!==undefined?` · ${opts[0].km} km away`:''}${ppl.length?' · '+ppl.map(id=>NPCS[id].name).join(', ')+' might be there':''}</div>
    ${sel.id===S.at?'<div class="meta"><b>You are here.</b></div>':`<div class="row2">${opts.map(o=>`<button class="act ${S.money<o.cost?'off':''}" data-travel="${sel.id}" data-mode="${o.id}"><span class="main"><span class="lbl">${o.label}</span><span class="sub">${Math.round(o.h*60)} min</span></span><span class="meta"><b>${o.cost?gbp2(o.cost):'Free'}</b></span></button>`).join('')}</div>`}</div>`;
}
function tripsList(){const c=CITIES[S.city];if(c.london)return '';return `<div class="sect">Day trips to London</div><div class="people">${venues().filter(v=>v.trip).map(v=>`<button class="person" data-pin="${v.id}" style="padding-left:12px"><span>${esc(v.name)}<small>${gbp(v.cost)} · train £35 each way</small></span></button>`).join('')}</div>`}
function mapSheet(){
  const c=CITIES[S.city];
  const legend=`<div class="legend">${[['home','Home'],['work','Work'],['food','Food'],['shop','Shops'],['social','Social'],['learn','Study'],['travel','Travel']].map(([k,l])=>`<span><i style="background:${CATCOL[k]}"></i>${l}</span>`).join('')}</div>`;
  if(sheet.real&&useLeaflet())return hd(c.name,`Real map · ${hhmm(S.hour)} · ${DAYS[dow()]}`)+`<div class="mapbox leafbox" id="lmap"></div><div class="mapctl2"><button class="opt" data-mreal="0">Back to city view</button></div>${legend}${tripsList()}<div id="vinfo">${mapInfo()}</div>`;
  return hd(c.name,`${hhmm(S.hour)} · ${DAYS[dow()]} · ${S.weather}`)+`<div class="citybox"><canvas id="citycv" aria-label="City map of ${c.name}. Drag to move, pinch to zoom, tap a building."></canvas><div class="mapctl"><button data-mz="1" aria-label="Zoom in">+</button><button data-mz="-1" aria-label="Zoom out">−</button><button data-mme aria-label="Find me">◎</button></div></div><div class="mapctl2"><span class="lmeta">Drag to explore · tap a building</span>${typeof L!=='undefined'&&lOK!==false?'<button class="opt" data-mreal="1">Real map</button>':''}</div>${tripsList()}<div id="vinfo">${mapInfo()}</div>`;
}
function initLeaflet(){
  const el=$('lmap');if(!el)return;
  if(lmap){lmap.remove();lmap=null}
  lmarks={};
  const dark=matchMedia('(prefers-color-scheme: dark)').matches&&document.documentElement.dataset.theme!=='light'||document.documentElement.dataset.theme==='dark';
  lmap=L.map(el,{zoomControl:true,attributionControl:true,tap:true});
  lTiles=L.tileLayer(`https://{s}.basemaps.cartocdn.com/rastertiles/${dark?'dark_all':'voyager'}/{z}/{x}/{y}{r}.png`,{maxZoom:18,subdomains:'abcd',attribution:'© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors © <a href="https://carto.com/attributions">CARTO</a>'}).addTo(lmap);
  let loaded=false,errs=0;lTiles.on('tileload',()=>{loaded=true;lOK=true});lTiles.on('tileerror',()=>{if(++errs>=4&&!loaded&&lmap&&lOK!==true){lOK=false;lmap.remove();lmap=null;renderSheet()}});
  if(lOK!==true)setTimeout(()=>{if(!loaded&&sheet?.type==='map'){lOK=false;lmap.remove();lmap=null;renderSheet()}},4000);
  const vs=venues().filter(v=>!v.trip);
  vs.forEach(v=>{const cat=VT[v.type].cat;
    const m=L.circleMarker(v.ll,{radius:v.type==='home'?11:8,color:'#fff',weight:2.5,fillColor:CATCOL[cat],fillOpacity:isOpen(v.type)?1:.45}).addTo(lmap);
    m.bindTooltip(esc(shortName(v)),{direction:'top',offset:[0,-8],permanent:v.type==='home'||v.id===sheet.sel,className:'jl-tip'});
    m.on('click',()=>selectPin(v.id));lmarks[v.id]=m});
  const cur=here();if(!cur.trip)lHere=L.circleMarker(cur.ll,{radius:17,color:'#18221E',weight:2,dashArray:'4 4',fill:false,interactive:false}).addTo(lmap);
  const b=L.latLngBounds(vs.filter(v=>v.type!=='airport'&&v.type!=='test').map(v=>v.ll));
  lmap.fitBounds(b,{padding:[18,18]});
  if(sheet.sel&&lmarks[sheet.sel])lmap.panTo(lmarks[sheet.sel].getLatLng());
  setTimeout(()=>lmap&&lmap.invalidateSize(),60);
}
function selectPin(id){
  const prev=sheet.sel;sheet.sel=id;
  if(lmap){[prev,id].forEach(k=>{const m=lmarks[k];if(!m)return;const v=venue(k);m.unbindTooltip();m.bindTooltip(esc(shortName(v)),{direction:'top',offset:[0,-8],permanent:v.type==='home'||k===id,className:'jl-tip'});m.setStyle({color:k===id?'#18221E':'#fff',weight:k===id?3.5:2.5})});
    if(lmarks[id])lmap.panTo(lmarks[id].getLatLng());const vi=$('vinfo');if(vi)vi.innerHTML=mapInfo();}
  else if(sheet.type==='map'&&!sheet.real&&CMV.cv){const vi=$('vinfo');if(vi)vi.innerHTML=mapInfo();if(id)cyCentreOn(id)}
  else render();
}
function svgMapSheet(){
  const c=CITIES[S.city],vs=venues(),sel=sheet.sel?venue(sheet.sel):null;
  const pins=vs.map(v=>{const cat=VT[v.type].cat,open=isOpen(v.type);const short=v.type==='home'?'Home':v.type==='restaurant'||v.type==='fine'?v.name:VT[v.type].label;
    return `<g class="m-pin ${open?'':'closed'} ${sheet.sel===v.id?'sel':''}" data-pin="${v.id}" tabindex="0" role="button" aria-label="${esc(v.name)}"><circle cx="${v.x}" cy="${v.y}" r="${v.type==='home'?11:8.5}" class="c-${cat}"/>${S.at===v.id?`<circle cx="${v.x}" cy="${v.y}" r="15" fill="none" stroke="var(--ink)" stroke-width="2" stroke-dasharray="3 3"/>`:''}<text x="${v.x}" y="${v.y+19}" text-anchor="middle">${esc(short.length>16?short.slice(0,15)+'…':short)}</text></g>`}).join('');
  const svg=`<svg viewBox="0 0 360 430" role="img" aria-label="Map of ${c.name}"><rect class="m-land" width="360" height="430"/>
    ${c.parks.map(([x,y,w,h])=>`<ellipse class="m-park" cx="${x}" cy="${y}" rx="${w}" ry="${h}"/>`).join('')}
    <path class="m-road" d="M0 250 H360 M180 0 V430 M0 80 L360 360 M40 430 L320 0"/>
    <path class="m-water" d="${c.river}"/>
    ${!c.london?'<text x="300" y="12" style="font:800 9px Figtree,sans-serif;fill:var(--muted)">LONDON BY TRAIN →</text>':''}
    ${pins}</svg>`;
  return hd(`${c.name}`,`${hhmm(S.hour)} · ${DAYS[dow()]}`)+`<div class="mapbox">${svg}</div><div class="legend">${[['home','Home'],['work','Work'],['food','Food'],['shop','Shops'],['social','Social'],['learn','Study'],['travel','Travel']].map(([k,l])=>`<span><i style="background:${CATCOL[k]}"></i>${l}</span>`).join('')}</div>`;
}

function menuSheet(){
  const v=here(),items=menuOf(v);
  return hd(esc(v.name),v.type==='fine'?'Tasting menu':'Menu')+`<div class="acts">${items.map(k=>{const D=DISHES[k],p=dishPrice(k,v),tried=S.dishes[k];return `<button class="act ${S.money<p?'off':''}" data-dish="${k}"><span class="main"><span class="lbl">${D.n}${tried?' ✓':''}</span><span class="sub">${D.drink?'Drink':D.h>=50?'Big plate':'Light bite'}${tried?` · had it ${tried}×`:' · not tried yet'}</span></span><span class="meta"><b>${gbp2(p)}</b>${D.drink?'15m':v.type==='fine'?'3h':'1h'}</span></button>`}).join('')}</div>${peopleAt(v).length?`<div style="font-size:13px;color:var(--muted)">Eating with ${peopleAt(v).map(id=>NPCS[id].name).join(', ')} makes you closer.</div>`:''}`;
}
function inviteSheet(){
  const f=friendsFree();
  return hd('Invite friends',`To ${esc(here().name)}`)+`<div style="font-size:13.5px;color:var(--muted)">Pick up to 3. Closer friends are more likely to come.</div><div style="display:grid;gap:6px">${f.map(id=>`<button class="person ${sheet.pick.includes(id)?'on':''}" data-inv="${id}" style="border-radius:12px;justify-content:flex-start"><img class="face" src="${face(id)}" alt=""><span style="flex:1;text-align:left">${NPCS[id].name}<small>${relLabel(id)}</small></span>${sheet.pick.includes(id)?'<b style="color:var(--green)">✓</b>':''}</button>`).join('')}</div><button class="go" data-invite-go ${sheet.pick.length?'':'disabled'}>Send invites</button>`;
}
function talkSheet(){
  const T=sheet,N=NPCS[T.id],n=S.npcs[T.id];
  const lines=T.lines.map(l=>l.who==='sys'?`<div class="tsys">${esc(l.text)}</div>`:`<div class="bub2 ${l.who==='me'?'me':''}">${esc(l.text)}</div>`).join('');
  let ctl='';
  if(T.q)ctl=T.q.a.map((a,i)=>`<button class="choice" data-q="${i}">${esc(a[0])}</button>`).join('');
  else if(!T.done)ctl=T.choices.map(t=>`<button class="choice" data-topic="${t}">${n.known[t]===1?'★ ':''}${TOPICS[t].l}<small>"${esc(TOPICS[t].me[0])}"</small></button>`).join('')+`<button class="ghost" data-endtalk>Say goodbye</button>`;
  else ctl=`<button class="go" data-endtalk>Done</button>`;
  return `<div class="hd"><div style="display:flex;gap:10px;align-items:center"><img class="face" src="${face(T.id)}" alt="" style="width:40px;height:40px;border-radius:50%"><div><h3>${N.name}</h3><div style="font-size:12.5px;color:var(--muted)">${relLabel(T.id)} · ${Math.round(n.rel)}</div></div></div></div><div class="talklog">${lines}</div><div style="display:grid;gap:8px">${ctl}</div>`;
}

/* phone */
function phoneSheet(){
  const app=sheet.app;
  if(!app){
    const u=unread();
    const apps=[['wa','WhatsApp','#25A866','W',u],['bank','Bank','#2B3A8C','£'],['remit','Send home','#C24E36','₦'],['jobs','Jobs','#C9921B','J'],['gigs','Gigs','#B3261E','G',S.gigs?S.gigs.acc.length:0],['biz','Business','#C9921B','₿'],['homes','Homes','#2B5BA8','⌂'],['live','Live chat','#0E7C86','●'],['rich','Rich list','#6A2C91','#'],['goals','Goals','#08774C','✓']];
    return hd(hhmm(S.hour),`${DAYS[dow()]}, Day ${S.day} · ${S.weather}`)+`<div class="apps">${apps.map(([id,l,c,g,b])=>`<button class="app" data-app="${id}"><i style="background:${c}">${g}</i>${l}${b?`<span class="badge">${b}</span>`:''}</button>`).join('')}</div>`;
  }
  const back=`<button class="pbtn" data-app="" style="align-self:flex-start;padding:6px 12px">← Home screen</button>`;
  if(app==='wa'){
    if(sheet.thread){const th=sheet.thread;if(!S.chats[th])S.chats[th]={msgs:[],unread:0};const c=S.chats[th];c.unread=0;const pend=c.msgs.find(m=>m.key&&!m.done);
      const npc=NPCS[th];const why=npc&&canText(th);
      return hd(esc(threadName(th)),'WhatsApp')+`<button class="pbtn" data-thread="" style="align-self:flex-start;padding:6px 12px">← Chats</button><div class="bubbles">${c.msgs.map(m=>`<div class="bub ${m.me?'me':''}">${esc(m.text)}<time>${m.t}</time></div>`).join('')||'<div style="opacity:.7;font-size:13px">No messages yet.</div>'}</div>${pend?`<div style="display:grid;gap:8px">${WA[pend.key].opts.map((o,i)=>`<button class="pbtn g" data-reply="${i}">${esc(o)}</button>`).join('')}</div>`:''}${npc&&!pend?(why?`<div style="font-size:13px;opacity:.75">${esc(why)}</div>`:`<div style="font-size:12px;opacity:.7;text-transform:uppercase;letter-spacing:.08em;font-weight:800">Send a message about…</div><div class="apps" style="grid-template-columns:repeat(2,1fr);gap:8px">${topicChoices(th).map(t=>`<button class="pbtn" data-text="${t}">${S.npcs[th].known[t]===1?'★ ':''}${TOPICS[t].l}</button>`).join('')}</div>`):''}`}
    const ids=[...new Set([...Object.keys(S.chats),...Object.keys(S.npcs).filter(id=>S.npcs[id].met&&S.npcs[id].rel>=8)])].sort((a,b)=>(S.chats[b]?.unread||0)-(S.chats[a]?.unread||0));
    return hd('WhatsApp')+back+(ids.length?`<div class="threads">${ids.map(id=>{const c=S.chats[id]||{msgs:[],unread:0},last=c.msgs[c.msgs.length-1];const col=THREADS[id]?.col;return `<button class="thread" data-thread="${id}">${col?`<span class="av" style="background:${col}">${threadName(id)[0]}</span>`:`<img class="av" src="${face(id)}" alt="">`}<span class="tx"><b>${esc(threadName(id))}</b><span>${esc(last?.text||'')}</span></span>${c.unread?`<span class="n">${c.unread}</span>`:''}</button>`}).join('')}</div>`:'<div class="pcard">No messages yet. Family will text soon, trust.</div>');
  }
  if(app==='bank'){
    return hd('Bank')+back+`<div class="pcard"><span class="lbl">Current account</span><span class="big">${gbp2(S.money)}</span><span style="font-size:13px;opacity:.8">Net worth ${gbp(worth())}${S.debt?` · Owed to Uncle Femi ${gbp(S.debt)}`:''}${S.loan?` · Quick loan ${gbp(S.loan)}`:''}</span></div>
      ${S.debt>0?`<button class="pbtn" data-bank="uncle" ${S.money<Math.min(500,S.debt)?'disabled':''}>Pay Uncle Femi ${gbp(Math.min(500,S.debt))} now</button>`:''}
      ${S.loan>0?`<button class="pbtn" data-bank="loan" ${S.money<S.loan?'disabled':''}>Clear quick loan (${gbp(S.loan)})</button>`:`<button class="pbtn" data-bank="take">Quick loan: get £500, repay £600 over 4 weeks</button>`}
      <div class="pcard"><span class="lbl">Recent activity</span><ul class="txs">${S.tx.slice(0,12).map(t=>`<li><span>${esc(t.label)}<br><small style="opacity:.6">${t.t}</small></span><b style="color:${t.a<0?'#FF9C86':'#7CE0A8'}">${t.a<0?'-':'+'}${gbp2(Math.abs(t.a))}</b></li>`).join('')||'<li>No transactions yet.</li>'}</ul></div>`;
  }
  if(app==='remit'){
    return hd('Send home')+back+`<div class="pcard"><span class="lbl">Today's rate</span><span class="big">£1 = ${ngn(S.rate)}</span><span style="font-size:13px;opacity:.8">Sent so far: ${ngn(S.sentHome)}</span></div><div style="display:grid;gap:8px">${[20,50,100,250].map(a=>`<button class="pbtn g" data-remit="${a}" ${S.money<a?'disabled':''}>Send ${gbp(a)} → ${ngn(a*S.rate)}</button>`).join('')}</div>`;
  }
  if(app==='jobs'){
    const n=promoNeeds();
    const cur=S.track?`<div class="pcard"><span class="lbl">Your job</span><b style="font-size:17px">${jobTitle()}</b><span style="font-size:13px;opacity:.85">${gbp2(TRACKS[S.track].pay[S.level])}/hr · at ${esc(CITIES[S.city].v[TRACKS[S.track].venue])}</span>${n?`<span style="font-size:13px;opacity:.85">Next promotion: ${Math.min(S.xp,n.xp)}/${n.xp} shifts · ${n.sk} skill ${S.skills[n.sk].toFixed(1)}/${n.skill}</span>`:''}</div>`:`<div class="pcard"><span class="lbl">Your job</span><b>None right now</b></div>`;
    const list=Object.keys(TRACKS).filter(t=>t!==S.track).map(t=>`<button class="pbtn" data-apply="${t}" ${canSwitch()?'':'disabled'}>Apply: ${TRACKS[t].titles[0]} · ${gbp2(TRACKS[t].pay[0])}/hr<br><small style="opacity:.7">${TRACKS[t].skill} skill ${S.skills[TRACKS[t].skill].toFixed(1)} · takes 1 hour</small></button>`).join('');
    return hd('Jobs')+back+cur+`<div style="display:grid;gap:8px">${list}</div>`;
  }
  if(app==='gigs'){refreshGigs();const G=S.gigs;
    const row=(g,acc)=>{const why=!acc&&gigBlock(g);return `<div class="pcard" style="gap:6px"><div style="display:flex;justify-content:space-between;gap:8px"><b>${g.e} ${esc(g.t)}</b><b style="font-family:var(--f-mono)">${gbp(g.pay)}</b></div><div style="font-size:12.5px;opacity:.8">${g.day===S.day?'Today':'Tomorrow'} ${hhmm(g.start)} · ${g.h}h · ${esc(g.vname)}</div><div style="font-size:12.5px;opacity:.7">${esc(g.d)}${g.need?` · needs ${g.need[0]} ${g.need[1]}`:''}${g.ing?` · uses ${g.ing} bags`:''}</div>${acc?`<button class="pbtn" data-gigdrop="${g.gid}">Cancel (rating drops)</button>`:`<button class="pbtn g" data-gig="${g.gid}" ${why?'disabled':''}>${why?esc(why):'Accept gig'}</button>`}</div>`};
    return hd('Gigs','Side hustles near you')+back+`<div class="pcard"><span class="lbl">Your rating</span><span class="big">★ ${G.rating.toFixed(1)}</span><span style="font-size:13px;opacity:.8">${G.done} gigs done. Higher ratings get better pay. Turn up on time: be at the place when the gig starts.</span></div>${G.acc.length?`<div class="lbl" style="font-size:12px;opacity:.75;font-weight:800;text-transform:uppercase;letter-spacing:.08em">Booked</div>${G.acc.map(g=>row(g,true)).join('')}`:''}<div class="lbl" style="font-size:12px;opacity:.75;font-weight:800;text-transform:uppercase;letter-spacing:.08em">Available</div>${G.board.map(g=>row(g,false)).join('')||'<div class="pcard">No gigs right now. Check back tomorrow, or network at a lounge.</div>'}`}
  if(app==='biz'){
    if(!S.biz)return hd('Business','Start something of your own')+back+`<div style="font-size:13px;opacity:.8">Money comes out of your account. Your business is simulated every day: customers, weather, weekends, prices and reputation all matter.</div>${Object.entries(BIZ).map(([k,B])=>{const why=bizCan(k);return `<div class="pcard"><b style="font-size:16px">${B.icon} ${B.n}</b><span style="font-size:13px;opacity:.85">${B.d}</span><span style="font-size:12.5px;opacity:.7">Start-up ${gbp(B.cost)}${B.rent?` · rent ${gbp(B.rent)}/week`:''} · staff ${gbp(B.staff)}/day each</span><button class="pbtn ${why?'':'g'}" data-bizstart="${k}" ${why?'disabled':''}>${why?esc(why):'Start this business'}</button></div>`}).join('')}`;
    const Z=S.biz,B=BIZ[Z.type],h=Z.hist,last=h[h.length-1],wk=h.slice(-7),mx=Math.max(1,...wk.map(x=>Math.max(x.rev,x.cost)));
    const bars=`<div style="display:flex;align-items:flex-end;gap:6px;height:80px">${wk.map(x=>`<div style="flex:1;display:flex;flex-direction:column;justify-content:flex-end;height:100%;gap:2px" title="Day ${x.d}"><i style="display:block;height:${Math.round(x.rev/mx*70)}px;background:#25A866;border-radius:3px 3px 0 0"></i><small style="font-size:9.5px;opacity:.6;text-align:center;font-family:var(--f-mono)">${DAYS[(x.d-1)%7][0]}</small></div>`).join('')||'<span style="font-size:13px;opacity:.7">No trading days yet. Check back tomorrow.</span>'}</div>`;
    return hd(`${B.icon} ${esc(Z.name)}`,`${B.n} · level ${Z.lvl}`)+back+
    `<div class="pcard"><span class="lbl">Reputation</span><div class="bar" style="background:#ffffff22"><i style="width:${Z.rep}%;background:#F2B705"></i></div><span style="font-size:13px;opacity:.85">${Z.rep>=75?'Everyone is talking about you':Z.rep>=50?'Good word of mouth':Z.rep>=30?'Mixed reviews':'People are complaining'} · value ${gbp(bizValue())} · profit so far ${gbp(Z.total)}</span></div>
    <div class="pcard"><span class="lbl">Yesterday</span>${last?`<span style="font-size:14px">Sold <b>${last.sold}</b> of ${last.demand} wanted · takings <b>${gbp(last.rev)}</b> · costs ${gbp(last.cost)} · <b style="color:${last.profit>=0?'#7CE0A8':'#FF9C86'}">${last.profit>=0?'+':''}${gbp(last.profit)}</b></span>`:'<span style="font-size:13px;opacity:.7">Your first trading day is today.</span>'}${bars}<span style="font-size:11.5px;opacity:.6">Takings, last 7 days</span></div>
    <div class="pcard"><span class="lbl">Price per ${B.unit}</span><div class="apps" style="grid-template-columns:repeat(3,1fr);gap:6px">${B.price.map((p,i)=>`<button class="pbtn ${Z.price===i?'g':''}" data-bizprice="${i}">${['Cheap','Normal','Premium'][i]}<br><b style="font-family:var(--f-mono)">${gbp2(p)}</b></button>`).join('')}</div><span style="font-size:12px;opacity:.7">Cheap sells more and builds reputation. Premium earns more per sale but some people walk away.</span></div>
    <div class="pcard"><span class="lbl">Stock: ${Z.stock} ${B.unit}s · capacity ${bizCap()}/day</span><div class="apps" style="grid-template-columns:repeat(3,1fr);gap:6px">${[.5,1,2].map(m=>{const n=Math.round(bizCap()*m);return `<button class="pbtn" data-bizstock="${n}">+${n}<br><small style="opacity:.75">${gbp(n*B.stock)}</small></button>`}).join('')}</div></div>
    <div class="pcard"><span class="lbl">Staff: ${Z.staff} · ${gbp(B.staff)}/day each</span><div class="apps" style="grid-template-columns:repeat(2,1fr);gap:6px"><button class="pbtn" data-bizstaff="1">Hire</button><button class="pbtn" data-bizstaff="-1" ${Z.staff?'':'disabled'}>Let go</button></div><span style="font-size:12px;opacity:.7">Without staff, sales drop on days you don't work there yourself.</span></div>
    <div class="apps" style="grid-template-columns:repeat(2,1fr);gap:8px"><button class="pbtn" data-bizmkt>${Z.mkt?`Marketing: ${Z.mkt} days left`:`Marketing push · ${gbp(Z.type==='lounge'?300:60)}`}</button><button class="pbtn" data-bizup ${Z.lvl>=3?'disabled':''}>${Z.lvl>=3?'Fully upgraded':`Upgrade · ${gbp(B.cost*.5*Z.lvl)}`}</button></div>
    <button class="pbtn" data-bizsell>Sell the business for ${gbp(bizValue())}</button>`;
  }
  if(app==='homes'){const cur=homeDef();const list=CITIES[S.city].homes.filter(h=>!h.hotel);
    return hd('Homes',`To rent in ${CITIES[S.city].name}`)+back+`<div style="font-size:13px;opacity:.8">Deposits are 5 weeks' rent, protected in a deposit scheme and returned when you move. A man with a van costs £80.</div>${list.map(h=>{const L=LAYOUTS[h.layout];const here_=h.id===cur.id;const dep=h.rent*5;const bills=homeBills(h);
      return `<div class="pcard"><b style="font-size:16px">${esc(h.name)}${here_?' · you live here':''}</b><span style="font-size:13px;opacity:.85">${L.rooms.filter(r=>r.kind!=='hall').map(r=>r.n).join(' · ')}</span><span style="font-family:var(--f-mono);font-size:13px">${gbp(h.rent)}/week (about ${gbp(h.rent*52/12)}/month) · deposit ${gbp(dep)}${bills?` · bills ${gbp(bills)}/week`:' · bills included'}</span><span style="font-size:12.5px;opacity:.75">${{room:'Shared kitchen and bathroom. Bills included.',studio:'Your own kitchenette and shower room.',flat:'Separate bedroom, open-plan kitchen, washing machine.',house:'Two bedrooms, kitchen diner, back garden with a washing line.'}[h.layout]}</span>${here_?'':`<button class="pbtn g" data-movehome="${h.id}">Move here</button>`}</div>`}).join('')}`}
  if(app==='live')return hd('Live chat','Real players in your city')+back+`<div id="phonelive" style="color:var(--ink)">${liveBox()}</div>`;
  if(app==='rich'){const l=richList();return hd('Japa rich list')+back+`<div style="font-size:13px;opacity:.8">Net worth: cash minus debts, plus half the value of your furniture.</div><ol class="rich">${l.map((r,i)=>`<li class="${r.me?'me':''}"><span class="rk">${i+1}</span><span class="nm">${esc(r.n)}</span><span class="w">${gbp(r.w)}</span></li>`).join('')}</ol>`}
  if(app==='goals'){const p=dreamProgress();return hd('Goals')+back+`<div class="pcard"><span class="lbl">Lifetime dream</span><b style="font-size:17px">${DREAMS[S.dream].name}</b><span style="font-size:13px;opacity:.85">${DREAMS[S.dream].d}</span><div class="bar" style="background:#ffffff22"><i style="width:${Math.round(p*100)}%;background:#F2B705"></i></div></div><div class="pcard"><ul class="goals" style="color:var(--phone-ink)">${GOALS.map(([id,l])=>`<li class="${S.goals[id]?'done':''}"><span class="tick">${S.goals[id]?'✓':''}</span><span>${l}</span></li>`).join('')}</ul></div>`}
  return '';
}
function meSheet(){
  const p=dreamProgress();
  const rels=Object.keys(S.npcs).filter(id=>S.npcs[id].met).sort((a,b)=>S.npcs[b].rel-S.npcs[a].rel);
  return hd(esc(S.name),`${jobTitle()} · ${CITIES[S.city].homes.find(h=>h.id===S.home).name}`)+
   `<div class="preview"><canvas id="meav" style="width:140px;height:160px"></canvas></div>
    <div class="tags">${S.traits.map(t=>`<span class="tag" title="${TRAITS[t].d}">${TRAITS[t].name}</span>`).join('')}<span class="tag">${LOTTERY.find(l=>l.id===S.lottery).name}</span></div>
    <div class="card"><h2>Dream: ${DREAMS[S.dream].name}</h2><div style="font-size:13px;color:var(--muted)">${DREAMS[S.dream].d}</div><div class="bar" style="height:10px;margin-top:8px"><i style="width:${Math.round(p*100)}%;background:var(--danfo)"></i></div></div>
    <div class="card"><h2>Skills</h2><div class="needs" style="border:0;padding:0">${Object.entries(S.skills).map(([k,v])=>`<div class="need"><div class="row"><span>${k[0].toUpperCase()+k.slice(1)}</span><span>${v.toFixed(1)}/10</span></div><div class="bar"><i style="width:${v*10}%;background:var(--danfo)"></i></div></div>`).join('')}</div></div>
    <div class="card"><h2>People</h2>${rels.length?`<div style="display:grid;gap:6px">${rels.map(id=>`<button class="person" data-npc="${id}" style="border-radius:12px;justify-content:flex-start"><img class="face" src="${face(id)}" alt=""><span style="flex:1;text-align:left">${NPCS[id].name}<small>${relLabel(id)} · ${Math.round(S.npcs[id].rel)}</small></span></button>`).join('')}</div>`:'<div style="font-size:13.5px;color:var(--muted)">Go out and meet people. Tap them to talk.</div>'}</div>
    <div class="card"><h2>Life so far</h2><dl class="kv">${S.visaLabel?`<dt>Status</dt><dd>${esc(S.visaLabel)}</dd>`:''}<dt>Home</dt><dd>${esc(homeDef().name)} ${'★'.repeat(homeStars())}</dd><dt>Days played</dt><dd>${S.day}</dd><dt>Dishes tried</dt><dd>${Object.keys(S.dishes).filter(k=>DISHES[k]).length}</dd><dt>Dinners hosted</dt><dd>${S.hosted||0}</dd><dt>Sent home</dt><dd>${ngn(S.sentHome)}</dd><dt>Restaurants tried</dt><dd>${Object.keys(S.visited).filter(k=>S.visited[k]>0).length}</dd><dt>Rich list rank</dt><dd>#${myRank()}</dd></dl></div>
    <button class="ghost" data-restart-ask>Start a new life</button>`;
}
function buySheet(){
  ensureItems();const cat=sheet.cat||'Bedroom';const counts={};[...S.items,...S.store].forEach(i=>counts[i.k]=(counts[i.k]||0)+1);S.acc.forEach(k=>counts[k]=(counts[k]||0)+1);
  const L=LAY();const list=Object.entries(ITEMS).filter(([k,I])=>I.c===cat&&I.p>0).map(([k,I])=>{const n=counts[k]||0;const poor=S.money<I.p;const garden=I.room==='garden'&&!L.garden;
    const fx=Object.entries(I.fx||{}).filter(([q,v])=>v>0&&q!=='amb').map(([q])=>({comfort:'better sleep',fun:'more fun at home',study:'faster study',cook:'better cooking',homesick:'less homesick',fitness:'home workouts'}[q])).join(', ');
    return `<button class="act ${poor?'off':''}" data-furn="${k}"><span class="main"><span class="lbl">${I.n}${n?` <span style="color:var(--green)">· own ${n}</span>`:''}</span><span class="sub">${esc(I.d||fx||(I.sz?`${I.sz[0]}×${I.sz[1]}m`:''))}${garden?' · needs a garden to place':''}</span></span><span class="meta"><b>${gbp(I.p)}</b></span></button>`}).join('');
  return hd('Buy furniture',`${gbp(S.money)} · ${L.name}${L.hotel?' · hotel: items go to storage':''}`)+`<div class="opts">${CAT.map(c=>`<button class="opt ${c===cat?'sel':''}" data-cat="${c}">${c}</button>`).join('')}</div><div style="font-size:12.5px;color:var(--muted)">Buy as many as you like. Items place themselves in the right room. If there's no space they go into storage.</div><div class="acts">${list}</div>`;
}
function decPanel(){
  const sel=decSelected();const placed=S.items.filter(i=>ITEMS[i.k].p>0||i.k==='mattress'||i.k==='chair');
  const chip=(it,stored)=>`<button class="person ${DEC.sel===it.u?'on':''}" data-dsel="${it.u}" style="padding:6px 12px"><span>${esc(ITEMS[it.k].n)}${stored?'<small>In storage</small>':''}</span></button>`;
  return `<div class="card" style="display:flex;flex-direction:column;gap:10px"><h2 style="margin:0">Decorate</h2>
   <div class="people" style="flex-wrap:wrap">${placed.map(i=>chip(i,false)).join('')}${S.store.map(i=>chip(i,true)).join('')}</div>
   ${sel?(S.store.includes(sel)?`<div class="row2"><button class="act go" data-dplace="${sel.u}"><span class="main"><span class="lbl">Place ${esc(ITEMS[sel.k].n)}</span></span></button><button class="act" data-dsell><span class="main"><span class="lbl">Sell for ${gbp(ITEMS[sel.k].p*.5)}</span></span></button></div>`
     :`<div style="display:grid;grid-template-columns:repeat(4,1fr);gap:6px">${[['←',-1,0],['→',1,0],['↑',0,-1],['↓',0,1]].map(([l,x,y])=>`<button class="opt" data-dmove="${x},${y}" style="font-size:18px">${l}</button>`).join('')}</div><div style="display:grid;grid-template-columns:repeat(3,1fr);gap:6px"><button class="opt" data-drot>Turn</button><button class="opt" data-dstore>Store</button><button class="opt" data-dsell>Sell ${gbp(ITEMS[sel.k].p*.5)}</button></div><div style="font-size:12px;color:var(--muted)">Arrows move along the floor. You can also tap the floor in the picture to move it there.</div>`)
     :'<div style="font-size:13px;color:var(--muted)">Tap an item here or in the picture to select it.</div>'}</div>`;
}
function npcSheet(){
  const id=sheet.id,N=NPCS[id],n=S.npcs[id];const at=peopleAt(here()).includes(id);
  const acts=npcActions(id);
  return hd(N.name,relLabel(id))+`<div class="preview"><canvas id="npcav" style="width:140px;height:160px"></canvas></div><div style="font-size:14px">${N.bio}</div>${meter('Relationship',n.rel)}
   ${Object.keys(n.known||{}).length?`<div class="tags">${Object.entries(n.known).map(([t,f])=>`<span class="tag ${f<0?'warn':''}">${f>0?'★ Loves':'✗ Not into'} ${TOPICS[t].l.toLowerCase()}</span>`).join('')}</div>`:''}
   ${at?`<div class="acts">${acts.map(a=>{const why=a.cond&&a.cond();return `<button class="act ${why?'off':''}" data-npcact="${a.id}"><span class="main"><span class="lbl">${a.l}</span><span class="sub">${esc(why||a.s||'')}</span></span><span class="meta"><b>${a.talk?'Chat':a.h>=1?a.h+'h':Math.round(a.h*60)+'m'}</b></span></button>`}).join('')}</div>`:`<div class="card" style="font-size:13.5px">${N.name} is not here right now. Find them around town, or wait for them to message you.</div>`}`;
}
function doNpc(id,aid){
  if(busy)return;const a=npcActions(id).find(x=>x.id===aid);const why=a.cond&&a.cond();if(why){toast(why);return}
  if(a.talk){sheet=startTalk(id);render();return}
  advance(a.h);const m=a.run();log(m,'');toast(m);checkGoals();save();render();
}

/* ---------- modal events ---------- */
function renderModal(){
  const ov=$('overlay');if(ov.dataset.mode==='creator')return;
  if(S.over){ov.innerHTML=`<div class="overlay"><div class="modal"><span class="kick">Day ${S.day}</span><h3>Evicted.</h3><p>Three missed rent payments and the landlord changed the locks. ${esc(S.name)} is now on a friend's sofa.</p><p>You sent ${ngn(S.sentHome)} home and tried ${Object.keys(S.dishes).length} dishes.</p><button class="go" data-restart>Start a new life</button></div></div>`;return}
  if(sheet?.type==='liveok'){ov.innerHTML=`<div class="overlay"><div class="modal"><span class="kick">Live chat</span><h3>Chat with real players</h3><p>Messages go to everyone in the same place in your city. They are public and kept for about 12 hours.</p><p><b>You must be 18 or over.</b> Be kind. Never share your address, phone number, or bank details. Mute anyone who bothers you.</p><button class="go" data-live-yes>I'm 18+ and I agree</button><button class="ghost" data-live-no>Not now</button></div></div>`;return}
  if(sheet?.type==='liveperson'){ov.innerHTML=`<div class="overlay"><div class="modal"><span class="kick">Player</span><h3>${esc(sheet.name)}</h3><p>A real person playing Japa Life near you.</p><button class="choice" data-mute>Mute ${esc(sheet.name)}</button><button class="ghost" data-live-no>Close</button></div></div>`;return}
  if(sheet?.type==='movehome'){const h=CITIES[S.city].homes.find(x=>x.id===sheet.id),old=homeDef();const cost=h.rent*5+h.rent+80-(old.rent||0)*5;ov.innerHTML=`<div class="overlay"><div class="modal"><span class="kick">Moving home</span><h3>${esc(h.name)}</h3><p>New deposit ${gbp(h.rent*5)} + first week ${gbp(h.rent)} + van £80${old.rent?`, minus your old deposit back (${gbp(old.rent*5)})`:''}.</p><p><b>${cost>=0?'You pay':'You get back'} ${gbp(Math.abs(cost))} today.</b> Rent ${gbp(h.rent)} a week from Monday${homeBills(h)?`, plus ${gbp(homeBills(h))} a week council tax and bills`:''}.</p><button class="go" data-move-yes>Move in</button><button class="ghost" data-live-no>Not now</button></div></div>`;return}
  if(sheet?.type==='bizsell'){ov.innerHTML=`<div class="overlay"><div class="modal"><h3>Sell ${esc(S.biz.name)}?</h3><p>You'll get ${gbp(bizValue())} and the business closes for good.</p><button class="choice" data-bizsell-yes>Sell it</button><button class="ghost" data-live-no>Keep it</button></div></div>`;return}
  if(sheet?.type==='restart'){ov.innerHTML=`<div class="overlay"><div class="modal"><h3>Start a new life?</h3><p>${esc(S.name)}'s progress will be lost.</p><button class="choice" data-restart>Yes, start again</button><button class="choice" data-cancel>Keep playing</button></div></div>`;return}
  const e=S.queue.length&&EVENTS.find(x=>x.id===S.queue[0]);
  if(!e){if(S.queue.length)S.queue.shift();ov.innerHTML='';return}
  ov.innerHTML=`<div class="overlay"><div class="modal" role="dialog" aria-modal="true"><span class="kick">${DAYS[dow()]} · Day ${S.day}</span><h3>${esc(e.title)}</h3><p>${esc(e.body())}</p>${e.choices.map((c,i)=>`<button class="choice" data-choice="${i}">${esc(c.l)}${c.s?`<small>${esc(c.s)}</small>`:''}</button>`).join('')}</div></div>`;
}
function choose(i){const e=EVENTS.find(x=>x.id===S.queue[0]);S.queue.shift();if(e)log(e.choices[i].fx(),'');checkGoals();save();render()}

/* ---------- creator ---------- */
let C=null;
function showCreator(){
  const ov=$('overlay');ov.dataset.mode='creator';
  if(!C)C={step:0,name:'Tunde',skin:3,hair:'lowcut',fabric:'green',traits:[],dream:null,lottery:null,track:'care',city:'london',home:null,spun:false};
  const steps=`<div class="steps">${[0,1,2,3,4].map(i=>`<i class="${i<=C.step?'on':''}"></i>`).join('')}</div>`;
  let b='';
  if(C.step===0)b=`<div class="hero-title">Japa<br><span>Life</span></div><p>Leave Nigeria, land in the UK, and build a life. Work, eat out, make friends, chat with other players, and don't forget to call your mother.</p>
    <div class="preview"><canvas id="cav" style="width:140px;height:160px"></canvas></div>
    <label class="field" for="nm">Name<input id="nm" value="${esc(C.name)}" maxlength="16" autocomplete="off"></label>
    <div class="field">Skin tone<div class="swatches">${SKINS.map((s,i)=>`<button class="sw ${C.skin===i?'sel':''}" style="background:${s}" data-c="skin" data-v="${i}" aria-label="Skin tone ${i+1}"></button>`).join('')}</div></div>
    <div class="field">Hair<div class="opts">${HAIRS.map(([k,l])=>`<button class="opt ${C.hair===k?'sel':''}" data-c="hair" data-v="${k}">${l}</button>`).join('')}</div></div>
    <div class="field">Outfit fabric<div class="swatches">${FABRICS.map(f=>`<button class="sw ${C.fabric===f.id?'sel':''}" style="background:radial-gradient(circle,${f.dot} 30%,${f.base} 32%)" data-c="fabric" data-v="${f.id}" aria-label="${f.name}" title="${f.name}"></button>`).join('')}</div></div>
    <button class="go" data-next>Next: personality</button>`;
  if(C.step===1)b=`<h3>Pick two traits</h3><div style="display:grid;gap:8px">${Object.entries(TRAITS).map(([k,t])=>`<button class="choice ${C.traits.includes(k)?'sel':''}" data-trait="${k}">${t.name}<small>${t.d}</small></button>`).join('')}</div><button class="go" data-story ${C.traits.length===2?'':'disabled'}>Begin your story</button><button class="ghost" data-back>Back</button>`;
  if(C.step===2)b=`<h3>What's your lifetime dream?</h3><div style="display:grid;gap:8px">${Object.entries(DREAMS).map(([k,d])=>`<button class="choice ${C.dream===k?'sel':''}" data-dream="${k}">${d.name}<small>${d.d}</small></button>`).join('')}</div><button class="go" data-next ${C.dream?'':'disabled'}>Next: the life lottery</button><button class="ghost" data-back>Back</button>`;
  if(C.step===3){const L=C.lottery&&LOTTERY.find(l=>l.id===C.lottery);
    b=`<h3>The life lottery</h3><p>Spin to see how your bank account is looking.</p>${L?`<div class="lottery">${L.name}</div><p>${L.d}</p><div class="field">Your job<div style="display:grid;gap:8px">${[['care','Care worker'],['tech','IT'],['finance','Accounts'],['food','Chef']].map(([k,l])=>`<button class="choice ${C.track===k?'sel':''}" data-track="${k}">${l}<small>Starts as ${TRACKS[k].titles[0]} · ${gbp2(TRACKS[k].pay[0])}/hr</small></button>`).join('')}</div></div><button class="go" data-next>Next: where you live</button>`:`<div class="lottery" id="spinbox">?</div><button class="go" data-spin>Spin</button>`}<button class="ghost" data-back>Back</button>`}
  if(C.step===4){const c=CITIES[C.city];if(!C.home||!c.homes.find(h=>h.id===C.home))C.home=c.homes[0].id;
    b=`<h3>Where do you live?</h3><div class="field">City<div class="opts">${Object.entries(CITIES).map(([k,x])=>`<button class="opt ${C.city===k?'sel':''}" data-city="${k}">${x.name}</button>`).join('')}</div></div>
    <div class="field">Home<div style="display:grid;gap:8px">${c.homes.filter(h=>!h.hotel).map(h=>`<button class="choice ${C.home===h.id?'sel':''}" data-home="${h.id}">${h.name}<small>${gbp(h.rent)} a week${h.shared?' · shared bathroom, room for 4 new items':' · your own space'}</small></button>`).join('')}</div></div>
    <button class="go" data-start>Start living</button><button class="ghost" data-back>Back</button>`}
  ov.innerHTML=`<div class="overlay solid"><div class="modal">${steps}${b}</div></div>`;
  const cav=ov.querySelector('#cav');if(cav)drawAvatar(cav,{skin:C.skin,hair:C.hair,fabric:C.fabric},1.5);
}
function creatorClick(t){
  if(C&&C.node){storyClick(t);return}
  const d=t.dataset;
  if(t.hasAttribute('data-story')){const nm=$('nm');if(nm)C.name=nm.value.trim().slice(0,16)||'Tunde';startStory();return}
  if(t.id==='nm')return;
  const nm=$('nm');if(nm)C.name=nm.value.trim().slice(0,16)||'Tunde';
  if(d.c){C[d.c]=d.c==='skin'?+d.v:d.v}
  else if(d.trait!==undefined){const i=C.traits.indexOf(d.trait);if(i>=0)C.traits.splice(i,1);else if(C.traits.length<2)C.traits.push(d.trait);else{C.traits.shift();C.traits.push(d.trait)}}
  else if(d.dream)C.dream=d.dream;
  else if(d.track)C.track=d.track;
  else if(d.city){C.city=d.city;C.home=null}
  else if(d.home)C.home=d.home;
  else if(t.hasAttribute('data-next'))C.step++;
  else if(t.hasAttribute('data-back'))C.step=Math.max(0,C.step-1);
  else if(t.hasAttribute('data-spin')){spin();return}
  else if(t.hasAttribute('data-start')){
    S=newGame(C);$('overlay').dataset.mode='';$('overlay').innerHTML='';C=null;
    log(`New week, new vibes. ${S.name} has ${gbp(S.money)} and a whole city to explore.`,'good');
    msg('mummy','Good morning my dear. Have you eaten? Call me when you can 🙏🏾');
    msg('gang','Who is free this weekend? Owambe Saturday, suya after 🔥');
    if(S.debt)msg('uncle','Welcome. Remember our arrangement: £100 every Monday. God bless.');
    anim.reset=true;save();render();return}
  showCreator();
}
function spin(){
  const box=$('spinbox');const names=LOTTERY.map(l=>l.name);let i=0;const r=Math.random();
  const res=r<.3?'soft':r<.7?'steady':'sapa';
  const tick=()=>{box.textContent=names[i++%3];if(i<14&&!reduceMotion)setTimeout(tick,60+i*12);else{C.lottery=res;showCreator()}};tick();
}

/* ---------- events wiring ---------- */
document.addEventListener('click',e=>{
  const t=e.target.closest('button,[data-pin],[data-close-sheet]');if(!t)return;
  if($('overlay').dataset.mode==='creator'&&t.closest('#overlay')){if(t.tagName==='BUTTON')creatorClick(t);return}
  const d=t.dataset;
  if(t.hasAttribute('data-close-sheet')){if(e.target===t)closeSheet();return}
  if(d.nav){if(d.nav==='home'){if(sheet||S.at==='home'){sheet=null;render()}else openSheet({type:'map',sel:'home'})}else openSheet({type:d.nav});return}
  if(t.hasAttribute('data-x')){closeSheet();return}
  if(d.act){doAct(d.act);return}
  if(t.hasAttribute('data-buy')){openSheet({type:'buy'});return}
  if(t.hasAttribute('data-map')){openSheet({type:'map'});return}
  if(t.hasAttribute('data-gohome')){openSheet({type:'map',sel:'home'});return}
  if(d.pin){selectPin(d.pin);return}
  if(d.travel){if(CMV.trip)return;const o=travelOptions(d.travel).find(x=>x.id===d.mode);if(!o)return;if(S.money<o.cost){toast(`You need ${gbp2(o.cost)} for that.`);return}
    const go=()=>{if(travel(d.travel,d.mode)){sheet=null;checkGoals();save();render();window.scrollTo({top:0})}};
    if(sheet&&sheet.type==='map'&&!sheet.real)animateTravel(d.travel,d.mode,go);else go();return}
  if(d.mz){CMV.cam.z*=d.mz==='1'?1.3:1/1.3;cyClampCam();return}
  if(t.hasAttribute('data-mme')){cyCentreOn(S.at,Math.max(CMV.cam.z,.9));return}
  if(d.mreal!==undefined){sheet.real=d.mreal==='1';CMV.cv=null;render();return}
  if(d.npc){openSheet({type:'npc',id:d.npc});return}
  if(d.npcact){doNpc(sheet.id,d.npcact);return}
  if(d.furn){const I=ITEMS[d.furn];if(S.money<I.p){toast(`You need ${gbp(I.p)}.`);return}spend(I.p,I.n);const r=giveItem(d.furn);toast(r==='acc'?`${I.n} added.`:r==='placed'?`${I.n} placed in your home.`:`${I.n} went into storage. No space right now.`);log(`Bought: ${I.n}.`,'good');checkGoals();save();render();return}
  if(d.cat){sheet.cat=d.cat;render();return}
  if(t.hasAttribute('data-decorate')){DEC.on=!DEC.on;DEC.sel=null;render();return}
  if(d.dsel){DEC.sel=+d.dsel;render();return}
  if(d.dmove){const [x,y]=d.dmove.split(',').map(Number);decMove(x,y);save();render();return}
  if(t.hasAttribute('data-drot')){decRotate();save();render();return}
  if(t.hasAttribute('data-dstore')){decStore();save();render();return}
  if(t.hasAttribute('data-dsell')){decSell();save();render();return}
  if(d.dplace){decPlace(+d.dplace);save();render();return}
  if(d.movehome){sheet={type:'movehome',id:d.movehome,back:sheet};render();return}
  if(t.hasAttribute('data-move-yes')){moveHome(sheet.id);sheet=null;checkGoals();save();render();window.scrollTo({top:0});return}
  if(d.app!==undefined){sheet.app=d.app||null;sheet.thread=null;render();return}
  if(d.thread!==undefined){sheet.thread=d.thread||null;save();render();return}
  if(d.reply!==undefined){replyWA(sheet.thread,+d.reply);checkGoals();save();render();return}
  if(d.remit){const a=+d.remit;if(S.money<a)return;spend(a,'Sent home');S.sentHome+=a*S.rate;add('pressure',-Math.min(40,a/4));log(`Sent ${ngn(a*S.rate)} home.`,'good');checkGoals();save();render();return}
  if(d.bank==='uncle'){const p=Math.min(500,S.debt);spend(p,'Paid Uncle Femi');S.debt-=p;if(S.debt<=0)log('Uncle Femi is fully paid back!','good');save();render();return}
  if(d.bank==='loan'){spend(S.loan,'Cleared quick loan');S.loan=0;save();render();return}
  if(d.bank==='take'){earn(500,'Quick loan');S.loan=600;log('Took a £500 quick loan. £150 a week for 4 weeks.','bad');save();render();return}
  if(d.apply){const r=applyJob(d.apply);toast(r||`You got the job: ${jobTitle()}!`);checkGoals();save();render();return}
  if(d.ukvi==='renew'){spend(1500,'Visa extension and health surcharge');S.renewDue=false;S.renewed=true;log('Visa extended. Settlement clock running again.','good');save();render();return}
  if(d.ukvi==='ilr'){spend(3000,'ILR application');S.visa='ilr';add('pressure',-40);add('fun',60);log('ILR GRANTED. You are settled. The family WhatsApp is on fire.','good');checkGoals();save();render();return}
  if(d.choice!==undefined){choose(+d.choice);return}
  if(d.gig){acceptGig(+d.gig);save();render();return}
  if(d.gigdrop){const G=S.gigs;G.acc=G.acc.filter(g=>g.gid!==+d.gigdrop);G.rating=Math.max(1,r2(G.rating-.3));toast('Gig cancelled. Rating dropped a little.');save();render();return}
  if(d.bizstart){startBiz(d.bizstart);checkGoals();save();render();return}
  if(d.bizprice){S.biz.price=+d.bizprice;save();render();return}
  if(d.bizstock){bizRestock(+d.bizstock);save();render();return}
  if(d.bizstaff){bizStaff(+d.bizstaff);save();render();return}
  if(t.hasAttribute('data-bizmkt')){if(!S.biz.mkt)bizMarket();save();render();return}
  if(t.hasAttribute('data-bizup')){bizUpgrade();save();render();return}
  if(t.hasAttribute('data-bizsell')){sheet={type:'bizsell',back:sheet};render();return}
  if(t.hasAttribute('data-bizsell-yes')){bizClose();sheet=sheet.back||null;save();render();return}
  if(d.dish){const m=orderDish(d.dish);log(m,'');toast(m);sheet=null;checkGoals();save();render();return}
  if(d.inv){const i=sheet.pick.indexOf(d.inv);if(i>=0)sheet.pick.splice(i,1);else if(sheet.pick.length<3)sheet.pick.push(d.inv);render();return}
  if(t.hasAttribute('data-invite-go')){const m=inviteFriends(sheet.pick);log(m,'');toast(m);sheet=null;save();render();return}
  if(d.topic){talkTopic(d.topic);checkGoals();save();render();return}
  if(d.q!==undefined){answerQ(+d.q);save();render();return}
  if(t.hasAttribute('data-endtalk')){endTalk();render();return}
  if(d.text){const w=canText(sheet.thread);if(w){toast(w);return}textTopic(sheet.thread,d.text);checkGoals();save();render();return}
  if(t.hasAttribute('data-live-consent')){sheet={type:'liveok',back:sheet};render();return}
  if(t.hasAttribute('data-live-yes')){S.flags.liveOK=true;save();sheet=sheet.back||null;render();return}
  if(t.hasAttribute('data-live-no')){sheet=sheet.back||null;render();return}
  if(d.liveperson){const p=LIVE.people[d.liveperson];sheet={type:'liveperson',pid:d.liveperson,name:p?.name||'Player',back:sheet};render();return}
  if(t.hasAttribute('data-mute')){S.muted[sheet.pid]=true;save();toast('Muted. You will not see their messages.');sheet=sheet.back||null;render();return}
  if(t.hasAttribute('data-restart-ask')){sheet={type:'restart'};render();return}
  if(t.hasAttribute('data-cancel')){sheet=null;render();return}
  if(t.hasAttribute('data-restart')){S=null;sheet=null;try{localStorage.removeItem(KEY)}catch(e){};$('overlay').innerHTML='';render();return}
});
document.addEventListener('pointerup',e=>{if(!DEC.on||e.target.id!=='cv'||S.at!=='home')return;const r=e.target.getBoundingClientRect();decTap((e.clientX-r.left)/r.width*360,(e.clientY-r.top)/r.height*230)});
document.addEventListener('submit',e=>{if(e.target.matches('[data-liveform]')){e.preventDefault();const i=$('livein');liveSend(i.value);i.value=''}});
document.addEventListener('keydown',e=>{if((e.key==='Enter'||e.key===' ')&&e.target.matches('[data-pin]')){e.preventDefault();e.target.dispatchEvent(new MouseEvent('click',{bubbles:true}))}if(e.key==='Escape'&&sheet){closeSheet()}});
document.addEventListener('input',e=>{if(e.target.id==='nm'&&C)C.name=e.target.value.slice(0,16)});

/* ---------- boot ---------- */
function start(data){
  cv=$('cv');ctx=cv.getContext('2d');dpr=Math.min(2,window.devicePixelRatio||1);readColors();
  if(data&&data.state)S=data.state;else{try{const r=localStorage.getItem(KEY);if(r)S=JSON.parse(r)}catch(e){S=null}}
  render();requestAnimationFrame(frame);
  setInterval(()=>{if(S&&LIVE.ok)liveRefresh()},30000);
  matchMedia('(prefers-color-scheme: dark)').addEventListener?.('change',()=>{readColors();patCache={};render()});
}
window.claude?.hot?.snapshot?.(()=>({state:S}));
window.claude?.hot?.ready?window.claude.hot.ready(start):start(window.claude?.hot?.data??{});
