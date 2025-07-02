// app/sites/[subdomain]/layout.tsx
import { createClient } from "@/lib/supabase/server";
import { cookies } from "next/headers";
import { notFound } from "next/navigation";
import { Header } from "@/app/components/Header";
import { Footer } from "@/app/components/Footer";
import { ThemeListener } from "@/app/components/ThemeListener";
import { OrganizationProvider } from "@/context/OrganizationProvider";

export default async function SiteLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: { subdomain: string };
}) {
  // THE FIX: Adding 'await' back, as the build environment expects a promise to be resolved.
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);

  // Fetch the organization based on the subdomain
  const { data: organization, error } = await supabase
    .from("organizations")
    .select("*")
    .eq("subdomain", params.subdomain)
    .single();

  if (error || !organization) {
    notFound(); // If no organization is found, show a 404 page
  }

  return (
    <OrganizationProvider organization={organization}>
      <div
        className="flex flex-col min-h-screen"
        style={
          {
            "--color-primary": organization.primary_color || "#161659",
            "--color-secondary": organization.secondary_color || "#BD1515",
          } as React.CSSProperties
        }
      >
        <ThemeListener />
        <Header />
        <main className="flex-grow">{children}</main>
        <Footer />
      </div>
    </OrganizationProvider>
  );
}
