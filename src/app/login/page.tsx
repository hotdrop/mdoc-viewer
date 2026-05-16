import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { loadAppConfig } from "@/lib/config";
import { SESSION_COOKIE_NAME, verifySessionCookie } from "@/lib/auth/token";
import { LoginClient } from "./_components/LoginClient";

export const dynamic = "force-dynamic";

export default async function LoginPage() {
  const config = loadAppConfig();
  const cookieStore = await cookies();
  const sessionCookie = cookieStore.get(SESSION_COOKIE_NAME)?.value ?? null;

  if (config.runMode === "cloud" && sessionCookie) {
    try {
      await verifySessionCookie(config, sessionCookie);
      redirect("/");
    } catch {
      // 無効な Cookie はクライアントの再ログインで上書きする。
    }
  }

  if (config.runMode === "local") {
    redirect("/local-login");
  }

  return (
    <main className="mx-auto flex min-h-screen max-w-lg flex-col justify-center gap-8 px-6 py-16">
      <section className="space-y-3">
        <h1 className="text-2xl font-semibold text-slate-100">ログイン</h1>
        <p className="text-sm text-slate-400">
          会社の Google アカウントでログインしてください。
        </p>
      </section>
      <LoginClient
        allowedDomain={config.allowedDomain}
        firebaseConfig={{
          apiKey: config.firebaseWebApiKey,
          authDomain: config.firebaseAuthDomain,
          projectId: config.firebaseProjectId,
        }}
      />
    </main>
  );
}
