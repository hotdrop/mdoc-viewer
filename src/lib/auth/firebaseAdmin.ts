import { getApps, initializeApp, type App } from "firebase-admin/app";
import { getAuth, type Auth } from "firebase-admin/auth";
import type { AppConfig } from "../config";

let cachedApp: App | null = null;

export function getFirebaseAuth(config: AppConfig): Auth {
  if (!cachedApp) {
    cachedApp = initializeFirebaseApp(config);
  }
  return getAuth(cachedApp);
}

function initializeFirebaseApp(config: AppConfig): App {
  const apps = getApps();
  if (apps.length > 0) {
    return apps[0]!;
  }

  const app = initializeApp({
    projectId: config.firebaseProjectId,
  });

  if (config.firebaseAuthEmulatorHost) {
    const auth = getAuth(app);
    auth.useEmulator(`http://${config.firebaseAuthEmulatorHost}`);
  }

  return app;
}
