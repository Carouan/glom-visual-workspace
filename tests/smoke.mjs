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
  if(errors.length)console.warn(errors.join("\n"));
  console.log("Browser smoke test OK",JSON.stringify(snapshot));
}finally{
  await browser.close();
}
