"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { initializeApp, getApps } from "firebase/app";
import {
  GoogleAuthProvider,
  getAuth,
  signInWithPopup,
  signOut,
} from "firebase/auth";

type FirebaseBrowserConfig = {
  apiKey: string;
  authDomain: string;
  projectId: string;
};

type LoginClientProps = {
  allowedDomain: string;
  firebaseConfig: FirebaseBrowserConfig;
};

export function LoginClient({
  allowedDomain,
  firebaseConfig,
}: LoginClientProps) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const auth = useMemo(() => {
    const app =
      getApps().length > 0 ? getApps()[0]! : initializeApp(firebaseConfig);
    return getAuth(app);
  }, [firebaseConfig]);

  const handleLogin = async () => {
    setError(null);
    setIsLoading(true);
    const provider = new GoogleAuthProvider();
    provider.setCustomParameters({
      hd: allowedDomain,
      prompt: "select_account",
    });

    try {
      const credential = await signInWithPopup(auth, provider);
      const email = credential.user.email?.toLowerCase() ?? "";
      if (!email.endsWith(`@${allowedDomain.toLowerCase()}`)) {
        await signOut(auth);
        setError("許可された会社ドメインの Google アカウントでログインしてください。");
        return;
      }

      const idToken = await credential.user.getIdToken();
      const response = await fetch("/api/session", {
        method: "POST",
        headers: {
          "content-type": "application/json",
        },
        cache: "no-store",
        body: JSON.stringify({ idToken }),
      });

      if (!response.ok) {
        await signOut(auth);
        setError(
          response.status === 403
            ? "このアカウントにはアクセス権限がありません。"
            : "ログインに失敗しました。",
        );
        return;
      }

      router.replace("/");
      router.refresh();
    } catch {
      setError("Google ログインに失敗しました。");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <section className="space-y-4 rounded-lg border border-slate-800 bg-slate-950/60 p-6 shadow-xl">
      <button
        type="button"
        onClick={handleLogin}
        disabled={isLoading}
        className="w-full rounded-md bg-cyan-500 px-3 py-2 text-sm font-semibold text-slate-950 transition hover:bg-cyan-400 disabled:cursor-not-allowed disabled:opacity-70"
      >
        {isLoading ? "ログイン中…" : "Google でログイン"}
      </button>
      {error && (
        <p className="text-sm text-rose-400" role="alert">
          {error}
        </p>
      )}
    </section>
  );
}
