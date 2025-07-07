// middleware.ts
import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

export async function middleware(request: NextRequest) {
  let response = NextResponse.next({
    request: { headers: request.headers },
  });

  const supabase = createServerClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!, {
    cookies: {
      get: (name) => request.cookies.get(name)?.value,
      set: (name, value, options) => {
        request.cookies.set({ name, value, ...options });
        response = NextResponse.next({
          request: { headers: request.headers },
        });
        response.cookies.set({ name, value, ...options });
      },
      remove: (name, options) => {
        request.cookies.set({ name, value: "", ...options });
        response = NextResponse.next({
          request: { headers: request.headers },
        });
        response.cookies.set({ name, value: "", ...options });
      },
    },
  });

  await supabase.auth.getUser();

  const url = request.nextUrl;
  const hostname = request.headers.get("host") || "";
  const rootDomain = process.env.NEXT_PUBLIC_ROOT_DOMAIN || "localhost:3000";

  console.log("Hostname:", hostname);
  console.log("Root Domain:", rootDomain);
  console.log("Original path:", url.pathname);

  // Prevent rewriting for static assets and internal Next.js paths
  if (
    url.pathname.startsWith("/_next") ||
    url.pathname.startsWith("/api") ||
    url.pathname.startsWith("/static") ||
    /\.(png|jpg|jpeg|gif|svg|ico)$/.test(url.pathname)
  ) {
    return response;
  }

  // Check if this is the root domain (marketing site)
  if (hostname === rootDomain || hostname === `www.${rootDomain}`) {
    // Auth routes, dashboard, and onboarding should stay at root level
    if (
      url.pathname.startsWith("/login") ||
      url.pathname.startsWith("/signup") ||
      url.pathname.startsWith("/auth") ||
      url.pathname.startsWith("/dashboard") ||
      url.pathname.startsWith("/onboarding") // ADD THIS LINE
    ) {
      console.log("Auth/Dashboard/Onboarding route, no rewrite needed");
      return response;
    }

    // Marketing routes - rewrite to /marketing prefix if not already there
    if (!url.pathname.startsWith("/marketing")) {
      url.pathname = `/marketing${url.pathname}`;
      console.log("Rewriting to:", url.pathname);
      return NextResponse.rewrite(url);
    }

    // If already starts with /marketing, let it through
    return response;
  }

  // For any other hostname (subdomains), extract the subdomain and rewrite to /sites/[subdomain]
  const subdomain = hostname.replace(`.${rootDomain}`, "");
  url.pathname = `/sites/${subdomain}${url.pathname}`;
  console.log("Subdomain rewrite to:", url.pathname);
  return NextResponse.rewrite(url);
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};
