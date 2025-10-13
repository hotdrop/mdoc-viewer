"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { DEV_AUTH_COOKIE_NAME, isLocalRunMode } from "@/lib/auth/devSession";

export type LoginFormState = {
  error: string | null;
};

export const INITIAL_LOGIN_FORM_STATE: LoginFormState = {
  error: null,
};

export async function loginAction(
  _prevState: LoginFormState,
  formData: FormData,
): Promise<LoginFormState> {
  if (!isLocalRunMode()) {
    return { error: "ローカルモードでのみ利用できます。" };
  }

  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");

  if (!email || !password) {
    return { error: "メールアドレスとパスワードを入力してください。" };
  }

  const emulatorHost = process.env.FIREBASE_AUTH_EMULATOR_HOST;
  const apiKey = process.env.FIREBASE_WEB_API_KEY;

  if (!emulatorHost) {
    return { error: "FIREBASE_AUTH_EMULATOR_HOST が未設定です。" };
  }
  if (!apiKey) {
    return { error: "FIREBASE_WEB_API_KEY が未設定です。" };
  }

  const endpoint = new URL(
    "/identitytoolkit.googleapis.com/v1/accounts:signInWithPassword",
    `http://${emulatorHost}`,
  );
  endpoint.searchParams.set("key", apiKey);

  let response: Response;
  try {
    response = await fetch(endpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        email,
        password,
        returnSecureToken: true,
      }),
    });
  } catch {
    return { error: "Firebase エミュレータへの接続に失敗しました。" };
  }

  let payload: unknown;
  try {
    payload = (await response.json()) as unknown;
  } catch {
    return { error: "Firebase エミュレータのレスポンス解析に失敗しました。" };
  }

  if (!response.ok || typeof payload !== "object" || payload === null) {
    const message =
      typeof (payload as { error?: { message?: string } }).error?.message === "string"
        ? translateFirebaseError(
            (payload as { error?: { message?: string } }).error!.message!,
          )
        : "認証に失敗しました。";
    return { error: message };
  }

  const idToken = (payload as { idToken?: string }).idToken;
  if (!idToken) {
    return { error: "ID トークンを取得できませんでした。" };
  }

  const cookieStore = cookies();
  cookieStore.set({
    name: DEV_AUTH_COOKIE_NAME,
    value: idToken,
    httpOnly: true,
    sameSite: "lax",
    secure: false,
    path: "/",
    maxAge: 60 * 60,
  });

  redirect("/");
}

export async function logoutAction() {
  if (!isLocalRunMode()) {
    redirect("/");
  }

  const cookieStore = cookies();
  cookieStore.delete(DEV_AUTH_COOKIE_NAME);
  redirect("/local-login");
}

function translateFirebaseError(code: string): string {
  switch (code) {
    case "INVALID_PASSWORD":
      return "パスワードが一致しません。";
    case "EMAIL_NOT_FOUND":
      return "ユーザーが存在しません。";
    case "USER_DISABLED":
      return "アカウントが無効化されています。";
    default:
      return "認証に失敗しました。";
  }
}
