import { Oswald, Roboto } from "next/font/google"; // Import next/font
import { ReactNode } from "react";
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
    // Use the font variables in the className
    <html lang="en" className={`${oswald.variable} ${roboto.variable}`}>
      <body className="font-roboto bg-secondary">
        {" "}
        {/* Default body font and bg color */}
        <Header />
        <main>{children}</main>
        <footer className="bg-primary text-white mt-8 py-6">
          <div className="container mx-auto px-6 text-center">
            <p>&copy; {new Date().getFullYear()} Miami Valley Xpress. All Rights Reserved.</p>
          </div>
        </footer>
      </body>
    </html>
  );
}
