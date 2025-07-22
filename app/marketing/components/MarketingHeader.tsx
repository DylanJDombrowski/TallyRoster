// app/marketing/components/MarketingHeader.tsx

"use client";

import Link from "next/link";
import { useState } from "react";

export function MarketingHeader() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <header className="bg-white shadow-sm sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link href="/marketing" className="flex items-center">
            <span className="text-2xl font-bold text-blue-600">
              TallyRoster
            </span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-8">
            <Link
              href="/marketing/features"
              className="text-slate-600 hover:text-slate-900 font-medium"
            >
              Features
            </Link>
            <Link
              href="/marketing/pricing"
              className="text-slate-600 hover:text-slate-900 font-medium"
            >
              Pricing
            </Link>
            <Link
              href="/marketing/about"
              className="text-slate-600 hover:text-slate-900 font-medium"
            >
              About
            </Link>
            <Link
              href="/marketing/contact"
              className="text-slate-600 hover:text-slate-900 font-medium"
            >
              Contact
            </Link>
          </nav>

          {/* Desktop CTA Buttons */}
          <div className="hidden md:flex items-center space-x-4">
            <Link
              href="/login"
              className="text-slate-600 hover:text-slate-900 font-medium"
            >
              Sign In
            </Link>
            <Link
              href="/marketing/demo"
              className="px-4 py-2 bg-slate-100 text-slate-800 font-medium rounded-lg hover:bg-slate-200 transition-colors"
            >
              Get Demo
            </Link>
            <Link
              href="/signup"
              className="px-4 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors"
            >
              Start Free Trial
            </Link>
          </div>

          {/* Mobile menu button */}
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="md:hidden p-2 rounded-md text-slate-600 hover:text-slate-900 hover:bg-slate-100"
          >
            <svg
              className="h-6 w-6"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              {isMenuOpen ? (
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              ) : (
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 6h16M4 12h16M4 18h16"
                />
              )}
            </svg>
          </button>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="md:hidden py-4 border-t border-slate-200">
            <div className="flex flex-col space-y-4">
              <Link
                href="/marketing/features"
                className="text-slate-600 hover:text-slate-900 font-medium"
              >
                Features
              </Link>
              <Link
                href="/marketing/pricing"
                className="text-slate-600 hover:text-slate-900 font-medium"
              >
                Pricing
              </Link>
              <Link
                href="/marketing/about"
                className="text-slate-600 hover:text-slate-900 font-medium"
              >
                About
              </Link>
              <Link
                href="/marketing/contact"
                className="text-slate-600 hover:text-slate-900 font-medium"
              >
                Contact
              </Link>
              <hr className="border-slate-200" />
              <Link
                href="/login"
                className="text-slate-600 hover:text-slate-900 font-medium"
              >
                Sign In
              </Link>
              <Link
                href="/marketing/demo"
                className="px-4 py-2 bg-slate-100 text-slate-800 font-medium rounded-lg hover:bg-slate-200 transition-colors text-center"
              >
                Get Demo
              </Link>
              <Link
                href="/signup"
                className="px-4 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors text-center"
              >
                Start Free Trial
              </Link>
            </div>
          </div>
        )}
      </div>
    </header>
  );
}
