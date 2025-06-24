import Link from "next/link";

export default function HomePage() {
  return (
    <main className="flex items-center justify-center min-h-screen bg-slate-100">
      <div className="text-center p-8 bg-white shadow-lg rounded-xl">
        <h1 className="text-4xl font-bold text-slate-800 mb-4">
          Miami Valley Xpress
        </h1>
        <p className="text-slate-600 mb-8">Development Portal</p>

        <div className="flex justify-center gap-4">
          <Link
            href="/dashboard"
            className="px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg shadow-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          >
            Go to Admin Dashboard
          </Link>
          <a
            href="https://www.miamivalleyxpress.com"
            target="_blank"
            rel="noopener noreferrer"
            className="px-6 py-3 bg-white text-slate-700 font-semibold rounded-lg border border-slate-300 shadow-md hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-slate-500 focus:ring-offset-2"
          >
            View Current Site
          </a>
        </div>
      </div>
    </main>
  );
}
