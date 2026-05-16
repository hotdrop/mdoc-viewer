import { APP_VERSION } from "@/lib/app/version";
import { SettingsThemePanel } from "./SettingsThemePanel";

export const dynamic = "force-dynamic";

export default function SettingsPage() {
  return (
    <main className="mx-auto flex w-full max-w-4xl flex-col gap-6 px-4 py-8 sm:px-6 lg:px-8">
      <header className="space-y-2">
        <h1 className="text-2xl font-semibold text-slate-100">設定</h1>
        <p className="text-sm text-slate-400">
          表示テーマとアプリ情報を確認できます。
        </p>
      </header>
      <SettingsThemePanel appVersion={APP_VERSION} />
    </main>
  );
}
