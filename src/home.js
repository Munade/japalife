/* ---------- UK homes: layouts, furniture, placement, rendering ---------- */
/* Grid units: 1 unit ≈ 1 metre. Back walls: A runs along y=0, B along x=0. Front is cut away. */
const LAYOUTS={
  room:{name:'Room in a shared house',w:6,d:5,
    rooms:[{id:'bed',n:'Your room',x:0,y:0,w:6,d:5,floor:'carpet',wall:'#EDE3C7',kind:'bed'}],
    walls:[],
    win:[{s:'A',a:1.8,l:2,room:'bed'}],door:{s:'B',a:3.4,l:.9,shared:true},
    fix:[{k:'radiator',s:'A',a:2,l:1.6},{k:'meter',s:'B',a:4.6}],shared:true},
  hotel:{name:'Hotel room',w:6,d:5,
    rooms:[{id:'bed',n:'Hotel room',x:0,y:0,w:6,d:5,floor:'carpet2',wall:'#D9D3C4',kind:'bed'}],walls:[],
    win:[{s:'A',a:1.8,l:2,room:'bed'}],door:{s:'B',a:3.4,l:.9,shared:true},
    fix:[{k:'radiator',s:'A',a:2,l:1.6},{k:'hotelbed',x:3.5,y:.1,w:1.5,d:2},{k:'tray',x:.1,y:.2,w:1,d:.6}],shared:true,hotel:true},
  studio:{name:'Studio flat',w:8,d:6,
    rooms:[{id:'main',n:'Studio',x:0,y:0,w:8,d:6,floor:'laminate',wall:'#EDE3C7',kind:'living'},{id:'bath',n:'Bathroom',x:0,y:3.5,w:2.5,d:2.5,floor:'tiles',wall:'#F2F4F5',kind:'bath'}],
    walls:[{x1:0,y1:3.5,x2:2.5,y2:3.5},{x1:2.5,y1:3.5,x2:2.5,y2:6,gap:[4.2,5]}],
    win:[{s:'A',a:4.2,l:2,room:'main'}],door:{s:'B',a:1.8,l:.9},
    fix:[{k:'units',x:0,y:0,w:2.5,d:.6,along:'A'},{k:'sink',x:.5,y:0},{k:'hob',x:1.5,y:0},{k:'fridge',x:2.5,y:0,w:.7,d:.65},{k:'washer',x:3.2,y:0,w:.6,d:.6},
      {k:'radiator',s:'A',a:4.4,l:1.6},{k:'bath',x:0,y:3.6,w:.8,d:1.8},{k:'toilet',x:1.6,y:5.2,w:.5,d:.7},{k:'basin',x:1.7,y:3.6,w:.5,d:.4},{k:'boiler',x:7.3,y:0,w:.7,d:.6},{k:'meter',s:'B',a:2.9}]},
  flat:{name:'One-bed flat',w:10,d:7,
    rooms:[{id:'liv',n:'Living room and kitchen',x:0,y:0,w:6,d:7,floor:'laminate',wall:'#EDE3C7',kind:'living'},{id:'hall',n:'Hallway',x:6,y:0,w:1.4,d:7,floor:'laminate',wall:'#E6E1D6',kind:'hall'},
      {id:'bed',n:'Bedroom',x:7.4,y:0,w:2.6,d:4,floor:'carpet',wall:'#DCE3E8',kind:'bed'},{id:'bath',n:'Bathroom',x:7.4,y:4,w:2.6,d:3,floor:'tiles',wall:'#F2F4F5',kind:'bath'}],
    walls:[{x1:6,y1:0,x2:6,y2:7,gap:[2.6,4.2]},{x1:7.4,y1:0,x2:7.4,y2:4,gap:[1.6,2.5]},{x1:7.4,y1:4,x2:7.4,y2:7,gap:[5,5.9]},{x1:7.4,y1:4,x2:10,y2:4}],
    win:[{s:'A',a:3,l:2,room:'liv'},{s:'A',a:8,l:1.6,room:'bed'},{s:'B',a:4.2,l:1.8,room:'liv'}],door:{s:'A',a:6.25,l:.9},
    fix:[{k:'units',x:0,y:0,w:2.6,d:.6,along:'A'},{k:'units',x:0,y:.6,w:.6,d:1.6,along:'B'},{k:'sink',x:1.2,y:0},{k:'hob',x:.1,y:1.2,rot:1},{k:'fridge',x:2.6,y:0,w:.7,d:.65},{k:'washer',x:.6,y:0,w:.6,d:.6},
      {k:'radiator',s:'A',a:3.2,l:1.6},{k:'radiator',s:'A',a:8.1,l:1.4},{k:'radiator',s:'B',a:4.4,l:1.4},{k:'boiler',x:6.1,y:6.2,w:.8,d:.7},
      {k:'bath',x:9.15,y:4.1,w:.8,d:1.8},{k:'toilet',x:7.6,y:6.1,w:.5,d:.7},{k:'basin',x:8.4,y:4.05,w:.5,d:.4},{k:'airer',x:6.2,y:4.6,w:1,d:.5},{k:'meter',s:'B',a:.4,inRoom:'liv'}]},
  house:{name:'Two-bed terraced house',w:12,d:9,
    rooms:[{id:'kit',n:'Kitchen diner',x:0,y:0,w:6,d:4,floor:'lino',wall:'#EEE6CF',kind:'kitchen'},{id:'liv',n:'Living room',x:0,y:4,w:6,d:5,floor:'carpet',wall:'#E5DCCB',kind:'living'},
      {id:'hall',n:'Hallway',x:6,y:0,w:1.5,d:9,floor:'laminate',wall:'#E6E1D6',kind:'hall'},{id:'bed',n:'Bedroom',x:7.5,y:0,w:4.5,d:4.5,floor:'carpet',wall:'#DCE3E8',kind:'bed'},
      {id:'bath',n:'Bathroom',x:7.5,y:4.5,w:2.4,d:2,floor:'tiles',wall:'#F2F4F5',kind:'bath'},{id:'bed2',n:'Box room',x:9.9,y:4.5,w:2.1,d:2,floor:'carpet',wall:'#E8E0D0',kind:'bed'},
      {id:'gdn',n:'Back garden',x:7.5,y:6.5,w:4.5,d:2.5,floor:'grass',wall:null,kind:'garden'}],
    walls:[{x1:6,y1:0,x2:6,y2:4,gap:[1.4,2.4]},{x1:6,y1:4,x2:6,y2:9,gap:[6,7]},{x1:0,y1:4,x2:6,y2:4,gap:[2.4,3.6]},{x1:7.5,y1:0,x2:7.5,y2:4.5,gap:[2,2.9]},
      {x1:7.5,y1:4.5,x2:7.5,y2:6.5,gap:[5,5.9]},{x1:7.5,y1:6.5,x2:7.5,y2:9,gap:[7.3,8.2]},{x1:7.5,y1:4.5,x2:12,y2:4.5,gap:[10.4,11.2]},{x1:9.9,y1:4.5,x2:9.9,y2:6.5},{x1:7.5,y1:6.5,x2:12,y2:6.5,fence:false}],
    win:[{s:'A',a:2,l:2,room:'kit'},{s:'A',a:8.8,l:2,room:'bed'},{s:'B',a:5.6,l:2,room:'liv'}],door:{s:'A',a:6.3,l:.9},
    fix:[{k:'units',x:0,y:0,w:2.2,d:.6,along:'A'},{k:'units',x:0,y:.6,w:.6,d:2,along:'B'},{k:'sink',x:1,y:0},{k:'hob',x:.1,y:1.3,rot:1},{k:'fridge',x:4.2,y:0,w:.7,d:.65},{k:'washer',x:.1,y:2.6,w:.6,d:.6},
      {k:'radiator',s:'A',a:2.2,l:1.6},{k:'radiator',s:'A',a:9,l:1.6},{k:'radiator',s:'B',a:5.8,l:1.6},{k:'boiler',x:6.1,y:3.2,w:.8,d:.7},
      {k:'bath',x:7.6,y:4.6,w:1.8,d:.8},{k:'toilet',x:9.2,y:5.7,w:.5,d:.7},{k:'basin',x:8.1,y:6,w:.5,d:.4},{k:'washline',x:8.6,y:7.4,w:2.6,d:.2},{k:'shed',x:11,y:7.6,w:.9,d:1.2},{k:'meter',s:'B',a:.3,inRoom:'kit'}],garden:true}};

/* furniture catalogue. size [w,d,h] in metres. fx: comfort, fun, study, cook, homesick, fitness, amb (ambience) */
const CAT=['Bedroom','Living','Kitchen','Study','Decor','Fitness','Garden'];
const ITEMS={
  mattress:{n:'Floor mattress',c:'Bedroom',p:0,sz:[1,2,.22],st:'bed',col:'#B9C3D6',col2:'#E8E1D3',tags:['bed'],fx:{comfort:0},room:'bed',sell:false},
  single:{n:'Single bed',c:'Bedroom',p:120,sz:[1,2,.5],st:'bed',col:'#8A6A4A',col2:'#5E7FA0',tags:['bed'],fx:{comfort:1,amb:1},room:'bed'},
  double:{n:'Double bed',c:'Bedroom',p:240,sz:[1.5,2,.55],st:'bed',col:'#6B4A8C',col2:'#C24E36',tags:['bed'],fx:{comfort:2,amb:2},room:'bed'},
  king:{n:'King bed with storage',c:'Bedroom',p:480,sz:[2,2,.6],st:'bed',col:'#3A3F4A',col2:'#08774C',tags:['bed'],fx:{comfort:3,amb:3},room:'bed'},
  wardrobe:{n:'Wardrobe',c:'Bedroom',p:160,sz:[1,.6,2],st:'wardrobe',col:'#E8E2D6',tags:['storage'],fx:{amb:1},room:'bed',wall:1},
  drawers:{n:'Chest of drawers',c:'Bedroom',p:90,sz:[.8,.5,.9],st:'drawers',col:'#A87B4F',fx:{amb:1},room:'bed',wall:1},
  bedside:{n:'Bedside table and lamp',c:'Bedroom',p:45,sz:[.5,.5,.55],st:'bedside',col:'#A87B4F',tags:['lamp'],fx:{amb:1,comfort:.2},room:'bed'},
  mirror:{n:'Full-length mirror',c:'Bedroom',p:40,sz:[.5,.15,1.5],st:'mirror',col:'#B9D2E3',tags:['mirror'],fx:{amb:.5},room:'bed',wall:1},
  blackout:{n:'Blackout curtains',c:'Bedroom',p:45,acc:1,fx:{comfort:.5},d:'Sleep better, even in summer.'},
  blanket:{n:'Electric blanket',c:'Bedroom',p:35,acc:1,tags:['blanket'],fx:{comfort:.3},d:'Cold snaps no longer ruin your sleep.'},
  chair:{n:'Folding chair',c:'Living',p:15,sz:[.5,.5,.45],st:'chair',col:'#8A6A4A',tags:['seat'],fx:{},room:'any'},
  sofa2:{n:'Two-seater sofa',c:'Living',p:180,sz:[1.6,.9,.45],st:'sofa',col:'#5E6B78',tags:['sofa','seat'],fx:{fun:1,amb:2},room:'living',wall:1},
  corner:{n:'Corner sofa',c:'Living',p:650,sz:[2.4,1.6,.45],st:'corner',col:'#08774C',tags:['sofa','seat'],fx:{fun:2,amb:3},room:'living',wall:1},
  armchair:{n:'Armchair',c:'Living',p:120,sz:[.9,.9,.45],st:'sofa',col:'#C9921B',tags:['seat'],fx:{fun:.5,amb:1},room:'living'},
  coffee:{n:'Coffee table',c:'Living',p:60,sz:[1,.6,.4],st:'table',col:'#7A5233',fx:{amb:1},room:'living'},
  dining:{n:'Dining table and 4 chairs',c:'Living',p:260,sz:[2,1.6,.75],st:'dining',col:'#A87B4F',tags:['dining'],fx:{amb:2},room:'kitchen'},
  tv43:{n:'43" smart TV and stand',c:'Living',p:260,sz:[1.2,.45,.5],st:'tv',col:'#1B1F1D',tags:['tv'],fx:{fun:2},room:'living',wall:1},
  tv65:{n:'65" smart TV and stand',c:'Living',p:700,sz:[1.7,.45,.5],st:'tv',col:'#1B1F1D',tags:['tv'],fx:{fun:3.5,amb:1},room:'living',wall:1,big:1},
  soundbar:{n:'Soundbar',c:'Living',p:150,acc:1,tags:['speaker'],fx:{fun:1},d:'Big sound for films and football.'},
  console:{n:'Games console',c:'Living',p:420,acc:1,tags:['console'],fx:{fun:2},d:'FIFA nights with the guys.'},
  speaker:{n:'Bluetooth speaker',c:'Living',p:70,sz:[.4,.4,.7],st:'speaker',col:'#2A2A2A',tags:['speaker'],fx:{fun:1},room:'any'},
  bookshelf:{n:'Bookshelf',c:'Living',p:80,sz:[.9,.35,1.8],st:'shelf',col:'#7A5233',fx:{amb:1,study:.2},room:'any',wall:1},
  floorlamp:{n:'Floor lamp',c:'Living',p:45,sz:[.4,.4,1.6],st:'lamp',col:'#2A2A2A',tags:['lamp'],fx:{amb:1},room:'any'},
  ankara:{n:'Ankara rug',c:'Living',p:40,sz:[2,1.4,0],st:'rug',col:'ankara',floor:1,fx:{homesick:.15,amb:1},room:'living'},
  persian:{n:'Persian rug',c:'Living',p:120,sz:[2.2,1.6,0],st:'rug',col:'persian',floor:1,fx:{amb:2},room:'living'},
  freezer:{n:'Chest freezer',c:'Kitchen',p:120,sz:[1,.7,.85],st:'box',col:'#F4F6F5',tags:['freezer'],fx:{cook:.2},room:'kitchen'},
  microwave:{n:'Microwave',c:'Kitchen',p:60,acc:1,worktop:1,fx:{cook:.2},d:'Reheat jollof in two minutes.'},
  airfryer:{n:'Air fryer',c:'Kitchen',p:70,acc:1,worktop:1,fx:{cook:.4},d:'Crispy plantain, no oil splashes.'},
  ricecooker:{n:'Rice cooker',c:'Kitchen',p:35,acc:1,worktop:1,fx:{cook:.3},d:'Perfect rice, every time.'},
  blender:{n:'Pepper blender',c:'Kitchen',p:45,acc:1,worktop:1,fx:{cook:.4},d:'Blend your own pepper mix for stews.'},
  pots:{n:'Big party pots',c:'Kitchen',p:50,acc:1,fx:{cook:.4},d:'Jollof for fifty people.'},
  desk:{n:'Study desk',c:'Study',p:90,sz:[1.2,.6,.75],st:'desk',col:'#A87B4F',tags:['desk'],fx:{study:1},room:'any',wall:1},
  officechair:{n:'Office chair',c:'Study',p:80,acc:1,fx:{study:.4},d:'Your back will thank you.'},
  laptop:{n:'Laptop',c:'Study',p:500,acc:1,tags:['laptop'],fx:{study:1},d:'Faster studying and job applications.'},
  ringlight:{n:'Ring light and tripod',c:'Study',p:60,sz:[.4,.4,1.5],st:'ring',col:'#EDEDED',tags:['ringlight'],fx:{},room:'any'},
  photos:{n:'Family photo wall',c:'Decor',p:25,wallItem:1,st:'photos',tags:['photos'],fx:{homesick:.25,amb:1}},
  art:{n:'Nigerian wall art',c:'Decor',p:60,wallItem:1,st:'art',fx:{homesick:.1,amb:1.5}},
  flag:{n:'Nigeria flag',c:'Decor',p:15,wallItem:1,st:'flag',fx:{homesick:.1,amb:.5}},
  clock:{n:'Wall clock',c:'Decor',p:20,wallItem:1,st:'clock',fx:{amb:.5}},
  plant:{n:'House plant',c:'Decor',p:20,sz:[.4,.4,.6],st:'plant',col:'#2F8F4E',tags:['plants'],fx:{amb:.5,fun:.2},room:'any'},
  bigplant:{n:'Big monstera plant',c:'Decor',p:45,sz:[.6,.6,1.3],st:'bigplant',col:'#2F8F4E',tags:['plants'],fx:{amb:1,fun:.3},room:'any'},
  fairy:{n:'Fairy lights',c:'Decor',p:15,acc:1,fx:{amb:1,fun:.2},d:'Cosy glow at night.'},
  bike:{n:'Exercise bike',c:'Fitness',p:250,sz:[.6,1.2,1.1],st:'bike',col:'#2A2A2A',tags:['fitness'],fx:{fitness:1},room:'any'},
  weights:{n:'Dumbbells and mat',c:'Fitness',p:40,sz:[.7,1.6,0],st:'mat',col:'#2B5BA8',floor:1,tags:['fitness'],fx:{fitness:.5},room:'any'},
  bbq:{n:'BBQ grill',c:'Garden',p:120,sz:[.8,.6,.9],st:'bbq',col:'#1B1F1D',tags:['bbq'],fx:{amb:1},room:'garden'},
  gchairs:{n:'Garden table and chairs',c:'Garden',p:90,sz:[1.6,1.6,.7],st:'dining',col:'#E8E2D6',fx:{amb:1},room:'garden'}};

/* ---------- state + migration ---------- */
function homeDef(){return CITIES[S.city].homes.find(h=>h.id===S.home)}
function layoutKey(){const h=homeDef();return h.layout||(h.hotel?'hotel':h.shared?'room':'studio')}
const LAY=()=>LAYOUTS[layoutKey()];
function ensureItems(){
  if(S.items)return;
  S.items=[];S.store=[];S.acc=[];S.uid=1;
  const map={mattress:'mattress',bed:'double',chair:'chair',sofa:'sofa2',tv:'tv43',desk:'desk',photos:'photos',plants:'plant',speaker:'speaker',ringlight:'ringlight',blanket:'blanket',freezer:'freezer',rug:'ankara'};
  (S.furn||['mattress','chair']).forEach(k=>{const m=map[k];if(!m)return;if(m==='mattress'&&(S.furn||[]).includes('bed'))return;giveItem(m,true)});
  if(!S.items.length&&!S.store.length){giveItem('mattress',true);giveItem('chair',true)}
}
function giveItem(k,silent){
  const I=ITEMS[k];
  if(I.acc){S.acc.push(k);return 'acc'}
  const it={u:S.uid++,k,rot:0};
  if(LAY().hotel){S.store.push(it);return 'store'}
  const pos=autoPlace(it);
  if(pos){Object.assign(it,pos);S.items.push(it);return 'placed'}
  S.store.push(it);return 'store';
}
const ownTag=t=>S.items.some(it=>(ITEMS[it.k].tags||[]).includes(t))||S.acc.some(k=>(ITEMS[k].tags||[]).includes(t));
function homeFx(){
  const f={comfort:0,fun:0,study:0,cook:0,homesick:0,fitness:0,amb:0};let bed=0;
  const cnt={};[...S.items.map(i=>i.k),...new Set(S.acc)].forEach(k=>{cnt[k]=(cnt[k]||0)+1;if(cnt[k]>2)return;const x=ITEMS[k].fx||{};for(const q in x){if(q==='comfort'&&(ITEMS[k].tags||[]).includes('bed'))bed=Math.max(bed,x[q]);else f[q]+=x[q]*(cnt[k]===2?.5:1)}});
  f.comfort=Math.min(1.3,f.comfort);
  if(LAY().hotel)bed=Math.max(bed,1);
  f.comfort+=bed;f.amb+=({room:0,hotel:0,studio:2,flat:4,house:6}[layoutKey()]||0);
  return f;
}
const homeStars=()=>Math.max(1,Math.min(5,Math.round(1+homeFx().amb/7)));

/* ---------- geometry ---------- */
const CELL=.5;
function itemSize(it){const I=ITEMS[it.k];const [w,d,h]=I.sz;return it.rot?[d,w,h]:[w,d,h]}
function roomAt(x,y,L=LAY()){let r=null;L.rooms.forEach(R=>{if(x>=R.x&&x<R.x+R.w&&y>=R.y&&y<R.y+R.d)r=R});return r}
function fixRect(f){const s={units:[f.w,f.d],sink:[.6,.6],hob:[.6,.6],fridge:[f.w||.7,f.d||.65],washer:[.6,.6],bath:[f.w||.8,f.d||1.8],toilet:[f.w||.5,f.d||.7],basin:[f.w||.5,f.d||.4],boiler:[f.w||.7,f.d||.6],airer:[f.w||1,f.d||.5],washline:[f.w,f.d],shed:[f.w,f.d],hotelbed:[f.w,f.d],tray:[f.w,f.d]}[f.k];
  if(!s)return null;let [w,d]=s;if(f.rot&&['sink','hob'].includes(f.k))[w,d]=[d,w];return {x:f.x,y:f.y,w,d}}
function wallSegs(L){const out=[];L.walls.forEach(W=>{const hor=W.y1===W.y2;const a=hor?W.x1:W.y1,b=hor?W.x2:W.y2;
  const parts=W.gap?[[a,W.gap[0]],[W.gap[1],b]]:[[a,b]];parts.forEach(([p,q])=>{if(q-p>.01)out.push(hor?{x1:p,y1:W.y1,x2:q,y2:W.y1}:{x1:W.x1,y1:p,x2:W.x1,y2:q})})});return out}
function blockGrid(exceptU){
  const L=LAY(),nx=Math.round(L.w/CELL),ny=Math.round(L.d/CELL),g=[];
  for(let i=0;i<nx;i++){g[i]=[];for(let j=0;j<ny;j++)g[i][j]=0}
  const mark=(x,y,w,d,v=1)=>{for(let i=Math.floor(x/CELL+.001);i<Math.ceil((x+w)/CELL-.001);i++)for(let j=Math.floor(y/CELL+.001);j<Math.ceil((y+d)/CELL-.001);j++)if(i>=0&&j>=0&&i<nx&&j<ny)g[i][j]=v};
  L.fix.forEach(f=>{const r=fixRect(f);if(r&&f.k!=='washline')mark(r.x,r.y,r.w,r.d)});
  S.items.forEach(it=>{if(it.u===exceptU||ITEMS[it.k].floor||ITEMS[it.k].wallItem)return;const [w,d]=itemSize(it);mark(it.x,it.y,w,d)});
  return {g,nx,ny,mark};
}
function wallBetween(ax,ay,bx,by,segs){ // cells centres, check crossing a wall segment
  const mx=(ax+bx)/2,my=(ay+by)/2;
  return segs.some(s=>{if(s.y1===s.y2){return ay!==by&&Math.abs(my-s.y1)<.01&&mx>=s.x1-.01&&mx<=s.x2+.01}return ax!==bx&&Math.abs(mx-s.x1)<.01&&my>=s.y1-.01&&my<=s.y2+.01});
}
function cellPath(from,to,grid){
  const {g,nx,ny}=grid||blockGrid(),segs=wallSegs(LAY());
  const c=p=>[Math.max(0,Math.min(nx-1,Math.floor(p[0]/CELL))),Math.max(0,Math.min(ny-1,Math.floor(p[1]/CELL)))];
  const [si,sj]=c(from),[ti,tj]=c(to);const key=(i,j)=>i*100+j;const prev=new Map([[key(si,sj),null]]);const q=[[si,sj]];
  while(q.length){const [i,j]=q.shift();if(i===ti&&j===tj)break;
    for(const [di,dj] of [[1,0],[-1,0],[0,1],[0,-1]]){const a=i+di,b=j+dj;if(a<0||b<0||a>=nx||b>=ny)continue;const k=key(a,b);if(prev.has(k))continue;
      if(g[a][b]&&!(a===ti&&b===tj))continue;if(wallBetween((i+.5)*CELL,(j+.5)*CELL,(a+.5)*CELL,(b+.5)*CELL,segs))continue;prev.set(k,[i,j]);q.push([a,b])}}
  if(!prev.has(key(ti,tj)))return [to];
  const out=[];let cur=[ti,tj];while(cur){out.unshift([(cur[0]+.5)*CELL,(cur[1]+.5)*CELL]);cur=prev.get(key(...cur))}return out;
}
function reachableCount(grid){const {g,nx,ny}=grid,segs=wallSegs(LAY()),st=doorCell();const seen=new Set([st[0]*100+st[1]]),q=[st];
  while(q.length){const [i,j]=q.shift();for(const [di,dj] of [[1,0],[-1,0],[0,1],[0,-1]]){const a=i+di,b=j+dj;if(a<0||b<0||a>=nx||b>=ny||g[a][b])continue;const k=a*100+b;if(seen.has(k))continue;if(wallBetween((i+.5)*CELL,(j+.5)*CELL,(a+.5)*CELL,(b+.5)*CELL,segs))continue;seen.add(k);q.push([a,b])}}
  return seen.size}
function doorPos(){const L=LAY(),D=L.door;return D.s==='A'?[D.a+D.l/2,.25]:[.25,D.a+D.l/2]}
function doorCell(){const p=doorPos();return [Math.floor(p[0]/CELL),Math.floor(p[1]/CELL)]}
function fits(it,x,y,rot,grid){
  const L=LAY(),I=ITEMS[it.k];const [w,d]=rot?[I.sz[1],I.sz[0]]:[I.sz[0],I.sz[1]];
  if(x<0||y<0||x+w>L.w+.001||y+d>L.d+.001)return false;
  const r=roomAt(x+.01,y+.01);if(!r||x+w>r.x+r.w+.001||y+d>r.y+r.d+.001)return false;
  if(r.kind==='garden'&&I.room!=='garden'&&I.room!=='any')return false;
  if(I.room==='garden'&&r.kind!=='garden')return false;
  if(r.kind==='bath')return false;
  if(I.floor)return true;
  const {g,nx,ny}=grid;
  for(let i=Math.floor(x/CELL+.001);i<Math.ceil((x+w)/CELL-.001);i++)for(let j=Math.floor(y/CELL+.001);j<Math.ceil((y+d)/CELL-.001);j++){if(i<0||j<0||i>=nx||j>=ny||g[i][j])return false}
  // keep 1 cell clear around door, and don't cut the home in two
  const dc=doorCell();if(Math.abs(dc[0]-Math.floor((x+w/2)/CELL))<=Math.ceil(w/CELL/2)+1&&Math.abs(dc[1]-Math.floor((y+d/2)/CELL))<=Math.ceil(d/CELL/2)+1)return false;
  const before=reachableCount(grid);const g2={...grid,g:grid.g.map(c=>[...c])};let n=0;
  for(let i=Math.floor(x/CELL+.001);i<Math.ceil((x+w)/CELL-.001);i++)for(let j=Math.floor(y/CELL+.001);j<Math.ceil((y+d)/CELL-.001);j++){g2.g[i][j]=1;n++}
  return reachableCount(g2)>=before-n;
}
function autoPlace(it){
  const L=LAY(),I=ITEMS[it.k],grid=blockGrid(it.u);
  if(I.wallItem){const spots=wallSpots();const used=S.items.filter(x=>ITEMS[x.k].wallItem).map(x=>x.wall+':'+x.at);const s=spots.find(p=>!used.includes(p.s+':'+p.a));return s?{wall:s.s,at:s.a}:null}
  const pref=L.rooms.filter(r=>I.room==='any'?r.kind!=='bath'&&r.kind!=='hall':r.kind===I.room||(I.room==='kitchen'&&r.kind==='living'&&!L.rooms.some(q=>q.kind==='kitchen'))||(I.room==='living'&&r.kind==='bed'&&!L.rooms.some(q=>q.kind==='living')));
  const rooms=pref.length?pref:L.rooms.filter(r=>r.kind!=='bath'&&r.kind!=='hall'&&r.kind!=='garden');
  for(const rot of [0,1])for(const R of rooms){
    const cands=[];for(let x=R.x;x<R.x+R.w;x+=CELL)for(let y=R.y;y<R.y+R.d;y+=CELL)cands.push([x,y]);
    cands.sort((a,b)=>I.wall?(Math.min(a[0]-R.x,a[1]-R.y)-Math.min(b[0]-R.x,b[1]-R.y))||(a[0]+a[1]-b[0]-b[1]):(a[0]+a[1]-b[0]-b[1]));
    for(const [x,y] of cands)if(fits(it,x,y,rot,grid))return {x,y,rot};
  }
  return null;
}
function wallSpots(){const L=LAY(),out=[];
  ['A','B'].forEach(s=>{const len=s==='A'?L.w:L.d;for(let a=.3;a<len-.6;a+=.8){const busy=L.win.some(w=>w.s===s&&a+.6>w.a-.1&&a<w.a+w.l+.1)||(L.door.s===s&&a+.6>L.door.a-.1&&a<L.door.a+L.door.l+.1);
    const x=s==='A'?a+.3:0,y=s==='A'?0:a+.3;const r=roomAt(s==='A'?x:.1,s==='A'?.1:y);if(busy||!r||r.kind==='bath'||r.kind==='garden')continue;out.push({s,a})}});return out}
function useSpot(it){
  const [w,d]=itemSize(it),grid=blockGrid(),segs=wallSegs(LAY());const cands=[];
  for(let x=it.x-CELL;x<=it.x+w;x+=CELL)for(let y=it.y-CELL;y<=it.y+d;y+=CELL){const inside=x>=it.x-.01&&x<it.x+w-.01&&y>=it.y-.01&&y<it.y+d-.01;if(inside)continue;
    const i=Math.floor(x/CELL+.001),j=Math.floor(y/CELL+.001);if(i<0||j<0||i>=grid.nx||j>=grid.ny||grid.g[i][j])continue;cands.push([x+CELL/2,y+CELL/2,(x+y)])}
  cands.sort((a,b)=>b[2]-a[2]);return cands[0]?[cands[0][0],cands[0][1]]:doorPos();
}
function fixSpot(k){const f=LAY().fix.find(x=>x.k===k);if(!f)return null;const r=fixRect(f);return useSpotRect(r)}
function useSpotRect(r){const grid=blockGrid();let best=null;
  for(const [x,y] of [[r.x+r.w/2,r.y+r.d+.25],[r.x+r.w+.25,r.y+r.d/2],[r.x+r.w/2,r.y-.25],[r.x-.25,r.y+r.d/2]]){const i=Math.floor(x/CELL),j=Math.floor(y/CELL);if(i>=0&&j>=0&&i<grid.nx&&j<grid.ny&&!grid.g[i][j]){best=[x,y];break}}
  return best||doorPos()}
function spotForTag(tag){
  if(['cooker','toilet','bath','basin','washer','fridge'].includes(tag)){const fk={cooker:'hob',toilet:'toilet',bath:'bath',basin:'basin',washer:'washer',fridge:'fridge'}[tag];return fixSpot(fk)||doorPos()}
  const it=S.items.find(i=>(ITEMS[i.k].tags||[]).includes(tag)&&!ITEMS[i.k].wallItem);if(it)return useSpot(it);
  if(tag==='bed'&&LAY().hotel){const f=LAY().fix.find(x=>x.k==='hotelbed');return useSpotRect(fixRect(f))}
  return idleSpot();
}
function idleSpot(){const L=LAY(),R=L.rooms.find(r=>r.kind==='living')||L.rooms[0];const grid=blockGrid();
  for(let k=0;k<40;k++){const x=R.x+R.w/2+((k%5)-2)*CELL,y=R.y+R.d/2+(Math.floor(k/5)-2)*CELL;const i=Math.floor(x/CELL),j=Math.floor(y/CELL);if(i>=0&&j>=0&&i<grid.nx&&j<grid.ny&&!grid.g[i][j])return [x,y]}return doorPos()}

/* ---------- rendering ---------- */
let HV={tw:48,th:24,zh:30,ox:180,oy:74};
function hIso(x,y,z=0){return [HV.ox+(x-y)*HV.tw/2,HV.oy+(x+y)*HV.th/2-z*HV.zh]}
function hPoly(c,pts,fill,stroke,lw=1){c.beginPath();pts.forEach(([x,y],k)=>k?c.lineTo(x,y):c.moveTo(x,y));c.closePath();if(fill){c.fillStyle=fill;c.fill()}if(stroke){c.strokeStyle=stroke;c.lineWidth=lw;c.stroke()}}
function hBox(c,x,y,w,d,h,col,top,z0=0){
  hPoly(c,[hIso(x,y+d,z0+h),hIso(x+w,y+d,z0+h),hIso(x+w,y+d,z0),hIso(x,y+d,z0)],shade(col,.88));
  hPoly(c,[hIso(x+w,y,z0+h),hIso(x+w,y+d,z0+h),hIso(x+w,y+d,z0),hIso(x+w,y,z0)],shade(col,.74));
  hPoly(c,[hIso(x,y,z0+h),hIso(x+w,y,z0+h),hIso(x+w,y+d,z0+h),hIso(x,y+d,z0+h)],top||shade(col,1.07));
}
const WALLH=2.3;
function fitView(L){const W=360,H=230;const tw=Math.min(52,(W-20)/((L.w+L.d)/2));HV.tw=tw;HV.th=tw/2;HV.zh=tw*.6;
  const top=-WALLH*HV.zh,bottom=(L.w+L.d)*HV.th/2;HV.ox=W/2-(L.w-L.d)*tw/4;HV.oy=H/2-(top+bottom)/2+4}
function wallPt(s,a,z){return s==='A'?hIso(a,0,z):hIso(0,a,z)}
function wallQuad(s,a,b,z0,z1){return [wallPt(s,a,z0),wallPt(s,b,z0),wallPt(s,b,z1),wallPt(s,a,z1)]}
function floorPattern(c,R,k){
  const q=[hIso(R.x,R.y),hIso(R.x+R.w,R.y),hIso(R.x+R.w,R.y+R.d),hIso(R.x,R.y+R.d)];
  const base={carpet:'#8E9298',carpet2:'#7A6E66',laminate:'#B38A5E',tiles:'#E6E8EA',lino:'#D6CFC0',grass:'#7FB069'}[R.floor]||'#AAA';
  hPoly(c,q,base);c.save();c.beginPath();q.forEach(([x,y],i)=>i?c.lineTo(x,y):c.moveTo(x,y));c.closePath();c.clip();
  if(R.floor==='laminate'){c.strokeStyle='rgba(60,35,15,.22)';c.lineWidth=.8;for(let y=R.y;y<R.y+R.d;y+=.2){c.beginPath();c.moveTo(...hIso(R.x,y));c.lineTo(...hIso(R.x+R.w,y));c.stroke()}
    for(let y=R.y;y<R.y+R.d;y+=.2)for(let x=R.x+((y*10)%3)*.4;x<R.x+R.w;x+=1.2){c.beginPath();c.moveTo(...hIso(x,y));c.lineTo(...hIso(x,y+.2));c.stroke()}}
  if(R.floor==='tiles'||R.floor==='lino'){c.strokeStyle=R.floor==='tiles'?'rgba(120,130,140,.35)':'rgba(120,100,70,.25)';c.lineWidth=.7;const st=R.floor==='tiles'?.3:.5;
    for(let x=R.x;x<=R.x+R.w;x+=st){c.beginPath();c.moveTo(...hIso(x,R.y));c.lineTo(...hIso(x,R.y+R.d));c.stroke()}for(let y=R.y;y<=R.y+R.d;y+=st){c.beginPath();c.moveTo(...hIso(R.x,y));c.lineTo(...hIso(R.x+R.w,y));c.stroke()}}
  if(R.floor==='carpet'||R.floor==='carpet2'){const rr=cyRng?cyRng(R.x*31+R.y*7+5):Math.random;c.fillStyle='rgba(255,255,255,.07)';for(let k2=0;k2<R.w*R.d*14;k2++){const [x,y]=hIso(R.x+rr()*R.w,R.y+rr()*R.d);c.fillRect(x,y,1,1)}}
  if(R.floor==='grass'){c.fillStyle='rgba(40,90,30,.25)';const rr=cyRng(9);for(let k2=0;k2<R.w*R.d*20;k2++){const [x,y]=hIso(R.x+rr()*R.w,R.y+rr()*R.d);c.fillRect(x,y-1.5,1,2)}}
  c.restore();
}
function windowView(c,q,t){
  const [s1,s2]=skyCol();const g=c.createLinearGradient(0,q[2][1],0,q[0][1]);g.addColorStop(0,s1);g.addColorStop(1,s2);hPoly(c,q,g);
  c.save();c.beginPath();q.forEach(([x,y],i)=>i?c.lineTo(x,y):c.moveTo(x,y));c.closePath();c.clip();
  // terraced houses opposite
  const minx=Math.min(...q.map(p=>p[0])),maxx=Math.max(...q.map(p=>p[0])),maxy=Math.max(...q.map(p=>p[1]));
  const night=S.hour<6.5||S.hour>=19.5;
  for(let x=minx-8;x<maxx+8;x+=16){c.fillStyle=night?'#3A2A26':'#9A5A44';c.fillRect(x,maxy-20,15,20);c.fillStyle=night?'#2A1E1B':'#5A4036';c.beginPath();c.moveTo(x-1,maxy-20);c.lineTo(x+7.5,maxy-27);c.lineTo(x+16,maxy-20);c.fill();c.fillRect(x+10,maxy-31,3,7);
    c.fillStyle=night?((x*7)%3?'#FFD27A':'#2A3456'):'#C9D6DF';c.fillRect(x+3,maxy-15,4,5);c.fillRect(x+9,maxy-15,4,5)}
  if(S.weather==='Drizzle'||S.weather==='Cold snap'){c.strokeStyle=S.weather==='Cold snap'?'#fff':'#5C7A8C';c.lineWidth=1;for(let i=0;i<16;i++){const xx=minx+((i*13+t/12)%(maxx-minx+10))-4,yy=Math.min(...q.map(p=>p[1]))+((i*29+t/7)%60);c.beginPath();c.moveTo(xx,yy);c.lineTo(xx-2,yy+5);c.stroke()}}
  c.restore();
}
function drawWallsAndWindows(c,L,t){
  const H=WALLH;
  // wall faces per room along A and B
  L.rooms.forEach(R=>{if(!R.wall)return;
    if(R.y===0)hPoly(c,wallQuad('A',R.x,R.x+R.w,0,H),R.wall);
    if(R.x===0)hPoly(c,wallQuad('B',R.y,R.y+R.d,0,H),shade(R.wall,.9));
    if(R.kind==='bath'){c.strokeStyle='rgba(150,160,170,.45)';c.lineWidth=.6;['A','B'].forEach(s=>{if((s==='A'&&R.y!==0)||(s==='B'&&R.x!==0))return;const a0=s==='A'?R.x:R.y,a1=a0+(s==='A'?R.w:R.d);for(let z=0;z<=1.4;z+=.25){c.beginPath();c.moveTo(...wallPt(s,a0,z));c.lineTo(...wallPt(s,a1,z));c.stroke()}for(let a=a0;a<=a1;a+=.25){c.beginPath();c.moveTo(...wallPt(s,a,0));c.lineTo(...wallPt(s,a,1.4));c.stroke()}})}
  });
  // garden: fence instead of wall
  L.rooms.filter(R=>R.kind==='garden').forEach(R=>{for(let x=R.x;x<=R.x+R.w;x+=.25){const [a,b]=hIso(x,R.y+R.d,0),[a2,b2]=hIso(x,R.y+R.d,.9);c.strokeStyle='#8A6A4A';c.lineWidth=2;c.beginPath();c.moveTo(a,b);c.lineTo(a2,b2);c.stroke()}
    for(let y=R.y;y<=R.y+R.d;y+=.25){const [a,b]=hIso(R.x+R.w,y,0),[a2,b2]=hIso(R.x+R.w,y,.9);c.strokeStyle='#7A5A3A';c.lineWidth=2;c.beginPath();c.moveTo(a,b);c.lineTo(a2,b2);c.stroke()}});
  // skirting
  ['A','B'].forEach(s=>{const len=s==='A'?L.w:L.d;L.rooms.forEach(R=>{if(!R.wall||R.kind==='bath')return;if(s==='A'&&R.y!==0)return;if(s==='B'&&R.x!==0)return;const a0=s==='A'?R.x:R.y,a1=a0+(s==='A'?R.w:R.d);hPoly(c,wallQuad(s,a0,a1,0,.1),'#F7F5F0')})});
  // splashback tiles above kitchen units
  L.fix.filter(f=>f.k==='units').forEach(f=>{const s=f.along;const a0=s==='A'?f.x:f.y,a1=a0+(s==='A'?f.w:f.d);hPoly(c,wallQuad(s,a0,a1,.92,1.45),'#F0F2F3');c.strokeStyle='rgba(120,130,140,.4)';c.lineWidth=.5;for(let a=a0;a<=a1;a+=.2){c.beginPath();c.moveTo(...wallPt(s,a,.92));c.lineTo(...wallPt(s,a,1.45));c.stroke()}
    hBox(c,s==='A'?f.x:0,s==='A'?0:f.y,s==='A'?f.w:.35,s==='A'?.35:f.d,.6,'#E8E2D6',null,1.55)});
  // windows
  L.win.forEach(Wn=>{const q=wallQuad(Wn.s,Wn.a,Wn.a+Wn.l,.95,2.0);windowView(c,q,t);hPoly(c,q,null,'#F7F7F7',3);
    const mid=[wallPt(Wn.s,Wn.a+Wn.l/2,.95),wallPt(Wn.s,Wn.a+Wn.l/2,2.0)];c.strokeStyle='#F7F7F7';c.lineWidth=2.5;c.beginPath();c.moveTo(...mid[0]);c.lineTo(...mid[1]);c.stroke();
    hPoly(c,wallQuad(Wn.s,Wn.a-.05,Wn.a+Wn.l+.05,.88,.95),'#FAFAFA'); // sill
    const hasBlack=S.acc.includes('blackout');
    if(hasBlack){hPoly(c,wallQuad(Wn.s,Wn.a-.25,Wn.a+.15,.9,2.15),'#3A3F55');hPoly(c,wallQuad(Wn.s,Wn.a+Wn.l-.15,Wn.a+Wn.l+.25,.9,2.15),'#3A3F55')}
    else{c.fillStyle='rgba(255,255,255,.35)';const nq=wallQuad(Wn.s,Wn.a+.05,Wn.a+Wn.l-.05,.95,1.35);hPoly(c,nq,'rgba(255,255,255,.4)')} // net curtain
    // light from window in daytime
    if(S.hour>=8&&S.hour<17&&S.weather==='Sunny spell'){c.fillStyle='rgba(255,236,170,.13)';const s=Wn.s;const p1=wallPt(s,Wn.a,.95),p2=wallPt(s,Wn.a+Wn.l,.95),f1=s==='A'?hIso(Wn.a+.8,2.2):hIso(2.2,Wn.a+.8),f2=s==='A'?hIso(Wn.a+Wn.l+.8,2.2):hIso(2.2,Wn.a+Wn.l+.8);hPoly(c,[p1,p2,f2,f1],'rgba(255,236,170,.12)')}
  });
  // front door
  const D=L.door;const dq=wallQuad(D.s,D.a,D.a+D.l,0,2.0);hPoly(c,dq,D.shared?'#C9B79C':'#2B3A48');hPoly(c,dq,null,'#F7F7F7',2);
  if(!D.shared){const lb=wallQuad(D.s,D.a+.25,D.a+.65,.95,1.02);hPoly(c,lb,'#C9921B');const gl=wallQuad(D.s,D.a+.25,D.a+.65,1.4,1.85);hPoly(c,gl,'#9FB6CC')}
  const [kx,ky]=wallPt(D.s,D.a+D.l-.15,1);c.fillStyle='#C9921B';c.beginPath();c.arc(kx,ky,1.8,0,7);c.fill();

  // light switch + socket
  const ls=wallPt(D.s,D.a+D.l+.2,1.15);c.fillStyle='#FAFAFA';c.fillRect(ls[0]-2,ls[1]-3,4,5);c.strokeStyle='#bbb';c.lineWidth=.5;c.strokeRect(ls[0]-2,ls[1]-3,4,5);
  // wall-mounted fixtures: radiators, meter
  L.fix.forEach(f=>{
    if(f.k==='radiator'){const q=wallQuad(f.s,f.a,f.a+f.l,.15,.7);hPoly(c,q,'#F4F4F2','#D8D8D4',.8);c.strokeStyle='#DADAD6';c.lineWidth=.6;for(let a=f.a+.08;a<f.a+f.l;a+=.08){c.beginPath();c.moveTo(...wallPt(f.s,a,.18));c.lineTo(...wallPt(f.s,a,.67));c.stroke()}}
    if(f.k==='meter'){const q=wallQuad(f.s,f.a,f.a+.3,1.5,1.85);hPoly(c,q,S.meterOff?'#C24E36':'#E8E2D6','#999',.6)}
  });
}
function drawFixture(c,f,t){
  const r=fixRect(f);if(!r)return;const {x,y,w,d}=r;
  switch(f.k){
    case 'units':hBox(c,x,y,w,d,.88,'#E8E2D6','#5A4A3A');for(let a=0;a<(f.along==='A'?w:d)-.05;a+=.6){const q=f.along==='A'?[hIso(x+a+.04,y+d,.08),hIso(x+a+.56,y+d,.08),hIso(x+a+.56,y+d,.82),hIso(x+a+.04,y+d,.82)]:[hIso(x+w,y+a+.04,.08),hIso(x+w,y+a+.56,.08),hIso(x+w,y+a+.56,.82),hIso(x+w,y+a+.04,.82)];hPoly(c,q,null,'rgba(0,0,0,.18)',.6)}
      // worktop gadgets
      if(f.along==='A'){const gadgets=S.acc.filter(k=>ITEMS[k].worktop);gadgets.forEach((k,i)=>{const gx=x+.2+i*.45;if(gx+.3>x+w)return;hBox(c,gx,y+.08,.32,.3,k==='blender'?.4:.25,{microwave:'#2A2A2A',airfryer:'#1B1F1D',ricecooker:'#F4F4F2',blender:'#C9D6DF'}[k]||'#888',null,.88)});
        const [kx,ky]=hIso(x+w-.35,y+.25,.88);c.fillStyle='#C24E36';c.fillRect(kx-3,ky-7,6,7);}
      break;
    case 'sink':{const [w2,d2]=[r.w,r.d];hPoly(c,[hIso(x+.08,y+.08,.89),hIso(x+w2-.08,y+.08,.89),hIso(x+w2-.08,y+d2-.08,.89),hIso(x+.08,y+d2-.08,.89)],'#C9CED3');const [tx,ty]=hIso(x+w2/2,y+.08,.89);c.strokeStyle='#999';c.lineWidth=1.5;c.beginPath();c.moveTo(tx,ty);c.lineTo(tx,ty-7);c.lineTo(tx+3,ty-6);c.stroke();break}
    case 'hob':hPoly(c,[hIso(x+.05,y+.05,.9),hIso(x+r.w-.05,y+.05,.9),hIso(x+r.w-.05,y+r.d-.05,.9),hIso(x+.05,y+r.d-.05,.9)],'#1B1F1D');[[.18,.18],[.42,.18],[.18,.42],[.42,.42]].forEach(([a,b])=>{const [px,py]=hIso(x+a,y+b,.91);c.strokeStyle=S.meterOff?'#444':'#666';c.lineWidth=.8;c.beginPath();c.ellipse(px,py,HV.tw*.07,HV.tw*.035,0,0,7);c.stroke()});break;
    case 'fridge':hBox(c,x,y,w,d,1.8,'#E9ECEE');{const q=[hIso(x,y+d,1.1),hIso(x+w,y+d,1.1)];c.strokeStyle='#bbb';c.lineWidth=.7;c.beginPath();c.moveTo(...q[0]);c.lineTo(...q[1]);c.stroke()}break;
    case 'washer':hBox(c,x,y,w,d,.85,'#F2F3F4');{const [px,py]=hIso(x+w/2,y+d,.45);c.fillStyle='#9FB6CC';c.beginPath();c.ellipse(px,py+1,HV.tw*.12,HV.tw*.12,0,0,7);c.fill();c.strokeStyle='#bbb';c.stroke()}break;
    case 'boiler':hBox(c,x,y,w,d,2,'#EDE7DA');{const [px,py]=hIso(x+w/2,y+d,1.2);c.fillStyle='#bbb';c.fillRect(px-2,py-2,4,4)}break;
    case 'bath':hBox(c,x,y,w,d,.55,'#F7F8F8');hPoly(c,[hIso(x+.08,y+.08,.56),hIso(x+w-.08,y+.08,.56),hIso(x+w-.08,y+d-.08,.56),hIso(x+.08,y+d-.08,.56)],'#BFD8E8');
      {const sx=x+w/2,sy=y+.05;const [a,b]=hIso(sx,sy,1.9),[a2,b2]=hIso(sx,sy,.56);c.strokeStyle='#C9CED3';c.lineWidth=1.5;c.beginPath();c.moveTo(a2,b2);c.lineTo(a,b);c.stroke();c.fillStyle='#C9CED3';c.beginPath();c.arc(a,b,2.5,0,7);c.fill();
       hPoly(c,[hIso(x,y+d*.45,.56),hIso(x+w,y+d*.45,.56),hIso(x+w,y+d*.45,1.8),hIso(x,y+d*.45,1.8)],'rgba(200,225,240,.35)','rgba(255,255,255,.6)',.6)}break;
    case 'toilet':hBox(c,x+.05,y,w-.1,.2,.75,'#F7F8F8');hBox(c,x+.05,y+.2,w-.1,d-.25,.4,'#F7F8F8','#EDEFF0');break;
    case 'basin':hBox(c,x+.15,y+.1,w-.3,d-.15,.6,'#E8EAEC');hBox(c,x,y,w,d,.12,'#F7F8F8','#BFD8E8',.72);{const q=[hIso(x,y,1.1),hIso(x+w,y,1.1),hIso(x+w,y,1.6),hIso(x,y,1.6)];hPoly(c,q,'#CFE3EE','#bbb',.6)}break;
    case 'airer':{const z=.8;c.strokeStyle='#bbb';c.lineWidth=1;[[0,0],[w,0],[0,d],[w,d]].forEach(([a,b])=>{c.beginPath();c.moveTo(...hIso(x+a,y+b,0));c.lineTo(...hIso(x+a,y+b,z));c.stroke()});
      ['#C24E36','#2B5BA8','#F2B705','#fff','#08774C'].forEach((col,i)=>{const a=x+.1+i*(w-.2)/5;hPoly(c,[hIso(a,y+.05,z),hIso(a+.15,y+.05,z),hIso(a+.15,y+d-.05,z-.35),hIso(a,y+d-.05,z-.35)],col)})}break;
    case 'washline':{const [a,b]=hIso(x,y,1.6),[a2,b2]=hIso(x+w,y,1.6);c.strokeStyle='#ddd';c.lineWidth=1;c.beginPath();c.moveTo(a,b);c.lineTo(a2,b2);c.stroke();[[x,y],[x+w,y]].forEach(([p,q2])=>{c.strokeStyle='#888';c.lineWidth=1.5;c.beginPath();c.moveTo(...hIso(p,q2,0));c.lineTo(...hIso(p,q2,1.65));c.stroke()});
      ['#C24E36','#fff','#2B5BA8','#F2B705','#6A2C91'].forEach((col,i)=>{const p=x+.3+i*.45;hPoly(c,[hIso(p,y,1.6),hIso(p+.3,y,1.6),hIso(p+.3,y,1.15),hIso(p,y,1.15)],col)})}break;
    case 'shed':hBox(c,x,y,w,d,1.4,'#7A5A3A','#5A4030');break;
    case 'hotelbed':hBox(c,x,y,w,d,.5,'#7A6E66');hBox(c,x+.05,y+.6,w-.1,d-.65,.06,'#F4F1EA',null,.5);hBox(c,x+.1,y+.08,w-.2,.4,.12,'#fff',null,.5);break;
    case 'tray':hBox(c,x,y,w,d,.75,'#7A5233');{const [a,b]=hIso(x+.3,y+.3,.75);c.fillStyle='#fff';c.fillRect(a-3,b-6,6,6)}break;
  }
}
function drawItem(c,it,t){
  const I=ITEMS[it.k],[w,d,h]=itemSize(it),x=it.x,y=it.y,col=I.col,r=it.rot;
  const night=S.hour<6.5||S.hour>=19;
  switch(I.st){
    case 'bed':{hBox(c,x,y,w,d,h*.6,col);hBox(c,x+.03,y+.03,w-.06,d-.06,h*.4,'#F4F1EA',null,h*.6);
      const duvet=S.acc.includes('blanket')?'#E2A13B':I.col2;
      if(!r){hBox(c,x+.03,y+d*.35,w-.06,d*.62,.05,duvet,null,h);hBox(c,x+.1,y+.08,w-.2,.3,.1,'#fff',null,h);if(it.k!=='mattress')hBox(c,x,y-.02,w,.1,h+.55,shade(col,.8))}
      else{hBox(c,x+w*.35,y+.03,w*.62,d-.06,.05,duvet,null,h);hBox(c,x+.08,y+.1,.3,d-.2,.1,'#fff',null,h);if(it.k!=='mattress')hBox(c,x-.02,y,.1,d,h+.55,shade(col,.8))}break}
    case 'sofa':{hBox(c,x,y,w,d,h,col);if(!r){hBox(c,x,y,w,.22,h+.4,shade(col,.92));hBox(c,x,y,.18,d,h+.2,shade(col,.85));hBox(c,x+w-.18,y,.18,d,h+.2,shade(col,.85))}else{hBox(c,x,y,.22,d,h+.4,shade(col,.92));hBox(c,x,y,w,.18,h+.2,shade(col,.85));hBox(c,x,y+d-.18,w,.18,h+.2,shade(col,.85))}break}
    case 'corner':{const A=r?[d,w]:[w,d];hBox(c,x,y,w,.9>d?d:.9,h,col);hBox(c,x,y,.9,d,h,col);hBox(c,x,y,w,.22,h+.4,shade(col,.92));hBox(c,x,y,.22,d,h+.4,shade(col,.92));break}
    case 'table':hBox(c,x,y,w,d,.06,col,null,h-.06);[[.05,.05],[w-.1,.05],[.05,d-.1],[w-.1,d-.1]].forEach(([a,b])=>hBox(c,x+a,y+b,.05,.05,h-.06,shade(col,.8)));break;
    case 'dining':{const tx=x+.35,ty=y+.35,tw=w-.7,td=d-.7;
      [[tw/2-.18,-.33],[-.33,td/2-.18]].forEach(([a,b])=>hBox(c,tx+a,ty+b,.36,.36,.45,shade(col,.9)));
      hBox(c,tx,ty,tw,td,.06,col,null,h-.06);hBox(c,tx+tw/2-.06,ty+td/2-.06,.12,.12,h-.06,shade(col,.8));
      [[tw/2-.18,td-.03],[tw-.03,td/2-.18]].forEach(([a,b])=>hBox(c,tx+a,ty+b,.36,.36,.45,shade(col,.9)));break}
    case 'chair':hBox(c,x,y,w,d,h,col);hBox(c,x,y,w,.08,h+.45,shade(col,.85));break;
    case 'wardrobe':hBox(c,x,y,w,d,h,col);{const s=r?[hIso(x+w,y+d/2,.1),hIso(x+w,y+d/2,h-.1)]:[hIso(x+w/2,y+d,.1),hIso(x+w/2,y+d,h-.1)];c.strokeStyle='rgba(0,0,0,.25)';c.lineWidth=.8;c.beginPath();c.moveTo(...s[0]);c.lineTo(...s[1]);c.stroke()}break;
    case 'drawers':hBox(c,x,y,w,d,h,col);for(let z=.25;z<h;z+=.25){const q=r?[hIso(x+w,y+.05,z),hIso(x+w,y+d-.05,z)]:[hIso(x+.05,y+d,z),hIso(x+w-.05,y+d,z)];c.strokeStyle='rgba(0,0,0,.25)';c.lineWidth=.6;c.beginPath();c.moveTo(...q[0]);c.lineTo(...q[1]);c.stroke()}break;
    case 'bedside':hBox(c,x,y,w,d,h,col);lampHead(c,x+w/2,y+d/2,h,night);break;
    case 'lamp':{const [a,b]=hIso(x+w/2,y+d/2,0),[a2,b2]=hIso(x+w/2,y+d/2,h);c.strokeStyle='#2A2A2A';c.lineWidth=1.5;c.beginPath();c.moveTo(a,b);c.lineTo(a2,b2);c.stroke();lampHead(c,x+w/2,y+d/2,h-.1,night);break}
    case 'mirror':hBox(c,x,y,w,d,h,'#C9CED3','#C9CED3');{const q=r?[hIso(x+w,y+.05,.05),hIso(x+w,y+d-.05,.05),hIso(x+w,y+d-.05,h-.05),hIso(x+w,y+.05,h-.05)]:[hIso(x+.05,y+d,.05),hIso(x+w-.05,y+d,.05),hIso(x+w-.05,y+d,h-.05),hIso(x+.05,y+d,h-.05)];hPoly(c,q,'#DCEBF4')}break;
    case 'tv':{hBox(c,x,y,w,d,h,'#5A4A3A');const sx=r?x:x+.05,sy=r?y+.05:y;const sw=r?.08:w-.1,sd=r?d-.1:.08;const big=I.big?1.05:.75;hBox(c,sx,sy,sw,sd,big,'#111',null,h);
      const q=r?[hIso(sx+sw,sy+.03,h+.05),hIso(sx+sw,sy+sd-.03,h+.05),hIso(sx+sw,sy+sd-.03,h+big-.05),hIso(sx+sw,sy+.03,h+big-.05)]:[hIso(sx+.03,sy+sd,h+.05),hIso(sx+sw-.03,sy+sd,h+.05),hIso(sx+sw-.03,sy+sd,h+big-.05),hIso(sx+.03,sy+sd,h+big-.05)];
      hPoly(c,q,S.meterOff?'#222':anim.tvOn?`hsl(${(t/20)%360},45%,45%)`:'#24324A');if(S.acc.includes('soundbar'))hBox(c,x+.1,y+d-.12,w-.2,.1,.08,'#222',null,h);if(S.acc.includes('console'))hBox(c,x+w-.35,y+.1,.28,.22,.08,'#F4F4F2',null,h);break}
    case 'shelf':hBox(c,x,y,w,d,h,col);for(let z=.15;z<h-.2;z+=.42)for(let k=0;k<6;k++){const a=x+.06+k*(w-.12)/6;const q=r?null:[hIso(a,y+d,z),hIso(a+.1,y+d,z),hIso(a+.1,y+d,z+.3),hIso(a,y+d,z+.3)];if(q)hPoly(c,q,['#C24E36','#08774C','#2B3A8C','#C9921B','#6A2C91','#E8E2D6'][(k+Math.round(z*10))%6])}break;
    case 'plant':hBox(c,x+.08,y+.08,w-.16,d-.16,.3,'#B5651D');foliage(c,x+w/2,y+d/2,.45,1);break;
    case 'bigplant':hBox(c,x+.1,y+.1,w-.2,d-.2,.4,'#E8E2D6');foliage(c,x+w/2,y+d/2,.9,1.6);break;
    case 'rug':{const q=[hIso(x,y),hIso(x+w,y),hIso(x+w,y+d),hIso(x,y+d)];hPoly(c,q,col==='ankara'?fabricPattern('red'):'#7A2E2E');if(col==='persian'){const q2=[hIso(x+.15,y+.15),hIso(x+w-.15,y+.15),hIso(x+w-.15,y+d-.15),hIso(x+.15,y+d-.15)];hPoly(c,q2,null,'#E2B46B',1.5);const q3=[hIso(x+.4,y+.4),hIso(x+w-.4,y+.4),hIso(x+w-.4,y+d-.4),hIso(x+.4,y+d-.4)];hPoly(c,q3,'#2B3A5C')}break}
    case 'mat':{const q=[hIso(x,y),hIso(x+w,y),hIso(x+w,y+d),hIso(x,y+d)];hPoly(c,q,'#2B5BA8');hBox(c,x+.1,y+.1,.15,.25,.12,'#222');hBox(c,x+.4,y+.1,.15,.25,.12,'#222');break}
    case 'speaker':hBox(c,x,y,w,d,h,col);{const [a,b]=hIso(x+w/2,y+d,h*.55);c.fillStyle='#555';c.beginPath();c.arc(a,b,HV.tw*.06,0,7);c.fill()}break;
    case 'desk':hBox(c,x,y,w,d,.05,col,null,h-.05);[[.03,.03],[w-.08,.03],[.03,d-.08],[w-.08,d-.08]].forEach(([a,b])=>hBox(c,x+a,y+b,.05,.05,h-.05,shade(col,.8)));
      if(S.acc.includes('laptop')){hBox(c,x+w/2-.18,y+.12,.36,.25,.02,'#888',null,h);hPoly(c,[hIso(x+w/2-.18,y+.12,h+.02),hIso(x+w/2+.18,y+.12,h+.02),hIso(x+w/2+.18,y+.12,h+.28),hIso(x+w/2-.18,y+.12,h+.28)],'#9FB6CC')}
      if(S.acc.includes('officechair'))hBox(c,x+w/2-.22,y+d+.05,.44,.44,.48,'#1B1F1D');break;
    case 'ring':{const [a,b]=hIso(x+w/2,y+d/2,0),[a2,b2]=hIso(x+w/2,y+d/2,h);c.strokeStyle='#777';c.lineWidth=1.5;c.beginPath();c.moveTo(a,b);c.lineTo(a2,b2);c.stroke();c.strokeStyle='#FFF7D6';c.lineWidth=2.5;c.beginPath();c.arc(a2,b2-4,HV.tw*.13,0,7);c.stroke();break}
    case 'bike':hBox(c,x+.15,y+.1,w-.3,d-.2,.15,col);hBox(c,x+w/2-.08,y+d*.6,.16,.16,.75,col);hBox(c,x+w/2-.15,y+d*.6,.3,.25,.06,'#111',null,.75);hBox(c,x+w/2-.05,y+.15,.1,.1,1.05,col);{const [a,b]=hIso(x+w/2,y+.35,.3);c.strokeStyle='#888';c.lineWidth=1.2;c.beginPath();c.arc(a,b,HV.tw*.12,0,7);c.stroke()}break;
    case 'bbq':hBox(c,x,y,w,d,h-.15,'#2A2A2A');hBox(c,x-.03,y-.03,w+.06,d+.06,.06,'#555',null,h-.15);if(anim.bbq){for(let k=0;k<3;k++){c.fillStyle='rgba(180,180,180,.5)';const [a,b]=hIso(x+w/2,y+d/2,h+.3+k*.3);c.beginPath();c.arc(a+Math.sin(t/300+k)*3,b,4+k*2,0,7);c.fill()}}break;
    default:hBox(c,x,y,w,d,h,col);
  }
}
function lampHead(c,x,y,z,night){const [a,b]=hIso(x,y,z+.25);c.fillStyle='#F4E6C8';c.beginPath();c.moveTo(a-5,b+4);c.lineTo(a+5,b+4);c.lineTo(a+3,b-3);c.lineTo(a-3,b-3);c.fill();
  if(night){const g=c.createRadialGradient(a,b,2,a,b,HV.tw*1.6);g.addColorStop(0,'rgba(255,214,120,.45)');g.addColorStop(1,'rgba(255,214,120,0)');c.fillStyle=g;c.fillRect(a-HV.tw*1.6,b-HV.tw*1.6,HV.tw*3.2,HV.tw*3.2)}}
function foliage(c,x,y,z,s){const [a,b]=hIso(x,y,z);const r=HV.tw*.12*s;c.fillStyle='#2F8F4E';[[-1,0],[1,-.3],[0,-1],[-.5,.6],[.6,.5]].forEach(([p,q])=>{c.beginPath();c.arc(a+p*r,b+q*r,r,0,7);c.fill()});c.fillStyle='#4FA866';c.beginPath();c.arc(a-r*.3,b-r*.6,r*.7,0,7);c.fill()}
function drawWallItem(c,it){
  const I=ITEMS[it.k],s=it.wall,a=it.at,q=(a0,a1,z0,z1)=>wallQuad(s,a0,a1,z0,z1);
  if(I.st==='photos'){[[a,1.3,.35,.3,'#E7C9A0'],[a+.4,1.4,.3,.25,'#BFD8E8'],[a+.1,1.7,.45,.28,'#F2D3D3']].forEach(([p,z,w,h,col])=>{hPoly(c,q(p,p+w,z,z+h),'#5B3A1E');hPoly(c,q(p+.03,p+w-.03,z+.03,z+h-.03),col)})}
  if(I.st==='art'){hPoly(c,q(a,a+.7,1.2,1.85),'#2B2620');hPoly(c,q(a+.05,a+.65,1.25,1.8),fabricPattern('gold'))}
  if(I.st==='flag'){hPoly(c,q(a,a+.25,1.3,1.75),'#08774C');hPoly(c,q(a+.25,a+.5,1.3,1.75),'#FFFFFF');hPoly(c,q(a+.5,a+.75,1.3,1.75),'#08774C')}
  if(I.st==='clock'){const [x,y]=wallPt(s,a+.25,1.75);c.fillStyle='#fff';c.strokeStyle='#333';c.lineWidth=1;c.beginPath();c.ellipse(x,y,HV.tw*.12,HV.tw*.14,0,0,7);c.fill();c.stroke();c.beginPath();c.moveTo(x,y);c.lineTo(x,y-HV.tw*.09);c.moveTo(x,y);c.lineTo(x+HV.tw*.06,y);c.stroke()}
}
function drawFairy(c,L,t){if(!S.acc.includes('fairy'))return;const night=S.hour<7||S.hour>=18;['A','B'].forEach(s=>{const len=s==='A'?L.w:L.d;for(let a=.1;a<len;a+=.22){const [x,y]=wallPt(s,a,2.05+Math.sin(a*3)*.05);c.fillStyle=night?['#FFD45A','#FF8FB1','#9AD0FF'][Math.floor(a*5)%3]:'#ddd';c.beginPath();c.arc(x,y,night?1.8:1,0,7);c.fill()}})}

function drawHome2(t){
  ensureItems();const L=LAY();fitView(L);readColors();
  const c=ctx;c.fillStyle=colors['--surface']||'#fff';c.fillRect(0,0,360,230);
  L.rooms.forEach(R=>floorPattern(c,R,R.floor));
  // rugs under everything
  S.items.filter(it=>ITEMS[it.k].floor).forEach(it=>drawItem(c,it,t));
  drawWallsAndWindows(c,L,t);
  S.items.filter(it=>ITEMS[it.k].wallItem).forEach(it=>drawWallItem(c,it));
  drawFairy(c,L,t);
  // depth-sorted drawables
  const dr=[];
  L.fix.forEach(f=>{const r=fixRect(f);if(r)dr.push({d:r.x+r.w+r.y+r.d,f:()=>drawFixture(c,f,t)})});
  wallSegs(L).forEach(sg=>{const th=.1;const x=sg.x1-(sg.x1===sg.x2?th/2:0),y=sg.y1-(sg.y1===sg.y2?th/2:0),w=sg.x1===sg.x2?th:sg.x2-sg.x1,d=sg.y1===sg.y2?th:sg.y2-sg.y1;
    const R=roomAt(x+w/2+.06,y+d/2+.06)||L.rooms[0];dr.push({d:x+w+y+d-.2,f:()=>hBox(c,x,y,w,d,.7,R.wall?shade(R.wall,.95):'#ccc','#F7F5F0')})});
  S.items.filter(it=>!ITEMS[it.k].floor&&!ITEMS[it.k].wallItem).forEach(it=>{const [w,d]=itemSize(it);dr.push({d:it.x+w+it.y+d-.3,f:()=>{drawItem(c,it,t);if(DEC.sel===it.u)selBox(c,it)}})});
  dr.push({d:anim.x+anim.y,f:()=>{const [x,y]=hIso(anim.x,anim.y);drawPerson(c,x,y,S.look,.6*HV.tw/48,{walk:anim.walking,t,mood:mood()});if(anim.emote&&t<anim.emoteUntil)bubble(x,y-HV.tw*.95,anim.emote)}});
  if(married())dr.push({d:6,f:()=>{const p=idleSpot();const [x,y]=hIso(p[0]+.5,p[1]+.3);drawPerson(c,x,y,lookOf(S.partner),.6*HV.tw/48,{t})}});
  dr.sort((a,b)=>a.d-b.d).forEach(o=>o.f());
  if(DEC.on){S.items.filter(it=>ITEMS[it.k].floor&&DEC.sel===it.u).forEach(it=>selBox(c,it))}
  // night tint
  const night=S.hour<6.5||S.hour>=19.5;if(night){c.fillStyle='rgba(20,28,60,.22)';c.fillRect(0,0,360,230)}
  // room labels in decorate mode
  if(DEC.on){c.font='800 8px Figtree,sans-serif';c.textAlign='center';L.rooms.forEach(R=>{const [x,y]=hIso(R.x+R.w/2,R.y+R.d/2);c.fillStyle='rgba(255,255,255,.85)';const w=c.measureText(R.n).width+8;c.fillRect(x-w/2,y-7,w,11);c.fillStyle='#18221E';c.fillText(R.n,x,y+1)})}
}
function selBox(c,it){const [w,d,h]=itemSize(it);const q=[hIso(it.x,it.y),hIso(it.x+w,it.y),hIso(it.x+w,it.y+d),hIso(it.x,it.y+d)];hPoly(c,q,'rgba(242,183,5,.25)','#F2B705',2)}

/* ---------- decorate mode ---------- */
const DEC={on:false,sel:null};
function decSelected(){return S.items.find(i=>i.u===DEC.sel)||S.store.find(i=>i.u===DEC.sel)}
function decMove(dx,dy){const it=S.items.find(i=>i.u===DEC.sel);if(!it)return;if(ITEMS[it.k].wallItem){const sp=wallSpots();const k=sp.findIndex(p=>p.s===it.wall&&p.a===it.at);const n=sp[(k+(dx+dy>0?1:-1)+sp.length)%sp.length];if(n){it.wall=n.s;it.at=n.a}return}
  const grid=blockGrid(it.u);const nx=it.x+dx*CELL,ny=it.y+dy*CELL;if(fits(it,nx,ny,it.rot,grid)){it.x=nx;it.y=ny}else toast("It won't fit there.")}
function decRotate(){const it=S.items.find(i=>i.u===DEC.sel);if(!it||ITEMS[it.k].wallItem)return;const grid=blockGrid(it.u);if(fits(it,it.x,it.y,it.rot?0:1,grid))it.rot=it.rot?0:1;else toast('No room to turn it here.')}
function decStore(){const k=S.items.findIndex(i=>i.u===DEC.sel);if(k<0)return;const it=S.items.splice(k,1)[0];delete it.x;delete it.y;S.store.push(it)}
function decPlace(u){const k=S.store.findIndex(i=>i.u===u);if(k<0)return;if(LAY().hotel){toast("You can't furnish a hotel room.");return}const it=S.store[k];const pos=autoPlace(it);if(!pos){toast('No space. Store or sell something first, or move to a bigger home.');return}Object.assign(it,pos);S.store.splice(k,1);S.items.push(it);DEC.sel=it.u}
function decSell(){let it=S.items.find(i=>i.u===DEC.sel),from=S.items;if(!it){it=S.store.find(i=>i.u===DEC.sel);from=S.store}if(!it)return;if(ITEMS[it.k].sell===false){toast('Nobody wants this one. Store it instead.');return}const v=Math.round(ITEMS[it.k].p*.5);from.splice(from.indexOf(it),1);earn(v,`Sold ${ITEMS[it.k].n}`);DEC.sel=null;toast(`Sold for ${gbp(v)}.`)}
function decTap(px,py){ // canvas logical coords
  if(!DEC.on)return;let best=null,bd=1e9;
  S.items.forEach(it=>{if(ITEMS[it.k].wallItem){const p=wallPt(it.wall,it.at+.3,1.5);const dd=Math.hypot(p[0]-px,p[1]-py);if(dd<14&&dd<bd){bd=dd;best=it}return}const [w,d,h]=itemSize(it);const p=hIso(it.x+w/2,it.y+d/2,h/2);const dd=Math.hypot(p[0]-px,p[1]-py);if(dd<HV.tw*.9&&dd<bd){bd=dd;best=it}});
  if(best){DEC.sel=best.u;render();return}
  const it=S.items.find(i=>i.u===DEC.sel);if(!it||ITEMS[it.k].wallItem)return;
  // inverse iso at floor level
  const u=(px-HV.ox)/(HV.tw/2),v=(py-HV.oy)/(HV.th/2);const gx=Math.round((u+v)/2/CELL)*CELL,gy=Math.round((v-u)/2/CELL)*CELL;const [w,d]=itemSize(it);
  const nx=Math.round((gx-w/2)/CELL)*CELL,ny=Math.round((gy-d/2)/CELL)*CELL;if(fits(it,nx,ny,it.rot,blockGrid(it.u))){it.x=nx;it.y=ny;render()}else toast("It won't fit there.");
}

/* ---------- moving home ---------- */
function moveHome(id){
  const h=CITIES[S.city].homes.find(x=>x.id===id),old=homeDef();if(!h||h.id===S.home)return;
  const dep=(h.rent||0)*5,refund=(old.rent||0)*5,cost=dep+(h.rent||0)+80-refund;
  if(S.workBan){toast('You can\'t move out of the hotel while your claim is pending.');return}
  if(S.money<cost){toast(`You need ${gbp(cost)} for the deposit, first week and van.`);return}
  if(refund)earn(refund,'Deposit returned (DPS)');spend(dep,'New deposit (5 weeks)');if(h.rent)spend(h.rent,'First week rent');spend(80,'Man with a van');
  const all=[...S.items,...S.store];S.items=[];S.store=[];S.home=id;S.at='home';CM=null;anim.reset=true;
  all.sort((a,b)=>(ITEMS[b.k].sz?ITEMS[b.k].sz[0]*ITEMS[b.k].sz[1]:0)-(ITEMS[a.k].sz?ITEMS[a.k].sz[0]*ITEMS[a.k].sz[1]:0)).forEach(it=>{delete it.x;delete it.y;delete it.wall;const pos=LAY().hotel?null:autoPlace(it);if(pos){Object.assign(it,pos);S.items.push(it)}else S.store.push(it)});
  log(`Moved into a ${h.name}. ${S.store.length?`${S.store.length} items went into storage.`:'Everything fits.'}`,'good');
  msg('mummy',`New house!! Send me pictures. Is there space for me when I visit? 😄`);
}
function homeBills(h){h=h||homeDef();return {room:0,hotel:0,studio:28,flat:34,house:45}[h.layout||(h.hotel?'hotel':h.shared?'room':'studio')]}

function relayout(){S.store.slice().forEach(it=>{const pos=LAY().hotel?null:autoPlace(it);if(pos){Object.assign(it,pos);S.store.splice(S.store.indexOf(it),1);S.items.push(it)}})}
