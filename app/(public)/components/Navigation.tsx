"use client";

import { Team } from "@/lib/types";
import Link from "next/link";
import { useState } from "react";

export function Navigation({ teams }: { teams: Pick<Team, "id" | "name">[] }) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <nav className="bg-primary text-white py-3 sticky top-0 z-50">
      <div className="container mx-auto px-4 flex justify-between items-center">
        {/* Desktop Navigation */}
        <ul className="hidden md:flex justify-center w-full space-x-8">
          <li>
            <Link href="/" className="hover:text-accent text-lg">
              Home
            </Link>
          </li>
          <li className="relative group">
            <a className="hover:text-accent cursor-pointer text-lg">Xpress Teams</a>
            <ul className="absolute hidden group-hover:block bg-primary p-2 z-10">
              {teams.map((team) => (
                <li key={team.id}>
                  <Link href={`/teams/${team.id}`} className="hover:text-accent block py-1 whitespace-nowrap">
                    {team.name}
                  </Link>
                </li>
              ))}
            </ul>
          </li>
          {/* Add other nav links here */}
          <li>
            <Link href="/alumni" className="hover:text-accent text-lg">
              Xpress Alumni
            </Link>
          </li>
        </ul>

        {/* Mobile Navigation Toggle */}
        <div className="md:hidden ml-auto">
          <button onClick={() => setIsMobileMenuOpen(true)} className="focus:outline-none">
            {/* Hamburger Icon */}
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16m-7 6h7"></path>
            </svg>
          </button>
        </div>
      </div>

      {/* Mobile menu (slide-out) */}
      <div
        className={`mobile-menu fixed inset-y-0 right-0 w-64 bg-primary text-white transform transition-transform duration-300 ease-in-out z-50 md:hidden ${
          isMobileMenuOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <div className="p-4">
          <button onClick={() => setIsMobileMenuOpen(false)} className="mb-4 focus:outline-none">
            {/* Close Icon */}
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
            </svg>
          </button>
          <ul className="space-y-4">
            {/* Mobile Nav Links Here */}
            <li>
              <Link href="/" onClick={() => setIsMobileMenuOpen(false)}>
                Home
              </Link>
            </li>
            {/* Add other links */}
          </ul>
        </div>
      </div>
    </nav>
  );
}
