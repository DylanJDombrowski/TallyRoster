"use client";

import { useState, useEffect, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  createBlogPost,
  updateBlogPost,
  generateSlug,
  type BlogPost,
  type CreateBlogPostData,
} from "@/lib/actions";
import RichTextEditor from "@/app/components/RichTextEditor";
import { Calendar, Save, Eye, ArrowLeft } from "lucide-react";
import Link from "next/link";

interface BlogPostFormProps {
  initialData?: BlogPost;
}

export default function BlogPostForm({ initialData }: BlogPostFormProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    title: initialData?.title || "",
    slug: initialData?.slug || "",
    short_description: initialData?.short_description || "",
    content: initialData?.content || "",
    image_url: initialData?.image_url || "",
    published_date:
      initialData?.published_date || new Date().toISOString().split("T")[0],
    team_name: initialData?.team_name || "",
    season: initialData?.season || "",
    location: initialData?.location || "",
    tournament_name: initialData?.tournament_name || "",
    place: initialData?.place || "",
    status: (initialData?.status as "draft" | "published") || "draft",
  });

  // Auto-generate slug from title
  useEffect(() => {
    if (formData.title && !initialData) {
      generateSlug(formData.title).then((slug) => {
        setFormData((prev) => ({ ...prev, slug }));
      });
    }
  }, [formData.title, initialData]);

  const handleSubmit = async (
    e: React.FormEvent,
    status: "draft" | "published"
  ) => {
    e.preventDefault();
    setError(null);

    const submitData: CreateBlogPostData = {
      ...formData,
      status,
    };

    startTransition(async () => {
      try {
        let result;
        if (initialData) {
          result = await updateBlogPost(initialData.id, submitData);
        } else {
          result = await createBlogPost(submitData);
        }

        if (result.success) {
          router.push("/dashboard/blog");
        } else {
          setError(result.error || "Failed to save blog post");
        }
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "An unexpected error occurred"
        );
      }
    });
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-6">
        <Link
          href="/dashboard/blog"
          className="inline-flex items-center text-sm text-gray-600 hover:text-gray-900"
        >
          <ArrowLeft className="w-4 h-4 mr-1" />
          Back to Blog Posts
        </Link>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-md p-4 mb-6">
          <p className="text-red-800">{error}</p>
        </div>
      )}

      <form
        onSubmit={(e) => handleSubmit(e, formData.status)}
        className="space-y-6"
      >
        {/* Title and Slug */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label
              htmlFor="title"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              Title *
            </label>
            <input
              type="text"
              id="title"
              required
              value={formData.title}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, title: e.target.value }))
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Enter blog post title"
            />
          </div>

          <div>
            <label
              htmlFor="slug"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              URL Slug *
            </label>
            <input
              type="text"
              id="slug"
              required
              value={formData.slug}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, slug: e.target.value }))
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="url-friendly-slug"
            />
          </div>
        </div>

        {/* Short Description */}
        <div>
          <label
            htmlFor="short_description"
            className="block text-sm font-medium text-gray-700 mb-2"
          >
            Short Description
          </label>
          <textarea
            id="short_description"
            rows={3}
            value={formData.short_description}
            onChange={(e) =>
              setFormData((prev) => ({
                ...prev,
                short_description: e.target.value,
              }))
            }
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            placeholder="Brief description for previews and SEO"
          />
        </div>

        {/* Featured Image URL */}
        <div>
          <label
            htmlFor="image_url"
            className="block text-sm font-medium text-gray-700 mb-2"
          >
            Featured Image URL
          </label>
          <input
            type="url"
            id="image_url"
            value={formData.image_url}
            onChange={(e) =>
              setFormData((prev) => ({ ...prev, image_url: e.target.value }))
            }
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            placeholder="https://example.com/image.jpg"
          />
          {formData.image_url && (
            <div className="mt-2">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={formData.image_url}
                alt="Featured image preview"
                className="max-w-xs h-auto rounded-md border border-gray-300"
                onError={(e) => {
                  e.currentTarget.style.display = "none";
                }}
              />
            </div>
          )}
        </div>

        {/* Sports-specific fields */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div>
            <label
              htmlFor="team_name"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              Team Name
            </label>
            <input
              type="text"
              id="team_name"
              value={formData.team_name}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, team_name: e.target.value }))
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="e.g., 16U Premier"
            />
          </div>

          <div>
            <label
              htmlFor="season"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              Season
            </label>
            <input
              type="text"
              id="season"
              value={formData.season}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, season: e.target.value }))
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="e.g., 2025 Spring"
            />
          </div>

          <div>
            <label
              htmlFor="location"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              Location
            </label>
            <input
              type="text"
              id="location"
              value={formData.location}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, location: e.target.value }))
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="e.g., Atlanta, GA"
            />
          </div>

          <div>
            <label
              htmlFor="tournament_name"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              Tournament
            </label>
            <input
              type="text"
              id="tournament_name"
              value={formData.tournament_name}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  tournament_name: e.target.value,
                }))
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="e.g., Perfect Game"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label
              htmlFor="place"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              Placement/Result
            </label>
            <input
              type="text"
              id="place"
              value={formData.place}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, place: e.target.value }))
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="e.g., 1st Place, Champions"
            />
          </div>

          <div>
            <label
              htmlFor="published_date"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              Published Date *
            </label>
            <input
              type="date"
              id="published_date"
              required
              value={formData.published_date}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  published_date: e.target.value,
                }))
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
        </div>

        {/* Content Editor */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Content *
          </label>
          <div className="border border-gray-300 rounded-md">
            <RichTextEditor
              content={formData.content}
              onChange={(content) =>
                setFormData((prev) => ({ ...prev, content }))
              }
              placeholder="Write your blog post content here..."
            />
          </div>
        </div>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-4 pt-6 border-t border-gray-200">
          <div className="flex gap-2">
            <button
              type="button"
              onClick={(e) => handleSubmit(e, "draft")}
              disabled={isPending}
              className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50"
            >
              <Save className="w-4 h-4 mr-2" />
              Save as Draft
            </button>

            <button
              type="button"
              onClick={(e) => handleSubmit(e, "published")}
              disabled={isPending}
              className="inline-flex items-center px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50"
            >
              <Eye className="w-4 h-4 mr-2" />
              Publish
            </button>
          </div>

          <div className="text-sm text-gray-500 flex items-center">
            <Calendar className="w-4 h-4 mr-1" />
            {formData.status === "published"
              ? "Will be published on"
              : "Created on"}{" "}
            {formData.published_date}
          </div>
        </div>
      </form>
    </div>
  );
}
