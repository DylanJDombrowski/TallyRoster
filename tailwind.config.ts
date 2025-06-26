// tailwind.config.ts
import type { Config } from "tailwindcss";

export default {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "var(--background)",
        foreground: "var(--foreground)",
        // Add your custom colors here
        primary: "#1a365d", // Replace with your actual primary color
        secondary: "#161659",
        ribbon: "#2d3748", // Replace with your actual ribbon color
        accent: "#D29C9C",
      },
      fontFamily: {
        oswald: ["Oswald", "sans-serif"], // Add Oswald font
      },
    },
  },
  plugins: [],
} satisfies Config;
