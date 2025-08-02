// app/api/invitations/use/route.ts
import { createClient } from "@/lib/supabase/server";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

export async function POST() {
  try {
    const cookieStore = await cookies();
    const supabase = createClient(cookieStore);

    // Check if user is authenticated
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      );
    }

    // Check if user has invitation metadata
    const invitationData = user.user_metadata;
    const isInvitedUser =
      invitationData?.invitation_type === "organization_invite" ||
      invitationData?.invitation_type === "organization_reinvite";

    if (!isInvitedUser) {
      return NextResponse.json(
        { error: "No valid invitation found for this user" },
        { status: 400 }
      );
    }

    const organizationId = invitationData.organization_id;
    const assignedRole = invitationData.assigned_role;
    const teamId = invitationData.team_id;

    if (!organizationId || !assignedRole) {
      return NextResponse.json(
        { error: "Invalid invitation data" },
        { status: 400 }
      );
    }

    // Check if user is already in organization
    const { data: existingRole } = await supabase
      .from("user_organization_roles")
      .select("id")
      .eq("user_id", user.id)
      .eq("organization_id", organizationId)
      .single();

    if (existingRole) {
      return NextResponse.json(
        { error: "You are already a member of this organization" },
        { status: 400 }
      );
    }

    // Add user to organization
    const orgRole = assignedRole === "parent" ? "member" : assignedRole;
    const { error: orgRoleError } = await supabase
      .from("user_organization_roles")
      .insert({
        user_id: user.id,
        organization_id: organizationId,
        role: orgRole,
      });

    if (orgRoleError) {
      console.error("Failed to add user to organization:", orgRoleError);
      return NextResponse.json(
        { error: "Failed to join organization" },
        { status: 500 }
      );
    }

    // Add detailed user role
    const { error: userRoleError } = await supabase.from("user_roles").insert({
      user_id: user.id,
      role: assignedRole,
      team_id: assignedRole === "admin" ? null : teamId,
    });

    if (userRoleError) {
      console.error("Failed to add user role:", userRoleError);
      // Don't fail completely, organization role was added successfully
    }

    // Get organization details
    const { data: organization } = await supabase
      .from("organizations")
      .select("name")
      .eq("id", organizationId)
      .single();

    return NextResponse.json({
      success: true,
      organization: organization || { name: "Organization" },
      role: assignedRole,
    });
  } catch (error) {
    console.error("Error processing invitation:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
