// app/sites/[subdomain]/on-the-field/[slug]/page.tsx
import { createClient } from "@/lib/supabase/server";
import { AnalyticsTracker } from "@/components/analytics-tracker";
import { cookies } from "next/headers";
import { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";

interface BlogPostPageProps {
  params: Promise<{
    subdomain: string;
    slug: string;
  }>;
}

// Generate metadata for SEO
export async function generateMetadata({ params }: BlogPostPageProps): Promise<Metadata> {
  const { subdomain, slug } = await params;
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);

  // Get organization first
  const { data: organization } = await supabase
    .from("organizations")
    .select("id, name")
    .eq("subdomain", subdomain)
    .single();

  if (!organization) {
    return { title: "Post Not Found" };
  }

  const { data: post } = await supabase
    .from("blog_posts")
    .select("*")
    .eq("slug", slug)
    .eq("status", "published")
    .eq("organization_id", organization.id)
    .single();

  if (!post) {
    return { title: "Post Not Found" };
  }

  return {
    title: `${post.title} | ${organization.name}`,
    description: post.short_description,
    openGraph: {
      title: post.title,
      description: post.short_description || undefined,
      images: post.image_url ? [`/assets/${post.image_url}`] : undefined,
    },
  };
}

export default async function BlogPostPage({ params }: BlogPostPageProps) {
  const { subdomain, slug } = await params;
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);

  // Get organization first
  const { data: organization } = await supabase
    .from("organizations")
    .select("id, name")
    .eq("subdomain", subdomain)
    .single();

  if (!organization) {
    notFound();
  }

  const { data: post, error } = await supabase
    .from("blog_posts")
    .select("*")
    .eq("slug", slug)
    .eq("status", "published")
    .eq("organization_id", organization.id)
    .single();

  if (error || !post) {
    notFound();
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <AnalyticsTracker 
        organizationId={organization.id} 
        eventType="blog_view"
        metadata={{ blogId: post.id, blogTitle: post.title }}
      />
      
      {/* Sticky Header */}
      <div className="sticky top-0 z-40 bg-secondary text-white py-4 shadow-md">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl md:text-3xl font-bold">On The Field</h1>
            <Link href="/on-the-field" className="text-white hover:text-gray-200 transition-colors">
              ← Back to All Posts
            </Link>
          </div>
        </div>
      </div>

      {/* Article Content */}
      <article className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Article Header */}
        <header className="mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">{post.title}</h1>

          {/* Meta Information */}
          <div className="flex flex-wrap gap-4 text-sm text-gray-600 mb-6">
            <span className="flex items-center">
              <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                <path
                  fillRule="evenodd"
                  d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z"
                  clipRule="evenodd"
                />
              </svg>
              {formatDate(post.published_date)}
            </span>

            <span className="flex items-center">
              <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                <path
                  fillRule="evenodd"
                  d="M17.707 9.293a1 1 0 010 1.414l-7 7a1 1 0 01-1.414 0l-7-7A.997.997 0 012 10V5a3 3 0 013-3h5c.256 0 .512.098.707.293l7 7zM5 6a1 1 0 100-2 1 1 0 000 2z"
                  clipRule="evenodd"
                />
              </svg>
              {post.team_name}
            </span>

            <span className="flex items-center">
              <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                <path
                  fillRule="evenodd"
                  d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z"
                  clipRule="evenodd"
                />
              </svg>
              {post.location}
            </span>
          </div>

          {/* Tournament Badge */}
          <div className="flex flex-wrap gap-2 mb-6">
            <span className="inline-block bg-blue-600 text-white px-3 py-1 rounded-full text-sm font-semibold">{post.tournament_name}</span>
            <span className="inline-block bg-purple-600 text-white px-3 py-1 rounded-full text-sm font-semibold">{post.place}</span>
            <span className="inline-block bg-gray-200 text-gray-700 px-3 py-1 rounded-full text-sm">{post.season}</span>
          </div>
        </header>

        {/* Featured Image */}
        <div className="relative w-full h-64 md:h-96 mb-8 rounded-lg overflow-hidden shadow-lg">
          <Image src={`/assets/${post.image_url}`} alt={post.title} fill className="object-cover" priority />
        </div>

        {/* Article Content */}
        <div className="prose prose-lg max-w-none">
          <div className="bg-white rounded-lg shadow-sm p-6 md:p-8">
            <div className="text-gray-700 leading-relaxed whitespace-pre-wrap">{post.content}</div>
          </div>
        </div>

        {/* Article Footer */}
        <footer className="mt-8 pt-8 border-t border-gray-200">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="mb-4 md:mb-0">
              <p className="text-gray-600">Published on {formatDate(post.published_date)}</p>
            </div>

            <div className="flex space-x-4">
              <Link href="/on-the-field" className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors">
                View All Posts
              </Link>
              {post.team_name && (
                <Link
                  href="/teams"
                  className="bg-purple-600 text-white px-6 py-2 rounded-lg hover:bg-purple-700 transition-colors"
                >
                  View Teams
                </Link>
              )}
            </div>
          </div>
        </footer>
      </article>
    </div>
  );
}
