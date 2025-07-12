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
    const { error } = await supabase.auth.exchangeCodeForSession(code);

    if (!error) {
      // Check if user has completed onboarding
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (user) {
        // Check if user is associated with any organization
        const { data: userOrgRoles } = await supabase
          .from("user_organization_roles")
          .select("organization_id, role, organizations(name)")
          .eq("user_id", user.id);

        if (userOrgRoles && userOrgRoles.length > 0) {
          // User has organization, go to dashboard
          return NextResponse.redirect(`${origin}/dashboard`);
        } else {
          // New user with no organization, send to onboarding
          return NextResponse.redirect(`${origin}/onboarding`);
        }
      }

      // Fallback to onboarding
      return NextResponse.redirect(`${origin}/onboarding`);
    } else {
      console.error("Auth callback error:", error);
      return NextResponse.redirect(`${origin}/login?error=confirmation_failed`);
    }
  }

  return NextResponse.redirect(`${origin}/login?error=invalid_confirmation_link`);
}
