// app/auth/callback/route.ts
import { createClient } from "@/lib/supabase/server";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get("code");
  const origin = requestUrl.origin;

  if (code) {
    const cookieStore = await cookies();
    const supabase = createClient(cookieStore);

    // Exchange the code for a session
    const { data, error } = await supabase.auth.exchangeCodeForSession(code);

    if (!error && data.user) {
      // Check if this is a new user from invitation
      const userCreatedAt = new Date(data.user.created_at!);
      const now = new Date();
      const isNewUser = now.getTime() - userCreatedAt.getTime() < 300000; // 5 minutes

      // Check if user has organization roles
      const { data: userOrgRoles } = await supabase
        .from("user_organization_roles")
        .select("organization_id, role, organizations(name)")
        .eq("user_id", data.user.id);

      if (userOrgRoles && userOrgRoles.length > 0) {
        // User has organization access
        if (isNewUser) {
          // New user with invitation - check if they need password setup
          const hasPassword = data.user.user_metadata?.password_set || data.user.app_metadata?.provider === "email";

          if (!hasPassword) {
            // Need to set password
            return NextResponse.redirect(`${origin}/auth/setup-password`);
          } else {
            // Password set, go to onboarding for role orientation
            return NextResponse.redirect(`${origin}/onboarding?type=invited`);
          }
        } else {
          // Existing user, go to dashboard
          return NextResponse.redirect(`${origin}/dashboard`);
        }
      } else {
        // No organization - send to onboarding to create/join one
        return NextResponse.redirect(`${origin}/onboarding`);
      }
    } else {
      console.error("Auth callback error:", error);
      return NextResponse.redirect(`${origin}/login?error=confirmation_failed`);
    }
  }

  return NextResponse.redirect(`${origin}/login?error=invalid_confirmation_link`);
}
