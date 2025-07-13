// app/sites/[subdomain]/page.tsx
import { createClient } from "@/lib/supabase/server";
import { cookies } from "next/headers";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";

export default async function OrganizationHomePage({ params }: { params: Promise<{ subdomain: string }> }) {
  const cookieStore = await cookies();
  const { subdomain } = await params;
  const supabase = createClient(cookieStore);

  // Fetch the full organization object to get all branding details
  const { data: organization } = await supabase
    .from("organizations")
    .select("*") // Select all columns
    .eq("subdomain", subdomain)
    .single();

  if (!organization) {
    notFound();
  }

  return (
    <div className="w-full">
      {/* Hero Section */}
      <div className="relative text-white text-center py-20 md:py-32" style={{ backgroundColor: organization.primary_color || "#161659" }}>
        <div className="absolute inset-0 bg-black opacity-20"></div>
        <div className="relative container mx-auto px-4 flex flex-col items-center">
          {organization.logo_url && (
            <div className="w-24 h-24 md:w-32 md:h-32 mb-6 relative">
              <Image src={organization.logo_url} alt={`${organization.name} Logo`} fill className="object-contain" priority />
            </div>
          )}
          <h1 className="text-4xl md:text-6xl font-extrabold uppercase tracking-tight">{organization.name}</h1>
          <p className="text-lg md:text-2xl mt-2 font-light" style={{ color: organization.secondary_color ? "white" : "#E5E7EB" }}>
            {organization.slogan || "Excellence in Sports"}
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-4">
            <Link
              href="/teams"
              className="px-8 py-3 rounded-md font-semibold text-white transition"
              style={{ backgroundColor: organization.secondary_color || "#BD1515" }}
            >
              View Our Teams
            </Link>
            <Link
              href="/forms-and-links"
              className="px-8 py-3 rounded-md font-semibold bg-white bg-opacity-20 hover:bg-opacity-30 transition"
            >
              Resources
            </Link>
          </div>
        </div>
      </div>

      {/* Placeholder for future content sections */}
      <div className="container mx-auto px-4 py-16 text-center text-gray-700 dark:text-gray-300">
        <h2 className="text-3xl font-bold mb-4">Latest News</h2>
        <p>News and updates will be displayed here soon.</p>
      </div>
    </div>
  );
}
