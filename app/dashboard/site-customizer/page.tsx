// app/dashboard/site-customizer/page.tsx - UPDATED WITH LINKS MANAGER
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { CustomizerForm } from "./components/customizer-form";
import { LinksManager } from "./components/links-manager";

export default async function SiteCustomizerPage() {
  const cookieStore = await cookies();
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value;
        },
      },
    }
  );

  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session) {
    redirect("/login");
  }

  // Fetch the user's role and organization details
  const { data: orgRole, error: roleError } = await supabase
    .from("user_organization_roles")
    .select(
      `
      role,
      organizations (*)
    `
    )
    .eq("user_id", session.user.id)
    .single();

  if (roleError || !orgRole) {
    console.error("Error fetching organization role:", roleError);
    return <p>Error loading your organization data.</p>;
  }

  // Handle the potential array/object structure from Supabase
  const organizationData = Array.isArray(orgRole.organizations)
    ? orgRole.organizations[0]
    : orgRole.organizations;

  if (!organizationData) {
    return <p>Could not find organization details.</p>;
  }

  // Only admins can access this page
  if (orgRole.role !== "admin") {
    return (
      <div className="p-8">
        <h1 className="text-2xl font-bold">Access Denied</h1>
        <p>You must be an administrator to customize site settings.</p>
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-slate-900">
          Website Customizer
        </h1>
        <p className="text-slate-600 mt-1">
          Customize your site&apos;s branding, navigation, and content. Changes
          will be reflected immediately on your live website.
        </p>
      </div>

      {/* Main Customizer Form */}
      <div className="mb-12">
        <CustomizerForm organization={organizationData} />
      </div>

      {/* Forms & Links Manager Section */}
      <div className="bg-white rounded-lg shadow-sm border p-6">
        <LinksManager />
      </div>
    </div>
  );
}
