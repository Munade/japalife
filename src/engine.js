/* ---------- helpers ---------- */
let S=null;
const clamp=(v,a=0,b=100)=>Math.max(a,Math.min(b,v));
const rnd=(a,b)=>a+Math.random()*(b-a);
const pick=a=>a[Math.floor(Math.random()*a.length)];
const r2=n=>Math.round(n*100)/100;
const gbp=n=>(n<0?'-£':'£')+Math.abs(Math.round(n)).toLocaleString('en-GB');
const gbp2=n=>(n<0?'-£':'£')+Math.abs(n).toLocaleString('en-GB',{minimumFractionDigits:n%1?2:0,maximumFractionDigits:2});
const ngn=n=>'₦'+Math.round(n).toLocaleString('en-GB');
const val=x=>typeof x==='function'?x():x;
const dow=()=>(S.day-1)%7;
const hhmm=h=>{const m=Math.round(h*60)%1440;return String(Math.floor(m/60)).padStart(2,'0')+':'+String(m%60).padStart(2,'0')};
const has=t=>S.traits.includes(t);
const own=k=>S.furn.includes(k);
const hash=s=>{let h=2166136261;for(const c of String(s)){h^=c.charCodeAt(0);h=Math.imul(h,16777619)}return (h>>>0)/4294967295};
const price=c=>r2(c*(has('pincher')?.85:1));
function add(k,v){ if(k in S.needs) S.needs[k]=clamp(S.needs[k]+v); else S[k]=clamp(S[k]+v); }
function skill(k,v){const m=(k==='career'&&has('bookworm'))?1.5:(k==='cooking'&&has('chef'))?2:1;S.skills[k]=Math.min(10,r2(S.skills[k]+v*m))}
function rel(id,v){const n=S.npcs[id];n.met=true;n.rel=clamp(n.rel+(v>0?v*(has('charmer')?1.5:1):v))}
function tx(label,a){S.tx.unshift({t:`Day ${S.day} ${hhmm(S.hour)}`,label,a:r2(a)});S.tx=S.tx.slice(0,25)}
function earn(a,label){a=r2(a);S.money=r2(S.money+a);tx(label,a)}
function spend(a,label){a=r2(a);S.money=r2(S.money-a);tx(label,-a)}
function log(msg,tone=''){S.log.unshift({t:`${DAYS[dow()]} ${hhmm(S.hour)}`,msg,tone});S.log=S.log.slice(0,10)}

/* ---------- venues ---------- */
function venues(){
  const c=CITIES[S.city], home=c.homes.find(h=>h.id===S.home);
  const out=[{id:'home',type:'home',name:home.name,x:POS.home[0],y:POS.home[1],ll:home.ll}];
  for(const t of Object.keys(c.v)) out.push({id:t,type:t,name:c.v[t],x:POS[t][0],y:POS[t][1],ll:c.ll[t]});
  c.eats.forEach(e=>out.push({id:'eat-'+e.id,type:'restaurant',rid:e.id,name:e.name,area:e.area,dish:e.dish,cost:e.cost,x:e.x,y:e.y,ll:e.ll}));
  (c.night||[]).forEach(n=>out.push({id:'n-'+n.id,type:n.type,name:n.name,area:n.area,ll:n.ll,x:n.x,y:n.y,entry:n.entry,real:n.real}));
  if(S.biz&&BIZ[S.biz.type].where==='premises')out.push({id:'mybiz',type:'mybiz',name:S.biz.name,area:home.name.split(',')[1]||'',ll:S.biz.ll,x:POS.home[0]+26,y:POS.home[1]-18});
  FINE.forEach((f,i)=>out.push({id:'fine-'+f.id,type:'fine',rid:f.id,name:f.name,area:f.area,dish:f.dish,cost:f.cost,x:c.fine[i][0],y:c.fine[i][1],ll:f.ll,trip:!c.london}));
  return out;
}
const venue=id=>venues().find(v=>v.id===id);
const here=()=>venue(S.at);
function isOpen(type,day=dow(),h=S.hour){
  for(const [days,from,to] of VT[type].open){
    if(days.includes(day)&&h>=from&&h<Math.min(to,24))return true;
    if(to>24&&days.includes((day+6)%7)&&h<to-24)return true;
  }
  return false;
}
function crowd(v,day=dow(),h=S.hour){
  if(!v||v.type==='home'||!isOpen(v.type,day,h))return null;
  const wk=day>=4&&day<=5,hh=h<6?h+24:h;let x=.3;
  if(['club','karaoke'].includes(v.type))x=(wk?1:.5)*(hh>=23&&hh<27?1:hh>=21?.6:.3);
  else if(['lounge','bar'].includes(v.type))x=(wk?.9:.55)*(hh>=20&&hh<24?1:hh>=17?.65:.4);
  else if(v.type==='dayparty')x=hh>=16&&hh<20?1:.6;
  else if(['restaurant','chicken','caribbean','fine'].includes(v.type))x=(hh>=12&&hh<14)||(hh>=18&&hh<21)?.85:.35;
  else if(v.type==='cafe')x=hh>=8&&hh<11?.85:.4;
  else if(['hall','church'].includes(v.type))x=.9;
  else if(['market','retail'].includes(v.type))x=day>=5?.85:.5;
  else if(v.type==='pub')x=day>=5||hh>=19?.8:.35;
  x*=.85+hash(S.day+v.id)*.3;
  return x>.8?'Packed':x>.6?'Busy':x>.35?'Lively':'Quiet';
}
function hoursText(type){
  if(type==='home'||type==='carehome'||type==='airport')return 'Open 24 hours';
  return VT[type].open.map(([d,f,t])=>{const dd=d.length===7?'Daily':d.length===5&&d[0]===0&&d[4]===4?'Mon–Fri':d.map(x=>DAYS[x]).join(', ');return `${dd} ${hhmm(f)}–${hhmm(t%24)}`}).join(' · ');
}
function isWorkplace(v){return S.track&&TRACKS[S.track].venue===v.type}
function peopleAt(v){
  const comp=(S.company&&S.company.at===v?.id&&S.company.day===S.day&&S.hour<S.company.until)?S.company.ids:[];
  if(!v||v.type==='home')return [...new Set([...(S.partner&&S.npcs[S.partner].stage==='married'?[S.partner]:[]),...comp])];
  const slot=S.day*24+Math.floor(S.hour);
  return Object.keys(NPCS).filter(id=>{
    const n=NPCS[id];
    return n.haunts.some(([t,days,from,to])=>{
      const match=t==='@work'?isWorkplace(v):t===v.type;
      if(!match)return false;
      if(days&&!days.includes(dow()))return false;
      const h=S.hour<from&&to>24?S.hour+24:S.hour;
      if(!(h>=from&&h<to))return false;
      if(id==='bisi'&&v.type==='market')return true;
      if(t==='@work')return hash(slot+id)<.75;
      return hash(slot+id+v.id)<.55;
    });
  }).filter(id=>!comp.includes(id)).concat(comp).slice(-4);
}

[['tobi',[['lounge',null,19,24],['bar',[4],18,22]]],['sade',[['lounge',[4,5],20,25],['dayparty',null,14,22]]],['emeka',[['karaoke',null,20,25],['dayparty',null,15,22]]],['amara',[['karaoke',[4],20,24],['bar',null,18,22]]],['dele',[['lounge',null,20,25]]],['grace',[['bar',[4],18,21]]],['kwame',[['dayparty',[6],14,20]]]].forEach(([id,hs])=>{hs.forEach(h=>{if(!NPCS[id].haunts.some(x=>x[0]===h[0]))NPCS[id].haunts.push(h)})});
/* ---------- travel ---------- */
function km(a,b){const R=6371,r=x=>x*Math.PI/180;const dl=r(b[0]-a[0]),dn=r(b[1]-a[1]);const h=Math.sin(dl/2)**2+Math.cos(r(a[0]))*Math.cos(r(b[0]))*Math.sin(dn/2)**2;return 2*R*Math.asin(Math.sqrt(h))}
function travelOptions(to){
  const a=here(),b=venue(to);
  if(a.trip||b.trip)return [{id:'train',label:'Train to London',h:2.5,cost:35}];
  const d=km(a.ll,b.ll),L=CITIES[S.city].london,o=[];
  if(d<=6)o.push({id:'walk',label:'Walk',h:r2(.1+d/5),cost:0});
  if(d>15)o.push({id:'bus',label:'Train',h:r2(.3+d/45),cost:L?12:9});
  else o.push({id:'bus',label:L?'Bus or Tube':'Bus or tram',h:r2(.2+d/16),cost:L?2.5:2});
  o.push({id:'uber',label:'Uber',h:r2(.12+d/28),cost:Math.round(5+d*1.9)});
  return o.map(x=>Object.assign(x,{km:Math.round(d*10)/10}));
}
function travel(to,modeId){
  const m=travelOptions(to).find(x=>x.id===modeId);
  if(S.money<m.cost){toast(`You need ${gbp2(m.cost)} for that.`);return false}
  if(m.cost)spend(m.cost,m.label);
  advance(m.h);
  if(modeId==='walk'){add('energy',-Math.min(10,m.h*6));if(S.weather==='Drizzle')add('hygiene',-6)}
  S.at=to; anim.reset=true; S.company=null;
  const v=here(); if(v.type==='restaurant'||v.type==='fine')S.visited[v.rid]=S.visited[v.rid]||0;
  if(Math.random()<.05&&!S.queue.length)S.queue.push(pick(['bump','busker','lostcard']));
  return true;
}

/* ---------- time ---------- */
function advance(h,opt={}){
  const steps=Math.max(1,Math.round(h*2));
  for(let i=0;i<steps;i++){
    const n=S.needs,k=.5,sl=opt.sleep,night=S.hour<5||S.hour>=23;
    if(opt.away){S.hour+=k;if(S.hour>=24){S.hour-=24;newDay()}continue}
    n.hunger=clamp(n.hunger-(sl?1.5:4)*k);
    let eg=sl?(own('bed')?16:13):(night&&!has('nightowl')?-5:-3);
    if(sl&&S.weather==='Cold snap'&&!own('blanket'))eg*=.75;
    n.energy=clamp(n.energy+eg*k);
    n.bladder=clamp(n.bladder-(sl?2:6)*k);
    n.hygiene=clamp(n.hygiene-(sl?.8:2)*k);
    let fd=sl?.3:2*(has('hustler')?1.25:1)*(S.weather==='Cold snap'&&!S.flags.coat?1.3:1);
    if(S.at==='home'&&own('plants'))fd*=.8;
    n.fun=clamp(n.fun-fd*k);
    let sd=sl?.3:1.5*(has('homebody')?.7:1)*(S.partner&&S.npcs[S.partner].stage==='married'?.6:1);
    n.social=clamp(n.social-sd*k);
    S.pressure=clamp(S.pressure+.7*k*(has('prayer')?.6:1));
    let hs=(n.social<30?1.4:.9)*(own('photos')?.75:1)*(own('rug')?.85:1);
    S.homesick=clamp(S.homesick+hs*k);
    if(n.hunger<=0){n.energy=clamp(n.energy-2*k);n.fun=clamp(n.fun-2*k)}
    if(n.bladder<=0){n.bladder=100;n.hygiene=0;n.fun=clamp(n.fun-20);log("You couldn't hold it. Nobody saw. Probably.",'bad')}
    S.hour+=k;
    if(S.hour>=24){S.hour-=24;newDay()}
  }
}
const sleepHours=()=>S.hour<7?7-S.hour:24-S.hour+7;
function worth(){let f=0;S.furn.forEach(k=>{f+=(FURN[k].price||0)*.5});return Math.round(S.money-S.debt-S.loan+f+(typeof bizValue==='function'?bizValue():0))}
function richList(){const l=S.rich.map(([n,w])=>({n,w:Math.round(w)}));l.push({n:S.name+' (you)',w:worth(),me:true});return l.sort((a,b)=>b.w-a.w)}
const myRank=()=>richList().findIndex(x=>x.me)+1;
const married=()=>S.partner&&S.npcs[S.partner].stage==='married';
const settleCounts=()=>(S.visa==='hcw'||S.visa==='sw')&&!S.sponsorless&&!S.renewDue;

function newDay(){
  S.day++; S.workedToday=false; S.otToday=false;
  S.rate=Math.round(rnd(1960,2180)/10)*10;
  S.weather=pick(['Drizzle','Drizzle','Grey','Grey','Cold snap','Sunny spell']);
  if(S.fresh>0)S.fresh--;
  if((S.day-1)%7===0)weekly();
  if(S.day%28===0){spend(60,'Phone and energy bills');log('Phone and energy bills: £60.','')}
  if(S.wedding&&S.day>=S.wedding){S.wedding=0;const p=S.npcs[S.partner];p.stage='married';add('fun',60);add('social',60);add('homesick',-30);add('pressure',-40);S.queue.unshift('wedding')}
  S.pressure=clamp(S.pressure+4);
  if(S.money<40&&S.day-S.lastNrpf>=6){S.lastNrpf=S.day;S.queue.push('broke')}
  if(!S.meterOff&&Math.random()<.07)S.queue.push('meter');
  (S.storyQ||[]).filter(q=>q.day<=S.day).forEach(q=>S.queue.unshift(q.id));if(S.storyQ)S.storyQ=S.storyQ.filter(q=>q.day>S.day);
  if(typeof bizDay==='function')bizDay();
  if(typeof refreshGigs==='function')refreshGigs();
  if(S.biz&&['chops','aso'].includes(S.biz.type)&&Math.random()<.18)S.queue.push('bigorder');
  dailyChats();
  if(Math.random()<.6){
    const pool=EVENTS.filter(e=>!e.manual&&(!e.when||e.when())&&!S.recent.includes(e.id));
    if(pool.length){const e=pick(pool);S.queue.push(e.id);S.recent=[e.id,...S.recent].slice(0,7)}
  }
}
function weekly(){
  S.weekHours=0;
  if(S.support){earn(S.support,'Asylum support');}
  const home=CITIES[S.city].homes.find(h=>h.id===S.home);
  const rent=married()?Math.round(home.rent/2):home.rent;
  if(rent===0){}else if(S.money>=rent){spend(rent,'Rent');S.rentStreak++;S.rentMissed=0;log(`Rent paid: ${gbp(rent)}${married()?' (your half)':''}.`,'good')}
  else{S.rentMissed++;S.rentStreak=0;log(`Couldn't pay rent (${gbp(rent)}). Warning ${S.rentMissed} of 3.`,'bad');if(S.rentMissed>=3)S.over='evicted'}
  if(S.debt>0){const p=Math.min(100,S.debt);if(S.money>=p){spend(p,'Repayment to Uncle Femi');S.debt-=p;if(S.debt<=0){msg('uncle','Debt cleared. Well done my son/daughter. Now you are a free person 😄');log('Uncle Femi is fully paid back!','good')}}else{add('pressure',15);msg('uncle','I did not see my £100 this week o. I hope all is well.')}}
  if(S.loan>0){const p=Math.min(150,S.loan);if(S.money>=p){spend(p,'Quick loan repayment');S.loan-=p}else{S.loan+=40;log('Missed a quick loan repayment. £40 late fee added.','bad')}}
  S.rich=S.rich.map(([n,w])=>[n,w*(1+rnd(-.02,.06))]);
}

/* ---------- WhatsApp ---------- */
const THREADS={biz:{name:'Business alerts',col:'#C9921B'},mummy:{name:'Mummy',col:'#C24E36'},family:{name:'Family group',col:'#6A2C91'},gang:{name:'Japa Gang',col:'#08774C'},uncle:{name:'Uncle Femi',col:'#475569'}};
function threadName(id){return THREADS[id]?.name||NPCS[id]?.name||id}
function msg(th,text,key){
  if(!S.chats[th])S.chats[th]={msgs:[],unread:0};
  S.chats[th].msgs.push({me:false,text,t:`${DAYS[dow()]} ${hhmm(S.hour)}`,key:key||null,done:!key});
  S.chats[th].msgs=S.chats[th].msgs.slice(-30);
  S.chats[th].unread++;
}
const unread=()=>Object.values(S.chats).reduce((a,c)=>a+c.unread,0);
const WA={
  mummyMoney:{opts:['Send £50','Send £100','"Next week, Mummy"'],fx:i=>{
    if(i<2){const a=i?100:50;if(S.money<a){add('pressure',8);return{me:'Mummy, money is tight this week 🙏',reply:'Ok. Take care of yourself first.'}}
      spend(a,'Sent to Mummy');S.sentHome+=a*S.rate;add('pressure',i?-30:-18);return{me:`Sent ${gbp(a)} Mummy ❤️`,reply:'God will bless you my child 🙏🙏🙏'}}
    add('pressure',10);return{me:'Next week Mummy, I promise',reply:"Ok o. Don't forget your mother."}}},
  owambeInvite:{opts:['"I dey come!"','"Can\'t make it"'],fx:i=>{if(!i){S.flags.going=true;add('social',5);return{me:'I dey come! 💃🏾',reply:"Oya! Get your aso ebi from the market before Saturday."}}add('social',-3);return{me:"Can't make it this time",reply:'Ehn, you don japa from us too? 😂'}}},
  hang:{opts:['"Sure, let\'s link up"','"Next time"'],fx:(i,th)=>{if(!i){rel(th,8);add('social',8);return{me:"Sure! Let's link up 🙌🏾",reply:'Sharp. See you around.'}}rel(th,-2);return{me:'Next time, I promise',reply:'No wahala.'}}},
  familyPic:{opts:['❤️','"Miss you all"'],fx:i=>{add('homesick',i?-8:-4);add('pressure',-4);return{me:i?'Miss you all 😭❤️':'❤️❤️❤️',reply:i?'We miss you more. Come home for Christmas!':'😘'}}}};
function replyWA(th,idx){
  const c=S.chats[th];const m=c.msgs.find(x=>x.key&&!x.done);if(!m)return;
  m.done=true;const r=WA[m.key].fx(idx,th);
  c.msgs.push({me:true,text:r.me,t:`${DAYS[dow()]} ${hhmm(S.hour)}`,done:true});
  if(r.reply)c.msgs.push({me:false,text:r.reply,t:`${DAYS[dow()]} ${hhmm(S.hour)}`,done:true});
}
function dailyChats(){
  if(Math.random()<.3)msg('mummy',pick(['My dear, how is the cold? Are you eating well?',"Your father's pressure medicine has finished. Can you send small money?",'Mrs Adebayo\'s son just bought a car. How is your own work going?']),'mummyMoney');
  else if(Math.random()<.25)msg('family',pick(['📷 Grandma\'s 80th birthday photos','📷 Your sister\'s graduation pictures','📷 Sunday rice at home. You are missing o!']),'familyPic');
  if(dow()===3)msg('gang','Owambe this Saturday! Sade\'s cousin\'s wedding. Colour is champagne gold. Who dey come?','owambeInvite');
  const friends=Object.keys(S.npcs).filter(id=>S.npcs[id].rel>=25&&!NPCS[id].aunty);
  if(friends.length&&Math.random()<.35){const id=pick(friends);msg(id,pick(['How far? Long time.','You free this week? Let\'s link up.','Saw this and thought of you 😂']),'hang')}
}

/* ---------- jobs ---------- */
function jobTitle(){return S.track?TRACKS[S.track].titles[S.level]:'Unemployed'}
function payRate(night){if(!S.track)return 0;let p=TRACKS[S.track].pay[S.level];if(dow()>=5)p*=1.25;if(night)p*=has('nightowl')?1.35:1.2;if(has('hustler'))p*=1.1;return r2(p)}
const maxLevel=()=>TRACKS[S.track].titles.length-1;
function promoNeeds(){
  if(!S.track||S.level>=maxLevel())return null;
  const L=S.level,sk=TRACKS[S.track].skill;
  const need={xp:PROMO_XP[L],skill:PROMO_SKILL[L],sk};
  return need;
}
function canSwitch(){return true}
function applyJob(track){
  if(S.workBan)return 'You can\'t work while your asylum claim is being decided.';
  if(track===S.track)return 'That is already your job.';
  if(S.visa==='graduate'&&track==='care'){}
  const refs=Object.keys(S.npcs).filter(id=>S.npcs[id].rel>=60).length;
  const ch=.35+S.skills[TRACKS[track].skill]*.06+refs*.08+(S.fresh?.08:0);
  advance(1);
  if(Math.random()<ch){
    const old=S.track||S.prevTrack;S.track=track;S.level=0;S.xp=0;if(S.sponsorless){S.sponsorless=0;add('pressure',-20)}
    log(`New job: ${jobTitle()}!`,'good');
    add('fun',15);return null;
  }
  add('fun',-6);return pick(['They went with someone else. Keep applying.','"We went with an internal candidate."','No reply. Recruiters dey ghost.']);
}

/* ---------- actions ---------- */
const ACTS=[];
const A=o=>ACTS.push(o);
const inHotel=()=>CITIES[S.city].homes.find(h=>h.id===S.home)?.hotel;
const meterBlock=()=>(inHotel()&&'No kitchen in the hotel. Meals are served at set times')||(S.meterOff&&'Electric meter has run out. Top it up first');
// home
A({id:'sleep',at:'home',label:'Sleep till 7:00',item:()=>own('bed')?'bed':'mattress',emote:'💤',h:()=>sleepHours(),sleep:true,sub:()=>own('bed')?'Proper bed. Deep rest':'Floor mattress. It does the job',run:()=>pick(['You slept like a baby.','Slept well, until the neighbour\'s alarm.','Dreamt about Mummy\'s pepper soup.'])});
A({id:'nap',at:'home',label:'Take a nap',item:()=>own('sofa')?'sofa':own('bed')?'bed':'mattress',emote:'💤',h:2,sleep:true,sub:'2 hours',run:()=>{if(own('sofa'))add('fun',6);return 'Power nap. Much better.'}});
A({id:'loo',at:'home',label:'Use the loo',spot:'loo',emote:'🚽',h:.25,run:()=>{S.needs.bladder=100;return 'Relief.'}});
A({id:'shower',at:'home',label:'Baff',sub:'Shower and shea butter',spot:'loo',emote:'🚿',h:.5,run:()=>{const shared=CITIES[S.city].homes.find(h=>h.id===S.home).shared;if(shared&&Math.random()<.3){advance(.5);S.needs.hygiene=100;return 'Your flatmate was in the shower for 40 minutes. Eventually: fresh.'}S.needs.hygiene=100;return 'Fresh. Shea butter applied.'}});
A({id:'jollof',at:'home',label:'Cook party jollof',sub:'Uses 1 bag of ingredients',item:'cooker',emote:'🍲',h:1.5,cond:()=>meterBlock()||(S.ingredients<1&&'Buy ingredients at the market first'),run:()=>{S.ingredients--;const q=S.skills.cooking;add('hunger',55);add('homesick',-25);add('fun',4+q*2);skill('cooking',.5);return q>=5?'Smoky, perfect party jollof. The whole stairwell is jealous.':q>=2?'Solid jollof. A bit of bottom pot, which is the best part.':'The jollof is... edible. Practice makes perfect.'}});
A({id:'egusi',at:'home',label:'Egusi and pounded yam',sub:'Uses 2 bags. Needs cooking 3',item:'cooker',emote:'🥘',h:2,cond:()=>meterBlock()||(S.skills.cooking<3?'Needs cooking skill 3':S.ingredients<2&&'Needs 2 bags of ingredients'),run:()=>{S.ingredients-=2;add('hunger',75);add('homesick',-45);add('fun',15);skill('cooking',.6);return 'Egusi and pounded yam. You called Mummy on video just to show her.'}});
A({id:'indomie',at:'home',label:'Indomie and egg',sub:'Quick and cheap',item:'cooker',emote:'🍜',h:.5,cost:1.5,cond:meterBlock,run:()=>{add('hunger',30);add('homesick',-5);skill('cooking',.1);return 'Indomie and egg. Uni days all over again.'}});
A({id:'meter',at:'home',label:'Top up the electric meter',sub:'Prepayment key',spot:'loo',emote:'🔌',h:.5,cost:20,cond:()=>!S.meterOff&&'The meter is fine',run:()=>{S.meterOff=false;return 'Lights back on. Cooker back on.'}});
A({id:'nolly',at:'home',label:'Watch Nollywood',item:()=>own('tv')?'tv':'chair',emote:'📺',h:2,sub:()=>own('tv')?'On the big screen':'On your phone',cond:meterBlock,run:()=>{add('fun',(own('tv')?30:16)*(has('homebody')?1.3:1));add('homesick',-8);return pick(['The twist at the end? Ah.','Two hours of village drama. Worth it.','You shouted at the screen. Twice.'])}});
A({id:'football',at:'home',label:'Watch the football',sub:'Premier League on TV',item:'tv',emote:'⚽',h:2,cond:()=>meterBlock()||(!own('tv')&&'Buy a TV first'),run:()=>{add('fun',(has('football')?44:22));return pick(['Last-minute winner! You woke the whole block.','0–0. Two hours you will never get back.','Your team lost. Emeka is already texting.'])}});
A({id:'hotelmeal',at:'home',label:'Hotel meal',sub:'Served 12:00 to 14:00 and 17:00 to 19:00',spot:'door',emote:'🍽️',h:.75,cond:()=>!inHotel()?'Only in the hotel':!((S.hour>=12&&S.hour<14)||(S.hour>=17&&S.hour<19))&&'Meals are served 12:00 to 14:00 and 17:00 to 19:00',run:()=>{add('hunger',45);add('fun',-3);add('homesick',4);return pick(['Rice and something beige again.','Pasta. Again. You miss pepper.','You shared your secret bottle of pepper sauce with the table.'])}});
A({id:'call',at:'home',label:'Call Mummy on WhatsApp',sub:'Less homesick, less pressure',spot:'idle',emote:'📱',h:1,run:()=>{add('pressure',-15);add('social',12);add('homesick',-18);return 'Mummy prayed for you for 20 minutes straight.'}});
A({id:'study',at:'home',label:'Study for your career',sub:()=>own('desk')?'At your desk (faster)':'On the folding chair. Buy a desk to study faster',item:()=>own('desk')?'desk':'chair',emote:'📚',h:2,run:()=>{skill(S.track==='food'?'cooking':'career',own('desk')?.9:.6);add('fun',-8);add('energy',-6);return 'Study session done. Brain is full.'}});
A({id:'mirror',at:'home',label:'Practise small talk in the mirror',sub:'+ charisma',spot:'loo',emote:'🪞',h:1,run:()=>{skill('charisma',.5);return '"Lovely weather, isn\'t it?" You are getting there.'}});
A({id:'photos',at:'home',label:'Look at family photos',item:'photos',spot:'idle',emote:'🖼️',h:.25,cond:()=>!own('photos')&&'Buy a family photo wall',run:()=>{add('homesick',-12);add('fun',4);return 'Grandma\'s smile fixes everything.'}});
A({id:'dance',at:'home',label:'Afrobeats and dance',item:'speaker',emote:'💃🏾',h:1,cond:()=>!own('speaker')&&'Buy a speaker',run:()=>{add('fun',22);skill('fitness',.3);add('homesick',-6);return 'Burna Boy at full volume. The neighbours knocked. Worth it.'}});
A({id:'skits',at:'home',label:'Film skits',sub:'Brand deals pay once you get good',item:'ringlight',emote:'🎬',h:2,cond:()=>!own('ringlight')&&'Buy a ring light',run:()=>{add('fun',15);skill('charisma',.4);if(S.skills.charisma>=3){const e=Math.round(rnd(10,25)+S.skills.charisma*10);earn(e,'Skit brand deal');return `Your "African mum vs British weather" skit went viral. +${gbp(e)}.`}return 'Your skit got 340 views. Mummy shared it 12 times.'}});
A({id:'braid',at:'home',label:'Braid hair for clients',sub:'Side hustle',item:'chair',emote:'💇🏾',h:4,earn:()=>55,run:()=>{earn(55,'Braiding client');add('energy',-12);add('social',12);return 'Knotless braids done. Client says she will tag you.'}});
A({id:'chops',at:'home',label:'Small chops orders',sub:'Uses 1 bag. Side hustle',item:'cooker',emote:'🥟',h:3,earn:()=>48+Math.round(S.skills.cooking*4),cond:()=>meterBlock()||(S.ingredients<1&&'You need ingredients'),run:()=>{S.ingredients--;const e=48+Math.round(S.skills.cooking*4);earn(e,'Small chops order');skill('cooking',.3);return `Puff-puff and samosa for a naming ceremony. +${gbp(e)}.`}});

// everywhere outside
A({id:'vloo',at:['lounge','bar','karaoke','dayparty','retail','warehouse','mybiz','chicken','cafe','caribbean','market','office','carehome','kitchen','campus','library','church','hall','club','gym','pub','test','restaurant','fine','airport','salon'],label:'Use the loo',emote:'🚽',h:.25,run:()=>{S.needs.bladder=100;return 'Found the loo. Crisis averted.'}});
// market
A({id:'groceries',at:'market',label:'Buy ingredients',sub:()=>`Rice, plantain, crayfish, Maggi. +${own('freezer')?5:3} bags`,emote:'🛍️',h:1,cost:()=>price(18),run:()=>{S.ingredients+=own('freezer')?5:3;add('homesick',-6);add('social',4);return 'Aunty Bisi threw in an extra Maggi cube.'}});
A({id:'aso',at:'market',label:'Buy aso ebi',sub:'For Saturday\'s owambe',emote:'🧵',h:.5,cost:()=>price(45),cond:()=>S.asoEbi&&'You already have one ready',run:()=>{S.asoEbi=true;return 'Champagne gold aso ebi. The tailor says Friday. Tailor time, so maybe Saturday.'}});
A({id:'haggle',at:'market',label:'Haggle for fun',sub:'+ enjoyment',emote:'🗣️',h:.5,run:()=>{add('fun',8);skill('charisma',.2);return '"Ah ah, Aunty, this yam is £6? In this economy?"'}});
// salon
A({id:'cut',at:'salon',label:()=>['braids','locs','bun','gele'].includes(S.look.hair)?'Fresh braids':'Fresh fade',sub:'Look sharp for 3 days. People like you more',emote:'💈',h:1.5,cost:()=>price(25),run:()=>{S.fresh=3;add('hygiene',25);add('fun',10);add('social',8);return 'Clean. You keep checking yourself in shop windows.'}});
// work
function wcond(night){return()=>{
  if(!isWorkplace(here()))return 'This is not your workplace';
  if(S.workBan)return 'You can\'t work while your asylum claim is being decided';
  if(!S.track)return 'You need a job. Check the Jobs app';
  if(S.hoursCap&&S.weekHours+8>S.hoursCap)return `Student visa limit: ${S.hoursCap} hours a week`;
  if(S.workedToday)return 'You already worked today';
  if(night)return (S.hour<19||S.hour>22)&&'Night shifts start 19:00 to 22:00';
  const [a,b]=TRACKS[S.track].start||(S.track==='food'?[10,15]:[6,14]);
  return (S.hour<a||S.hour>b)&&`Shifts start between ${hhmm(a)} and ${hhmm(b)}`;
}}
const shiftLen=()=>8;
A({id:'shift',at:['office','carehome','kitchen','retail','warehouse','bar'],label:'Work a shift',sub:()=>`${shiftLen()} hours as ${jobTitle()}`,emote:'💼',h:()=>shiftLen(),cond:wcond(false),earn:()=>Math.round(payRate()*shiftLen()),
  run:()=>{const p=payRate()*shiftLen();earn(p,`Wages: ${jobTitle()}`);S.workedToday=true;S.xp++;S.weekHours+=shiftLen();skill(TRACKS[S.track].skill,.15);add('fun',-8);return `Shift done. +${gbp(p)}${dow()>=5?' (weekend rate)':''}.`}});
A({id:'night',at:['carehome','warehouse','office'],label:'Work a night shift',sub:()=>`8 hours · night rate${has('nightowl')?' · night owl bonus':''}`,emote:'🌙',h:8,cond:()=>(S.track&&S.track!=='care'&&!TRACKS[S.track].night)?'Your job has no night shifts':wcond(true)(),earn:()=>Math.round(payRate(true)*8),
  run:()=>{const p=payRate(true)*8;earn(p,'Night shift');S.workedToday=true;S.xp++;skill('career',.15);add('energy',has('nightowl')?-5:-15);return `Night shift done. Quiet ward, long night. +${gbp(p)}.`}});
A({id:'ot',at:['office','carehome','kitchen','retail','warehouse','bar'],label:'Pick up overtime',sub:'4 hours',emote:'⏱️',h:4,earn:()=>Math.round(payRate()*4),cond:()=>!isWorkplace(here())?'This is not your workplace':S.hoursCap?'Not allowed on a Student visa':!S.workedToday?'Do your main shift first':S.otToday?'One overtime block a day':S.hour>21&&'Too late for overtime',
  run:()=>{const p=payRate()*4;earn(p,'Overtime');S.otToday=true;S.xp+=.5;add('energy',-10);return `Overtime: +${gbp(p)}. Manager noticed.`}});
A({id:'promo',at:['office','carehome','kitchen','retail','warehouse','bar'],label:'Ask for a promotion',sub:()=>{const n=promoNeeds();if(!n)return 'You are at the top';return `Next: ${TRACKS[S.track].titles[S.level+1]} · ${gbp2(TRACKS[S.track].pay[S.level+1])}/hr`},emote:'📈',h:.5,
  cond:()=>!isWorkplace(here())?'This is not your workplace':!promoNeeds()&&'You are at the top already',
  run:()=>{const n=promoNeeds();const miss=[];if(S.xp<n.xp)miss.push(`${Math.ceil(n.xp-S.xp)} more shifts`);if(S.skills[n.sk]<n.skill)miss.push(`${n.sk} skill ${n.skill}`);
    if(miss.length)return `Manager: "You need ${miss.join(' and ')}."`;
    S.level++;S.xp=0;add('fun',25);S.queue.unshift('promoNews');
    return `Promoted to ${jobTitle()}!`}});
A({id:'cooler',at:['office','carehome','kitchen','retail','warehouse'],label:'Chat by the kettle',sub:'+ gist',emote:'☕',h:.5,run:()=>{add('social',12);skill('charisma',.15);return pick(['Talked about the weather for 20 minutes. Very British.','Someone brought in cake. Good day.','You explained what "japa" means. They loved it.'])}});
// campus + library
A({id:'study2',at:['campus','library'],label:'Study',sub:'Quiet, free wifi',emote:'📚',h:2,run:()=>{skill(S.track==='food'?'cooking':'career',.75);add('fun',-6);return 'Two hours of proper focus.'}});
A({id:'novel',at:'library',label:'Read a Chimamanda novel',sub:'+ enjoyment, - homesick',emote:'📖',h:1.5,run:()=>{add('fun',14);add('homesick',-8);return 'Half of a Yellow Sun. Again. Still hits.'}});
// church
A({id:'service',at:'church',label:'Sunday service',sub:'Praise, worship, jollof after',emote:'🙏🏾',h:3,cond:()=>dow()!==6&&'Service is on Sunday morning',run:()=>{const m=has('prayer')?1.5:1;add('social',30);add('pressure',-12*m);add('fun',10*m);add('homesick',-18);if(Math.random()<.4)S.queue.unshift('aunty');return 'Praise and worship went for 90 minutes. Jollof in the hall after.'}});
A({id:'choir',at:'church',label:'Choir practice',sub:'Wednesday evenings',emote:'🎶',h:2,cond:()=>dow()!==2&&'Choir is on Wednesday evening',run:()=>{add('social',20);add('fun',12);skill('charisma',.2);return 'You hit the high note. Chioma nodded. High praise.'}});
// hall
A({id:'owambe',at:'hall',label:'Party at the owambe',sub:'Needs aso ebi',emote:'🎉',h:5,cond:()=>!S.asoEbi&&'You need aso ebi. Buy it at the market',run:()=>{const m=has('owambe')?1.6:1;S.asoEbi=false;S.owambes++;add('social',45*m);add('fun',45*m);add('hunger',45);add('homesick',-35);add('energy',-15);peopleAt(here()).forEach(id=>rel(id,6));return pick(['You danced till your shoes gave up.','The DJ played Wizkid and the whole hall rose.','Ate small chops, jollof and a whole moi moi.'])}});
A({id:'spray',at:'hall',label:'Spray money on the couple',sub:'+ big gist',emote:'💸',h:.5,cost:20,run:()=>{add('social',20);add('fun',15);return 'You sprayed £20 in £1 coins. Sade says that is not how it works.'}});
// club
A({id:'dance2',at:'club',label:'Dance all night',sub:()=>`Entry ${here().entry?gbp(here().entry):'£15'} plus drinks · ${crowd(here())||''}`,emote:'🪩',h:3,cost:()=>price((here().entry||15)+12),run:()=>{add('fun',40);add('social',30);add('energy',-18);add('homesick',-10);peopleAt(here()).forEach(id=>rel(id,4));return pick(['DJ dropped Rema. Chaos.','You found the only Nigerian corner. Instant family.','Danced so hard you lost your coat ticket.'])}});
// gym + park
A({id:'workout',at:'gym',label:'Work out',sub:'+ fitness',emote:'🏋🏾',h:1.5,cost:5,run:()=>{skill('fitness',.6);add('fun',10);add('hygiene',-25);add('energy',-10);return 'Leg day. Stairs are now your enemy.'}});
A({id:'gymshower',at:'gym',label:'Shower at the gym',emote:'🚿',h:.5,run:()=>{S.needs.hygiene=100;return 'Fresh again.'}});
A({id:'jog',at:'park',label:'Go for a jog',sub:'+ fitness',emote:'🏃🏾',h:1,run:()=>{skill('fitness',.4);add('fun',10);add('hygiene',-20);return S.weather==='Drizzle'?'Jogged in the rain. Very British of you.':'Good run. The squirrels are not scared of anybody here.'}});
A({id:'ball',at:'park',label:'Sunday football with the guys',sub:'Sundays, 10:00 to 15:00',emote:'⚽',h:2,cond:()=>(dow()!==6||S.hour<10||S.hour>15)&&'Sunday football is 10:00 to 15:00',run:()=>{add('social',30);add('fun',30);skill('fitness',.4);peopleAt(here()).forEach(id=>rel(id,6));return 'Nigeria vs Ghana five-a-side. Nobody agrees on the score.'}});
A({id:'sit',at:'park',label:'Sit and people-watch',sub:'Free',emote:'🌳',h:1,run:()=>{add('fun',8);return S.weather==='Sunny spell'?'Sun is out. The whole city is in the park in shorts.':'A dog in a raincoat walked past. This country.'}});
// pub
A({id:'match',at:'pub',label:'Watch the match',sub:'Big screen',emote:'⚽',h:2,cost:()=>price(8),run:()=>{add('fun',has('football')?40:22);add('social',18);peopleAt(here()).forEach(id=>rel(id,3));return pick(['Emeka nearly fought a Spurs fan. Nearly.','Late goal, whole bar erupted.','You ordered a Guinness. The Nigerian kind is better.'])}});
// restaurants
const FOODV=['restaurant','fine','chicken','cafe','caribbean'];
const MENUV=[...FOODV,'lounge','bar'];
const NIGHTV=['club','lounge','bar','karaoke','dayparty'];
A({id:'vip',at:'club',label:'Book a VIP table',sub:'Bottles, sparklers, your name on the screen',emote:'🍾',h:3,cost:()=>price(180),run:()=>{add('fun',55);add('social',55);add('energy',-15);peopleAt(here()).forEach(id=>rel(id,10));S.flags.vip=(S.flags.vip||0)+1;return 'The sparklers came out and the DJ shouted your name. You are a celebrity tonight.'}});
A({id:'chill',at:'lounge',label:'Chill on the sofas',sub:'Afrobeats, low lights, good company',emote:'🛋️',h:1.5,run:()=>{add('fun',18);add('social',12);add('energy',4);return pick(['The DJ played old-school P-Square. Everybody sang.','You found the comfiest corner in the building.','Somebody\'s uncle started dancing alone. Respect.'])}});
A({id:'network',at:['lounge','bar'],label:'Network',sub:'Meet business people. Good for side hustles',emote:'🤝',h:1,run:()=>{skill('charisma',.3);add('social',10);if(Math.random()<.35+S.skills.charisma*.05){S.contacts=(S.contacts||0)+1;return pick(['You swapped numbers with an events organiser. More gigs incoming.','A restaurant owner wants to know if you do catering.','You met someone who runs three salons. Useful.'])}return 'Small talk, nice people, nothing concrete. Yet.'}});
A({id:'afterwork',at:'bar',label:'After-work drinks',sub:'Cocktails with a view',emote:'🍹',h:1.5,cost:()=>price(14),run:()=>{add('fun',20);add('social',22);peopleAt(here()).forEach(id=>rel(id,3));return S.hour>=18&&S.hour<20?'Sunset over the city. Okay, the UK is beautiful sometimes.':'Cold drinks, warm gist.'}});
A({id:'sing',at:'karaoke',label:'Sing on the mic',sub:'Charisma check',emote:'🎤',h:.5,run:()=>{if(Math.random()<.4+S.skills.charisma*.07){add('fun',28);add('social',18);skill('charisma',.3);return pick(['You sang Essence and the whole room joined in.','Standing ovation for your Asa cover.','Someone filmed you. You are going viral in the group chat.'])}add('fun',6);return 'You forgot the second verse. The crowd sang it for you. Love.'}});
A({id:'krtable',at:'karaoke',label:'Get a table',sub:'Entry and a round of drinks',emote:'🎶',h:2,cost:()=>price(18),run:()=>{add('fun',22);add('social',22);peopleAt(here()).forEach(id=>rel(id,4));return 'You sang backup on every song. Nobody asked.'}});
A({id:'sun',at:'dayparty',label:'Dance in the sun',sub:'Amapiano all afternoon',emote:'🔊',h:4,cost:()=>price(here().entry||20),run:()=>{add('fun',45);add('social',35);add('energy',-15);add('homesick',-10);peopleAt(here()).forEach(id=>rel(id,5));return pick(['The log drum hit and the whole field moved.','You learned three new dances. Your knees disagree.','Sunburn in the UK. Who knew.'])}});
A({id:'menu',at:MENUV,label:'Order food',sub:()=>{const v=here();return v.type==='fine'?`${v.dish} · ${gbp(price(v.cost))}`:menuOf(v).slice(0,3).map(k=>DISHES[k].n).join(', ')+'…'},emote:'🍛',h:0,menu:true,cond:()=>!isOpen(here().type)&&'Closed right now'});
A({id:'invite',at:[...FOODV,...NIGHTV,'pub','park','gym'],label:'Invite friends to join you',sub:()=>{const f=friendsFree();return f.length?`${f.length} friend${f.length>1?'s':''} might come`:'Make some friends first'},emote:'📲',h:0,invite:true,cond:()=>!friendsFree().length&&'Make some friends first. Talk to people around town'});
function menuOf(v){if(v.type==='fine')return ['tasting'];return MENUS[v.rid||v.type]||['jollof']}
function dishPrice(k,v){return k==='tasting'?price(v.cost):price(DISHES[k].p)}
function friendsFree(){const here_=peopleAt(here());return Object.keys(S.npcs).filter(id=>S.npcs[id].met&&S.npcs[id].rel>=8&&!here_.includes(id)&&!NPCS[id].aunty)}
function orderDish(k){
  const v=here(),D=DISHES[k],p=dishPrice(k,v);
  if(S.money<p)return 'Not enough money.';
  spend(p,`${D.n} at ${v.name}`);advance(D.drink?.25:v.type==='fine'?3:1);
  add('hunger',D.h);add('fun',D.f);add('social',6);if(D.naija)add('homesick',-12);
  const first=!S.dishes[k];S.dishes[k]=(S.dishes[k]||0)+1;
  if(v.rid)S.visited[v.rid]=(S.visited[v.rid]||0)+1;
  const comp=peopleAt(v);comp.forEach(id=>rel(id,D.drink?2:5));
  checkGoals();
  return `${D.n}${first?' (first time!)':''}. ${pick(D.drink?['Refreshing.','Ice cold. Perfect.']:comp.length?[`You shared bites with ${NPCS[comp[0]].name}.`,'Good food, better company.']:['It hit the spot.','Delicious.','You licked the plate. Nobody saw.'])}`;
}
function inviteFriends(ids){
  const v=here();
  const came=ids.filter(id=>Math.random()<.45+S.npcs[id].rel/150);
  advance(.5);
  if(!came.length){add('fun',-4);return 'Nobody could make it this time. Next time.'}
  S.company={at:v.id,ids:came,day:S.day,until:Math.min(23.9,S.hour+3)};
  came.forEach(id=>rel(id,4));add('social',10);
  return `${came.map(id=>NPCS[id].name).join(' and ')} came to join you!`;
}
A({id:'host',at:'home',label:'Host dinner for friends',sub:'Uses 3 bags. Your friends come over',spot:'door',emote:'🍽️',h:3,cond:()=>meterBlock()||(S.ingredients<3?'Needs 3 bags of ingredients':friendsFree().length<1&&'Make some friends first'),
  run:()=>{S.ingredients-=3;const g=friendsFree().sort((a,b)=>S.npcs[b].rel-S.npcs[a].rel).slice(0,3);g.forEach(id=>rel(id,10));add('social',45);add('fun',30);add('hunger',50);skill('cooking',.6);S.hosted=(S.hosted||0)+1;
    return `${g.map(id=>NPCS[id].name).join(', ')} came over. Jollof, music, and gist till midnight.`}});
A({id:'order',at:'home',label:'Order food delivery',sub:'Jollof to your door in 40 minutes',spot:'door',emote:'🛵',h:.75,cost:()=>price(16),run:()=>{add('hunger',60);add('fun',8);add('homesick',-8);S.dishes.delivery=(S.dishes.delivery||0)+1;return 'The rider called you "boss". The jollof was still hot.'}});
// test centre
// airport
A({id:'fly',at:'airport',label:'Fly home to Lagos for 5 days',sub:'Return flight and gifts for everybody',emote:'✈️',h:120,away:true,cost:860,run:()=>{S.homesick=0;add('pressure',-40);S.needs.fun=100;S.needs.social=100;S.needs.hunger=90;S.needs.energy=70;S.flags.flewHome=true;return 'Five days of Lagos. Jollof, family, traffic and love. You came back with 4 jars of pepper.'}});

/* ---------- events ---------- */
const EVENTS=[
 {id:'bigorder',manual:true,title:'Big order!',body:()=>{const n=S.biz.type==='chops'?40:12;return `${pick(['Aunty Sade','A church women\'s group','An office party organiser'])} wants ${n} ${BIZ[S.biz.type].unit}s for Saturday, at full price plus a tip. You have ${S.biz.stock} in stock.`},choices:[
   {l:'Accept the order',s:'Needs enough stock',fx:()=>{const n=S.biz.type==='chops'?40:12;if(S.biz.stock<n){S.biz.rep=clamp(S.biz.rep-6,5,100);return 'You did not have enough stock. They went elsewhere and told everyone.'}S.biz.stock-=n;const p=Math.round(n*BIZ[S.biz.type].price[1]*1.15);earn(p,'Big order');S.biz.rep=clamp(S.biz.rep+6,5,100);S.biz.total=r2(S.biz.total+p);return `Delivered on time. +${gbp(p)}. They are already talking about the next one.`}},
   {l:'Turn it down',s:'',fx:()=>'Maybe next time.'}]},
 {id:'cos_first',manual:true,title:'First shift',body:()=>`Your manager shows you around. The work is hard and the British accents are fast, but your colleague Grace says, "You'll be fine, darling." Your first wage slip will feel like magic.`,choices:[
   {l:'Give it your all',s:'+ career skill',fx:()=>{skill(TRACKS[S.track].skill,.4);S.npcs.grace.met=true;rel('grace',12);return 'Grace is now your favourite person at work.'}},
   {l:'Ask lots of questions',s:'+ charisma',fx:()=>{skill('charisma',.4);S.npcs.grace.met=true;rel('grace',8);return 'Your manager says you are "very keen". Good sign.'}}]},
 {id:'cos_nojob',manual:true,title:'The job that wasn\'t',body:()=>'The company the agent used has no work for you and stops replying. Your visa is tied to a sponsor that has nothing for you. You need a genuine employer, fast.',choices:[
   {l:'Search for a new sponsor today',s:'Use the Jobs app on your phone',fx:()=>{add('pressure',15);add('fun',-15);return 'You updated your CV at 2am. Apply in the Jobs app.'}},
   {l:'Call a migrant advice charity first',s:'Get proper advice, then search',fx:()=>{add('pressure',5);skill('charisma',.2);return 'The adviser explains your options and that you did nothing wrong. Now: the Jobs app.'}}]},
 {id:'stu_lecture',manual:true,title:'First lecture',body:()=>'The lecturer speaks fast and calls everyone by their first name. Nobody stands up when she walks in. Amara whispers, "Relax, this is how they do it here."',choices:[
   {l:'Sit in the front row',s:'+ career skill',fx:()=>{skill('career',.5);return 'You asked a question. The lecturer remembered your name.'}},
   {l:'Sit with the Naija crew',s:'+ gist',fx:()=>{add('social',20);rel('amara',8);return 'You now have a WhatsApp group called "Naija MSc 🇳🇬".'}}]},
 {id:'stu_grad',manual:true,title:'Graduation day 🎓',body:()=>'Gown, cap, and your family screaming on a video call from Ibadan. Your Masters is done. You can now work full time.',choices:[
   {l:'Celebrate properly',s:'+ big joy',fx:()=>{S.hoursCap=0;S.visaLabel='Graduate visa';add('fun',50);add('pressure',-30);S.storyQ.push({day:S.day+3,id:'grad_job'});return 'Mummy posted your photo on every platform she has.'}}]},
 {id:'grad_job',manual:true,title:'Time for a proper job',body:()=>'Your part-time kitchen hours are over. Apply for a full-time role in the Jobs app, or stay in the kitchen and work your way up.',choices:[
   {l:'Got it',s:'',fx:()=>'The future is wide open.'}]},
 {id:'asy_interview',manual:true,title:'Your asylum interview',body:()=>'A small room, an interpreter, and an officer typing everything you say. They ask about your journey, and why you cannot go back.',choices:[
   {l:'Tell everything, even the hard parts',s:'Painful, but complete',fx:()=>{add('fun',-20);add('pressure',-10);S.storyQ.push({day:S.day+7,id:'asy_decision'});return 'You cried twice. The officer said, "Thank you. Take your time." You did.'}},
   {l:'Keep it short',s:'Easier today',fx:()=>{add('fun',-8);S.storyQ.push({day:S.day+14,id:'asy_more'});return 'It was over quickly. You hope it was enough.'}}]},
 {id:'asy_more',manual:true,title:'More questions',body:()=>'A letter: the Home Office needs more detail about your claim. Chioma helps you find a free legal adviser.',choices:[
   {l:'Go through it properly this time',s:'',fx:()=>{add('fun',-10);rel('chioma',8);S.storyQ.push({day:S.day+5,id:'asy_decision'});return 'This time you told them everything. Chioma waited outside with tea.'}}]},
 {id:'asy_decision',manual:true,title:'The letter',body:()=>'A brown envelope. Your hands are shaking. "You have been granted refugee status." You can work now, and you have 28 days to leave the hotel and find a home.',choices:[
   {l:'Call Mummy',s:'Then find a place to live',fx:()=>{S.workBan=false;S.support=0;S.visaLabel='Refugee status';add('fun',60);add('pressure',-40);add('homesick',-20);S.storyQ.push({day:S.day+1,id:'asy_home'});msg('mummy','GOD HAS DONE IT!!! 🙏🏾🙏🏾🙏🏾 My child, I am dancing in the compound right now.');return 'Mummy screamed so loud the neighbours came running.'}}]},
 {id:'asy_home',manual:true,title:'Finding a home',body:()=>'The council and a refugee charity help you look. Which place will you take? You can then apply for jobs in the Jobs app.',choices:[
   {l:'A shared room',s:'Cheaper',fx:()=>{const h=CITIES[S.city].homes.find(h=>!h.hotel&&h.shared);S.home=h.id;S.at='home';CM=null;anim.reset=true;return `You moved into a ${h.name}. It's small. It's yours.`}},
   {l:'A studio flat',s:'Your own space, higher rent',fx:()=>{const h=CITIES[S.city].homes.find(h=>!h.hotel&&!h.shared);S.home=h.id;S.at='home';CM=null;anim.reset=true;return `You moved into a ${h.name}. You put your one plate on the shelf and smiled.`}}]},
 {id:'cousin',title:'Cousin Bayo wants to "come and stay small"',body:()=>'He is visiting the UK. "Small" usually means three weeks.',choices:[
   {l:'Let him stay',s:'+ gist, - £40, family happy',fx:()=>{spend(Math.min(40,Math.max(0,S.money)),'Feeding Cousin Bayo');add('social',20);add('pressure',-15);return 'Bayo is on your floor. He has already finished the jollof.'}},
   {l:'Point him to a hostel',s:'Family will hear about this',fx:()=>{add('pressure',15);return 'Your aunty in Lagos already knows.'}}]},
 {id:'aunty',manual:true,title:'An aunty corners you after church',body:()=>'"So when are you bringing someone home? Your mates are having their second child."',choices:[
   {l:'Laugh it off',s:'- enjoyment',fx:()=>{add('fun',-6);return 'She has added you to her prayer list.'}},
   {l:'"I\'m focusing on my career, Ma"',s:'+ home pressure',fx:()=>{add('pressure',6);return '"Career will not keep you warm," she said.'}}]},
 {id:'kwame',when:()=>!S.flags.jollofWin,title:'Kwame says Ghana jollof is better',body:()=>'He said it in the block WhatsApp group. In front of everybody.',choices:[
   {l:'Cook-off. Bring it.',s:'Needs 1 bag of ingredients. Cooking skill helps',fx:()=>{if(S.ingredients<1){add('fun',-5);return 'No ingredients. Kwame is calling it a forfeit.'}S.ingredients--;if(Math.random()<.4+S.skills.cooking*.1){S.flags.jollofWin=true;rel('kwame',12);add('fun',20);return 'The block voted. Naija jollof wins. Kwame asked for the recipe.'}rel('kwame',6);add('fun',-8);return 'Kwame won this round. Practise and challenge him again.'}},
   {l:'Agree for peace',s:'Your pride...',fx:()=>{rel('kwame',3);return 'You agreed. You did not mean it.'}}]},
 {id:'birthday',title:'Birthday dinner invite',body:()=>`${NPCS[pick(['tobi','amara','grace','sade'])].name} is having a birthday dinner at a Nigerian restaurant tonight. It's £25 a head.`,choices:[
   {l:'Go',s:'- £25, big gist',fx:()=>{if(S.money<25)return 'You checked your balance and stayed home.';spend(25,'Birthday dinner');advance(3);add('social',40);add('fun',30);add('hunger',60);Object.keys(S.npcs).filter(id=>S.npcs[id].met).forEach(id=>rel(id,3));return 'Three hours of jollof, cake and loud singing. The waiters joined in.'}},
   {l:'Send a voice note instead',s:'',fx:()=>{add('social',-4);return 'Your voice note was 4 minutes long. They loved it.'}}]},
 {id:'groupchat',title:'Group chat drama',body:()=>'Two people in the Japa Gang group are arguing about whose wedding had better food. Everyone is waiting for you to pick a side.',choices:[
   {l:'Stay neutral',s:'Peacemaker',fx:()=>{skill('charisma',.3);return 'You posted a GIF of two goats. Peace was restored.'}},
   {l:'Pick a side',s:'+ gist, someone is vexed',fx:()=>{add('social',10);add('fun',8);return 'The argument went on until 2am. Iconic.'}}]},
 {id:'payday',when:()=>S.track,title:'Payday treat?',body:()=>'Your wages just landed. Your colleagues are going out for food after work.',choices:[
   {l:'Treat yourself',s:'- £20, + enjoyment',fx:()=>{if(S.money<20)return 'Payday came and went. Sapa.';spend(20,'Payday treat');add('fun',25);add('social',20);add('hunger',40);return 'Suya, Chapman and gist. Payday energy.'}},
   {l:'Save it',s:'',fx:()=>'Your future self says thank you.'}]},
 {id:'strike',title:'Train strike tomorrow',body:()=>'No trains. The buses will be packed.',choices:[
   {l:'Work from home if you can',s:'',fx:()=>{add('fun',4);return 'You planned around it like a true local.'}},
   {l:'Moan about it',s:'Very British',fx:()=>{add('fun',-3);add('social',5);return 'You moaned with a stranger at the bus stop. You are now friends.'}}]},
 {id:'neighbour',title:"Neighbour's house party",body:()=>'The flat upstairs is playing Afrobeats very loudly. On a Tuesday.',choices:[
   {l:'Join them',s:'+ fun, - energy',fx:()=>{advance(2);add('fun',30);add('social',25);add('energy',-15);return 'You went up to complain and ended up leading the conga line.'}},
   {l:'Earplugs and sleep',s:'',fx:()=>{add('energy',-5);return 'You fell asleep humming the song.'}}]},
 {id:'credit',when:()=>!S.flags.credit,title:'Phone contract refused',body:()=>'"Not enough credit history." Annoying.',choices:[
   {l:'Get a credit-builder card',s:'Pay it off in full every month',fx:()=>{S.flags.credit=true;return 'Card ordered. Slowly but surely.'}},
   {l:'Stay on pay-as-you-go',s:'',fx:()=>{add('fun',-5);return 'Pay-as-you-go it is. For now.'}}]},
 {id:'name',manual:true,title:'Your name, again',body:()=>`A colleague has called you "${S.name.slice(0,2)}…something" for three weeks.`,choices:[
   {l:'Teach them to say it',s:'+ enjoyment',fx:()=>{add('fun',10);skill('charisma',.3);return `By Friday the whole team says "${S.name}" right.`}},
   {l:'Let it go',s:'- enjoyment',fx:()=>{add('fun',-8);return 'You answered to the wrong name all week.'}}]},
 {id:'bump',manual:true,title:'Bumped into an old friend',body:()=>'Someone from your secondary school is on the same bus. Twenty years later.',choices:[
   {l:'Catch up properly',s:'+ big gist, 1 hour',fx:()=>{advance(1);add('social',30);add('fun',15);return 'You exchanged numbers and every gist from the class of 2006.'}},
   {l:'Wave and keep moving',s:'',fx:()=>'You waved. They waved. Classic.'}]},
 {id:'busker',manual:true,title:'A busker is playing Fela',body:()=>'On a cold street corner, someone is playing "Water No Get Enemy" on a saxophone.',choices:[
   {l:'Drop £2 and dance a bit',s:'- £2, + enjoyment',fx:()=>{spend(2,'Busker');add('fun',15);return 'A small crowd joined you. A tourist filmed it.'}},
   {l:'Smile and walk on',s:'',fx:()=>{add('fun',4);return 'It stayed in your head all day.'}}]},
 {id:'lostcard',manual:true,title:'Lost your bank card',body:()=>'It is not in any of your pockets. Or your bag. Or the other bag.',choices:[
   {l:'Freeze it on the app',s:'',fx:()=>'Frozen. New card in 3 days. You found the old one an hour later.'},
   {l:'Panic first',s:'- enjoyment',fx:()=>{add('fun',-8);return 'It was in your jacket the whole time.'}}]},
 {id:'winter',when:()=>!S.flags.coat,title:'Dark at 4pm',body:()=>'Proper winter. No sun, no energy, and the cold is in your bones.',choices:[
   {l:'Buy a proper coat and vitamin D',s:'- £40. Cold snaps hurt less',fx:()=>{if(S.money<40)return 'Not enough money yet. Layers it is.';spend(40,'Winter coat and vitamin D');S.flags.coat=true;return 'Puffer jacket and thermal socks. Toasty.'}},
   {l:'Tough it out',s:'',fx:()=>{add('fun',-8);return 'Your leather jacket is not built for this.'}}]},
 {id:'lonely',title:'Saturday night, quiet room',body:()=>'Everyone is out at a party you can see on Instagram.',choices:[
   {l:'Video call old friends',s:'+ gist',fx:()=>{add('homesick',-15);add('social',15);advance(1);return 'Two hours of gist. Same jokes as secondary school.'}},
   {l:'Message the Japa Gang',s:'+ gist',fx:()=>{add('social',20);return 'The gang sent 140 messages and a voice note from Emeka.'}}]},
 {id:'meter',manual:true,title:'The lights just went off',body:()=>'Your prepayment electric meter has run out. No cooker, no TV.',choices:[
   {l:'Top up now',s:'- £20',fx:()=>{if(S.money<20){S.meterOff=true;return 'Not enough money. Candles it is. Top up at home later.'}spend(20,'Electric meter top-up');return 'Topped up on the app. NEPA could never.'}},
   {l:'Deal with it later',s:'Top up at home',fx:()=>{S.meterOff=true;return 'Darkness. Very nostalgic, actually.'}}]},
 {id:'broke',manual:true,title:'Money is finished',body:()=>'Rent is coming and your account is nearly empty.',choices:[
   {l:'Ask the church welfare team',s:'+ £60',fx:()=>{earn(60,'Church welfare support');add('social',10);return 'The pastor\'s wife slipped you £60 and a plate of rice.'}},
   {l:'Take a quick loan',s:'+ £500, repay £150 a week for 4 weeks',fx:()=>{if(S.loan>0)return 'You already have a loan. They said no.';earn(500,'Quick loan');S.loan=600;return 'Money landed in minutes. Paying it back will hurt.'}},
   {l:'Pick up extra shifts',s:'Hustle mode',fx:()=>{add('pressure',5);return 'You told your manager you can cover anything this week.'}}]},
 {id:'promoNews',manual:true,title:'Promotion!',body:()=>`You are now ${jobTitle()}. New pay: ${gbp2(TRACKS[S.track].pay[S.level])} an hour.`,choices:[
   {l:'Tell the family group chat',s:'Home pressure drops',fx:()=>{add('pressure',-20);add('social',15);return '47 messages of congratulations. Two asked for money.'}},
   {l:'Celebrate with friends',s:'+ gist',fx:()=>{add('social',20);add('fun',15);return 'Small chops and Chapman on you. Everyone was happy.'}}]},
 {id:'wedding',manual:true,title:'Wedding day!',body:()=>`You married ${NPCS[S.partner].name} at the Royal Event Hall. 300 guests, 4 jollof coolers, and Aunty Bisi cried the whole time.`,choices:[
   {l:'Dance into married life',s:'Your partner now pays half the rent',fx:()=>'The owambe of the year.'}]},
];

/* ---------- new game ---------- */
function newGame(c){
  const lot=LOTTERY.find(l=>l.id===c.lottery)||LOTTERY[1];
  return {name:c.name,look:{skin:c.skin,hair:c.hair,fabric:c.fabric},traits:c.traits,dream:c.dream,lottery:lot.id,pid:Math.random().toString(36).slice(2,10),
    city:c.city,home:c.home,at:'home',day:1,hour:7,money:lot.money,debt:lot.debt,loan:0,
    needs:{hunger:70,energy:85,hygiene:75,bladder:80,fun:60,social:45},homesick:30,pressure:20,
    skills:{cooking:1,career:1,fitness:1,charisma:1},
    visa:'none',track:c.track,level:0,xp:0,workedToday:false,otToday:false,weekHours:0,
    furn:['mattress','cooker','fridge','chair'],ingredients:2,asoEbi:false,meterOff:false,fresh:0,
    npcs:Object.fromEntries(Object.keys(NPCS).map(k=>[k,{rel:k==='tobi'?20:0,met:k==='tobi',stage:null,since:0,lastLoan:-99,lastDate:-99,known:{},msgDay:0,msgs:0}])),
    partner:null,wedding:0,sentHome:0,owambes:0,rentStreak:0,rentMissed:0,rate:2050,weather:'Drizzle',visited:{},dishes:{},hosted:0,company:null,
    lastNrpf:-99,flags:{},goals:{},queue:[],recent:[],log:[],tx:[],chats:{},rich:RICH0.map(x=>[...x]),over:null,muted:{}};
}

/* ---------- goals ---------- */
const GOALS=[
  ['rent','Pay rent 4 weeks in a row',()=>S.rentStreak>=4],
  ['dishes5','Try 5 different dishes',()=>Object.keys(S.dishes).filter(k=>DISHES[k]).length>=5],
  ['eats3','Eat at 3 Nigerian restaurants',()=>Object.keys(S.visited).filter(k=>S.visited[k]>0&&MENUS[k]).length>=3],
  ['friends3','Make 3 good friends',()=>Object.values(S.npcs).filter(n=>n.rel>=50).length>=3],
  ['likes','Learn what 5 people love talking about',()=>Object.values(S.npcs).filter(n=>Object.values(n.known||{}).includes(1)).length>=5],
  ['host','Host a dinner at home',()=>S.hosted>=1],
  ['owambe','Party at 2 owambes',()=>S.owambes>=2],
  ['jollof','Win the jollof war with Kwame',()=>!!S.flags.jollofWin],
  ['flat','Own 4 new pieces of furniture',()=>S.furn.filter(k=>!FURN[k].start).length>=4],
  ['promo','Reach level 3 in your career',()=>S.track&&S.level>=2],
  ['live','Chat with a real player',()=>!!S.flags.liveChatted],
];
function dreamProgress(){
  switch(S.dream){
    case 'foodie':return Math.min(1,Object.keys(S.dishes).filter(k=>DISHES[k]).length/15);
    case 'social':return Math.min(1,Object.values(S.npcs).filter(n=>n.rel>=50).length/5);
    case 'top':return S.track?S.level/4:0;
    case 'rich':{const r=myRank();return r<=3?1:Math.max(0,1-(r-3)/8)}
    case 'family':{if(!S.partner)return Math.min(.3,Math.max(0,...Object.values(S.npcs).map(n=>n.rel))/100*.3);const st=S.npcs[S.partner].stage;return st==='married'?1:st==='engaged'?.75:.5}
  }return 0;
}
function checkGoals(){
  GOALS.forEach(([id,l,t])=>{if(!S.goals[id]&&t()){S.goals[id]=true;log('Goal complete: '+l,'good')}});
  if(!S.flags.dreamDone&&dreamProgress()>=1){S.flags.dreamDone=true;log(`LIFETIME DREAM ACHIEVED: ${DREAMS[S.dream].name}!`,'good');toast(`Dream achieved: ${DREAMS[S.dream].name}!`)}
}

/* ---------- relationships ---------- */
function relLabel(id){const n=S.npcs[id];if(n.stage==='married')return 'Married';if(n.stage==='engaged')return 'Engaged';if(n.stage==='dating')return 'Dating';
  return n.rel>=85?'Best friend':n.rel>=50?'Good friend':n.rel>=25?'Friend':n.rel>=8?'Acquaintance':'Stranger'}
function npcActions(id){
  const n=S.npcs[id],N=NPCS[id],c=S.skills.charisma,fresh=S.fresh?1.2:1;
  const list=[
    {id:'talk',l:'Talk',s:'Have a proper conversation',h:0,talk:true},
    {id:'joke',l:'Tell a joke',s:'Charisma check',h:.25,run:()=>{if(Math.random()<.35+c*.07){rel(id,8*fresh);add('fun',8);return `${N.name} laughed so hard they had to sit down.`}rel(id,-3);return `${N.name} smiled politely. Ouch.`}},
    {id:'eat',l:'Buy them a meal',s:'£15. You pay',h:1.5,cond:()=>S.money<15&&'You need £15',run:()=>{spend(price(15),`Meal with ${N.name}`);rel(id,12*fresh);add('hunger',40);add('social',20);return `You and ${N.name} shared a big plate of jollof and chicken.`}},
    {id:'borrow',l:'Borrow £100',s:'Needs Good friend. Once a fortnight',h:.25,cond:()=>n.rel<50?'You need to be good friends':S.day-n.lastLoan<14&&'You borrowed recently',run:()=>{n.lastLoan=S.day;earn(100,`Borrowed from ${N.name}`);rel(id,-4);return `${N.name} sent it straight away. "Pay me when you can."`}},
  ];
  if(['tobi','grace','tom','chioma','amara'].includes(id))list.push({id:'ref',l:'Ask about job openings',s:'Good friends boost applications',h:.5,cond:()=>n.rel<40&&'Get closer first',run:()=>{rel(id,2);return `${N.name} says they will put in a good word. Apply in the Jobs app.`}});
  if(!N.aunty){
    const p=S.partner;
    if(!p||p===id){
      if(!n.stage)list.push({id:'flirt',l:'Flirt',s:'Needs Friend',h:.25,cond:()=>(p&&p!==id)?'You are taken':n.rel<25&&'Become friends first',run:()=>{if(Math.random()<.4+c*.06){rel(id,8*fresh);return `${N.name} blushed. Something is there.`}rel(id,-4);return `${N.name} laughed it off. Awkward.`}},
        {id:'askout',l:'Ask on a date',s:'Needs Good friend',h:.5,cond:()=>n.rel<55&&'You need to be closer',run:()=>{if(Math.random()<.45+c*.05+(S.fresh?.1:0)){n.stage='dating';n.since=S.day;S.partner=id;add('fun',30);return `${N.name} said YES. You are dating!`}rel(id,-8);return `${N.name} said they want to stay friends for now.`}});
      if(n.stage==='dating'||n.stage==='engaged'||n.stage==='married')list.push({id:'date',l:'Go on a date',s:'£30',h:3,cond:()=>(S.money<30&&'You need £30')||(S.day===n.lastDate&&'One date a day'),run:()=>{n.lastDate=S.day;spend(30,`Date with ${N.name}`);rel(id,12);add('fun',30);add('social',30);add('hunger',35);return pick([`Dinner and a long walk with ${N.name}.`,`Cinema with ${N.name}. You did not watch the film.`])}});
      if(n.stage==='dating')list.push({id:'propose',l:'Propose',s:'Ring £600. Needs 7+ days dating and 85 relationship',h:1,cond:()=>(S.day-n.since<7?'Date for at least a week first':n.rel<85?'Your bond is not strong enough yet':S.money<600&&'The ring costs £600'),run:()=>{spend(600,'Engagement ring');n.stage='engaged';add('fun',50);msg('mummy','My child is getting MARRIED!!! 🎉🙏🏾 I am telling everybody.');return `${N.name} said YES! You are engaged!`}});
      if(n.stage==='engaged')list.push({id:'wed',l:'Plan the wedding',s:'£2,500. Owambe next Saturday',h:1,cond:()=>(S.wedding?'Wedding already planned':S.money<2500&&'You need £2,500'),run:()=>{spend(2500,'Wedding and owambe');let d=S.day+1;while((d-1)%7!==5)d++;S.wedding=d;return `Wedding booked for Day ${d}. Sade is handling the aso ebi.`}});
    }
  }
  return list;
}
