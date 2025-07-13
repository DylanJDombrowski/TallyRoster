// app/api/admin/sync-domains/route.ts
import { createClient } from "@/lib/supabase/server";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

async function addDomainToVercel(domain: string): Promise<boolean> {
  if (!process.env.VERCEL_TOKEN || !process.env.VERCEL_PROJECT_ID) {
    return false;
  }

  try {
    const response = await fetch(`https://api.vercel.com/v9/projects/${process.env.VERCEL_PROJECT_ID}/domains`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.VERCEL_TOKEN}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ name: domain }),
    });

    return response.ok;
  } catch (error) {
    console.error("Error adding domain to Vercel:", error);
    return false;
  }
}

export async function POST() {
  try {
    const cookieStore = await cookies();
    const supabase = createClient(cookieStore);

    // Verify admin access (you might want to add proper admin check)
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: "Authentication required" }, { status: 401 });
    }

    // Get all organizations where domain_added is false or null
    const { data: orgs, error } = await supabase
      .from("organizations")
      .select("id, subdomain, domain_added")
      .or("domain_added.is.null,domain_added.eq.false");

    if (error) {
      return NextResponse.json({ error: "Failed to fetch organizations" }, { status: 500 });
    }

    const results = [];

    for (const org of orgs || []) {
      const domain = `${org.subdomain}.tallyroster.com`;
      const added = await addDomainToVercel(domain);

      if (added) {
        await supabase.from("organizations").update({ domain_added: true }).eq("id", org.id);
      }

      results.push({
        subdomain: org.subdomain,
        domain,
        success: added,
      });
    }

    return NextResponse.json({
      success: true,
      processed: results.length,
      results,
    });
  } catch (error) {
    console.error("Domain sync error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
