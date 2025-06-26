// src/app/xpress-social/page.tsx
"use client";

import { useState } from "react";
import Image from "next/image";

interface SocialPost {
  id: string;
  platform: "twitter" | "facebook" | "instagram";
  content: string;
  image?: string;
  date: string;
  link?: string;
}

// Mock social media data - in a real app, this would come from social media APIs
const socialPosts: SocialPost[] = [
  {
    id: "1",
    platform: "twitter",
    content:
      "What an amazing weekend at the championship! Our girls showed incredible heart and determination. Proud of every single player! 🥎⚾️ #XpressFamily #Champions",
    image: "/assets/blog/fall-championship-champs.jpg",
    date: "2024-10-23",
    link: "https://twitter.com/xpress",
  },
  {
    id: "2",
    platform: "facebook",
    content:
      "Thank you to all the families who came out to support our teams this weekend. The energy in the stands was incredible! Next tournament is coming up fast - let's keep this momentum going!",
    date: "2024-10-20",
  },
  {
    id: "3",
    platform: "instagram",
    content:
      "Behind the scenes at practice - these girls work so hard every day to perfect their craft. The dedication is inspiring! 💪",
    image: "/assets/stock/stock-img-1.jpg",
    date: "2024-10-18",
  },
  {
    id: "4",
    platform: "twitter",
    content:
      "Congratulations to Sarah Johnson for being named Player of the Week! Her leadership on and off the field exemplifies what it means to be Xpress! 🌟",
    date: "2024-10-15",
  },
];

const platforms = [
  { id: "all", name: "All Posts", icon: "📱" },
  { id: "twitter", name: "Twitter", icon: "🐦" },
  { id: "facebook", name: "Facebook", icon: "📘" },
  { id: "instagram", name: "Instagram", icon: "📸" },
];

const SocialCard = ({ post }: { post: SocialPost }) => {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const getPlatformColor = (platform: string) => {
    switch (platform) {
      case "twitter":
        return "bg-blue-400 text-white";
      case "facebook":
        return "bg-blue-600 text-white";
      case "instagram":
        return "bg-gradient-to-br from-purple-500 to-pink-500 text-white";
      default:
        return "bg-gray-500 text-white";
    }
  };

  const getPlatformIcon = (platform: string) => {
    switch (platform) {
      case "twitter":
        return "🐦";
      case "facebook":
        return "📘";
      case "instagram":
        return "📸";
      default:
        return "📱";
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300">
      {post.image && (
        <div className="relative h-48">
          <Image
            src={post.image}
            alt="Social media post"
            fill
            className="object-cover"
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
          />
        </div>
      )}

      <div className="p-4">
        <div className="flex items-center justify-between mb-3">
          <span
            className={`px-3 py-1 rounded-full text-sm font-semibold ${getPlatformColor(
              post.platform
            )}`}
          >
            {getPlatformIcon(post.platform)}{" "}
            {post.platform.charAt(0).toUpperCase() + post.platform.slice(1)}
          </span>
          <span className="text-gray-500 text-sm">{formatDate(post.date)}</span>
        </div>

        <p className="text-gray-700 leading-relaxed mb-4">{post.content}</p>

        {post.link && (
          <a
            href={post.link}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-block text-primary hover:text-primary-dark font-semibold transition-colors"
          >
            View Original Post →
          </a>
        )}
      </div>
    </div>
  );
};

export default function XpressSocialPage() {
  const [selectedPlatform, setSelectedPlatform] = useState("all");

  const filteredPosts =
    selectedPlatform === "all"
      ? socialPosts
      : socialPosts.filter((post) => post.platform === selectedPlatform);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Sticky Header */}
      <div className="sticky top-0 z-40 bg-secondary text-white py-4 shadow-md">
        <div className="container mx-auto px-4">
          <h1 className="text-2xl md:text-3xl font-bold">Xpress Social</h1>
        </div>
      </div>

      <div className="container mx-auto py-8 px-4">
        <div className="max-w-6xl mx-auto">
          {/* Introduction */}
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-gray-800 mb-4">
              Stay Connected with Xpress
            </h2>
            <p className="text-lg text-gray-600 max-w-3xl mx-auto mb-6">
              Follow our teams, celebrate victories, and be part of the Xpress
              family through our social media channels.
            </p>

            {/* Social Media Links */}
            <div className="flex justify-center space-x-4 mb-8">
              <a
                href="https://twitter.com/xpress"
                target="_blank"
                rel="noopener noreferrer"
                className="bg-blue-400 text-white px-4 py-2 rounded-lg hover:bg-blue-500 transition-colors"
              >
                🐦 Follow on Twitter
              </a>
              <a
                href="https://facebook.com/xpress"
                target="_blank"
                rel="noopener noreferrer"
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
              >
                📘 Like on Facebook
              </a>
              <a
                href="https://instagram.com/xpress"
                target="_blank"
                rel="noopener noreferrer"
                className="bg-gradient-to-r from-purple-500 to-pink-500 text-white px-4 py-2 rounded-lg hover:from-purple-600 hover:to-pink-600 transition-colors"
              >
                📸 Follow on Instagram
              </a>
            </div>
          </div>

          {/* Platform Filter */}
          <div className="flex flex-wrap justify-center gap-2 mb-8">
            {platforms.map((platform) => (
              <button
                key={platform.id}
                onClick={() => setSelectedPlatform(platform.id)}
                className={`px-4 py-2 rounded-full font-medium transition-colors ${
                  selectedPlatform === platform.id
                    ? "bg-primary text-white"
                    : "bg-white text-gray-700 hover:bg-gray-100"
                }`}
              >
                {platform.icon} {platform.name}
              </button>
            ))}
          </div>

          {/* Social Posts Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredPosts.map((post) => (
              <SocialCard key={post.id} post={post} />
            ))}
          </div>

          {/* No posts message */}
          {filteredPosts.length === 0 && (
            <div className="text-center py-12">
              <p className="text-gray-600 text-lg">
                No posts found for{" "}
                {selectedPlatform === "all" ? "any platform" : selectedPlatform}
                .
              </p>
            </div>
          )}

          {/* Call to Action */}
          <div className="mt-16 bg-gradient-to-r from-primary to-secondary text-white rounded-lg p-8 text-center">
            <h3 className="text-2xl md:text-3xl font-bold mb-4">
              Share Your Xpress Moments!
            </h3>
            <p className="text-lg mb-6 opacity-90">
              Tag us in your photos and posts to be featured on our social media
              channels.
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <span className="bg-white bg-opacity-20 px-4 py-2 rounded-full">
                #XpressFamily
              </span>
              <span className="bg-white bg-opacity-20 px-4 py-2 rounded-full">
                #MiamiValleyXpress
              </span>
              <span className="bg-white bg-opacity-20 px-4 py-2 rounded-full">
                #XpressSoftball
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
