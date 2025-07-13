// app/dashboard/site-customizer/components/mini-preview.tsx
"use client";

import { Database } from "@/lib/database.types";
import Image from "next/image";

type Organization = Database["public"]["Tables"]["organizations"]["Row"];

interface MiniPreviewProps {
  name: string;
  logoUrl: string | null;
  primaryColor: string;
  secondaryColor: string;
  organization: Organization;
}

export function MiniPreview({ name, logoUrl, primaryColor, secondaryColor, organization }: MiniPreviewProps) {
  return (
    <div className="space-y-6 p-6 bg-white rounded-lg border">
      <h3 className="text-lg font-semibold text-slate-700 mb-4">Live Preview</h3>

      {/* Header Preview */}
      <div className="border rounded-lg overflow-hidden">
        {/* Top ribbon */}
        <div className="py-2 px-4 text-white text-center text-sm" style={{ backgroundColor: secondaryColor }}>
          Welcome to {name}
        </div>

        {/* Main header */}
        <div className="p-4 bg-white">
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
              <p className="text-sm uppercase" style={{ color: secondaryColor }}>
                Excellence in Sports
              </p>
            </div>
          </div>
        </div>

        {/* Navigation Preview */}
        <div className="px-4 py-2 text-white text-sm" style={{ backgroundColor: primaryColor }}>
          <div className="flex justify-center space-x-6">
            <span>Home</span>
            <span>Teams</span>
            <span>On The Field</span>
            <span>Forms & Resources</span>
          </div>
        </div>
      </div>

      {/* Content Preview */}
      <div className="space-y-4">
        <div className="border rounded-lg p-4">
          <h3 className="text-lg font-semibold mb-2" style={{ color: primaryColor }}>
            Sample Content
          </h3>
          <p className="text-slate-600 mb-3">This is how your content will look with the new branding.</p>
          <button className="px-4 py-2 rounded text-white font-medium" style={{ backgroundColor: primaryColor }}>
            Primary Button
          </button>
        </div>

        {/* Card Preview */}
        <div className="border rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-semibold text-slate-900">Team Card</h4>
              <p className="text-slate-600 text-sm">2024 Season</p>
            </div>
            <div className="px-3 py-1 rounded-full text-white text-sm font-medium" style={{ backgroundColor: secondaryColor }}>
              View Team
            </div>
          </div>
        </div>
      </div>

      {/* Footer Preview */}
      <div className="rounded-lg p-4 text-white text-center" style={{ backgroundColor: secondaryColor }}>
        <h4 className="font-bold">{name}</h4>
        <p className="text-sm opacity-90">Excellence in Sports</p>
        <p className="text-xs mt-2 opacity-75">© 2024 {name}. All Rights Reserved.</p>
      </div>

      {/* Public Site Link */}
      {organization.subdomain && (
        <div className="pt-4 border-t">
          <p className="text-sm text-slate-600 mb-2">Your live website:</p>
          <a
            href={`https://${organization.subdomain}.tallyroster.com`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-600 hover:underline font-medium text-sm"
          >
            {organization.subdomain}.tallyroster.com →
          </a>
        </div>
      )}
    </div>
  );
}
