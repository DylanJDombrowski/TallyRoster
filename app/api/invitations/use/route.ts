// app/api/invitations/use/route.ts
import { createClient } from "@/lib/supabase/server";
import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";

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

    const { inviteCode } = await request.json();

    if (!inviteCode) {
      return NextResponse.json({ error: "Invite code required" }, { status: 400 });
    }

    // Find and validate invitation
    const { data: invitation, error: inviteError } = await supabase
      .from("organization_invitations")
      .select("*, organizations(name)")
      .eq("code", inviteCode.toUpperCase())
      .eq("used", false)
      .gt("expires_at", new Date().toISOString())
      .single();

    if (inviteError || !invitation) {
      return NextResponse.json({ error: "Invalid or expired invitation code" }, { status: 400 });
    }

    // Check if user is already in this organization
    const { data: existingRole } = await supabase
      .from("user_organization_roles")
      .select("id")
      .eq("user_id", user.id)
      .eq("organization_id", invitation.organization_id)
      .single();

    if (existingRole) {
      return NextResponse.json({ error: "You are already a member of this organization" }, { status: 400 });
    }

    // Add user to organization
    const { error: roleError } = await supabase.from("user_organization_roles").insert({
      user_id: user.id,
      organization_id: invitation.organization_id,
      role: invitation.role,
    });

    if (roleError) {
      return NextResponse.json({ error: "Failed to join organization" }, { status: 500 });
    }

    // Mark invitation as used
    await supabase
      .from("organization_invitations")
      .update({ used: true, used_by: user.id, used_at: new Date().toISOString() })
      .eq("id", invitation.id);

    return NextResponse.json({
      success: true,
      organization: {
        id: invitation.organization_id,
        name: invitation.organizations?.name,
      },
      role: invitation.role,
    });
  } catch (error) {
    console.error("Use invite error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
