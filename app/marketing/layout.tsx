// app/(marketing)/layout.tsx
import { Header } from "@/app/components/Header";
import { Footer } from "@/app/components/Footer";

// This layout will wrap all pages inside the (marketing) group
export default function MarketingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col min-h-screen bg-slate-50">
      {/* We can reuse the same Header and Footer components */}
      <Header />
      <main className="flex-grow">{children}</main>
      <Footer />
    </div>
  );
}
