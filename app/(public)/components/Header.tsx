import { createServerComponentClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";
import Image from "next/image";
import { Navigation } from "./Navigation"; // This will be our client component

export async function Header() {
  const cookieStore = cookies();
  const supabase = createServerComponentClient({ cookies: () => cookieStore });

  // Fetch teams from the database instead of hardcoding them
  const { data: teams } = await supabase.from("teams").select("id, name").order("name");

  return (
    <header className="font-oswald bg-white">
      {/* Top ribbon */}
      <div className="bg-ribbon text-white py-1 px-4">
        <div className="container mx-auto flex justify-between items-center text-sm">
          <div>mvxpresssoftballorg&#64;gmail.com</div>
          <div className="flex space-x-4">{/* Add social links here */}</div>
        </div>
      </div>

      {/* Logo and title */}
      <div className="container mx-auto py-4 px-4">
        <div className="flex items-center justify-center">
          <Image
            src="/assets/logos/mvxLogo2.png" // Assumes you move logos to the public folder
            alt="MVX Logo"
            className="h-16 md:h-24 mr-4"
          />
          <div className="text-center md:text-left">
            <h1 className="text-2xl md:text-5xl uppercase font-medium text-primary">Miami Valley Xpress</h1>
            <p className="text-sm md:text-2xl uppercase text-ribbon hidden md:block">Champions on the diamond, friends for life.</p>
          </div>
        </div>
      </div>

      {/* Navigation - Now a separate client component */}
      <Navigation teams={teams ?? []} />
    </header>
  );
}
