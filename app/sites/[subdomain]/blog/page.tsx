import { getPublishedBlogPosts } from "@/lib/actions/blog";
import { createClient } from "@/lib/supabase/server";
import { cookies } from "next/headers";
import { notFound } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { Calendar, MapPin, Trophy, Users } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { Metadata } from "next";

type Props = {
  params: Promise<{ subdomain: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { subdomain } = await params;
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);

  const { data: organization } = await supabase
    .from("organizations")
    .select("name")
    .eq("subdomain", subdomain)
    .single();

  return {
    title: `Blog - ${organization?.name || "Organization"}`,
    description: `Latest updates, achievements, and stories from ${
      organization?.name || "our organization"
    }`,
  };
}

export default async function BlogPage({
  params,
}: {
  params: Promise<{ subdomain: string }>;
}) {
  const { subdomain } = await params;
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);

  // Verify organization exists
  const { data: organization } = await supabase
    .from("organizations")
    .select("id, name, primary_color, secondary_color, logo_url")
    .eq("subdomain", subdomain)
    .single();

  if (!organization) {
    notFound();
  }

  const result = await getPublishedBlogPosts(subdomain);

  if (!result.success) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="bg-red-50 border border-red-200 rounded-md p-4">
          <p className="text-red-800">Error loading blog posts</p>
        </div>
      </div>
    );
  }

  const posts = result.data || [];

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">
          {organization.name} Blog
        </h1>
        <p className="text-xl text-gray-600">
          Latest updates, achievements, and stories from our teams
        </p>
      </div>

      {posts.length === 0 ? (
        <div className="text-center py-12">
          <div className="bg-gray-50 rounded-lg p-8 max-w-md mx-auto">
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              No blog posts yet
            </h3>
            <p className="text-gray-600">
              Check back soon for updates and stories!
            </p>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {posts.map((post) => (
            <article
              key={post.id}
              className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow"
            >
              {post.image_url && (
                <div className="relative h-48 w-full">
                  <Image
                    src={post.image_url}
                    alt={post.title}
                    fill
                    className="object-cover"
                  />
                </div>
              )}

              <div className="p-6">
                <div className="flex items-center text-sm text-gray-500 mb-3">
                  <Calendar className="w-4 h-4 mr-1" />
                  <time dateTime={post.published_date}>
                    {formatDistanceToNow(new Date(post.published_date), {
                      addSuffix: true,
                    })}
                  </time>
                </div>

                <h2 className="text-xl font-bold text-gray-900 mb-3 line-clamp-2">
                  {post.title}
                </h2>

                {post.short_description && (
                  <p className="text-gray-600 mb-4 line-clamp-3">
                    {post.short_description}
                  </p>
                )}

                {/* Meta information */}
                <div className="flex flex-wrap gap-2 mb-4 text-xs">
                  {post.team_name && (
                    <span className="inline-flex items-center px-2 py-1 bg-blue-100 text-blue-800 rounded-full">
                      <Users className="w-3 h-3 mr-1" />
                      {post.team_name}
                    </span>
                  )}
                  {post.location && (
                    <span className="inline-flex items-center px-2 py-1 bg-green-100 text-green-800 rounded-full">
                      <MapPin className="w-3 h-3 mr-1" />
                      {post.location}
                    </span>
                  )}
                  {post.place && (
                    <span className="inline-flex items-center px-2 py-1 bg-yellow-100 text-yellow-800 rounded-full">
                      <Trophy className="w-3 h-3 mr-1" />
                      {post.place}
                    </span>
                  )}
                </div>

                <Link
                  href={`/blog/${post.slug}`}
                  className="inline-flex items-center text-sm font-medium hover:underline"
                  style={{ color: organization.primary_color || "#3B82F6" }}
                >
                  Read more →
                </Link>
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}
