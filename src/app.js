let viewerApi=null,viewerLoadFailed=false,exporterApi=null,workspaceExporterApi=null,recentApi=null;
async function getWorkspaceExporterApi(){if(workspaceExporterApi)return workspaceExporterApi;try{workspaceExporterApi=await import("./exporters/workspace.js");return workspaceExporterApi}catch(e){console.error("Workspace exporter failed to load",e);setStatus("Export workspace indisponible","bad");return null}}
async function getRecentApi(){if(recentApi)return recentApi;try{recentApi=await import("./workspaces/recent.js");return recentApi}catch(e){console.error("Recent workspaces module failed to load",e);return null}}
async function getExporterApi(){if(exporterApi)return exporterApi;try{exporterApi=await import("./exporters/mindmap.js");return exporterApi}catch(e){console.error("Exporter module failed to load",e);setStatus("Export image/PDF indisponible","bad");return null}}
async function getViewerApi(){if(viewerApi)return viewerApi;if(viewerLoadFailed)return null;try{viewerApi=await import("./viewers/index.js");return viewerApi}catch(e){viewerLoadFailed=true;console.error("Viewer module failed to load",e);setStatus("Viewer avancé indisponible — fonctions principales actives","bad");return null}}
function clearPreviewSafe(){try{viewerApi&&viewerApi.clearPreview&&viewerApi.clearPreview()}catch(e){console.warn(e)}}
const el=id=>document.getElementById(id);
const ui={
  workspaceName:el("workspaceName"),count:el("count"),tree:el("tree"),search:el("search"),status:el("status"),shell:document.querySelector(".shell"),stageTools:el("stageTools"),workspaceMenu:el("workspaceMenu"),insertionMenu:el("insertionMenu"),viewMenu:el("viewMenu"),
  openBtn:el("openBtn"),newWorkspaceBtn:el("newWorkspaceBtn"),recentBtn:el("recentBtn"),demoBtn:el("demoBtn"),scanBtn:el("scanBtn"),exclusionsBtn:el("exclusionsBtn"),saveMenu:el("saveMenu"),saveMenuSummary:el("saveMenuSummary"),saveNowBtn:el("saveNowBtn"),saveExportBtn:el("saveExportBtn"),exportBtn:el("exportBtn"),folderBtn:el("folderBtn"),textFileBtn:el("textFileBtn"),markdownFileBtn:el("markdownFileBtn"),ideaBtn:el("ideaBtn"),urlBtn:el("urlBtn"),viewSelect:el("viewSelect"),newViewBtn:el("newViewBtn"),duplicateViewBtn:el("duplicateViewBtn"),renameViewBtn:el("renameViewBtn"),fitBtn:el("fitBtn"),autoLayoutBtn:el("autoLayoutBtn"),toggleResourcesBtn:el("toggleResourcesBtn"),toggleInspectorBtn:el("toggleInspectorBtn"),mapPalette:el("mapPalette"),mapSelectBtn:el("mapSelectBtn"),mapFolderBtn:el("mapFolderBtn"),mapIdeaBtn:el("mapIdeaBtn"),mapRelationBtn:el("mapRelationBtn"),mapFrameBtn:el("mapFrameBtn"),mapShapeBtn:el("mapShapeBtn"),mapTextBtn:el("mapTextBtn"),mapImageBtn:el("mapImageBtn"),
  welcome:el("welcome"),welcomeNew:el("welcomeNew"),welcomeOpen:el("welcomeOpen"),welcomeRecent:el("welcomeRecent"),welcomeDemo:el("welcomeDemo"),viewport:el("viewport"),world:el("world"),frames:el("frames"),visualObjects:el("visualObjects"),nodes:el("nodes"),edges:el("edges"),compat:el("compat"),
  zoomOut:el("zoomOut"),zoomIn:el("zoomIn"),zoomValue:el("zoomValue"),hint:el("hint"),
  noSelection:el("noSelection"),form:el("form"),visualForm:el("visualForm"),edgeForm:el("edgeForm"),selectionKind:el("selectionKind"),edgeKind:el("edgeKind"),edgeLabel:el("edgeLabel"),edgeColor:el("edgeColor"),edgeWidth:el("edgeWidth"),edgeWidthValue:el("edgeWidthValue"),edgeLineStyle:el("edgeLineStyle"),edgeArrow:el("edgeArrow"),edgeCurvature:el("edgeCurvature"),edgeCurvatureValue:el("edgeCurvatureValue"),deleteEdgeBtn:el("deleteEdgeBtn"),visualKind:el("visualKind"),visualTextLabel:el("visualTextLabel"),visualText:el("visualText"),visualShapeLabel:el("visualShapeLabel"),visualShape:el("visualShape"),visualWidth:el("visualWidth"),visualHeight:el("visualHeight"),visualFontSizeLabel:el("visualFontSizeLabel"),visualFontSize:el("visualFontSize"),visualFontFamilyLabel:el("visualFontFamilyLabel"),visualFontFamily:el("visualFontFamily"),visualFontWeightLabel:el("visualFontWeightLabel"),visualFontWeight:el("visualFontWeight"),visualTextAlignLabel:el("visualTextAlignLabel"),visualTextAlign:el("visualTextAlign"),visualItalicLabel:el("visualItalicLabel"),visualItalic:el("visualItalic"),visualTextColorLabel:el("visualTextColorLabel"),visualTextColor:el("visualTextColor"),visualFillLabel:el("visualFillLabel"),visualFill:el("visualFill"),visualStrokeLabel:el("visualStrokeLabel"),visualStroke:el("visualStroke"),visualImageSourceLabel:el("visualImageSourceLabel"),visualImageSource:el("visualImageSource"),visualImageFitLabel:el("visualImageFitLabel"),visualImageFit:el("visualImageFit"),visualImageOpacityLabel:el("visualImageOpacityLabel"),visualImageOpacity:el("visualImageOpacity"),visualImageOpacityValue:el("visualImageOpacityValue"),visualImageRadiusLabel:el("visualImageRadiusLabel"),visualImageRadius:el("visualImageRadius"),visualImageRadiusValue:el("visualImageRadiusValue"),deleteVisualBtn:el("deleteVisualBtn"),title:el("title"),kind:el("kind"),path:el("path"),size:el("size"),modified:el("modified"),tags:el("tags"),notes:el("notes"),nodeIcon:el("nodeIcon"),fontSize:el("fontSize"),fontSizeValue:el("fontSizeValue"),nodeWidth:el("nodeWidth"),nodeWidthValue:el("nodeWidthValue"),nodeHeight:el("nodeHeight"),nodeHeightValue:el("nodeHeightValue"),fontFamily:el("fontFamily"),fontWeight:el("fontWeight"),textAlign:el("textAlign"),fontItalic:el("fontItalic"),textColor:el("textColor"),backgroundColor:el("backgroundColor"),borderColor:el("borderColor"),borderWidth:el("borderWidth"),borderWidthValue:el("borderWidthValue"),nodeShape:el("nodeShape"),nodeLocked:el("nodeLocked"),moveBranch:el("moveBranch"),imageToggleLabel:el("imageToggleLabel"),showNodeImage:el("showNodeImage"),copyStyleBtn:el("copyStyleBtn"),pasteStyleBtn:el("pasteStyleBtn"),resetStyleBtn:el("resetStyleBtn"),branchFrameSection:el("branchFrameSection"),frameToggleBtn:el("frameToggleBtn"),frameFields:el("frameFields"),frameTitle:el("frameTitle"),frameFontSize:el("frameFontSize"),frameFontSizeValue:el("frameFontSizeValue"),frameFontFamily:el("frameFontFamily"),frameFontWeight:el("frameFontWeight"),frameItalic:el("frameItalic"),frameTextColor:el("frameTextColor"),frameBorderColor:el("frameBorderColor"),frameBackgroundColor:el("frameBackgroundColor"),frameOpacity:el("frameOpacity"),frameOpacityValue:el("frameOpacityValue"),frameBorderStyle:el("frameBorderStyle"),frameMemberCount:el("frameMemberCount"),frameWidth:el("frameWidth"),frameHeight:el("frameHeight"),frameLocked:el("frameLocked"),frameFitBtn:el("frameFitBtn"),frameCaptureBtn:el("frameCaptureBtn"),
  openResource:el("openResource"),linkBtn:el("linkBtn"),collapseBtn:el("collapseBtn"),deleteBtn:el("deleteBtn"),contextActionsSection:el("contextActionsSection"),contextFolderBtn:el("contextFolderBtn"),contextIdeaBtn:el("contextIdeaBtn"),contextRelationBtn:el("contextRelationBtn"),contextFrameBtn:el("contextFrameBtn"),contextExcludeBtn:el("contextExcludeBtn"),
  imageObjectDialog:el("imageObjectDialog"),imageObjectClose:el("imageObjectClose"),imageObjectSearch:el("imageObjectSearch"),imageObjectList:el("imageObjectList"),preview:el("preview"),previewTitle:el("previewTitle"),previewMeta:el("previewMeta"),previewBody:el("previewBody"),previewClose:el("previewClose"),exclusionsDialog:el("exclusionsDialog"),exclusionsClose:el("exclusionsClose"),exclusionsList:el("exclusionsList"),exclusionForm:el("exclusionForm"),exclusionPattern:el("exclusionPattern"),excludeBakPreset:el("excludeBakPreset"),excludeNppPreset:el("excludeNppPreset"),recentDialog:el("recentDialog"),recentClose:el("recentClose"),recentList:el("recentList"),exportDialog:el("exportDialog"),exportClose:el("exportClose"),exportPrintSection:el("exportPrintSection"),exportWorkspaceSection:el("exportWorkspaceSection"),exportOrientation:el("exportOrientation"),exportHidden:el("exportHidden"),exportSvgBtn:el("exportSvgBtn"),exportPngBtn:el("exportPngBtn"),exportPrintBtn:el("exportPrintBtn"),zipWorkspaceBtn:el("zipWorkspaceBtn"),materializeBtn:el("materializeBtn"),
  folderFallback:el("folderFallback"),resourcesPanel:el("resourcesPanel"),inspectorPanel:el("inspectorPanel"),showResourcesBtn:el("showResourcesBtn"),showInspectorBtn:el("showInspectorBtn"),collapseResourcesBtn:el("collapseResourcesBtn"),collapseInspectorBtn:el("collapseInspectorBtn"),restoreResourcesBtn:el("restoreResourcesBtn"),restoreInspectorBtn:el("restoreInspectorBtn")
};
const state={
  mode:"none",handle:null,fallbackFiles:new Map(),workspace:null,resources:[],views:[],view:null,selected:null,selectedVisual:null,selectedEdge:null,selectedFrame:null,linkSource:null,dirty:false,canWrite:false,search:"",saveTimer:null,treeExpanded:new Set(),draggedResource:null,styleClipboard:null,imageUrls:new Map(),panels:{left:false,right:false},scanTruncated:false
};
const FORMAT=1,APP="0.3.15",WS=".glom/workspace.json",RES=".glom/resources.json",VIEW_DIR=".glom/views",VIEW=".glom/views/main-mindmap.json",IGNORED=new Set([".glom",".git","node_modules"]);
const SCAN_MAX_ENTRIES=20000,SCAN_MAX_DEPTH=48,SCAN_YIELD_EVERY=250;
function uuid(){return crypto.randomUUID?crypto.randomUUID():"id-"+Date.now()+"-"+Math.random().toString(16).slice(2)}
function hash(s){let h=0x811c9dc5;for(let i=0;i<s.length;i++){h^=s.charCodeAt(i);h=Math.imul(h,0x01000193)}return(h>>>0).toString(36)}
function base(path){const p=(path||"").split("/");return p[p.length-1]||"Espace de travail"}
function setStatus(t,c){ui.status.textContent=t;ui.status.style.color=c==="bad"?"#b42318":c==="ok"?"#027a48":""}
function setButtonLabel(button,label){
  if(!button)return;
  const span=button.querySelector(".button-label");
  if(span)span.textContent=label;else button.textContent=label
}

function enhanceRangeInputs(){
  document.querySelectorAll(".range-row").forEach(row=>{
    const range=row.querySelector('input[type="range"]'),output=row.querySelector("output");
    if(!range||row.querySelector(".range-number"))return;
    const number=document.createElement("input");
    number.type="number";number.className="range-number";number.id=(range.id||"range")+"Direct";
    if(range.min!=="")number.min=range.min;if(range.max!=="")number.max=range.max;if(range.step!=="")number.step=range.step;
    number.value=range.value;number.setAttribute("aria-label","Valeur exacte");
    const unit=document.createElement("span");unit.className="range-unit";
    const raw=(output?.textContent||"").trim(),match=raw.match(/[a-zA-Z%]+$/);unit.textContent=match?match[0]:"";
    if(output)output.classList.add("range-output-native");
    row.append(number,unit);
    const syncFromRange=()=>{number.value=range.value};
    range.addEventListener("input",syncFromRange);range.addEventListener("change",syncFromRange);
    const commit=finalize=>{
      if(number.value==="")return;
      let value=Number(number.value);if(!Number.isFinite(value))return;
      const min=range.min===""?-Infinity:Number(range.min),max=range.max===""?Infinity:Number(range.max);
      value=Math.min(max,Math.max(min,value));range.value=String(value);
      range.dispatchEvent(new Event("input",{bubbles:true}));
      if(finalize)range.dispatchEvent(new Event("change",{bubbles:true}));
      number.value=range.value
    };
    number.addEventListener("input",()=>commit(false));
    number.addEventListener("change",()=>commit(true));
  })
}
function supportsFS(){return typeof window.showDirectoryPicker==="function"}
const WELCOME_ADOPTED_KEY="mindspark-welcome-adopted-v1";
function hasProductAdoption(){try{return localStorage.getItem(WELCOME_ADOPTED_KEY)==="1"}catch(e){return false}}
function markProductAdopted(){try{localStorage.setItem(WELCOME_ADOPTED_KEY,"1")}catch(e){}refreshWelcomeActions()}
async function refreshWelcomeActions(){
  if(ui.welcomeDemo)ui.welcomeDemo.classList.toggle("hidden",hasProductAdoption());
  if(!ui.welcomeRecent)return;
  let hasRecent=false;
  if(supportsFS()){
    try{const api=await getRecentApi(),rows=api?await api.listRecentWorkspaces():[];hasRecent=!!rows.length}catch(e){console.warn("Recent workspace availability check failed",e)}
  }
  ui.welcomeRecent.classList.toggle("hidden",!hasRecent)
}
let workspaceUiReady=false,workspaceRevealTimer=null;
function setWorkspaceNavigation(ok){
  [ui.insertionMenu,ui.viewMenu,ui.saveMenu].forEach(control=>control?.classList.toggle("hidden",!ok));
  if(!ok){workspaceUiReady=false;return}
  if(workspaceUiReady)return;
  workspaceUiReady=true;
  const revealed=[ui.insertionMenu,ui.viewMenu].filter(Boolean);
  revealed.forEach(control=>control.classList.add("newly-available"));
  clearTimeout(workspaceRevealTimer);
  workspaceRevealTimer=setTimeout(()=>revealed.forEach(control=>control.classList.remove("newly-available")),1800)
}

function setDirty(v=true){state.dirty=v;setStatus(v?"Modifications non enregistrées":"Enregistré",v?"":"ok");clearTimeout(state.saveTimer);if(v&&state.mode==="fs"&&state.canWrite)state.saveTimer=setTimeout(()=>save(true),800)}
function resource(id){return state.resources.find(r=>r.id===id)||null}
function node(id){return state.view&&state.view.nodes.find(n=>n.id===id)||null}
function nodeForResource(id){return state.view&&state.view.nodes.find(n=>n.resourceId===id)||null}
function selectedNode(){return node(state.selected)}
function selectedResource(){const n=selectedNode();return n?resource(n.resourceId):null}
function visualObject(id){return state.view&&(state.view.objects||[]).find(o=>o.id===id)||null}
function selectedVisualObject(){return visualObject(state.selectedVisual)}
function edge(id){return state.view&&(state.view.edges||[]).find(e=>e.id===id)||null}
function selectedEdgeObject(){return edge(state.selectedEdge)}
function defaultEdgeStyle(ed){return ed?.kind==="manual"?{color:"#3b82f6",width:2.2,lineStyle:"dashed",arrow:"none",curvature:42}:{color:"#94a3b8",width:2.2,lineStyle:"solid",arrow:"none",curvature:42}}
function effectiveEdgeStyle(ed){return Object.assign(defaultEdgeStyle(ed),ed&&ed.style||{})}
const PANEL_PREF_KEY="glom-ui-panels-v1";
function loadPanelPrefs(){
  try{const p=JSON.parse(localStorage.getItem(PANEL_PREF_KEY)||"{}");state.panels.left=!!p.left;state.panels.right=!!p.right}catch(e){}
}
function savePanelPrefs(){try{localStorage.setItem(PANEL_PREF_KEY,JSON.stringify(state.panels))}catch(e){}}
function applyPanelState(){
  if(!ui.shell)return;
  ui.shell.classList.toggle("left-collapsed",state.panels.left);
  ui.shell.classList.toggle("right-collapsed",state.panels.right);
  ui.restoreResourcesBtn.classList.toggle("hidden",!state.panels.left);
  ui.restoreInspectorBtn.classList.toggle("hidden",!state.panels.right);
  setButtonLabel(ui.toggleResourcesBtn,state.panels.left?"Afficher Ressources":"Masquer Ressources");
  setButtonLabel(ui.toggleInspectorBtn,state.panels.right?"Afficher Détails":"Masquer Détails");
  requestAnimationFrame(()=>transform())
}
function setPanelCollapsed(side,value){
  state.panels[side]=!!value;savePanelPrefs();applyPanelState()
}
function typeLabel(r){return({root:"Espace de travail",folder:"Dossier",file:"Fichier",virtual:"Idée",url:"Lien web"})[r&&r.type]||"Ressource"}
function icon(r){
  if(!r)return"❓";if(r.type==="root")return"🗺️";if(r.type==="folder")return"📁";if(r.type==="virtual")return"💡";if(r.type==="url")return"🔗";
  const e=(r.path||"").split(".").pop().toLowerCase();
  if(["png","jpg","jpeg","gif","webp","svg"].includes(e))return"🖼️";if(["mp3","wav","ogg","m4a","flac"].includes(e))return"🔊";if(["mp4","webm","mov"].includes(e))return"🎬";
  if(e==="pdf")return"📕";if(["md","txt","rtf"].includes(e))return"📝";if(["js","ts","py","html","css","json","yaml","yml"].includes(e))return"💻";if(["xls","xlsx","ods","csv"].includes(e))return"📊";return"📄"
}
const TYPE_COLORS={root:"#16a34a",folder:"#f59e0b",file:"#64748b",virtual:"#8b5cf6",url:"#0ea5e9"};
const FONT_STACKS={system:'Inter,ui-sans-serif,system-ui,-apple-system,"Segoe UI",sans-serif',rounded:'"Trebuchet MS","Arial Rounded MT Bold",ui-sans-serif,sans-serif',serif:'Georgia,"Times New Roman",serif',mono:'"Cascadia Code","SFMono-Regular",Consolas,monospace'};
function isImageResource(r){if(!r||r.type!=="file")return false;const e=(r.path||"").split(".").pop().toLowerCase();return["png","jpg","jpeg","gif","webp","svg","bmp","avif"].includes(e)}
function defaultNodeStyle(r){return{icon:"",fontSize:14,width:240,height:74,fontFamily:"system",fontWeight:"650",italic:false,textAlign:"left",textColor:"#172033",backgroundColor:"#ffffff",borderColor:TYPE_COLORS[r?.type]||"#d8deea",borderWidth:1,shape:"rounded",locked:false,moveBranch:false,showImage:false}}
function effectiveNodeStyle(n,r){return Object.assign(defaultNodeStyle(r),n&&n.style||{})}
function nodeBox(n){const r=n&&resource(n.resourceId),s=effectiveNodeStyle(n,r);return{w:Math.max(140,Number(s.width)||240),h:Math.max(60,Number(s.height)||74)}}
function edgeGeometry(a,b,curvature=42){
  const ab=nodeBox(a),bb=nodeBox(b),ac={x:a.x+ab.w/2,y:a.y+ab.h/2},bc={x:b.x+bb.w/2,y:b.y+bb.h/2},dx=bc.x-ac.x,dy=bc.y-ac.y,c=Math.max(0,Math.min(100,Number(curvature)||0));
  const vertical=Math.abs(dy)>Math.abs(dx)*1.15;
  if(vertical){
    const dir=dy>=0?1:-1,sx=ac.x,sy=dy>=0?a.y+ab.h:a.y,tx=bc.x,ty=dy>=0?b.y:b.y+bb.h,gap=Math.abs(ty-sy),bend=c?Math.max(18,gap*(c/100)):0;
    return{sx,sy,tx,ty,mx:(sx+tx)/2,my:(sy+ty)/2,d:c?"M "+sx+" "+sy+" C "+sx+" "+(sy+dir*bend)+", "+tx+" "+(ty-dir*bend)+", "+tx+" "+ty:"M "+sx+" "+sy+" L "+tx+" "+ty,axis:"vertical"}
  }
  const dir=dx>=0?1:-1,sx=dx>=0?a.x+ab.w:a.x,sy=ac.y,tx=dx>=0?b.x:b.x+bb.w,ty=bc.y,gap=Math.abs(tx-sx),bend=c?Math.max(18,gap*(c/100)):0;
  return{sx,sy,tx,ty,mx:(sx+tx)/2,my:(sy+ty)/2,d:c?"M "+sx+" "+sy+" C "+(sx+dir*bend)+" "+sy+", "+(tx-dir*bend)+" "+ty+", "+tx+" "+ty:"M "+sx+" "+sy+" L "+tx+" "+ty,axis:"horizontal"}
}
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
function newWorkspace(name){const now=new Date().toISOString();return{format:"glom-workspace",version:FORMAT,appVersion:APP,id:uuid(),name:name||"Nouvel espace de travail",createdAt:now,updatedAt:now,defaultView:"views/main-mindmap.json",excludes:[]}}
function parentPath(path){if(!path||!path.includes("/"))return"";return path.slice(0,path.lastIndexOf("/"))}
function normalizeExcludePattern(raw){return String(raw||"").trim().replace(/\\/g,"/").replace(/^\.\//,"").replace(/^\/+|\/+$/g,"")}
function globRegex(pattern){
  const p=normalizeExcludePattern(pattern);let out="";
  for(let i=0;i<p.length;i++){
    const ch=p[i];
    if(ch==="*"&&p[i+1]==="*"){out+=".*";i++;continue}
    if(ch==="*"){out+="[^/]*";continue}
    if(ch==="?"){out+="[^/]";continue}
    if("\\.^$+()[]{}|".includes(ch))out+="\\"+ch;else out+=ch
  }
  const prefix=p.includes("/")?"^":"(?:^|.*/)";
  return new RegExp(prefix+out+"(?:$|/.*$)","i")
}
function exclusionPatterns(workspace=state.workspace){return Array.isArray(workspace?.excludes)?workspace.excludes.map(normalizeExcludePattern).filter(Boolean):[]}
function pathExcluded(path,workspace=state.workspace){
  if(!path)return false;const p=String(path).replace(/\\/g,"/");
  return exclusionPatterns(workspace).some(rule=>{if(rule.endsWith("/**")){const base=rule.slice(0,-3).replace(/\/$/,"");if(p===base||p.startsWith(base+"/"))return true}if(!/[?*]/.test(rule))return p===rule||p.startsWith(rule+"/");try{return globRegex(rule).test(p)}catch{return false}})
}
function markExclusions(resources,workspace=state.workspace){resources.forEach(r=>{r.excluded=!!(r.path&&pathExcluded(r.path,workspace))});return resources}
function parentOf(r,list){
  if(!r||["root","virtual","url"].includes(r.type))return null;
  const p=parentPath(r.path);if(!p)return list.find(x=>x.type==="root")||null;
  return list.find(x=>x.type==="folder"&&x.path===p)||list.find(x=>x.type==="root")||null
}
function applyFolderSizes(list){
  const files=list.filter(r=>r.type==="file"&&!r.missing&&!r.excluded&&Number.isFinite(r.size));
  list.forEach(r=>{
    if(r.type==="root")r.size=files.reduce((s,f)=>s+f.size,0);
    else if(r.type==="folder"){const p=r.path+"/";r.size=files.reduce((s,f)=>s+(f.path.startsWith(p)?f.size:0),0)}
  });
  return list
}
function reconcile(workspace,entries,old=[]){
  const oldMap=new Map();old.forEach(r=>{if(["root","folder","file"].includes(r.type))oldMap.set(r.type+":"+(r.path||""),r)});
  const rootOld=oldMap.get("root:");const out=[{id:rootOld&&rootOld.id||"root-"+workspace.id,type:"root",path:"",title:rootOld&&rootOld.title||workspace.name,tags:rootOld&&rootOld.tags||[],notes:rootOld&&rootOld.notes||"",missing:false,excluded:false,size:0,lastModified:null}];
  const seen=new Set(["root:"]);
  entries.forEach(e=>{const k=e.type+":"+e.path,o=oldMap.get(k);out.push({id:o&&o.id||"r-"+hash(k),type:e.type,path:e.path,title:o&&o.title||e.name||base(e.path),tags:o&&o.tags||[],notes:o&&o.notes||"",missing:false,excluded:pathExcluded(e.path,workspace),size:Number.isFinite(e.size)?e.size:(o&&Number.isFinite(o.size)?o.size:null),lastModified:e.lastModified??o?.lastModified??null});seen.add(k)});
  old.forEach(o=>{
    if(["virtual","url"].includes(o.type))out.push(Object.assign({},o,{missing:false,excluded:false}));
    else{const k=o.type+":"+(o.path||"");if(o.type!=="root"&&!seen.has(k)){const excluded=pathExcluded(o.path,workspace);out.push(Object.assign({},o,{excluded,missing:excluded?false:true}))}}
  });
  return applyFolderSizes(markExclusions(out,workspace))
}
function layout(resources){
  const root=resources.find(r=>r.type==="root"),pos=new Map();if(!root)return pos;
  const active=resources.filter(r=>!r.missing&&!r.excluded&&!["virtual","url"].includes(r.type)),children=new Map();active.forEach(r=>children.set(r.id,[]));
  active.forEach(r=>{if(r.id===root.id)return;const p=parentOf(r,active);if(p&&children.has(p.id))children.get(p.id).push(r)});
  children.forEach(a=>a.sort((x,y)=>x.type!==y.type?(x.type==="folder"?-1:1):x.title.localeCompare(y.title,undefined,{numeric:true})));
  let leaf=0;function place(r,d){const c=children.get(r.id)||[];let y;if(!c.length)y=130+leaf++*112;else{const ys=c.map(x=>place(x,d+1));y=ys.reduce((a,b)=>a+b,0)/ys.length}pos.set(r.id,{x:120+d*330,y:y});return y}place(root,0);return pos
}
function freshView(resources,meta={}){
  const visible=resources.filter(r=>!r.excluded),p=layout(resources),nodes=resources.map((r,i)=>({id:"n-"+r.id,resourceId:r.id,x:p.get(r.id)?p.get(r.id).x:200+(i%5)*280,y:p.get(r.id)?p.get(r.id).y:160+Math.floor(i/5)*115,collapsed:false,style:{}})),edges=[];
  visible.forEach(r=>{const par=parentOf(r,visible);if(par&&!r.missing&&!par.excluded)edges.push({id:"h-"+par.id+"-"+r.id,from:"n-"+par.id,to:"n-"+r.id,kind:"hierarchy"})});
  const now=new Date().toISOString();return{format:"glom-view",version:FORMAT,id:meta.id||"main-mindmap",type:"mindmap",name:meta.name||"Carte principale",createdAt:now,updatedAt:now,pan:{x:40,y:40},zoom:.92,nodes:nodes,edges:edges,frames:[],objects:[]}
}
function descendantIdsFromEdges(rootId,edges){
  const byParent=new Map();(edges||[]).filter(e=>e.kind==="hierarchy").forEach(e=>{if(!byParent.has(e.from))byParent.set(e.from,[]);byParent.get(e.from).push(e.to)});
  const out=[rootId],seen=new Set(out),stack=[rootId];while(stack.length){const id=stack.pop();for(const ch of byParent.get(id)||[]){if(!seen.has(ch)){seen.add(ch);out.push(ch);stack.push(ch)}}}return out
}
function normalizeFrame(frame,ids,edges){
  if(!frame||!ids.has(frame.rootNodeId))return null;
  const raw=Array.isArray(frame.memberNodeIds)?frame.memberNodeIds:descendantIdsFromEdges(frame.rootNodeId,edges),members=[...new Set(raw.filter(id=>ids.has(id)))];
  if(!members.includes(frame.rootNodeId))members.unshift(frame.rootNodeId);
  return Object.assign({},frame,{memberNodeIds:members,locked:!!frame.locked})
}
function mergeView(view,resources){
  if(!view||view.type!=="mindmap")return freshView(resources);
  const visible=resources.filter(r=>!r.excluded),auto=freshView(resources),old=new Map((view.nodes||[]).map(n=>[n.resourceId,n])),fallback=new Map(auto.nodes.map(n=>[n.resourceId,n])),nodes=resources.map(r=>{
    const n=Object.assign({},old.get(r.id)||fallback.get(r.id));n.style=Object.assign({},n.style||{});return n
  });
  const ids=new Set(nodes.map(n=>n.id)),oldEdges=new Map((view.edges||[]).map(e=>[e.id,e])),hierarchy=auto.edges.map(e=>{const prev=oldEdges.get(e.id);return prev?Object.assign({},e,{label:prev.label||"",style:Object.assign({},prev.style||{})}):e}),manual=(view.edges||[]).filter(e=>e.kind==="manual"&&ids.has(e.from)&&ids.has(e.to)),frames=(view.frames||[]).map(f=>normalizeFrame(f,ids,view.edges||[])).filter(Boolean),objects=Array.isArray(view.objects)?view.objects:[];
  return Object.assign({},view,{version:FORMAT,nodes,edges:hierarchy.concat(manual),frames,objects,updatedAt:new Date().toISOString()})
}
function workspaceViewRef(v){return"views/"+(v?.id||"main-mindmap")+".json"}
function viewPath(v){return VIEW_DIR+"/"+(v?.id||"main-mindmap")+".json"}
function viewIdFromRef(ref){const p=String(ref||"").replace(/\\/g,"/").split("/").pop()||"";return p.replace(/\.json$/i,"")}
function allViews(){return state.views.length?state.views:(state.view?[state.view]:[])}
function uniqueViewName(baseName){
  const base=(baseName||"Nouvelle carte").trim()||"Nouvelle carte",names=new Set(allViews().map(v=>(v.name||"").toLowerCase()));if(!names.has(base.toLowerCase()))return base;
  let i=2;while(names.has((base+" "+i).toLowerCase()))i++;return base+" "+i
}
function renderViewSelector(){
  if(!ui.viewSelect)return;ui.viewSelect.replaceChildren();for(const v of allViews()){const o=document.createElement("option");o.value=v.id;o.textContent=v.name||v.id;o.selected=v===state.view||v.id===state.view?.id;ui.viewSelect.append(o)}
  const ok=!!state.view;ui.viewSelect.disabled=!ok;ui.newViewBtn.disabled=!state.workspace;ui.duplicateViewBtn.disabled=!ok;ui.renameViewBtn.disabled=!ok
}
function activateView(id,{markDirty=true}={}){
  const v=allViews().find(x=>x.id===id);if(!v||v===state.view){renderViewSelector();return}
  state.view=v;state.workspace.defaultView=workspaceViewRef(v);state.selected=null;state.selectedVisual=null;state.selectedEdge=null;state.linkSource=null;ui.hint.textContent="Glisser le fond pour déplacer la vue";renderViewSelector();render();transform();if(markDirty)setDirty(true)
}
function createView(){
  if(!state.workspace)return;const raw=prompt("Nom de la nouvelle carte :",uniqueViewName("Nouvelle carte"));if(raw===null)return;
  const name=uniqueViewName(raw),v=freshView(state.resources,{id:"mindmap-"+uuid(),name});state.views.push(v);state.view=v;state.workspace.defaultView=workspaceViewRef(v);state.selected=null;state.selectedVisual=null;state.selectedEdge=null;state.linkSource=null;renderViewSelector();render();fit();setDirty(true);setStatus("Carte « "+name+" » créée","ok")
}
function duplicateView(){
  if(!state.view)return;const suggested=uniqueViewName((state.view.name||"Carte")+" — copie"),raw=prompt("Nom de la copie :",suggested);if(raw===null)return;
  const now=new Date().toISOString(),name=uniqueViewName(raw),v=typeof structuredClone==="function"?structuredClone(state.view):JSON.parse(JSON.stringify(state.view));v.id="mindmap-"+uuid();v.name=name;v.createdAt=now;v.updatedAt=now;
  state.views.push(v);state.view=v;state.workspace.defaultView=workspaceViewRef(v);state.selected=null;state.selectedVisual=null;state.selectedEdge=null;state.linkSource=null;renderViewSelector();render();transform();setDirty(true);setStatus("Carte dupliquée","ok")
}
function renameView(){
  if(!state.view)return;const raw=prompt("Nom de la carte :",state.view.name||"Carte");if(raw===null)return;const name=(raw||"").trim();if(!name)return;
  state.view.name=name;state.view.updatedAt=new Date().toISOString();renderViewSelector();setDirty(true);setStatus("Carte renommée","ok")
}
async function readMindmapViews(root){
  const out=[];try{const dir=await dirByParts(root,VIEW_DIR.split("/").filter(Boolean),false);for await(const [name,h] of dir.entries()){if(h.kind!=="file"||!name.toLowerCase().endsWith(".json"))continue;try{const f=await h.getFile(),v=JSON.parse(await f.text());if(v&&v.type==="mindmap"){if(!v.id)v.id=name.replace(/\.json$/i,"");out.push(v)}}catch(e){console.warn("Vue MindSpark ignorée",name,e)}}}catch(e){if(e&&e.name!=="NotFoundError")console.warn(e)}
  return out.sort((a,b)=>a.id==="main-mindmap"?-1:b.id==="main-mindmap"?1:(a.name||a.id).localeCompare(b.name||b.id,undefined,{numeric:true}))
}
function prepareViews(workspace,rawViews,resources){
  const src=(rawViews||[]).filter(v=>v&&v.type==="mindmap"),views=(src.length?src:[freshView(resources)]).map(v=>mergeView(v,resources));const wanted=viewIdFromRef(workspace.defaultView),active=views.find(v=>v.id===wanted)||views[0];workspace.defaultView=workspaceViewRef(active);return{views,active}
}
async function dirByParts(root,parts,create){let d=root;for(const part of parts){if(part)d=await d.getDirectoryHandle(part,{create:!!create})}return d}
async function readJson(root,path){try{const parts=path.split("/").filter(Boolean),name=parts.pop(),d=await dirByParts(root,parts,false),h=await d.getFileHandle(name),f=await h.getFile();return JSON.parse(await f.text())}catch(e){if(e&&e.name!=="NotFoundError")console.warn(e);return null}}
async function writeJson(root,path,obj){const parts=path.split("/").filter(Boolean),name=parts.pop(),d=await dirByParts(root,parts,true),h=await d.getFileHandle(name,{create:true}),w=await h.createWritable();await w.write(JSON.stringify(obj,null,2)+"\n");await w.close()}
async function scan(root,workspace=null){
  const entries=[];let truncated=false,reason="",visited=0,lastProgress=0;
  async function yieldProgress(path){
    if(entries.length-lastProgress<SCAN_YIELD_EVERY)return;
    lastProgress=entries.length;setStatus("Scan… "+new Intl.NumberFormat("fr-BE").format(entries.length)+" éléments"+(path?" · "+path:""));
    await new Promise(resolve=>setTimeout(resolve,0))
  }
  async function walk(d,b,depth){
    if(depth>SCAN_MAX_DEPTH){truncated=true;reason="profondeur";return}
    if(entries.length>=SCAN_MAX_ENTRIES){truncated=true;reason="volume";return}
    const arr=[];for await(const pair of d.entries()){if(!IGNORED.has(pair[0]))arr.push(pair)}
    arr.sort((a,b)=>a[1].kind!==b[1].kind?(a[1].kind==="directory"?-1:1):a[0].localeCompare(b[0],undefined,{numeric:true}));
    for(const pair of arr){
      if(entries.length>=SCAN_MAX_ENTRIES){truncated=true;reason="volume";return}
      const path=b?b+"/"+pair[0]:pair[0];if(pathExcluded(path,workspace))continue;visited++;
      if(pair[1].kind==="directory"){entries.push({type:"folder",path,name:pair[0],size:null,lastModified:null});await yieldProgress(path);await walk(pair[1],path,depth+1)}
      else{const file=await pair[1].getFile();entries.push({type:"file",path,name:pair[0],size:file.size,lastModified:file.lastModified});await yieldProgress(path)}
    }
  }
  await walk(root,"",0);return{entries,truncated,reason,visited,limit:SCAN_MAX_ENTRIES,maxDepth:SCAN_MAX_DEPTH}
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
function fallbackScan(files,workspace=null){
  const map=new Map(),fileMap=new Map();let rootName="Workspace importé";
  Array.from(files||[]).forEach(f=>{let parts=(f.webkitRelativePath||f.name).split("/").filter(Boolean);if(parts.length>1){rootName=parts[0]||rootName;parts.shift()}if([".glom",".git","node_modules"].includes(parts[0]))return;const rel=parts.join("/");if(!rel||pathExcluded(rel,workspace))return;for(let i=1;i<parts.length;i++){const p=parts.slice(0,i).join("/");if(pathExcluded(p,workspace))return;if(!map.has("folder:"+p))map.set("folder:"+p,{type:"folder",path:p,name:parts[i-1]})}map.set("file:"+rel,{type:"file",path:rel,name:parts[parts.length-1],size:f.size,lastModified:f.lastModified});fileMap.set(rel,f)});
  return{entries:Array.from(map.values()),files:fileMap,rootName:rootName}
}
function normalizeFallback(raw){const p=raw.split("/").filter(Boolean);if(p.length>1)p.shift();return p.join("/")}
async function fallbackMetadata(files){
  const o={views:[]};for(const f of Array.from(files||[])){const rel=normalizeFallback(f.webkitRelativePath||f.name);try{if(rel===WS)o.workspace=JSON.parse(await f.text());else if(rel===RES)o.resources=JSON.parse(await f.text());else if(rel.startsWith(VIEW_DIR+"/")&&rel.toLowerCase().endsWith(".json")){const v=JSON.parse(await f.text());if(v&&v.type==="mindmap"){if(!v.id)v.id=rel.split("/").pop().replace(/\.json$/i,"");o.views.push(v)}}}catch(e){}}
  return o
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
function safeFileName(s,ext){
  let cleaned=String(s||"").replace(/[<>:"/\\|?*\u0000-\u001F]/g,"-").replace(/[. ]+$/g,"").trim();
  if(!cleaned)cleaned=ext==="md"?"Notes.md":"Notes.txt";
  if(ext&&!cleaned.toLowerCase().endsWith("."+ext))cleaned+="."+ext;
  return cleaned
}
function workspaceRoot(){return state.resources.find(r=>r.type==="root")||null}
function workspaceMetadataSnapshot(){
  const now=new Date().toISOString(),views=allViews().map(v=>({...v,updatedAt:now})),active=views.find(v=>v.id===state.view?.id)||views[0],workspace={...state.workspace,updatedAt:now,appVersion:APP,defaultView:workspaceViewRef(active)};
  const resources={format:"glom-resources",version:1,workspaceId:workspace.id,updatedAt:now,resources:state.resources};
  return{workspace,resources,views,view:active}
}
function newDraftWorkspace(){
  const raw=prompt("Nom du nouvel espace de travail :","Nouvel espace de travail");if(raw===null)return;
  const name=(raw||"").trim()||"Nouvel espace de travail";clearNodeImageCache();
  const w=newWorkspace(name),root={id:"root-"+w.id,type:"root",path:"",title:name,tags:[],notes:"",missing:false,size:0,lastModified:null},r=[root],v=freshView(r);
  Object.assign(state,{mode:"draft",handle:null,fallbackFiles:new Map(),workspace:w,resources:r,views:[v],view:v,selected:v.nodes[0]?.id||null,selectedVisual:null,selectedEdge:null,linkSource:null,canWrite:false,dirty:true,scanTruncated:false});
  initTreeExpansion();show();fit();markProductAdopted();setStatus("Espace de travail brouillon — créez des dossiers puis exportez ou matérialisez-le","ok")
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
  const n={id:"n-"+r.id,resourceId:r.id,x:(parentNode?.x||120)+330,y:(parentNode?.y||130)+siblings*112,collapsed:false,style:{}};
  state.resources.push(r);state.view.nodes.push(n);
  if(parentNode)state.view.edges.push({id:"h-"+parent.id+"-"+r.id,from:parentNode.id,to:n.id,kind:"hierarchy"});
  state.treeExpanded.add(parent.id);state.treeExpanded.add(r.id);state.selected=n.id;state.selectedEdge=null;setDirty(true);render();setStatus("Dossier créé","ok")
}
function insertionParent(){
  const selected=selectedResource();
  return(selected&&["root","folder"].includes(selected.type)?selected:(selected?parentOf(selected,state.resources):null))||workspaceRoot()
}
async function writeTextFileAtPath(path,text,create){
  const parts=path.split("/").filter(Boolean),name=parts.pop(),dir=await dirByParts(state.handle,parts,false),handle=await dir.getFileHandle(name,{create:!!create}),writer=await handle.createWritable();
  await writer.write(String(text??""));await writer.close();return handle.getFile()
}
async function saveTextResource(r,text){
  if(state.mode!=="fs"||!state.handle||!r||r.type!=="file")throw new Error("Ce fichier n’est pas éditable dans ce mode.");
  if(!(await ensureWritePermission()))throw new Error("Autorisation d’écriture refusée.");
  const file=await writeTextFileAtPath(r.path,text,false);r.size=file.size;r.lastModified=file.lastModified;r.missing=false;setDirty(true);applyFolderSizes(state.resources);renderTree();renderInspector();await save(true);setStatus("Fichier enregistré","ok");
  return{size:file.size,lastModified:file.lastModified}
}
async function addLocalTextFile(ext){
  if(state.mode!=="fs"||!state.handle){alert("La création directe de fichiers nécessite un workspace local ouvert.");return}
  if(!(await ensureWritePermission()))return;const parent=insertionParent();if(!parent)return;
  const raw=prompt(ext==="md"?"Nom du fichier Markdown :":"Nom du fichier texte :",ext==="md"?"Notes.md":"Notes.txt");if(raw===null)return;
  const name=safeFileName(raw,ext),path=parent.path?parent.path+"/"+name:name;if(pathExcluded(path)){alert("Ce chemin correspond à une règle d’exclusion du workspace.");return}
  const dir=await dirByParts(state.handle,(parent.path||"").split("/").filter(Boolean),false);
  if(await entryExists(dir,name)){alert("Un fichier ou dossier nommé « "+name+" » existe déjà à cet emplacement.");return}
  let file;try{file=await writeTextFileAtPath(path,"",true)}catch(e){console.error(e);alert("Impossible de créer le fichier : "+(e.message||e));return}
  const r={id:"r-"+hash("file:"+path),type:"file",path,title:name,tags:[],notes:"",missing:false,excluded:false,size:file.size,lastModified:file.lastModified},parentNode=nodeForResource(parent.id);
  const siblings=physicalChildrenOf(parent).length,n={id:"n-"+r.id,resourceId:r.id,x:(parentNode?.x||120)+330,y:(parentNode?.y||130)+siblings*112,collapsed:false,style:{}};
  state.resources.push(r);state.view.nodes.push(n);if(parentNode)state.view.edges.push({id:"h-"+parent.id+"-"+r.id,from:parentNode.id,to:n.id,kind:"hierarchy"});
  state.treeExpanded.add(parent.id);state.selected=n.id;state.selectedEdge=null;applyFolderSizes(state.resources);setDirty(true);render();await save(true);setStatus("Fichier "+name+" créé","ok");await openResource(r)
}
async function openWorkspace(){
  try{if(!supportsFS()){ui.folderFallback.click();return}const h=await window.showDirectoryPicker({mode:"readwrite"});await loadHandle(h,true)}catch(e){if(e&&e.name==="AbortError")return;alert("Impossible d'ouvrir ce dossier : "+(e.message||e))}
}
async function loadHandle(h,user){
  clearNodeImageCache();setStatus("Lecture du workspace…");const w0=await readJson(h,WS),w=w0&&w0.format==="glom-workspace"?w0:newWorkspace(h.name);if(!Array.isArray(w.excludes))w.excludes=[];const s=await scan(h,w),r0=await readJson(h,RES),rawViews=await readMindmapViews(h),r=reconcile(w,s.entries,r0&&Array.isArray(r0.resources)?r0.resources:[]),prepared=prepareViews(w,rawViews,r),can=await permission(h,user);
  Object.assign(state,{mode:"fs",handle:h,fallbackFiles:new Map(),workspace:w,resources:r,views:prepared.views,view:prepared.active,selected:null,selectedVisual:null,selectedEdge:null,linkSource:null,canWrite:can,dirty:!w0||!r0||!rawViews.length,scanTruncated:s.truncated});initTreeExpansion();
  try{localStorage.setItem("glom-last-name",h.name)}catch(e){}show();fit();markProductAdopted();if(s.truncated){setDirty(false);setStatus("Scan partiel : limite "+(s.reason==="profondeur"?"de profondeur ("+s.maxDepth+")":"de volume ("+new Intl.NumberFormat("fr-BE").format(s.limit)+" éléments)")+" atteinte. Rien n’a été réécrit dans .glom ; utilisez les exclusions puis rescanner.","bad")}else if(state.dirty&&can)await save(true);else if(state.dirty)setStatus("Lecture seule — export disponible");else setDirty(false);
  rememberRecentWorkspace(h,w)
}
async function loadFallback(files){
  if(!files||!files.length)return;clearNodeImageCache();setStatus("Import du dossier…");const m=await fallbackMetadata(files),provisional=m.workspace&&m.workspace.format==="glom-workspace"?m.workspace:newWorkspace("Workspace importé");if(!Array.isArray(provisional.excludes))provisional.excludes=[];const s=fallbackScan(files,provisional),w=m.workspace&&m.workspace.format==="glom-workspace"?provisional:Object.assign(provisional,{name:s.rootName}),r=reconcile(w,s.entries,m.resources&&Array.isArray(m.resources.resources)?m.resources.resources:[]),prepared=prepareViews(w,m.views,r);
  Object.assign(state,{mode:"fallback",handle:null,fallbackFiles:s.files,workspace:w,resources:r,views:prepared.views,view:prepared.active,selected:null,selectedVisual:null,selectedEdge:null,linkSource:null,canWrite:false,dirty:false,scanTruncated:false});initTreeExpansion();show();fit();markProductAdopted();setStatus("Mode compatibilité — export manuel")
}
function demo(){
  clearNodeImageCache();const w=newWorkspace("Chef-d'œuvre — Les jeux vidéo");w.id="demo-marjolaine";const raw=[["folder","Histoire"],["folder","Histoire/Premiers jeux"],["file","Histoire/Premiers jeux/Tennis for Two.pdf"],["file","Histoire/Premiers jeux/Spacewar-notes.md"],["folder","Game design"],["file","Game design/Fiche de concept.md"],["folder","Level design"],["file","Level design/Plan niveau 1.png"],["folder","Mon jeu"],["folder","Mon jeu/Sprites"],["file","Mon jeu/Sprites/personnage.png"],["folder","Sources"],["file","Sources/Bibliographie.md"]].map(x=>({type:x[0],path:x[1],name:base(x[1])}));
  const r=reconcile(w,raw,[]),idea={id:"v-"+uuid(),type:"virtual",title:"💡 Pourquoi un jeu est-il amusant ?",tags:["question"],notes:"À relier au game design et aux playtests."},url={id:"u-"+uuid(),type:"url",title:"Brookhaven — Tennis for Two",url:"https://www.bnl.gov/about/history/firstvideo.php",tags:["source"],notes:""};r.push(idea,url);const v=freshView(r);const ni=nodeFrom(v,idea.id),nu=nodeFrom(v,url.id);if(ni){ni.x=1000;ni.y=680}if(nu){nu.x=1300;nu.y=220}const gd=r.find(x=>x.path==="Game design"),tf=r.find(x=>x.path&&x.path.includes("Tennis for Two"));if(gd&&ni)v.edges.push({id:"m-"+uuid(),from:"n-"+gd.id,to:ni.id,kind:"manual"});if(tf&&nu)v.edges.push({id:"m-"+uuid(),from:"n-"+tf.id,to:nu.id,kind:"manual"});
  Object.assign(state,{mode:"demo",handle:null,fallbackFiles:new Map(),workspace:w,resources:r,views:[v],view:v,selected:null,selectedVisual:null,selectedEdge:null,linkSource:null,canWrite:false,dirty:false,scanTruncated:false});initTreeExpansion();show();fit();setStatus("Démo locale")
}
function nodeFrom(v,rid){return v.nodes.find(n=>n.resourceId===rid)}
function applyCurrentExclusions(){
  if(!state.workspace)return;markExclusions(state.resources,state.workspace);applyFolderSizes(state.resources);render();setDirty(true)
}
function addExclusionRule(raw){
  if(!state.workspace)return false;const rule=normalizeExcludePattern(raw);if(!rule)return false;
  state.workspace.excludes=exclusionPatterns(state.workspace);if(state.workspace.excludes.some(x=>x.toLowerCase()===rule.toLowerCase()))return false;
  state.workspace.excludes.push(rule);applyCurrentExclusions();return true
}
async function removeExclusionRule(rule){
  if(!state.workspace)return;state.workspace.excludes=exclusionPatterns(state.workspace).filter(x=>x!==rule);setDirty(true);
  if(state.mode==="fs")await rescan();
  else{markExclusions(state.resources,state.workspace);render();if(state.mode==="fallback")setStatus("Exclusion retirée — réimportez le dossier si une ressource manque","ok")}
  renderExclusionsList()
}
function renderExclusionsList(){
  if(!ui.exclusionsList)return;ui.exclusionsList.replaceChildren();const rules=exclusionPatterns();
  if(!rules.length){const p=document.createElement("p");p.className="recent-empty";p.textContent="Aucune exclusion. Les fichiers et dossiers du workspace sont tous visibles.";ui.exclusionsList.append(p);return}
  rules.forEach(rule=>{
    const row=document.createElement("div");row.className="exclusion-item";const code=document.createElement("code");code.textContent=rule;
    const del=document.createElement("button");del.type="button";del.textContent="Réactiver";del.onclick=()=>removeExclusionRule(rule);row.append(code,del);ui.exclusionsList.append(row)
  })
}
function openExclusionsDialog(){if(!state.workspace)return;renderExclusionsList();ui.exclusionPattern.value="";if(!ui.exclusionsDialog.open)ui.exclusionsDialog.showModal()}
function excludeSelectedResource(){
  const r=selectedResource();if(!r||!["file","folder"].includes(r.type)||!r.path)return;
  const kind=r.type==="folder"?"dossier":"fichier";
  if(!confirm("Exclure ce "+kind+" du workspace ?\n\n"+r.path+"\n\nLe contenu reste intact sur le disque."))return;
  if(addExclusionRule(r.path)){state.selected=null;render();setStatus("Ressource exclue du workspace","ok")}
}
async function rescan(){
  if(state.mode==="fallback"){ui.folderFallback.click();return}if(state.mode!=="fs"||!state.handle)return;
  setStatus("Rescan…");const activeId=state.view?.id,s=await scan(state.handle,state.workspace);state.resources=reconcile(state.workspace,s.entries,state.resources);state.views=allViews().map(v=>mergeView(v,state.resources));state.view=state.views.find(v=>v.id===activeId)||state.views[0];state.scanTruncated=s.truncated;renderViewSelector();render();
  if(s.truncated){setDirty(false);setStatus("Scan partiel : garde-fou atteint. Rien n’a été réécrit dans .glom ; ajoutez des exclusions puis rescanner.","bad")}
  else{setDirty(true);setStatus("Rescan terminé — "+new Intl.NumberFormat("fr-BE").format(s.entries.length)+" éléments","ok")}
}
async function save(quiet){
  if(!state.workspace||!state.view)return;if(state.mode==="fs"&&state.scanTruncated){setStatus("Enregistrement .glom bloqué : le scan est partiel. Réduisez le workspace avec des exclusions puis rescanner.","bad");return}clearTimeout(state.saveTimer);const now=new Date().toISOString();state.workspace.updatedAt=now;state.workspace.defaultView=workspaceViewRef(state.view);for(const v of allViews())v.updatedAt=now;const rp={format:"glom-resources",version:1,workspaceId:state.workspace.id,updatedAt:now,resources:state.resources};
  if(state.mode==="fs"&&state.handle&&state.canWrite){try{if(!quiet)setStatus("Enregistrement…");await Promise.all([writeJson(state.handle,WS,state.workspace),writeJson(state.handle,RES,rp),...allViews().map(v=>writeJson(state.handle,viewPath(v),v))]);setDirty(false);return}catch(e){state.canWrite=false;setStatus("Écriture impossible — export manuel","bad");if(!quiet)alert("Impossible d'écrire dans .glom : "+(e.message||e))}}
  const views=Object.fromEntries(allViews().map(v=>[v.id,v])),exp={format:"glom-portable-export",version:1,appVersion:APP,exportedAt:new Date().toISOString(),workspace:state.workspace,resources:rp,views};download(safeName(state.workspace.name)+".glom.json",exp);if(!quiet)setStatus("Export JSON téléchargé","ok")
}
function updateActionStates(){
  const ok=!!(state.workspace&&state.view),r=selectedResource(),n=selectedNode(),folderSelected=!!(r&&["root","folder"].includes(r.type)),hasSelection=!!(r&&n),hasChildren=!!(n&&children(n.id).length),hasFrame=!!(n&&frameForNode(n.id)),canCreateLocalText=ok&&state.mode==="fs";
  if(ui.mapFolderBtn)ui.mapFolderBtn.disabled=!ok||state.mode==="fallback";
  if(ui.mapIdeaBtn)ui.mapIdeaBtn.disabled=!ok;if(ui.textFileBtn)ui.textFileBtn.disabled=!canCreateLocalText;if(ui.markdownFileBtn)ui.markdownFileBtn.disabled=!canCreateLocalText;
  if(ui.mapRelationBtn){ui.mapRelationBtn.disabled=!hasSelection;ui.mapRelationBtn.classList.toggle("active",!!state.linkSource)}
  if(ui.mapFrameBtn){ui.mapFrameBtn.disabled=!hasSelection||(!hasChildren&&!hasFrame);ui.mapFrameBtn.classList.toggle("active",hasFrame)}
  if(ui.mapSelectBtn)ui.mapSelectBtn.classList.toggle("active",!state.linkSource);
  if(ui.contextActionsSection)ui.contextActionsSection.classList.toggle("hidden",!hasSelection);
  if(ui.contextFolderBtn)ui.contextFolderBtn.disabled=!folderSelected||state.mode==="fallback";
  if(ui.contextIdeaBtn)ui.contextIdeaBtn.disabled=!hasSelection;
  if(ui.contextRelationBtn){ui.contextRelationBtn.disabled=!hasSelection;setButtonLabel(ui.contextRelationBtn,state.linkSource===n?.id?"Annuler relation":"Relation")}
  if(ui.contextFrameBtn){ui.contextFrameBtn.disabled=!hasSelection||(!hasChildren&&!hasFrame);setButtonLabel(ui.contextFrameBtn,hasFrame?"Retirer le cadre":"Cadre de branche")}if(ui.contextExcludeBtn)ui.contextExcludeBtn.disabled=!hasSelection||!["file","folder"].includes(r?.type)
}
function show(){
  const ok=!!(state.workspace&&state.view);ui.welcome.classList.toggle("hidden",ok);ui.viewport.classList.toggle("hidden",!ok);ui.stageTools.classList.toggle("hidden",!ok);ui.workspaceName.textContent=ok?state.workspace.name:"Aucun espace de travail ouvert";const visibleCount=state.resources.filter(r=>!r.excluded).length;ui.count.textContent=visibleCount+" élément"+(visibleCount>1?"s":"");ui.compat.classList.toggle("hidden",state.mode!=="fallback");setWorkspaceNavigation(ok);renderViewSelector();const canSaveDirect=ok&&state.mode==="fs"&&state.canWrite&&!state.scanTruncated;ui.saveNowBtn.disabled=!canSaveDirect;ui.saveNowBtn.title=canSaveDirect?"Enregistrer les métadonnées dans .glom":"Enregistrement direct indisponible — utilisez Exporter";ui.saveExportBtn.disabled=!ok;
  [ui.scanBtn,ui.exclusionsBtn,ui.exportBtn,ui.folderBtn,ui.ideaBtn,ui.urlBtn,ui.fitBtn,ui.autoLayoutBtn].forEach(b=>b.disabled=!ok);
  if(["demo","draft"].includes(state.mode))ui.scanBtn.disabled=true;if(state.mode==="fallback")ui.folderBtn.disabled=true;
  ui.materializeBtn.disabled=!ok||!supportsFS();ui.zipWorkspaceBtn.disabled=!ok;render();updateActionStates()
}
function match(r){if(!state.search)return true;const h=[r.title,r.path,r.url,r.notes].concat(r.tags||[]).filter(Boolean).join(" ").toLowerCase();return h.includes(state.search.toLowerCase())}
function render(){renderTree();renderMap();renderInspector();transform()}
function physicalChildrenOf(r){
  return state.resources.filter(x=>!x.missing&&!x.excluded&&["folder","file"].includes(x.type)&&parentOf(x,state.resources)?.id===r.id)
    .sort((a,b)=>a.type!==b.type?(a.type==="folder"?-1:1):a.title.localeCompare(b.title,undefined,{numeric:true}))
}
function renderTree(){
  ui.tree.replaceChildren();if(!state.workspace)return;
  const root=state.resources.find(r=>r.type==="root");
  if(state.search){
    state.resources.filter(r=>!r.excluded&&["root","folder","file"].includes(r.type)&&match(r)).sort((a,b)=>(a.path||"").localeCompare(b.path||"",undefined,{numeric:true}))
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
    const ids=hierarchyDescendants(frame.rootNodeId).filter(id=>!hidden.has(id)),nodes=ids.map(id=>node(id)).filter(n=>n&&!resource(n.resourceId)?.excluded);
    if(!nodes.length)return;
    const pad=Number(frame.padding)||28,minX=Math.min(...nodes.map(n=>n.x))-pad,minY=Math.min(...nodes.map(n=>n.y))-pad-28,maxX=Math.max(...nodes.map(n=>n.x+nodeBox(n).w))+pad,maxY=Math.max(...nodes.map(n=>n.y+nodeBox(n).h))+pad;
    const box=document.createElement("div");box.className="branch-frame";box.dataset.frame=frame.id;box.style.left=minX+"px";box.style.top=minY+"px";box.style.width=(maxX-minX)+"px";box.style.height=(maxY-minY)+"px";box.style.borderColor=frame.borderColor||"#6366f1";box.style.borderStyle=frame.borderStyle||"solid";box.style.backgroundColor=hexToRgba(frame.backgroundColor||"#eef2ff",Math.max(0,Math.min(.4,(Number(frame.opacity)||10)/100)));
    const title=document.createElement("span");title.className="branch-frame-title";title.textContent=frame.title||"Branche";title.style.color=frame.textColor||frame.borderColor||"#6366f1";title.style.fontSize=(Number(frame.fontSize)||12)+"px";title.style.top=-(Math.max(12,Number(frame.fontSize)||12)+12)+"px";title.style.fontFamily=FONT_STACKS[frame.fontFamily]||FONT_STACKS.system;title.style.fontWeight=frame.fontWeight||"800";title.style.fontStyle=frame.italic?"italic":"normal";title.title="Cliquer pour sélectionner la branche · double-cliquer pour renommer";
    title.onclick=ev=>{ev.stopPropagation();state.selected=frame.rootNodeId;state.selectedVisual=null;state.selectedEdge=null;state.linkSource=null;ui.nodes.querySelectorAll(".node.selected").forEach(x=>x.classList.remove("selected"));ui.nodes.querySelector('[data-node="'+frame.rootNodeId+'"]')?.classList.add("selected");renderTree();renderInspector()};
    title.ondblclick=ev=>{ev.stopPropagation();const v=prompt("Titre du cadre :",frame.title||"Branche");if(v!==null){frame.title=v.trim()||"Branche";setDirty();renderFrames(hiddenNodes());renderInspector()}};
    box.append(title);ui.frames.append(box)
  })
}
function renderMap(){
  ui.nodes.replaceChildren();ui.edges.replaceChildren();ui.frames.replaceChildren();ui.visualObjects.replaceChildren();if(!state.view)return;
  const hidden=hiddenNodes();renderFrames(hidden);renderVisualObjects();state.view.nodes.forEach(n=>{if(hidden.has(n.id))return;const r=resource(n.resourceId);if(r&&!r.excluded)ui.nodes.appendChild(makeNode(n,r))});renderEdges()
}
function renderVisualObjects(){
  if(!state.view)return;(state.view.objects||[]).forEach(o=>ui.visualObjects.appendChild(makeVisualObject(o)))
}
function imageResourceForObject(o){
  if(!o||o.type!=="image")return null;
  return resource(o.resourceId)||state.resources.find(r=>r.path&&r.path===o.path)||null
}
async function attachVisualImage(container,o){
  const r=imageResourceForObject(o);if(!r)return;
  const url=await imageUrlFor(r);if(!url||!container.isConnected)return;
  container.replaceChildren();const img=document.createElement("img");img.className="visual-image";img.src=url;img.alt=r.title||base(r.path);img.draggable=false;img.style.objectFit=o.fit||"contain";img.style.opacity=String(Math.max(.1,Math.min(1,(Number(o.opacity)||100)/100)));img.style.borderRadius=(Math.max(0,Number(o.radius)||0))+"px";container.append(img)
}
function makeVisualObject(o){
  const e=document.createElement("div");e.className="visual-object "+o.type+(o.id===state.selectedVisual?" selected":"");e.dataset.visual=o.id;e.style.left=o.x+"px";e.style.top=o.y+"px";e.style.width=o.w+"px";e.style.height=o.h+"px";
  if(o.type==="shape"){
    e.classList.add(o.shape||"rectangle");e.style.backgroundColor=o.fill||"#e0e7ff";e.style.borderColor=o.stroke||"#6366f1";
  }else if(o.type==="image"){
    const r=imageResourceForObject(o),placeholder=document.createElement("div");placeholder.className="visual-image-placeholder";placeholder.textContent=r&&r.missing?"Image absente":"Chargement de l’image…";e.append(placeholder);e.style.borderRadius=(Math.max(0,Number(o.radius)||0))+"px";attachVisualImage(e,o)
  }else{
    e.textContent=o.text||"Texte";e.style.color=o.textColor||"#172033";e.style.fontSize=(Number(o.fontSize)||18)+"px";e.style.fontFamily=FONT_STACKS[o.fontFamily]||FONT_STACKS.system;e.style.fontWeight=o.fontWeight||"500";e.style.fontStyle=o.italic?"italic":"normal";e.style.textAlign=o.textAlign||"left";e.style.justifyContent=o.textAlign==="center"?"center":o.textAlign==="right"?"flex-end":"flex-start";
  }
  e.onclick=ev=>{ev.stopPropagation();selectVisual(o.id)};
  e.ondblclick=ev=>{ev.stopPropagation();if(o.type==="text"){const v=prompt("Texte de l’annotation :",o.text||"");if(v!==null){o.text=v;setDirty();renderMap();renderInspector()}}else if(o.type==="image"){const r=imageResourceForObject(o);if(r)openResource(r)}};
  e.onpointerdown=ev=>dragVisualObject(ev,o,e);return e
}
function dragVisualObject(ev,o,e){
  if(ev.button!==0)return;ev.stopPropagation();
  if(state.selectedVisual!==o.id){state.selectedVisual=o.id;state.selected=null;state.selectedEdge=null;state.linkSource=null;ui.visualObjects.querySelectorAll(".visual-object.selected").forEach(x=>x.classList.remove("selected"));e.classList.add("selected");renderTree();renderInspector()}
  const s={x:ev.clientX,y:ev.clientY,ox:o.x,oy:o.y};let moved=false;
  function mv(x){const dx=(x.clientX-s.x)/state.view.zoom,dy=(x.clientY-s.y)/state.view.zoom;if(Math.abs(dx)+Math.abs(dy)>2)moved=true;o.x=s.ox+dx;o.y=s.oy+dy;e.style.left=o.x+"px";e.style.top=o.y+"px"}
  function end(){window.removeEventListener("pointermove",mv);window.removeEventListener("pointerup",end);window.removeEventListener("pointercancel",end);if(moved)setDirty()}
  window.addEventListener("pointermove",mv);window.addEventListener("pointerup",end);window.addEventListener("pointercancel",end)
}
async function attachNodeImage(ic,r){
  const u=await imageUrlFor(r);if(!u||!ic.isConnected)return;
  ic.replaceChildren();const img=document.createElement("img");img.className="node-thumb";img.src=u;img.alt="";ic.append(img)
}
function makeNode(n,r){
  const s=effectiveNodeStyle(n,r),box=nodeBox(n),e=document.createElement("div");e.className="node "+r.type+(r.missing?" missing":"")+(match(r)?"":" dim")+(n.id===state.selected?" selected":"")+(s.locked?" locked":"");e.dataset.node=n.id;e.style.left=n.x+"px";e.style.top=n.y+"px";e.style.width=box.w+"px";e.style.height=box.h+"px";e.style.backgroundColor=s.backgroundColor;e.style.borderColor=s.borderColor;e.style.borderWidth=Math.max(0,Number(s.borderWidth)||0)+"px";e.style.borderLeftWidth=Math.max(0,Number(s.borderWidth)||0)+"px";e.style.borderRadius=nodeRadius(s.shape);
  const main=document.createElement("div");main.className="node-main";const ic=document.createElement("div");ic.className="node-icon";ic.textContent=s.icon||icon(r);if(s.showImage&&isImageResource(r))attachNodeImage(ic,r);
  const txt=document.createElement("div");txt.className="node-text";txt.style.textAlign=s.textAlign||"left";const tt=document.createElement("div");tt.className="node-title";tt.textContent=r.title;tt.style.fontSize=(Number(s.fontSize)||14)+"px";tt.style.fontFamily=FONT_STACKS[s.fontFamily]||FONT_STACKS.system;tt.style.fontWeight=s.fontWeight||"650";tt.style.fontStyle=s.italic?"italic":"normal";tt.style.color=s.textColor||"#172033";
  const meta=document.createElement("div");meta.className="node-meta";meta.textContent=r.missing?"Ressource absente":r.tags&&r.tags.length?r.tags.map(t=>"#"+t).join(" "):typeLabel(r);txt.append(tt,meta);
  const ch=children(n.id),side=document.createElement(ch.length?"button":"span");if(ch.length){side.className="collapse";side.textContent=n.collapsed?"▸":"▾";side.onpointerdown=x=>x.stopPropagation();side.onclick=x=>{x.stopPropagation();n.collapsed=!n.collapsed;setDirty();renderMap();renderInspector()}}else{side.className="node-badge";side.textContent=s.locked?"🔒":r.type==="file"?"fichier":r.type==="virtual"?"idée":r.type==="url"?"web":""}main.append(ic,txt,side);e.append(main);
  e.onclick=x=>{x.stopPropagation();if(state.linkSource&&state.linkSource!==n.id){manualEdge(state.linkSource,n.id);state.linkSource=null;ui.hint.textContent="Lien créé";render();return}select(n.id)};e.ondblclick=x=>{x.stopPropagation();openResource(r)};e.onpointerdown=x=>dragNode(x,n,e);return e
}
function renderEdges(){
  if(!state.view)return;ui.edges.replaceChildren();
  const NS="http://www.w3.org/2000/svg",hidden=hiddenNodes(),map=new Map(state.view.nodes.filter(n=>!hidden.has(n.id)&&!resource(n.resourceId)?.excluded).map(n=>[n.id,n]));
  const boxes=[...map.values()].map(n=>{const b=nodeBox(n);return{x:n.x,y:n.y,w:b.w,h:b.h}});
  if(boxes.length){
    const margin=180,minX=Math.min(...boxes.map(b=>b.x))-margin,minY=Math.min(...boxes.map(b=>b.y))-margin,maxX=Math.max(...boxes.map(b=>b.x+b.w))+margin,maxY=Math.max(...boxes.map(b=>b.y+b.h))+margin,w=Math.max(1,maxX-minX),h=Math.max(1,maxY-minY);
    ui.edges.style.left=minX+"px";ui.edges.style.top=minY+"px";ui.edges.style.width=w+"px";ui.edges.style.height=h+"px";ui.edges.setAttribute("viewBox",minX+" "+minY+" "+w+" "+h)
  }else{
    ui.edges.style.left="0px";ui.edges.style.top="0px";ui.edges.style.width="1px";ui.edges.style.height="1px";ui.edges.setAttribute("viewBox","0 0 1 1")
  }
  state.view.edges.forEach(ed=>{
    const a=map.get(ed.from),b=map.get(ed.to);if(!a||!b)return;
    const ar=resource(a.resourceId),br=resource(b.resourceId),s=effectiveEdgeStyle(ed),g=edgeGeometry(a,b,s.curvature),group=document.createElementNS(NS,"g");
    group.classList.add("edge-group");group.dataset.edge=ed.id;

    const markerId="edge-arrow-"+hash(ed.id+"-"+s.color);
    if(s.arrow!=="none"){
      const defs=document.createElementNS(NS,"defs"),marker=document.createElementNS(NS,"marker"),arrow=document.createElementNS(NS,"path");
      marker.id=markerId;marker.setAttribute("viewBox","0 0 10 10");marker.setAttribute("refX","9");marker.setAttribute("refY","5");marker.setAttribute("markerWidth","7");marker.setAttribute("markerHeight","7");marker.setAttribute("orient","auto-start-reverse");marker.setAttribute("markerUnits","strokeWidth");
      arrow.setAttribute("d","M 0 0 L 10 5 L 0 10 z");arrow.setAttribute("fill",s.color);marker.append(arrow);defs.append(marker);group.append(defs)
    }

    const hit=document.createElementNS(NS,"path");hit.setAttribute("d",g.d);hit.setAttribute("class","edge-hit"+(ed.id===state.selectedEdge?" selected":""));hit.dataset.edge=ed.id;hit.style.strokeWidth=Math.max(14,Number(s.width)+10)+"px";hit.onclick=ev=>{ev.stopPropagation();selectEdge(ed.id)};
    const p=document.createElementNS(NS,"path");p.setAttribute("d",g.d);p.dataset.axis=g.axis;p.setAttribute("class","edge "+(ed.kind==="manual"?"manual ":"")+((match(ar)||match(br))?"":"dim"));p.setAttribute("fill","none");p.style.stroke=s.color;p.style.strokeWidth=String(s.width);p.style.strokeDasharray=s.lineStyle==="dashed"?"8 6":s.lineStyle==="dotted"?"2 6":"none";p.style.pointerEvents="stroke";p.style.cursor="pointer";p.onclick=ev=>{ev.stopPropagation();selectEdge(ed.id)};
    if(s.arrow==="end"||s.arrow==="both")p.setAttribute("marker-end","url(#"+markerId+")");if(s.arrow==="both")p.setAttribute("marker-start","url(#"+markerId+")");
    group.append(hit,p);

    if(ed.label){
      const label=document.createElementNS(NS,"text");label.setAttribute("x",String(g.mx));label.setAttribute("y",String(g.my-7));label.setAttribute("text-anchor","middle");label.setAttribute("class","edge-label"+(ed.id===state.selectedEdge?" selected":""));label.setAttribute("fill",s.color);label.textContent=ed.label;label.onclick=ev=>{ev.stopPropagation();selectEdge(ed.id)};group.append(label)
    }
    ui.edges.appendChild(group)
  })
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
  const source=resource(n.resourceId),style=effectiveNodeStyle(n,source);if(ev.button!==0||ev.target.closest("button")||style.locked)return;
  ev.stopPropagation();if(state.selected!==n.id){state.selected=n.id;state.selectedEdge=null;ui.nodes.querySelectorAll(".node.selected").forEach(x=>x.classList.remove("selected"));e.classList.add("selected");renderTree();renderInspector()}
  const groupIds=style.moveBranch?hierarchyDescendants(n.id):[n.id],starts=new Map(groupIds.map(id=>{const x=node(id);return[id,{x:x.x,y:x.y}]})),s={x:ev.clientX,y:ev.clientY};let moved=false,drop=null;
  function mv(x){
    const dx=(x.clientX-s.x)/state.view.zoom,dy=(x.clientY-s.y)/state.view.zoom;if(Math.abs(dx)+Math.abs(dy)>2)moved=true;
    groupIds.forEach(id=>{const nn=node(id),st=starts.get(id);if(!nn||!st)return;nn.x=st.x+dx;nn.y=st.y+dy;const card=ui.nodes.querySelector('[data-node="'+id+'"]');if(card){card.style.left=nn.x+"px";card.style.top=nn.y+"px"}});
    renderEdges();renderFrames(hiddenNodes());clearCentralDropHighlight();drop=moved?centralDropCandidate(x.clientX,x.clientY,n.id):null;if(drop&&!groupIds.includes(nodeForResource(drop.resource.id)?.id))drop.element.classList.add("drop-target");else if(drop&&groupIds.includes(nodeForResource(drop.resource.id)?.id))drop=null
  }
  async function end(x){
    window.removeEventListener("pointermove",mv);window.removeEventListener("pointerup",end);window.removeEventListener("pointercancel",end);clearCentralDropHighlight();
    if(!moved)return;if(x.type!=="pointercancel"&&drop){await reparentFromMindmap(source,drop.resource);renderMap()}else setDirty()
  }
  window.addEventListener("pointermove",mv);window.addEventListener("pointerup",end);window.addEventListener("pointercancel",end)
}
function select(id){state.selected=id;state.selectedVisual=null;state.selectedEdge=null;renderTree();renderMap();renderInspector()}
function selectVisual(id){state.selectedVisual=id;state.selected=null;state.selectedEdge=null;state.linkSource=null;renderTree();renderMap();renderInspector()}
function selectEdge(id){state.selectedEdge=id;state.selected=null;state.selectedVisual=null;state.linkSource=null;renderTree();renderMap();renderInspector()}
function manualEdge(a,b){
  let ed=state.view.edges.find(e=>e.from===a&&e.to===b);
  if(!ed){ed={id:"m-"+uuid(),from:a,to:b,kind:"manual",label:"",style:{}};state.view.edges.push(ed);setDirty()}
  state.selectedEdge=ed.id;state.selected=null;state.selectedVisual=null;return ed
}
function renderInspector(){
  const ed=selectedEdgeObject(),vo=selectedVisualObject(),r=selectedResource(),n=selectedNode();
  if(!ed)delete ui.edgeForm.dataset.edgeId;ui.noSelection.classList.toggle("hidden",!!r||!!vo||!!ed);ui.form.classList.toggle("hidden",!r);ui.visualForm.classList.toggle("hidden",!vo);ui.edgeForm.classList.toggle("hidden",!ed);
  if(ed){
    ui.edgeForm.dataset.edgeId=ed.id;const s=effectiveEdgeStyle(ed);ui.selectionKind.textContent=ed.kind==="hierarchy"?"Relation hiérarchique":"Relation manuelle";ui.edgeKind.textContent=ed.kind==="hierarchy"?"Hiérarchie":"Manuelle";ui.edgeLabel.value=ed.label||"";ui.edgeColor.value=s.color;ui.edgeWidth.value=s.width;ui.edgeWidthValue.value=s.width+" px";ui.edgeLineStyle.value=s.lineStyle;ui.edgeArrow.value=s.arrow;ui.edgeCurvature.value=s.curvature;ui.edgeCurvatureValue.value=s.curvature+" %";ui.deleteEdgeBtn.classList.toggle("hidden",ed.kind!=="manual");updateActionStates();return
  }
  if(vo){
    const isText=vo.type==="text",isShape=vo.type==="shape",isImage=vo.type==="image";
    ui.selectionKind.textContent=isShape?"Forme graphique":isImage?"Image libre":"Annotation";
    ui.visualKind.textContent=isShape?"Forme":isImage?"Image":"Texte";ui.visualTextLabel.classList.toggle("hidden",!isText);ui.visualShapeLabel.classList.toggle("hidden",!isShape);
    [ui.visualFontSizeLabel,ui.visualFontFamilyLabel,ui.visualFontWeightLabel,ui.visualTextAlignLabel,ui.visualItalicLabel,ui.visualTextColorLabel].forEach(x=>x.classList.toggle("hidden",!isText));ui.visualFillLabel.classList.toggle("hidden",!isShape);ui.visualStrokeLabel.classList.toggle("hidden",!isShape);
    [ui.visualImageSourceLabel,ui.visualImageFitLabel,ui.visualImageOpacityLabel,ui.visualImageRadiusLabel].forEach(x=>x.classList.toggle("hidden",!isImage));
    ui.visualText.value=vo.text||"";ui.visualShape.value=vo.shape||"rectangle";ui.visualWidth.value=Math.round(vo.w||180);ui.visualHeight.value=Math.round(vo.h||80);ui.visualFontSize.value=Number(vo.fontSize)||18;ui.visualFontFamily.value=vo.fontFamily||"system";ui.visualFontWeight.value=String(vo.fontWeight||"500");ui.visualTextAlign.value=vo.textAlign||"left";ui.visualItalic.checked=!!vo.italic;ui.visualTextColor.value=vo.textColor||"#172033";ui.visualFill.value=vo.fill||"#e0e7ff";ui.visualStroke.value=vo.stroke||"#6366f1";
    if(isImage){const ir=imageResourceForObject(vo);ui.visualImageSource.textContent=ir?.path||vo.path||"Ressource introuvable";ui.visualImageFit.value=vo.fit||"contain";ui.visualImageOpacity.value=Number(vo.opacity)||100;ui.visualImageOpacityValue.value=(Number(vo.opacity)||100)+" %";ui.visualImageRadius.value=Number(vo.radius)||0;ui.visualImageRadiusValue.value=(Number(vo.radius)||0)+" px"}
    updateActionStates();return
  }
  ui.selectionKind.textContent=r?typeLabel(r):"Aucune sélection";if(!r||!n){updateActionStates();return}
  ui.title.value=r.title||"";ui.kind.textContent=typeLabel(r)+(r.missing?" — absent":"");ui.path.textContent=r.path||r.url||"(nœud conceptuel)";ui.size.textContent=["root","folder","file"].includes(r.type)?formatSize(r.size):"—";ui.size.title=Number.isFinite(r.size)?new Intl.NumberFormat("fr-BE").format(r.size)+" octets":"";ui.modified.textContent=r.type==="file"?formatDate(r.lastModified):"—";ui.tags.value=(r.tags||[]).join(", ");ui.notes.value=r.notes||"";
  const s=effectiveNodeStyle(n,r);ui.nodeIcon.value=s.icon||"";ui.fontSize.value=s.fontSize;ui.fontSizeValue.value=s.fontSize+" px";ui.nodeWidth.value=s.width;ui.nodeWidthValue.value=s.width+" px";ui.nodeHeight.value=s.height;ui.nodeHeightValue.value=s.height+" px";ui.fontFamily.value=s.fontFamily;ui.fontWeight.value=String(s.fontWeight);ui.textAlign.value=s.textAlign;ui.fontItalic.checked=!!s.italic;ui.textColor.value=s.textColor;ui.backgroundColor.value=s.backgroundColor;ui.borderColor.value=s.borderColor;ui.borderWidth.value=s.borderWidth;ui.borderWidthValue.value=s.borderWidth+" px";ui.nodeShape.value=s.shape;ui.nodeLocked.checked=!!s.locked;ui.moveBranch.checked=!!s.moveBranch;ui.imageToggleLabel.classList.toggle("hidden",!isImageResource(r));ui.showNodeImage.checked=!!s.showImage;ui.pasteStyleBtn.disabled=!state.styleClipboard;
  const fr=frameForNode(n.id);ui.frameFields.classList.toggle("hidden",!fr);ui.frameToggleBtn.textContent=fr?"✕ Supprimer le cadre":"＋ Créer un cadre autour de cette branche";ui.branchFrameSection.classList.toggle("hidden",!children(n.id).length&&!fr);
  if(fr){ui.frameTitle.value=fr.title||r.title;ui.frameFontSize.value=Number(fr.fontSize)||12;ui.frameFontSizeValue.value=(Number(fr.fontSize)||12)+" px";ui.frameFontFamily.value=fr.fontFamily||"system";ui.frameFontWeight.value=String(fr.fontWeight||"800");ui.frameItalic.checked=!!fr.italic;ui.frameTextColor.value=fr.textColor||fr.borderColor||"#6366f1";ui.frameBorderColor.value=fr.borderColor||"#6366f1";ui.frameBackgroundColor.value=fr.backgroundColor||"#eef2ff";ui.frameOpacity.value=Number(fr.opacity)||10;ui.frameOpacityValue.value=(Number(fr.opacity)||10)+" %";ui.frameBorderStyle.value=fr.borderStyle||"solid"}
  ui.openResource.disabled=r.type==="virtual";ui.openResource.textContent=["root","folder"].includes(r.type)?"▦ Galerie du dossier":"👁️ Ouvrir / prévisualiser";ui.deleteBtn.classList.toggle("hidden",!["virtual","url"].includes(r.type));ui.collapseBtn.classList.toggle("hidden",!children(n.id).length);ui.collapseBtn.textContent=n.collapsed?"▸ Déplier":"▾ Replier";ui.linkBtn.textContent=state.linkSource===n.id?"✕ Annuler le lien":"⛓️ Relier à…";updateActionStates()
}
function updateForm(){const r=selectedResource();if(!r)return;r.title=ui.title.value.trim()||r.title;r.tags=ui.tags.value.split(",").map(x=>x.trim()).filter(Boolean);r.notes=ui.notes.value;setDirty();renderTree();renderMap()}
function updateNodeStyle(){
  const n=selectedNode(),r=selectedResource();if(!n||!r)return;
  n.style={icon:ui.nodeIcon.value.trim(),fontSize:Number(ui.fontSize.value)||14,width:Math.max(140,Number(ui.nodeWidth.value)||240),height:Math.max(60,Number(ui.nodeHeight.value)||74),fontFamily:ui.fontFamily.value,fontWeight:ui.fontWeight.value,italic:ui.fontItalic.checked,textAlign:ui.textAlign.value,textColor:ui.textColor.value,backgroundColor:ui.backgroundColor.value,borderColor:ui.borderColor.value,borderWidth:Number(ui.borderWidth.value)||0,shape:ui.nodeShape.value,locked:ui.nodeLocked.checked,moveBranch:ui.moveBranch.checked,showImage:isImageResource(r)&&ui.showNodeImage.checked};
  ui.fontSizeValue.value=n.style.fontSize+" px";ui.nodeWidthValue.value=n.style.width+" px";ui.nodeHeightValue.value=n.style.height+" px";ui.borderWidthValue.value=n.style.borderWidth+" px";setDirty();renderMap()
}
function copyNodeStyle(){const n=selectedNode();if(!n)return;state.styleClipboard=typeof structuredClone==="function"?structuredClone(n.style||{}):JSON.parse(JSON.stringify(n.style||{}));ui.pasteStyleBtn.disabled=false;setStatus("Style copié","ok")}
function pasteNodeStyle(){const n=selectedNode();if(!n||!state.styleClipboard)return;n.style=JSON.parse(JSON.stringify(state.styleClipboard));setDirty();renderMap();renderInspector()}
function resetNodeStyle(){const n=selectedNode();if(!n)return;n.style={};setDirty();renderMap();renderInspector()}
function toggleBranchFrame(){
  const n=selectedNode(),r=selectedResource();if(!n||!r)return;state.view.frames=state.view.frames||[];const fr=frameForNode(n.id);
  if(fr)state.view.frames=state.view.frames.filter(x=>x.id!==fr.id);
  else state.view.frames.push({id:"frame-"+uuid(),rootNodeId:n.id,title:r.title,fontSize:12,fontFamily:"system",fontWeight:"800",italic:false,textColor:"#6366f1",borderColor:"#6366f1",backgroundColor:"#eef2ff",opacity:10,borderStyle:"solid",padding:28});
  setDirty();renderMap();renderInspector()
}
function updateBranchFrame(){
  const n=selectedNode(),fr=n&&frameForNode(n.id);if(!fr)return;fr.title=ui.frameTitle.value;fr.fontSize=Math.max(8,Number(ui.frameFontSize.value)||12);fr.fontFamily=ui.frameFontFamily.value;fr.fontWeight=ui.frameFontWeight.value;fr.italic=ui.frameItalic.checked;fr.textColor=ui.frameTextColor.value;fr.borderColor=ui.frameBorderColor.value;fr.backgroundColor=ui.frameBackgroundColor.value;fr.opacity=Number(ui.frameOpacity.value)||0;fr.borderStyle=ui.frameBorderStyle.value;ui.frameFontSizeValue.value=fr.fontSize+" px";ui.frameOpacityValue.value=fr.opacity+" %";setDirty();renderFrames(hiddenNodes())
}
function toggleCollapse(){const n=selectedNode();if(!n)return;n.collapsed=!n.collapsed;setDirty();renderMap();renderInspector()}
function deleteSelected(){const r=selectedResource(),n=selectedNode();if(!r||!n||!["virtual","url"].includes(r.type))return;if(!confirm("Supprimer le nœud « "+r.title+" » ?"))return;state.resources=state.resources.filter(x=>x.id!==r.id);state.view.nodes=state.view.nodes.filter(x=>x.id!==n.id);state.view.edges=state.view.edges.filter(x=>x.from!==n.id&&x.to!==n.id);state.view.frames=(state.view.frames||[]).filter(x=>x.rootNodeId!==n.id);state.selected=null;state.linkSource=null;setDirty();render()}
function linkMode(){const n=selectedNode();if(!n)return;if(state.linkSource===n.id){state.linkSource=null;ui.hint.textContent="Glisser le fond pour déplacer la vue"}else{state.linkSource=n.id;ui.hint.textContent="Cliquez sur le nœud à relier"}renderInspector();updateActionStates()}
function updateEdgeStyle(){
  const edgeId=ui.edgeForm.dataset.edgeId||state.selectedEdge,ed=edge(edgeId);if(!ed)return;
  ed.label=ui.edgeLabel.value;
  ed.style={
    color:ui.edgeColor.value,
    width:Math.max(1,Number(ui.edgeWidth.value)||2.2),
    lineStyle:ui.edgeLineStyle.value,
    arrow:ui.edgeArrow.value,
    curvature:Math.max(0,Math.min(100,Number(ui.edgeCurvature.value)))
  };
  if(!Number.isFinite(ed.style.curvature))ed.style.curvature=42;
  state.selectedEdge=ed.id;ui.edgeWidthValue.value=ed.style.width+" px";ui.edgeCurvatureValue.value=ed.style.curvature+" %";setDirty();renderEdges()
}
function deleteSelectedEdge(){
  const ed=selectedEdgeObject();if(!ed||ed.kind!=="manual")return;if(!confirm("Supprimer cette relation visuelle ?"))return;state.view.edges=state.view.edges.filter(e=>e.id!==ed.id);state.selectedEdge=null;setDirty();render()
}
function updateVisualObject(){
  const o=selectedVisualObject();if(!o)return;o.w=Math.max(40,Number(ui.visualWidth.value)||o.w||180);o.h=Math.max(30,Number(ui.visualHeight.value)||o.h||80);
  if(o.type==="text"){o.text=ui.visualText.value;o.fontSize=Math.max(8,Number(ui.visualFontSize.value)||18);o.fontFamily=ui.visualFontFamily.value;o.fontWeight=ui.visualFontWeight.value;o.textAlign=ui.visualTextAlign.value;o.italic=ui.visualItalic.checked;o.textColor=ui.visualTextColor.value}
  else if(o.type==="shape"){o.shape=ui.visualShape.value;o.fill=ui.visualFill.value;o.stroke=ui.visualStroke.value}
  else if(o.type==="image"){o.fit=ui.visualImageFit.value;o.opacity=Math.max(10,Math.min(100,Number(ui.visualImageOpacity.value)||100));o.radius=Math.max(0,Math.min(60,Number(ui.visualImageRadius.value)||0));ui.visualImageOpacityValue.value=o.opacity+" %";ui.visualImageRadiusValue.value=o.radius+" px"}
  setDirty();renderMap()
}
function deleteVisualObject(){
  const o=selectedVisualObject();if(!o)return;state.view.objects=(state.view.objects||[]).filter(x=>x.id!==o.id);state.selectedVisual=null;setDirty();render()
}
function addShape(){
  if(!state.view)return;const p=centerWorld(),o={id:"o-"+uuid(),type:"shape",shape:"rectangle",x:p.x-90,y:p.y-45,w:180,h:90,fill:"#e0e7ff",stroke:"#6366f1"};
  state.view.objects=state.view.objects||[];state.view.objects.push(o);state.selectedVisual=o.id;state.selected=null;state.selectedEdge=null;setDirty();render()
}
function availableImageResources(){
  return state.resources.filter(r=>isImageResource(r)&&!r.missing&&!r.excluded&&(state.mode==="fs"||(state.mode==="fallback"&&state.fallbackFiles.has(r.path))))
}
function renderImageObjectList(){
  ui.imageObjectList.replaceChildren();const q=(ui.imageObjectSearch.value||"").trim().toLowerCase(),images=availableImageResources().filter(r=>!q||(r.title||"").toLowerCase().includes(q)||(r.path||"").toLowerCase().includes(q));
  if(!images.length){const p=document.createElement("p");p.className="recent-empty";p.textContent="Aucune image disponible dans ce workspace.";ui.imageObjectList.append(p);return}
  images.forEach(r=>{
    const b=document.createElement("button");b.type="button";b.className="image-picker-item";const thumb=document.createElement("span");thumb.className="image-picker-thumb";thumb.textContent="🖼️";const txt=document.createElement("span"),strong=document.createElement("strong"),small=document.createElement("small");strong.textContent=r.title||base(r.path);small.textContent=r.path||"";txt.append(strong,small);b.append(thumb,txt);b.onclick=()=>addImageObject(r);ui.imageObjectList.append(b);
    imageUrlFor(r).then(url=>{if(!url||!thumb.isConnected)return;thumb.replaceChildren();const img=document.createElement("img");img.src=url;img.alt="";img.draggable=false;thumb.append(img)})
  })
}
function openImageObjectDialog(){
  if(!state.workspace)return;ui.imageObjectSearch.value="";renderImageObjectList();if(!ui.imageObjectDialog.open)ui.imageObjectDialog.showModal()
}
function addImageObject(r){
  if(!r||!isImageResource(r)||r.missing)return;const p=centerWorld(),o={id:"o-"+uuid(),type:"image",resourceId:r.id,path:r.path,x:p.x-160,y:p.y-110,w:320,h:220,fit:"contain",opacity:100,radius:8};
  state.view.objects=state.view.objects||[];state.view.objects.push(o);state.selectedVisual=o.id;state.selected=null;state.selectedEdge=null;setDirty();ui.imageObjectDialog.close();render()
}
function addTextObject(){
  if(!state.view)return;const text=prompt("Texte de l’annotation :","Nouvelle annotation");if(text===null)return;const p=centerWorld(),o={id:"o-"+uuid(),type:"text",text:text||"Annotation",x:p.x-110,y:p.y-35,w:220,h:70,fontSize:18,fontFamily:"system",fontWeight:"500",textAlign:"left",italic:false,textColor:"#172033"};
  state.view.objects=state.view.objects||[];state.view.objects.push(o);state.selectedVisual=o.id;state.selected=null;state.selectedEdge=null;setDirty();render()
}
function centerWorld(){const r=ui.viewport.getBoundingClientRect();return{x:(r.width/2-state.view.pan.x)/state.view.zoom,y:(r.height/2-state.view.pan.y)/state.view.zoom}}
function addIdea(){const title=prompt("Nom de la nouvelle idée :","Nouvelle idée");if(!title||!title.trim())return;const r={id:"v-"+uuid(),type:"virtual",title:title.trim(),tags:[],notes:""},c=centerWorld(),n={id:"n-"+r.id,resourceId:r.id,x:c.x-120,y:c.y-37,collapsed:false,style:{}};state.resources.push(r);state.view.nodes.push(n);if(state.selected)manualEdge(state.selected,n.id);state.selected=n.id;state.selectedEdge=null;setDirty();render()}
function addUrl(){const raw=prompt("Adresse web :","https://");if(!raw)return;let u;try{u=new URL(raw).href}catch(e){alert("URL invalide");return}const title=prompt("Titre du lien :",new URL(u).hostname)||new URL(u).hostname,r={id:"u-"+uuid(),type:"url",title:title,tags:[],notes:"",url:u},c=centerWorld(),n={id:"n-"+r.id,resourceId:r.id,x:c.x-120,y:c.y-37,collapsed:false,style:{}};state.resources.push(r);state.view.nodes.push(n);if(state.selected)manualEdge(state.selected,n.id);state.selected=n.id;state.selectedEdge=null;setDirty();render()}
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
  const api=await getViewerApi();if(api&&api.showFilePreview)await api.showFilePreview(r,f,previewUi(),{onSaveText:state.mode==="fs"?text=>saveTextResource(r,text):null});else await basicPreview(r,f)
}
function previewDemo(r){
  clearPreviewSafe();ui.previewTitle.textContent=r.title;ui.previewMeta.textContent="Ressource fictive de démonstration";ui.previewBody.replaceChildren();
  const d=document.createElement("div");d.className="preview-fallback";const i=document.createElement("div");i.style.fontSize="4rem";i.textContent=icon(r);
  const p=document.createElement("p");p.textContent="En mode démo, les fichiers sont fictifs. Ouvrez un vrai dossier pour tester les viewers locaux de la V0.2.";
  d.append(i,p);ui.previewBody.appendChild(d);ui.preview.showModal()
}
function transform(){if(!state.view)return;ui.world.style.transform="translate("+state.view.pan.x+"px,"+state.view.pan.y+"px) scale("+state.view.zoom+")";ui.zoomValue.textContent=Math.round(state.view.zoom*100)+"%"}
function zoom(z,anchor){if(!state.view)return;const old=state.view.zoom,n=Math.min(2.2,Math.max(.2,z));if(anchor){const r=ui.viewport.getBoundingClientRect(),lx=anchor.x-r.left,ly=anchor.y-r.top,wx=(lx-state.view.pan.x)/old,wy=(ly-state.view.pan.y)/old;state.view.pan.x=lx-wx*n;state.view.pan.y=ly-wy*n}state.view.zoom=n;transform();setDirty()}
function focus(id){const n=node(id);if(!n)return;const b=nodeBox(n),r=ui.viewport.getBoundingClientRect();state.view.pan.x=r.width/2-(n.x+b.w/2)*state.view.zoom;state.view.pan.y=r.height/2-(n.y+b.h/2)*state.view.zoom;transform()}
function fit(){
  if(!state.view)return;const h=hiddenNodes(),a=state.view.nodes.filter(n=>!h.has(n.id)&&!resource(n.resourceId)?.excluded),objects=state.view.objects||[];
  const boxes=[...a.map(n=>{const b=nodeBox(n);return{x:n.x,y:n.y,w:b.w,h:b.h}}),...objects.map(o=>({x:Number(o.x)||0,y:Number(o.y)||0,w:Number(o.w)||120,h:Number(o.h)||60}))];
  if(!boxes.length)return;const minX=Math.min(...boxes.map(b=>b.x)),minY=Math.min(...boxes.map(b=>b.y)),maxX=Math.max(...boxes.map(b=>b.x+b.w)),maxY=Math.max(...boxes.map(b=>b.y+b.h)),r=ui.viewport.getBoundingClientRect();if(!r.width)return;
  const pad=90,z=Math.min(1.15,Math.max(.2,Math.min((r.width-pad*2)/Math.max(1,maxX-minX),(r.height-pad*2)/Math.max(1,maxY-minY))));state.view.zoom=z;state.view.pan.x=(r.width-(maxX-minX)*z)/2-minX*z;state.view.pan.y=(r.height-(maxY-minY)*z)/2-minY*z;transform()
}
function autoLayout(){
  if(!state.view)return;const auto=freshView(state.resources),byResource=new Map(auto.nodes.map(n=>[n.resourceId,n]));
  state.view.nodes.forEach(n=>{if(effectiveNodeStyle(n,resource(n.resourceId)).locked)return;const p=byResource.get(n.resourceId);if(p){n.x=p.x;n.y=p.y}});
  setDirty();renderMap();fit();setStatus("Disposition réorganisée","ok")
}
function panStart(ev){if(!state.view||ev.button!==0||ev.target.closest(".node,.visual-object,.branch-frame-title,.edge-hit,.edge-label,.map-palette,button,summary"))return;const s={x:ev.clientX,y:ev.clientY,px:state.view.pan.x,py:state.view.pan.y};ui.viewport.classList.add("panning");function mv(x){state.view.pan.x=s.px+x.clientX-s.x;state.view.pan.y=s.py+x.clientY-s.y;transform()}function end(){ui.viewport.classList.remove("panning");ui.viewport.removeEventListener("pointermove",mv);ui.viewport.removeEventListener("pointerup",end);ui.viewport.removeEventListener("pointercancel",end);setDirty()}ui.viewport.addEventListener("pointermove",mv);ui.viewport.addEventListener("pointerup",end);ui.viewport.addEventListener("pointercancel",end)}
async function rememberRecentWorkspace(handle,workspace){
  try{const api=await getRecentApi();if(api){await api.rememberWorkspace(handle,workspace);await refreshWelcomeActions()}}catch(e){console.warn("Unable to remember workspace",e)}
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
  }catch(e){console.error(e);alert("Impossible de rouvrir cet espace de travail : "+(e.message||e))}
}
async function renderRecentWorkspaces(){
  ui.recentList.replaceChildren();
  const api=await getRecentApi();
  if(!api){const p=document.createElement("p");p.className="recent-empty";p.textContent="Le stockage local des espaces de travail récents n’est pas disponible.";ui.recentList.append(p);return}
  let rows=[];try{rows=await api.listRecentWorkspaces()}catch(e){console.warn(e)}
  if(!rows.length){const p=document.createElement("p");p.className="recent-empty";p.textContent="Aucun espace de travail récent. Ouvrez d’abord un dossier local.";ui.recentList.append(p);return}
  rows.forEach(entry=>{
    const row=document.createElement("div");row.className="recent-item";
    const text=document.createElement("div"),name=document.createElement("strong"),date=document.createElement("small");
    name.textContent=entry.name||"Workspace";date.textContent=entry.lastOpenedAt?"Ouvert "+new Intl.DateTimeFormat("fr-BE",{dateStyle:"medium",timeStyle:"short"}).format(new Date(entry.lastOpenedAt)):"";
    text.append(name,date);
    const actions=document.createElement("div");actions.className="recent-actions";
    const open=document.createElement("button");open.type="button";open.textContent=state.workspace?.id===entry.id?"↻ Recharger":"📂 Ouvrir";open.onclick=()=>openRecentWorkspace(entry);
    const forget=document.createElement("button");forget.type="button";forget.textContent="Oublier";forget.onclick=async()=>{try{await api.forgetWorkspace(entry.id);await renderRecentWorkspaces();await refreshWelcomeActions()}catch(e){console.warn(e)}};
    actions.append(open,forget);row.append(text,actions);ui.recentList.append(row)
  })
}
async function openRecentDialog(){
  if(!supportsFS()){alert("Les espaces de travail récents nécessitent l’accès direct aux dossiers de ce navigateur.");return}
  if(!ui.recentDialog.open)ui.recentDialog.showModal();
  await renderRecentWorkspaces()
}
async function openExportDialog(){
  if(!state.workspace||!state.view)return;
  setStatus(state.dirty?"Modifications non enregistrées":"Prêt");
  ui.materializeBtn.disabled=!supportsFS();
  ui.exportPrintSection.open=false;ui.exportWorkspaceSection.open=false;
  if(!ui.exportDialog.open)ui.exportDialog.showModal()
}
function exportOptions(){return{orientation:ui.exportOrientation.value,includeHidden:ui.exportHidden.checked}}
function exportBaseName(){return safeName((state.workspace&&state.workspace.name)||"mindmap")+"-"+safeName(state.view?.name||"mindmap")}
function fileToDataUrl(file){
  return new Promise((resolve,reject)=>{const reader=new FileReader();reader.onload=()=>resolve(String(reader.result||""));reader.onerror=()=>reject(reader.error||new Error("Lecture image impossible"));reader.readAsDataURL(file)})
}
async function prepareViewForExport(){
  const view=typeof structuredClone==="function"?structuredClone(state.view):JSON.parse(JSON.stringify(state.view));
  for(const o of view.objects||[]){
    if(o.type!=="image")continue;
    const r=resource(o.resourceId)||state.resources.find(x=>x.path&&x.path===o.path);if(!r||r.missing)continue;
    try{
      const file=state.mode==="fs"?await fileFromPath(state.handle,r.path):state.fallbackFiles.get(r.path);
      if(file)o.dataUrl=await fileToDataUrl(file)
    }catch(e){console.warn("Image export unavailable",r.path,e)}
  }
  return view
}
async function runExport(kind){
  if(!state.view)return;
  const api=await getExporterApi();if(!api){alert("Le module d’export de la mindmap n’a pas pu être chargé.");return}
  try{
    const printWindow=kind==="print"?window.open("","_blank"):null;if(kind==="print"&&!printWindow)throw new Error("La fenêtre d'impression a été bloquée par le navigateur.");
    setStatus("Préparation de l’export…");const o=exportOptions(),base=exportBaseName(),view=await prepareViewForExport();
    if(kind==="svg")api.exportSvg(base+".svg",view,state.resources,o);
    else if(kind==="png")await api.exportPng(base+".png",view,state.resources,o);
    else if(kind==="print")api.printA4(state.workspace.name,view,state.resources,{...o,targetWindow:printWindow});
    if(kind!=="print")setStatus("Export "+kind.toUpperCase()+" généré","ok")
  }catch(e){console.error(e);setStatus("Export impossible","bad");alert("Export impossible : "+(e.message||e))}
}
async function exportWorkspaceZip(){
  if(!state.workspace||!state.view)return;setStatus("Création du template ZIP…");
  const api=await getWorkspaceExporterApi();if(!api){alert("Le module ZIP n’a pas pu être chargé.");return}
  try{const result=await api.exportWorkspaceTemplateZip(state.workspace,state.resources,allViews(),APP);setStatus("Template ZIP créé — "+result.folders+" dossier(s), "+result.plannedFiles+" fichier(s) planifié(s), "+result.views+" carte(s)","ok")}
  catch(e){console.error(e);setStatus("Export ZIP impossible","bad");alert("Impossible de créer le ZIP : "+(e.message||e))}
}
async function materializeWorkspace(){
  if(!state.workspace||!state.view)return;if(!supportsFS()){alert("Ce navigateur ne permet pas de créer directement une arborescence locale.");return}
  try{
    const parent=await window.showDirectoryPicker({mode:"readwrite"}),suggested=safeFolderName(state.workspace.name),raw=prompt("Nom du dossier à créer :",suggested);if(raw===null)return;
    const folderName=safeFolderName(raw);if(await entryExists(parent,folderName)){alert("Un dossier portant ce nom existe déjà dans l’emplacement choisi.");return}
    setStatus("Création de l’arborescence…");const root=await parent.getDirectoryHandle(folderName,{create:true});
    const folders=state.resources.filter(r=>r.type==="folder"&&!r.missing&&!r.excluded&&r.path).sort((a,b)=>a.path.split("/").length-b.path.split("/").length);
    for(const r of folders)await dirByParts(root,r.path.split("/").filter(Boolean),true);
    const payload=workspaceMetadataSnapshot();
    await Promise.all([writeJson(root,WS,payload.workspace),writeJson(root,RES,payload.resources),...payload.views.map(v=>writeJson(root,viewPath(v),v))]);
    const planned=state.resources.filter(r=>r.type==="file"&&!r.excluded&&r.path).length;ui.exportDialog.close();await loadHandle(root,false);
    setStatus("Espace de travail créé sur disque","ok");if(planned)alert(planned+" ressource(s) fichier sont conservées comme références planifiées. Elles apparaîtront « absentes » jusqu’à ce que les vrais fichiers correspondants soient ajoutés.")
  }catch(e){if(e&&e.name==="AbortError")return;console.error(e);setStatus("Création sur disque impossible","bad");alert("Impossible de créer le workspace : "+(e.message||e))}
}
function closePanels(){ui.resourcesPanel.classList.remove("open");ui.inspectorPanel.classList.remove("open")}
function closeToolbarMenus(except=null){document.querySelectorAll("[data-menu][open]").forEach(m=>{if(m!==except)m.removeAttribute("open")})}
function wire(){
  ui.openBtn.onclick=openWorkspace;ui.newWorkspaceBtn.onclick=newDraftWorkspace;ui.recentBtn.onclick=openRecentDialog;ui.exclusionsBtn.onclick=openExclusionsDialog;ui.recentClose.onclick=()=>ui.recentDialog.close();ui.viewSelect.onchange=()=>activateView(ui.viewSelect.value);ui.newViewBtn.onclick=createView;ui.duplicateViewBtn.onclick=duplicateView;ui.renameViewBtn.onclick=renameView;ui.welcomeNew.onclick=newDraftWorkspace;ui.welcomeOpen.onclick=openWorkspace;ui.welcomeRecent.onclick=openRecentDialog;const runDemo=()=>{try{demo()}catch(e){console.error("Demo rendering failed",e);setStatus("Erreur de rendu de la démo","bad");alert("Impossible d’afficher la démo : "+(e.message||e))}};ui.demoBtn.onclick=runDemo;ui.welcomeDemo.onclick=runDemo;ui.scanBtn.onclick=rescan;ui.saveNowBtn.onclick=()=>save(false);ui.saveExportBtn.onclick=openExportDialog;ui.exportBtn.onclick=openExportDialog;ui.exportClose.onclick=()=>ui.exportDialog.close();ui.exportSvgBtn.onclick=()=>runExport("svg");ui.exportPngBtn.onclick=()=>runExport("png");ui.exportPrintBtn.onclick=()=>runExport("print");ui.zipWorkspaceBtn.onclick=exportWorkspaceZip;ui.materializeBtn.onclick=materializeWorkspace;ui.folderBtn.onclick=addFolder;ui.textFileBtn.onclick=()=>addLocalTextFile("txt");ui.markdownFileBtn.onclick=()=>addLocalTextFile("md");ui.ideaBtn.onclick=addIdea;ui.urlBtn.onclick=addUrl;ui.fitBtn.onclick=fit;ui.autoLayoutBtn.onclick=autoLayout;ui.zoomIn.onclick=()=>zoom((state.view&&state.view.zoom||1)*1.15);ui.zoomOut.onclick=()=>zoom((state.view&&state.view.zoom||1)/1.15);
  ui.mapSelectBtn.onclick=()=>{state.linkSource=null;ui.hint.textContent="Glisser le fond pour déplacer la vue";updateActionStates();renderInspector()};
  ui.mapFolderBtn.onclick=addFolder;ui.mapIdeaBtn.onclick=addIdea;ui.mapRelationBtn.onclick=linkMode;ui.mapFrameBtn.onclick=toggleBranchFrame;ui.mapShapeBtn.onclick=addShape;ui.mapTextBtn.onclick=addTextObject;ui.mapImageBtn.onclick=openImageObjectDialog;
  ui.contextFolderBtn.onclick=addFolder;ui.contextIdeaBtn.onclick=addIdea;ui.contextRelationBtn.onclick=linkMode;ui.contextFrameBtn.onclick=toggleBranchFrame;ui.contextExcludeBtn.onclick=excludeSelectedResource;
  document.querySelectorAll("[data-menu]").forEach(menu=>menu.addEventListener("toggle",()=>{if(menu.open)closeToolbarMenus(menu)}));
  document.querySelectorAll("[data-menu] .toolbar-menu-panel button").forEach(b=>b.addEventListener("click",()=>b.closest("[data-menu]")?.removeAttribute("open")));
  document.addEventListener("click",e=>{if(!e.target.closest("[data-menu]"))closeToolbarMenus()});
  ui.viewport.onpointerdown=panStart;ui.viewport.onclick=e=>{if(!e.target.closest(".node,.visual-object,.branch-frame-title,.edge-group,.edge-label,.map-palette")){state.selected=null;state.selectedVisual=null;state.selectedEdge=null;state.linkSource=null;ui.hint.textContent="Glisser le fond pour déplacer la vue";render()}};ui.viewport.addEventListener("wheel",e=>{if(!state.view)return;e.preventDefault();zoom(state.view.zoom*(e.deltaY<0?1.08:1/1.08),{x:e.clientX,y:e.clientY})},{passive:false});
  ui.search.oninput=()=>{state.search=ui.search.value.trim();renderTree();renderMap()};[ui.title,ui.tags,ui.notes].forEach(x=>x.addEventListener("input",updateForm));
  [ui.nodeIcon,ui.fontSize,ui.nodeWidth,ui.nodeHeight,ui.fontFamily,ui.fontWeight,ui.textAlign,ui.fontItalic,ui.textColor,ui.backgroundColor,ui.borderColor,ui.borderWidth,ui.nodeShape,ui.nodeLocked,ui.moveBranch,ui.showNodeImage].forEach(x=>x.addEventListener("input",updateNodeStyle));
  ui.copyStyleBtn.onclick=copyNodeStyle;ui.pasteStyleBtn.onclick=pasteNodeStyle;ui.resetStyleBtn.onclick=resetNodeStyle;ui.frameToggleBtn.onclick=toggleBranchFrame;[ui.frameTitle,ui.frameFontSize,ui.frameFontFamily,ui.frameFontWeight,ui.frameItalic,ui.frameTextColor,ui.frameBorderColor,ui.frameBackgroundColor,ui.frameOpacity,ui.frameBorderStyle].forEach(x=>x.addEventListener("input",updateBranchFrame));
  ui.openResource.onclick=()=>openResource(selectedResource());ui.linkBtn.onclick=linkMode;ui.collapseBtn.onclick=toggleCollapse;ui.deleteBtn.onclick=deleteSelected;[ui.visualText,ui.visualShape,ui.visualWidth,ui.visualHeight,ui.visualFontSize,ui.visualFontFamily,ui.visualFontWeight,ui.visualTextAlign,ui.visualItalic,ui.visualTextColor,ui.visualFill,ui.visualStroke,ui.visualImageFit,ui.visualImageOpacity,ui.visualImageRadius].forEach(x=>{x.addEventListener("input",updateVisualObject);x.addEventListener("change",updateVisualObject)});ui.deleteVisualBtn.onclick=deleteVisualObject;[ui.edgeLabel,ui.edgeColor,ui.edgeWidth,ui.edgeLineStyle,ui.edgeArrow,ui.edgeCurvature].forEach(x=>{x.addEventListener("input",updateEdgeStyle);x.addEventListener("change",updateEdgeStyle)});ui.deleteEdgeBtn.onclick=deleteSelectedEdge;
  ui.folderFallback.onchange=async()=>{const f=ui.folderFallback.files;ui.folderFallback.value="";await loadFallback(f)};ui.imageObjectClose.onclick=()=>ui.imageObjectDialog.close();ui.imageObjectSearch.oninput=renderImageObjectList;ui.previewClose.onclick=()=>ui.preview.close();ui.preview.addEventListener("close",clearPreviewSafe);
  ui.exclusionsClose.onclick=()=>ui.exclusionsDialog.close();ui.exclusionForm.onsubmit=e=>{e.preventDefault();if(addExclusionRule(ui.exclusionPattern.value)){ui.exclusionPattern.value="";renderExclusionsList();setStatus("Règle d’exclusion ajoutée","ok")}};ui.excludeBakPreset.onclick=()=>{addExclusionRule("*.bak");renderExclusionsList()};ui.excludeNppPreset.onclick=()=>{addExclusionRule("nppBackup/**");renderExclusionsList()};
  ui.showResourcesBtn.onclick=()=>ui.resourcesPanel.classList.toggle("open");ui.showInspectorBtn.onclick=()=>ui.inspectorPanel.classList.toggle("open");ui.collapseResourcesBtn.onclick=()=>setPanelCollapsed("left",true);ui.collapseInspectorBtn.onclick=()=>setPanelCollapsed("right",true);ui.restoreResourcesBtn.onclick=()=>setPanelCollapsed("left",false);ui.restoreInspectorBtn.onclick=()=>setPanelCollapsed("right",false);ui.toggleResourcesBtn.onclick=()=>{if(innerWidth<=900)ui.resourcesPanel.classList.toggle("open");else setPanelCollapsed("left",!state.panels.left)};ui.toggleInspectorBtn.onclick=()=>{if(innerWidth<=900)ui.inspectorPanel.classList.toggle("open");else setPanelCollapsed("right",!state.panels.right)};document.querySelectorAll("[data-close]").forEach(b=>b.onclick=()=>el(b.dataset.close).classList.remove("open"));
  window.addEventListener("keydown",e=>{if((e.ctrlKey||e.metaKey)&&e.key.toLowerCase()==="s"){e.preventDefault();if(state.mode==="fs"&&state.canWrite&&!state.scanTruncated)save(false);else openExportDialog()}if((e.key==="Delete"||e.key==="Backspace")&&!e.target.matches("input,textarea,select")){if(state.selectedVisual){e.preventDefault();deleteVisualObject()}else if(selectedEdgeObject()?.kind==="manual"){e.preventDefault();deleteSelectedEdge()}}if(e.key==="Escape"){state.linkSource=null;ui.hint.textContent="Glisser le fond pour déplacer la vue";closeToolbarMenus();closePanels();renderInspector();updateActionStates()}});window.addEventListener("resize",()=>{if(innerWidth>900)closePanels()})
}
async function init(){
  document.documentElement.dataset.glomBoot="starting";
  try{
    loadPanelPrefs();applyPanelState();enhanceRangeInputs();wire();
    if(!supportsFS()){setButtonLabel(ui.openBtn,"Importer un dossier");ui.welcomeOpen.textContent="📂 Importer un dossier";ui.recentBtn.disabled=true;ui.recentBtn.title="Non disponible avec ce navigateur"}await refreshWelcomeActions();
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
    console.error("MindSpark init failed",e)
  }
}
init();
