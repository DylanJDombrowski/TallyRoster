// lib/utils/color.ts - Enhanced version that builds on your existing theme.ts
import { ThemeColors } from "./theme";

/**
 * Converts hex color to RGB values
 */
function hexToRgb(hex: string): { r: number; g: number; b: number } | null {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result
    ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16),
      }
    : null;
}

/**
 * Calculates relative luminance using WCAG formula
 * This is more accurate than the simple luminance calculation in theme.ts
 */
function getWCAGLuminance(r: number, g: number, b: number): number {
  const [rs, gs, bs] = [r, g, b].map((c) => {
    c = c / 255;
    return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
  });
  return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs;
}

/**
 * Calculates contrast ratio between two colors
 */
function getContrastRatio(color1: string, color2: string): number {
  const rgb1 = hexToRgb(color1);
  const rgb2 = hexToRgb(color2);

  if (!rgb1 || !rgb2) return 1;

  const lum1 = getWCAGLuminance(rgb1.r, rgb1.g, rgb1.b);
  const lum2 = getWCAGLuminance(rgb2.r, rgb2.g, rgb2.b);

  const brightest = Math.max(lum1, lum2);
  const darkest = Math.min(lum1, lum2);

  return (brightest + 0.05) / (darkest + 0.05);
}

/**
 * Enhanced version of getContrastColor using WCAG standards
 * Backward compatible with your existing theme.ts usage
 */
export function getContrastColor(backgroundColor: string): string {
  const whiteContrast = getContrastRatio(backgroundColor, "#FFFFFF");
  const blackContrast = getContrastRatio(backgroundColor, "#000000");

  return whiteContrast > blackContrast ? "#FFFFFF" : "#000000";
}

/**
 * Enhanced contrast analysis with detailed information
 */
export function getContrastAnalysis(backgroundColor: string): {
  bestColor: string;
  whiteContrast: number;
  blackContrast: number;
  meetsAA: boolean;
  meetsAAA: boolean;
  recommendation: string;
} {
  const whiteContrast = getContrastRatio(backgroundColor, "#FFFFFF");
  const blackContrast = getContrastRatio(backgroundColor, "#000000");
  const bestColor = whiteContrast > blackContrast ? "#FFFFFF" : "#000000";
  const bestContrast = Math.max(whiteContrast, blackContrast);

  return {
    bestColor,
    whiteContrast: Math.round(whiteContrast * 100) / 100,
    blackContrast: Math.round(blackContrast * 100) / 100,
    meetsAA: bestContrast >= 4.5,
    meetsAAA: bestContrast >= 7,
    recommendation:
      bestContrast >= 7
        ? "Excellent contrast"
        : bestContrast >= 4.5
        ? "Good contrast (WCAG AA compliant)"
        : "Poor contrast - consider adjusting color",
  };
}

/**
 * Validates theme colors and provides recommendations
 */
export function validateThemeColors(colors: ThemeColors): {
  primary: ReturnType<typeof getContrastAnalysis>;
  secondary: ReturnType<typeof getContrastAnalysis>;
  isValid: boolean;
} {
  const primaryAnalysis = getContrastAnalysis(colors.primary);
  const secondaryAnalysis = getContrastAnalysis(colors.secondary);

  return {
    primary: primaryAnalysis,
    secondary: secondaryAnalysis,
    isValid: primaryAnalysis.meetsAA && secondaryAnalysis.meetsAA,
  };
}

// Re-export utilities from theme.ts for backward compatibility
export {
  isValidHexColor,
  normalizeHexColor,
  DEFAULT_THEME_COLORS,
  THEME_PRESETS,
} from "./theme";

export type { ThemeColors, OrganizationTheme } from "./theme";
