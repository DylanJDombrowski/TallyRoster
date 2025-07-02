// middleware.ts
import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

export async function middleware(request: NextRequest) {
  let response = NextResponse.next({
    request: { headers: request.headers },
  });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
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
    }
  );

  await supabase.auth.getUser();

  const url = request.nextUrl;
  const hostname = request.headers.get("host") || "";
  const rootDomain = process.env.NEXT_PUBLIC_ROOT_DOMAIN || "localhost:3000";

  console.log("Hostname:", hostname);
  console.log("Root Domain:", rootDomain);
  console.log("Rewriting to:", url.pathname);
  // Prevent rewriting for static assets and internal Next.js paths
  if (
    url.pathname.startsWith("/_next") ||
    url.pathname.startsWith("/api") ||
    url.pathname.startsWith("/static") ||
    /\.(png|jpg|jpeg|gif|svg|ico)$/.test(url.pathname)
  ) {
    return response;
  }
  if (
    (hostname === rootDomain || hostname === `www.${rootDomain}`) &&
    !url.pathname.startsWith("/marketing")
  ) {
    // This is a request for the marketing site that hasn't been rewritten yet.
    url.pathname = `/marketing${url.pathname}`;
    return NextResponse.rewrite(url);
  }

  // For any other hostname, extract the subdomain.
  const subdomain = hostname.replace(`.${rootDomain}`, "");

  // Rewrite the URL to the /app/sites/[subdomain] route.
  url.pathname = `/sites/${subdomain}${url.pathname}`;
  return NextResponse.rewrite(url);
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};
