// app/api/invitations/generate/route.ts
import { createClient } from "@/lib/supabase/server";
import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

const GenerateInviteSchema = z.object({
  organizationId: z.string().uuid(),
  role: z.enum(["admin", "coach", "member"]),
  expiresInDays: z.number().min(1).max(30).default(7),
});

export async function POST(request: NextRequest) {
  try {
    const cookieStore = await cookies();
    const supabase = createClient(cookieStore);

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: "Authentication required" }, { status: 401 });
    }

    const body = await request.json();
    const validatedData = GenerateInviteSchema.parse(body);

    // Check if user is admin of the organization
    const { data: userRole } = await supabase
      .from("user_organization_roles")
      .select("role")
      .eq("user_id", user.id)
      .eq("organization_id", validatedData.organizationId)
      .single();

    if (!userRole || userRole.role !== "admin") {
      return NextResponse.json({ error: "Admin access required" }, { status: 403 });
    }

    // Generate invitation code
    const inviteCode = Math.random().toString(36).substring(2, 10).toUpperCase();
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + validatedData.expiresInDays);

    // Store invitation in database
    const { data: invitation, error: inviteError } = await supabase
      .from("organization_invitations")
      .insert({
        code: inviteCode,
        organization_id: validatedData.organizationId,
        role: validatedData.role,
        created_by: user.id,
        expires_at: expiresAt.toISOString(),
        used: false,
      })
      .select()
      .single();

    if (inviteError) {
      console.error("Invitation creation error:", inviteError);
      return NextResponse.json({ error: "Failed to create invitation" }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      inviteCode,
      expiresAt: expiresAt.toISOString(),
      inviteUrl: `${process.env.NEXT_PUBLIC_SITE_URL}/invite/${inviteCode}`,
      invitation,
    });
  } catch (error) {
    console.error("Generate invite error:", error);
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: "Invalid data", details: error.errors }, { status: 400 });
    }
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
