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
      // Successful confirmation - redirect to dashboard
      return NextResponse.redirect(`${origin}/dashboard`);
    } else {
      console.error("Auth callback error:", error);
      // If there was an error, redirect to login with an error message
      return NextResponse.redirect(`${origin}/login?error=confirmation_failed`);
    }
  }

  // If no code provided, redirect to login
  return NextResponse.redirect(`${origin}/login?error=invalid_confirmation_link`);
}
