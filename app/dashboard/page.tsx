// app/dashboard/page.tsx
import Link from "next/link";

export default function DashboardHomePage() {
  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-6 text-slate-900">Dashboard</h1>
      <p className="mb-8 text-slate-800">Welcome to the Miami Valley Xpress management platform.</p>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Link href="/dashboard/players" className="block p-6 bg-white border rounded-lg shadow hover:bg-gray-50">
          <h2 className="text-lg font-semibold text-slate-900 mb-2">Manage Players</h2>
          <p className="text-sm text-slate-800">Add, edit, and view player rosters for all teams.</p>
        </Link>

        {/* NEW LINK TO MANAGE TEAMS */}
        <Link href="/dashboard/admin/teams" className="block p-6 bg-white border rounded-lg shadow hover:bg-gray-50">
          <h2 className="text-lg font-semibold text-slate-900 mb-2">Manage Teams</h2>
          <p className="text-sm text-slate-800">Create and edit teams for the organization.</p>
        </Link>

        <Link href="/dashboard/admin/users" className="block p-6 bg-white border rounded-lg shadow hover:bg-gray-50">
          <h2 className="text-lg font-semibold text-slate-900 mb-2">Manage Users</h2>
          <p className="text-sm text-slate-800">Invite new coaches and admins to the platform.</p>
        </Link>

        {/* Add more links here as you build more features */}
      </div>
    </div>
  );
}
