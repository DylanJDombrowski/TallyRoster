import { createClient } from "@/lib/supabase/server";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { getSessionData } from "@/lib/actions";
import { SponsorsManager } from "./components/sponsors-manager";

export const dynamic = "force-dynamic";

export default async function ManageSponsorsPage() {
  const sessionData = await getSessionData();

  if (!sessionData.user) {
    redirect("/login");
  }

  if (!sessionData.currentOrg || sessionData.currentRole !== "admin") {
    return (
      <div className="p-8">
        <h1 className="text-2xl font-bold text-red-600">Access Denied</h1>
        <p className="text-red-500">
          Admin access required to manage sponsors.
        </p>
      </div>
    );
  }

  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);

  const { data: sponsors } = await supabase
    .from("sponsors")
    .select("*")
    .eq("organization_id", sessionData.currentOrg.id)
    .order("position", { ascending: true });

  return (
    <div className="p-4 md:p-8">
      <h1 className="text-2xl font-bold text-slate-900 mb-4">
        Manage Sponsors
      </h1>
      <SponsorsManager
        initialSponsors={sponsors ?? []}
        organizationId={sessionData.currentOrg.id}
      />
    </div>
  );
}
