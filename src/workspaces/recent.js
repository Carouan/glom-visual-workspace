const DB_NAME="glom-visual-workspace";
const DB_VERSION=1;
const STORE="recent-workspaces";

function openDb(){
  return new Promise((resolve,reject)=>{
    if(!("indexedDB" in window)){reject(new Error("IndexedDB indisponible"));return}
    const req=indexedDB.open(DB_NAME,DB_VERSION);
    req.onupgradeneeded=()=>{const db=req.result;if(!db.objectStoreNames.contains(STORE))db.createObjectStore(STORE,{keyPath:"id"})};
    req.onsuccess=()=>resolve(req.result);
    req.onerror=()=>reject(req.error||new Error("Impossible d'ouvrir IndexedDB"));
  })
}
function request(req){return new Promise((resolve,reject)=>{req.onsuccess=()=>resolve(req.result);req.onerror=()=>reject(req.error)})}
function txDone(tx){return new Promise((resolve,reject)=>{tx.oncomplete=()=>resolve();tx.onerror=()=>reject(tx.error);tx.onabort=()=>reject(tx.error||new Error("Transaction annulée"))})}

export async function rememberWorkspace(handle,workspace){
  if(!handle||!workspace?.id)return;
  const db=await openDb();
  try{
    const tx=db.transaction(STORE,"readwrite");
    tx.objectStore(STORE).put({id:workspace.id,name:workspace.name||handle.name,handle,lastOpenedAt:Date.now()});
    await txDone(tx)
  }finally{db.close()}
}
export async function listRecentWorkspaces(){
  const db=await openDb();
  try{
    const tx=db.transaction(STORE,"readonly"),rows=await request(tx.objectStore(STORE).getAll());
    await txDone(tx);
    return(rows||[]).sort((a,b)=>(b.lastOpenedAt||0)-(a.lastOpenedAt||0))
  }finally{db.close()}
}
export async function forgetWorkspace(id){
  const db=await openDb();
  try{const tx=db.transaction(STORE,"readwrite");tx.objectStore(STORE).delete(id);await txDone(tx)}
  finally{db.close()}
}
