// middleware.ts - Complete TallyRoster Migration
import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

export async function middleware(request: NextRequest) {
  let response = NextResponse.next({
    request: { headers: request.headers },
  });

  console.log("🔍 MIDDLEWARE START", {
    url: request.url,
    hostname: request.headers.get("host"),
    pathname: request.nextUrl.pathname,
  });

  const url = request.nextUrl;
  const hostname = request.headers.get("host") || "";

  // Skip middleware for static assets and internal Next.js paths
  if (
    url.pathname.startsWith("/_next") ||
    url.pathname.startsWith("/api") ||
    url.pathname.startsWith("/static") ||
    url.pathname.includes(".") // Skip files with extensions
  ) {
    console.log("⏭️ Skipping middleware for static/API path");
    return response;
  }

  // Define your root domain - UPDATED FOR TALLYROSTER
  const isLocal = hostname.includes("localhost") || hostname.includes("127.0.0.1");
  const rootDomain = isLocal ? (hostname.includes("3000") ? "localhost:3000" : "localhost") : "tallyroster.com"; // CHANGED FROM trysideline.com

  console.log("🌐 Middleware Debug:", {
    hostname,
    rootDomain,
    path: url.pathname,
    isLocal,
  });

  // Handle legacy domain redirects (trysideline.com -> tallyroster.com)
  if (hostname.includes("trysideline.com")) {
    console.log("🔄 Redirecting legacy domain to TallyRoster");
    const newHostname = hostname.replace("trysideline.com", "tallyroster.com");
    const redirectUrl = new URL(url.pathname + url.search, `https://${newHostname}`);
    return NextResponse.redirect(redirectUrl, 301); // Permanent redirect for SEO
  }

  // Initialize Supabase client
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

  // Check if this is the root domain (marketing site)
  const isRootDomain =
    hostname === rootDomain ||
    hostname === `www.${rootDomain}` ||
    (isLocal && (hostname === "localhost" || hostname.includes("localhost")));

  if (isRootDomain) {
    console.log("📍 Root domain detected - routing to marketing");

    // Auth routes, dashboard, and onboarding should stay at root level
    if (
      url.pathname.startsWith("/login") ||
      url.pathname.startsWith("/signup") ||
      url.pathname.startsWith("/auth") ||
      url.pathname.startsWith("/dashboard") ||
      url.pathname.startsWith("/onboarding") ||
      url.pathname.startsWith("/invite")
    ) {
      console.log("✅ Auth/Dashboard route, no rewrite needed");
      return response;
    }

    // Marketing routes - rewrite to /marketing prefix if not already there
    if (!url.pathname.startsWith("/marketing")) {
      const newUrl = url.clone();
      newUrl.pathname = `/marketing${url.pathname}`;
      console.log("📝 Rewriting to marketing:", newUrl.pathname);
      return NextResponse.rewrite(newUrl);
    }

    return response;
  }

  // Extract subdomain for organization sites
  let subdomain = hostname.replace(`.${rootDomain}`, "");

  // Remove www prefix if present
  if (subdomain.startsWith("www.")) {
    subdomain = subdomain.replace("www.", "");
  }

  // Handle local development subdomains
  if (isLocal && hostname.includes(".localhost")) {
    subdomain = hostname.split(".")[0];
  }

  // Skip if subdomain is empty or www
  if (!subdomain || subdomain === "www" || subdomain === hostname) {
    console.log("❌ Invalid subdomain, redirecting to main site", { subdomain, hostname });
    const redirectUrl = new URL("/", `https://${rootDomain}`);
    return NextResponse.redirect(redirectUrl);
  }

  console.log("🏢 Organization subdomain detected:", subdomain);

  // Verify subdomain exists in database with enhanced logging
  try {
    console.log("🔍 Checking database for subdomain:", subdomain);

    const { data: org, error } = await supabase.from("organizations").select("id, subdomain, name").eq("subdomain", subdomain).single();

    console.log("📊 Database query result:", { org, error });

    if (!org) {
      console.log("❌ Organization not found for subdomain:", subdomain);
      // Redirect to main site if subdomain doesn't exist
      const redirectUrl = new URL("/", `https://${rootDomain}`);
      return NextResponse.redirect(redirectUrl);
    }

    console.log("✅ Valid organization found:", org);
  } catch (error) {
    console.error("🚨 Database error checking subdomain:", error);
    // On error, redirect to main site
    const redirectUrl = new URL("/", `https://${rootDomain}`);
    return NextResponse.redirect(redirectUrl);
  }

  // Rewrite to organization site
  const newUrl = url.clone();
  newUrl.pathname = `/sites/${subdomain}${url.pathname}`;
  console.log("🔄 Rewriting to organization site:", newUrl.pathname);

  return NextResponse.rewrite(newUrl);
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - api routes
     */
    "/((?!_next/static|_next/image|favicon.ico|api).*)",
  ],
};
