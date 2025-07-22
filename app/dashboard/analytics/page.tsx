// app/dashboard/analytics/page.tsx
import { createClient } from "@/lib/supabase/server";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { AnalyticsDashboard } from "./components/analytics-dashboard";
import { getOrganizationAnalytics, getAnalyticsSummary } from "@/lib/analytics/server";

export default async function AnalyticsPage() {
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  // Get user's current organization
  const { data: userOrgRole } = await supabase
    .from("user_organization_roles")
    .select(
      `
      organization_id,
      role,
      organizations (
        id, name, subdomain
      )
    `
    )
    .eq("user_id", user.id)
    .limit(1)
    .single();

  if (!userOrgRole?.organizations) {
    redirect("/onboarding");
  }

  const organization = Array.isArray(userOrgRole.organizations) 
    ? userOrgRole.organizations[0] 
    : userOrgRole.organizations;

  // Check if user has permission to view analytics (admin or coach)
  if (!["admin", "coach"].includes(userOrgRole.role)) {
    redirect("/dashboard");
  }

  // Fetch analytics data
  const [analyticsData, analyticsSummary] = await Promise.all([
    getOrganizationAnalytics(organization.id),
    getAnalyticsSummary(organization.id),
  ]);

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-900">Analytics</h1>
        <p className="text-slate-600">
          View detailed analytics for {organization.name}
        </p>
      </div>

      <AnalyticsDashboard 
        analyticsData={analyticsData}
        analyticsSummary={analyticsSummary}
      />
    </div>
  );
}