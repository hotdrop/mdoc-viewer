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

  if (config.firebaseAuthEmulatorHost) {
    process.env.FIREBASE_AUTH_EMULATOR_HOST ??= config.firebaseAuthEmulatorHost;
  }

  const app = initializeApp({
    projectId: config.firebaseProjectId,
  });

  return app;
}
