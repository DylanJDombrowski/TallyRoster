// lib/utils/theme.ts - Enhanced version
import { getContrastColor } from "./color";

export interface ThemeColors {
  primary: string;
  secondary: string;
}

export interface OrganizationTheme {
  name: string;
  logoUrl?: string | null;
  colors: ThemeColors;
  subdomain?: string | null;
}

/**
 * Validates if a string is a valid hex color
 */
export function isValidHexColor(color: string): boolean {
  return /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/.test(color);
}

/**
 * Ensures a color has the proper hex format
 */
export function normalizeHexColor(color: string): string {
  if (!color) return "#000000";

  // Remove any whitespace
  color = color.trim();

  // Add # if missing
  if (!color.startsWith("#")) {
    color = "#" + color;
  }

  // Convert 3-digit hex to 6-digit
  if (color.length === 4) {
    color =
      "#" + color[1] + color[1] + color[2] + color[2] + color[3] + color[3];
  }

  // Validate and return
  return isValidHexColor(color) ? color.toUpperCase() : "#000000";
}

/**
 * Enhanced CSS generation with WCAG-compliant contrast colors
 */
export function generateThemeCSS(theme: OrganizationTheme): string {
  const primaryColor = normalizeHexColor(theme.colors.primary);
  const secondaryColor = normalizeHexColor(theme.colors.secondary);

  // Use the enhanced contrast calculation
  const primaryForeground = getContrastColor(primaryColor);
  const secondaryForeground = getContrastColor(secondaryColor);

  return `
    :root {
      --color-primary: ${primaryColor};
      --color-secondary: ${secondaryColor};
      --color-primary-foreground: ${primaryForeground};
      --color-secondary-foreground: ${secondaryForeground};
      --organization-name: "${theme.name}";
    }
    
    .bg-primary { 
      background-color: ${primaryColor} !important; 
      color: ${primaryForeground} !important;
    }
    .text-primary { color: ${primaryColor} !important; }
    .border-primary { border-color: ${primaryColor} !important; }
    
    .bg-secondary { 
      background-color: ${secondaryColor} !important; 
      color: ${secondaryForeground} !important;
    }
    .text-secondary { color: ${secondaryColor} !important; }
    .border-secondary { border-color: ${secondaryColor} !important; }

    /* Button styles with proper contrast */
    .btn-primary {
      background-color: ${primaryColor} !important;
      color: ${primaryForeground} !important;
      border-color: ${primaryColor} !important;
    }
    
    .btn-secondary {
      background-color: ${secondaryColor} !important;
      color: ${secondaryForeground} !important;
      border-color: ${secondaryColor} !important;
    }
  `;
}

/**
 * Default theme colors
 */
export const DEFAULT_THEME_COLORS: ThemeColors = {
  primary: "#161659",
  secondary: "#BD1515",
};

/**
 * Enhanced theme presets - tested for good contrast
 */
export const THEME_PRESETS: Array<{
  name: string;
  colors: ThemeColors;
  description?: string;
}> = [
  {
    name: "Classic Blue & Red",
    colors: { primary: "#161659", secondary: "#BD1515" },
    description: "Traditional sports colors with excellent contrast",
  },
  {
    name: "Forest Green",
    colors: { primary: "#166534", secondary: "#22C55E" },
    description: "Natural green tones",
  },
  {
    name: "Royal Purple",
    colors: { primary: "#7C3AED", secondary: "#A855F7" },
    description: "Regal purple theme",
  },
  {
    name: "Ocean Blue",
    colors: { primary: "#0EA5E9", secondary: "#38BDF8" },
    description: "Cool ocean blues",
  },
  {
    name: "Sunset Orange",
    colors: { primary: "#EA580C", secondary: "#F97316" },
    description: "Warm sunset colors",
  },
  {
    name: "Crimson Red",
    colors: { primary: "#DC2626", secondary: "#EF4444" },
    description: "Bold red theme",
  },
  {
    name: "Professional Navy",
    colors: { primary: "#1E3A8A", secondary: "#3B82F6" },
    description: "Professional navy blue",
  },
  {
    name: "Emerald Green",
    colors: { primary: "#059669", secondary: "#10B981" },
    description: "Fresh emerald green",
  },
];
