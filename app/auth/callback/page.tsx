// app/auth/callback/page.tsx
"use client";

import { createClient } from "@/lib/supabase/client";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState, Suspense } from "react";
import type { User } from "@supabase/supabase-js";

function AuthCallbackHandler() {
  const [status, setStatus] = useState<"loading" | "processing" | "error">(
    "loading"
  );
  const [errorMessage, setErrorMessage] = useState("");
  const router = useRouter();
  const searchParams = useSearchParams();
  const supabase = createClient();

  useEffect(() => {
    const handleAuthCallback = async () => {
      try {
        console.log("🔍 Auth callback handler started");

        // Check for authorization code in URL params (regular auth flow)
        const code = searchParams.get("code");

        if (code) {
          console.log("📝 Found authorization code, exchanging for session");
          setStatus("processing");

          const { data, error } = await supabase.auth.exchangeCodeForSession(
            code
          );

          if (error || !data.user) {
            console.error("❌ Code exchange failed:", error);
            setErrorMessage(error?.message || "Failed to authenticate");
            setStatus("error");
            return;
          }

          console.log("✅ Code exchange successful");
          await processUser(data.user);
          return;
        }

        // Check for tokens in URL fragment (invitation flow)
        const hashParams = new URLSearchParams(
          window.location.hash.substring(1)
        );
        const accessToken = hashParams.get("access_token");
        const refreshToken = hashParams.get("refresh_token");

        if (accessToken && refreshToken) {
          console.log("🔑 Found tokens in URL fragment, setting session");
          setStatus("processing");

          const { data, error } = await supabase.auth.setSession({
            access_token: accessToken,
            refresh_token: refreshToken,
          });

          if (error || !data.user) {
            console.error("❌ Session setup failed:", error);
            setErrorMessage(error?.message || "Failed to set session");
            setStatus("error");
            return;
          }

          console.log("✅ Session set successfully");
          await processUser(data.user);
          return;
        }

        // No auth parameters found, check existing session
        console.log("🔍 No auth parameters, checking existing session");
        const { data: sessionData, error: sessionError } =
          await supabase.auth.getSession();

        if (sessionError || !sessionData.session) {
          console.log("❌ No existing session found, redirecting to login");
          router.push("/login?error=no_session");
          return;
        }

        console.log("✅ Found existing session");
        await processUser(sessionData.session.user);
      } catch (error) {
        console.error("🚨 Auth callback error:", error);
        setErrorMessage("An unexpected error occurred");
        setStatus("error");
      }
    };

    handleAuthCallback();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams, router, supabase]);

  const processUser = async (user: User) => {
    try {
      console.log("🎯 Processing user:", user.email);

      // Check if this is an invited user
      const invitationData = user.user_metadata;
      const isInvitedUser =
        invitationData?.invitation_type === "organization_invite" ||
        invitationData?.invitation_type === "organization_reinvite";

      if (isInvitedUser) {
        console.log(
          "📧 Processing invited user with metadata:",
          invitationData
        );

        const organizationId = invitationData.organization_id;
        const assignedRole = invitationData.assigned_role;
        const teamId = invitationData.team_id;

        if (!organizationId || !assignedRole) {
          throw new Error("Missing invitation data in user metadata");
        }

        // Add user to organization_roles
        const orgRole = assignedRole === "parent" ? "member" : assignedRole;
        const { error: orgRoleError } = await supabase
          .from("user_organization_roles")
          .upsert({
            user_id: user.id,
            organization_id: organizationId,
            role: orgRole,
          });

        if (orgRoleError) {
          console.error("❌ Failed to assign organization role:", orgRoleError);
        } else {
          console.log("✅ Organization role assigned:", orgRole);
        }

        // Add user to user_roles table
        const { error: userRoleError } = await supabase
          .from("user_roles")
          .upsert({
            user_id: user.id,
            role: assignedRole,
            team_id: assignedRole === "admin" ? null : teamId,
          });

        if (userRoleError) {
          console.error("❌ Failed to assign user role:", userRoleError);
        } else {
          console.log("✅ User role assigned:", assignedRole);
        }

        // Check if user needs password setup
        const userCreatedAt = new Date(user.created_at);
        const now = new Date();
        const isVeryNewUser = now.getTime() - userCreatedAt.getTime() < 600000; // 10 minutes

        const needsPasswordSetup =
          !user.user_metadata?.password_set &&
          (isVeryNewUser || user.app_metadata?.provider === "email");

        if (needsPasswordSetup) {
          console.log("🔑 Redirecting to password setup");
          router.push("/auth/setup-password?invited=true");
          return;
        }

        console.log("🎉 Redirecting invited user to dashboard");
        router.push("/dashboard");
      } else {
        console.log("👤 Regular user, checking organization access");

        // Check if user has organization roles
        const { data: userOrgRoles } = await supabase
          .from("user_organization_roles")
          .select("organization_id, role")
          .eq("user_id", user.id);

        if (userOrgRoles && userOrgRoles.length > 0) {
          console.log("✅ User has organization access");
          router.push("/dashboard");
        } else {
          console.log("🚀 User needs organization");
          router.push("/onboarding");
        }
      }
    } catch (error) {
      console.error("❌ Error processing user:", error);
      setErrorMessage(
        error instanceof Error ? error.message : "Processing failed"
      );
      setStatus("error");
    }
  };

  if (status === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Checking authentication...</p>
        </div>
      </div>
    );
  }

  if (status === "processing") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Setting up your account...</p>
        </div>
      </div>
    );
  }

  if (status === "error") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="max-w-md w-full bg-white rounded-lg shadow-md p-8 text-center">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg
              className="w-8 h-8 text-red-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            Authentication Error
          </h1>
          <p className="text-gray-600 mb-6">{errorMessage}</p>
          <button
            onClick={() => router.push("/login")}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return null;
}

export default function AuthCallbackPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading...</p>
          </div>
        </div>
      }
    >
      <AuthCallbackHandler />
    </Suspense>
  );
}
