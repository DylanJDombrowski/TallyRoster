// app/components/auth/login-form.tsx
"use client";

import Link from "next/link";
import { useActionState, useEffect, useRef } from "react";
import { useFormStatus } from "react-dom";
import { useToast } from "@/app/components/toast-provider";
import { login } from "@/lib/actions";

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="w-full p-3 rounded-lg text-white font-bold bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
    >
      {pending ? "Signing in..." : "Log In"}
    </button>
  );
}

export function LoginForm() {
  const [state, formAction] = useActionState(login, undefined);
  const { showToast } = useToast();
  const previousMessageRef = useRef<string | undefined>(undefined);

  useEffect(() => {
    // Only show toast if the message is new (different from previous)
    if (state?.message && state.message !== previousMessageRef.current) {
      showToast(state.message, "error");
      previousMessageRef.current = state.message;
    }
  }, [state?.message, showToast]);

  return (
    <div className="mx-auto max-w-sm">
      <h2 className="text-center text-2xl font-bold">Log In to Your Account</h2>
      <form action={formAction} className="mt-8 space-y-6">
        <div>
          <label
            htmlFor="email"
            className="block text-sm font-medium text-slate-700"
          >
            Email address
          </label>
          <div className="mt-1">
            <input
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              required
              placeholder="you@example.com"
              className="w-full p-2 border border-slate-300 rounded-md"
            />
          </div>
        </div>

        <div>
          <label
            htmlFor="password"
            className="block text-sm font-medium text-slate-700"
          >
            Password
          </label>
          <div className="mt-1">
            <input
              id="password"
              name="password"
              type="password"
              required
              placeholder="••••••••"
              className="w-full p-2 border border-slate-300 rounded-md"
            />
          </div>
        </div>

        <SubmitButton />
      </form>
      <p className="mt-4 text-center text-sm text-slate-600">
        Don&apos;t have an account?{" "}
        <Link
          href="/signup"
          className="font-medium text-blue-600 hover:underline"
        >
          Sign Up
        </Link>
      </p>
    </div>
  );
}
