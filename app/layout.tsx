// app/layout.tsx
import { ToastProvider } from "@/app/components/toast-provider";
import type { Metadata } from "next";
import "./globals.css";
import { Inter, Oswald } from "next/font/google";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });
const oswald = Oswald({
  subsets: ["latin"],
  variable: "--font-oswald",
});

export const metadata: Metadata = {
  title: {
    template: "%s | Sideline",
    default: "Sideline - Your Team, Your Site",
  },
  description: "The all-in-one platform for youth sports organizations.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={`${inter.variable} ${oswald.variable} font-sans`}>
        <ToastProvider>{children}</ToastProvider>
      </body>
    </html>
  );
}
