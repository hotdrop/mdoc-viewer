"use client";

import { useFormState, useFormStatus } from "react-dom";
import {
  INITIAL_LOGIN_FORM_STATE,
  type LoginFormState,
  loginAction,
} from "../actions";

export function LoginForm() {
  const [state, formAction] = useFormState<LoginFormState, FormData>(
    loginAction,
    INITIAL_LOGIN_FORM_STATE,
  );

  return (
    <form action={formAction} className="space-y-4 rounded-lg border border-slate-800 bg-slate-950/60 p-6 shadow-xl">
      <fieldset className="space-y-4">
        <div className="space-y-2">
          <label htmlFor="email" className="block text-sm font-semibold text-slate-200">
            メールアドレス
          </label>
          <input
            id="email"
            name="email"
            type="email"
            required
            autoComplete="email"
            className="w-full rounded-md border border-slate-700 bg-slate-950 px-3 py-2 text-slate-100 outline-none focus:border-cyan-400"
          />
        </div>
        <div className="space-y-2">
          <label htmlFor="password" className="block text-sm font-semibold text-slate-200">
            パスワード
          </label>
          <input
            id="password"
            name="password"
            type="password"
            required
            autoComplete="current-password"
            className="w-full rounded-md border border-slate-700 bg-slate-950 px-3 py-2 text-slate-100 outline-none focus:border-cyan-400"
          />
        </div>
        <SubmitButton />
      </fieldset>
      {state.error && (
        <p className="text-sm text-rose-400" role="alert">
          {state.error}
        </p>
      )}
    </form>
  );
}

function SubmitButton() {
  const status = useFormStatus();
  return (
    <button
      type="submit"
      className="w-full rounded-md bg-cyan-500 px-3 py-2 text-sm font-semibold text-slate-950 transition hover:bg-cyan-400 disabled:cursor-not-allowed disabled:opacity-70"
      disabled={status.pending}
    >
      {status.pending ? "サインイン中…" : "サインイン"}
    </button>
  );
}
