// lib/utils/theme.ts - Theme Utility Functions
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
    color = "#" + color[1] + color[1] + color[2] + color[2] + color[3] + color[3];
  }

  // Validate and return
  return isValidHexColor(color) ? color.toUpperCase() : "#000000";
}

/**
 * Gets contrast color (black or white) for a given background color
 */
export function getContrastColor(hexColor: string): string {
  const color = hexColor.replace("#", "");
  const r = parseInt(color.substr(0, 2), 16);
  const g = parseInt(color.substr(2, 2), 16);
  const b = parseInt(color.substr(4, 2), 16);

  // Calculate luminance
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;

  return luminance > 0.5 ? "#000000" : "#FFFFFF";
}

/**
 * Generates CSS custom properties string for an organization theme
 */
export function generateThemeCSS(theme: OrganizationTheme): string {
  const primaryColor = normalizeHexColor(theme.colors.primary);
  const secondaryColor = normalizeHexColor(theme.colors.secondary);
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
    
    .bg-primary { background-color: ${primaryColor} !important; }
    .text-primary { color: ${primaryColor} !important; }
    .border-primary { border-color: ${primaryColor} !important; }
    .bg-secondary { background-color: ${secondaryColor} !important; }
    .text-secondary { color: ${secondaryColor} !important; }
    .border-secondary { border-color: ${secondaryColor} !important; }
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
 * Predefined color palettes for organizations
 */
export const THEME_PRESETS: Array<{ name: string; colors: ThemeColors }> = [
  {
    name: "Classic Blue & Red",
    colors: { primary: "#161659", secondary: "#BD1515" },
  },
  {
    name: "Forest Green",
    colors: { primary: "#166534", secondary: "#22C55E" },
  },
  {
    name: "Royal Purple",
    colors: { primary: "#7C3AED", secondary: "#A855F7" },
  },
  {
    name: "Ocean Blue",
    colors: { primary: "#0EA5E9", secondary: "#38BDF8" },
  },
  {
    name: "Sunset Orange",
    colors: { primary: "#EA580C", secondary: "#F97316" },
  },
  {
    name: "Crimson Red",
    colors: { primary: "#DC2626", secondary: "#EF4444" },
  },
  {
    name: "Professional Navy",
    colors: { primary: "#1E3A8A", secondary: "#3B82F6" },
  },
  {
    name: "Emerald Green",
    colors: { primary: "#059669", secondary: "#10B981" },
  },
];
