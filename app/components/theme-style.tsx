// app/components/theme-style.tsx
"use client";

import { generateThemeCSS, type OrganizationTheme } from "@/lib/utils/theme";

interface ThemeStyleProps {
  primaryColor: string;
  secondaryColor: string;
  primaryFgColor?: string; // Keep for backward compatibility but not used
  organizationName?: string;
}

export function ThemeStyle({
  primaryColor,
  secondaryColor,
  organizationName,
}: ThemeStyleProps) {
  const theme: OrganizationTheme = {
    name: organizationName || "Organization",
    colors: {
      primary: primaryColor,
      secondary: secondaryColor,
    },
  };

  const cssString = generateThemeCSS(theme);

  return (
    <style jsx global>
      {cssString}
    </style>
  );
}
