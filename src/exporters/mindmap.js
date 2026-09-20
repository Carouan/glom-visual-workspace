const NODE_W=240,NODE_H=74;
const TYPE_COLORS={root:"#16a34a",folder:"#f59e0b",file:"#64748b",virtual:"#8b5cf6",url:"#0ea5e9"};
const FONT_STACKS={system:"Arial, sans-serif",rounded:"Trebuchet MS, Arial, sans-serif",serif:"Georgia, Times New Roman, serif",mono:"Consolas, Courier New, monospace"};

function xml(s){return String(s??"").replace(/[<>&'"]/g,c=>({"<":"&lt;",">":"&gt;","&":"&amp;","'":"&apos;",'"':"&quot;"}[c]))}
function iconFor(r){
  if(!r)return"❓";if(r.type==="root")return"🗺️";if(r.type==="folder")return"📁";if(r.type==="virtual")return"💡";if(r.type==="url")return"🔗";
  const e=(r.path||"").split(".").pop().toLowerCase();
  if(["png","jpg","jpeg","gif","webp","svg"].includes(e))return"🖼️";if(["mp3","wav","ogg","m4a","flac"].includes(e))return"🔊";
  if(["mp4","webm","mov"].includes(e))return"🎬";if(e==="pdf")return"📕";if(["md","txt","rtf"].includes(e))return"📝";
  if(["js","ts","py","html","css","json","yaml","yml"].includes(e))return"💻";if(["xls","xlsx","ods","csv"].includes(e))return"📊";return"📄"
}
function styleFor(n,r){return Object.assign({icon:"",fontSize:14,fontFamily:"system",fontWeight:"650",italic:false,textAlign:"left",textColor:"#172033",backgroundColor:"#ffffff",borderColor:TYPE_COLORS[r?.type]||"#d8deea",borderWidth:1,shape:"rounded"},n.style||{})}
function radius(shape){return shape==="rectangle"?2:shape==="pill"?37:12}
function wrapText(text,max=28,lines=2){
  const words=String(text||"").split(/\s+/).filter(Boolean),out=[];let line="";
  for(const word of words){
    const next=line?line+" "+word:word;
    if(next.length>max&&line){out.push(line);line=word;if(out.length===lines-1)break}else line=next
  }
  if(line&&out.length<lines)out.push(line);
  if(words.join(" ").length>out.join(" ").length&&out.length)out[out.length-1]=out[out.length-1].replace(/\s*…?$/,"")+"…";
  return out.length?out:[""]
}
function hiddenNodes(view){
  const byParent=new Map();
  (view.edges||[]).filter(e=>e.kind==="hierarchy").forEach(e=>{if(!byParent.has(e.from))byParent.set(e.from,[]);byParent.get(e.from).push(e.to)});
  const hidden=new Set(),hide=id=>(byParent.get(id)||[]).forEach(c=>{hidden.add(c);hide(c)});
  (view.nodes||[]).forEach(n=>{if(n.collapsed)hide(n.id)});
  return hidden
}
function descendants(view,rootId){
  const byParent=new Map();
  (view.edges||[]).filter(e=>e.kind==="hierarchy").forEach(e=>{if(!byParent.has(e.from))byParent.set(e.from,[]);byParent.get(e.from).push(e.to)});
  const out=[rootId],seen=new Set(out),stack=[rootId];
  while(stack.length){const id=stack.pop();(byParent.get(id)||[]).forEach(c=>{if(!seen.has(c)){seen.add(c);out.push(c);stack.push(c)}})}
  return out
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
function a4Pixels(orientation){return orientation==="portrait"?{w:2480,h:3508}:{w:3508,h:2480}}
function rgbaFromHex(hex,alpha){
  const h=String(hex||"#ffffff").replace("#",""),v=h.length===3?h.split("").map(x=>x+x).join(""):h,n=parseInt(v,16);
  if(!Number.isFinite(n))return"rgba(255,255,255,"+alpha+")";
  return"rgba("+((n>>16)&255)+","+((n>>8)&255)+","+(n&255)+","+alpha+")"
}

export function buildMindmapSvg(view,resources,{orientation="landscape",includeHidden=false,background="#ffffff"}={}){
  const resMap=new Map(resources.map(r=>[r.id,r])),hide=includeHidden?new Set():hiddenNodes(view);
  const nodes=(view.nodes||[]).filter(n=>!hide.has(n.id)&&resMap.has(n.resourceId)),nodeMap=new Map(nodes.map(n=>[n.id,n]));
  const b=bounds(nodes),pad=90,area={x:b.x-pad,y:b.y-pad,w:b.w+pad*2,h:b.h+pad*2},a4=a4Pixels(orientation);

  const frames=(view.frames||[]).map(frame=>{
    const ns=descendants(view,frame.rootNodeId).filter(id=>!hide.has(id)).map(id=>nodeMap.get(id)).filter(Boolean);if(!ns.length)return"";
    const p=Number(frame.padding)||28,minX=Math.min(...ns.map(n=>n.x))-p,minY=Math.min(...ns.map(n=>n.y))-p-20,maxX=Math.max(...ns.map(n=>n.x+NODE_W))+p,maxY=Math.max(...ns.map(n=>n.y+NODE_H))+p;
    const dash=frame.borderStyle==="dashed"?' stroke-dasharray="8 6"':"";
    return `<g><rect x="${minX}" y="${minY}" width="${maxX-minX}" height="${maxY-minY}" rx="18" fill="${rgbaFromHex(frame.backgroundColor||"#eef2ff",Math.max(0,Math.min(.4,(Number(frame.opacity)||10)/100)))}" stroke="${xml(frame.borderColor||"#6366f1")}" stroke-width="2"${dash}/><text x="${minX+14}" y="${minY-6}" font-family="Arial, sans-serif" font-size="11" font-weight="700" fill="${xml(frame.borderColor||"#6366f1")}">${xml(frame.title||"Branche")}</text></g>`
  }).join("");

  const edges=(view.edges||[]).filter(e=>nodeMap.has(e.from)&&nodeMap.has(e.to)).map(e=>{
    const a=nodeMap.get(e.from),z=nodeMap.get(e.to),sx=a.x+NODE_W,sy=a.y+37,tx=z.x,ty=z.y+37,dx=Math.max(70,Math.abs(tx-sx)*.45);
    const stroke=e.kind==="manual"?"#3b82f6":"#94a3b8",dash=e.kind==="manual"?' stroke-dasharray="7 5"':"";
    return `<path d="M ${sx} ${sy} C ${sx+dx} ${sy}, ${tx-dx} ${ty}, ${tx} ${ty}" fill="none" stroke="${stroke}" stroke-width="2.2"${dash}/>`
  }).join("");

  const cards=nodes.map(n=>{
    const r=resMap.get(n.resourceId),s=styleFor(n,r),title=wrapText(r.title,Math.max(16,Math.round(31-(Number(s.fontSize)||14)/2)),2),meta=metaFor(r);
    const align=s.textAlign==="center"?"middle":s.textAlign==="right"?"end":"start";
    const tx=s.textAlign==="center"?n.x+144:s.textAlign==="right"?n.x+224:n.x+48;
    const titleSvg=title.map((line,i)=>`<text x="${tx}" y="${n.y+25+i*17}" text-anchor="${align}" font-family="${xml(FONT_STACKS[s.fontFamily]||FONT_STACKS.system)}" font-size="${Number(s.fontSize)||14}" font-weight="${xml(s.fontWeight||"650")}" font-style="${s.italic?"italic":"normal"}" fill="${xml(s.textColor||"#172033")}">${xml(line)}</text>`).join("");
    const bw=Math.max(0,Number(s.borderWidth)||0);
    return `<g>
      <rect x="${n.x}" y="${n.y}" width="${NODE_W}" height="${NODE_H}" rx="${radius(s.shape)}" fill="${xml(s.backgroundColor||"#ffffff")}" stroke="${xml(s.borderColor||TYPE_COLORS[r.type]||"#cbd5e1")}" stroke-width="${bw}"/>
      <text x="${n.x+18}" y="${n.y+32}" font-size="21">${xml(s.icon||iconFor(r))}</text>
      ${titleSvg}
      <text x="${n.x+48}" y="${n.y+61}" font-family="Arial, sans-serif" font-size="10.5" fill="#64748b">${xml(meta)}</text>
    </g>`
  }).join("");

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${a4.w}" height="${a4.h}" viewBox="${area.x} ${area.y} ${area.w} ${area.h}" preserveAspectRatio="xMidYMid meet"><rect x="${area.x}" y="${area.y}" width="${area.w}" height="${area.h}" fill="${background}"/>${frames}${edges}${cards}</svg>`
}
function blobDownload(name,blob){const u=URL.createObjectURL(blob),a=document.createElement("a");a.href=u;a.download=name;document.body.appendChild(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(u),1500)}
export function exportSvg(name,view,resources,options){const svg=buildMindmapSvg(view,resources,options);blobDownload(name,new Blob([svg],{type:"image/svg+xml;charset=utf-8"}))}
export async function exportPng(name,view,resources,options){
  const svg=buildMindmapSvg(view,resources,options),size=a4Pixels(options?.orientation||"landscape"),u=URL.createObjectURL(new Blob([svg],{type:"image/svg+xml"}));
  try{
    const img=new Image();await new Promise((resolve,reject)=>{img.onload=resolve;img.onerror=reject;img.src=u});
    const canvas=document.createElement("canvas");canvas.width=size.w;canvas.height=size.h;const ctx=canvas.getContext("2d");ctx.fillStyle="#fff";ctx.fillRect(0,0,size.w,size.h);ctx.drawImage(img,0,0,size.w,size.h);
    const blob=await new Promise(resolve=>canvas.toBlob(resolve,"image/png",1));if(!blob)throw new Error("Conversion PNG impossible");blobDownload(name,blob)
  }finally{URL.revokeObjectURL(u)}
}
export function printA4(title,view,resources,options){
  const orientation=options?.orientation||"landscape",svg=buildMindmapSvg(view,resources,{...options,orientation}),w=window.open("","_blank");
  if(!w)throw new Error("La fenêtre d'impression a été bloquée par le navigateur.");
  const safeTitle=xml(title||"Mindmap");w.document.open();w.document.write(`<!doctype html><html><head><meta charset="utf-8"><title>${safeTitle}</title><style>@page{size:A4 ${orientation};margin:8mm}html,body{margin:0;padding:0;background:#fff}body{display:grid;place-items:center}svg{width:100%;height:auto;max-height:calc(100vh - 16mm)}@media print{svg{width:100%;height:auto;max-height:none}}</style></head><body>${svg}<script>window.addEventListener("load",()=>setTimeout(()=>window.print(),200));<\/script></body></html>`);w.document.close()
}
