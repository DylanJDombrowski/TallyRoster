// app/layout.tsx
import { ToastProvider } from "@/app/components/toast-provider";
import { ThemeProvider } from "@/app/components/theme-provider";
import type { Metadata } from "next";
import {
  Inter,
  Oswald,
  Roboto,
  Playfair_Display,
  Montserrat,
  Lora,
  Poppins,
  Raleway,
} from "next/font/google";
import "./globals.css";

// Import default theme to ensure CSS variables are available
import "./styles/themes/default.css";

// Font configurations
const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const oswald = Oswald({
  subsets: ["latin"],
  variable: "--font-oswald",
  display: "swap",
});

const roboto = Roboto({
  weight: ["300", "400", "500", "700"],
  subsets: ["latin"],
  variable: "--font-roboto",
  display: "swap",
});

const playfair = Playfair_Display({
  subsets: ["latin"],
  variable: "--font-playfair",
  display: "swap",
});

const montserrat = Montserrat({
  subsets: ["latin"],
  variable: "--font-montserrat",
  display: "swap",
});

const lora = Lora({
  subsets: ["latin"],
  variable: "--font-lora",
  display: "swap",
});

const poppins = Poppins({
  weight: ["300", "400", "500", "600", "700"],
  subsets: ["latin"],
  variable: "--font-poppins",
  display: "swap",
});

const raleway = Raleway({
  subsets: ["latin"],
  variable: "--font-raleway",
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    template: "%s | TallyRoster",
    default: "TallyRoster - Your Team, Your Site",
  },
  description: "The all-in-one platform for youth sports organizations.",
  manifest: "/manifest.webmanifest",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="theme-default">
      <head>
        <meta name="application-name" content="TallyRoster" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="TallyRoster" />
        <meta name="format-detection" content="telephone=no" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="theme-color" content="#161659" />
        <link rel="apple-touch-icon" href="/icons/icon-192x192.png" />
      </head>
      <body
        className={`
        ${inter.variable} 
        ${oswald.variable} 
        ${roboto.variable}
        ${playfair.variable}
        ${montserrat.variable}
        ${lora.variable}
        ${poppins.variable}
        ${raleway.variable}
        font-sans
        bg-background
        text-foreground
      `}
      >
        <ThemeProvider>
          <ToastProvider>{children}</ToastProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
