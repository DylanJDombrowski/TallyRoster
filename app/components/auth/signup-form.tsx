// app/components/auth/signup-form.tsx
"use client";

import Link from "next/link";

// We will create the server action for this in the next step
// import { signup } from "@/app/auth/actions";
// import { useFormState } from "react-dom";

export function SignUpForm() {
  // const [state, formAction] = useFormState(signup, undefined);

  return (
    <div className="mx-auto max-w-sm">
      <h2 className="text-center text-2xl font-bold">Create an Account</h2>
      <form /* action={formAction} */ className="mt-8 space-y-6">
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
            {/* {state?.errors?.email && <p className="text-red-500 text-sm mt-1">{state.errors.email}</p>} */}
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
            {/* {state?.errors?.password && <p className="text-red-500 text-sm mt-1">{state.errors.password}</p>} */}
          </div>
        </div>

        <button
          type="submit"
          className="w-full p-3 rounded-lg text-white font-bold bg-blue-600 hover:bg-blue-700"
        >
          Sign Up
        </button>
        {/* {state?.message && <p className="text-red-500 text-sm mt-2">{state.message}</p>} */}
      </form>
      <p className="mt-4 text-center text-sm text-slate-600">
        Already have an account?{" "}
        <Link
          href="/login"
          className="font-medium text-blue-600 hover:underline"
        >
          Log In
        </Link>
      </p>
    </div>
  );
}
