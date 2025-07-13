// app/dashboard/site-customizer/components/mini-preview.tsx
"use client";

import { Database } from "@/lib/database.types";
import Image from "next/image";

type Organization = Database["public"]["Tables"]["organizations"]["Row"];

interface MiniPreviewProps {
  name: string;
  slogan: string | null;
  logoUrl: string | null;
  primaryColor: string;
  secondaryColor: string;
  theme: string;
  organization: Organization;
}

export function MiniPreview({ name, slogan, logoUrl, primaryColor, secondaryColor, theme, organization }: MiniPreviewProps) {
  const isDarkMode = theme === "dark";

  return (
    // Conditionally apply dark mode class for preview
    <div className={`space-y-6 p-6 rounded-lg border ${isDarkMode ? "dark bg-gray-900 text-gray-200" : "bg-white"}`}>
      <h3 className={`text-lg font-semibold ${isDarkMode ? "text-white" : "text-slate-700"}`}>Live Preview</h3>

      {/* Header Preview */}
      <div className="border rounded-lg overflow-hidden">
        <div className="py-2 px-4 text-white text-center text-sm" style={{ backgroundColor: secondaryColor }}>
          Welcome to {name}
        </div>

        <div className={`p-4 ${isDarkMode ? "bg-gray-800" : "bg-white"}`}>
          <div className="flex items-center justify-center">
            {logoUrl ? (
              <div className="w-12 h-12 mr-3 relative">
                <Image src={logoUrl} alt={`${name} Logo`} fill className="object-contain" sizes="48px" />
              </div>
            ) : (
              <div
                className="w-12 h-12 mr-3 rounded-full flex items-center justify-center text-white font-bold text-lg"
                style={{ backgroundColor: primaryColor }}
              >
                {name?.charAt(0) || "O"}
              </div>
            )}
            <div className="text-center">
              <h1 className="text-2xl font-bold uppercase" style={{ color: primaryColor }}>
                {name}
              </h1>
              {/* Use the slogan from props with a fallback */}
              <p className="text-sm uppercase" style={{ color: secondaryColor }}>
                {slogan || "Excellence in Sports"}
              </p>
            </div>
          </div>
        </div>

        <div className="px-4 py-2 text-white text-sm" style={{ backgroundColor: primaryColor }}>
          <div className="flex justify-center space-x-6">
            <span>Home</span>
            <span>Teams</span>
            <span>News</span>
          </div>
        </div>
      </div>

      {/* ... other preview sections ... */}

      {/* Footer Preview */}
      <div className="rounded-lg p-4 text-white text-center" style={{ backgroundColor: secondaryColor }}>
        <h4 className="font-bold">{name}</h4>
        <p className="text-sm opacity-90">{slogan || "Excellence in Sports"}</p>
        <p className="text-xs mt-2 opacity-75">
          © {new Date().getFullYear()} {name}. All Rights Reserved.
        </p>
      </div>

      {/* Public Site Link */}
      {organization.subdomain && (
        <div className="pt-4 border-t">
          <p className={`text-sm ${isDarkMode ? "text-gray-400" : "text-slate-600"}`}>Your live website:</p>
          <a
            href={`/sites/${organization.subdomain}`} // Use a relative path for local preview
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-500 hover:underline font-medium text-sm"
          >
            {organization.subdomain}.tallyroster.com →
          </a>
        </div>
      )}
    </div>
  );
}
