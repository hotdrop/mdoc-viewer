export const DEV_AUTH_COOKIE_NAME = "md_doc_viewer_local_id_token";

export function isLocalRunMode(): boolean {
  const runMode = process.env.RUN_MODE ?? "local";
  return runMode === "local";
}
