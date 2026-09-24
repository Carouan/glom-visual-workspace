export const LAYOUT_MODES=["right","left","down","balanced","radial"];

export function normalizeLayoutMode(value,fallback="right"){
  return LAYOUT_MODES.includes(value)?value:(LAYOUT_MODES.includes(fallback)?fallback:"right")
}

function tree(nodes,edges){
  const ids=new Set((nodes||[]).map(n=>n.id)),children=new Map([...ids].map(id=>[id,[]])),incoming=new Map([...ids].map(id=>[id,null]));
  for(const edge of edges||[]){
    if(edge?.kind!=="hierarchy"||!ids.has(edge.from)||!ids.has(edge.to))continue;
    children.get(edge.from).push(edge.to);if(incoming.get(edge.to)==null)incoming.set(edge.to,edge.from)
  }
  return{ids,children,incoming}
}

export function hierarchyRootId(nodes,edges,preferred=null){
  const t=tree(nodes,edges);if(preferred&&t.ids.has(preferred))return preferred;
  return(nodes||[]).find(n=>t.incoming.get(n.id)==null)?.id||(nodes||[])[0]?.id||null
}

export function subtreeIds(nodes,edges,rootId){
  const t=tree(nodes,edges);if(!rootId||!t.ids.has(rootId))return[];
  const out=[],seen=new Set(),stack=[rootId];
  while(stack.length){const id=stack.pop();if(seen.has(id))continue;seen.add(id);out.push(id);const c=t.children.get(id)||[];for(let i=c.length-1;i>=0;i--)stack.push(c[i])}
  return out
}

export function hierarchyDepths(nodes,edges,rootId){
  const t=tree(nodes,edges),out=new Map();if(!rootId||!t.ids.has(rootId))return out;
  const queue=[[rootId,0]];while(queue.length){const [id,d]=queue.shift();if(out.has(id))continue;out.set(id,d);for(const c of t.children.get(id)||[])queue.push([c,d+1])}
  return out
}

function linear(children,rootId,mode){
  const pos=new Map();let leaf=0;
  function place(id,depth){
    const c=children.get(id)||[];let cross;
    if(!c.length)cross=leaf++*112;
    else{const values=c.map(ch=>place(ch,depth+1));cross=values.reduce((a,b)=>a+b,0)/values.length}
    if(mode==="down")pos.set(id,{x:cross*2.7,y:depth*170});
    else pos.set(id,{x:(mode==="left"?-1:1)*depth*330,y:cross});
    return cross
  }
  place(rootId,0);return pos
}

function balanced(children,rootId){
  const pos=new Map([[rootId,{x:0,y:0}]]),direct=children.get(rootId)||[],right=direct.filter((_,i)=>i%2===0),left=direct.filter((_,i)=>i%2===1);
  function side(roots,sign){
    const local=new Map();let leaf=0;
    function place(id,depth){
      const c=children.get(id)||[];let y;
      if(!c.length)y=leaf++*112;
      else{const values=c.map(ch=>place(ch,depth+1));y=values.reduce((a,b)=>a+b,0)/values.length}
      local.set(id,{x:sign*depth*330,y});return y
    }
    roots.forEach(id=>place(id,1));if(!local.size)return;
    const ys=[...local.values()].map(p=>p.y),center=(Math.min(...ys)+Math.max(...ys))/2;
    local.forEach((p,id)=>pos.set(id,{x:p.x,y:p.y-center}))
  }
  side(right,1);side(left,-1);return pos
}

function radial(children,rootId){
  const pos=new Map([[rootId,{x:0,y:0}]]),memo=new Map();
  function weight(id){if(memo.has(id))return memo.get(id);const c=children.get(id)||[],w=c.length?c.reduce((sum,ch)=>sum+weight(ch),0):1;memo.set(id,w);return w}
  function place(id,depth,start,end){
    const c=children.get(id)||[];if(!c.length)return;const total=c.reduce((sum,ch)=>sum+weight(ch),0);let cursor=start;
    for(const ch of c){const span=(end-start)*(weight(ch)/total),a0=cursor,a1=cursor+span,angle=(a0+a1)/2,r=(depth+1)*300;pos.set(ch,{x:Math.cos(angle)*r,y:Math.sin(angle)*r});place(ch,depth+1,a0,a1);cursor=a1}
  }
  place(rootId,0,-Math.PI,Math.PI);return pos
}

export function computeTreeLayout(nodes,edges,{rootId=null,mode="right",anchor={x:0,y:0}}={}){
  const t=tree(nodes,edges),root=hierarchyRootId(nodes,edges,rootId);if(!root)return new Map();
  const normalized=normalizeLayoutMode(mode),raw=normalized==="balanced"?balanced(t.children,root):normalized==="radial"?radial(t.children,root):linear(t.children,root,normalized),rootPos=raw.get(root)||{x:0,y:0},dx=(Number(anchor?.x)||0)-rootPos.x,dy=(Number(anchor?.y)||0)-rootPos.y;
  const out=new Map();for(const [id,p] of raw)out.set(id,{x:p.x+dx,y:p.y+dy});return out
}
