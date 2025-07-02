// app/(marketing)/page.tsx
import Link from "next/link";

export default function LandingPage() {
  return (
    <div className="container mx-auto px-4 py-16 text-center">
      <h1 className="text-5xl font-extrabold text-slate-900">
        The All-in-One Platform for Your Sports Organization
      </h1>
      <p className="mt-4 text-lg text-slate-600 max-w-2xl mx-auto">
        Sideline gives you a professional website, roster management, and
        communication tools, so you can focus on what matters most: your team.
      </p>
      <div className="mt-8 flex justify-center gap-4">
        <Link
          href="/login?signup=true" // We'll later point this to a dedicated signup page
          className="px-8 py-3 bg-blue-600 text-white font-semibold rounded-lg shadow-md hover:bg-blue-700"
        >
          Get Started for Free
        </Link>
        <Link
          href="#features" // A link to a future features section
          className="px-8 py-3 bg-white text-slate-700 font-semibold rounded-lg shadow-md hover:bg-slate-100"
        >
          Learn More
        </Link>
      </div>
    </div>
  );
}
