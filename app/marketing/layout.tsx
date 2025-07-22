// app/marketing/layout.tsx

import { MarketingHeader } from "@/app/marketing/components/MarketingHeader";

export default function MarketingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-white">
      <MarketingHeader />
      <main>{children}</main>
      <footer className="bg-slate-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <h3 className="text-lg font-bold mb-4">TallyRoster</h3>
              <p className="text-slate-300 text-sm">
                The all-in-one platform for youth sports organizations.
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Product</h4>
              <ul className="space-y-2 text-sm text-slate-300">
                <li>
                  <a href="/marketing/features" className="hover:text-white">
                    Features
                  </a>
                </li>
                <li>
                  <a href="/marketing/pricing" className="hover:text-white">
                    Pricing
                  </a>
                </li>
                <li>
                  <a href="/marketing/demo" className="hover:text-white">
                    Request Demo
                  </a>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Company</h4>
              <ul className="space-y-2 text-sm text-slate-300">
                <li>
                  <a href="/marketing/about" className="hover:text-white">
                    About
                  </a>
                </li>
                <li>
                  <a href="/marketing/contact" className="hover:text-white">
                    Contact
                  </a>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Support</h4>
              <ul className="space-y-2 text-sm text-slate-300">
                <li>
                  <a
                    href="mailto:hello@tallyroster.com"
                    className="hover:text-white"
                  >
                    Email Support
                  </a>
                </li>
                <li>
                  <a href="/marketing/contact" className="hover:text-white">
                    Help Center
                  </a>
                </li>
              </ul>
            </div>
          </div>
          <div className="border-t border-slate-700 mt-8 pt-8 text-center text-sm text-slate-400">
            <p>&copy; 2024 TallyRoster. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
