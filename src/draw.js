/* ---------- canvas drawing ---------- */
const W=360,H=230,TW=48,TH=24,ZH=30,OX=180,OY=74;
const anim={x:3,y:3.4,tx:3,ty:3.4,emote:null,emoteUntil:0,reset:true,onArrive:null};
let cv,ctx,dpr=1,colors={},patCache={};
function readColors(){const cs=getComputedStyle(document.documentElement);['--wall','--wall2','--floor','--floor2','--venue-floor','--ink','--surface','--green','--danfo','--clay','--muted','--line','--ground'].forEach(k=>colors[k]=cs.getPropertyValue(k).trim()||'#888')}
function shade(hex,f){if(hex.startsWith('rgb')){const m=hex.match(/\d+/g).map(Number);return `rgb(${Math.min(255,Math.round(m[0]*f))},${Math.min(255,Math.round(m[1]*f))},${Math.min(255,Math.round(m[2]*f))})`}let c=hex.replace('#','');if(c.length===3)c=c.split('').map(x=>x+x).join('');const n=parseInt(c,16);let r=n>>16&255,g=n>>8&255,b=n&255;r=Math.min(255,Math.round(r*f));g=Math.min(255,Math.round(g*f));b=Math.min(255,Math.round(b*f));return `rgb(${r},${g},${b})`}
function poly(pts,fill,stroke){ctx.beginPath();pts.forEach(([x,y],i)=>i?ctx.lineTo(x,y):ctx.moveTo(x,y));ctx.closePath();if(fill){ctx.fillStyle=fill;ctx.fill()}if(stroke){ctx.strokeStyle=stroke;ctx.lineWidth=1;ctx.stroke()}}
const iso=(gx,gy,gz=0)=>[OX+(gx-gy)*TW/2,OY+(gx+gy)*TH/2-gz*ZH];
function box(gx,gy,w,d,h,col){
  const p=iso;
  poly([p(gx,gy+d,h),p(gx+w,gy+d,h),p(gx+w,gy+d,0),p(gx,gy+d,0)],shade(col,.86));
  poly([p(gx+w,gy,h),p(gx+w,gy+d,h),p(gx+w,gy+d,0),p(gx+w,gy,0)],shade(col,.72));
  poly([p(gx,gy,h),p(gx+w,gy,h),p(gx+w,gy+d,h),p(gx,gy+d,h)],shade(col,1.06));
}
function fabricPattern(fid,c=ctx){
  const k=fid;if(c===ctx&&patCache[k])return patCache[k];
  const f=FABRICS.find(x=>x.id===fid)||FABRICS[0];
  const pc=document.createElement('canvas');pc.width=pc.height=12;const g=pc.getContext('2d');
  g.fillStyle=f.base;g.fillRect(0,0,12,12);g.fillStyle=f.dot;g.beginPath();g.arc(6,6,3.2,0,7);g.fill();
  g.fillStyle=f.acc;g.beginPath();g.arc(6,6,1.3,0,7);g.fill();g.fillRect(0,0,2,2);g.fillRect(10,10,2,2);
  const p=c.createPattern(pc,'repeat');if(c===ctx)patCache[k]=p;return p;
}
function lookOf(id){return id==='me'?S.look:NPCS[id].look}
function drawPerson(c,x,y,look,s=1,o={}){
  const skin=SKINS[look.skin],f=FABRICS.find(z=>z.id===look.fabric)||FABRICS[0];
  const bob=o.walk?Math.sin(o.t/90)*1.4:0;
  c.save();c.translate(x,y+bob);c.scale(s,s);
  c.fillStyle='rgba(0,0,0,.18)';c.beginPath();c.ellipse(0,0,13,4,0,0,7);c.fill();
  const leg=o.walk?Math.sin(o.t/90)*3:0;
  c.fillStyle='#1E2420';c.fillRect(-7,-17+0,5,17-Math.max(0,leg));c.fillRect(2,-17,5,17-Math.max(0,-leg));
  c.fillStyle='#111';c.fillRect(-8,-3,7,3);c.fillRect(1,-3,7,3);
  // body
  c.fillStyle=fabricPattern(look.fabric,c);c.beginPath();c.roundRect?c.roundRect(-11,-41,22,26,6):c.rect(-11,-41,22,26);c.fill();
  c.fillStyle=skin;c.fillRect(-14,-38,4,15);c.fillRect(10,-38,4,15);
  c.fillStyle=f.base;c.fillRect(-14,-40,4,7);c.fillRect(10,-40,4,7);
  // head
  const hy=-52;
  if(look.hair==='afro'){c.fillStyle='#1B1210';c.beginPath();c.arc(0,hy-3,14,0,7);c.fill()}
  if(look.hair==='locs'||look.hair==='braids'){c.fillStyle='#1B1210';for(let i=-3;i<=3;i++){if(Math.abs(i)<2)continue;c.fillRect(i*3.4-1.5,hy-4,look.hair==='locs'?3.4:2.4,look.hair==='locs'?22:26)}}
  c.fillStyle=skin;c.beginPath();c.arc(0,hy,10,0,7);c.fill();
  c.fillStyle='#1B1210';
  if(look.hair==='lowcut'){c.beginPath();c.arc(0,hy-1,10.3,Math.PI*1.05,Math.PI*1.95);c.fill()}
  if(look.hair==='afro'){c.beginPath();c.arc(0,hy-4,11,Math.PI*1.02,Math.PI*1.98);c.fill()}
  if(look.hair==='braids'||look.hair==='locs'){c.beginPath();c.arc(0,hy-1,10.6,Math.PI,Math.PI*2);c.fill()}
  if(look.hair==='bun'){c.beginPath();c.arc(0,hy-1,10.4,Math.PI,Math.PI*2);c.fill();c.beginPath();c.arc(0,hy-14,7,0,7);c.fill()}
  if(look.hair==='gele'){c.fillStyle=f.base;c.beginPath();c.moveTo(-14,hy-2);c.quadraticCurveTo(-16,hy-24,0,hy-22);c.quadraticCurveTo(18,hy-26,15,hy-3);c.closePath();c.fill();c.fillStyle=f.dot;c.beginPath();c.moveTo(-6,hy-18);c.quadraticCurveTo(4,hy-30,16,hy-16);c.lineTo(10,hy-12);c.fill()}
  c.fillStyle='#1B1210';c.beginPath();c.arc(-3.5,hy+1,1.4,0,7);c.arc(3.5,hy+1,1.4,0,7);c.fill();
  c.strokeStyle='#1B1210';c.lineWidth=1.4;c.beginPath();
  if(o.mood==='sad'){c.moveTo(-3,hy+6.5);c.quadraticCurveTo(0,hy+4,3,hy+6.5)}else{c.moveTo(-3.5,hy+4.5);c.quadraticCurveTo(0,hy+7.5,3.5,hy+4.5)}
  c.stroke();
  c.restore();
}
function bubble(x,y,txt){ctx.save();ctx.font='16px system-ui,"Apple Color Emoji","Segoe UI Emoji",sans-serif';ctx.fillStyle=colors['--surface'];ctx.strokeStyle=colors['--line'];ctx.beginPath();ctx.roundRect?ctx.roundRect(x-16,y-34,32,26,9):ctx.rect(x-16,y-34,32,26);ctx.fill();ctx.stroke();ctx.beginPath();ctx.moveTo(x-4,y-8);ctx.lineTo(x,y-2);ctx.lineTo(x+4,y-8);ctx.fill();ctx.textAlign='center';ctx.textBaseline='middle';ctx.fillStyle=colors['--ink'];ctx.fillText(txt,x,y-20);ctx.restore()}
function skyCol(){const h=S.hour;if(h<6||h>=20)return['#1B2340','#2A3560'];if(h<8||h>=18)return['#E9A06B','#F6C98E'];return S.weather==='Sunny spell'?['#7FB8E6','#B9DAF3']:['#A4B2BA','#C3CDD2']}
function mood(){const n=S.needs;return Math.min(n.fun,n.hunger,n.energy)<25||S.homesick>80?'sad':'ok'}

function drawHome(t){
  const wall=colors['--wall'],wall2=colors['--wall2'],fl=colors['--floor'],fl2=colors['--floor2'];
  // walls
  poly([iso(0,0,0),iso(6,0,0),iso(6,0,2.3),iso(0,0,2.3)],wall);
  poly([iso(0,0,0),iso(0,6,0),iso(0,6,2.3),iso(0,0,2.3)],wall2);
  // skirting
  poly([iso(0,0,0),iso(6,0,0),iso(6,0,.12),iso(0,0,.12)],shade(wall,.8));
  poly([iso(0,0,0),iso(0,6,0),iso(0,6,.12),iso(0,0,.12)],shade(wall2,.8));
  // window
  const [s1,s2]=skyCol();const wp=[iso(1.7,0,.95),iso(3.2,0,.95),iso(3.2,0,1.95),iso(1.7,0,1.95)];
  const g=ctx.createLinearGradient(0,wp[2][1],0,wp[0][1]);g.addColorStop(0,s1);g.addColorStop(1,s2);poly(wp,g);
  if(S.hour>=8&&S.hour<18&&S.weather==='Sunny spell'){const [sx,sy]=iso(2.8,0,1.65);ctx.fillStyle='#FFD45A';ctx.beginPath();ctx.arc(sx,sy,5,0,7);ctx.fill()}
  if(S.weather==='Drizzle'||S.weather==='Cold snap'){ctx.save();ctx.beginPath();wp.forEach(([x,y],i)=>i?ctx.lineTo(x,y):ctx.moveTo(x,y));ctx.closePath();ctx.clip();ctx.strokeStyle=S.weather==='Cold snap'?'#fff':'#5C7A8C';ctx.lineWidth=1.2;for(let i=0;i<14;i++){const xx=wp[0][0]+((i*13+t/12)%80)-4,yy=wp[2][1]+((i*29+t/7)%50);ctx.beginPath();ctx.moveTo(xx,yy);ctx.lineTo(xx-2,yy+5);ctx.stroke()}ctx.restore()}
  poly(wp,null,colors['--ink']);const mid=[iso(2.45,0,.95),iso(2.45,0,1.95)];ctx.beginPath();ctx.moveTo(...mid[0]);ctx.lineTo(...mid[1]);ctx.stroke();
  // door to bathroom
  poly([iso(0,5,0),iso(0,5.9,0),iso(0,5.9,1.75),iso(0,5,1.75)],shade(wall2,.7));
  const [kx,ky]=iso(0,5.15,.85);ctx.fillStyle=colors['--danfo'];ctx.beginPath();ctx.arc(kx,ky,1.8,0,7);ctx.fill();
  // photos
  if(own('photos')){[[3.6,1.15,.45,.4],[4.15,1.25,.35,.3],[3.75,1.65,.5,.32]].forEach(([gy,z,w,h],i)=>{poly([iso(0,gy,z),iso(0,gy+w,z),iso(0,gy+w,z+h),iso(0,gy,z+h)],'#5B3A1E');poly([iso(0,gy+.05,z+.05),iso(0,gy+w-.05,z+.05),iso(0,gy+w-.05,z+h-.05),iso(0,gy+.05,z+h-.05)],['#E7C9A0','#BFD8E8','#F2D3D3'][i])})}
  // floor
  for(let i=0;i<6;i++)for(let j=0;j<6;j++)poly([iso(i,j),iso(i+1,j),iso(i+1,j+1),iso(i,j+1)],(i+j)%2?fl:fl2);
  if(own('rug')){const r=FURN.rug;poly([iso(r.pos[0],r.pos[1]),iso(r.pos[0]+r.size[0],r.pos[1]),iso(r.pos[0]+r.size[0],r.pos[1]+r.size[1]),iso(r.pos[0],r.pos[1]+r.size[1])],fabricPattern('red'))}
  // drawables
  const items=S.furn.filter(k=>FURN[k].pos&&!FURN[k].floor).map(k=>({k,d:FURN[k].pos[0]+FURN[k].size[0]+FURN[k].pos[1]+FURN[k].size[1]-.6}));
  items.push({k:'@me',d:anim.x+anim.y});
  if(married()){items.push({k:'@partner',d:4.2+4.8})}
  items.sort((a,b)=>a.d-b.d);
  for(const it of items){
    if(it.k==='@me'){const [x,y]=iso(anim.x,anim.y);drawPerson(ctx,x,y,S.look,.62,{walk:anim.walking,t,mood:mood()});if(anim.emote&&t<anim.emoteUntil)bubble(x,y-40,anim.emote);continue}
    if(it.k==='@partner'){const [x,y]=iso(4.2,4.8);drawPerson(ctx,x,y,lookOf(S.partner),.62,{t});continue}
    drawFurn(it.k,t);
  }
}
function drawFurn(k,t){
  const f=FURN[k],[gx,gy]=f.pos,[w,d,h]=f.size;
  if(k==='mattress'||k==='bed'){box(gx,gy,w,d,h,f.col);
    const sheet=own('blanket')?'#E2A13B':'#F4F1EA';poly([iso(gx+.1,gy+.45,h+.02),iso(gx+w-.1,gy+.45,h+.02),iso(gx+w-.1,gy+d-.08,h+.02),iso(gx+.1,gy+d-.08,h+.02)],sheet);
    poly([iso(gx+.2,gy+.08,h+.06),iso(gx+w-.2,gy+.08,h+.06),iso(gx+w-.2,gy+.4,h+.06),iso(gx+.2,gy+.4,h+.06)],'#FFFFFF');
    if(f.head)box(gx,gy-.02,w,.12,h+.55,shade(f.col,.8));return}
  if(k==='sofa'){box(gx,gy,w,d,h,f.col);box(gx,gy+d-.25,w,.25,h+.45,shade(f.col,.9));box(gx-.05,gy,.25,d,h+.25,shade(f.col,.85));box(gx+w-.2,gy,.25,d,h+.25,shade(f.col,.85));return}
  if(k==='tv'){box(gx+.5,gy,.6,.3,.35,'#3A3A3A');box(gx,gy,w,.12,h,'#111');poly([iso(gx+.06,gy+.12,.42),iso(gx+w-.06,gy+.12,.42),iso(gx+w-.06,gy+.12,h-.06),iso(gx+.06,gy+.12,h-.06)],S.meterOff?'#222':'#2E6FD1');return}
  if(k==='ringlight'){box(gx,gy,w,d,h,'#777');const [x,y]=iso(gx+w/2,gy+d/2,h+.25);ctx.strokeStyle='#FFF7D6';ctx.lineWidth=3;ctx.beginPath();ctx.arc(x,y,7,0,7);ctx.stroke();return}
  if(k==='plants'){box(gx,gy,w,d,.3,'#B5651D');const [x,y]=iso(gx+w/2,gy+d/2,.55);ctx.fillStyle='#2F8F4E';[[-5,0],[5,-1],[0,-6],[-2,4],[3,3]].forEach(([a,b])=>{ctx.beginPath();ctx.arc(x+a,y+b,5.5,0,7);ctx.fill()});return}
  if(k==='speaker'){box(gx,gy,w,d,h,f.col);const [x,y]=iso(gx+w/2,gy+d,h*.5);ctx.fillStyle='#555';ctx.beginPath();ctx.arc(x,y,3.5,0,7);ctx.fill();return}
  box(gx,gy,w,d,h,f.col);
  if(f.hob){[[.25,.3],[.65,.65]].forEach(([a,b])=>{const [x,y]=iso(gx+a,gy+b,h+.01);ctx.fillStyle='#333';ctx.beginPath();ctx.ellipse(x,y,6,3,0,0,7);ctx.fill()})}
  if(k==='desk'){const [x,y]=iso(gx+.4,gy+.5,h+.25);ctx.fillStyle='#333';ctx.fillRect(x-7,y-6,14,9)}
}

/* venue scenes: side view */
const VSTYLE={market:['#E9C46A','fabric'],salon:['#D8E2DC','mirrors'],office:['#DCE3EA','office'],carehome:['#E6EFE9','care'],kitchen:['#D9DEE2','kitchen'],campus:['#E7E1D5','books'],library:['#E3D9C6','books'],church:['#EADFCB','church'],hall:['#F3E0B5','party'],club:['#1E1630','club'],gym:['#D5DADF','gym'],park:['sky','park'],pub:['#5B3A29','pub'],test:['#E4E7EA','test'],restaurant:['#F1D9B5','resto'],lounge:['#2A1B3D','lounge'],bar:['sky','bar'],karaoke:['#3A1530','karaoke'],dayparty:['sky','dayparty'],retail:['#EEF0F2','retail'],warehouse:['#C9CED3','warehouse'],mybiz:['#F6E7C1','mybiz'],chicken:['#F6E7C1','chicken'],cafe:['#E9DED0','cafe'],caribbean:['#F4E3A1','carib'],fine:['#2B2620','fine'],airport:['#DDE6EE','airport']};
function drawVenue(t,v){
  const [wallc,kind]=VSTYLE[v.type]||['#DDD','x'];
  if(kind==='bar'||kind==='dayparty'){const [s1,s2]=skyCol();const g=ctx.createLinearGradient(0,0,0,150);g.addColorStop(0,s1);g.addColorStop(1,s2);ctx.fillStyle=g;ctx.fillRect(0,0,W,150);ctx.fillStyle=kind==='bar'?'#5E6B78':'#5E9E57';ctx.fillRect(0,150,W,80);if(kind==='bar'){ctx.fillStyle='rgba(40,50,70,.55)';[20,60,90,140,200,240,290,330].forEach((x,i)=>ctx.fillRect(x,150-40-(i*23%50),28,40+(i*23%50)))}}
  else if(kind==='park'){const [s1,s2]=skyCol();const g=ctx.createLinearGradient(0,0,0,150);g.addColorStop(0,s1);g.addColorStop(1,s2);ctx.fillStyle=g;ctx.fillRect(0,0,W,150);
    ctx.fillStyle='#5E9E57';ctx.fillRect(0,140,W,90);[[40,120],[110,110],[300,116],[250,124]].forEach(([x,y])=>{ctx.fillStyle='#6B4A2B';ctx.fillRect(x-3,y,6,26);ctx.fillStyle='#3F7E3A';ctx.beginPath();ctx.arc(x,y,20,0,7);ctx.fill()});
  }else{ctx.fillStyle=wallc;ctx.fillRect(0,0,W,150);ctx.fillStyle=colors['--venue-floor'];ctx.fillRect(0,150,W,80);ctx.fillStyle='rgba(0,0,0,.08)';for(let i=0;i<W;i+=30)ctx.fillRect(i,150,1,80)}
  const dark=['club','pub','fine','lounge','karaoke'].includes(kind);
  props(kind,t,dark);
  if(false){ctx.fillStyle=dark?'#F2B705':'#08774C';const tw=Math.min(300,v.name.length*6.4+24);ctx.fillRect((W-tw)/2,10,tw,24);ctx.fillStyle=dark?'#2B2000':'#fff';ctx.font='800 12px Figtree,system-ui,sans-serif';ctx.textAlign='center';ctx.textBaseline='middle';ctx.fillText(v.name.length>44?v.name.slice(0,43)+'…':v.name,W/2,22.5)}
  if(['hall','club','church'].includes(v.type)&&isOpen(v.type)){for(let i=0;i<7;i++){const x=20+i*48+(i%2)*10,y=196+(i%3)*6;ctx.fillStyle='rgba(0,0,0,.28)';ctx.beginPath();ctx.arc(x,y-34+Math.sin(t/200+i)*2,7,0,7);ctx.fill();ctx.fillRect(x-7,y-28+Math.sin(t/200+i)*2,14,20)}}
  const ppl=peopleAt(v);
  const xs=[150,205,260,312];
  ppl.forEach((id,i)=>drawPerson(ctx,xs[i],214,lookOf(id),.9,{t:t+i*300,walk:false}));
  const lp=(typeof livePeople==='function'?livePeople():[]).slice(0,Math.max(0,4-ppl.length));
  lp.forEach((p,i)=>{const x=xs[ppl.length+i];drawPerson(ctx,x,214,p.look,.9,{t:t+i*500});ctx.font='800 9px Figtree,system-ui,sans-serif';ctx.textAlign='center';const w=ctx.measureText(p.name).width+10;ctx.fillStyle='#0E7C86';ctx.fillRect(x-w/2,128,w,14);ctx.fillStyle='#fff';ctx.fillText(p.name,x,138)});
  drawPerson(ctx,78,214,S.look,.95,{walk:anim.walking,t,mood:mood()});
  if(anim.emote&&t<anim.emoteUntil)bubble(78,214-70,anim.emote);
  if(!isOpen(v.type)){ctx.fillStyle='rgba(0,0,0,.45)';ctx.fillRect(0,0,W,H);ctx.fillStyle='#fff';ctx.font='800 20px Figtree,system-ui,sans-serif';ctx.textAlign='center';ctx.fillText('CLOSED',W/2,110)}
}
function props(kind,t,dark){
  const c=ctx;
  const counter=(x,w,col)=>{c.fillStyle=col;c.fillRect(x,120,w,40);c.fillStyle=shade(col,.8);c.fillRect(x,120,w,6)};
  if(kind==='market'){for(let i=0;i<3;i++){const x=20+i*115;c.fillStyle=['#C24E36','#08774C','#2B3A8C'][i];c.fillRect(x,50,95,14);c.fillStyle='#8B5A2B';c.fillRect(x+4,64,4,70);c.fillRect(x+87,64,4,70);c.fillStyle='#A47148';c.fillRect(x,108,95,20);[['#E2B13C',0],['#5C8A3A',1],['#7A4A2A',2]].forEach(([col,j])=>{for(let k=0;k<5;k++){c.fillStyle=col;c.beginPath();c.ellipse(x+12+k*17,104-j*0,7,5,0,0,7);c.fill()}})}}
  if(kind==='mirrors'){for(let i=0;i<3;i++){const x=40+i*110;c.fillStyle='#BFD8E8';c.fillRect(x,46,70,60);c.strokeStyle='#888';c.strokeRect(x,46,70,60);c.fillStyle='#222';c.fillRect(x+20,122,30,30);c.fillRect(x+30,150,10,20)}c.fillStyle='#C24E36';c.fillRect(8,40,8,90);c.fillStyle='#fff';for(let y=44;y<126;y+=14)c.fillRect(8,y,8,5)}
  if(kind==='office'){c.fillStyle='#9FB6CC';c.fillRect(20,44,320,70);c.fillStyle='#7C93A8';[30,70,110,170,220,270,310].forEach((x,i)=>c.fillRect(x,114-30-(i*17%40),26,30+(i*17%40)));for(let i=0;i<3;i++){const x=24+i*115;c.fillStyle='#E9ECEF';c.fillRect(x,136,96,10);c.fillStyle='#5D6B64';c.fillRect(x+8,146,4,30);c.fillRect(x+84,146,4,30);c.fillStyle='#222';c.fillRect(x+34,112,30,22);c.fillStyle='#2E6FD1';c.fillRect(x+36,114,26,17)}}
  if(kind==='care'){c.fillStyle='#BFD8E8';c.fillRect(220,46,110,60);for(let i=0;i<3;i++){const x=20+i*65;c.fillStyle='#7A9E7E';c.fillRect(x,130,50,34);c.fillRect(x,108,50,24);c.fillStyle='#5E8562';c.fillRect(x-4,124,8,40);c.fillRect(x+46,124,8,40)}counter(230,110,'#F4F6F5');c.fillStyle='#C24E36';c.fillRect(276,128,16,4);c.fillRect(282,122,4,16)}
  if(kind==='kitchen'){counter(10,340,'#B8C1C7');for(let i=0;i<4;i++){const x=40+i*80;c.fillStyle='#555';c.fillRect(x,104,40,16);c.fillStyle='rgba(255,255,255,.5)';for(let k=0;k<3;k++){c.beginPath();c.arc(x+10+k*10,96-((t/40+k*20)%30),4,0,7);c.fill()}}}
  if(kind==='books'){for(let s=0;s<4;s++){const x=12+s*88;c.fillStyle='#7A5233';c.fillRect(x,44,76,100);for(let r=0;r<4;r++)for(let b=0;b<9;b++){c.fillStyle=['#C24E36','#08774C','#2B3A8C','#C9921B','#6A2C91'][(s+r+b)%5];c.fillRect(x+4+b*8,50+r*24,6,18)}}}
  if(kind==='church'){c.fillStyle='#C9A86B';c.fillRect(150,40,60,90);c.fillStyle='#F2E6C8';c.fillRect(176,52,8,40);c.fillRect(164,64,32,8);for(let i=0;i<3;i++){c.fillStyle='#8A5A35';c.fillRect(14+i*120,150,90,14);c.fillRect(14+i*120,132,90,8)}c.fillStyle='#222';c.fillRect(250,110,60,22)}
  if(kind==='party'){c.strokeStyle='#C24E36';for(let i=0;i<12;i++){c.fillStyle=['#F2B705','#08774C','#C24E36'][i%3];c.beginPath();c.moveTo(i*31,40);c.lineTo(i*31+15,58);c.lineTo(i*31+30,40);c.fill()}for(let i=0;i<4;i++){const x=20+i*88;c.fillStyle='#FFF7E6';c.fillRect(x,130,64,26);c.fillStyle='#F2B705';c.fillRect(x,130,64,6)}}
  if(kind==='club'){for(let i=0;i<6;i++){const a=t/600+i;c.fillStyle=`hsla(${(i*60+t/20)%360},90%,60%,.35)`;c.beginPath();c.moveTo(60*i+30,0);c.lineTo(60*i+30+Math.sin(a)*90-30,230);c.lineTo(60*i+30+Math.sin(a)*90+30,230);c.fill()}c.fillStyle='#333';c.fillRect(140,100,80,30);c.fillStyle='#F2B705';c.fillRect(150,108,60,6)}
  if(kind==='gym'){c.fillStyle='#333';c.fillRect(20,100,140,8);[30,60,90,120,150].forEach(x=>{c.fillStyle='#555';c.fillRect(x-2,108,4,40);c.fillStyle='#222';c.fillRect(x-8,96,16,6)});c.fillStyle='#444';c.fillRect(220,120,110,40);c.fillStyle='#2E6FD1';c.fillRect(300,80,22,30)}
  if(kind==='pub'){counter(20,320,'#7A4A2A');c.fillStyle='#111';c.fillRect(120,40,120,66);c.fillStyle='#2F8F4E';c.fillRect(124,44,112,58);c.strokeStyle='#fff';c.strokeRect(150,56,60,34);c.beginPath();c.arc(180,73,8,0,7);c.stroke()}
  if(kind==='test'){c.fillStyle='#fff';c.beginPath();c.arc(300,70,20,0,7);c.fill();c.strokeStyle='#222';c.beginPath();c.moveTo(300,70);c.lineTo(300,56);c.moveTo(300,70);c.lineTo(310,74);c.stroke();for(let i=0;i<3;i++){const x=20+i*85;c.fillStyle='#D0D5DA';c.fillRect(x,136,70,10);c.fillStyle='#222';c.fillRect(x+22,114,26,20)}}
  if(kind==='resto'){c.fillStyle='#C24E36';c.fillRect(0,40,W,10);for(let i=0;i<3;i++){const x=150+i*72;c.fillStyle='#8A5A35';c.fillRect(x,138,56,8);c.fillRect(x+24,146,8,24);c.fillStyle='#fff';c.beginPath();c.ellipse(x+28,135,14,5,0,0,7);c.fill();c.fillStyle=['#D9531E','#E2B13C','#5C8A3A'][i];c.beginPath();c.ellipse(x+28,132,9,4,0,0,7);c.fill()}c.fillStyle='#2B2000';c.font='800 11px Figtree,sans-serif';c.textAlign='left';c.fillText('JOLLOF · SUYA · SWALLOW',14,70)}
  if(kind==='lounge'){for(let i=0;i<3;i++){c.fillStyle='#4A2C6A';c.fillRect(20+i*120,150,90,26);c.fillRect(20+i*120,136,90,14)}c.strokeStyle='#FF4FD8';c.lineWidth=3;c.beginPath();c.moveTo(30,60);c.lineTo(330,60);c.stroke();c.fillStyle='#F2B705';c.font='800 14px Figtree,sans-serif';c.textAlign='center';c.fillText('EKO VIBES',W/2,92);for(let i=0;i<5;i++){c.fillStyle=`hsla(${(i*70+t/20)%360},80%,60%,.25)`;c.beginPath();c.arc(40+i*70,40,24,0,7);c.fill()}}
  if(kind==='bar'){c.fillStyle='#3A2C20';c.fillRect(150,134,200,30);c.fillStyle='#F2B705';c.fillRect(150,134,200,4);c.strokeStyle='rgba(255,255,255,.6)';c.lineWidth=2;c.beginPath();c.moveTo(0,150);c.lineTo(W,150);c.stroke();for(let i=0;i<8;i++){c.fillStyle='#ddd';c.fillRect(i*46+6,140,2,10)}}
  if(kind==='karaoke'){c.fillStyle='#111';c.fillRect(90,30,180,80);c.fillStyle='#FF4FD8';c.font='800 13px Figtree,sans-serif';c.textAlign='center';c.fillText('♪ Essence · Wizkid ♪',180,64);c.fillStyle='#fff';c.font='700 11px Figtree,sans-serif';c.fillText('"You don\'t need no other body..."',180,86);c.fillStyle='#5A2148';c.fillRect(120,130,120,20);c.fillStyle='#888';c.fillRect(178,100,3,30);c.fillStyle='#222';c.beginPath();c.arc(179,98,5,0,7);c.fill()}
  if(kind==='dayparty'){c.fillStyle='#fff';c.beginPath();c.moveTo(200,140);c.lineTo(260,96);c.lineTo(320,140);c.fill();c.fillStyle='#222';c.fillRect(230,118,60,24);c.fillStyle='#F2B705';c.fillRect(236,122,48,4);[[30,'#C24E36'],[330,'#2B5BA8']].forEach(([x,col])=>{c.fillStyle=col;c.fillRect(x-10,110,20,40)})}
  if(kind==='retail'){for(let s=0;s<4;s++){const x=14+s*88;c.fillStyle='#C9CED3';c.fillRect(x,60,76,90);for(let r=0;r<3;r++)for(let b=0;b<7;b++){c.fillStyle=['#C24E36','#F28C28','#2B5BA8','#08774C','#F2B705'][(s+r+b)%5];c.fillRect(x+4+b*10,66+r*28,8,18)}}c.fillStyle='#F28C28';c.fillRect(0,40,W,12)}
  if(kind==='warehouse'){for(let s=0;s<3;s++){const x=20+s*115;c.fillStyle='#2B5BA8';c.fillRect(x,40,6,110);c.fillRect(x+84,40,6,110);for(let r=0;r<3;r++){c.fillStyle='#F28C28';c.fillRect(x,70+r*30,90,4);for(let b=0;b<3;b++){c.fillStyle='#C9A26B';c.fillRect(x+8+b*26,52+r*30,22,18)}}}c.fillStyle='#F2B705';c.fillRect(250,150,50,22);c.fillRect(290,128,8,30)}
  if(kind==='mybiz'){const ty=S.biz?.type;c.fillStyle='#08774C';c.fillRect(0,40,W,12);c.fillStyle='#2B2000';c.font='800 13px Figtree,sans-serif';c.textAlign='center';c.fillText((S.biz?.name||'Your business').toUpperCase(),W/2,80);
    if(ty==='barber'){for(let i=0;i<2;i++){c.fillStyle='#BFD8E8';c.fillRect(150+i*100,94,70,46);c.fillStyle='#222';c.fillRect(170+i*100,140,30,24)}}
    else if(ty==='suya'){c.fillStyle='#C24E36';c.fillRect(150,104,180,56);c.fillStyle='#111';c.fillRect(170,120,60,6);for(let k=0;k<3;k++){c.fillStyle='rgba(180,180,180,.5)';c.beginPath();c.arc(200+k*10,110-((t/30+k*15)%30),5,0,7);c.fill()}}
    else{c.fillStyle='#4A2C6A';for(let i=0;i<3;i++)c.fillRect(140+i*70,140,60,22);c.strokeStyle='#FF4FD8';c.lineWidth=3;c.beginPath();c.moveTo(140,100);c.lineTo(340,100);c.stroke()}}
  if(kind==='chicken'){counter(20,320,'#C24E36');c.fillStyle='#111';c.fillRect(30,44,300,40);c.fillStyle='#F2B705';c.font='800 13px Figtree,sans-serif';c.textAlign='left';c.fillText('WINGS £5.50 · BURGER MEAL £6.50 · CHIPS',42,69)}
  if(kind==='cafe'){counter(200,140,'#8A5A35');c.fillStyle='#2B2620';c.fillRect(214,96,40,24);c.fillStyle='#B9DAF3';c.fillRect(20,46,150,70);for(let i=0;i<2;i++){c.fillStyle='#8A5A35';c.fillRect(30+i*80,140,50,8);c.fillRect(52+i*80,148,6,22)}}
  if(kind==='carib'){c.fillStyle='#08774C';c.fillRect(0,40,W,10);c.fillStyle='#F2B705';c.fillRect(0,50,W,6);c.fillStyle='#111';c.fillRect(0,56,W,6);counter(150,200,'#7A4A2A');c.fillStyle='#fff';c.beginPath();c.ellipse(220,116,14,5,0,0,7);c.fill();c.fillStyle='#8B3A1A';c.beginPath();c.ellipse(220,113,9,4,0,0,7);c.fill()}
  if(kind==='fine'){c.fillStyle='#F2B705';for(let i=0;i<5;i++){c.beginPath();c.arc(40+i*70,52,4,0,7);c.fill();c.fillRect(39+i*70,40,2,12)}for(let i=0;i<2;i++){const x=150+i*100;c.fillStyle='#EDE6DA';c.fillRect(x,138,70,10);c.fillStyle='#fff';c.beginPath();c.ellipse(x+35,135,14,5,0,0,7);c.fill()}}
  if(kind==='airport'){c.fillStyle='#BFD8E8';c.fillRect(0,40,W,80);c.fillStyle='#fff';c.beginPath();c.ellipse(220+Math.sin(t/3000)*20,80,46,8,0,0,7);c.fill();c.fillRect(214,64,10,30);c.fillStyle='#111';c.fillRect(20,128,150,52);c.fillStyle='#F2B705';c.font='700 10px "JetBrains Mono",monospace';c.textAlign='left';['LOS  LAGOS     ON TIME','ABV  ABUJA     BOARDING','ACC  ACCRA     DELAYED'].forEach((s,i)=>c.fillText(s,28,144+i*14))}
}
function frame(t){
  requestAnimationFrame(frame);
  if(!S||!ctx||document.hidden)return;
  const rect=cv.getBoundingClientRect();if(!rect.width)return;
  const want=Math.round(rect.width*dpr);if(cv.width!==want){cv.width=want;cv.height=Math.round(want*H/W)}
  ctx.setTransform(cv.width/W,0,0,cv.height/H,0,0);ctx.clearRect(0,0,W,H);
  // walking
  if(anim.reset){const s=SPOT.idle;anim.x=anim.tx=s[0];anim.y=anim.ty=s[1];anim.reset=false}
  const dx=anim.tx-anim.x,dy=anim.ty-anim.y,dist=Math.hypot(dx,dy);
  if(dist>.04&&!reduceMotion){const sp=.07;anim.x+=dx/dist*Math.min(sp,dist);anim.y+=dy/dist*Math.min(sp,dist);anim.walking=true}
  else{anim.x=anim.tx;anim.y=anim.ty;anim.walking=false;if(anim.onArrive){const f=anim.onArrive;anim.onArrive=null;f()}}
  const v=here();
  if(v.type==='home')drawHome(t);else drawVenue(t,v);
}
const reduceMotion=matchMedia('(prefers-reduced-motion: reduce)').matches;
function drawAvatar(canvas,look,scale=1.6){const c=canvas.getContext('2d');const r=window.devicePixelRatio||1;canvas.width=canvas.clientWidth*r||140*r;canvas.height=canvas.clientHeight*r||160*r;c.setTransform(r,0,0,r,0,0);c.clearRect(0,0,canvas.width,canvas.height);const w=canvas.width/r,h=canvas.height/r;drawPerson(c,w/2,h-14,look,scale,{t:0})}
function faceURL(look){const c=document.createElement('canvas');c.width=c.height=64;const g=c.getContext('2d');g.fillStyle=FABRICS.find(f=>f.id===look.fabric).base;g.fillRect(0,0,64,64);drawPerson(g,32,124,look,1.9,{t:0});return c.toDataURL()}
