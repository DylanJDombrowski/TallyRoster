// app/components/auth/signup-form.tsx
"use client";

import { signup } from "@/lib/actions";
import { useSearchParams } from "next/navigation";
import { useActionState, useEffect, useState } from "react";

export default function SignupForm() {
  const [state, formAction] = useActionState(signup, undefined);
  const searchParams = useSearchParams();
  const [email, setEmail] = useState("");
  const [isInvited, setIsInvited] = useState(false);

  useEffect(() => {
    // Check if this is an invited signup
    const emailParam = searchParams.get("email");

    if (emailParam) {
      setEmail(emailParam);
      setIsInvited(true);
    }
  }, [searchParams]);

  return (
    <form action={formAction} className="space-y-6">
      {isInvited && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <p className="text-sm text-blue-800">
            <strong>Invitation Signup:</strong> You&apos;re creating an account
            to join an organization. After signup, you&apos;ll be automatically
            added to the team.
          </p>
        </div>
      )}

      {state?.message && (
        <div
          className={`p-4 rounded-md ${
            state.success
              ? "bg-green-50 border border-green-200 text-green-700"
              : "bg-red-50 border border-red-200 text-red-700"
          }`}
        >
          {state.message}
        </div>
      )}

      <div>
        <label
          htmlFor="email"
          className="block text-sm font-medium text-gray-700"
        >
          Email
        </label>
        <input
          id="email"
          name="email"
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          readOnly={isInvited} // Make read-only if invited
          className={`mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 ${
            isInvited ? "bg-gray-100 cursor-not-allowed" : ""
          }`}
          placeholder="Enter your email"
        />
        {state?.errors?.email && (
          <p className="mt-1 text-sm text-red-600">{state.errors.email}</p>
        )}
      </div>

      <div>
        <label
          htmlFor="password"
          className="block text-sm font-medium text-gray-700"
        >
          Password
        </label>
        <input
          id="password"
          name="password"
          type="password"
          required
          className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
          placeholder="Enter your password"
          minLength={8}
        />
        {state?.errors?.password && (
          <p className="mt-1 text-sm text-red-600">{state.errors.password}</p>
        )}
        <p className="mt-1 text-sm text-gray-500">
          Password must be at least 8 characters long.
        </p>
      </div>

      <button
        type="submit"
        className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
      >
        {isInvited ? "Create Account & Join Organization" : "Sign Up"}
      </button>
    </form>
  );
}
