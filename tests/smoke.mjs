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
  if(version.trim()!=="v0.3.0")throw new Error("Unexpected UI version: "+version);
  const recentVisible=await page.$eval("#recentBtn",el=>!!el && getComputedStyle(el).display!=="none");
  if(!recentVisible)throw new Error("Recent workspaces button is not visible");
  const folderToggle=await page.$(".tree-row .tree-toggle");
  if(!folderToggle)throw new Error("No collapsible folder toggle rendered in resource tree");
  const treeOverflow=await page.$eval("#tree",el=>getComputedStyle(el).overflowY);
  if(treeOverflow!=="scroll")throw new Error("Resource tree is not configured with a persistent scrollbar: "+treeOverflow);

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
  const frameCount=await page.$eval(".branch-frame",els=>els.length);
  if(frameCount<1)throw new Error("Branch frame was not rendered");
  await page.click("#exportBtn");
  await page.waitForSelector("#exportDialog[open]",{timeout:5000});
  const exportReady=await page.$eval("#exportSvgBtn",el=>!el.disabled);
  if(!exportReady)throw new Error("Export dialog did not initialize");
  await page.click("#exportClose");
  await page.click("#recentBtn");
  await page.waitForSelector("#recentDialog[open]",{timeout:5000});
  await page.waitForFunction(()=>document.getElementById("recentList")?.textContent?.includes("Aucun workspace récent"),{timeout:5000});
  if(errors.length)console.warn(errors.join("\n"));
  console.log("Browser smoke test OK",JSON.stringify(snapshot));
}finally{
  await browser.close();
}
