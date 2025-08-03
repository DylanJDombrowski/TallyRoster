// app/dashboard/blog/page.tsx (Refactored Server Component)
import Link from "next/link";
import { Plus, Edit, Eye, Calendar, User } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import DeleteBlogPostButton from "./components/DeleteBlogPostButton";
import { createClient } from "@/lib/supabase/server";
import { cookies } from "next/headers";
import { getSessionData } from "@/lib/actions/session";
import { redirect } from "next/navigation";

// REFACTORED: Server action that accepts organizationId and userId as parameters
async function getBlogPosts(organizationId: string) {
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);

  try {
    const { data: posts, error } = await supabase
      .from("blog_posts")
      .select(
        `
        id,
        title,
        slug,
        short_description,
        content,
        image_url,
        published_date,
        status,
        created_at,
        author_id,
        organization_id
      `
      )
      .eq("organization_id", organizationId)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching blog posts:", error);
      return { success: false, error: error.message, data: null };
    }

    // Transform data to include author information if needed
    const postsWithAuthors =
      posts?.map((post) => ({
        ...post,
        author: {
          first_name: "Unknown", // In real implementation, you'd join with user_profiles
          last_name: "",
        },
      })) || [];

    return { success: true, error: null, data: postsWithAuthors };
  } catch (error) {
    console.error("Unexpected error in getBlogPosts:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
      data: null,
    };
  }
}

export default async function BlogPage() {
  // REFACTORED: Use centralized session data instead of individual auth calls
  const sessionData = await getSessionData();

  if (!sessionData.user) {
    redirect("/login");
  }

  if (!sessionData.currentOrg) {
    return (
      <div className="p-6">
        <div className="bg-red-50 border border-red-200 rounded-md p-4">
          <p className="text-red-800">
            Error: No organization found. Please ensure you are part of an
            organization.
          </p>
        </div>
      </div>
    );
  }

  // REFACTORED: Pass session data to server action instead of refetching
  const result = await getBlogPosts(sessionData.currentOrg.id);

  if (!result.success) {
    return (
      <div className="p-6">
        <div className="bg-red-50 border border-red-200 rounded-md p-4">
          <p className="text-red-800">
            Error loading blog posts: {result.error}
          </p>
        </div>
      </div>
    );
  }

  const posts = result.data || [];

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Blog Posts</h1>
          <p className="text-gray-600">
            Manage {sessionData.currentOrg.name}&apos;s blog content
          </p>
        </div>
        <Link
          href="/dashboard/blog/new"
          className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
        >
          <Plus className="w-4 h-4 mr-2" />
          New Post
        </Link>
      </div>

      {posts.length === 0 ? (
        <div className="text-center py-12">
          <div className="bg-gray-50 rounded-lg p-8">
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              No blog posts yet
            </h3>
            <p className="text-gray-600 mb-4">
              Get started by creating your first blog post
            </p>
            <Link
              href="/dashboard/blog/new"
              className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
            >
              <Plus className="w-4 h-4 mr-2" />
              Create First Post
            </Link>
          </div>
        </div>
      ) : (
        <div className="bg-white shadow rounded-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Title
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Author
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Published Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Last Modified
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {posts.map((post) => (
                  <tr key={post.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div>
                        <div className="text-sm font-medium text-gray-900">
                          {post.title}
                        </div>
                        {post.short_description && (
                          <div className="text-sm text-gray-500 truncate max-w-xs">
                            {post.short_description}
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                          post.status === "published"
                            ? "bg-green-100 text-green-800"
                            : "bg-yellow-100 text-yellow-800"
                        }`}
                      >
                        {post.status}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center">
                        <User className="w-4 h-4 text-gray-400 mr-2" />
                        <span className="text-sm text-gray-900">
                          {post.author
                            ? `${post.author.first_name || ""} ${
                                post.author.last_name || ""
                              }`.trim() || "Unknown"
                            : "Unknown"}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center">
                        <Calendar className="w-4 h-4 text-gray-400 mr-2" />
                        <span className="text-sm text-gray-900">
                          {new Date(post.published_date).toLocaleDateString()}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-sm text-gray-500">
                        {formatDistanceToNow(new Date(post.created_at), {
                          addSuffix: true,
                        })}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end space-x-2">
                        <Link
                          href={`/dashboard/blog/${post.id}/preview`}
                          className="text-gray-400 hover:text-gray-600"
                          title="Preview"
                        >
                          <Eye className="w-4 h-4" />
                        </Link>
                        <Link
                          href={`/dashboard/blog/${post.id}/edit`}
                          className="text-blue-600 hover:text-blue-900"
                          title="Edit"
                        >
                          <Edit className="w-4 h-4" />
                        </Link>
                        <DeleteBlogPostButton
                          postId={post.id}
                          postTitle={post.title}
                        />
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
