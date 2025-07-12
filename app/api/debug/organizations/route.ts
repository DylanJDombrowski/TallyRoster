// app/api/debug/organizations/route.ts
import { createClient } from "@/lib/supabase/server";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const cookieStore = await cookies();
    const supabase = createClient(cookieStore);

    const { data: organizations, error } = await supabase.from("organizations").select("id, name, subdomain, owner_id").order("name");

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      count: organizations?.length || 0,
      organizations: organizations || [],
    });
  } catch (error) {
    console.error("Debug organizations error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
