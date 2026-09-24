export function nodesForResource(nodes,resourceId){
  return(nodes||[]).filter(n=>n?.resourceId===resourceId)
}

export function primaryOccurrence(nodes,resourceId){
  const same=nodesForResource(nodes,resourceId);if(!same.length)return null;
  return same.find(n=>n.occurrence==="primary")
    ||same.find(n=>n.occurrence!=="alias"&&n.id==="n-"+resourceId)
    ||same.find(n=>n.occurrence!=="alias")
    ||same[0]
}

export function isSecondaryOccurrence(nodes,node){
  if(!node)return false;if(node.occurrence==="alias")return true;
  const primary=primaryOccurrence(nodes,node.resourceId);return!!primary&&primary.id!==node.id
}

export function normalizeOccurrenceGroup(nodes,resourceId){
  const same=nodesForResource(nodes,resourceId),primary=primaryOccurrence(same,resourceId);
  return same.map(n=>({...n,occurrence:n.id===primary?.id?"primary":"alias"}))
}

export function mergeOccurrenceGroup(existingNodes,resourceId,fallbackNode){
  const group=nodesForResource(existingNodes,resourceId),oldPrimary=primaryOccurrence(group,resourceId);
  const primary={...(oldPrimary||fallbackNode),occurrence:"primary"};
  const aliases=group.filter(n=>n!==oldPrimary).map(n=>({...n,occurrence:"alias"}));
  return{primary,aliases}
}
