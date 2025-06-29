// app/(public)/on-the-field/page.tsx
"use client";

import { createClient } from "@/lib/supabase/client"; // <-- 1. CORRECT IMPORT
import Image from "next/image";
import Link from "next/link";
import { useCallback, useEffect, useState } from "react";

// 2. UPDATED INTERFACE to allow for null values from the database
interface BlogPost {
  id: string;
  title: string | null;
  slug: string | null;
  short_description: string | null;
  content: string | null;
  image_url: string | null;
  published_date: string | null;
  team_name: string | null;
  season: string | null;
  location: string | null;
  tournament_name: string | null;
  place: string | null;
  status: string | null;
}

export default function BlogPage() {
  const [allPosts, setAllPosts] = useState<BlogPost[]>([]);
  const [displayedPosts, setDisplayedPosts] = useState<BlogPost[]>([]);
  const [seasons, setSeasons] = useState<string[]>([]);
  const [selectedSeason, setSelectedSeason] = useState<string>("");
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const postsPerPage = 12;
  const supabase = createClient(); // <-- 3. CORRECT CLIENT INITIALIZATION

  const loadBlogPosts = useCallback(async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from("blog_posts")
        .select("*")
        .eq("status", "published")
        .order("published_date", { ascending: false });

      if (error) throw error;

      setAllPosts(data || []);

      // Extract unique seasons, filtering out any nulls
      const uniqueSeasons = [...new Set((data || []).map((post) => post.season).filter(Boolean))] as string[];
      setSeasons(uniqueSeasons);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load blog posts");
    } finally {
      setLoading(false);
    }
  }, [supabase]);

  const filterPosts = useCallback(() => {
    let filteredPosts = allPosts;
    if (selectedSeason) {
      filteredPosts = filteredPosts.filter((post) => post.season === selectedSeason);
    }

    setCurrentPage(1);
    updateDisplayedPosts(filteredPosts, 1);
  }, [allPosts, selectedSeason]);

  useEffect(() => {
    loadBlogPosts();
  }, [loadBlogPosts]);

  useEffect(() => {
    filterPosts();
  }, [selectedSeason, allPosts, filterPosts]);

  const updateDisplayedPosts = (posts: BlogPost[], page: number) => {
    const startIndex = (page - 1) * postsPerPage;
    setDisplayedPosts(posts.slice(startIndex, startIndex + postsPerPage));
  };

  const changePage = (direction: number) => {
    const filteredPosts = selectedSeason ? allPosts.filter((post) => post.season === selectedSeason) : allPosts;

    const totalPages = Math.ceil(filteredPosts.length / postsPerPage);
    const newPage = currentPage + direction;

    if (newPage >= 1 && newPage <= totalPages) {
      setCurrentPage(newPage);
      updateDisplayedPosts(filteredPosts, newPage);
    }
  };

  const getTotalPages = () => {
    const filteredPosts = selectedSeason ? allPosts.filter((post) => post.season === selectedSeason) : allPosts;
    return Math.ceil(filteredPosts.length / postsPerPage);
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return "No Date";
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="sticky top-0 z-40 bg-secondary text-white py-4 shadow-md">
          <div className="container mx-auto px-4">
            <h1 className="text-3xl font-bold">On The Field</h1>
          </div>
        </div>
        <div className="container mx-auto px-4 py-8">
          <div className="flex justify-center items-center h-64">
            <div className="text-lg">Loading blog posts...</div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="sticky top-0 z-40 bg-secondary text-white py-4 shadow-md">
          <div className="container mx-auto px-4">
            <h1 className="text-3xl font-bold">On The Field</h1>
          </div>
        </div>
        <div className="container mx-auto px-4 py-8">
          <div className="flex justify-center items-center h-64">
            <div className="text-red-600">Error: {error}</div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Sticky Header */}
      <div className="sticky top-0 z-40 bg-secondary text-white py-4 shadow-md">
        <div className="container mx-auto px-4">
          <h1 className="text-3xl font-bold">On The Field</h1>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        {/* Filter */}
        <div className="mb-8 flex flex-col sm:flex-row justify-center items-center">
          <label htmlFor="seasonFilter" className="mr-2 text-lg mb-2 sm:mb-0">
            Filter by Season:
          </label>
          <select
            id="seasonFilter"
            value={selectedSeason}
            onChange={(e) => setSelectedSeason(e.target.value)}
            className="border rounded p-2 bg-white shadow-sm w-full sm:w-auto"
          >
            <option value="">All Seasons</option>
            {seasons.map((season) => (
              <option key={season} value={season}>
                {season}
              </option>
            ))}
          </select>
        </div>

        {/* Blog post grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {displayedPosts.map((post) => (
            <Link
              key={post.id}
              href={`/on-the-field/${post.slug}`} // Corrected the link to point to the new route
              className="bg-white shadow-lg rounded-lg overflow-hidden transform transition duration-300 hover:scale-105 cursor-pointer"
            >
              <div className="relative h-48">
                <Image
                  src={`/assets/${post.image_url}`}
                  alt={post.title || "Blog Post Image"}
                  fill
                  className="object-cover"
                  sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                />
              </div>
              <div className="p-6">
                <h2 className="text-xl font-semibold mb-2 text-gray-800">{post.title}</h2>
                <p className="text-gray-600 mb-4 text-sm">{post.short_description}</p>
                <div className="flex justify-between items-center">
                  <span className="text-blue-500 font-medium">Read more</span>
                  <p className="text-sm text-gray-500">{formatDate(post.published_date)}</p>
                </div>
              </div>
            </Link>
          ))}
        </div>

        {/* No posts message */}
        {displayedPosts.length === 0 && !loading && (
          <div className="text-center py-12">
            <p className="text-gray-600 text-lg">{selectedSeason ? `No posts found for ${selectedSeason}` : "No blog posts available"}</p>
          </div>
        )}

        {/* Pagination */}
        {displayedPosts.length > 0 && (
          <div className="mt-12 flex flex-col sm:flex-row justify-center items-center">
            <button
              onClick={() => changePage(-1)}
              disabled={currentPage === 1}
              className="mx-2 px-4 py-2 bg-blue-500 text-white rounded disabled:opacity-50 hover:bg-blue-600 transition duration-300 mb-2 sm:mb-0"
            >
              Previous
            </button>
            <span className="mx-2 py-2 text-lg font-medium">
              Page {currentPage} of {getTotalPages()}
            </span>
            <button
              onClick={() => changePage(1)}
              disabled={currentPage === getTotalPages()}
              className="mx-2 px-4 py-2 bg-blue-500 text-white rounded disabled:opacity-50 hover:bg-blue-600 transition duration-300 mt-2 sm:mt-0"
            >
              Next
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
