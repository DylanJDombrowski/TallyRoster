// app/auth/callback/route.ts
import { createClient } from "@/lib/supabase/server";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import type { User } from "@supabase/supabase-js";

export async function GET(request: Request) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get("code");
  const access_token = requestUrl.searchParams.get("access_token");
  const refresh_token = requestUrl.searchParams.get("refresh_token");
  const origin = requestUrl.origin;

  console.log("🔍 Auth callback called with:", {
    hasCode: !!code,
    hasAccessToken: !!access_token,
    hasRefreshToken: !!refresh_token,
    url: requestUrl.toString(),
  });

  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);

  // Handle authorization code flow (normal signup/login)
  if (code) {
    try {
      // Exchange the code for a session
      const { data, error } = await supabase.auth.exchangeCodeForSession(code);

      if (error || !data.user) {
        console.error("Auth callback error:", error);
        return NextResponse.redirect(
          `${origin}/login?error=confirmation_failed`
        );
      }

      return handleAuthenticatedUser(data.user, origin);
    } catch (error) {
      console.error("🚨 Error in code exchange:", error);
      return NextResponse.redirect(`${origin}/login?error=callback_error`);
    }
  }

  // Handle implicit flow (invitation links)
  if (access_token && refresh_token) {
    try {
      // Set the session using the tokens
      const { data, error } = await supabase.auth.setSession({
        access_token,
        refresh_token,
      });

      if (error || !data.user) {
        console.error("Auth session error:", error);
        return NextResponse.redirect(`${origin}/login?error=session_failed`);
      }

      return handleAuthenticatedUser(data.user, origin);
    } catch (error) {
      console.error("🚨 Error setting session:", error);
      return NextResponse.redirect(`${origin}/login?error=session_error`);
    }
  }

  // No valid authentication parameters found
  console.error("❌ No valid auth parameters found in callback");
  return NextResponse.redirect(
    `${origin}/login?error=invalid_confirmation_link`
  );
}

async function handleAuthenticatedUser(user: User, origin: string) {
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);

  console.log("✅ User authenticated:", user.email);

  // Check if this is an invited user by looking at user metadata
  const invitationData = user.user_metadata;
  const isInvitedUser =
    invitationData?.invitation_type === "organization_invite" ||
    invitationData?.invitation_type === "organization_reinvite";

  if (isInvitedUser) {
    console.log("🎯 Processing invited user");

    // Extract invitation data from user metadata
    const organizationId = invitationData.organization_id;
    const assignedRole = invitationData.assigned_role;
    const teamId = invitationData.team_id;

    if (!organizationId || !assignedRole) {
      console.error("❌ Missing invitation data in user metadata");
      return NextResponse.redirect(`${origin}/login?error=invalid_invitation`);
    }

    try {
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
        // Don't fail completely, but log the error
      } else {
        console.log("✅ Organization role assigned:", orgRole);
      }

      // Add user to user_roles table (for detailed role and team assignment)
      const { error: userRoleError } = await supabase
        .from("user_roles")
        .upsert({
          user_id: user.id,
          role: assignedRole,
          team_id: assignedRole === "admin" ? null : teamId,
        });

      if (userRoleError) {
        console.error("❌ Failed to assign user role:", userRoleError);
        // Don't fail completely, but log the error
      } else {
        console.log(
          "✅ User role assigned:",
          assignedRole,
          teamId ? `(team: ${teamId})` : ""
        );
      }

      // Check if this is a brand new user who needs to set password
      const userCreatedAt = new Date(user.created_at!);
      const now = new Date();
      const isVeryNewUser = now.getTime() - userCreatedAt.getTime() < 600000; // 10 minutes

      // For invited users, check if they need password setup
      const needsPasswordSetup =
        !user.user_metadata?.password_set &&
        (isVeryNewUser || user.app_metadata?.provider === "email");

      if (needsPasswordSetup) {
        console.log("🔑 Redirecting invited user to password setup");
        return NextResponse.redirect(
          `${origin}/auth/setup-password?invited=true`
        );
      }

      // User is fully set up, go directly to dashboard
      console.log("🎉 Redirecting invited user to dashboard");
      return NextResponse.redirect(`${origin}/dashboard`);
    } catch (dbError) {
      console.error("❌ Database error during invitation processing:", dbError);
      // Still redirect to dashboard, admin can fix roles manually
      return NextResponse.redirect(`${origin}/dashboard`);
    }
  }

  // Not an invited user - handle normal authentication flow
  console.log("👤 Processing regular user");

  // Check if user has organization roles
  const { data: userOrgRoles } = await supabase
    .from("user_organization_roles")
    .select("organization_id, role, organizations(name)")
    .eq("user_id", user.id);

  if (userOrgRoles && userOrgRoles.length > 0) {
    // User has organization access, go to dashboard
    console.log("✅ User has organization access, redirecting to dashboard");
    return NextResponse.redirect(`${origin}/dashboard`);
  } else {
    // No organization - send to onboarding to create/join one
    console.log("🚀 User needs organization, redirecting to onboarding");
    return NextResponse.redirect(`${origin}/onboarding`);
  }
}
