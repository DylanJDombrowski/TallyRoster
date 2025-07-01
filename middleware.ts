// middleware.ts
import { createServerClient, type CookieOptions } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

export async function middleware(request: NextRequest) {
  // --- Start of Supabase Auth Logic ---
  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return request.cookies.get(name)?.value;
        },
        set(name: string, value: string, options: CookieOptions) {
          request.cookies.set({ name, value, ...options });
          response = NextResponse.next({
            request: { headers: request.headers },
          });
          response.cookies.set({ name, value, ...options });
        },
        remove(name: string, options: CookieOptions) {
          request.cookies.set({ name, value: "", ...options });
          response = NextResponse.next({
            request: { headers: request.headers },
          });
          response.cookies.set({ name, value: "", ...options });
        },
      },
    }
  );

  // This line is important to refresh the session before continuing
  await supabase.auth.getUser();
  // --- End of Supabase Auth Logic ---

  // --- Start of Multi-Tenancy Routing Logic ---
  const url = request.nextUrl;
  const hostname = request.headers.get("host") || "app.trysideline.com";

  // Define your root domain and the path for the marketing/main site.
  const rootDomain = "trysideline.com";
  const marketingSitePath = "/marketing"; // A designated folder for your main site pages

  // If the hostname is the main domain, rewrite to the marketing folder.
  if (hostname === `app.${rootDomain}` || hostname === rootDomain) {
    url.pathname = `${marketingSitePath}${url.pathname}`;
    return NextResponse.rewrite(url);
  }

  // For any other hostname, extract the subdomain and rewrite to the organization's site folder.
  // This is the core logic from your "Building Scalable SaaS" plan[cite: 575].
  const subdomain = hostname.replace(`.${rootDomain}`, "");
  url.pathname = `/sites/${subdomain}${url.pathname}`;

  // Return the final response, which includes both the auth cookies and the rewritten path.
  return NextResponse.rewrite(url, response);
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    "/((?!_next/static|_next/image|favicon.ico|api/).*)",
  ],
};
