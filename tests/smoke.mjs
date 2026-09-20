import puppeteer from "puppeteer-core";

const executablePath=process.env.CHROME_BIN;
if(!executablePath)throw new Error("CHROME_BIN is required");

const browser=await puppeteer.launch({headless:true,executablePath,args:["--no-sandbox","--disable-gpu"]});
try{
  const page=await browser.newPage();
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
  if(version.trim()!=="v0.3.4")throw new Error("Unexpected UI version: "+version);
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
  await page.$eval(".toolbar-menu:first-of-type > summary",el=>el.click());
  await page.waitForSelector(".toolbar-menu:first-of-type[open]",{timeout:3000});
  const workspaceMenuOpen=await page.$eval(".toolbar-menu:first-of-type",el=>el.open);
  if(!workspaceMenuOpen)throw new Error("Workspace command menu did not open");
  await page.mouse.click(5,5);
  await page.waitForFunction(()=>![...document.querySelectorAll("[data-menu]")].some(m=>m.open),{timeout:3000});
  const folderToggle=await page.$(".tree-row .tree-toggle");
  if(!folderToggle)throw new Error("No collapsible folder toggle rendered in resource tree");
  const leftScroll=await page.$eval(".resources-scroll",el=>({overflow:getComputedStyle(el).overflowY,gutter:getComputedStyle(el).scrollbarGutter,clientHeight:el.clientHeight,scrollHeight:el.scrollHeight}));
  if(!["auto","scroll"].includes(leftScroll.overflow))throw new Error("Left sidebar is not configured as scrollable: "+JSON.stringify(leftScroll));
  if(leftScroll.scrollHeight>leftScroll.clientHeight)await page.$eval(".resources-scroll",el=>{el.scrollTop=Math.min(60,el.scrollHeight-el.clientHeight)});

  await page.$eval(".node.root",el=>el.click());
  await page.waitForSelector("#form:not(.hidden)",{timeout:5000});
  const contextualActions=await page.$$eval(".context-actions button",els=>els.length);
  if(contextualActions!==4)throw new Error("Contextual action group is incomplete: "+contextualActions);
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

  // Return to the root before testing inspector-driven styling.
  await page.$eval(".node.root",el=>el.click());
  await page.waitForSelector("#form:not(.hidden)",{timeout:5000});
  await page.$eval("#nodeIcon",el=>{el.value="⭐";el.dispatchEvent(new Event("input",{bubbles:true}))});
  const rootIcon=await page.$eval(".node.root .node-icon",el=>el.textContent||"");
  if(!rootIcon.includes("⭐"))throw new Error("Custom node icon was not rendered: "+rootIcon);
  await page.$eval("#backgroundColor",el=>{el.value="#fff3bf";el.dispatchEvent(new Event("input",{bubbles:true}))});
  const rootBg=await page.$eval(".node.root",el=>getComputedStyle(el).backgroundColor);
  if(!rootBg.includes("255"))throw new Error("Node background style did not apply: "+rootBg);
  await page.$eval("#frameToggleBtn",el=>el.click());
  await page.waitForSelector(".branch-frame",{timeout:5000});
  const frameCount=await page.$$eval(".branch-frame",els=>els.length);
  if(frameCount<1)throw new Error("Branch frame was not rendered");
  await page.$eval("#exportBtn",el=>el.click());
  await page.waitForSelector("#exportDialog[open]",{timeout:5000});
  const exportReady=await page.$eval("#exportSvgBtn",el=>!el.disabled);
  if(!exportReady)throw new Error("Export dialog did not initialize");
  await page.click("#exportClose");
  await page.$eval("#recentBtn",el=>el.click());
  await page.waitForSelector("#recentDialog[open]",{timeout:5000});
  await page.waitForFunction(()=>document.getElementById("recentList")?.textContent?.includes("Aucun workspace récent"),{timeout:5000});
  await page.click("#recentClose");

  // A workspace can be started from scratch and populated visually with folders.
  page.once("dialog",d=>d.accept("Workspace vierge test"));
  await page.$eval("#newWorkspaceBtn",el=>el.click());
  await page.waitForFunction(()=>document.getElementById("workspaceName")?.textContent==="Workspace vierge test",{timeout:5000});
  page.once("dialog",d=>d.accept("Recherche"));
  await page.click("#mapFolderBtn");
  await page.waitForFunction(()=>[...document.querySelectorAll(".tree-label")].some(el=>el.textContent==="Recherche"),{timeout:5000});
  const draftNode=await page.$eval(".node.folder .node-title",el=>el.textContent||"");
  if(draftNode!=="Recherche")throw new Error("Folder created from scratch was not rendered: "+draftNode);
  await page.$eval("#exportBtn",el=>el.click());
  await page.waitForSelector("#exportDialog[open]",{timeout:5000});
  const zipReady=await page.$eval("#zipWorkspaceBtn",el=>!el.disabled);
  if(!zipReady)throw new Error("Workspace ZIP export is not available for a draft workspace");
  await page.click("#zipWorkspaceBtn");
  await page.waitForFunction(()=>document.getElementById("status")?.textContent?.includes("Template ZIP créé"),{timeout:5000});

  if(errors.length)console.warn(errors.join("\n"));
  console.log("Browser smoke test OK",JSON.stringify(snapshot));
}finally{
  await browser.close();
}
