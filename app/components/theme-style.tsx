// app/components/theme-style.tsx - Enhanced with Dark Mode
"use client";

interface ThemeStyleProps {
  primaryColor: string;
  secondaryColor: string;
  primaryFgColor: string;
  organizationName?: string;
  theme?: string;
}

export function ThemeStyle({ primaryColor, secondaryColor, primaryFgColor, organizationName, theme = "light" }: ThemeStyleProps) {
  // Generate dark mode variants
  const generateDarkVariant = (color: string): string => {
    // Convert hex to RGB, then darken by 20%
    const hex = color.replace("#", "");
    const r = parseInt(hex.substr(0, 2), 16);
    const g = parseInt(hex.substr(2, 2), 16);
    const b = parseInt(hex.substr(4, 2), 16);

    const darkerR = Math.max(0, Math.floor(r * 0.8));
    const darkerG = Math.max(0, Math.floor(g * 0.8));
    const darkerB = Math.max(0, Math.floor(b * 0.8));

    return `#${darkerR.toString(16).padStart(2, "0")}${darkerG.toString(16).padStart(2, "0")}${darkerB.toString(16).padStart(2, "0")}`;
  };

  const darkPrimary = generateDarkVariant(primaryColor);
  const darkSecondary = generateDarkVariant(secondaryColor);

  return (
    <style jsx global>{`
      :root {
        --color-primary: ${primaryColor};
        --color-secondary: ${secondaryColor};
        --color-primary-foreground: ${primaryFgColor};
        --color-primary-dark: ${darkPrimary};
        --color-secondary-dark: ${darkSecondary};
        ${organizationName ? `--organization-name: "${organizationName}";` : ""}
      }

      /* Light mode styles */
      .bg-primary {
        background-color: ${primaryColor} !important;
      }
      .text-primary {
        color: ${primaryColor} !important;
      }
      .border-primary {
        border-color: ${primaryColor} !important;
      }
      .bg-secondary {
        background-color: ${secondaryColor} !important;
      }
      .text-secondary {
        color: ${secondaryColor} !important;
      }
      .border-secondary {
        border-color: ${secondaryColor} !important;
      }

      /* Dark mode styles */
      .dark .bg-primary {
        background-color: ${darkPrimary} !important;
      }
      .dark .text-primary {
        color: ${primaryColor} !important;
      }
      .dark .border-primary {
        border-color: ${darkPrimary} !important;
      }
      .dark .bg-secondary {
        background-color: ${darkSecondary} !important;
      }
      .dark .text-secondary {
        color: ${secondaryColor} !important;
      }
      .dark .border-secondary {
        border-color: ${darkSecondary} !important;
      }

      /* Enhanced dark mode support for common elements */
      .dark {
        color-scheme: dark;
      }

      .dark body {
        background-color: #111827;
        color: #f9fafb;
      }

      .dark .bg-white {
        background-color: #1f2937 !important;
      }

      .dark .text-gray-900 {
        color: #f9fafb !important;
      }

      .dark .text-slate-900 {
        color: #f1f5f9 !important;
      }

      .dark .bg-slate-50 {
        background-color: #0f172a !important;
      }

      .dark .border-slate-200 {
        border-color: #374151 !important;
      }

      /* Dynamic inline styles for theme-aware elements */
      [style*="background-color: var(--color-primary)"] {
        background-color: ${theme === "dark" ? darkPrimary : primaryColor} !important;
      }

      [style*="background-color: var(--color-secondary)"] {
        background-color: ${theme === "dark" ? darkSecondary : secondaryColor} !important;
      }

      [style*="color: var(--color-primary)"] {
        color: ${theme === "dark" ? primaryColor : primaryColor} !important;
      }

      [style*="color: var(--color-secondary)"] {
        color: ${theme === "dark" ? secondaryColor : secondaryColor} !important;
      }
    `}</style>
  );
}
