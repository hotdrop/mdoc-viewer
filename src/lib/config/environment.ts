import path from "node:path";

export type RunMode = "local" | "cloud";

export type AppConfig = {
  runMode: RunMode;
  allowedDomain: string;
  firebaseProjectId: string;
  firebaseWebApiKey: string;
  firebaseAuthEmulatorHost?: string;
  gcpProjectId?: string;
  gcsBucket?: string;
  localDocsRoot?: string;
};

const RUN_MODE_VALUES: RunMode[] = ["local", "cloud"];

export function resolveRunMode(value = process.env.RUN_MODE): RunMode {
  if (!value || !RUN_MODE_VALUES.includes(value as RunMode)) {
    return "local";
  }
  return value as RunMode;
}

export function loadAppConfig(): AppConfig {
  const runMode = resolveRunMode();
  const allowedDomain = (process.env.ALLOWED_DOMAIN ?? "").trim();
  const firebaseProjectId = (process.env.FIREBASE_PROJECT_ID ?? "").trim();
  const firebaseWebApiKey = (process.env.FIREBASE_WEB_API_KEY ?? "").trim();
  const firebaseAuthEmulatorHost = process.env.FIREBASE_AUTH_EMULATOR_HOST;
  const gcpProjectId = process.env.GCP_PROJECT_ID?.trim();
  const gcsBucket = process.env.GCS_BUCKET?.trim();
  const localDocsRoot = process.env.LOCAL_DOCS_ROOT
    ? path.resolve(process.env.LOCAL_DOCS_ROOT)
    : undefined;

  if (!allowedDomain) {
    throw new Error("環境変数 ALLOWED_DOMAIN が設定されていません。");
  }
  if (!firebaseProjectId) {
    throw new Error("環境変数 FIREBASE_PROJECT_ID が設定されていません。");
  }
  if (!firebaseWebApiKey) {
    throw new Error("環境変数 FIREBASE_WEB_API_KEY が設定されていません。");
  }

  if (runMode === "cloud") {
    if (!gcpProjectId) {
      throw new Error("cloud モードでは GCP_PROJECT_ID が必要です。");
    }
    if (!gcsBucket) {
      throw new Error("cloud モードでは GCS_BUCKET が必要です。");
    }
  } else {
    if (!localDocsRoot) {
      throw new Error("local モードでは LOCAL_DOCS_ROOT が必要です。");
    }
  }

  return {
    runMode,
    allowedDomain,
    firebaseProjectId,
    firebaseWebApiKey,
    firebaseAuthEmulatorHost,
    gcpProjectId,
    gcsBucket,
    localDocsRoot,
  };
}
