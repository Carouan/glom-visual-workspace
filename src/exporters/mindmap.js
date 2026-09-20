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
function styleFor(n,r){return Object.assign({icon:"",fontSize:14,width:240,height:74,fontFamily:"system",fontWeight:"650",italic:false,textAlign:"left",textColor:"#172033",backgroundColor:"#ffffff",borderColor:TYPE_COLORS[r?.type]||"#d8deea",borderWidth:1,shape:"rounded"},n.style||{})}
function nodeDims(n,r){const s=styleFor(n,r);return{w:Math.max(140,Number(s.width)||240),h:Math.max(60,Number(s.height)||74)}}
function edgeGeometry(a,z,ad,zd,curvature=42){
  const ac={x:a.x+ad.w/2,y:a.y+ad.h/2},bc={x:z.x+zd.w/2,y:z.y+zd.h/2},dx=bc.x-ac.x,dy=bc.y-ac.y,c=Math.max(0,Math.min(100,Number(curvature)||0)),vertical=Math.abs(dy)>Math.abs(dx)*1.15;
  if(vertical){
    const dir=dy>=0?1:-1,sx=ac.x,sy=dy>=0?a.y+ad.h:a.y,tx=bc.x,ty=dy>=0?z.y:z.y+zd.h,gap=Math.abs(ty-sy),bend=c?Math.max(18,gap*(c/100)):0;
    return{sx,sy,tx,ty,mx:(sx+tx)/2,my:(sy+ty)/2,d:c?`M ${sx} ${sy} C ${sx} ${sy+dir*bend}, ${tx} ${ty-dir*bend}, ${tx} ${ty}`:`M ${sx} ${sy} L ${tx} ${ty}`}
  }
  const dir=dx>=0?1:-1,sx=dx>=0?a.x+ad.w:a.x,sy=ac.y,tx=dx>=0?z.x:z.x+zd.w,ty=bc.y,gap=Math.abs(tx-sx),bend=c?Math.max(18,gap*(c/100)):0;
  return{sx,sy,tx,ty,mx:(sx+tx)/2,my:(sy+ty)/2,d:c?`M ${sx} ${sy} C ${sx+dir*bend} ${sy}, ${tx-dir*bend} ${ty}, ${tx} ${ty}`:`M ${sx} ${sy} L ${tx} ${ty}`}
}
function edgeStyle(e){return Object.assign(e.kind==="manual"?{color:"#3b82f6",width:2.2,lineStyle:"dashed",arrow:"none",curvature:42}:{color:"#94a3b8",width:2.2,lineStyle:"solid",arrow:"none",curvature:42},e.style||{})}
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
function bounds(nodes,resMap,objects=[]){
  const boxes=[
    ...nodes.map(n=>{const d=nodeDims(n,resMap.get(n.resourceId));return{x:n.x,y:n.y,w:d.w,h:d.h}}),
    ...objects.map(o=>({x:Number(o.x)||0,y:Number(o.y)||0,w:Number(o.w)||120,h:Number(o.h)||60}))
  ];
  if(!boxes.length)return{x:0,y:0,w:100,h:100};
  const minX=Math.min(...boxes.map(b=>b.x)),minY=Math.min(...boxes.map(b=>b.y));
  const maxX=Math.max(...boxes.map(b=>b.x+b.w)),maxY=Math.max(...boxes.map(b=>b.y+b.h));
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
  const nodes=(view.nodes||[]).filter(n=>!hide.has(n.id)&&resMap.has(n.resourceId)&&!resMap.get(n.resourceId).excluded),nodeMap=new Map(nodes.map(n=>[n.id,n])),objects=Array.isArray(view.objects)?view.objects:[];
  const b=bounds(nodes,resMap,objects),pad=90,area={x:b.x-pad,y:b.y-pad,w:b.w+pad*2,h:b.h+pad*2},a4=a4Pixels(orientation);

  const frames=(view.frames||[]).map(frame=>{
    const ns=descendants(view,frame.rootNodeId).filter(id=>!hide.has(id)).map(id=>nodeMap.get(id)).filter(Boolean);if(!ns.length)return"";
    const p=Number(frame.padding)||28,minX=Math.min(...ns.map(n=>n.x))-p,minY=Math.min(...ns.map(n=>n.y))-p-28,maxX=Math.max(...ns.map(n=>n.x+nodeDims(n,resMap.get(n.resourceId)).w))+p,maxY=Math.max(...ns.map(n=>n.y+nodeDims(n,resMap.get(n.resourceId)).h))+p;
    const dash=frame.borderStyle==="dashed"?' stroke-dasharray="8 6"':"",fs=Math.max(8,Number(frame.fontSize)||12),family=FONT_STACKS[frame.fontFamily]||FONT_STACKS.system;
    return `<g><rect x="${minX}" y="${minY}" width="${maxX-minX}" height="${maxY-minY}" rx="18" fill="${rgbaFromHex(frame.backgroundColor||"#eef2ff",Math.max(0,Math.min(.4,(Number(frame.opacity)||10)/100)))}" stroke="${xml(frame.borderColor||"#6366f1")}" stroke-width="2"${dash}/><text x="${minX+14}" y="${minY-7}" font-family="${xml(family)}" font-size="${fs}" font-weight="${xml(frame.fontWeight||"800")}" font-style="${frame.italic?"italic":"normal"}" fill="${xml(frame.textColor||frame.borderColor||"#6366f1")}">${xml(frame.title||"Branche")}</text></g>`
  }).join("");

  const edges=(view.edges||[]).filter(e=>nodeMap.has(e.from)&&nodeMap.has(e.to)).map(e=>{
    const a=nodeMap.get(e.from),z=nodeMap.get(e.to),ad=nodeDims(a,resMap.get(a.resourceId)),zd=nodeDims(z,resMap.get(z.resourceId)),s=edgeStyle(e),g=edgeGeometry(a,z,ad,zd,s.curvature),markerId="rel-"+String(e.id||"edge").replace(/[^a-zA-Z0-9_-]/g,"");
    const dash=s.lineStyle==="dashed"?' stroke-dasharray="8 6"':s.lineStyle==="dotted"?' stroke-dasharray="2 6"':"",arrow=s.arrow==="none"?"":`<defs><marker id="${markerId}" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse" markerUnits="strokeWidth"><path d="M 0 0 L 10 5 L 0 10 z" fill="${xml(s.color)}"/></marker></defs>`,markers=(s.arrow==="end"||s.arrow==="both"?` marker-end="url(#${markerId})"`:"")+(s.arrow==="both"?` marker-start="url(#${markerId})"`:""),label=e.label?`<text x="${g.mx}" y="${g.my-7}" text-anchor="middle" dominant-baseline="central" font-family="Arial, sans-serif" font-size="12" font-weight="600" fill="${xml(s.color)}" stroke="${xml(background)}" stroke-width="5" paint-order="stroke fill">${xml(e.label)}</text>`:"";
    return `${arrow}<path d="${g.d}" fill="none" stroke="${xml(s.color)}" stroke-width="${Number(s.width)||2.2}"${dash}${markers}/>${label}`
  }).join("");

  const visualObjects=objects.map(o=>{
    const x=Number(o.x)||0,y=Number(o.y)||0,w=Math.max(1,Number(o.w)||120),h=Math.max(1,Number(o.h)||60);
    if(o.type==="text"){
      const fs=Math.max(8,Number(o.fontSize)||18),lines=wrapText(o.text||"Texte",Math.max(10,Math.floor(w/(fs*.56))),Math.max(1,Math.floor(h/(fs*1.25)))),family=FONT_STACKS[o.fontFamily]||FONT_STACKS.system,anchor=o.textAlign==="center"?"middle":o.textAlign==="right"?"end":"start",tx=o.textAlign==="center"?x+w/2:o.textAlign==="right"?x+w-8:x+8;
      return `<g>${lines.map((line,i)=>`<text x="${tx}" y="${y+fs+4+i*fs*1.2}" text-anchor="${anchor}" font-family="${xml(family)}" font-size="${fs}" font-weight="${xml(o.fontWeight||"500")}" font-style="${o.italic?"italic":"normal"}" fill="${xml(o.textColor||"#172033")}">${xml(line)}</text>`).join("")}</g>`
    }
    if(o.type==="image"){
      const opacity=Math.max(.1,Math.min(1,(Number(o.opacity)||100)/100)),radius=Math.max(0,Number(o.radius)||0),fit=o.fit||"contain",preserve=fit==="fill"?"none":fit==="cover"?"xMidYMid slice":"xMidYMid meet",href=o.dataUrl||"",clipId="imgclip-"+String(o.id||"image").replace(/[^a-zA-Z0-9_-]/g,"");
      if(!href)return `<g><rect x="${x}" y="${y}" width="${w}" height="${h}" rx="${radius}" fill="#f1f5f9" stroke="#cbd5e1"/><text x="${x+w/2}" y="${y+h/2}" text-anchor="middle" dominant-baseline="middle" font-family="Arial, sans-serif" font-size="12" fill="#64748b">Image indisponible</text></g>`;
      return `<g opacity="${opacity}"><defs><clipPath id="${clipId}"><rect x="${x}" y="${y}" width="${w}" height="${h}" rx="${radius}"/></clipPath></defs><image x="${x}" y="${y}" width="${w}" height="${h}" href="${xml(href)}" preserveAspectRatio="${preserve}" clip-path="url(#${clipId})"/></g>`
    }
    const fill=xml(o.fill||"#e0e7ff"),stroke=xml(o.stroke||"#6366f1");
    if(o.shape==="ellipse")return `<ellipse cx="${x+w/2}" cy="${y+h/2}" rx="${w/2}" ry="${h/2}" fill="${fill}" stroke="${stroke}" stroke-width="2"/>`;
    if(o.shape==="diamond")return `<polygon points="${x+w/2},${y} ${x+w},${y+h/2} ${x+w/2},${y+h} ${x},${y+h/2}" fill="${fill}" stroke="${stroke}" stroke-width="2"/>`;
    return `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="8" fill="${fill}" stroke="${stroke}" stroke-width="2"/>`
  }).join("");

  const cards=nodes.map(n=>{
    const r=resMap.get(n.resourceId),s=styleFor(n,r),d=nodeDims(n,r),title=wrapText(r.title,Math.max(12,Math.floor((d.w-70)/Math.max(7,(Number(s.fontSize)||14)*.56))),Math.max(2,Math.floor((d.h-34)/Math.max(14,(Number(s.fontSize)||14)*1.2)))),meta=metaFor(r);
    const align=s.textAlign==="center"?"middle":s.textAlign==="right"?"end":"start";
    const tx=s.textAlign==="center"?n.x+d.w/2:s.textAlign==="right"?n.x+d.w-16:n.x+48;
    const titleSvg=title.map((line,i)=>`<text x="${tx}" y="${n.y+24+i*(Number(s.fontSize)||14)*1.2}" text-anchor="${align}" font-family="${xml(FONT_STACKS[s.fontFamily]||FONT_STACKS.system)}" font-size="${Number(s.fontSize)||14}" font-weight="${xml(s.fontWeight||"650")}" font-style="${s.italic?"italic":"normal"}" fill="${xml(s.textColor||"#172033")}">${xml(line)}</text>`).join("");
    const bw=Math.max(0,Number(s.borderWidth)||0);
    return `<g>
      <rect x="${n.x}" y="${n.y}" width="${d.w}" height="${d.h}" rx="${radius(s.shape)}" fill="${xml(s.backgroundColor||"#ffffff")}" stroke="${xml(s.borderColor||TYPE_COLORS[r.type]||"#cbd5e1")}" stroke-width="${bw}"/>
      <text x="${n.x+18}" y="${n.y+32}" font-size="21">${xml(s.icon||iconFor(r))}</text>
      ${titleSvg}
      <text x="${n.x+48}" y="${n.y+d.h-12}" font-family="Arial, sans-serif" font-size="10.5" fill="#64748b">${xml(meta)}</text>
    </g>`
  }).join("");

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${a4.w}" height="${a4.h}" viewBox="${area.x} ${area.y} ${area.w} ${area.h}" preserveAspectRatio="xMidYMid meet"><rect x="${area.x}" y="${area.y}" width="${area.w}" height="${area.h}" fill="${background}"/>${frames}${edges}${visualObjects}${cards}</svg>`
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
  const orientation=options?.orientation||"landscape",svg=buildMindmapSvg(view,resources,{...options,orientation}),w=options?.targetWindow||window.open("","_blank");
  if(!w)throw new Error("La fenêtre d'impression a été bloquée par le navigateur.");
  const safeTitle=xml(title||"Mindmap");w.document.open();w.document.write(`<!doctype html><html><head><meta charset="utf-8"><title>${safeTitle}</title><style>@page{size:A4 ${orientation};margin:8mm}html,body{margin:0;padding:0;background:#fff}body{display:grid;place-items:center}svg{width:100%;height:auto;max-height:calc(100vh - 16mm)}@media print{svg{width:100%;height:auto;max-height:none}}</style></head><body>${svg}<script>window.addEventListener("load",()=>setTimeout(()=>window.print(),200));<\/script></body></html>`);w.document.close()
}
