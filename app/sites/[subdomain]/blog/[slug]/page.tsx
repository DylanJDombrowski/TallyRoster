import { getPublishedBlogPostBySlug } from "@/lib/actions/blog";
import { createClient } from "@/lib/supabase/server";
import { cookies } from "next/headers";
import { notFound } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { ArrowLeft, Calendar, MapPin, Trophy, Users, User } from "lucide-react";
import { format } from "date-fns";
import { Metadata } from "next";

type Props = {
  params: Promise<{ subdomain: string; slug: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { subdomain, slug } = await params;
  const result = await getPublishedBlogPostBySlug(subdomain, slug);

  if (!result.success || !result.data) {
    return {
      title: "Post Not Found",
    };
  }

  const post = result.data;

  return {
    title: post.title,
    description: post.short_description || post.title,
    openGraph: {
      title: post.title,
      description: post.short_description || post.title,
      images: post.image_url ? [post.image_url] : [],
    },
  };
}

export default async function BlogPostPage({
  params,
}: {
  params: Promise<{ subdomain: string; slug: string }>;
}) {
  const { subdomain, slug } = await params;
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

  const result = await getPublishedBlogPostBySlug(subdomain, slug);

  if (!result.success || !result.data) {
    notFound();
  }

  const post = result.data;

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Back link */}
      <div className="mb-8">
        <Link
          href="/blog"
          className="inline-flex items-center text-sm font-medium text-gray-600 hover:text-gray-900"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Blog
        </Link>
      </div>

      <article className="max-w-4xl mx-auto">
        {/* Header */}
        <header className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            {post.title}
          </h1>

          {/* Meta information */}
          <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600 mb-6">
            <div className="flex items-center">
              <Calendar className="w-4 h-4 mr-1" />
              <time dateTime={post.published_date}>
                {format(new Date(post.published_date), "MMMM d, yyyy")}
              </time>
            </div>

            {post.author && (
              <div className="flex items-center">
                <User className="w-4 h-4 mr-1" />
                <span>
                  {post.author.first_name} {post.author.last_name}
                </span>
              </div>
            )}
          </div>

          {/* Tags */}
          {(post.team_name ||
            post.location ||
            post.tournament_name ||
            post.place ||
            post.season) && (
            <div className="flex flex-wrap gap-2 mb-6">
              {post.team_name && (
                <span className="inline-flex items-center px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm">
                  <Users className="w-3 h-3 mr-1" />
                  {post.team_name}
                </span>
              )}
              {post.season && (
                <span className="inline-flex items-center px-3 py-1 bg-purple-100 text-purple-800 rounded-full text-sm">
                  {post.season}
                </span>
              )}
              {post.location && (
                <span className="inline-flex items-center px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm">
                  <MapPin className="w-3 h-3 mr-1" />
                  {post.location}
                </span>
              )}
              {post.tournament_name && (
                <span className="inline-flex items-center px-3 py-1 bg-orange-100 text-orange-800 rounded-full text-sm">
                  {post.tournament_name}
                </span>
              )}
              {post.place && (
                <span className="inline-flex items-center px-3 py-1 bg-yellow-100 text-yellow-800 rounded-full text-sm">
                  <Trophy className="w-3 h-3 mr-1" />
                  {post.place}
                </span>
              )}
            </div>
          )}

          {post.short_description && (
            <p className="text-xl text-gray-600 leading-relaxed mb-8">
              {post.short_description}
            </p>
          )}
        </header>

        {/* Featured Image */}
        {post.image_url && (
          <div className="relative w-full h-96 mb-8 rounded-lg overflow-hidden">
            <Image
              src={post.image_url}
              alt={post.title}
              fill
              className="object-cover"
              priority
            />
          </div>
        )}

        {/* Content */}
        <div
          className="prose prose-lg max-w-none"
          dangerouslySetInnerHTML={{ __html: post.content }}
        />
      </article>

      {/* Related/Back to blog */}
      <div className="max-w-4xl mx-auto mt-16 pt-8 border-t border-gray-200">
        <div className="text-center">
          <Link
            href="/blog"
            className="inline-flex items-center px-6 py-3 text-sm font-medium text-white rounded-md hover:opacity-90 transition-opacity"
            style={{ backgroundColor: organization.primary_color || "#3B82F6" }}
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            View All Blog Posts
          </Link>
        </div>
      </div>
    </div>
  );
}
