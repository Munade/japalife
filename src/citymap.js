/* ---------- virtual city map (isometric) ---------- */
const CY={N:46,TW:30,TH:15,ZH:13,SC:2,PADX:30,PADT:150,PADB:40};
let CM=null;
const CMV={cv:null,ctx:null,cam:{x:0,y:0,z:.8},raf:0,ptrs:new Map(),drag:null,trip:null,cars:[],walkers:[],last:0};
const CY_RIVER={london:{dir:'h',at:4,name:'River Thames'},manchester:{dir:'v',at:3,name:'River Irwell'},leeds:{dir:'h',at:5,name:'River Aire'}};
const VICON={lounge:'🍸',bar:'🍹',karaoke:'🎤',dayparty:'🔊',retail:'🛒',warehouse:'📦',mybiz:'🏪',home:'🏠',restaurant:'🍛',chicken:'🍗',cafe:'☕',caribbean:'🌶️',fine:'⭐',market:'🛍️',salon:'💈',office:'💼',carehome:'🏥',kitchen:'🍳',campus:'🎓',library:'📚',church:'⛪',hall:'🎉',club:'🪩',gym:'🏋️',park:'🌳',pub:'⚽',test:'📝',airport:'✈️'};
function cyRng(seed){let s=(seed>>>0)||7;return()=>{s^=s<<13;s^=s>>>17;s^=s<<5;return ((s>>>0)%1000000)/1000000}}
const cyIso=(i,j,z=0)=>[CY.PADX+CY.N*CY.TW/2+(i-j)*CY.TW/2,CY.PADT+(i+j)*CY.TH/2-z*CY.ZH];

function buildCity(){
  const N=CY.N,city=S.city,R=CY_RIVER[city],r=cyRng(Math.floor(hash(city+'v2')*4e9)),rp=a=>a[Math.floor(r()*a.length)];
  const tile=[];for(let i=0;i<N;i++){tile[i]=[];for(let j=0;j<N;j++)tile[i][j]=(i%5===0||j%5===0)?'road':'lot'}
  const inRiver=(bi,bj)=>R.dir==='h'?bj===R.at:bi===R.at;
  for(let i=0;i<N;i++)for(let j=0;j<N;j++){const bi=Math.floor(i/5),bj=Math.floor(j/5);
    const water=R.dir==='h'?(j>R.at*5&&j<R.at*5+5):(i>R.at*5&&i<R.at*5+5);
    if(water)tile[i][j]=tile[i][j]==='road'?'bridge':'water';}
  const B=9,blocks=[];for(let bi=0;bi<B;bi++)for(let bj=0;bj<B;bj++)if(!inRiver(bi,bj))blocks.push([bi,bj]);
  // placement targets from real coordinates
  const vs=venues().filter(v=>!v.trip);
  const pts=vs.filter(v=>v.type!=='airport');
  const lat0=pts.reduce((a,v)=>a+v.ll[0],0)/pts.length;
  const px=v=>v.ll[1]*Math.cos(lat0*Math.PI/180),py=v=>-v.ll[0];
  const norm=(arr,f)=>{const xs=arr.map(f),mn=Math.min(...xs),mx=Math.max(...xs),srt=[...xs].sort((a,b)=>a-b);return v=>{const x=f(v);const lin=(x-mn)/((mx-mn)||1);const rk=srt.indexOf(x)/((srt.length-1)||1);return .55*rk+.45*lin}};
  const nx=norm(pts,px),ny=norm(pts,py);
  const taken={},venueLot={},parkBlocks=[];
  // airport block: corner nearest real direction
  const ap=vs.find(v=>v.type==='airport');
  const corners=[[0,0],[8,0],[0,8],[8,8]].filter(([a,b])=>!inRiver(a,b));
  let apBlock=corners[0];
  if(ap){const ax=(px(ap)>px(pts[0])?1:0),ay=(py(ap)>py(pts[0])?1:0);apBlock=corners.find(([a,b])=>a===(ax?8:0)&&b===(ay?8:0))||corners[0];}
  taken[apBlock+'']='airport';
  // parks: venue park + 3 decorative
  const pv=vs.find(v=>v.type==='park');
  const nearestBlock=(ti,tj)=>blocks.filter(b=>!taken[b+'']).sort((a,b)=>Math.hypot(a[0]-ti,a[1]-tj)-Math.hypot(b[0]-ti,b[1]-tj))[0];
  if(pv){const b=nearestBlock(nx(pv)*8,ny(pv)*8);taken[b+'']='park';parkBlocks.push(b);venueLot[pv.id]={block:b}}
  for(let k=0;k<3;k++){const b=rp(blocks.filter(b=>!taken[b+'']&&Math.abs(b[0]-4)+Math.abs(b[1]-4)>1));if(b){taken[b+'']='park';parkBlocks.push(b)}}
  // lots
  const lots=[];blocks.filter(b=>!taken[b+'']).forEach(([bi,bj])=>{for(let li=0;li<2;li++)for(let lj=0;lj<2;lj++)lots.push({bi,bj,i0:bi*5+1+li*2,j0:bj*5+1+lj*2})});
  const order=['home','mybiz','club','lounge','bar','karaoke','dayparty','retail','warehouse','restaurant','fine','market','office','carehome','kitchen','church','hall','club','salon','chicken','cafe','caribbean','campus','library','gym','pub','test'];
  const sorted=vs.filter(v=>v.type!=='airport'&&v.type!=='park').sort((a,b)=>order.indexOf(a.type)-order.indexOf(b.type));
  const usedLot=new Set();
  sorted.forEach(v=>{const ti=1+nx(v)*(N-4),tj=1+ny(v)*(N-4);
    let best=null,bd=1e9;lots.forEach((L,k)=>{if(usedLot.has(k))return;const d=Math.hypot(L.i0+1-ti,L.j0+1-tj);if(d<bd){bd=d;best=k}});
    usedLot.add(best);venueLot[v.id]={lot:lots[best]}});
  if(ap)venueLot[ap.id]={block:apBlock};
  // buildings
  const blds=[];
  lots.forEach((L,k)=>{
    const vid=Object.keys(venueLot).find(id=>venueLot[id].lot===L);
    if(vid){blds.push(venueBuilding(venue(vid),L.i0,L.j0));return}
    const centre=Math.hypot(L.bi-4,L.bj-4),x=r();
    if(x<.1){blds.push({kind:'trees',i0:L.i0,j0:L.j0,w:2,d:2,h:0});return}
    if(centre<1.6&&x<.5){blds.push({kind:'tower',i0:L.i0+.15,j0:L.j0+.15,w:1.7,d:1.7,h:5+r()*5,wall:rp(['#7FA6C9','#8FB3C9','#A9B9C6','#6E8FAE']),roof:'#5E6B78'});return}
    if(x<.6){blds.push({kind:'terrace',i0:L.i0+.1,j0:L.j0+.25,w:1.8,d:1.5,h:1.4+r()*.5,wall:rp(['#A0573F','#B5654A','#9A4E3A','#C2896A','#8E5A44']),roof:rp(['#4E3B33','#5A4036','#3F3F45'])});return}
    if(x<.74){blds.push({kind:'flats',i0:L.i0+.2,j0:L.j0+.2,w:1.6,d:1.6,h:(centre<3?2.6:2)+r()*(centre<3?2.6:1.2),wall:rp(['#D9D4C7','#C9C2B2','#E2DCCF','#B9B3A6']),roof:'#8A8F94'});return}
    blds.push({kind:'shop',i0:L.i0+.15,j0:L.j0+.2,w:1.7,d:1.6,h:1.3+r()*.5,wall:rp(['#E4D7C1','#D8C3A5','#CDB79E','#E8E1D3']),roof:'#6B6B6B',awn:rp(['#C24E36','#2B5BA8','#08774C','#C9921B','#6A2C91'])});
  });
  // park + airport blocks
  parkBlocks.forEach(([bi,bj])=>{const isV=pv&&venueLot[pv.id].block===parkBlocks[0]&&bi===parkBlocks[0][0]&&bj===parkBlocks[0][1];blds.push({kind:'parkblock',i0:bi*5+1,j0:bj*5+1,w:4,d:4,h:0,venueId:isV?pv.id:null,seed:r()})});
  blds.push({kind:'airport',i0:apBlock[0]*5+1,j0:apBlock[1]*5+1,w:4,d:4,h:0,venueId:ap?ap.id:null});
  // district labels from venue areas
  const districts={};vs.forEach(v=>{const area=((v.area||v.name.split(',')[1]||'').split(',')[0]).trim();if(!area||v.type==='airport')return;const pos=venueCentre(v,venueLot);if(!pos)return;(districts[area]=districts[area]||[]).push(pos)});
  CM={city,tile,blds,venueLot,R,districts:Object.entries(districts).map(([n,ps])=>({n,i:ps.reduce((a,p)=>a+p[0],0)/ps.length,j:ps.reduce((a,p)=>a+p[1],0)/ps.length})),windows:[]};
  renderCityStatic();
  CMV.cars=[];for(let k=0;k<22;k++)CMV.cars.push(newCar());
  CMV.walkers=[];for(let k=0;k<30;k++)CMV.walkers.push(newWalker());
}
function venueCentre(v,vl=CM.venueLot){const p=vl[v.id];if(!p)return null;if(p.lot)return [p.lot.i0+1,p.lot.j0+1];return [p.block[0]*5+3,p.block[1]*5+3]}
function venueBuilding(v,i0,j0){
  const T={home:{h:1.7,wall:'#B5654A',roof:'#4E3B33',door:'#08774C'},restaurant:{h:1.6,wall:'#F1D9B5',roof:'#7A4A2A',awn:'#C24E36'},chicken:{h:1.4,wall:'#F6E7C1',roof:'#C24E36',awn:'#F2B705'},
    cafe:{h:1.5,wall:'#E9DED0',roof:'#5E6B78',awn:'#08774C',stripe:1},caribbean:{h:1.4,wall:'#F4E3A1',roof:'#08774C',awn:'#111'},fine:{h:2.4,wall:'#2B2620',roof:'#C9921B',awn:'#C9921B'},
    market:{h:0,stalls:1},salon:{h:1.5,wall:'#D8E2DC',roof:'#5E6B78',pole:1,awn:'#C24E36'},office:{h:9,wall:'#6E9BC4',roof:'#4E5B68',glass:1},carehome:{h:2.2,wall:'#E6EFE9',roof:'#7A9E7E',wide:1},
    kitchen:{h:1.6,wall:'#D9DEE2',roof:'#5E6B78',awn:'#2B5BA8'},campus:{h:3.2,wall:'#E7E1D5',roof:'#8A6A4A',cols:1},library:{h:2.6,wall:'#B07A55',roof:'#5A4036',cols:1},
    church:{h:2.4,wall:'#EADFCB',roof:'#7A5233',tower:1},hall:{h:2.2,wall:'#F3E0B5',roof:'#C9921B',awn:'#C24E36'},club:{h:2,wall:'#1E1630',roof:'#3A2C55',neon:1},
    lounge:{h:1.8,wall:'#2A1B3D',roof:'#4A2C6A',neon:1,awn:'#FF4FD8'},bar:{h:6.5,wall:'#6E8FAE',roof:'#3A4652',glass:1,awn:'#F2B705'},karaoke:{h:1.7,wall:'#3A1530',roof:'#5A2148',neon:1,awn:'#FF4FD8'},
    dayparty:{h:0,party:1},retail:{h:1.9,wall:'#E8E1D3',roof:'#C24E36',awn:'#F28C28'},warehouse:{h:2.6,wall:'#9AA3AB',roof:'#6B737B'},mybiz:{h:1.7,wall:'#F6E7C1',roof:'#08774C',awn:'#08774C',door:'#F2B705'},
    gym:{h:2,wall:'#9AA3AB',roof:'#5E6B78',awn:'#111'},pub:{h:2,wall:'#5B3A29',roof:'#3A2A20',awn:'#08774C'},test:{h:2.6,wall:'#C9CED3',roof:'#6B737B',cols:1}}[v.type]||{h:1.5,wall:'#ddd',roof:'#888'};
  return Object.assign({kind:T.stalls?'market':T.party?'dayparty':'venue',i0:i0+.12,j0:j0+.12,w:1.76,d:1.76,venueId:v.id,type:v.type},T);
}

/* static drawing */
function cyPoly(c,pts,fill,stroke,lw=1){c.beginPath();pts.forEach(([x,y],k)=>k?c.lineTo(x,y):c.moveTo(x,y));c.closePath();if(fill){c.fillStyle=fill;c.fill()}if(stroke){c.strokeStyle=stroke;c.lineWidth=lw;c.stroke()}}
function cyBox(c,i,j,w,d,h,wall,roof,z0=0){
  cyPoly(c,[cyIso(i,j+d,z0+h),cyIso(i+w,j+d,z0+h),cyIso(i+w,j+d,z0),cyIso(i,j+d,z0)],shade(wall,.92));
  cyPoly(c,[cyIso(i+w,j,z0+h),cyIso(i+w,j+d,z0+h),cyIso(i+w,j+d,z0),cyIso(i+w,j,z0)],shade(wall,.74));
  cyPoly(c,[cyIso(i,j,z0+h),cyIso(i+w,j,z0+h),cyIso(i+w,j+d,z0+h),cyIso(i,j+d,z0+h)],roof||shade(wall,1.1));
}
function cyWindows(c,b,rowsH=.55,col='#2B3A48',glassAll=false){
  const {i0:i,j0:j,w,d,h}=b;const nr=Math.max(1,Math.floor((h-.35)/rowsH));
  for(let rr=0;rr<nr;rr++){const z=.3+rr*rowsH;
    for(let k=0;k<Math.max(1,Math.floor(w/.42));k++){const a=i+.12+k*.42;if(a+.22>i+w)break;const q=[cyIso(a,j+d,z),cyIso(a+.22,j+d,z),cyIso(a+.22,j+d,z+.28),cyIso(a,j+d,z+.28)];cyPoly(c,q,col);CM.windows.push(q)}
    for(let k=0;k<Math.max(1,Math.floor(d/.42));k++){const a=j+.12+k*.42;if(a+.22>j+d)break;const q=[cyIso(i+w,a,z),cyIso(i+w,a+.22,z),cyIso(i+w,a+.22,z+.28),cyIso(i+w,a,z+.28)];cyPoly(c,q,shade(col,.85));CM.windows.push(q)}}
}
function cyTree(c,i,j,s=1){const [x,y]=cyIso(i,j);c.fillStyle='#6B4A2B';c.fillRect(x-1.2*s,y-9*s,2.4*s,9*s);c.fillStyle='#3F7E3A';c.beginPath();c.arc(x,y-12*s,6.5*s,0,7);c.fill();c.fillStyle='#4F9447';c.beginPath();c.arc(x-2*s,y-14*s,4*s,0,7);c.fill()}
function renderCityStatic(){
  const N=CY.N,W=CY.PADX*2+N*CY.TW,H=CY.PADT+N*CY.TH+CY.PADB;
  const off=document.createElement('canvas');off.width=W*CY.SC;off.height=H*CY.SC;const c=off.getContext('2d');c.scale(CY.SC,CY.SC);
  CM.W=W;CM.H=H;CM.off=off;CM.windows=[];
  c.fillStyle='#B9C9B0';c.fillRect(0,0,W,H);
  const T=CM.tile;
  for(let s=0;s<2*N;s++)for(let i=0;i<N;i++){const j=s-i;if(j<0||j>=N)continue;
    const t=T[i][j],p=[cyIso(i,j),cyIso(i+1,j),cyIso(i+1,j+1),cyIso(i,j+1)];
    if(t==='road'||t==='bridge'){cyPoly(c,p,t==='bridge'?'#6B6F74':'#55595E');
      const hor=j%5===0,ver=i%5===0;
      if(hor!==ver){const [x0,y0]=cyIso(i+.5,j+.5),dir=hor?[CY.TW/4,CY.TH/4]:[-CY.TW/4,CY.TH/4];c.strokeStyle='#E8E2C8';c.lineWidth=.8;c.setLineDash([2.5,3]);c.beginPath();c.moveTo(x0-dir[0],y0-dir[1]);c.lineTo(x0+dir[0],y0+dir[1]);c.stroke();c.setLineDash([])}
      if(t==='bridge'){c.strokeStyle='#C9CED3';c.lineWidth=1.4;const a=cyIso(i,j),b=cyIso(i,j+1),a2=cyIso(i+1,j),b2=cyIso(i+1,j+1);c.beginPath();c.moveTo(a[0],a[1]-2);c.lineTo(b[0],b[1]-2);c.moveTo(a2[0],a2[1]-2);c.lineTo(b2[0],b2[1]-2);c.stroke()}
    }else if(t==='water'){cyPoly(c,p,(i+j)%3?'#5DA2CF':'#63A8D4')}
    else cyPoly(c,p,'#CFCBC2','#C3BFB5',.4);
  }
  // river label
  const R=CM.R;{const [x,y]=R.dir==='h'?cyIso(6,R.at*5+3):cyIso(R.at*5+3,7);c.save();c.translate(x,y);c.rotate(R.dir==='h'?Math.atan2(CY.TH,CY.TW):Math.atan2(CY.TH,-CY.TW)+Math.PI);c.font='italic 700 11px Figtree,system-ui,sans-serif';c.fillStyle='rgba(255,255,255,.75)';c.textAlign='center';c.fillText(R.name,0,0);c.restore()}
  // buildings back to front
  const items=[...CM.blds].sort((a,b)=>(a.i0+a.w+a.j0+a.d)-(b.i0+b.w+b.j0+b.d));
  items.forEach(b=>drawBld(c,b));
  CM.bbox={};items.filter(b=>b.venueId).forEach(b=>{const pts=[cyIso(b.i0,b.j0,b.h||0),cyIso(b.i0+b.w,b.j0,0),cyIso(b.i0,b.j0+b.d,0),cyIso(b.i0+b.w,b.j0+b.d,0),cyIso(b.i0+b.w,b.j0,b.h||0),cyIso(b.i0,b.j0+b.d,b.h||0)];
    const xs=pts.map(p=>p[0]),ys=pts.map(p=>p[1]);CM.bbox[b.venueId]={x0:Math.min(...xs),x1:Math.max(...xs),y0:Math.min(...ys)-6,y1:Math.max(...ys),depth:b.i0+b.w+b.j0+b.d,top:cyIso(b.i0+b.w/2,b.j0+b.d/2,(b.h||0)+.4)}});
}
function drawBld(c,b){
  const {i0:i,j0:j,w,d,h}=b;
  if(b.kind==='trees'){cyPoly(c,[cyIso(i,j),cyIso(i+w,j),cyIso(i+w,j+d),cyIso(i,j+d)],'#9CC98A');cyTree(c,i+.6,j+.6);cyTree(c,i+1.4,j+.8,.9);cyTree(c,i+1,j+1.5,1.1);return}
  if(b.kind==='parkblock'){cyPoly(c,[cyIso(i,j),cyIso(i+w,j),cyIso(i+w,j+d),cyIso(i,j+d)],'#8CC67A');
    cyPoly(c,[cyIso(i+1.2,j+1.4),cyIso(i+2.4,j+1.2),cyIso(i+2.6,j+2.3),cyIso(i+1.3,j+2.5)],'#6FB3D9');
    c.strokeStyle='#E3D6B5';c.lineWidth=2;c.beginPath();c.moveTo(...cyIso(i,j+2));c.quadraticCurveTo(...cyIso(i+2,j+3.4),...cyIso(i+4,j+2.6));c.stroke();
    const rr=cyRng(Math.floor(b.seed*1e6));for(let k=0;k<14;k++){const a=i+.3+rr()*3.4,e=j+.3+rr()*3.4;if(a>i+1&&a<i+2.8&&e>j+1&&e<j+2.6)continue;cyTree(c,a,e,.8+rr()*.4)}return}
  if(b.kind==='airport'){cyPoly(c,[cyIso(i,j),cyIso(i+w,j),cyIso(i+w,j+d),cyIso(i,j+d)],'#9AA0A6');
    cyPoly(c,[cyIso(i+.3,j+2.6),cyIso(i+3.8,j+2.6),cyIso(i+3.8,j+3.4),cyIso(i+.3,j+3.4)],'#3E4247');
    c.strokeStyle='#fff';c.lineWidth=1;c.setLineDash([4,4]);c.beginPath();c.moveTo(...cyIso(i+.5,j+3));c.lineTo(...cyIso(i+3.6,j+3));c.stroke();c.setLineDash([]);
    cyBox(c,i+.3,j+.3,2.6,1.4,1.6,'#DDE6EE','#9FB2C2');cyWindows(c,{i0:i+.3,j0:j+.3,w:2.6,d:1.4,h:1.6},.5,'#5E7FA0');
    const [px,py]=cyIso(i+3.2,j+1.6,.3);c.fillStyle='#fff';c.beginPath();c.ellipse(px,py,10,3,-.46,0,7);c.fill();c.fillRect(px-2,py-7,3,12);return}
  if(b.kind==='dayparty'){cyPoly(c,[cyIso(i,j),cyIso(i+w,j),cyIso(i+w,j+d),cyIso(i,j+d)],'#8CC67A');cyBox(c,i+.3,j+.3,1.1,.8,.5,'#222','#333');cyBox(c,i+1.2,j+1.1,.5,.5,.9,'#C24E36','#F2B705');[[.4,1.5],[1.5,.4],[.9,1.2]].forEach(([a,e2])=>{const [x,y]=cyIso(i+a,j+e2);c.fillStyle=pick(['#F2B705','#C24E36','#2B5BA8','#fff']);c.fillRect(x-1,y-4,2,4)});return}
  if(b.kind==='market'){cyPoly(c,[cyIso(i,j),cyIso(i+w,j),cyIso(i+w,j+d),cyIso(i,j+d)],'#D8CDB8');
    [[.1,.1,'#C24E36'],[.95,.1,'#08774C'],[.1,.95,'#2B3A8C'],[.95,.95,'#C9921B']].forEach(([a,e,col])=>{cyBox(c,i+a,j+e,.7,.7,.45,'#A47148','#A47148');cyBox(c,i+a-.05,j+e-.05,.8,.8,.08,col,col,.75)});return}
  cyBox(c,i,j,w,d,h,b.wall,b.roof);
  if(b.kind==='terrace'){[[.35],[1.25]].forEach(([a])=>{cyPoly(c,[cyIso(i+a,j+d,0),cyIso(i+a+.25,j+d,0),cyIso(i+a+.25,j+d,.6),cyIso(i+a,j+d,.6)],pick(['#08774C','#1B1F1D','#C24E36','#2B3A8C']))});cyBox(c,i+w-.5,j+.3,.25,.25,.5,'#6B4A3A','#6B4A3A',h);cyWindows(c,{i0:i,j0:j,w,d,h:h},.7,'#2B3A48');return}
  if(b.kind==='tower'||b.glass){cyWindows(c,b,.5,b.glass?'#C7DDF0':'#B7CDE0');return}
  if(b.kind==='flats'){cyWindows(c,b,.6,'#3A4652');return}
  if(b.kind==='shop'){cyPoly(c,[cyIso(i,j+d,.75),cyIso(i+w,j+d,.75),cyIso(i+w,j+d+.25,.55),cyIso(i,j+d+.25,.55)],b.awn);cyPoly(c,[cyIso(i+.2,j+d,.05),cyIso(i+w-.2,j+d,.05),cyIso(i+w-.2,j+d,.55),cyIso(i+.2,j+d,.55)],'#A9C3D6');if(h>1.5)cyWindows(c,{i0:i,j0:j,w,d,h:h-.6},.6);return}
  // venues
  if(b.tower){cyBox(c,i+.15,j+.15,.6,.6,h+1.6,b.wall,b.roof);const [x,y]=cyIso(i+.45,j+.45,h+1.6);c.fillStyle='#7A5233';c.fillRect(x-.8,y-7,1.6,7);c.fillRect(x-3,y-5,6,1.6)}
  if(b.awn){const q=[cyIso(i,j+d,.8),cyIso(i+w,j+d,.8),cyIso(i+w,j+d+.28,.58),cyIso(i,j+d+.28,.58)];cyPoly(c,q,b.awn);if(b.stripe){for(let k=0;k<6;k+=2){const a=i+k*w/6;cyPoly(c,[cyIso(a,j+d,.8),cyIso(a+w/6,j+d,.8),cyIso(a+w/6,j+d+.28,.58),cyIso(a,j+d+.28,.58)],'#fff')}}}
  cyPoly(c,[cyIso(i+.2,j+d,.05),cyIso(i+w-.2,j+d,.05),cyIso(i+w-.2,j+d,.58),cyIso(i+.2,j+d,.58)],b.neon?'#7A3FA0':b.type==='fine'?'#E9C46A':'#BFD8E8');
  if(b.door)cyPoly(c,[cyIso(i+.7,j+d,0),cyIso(i+1,j+d,0),cyIso(i+1,j+d,.62),cyIso(i+.7,j+d,.62)],b.door);
  if(b.h>1.7)cyWindows(c,{i0:i,j0:j,w,d,h:b.h},.65,b.glass?'#C7DDF0':'#3A4652');
  if(b.cols){for(let k=0;k<4;k++){const a=i+.2+k*.45;cyPoly(c,[cyIso(a,j+d+.02,0),cyIso(a+.1,j+d+.02,0),cyIso(a+.1,j+d+.02,1.2),cyIso(a,j+d+.02,1.2)],'#F4F1EA')}}
  if(b.neon){c.strokeStyle='#FF4FD8';c.lineWidth=1.5;c.beginPath();c.moveTo(...cyIso(i,j+d,b.h-.15));c.lineTo(...cyIso(i+w,j+d,b.h-.15));c.stroke()}
  if(b.pole){const [x,y]=cyIso(i+.15,j+d+.1,0);c.fillStyle='#fff';c.fillRect(x-1.5,y-12,3,12);c.fillStyle='#C24E36';for(let k=0;k<4;k++)c.fillRect(x-1.5,y-11+k*3,3,1.4)}
}

/* cars & walkers */
const isRoad=(i,j)=>i>=0&&j>=0&&i<CY.N&&j<CY.N&&(CM.tile[i][j]==='road'||CM.tile[i][j]==='bridge');
function newCar(){let i,j;do{i=Math.floor(Math.random()*CY.N);j=Math.floor(Math.random()*CY.N)}while(!isRoad(i,j));const dirs=[[1,0],[-1,0],[0,1],[0,-1]].filter(([a,b])=>isRoad(i+a,j+b));const [di,dj]=pick(dirs.length?dirs:[[1,0]]);
  return {i,j,di,dj,t:Math.random(),sp:.6+Math.random()*.7,col:pick(['#C24E36','#2B5BA8','#F2F2F2','#1B1F1D','#C9921B','#08774C','#B3261E']),bus:Math.random()<.15}}
function stepCar(c,dt){c.t+=dt*c.sp*1.6;while(c.t>=1){c.t-=1;c.i+=c.di;c.j+=c.dj;
  const opts=[[c.di,c.dj],[c.dj,c.di],[-c.dj,-c.di]].filter(([a,b])=>isRoad(c.i+a,c.j+b));
  if(!opts.length){c.di=-c.di;c.dj=-c.dj}else{const atX=c.i%5===0&&c.j%5===0;const o=atX?pick(opts):(opts.find(([a,b])=>a===c.di&&b===c.dj)||pick(opts));c.di=o[0];c.dj=o[1]}}}
function newWalker(){const c=newCar();c.sp=.12+Math.random()*.1;c.col=pick(['#C24E36','#2B5BA8','#F2B705','#7A3FA0','#08774C','#ddd']);c.off=Math.random()<.5?.18:.82;return c}

/* camera + frame */
function cyWorld(sx,sy){const {cam}=CMV,cw=CMV.cv.clientWidth,ch=CMV.cv.clientHeight;return [(sx-cw/2)/cam.z+cam.x,(sy-ch/2)/cam.z+cam.y]}
function cyScreen(wx,wy){const {cam}=CMV,cw=CMV.cv.clientWidth,ch=CMV.cv.clientHeight;return [(wx-cam.x)*cam.z+cw/2,(wy-cam.y)*cam.z+ch/2]}
function cyClampCam(){const {cam}=CMV;cam.z=Math.max(cyMinZ(),Math.min(2.6,cam.z));cam.x=Math.max(0,Math.min(CM.W,cam.x));cam.y=Math.max(CY.PADT*.5,Math.min(CM.H,cam.y))}
function cyMinZ(){return CMV.cv?Math.max(.22,CMV.cv.clientWidth/CM.W*.9):.3}
function cyCentreOn(id,z){const v=venue(id);const p=v&&venueCentre(v);if(!p)return;const [x,y]=cyIso(p[0],p[1]);CMV.cam.x=x;CMV.cam.y=y-20;if(z)CMV.cam.z=z;cyClampCam()}
function initCity(){
  const cv=$('citycv');if(!cv)return;
  if(!CM||CM.city!==S.city)buildCity();
  CMV.cv=cv;CMV.ctx=cv.getContext('2d');
  if(!CMV.inited||CMV.inited!==S.city){CMV.inited=S.city;CMV.cam.z=.85}
  cyCentreOn(sheet.sel||S.at);
  bindCityInput(cv);
  cancelAnimationFrame(CMV.raf);CMV.last=performance.now();CMV.raf=requestAnimationFrame(cityFrame);
}
function cityFrame(t){
  const cv=CMV.cv;if(!cv||!cv.isConnected||sheet?.type!=='map'||sheet.real){CMV.raf=0;return}
  CMV.raf=requestAnimationFrame(cityFrame);if(document.hidden)return;
  const dt=Math.min(.05,(t-CMV.last)/1000);CMV.last=t;
  const r=window.devicePixelRatio||1,cw=cv.clientWidth,ch=cv.clientHeight;
  if(cv.width!==Math.round(cw*r)){cv.width=Math.round(cw*r);cv.height=Math.round(ch*r)}
  const c=CMV.ctx;c.setTransform(r,0,0,r,0,0);c.fillStyle='#B9C9B0';c.fillRect(0,0,cw,ch);
  const {cam}=CMV;
  if(!reduceMotion){CMV.cars.forEach(x=>stepCar(x,dt));CMV.walkers.forEach(x=>stepCar(x,dt))}
  if(CMV.trip)tripStep(t);
  c.save();c.translate(cw/2,ch/2);c.scale(cam.z,cam.z);c.translate(-cam.x,-cam.y);
  c.imageSmoothingQuality='high';c.drawImage(CM.off,0,0,CM.W,CM.H);
  // traffic (drawn over ground; small enough to read as street life)
  CMV.walkers.forEach(w=>{const a=w.i+.5+w.di*(w.t-.5)+(w.dj?w.off-.5:0),b=w.j+.5+w.dj*(w.t-.5)+(w.di?w.off-.5:0);const [x,y]=cyIso(a,b);c.fillStyle=w.col;c.fillRect(x-.9,y-4,1.8,3.2);c.fillStyle='#4A2A18';c.fillRect(x-.8,y-5.4,1.6,1.4)});
  CMV.cars.forEach(k=>{const lane=.22;const a=k.i+.5+k.di*(k.t-.5)+(k.dj?(k.dj>0?-lane:lane):0),b=k.j+.5+k.dj*(k.t-.5)+(k.di?(k.di>0?lane:-lane):0);
    const L=k.bus?.55:.32,Wd=.18,h=k.bus?.9:.35;const ii=a-(k.di?L/2:Wd/2),jj=b-(k.dj?L/2:Wd/2);
    cyBox(c,ii,jj,k.di?L:Wd,k.dj?L:Wd,h,k.bus?(CITIES[S.city].london?'#C8102E':'#E8B10E'):k.col,k.bus?'#ddd':shade(k.col,1.15))});
  // night windows
  const night=S.hour<6.5||S.hour>=19.5,dusk=!night&&(S.hour<8||S.hour>=17.5);
  if(night||dusk){c.fillStyle=night?'rgba(255,214,120,.9)':'rgba(255,214,120,.45)';CM.windows.forEach((q,k)=>{if((k*7919)%5<3){c.beginPath();c.moveTo(...q[0]);c.lineTo(...q[1]);c.lineTo(...q[2]);c.lineTo(...q[3]);c.fill()}})}
  // trip marker
  if(CMV.trip&&CMV.trip.pos){const [x,y]=CMV.trip.pos;const m=CMV.trip.mode;
    if(m==='walk')drawPerson(c,x,y,S.look,.32,{walk:true,t});
    else{const col=m==='bus'?(CITIES[S.city].london?'#C8102E':'#E8B10E'):'#111';c.fillStyle=col;c.beginPath();c.roundRect?c.roundRect(x-9,y-12,18,10,3):c.rect(x-9,y-12,18,10);c.fill();c.fillStyle='#BFD8E8';c.fillRect(x-7,y-10,14,3);drawPerson(c,x,y-12,S.look,.18,{t})}}
  c.restore();
  // weather/time tint (screen space)
  if(night){c.fillStyle='rgba(16,24,58,.42)';c.fillRect(0,0,cw,ch)}else if(dusk){c.fillStyle='rgba(233,140,80,.14)';c.fillRect(0,0,cw,ch)}
  if(S.weather==='Drizzle'||S.weather==='Cold snap'){c.strokeStyle=S.weather==='Cold snap'?'rgba(255,255,255,.7)':'rgba(90,120,140,.45)';c.lineWidth=1;for(let k=0;k<50;k++){const x=(k*73+t/(S.weather==='Cold snap'?40:6))%cw,y=(k*131+t/(S.weather==='Cold snap'?25:3))%ch;c.beginPath();c.moveTo(x,y);c.lineTo(x-2,y+(S.weather==='Cold snap'?2:7));c.stroke()}}
  // district labels
  if(cam.z<1.5){c.font='800 12px Figtree,system-ui,sans-serif';c.textAlign='center';const placed=[];CM.districts.forEach(d=>{const [wx,wy]=cyIso(d.i,d.j+1.6);const [x,y]=cyScreen(wx,wy);if(x<-50||x>cw+50||y<-20||y>ch+20)return;if(placed.some(([a,b2])=>Math.abs(a-x)<90&&Math.abs(b2-y)<18))return;placed.push([x,y]);c.fillStyle='rgba(255,255,255,.55)';const w=c.measureText(d.n.toUpperCase()).width+12;c.fillRect(x-w/2,y-10,w,15);c.fillStyle='#18221E';c.fillText(d.n.toUpperCase(),x,y+1)})}
  // pins
  const vs=venues().filter(v=>!v.trip&&CM.bbox[v.id]);
  const showLbl=cam.z>=.75;
  vs.sort((a,b)=>CM.bbox[a.id].depth-CM.bbox[b.id].depth).forEach(v=>{
    const bb=CM.bbox[v.id],[x,y]=cyScreen(...bb.top);if(x<-30||x>cw+30||y<-30||y>ch+30)return;
    const sel=sheet.sel===v.id,open=isOpen(v.type),cat=VT[v.type].cat,rad=sel?15:v.type==='home'?13:11;
    c.globalAlpha=open||sel?1:.6;
    c.fillStyle='rgba(0,0,0,.25)';c.beginPath();c.ellipse(x,y+rad+3,5,2,0,0,7);c.fill();
    c.fillStyle=CATCOL[cat];c.beginPath();c.arc(x,y,rad,0,7);c.fill();c.beginPath();c.moveTo(x-5,y+rad-3);c.lineTo(x,y+rad+4);c.lineTo(x+5,y+rad-3);c.fill();
    c.strokeStyle=sel?'#18221E':'#fff';c.lineWidth=sel?3:2;c.beginPath();c.arc(x,y,rad,0,7);c.stroke();
    c.font=`${rad}px system-ui,"Apple Color Emoji","Segoe UI Emoji",sans-serif`;c.textAlign='center';c.textBaseline='middle';c.fillText(VICON[v.type]||'•',x,y+1);
    if(showLbl||sel||v.type==='home'){const lbl=v.type==='home'?'Home':v.type==='mybiz'?'Your business':v.type==='restaurant'||v.type==='fine'||FOODV.includes(v.type)||NIGHTV.includes(v.type)?v.name.split(',')[0]:VT[v.type].label;c.font='800 11px Figtree,system-ui,sans-serif';const w=c.measureText(lbl).width+10;c.fillStyle=sel?'#18221E':'rgba(255,255,255,.94)';c.beginPath();c.roundRect?c.roundRect(x-w/2,y-rad-19,w,16,5):c.rect(x-w/2,y-rad-19,w,16);c.fill();c.fillStyle=sel?'#fff':'#18221E';c.fillText(lbl,x,y-rad-11)}
    c.globalAlpha=1;c.textBaseline='alphabetic';
    if(S.at===v.id&&!CMV.trip){const [ax,ay]=cyScreen(...cyIso(...venueCentre(v)));drawPerson(c,ax+18,ay+8,S.look,.42,{t});c.font='800 10px Figtree,sans-serif';c.fillStyle='#08774C';const w=30;c.fillRect(ax+18-w/2,ay-26,w,13);c.fillStyle='#fff';c.textAlign='center';c.fillText('YOU',ax+18,ay-16)}
  });
}

/* input */
function bindCityInput(cv){
  if(cv._bound)return;cv._bound=true;
  cv.addEventListener('pointerdown',e=>{cv.setPointerCapture(e.pointerId);CMV.ptrs.set(e.pointerId,[e.offsetX,e.offsetY]);CMV.drag={x:e.offsetX,y:e.offsetY,cx:CMV.cam.x,cy:CMV.cam.y,moved:0,z:CMV.cam.z,d0:null}});
  cv.addEventListener('pointermove',e=>{if(!CMV.ptrs.has(e.pointerId))return;CMV.ptrs.set(e.pointerId,[e.offsetX,e.offsetY]);const D=CMV.drag;if(!D)return;
    if(CMV.ptrs.size===2){const [a,b]=[...CMV.ptrs.values()];const d=Math.hypot(a[0]-b[0],a[1]-b[1]);if(!D.d0){D.d0=d;D.z=CMV.cam.z}CMV.cam.z=D.z*d/D.d0;D.moved=99;cyClampCam();return}
    const dx=e.offsetX-D.x,dy=e.offsetY-D.y;D.moved=Math.max(D.moved,Math.hypot(dx,dy));CMV.cam.x=D.cx-dx/CMV.cam.z;CMV.cam.y=D.cy-dy/CMV.cam.z;cyClampCam()});
  const up=e=>{const D=CMV.drag;CMV.ptrs.delete(e.pointerId);if(D&&D.moved<6&&e.type==='pointerup'&&!CMV.trip)cityTap(e.offsetX,e.offsetY);if(!CMV.ptrs.size)CMV.drag=null};
  cv.addEventListener('pointerup',up);cv.addEventListener('pointercancel',up);
  cv.addEventListener('wheel',e=>{e.preventDefault();CMV.cam.z*=e.deltaY<0?1.12:.89;cyClampCam()},{passive:false});
}
function cityTap(sx,sy){
  const vs=venues().filter(v=>!v.trip&&CM.bbox[v.id]);
  let hit=null,bd=1e9;
  vs.forEach(v=>{const [x,y]=cyScreen(...CM.bbox[v.id].top);const d=Math.hypot(x-sx,y-sy);if(d<20&&d<bd){bd=d;hit=v.id}});
  if(!hit){const [wx,wy]=cyWorld(sx,sy);let dep=-1;vs.forEach(v=>{const b=CM.bbox[v.id];if(wx>=b.x0&&wx<=b.x1&&wy>=b.y0&&wy<=b.y1&&b.depth>dep){dep=b.depth;hit=v.id}})}
  if(hit)selectPin(hit);
}

/* travel animation along roads */
function doorTile(v){
  const p=CM.venueLot[v.id];if(!p)return null;const [i0,j0,w]=p.lot?[p.lot.i0,p.lot.j0,2]:[p.block[0]*5+1,p.block[1]*5+1,4];
  const cand=[];for(let k=-1;k<=w;k++){cand.push([i0+k,j0+w],[i0+w,j0+k],[i0+k,j0-1],[i0-1,j0+k])}
  return cand.filter(([i,j])=>isRoad(i,j)).sort((a,b)=>(b[0]+b[1])-(a[0]+a[1]))[0]||null;
}
function roadPath(a,b){
  if(!a||!b)return null;const key=(i,j)=>i*100+j,prev=new Map([[key(...a),null]]),q=[a];
  while(q.length){const [i,j]=q.shift();if(i===b[0]&&j===b[1])break;for(const [di,dj] of [[1,0],[-1,0],[0,1],[0,-1]]){const n=[i+di,j+dj];const k=key(...n);if(!prev.has(k)&&isRoad(...n)){prev.set(k,[i,j]);q.push(n)}}}
  if(!prev.has(key(...b)))return null;const out=[];let cur=b;while(cur){out.unshift(cur);cur=prev.get(key(...cur))}return out;
}
function animateTravel(to,mode,done){
  const a=here(),b=venue(to);
  if(!CMV.cv||!CMV.cv.isConnected||reduceMotion||a.trip||b.trip||mode==='train'){done();return}
  const path=roadPath(doorTile(a),doorTile(b));if(!path||path.length<2){done();return}
  const pts=path.map(([i,j])=>cyIso(i+.5,j+.5));
  const dur=Math.max(1100,Math.min(3200,path.length*(mode==='walk'?95:55)));
  CMV.trip={pts,mode,start:performance.now(),dur,done,pos:pts[0]};
  CMV.cam.z=Math.max(CMV.cam.z,.95);
  const vi=$('vinfo');if(vi)vi.innerHTML=`<div class="vinfo"><div class="nm">On the way to ${esc(b.name)}…</div><div class="meta">${mode==='walk'?'Walking':mode==='bus'?(CITIES[S.city].london?'On the bus':'On the bus'):'In an Uber'}</div></div>`;
}
function tripStep(t){
  const T=CMV.trip,u=Math.min(1,(t-T.start)/T.dur),e=u<.5?2*u*u:1-Math.pow(-2*u+2,2)/2;
  const f=e*(T.pts.length-1),k=Math.min(T.pts.length-2,Math.floor(f)),r=f-k;
  const [x0,y0]=T.pts[k],[x1,y1]=T.pts[k+1];T.pos=[x0+(x1-x0)*r,y0+(y1-y0)*r];
  CMV.cam.x+=(T.pos[0]-CMV.cam.x)*.12;CMV.cam.y+=(T.pos[1]-CMV.cam.y)*.12;
  if(u>=1){const d=T.done;CMV.trip=null;setTimeout(d,250)}
}
