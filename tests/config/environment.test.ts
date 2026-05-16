import { afterEach, describe, expect, it } from "vitest";
import { loadAppConfig } from "@/lib/config/environment";

const ORIGINAL_ENV = { ...process.env };

describe("loadAppConfig", () => {
  afterEach(() => {
    process.env = { ...ORIGINAL_ENV };
  });

  it("rejects Firebase Auth Emulator in cloud mode", () => {
    process.env = {
      ...ORIGINAL_ENV,
      RUN_MODE: "cloud",
      ALLOWED_DOMAIN: "example.co.jp",
      FIREBASE_PROJECT_ID: "test-project",
      FIREBASE_WEB_API_KEY: "test-api-key",
      GCP_PROJECT_ID: "test-gcp-project",
      GCS_BUCKET: "test-bucket",
      FIREBASE_AUTH_EMULATOR_HOST: "localhost:9099",
    };

    expect(() => loadAppConfig()).toThrow(
      "cloud モードでは FIREBASE_AUTH_EMULATOR_HOST を設定できません。",
    );
  });

  it("allows Firebase Auth Emulator in local mode", () => {
    process.env = {
      ...ORIGINAL_ENV,
      RUN_MODE: "local",
      ALLOWED_DOMAIN: "example.co.jp",
      FIREBASE_PROJECT_ID: "test-project",
      FIREBASE_WEB_API_KEY: "test-api-key",
      LOCAL_DOCS_ROOT: "./test_docs",
      FIREBASE_AUTH_EMULATOR_HOST: "localhost:9099",
    };

    expect(loadAppConfig()).toMatchObject({
      runMode: "local",
      firebaseAuthEmulatorHost: "localhost:9099",
    });
  });
});
