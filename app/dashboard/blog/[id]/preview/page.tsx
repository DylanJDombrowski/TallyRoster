import { getBlogPost } from "@/lib/actions/blog";
import { notFound } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import {
  ArrowLeft,
  Calendar,
  MapPin,
  Trophy,
  Users,
  User,
  Eye,
  Edit,
} from "lucide-react";
import { format } from "date-fns";

export default async function PreviewBlogPostPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const result = await getBlogPost(id);

  if (!result.success || !result.data) {
    notFound();
  }

  const post = result.data;

  return (
    <div className="p-6">
      {/* Header with actions */}
      <div className="flex items-center justify-between mb-6">
        <Link
          href="/dashboard/blog"
          className="inline-flex items-center text-sm text-gray-600 hover:text-gray-900"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Blog Posts
        </Link>

        <div className="flex items-center gap-2">
          <Link
            href={`/dashboard/blog/${post.id}/edit`}
            className="inline-flex items-center px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
          >
            <Edit className="w-4 h-4 mr-2" />
            Edit Post
          </Link>

          {post.status === "published" && (
            <Link
              href={`/blog/${post.slug}`}
              target="_blank"
              className="inline-flex items-center px-3 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700"
            >
              <Eye className="w-4 h-4 mr-2" />
              View Live
            </Link>
          )}
        </div>
      </div>

      {/* Preview container */}
      <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-sm border border-gray-200">
        {/* Status banner */}
        <div
          className={`px-6 py-3 text-sm font-medium ${
            post.status === "published"
              ? "bg-green-50 text-green-800 border-b border-green-200"
              : "bg-yellow-50 text-yellow-800 border-b border-yellow-200"
          }`}
        >
          Status: {post.status === "published" ? "Published" : "Draft"}
          {post.status === "published" && (
            <span className="ml-2 text-green-600">• Live on your website</span>
          )}
        </div>

        <article className="p-8">
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
      </div>
    </div>
  );
}
