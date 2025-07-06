// app/marketing/layout.tsx
import { MarketingHeader } from "./components/MarketingHeader";

export default function MarketingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col min-h-screen bg-slate-50">
      <MarketingHeader />
      <main className="flex-grow">{children}</main>

      {/* Simple marketing footer */}
      <footer className="bg-slate-800 text-white py-12">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="md:col-span-2">
              <h3 className="text-xl font-bold mb-4">Sideline</h3>
              <p className="text-slate-300 mb-4">
                The all-in-one platform for youth sports organizations. Create
                professional websites, manage teams, and engage with your
                community.
              </p>
            </div>

            <div>
              <h4 className="font-semibold mb-4">Product</h4>
              <ul className="space-y-2 text-slate-300">
                <li>
                  <a href="/features" className="hover:text-white">
                    Features
                  </a>
                </li>
                <li>
                  <a href="/pricing" className="hover:text-white">
                    Pricing
                  </a>
                </li>
                <li>
                  <a href="/examples" className="hover:text-white">
                    Examples
                  </a>
                </li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold mb-4">Support</h4>
              <ul className="space-y-2 text-slate-300">
                <li>
                  <a href="/help" className="hover:text-white">
                    Help Center
                  </a>
                </li>
                <li>
                  <a href="/contact" className="hover:text-white">
                    Contact
                  </a>
                </li>
                <li>
                  <a href="/login" className="hover:text-white">
                    Sign In
                  </a>
                </li>
              </ul>
            </div>
          </div>

          <div className="border-t border-slate-700 mt-8 pt-8 text-center text-slate-300">
            <p>© 2024 Sideline. All Rights Reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
