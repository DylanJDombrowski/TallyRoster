// app/marketing/components/MarketingHeader.tsx
import Link from "next/link";
import Image from "next/image";

export function MarketingHeader() {
  return (
    <header className="bg-white shadow-sm">
      {/* Top ribbon */}
      <div className="py-1 px-4 bg-blue-600 text-white">
        <div className="container mx-auto flex justify-between items-center text-sm">
          <div>hello@trysideline.com</div>
          <div className="flex space-x-4">
            <a
              href="https://twitter.com/trysideline"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Twitter"
              className="hover:opacity-75"
            >
              Twitter
            </a>
          </div>
        </div>
      </div>

      {/* Logo and title */}
      <div className="container mx-auto py-6 px-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <Image
              src="/sideline-logo.png" // Your Sideline logo
              alt="Sideline Logo"
              width={40}
              height={40}
              className="mr-3"
            />
            <div>
              <h1 className="text-2xl font-bold text-slate-900">Sideline</h1>
              <p className="text-sm text-slate-600">Your Team, Your Site</p>
            </div>
          </div>

          {/* Marketing Navigation */}
          <nav className="hidden md:flex items-center space-x-8">
            <Link href="/" className="text-slate-600 hover:text-slate-900">
              Home
            </Link>
            <Link
              href="/features"
              className="text-slate-600 hover:text-slate-900"
            >
              Features
            </Link>
            <Link
              href="/pricing"
              className="text-slate-600 hover:text-slate-900"
            >
              Pricing
            </Link>
            <Link href="/login" className="text-slate-600 hover:text-slate-900">
              Sign In
            </Link>
            <Link
              href="/signup"
              className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
            >
              Get Started
            </Link>
          </nav>
        </div>
      </div>
    </header>
  );
}
