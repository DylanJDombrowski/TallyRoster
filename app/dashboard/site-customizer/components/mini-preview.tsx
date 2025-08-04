// app/dashboard/site-customizer/components/mini-preview.tsx - UPDATED WITH NAV PREVIEW
"use client";

import { Database } from "@/lib/database.types";
import Image from "next/image";

type Organization = Database["public"]["Tables"]["organizations"]["Row"];

interface NavigationConfig {
  showAlumni: boolean;
  showBlog: boolean;
  showFormsLinks: boolean;
  showSponsors: boolean;
  showSocial: boolean;
  alumniNavLabel: string;
  blogNavLabel: string;
  formsLinksNavLabel: string;
  sponsorsNavLabel: string;
  socialNavLabel: string;
}

interface MiniPreviewProps {
  name: string;
  slogan: string | null;
  logoUrl: string | null;
  primaryColor: string;
  secondaryColor: string;
  theme: string;
  organization: Organization;
  navigationConfig?: NavigationConfig;
}

export function MiniPreview({
  name,
  slogan,
  logoUrl,
  primaryColor,
  secondaryColor,
  theme,
  organization,
  navigationConfig,
}: MiniPreviewProps) {
  const isDarkMode = theme === "dark";

  // Generate navigation items based on config
  const getNavigationItems = () => {
    const navItems = ["Home", "Teams"];

    if (navigationConfig) {
      if (navigationConfig.showBlog)
        navItems.push(navigationConfig.blogNavLabel);
      if (navigationConfig.showAlumni)
        navItems.push(navigationConfig.alumniNavLabel);
      if (navigationConfig.showFormsLinks)
        navItems.push(navigationConfig.formsLinksNavLabel);
      if (navigationConfig.showSponsors)
        navItems.push(navigationConfig.sponsorsNavLabel);
      if (navigationConfig.showSocial)
        navItems.push(navigationConfig.socialNavLabel);
    } else {
      // Default navigation for existing organizations
      navItems.push("News", "Alumni", "Forms & Links");
    }

    return navItems;
  };

  const navigationItems = getNavigationItems();

  return (
    <div
      className={`space-y-6 p-6 rounded-lg border ${
        isDarkMode ? "dark bg-gray-900 text-gray-200" : "bg-white"
      }`}
    >
      <h3
        className={`text-lg font-semibold ${
          isDarkMode ? "text-white" : "text-slate-700"
        }`}
      >
        Live Preview
      </h3>

      {/* Header Preview */}
      <div className="border rounded-lg overflow-hidden">
        <div
          className="py-2 px-4 text-white text-center text-sm"
          style={{ backgroundColor: secondaryColor }}
        >
          Welcome to {name}
        </div>

        <div className={`p-4 ${isDarkMode ? "bg-gray-800" : "bg-white"}`}>
          <div className="flex items-center justify-center">
            {logoUrl ? (
              <div className="w-12 h-12 mr-3 relative">
                <Image
                  src={logoUrl}
                  alt={`${name} Logo`}
                  fill
                  className="object-contain"
                  sizes="48px"
                />
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
              <h1
                className="text-2xl font-bold uppercase"
                style={{ color: primaryColor }}
              >
                {name}
              </h1>
              <p
                className="text-sm uppercase"
                style={{ color: secondaryColor }}
              >
                {slogan || "Excellence in Sports"}
              </p>
            </div>
          </div>
        </div>

        {/* Navigation Preview */}
        <div
          className="px-4 py-2 text-white text-sm"
          style={{ backgroundColor: primaryColor }}
        >
          <div className="flex justify-center space-x-3 flex-wrap">
            {navigationItems.map((item, index) => (
              <span key={index} className="whitespace-nowrap">
                {item}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Navigation Summary */}
      {navigationConfig && (
        <div className="rounded-lg p-4 border bg-slate-50">
          <h4 className="font-semibold text-slate-700 mb-2">
            Navigation Summary
          </h4>
          <div className="space-y-1 text-sm">
            <p>
              <span className="font-medium">Visible Pages:</span>{" "}
              {navigationItems.length}
            </p>
            <div className="text-xs text-slate-600">
              {navigationItems.join(" • ")}
            </div>
          </div>
        </div>
      )}

      {/* Sample Content Preview */}
      <div
        className={`rounded-lg p-4 ${
          isDarkMode ? "bg-gray-800" : "bg-slate-50"
        }`}
      >
        <h4
          className={`font-semibold mb-2 ${
            isDarkMode ? "text-white" : "text-slate-700"
          }`}
        >
          Sample Content
        </h4>
        <div className="space-y-2 text-sm">
          <div className="flex items-center space-x-2">
            <div
              className="w-4 h-4 rounded"
              style={{ backgroundColor: primaryColor }}
            ></div>
            <span>Primary color elements</span>
          </div>
          <div className="flex items-center space-x-2">
            <div
              className="w-4 h-4 rounded"
              style={{ backgroundColor: secondaryColor }}
            ></div>
            <span>Secondary color elements</span>
          </div>
        </div>
      </div>

      {/* Footer Preview */}
      <div
        className="rounded-lg p-4 text-white text-center"
        style={{ backgroundColor: secondaryColor }}
      >
        <h4 className="font-bold">{name}</h4>
        <p className="text-sm opacity-90">{slogan || "Excellence in Sports"}</p>
        <p className="text-xs mt-2 opacity-75">
          © {new Date().getFullYear()} {name}. All Rights Reserved.
        </p>
      </div>

      {/* Public Site Link */}
      {organization.subdomain && (
        <div className="pt-4 border-t">
          <p
            className={`text-sm ${
              isDarkMode ? "text-gray-400" : "text-slate-600"
            }`}
          >
            Your live website:
          </p>
          <a
            href={`https://${organization.subdomain}.tallyroster.com`}
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
