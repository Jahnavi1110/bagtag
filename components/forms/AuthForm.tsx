"use client";

import Link from "next/link";
import { useActionState } from "react";
import { login, signup } from "@/lib/actions/auth";
import { btnPrimary, card, input, label } from "../ui";

export function AuthForm({ mode, next }: { mode: "login" | "signup"; next?: string }) {
  const [state, action, pending] = useActionState(mode === "login" ? login : signup, undefined);
  const isLogin = mode === "login";
  return (
    <form action={action} className={`${card} mx-auto mt-12 max-w-sm space-y-4`}>
      <h1 className="text-xl font-bold">{isLogin ? "Log in" : "Create an account"}</h1>
      <input type="hidden" name="next" value={next ?? ""} />
      <div>
        <label className={label} htmlFor="email">Email</label>
        <input id="email" name="email" type="email" autoComplete="email" required className={input} />
      </div>
      <div>
        <label className={label} htmlFor="password">Password</label>
        <input id="password" name="password" type="password" minLength={8} autoComplete={isLogin ? "current-password" : "new-password"} required className={input} />
      </div>
      {state?.error && <p className="text-sm text-red-600" role="alert">{state.error}</p>}
      <button className={`${btnPrimary} w-full`} disabled={pending}>
        {pending ? "Please wait…" : isLogin ? "Log in" : "Sign up"}
      </button>
      <p className="text-center text-sm text-muted">
        {isLogin ? "No account? " : "Already have an account? "}
        <Link href={isLogin ? "/signup" : "/login"} className="text-ink underline">
          {isLogin ? "Sign up" : "Log in"}
        </Link>
      </p>
    </form>
  );
}
