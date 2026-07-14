"use client";

import { useActionState } from "react";
import { login, register, type FormState } from "@/app/actions/auth";

const inputCls =
  "w-full rounded-xl border border-emerald-900/15 bg-white px-4 py-3 text-emerald-950 outline-none placeholder:text-emerald-950/35 focus:border-emerald-600 focus:ring-2 focus:ring-emerald-600/20";

const buttonCls =
  "w-full rounded-xl bg-emerald-700 px-4 py-3 font-semibold text-white transition hover:bg-emerald-800 disabled:opacity-60";

function ErrorBox({ error }: { error?: string }) {
  if (!error) return null;
  return (
    <p className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
      {error}
    </p>
  );
}

export function LoginForm({ next }: { next?: string }) {
  const [state, action, pending] = useActionState<FormState, FormData>(login, {});

  return (
    <form action={action} className="space-y-4">
      {next && <input type="hidden" name="next" value={next} />}
      <ErrorBox error={state.error} />
      <div>
        <label className="mb-1 block text-sm font-medium text-emerald-950/80">
          Username or email
        </label>
        <input
          name="identifier"
          required
          autoComplete="username"
          className={inputCls}
          placeholder="you@example.com"
          defaultValue={state.values?.identifier ?? ""}
        />
      </div>
      <div>
        <label className="mb-1 block text-sm font-medium text-emerald-950/80">
          Password
        </label>
        <input
          name="password"
          type="password"
          required
          autoComplete="current-password"
          className={inputCls}
          placeholder="••••••••"
        />
      </div>
      <button type="submit" disabled={pending} className={buttonCls}>
        {pending ? "Logging in…" : "Log in"}
      </button>
    </form>
  );
}

export function RegisterForm({ next }: { next?: string }) {
  const [state, action, pending] = useActionState<FormState, FormData>(
    register,
    {}
  );

  return (
    <form action={action} className="space-y-4">
      {next && <input type="hidden" name="next" value={next} />}
      <ErrorBox error={state.error} />
      <div>
        <label className="mb-1 block text-sm font-medium text-emerald-950/80">
          Username
        </label>
        <input
          name="username"
          required
          minLength={3}
          maxLength={24}
          autoComplete="username"
          className={inputCls}
          placeholder="snailfan99"
          defaultValue={state.values?.username ?? ""}
        />
      </div>
      <div>
        <label className="mb-1 block text-sm font-medium text-emerald-950/80">
          Email
        </label>
        <input
          name="email"
          type="email"
          required
          autoComplete="email"
          className={inputCls}
          placeholder="you@example.com"
          defaultValue={state.values?.email ?? ""}
        />
      </div>
      <div>
        <label className="mb-1 block text-sm font-medium text-emerald-950/80">
          Password (min. 8 characters)
        </label>
        <input
          name="password"
          type="password"
          required
          minLength={8}
          autoComplete="new-password"
          className={inputCls}
          placeholder="••••••••"
        />
      </div>
      <button type="submit" disabled={pending} className={buttonCls}>
        {pending ? "Creating account…" : "Create account"}
      </button>
    </form>
  );
}
