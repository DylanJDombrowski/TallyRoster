// app/layout.tsx
import { ToastProvider } from "@/app/components/toast-provider";
import type { Metadata } from "next";
import "./globals.css";
import { Inter } from "next/font/google";
import { Oswald } from "next/font/google";

const inter = Inter({ subsets: ["latin"] });
// Add this font configuration
const oswald = Oswald({
  subsets: ["latin"],
  variable: "--font-oswald",
});

export const metadata: Metadata = {
  title: {
    template: "%s | MVX Admin",
    default: "MVX Admin",
  },
  description: "Miami Valley Xpress Management Platform",
};

// The props type has been simplified to remove the Readonly<> wrapper.
export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={`${inter.className} ${oswald.variable}`}>
        <ToastProvider>{children}</ToastProvider>
      </body>
    </html>
  );
}
