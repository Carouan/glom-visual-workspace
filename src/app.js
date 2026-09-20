let viewerApi=null,viewerLoadFailed=false,exporterApi=null,workspaceExporterApi=null,recentApi=null;
async function getWorkspaceExporterApi(){if(workspaceExporterApi)return workspaceExporterApi;try{workspaceExporterApi=await import("./exporters/workspace.js");return workspaceExporterApi}catch(e){console.error("Workspace exporter failed to load",e);setStatus("Export workspace indisponible","bad");return null}}
async function getRecentApi(){if(recentApi)return recentApi;try{recentApi=await import("./workspaces/recent.js");return recentApi}catch(e){console.error("Recent workspaces module failed to load",e);return null}}
async function getExporterApi(){if(exporterApi)return exporterApi;try{exporterApi=await import("./exporters/mindmap.js");return exporterApi}catch(e){console.error("Exporter module failed to load",e);setStatus("Export image/PDF indisponible","bad");return null}}
async function getViewerApi(){if(viewerApi)return viewerApi;if(viewerLoadFailed)return null;try{viewerApi=await import("./viewers/index.js");return viewerApi}catch(e){viewerLoadFailed=true;console.error("Viewer module failed to load",e);setStatus("Viewer avancé indisponible — fonctions principales actives","bad");return null}}
function clearPreviewSafe(){try{viewerApi&&viewerApi.clearPreview&&viewerApi.clearPreview()}catch(e){console.warn(e)}}
const el=id=>document.getElementById(id);
const ui={
  workspaceName:el("workspaceName"),count:el("count"),tree:el("tree"),search:el("search"),status:el("status"),
  openBtn:el("openBtn"),newWorkspaceBtn:el("newWorkspaceBtn"),recentBtn:el("recentBtn"),demoBtn:el("demoBtn"),scanBtn:el("scanBtn"),saveBtn:el("saveBtn"),exportBtn:el("exportBtn"),folderBtn:el("folderBtn"),ideaBtn:el("ideaBtn"),urlBtn:el("urlBtn"),fitBtn:el("fitBtn"),autoLayoutBtn:el("autoLayoutBtn"),mapPalette:el("mapPalette"),mapSelectBtn:el("mapSelectBtn"),mapFolderBtn:el("mapFolderBtn"),mapIdeaBtn:el("mapIdeaBtn"),mapRelationBtn:el("mapRelationBtn"),mapFrameBtn:el("mapFrameBtn"),mapShapeBtn:el("mapShapeBtn"),mapTextBtn:el("mapTextBtn"),mapImageBtn:el("mapImageBtn"),
  welcome:el("welcome"),welcomeOpen:el("welcomeOpen"),welcomeDemo:el("welcomeDemo"),viewport:el("viewport"),world:el("world"),frames:el("frames"),nodes:el("nodes"),edges:el("edges"),compat:el("compat"),
  zoomOut:el("zoomOut"),zoomIn:el("zoomIn"),zoomValue:el("zoomValue"),hint:el("hint"),
  noSelection:el("noSelection"),form:el("form"),selectionKind:el("selectionKind"),title:el("title"),kind:el("kind"),path:el("path"),size:el("size"),modified:el("modified"),tags:el("tags"),notes:el("notes"),nodeIcon:el("nodeIcon"),fontSize:el("fontSize"),fontSizeValue:el("fontSizeValue"),fontFamily:el("fontFamily"),fontWeight:el("fontWeight"),textAlign:el("textAlign"),fontItalic:el("fontItalic"),textColor:el("textColor"),backgroundColor:el("backgroundColor"),borderColor:el("borderColor"),borderWidth:el("borderWidth"),borderWidthValue:el("borderWidthValue"),nodeShape:el("nodeShape"),nodeLocked:el("nodeLocked"),imageToggleLabel:el("imageToggleLabel"),showNodeImage:el("showNodeImage"),copyStyleBtn:el("copyStyleBtn"),pasteStyleBtn:el("pasteStyleBtn"),resetStyleBtn:el("resetStyleBtn"),branchFrameSection:el("branchFrameSection"),frameToggleBtn:el("frameToggleBtn"),frameFields:el("frameFields"),frameTitle:el("frameTitle"),frameBorderColor:el("frameBorderColor"),frameBackgroundColor:el("frameBackgroundColor"),frameOpacity:el("frameOpacity"),frameOpacityValue:el("frameOpacityValue"),frameBorderStyle:el("frameBorderStyle"),
  openResource:el("openResource"),linkBtn:el("linkBtn"),collapseBtn:el("collapseBtn"),deleteBtn:el("deleteBtn"),contextActionsSection:el("contextActionsSection"),contextFolderBtn:el("contextFolderBtn"),contextIdeaBtn:el("contextIdeaBtn"),contextRelationBtn:el("contextRelationBtn"),contextFrameBtn:el("contextFrameBtn"),
  preview:el("preview"),previewTitle:el("previewTitle"),previewMeta:el("previewMeta"),previewBody:el("previewBody"),previewClose:el("previewClose"),recentDialog:el("recentDialog"),recentClose:el("recentClose"),recentList:el("recentList"),exportDialog:el("exportDialog"),exportClose:el("exportClose"),exportOrientation:el("exportOrientation"),exportHidden:el("exportHidden"),exportSvgBtn:el("exportSvgBtn"),exportPngBtn:el("exportPngBtn"),exportPrintBtn:el("exportPrintBtn"),zipWorkspaceBtn:el("zipWorkspaceBtn"),materializeBtn:el("materializeBtn"),
  folderFallback:el("folderFallback"),resourcesPanel:el("resourcesPanel"),inspectorPanel:el("inspectorPanel"),showResourcesBtn:el("showResourcesBtn"),showInspectorBtn:el("showInspectorBtn")
};
const state={
  mode:"none",handle:null,fallbackFiles:new Map(),workspace:null,resources:[],view:null,selected:null,linkSource:null,dirty:false,canWrite:false,search:"",saveTimer:null,treeExpanded:new Set(),draggedResource:null,styleClipboard:null,imageUrls:new Map()
};
const FORMAT=1,APP="0.3.4",WS=".glom/workspace.json",RES=".glom/resources.json",VIEW=".glom/views/main-mindmap.json",IGNORED=new Set([".glom",".git","node_modules"]);
function uuid(){return crypto.randomUUID?crypto.randomUUID():"id-"+Date.now()+"-"+Math.random().toString(16).slice(2)}
function hash(s){let h=0x811c9dc5;for(let i=0;i<s.length;i++){h^=s.charCodeAt(i);h=Math.imul(h,0x01000193)}return(h>>>0).toString(36)}
function base(path){const p=(path||"").split("/");return p[p.length-1]||"Workspace"}
function setStatus(t,c){ui.status.textContent=t;ui.status.style.color=c==="bad"?"#b42318":c==="ok"?"#027a48":""}
function setButtonLabel(button,label){
  if(!button)return;
  const span=button.querySelector(".button-label");
  if(span)span.textContent=label;else button.textContent=label
}
function supportsFS(){return typeof window.showDirectoryPicker==="function"}
function setDirty(v=true){state.dirty=v;setStatus(v?"Modifications non enregistrées":"Enregistré",v?"":"ok");clearTimeout(state.saveTimer);if(v&&state.mode==="fs"&&state.canWrite)state.saveTimer=setTimeout(()=>save(true),800)}
function resource(id){return state.resources.find(r=>r.id===id)||null}
function node(id){return state.view&&state.view.nodes.find(n=>n.id===id)||null}
function nodeForResource(id){return state.view&&state.view.nodes.find(n=>n.resourceId===id)||null}
function selectedNode(){return node(state.selected)}
function selectedResource(){const n=selectedNode();return n?resource(n.resourceId):null}
function typeLabel(r){return({root:"Workspace",folder:"Dossier",file:"Fichier",virtual:"Idée",url:"Lien web"})[r&&r.type]||"Ressource"}
function icon(r){
  if(!r)return"❓";if(r.type==="root")return"🗺️";if(r.type==="folder")return"📁";if(r.type==="virtual")return"💡";if(r.type==="url")return"🔗";
  const e=(r.path||"").split(".").pop().toLowerCase();
  if(["png","jpg","jpeg","gif","webp","svg"].includes(e))return"🖼️";if(["mp3","wav","ogg","m4a","flac"].includes(e))return"🔊";if(["mp4","webm","mov"].includes(e))return"🎬";
  if(e==="pdf")return"📕";if(["md","txt","rtf"].includes(e))return"📝";if(["js","ts","py","html","css","json","yaml","yml"].includes(e))return"💻";if(["xls","xlsx","ods","csv"].includes(e))return"📊";return"📄"
}
const TYPE_COLORS={root:"#16a34a",folder:"#f59e0b",file:"#64748b",virtual:"#8b5cf6",url:"#0ea5e9"};
const FONT_STACKS={system:'Inter,ui-sans-serif,system-ui,-apple-system,"Segoe UI",sans-serif',rounded:'"Trebuchet MS","Arial Rounded MT Bold",ui-sans-serif,sans-serif',serif:'Georgia,"Times New Roman",serif',mono:'"Cascadia Code","SFMono-Regular",Consolas,monospace'};
function isImageResource(r){if(!r||r.type!=="file")return false;const e=(r.path||"").split(".").pop().toLowerCase();return["png","jpg","jpeg","gif","webp","svg","bmp","avif"].includes(e)}
function defaultNodeStyle(r){return{icon:"",fontSize:14,fontFamily:"system",fontWeight:"650",italic:false,textAlign:"left",textColor:"#172033",backgroundColor:"#ffffff",borderColor:TYPE_COLORS[r?.type]||"#d8deea",borderWidth:1,shape:"rounded",locked:false,showImage:false}}
function effectiveNodeStyle(n,r){return Object.assign(defaultNodeStyle(r),n&&n.style||{})}
function nodeRadius(shape){return shape==="rectangle"?"2px":shape==="pill"?"999px":"12px"}
function hexToRgba(hex,alpha){const h=String(hex||"#ffffff").replace("#","");const v=h.length===3?h.split("").map(x=>x+x).join(""):h;const n=parseInt(v,16);if(!Number.isFinite(n))return"rgba(255,255,255,"+alpha+")";return"rgba("+((n>>16)&255)+","+((n>>8)&255)+","+(n&255)+","+alpha+")"}
function clearNodeImageCache(){state.imageUrls.forEach(u=>URL.revokeObjectURL(u));state.imageUrls.clear()}
async function imageUrlFor(r){
  if(!isImageResource(r)||r.missing)return null;
  const cached=state.imageUrls.get(r.id);if(cached)return cached;
  try{
    const f=state.mode==="fs"?await fileFromPath(state.handle,r.path):state.fallbackFiles.get(r.path);
    if(!f)return null;const u=URL.createObjectURL(f);state.imageUrls.set(r.id,u);return u
  }catch(e){console.warn("Node image unavailable",e);return null}
}
function newWorkspace(name){const now=new Date().toISOString();return{format:"glom-workspace",version:FORMAT,appVersion:APP,id:uuid(),name:name||"Nouveau workspace",createdAt:now,updatedAt:now,defaultView:"views/main-mindmap.json"}}
function parentPath(path){if(!path||!path.includes("/"))return"";return path.slice(0,path.lastIndexOf("/"))}
function parentOf(r,list){
  if(!r||["root","virtual","url"].includes(r.type))return null;
  const p=parentPath(r.path);if(!p)return list.find(x=>x.type==="root")||null;
  return list.find(x=>x.type==="folder"&&x.path===p)||list.find(x=>x.type==="root")||null
}
function applyFolderSizes(list){
  const files=list.filter(r=>r.type==="file"&&!r.missing&&Number.isFinite(r.size));
  list.forEach(r=>{
    if(r.type==="root")r.size=files.reduce((s,f)=>s+f.size,0);
    else if(r.type==="folder"){const p=r.path+"/";r.size=files.reduce((s,f)=>s+(f.path.startsWith(p)?f.size:0),0)}
  });
  return list
}
function reconcile(workspace,entries,old=[]){
  const oldMap=new Map();old.forEach(r=>{if(["root","folder","file"].includes(r.type))oldMap.set(r.type+":"+(r.path||""),r)});
  const rootOld=oldMap.get("root:");const out=[{id:rootOld&&rootOld.id||"root-"+workspace.id,type:"root",path:"",title:rootOld&&rootOld.title||workspace.name,tags:rootOld&&rootOld.tags||[],notes:rootOld&&rootOld.notes||"",missing:false,size:0,lastModified:null}];
  const seen=new Set(["root:"]);
  entries.forEach(e=>{const k=e.type+":"+e.path,o=oldMap.get(k);out.push({id:o&&o.id||"r-"+hash(k),type:e.type,path:e.path,title:o&&o.title||e.name||base(e.path),tags:o&&o.tags||[],notes:o&&o.notes||"",missing:false,size:Number.isFinite(e.size)?e.size:(o&&Number.isFinite(o.size)?o.size:null),lastModified:e.lastModified??o?.lastModified??null});seen.add(k)});
  old.forEach(o=>{if(["virtual","url"].includes(o.type))out.push(Object.assign({},o,{missing:false}));else{const k=o.type+":"+(o.path||"");if(o.type!=="root"&&!seen.has(k))out.push(Object.assign({},o,{missing:true}))}});
  return applyFolderSizes(out)
}
function layout(resources){
  const root=resources.find(r=>r.type==="root"),pos=new Map();if(!root)return pos;
  const active=resources.filter(r=>!r.missing&&!["virtual","url"].includes(r.type)),children=new Map();active.forEach(r=>children.set(r.id,[]));
  active.forEach(r=>{if(r.id===root.id)return;const p=parentOf(r,active);if(p&&children.has(p.id))children.get(p.id).push(r)});
  children.forEach(a=>a.sort((x,y)=>x.type!==y.type?(x.type==="folder"?-1:1):x.title.localeCompare(y.title,undefined,{numeric:true})));
  let leaf=0;function place(r,d){const c=children.get(r.id)||[];let y;if(!c.length)y=130+leaf++*112;else{const ys=c.map(x=>place(x,d+1));y=ys.reduce((a,b)=>a+b,0)/ys.length}pos.set(r.id,{x:120+d*330,y:y});return y}place(root,0);return pos
}
function freshView(resources){
  const p=layout(resources),nodes=resources.map((r,i)=>({id:"n-"+r.id,resourceId:r.id,x:p.get(r.id)?p.get(r.id).x:200+(i%5)*280,y:p.get(r.id)?p.get(r.id).y:160+Math.floor(i/5)*115,collapsed:false,style:{}})),edges=[];
  resources.forEach(r=>{const par=parentOf(r,resources);if(par&&!r.missing)edges.push({id:"h-"+par.id+"-"+r.id,from:"n-"+par.id,to:"n-"+r.id,kind:"hierarchy"})});
  const now=new Date().toISOString();return{format:"glom-view",version:FORMAT,id:"main-mindmap",type:"mindmap",name:"Carte principale",createdAt:now,updatedAt:now,pan:{x:40,y:40},zoom:.92,nodes:nodes,edges:edges,frames:[]}
}
function mergeView(view,resources){
  if(!view||view.type!=="mindmap")return freshView(resources);
  const auto=freshView(resources),old=new Map((view.nodes||[]).map(n=>[n.resourceId,n])),fallback=new Map(auto.nodes.map(n=>[n.resourceId,n])),nodes=resources.map(r=>{
    const n=Object.assign({},old.get(r.id)||fallback.get(r.id));n.style=Object.assign({},n.style||{});return n
  });
  const ids=new Set(nodes.map(n=>n.id)),manual=(view.edges||[]).filter(e=>e.kind==="manual"&&ids.has(e.from)&&ids.has(e.to)),frames=(view.frames||[]).filter(f=>ids.has(f.rootNodeId));
  return Object.assign({},view,{version:FORMAT,nodes,edges:auto.edges.concat(manual),frames,updatedAt:new Date().toISOString()})
}
async function dirByParts(root,parts,create){let d=root;for(const part of parts){if(part)d=await d.getDirectoryHandle(part,{create:!!create})}return d}
async function readJson(root,path){try{const parts=path.split("/").filter(Boolean),name=parts.pop(),d=await dirByParts(root,parts,false),h=await d.getFileHandle(name),f=await h.getFile();return JSON.parse(await f.text())}catch(e){if(e&&e.name!=="NotFoundError")console.warn(e);return null}}
async function writeJson(root,path,obj){const parts=path.split("/").filter(Boolean),name=parts.pop(),d=await dirByParts(root,parts,true),h=await d.getFileHandle(name,{create:true}),w=await h.createWritable();await w.write(JSON.stringify(obj,null,2)+"\n");await w.close()}
async function scan(root){
  const entries=[];let truncated=false;
  async function walk(d,b,depth){
    if(depth>10||entries.length>=1200){truncated=true;return}
    const arr=[];for await(const pair of d.entries()){if(!IGNORED.has(pair[0]))arr.push(pair)}
    arr.sort((a,b)=>a[1].kind!==b[1].kind?(a[1].kind==="directory"?-1:1):a[0].localeCompare(b[0],undefined,{numeric:true}));
    for(const pair of arr){
      if(entries.length>=1200){truncated=true;return}
      const path=b?b+"/"+pair[0]:pair[0];
      if(pair[1].kind==="directory"){entries.push({type:"folder",path,name:pair[0],size:null,lastModified:null});await walk(pair[1],path,depth+1)}
      else{const file=await pair[1].getFile();entries.push({type:"file",path,name:pair[0],size:file.size,lastModified:file.lastModified})}
    }
  }
  await walk(root,"",0);return{entries,truncated}
}
async function permission(handle,user){
  try{
    if(handle.queryPermission){
      const q=await handle.queryPermission({mode:"readwrite"});
      if(q==="granted")return true
    }
    if(user&&handle.requestPermission)return(await handle.requestPermission({mode:"readwrite"}))==="granted"
  }catch(e){console.warn("Permission check failed",e)}
  return false
}
async function ensureWritePermission(){
  if(state.mode!=="fs"||!state.handle)return false;
  if(state.canWrite)return true;
  try{
    state.canWrite=await permission(state.handle,true);
    show();
    if(!state.canWrite)setStatus("Écriture non autorisée — déplacement annulé","bad");
    return state.canWrite
  }catch(e){console.warn(e);return false}
}
function fallbackScan(files){
  const map=new Map(),fileMap=new Map();let rootName="Workspace importé";
  Array.from(files||[]).forEach(f=>{let parts=(f.webkitRelativePath||f.name).split("/").filter(Boolean);if(parts.length>1){rootName=parts[0]||rootName;parts.shift()}if([".glom",".git","node_modules"].includes(parts[0]))return;const rel=parts.join("/");if(!rel)return;for(let i=1;i<parts.length;i++){const p=parts.slice(0,i).join("/");if(!map.has("folder:"+p))map.set("folder:"+p,{type:"folder",path:p,name:parts[i-1]})}map.set("file:"+rel,{type:"file",path:rel,name:parts[parts.length-1],size:f.size,lastModified:f.lastModified});fileMap.set(rel,f)});
  return{entries:Array.from(map.values()),files:fileMap,rootName:rootName}
}
function normalizeFallback(raw){const p=raw.split("/").filter(Boolean);if(p.length>1)p.shift();return p.join("/")}
async function fallbackMetadata(files){
  const wanted=new Map([[WS,"workspace"],[RES,"resources"],[VIEW,"view"]]),o={};for(const f of Array.from(files||[])){const key=wanted.get(normalizeFallback(f.webkitRelativePath||f.name));if(key){try{o[key]=JSON.parse(await f.text())}catch(e){}}}return o
}
async function fileFromPath(root,path){const parts=path.split("/").filter(Boolean),name=parts.pop(),d=await dirByParts(root,parts,false),h=await d.getFileHandle(name);return h.getFile()}
function download(name,obj){const b=new Blob([JSON.stringify(obj,null,2)+"\n"],{type:"application/json"}),u=URL.createObjectURL(b),a=document.createElement("a");a.href=u;a.download=name;document.body.appendChild(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(u),1000)}
function formatSize(n){
  if(!Number.isFinite(n))return"—";
  const nf=(v,d)=>new Intl.NumberFormat("fr-BE",{minimumFractionDigits:0,maximumFractionDigits:d}).format(v);
  if(n<1024)return nf(n,0)+" o";
  if(n<1048576)return nf(n/1024,n<10240?2:1)+" Ko";
  if(n<1073741824)return nf(n/1048576,n<10485760?2:1)+" Mo";
  return nf(n/1073741824,n<10737418240?2:1)+" Go"
}
function formatDate(n){return Number.isFinite(n)?new Intl.DateTimeFormat("fr-BE",{dateStyle:"medium",timeStyle:"short"}).format(new Date(n)):"—"}
function initTreeExpansion(){
  state.treeExpanded=new Set();
  const root=state.resources.find(r=>r.type==="root");if(root)state.treeExpanded.add(root.id);
  state.resources.filter(r=>r.type==="folder"&&!r.missing&&!r.path.includes("/")).forEach(r=>state.treeExpanded.add(r.id))
}
function safeName(s){return(s||"workspace").normalize("NFKD").replace(/[\u0300-\u036f]/g,"").replace(/[^a-zA-Z0-9._-]+/g,"-").replace(/^-+|-+$/g,"").toLowerCase()||"workspace"}
function safeFolderName(s){
  const cleaned=String(s||"").replace(/[<>:"/\\|?*\u0000-\u001F]/g,"-").replace(/[. ]+$/g,"").trim();
  return cleaned||"Nouveau dossier"
}
function workspaceRoot(){return state.resources.find(r=>r.type==="root")||null}
function workspaceMetadataSnapshot(){
  const now=new Date().toISOString(),workspace={...state.workspace,updatedAt:now,appVersion:APP},view={...state.view,updatedAt:now};
  const resources={format:"glom-resources",version:1,workspaceId:workspace.id,updatedAt:now,resources:state.resources};
  return{workspace,resources,view}
}
function newDraftWorkspace(){
  const raw=prompt("Nom du nouveau workspace :","Nouveau workspace");if(raw===null)return;
  const name=(raw||"").trim()||"Nouveau workspace";clearNodeImageCache();
  const w=newWorkspace(name),root={id:"root-"+w.id,type:"root",path:"",title:name,tags:[],notes:"",missing:false,size:0,lastModified:null},r=[root],v=freshView(r);
  Object.assign(state,{mode:"draft",handle:null,fallbackFiles:new Map(),workspace:w,resources:r,view:v,selected:v.nodes[0]?.id||null,linkSource:null,canWrite:false,dirty:true});
  initTreeExpansion();show();fit();setStatus("Workspace brouillon — créez des dossiers puis exportez ou matérialisez-le","ok")
}
async function addFolder(){
  if(!state.workspace||!state.view)return;
  if(state.mode==="fallback"){alert("La création de dossiers n’est pas disponible en mode compatibilité lecture seule.");return}
  const selected=selectedResource(),parent=(selected&&["root","folder"].includes(selected.type)?selected:(selected?parentOf(selected,state.resources):null))||workspaceRoot();
  if(!parent)return;
  const raw=prompt("Nom du dossier :","Nouveau dossier");if(raw===null)return;const name=safeFolderName(raw);
  const path=parent.path?parent.path+"/"+name:name;
  if(state.resources.some(r=>["folder","file"].includes(r.type)&&!r.missing&&r.path===path)){alert("Un élément existe déjà à cet emplacement.");return}
  if(state.mode==="fs"){
    if(!(await ensureWritePermission()))return;
    try{await dirByParts(state.handle,path.split("/").filter(Boolean),true)}catch(e){console.error(e);alert("Impossible de créer le dossier : "+(e.message||e));return}
  }
  const r={id:"r-"+uuid(),type:"folder",path,title:name,tags:[],notes:"",missing:false,size:0,lastModified:null},parentNode=nodeForResource(parent.id);
  const siblings=state.resources.filter(x=>x.type==="folder"&&parentOf(x,state.resources)?.id===parent.id).length;
  const n={id:"n-"+r.id,resourceId:r.id,x:Math.max(0,(parentNode?.x||120)+330),y:Math.max(0,(parentNode?.y||130)+siblings*112),collapsed:false,style:{}};
  state.resources.push(r);state.view.nodes.push(n);
  if(parentNode)state.view.edges.push({id:"h-"+parent.id+"-"+r.id,from:parentNode.id,to:n.id,kind:"hierarchy"});
  state.treeExpanded.add(parent.id);state.treeExpanded.add(r.id);state.selected=n.id;setDirty(true);render();setStatus("Dossier créé","ok")
}
async function openWorkspace(){
  try{if(!supportsFS()){ui.folderFallback.click();return}const h=await window.showDirectoryPicker({mode:"readwrite"});await loadHandle(h,true)}catch(e){if(e&&e.name==="AbortError")return;alert("Impossible d'ouvrir ce dossier : "+(e.message||e))}
}
async function loadHandle(h,user){
  clearNodeImageCache();setStatus("Lecture du workspace…");const s=await scan(h),w0=await readJson(h,WS),r0=await readJson(h,RES),v0=await readJson(h,VIEW),w=w0&&w0.format==="glom-workspace"?w0:newWorkspace(h.name),r=reconcile(w,s.entries,r0&&Array.isArray(r0.resources)?r0.resources:[]),v=mergeView(v0,r),can=await permission(h,user);
  Object.assign(state,{mode:"fs",handle:h,fallbackFiles:new Map(),workspace:w,resources:r,view:v,selected:null,linkSource:null,canWrite:can,dirty:!w0||!r0||!v0});initTreeExpansion();
  try{localStorage.setItem("glom-last-name",h.name)}catch(e){}show();fit();if(s.truncated)alert("Le scan a atteint la limite de sécurité de la V0.1.");if(state.dirty&&can)await save(true);else if(state.dirty)setStatus("Lecture seule — export disponible");else setDirty(false);
  rememberRecentWorkspace(h,w)
}
async function loadFallback(files){
  if(!files||!files.length)return;clearNodeImageCache();setStatus("Import du dossier…");const s=fallbackScan(files),m=await fallbackMetadata(files),w=m.workspace&&m.workspace.format==="glom-workspace"?m.workspace:newWorkspace(s.rootName),r=reconcile(w,s.entries,m.resources&&Array.isArray(m.resources.resources)?m.resources.resources:[]),v=mergeView(m.view,r);
  Object.assign(state,{mode:"fallback",handle:null,fallbackFiles:s.files,workspace:w,resources:r,view:v,selected:null,linkSource:null,canWrite:false,dirty:false});initTreeExpansion();show();fit();setStatus("Mode compatibilité — export manuel")
}
function demo(){
  clearNodeImageCache();const w=newWorkspace("Chef-d'œuvre — Les jeux vidéo");w.id="demo-marjolaine";const raw=[["folder","Histoire"],["folder","Histoire/Premiers jeux"],["file","Histoire/Premiers jeux/Tennis for Two.pdf"],["file","Histoire/Premiers jeux/Spacewar-notes.md"],["folder","Game design"],["file","Game design/Fiche de concept.md"],["folder","Level design"],["file","Level design/Plan niveau 1.png"],["folder","Mon jeu"],["folder","Mon jeu/Sprites"],["file","Mon jeu/Sprites/personnage.png"],["folder","Sources"],["file","Sources/Bibliographie.md"]].map(x=>({type:x[0],path:x[1],name:base(x[1])}));
  const r=reconcile(w,raw,[]),idea={id:"v-"+uuid(),type:"virtual",title:"💡 Pourquoi un jeu est-il amusant ?",tags:["question"],notes:"À relier au game design et aux playtests."},url={id:"u-"+uuid(),type:"url",title:"Brookhaven — Tennis for Two",url:"https://www.bnl.gov/about/history/firstvideo.php",tags:["source"],notes:""};r.push(idea,url);const v=freshView(r);const ni=nodeFrom(v,idea.id),nu=nodeFrom(v,url.id);if(ni){ni.x=1000;ni.y=680}if(nu){nu.x=1300;nu.y=220}const gd=r.find(x=>x.path==="Game design"),tf=r.find(x=>x.path&&x.path.includes("Tennis for Two"));if(gd&&ni)v.edges.push({id:"m-"+uuid(),from:"n-"+gd.id,to:ni.id,kind:"manual"});if(tf&&nu)v.edges.push({id:"m-"+uuid(),from:"n-"+tf.id,to:nu.id,kind:"manual"});
  Object.assign(state,{mode:"demo",handle:null,fallbackFiles:new Map(),workspace:w,resources:r,view:v,selected:null,linkSource:null,canWrite:false,dirty:false});initTreeExpansion();show();fit();setStatus("Démo locale")
}
function nodeFrom(v,rid){return v.nodes.find(n=>n.resourceId===rid)}
async function rescan(){
  if(state.mode==="fallback"){ui.folderFallback.click();return}if(state.mode!=="fs"||!state.handle)return;setStatus("Rescan…");const s=await scan(state.handle);state.resources=reconcile(state.workspace,s.entries,state.resources);state.view=mergeView(state.view,state.resources);setDirty(true);render();if(s.truncated)alert("Scan partiel : limite de sécurité atteinte.")
}
async function save(quiet){
  if(!state.workspace||!state.view)return;clearTimeout(state.saveTimer);const now=new Date().toISOString();state.workspace.updatedAt=now;state.view.updatedAt=now;const rp={format:"glom-resources",version:1,workspaceId:state.workspace.id,updatedAt:now,resources:state.resources};
  if(state.mode==="fs"&&state.handle&&state.canWrite){try{if(!quiet)setStatus("Enregistrement…");await Promise.all([writeJson(state.handle,WS,state.workspace),writeJson(state.handle,RES,rp),writeJson(state.handle,VIEW,state.view)]);setDirty(false);return}catch(e){state.canWrite=false;setStatus("Écriture impossible — export manuel","bad");if(!quiet)alert("Impossible d'écrire dans .glom : "+(e.message||e))}}
  const exp={format:"glom-portable-export",version:1,appVersion:APP,exportedAt:new Date().toISOString(),workspace:state.workspace,resources:rp,views:{"main-mindmap":state.view}};download(safeName(state.workspace.name)+".glom.json",exp);if(!quiet)setStatus("Export JSON téléchargé","ok")
}
function updateActionStates(){
  const ok=!!(state.workspace&&state.view),r=selectedResource(),n=selectedNode(),folderSelected=!!(r&&["root","folder"].includes(r.type)),hasSelection=!!(r&&n),hasChildren=!!(n&&children(n.id).length),hasFrame=!!(n&&frameForNode(n.id));
  if(ui.mapFolderBtn)ui.mapFolderBtn.disabled=!ok||state.mode==="fallback";
  if(ui.mapIdeaBtn)ui.mapIdeaBtn.disabled=!ok;
  if(ui.mapRelationBtn){ui.mapRelationBtn.disabled=!hasSelection;ui.mapRelationBtn.classList.toggle("active",!!state.linkSource)}
  if(ui.mapFrameBtn){ui.mapFrameBtn.disabled=!hasSelection||(!hasChildren&&!hasFrame);ui.mapFrameBtn.classList.toggle("active",hasFrame)}
  if(ui.mapSelectBtn)ui.mapSelectBtn.classList.toggle("active",!state.linkSource);
  if(ui.contextActionsSection)ui.contextActionsSection.classList.toggle("hidden",!hasSelection);
  if(ui.contextFolderBtn)ui.contextFolderBtn.disabled=!folderSelected||state.mode==="fallback";
  if(ui.contextIdeaBtn)ui.contextIdeaBtn.disabled=!hasSelection;
  if(ui.contextRelationBtn){ui.contextRelationBtn.disabled=!hasSelection;setButtonLabel(ui.contextRelationBtn,state.linkSource===n?.id?"Annuler relation":"Relation")}
  if(ui.contextFrameBtn){ui.contextFrameBtn.disabled=!hasSelection||(!hasChildren&&!hasFrame);setButtonLabel(ui.contextFrameBtn,hasFrame?"Retirer le cadre":"Cadre de branche")}
}
function show(){
  const ok=!!(state.workspace&&state.view);ui.welcome.classList.toggle("hidden",ok);ui.viewport.classList.toggle("hidden",!ok);ui.workspaceName.textContent=ok?state.workspace.name:"Aucun workspace ouvert";ui.count.textContent=state.resources.length+" élément"+(state.resources.length>1?"s":"");ui.compat.classList.toggle("hidden",state.mode!=="fallback");setButtonLabel(ui.saveBtn,state.mode==="fs"&&state.canWrite?"Enregistrer":"Exporter les vues");
  [ui.scanBtn,ui.saveBtn,ui.exportBtn,ui.folderBtn,ui.ideaBtn,ui.urlBtn,ui.fitBtn,ui.autoLayoutBtn].forEach(b=>b.disabled=!ok);
  if(["demo","draft"].includes(state.mode))ui.scanBtn.disabled=true;if(state.mode==="fallback")ui.folderBtn.disabled=true;
  ui.materializeBtn.disabled=!ok||!supportsFS();ui.zipWorkspaceBtn.disabled=!ok;render();updateActionStates()
}
function match(r){if(!state.search)return true;const h=[r.title,r.path,r.url,r.notes].concat(r.tags||[]).filter(Boolean).join(" ").toLowerCase();return h.includes(state.search.toLowerCase())}
function render(){renderTree();renderMap();renderInspector();transform()}
function physicalChildrenOf(r){
  return state.resources.filter(x=>!x.missing&&["folder","file"].includes(x.type)&&parentOf(x,state.resources)?.id===r.id)
    .sort((a,b)=>a.type!==b.type?(a.type==="folder"?-1:1):a.title.localeCompare(b.title,undefined,{numeric:true}))
}
function renderTree(){
  ui.tree.replaceChildren();if(!state.workspace)return;
  const root=state.resources.find(r=>r.type==="root");
  if(state.search){
    state.resources.filter(r=>["root","folder","file"].includes(r.type)&&match(r)).sort((a,b)=>(a.path||"").localeCompare(b.path||"",undefined,{numeric:true}))
      .forEach(r=>ui.tree.appendChild(treeRow(r,r.type==="root"?0:(r.path.split("/").length||1))));
  }else if(root){
    const walk=(r,d)=>{ui.tree.appendChild(treeRow(r,d));if((r.type==="root"||r.type==="folder")&&state.treeExpanded.has(r.id))physicalChildrenOf(r).forEach(ch=>walk(ch,d+1))};
    walk(root,0);
  }
  const extra=state.resources.filter(r=>["virtual","url"].includes(r.type)&&match(r));
  if(extra.length){const h=document.createElement("div");h.className="tree-section";h.textContent="Idées et liens";ui.tree.appendChild(h);extra.forEach(r=>ui.tree.appendChild(treeRow(r,0)))}
}
function canMoveResource(r){return["fs","demo","draft"].includes(state.mode)&&r&&!r.missing&&["file","folder"].includes(r.type)}
function treeRow(r,d){
  const row=document.createElement("div");row.className="tree-row"+(r.missing?" missing":"");row.dataset.resourceId=r.id;
  const n=nodeForResource(r.id);if(n&&n.id===state.selected)row.classList.add("selected");row.style.setProperty("--depth",d);
  const ind=document.createElement("span");ind.className="tree-indent";
  let toggle;
  if(r.type==="root"||r.type==="folder"){
    toggle=document.createElement("button");toggle.type="button";toggle.className="tree-toggle";toggle.textContent=state.treeExpanded.has(r.id)?"▾":"▸";toggle.title=state.treeExpanded.has(r.id)?"Replier":"Déplier";
    toggle.onclick=e=>{e.stopPropagation();if(state.treeExpanded.has(r.id))state.treeExpanded.delete(r.id);else state.treeExpanded.add(r.id);renderTree()}
  }else{toggle=document.createElement("span");toggle.className="tree-toggle-placeholder"}
  const ic=document.createElement("span");ic.textContent=icon(r);const lab=document.createElement("span");lab.className="tree-label";lab.textContent=r.title;row.append(ind,toggle,ic,lab);
  row.onclick=()=>{if(n){select(n.id);focus(n.id);closePanels()}};
  row.draggable=canMoveResource(r);
  if(row.draggable){
    row.title=state.mode==="fs"&&!state.canWrite?"Glisser pour déplacer — une autorisation d’écriture pourra être demandée":"Glisser pour déplacer";
    row.addEventListener("dragstart",e=>{state.draggedResource=r.id;e.dataTransfer.effectAllowed="move";e.dataTransfer.setData("text/plain",r.id);row.classList.add("dragging")});
    row.addEventListener("dragend",()=>{state.draggedResource=null;row.classList.remove("dragging");document.querySelectorAll(".tree-row.drop-target").forEach(x=>x.classList.remove("drop-target"))})
  }
  if((r.type==="root"||r.type==="folder")&&["fs","demo","draft"].includes(state.mode)){
    row.addEventListener("dragover",e=>{if(!state.draggedResource||state.draggedResource===r.id)return;e.preventDefault();e.dataTransfer.dropEffect="move";row.classList.add("drop-target")});
    row.addEventListener("dragleave",()=>row.classList.remove("drop-target"));
    row.addEventListener("drop",async e=>{e.preventDefault();row.classList.remove("drop-target");const source=resource(state.draggedResource||e.dataTransfer.getData("text/plain"));state.draggedResource=null;if(source)await reparentFromMindmap(source,r)})
  }
  return row
}
async function entryExists(dir,name){for await(const [n] of dir.entries())if(n===name)return true;return false}
async function copyFileHandle(srcHandle,targetDir,name){
  const f=await srcHandle.getFile(),dest=await targetDir.getFileHandle(name,{create:true}),w=await dest.createWritable();await w.write(f);await w.close()
}
async function copyDirectoryHandle(srcHandle,targetDir,name){
  const dest=await targetDir.getDirectoryHandle(name,{create:true});
  for await(const [childName,child] of srcHandle.entries()){
    if(child.kind==="directory")await copyDirectoryHandle(child,dest,childName);else await copyFileHandle(child,dest,childName)
  }
}
function reparentPlan(source,target){
  if(!source||!target||!["file","folder"].includes(source.type)||!["root","folder"].includes(target.type)||source.id===target.id)return null;
  if(source.type==="folder"&&(target.path===source.path||(target.path||"").startsWith(source.path+"/"))){alert("Impossible de déplacer un dossier dans lui-même.");return null}
  const oldPath=source.path,targetPath=target.path||"",name=base(oldPath),newPath=targetPath?targetPath+"/"+name:name;
  if(parentPath(oldPath)===targetPath)return null;
  if(state.resources.some(r=>r.id!==source.id&&["file","folder"].includes(r.type)&&!r.missing&&r.path===newPath)){alert("Un élément nommé « "+name+" » existe déjà dans ce dossier.");return null}
  return{oldPath,targetPath,name,newPath,prefix:oldPath+"/"}
}
function applyReparentModel(source,target,plan){
  if(!plan)return false;
  state.resources.forEach(r=>{if(r.path===plan.oldPath)r.path=plan.newPath;else if(r.path&&r.path.startsWith(plan.prefix))r.path=plan.newPath+r.path.slice(plan.oldPath.length)});
  applyFolderSizes(state.resources);
  const movedNode=nodeForResource(source.id),targetNode=nodeForResource(target.id);
  if(movedNode&&targetNode){
    state.view.edges=state.view.edges.filter(e=>!(e.kind==="hierarchy"&&e.to===movedNode.id));
    state.view.edges.push({id:"h-"+target.id+"-"+source.id,from:targetNode.id,to:movedNode.id,kind:"hierarchy"})
  }
  state.treeExpanded.add(target.id);setDirty(true);renderTree();renderEdges();renderFrames(hiddenNodes());renderInspector();return true
}
async function moveResource(source,target){
  if(state.mode!=="fs"||!source||source.missing||!["file","folder"].includes(source.type)||!target||!["root","folder"].includes(target.type))return false;
  const plan=reparentPlan(source,target);if(!plan)return false;
  if(!(await ensureWritePermission()))return false;
  const sourceParent=await dirByParts(state.handle,parentPath(source.path).split("/").filter(Boolean),false),targetDir=await dirByParts(state.handle,plan.targetPath.split("/").filter(Boolean),false);
  if(await entryExists(targetDir,plan.name)){alert("Un élément nommé « "+plan.name+" » existe déjà dans ce dossier.");return false}
  setStatus("Déplacement de « "+plan.name+" »…");
  try{
    if(source.type==="file"){const h=await sourceParent.getFileHandle(plan.name);await copyFileHandle(h,targetDir,plan.name);await sourceParent.removeEntry(plan.name)}
    else{const h=await sourceParent.getDirectoryHandle(plan.name);await copyDirectoryHandle(h,targetDir,plan.name);await sourceParent.removeEntry(plan.name,{recursive:true})}
  }catch(e){console.error(e);setStatus("Déplacement impossible","bad");alert("Impossible de déplacer cet élément : "+(e.message||e));return false}
  applyReparentModel(source,target,plan);setStatus("Déplacement terminé","ok");return true
}
function canCentralReparent(source,target){
  return["fs","demo","draft"].includes(state.mode)&&source&&target&&["file","folder"].includes(source.type)&&["root","folder"].includes(target.type)&&source.id!==target.id
}
async function reparentFromMindmap(source,target){
  if(!canCentralReparent(source,target))return false;
  if(state.mode==="fs")return moveResource(source,target);
  const plan=reparentPlan(source,target);if(!plan)return false;
  const ok=applyReparentModel(source,target,plan);if(ok)setStatus("Arborescence mise à jour depuis la mindmap","ok");return ok
}
function children(id){return state.view?state.view.edges.filter(e=>e.kind==="hierarchy"&&e.from===id).map(e=>e.to):[]}
function hiddenNodes(){const h=new Set();function hide(id){children(id).forEach(c=>{h.add(c);hide(c)})}(state.view&&state.view.nodes||[]).forEach(n=>{if(n.collapsed)hide(n.id)});return h}
function hierarchyDescendants(rootId){
  const out=[rootId],seen=new Set(out),stack=[rootId];
  while(stack.length){const id=stack.pop();children(id).forEach(ch=>{if(!seen.has(ch)){seen.add(ch);out.push(ch);stack.push(ch)}})}
  return out
}
function frameForNode(nodeId){return(state.view?.frames||[]).find(f=>f.rootNodeId===nodeId)||null}
function renderFrames(hidden){
  ui.frames.replaceChildren();if(!state.view)return;
  (state.view.frames||[]).forEach(frame=>{
    const ids=hierarchyDescendants(frame.rootNodeId).filter(id=>!hidden.has(id)),nodes=ids.map(id=>node(id)).filter(Boolean);
    if(!nodes.length)return;
    const pad=Number(frame.padding)||28,minX=Math.min(...nodes.map(n=>n.x))-pad,minY=Math.min(...nodes.map(n=>n.y))-pad-20,maxX=Math.max(...nodes.map(n=>n.x+240))+pad,maxY=Math.max(...nodes.map(n=>n.y+74))+pad;
    const box=document.createElement("div");box.className="branch-frame";box.style.left=minX+"px";box.style.top=minY+"px";box.style.width=(maxX-minX)+"px";box.style.height=(maxY-minY)+"px";box.style.borderColor=frame.borderColor||"#6366f1";box.style.borderStyle=frame.borderStyle||"solid";box.style.backgroundColor=hexToRgba(frame.backgroundColor||"#eef2ff",Math.max(0,Math.min(.4,(Number(frame.opacity)||10)/100)));
    const title=document.createElement("span");title.className="branch-frame-title";title.textContent=frame.title||"Branche";title.style.color=frame.borderColor||"#6366f1";box.append(title);ui.frames.append(box)
  })
}
function renderMap(){
  ui.nodes.replaceChildren();ui.edges.replaceChildren();ui.frames.replaceChildren();if(!state.view)return;const hidden=hiddenNodes();renderFrames(hidden);state.view.nodes.forEach(n=>{if(hidden.has(n.id))return;const r=resource(n.resourceId);if(r)ui.nodes.appendChild(makeNode(n,r))});renderEdges()
}
async function attachNodeImage(ic,r){
  const u=await imageUrlFor(r);if(!u||!ic.isConnected)return;
  ic.replaceChildren();const img=document.createElement("img");img.className="node-thumb";img.src=u;img.alt="";ic.append(img)
}
function makeNode(n,r){
  const s=effectiveNodeStyle(n,r),e=document.createElement("div");e.className="node "+r.type+(r.missing?" missing":"")+(match(r)?"":" dim")+(n.id===state.selected?" selected":"")+(s.locked?" locked":"");e.dataset.node=n.id;e.style.left=n.x+"px";e.style.top=n.y+"px";e.style.backgroundColor=s.backgroundColor;e.style.borderColor=s.borderColor;e.style.borderWidth=Math.max(0,Number(s.borderWidth)||0)+"px";e.style.borderLeftWidth=Math.max(0,Number(s.borderWidth)||0)+"px";e.style.borderRadius=nodeRadius(s.shape);
  const main=document.createElement("div");main.className="node-main";const ic=document.createElement("div");ic.className="node-icon";ic.textContent=s.icon||icon(r);if(s.showImage&&isImageResource(r))attachNodeImage(ic,r);
  const txt=document.createElement("div");txt.className="node-text";txt.style.textAlign=s.textAlign||"left";const tt=document.createElement("div");tt.className="node-title";tt.textContent=r.title;tt.style.fontSize=(Number(s.fontSize)||14)+"px";tt.style.fontFamily=FONT_STACKS[s.fontFamily]||FONT_STACKS.system;tt.style.fontWeight=s.fontWeight||"650";tt.style.fontStyle=s.italic?"italic":"normal";tt.style.color=s.textColor||"#172033";
  const meta=document.createElement("div");meta.className="node-meta";meta.textContent=r.missing?"Ressource absente":r.tags&&r.tags.length?r.tags.map(t=>"#"+t).join(" "):typeLabel(r);txt.append(tt,meta);
  const ch=children(n.id),side=document.createElement(ch.length?"button":"span");if(ch.length){side.className="collapse";side.textContent=n.collapsed?"▸":"▾";side.onpointerdown=x=>x.stopPropagation();side.onclick=x=>{x.stopPropagation();n.collapsed=!n.collapsed;setDirty();renderMap();renderInspector()}}else{side.className="node-badge";side.textContent=s.locked?"🔒":r.type==="file"?"fichier":r.type==="virtual"?"idée":r.type==="url"?"web":""}main.append(ic,txt,side);e.append(main);
  e.onclick=x=>{x.stopPropagation();if(state.linkSource&&state.linkSource!==n.id){manualEdge(state.linkSource,n.id);state.linkSource=null;ui.hint.textContent="Lien créé";render();return}select(n.id)};e.ondblclick=x=>{x.stopPropagation();openResource(r)};e.onpointerdown=x=>dragNode(x,n,e);return e
}
function renderEdges(){
  if(!state.view)return;const hidden=hiddenNodes(),map=new Map(state.view.nodes.filter(n=>!hidden.has(n.id)).map(n=>[n.id,n]));state.view.edges.forEach(ed=>{const a=map.get(ed.from),b=map.get(ed.to);if(!a||!b)return;const ar=resource(a.resourceId),br=resource(b.resourceId),sx=a.x+240,sy=a.y+37,tx=b.x,ty=b.y+37,dx=Math.max(70,Math.abs(tx-sx)*.45),p=document.createElementNS("http://www.w3.org/2000/svg","path");p.setAttribute("d","M "+sx+" "+sy+" C "+(sx+dx)+" "+sy+", "+(tx-dx)+" "+ty+", "+tx+" "+ty);p.setAttribute("class","edge "+(ed.kind==="manual"?"manual ":"")+((match(ar)||match(br))?"":"dim"));ui.edges.appendChild(p)})
}
function centralDropCandidate(clientX,clientY,sourceNodeId){
  const sourceNode=node(sourceNodeId),source=sourceNode&&resource(sourceNode.resourceId);if(!source)return null;
  const elements=document.elementsFromPoint(clientX,clientY);
  for(const el of elements){
    const card=el.closest&&el.closest(".node");if(!card||card.dataset.node===sourceNodeId)continue;
    const targetNode=node(card.dataset.node),target=targetNode&&resource(targetNode.resourceId);
    if(canCentralReparent(source,target))return{element:card,resource:target}
  }
  return null
}
function clearCentralDropHighlight(){ui.nodes.querySelectorAll(".node.drop-target").forEach(x=>x.classList.remove("drop-target"))}
function dragNode(ev,n,e){
  const source=resource(n.resourceId);if(ev.button!==0||ev.target.closest("button")||effectiveNodeStyle(n,source).locked)return;
  ev.stopPropagation();if(state.selected!==n.id){state.selected=n.id;ui.nodes.querySelectorAll(".node.selected").forEach(x=>x.classList.remove("selected"));e.classList.add("selected");renderTree();renderInspector()}
  const s={x:ev.clientX,y:ev.clientY,nx:n.x,ny:n.y};let moved=false,drop=null;e.setPointerCapture&&e.setPointerCapture(ev.pointerId);
  function mv(x){
    const dx=(x.clientX-s.x)/state.view.zoom,dy=(x.clientY-s.y)/state.view.zoom;if(Math.abs(dx)+Math.abs(dy)>2)moved=true;
    n.x=Math.max(0,s.nx+dx);n.y=Math.max(0,s.ny+dy);e.style.left=n.x+"px";e.style.top=n.y+"px";renderEdges();renderFrames(hiddenNodes());
    clearCentralDropHighlight();drop=moved?centralDropCandidate(x.clientX,x.clientY,n.id):null;if(drop)drop.element.classList.add("drop-target")
  }
  async function end(x){
    e.removeEventListener("pointermove",mv);e.removeEventListener("pointerup",end);e.removeEventListener("pointercancel",end);clearCentralDropHighlight();
    if(!moved)return;if(x.type!=="pointercancel"&&drop){await reparentFromMindmap(source,drop.resource);renderMap()}else setDirty()
  }
  e.addEventListener("pointermove",mv);e.addEventListener("pointerup",end);e.addEventListener("pointercancel",end)
}
function select(id){state.selected=id;renderTree();renderMap();renderInspector()}
function manualEdge(a,b){if(state.view.edges.some(e=>e.from===a&&e.to===b))return;state.view.edges.push({id:"m-"+uuid(),from:a,to:b,kind:"manual"});setDirty()}
function renderInspector(){
  const r=selectedResource(),n=selectedNode();ui.noSelection.classList.toggle("hidden",!!r);ui.form.classList.toggle("hidden",!r);ui.selectionKind.textContent=r?typeLabel(r):"Aucune sélection";if(!r||!n){updateActionStates();return}
  ui.title.value=r.title||"";ui.kind.textContent=typeLabel(r)+(r.missing?" — absent":"");ui.path.textContent=r.path||r.url||"(nœud conceptuel)";ui.size.textContent=["root","folder","file"].includes(r.type)?formatSize(r.size):"—";ui.size.title=Number.isFinite(r.size)?new Intl.NumberFormat("fr-BE").format(r.size)+" octets":"";ui.modified.textContent=r.type==="file"?formatDate(r.lastModified):"—";ui.tags.value=(r.tags||[]).join(", ");ui.notes.value=r.notes||"";
  const s=effectiveNodeStyle(n,r);ui.nodeIcon.value=s.icon||"";ui.fontSize.value=s.fontSize;ui.fontSizeValue.value=s.fontSize+" px";ui.fontFamily.value=s.fontFamily;ui.fontWeight.value=String(s.fontWeight);ui.textAlign.value=s.textAlign;ui.fontItalic.checked=!!s.italic;ui.textColor.value=s.textColor;ui.backgroundColor.value=s.backgroundColor;ui.borderColor.value=s.borderColor;ui.borderWidth.value=s.borderWidth;ui.borderWidthValue.value=s.borderWidth+" px";ui.nodeShape.value=s.shape;ui.nodeLocked.checked=!!s.locked;ui.imageToggleLabel.classList.toggle("hidden",!isImageResource(r));ui.showNodeImage.checked=!!s.showImage;ui.pasteStyleBtn.disabled=!state.styleClipboard;
  const fr=frameForNode(n.id);ui.frameFields.classList.toggle("hidden",!fr);ui.frameToggleBtn.textContent=fr?"✕ Supprimer le cadre":"＋ Créer un cadre autour de cette branche";ui.branchFrameSection.classList.toggle("hidden",!children(n.id).length&&!fr);
  if(fr){ui.frameTitle.value=fr.title||r.title;ui.frameBorderColor.value=fr.borderColor||"#6366f1";ui.frameBackgroundColor.value=fr.backgroundColor||"#eef2ff";ui.frameOpacity.value=Number(fr.opacity)||10;ui.frameOpacityValue.value=(Number(fr.opacity)||10)+" %";ui.frameBorderStyle.value=fr.borderStyle||"solid"}
  ui.openResource.disabled=r.type==="virtual";ui.openResource.textContent=["root","folder"].includes(r.type)?"▦ Galerie du dossier":"👁️ Ouvrir / prévisualiser";ui.deleteBtn.classList.toggle("hidden",!["virtual","url"].includes(r.type));ui.collapseBtn.classList.toggle("hidden",!children(n.id).length);ui.collapseBtn.textContent=n.collapsed?"▸ Déplier":"▾ Replier";ui.linkBtn.textContent=state.linkSource===n.id?"✕ Annuler le lien":"⛓️ Relier à…";updateActionStates()
}
function updateForm(){const r=selectedResource();if(!r)return;r.title=ui.title.value.trim()||r.title;r.tags=ui.tags.value.split(",").map(x=>x.trim()).filter(Boolean);r.notes=ui.notes.value;setDirty();renderTree();renderMap()}
function updateNodeStyle(){
  const n=selectedNode(),r=selectedResource();if(!n||!r)return;
  n.style={icon:ui.nodeIcon.value.trim(),fontSize:Number(ui.fontSize.value)||14,fontFamily:ui.fontFamily.value,fontWeight:ui.fontWeight.value,italic:ui.fontItalic.checked,textAlign:ui.textAlign.value,textColor:ui.textColor.value,backgroundColor:ui.backgroundColor.value,borderColor:ui.borderColor.value,borderWidth:Number(ui.borderWidth.value)||0,shape:ui.nodeShape.value,locked:ui.nodeLocked.checked,showImage:isImageResource(r)&&ui.showNodeImage.checked};
  ui.fontSizeValue.value=n.style.fontSize+" px";ui.borderWidthValue.value=n.style.borderWidth+" px";setDirty();renderMap()
}
function copyNodeStyle(){const n=selectedNode();if(!n)return;state.styleClipboard=typeof structuredClone==="function"?structuredClone(n.style||{}):JSON.parse(JSON.stringify(n.style||{}));ui.pasteStyleBtn.disabled=false;setStatus("Style copié","ok")}
function pasteNodeStyle(){const n=selectedNode();if(!n||!state.styleClipboard)return;n.style=JSON.parse(JSON.stringify(state.styleClipboard));setDirty();renderMap();renderInspector()}
function resetNodeStyle(){const n=selectedNode();if(!n)return;n.style={};setDirty();renderMap();renderInspector()}
function toggleBranchFrame(){
  const n=selectedNode(),r=selectedResource();if(!n||!r)return;state.view.frames=state.view.frames||[];const fr=frameForNode(n.id);
  if(fr)state.view.frames=state.view.frames.filter(x=>x.id!==fr.id);
  else state.view.frames.push({id:"frame-"+uuid(),rootNodeId:n.id,title:r.title,borderColor:"#6366f1",backgroundColor:"#eef2ff",opacity:10,borderStyle:"solid",padding:28});
  setDirty();renderMap();renderInspector()
}
function updateBranchFrame(){
  const n=selectedNode(),fr=n&&frameForNode(n.id);if(!fr)return;fr.title=ui.frameTitle.value;fr.borderColor=ui.frameBorderColor.value;fr.backgroundColor=ui.frameBackgroundColor.value;fr.opacity=Number(ui.frameOpacity.value)||0;fr.borderStyle=ui.frameBorderStyle.value;ui.frameOpacityValue.value=fr.opacity+" %";setDirty();renderFrames(hiddenNodes())
}
function toggleCollapse(){const n=selectedNode();if(!n)return;n.collapsed=!n.collapsed;setDirty();renderMap();renderInspector()}
function deleteSelected(){const r=selectedResource(),n=selectedNode();if(!r||!n||!["virtual","url"].includes(r.type))return;if(!confirm("Supprimer le nœud « "+r.title+" » ?"))return;state.resources=state.resources.filter(x=>x.id!==r.id);state.view.nodes=state.view.nodes.filter(x=>x.id!==n.id);state.view.edges=state.view.edges.filter(x=>x.from!==n.id&&x.to!==n.id);state.view.frames=(state.view.frames||[]).filter(x=>x.rootNodeId!==n.id);state.selected=null;state.linkSource=null;setDirty();render()}
function linkMode(){const n=selectedNode();if(!n)return;if(state.linkSource===n.id){state.linkSource=null;ui.hint.textContent="Glisser le fond pour déplacer la vue"}else{state.linkSource=n.id;ui.hint.textContent="Cliquez sur le nœud à relier"}renderInspector();updateActionStates()}
function centerWorld(){const r=ui.viewport.getBoundingClientRect();return{x:(r.width/2-state.view.pan.x)/state.view.zoom,y:(r.height/2-state.view.pan.y)/state.view.zoom}}
function addIdea(){const title=prompt("Nom de la nouvelle idée :","Nouvelle idée");if(!title||!title.trim())return;const r={id:"v-"+uuid(),type:"virtual",title:title.trim(),tags:[],notes:""},c=centerWorld(),n={id:"n-"+r.id,resourceId:r.id,x:Math.max(0,c.x-120),y:Math.max(0,c.y-37),collapsed:false,style:{}};state.resources.push(r);state.view.nodes.push(n);if(state.selected)manualEdge(state.selected,n.id);state.selected=n.id;setDirty();render()}
function addUrl(){const raw=prompt("Adresse web :","https://");if(!raw)return;let u;try{u=new URL(raw).href}catch(e){alert("URL invalide");return}const title=prompt("Titre du lien :",new URL(u).hostname)||new URL(u).hostname,r={id:"u-"+uuid(),type:"url",title:title,tags:[],notes:"",url:u},c=centerWorld(),n={id:"n-"+r.id,resourceId:r.id,x:Math.max(0,c.x-120),y:Math.max(0,c.y-37),collapsed:false,style:{}};state.resources.push(r);state.view.nodes.push(n);if(state.selected)manualEdge(state.selected,n.id);state.selected=n.id;setDirty();render()}
function previewUi(){return{dialog:ui.preview,title:ui.previewTitle,meta:ui.previewMeta,body:ui.previewBody}}
async function basicPreview(r,f){
  ui.previewTitle.textContent=r.title;ui.previewMeta.textContent=(r.path||f.name)+" — "+formatSize(f.size);ui.previewBody.replaceChildren();
  const ext=(r.path||f.name).split(".").pop().toLowerCase(),m=f.type||"",u=URL.createObjectURL(f);
  ui.preview.addEventListener("close",()=>URL.revokeObjectURL(u),{once:true});
  if(m.startsWith("image/")||["png","jpg","jpeg","gif","webp","svg"].includes(ext)){const x=document.createElement("img");x.src=u;x.alt=r.title;ui.previewBody.append(x)}
  else if(m==="application/pdf"||ext==="pdf"){const x=document.createElement("iframe");x.src=u;x.title=r.title;ui.previewBody.append(x)}
  else if(m.startsWith("text/")||["md","txt","json","csv","js","ts","css","html","xml","yaml","yml","py","ini","log"].includes(ext)){const x=document.createElement("pre");x.textContent=await f.text();ui.previewBody.append(x)}
  else{const p=document.createElement("div");p.className="preview-fallback";p.textContent="Viewer avancé indisponible pour ce format.";ui.previewBody.append(p)}
  if(!ui.preview.open)ui.preview.showModal()
}
async function openResource(r){
  if(!r)return;
  if(r.type==="url"){window.open(r.url,"_blank","noopener,noreferrer");return}
  if(["root","folder"].includes(r.type)){
    const api=await getViewerApi();
    if(api&&api.showFolderPreview){api.showFolderPreview(r,state.resources,previewUi(),openResource);return}
    const n=nodeForResource(r.id);if(n){n.collapsed=false;renderMap();focus(n.id)}return
  }
  if(r.type==="virtual")return;
  if(state.mode==="demo"){previewDemo(r);return}
  let f=null;try{f=state.mode==="fs"?await fileFromPath(state.handle,r.path):state.fallbackFiles.get(r.path)}catch(e){console.warn(e)}
  if(!f){alert("Fichier inaccessible ou déplacé. Essayez de rescanner.");return}
  const api=await getViewerApi();if(api&&api.showFilePreview)await api.showFilePreview(r,f,previewUi());else await basicPreview(r,f)
}
function previewDemo(r){
  clearPreviewSafe();ui.previewTitle.textContent=r.title;ui.previewMeta.textContent="Ressource fictive de démonstration";ui.previewBody.replaceChildren();
  const d=document.createElement("div");d.className="preview-fallback";const i=document.createElement("div");i.style.fontSize="4rem";i.textContent=icon(r);
  const p=document.createElement("p");p.textContent="En mode démo, les fichiers sont fictifs. Ouvrez un vrai dossier pour tester les viewers locaux de la V0.2.";
  d.append(i,p);ui.previewBody.appendChild(d);ui.preview.showModal()
}
function transform(){if(!state.view)return;ui.world.style.transform="translate("+state.view.pan.x+"px,"+state.view.pan.y+"px) scale("+state.view.zoom+")";ui.zoomValue.textContent=Math.round(state.view.zoom*100)+"%"}
function zoom(z,anchor){if(!state.view)return;const old=state.view.zoom,n=Math.min(2.2,Math.max(.2,z));if(anchor){const r=ui.viewport.getBoundingClientRect(),lx=anchor.x-r.left,ly=anchor.y-r.top,wx=(lx-state.view.pan.x)/old,wy=(ly-state.view.pan.y)/old;state.view.pan.x=lx-wx*n;state.view.pan.y=ly-wy*n}state.view.zoom=n;transform();setDirty()}
function focus(id){const n=node(id);if(!n)return;const r=ui.viewport.getBoundingClientRect();state.view.pan.x=r.width/2-(n.x+120)*state.view.zoom;state.view.pan.y=r.height/2-(n.y+37)*state.view.zoom;transform()}
function fit(){if(!state.view||!state.view.nodes.length)return;const h=hiddenNodes(),a=state.view.nodes.filter(n=>!h.has(n.id));if(!a.length)return;const minX=Math.min.apply(null,a.map(n=>n.x)),minY=Math.min.apply(null,a.map(n=>n.y)),maxX=Math.max.apply(null,a.map(n=>n.x+240)),maxY=Math.max.apply(null,a.map(n=>n.y+82)),r=ui.viewport.getBoundingClientRect();if(!r.width)return;const pad=90,z=Math.min(1.15,Math.max(.2,Math.min((r.width-pad*2)/Math.max(1,maxX-minX),(r.height-pad*2)/Math.max(1,maxY-minY))));state.view.zoom=z;state.view.pan.x=(r.width-(maxX-minX)*z)/2-minX*z;state.view.pan.y=(r.height-(maxY-minY)*z)/2-minY*z;transform()}
function autoLayout(){
  if(!state.view)return;const auto=freshView(state.resources),byResource=new Map(auto.nodes.map(n=>[n.resourceId,n]));
  state.view.nodes.forEach(n=>{if(effectiveNodeStyle(n,resource(n.resourceId)).locked)return;const p=byResource.get(n.resourceId);if(p){n.x=p.x;n.y=p.y}});
  setDirty();renderMap();fit();setStatus("Disposition réorganisée","ok")
}
function panStart(ev){if(!state.view||ev.button!==0||ev.target.closest(".node,.map-palette,button,summary"))return;const s={x:ev.clientX,y:ev.clientY,px:state.view.pan.x,py:state.view.pan.y};ui.viewport.classList.add("panning");function mv(x){state.view.pan.x=s.px+x.clientX-s.x;state.view.pan.y=s.py+x.clientY-s.y;transform()}function end(){ui.viewport.classList.remove("panning");ui.viewport.removeEventListener("pointermove",mv);ui.viewport.removeEventListener("pointerup",end);ui.viewport.removeEventListener("pointercancel",end);setDirty()}ui.viewport.addEventListener("pointermove",mv);ui.viewport.addEventListener("pointerup",end);ui.viewport.addEventListener("pointercancel",end)}
async function rememberRecentWorkspace(handle,workspace){
  try{const api=await getRecentApi();if(api)await api.rememberWorkspace(handle,workspace)}catch(e){console.warn("Unable to remember workspace",e)}
}
async function openRecentWorkspace(entry){
  if(!entry?.handle)return;
  if(state.dirty){
    if(state.mode==="fs"&&state.canWrite)await save(true);
    else if(!confirm("Des modifications ne sont pas enregistrées/exportées. Changer de workspace quand même ?"))return
  }
  try{
    let granted=true;
    if(entry.handle.queryPermission){const q=await entry.handle.queryPermission({mode:"readwrite"});granted=q==="granted";if(!granted&&entry.handle.requestPermission)granted=(await entry.handle.requestPermission({mode:"readwrite"}))==="granted"}
    if(!granted){alert("L’accès à ce dossier n’a pas été autorisé.");return}
    ui.recentDialog.close();await loadHandle(entry.handle,false)
  }catch(e){console.error(e);alert("Impossible de rouvrir ce workspace : "+(e.message||e))}
}
async function renderRecentWorkspaces(){
  ui.recentList.replaceChildren();
  const api=await getRecentApi();
  if(!api){const p=document.createElement("p");p.className="recent-empty";p.textContent="Le stockage local des workspaces récents n’est pas disponible.";ui.recentList.append(p);return}
  let rows=[];try{rows=await api.listRecentWorkspaces()}catch(e){console.warn(e)}
  if(!rows.length){const p=document.createElement("p");p.className="recent-empty";p.textContent="Aucun workspace récent. Ouvrez d’abord un dossier local.";ui.recentList.append(p);return}
  rows.forEach(entry=>{
    const row=document.createElement("div");row.className="recent-item";
    const text=document.createElement("div"),name=document.createElement("strong"),date=document.createElement("small");
    name.textContent=entry.name||"Workspace";date.textContent=entry.lastOpenedAt?"Ouvert "+new Intl.DateTimeFormat("fr-BE",{dateStyle:"medium",timeStyle:"short"}).format(new Date(entry.lastOpenedAt)):"";
    text.append(name,date);
    const actions=document.createElement("div");actions.className="recent-actions";
    const open=document.createElement("button");open.type="button";open.textContent=state.workspace?.id===entry.id?"↻ Recharger":"📂 Ouvrir";open.onclick=()=>openRecentWorkspace(entry);
    const forget=document.createElement("button");forget.type="button";forget.textContent="Oublier";forget.onclick=async()=>{try{await api.forgetWorkspace(entry.id);await renderRecentWorkspaces()}catch(e){console.warn(e)}};
    actions.append(open,forget);row.append(text,actions);ui.recentList.append(row)
  })
}
async function openRecentDialog(){
  if(!supportsFS()){alert("Les workspaces récents nécessitent l’accès direct aux dossiers de ce navigateur.");return}
  if(!ui.recentDialog.open)ui.recentDialog.showModal();
  await renderRecentWorkspaces()
}
async function openExportDialog(){
  if(!state.workspace||!state.view)return;
  setStatus(state.dirty?"Modifications non enregistrées":"Prêt");
  ui.materializeBtn.disabled=!supportsFS();
  if(!ui.exportDialog.open)ui.exportDialog.showModal()
}
function exportOptions(){return{orientation:ui.exportOrientation.value,includeHidden:ui.exportHidden.checked}}
function exportBaseName(){return safeName((state.workspace&&state.workspace.name)||"mindmap")+"-mindmap"}
async function runExport(kind){
  if(!state.view)return;
  const api=await getExporterApi();if(!api){alert("Le module d’export de la mindmap n’a pas pu être chargé.");return}
  try{
    const o=exportOptions(),base=exportBaseName();
    if(kind==="svg")api.exportSvg(base+".svg",state.view,state.resources,o);
    else if(kind==="png")api.exportPng(base+".png",state.view,state.resources,o).catch(e=>{console.error(e);alert("Export PNG impossible : "+(e.message||e))});
    else if(kind==="print")api.printA4(state.workspace.name,state.view,state.resources,o);
    if(kind!=="print")setStatus("Export "+kind.toUpperCase()+" généré","ok")
  }catch(e){console.error(e);alert("Export impossible : "+(e.message||e))}
}
async function exportWorkspaceZip(){
  if(!state.workspace||!state.view)return;setStatus("Création du template ZIP…");
  const api=await getWorkspaceExporterApi();if(!api){alert("Le module ZIP n’a pas pu être chargé.");return}
  try{const result=await api.exportWorkspaceTemplateZip(state.workspace,state.resources,state.view,APP);setStatus("Template ZIP créé — "+result.folders+" dossier(s), "+result.plannedFiles+" fichier(s) planifié(s)","ok")}
  catch(e){console.error(e);setStatus("Export ZIP impossible","bad");alert("Impossible de créer le ZIP : "+(e.message||e))}
}
async function materializeWorkspace(){
  if(!state.workspace||!state.view)return;if(!supportsFS()){alert("Ce navigateur ne permet pas de créer directement une arborescence locale.");return}
  try{
    const parent=await window.showDirectoryPicker({mode:"readwrite"}),suggested=safeFolderName(state.workspace.name),raw=prompt("Nom du dossier à créer :",suggested);if(raw===null)return;
    const folderName=safeFolderName(raw);if(await entryExists(parent,folderName)){alert("Un dossier portant ce nom existe déjà dans l’emplacement choisi.");return}
    setStatus("Création de l’arborescence…");const root=await parent.getDirectoryHandle(folderName,{create:true});
    const folders=state.resources.filter(r=>r.type==="folder"&&!r.missing&&r.path).sort((a,b)=>a.path.split("/").length-b.path.split("/").length);
    for(const r of folders)await dirByParts(root,r.path.split("/").filter(Boolean),true);
    const payload=workspaceMetadataSnapshot();
    await Promise.all([writeJson(root,WS,payload.workspace),writeJson(root,RES,payload.resources),writeJson(root,VIEW,payload.view)]);
    const planned=state.resources.filter(r=>r.type==="file"&&r.path).length;ui.exportDialog.close();await loadHandle(root,false);
    setStatus("Workspace créé sur disque","ok");if(planned)alert(planned+" ressource(s) fichier sont conservées comme références planifiées. Elles apparaîtront « absentes » jusqu’à ce que les vrais fichiers correspondants soient ajoutés.")
  }catch(e){if(e&&e.name==="AbortError")return;console.error(e);setStatus("Création sur disque impossible","bad");alert("Impossible de créer le workspace : "+(e.message||e))}
}
function closePanels(){ui.resourcesPanel.classList.remove("open");ui.inspectorPanel.classList.remove("open")}
function closeToolbarMenus(except=null){document.querySelectorAll("[data-menu][open]").forEach(m=>{if(m!==except)m.removeAttribute("open")})}
function wire(){
  ui.openBtn.onclick=openWorkspace;ui.newWorkspaceBtn.onclick=newDraftWorkspace;ui.recentBtn.onclick=openRecentDialog;ui.recentClose.onclick=()=>ui.recentDialog.close();ui.welcomeOpen.onclick=openWorkspace;const runDemo=()=>{try{demo()}catch(e){console.error("Demo rendering failed",e);setStatus("Erreur de rendu de la démo","bad");alert("Impossible d’afficher la démo : "+(e.message||e))}};ui.demoBtn.onclick=runDemo;ui.welcomeDemo.onclick=runDemo;ui.scanBtn.onclick=rescan;ui.saveBtn.onclick=()=>save(false);ui.exportBtn.onclick=openExportDialog;ui.exportClose.onclick=()=>ui.exportDialog.close();ui.exportSvgBtn.onclick=()=>runExport("svg");ui.exportPngBtn.onclick=()=>runExport("png");ui.exportPrintBtn.onclick=()=>runExport("print");ui.zipWorkspaceBtn.onclick=exportWorkspaceZip;ui.materializeBtn.onclick=materializeWorkspace;ui.folderBtn.onclick=addFolder;ui.ideaBtn.onclick=addIdea;ui.urlBtn.onclick=addUrl;ui.fitBtn.onclick=fit;ui.autoLayoutBtn.onclick=autoLayout;ui.zoomIn.onclick=()=>zoom((state.view&&state.view.zoom||1)*1.15);ui.zoomOut.onclick=()=>zoom((state.view&&state.view.zoom||1)/1.15);
  ui.mapSelectBtn.onclick=()=>{state.linkSource=null;ui.hint.textContent="Glisser le fond pour déplacer la vue";updateActionStates();renderInspector()};
  ui.mapFolderBtn.onclick=addFolder;ui.mapIdeaBtn.onclick=addIdea;ui.mapRelationBtn.onclick=linkMode;ui.mapFrameBtn.onclick=toggleBranchFrame;
  ui.contextFolderBtn.onclick=addFolder;ui.contextIdeaBtn.onclick=addIdea;ui.contextRelationBtn.onclick=linkMode;ui.contextFrameBtn.onclick=toggleBranchFrame;
  document.querySelectorAll("[data-menu]").forEach(menu=>menu.addEventListener("toggle",()=>{if(menu.open)closeToolbarMenus(menu)}));
  document.querySelectorAll("[data-menu] .toolbar-menu-panel button").forEach(b=>b.addEventListener("click",()=>b.closest("[data-menu]")?.removeAttribute("open")));
  document.addEventListener("click",e=>{if(!e.target.closest("[data-menu]"))closeToolbarMenus()});
  ui.viewport.onpointerdown=panStart;ui.viewport.onclick=e=>{if(!e.target.closest(".node,.map-palette")){state.selected=null;state.linkSource=null;ui.hint.textContent="Glisser le fond pour déplacer la vue";render()}};ui.viewport.addEventListener("wheel",e=>{if(!state.view)return;e.preventDefault();zoom(state.view.zoom*(e.deltaY<0?1.08:1/1.08),{x:e.clientX,y:e.clientY})},{passive:false});
  ui.search.oninput=()=>{state.search=ui.search.value.trim();renderTree();renderMap()};[ui.title,ui.tags,ui.notes].forEach(x=>x.addEventListener("input",updateForm));
  [ui.nodeIcon,ui.fontSize,ui.fontFamily,ui.fontWeight,ui.textAlign,ui.fontItalic,ui.textColor,ui.backgroundColor,ui.borderColor,ui.borderWidth,ui.nodeShape,ui.nodeLocked,ui.showNodeImage].forEach(x=>x.addEventListener("input",updateNodeStyle));
  ui.copyStyleBtn.onclick=copyNodeStyle;ui.pasteStyleBtn.onclick=pasteNodeStyle;ui.resetStyleBtn.onclick=resetNodeStyle;ui.frameToggleBtn.onclick=toggleBranchFrame;[ui.frameTitle,ui.frameBorderColor,ui.frameBackgroundColor,ui.frameOpacity,ui.frameBorderStyle].forEach(x=>x.addEventListener("input",updateBranchFrame));
  ui.openResource.onclick=()=>openResource(selectedResource());ui.linkBtn.onclick=linkMode;ui.collapseBtn.onclick=toggleCollapse;ui.deleteBtn.onclick=deleteSelected;
  ui.folderFallback.onchange=async()=>{const f=ui.folderFallback.files;ui.folderFallback.value="";await loadFallback(f)};ui.previewClose.onclick=()=>ui.preview.close();ui.preview.addEventListener("close",clearPreviewSafe);
  ui.showResourcesBtn.onclick=()=>ui.resourcesPanel.classList.toggle("open");ui.showInspectorBtn.onclick=()=>ui.inspectorPanel.classList.toggle("open");document.querySelectorAll("[data-close]").forEach(b=>b.onclick=()=>el(b.dataset.close).classList.remove("open"));
  window.addEventListener("keydown",e=>{if((e.ctrlKey||e.metaKey)&&e.key.toLowerCase()==="s"){e.preventDefault();save(false)}if(e.key==="Escape"){state.linkSource=null;ui.hint.textContent="Glisser le fond pour déplacer la vue";closeToolbarMenus();closePanels();renderInspector();updateActionStates()}});window.addEventListener("resize",()=>{if(innerWidth>900)closePanels()})
}
async function init(){
  document.documentElement.dataset.glomBoot="starting";
  try{
    wire();
    if(!supportsFS()){setButtonLabel(ui.openBtn,"Importer un dossier");ui.welcomeOpen.textContent="📂 Importer un dossier";ui.recentBtn.disabled=true;ui.recentBtn.title="Non disponible avec ce navigateur"}
    if("serviceWorker"in navigator){
      try{
        const reg=await navigator.serviceWorker.register("./sw.js?v="+APP,{scope:"./",updateViaCache:"none"});
        await reg.update();
      }catch(e){console.warn("Service worker registration/update failed",e)}
    }
    if(new URLSearchParams(location.search).get("demo")==="1")demo();
    document.documentElement.dataset.glomBoot="ok"
  }catch(e){
    document.documentElement.dataset.glomBoot="error";
    setStatus("Erreur de démarrage : "+(e&&e.message?e.message:e),"bad");
    console.error("G.L.O.M. init failed",e)
  }
}
init();
