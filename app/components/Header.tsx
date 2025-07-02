// app/components/Header.tsx
import { createClient } from "@/lib/supabase/server";
import { cookies } from "next/headers";
import Image from "next/image";
import Link from "next/link";
import Navigation from "./Navigation";

export async function Header() {
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);

  // Fetch the user session
  const {
    data: { session },
  } = await supabase.auth.getSession();

  // THE FIX: Fetch all columns for the teams to match the type expected by Navigation.
  const { data: teams } = await supabase
    .from("teams")
    .select("*") // Changed from "id, name" to "*"
    .order("name");

  return (
    <header className="font-oswald bg-white shadow-sm">
      {/* Top ribbon */}
      <div
        className="py-1 px-4 text-white"
        style={{ backgroundColor: "var(--color-secondary, #b70f0f)" }}
      >
        <div className="container mx-auto flex justify-between items-center text-sm">
          <div>mvxpresssoftballorg&#64;gmail.com</div>
          <div className="flex space-x-4">
            <a
              href="https://twitter.com/XpressSoftball"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Twitter"
            >
              T
            </a>
          </div>
        </div>
      </div>

      {/* Logo and title */}
      <div className="container mx-auto py-4 px-4">
        <div className="flex items-center justify-center">
          <Image
            src="/assets/logos/mvxLogo2.png"
            alt="MVX Logo"
            width={96}
            height={96}
            className="h-16 md:h-24 w-auto mr-4"
          />
          <div className="text-center md:text-left">
            <h1
              className="text-2xl md:text-5xl uppercase font-medium text-primary"
              style={{ color: "var(--color-primary, #161659)" }}
            >
              Miami Valley Xpress
            </h1>
            <p
              className="text-sm md:text-2xl uppercase text-ribbon hidden md:block"
              style={{ color: "var(--color-ribbon, #b70f0f)" }}
            >
              Champions on the diamond, friends for life.
            </p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <div
        className="bg-primary"
        style={{ backgroundColor: "var(--color-primary, #161659)" }}
      >
        <div className="container mx-auto flex justify-between items-center">
          <Navigation teams={teams ?? []} />
          <div className="pr-4">
            {session?.user ? (
              <Link
                href="/dashboard"
                className="px-4 py-2 text-sm font-semibold text-primary bg-white rounded-md hover:bg-slate-100"
                style={{ color: "var(--color-primary, #161659)" }}
              >
                Dashboard
              </Link>
            ) : (
              <Link
                href="/login"
                className="px-4 py-2 text-sm font-semibold text-primary bg-white rounded-md hover:bg-slate-100"
                style={{ color: "var(--color-primary, #161659)" }}
              >
                Log In
              </Link>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
