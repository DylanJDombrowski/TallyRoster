// app/components/auth/signup-form.tsx
"use client";

import { signup } from "@/app/auth/actions";
import { useToast } from "@/app/components/toast-provider";
import Link from "next/link";
import { useActionState, useEffect } from "react";
import { useFormStatus } from "react-dom";

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="w-full p-3 rounded-lg text-white font-bold bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
    >
      {pending ? "Creating account..." : "Sign Up"}
    </button>
  );
}

export function SignUpForm() {
  const [state, formAction] = useActionState(signup, undefined);
  const { showToast } = useToast();

  useEffect(() => {
    if (state?.message) {
      // Show success message for email confirmation, error for everything else
      const isSuccess = state.success || state.message.includes("Check your email");
      showToast(state.message, isSuccess ? "success" : "error");
    }
  }, [state, showToast]);

  return (
    <div className="mx-auto max-w-sm">
      <h2 className="text-center text-2xl font-bold">Create an Account</h2>
      <form action={formAction} className="mt-8 space-y-6">
        <div>
          <label htmlFor="email" className="block text-sm font-medium text-slate-700">
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
            {state?.errors?.email && <p className="text-red-500 text-sm mt-1">{state.errors.email[0]}</p>}
          </div>
        </div>

        <div>
          <label htmlFor="password" className="block text-sm font-medium text-slate-700">
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
            {state?.errors?.password && <p className="text-red-500 text-sm mt-1">{state.errors.password[0]}</p>}
          </div>
        </div>

        <SubmitButton />
      </form>
      <p className="mt-4 text-center text-sm text-slate-600">
        Already have an account?{" "}
        <Link href="/login" className="font-medium text-blue-600 hover:underline">
          Log In
        </Link>
      </p>
    </div>
  );
}
