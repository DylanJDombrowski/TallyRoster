// app/sites/[subdomain]/page.tsx
import { createClient } from "@/lib/supabase/server";
import { cookies } from "next/headers";
import { notFound } from "next/navigation";

export default async function OrganizationHomePage({
  params,
}: {
  params: { subdomain: string };
}) {
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);

  const { data: organization } = await supabase
    .from("organizations")
    .select("name")
    .eq("subdomain", params.subdomain)
    .single();

  if (!organization) {
    notFound();
  }

  return (
    <div className="container mx-auto px-4 py-16">
      <h1 className="text-4xl font-bold text-center">
        Welcome to the {organization.name} Homepage
      </h1>
      {/* You can build out the rest of the organization's homepage content here */}
    </div>
  );
}
