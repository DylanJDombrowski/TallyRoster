// app/(public)/layout.tsx
import { Header } from "@/app/components/Header";
import { Footer } from "@/app/components/Footer";
import { ThemeListener } from "@/app/components/ThemeListener";

// Note: We no longer need to fetch the session here, as the Header will do it.
export default function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col min-h-screen">
      <ThemeListener />
      <Header /> {/* The Header is now self-contained and takes no props */}
      <main className="flex-grow">{children}</main>
      <Footer />
    </div>
  );
}
