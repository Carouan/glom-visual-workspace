const CACHE="glom-v0.3.14";
const CORE=["./","./index.html","./styles.css","./manifest.webmanifest","./icons/icon.svg","./src/app.js","./src/viewers/index.js","./src/exporters/mindmap.js","./src/exporters/workspace.js","./src/workspaces/recent.js"];

async function precache(){
  const cache=await caches.open(CACHE);
  for(const path of CORE){
    const url=new URL(path,self.location.href).href;
    const response=await fetch(url,{cache:"reload"});
    if(!response.ok)throw new Error("Precache failed: "+path+" ("+response.status+")");
    await cache.put(url,response.clone());
  }
}
self.addEventListener("install",event=>{
  event.waitUntil(precache().then(()=>self.skipWaiting()))
});
self.addEventListener("activate",event=>{
  event.waitUntil((async()=>{
    const keys=await caches.keys();
    const hadOld=keys.some(k=>k.startsWith("glom-v")&&k!==CACHE);
    await Promise.all(keys.filter(k=>k.startsWith("glom-v")&&k!==CACHE).map(k=>caches.delete(k)));
    await self.clients.claim();
    if(hadOld){
      const clients=await self.clients.matchAll({type:"window"});
      await Promise.all(clients.map(client=>client.navigate(client.url).catch(()=>null)))
    }
  })())
});
self.addEventListener("message",event=>{
  if(event.data&&event.data.type==="SKIP_WAITING")self.skipWaiting()
});
async function networkFirst(request){
  const cache=await caches.open(CACHE);
  try{
    const response=await fetch(request,{cache:"no-store"});
    if(response&&response.ok)await cache.put(request,response.clone());
    return response
  }catch(error){
    const cached=await cache.match(request);
    if(cached)return cached;
    if(request.mode==="navigate"){
      return(await cache.match(new URL("./index.html",self.location.href).href))||
        (await cache.match(new URL("./",self.location.href).href))
    }
    throw error
  }
}
self.addEventListener("fetch",event=>{
  if(event.request.method!=="GET")return;
  const url=new URL(event.request.url);
  if(url.origin!==self.location.origin)return;
  event.respondWith(networkFirst(event.request))
});
