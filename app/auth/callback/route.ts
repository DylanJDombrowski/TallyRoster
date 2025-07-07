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
        // Check if user has an organization (completed onboarding)
        const { data: organizations } = await supabase.from("organizations").select("id").eq("owner_id", user.id).limit(1);

        if (organizations && organizations.length > 0) {
          // User has organization, go to dashboard
          return NextResponse.redirect(`${origin}/dashboard`);
        } else {
          // New user, send to onboarding
          return NextResponse.redirect(`${origin}/onboarding`);
        }
      }

      // Fallback to onboarding
      return NextResponse.redirect(`${origin}/onboarding`);
    } else {
      console.error("Auth callback error:", error);
      // If there was an error, redirect to login with an error message
      return NextResponse.redirect(`${origin}/login?error=confirmation_failed`);
    }
  }

  // If no code provided, redirect to login
  return NextResponse.redirect(`${origin}/login?error=invalid_confirmation_link`);
}
