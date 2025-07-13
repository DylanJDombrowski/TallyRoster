// app/dashboard/page.tsx
import { createClient } from "@/lib/supabase/server";
import { cookies } from "next/headers";
import Link from "next/link";
import { redirect } from "next/navigation";

export default async function DashboardHomePage() {
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  // Get user's organization info
  const { data: userOrgRole } = await supabase
    .from("user_organization_roles")
    .select(
      `
      role,
      organizations (
        id, name, sport, organization_type, subdomain,
        primary_color, secondary_color, logo_url
      )
    `
    )
    .eq("user_id", user.id)
    .limit(1)
    .single();

  if (!userOrgRole?.organizations) {
    redirect("/onboarding");
  }

  const organization = Array.isArray(userOrgRole.organizations) ? userOrgRole.organizations[0] : userOrgRole.organizations;

  // Get some quick stats
  const { data: teams } = await supabase.from("teams").select("id, name").eq("organization_id", organization.id);

  const { data: players } = await supabase.from("players").select("id").eq("organization_id", organization.id).eq("status", "active");

  const { data: recentPosts } = await supabase
    .from("blog_posts")
    .select("id, title, published_date, slug")
    .eq("organization_id", organization.id)
    .eq("status", "published")
    .order("published_date", { ascending: false })
    .limit(3);

  return (
    <div className="p-4 md:p-8">
      {/* Organization Header */}
      <div className="mb-8">
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-3xl font-bold text-slate-900 mb-2">Welcome to {organization.name}</h1>
            <div className="flex items-center gap-4 text-sm text-slate-600">
              {organization.sport && <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full">{organization.sport}</span>}
              {organization.organization_type && (
                <span className="px-3 py-1 bg-slate-100 text-slate-800 rounded-full">{organization.organization_type}</span>
              )}
              <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full capitalize">Your Role: {userOrgRole.role}</span>
            </div>
          </div>

          {organization.subdomain && (
            <div className="text-right">
              <p className="text-sm text-slate-600">Your Public Site:</p>
              <a
                href={`https://${organization.subdomain}.tallyroster.com`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 hover:underline font-medium"
              >
                {organization.subdomain}.tallyroster.com
              </a>
            </div>
          )}
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white p-6 rounded-lg shadow border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-600">Teams</p>
              <p className="text-2xl font-bold text-slate-900">{teams?.length || 0}</p>
            </div>
            <div className="p-3 bg-blue-100 rounded-full">
              <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                />
              </svg>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-600">Active Players</p>
              <p className="text-2xl font-bold text-slate-900">{players?.length || 0}</p>
            </div>
            <div className="p-3 bg-green-100 rounded-full">
              <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                />
              </svg>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-600">Recent Posts</p>
              <p className="text-2xl font-bold text-slate-900">{recentPosts?.length || 0}</p>
            </div>
            <div className="p-3 bg-purple-100 rounded-full">
              <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z"
                />
              </svg>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions & Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Quick Actions */}
        <div className="bg-white rounded-lg shadow border">
          <div className="p-6 border-b">
            <h2 className="text-lg font-semibold text-slate-900">Quick Actions</h2>
          </div>
          <div className="p-6 space-y-4">
            {userOrgRole.role === "admin" && (
              <>
                <Link href="/dashboard/admin/teams" className="flex items-center p-3 rounded-lg hover:bg-slate-50 transition-colors border">
                  <div className="p-2 bg-blue-100 rounded-lg mr-3">
                    <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                    </svg>
                  </div>
                  <div>
                    <p className="font-medium text-slate-900">Create New Team</p>
                    <p className="text-sm text-slate-600">Add teams to your organization</p>
                  </div>
                </Link>

                <Link href="/dashboard/admin/users" className="flex items-center p-3 rounded-lg hover:bg-slate-50 transition-colors border">
                  <div className="p-2 bg-green-100 rounded-lg mr-3">
                    <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z"
                      />
                    </svg>
                  </div>
                  <div>
                    <p className="font-medium text-slate-900">Invite Users</p>
                    <p className="text-sm text-slate-600">Add coaches and staff</p>
                  </div>
                </Link>
              </>
            )}

            <Link href="/dashboard/players" className="flex items-center p-3 rounded-lg hover:bg-slate-50 transition-colors border">
              <div className="p-2 bg-purple-100 rounded-lg mr-3">
                <svg className="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
              </div>
              <div>
                <p className="font-medium text-slate-900">Add Players</p>
                <p className="text-sm text-slate-600">Manage your roster</p>
              </div>
            </Link>

            {userOrgRole.role === "admin" && (
              <Link
                href="/dashboard/site-customizer"
                className="flex items-center p-3 rounded-lg hover:bg-slate-50 transition-colors border"
              >
                <div className="p-2 bg-orange-100 rounded-lg mr-3">
                  <svg className="w-5 h-5 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zM21 5a2 2 0 00-2-2h-4a2 2 0 00-2 2v12a4 4 0 004 4h4a2 2 0 002-2V5z"
                    />
                  </svg>
                </div>
                <div>
                  <p className="font-medium text-slate-900">Customize Website</p>
                  <p className="text-sm text-slate-600">Update branding and content</p>
                </div>
              </Link>
            )}
          </div>
        </div>

        {/* Recent Activity */}
        <div className="bg-white rounded-lg shadow border">
          <div className="p-6 border-b">
            <h2 className="text-lg font-semibold text-slate-900">Recent Activity</h2>
          </div>
          <div className="p-6">
            {recentPosts && recentPosts.length > 0 ? (
              <div className="space-y-4">
                {recentPosts.map((post) => (
                  <div key={post.id} className="flex items-start space-x-3">
                    <div className="p-2 bg-blue-100 rounded-lg">
                      <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z"
                        />
                      </svg>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-slate-900 truncate">{post.title}</p>
                      <p className="text-sm text-slate-600">Published {new Date(post.published_date).toLocaleDateString()}</p>
                    </div>
                  </div>
                ))}
                <Link href="/dashboard/blog" className="text-sm text-blue-600 hover:underline">
                  View all posts →
                </Link>
              </div>
            ) : (
              <div className="text-center py-6 text-slate-500">
                <svg className="w-12 h-12 mx-auto mb-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z"
                  />
                </svg>
                <p className="text-sm">No recent activity</p>
                <p className="text-xs">Start by adding teams and players</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
