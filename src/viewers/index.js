let objectUrls = [];

const OFFICE_MAMMOTH = "https://cdn.jsdelivr.net/npm/mammoth@1.10.0/+esm";
const SHEET_READER = "https://cdn.jsdelivr.net/npm/@keep-lts/xlsx@0.18.6/+esm";
const FFLATE = "https://cdn.jsdelivr.net/npm/fflate@0.8.2/+esm";

function extOf(path=""){
  const name=path.split("/").pop()||"";
  const i=name.lastIndexOf(".");
  return i>=0?name.slice(i+1).toLowerCase():"";
}
function bytes(n=0){
  if(n<1024)return n+" o";
  if(n<1048576)return(n/1024).toFixed(1)+" Ko";
  if(n<1073741824)return(n/1048576).toFixed(1)+" Mo";
  return(n/1073741824).toFixed(1)+" Go";
}
function urlFor(file){
  const u=URL.createObjectURL(file);objectUrls.push(u);return u;
}
export function clearPreview(){
  objectUrls.forEach(u=>URL.revokeObjectURL(u));objectUrls=[];
}
function empty(node){node.replaceChildren()}
function openDialog(dialog){if(!dialog.open)dialog.showModal()}
function message(body,title,text,action){
  const box=document.createElement("div");box.className="preview-fallback";
  const h=document.createElement("strong");h.textContent=title;
  const p=document.createElement("p");p.textContent=text;
  box.append(h,p);
  if(action)box.append(action);
  body.append(box);
}
function button(label,fn){
  const b=document.createElement("button");b.type="button";b.textContent=label;b.addEventListener("click",fn);return b;
}
function downloadLink(file,label="⬇️ Télécharger / ouvrir le fichier"){
  const a=document.createElement("a");a.href=urlFor(file);a.download=file.name;a.className="viewer-download";a.textContent=label;return a;
}
function esc(s){return String(s??"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]))}
function safeUrl(raw){
  try{const u=new URL(raw,location.href);return["http:","https:","mailto:"].includes(u.protocol)?u.href:"#"}catch{return"#"}
}
function sanitizeHtml(html){
  const doc=new DOMParser().parseFromString("<div id=\"root\">"+html+"</div>","text/html");
  const root=doc.getElementById("root");
  root.querySelectorAll("script,style,iframe,object,embed,link,meta,base,form").forEach(n=>n.remove());
  root.querySelectorAll("*").forEach(el=>{
    [...el.attributes].forEach(a=>{
      const n=a.name.toLowerCase();
      if(n.startsWith("on")||n==="srcdoc")el.removeAttribute(a.name);
      if(["href","src","xlink:href"].includes(n)){
        const v=a.value.trim();
        if(n==="src"&&v.startsWith("data:image/"))return;
        if(n==="href")el.setAttribute(a.name,safeUrl(v));
        else if(!/^(blob:|data:image:|https?:)/i.test(v))el.removeAttribute(a.name);
      }
    });
  });
  return root.innerHTML;
}
function markdownInline(s){
  s=esc(s);
  s=s.replace(/\`([^\`]+)\`/g,"<code>$1</code>");
  s=s.replace(/\*\*([^*]+)\*\*/g,"<strong>$1</strong>");
  s=s.replace(/__([^_]+)__/g,"<strong>$1</strong>");
  s=s.replace(/\*([^*]+)\*/g,"<em>$1</em>");
  s=s.replace(/_([^_]+)_/g,"<em>$1</em>");
  s=s.replace(/\[([^\]]+)\]\(([^)]+)\)/g,(_,t,u)=>'<a href="'+safeUrl(u)+'" target="_blank" rel="noopener noreferrer">'+t+"</a>");
  return s;
}
function renderMarkdown(src){
  const lines=String(src).replace(/\r\n?/g,"\n").split("\n"),out=[];let inCode=false,code=[],list=null;
  const closeList=()=>{if(list){out.push("</"+list+">");list=null}};
  for(const line of lines){
    if(/^\s*\`\`\`/.test(line)){
      if(inCode){out.push("<pre><code>"+esc(code.join("\n"))+"</code></pre>");code=[];inCode=false}else{closeList();inCode=true}
      continue;
    }
    if(inCode){code.push(line);continue}
    if(/^\s*$/.test(line)){closeList();continue}
    const h=line.match(/^(#{1,6})\s+(.*)$/);if(h){closeList();out.push("<h"+h[1].length+">"+markdownInline(h[2])+"</h"+h[1].length+">");continue}
    const q=line.match(/^>\s?(.*)$/);if(q){closeList();out.push("<blockquote>"+markdownInline(q[1])+"</blockquote>");continue}
    const ul=line.match(/^\s*[-*+]\s+(.*)$/);if(ul){if(list!=="ul"){closeList();list="ul";out.push("<ul>")}out.push("<li>"+markdownInline(ul[1])+"</li>");continue}
    const ol=line.match(/^\s*\d+[.)]\s+(.*)$/);if(ol){if(list!=="ol"){closeList();list="ol";out.push("<ol>")}out.push("<li>"+markdownInline(ol[1])+"</li>");continue}
    closeList();out.push("<p>"+markdownInline(line)+"</p>");
  }
  closeList();if(inCode)out.push("<pre><code>"+esc(code.join("\n"))+"</code></pre>");
  return out.join("\n");
}
function textPanel(text,language="text"){
  const wrap=document.createElement("div");wrap.className="viewer-text-wrap";
  const toolbar=document.createElement("div");toolbar.className="viewer-toolbar";
  const search=document.createElement("input");search.type="search";search.placeholder="Rechercher dans le fichier…";search.className="viewer-search";
  const count=document.createElement("span");count.className="viewer-count";
  const pre=document.createElement("pre");pre.className="viewer-source";
  const lines=String(text).replace(/\r\n?/g,"\n").split("\n");
  const render=(q="")=>{
    const needle=q.toLowerCase();let hits=0;
    pre.replaceChildren();
    lines.forEach((line,i)=>{
      const row=document.createElement("div");row.className="source-line";
      const no=document.createElement("span");no.className="line-no";no.textContent=String(i+1);
      const code=document.createElement("code");
      if(needle){
        const lower=line.toLowerCase();let pos=0,idx;
        while((idx=lower.indexOf(needle,pos))>=0){
          code.append(document.createTextNode(line.slice(pos,idx)));
          const mark=document.createElement("mark");mark.textContent=line.slice(idx,idx+q.length);code.append(mark);hits++;pos=idx+q.length;
        }
        code.append(document.createTextNode(line.slice(pos)));
      }else code.textContent=line||" ";
      row.append(no,code);pre.append(row);
    });
    count.textContent=needle?(hits+" occurrence"+(hits>1?"s":"")):(lines.length+" lignes");
  };
  search.addEventListener("input",()=>render(search.value));toolbar.append(search,count);wrap.append(toolbar,pre);render();return wrap;
}
function jsonNode(value,key,depth=0){
  const details=document.createElement("details");details.open=depth<2;details.className="json-node";
  const summary=document.createElement("summary");summary.textContent=(key!==undefined?key+": ":"")+(Array.isArray(value)?"Array["+value.length+"]":"Object");details.append(summary);
  const entries=Array.isArray(value)?value.map((v,i)=>[i,v]):Object.entries(value||{});
  entries.slice(0,1000).forEach(([k,v])=>{
    if(v&&typeof v==="object")details.append(jsonNode(v,k,depth+1));
    else{const row=document.createElement("div");row.className="json-leaf";const kk=document.createElement("span");kk.textContent=k+": ";const vv=document.createElement("code");vv.textContent=typeof v==="string"?JSON.stringify(v):String(v);row.append(kk,vv);details.append(row)}
  });
  if(entries.length>1000){const more=document.createElement("div");more.textContent="… "+(entries.length-1000)+" éléments non affichés";details.append(more)}
  return details;
}
function parseCsv(text,delimiter){
  const rows=[];let row=[],cell="",quoted=false;
  for(let i=0;i<text.length;i++){
    const ch=text[i];
    if(quoted){if(ch==='"'&&text[i+1]==='"'){cell+='"';i++}else if(ch==='"')quoted=false;else cell+=ch}
    else if(ch==='"')quoted=true;
    else if(ch===delimiter){row.push(cell);cell=""}
    else if(ch==="\n"){row.push(cell);rows.push(row);row=[];cell=""}
    else if(ch!=="\r")cell+=ch;
  }
  row.push(cell);if(row.length>1||row[0]!==""||!rows.length)rows.push(row);return rows;
}
function tableFromRows(rows,{maxRows=500,maxCols=100}={}){
  const shell=document.createElement("div");shell.className="viewer-table-shell";
  const table=document.createElement("table");table.className="viewer-table";
  const limited=rows.slice(0,maxRows),cols=Math.min(maxCols,Math.max(0,...limited.map(r=>r.length)));
  limited.forEach((r,ri)=>{
    const tr=document.createElement("tr");
    for(let ci=0;ci<cols;ci++){const c=document.createElement(ri===0?"th":"td");c.textContent=r[ci]??"";tr.append(c)}
    table.append(tr);
  });shell.append(table);
  if(rows.length>maxRows){const p=document.createElement("p");p.className="viewer-note";p.textContent="Aperçu limité aux "+maxRows+" premières lignes sur "+rows.length+".";shell.append(p)}
  return shell;
}
function editableTextDocument(initial,{markdown=false,onSave=null,onMeta=null}={}){
  let current=String(initial??"");const wrap=document.createElement("div"),bar=document.createElement("div"),host=document.createElement("div");bar.className="viewer-toolbar";host.className="viewer-document";
  const buttons=[];
  const setActive=active=>buttons.forEach(b=>b.classList.toggle("active",b===active));
  const showPreview=()=>{
    if(markdown){const article=document.createElement("article");article.className="viewer-markdown";article.innerHTML=renderMarkdown(current);host.replaceChildren(article)}
    else host.replaceChildren(textPanel(current,"text"));
    setActive(previewBtn)
  };
  const showSource=()=>{host.replaceChildren(textPanel(current,markdown?"markdown":"text"));setActive(sourceBtn)};
  const previewBtn=button(markdown?"👁️ Aperçu":"👁️ Lecture",showPreview),sourceBtn=button("</> Source",showSource);buttons.push(previewBtn,sourceBtn);bar.append(previewBtn,sourceBtn);
  if(onSave){
    const editBtn=button("✏️ Modifier",()=>{
      const editor=document.createElement("div");editor.className="viewer-editor";
      const textarea=document.createElement("textarea");textarea.className="viewer-editor-area";textarea.value=current;textarea.spellcheck=true;
      const actions=document.createElement("div");actions.className="viewer-editor-actions";const status=document.createElement("span");status.className="viewer-count";
      const saveBtn=button("💾 Enregistrer",async()=>{
        saveBtn.disabled=true;status.textContent="Enregistrement…";
        try{
          const result=await onSave(textarea.value);current=textarea.value;status.textContent="Enregistré";if(onMeta)onMeta(result);showPreview()
        }catch(e){console.error(e);status.textContent="Échec";alert("Impossible d’enregistrer le fichier : "+(e.message||e))}
        finally{saveBtn.disabled=false}
      });
      actions.append(saveBtn,status);editor.append(textarea,actions);host.replaceChildren(editor);setActive(editBtn);setTimeout(()=>textarea.focus(),0)
    });
    buttons.push(editBtn);bar.append(editBtn)
  }
  wrap.append(bar,host);showPreview();return wrap
}
async function renderDocx(file,body){
  const loading=document.createElement("div");loading.className="viewer-loading";loading.textContent="Conversion locale du document Word…";body.append(loading);
  try{
    const mod=await import(OFFICE_MAMMOTH),mammoth=mod.default||mod;const result=await mammoth.convertToHtml({arrayBuffer:await file.arrayBuffer()});
    const article=document.createElement("article");article.className="viewer-docx";article.innerHTML=sanitizeHtml(result.value);
    empty(body);body.append(article);
    if(result.messages?.length){const box=document.createElement("details");box.className="viewer-warnings";const s=document.createElement("summary");s.textContent=result.messages.length+" avertissement(s) de conversion";box.append(s);result.messages.forEach(m=>{const p=document.createElement("p");p.textContent=m.message||String(m);box.append(p)});body.append(box)}
  }catch(e){empty(body);message(body,"Aperçu DOCX indisponible","La conversion locale n’a pas pu charger le module libre Mammoth. Le fichier reste intact.",downloadLink(file));console.error(e)}
}
async function renderWorkbook(file,body){
  const loading=document.createElement("div");loading.className="viewer-loading";loading.textContent="Lecture locale du classeur…";body.append(loading);
  try{
    const mod=await import(SHEET_READER),XLSX=mod.default||mod;const wb=XLSX.read(await file.arrayBuffer(),{type:"array",dense:true});
    empty(body);const bar=document.createElement("div");bar.className="viewer-toolbar";const select=document.createElement("select");select.setAttribute("aria-label","Feuille du classeur");
    wb.SheetNames.forEach(n=>{const o=document.createElement("option");o.value=n;o.textContent=n;select.append(o)});const host=document.createElement("div");
    const render=()=>{const rows=XLSX.utils.sheet_to_json(wb.Sheets[select.value],{header:1,defval:"",raw:false});host.replaceChildren(tableFromRows(rows))};
    select.addEventListener("change",render);bar.append(select);body.append(bar,host);render();
  }catch(e){empty(body);message(body,"Aperçu de classeur indisponible","Le lecteur de tableur libre n’a pas pu être chargé. Vous pouvez toujours ouvrir le fichier avec son application habituelle.",downloadLink(file));console.error(e)}
}
async function renderZip(file,body){
  const loading=document.createElement("div");loading.className="viewer-loading";loading.textContent="Lecture de l’archive…";body.append(loading);
  try{
    const {unzipSync}=await import(FFLATE);const data=unzipSync(new Uint8Array(await file.arrayBuffer()));empty(body);
    const list=document.createElement("div");list.className="archive-list";
    Object.entries(data).slice(0,2000).forEach(([name,bytes])=>{const row=document.createElement("div");row.className="archive-row";const n=document.createElement("span");n.textContent=name;const s=document.createElement("span");s.textContent=bytes.length?bytes.length+" o":"";row.append(n,s);list.append(row)});body.append(list);
  }catch(e){empty(body);message(body,"Archive non prévisualisable","Impossible de lire cette archive dans le navigateur.",downloadLink(file));console.error(e)}
}
export async function showFilePreview(resource,file,ui,options={}){
  clearPreview();ui.title.textContent=resource.title;ui.meta.textContent=(resource.path||file.name)+" — "+bytes(file.size);empty(ui.body);
  const ext=extOf(resource.path||file.name),mime=file.type||"";
  if(mime.startsWith("image/")||["png","jpg","jpeg","gif","webp","svg","bmp","avif"].includes(ext)){
    const wrap=document.createElement("div");wrap.className="image-viewer";const bar=document.createElement("div");bar.className="viewer-toolbar";const img=document.createElement("img");img.src=urlFor(file);img.alt=resource.title;let z=1;
    const apply=()=>{img.style.transform="scale("+z+")";zoomLabel.textContent=Math.round(z*100)+"%"};
    const zoomLabel=document.createElement("span");zoomLabel.className="viewer-count";bar.append(button("−",()=>{z=Math.max(.25,z/1.2);apply()}),zoomLabel,button("＋",()=>{z=Math.min(8,z*1.2);apply()}),button("100 %",()=>{z=1;apply()}),downloadLink(file,"↗ Ouvrir / enregistrer"));wrap.append(bar,img);ui.body.append(wrap);apply();
  }else if(mime.startsWith("audio/")||["mp3","wav","ogg","m4a","flac","aac"].includes(ext)){
    const x=document.createElement("audio");x.src=urlFor(file);x.controls=true;ui.body.append(x);
  }else if(mime.startsWith("video/")||["mp4","webm","mov","m4v"].includes(ext)){
    const x=document.createElement("video");x.src=urlFor(file);x.controls=true;ui.body.append(x);
  }else if(mime==="application/pdf"||ext==="pdf"){
    const x=document.createElement("iframe");x.src=urlFor(file);x.title=resource.title;ui.body.append(x);
  }else if(ext==="docx"){
    await renderDocx(file,ui.body);
  }else if(["xlsx","xls","xlsm","xlsb","ods"].includes(ext)){
    await renderWorkbook(file,ui.body);
  }else if(ext==="zip"){
    await renderZip(file,ui.body);
  }else if(ext==="json"){
    try{const data=JSON.parse(await file.text());const root=document.createElement("div");root.className="json-tree";root.append(jsonNode(data,undefined,0));ui.body.append(root)}
    catch{ui.body.append(textPanel(await file.text(),"json"))}
  }else if(["csv","tsv"].includes(ext)){
    const text=await file.text();ui.body.append(tableFromRows(parseCsv(text,ext==="tsv"?"\t":",")));
  }else if(["md","markdown"].includes(ext)){
    const src=await file.text();ui.body.append(editableTextDocument(src,{markdown:true,onSave:options.onSaveText,onMeta:r=>{if(r&&Number.isFinite(r.size))ui.meta.textContent=(resource.path||file.name)+" — "+bytes(r.size)}}));
  }else if(mime.startsWith("text/")||["txt","log","js","mjs","ts","css","html","xml","yaml","yml","py","ini","toml","sql","java","c","cpp","h","cs","php"].includes(ext)){
    if(file.size>8000000)message(ui.body,"Fichier texte volumineux","L’aperçu est limité à 8 Mo pour éviter de bloquer l’interface.",downloadLink(file));
    else{const src=await file.text();if(ext==="txt")ui.body.append(editableTextDocument(src,{markdown:false,onSave:options.onSaveText,onMeta:r=>{if(r&&Number.isFinite(r.size))ui.meta.textContent=(resource.path||file.name)+" — "+bytes(r.size)}}));else ui.body.append(textPanel(src,ext))}
  }else if(["pptx","ppt","odp"].includes(ext)){
    message(ui.body,"Présentation détectée","La prévisualisation fidèle des présentations n’est pas encore disponible dans cette version. Elle est prévue dans le backlog.",downloadLink(file));
  }else{
    message(ui.body,"Pas de prévisualisation intégrée","Ce format n’a pas encore de viewer. Le fichier reste accessible sans conversion.",downloadLink(file));
  }
  openDialog(ui.dialog);
}
function resourceIcon(r){
  if(r.type==="folder"||r.type==="root")return"📁";if(r.type==="virtual")return"💡";if(r.type==="url")return"🔗";
  const e=extOf(r.path);if(["png","jpg","jpeg","gif","webp","svg"].includes(e))return"🖼️";if(e==="pdf")return"📕";if(["md","txt"].includes(e))return"📝";if(["doc","docx"].includes(e))return"📘";if(["xls","xlsx","ods","csv"].includes(e))return"📊";if(["mp3","wav","ogg"].includes(e))return"🔊";if(["mp4","webm","mov"].includes(e))return"🎬";return"📄"
}
function parentPath(path=""){const i=path.lastIndexOf("/");return i<0?"":path.slice(0,i)}
export function showFolderPreview(folder,resources,ui,onOpen){
  clearPreview();ui.title.textContent=folder.title;ui.meta.textContent=folder.type==="root"?"Racine du workspace":"Dossier — "+folder.path;empty(ui.body);
  const path=folder.path||"",children=resources.filter(r=>!r.missing&&!r.excluded&&r.id!==folder.id&&["folder","file","url","virtual"].includes(r.type)&&((r.type==="url"||r.type==="virtual")?false:parentPath(r.path||"")===path));
  const head=document.createElement("div");head.className="gallery-head";const p=document.createElement("p");p.textContent=children.length+" élément"+(children.length>1?"s":"")+" directement dans ce dossier.";head.append(p);ui.body.append(head);
  const grid=document.createElement("div");grid.className="resource-gallery";
  if(!children.length){message(grid,"Dossier vide","Aucune ressource directe à afficher.");}
  children.forEach(r=>{const card=document.createElement("button");card.type="button";card.className="resource-card";const ic=document.createElement("span");ic.className="resource-card-icon";ic.textContent=resourceIcon(r);const t=document.createElement("strong");t.textContent=r.title;const meta=document.createElement("small");meta.textContent=r.tags?.length?r.tags.map(x=>"#"+x).join(" "):(r.type==="folder"?"Dossier":extOf(r.path||"").toUpperCase()||"Fichier");card.append(ic,t,meta);card.addEventListener("click",()=>onOpen(r));grid.append(card)});ui.body.append(grid);openDialog(ui.dialog);
}
