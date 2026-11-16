const CACHE="ibapp-20261116130819";
const CORE=["./","index.html","manifest.webmanifest","icons/icon-180.png","icons/icon-192.png","icons/icon-512.png","data/vault.json"];
self.addEventListener("install",e=>{e.waitUntil(caches.open(CACHE).then(c=>c.addAll(CORE)).then(()=>self.skipWaiting()))});
self.addEventListener("activate",e=>{e.waitUntil(caches.keys().then(ks=>Promise.all(ks.filter(k=>k!==CACHE).map(k=>caches.delete(k)))).then(()=>self.clients.claim()))});
self.addEventListener("fetch",e=>{
  const r=e.request; if(r.method!=="GET") return;
  const u=new URL(r.url); if(u.origin!==location.origin) return;
  const fresh=r.mode==="navigate"||u.pathname.endsWith("/data/vault.json")||u.pathname.endsWith("/index.html")||u.pathname.endsWith("/");
  if(fresh){
    e.respondWith(Promise.race([
      fetch(r,{cache:"no-store"}).then(res=>{if(res.ok){const cp=res.clone();caches.open(CACHE).then(c=>c.put(u.pathname.endsWith("/data/vault.json")?"data/vault.json":(r.mode==="navigate"?"./":r),cp))}return res}),
      new Promise((_,rej)=>setTimeout(()=>rej(),4500))
    ]).catch(()=>caches.match(u.pathname.endsWith("/data/vault.json")?"data/vault.json":(r.mode==="navigate"?"./":r)).then(m=>m||caches.match(r,{ignoreSearch:true}))));
    return;
  }
  e.respondWith(caches.match(r,{ignoreSearch:true}).then(m=>m||fetch(r).then(res=>{if(res.ok){const cp=res.clone();caches.open(CACHE).then(c=>c.put(r,cp))}return res})));
});
