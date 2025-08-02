// app/auth/callback/route.ts
import { createClient } from "@/lib/supabase/server";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import type { User } from "@supabase/supabase-js";

export async function GET(request: Request) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get("code");
  const origin = requestUrl.origin;

  console.log("🔍 Server-side auth callback called with:", {
    hasCode: !!code,
    url: requestUrl.toString(),
  });

  // Only handle authorization code flow on server-side
  // Fragment-based tokens are handled by the client component
  if (code) {
    const cookieStore = await cookies();
    const supabase = createClient(cookieStore);

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

  // No code parameter - redirect to client-side page to handle fragment tokens
  return NextResponse.redirect(`${origin}/auth/callback`);
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
      const userCreatedAt = new Date(user.created_at!);
      const now = new Date();
      const isVeryNewUser = now.getTime() - userCreatedAt.getTime() < 600000;

      const needsPasswordSetup =
        !user.user_metadata?.password_set &&
        (isVeryNewUser || user.app_metadata?.provider === "email");

      if (needsPasswordSetup) {
        console.log("🔑 Redirecting invited user to password setup");
        return NextResponse.redirect(
          `${origin}/auth/setup-password?invited=true`
        );
      }

      console.log("🎉 Redirecting invited user to dashboard");
      return NextResponse.redirect(`${origin}/dashboard`);
    } catch (dbError) {
      console.error("❌ Database error during invitation processing:", dbError);
      return NextResponse.redirect(`${origin}/dashboard`);
    }
  }

  // Not an invited user - handle normal authentication flow
  console.log("👤 Processing regular user");

  const { data: userOrgRoles } = await supabase
    .from("user_organization_roles")
    .select("organization_id, role, organizations(name)")
    .eq("user_id", user.id);

  if (userOrgRoles && userOrgRoles.length > 0) {
    console.log("✅ User has organization access, redirecting to dashboard");
    return NextResponse.redirect(`${origin}/dashboard`);
  } else {
    console.log("🚀 User needs organization, redirecting to onboarding");
    return NextResponse.redirect(`${origin}/onboarding`);
  }
}
