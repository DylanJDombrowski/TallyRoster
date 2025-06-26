// app/components/Navigation.tsx
"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";

interface Team {
  id: string;
  name: string;
  year?: number;
}

interface NavigationProps {
  teams?: Team[];
}

export default function Navigation({
  teams: initialTeams = [],
}: NavigationProps) {
  const [teams, setTeams] = useState<Team[]>(initialTeams);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isTeamsDropdownOpen, setIsTeamsDropdownOpen] = useState(false);
  const pathname = usePathname();
  const supabase = createClientComponentClient();

  useEffect(() => {
    // If no initial teams provided, load from database
    if (initialTeams.length === 0) {
      loadTeams();
    }
  }, [initialTeams.length]);

  useEffect(() => {
    // Close mobile menu when route changes
    setIsMobileMenuOpen(false);
    setIsTeamsDropdownOpen(false);
  }, [pathname]);

  const loadTeams = async () => {
    try {
      const { data, error } = await supabase
        .from("teams")
        .select("id, name, year")
        .order("year", { ascending: false });

      if (error) throw error;
      setTeams(data || []);
    } catch (error) {
      console.error("Error loading teams:", error);
      // Fallback to static team years if database fails
      const fallbackTeams = Array.from({ length: 9 }, (_, i) => ({
        id: (2014 - i).toString(),
        name: `Miami Valley Xpress ${2014 - i}`,
        year: 2014 - i,
      }));
      setTeams(fallbackTeams);
    }
  };

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const closeMobileMenu = () => {
    setIsMobileMenuOpen(false);
  };

  const isActive = (path: string) => {
    return pathname === path;
  };

  return (
    <>
      {/* Navigation - Sticky */}
      <nav className="bg-[#161659] text-white py-3 sticky top-0 z-50">
        <div className="container mx-auto px-4">
          {/* Mobile Navigation Toggle */}
          <div className="flex justify-end items-center md:hidden">
            <button
              onClick={toggleMobileMenu}
              className="mobile-menu-button focus:outline-none"
              aria-label="Toggle mobile menu"
            >
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M4 6h16M4 12h16m-7 6h7"
                />
              </svg>
            </button>
          </div>

          {/* Desktop Navigation */}
          <ul className="hidden md:flex justify-center space-x-8">
            <li>
              <Link
                href="/"
                className={`hover:text-[#D29C9C] text-lg transition-colors ${
                  isActive("/") ? "text-[#D29C9C]" : ""
                }`}
              >
                Home
              </Link>
            </li>

            <li className="relative group">
              <button
                className="hover:text-[#D29C9C] cursor-pointer text-lg transition-colors"
                onMouseEnter={() => setIsTeamsDropdownOpen(true)}
                onMouseLeave={() => setIsTeamsDropdownOpen(false)}
              >
                Xpress Teams
              </button>
              <ul
                className={`absolute hidden group-hover:block bg-[#161659] p-2 z-10 min-w-max shadow-lg rounded-b-md ${
                  isTeamsDropdownOpen ? "block" : ""
                }`}
                onMouseEnter={() => setIsTeamsDropdownOpen(true)}
                onMouseLeave={() => setIsTeamsDropdownOpen(false)}
              >
                {teams.map((team) => (
                  <li key={team.id}>
                    <Link
                      href={`/teams/${team.id}`}
                      className="hover:text-[#D29C9C] block py-1 px-2 whitespace-nowrap transition-colors"
                    >
                      {team.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </li>

            <li>
              <Link
                href="/alumni"
                className={`hover:text-[#D29C9C] text-lg transition-colors ${
                  isActive("/alumni") ? "text-[#D29C9C]" : ""
                }`}
              >
                Xpress Alumni
              </Link>
            </li>

            <li>
              <Link
                href="/blog"
                className={`hover:text-[#D29C9C] text-lg transition-colors ${
                  pathname?.startsWith("/blog") ? "text-[#D29C9C]" : ""
                }`}
              >
                On The Field
              </Link>
            </li>

            <li>
              <Link
                href="/all-aboard"
                className={`hover:text-[#D29C9C] text-lg transition-colors ${
                  isActive("/all-aboard") ? "text-[#D29C9C]" : ""
                }`}
              >
                All Aboard
              </Link>
            </li>

            <li>
              <Link
                href="/extended-team"
                className={`hover:text-[#D29C9C] text-lg transition-colors ${
                  isActive("/extended-team") ? "text-[#D29C9C]" : ""
                }`}
              >
                Our Extended Team
              </Link>
            </li>

            <li>
              <Link
                href="/xpress-social"
                className={`hover:text-[#D29C9C] text-lg transition-colors ${
                  isActive("/xpress-social") ? "text-[#D29C9C]" : ""
                }`}
              >
                Xpress Social
              </Link>
            </li>
          </ul>
        </div>
      </nav>

      {/* Mobile menu (slide-out) */}
      <div
        className={`mobile-menu fixed inset-y-0 right-0 w-64 bg-[#161659] text-white transform transition-transform duration-300 ease-in-out z-50 md:hidden ${
          isMobileMenuOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <div className="p-4">
          <button
            onClick={closeMobileMenu}
            className="mb-4 focus:outline-none"
            aria-label="Close mobile menu"
          >
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>

          <ul className="space-y-4">
            <li>
              <Link
                href="/"
                className={`hover:text-[#D29C9C] text-lg block transition-colors ${
                  isActive("/") ? "text-[#D29C9C]" : ""
                }`}
                onClick={closeMobileMenu}
              >
                Home
              </Link>
            </li>

            <li>
              <div className="text-lg text-[#D29C9C] mb-2">Teams:</div>
              <ul className="pl-4 space-y-2">
                {teams.map((team) => (
                  <li key={team.id}>
                    <Link
                      href={`/teams/${team.id}`}
                      className="hover:text-[#D29C9C] block py-1 text-sm transition-colors"
                      onClick={closeMobileMenu}
                    >
                      {team.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </li>

            <li>
              <Link
                href="/alumni"
                className={`hover:text-[#D29C9C] text-lg block transition-colors ${
                  isActive("/alumni") ? "text-[#D29C9C]" : ""
                }`}
                onClick={closeMobileMenu}
              >
                Xpress Alumni
              </Link>
            </li>

            <li>
              <Link
                href="/blog"
                className={`hover:text-[#D29C9C] text-lg block transition-colors ${
                  pathname?.startsWith("/blog") ? "text-[#D29C9C]" : ""
                }`}
                onClick={closeMobileMenu}
              >
                On The Field
              </Link>
            </li>

            <li>
              <Link
                href="/all-aboard"
                className={`hover:text-[#D29C9C] text-lg block transition-colors ${
                  isActive("/all-aboard") ? "text-[#D29C9C]" : ""
                }`}
                onClick={closeMobileMenu}
              >
                All Aboard
              </Link>
            </li>

            <li>
              <Link
                href="/extended-team"
                className={`hover:text-[#D29C9C] text-lg block transition-colors ${
                  isActive("/extended-team") ? "text-[#D29C9C]" : ""
                }`}
                onClick={closeMobileMenu}
              >
                Our Extended Team
              </Link>
            </li>

            <li>
              <Link
                href="/xpress-social"
                className={`hover:text-[#D29C9C] text-lg block transition-colors ${
                  isActive("/xpress-social") ? "text-[#D29C9C]" : ""
                }`}
                onClick={closeMobileMenu}
              >
                Xpress Social
              </Link>
            </li>
          </ul>
        </div>
      </div>

      {/* Mobile menu overlay */}
      {isMobileMenuOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40 md:hidden"
          onClick={closeMobileMenu}
        />
      )}
    </>
  );
}
