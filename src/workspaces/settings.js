import {normalizeLayoutMode} from "../mindmap/layouts.js";

export const DEFAULT_AUTO_COLLAPSE_THRESHOLD=20;
export const MIN_AUTO_COLLAPSE_THRESHOLD=1;
export const MAX_AUTO_COLLAPSE_THRESHOLD=9999;

export function normalizeWorkspaceSettings(raw={}){
  const source=raw&&typeof raw==="object"?raw:{};
  const settings={...source};
  const n=Number(settings.autoCollapseThreshold);
  settings.autoCollapseLargeBranches=settings.autoCollapseLargeBranches!==false;
  settings.defaultLayoutMode=normalizeLayoutMode(settings.defaultLayoutMode,"right");
  settings.autoCollapseThreshold=Number.isFinite(n)
    ?Math.max(MIN_AUTO_COLLAPSE_THRESHOLD,Math.min(MAX_AUTO_COLLAPSE_THRESHOLD,Math.round(n)))
    :DEFAULT_AUTO_COLLAPSE_THRESHOLD;
  return settings
}

export function shouldAutoCollapse(childCount,raw={}){
  const settings=normalizeWorkspaceSettings(raw);
  return settings.autoCollapseLargeBranches&&Number(childCount)>settings.autoCollapseThreshold
}
