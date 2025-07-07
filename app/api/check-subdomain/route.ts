// app/api/check-subdomain/route.ts
import { createClient } from "@/lib/supabase/server";
import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";

const RESERVED_SUBDOMAINS = [
  "www",
  "api",
  "admin",
  "app",
  "mail",
  "email",
  "support",
  "help",
  "blog",
  "news",
  "marketing",
  "sales",
  "ftp",
  "cdn",
  "assets",
  "static",
  "media",
  "upload",
  "download",
  "docs",
  "documentation",
];

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const subdomain = searchParams.get("subdomain");

    if (!subdomain) {
      return NextResponse.json({ error: "Subdomain is required" }, { status: 400 });
    }

    // Validate subdomain format
    if (subdomain.length < 3 || subdomain.length > 20) {
      return NextResponse.json({
        available: false,
        error: "Subdomain must be 3-20 characters long",
      });
    }

    if (!/^[a-z0-9]+$/.test(subdomain)) {
      return NextResponse.json({
        available: false,
        error: "Subdomain can only contain letters and numbers",
      });
    }

    // Check if subdomain is reserved
    if (RESERVED_SUBDOMAINS.includes(subdomain.toLowerCase())) {
      return NextResponse.json({
        available: false,
        error: "This subdomain is reserved",
      });
    }

    // Check if subdomain is already taken in database
    const cookieStore = await cookies();
    const supabase = createClient(cookieStore);

    const { data: existingOrg, error } = await supabase
      .from("organizations")
      .select("id")
      .eq("subdomain", subdomain.toLowerCase())
      .single();

    if (error && error.code !== "PGRST116") {
      // PGRST116 = no rows returned
      console.error("Database error:", error);
      return NextResponse.json(
        {
          available: false,
          error: "Error checking availability",
        },
        { status: 500 }
      );
    }

    const available = !existingOrg;

    return NextResponse.json({
      available,
      subdomain: subdomain.toLowerCase(),
    });
  } catch (error) {
    console.error("Subdomain check error:", error);
    return NextResponse.json(
      {
        available: false,
        error: "Internal server error",
      },
      { status: 500 }
    );
  }
}
