/* ---------- side-hustle gigs ---------- */
function gigState(){if(!S.gigs)S.gigs={board:[],acc:[],rating:3,done:0,seq:1};return S.gigs}
function refreshGigs(){
  const G=gigState(),vs=venues();
  // missed gigs
  G.acc=G.acc.filter(g=>{if(S.day>g.day||(S.day===g.day&&S.hour>g.start+1.5)){G.rating=Math.max(1,r2(G.rating-.5));log(`You missed the gig: ${g.t}. Your rating dropped.`,'bad');return false}return true});
  G.board=G.board.filter(g=>g.day>S.day||(g.day===S.day&&S.hour<g.start-1));
  for(const off of [0,1]){const day=S.day+off,dw=(day-1)%7;
    if(G.board.filter(g=>g.day===day).length>=4)continue;
    const pool=GIGS.filter(t=>t.days.includes(dw));
    const n=3+Math.floor(Math.random()*2)+(S.contacts?Math.min(2,Math.floor(S.contacts/2)):0);
    for(let k=0;k<n&&pool.length;k++){const t=pick(pool);
      const places=t.at.includes('home')?[{id:'home',name:'Your kitchen'}]:vs.filter(v=>t.at.includes(v.type)&&!v.trip);if(!places.length)continue;
      const v=pick(places),start=Math.round(rnd(t.start[0],t.start[1]));if(off===0&&start<=S.hour+1)continue;
      const pay=Math.round(rnd(t.pay[0],t.pay[1])*(.85+G.rating*.06));
      if(G.board.some(g=>g.day===day&&g.tid===t.id))continue;
      G.board.push({gid:G.seq++,tid:t.id,t:t.t,e:t.e,d:t.d,vid:v.id,vname:v.name,day,start,h:t.h,pay,need:t.need,ing:t.ing||0})}}
  G.board.sort((a,b)=>a.day-b.day||a.start-b.start);
}
function gigBlock(g){if(S.workBan)return 'You can\'t work while your asylum claim is being decided';if(g.need&&S.skills[g.need[0]]<g.need[1])return `Needs ${g.need[0]} ${g.need[1]}`;if(gigState().acc.length>=3)return 'You already have 3 gigs booked';if(gigState().acc.some(a=>a.day===g.day&&Math.abs(a.start-g.start)<Math.max(a.h,g.h)))return 'Clashes with another gig';return false}
function acceptGig(gid){const G=gigState(),g=G.board.find(x=>x.gid===gid);if(!g)return;const why=gigBlock(g);if(why){toast(why);return}G.board=G.board.filter(x=>x!==g);G.acc.push(g);G.acc.sort((a,b)=>a.day-b.day||a.start-b.start);toast(`Booked: ${g.t}, ${g.day===S.day?'today':'tomorrow'} at ${hhmm(g.start)}`)}
function gigActs(){
  if(!S.gigs)return [];const v=here();
  return S.gigs.acc.filter(g=>g.vid===v.id).map(g=>({id:'gig-'+g.gid,gig:true,at:v.type,label:`Gig: ${g.t}`,sub:`${g.day===S.day?'Today':'Tomorrow'} ${hhmm(g.start)} · ${g.vname}`,emote:g.e,h:g.h,earn:()=>g.pay,
    cond:()=>g.day!==S.day?'This gig is tomorrow':S.hour<g.start-.5?`Starts at ${hhmm(g.start)}. Come back then`:S.hour>g.start+1?'Too late. You missed the start':(g.ing&&S.ingredients<g.ing)&&`Needs ${g.ing} bags of ingredients`,
    run:()=>{const G=S.gigs;G.acc=G.acc.filter(x=>x!==g);if(g.ing)S.ingredients-=g.ing;
      const good=Math.random()<.55+(g.need?Math.min(.3,(S.skills[g.need[0]]-g.need[1])*.1):.15)+(S.needs.energy>40?.1:-.1);
      const tip=good?Math.round(g.pay*rnd(.05,.25)):0;earn(g.pay+tip,`Gig: ${g.t}`);G.done++;G.rating=clamp(r2(G.rating+(good?.25:-.1)),1,5);
      add('energy',-g.h*3);add('social',8);if(g.need)skill(g.need[0],.3);
      return good?`${g.t}: smashed it. +${gbp(g.pay)}${tip?` and ${gbp(tip)} in tips`:''}. ★ ${G.rating.toFixed(1)}`:`${g.t} done. It was okay. +${gbp(g.pay)}.`}}));
}

/* ---------- business simulation ---------- */
const BIZNAME={chops:"Small Chops",aso:"Aso Ebi Hub",barber:"Cuts & Braids",suya:"Suya Spot",lounge:"Lounge"};
function bizCan(type){const B=BIZ[type];if(S.workBan)return 'You can\'t run a business while your asylum claim is being decided';if(S.biz)return 'You already run a business';if(S.money<B.cost)return `You need ${gbp(B.cost)} to start`;return false}
function startBiz(type){
  const why=bizCan(type);if(why){toast(why);return}
  const B=BIZ[type];spend(B.cost,`Started ${B.n}`);
  const home=CITIES[S.city].homes.find(h=>h.id===S.home);
  const off=[[.004,.006],[-.005,.004],[.003,-.006]][Math.floor(hash(S.pid)*3)];
  S.biz={type,name:`${S.name}'s ${BIZNAME[type]}`,day0:S.day,price:1,stock:Math.round(B.cap*.8),staff:0,rep:45,mkt:0,lvl:1,hist:[],workedDay:-1,ll:[home.ll[0]+off[0],home.ll[1]+off[1]],total:0};
  CM=null;log(`You opened ${S.biz.name}! ${B.where==='premises'?'Find it on the map next to your home.':'Run it from home.'}`,'good');
  msg('mummy',`My child is now a business owner!! ${B.icon} I have told the whole church.`);
}
const bizUnitPrice=()=>BIZ[S.biz.type].price[S.biz.price];
const bizCap=()=>Math.round(BIZ[S.biz.type].cap*(1+(S.biz.lvl-1)*.5));
function bizValue(){if(!S.biz)return 0;return Math.round(BIZ[S.biz.type].cost*.6*(1+(S.biz.lvl-1)*.4)*(.6+S.biz.rep/125))}
function bizDay(){
  const Z=S.biz;if(!Z)return;const B=BIZ[Z.type],d=(S.day-2+7)%7; // yesterday's weekday
  let f=1;
  if(Z.type==='lounge')f=d===4||d===5?3:d===6?1.4:.5;
  else if(Z.type==='suya')f=(d>=4?1.6:1)*({Drizzle:.7,'Cold snap':.6,'Sunny spell':1.4}[S.weather]||1);
  else if(Z.type==='barber')f=d===5?1.6:d===6?.3:1;
  else if(Z.type==='aso')f=d===3||d===4?2:d===6?.3:.8;
  else if(Z.type==='chops')f=d>=4&&d<=5?1.8:.8;
  const worked=Z.workedDay===S.day-1;
  const priceF=[1.3,1,.68][Z.price],repF=.45+Z.rep/90,mkt=Z.mkt>0?1.35:1;
  const demand=Math.round(B.base*f*priceF*repF*mkt*(worked?1.2:1)*(S.biz.lvl>1?1.15:1)*rnd(.8,1.2));
  const capacity=Math.round(bizCap()*(Z.staff?Math.min(1,.45+Z.staff*.35):worked?.7:.3));
  const sold=Math.max(0,Math.min(demand,capacity,Z.stock));
  const rev=r2(sold*bizUnitPrice()),wages=Z.staff*B.staff,rent=r2(B.rent/7);
  Z.stock-=sold;
  let dr=0;if(demand>capacity||demand>sold)dr-=3;if(Z.price===2)dr-=1;if(Z.price===0)dr+=1;if(worked)dr+=2;if(sold>0&&sold===demand)dr+=1;dr+=Math.round(rnd(-1,1));
  Z.rep=clamp(Z.rep+dr,5,100);if(Z.mkt>0)Z.mkt--;
  const cogs=r2(sold*B.stock);const profit=r2(rev-wages-rent-cogs);
  if(rev)earn(rev,`${Z.name} takings`);if(wages)spend(wages,`${Z.name} staff wages`);if(rent)spend(rent,`${Z.name} rent`);
  Z.total=r2(Z.total+profit);
  Z.hist.push({d:S.day-1,rev,cost:r2(wages+rent+cogs),sold,demand,profit});Z.hist=Z.hist.slice(-14);
  if(Z.stock<bizCap()*.25&&Math.random()<.6)msg('biz',`Stock is running low: ${Z.stock} ${B.unit}s left. Restock in the Business app.`);
  if(demand>sold&&Z.stock>0&&!Z.staff&&Math.random()<.5)msg('biz',`${demand-sold} customers walked away yesterday. You need staff, or work there yourself.`);
}
function bizRestock(n){const Z=S.biz,B=BIZ[Z.type],c=r2(n*B.stock);if(S.money<c){toast(`You need ${gbp(c)}.`);return}spend(c,`${Z.name} stock`);Z.stock+=n;toast(`Restocked ${n} ${B.unit}s.`)}
function bizStaff(dlt){const Z=S.biz,mx=Z.type==='lounge'?8:4;Z.staff=Math.max(0,Math.min(mx,Z.staff+dlt));toast(dlt>0?'New staff member hired.':'Staff member let go.')}
function bizMarket(){const Z=S.biz,c=Z.type==='lounge'?300:60;if(S.money<c){toast(`Marketing costs ${gbp(c)}.`);return}spend(c,`${Z.name} marketing`);Z.mkt=5;Z.rep=clamp(Z.rep+3,5,100);toast('Flyers, Instagram ads and a shout-out on the group chats. Demand up for 5 days.')}
function bizUpgrade(){const Z=S.biz,c=Math.round(BIZ[Z.type].cost*.5*Z.lvl);if(Z.lvl>=3){toast('Fully upgraded.');return}if(S.money<c){toast(`Upgrade costs ${gbp(c)}.`);return}spend(c,`${Z.name} upgrade`);Z.lvl++;toast(`Upgraded to level ${Z.lvl}. More capacity.`)}
function bizClose(){const v=bizValue();earn(v,`Sold ${S.biz.name}`);log(`You sold ${S.biz.name} for ${gbp(v)}.`,'');S.biz=null;CM=null}
A({id:'bizhome',at:'home',label:()=>S.biz?`Work on ${S.biz.name}`:'Run a business',sub:()=>!S.biz?'Start one in the Business app':BIZ[S.biz.type].where==='home'?`Cook, pack and deliver. ${S.biz.stock} ${BIZ[S.biz.type].unit}s in stock`:'Your business is at its own premises',emote:'💼',h:3,
  cond:()=>!S.biz?'Start a business in the Business app on your phone':BIZ[S.biz.type].where!=='home'?'Go to your business premises on the map':S.biz.workedDay===S.day&&'You already worked on it today',
  run:()=>{S.biz.workedDay=S.day;skill(S.biz.type==='chops'?'cooking':'charisma',.3);add('energy',-8);return 'Orders packed and delivered. Customers love the personal touch.'}});
A({id:'bizwork',at:'mybiz',label:'Work the counter',sub:'Serve customers yourself. Boosts sales and reputation',emote:'🧾',h:4,cond:()=>S.biz.workedDay===S.day&&'You already worked here today',
  run:()=>{S.biz.workedDay=S.day;skill('charisma',.35);add('energy',-10);add('social',10);return pick(['Queue out the door. You remembered every regular\'s name.','A food blogger came in. Fingers crossed.','You fixed the till and charmed a difficult customer.'])}});
A({id:'bizbooks',at:'mybiz',label:'Check the books',sub:'Open the Business app',emote:'📊',h:0,books:true});
