const FFLATE="https://cdn.jsdelivr.net/npm/fflate@0.8.2/+esm";

function safeArchiveName(s){
  return(s||"workspace").normalize("NFKD").replace(/[\u0300-\u036f]/g,"").replace(/[^a-zA-Z0-9._-]+/g,"-").replace(/^-+|-+$/g,"").toLowerCase()||"workspace"
}
function jsonText(obj){return JSON.stringify(obj,null,2)+"\n"}
function downloadBlob(name,blob){
  const u=URL.createObjectURL(blob),a=document.createElement("a");a.href=u;a.download=name;document.body.appendChild(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(u),1500)
}
export function workspacePayloads(workspace,resources,view,appVersion){
  const now=new Date().toISOString();
  const w={...workspace,updatedAt:now,appVersion:appVersion||workspace.appVersion};
  const v={...view,updatedAt:now};
  const rp={format:"glom-resources",version:1,workspaceId:w.id,updatedAt:now,resources};
  return{workspace:w,resources:rp,view:v}
}
export async function exportWorkspaceTemplateZip(workspace,resources,view,appVersion){
  const mod=await import(FFLATE),zipSync=mod.zipSync||mod.default?.zipSync,strToU8=mod.strToU8||mod.default?.strToU8;
  if(!zipSync||!strToU8)throw new Error("Module ZIP indisponible");
  const payload=workspacePayloads(workspace,resources,view,appVersion),entries={};
  const folders=resources.filter(r=>r.type==="folder"&&!r.missing&&r.path).sort((a,b)=>a.path.split("/").length-b.path.split("/").length||a.path.localeCompare(b.path));
  for(const r of folders)entries[r.path.replace(/\/+$/,"")+"/"]=new Uint8Array(0);
  entries[".glom/"]=new Uint8Array(0);
  entries[".glom/views/"]=new Uint8Array(0);
  entries[".glom/workspace.json"]=strToU8(jsonText(payload.workspace));
  entries[".glom/resources.json"]=strToU8(jsonText(payload.resources));
  entries[".glom/views/main-mindmap.json"]=strToU8(jsonText(payload.view));
  const planned=resources.filter(r=>r.type==="file"&&r.path).map(r=>r.path);
  const readme=[
    "G.L.O.M. Visual Workspace — template de workspace",
    "",
    "Cette archive contient l'arborescence de dossiers et les métadonnées ouvertes du workspace (.glom/).",
    "Elle ne copie pas les fichiers de contenu dans cette version de l'export template.",
    planned.length?"Les ressources fichier ci-dessous sont donc conservées comme références planifiées et apparaîtront absentes jusqu'à ce qu'un vrai fichier correspondant soit ajouté :":"Aucune ressource fichier planifiée.",
    ...planned.map(p=>" - "+p),
    "",
    "Supprimer .glom/ n'endommage jamais l'arborescence de dossiers.",
    "Export : "+new Date().toISOString()
  ].join("\n");
  entries["README-GLOM.txt"]=strToU8(readme);
  const bytes=zipSync(entries,{level:6});
  downloadBlob(safeArchiveName(workspace.name)+"-workspace.zip",new Blob([bytes],{type:"application/zip"}));
  return{folders:folders.length,plannedFiles:planned.length,bytes:bytes.length}
}
