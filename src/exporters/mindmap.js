const NODE_W=240,NODE_H=74;
const TYPE_COLORS={root:"#16a34a",folder:"#f59e0b",file:"#64748b",virtual:"#8b5cf6",url:"#0ea5e9"};

function xml(s){return String(s??"").replace(/[<>&'"]/g,c=>({"<":"&lt;",">":"&gt;","&":"&amp;","'":"&apos;",'"':"&quot;"}[c]))}
function iconFor(r){
  if(!r)return"❓";if(r.type==="root")return"🗺️";if(r.type==="folder")return"📁";if(r.type==="virtual")return"💡";if(r.type==="url")return"🔗";
  const e=(r.path||"").split(".").pop().toLowerCase();
  if(["png","jpg","jpeg","gif","webp","svg"].includes(e))return"🖼️";if(["mp3","wav","ogg","m4a","flac"].includes(e))return"🔊";
  if(["mp4","webm","mov"].includes(e))return"🎬";if(e==="pdf")return"📕";if(["md","txt","rtf"].includes(e))return"📝";
  if(["js","ts","py","html","css","json","yaml","yml"].includes(e))return"💻";if(["xls","xlsx","ods","csv"].includes(e))return"📊";return"📄"
}
function wrapText(text,max=28,lines=2){
  const words=String(text||"").split(/\s+/).filter(Boolean),out=[];let line="";
  for(const word of words){
    const next=line?line+" "+word:word;
    if(next.length>max&&line){out.push(line);line=word;if(out.length===lines-1)break}else line=next
  }
  if(line&&out.length<lines)out.push(line);
  if(words.join(" ").length>out.join(" ").length&&out.length)out[out.length-1]=out[out.length-1].replace(/\s*…?$/,"")+"…";
  return out.length?out:[""];
}
function hiddenNodes(view){
  const byParent=new Map();
  (view.edges||[]).filter(e=>e.kind==="hierarchy").forEach(e=>{if(!byParent.has(e.from))byParent.set(e.from,[]);byParent.get(e.from).push(e.to)});
  const hidden=new Set();
  const hide=id=>(byParent.get(id)||[]).forEach(c=>{hidden.add(c);hide(c)});
  (view.nodes||[]).forEach(n=>{if(n.collapsed)hide(n.id)});
  return hidden
}
function bounds(nodes){
  if(!nodes.length)return{x:0,y:0,w:100,h:100};
  const minX=Math.min(...nodes.map(n=>n.x)),minY=Math.min(...nodes.map(n=>n.y));
  const maxX=Math.max(...nodes.map(n=>n.x+NODE_W)),maxY=Math.max(...nodes.map(n=>n.y+NODE_H));
  return{x:minX,y:minY,w:Math.max(1,maxX-minX),h:Math.max(1,maxY-minY)}
}
function metaFor(r){
  if(r.missing)return"Ressource absente";
  if(r.tags?.length)return r.tags.slice(0,3).map(t=>"#"+t).join(" ");
  return({root:"Workspace",folder:"Dossier",file:"Fichier",virtual:"Idée",url:"Lien web"})[r.type]||"Ressource"
}
function a4Pixels(orientation){
  return orientation==="portrait"?{w:2480,h:3508}:{w:3508,h:2480}
}
export function buildMindmapSvg(view,resources,{orientation="landscape",includeHidden=false,background="#ffffff"}={}){
  const resMap=new Map(resources.map(r=>[r.id,r])),hide=includeHidden?new Set():hiddenNodes(view);
  const nodes=(view.nodes||[]).filter(n=>!hide.has(n.id)&&resMap.has(n.resourceId));
  const nodeMap=new Map(nodes.map(n=>[n.id,n])),b=bounds(nodes),pad=70,area={x:b.x-pad,y:b.y-pad,w:b.w+pad*2,h:b.h+pad*2},a4=a4Pixels(orientation);
  const edges=(view.edges||[]).filter(e=>nodeMap.has(e.from)&&nodeMap.has(e.to)).map(e=>{
    const a=nodeMap.get(e.from),z=nodeMap.get(e.to),sx=a.x+NODE_W,sy=a.y+37,tx=z.x,ty=z.y+37,dx=Math.max(70,Math.abs(tx-sx)*.45);
    const stroke=e.kind==="manual"?"#3b82f6":"#94a3b8",dash=e.kind==="manual"?' stroke-dasharray="7 5"':"";
    return `<path d="M ${sx} ${sy} C ${sx+dx} ${sy}, ${tx-dx} ${ty}, ${tx} ${ty}" fill="none" stroke="${stroke}" stroke-width="2.2"${dash}/>`
  }).join("");
  const cards=nodes.map(n=>{
    const r=resMap.get(n.resourceId),color=TYPE_COLORS[r.type]||"#64748b",title=wrapText(r.title,28,2),meta=metaFor(r);
    const titleSvg=title.map((line,i)=>`<text x="${n.x+48}" y="${n.y+25+i*17}" font-family="Arial, sans-serif" font-size="14" font-weight="700" fill="#0f172a">${xml(line)}</text>`).join("");
    return `<g>
      <rect x="${n.x}" y="${n.y}" width="${NODE_W}" height="${NODE_H}" rx="12" fill="#ffffff" stroke="#cbd5e1"/>
      <rect x="${n.x}" y="${n.y}" width="5" height="${NODE_H}" rx="3" fill="${color}"/>
      <text x="${n.x+18}" y="${n.y+32}" font-size="21">${xml(iconFor(r))}</text>
      ${titleSvg}
      <text x="${n.x+48}" y="${n.y+61}" font-family="Arial, sans-serif" font-size="10.5" fill="#64748b">${xml(meta)}</text>
    </g>`
  }).join("");
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${a4.w}" height="${a4.h}" viewBox="${area.x} ${area.y} ${area.w} ${area.h}" preserveAspectRatio="xMidYMid meet">
    <rect x="${area.x}" y="${area.y}" width="${area.w}" height="${area.h}" fill="${background}"/>
    ${edges}
    ${cards}
  </svg>`
}
function blobDownload(name,blob){
  const u=URL.createObjectURL(blob),a=document.createElement("a");a.href=u;a.download=name;document.body.append(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(u),1500)
}
export function exportSvg(name,view,resources,options){
  const svg=buildMindmapSvg(view,resources,options);blobDownload(name,new Blob([svg],{type:"image/svg+xml;charset=utf-8"}))
}
export async function exportPng(name,view,resources,options){
  const svg=buildMindmapSvg(view,resources,options),size=a4Pixels(options?.orientation||"landscape"),u=URL.createObjectURL(new Blob([svg],{type:"image/svg+xml"}));
  try{
    const img=new Image();
    await new Promise((resolve,reject)=>{img.onload=resolve;img.onerror=reject;img.src=u});
    const canvas=document.createElement("canvas");canvas.width=size.w;canvas.height=size.h;const ctx=canvas.getContext("2d");
    ctx.fillStyle="#fff";ctx.fillRect(0,0,size.w,size.h);ctx.drawImage(img,0,0,size.w,size.h);
    const blob=await new Promise(resolve=>canvas.toBlob(resolve,"image/png",1));if(!blob)throw new Error("Conversion PNG impossible");
    blobDownload(name,blob)
  }finally{URL.revokeObjectURL(u)}
}
export function printA4(title,view,resources,options){
  const orientation=options?.orientation||"landscape",svg=buildMindmapSvg(view,resources,{...options,orientation}),w=window.open("","_blank");
  if(!w)throw new Error("La fenêtre d'impression a été bloquée par le navigateur.");
  const safeTitle=xml(title||"Mindmap");
  w.document.open();w.document.write(`<!doctype html><html><head><meta charset="utf-8"><title>${safeTitle}</title>
  <style>@page{size:A4 ${orientation};margin:8mm}html,body{margin:0;padding:0;background:#fff}body{display:grid;place-items:center}svg{width:100%;height:auto;max-height:calc(100vh - 16mm)}@media print{svg{width:100%;height:auto;max-height:none}}</style>
  </head><body>${svg}<script>window.addEventListener("load",()=>setTimeout(()=>window.print(),200));<\/script></body></html>`);w.document.close()
}
