export const DEV_CMD_PROTOCOL = "dev-cmd-v1";
export const DEV_CMD_ACTIONS = Object.freeze(["ISSUE", "ANALYZE", "FIX", "CONTINUE", "REVIEW"]);

function uuid(){
  return globalThis.crypto?.randomUUID?.() || `dev-${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

export function createDevCmdBlock({action="ISSUE", description="", version="", requestId=uuid()} = {}){
  const safeAction = DEV_CMD_ACTIONS.includes(String(action).toUpperCase())
    ? String(action).toUpperCase()
    : "ISSUE";
  return [
    "[DEV-CMD]",
    "",
    "PROTOCOL: DEV-CMD/1",
    "PROJECT: mindspark-visual-workshop",
    `ACTION: ${safeAction}`,
    `REQUEST-ID: ${requestId}`,
    "REPOSITORY: Carouan/glom-visual-workspace",
    version ? `VERSION: ${version}` : null,
    "",
    "DESCRIPTION:",
    String(description || "").trim()
  ].filter((line)=>line!==null).join("\n");
}

export function buildGitHubIssueUrl(payload = {}){
  const body=createDevCmdBlock(payload);
  const action=String(payload.action||"ISSUE").toUpperCase();
  const url=new URL("https://github.com/Carouan/glom-visual-workspace/issues/new");
  url.searchParams.set("labels","dev-cmd");
  url.searchParams.set("title",`[DEV-CMD] ${action} — mindspark-visual-workshop`);
  url.searchParams.set("body",body);
  return url.toString();
}

export function buildMailUrl(payload = {}){
  const body=createDevCmdBlock(payload);
  const action=String(payload.action||"ISSUE").toUpperCase();
  const url=new URL("mailto:");
  url.searchParams.set("subject",`[DEV-CMD] ${action} — MindSpark`);
  url.searchParams.set("body",body);
  return url.toString();
}
