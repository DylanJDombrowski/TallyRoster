// app/(public)/layout.tsx
import { Footer } from "../components/Footer";
import { Header } from "../components/Header"; // <-- CHANGED

export default function PublicLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Header /> {/* <-- CHANGED from <Navigation /> */}
      <main className="min-h-screen">{children}</main>
      <Footer />
    </>
  );
}
