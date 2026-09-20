import puppeteer from "puppeteer-core";

const executablePath=process.env.CHROME_BIN;
if(!executablePath)throw new Error("CHROME_BIN is required");

const browser=await puppeteer.launch({headless:true,executablePath,args:["--no-sandbox","--disable-gpu"]});
try{
  const page=await browser.newPage();
  await page.setViewport({width:1440,height:900,deviceScaleFactor:1});
  const errors=[];
  page.on("pageerror",e=>errors.push("pageerror: "+e.message));
  page.on("console",msg=>{if(msg.type()==="error")errors.push("console: "+msg.text())});
  await page.goto("http://127.0.0.1:4173/?demo=1",{waitUntil:"networkidle0",timeout:30000});
  await page.waitForFunction(()=>document.documentElement.dataset.glomBoot==="ok",{timeout:10000});
  const snapshot=await page.evaluate(()=>({
    boot:document.documentElement.dataset.glomBoot,
    workspace:document.getElementById("workspaceName")?.textContent||"",
    count:document.getElementById("count")?.textContent||"",
    tree:document.getElementById("tree")?.textContent||"",
    nodes:document.getElementById("nodes")?.textContent||"",
    status:document.getElementById("status")?.textContent||""
  }));
  if(!snapshot.workspace.includes("Les jeux vidéo"))throw new Error("Demo workspace not rendered: "+JSON.stringify(snapshot));
  if(!snapshot.nodes.includes("Tennis for Two.pdf"))throw new Error("Demo nodes not rendered: "+JSON.stringify(snapshot));
  const version=await page.$eval(".badge",el=>el.textContent||"");
  if(version.trim()!=="v0.3.9")throw new Error("Unexpected UI version: "+version);
  const recentVisible=await page.$eval("#recentBtn",el=>!!el);
  if(!recentVisible)throw new Error("Recent workspaces command is missing");
  const menuCount=await page.$$eval(".toolbar-menu",els=>els.length);
  if(menuCount!==4)throw new Error("Expected 4 compact toolbar menus, got "+menuCount);
  const topIconCount=await page.$$eval(".toolbar .ui-icon",els=>els.length);
  if(topIconCount<9)throw new Error("Expected representative SVG icons in toolbar, got "+topIconCount);
  const visibleTopCommands=await page.$$eval(".toolbar > button:not(.mobile-only)",els=>els.filter(el=>getComputedStyle(el).display!=="none").map(el=>el.id));
  if(!visibleTopCommands.includes("openBtn")||visibleTopCommands.length>2)throw new Error("Topbar still exposes too many permanent commands: "+JSON.stringify(visibleTopCommands));
  const paletteVisible=await page.$eval("#mapPalette",el=>getComputedStyle(el).display!=="none");
  if(!paletteVisible)throw new Error("Mindmap tool palette is not visible");
  const freeTools=await page.evaluate(()=>({shape:!document.getElementById("mapShapeBtn").disabled,text:!document.getElementById("mapTextBtn").disabled,image:document.getElementById("mapImageBtn").disabled}));
  if(!freeTools.shape||!freeTools.text||!freeTools.image)throw new Error("Unexpected free-object tool availability: "+JSON.stringify(freeTools));
  await page.$eval(".toolbar-menu:first-of-type > summary",el=>el.click());
  await page.waitForSelector(".toolbar-menu:first-of-type[open]",{timeout:3000});
  const workspaceMenuOpen=await page.$eval(".toolbar-menu:first-of-type",el=>el.open);
  if(!workspaceMenuOpen)throw new Error("Workspace command menu did not open");
  await page.mouse.click(5,5);
  await page.waitForFunction(()=>![...document.querySelectorAll("[data-menu]")].some(m=>m.open),{timeout:3000});

  // Both desktop side panels can be collapsed and restored independently.
  await page.click("#collapseResourcesBtn");
  await page.waitForFunction(()=>document.querySelector(".shell")?.classList.contains("left-collapsed"),{timeout:3000});
  const leftRestoreVisible=await page.$eval("#restoreResourcesBtn",el=>!el.classList.contains("hidden"));
  if(!leftRestoreVisible)throw new Error("Left restore tab is not visible after collapsing Resources");
  await page.click("#restoreResourcesBtn");
  await page.waitForFunction(()=>!document.querySelector(".shell")?.classList.contains("left-collapsed"),{timeout:3000});

  await page.click("#collapseInspectorBtn");
  await page.waitForFunction(()=>document.querySelector(".shell")?.classList.contains("right-collapsed"),{timeout:3000});
  const rightRestoreVisible=await page.$eval("#restoreInspectorBtn",el=>!el.classList.contains("hidden"));
  if(!rightRestoreVisible)throw new Error("Right restore tab is not visible after collapsing Details");
  await page.click("#restoreInspectorBtn");
  await page.waitForFunction(()=>!document.querySelector(".shell")?.classList.contains("right-collapsed"),{timeout:3000});
  const panelPrefs=await page.evaluate(()=>JSON.parse(localStorage.getItem("glom-ui-panels-v1")||"{}"));
  if(panelPrefs.left||panelPrefs.right)throw new Error("Panel preference did not return to expanded state: "+JSON.stringify(panelPrefs));

  const folderToggle=await page.$(".tree-row .tree-toggle");
  if(!folderToggle)throw new Error("No collapsible folder toggle rendered in resource tree");
  const leftScroll=await page.$eval(".resources-scroll",el=>({overflow:getComputedStyle(el).overflowY,gutter:getComputedStyle(el).scrollbarGutter,clientHeight:el.clientHeight,scrollHeight:el.scrollHeight}));
  if(!["auto","scroll"].includes(leftScroll.overflow))throw new Error("Left sidebar is not configured as scrollable: "+JSON.stringify(leftScroll));
  if(leftScroll.scrollHeight>leftScroll.clientHeight)await page.$eval(".resources-scroll",el=>{el.scrollTop=Math.min(60,el.scrollHeight-el.clientHeight)});

  await page.$eval(".node.root",el=>el.click());
  await page.waitForSelector("#form:not(.hidden)",{timeout:5000});
  const contextualActions=await page.$$eval(".context-actions button",els=>els.length);
  if(contextualActions!==5)throw new Error("Contextual action group is incomplete: "+contextualActions);
  const relationEnabled=await page.$eval("#mapRelationBtn",el=>!el.disabled);
  if(!relationEnabled)throw new Error("Relation tool should be enabled for a selected node");
  const rightScroll=await page.$eval("#inspectorScroll",el=>({overflow:getComputedStyle(el).overflowY,gutter:getComputedStyle(el).scrollbarGutter,clientHeight:el.clientHeight,scrollHeight:el.scrollHeight}));
  if(!["auto","scroll"].includes(rightScroll.overflow))throw new Error("Right sidebar is not configured as scrollable: "+JSON.stringify(rightScroll));
  if(rightScroll.scrollHeight<=rightScroll.clientHeight)throw new Error("Right sidebar content does not produce a scrollable area in the demo: "+JSON.stringify(rightScroll));
  await page.hover("#inspectorScroll");
  await page.mouse.wheel({deltaY:700});
  await new Promise(resolve=>setTimeout(resolve,150));
  const inspectorScrollTop=await page.$eval("#inspectorScroll",el=>el.scrollTop);
  if(inspectorScrollTop<=0)throw new Error("Right sidebar scrollbar is visible but does not actually scroll");
  const detailsSummary=await page.$eval("#form .inspector-section summary",el=>el.textContent||"");
  if(!detailsSummary.includes("Détails"))throw new Error("Resource details are not wrapped in an inspector box: "+detailsSummary);
  if(leftScroll.scrollHeight>leftScroll.clientHeight){
    const leftAfterSelection=await page.$eval(".resources-scroll",el=>el.scrollTop);
    if(leftAfterSelection<=0)throw new Error("Left sidebar scroll position was lost after selecting a mindmap node");
  }

  // Central drag/drop must change hierarchy and immediately update the file tree.
  const dragPoints=await page.evaluate(()=>{
    const nodes=[...document.querySelectorAll(".node")];
    const byTitle=t=>nodes.find(n=>n.querySelector(".node-title")?.textContent===t);
    const src=byTitle("Game design"),dst=byTitle("Histoire");if(!src||!dst)return null;
    const a=src.getBoundingClientRect(),b=dst.getBoundingClientRect();
    return{sx:a.left+a.width/2,sy:a.top+a.height/2,tx:b.left+b.width/2,ty:b.top+b.height/2}
  });
  if(!dragPoints)throw new Error("Could not locate demo nodes for central drag/drop");
  await page.mouse.move(dragPoints.sx,dragPoints.sy);
  await page.mouse.down();
  await page.mouse.move(dragPoints.tx,dragPoints.ty,{steps:12});
  await page.mouse.up();
  await page.waitForFunction(()=>{
    const row=[...document.querySelectorAll(".tree-row")].find(r=>r.querySelector(".tree-label")?.textContent==="Game design");
    return row?.style.getPropertyValue("--depth")==="2"
  },{timeout:5000});

  // A branch can move as a rigid group while descendants keep their relative positions.
  await page.evaluate(()=>[...document.querySelectorAll(".node")].find(n=>n.querySelector(".node-title")?.textContent==="Histoire")?.click());
  await page.waitForSelector("#form:not(.hidden)",{timeout:3000});
  await page.$eval("#moveBranch",el=>{el.checked=true;el.dispatchEvent(new Event("input",{bubbles:true}))});
  const branchBefore=await page.evaluate(()=>{
    const byTitle=t=>[...document.querySelectorAll(".node")].find(n=>n.querySelector(".node-title")?.textContent===t);
    const a=byTitle("Histoire"),b=byTitle("Premiers jeux");if(!a||!b)return null;
    return{ax:parseFloat(a.style.left),ay:parseFloat(a.style.top),bx:parseFloat(b.style.left),by:parseFloat(b.style.top),locked:a.classList.contains("locked")}
  });
  if(!branchBefore||branchBefore.locked)throw new Error("Could not prepare branch-group drag: "+JSON.stringify(branchBefore));
  await page.evaluate(()=>{
    const a=[...document.querySelectorAll(".node")].find(n=>n.querySelector(".node-title")?.textContent==="Histoire"),icon=a?.querySelector(".node-icon");if(!a||!icon)throw new Error("Histoire node missing");
    const r=icon.getBoundingClientRect(),x=r.left+r.width/2,y=r.top+r.height/2,opts={bubbles:true,button:0,pointerId:91,pointerType:"mouse",isPrimary:true};
    icon.dispatchEvent(new PointerEvent("pointerdown",{...opts,clientX:x,clientY:y}));
    window.dispatchEvent(new PointerEvent("pointermove",{...opts,clientX:x+55,clientY:y+35}));
    window.dispatchEvent(new PointerEvent("pointerup",{...opts,clientX:x+55,clientY:y+35}));
  });
  const branchAfter=await page.evaluate(()=>{
    const byTitle=t=>[...document.querySelectorAll(".node")].find(n=>n.querySelector(".node-title")?.textContent===t);
    const a=byTitle("Histoire"),b=byTitle("Premiers jeux");return{ax:parseFloat(a.style.left),ay:parseFloat(a.style.top),bx:parseFloat(b.style.left),by:parseFloat(b.style.top)}
  });
  const dax=branchAfter.ax-branchBefore.ax,day=branchAfter.ay-branchBefore.ay,dbx=branchAfter.bx-branchBefore.bx,dby=branchAfter.by-branchBefore.by;
  if(Math.abs(dax-dbx)>1||Math.abs(day-dby)>1||Math.abs(dax)<5)throw new Error("Branch descendants did not preserve relative positions: "+JSON.stringify({branchBefore,branchAfter}));

  // Relations are directly selectable, nameable and stylable.
  const manualReady=await page.evaluate(()=>{
    const visible=document.querySelector("#edges .edge.manual"),group=visible?.parentElement,hit=group?.querySelector(".edge-hit");
    if(!hit||!visible)return null;
    const hitPE=getComputedStyle(hit).pointerEvents,visiblePE=getComputedStyle(visible).pointerEvents;
    hit.dispatchEvent(new MouseEvent("click",{bubbles:true,cancelable:true}));
    return{hitPE,visiblePE};
  });
  if(!manualReady)throw new Error("No manual relation available for style test");
  if(manualReady.hitPE!=="stroke"||manualReady.visiblePE!=="stroke")throw new Error("Relation paths are not pointer-selectable: "+JSON.stringify(manualReady));
  await page.waitForSelector("#edgeForm:not(.hidden)",{timeout:3000});
  await page.$eval("#edgeLabel",el=>{el.value="inspire";el.dispatchEvent(new Event("input",{bubbles:true}));el.dispatchEvent(new Event("change",{bubbles:true}))});
  await page.$eval("#edgeColor",el=>{el.value="#dc2626";el.dispatchEvent(new Event("input",{bubbles:true}));el.dispatchEvent(new Event("change",{bubbles:true}))});
  await page.$eval("#edgeWidth",el=>{el.value="4";el.dispatchEvent(new Event("input",{bubbles:true}));el.dispatchEvent(new Event("change",{bubbles:true}))});
  await page.select("#edgeLineStyle","dotted");
  await page.select("#edgeArrow","end");
  await page.$eval("#edgeCurvature",el=>{el.value="0";el.dispatchEvent(new Event("input",{bubbles:true}));el.dispatchEvent(new Event("change",{bubbles:true}))});
  const relationStyle=await page.evaluate(()=>{
    const hit=document.querySelector("#edges .edge-hit.selected"),group=hit?.closest(".edge-group"),p=group?.querySelector(".edge"),label=group?.querySelector(".edge-label");
    if(!p)return null;const cs=getComputedStyle(p);
    return{label:label?.textContent||"",stroke:cs.stroke,width:cs.strokeWidth,dash:cs.strokeDasharray,marker:p.getAttribute("marker-end")||"",d:p.getAttribute("d")||""}
  });
  if(!relationStyle||relationStyle.label!=="inspire"||relationStyle.stroke!=="rgb(220, 38, 38)"||parseFloat(relationStyle.width)!==4||!relationStyle.dash.includes("2")||!relationStyle.marker||!relationStyle.d.includes(" L "))throw new Error("Relation styling failed: "+JSON.stringify(relationStyle));

  // Return to the root before testing inspector-driven styling.
  await page.$eval(".node.root",el=>el.click());
  await page.waitForSelector("#form:not(.hidden)",{timeout:5000});
  await page.$eval("#nodeIcon",el=>{el.value="⭐";el.dispatchEvent(new Event("input",{bubbles:true}))});
  const rootIcon=await page.$eval(".node.root .node-icon",el=>el.textContent||"");
  if(!rootIcon.includes("⭐"))throw new Error("Custom node icon was not rendered: "+rootIcon);
  await page.$eval("#backgroundColor",el=>{el.value="#fff3bf";el.dispatchEvent(new Event("input",{bubbles:true}))});
  const rootBg=await page.$eval(".node.root",el=>getComputedStyle(el).backgroundColor);
  if(!rootBg.includes("255"))throw new Error("Node background style did not apply: "+rootBg);

  // Node geometry is editable and range controls are not padded away from their endpoints.
  await page.$eval("#nodeWidth",el=>{el.value="420";el.dispatchEvent(new Event("input",{bubbles:true}))});
  await page.$eval("#nodeHeight",el=>{el.value="120";el.dispatchEvent(new Event("input",{bubbles:true}))});
  const rootGeometry=await page.$eval(".node.root",el=>({w:getComputedStyle(el).width,h:getComputedStyle(el).height}));
  if(rootGeometry.w!=="420px"||rootGeometry.h!=="120px")throw new Error("Variable node geometry failed: "+JSON.stringify(rootGeometry));

  // Connectors switch to top/bottom ports when nodes are mainly stacked vertically.
  const verticalDrag=await page.evaluate(()=>{
    const byTitle=t=>[...document.querySelectorAll(".node")].find(n=>n.querySelector(".node-title")?.textContent===t);
    const root=byTitle("Chef-d'œuvre — Les jeux vidéo"),src=byTitle("Sources");if(!root||!src)return null;
    const a=root.getBoundingClientRect(),b=src.getBoundingClientRect();
    return{sx:b.left+b.width/2,sy:b.top+b.height/2,tx:a.left+a.width/2,ty:a.bottom+260}
  });
  if(!verticalDrag)throw new Error("Could not prepare adaptive-edge drag");
  await page.mouse.move(verticalDrag.sx,verticalDrag.sy);await page.mouse.down();await page.mouse.move(verticalDrag.tx,verticalDrag.ty,{steps:14});await page.mouse.up();
  await page.waitForFunction(()=>document.querySelectorAll('#edges path[data-axis="vertical"]').length>0,{timeout:3000});
  const verticalPath=await page.$eval('#edges path[data-axis="vertical"]',el=>el.getAttribute("d")||"");
  if(!verticalPath.includes(" C "))throw new Error("Vertical adaptive connector was not drawn as a curve: "+verticalPath);
  const sliderCheck=await page.evaluate(()=>({fontMax:document.getElementById("fontSize").max,borderMax:document.getElementById("borderWidth").max,padding:getComputedStyle(document.getElementById("fontSize")).paddingLeft}));
  if(Number(sliderCheck.fontMax)<72||Number(sliderCheck.borderMax)<12||sliderCheck.padding!=="0px")throw new Error("Range controls are still artificially constrained: "+JSON.stringify(sliderCheck));

  await page.$eval("#frameToggleBtn",el=>el.click());
  await page.waitForSelector(".branch-frame",{timeout:5000});
  const frameCount=await page.evaluate(()=>document.querySelectorAll(".branch-frame").length);
  if(frameCount<1)throw new Error("Branch frame was not rendered");
  await page.$eval("#frameTitle",el=>{el.value="Cadre édité";el.dispatchEvent(new Event("input",{bubbles:true}))});
  await page.$eval("#frameFontSize",el=>{el.value="24";el.dispatchEvent(new Event("input",{bubbles:true}))});
  const frameTitle=await page.$eval(".branch-frame-title",el=>({text:el.textContent||"",size:getComputedStyle(el).fontSize,pointer:getComputedStyle(el).pointerEvents}));
  if(frameTitle.text!=="Cadre édité"||frameTitle.size!=="24px"||frameTitle.pointer==="none")throw new Error("Frame title editing/typography failed: "+JSON.stringify(frameTitle));

  // Exclusion rules hide matching resources without deleting them from the model.
  await page.$eval("#exclusionsBtn",el=>el.click());
  await page.waitForSelector("#exclusionsDialog[open]",{timeout:3000});
  await page.$eval("#exclusionPattern",el=>{el.value="*.md"});
  await page.$eval("#exclusionForm",el=>el.requestSubmit());
  await page.waitForFunction(()=>![...document.querySelectorAll(".node-title")].some(el=>el.textContent.endsWith(".md")),{timeout:3000});
  const exclusionRule=await page.$eval("#exclusionsList code",el=>el.textContent||"");
  if(exclusionRule!=="*.md")throw new Error("Exclusion rule was not stored/rendered: "+exclusionRule);
  await page.$eval("#exclusionsList button",el=>el.click());
  await page.waitForFunction(()=>[...document.querySelectorAll(".node-title")].some(el=>el.textContent==="Fiche de concept.md"),{timeout:3000});
  await page.click("#exclusionsClose");

  await page.$eval("#exportBtn",el=>el.click());
  await page.waitForSelector("#exportDialog[open]",{timeout:5000});
  const exportReady=await page.$eval("#exportSvgBtn",el=>!el.disabled);
  if(!exportReady)throw new Error("Export dialog did not initialize");
  await page.click("#exportClose");
  await page.$eval("#recentBtn",el=>el.click());
  await page.waitForSelector("#recentDialog[open]",{timeout:5000});
  await page.waitForFunction(()=>document.getElementById("recentList")?.textContent?.includes("Aucun workspace récent"),{timeout:5000});
  await page.click("#recentClose");

  // Markdown viewer must default to rendered content and expose an editor when saving is available.
  const viewerCheck=await page.evaluate(async()=>{
    const api=await import("./src/viewers/index.js");
    const dialog=document.createElement("dialog"),header=document.createElement("div"),title=document.createElement("strong"),meta=document.createElement("small"),body=document.createElement("div");
    header.append(title,meta);dialog.append(header,body);document.body.append(dialog);
    let saved="";
    const file=new File(["# Titre\n\n**Gras**\n\n*Italique*"],"test.md",{type:"text/markdown"});
    await api.showFilePreview({title:"test.md",path:"test.md"},file,{dialog,title,meta,body},{onSaveText:async text=>{saved=text;return{size:new Blob([text]).size}}});
    const rendered=body.querySelector(".viewer-markdown")?.innerHTML||"";
    const edit=[...body.querySelectorAll(".viewer-toolbar button")].find(b=>b.textContent.includes("Modifier"));if(!edit)return{rendered,saved,error:"no edit button"};
    edit.click();const ta=body.querySelector(".viewer-editor-area");if(!ta)return{rendered,saved,error:"no textarea"};
    ta.value="# Modifié";
    const save=[...body.querySelectorAll(".viewer-editor-actions button")].find(b=>b.textContent.includes("Enregistrer"));save.click();
    await new Promise(r=>setTimeout(r,80));
    const renderedAfter=body.querySelector(".viewer-markdown")?.textContent||"";
    dialog.close();dialog.remove();api.clearPreview();
    return{rendered,saved,renderedAfter}
  });
  if(viewerCheck.error)throw new Error("Markdown editor unavailable: "+JSON.stringify(viewerCheck));
  if(!viewerCheck.rendered.includes("<h1>Titre</h1>")||!viewerCheck.rendered.includes("<strong>Gras</strong>"))throw new Error("Markdown did not render by default: "+JSON.stringify(viewerCheck));
  if(viewerCheck.saved!=="# Modifié"||!viewerCheck.renderedAfter.includes("Modifié"))throw new Error("Markdown edit/save flow failed: "+JSON.stringify(viewerCheck));

  // A workspace can be started from scratch and populated visually with folders.
  page.once("dialog",d=>d.accept("Workspace vierge test"));
  await page.$eval("#newWorkspaceBtn",el=>el.click());
  await page.waitForFunction(()=>document.getElementById("workspaceName")?.textContent==="Workspace vierge test",{timeout:5000});
  page.once("dialog",d=>d.accept("Recherche"));
  await page.click("#mapFolderBtn");
  await page.waitForFunction(()=>[...document.querySelectorAll(".tree-label")].some(el=>el.textContent==="Recherche"),{timeout:5000});
  const draftNode=await page.$eval(".node.folder .node-title",el=>el.textContent||"");
  if(draftNode!=="Recherche")throw new Error("Folder created from scratch was not rendered: "+draftNode);

  // Free shape + text annotation are real view objects, editable in the inspector.
  await page.click("#mapShapeBtn");
  await page.waitForSelector(".visual-object.shape",{timeout:3000});
  await page.waitForSelector("#visualForm:not(.hidden)",{timeout:3000});
  await page.select("#visualShape","ellipse");
  await page.waitForFunction(()=>document.querySelector(".visual-object.shape")?.classList.contains("ellipse"),{timeout:3000});
  // Move the shape to a clear area first: a free object may legitimately sit behind a node.
  await page.evaluate(()=>{
    const shape=document.querySelector(".visual-object.shape"),r=shape.getBoundingClientRect(),x=r.left+r.width/2,y=r.top+r.height/2,opts={bubbles:true,button:0,pointerId:92,pointerType:"mouse",isPrimary:true};
    shape.dispatchEvent(new PointerEvent("pointerdown",{...opts,clientX:x,clientY:y}));
    window.dispatchEvent(new PointerEvent("pointermove",{...opts,clientX:x+320,clientY:y+120}));
    window.dispatchEvent(new PointerEvent("pointerup",{...opts,clientX:x+320,clientY:y+120}));
  });
  await page.click(".node.root");
  await page.waitForSelector("#form:not(.hidden)",{timeout:3000});
  await page.click(".visual-object.shape");
  await page.waitForSelector("#visualForm:not(.hidden)",{timeout:3000});
  const shapeReselected=await page.$eval(".visual-object.shape",el=>el.classList.contains("selected"));
  if(!shapeReselected)throw new Error("A visible free shape cannot be re-selected after selecting a node");

  page.once("dialog",d=>d.accept("À retenir"));
  await page.click("#mapTextBtn");
  await page.waitForFunction(()=>[...document.querySelectorAll(".visual-object.text")].some(el=>el.textContent.includes("À retenir")),{timeout:3000});
  const objectCount=await page.evaluate(()=>document.querySelectorAll(".visual-object").length);
  if(objectCount<2)throw new Error("Free visual objects were not created");

  await page.$eval("#exportBtn",el=>el.click());
  await page.waitForSelector("#exportDialog[open]",{timeout:5000});
  const zipReady=await page.$eval("#zipWorkspaceBtn",el=>!el.disabled);
  if(!zipReady)throw new Error("Workspace ZIP export is not available for a draft workspace");
  await page.click("#zipWorkspaceBtn");
  await page.waitForFunction(()=>document.getElementById("status")?.textContent?.includes("Template ZIP créé"),{timeout:5000});

  // Export is computed from real content bounds, not from a fixed A4 canvas.
  const svgCheck=await page.evaluate(async()=>{
    const api=await import("./src/exporters/mindmap.js");
    const view={nodes:[{id:"n-r",resourceId:"r",x:-300,y:-120,collapsed:false,style:{width:420,height:120}}],edges:[],frames:[],objects:[]};
    const resources=[{id:"r",type:"file",title:"large.md",path:"large.md",tags:[]}];
    return api.buildMindmapSvg(view,resources,{orientation:"landscape"});
  });
  if(!svgCheck.includes('x="-300"')||!svgCheck.includes('width="420"')||!svgCheck.includes('height="120"'))throw new Error("Exporter still assumes fixed or positive-only canvas geometry");
  const exportEdge=await page.evaluate(async()=>{
    const api=await import("./src/exporters/mindmap.js");
    const view={nodes:[
      {id:"a",resourceId:"ra",x:100,y:100,collapsed:false,style:{width:240,height:80}},
      {id:"b",resourceId:"rb",x:120,y:500,collapsed:false,style:{width:240,height:80}}
    ],edges:[{id:"e",from:"a",to:"b",kind:"hierarchy"}],frames:[],objects:[]};
    const resources=[{id:"ra",type:"folder",title:"A",path:"A"},{id:"rb",type:"folder",title:"B",path:"A/B"}];
    return api.buildMindmapSvg(view,resources,{orientation:"landscape"});
  });
  const d=(exportEdge.match(/<path d="([^"]+)"/)||[])[1]||"";
  if(!d||!/^M\s+220\s+180\s+C\s+220\s+/.test(d))throw new Error("Exporter did not use vertical node ports: "+d);
  const styledRelationSvg=await page.evaluate(async()=>{
    const api=await import("./src/exporters/mindmap.js");
    const view={nodes:[
      {id:"a",resourceId:"ra",x:100,y:100,collapsed:false,style:{width:240,height:80}},
      {id:"b",resourceId:"rb",x:500,y:100,collapsed:false,style:{width:240,height:80}}
    ],edges:[{id:"rel",from:"a",to:"b",kind:"manual",label:"inspire",style:{color:"#dc2626",width:4,lineStyle:"dotted",arrow:"end",curvature:0}}],frames:[],objects:[]};
    const resources=[{id:"ra",type:"folder",title:"A",path:"A"},{id:"rb",type:"file",title:"B",path:"A/B.md"}];
    return api.buildMindmapSvg(view,resources,{orientation:"landscape"});
  });
  if(!styledRelationSvg.includes(">inspire</text>")||!styledRelationSvg.includes('stroke="#dc2626"')||!styledRelationSvg.includes('stroke-width="4"')||!styledRelationSvg.includes('stroke-dasharray="2 6"')||!styledRelationSvg.includes('marker-end="url(#rel-rel)"'))throw new Error("Styled relation was not preserved in SVG export");

  const canvasSource=await page.evaluate(()=>fetch("./src/app.js").then(r=>r.text()));
  if(canvasSource.includes("n.x=Math.max(0")||canvasSource.includes("o.x=Math.max(0"))throw new Error("Canvas movement is still clamped at coordinate zero");
  if(canvasSource.includes("limite de sécurité de la V0.1")||canvasSource.includes("entries.length>=1200")||canvasSource.includes("depth>10"))throw new Error("Legacy V0.1 scan limits are still present");
  const scanLimitMatch=canvasSource.match(/SCAN_MAX_ENTRIES=(\d+),SCAN_MAX_DEPTH=(\d+)/);
  if(!scanLimitMatch||Number(scanLimitMatch[1])<10000||Number(scanLimitMatch[2])<32)throw new Error("Large-workspace scan guard is unexpectedly low: "+String(scanLimitMatch));
  const worldGeometry=await page.$eval(".world",el=>({w:getComputedStyle(el).width,h:getComputedStyle(el).height,overflow:getComputedStyle(el).overflow}));
  if(worldGeometry.w!=="1px"||worldGeometry.h!=="1px"||worldGeometry.overflow!=="visible")throw new Error("Canvas still exposes a finite workspace boundary: "+JSON.stringify(worldGeometry));

  if(errors.length)console.warn(errors.join("\n"));
  console.log("Browser smoke test OK",JSON.stringify(snapshot));
}finally{
  await browser.close();
}
