'use strict';
const KEY='japa-life-save-v3';
const DAYS=['Mon','Tue','Wed','Thu','Fri','Sat','Sun'];
const SKINS=['#F0C8A4','#C98C5E','#9C6440','#6B4027','#46281A'];
const HAIRS=[['lowcut','Low cut'],['afro','Afro'],['braids','Braids'],['locs','Locs'],['gele','Gele'],['bun','Puff bun']];
const FABRICS=[
  {id:'green',name:'Eko green',base:'#08774C',dot:'#F2B705',acc:'#C24E36'},
  {id:'indigo',name:'Adire indigo',base:'#2B3A8C',dot:'#A9BEFF',acc:'#F2F2F2'},
  {id:'gold',name:'Aso oke gold',base:'#C9921B',dot:'#7A2E12',acc:'#FFF1C2'},
  {id:'red',name:'Owambe red',base:'#B3261E',dot:'#F6C445',acc:'#1B1210'},
  {id:'purple',name:'Lace purple',base:'#6A2C91',dot:'#E3C6F5',acc:'#F2B705'},
  {id:'teal',name:'Ankara teal',base:'#0E7C86',dot:'#F28C28',acc:'#FFFFFF'}];
const TRAITS={
  hustler:{name:'Hustler',d:'+10% pay. Enjoyment drains faster.'},
  owambe:{name:'Owambe royalty',d:'Parties give much more gist and enjoyment.'},
  homebody:{name:'Homebody',d:'Home activities are more fun. Gist drains slower.'},
  bookworm:{name:'Bookworm',d:'Study and career skill grow 50% faster.'},
  pincher:{name:'Penny pincher',d:'15% off food and shopping.'},
  charmer:{name:'Charmer',d:'Relationships grow 50% faster.'},
  prayer:{name:'Prayer warrior',d:'Home pressure builds slower. Church hits harder.'},
  chef:{name:'Chef at heart',d:'Cooking skill grows twice as fast.'},
  nightowl:{name:'Night owl',d:'Late nights cost less energy. Night shifts pay more.'},
  football:{name:'Football fanatic',d:'Watching football is twice as fun.'}};
const DREAMS={
  foodie:{name:'Certified foodie',d:'Try 15 different dishes around your city.'},
  social:{name:'Social butterfly',d:'Have 5 good friends.'},
  top:{name:'Top of the ladder',d:'Reach the top level of any career.'},
  rich:{name:'Rich list top 3',d:'Make the top 3 of the rich list.'},
  family:{name:'Love and marriage',d:'Get married.'}};
const LOTTERY=[
  {id:'soft',name:'Soft life',d:'Payday just landed and your rent is sorted. You start with £1,500.',money:1500,debt:0},
  {id:'steady',name:'Steady',d:'Nothing flashy, nothing owed. You start with £700.',money:700,debt:0},
  {id:'sapa',name:'Sapa season',d:'You start with £250 and owe Uncle Femi £1,000, repaid at £100 a week.',money:250,debt:1000}];
const TRACKS={
  care:{name:'Care',venue:'carehome',skill:'career',titles:['Care Assistant','Senior Carer','Team Leader','Registered Nurse','Nurse Manager'],pay:[12.8,14,15.8,19.8,26]},
  tech:{name:'Tech',venue:'office',skill:'career',titles:['IT Support','Junior Developer','Developer','Senior Developer','Tech Lead'],pay:[14,18.5,26,33,42]},
  finance:{name:'Finance',venue:'office',skill:'career',titles:['Accounts Assistant','Assistant Accountant','Accountant','Senior Accountant','Finance Manager'],pay:[13.5,16,21,27,35]},
  food:{name:'Kitchen',venue:'kitchen',skill:'cooking',titles:['Kitchen Assistant','Commis Chef','Chef de Partie','Sous Chef','Head Chef'],pay:[12.8,13.8,15.5,18,22]}
  ,retail:{name:'Retail',venue:'retail',skill:'charisma',start:[7,15],titles:['Shop Assistant','Supervisor','Assistant Manager','Store Manager','Area Manager'],pay:[12.6,13.6,16,21,28]}
  ,warehouse:{name:'Warehouse',venue:'warehouse',skill:'fitness',start:[6,14],night:true,titles:['Warehouse Operative','Forklift Driver','Team Leader','Shift Manager','Operations Manager'],pay:[13,14.5,16.5,20,27]}
  ,security:{name:'Security',venue:'office',skill:'fitness',start:[6,14],night:true,titles:['Security Officer (SIA)','Senior Officer','Control Room Operator','Security Supervisor','Security Manager'],pay:[12.8,14,15.5,18,24]}
  ,bar:{name:'Bar',venue:'bar',skill:'charisma',start:[15,20],titles:['Bartender','Senior Bartender','Bar Supervisor','Bar Manager','General Manager'],pay:[12.6,13.6,15.2,19,25]}};
const PROMO_XP=[5,10,16,24], PROMO_SKILL=[1,3,5,7];
const VISAS={hcw:'Health and Care Worker visa',sw:'Skilled Worker visa',student:'Student visa',graduate:'Graduate visa',ilr:'Indefinite Leave to Remain'};

/* venue types: hours are [days, from, to]; to can pass 24 for after-midnight */
const ALL=[0,1,2,3,4,5,6], WK=[0,1,2,3,4];
const VT={
  home:{cat:'home',open:[[ALL,0,24]],label:'Home'},
  market:{cat:'shop',open:[[ALL,8,20]],label:'African market'},
  salon:{cat:'shop',open:[[[1,2,3,4,5,6],9,20]],label:'Barber and braids'},
  office:{cat:'work',open:[[WK,7,20]],label:'Office'},
  carehome:{cat:'work',open:[[ALL,0,24]],label:'Care home'},
  kitchen:{cat:'work',open:[[ALL,10,24]],label:'Restaurant kitchen'},
  campus:{cat:'learn',open:[[WK,8,21]],label:'University'},
  library:{cat:'learn',open:[[ALL,9,20]],label:'Library'},
  church:{cat:'social',open:[[[6],8,13],[[2],18,21]],label:'Church'},
  hall:{cat:'social',open:[[[5],12,23]],label:'Owambe hall'},
  club:{cat:'social',open:[[[4,5],21,27]],label:'Afrobeats night'},
  gym:{cat:'social',open:[[ALL,6,22]],label:'Gym'},
  park:{cat:'social',open:[[ALL,6,21]],label:'Park'},
  pub:{cat:'social',open:[[ALL,12,23]],label:'Sports bar'},
  test:{cat:'learn',open:[[WK,9,17]],label:'Test centre'},
  restaurant:{cat:'food',open:[[ALL,11,22]],label:'Nigerian restaurant'},
  chicken:{cat:'food',open:[[ALL,11,25]],label:'Chicken shop'},
  cafe:{cat:'food',open:[[ALL,7,18]],label:'Café'},
  caribbean:{cat:'food',open:[[ALL,11,22]],label:'Caribbean takeaway'},
  fine:{cat:'food',open:[[[1,2,3,4,5],12,22]],label:'Fine dining'},
  airport:{cat:'travel',open:[[ALL,0,24]],label:'Airport'},
  lounge:{cat:'social',open:[[ALL,17,26]],label:'Afro lounge'},
  bar:{cat:'social',open:[[ALL,15,25]],label:'Rooftop bar'},
  karaoke:{cat:'social',open:[[[3,4,5],19,26]],label:'AfroMic karaoke'},
  dayparty:{cat:'social',open:[[[5,6],14,22]],label:'Amapiano day party'},
  retail:{cat:'work',open:[[ALL,7,22]],label:'Supermarket'},
  warehouse:{cat:'work',open:[[ALL,0,24]],label:'Warehouse'},
  mybiz:{cat:'shop',open:[[ALL,0,24]],label:'Your business'}};
const POS={retail:[262,252],warehouse:[330,410],home:[178,292],market:[118,338],salon:[92,272],office:[290,150],carehome:[236,336],kitchen:[214,96],campus:[312,282],library:[150,236],church:[56,360],hall:[316,382],club:[150,118],gym:[236,232],park:[92,404],pub:[58,206],test:[250,404],airport:[34,52],chicken:[140,372],cafe:[206,196],caribbean:[30,300]};
const CITIES={
  london:{ll:{"market": [51.4697, -0.0692], "salon": [51.4745, -0.064], "office": [51.5049, -0.0195], "carehome": [51.456, -0.012], "kitchen": [51.5262, -0.0802], "campus": [51.4829, -0.0062], "library": [51.4738, -0.0687], "church": [51.485, -0.075], "hall": [51.504, 0.115], "club": [51.5236, -0.076], "gym": [51.4946, -0.1003], "park": [51.461, -0.065], "pub": [51.4605, -0.11], "test": [51.3755, -0.0985], "airport": [51.47, -0.4543],chicken:[51.4722, -0.0705],cafe:[51.4745, -0.0712],caribbean:[51.462, -0.117],retail:[51.4725, -0.072],warehouse:[51.53, 0.13]},name:'London',london:true,
    river:'M-10 176 C 50 160, 90 200, 150 186 S 250 150, 300 172 S 350 196, 380 180',
    parks:[[70,392,46,26],[110,46,40,22]],
    homes:[{id:'hotel_london',hotel:true,ll:[51.39, -0.105],name:'Asylum hotel, Croydon',rent:0,shared:true},{id:'peckham',ll:[51.4705, -0.0662],name:'Shared room, Peckham',rent:160,shared:true},{id:'woolwich',ll:[51.4908, 0.0697],name:'Studio flat, Woolwich',rent:235}],
    v:{market:'Rye Lane Market, Peckham',salon:'Fresh Fade Barbers & Braids',office:'Office, Canary Wharf',carehome:'Sunrise Lodge Care Home, Lewisham',kitchen:'Restaurant kitchen, Shoreditch',campus:'University campus, Greenwich',library:'Peckham Library',church:'Grace Assembly, Old Kent Road',hall:'Royal Event Hall, Thamesmead',club:'Afrobeats night, Shoreditch',gym:'Gym, Elephant & Castle',park:'Peckham Rye Park',pub:'Sports bar, Brixton',test:'Test centre, Croydon',airport:'Heathrow Airport',chicken:'Golden Wings Chicken, Peckham',cafe:'Rye Lane Café',caribbean:'Jerk Junction, Brixton',retail:'Supermarket, Peckham',warehouse:'Warehouse, Dagenham'},
    eats:[{id:'805',ll:[51.4799, -0.0565],name:'805 Restaurant',area:'Old Kent Road',dish:'Monika fish and party jollof',cost:16,x:24,y:318},
      {id:'papis',ll:[51.4762, -0.0326],name:"Papi's Grill",area:'New Cross',dish:'Asun and suya-spiced beef',cost:14,x:220,y:286},
      {id:'enish',ll:[51.4626, -0.1145],name:'Enish',area:'Brixton',dish:'Party jollof, ayamase and swallow',cost:24,x:40,y:256},
      {id:'chukus',ll:[51.586, -0.0714],name:"Chuku's",area:'Tottenham',dish:'Nigerian tapas: kuli kuli wings and moi moi',cost:22,x:250,y:40},
      {id:'asorock',ll:[51.5462, -0.075],name:'Aso Rock',area:'Dalston',dish:'Ayamase with assorted meat',cost:18,x:196,y:56}],
    night:[{id:'aquarium',type:'club',name:'Club Aquarium',area:'Shoreditch',ll:[51.525894, -0.085162],entry:15,real:1,x:40,y:60},
      {id:'shakazulu',type:'club',name:'Shaka Zulu',area:'Camden',ll:[51.542339, -0.147738],entry:20,real:1,x:90,y:72},
      {id:'ekolounge',type:'lounge',name:'Eko Lounge',area:'Peckham',ll:[51.4712, -0.0675],entry:0,real:0,x:140,y:84},
      {id:'skyline',type:'bar',name:'Skyline Rooftop Bar',area:'Canary Wharf',ll:[51.504, -0.0175],entry:0,real:0,x:190,y:96},
      {id:'afromic',type:'karaoke',name:'AfroMic Karaoke',area:'Brixton',ll:[51.4635, -0.113],entry:10,real:0,x:240,y:108},
      {id:'amapiano',type:'dayparty',name:'Amapiano Sundays',area:'Hackney',ll:[51.545, -0.055],entry:20,real:0,x:290,y:120}],
    fine:[[110,150],[78,140],[124,196]]},
  manchester:{ll:{"market": [53.461, -2.239], "salon": [53.464, -2.236], "office": [53.4805, -2.251], "carehome": [53.492, -2.3], "kitchen": [53.484, -2.235], "campus": [53.4668, -2.2339], "library": [53.4782, -2.2447], "church": [53.4675, -2.25], "hall": [53.461, -2.286], "club": [53.478, -2.249], "gym": [53.47, -2.244], "park": [53.4478, -2.2245], "pub": [53.443, -2.219], "test": [53.4795, -2.24], "airport": [53.3588, -2.2727],chicken:[53.462, -2.232],cafe:[53.4835, -2.2365],caribbean:[53.4575, -2.24],retail:[53.469, -2.247],warehouse:[53.465, -2.32]},name:'Manchester',
    river:'M-10 120 C 60 140, 100 100, 160 130 S 260 170, 380 140',
    parks:[[88,398,44,26],[300,60,40,24]],
    homes:[{id:'hotel_manchester',hotel:true,ll:[53.472, -2.295],name:'Asylum hotel, Salford Quays',rent:0,shared:true},{id:'mossside',ll:[53.459, -2.233],name:'Shared room, Moss Side',rent:120,shared:true},{id:'salford',ll:[53.487, -2.287],name:'Studio flat, Salford',rent:185}],
    v:{market:'Afro Foods, Moss Side',salon:'Fresh Fade Barbers & Braids',office:'Office, Spinningfields',carehome:'Brookfield Care Home, Salford',kitchen:'Restaurant kitchen, Northern Quarter',campus:'University campus, Oxford Road',library:'Central Library',church:'Grace Assembly, Hulme',hall:'Royal Event Hall, Old Trafford',club:'Afrobeats night, Deansgate',gym:'Gym, Hulme',park:'Platt Fields Park',pub:'Sports bar, Fallowfield',test:'Test centre, city centre',airport:'Manchester Airport',chicken:'Golden Wings Chicken, Moss Side',cafe:'Northern Quarter Café',caribbean:'Jerk Junction, Moss Side',retail:'Supermarket, Hulme',warehouse:'Warehouse, Trafford Park'},
    eats:[{id:'yettis',ll:[53.4852, -2.2408],name:"Yetti's Kitchen",area:'Printworks',dish:'Jollof, pounded yam and egusi',cost:15,x:200,y:186},
      {id:'enishm',ll:[53.4763, -2.2511],name:'Enish',area:'Deansgate',dish:'Goat pepper soup and chicken suya',cost:26,x:120,y:176}],
    night:[{id:'runway',type:'club',name:'Runway',area:'Deansgate',ll:[53.48101, -2.247578],entry:15,real:1,x:40,y:60},
      {id:'ekolounge',type:'lounge',name:'Eko Lounge',area:'Moss Side',ll:[53.46, -2.2365],entry:0,real:0,x:90,y:72},
      {id:'skyline',type:'bar',name:'Skyline Rooftop Bar',area:'Spinningfields',ll:[53.4797, -2.2532],entry:0,real:0,x:140,y:84},
      {id:'afromic',type:'karaoke',name:'AfroMic Karaoke',area:'Northern Quarter',ll:[53.4848, -2.2335],entry:10,real:0,x:190,y:96},
      {id:'amapiano',type:'dayparty',name:'Amapiano Sundays',area:'Ancoats',ll:[53.485, -2.225],entry:20,real:0,x:240,y:108}],
    fine:[[338,24],[338,58],[338,92]]},
  leeds:{ll:{"market": [53.815, -1.531], "salon": [53.8135, -1.535], "office": [53.796, -1.556], "carehome": [53.834, -1.5], "kitchen": [53.7955, -1.5405], "campus": [53.8067, -1.555], "library": [53.8001, -1.549], "church": [53.811, -1.514], "hall": [53.808, -1.51], "club": [53.795, -1.5395], "gym": [53.7985, -1.545], "park": [53.837, -1.497], "pub": [53.8215, -1.5795], "test": [53.7975, -1.542], "airport": [53.8659, -1.6606],chicken:[53.816, -1.529],cafe:[53.7975, -1.545],caribbean:[53.8185, -1.5335],retail:[53.81, -1.52],warehouse:[53.79, -1.51]},name:'Leeds',
    river:'M-10 210 C 70 230, 130 190, 190 214 S 300 240, 380 216',
    parks:[[300,70,48,28],[88,400,40,24]],
    homes:[{id:'hotel_leeds',hotel:true,ll:[53.818, -1.465],name:'Asylum hotel, Seacroft',rent:0,shared:true},{id:'chapeltown',ll:[53.817, -1.532],name:'Shared room, Chapeltown',rent:105,shared:true},{id:'headingley',ll:[53.819, -1.577],name:'Studio flat, Headingley',rent:165}],
    v:{market:'Afro Foods, Chapeltown',salon:'Fresh Fade Barbers & Braids',office:'Office, Wellington Place',carehome:'Oakwood Care Home, Roundhay',kitchen:'Restaurant kitchen, Call Lane',campus:'University campus, Woodhouse',library:'Leeds Central Library',church:'Grace Assembly, Harehills',hall:'Royal Event Hall, Harehills',club:'Afrobeats night, Call Lane',gym:'Gym, city centre',park:'Roundhay Park',pub:'Sports bar, Headingley',test:'Test centre, city centre',airport:'Leeds Bradford Airport',chicken:'Golden Wings Chicken, Chapeltown',cafe:'Kirkgate Café',caribbean:'Jerk Junction, Chapeltown',retail:'Supermarket, Harehills',warehouse:'Warehouse, Cross Green'},
    eats:[{id:'juicy',ll:[53.7838, -1.5517],name:'Juicy African Kitchen',area:'Holbeck',dish:'Smoky jollof and goat suya',cost:11,x:130,y:262},
      {id:'afrochops',ll:[53.7424, -1.5433],name:'Afrochops',area:'Middleton',dish:'Oxtail, egusi and ayamase',cost:10,x:196,y:388}],
    night:[{id:'ekolounge',type:'lounge',name:'Eko Lounge',area:'Chapeltown',ll:[53.8166, -1.5326],entry:0,real:0,x:40,y:60},
      {id:'skyline',type:'bar',name:'Skyline Rooftop Bar',area:'City Centre',ll:[53.7966, -1.5472],entry:0,real:0,x:90,y:72},
      {id:'afromic',type:'karaoke',name:'AfroMic Karaoke',area:'Call Lane',ll:[53.7961, -1.5386],entry:10,real:0,x:140,y:84},
      {id:'amapiano',type:'dayparty',name:'Amapiano Sundays',area:'Kirkstall',ll:[53.815, -1.6],entry:20,real:0,x:190,y:96}],
    fine:[[338,24],[338,58],[338,92]]}};
const FINE=[
  {id:'chishuru',ll:[51.5166, -0.1399],name:'Chishuru',area:'Fitzrovia, London',dish:'Michelin-starred West African cooking',cost:75},
  {id:'akoko',ll:[51.5179, -0.1368],name:'Akoko',area:'Fitzrovia, London',dish:'Michelin-starred tasting menu',cost:120},
  {id:'ikoyi',ll:[51.5124, -0.1151],name:'Ikoyi',area:'Strand, London',dish:'Two Michelin stars. Smoked jollof',cost:250}];

/* people: haunts = [venueType, days|null, from, to] */
const NPCS={
  kwame:{name:'Kwame',bio:'Your Ghanaian neighbour. Fixes bikes. Swears Ghana jollof is better.',look:{skin:3,hair:'lowcut',fabric:'teal'},haunts:[['park',[6],9,16],['pub',null,17,23],['gym',null,7,10],['market',[5],10,14]]},
  chioma:{name:'Chioma',bio:'Nurse from Enugu. Sings in the church choir. No nonsense.',look:{skin:2,hair:'braids',fabric:'purple'},haunts:[['church',null,0,24],['carehome',null,7,19],['market',[5],9,13],['gym',null,18,21]]},
  tobi:{name:'Tobi',bio:'Your old friend from Lagos, now a developer. Always has a new business idea.',look:{skin:3,hair:'afro',fabric:'indigo'},haunts:[['office',null,9,18],['club',null,21,27],['pub',null,18,23],['restaurant',null,12,21]]},
  amara:{name:'Amara',bio:'Masters student in data science. Organises the Nigerian society.',look:{skin:2,hair:'bun',fabric:'gold'},haunts:[['campus',null,9,19],['library',null,10,19],['club',null,22,27],['restaurant',[5,6],13,20]]},
  dele:{name:'Dele',bio:'Barber with the cleanest fade in the city. Knows everybody.',look:{skin:4,hair:'lowcut',fabric:'red'},haunts:[['salon',null,0,24],['pub',[6],14,22]]},
  sade:{name:'Sade',bio:'Owambe queen. Sells aso ebi and runs three WhatsApp groups.',look:{skin:3,hair:'gele',fabric:'gold'},haunts:[['hall',null,0,27],['market',null,10,18],['church',null,0,24]]},
  grace:{name:'Grace',bio:'Your colleague. British-Jamaican, warm, and fiercely kind.',look:{skin:2,hair:'locs',fabric:'green'},haunts:[['@work',null,0,24],['gym',null,17,20],['restaurant',[4],18,21]]},
  tom:{name:'Tom',bio:'Your colleague from Yorkshire. Curious about Nigeria. Wants to try egusi.',look:{skin:0,hair:'lowcut',fabric:'indigo'},haunts:[['@work',null,0,24],['pub',null,17,23]]},
  bisi:{name:'Aunty Bisi',bio:'Runs the African shop. Asks about your mother every time.',look:{skin:4,hair:'gele',fabric:'red'},haunts:[['market',null,0,24],['church',[6],0,24]],aunty:true},
  emeka:{name:'Emeka',bio:'Arsenal till he dies. Loud, loyal, and always at the match.',look:{skin:4,hair:'lowcut',fabric:'red'},haunts:[['pub',null,13,23],['club',null,21,27],['park',[6],10,15]]}};

/* furniture: pos [gx,gy], size [w,d,h] in room units (6x6 grid) */
const FURN={
  mattress:{name:'Floor mattress',start:true,pos:[3.5,0.15],size:[2,1.35,.22],col:'#C9D3E8',spot:[4.4,2]},
  bed:{name:'Proper double bed',price:180,replaces:'mattress',pos:[3.4,0.15],size:[2.2,1.55,.5],col:'#7A4E9C',head:true,spot:[4.4,2.2],d:'Sleep restores energy 25% faster.'},
  cooker:{name:'Two-ring cooker',start:true,pos:[0.1,1.1],size:[1,1,.9],col:'#E8ECEA',hob:true,spot:[1.5,1.6]},
  fridge:{name:'Mini fridge',start:true,pos:[0.1,2.25],size:[1,.9,1.15],col:'#DDE3E0',spot:[1.5,2.7]},
  chair:{name:'Folding chair',start:true,pos:[2.6,2.9],size:[.6,.6,.45],col:'#8A6A4A',spot:[3,3.8]},
  sofa:{name:'Sofa',price:150,pos:[1.4,4.85],size:[2.4,1,.45],col:'#08774C',back:true,spot:[2.6,4.2],d:'Nap and relax in comfort. More fun at home.'},
  tv:{name:'Smart TV',price:220,pos:[1.6,0.1],size:[1.6,.35,.8],col:'#1B1F1D',screen:true,spot:[2.4,2.3],d:'Nollywood and football are much more fun.'},
  desk:{name:'Study desk',price:90,pos:[0.1,3.5],size:[1,1.2,.75],col:'#A87B4F',spot:[1.5,4.1],d:'Study 50% faster at home.'},
  photos:{name:'Family photo wall',price:25,wall:true,d:'Homesickness builds slower.'},
  plants:{name:'Plants',price:20,pos:[5.3,5.3],size:[.5,.5,.6],col:'#2F8F4E',plant:true,d:'Enjoyment drains slower at home.'},
  speaker:{name:'Bluetooth speaker',price:70,pos:[5.3,3],size:[.45,.45,.7],col:'#2A2A2A',spot:[4.6,3.4],d:'Play Afrobeats and dance.'},
  ringlight:{name:'Ring light and tripod',price:60,pos:[5.35,4.2],size:[.3,.3,1.5],col:'#EDEDED',ring:true,spot:[4.6,4.5],d:'Film skits. Earns money once you are settled.'},
  blanket:{name:'Electric blanket',price:35,onbed:true,d:'Cold snaps no longer ruin your sleep.'},
  freezer:{name:'Chest freezer',price:120,pos:[0.1,0.05],size:[1,.95,.85],col:'#F4F6F5',spot:[1.4,0.7],d:'Market runs give 5 bags of ingredients instead of 3.'},
  rug:{name:'Ankara rug',price:40,floor:true,pos:[2.2,2.4],size:[2.2,2],d:'Makes the flat feel like home. Homesick builds slower.'}};
const SPOT={loo:[0.7,5.5],idle:[3,3.4],door:[3.4,5.6]};

const RICH0=[['Tobi A. · Tech Lead',38000],['@AsoEbiEmpress',29000],['Dr Kemi O.',24000],['@JollofKingMcr',15000],['Dele the Barber',9000],['@NaijaInLeeds',6500],['Nurse Chioma',4200],['@PeckhamPrince',2500],['Emeka · Arsenal fan',800]];

/* food */
const DISHES={
  jollof:{n:'Jollof rice and chicken',p:12,h:60,f:12,naija:1},
  fried:{n:'Fried rice and turkey',p:14,h:60,f:12,naija:1},
  egusi:{n:'Pounded yam and egusi',p:15,h:75,f:14,naija:1},
  efo:{n:'Efo riro and amala',p:14,h:70,f:12,naija:1},
  pepper:{n:'Goat pepper soup',p:10,h:40,f:14,naija:1},
  suya:{n:'Suya platter',p:13,h:45,f:18,naija:1},
  asun:{n:'Asun (peppered goat)',p:11,h:40,f:16,naija:1},
  monika:{n:'Monika fish',p:16,h:55,f:18,naija:1},
  ayamase:{n:'Ayamase and white rice',p:15,h:65,f:15,naija:1},
  moimoi:{n:'Moi moi and plantain',p:8,h:35,f:8,naija:1},
  smallchops:{n:'Small chops platter',p:9,h:35,f:14,naija:1},
  kuli:{n:'Kuli kuli chicken wings',p:10,h:40,f:16,naija:1},
  oxtail:{n:'Oxtail stew and rice',p:12,h:65,f:14},
  chapman:{n:'Chapman',p:5,h:5,f:10,drink:1,naija:1},
  zobo:{n:'Zobo',p:4,h:5,f:8,drink:1,naija:1},
  wings:{n:'Six wings and chips',p:5.5,h:45,f:8},
  burger:{n:'Chicken burger meal',p:6.5,h:50,f:8},
  brunch:{n:'Full brunch plate',p:11,h:55,f:12},
  pastry:{n:'Coffee and a pastry',p:5,h:20,f:8},
  latte:{n:'Latte',p:3.5,h:3,f:6,drink:1},
  jerk:{n:'Jerk chicken, rice and peas',p:11,h:65,f:14},
  patty:{n:'Beef patty and coco bread',p:4.5,h:30,f:8},
  curry:{n:'Curry goat and rice',p:12,h:65,f:14},
  tasting:{n:'Tasting menu',p:0,h:70,f:45,fine:1},
  cocktail:{n:'Signature cocktail',p:12,h:3,f:16,drink:1}};
const MENUS={'805':['monika','jollof','fried','pepper','moimoi','chapman'],papis:['asun','suya','jollof','pepper','zobo'],enish:['jollof','ayamase','egusi','pepper','smallchops','chapman'],
  chukus:['kuli','moimoi','smallchops','jollof','zobo'],asorock:['ayamase','efo','egusi','pepper','chapman'],yettis:['jollof','egusi','suya','smallchops','zobo'],
  enishm:['pepper','suya','jollof','egusi','chapman'],juicy:['jollof','suya','fried','moimoi','zobo'],afrochops:['oxtail','egusi','ayamase','jollof','zobo'],
  chicken:['wings','burger'],lounge:['chapman','smallchops','suya','asun','zobo'],bar:['cocktail','chapman','smallchops'],cafe:['brunch','pastry','latte'],caribbean:['jerk','curry','patty']};

/* conversation */
const TOPICS={
  football:{l:'Football',me:['Did you watch the match last night?','Who is winning the league this season?','Five-a-side this Sunday?'],like:["Don't start me! That last-minute goal...",'We are winning it this year. Write it down.','I am always ready for five-a-side. Bring boots.'],meh:["I don't really follow football, to be honest.",'Football is not my thing, but go on.']},
  food:{l:'Food',me:['Where do you go for the best jollof around here?','What did you eat today?','Have you tried the suya at that new spot?'],like:['Ahh, now you are talking my language. I know a place.','I made egusi yesterday. It was too sweet.','Food is life. Let us go together one day.'],meh:["I just eat whatever, honestly.","I'm not a big foodie."]},
  music:{l:'Music',me:['What are you listening to these days?','Did you hear the new Burna Boy?','Are you going to any concerts?'],like:['Rema has not missed this year!','I had that song on repeat all morning.','If there is a concert, I am there.'],meh:['I mostly listen to podcasts.',"I don't really keep up with music."]},
  work:{l:'Work',me:['How is work going?','Is your boss still giving you wahala?','Any big plans for your career?'],like:['Work is actually going well. I might go for a promotion.','I love what I do, even on the hard days.','Big plans. Watch this space.'],meh:["Please, let's not talk about work.",'Work is work. Next topic.']},
  family:{l:'Family',me:['How is your family doing?','When did you last speak to your mum?','Any family news?'],like:['Everybody is well, thank God. My sister just had a baby!','My mum calls me every morning at 6am. Every morning.','Family is everything.'],meh:["It's complicated with my family.",'They are fine, I think.']},
  gist:{l:'Gist',me:['Have you heard the latest gist?',"Did you see what happened in the group chat?",'Who is dating who now?'],like:['Ehen! Sit down, let me tell you everything.','I saw it! I screamed.','You will not believe who I saw together...'],meh:["I try to stay out of people's business.","I don't really do gossip."]},
  fashion:{l:'Fashion',me:['Your outfit is sharp today!','Where do you get your clothes made?','What colour is the aso ebi for Saturday?'],like:['Thank you! My tailor is a genius.','I can give you my tailor\'s number.','Champagne gold. Again. We move.'],meh:['I just wear whatever is clean.','Fashion is not really my thing.']},
  faith:{l:'Church',me:['Were you at service on Sunday?','How is choir practice going?','Any prayer points this week?'],like:['The sermon on Sunday spoke to me directly.','We are learning a new song. It is beautiful.','God is faithful. Always.'],meh:["I'm not really a church person.",'I go sometimes.']},
  tech:{l:'Tech',me:['Have you tried that new AI app?','Should I learn to code?','What phone are you using now?'],like:['Learn to code! I will send you resources.','The things AI can do now are wild.','I just upgraded. The camera is crazy.'],meh:['Technology confuses me, honestly.','My phone is just for WhatsApp and calls.']},
  movies:{l:'Nollywood',me:['Watched any good Nollywood lately?','Who is the best Nollywood actor right now?','Have you seen the new Netflix series?'],like:['Funke Akindele can never disappoint.','I binged the whole series in one night.','Nollywood is getting better every year.'],meh:["I don't watch much TV.",'Movies are not really my thing.']},
  home:{l:'Back home',me:['What do you miss most about home?','When last did you travel home?','Lagos or Abuja?'],like:['I miss the noise. The UK is too quiet.','December. I am going home in December!','Lagos, any day. Even with the traffic.'],meh:["I try not to think about it too much.",'Home is home.']},
  weather:{l:'Weather',me:['This weather is something else today.','Is it ever going to stop raining?','Did you see the sun this morning?'],like:['Proper British weather. I love it, actually.','Rain is good for the garden.','A bit of sun and everybody comes out!'],meh:['Please, the weather is depressing me.','Every day is the same grey.']}};
const INTERESTS={kwame:{like:['football','food','gist'],dis:['fashion']},chioma:{like:['faith','music','work'],dis:['gist']},tobi:{like:['tech','music','gist'],dis:['weather']},
  amara:{like:['movies','tech','home'],dis:['football']},dele:{like:['football','fashion','gist'],dis:['work']},sade:{like:['fashion','gist','music'],dis:['tech']},
  grace:{like:['food','family','music'],dis:['football']},tom:{like:['football','food','weather'],dis:['fashion']},bisi:{like:['family','food','faith'],dis:['tech']},
  emeka:{like:['football','music','gist'],dis:['work']}};
const QUESTIONS=[
  {q:'Be honest. Nigerian or Ghanaian jollof?',a:[['Nigerian, obviously',2],['Both are nice',1],['Ghanaian',-2]],flip:'kwame'},
  {q:'Would you rather have pounded yam or amala?',a:[['Pounded yam, no question',2],['Amala every time',2],['Rice, please',0]]},
  {q:'Are you coming to the owambe on Saturday?',a:[["I'll be there in my aso ebi",3],['Maybe, if work allows',1],["No, I'm resting",-1]]},
  {q:"What's your go-to order at a Nigerian spot?",a:[['Jollof and chicken',2],['Suya, extra pepper',2],['Pepper soup',2]]},
  {q:'Do you think it will rain today?',a:[["It's the UK. Of course",2],['I hope not',1],["Who cares, let's go out",1]]},
  {q:'Arsenal, Chelsea or United?',a:[['Arsenal till I die',2],['Chelsea',1],["I don't do football",-1]],npc:'emeka'},
  {q:'Should I start a small chops business?',a:[["Yes! I'll be your first customer",3],['Start small and test it',2],['Too much stress',-1]]}];
const GREET={stranger:['Hi! I don\'t think we\'ve met. I\'m {n}.','Hello. You\'re new around here?'],friend:['Ah, {me}! How far?','{me}! Long time. How are you?','My person! Come and sit down.'],close:['{me}!! I was just thinking about you.','Bestie! What is the gist?']};
const BYE=['Abeg let me go, I have things to do. See you!','Okay, I need to run. Talk later!','Nice catching up. Take care!'];

/* side-hustle gigs */
const GIGS=[
  {id:'dj',t:'DJ set',at:['lounge','club','karaoke'],h:4,pay:[90,160],days:[4,5],start:[21,22],need:['charisma',3],e:'🎧',d:'Play Afrobeats and Amapiano for a crowd.'},
  {id:'mc',t:'MC an owambe',at:['hall'],h:5,pay:[120,200],days:[5],start:[13,15],need:['charisma',4],e:'🎤',d:'Hype the couple, call the families, control the dance floor.'},
  {id:'eventsec',t:'Event security',at:['hall','dayparty','club'],h:6,pay:[80,110],days:[4,5,6],start:[14,21],need:['fitness',2],e:'🦺',d:'Door and crowd control. SIA badge holders only.'},
  {id:'barcover',t:'Bar shift cover',at:['bar','lounge','pub'],h:5,pay:[60,80],days:[0,1,2,3,4,5,6],start:[17,19],need:null,e:'🍹',d:'Someone called in sick. Pour drinks, smile, collect tips.'},
  {id:'catering',t:'Cater a naming ceremony',at:['home'],h:4,pay:[90,140],days:[5,6],start:[9,11],need:['cooking',3],ing:2,e:'🥘',d:'Jollof, small chops and moi moi for 40 guests.'},
  {id:'photo',t:'Event photographer',at:['restaurant','hall','fine'],h:3,pay:[70,110],days:[4,5,6],start:[13,19],need:null,e:'📸',d:'Birthday dinner photos. Make everyone look good.'},
  {id:'clean',t:'Office cleaning',at:['office'],h:3,pay:[38,48],days:[0,1,2,3,4],start:[18,19],need:null,e:'🧽',d:'Evening clean after the office empties.'},
  {id:'peak',t:'Warehouse peak shift',at:['warehouse'],h:8,pay:[105,125],days:[0,1,2,3,4,5,6],start:[6,14],need:null,e:'📦',d:'Extra hands for a busy delivery day.'},
  {id:'usher',t:'Usher at a church convention',at:['church'],h:4,pay:[30,45],days:[6],start:[8,10],need:null,e:'🙏🏾',d:'Seat guests, hand out programmes, keep the peace.'},
  {id:'promo',t:'Hand out flyers',at:['market','dayparty','club'],h:2,pay:[25,35],days:[0,1,2,3,4,5,6],start:[12,20],need:null,e:'📣',d:'Promote this weekend\'s party.'},
  {id:'braidsg',t:'Braiding client',at:['salon'],h:4,pay:[55,85],days:[1,2,3,4,5,6],start:[10,14],need:null,e:'💇🏾',d:'Knotless braids for a regular client.'},
  {id:'karaokehost',t:'Host karaoke night',at:['karaoke'],h:4,pay:[80,120],days:[3,4,5],start:[20,21],need:['charisma',2],e:'🎶',d:'Get shy people on the mic. Sing when nobody else will.'}];

/* businesses */
const BIZ={
  chops:{n:'Small chops catering',where:'home',cost:250,rent:0,cap:30,price:[3,5,7],unit:'tray',stock:2.4,base:10,staff:30,d:'Home-based. Cook in your kitchen, sell trays to parties and offices.',icon:'🥟'},
  aso:{n:'Aso ebi and fabric reselling',where:'home',cost:600,rent:0,cap:20,price:[30,45,60],unit:'bundle',stock:26,base:2.2,staff:35,d:'Buy fabric in bulk, sell to party groups. Demand jumps before Saturdays.',icon:'🧵'},
  barber:{n:'Barber and braids shop',where:'premises',cost:2500,rent:180,cap:24,price:[12,18,26],unit:'client',stock:2,base:6,staff:75,d:'Rent a small unit. Hire barbers and braiders. Steady daily trade.',icon:'💈'},
  suya:{n:'Suya food truck',where:'premises',cost:5000,rent:120,cap:70,price:[6,9,12],unit:'portion',stock:3.2,base:15,staff:75,d:'Grill suya at a busy spot. Weather and weekends matter a lot.',icon:'🔥'},
  lounge:{n:'Your own Afro lounge',where:'premises',cost:25000,rent:900,cap:220,price:[10,14,19],unit:'guest',stock:5,base:33,staff:95,d:'The big one. DJs, Chapman, small chops. Huge weekends, quiet weekdays.',icon:'🍸'}};
