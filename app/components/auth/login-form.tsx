// app/components/auth/login-form.tsx
"use client";

import Link from "next/link";

export function LoginForm() {
  return (
    <div className="mx-auto max-w-sm">
      <h2 className="text-center text-2xl font-bold">Log In to Your Account</h2>
      <form className="mt-8 space-y-6">
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

        <button
          type="submit"
          className="w-full p-3 rounded-lg text-white font-bold bg-blue-600 hover:bg-blue-700"
        >
          Log In
        </button>
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
