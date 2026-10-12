/* ---------- story mode: the japa ---------- */
const SLOOK={mum:{skin:3,hair:'gele',fabric:'red'},dad:{skin:4,hair:'lowcut',fabric:'indigo'},agent:{skin:3,hair:'lowcut',fabric:'gold'},boy:{skin:4,hair:'afro',fabric:'teal'},
  officer:{skin:0,hair:'lowcut',fabric:'indigo'},carer:{skin:1,hair:'bun',fabric:'green'},driver:{skin:4,hair:'lowcut',fabric:'gold'}};
const CITYNAME={london:'London',manchester:'Manchester',leeds:'Leeds'};
const SV=()=>C.sv;
/* node: {ch, scene, who, text, people:[[look,x]], choices:[{l,s,fx,go}] | go} */
const STORY={
  start:{ch:'Chapter 1 · Before the japa',scene:'ng_home',text:()=>`Ibadan. NEPA has taken light again. The generator is coughing outside, your salary is two months late, and the price of rice has doubled since January.`,people:[['me',150]],go:'mum'},
  mum:{scene:'ng_home',who:'Mummy',text:()=>`${C.name}, you have been quiet all evening. What is on your mind?`,people:[['me',110],['mum',230]],choices:[
    {l:'"I want to japa, Mummy."',go:'dad'},
    {l:'"I\'m just tired, Ma."',go:'tired'}]},
  tired:{scene:'ng_home',who:'Mummy',text:()=>`Tired is not a plan, my child. Your cousin Tobi is in London now. He says there are ways. Proper ways.`,people:[['me',110],['mum',230]],go:'dad'},
  dad:{scene:'ng_home',who:'Daddy',text:()=>`If you are going, you will go properly. How do you want to do it?`,people:[['me',90],['mum',200],['dad',270]],choices:[
    {l:'Get a job with a UK sponsor',s:'Certificate of Sponsorship (CoS). A work visa',fx:()=>{SV().route='cos'},go:'cos_job'},
    {l:'Study for a Masters',s:'Student visa. Needs tuition and proof of funds',fx:()=>{SV().route='student'},go:'stu1'},
    {l:'Through the desert and the sea',s:'No papers. Extremely dangerous',fx:()=>{SV().route='boat'},go:'boat0'}]},

  /* --- CoS route --- */
  cos_job:{scene:'ng_home',who:'You',text:()=>`What kind of job will you go for?`,people:[['me',150]],choices:[
    {l:'Care worker',s:'Health and Care Worker visa. Care homes are hiring',fx:()=>{SV().track='care'},go:'cos1'},
    {l:'IT',s:'Skilled Worker visa. Tech companies sponsor',fx:()=>{SV().track='tech'},go:'cos1'},
    {l:'Chef',s:'Skilled Worker visa. Restaurant kitchens',fx:()=>{SV().track='food'},go:'cos1'}]},
  cos1:{scene:'ng_office',who:'The agent',text:()=>`"My brother, my sister. Forget applying and waiting. I can guarantee you a CoS in two weeks. ₦18 million only. Many people have travelled through me."`,people:[['me',90],['agent',250]],choices:[
    {l:'Apply to employers directly',s:'Slower, but genuine sponsors never charge you',fx:()=>{SV().direct=true},go:'cos2a'},
    {l:'Pay the agent',s:'Fast. But who is this man?',fx:()=>{SV().direct=false;SV().debt+=3000},go:'cos2b'}]},
  cos2a:{scene:'ng_home',text:()=>`Weeks of applications. Rejection after rejection. Then a video interview at 6am, with NEPA holding on just long enough. Two days later, an email: "We are pleased to offer you the role." Your CoS arrives, and it did not cost you a single naira.`,people:[['me',150]],go:'city_cos'},
  cos2b:{scene:'ng_office',text:()=>`You sell your car. Uncle Femi lends you the rest. "Pay me back in pounds," he says, laughing, but he is not joking. The agent sends a CoS from a company nobody has heard of. It looks real.`,people:[['me',90],['agent',250]],go:'city_cos'},
  city_cos:{scene:'ng_home',who:'You',text:()=>`Where is the job?`,people:[['me',150]],choices:[
    {l:'London',s:'Expensive, but everybody is there',fx:()=>{SV().city='london'},go:'cos3'},
    {l:'Manchester',s:'Cheaper rent. Big Naija community',fx:()=>{SV().city='manchester'},go:'cos3'},
    {l:'Leeds',s:'Quieter. Even cheaper',fx:()=>{SV().city='leeds'},go:'cos3'}]},
  cos3:{scene:'ng_office',text:()=>`The visa centre in Lagos. Fingerprints, photo, TB test, English test. The visa fee and the health surcharge swallow everything you saved.`,people:[['me',150]],choices:[
    {l:'Borrow from family',s:'+ £500 now. More debt',fx:()=>{SV().money+=500;SV().debt+=500},go:'farewell'},
    {l:'Sell your phone and laptop',s:'Arrive with less, owe nobody',fx:()=>{SV().money+=150},go:'farewell'}]},

  /* --- Student route --- */
  stu1:{scene:'ng_home',who:'Daddy',text:()=>`The university has offered you a place. Tuition is £16,500. And the Home Office wants to see money in the bank to show you can live there. Where will it come from?`,people:[['me',90],['dad',240]],choices:[
    {l:'Daddy sells the land in Ogbomosho',s:'No debt, but the family feels it',fx:()=>{SV().money+=900;SV().pressure+=25},go:'stu_city'},
    {l:'Take a student loan',s:'Debt to repay',fx:()=>{SV().money+=900;SV().debt+=2500},go:'stu_city'}]},
  stu_city:{scene:'ng_home',who:'You',text:()=>`Which university did you accept?`,people:[['me',150]],choices:[
    {l:'University in London',fx:()=>{SV().city='london'},go:'stu2'},
    {l:'University in Manchester',fx:()=>{SV().city='manchester'},go:'stu2'},
    {l:'University in Leeds',fx:()=>{SV().city='leeds'},go:'stu2'}]},
  stu2:{scene:'ng_party',text:()=>`IELTS: 7.5. Your CAS arrives, then your visa. Your friends throw you a send-forth party with jollof, small chops and a DJ who only plays Wizkid.`,people:[['me',120],['boy',190],['mum',260]],choices:[
    {l:'Dance till 3am',fx:()=>{SV().hope+=10},go:'farewell'},
    {l:'Leave early to pack',fx:()=>{SV().money+=50},go:'farewell'}]},

  /* --- shared departure --- */
  farewell:{scene:'ng_home',who:'Mummy',text:()=>`Mummy holds your face in both hands and prays for twenty minutes. "Don't forget where you come from. And eat well. That place is cold."`,people:[['me',120],['mum',220]],choices:[
    {l:'"I\'ll send money every month, Ma."',fx:()=>{SV().pressure+=10;SV().hope+=10},go:'airport'},
    {l:'"I\'ll come back for Christmas."',fx:()=>{SV().homesick-=10},go:'airport'}]},
  airport:{scene:'ng_airport',text:()=>`Murtala Muhammed Airport, Lagos. Two Ghana-must-go bags, 23kg each, packed with garri, crayfish, dried pepper and three tins of Milo.`,people:[['me',110],['mum',200],['dad',250]],choices:[
    {l:'Wave until you can\'t see them',go:'plane'},
    {l:'Don\'t look back. You\'ll cry',go:'plane'}]},
  plane:{scene:'plane',text:()=>`Six and a half hours in the air. Somewhere far below, other people are crossing the Sahara on foot.`,people:[],go:()=>SV().route==='student'?'arr_stu':'arr_cos'},

  /* --- Boat route --- */
  boat0:{scene:'note',text:()=>`This route is based on real journeys. Thousands of people have died attempting it. It is told here so the story is told, not to recommend it.`,people:[],choices:[
    {l:'Continue',go:'boat1'},
    {l:'Choose another route',go:'dad'}]},
  boat1:{scene:'ng_park',text:()=>`No sponsor, no school fees, no savings for a visa. At the motor park, a man says the road north to Agadez is "only the beginning". He does not say what comes after.`,people:[['me',100],['driver',230]],go:'boat2'},
  boat2:{ch:'The desert',scene:'desert',text:()=>`Niger. Thirty people on the back of a pickup, four days across the Sahara. On the third day the water runs low. The boy beside you, Musa, is maybe sixteen.`,people:[],choices:[
    {l:'Share your water with Musa',fx:()=>{SV().kind=true;SV().hope+=10},go:'boat3'},
    {l:'Keep it. You might need it',fx:()=>{SV().stress+=10},go:'boat3'}]},
  boat3:{ch:'Libya',scene:'libya',text:()=>`Libya. Months of work for men who never pay. Locked rooms, hunger, fear. One day you get two minutes on a borrowed phone.`,people:[],choices:[
    {l:'Tell Mummy you are fine',fx:()=>{SV().stress+=10},go:'boat4'},
    {l:'Tell her the truth',fx:()=>{SV().pressure+=10;SV().truth=true},go:'boat4'}]},
  boat4:{ch:'The sea',scene:'sea',text:()=>`2am. A rubber boat made for forty carries more than a hundred. The engine dies far from land. After nineteen hours, the lights of a rescue ship appear. Not everyone on the boat is there to see them.`,people:[],go:'boat5'},
  boat5:{scene:'calais',text:()=>`Italy. Then France. A camp of tents in the mud near Calais. People talk about "the crossing" quietly, the way you talk about something that might kill you.`,people:[['me',140]],go:'boat6'},
  boat6:{ch:'The Channel',scene:'channel',text:()=>`The English Channel at dawn. Cold, grey, and wider than it looks. Then a UK Border Force boat pulls alongside.`,people:[],go:'boat7'},
  boat7:{scene:'dover',text:()=>`Dover. Wrapped in a foil blanket, you are given a number and a sandwich. When they ask why you are here, you say the word you held onto for the whole journey: "Asylum."`,people:[['me',120],['officer',240]],go:'arr_boat'},

  /* --- Chapter 2: arrivals --- */
  arr_cos:{ch:'Chapter 2 · Landing',scene:'heathrow',text:()=>SV().direct?`Heathrow. Grey sky, grey floor, grey faces. Then you see a woman holding a sign with your name on it. "Welcome to ${CITYNAME[SV().city]}! I'm from your new job. Let's get you home."`:`Heathrow. You look for someone holding your name. Nobody. You call the agent. "The number you are calling is not reachable." You call the company. It rings and rings.`,people:()=>SV().direct?[['me',110],['carer',240]]:[['me',150]],go:'room_cos'},
  room_cos:{scene:'uk_room',text:()=>SV().direct?`A shared room in ${CITYNAME[SV().city]}. Small, cold, but yours. Your neighbour Kwame knocks with a plate of jollof. He's Ghanaian. You will argue about this later.`:`A cousin of a friend lets you have a room in ${CITYNAME[SV().city]}. The company finally emails: "Unfortunately we have no work for you at this time." You have a visa, a room, and no job.`,people:[['me',150]],go:'hopes'},
  arr_stu:{ch:'Chapter 2 · Landing',scene:'campus',text:()=>`Welcome week in ${CITYNAME[SV().city]}. Free pizza, free SIM cards, and a girl in a gold gele who hears your accent and says, "You're Naija? Come and sit with us." Her name is Amara.`,people:[['me',110],['amara',240]],go:'room_stu'},
  room_stu:{scene:'uk_room',text:()=>`Your student room. A kettle, a desk and a window over the car park. Your visa lets you work up to 20 hours a week in term time. You find a part-time kitchen job on day two.`,people:[['me',150]],go:'hopes'},
  arr_boat:{ch:'Chapter 2 · Landing',scene:'hotel',text:()=>`A hotel on the edge of ${CITYNAME[SV().city]}, shared with two hundred others waiting like you. Meals at fixed times, a few pounds a week, and no right to work while your claim is decided. A church volunteer called Chioma brings coats, a SIM card and a smile.`,people:[['me',110],['chioma',240]],go:'room_boat'},
  room_boat:{scene:'hotel',text:()=>SV().kind?`In the corridor, someone calls your name. It's Musa. He made it too. He hugs you for a long time and says, "You gave me water."`:`At night you lie awake listening to the motorway. You made it. You are alive. That has to be the start of something.`,people:()=>SV().kind?[['me',120],['boy',220]]:[['me',150]],go:'hopes'},
  hopes:{ch:'Your first night',scene:'uk_night',who:'You',text:()=>`It's raining outside. You open your notebook and write down what you hope for here.`,people:[['me',150]],choices:[
    {l:'Send enough home to build Mummy a house',fx:()=>{SV().dream='house'},go:'end'},
    {l:'Become the best at what I do',fx:()=>{SV().dream='top'},go:'end'},
    {l:'Find love and start a family',fx:()=>{SV().dream='family'},go:'end'},
    {l:'Build a community of real friends',fx:()=>{SV().dream='social'},go:'end'},
    {l:'Make serious money',fx:()=>{SV().dream='rich'},go:'end'}]},
  end:{scene:'uk_night',text:()=>`Tomorrow, your new life begins.`,people:[['me',150]],choices:[{l:'Begin',go:'@play'}]}};

/* scene art */
function sceneDraw(c,key,t,people){
  const W=360,H=230;c.clearRect(0,0,W,H);
  const sky=(a,b,h=H)=>{const g=c.createLinearGradient(0,0,0,h);g.addColorStop(0,a);g.addColorStop(1,b);c.fillStyle=g;c.fillRect(0,0,W,h)};
  const floor=(col,y=165)=>{c.fillStyle=col;c.fillRect(0,y,W,H-y)};
  const rect=(x,y,w,h,col)=>{c.fillStyle=col;c.fillRect(x,y,w,h)};
  const txt=(s,x,y,col,f='800 11px Figtree,system-ui,sans-serif',al='center')=>{c.font=f;c.fillStyle=col;c.textAlign=al;c.fillText(s,x,y)};
  if(key==='ng_home'){rect(0,0,W,H,'#E2B989');floor('#8A5A35');rect(30,30,110,80,'#121A35');for(let k=0;k<14;k++)rect(36+k*7.5,90-(k*37%30),5,(k*37%30)+20,'#2A3456');for(let k=0;k<9;k++){c.fillStyle='rgba(255,200,90,.85)';c.fillRect(40+k*11,98-(k*23%22),2,2)}c.strokeStyle='#5B3A1E';c.lineWidth=4;c.strokeRect(30,30,110,80);
    rect(250,120,60,45,'#C24E36');rect(255,113,50,9,'#8B2C1F');for(let k=0;k<3;k++){c.fillStyle=`rgba(120,120,120,${.35-k*.1})`;c.beginPath();c.arc(300+k*12+Math.sin(t/400+k)*3,100-k*14-(t/30%10),7+k*3,0,7);c.fill()}
    const g=c.createRadialGradient(200,70,5,200,70,90);g.addColorStop(0,'rgba(255,214,120,.45)');g.addColorStop(1,'rgba(255,214,120,0)');c.fillStyle=g;c.fillRect(0,0,W,H);rect(196,60,8,14,'#F2B705')}
  if(key==='ng_office'){rect(0,0,W,H,'#DCE3EA');floor('#9AA3AB');rect(30,30,90,60,'#fff');txt('STUDY & WORK',75,55,'#C24E36');txt('ABROAD!!',75,72,'#2B3A8C','800 13px Figtree,sans-serif');rect(240,28,80,50,'#fff');txt('UK • CANADA',280,50,'#08774C');txt('100% GUARANTEED',280,66,'#C24E36','800 8px Figtree,sans-serif');rect(150,140,120,12,'#7A5233');rect(160,152,8,30,'#5A3A22');rect(252,152,8,30,'#5A3A22');rect(180,124,26,16,'#222')}
  if(key==='ng_party'){rect(0,0,W,H,'#2A1B3D');floor('#3A2C55');for(let k=0;k<7;k++){c.fillStyle=`hsla(${(k*55+t/15)%360},90%,60%,.35)`;c.beginPath();c.moveTo(50*k+20,0);c.lineTo(50*k+Math.sin(t/500+k)*60,230);c.lineTo(50*k+Math.sin(t/500+k)*60+40,230);c.fill()}for(let k=0;k<12;k++){c.fillStyle=['#F2B705','#08774C','#C24E36'][k%3];c.beginPath();c.moveTo(k*31,0);c.lineTo(k*31+15,16);c.lineTo(k*31+30,0);c.fill()}}
  if(key==='ng_airport'){rect(0,0,W,H,'#E4E7EA');floor('#B8BEC4');rect(20,22,170,62,'#111');['LHR  LONDON HEATHROW  23:15','DXB  DUBAI           23:40','JFK  NEW YORK        00:05'].forEach((s,k)=>txt(s,28,40+k*16,'#F2B705','700 10px "JetBrains Mono",monospace','left'));rect(220,20,120,10,'#08774C');txt('MURTALA MUHAMMED INTERNATIONAL',280,15,'#5D6B64','800 7px Figtree,sans-serif');[[70,190],[300,195]].forEach(([x,y])=>{rect(x-16,y-26,32,26,'#C24E36');c.strokeStyle='#2B3A8C';c.lineWidth=2;for(let k=0;k<4;k++){c.beginPath();c.moveTo(x-16,y-26+k*7);c.lineTo(x+16,y-26+k*7);c.stroke()}})}
  if(key==='plane'){rect(0,0,W,H,'#D9DEE2');c.fillStyle='#BFC6CC';c.beginPath();c.ellipse(180,110,95,80,0,0,7);c.fill();const g=c.createLinearGradient(0,40,0,180);g.addColorStop(0,'#3A5BA0');g.addColorStop(.6,'#F2A65A');g.addColorStop(1,'#F6D29A');c.fillStyle=g;c.beginPath();c.ellipse(180,110,80,66,0,0,7);c.fill();c.save();c.beginPath();c.ellipse(180,110,80,66,0,0,7);c.clip();for(let k=0;k<6;k++){c.fillStyle='rgba(255,255,255,.85)';c.beginPath();c.ellipse((k*70-(t/40)%420)+420-60,150+k%2*10,40,10,0,0,7);c.fill()}c.fillStyle='#E9C27C';c.fillRect(100,165,160,20);c.restore()}
  if(key==='note'){rect(0,0,W,H,'#18221E');txt('Based on real journeys',W/2,105,'#F2B705','800 16px Figtree,sans-serif');txt('Please read the note below',W/2,130,'#97A69E','600 12px Figtree,sans-serif')}
  if(key==='ng_park'){sky('#F6C98E','#F2E3C4',150);floor('#C9A26B',150);for(let k=0;k<3;k++){const x=30+k*110;rect(x,100,90,46,'#F2B705');rect(x+6,106,22,14,'#2A3456');rect(x+34,106,22,14,'#2A3456');rect(x+62,106,22,14,'#2A3456');rect(x,128,90,4,'#111');[x+18,x+72].forEach(cx=>{c.fillStyle='#111';c.beginPath();c.arc(cx,148,8,0,7);c.fill()})}}
  if(key==='desert'){sky('#F2A65A','#F6E0B0',140);c.fillStyle='#FFE9A8';c.beginPath();c.arc(290,50,22,0,7);c.fill();[[0,150,'#E2B46B'],[0,170,'#D39F55']].forEach(([x,y,col])=>{c.fillStyle=col;c.beginPath();c.moveTo(0,y);for(let k=0;k<=12;k++)c.lineTo(k*30,y-10*Math.sin(k*.9+(y/10)));c.lineTo(W,H);c.lineTo(0,H);c.fill()});const x=120+((t/60)%40);rect(x,128,90,24,'#6B5A4A');rect(x+70,116,26,22,'#6B5A4A');for(let k=0;k<12;k++){c.fillStyle='#2B2620';c.beginPath();c.arc(x+6+k*6.5,124-(k%2)*3,3.2,0,7);c.fill()}[x+15,x+80].forEach(cx=>{c.fillStyle='#111';c.beginPath();c.arc(cx,154,7,0,7);c.fill()});c.fillStyle='rgba(210,170,110,.5)';c.beginPath();c.ellipse(x-20,150,30,8,0,0,7);c.fill()}
  if(key==='libya'){rect(0,0,W,H,'#1A1714');rect(160,30,40,26,'#8C7A5E');c.strokeStyle='#1A1714';c.lineWidth=3;for(let k=0;k<4;k++){c.beginPath();c.moveTo(168+k*8,30);c.lineTo(168+k*8,56);c.stroke()}const g=c.createLinearGradient(180,56,180,200);g.addColorStop(0,'rgba(200,180,140,.25)');g.addColorStop(1,'rgba(200,180,140,0)');c.fillStyle=g;c.beginPath();c.moveTo(160,56);c.lineTo(200,56);c.lineTo(260,200);c.lineTo(100,200);c.fill();for(let k=0;k<14;k++){c.fillStyle='#2E2924';const x=20+k*24,y=180+(k%3)*8;c.beginPath();c.arc(x,y-22,7,0,7);c.fill();c.fillRect(x-8,y-15,16,20)}}
  if(key==='sea'){sky('#05070F','#101A33',150);for(let k=0;k<40;k++){c.fillStyle=`rgba(255,255,255,${.3+(k%3)*.2})`;c.fillRect((k*97)%W,(k*53)%120,1.5,1.5)}c.fillStyle='#0B1426';c.fillRect(0,140,W,90);c.strokeStyle='rgba(120,150,200,.35)';for(let r=0;r<6;r++){c.beginPath();for(let x=0;x<=W;x+=10)c.lineTo(x,150+r*14+Math.sin(x/30+t/600+r)*3);c.stroke()}const by=150+Math.sin(t/700)*3;c.fillStyle='#3A3F4A';c.beginPath();c.ellipse(180,by,80,10,0,0,7);c.fill();for(let k=0;k<26;k++){c.fillStyle='#1A1D24';c.beginPath();c.arc(110+k*5.6,by-8-(k%3)*3,3,0,7);c.fill()}const gx=330,g=c.createRadialGradient(gx,135,1,gx,135,30);g.addColorStop(0,'rgba(255,240,200,.9)');g.addColorStop(1,'rgba(255,240,200,0)');c.globalAlpha=.5+.5*Math.sin(t/500);c.fillStyle=g;c.fillRect(gx-30,105,60,60);c.globalAlpha=1}
  if(key==='calais'){sky('#8C949B','#B9C0C6',140);floor('#5E5141',150);for(let k=0;k<6;k++){const x=20+k*58;c.fillStyle=['#2B5BA8','#08774C','#C9921B','#6B6F74','#C24E36','#2B3A8C'][k];c.beginPath();c.moveTo(x,152);c.lineTo(x+22,118);c.lineTo(x+44,152);c.fill()}}
  if(key==='channel'){sky('#9AA6AE','#C9D2D8',120);c.fillStyle='#F2F2EE';c.beginPath();c.moveTo(220,120);c.lineTo(240,96);c.lineTo(360,92);c.lineTo(360,120);c.fill();c.fillStyle='#4F6470';c.fillRect(0,120,W,110);c.strokeStyle='rgba(200,215,225,.4)';for(let r=0;r<6;r++){c.beginPath();for(let x=0;x<=W;x+=10)c.lineTo(x,130+r*16+Math.sin(x/25+t/500+r)*3);c.stroke()}const by=170+Math.sin(t/600)*3;c.fillStyle='#C24E36';c.beginPath();c.ellipse(130,by,55,9,0,0,7);c.fill();for(let k=0;k<16;k++){c.fillStyle=k%3?'#F28C28':'#1A1D24';c.beginPath();c.arc(88+k*5.5,by-8,3.2,0,7);c.fill()}rect(250,150,80,18,'#1B2A40');rect(270,136,36,14,'#1B2A40');rect(250,158,80,3,'#F2F2EE')}
  if(key==='dover'){sky('#A4B2BA','#C3CDD2',140);floor('#6B6F74',150);rect(0,140,W,10,'#8C949B');rect(260,60,90,80,'#E9ECEF');rect(270,70,30,20,'#B9DAF3');txt('UK BORDER FORCE',305,108,'#1B2A40','800 8px Figtree,sans-serif')}
  if(key==='heathrow'){rect(0,0,W,H,'#C9CED3');floor('#9AA0A6');rect(0,20,W,18,'#4F5A63');txt('ARRIVALS  ·  WELCOME TO THE UNITED KINGDOM',W/2,33,'#F2B705','800 10px Figtree,sans-serif');rect(30,50,300,70,'#AEB8C0');for(let k=0;k<6;k++)rect(40+k*48,60,38,50,'#C9D6DF')}
  if(key==='uk_room'||key==='uk_night'){const night=key==='uk_night';rect(0,0,W,H,night?'#3A3F55':'#D9D2C3');floor(night?'#2A2E3E':'#8E8577');rect(220,30,100,80,night?'#0E1428':'#A4B2BA');if(night){for(let k=0;k<10;k++){c.fillStyle='rgba(255,214,120,.8)';c.fillRect(228+(k*29)%90,70+(k*17)%30,3,3)}}c.save();c.beginPath();c.rect(220,30,100,80);c.clip();c.strokeStyle=night?'rgba(170,190,220,.6)':'rgba(90,120,140,.6)';for(let k=0;k<22;k++){const x=220+((k*29+t/8)%110),y=30+((k*47+t/4)%90);c.beginPath();c.moveTo(x,y);c.lineTo(x-2,y+7);c.stroke()}c.restore();c.strokeStyle='#fff';c.lineWidth=3;c.strokeRect(220,30,100,80);rect(20,140,120,26,night?'#4E5470':'#7A8FB0');rect(20,130,30,12,'#EDEDED');if(night){const g=c.createRadialGradient(180,150,5,180,150,70);g.addColorStop(0,'rgba(255,214,120,.35)');g.addColorStop(1,'rgba(255,214,120,0)');c.fillStyle=g;c.fillRect(0,0,W,H)}}
  if(key==='campus'){sky('#A4B2BA','#D2DADF',150);floor('#7FA36B',150);rect(60,50,240,100,'#C9B79C');for(let k=0;k<6;k++)rect(75+k*38,90,10,60,'#E7E1D5');c.fillStyle='#8A6A4A';c.beginPath();c.moveTo(50,50);c.lineTo(180,18);c.lineTo(310,50);c.fill();for(let k=0;k<5;k++)rect(76+k*44,62,22,18,'#5E7FA0')}
  if(key==='hotel'){rect(0,0,W,H,'#D8D3C4');floor('#7E6E5A',165);for(let k=0;k<5;k++){const x=20+k*70;rect(x,60,40,105,'#8A5A35');txt(String(214+k),x+20,52,'#5D6B64','700 9px "JetBrains Mono",monospace')}rect(0,0,W,8,'#F4F6F5');c.fillStyle='rgba(255,255,255,.35)';c.fillRect(0,8,W,4)}
  // people
  (people||[]).forEach(([who,x],k)=>{const look=who==='me'?{skin:C.skin,hair:C.hair,fabric:C.fabric}:(NPCS[who]?NPCS[who].look:SLOOK[who]);drawPerson(c,x,212,look,1.05,{t:t+k*400});if(who==='me'&&key==='dover'){c.fillStyle='rgba(220,225,230,.75)';c.beginPath();c.moveTo(x-16,150);c.lineTo(x+16,150);c.lineTo(x+14,200);c.lineTo(x-14,200);c.fill()}});
  if(['sea','libya','channel','desert'].includes(key)){c.fillStyle='rgba(0,0,0,.08)';c.fillRect(0,0,W,H)}
}

/* player */
let storyRaf=0;
function storyNode(){return STORY[C.node]}
function showStory(){
  const ov=$('overlay');ov.dataset.mode='creator';const n=storyNode();
  const people=typeof n.people==='function'?n.people():n.people;
  if(n.ch)C.chapter=n.ch;
  const choices=n.choices?n.choices.map((ch,i)=>`<button class="choice" data-sc="${i}">${esc(ch.l)}${ch.s?`<small>${esc(ch.s)}</small>`:''}</button>`).join(''):`<button class="go" data-snext>Continue</button>`;
  ov.innerHTML=`<div class="overlay solid story"><div class="modal"><div class="skick"><span>${esc(C.chapter||'')}</span><button class="ghost" data-sskip>Skip story</button></div>
    <div class="scv"><canvas id="storycv"></canvas></div>
    ${n.who?`<div class="swho">${esc(n.who)}</div>`:''}<p class="stext">${esc(n.text())}</p><div style="display:grid;gap:8px">${choices}</div></div></div>`;
  const cv=$('storycv');cancelAnimationFrame(storyRaf);
  const loop=t=>{if(!cv.isConnected)return;const r=window.devicePixelRatio||1,w=cv.clientWidth;if(cv.width!==Math.round(w*r)){cv.width=Math.round(w*r);cv.height=Math.round(w*r*230/360)}const c=cv.getContext('2d');c.setTransform(cv.width/360,0,0,cv.height/230,0,0);sceneDraw(c,n.scene,reduceMotion?0:t,people);if(!reduceMotion)storyRaf=requestAnimationFrame(loop)};
  storyRaf=requestAnimationFrame(loop);
}
function storyGo(next){
  const go=typeof next==='function'?next():next;
  if(go==='@play'){finishStory();return}
  C.node=go;showStory();window.scrollTo({top:0});
}
function storyClick(t){
  const d=t.dataset,n=storyNode();
  if(d.sc!==undefined){const ch=n.choices[+d.sc];if(ch.fx)ch.fx();storyGo(ch.go);return true}
  if(t.hasAttribute('data-snext')){storyGo(n.go);return true}
  if(t.hasAttribute('data-sskip')){Object.assign(C.sv,{route:C.sv.route||'cos',track:C.sv.track||'care',city:C.sv.city||'london',direct:C.sv.direct!==false,dream:C.sv.dream||'top'});if(C.sv.route==='cos'&&C.sv.direct===undefined)C.sv.direct=true;finishStory();return true}
  return false;
}
function startStory(){C.sv={route:null,track:null,city:null,money:300,debt:0,pressure:20,hope:50,stress:20,homesick:40,direct:true,kind:false,truth:false,dream:null};C.node='start';C.chapter='';showStory()}
function finishStory(){
  cancelAnimationFrame(storyRaf);
  const v=C.sv,route=v.route||'cos',city=v.city||(route==='boat'?pick(['london','manchester','leeds']):'london');
  const homes=CITIES[city].homes;
  const home=route==='boat'?homes.find(h=>h.hotel).id:homes.find(h=>!h.hotel&&h.shared).id;
  S=newGame({name:C.name,skin:C.skin,hair:C.hair,fabric:C.fabric,traits:C.traits,dream:v.dream||'top',lottery:'steady',track:route==='boat'?null:route==='student'?'food':(v.track||'care'),city,home});
  S.route=route;S.money=route==='boat'?20:route==='student'?v.money:v.money+(v.direct?300:0);S.debt=v.debt;
  S.pressure=clamp(v.pressure);S.homesick=clamp(v.homesick+(route==='boat'?20:0));S.needs.fun=clamp(v.hope);
  S.storyQ=[];S.flags.kind=v.kind;
  if(route==='cos'){S.visaLabel=v.track==='care'?'Health and Care Worker visa':'Skilled Worker visa';if(!v.direct){S.track=null;S.storyQ.push({day:2,id:'cos_nojob'})}else S.storyQ.push({day:2,id:'cos_first'})}
  if(route==='student'){S.visaLabel='Student visa';S.hoursCap=20;S.npcs.amara.met=true;S.npcs.amara.rel=20;S.storyQ.push({day:3,id:'stu_lecture'},{day:28,id:'stu_grad'})}
  if(route==='boat'){S.visaLabel='Asylum seeker';S.workBan=true;S.support=9;S.npcs.chioma.met=true;S.npcs.chioma.rel=18;S.storyQ.push({day:6,id:'asy_interview'})}
  C=null;const ov=$('overlay');ov.dataset.mode='';ov.innerHTML='';
  log(`Day 1 in ${CITIES[city].name}.`,'good');
  msg('mummy',route==='boat'?'My child!!! You are alive. God is faithful. Call me, I want to hear your voice 🙏🏾😭':'Have you landed?? Call me as soon as you can. God be with you 🙏🏾');
  if(S.debt&&route!=='student')msg('uncle','Welcome. Remember our arrangement: £100 every Monday. God bless.');
  anim.reset=true;save();render();
}
