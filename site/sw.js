// Japa Life offline cache. Bump VERSION when you change the game.
const VERSION='japa-life-v9';
const CORE=['./','index.html','manifest.webmanifest','icons/icon-192.png','icons/icon-512.png','icons/maskable-512.png','icons/apple-touch-icon.png'];
self.addEventListener('install',e=>{e.waitUntil(caches.open(VERSION).then(c=>c.addAll(CORE)).then(()=>self.skipWaiting()))});
self.addEventListener('activate',e=>{e.waitUntil(caches.keys().then(ks=>Promise.all(ks.filter(k=>k!==VERSION).map(k=>caches.delete(k)))).then(()=>self.clients.claim()))});
self.addEventListener('fetch',e=>{
  if(e.request.method!=='GET')return;
  const u=e.request.url;if(u.includes('ntfy.sh')||u.includes('basemaps.cartocdn.com'))return;
  e.respondWith(caches.match(e.request).then(hit=>hit||fetch(e.request).then(res=>{
    if(res.ok&&(e.request.url.startsWith(self.location.origin)||e.request.url.includes('fonts.g')||e.request.url.includes('cdnjs.cloudflare.com'))){const copy=res.clone();caches.open(VERSION).then(c=>c.put(e.request,copy))}
    return res;}).catch(()=>caches.match('index.html'))));
});
