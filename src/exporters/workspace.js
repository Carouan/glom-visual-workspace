const enc=new TextEncoder();

function safeArchiveName(s){
  return(s||"workspace").normalize("NFKD").replace(/[\u0300-\u036f]/g,"").replace(/[^a-zA-Z0-9._-]+/g,"-").replace(/^-+|-+$/g,"").toLowerCase()||"workspace"
}
function jsonText(obj){return JSON.stringify(obj,null,2)+"\n"}
function u16(view,off,v){view.setUint16(off,v,true)}
function u32(view,off,v){view.setUint32(off,v>>>0,true)}
let crcTable=null;
function makeCrcTable(){
  const table=new Uint32Array(256);
  for(let n=0;n<256;n++){let c=n;for(let k=0;k<8;k++)c=(c&1)?0xedb88320^(c>>>1):c>>>1;table[n]=c>>>0}
  return table
}
function crc32(bytes){
  if(!crcTable)crcTable=makeCrcTable();let c=0xffffffff;
  for(const b of bytes)c=crcTable[(c^b)&0xff]^(c>>>8);
  return(c^0xffffffff)>>>0
}
function dosDateTime(date=new Date()){
  const year=Math.max(1980,date.getFullYear());
  return{
    time:((date.getHours()&31)<<11)|((date.getMinutes()&63)<<5)|((Math.floor(date.getSeconds()/2))&31),
    date:(((year-1980)&127)<<9)|(((date.getMonth()+1)&15)<<5)|(date.getDate()&31)
  }
}
function concat(parts,total){
  const out=new Uint8Array(total);let off=0;for(const p of parts){out.set(p,off);off+=p.length}return out
}
function buildStoredZip(entries){
  const localParts=[],centralParts=[];let offset=0,centralSize=0;const stamp=dosDateTime();
  for(const entry of entries){
    const name=enc.encode(entry.name),data=entry.data||new Uint8Array(0),crc=crc32(data);
    const local=new Uint8Array(30+name.length),lv=new DataView(local.buffer);
    u32(lv,0,0x04034b50);u16(lv,4,20);u16(lv,6,0x0800);u16(lv,8,0);u16(lv,10,stamp.time);u16(lv,12,stamp.date);
    u32(lv,14,crc);u32(lv,18,data.length);u32(lv,22,data.length);u16(lv,26,name.length);u16(lv,28,0);local.set(name,30);
    localParts.push(local,data);

    const central=new Uint8Array(46+name.length),cv=new DataView(central.buffer);
    u32(cv,0,0x02014b50);u16(cv,4,20);u16(cv,6,20);u16(cv,8,0x0800);u16(cv,10,0);u16(cv,12,stamp.time);u16(cv,14,stamp.date);
    u32(cv,16,crc);u32(cv,20,data.length);u32(cv,24,data.length);u16(cv,28,name.length);u16(cv,30,0);u16(cv,32,0);u16(cv,34,0);u16(cv,36,0);
    u32(cv,38,entry.directory?0x10:0);u32(cv,42,offset);central.set(name,46);centralParts.push(central);centralSize+=central.length;
    offset+=local.length+data.length
  }
  const end=new Uint8Array(22),ev=new DataView(end.buffer),count=entries.length;
  u32(ev,0,0x06054b50);u16(ev,4,0);u16(ev,6,0);u16(ev,8,count);u16(ev,10,count);u32(ev,12,centralSize);u32(ev,16,offset);u16(ev,20,0);
  const total=offset+centralSize+end.length;return concat([...localParts,...centralParts,end],total)
}
function downloadBlob(name,blob){
  const u=URL.createObjectURL(blob),a=document.createElement("a");a.href=u;a.download=name;document.body.appendChild(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(u),1500)
}
export function workspacePayloads(workspace,resources,views,appVersion){
  const now=new Date().toISOString(),source=(Array.isArray(views)?views:[views]).filter(Boolean),vs=source.map(v=>({...v,updatedAt:now}));
  const activeId=String(workspace.defaultView||"").split("/").pop()?.replace(/\.json$/i,""),active=vs.find(v=>v.id===activeId)||vs[0];
  const w={...workspace,updatedAt:now,appVersion:appVersion||workspace.appVersion,defaultView:active?"views/"+active.id+".json":workspace.defaultView};
  const rp={format:"glom-resources",version:1,workspaceId:w.id,updatedAt:now,resources};
  return{workspace:w,resources:rp,views:vs,view:active}
}
export async function exportWorkspaceTemplateZip(workspace,resources,views,appVersion){
  const payload=workspacePayloads(workspace,resources,views,appVersion),entries=[];
  const seenDirs=new Set(),addDir=path=>{const p=path.replace(/\/+$/,"")+"/";if(!seenDirs.has(p)){seenDirs.add(p);entries.push({name:p,data:new Uint8Array(0),directory:true})}};
  const folders=resources.filter(r=>r.type==="folder"&&!r.missing&&!r.excluded&&r.path).sort((a,b)=>a.path.split("/").length-b.path.split("/").length||a.path.localeCompare(b.path));
  for(const r of folders){
    const parts=r.path.split("/").filter(Boolean);for(let i=1;i<=parts.length;i++)addDir(parts.slice(0,i).join("/"))
  }
  addDir(".glom");addDir(".glom/views");
  entries.push({name:".glom/workspace.json",data:enc.encode(jsonText(payload.workspace))});
  entries.push({name:".glom/resources.json",data:enc.encode(jsonText(payload.resources))});
  for(const view of payload.views)entries.push({name:".glom/views/"+view.id+".json",data:enc.encode(jsonText(view))});
  const planned=resources.filter(r=>r.type==="file"&&!r.excluded&&r.path).map(r=>r.path);
  const readme=[
    "MindSpark — Atelier visuel — template d’espace de travail",
    "",
    "Cette archive contient l'arborescence de dossiers et les métadonnées ouvertes de l’espace de travail (.glom/).",
    "Elle ne copie pas les fichiers de contenu dans cette version de l'export template.",
    planned.length?"Les ressources fichier ci-dessous sont donc conservées comme références planifiées et apparaîtront absentes jusqu'à ce qu'un vrai fichier correspondant soit ajouté :":"Aucune ressource fichier planifiée.",
    ...planned.map(p=>" - "+p),
    "",
    "Supprimer .glom/ n'endommage jamais l'arborescence de dossiers.",
    "Export : "+new Date().toISOString()
  ].join("\n");
  entries.push({name:"README-MINDSPARK.txt",data:enc.encode(readme)});
  const bytes=buildStoredZip(entries);
  downloadBlob(safeArchiveName(workspace.name)+"-workspace.zip",new Blob([bytes],{type:"application/zip"}));
  return{folders:folders.length,plannedFiles:planned.length,views:payload.views.length,bytes:bytes.length}
}
