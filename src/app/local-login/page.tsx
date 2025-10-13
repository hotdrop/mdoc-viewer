import { cookies } from "next/headers";
import { notFound } from "next/navigation";
import { LoginForm } from "./_components/LoginForm";
import { logoutAction } from "./actions";
import { DEV_AUTH_COOKIE_NAME, isLocalRunMode } from "@/lib/auth/devSession";

export const dynamic = "force-dynamic";

export default async function LocalLoginPage() {
  if (!isLocalRunMode()) {
    notFound();
  }

  const cookieStore = await cookies();
  const tokenCookie = cookieStore.get(DEV_AUTH_COOKIE_NAME);
  const isLoggedIn = Boolean(tokenCookie?.value);

  return (
    <main className="mx-auto flex min-h-screen max-w-lg flex-col justify-center gap-8 px-6 py-16">
      <section className="space-y-3">
        <h1 className="text-2xl font-semibold text-slate-100">ローカル開発用ログイン</h1>
        <p className="text-sm text-slate-400">
          Firebase Auth エミュレータで作成したユーザーのメールアドレスとパスワードを入力すると、ID トークンを取得して Cookie に保存します。保存されたトークンは保護ルートへアクセスする際に自動付与されます。
        </p>
      </section>

      {!isLoggedIn ? (
        <LoginForm />
      ) : (
        <section className="space-y-4 rounded-lg border border-emerald-700 bg-emerald-950/40 p-6 text-slate-100">
          <p className="text-sm">
            既にログイン済みです。必要に応じてログアウトして別ユーザーでサインインしてください。
          </p>
          <form action={logoutAction}>
            <button
              type="submit"
              className="w-full rounded-md border border-emerald-400 px-3 py-2 text-sm font-semibold text-emerald-200 hover:bg-emerald-900"
            >
              ログアウト
            </button>
          </form>
        </section>
      )}

      <section className="space-y-2 rounded-lg border border-slate-800 bg-slate-950/40 p-6 text-sm text-slate-300">
        <h2 className="text-base font-semibold text-slate-100">利用上の注意</h2>
        <ul className="list-disc space-y-1 pl-6">
          <li>RUN_MODE=local の実行時のみ表示されます。</li>
          <li>エミュレータを終了するとトークンは失効します。必要に応じて再度サインインしてください。</li>
          <li>Cookie は HttpOnly で 1 時間後に期限切れになります。</li>
        </ul>
      </section>
    </main>
  );
}
