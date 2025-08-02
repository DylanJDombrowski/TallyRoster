// app/auth/setup-password/page.tsx
"use client";

import { createClient } from "@/lib/supabase/client";
import { useRouter, useSearchParams } from "next/navigation";
import { useState, useEffect } from "react";

export default function SetupPasswordPage() {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [userEmail, setUserEmail] = useState("");
  const [organizationName, setOrganizationName] = useState("");
  const router = useRouter();
  const searchParams = useSearchParams();
  const supabase = createClient();
  const isInvited = searchParams.get("invited") === "true";

  useEffect(() => {
    async function getUser() {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (user) {
        setUserEmail(user.email || "");
        // Get organization name from metadata if invited
        if (isInvited && user.user_metadata?.organization_name) {
          setOrganizationName(user.user_metadata.organization_name);
        }
      } else {
        // No user session, redirect to login
        router.push("/login");
      }
    }
    getUser();
  }, [supabase, router, isInvited]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (password !== confirmPassword) {
      setError("Passwords don't match");
      return;
    }

    if (password.length < 8) {
      setError("Password must be at least 8 characters");
      return;
    }

    setLoading(true);

    try {
      // Update the user's password
      const { error: updateError } = await supabase.auth.updateUser({
        password: password,
        data: { password_set: true },
      });

      if (updateError) {
        setError(updateError.message);
        return;
      }

      // Password set successfully
      if (isInvited) {
        // Invited user - go to dashboard
        router.push("/dashboard");
      } else {
        // Regular signup - go to onboarding
        router.push("/onboarding");
      }
    } catch (err) {
      console.error("Password setup error:", err);
      setError("Failed to set password. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full space-y-8 p-8 bg-white rounded-lg shadow-md">
        <div>
          <h2 className="text-center text-3xl font-extrabold text-gray-900">
            Set Your Password
          </h2>
          {isInvited && organizationName ? (
            <p className="mt-2 text-center text-sm text-gray-600">
              Welcome to <strong>{organizationName}</strong>! Please create a
              secure password for your account.
            </p>
          ) : (
            <p className="mt-2 text-center text-sm text-gray-600">
              Welcome! Please create a secure password for your account.
            </p>
          )}
          {userEmail && (
            <p className="mt-1 text-center text-sm text-gray-500">
              Account: {userEmail}
            </p>
          )}
        </div>

        <form onSubmit={handleSubmit} className="mt-8 space-y-6">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
              {error}
            </div>
          )}

          <div>
            <label
              htmlFor="password"
              className="block text-sm font-medium text-gray-700"
            >
              New Password
            </label>
            <input
              id="password"
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="mt-1 appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
              placeholder="Enter your password (min 8 characters)"
              minLength={8}
            />
          </div>

          <div>
            <label
              htmlFor="confirmPassword"
              className="block text-sm font-medium text-gray-700"
            >
              Confirm Password
            </label>
            <input
              id="confirmPassword"
              type="password"
              required
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="mt-1 appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
              placeholder="Confirm your password"
              minLength={8}
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
          >
            {loading ? "Setting Password..." : "Set Password"}
          </button>
        </form>
      </div>
    </div>
  );
}
