// app/(public)/layout.tsx
import { Oswald, Roboto } from "next/font/google";
import { ReactNode } from "react";
import { Footer } from "./components/Footer";
import { Header } from "./components/Header";

// Configure the fonts
const oswald = Oswald({
  subsets: ["latin"],
  variable: "--font-oswald",
});

const roboto = Roboto({
  subsets: ["latin"],
  weight: ["300", "400", "500", "700"],
  variable: "--font-roboto",
});

export default function PublicLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" className={`${oswald.variable} ${roboto.variable}`}>
      <head>
        {/* Add Font Awesome for social icons */}
        <link
          rel="stylesheet"
          href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css"
          integrity="sha512-iecdLmaskl7CVkqkXNQ/ZH/XLlvWZOJyj7Yy7tcenmpD1ypASozpmT/E0iPtmFIB46ZmdtAc9eNBvH0H/ZpiBw=="
          crossOrigin="anonymous"
          referrerPolicy="no-referrer"
        />
      </head>
      <body className="font-roboto flex flex-col min-h-screen" style={{ backgroundColor: "var(--color-secondary, #F2F2F2)" }}>
        <div className="flex-1">
          <Header />
          <main>{children}</main>
        </div>
        <Footer />
      </body>
    </html>
  );
}
