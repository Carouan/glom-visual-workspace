const CACHE="glom-v0.2.1";
const CORE=["./","./index.html","./styles.css","./manifest.webmanifest","./icons/icon.svg","./src/app.js","./src/viewers/index.js"];
self.addEventListener("install",e=>{e.waitUntil(caches.open(CACHE).then(c=>c.addAll(CORE)));self.skipWaiting();});
self.addEventListener("activate",e=>e.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(k=>k!==CACHE).map(k=>caches.delete(k)))).then(()=>self.clients.claim())));
self.addEventListener("fetch",e=>{if(e.request.method!=="GET")return;e.respondWith(caches.match(e.request).then(cached=>cached||fetch(e.request).then(r=>{if(r&&r.ok&&r.type!=="opaque"){const copy=r.clone();caches.open(CACHE).then(c=>c.put(e.request,copy));}return r;})));});
