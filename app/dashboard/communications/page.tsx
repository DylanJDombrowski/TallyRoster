// app/dashboard/communications/page.tsx
import { createClient } from "@/lib/supabase/server";
import { cookies } from "next/headers";
import { CommunicationManager } from "./components/communication-manager";
import { getSessionData } from "@/lib/actions";
import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

export default async function CommunicationsPage() {
  // Use centralized session data instead of refetching
  const sessionData = await getSessionData();

  if (!sessionData.user) {
    redirect("/login");
  }

  if (!sessionData.currentOrg || !sessionData.currentRole) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            Access Error
          </h1>
          <p className="text-gray-600">
            Error loading your organization data. Please ensure you are part of
            an organization.
          </p>
        </div>
      </div>
    );
  }

  // Check if user has permission to send communications (admin or coach)
  if (!["admin", "coach"].includes(sessionData.currentRole)) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            Access Denied
          </h1>
          <p className="text-gray-600">
            You need admin or coach permissions to access communications.
          </p>
        </div>
      </div>
    );
  }

  const organizationId = sessionData.currentOrg.id;

  // Initialize Supabase client for remaining data fetching
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);

  // Fetch teams for targeting options
  const { data: teams } = await supabase
    .from("teams")
    .select("id, name")
    .eq("organization_id", organizationId)
    .order("name");

  // Fetch communication groups
  const { data: groups } = await supabase
    .from("communication_groups")
    .select("id, name, description")
    .eq("organization_id", organizationId)
    .order("name");

  // Fetch recent communications for history
  const { data: recentCommunications } = await supabase
    .from("communications")
    .select(
      `
      *,
      communication_deliveries(
        status,
        delivery_channel,
        sent_at,
        delivered_at
      )
    `
    )
    .eq("organization_id", organizationId)
    .order("created_at", { ascending: false })
    .limit(10);

  // Ensure created_at is always a string (fallback to empty string if null)
  const safeRecentCommunications = (recentCommunications || []).map((comm) => ({
    ...comm,
    created_at: comm.created_at ?? "",
  }));

  return (
    <CommunicationManager
      organizationId={organizationId}
      userRole={sessionData.currentRole}
      teams={teams || []}
      groups={groups || []}
      recentCommunications={safeRecentCommunications}
    />
  );
}
