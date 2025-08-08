import { createClient } from "@/lib/supabase/server";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { getSessionData } from "@/lib/actions/session";
import { DomainManager } from "./components/domain-manager";

export default async function DomainsPage() {
  const sessionData = await getSessionData();

  if (!sessionData.user) {
    redirect("/login");
  }

  if (!sessionData.currentOrg || sessionData.currentRole !== "admin") {
    return (
      <div className="p-8">
        <h1 className="text-2xl font-bold text-red-600">Access Denied</h1>
        <p className="text-red-500">Admin access required to manage domains.</p>
      </div>
    );
  }

  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);

  const { data: organization } = await supabase
    .from("organizations")
    .select(
      "custom_domain, domain_verified, domain_verification_token, subdomain"
    )
    .eq("id", sessionData.currentOrg.id)
    .single();

  return (
    <div className="p-4 md:p-8">
      <h1 className="text-2xl font-bold text-slate-900 mb-4">Custom Domain</h1>
      <DomainManager
        organization={organization}
        organizationId={sessionData.currentOrg.id}
      />
    </div>
  );
}
