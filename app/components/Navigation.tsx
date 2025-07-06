// app/components/Navigation.tsx
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useEffect } from "react";
import { Team } from "@/lib/types";

interface NavLink {
  href: string;
  label: string;
  subLinks?: { href: string; label: string }[];
}

interface NavigationProps {
  teams?: Team[];
  navLinks: NavLink[];
}

export default function Navigation({
  teams = [],
  navLinks = [],
}: NavigationProps) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isTeamsDropdownOpen, setIsTeamsDropdownOpen] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    // Close mobile menu when route changes
    setIsMobileMenuOpen(false);
    setIsTeamsDropdownOpen(false);
  }, [pathname]);

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const closeMobileMenu = () => {
    setIsMobileMenuOpen(false);
  };

  const isActive = (path: string) => {
    return pathname === path;
  };

  // Find the teams link to handle special dropdown logic

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
            {navLinks.map((link) => {
              // Special handling for Teams dropdown
              if (link.label === "Teams" && teams.length > 0) {
                return (
                  <li key={link.href} className="relative group">
                    <button
                      className="hover:text-[#D29C9C] cursor-pointer text-lg transition-colors"
                      onMouseEnter={() => setIsTeamsDropdownOpen(true)}
                      onMouseLeave={() => setIsTeamsDropdownOpen(false)}
                    >
                      {link.label}
                    </button>
                    <ul
                      className={`absolute hidden group-hover:block bg-[#161659] p-2 z-10 min-w-max shadow-lg rounded-b-md ${
                        isTeamsDropdownOpen ? "block" : ""
                      }`}
                      onMouseEnter={() => setIsTeamsDropdownOpen(true)}
                      onMouseLeave={() => setIsTeamsDropdownOpen(false)}
                    >
                      {/* Link to teams index page */}
                      <li>
                        <Link
                          href="/teams"
                          className="hover:text-[#D29C9C] block py-1 px-2 whitespace-nowrap transition-colors"
                        >
                          View All Teams
                        </Link>
                      </li>
                      {/* Individual team links */}
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
                );
              }

              // Regular navigation links
              return (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className={`hover:text-[#D29C9C] text-lg transition-colors ${
                      isActive(link.href) ? "text-[#D29C9C]" : ""
                    }`}
                  >
                    {link.label}
                  </Link>
                </li>
              );
            })}
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
            {navLinks.map((link) => {
              // Special handling for Teams in mobile menu
              if (link.label === "Teams" && teams.length > 0) {
                return (
                  <li key={link.href}>
                    <div className="text-lg text-[#D29C9C] mb-2">
                      {link.label}:
                    </div>
                    <ul className="pl-4 space-y-2">
                      <li>
                        <Link
                          href="/teams"
                          className="hover:text-[#D29C9C] block py-1 text-sm transition-colors"
                          onClick={closeMobileMenu}
                        >
                          View All Teams
                        </Link>
                      </li>
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
                );
              }

              // Regular mobile navigation links
              return (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className={`hover:text-[#D29C9C] text-lg block transition-colors ${
                      isActive(link.href) ? "text-[#D29C9C]" : ""
                    }`}
                    onClick={closeMobileMenu}
                  >
                    {link.label}
                  </Link>
                </li>
              );
            })}
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
